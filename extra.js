/* ماژول افزوده: چک، یادداشت، نوبت، تقویم و مناسبت‌ها، یادآوری، انبار */
(function(){
'use strict';
const DN=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const isBiz=()=>typeof btype==='function'&&(btype()==='shop'||btype()==='solo');
const opt={stock:()=>S.set.stock!==false,ideas:()=>S.set.ideas!==undefined?!!S.set.ideas:!!S.set.solo,occ:()=>S.set.occ!==false,eve:()=>S.set.eve!==false};
const wd=ds=>(pISO(ds).getDay()+1)%7;
const addD=(ds,n)=>{const d=pISO(ds);d.setDate(d.getDate()+n);return iso(d);};
const dAt=(ds,h,mi)=>{const p=ds.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],h||0,mi||0).getTime();};
const jiso=(y,m,d)=>{const g=j2g(y,m,d);return g[0]+'-'+String(g[1]).padStart(2,'0')+'-'+String(g[2]).padStart(2,'0');};
const jleap=y=>{const g=j2g(y,12,30),j=g2j(g[0],g[1],g[2]);return j[0]===y&&j[1]===12&&j[2]===30;};
const jmLen=(y,m)=>m<=6?31:m<=11?30:(jleap(y)?30:29);
const timeStr=t=>t?fa(t):'';

/* ---------- تاریخ قمری (تقریبی) و مناسبت‌ها ---------- */
const hTab=(hy,hm,hd)=>(hy-1)*354+Math.floor((3+11*hy)/30)+29*(hm-1)+Math.floor(hm/2)+hd;
const hLen=(hy,hm)=>hm%2?30:(hm===12&&((11*hy+14)%30<11)?30:29);
function hDate(hy,hm,hd){const n=hTab(hy,hm,hd)-hTab(1448,1,1);return new Date(2026,5,16+n+(+S.set.loff||0));}
const occCache={};
function occMap(jy){
  const key=jy+'|'+(S.set.loff||0)+'|'+JSON.stringify(S.set.cocc||[]);
  if(occCache[key])return occCache[key];
  const map={};const add=(dt,o)=>{const ds=iso(dt);if(toJ(ds)[0]!==jy)return;(map[ds]=map[ds]||[]).push(o);};
  const all=(window.KOCC||[]).concat((S.set.cocc||[]).map(c=>({k:'j',m:c.m,d:c.d,t:c.t,hol:c.hol,big:c.big,i:c.i,custom:c.id})));
  all.forEach(o=>{
    if(o.k==='j'){
      if(o.d==='T'){let dt=new Date(...j2g(jy,12,jmLen(jy,12)).map((v,i)=>i===1?v-1:v));while(dt.getDay()!==2)dt.setDate(dt.getDate()-1);add(dt,o);}
      else{const g=j2g(jy,o.m,o.d);add(new Date(g[0],g[1]-1,g[2]),o);}
    }else if(o.k==='g'){[jy+621,jy+622].forEach(gy=>add(new Date(gy,o.m-1,o.d),o));}
    else if(o.k==='h'){const h0=Math.round((jy+621.5-621.57)*1.030684);for(let hy=h0-2;hy<=h0+2;hy++){const hd=o.d==='L'?hLen(hy,o.m):o.d;add(hDate(hy,o.m,hd),o);}}
  });
  return occCache[key]=map;
}
function dayInfo(ds){
  const jy=toJ(ds)[0],occ=(occMap(jy)[ds]||[]).slice(),fri=wd(ds)===6;
  const hol=occ.some(o=>o.hol);
  let idea=null;
  if(opt.ideas()&&window.KIDEAS){const j=toJ(ds),arr=KIDEAS[j[1]-1];if(arr)idea=arr[Math.min(j[2],arr.length)-1]||null;}
  return{ds,occ,fri,hol,off:hol||fri,idea};
}
const occNames=info=>info.occ.map(o=>o.t).join(' · ');

/* ---------- یادآوری‌ها ---------- */
const rsKey=()=>'kargah.rs.'+cur().id,rbKey=()=>'kargah.rb.'+cur().id;
function rs(){try{return JSON.parse(localStorage.getItem(rsKey()))||{seen:{},fired:{}};}catch(e){return{seen:{},fired:{}};}}
function rsSave(o){['seen','fired'].forEach(k=>{const e=Object.entries(o[k]);if(e.length>400)o[k]=Object.fromEntries(e.slice(-300));});try{localStorage.setItem(rsKey(),JSON.stringify(o));}catch(e){}}
function baseMs(){let b=+localStorage.getItem(rbKey());if(!b){const d=new Date();d.setHours(0,0,0,0);b=d.getTime();try{localStorage.setItem(rbKey(),String(b));}catch(e){}}return b;}
function rel(due){const n=dayDiff(today(),due);return n<0?fa(-n)+' روز از سررسید گذشته':n===0?'امروز':n===1?'فردا':fa(n)+' روز دیگر';}
function buildRem(fromMs,toMs){
  const out=[],base=baseMs();
  const push=(key,at,title,body,go,minAt)=>{if(at>=Math.max(fromMs,base,minAt||0)&&at<=toMs)out.push({key,at,title,body,go});};
  const d0=new Date(fromMs);d0.setHours(0,0,0,0);const days=Math.ceil((toMs-fromMs)/864e5)+9;
  for(let k=0;k<=days;k++){
    const dt=new Date(d0);dt.setDate(d0.getDate()+k);const ds=iso(dt),info=dayInfo(ds);
    if(opt.occ()&&(info.occ.length||info.idea)){
      const t=info.occ.length?info.occ.map(o=>o.t).join(' · '):'ایدهٔ امروز';
      let body=info.occ.find(o=>o.i)?info.occ.find(o=>o.i).i:(info.idea||'');
      if(!info.occ.length&&!info.idea)continue;
      push('d:'+ds,dAt(ds,8,0),t+(info.hol?' (تعطیل)':''),body.slice(0,140),{v:'day',id:ds});
    }
    if(opt.occ()){
      const w=addD(ds,7),wi=dayInfo(w);
      wi.occ.forEach((o,i)=>{if(o.big)push('w:'+w+':'+i,dAt(ds,9,0),'یک هفته تا «'+o.t+'»',(o.i||'از همین الان آماده شو.').slice(0,140),{v:'day',id:w});});
    }
    if(opt.eve()){
      const nx=addD(ds,1),ni=dayInfo(nx);
      if(ni.off)push('e:'+nx,dAt(ds,20,0),'فردا '+(ni.hol&&ni.occ.length?ni.occ.filter(o=>o.hol).map(o=>o.t).join(' · '):'جمعه')+' است','مغازه باز است یا بسته؟ از همین امشب برنامه‌ات را بچین.',{v:'day',id:nx});
    }
  }
  if(!isBiz())return out;
  live(S.chq||[]).filter(c=>c.st==='open'&&c.due).forEach(c=>{
    const t=c.dir==='in'?'چک دریافتی':'چک پرداختی ما',who=c.party||'';
    const b=when=>who+' — '+money(c.amt)+' — '+when;
    push('c:'+c.id+':2',dAt(addD(c.due,-2),9,0),t+' (دو روز دیگر)',b('سررسید '+jstr(c.due)),{v:'chqd',id:c.id},c.u);
    push('c:'+c.id+':0',dAt(c.due,9,0),t+' (امروز)',b('امروز سررسید است'),{v:'chqd',id:c.id},c.u);
    push('c:'+c.id+':-1',dAt(addD(c.due,1),9,0),t+' (سررسید گذشته)',b('هنوز باز است'),{v:'chqd',id:c.id},c.u);
  });
  live(S.appt||[]).forEach(a=>{
    push('a:'+a.id+':2',dAt(addD(a.d,-2),9,0),'نوبت: '+a.title+' (دو روز دیگر)',jstr(a.d)+(a.time?' ساعت '+timeStr(a.time):''),{v:'day',id:a.d},a.u);
    push('a:'+a.id+':0',dAt(a.d,8,0),'نوبت امروز: '+a.title,a.time?'ساعت '+timeStr(a.time):(a.note||''),{v:'day',id:a.d},a.u);
  });
  live(S.notes||[]).filter(n=>n.rem&&!n.done).forEach(n=>{const at=new Date(n.rem).getTime();if(at)push('n:'+n.id,at,'یادداشت',(n.title||n.text||'').slice(0,100),{v:'notes'},0);});
  live(S.pay||[]).filter(x=>x.due&&brest(x)>0).forEach(x=>{
    push('p:'+x.id+':1',dAt(addD(x.due,-1),9,0),'سررسید بدهی (فردا)',x.name+' — '+money(brest(x)),{v:'bdebtd',id:x.id},x.u);
    push('p:'+x.id+':0',dAt(x.due,9,0),'سررسید بدهی (امروز)',x.name+' — '+money(brest(x)),{v:'bdebtd',id:x.id},x.u);
  });
  live(S.ord||[]).filter(o=>o.due&&rest(o)>0).forEach(o=>{
    push('o:'+o.id+':2',dAt(addD(o.due,-2),9,0),'سررسید طلب از مشتری (دو روز دیگر)',custOf(o).name+' — '+money(rest(o)),{v:'ord',id:o.id},o.u);
    push('o:'+o.id+':0',dAt(o.due,9,0),'سررسید طلب از مشتری (امروز)',custOf(o).name+' — '+money(rest(o)),{v:'ord',id:o.id},o.u);
  });
  return out.sort((a,b)=>a.at-b.at);
}
const XP={pending:[],shown:false};
function pendingList(){const r=rs(),now=Date.now();return buildRem(now-14*864e5,now).filter(x=>!r.seen[x.key]).sort((a,b)=>b.at-a.at);}
function updateBell(){const b=$('#bellb');if(b){const n=XP.pending.length;b.textContent=n>9?'۹+':fa(n);b.style.display=n?'block':'none';}}
function idbOpen(){return new Promise((res,rej)=>{if(!window.indexedDB)return rej();const r=indexedDB.open('kargah-rem',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('rem',{keyPath:'key'});d.createObjectStore('shown',{keyPath:'key'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function mirror(){
  try{const db=await idbOpen(),now=Date.now(),list=buildRem(now-864e5,now+45*864e5);
    const tx=db.transaction('rem','readwrite'),st=tx.objectStore('rem');st.clear();list.forEach(x=>st.put(x));}catch(e){}
}
async function markShownIdb(keys){try{const db=await idbOpen(),tx=db.transaction('shown','readwrite'),st=tx.objectStore('shown');keys.forEach(k=>st.put({key:k,at:Date.now()}));}catch(e){}}
async function fireSys(list){
  if(!('Notification' in window)||Notification.permission!=='granted'||!list.length)return;
  const show=list.slice(0,4);
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
    for(const x of show){const o={body:x.body,tag:x.key,icon:'icon-192.png',dir:'rtl',lang:'fa',data:{go:x.go}};if(reg)await reg.showNotification(x.title,o);else new Notification(x.title,o);}
    if(list.length>4){const o={body:'و '+fa(list.length-4)+' یادآوری دیگر؛ مرکز اعلان‌ها را ببین',tag:'more',icon:'icon-192.png',dir:'rtl',lang:'fa',data:{go:{v:'notif'}}};if(reg)await reg.showNotification('یادآوری‌های حساب کارگاه',o);}
  }catch(e){}
}
let checking=false;
async function xCheck(){
  if(checking||!S||!cur()||!isBiz())return;checking=true;
  try{
    const list=pendingList(),r=rs(),fresh=list.filter(x=>!r.fired[x.key]);
    XP.pending=list;updateBell();
    if(fresh.length){fresh.forEach(x=>r.fired[x.key]=1);rsSave(r);await fireSys(fresh);markShownIdb(fresh.map(x=>x.key));
      if(!XP.shown&&route.v!=='notif'){XP.shown=true;toast(fa(fresh.length)+' یادآوری جدید دارید','نمایش',()=>go('notif'));}}
    mirror();
  }finally{checking=false;}
}
function seenAll(list){const r=rs();list.forEach(x=>r.seen[x.key]=1);rsSave(r);XP.pending=pendingList();updateBell();}
async function enableNotif(){
  if(!('Notification' in window))return toast('این مرورگر اعلان پشتیبانی نمی‌کند');
  const p=await Notification.requestPermission();
  if(p!=='granted')return toast('اجازه داده نشد؛ از تنظیمات مرورگر یا برنامه فعالش کنید');
  try{const reg=await navigator.serviceWorker.ready;if(reg.periodicSync)await reg.periodicSync.register('kargah-check',{minInterval:3600*1000});}catch(e){}
  toast('اعلان فعال شد');xCheck();render();
}
window.xCheck=xCheck;

/* ---------- خروجی تقویم گوشی (.ics) ---------- */
const icsEsc=s=>String(s||'').replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
const icsD=ds=>ds.replace(/-/g,'');
function icsT(ms){const d=new Date(ms),p=n=>String(n).padStart(2,'0');return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+'00';}
function buildIcs(){
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//kargah//FA','CALSCALE:GREGORIAN'];
  const stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
  const ev=(uid,sum,desc,dayDs,timeMs,alarms)=>{
    L.push('BEGIN:VEVENT','UID:'+uid+'@kargah','DTSTAMP:'+stamp,'SUMMARY:'+icsEsc(sum),'DESCRIPTION:'+icsEsc(desc));
    if(timeMs)L.push('DTSTART:'+icsT(timeMs),'DTEND:'+icsT(timeMs+36e5));else L.push('DTSTART;VALUE=DATE:'+icsD(dayDs),'DTEND;VALUE=DATE:'+icsD(addD(dayDs,1)));
    alarms.forEach(a=>L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(sum),'TRIGGER'+(a.rel?';RELATED=START':'')+':'+a.t,'END:VALARM'));
    L.push('END:VEVENT');};
  live(S.chq||[]).filter(c=>c.st==='open'&&c.due).forEach(c=>ev('chq'+c.id,(c.dir==='in'?'سررسید چک دریافتی: ':'سررسید چک پرداختی: ')+c.party+' '+money(c.amt),c.note||'',c.due,0,[{t:'-PT39H'},{t:'PT9H',rel:1}]));
  live(S.appt||[]).forEach(a=>{const tm=a.time?dAt(a.d,+a.time.slice(0,2),+a.time.slice(3,5)):0;ev('appt'+a.id,'نوبت: '+a.title,a.note||'',a.d,tm,tm?[{t:'-P2D'},{t:'-PT1H'}]:[{t:'-PT39H'},{t:'PT8H',rel:1}]);});
  live(S.notes||[]).filter(n=>n.rem&&!n.done).forEach(n=>{const at=new Date(n.rem).getTime();if(at)ev('note'+n.id,'یادداشت: '+(n.title||(n.text||'').slice(0,40)),n.text||'',n.rem.slice(0,10),at,[{t:'PT0S'}]);});
  live(S.pay||[]).filter(x=>x.due&&brest(x)>0).forEach(x=>ev('debt'+x.id,'سررسید بدهی: '+x.name+' '+money(brest(x)),x.note||'',x.due,0,[{t:'-PT15H'},{t:'PT9H',rel:1}]));
  live(S.ord||[]).filter(o=>o.due&&rest(o)>0).forEach(o=>ev('ord'+o.id,'سررسید طلب: '+custOf(o).name+' '+money(rest(o)),o.title||'',o.due,0,[{t:'-PT39H'},{t:'PT9H',rel:1}]));
  L.push('END:VCALENDAR');return L.join('\r\n');
}
function icsDownload(){dl(new Blob([buildIcs()],{type:'text/calendar'}),'kargah-reminders.ics');toast('فایل تقویم ساخته شد؛ بازش کن و به تقویم گوشی اضافه کن');}

/* ---------- ابزار فرم ---------- */
const optsL=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}" ${v===sel?'selected':''}>${esc(l)}</option>`).join('');
const custNames=()=>live(S.cust).map(c=>c.name);
function findOrMakeCust(name){name=(name||'').trim();if(!name)return null;let c=live(S.cust).find(x=>x.name===name);if(!c){c={id:uid(),name,phone:'',note:''};put('cust',c);}return c;}
const tabs=(arr,sel)=>`<div class="chips">${arr.map(([k,l])=>`<a class="${sel===k?'on':''}" data-a="xf" data-f="${k}">${l}</a>`).join('')}</div>`;
const rowH=(icn,cls,title,sub,right,act,id,extra)=>`<div class="pan edge ${cls} tap" data-a="${act}" data-id="${id}"><div class="li">${avi(icn,cls==='d'?'d':cls==='o'?'ok':cls==='g'?'g':'st')}<div class="t"><b>${esc(title)}</b><div class="mut">${esc(sub)}</div></div><div class="a">${right}</div></div>${extra||''}</div>`;

/* ======================= چک ======================= */
function chqStatus(c){return c.st==='done'?(c.dir==='in'?'وصول شد':'پاس شد'):c.st==='bounced'?'برگشت خورد':'باز';}
function vChq(){
  const f=route.f||'open',all=live(S.chq||[]);
  const open=all.filter(c=>c.st==='open'),sumIn=open.filter(c=>c.dir==='in').reduce((a,c)=>a+c.amt,0),sumOut=open.filter(c=>c.dir==='out').reduce((a,c)=>a+c.amt,0);
  const nextC=open.slice().sort((a,b)=>a.due<b.due?-1:1)[0];
  let h=`<div class="plate"><div class="big">چک‌های باز</div><small>دریافتی (دست ما): ${money(sumIn)}</small><small>پرداختی ما (دست دیگران): ${money(sumOut)}</small>${nextC?`<small>نزدیک‌ترین سررسید: ${esc(nextC.party)} — ${jstr(nextC.due)} (${rel(nextC.due)})</small>`:''}</div>`;
  h+=`<div class="row" style="margin:0 0 10px"><button class="btn pri" data-a="newChq" data-dir="in">چک دریافتی جدید</button><button class="btn" data-a="newChq" data-dir="out">چک پرداختی جدید</button></div>`;
  h+=tabs([['open','باز'],['in','دریافتی'],['out','پرداختی'],['done','پایان‌یافته']],f);
  let list=all.filter(c=>f==='open'?c.st==='open':f==='in'?c.dir==='in'&&c.st==='open':f==='out'?c.dir==='out'&&c.st==='open':c.st!=='open');
  list.sort((a,b)=>f==='done'?(a.due<b.due?1:-1):(a.due<b.due?-1:1));
  h+=list.length?list.map(c=>{const dl=c.st==='open'?dueLabel(c.due):['','o'];return rowH(c.dir==='in'?'down':'up',c.st==='open'?dl[1]||(c.dir==='in'?'o':'d'):'o',(c.dir==='in'?'از ':'به ')+c.party,[jstr(c.due),c.st==='open'?rel(c.due):chqStatus(c),c.bank,c.no?'شماره '+fa(c.no):''].filter(Boolean).join(' · '),fmt(c.amt),'chqd',c.id);}).join(''):'<div class="empty">چکی در این بخش نیست</div>';
  return h;
}
function vChqd(){
  const c=S.chq.find(x=>x.id===route.id);if(!c||c.del)return '<div class="empty">پیدا نشد</div>';
  const open=c.st==='open',tx=c.txid&&S.tx.find(t=>t.id===c.txid&&!t.del);
  let h=`<div class="pan edge ${open?(dueLabel(c.due)[1]||'g'):c.st==='done'?'o':'d'}"><div class="li"><b style="font-size:17px">${c.dir==='in'?'چک دریافتی (دست ماست)':'چک پرداختی ما (دست دیگران)'}</b><button class="btn sm" data-a="editChq" data-id="${c.id}">ویرایش</button></div>
  <div style="font-size:24px;font-weight:800;margin:8px 0">${fmt(c.amt)} <span style="font-size:14px">تومان</span></div>
  <div class="kv"><span>${c.dir==='in'?'از':'به'}</span><b>${esc(c.party)}</b></div>
  <div class="kv"><span>سررسید</span><b>${jstr(c.due)}${open?' ('+rel(c.due)+')':''}</b></div>
  <div class="kv"><span>وضعیت</span><b>${chqStatus(c)}</b></div>
  ${c.bank?`<div class="kv"><span>بانک</span><b>${esc(c.bank)}</b></div>`:''}${c.no?`<div class="kv"><span>شمارهٔ چک</span><b>${fa(esc(c.no))}</b></div>`:''}${c.note?`<div class="kv"><span>توضیح</span><b>${esc(c.note)}</b></div>`:''}
  ${tx?`<div class="kv tap" data-a="txd" data-id="${tx.id}"><span>تراکنش ثبت‌شده</span><b style="color:var(--st)">مشاهده</b></div>`:''}</div>`;
  if(open)h+=`<div class="row"><button class="btn pri" data-a="chqDone" data-id="${c.id}">${c.dir==='in'?'وصول شد':'پاس شد'}</button><button class="btn dng" data-a="chqBounce" data-id="${c.id}">برگشت خورد</button></div><div class="row"><button class="btn" data-a="chqIcs" data-id="${c.id}">افزودن یادآوری به تقویم گوشی</button></div>`;
  else h+=`<div class="row"><button class="btn" data-a="chqReopen" data-id="${c.id}">بازگرداندن به حالت باز</button></div>`;
  h+=`<div class="row"><button class="btn dng" data-a="delChq" data-id="${c.id}">حذف چک</button></div>`;
  return h;
}
function fChq(rec,dir){
  const r=rec||{};dir=r.dir||dir||'in';
  sheet(rec?'ویرایش چک':'چک جدید',`
  <div class="f"><label class="l">نوع چک</label><select name="dir">${optsL([['in','دریافتی از مشتری (چک در دست ماست)'],['out','پرداختی ما (چک ما دست دیگران است)']],dir)}</select></div>
  <div class="f"><label class="l">نام طرف حساب</label><input name="party" list="cn" value="${esc(r.party)}"><datalist id="cn">${custNames().map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
  <div class="f"><label class="l">مبلغ</label>${amt('amt',r.amt)}</div>
  <div class="f"><label class="l">تاریخ سررسید</label>${jdate('due',r.due||today())}</div>
  <div class="f"><label class="l">شمارهٔ چک (اختیاری)</label><input name="no" inputmode="numeric" value="${esc(r.no)}"></div>
  <div class="f"><label class="l">بانک (اختیاری)</label><input name="bank" value="${esc(r.bank)}"></div>
  <div class="f"><label class="l">توضیح</label><input name="note" value="${esc(r.note)}"></div>
  <div class="hint">دو روز قبل از سررسید و در خود روز یادآوری می‌شود.</div>`,fd=>{
    const a=num(fd,'amt'),party=(fd.get('party')||'').trim();if(!a||!party)return 'نام و مبلغ را وارد کنید';
    put('chq',{...r,id:r.id||uid(),dir:fd.get('dir'),party,amt:a,due:readJ(fd,'due')||today(),no:(fd.get('no')||'').trim(),bank:(fd.get('bank')||'').trim(),note:(fd.get('note')||'').trim(),st:r.st||'open'});
    logit((rec?'ویرایش':'ثبت')+' چک '+(fd.get('dir')==='in'?'دریافتی ':'پرداختی ')+fmt(a)+' '+party);xCheck();
  },rec?{del:()=>{r.del=true;put('chq',r);logit('حذف چک');lastPut=null;}}:null);
}
function chqDone(id){
  const c=S.chq.find(x=>x.id===id),inn=c.dir==='in';
  sheet(inn?'ثبت وصول چک':'ثبت پاس شدن چک',`
  <div class="f"><label class="l">${inn?'به کدام حساب نشست؟':'از کدام حساب پرداخت شد؟'}</label><select name="acc">${accOpts(S.set.who,!inn)}</select></div>
  ${inn?`<div class="f"><label class="l">مربوط به کدام سفارش؟ (اختیاری)</label><select name="oid">${ordOpts('','— بدون سفارش —')}</select></div>`:''}
  <div class="f"><label class="l">تاریخ</label>${jdate('d',today())}</div>
  <div class="hint">مبلغ ${fmt(c.amt)} تومان خودکار در ${inn?'دریافتی‌ها':'هزینه‌ها'} ثبت می‌شود.</div>`,fd=>{
    const tx={id:uid(),t:inn?'in':'out',a:c.amt,acc:fd.get('acc'),oid:inn?(fd.get('oid')||''):'',d:readJ(fd,'d')||today(),note:'چک '+c.party+(c.no?' شمارهٔ '+c.no:''),by:S.set.who,chq:c.id};
    if(inn)tx.kind='pay';else tx.cat='پرداخت چک';
    put('tx',tx);c.st='done';c.txid=tx.id;put('chq',c);logit((inn?'وصول':'پاس شدن')+' چک '+c.party+' '+fmt(c.amt));lastPut=null;
  },{ok:'ثبت'});
}
function chqReopen(id){const c=S.chq.find(x=>x.id===id);if(c.txid){const t=S.tx.find(q=>q.id===c.txid);if(t){t.del=true;put('tx',t);}}c.st='open';c.txid='';put('chq',c);logit('بازگشت چک به حالت باز');lastPut=null;render();xCheck();}

/* ======================= یادداشت ======================= */
function vNotes(){
  const list=live(S.notes||[]);const open=list.filter(n=>!n.done).sort((a,b)=>(b.u||0)-(a.u||0)),done=list.filter(n=>n.done).sort((a,b)=>(b.u||0)-(a.u||0));
  let h=`<div class="row" style="margin:0 0 10px"><button class="btn pri" data-a="newNote">یادداشت جدید</button></div>`;
  const row=n=>`<div class="pan edge ${n.done?'o':n.rem?'g':''} tap" data-a="editNote" data-id="${n.id}"><div class="li">${avi('note',n.done?'ok':n.rem?'g':'st')}<div class="t"><b>${esc(n.title||(n.text||'').slice(0,40)||'یادداشت')}</b><div class="mut">${esc((n.text||'').slice(0,90))}${n.rem?'<br>⏰ '+jstr(n.rem.slice(0,10))+' ساعت '+fa(n.rem.slice(11,16)):''}</div></div></div></div>`;
  h+=open.length?open.map(row).join(''):'<div class="empty">یادداشتی ثبت نشده. با «یادداشت جدید» شروع کن.</div>';
  if(done.length)h+=`<h2>انجام‌شده</h2>`+done.map(row).join('');
  return h;
}
function fNote(rec){
  const r=rec||{};
  sheet(rec?'ویرایش یادداشت':'یادداشت جدید',`
  <div class="f"><label class="l">عنوان (اختیاری)</label><input name="title" value="${esc(r.title)}"></div>
  <div class="f"><label class="l">متن یادداشت</label><textarea name="text" rows="4">${esc(r.text)}</textarea></div>
  <div class="f"><label class="l">یادآوری در تاریخ (اختیاری)</label>${jdate('rd',r.rem?r.rem.slice(0,10):'',true)}</div>
  <div class="f"><label class="l">ساعت یادآوری</label><input type="time" name="rt" value="${esc(r.rem?r.rem.slice(11,16):'09:00')}"></div>
  <div class="chips"><label><input type="checkbox" name="done" ${r.done?'checked':''}><span>انجام شد</span></label></div>`,fd=>{
    const text=(fd.get('text')||'').trim(),title=(fd.get('title')||'').trim();if(!text&&!title)return 'چیزی بنویسید';
    const rd=readJ(fd,'rd');const rem=rd?rd+'T'+(fd.get('rt')||'09:00'):'';
    put('notes',{...r,id:r.id||uid(),title,text,rem,done:!!fd.get('done')});logit((rec?'ویرایش':'ثبت')+' یادداشت');xCheck();
  },rec?{del:()=>{r.del=true;put('notes',r);logit('حذف یادداشت');lastPut=null;}}:null);
}

/* ======================= نوبت ======================= */
function fAppt(rec,ds){
  const r=rec||{};
  sheet(rec?'ویرایش نوبت':'نوبت جدید',`
  <div class="f"><label class="l">نام مشتری / موضوع</label><input name="title" list="cn2" value="${esc(r.title)}"><datalist id="cn2">${custNames().map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||ds||today())}</div>
  <div class="f"><label class="l">ساعت (اختیاری)</label><input type="time" name="time" value="${esc(r.time)}"></div>
  <div class="f"><label class="l">توضیح (مثلاً نوع جلسه، تعداد نفرات، پیش‌پرداخت)</label><textarea name="note" rows="3">${esc(r.note)}</textarea></div>
  <div class="hint">دو روز قبل و صبح همان روز یادآوری می‌شود.</div>`,fd=>{
    const title=(fd.get('title')||'').trim();if(!title)return 'نام یا موضوع را بنویسید';
    put('appt',{...r,id:r.id||uid(),title,d:readJ(fd,'d')||today(),time:fd.get('time')||'',note:(fd.get('note')||'').trim()});logit((rec?'ویرایش':'ثبت')+' نوبت «'+title+'»');xCheck();
  },rec?{del:()=>{r.del=true;put('appt',r);logit('حذف نوبت «'+r.title+'»');lastPut=null;}}:null);
}

/* ======================= تقویم و روز ======================= */
function vCal(){
  const t=toJ(today()),ym=route.ym||[t[0],t[1]],cy=ym[0],cm=ym[1];
  const first=j2g(cy,cm,1),fd=new Date(first[0],first[1]-1,first[2]),off=(fd.getDay()+1)%7,len=jmLen(cy,cm),td=today();
  const pm=cm===1?[cy-1,12]:[cy,cm-1],nx=cm===12?[cy+1,1]:[cy,cm+1];
  const mark={};const mk=(ds,k)=>{(mark[ds]=mark[ds]||{})[k]=1;};
  live(S.appt||[]).forEach(a=>mk(a.d,'a'));live(S.chq||[]).filter(c=>c.st==='open').forEach(c=>mk(c.due,'c'));live(S.notes||[]).filter(n=>n.rem&&!n.done).forEach(n=>mk(n.rem.slice(0,10),'n'));live(S.pay||[]).filter(x=>x.due&&brest(x)>0).forEach(x=>mk(x.due,'c'));
  let h=`<div class="li" style="margin-bottom:10px"><button class="ib" style="background:var(--stbg);color:var(--st)" data-a="calNav" data-y="${nx[0]}" data-m="${nx[1]}" aria-label="ماه بعد">${ic('back').replace('<svg class="ic "','<svg class="ic " style="transform:rotate(180deg)"')}</button><div style="text-align:center"><b style="font-size:18px">${MONTHS[cm-1]} ${fa(cy)}</b></div><button class="ib" style="background:var(--stbg);color:var(--st)" data-a="calNav" data-y="${pm[0]}" data-m="${pm[1]}" aria-label="ماه قبل">${ic('back')}</button></div>`;
  h+=`<div class="cgrid">${['ش','ی','د','س','چ','پ','ج'].map((n,i)=>`<div class="cw ${i===6?'f':''}">${n}</div>`).join('')}`;
  for(let i=0;i<off;i++)h+='<div></div>';
  for(let d=1;d<=len;d++){const ds=jiso(cy,cm,d),info=dayInfo(ds),m=mark[ds]||{};
    h+=`<div class="cd ${ds===td?'t':''} ${info.off?'h':''}" data-a="day" data-id="${ds}">${fa(d)}<span class="dots">${info.occ.length?'<i class="g"></i>':''}${m.a?'<i class="b"></i>':''}${m.c?'<i class="r"></i>':''}${m.n?'<i class="p"></i>':''}</span></div>`;}
  h+=`</div><div class="hint" style="margin-top:8px"><i class="dot g"></i> مناسبت &nbsp; <i class="dot b"></i> نوبت &nbsp; <i class="dot r"></i> چک/بدهی &nbsp; <i class="dot p"></i> یادداشت &nbsp; — قرمز: جمعه و تعطیل رسمی</div>`;
  if(!(cy===t[0]&&cm===t[1]))h+=`<div class="row"><button class="btn sm" data-a="calNav" data-y="${t[0]}" data-m="${t[1]}">برگشت به این ماه</button></div>`;
  h+=`<div class="row" style="margin:6px 0 4px"><button class="btn pri" data-a="newAppt">نوبت جدید</button></div>`;
  const evs=[];for(let d=1;d<=len;d++){const ds=jiso(cy,cm,d),info=dayInfo(ds);info.occ.forEach(o=>evs.push({d,ds,t:o.t,hol:o.hol,big:o.big}));live(S.appt||[]).filter(a=>a.d===ds).forEach(a=>evs.push({d,ds,t:'نوبت: '+a.title+(a.time?' ('+timeStr(a.time)+')':''),ap:1}));}
  h+=`<h2>رویدادهای ${MONTHS[cm-1]}</h2>`+(evs.length?`<div class="pan">${evs.map(e=>`<div class="kv tap" data-a="day" data-id="${e.ds}"><span>${fa(e.d)} ${MONTHS[cm-1]} — ${esc(e.t)}</span><b class="${e.hol?'deb':''}">${e.hol?'تعطیل':e.big?'مهم':e.ap?'نوبت':''}</b></div>`).join('')}</div>`:'<div class="empty">رویدادی نیست</div>');
  return h;
}
function vDay(){
  const ds=route.id||today(),info=dayInfo(ds),j=toJ(ds);
  let h=`<div class="plate"><div class="big">${DN[wd(ds)]} ${fa(j[2])} ${MONTHS[j[1]-1]} ${fa(j[0])}</div><small>${info.hol?'تعطیل رسمی':info.fri?'جمعه (تعطیل هفتگی)':ds===today()?'امروز':rel(ds)}</small></div>`;
  if(info.occ.length)h+=info.occ.map(o=>`<div class="pan edge ${o.hol?'d':'g'}"><div class="li">${avi('star',o.hol?'d':'g')}<div class="t"><b>${esc(o.t)}</b><div class="mut">${o.hol?'تعطیل رسمی':o.big?'مناسبت مهم':'مناسبت'}${o.k==='h'?' · تاریخ قمری تقریبی':''}</div></div></div>${o.i?`<div style="margin-top:8px">${esc(o.i)}</div>`:''}</div>`).join('');
  if(info.idea)h+=`<div class="pan edge st"><div class="li">${avi('bulb','g')}<div class="t"><b>ایدهٔ این روز</b></div></div><div style="margin-top:8px">${esc(info.idea)}</div></div>`;
  const ap=live(S.appt||[]).filter(a=>a.d===ds).sort((a,b)=>(a.time||'')<(b.time||'')?-1:1);
  h+=`<h2>نوبت‌ها</h2>`+(ap.length?ap.map(a=>`<div class="pan edge tap" data-a="editAppt" data-id="${a.id}"><div class="li">${avi('cal','st')}<div class="t"><b>${esc(a.title)}</b><div class="mut">${a.time?'ساعت '+timeStr(a.time):'بدون ساعت'}${a.note?' · '+esc(a.note.slice(0,60)):''}</div></div></div></div>`).join(''):'<div class="empty">نوبتی ثبت نشده</div>')+`<div class="row"><button class="btn pri" data-a="newAppt" data-d="${ds}">نوبت جدید برای این روز</button></div>`;
  const cq=live(S.chq||[]).filter(c=>c.due===ds&&c.st==='open');
  if(cq.length)h+=`<h2>چک‌های این روز</h2>`+cq.map(c=>rowH(c.dir==='in'?'down':'up',c.dir==='in'?'o':'d',(c.dir==='in'?'از ':'به ')+c.party,c.dir==='in'?'چک دریافتی':'چک پرداختی ما',fmt(c.amt),'chqd',c.id)).join('');
  const nt=live(S.notes||[]).filter(n=>n.rem&&n.rem.slice(0,10)===ds);
  if(nt.length)h+=`<h2>یادداشت‌های این روز</h2>`+nt.map(n=>`<div class="pan edge g tap" data-a="editNote" data-id="${n.id}"><b>${esc(n.title||(n.text||'').slice(0,50))}</b><div class="mut">ساعت ${fa(n.rem.slice(11,16))}</div></div>`).join('');
  const dbt=live(S.pay||[]).filter(x=>x.due===ds&&brest(x)>0);
  if(dbt.length)h+=`<h2>بدهی‌های این روز</h2>`+dbt.map(x=>rowH('bank','d',x.name,'سررسید بدهی',fmt(brest(x)),'bdebtd',x.id)).join('');
  return h;
}

/* ======================= انبار ======================= */
function stockCalc(){
  const items={};live(S.sitems||[]).forEach(i=>items[i.id]={i,q:0,avg:0,sold:0,rev:0,nom:0,real:0,since:0,last:''});
  const sale={};
  live(S.smov||[]).filter(m=>items[m.iid]).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:(a.u||0)-(b.u||0)).forEach(m=>{
    const x=items[m.iid];
    if(m.t==='buy'){const tot=Math.max(0,x.q)*x.avg+m.q*m.p;x.q+=m.q;x.avg=x.q>0?tot/x.q:m.p;x.since=0;x.last=m.d;}
    else if(m.t==='sale'){const repl=m.repl||x.i.repl||x.avg,cost=x.avg;const nom=m.q*(m.p-cost),real=m.q*(m.p-repl);sale[m.id]={cost,repl,nom,real};x.q-=m.q;x.sold+=m.q;x.rev+=m.q*m.p;x.nom+=nom;x.real+=real;x.since+=m.q;}
    else x.q+=m.q;
  });
  return{items,sale};
}
const stockVal=(sc)=>Object.values(sc.items).reduce((a,x)=>[a[0]+Math.max(0,x.q)*(x.avg||x.i.repl||0),a[1]+Math.max(0,x.q)*(x.i.sell||0)],[0,0]);
function vStock(){
  const sc=stockCalc(),f=route.f||'all',all=Object.values(sc.items),cats=[...new Set(all.map(x=>x.i.cat||'بدون دسته'))];
  const[val,sv]=stockVal(sc);
  let h=`<div class="plate"><div class="big">ارزش انبار: ${money(val)}</div><small>به قیمت خرید. به قیمت فروش: ${money(sv)}</small></div>`;
  h+=tiles([['newSale','up','ok','ثبت فروش'],['newBuy','down','d','ثبت خرید'],['newSItem','plus','st','کالای جدید']]);
  h+=`<div class="row" style="margin:0 0 10px"><button class="btn sm" data-a="bulk">افزایش قیمت (تورم)</button><button class="btn sm" data-a="buylist">لیست خرید</button><button class="btn sm" data-a="srep">گزارش سود</button></div>`;
  if(cats.length>1)h+=tabs([['all','همه']].concat(cats.map(c=>[c,c])),f);
  const list=all.filter(x=>f==='all'||(x.i.cat||'بدون دسته')===f).sort((a,b)=>(a.i.name>b.i.name?1:-1));
  h+=list.length?list.map(x=>{const low=x.i.min&&x.q<=x.i.min,pn=(x.i.sell||0)-(x.avg||0),pr=(x.i.sell||0)-(x.i.repl||x.avg||0);
    return `<div class="pan edge ${low?'d':'o'} tap" data-a="item" data-id="${x.i.id}"><div class="li">${avi('box',low?'d':'ok')}<div class="t"><b>${esc(x.i.name)}</b><div class="mut">${esc(x.i.cat||'بدون دسته')} · فروش ${fmt(x.i.sell||0)} · سود واقعی ${money(pr)}</div></div><div class="a ${low?'deb':''}">${fa(x.q)} ${esc(x.i.unit||'عدد')}${low?'<div class="mut deb">کم است</div>':''}</div></div></div>`;}).join(''):'<div class="empty">هنوز کالایی ثبت نشده. «کالای جدید» را بزن.</div>';
  return h;
}
function vItem(){
  const sc=stockCalc(),x=sc.items[route.id];if(!x)return '<div class="empty">پیدا نشد</div>';
  const i=x.i,pn=(i.sell||0)-x.avg,pr=(i.sell||0)-(i.repl||x.avg);
  const mv=live(S.smov||[]).filter(m=>m.iid===i.id).sort((a,b)=>a.d<b.d?1:-1);
  let h=`<div class="pan edge ${i.min&&x.q<=i.min?'d':'o'}"><div class="li"><b style="font-size:17px">${esc(i.name)}</b><button class="btn sm" data-a="editSItem" data-id="${i.id}">ویرایش</button></div><div class="mut">${esc(i.cat||'بدون دسته')}</div>
  <div class="kv"><span>موجودی</span><b>${fa(x.q)} ${esc(i.unit||'عدد')}${i.min?' (حداقل '+fa(i.min)+')':''}</b></div>
  <div class="kv"><span>میانگین قیمت خرید قبلی</span><b>${money(Math.round(x.avg))}</b></div>
  <div class="kv"><span>قیمت خرید جدید (جایگزین)</span><b>${money(i.repl||0)}</b></div>
  <div class="kv"><span>قیمت فروش</span><b>${money(i.sell||0)}</b></div>
  <div class="kv"><span>سود هر عدد (اسمی)</span><b class="${pn>=0?'okc':'deb'}">${money(Math.round(pn))}</b></div>
  <div class="kv"><span>سود هر عدد (واقعی، با تورم)</span><b class="${pr>=0?'okc':'deb'}">${money(Math.round(pr))}</b></div>
  <div class="kv"><span>جمع فروش تاکنون</span><b>${fa(x.sold)} عدد — ${money(x.rev)}</b></div>
  <div class="kv"><span>سود کل (اسمی / واقعی)</span><b>${money(Math.round(x.nom))} / ${money(Math.round(x.real))}</b></div></div>`;
  h+=tiles([['newSale','up','ok','فروش'],['newBuy','down','d','خرید'],['adjust','swap','g','تعدیل موجودی']],i.id);
  h+=`<h2>گردش کالا</h2><div class="hint">برای ویرایش یا حذف روی هر مورد بزنید</div>`+(mv.length?mv.map(m=>{const s=sc.sale[m.id];return `<div class="pan edge ${m.t==='sale'?'o':m.t==='buy'?'d':'g'} tap" data-a="editMove" data-id="${m.id}"><div class="li">${avi(m.t==='sale'?'up':m.t==='buy'?'down':'swap',m.t==='sale'?'ok':m.t==='buy'?'d':'g')}<div class="t"><b>${m.t==='sale'?'فروش':m.t==='buy'?'خرید':'تعدیل'} ${fa(m.q)}</b><div class="mut">${jstr(m.d)}${m.t!=='adj'?' · هر عدد '+fmt(m.p):''}${s?' · سود اسمی '+fmt(Math.round(s.nom))+' / واقعی '+fmt(Math.round(s.real)):''}${m.cust?' · '+esc(m.cust):''}</div></div></div></div>`;}).join(''):'<div class="empty">گردشی ثبت نشده</div>');
  h+=`<div class="row"><button class="btn dng" data-a="delSItem" data-id="${i.id}">حذف کالا</button></div>`;
  return h;
}
function fSItem(rec){
  const r=rec||{},cats=[...new Set(live(S.sitems||[]).map(i=>i.cat).filter(Boolean))];
  sheet(rec?'ویرایش کالا':'کالای جدید',`
  <div class="f"><label class="l">نام کالا</label><input name="name" value="${esc(r.name)}"></div>
  <div class="f"><label class="l">سربرگ / دسته (مثلاً قاب، آلبوم)</label><input name="cat" list="cats" value="${esc(r.cat)}"><datalist id="cats">${cats.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
  <div class="f"><label class="l">واحد (عدد، متر، بسته …)</label><input name="unit" value="${esc(r.unit||'عدد')}"></div>
  ${rec?'':`<div class="f"><label class="l">موجودی فعلی</label><input name="q" inputmode="numeric" value="۰"></div>`}
  <div class="f"><label class="l">${rec?'قیمت خرید جدید (جایگزین)':'قیمت خرید هر عدد'}</label>${amt('repl',rec?r.repl:0)}</div>
  <div class="f"><label class="l">قیمت فروش هر عدد</label>${amt('sell',r.sell)}</div>
  <div class="f"><label class="l">حداقل موجودی (برای هشدار و لیست خرید)</label><input name="min" inputmode="numeric" value="${r.min?fa(r.min):''}"></div>`,fd=>{
    const name=(fd.get('name')||'').trim();if(!name)return 'نام کالا را بنویسید';
    const n2=s=>parseInt(en(s||'').replace(/\D/g,''),10)||0;
    const it={...r,id:r.id||uid(),name,cat:(fd.get('cat')||'').trim(),unit:(fd.get('unit')||'عدد').trim(),repl:num(fd,'repl'),sell:num(fd,'sell'),min:n2(fd.get('min'))};
    put('sitems',it);
    if(!rec&&n2(fd.get('q'))>0)put('smov',{id:uid(),iid:it.id,t:'buy',q:n2(fd.get('q')),p:it.repl,d:today()});
    logit((rec?'ویرایش':'ثبت')+' کالا «'+name+'»');lastPut=rec?lastPut:{col:'sitems',id:it.id};
  },rec?{del:()=>{delItem(r);}}:null);
}
function delItem(it){it.del=true;put('sitems',it);live(S.smov||[]).filter(m=>m.iid===it.id).forEach(m=>{m.del=true;put('smov',m);});logit('حذف کالا «'+it.name+'»');lastPut=null;if(route.v==='item')history.back();}
function fMove(type,iid,rec){
  const items=live(S.sitems||[]);if(!items.length){toast('اول یک کالا اضافه کنید');return fSItem();}
  const r=rec||{};type=r.t||type;iid=r.iid||iid||items[0].id;
  const it=items.find(x=>x.id===iid)||items[0],sale=type==='sale',adj=type==='adj';
  const linked=r.txid&&S.tx.find(t=>t.id===r.txid&&!t.del);
  sheet(rec?'ویرایش':(sale?'ثبت فروش':adj?'تعدیل موجودی':'ثبت خرید'),`
  <div class="f"><label class="l">کالا</label><select name="iid">${optsL(items.map(x=>[x.id,x.name+(x.cat?' ('+x.cat+')':'')]),it.id)}</select></div>
  <div class="f"><label class="l">${adj?'تغییر موجودی (منفی برای کم کردن)':'تعداد'}</label><input name="q" inputmode="${adj?'text':'numeric'}" value="${r.q?fa(r.q):''}"></div>
  ${adj?'':`<div class="f"><label class="l">قیمت هر عدد</label>${amt('p',r.p||(sale?it.sell:it.repl))}</div>`}
  <div class="f"><label class="l">تاریخ</label>${jdate('d',r.d||today())}</div>
  ${sale?`<div class="f"><label class="l">نام مشتری (اختیاری)</label><input name="cust" value="${esc(r.cust)}"></div>`:''}
  ${adj?`<div class="f"><label class="l">توضیح</label><input name="note" value="${esc(r.note)}"></div>`:`<div class="chips"><label><input type="checkbox" name="mk" ${(rec?linked:true)?'checked':''}><span>${sale?'به‌عنوان دریافتی هم ثبت شود':'به‌عنوان هزینه هم ثبت شود'}</span></label></div><div class="f"><label class="l">حساب</label><select name="acc">${accOpts(linked?linked.acc:S.set.who,!sale)}</select></div>`}
  ${!sale&&!adj?`<div class="chips"><label><input type="checkbox" name="np" checked><span>قیمت خرید جدید کالا همین شود</span></label></div>`:''}`,fd=>{
    const x=items.find(q=>q.id===fd.get('iid'));
    const raw=en(fd.get('q')||'').replace('−','-').replace(/[^\d-]/g,''),q=parseInt(raw,10)||0;
    if(!q||(!adj&&q<0))return 'تعداد را درست وارد کنید';
    const d=readJ(fd,'d')||today();
    const mv={...r,id:r.id||uid(),iid:x.id,t:type,q,d};
    if(!adj){mv.p=num(fd,'p');if(!mv.p)return 'قیمت را وارد کنید';}else mv.note=(fd.get('note')||'').trim();
    if(sale){
      const cur0=stockCalc().items[x.id],avail=(cur0?cur0.q:0)+(rec&&rec.iid===x.id&&rec.t==='sale'?rec.q:0);
      if(q>avail&&!confirmOk)return 'موجودی کافی نیست ('+fa(avail)+' '+(x.unit||'عدد')+')';
      mv.cust=(fd.get('cust')||'').trim();mv.repl=r.repl||x.repl||0;
    }
    if(!adj){
      const tot=mv.q*mv.p,acc=fd.get('acc');
      const want=!!fd.get('mk'),ex=r.txid&&S.tx.find(t=>t.id===r.txid);
      const note=(sale?'فروش: ':'خرید: ')+x.name+' ×'+mv.q+(mv.cust?' — '+mv.cust:'');
      if(want){
        const tx=ex?{...ex,del:false}:{id:uid(),by:S.set.who};Object.assign(tx,{t:sale?'in':'out',a:tot,acc,d,note,oid:tx.oid||'',mv:mv.id});if(sale)tx.kind='pay';else tx.cat='خرید کالا';
        put('tx',tx);mv.txid=tx.id;
      }else if(ex){ex.del=true;put('tx',ex);mv.txid='';}
      if(!sale&&fd.get('np')){x.repl=mv.p;put('sitems',x);}
    }
    put('smov',mv);logit((rec?'ویرایش':'ثبت')+' '+(sale?'فروش ':adj?'تعدیل ':'خرید ')+x.name+' ×'+q);lastPut=null;
  },rec?{del:()=>{r.del=true;put('smov',r);if(r.txid){const t=S.tx.find(q=>q.id===r.txid);if(t){t.del=true;put('tx',t);}}logit('حذف گردش کالا');lastPut=null;}}:null);
}
const confirmOk=false;
function fBulk(){
  const sc=stockCalc(),items=Object.values(sc.items).map(x=>x.i),cats=[...new Set(items.map(i=>i.cat||'بدون دسته'))];
  if(!items.length)return toast('کالایی ثبت نشده');
  sheet('افزایش قیمت (تورم)',`
  <div class="f"><label class="l">درصد افزایش</label><input name="pct" inputmode="decimal" value="۲۰"></div>
  <div class="f"><label class="l">روی کدام کالاها؟</label><select name="scope"><option value="all">همهٔ کالاها</option>${cats.map(c=>`<option value="c:${esc(c)}">فقط سربرگ «${esc(c)}»</option>`).join('')}${items.map(i=>`<option value="i:${i.id}">فقط «${esc(i.name)}»</option>`).join('')}</select></div>
  <div class="f"><label class="l">کدام قیمت‌ها بالا برود؟</label><select name="what"><option value="both">قیمت خرید جدید و قیمت فروش</option><option value="repl">فقط قیمت خرید جدید</option><option value="sell">فقط قیمت فروش</option></select></div>
  <div class="f"><label class="l">گرد کردن</label><select name="rnd"><option value="1">بدون گرد کردن</option><option value="1000">نزدیک‌ترین هزار تومان</option><option value="5000" selected>نزدیک‌ترین ۵ هزار تومان</option><option value="10000">نزدیک‌ترین ۱۰ هزار تومان</option></select></div>
  <div class="hint">قیمت‌های خرید قبلی تغییر نمی‌کنند؛ برای همین «سود واقعی» (با تورم) درست محاسبه می‌شود.</div>`,fd=>{
    const pct=parseFloat(en(fd.get('pct')||'').replace('٫','.'));if(!(pct>0))return 'درصد را درست وارد کنید';
    const sc2=fd.get('scope'),what=fd.get('what'),rnd=+fd.get('rnd')||1,k=1+pct/100;
    const hit=items.filter(i=>sc2==='all'||(sc2.startsWith('c:')&&(i.cat||'بدون دسته')===sc2.slice(2))||(sc2.startsWith('i:')&&i.id===sc2.slice(2)));
    hit.forEach(i=>{if(what!=='sell'&&i.repl)i.repl=Math.round(i.repl*k/rnd)*rnd;if(what!=='repl'&&i.sell)i.sell=Math.round(i.sell*k/rnd)*rnd;put('sitems',i);});
    logit('افزایش '+fa(pct)+'٪ قیمت '+fa(hit.length)+' کالا');lastPut=null;toast(fa(hit.length)+' کالا به‌روز شد');
  },{ok:'اعمال افزایش'});
}
function vBuy(){
  const sc=stockCalc();const rows=Object.values(sc.items).map(x=>{const need=x.i.min?Math.max(0,x.i.min-x.q):0,sug=Math.max(need,x.since);return{x,sug};}).filter(r=>r.sug>0);
  const total=rows.reduce((a,r)=>a+r.sug*(r.x.i.repl||r.x.avg||0),0);
  let h=`<div class="plate"><div class="big">لیست خرید پیشنهادی</div><small>بر اساس فروش‌های بعد از آخرین خرید و حداقل موجودی</small><small>برآورد هزینه با قیمت خرید جدید: ${money(total)}</small></div>`;
  h+=rows.length?rows.map(r=>`<div class="pan edge d tap" data-a="item" data-id="${r.x.i.id}"><div class="li">${avi('box','d')}<div class="t"><b>${esc(r.x.i.name)}</b><div class="mut">موجودی ${fa(r.x.q)} · فروخته‌شده از آخرین خرید ${fa(r.x.since)}</div></div><div class="a">${fa(r.sug)} ${esc(r.x.i.unit||'عدد')}<div class="mut">${money(r.sug*(r.x.i.repl||0))}</div></div></div></div>`).join('')+`<div class="row"><button class="btn pri" data-a="shareBuy">ارسال / کپی لیست</button></div>`:'<div class="empty">فعلاً چیزی برای خرید لازم نیست</div>';
  return h;
}
function buyText(){const sc=stockCalc();const rows=Object.values(sc.items).map(x=>{const need=x.i.min?Math.max(0,x.i.min-x.q):0;return{x,sug:Math.max(need,x.since)};}).filter(r=>r.sug>0);return 'لیست خرید '+jstr(today())+'\n'+rows.map(r=>`• ${r.x.i.name}: ${fa(r.sug)} ${r.x.i.unit||'عدد'} (حدود ${fmt(r.sug*(r.x.i.repl||0))})`).join('\n');}
function vSRep(){
  const sc=stockCalc(),mm={},cc={};
  live(S.smov||[]).filter(m=>m.t==='sale'&&sc.sale[m.id]).forEach(m=>{const s=sc.sale[m.id],j=toJ(m.d),k=j[0]*100+j[1],it=sc.items[m.iid],c=it?(it.i.cat||'بدون دسته'):'؟';
    const a=mm[k]=mm[k]||{y:j[0],m:j[1],rev:0,nom:0,real:0};a.rev+=m.q*m.p;a.nom+=s.nom;a.real+=s.real;const b=cc[c]=cc[c]||{rev:0,nom:0,real:0};b.rev+=m.q*m.p;b.nom+=s.nom;b.real+=s.real;});
  const ks=Object.keys(mm).sort().reverse().slice(0,8);
  let h=`<div class="hint">سود اسمی = فروش منهای قیمت خرید واقعی. سود واقعی = فروش منهای قیمت خرید جدید (با تورم).</div>`;
  h+=ks.length?ks.map(k=>{const a=mm[k];return `<div class="pan"><b>${MONTHS[a.m-1]} ${fa(a.y)}</b><div class="kv"><span>فروش</span><b>${money(a.rev)}</b></div><div class="kv"><span>سود اسمی</span><b class="okc">${money(Math.round(a.nom))}</b></div><div class="kv"><span>سود واقعی (با تورم)</span><b class="${a.real>=0?'okc':'deb'}">${money(Math.round(a.real))}</b></div></div>`;}).join(''):'<div class="empty">هنوز فروشی ثبت نشده</div>';
  const cs=Object.entries(cc);if(cs.length)h+=`<h2>به تفکیک سربرگ</h2><div class="pan">${cs.map(([k,v])=>`<div class="kv"><span>${esc(k)}</span><b>${money(Math.round(v.nom))} / ${money(Math.round(v.real))}</b></div>`).join('')}</div><div class="mut">اسمی / واقعی</div>`;
  return h;
}

/* ======================= اعلان‌ها، بیشتر، تنظیمات ======================= */
function vNotif(){
  const now=Date.now(),r=rs();
  if(!route.snap){route.snap=pendingList().map(x=>x.key);}
  const snap=new Set(route.snap),past=buildRem(now-14*864e5,now).sort((a,b)=>b.at-a.at),up=buildRem(now,now+7*864e5).sort((a,b)=>a.at-b.at);
  setTimeout(()=>{seenAll(pendingList());},60);
  const when=x=>jstr(iso(new Date(x.at)))+' '+fa(new Date(x.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}));
  const row=(x,u)=>`<div class="pan edge ${u?'g':''} tap" data-a="xgo" data-v="${x.go.v}" data-id="${x.go.id||''}"><div class="li">${avi('bell',u?'g':'st')}<div class="t"><b>${esc(x.title)}</b><div class="mut">${esc(x.body)}</div><div class="mut">${when(x)}</div></div></div></div>`;
  const perm='Notification' in window?Notification.permission:'none';
  let h=`<div class="pan edge ${perm==='granted'?'o':'g'}"><b>${perm==='granted'?'اعلان سیستم فعال است':'اعلان سیستم خاموش است'}</b><div class="mut">اعلان در همین برنامه همیشه کار می‌کند. برای اعلان وقتی برنامه بسته است، «تقویم گوشی» مطمئن‌ترین راه است.</div><div class="row">${perm==='granted'?'':'<button class="btn sm pri" data-a="enableNotif">فعال‌سازی اعلان</button>'}<button class="btn sm" data-a="icsAll">ساخت یادآوری برای تقویم گوشی</button></div></div>`;
  h+=`<h2>اخیر</h2>`+(past.length?past.slice(0,40).map(x=>row(x,snap.has(x.key))).join(''):'<div class="empty">یادآوری‌ای نیست</div>');
  h+=`<h2>در راه (۷ روز آینده)</h2>`+(up.length?up.slice(0,40).map(x=>row(x,false)).join(''):'<div class="empty">چیزی در راه نیست</div>');
  return h;
}
function vMore(){
  const open=live(S.pay||[]).filter(x=>brest(x)>0),chq=live(S.chq||[]).filter(c=>c.st==='open'),sc=opt.stock()?stockVal(stockCalc()):[0,0];
  const T=(v,i,c,t,s)=>`<div class="pan tap" data-a="go" data-v="${v}"><div class="li">${avi(i,c)}<div class="t"><b>${t}</b><div class="mut">${s||''}</div></div></div></div>`;
  let h=T('bdebt','bank','d','بدهی‌ها (قبض، اجاره، خرید نسیه)',open.length?fa(open.length)+' مورد باز — '+money(open.reduce((a,x)=>a+brest(x),0)):'بدهی بازی نیست');
  h+=T('chq','doc','g','چک‌ها',chq.length?fa(chq.length)+' چک باز':'چک بازی نیست');
  h+=T('notes','note','st','یادداشت‌ها',fa(live(S.notes||[]).filter(n=>!n.done).length)+' یادداشت باز');
  if(opt.stock())h+=T('stock','box','ok','انبار و موجودی کالا','ارزش به قیمت خرید: '+money(sc[0]));
  if(opt.ideas())h+=`<div class="pan tap" data-a="day" data-id="${today()}"><div class="li">${avi('bulb','g')}<div class="t"><b>ایدهٔ امروز</b><div class="mut">پیشنهاد اجرایی برای آتلیه</div></div></div></div>`;
  h+=T('acct','chart','st','تسویه و گزارش','حساب‌ها، گزارش ماهانه، بدهکاران');
  h+=T('notif','bell','g','مرکز اعلان‌ها','یادآوری‌های اخیر و پیش‌رو');
  h+=T('set','gear','st','تنظیمات','انبار، ایده‌ها، مناسبت‌ها، پشتیبان');
  h+=T('books','layers','st','دفترها','تعویض یا ساخت دفتر');
  return h;
}
function fCOcc(){
  sheet('مناسبت دلخواه',`<div class="f"><label class="l">عنوان</label><input name="t"></div><div class="f"><label class="l">تاریخ (هر سال تکرار می‌شود)</label>${jdate('d',today())}</div><div class="chips"><label><input type="checkbox" name="big"><span>یک هفته قبل هم اعلام شود</span></label><label><input type="checkbox" name="hol"><span>تعطیل است</span></label></div><div class="f"><label class="l">پیشنهاد اجرایی (اختیاری)</label><textarea name="i" rows="3"></textarea></div>`,fd=>{
    const t=(fd.get('t')||'').trim();if(!t)return 'عنوان را بنویسید';const j=toJ(readJ(fd,'d')||today());
    S.set.cocc=(S.set.cocc||[]).concat({id:uid(),t,m:j[1],d:j[2],big:!!fd.get('big'),hol:!!fd.get('hol'),i:(fd.get('i')||'').trim()});save();logit('مناسبت دلخواه «'+t+'»');
  });
}
window.xSettings=function(){
  if(!isBiz())return '';
  const sw=(k,l,v,hint)=>`<div class="kv"><span>${l}${hint?`<div class="mut">${hint}</div>`:''}</span><button class="btn sm ${v?'pri':''}" data-a="tog" data-k="${k}">${v?'روشن':'خاموش'}</button></div>`;
  const lo=+S.set.loff||0;
  return `<h2>بخش‌ها و یادآوری</h2><div class="pan">${sw('stock','انبار و موجودی کالا',opt.stock(),'اگر انبار ندارید خاموش کنید')}${sw('ideas','ایدهٔ روزانهٔ آتلیه',opt.ideas(),'هر روز یک پیشنهاد اجرایی')}${sw('occ','مناسبت‌ها در اعلان',opt.occ(),'روزانه و یک هفته قبلِ مناسبت‌های مهم')}${sw('eve','اعلان شب قبل جمعه و تعطیلی',opt.eve())}
  <div class="kv"><span>تنظیم تاریخ مناسبت‌های قمری<div class="mut">اگر با تقویم رسمی یک روز فرق داشت</div></span><div class="row" style="margin:0;flex:none"><button class="btn sm ${lo===-1?'pri':''}" data-a="loff" data-v="-1">۱− روز</button><button class="btn sm ${lo===0?'pri':''}" data-a="loff" data-v="0">۰</button><button class="btn sm ${lo===1?'pri':''}" data-a="loff" data-v="1">۱+ روز</button></div></div>
  <div class="row"><button class="btn sm" data-a="newCOcc">افزودن مناسبت دلخواه</button><button class="btn sm" data-a="icsAll">ساخت یادآوری برای تقویم گوشی</button></div>
  ${(S.set.cocc||[]).map(c=>`<div class="kv tap" data-a="delCOcc" data-id="${c.id}"><span>${esc(c.t)} — ${fa(c.d)} ${MONTHS[c.m-1]}</span><b class="deb">حذف</b></div>`).join('')}</div>`;
};
window.xHomeCard=function(){
  if(!isBiz())return '';
  const ds=today(),info=dayInfo(ds),j=toJ(ds);
  const soon=live(S.chq||[]).filter(c=>c.st==='open'&&dayDiff(ds,c.due)<=7).sort((a,b)=>a.due<b.due?-1:1);
  const apT=live(S.appt||[]).filter(a=>a.d===ds),apN=live(S.appt||[]).filter(a=>a.d>ds&&dayDiff(ds,a.d)<=2).length;
  let h=`<div class="pan edge ${info.off?'d':'g'} tap" data-a="day" data-id="${ds}"><div class="li">${avi('cal',info.off?'d':'g')}<div class="t"><b>امروز: ${DN[wd(ds)]} ${fa(j[2])} ${MONTHS[j[1]-1]}</b><div class="mut">${info.occ.length?esc(occNames(info)):info.fri?'جمعه':'مناسبت خاصی نیست'}${apT.length?' · '+fa(apT.length)+' نوبت امروز':''}${apN?' · '+fa(apN)+' نوبت تا دو روز آینده':''}</div></div></div>${info.idea?`<div style="margin-top:8px;font-size:14px">💡 ${esc(info.idea)}</div>`:''}</div>`;
  if(soon.length)h+=`<div class="pan edge g tap" data-a="go" data-v="chq"><b>چک‌های نزدیک</b>${soon.slice(0,3).map(c=>`<div class="kv"><span>${c.dir==='in'?'از ':'به '}${esc(c.party)} — ${rel(c.due)}</span><b>${fmt(c.amt)}</b></div>`).join('')}</div>`;
  return h;
};
window.xBell=function(){return `<button class="ib bell" data-a="go" data-v="notif" aria-label="اعلان‌ها">${ic('bell')}<span id="bellb" class="bdg" style="display:${XP.pending.length?'block':'none'}">${XP.pending.length>9?'۹+':fa(XP.pending.length)}</span></button>`;};
window.XPLUS=function(){return [['newChq','چک جدید (دریافتی / پرداختی)'],['newAppt','نوبت جدید'],['newNote','یادداشت جدید']].concat(opt.stock()?[['newSale','ثبت فروش کالا'],['newSItem','کالای جدید در انبار']]:[]);};
window.xEditRec=function(lp){
  if(!lp)return false;const col=lp.col;
  if(!['chq','notes','appt','sitems','smov'].includes(col))return false;
  const rec=S[col]&&S[col].find(x=>x.id===lp.id);if(!rec||rec.del)return true;
  if(col==='chq')fChq(rec);else if(col==='notes')fNote(rec);else if(col==='appt')fAppt(rec);else if(col==='sitems')fSItem(rec);else fMove(null,null,rec);
  return true;
};
window.XCRUMB=function(v,t){
  const more=['chq','notes','stock','notif'],T=x=>TITLES[x];
  if(v==='more'||v==='cal')return false;
  if(more.includes(v)){t.push({l:'بیشتر',v:'more'},{l:T(v)});return true;}
  if(v==='chqd'){const c=S.chq.find(x=>x.id===route.id);t.push({l:'بیشتر',v:'more'},{l:T('chq'),v:'chq'},{l:c?c.party:''});return true;}
  if(v==='item'){const i=S.sitems.find(x=>x.id===route.id);t.push({l:'بیشتر',v:'more'},{l:T('stock'),v:'stock'},{l:i?i.name:''});return true;}
  if(v==='buylist'||v==='srep'){t.push({l:'بیشتر',v:'more'},{l:T('stock'),v:'stock'},{l:T(v)});return true;}
  if(v==='day'){t.push({l:T('cal'),v:'cal'},{l:route.id?jstr(route.id):''});return true;}
  if(v==='acct'){t.push({l:'بیشتر',v:'more'},{l:T('acct')});return true;}
  return false;
};

/* ---------- ثبت در برنامه ---------- */
window.kargahExtra=function(){
  if(window.__kx)return;window.__kx=1;
  Object.assign(ICON,{bell:'<path d="M6 17h12l-1.5-2v-4a4.5 4.5 0 00-9 0v4z"/><path d="M10 20a2 2 0 004 0"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',note:'<path d="M5 4h14v12l-5 5H5z"/><path d="M14 21v-5h5M8 9h8M8 13h4"/>',box:'<path d="M3 8l9-5 9 5v9l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',star:'<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z"/>'});
  const views={more:vMore,cal:vCal,day:vDay,chq:vChq,chqd:vChqd,notes:vNotes,stock:vStock,item:vItem,buylist:vBuy,srep:vSRep,notif:vNotif};
  Object.assign(VIEWS,views);
  Object.assign(TITLES,{more:'بیشتر',cal:'تقویم و نوبت‌ها',day:'جزئیات روز',chq:'چک‌ها',chqd:'جزئیات چک',notes:'یادداشت‌ها',stock:'انبار',item:'جزئیات کالا',buylist:'لیست خرید',srep:'گزارش سود کالا',notif:'مرکز اعلان‌ها'});
  ['day','chqd','item','buylist','srep'].forEach(v=>{if(!SUBS.includes(v))SUBS.push(v);SUB_OK[v]=['shop','solo'];});
  ['more','cal','chq','notes','stock','notif','acct'].forEach(v=>SUB_OK[v]=['shop','solo']);
  window.XV=new Set(['more','cal','chq','notes','stock','notif','acct']);
  window.XTAB={more:'more',chq:'more',notes:'more',stock:'more',notif:'more',acct:'more',bdebt:'more',bdebtd:'more',chqd:'more',item:'more',buylist:'more',srep:'more',cal:'cal',day:'cal'};
  const bd=(id)=>S.chq&&S.chq.find(x=>x.id===id);
  Object.assign(A,{
    xf:d=>{route.f=d.f;render();},xgo:d=>{closeSheet();go(d.v,d.id?{id:d.id}:undefined);},
    day:d=>go('day',{id:d.id}),calNav:d=>{route.ym=[+d.y,+d.m];render();},
    newAppt:d=>{closeSheet();fAppt(null,d&&d.d);},editAppt:d=>fAppt(S.appt.find(x=>x.id===d.id)),
    newNote:()=>{closeSheet();fNote();},editNote:d=>fNote(S.notes.find(x=>x.id===d.id)),
    newChq:d=>{closeSheet();fChq(null,d&&d.dir);},editChq:d=>fChq(bd(d.id)),chqd:d=>go('chqd',{id:d.id}),chqDone:d=>chqDone(d.id),
    chqBounce:d=>{const c=bd(d.id);ask('این چک برگشت خورده ثبت شود؟',()=>{c.st='bounced';put('chq',c);logit('برگشت چک '+c.party);lastPut=null;render();});},
    chqReopen:d=>chqReopen(d.id),
    delChq:d=>{const c=bd(d.id);ask('این چک حذف شود؟',()=>{c.del=true;put('chq',c);logit('حذف چک');lastPut=null;history.back();});},
    chqIcs:d=>{const c=bd(d.id),keep=S.chq;const tmp=S.chq;S.chq=[c];const nA=S.appt,nN=S.notes,nP=S.pay,nO=S.ord;S.appt=[];S.notes=[];S.pay=[];S.ord=[];const t=buildIcs();S.chq=tmp;S.appt=nA;S.notes=nN;S.pay=nP;S.ord=nO;dl(new Blob([t],{type:'text/calendar'}),'cheque-'+c.due+'.ics');toast('فایل تقویم ساخته شد');},
    newSItem:()=>{closeSheet();fSItem();},editSItem:d=>fSItem(S.sitems.find(x=>x.id===d.id)),item:d=>go('item',{id:d.id}),
    delSItem:d=>{const it=S.sitems.find(x=>x.id===d.id);ask('کالا «'+it.name+'» با همهٔ گردشش حذف شود؟',()=>delItem(it));},
    newSale:d=>{closeSheet();fMove('sale',d&&d.id);},newBuy:d=>{closeSheet();fMove('buy',d&&d.id);},adjust:d=>fMove('adj',d&&d.id),
    editMove:d=>fMove(null,null,S.smov.find(x=>x.id===d.id)),bulk:()=>fBulk(),buylist:()=>go('buylist'),srep:()=>go('srep'),
    shareBuy:async()=>{const t=buyText();try{if(navigator.share){await navigator.share({text:t});return;}}catch(e){if(e&&e.name==='AbortError')return;}try{await navigator.clipboard.writeText(t);toast('لیست کپی شد');}catch(e){sheet('لیست خرید',`<textarea rows="10" readonly>${esc(t)}</textarea>`,()=>{},{ok:'بستن'});}},
    tog:d=>{const k=d.k,v=opt[k]();S.set[k]=!v;save();Object.keys(occCache).forEach(x=>delete occCache[x]);render();xCheck();},
    loff:d=>{S.set.loff=+d.v;save();Object.keys(occCache).forEach(x=>delete occCache[x]);render();},
    newCOcc:()=>fCOcc(),delCOcc:d=>ask('این مناسبت حذف شود؟',()=>{S.set.cocc=(S.set.cocc||[]).filter(c=>c.id!==d.id);save();Object.keys(occCache).forEach(x=>delete occCache[x]);render();}),
    icsAll:icsDownload,enableNotif
  });
  if(!window.__kxi){window.__kxi=1;setInterval(()=>{if(document.visibilityState==='visible')xCheck();},60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')xCheck();});
    if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.go){const g=e.data.go;route={v:g.v,id:g.id};history.pushState({r:route},'');render();}});}
  const st=document.createElement('style');st.textContent=`.cgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.cw{text-align:center;font-size:12px;color:var(--mut);font-weight:700}.cw.f{color:var(--debt)}.cd{aspect-ratio:1/1.08;border-radius:12px;background:var(--card);border:1px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;cursor:pointer;gap:2px}.cd.t{border:2px solid var(--st);background:var(--stbg)}.cd.h{background:var(--dbg);color:var(--debt)}.dots{display:flex;gap:2px;height:6px}.dots i,.dot{display:inline-block;width:6px;height:6px;border-radius:50%}.dots i.g,.dot.g{background:var(--gold)}.dots i.b,.dot.b{background:var(--st)}.dots i.r,.dot.r{background:var(--debt)}.dots i.p,.dot.p{background:#8a5cc7}.bell{position:relative}.bdg{position:absolute;top:-4px;right:-4px;background:var(--gold);color:#2b2108;font-size:11px;font-weight:800;min-width:18px;height:18px;line-height:18px;border-radius:9px;text-align:center;padding:0 4px}`;document.head.appendChild(st);
};
window.XT={dayInfo,buildRem,buildIcs,stockCalc,fChq,fNote,fAppt,fSItem,fMove,fBulk,chqDone,chqReopen,buyText,jiso,addD};
window.xBoot=function(){
  try{const h=location.hash;if(h.startsWith('#go=')){const g=JSON.parse(decodeURIComponent(h.slice(4)));history.replaceState(null,'',location.pathname);route={v:g.v,id:g.id};render();}}catch(e){}
  xCheck();
};
})();
