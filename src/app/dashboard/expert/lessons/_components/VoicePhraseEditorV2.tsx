"use client";

import { useEffect, useState } from "react";
import { getChildPhraseSetsV2, saveChildGeneralPhraseSetV2, saveChildLessonPhraseSetV2 } from "@/actions/voice-phrases";
import { normalizeAdditions } from "@/lib/voice-phrases";
import type { LessonVoiceQuestV2, QuestPhraseAdditionsV2 } from "@/types/voice-phrases";

export default function VoicePhraseEditorV2({ childId, lessonId, onClose }: { childId: string; lessonId: string; onClose: () => void }) {
  const [quests, setQuests] = useState<LessonVoiceQuestV2[]>([]);
  const [additions, setAdditions] = useState<QuestPhraseAdditionsV2[]>([]);
  const [general, setGeneral] = useState<string[]>([]);
  const [revision, setRevision] = useState<number | null>(null);
  const [generalRevision, setGeneralRevision] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getChildPhraseSetsV2(childId, lessonId).then(result => {
      if (cancelled) return;
      if (!result.success) { setMessage(result.error); return; }
      setQuests(result.quests);
      setAdditions(result.quests.map(quest => ({ binding_id: quest.binding_id, phrases: result.lesson.quest_additions.find(entry => entry.binding_id === quest.binding_id)?.phrases || [] })));
      setGeneral(result.general.phrases);
      setRevision(result.lesson.revision);
      setGeneralRevision(result.general.revision);
      setMessage("");
    }).catch(error => { if (!cancelled) setMessage(String(error)); });
    return () => { cancelled = true; };
  }, [childId, lessonId, reload]);

  async function save() {
    if (revision === null || generalRevision === null) return;
    setBusy(true);
    setMessage("");
    try {
      const normalized = additions.map(entry => ({ ...entry, phrases: normalizeAdditions(entry.phrases) }));
      const normalizedGeneral = normalizeAdditions(general);
      const lessonResult = await saveChildLessonPhraseSetV2({ childId, lessonId, expectedRevision: revision, questAdditions: normalized });
      if (!lessonResult.success) throw new Error(lessonResult.error);
      // Advance each document independently so a partial save can safely be retried.
      setRevision(lessonResult.revision);
      setAdditions(normalized);
      const generalResult = await saveChildGeneralPhraseSetV2({ childId, expectedRevision: generalRevision, phrases: normalizedGeneral });
      if (!generalResult.success) throw new Error(`Mẫu câu bài học đã lưu; mẫu câu chung chưa lưu: ${generalResult.error}`);
      setGeneralRevision(generalResult.revision);
      setGeneral(normalizedGeneral);
      setMessage("Đã lưu. Thay đổi bài học có hiệu lực từ phiên tiếp theo.");
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }

  const ready = revision !== null && generalRevision !== null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <section role="dialog" aria-modal="true" aria-label="Mẫu câu" className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 text-zinc-900 dark:bg-zinc-900 dark:text-white">
      <h2 className="text-xl font-bold">Mẫu câu của bé</h2>
      <p className="my-3 text-sm">Mẫu mặc định thuộc bài học và không thể chỉnh sửa. Các câu bổ sung có hiệu lực từ phiên tiếp theo.</p>
      {message && <p role="status" className="my-3">{message}</p>}
      {!ready && !message && <p>Đang tải mẫu câu…</p>}
      <fieldset disabled={busy || !ready} className="space-y-5">
        {quests.map(quest => <section key={quest.binding_id} className="space-y-2 rounded-xl border p-4">
          <h3 className="font-bold">{quest.title || quest.goal}</h3>
          {quest.default_phrases.map((phrase, index) => <input key={index} aria-label="Mẫu mặc định" readOnly value={phrase} className="block w-full rounded border bg-zinc-100 p-2 text-zinc-600" />)}
          <PhraseRows label="Câu bổ sung" values={additions.find(entry => entry.binding_id === quest.binding_id)?.phrases || []} onChange={values => setAdditions(previous => previous.map(entry => entry.binding_id === quest.binding_id ? { ...entry, phrases: values } : entry))} />
        </section>)}
        <section className="space-y-2 rounded-xl border p-4">
          <h3 className="font-bold">Khích lệ chung</h3>
          <p className="text-sm">Chỉ dùng nút phát lời thoại, không dùng đánh giá nhiệm vụ. Tối đa 50 câu.</p>
          <PhraseRows label="Câu chung" values={general} onChange={setGeneral} />
        </section>
        <button type="button" onClick={() => setAdditions(quests.map(quest => ({ binding_id: quest.binding_id, phrases: [] })))}>Xóa các câu bổ sung bài học</button>
      </fieldset>
      <div className="mt-5 flex gap-4">
        <button type="button" disabled={busy || !ready} onClick={save}>Lưu thay đổi</button>
        <button type="button" disabled={busy} onClick={() => { setRevision(null); setGeneralRevision(null); setReload(value => value + 1); }}>Tải lại dữ liệu đã lưu</button>
        <button type="button" disabled={busy} onClick={onClose}>Đóng</button>
      </div>
    </section>
  </div>;
}

function PhraseRows({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
  return <div className="space-y-2">
    {values.map((value, index) => <div key={index} className="flex gap-2">
      <input aria-label={`${label} ${index + 1}`} maxLength={240} value={value} onChange={event => onChange(values.map((phrase, i) => i === index ? event.target.value : phrase))} className="min-w-0 flex-1 rounded border p-2" />
      <button type="button" disabled={index === 0} aria-label="Lên" onClick={() => { const next = [...values]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>↑</button>
      <button type="button" disabled={index === values.length - 1} aria-label="Xuống" onClick={() => { const next = [...values]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}>↓</button>
      <button type="button" aria-label="Xóa" onClick={() => onChange(values.filter((_, i) => i !== index))}>Xóa</button>
    </div>)}
    <button type="button" disabled={values.length >= 50} onClick={() => onChange([...values, ""])}>Thêm câu</button>
  </div>;
}
