// Tiny scene engine: every animation is a Web Animation, so the renderer can
// seek to any time t and screenshot a deterministic frame.
window.buildReel = function (scenes, opts = {}) {
  const stage = document.getElementById('stage');
  let total = 0;
  for (const s of scenes) {
    const el = document.createElement('div');
    el.className = 'scene ' + (s.cls || '');
    el.innerHTML = s.html;
    stage.appendChild(el);
    const start = total * 1000, dur = s.dur * 1000;
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: start, fill: 'both' });
    if (!s.last)
      el.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.04)' }],
        { duration: 300, delay: start + dur - 300, fill: 'forwards' });
    // staggered entrances for marked children
    el.querySelectorAll('[data-in]').forEach((c, i) => {
      const kind = c.dataset.in || 'up';
      const at = start + 150 + (c.dataset.at ? +c.dataset.at * 1000 : i * 220);
      const from = { up: 'translateY(60px)', left: 'translateX(-80px)', right: 'translateX(80px)', pop: 'scale(.6)', drop: 'translateY(-60px)' }[kind];
      c.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
        { duration: 420, delay: at, fill: 'both', easing: kind === 'pop' ? 'cubic-bezier(.3,1.6,.5,1)' : 'cubic-bezier(.2,.8,.2,1)' });
    });
    // optional "stamp" emphasis
    el.querySelectorAll('[data-stamp]').forEach(c => {
      const at = start + (+c.dataset.stamp) * 1000;
      c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
        { duration: 380, delay: at, fill: 'none' });
    });
    total += s.dur;
  }
  // progress bar
  const bar = document.getElementById('progress');
  if (bar) bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: total * 1000, fill: 'both' });
  window.REEL_DURATION = total;
};
window.seek = t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
