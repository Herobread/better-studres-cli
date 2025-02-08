#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const homeDir = process.env.HOME || process.env.USERPROFILE;
const desktopDPath = path.join(homeDir, ".desktop.d");
const scriptPath = path.join(desktopDPath, "install-better-studres.sh");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  🚀 Install Better Studres on Boot  ");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log("✅ Firefox: Supported ✅");
console.log("❌ Chrome: Not supported (due to strict policies) ❌");
console.log("");
console.log(
  "🔹 This will add a startup script to automatically install Better Studres for Firefox on every login."
);
console.log("");

if (fs.existsSync(scriptPath)) {
  rl.question(
    "✅ You are already set up! Would you like to remove the startup script? (y/N): ",
    (removeAnswer) => {
      rl.close();
      removeAnswer = removeAnswer.trim().toLowerCase();

      if (removeAnswer === "y") {
        fs.unlinkSync(scriptPath);
        console.log(`❌ Removed startup script: ${scriptPath}`);
        console.log("Better Studres will no longer install on startup.");
      } else {
        console.log("✅ Keeping existing setup. No changes made.");
      }
      process.exit(0);
    }
  );
} else {
  rl.question("👉 Proceed with installation? (Y/n): ", (answer) => {
    rl.close();

    answer = answer.trim().toLowerCase();

    if (answer === "n") {
      console.log("❌ Installation cancelled.");
      process.exit(0);
    }

    if (!fs.existsSync(desktopDPath)) {
      fs.mkdirSync(desktopDPath, { recursive: true });
    }

    const scriptContent = `#!/bin/bash
echo "Installing Better Studres in Firefox..."
firefox --install-extension --headless "https://addons.mozilla.org/firefox/downloads/latest/better-studres/addon-latest.xpi"
`;

    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

    console.log(`✅ Created startup script: ${scriptPath}`);
    console.log(
      "Better Studres will now install automatically on every login."
    );
  });
}
