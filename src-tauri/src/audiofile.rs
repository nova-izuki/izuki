//! A sample's own sound, read from its file — no playback, so a muted or
//! quiet channel doesn't matter. WAV files as FL Studio and sample packs
//! write them: 16, 24 or 32-bit, or 32-bit float, any number of channels
//! (mixed to one).

use std::path::Path;

use anyhow::{anyhow, bail, Result};

/// The file's sound, mixed to mono, and its sample rate.
pub fn read_wav(path: &Path) -> Result<(Vec<f32>, u32)> {
    decode_wav(&std::fs::read(path)?)
}

pub fn decode_wav(d: &[u8]) -> Result<(Vec<f32>, u32)> {
    if d.get(..4) != Some(b"RIFF") || d.get(8..12) != Some(b"WAVE") {
        bail!("not a WAV file");
    }
    let u16_at = |i: usize| d.get(i..i + 2).map(|b| u16::from_le_bytes([b[0], b[1]]));
    let u32_at = |i: usize| d.get(i..i + 4).map(|b| u32::from_le_bytes([b[0], b[1], b[2], b[3]]));
    let mut fmt: Option<(u16, u16, u32, u16)> = None;
    let mut i = 12;
    while i + 8 <= d.len() {
        let id = &d[i..i + 4];
        let size = u32_at(i + 4).unwrap_or(0) as usize;
        let body = i + 8;
        if id == b"fmt " {
            let mut tag = u16_at(body).ok_or_else(|| anyhow!("cut short"))?;
            let channels = u16_at(body + 2).ok_or_else(|| anyhow!("cut short"))?;
            let rate = u32_at(body + 4).ok_or_else(|| anyhow!("cut short"))?;
            let bits = u16_at(body + 14).ok_or_else(|| anyhow!("cut short"))?;
            // WAVE_FORMAT_EXTENSIBLE: the real format is in its sub-format.
            if tag == 0xFFFE {
                tag = u16_at(body + 24).unwrap_or(1);
            }
            fmt = Some((tag, channels.max(1), rate, bits));
        } else if id == b"data" {
            let (tag, channels, rate, bits) = fmt.ok_or_else(|| anyhow!("no format before the sound"))?;
            let data = &d[body..(body + size).min(d.len())];
            let step = (bits / 8) as usize;
            if step == 0 {
                bail!("a WAV with {bits}-bit samples");
            }
            let one = |b: &[u8]| -> f32 {
                match (tag, bits) {
                    (3, 32) => f32::from_le_bytes([b[0], b[1], b[2], b[3]]),
                    (1, 16) => f32::from(i16::from_le_bytes([b[0], b[1]])) / 32768.0,
                    (1, 24) => (i32::from_le_bytes([0, b[0], b[1], b[2]]) >> 8) as f32 / 8_388_608.0,
                    (1, 32) => i32::from_le_bytes([b[0], b[1], b[2], b[3]]) as f32 / 2_147_483_648.0,
                    (1, 8) => (f32::from(b[0]) - 128.0) / 128.0,
                    _ => 0.0,
                }
            };
            if !matches!((tag, bits), (3, 32) | (1, 16) | (1, 24) | (1, 32) | (1, 8)) {
                bail!("a WAV in a format I don't read yet ({tag}, {bits}-bit)");
            }
            let frame = step * channels as usize;
            let mono = data.chunks_exact(frame).map(|f| f.chunks_exact(step).map(one).sum::<f32>() / f32::from(channels)).collect();
            return Ok((mono, rate));
        }
        i = body + size + (size & 1);
    }
    bail!("no sound in that WAV")
}

/// Where a one-shot's punch lands after it starts, in seconds: when its
/// loudness first reaches half its peak. An 808 with a slow attack sounds
/// late even when its note is right on the grid — this is how late.
pub fn attack_s(samples: &[f32], rate: u32) -> Option<f64> {
    let rate = rate.max(1) as usize;
    // Loudness in 2 ms steps over the first second.
    let hop = (rate / 500).max(1);
    let head = &samples[..samples.len().min(rate)];
    let env: Vec<f32> = head.chunks(hop).map(|c| c.iter().fold(0f32, |m, s| m.max(s.abs()))).collect();
    let peak = env.iter().cloned().fold(0f32, f32::max);
    if peak < 1e-3 {
        return None;
    }
    let at = env.iter().position(|v| *v >= peak * 0.5)?;
    Some((at * hop) as f64 / rate as f64)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn wav(tag: u16, channels: u16, rate: u32, bits: u16, frames: &[Vec<f32>]) -> Vec<u8> {
        let mut data = Vec::new();
        for f in frames {
            for s in f {
                match (tag, bits) {
                    (3, 32) => data.extend(s.to_le_bytes()),
                    (1, 16) => data.extend(((s * 32767.0) as i16).to_le_bytes()),
                    (1, 24) => data.extend(&((s * 8_388_607.0) as i32).to_le_bytes()[..3]),
                    _ => unreachable!(),
                }
            }
        }
        let mut d = Vec::new();
        d.extend(b"RIFF");
        d.extend((36 + data.len() as u32).to_le_bytes());
        d.extend(b"WAVEfmt ");
        d.extend(16u32.to_le_bytes());
        d.extend(tag.to_le_bytes());
        d.extend(channels.to_le_bytes());
        d.extend(rate.to_le_bytes());
        d.extend((rate * u32::from(channels) * u32::from(bits / 8)).to_le_bytes());
        d.extend((channels * bits / 8).to_le_bytes());
        d.extend(bits.to_le_bytes());
        d.extend(b"data");
        d.extend((data.len() as u32).to_le_bytes());
        d.extend(data);
        d
    }

    #[test]
    fn reads_the_formats_samples_come_in() {
        // Stereo float (FL's own renders), 16-bit, 24-bit: mixed to mono.
        let frames = vec![vec![0.5, -0.5], vec![0.25, 0.25], vec![-1.0, 0.0]];
        let (s, r) = decode_wav(&wav(3, 2, 44100, 32, &frames)).unwrap();
        assert_eq!((r, s.len()), (44100, 3));
        assert!((s[0] - 0.0).abs() < 1e-6 && (s[1] - 0.25).abs() < 1e-6 && (s[2] + 0.5).abs() < 1e-6);
        let (s, _) = decode_wav(&wav(1, 2, 48000, 16, &frames)).unwrap();
        assert!((s[1] - 0.25).abs() < 1e-3);
        let (s, _) = decode_wav(&wav(1, 2, 48000, 24, &frames)).unwrap();
        assert!((s[2] + 0.5).abs() < 1e-3);
        assert!(decode_wav(b"RIFF....WAVE").is_err());
    }

    #[test]
    fn hears_how_late_a_one_shot_punches() {
        // Silent for 12 ms, then a hit that swells to its peak.
        let rate = 48000;
        let mut s = vec![0.0f32; rate as usize / 2];
        let start = (0.012 * f64::from(rate)) as usize;
        for (k, v) in s.iter_mut().enumerate().skip(start) {
            let t = (k - start) as f32 / rate as f32;
            *v = (t / 0.004).min(1.0) * (-t * 4.0).exp() * (2.0 * std::f32::consts::PI * 50.0 * t).sin().signum() * 0.8;
        }
        let a = attack_s(&s, rate).unwrap();
        assert!((0.012..0.018).contains(&a), "{a}");
        assert_eq!(attack_s(&vec![0.0; 4800], rate), None, "silence");
    }

    /// A real sample: `IZUKI_WAV=<path> cargo test --lib real_sample -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn real_sample() {
        let path = std::env::var("IZUKI_WAV").expect("IZUKI_WAV");
        let (s, r) = read_wav(Path::new(&path)).unwrap();
        eprintln!("{} samples at {r} Hz ({:.2} s), attack {:?}", s.len(), s.len() as f64 / f64::from(r), attack_s(&s, r));
        assert!(!s.is_empty());
    }
}
