/* ══════════════════════════════════════════════════════════════
   AG Plex — first-visit popup for the Make a Request page
   Drop in /assets/ and add before </body> on request/index.html:
     <script src="/assets/request-popup.js" defer></script>

   Shows once per browser. To show it to everyone again (new message),
   bump POPUP_VERSION. Add ?popup=1 to the URL to preview it anytime.
   ══════════════════════════════════════════════════════════════ */
(function () {
  /* ── CONFIG ── */
  const POPUP_VERSION = "2026-10-2300";            // bump to re-show
  const MOVIE_COUNT   = "2,300";
  const REPORT_URL    = "https://agplexhub.com/report-issue/";

  // Total titles (movies + shows), JustWatch via Quartz, June 2024.
  // Most recent per-service counts available. AG Plex number is movies only.
  const COMPARE = [
    { name: "AG Plex",    count: 2300, you: true },
    { name: "Disney+",    count: 2000 },
    { name: "Paramount+", count: 1405 },
    { name: "Apple TV+",  count: 291  }
  ];
  const COMPARE_NOTE = "AG Plex: movies only. Others: movies and shows combined (JustWatch, 2024).";

  /* ── Show once ── */
  const KEY = "agRequestPopupSeen";
  const force = /[?&]popup=1\b/.test(location.search);
  let seen = false;
  try { seen = localStorage.getItem(KEY) === POPUP_VERSION; } catch {}
  if (seen && !force) return;

  /* ── Styles ── */
  const css = `
  .agp-back{position:fixed;inset:0;z-index:10000;background:rgba(4,7,14,.72);
    display:flex;align-items:flex-end;justify-content:center;
    opacity:0;transition:opacity .2s ease}
  .agp-back.on{opacity:1}
  .agp{position:relative;width:100%;max-width:440px;max-height:92vh;overflow-y:auto;
    -webkit-overflow-scrolling:touch;overscroll-behavior:contain;
    background:#181d28;border:1px solid rgba(255,255,255,.09);border-bottom:none;
    border-radius:10px 10px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.6);
    color:#dce4f0;font-family:'Barlow',system-ui,-apple-system,sans-serif;
    padding-bottom:env(safe-area-inset-bottom);
    transform:translateY(24px);transition:transform .22s ease-out}
  .agp-back.on .agp{transform:none}
  @media (min-width:560px){
    .agp-back{align-items:center;padding:20px}
    .agp{border-radius:6px;border-bottom:1px solid rgba(255,255,255,.09);max-height:88vh}
  }
  .agp-rb{display:flex;height:5px}.agp-rb span{flex:1}
  .agp-grab{width:38px;height:4px;border-radius:2px;background:rgba(255,255,255,.18);margin:9px auto 0}
  @media (min-width:560px){.agp-grab{display:none}}
  .agp-x{position:absolute;top:12px;right:10px;width:40px;height:40px;border:none;background:none;
    color:#7080a0;font-size:24px;line-height:1;cursor:pointer}
  .agp-x:active{color:#fff}
  .agp-body{padding:14px 20px 20px}
  .agp-eye{font-size:10.5px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:#1898a8}
  .agp h2{font-family:'Bungee',cursive;font-weight:400;font-size:27px;line-height:1.05;color:#fff;
    margin:6px 0 12px;text-shadow:1px 1px 0 rgba(0,0,0,.8)}
  .agp p{font-size:15px;line-height:1.55;color:#a8b6cc;margin:0 0 12px}
  .agp p strong{color:#fff;font-weight:700}
  .agp-big{display:flex;align-items:baseline;gap:8px;margin:2px 0 4px}
  .agp-big b{font-family:'Bungee',cursive;font-weight:400;font-size:44px;line-height:1;color:#5fd08f;
    text-shadow:2px 2px 0 rgba(0,0,0,.6)}
  .agp-big span{font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#7080a0}
  .agp-bars{margin:10px 0 6px;padding:12px;background:#0e1420;border-left:3px solid #28985a}
  .agp-bar{display:grid;grid-template-columns:78px 1fr 46px;align-items:center;gap:8px;margin:5px 0;
    font-size:12.5px;font-weight:600;color:#8898b8}
  .agp-bar i{display:block;height:9px;background:#3a4a60;width:0;transition:width .7s ease-out}
  .agp-bar.you{color:#fff}.agp-bar.you i{background:#28985a}
  .agp-bar em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums}
  .agp-note{font-size:11px;color:#48566e;margin:0 0 14px}
  .agp-hr{height:1px;background:rgba(255,255,255,.08);margin:16px 0 14px}
  .agp-tag{display:inline-block;font-family:'Bungee',cursive;font-size:11.5px;letter-spacing:1.4px;
    color:#ff8878;margin-bottom:6px}
  .agp-link{display:flex;align-items:center;gap:10px;min-height:52px;padding:12px 14px;margin:4px 0 4px;
    background:rgba(200,50,40,.14);border-left:4px solid #c83228;color:#fff;text-decoration:none;
    font-weight:700;font-size:15px}
  .agp-link span{margin-left:auto;color:#ff8878;font-size:18px}
  .agp-btn{display:block;width:100%;min-height:54px;margin-top:16px;cursor:pointer;
    border:2px solid #4888d8;border-right-color:#1a3a78;border-bottom-color:#1a3a78;border-radius:0;
    background:#2d6bbf;color:#fff;font-family:'Bungee',cursive;font-size:15px;letter-spacing:.06em;
    text-transform:uppercase}
  .agp-btn:active{filter:brightness(1.15)}
  .agp-sign{text-align:center;font-size:14px;color:#7080a0;margin:14px 0 0}
  .agp-sign b{font-family:'Bungee',cursive;font-weight:400;color:#fff;letter-spacing:1px}
  html.agp-lock,html.agp-lock body{overflow:hidden}
  @media (prefers-reduced-motion:reduce){.agp-back,.agp,.agp-bar i{transition:none}}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Markup ── */
  const rainbow = ["#c83228","#d4682a","#d4a820","#28985a","#3848b0","#1898a8"]
    .map(c => `<span style="background:${c}"></span>`).join("");
  const max = Math.max(...COMPARE.map(c => c.count));
  const bars = COMPARE.map(c => `
    <div class="agp-bar${c.you ? " you" : ""}">
      <span>${c.name}</span><i data-w="${(c.count / max * 100).toFixed(1)}%"></i>
      <em>${c.count.toLocaleString()}${c.you ? "+" : ""}</em>
    </div>`).join("");

  const back = document.createElement("div");
  back.className = "agp-back";
  back.innerHTML = `
    <div class="agp" role="dialog" aria-modal="true" aria-labelledby="agpTitle">
      <div class="agp-rb">${rainbow}</div>
      <div class="agp-grab"></div>
      <button class="agp-x" aria-label="Close">×</button>
      <div class="agp-body">
        <div class="agp-eye">AG Plex</div>
        <h2 id="agpTitle">Hey! Wait a Second!</h2>
        <p>Thanks for being part of AG Plex. We just passed</p>
        <div class="agp-big"><b>${MOVIE_COUNT}</b><span>Movies</span></div>
        <p>That's more than <strong>Disney+</strong>, <strong>Paramount+</strong> or <strong>Apple TV+</strong> have in movies <em>and</em> shows combined.</p>
        <div class="agp-bars">${bars}</div>
        <p class="agp-note">${COMPARE_NOTE}</p>
        <p><strong>So keep requesting, it's fun!</strong></p>

        <div class="agp-hr"></div>

        <span class="agp-tag">New: Report an Issue</span>
        <p>More movies means more chances something won't play right. The new Report an Issue page
        runs a few built-in fixes automatically, and you can see the status of known issues.
        It helps the whole community.</p>
        <a class="agp-link" href="${REPORT_URL}">Report an Issue<span>›</span></a>

        <button class="agp-btn" id="agpGo">Keep Requesting</button>
        <p class="agp-sign">Thanks! Go watch something. <b>- AG</b></p>
      </div>
    </div>`;

  /* ── Open / close ── */
  const lastFocus = document.activeElement;

  function markSeen() {
    try { localStorage.setItem(KEY, POPUP_VERSION); } catch {}
  }

  function close() {
    markSeen();
    back.classList.remove("on");
    document.documentElement.classList.remove("agp-lock");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => back.remove(), 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "Tab") {           // keep focus inside the dialog
      const f = back.querySelectorAll("button, a[href]");
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function open() {
    document.body.appendChild(back);
    document.documentElement.classList.add("agp-lock");
    requestAnimationFrame(() => {
      back.classList.add("on");
      setTimeout(() => back.querySelectorAll(".agp-bar i").forEach(i => { i.style.width = i.dataset.w; }), 120);
    });
    back.querySelector("#agpGo").focus({ preventScroll: true });
    document.addEventListener("keydown", onKey);
  }

  back.addEventListener("click", e => { if (e.target === back) close(); });
  back.querySelector(".agp-x").addEventListener("click", close);
  back.querySelector("#agpGo").addEventListener("click", close);
  back.querySelector(".agp-link").addEventListener("click", markSeen);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(open, 350));
  else setTimeout(open, 350);
})();
