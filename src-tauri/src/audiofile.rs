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
    let riff_end = 8usize.checked_add(u32_at(4).ok_or_else(|| anyhow!("cut short"))? as usize)
        .filter(|end| *end >= 12 && *end <= d.len()).ok_or_else(|| anyhow!("WAV data cut short"))?;
    let d = &d[..riff_end];
    let mut fmt: Option<(u16, u16, u32, u16)> = None;
    let mut i = 12;
    while i + 8 <= d.len() {
        let id = &d[i..i + 4];
        let size = u32_at(i + 4).unwrap_or(0) as usize;
        let body = i + 8;
        let end = body.checked_add(size).filter(|end| *end <= d.len()).ok_or_else(|| anyhow!("WAV chunk cut short"))?;
        if id == b"fmt " {
            if size < 16 { bail!("WAV format cut short"); }
            let mut tag = u16_at(body).ok_or_else(|| anyhow!("cut short"))?;
            let channels = u16_at(body + 2).ok_or_else(|| anyhow!("cut short"))?;
            let rate = u32_at(body + 4).ok_or_else(|| anyhow!("cut short"))?;
            let bits = u16_at(body + 14).ok_or_else(|| anyhow!("cut short"))?;
            // WAVE_FORMAT_EXTENSIBLE: the real format is in its sub-format.
            if tag == 0xFFFE {
                if size < 40 || u16_at(body + 16).unwrap_or(0) < 22 {
                    bail!("WAV extended format cut short");
                }
                // Only the standard PCM/IEEE-float subformat GUIDs are supported.
                if d.get(body + 26..body + 40) != Some(&[0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113]) {
                    bail!("unsupported WAV subformat");
                }
                tag = u16_at(body + 24).ok_or_else(|| anyhow!("cut short"))?;
            }
            if channels == 0 || rate == 0 { bail!("invalid WAV channel count or sample rate"); }
            fmt = Some((tag, channels, rate, bits));
        } else if id == b"data" {
            let (tag, channels, rate, bits) = fmt.ok_or_else(|| anyhow!("no format before the sound"))?;
            let data = &d[body..end];
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
            if data.len() % frame != 0 { bail!("WAV sample frame cut short"); }
            let mono: Vec<f32> = data.chunks_exact(frame).map(|f| f.chunks_exact(step).map(|b| one(b) / f32::from(channels)).sum()).collect();
            if mono.iter().any(|sample| !sample.is_finite()) { bail!("WAV contains invalid sample values"); }
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
    fn rejects_truncated_chunks_and_invalid_audio_metadata() {
        let valid = wav(1, 1, 48000, 16, &[vec![0.5], vec![-0.5]]);
        for end in 0..valid.len() {
            assert!(decode_wav(&valid[..end]).is_err(), "accepted truncation at {end}");
        }
        for (offset, bytes) in [(20, vec![255, 255]), (22, vec![0, 0]), (24, vec![0, 0, 0, 0]), (16, vec![2, 0, 0, 0])] {
            let mut broken = valid.clone();
            broken[offset..offset + bytes.len()].copy_from_slice(&bytes);
            assert!(decode_wav(&broken).is_err());
        }
        let mut partial_frame = valid.clone();
        partial_frame.pop();
        let len = partial_frame.len();
        partial_frame[4..8].copy_from_slice(&((len - 8) as u32).to_le_bytes());
        partial_frame[40..44].copy_from_slice(&3u32.to_le_bytes());
        assert!(decode_wav(&partial_frame).is_err());
        for sample in [f32::NAN, f32::INFINITY, f32::NEG_INFINITY] {
            assert!(decode_wav(&wav(3, 1, 48000, 32, &[vec![sample]])).is_err());
        }
    }

    #[test]
    fn reads_standard_extensible_pcm_and_float_but_rejects_other_guids() {
        for (tag, bits) in [(1u16, 16), (3, 32)] {
            let mut d = wav(tag, 1, 48000, bits, &[vec![0.5], vec![-0.5]]);
            let mut extension = Vec::new();
            extension.extend(22u16.to_le_bytes());
            extension.extend(bits.to_le_bytes());
            extension.extend(0u32.to_le_bytes());
            extension.extend(tag.to_le_bytes());
            extension.extend([0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113]);
            d.splice(36..36, extension);
            let len = d.len();
            d[4..8].copy_from_slice(&((len - 8) as u32).to_le_bytes());
            d[16..20].copy_from_slice(&40u32.to_le_bytes());
            d[20..22].copy_from_slice(&0xfffeu16.to_le_bytes());
            let (samples, rate) = decode_wav(&d).unwrap();
            assert_eq!(rate, 48000);
            assert!((samples[0] - 0.5).abs() < 0.001);
            d[59] ^= 1;
            assert!(decode_wav(&d).is_err());
        }
        let mut short = wav(1, 1, 48000, 16, &[vec![0.5]]);
        short[20..22].copy_from_slice(&0xfffeu16.to_le_bytes());
        assert!(decode_wav(&short).is_err());
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
