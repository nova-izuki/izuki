//! Screen capture.
//!
//! Straight GDI `BitBlt` off the virtual desktop DC. A 2560x1440 grab lands in
//! roughly 8-12 ms, which is what keeps the freeze under the 80 ms budget —
//! encoding happens later, on a worker, never on the hotkey path.

use anyhow::{anyhow, Result};
use image::codecs::jpeg::JpegEncoder;
use image::{ImageBuffer, Rgba};

use crate::model::Rect;

/// A raw BGRA frame, top-down, tightly packed.
#[derive(Clone)]
pub struct Frame {
    pub width: u32,
    pub height: u32,
    /// Where on the virtual desktop this frame was taken from.
    pub origin: (i32, i32),
    pub bgra: Vec<u8>,
}

impl Frame {
    pub fn pixel(&self, x: u32, y: u32) -> Option<(u8, u8, u8)> {
        if x >= self.width || y >= self.height {
            return None;
        }
        let i = ((y * self.width + x) * 4) as usize;
        Some((self.bgra[i + 2], self.bgra[i + 1], self.bgra[i]))
    }

    /// Crop in virtual-desktop coordinates.
    pub fn crop(&self, r: &Rect) -> Option<Frame> {
        let local = Rect {
            x: r.x - self.origin.0,
            y: r.y - self.origin.1,
            w: r.w,
            h: r.h,
        };
        let bounds = Rect {
            x: 0,
            y: 0,
            w: self.width as i32,
            h: self.height as i32,
        };
        let c = local.clip_to(&bounds)?;

        let mut out = Vec::with_capacity((c.w * c.h * 4) as usize);
        for row in 0..c.h {
            let start = (((c.y + row) * self.width as i32 + c.x) * 4) as usize;
            let end = start + (c.w * 4) as usize;
            out.extend_from_slice(&self.bgra[start..end]);
        }
        Some(Frame {
            width: c.w as u32,
            height: c.h as u32,
            origin: (self.origin.0 + c.x, self.origin.1 + c.y),
            bgra: out,
        })
    }

    fn to_rgba_image(&self) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        let mut rgba = Vec::with_capacity(self.bgra.len());
        for px in self.bgra.chunks_exact(4) {
            rgba.extend_from_slice(&[px[2], px[1], px[0], 255]);
        }
        ImageBuffer::from_raw(self.width, self.height, rgba)
            .unwrap_or_else(|| ImageBuffer::new(self.width, self.height))
    }

    /// Box-filtered downscale so the longest edge is at most `max_edge`.
    /// Vision models gain nothing from 4K and cost a lot more to feed.
    pub fn downscaled(&self, max_edge: u32) -> Frame {
        let long = self.width.max(self.height);
        if long <= max_edge || long == 0 {
            return self.clone();
        }
        let scale = max_edge as f32 / long as f32;
        let nw = ((self.width as f32 * scale).round() as u32).max(1);
        let nh = ((self.height as f32 * scale).round() as u32).max(1);

        let mut out = vec![0u8; (nw * nh * 4) as usize];
        let sx = self.width as f32 / nw as f32;
        let sy = self.height as f32 / nh as f32;

        for y in 0..nh {
            let y0 = (y as f32 * sy) as u32;
            let y1 = (((y + 1) as f32 * sy) as u32).min(self.height).max(y0 + 1);
            for x in 0..nw {
                let x0 = (x as f32 * sx) as u32;
                let x1 = (((x + 1) as f32 * sx) as u32).min(self.width).max(x0 + 1);

                let (mut b, mut g, mut r, mut n) = (0u32, 0u32, 0u32, 0u32);
                for yy in y0..y1 {
                    let row = (yy * self.width) as usize * 4;
                    for xx in x0..x1 {
                        let i = row + xx as usize * 4;
                        b += self.bgra[i] as u32;
                        g += self.bgra[i + 1] as u32;
                        r += self.bgra[i + 2] as u32;
                        n += 1;
                    }
                }
                let n = n.max(1);
                let o = ((y * nw + x) * 4) as usize;
                out[o] = (b / n) as u8;
                out[o + 1] = (g / n) as u8;
                out[o + 2] = (r / n) as u8;
                out[o + 3] = 255;
            }
        }

        Frame {
            width: nw,
            height: nh,
            origin: self.origin,
            bgra: out,
        }
    }

    /// Enlarged (smoothly, up to `max_factor`×) so the longest edge reaches
    /// about `edge` — a zoomed-in crop of small print is read far better by
    /// the vision models at a size they don't shrink. Never shrinks.
    pub fn enlarged(&self, edge: u32, max_factor: f32) -> Frame {
        let long = self.width.max(self.height);
        if long == 0 || long >= edge {
            return self.clone();
        }
        let f = (edge as f32 / long as f32).min(max_factor);
        let nw = ((self.width as f32 * f).round() as u32).max(1);
        let nh = ((self.height as f32 * f).round() as u32).max(1);
        let big = image::imageops::resize(&self.to_rgba_image(), nw, nh, image::imageops::FilterType::CatmullRom);
        let mut bgra = big.into_raw();
        for px in bgra.chunks_exact_mut(4) {
            px.swap(0, 2);
        }
        Frame { width: nw, height: nh, origin: self.origin, bgra }
    }

    pub fn to_jpeg(&self, quality: u8) -> Result<Vec<u8>> {
        let img = self.to_rgba_image();
        let rgb = image::DynamicImage::ImageRgba8(img).to_rgb8();
        let mut out = Vec::with_capacity(64 * 1024);
        JpegEncoder::new_with_quality(&mut out, quality).encode(
            rgb.as_raw(),
            self.width,
            self.height,
            image::ExtendedColorType::Rgb8,
        )?;
        Ok(out)
    }

    pub fn to_png(&self) -> Result<Vec<u8>> {
        let img = self.to_rgba_image();
        let mut out = Vec::with_capacity(64 * 1024);
        image::DynamicImage::ImageRgba8(img)
            .write_to(&mut std::io::Cursor::new(&mut out), image::ImageFormat::Png)?;
        Ok(out)
    }

    pub fn to_jpeg_data_url(&self, quality: u8) -> Result<String> {
        use base64::Engine;
        let bytes = self.to_jpeg(quality)?;
        Ok(format!(
            "data:image/jpeg;base64,{}",
            base64::engine::general_purpose::STANDARD.encode(bytes)
        ))
    }

    /// Mean absolute per-channel difference, 0.0 - 100.0. Used by watchers to
    /// notice that a region moved without paying for a vision call.
    pub fn difference(&self, other: &Frame) -> f32 {
        if self.width != other.width || self.height != other.height || self.bgra.is_empty() {
            return 100.0;
        }
        // Sample every 4th pixel — plenty for change detection, 4x cheaper.
        let mut sum: u64 = 0;
        let mut n: u64 = 0;
        for i in (0..self.bgra.len()).step_by(16) {
            let a = &self.bgra[i..i + 3];
            let b = &other.bgra[i..i + 3];
            sum += (a[0] as i32 - b[0] as i32).unsigned_abs() as u64;
            sum += (a[1] as i32 - b[1] as i32).unsigned_abs() as u64;
            sum += (a[2] as i32 - b[2] as i32).unsigned_abs() as u64;
            n += 3;
        }
        if n == 0 {
            return 0.0;
        }
        (sum as f32 / n as f32) / 255.0 * 100.0
    }

    /// Average colour of the frame as (r, g, b).
    pub fn average(&self) -> (u8, u8, u8) {
        if self.bgra.is_empty() {
            return (0, 0, 0);
        }
        let (mut b, mut g, mut r, mut n) = (0u64, 0u64, 0u64, 0u64);
        for i in (0..self.bgra.len()).step_by(16) {
            b += self.bgra[i] as u64;
            g += self.bgra[i + 1] as u64;
            r += self.bgra[i + 2] as u64;
            n += 1;
        }
        let n = n.max(1);
        ((r / n) as u8, (g / n) as u8, (b / n) as u8)
    }
}

// ---------------------------------------------------------------------------
// Windows implementation
// ---------------------------------------------------------------------------

#[cfg(windows)]
mod imp {
    use super::*;
    use std::mem::size_of;
    use windows::core::w;
    use windows::Win32::Foundation::POINT;
    use windows::Win32::Graphics::Gdi::{
        BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, CreateDCW, DeleteDC, DeleteObject,
        GetDIBits, SelectObject, SetStretchBltMode, StretchBlt, BITMAPINFO, BITMAPINFOHEADER, BI_RGB,
        CAPTUREBLT, COLORONCOLOR, DIB_RGB_COLORS, HGDIOBJ, SRCCOPY,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        GetCursorPos, GetSystemMetrics, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN,
        SM_YVIRTUALSCREEN,
    };

    /// Bounding box of every monitor, in physical pixels.
    pub fn virtual_bounds() -> Rect {
        unsafe {
            let x = GetSystemMetrics(SM_XVIRTUALSCREEN);
            let y = GetSystemMetrics(SM_YVIRTUALSCREEN);
            let w = GetSystemMetrics(SM_CXVIRTUALSCREEN);
            let h = GetSystemMetrics(SM_CYVIRTUALSCREEN);
            if w <= 0 || h <= 0 {
                // Single-monitor fallback.
                return Rect { x: 0, y: 0, w: 1920, h: 1080 };
            }
            Rect { x, y, w, h }
        }
    }

    pub fn cursor_pos() -> (i32, i32) {
        unsafe {
            let mut p = POINT::default();
            if GetCursorPos(&mut p).is_ok() {
                (p.x, p.y)
            } else {
                (0, 0)
            }
        }
    }

    pub fn capture(region: Rect) -> Result<Frame> {
        if region.w <= 0 || region.h <= 0 {
            return Err(anyhow!("empty capture region"));
        }

        unsafe {
            // A DC over the whole virtual desktop, so one blit spans every monitor.
            let screen_dc = CreateDCW(w!("DISPLAY"), None, None, None);
            if screen_dc.is_invalid() {
                return Err(anyhow!("could not open the display device context"));
            }

            let mem_dc = CreateCompatibleDC(Some(screen_dc));
            if mem_dc.is_invalid() {
                let _ = DeleteDC(screen_dc);
                return Err(anyhow!("could not create a memory device context"));
            }

            let bitmap = CreateCompatibleBitmap(screen_dc, region.w, region.h);
            if bitmap.is_invalid() {
                let _ = DeleteDC(mem_dc);
                let _ = DeleteDC(screen_dc);
                return Err(anyhow!("could not allocate the capture bitmap"));
            }

            let old = SelectObject(mem_dc, HGDIOBJ(bitmap.0));

            // CAPTUREBLT pulls in layered windows, which is how we see overlays
            // and tooltips that would otherwise be missing from the grab.
            let blit = BitBlt(
                mem_dc,
                0,
                0,
                region.w,
                region.h,
                Some(screen_dc),
                region.x,
                region.y,
                SRCCOPY | CAPTUREBLT,
            );

            let mut bgra = vec![0u8; (region.w as usize) * (region.h as usize) * 4];

            let mut info = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: region.w,
                    // Negative height asks GDI for a top-down buffer, saving a flip.
                    biHeight: -region.h,
                    biPlanes: 1,
                    biBitCount: 32,
                    biCompression: BI_RGB.0,
                    ..Default::default()
                },
                ..Default::default()
            };

            let scanned = GetDIBits(
                mem_dc,
                bitmap,
                0,
                region.h as u32,
                Some(bgra.as_mut_ptr().cast()),
                &mut info,
                DIB_RGB_COLORS,
            );

            SelectObject(mem_dc, old);
            let _ = DeleteObject(HGDIOBJ(bitmap.0));
            let _ = DeleteDC(mem_dc);
            let _ = DeleteDC(screen_dc);

            blit.map_err(|e| anyhow!("BitBlt failed: {e}"))?;
            if scanned == 0 {
                return Err(anyhow!("GetDIBits returned no scan lines"));
            }

            Ok(Frame {
                width: region.w as u32,
                height: region.h as u32,
                origin: (region.x, region.y),
                bgra,
            })
        }
    }

    /// A tiny picture of the whole desktop (`w`×`h`), shrunk by the graphics
    /// driver in one call — cheap enough to take several times a second.
    /// Live Eyes (`live.rs`) watches these for motion; they never go to a model.
    pub fn capture_thumb(w: i32, h: i32) -> Result<Frame> {
        let vb = virtual_bounds();
        unsafe {
            let screen_dc = CreateDCW(w!("DISPLAY"), None, None, None);
            if screen_dc.is_invalid() {
                return Err(anyhow!("could not open the display device context"));
            }
            let mem_dc = CreateCompatibleDC(Some(screen_dc));
            let bitmap = CreateCompatibleBitmap(screen_dc, w, h);
            if mem_dc.is_invalid() || bitmap.is_invalid() {
                let _ = DeleteDC(mem_dc);
                let _ = DeleteDC(screen_dc);
                return Err(anyhow!("could not set up the thumbnail capture"));
            }
            let old = SelectObject(mem_dc, HGDIOBJ(bitmap.0));
            SetStretchBltMode(mem_dc, COLORONCOLOR);
            let ok = StretchBlt(mem_dc, 0, 0, w, h, Some(screen_dc), vb.x, vb.y, vb.w, vb.h, SRCCOPY);
            let mut bgra = vec![0u8; (w as usize) * (h as usize) * 4];
            let mut info = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: w,
                    biHeight: -h,
                    biPlanes: 1,
                    biBitCount: 32,
                    biCompression: BI_RGB.0,
                    ..Default::default()
                },
                ..Default::default()
            };
            let scanned = GetDIBits(mem_dc, bitmap, 0, h as u32, Some(bgra.as_mut_ptr().cast()), &mut info, DIB_RGB_COLORS);
            SelectObject(mem_dc, old);
            let _ = DeleteObject(HGDIOBJ(bitmap.0));
            let _ = DeleteDC(mem_dc);
            let _ = DeleteDC(screen_dc);
            if !ok.as_bool() || scanned == 0 {
                return Err(anyhow!("thumbnail capture failed"));
            }
            Ok(Frame { width: w as u32, height: h as u32, origin: (vb.x, vb.y), bgra })
        }
    }
}

#[cfg(not(windows))]
mod imp {
    use super::*;

    pub fn capture_thumb(w: i32, h: i32) -> Result<Frame> {
        Ok(Frame { width: w as u32, height: h as u32, origin: (0, 0), bgra: vec![0; (w * h * 4) as usize] })
    }

    pub fn virtual_bounds() -> Rect {
        Rect { x: 0, y: 0, w: 1920, h: 1080 }
    }

    pub fn cursor_pos() -> (i32, i32) {
        (0, 0)
    }

    pub fn capture(region: Rect) -> Result<Frame> {
        Ok(Frame {
            width: region.w.max(1) as u32,
            height: region.h.max(1) as u32,
            origin: (region.x, region.y),
            bgra: vec![0; (region.w.max(1) * region.h.max(1) * 4) as usize],
        })
    }
}

pub use imp::{capture, capture_thumb, cursor_pos, virtual_bounds};

/// Grab the whole virtual desktop.
pub fn capture_all() -> Result<Frame> {
    capture(virtual_bounds())
}
