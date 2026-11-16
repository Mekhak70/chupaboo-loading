"""Render the Armenian guide from six browser screenshots.
Usage: python render-donut-guide.py /path/to/captures
Requires: pillow, imageio-ffmpeg. Captures are 01.jpg through 06.jpg.
"""
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
OUT = ROOT / 'public' / 'guides'
OUT.mkdir(exist_ok=True)
W, H, FPS, SECONDS = 1280, 896, 12, 4
FONT = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
title_font = ImageFont.truetype(FONT, 32)
body_font = ImageFont.truetype(FONT, 23)
small_font = ImageFont.truetype(FONT, 18)
steps = [
    ('Հավաքիր քո դոնաթների բոքսը', 'Քանակ, տեսքեր, բաղադրություն և զամբյուղ՝ մի քանի սեղմումով։', None),
    ('1. Ընտրիր 2, 4 կամ 6 հատ', 'Բոքսի պատկերում կերևա հենց քո ընտրած քանակը։', (676, 320, 990, 380)),
    ('2. Ընտրիր տեսքը՝ սեղմելով նկարին', 'Կայքն ինքն անցնում է հաջորդ դատարկ դոնաթին։', None),
    ('Նույն տեսքո՞վ ես ուզում բոլորը', 'Սեղմիր «Բոլորը՝ առաջինի տեսքով»․ կարող ես նաև տարբեր տեսքեր ընտրել։', None),
    ('3. Բաղադրությունը՝ զույգերով', 'Բացիր «Բաղադրություն» բաժինը․ 1–2, 3–4 և 5–6 հատերը նույն բաղադրությունն ունեն։', (678, 425, 1252, 585)),
    ('4. Ստուգիր և ավելացրու զամբյուղ', 'Զամբյուղից շարունակիր պատվերը՝ լրացնելով առաքման տվյալները։', None),
]
shots = [Image.open(SOURCE / f'{i:02}.jpg').convert('RGB') for i in range(1, 7)]
writer = imageio_ffmpeg.write_frames(str(OUT / 'donut-box-guide.mp4'), (W,H), fps=FPS, codec='libx264', pix_fmt_in='rgb24', pix_fmt_out='yuv420p', quality=7, macro_block_size=16, output_params=['-movflags', '+faststart'])
writer.send(None)
for step, (title, subtitle, highlight) in enumerate(steps):
    for frame in range(FPS * SECONDS):
        canvas = Image.new('RGB', (W,H), '#f8f5fb')
        draw = ImageDraw.Draw(canvas)
        draw.text((34,18), 'CHUPABOO', font=small_font, fill='#69429a')
        draw.text((34,50), title, font=title_font, fill='#442566')
        # Wrap Armenian captions to keep them readable at full-screen size.
        lines, line = [], ''
        for word in subtitle.split():
            candidate = (line + ' ' + word).strip()
            if draw.textlength(candidate,font=body_font) > W-68:
                lines.append(line);line=word
            else: line=candidate
        lines.append(line)
        for row, line in enumerate(lines): draw.text((34,96+row*28),line,font=body_font,fill='#6a5a77')
        shot = shots[step].resize((1152,648), Image.Resampling.LANCZOS)
        canvas.paste(shot,(64,170))
        draw.rounded_rectangle((63,169,1217,819),radius=4,outline='#ded5e8',width=2)
        if highlight:
            x1,y1,x2,y2=highlight
            draw.rounded_rectangle((64+x1*.9,170+y1*.9,64+x2*.9,170+y2*.9),radius=12,outline='#aed137',width=5)
        for i in range(len(steps)):
            left = 64+i*194
            draw.rounded_rectangle((left,842,left+178,848),radius=3,fill='#e4dceb')
            if i<=step:
                progress=1 if i<step else (frame+1)/(FPS*SECONDS)
                draw.rounded_rectangle((left,842,left+max(3,int(178*progress)),848),radius=3,fill='#69429a')
        draw.text((64,860), 'Ուղեցույց · առանց ձայնի',font=small_font,fill='#85758f')
        draw.text((1130,860),f'{step+1} / 6',font=small_font,fill='#69429a')
        if step==3 and frame==0: canvas.save(OUT / 'donut-box-guide-poster.jpg',quality=90)
        writer.send(canvas.tobytes())
writer.close()
print(OUT / 'donut-box-guide.mp4')
