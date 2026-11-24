// The save holds event references and cast IDs. Story text stays in the packs.
window.makeCharacterEvents = function (game) {
 const {S, H, hs, wed, hp, mistState, rankOf, relG, relAdd, activePlace, barAdd, sheet, closeSheet, save, feedPush, $} = game;
 const packs = window.characterPacks;
 const tragedy = {captured:'戰敗被俘', public_shame:'公開羞辱', body_return:'遺體送還', wounded_return:'重傷歸來', survivor_return:'倖存者歸來', pregnancy_return:'懷孕歸來', forced_marriage:'強迫婚籍', private_captive:'私人囚禁', rescued:'營救獲釋', escaped:'自行逃脫'};
 const entries = Object.fromEntries(Object.entries(packs).map(([id,p])=>[id,Object.assign({},p.ch1_entry,p.ch2_intrigue,p.ch3_desirePower,p.ch4_citiesBonds,p.ch5_warAndTragedy)]));
 const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lines = v=>v==null?[]:Array.isArray(v)?v.flatMap(lines):typeof v==='object'?Object.values(v).flatMap(lines):[String(v)];
 function roles(id) {
  const women=S.order.filter(x=>x!==id&&wed(x)&&H(x).sex==='f'&&!x.startsWith('kid'));
  const b=women.slice().sort((x,y)=>rankOf(y)-rankOf(x)||relG(id,x)-relG(id,y)||x.localeCompare(y))[0];
  const c=women.filter(x=>x!==b).sort((x,y)=>Math.abs(relG(id,x))-Math.abs(relG(id,y))||x.localeCompare(y))[0];
  const g=S.order.filter(x=>H(x).sex==='m'&&!x.startsWith('kid')).sort((x,y)=>Number(activePlace(y)===activePlace(id))-Number(activePlace(x)===activePlace(id))||relG(id,y)-relG(id,x)||x.localeCompare(y))[0];
  return {b,c,g,heir:(S.kids||[]).find(k=>k.mom===id)?.id};
 }
 function textOf(e) {
  const d=entries[e.id][e.key], v=e.variant;
  if(e.key==='tragedies'){const t=d[v];return {title:t.title,body:lines([t.scene,Object.values(t.variants||{})[Number(e.high)],t.dialogue,t.aftermath])}}
  if(e.key==='battlefieldEncounters')return {title:d.title,body:lines(d[v])};
  if(d.stages)return {title:d.title,body:lines(d.stages[v]).map(s=>s.replaceAll('{b}／{g}','{peer}'))};
  if(d.contexts)return {title:d.title,body:lines([d.contexts[v],d.dutyConflict.dilemma]),choices:[{text:'以職責為先',outcome:d.dutyConflict.choiceDuty,effects:{inf:3}},{text:'以羈絆為先',outcome:d.dutyConflict.choiceBond,effects:{aff:3}}]};
  const dynamic=d.dynamicVariants;
  const branch=dynamic&&(dynamic[e.high?'highCorruption':'lowCorruption']??Object.entries(dynamic).find(([k])=>k.startsWith(e.favored?'highAffection':'alienated'))?.[1]);
  return {title:d.title,body:lines([d.dynamicOpeners?.[e.opener],d.howSheLearns,d.rumorChain,d.scene,branch,d.aftermathDialogues]),choices:d.choices,follow:d.followUp?.default};
 }
 function enqueue(id,key,variant='',peer=null) {
  if(!entries[id]?.[key])return false;
  const st=hs(id), stamp=JSON.stringify([key,variant,peer]);
  if(st.packSeen?.[stamp])return false;
  const cast=roles(id);if(peer)cast.peer=peer;
  const e={id,key,variant,cast,high:!mistState(id).sealed&&mistState(id).value>=70n,favored:(wed(id)?.fav??st.aff)>=60,opener:(S.tyranny||0)>=60?'tyrannyHigh':(S.hedon||0)>=60?'hedonHigh':'normal'};
  const payload=textOf(e),raw=JSON.stringify(payload);
  if([...raw.matchAll(/\{(\w+)\}/g)].some(m=>!cast[m[1]])||[...raw.matchAll(/"rel_([bgc])"/g)].some(m=>!cast[m[1]]))return false;
  (S.packQueue??=[]).push(e);(st.packSeen??={})[stamp]=true;return true;
 }
 function apply(id,fx,cast) {
  const st=hs(id),w=wed(id);
  for(const [key,n] of Object.entries(fx||{})){
   if(key==='flag'){(st.packFlags??={})[n]=true;continue}
   if(key==='aff'||key==='inf'){
    if(!w){const pending=st.packPending??={};pending[key]=(pending[key]||0)+n;continue}
    const dest=key==='aff'?w:hp(id),field=key==='aff'?'fav':'inf';
    dest[field]=Math.max(0,Math.min(100,(dest[field]||0)+n));
   }else if(key==='corruption')st.mist=String(BigInt(st.mist||0)+BigInt(n));
   else if(key==='hedon'||key==='tyranny')barAdd(key,n);
   else if(key.startsWith('rel_'))relAdd(id,cast[key.slice(4)],n);
  }
 }
 function married(id){const pending=hs(id).packPending;if(pending){apply(id,pending,{});delete hs(id).packPending}enqueue(id,'firstPowerMove')}
 function show(next) {
  const e=S.packQueue?.[0];if(!e)return next();
  const d=textOf(e), names=k=>k==='heir'?(S.kids||[]).find(x=>x.id===e.cast[k])?.n:H(e.cast[k])?.n;
  const fill=s=>String(s||'').replace(/\{(\w+)\}/g,(_,k)=>names(k)||'故人');
  const choices=d.choices||[{text:'知道了'}];
  sheet('<h3>'+esc(fill(d.title))+'</h3>'+d.body.map(s=>'<p>'+esc(fill(s))+'</p>').join('')+choices.map((c,i)=>'<button class="btn" id="packChoice'+i+'">'+esc(fill(c.text))+'</button>').join(''),true);
  choices.forEach((c,i)=>$('#packChoice'+i).onclick=()=>{
   if(S.packQueue[0]!==e)return;
   S.packQueue.shift();apply(e.id,c.effects,e.cast);
   if(e.key==='corruptionAndFall')(hs(e.id).packFlags??={}).permanentFall=true;
   const result=lines([c.outcome,d.follow]).map(fill).join(' ');
   feedPush('【'+H(e.id).n+'】'+fill(d.title)+(result?'・'+result:''));save();closeSheet();
   if(!result)return show(next);
   sheet('<p>'+esc(result)+'</p><button id="packContinue" class="btn">繼續</button>',true);
   $('#packContinue').onclick=()=>{closeSheet();show(next)};
  });
 }
 function bond(a,b,old,value){
  const stage=value>=60&&old<60?'deepen':value>=25&&old<25?'establish':value<=-40&&old>-40?'break':old<0&&value>=0?'recover':value<25&&old>=25?'waver':'';
  if(stage){enqueue(a,'bondFiveStages',stage,b);enqueue(b,'bondFiveStages',stage,a)}
 }
 function turn(){
  for(const id of S.order.filter(x=>entries[x])){
   const st=hs(id),w=wed(id),loc=activePlace(id),m=mistState(id);
   const value=m.sealed?0n:m.value, cast=roles(id), rival=cast.b?relG(id,cast.b):0;
   const candidates=[];
   if(!w)candidates.push(['firstRecruit'],['prePalaceLayout']);
   else if(/^\d+_\d+$/.test(loc))candidates.push(['branchCityLetters'],['remoteFaction']);
   else if(loc==='home'&&!w.cold&&!st.hst){
    candidates.push(['firstPowerMove']);
    if(value>=70n)candidates.push(['corruptionAndFall']);
    if(value>=70n&&(hp(id).inf>=60||S.tyranny>=60))candidates.push(['coupAndAftermath']);
    if(rival<=-20||S.tyranny>=50)candidates.push(['humiliationAbuseRevolt'],['rumorFrameReversal']);
    if(value>=35n||S.hedon>=50)candidates.push(['doubleLoyaltyBetrayal']);
    if(cast.heir)candidates.push(['heirAndFamily']);
    if(w.fav>=60||w.fav<=35)candidates.push(['intimacyJealousy']);
    if(st.packSeen?.[JSON.stringify(['rumorFrameReversal','',null])]&&rival>=0)candidates.push(['cooperateAfterRift']);
    candidates.push(['bondAndDrift'],['factionRecruit'],['threeContextsAndConflict','private'],['threeContextsAndConflict','public']);
   }
   candidates.some(args=>enqueue(id,...args));
  }
 }
 function notice(id,key){if(tragedy[key])enqueue(id,'tragedies',tragedy[key]);if(key==='rescued')enqueue(id,'battlefieldEncounters','rescue')}
 return {enqueue,married,turn,show,bond,notice};
};
