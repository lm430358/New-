const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30;
(async () => {
  const name = process.argv[2];
  const dir = path.join(__dirname, 'frames-' + name);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, name + '.html'));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const dur = await p.evaluate(() => window.REEL_DURATION);
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.seek(t), i / FPS);
    await p.screenshot({ path: path.join(dir, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  await b.close();
  const out = path.join(__dirname, '..', name + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(FPS),
    '-c:a', 'aac', '-movflags', '+faststart', out]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(out, dur + 's', n + ' frames');
})();
