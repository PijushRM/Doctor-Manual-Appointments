#!/bin/sh
# Builds an APK with the JavaScript bundled in (no Metro needed) and copies it
# to ~/Downloads. Uses API_URL etc. from .env at build time.
#   bun run apk        release  -> SmileDoctor-v<version>-<build>.apk
#   bun run apk:debug  debug    -> SmileDoctor-v<version>-<build>-debug.apk
#                      (debuggable, full [App] logging incl. every server call)
set -e
cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
if [ -z "$JAVA_HOME" ] && [ -d /opt/homebrew/opt/openjdk@17 ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
fi

VERSION=$(node -p "require('./package.json').version")
BUILD=$(node -p "require('./package.json').buildNumber")
API_URL=$(grep -E '^API_URL=' .env | cut -d= -f2-)

# Real phones are ARM; the x86 builds only serve emulators on Intel Macs and
# would double the APK size. (bun run android still builds for any device.)
PHONES="-PreactNativeArchitectures=armeabi-v7a,arm64-v8a"

MODE="${1:-release}"
if [ "$MODE" = "debug" ]; then
  echo "Building Smile Doctor v$VERSION ($BUILD) DEBUG for $API_URL ..."
  (cd android && LOG_LEVEL=debug ./gradlew assembleDebug -PstandaloneDebug $PHONES --console=plain -q)
  BUILT=android/app/build/outputs/apk/debug/app-debug.apk
  SUFFIX="-debug"
else
  echo "Building Smile Doctor v$VERSION ($BUILD) for $API_URL ..."
  (cd android && ./gradlew assembleRelease $PHONES --console=plain -q)
  BUILT=android/app/build/outputs/apk/release/app-release.apk
  SUFFIX=""
fi

OUT="$HOME/Downloads/SmileDoctor-v$VERSION-$BUILD$SUFFIX.apk"
cp "$BUILT" "$OUT"
echo ""
echo "Done: $OUT ($(du -h "$OUT" | cut -f1))"
[ -z "$NO_OPEN" ] && open -R "$OUT" 2>/dev/null || true
