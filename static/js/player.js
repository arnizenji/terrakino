let SRV=0,SP={},PQ={},UQ=[],ub=0,curV=null,POS=ld('pos',{}),lt=0,tp=null,ch=null,DEL=0;try{DEL=+(localStorage.getItem('del')??0)}catch(e){}if(DEL>0)DEL=-1;
function onlinePlayerMarkup(link,title){return link&&/^https:\/\//i.test(link)?`<iframe src="${esc(link)}" allowfullscreen title="${esc(title)}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:14px"></iframe>`:''}
function onlineEpisodeMarkup(link){return link&&/^https:\/\//i.test(link)?`<video controls playsinline style="width:100%" src="${esc(link)}"></video>`:''}
function rs(k){const v=$('vd'),p=POS[k];if(v&&p>5&&p<v.duration-15)v.currentTime=p}
function sp(k,f){const v=$('vd');if(!v||!v.duration)return;const n=Date.now();if(!f&&n-lt<3000)return;lt=n;if(v.currentTime>v.duration-15)delete POS[k];else if(v.currentTime>5)POS[k]=Math.floor(v.currentTime);sv('pos',POS);sv('wt',''+Math.floor(WT));sv('wd',WD)}
const IC={play:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',fs:'<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',b:'<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 5V2L8 5.5 12 9V6.2A6.5 6.5 0 1 1 5.5 12.7"/><text x="12" y="16.2" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">10</text></svg>',f:'<svg viewBox="0 0 24 24"><g transform="translate(24 0) scale(-1 1)"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 5V2L8 5.5 12 9V6.2A6.5 6.5 0 1 1 5.5 12.7"/></g><text x="12" y="16.2" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">10</text></svg>'};
let hT=null,dg=0;
function ui(){const w=$('vw'),v=$('vd');if(!w)return;w.classList.remove('hid');clearTimeout(hT);if(v&&!v.paused&&!dg)hT=setTimeout(()=>w.classList.add('hid'),2800)}
function vis(){const w=$('vw'),v=$('vd');if(!w)return;if(w.classList.contains('hid')||v.paused)ui();else{w.classList.add('hid');clearTimeout(hT)}}
function pi(){const v=$('vd'),b=$('bp');if(!v||!b)return;b.innerHTML=v.paused?IC.play:IC.pause;b.setAttribute('aria-label',v.paused?'Играть':'Пауза');ui()}
function tg(){const v=$('vd');v.paused?v.play():v.pause()}
function tmx(v){$('tm').textContent=fmt(v.currentTime)+' / '+fmt(v.duration)}
function upd(k){sp(k);sy();const v=$('vd'),s=$('sk');if(!v||!s||!v.duration)return;const t0=performance.now();if(lw&&!v.paused&&t0-lw<2500){const dt=(t0-lw)/1000,dk=dkey(new Date());WT+=dt;WD[dk]=(WD[dk]||0)+dt;if(new Date().getHours()<5)ACHN=1}lw=t0;if(!dg){s.value=v.currentTime/v.duration*1000;s.style.setProperty('--p',v.currentTime/v.duration*100+'%')}tmx(v);nxCheck(v)}
function skI(s){dg=1;const v=$('vd'),a0=$('au');if(a0)a0.muted=true;if(v.duration){v.currentTime=s.value/1000*v.duration;s.style.setProperty('--p',s.value/10+'%');tmx(v)}ui()}
function skE(){dg=0;const a=$('au');if(a){a.muted=false;sk2()}ui()}
function spd(){const v=$('vd'),a=$('au'),L=[1,1.25,1.5,2,.75],i=(L.indexOf(BR)+1)%L.length;BR=L[i];v.playbackRate=BR;if(a)a.playbackRate=BR;$('sd').textContent=BR+'×';ui()}
function bk(d){seek($('vd'),d,d<0?.2:.8);ui()}
let CB=null,FSA=0;try{FSA=+(localStorage.getItem('fsa')||0)}catch(e){}
function ask(k,cb){CB=cb;const del=SRV&&SP[k]&&delOf(k.split(':')[0])==0?'Файл сразу удалится с телефона.':'';
 let c=$('cf');if(!c){c=document.createElement('div');c.id='cf';c.className='cf';c.onclick=e=>{if(e.target==c)cfx(0)};document.body.appendChild(c)}
 c.innerHTML=`<div class="cfb"><h4>Отметить как просмотренное?</h4><p>${del||'Серия получит отметку «просмотрено».'}</p><div class="cfr"><button class="tab" onclick="cfx(0)">Отмена</button><button class="tab on" onclick="cfx(1)">Да, просмотрено</button></div></div>`;c.className='cf open'}
function cfx(y){const c=$('cf'),f=CB;CB=null;c.className='cf out';setTimeout(()=>{c.className='cf'},200);if(y&&f)f()}
function pw(k,id,s,e){const go=()=>{flip(k);play(id,s,e);render()};W[k]?go():ask(k,go)}
function fsPage(){const d=document,r=d.documentElement;if(d.fullscreenElement){d.exitFullscreen();FSA=0}else if(r.requestFullscreen){r.requestFullscreen().catch(()=>{});FSA=1}sv('fsa',''+FSA)}
document.addEventListener('pointerup',()=>{if(FSA&&!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{})},{once:true,passive:true});
function cover(id){const v=$('vd');if(!v||!v.videoWidth)return;const c=document.createElement('canvas');c.width=640;c.height=360;const r=Math.max(640/v.videoWidth,360/v.videoHeight),sw=640/r,sh=360/r;c.getContext('2d').drawImage(v,(v.videoWidth-sw)/2,(v.videoHeight-sh)/2,sw,sh,0,0,640,360);get(id).poster=c.toDataURL('image/jpeg',.82);save();render();toast('Обложка сохранена ✓')}
let WD=ld('wd',{});const dkey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
{const lim=dkey(new Date(Date.now()-400*864e5));for(const k in WD)if(k<lim)delete WD[k]}
let FAV=ld('fav',{}),NA=0,fk='',AU={},BR=1,ss=0,Q='',CK='',NXT=null,lw=0,WT=+ld('wt',0),HID=ld('hid',[]),NC=0;const STAR='<svg viewBox="0 0 24 24"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>';
function reorder(){const g=$('grid'),old={};g.querySelectorAll('.c').forEach(e=>old[e.dataset.id]=e.getBoundingClientRect());
 NA=1;render();NA=0;
 g.querySelectorAll('.c').forEach(e=>{const o=old[e.dataset.id];if(!o)return;const n=e.getBoundingClientRect(),dx=o.left-n.left,dy=o.top-n.top;if(dx||dy)e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'})})}
function fav(id){FAV[id]?delete FAV[id]:FAV[id]=1;sv('fav',FAV);
 document.querySelectorAll(`[data-fv="${id}"]`).forEach(e=>{e.classList.toggle('on',!!FAV[id]);e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')});
 fk=FAV[id]?id:'';reorder();fk='';toast(FAV[id]?'Добавлено в избранное ★':'Убрано из избранного')}
function attachA(k,f){if(!SRV){AU[k]={name:f.name,url:URL.createObjectURL(f)};refresh(k);return}PQ[k+'~a']=1;UQ.push([k,f,'audio']);runQ()}
function pickA(id){pick(fs=>attachA(id+':1:1',fs[0]),0,0,1)}
function pickAu(){pick(fs=>{nf.title=$('ti').value;nf.audio=fs[0];drawF()},0,0,1)}
function sy(){const v=$('vd'),a=$('au');if(!a||!v||dg)return;
 if(v.paused){if(!a.paused)a.pause();return}
 if(a.paused){a.currentTime=v.currentTime;a.playbackRate=BR;a.play().catch(()=>{});return}
 const d=v.currentTime-a.currentTime;
 if(Math.abs(d)>.6){ss=1;v.currentTime=a.currentTime}
 else v.playbackRate=BR*(1+(Math.abs(d)>.06?-Math.max(-.12,Math.min(.12,d*.6)):0))}
function sk2(){const v=$('vd'),a=$('au');if(!a||!v)return;if(ss){ss=0;return}if(dg)return;a.currentTime=v.currentTime;sy()}
function pcH(id,s,e){const d=get(id),k=`${id}:${s}:${e}`,f=F[k];return `<p class="hint">${[(d.type=='movie'||d.type=='video')?'':`Сезон ${s} · серия ${e}`,POS[k]>5?'остановились на '+fmt(POS[k]):''].filter(Boolean).join(' · ')}</p><button class="tab on go" onclick="pickOne('${id}',${s},${e})">📁 ${f?'Заменить':'Загрузить'} ${d.type=='video'?'видео':d.type=='movie'?'фильм':'серию'}</button>${DEAD[k]?'<p class="hint" style="color:#ff7a70">⚠ Ссылка не открывается. Вставьте новую.</p>':''}<button class="tab go" onclick="lnkDlg('${id}',${s},${e})">🔗 ${DEAD[k]?'Обновить ссылку':LK[k]?'Сменить ссылку':'Вставить ссылку'}</button>${dlBtn(id,k)}<button class="tab go" onclick="pw('${k}','${id}',${s},${e})">${W[k]?'Снять отметку':'Отметить просмотренным'}</button>${d.type=='video'?`<button class="tab go" onclick="pickA('${id}')">🎧 ${AU[k]?'Заменить аудио':'Добавить аудио'}</button>`:''}${d.type=='video'&&f?`<button class="tab go" onclick="cover('${id}')">🖼 Кадр как обложка</button>`:''}${delRow(id)}`}
function fin(){const k=CK,c=NC,n=curV&&curV[0]=='p'?nextEp(curV[2],curV[3],curV[4]):null;delete POS[k];sv('pos',POS);if(!W[k])flip(k);nxc();if(n&&!c)swap(curV[2],n[0],n[1])}
function nextEp(id,s,e){const d=get(id);if(!d||d.type=='movie'||d.type=='video')return null;let S=s,E=e+1;
 if(E>d.seasons[S]){const ks=Object.keys(d.seasons).map(Number).sort((a,b)=>a-b),i=ks.indexOf(S);if(i<0||i+1>=ks.length)return null;S=ks[i+1];E=1}
 return F[`${id}:${S}:${E}`]?[S,E]:null}
function vtH(d,s,e){const sr=d.type!='movie'&&d.type!='video'&&total(d)>1;return `<b>${esc(d.title)}</b>${sr?`<small>\u0421\u0435\u0437\u043e\u043d ${s} \u00b7 \u0441\u0435\u0440\u0438\u044f ${e}</small>`:''}`}
function nxCheck(v){const rm=v.duration-v.currentTime,c=curV&&curV[0]=='p';
 if(c&&v.duration>60&&rm<=30&&rm>0&&!NC&&!$('nx')&&nextEp(curV[2],curV[3],curV[4]))nxShow();
 else if($('nx')&&(rm>33||!c))nxc();
 const b=$('np');if(b)b.style.width=Math.max(0,Math.min(100,(30-rm)/30*100))+'%'}
function nxShow(){const w=$('vw'),id=curV[2],s=curV[3],n=nextEp(id,s,curV[4]);if(!w||!n)return;
 w.insertAdjacentHTML('beforeend',`<div class="nx" id="nx"><span class="nt"><b>\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u0441\u0435\u0440\u0438\u044f</b><small>${n[0]!=s?'\u0421\u0435\u0437\u043e\u043d '+n[0]+' \u00b7 ':''}\u0441\u0435\u0440\u0438\u044f ${n[1]}</small></span><span class="nb"><button onclick="nxc(1)">\u041e\u0442\u043c\u0435\u043d\u0430</button><button class="on" onclick="nxg(${n[0]},${n[1]})">\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c</button></span><i class="np" id="np"></i></div>`)}
function nxc(u){const e=$('nx');if(e)e.remove();if(u)NC=1}
function nxg(S,E){const id=curV&&curV[2],k=CK;nxc();if(!id)return;if(!W[k])flip(k);delete POS[k];sv('pos',POS);swap(id,S,E)}
function swap(id,s,e){const k=`${id}:${s}:${e}`,f=F[k],v=$('vd');if(!f||!v){play(id,s,e);return}
 nxc();NC=0;CK=k;curV=['p',k,id,s,e];curSeason=s;last=id;save();bgAuto(id,k);BR=1;ss=0;lw=0;
 const a=$('au');if(a)a.remove();v.muted=false;v.playbackRate=1;if($('sd'))$('sd').textContent='1\u00d7';
 v.src=vsrc(f);v.play().catch(()=>{});$('pc').innerHTML=pcH(id,s,e);if($('vt'))$('vt').innerHTML=vtH(get(id),s,e)}
const fmtT=t=>t<3600?Math.round(t/60)+' \u043c\u0438\u043d':(t/3600).toFixed(1)+' \u0447';
const gb=b=>b<1e9?Math.round(b/1048576)+' \u041c\u0411':(b/1073741824).toFixed(b<1e10?1:0)+' \u0413\u0411';
