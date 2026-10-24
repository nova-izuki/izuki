# Izuki 1.0.163: clearer project checks and phone controls

- FL project overviews now warn about missing patterns or channels used in the song.
- Incomplete project files and damaged or unsupported WAV files are rejected instead of being treated as usable music.
- Very long note timelines no longer overflow, and returned note lengths respect the clip ending.
- Izuki only says "just saved" when it observed the project file change.
- Project note counting does less work. In a synthetic 128-channel, 512-clip comparison it took 3.285 ms versus 24.760 ms for building every timeline, with identical counts. This measures note counting, not whole-app speed.
- All nine phone toolbar controls stay visible in rows, with full-size icons and separate touch targets in iPhone and Android styles.

Validation: 433 native tests passed on 1.0.163, with 43 existing live/device tests ignored. Production build, conversation, Air, voice, phone, companion, HTML and real-browser checks passed. Phone styles were checked at 320, 390, 768 and 1024 pixels. Live FL Studio interaction and physical phones were not tested for this patch.

Updates use Izuki's signed updater. Automatic checks announce the release; downloading and installing still require your click so work is not interrupted.
