const $=id=>document.getElementById(id);
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const CLOUD_KEYS=new Set(['lib','w','pos','fav','prof','ach','wt','wd','lk','last','theme','del']);
let CLOUD_READY=false,CLOUD_APPLYING=false,CLOUD_LOAD_FOR='',CLOUD_DIRTY=0,CLOUD_BUSY=false,CLOUD_TIMER=0,CLOUD_STAMP='',CLOUD_MSG='Ожидает входа';
const sv=(k,v)=>{try{localStorage.setItem(k,typeof v=='string'?v:JSON.stringify(v))}catch(e){}if(CLOUD_KEYS.has(k))queueCloudSave()};
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const THEMES=[
{id:'terra',ps:[58,52],n:'Терра',hue:20,bg:'#F6EFE6',card:'#EDE3D6',ink:'#2B1D16',mute:'#8A7566',acc:'#C65D3B',on:'#FFF8F0',line:'#E0D3C3',dk:'20,10,5',lt:'#FFF8F0',ltr:'255,248,240'},
{id:'sage',ps:[26,42],n:'Шалфей',hue:130,bg:'#EEF1E8',card:'#E0E7D5',ink:'#1F2A1C',mute:'#6F7D66',acc:'#587B58',on:'#F7FBF2',line:'#D1DAC3',dk:'12,22,12',lt:'#F7FBF2',ltr:'247,251,242'},
{id:'ocean',ps:[46,42],n:'Океан',hue:197,bg:'#EAF1F3',card:'#DAE6EA',ink:'#14262E',mute:'#5F7983',acc:'#2B7A94',on:'#F4FAFC',line:'#C8DADF',dk:'8,20,26',lt:'#F4FAFC',ltr:'244,250,252'},
{id:'plum',ps:[40,44],n:'Слива',hue:338,bg:'#F4ECF0',card:'#EADBE3',ink:'#2A1722',mute:'#856372',acc:'#A3426B',on:'#FFF5F9',line:'#DDC8D2',dk:'26,10,18',lt:'#FFF5F9',ltr:'255,245,249'},
{id:'sand',ps:[52,44],n:'Охра',hue:42,bg:'#F7F1E1',card:'#EEE3C6',ink:'#2C2410',mute:'#86784F',acc:'#B07A1C',on:'#FFFBEF',line:'#E0D4B2',dk:'26,18,6',lt:'#FFFBEF',ltr:'255,251,239'},
{id:'lav',ps:[36,50],n:'Лаванда',hue:256,bg:'#F0EDF6',card:'#E2DDEE',ink:'#221D33',mute:'#766E92',acc:'#6A5AB8',on:'#FAF8FF',line:'#D4CDE4',dk:'18,12,30',lt:'#FAF8FF',ltr:'250,248,255'},
{id:'cocoa',ps:[50,46],n:'Какао',hue:22,dark:1,bg:'#2A1D18',card:'#382822',ink:'#F3E7DA',mute:'#B39A8A',acc:'#E0805A',on:'#2A1D18',line:'#4B362D',dk:'10,6,4',lt:'#FFF4EA',ltr:'255,244,234'},
{id:'rose',ps:[55,48],n:'Роза',hue:350,bg:'#FBEFF0',card:'#F3DDE0',ink:'#2E1519',mute:'#8A6168',acc:'#C93A55',on:'#FFF5F6',line:'#EBCDD1',dk:'38,12,18',lt:'#FFF5F6',ltr:'255,245,246'},
{id:'mint',ps:[42,40],n:'Мята',hue:160,bg:'#EAF5F0',card:'#D7EBE2',ink:'#11281F',mute:'#557669',acc:'#17876A',on:'#F3FFFA',line:'#C3DDD1',dk:'8,28,20',lt:'#F3FFFA',ltr:'243,255,250'},
{id:'sky',ps:[52,46],n:'Небо',hue:215,bg:'#EBF3FC',card:'#D9E7F8',ink:'#12243B',mute:'#587090',acc:'#2862C8',on:'#F5F9FF',line:'#C6D9F0',dk:'10,22,40',lt:'#F5F9FF',ltr:'245,249,255'},
{id:'peach',ps:[62,52],n:'Персик',hue:22,bg:'#FDF0E8',card:'#F8E0D2',ink:'#33190F',mute:'#8E6450',acc:'#C0521E',on:'#FFF7F1',line:'#EFCDBA',dk:'40,18,8',lt:'#FFF7F1',ltr:'255,247,241'},
{id:'lemon',ps:[60,44],n:'Лимон',hue:55,bg:'#FBF8E3',card:'#F3EEC4',ink:'#2D2A0B',mute:'#7B7736',acc:'#8F7B00',on:'#FFFDEB',line:'#E6DFA8',dk:'34,30,4',lt:'#FFFDEB',ltr:'255,253,235'},
{id:'berry',ps:[45,44],n:'Ягода',hue:290,bg:'#F6ECF7',card:'#EBD8EE',ink:'#2A1230',mute:'#7C5984',acc:'#8E34A8',on:'#FCF5FF',line:'#DCC4E2',dk:'34,10,42',lt:'#FCF5FF',ltr:'252,245,255'},
{id:'slate',ps:[18,40],n:'Сланец',hue:210,bg:'#EEF0F3',card:'#DFE3E9',ink:'#1B2128',mute:'#626D7B',acc:'#3C5B7B',on:'#F8FAFC',line:'#CDD3DB',dk:'14,18,24',lt:'#F8FAFC',ltr:'248,250,252'},
{id:'paper',ps:[0,30],n:'Бумага',hue:0,bg:'#F5F5F3',card:'#E8E8E5',ink:'#151515',mute:'#6E6E6E',acc:'#222222',on:'#F5F5F3',line:'#D8D8D4',dk:'10,10,10',lt:'#F5F5F3',ltr:'245,245,243'},
{id:'sponge',ps:[58,40],n:'🧽 Губка',hue:205,bg:'#FFF5BF',card:'#FFE36E',ink:'#3B230F',mute:'#74500F',acc:'#1B6FB8',on:'#FFFFFF',line:'#EBCB48',dk:'30,18,4',lt:'#FFFDF2',ltr:'255,253,242'},
{id:'midnight',ps:[48,46],n:'Полночь',hue:222,dark:1,bg:'#0F1624',card:'#18223A',ink:'#E6EDFA',mute:'#8C9BB8',acc:'#6A97FF',on:'#0B1020',line:'#26334F',dk:'3,6,14',lt:'#F2F6FF',ltr:'242,246,255'},
{id:'graphite',ps:[14,40],n:'Графит',hue:215,dark:1,bg:'#17181A',card:'#232528',ink:'#ECECEC',mute:'#9A9DA3',acc:'#8AB4F8',on:'#101113',line:'#33363A',dk:'4,4,5',lt:'#F5F5F5',ltr:'245,245,245'},
{id:'forest',ps:[38,38],n:'Лес',hue:150,dark:1,bg:'#0F1A14',card:'#172A20',ink:'#E3F2E8',mute:'#84A593',acc:'#4CC38A',on:'#08140E',line:'#24402F',dk:'3,10,6',lt:'#EFFAF3',ltr:'239,250,243'},
{id:'wine',ps:[44,42],n:'Бордо',hue:345,dark:1,bg:'#1C1014',card:'#2B1820',ink:'#F6E7EA',mute:'#B58A94',acc:'#E8708B',on:'#200C12',line:'#432530',dk:'8,2,5',lt:'#FFF2F4',ltr:'255,242,244'},
{id:'dusk',ps:[45,44],n:'Закат',hue:280,dark:1,bg:'#1D1426',card:'#2B1D3A',ink:'#F4EAFB',mute:'#A890BF',acc:'#FF8A5B',on:'#24130D',line:'#43305A',dk:'8,3,14',lt:'#FFF3EC',ltr:'255,243,236'},
{id:'amoled',ps:[20,32],n:'Чёрный',hue:12,dark:1,bg:'#000000',card:'#131313',ink:'#F2F2F2',mute:'#8E8E8E',acc:'#FF6B4A',on:'#000000',line:'#262626',dk:'0,0,0',lt:'#FFFFFF',ltr:'255,255,255'},
{id:'deep',ps:[48,36],n:'Глубина',hue:190,dark:1,bg:'#08171D',card:'#0F2A33',ink:'#DDF3F8',mute:'#7FA9B5',acc:'#2CC6D8',on:'#04141A',line:'#1B3F4B',dk:'2,8,10',lt:'#EAFBFE',ltr:'234,251,254'}];
let TH=THEMES.find(t=>t.id==localStorage.getItem('theme'))||THEMES[0];
function applyTheme(t,anim){const r=document.documentElement,v={'--bg':t.bg,'--card':t.card,'--ink':t.ink,'--mute':t.mute,'--acc':t.acc,'--on':t.on,'--line':t.line,'--dk':t.dk,'--lt':t.lt,'--ltr':t.ltr};
 if(anim){r.classList.add('tt');setTimeout(()=>r.classList.remove('tt'),700)}
 for(const k in v)r.style.setProperty(k,v[k]);r.style.colorScheme=t.dark?'dark':'light';
 sv('thv',v);sv('thd',t.dark?'1':'0');sv('theme',t.id);TH=t;const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t.bg;try{if(window.AndroidApp)AndroidApp.bars(t.bg,!!t.dark)}catch(e){}}
function setTheme(id){applyTheme(THEMES.find(t=>t.id==id),1);render();drawP()}
const TABS=[['all','Все'],['anime','Аниме'],['movie','Фильмы'],['series','Сериалы']];
let DATA=ld('lib',[{id:'ment',type:'series',title:'Менталист',year:'2008–2015',seasons:{1:22,2:23,3:24,4:24,5:22,6:22,7:13},h:14}]);
let W=ld('w',{}),FN=ld('fn',{}),F={},tab='all',last=null,curSeason=1,AN=1,nk='',da='',nf;
try{last=localStorage.getItem('last')}catch(e){}
const save=()=>{sv('w',W);sv('fn',FN);sv('lib',DATA);sv('lk',LK);if(last)sv('last',last)};
const get=id=>DATA.find(x=>x.id==id);
const col=d=>{const h=TH.hue+(d.h-20),[sa,li]=TH.ps;return [`hsl(${h} ${sa}% ${li}%)`,`hsl(${h-8} ${Math.max(18,sa-3)}% 24%)`]};
const pst=d=>d.poster?`<div class="poster img"><img src="${d.poster}" alt="" loading="lazy"></div>`:`<div class="poster" style="background:linear-gradient(160deg,${col(d)[0]},${col(d)[1]})"><span>${esc(d.title)}</span></div>`;
const categoryOf=d=>d.type=='movie'?'movie':d.type=='cartoon'?'anime':d.type=='video'?null:'series';
const total=d=>Object.values(d.seasons).reduce((a,b)=>a+b,0);
const done=d=>Object.keys(W).filter(k=>k.startsWith(d.id+':')).length;
