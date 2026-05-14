import { copyFileSync, mkdirSync } from "node:fs";

const files = [
  "index.html",
  "style.css",
  "app.js",
  "config.js",
  "favicon.png",
  "legacylogo.webp",
];

mkdirSync("public", { recursive: true });
files.forEach((f) => {
  copyFileSync(f, `public/${f}`);
  console.log(`Copied ${f} → public/${f}`);
});

console.log("Build complete.");
