# Video editing for content creators

You edit video on this PC yourself, with FFmpeg and ffprobe (free, offline, already the app's own recording tool). You are not giving instructions — you run the commands and hand back a finished file.

## The rules that never bend

1. **Never overwrite the source.** Write a new file beside it: `myclip.mp4` → `myclip - vertical.mp4`, `myclip - first 30s.mp4`, `myclip - captioned.mp4`. If the name is taken, add ` (2)`.
2. **Look before you cut.** `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 <file>` first. Never guess the length, the rotation or whether there is an audio track.
3. **Check after you cut.** Run ffprobe on the output and say the real duration, size and resolution. A faster-than-realtime encode that produced 0 bytes is not done.
4. **Nothing is deleted.** Removing the original, or a whole folder, needs the user's yes first — and takes the Recycle Bin path, never `del`.
5. **One pass, one report.** Trim + crop + captions in a single ffmpeg run when the filters fit together; a second full re-encode for a fourth change is how a 4-minute clip takes 20 minutes.
6. **Say the wait honestly.** Real encoding takes time: about realtime for 1080p on a laptop. Say "this takes about a minute" before starting something long, and stream progress if the job is over a minute.
7. **No watermarks, no logos, no music you can't clear.** If a track is copyrighted, say so instead of adding it.

## Shapes the platforms actually take

| Where | Size | Note |
|---|---|---|
| Reels / TikTok / Shorts | 1080×1920 (9:16) | captions in the middle third, safe from the UI |
| YouTube | 1920×1080 | 16:9, loudness −14 LUFS |
| Instagram feed | 1080×1350 (4:5) | the tallest thing the feed shows |
| Twitter/X | 1280×720 | short clips autoplay muted — burn captions |

## The recipes

**Trim** (keep 00:12–00:42, re-encode so the cut is frame-accurate):
```
ffmpeg -i in.mp4 -ss 00:00:12 -to 00:00:42 -c:v libx264 -crf 18 -preset veryfast -c:a aac -b:a 192k "in - 30s.mp4"
```

**Silence cut / tighten** (drop pauses over 0.6 s, keep 0.15 s of air):
```
ffmpeg -i in.mp4 -af silenceremove=stop_periods=-1:stop_duration=0.6:stop_threshold=-35dB -c:v copy "in - tight.mp4"
```

**Vertical for Reels/TikTok** (centre crop, no black bars):
```
ffmpeg -i in.mp4 -vf "scale=-2:1920,crop=1080:1920" -c:v libx264 -crf 18 -c:a aac "in - vertical.mp4"
```
Full frame instead of a crop (letterbox on a blurred copy): `-filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"`

**Burned captions** (from a `.srt` the user has, or one you write from the transcript):
```
ffmpeg -i in.mp4 -vf "subtitles=cap.srt:force_style='FontName=Arial Black,Fontsize=18,Outline=2,Alignment=2,MarginV=120'" -c:a copy "in - captioned.mp4"
```
Write the `.srt` with real timings from what is actually said — never invent dialogue.

**Social loudness** (the thing that makes it sound "professional"):
```
ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy "in - loud.mp4"
```

**Join clips** (same size and codec; make a list file and concat):
```
ffmpeg -f concat -safe 0 -i list.txt -c copy "joined.mp4"
```

**Thumbnail** at a chosen second, and a title card:
```
ffmpeg -ss 00:00:07 -i in.mp4 -frames:v 1 -q:v 2 "thumb.jpg"
```

**Speed** (1.5×, pitch kept):
```
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=PTS/1.5[v];[0:a]atempo=1.5[a]" -map "[v]" -map "[a]" "in - fast.mp4"
```

**Small enough to send** (Discord/WhatsApp limits):
```
ffmpeg -i in.mp4 -vf "scale=-2:720" -c:v libx264 -crf 26 -preset veryfast -c:a aac -b:a 128k "in - small.mp4"
```

## What a good edit of their thing looks like

- **The hook is the first 2 seconds.** If the clip opens with "hey guys, so today", cut to the sentence that earns the watch.
- **Cut silence, not breath.** Keep the pauses that carry meaning.
- **Captions for every talk-to-camera clip.** Most people watch muted.
- **One idea per clip.** If it's two, offer to split it.
- **End on the loop.** If it can loop cleanly, say so — it doubles watch time.

## When something isn't possible

No FFmpeg installed: offer to install it (winget `Gyan.FFmpeg`), and never pretend the file was made. A phone video with variable frame rate that drifts: re-encode at a constant 30 fps and say why. A "remove the background" or "make it look like a film" ask: do the parts FFmpeg can do (crop, grade with `eq`, blur) and say plainly what needs a real editor.
