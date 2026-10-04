"""Finish Izuki's ad images: the artwork (made once with an image model,
no text in it) plus headlines and Izuki's branding, set here so every word
is crisp and spelled right. Run: python tools/make-ads.py <art folder> <out folder>"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ART, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(__file__), "..")
LOGO = Image.open(os.path.join(ROOT, "docs", "icon-512.png")).convert("RGBA")
FONTS = "C:/Windows/Fonts/"
BLACK, BOLD, SEMI = FONTS + "seguibl.ttf", FONTS + "segoeuib.ttf", FONTS + "seguisb.ttf"

ADS = [
    # file, headline, subline, panel height (share of the image), panel line
    ("art0.png", "Your PC, on autopilot.", "Say \u201cHey Nova, finish this.\u201d It sees your screen and does the work.", 0.20, "The free AI that uses your PC for you"),
    ("art1.png", "No remote needed.", "\u201cHey Nova, put on my show.\u201d Izuki runs your TV.", 0.20, "Free on your PC, phone and TV"),
    ("art2.png", "It speaks up\nbefore you ask.", "Important emails, meetings, low battery \u2014 Izuki tells you.", 0.36, "Your free AI buddy for Windows"),
    ("art3.png", "Meet Izuki.", "Say \u201cHey Nova.\u201d It does the rest.", 0.22, "Free for Windows \u00b7 phone \u00b7 TV"),
]


def fit(draw, text, font_path, max_w, start):
    size = start
    while size > 12:
        f = ImageFont.truetype(font_path, size)
        w = max(draw.textbbox((0, 0), line, font=f)[2] for line in text.split("\n"))
        if w <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(font_path, size)


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textbbox((0, 0), t, font=font)[2] <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return "\n".join(lines)


def shadowed(base, xy, text, font, fill, anchor="ma", spacing=8, blur=10, align="center"):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).multiline_text(xy, text, font=font, fill=(10, 6, 30, 200), anchor=anchor, spacing=spacing, align=align)
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(base).multiline_text(xy, text, font=font, fill=fill, anchor=anchor, spacing=spacing, align=align)


os.makedirs(OUT, exist_ok=True)
for i, (name, head, sub, panel_share, line) in enumerate(ADS):
    im = Image.open(os.path.join(ART, name)).convert("RGBA")
    W, H = im.size
    d = ImageDraw.Draw(im)
    pad = int(W * 0.07)

    # Headline and subline at the top, over a soft fade so they always read.
    fade = Image.new("RGBA", im.size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(fade)
    top = int(H * (0.30 if W == H else 0.24))
    for y in range(top):
        fd.line([(0, y), (W, y)], fill=(18, 10, 48, int(150 * (1 - y / top) ** 1.6)))
    im.alpha_composite(fade)
    hf = fit(d, head, BLACK, W - 2 * pad, int(W * 0.11))
    y = int(H * 0.045)
    shadowed(im, (W // 2, y), head, hf, (255, 255, 255, 255))
    hb = d.multiline_textbbox((W // 2, y), head, font=hf, anchor="ma", spacing=8)
    sf = ImageFont.truetype(SEMI, max(18, int(W * (0.036 if W == H else 0.05))))
    shadowed(im, (W // 2, hb[3] + int(H * 0.018)), wrap(d, sub, sf, W - 2 * pad), sf, (236, 232, 255, 255), spacing=6, blur=6)

    # The Izuki panel at the bottom: frosted glass, logo, name, line, address.
    ph = int(H * panel_share)
    box = (int(W * 0.05), H - ph - int(H * 0.035), W - int(W * 0.05), H - int(H * 0.035))
    region = im.crop(box).filter(ImageFilter.GaussianBlur(28))
    tint = Image.new("RGBA", region.size, (14, 10, 38, 185))
    region = Image.alpha_composite(region.convert("RGBA"), tint)
    mask = Image.new("L", region.size, 0)
    r = int(min(region.size) * 0.22)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, region.size[0] - 1, region.size[1] - 1), radius=r, fill=255)
    im.paste(region, box[:2], mask)
    ImageDraw.Draw(im).rounded_rectangle(box, radius=r, outline=(167, 139, 250, 150), width=max(2, W // 500))
    bw, bh = box[2] - box[0], box[3] - box[1]
    # A tall panel: what it does, ticked off, above the name.
    if panel_share > 0.3:
        ff = ImageFont.truetype(BOLD, int(bw * 0.058))
        feats = ["✓  Answers your emails", "✓  Reminds you of meetings", "✓  Watches your battery & Wi-Fi", "✓  Free — no subscription"]
        fy = box[1] + int(bh * 0.09)
        tick = ImageFont.truetype(FONTS + "seguisym.ttf", int(bw * 0.058))
        for f in feats:
            dd = ImageDraw.Draw(im)
            dd.text((box[0] + int(bw * 0.08), fy), "✓", font=tick, fill=(103, 232, 249, 255))
            dd.text((box[0] + int(bw * 0.17), fy), f.split("  ", 1)[1], font=ff, fill=(236, 232, 255, 255))
            fy += int(bw * 0.085)
        box = (box[0], fy + int(bh * 0.02), box[2], box[3])
        bw, bh = box[2] - box[0], box[3] - box[1]
    ls = int(min(bh * 0.62, bw * 0.2))
    logo = LOGO.resize((ls, ls), Image.LANCZOS)
    lx, ly = box[0] + int(bw * 0.06), box[1] + (bh - ls) // 2
    im.alpha_composite(logo, (lx, ly))
    tx = lx + ls + int(bw * 0.05)
    nf = ImageFont.truetype(BLACK, int(ls * 0.46))
    lf = fit(d, line, SEMI, box[2] - tx - int(bw * 0.05), int(ls * 0.22))
    uf = ImageFont.truetype(BOLD, int(ls * 0.19))
    cy = box[1] + bh // 2
    d = ImageDraw.Draw(im)
    d.text((tx, cy - int(ls * 0.12)), "Izuki", font=nf, fill=(255, 255, 255, 255), anchor="ls")
    d.text((tx, cy + int(ls * 0.12)), line, font=lf, fill=(220, 214, 255, 255), anchor="lm")
    d.text((tx, cy + int(ls * 0.38)), "nova-izuki.github.io/izuki", font=uf, fill=(103, 232, 249, 255), anchor="lm")

    out = os.path.join(OUT, f"izuki-ad-{i + 1}-{'square' if W == H else 'story'}.png")
    im.convert("RGB").save(out, optimize=True)
    print("made", out)
