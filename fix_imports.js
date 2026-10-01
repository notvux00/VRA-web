const fs = require('fs');
const files = [
  'src/app/dashboard/expert/reports/page.tsx',
  'src/app/dashboard/expert/reports/alerts/page.tsx',
  'src/app/dashboard/expert/reports/behavior/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import \{\s*import \{ useSearchParams \} from "next\/navigation";/g, 'import { useSearchParams } from "next/navigation";\nimport { ');
  fs.writeFileSync(f, content);
});
