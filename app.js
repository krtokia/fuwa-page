// 후와 사진첩. photos.json: [{f:"YYYYMMDD-NNN", d:"YYYYMMDD", w,h, tw,th, p?:1(대표)}]
const YEAR_NOTE = {
  "2016": "아기 후와.",
  "2017": "",
  "2020": "털이 폭발하기 시작.",
  "2021": "근엄한 표정 완성.",
  "2022": "",
  "2023": "",
  "2024": "",
  "2025": "턱시도 친구 등장.",
  "2026": "올해로 열 살.",
};
const BORN = new Date(2016, 2, 1);

const $ = (s) => document.querySelector(s);
const fmt = (d) => `${d.slice(0, 4)}. ${+d.slice(4, 6)}. ${+d.slice(6, 8)}.`;

(function age() {
  const now = new Date();
  let y = now.getFullYear() - BORN.getFullYear();
  if (now.getMonth() < BORN.getMonth()) y--;
  $("#age").textContent = `(${y}살)`;
  $("#years").textContent = y;
})();

let all = [], shown = [], cur = 0, year = "전체";

fetch("/photos.json").then((r) => r.json()).then((list) => {
  all = list.slice().sort((a, b) => b.d.localeCompare(a.d) || b.f.localeCompare(a.f)); // 최신순
  buildTimeline(list);
  buildFilters();
  render();
});

function byYear() {
  const m = new Map();
  for (const p of all.slice().reverse()) {
    const y = p.d.slice(0, 4);
    if (!m.has(y)) m.set(y, []);
    m.get(y).push(p);
  }
  return m;
}

function buildTimeline() {
  const tl = $("#tl");
  for (const [y, ps] of byYear()) {
    const feat = ps.filter((p) => p.p);
    const pick = (feat.length >= 3 ? feat : feat.concat(ps.filter((p) => !p.p))).slice(0, 6);
    const li = document.createElement("li");
    li.innerHTML = `<div class="tl-year">${y}</div><div class="tl-body">
      <p>${YEAR_NOTE[y] ? YEAR_NOTE[y] + " · " : ""}${ps.length}장</p><div class="tl-strip"></div></div>`;
    const strip = li.querySelector(".tl-strip");
    for (const p of pick) {
      const b = document.createElement("button");
      b.innerHTML = `<img src="/img/t/${p.f}.webp" alt="${fmt(p.d)} 후와" loading="lazy">`;
      b.onclick = () => { setYear(y); open(shown.indexOf(p)); };
      strip.append(b);
    }
    const more = document.createElement("button");
    more.className = "tl-more";
    more.textContent = `${y}년 전부 보기 →`;
    more.onclick = () => { setYear(y); $("#gallery").scrollIntoView(); };
    strip.append(more);
    tl.append(li);
  }
}

function buildFilters() {
  const box = $("#filters");
  for (const y of ["전체", ...[...byYear().keys()].reverse()]) {
    const b = document.createElement("button");
    b.textContent = y; b.setAttribute("role", "tab"); b.dataset.y = y;
    b.onclick = () => setYear(y);
    box.append(b);
  }
}

function setYear(y) {
  year = y;
  for (const b of $("#filters").children) b.setAttribute("aria-selected", b.dataset.y === y);
  render();
}

const io = new IntersectionObserver((es) => {
  for (const e of es) if (e.isIntersecting) {
    const img = e.target; img.src = img.dataset.src; io.unobserve(img);
  }
}, { rootMargin: "600px" });

function render() {
  shown = year === "전체" ? all : all.filter((p) => p.d.startsWith(year));
  $("#gcount").textContent = `${shown.length}장`;
  for (const b of $("#filters").children) b.setAttribute("aria-selected", b.dataset.y === year);
  const grid = $("#grid");
  grid.replaceChildren();
  shown.forEach((p, i) => {
    const b = document.createElement("button");
    const img = new Image(p.tw, p.th);
    img.alt = `${fmt(p.d)} 후와`;
    img.dataset.src = `/img/t/${p.f}.webp`;
    img.onload = () => img.classList.add("on");
    b.append(img);
    b.onclick = () => open(i);
    grid.append(b);
    io.observe(img);
  });
}

// lightbox
const lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
function show(i) {
  cur = (i + shown.length) % shown.length;
  const p = shown[cur];
  lbImg.src = `/img/t/${p.f}.webp`;           // 작은 것 먼저, 큰 것으로 교체
  const big = new Image(); big.src = `/img/l/${p.f}.webp`;
  big.onload = () => { if (shown[cur] === p) lbImg.src = big.src; };
  lbImg.alt = `${fmt(p.d)} 후와`;
  lbCap.textContent = `${fmt(p.d)}  ·  ${cur + 1} / ${shown.length}`;
  for (const d of [1, -1]) { const n = shown[(cur + d + shown.length) % shown.length]; new Image().src = `/img/l/${n.f}.webp`; }
}
function open(i) {
  if (i < 0) return;
  show(i); lb.hidden = false; document.body.style.overflow = "hidden";
  history.pushState({ lb: 1 }, "");
}
function close(fromPop) {
  if (lb.hidden) return;
  lb.hidden = true; document.body.style.overflow = "";
  if (!fromPop && history.state && history.state.lb) history.back();
}
window.addEventListener("popstate", () => close(true));
$("#lbClose").onclick = () => close();
$("#lbPrev").onclick = (e) => { e.stopPropagation(); show(cur - 1); };
$("#lbNext").onclick = (e) => { e.stopPropagation(); show(cur + 1); };
lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});
let sx = null, sy = null;
lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
  else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  sx = sy = null;
});
