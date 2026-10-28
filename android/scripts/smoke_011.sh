#!/usr/bin/env bash
set -euo pipefail
package="am.shtemarm.app"
apk="android/app/build/outputs/apk/debug/app-debug.apk"

test -s "$apk"
adb install -r "$apk"
adb shell am force-stop "$package" || true
adb logcat -c || true
adb shell am start -W -n "$package/.MainActivity"

# Android launch can take a little longer after a fresh install.
started=0
for attempt in $(seq 1 20); do
  if adb shell pidof "$package" >/dev/null 2>&1; then
    started=1
    break
  fi
  sleep 2
done
if [[ "$started" -ne 1 ]]; then
  adb logcat -d | grep -A 30 -B 4 -E 'FATAL EXCEPTION|AndroidRuntime' | tail -n 100 || true
  echo "Shtemarm process never started" >&2
  exit 1
fi

sleep 5
if ! adb shell pidof "$package" >/dev/null 2>&1; then
  adb logcat -d | grep -A 30 -B 4 -E 'FATAL EXCEPTION|AndroidRuntime' | tail -n 100 || true
  echo "Shtemarm crashed after launch" >&2
  exit 1
fi

adb shell uiautomator dump /sdcard/shtemarm-window.xml >/dev/null
adb shell cat /sdcard/shtemarm-window.xml > android-smoke-window.xml
if ! grep -Fq 'Shtemarm' android-smoke-window.xml; then
  echo "Shtemarm header not visible in accessibility tree" >&2
  exit 1
fi
adb exec-out screencap -p > android-smoke-home.png
test -s android-smoke-home.png

# Exit/relaunch verifies the app can create its Activity again.
adb shell am force-stop "$package"
adb shell am start -W -n "$package/.MainActivity"
sleep 3
adb shell pidof "$package" >/dev/null
echo "Native Android beta 0.1.1 startup smoke test passed."
