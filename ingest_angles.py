"""INGEST for genuine AI-generated intermediate turntable views (part 1/2).

Drop 32 externally generated angle_XXX.png files into incoming_angles/
(384x512, same identity/framing/lighting as the 8 masters), then run:
    python ingest_angles.py
NO warping, NO blending, NO optical flow, NO pixel interpolation here.
See part 2 (main) below.
"""
import os
import shutil
import sys

from PIL import Image, ImageFilter

CELL_W, CELL_H, COLS, ROWS = 384, 512, 6, 7
INCOMING = 'incoming_angles'
FRAMES = 'public/frames'
SPRITE = 'public/spritesheet/turntable_spritesheet.webp'

MISSING = [10, 20, 30, 40, 50, 60, 70, 80,
           100, 110, 120, 130, 140, 150, 160, 170,
           190, 200, 210, 220, 230, 240, 250, 260,
           280, 290, 300, 310, 320, 330, 340, 350]

MASTERS = {0: 'angle_000', 45: 'angle_045', 90: 'angle_090',
           135: 'angle_135', 180: 'angle_180', 225: 'angle_225',
           270: 'angle_270', 315: 'angle_315'}
ANCHOR_DEGS = sorted(MASTERS)


def neighbors(angle):
    lo = max([a for a in ANCHOR_DEGS if a <= angle], default=0)
    hi_c = [a for a in ANCHOR_DEGS if a > angle]
    hi = min(hi_c) if hi_c else 360
    lo_img = Image.open(f'extracted_angles/{MASTERS[lo]}.png').convert('RGB')
    hi_img = (Image.open('extracted_angles/angle_000.png').convert('RGB')
              if hi == 360 else
              Image.open(f'extracted_angles/{MASTERS[hi]}.png').convert('RGB'))
    return lo_img, hi_img


def sharpness(img):
    g = img.convert('L').filter(ImageFilter.FIND_EDGES)
    px = list(g.getdata())
    mean = sum(px) / len(px)
    return sum((p - mean) ** 2 for p in px) / len(px)


def edge_map(img, size=(96, 128)):
    return img.convert('L').resize(size).filter(ImageFilter.FIND_EDGES)


def edge_dist(a, b):
    da, db = list(edge_map(a).getdata()), list(edge_map(b).getdata())
    return sum(abs(x - y) for x, y in zip(da, db)) / len(da)


def quadrant_means(img):
    w, h = img.size
    q = [img.crop((0, 0, w // 2, h // 2)), img.crop((w // 2, 0, w, h // 2)),
         img.crop((0, h // 2, w // 2, h)), img.crop((w // 2, h // 2, w, h))]
    out = []
    for c in q:
        px = list(c.resize((8, 8)).getdata())
        n = len(px)
        out.append((sum(p[0] for p in px) / n,
                    sum(p[1] for p in px) / n,
                    sum(p[2] for p in px) / n))
    return out


def quad_dist(a, b):
    qa, qb = quadrant_means(a), quadrant_means(b)
    return sum(abs(x - y) + abs(u - v) + abs(s - t)
               for (x, u, s), (y, v, t) in zip(qa, qb)) / 4


def main():
    skip_sharp = '--skip-sharp' in sys.argv
    force = '--force' in sys.argv
    os.makedirs(INCOMING, exist_ok=True)

    absent = [a for a in MISSING
              if not os.path.exists(f'{INCOMING}/angle_{a:03d}.png')]
    if absent:
        print('AWAITING-GENUINE-ANGLES:', ' '.join(f'{a:03d}' for a in absent))
        print(f'Place {len(absent)} file(s) in {INCOMING}/ then re-run.')
        print('Hero stays on the 8 genuine anchors (no changes made).')
        return 2

    failures, staged = [], {}
    for angle in MISSING:
        cand = Image.open(f'{INCOMING}/angle_{angle:03d}.png').convert('RGB')
        if cand.size != (CELL_W, CELL_H):
            failures.append(f'angle_{angle:03d}: size {cand.size}')
            continue
        lo_img, hi_img = neighbors(angle)
        gap = edge_dist(lo_img, hi_img)
        d_lo, d_hi = edge_dist(cand, lo_img), edge_dist(cand, hi_img)
        if min(d_lo, d_hi) > 0.85 * gap and not force:
            failures.append(f'angle_{angle:03d}: equidistant to both '
                            f'anchors (blend/warp suspect) {d_lo:.1f} '
                            f'{d_hi:.1f} gap {gap:.1f}')
            continue
        q_gap = quad_dist(lo_img, hi_img)
        q_lo, q_hi = quad_dist(cand, lo_img), quad_dist(cand, hi_img)
        if min(q_lo, q_hi) > 1.5 * q_gap + 6.0 and not force:
            failures.append(f'angle_{angle:03d}: identity/lighting drift')
            continue
        if not skip_sharp:
            s_c = sharpness(cand)
            s_f = min(sharpness(lo_img), sharpness(hi_img)) * 0.55
            if s_c < s_f and not force:
                failures.append(f'angle_{angle:03d}: smeared/soft')
                continue
        staged[angle] = True
        print(f'angle_{angle:03d}: QC pass ({d_lo:.1f}/{d_hi:.1f}/{gap:.1f})')

    if failures:
        print(f'QC FAILED ({len(failures)}):')
        for f in failures:
            print('  -', f)
        print('No frames touched.')
        return 1

    for angle in staged:
        shutil.copyfile(f'{INCOMING}/angle_{angle:03d}.png',
                        f'{FRAMES}/frame_{angle // 10:03d}.png')
    master0 = open('extracted_angles/angle_000.png', 'rb').read()
    open(f'{FRAMES}/frame_000.png', 'wb').write(master0)
    open(f'{FRAMES}/frame_036.png', 'wb').write(master0)

    sheet = Image.new('RGB', (CELL_W * COLS, CELL_H * ROWS))
    for i in range(37):
        f = Image.open(f'{FRAMES}/frame_{i:03d}.png').convert('RGB')
        assert f.size == (CELL_W, CELL_H), f'slot {i} size {f.size}'
        sheet.paste(f, ((i % COLS) * CELL_W, (i // COLS) * CELL_H))
    sheet.save(SPRITE, 'WEBP', quality=92, method=6)
    print('sprite rebuilt:', sheet.size)

    frames = [Image.open(f'{FRAMES}/frame_{i:03d}.png').convert('RGB')
              for i in range(37)]
    contact = Image.new('RGB', (CELL_W * COLS, CELL_H * ROWS), 'white')
    for i, f in enumerate(frames):
        contact.paste(f, ((i % COLS) * CELL_W, (i // COLS) * CELL_H))
    contact.save('contact_sheet_360.png')
    small = [f.resize((192, 256)) for f in frames]
    small[0].save('turntable_preview.gif', save_all=True,
                  append_images=small[1:], duration=140, loop=0)
    a = open(f'{FRAMES}/frame_000.png', 'rb').read()
    b = open(f'{FRAMES}/frame_036.png', 'rb').read()
    print('frame_000 === frame_036 bytes:', a == b)
    print(f'INGEST COMPLETE: {len(staged)} intermediates + sprite + proofs.')
    print('Next: npm run typecheck && npm run build && npm run dev.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
