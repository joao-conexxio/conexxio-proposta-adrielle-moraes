import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire('/Users/joaomarcosom/Dev/Conexxio/proposta-kit/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch({ channel: 'chromium' });
const p = await b.newPage({ deviceScaleFactor: 1 });
const src = 'data:image/jpeg;base64,' + fs.readFileSync('maps-fotos/m-02.jpg').toString('base64');
// monograma AM (só as letras, sem o anel) com fundo transparente, cor original
const mono = await p.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const x0 = 185, y0 = 335, w = 840, h = 480;
  const d = x.getImageData(x0, y0, w, h);
  for (let i = 0; i < d.data.length; i += 4) {
    const m = Math.max(d.data[i], d.data[i+1], d.data[i+2]);
    let a = (245 - m) / 90; a = Math.max(0, Math.min(1, a));
    d.data[i] = 0x26; d.data[i+1] = 0x30; d.data[i+2] = 0x68;
    d.data[i+3] = Math.round(a * 255);
  }
  const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').putImageData(d, 0, 0);
  return o.toDataURL('image/png');
}, src);
fs.writeFileSync('brand/monograma.png', Buffer.from(mono.split(',')[1], 'base64'));
await p.setContent(`<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@500;600&family=Jost:wght@500&display=block" rel="stylesheet">
<style>html,body{margin:0;background:transparent}
#l{display:inline-flex;align-items:center;gap:26px;padding:6px 8px}
#l img{height:104px}
#l i{width:2px;height:104px;background:#c7a467}
.n{font:500 64px/1 'Bodoni Moda';letter-spacing:.08em;color:#263068;white-space:nowrap}
</style></head><body><div id="l"><img src="${mono}"><i></i><div class="n">ADRIELLE MORAES</div></div></body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
await p.locator('#l').screenshot({ path: 'brand/logo.png', omitBackground: true });
await b.close();
