#!/usr/bin/env python3
"""Share card: draw a 1200x630 page and photograph it with headless Chrome -> docs/card.jpg"""
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "card.jpg"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0a0a1a;color:#f0e6c0;position:relative;
  font-family:Thonburi,Sathu,"Noto Serif Thai",Georgia,serif}
canvas{position:absolute;left:0;top:0}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,26,.94) 0%,rgba(10,10,26,.86) 42%,rgba(10,10,26,.15) 75%,rgba(10,10,26,0) 100%)}
.main{position:absolute;left:72px;top:92px;width:700px}
.th{font:700 96px/1.1 Sathu,"Noto Serif Thai",Thonburi,serif;color:#d4af37;white-space:nowrap}
.en{font:700 58px/1.1 Georgia,serif;color:#f0e6c0;margin-top:14px}
.sub{font:italic 28px/1.4 Georgia,serif;color:#cfc6a6;margin-top:30px;width:600px}
.by{position:absolute;left:72px;bottom:44px;font:600 20px/1 Menlo,monospace;color:#d4af37;letter-spacing:.08em}
</style></head><body>
<canvas id="c" width="1200" height="630"></canvas>
<div class="scrim"></div>
<div class="main">
  <div class="th">สามเหลี่ยมทองคำ</div>
  <div class="en">The Golden Triangle</div>
  <div class="sub">Where the Ruak meets the Mekong, and three countries face each other across the water.</div>
</div>
<div class="by">CREDIT NaN</div>
<script>
var cv=document.getElementById("c"),ctx=cv.getContext("2d");
var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
function rand(a,b){return a+rnd()*(b-a)}
var C={river:"#40a4df",thai:"#ed1c24",lao:"#002868",myanmar:"#f7d117"};
var w=1200,h=630,N=1400,mx=w*0.74,my=h*0.52;
ctx.lineWidth=1.1;
for(var i=0;i<N;i++){
  var col=[C.thai,"#3a63c9",C.myanmar][i%3];
  var px=rand(0,w),py=rand(0,h);
  var ang=Math.atan2(my-py,mx-px)+Math.sin(px*0.01)*0.4;
  ctx.strokeStyle=col;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(px,py);
  for(var k=0;k<70;k++){px+=Math.cos(ang)*3;py+=Math.sin(ang)*3;ang+=Math.sin(px*0.02+py*0.02)*0.2;ctx.lineTo(px,py);}
  ctx.stroke();
}
ctx.globalAlpha=0.9;ctx.strokeStyle=C.river;ctx.lineWidth=3;ctx.shadowColor="rgba(64,164,223,.8)";ctx.shadowBlur=14;
ctx.beginPath();
for(var x=0;x<=w;x+=8){var y=my+Math.sin(x*0.01)*14+(x<mx?(x/mx)*30:(w-x)/(w-mx)*20)+40;
  if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
ctx.stroke();
</script></body></html>"""


def main():
    from PIL import Image
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "card.html"
        shot = Path(tmp) / "card.png"
        page.write_text(PAGE, encoding="utf-8")
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--window-size=1200,630",
                        f"--screenshot={shot}", page.as_uri()],
                       check=True, capture_output=True, timeout=60)
        Image.open(shot).convert("RGB").crop((0, 0, 1200, 630)).save(OUT, "JPEG", quality=88, optimize=True)
    print(OUT)


if __name__ == "__main__":
    main()
