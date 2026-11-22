#!/usr/bin/env python3
"""Re-voice the website's ad film so the narration lands on its cuts.

Why this exists: `docs/media/izuki-ad.mp4` (56.5 s, 9:16) has nine visual
beats, but its narration is four long blocks of speech (0.7-7.4, 8.3-23.6,
24.2-32.3, 32.7-55.4). Two of those blocks run straight across three or four
picture changes, which is why it feels out of step: the voice keeps talking
through the cut instead of landing on it.

This writes a new voice track instead — one short line per beat, each starting
just after its cut, with real pauses between them — and muxes it onto the
existing picture (the video stream is copied, never re-encoded).

    export OPENAI_API_KEY=...            # a real key; gpt-4o-mini-tts
    python tools/make-ad-voiceover.py --dry-run     # the plan, no key needed
    python tools/make-ad-voiceover.py               # write the new mp4

Needs `ffmpeg`/`ffprobe` on PATH and the `openai` Python package. The voice and
the direction are flags (`--voice`, `--notes`), so the read can be re-rolled
without touching this file.
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILM = ROOT / "docs" / "media" / "izuki-ad.mp4"

# The film's cuts, read off the picture (scene frames every 3 s) and the
# narration's own gaps. A line starts just after its beat and must finish well
# before the next one.
BEATS = [
    (0.9, "What if your computer just did what you said?"),
    (7.0, "Say it once. That's the entire trick."),
    (12.8, "It picks the music, skips the ad, then checks its own work."),
    (19.8, "Thirty plus voices. A British butler, or a friend who roasts you."),
    (26.2, "Pick the one that sounds like you."),
    (31.8, "Change your mind any time."),
    (37.8, "Walk out the door. Call it from your phone, and your PC does it too."),
    (43.8, "Reminders. Email. Your files. The web. All in one sentence."),
    (49.4, "It's free. Not a trial. Free forever."),
    (53.0, "Izuki. Just say, hey Nova."),
]
GAP = 0.25  # silence kept before the next beat

DEFAULT_VOICE = "onyx"
DEFAULT_NOTES = (
    "Warm, confident, conversational read for a consumer tech ad. Natural pacing, "
    "a slight smile in the voice, clean short pauses at commas and full stops. "
    "Never an announcer; no shouting, no rising game-show intonation."
)


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def duration(path):
    out = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path),
    ]).stdout.strip()
    return float(out)


def plan():
    """Where each line goes, and how long it is allowed to be."""
    out = []
    for i, (start, text) in enumerate(BEATS):
        limit = BEATS[i + 1][0] - GAP - start if i + 1 < len(BEATS) else None
        out.append({"start": start, "text": text, "limit": limit})
    return out


def dry_run(film_len):
    print(f"film: {FILM.name}, {film_len:.1f}s, {len(BEATS)} beats")
    print(f"{'start':>6}  {'must end by':>11}  line")
    for line in plan():
        end = f"{line['start'] + line['limit']:.2f}s" if line["limit"] else "end of film"
        print(f"{line['start']:>6.2f}  {end:>11}  {line['text']}")
    print("\nno key needed for this plan; run without --dry-run to record it")


def speak(client, voice, notes, text, out):
    audio = client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice=voice,
        input=text,
        instructions=notes,
        response_format="mp3",
    )
    Path(out).write_bytes(audio.content)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--film", default=str(FILM), help="the film to re-voice (default: the website's)")
    ap.add_argument("--out", default=None, help="where to write it (default: the film, in place)")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--notes", default=DEFAULT_NOTES, help="how the read should sound")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--keep", action="store_true", help="keep the temporary voice clips")
    args = ap.parse_args()

    film = Path(args.film)
    if not film.exists():
        sys.exit(f"no film at {film}")
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("ffmpeg and ffprobe must be on PATH")
    film_len = duration(film)

    if args.dry_run:
        dry_run(film_len)
        return

    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        sys.exit("OPENAI_API_KEY is not set — that is the only thing this needs")
    from openai import OpenAI  # imported late so --dry-run works without it
    client = OpenAI(api_key=key)

    work = Path(tempfile.mkdtemp(prefix="izuki-ad-voice-"))
    clips = []
    for i, line in enumerate(plan(), start=1):
        clip = work / f"line-{i:02d}.mp3"
        speak(client, args.voice, args.notes, line["text"], clip)
        got = duration(clip)
        clips.append((clip, got))
        fits = line["limit"] is None or got <= line["limit"]
        mark = "ok " if fits else "LONG"
        print(f"{mark} {line['start']:>5.1f}s  {got:>4.1f}s  {line['text']}")
        if not fits:
            print(f"     that line is {got - line['limit']:.1f}s too long for its slot — shorten it")
    if any(line["limit"] is not None and got > line["limit"] for (_, got), line in zip(clips, plan())):
        sys.exit(f"\nnothing written. voice clips kept in {work}")

    # Place every clip at its beat, mix them, level the result, pad it out to
    # the film's length, then put it under the untouched picture.
    inputs, filters, labels = ["-i", str(film)], [], []
    for i, ((clip, _), line) in enumerate(zip(clips, plan()), start=1):
        inputs += ["-i", str(clip)]
        delay = round(line["start"] * 1000)
        filters.append(f"[{i}:a]adelay={delay}|{delay},aresample=48000[vc{i}]")
        labels.append(f"[vc{i}]")
    mix = (
        "".join(labels)
        + f"amix=inputs={len(labels)}:normalize=0:duration=longest,"
        + "loudnorm=I=-16:TP=-1.5:LRA=11,"
        + f"apad=whole_dur={film_len},atrim=0:{film_len}[aout]"
    )
    target = Path(args.out) if args.out else work / "izuki-ad.mp4"
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
        "-filter_complex", ";".join(filters + [mix]),
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart", "-t", str(film_len),
        str(target),
    ])
    if not args.out:
        shutil.copyfile(target, film)
        print(f"\nwrote {film}")
    else:
        print(f"\nwrote {target}")
    print(f"new track: {duration(target):.1f}s, voice {args.voice}")
    if not args.keep:
        shutil.rmtree(work, ignore_errors=True)
    else:
        print(f"clips kept in {work}")


if __name__ == "__main__":
    main()
