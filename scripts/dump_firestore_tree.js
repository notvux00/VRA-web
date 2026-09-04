const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
    }),
  });
}

const db = admin.firestore();

function getDetailedTypeAndSample(val, maxDepth = 4, currentDepth = 0) {
  if (val === null) return { type: 'null', sample: null };
  if (val === undefined) return { type: 'undefined', sample: undefined };
  if (val instanceof admin.firestore.Timestamp) return { type: 'Timestamp', sample: val.toDate().toISOString() };
  if (val instanceof admin.firestore.GeoPoint) return { type: 'GeoPoint', sample: { lat: val.latitude, lng: val.longitude } };
  if (val instanceof admin.firestore.DocumentReference) return { type: `DocumentReference`, sample: val.path };
  
  if (Array.isArray(val)) {
    if (val.length === 0) return { type: 'Array (empty)', sample: [] };
    const firstElem = val[0];
    if (typeof firstElem === 'object' && firstElem !== null && currentDepth < maxDepth) {
      const elemStructure = getDetailedTypeAndSample(firstElem, maxDepth, currentDepth + 1);
      return {
        type: `Array<Object> (${val.length} items)`,
        sample: [elemStructure.sample]
      };
    } else {
      const elemTypes = [...new Set(val.map(v => typeof v))];
      return {
        type: `Array<${elemTypes.join('|')}> (${val.length} items)`,
        sample: val.slice(0, 3)
      };
    }
  }

  if (typeof val === 'object') {
    if (currentDepth >= maxDepth) return { type: 'Map/Object', sample: '{...}' };
    const sub = {};
    for (const [k, v] of Object.entries(val)) {
      sub[k] = getDetailedTypeAndSample(v, maxDepth, currentDepth + 1).sample;
    }
    return { type: 'Map/Object', sample: sub };
  }

  return { type: typeof val, sample: val };
}

let mdOutput = `# 🌲 Cấu trúc Chi Tiết Cây Dữ Liệu Cloud Firestore (Deep Schema Snapshot)\n\n`;
mdOutput += `> Quét tự động từ Project: \`${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}\` vào lúc: ${new Date().toLocaleString('vi-VN')}\n\n`;
mdOutput += `## 📌 Kiến trúc Tổng Quan\n\n`;
mdOutput += `- **Mô hình**: Flat Top-Level Collections (Tất cả 12 collections nằm ở cấp gốc để tối ưu truy vấn chéo).\n`;
mdOutput += `- **Tầng lồng dữ liệu (Nesting Layer)**: Nằm ở các **Embedded Maps & Arrays** bên trong Document (như \`quick_phrases\`, \`default_lesson_params\`, \`quests\`, \`quest_logs\`, \`auto_alerts\`).\n\n---\n\n`;

async function scanDeep() {
  console.log("=================================================");
  console.log("🔍 BẮT ĐẦU QUÉT CHI TIẾT ĐỘ SÂU (DEEP SCAN) CÂY FIRESTORE");
  console.log("=================================================");

  const collections = await db.listCollections();
  
  for (const col of collections) {
    const colName = col.id;
    console.log(`\n📂 Đang quét Collection: [${colName}]`);

    let docCount = 0;
    try {
      const countSnap = await col.count().get();
      docCount = countSnap.data().count;
    } catch (e) {
      const snap = await col.select().get();
      docCount = snap.size;
    }

    mdOutput += `## 📁 Collection: \`${colName}\` (${docCount} documents)\n\n`;

    if (docCount === 0) {
      mdOutput += `_Collection này hiện đang trống._\n\n---\n\n`;
      continue;
    }

    const snap = await col.limit(3).get();
    const docMetaMap = {};
    let representativeDoc = null;

    for (const doc of snap.docs) {
      const data = doc.data();
      if (!representativeDoc) representativeDoc = data;
      for (const [key, val] of Object.entries(data)) {
        if (!docMetaMap[key]) {
          docMetaMap[key] = getDetailedTypeAndSample(val);
        }
      }
    }

    mdOutput += `### 1. Bảng kiểu dữ liệu các trường (Field Types)\n\n`;
    mdOutput += `| Trường (Field) | Kiểu (Type) | Mô tả cấu trúc con |\n| :--- | :--- | :--- |\n`;

    for (const [key, meta] of Object.entries(docMetaMap)) {
      let desc = "";
      if (meta.type.startsWith('Array<Object>')) {
        desc = `Danh sách Object con (gồm các key: \`${Object.keys(meta.sample[0] || {}).join('`, `')}\`)`;
      } else if (meta.type === 'Map/Object') {
        desc = `Map lồng nhau (gồm các key: \`${Object.keys(meta.sample || {}).slice(0, 5).join('`, `')}${Object.keys(meta.sample || {}).length > 5 ? '...' : ''}\`)`;
      } else {
        desc = `Giá trị đơn (\`${typeof meta.sample === 'string' && meta.sample.length > 30 ? meta.sample.substring(0, 30) + '...' : meta.sample}\`)`;
      }
      mdOutput += `| \`${key}\` | \`${meta.type}\` | ${desc} |\n`;
    }

    mdOutput += `\n### 2. Cấu trúc JSON mẫu thực tế (Sample Document)\n\n`;
    mdOutput += "```json\n" + JSON.stringify(representativeDoc, null, 2) + "\n```\n\n";
    mdOutput += `---\n\n`;
  }

  const outputPaths = [
    path.join(__dirname, '..', 'docs', 'FIRESTORE_LIVE_SCHEMA.md'),
    path.resolve(__dirname, '..', '..', 'VR-Autism', 'docs', 'design', 'FIRESTORE_LIVE_SCHEMA.md')
  ];

  for (const outPath of outputPaths) {
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, mdOutput, 'utf8');
      console.log(`📄 Đã lưu file: ${outPath}`);
    } catch (err) {
      console.warn(`Không thể ghi vào đường dẫn: ${outPath}`, err.message);
    }
  }

  console.log("\n=================================================");
  console.log(`✅ ĐÃ QUÉT XONG TOÀN BỘ CẤU TRÚC LỒNG SÂU!`);
  console.log("=================================================");
}

scanDeep().catch(console.error);
