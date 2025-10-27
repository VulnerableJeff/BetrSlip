const fs = require("fs");
const p = "src/App.tsx";
let s = fs.readFileSync(p, "utf8");

// strip any old/bad global addLeg function definitions
s = s.replace(
  /function\s*\(window\s+as\s+any\)\.addLeg\s*\([^)]*\)\s*\{[\s\S]*?\}\s*/g,
  ""
);

// also strip weird inline patterns if any
s = s.replace(
  /\(window\s+as\s+any\)\.addLeg\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}\s*;?/g,
  ""
);

// fix a stray closing brace before return (common after failed manual edits)
s = s.replace(/\n}\s*\n(\s*return\s*\()/g, "\n\n$1");

// prepare correct helper (no imports needed, safe at top-level)
const helper =
`\n// --- BetrSlip: global test helper to add a leg from console/buttons ---\n`+
`(window as any).addLeg = (s: any) => {\n`+
`  try {\n`+
`    const ev = new CustomEvent("BETRSLIP_ADD_LEG", { detail: s });\n`+
`    window.dispatchEvent(ev);\n`+
`  } catch (err) {\n`+
`    console.error("addLeg failed", err);\n`+
`  }\n`+
`};\n`;

// inject helper right AFTER the last import statement
if (!s.includes("(window as any).addLeg =")) {
  const importRegex = /^(import .+?;\s*)+/ms; // consecutive imports at top
  const m = s.match(importRegex);
  if (m) {
    const lastImportBlock = m[0];
    s = s.replace(importRegex, lastImportBlock + helper);
  } else {
    // if imports are unusual, put it near the top but still safe
    s = helper + "\n" + s;
  }
}

fs.writeFileSync(p, s, "utf8");
console.log("Patched:", p);
