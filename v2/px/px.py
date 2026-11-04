# 후와 도트 — 도형으로 칠하고 자동 외곽선. python px.py → out/*.png (원본 크기 + 확대 미리보기)
import math, os
from PIL import Image
PAL = {
 'K': (42, 34, 30), 'D': (92, 85, 81), 'G': (138, 131, 126), 'L': (180, 173, 167), 'C': (226, 216, 203),
 'W': (246, 240, 232), 'A': (226, 168, 58), 'a': (168, 116, 31), 'B': (26, 21, 19), 'P': (222, 142, 142),
 'p': (176, 104, 104), 'Y': (246, 211, 107), 'O': (233, 115, 79), 'S': (205, 196, 186), 'w': (255, 255, 255),
 'Z': (231, 176, 74),
}
class Cv:
    def __init__(s, w, h): s.w, s.h = w, h; s.g = [[None]*w for _ in range(h)]
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = c
    def get(s, x, y): return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else None
    def ell(s, cx, cy, rx, ry, c, cond=None):
        for y in range(s.h):
            for x in range(s.w):
                if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1 and (cond is None or cond(x, y)): s.px(x, y, c)
    def poly(s, pts, c):
        for y in range(s.h):
            for x in range(s.w):
                X, Y = x + .5, y + .5; ins = False; j = len(pts) - 1
                for i in range(len(pts)):
                    xi, yi = pts[i]; xj, yj = pts[j]
                    if (yi > Y) != (yj > Y) and X < (xj - xi) * (Y - yi) / (yj - yi) + xi: ins = not ins
                    j = i
                if ins: s.px(x, y, c)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.px(x, y, c)
    def put(s, rows, ox, oy):  # 문자 격자 덮어쓰기('.'은 건너뜀)
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch != '.': s.px(ox + i, oy + j, ch)
    def outline(s, c='K', skip=('w','Y','O','Z')):
        add = []
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x] is None and any(s.get(x+dx, y+dy) not in (None, c) and s.get(x+dx, y+dy) not in skip
                                             for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))): add.append((x, y))
        for x, y in add: s.px(x, y, c)
    def img(s):
        im = Image.new('RGBA', (s.w, s.h), (0, 0, 0, 0))
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x]: im.putpixel((x, y), PAL[s.g[y][x]] + (255,))
        return im

def fur_edge(cv, cx, cy, rx, ry, c, n, amp, seed=0):
    # 둘레에 털 뭉치(작은 삼각형)를 붙여 폭신한 실루엣
    for k in range(n):
        t = 2 * math.pi * (k + .5) / n + seed
        x, y = cx + rx * math.cos(t), cy + ry * math.sin(t)
        nx, ny = math.cos(t), math.sin(t)
        tx, ty = -ny, nx
        cv.poly([(x + tx*2.2 - nx*.8, y + ty*2.2 - ny*.8), (x + nx*amp + tx*.4, y + ny*amp + ty*.4), (x - tx*2.2 - nx*.8, y - ty*2.2 - ny*.8)], c)

def shade(cv, cx, cy, rx, ry, base, hi, lo):
    for y in range(cv.h):
        for x in range(cv.w):
            if cv.g[y][x] != base: continue
            dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            if dx * dx + dy * dy > 1.6: continue
            if -.5 * dx - .87 * dy > .84 and dx * dx + dy * dy < .95: cv.g[y][x] = hi
            elif .35 * dx + .95 * dy > .72: cv.g[y][x] = lo

def head(cv, cx, cy, mood='stern'):
    # 귀: 작고 넓게(페르시안)
    for side in (-1, 1):
        ex = cx + side * 8
        cv.poly([(ex - side*3.4, cy - 6.8), (ex + side*1.2, cy - 11.2), (ex + side*3.8, cy - 5.6)], 'G')
        cv.poly([(ex - side*1.0, cy - 7.4), (ex + side*1.0, cy - 9.6), (ex + side*2.0, cy - 6.8)], 'P')
    fur_edge(cv, cx, cy + .6, 12.0, 9.4, 'G', 16, 1.5)
    cv.ell(cx, cy, 12.5, 10, 'G')
    shade(cv, cx, cy, 12.5, 10, 'G', 'L', 'D')
    # 이마 M 무늬(은은하게)
    x0 = int(cx - .5); y0 = int(cy - 8)
    cv.put(["D...D", ".D.D.", "..D.."], x0 - 2, y0)
    # 볼·입가
    cv.ell(cx, cy + 5.0, 7.2, 4.4, 'L')
    cv.ell(cx, cy + 6.0, 4.6, 3.0, 'C')
    if mood == 'stern':
        cv.put(["KK....", ".KKKKK", ".KAABa", ".aABAa", "..aaa."], x0 - 9, int(cy - 2))
        cv.put(["....KK", "KKKKK.", "aBAAK.", "aABAa.", ".aaa.."], x0 + 4, int(cy - 2))
    elif mood == 'sleep':
        cv.put(["K...K", ".KKK."], x0 - 8, int(cy))
        cv.put(["K...K", ".KKK."], x0 + 4, int(cy))
    elif mood == 'happy':
        cv.put([".KKK.", "K...K"], x0 - 8, int(cy))
        cv.put([".KKK.", "K...K"], x0 + 4, int(cy))
    cv.put(["PP", "pp"], x0, int(cy + 3))
    if mood == 'stern': cv.put([".K.K.", "K...K"], x0 - 1, int(cy + 5))
    elif mood == 'happy': cv.put(["K..K", ".KK."], x0 - 1, int(cy + 5))
    else: cv.put([".KK."], x0 - 1, int(cy + 5))

def whiskers(cv, cx, cy):
    for side in (-1, 1):
        for k, dy in enumerate((-1, 1)):
            for i in range(4):
                cv.px(int(cx + side * (9.5 + i)), int(cy + 4 + dy + (i // 2) * dy), 'w')

def sprite_face():
    cv = Cv(32, 32)
    fur_edge(cv, 16, 28, 11, 5, 'C', 10, 1.3, .3)   # 가슴털
    cv.ell(16, 28, 11, 5.5, 'C')
    head(cv, 16, 16.5, 'stern')
    cv.outline()
    whiskers(cv, 16, 16.5)
    return cv

def loaf(mood, zframe=None):
    cv = Cv(32, 32)
    fur_edge(cv, 16, 24.5, 13.8, 5.8, 'G', 14, 1.4, .2)
    cv.ell(16, 24.5, 14.5, 6.5, 'G')
    shade(cv, 16, 24.5, 14.5, 6.5, 'G', 'L', 'D')
    cv.ell(16, 25.5, 8.5, 4.2, 'S')                  # 가슴
    cv.ell(16, 25, 6, 3, 'C')
    for px_ in (11, 21):                               # 앞발
        cv.ell(px_, 30, 2.8, 1.7, 'C'); cv.px(px_ - 1, 30, 'S'); cv.px(px_ + 1, 30, 'S')
    head(cv, 16, 14.5, mood)
    cv.outline()
    whiskers(cv, 16, 14.5)
    return cv

def zzz(cv, f):
    Z = ["ZZZZ", "..Z.", ".Z..", "ZZZZ"]
    if f == 0: cv.put(Z, 27, 3); cv.px(25, 8, 'Z')
    else: cv.put(Z, 27, 1); cv.px(25, 6, 'Z'); cv.px(24, 9, 'Z')

def churu_face(f):
    cv = Cv(40, 32)
    fur_edge(cv, 16, 28, 11, 5, 'C', 10, 1.3, .3)
    cv.ell(16, 28, 11, 5.5, 'C')
    head(cv, 16, 16.5, 'happy')
    cv.outline()
    whiskers(cv, 16, 16.5)
    # 츄르 스틱(오른쪽 아래에서 입가로)
    sx = 19 if f == 0 else 20
    for i in range(19):
        x = sx + i; y0 = 22 + i // 5
        cv.rect(x, y0, x, y0 + 2, 'O' if i >= 14 else 'Y')
    cv.rect(sx - 1, 22, sx - 1, 23, 'Y')
    for i in range(19):
        x = sx + i; y0 = 22 + i // 5
        if cv.get(x, y0 - 1) is None: cv.px(x, y0 - 1, 'K')
        if cv.get(x, y0 + 3) is None: cv.px(x, y0 + 3, 'K')
    if f == 1: cv.put(["P", "P"], 17, 22)          # 혀 날름
    return cv

def save(name, frames, scale=10):
    os.makedirs('out', exist_ok=True)
    ims = [f.img() for f in frames]
    w, h = ims[0].size
    sheet = Image.new('RGBA', (w * len(ims), h)); [sheet.paste(im, (i * w, 0)) for i, im in enumerate(ims)]
    sheet.save(f'out/{name}.png')
    big = sheet.resize((sheet.width * scale, sheet.height * scale), Image.NEAREST)
    bg = Image.new('RGBA', big.size, (238, 230, 218, 255)); bg.alpha_composite(big); bg.convert('RGB').save(f'out/{name}_x{scale}.png')
    if len(ims) > 1:
        g = [im.resize((w * 8, h * 8), Image.NEAREST) for im in ims]
        g[0].save(f'out/{name}.gif', save_all=True, append_images=g[1:], duration=420, loop=0, disposal=2)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    save('face', [sprite_face()])
    l0 = loaf('sleep'); zzz(l0, 0); l1 = loaf('sleep'); zzz(l1, 1)
    save('loaf', [l0, l1])
    save('churu', [churu_face(0), churu_face(1)])
    print('ok')
