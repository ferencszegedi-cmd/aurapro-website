from PIL import Image, ImageOps
import base64, io, os, subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
TPL = open("scratch-box/template.html").read()
FONTS = open("scratch-box/fonts.css").read()

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
    b=open(out,"rb").read()
    return "data:video/mp4;base64,"+base64.b64encode(b).decode(), len(b)

img_specs = {
 "ring-wide.jpg":(1400,78), "carlos.jpg":(900,82), "carlos-wide.jpg":(1200,80),
 "gym-ring.jpg":(1200,76), "bags.jpg":(1000,75), "ring-belts.jpg":(900,75),
 "functional.jpg":(1000,75), "gym.jpg":(1100,75), "ring.jpg":(900,75),
 "posters-ceiling.jpg":(1000,74), "legends.jpg":(1000,74),
 "vid/ring-pan.jpg":(560,74), "vid/gym-tour.jpg":(560,74),
}
vid_specs = {"vid/ring-pan.mp4":(900,30), "vid/gym-tour.mp4":(900,30)}

repo = TPL.replace("{{FONTS_CSS}}", FONTS)
open("public/box/index.html","w").write(repo)
print("repo public/box/index.html:", len(repo)//1024,"KB")

stand = repo; total=0
for fn,(mw,q) in img_specs.items():
    uri,sz=img_uri("public/box/"+fn,mw,q); total+=sz
    stand=stand.replace('"%s"'%fn,'"%s"'%uri)
for fn,(hh,crf) in vid_specs.items():
    uri,sz=vid_uri("public/box/"+fn,hh,crf); total+=sz
    stand=stand.replace('"%s"'%fn,'"%s"'%uri)
open("scratch-box/standalone.html","w").write(stand)
print("embedded media:",total//1024,"KB ; standalone:",len(stand)//1024,"KB")
