const fs = require('fs');
const files = [
  'src/app/dashboard/expert/reports/page.tsx',
  'src/app/dashboard/expert/reports/alerts/page.tsx',
  'src/app/dashboard/expert/reports/behavior/page.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(
    'import React, { Suspense } from "react";\nimport React2, { useEffect, useState, use } from "react";', 
    'import React, { Suspense, useEffect, useState } from "react";'
  );
  content = content.replace(
    'import { \nimport { useSearchParams } from "next/navigation";', 
    'import { useSearchParams } from "next/navigation";\nimport { '
  );
  fs.writeFileSync(f, content);
});
