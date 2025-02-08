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
        console.log(`🗑️ Removed startup script: ${scriptPath}`);
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
# Wait for Firefox to initialize the profile
sleep 2

# Detect the active Firefox profile dynamically
FIREFOX_PROFILE=$(grep "Path=" ~/.mozilla/firefox/profiles.ini | cut -d '=' -f2 | tail -n1)

if [[ -z "$FIREFOX_PROFILE" ]]; then
    echo "❌ No Firefox profile found. Try opening Firefox first."
    exit 1
fi

EXTENSIONS_FILE="$HOME/.mozilla/firefox/$FIREFOX_PROFILE/extensions.json"

# Install an extension if \`extensions.json\` does not exist
if [[ ! -f "$EXTENSIONS_FILE" ]]; then
    echo "⚠️ No extensions.json found. Installing Better Studres extension..."
    wget -O "$HOME/.mozilla/firefox/$FIREFOX_PROFILE/extensions/better-studres.xpi" "https://addons.mozilla.org/firefox/downloads/latest/better-studres/addon-latest.xpi"

    echo "🔄 Restarting Firefox to apply changes..."
    firefox --headless --profile "$HOME/.mozilla/firefox/$FIREFOX_PROFILE" &>/dev/null &
    
    sleep 3  # Give Firefox time to apply the extension
fi

# Now, list installed extensions
if [[ -f "$EXTENSIONS_FILE" ]]; then
    echo "🔍 Listing installed Firefox extensions:"
    cat "$EXTENSIONS_FILE" | jq '.addons[] | {id, name, version}'
else
    echo "⚠️ Still no extensions.json found after installation. Try restarting Firefox manually."
fi

`;

    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

    console.log(`✅ Created startup script: ${scriptPath}`);
    console.log(
      "Better Studres will now install automatically on every login."
    );
  });
}
