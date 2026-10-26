#!/usr/bin/env python3
"""Extract the remaining mathematics questions as Unicode text with native math layout.

Usage: python transcribe-math-books.py --pdf-dir /path/to/pdfs
Requires PyMuPDF, fontTools and reportlab. No OCR, API keys or network calls.
The positioned runs are selectable Unicode; paths retain fraction/radical rules.
Shared instructions are stored once per task. Every subquestion is split at its
own printed label, independently of the old screenshot ranges.
"""
from __future__ import annotations
import argparse, collections, hashlib, json, re, subprocess
from pathlib import Path
import fitz
from fontTools.agl import toUnicode
from reportlab.pdfbase._fontdata_enc_symbol import SymbolEncoding

ROOT=Path(__file__).resolve().parents[1]
NUM=re.compile(r'^\s*(\d+)[.©]\s*')
ARM={}
for n in range(160,256):
    p=subprocess.run(['iconv','-f','ARMSCII-8','-t','UTF-8'],input=bytes([n]),capture_output=True)
    if p.returncode==0: ARM[chr(n)]=p.stdout.decode()
# Times Armenian uses 0xA8 for the Armenian ligature, unlike the iconv table.
ARM['¨']='և'
SYMBOL={chr(0xF000+n):toUnicode(g) for n,g in enumerate(SymbolEncoding) if g}
# Unicode Technical glyphs replace the Adobe private-use bracket pieces.
PARTS=dict(zip(range(0xE6,0xFF),'⎛⎜⎝⎡⎢⎣⎧⎨⎩⎪\0\0\0\0\0\0⎞⎟⎠⎤⎥⎦⎫⎬⎭'))
for n,c in PARTS.items():
    if c!='\0': SYMBOL[chr(0xF000+n)]=c
SYMBOL.update({'\uf0be':'⎯','\uf0bd':'⎮'})
# These codes are used for horizontal vector accents by MathType.
EXTRA={'\uf075':'⎯','\uf072':'→','\uf076':'↔','\uf06f':'∘'}


def decode(text,font):
    if font in ('TimesArmenianPSMT','ArialArmenianMT','ArialAMU'):
        return ''.join(ARM.get(c,c) for c in text).replace('Ē','·')
    if font=='SymbolMT': return ''.join(SYMBOL.get(c,c) for c in text)
    if font=='MT-Extra': return ''.join(EXTRA.get(c,c) for c in text)
    return text


def round2(n): return round(float(n),2)


def cached_page(doc,pn):
    p=doc[pn-1]; spans=[]; markers=[]
    trace_positions={}
    for tr in p.get_texttrace():
        for ch in tr['chars']:
            key=(round2(ch[2][0]),round2(ch[2][1]))
            trace_positions.setdefault(key,tr['seqno'])
    def seq_for(s):
        found=[trace_positions[(round2(c['origin'][0]),round2(c['origin'][1]))] for c in s['chars'] if c['c'].strip() and (round2(c['origin'][0]),round2(c['origin'][1])) in trace_positions]
        if found:return min(found)
        x,y=next(c['origin'] for c in s['chars'] if c['c'].strip())
        key=min(trace_positions,key=lambda k:abs(k[0]-x)+abs(k[1]-y))
        if abs(key[0]-x)+abs(key[1]-y)>1:raise ValueError('Unmatched source span')
        return trace_positions[key]
    for b in p.get_text('rawdict')['blocks']:
        for l in b.get('lines',[]):
            if abs(l['dir'][0]-1)>0.01: continue # diagonal source watermark
            visible=[s for s in l['spans'] if ''.join(c['c'] for c in s['chars']).strip()]
            if visible:
                s=visible[0]; text=''.join(c['c'] for c in s['chars'])
                m=NUM.match(text)
                if m and 32<s['bbox'][0]<64 and s['size']>=10:
                    markers.append({'page':pn,'y':s['bbox'][1],'n':int(m[1]),'x':s['bbox'][0],
                                    'len':len(m[0]),'seq':seq_for(s)})
            for s in l['spans']:
                if not ''.join(c['c'] for c in s['chars']).strip(): continue
                if s['size']<8 and s['bbox'][1]<45: continue
                if s['bbox'][1]<45: continue
                # Source page numbers sit at the bottom center.
                txt=''.join(c['c'] for c in s['chars']).strip()
                if txt==str(pn) and abs(s['bbox'][0]-220)<25: continue
                s['seq']=seq_for(s)
                spans.append(s)
    spans.sort(key=lambda s:(s['bbox'][1],s['bbox'][0]))
    markers.sort(key=lambda m:m['y'])
    drawings=[]
    for d in p.get_drawings():
        if d['rect'].y0<45 or d['rect'].y1>635:continue
        # Skip the page background and white masks.
        if d['fill'] is not None and min(d['fill'])>0.85:continue
        drawings.append(d)
    return {'page':p,'spans':spans,'markers':markers,'drawings':drawings,'images':p.get_image_info(xrefs=True)}


def where(m): return (m['page'],m['y'])


def split_section(pages,sec,cache,book):
    ms=[m for p in pages for m in cache[p]['markers']]
    k=6 if sec['chapter']==3 else 2 if sec['chapter']==2 and sec['section']==8 else 4
    expected=len(sec['tasks']); groups=[];i=0
    while i<len(ms):
        head=ms[i];subs=ms[i+1:i+1+k]
        if [m['n'] for m in subs]!=list(range(1,k+1)):
            raise ValueError(f'{book} {sec["chapter"]}-{sec["section"]}: invalid labels at {head}; following={subs}')
        groups.append({'header':head,'subs':subs});i+=k+1
    if len(groups)!=expected: raise ValueError(f'{book}: {len(groups)} tasks, expected {expected}')
    for j,g in enumerate(groups):
        g['end']=groups[j+1]['header'] if j+1<len(groups) else {'page':pages[-1],'y':635}
        g['task']=j+1
    return groups


def path_string(d,x0,y0):
    out=[]
    def pt(p):return f'{round2(p.x-x0)} {round2(p.y-y0)}'
    for item in d['items']:
        t=item[0]
        if t=='l':out.extend([f'M{pt(item[1])}',f'L{pt(item[2])}'])
        elif t=='c':out.extend([f'M{pt(item[1])}',f'C{pt(item[2])} {pt(item[3])} {pt(item[4])}'])
        elif t=='re':
            r=item[1];out.append(f'M{round2(r.x0-x0)} {round2(r.y0-y0)}h{round2(r.width)}v{round2(r.height)}h{-round2(r.width)}Z')
        elif t=='qu':
            q=item[1];out.append(f'M{pt(q.ul)}L{pt(q.ur)}L{pt(q.lr)}L{pt(q.ll)}Z')
        else:raise ValueError('Unknown drawing '+t)
    # Filled multi-segment shapes must be connected, rather than restarting
    # every segment (radicals are filled polygons in these PDFs).
    if d['fill'] is not None:
        out=[];last=None
        for item in d['items']:
            t=item[0]
            if t=='l':
                if last is None or abs(last.x-item[1].x)+abs(last.y-item[1].y)>0.05:out.append('M'+pt(item[1]))
                out.append('L'+pt(item[2]));last=item[2]
            elif t=='c':
                if last is None or abs(last.x-item[1].x)+abs(last.y-item[1].y)>0.05:out.append('M'+pt(item[1]))
                out.append(f'C{pt(item[2])} {pt(item[3])} {pt(item[4])}');last=item[4]
            elif t=='re':
                r=item[1];out.append(f'M{round2(r.x0-x0)} {round2(r.y0-y0)}h{round2(r.width)}v{round2(r.height)}h{-round2(r.width)}Z');last=None
            elif t=='qu':
                q=item[1];out.append(f'M{pt(q.ul)}L{pt(q.ur)}L{pt(q.lr)}L{pt(q.ll)}Z');last=None
        if d['closePath']:out.append('Z')
    return ''.join(out)


def extract(cache,start,end,skip_label=True):
    result=[];plain=[];raster=[]
    for pn in range(start['page'],end['page']+1):
        lo=start['y']-3 if pn==start['page'] else 45
        hi=end['y']-3 if pn==end['page'] else 635
        if hi<=lo:continue
        pg=cache[pn]; selected=[]
        for s in pg['spans']:
            # Use top of the source text, allowing raised exponents to extend above.
            seq_lo=start.get('seq',-1) if pn==start['page'] else -1
            seq_hi=end.get('seq',float('inf')) if pn==end['page'] else float('inf')
            if seq_lo<=s['seq']<seq_hi:
                cs=list(s['chars'])
                if skip_label and pn==start['page'] and abs(s['bbox'][1]-start['y'])<0.1 and abs(s['bbox'][0]-start['x'])<0.2:
                    cs=cs[start['len']:]
                while cs and not cs[0]['c'].strip():cs.pop(0)
                while cs and not cs[-1]['c'].strip():cs.pop()
                if cs:selected.append((s,cs))
        ds=[d for d in pg['drawings'] if seq_lo<=d['seqno']<seq_hi]
        # Embedded image streams are sometimes written after every text item
        # on the page. Their content-stream order does not identify ownership.
        # Recover tiny inline glyphs by position. Shared graphs are attached
        # explicitly to the task named in the source, below.
        ims=[im for im in pg['images'] if im['width']<20 and im['height']<30 and lo<=(im['bbox'][1]+im['bbox'][3])/2<hi]
        if not selected and not ims:continue
        boxes=[fitz.Rect(c['bbox']) for s,cs in selected for c in cs if c['c'].strip()]
        boxes +=[d['rect'] for d in ds]
        boxes +=[fitz.Rect(im['bbox']) for im in ims]
        rect=fitz.Rect(boxes[0])
        for r in boxes[1:]:rect|=r
        x0=rect.x0-2;y0=rect.y0-2
        runs=[]
        for s,cs in selected:
            groups=[]
            for c in cs:
                val=decode(c['c'],s['font'])
                if re.search('[\ue000-\uf8ff\ufffd]',val):
                    raise ValueError(f'Unmapped glyph {val!r} {s["font"]} page {pn}')
                if not groups or abs(groups[-1][0]-c['origin'][1])>0.05:groups.append((c['origin'][1],[]))
                groups[-1][1].append((val,c))
            for baseline,chars in groups:
                chars.sort(key=lambda item:item[1]['origin'][0])
                text=''.join(v for v,c in chars)
                if not text.strip():continue
                flags=(1 if 'Italic' in s['font'] else 0)|(2 if 'Bold' in s['font'] else 0)
                # Text-bearing spans use their original advance. Formula spans
                # retain individual x positions, including nested subscripts.
                armenian=any('\u0530'<=c<='\u058f' for c in text)
                xs=round2(chars[0][1]['origin'][0]-x0) if armenian else [round2(c['origin'][0]-x0) for v,c in chars]
                width=round2(chars[-1][1]['bbox'][2]-chars[0][1]['origin'][0]) if armenian else [round2(c['bbox'][2]-c['origin'][0]) for v,c in chars]
                runs.append([text,xs,round2(baseline-y0),round2(s['size']),flags,width])
                plain.append((pn,baseline,chars[0][1]['origin'][0],text))
        paths=[]
        for d in ds:
            paths.append([path_string(d,x0,y0),round2(d['width'] or 0),bool(d['fill'] is not None),bool(d['color'] is not None)])
        images=[]
        for im in ims:
            r=fitz.Rect(im['bbox']); key=f'{pn}-{im["xref"]}'
            glyphs={'230-803':'m','249-866':'°','293-995':'f','306-1038':'K'}
            if key in glyphs:
                size=7 if key=='249-866' else 12
                runs.append([glyphs[key],round2(r.x0-x0),round2(r.y1-y0-2),size,1,round2(r.width)])
                plain.append((pn,r.y1-2,r.x0,glyphs[key]))
            else:
                images.append([key,round2(r.x0-x0),round2(r.y0-y0),round2(r.width),round2(r.height)])
            raster.append({'id':key,'page':pn,'xref':im['xref'],'bbox':list(r),'width':im['width'],'height':im['height']})
        result.append({'width':round2(rect.width+4),'height':round2(rect.height+4),'runs':runs,'paths':paths,**({'diagrams':images} if images else {})})
    # Reading-order text is used for search; native runs are authoritative for
    # formula layout. Formula lines must not be presented as flattened equations.
    lines=[]
    for pn,y,x,t in sorted(plain):
        if not lines or lines[-1][0]!=pn or abs(lines[-1][1]-y)>3:lines.append([pn,y,t.strip()])
        else:lines[-1][2]+=' '+t.strip()
    return result,' '.join(l[2] for l in lines if l[2]),raster


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--pdf-dir',type=Path,required=True);args=ap.parse_args()
    index_path=ROOT/'public/data/math-books-index.json';bank_path=ROOT/'public/data/math-text-questions.json'
    index=json.loads(index_path.read_text());bank=json.loads(bank_path.read_text())
    native_root=ROOT/'public/data/math-transcriptions';native_root.mkdir(parents=True,exist_ok=True)
    report={'format':1,'method':'PDF Unicode extraction with positioned text and mathematical rules','added':0,'source_sha256':{},'sections':[],'numbering_corrections':[],'raster_assets':[]}
    for book,bdata in index['books'].items():
        pdf=args.pdf_dir/f'{book}.pdf';doc=fitz.open(pdf)
        report['source_sha256'][book]=hashlib.sha256(pdf.read_bytes()).hexdigest()
        for sec in bdata['sections']:
            chapter=sec['chapter'];section=sec['section'];sk=f'{chapter}-{section}'
            for task in sec['tasks']:task['answer_type']='choice' if chapter==1 else 'open' if chapter==2 else 'tf'
            missing=any(not (bank.get(book,{}).get(sk,{}).get(str(t['task']),[])[i] if i<len(bank.get(book,{}).get(sk,{}).get(str(t['task']),[])) else None) for t in sec['tasks'] for i in range(t['sub_count']))
            # Chapters 2/3 have missing context in the original crop metadata.
            if chapter==1 and not missing:continue
            pages=list(range(sec['pages'][0],sec['pages'][1]+1));cache={pn:cached_page(doc,pn) for pn in pages}
            for pn,pg in cache.items():
                for im in pg['images']:
                    if im['width']>=20:
                        report['raster_assets'].append({'id':f'{pn}-{im["xref"]}','page':pn,'xref':im['xref'],'bbox':list(im['bbox']),'width':im['width'],'height':im['height'],'book':book})
            groups=split_section(pages,sec,cache,book);native={'format':1,'tasks':{}};added=0
            for task,g in zip(sec['tasks'],groups):
                tn=str(task['task']);stem,stem_text,raster=extract(cache,g['header'],g['subs'][0]);report['raster_assets']+=[dict(r,book=book) for r in raster]
                if g['header']['n']!=task['task']:
                    report['numbering_corrections'].append({'book':book,'section':sk,'task':task['task'],'printed_task':g['header']['n'],'page':g['header']['page']})
                task['segments']=[{'page':pn,'y0':round2(g['header']['y']-4) if pn==g['header']['page'] else 45,'y1':round2(g['end']['y']-4) if pn==g['end']['page'] else 635} for pn in range(g['header']['page'],g['end']['page']+1) if (g['end']['y']-4 if pn==g['end']['page'] else 635)>(g['header']['y']-4 if pn==g['header']['page'] else 45)]
                task['sub_segments']=[];native_task={'stem':stem,'questions':[]};existing=bank.setdefault(book,{}).setdefault(sk,{}).setdefault(tn,[None]*task['sub_count'])
                if len(existing)!=task['sub_count']:raise ValueError('Bank length mismatch')
                for i,sub in enumerate(g['subs']):
                    end=g['subs'][i+1] if i+1<len(g['subs']) else g['end']
                    body,text,raster=extract(cache,sub,end);report['raster_assets']+=[dict(r,book=book) for r in raster]
                    if not body or not text.strip():raise ValueError(f'Empty transcription {book}/{sk}/{tn}/{i+1}')
                    task['sub_segments'].append([{'page':pn,'y0':round2(sub['y']-4) if pn==sub['page'] else 45,'y1':round2(end['y']-4) if pn==end['page'] else 635} for pn in range(sub['page'],end['page']+1) if (end['y']-4 if pn==end['page'] else 635)>(sub['y']-4 if pn==sub['page'] else 45)])
                    native_task['questions'].append(body)
                    if existing[i] and existing[i].get('prompt'):continue
                    existing[i]={'prompt':(stem_text+' '+text).strip(),'options':['1)', '2)', '3)', '4)'] if chapter==1 else [], 'transcription':{'book':book,'section':sk,'task':task['task'],'sub':i+1}}
                    added+=1
                graph_tasks={
                    ('matem-1','2-5',34):('194-688',267.45,219.6),
                    ('matem-2','2-4',21):('203-704',254.75,141.85),
                    ('matem-2','3-4',24):('284-961',284.85,234.0),
                    ('matem-2','3-4',25):('285-966',261.0,197.9),
                    ('matem-2','3-4',33):('289-981',141.75,108.0),
                    ('matem-2','3-4',34):('290-985',156.0,108.75),
                }
                if (book,sk,task['task']) in graph_tasks:
                    gid,gw,gh=graph_tasks[(book,sk,task['task'])]
                    native_task['stem'].append({'width':gw+4,'height':gh+4,'runs':[],'paths':[],'diagrams':[[gid,2,2,gw,gh]]})
                if any(q and q.get('transcription') for q in existing):native['tasks'][tn]=native_task
            if native['tasks']:
                dest=native_root/book/f'{sk}.json';dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_text(json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n')
            report['sections'].append({'book':book,'section':sk,'tasks':len(groups),'added':added});report['added']+=added
    # Every indexed question must now have text, including embedded legacy rows.
    done=0
    for book,bdata in index['books'].items():
        for sec in bdata['sections']:
            sk=f'{sec["chapter"]}-{sec["section"]}'
            for t in sec['tasks']:
                rows=bank[book][sk][str(t['task'])]
                for i in range(t['sub_count']):
                    row=rows[i] or (t.get('questions') or [None]*t['sub_count'])[i]
                    if not row or not row.get('prompt'):raise ValueError(f'Missing {book}/{sk}/{t["task"]}/{i+1}')
                    done+=1
    report['total_text_questions']=done
    report['raster_assets']=list({(r['book'],r['page'],r['xref'],r['id']):r for r in report['raster_assets']}.values())
    index_path.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    bank_path.write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n')
    (native_root/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'added':report['added'],'total':done,'numbering_corrections':report['numbering_corrections'],'raster_assets':report['raster_assets']},ensure_ascii=False,indent=2))

if __name__=='__main__':main()
