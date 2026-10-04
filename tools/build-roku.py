"""Package the Roku channel (tv/roku) as docs/tv/izuki-roku.zip — the file
you upload to a Roku in developer mode. Run: python tools/build-roku.py"""
import os, zipfile

root = os.path.join(os.path.dirname(__file__), "..", "tv", "roku")
out = os.path.join(os.path.dirname(__file__), "..", "docs", "tv", "izuki-roku.zip")
os.makedirs(os.path.dirname(out), exist_ok=True)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for folder, _, files in os.walk(root):
        for f in files:
            full = os.path.join(folder, f)
            z.write(full, os.path.relpath(full, root).replace(os.sep, "/"))
print("built", os.path.normpath(out), os.path.getsize(out) // 1024, "KB")
