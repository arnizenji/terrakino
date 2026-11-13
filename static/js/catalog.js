function next(d){for(const s of Object.keys(d.seasons))for(let e=1;e<=d.seasons[s];e++)if(!W[`${d.id}:${s}:${e}`])return[+s,e];return null}
let LK=ld('lk',{});
const prx=u=>'/api/proxy?u='+encodeURIComponent(u);
const vsrc=f=>f.on&&f.px?prx(f.url):f.url;
const lkn=u=>u.replace(/^https?:\/\//i,'').slice(0,40);
function setLink(k,u){LK[k]=u;okV(k);if(!F[k]||F[k].on)F[k]={name:lkn(u),url:u,on:1}}
function applyLK(){for(const k in LK)if(!F[k])F[k]={name:lkn(LK[k]),url:LK[k],on:1}}
function dlg(h){let c=$('cf');if(!c){c=document.createElement('div');c.id='cf';c.className='cf';c.onclick=e=>{if(e.target==c)cfx(0)};document.body.appendChild(c)}CB=null;c.innerHTML=`<div class="cfb">${h}</div>`;c.className='cf open'}
function parseLinks(t){return t.split(/\n+/).map(l=>{const m=l.match(/^\s*(?:(\d{1,3})\s*[:.)\-]?\s+)?(https?:\/\/\S+)/i);return m?{e:m[1]?+m[1]:0,u:m[2]}:null}).filter(Boolean)}
function putLinks(d,s,list){let ce=1;list.forEach(x=>{let e=x.e;if(!e){while(F[`${d.id}:${s}:${ce}`]||LK[`${d.id}:${s}:${ce}`])ce++;e=ce++}setLink(`${d.id}:${s}:${e}`,x.u);d.seasons[s]=Math.max(d.seasons[s]||0,e)})}
function vErr(){const v=$('vd'),f=F[CK];if(!v||!f||!f.on)return;if(navigator.onLine===false){toast('Нет интернета, ссылку по сети не открыть');return}if(SRV&&!f.px){f.px=1;v.src=prx(f.url);v.load();v.play().catch(()=>{});toast('Пробую открыть через сервер…');return}DEAD[CK]=1;sv('dead',DEAD);toast('Ссылка не открывается. Обновите её в панели серии');if($('pc')&&curV&&curV[0]=='p')$('pc').innerHTML=pcH(curV[2],+curV[3],+curV[4]);render()}
const IS='text-align:left;font-size:15px;font-weight:500';
function lnkDlg(id,s,e){const d=get(id),mv=d.type=='movie'||d.type=='video';if(mv){s=1;e=1}const one=!!e,k=`${id}:${s}:${e}`,has=one&&LK[k];
  dlg(`<h4>${one?(mv?(d.type=='video'?'Ссылка на видео':'Ссылка на фильм'):'Ссылка на серию '+e):'Ссылки на серии · сезон '+s}</h4><p class="hint">${one?'Прямая ссылка на видеофайл. Сайт проиграет её сам, без рекламы.':'По одной ссылке на строку, серии встанут по порядку. Можно писать «5 https://…», чтобы указать номер серии.'}</p>${one?`<input class="in" id="lk" type="url" inputmode="url" placeholder="https://…" value="${esc(LK[k]||'')}" style="${IS}">`:`<textarea class="in" id="lk" rows="6" placeholder="https://…" style="${IS};resize:none"></textarea>`}<div class="cfr"><button class="tab" onclick="cfx(0)">Отмена</button>${has?`<button class="tab" onclick="lnkSave('${id}',${s},${e},1)">Убрать</button>`:''}<button class="tab on" onclick="lnkSave('${id}',${s},${e||0})">Сохранить</button></div>`)}
function lnkSave(id,s,e,rm){const d=get(id),mv=d.type=='movie'||d.type=='video',t=$('lk').value;if(mv){s=1;e=1}
  if(e){const k=`${id}:${s}:${e}`;
   if(rm){delete LK[k];okV(k);if(F[k]&&F[k].on)delete F[k]}
   else{const u=(t.match(/https?:\/\/\S+/i)||[])[0];if(!u){toast('Нужна ссылка, которая начинается с http');return}setLink(k,u);d.seasons[s]=Math.max(d.seasons[s]||0,e)}
   sv('lk',LK);save();cfx(0);AN=0;refresh(k);return}
  const list=parseLinks(t);if(!list.length){toast('Нужна хотя бы одна ссылка, которая начинается с http');return}
  putLinks(d,s,list);sv('lk',LK);save();cfx(0);AN=0;curSeason=s;drawD(d);render();toast('Добавлено ссылок: '+list.length)}
function posUrl(u,cb,w,h){fetch(SRV?prx(u):u).then(r=>r.ok?r.blob():Promise.reject()).then(b=>b.type.indexOf('image/')==0?img(b,cb,w,h):Promise.reject()).catch(()=>cb(u))}
function posDlg(id){dlg(`<h4>Постер по ссылке</h4><p class="hint">Ссылка на картинку (jpg, png, webp).</p><input class="in" id="pu" type="url" inputmode="url" placeholder="https://…" style="${IS}"><div class="cfr"><button class="tab" onclick="cfx(0)">Отмена</button><button class="tab on" onclick="posSave('${id}')">Сохранить</button></div>`)}
function posSave(id){const u=($('pu').value.match(/https?:\/\/\S+/i)||[])[0];if(!u){toast('Нужна ссылка, которая начинается с http');return}const d=get(id),v=d.type=='video';cfx(0);toast('Загружаю постер…');posUrl(u,p=>{d.poster=p;save();AN=0;if(curV&&curV[0]=='d'&&curV[1]==id)drawD(d);render();toast('Постер сохранён ✓')},v?640:360,v?360:540)}
function lkBox(mv){return mv?`<input class="in" type="url" inputmode="url" placeholder="Ссылка на видео (https://…)" value="${esc(nf.links||'')}" oninput="nf.links=this.value" style="${IS}">`:`<textarea class="in" rows="5" placeholder="Ссылки на серии первого сезона, по одной на строку" oninput="nf.links=this.value" style="${IS};resize:none">${esc(nf.links||'')}</textarea>`}
let DEAD=ld('dead',{});
const bd=k=>{const f=F[k];if(!f)return'';if(!f.on)return'<span class="bd off">📱 на телефоне</span>';if(DEAD[k])return'<span class="bd bad">⚠ обновить ссылку</span>';return BG[k]!==undefined?'<span class="bd on">⬇ скачивается</span>':'<span class="bd on">🔗 онлайн</span>'};
function okV(k){if(DEAD[k]){delete DEAD[k];sv('dead',DEAD)}}
let BG={},BGP={},BT=null;
const onK=id=>Object.keys(F).filter(k=>k.startsWith(id+':')&&F[k].on);
function bgQ(id,ks){if(!SRV)return;const d=get(id);ks=ks.filter(k=>BG[k]===undefined&&F[k]&&F[k].on);if(!ks.length)return;ks.forEach(k=>BG[k]='');
  ks.reduce((p,k)=>p.then(()=>{const q=k.split(':');return fetch('/api/fetch?'+new URLSearchParams({type:d.type,title:d.title,s:q[1],e:q[2],url:F[k].url}),{method:'POST'}).then(r=>r.json()).then(j=>{if(j.ok&&j.path)BG[k]=j.path;else delete BG[k]}).catch(()=>{delete BG[k]})}),Promise.resolve()).then(bgPoll)}
function bgAuto(id,k){const d=get(id);if(!SRV||!d||!d.bg||!F[k]||!F[k].on)return;const p=k.split(':'),cur=+p[1]*1000+ +p[2],pos=x=>{const q=x.split(':'),v=+q[1]*1000+ +q[2]-cur;return v<0?1e6-v:v};
  bgQ(id,onK(id).filter(x=>x!=k&&!W[x]).sort((a,b)=>pos(a)-pos(b)))}
function bgStop(id){const ps=[];for(const k of Object.keys(BG))if(k.startsWith(id+':')){if(BG[k])ps.push(BG[k]);delete BG[k];delete BGP[k]}ps.forEach(p=>fetch('/api/fetchcancel?path='+encodeURIComponent(p),{method:'POST'}).catch(()=>{}))}
function bgPoll(){if(BT||!Object.keys(BG).length)return;BT=setInterval(()=>{const ks=Object.keys(BG);if(!ks.length){clearInterval(BT);BT=null;return}
  fetch('/api/jobs').then(r=>r.json()).then(j=>{let dn=0,er=0;
   ks.forEach(k=>{const p=BG[k];if(!p)return;const b=j.jobs[p];
    if(!b){delete BG[k];delete BGP[k];return}
    if(b.state=='done'){F[k]={name:p.split('/').pop(),url:'/'+encodeURI(p)};FN[k]=F[k].name;SP[k]=p;delete BG[k];delete BGP[k];dn++}
    else if(b.state=='error'||b.state=='cancel'){delete BG[k];delete BGP[k];if(b.state=='error')er++}
    else BGP[k]=b.total?Math.round(b.done/b.total*100):0});
   if(dn||er){save();render();if(curV&&curV[0]=='d'&&get(curV[1])){AN=0;drawD(get(curV[1]))}toast(dn?'Скачано на телефон: '+dn+' ✓':'Не удалось скачать серию: хост не отдаёт файл')}
  }).catch(()=>{})},2500)}
function dlBtn(id,k){if(!SRV||!F[k]||!F[k].on)return'';return BG[k]!==undefined?`<p class="hint">⬇ Скачивается на телефон${BGP[k]?' · '+BGP[k]+'%':'…'}</p>`:`<button class="tab go" onclick="dlOne('${id}','${k}')">⬇ Сохранить на телефон</button>`}
function dlOne(id,k){bgQ(id,[k]);const q=k.split(':');if($('pc')&&curV&&curV[0]=='p'&&curV[1]==k)$('pc').innerHTML=pcH(id,+q[1],+q[2]);toast('Скачивание началось')}
function dlAllBtn(d){if(!SRV)return'';const n=onK(d.id).filter(k=>!W[k]&&BG[k]===undefined).length;return n?`<button class="in" onclick="dlAll('${d.id}')" style="margin-top:0">⬇ Скачать на телефон${d.type=='movie'||d.type=='video'?'':' все серии ('+n+')'}</button>`:''}
function dlAll(id){const ks=onK(id).filter(k=>!W[k]);bgQ(id,ks);toast('Скачивание началось · серий: '+ks.length);setTimeout(()=>{AN=0;if(curV&&curV[0]=='d')drawD(get(id))},400)}
function bgRow(d){if(!SRV||d.type=='movie'||d.type=='video'||(!onK(d.id).length&&!d.bg))return'';return `<div class="st bgr" style="padding:10px 14px 10px 16px;margin-top:10px"><span class="dt"><b>Докачивать остальные серии</b><small>${d.bg?'смотрите одну, остальные скачиваются на телефон':'серии идут по ссылке, файлы не скачиваются'}</small></span><button class="sw ${d.bg?'on':''}" onclick="setBg('${d.id}')" aria-label="Докачивать остальные серии"><i></i></button></div>`}
function setBg(id){const d=get(id);d.bg=d.bg?0:1;save();document.querySelectorAll('.bgr').forEach(e=>e.outerHTML=bgRow(d));if(d.bg){bgQ(id,onK(id).filter(k=>!W[k]));toast('Остальные серии будут скачиваться в фоне')}else{bgStop(id);toast('Фоновое скачивание выключено')}}
const matchesCategory=d=>tab=='all'?d.type!='video':categoryOf(d)==tab;
let searchTimer=0,gridReady=0;
function searchInput(value){Q=value;NA=1;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{NA=0;drawG()},300)}
$('q').addEventListener('input',e=>searchInput(e.target.value));
function render(){
 if(!gridReady)$('grid').innerHTML=`<div class="skeleton" aria-hidden="true"></div><div class="skeleton" aria-hidden="true"></div><div class="skeleton" aria-hidden="true"></div><div class="skeleton" aria-hidden="true"></div>`;
 clearTimeout(searchTimer);
 searchTimer=setTimeout(()=>{NA=0;drawG()},300);
 let sig=TABS.map(t=>t[0]==tab).join();if($('tabs').dataset.signature!=sig){$('tabs').dataset.signature=sig;$('tabs').innerHTML=TABS.map(t=>`<button class="tab ${tab==t[0]?'on':''}" onclick="tab='${t[0]}';render()">${t[1]}</button>`).join('');$('q').style.display='block';$('grid').style.display='grid';$('cont').style.display='block'}
 const d0=get(last),n0=d0&&d0.type!='video'&&tab!='video'&&next(d0),cont=n0?`<button class="cont" onclick="play('${d0.id}',${n0[0]},${n0[1]})"><span class="play">▶</span><span><small>Продолжить</small><b>${esc(d0.title)}</b><small>${[(d0.type=='movie'||d0.type=='video')?(d0.type=='video'?'Видео':'Фильм'):`Сезон ${n0[0]} · серия ${n0[1]}`,POS[`${d0.id}:${n0[0]}:${n0[1]}`]>5?'с '+fmt(POS[`${d0.id}:${n0[0]}:${n0[1]}`]):''].filter(Boolean).join(' · ')}</small></span></button>`:'';if($('cont').innerHTML!=cont)$('cont').innerHTML=cont;
 $('lbl').textContent=TABS.find(t=>t[0]==tab)[1];drawG()}
function drawG(){const q=Q.trim().toLowerCase(),L=DATA.filter(d=>matchesCategory(d)&&(!q||d.title.toLowerCase().includes(q))).sort((a,b)=>(FAV[b.id]?1:0)-(FAV[a.id]?1:0)),g=$('grid'),old=new Map([...g.querySelectorAll('.c')].map(e=>[e.dataset.id,e]));g.className='grid'+(NA?' na':'');
 const h=(d,i)=>{const t=total(d),p=done(d);return`<button class="c ${d.type=='video'?'wide':''}" data-id="${d.id}" style="--i:${i}" onclick="openD('${d.id}')">${pst(d)}<span class="fv ${FAV[d.id]?'on':''}${fk==d.id?' pop':''}" data-fv="${d.id}" role="button" aria-label="Избранное" onclick="event.stopPropagation();fav('${d.id}')">${STAR}</span><div class="bar"><i style="width:${p/t*100}%"></i></div><div class="meta">${[d.year,(d.type=='movie'||d.type=='video')?(p?'просмотрено':'не смотрел'):p+' из '+t].filter(Boolean).join(' · ')}</div></button>`};
 if(!L.length){const empty=`<div class="empty">${q?'Ничего не найдено':'Пока пусто.<br>Нажмите + чтобы добавить'}</div>`;if(g.innerHTML!==empty)g.innerHTML=empty;gridReady=1;return}
 let changed=old.size!=0;for(let i=0;i<L.length;i++){const d=L[i],html=h(d,i),node=old.get(d.id);if(node){if(node.outerHTML!==html){node.outerHTML=html;changed=1}else old.delete(d.id)}else{g.insertAdjacentHTML('beforeend',html);changed=1}}
 if(changed){const nodes=[...g.querySelectorAll('.c')],ids=nodes.map(e=>e.dataset.id);if(ids.some((id,i)=>id!=L[i]?.id)){const ordered=new Map(nodes.map(e=>[e.dataset.id,e]));L.forEach(d=>g.appendChild(ordered.get(d.id)))}for(const e of old.values())e.remove()}gridReady=1}
function openD(id,s){const d=get(id);if(d.type!='video')last=id;save();AN=1;nk='';da='';curSeason=s||(next(d)||[+Object.keys(d.seasons)[0]])[0];drawD(d);$('sh').classList.add('open')}
function drawD(d){curV=['d',d.id];const ss=Object.keys(d.seasons),mv=(d.type=='movie'||d.type=='video');
 let h=`<div class="top"><div class="hero"><button class="mini ${d.type=='video'?'w':''}" onclick="pickPD('${d.id}')" aria-label="Сменить постер">${pst(d)}</button><div><h3>${esc(d.title)}</h3><span class="sub">${done(d)} из ${total(d)} просмотрено</span></div></div><span class="hb"><button class="x fvb ${FAV[d.id]?'on':''}" data-fv="${d.id}" onclick="fav('${d.id}')" aria-label="Избранное">${STAR}</button><button class="x" onclick="closeD()">✕</button></span></div>`;
 if(!mv)h+=`<div class="seas">${ss.map(s=>`<button class="tab ${s==curSeason?'on':''}" onclick="curSeason=${s};AN=1;nk='';drawD(get('${d.id}'))">Сезон ${s}</button>`).join('')}<button class="tab" onclick="addSeason('${d.id}')" aria-label="Добавить сезон">＋</button></div>`;
 for(let e=1;e<=(d.seasons[curSeason]||0);e++){const k=`${d.id}:${curSeason}:${e}`;
 h+=`<div class="ep ${W[k]?'done':''} ${AN?'a':''}" style="--i:${e}"><button class="n ${F[k]||W[k]?'ok':'add'}" onclick="${F[k]||W[k]?`play('${d.id}',${curSeason},${e})`:`loadEp('${d.id}',${curSeason},${e})`}" aria-label="${F[k]||W[k]?'Открыть':'Загрузить'}">${F[k]||W[k]?'▶':'+'}${F[k]||PQ[k]?'':NL}</button><button class="er" onclick="play('${d.id}',${curSeason},${e})"><span class="t">${mv?(d.type=='video'?'Видео':'Фильм'):'Серия '+e}${bd(k)}<small>${W[k]?'просмотрено':(F[k]?(POS[k]>5?'остановились на '+fmt(POS[k]):(F[k].on?(DEAD[k]?'ссылка не работает':BG[k]!==undefined?'скачивается'+(BGP[k]?' · '+BGP[k]+'%':'…'):'по ссылке'):'загружена')+(d.type=='video'?(AU[k]?' · с аудио':' · без аудио'):'')):(PQ[k]?'загружается…':FN[k]?'загрузите заново':'не загружена'))}</small></span></button><button class="chk ${k==nk?'new':''}" onclick="tog('${k}','${d.id}')" aria-label="Просмотрено">✓</button></div>`}
 h+=`${mv?'':cntH(d)}<button class="in" onclick="pickS('${d.id}')">📁 Добавить файлы${mv?'':' в сезон '+curSeason}</button><button class="in" onclick="lnkDlg('${d.id}',${curSeason})" style="margin-top:0">🔗 Добавить по ссылке</button><button class="in" onclick="posDlg('${d.id}')" style="margin-top:0">🖼 Постер по ссылке</button>${dlAllBtn(d)}${bgRow(d)}${d.type=='video'?`<button class="in" onclick="pickA('${d.id}')">🎧 ${AU[d.id+':1:1']?'Заменить аудио':'Добавить аудио'}</button>`:''}${delRow(d.id)}<p class="hint">Серии подставятся по названию файла (S01E05) или по порядку. Постер меняется нажатием на картинку сверху.</p><button class="del" onclick="del('${d.id}')">${da==d.id?'Нажмите ещё раз — удалить':'Удалить из каталога'}</button>`;
 $('pn').innerHTML=h}
