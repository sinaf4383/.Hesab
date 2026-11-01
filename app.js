/* kargah v11 */
'use strict';
/* ---------- helpers ---------- */
const KEY='kargah.v1',KEY2='kargah.v2';
const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function catField(list,sel){
  const used=[...new Set(live(S.tx).map(t=>t.cat).filter(Boolean))].filter(c=>!list.includes(c));
  if(sel&&sel!=='سایر'&&!list.includes(sel)&&!used.includes(sel))used.push(sel);
  const base=list.filter(c=>c!=='سایر').concat(used.filter(c=>c!=='سایر'));
  const cur0=sel&&(base.includes(sel)||sel==='سایر')?sel:base[0];
  return `<select name="cat" onchange="document.getElementById('catx').style.display=this.value==='__other'?'block':'none'">${base.map(c=>`<option value="${esc(c)}" ${c===cur0?'selected':''}>${esc(c)}</option>`).join('')}${sel==='سایر'?'<option value="سایر" selected>سایر</option>':''}<option value="__other">سایر (خودم می‌نویسم)…</option></select><input id="catx" name="catx" placeholder="چه چیزی؟ مثلاً بنزین، غذا، تعمیر دستگاه" style="display:none;margin-top:8px">`;
}
function readCat(fd){const c=fd.get('cat');if(c==='__other'){return (fd.get('catx')||'').trim()||'سایر';}return c;}
const CATS=['مصالح و آهن','برق و جوش','رنگ و پوشش','اجرت و کارگر','حمل و نقل','ابزار و تعمیرات','اجاره و قبوض','سایر'];
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fa=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const en=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const fmt=n=>fa(Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'٬'));
const money=n=>(n<0?'−':'')+fmt(n)+' تومان';
function words(n){n=Math.round(Math.abs(n));if(n<1000)return fa(n)+' تومان';const t=Math.round(n/1e3),m=Math.floor(t/1000),k=t%1000,p=[];if(m)p.push(fa(m)+' میلیون');if(k)p.push(fa(k)+' هزار');return p.join(' و ')+' تومان';}
/* Jalali conversion */
function g2j(gy,gm,gd){const g=[0,31,59,90,120,151,181,212,243,273,304,334];let jy=gy>1600?979:0;gy-=gy>1600?1600:621;const gy2=gm>2?gy+1:gy;let days=365*gy+~~((gy2+3)/4)-~~((gy2+99)/100)+~~((gy2+399)/400)-80+gd+g[gm-1];jy+=33*~~(days/12053);days%=12053;jy+=4*~~(days/1461);days%=1461;if(days>365){jy+=~~((days-1)/365);days=(days-1)%365;}const jm=days<186?1+~~(days/31):7+~~((days-186)/30);const jd=1+(days<186?days%31:(days-186)%30);return[jy,jm,jd];}
function j2g(jy,jm,jd){let gy=jy>979?1600:621;jy-=jy>979?979:0;let days=365*jy+~~(jy/33)*8+~~(((jy%33)+3)/4)+78+jd+(jm<7?(jm-1)*31:(jm-7)*30+186);gy+=400*~~(days/146097);days%=146097;if(days>36524){gy+=100*~~(--days/36524);days%=36524;if(days>=365)days++;}gy+=4*~~(days/1461);days%=1461;if(days>365){gy+=~~((days-1)/365);days=(days-1)%365;}let gd=days+1;const s=[0,31,(gy%4==0&&gy%100!=0)||gy%400==0?29:28,31,30,31,30,31,31,30,31,30,31];let gm;for(gm=0;gm<13&&gd>s[gm];gm++)gd-=s[gm];return[gy,gm,gd];}
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>iso(new Date());
const pISO=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c);};
const toJ=s=>{const[a,b,c]=s.split('-').map(Number);return g2j(a,b,c);};
const jstr=s=>{if(!s)return '—';const[y,m,d]=toJ(s);return fa(d)+' '+MONTHS[m-1]+' '+fa(y);};
const dayDiff=(a,b)=>Math.round((pISO(b)-pISO(a))/864e5);
function jdate(name,val,empty){
  const[jy,jm,jd]=toJ(val||today());const cy=toJ(today())[0];
  let y='';if(empty)y+=`<option value="">—</option>`;
  for(let i=Math.min(cy-3,jy);i<=Math.max(cy+3,jy);i++)y+=`<option value="${i}" ${(val||!empty)&&i===jy?'selected':''}>${fa(i)}</option>`;
  let m='',d='';
  MONTHS.forEach((n,i)=>m+=`<option value="${i+1}" ${i+1===jm?'selected':''}>${n}</option>`);
  for(let i=1;i<=31;i++)d+=`<option value="${i}" ${i===jd?'selected':''}>${fa(i)}</option>`;
  return `<div class="jd"><select name="${name}_d">${d}</select><select name="${name}_m">${m}</select><select name="${name}_y">${y}</select></div>`;
}
function readJ(fd,name){const y=fd.get(name+'_y');if(!y)return '';const g=j2g(+y,+fd.get(name+'_m'),+fd.get(name+'_d'));return g[0]+'-'+String(g[1]).padStart(2,'0')+'-'+String(g[2]).padStart(2,'0');}
const num=(fd,n)=>parseInt(en(fd.get(n)||'').replace(/\D/g,''),10)||0;
const amt=(name,v)=>`<input class="amt" name="${name}" inputmode="numeric" autocomplete="off" placeholder="مبلغ به تومان" value="${v?fmt(v):''}">`;

/* ---------- icons ---------- */
const ICON={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.6c2.6.3 4.1 2 4.5 4.9"/>',
 list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
 chart:'<path d="M4 20V11M10 20V4M16 20v-6M2 20h20"/>',
 scale:'<path d="M12 3v18M6 21h12M5 7h14"/><path d="M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/>',
 receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 wallet:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
 bank:'<path d="M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 back:'<path d="M9 5l7 7-7 7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 down:'<path d="M12 4v14M6 12l6 6 6-6"/>',
 up:'<path d="M12 20V6M6 12l6-6 6 6"/>',
 doc:'<path d="M7 3h8l4 4v14H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
 swap:'<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
 book:'<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>'
};
const ic=(n,c)=>`<svg class="ic ${c||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||''}</svg>`;
const av=n=>{n=String(n||'؟').trim();const ch=[...n][0]||'؟';let h=0;for(const x of n)h=(h*31+x.charCodeAt(0))%6;return `<span class="av a${h}">${esc(ch)}</span>`;};
const avi=(name,cls)=>`<span class="av ${cls}">${ic(name)}</span>`;
const tiles=(arr,id)=>`<div class="tiles">${arr.map(([act,i,c,l])=>`<button class="tile" data-a="${act}"${id?` data-id="${id}"`:''}>${avi(i,c)}<span>${l}</span></button>`).join('')}</div>`;
const CREDIT='سینا فرخی';

/* ---------- data ---------- */
function fresh(){return{v:1,set:{nameA:'سینا',nameB:'شریک',who:'a',share:50,shop:'کارگاه آهنگری',phone:'',done:false,lastExport:0},cust:[],ord:[],tx:[],pay:[],log:[]};}
const TYPES={
  shop:{label:'کارگاه / کسب‌وکار دو نفره',hint:'مشتری، سفارش، فاکتور و تسویه بین دو شریک',home:'home',cols:['cust','ord','tx','pay','chq','notes','appt','sitems','smov']},
  solo:{label:'کسب‌وکار تک‌نفره',hint:'مشتری، سفارش و فاکتور بدون شریک (مثلاً اتلیه)',home:'home',cols:['cust','ord','tx','pay','chq','notes','appt','sitems','smov']},
  trip:{label:'سفر / دنگ',hint:'خرج هر نفر و حساب دنگ‌ها، با امکان بستن سفر',home:'texp',cols:['people','exp']},
  personal:{label:'شخصی',hint:'درآمد و خرج خانه، وام و بدهی',home:'phome',cols:['tx','debts']}
};
function freshD(type){
  if(type==='shop')return fresh();
  if(type==='solo'){const f=fresh();f.set=Object.assign(f.set,{nameA:'من',nameB:'',share:100,solo:true,done:true,shop:'',phone:''});return f;}
  const base={v:1,set:{done:true,who:'a',lastExport:0},log:[]};
  return type==='trip'?Object.assign(base,{people:[],exp:[],closed:false}):Object.assign(base,{tx:[],debts:[]});
}
function loadRoot(){
  try{const r=JSON.parse(localStorage.getItem(KEY2));if(r&&r.v===2&&r.books)return r;}catch(e){}
  try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.v===1){const id=uid();return{v:2,cur:id,books:[{id,type:'shop',name:(o.set&&o.set.shop)||'کارگاه',d:o}]};}}catch(e){}
  return{v:2,cur:null,books:[]};
}
let R=loadRoot(),S=null;
const cur=()=>R.books.find(b=>b.id===R.cur);
const btype=()=>cur()?cur().type:'shop';
const save=()=>{try{localStorage.setItem(KEY2,JSON.stringify(R));}catch(e){toast('ذخیره‌سازی ناموفق بود');}};
function useBook(id){R.cur=id;S=cur().d;TYPES[cur().type].cols.forEach(c=>{if(!S[c])S[c]=[];});if(!S.log)S.log=[];if(cur().type==='shop'||cur().type==='solo')S.pay=S.pay||[];save();}
const live=a=>a.filter(x=>!x.del);
let lastPut=null;
function put(col,rec){rec.u=Date.now();const i=S[col].findIndex(x=>x.id===rec.id);if(i<0)S[col].push(rec);else S[col][i]=rec;save();lastPut=rec.del?null:{col,id:rec.id};}
function logit(text){S.log.push({id:uid(),ts:Date.now(),by:S.set.who,text});save();}
const nm=k=>k==='a'?(S.set.nameA||'من'):(S.set.nameB||'شریک');
const accLabel=k=>S.set.solo?({a:'حساب بانکی',s:'صندوق / نقد'})[k]||k:({a:'حساب '+S.set.nameA,b:'حساب '+S.set.nameB,s:'حساب مشترک',pa:'جیب شخصی '+S.set.nameA,pb:'جیب شخصی '+S.set.nameB})[k]||k;
const custOf=o=>S.cust.find(c=>c.id===o.cid)||{name:'؟'};
const orderPrice=o=>o.items&&o.items.length?o.items.reduce((s,i)=>s+i.q*i.p,0):(+o.price||0);
const paid=o=>live(S.tx).filter(t=>t.t==='in'&&t.oid===o.id).reduce((s,t)=>s+t.a,0);
const costs=o=>live(S.tx).filter(t=>t.t==='out'&&t.oid===o.id).reduce((s,t)=>s+t.a,0);
const rest=o=>orderPrice(o)-paid(o);
const ordLabel=o=>custOf(o).name+' — '+(o.title||'سفارش');
const byDate=(x,y)=>x.d<y.d?1:x.d>y.d?-1:(y.u||0)-(x.u||0);

function calc(){
  const inc={a:0,b:0,s:0},out={a:0,b:0,s:0},pk={a:0,b:0},dr={a:0,b:0,s:0},dw={a:0,b:0},stn={a:0,b:0};
  live(S.tx).forEach(t=>{
    if(t.t==='in')inc[t.acc]+=t.a;
    else if(t.t==='out'){if(t.acc==='pa')pk.a+=t.a;else if(t.acc==='pb')pk.b+=t.a;else out[t.acc]+=t.a;}
    else if(t.t==='draw'){dr[t.acc]+=t.a;dw[t.who]+=t.a;}
    else if(t.t==='settle'){const to=t.from==='a'?'b':'a';stn[t.from]-=t.a;stn[to]+=t.a;}
  });
  const H={a:inc.a-out.a-dr.a+stn.a,b:inc.b-out.b-dr.b+stn.b,s:inc.s-out.s-dr.s};
  const V={a:H.a-pk.a+dw.a,b:H.b-pk.b+dw.b};
  const r=(+S.set.share||50)/100;
  return{inc,out,pk,dr,dw,stn,H,V,x:V.a-r*(V.a+V.b)};
}
function settleText(c){
  if(Math.abs(c.x)<1000)return 'حساب دو شریک برابر است';
  const p=c.x>0?'a':'b',q=c.x>0?'b':'a';
  return `${nm(p)} باید ${words(c.x)} به ${nm(q)} بدهد`;
}

/* ---------- ui core ---------- */
let route={v:'home'};
function go(v,p){route=Object.assign({v},p||{});history.pushState({r:route},'');render();window.scrollTo(0,0);}
window.addEventListener('popstate',e=>{closeSheet(true);route=(e.state&&e.state.r)||{v:'home'};render();});
let toastFn=null;
function toast(m,label,fn){const t=$('#toast');toastFn=fn||null;t.innerHTML='<span>'+esc(m)+'</span>'+(label?'<button class="tb" data-a="toastAct">'+esc(label)+'</button>':'');t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',label?8000:2600);}
function closeSheet(){$('#sheet').classList.remove('on');$('#sheet').innerHTML='';}
let curDel=null,curDelMsg='';
function sheet(title,body,submit,opts){
  opts=opts||{};curDel=opts.del||null;curDelMsg=opts.delMsg||'این مورد حذف شود؟';
  const el=$('#sheet');
  el.innerHTML=`<div class="sh"><div class="shh"><b>${title}</b><button type="button" class="x" data-a="close">بستن</button></div><form id="f" autocomplete="off">${body}<div class="row"><button class="btn pri" type="submit">${opts.ok||'ذخیره'}</button>${opts.del?'<button type="button" class="btn dng" data-a="fdel">حذف</button>':''}</div></form></div>`;
  el.classList.add('on');
  const f=$('#f');
  f.onsubmit=e=>{e.preventDefault();lastPut=null;const err=submit(new FormData(f));if(err)toast(err);else{closeSheet();render();if(lastPut){const lp=lastPut;lastPut=null;toast('ذخیره شد','ویرایش',()=>editRec(lp));}}};
  const first=f.querySelector('input:not([type=hidden]):not([type=radio]),select');
}
document.addEventListener('input',e=>{
  if(e.target.classList&&e.target.classList.contains('amt')){const d=en(e.target.value).replace(/\D/g,'');e.target.value=d?fmt(+d):'';}
});
const optsHtml=(list,sel)=>list.map(([v,l])=>`<option value="${esc(v)}" ${v===sel?'selected':''}>${esc(l)}</option>`).join('');
const accOpts=(sel,pocket)=>optsHtml((S.set.solo?[['a',accLabel('a')],['s',accLabel('s')]]:[['a',accLabel('a')],['b',accLabel('b')],['s',accLabel('s')]]).concat(pocket&&!S.set.solo?[['pa',accLabel('pa')],['pb',accLabel('pb')]]:[]),sel);
const ordOpts=(sel,none)=>optsHtml((none?[['',none]]:[]).concat(live(S.ord).sort((x,y)=>y.u-x.u).map(o=>[o.id,ordLabel(o)])),sel||'');

/* ---------- in-app dialogs (confirm/prompt do not work in installed apps) ---------- */
let askCb=null;
function ask(msg,cb,title){
  askCb=cb;const el=$('#sheet');
  el.innerHTML=`<div class="sh"><div class="shh"><b>${esc(title||'مطمئنید؟')}</b></div><p style="margin-bottom:14px">${esc(msg)}</p><div class="row"><button type="button" class="btn dng" data-a="askYes">بله</button><button type="button" class="btn" data-a="close">خیر</button></div></div>`;
  el.classList.add('on');
}
function askWord(msg,cb){
  sheet('تأیید نهایی',`<p style="margin-bottom:12px">${esc(msg)}</p><div class="f"><label class="l">برای تأیید، کلمهٔ «پاک» را بنویسید</label><input name="w" autocomplete="off"></div>`,fd=>{
    if((fd.get('w')||'').trim()!=='پاک')return 'کلمه را درست بنویسید';
    cb();
  },{ok:'تأیید و پاک کردن'});
}
function editRec(lp){
  if(window.xEditRec&&xEditRec(lp))return;
  const rec=lp&&S[lp.col]&&S[lp.col].find(x=>x.id===lp.id);
  if(lp&&lp.col==='debtpay')return go('pdebtd',{id:lp.id});
  if(lp&&lp.col==='bpay')return go('bdebtd',{id:lp.id});
  if(!rec||rec.del)return;
  const t=btype();
  if(lp.col==='tx')return t==='personal'?fPTx(null,rec):editTx(rec.id);
  if(lp.col==='ord')return fOrder(rec);
  if(lp.col==='cust')return fCust(rec);
  if(lp.col==='exp')return A.edExp({id:rec.id});
  if(lp.col==='debts')return fDebt(rec);
  if(lp.col==='people')return fPerson(rec);
}
/* ---------- forms ---------- */
function ordCounts(o){const n=live(S.tx).filter(t=>t.oid===o.id).length;return n;}
function cascadeDeleteOrder(o){
  o.del=true;put('ord',o);live(S.tx).filter(t=>t.oid===o.id).forEach(t=>{t.del=true;put('tx',t);});
  logit('حذف سفارش «'+o.title+'» و تراکنش‌های آن');lastPut=null;
}
function cascadeDeleteCustomer(c){
  const os=live(S.ord).filter(o=>o.cid===c.id);
  os.forEach(o=>cascadeDeleteOrder(o));
  c.del=true;put('cust',c);logit('حذف مشتری «'+c.name+'»');lastPut=null;
}
const custDelMsg=c=>{const os=live(S.ord).filter(o=>o.cid===c.id),n=os.reduce((a,o)=>a+ordCounts(o),0);return 'مشتری «'+c.name+'»'+(os.length?' همراه با '+fa(os.length)+' سفارش و '+fa(n)+' دریافتی/هزینهٔ ثبت‌شده برای او':'')+' حذف شود؟ این کار برگشت ندارد.';};
const ordDelMsg=o=>'سفارش «'+o.title+'» همراه با '+fa(ordCounts(o))+' دریافتی/هزینهٔ آن حذف شود؟';
function fCust(rec){
  const r=rec||{};
  sheet(rec?'ویرایش مشتری':'مشتری جدید',`<div class="f"><label class="l">نام مشتری</label><input name="name" value="${esc(r.name)}"></div><div class="f"><label class="l">تلفن (اختیاری)</label><input name="phone" inputmode="tel" value="${esc(r.phone)}"></div><div class="f"><label class="l">یادداشت</label><input name="note" value="${esc(r.note)}"></div>`,fd=>{
    const name=(fd.get('name')||'').trim();if(!name)return 'نام مشتری را بنویسید';
    put('cust',{...r,id:r.id||uid(),name,phone:(fd.get('phone')||'').trim(),note:(fd.get('note')||'').trim()});
    logit((rec?'ویرایش':'ثبت')+' مشتری '+name);
  },rec?{delMsg:custDelMsg(r),del:()=>{cascadeDeleteCustomer(r);history.back();}}:null);
}
function fOrder(rec,cid){
  const r=rec||{};const cu=S.cust.find(c=>c.id===(r.cid||cid));
  sheet(rec?'ویرایش سفارش':'سفارش جدید',`
  <div class="f"><label class="l">نام مشتری</label><input name="cname" list="cl" value="${esc(cu?cu.name:'')}"><datalist id="cl">${live(S.cust).map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist></div>
  <div class="f"><label class="l">تلفن مشتری (برای مشتری جدید، اختیاری)</label><input name="phone" inputmode="tel" value="${esc(cu?cu.phone:'')}"></div>
  <div class="f"><label class="l">سفارش چیست؟ (مثلاً درب حیاط)</label><input name="title" value="${esc(r.title)}"></div>
  <div class="f"><label class="l">مبلغ کل توافق‌شده</label>${amt('price',r.items&&r.items.length?orderPrice(r):r.price)}</div>
  <div class="f"><label class="l">تاریخ سفارش</label>${jdate('d',r.d||today())}</div>
  <div class="f"><label class="l">سررسید دریافت باقی‌مانده (اختیاری)</label>${jdate('due',r.due||'',true)}</div>`,fd=>{
    const name=(fd.get('cname')||'').trim();if(!name)return 'نام مشتری را بنویسید';
    let c=live(S.cust).find(x=>x.name===name);
    if(!c){c={id:uid(),name,phone:(fd.get('phone')||'').trim(),note:''};put('cust',c);}
    else if(fd.get('phone')&&!c.phone){c.phone=fd.get('phone').trim();put('cust',c);}
    const o={...r,id:r.id||uid(),cid:c.id,title:(fd.get('title')||'').trim()||'سفارش',price:num(fd,'price'),d:readJ(fd,'d')||today(),due:readJ(fd,'due'),items:r.items||[]};
    if(!rec)o.no=Math.max(0,...S.ord.map(x=>x.no||0))+1;
    put('ord',o);logit((rec?'ویرایش':'ثبت')+' سفارش «'+o.title+'» برای '+name);
    if(!rec){route={v:'ord',id:o.id};history.pushState({r:route},'');}
  },rec?{delMsg:ordDelMsg(r),del:()=>{cascadeDeleteOrder(r);history.go(-1);}}:null);
}
function fItem(oid,idx){
  const o=S.ord.find(x=>x.id===oid);const it=idx>=0?o.items[idx]:{n:'',q:1,p:0};
  sheet(idx>=0?'ویرایش قلم':'قلم فاکتور',`<div class="f"><label class="l">شرح (مثلاً نرده، ورق، جوشکاری)</label><input name="n" value="${esc(it.n)}"></div><div class="f"><label class="l">تعداد / متراژ</label><input name="q" inputmode="decimal" value="${fa(it.q)}"></div><div class="f"><label class="l">قیمت واحد</label>${amt('p',it.p)}</div>`,fd=>{
    const n=(fd.get('n')||'').trim(),q=parseFloat(en(fd.get('q')||'1').replace('٫','.'))||1,p=num(fd,'p');
    if(!n||!p)return 'شرح و قیمت را وارد کنید';
    o.items=o.items||[];const rec={n,q,p};
    if(idx>=0)o.items[idx]=rec;else o.items.push(rec);
    o.price=orderPrice(o);put('ord',o);logit('قلم «'+n+'» در سفارش «'+o.title+'»');lastPut=null;
  },idx>=0?{del:()=>{o.items.splice(idx,1);o.price=orderPrice(o);put('ord',o);logit('حذف یک قلم از سفارش «'+o.title+'»');}}:null);
}
function fIn(oid,rec){
  const r=rec||{};oid=r.oid||oid||'';
  sheet(rec?'ویرایش دریافتی':'دریافتی از مشتری',`
  <div class="f"><label class="l">سفارش</label><select name="oid">${ordOpts(oid,'— بدون سفارش —')}</select></div>
  <div class="f"><label class="l">مبلغ</label>${amt('a',r.a)}</div>
  <div class="chips"><label><input type="radio" name="kind" value="deposit" ${r.kind!=='pay'?'checked':''}><span>بیعانه</span></label><label><input type="radio" name="kind" value="pay" ${r.kind==='pay'?'checked':''}><span>پرداخت</span></label></div>
  <div class="f"><label class="l">به کدام حساب آمد؟</label><select name="acc">${accOpts(r.acc||S.set.who)}</select></div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>
  <div class="f"><label class="l">توضیح (اختیاری)</label><input name="note" value="${esc(r.note)}"></div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    const oidv=fd.get('oid')||'';
    put('tx',{...r,id:r.id||uid(),t:'in',a,kind:fd.get('kind'),acc:fd.get('acc'),oid:oidv,d:readJ(fd,'d')||today(),note:(fd.get('note')||'').trim(),by:r.by||S.set.who});
    const o=S.ord.find(x=>x.id===oidv);
    logit((rec?'ویرایش':'ثبت')+' دریافتی '+fmt(a)+(o?' از '+custOf(o).name:''));
  },rec?{del:()=>{r.del=true;put('tx',r);logit('حذف دریافتی '+fmt(r.a));}}:null);
}
function fOut(oid,rec){
  const r=rec||{};oid=r.oid||oid||'';
  const od=debtOfTx(r);
  const dl=live(S.pay||[]).filter(x=>brest(x)>0||(od&&x.id===od.id));
  let cf=catField(CATS,od?'':r.cat);
  if(dl.length){
    const grp=`<optgroup label="پرداخت بدهی‌ها">${dl.map(x=>`<option value="__debt:${x.id}" ${od&&od.id===x.id?'selected':''}>بابت بدهی: ${esc(x.name)} (مانده ${fmt(Math.max(0,brest(x)))})</option>`).join('')}</optgroup>`;
    if(od)cf=cf.split(' selected').join('');
    cf=cf.replace('<option value="__other">',grp+'<option value="__other">');
  }
  sheet(rec?'ویرایش هزینه':'ثبت هزینه',`
  <div class="f"><label class="l">چه چیزی خریدی / خرج شد؟</label><input name="note" value="${esc(r.note)}"></div>
  <div class="f"><label class="l">مبلغ</label>${amt('a',r.a)}</div>
  <div class="f"><label class="l">از کجا پرداخت شد؟</label><select name="acc">${accOpts(r.acc||S.set.who,true)}</select></div>
  <div class="f"><label class="l">برای کدام سفارش؟</label><select name="oid">${ordOpts(oid,'— هزینه عمومی کارگاه —')}</select></div>
  <div class="f"><label class="l">این خرج از چه نوعی بود؟${dl.length?' (یا بابت کدام بدهی؟)':''}</label>${cf}</div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    const raw=fd.get('cat')||'';let did='',cat;
    if(raw.startsWith('__debt:')){did=raw.slice(7);const dx=S.pay.find(q=>q.id===did);if(!dx)return 'بدهی پیدا نشد';cat=bcatExp(dx.cat);}else cat=readCat(fd);
    const id=r.id||uid(),acc=fd.get('acc'),d=readJ(fd,'d')||today();
    let note=(fd.get('note')||'').trim();if(did&&!note)note=S.pay.find(q=>q.id===did).name;
    const tx={...r,id,t:'out',a,acc,oid:fd.get('oid')||'',cat,note,d,by:r.by||S.set.who};
    if(did)tx.did=did;else delete tx.did;
    put('tx',tx);
    const oldD=od?od.id:'';
    if(oldD&&oldD!==did){const o2=S.pay.find(q=>q.id===oldD);if(o2){o2.pays=(o2.pays||[]).filter(p=>p.txid!==id);put('pay',o2);}}
    if(did){const dx=S.pay.find(q=>q.id===did);dx.pays=dx.pays||[];const ex=dx.pays.find(p=>p.txid===id);if(ex)Object.assign(ex,{a,acc,d});else dx.pays.push({id:uid(),a,acc,d,txid:id});put('pay',dx);}
    logit((rec?'ویرایش':'ثبت')+' هزینه '+fmt(a)+' '+note+(did?' (بابت بدهی)':''));
    lastPut={col:'tx',id};
  },rec?{del:()=>{r.del=true;put('tx',r);logit('حذف هزینه '+fmt(r.a));}}:null);
}

function fSettle(rec){
  const c=calc(),r=rec||{};
  sheet(rec?'ویرایش تسویه':'ثبت پرداخت تسویه بین شریک‌ها',`
  <div class="f"><label class="l">چه کسی پرداخت کرد؟</label><select name="from">${optsHtml([['a',nm('a')],['b',nm('b')]],r.from||(c.x>=0?'a':'b'))}</select></div>
  <div class="f"><label class="l">مبلغ (به شریک دیگر داد)</label>${amt('a',r.a||Math.round(Math.abs(c.x)))}</div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>
  <div class="f"><label class="l">توضیح</label><input name="note" value="${esc(r.note)}"></div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    put('tx',{...r,id:r.id||uid(),t:'settle',a,from:fd.get('from'),d:readJ(fd,'d')||today(),note:(fd.get('note')||'').trim(),by:r.by||S.set.who});
    logit('ثبت تسویه '+fmt(a)+' از طرف '+nm(fd.get('from')));
  },rec?{del:()=>{r.del=true;put('tx',r);logit('حذف تسویه '+fmt(r.a));}}:null);
}
function fDraw(rec){
  const r=rec||{};
  sheet(rec?'ویرایش برداشت':'برداشت شخصی از پول کارگاه',`
  <div class="f"><label class="l">چه کسی برداشت کرد؟</label><select name="who">${optsHtml([['a',nm('a')],['b',nm('b')]],r.who||S.set.who)}</select></div>
  <div class="f"><label class="l">از کدام حساب؟</label><select name="acc">${accOpts(r.acc||S.set.who)}</select></div>
  <div class="f"><label class="l">مبلغ</label>${amt('a',r.a)}</div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>
  <div class="f"><label class="l">توضیح</label><input name="note" value="${esc(r.note)}"></div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    put('tx',{...r,id:r.id||uid(),t:'draw',a,who:fd.get('who'),acc:fd.get('acc'),d:readJ(fd,'d')||today(),note:(fd.get('note')||'').trim(),by:r.by||S.set.who});
    logit('ثبت برداشت '+fmt(a)+' توسط '+nm(fd.get('who')));
  },rec?{del:()=>{r.del=true;put('tx',r);logit('حذف برداشت '+fmt(r.a));}}:null);
}
function editTx(id){const t=S.tx.find(x=>x.id===id);if(!t)return;({in:fIn,out:fOut,settle:fSettle,draw:fDraw})[t.t](null,t);}
function fSetup(){
  const s=S.set;
  sheet('تنظیمات شروع',`<p class="mut" style="margin-bottom:10px">نام دو شریک را بنویسید و مشخص کنید این گوشی مال کدام نفر است. اگر فایل پشتیبان شریکتان را وارد کرده‌اید، فقط گزینهٔ «این گوشی» را درست کنید.</p>
  <div class="f"><label class="l">نام نفر اول</label><input name="na" value="${esc(s.nameA)}"></div>
  <div class="f"><label class="l">نام نفر دوم</label><input name="nb" value="${esc(s.nameB)}"></div>
  <div class="chips"><label><input type="radio" name="who" value="a" ${s.who==='a'?'checked':''}><span>این گوشی مال نفر اول است</span></label><label><input type="radio" name="who" value="b" ${s.who==='b'?'checked':''}><span>این گوشی مال نفر دوم است</span></label></div>`,fd=>{
    const na=(fd.get('na')||'').trim(),nb=(fd.get('nb')||'').trim();if(!na||!nb)return 'هر دو نام را بنویسید';
    Object.assign(S.set,{nameA:na,nameB:nb,who:fd.get('who'),done:true});save();
  },{ok:'شروع'});
  $('.x').style.display='none';
}

/* ---------- views ---------- */
function dueLabel(due){const n=dayDiff(today(),due);return n<0?[fa(-n)+' روز از سررسید گذشته','d']:n===0?['سررسید امروز','d']:n<=3?[fa(n)+' روز دیگر','g']:[fa(n)+' روز دیگر',''];}
function settlePlate(c,btn){return `<div class="plate"><div class="big">${esc(settleText(c))}</div><small>${Math.abs(c.x)>=1000?'بر اساس همهٔ ثبت‌ها، سهم '+fa(S.set.share)+'٪ / '+fa(100-S.set.share)+'٪':'بدهی بین شما نیست'}</small>${btn?'<div class="row"><button class="btn gold" data-a="go" data-v="acct">جزئیات تسویه</button></div>':''}</div>`;}
function vHome(){
  const c=calc(),od=live(S.ord);
  const recv=od.reduce((s,o)=>s+Math.max(0,rest(o)),0);
  const dues=od.filter(o=>rest(o)>0&&o.due).sort((x,y)=>x.due<y.due?-1:1);
  const stale=!S.set.lastExport||Date.now()-S.set.lastExport>7*864e5;
  let h=S.set.solo?'':settlePlate(c,true);
  h+=window.xHomeCard?xHomeCard():'';
  const accs=S.set.solo?['a','s']:['a','b','s'];
  h+=`<div class="grid3" style="grid-template-columns:repeat(${accs.length},1fr)">${accs.map(k=>`<div class="pan tap" data-a="accd" data-id="${k}"><span class="mut">${esc(accLabel(k))}</span><b>${money(c.H[k])}</b></div>`).join('')}</div>`;
  h+=`<div class="pan edge ${recv>0?'g':'o'} tap" data-a="go" data-v="acct"><div class="kv"><span>طلب از مشتری‌ها</span><b>${money(recv)}</b></div></div>`;
  h+=bdebtCard();
  h+=tiles([['newIn','down','ok','ثبت دریافتی'],['newOut','up','d','ثبت هزینه'],['newOrd','plus','st','سفارش جدید']]);
  if(!od.length&&!live(S.tx).length)h+=`<div class="pan guide"><b>شروع سریع</b><ol><li>«سفارش جدید» را بزنید و اسم مشتری و مبلغ کار را بنویسید.</li><li>هر پولی که گرفتید را با «ثبت دریافتی» وارد کنید.</li><li>هر خریدی که برای کار کردید را با «ثبت هزینه» وارد کنید.</li></ol></div>`;
  h+=`<h2>سررسید طلب‌ها</h2><div class="hint">مشتری‌هایی که قرار است پول بدهند</div>`;
  h+=dues.length?dues.slice(0,10).map(o=>{const[l,k]=dueLabel(o.due);return `<div class="pan edge ${k} tap" data-a="ord" data-id="${o.id}"><div class="li">${av(custOf(o).name)}<div class="t"><b>${esc(custOf(o).name)}</b><div class="mut">${esc(o.title)} · ${l}</div></div><div class="a deb">${money(rest(o))}</div></div></div>`;}).join(''):'<div class="empty">سررسیدی ثبت نشده است</div>';
  h+=bdueList();
  if(stale)h+=`<div class="pan edge g"><b>پشتیبان‌گیری</b><div class="mut">مدتی است پشتیبان نگرفته‌اید. برای هماهنگ شدن با شریک و امنیت اطلاعات، از تنظیمات «خروجی پشتیبان» بگیرید.</div><div class="row"><button class="btn sm" data-a="export">خروجی پشتیبان</button></div></div>`;
  return h;
}
function custTotals(cid){const os=live(S.ord).filter(o=>o.cid===cid);return{os,pr:os.reduce((s,o)=>s+orderPrice(o),0),pd:os.reduce((s,o)=>s+paid(o),0)};}
function custList(q){
  const list=live(S.cust).filter(c=>!q||c.name.includes(q)).map(c=>({c,t:custTotals(c.id)})).sort((x,y)=>(y.t.pr-y.t.pd)-(x.t.pr-x.t.pd));
  return list.length?list.map(({c,t})=>{const r=t.pr-t.pd;return `<div class="pan edge ${r>0?'d':'o'} tap" data-a="cust" data-id="${c.id}"><div class="li">${av(c.name)}<div class="t"><b>${esc(c.name)}</b><div class="mut">${fa(t.os.length)} سفارش</div></div><div class="a ${r>0?'deb':'okc'}">${r>0?'مانده '+money(r):r<0?'پیش‌دریافت '+money(-r):'تسویه'}</div></div></div>`;}).join(''):'<div class="empty">مشتری‌ای پیدا نشد</div>';
}
function vCust(){return `<div class="f"><input id="q" placeholder="جستجوی مشتری" value=""></div><div id="clist">${custList('')}</div><div class="row"><button class="btn pri" data-a="newCust">مشتری جدید</button><button class="btn" data-a="newOrd">سفارش جدید</button></div>`;}
function vCustD(){
  const c=S.cust.find(x=>x.id===route.id);if(!c||c.del)return '<div class="empty">پیدا نشد</div>';
  const t=custTotals(c.id),r=t.pr-t.pd;
  let h=`<div class="pan edge ${r>0?'d':'o'}"><div class="li"><b style="font-size:17px">${esc(c.name)}</b><button class="btn sm" data-a="editCust" data-id="${c.id}">ویرایش</button></div>${c.phone?`<div><a href="tel:${esc(c.phone)}" style="color:var(--st)">${esc(fa(c.phone))}</a></div>`:''}${c.note?`<div class="mut">${esc(c.note)}</div>`:''}
  <div class="kv"><span>جمع سفارش‌ها</span><b>${money(t.pr)}</b></div><div class="kv"><span>دریافت‌شده</span><b>${money(t.pd)}</b></div><div class="kv"><span>${r<0?'پیش‌دریافت':'مانده'}</span><b class="${r>0?'deb':'okc'}">${money(Math.abs(r))}</b></div></div>`;
  h+=`<h2>سفارش‌ها</h2>`+(t.os.length?t.os.sort((x,y)=>y.d<x.d?-1:1).map(o=>{const rr=rest(o);return `<div class="pan edge ${rr>0?'d':'o'} tap" data-a="ord" data-id="${o.id}"><div class="li"><div class="t"><b>${esc(o.title)}</b><div class="mut">${jstr(o.d)}</div></div><div class="a">${money(orderPrice(o))}<div class="mut ${rr>0?'deb':'okc'}">${rr>0?'مانده '+money(rr):rr<0?'پیش‌دریافت '+money(-rr):'تسویه'}</div></div></div></div>`;}).join(''):'<div class="empty">هنوز سفارشی ندارد</div>');
  h+=`<div class="row"><button class="btn pri" data-a="newOrd" data-cid="${c.id}">سفارش جدید برای ${esc(c.name)}</button></div>`;
  const ids=new Set(t.os.map(o=>o.id));
  const ev=[];t.os.forEach(o=>ev.push({d:o.d,o}));live(S.tx).filter(x=>ids.has(x.oid)).forEach(x=>ev.push({d:x.d,x}));
  ev.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0);
  h+=`<h2>تاریخچهٔ کارهای ${esc(c.name)}</h2><div class="hint">همهٔ سفارش‌ها، دریافتی‌ها و هزینه‌ها به ترتیب تاریخ. روی هر مورد بزنید تا جزئیاتش باز شود.</div>`;
  h+=ev.length?ev.map(e=>e.x?txRow(e.x):`<div class="pan edge tap" data-a="ord" data-id="${e.o.id}"><div class="li">${avi('doc','st')}<div class="t"><b>سفارش «${esc(e.o.title)}»</b><div class="mut">${jstr(e.o.d)} · ثبت سفارش</div></div><div class="a">${fmt(orderPrice(e.o))}</div></div></div>`).join(''):'<div class="empty">هنوز چیزی ثبت نشده</div>';
  h+=`<div class="row"><button class="btn" data-a="editCust" data-id="${c.id}">ویرایش مشتری</button><button class="btn dng" data-a="delCust" data-id="${c.id}">حذف مشتری</button></div>`;
  return h;
}
function txRow(t){
  const sign=t.t==='in'?'+':t.t==='out'?'−':'';
  const o=S.ord.find(x=>x.id===t.oid);
  const title=t.t==='in'?(t.kind==='deposit'?'بیعانه':'دریافتی')+(o?' · '+custOf(o).name:''):t.t==='out'?(t.note||t.cat||'هزینه'):t.t==='settle'?'تسویه: '+nm(t.from)+' به '+nm(t.from==='a'?'b':'a'):'برداشت '+nm(t.who);
  const sub=[jstr(t.d),t.t==='in'?accLabel(t.acc):t.t==='out'?accLabel(t.acc)+(o?' · '+ordLabel(o):''):t.t==='draw'?accLabel(t.acc):'',t.t==='out'&&t.note&&t.cat?t.cat:''].filter(Boolean).join(' · ');
  return `<div class="pan edge ${t.t==='in'?'o':t.t==='out'?'d':'g'} tap" data-a="txd" data-id="${t.id}"><div class="li">${avi(t.t==="in"?"down":t.t==="out"?"up":"swap",t.t==="in"?"ok":t.t==="out"?"d":"g")}<div class="t"><b>${esc(title)}</b><div class="mut">${esc(sub)}</div></div><div class="a ${t.t==='in'?'okc':t.t==='out'?'deb':''}">${sign}${fmt(t.a)}</div></div></div>`;
}
function vTx(){
  const f=route.f||'all';
  const list=live(S.tx).filter(t=>f==='all'||(f==='in'&&t.t==='in')||(f==='out'&&t.t==='out')||(f==='p'&&(t.t==='settle'||t.t==='draw'))).sort(byDate).slice(0,250);
  const chip=(k,l)=>`<a class="${f===k?'on':''}" data-a="filt" data-f="${k}">${l}</a>`;
  return `<div class="chips">${chip('all','همه')}${chip('in','دریافتی')}${chip('out','هزینه')}${chip('p','شریکی')}</div><div class="hint">برای ویرایش یا حذف، روی هر مورد بزنید</div>`+(list.length?list.map(txRow).join(''):'<div class="empty">تراکنشی ثبت نشده است. با دکمهٔ + شروع کنید.</div>');
}
function vOrd(){
  const o=S.ord.find(x=>x.id===route.id);if(!o||o.del)return '<div class="empty">پیدا نشد</div>';
  const cu=custOf(o),pr=orderPrice(o),pd=paid(o),cs=costs(o),rs=pr-pd;
  const txs=live(S.tx).filter(t=>t.oid===o.id).sort(byDate);
  let h=`<div class="pan edge ${rs>0?'d':'o'}"><div class="li"><div class="t"><b style="font-size:17px">${esc(o.title)}</b><div class="mut tap" data-a="cust" data-id="${cu.id}" style="color:var(--st)">${esc(cu.name)}</div></div><button class="btn sm" data-a="editOrd" data-id="${o.id}">ویرایش</button></div>
  <div class="kv"><span>تاریخ سفارش</span><b>${jstr(o.d)}</b></div>
  <div class="kv"><span>مبلغ کل</span><b>${money(pr)}</b></div>
  <div class="kv"><span>دریافت‌شده</span><b class="okc">${money(pd)}</b></div>
  <div class="kv"><span>${rs<0?'پیش‌دریافت (بیشتر از مبلغ سفارش)':'مانده'}</span><b class="${rs>0?'deb':'okc'}">${money(Math.abs(rs))}</b></div>
  ${o.due?`<div class="kv"><span>سررسید</span><b>${jstr(o.due)}${rs>0?' ('+dueLabel(o.due)[0]+')':''}</b></div>`:''}
  <div class="kv"><span>هزینهٔ خرید برای سفارش</span><b>${money(cs)}</b></div>
  <div class="kv"><span>سود این سفارش (قیمت منهای هزینه)</span><b class="${pr-cs>=0?'okc':'deb'}">${money(pr-cs)}</b></div></div>`;
  if(pr===0)h+=`<div class="pan edge g"><b>مبلغ کل سفارش هنوز وارد نشده</b><div class="mut">تا مبلغ توافق‌شده ثبت نشود، مانده و سود درست حساب نمی‌شود.</div><div class="row"><button class="btn sm gold" data-a="editOrd" data-id="${o.id}">ثبت مبلغ سفارش</button></div></div>`;
  h+=tiles([['newIn','down','ok','دریافتی'],['newOut','up','d','هزینه'],['inv','doc','st','فاکتور']],o.id);
  h+=`<h2>اقلام فاکتور</h2>`;
  h+=o.items&&o.items.length?o.items.map((it,i)=>`<div class="pan tap" data-a="editItem" data-id="${o.id}" data-i="${i}"><div class="li"><div class="t"><b>${esc(it.n)}</b><div class="mut">${fa(it.q)} × ${fmt(it.p)}</div></div><div class="a">${fmt(it.q*it.p)}</div></div></div>`).join(''):'<div class="mut" style="margin:0 2px 8px">اگر قلم‌ها را اضافه کنید، فاکتور ریزتر می‌شود و مبلغ کل خودکار جمع می‌شود.</div>';
  h+=`<div class="row" style="margin:0 0 6px"><button class="btn sm" data-a="addItem" data-id="${o.id}">افزودن قلم</button></div>`;
  h+=`<h2>دریافتی‌ها و هزینه‌ها</h2><div class="hint">برای ویرایش یا حذف، روی هر مورد بزنید</div>`+(txs.length?txs.map(txRow).join(''):'<div class="empty">هنوز چیزی ثبت نشده</div>');
  if(rs>0&&o.due)h+=`<div class="row"><button class="btn" data-a="ics" data-id="${o.id}">افزودن یادآوری به تقویم گوشی</button></div>`;
  h+=`<div class="row"><button class="btn" data-a="editOrd" data-id="${o.id}">ویرایش سفارش</button><button class="btn dng" data-a="delOrd" data-id="${o.id}">حذف سفارش</button></div>`;
  return h;
}
function vTxd(){
  const t=S.tx.find(x=>x.id===route.id);
  if(!t||t.del)return `<div class="empty">این مورد حذف شده یا پیدا نشد</div><div class="row"><button class="btn" data-a="back">بازگشت</button></div>`;
  const o=S.ord.find(x=>x.id===t.oid),cu=o&&custOf(o);
  const kind=t.t==='in'?(t.kind==='deposit'?'بیعانه':'دریافتی از مشتری'):t.t==='out'?'هزینه / خرید':t.t==='settle'?'تسویهٔ بین شریک‌ها':'برداشت شخصی';
  const sign=t.t==='in'?'+':t.t==='out'?'−':'';
  const col=t.t==='in'?'ok':t.t==='out'?'d':'g';
  let h=`<div class="pan"><div class="li" style="justify-content:flex-start">${avi(t.t==='in'?'down':t.t==='out'?'up':'swap',col)}<div class="t"><b style="font-size:17px">${kind}</b><div class="mut">${jstr(t.d)}</div></div></div><div style="font-size:26px;font-weight:800;margin:10px 0 4px" class="${t.t==='in'?'okc':t.t==='out'?'deb':''}">${sign}${fmt(t.a)} <span style="font-size:15px">تومان</span></div><div class="mut">${words(t.a)}</div></div>`;
  h+=`<div class="pan">`;
  h+=`<div class="kv"><span>تاریخ</span><b>${jstr(t.d)}</b></div>`;
  if(t.t==='in'||t.t==='out')h+=`<div class="kv"><span>${t.t==='in'?'به کدام حساب آمد':'از کجا پرداخت شد'}</span><b>${esc(accLabel(t.acc))}</b></div>`;
  if(t.t==='draw')h+=`<div class="kv"><span>برداشت‌کننده</span><b>${esc(nm(t.who))}</b></div><div class="kv"><span>از حساب</span><b>${esc(accLabel(t.acc))}</b></div>`;
  if(t.t==='settle')h+=`<div class="kv"><span>پرداخت‌کننده</span><b>${esc(nm(t.from))}</b></div><div class="kv"><span>گیرنده</span><b>${esc(nm(t.from==='a'?'b':'a'))}</b></div>`;
  if(t.t==='out'&&t.cat)h+=`<div class="kv"><span>دسته</span><b>${esc(t.cat)}</b></div>`;
  if(t.note)h+=`<div class="kv"><span>توضیح</span><b>${esc(t.note)}</b></div>`;
  {const dx=debtOfTx(t);if(dx)h+=`<div class="kv tap" data-a="bdebtd" data-id="${dx.id}"><span>بابت بدهی</span><b style="color:var(--st)">${esc(dx.name)}</b></div>`;}
  if(o)h+=`<div class="kv tap" data-a="ord" data-id="${o.id}"><span>سفارش</span><b style="color:var(--st)">${esc(o.title)}</b></div><div class="kv tap" data-a="cust" data-id="${cu.id}"><span>مشتری</span><b style="color:var(--st)">${esc(cu.name)}</b></div>`;
  if(t.by)h+=`<div class="kv"><span>ثبت‌کننده</span><b>${esc(nm(t.by))}</b></div>`;
  if(t.u)h+=`<div class="kv"><span>آخرین ویرایش</span><b>${new Date(t.u).toLocaleDateString('fa-IR')} ${new Date(t.u).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}</b></div>`;
  h+=`</div><div class="row"><button class="btn pri" data-a="editTxForm" data-id="${t.id}">ویرایش</button><button class="btn dng" data-a="delTx" data-id="${t.id}">حذف</button></div>`;
  return h;
}
function vAccd(){
  const k=route.id,c=calc();if(!['a','b','s'].includes(k)||(S.set.solo&&k==='b'))return '<div class="empty">پیدا نشد</div>';
  const partner=k==='a'||k==='b';
  const list=live(S.tx).filter(t=>(t.t==='in'||t.t==='out'||t.t==='draw')&&t.acc===k||(partner&&t.t==='settle')).sort(byDate);
  const pocket=partner?live(S.tx).filter(t=>t.t==='out'&&t.acc==='p'+k).sort(byDate):[];
  let h=`<div class="plate"><div class="big">موجودی: ${money(c.H[k])}</div><small>${esc(accLabel(k))} — طبق همهٔ ثبت‌ها</small></div>`;
  h+=`<div class="pan"><div class="kv"><span>جمع دریافتی‌ها</span><b class="okc">${money(c.inc[k])}</b></div><div class="kv"><span>جمع هزینه‌ها از این حساب</span><b class="deb">${money(c.out[k])}</b></div><div class="kv"><span>برداشت‌های شخصی</span><b>${money(c.dr[k])}</b></div>${partner?`<div class="kv"><span>دریافت/پرداخت تسویه</span><b>${money(c.stn[k])}</b></div><div class="kv"><span>هزینه از جیب شخصی (طلب از کارگاه)</span><b>${money(c.pk[k])}</b></div>`:''}</div>`;
  h+=`<h2>گردش این حساب</h2><div class="hint">روی هر مورد بزنید تا جزئیات و ویرایشش باز شود.</div>`+(list.length?list.map(txRow).join(''):'<div class="empty">هنوز چیزی ثبت نشده</div>');
  if(pocket.length)h+=`<h2>هزینه‌هایی که از جیب شخصی داده شده</h2>`+pocket.map(txRow).join('');
  return h;
}
function vInv(){
  const o=S.ord.find(x=>x.id===route.id);if(!o)return '';
  const cu=custOf(o),pr=orderPrice(o),pd=paid(o);
  const items=o.items&&o.items.length?o.items:[{n:o.title,q:1,p:pr}];
  return `<div class="pan inv"><h3>${esc(S.set.shop||cur().name)}</h3>${S.set.phone?`<div>${esc(fa(S.set.phone))}</div>`:''}
  <div class="kv"><span>فاکتور شمارهٔ ${fa(o.no||1)}</span><span>${jstr(today())}</span></div>
  <div class="kv"><span>مشتری:</span><b>${esc(cu.name)}</b></div>
  <table><tr><th>شرح</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr>${items.map(i=>`<tr><td>${esc(i.n)}</td><td>${fa(i.q)}</td><td>${fmt(i.p)}</td><td>${fmt(i.q*i.p)}</td></tr>`).join('')}</table>
  <div class="kv"><span>جمع کل</span><b>${money(pr)}</b></div>
  <div class="kv"><span>پرداخت‌شده (بیعانه و دریافتی‌ها)</span><b>${money(pd)}</b></div>
  <div class="kv"><span>مانده</span><b>${money(pr-pd)}</b></div>
  ${o.due&&pr-pd>0?`<div class="kv"><span>سررسید تسویه</span><b>${jstr(o.due)}</b></div>`:''}</div>
  <div class="row noprint"><button class="btn pri" data-a="print">چاپ / ذخیره PDF</button><button class="btn" data-a="shareInv" data-id="${o.id}">ارسال متن فاکتور</button></div>`;
}
function vAcct(){
  const c=calc();
  if(S.set.solo)return `<div class="grid3" style="grid-template-columns:repeat(2,1fr)"><div class="pan tap" data-a="accd" data-id="a"><span class="mut">${accLabel('a')}</span><b>${money(c.H.a)}</b></div><div class="pan tap" data-a="accd" data-id="s"><span class="mut">${accLabel('s')}</span><b>${money(c.H.s)}</b></div></div><div class="pan"><div class="kv"><span>جمع دریافتی‌ها</span><b class="okc">${money(c.inc.a+c.inc.s)}</b></div><div class="kv"><span>جمع هزینه‌ها</span><b class="deb">${money(c.out.a+c.out.s)}</b></div></div>`+vReports();
  let h=settlePlate(c,false)+`<div class="row" style="margin:0 0 6px"><button class="btn pri" data-a="newSettle">ثبت پرداخت تسویه</button><button class="btn" data-a="newDraw">برداشت شخصی</button></div>`;
  ['a','b'].forEach(k=>{h+=`<h2>${esc(nm(k))}</h2><div class="pan tap" data-a="accd" data-id="${k}"><div class="kv"><span>دریافتی به حساب خودش</span><b>${money(c.inc[k])}</b></div><div class="kv"><span>هزینه از حساب خودش</span><b>${money(c.out[k])}</b></div><div class="kv"><span>هزینه از جیب شخصی (طلب از کارگاه)</span><b>${money(c.pk[k])}</b></div><div class="kv"><span>برداشت شخصی</span><b>${money(c.dw[k])}</b></div><div class="kv"><span>دریافت/پرداخت تسویه</span><b>${money(c.stn[k])}</b></div><div class="kv"><span>موجودی حساب (طبق ثبت‌ها)</span><b>${money(c.H[k])}</b></div></div>`;});
  h+=`<h2>حساب مشترک</h2><div class="pan tap" data-a="accd" data-id="s"><div class="kv"><span>دریافتی</span><b>${money(c.inc.s)}</b></div><div class="kv"><span>هزینه</span><b>${money(c.out.s)}</b></div><div class="kv"><span>موجودی</span><b>${money(c.H.s)}</b></div></div>`;
  return h+vReports();
}
function vReports(){
  let h='';
  const mm={};live(S.tx).forEach(t=>{if(t.t!=='in'&&t.t!=='out')return;const[y,m]=toJ(t.d);const k=y*100+m;(mm[k]=mm[k]||{i:0,o:0,y,m});mm[k][t.t==='in'?'i':'o']+=t.a;});
  const ms=Object.keys(mm).sort().reverse().slice(0,6);
  h+=`<h2>گزارش ماهانه</h2>`+(ms.length?ms.map(k=>{const x=mm[k];return `<div class="pan"><b>${MONTHS[x.m-1]} ${fa(x.y)}</b><div class="kv"><span>دریافتی</span><b class="okc">${money(x.i)}</b></div><div class="kv"><span>هزینه</span><b class="deb">${money(x.o)}</b></div><div class="kv"><span>خالص</span><b>${money(x.i-x.o)}</b></div></div>`;}).join(''):'<div class="empty">هنوز داده‌ای نیست</div>');
  const cat={};live(S.tx).filter(t=>t.t==='out').forEach(t=>cat[t.cat||'سایر']=(cat[t.cat||'سایر']||0)+t.a);
  const cs=Object.entries(cat).sort((x,y)=>y[1]-x[1]);
  if(cs.length)h+=`<h2>هزینه‌ها به تفکیک دسته</h2><div class="pan">${cs.map(([k,v])=>`<div class="kv"><span>${esc(k)}</span><b>${money(v)}</b></div>`).join('')}</div>`;
  const deb=live(S.cust).map(c=>({c,r:custTotals(c.id).pr-custTotals(c.id).pd})).filter(x=>x.r>0).sort((x,y)=>y.r-x.r);
  h+=`<h2>بدهکاران</h2>`+(deb.length?`<div class="pan">${deb.map(x=>`<div class="kv tap" data-a="cust" data-id="${x.c.id}"><span>${esc(x.c.name)}</span><b class="deb">${money(x.r)}</b></div>`).join('')}</div>`:'<div class="empty">بدهکاری وجود ندارد</div>');
  return h;
}
function vSet(){
  const s0=S.set,t=btype(),shopish=t==='shop'||t==='solo';
  const logs=S.log.slice().sort((x,y)=>y.ts-x.ts).slice(0,60);
  let h=`<div class="pan"><div class="li" style="justify-content:flex-start"><img src="icon-192.png" alt="" width="54" height="54" style="border-radius:14px"><div><b>حساب کارگاه</b><div class="mut">ساخته‌شده توسط ${CREDIT}</div><div class="mut">نسخهٔ ۱۱</div></div></div></div>`;
  if(t==='shop')h+=`<div class="pan"><div class="kv"><span>شریک اول</span><b>${esc(s0.nameA)}</b></div><div class="kv"><span>شریک دوم</span><b>${esc(s0.nameB)}</b></div><div class="kv"><span>این گوشی</span><b>${esc(nm(s0.who))}</b></div><div class="row"><button class="btn sm" data-a="setup">تغییر نام‌ها / این گوشی</button></div></div>`;
  if(shopish)h+=`<div class="pan"><form id="sf"><div class="f"><label class="l">نام روی فاکتور</label><input name="shop" value="${esc(s0.shop)}" placeholder="${esc(cur().name)}"></div><div class="f"><label class="l">تلفن (روی فاکتور)</label><input name="phone" inputmode="tel" value="${esc(s0.phone)}"></div>${t==='shop'?`<div class="f"><label class="l">سهم ${esc(s0.nameA)} از شراکت (درصد)</label><input name="share" inputmode="numeric" value="${fa(s0.share)}"></div>`:''}<button class="btn pri" style="width:100%">ذخیرهٔ تنظیمات</button></form></div>`;
  h+=`<div class="pan"><div class="li"><span>دفتر فعلی: <b>${esc(cur().name)}</b></span><button class="btn sm" data-a="go" data-v="books">دفترها</button></div><div class="row"><button class="btn sm" data-a="bookMenu" data-id="${cur().id}">ویرایش دفتر</button></div></div>`;
  h+=`<h2>پشتیبان${t==='shop'||t==='trip'?' و هماهنگی دو گوشی':''}</h2><div class="pan"><div class="mut" style="margin-bottom:8px">«خروجی پشتیبان» فقط همین دفتر را ذخیره می‌کند. ${t==='shop'||t==='trip'?'برای هماهنگی، فایل را در بله/ایتا/تلگرام برای طرف مقابل بفرستید و او «ورود پشتیبان» بزند؛ اطلاعات بدون تکرار ادغام می‌شود.':'پشتیبان را جای امنی نگه دارید تا با عوض شدن گوشی اطلاعات از بین نرود.'}</div><div class="row"><button class="btn pri" data-a="export">خروجی پشتیبان</button><button class="btn" data-a="import">ورود پشتیبان</button></div>
  <div class="mut" style="margin-top:8px">آخرین خروجی: ${s0.lastExport?new Date(s0.lastExport).toLocaleDateString('fa-IR'):'هرگز'}</div></div>`;
  if(shopish)h+=`<h2>یادآوری سررسید</h2><div class="pan"><div class="mut" style="margin-bottom:8px">هر بار برنامه را باز کنید، سررسیدهای امروز و گذشته اعلام می‌شود. برای اطمینان بیشتر در صفحهٔ هر سفارش «افزودن یادآوری به تقویم گوشی» را بزنید.</div><div class="row"><button class="btn" data-a="notif">فعال‌سازی اعلان</button></div></div>`;
  h+=window.xSettings?xSettings():'';
  h+=`<h2>سابقهٔ تغییرات</h2><div class="pan">${logs.length?logs.map(l=>`<div class="kv"><span>${esc(l.text)}<div class="mut">${esc(nm(l.by))} · ${new Date(l.ts).toLocaleDateString('fa-IR')} ${new Date(l.ts).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}</div></span></div>`).join(''):'<div class="empty">خالی</div>'}</div>`;
  return h;
}

/* ---------- render ---------- */
