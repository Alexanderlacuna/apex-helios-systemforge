/* APEX HELIOS SYSTEMFORGE — hero starfield + comets
   Canvas-based so a few hundred particles stay cheap.
   Pauses when the hero scrolls away or the tab is hidden.
   Renders one static frame when the user prefers reduced motion. */
(function () {
  "use strict";

  var canvas = document.getElementById("heroStars");
  if (!canvas) return;

  var hero = canvas.closest(".hero") || canvas.parentElement;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var stars = [], comets = [];
  var raf = 0, last = 0, clock = 0, nextComet = 2600;
  var tabVisible = true, onScreen = true;

  /* brand palette, as "r, g, b" so alpha can be appended cheaply */
  var AMBER = "255, 196, 107";
  var WHITE = "233, 237, 246";
  var BLUE  = "77, 141, 255";

  function seed() {
    var density = Math.min(150, Math.max(36, Math.round((W * H) / 13000)));
    stars = [];
    for (var i = 0; i < density; i++) {
      var depth = Math.random();                       /* 0 far … 1 near */
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.35 + depth * 1.2,
        vx: 4 + depth * 26,                            /* px/sec, drifting right */
        a: 0.14 + depth * 0.46,
        tw: 0.5 + Math.random() * 1.5,                 /* twinkle rate */
        ph: Math.random() * Math.PI * 2,
        c: Math.random() < 0.14
          ? (Math.random() < 0.5 ? BLUE : AMBER)
          : WHITE
      });
    }
    comets = [];
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduce) drawStatic();
  }

  function dot(x, y, radius, alpha, colour) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(" + colour + "," + alpha.toFixed(3) + ")";
    ctx.fill();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      dot(s.x, s.y, s.r, s.a, s.c);
    }
  }

  function spawnComet() {
    var fromLeft = Math.random() < 0.78;
    var speed = 240 + Math.random() * 210;
    comets.push({
      x: fromLeft ? -70 : W + 70,
      y: Math.random() * H * 0.82,
      vx: fromLeft ? speed : -speed,
      vy: 24 + Math.random() * 38,
      len: 110 + Math.random() * 140,
      life: 0,
      max: 3.6,
      c: Math.random() < 0.55 ? AMBER : WHITE
    });
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);

    if (!last) last = now;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;

    nextComet -= dt * 1000;
    if (nextComet <= 0) {
      spawnComet();
      nextComet = 4200 + Math.random() * 6200;
    }

    ctx.clearRect(0, 0, W, H);

    /* drifting field */
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += s.vx * dt;
      if (s.x - s.r > W) s.x = -s.r;
      var tw = 0.72 + 0.28 * Math.sin(clock * s.tw + s.ph);
      dot(s.x, s.y, s.r, s.a * tw, s.c);
    }

    /* comets */
    for (var j = comets.length - 1; j >= 0; j--) {
      var k = comets[j];
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.life += dt;

      var fade = Math.max(0, 1 - k.life / k.max);
      if (fade > 0) {
        var n = Math.sqrt(k.vx * k.vx + k.vy * k.vy) || 1;
        var tx = k.x - (k.vx / n) * k.len;
        var ty = k.y - (k.vy / n) * k.len;

        var g = ctx.createLinearGradient(k.x, k.y, tx, ty);
        g.addColorStop(0, "rgba(" + k.c + "," + (0.80 * fade).toFixed(3) + ")");
        g.addColorStop(0.45, "rgba(" + k.c + "," + (0.20 * fade).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + k.c + ",0)");

        var glow = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, 15);
        glow.addColorStop(0, "rgba(" + k.c + "," + (0.30 * fade).toFixed(3) + ")");
        glow.addColorStop(1, "rgba(" + k.c + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(k.x, k.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = g;
        ctx.lineWidth = 1.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(k.x, k.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        dot(k.x, k.y, 2, 0.95 * fade, k.c);
      }

      if (k.life > k.max || k.x < -k.len - 80 || k.x > W + k.len + 80) {
        comets.splice(j, 1);
      }
    }
  }

  function start() {
    if (reduce || raf) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function shouldRun() {
    return tabVisible && onScreen;
  }

  resize();

  if (reduce) {
    window.addEventListener("resize", function () {
      clearTimeout(resize._t);
      resize._t = setTimeout(resize, 160);
    });
    return;
  }

  window.addEventListener("resize", function () {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 160);
  });

  window.addEventListener("load", resize);

  document.addEventListener("visibilitychange", function () {
    tabVisible = !document.hidden;
    if (shouldRun()) start(); else stop();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (shouldRun()) start(); else stop();
    }, { threshold: 0 }).observe(hero);
  }

  if (shouldRun()) start();
})();
