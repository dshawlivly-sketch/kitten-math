"""Slice the character reference sheets in art-source/ into transparent sprites.

Usage: python3 tools/slice_sprites.py [--debug]
Outputs assets/sprites/<character>/<name>.webp (2x upscaled, transparent background).
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-source')
OUT = os.path.join(ROOT, 'assets', 'sprites')
SCALE = 2

# Names for each row of each sheet, left to right.
TURN = ['turn_front', 'turn_right', 'turn_back', 'turn_left']
CELE = ['cele1', 'cele2', 'cele3', 'cele4', 'cele5', 'cele6']
STAT = ['trophy_front', 'trophy_right', 'trophy_back', 'trophy_left']
POSES = ['idle', 'talk', 'point', 'think', 'read', 'cheer', 'present', 'victory', 'oops']
SHEETS = {
    'hero': dict(expr=[['neutral', 'happy', 'excited', 'thinking', 'surprised'],
                       ['confident', 'wink', 'worried', 'curious', 'laughing']], poses=POSES),
    'axolotl': dict(expr=[['neutral', 'happy', 'excited', 'thinking', 'surprised'],
                          ['confident', 'worried', 'curious', 'wink', 'laughing']], poses=POSES),
    'kitten': dict(expr=[['neutral', 'happy', 'excited', 'thinking', 'surprised'],
                         ['confident', 'worried', 'curious', 'wink', 'laughing']], poses=POSES),
    'llama': dict(expr=[['neutral', 'happy', 'excited', 'thinking'],
                        ['surprised', 'confident', 'worried', 'wink']], poses=POSES),
    'coach': dict(expr=[['neutral', 'happy', 'excited', 'thinking', 'surprised'],
                        ['confident', 'wink', 'helpful', 'encouraging', 'concerned']],
                  poses=['idle', 'talk', 'point', 'think', 'read', 'explain', 'present',
                         'cheer', 'victory', 'oops']),
}


def analyse(name):
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGB')
    a = np.asarray(im).astype(np.int32)
    # background estimate: quadratic surface fitted to the grey backdrop pixels
    H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    xn, yn = xx / W - 0.5, yy / H - 0.5
    basis = np.stack([np.ones_like(xn), xn, yn, xn * xn, yn * yn, xn * yn], axis=-1)
    val = a.mean(axis=2)
    sat0 = a.max(axis=2) - a.min(axis=2)
    m = (sat0 < 14) & (val > 95) & (val < 145)
    bg = np.zeros_like(a, dtype=np.float64)
    for _ in range(2):
        B = basis[m][::7]
        for c in range(3):
            coef, *_ = np.linalg.lstsq(B, a[..., c][m][::7].astype(np.float64), rcond=None)
            bg[..., c] = basis @ coef
        m = m & (np.abs(a - bg).max(axis=2) < 9)
    bg = bg.astype(np.int32)
    diff = np.abs(a - bg).max(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)
    return im, a, diff, sat


def components(a, diff, sat):
    """Find character blobs: big connected non-background regions with real colour."""
    lab, n = ndi.label(diff > 26)
    boxes = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = lab[sl] == i
        area = int(m.sum())
        h, w = m.shape
        if area < 1500 or h < 50:
            continue
        if area / (h * w) < 0.25:           # thin frame lines
            continue
        colourful = (sat[sl][m] > 45).mean()
        if colourful < 0.12:                 # label pills / text
            continue
        boxes.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, i))
    return lab, boxes


def cut(a, diff, lab, box, pad=7):
    x0, y0, x1, y1, i = box
    H, W = diff.shape
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    d = diff[y0:y1, x0:x1]
    keep = lab[y0:y1, x0:x1] == i
    keep = ndi.binary_dilation(keep, iterations=3)
    # background = pixels very close to the backdrop colour that are reachable from the
    # crop border. Opening the mask stops the fill leaking through thin gaps into grey
    # parts of the character (cap brims, grey hair).
    low = ndi.binary_opening(d < 15, iterations=1)
    seeds = np.zeros_like(low)
    seeds[0, :] = seeds[-1, :] = seeds[:, 0] = seeds[:, -1] = True
    outside = ndi.binary_propagation(seeds & (low | ~keep), mask=(low | ~keep))
    # then nibble at most 2px of anti-aliased halo off the silhouette
    for _ in range(2):
        outside |= ndi.binary_dilation(outside) & (d < 34)
    # shave one more pixel and feather, so no speckled rim is left on coloured backgrounds
    alpha = ndi.minimum_filter(np.where(outside, 0.0, 1.0), size=3)
    alpha = np.clip(ndi.gaussian_filter(alpha, 0.8) * 1.15, 0, 1)
    alpha[outside] = 0
    rgba = np.dstack([a[y0:y1, x0:x1], (alpha * 255)]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
    return im


def rows(boxes):
    """Group boxes into rows by vertical centre."""
    boxes = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    out, cur = [], [boxes[0]]
    for b in boxes[1:]:
        c = (b[1] + b[3]) / 2
        pc = np.mean([(q[1] + q[3]) / 2 for q in cur])
        if abs(c - pc) < 70:
            cur.append(b)
        else:
            out.append(sorted(cur)); cur = [b]
    out.append(sorted(cur))
    return out


def main():
    debug = '--debug' in sys.argv
    for name, cfg in SHEETS.items():
        im, a, diff, sat = analyse(name)
        lab, boxes = components(a, diff, sat)
        # the big showcase render (top-left) is the largest blob
        big = max(boxes, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
        rest = [b for b in boxes if b is not big]
        rs = rows(rest)
        names = []
        top = [b for r in rs for b in r if (b[1] + b[3]) / 2 < 360]
        tall = lambda b: b[3] - b[1] > 120      # drops stray speech bubbles etc.
        mid = sorted([b for r in rs for b in r if 360 <= (b[1] + b[3]) / 2 < 700 and tall(b)])
        bot = sorted([b for r in rs for b in r if (b[1] + b[3]) / 2 >= 700 and tall(b)])
        turn = sorted([b for b in top if b[3] - b[1] > 150])
        expr = [b for b in top if b[3] - b[1] <= 150]
        erows = rows(expr) if expr else []
        plan = [('showcase', big)]
        plan += list(zip(TURN, turn))
        for rn, r in zip(cfg['expr'], erows):
            plan += [('face_' + n, b) for n, b in zip(rn, r)]
        plan += list(zip(cfg['poses'], mid))
        plan += list(zip(CELE + STAT, bot))
        print(name, 'turn', len(turn), 'expr', [len(r) for r in erows], 'mid', len(mid), 'bot', len(bot))
        d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
        for n, b in plan:
            cut(a, diff, lab, b).save(os.path.join(d, n + '.webp'), quality=90, method=6)
        if debug:
            dbg = im.copy(); dr = ImageDraw.Draw(dbg)
            for n, b in plan:
                dr.rectangle(b[:4], outline=(255, 0, 0)); dr.text((b[0] + 2, b[1] + 2), n, fill=(255, 255, 0))
            dbg.save(os.path.join(sys.argv[sys.argv.index('--debug') + 1], name + '_dbg.png'))


if __name__ == '__main__':
    main()
