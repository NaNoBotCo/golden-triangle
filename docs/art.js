/* Golden Triangle art — one canvas scene per page, drawn with math. */
(function () {
  "use strict";
  var COLORS = {
    gold: "#d4af37", river: "#40a4df", thai: "#ed1c24",
    lao: "#002868", myanmar: "#f7d117", muted: "#b0a890",
    text: "#f0e6c0", bg: "#0a0a1a"
  };

  var scenes = {};

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize(cv) {
    var r = cv.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height };
  }

  /* 1 Home — a flow field of fine lines, two rivers meeting, three shore colours. */
  scenes.home = function (ctx, w, h, t) {
    var N = 420;
    ctx.lineWidth = 1;
    var seeds = [];
    for (var i = 0; i < N; i++) {
      seeds.push({ x: rand(0, w), y: rand(0, h), c: [COLORS.thai, COLORS.lao, COLORS.myanmar][i % 3] });
    }
    // meeting point around (0.55w, 0.45h)
    var mx = w * 0.55, my = h * 0.45;
    seeds.forEach(function (s) {
      var ang = Math.atan2(my - s.y, mx - s.x) + Math.sin(t + s.x * 0.01) * 0.4;
      var step = 3;
      var x = s.x, y = s.y;
      ctx.strokeStyle = s.c;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (var k = 0; k < 70; k++) {
        x += Math.cos(ang) * step; y += Math.sin(ang) * step;
        ang += Math.sin(t + x * 0.02 + y * 0.02) * 0.2;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    // river ribbon
    ctx.strokeStyle = COLORS.river;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x = 0; x <= w; x += 8) {
      var y = my + Math.sin(x * 0.01 + t) * 14 + (x < mx ? (x / mx) * 30 : (w - x) / (w - mx) * 20);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  /* 2 History — a timeline that settles like silt, dots for each event. */
  scenes.history = function (ctx, w, h, t) {
    var dots = [0.08, 0.22, 0.36, 0.5, 0.62, 0.74, 0.9];
    var y = h * 0.55 + Math.sin(t * 0.5) * 3;
    ctx.strokeStyle = COLORS.gold;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    dots.forEach(function (d, i) {
      var x = w * d;
      var settle = Math.abs(Math.sin(t * 0.6 + i)) * 8;
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath();
      ctx.arc(x, y + settle, 3 + i * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // silt fall
      ctx.strokeStyle = COLORS.muted;
      ctx.globalAlpha = 0.3;
      for (var k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.moveTo(x + rand(-6, 6), y + 10 + k * 6);
        ctx.lineTo(x + rand(-6, 6), y + 16 + k * 6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  };

  /* 3 Sop Ruak — ripples spreading from a touch, like water. */
  scenes.sopruak = function (ctx, w, h, t) {
    var cx = w * 0.5, cy = h * 0.5;
    ctx.fillStyle = COLORS.bg;
    for (var i = 0; i < 7; i++) {
      var ph = (t * 0.6 + i / 7) % 1;
      var r = ph * Math.min(w, h) * 0.6;
      ctx.strokeStyle = COLORS.river;
      ctx.globalAlpha = (1 - ph) * 0.6;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  /* 4 Chiang Saen — golden outline of old city walls and moat. */
  scenes.chiangsaen = function (ctx, w, h, t) {
    var cx = w / 2, cy = h / 2;
    var rw = Math.min(w, h) * 0.38, rh = rw * 0.62;
    ctx.strokeStyle = COLORS.gold;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - rw, cy - rh, rw * 2, rh * 2);
    // moat
    ctx.strokeStyle = COLORS.river;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(cx - rw - 10, cy - rh - 10, (rw + 10) * 2, (rh + 10) * 2);
    // corner towers
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.gold;
    [[-rw, -rh], [rw, -rh], [-rw, rh], [rw, rh]].forEach(function (c) {
      ctx.beginPath();
      ctx.arc(cx + c[0], cy + c[1], 4 + Math.sin(t + c[0]) * 1, 0, Math.PI * 2);
      ctx.fill();
    });
    // gate on each side
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - rh); ctx.lineTo(cx + 8, cy - rh);
    ctx.moveTo(cx - 8, cy + rh); ctx.lineTo(cx + 8, cy + rh);
    ctx.stroke();
  };

  /* 5 Hills — contour lines, slow drift like mist. */
  scenes.hills = function (ctx, w, h, t) {
    ctx.lineWidth = 1.2;
    for (var l = 0; l < 14; l++) {
      var y0 = h * (0.2 + l * 0.05) + Math.sin(t * 0.3 + l) * 6;
      ctx.strokeStyle = COLORS.gold;
      ctx.globalAlpha = 0.15 + l * 0.03;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 8) {
        var y = y0 + Math.sin(x * 0.015 + l * 1.4 + t * 0.2) * 18 + Math.sin(x * 0.03 + l) * 8;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  /* 6 River — gold light of late afternoon on moving water. */
  scenes.river = function (ctx, w, h, t) {
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#2a1f0a");
    grad.addColorStop(1, "#0a0a1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2;
    for (var i = 0; i < 60; i++) {
      var y = h * (0.25 + (i / 60) * 0.7);
      var a = 0.1 + 0.5 * (i / 60);
      ctx.strokeStyle = COLORS.gold;
      ctx.globalAlpha = a;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 6) {
        var yy = y + Math.sin(x * 0.04 + t * 1.2 + i * 0.6) * 5;
        if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  /* 7 People — weaving pattern of coloured lines, one colour per group. */
  scenes.people = function (ctx, w, h, t) {
    var groups = [COLORS.thai, COLORS.lao, COLORS.myanmar, COLORS.river, COLORS.gold, COLORS.muted, "#c9a227", "#7b3f8a"];
    ctx.lineWidth = 2;
    for (var i = 0; i < 24; i++) {
      var x0 = i * (w / 24) + Math.sin(t + i) * 3;
      ctx.strokeStyle = groups[i % groups.length];
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (var y = 0; y <= h; y += 8) {
        var x = x0 + Math.sin(y * 0.02 + i * 0.7 + t) * 12;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  /* 8 Visit — compass rose and a route line in golden strokes. */
  scenes.visit = function (ctx, w, h, t) {
    var cx = w * 0.5, cy = h * 0.5;
    var R = Math.min(w, h) * 0.32;
    ctx.strokeStyle = COLORS.gold;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    // compass points
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.moveTo(cx, cy - R); ctx.lineTo(cx - 6, cy - R + 12); ctx.lineTo(cx + 6, cy - R + 12); ctx.closePath();
    ctx.fill();
    // route line
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = COLORS.river;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    var pts = [[0.15, 0.75], [0.35, 0.55], [0.5, 0.5], [0.68, 0.35], [0.85, 0.25]];
    pts.forEach(function (p, i) {
      var x = w * p[0], y = h * p[1];
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  /* 9 Sources — a quiet constellation of dots. */
  scenes.sources = function (ctx, w, h, t) {
    var pts = [];
    for (var i = 0; i < 26; i++) {
      pts.push({ x: rand(0.08, 0.92) * w, y: rand(0.1, 0.9) * h, r: rand(1, 2.5), ph: rand(0, 1) });
    }
    pts.forEach(function (p) {
      var tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + p.ph * 6));
      ctx.fillStyle = COLORS.gold;
      ctx.globalAlpha = tw;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // faint links
    ctx.strokeStyle = COLORS.muted;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 1;
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
        if (dx * dx + dy * dy < 120 * 120) {
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function draw(cv, name) {
    var dim = resize(cv);
    var ctx = cv.getContext("2d");
    var t = reduced ? 0.5 : 0;
    function frame() {
      if (reduced) {
        scenes[name](ctx, dim.w, dim.h, 0.5);
        return;
      }
      t = (Date.now() / 1000);
      scenes[name](ctx, dim.w, dim.h, t);
      requestAnimationFrame(frame);
    }
    frame();
  }

  function init() {
    var wraps = document.querySelectorAll(".canvas-wrap canvas");
    wraps.forEach(function (cv) {
      var name = cv.getAttribute("data-scene") || "home";
      if (scenes[name]) draw(cv, name);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();