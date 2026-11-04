// fuwa.dad/v2 — 후와의 폭신한 10년. GSAP + ScrollTrigger, 나머지는 손으로.
(() => {
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap || !window.ScrollTrigger;
const FINE = matchMedia("(pointer: fine)").matches;
if (RM) document.documentElement.classList.add("rm");
else gsap.registerPlugin(ScrollTrigger);

const fmt = (d) => `${d.slice(0, 4)}. ${+d.slice(4, 6)}. ${+d.slice(6, 8)}.`;
const YEAR_NOTE = { 2016: "아기 후와", 2017: "솜뭉치 시절", 2020: "털이 폭발하기 시작", 2021: "근엄한 표정 완성",
  2022: "낮잠 장인", 2023: "창가 지킴이", 2024: "츄르 감별사", 2025: "턱시도 친구 등장", 2026: "올해로 열 살" };

/* ---------- 첫 화면 사진: 화면 비율에 맞춰 고르고, 얼굴 위치에 둥근 창을 둔다 ---------- */
const HERO = {
  wide: { src: "/img/l/20210719-174.webp", w: 1600, h: 1200, fx: 0.70, fy: 0.31 },
  tall: { src: "/img/l/20250816-540.webp", w: 1200, h: 1600, fx: 0.54, fy: 0.30 },
};
const hero = $("#hero"), photo = $("#heroPhoto");
let H = innerWidth / innerHeight < 0.8 ? HERO.tall : HERO.wide;
photo.src = H.src;
hero.classList.toggle("wide", H === HERO.wide);

function geom() {
  const W = hero.clientWidth, Hh = hero.clientHeight;
  const s = Math.max(W / H.w, Hh / H.h), dw = H.w * s, dh = H.h * s;
  const cx = (W - dw) / 2 + H.fx * dw, cy = (Hh - dh) / 2 + H.fy * dh;
  const r0 = Math.min(W, Hh) * (W < 700 ? 0.27 : 0.2);
  const rMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, Hh - cy)) * 1.05;
  return { cx, cy, r0, rMax };
}
function placeOrb() {
  const g = geom();
  photo.style.setProperty("--cx", g.cx + "px");
  photo.style.setProperty("--cy", g.cy + "px");
  if (!hero.classList.contains("opened")) photo.style.setProperty("--r", g.r0 + "px");
  return g;
}
placeOrb();

/* ---------- 털뭉치 ---------- */
const cv = $("#fluff"), ctx = cv.getContext("2d");
let parts = [], ptr = { x: -9999, y: -9999 }, fluffOn = true, DPR = Math.min(devicePixelRatio || 1, 2);
const sprite = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(246,238,228,.9)"); gr.addColorStop(.35, "rgba(232,220,206,.35)"); gr.addColorStop(1, "rgba(232,220,206,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
})();
function sizeCanvas() {
  cv.width = hero.clientWidth * DPR; cv.height = hero.clientHeight * DPR;
  const n = Math.round(Math.min(110, hero.clientWidth * hero.clientHeight / 9000));
  parts = Array.from({ length: n }, () => newPart(true));
}
function newPart(anywhere) {
  const W = cv.width, Hh = cv.height;
  return { x: Math.random() * W, y: anywhere ? Math.random() * Hh : Hh + 20, r: (4 + Math.random() * 16) * DPR,
    vy: -(0.12 + Math.random() * 0.45) * DPR, ph: Math.random() * 6.28, sw: 0.3 + Math.random() * 0.8,
    a: 0.15 + Math.random() * 0.5, vx: 0, kx: 0, ky: 0 };
}
function tick(t) {
  if (fluffOn) {
    const W = cv.width, Hh = cv.height;
    ctx.clearRect(0, 0, W, Hh);
    for (const p of parts) {
      const dx = p.x - ptr.x * DPR, dy = p.y - ptr.y * DPR, d2 = dx * dx + dy * dy, R = 130 * DPR;
      if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 2.2; p.kx += dx / d * f; p.ky += dy / d * f; }
      p.kx *= 0.93; p.ky *= 0.93;
      p.x += Math.sin(t / 1400 + p.ph) * p.sw * 0.5 + p.kx; p.y += p.vy + p.ky;
      if (p.y < -30 || p.x < -40 || p.x > W + 40) Object.assign(p, newPart(false));
      ctx.globalAlpha = p.a; ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
  }
  requestAnimationFrame(tick);
}
sizeCanvas();
if (!RM) requestAnimationFrame(tick);
hero.addEventListener("pointermove", (e) => { const b = hero.getBoundingClientRect(); ptr = { x: e.clientX - b.left, y: e.clientY - b.top }; });
hero.addEventListener("pointerleave", () => { ptr = { x: -9999, y: -9999 }; });
new IntersectionObserver(([e]) => { fluffOn = e.isIntersecting; }).observe(hero);

/* ---------- 로딩 → 등장 ---------- */
function typeSub() {
  const el = $("#sub"), txt = el.dataset.text; let i = 0;
  if (RM) { el.textContent = txt; return; }
  const step = () => { el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(step, 55 + Math.random() * 60); };
  setTimeout(step, 300);
}
function intro() {
  document.body.classList.remove("loading");
  if (RM) { $$(".kana span, .title span").forEach((s) => (s.style.opacity = 1)); typeSub(); return; }
  gsap.timeline({ delay: 0.25 })
    .fromTo(photo, { "--r": "0px" }, { "--r": () => placeOrb().r0 + "px", duration: 1.6, ease: "expo.out" }, 0)
    .fromTo(".kana span", { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" }, 0.5)
    .fromTo(".title span", { opacity: 0, y: 70, filter: "blur(14px)", rotate: (i) => (i ? 8 : -8) },
      { opacity: 1, y: 0, filter: "blur(0px)", rotate: 0, stagger: 0.16, duration: 1.3, ease: "expo.out" }, 0.6)
    .add(typeSub, 1.3);
}
let started = false;
const go = () => { if (!started) { started = true; intro(); } };
if (photo.complete) setTimeout(go, 400); else { photo.onload = () => setTimeout(go, 300); setTimeout(go, 3500); }

/* ---------- 비교 슬라이더 ---------- */
const cmp = $("#compare"), handle = $("#handle");
let wiggle = null, touched = false;
function setPos(v) {
  v = Math.max(0, Math.min(100, v));
  cmp.style.setProperty("--pos", v + "%"); handle.setAttribute("aria-valuenow", Math.round(v));
}
let dragging = false;
const fromEvent = (e) => { const b = cmp.getBoundingClientRect(); setPos(((e.clientX - b.left) / b.width) * 100); };
cmp.addEventListener("pointerdown", (e) => { dragging = touched = true; wiggle?.kill(); cmp.setPointerCapture(e.pointerId); fromEvent(e); });
cmp.addEventListener("pointermove", (e) => dragging && fromEvent(e));
cmp.addEventListener("pointerup", () => (dragging = false));
cmp.addEventListener("pointercancel", () => (dragging = false));
handle.addEventListener("keydown", (e) => {
  const v = parseFloat(cmp.style.getPropertyValue("--pos")) || 50;
  if (e.key === "ArrowLeft") setPos(v - 5);
  if (e.key === "ArrowRight") setPos(v + 5);
});

/* ---------- 이미지 늦게 불러오기 ----------
   loading="lazy" 는 사파리가 transform 으로 움직이는 줄(사진 벽·가로 연표) 안 사진을 화면 밖으로 보고 끝내 안 불러온다.
   그래서 구역 단위로 지켜보다가 가까워지면 그 안의 사진을 한꺼번에 불러온다. */
function later(root, margin = "900px") {
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) {
      for (const i of $$("img[data-src]", e.target)) { i.src = i.dataset.src; i.removeAttribute("data-src"); }
      io.unobserve(e.target);
    }
  }, { rootMargin: margin });
  io.observe(root);
}

/* ---------- 캐릭터 후와 ---------- */
const CHARA = [
  ["00-standing-grumpy", "근엄 모드", "기본값. 사진 찍지 마라."],
  ["02-sit", "정자세", "꼬리까지 단정하게."],
  ["03-loaf", "식빵", "지금 구워지는 중."],
  ["04-sleep", "꿀잠", "깨우면 더 근엄해짐."],
  ["05-paw-reach", "손!", "츄르가 보이면 줌."],
  ["08-groom", "그루밍", "털 관리가 곧 업무."],
  ["11-door-scratch", "문 열어", "닫힌 문은 용서 못 함."],
  ["07-stretch", "기지개", "하루에 열두 번."],
  ["09-play", "사냥 자세", "엉덩이 흔들기 3초 전."],
  ["06-peek", "감시 중", "뭐 하는지 다 보고 있음."],
  ["01-standing-friendly", "기분 좋은 날", "가끔은 다정함. 가끔."],
  ["10-side-idle", "옆모습", "귀족의 실루엣."],
];
const SAY = ["냥.", "…뭐.", "츄르는?", "쓰다듬어도 됨.", "사진 그만.", "흥.", "배고프다.", "나 불렀냐."];
const charas = $("#charas");
for (const [k, name, line] of CHARA) {
  const f = document.createElement("figure"); f.className = "chara"; f.tabIndex = 0;
  f.setAttribute("role", "button"); f.setAttribute("aria-label", `${name} — ${line}`);
  f.innerHTML = `<div class="spot"><picture><source srcset="/v2/chara/${k}-still.webp" media="(prefers-reduced-motion: reduce)">` +
    `<img data-src="/v2/chara/${k}.webp" alt="" width="480" height="480" decoding="async"></picture></div><i class="say"></i>` +
    `<figcaption><b>${name}</b><span>${line}</span></figcaption>`;
  let t;
  const poke = () => {
    const say = $(".say", f); let w; do w = SAY[Math.random() * SAY.length | 0]; while (w === say.textContent && SAY.length > 1);
    say.textContent = w; f.classList.remove("hop"); void f.offsetWidth; f.classList.add("hop", "talk");
    clearTimeout(t); t = setTimeout(() => f.classList.remove("talk"), 1600);
  };
  f.addEventListener("click", poke);
  f.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); } });
  charas.append(f);
}
later(charas);

/* ---------- 데이터 ---------- */
fetch("/photos.json").then((r) => r.json()).then((list) => {
  const all = list.slice().sort((a, b) => a.d.localeCompare(b.d));
  buildYears(all); later($("#years"));
  buildWall(all);
  if (!RM) scrollFx();
  else $$(".stat b").forEach((b) => (b.textContent = b.dataset.count));
});

function byYear(all) {
  const m = new Map();
  for (const p of all) { const y = p.d.slice(0, 4); (m.get(y) || m.set(y, []).get(y)).push(p); }
  return m;
}
function buildYears(all) {
  const track = $("#track"), ticks = $("#ticks");
  for (const [y, ps] of byYear(all)) {
    const feat = ps.filter((p) => p.p), rest = ps.filter((p) => !p.p);
    const pick = [...feat, ...rest].slice(0, 3);
    const sec = document.createElement("div");
    sec.className = "yr";
    sec.innerHTML = `<div class="yr-num">${y}</div><div class="stack"></div>
      <div class="yr-cap"><b>${y}</b><span>${YEAR_NOTE[y] || ""} · ${ps.length}장</span></div>`;
    const st = $(".stack", sec);
    for (const p of pick) {
      const b = document.createElement("button");
      b.className = "pol";
      b.innerHTML = `<img data-src="/img/t/${p.f}.webp" alt="${fmt(p.d)} 후와" decoding="async">`;
      b.onclick = () => openLB(p);
      st.append(b);
    }
    track.append(sec);
    const li = document.createElement("li"); li.textContent = y; ticks.append(li);
  }
}

function buildWall(all) {
  const wall = $("#wall");
  const shuffled = all.slice();
  for (let i = shuffled.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  for (let r = 0; r < 3; r++) {
    const row = document.createElement("div");
    row.className = "row" + (r % 2 ? " rev" : "");
    row.style.setProperty("--dur", `${70 + r * 18}s`);
    const set = shuffled.slice(r * 16, r * 16 + 16);
    for (const p of [...set, ...set]) {
      const b = document.createElement("button");
      b.innerHTML = `<img data-src="/img/t/${p.f}.webp" alt="${fmt(p.d)} 후와" decoding="async" width="${p.tw}" height="${p.th}">`;
      b.onclick = () => openLB(p);
      row.append(b);
    }
    wall.append(row);
  }
  later(wall);
}

/* ---------- 스크롤 연출 ---------- */
function scrollFx() {
  // 1) 둥근 창이 화면 전체로
  let g = placeOrb();
  const tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: "top top", end: "+=140%", pin: true, scrub: 0.6, invalidateOnRefresh: true,
      onEnter: () => hero.classList.add("opened"), onLeaveBack: () => hero.classList.remove("opened"),
      onRefresh: () => { g = placeOrb(); } },
  });
  tl.fromTo(photo, { "--r": () => g.r0 + "px" }, { "--r": () => g.rMax + "px", ease: "power2.inOut", duration: 1, immediateRender: false }, 0)
    .to("#heroCopy", { opacity: 0, y: -60, duration: 0.45 }, 0)
    .to("#cue", { opacity: 0, duration: 0.2 }, 0)
    .to("#fluff", { opacity: 0.35, duration: 0.8 }, 0)
    .to("#heroDim", { opacity: 1, duration: 0.4 }, 0.75)
    .fromTo("#revealLine", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.8)
    .to({}, { duration: 0.25 });

  // 2) 단어가 하나씩 켜진다
  const wp = $("#words");
  wp.innerHTML = wp.textContent.split(" ").map((w) => `<span class="w${/츄르|근엄|폭신/.test(w) ? " hl" : ""}">${w}</span>`).join(" ");
  gsap.to($$(".w", wp), { opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".intro", start: "top 75%", end: "bottom 65%", scrub: true } });

  // 3) 옆으로 흐르는 10년
  const track = $("#track"), panels = $$(".yr", track);
  const dist = () => track.scrollWidth - document.documentElement.clientWidth;
  const ht = gsap.to(track, { x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: "#years", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true } });
  gsap.to("#bar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: "#years", start: "top top", end: () => "+=" + dist(), scrub: true } });
  panels.forEach((p, i) => {
    gsap.fromTo($(".yr-num", p), { xPercent: 15 }, { xPercent: -15, ease: "none",
      scrollTrigger: { containerAnimation: ht, trigger: p, start: "left right", end: "right left", scrub: true } });
    gsap.from($$(".pol", p), { y: 120, opacity: 0, scale: 0.7, rotate: (k) => [-30, 20, 35][k], stagger: 0.12, duration: 0.9, ease: "back.out(1.6)",
      scrollTrigger: { containerAnimation: ht, trigger: p, start: i ? "left 65%" : "top 60%", toggleActions: "play none none reverse" } });
    gsap.from($(".yr-cap", p), { y: 30, opacity: 0, duration: 0.7,
      scrollTrigger: { containerAnimation: ht, trigger: p, start: i ? "left 55%" : "top 55%", toggleActions: "play none none reverse" } });
  });

  // 4) 비교 슬라이더 한 번 흔들어 보여주기
  const pos = { v: 50 };
  ScrollTrigger.create({ trigger: "#compare", start: "top 65%", once: true, onEnter: () => {
    if (touched) return;
    wiggle = gsap.timeline({ onUpdate: () => setPos(pos.v) })
      .to(pos, { v: 22, duration: 0.9, ease: "power2.inOut" }).to(pos, { v: 78, duration: 1.1, ease: "power2.inOut" })
      .to(pos, { v: 50, duration: 0.8, ease: "power2.inOut" });
  } });
  gsap.from(".compare", { y: 80, opacity: 0, rotate: -3, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".compare-sec", start: "top 70%" } });

  // 5) 숫자 올라가기
  $$(".stat b").forEach((b) => {
    const target = b.dataset.count;
    ScrollTrigger.create({ trigger: b, start: "top 85%", once: true, onEnter: () => {
      const o = { v: 0 }, end = target === "∞" ? 9999 : +target;
      gsap.to(o, { v: end, duration: target === "∞" ? 1.6 : 1.8, ease: target === "∞" ? "power2.in" : "power3.out",
        onUpdate: () => (b.textContent = Math.round(o.v).toLocaleString()),
        onComplete: () => { b.textContent = target; if (target === "∞") gsap.from(b, { scale: 1.6, duration: 0.6, ease: "back.out(3)" }); } });
    } });
  });

  // 6) 등장 효과 몇 개
  for (const s of [".churu-sec h2", ".wall-sec h2", ".compare-sec h2", ".churu-stage", ".chara-sec h2"])
    gsap.from(s, { y: 50, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 85%" } });

  gsap.from(".chara", { y: 70, opacity: 0, scale: .92, stagger: { each: 0.07, grid: "auto", from: "start" }, duration: 0.9, ease: "back.out(1.5)",
    scrollTrigger: { trigger: "#charas", start: "top 82%" } });

  // 7) 사진 벽: 스크롤 속도만큼 기울기
  const wall = $("#wall"); let sk = 0;
  ScrollTrigger.create({ onUpdate: (self) => {
    const v = gsap.utils.clamp(-12, 12, self.getVelocity() / -260);
    if (Math.abs(v) > Math.abs(sk)) { sk = v; gsap.to(wall, { "--skew": sk + "deg", duration: 0.25, overwrite: true,
      onComplete: () => { sk = 0; gsap.to(wall, { "--skew": "0deg", duration: 0.8, ease: "power3.out" }); } }); }
  } });
  addEventListener("resize", () => { DPR = Math.min(devicePixelRatio || 1, 2); sizeCanvas(); });
}

/* ---------- 츄르 ---------- */
const LINES = ["…한 개 더.", "이게 맞지.", "체면? 그게 뭔데", "츄르는 사랑이야", "더.", "아빠 최고 (츄르 줄 때만)", "냠냠냠냠"];
const stage = $("#stage"), bubble = $("#bubble"), stick = $("#stick"), countEl = $("#churuCount");
let churu = 0, feeding = false, timer = null;
try { churu = +localStorage.getItem("fuwa.churu") || 0; } catch {}
const showCount = () => (countEl.textContent = churu ? `지금까지 츄르 ${churu}개 받음` : "근엄한 표정이 풀리는지 보세요");
showCount();
$("#churuBtn").addEventListener("click", (e) => {
  churu++; try { localStorage.setItem("fuwa.churu", churu); } catch {}
  showCount();
  hearts(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  bubble.textContent = churu % 10 === 0 ? "츄르 과다 섭취 주의 ⚠️" : LINES[(Math.random() * LINES.length) | 0];
  bubble.classList.add("on");
  if (!RM) {
    gsap.fromTo(stick, { x: 0, opacity: 1 }, { x: () => -stage.clientWidth * 0.62, duration: 0.55, ease: "back.out(1.4)" });
    gsap.fromTo(stage, { rotate: 0 }, { rotate: 1.5, yoyo: true, repeat: 3, duration: 0.08, delay: 0.5 });
  }
  setTimeout(() => stage.classList.add("fed"), RM ? 0 : 450);
  clearTimeout(timer);
  timer = setTimeout(() => {
    stage.classList.remove("fed"); bubble.classList.remove("on");
    if (!RM) gsap.to(stick, { x: 0, opacity: 0, duration: 0.5 });
  }, 2600);
});
function hearts(x, y) {
  if (RM) return;
  const glyphs = ["♥", "♥", "♥", "✦"];
  for (let i = 0; i < 14; i++) {
    const h = document.createElement("span");
    h.className = "heart"; h.textContent = glyphs[i % 4];
    h.style.color = ["#e9734f", "#f6d36b", "#e7b04a", "#f3a4a4"][i % 4];
    h.style.left = x + "px"; h.style.top = y + "px";
    document.body.append(h);
    const a = Math.random() * Math.PI - Math.PI, d = 80 + Math.random() * 140;
    gsap.fromTo(h, { x: -10, y: -10, scale: 0.4, opacity: 1 },
      { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, scale: 0.8 + Math.random() * 0.9, rotate: Math.random() * 90 - 45, opacity: 0,
        duration: 1 + Math.random() * 0.6, ease: "power2.out", onComplete: () => h.remove() });
  }
}

/* ---------- 발자국 ---------- */
let last = null, side = 1, live = 0;
function paw(x, y, ang) {
  if (live > 40) return;
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 64 64"); s.classList.add("trail");
  s.innerHTML = '<use href="#paw"/>';
  const ox = Math.cos(ang + Math.PI / 2) * 9 * side, oy = Math.sin(ang + Math.PI / 2) * 9 * side;
  const rot = `rotate(${(ang * 180) / Math.PI + 90}deg)`;
  s.style.left = x + ox - 9 + "px"; s.style.top = y + oy - 9 + "px";
  s.style.transform = rot; s.style.setProperty("--t", rot);
  side *= -1; live++;
  s.addEventListener("animationend", () => { s.remove(); live--; });
  document.body.append(s);
}
if (!RM) {
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    if (!last) { last = { x: e.clientX, y: e.clientY }; return; }
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    if (dx * dx + dy * dy > 75 * 75) { paw(e.clientX, e.clientY, Math.atan2(dy, dx)); last = { x: e.clientX, y: e.clientY }; }
  }, { passive: true });
  addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") paw(e.clientX, e.clientY, -Math.PI / 2); }, { passive: true });
}

/* ---------- 크게 보기 ---------- */
const lb = $("#lb"), lbImg = $("#lbImg");
function openLB(p) {
  lbImg.src = `/img/t/${p.f}.webp`;
  const big = new Image(); big.src = `/img/l/${p.f}.webp`; big.onload = () => (lbImg.src = big.src);
  lbImg.alt = `${fmt(p.d)} 후와`; $("#lbCap").textContent = fmt(p.d);
  lb.hidden = false; history.pushState({ lb: 1 }, "");
}
function closeLB(pop) { if (lb.hidden) return; lb.hidden = true; if (!pop && history.state?.lb) history.back(); }
lb.addEventListener("click", () => closeLB());
addEventListener("popstate", () => closeLB(true));
addEventListener("keydown", (e) => e.key === "Escape" && closeLB());
$("#toTop").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); });
})();
