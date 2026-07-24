#!/usr/bin/env python3
# Budaors Box Academy - build script
# Futtatas a repo gyokerebol:  python3 box-src/build.py
# Kell hozza: pip install Pillow imageio-ffmpeg
from PIL import Image, ImageOps
import base64, io, os, subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(__file__)
TPL = open(os.path.join(HERE, "template.html")).read()
FONTS = open(os.path.join(HERE, "fonts.css")).read()

def img_uri(path, maxw, q):
    im=Image.open(path); im=ImageOps.exif_transpose(im)
    if im.mode!="RGB": im=im.convert("RGB")
    w,h=im.size
    if w>maxw: im=im.resize((maxw,int(h*maxw/w)),Image.LANCZOS)
    buf=io.BytesIO(); im.save(buf,"JPEG",quality=q,optimize=True,progressive=True)
    b=buf.getvalue()
    return "data:image/jpeg;base64,"+base64.b64encode(b).decode(), len(b)

def vid_uri(path, h, crf=30):
    out="/tmp/_v.mp4"
    subprocess.run([FF,"-y","-i",path,"-an","-vf",f"scale=-2:{h}:flags=lanczos,format=yuv420p",
        "-c:v","libx264","-profile:v","main","-crf",str(crf),"-preset","slow","-movflags","+faststart",out],
        capture_output=True)
    return "data:video/mp4;base64,"+base64.b64encode(open(out,"rb").read()).decode(), os.path.getsize(out)

img_specs = {
 "ring-wide.jpg":(1400,78), "carlos.jpg":(900,82), "carlos-wide.jpg":(1200,80),
 "gym-ring.jpg":(1200,76), "bags.jpg":(1000,75), "ring-belts.jpg":(900,75),
 "functional.jpg":(1000,75), "gym.jpg":(1100,75), "ring.jpg":(900,75),
 "posters-ceiling.jpg":(1000,74), "legends.jpg":(1000,74),
 "vid/ring-pan.jpg":(560,74), "vid/gym-tour.jpg":(560,74),
}
vid_specs = {"vid/ring-pan.mp4":(900,30), "vid/gym-tour.mp4":(900,30)}

# 1) public/box/index.html  -> onallo (betutipus beagyazva, kepek relativ ./*.jpg)
repo = TPL.replace("{{FONTS_CSS}}", FONTS)
open("public/box/index.html","w").write(repo)
print("public/box/index.html kesz")

# 2) box-src/standalone.html -> teljesen onallo (kepek+videok is beagyazva) -> ez megy Artifactnak
stand = repo
for fn,(mw,q) in img_specs.items():
    uri,_=img_uri("public/box/"+fn,mw,q); stand=stand.replace('"%s"'%fn,'"%s"'%uri)
for fn,(hh,crf) in vid_specs.items():
    uri,_=vid_uri("public/box/"+fn,hh,crf); stand=stand.replace('"%s"'%fn,'"%s"'%uri)
open(os.path.join(HERE,"standalone.html"),"w").write(stand)
print("box-src/standalone.html kesz")
print("KESZ. A publikalashoz: public/box/ mappat tedd ki Vercelre (Root Directory: public/box).")
