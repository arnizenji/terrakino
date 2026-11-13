const pl=(n,a,b,c)=>{n=Math.abs(n)%100;const m=n%10;return n>10&&n<20?c:m>1&&m<5?b:m==1?a:c};
const TYN=[['series','Сериалы',100],['movie','Фильмы',70],['cartoon','Мульты',48],['video','Ещё',32]];
function statsH(){
 const t=new Date(),y=t.getFullYear(),mo=t.getMonth(),dd=t.getDate(),day=i=>new Date(y,mo,dd-i),days=[];
 for(let i=6;i>=0;i--){const d=day(i);days.push({w:d.toLocaleDateString('ru-RU',{weekday:'short'}).replace('.',''),s:WD[dkey(d)]||0,t:!i})}
 const mx=Math.max(60,...days.map(d=>d.s)),wk=days.reduce((a,d)=>a+d.s,0);
 let st=0;for(let i=0;i<400;i++){if((WD[dkey(day(i))]||0)>=60)st++;else if(i)break}
 let bk='',bs=0;for(const k in WD)if(WD[k]>bs){bs=WD[k];bk=k}
 const bl=bk?new Date(bk+'T00:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.',''):'';
 const cnt={};let tot=0;for(const k in W){const d=get(k.split(':')[0]);if(d){cnt[d.type]=(cnt[d.type]||0)+1;tot++}}
 const rows=TYN.filter(r=>cnt[r[0]]),clr=r=>`color-mix(in srgb,var(--acc) ${r[2]}%,var(--card))`;
 const top=DATA.map(d=>({d,n:done(d)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,3);
 const week=`<div class="cd"><div class="cd-h"><b>Эта неделя</b><span>минут по дням</span></div><div class="big">${fmtT(wk)}</div><div class="bars">${days.map((d,i)=>`<div class="bc${d.t?' today':''}${d.s<60?' z':''}"><span class="bt"><i style="--h:${Math.round(d.s/mx*100)}%;--i:${i}">${d.s>=60?`<em>${Math.round(d.s/60)}</em>`:''}</i></span><small>${d.w}</small></div>`).join('')}</div>${wk>=60||bs>=60?`<div class="ft"><span>в среднем <b>${fmtT(wk/7)}</b> в день</span>${bs>=60?`<span>рекорд <b>${fmtT(bs)}</b> · ${bl}</span>`:''}</div>`:'<p class="em">Время по дням начнёт копиться, когда вы включите видео.</p>'}</div>`;
 const tiles=`<div class="stats"><div class="stat" style="--i:0"><b>${tot}</b><small>просмотрено</small></div><div class="stat" style="--i:1"><b>${fmtT(WT)}</b><small>время просмотра</small></div><div class="stat" style="--i:2"><b>${DATA.length}</b><small>в каталоге</small></div><div class="stat" style="--i:3"><b>${st}</b><small>${pl(st,'день','дня','дней')} подряд</small></div></div>`;
 const mix=tot?`<div class="cd"><div class="cd-h"><b>Что смотрим</b></div><div class="seg">${rows.map(r=>`<i style="flex:${cnt[r[0]]} 1 0;background:${clr(r)}"></i>`).join('')}</div><div class="lg">${rows.map(r=>`<div class="lr"><i style="background:${clr(r)}"></i><span>${r[1]}</span><b>${cnt[r[0]]}</b><small>${Math.round(cnt[r[0]]/tot*100)}%</small></div>`).join('')}</div></div>`:'';
 const tp=top.length?`<div class="cd"><div class="cd-h"><b>Больше всего смотрели</b></div>${top.map((x,i)=>{const d=x.d,one=d.type=='movie'||d.type=='video',n=total(d)||1;return `<div class="tp"><span class="rk">${i+1}</span><span class="tb"><b>${esc(d.title)}</b>${one?'':`<div class="bar"><i style="width:${Math.min(100,x.n/n*100)}%"></i></div>`}</span><span class="tn">${one?'просмотрено':x.n+' из '+n}</span></div>`}).join('')}</div>`:'';
 return cloudInfo()+week+tiles+mix+tp}
function loadStor(){if(!SRV)return;fetch('/api/stats').then(r=>r.json()).then(j=>{const e=$('stor');if(!e)return;const p=Math.max(2,Math.min(100,j.used/(j.used+j.free)*100));
 e.innerHTML=`<div class="sb"><i style="width:${p}%"></i></div><div class="sl"><span>\u0422\u0435\u0440\u0440\u0430\u043a\u0438\u043d\u043e: <b>${gb(j.used)}</b></span><span>\u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e: <b>${gb(j.free)}</b></span></div>`}).catch(()=>{})}
const nrm=t=>String(t).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
const same=(a,b)=>{a=nrm(a);b=nrm(b);return a==b||(a.length>=70&&b.length>=70&&a.slice(0,70)==b.slice(0,70))};
function dedupe(){let ch=0;const out=[];
 for(const d of DATA){const o=out.find(x=>x.type==d.type&&same(x.title,d.title));
  if(!o){out.push(d);continue}
  const keep=(d.poster&&!o.poster)||(!!d.poster==!!o.poster&&done(d)>done(o))?d:o,drop=keep===d?o:d;
  for(const s in drop.seasons)keep.seasons[s]=Math.max(keep.seasons[s]||0,drop.seasons[s]);
  for(const M of [W,FN,POS,LK])for(const k of Object.keys(M))if(k.startsWith(drop.id+':')){const n2=keep.id+k.slice(drop.id.length);if(!(n2 in M))M[n2]=M[k];delete M[k]}
  if(FAV[drop.id]){FAV[keep.id]=1;delete FAV[drop.id]}
  if(last==drop.id)last=keep.id;
  out[out.indexOf(o)]=keep;ch=1}
 if(ch){DATA=out;sv('fav',FAV);sv('pos',POS);sv('lk',LK);save()}}
function fixE(){nf.eps=nf.eps||[nf.e||12];while(nf.eps.length<nf.s)nf.eps.push(nf.eps[nf.eps.length-1]||12);nf.eps.length=nf.s}
function epsH(){return nf.eps.map((n,i)=>`<div class="st"><span>Сезон ${i+1} · серий</span><span><button class="x" onclick="stE(${i},-1)">\u2212</button><input class="num" type="number" inputmode="numeric" min="1" value="${n}" onchange="setE(${i},this.value)" onfocus="this.select()"><button class="x" onclick="stE(${i},1)">+</button></span></div>`).join('')+(nf.s>1?`<button class="lnk" onclick="allE()">Одинаково во всех сезонах</button>`:'')}
function stE(i,d){nf.title=$('ti').value;nf.eps[i]=Math.max(1,Math.min(999,(nf.eps[i]||1)+d));drawF()}
function setE(i,v){nf.title=$('ti').value;nf.eps[i]=Math.max(1,Math.min(999,parseInt(v)||1));drawF()}
function allE(){nf.title=$('ti').value;nf.eps=nf.eps.map(()=>nf.eps[0]);drawF()}
function usedMax(id,s){let m=0;for(const M of [W,FN,F,POS])for(const k in M){const p=k.split(':');if(p[0]==id&&p[1]==s)m=Math.max(m,+p[2])}return m}
function setCnt(id,n){const d=get(id),s=curSeason;n=Math.max(1,Math.min(999,parseInt(n)||1));const u=usedMax(id,s);if(n<u){n=u;toast('Серия '+u+' уже загружена или просмотрена')}d.seasons[s]=n;save();AN=0;drawD(d);render()}
function stS(id,x){setCnt(id,(get(id).seasons[curSeason]||1)+x)}
function addSeason(id){const d=get(id),ks=Object.keys(d.seasons).map(Number),last=Math.max(0,...ks),n=last+1;d.seasons[n]=d.seasons[last]||12;curSeason=n;save();AN=1;drawD(d);render()}
function delSeason(id){const d=get(id);if(usedMax(id,curSeason)||Object.keys(d.seasons).length<2)return;const gone=curSeason;delete d.seasons[gone];const rest=Object.keys(d.seasons).map(Number).sort((a,b)=>a-b);curSeason=rest.filter(x=>x<gone).pop()||rest[0];save();AN=1;drawD(d);render()}
function cntH(d){return `<div class="st" style="margin-top:12px"><span>Серий в сезоне ${curSeason}</span><span><button class="x" onclick="stS('${d.id}',-1)">\u2212</button><input class="num" type="number" inputmode="numeric" min="1" value="${d.seasons[curSeason]||1}" onchange="setCnt('${d.id}',this.value)" onfocus="this.select()"><button class="x" onclick="stS('${d.id}',1)">+</button></span></div>${Object.keys(d.seasons).length>1&&!usedMax(d.id,curSeason)?`<button class="lnk" onclick="delSeason('${d.id}')">Удалить сезон ${curSeason}</button>`:''}`}
const NL='<i class="nl"><svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5"/><path d="M12 11v7m0 0-2.6-2.6M12 18l2.6-2.6"/></svg></i>';
function delOf(id){const d=get(id);return d&&d.del!==undefined?d.del:DEL}
function delRow(id){const on=delOf(id)==0;return `<div class="st dl"><span class="dt"><b>Удалять после просмотра</b><small>${on?'файл исчезнет с телефона':'файл останется на телефоне'}</small></span><button class="sw ${on?'on':''}" onclick="setDel('${id}')" aria-label="Удалять после просмотра"><i></i></button></div>`}
function setDel(id){const d=get(id);d.del=delOf(id)==0?-1:0;save();document.querySelectorAll('.dl').forEach(e=>e.outerHTML=delRow(id));toast(d.del==0?'Файлы будут удаляться после просмотра':'Файлы будут оставаться на телефоне')}
function flash(side,d){const f=$('fl');if(!f)return;f.className='fl';void f.offsetWidth;f.className='fl on '+side;f.textContent=(d<0?'−':'+')+'10'}
function seek(v,d,x){v.currentTime=Math.max(0,Math.min(v.duration||1e9,v.currentTime+d));flash(x<.5?'l':'r',d);clearTimeout(ch);ch=setTimeout(()=>ch=null,550)}
function gz(ev){const r=ev.currentTarget.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,v=$('vd'),d=x<.38?-10:x>.62?10:0,t=()=>v.paused?v.play():v.pause();
 if(ch&&d){seek(v,d,x);clearTimeout(tp);tp=null;return}
 if(tp){clearTimeout(tp);tp=null;d?seek(v,d,x):t();return}
 tp=setTimeout(()=>{tp=null;vis()},260)}
function fsx(){const w=$('vw')||$('watchGuestView');if(document.fullscreenElement)document.exitFullscreen();else if(w&&w.requestFullscreen)w.requestFullscreen().then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape')).catch(()=>{})}
function toast(t,p){let e=$('tt');if(!e){e=document.createElement('div');e.id='tt';e.className='toast';document.body.appendChild(e)}e.innerHTML=t.replace(/</g,'&lt;')+(p==null?'':`<i style="width:${p}%"></i>`);e.classList.add('show');clearTimeout(e._h);if(p==null)e._h=setTimeout(()=>e.classList.remove('show'),3400)}
function runQ(){if(ub||!UQ.length)return;ub=1;const [k,f,kind]=UQ.shift(),[id,s,e]=k.split(':'),d=get(id),n=UQ.length,x=new XMLHttpRequest(),aud=kind=='audio',pk=aud?k+'~a':k;
 const qs=new URLSearchParams({type:d.type,title:d.title,s,e,name:f.name,size:f.size,kind:aud?'audio':'video'});
 x.open('POST','/api/upload?'+qs);
 x.upload.onprogress=ev=>toast('Загрузка'+(n?' · ещё '+n:'')+' · '+f.name.slice(0,24),ev.loaded/ev.total*100);
 const fail=m=>{ub=0;delete PQ[pk];if(!aud){delete FN[k];save()}toast(m);refresh(k);runQ()};
 const ok=(j,msg)=>{ub=0;delete PQ[pk];const o={name:f.name,url:'/'+encodeURI(j.path)};if(aud)AU[k]=o;else{F[k]=o;FN[k]=f.name;SP[k]=j.path;save()}toast(msg);refresh(k);runQ()};
 x.onload=()=>{let j={};try{j=JSON.parse(x.responseText)}catch(_){}
  if(x.status==200&&j.path)ok(j,j.removed?'Готово ✓ Оригинал удалён из Загрузок':'Готово ✓');else fail('Не удалось загрузить')};
 x.onerror=()=>fail('Нет связи с сервером');
 fetch('/api/move?'+qs,{method:'POST'}).then(r=>r.json()).then(j=>{if(j.ok&&j.path)ok(j,'Готово ✓ Файл перенесён из Загрузок');else x.send(f)}).catch(()=>x.send(f))}
function refresh(k){render();if(!curV)return;if(curV[0]=='d'&&curV[1]==k.split(':')[0]){AN=0;drawD(get(curV[1]))}else if(curV[0]=='p'&&curV[1]==k)play(curV[2],curV[3],curV[4])}
function hid(t){let h=0;for(const c of t)h=(h*31+c.charCodeAt(0))|0;return 'v'+(h>>>0).toString(36)}
function sync(){fetch('/api/library').then(r=>r.ok?r.json():Promise.reject()).then(j=>{SRV=1;SP={};
 j.items.forEach(it=>{if(HID.includes(nrm(it.title))&&!DATA.some(x=>x.type==it.type&&same(x.title,it.title)))return;let d=DATA.find(x=>x.type==it.type&&same(x.title,it.title));
  if(!d){d={id:hid(it.title),type:it.type,title:it.title,year:'',seasons:{},h:10+Math.random()*20|0};DATA.push(d)}
  if(it.poster&&!d.poster)d.poster='/'+encodeURI(it.poster);
  for(const s in it.seasons)d.seasons[s]=Math.max(d.seasons[s]||0,it.seasons[s]);
  for(const se in it.files){const k=`${d.id}:${se}`,p=it.files[se];F[k]={name:p.split('/').pop(),url:'/'+encodeURI(p)};FN[k]=F[k].name;SP[k]=p}for(const se in (it.audio||{}))AU[`${d.id}:${se}`]={name:it.audio[se].split('/').pop(),url:'/'+encodeURI(it.audio[se])}});
 applyLK();save();render()}).catch(()=>{})}
function flip(k){W[k]?delete W[k]:W[k]=1;if(W[k]){delete POS[k];sv('pos',POS)}save();achCheck();
 const dl=delOf(k.split(':')[0]);
 if(SRV&&SP[k]){const on=!!W[k];if(on&&dl==0){fetch('/api/del',{method:'POST',body:JSON.stringify({path:SP[k],after:0})}).catch(()=>{});delete F[k];delete SP[k];delete FN[k];delete AU[k];applyLK();save()}else fetch('/api/undel',{method:'POST',body:JSON.stringify({path:SP[k]})}).catch(()=>{})}}
function tog(k,id){const go=()=>{flip(k);AN=0;nk=k;drawD(get(id));render()};W[k]?go():ask(k,go)}
function play(id,s,e){const d=get(id),k=`${id}:${s}:${e}`,f=F[k];nxc();NC=0;curV=['p',k,id,s,e];CK=k;BR=1;ss=0;lw=0;curSeason=s;if(d.type!='video')last=id;save();bgAuto(id,k);
 $('pn').innerHTML=`<div class="top"><h3>${esc(d.title)}</h3><button class="x" onclick="openD('${id}',${s})">✕</button></div>${f?`<div class="vw" id="vw"><video id="vd" playsinline autoplay ${AU[k]?'muted':''} src="${esc(vsrc(f))}" onerror="vErr()" onloadedmetadata="rs(CK);upd(CK);okV(CK)" ontimeupdate="upd(CK)" onplay="pi();sy()" onpause="sp(CK,1);pi();sy()" onseeked="sk2()" onended="fin()"></video>${AU[k]?`<audio id="au" src="${AU[k].url}" preload="auto"></audio>`:''}<div class="gz" onclick="gz(event)"></div><div class="vt" id="vt">${vtH(d,s,e)}</div><div class="fl" id="fl"></div><button class="bp" id="bp" onclick="tg()" aria-label="Пауза">${IC.play}</button><div class="cb"><input class="sk" id="sk" type="range" min="0" max="1000" value="0" step="1" oninput="skI(this)" onchange="skE()"><div class="cr"><span id="tm">0:00</span><span class="cs"><button onclick="bk(-10)" aria-label="Назад 10 секунд">${IC.b}</button><button onclick="bk(10)" aria-label="Вперёд 10 секунд">${IC.f}</button><button id="sd" onclick="spd()" aria-label="Скорость">1×</button><button onclick="fsx()" aria-label="На весь экран">${IC.fs}</button></span></div></div></div>`:`<div class="novid">🎞<br>${FN[k]?'Загрузите заново<br><small>'+esc(FN[k])+'</small>':'Не загружена'}</div>`}<div id="pc">${pcH(id,s,e)}</div>`;$('sh').classList.add('open')}
function closeD(){const s=$('sh');s.classList.add('out');nxc();setTimeout(()=>{s.classList.remove('open','out');curV=null},220)}
$('sh').onclick=e=>{if(e.target.id=='sh')closeD()};
function pick(cb,multi,im,au){const i=$('fi');i.value='';i.multiple=!!multi;i.accept=im?'image/*':'';i.onchange=()=>{let fs=[...i.files];if(!im)fs=fs.filter(f=>(au?/\.(m4a|mp3|aac|opus|ogg|oga|weba|wav|flac|webm|mka)$/i:/\.(mp4|mkv|webm|m4v|mov|avi)$/i).test(f.name));if(fs.length)cb(fs);else if(i.files.length)toast(au?'Выберите аудиофайл':'Выберите видеофайл')};i.click()}
function attach(k,f){if(!SRV){F[k]={name:f.name,url:URL.createObjectURL(f)};FN[k]=f.name;return}PQ[k]=1;FN[k]=f.name;UQ.push([k,f]);runQ()}
function assign(d,files,s0){let ce=1;
 [...files].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).forEach(f=>{
 let s=s0,e,m=f.name.match(/s(\d{1,2})[ ._-]*e(\d{1,3})/i)||f.name.match(/\b(\d{1,2})x(\d{1,3})\b/i);
 if((d.type=='movie'||d.type=='video')){s=1;e=1}else if(m){s=+m[1];e=+m[2]}else{while(FN[`${d.id}:${s0}:${ce}`])ce++;e=ce++}
 d.seasons[s]=Math.max(d.seasons[s]||0,e);attach(`${d.id}:${s}:${e}`,f)});save()}
function pickS(id){const d=get(id);pick(fs=>{assign(d,fs,curSeason);AN=0;drawD(d);render()},1)}
function pickOne(id,s,e){pick(fs=>{attach(`${id}:${s}:${e}`,fs[0]);save();play(id,s,e)})}
function loadEp(id,s,e){pick(fs=>{attach(`${id}:${s}:${e}`,fs[0]);save();AN=0;nk='';drawD(get(id));render()})}
function del(id){if(da!=id){da=id;drawD(get(id));return}
 {const dd=get(id);if(dd&&SRV){HID.push(nrm(dd.title));sv('hid',HID)}}DATA=DATA.filter(x=>x.id!=id);bgStop(id);for(const k in LK)if(k.startsWith(id+':'))delete LK[k];sv('lk',LK);Object.keys(W).concat(Object.keys(FN)).forEach(k=>{if(k.startsWith(id+':')){delete W[k];delete FN[k]}});if(last==id)last=null;save();closeD()}
function img(f,cb,w=360,h=540,q=.82){const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),r=Math.max(w/im.width,h/im.height),sw=w/r,sh=h/r;x.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,0,0,w,h);URL.revokeObjectURL(u);cb(c.toDataURL('image/jpeg',q))};im.src=u}
function pickP(){pick(fs=>{nf.title=$('ti').value;img(fs[0],p=>{nf.poster=p;drawF()},nf.type=='video'?640:360,nf.type=='video'?360:540)},0,1)}
