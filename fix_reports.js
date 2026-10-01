const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/expert/reports/page.tsx',
  'src/app/dashboard/expert/reports/alerts/page.tsx',
  'src/app/dashboard/expert/reports/behavior/page.tsx'
];

files.forEach(file => {
  const absolutePath = path.join(__dirname, file);
  if (!fs.existsSync(absolutePath)) return;
  
  let content = fs.readFileSync(absolutePath, 'utf8');
  
  // Skip if already has useSearchParams
  if (content.includes('useSearchParams()')) return;

  // Add Suspense and useSearchParams imports
  if (!content.includes('Suspense')) {
    content = content.replace('import React,', 'import React, { Suspense } from "react";\nimport React2,');
  }
  if (!content.includes('next/navigation')) {
    const lastImport = content.lastIndexOf('import ');
    const endOfImport = content.indexOf('\n', lastImport);
    content = content.slice(0, endOfImport + 1) + 'import { useSearchParams } from "next/navigation";\n' + content.slice(endOfImport + 1);
  }

  // Find the component name
  const match = content.match(/export default function ([A-Za-z0-9_]+)\(\s*\{\s*searchParams\s*\}\s*:\s*PageProps\s*\)\s*\{/);
  if (match) {
    const compName = match[1];
    const newCompName = compName + 'Content';
    
    // Replace the function signature
    content = content.replace(match[0], `function ${newCompName}() {`);
    
    // Replace searchParams use
    content = content.replace(
      /const\s*\{\s*sessionId\s*,\s*childId\s*\}\s*=\s*use\(searchParams\)\s*;/g,
      `const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const childId = searchParams.get("childId");`
    );

    // Append the default export wrapper at the end of the file
    content += `\n\nexport default function ${compName}() {\n  return (\n    <Suspense fallback={<div className="p-8 text-center animate-pulse">Đang tải báo cáo...</div>}>\n      <${newCompName} />\n    </Suspense>\n  );\n}\n`;
  }

  fs.writeFileSync(absolutePath, content);
});

console.log("Done");
