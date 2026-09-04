/*
 * Migrate legacy child_profiles.quick_phrases into the additive Voice Phrase V2
 * shape. Legacy fields are intentionally preserved for rollback/fallback.
 *
 * Dry run: node scripts/migrate_voice_phrase_v2.js
 * Apply:   node scripts/migrate_voice_phrase_v2.js --apply
 */
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const apply = process.argv.includes('--apply');
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env.local');
}

admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
const db = admin.firestore();
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

const WASHING_HAND_BINDINGS = [
  'washing-hand.turn-on-water',
  'washing-hand.wet-hands',
  'washing-hand.dispense-soap',
  'washing-hand.rub-hands',
  'washing-hand.turn-off-water',
  'washing-hand.dry-hands',
];

function text(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  return String(value.phrase ?? value.text ?? value.value ?? '').trim();
}

function phrases(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value).flatMap(phrases);
  return text(value) ? [text(value)] : [];
}

function key(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function same(a, b) { return key(a) === key(b); }

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const k = key(item);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function questAliases(quest) {
  return [quest.binding_id, quest.id, quest.key, quest.quest_id, quest.quest_name, quest.title]
    .filter(Boolean).map(key);
}

function makeQuest(lessonId, raw, index, used) {
  const quest = { ...(raw || {}) };
  let binding = quest.binding_id;
  if (!binding && /^washinghand_[12]$/i.test(lessonId) && index < WASHING_HAND_BINDINGS.length) {
    binding = WASHING_HAND_BINDINGS[index];
  }
  if (!binding) binding = `${key(lessonId)}.${key(quest.id || quest.key || quest.title || `quest-${index + 1}`)}`;
  if (used.has(binding)) binding = `${binding}-${index + 1}`;
  used.add(binding);
  quest.binding_id = binding;
  quest.goal = quest.goal || quest.description || quest.title || quest.id || `Quest ${index + 1}`;
  quest.default_phrases = unique(phrases(quest.default_phrases || quest.defaultPhrases));
  return quest;
}

function legacyEntries(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === 'string') return [{ name: '', phrases: [item] }];
      if (!item || typeof item !== 'object') return [];
      return [{
        name: item.binding_id || item.bindingId || item.quest_id || item.questId || item.quest_name || item.questName || item.id || item.title || '',
        phrases: phrases(item.phrases || item.quick_phrases || item.default_phrases || item),
      }];
    });
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([name, valueForName]) => [{ name, phrases: phrases(valueForName) }]);
  }
  return [];
}

function additionsForQuest(legacy, quest) {
  const defaults = new Set(quest.default_phrases.map(key));
  return unique(legacy).filter((phrase) => !defaults.has(key(phrase)));
}

async function main() {
  const [lessonsSnap, childrenSnap, setsSnap] = await Promise.all([
    db.collection('lessons').get(),
    db.collection('child_profiles').get(),
    db.collection('child_phrase_sets').get(),
  ]);
  const existingSets = new Set(setsSnap.docs.map((doc) => doc.id));
  const lessonPlans = [];
  const lessonById = new Map();

  for (const doc of lessonsSnap.docs) {
    const data = doc.data();
    const rawQuests = Array.isArray(data.quests) ? data.quests : [];
    const used = new Set();
    const nextQuests = rawQuests.map((quest, index) => makeQuest(doc.id, quest, index, used));
    const changed = JSON.stringify(nextQuests) !== JSON.stringify(rawQuests);
    const v2Capable = /^washinghand_[12]$/i.test(doc.id);
    lessonById.set(doc.id, { id: doc.id, data, quests: nextQuests, v2Capable });
    lessonPlans.push({ doc, nextQuests, changed, v2Capable });
  }

  const writes = [];
  for (const plan of lessonPlans) {
    if (!plan.changed && (!plan.v2Capable || plan.doc.data().voice_schema_version === 2)) continue;
    const patch = { quests: plan.nextQuests, updatedAt: serverTimestamp };
    if (plan.v2Capable) {
      patch.voice_schema_version = 2;
      patch.voice_revision = Number(plan.doc.data().voice_revision || 0) + 1;
    }
    writes.push({ ref: plan.doc.ref, patch, label: `lesson/${plan.doc.id}` });
  }

  for (const childDoc of childrenSnap.docs) {
    const child = childDoc.data();
    const legacy = child.quick_phrases || {};
    const generalId = `${childDoc.id}__general`;
    if (!existingSets.has(generalId)) {
      writes.push({
        ref: db.collection('child_phrase_sets').doc(generalId),
        patch: {
          schema_version: 2, scope: 'general', child_id: childDoc.id, revision: 1,
          phrases: unique(phrases(legacy.general)), updated_at: serverTimestamp,
          updated_by: 'migration:voice-phrase-v2',
        }, label: `child_phrase_sets/${generalId}`,
      });
    }

    for (const lesson of lessonById.values()) {
      const setId = `${childDoc.id}__${lesson.id}`;
      if (existingSets.has(setId)) continue;
      const entries = legacyEntries(legacy[lesson.id]);
      const additions = [];
      for (const quest of lesson.quests) {
        const aliases = new Set(questAliases(quest));
        const matched = entries.filter((entry) => !entry.name || aliases.has(key(entry.name)));
        const merged = matched.flatMap((entry) => entry.phrases);
        const extra = additionsForQuest(merged, quest);
        if (extra.length) additions.push({ binding_id: quest.binding_id, phrases: extra });
      }
      writes.push({
        ref: db.collection('child_phrase_sets').doc(setId),
        patch: {
          schema_version: 2, scope: 'lesson', child_id: childDoc.id, lesson_id: lesson.id,
          revision: 1, quest_additions: additions, updated_at: serverTimestamp,
          updated_by: 'migration:voice-phrase-v2',
        }, label: `child_phrase_sets/${setId}`,
      });
    }
  }

  console.log(`${apply ? 'APPLY' : 'DRY-RUN'}: ${lessonsSnap.size} lessons, ${childrenSnap.size} children, ${writes.length} writes`);
  console.log(`  V2-enabled lessons: ${lessonPlans.filter((p) => p.v2Capable).map((p) => p.doc.id).join(', ') || '(none)'}`);
  console.log(`  Existing child_phrase_sets preserved: ${setsSnap.size}`);
  if (!apply) {
    for (const write of writes) console.log(`  would write ${write.label}`);
    return;
  }
  for (let offset = 0; offset < writes.length; offset += 400) {
    const batch = db.batch();
    writes.slice(offset, offset + 400).forEach((write) => batch.set(write.ref, write.patch, { merge: true }));
    await batch.commit();
  }
  console.log(`Committed ${writes.length} writes. Legacy quick_phrases were not modified.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => admin.app().delete());
