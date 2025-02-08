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
sleep 2

# Detect the active Firefox profile dynamically
FIREFOX_PROFILE=$(grep "Path=" ~/.mozilla/firefox/profiles.ini | cut -d '=' -f2 | tail -n1)
FIREFOX_PROFILE_PATH="$HOME/.mozilla/firefox/$FIREFOX_PROFILE"

if [[ -z "$FIREFOX_PROFILE" ]]; then
    echo "❌ No Firefox profile found. Try opening Firefox first."
    exit 1
fi

EXTENSIONS_DIR="$FIREFOX_PROFILE_PATH/extensions"
EXTENSION_XPI="$EXTENSIONS_DIR/better-studres.xpi"
EXTENSIONS_FILE="$FIREFOX_PROFILE_PATH/extensions.json"

# Ensure the extensions directory exists
mkdir -p "$EXTENSIONS_DIR"

# Ensure Firefox has been launched at least once
if [[ ! -f "$EXTENSIONS_FILE" ]]; then
    echo "⚠️ No extensions.json found. Launching Firefox to create it..."
    firefox --headless & sleep 5
    pkill firefox  # Close Firefox after creating profile
fi

# Download the Better Studres extension
echo "📥 Downloading Better Studres extension..."
wget -O "$EXTENSION_XPI" "https://addons.mozilla.org/firefox/downloads/latest/better-studres/addon-latest.xpi"

if [[ ! -f "$EXTENSION_XPI" ]]; then
    echo "❌ Failed to download Better Studres extension. Check internet connection or URL."
    exit 1
fi

# Ensure Firefox allows auto-installed extensions
echo "⚙️ Configuring Firefox to auto-install extensions..."
echo 'user_pref("xpinstall.signatures.required", false);' >> "$FIREFOX_PROFILE_PATH/user.js"
echo 'user_pref("extensions.autoDisableScopes", 0);' >> "$FIREFOX_PROFILE_PATH/user.js"
echo 'user_pref("extensions.startupScanScopes", 0);' >> "$FIREFOX_PROFILE_PATH/user.js"

# Restart Firefox to apply the extension
echo "🔄 Restarting Firefox to apply changes..."
firefox --headless --profile "$FIREFOX_PROFILE_PATH" &>/dev/null &
sleep 5
pkill firefox  # Close after applying the extension
`;

    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

    console.log(`✅ Created startup script: ${scriptPath}`);
    console.log(
      "Better Studres will now install automatically on every login."
    );
  });
}
