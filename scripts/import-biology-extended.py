import fitz,json,re,hashlib
from pathlib import Path
from importlib.machinery import SourceFileLoader
import argparse
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description='Import 500 source Biology tasks; requires PyMuPDF')
p.add_argument('sources',type=Path,help='Folder containing the two original kensab PDFs')
args=p.parse_args()
m=SourceFileLoader('m',str(ROOT/'scripts/import-biology-source.py')).load_module()
books=[]
allrows=[]
for v in (3,4):
 # Use the exact owner-provided PDF filename first; retain old upload aliases.
 candidates=[args.sources/f'kensab-{v}.pdf',
             args.sources/f'kensab-{v}({2 if v==3 else 1}).pdf']
 source=next((candidate for candidate in candidates if candidate.is_file()),None)
 if source is None:
  raise FileNotFoundError(f'Biology {v} PDF not found; tried: {", ".join(map(str,candidates))}')
 idx=json.loads((ROOT/f'public/data/biology-original-volume{v}-index.json').read_text())
 assert hashlib.sha256(source.read_bytes()).hexdigest()==idx['sourceSha256'], 'Source PDF hash mismatch'
 d=fitz.open(source);sections=[];reject={};evidence=[]
 for c in idx['chapters']:
  keys={}
  for p in range(c['answerPages'][0],c['answerPages'][1]+1):
   ss=[s for s in m.spans(d[p-1]) if s['direction']==(1.,0.)]
   if c['id']<6:
    for s in ss:
     t=m.decode(s['text'],s['font']).strip()
     if re.fullmatch(r'\d{1,3}',t):
      near=[a for a in ss if abs(a['origin'][1]-s['origin'][1])<1 and 0<a['bbox'][0]-s['bbox'][2]<12]
      if near:
       a=min(near,key=lambda a:a['bbox'][0]);tx=m.decode(a['text'],a['font']).strip()
       if re.fullmatch(r'\.\s*\d(?:[\d, ]*\d)?',tx):keys[int(t)]=(list(map(int,re.findall(r'\d+',tx))),p)
   else:
    for block in d[p-1].get_text('dict')['blocks']:
     for line in block.get('lines',[]):
      text=''.join(s['text'] for s in line['spans']).strip();z=re.fullmatch(r'(\d+)\s*-\s*(\d+)',text)
      if z:keys[int(z[1])]=(z[2],p)
  pages={p:m.spans(d[p-1]) for p in range(c['startPage'],c['endPage']+1)};anchors={}
  for p,ss in pages.items():
   for s in ss:
    if m.marker(s):anchors.setdefault(int(s['text']),[]).append((p,s))
  units=[]
  for n,(ans,kp) in keys.items():
   if n<=len(c['choiceKeys']) or n>c['questionCount'] or len(anchors.get(n,[]))!=1:continue
   p,start=anchors[n][0];nexts=[(pp,s) for pp,ss in pages.items() for s in ss if m.marker(s) and (pp>p or (pp==p and s['bbox'][1]>start['bbox'][1]+2))];end=min(nexts,key=lambda a:(a[0],a[1]['bbox'][1])) if nexts else (c['endPage'],{'bbox':[0,620,0,620]})
   if end[0]>p+1:continue
   items=[]
   for pp in range(p,end[0]+1):
    top=start['bbox'][1]-1 if pp==p else 30;bottom=end[1]['bbox'][1]-1 if pp==end[0] else 620
    items.extend(s for s in pages[pp] if not m.marker(s) and s['direction']==(1.,0.) and 47.4<s['bbox'][0]<431 and top<=s['bbox'][1]<bottom)
   if any(s['size']<8 and not (s['text'].strip()=='2' and i>0 and re.search(r'(?:CO|H|O)\s*$',items[i-1]['text'])) for i,s in enumerate(items)):reject['formula']=reject.get('formula',0)+1;continue
   lines=[]
   for s in items:
    t=m.decode(s['text'],s['font']).strip()
    if t:lines.append(t)
   text=re.sub(r'^\.\s*','',' '.join(lines));text=re.sub(r'\s+',' ',text).strip();text=re.sub(r'CO\s+2', 'CO₂',text);text=re.sub(r'H\s+2\s*O','H₂O',text);text=re.sub(r'O\s+2','O₂',text)
   if re.search(r'նկարում|նկարի |գծապատկեր|պատկերված|\ufffd|[\u00b2-\u00ba\u00bc-\u00ff]',text):continue
   u={'id':f'bio{v}-s{c["id"]}-q{n}','label':str(n),'sourcePage':p,'sourceEndPage':end[0] if end[1]['bbox'][1]>40 else p,'sourceAnswerPage':kp}
   if c['id']<6:
    spl=re.split(r'(?<!\S)(\d{1,2})\.\s+',text)
    if len(spl)<5:continue
    nums=[int(spl[i]) for i in range(1,len(spl),2)];parts=[spl[i].strip() for i in range(2,len(spl),2)]
    if nums!=list(range(1,len(nums)+1)) or not all(len(x)>2 for x in parts):continue
    prompt=spl[0].strip()
    kind='set' if 'ճիշտ պնդում' in prompt else 'seq' if 'հաջորդական' in prompt else None
    if kind is None or len(set(ans))!=len(ans) or not all(1<=a<=len(nums) for a in ans):continue
    if kind=='seq' and sorted(ans)!=nums:continue
    u.update(kind=kind,passage=prompt+'\n'+'\n'.join(f'{i}. {t}' for i,t in zip(nums,parts)),answer=ans,count=len(nums))
   else:
    if re.search(r'\b'+str(n)+r'\.\d',text):continue
    spl=re.split(r'(?<!\S)([1-4])\)\s*',text)
    if len(spl)==9 and spl[1::2]==['1','2','3','4'] and ans in '1234' and len(ans)==1:
     u.update(kind='mc',passage='',questions=[{'n':str(n),'stem':spl[0].strip(),'options':dict(zip(spl[1::2],[s.strip() for s in spl[2::2]])),'answer':ans}])
    elif len(spl)==1 and len(text)>50 and re.search('[՞?]',text):u.update(kind='num',passage='',questions=[{'n':str(n),'stem':text,'answer':ans}])
    else:continue
   units.append(u);evidence.append({'chapter':c['id'],'number':n,'page':p,'answerPage':kp,'kind':u['kind'],'answer':ans});allrows.append((v,c['id'],n,u['kind']))
  if units:sections.append({'n':c['id'],'label':c['title'],'instr_en':'','instr_hy':'','units':sorted(units,key=lambda u:int(u['label']))})
 out={'id':30+v,'source':{'sha256':idx['sourceSha256'],'kind':'source-transcription','complete':False,'verification':'Automated source extraction and structural/key validation; visual samples reviewed, not exhaustive proofreading.'},'sections':sections}
 books.append(out)
 print(v,sum(len(s['units']) for s in sections),[(s['n'],len(s['units'])) for s in sections],reject)
print('total',len(allrows))

candidates=[(b,s,u) for b in books for s in b['sections'] if s['n']==6 for u in s['units']]
def score(x):
 t=x[2]['questions'][0]['stem'];words=re.findall(r'[Ա-Ֆա-ֆև]+',t);return sum(len(w)<=2 for w in words)/max(len(words),1)
keep={u['id'] for b,s,u in sorted(candidates,key=score)[:196]}
manifest={'schemaVersion':1,'verification':'Automated PDF text and printed-key extraction with structural validation and visual sample review; not a claim of exhaustive manual proofreading.','books':[]}
for b in books:
 v=b['id']-30
 for s in b['sections']:
  if s['n']==6:s['units']=[u for u in s['units'] if u['id'] in keep]
 units=[u for s in b['sections'] for u in s['units']];old=json.load(open(ROOT/f'public/data/bio-book{v}.json'));oldn=sum(len(s['units']) for s in old['sections']);idx=json.load(open(ROOT/f'public/data/biology-original-volume{v}-index.json'));total=sum(c['questionCount'] for c in idx['chapters'])
 (ROOT/f'public/data/biology-extended-book{v}.json').write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n')
 entries=[{'chapter':s['n'],'number':int(u['label']),'kind':u['kind'],'page':u['sourcePage'],'answerPage':u['sourceAnswerPage'],'answer':u.get('answer',u.get('questions',[{}])[0].get('answer'))} for s in b['sections'] for u in s['units']]
 manifest['books'].append({'volume':v,'sourceSha256':b['source']['sha256'],'baseTasks':oldn,'additionalTasks':len(units),'totalPlayableTasks':oldn+len(units),'remainingTasks':total-oldn-len(units),'entries':entries})
 print(v,len(units),oldn+len(units),total-oldn-len(units),max([score((b,s,u)) for s in b['sections'] if s['n']==6 for u in s['units']]))
(ROOT/'public/data/biology-extended-coverage.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
