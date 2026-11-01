/* kargah v11 part2 */
'use strict';
const TITLES={home:'حساب کارگاه',cust:'مشتری‌ها',custd:'مشتری',ord:'سفارش',tx:'تراکنش‌ها',acct:'تسویه و گزارش',set:'تنظیمات',inv:'فاکتور',books:'دفترها',texp:'خرج‌ها',tppl:'نفرات',tset:'تسویه',phome:'خانه',ptx:'تراکنش‌ها',pdebt:'وام و بدهی',pdebtd:'جزئیات',txd:'جزئیات تراکنش',accd:'جزئیات حساب',bdebt:'بدهی‌ها (پرداختنی)',bdebtd:'جزئیات بدهی'};
const VIEWS={home:vHome,cust:vCust,custd:vCustD,ord:vOrd,tx:vTx,acct:vAcct,set:vSet,inv:vInv,books:vBooks,texp:vTExp,tppl:vTPpl,tset:vTSet,phome:vPHome,ptx:vPTx,pdebt:vPDebt,pdebtd:vPDebtD,txd:vTxd,accd:vAccd,bdebt:vBDebt,bdebtd:vBDebtD};
const SUBS=['custd','ord','inv','set','books','pdebtd','txd','accd','bdebt','bdebtd'];
const SUB_OK={custd:['shop','solo'],ord:['shop','solo'],inv:['shop','solo'],pdebtd:['personal'],txd:['shop','solo'],accd:['shop','solo'],bdebt:['shop','solo'],bdebtd:['shop','solo']};
const homeOf=()=>TYPES[btype()].home;
const isBizT=()=>btype()==='shop'||btype()==='solo';
function tabsOf(){const t=btype();return({shop:[['home','خانه','home'],['cust','مشتری‌ها','users'],['tx','تراکنش‌ها','list'],['cal','تقویم','cal'],['more','بیشتر','layers']],solo:[['home','خانه','home'],['cust','مشتری‌ها','users'],['tx','تراکنش‌ها','list'],['cal','تقویم','cal'],['more','بیشتر','layers']],trip:[['texp','خرج‌ها','receipt'],['tppl','نفرات','users'],['tset','تسویه','scale']],personal:[['phome','خانه','wallet'],['ptx','تراکنش‌ها','list'],['pdebt','وام و بدهی','bank']]})[t];}
function crumbs(){
  const v=route.v,home=homeOf(),T=x=>TITLES[x];
  const t=[{l:cur().name,v:home,i:'home'}];
  if(window.XCRUMB&&XCRUMB(v,t)){}
  else if(v===home){}
  else if(v==='custd'){const c=S.cust.find(x=>x.id===route.id);t.push({l:T('cust'),v:'cust'},{l:c?c.name:''});}
  else if(v==='ord'||v==='inv'){const o=S.ord.find(x=>x.id===route.id);if(o){t.push({l:T('cust'),v:'cust'},{l:custOf(o).name,v:'custd',id:o.cid});if(v==='ord')t.push({l:o.title});else t.push({l:o.title,v:'ord',id:o.id},{l:'فاکتور'});}}
  else if(v==='bdebt'){t.push({l:T('bdebt')});}
  else if(v==='bdebtd'){const x=(S.pay||[]).find(q=>q.id===route.id);t.push({l:T('bdebt'),v:'bdebt'},{l:x?x.name:''});}
  else if(v==='txd'){t.push({l:T('tx'),v:'tx'},{l:'جزئیات'});}
  else if(v==='accd'){t.push({l:route.id?accLabel(route.id):''});}
  else if(v==='pdebtd'){const x=S.debts.find(q=>q.id===route.id);t.push({l:T('pdebt'),v:'pdebt'},{l:x?x.name:''});}
  else t.push({l:T(v)});
  return t;
}
function render(){
  if(!S||!cur())return;
  const tabs=tabsOf();let v=route.v;
  const sub=SUBS.includes(v);
  if((sub&&SUB_OK[v]&&!SUB_OK[v].includes(btype()))||(!sub&&!tabs.some(x=>x[0]===v)&&!(window.XV&&XV.has(v)&&isBizT()))||!VIEWS[v]){route={v:homeOf()};v=route.v;}
  const isSub=SUBS.includes(v),isHome=v===homeOf();
  const tab=(window.XTAB&&XTAB[v])||(['custd','ord','inv'].includes(v)?'cust':v==='bdebt'||v==='bdebtd'?'home':v==='txd'?'tx':v==='accd'?'acct':v==='pdebtd'?'pdebt':v);
  const title=isHome?cur().name:(v==='custd'||v==='ord'||v==='inv'||v==='pdebtd')?TITLES[v]:TITLES[v];
  const cr=crumbs();
  const crh=cr.map((c,i)=>{const last=i===cr.length-1;const inner=(c.i?ic(c.i):'')+esc(c.l);return (i?'<span class="sep">‹</span>':'')+(last?`<span class="cur">${esc(c.l)}</span>`:`<a data-a="crumb" data-v="${c.v}" ${c.id?`data-id="${c.id}"`:''}>${inner}</a>`);}).join('');
  $('#app').innerHTML=`<header class="noprint"><div class="hwrap"><div class="hrow">${isSub?`<button class="ib" data-a="back" aria-label="بازگشت">${ic('back')}</button>`:''}${isHome?'':`<button class="ib" data-a="home" aria-label="صفحهٔ اصلی">${ic('home')}</button>`}<h1>${esc(title)}</h1>${window.xBell&&isBizT()?xBell():''}<button class="ib" data-a="go" data-v="set" aria-label="تنظیمات">${ic('gear')}</button></div></div><div class="crumbs"><div class="in">${crh}<a class="sw" data-a="go" data-v="books">${ic('layers')}تغییر دفتر</a></div></div></header><main>${VIEWS[v]()}<div class="credit">ساخته‌شده توسط <b>${CREDIT}</b></div></main>${isSub?'':`<button class="fab noprint" data-a="plus" aria-label="افزودن">${ic('plus')}</button>`}<nav class="noprint" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k,l,i])=>`<a class="${tab===k?'on':''}" data-a="go" data-v="${k}">${ic(i)}<span>${l}</span></a>`).join('')}</nav>`;
  const q=$('#q');if(q)q.oninput=()=>{$('#clist').innerHTML=custList(q.value.trim());};
  const sf=$('#sf');if(sf)sf.onsubmit=e=>{e.preventDefault();const fd=new FormData(sf);S.set.shop=(fd.get('shop')||'').trim();S.set.phone=(fd.get('phone')||'').trim();if(fd.get('share')!==null){const p=parseInt(en(fd.get('share')||'50').replace(/\D/g,''),10);S.set.share=p>0&&p<100?p:50;}save();toast('ذخیره شد');render();};
}

/* ---------- actions ---------- */
function plusMenu(){
  const t=btype();
  if(t==='trip')return fExp();
  const items=t==='personal'?[['newPIn','درآمد'],['newPOut','خرج'],['newDebt','وام / بدهی / طلب جدید']]:[['newIn','دریافتی از مشتری'],['newOut','هزینه / خرید'],['newOrd','سفارش جدید'],['newCust','مشتری جدید']].concat([['newBDebt','بدهی جدید (قبض، اجاره، خرید نسیه)']]).concat(window.XPLUS?XPLUS():[]).concat(S.set.solo?[]:[['newDraw','برداشت شخصی']]);
  sheet('چه چیزی ثبت کنم؟',`<div class="row" style="flex-direction:column">${items.map(([a,l],i)=>`<button type="button" class="btn ${i<2?'pri':''}" data-a="${a}">${l}</button>`).join('')}</div>`,()=>{});
  [...$('#f').querySelectorAll('button[type=submit]')].forEach(b=>b.remove());
}
function icsFile(o){
  const c=custOf(o),d=o.due.replace(/-/g,'');
  const txt=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//kargah//FA','BEGIN:VEVENT','UID:'+o.id+'@kargah','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART;VALUE=DATE:'+d,'SUMMARY:'+'وصول طلب از '+c.name+' - '+money(rest(o)),'DESCRIPTION:'+(o.title||''),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:سررسید وصول','TRIGGER;RELATED=START:PT9H','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  dl(new Blob([txt],{type:'text/calendar'}),'reminder-'+d+'.ics');
}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);}
async function doExport(){
  const b=cur(),t=b.type,data={app:'kargah',v:2,bid:b.id,type:t,name:b.name,at:Date.now(),set:(t==='shop'||t==='solo')?{nameA:S.set.nameA,nameB:S.set.nameB,share:S.set.share,shop:S.set.shop,phone:S.set.phone}:{}};
  TYPES[t].cols.forEach(c=>data[c]=S[c]);data.log=S.log;if(t==='trip')data.closed=!!S.closed;
  const json=JSON.stringify(data),name='kargah-'+t+'-'+today()+'.json';
  S.set.lastExport=Date.now();save();
  try{const file=new File([json],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'پشتیبان '+b.name});render();return;}}catch(e){if(e&&e.name==='AbortError')return;}
  dl(new Blob([json],{type:'application/json'}),name);toast('فایل پشتیبان ذخیره شد');render();
}
function mergeCol(col,inc){S[col]=S[col]||[];const m=new Map(S[col].map(x=>[x.id,x]));let n=0;(inc||[]).forEach(x=>{const o=m.get(x.id);if(!o){m.set(x.id,x);n++;}else if(col!=='log'&&(x.u||0)>(o.u||0)){m.set(x.id,x);n++;}});S[col]=[...m.values()];return n;}
const isEmpty=b=>TYPES[b.type].cols.every(c=>!(b.d[c]&&b.d[c].length));
const norm=x=>String(x||'').replace(/\s+/g,' ').trim();
const swapK=k=>k==='a'?'b':k==='b'?'a':k==='pa'?'pb':k==='pb'?'pa':k;
function remapFile(f,type){
  const info={swapped:false,dup:0,renum:0};
  if(type==='shop'||type==='solo'){
    const sw=type==='shop'&&f.set&&norm(f.set.nameA)===norm(S.set.nameB)&&norm(f.set.nameB)===norm(S.set.nameA)&&norm(f.set.nameA)!==norm(f.set.nameB);
    if(sw){info.swapped=true;(f.tx||[]).forEach(t=>{['acc','who','from','by'].forEach(k=>{if(t[k])t[k]=swapK(t[k]);});});(f.pay||[]).forEach(x=>(x.pays||[]).forEach(p=>{if(p.acc)p.acc=swapK(p.acc);}));(f.log||[]).forEach(l=>{if(l.by)l.by=swapK(l.by);});}
    const byName=new Map();live(S.cust).forEach(c=>byName.set(norm(c.name),c.id));
    const have=new Set(S.cust.map(c=>c.id)),map={};
    f.cust=(f.cust||[]).filter(c=>{if(have.has(c.id))return true;const ex=byName.get(norm(c.name));if(ex&&!c.del){map[c.id]=ex;info.dup++;const lc=S.cust.find(x=>x.id===ex);if(lc&&!lc.phone&&c.phone){lc.phone=c.phone;lc.u=Date.now();}return false;}return true;});
    (f.ord||[]).forEach(o=>{if(map[o.cid])o.cid=map[o.cid];});
    const nos=new Map();S.ord.forEach(o=>nos.set(o.no,o.id));const mine=new Set(S.ord.map(o=>o.id));
    let mx=Math.max(0,...S.ord.map(o=>o.no||0),...(f.ord||[]).map(o=>o.no||0));
    (f.ord||[]).forEach(o=>{if(!mine.has(o.id)&&o.no&&nos.has(o.no)){o.no=++mx;info.renum++;}});
  }
  if(type==='trip'){
    const byName=new Map();live(S.people).forEach(p=>byName.set(norm(p.name),p.id));
    const have=new Set(S.people.map(p=>p.id)),map={};
    f.people=(f.people||[]).filter(p=>{if(have.has(p.id))return true;const ex=byName.get(norm(p.name));if(ex&&!p.del){map[p.id]=ex;info.dup++;return false;}return true;});
    (f.exp||[]).forEach(e=>{if(map[e.payer])e.payer=map[e.payer];if(map[e.from])e.from=map[e.from];if(map[e.to])e.to=map[e.to];if(e.sh)e.sh=e.sh.map(x=>map[x]||x);});
  }
  return info;
}
let pendImp=null;
function doImport(text){
  let d;try{d=JSON.parse(text);}catch(e){return toast('فایل معتبر نیست');}
  if(!d||d.app!=='kargah')return toast('این فایل پشتیبان حساب کارگاه نیست');
  const type=TYPES[d.type]?d.type:'shop',c=cur();
  const same=d.bid&&R.books.find(x=>x.id===d.bid&&x.type===type);
  const target=same||(c&&c.type===type?c:null);
  pendImp={d,type,tid:target?target.id:null};
  const cnt=TYPES[type].cols.reduce((a,col)=>a+(d[col]||[]).filter(x=>!x.del).length,0);
  const opt=(act,cls,t1,t2)=>`<button type="button" class="btn ${cls}" data-a="${act}" style="flex-direction:column;gap:0;padding:10px 14px"><span>${t1}</span><small style="font-weight:500;opacity:.85;white-space:normal;line-height:1.5">${t2}</small></button>`;
  const el=$('#sheet');
  el.innerHTML=`<div class="sh"><div class="shh"><b>ورود پشتیبان</b><button type="button" class="x" data-a="close">بستن</button></div>
  <p class="mut" style="margin-bottom:12px">فایل: «${esc(d.name||TYPES[type].label)}» · ${TYPES[type].label} · ${fa(cnt)} مورد</p>
  <div class="row" style="flex-direction:column;margin-top:0">
  ${target?opt('impMerge','pri','ادغام با دفتر «'+esc(target.name)+'»','اطلاعات فایل کنار اطلاعات فعلی می‌آید و همه با هم حساب می‌شود. چیزی پاک نمی‌شود.')+opt('impReplace','dng','جایگزینی کامل دفتر «'+esc(target.name)+'»','اطلاعات فعلی این دفتر پاک می‌شود و فقط اطلاعات فایل می‌ماند.'):''}
  ${opt('impNew','','ساخت دفتر جدید از این فایل','دفترهای فعلی دست‌نخورده می‌مانند.')}</div></div>`;
  el.classList.add('on');
}
function importRun(mode){
  const P=pendImp;if(!P)return;pendImp=null;const{d,type}=P;
  let t=P.tid?bookById(P.tid):null;
  if(mode==='new'||!t){t={id:(d.bid&&!bookById(d.bid))?d.bid:uid(),type,name:d.name||TYPES[type].label,d:freshD(type)};R.books.push(t);mode='replace';}
  else if(mode==='merge'&&isEmpty(t))mode='replace';
  useBook(t.id);
  let msg='',after=null;const f=JSON.parse(JSON.stringify(d));
  if(mode==='replace'){
    t.d=freshD(type);S=t.d;
    if(d.bid&&t.id!==d.bid&&!R.books.some(x=>x.id===d.bid)){t.id=d.bid;R.cur=t.id;}
    TYPES[type].cols.forEach(c=>S[c]=f[c]||[]);S.log=f.log||[];
    if(type==='trip')S.closed=!!f.closed;
    if((type==='shop'||type==='solo')&&f.set){Object.assign(S.set,{share:f.set.share||S.set.share,phone:f.set.phone||'',shop:f.set.shop||''});if(type==='shop'){S.set.nameA=f.set.nameA||S.set.nameA;S.set.nameB=f.set.nameB||S.set.nameB;S.set.done=false;after=fSetup;}}
    msg='اطلاعات از فایل بارگذاری شد';
  }else{
    const info=remapFile(f,type);let n=0;
    TYPES[type].cols.forEach(c=>n+=mergeCol(c,f[c]));mergeCol('log',f.log);
    if(type==='trip'&&f.closed)S.closed=true;
    msg=(n?fa(n)+' مورد جدید یا به‌روز اضافه شد':'چیز جدیدی نبود')+(info.dup?' · '+fa(info.dup)+' مورد تکراری با نام یکسان یکی شد':'')+(info.swapped?' · جای دو شریک با نام‌ها هماهنگ شد':'');
  }
  save();route={v:homeOf()};history.pushState({r:route},'');render();toast(msg);if(after)setTimeout(after,300);
}
function invText(o){
  const cu=custOf(o),pr=orderPrice(o),pd=paid(o);const items=o.items&&o.items.length?o.items:[{n:o.title,q:1,p:pr}];
  return [(S.set.shop||cur().name)+(S.set.phone?' - '+fa(S.set.phone):''),'فاکتور شمارهٔ '+fa(o.no||1)+' - '+jstr(today()),'مشتری: '+cu.name,''].concat(items.map(i=>`• ${i.n}: ${fa(i.q)} × ${fmt(i.p)} = ${fmt(i.q*i.p)}`),['','جمع کل: '+money(pr),'پرداخت‌شده: '+money(pd),'مانده: '+money(pr-pd)],o.due&&pr-pd>0?['سررسید: '+jstr(o.due)]:[]).join('\n');
}
async function askNotif(){
  if(!('Notification' in window))return toast('این مرورگر اعلان پشتیبانی نمی‌کند');
  const p=await Notification.requestPermission();toast(p==='granted'?'اعلان فعال شد':'اجازه داده نشد');if(p==='granted')notifyDue(true);
}
async function notifyDue(force){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const t=today();if(!force&&localStorage.getItem('kargah.nt')===t)return;
  if(!S||!S.ord)return;
  const items=live(S.ord).filter(o=>o.due&&o.due<=t&&rest(o)>0);if(!items.length)return;
  localStorage.setItem('kargah.nt',t);
  const body=items.slice(0,4).map(o=>custOf(o).name+': '+money(rest(o))).join('\n');
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
    if(reg)reg.showNotification('سررسید وصول طلب',{body,icon:'icon-192.png',dir:'rtl',lang:'fa'});else new Notification('سررسید وصول طلب',{body});}catch(e){}
}
const A={
  close:()=>{closeSheet();},
  fdel:()=>{const d=curDel,m=curDelMsg;if(!d)return;ask(m,()=>{const r=d();if(r!==false)render();});},
  askYes:()=>{const f=askCb;askCb=null;closeSheet();if(f)f();},toastAct:()=>{const f=toastFn;toastFn=null;$('#toast').style.display='none';if(f)f();},
  go:d=>go(d.v),back:()=>history.back(),
  plus:plusMenu,
  newIn:d=>{closeSheet();fIn(d.id);},newOut:d=>{closeSheet();fOut(d.id);},
  newOrd:d=>{closeSheet();fOrder(null,d.cid);},newCust:()=>{closeSheet();fCust();},
  newSettle:()=>fSettle(),newDraw:()=>{closeSheet();fDraw();},
  ord:d=>go('ord',{id:d.id}),cust:d=>go('custd',{id:d.id}),
  editOrd:d=>fOrder(S.ord.find(x=>x.id===d.id)),editCust:d=>fCust(S.cust.find(x=>x.id===d.id)),
  addItem:d=>fItem(d.id,-1),editItem:d=>fItem(d.id,+d.i),
  edTx:d=>editTx(d.id),filt:d=>{route.f=d.f;render();},
  inv:d=>go('inv',{id:d.id}),print:()=>window.print(),
  shareInv:async d=>{const o=S.ord.find(x=>x.id===d.id),t=invText(o);try{if(navigator.share){await navigator.share({text:t});return;}}catch(e){if(e&&e.name==='AbortError')return;}try{await navigator.clipboard.writeText(t);toast('متن فاکتور کپی شد');}catch(e){sheet('متن فاکتور (نگه دارید و کپی کنید)',`<textarea rows="10" readonly>${esc(t)}</textarea>`,()=>{},{ok:'بستن'});}},
  ics:d=>icsFile(S.ord.find(x=>x.id===d.id)),
  export:doExport,import:()=>$('#file').click(),notif:askNotif,setup:fSetup
};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;
  const fn=A[el.dataset.a];if(fn)fn(el.dataset);
});
$('#file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>doImport(r.result);r.readAsText(f);e.target.value='';});

/* ======================= دفترها ======================= */
function askPin(b,cb,noClose){
  sheet('رمز دفتر «'+esc(b.name)+'»','<div class="f"><input name="pin" type="password" inputmode="numeric" autocomplete="off" placeholder="رمز"></div>',fd=>{
    if(en(fd.get('pin')||'').replace(/\D/g,'')!==b.pin)return 'رمز اشتباه است';
    cb();
  },{ok:'باز کردن'});
  if(noClose)$('.x').style.display='none';
}
function switchTo(id){
  const b=R.books.find(x=>x.id===id);if(!b)return;
  const go2=()=>{useBook(id);route={v:homeOf()};history.pushState({r:route},'');render();window.scrollTo(0,0);if(btype()==='shop'&&!S.set.done)setTimeout(fSetup,60);};
  if(b.pin&&b.id!==R.cur)askPin(b,go2);else go2();
}
function fBook(first){
  sheet('دفتر جدید',`${first?`<div class="brand"><img src="icon-192.png" alt=""><b>حساب کارگاه</b><span>ساخته‌شده توسط ${CREDIT}</span></div>`:''}<div class="chips" style="flex-direction:column;align-items:stretch">${Object.entries(TYPES).map(([k,t])=>`<label><input type="radio" name="type" value="${k}" ${k==='shop'?'checked':''}><span><b>${t.label}</b><small style="display:block;opacity:.8">${t.hint}</small></span></label>`).join('')}</div><div class="f"><label class="l">نام دفتر (مثلاً اتلیه، سفر شمال، خرج خانه)</label><input name="name"></div>`,fd=>{
    const type=fd.get('type'),name=(fd.get('name')||'').trim()||TYPES[type].label;
    const b={id:uid(),type,name,d:freshD(type)};R.books.push(b);useBook(b.id);
    route={v:homeOf()};history.pushState({r:route},'');
    setTimeout(()=>{if(type==='shop')fSetup();else if(type==='trip')fPeople();},80);
  },{ok:'ساخت دفتر'});
  if(first)$('.x').style.display='none';
}
function vBooks(){
  let h=R.books.map(b=>`<div class="pan edge ${b.id===R.cur?'':'g'} tap" data-a="openBook" data-id="${b.id}"><div class="li">${avi('book',b.id===R.cur?'ok':'st')}<div class="t"><b>${esc(b.name)}${b.pin?' (رمزدار)':''}</b><div class="mut">${TYPES[b.type].label}</div></div>${b.id===R.cur?'<span class="okc">فعال</span>':''}</div><div class="row" style="margin-top:10px"><button class="btn sm" data-a="bookMenu" data-id="${b.id}">ویرایش دفتر (نام، رمز، پاک کردن، حذف)</button></div></div>`).join('');
  h+=`<div class="row"><button class="btn pri" data-a="newBook">دفتر جدید</button></div>`;
  h+=`<div class="hint" style="margin-top:12px">برای باز کردن یک دفتر روی کارتش بزنید. برای تغییر نام، رمز، پاک کردن یا حذف، دکمهٔ «ویرایش دفتر» زیر همان کارت است.</div>`;
  return h;
}
const bookById=id=>R.books.find(x=>x.id===id);
function bookMenu(id){
  const b=bookById(id);if(!b)return;const el=$('#sheet');
  el.innerHTML=`<div class="sh"><div class="shh"><b>ویرایش دفتر «${esc(b.name)}»</b><button type="button" class="x" data-a="close">بستن</button></div><div class="row" style="flex-direction:column;margin-top:0"><button type="button" class="btn" data-a="renBook" data-id="${b.id}">تغییر نام</button><button type="button" class="btn" data-a="pinBook" data-id="${b.id}">${b.pin?'تغییر / حذف رمز':'گذاشتن رمز'}</button><button type="button" class="btn dng" data-a="resetBook" data-id="${b.id}">پاک کردن همهٔ اطلاعات این دفتر</button><button type="button" class="btn dng" data-a="delBook" data-id="${b.id}">حذف کامل دفتر</button></div><p class="mut" style="margin-top:12px">هر دفتر اطلاعات جداگانه دارد و پاک کردن یکی روی بقیه اثری ندارد. رمز فقط جلوی باز کردن اتفاقی را می‌گیرد. پیش از پاک کردن، «خروجی پشتیبان» بگیرید.</p></div>`;
  el.classList.add('on');
}
function renBook(id){
  const b=bookById(id);
  sheet('تغییر نام دفتر',`<div class="f"><input name="name" value="${esc(b.name)}"></div>`,fd=>{const n=(fd.get('name')||'').trim();if(!n)return 'نام را بنویسید';b.name=n;save();});
}
function pinBook(id){
  const b=bookById(id);
  sheet('رمز دفتر',`<div class="f"><label class="l">رمز جدید (حداقل ۴ رقم). خالی بگذارید تا رمز برداشته شود.</label><input name="pin" type="password" inputmode="numeric" autocomplete="off"></div>`,fd=>{
    const p=en(fd.get('pin')||'').replace(/\D/g,'');
    if(!p)delete b.pin;else if(p.length<4)return 'حداقل ۴ رقم';else b.pin=p;
    save();
  });
}
function resetBook(id){
  const b=bookById(id);
  askWord('همهٔ اطلاعات دفتر «'+b.name+'» پاک شود؟ این کار برگشت ندارد.',()=>{
    b.d=freshD(b.type);const isCur=b.id===R.cur;if(isCur){S=b.d;route={v:homeOf()};history.pushState({r:route},'');}
    save();toast('اطلاعات دفتر پاک شد');
    if(isCur){if(b.type==='shop')setTimeout(fSetup,120);else if(b.type==='trip')setTimeout(fPeople,120);}
  });
}
function delBook(id){
  const b=bookById(id);
  if(R.books.length<2)return toast('آخرین دفتر را نمی‌شود حذف کرد؛ اول یک دفتر دیگر بسازید');
  askWord('دفتر «'+b.name+'» برای همیشه حذف شود؟',()=>{
    R.books=R.books.filter(x=>x.id!==id);
    if(R.cur===id){R.cur=R.books[0].id;S=cur().d;route={v:homeOf()};history.pushState({r:route},'');}
    save();toast('دفتر حذف شد');
  });
}

/* ======================= سفر / دنگ ======================= */
const pName=id=>{const p=S.people.find(x=>x.id===id);return p?p.name:'؟'};
function tripCalc(){
  const ps=live(S.people),bal={},paidBy={},used={};
  ps.forEach(p=>{bal[p.id]=0;paidBy[p.id]=0;used[p.id]=0;});
  let total=0;
  live(S.exp).forEach(e=>{
    if(e.t==='exp'){
      const sh=(e.sh||[]).filter(id=>id in bal);if(!sh.length||!(e.payer in bal))return;
      total+=e.a;bal[e.payer]+=e.a;paidBy[e.payer]+=e.a;
      sh.forEach(id=>{bal[id]-=e.a/sh.length;used[id]+=e.a/sh.length;});
    }else if(e.from in bal&&e.to in bal){bal[e.from]+=e.a;bal[e.to]-=e.a;}
  });
  const cr=[],db=[];
  Object.keys(bal).forEach(id=>{const v=Math.round(bal[id]);if(v>0)cr.push({id,v});else if(v<0)db.push({id,v:-v});});
  cr.sort((x,y)=>y.v-x.v);db.sort((x,y)=>y.v-x.v);
  const tr=[];let i=0,j=0;
  while(i<db.length&&j<cr.length){const m=Math.min(db[i].v,cr[j].v);tr.push({from:db[i].id,to:cr[j].id,a:m});db[i].v-=m;cr[j].v-=m;if(!db[i].v)i++;if(!cr[j].v)j++;}
  return{bal,paidBy,used,total,tr,ps};
}
function fPeople(){
  sheet('افزودن نفرات',`<div class="f"><label class="l">اسم‌ها را با ویرگول یا در خط‌های جدا بنویس</label><textarea name="names" rows="4" placeholder="علی، رضا، مریم"></textarea></div>`,fd=>{
    const names=(fd.get('names')||'').split(/[,،\n]/).map(x=>x.trim()).filter(Boolean);
    if(!names.length)return 'حداقل یک اسم بنویسید';
    names.forEach(n=>{if(!live(S.people).some(p=>p.name===n))put('people',{id:uid(),name:n});});
    logit('افزودن نفرات: '+names.join('، '));
  });
}
function fPerson(rec){
  sheet('ویرایش نفر',`<div class="f"><input name="name" value="${esc(rec.name)}"></div>`,fd=>{const n=(fd.get('name')||'').trim();if(!n)return 'نام را بنویسید';put('people',{...rec,name:n});logit('تغییر نام '+rec.name+' به '+n);},{del:()=>{
    if(live(S.exp).some(e=>e.payer===rec.id||e.from===rec.id||e.to===rec.id||(e.sh||[]).includes(rec.id))){toast('این نفر در خرج‌ها هست؛ اول آن‌ها را اصلاح کنید');return false;}
    rec.del=true;put('people',rec);logit('حذف '+rec.name);}});
}
function fExp(rec){
  if(S.closed)return toast('سفر بسته است؛ اول آن را از صفحهٔ تسویه باز کنید');
  const ps=live(S.people);if(ps.length<2){toast('اول حداقل دو نفر را اضافه کنید');return fPeople();}
  const r=rec||{},sh=r.sh||ps.map(p=>p.id);
  sheet(rec?'ویرایش خرج':'خرج جدید',`
  <div class="f"><label class="l">برای چه چیزی؟</label><input name="desc" value="${esc(r.desc)}"></div>
  <div class="f"><label class="l">مبلغ</label>${amt('a',r.a)}</div>
  <div class="f"><label class="l">چه کسی پرداخت کرد؟</label><select name="payer">${optsHtml(ps.map(p=>[p.id,p.name]),r.payer||ps[0].id)}</select></div>
  <label class="l">خرج بین چه کسانی تقسیم شود؟</label><div class="chips">${ps.map(p=>`<label><input type="checkbox" name="sh" value="${p.id}" ${sh.includes(p.id)?'checked':''}><span>${esc(p.name)}</span></label>`).join('')}</div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>`,fd=>{
    const a=num(fd,'a'),s2=fd.getAll('sh');if(!a)return 'مبلغ را وارد کنید';if(!s2.length)return 'حداقل یک نفر را انتخاب کنید';
    const desc=(fd.get('desc')||'').trim()||'خرج';
    put('exp',{...r,id:r.id||uid(),t:'exp',desc,a,payer:fd.get('payer'),sh:s2,d:readJ(fd,'d')||today()});
    logit((rec?'ویرایش':'ثبت')+' خرج «'+desc+'» '+fmt(a));
  },rec?{del:()=>{r.del=true;put('exp',r);logit('حذف خرج «'+r.desc+'»');}}:null);
}
function fTPay(from,to,a,rec){
  if(S.closed)return toast('سفر بسته است');
  const ps=live(S.people),r=rec||{};
  sheet(rec?'ویرایش پرداخت':'ثبت پرداخت بین دو نفر',`
  <div class="f"><label class="l">چه کسی پرداخت کرد؟</label><select name="from">${optsHtml(ps.map(p=>[p.id,p.name]),r.from||from||ps[0].id)}</select></div>
  <div class="f"><label class="l">به چه کسی؟</label><select name="to">${optsHtml(ps.map(p=>[p.id,p.name]),r.to||to||(ps[1]||ps[0]).id)}</select></div>
  <div class="f"><label class="l">مبلغ</label>${amt('a',r.a||a)}</div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>`,fd=>{
    const x=num(fd,'a');if(!x)return 'مبلغ را وارد کنید';if(fd.get('from')===fd.get('to'))return 'پرداخت‌کننده و گیرنده یکی است';
    put('exp',{...r,id:r.id||uid(),t:'pay',from:fd.get('from'),to:fd.get('to'),a:x,d:readJ(fd,'d')||today()});
    logit('ثبت پرداخت '+fmt(x)+' از '+pName(fd.get('from'))+' به '+pName(fd.get('to')));
  },rec?{del:()=>{r.del=true;put('exp',r);logit('حذف یک پرداخت');}}:null);
}
function vTExp(){
  const t=tripCalc(),ps=t.ps;
  let h=S.closed?`<div class="pan edge g"><b>این سفر بسته شده است</b><div class="mut">برای ثبت تغییر، از صفحهٔ «تسویه» آن را دوباره باز کنید.</div></div>`:'';
  h+=`<div class="plate"><div class="big">جمع هزینه‌ها: ${words(t.total)}</div><small>${ps.length?'سهم میانگین هر نفر: '+fmt(t.total/ps.length)+' تومان':'اول نفرات را اضافه کنید'}</small></div>`;
  h+=ps.length&&!S.closed?tiles([['plus','plus','g','خرج جدید'],['tpayq','swap','st','ثبت پرداخت'],['addPeople','users','ok','نفرات']]).replace('data-a="plus"','data-a="plus"'):'';
  if(!ps.length)h+=`<div class="row"><button class="btn pri" data-a="addPeople">افزودن نفرات</button></div>`;
  const list=live(S.exp).sort(byDate);
  if(list.length)h+=`<div class="hint">برای ویرایش یا حذف، روی هر مورد بزنید</div>`;
  h+=list.length?list.map(e=>{
    if(e.t==='pay')return `<div class="pan edge g tap" data-a="edExp" data-id="${e.id}"><div class="li">${avi('swap','g')}<div class="t"><b>پرداخت: ${esc(pName(e.from))} به ${esc(pName(e.to))}</b><div class="mut">${jstr(e.d)}</div></div><div class="a">${fmt(e.a)}</div></div></div>`;
    const all=(e.sh||[]).length===ps.length;
    return `<div class="pan edge d tap" data-a="edExp" data-id="${e.id}"><div class="li">${avi('receipt','d')}<div class="t"><b>${esc(e.desc)}</b><div class="mut">${esc(pName(e.payer))} پرداخت کرد · ${all?'بین همه':'بین '+esc((e.sh||[]).map(pName).join('، '))} · ${jstr(e.d)}</div></div><div class="a">${fmt(e.a)}</div></div></div>`;
  }).join(''):(ps.length?'<div class="empty">هنوز خرجی ثبت نشده. با دکمهٔ + شروع کنید.</div>':'');
  return h;
}
function vTPpl(){
  const t=tripCalc();
  let h=t.ps.length?t.ps.map(p=>{const b=Math.round(t.bal[p.id]);return `<div class="pan edge ${b<0?'d':b>0?'o':''} tap" data-a="edPerson" data-id="${p.id}"><div class="li" style="justify-content:flex-start">${av(p.name)}<b style="font-size:16px">${esc(p.name)}</b></div><div class="kv"><span>پرداخت کرده</span><b>${money(t.paidBy[p.id])}</b></div><div class="kv"><span>سهم از خرج‌ها</span><b>${money(t.used[p.id])}</b></div><div class="kv"><span>${b<0?'بدهکار':b>0?'طلبکار':'تسویه'}</span><b class="${b<0?'deb':'okc'}">${money(Math.abs(b))}</b></div></div>`;}).join(''):'<div class="empty">هنوز کسی اضافه نشده</div>';
  return h+`<div class="row"><button class="btn pri" data-a="addPeople">افزودن نفرات</button></div>`;
}
function vTSet(){
  const t=tripCalc();
  let h=`<div class="plate"><div class="big">${t.tr.length?'برای تسویهٔ کامل':'همه تسویه‌اند'}</div>${t.tr.length?`<small>با ${fa(t.tr.length)} پرداخت حساب‌ها صاف می‌شود</small>`:''}</div>`;
  h+=t.tr.map(x=>`<div class="pan edge d"><div class="li"><div class="t"><b>${esc(pName(x.from))} باید ${words(x.a)} به ${esc(pName(x.to))} بدهد</b></div></div>${S.closed?'':`<div class="row"><button class="btn sm" data-a="tpay" data-from="${x.from}" data-to="${x.to}" data-amt="${x.a}">ثبت پرداخت‌شده</button></div>`}</div>`).join('');
  h+=S.closed?`<div class="pan edge g"><b>این سفر بسته شده${S.closedAt?' ('+jstr(S.closedAt)+')':''}</b><div class="row"><button class="btn" data-a="reopenTrip">باز کردن دوباره</button></div></div>`:`<div class="row"><button class="btn" data-a="newTPay">ثبت پرداخت بین دو نفر</button><button class="btn gold" data-a="closeTrip">بستن سفر</button></div>`;
  return h;
}
function closeTrip(){
  const t=tripCalc();
  const doIt=()=>{S.closed=true;S.closedAt=today();save();logit('بستن سفر');render();};
  if(t.tr.length)ask('هنوز تسویه کامل نشده است. با این حال سفر بسته شود؟',doIt);else doIt();
}

/* ======================= شخصی ======================= */
const PCAT_OUT=['خوراک','خانه و قبوض','حمل و نقل','درمان','پوشاک','تفریح','آموزش','قسط و بدهی','سایر'],PCAT_IN=['حقوق','درآمد کار','سایر'];
const KIND_L={loan:'وام',owe:'بدهی',lent:'طلب'};
const dpaid=x=>(x.pays||[]).reduce((s,p)=>s+p.a,0);
const drest=x=>x.total-dpaid(x);
function nextDue(day){
  const t=today(),[jy,jm]=toJ(t),dim=m=>m<=6?31:m<=11?30:29;
  const mk=(y,m)=>{const g=j2g(y,m,Math.min(day,dim(m)));return g[0]+'-'+String(g[1]).padStart(2,'0')+'-'+String(g[2]).padStart(2,'0');};
  let r=mk(jy,jm);if(r<t)r=jm===12?mk(jy+1,1):mk(jy,jm+1);return r;
}
function fPTx(t,rec){
  const r=rec||{};t=r.t||t;const cats=t==='in'?PCAT_IN:PCAT_OUT;
  sheet(rec?'ویرایش':(t==='in'?'درآمد جدید':'خرج جدید'),`
  <div class="f"><label class="l">مبلغ</label>${amt('a',r.a)}</div>
  <div class="f"><label class="l">دسته</label>${catField(cats,r.cat)}</div>
  <div class="f"><label class="l">توضیح (اختیاری)</label><input name="note" value="${esc(r.note)}"></div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    put('tx',{...r,id:r.id||uid(),t,a,cat:readCat(fd),note:(fd.get('note')||'').trim(),d:readJ(fd,'d')||today()});
    logit((rec?'ویرایش ':'ثبت ')+(t==='in'?'درآمد ':'خرج ')+fmt(a));
  },rec?{del:()=>{r.del=true;put('tx',r);logit('حذف '+(t==='in'?'درآمد ':'خرج ')+fmt(r.a));}}:null);
}
function fDebt(rec){
  const r=rec||{};let days='<option value="">—</option>';for(let i=1;i<=31;i++)days+=`<option value="${i}" ${+r.day===i?'selected':''}>${fa(i)}</option>`;
  sheet(rec?'ویرایش':'وام / بدهی / طلب جدید',`
  <div class="f"><label class="l">نوع</label><select name="kind">${optsHtml([['loan','وامی که گرفته‌ام (قسطی)'],['owe','به کسی بدهکارم'],['lent','از کسی طلب دارم']],r.kind||'loan')}</select></div>
  <div class="f"><label class="l">نام (مثلاً وام بانک، یا اسم شخص)</label><input name="name" value="${esc(r.name)}"></div>
  <div class="f"><label class="l">مبلغ کل</label>${amt('total',r.total)}</div>
  <div class="f"><label class="l">مبلغ هر قسط (اختیاری)</label>${amt('inst',r.inst)}</div>
  <div class="f"><label class="l">روز سررسید در هر ماه شمسی (اختیاری)</label><select name="day">${days}</select></div>
  <div class="f"><label class="l">یادداشت</label><input name="note" value="${esc(r.note)}"></div>`,fd=>{
    const name=(fd.get('name')||'').trim(),total=num(fd,'total');if(!name||!total)return 'نام و مبلغ کل را وارد کنید';
    put('debts',{...r,id:r.id||uid(),kind:fd.get('kind'),name,total,inst:num(fd,'inst'),day:+fd.get('day')||0,note:(fd.get('note')||'').trim(),pays:r.pays||[]});
    logit((rec?'ویرایش ':'ثبت ')+KIND_L[fd.get('kind')]+' «'+name+'»');
    if(!rec){route={v:'pdebt'};}
  },rec?{del:()=>{r.del=true;put('debts',r);logit('حذف «'+r.name+'»');history.back();}}:null);
}
function fDebtPay(id){
  const x=S.debts.find(d=>d.id===id),lent=x.kind==='lent';
  sheet(lent?'ثبت دریافت':'ثبت پرداخت',`
  <div class="f"><label class="l">مبلغ</label>${amt('a',x.inst&&x.inst<=drest(x)?x.inst:drest(x))}</div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',today())}</div>
  <div class="chips"><label><input type="checkbox" name="mk" checked><span>${lent?'به‌عنوان درآمد هم ثبت شود':'به‌عنوان خرج هم ثبت شود'}</span></label></div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    const d=readJ(fd,'d')||today(),pay={id:uid(),a,d};
    if(fd.get('mk')){const tx={id:uid(),t:lent?'in':'out',a,cat:lent?'سایر':'قسط و بدهی',note:x.name,d};put('tx',tx);pay.txid=tx.id;}
    x.pays=(x.pays||[]).concat(pay);put('debts',x);logit((lent?'دریافت ':'پرداخت ')+fmt(a)+' برای «'+x.name+'»');lastPut={col:'debtpay',id:x.id};
  });
}
function vPHome(){
  const tx=live(S.tx),[cy,cm]=toJ(today());
  const inM=t=>{const j=toJ(t.d);return j[0]===cy&&j[1]===cm;};
  const sum=(arr,ty)=>arr.filter(t=>t.t===ty).reduce((s,t)=>s+t.a,0);
  const mon=tx.filter(inM),mi=sum(mon,'in'),mo=sum(mon,'out'),bal=sum(tx,'in')-sum(tx,'out');
  const ds=live(S.debts).filter(x=>drest(x)>0);
  const owe=ds.filter(x=>x.kind!=='lent').reduce((s,x)=>s+drest(x),0),lent=ds.filter(x=>x.kind==='lent').reduce((s,x)=>s+drest(x),0);
  let h=`<div class="plate"><div class="big">موجودی: ${money(bal)}</div><small>مجموع همهٔ درآمدها منهای خرج‌ها. برای موجودی فعلی، یک «درآمد» با عنوان موجودی اولیه ثبت کنید.</small></div>`;
  h+=`<div class="grid3"><div class="pan"><span class="mut">درآمد ${MONTHS[cm-1]}</span><b class="okc">${money(mi)}</b></div><div class="pan"><span class="mut">خرج ${MONTHS[cm-1]}</span><b class="deb">${money(mo)}</b></div><div class="pan"><span class="mut">خالص ماه</span><b>${money(mi-mo)}</b></div></div>`;
  h+=tiles([['newPIn','down','ok','ثبت درآمد'],['newPOut','up','d','ثبت خرج'],['newDebt','bank','g','وام / بدهی']]);
  h+=`<div class="pan edge ${owe>0?'d':'o'}"><div class="kv"><span>جمع وام‌ها و بدهی‌های باقی‌مانده</span><b>${money(owe)}</b></div>${lent>0?`<div class="kv"><span>جمع طلب‌ها</span><b>${money(lent)}</b></div>`:''}</div>`;
  const up=ds.filter(x=>x.kind!=='lent'&&x.day).map(x=>({x,due:nextDue(x.day)})).sort((a,b)=>a.due<b.due?-1:1).slice(0,6);
  if(up.length)h+=`<h2>اقساط و سررسیدهای نزدیک</h2>`+up.map(({x,due})=>{const[l,k]=dueLabel(due);return `<div class="pan edge ${k} tap" data-a="pdebtd" data-id="${x.id}"><div class="li"><div class="t"><b>${esc(x.name)}</b><div class="mut">${jstr(due)} · ${l}</div></div><div class="a">${x.inst?money(Math.min(x.inst,drest(x))):money(drest(x))}</div></div></div>`;}).join('');
  const cat={};mon.filter(t=>t.t==='out').forEach(t=>cat[t.cat]=(cat[t.cat]||0)+t.a);
  const cs=Object.entries(cat).sort((a,b)=>b[1]-a[1]);
  if(cs.length)h+=`<h2>خرج این ماه به تفکیک دسته</h2><div class="pan">${cs.map(([k,v])=>`<div class="kv"><span>${esc(k)}</span><b>${money(v)}</b></div>`).join('')}</div>`;
  return h;
}
function vPTx(){
  const f=route.f||'all';
  const list=live(S.tx).filter(t=>f==='all'||t.t===f).sort(byDate).slice(0,250);
  const chip=(k,l)=>`<a class="${f===k?'on':''}" data-a="filt" data-f="${k}">${l}</a>`;
  return `<div class="chips">${chip('all','همه')}${chip('in','درآمد')}${chip('out','خرج')}</div><div class="hint">برای ویرایش یا حذف، روی هر مورد بزنید</div>`+(list.length?list.map(t=>`<div class="pan edge ${t.t==='in'?'o':'d'} tap" data-a="edPTx" data-id="${t.id}"><div class="li">${avi(t.t==="in"?"down":"up",t.t==="in"?"ok":"d")}<div class="t"><b>${esc(t.note||t.cat)}</b><div class="mut">${jstr(t.d)} · ${esc(t.cat)}</div></div><div class="a ${t.t==='in'?'okc':'deb'}">${t.t==='in'?'+':'−'}${fmt(t.a)}</div></div></div>`).join(''):'<div class="empty">چیزی ثبت نشده. با دکمهٔ + شروع کنید.</div>');
}
function vPDebt(){
  const ds=live(S.debts);
  const grp=(k,l)=>{const a=ds.filter(x=>x.kind===k);return a.length?`<h2>${l}</h2>`+a.map(x=>{const r=drest(x);return `<div class="pan edge ${r>0?(k==='lent'?'g':'d'):'o'} tap" data-a="pdebtd" data-id="${x.id}"><div class="li">${avi('bank',r>0?(k==='lent'?'g':'d'):'ok')}<div class="t"><b>${esc(x.name)}</b><div class="mut">${r>0?'از '+money(x.total)+(x.day?' · سررسید روز '+fa(x.day)+' هر ماه':''):'تسویه شد'}</div></div><div class="a ${r>0&&k!=='lent'?'deb':''}">${r>0?money(r):'—'}</div></div></div>`;}).join(''):'';};
  const h=grp('loan','وام‌ها')+grp('owe','بدهی‌ها')+grp('lent','طلب‌ها');
  return (h||'<div class="empty">وام یا بدهی‌ای ثبت نشده</div>')+`<div class="row"><button class="btn pri" data-a="newDebt">وام / بدهی / طلب جدید</button></div>`;
}
function vPDebtD(){
  const x=S.debts.find(d=>d.id===route.id);if(!x||x.del)return '<div class="empty">پیدا نشد</div>';
  const r=drest(x),lent=x.kind==='lent',pays=(x.pays||[]).slice().sort((a,b)=>a.d<b.d?1:-1);
  let h=`<div class="pan edge ${r>0?(lent?'g':'d'):'o'}"><div class="li"><b style="font-size:17px">${esc(x.name)}</b><button class="btn sm" data-a="editDebt" data-id="${x.id}">ویرایش</button></div><div class="mut">${KIND_L[x.kind]}${x.note?' · '+esc(x.note):''}</div>
  <div class="kv"><span>مبلغ کل</span><b>${money(x.total)}</b></div><div class="kv"><span>${lent?'دریافت‌شده':'پرداخت‌شده'}</span><b>${money(dpaid(x))}</b></div><div class="kv"><span>باقی‌مانده</span><b class="${r>0&&!lent?'deb':'okc'}">${money(r)}</b></div>
  ${x.inst?`<div class="kv"><span>قسط</span><b>${money(x.inst)}</b></div>`:''}${x.day&&r>0?`<div class="kv"><span>سررسید بعدی</span><b>${jstr(nextDue(x.day))}</b></div>`:''}
  ${x.inst&&r>0?`<div class="kv"><span>تعداد قسط باقی‌مانده</span><b>${fa(Math.ceil(r/x.inst))}</b></div>`:''}</div>`;
  if(r>0)h+=`<div class="row"><button class="btn pri" data-a="debtPay" data-id="${x.id}">${lent?'ثبت دریافت':'ثبت پرداخت قسط'}</button></div>`;
  h+=`<h2>سابقه</h2>`+(pays.length?pays.map(p=>`<div class="pan tap" data-a="delPay" data-id="${x.id}" data-pid="${p.id}"><div class="li"><div class="t"><b>${jstr(p.d)}</b></div><div class="a">${fmt(p.a)}</div></div></div>`).join('')+'<div class="mut">برای حذف یک مورد، روی آن بزنید.</div>':'<div class="empty">هنوز چیزی ثبت نشده</div>');
  return h;
}

/* ======================= بدهی‌های کارگاه (پرداختنی) ======================= */
const BCATS=['اجاره','قبض','مواد اولیه','حقوق / اجرت','سایر'];
const bpays=x=>(x.pays||[]).map(p=>{if(!p.txid)return p;const t=S.tx.find(q=>q.id===p.txid);return t&&!t.del?{...p,a:t.a,acc:t.acc,d:t.d}:null;}).filter(Boolean);
const bpaid=x=>bpays(x).reduce((a,p)=>a+p.a,0),brest=x=>x.total-bpaid(x);
const debtOfTx=t=>{if(!t||!S.pay)return null;return S.pay.find(x=>!x.del&&((t.did&&x.id===t.did)||(x.pays||[]).some(p=>p.txid===t.id)))||null;};
const bcatExp=c=>c==='اجاره'||c==='قبض'?'اجاره و قبوض':c==='مواد اولیه'?'مصالح و آهن':c==='حقوق / اجرت'?'اجرت و کارگر':'سایر';
function bdebtCard(){
  const open=live(S.pay||[]).filter(x=>brest(x)>0),owed=open.reduce((a,x)=>a+brest(x),0);
  return `<div class="pan edge ${owed>0?'d':'o'} tap" data-a="go" data-v="bdebt"><div class="kv"><span>بدهی‌ها (پرداختنی)</span><b class="${owed>0?'deb':''}">${money(owed)}</b></div>${open.length?`<div class="mut">${fa(open.length)} مورد باز · برای دیدن و ثبت پرداخت بزنید</div>`:`<div class="mut">قبض، اجاره یا خرید نسیه را اینجا ثبت کنید</div>`}</div>`;
}
function bdueList(){
  const l=live(S.pay||[]).filter(x=>brest(x)>0&&x.due).sort((a,b)=>a.due<b.due?-1:1).slice(0,5);
  if(!l.length)return '';
  return `<h2>سررسید بدهی‌ها</h2>`+l.map(x=>{const[lb,k]=dueLabel(x.due);return `<div class="pan edge ${k} tap" data-a="bdebtd" data-id="${x.id}"><div class="li">${avi('receipt',k==='d'?'d':'g')}<div class="t"><b>${esc(x.name)}</b><div class="mut">${esc(x.cat)} · ${lb}</div></div><div class="a deb">${money(brest(x))}</div></div></div>`;}).join('');
}
function fBDebt(rec){
  const r=rec||{};
  sheet(rec?'ویرایش بدهی':'بدهی جدید (پرداختنی)',`
  <div class="f"><label class="l">بابت</label><select name="cat">${optsHtml(BCATS.map(c=>[c,c]),r.cat||BCATS[0])}</select></div>
  <div class="f"><label class="l">به چه کسی یا چه چیزی؟ (مثلاً قبض برق مهر، اجارهٔ آبان، فروشندهٔ ورق)</label><input name="name" value="${esc(r.name)}"></div>
  <div class="f"><label class="l">مبلغ کل بدهی</label>${amt('total',r.total)}</div>
  <div class="f"><label class="l">سررسید پرداخت (اختیاری)</label>${jdate('due',r.due||'',true)}</div>
  <div class="f"><label class="l">مربوط به کدام سفارش؟ (اختیاری، مثلاً خرید مواد برای یک مشتری)</label><select name="oid">${ordOpts(r.oid||'','— بدون سفارش —')}</select></div>
  <div class="f"><label class="l">یادداشت</label><input name="note" value="${esc(r.note)}"></div>`,fd=>{
    const name=(fd.get('name')||'').trim(),total=num(fd,'total');if(!name||!total)return 'نام و مبلغ بدهی را وارد کنید';
    put('pay',{...r,id:r.id||uid(),cat:fd.get('cat'),name,total,due:readJ(fd,'due'),oid:fd.get('oid')||'',note:(fd.get('note')||'').trim(),d:r.d||today(),pays:r.pays||[]});
    logit((rec?'ویرایش':'ثبت')+' بدهی «'+name+'» '+fmt(total));
    if(!rec){route={v:'bdebt'};}
  },rec?{delMsg:'بدهی «'+r.name+'» و پرداخت‌های ثبت‌شده برای آن (که در هزینه‌ها آمده) حذف شود؟',del:()=>{deleteBDebt(r);history.back();}}:null);
}
function deleteBDebt(x){
  (x.pays||[]).forEach(p=>{const t=S.tx.find(q=>q.id===p.txid);if(t){t.del=true;put('tx',t);}});
  x.del=true;put('pay',x);logit('حذف بدهی «'+x.name+'»');lastPut=null;
}
function fBPay(id,pid){
  const x=S.pay.find(d=>d.id===id),old0=pid?(x.pays||[]).find(p=>p.id===pid):null,old=old0?(bpays(x).find(p=>p.id===pid)||old0):null;
  sheet(old?'ویرایش پرداخت':'ثبت پرداخت بدهی',`
  <div class="f"><label class="l">مبلغ پرداخت‌شده</label>${amt('a',old?old.a:brest(x))}</div>
  <div class="f"><label class="l">از کجا پرداخت شد؟</label><select name="acc">${accOpts(old?old.acc:S.set.who,true)}</select></div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',old?old.d:today())}</div>
  <div class="mut">این پرداخت خودکار در «هزینه‌ها» هم ثبت می‌شود تا در حساب و تسویه شریک‌ها بیاید.</div>`,fd=>{
    const a=num(fd,'a');if(!a)return 'مبلغ را وارد کنید';
    const acc=fd.get('acc'),d=readJ(fd,'d')||today();
    if(old){
      Object.assign(old0,{a,acc,d});const t=S.tx.find(q=>q.id===old0.txid);if(t){Object.assign(t,{a,acc,d});put('tx',t);}
    }else{
      const tx={id:uid(),t:'out',a,acc,oid:x.oid||'',cat:bcatExp(x.cat),note:x.name,d,by:S.set.who,did:x.id};put('tx',tx);
      x.pays=(x.pays||[]).concat({id:uid(),a,acc,d,txid:tx.id});
    }
    put('pay',x);logit('پرداخت '+fmt(a)+' برای بدهی «'+x.name+'»');lastPut={col:'bpay',id:x.id};
  },old?{delMsg:'این پرداخت حذف شود؟ از هزینه‌ها هم برداشته می‌شود.',del:()=>{
    x.pays=x.pays.filter(p=>p.id!==old.id);const t=S.tx.find(q=>q.id===old.txid);if(t){t.del=true;put('tx',t);}
    put('pay',x);logit('حذف یک پرداخت از «'+x.name+'»');lastPut=null;}}:null);
}
function vBDebt(){
  const all=live(S.pay||[]),open=all.filter(x=>brest(x)>0).sort((a,b)=>(a.due||'9')<(b.due||'9')?-1:1),done=all.filter(x=>brest(x)<=0);
  const owed=open.reduce((a,x)=>a+brest(x),0);
  let h=`<div class="plate"><div class="big">جمع بدهی‌های باز: ${words(owed)}</div><small>${fa(open.length)} مورد باز</small></div>`;
  const row=x=>{const r=brest(x),lb=x.due&&r>0?dueLabel(x.due):['',''];return `<div class="pan edge ${r>0?(lb[1]||'d'):'o'} tap" data-a="bdebtd" data-id="${x.id}"><div class="li">${avi('receipt',r>0?'d':'ok')}<div class="t"><b>${esc(x.name)}</b><div class="mut">${esc(x.cat)}${x.due&&r>0?' · '+lb[0]:''}${r<=0?' · تسویه شد':''}</div></div><div class="a ${r>0?'deb':'okc'}">${r>0?money(r):money(x.total)}</div></div></div>`;};
  h+=open.length?open.map(row).join(''):'<div class="empty">بدهی بازی ندارید</div>';
  if(done.length)h+=`<h2>تسویه‌شده‌ها</h2>`+done.map(row).join('');
  return h+`<div class="row"><button class="btn pri" data-a="newBDebt">ثبت بدهی جدید</button></div>`;
}
function vBDebtD(){
  const x=S.pay.find(d=>d.id===route.id);if(!x||x.del)return '<div class="empty">پیدا نشد</div>';
  const r=brest(x),o=x.oid&&S.ord.find(q=>q.id===x.oid),pays=bpays(x).sort((a,b)=>a.d<b.d?1:-1);
  let h=`<div class="pan edge ${r>0?'d':'o'}"><div class="li"><b style="font-size:17px">${esc(x.name)}</b><button class="btn sm" data-a="editBDebt" data-id="${x.id}">ویرایش</button></div><div class="mut">${esc(x.cat)}${x.note?' · '+esc(x.note):''}</div>
  <div class="kv"><span>مبلغ کل</span><b>${money(x.total)}</b></div><div class="kv"><span>پرداخت‌شده</span><b class="okc">${money(bpaid(x))}</b></div><div class="kv"><span>${r<0?'اضافه‌پرداخت':'باقی‌مانده'}</span><b class="${r>0?'deb':'okc'}">${money(Math.abs(r))}</b></div>
  ${x.due?`<div class="kv"><span>سررسید</span><b>${jstr(x.due)}${r>0?' ('+dueLabel(x.due)[0]+')':''}</b></div>`:''}
  ${o?`<div class="kv tap" data-a="ord" data-id="${o.id}"><span>سفارش مربوط</span><b style="color:var(--st)">${esc(o.title)}</b></div>`:''}</div>`;
  if(r>0)h+=`<div class="row"><button class="btn pri" data-a="bpay" data-id="${x.id}">ثبت پرداخت</button></div>`;
  h+=`<h2>پرداخت‌ها</h2><div class="hint">برای ویرایش یا حذف هر پرداخت روی آن بزنید</div>`+(pays.length?pays.map(p=>`<div class="pan tap" data-a="editBPay" data-id="${x.id}" data-pid="${p.id}"><div class="li">${avi('up','d')}<div class="t"><b>${jstr(p.d)}</b><div class="mut">${esc(accLabel(p.acc))}</div></div><div class="a">${fmt(p.a)}</div></div></div>`).join(''):'<div class="empty">هنوز پرداختی ثبت نشده</div>');
  h+=`<div class="row"><button class="btn dng" data-a="delBDebt" data-id="${x.id}">حذف این بدهی</button></div>`;
  return h;
}

/* ======================= actions (دفترها / سفر / شخصی) ======================= */
Object.assign(A,{
  impMerge:()=>{closeSheet();importRun('merge');},impNew:()=>{closeSheet();importRun('new');},
  impReplace:()=>{const n=pendImp&&bookById(pendImp.tid);ask('اطلاعات فعلی'+(n?' دفتر «'+n.name+'»':'')+' کاملاً پاک و با فایل جایگزین می‌شود. مطمئنید؟ (بهتر است قبلش پشتیبان بگیرید)',()=>importRun('replace'),'جایگزینی کامل');},
  newBDebt:()=>{closeSheet();fBDebt();},bdebtd:d=>go('bdebtd',{id:d.id}),editBDebt:d=>fBDebt(S.pay.find(x=>x.id===d.id)),bpay:d=>fBPay(d.id),editBPay:d=>fBPay(d.id,d.pid),
  delBDebt:d=>{const x=S.pay.find(q=>q.id===d.id);if(!x)return;ask('بدهی «'+x.name+'» و پرداخت‌های ثبت‌شده برای آن (که در هزینه‌ها آمده) حذف شود؟',()=>{deleteBDebt(x);history.back();});},
  txd:d=>go('txd',{id:d.id}),accd:d=>go('accd',{id:d.id}),editTxForm:d=>editTx(d.id),
  delTx:d=>{const t=S.tx.find(x=>x.id===d.id);if(!t)return;ask('این مورد حذف شود؟',()=>{t.del=true;put('tx',t);logit('حذف '+(t.t==='in'?'دریافتی ':t.t==='out'?'هزینه ':'تراکنش ')+fmt(t.a));lastPut=null;history.back();});},
  delCust:d=>{const c=S.cust.find(x=>x.id===d.id);if(!c)return;ask(custDelMsg(c),()=>{cascadeDeleteCustomer(c);history.back();});},
  delOrd:d=>{const o=S.ord.find(x=>x.id===d.id);if(!o)return;ask(ordDelMsg(o),()=>{cascadeDeleteOrder(o);history.back();});},
  crumb:d=>go(d.v,d.id?{id:d.id}:undefined),home:()=>go(homeOf()),tpayq:()=>fTPay(),
  openBook:d=>switchTo(d.id),newBook:()=>{closeSheet();fBook();},renBook:d=>renBook(d.id),pinBook:d=>pinBook(d.id),resetBook:d=>resetBook(d.id),delBook:d=>delBook(d.id),bookMenu:d=>bookMenu(d.id),
  addPeople:()=>fPeople(),edPerson:d=>fPerson(S.people.find(x=>x.id===d.id)),
  edExp:d=>{const e=S.exp.find(x=>x.id===d.id);if(!e)return;if(S.closed)return toast('سفر بسته است');if(e.t==='pay')fTPay(null,null,null,e);else fExp(e);},
  tpay:d=>fTPay(d.from,d.to,+d.amt),newTPay:()=>fTPay(),closeTrip,
  reopenTrip:()=>{S.closed=false;save();logit('باز کردن دوبارهٔ سفر');render();},
  newPIn:()=>{closeSheet();fPTx('in');},newPOut:()=>{closeSheet();fPTx('out');},newDebt:()=>{closeSheet();fDebt();},
  edPTx:d=>fPTx(null,S.tx.find(x=>x.id===d.id)),
  pdebtd:d=>go('pdebtd',{id:d.id}),editDebt:d=>fDebt(S.debts.find(x=>x.id===d.id)),debtPay:d=>fDebtPay(d.id),
  delPay:d=>{const x=S.debts.find(q=>q.id===d.id),p=(x.pays||[]).find(q=>q.id===d.pid);if(!p)return;
    ask('این مورد حذف شود؟',()=>{x.pays=x.pays.filter(q=>q.id!==p.id);put('debts',x);
    if(p.txid){const t=S.tx.find(q=>q.id===p.txid);if(t){t.del=true;put('tx',t);}}
    logit('حذف یک مورد از «'+x.name+'»');render();});}
});

/* ---------- start ---------- */
function start(){
  try{if(window.kargahExtra)kargahExtra();}catch(e){window.__showErr&&window.__showErr('extra: '+e.message);}
  route={v:homeOf()};history.replaceState({r:route},'');render();
  if(btype()==='shop'&&!S.set.done)fSetup();else if(isBizT()&&window.xBoot)xBoot();else notifyDue();
}
history.replaceState({r:route},'');
if(!R.books.length){fBook(true);}
else{
  const b=cur()||R.books[0];R.cur=b.id;
  if(b.pin)askPin(b,()=>{useBook(b.id);start();},true);
  else{useBook(b.id);start();}
}
window.__mainReady=true;
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
