(function () {
  "use strict";
  var H = window.HARV; if (!H) return;
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var FREQ = H.freq, ENVS = H.envs, NB = FREQ.length, NENV = ENVS.length;

  /* ================= i18n ================= */
  var EN = {
    brand: "Broadband acoustic harvester", nav_detail: "Technical detail",
    kick: "Try it yourself",
    title: "Tune an array that harvests electricity from noise",
    lead: "The noise keeps changing. Drag the resonant wires to keep covering it, and keep the harvest flowing. Pile them up or spread them out, your call.",
    g_ready_t: "Ready?",
    g_ready_p: "The noise environment keeps shifting. Drag the wires to keep covering the peaks. If the bar at the top stays under its marker too long, a blackout costs you a life, and the marker rises every wave. How many waves can you survive?",
    g_start: "Start", lb_view: "Leaderboard",
    g_hint: "Drag the wires to keep covering the noise",
    lg_noise: "noise", lg_cov: "captured", lg_wire: "wire resonance",
    g_note: "An educational simulation built on 11 real measured noise spectra and a simplified piezoelectric-cantilever model.",
    lb_h: "Leaderboard", lb_lead: "Ranked by waves survived. Ties go to the higher total harvest.",
    ex_h: "How did it go?",
    ex_p1: "Pile the wires on one peak and you harvest a lot until the noise moves, then you black out. Spread them out and you keep harvesting as the environment shifts. That is the heart of this research.",
    ex_b1: "a very narrow band", ex_b2: "broadband array",
    ex_p2: "A real harvester wire absorbs only <b>a very narrow band</b>. So the wire lengths are spread out to give many resonant frequencies covering a wide band, a <b>broadband array</b>, verified across 11 measured noise environments.",
    ex_p3: "That is the whole idea. If you want more, scroll down for the actual design results.",
    tline: "Technical detail below · for the curious",
    res_h: "Broadband vs narrowband",
    res_sub: "The two designs compared across 11 measured noise environments. Narrowband is high only in its own environment and collapses elsewhere, and it is fragile to fabrication error. Broadband harvests evenly everywhere.",
    n1t: "Even means robust", n1: "The broadband array averages <code>104 fW</code> across 11 environments, at <b>93.1%</b> uniformity, and is about <b>10×</b> more robust to fabrication error than narrowband.",
    n2t: "The narrowband limit", n2: "A single resonance has a 3-dB bandwidth of <code>about 12 Hz</code>. If fabrication error shifts the frequency even that much, most wires miss their target and the output drops sharply.",
    how_h: "How it works",
    how_sub: "Power is integrated from the resonance and damping of a cylindrical piezoelectric cantilever wire, then evaluated across many noise environments.",
    m_phys_t: "The resonant harvester", m_phys: "Each wire's length and diameter set its resonant frequency <code>f_n</code>, and it absorbs noise energy only in a narrow band around it. Power comes out through electromechanical coupling.",
    m_des_t: "Length-distributed array", m_des: "Spreading the lengths of 300 wires over a normal distribution gives them different <code>f_n</code> values, so the array as a whole covers a wide frequency band.",
    m_eval_t: "Cross-environment robustness", m_eval: "With an SDOF electromechanical model and bootstrap confidence intervals, both the mean and the spread of performance are measured across 11 real noise environments.",
    m_game_t: "This simulator", m_game: "The game above is a simplified version of that idea. Concentrate the wires and you win one environment; spread them and you survive all of them. Coverage over time is the score.",
    fd_h: "What the study showed",
    fd1t: "Narrowband is strong only in its own environment.", fd1: "An ideal single-resonance design gives high output in its design environment but drops sharply in others.",
    fd2t: "With fabrication error, broadband wins.", fd2: "Once realistic process error is included, narrowband falls behind broadband even in its own design environment, because a frequency shift larger than the bandwidth breaks the output.",
    fd3t: "Broadband harvests evenly across 11 environments.", fd3: "The length-distributed array held 93.1% uniform, stable performance across 11 different noise environments. The mean power is similar, but the spread is far smaller.",
    fd4t: "The numbers came from measurement and verification.", fd4: "The noise is real measured spectra, the physics is a standard piezoelectric-cantilever model (PZT-5A, 70 dB SPL), and the results are checked with bootstrap confidence intervals.",
    ft_desc: "An interactive simulator of research on broadband piezoelectric harvester arrays that capture energy from noise. It is built on real measured noise spectra and a standard piezoelectric-cantilever model; the game at the top simplifies the principle so you can operate it directly. Personal research portfolio.",
    ft_back: "More in the Workshop →",
    // runtime
    r_env: "env", r_score: "harvest", wave_u: "", wave_l: "Wave", danger: "BLACKOUT RISK",
    over_t: "Blackout", survived_l: "waves survived",
    lb_ph: "Your name to submit", lb_sub: "Submit", lb_sending: "Submitting…",
    lb_ok: "Submitted", lb_fail: "Could not submit (invalid run)",
    lb_net: "Could not reach the server. Please try again.", lb_fast: "Too quick. Wait a moment and try again.",
    lb_cap: "You have reached today's submission limit. Try again tomorrow.", lb_busy: "The server is busy. Try again in a moment.",
    lb_empty: "No scores yet. Be the first.", lb_off: "Could not load the leaderboard.",
    lb_loading: "Loading…", again: "Play again",
  };
  var lang = "ko";
  function T(k, ko) { return lang === "en" ? (EN[k] != null ? EN[k] : ko) : ko; }
  function rankTxt(n) { return lang === "en" ? "#" + n : n + "위"; }
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-k]").forEach(function (el) {
      if (el.dataset.ko == null) el.dataset.ko = el.innerHTML;
      var v = (lang === "en") ? EN[el.dataset.k] : null;
      el.innerHTML = (v != null) ? v : el.dataset.ko;
    });
    if (GAME) GAME.refresh();
  }
  document.querySelectorAll(".langtog button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang;
      document.querySelectorAll(".langtog button").forEach(function (x) { x.classList.toggle("on", x === b); });
      applyLang();
    });
  });
  function fit(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(), ctx = cv.getContext("2d");
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height, ctx: ctx };
  }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  /* ================= LEADERBOARD ================= */
  var LB_URL = "https://kjlknxwzpmdzawwrurva.supabase.co/functions/v1/harvester-leaderboard";
  function lbPost(body) {
    var o = { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
    try { if (window.AbortSignal && AbortSignal.timeout) o.signal = AbortSignal.timeout(12000); } catch (_) {}
    return fetch(LB_URL, o).then(function (r) { return r.json(); });
  }
  function lbSubmit(name, st) { return lbPost({ action: "submit", name: name, waves: st.waves, score: st.score }); }
  // server err codes -> what the visitor can do next (rule 12)
  function lbErr(r) {
    var e = r && r.err;
    if (e === "too_fast") return T("lb_fast", "너무 빨리 눌렀습니다. 잠시 뒤 다시 눌러 주세요.");
    if (e === "daily_cap") return T("lb_cap", "오늘 등록할 수 있는 횟수를 다 썼습니다. 내일 다시 등록해 주세요.");
    if (!e || e === "insert") return T("lb_busy", "서버가 잠시 바쁩니다. 잠시 뒤 다시 눌러 주세요.");
    return T("lb_fail", "등록 실패 (기록이 유효하지 않습니다)");
  }
  function lbRow(rank, name, big, small) {
    return '<li><span class="lb-rank">' + rank + '</span><span class="lb-name">' + esc(name) +
      '</span><span class="lb-val">' + big + '</span><span class="lb-sm">' + small + '</span></li>';
  }
  function renderLB(d) {
    var el = document.getElementById("lb-list"); if (!el) return;
    var empty = '<li class="lb-empty">' + T("lb_empty", "아직 기록이 없습니다. 첫 주자가 되어보세요.") + '</li>';
    if (!d || !d.ok) { el.innerHTML = '<li class="lb-empty">' + T("lb_off", "순위표를 불러오지 못했습니다.") + '</li>'; return; }
    el.innerHTML = d.scores.length ? d.scores.map(function (r, i) {
      return lbRow(i + 1, r.name, lang === "en" ? r.waves + (r.waves == 1 ? " wave" : " waves") : r.waves + " 웨이브", T("r_score", "수확") + " " + Math.round(r.score)); }).join("") : empty;
  }
  function lbFetch() {
    lbPost({ action: "top" }).then(renderLB)
      .catch(function (e) { console.warn("leaderboard load failed", e); var el = document.getElementById("lb-list"); if (el) el.innerHTML = '<li class="lb-empty">' + T("lb_off", "순위표를 불러오지 못했습니다.") + '</li>'; });
  }
  var lbmodal = document.getElementById("lbmodal");
  function openLB() { if (!lbmodal) return; var el = document.getElementById("lb-list"); if (el) el.innerHTML = '<li class="lb-empty">' + T("lb_loading", "불러오는 중…") + '</li>'; lbmodal.classList.add("on"); lbmodal.setAttribute("aria-hidden", "false"); lbFetch(); }
  function closeLB() { if (lbmodal) { lbmodal.classList.remove("on"); lbmodal.setAttribute("aria-hidden", "true"); } }
  if (lbmodal) {
    document.getElementById("lbclose").onclick = closeLB;
    lbmodal.addEventListener("click", function (e) { if (e.target === lbmodal) closeLB(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLB(); });
    document.addEventListener("click", function (e) { if (e.target.closest("[data-lb]")) openLB(); });
    if (/[?&]lb/.test(location.search)) setTimeout(openLB, 400);
  }

  /* ================= REAL-TIME ARCADE GAME ================= */
  var GAME = (function () {
    var cv = document.getElementById("game"); if (!cv) return null;
    var ghud = document.getElementById("ghud"), readout = document.getElementById("readout"),
      banner = document.getElementById("gbanner"), startBtn = document.getElementById("startbtn");
    // HW 1.6: an even spread captures ~0.60-0.65, a tuned robust layout ~0.77 (was 2.3 -> even 0.85, never lost)
    var NW = 12, HW = 1.6;
    var ctx, W, Hh, PL = 44, PR = 14, PT = 68, PB = 34, MY = 38, RW = 96;   // MY: meter row under the HUD, RW: room for the score readout
    var wp = [], S = new Float64Array(NB), tgt = 0, prevTgt = 0;
    var state = "ready", drag = -1;
    var wave, lives, score, capNow, waveTimer, brownTimer, envFlash, parts, spawnAcc;
    var MORPH = 2.6, SCORE_RATE = 150, BROWN_LIMIT = 2.2;
    function waveDur() { return Math.max(3.0, 6.2 - wave * 0.26); }
    function thresh() { return Math.min(0.95, 0.40 + wave * 0.022); }   // keeps rising, so every run ends

    function resize() { var f = fit(cv); ctx = f.ctx; W = f.w; Hh = f.h; draw(); }
    function px(pos) { return PL + pos / (NB - 1) * (W - PL - PR); }
    function xToPos(x) { return Math.max(0, Math.min(NB - 1, (x - PL) / (W - PL - PR) * (NB - 1))); }
    function ph() { return Hh - PT - PB; }

    function reset() {
      wp = []; for (var i = 0; i < NW; i++) wp.push((i + 0.5) / NW * (NB - 1));
      tgt = 3; prevTgt = 3; for (var j = 0; j < NB; j++) S[j] = ENVS[tgt].psd[j];
      wave = 1; lives = 3; score = 0; capNow = 1; waveTimer = waveDur(); brownTimer = 0; envFlash = 0;
      parts = []; spawnAcc = 0;
    }
    function start() {
      reset(); state = "run"; banner.classList.add("hide"); last = 0;
      var st = cv.parentNode, r = st.getBoundingClientRect();   // wire handles sit at the stage bottom: keep it on screen
      if (r.top < 0 || r.bottom > innerHeight) st.scrollIntoView({ block: r.height > innerHeight ? "start" : "nearest", behavior: reduce ? "auto" : "smooth" });
    }

    function coverage() {
      var c = new Float64Array(NB);
      for (var i = 0; i < NW; i++) { var p = wp[i], lo = Math.max(0, (p - 8) | 0), hi = Math.min(NB, (p + 9) | 0);
        for (var j = lo; j < hi; j++) { var u = (j - p) / HW; c[j] += 1 / (1 + u * u); } }
      for (var j = 0; j < NB; j++) if (c[j] > 1) c[j] = 1;
      return c;
    }

    function step(dt) {
      // morph spectrum toward target env
      var e = ENVS[tgt].psd, a = Math.min(1, dt * MORPH), st = 0;
      for (var j = 0; j < NB; j++) { S[j] += (e[j] - S[j]) * a; st += S[j]; }
      // wave change
      waveTimer -= dt;
      if (waveTimer <= 0) { prevTgt = tgt; do { tgt = (Math.random() * NENV) | 0; } while (tgt === prevTgt); wave++; waveTimer = waveDur(); envFlash = 0.7; }
      if (envFlash > 0) envFlash -= dt;
      // capture
      var c = coverage(), cap = 0; for (var j = 0; j < NB; j++) cap += S[j] * c[j];
      capNow = st > 0 ? cap / st : 0;
      score += capNow * dt * SCORE_RATE;
      // blackout logic
      var th = thresh();
      if (capNow < th) brownTimer += dt; else brownTimer = Math.max(0, brownTimer - dt * 1.7);
      if (brownTimer >= BROWN_LIMIT) { lives--; brownTimer = 0; envFlash = 0; if (lives <= 0) return over(); }
      // particles
      spawnAcc += dt;
      var maxS = 0; for (var j = 0; j < NB; j++) if (S[j] > maxS) maxS = S[j];
      while (spawnAcc > 0.045 && parts.length < 70) {
        spawnAcc -= 0.045;
        var jj = (Math.random() * NB) | 0;
        if (Math.random() < S[jj] / (maxS || 1)) {
          var caught = c[jj] > 0.34, wx = px(jj), wy = PT + ph();
          var tw = null; if (caught) { var bd = 1e9; for (var i = 0; i < NW; i++) { var d = Math.abs(wp[i] - jj); if (d < bd) { bd = d; tw = i; } } }
          parts.push({ x: wx, y: wy, caught: caught, tw: tw, a: 1, vy: 26 + Math.random() * 20 });
        }
      }
      for (var i = parts.length - 1; i >= 0; i--) {
        var pt = parts[i];
        if (pt.caught) { var tx = px(wp[pt.tw]), ty = PT + ph(); pt.x += (tx - pt.x) * Math.min(1, dt * 9); pt.y += (ty - pt.y) * Math.min(1, dt * 9); pt.a -= dt * 2.2;
          if (Math.abs(pt.x - tx) < 3 || pt.a <= 0) parts.splice(i, 1); }
        else { pt.y -= pt.vy * dt; pt.a -= dt * 1.2; if (pt.a <= 0 || pt.y < PT - 6) parts.splice(i, 1); }
      }
    }

    function over() {
      state = "over"; banner.classList.remove("hide");
      var stats = { waves: wave, score: Math.round(score) };
      banner.innerHTML =
        '<div class="result miss">' + T("over_t", "정전") + '</div>' +
        '<div class="robustbig">' + wave + ' <small>' + T("survived_l", "웨이브 생존") + ' · ' + T("r_score", "수확") + ' ' + Math.round(score) + '</small></div>' +
        '<form class="lbform" id="lbform"><input id="lbname" maxlength="16" autocomplete="off" spellcheck="false" placeholder="' +
        T("lb_ph", "이름을 남기고 순위 등록") + '"><button class="btn" type="submit">' + T("lb_sub", "등록") + '</button></form>' +
        '<div class="lbmsg" id="lbmsg"></div>' +
        '<div class="btnrow"><button class="btn res" id="again">' + T("again", "다시 하기") + '</button>' +
        '<button class="btn ghost" data-lb>' + T("lb_view", "순위보기") + '</button></div>';
      document.getElementById("again").onclick = start;
      var form = document.getElementById("lbform"), msg = document.getElementById("lbmsg");
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var nmEl = document.getElementById("lbname"), nm = nmEl.value.trim();
        if (!nm) { nmEl.focus(); return; }
        form.querySelector("button").disabled = true; msg.className = "lbmsg"; msg.textContent = T("lb_sending", "등록 중…");
        lbSubmit(nm, stats).then(function (r) {
          if (r && r.ok) { msg.innerHTML = T("lb_ok", "등록 완료") + ' · <b>' + rankTxt(r.rank) + '</b>'; form.style.display = "none"; lbFetch(); }
          else { console.warn("leaderboard submit rejected", r && r.err); msg.className = "lbmsg err"; msg.textContent = lbErr(r); form.querySelector("button").disabled = false; }
        }).catch(function (e) { console.warn("leaderboard submit failed", e); msg.className = "lbmsg err"; msg.textContent = T("lb_net", "연결이 불안정해 등록하지 못했습니다. 다시 눌러 주세요."); form.querySelector("button").disabled = false; });
      });
    }

    function draw() {
      if (!ctx) return; ctx.clearRect(0, 0, W, Hh);
      var c = coverage(), maxP = 0; for (var j = 0; j < NB; j++) if (S[j] > maxP) maxP = S[j];
      var y0 = PT + ph();
      function Y(v) { return y0 - v / (maxP || 1) * ph() * 0.94; }
      // freq grid
      ctx.fillStyle = "#93a1b2"; ctx.font = "10px 'IBM Plex Mono',monospace"; ctx.textAlign = "center";
      [50, 100, 200, 500, 1000].forEach(function (f) { var pos = fToPos(f); if (pos < 0) return; var x = px(pos);
        ctx.strokeStyle = "rgba(27,39,52,.05)"; ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, y0); ctx.stroke();
        ctx.fillText(f >= 1000 ? "1k" : f, x, Hh - 12); });
      // noise + captured
      ctx.beginPath(); ctx.moveTo(px(0), y0); for (var j = 0; j < NB; j++) ctx.lineTo(px(j), Y(S[j])); ctx.lineTo(px(NB - 1), y0); ctx.closePath();
      ctx.fillStyle = "rgba(138,166,194,.45)"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(px(0), y0); for (var j = 0; j < NB; j++) ctx.lineTo(px(j), Y(S[j] * c[j])); ctx.lineTo(px(NB - 1), y0); ctx.closePath();
      ctx.fillStyle = "rgba(44,110,166,.62)"; ctx.fill();
      // particles
      for (var i = 0; i < parts.length; i++) { var pt = parts[i];
        ctx.fillStyle = pt.caught ? "rgba(44,110,166," + pt.a + ")" : "rgba(150,161,178," + (pt.a * .7) + ")";
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.caught ? 2.6 : 2, 0, 7); ctx.fill(); }
      // wires
      for (var i = 0; i < NW; i++) { var x = px(wp[i]);
        ctx.strokeStyle = i === drag ? "#c9701f" : "rgba(224,138,60,.5)"; ctx.lineWidth = i === drag ? 2 : 1.3;
        ctx.beginPath(); ctx.moveTo(x, PT + 2); ctx.lineTo(x, y0); ctx.stroke();
        ctx.fillStyle = "#e08a3c"; ctx.beginPath(); ctx.arc(x, y0, i === drag ? 7 : 5.5, 0, 7); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke(); }
      // top capture meter + threshold + danger
      var th = thresh(), mw = W - PL - PR - RW, danger = capNow < th && state === "run";
      ctx.fillStyle = "rgba(27,39,52,.07)"; ctx.fillRect(PL, MY, mw, 7);
      ctx.fillStyle = danger ? "#cf5a3c" : "#2c6ea6"; ctx.fillRect(PL, MY, mw * Math.min(1, capNow), 7);
      var tx = PL + mw * th; ctx.strokeStyle = "#1b2734"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx, MY - 3); ctx.lineTo(tx, MY + 10); ctx.stroke();
      if (danger) { ctx.fillStyle = "rgba(207,90,60,.9)"; ctx.font = "600 11px 'IBM Plex Mono',monospace"; ctx.textAlign = "left";
        ctx.fillText(T("danger", "정전 위험") + "  " + (BROWN_LIMIT - brownTimer).toFixed(1) + "s", PL, MY + 22); }
      // env flash overlay
      if (envFlash > 0) { ctx.fillStyle = "rgba(44,110,166," + (envFlash * .12) + ")"; ctx.fillRect(0, 0, W, Hh); }
      // hud DOM
      var dots = ""; for (var i = 0; i < 3; i++) dots += '<span class="life' + (i < lives ? '' : ' off') + '"></span>';
      ghud.innerHTML = '<span class="wv">' + T("wave_l", "웨이브") + ' ' + wave + '</span><span class="lives">' + dots + '</span>' +
        '<span class="env">' + esc(ENVS[tgt].name) + '</span>';
      readout.innerHTML = '<div class="big">' + Math.round(score) + '</div><div class="cap">' + T("r_score", "수확") + '</div>';
    }
    function fToPos(f) { if (f <= FREQ[0] || f >= FREQ[NB - 1]) return -1; for (var j = 1; j < NB; j++) if (FREQ[j] >= f) return (j - 1) + (f - FREQ[j - 1]) / (FREQ[j] - FREQ[j - 1]); return -1; }

    var last = 0;
    function loop(t) {
      var dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t;
      if (state === "run") step(dt);
      draw(); requestAnimationFrame(loop);
    }
    // drag
    function pick(e) {
      if (state !== "run") return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, best = -1, bd = 24;
      for (var i = 0; i < NW; i++) { var d = Math.abs(px(wp[i]) - x); if (d < bd) { bd = d; best = i; } }
      if (best >= 0) { drag = best; wp[drag] = xToPos(x); try { cv.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
    }
    cv.addEventListener("pointerdown", pick);
    cv.addEventListener("pointermove", function (e) { if (drag < 0) return; var r = cv.getBoundingClientRect(); wp[drag] = xToPos(e.clientX - r.left); });
    function up() { drag = -1; } cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    startBtn.onclick = start;
    addEventListener("resize", resize);
    reset(); resize(); requestAnimationFrame(loop);
    if (/[?&]play/.test(location.search)) setTimeout(start, 300);
    return { refresh: function () { draw(); } };
  })();

  /* ============ real measured spectra strip (peaks differ) ============ */
  (function () {
    var el = document.getElementById("cmp"); if (!el) return;
    el.classList.add("envstrip");
    el.innerHTML = ENVS.map(function (e) {
      var mx = Math.max.apply(null, e.psd) || 1, w = 100, h = 34, pts = [];
      for (var j = 0; j < NB; j++) pts.push((j / (NB - 1) * w).toFixed(1) + "," + (h - e.psd[j] / mx * (h - 3)).toFixed(1));
      return '<div class="envmini"><svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
        '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#2c6ea6" stroke-width="1.2"/></svg>' +
        '<span>' + esc(e.name) + '</span></div>';
    }).join("");
  })();

  /* reveal */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
})();
