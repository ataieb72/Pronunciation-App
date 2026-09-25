#!/usr/bin/env python3
"""Draws the app icons with the Python standard library only (no image tools needed).

Design: five white rounded "voice bars" on the accent blue. Run from apps/pwa:
    python3 scripts/make_icons.py
Writes public/icons/*.png and public/favicon.svg.
"""
import math
import struct
import zlib
from pathlib import Path

ACCENT = (0x1F, 0x5F, 0xBF)
WHITE = (0xFF, 0xFF, 0xFF)
BAR_HEIGHTS = (0.36, 0.66, 1.0, 0.66, 0.36)  # relative to the tallest bar


def png_bytes(width, height, rgba_rows):
    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + bytes(row) for row in rgba_rows)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")


def coverage(distance):
    """Anti-aliased coverage from a signed distance (negative = inside)."""
    return max(0.0, min(1.0, 0.5 - distance))


def rounded_rect_sd(px, py, cx, cy, half_w, half_h, radius):
    qx = abs(px - cx) - (half_w - radius)
    qy = abs(py - cy) - (half_h - radius)
    outside = math.hypot(max(qx, 0.0), max(qy, 0.0))
    inside = min(max(qx, qy), 0.0)
    return outside + inside - radius


def bars(size, box):
    """Bar capsules as (cx, top, bottom, radius), centred in a box of `box` pixels."""
    bar_w = 0.1 * box
    gap = 0.07 * box
    total_w = len(BAR_HEIGHTS) * bar_w + (len(BAR_HEIGHTS) - 1) * gap
    left = (size - total_w) / 2
    tallest = 0.9 * box
    out = []
    for i, h in enumerate(BAR_HEIGHTS):
        cx = left + bar_w / 2 + i * (bar_w + gap)
        half = tallest * h / 2
        r = bar_w / 2
        out.append((cx, size / 2 - half + r, size / 2 + half - r, r))
    return out


def capsule_sd(px, py, cx, top, bottom, r):
    y = min(max(py, top), bottom)
    return math.hypot(px - cx, py - y) - r


def render(size, *, full_bleed, content_ratio):
    caps = bars(size, content_ratio * size)
    corner = 0.0 if full_bleed else 0.22 * size
    rows = []
    for y in range(size):
        row = []
        py = y + 0.5
        for x in range(size):
            px = x + 0.5
            bg = 1.0 if full_bleed else coverage(rounded_rect_sd(px, py, size / 2, size / 2, size / 2, size / 2, corner))
            fg = 0.0
            for cx, top, bottom, r in caps:
                fg = max(fg, coverage(capsule_sd(px, py, cx, top, bottom, r)))
            rgb = tuple(round(a * (1 - fg) + b * fg) for a, b in zip(ACCENT, WHITE))
            row.extend((*rgb, round(255 * bg)))
        rows.append(row)
    return png_bytes(size, size, rows)


def favicon_svg():
    size = 64
    rects = []
    for cx, top, bottom, r in bars(size, 0.62 * size):
        rects.append(
            f'<rect x="{cx - r:.2f}" y="{top - r:.2f}" width="{2 * r:.2f}" height="{bottom - top + 2 * r:.2f}" rx="{r:.2f}" fill="#fff"/>'
        )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" rx="{0.22 * size:.2f}" fill="#1f5fbf"/>'
        + "".join(rects)
        + "</svg>\n"
    )


def main():
    root = Path(__file__).resolve().parent.parent / "public"
    icons = root / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    # "any" icons: rounded square. Maskable and Apple icons: full bleed, content inside the safe zone.
    (icons / "icon-192.png").write_bytes(render(192, full_bleed=False, content_ratio=0.62))
    (icons / "icon-512.png").write_bytes(render(512, full_bleed=False, content_ratio=0.62))
    (icons / "maskable-512.png").write_bytes(render(512, full_bleed=True, content_ratio=0.5))
    (root / "apple-touch-icon.png").write_bytes(render(180, full_bleed=True, content_ratio=0.56))
    (root / "favicon.svg").write_text(favicon_svg())


if __name__ == "__main__":
    main()
