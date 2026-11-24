// The save holds event references and cast IDs. Story text stays in the packs.
window.makeCharacterEvents = function (game) {
 const {S, H, hs, wed, hp, mistState, rankOf, relG, relAdd, activePlace, barAdd, sheet, closeSheet, save, feedPush, $, goneHero, setHst} = game;
 const PER_TURN=1, SHOW_MAX=2, GAP=3, CHANCE=.3;
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
  return {b,c,g,heir:(S.kids||[]).find(k=>k.mom===id&&k.adult)?.id};
 }
 function textOf(e) {
  const d=entries[e.id][e.key], v=e.variant;
  if(e.key==='tragedies'){const t=d[v];return {title:t.title,choices:t.choices,body:lines([t.scene,Object.values(t.variants||{})[Number(e.high)],t.dialogue,t.aftermath]).map(s=>s.replace(/侵蝕度直接鎖定(?:深淵| 95\+)/g,'永久留下惡墮印記'))}}
  if(e.key==='battlefieldEncounters')return {title:d.title,choices:d.choices,body:lines(d[v])};
  if(d.stages)return {title:d.title,choices:d.choices,body:lines(d.stages[v]).map(s=>s.replaceAll('{b}／{g}','{peer}'))};
  if(d.contexts)return {title:d.title,body:lines([d.contexts[v],d.dutyConflict.dilemma]),choices:d.choices||[{text:'以職責為先',outcome:d.dutyConflict.choiceDuty,effects:{inf:8,corruption:35}},{text:'以羈絆為先',outcome:d.dutyConflict.choiceBond,effects:{aff:-10}}]};
  const dynamic=d.dynamicVariants;
  const branch=dynamic&&(dynamic[e.high?'highCorruption':'lowCorruption']??Object.entries(dynamic).find(([k])=>k.startsWith(e.favored?'highAffection':'alienated'))?.[1]);
  return {title:d.title,body:lines([d.dynamicOpeners?.[e.opener],d.howSheLearns,d.rumorChain,d.scene,branch,d.aftermathDialogues]),choices:d.choices,follow:d.followUp?.default};
 }
 // Field and captivity outcomes are supplied by the corresponding game hooks.
 function eligible(id,t,cast){
  if(!t)return true;
  const st=hs(id),w=wed(id),m=mistState(id),aff=w?w.fav:st.aff;
  if(t.inPalace!=null&&!!w!==t.inPalace)return false;
  if(t.recruited&&!S.order.includes(id)||t.hasAdultHeir&&!cast.heir)return false;
  if(t.inBranchCity&&!/^\d+_\d+$/.test(activePlace(id)))return false;
  if(t.turnsSinceRecruitMin&&S.t-(st.packRecruitAt??S.t)<t.turnsSinceRecruitMin)return false;
  if(t.turnsSincePalaceMin&&S.t-(st.packPalaceAt??S.t)<t.turnsSincePalaceMin)return false;
  if(t.turnsAwayMin&&S.t-(st.packAwayAt??S.t)<t.turnsAwayMin)return false;
  if(t.corruptionMin&&(m.sealed||m.value<BigInt(t.corruptionMin)))return false;
  if(t.rel_gMin&&(!cast.g||relG(id,cast.g)<t.rel_gMin))return false;
  if(t.rel_bMax!=null&&(!cast.b||relG(id,cast.b)>t.rel_bMax))return false;
  return aff>=(t.affMin??0)&&aff<=(t.affMax??100)&&(hp(id).inf||0)>=(t.infMin??0)&&(S.hedon||0)>=(t.hedonMin??0);
 }
 function enqueue(id,key,variant='',peer=null) {
  if(!entries[id]?.[key])return false;
  const st=hs(id), stamp=JSON.stringify([key,variant,peer]);
  if(st.packSeen?.[stamp])return false;
  const cast=roles(id);if(peer)cast.peer=peer;
  if(!eligible(id,entries[id][key].trigger,cast))return false;
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
    if(!w&&key==='aff'){st.aff=Math.max(0,Math.min(100,(st.aff||0)+n));continue}
    if(!w){const pending=st.packPending??={};pending[key]=(pending[key]||0)+n;continue}
    const dest=key==='aff'?w:hp(id),field=key==='aff'?'fav':'inf';
    dest[field]=Math.max(0,Math.min(100,(dest[field]||0)+n));
   }else if(key==='corruption')st.mist=String(BigInt(st.mist||0)+BigInt(n));
   else if(key==='hedon'||key==='tyranny')barAdd(key,n);
   else if(key.startsWith('rel_'))relAdd(id,cast[key.slice(4)],n);
  }
 }
 // 劇情結果落到遊戲狀態
 function consequence(e,i){const {b,g}=e.cast||{},alive=x=>x&&S.heroes[x]&&!(S.gone&&S.gone[x]);
  if(e.key==='coupAndAftermath'&&alive(b)&&wed(b)){goneHero(b,'exec');(S.dc??={})[b]=(S.dc[b]||0)+1;feedPush('【兵變】'+H(b).n+'死於'+H(e.id).n+'刀下','neg')}
  else if(e.key==='humiliationAbuseRevolt'&&alive(b)&&wed(b)){const w=wed(b);w.cold={t:S.t};w.duty=null;w.fav=Math.max(0,(w.fav||0)-20);setHst(b,'inj',4);feedPush('【私刑】'+H(b).n+'毀容致殘，被丟進冷宮','neg')}
  else if(e.key==='threeContextsAndConflict'&&e.variant!=='battle'&&!entries[e.id][e.key].choices&&alive(g)){
   if(i===0){goneHero(g,'exec');feedPush('【斬友】'+H(g).n+'被'+H(e.id).n+'斬於西門水閘','neg')}
   else{goneHero(g,'exile',12);feedPush('【放走】'+H(g).n+'被'+H(e.id).n+'私放出城，十二旬內不會回來','neg')}}
 }
 function married(id){hs(id).packPalaceAt=S.t;const pending=hs(id).packPending;if(pending){apply(id,pending,{});delete hs(id).packPending}enqueue(id,'firstPowerMove')}
 function show(next,n=0) {
  if(S.packQueue)S.packQueue=S.packQueue.filter(x=>entries[x.id]?.[x.key]&&S.heroes[x.id]&&(x.key==='tragedies'||(!(S.gone&&S.gone[x.id])&&['b','c','g','peer'].every(k=>!x.cast?.[k]||!(S.gone&&S.gone[x.cast[k]])))));
  const e=S.packQueue?.[0];if(!e||n>=SHOW_MAX)return next();
  const d=textOf(e), names=k=>k==='heir'?(S.kids||[]).find(x=>x.id===e.cast[k])?.n:H(e.cast[k])?.n;
  const fill=s=>String(s||'').replace(/\{(\w+)\}/g,(_,k)=>names(k)||'故人');
  const choices=d.choices||[{text:'知道了'}];
  sheet('<h3>'+esc(fill(d.title))+'</h3>'+d.body.map(s=>'<p>'+esc(fill(s))+'</p>').join('')+choices.map((c,i)=>'<button class="btn" id="packChoice'+i+'">'+esc(fill(c.text))+'</button>').join(''),true);
  choices.forEach((c,i)=>$('#packChoice'+i).onclick=()=>{
   if(S.packQueue[0]!==e)return;
   S.packQueue.shift();apply(e.id,c.effects,e.cast);consequence(e,i);
   if(e.key==='tragedies'&&e.variant==='公開羞辱')(hs(e.id).packFlags??={}).permanentFall=true;
   const permanent=e.key==='tragedies'&&entries[e.id].tragedies[e.variant].permanentState;
   if(permanent)(hs(e.id).packStates??={})[permanent.state]=permanent.effect;
   const result=lines([c.outcome,d.follow,permanent?'永久狀態・'+permanent.state+'：'+permanent.effect:null]).map(fill).join(' ');
   feedPush('【'+H(e.id).n+'】'+fill(d.title)+(result?'・'+result:''));save();closeSheet();
   if(!result)return show(next,n+1);
   sheet('<p>'+esc(result)+'</p><button id="packContinue" class="btn">繼續</button>',true);
   $('#packContinue').onclick=()=>{closeSheet();show(next,n+1)};
  });
 }
 function bond(a,b,old,value){
  const stage=value>=60&&old<60?'deepen':value>=25&&old<25?'establish':value<=-40&&old>-40?'break':old<0&&value>=0?'recover':value<25&&old>=25?'waver':'';
  if(stage){enqueue(a,'bondFiveStages',stage,b);enqueue(b,'bondFiveStages',stage,a)}
 }
 function turn(){
  for(const id of S.order.filter(id=>entries[id]?.firstRecruit.trigger)){
   const st=hs(id),loc=activePlace(id);st.packRecruitAt??=S.t;
   if(wed(id))st.packPalaceAt??=S.t;
   if(/^\d+_\d+$/.test(loc)){if(st.packBranch!==loc){st.packBranch=loc;st.packAwayAt=S.t}}
   else {delete st.packBranch;delete st.packAwayAt}
  }
  if((S.packQueue||[]).length>=SHOW_MAX)return;let made=0;
  const ids=S.order.filter(x=>entries[x]&&!(S.gone&&S.gone[x])).sort(()=>Math.random()-.5);
  for(const id of ids){
   if(made>=PER_TURN)break;
   if((hs(id).packT??-99)+GAP>S.t||Math.random()>CHANCE)continue;
   const st=hs(id),w=wed(id),loc=activePlace(id),m=mistState(id);
   const value=m.sealed?0n:m.value, cast=roles(id), rival=cast.b?relG(id,cast.b):0;
   const candidates=[];
   if(!w)candidates.push(['firstRecruit'],['prePalaceLayout']);
   else if(/^\d+_\d+$/.test(loc))candidates.push(['branchCityLetters'],['remoteFaction']);
   else if(loc==='home'&&!w.cold&&!st.hst){
    candidates.push(['firstPowerMove']);
    if(entries[id].firstRecruit.trigger){
     candidates.push(...Object.keys(packs[id].ch2_intrigue).concat(Object.keys(packs[id].ch3_desirePower)).map(key=>[key]));
    }
    if(value>=70n)candidates.push(['corruptionAndFall']);
    if(value>=70n&&(hp(id).inf>=60||S.tyranny>=60))candidates.push(['coupAndAftermath']);
    if(rival<=-20||S.tyranny>=50)candidates.push(['humiliationAbuseRevolt'],['rumorFrameReversal']);
    if(value>=35n||S.hedon>=50)candidates.push(['doubleLoyaltyBetrayal']);
    if(cast.heir)candidates.push(['heirAndFamily']);
    if(w.fav>=60||w.fav<=35)candidates.push(['intimacyJealousy']);
    if(st.packSeen?.[JSON.stringify(['rumorFrameReversal','',null])]&&rival>=0)candidates.push(['cooperateAfterRift']);
    candidates.push(['bondAndDrift'],['factionRecruit'],['threeContextsAndConflict','private'],['threeContextsAndConflict','public']);
   }
   if(candidates.some(args=>enqueue(id,...args))){st.packT=S.t;made++}
  }
 }
 function notice(id,key,record){
  const t=entries[id]?.tragedies?.[tragedy[key]]?.trigger;
  if(t?.captivityTurnsMin&&S.t-(record?.t??S.t)<t.captivityTurnsMin)return;
  if(tragedy[key])enqueue(id,'tragedies',tragedy[key]);if(key==='rescued')enqueue(id,'battlefieldEncounters','rescue')}
 return {enqueue,married,turn,show,bond,notice};
};
