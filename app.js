(function () {
  "use strict";
  var H = window.HARV; if (!H) return;
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var FREQ = H.freq, ENVS = H.envs, NB = FREQ.length, NENV = ENVS.length, M = H.meta;

  /* ================= i18n ================= */
  var EN = {
    brand: "Broadband acoustic harvester", nav_detail: "Technical detail",
    kick: "Try it yourself",
    title: "Tune an array that harvests electricity from noise",
    lead: "Place resonant wires along the frequency axis to capture as much of the surrounding noise energy as you can. Pile them up or spread them out, your call.",
    g_ready_t: "Ready?",
    g_ready_p: "Drag the wires left and right to line them up with the energy in the noise spectrum (blue). Once placed, hit “Test across environments” to see how robust your array is.",
    g_start: "Start", lb_view: "Leaderboard",
    wires_l: "Wires left ", lg_noise: "noise", lg_cov: "captured", lg_wire: "wire resonance",
    g_test: "Test across environments",
    g_note: "An educational simulation built on 11 real measured noise spectra and a simplified piezoelectric-cantilever model.",
    lb_h: "Leaderboard", lb_lead: "Ranked by the most even harvest across all environments. Ties go to the higher average.",
    ex_h: "How did it go?",
    ex_p1: "Pile the wires on one peak and you harvest a lot from that noise, but almost nothing when the noise changes. Spread them out and you harvest evenly in any environment. That is the heart of this research.",
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
    m_game_t: "This simulator", m_game: "The game above is a simplified version of that idea. Concentrate the wires and you win one environment; spread them and you win all of them. Robustness is the score.",
    fd_h: "What the study showed",
    fd1t: "Narrowband is strong only in its own environment.", fd1: "An ideal single-resonance design gives high output in its design environment but drops sharply in others.",
    fd2t: "With fabrication error, broadband wins.", fd2: "Once realistic process error is included, narrowband falls behind broadband even in its own design environment, because a frequency shift larger than the bandwidth breaks the output.",
    fd3t: "Broadband harvests evenly across 11 environments.", fd3: "The length-distributed array held 93.1% uniform, stable performance across 11 different noise environments. The mean power is similar, but the spread is far smaller.",
    fd4t: "The numbers came from measurement and verification.", fd4: "The noise is real measured spectra, the physics is a standard piezoelectric-cantilever model (PZT-5A, 70 dB SPL), and the results are checked with bootstrap confidence intervals.",
    ft_desc: "An interactive simulator of research on broadband piezoelectric harvester arrays that capture energy from noise. It is built on real measured noise spectra and a standard piezoelectric-cantilever model; the game at the top simplifies the principle so you can operate it directly. Personal research portfolio.",
    ft_back: "See the full portfolio →",
    // runtime
    r_env: "env", r_cap: "captured", r_robust: "Robustness", r_avg: "average",
    test_t: "Robustness", worst_l: "worst",
    retry_place: "Rearrange", again: "New array",
    lb_ph: "Your name to submit", lb_sub: "Submit", lb_sending: "Submitting…",
    lb_ok: "Submitted", lb_rank: "", lb_fail: "Could not submit (invalid run)",
    lb_empty: "No scores yet. Be the first.", lb_off: "Could not load the leaderboard.",
    lb_loading: "Loading…",
  };
  var lang = "ko";
  function T(k, ko) { return lang === "en" ? (EN[k] != null ? EN[k] : ko) : ko; }
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
  function lbSubmit(name, st) {
    return fetch(LB_URL, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "submit", name: name, robust: st.robust, avg: st.avg }) }).then(function (r) { return r.json(); });
  }
  function lbRow(rank, name, big, small) {
    return '<li><span class="lb-rank">' + rank + '</span><span class="lb-name">' + esc(name) +
      '</span><span class="lb-val">' + big + '</span><span class="lb-sm">' + small + '</span></li>';
  }
  function renderLB(d) {
    var el = document.getElementById("lb-list"); if (!el) return;
    var empty = '<li class="lb-empty">' + T("lb_empty", "아직 기록이 없습니다. 첫 주자가 되어보세요.") + '</li>';
    if (!d || !d.ok) { el.innerHTML = empty; return; }
    el.innerHTML = d.scores.length ? d.scores.map(function (r, i) {
      return lbRow(i + 1, r.name, (+r.robust).toFixed(0) + '%', T("r_avg", "평균") + " " + (+r.avg).toFixed(0) + '%'); }).join("") : empty;
  }
  function lbFetch() {
    fetch(LB_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "top" }) })
      .then(function (r) { return r.json(); }).then(renderLB)
      .catch(function () { var el = document.getElementById("lb-list"); if (el) el.innerHTML = '<li class="lb-empty">' + T("lb_off", "순위표를 불러오지 못했습니다.") + '</li>'; });
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

  /* ================= GAME ================= */
  var GAME = (function () {
    var cv = document.getElementById("game"); if (!cv) return null;
    var ghud = document.getElementById("ghud"), readout = document.getElementById("readout"),
      banner = document.getElementById("gbanner"), startBtn = document.getElementById("startbtn"),
      testBtn = document.getElementById("testbtn"), wireLeftEl = document.getElementById("wireleft");
    var NW = 14, HW = 1.7;               // wires, resonance half-width (bins)
    var ctx, W, Hh, PL = 44, PR = 14, PT = 16, PB = 34;  // plot padding
    var wp = [], envIdx = 3, state = "ready", drag = -1;

    function resize() { var f = fit(cv); ctx = f.ctx; W = f.w; Hh = f.h; draw(); }
    function px(pos) { return PL + pos / (NB - 1) * (W - PL - PR); }      // bin position → x
    function xToPos(x) { return Math.max(0, Math.min(NB - 1, (x - PL) / (W - PL - PR) * (NB - 1))); }
    function plotH() { return Hh - PT - PB; }

    function reset() { wp = []; for (var i = 0; i < NW; i++) wp.push((i + 0.5) / NW * (NB - 1)); envIdx = 3; }
    function start() { reset(); state = "place"; banner.classList.add("hide"); draw(); }

    function coverage() {
      var c = new Float64Array(NB);
      for (var i = 0; i < NW; i++) { var p = wp[i], lo = Math.max(0, (p - 7) | 0), hi = Math.min(NB, (p + 8) | 0);
        for (var j = lo; j < hi; j++) { var u = (j - p) / HW; c[j] += 1 / (1 + u * u); } }
      for (var j = 0; j < NB; j++) if (c[j] > 1) c[j] = 1;
      return c;
    }
    function captured(env, c) { var s = 0; for (var j = 0; j < NB; j++) s += env.psd[j] * c[j]; return s; }

    function draw() {
      if (!ctx) return; ctx.clearRect(0, 0, W, Hh);
      var env = ENVS[envIdx], c = coverage();
      var maxP = 0; for (var j = 0; j < NB; j++) if (env.psd[j] > maxP) maxP = env.psd[j];
      var ph = plotH(), y0 = PT + ph;
      // grid + freq ticks
      ctx.strokeStyle = "rgba(27,39,52,.05)"; ctx.lineWidth = 1;
      var ticks = [50, 100, 200, 500, 1000];
      ctx.fillStyle = "#93a1b2"; ctx.font = "10px 'IBM Plex Mono',monospace"; ctx.textAlign = "center";
      ticks.forEach(function (f) { var pos = fToPos(f); if (pos < 0) return; var x = px(pos);
        ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, y0); ctx.stroke();
        ctx.fillText(f >= 1000 ? "1k" : f, x, Hh - 12); });
      // noise psd area
      function Y(v) { return y0 - v / maxP * ph * 0.94; }
      ctx.beginPath(); ctx.moveTo(px(0), y0);
      for (var j = 0; j < NB; j++) ctx.lineTo(px(j), Y(env.psd[j]));
      ctx.lineTo(px(NB - 1), y0); ctx.closePath();
      ctx.fillStyle = "rgba(138,166,194,.45)"; ctx.fill();
      // captured area (psd*coverage)
      ctx.beginPath(); ctx.moveTo(px(0), y0);
      for (var j = 0; j < NB; j++) ctx.lineTo(px(j), Y(env.psd[j] * c[j]));
      ctx.lineTo(px(NB - 1), y0); ctx.closePath();
      ctx.fillStyle = "rgba(44,110,166,.62)"; ctx.fill();
      // wires
      for (var i = 0; i < NW; i++) {
        var x = px(wp[i]);
        ctx.strokeStyle = i === drag ? "#c9701f" : "rgba(224,138,60,.55)"; ctx.lineWidth = i === drag ? 2 : 1.4;
        ctx.beginPath(); ctx.moveTo(x, PT + 4); ctx.lineTo(x, y0); ctx.stroke();
        ctx.fillStyle = "#e08a3c"; ctx.beginPath(); ctx.arc(x, y0, i === drag ? 7 : 5.5, 0, 7); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      }
      // hud
      var cap = captured(env, c) * 100;
      ghud.innerHTML = '<span class="env" id="envcyc" style="cursor:pointer">' + T("r_env", "환경") + ' ' + esc(env.name) + ' &#9656;</span>';
      readout.innerHTML = '<div class="big">' + cap.toFixed(0) + '%</div><div class="cap">' + T("r_cap", "이 환경 수확") + '</div>';
      var ec = document.getElementById("envcyc"); if (ec) ec.onclick = function () { envIdx = (envIdx + 1) % NENV; draw(); };
      wireLeftEl.textContent = "0";
    }
    function fToPos(f) { // frequency → bin position (FREQ is ascending)
      if (f <= FREQ[0] || f >= FREQ[NB - 1]) return -1;
      for (var j = 1; j < NB; j++) if (FREQ[j] >= f) return (j - 1) + (f - FREQ[j - 1]) / (FREQ[j] - FREQ[j - 1]);
      return -1;
    }

    function runTest() {
      var c = coverage(), caps = ENVS.map(function (e) { return captured(e, c) * 100; });
      var robust = Math.min.apply(null, caps), avg = caps.reduce(function (a, b) { return a + b; }, 0) / NENV;
      var worst = caps.indexOf(robust), mx = Math.max.apply(null, caps) || 1;
      state = "done"; banner.classList.remove("hide");
      var bars = '<div class="envbars">' + ENVS.map(function (e, i) {
        return '<div class="envbar' + (i === worst ? ' worst' : '') + '"><div class="b" style="height:' + (caps[i] / mx * 78 + 4) +
          'px"><i style="height:' + (caps[i] / mx * 100) + '%"></i></div><div class="nm">' + esc(e.name) + '</div></div>'; }).join("") + '</div>';
      var stats = { robust: +robust.toFixed(0), avg: +avg.toFixed(0) };
      banner.innerHTML =
        '<div class="robustbig">' + T("test_t", "강건성") + ' ' + robust.toFixed(0) + '% <small>(' + T("r_avg", "평균") + ' ' + avg.toFixed(0) + '%)</small></div>' +
        bars +
        '<form class="lbform" id="lbform"><input id="lbname" maxlength="16" autocomplete="off" spellcheck="false" placeholder="' +
        T("lb_ph", "이름을 남기고 순위 등록") + '"><button class="btn" type="submit">' + T("lb_sub", "등록") + '</button></form>' +
        '<div class="lbmsg" id="lbmsg"></div>' +
        '<div class="btnrow"><button class="btn res" id="rearr">' + T("retry_place", "다시 배치") + '</button>' +
        '<button class="btn ghost" data-lb>' + T("lb_view", "순위보기") + '</button></div>';
      document.getElementById("rearr").onclick = function () { state = "place"; banner.classList.add("hide"); draw(); };
      var form = document.getElementById("lbform"), msg = document.getElementById("lbmsg");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var nmEl = document.getElementById("lbname"), nm = nmEl.value.trim();
        if (!nm) { nmEl.focus(); return; }
        form.querySelector("button").disabled = true; msg.textContent = T("lb_sending", "등록 중…");
        lbSubmit(nm, stats).then(function (r) {
          if (r && r.ok) { msg.innerHTML = T("lb_ok", "등록 완료") + ' · <b>' + r.rank + T("lb_rank", "위") + '</b>'; form.style.display = "none"; lbFetch(); }
          else { msg.textContent = T("lb_fail", "등록 실패 (기록이 유효하지 않습니다)"); form.querySelector("button").disabled = false; }
        }).catch(function () { msg.textContent = T("lb_fail", "등록 실패"); form.querySelector("button").disabled = false; });
      });
    }

    // drag input
    function pick(e) {
      if (state !== "place") return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = -1, bd = 22;
      for (var i = 0; i < NW; i++) { var d = Math.abs(px(wp[i]) - x); if (d < bd) { bd = d; best = i; } }
      if (best >= 0) { drag = best; wp[drag] = xToPos(x); draw();
        try { cv.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
    }
    cv.addEventListener("pointerdown", pick);
    cv.addEventListener("pointermove", function (e) { if (drag < 0) return; var r = cv.getBoundingClientRect(); wp[drag] = xToPos(e.clientX - r.left); draw(); });
    function up() { drag = -1; draw(); }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    startBtn.onclick = start;
    testBtn.onclick = function () { if (state === "place") runTest(); };
    addEventListener("resize", resize);
    reset(); resize();
    if (/[?&]play/.test(location.search)) setTimeout(start, 300);
    if (/[?&]test/.test(location.search)) setTimeout(function () { start(); runTest(); }, 300);
    return { refresh: function () { draw(); }, };
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
