#!/bin/sh
# Builds a release APK (JavaScript bundled in, no Metro needed) and copies it
# to ~/Downloads/SmileDoctor-v<version>-<build>.apk. Run with: bun run apk
# Uses the API_URL etc. in .env at build time.
set -e
cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
if [ -z "$JAVA_HOME" ] && [ -d /opt/homebrew/opt/openjdk@17 ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
fi

VERSION=$(node -p "require('./package.json').version")
BUILD=$(node -p "require('./package.json').buildNumber")
API_URL=$(grep -E '^API_URL=' .env | cut -d= -f2-)

echo "Building Smile Doctor v$VERSION ($BUILD) for $API_URL ..."
(cd android && ./gradlew assembleRelease --console=plain -q)

OUT_DIR="$HOME/Downloads"
OUT="$OUT_DIR/SmileDoctor-v$VERSION-$BUILD.apk"
cp android/app/build/outputs/apk/release/app-release.apk "$OUT"
echo ""
echo "Done: $OUT ($(du -h "$OUT" | cut -f1))"
[ -z "$NO_OPEN" ] && open -R "$OUT" 2>/dev/null || true
