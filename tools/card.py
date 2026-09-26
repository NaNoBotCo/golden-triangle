#!/usr/bin/env python3
"""Share card: draw a 1200x630 page and photograph it with headless Chrome -> docs/card.png"""
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "card.png"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0a0a1a;color:#f0e6c0;position:relative;
  font-family:Thonburi,Sathu,"Noto Serif Thai",Georgia,serif}
.glow{position:absolute;inset:0;background:radial-gradient(60% 70% at 68% 42%,rgba(212,175,55,.28),transparent 70%)}
.river{position:absolute;left:0;right:0;top:340px;height:2px;background:#40a4df;box-shadow:0 0 18px rgba(64,164,223,.6)}
.rib{position:absolute;top:300px;height:3px;opacity:.35}
.main{position:absolute;left:76px;top:96px;width:640px}
.th{font:700 104px/1.05 Sathu,"Noto Serif Thai",Thonburi,serif;color:#d4af37}
.en{font:700 56px/1 Georgia,serif;color:#f0e6c0;margin-top:8px}
.sub{font:italic 28px/1.4 Georgia,serif;color:#b0a890;margin-top:26px}
.thsub{font:500 26px/1.4 Thonburi,"Noto Sans Thai",sans-serif;color:#b0a890;margin-top:10px}
.by{position:absolute;left:76px;bottom:46px;font:600 20px/1 Menlo,monospace;color:#d4af37;letter-spacing:.08em}
</style></head><body><div class="glow"></div>
<div class="river"></div>
<canvas id="c" width="1200" height="630"></canvas>
<div class="main">
  <div class="th">สามเหลี่ยมทองคำ</div>
  <div class="en">The Golden Triangle</div>
  <div class="sub">Where the Ruak meets the Mekong, and three countries face each other across the water.</div>
  <div class="thsub">ที่แม่น้ำรวกบรรจบกับแม่น้ำโขง สามประเทศหันหน้าเข้าหากันกลางสายน้ำ</div>
</div>
<div class="by">CREDIT NaN</div>
<script>
var cv=document.getElementById("c"),x=cv.getContext("2d");
var C={gold:"#d4af37",river:"#40a4df",thai:"#ed1c24",lao:"#002868",myanmar:"#f7d117"};
function rand(a,b){return a+Math.random()*(b-a)}
var N=420,seeds=[],mx=1200*0.55,my=400;
for(var i=0;i<N;i++)seeds.push({x:rand(0,1200),y:rand(0,630),c:[C.thai,C.lao,C.myanmar][i%3]});
seeds.forEach(function(s){
  var ang=Math.atan2(my-s.y,mx-s.x)+Math.sin(s.x*0.01)*0.4,x=s.x,y=s.y;
  x.strokeStyle=s.c;x.globalAlpha=0.35;x.beginPath();x.moveTo(x,y);
  for(var k=0;k<60;k++){x+=Math.cos(ang)*3;y+=Math.sin(ang)*3;ang+=Math.sin(x*0.02+y*0.02)*0.2;x.lineTo(x,y);}
  x.stroke();
});
x.globalAlpha=1;
</script></body></html>"""


def main():
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "card.html"
        page.write_text(PAGE.replace("CREDIT NaN", "CREDIT NaN"), encoding="utf-8")
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--window-size=1200,630",
                        f"--screenshot={OUT}", page.as_uri()],
                       check=True, capture_output=True, timeout=60)
    print(OUT)


if __name__ == "__main__":
    main()