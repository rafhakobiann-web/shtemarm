#!/usr/bin/env python3
"""Import source-anchored text MC tasks from owner-supplied 2018 PDFs.

Usage: python scripts/import-biology-source.py SOURCE3 SOURCE4
Requires PyMuPDF. No PDF bytes or screenshots are written to the repository.
Only complete, text-only four-choice tasks with an indexed printed key enter
the playable bank. All exclusions are explicit in the coverage manifest.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
ALPHABET = 'ԱաԲբԳգԴդԵեԶզԷէԸըԹթԺժԻիԼլԽխԾծԿկՀհՁձՂղՃճՄմՅյՆնՇշՈոՉչՊպՋջՌռՍսՎվՏտՐրՑցՒւՓփՔքՕօՖֆ'
MAP = {178+i: ch for i, ch in enumerate(ALPHABET)}
MAP.update({162:'և',163:'։',164:')',165:'(',166:'»',167:'«',168:'և',169:'.',170:'՝',171:',',172:'-',173:'֊',174:'…',175:'՜',176:'՛',177:'՞'})

def decode(text, font):
    if 'Armenian' not in font:
        return text
    return ''.join('բ' if ch == 'μ' else MAP.get(ord(ch), ch) for ch in text)

def spans(page):
    return [dict(s, direction=line['dir']) for block in page.get_text('dict')['blocks'] if 'lines' in block
            for line in block['lines'] for s in line['spans']]

def marker(s):
    return (re.fullmatch(r'\d{1,4}', s['text'].strip()) and 'Bold' in s['font']
            and min(abs(s['bbox'][0]-42.24),abs(s['bbox'][0]-56.42)) < 2
            and s['direction'] == (1.0, 0.0))

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',',':'))+'\n')

def run(volume, source):
    index = json.loads((ROOT/f'public/data/biology-original-volume{volume}-index.json').read_text())
    digest = hashlib.sha256(Path(source).read_bytes()).hexdigest()
    if digest != index['sourceSha256']:
        raise ValueError('Source fingerprint mismatch')
    doc = fitz.open(source)
    book = {'id':30+volume, 'source':{'editionYear':2018,'sha256':digest,'kind':'source-transcription','complete':False}, 'sections':[]}
    coverage = {'volume':volume,'sourceSha256':digest,'indexedQuestions':sum(c['questionCount'] for c in index['chapters']), 'chapters':[]}
    for chapter in index['chapters']:
        units, exclusions = [], []
        pages = {n:spans(doc[n-1]) for n in range(chapter['startPage'],chapter['endPage']+1)}
        anchors = {}
        for page, items in pages.items():
            for s in items:
                if marker(s):
                    anchors.setdefault(int(s['text']),[]).append((page,s))
        for number in range(1,chapter['questionCount']+1):
            reason = None
            if number > len(chapter['choiceKeys']): reason = 'answer-type-pending'
            found = anchors.get(number,[])
            if not reason and len(found) != 1: reason = 'ambiguous-number'
            if reason:
                exclusions.append({'n':number,'reason':reason}); continue
            page, start = found[0]
            others = [s['bbox'][1] for s in pages[page] if marker(s) and s['bbox'][1]>start['bbox'][1]+2]
            bottom = min(others) if others else min(620,doc[page-1].rect.height-42)
            top = start['bbox'][1]-1
            # Do not silently lose a continuation onto the following page.
            next_anchor = anchors.get(number+1,[])
            if not others and next_anchor and next_anchor[0][0] > page:
                before = [s for s in pages[next_anchor[0][0]] if s['bbox'][1] < next_anchor[0][1]['bbox'][1]-2 and 40<s['bbox'][0]<430 and s['bbox'][1]>30 and s['direction']==(1.0,0.0)]
                if before: reason = 'cross-page-review'
            crop = fitz.Rect(55,top,431,bottom)
            if any(crop.intersects(fitz.Rect(img['bbox'])) for img in doc[page-1].get_image_info()): reason='figure-review'
            if any(crop.intersects(d['rect']) and d['rect'].width>8 and d['rect'].height>8 for d in doc[page-1].get_drawings()): reason='figure-review'
            items = [s for s in pages[page] if not marker(s) and s['direction']==(1.0,0.0)
                     and s['bbox'][0]>47.4 and s['bbox'][0]<445 and top <= s['bbox'][1]<bottom-1]
            lines=[]
            for s in sorted(items,key=lambda s:(round(s['bbox'][1]/2)*2,s['bbox'][0])):
                if lines and abs(lines[-1][0]-s['bbox'][1])<3: lines[-1][1].append(s)
                else: lines.append([s['bbox'][1],[s]])
            clean=[' '.join(decode(s['text'],s['font']) for s in sorted(line,key=lambda s:s['bbox'][0])).strip() for _,line in lines]
            clean=[re.sub(r'^\.\s*','',x) for x in clean if x]
            stem, options, current = [], {}, None
            for line in clean:
                m=re.match(r'^([1-4])\s*\)\s*(.*)',line)
                if m:
                    if m[1] in options: reason='repeated-option'
                    current=m[1]; options[current]=m[2]
                elif current: options[current]+=' '+line
                else: stem.append(line)
            stem=' '.join(stem)
            if re.search(r'նկար|գծապատկեր|սխեմա|պատկերված',stem,re.I): reason='figure-review'
            if list(options)!=['1','2','3','4'] or not all(options.values()) or len(stem)<10: reason='incomplete-text'
            text=stem+' '+' '.join(options.values())
            if any(s['size'] < 8 for s in items): reason='formula-review'
            if '\ufffd' in text or re.search(r'[\u00b2-\u00ff]',text): reason='encoding-review'
            if reason:
                exclusions.append({'n':number,'page':page,'reason':reason}); continue
            units.append({'id':f'bio{volume}-s{chapter["id"]}-q{number}', 'label':str(number),'kind':'mc','passage':'',
                          'sourcePage':page,'questions':[{'n':str(number),'stem':stem,'options':options,'answer':chapter['choiceKeys'][number-1]}]})
        if units: book['sections'].append({'n':chapter['id'],'label':chapter['title'],'instr_en':'','instr_hy':'Ընտրե՛ք ճիշտ պատասխանը։','units':units})
        coverage['chapters'].append({'id':chapter['id'],'imported':len(units),'excluded':exclusions})
    coverage['importedQuestions']=sum(c['imported'] for c in coverage['chapters'])
    write(ROOT/f'public/data/bio-book{volume}.json',book)
    write(ROOT/f'public/data/biology-volume{volume}-coverage.json',coverage)
    print(volume,coverage['importedQuestions'],[(c['id'],c['imported']) for c in coverage['chapters']])

if __name__ == '__main__':
    for volume, source in zip((3,4), sys.argv[1:], strict=True): run(volume,source)
