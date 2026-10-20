//! Hearing what the PC plays: a few seconds of the speakers' own sound
//! (Windows' loopback capture — never the microphone), and where the low
//! hits land in it (a kick drum's thump). Used to line notes up with the
//! beat as it really sounds (flstudio.rs). Kept in memory only, never saved.

use anyhow::{anyhow, Result};

/// Record `seconds` of what the default speakers play. `start` runs once
/// recording has begun (press Play there), so the beat's start is in it.
/// Returns mono samples and the sample rate. Gaps where nothing played are
/// filled with silence, so times stay true.
#[cfg(windows)]
pub fn record(seconds: f32, start: impl FnOnce()) -> Result<(Vec<f32>, u32)> {
    use std::time::{Duration, Instant};
    use windows::Win32::Media::Audio::{
        eConsole, eRender, IAudioCaptureClient, IAudioClient, IMMDeviceEnumerator, MMDeviceEnumerator, AUDCLNT_BUFFERFLAGS_SILENT,
        AUDCLNT_SHAREMODE_SHARED, AUDCLNT_STREAMFLAGS_LOOPBACK,
    };
    use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CoTaskMemFree, CoUninitialize, CLSCTX_ALL, COINIT_MULTITHREADED};
    /// COM is let go on this (pooled) thread once everything below is released.
    struct Com(bool);
    impl Drop for Com {
        fn drop(&mut self) {
            if self.0 {
                unsafe { CoUninitialize() };
            }
        }
    }
    unsafe {
        let _com = Com(CoInitializeEx(None, COINIT_MULTITHREADED).is_ok());
        let devices: IMMDeviceEnumerator = CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL).map_err(|e| anyhow!("no sound devices: {e}"))?;
        let speaker = devices.GetDefaultAudioEndpoint(eRender, eConsole).map_err(|e| anyhow!("no speakers or headphones: {e}"))?;
        let client: IAudioClient = speaker.Activate(CLSCTX_ALL, None).map_err(|e| anyhow!("couldn't open the speakers: {e}"))?;
        let fmt = client.GetMixFormat().map_err(|e| anyhow!("couldn't read the sound format: {e}"))?;
        let channels = ((*fmt).nChannels as usize).max(1);
        let rate = (*fmt).nSamplesPerSec;
        let bits = (*fmt).wBitsPerSample;
        let started = client.Initialize(AUDCLNT_SHAREMODE_SHARED, AUDCLNT_STREAMFLAGS_LOOPBACK, 10_000_000, 0, fmt, None);
        let free = || CoTaskMemFree(Some(fmt as *const core::ffi::c_void));
        if let Err(e) = started {
            free();
            return Err(anyhow!("couldn't listen to the speakers: {e}"));
        }
        let capture: IAudioCaptureClient = match client.GetService() {
            Ok(c) => c,
            Err(e) => {
                free();
                return Err(anyhow!("couldn't listen to the speakers: {e}"));
            }
        };
        if let Err(e) = client.Start() {
            free();
            return Err(anyhow!("couldn't start listening: {e}"));
        }
        start();
        let until = Instant::now() + Duration::from_secs_f32(seconds.clamp(0.5, 30.0));
        let mut out: Vec<f32> = Vec::with_capacity((rate as f32 * seconds) as usize + rate as usize);
        // Where the stream's first frame was, so later packets land at their true time.
        let mut origin: Option<u64> = None;
        let mut failed = None;
        'listen: while Instant::now() < until {
            std::thread::sleep(Duration::from_millis(8));
            loop {
                let size = match capture.GetNextPacketSize() {
                    Ok(n) => n,
                    Err(e) => {
                        failed = Some(e);
                        break 'listen;
                    }
                };
                if size == 0 {
                    break;
                }
                let mut data: *mut u8 = std::ptr::null_mut();
                let (mut frames, mut flags, mut position) = (0u32, 0u32, 0u64);
                if let Err(e) = capture.GetBuffer(&mut data, &mut frames, &mut flags, Some(&mut position), None) {
                    failed = Some(e);
                    break 'listen;
                }
                // Nothing played for a while: that silence, in its place.
                let first = *origin.get_or_insert(position);
                let at = position.saturating_sub(first) as usize;
                if at > out.len() && at - out.len() < rate as usize * 30 {
                    out.resize(at, 0.0);
                }
                let silent = flags & (AUDCLNT_BUFFERFLAGS_SILENT.0 as u32) != 0;
                for f in 0..frames as usize {
                    let v = if silent || data.is_null() {
                        0.0
                    } else if bits == 32 {
                        let p = data as *const f32;
                        (0..channels).map(|c| *p.add(f * channels + c)).sum::<f32>() / channels as f32
                    } else if bits == 16 {
                        let p = data as *const i16;
                        (0..channels).map(|c| *p.add(f * channels + c) as f32 / 32768.0).sum::<f32>() / channels as f32
                    } else {
                        0.0
                    };
                    out.push(v);
                }
                let _ = capture.ReleaseBuffer(frames);
            }
        }
        let _ = client.Stop();
        free();
        if let Some(e) = failed {
            return Err(anyhow!("listening stopped: {e}"));
        }
        Ok((out, rate))
    }
}

#[cfg(not(windows))]
pub fn record(_seconds: f32, _start: impl FnOnce()) -> Result<(Vec<f32>, u32)> {
    Err(anyhow!("listening to the speakers needs Windows"))
}

/// Where the low hits start (a kick's thump), in seconds: the sound's low
/// end (under ~140 Hz), followed millisecond by millisecond, and each sharp
/// rise taken back to where it began. Hits closer than 90 ms are one hit.
pub fn low_hits(samples: &[f32], rate: u32) -> Vec<f64> {
    hits_below(samples, rate, 140.0)
}

/// Hits with their body under ~400 Hz: kicks, and snares, claps and toms
/// too — for a sample loop whose kick isn't deep enough to find alone.
pub fn body_hits(samples: &[f32], rate: u32) -> Vec<f64> {
    hits_below(samples, rate, 400.0)
}

fn hits_below(samples: &[f32], rate: u32, cutoff: f64) -> Vec<f64> {
    if samples.is_empty() || rate == 0 {
        return Vec::new();
    }
    let a = 1.0 - (-2.0 * std::f64::consts::PI * cutoff / rate as f64).exp();
    let (mut y1, mut y2) = (0.0f64, 0.0f64);
    let hop = (rate as usize / 1000).max(1);
    let mut env = Vec::with_capacity(samples.len() / hop + 1);
    let (mut acc, mut n) = (0.0f64, 0usize);
    for &x in samples {
        y1 += a * (x as f64 - y1);
        y2 += a * (y1 - y2);
        acc += y2 * y2;
        n += 1;
        if n == hop {
            env.push((acc / n as f64).sqrt());
            acc = 0.0;
            n = 0;
        }
    }
    let peak = env.iter().cloned().fold(0.0, f64::max);
    if peak < 1e-4 {
        return Vec::new();
    }
    let ms = |i: usize| i as f64 * hop as f64 / rate as f64;
    let mut hits = Vec::new();
    let mut last: Option<usize> = None;
    for i in 6..env.len() {
        let before = env[i - 6..i].iter().cloned().fold(f64::MAX, f64::min);
        let jump = env[i] - before;
        if env[i] >= 0.25 * peak && jump >= 0.2 * peak && last.is_none_or(|l| i - l > 90) {
            // Back to where the rise began.
            let mut j = i;
            while j > 0 && env[j - 1] < env[j] && env[j - 1] > before + 0.1 * jump {
                j -= 1;
            }
            hits.push(ms(j));
            last = Some(i);
        }
    }
    hits
}

/// Where FL's metronome ticks (bright, short clicks), in seconds: the sound
/// above ~2 kHz, followed millisecond by millisecond.
pub fn high_clicks(samples: &[f32], rate: u32) -> Vec<f64> {
    if samples.is_empty() || rate == 0 {
        return Vec::new();
    }
    let a = 1.0 - (-2.0 * std::f64::consts::PI * 2000.0 / rate as f64).exp();
    let mut lp = 0.0f64;
    let hop = (rate as usize / 1000).max(1);
    let mut env = Vec::with_capacity(samples.len() / hop + 1);
    let (mut acc, mut n) = (0.0f64, 0usize);
    for &x in samples {
        lp += a * (x as f64 - lp);
        let hp = x as f64 - lp;
        acc += hp * hp;
        n += 1;
        if n == hop {
            env.push((acc / n as f64).sqrt());
            acc = 0.0;
            n = 0;
        }
    }
    let peak = env.iter().cloned().fold(0.0, f64::max);
    if peak < 1e-4 {
        return Vec::new();
    }
    let mut out = Vec::new();
    let mut last: Option<usize> = None;
    for i in 3..env.len() {
        let before = env[i - 3..i].iter().cloned().fold(f64::MAX, f64::min);
        if env[i] >= 0.3 * peak && env[i] - before >= 0.25 * peak && last.is_none_or(|l| i - l > 60) {
            let mut j = i;
            while j > 0 && env[j - 1] < env[j] && env[j - 1] > before + 0.1 * (env[i] - before) {
                j -= 1;
            }
            out.push(j as f64 * hop as f64 / rate as f64);
            last = Some(i);
        }
    }
    out
}

/// When beat 1 was heard, from clicks every beat: the timing most clicks
/// agree with (a kick's own click falls off it). `None`: no steady click.
pub fn click_grid(clicks: &[f64], bpm: f64) -> Option<f64> {
    if bpm <= 0.0 {
        return None;
    }
    let period = 60.0 / bpm;
    let agrees = |c: f64, t: f64| {
        let k = ((t - c) / period).round();
        (t - c - k * period).abs() < 0.008
    };
    let (n, c) = clicks.iter().take(8).map(|&c| (clicks.iter().filter(|&&t| agrees(c, t)).count(), c)).max_by_key(|(n, _)| *n)?;
    if n < 3 {
        return None;
    }
    let with: Vec<f64> = clicks.iter().copied().filter(|&t| agrees(c, t)).collect();
    let first = with.iter().cloned().fold(f64::MAX, f64::min);
    let drift = with.iter().map(|t| t - first - ((t - first) / period).round() * period).sum::<f64>() / with.len() as f64;
    Some(first + drift)
}

/// Hits timed against the click (beat 1 heard at `beat0`), as beats in one
/// loop: the sound card's delay is the same for both, so it drops out.
pub fn hits_on_clock(hits: &[f64], beat0: f64, bpm: f64, loop_beats: f64) -> Vec<f64> {
    if bpm <= 0.0 || loop_beats <= 0.0 {
        return Vec::new();
    }
    let beats: Vec<f64> = hits
        .iter()
        .map(|t| (t - beat0) * bpm / 60.0)
        .filter(|b| *b >= -0.1 && *b < loop_beats * 2.0)
        .map(|b| b.rem_euclid(loop_beats))
        .collect();
    fold(beats, loop_beats)
}

/// Beats in the loop, sorted, a hit heard in both loops averaged — across
/// the loop's end too (a kick heard at 3.99, then at 0.01, is one kick).
fn fold(mut beats: Vec<f64>, loop_beats: f64) -> Vec<f64> {
    beats.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let mut merged: Vec<(f64, u32)> = Vec::new();
    for b in beats {
        match merged.last_mut() {
            Some((m, n)) if (b - *m / *n as f64).abs() < 0.08 => {
                *m += b;
                *n += 1;
            }
            _ => merged.push((b, 1)),
        }
    }
    if merged.len() > 1 {
        let (f, fn_) = merged[0];
        let (l, ln) = merged[merged.len() - 1];
        if f / (fn_ as f64) + loop_beats - l / (ln as f64) < 0.08 {
            merged.pop();
            merged[0] = (f + l - loop_beats * ln as f64, fn_ + ln);
        }
    }
    let mut out: Vec<f64> = merged.into_iter().map(|(m, n)| (m / n as f64).rem_euclid(loop_beats)).collect();
    out.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    out
}

/// The hits as beats within one loop of the pattern: the first hit is at
/// `anchor` beats (where the first kick is written), the rest follow at the
/// tempo — so the sound card's own delay drops out. Two loops heard are
/// folded into one, a hit heard in both averaged.
pub fn hits_to_beats(hits: &[f64], bpm: f64, anchor: f64, loop_beats: f64) -> Vec<f64> {
    let Some(&first) = hits.first() else { return Vec::new() };
    if bpm <= 0.0 || loop_beats <= 0.0 {
        return Vec::new();
    }
    let beats: Vec<f64> = hits
        .iter()
        .map(|t| anchor + (t - first) * bpm / 60.0)
        .filter(|b| *b >= anchor - 0.01 && *b < anchor + loop_beats * 2.0)
        .map(|b| b.rem_euclid(loop_beats))
        .collect();
    fold(beats, loop_beats)
}

// ---------------------------------------------------------------- pitch

/// The pitch of a sustained low sound (an 808, a bass note) in a stretch of
/// the recording, by YIN — in Hz, or None when it isn't one clear pitch
/// (noise, a chord, a sound too short or too quiet to tell).
pub fn pitch_at(samples: &[f32], rate: u32, from_s: f64, len_s: f64) -> Option<f64> {
    if rate == 0 || len_s <= 0.0 {
        return None;
    }
    let a = (from_s.max(0.0) * rate as f64) as usize;
    let b = (((from_s + len_s) * rate as f64) as usize).min(samples.len());
    if b <= a + 64 {
        return None;
    }
    // Low-passed (an 808 lives under ~250 Hz) and taken down to ~4 kHz.
    let step = (rate as usize / 4000).max(1);
    let fs = rate as f64 / step as f64;
    let k = 1.0 - (-2.0 * std::f64::consts::PI * 600.0 / rate as f64).exp();
    let (mut y1, mut y2) = (0.0f64, 0.0f64);
    let mut x: Vec<f64> = Vec::with_capacity((b - a) / step + 1);
    for (i, &s) in samples[a..b].iter().enumerate() {
        y1 += k * (s as f64 - y1);
        y2 += k * (y1 - y2);
        if i % step == 0 {
            x.push(y2);
        }
    }
    let rms = (x.iter().map(|v| v * v).sum::<f64>() / x.len() as f64).sqrt();
    if rms < 1e-4 {
        return None;
    }
    // Periods for 25–250 Hz.
    let (tmin, tmax) = ((fs / 250.0) as usize, (fs / 25.0) as usize);
    let w = x.len().saturating_sub(tmax + 1);
    if w < tmax || tmin < 2 {
        return None;
    }
    let mut d = vec![0.0f64; tmax + 2];
    for tau in 1..=tmax + 1 {
        d[tau] = (0..w).map(|j| (x[j] - x[j + tau]).powi(2)).sum();
    }
    // Cumulative-mean-normalised difference.
    let mut cm = vec![1.0f64; tmax + 2];
    let mut run = 0.0;
    for tau in 1..=tmax + 1 {
        run += d[tau];
        cm[tau] = if run > 0.0 { d[tau] * tau as f64 / run } else { 1.0 };
    }
    let mut tau = (tmin..=tmax).find(|&t| cm[t] < 0.12)?;
    while tau < tmax && cm[tau + 1] < cm[tau] {
        tau += 1;
    }
    // Between samples, from the dip's shape.
    let (l, c, r) = (cm[tau - 1], cm[tau], cm[tau + 1]);
    let bend = l - 2.0 * c + r;
    let shift = if bend.abs() > 1e-12 { 0.5 * (l - r) / bend } else { 0.0 };
    Some(fs / (tau as f64 + shift.clamp(-1.0, 1.0)))
}

/// How far a pitch sits from the nearest note, in cents (−50…50).
pub fn cents_off(hz: f64) -> f64 {
    let m = 69.0 + 12.0 * (hz / 440.0).log2();
    (m - m.round()) * 100.0
}

/// The nearest note's name, like "G1".
pub fn note_name(hz: f64) -> String {
    const NAMES: [&str; 12] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let m = (69.0 + 12.0 * (hz / 440.0).log2()).round() as i64;
    format!("{}{}", NAMES[m.rem_euclid(12) as usize], m.div_euclid(12) - 1)
}

/// One tuning shared by every hit: the middle offset when they agree within
/// ±15 cents (the sound itself is off), else None — notes off by different
/// amounts are slides or a choice, not a sample to retune.
pub fn common_detune(cents: &[f64]) -> Option<f64> {
    if cents.len() < 2 {
        return None;
    }
    // Around the circle (+48 and −49 cents are 3 apart).
    let first = cents[0];
    let mut c: Vec<f64> = cents.iter().map(|v| first + ((v - first + 50.0).rem_euclid(100.0) - 50.0)).collect();
    c.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let mid = c[c.len() / 2];
    if c.iter().any(|v| (v - mid).abs() > 15.0) {
        return None;
    }
    Some((mid + 50.0).rem_euclid(100.0) - 50.0)
}

/// Each hit's pitch, measured on the sustain (past the first moments, where
/// an 808 drops into its note), up to the next hit.
pub fn hit_pitches(samples: &[f32], rate: u32, hits: &[f64]) -> Vec<f64> {
    hits.iter()
        .enumerate()
        .filter_map(|(i, &t)| {
            let next = hits.get(i + 1).copied().unwrap_or(t + 0.6);
            // A long note: past the drop entirely; a short one: as late as it allows.
            let from = t + if next - t > 0.36 { 0.12 } else { 0.07 };
            let len = (next - from - 0.02).min(0.22);
            if len < 0.09 {
                return None;
            }
            pitch_at(samples, rate, from, len)
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// An 808-like note: `hz` with its 2nd and 3rd harmonics, an attack that
    /// drops into the note (`drop` semitones above at the start), dying away,
    /// `drive` > 0 for distortion.
    fn eight08(hz: f64, start: f64, secs: f64, rate: u32, drop: f64, drive: f64, out: &mut [f32]) {
        let mut phase = 0.0f64;
        let n = (secs * rate as f64) as usize;
        let s0 = (start * rate as f64) as usize;
        for i in 0..n {
            let t = i as f64 / rate as f64;
            let f = hz * 2f64.powf(drop * (-t * 40.0).exp() / 12.0);
            phase += 2.0 * std::f64::consts::PI * f / rate as f64;
            let mut v = (phase.sin() + 0.35 * (2.0 * phase).sin() + 0.15 * (3.0 * phase).sin()) * 0.6 * (-t * 2.5).exp();
            if drive > 0.0 {
                v = (v * drive).tanh() / drive.tanh();
            }
            if let Some(o) = out.get_mut(s0 + i) {
                *o += v as f32;
            }
        }
    }

    #[test]
    fn hears_the_808s_pitch_and_its_tuning() {
        let rate = 48_000;
        let g1 = 48.999; // G1
        let sharp = g1 * 2f64.powf(28.0 / 1200.0); // G1 + 28 cents
        // Clean, distorted, and dropping into the note: all G1 + 28¢.
        for (drop, drive) in [(0.0, 0.0), (0.0, 4.0), (5.0, 0.0), (5.0, 3.0)] {
            let mut s = vec![0.0f32; rate as usize];
            eight08(sharp, 0.0, 0.9, rate, drop, drive, &mut s);
            let hz = *hit_pitches(&s, rate, &[0.0]).first().expect("a clear pitch");
            assert!((cents_off(hz) - 28.0).abs() < 4.0, "drop {drop} drive {drive}: {hz:.2} Hz = {:.1}¢", cents_off(hz));
            assert_eq!(note_name(hz), "G1");
        }
        // A pattern of hits on different notes, all from the same detuned sample.
        let mut s = vec![0.0f32; rate as usize * 3];
        let notes = [(0.0, 0.0), (0.5, 3.0), (1.0, 5.0), (1.75, -2.0), (2.25, 0.0)];
        for (t, semis) in notes {
            eight08(sharp * 2f64.powf(semis / 12.0), t, 0.45, rate, 4.0, 2.0, &mut s);
        }
        let hits: Vec<f64> = notes.iter().map(|n| n.0).collect();
        let cents: Vec<f64> = hit_pitches(&s, rate, &hits).into_iter().map(cents_off).collect();
        assert!(cents.len() >= 4, "{cents:?}");
        let d = common_detune(&cents).expect("one tuning");
        assert!((d - 28.0).abs() < 4.0, "{d}");
        // Notes off by different amounts (slides, a choice): no retuning.
        assert_eq!(common_detune(&[5.0, 40.0, -20.0]), None);
        assert!(common_detune(&[48.0, -49.0, 49.0]).is_some_and(|d| d.abs() > 45.0), "around the circle");
        // Noise isn't a pitch.
        let mut seed = 7u64;
        let noise: Vec<f32> = (0..rate).map(|_| {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            ((seed >> 33) as f32 / u32::MAX as f32 - 0.25) * 0.8
        }).collect();
        assert_eq!(pitch_at(&noise, rate, 0.1, 0.22), None);
        assert_eq!(pitch_at(&vec![0.0; rate as usize], rate, 0.1, 0.22), None, "silence");
    }

    /// A kick-like thump (a 55 Hz tone that dies away) at each time.
    fn thumps(at: &[f64], rate: u32, secs: f64) -> Vec<f32> {
        let mut s = vec![0.0f32; (secs * rate as f64) as usize];
        for &t in at {
            let start = (t * rate as f64) as usize;
            for i in 0..(rate as usize / 4) {
                if start + i < s.len() {
                    let x = i as f64 / rate as f64;
                    s[start + i] += (0.8 * (2.0 * std::f64::consts::PI * 55.0 * x).sin() * (-x * 18.0).exp()) as f32;
                }
            }
        }
        // A little hiss on top, like a real recording.
        for (i, v) in s.iter_mut().enumerate() {
            *v += ((i * 7919) % 97) as f32 / 97.0 * 0.004 - 0.002;
        }
        s
    }

    #[test]
    fn hears_where_the_kicks_land() {
        let at = [0.10, 0.535, 0.96, 1.41];
        let hits = low_hits(&thumps(&at, 48_000, 2.0), 48_000);
        assert_eq!(hits.len(), at.len(), "{hits:?}");
        for (h, t) in hits.iter().zip(at) {
            assert!((h - t).abs() < 0.006, "heard {h}, played {t}");
        }
        assert!(low_hits(&vec![0.0; 48_000], 48_000).is_empty(), "silence has no hits");
    }

    #[test]
    fn the_click_is_the_clock() {
        let rate = 48_000;
        // 120 bpm: a click every 0.5 s from 0.13 s (the sound card's delay), and
        // an 808-like thump 30 ms after beats 1 and 3.
        let mut s = thumps(&[0.16, 1.16], rate, 2.4);
        for k in 0..4 {
            let start = ((0.13 + k as f64 * 0.5) * rate as f64) as usize;
            for i in 0..(rate as usize / 200) {
                let x = i as f64 / rate as f64;
                s[start + i] += (0.5 * (2.0 * std::f64::consts::PI * 3000.0 * x).sin() * (-x * 900.0).exp()) as f32;
            }
        }
        let beat0 = click_grid(&high_clicks(&s, rate), 120.0).expect("a steady click");
        assert!((beat0 - 0.13).abs() < 0.004, "beat 1 at {beat0}");
        let beats = hits_on_clock(&low_hits(&s, rate), beat0, 120.0, 4.0);
        assert_eq!(beats.len(), 2, "{beats:?}");
        assert!((beats[0] - 0.06).abs() < 0.015, "30 ms late at 120 bpm is 0.06 of a beat: {beats:?}");
        assert!(click_grid(&[0.1, 0.9], 120.0).is_none(), "no steady click");
    }

    #[test]
    fn hits_become_beats_in_the_loop() {
        // 120 bpm: a beat is 0.5 s. Kicks on 0, 1.5 (a little late: 1.56) and 3 — heard twice.
        let hits = [1.0, 1.78, 2.5, 3.0, 3.78, 4.5];
        let beats = hits_to_beats(&hits, 120.0, 0.0, 4.0);
        assert_eq!(beats.len(), 3, "{beats:?}");
        assert!((beats[1] - 1.56).abs() < 0.01, "the late kick stays late: {beats:?}");
        // One kick heard either side of the loop's end is one kick.
        let one = fold(vec![3.99, 0.01, 1.0, 1.01], 4.0);
        assert_eq!(one.len(), 2, "{one:?}");
        assert!(one[0].abs() < 1e-9 && (one[1] - 1.005).abs() < 1e-9, "{one:?}");
    }
}
