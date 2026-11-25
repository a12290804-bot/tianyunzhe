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
 function textOf(e){const r=textOf0(e);if(!r.choices||!r.choices.length){const D=defaults(e);if(D)r.choices=D}return r}
 function textOf0(e) {
  const d=entries[e.id][e.key], v=e.variant;
  if(e.key==='tragedies'){const t=d[v];return {title:t.title,choices:t.choices,body:lines([t.scene,Object.values(t.variants||{})[Number(e.high)],t.dialogue,t.aftermath]).map(s=>s.replace(/侵蝕度直接鎖定(?:深淵| 95\+)/g,'永久留下惡墮印記'))}}
  if(e.key==='battlefieldEncounters')return {title:d.title,choices:d.choices,body:lines(d[v]??d.scene)};
  if(d.stages)return {title:d.title,choices:d.choices,body:lines(d.stages[v]).map(s=>s.replaceAll('{b}／{g}','{peer}'))};
  if(d.contexts)return {title:d.title,body:lines([d.contexts[v],d.dutyConflict.dilemma]),react:d.choices,choices:[{text:'密令她依軍法處置{g}',path:'duty',outcome:d.dutyConflict.choiceDuty,effects:{inf:8,corruption:35}},{text:'暗中示意：{g}的去留由她發落',path:'bond',outcome:d.dutyConflict.choiceBond,effects:{aff:-10}}]};
  const dynamic=d.dynamicVariants;
  const branch=dynamic&&(dynamic[e.high?'highCorruption':'lowCorruption']??Object.entries(dynamic).find(([k])=>k.startsWith(e.favored?'highAffection':'alienated'))?.[1]);
  return {title:d.title,body:lines([d.dynamicOpeners?.[e.opener]??d.dynamicOpeners?.[e.corruptionBand],d.howSheLearns,d.rumorChain,d.scene,branch,d.aftermathDialogues]),choices:d.choices,follow:d.followUp?.default};
 }
 // Field and captivity outcomes are supplied by the corresponding game hooks.
 function eligible(id,t,cast){
  if(!t)return true;
  const st=hs(id),w=wed(id),m=mistState(id),aff=w?w.fav:st.aff;
  if(t.stage==='recruit'||t.stage==='pre_palace'){if(w)return false}
  if(t.stage==='early_harem'&&!w)return false;
  if(t.hasHeir&&!cast.heir||t.stationedAtBranchCity&&!/^\d+_\d+$/.test(activePlace(id)))return false;
  if(t.minCorruption&&(m.sealed||m.value<BigInt(t.minCorruption)))return false;
  if(aff<(t.minAff??0)||(hp(id).inf||0)<(t.minInf??0)||(S.hedon||0)<(t.minHedon??0))return false;
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
  const event=entries[id][key];
  const narrative=typeof event.trigger==='string';
  const st=hs(id), stamp=JSON.stringify(event.trigger?.once||narrative&&!event.stages?[key,'',null]:[key,variant,peer]);
  if(st.packSeen?.[stamp])return false;
  const cast=roles(id);if(peer)cast.peer=peer;
  if(narrative||typeof event[variant]?.trigger==='string'){
   // 這批劇本以 g 表示宮中盟友、c 表示朝臣。只為本場有戲份的角色配對。
   const rolesText=event.roles||event[variant]?.roles||'';
   const ally=cast.c, courtier=cast.g;
   cast.g=rolesText.includes('{g}')?ally:undefined;
   cast.c=rolesText.includes('{c}')?courtier:undefined;
   if(!rolesText.includes('{b}'))cast.b=undefined;
  }
  if(narrative&&key==='heirAndFamily'&&['liurushi','zhangsun'].includes(id)){
   const child=(S.kids||[]).find(k=>k.mom===id&&!k.adult);
   if(!child)return false;
   cast.heir=child.id;
  }else if(narrative&&(key==='heirAndFamily'||id==='liji'&&key==='firstPowerMove')){
   const olderHeir=['liji','xiaji','mibazi'].includes(id);
   const child=(S.kids||[]).find(k=>k.mom!==id&&S.order.includes(k.mom)&&wed(k.mom)&&(id==='jiananfeng'||(olderHeir?!!k.adult:!k.adult)));
   if(!child)return false;
   cast.b=child.mom;cast.heir=child.id;
  }
  if(!eligible(id,event.trigger,cast))return false;
  const e={id,key,variant,cast,high:!mistState(id).sealed&&mistState(id).value>=70n,favored:(wed(id)?.fav??st.aff)>=60,opener:(S.tyranny||0)>=60?'tyrannyHigh':(S.hedon||0)>=60?'hedonHigh':'normal'};
  if(entries[id][key].dynamicOpeners?.lowCorruption){const m=mistState(id);e.corruptionBand=e.high?'highCorruption':!m.sealed&&m.value>=35n?'midCorruption':'lowCorruption'}
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
   }else if(key==='corruption'){const v=BigInt(st.mist||0)+BigInt(n);st.mist=String(v<0n?0n:v)}
   else if(key==='hedon'||key==='tyranny')barAdd(key,n);
   else if(key.startsWith('rel_'))relAdd(id,cast[key.slice(4)],n);
  }
 }
 // 劇情結果落到遊戲狀態

 // 文本沒附選項時，依事件類型補上會改變數值的選項
 function defaults(e){const k=e.key,v=e.variant;
  const T={
   bondAndDrift:[['成全這段情誼',{rel_g:15,aff:3}],['提防兩人走得太近',{rel_g:-12,inf:-3}],['把兩人拆到不同的城',{rel_g:-20,aff:-5},'split']],
   factionRecruit:[['默許她招兵買馬',{inf:10,corruption:5}],['敲打她，別結黨',{inf:-10,aff:-5}],['把那些人收編到你麾下',{rel_g:-10,aff:-3},'absorb']],
   rumorFrameReversal:[['支持她翻案，嚴懲造謠者',{aff:8,rel_b:-20},'punishB'],['各打五十大板',{aff:-3,rel_b:-5}],['偏袒對方，壓下此事',{aff:-12,corruption:10}]],
   cooperateAfterRift:[['讓她們按約定分贓',{inf:5,rel_b:5}],['出面主持公道',{aff:-3,rel_b:10}]],
   corruptionAndFall:[['縱容她，一起沉淪',{aff:10,corruption:20,hedon:4}],['以能量淨化她（30）',{corruption:-40,aff:-3},'purify'],['冷落她一陣子',{aff:-10}]],
   humiliationAbuseRevolt:[['默許，那是她們之間的事',{inf:6,corruption:10},'allow'],['出手制止，救下對方',{aff:-10,rel_b:10},'stop']],
   heirAndFamily:[['站在太子那邊',{aff:-15,inf:-10}],['站在她那邊，斥責太子',{aff:10,inf:8,tyranny:3}],['兩邊安撫，各退一步',{aff:-3}]],
   coupAndAftermath:[['收下她的投名狀',{inf:5}],['怒斥她擅動刀兵',{aff:-8,corruption:10}]],
   doubleLoyaltyBetrayal:[['裝作不知道，讓她繼續',{inf:6,corruption:12}],['當面拆穿',{aff:-10,rel_g:-10}]],
   intimacyJealousy:[['順著她',{aff:10,hedon:2}],['推開她',{aff:-10,corruption:6}]],
   branchCityLetters:[['回信安撫',{aff:6}],['召她回主城',{aff:4},'recall'],['擱著不回',{aff:-6}]],
   remoteFaction:[['默許她在分城坐大',{inf:12,corruption:6}],['派人分她的權',{inf:-12,aff:-6}],['召她回主城',{aff:-3},'recall']],
   firstPowerMove:[['肯定她立的威',{aff:6,inf:8}],['要她收斂',{aff:-6,inf:-4}]],
   prePalaceLayout:[['不動聲色，記下這筆',{aff:3}],['當面警告她',{aff:-8}]],
   battlefieldEncounters:[['嘉獎她',{aff:6,inf:4}],['責備她太冒險',{aff:-4}]],
   bondFiveStages:v==='break'?[['讓她們決裂',{}],['出面調停',{rel_peer:15},'mend']]:v==='waver'?[['隨她去',{}],['提醒她珍惜',{rel_peer:8}]]:[['成全她們',{rel_peer:8}],['冷眼旁觀',{}]],
   tragedies:v==='戰敗被俘'?[['立刻籌措贖金（到「將」頁贖回）',{aff:8}],['發兵營救',{aff:5}],['置之不理',{aff:-15,corruption:20}]]:v==='遺體送還'?[['厚葬，誓報此仇',{}],['草草收殮',{}]]:[['好好安慰她',{aff:8,corruption:-10}],['讓她自己走出來',{corruption:10}]]
  };const L=T[k];return L?L.map(([text,effects,path])=>({text,effects,path})):null}
 // 依玩家選項文字，把處置真正落到她身上
 // 依選項文字找出被處置的配角（{g}{b}{c}），真正處死／下獄／流放／冷宮
 const KILL=/處死|處決|問斬|斬首|斬殺|斬了|斬於|賜死|杖斃|凌遲|梟首|腰斬|車裂|絞殺|鴆殺|誅殺|伏誅|正法|殺了|殺掉|殺之|一劍殺/,NEG=/暫緩|禁止|阻止|不許|免死|赦|饒|救下|攔下|不殺|留他|留她/;
 function castVerdict(text,cast){const s=String(text||'');if(!cast)return{out:[],rest:s};const out=[];let rest=s;
  ['g','b','c'].forEach(k=>{const x=cast[k];if(!x||!H(x)||!S.order.includes(x))return;const re=new RegExp('\\{'+k+'\\}','g');let m;while(m=re.exec(s)){const pos=m.index,end=pos+m[0].length;
   let aftW=s.slice(end,end+18).replace(/^\s+/,'');if(/^(的|之)|^(眼線|副官|心腹|府|外戚|黨羽|一黨|手下|親信|家人|族人|奴僕|侍衛|部下|門客|餘黨|舊部|派|宮人|侍女|爪牙)/.test(aftW))continue;const aft=aftW.split(/[，。；！？]|並|、/)[0];
   const befW=s.slice(Math.max(0,pos-26),pos).split(/[，。；！？]/).pop(),bef=befW.split(/、|並|與|及/).pop();if(NEG.test(bef+aft))continue;
   const hit=re0=>re0.test(bef)||(re0.test(aft)&&/將|把|命|令|以|交由|押/.test(befW)&&aft.search(re0)<=8);const cut=()=>{};
   const nm=H(x).n;if(hit(KILL)){goneHero(x,'exec');out.push('【處死】'+nm+'伏誅');cut();break}
   if(hit(/下獄|收押|打入大牢|打入死牢|死牢|冷牢|囚禁/)){setHst(x,'jail',4);out.push('【下獄】'+nm+'被押入大牢四旬');cut();break}
   if(hit(/流放|逐出|趕出|貶出|驅逐|放逐|廢為庶人/)){goneHero(x,'exile',10);out.push('【流放】'+nm+'被逐出燈塔');cut();break}
   if(hit(/冷宮|冷殿/)&&wed(x)){wed(x).cold=true;out.push('【冷宮】'+nm+'被打入冷宮');cut();break}
   if(hit(/禁足|幽禁/)){setHst(x,'ban',3);out.push('【禁足】'+nm+'禁足三旬');cut();break}}});
  rest=rest.replace(/[^，。；]*\{[gbc]\}[^，。；]*/g,'');return{out,rest}}
 function verdict(id,text,cast){const cv=castVerdict(text,cast);const s=cv.rest,w=wed(id),nm=H(id).n;const pre=cv.out.join(' ');const R0=x=>[pre,x].filter(Boolean).join(' ');
  if(!NEG.test(s)&&/(賜死|處死|處決|杖斃|斬殺|斬首)了?她|將她.{0,4}(處死|處決|賜死|斬首|杖斃)|賜她.{0,3}(白綾|毒酒|鴆酒|自盡)/.test(s)){goneHero(id,'exec');return R0('【處死】'+nm+'被處死')}
  if(/死牢|下獄|掖庭獄|打入大牢|收押/.test(s)){setHst(id,'jail',4);return R0('【下獄】'+nm+'被押入大牢四旬')}
  if(/冷宮/.test(s)&&w){w.cold=true;return R0('【冷宮】'+nm+'被打入冷宮')}
  if(/禁足/.test(s)){setHst(id,'ban',3);return R0('【禁足】'+nm+'禁足三旬')}
  if(/流放|逐出|趕出|貶出/.test(s)){goneHero(id,'exile',10);return R0('【流放】'+nm+'被逐出燈塔，十旬後或許會回來')}
  if(/杖|鞭|軍棍|笞/.test(s)){setHst(id,'inj',2);return R0('【受刑】'+nm+'受刑負傷兩旬')}
  return pre}
 // 劇情結束後還需要你表態的事件
 function follow(e,c,d){const id=e.id,N=H(id).n,G=e.cast&&e.cast.g&&H(e.cast.g)?H(e.cast.g).n:'他',w=wed(id),fv=v=>{if(w)w.fav=Math.max(0,Math.min(100,(w.fav|0)+v));else hs(id).aff=Math.max(0,Math.min(100,(hs(id).aff|0)+v))};
  const mist=v=>{hs(id).mist=String(BigInt(hs(id).mist||0)+BigInt(v)<0n?0n:BigInt(hs(id).mist||0)+BigInt(v))};
  if(e.key==='threeContextsAndConflict'&&c.path){
   if(d.react)return d.react.map(r=>({text:r.text,run:()=>{apply(id,r.effects,e.cast);const v=verdict(id,r.text,e.cast);return [r.outcome,v].filter(Boolean).join(' ')}}));
   return c.path==='duty'?[
    {text:'抱住她，讓她哭出來',run:()=>{fv(8);mist(-10);return N+'在你懷裡第一次失聲痛哭。寵愛 +8、污染 −10'}},
    {text:'論功行賞',run:()=>{hp(id).inf=Math.min(100,(hp(id).inf|0)+10);mist(10);return N+'領了賞，眼神卻更冷了。權勢 +10、污染 +10'}},
    {text:'冷冷收下首級',run:()=>{fv(-5);mist(20);return N+'把刀插回鞘裡，什麼也沒說。寵愛 −5、污染 +20'}}]:[
    {text:'扶她起來，此事不再追究',run:()=>{fv(6);return N+'愣了很久，才低聲謝恩。寵愛 +6'}},
    {text:'杖責二十，以儆效尤',run:()=>{setHst(id,'inj',2);fv(-10);return N+'一聲不吭挨完二十杖。寵愛 −10、負傷兩旬'}},
    {text:'收回兵權，禁足反省',run:()=>{setHst(id,'ban',3);hp(id).inf=Math.max(0,(hp(id).inf|0)-15);return N+'交出兵符，禁足三旬。權勢 −15'}},
    {text:'派兵把'+G+'追回來',run:()=>{const g=e.cast.g;if(S.gone&&S.gone[g]&&S.gone[g].k==='exile')S.gone[g].u=S.t+1;fv(-8);relAdd(id,g,-10);return '追兵出城，'+G+'下旬就會被押回來。'+N+'寵愛 −8'}}];
  }
  if(e.key==='coupAndAftermath')return[
   {text:'把虎符交給她',run:()=>{hp(id).inf=Math.min(100,(hp(id).inf|0)+25);barAdd('hedon',3);return N+'接過虎符，城門的兵都換成了她的人。權勢 +25、昏庸 +3'}},
   {text:'當場拿下她',run:()=>{if(Math.random()<.5){setHst(id,'jail',4);fv(-20);mist(30);return'禁軍一擁而上。'+N+'被押入大牢四旬，寵愛 −20、污染 +30'}goneHero(id,'exile',10);return N+'帶著八百死士殺出宮門，消失在黑霧裡。之後也許能把她找回來'}},
   {text:'各退一步：虎符歸你，兵歸她',run:()=>{hp(id).inf=Math.min(100,(hp(id).inf|0)+10);fv(-5);return N+'冷笑著收下這個交換。權勢 +10、寵愛 −5'}}];
  return null}
 function consequence(e,i,c){const {b,g}=e.cast||{},alive=x=>x&&S.heroes[x]&&!(S.gone&&S.gone[x]);if(c&&c.path)i=c.path==='duty'?0:1;const P=c&&c.path,id=e.id;
  if(P==='punishB'&&alive(b)){setHst(b,'ban',3);feedPush('【翻案】'+H(b).n+'造謠坐實，禁足三旬','neg')}
  if(P==='purify'){if(S.energy>=30)S.energy-=30;else{const st=hs(id);st.mist=String(BigInt(st.mist||0)+40n)}}
  if(P==='recall'){const st=hs(id);if(wed(id))wed(id).pal=null;st.task='idle';delete st.station;delete st.cjob;feedPush('【召回】'+H(id).n+'返回主城')}
  if(P==='split'&&alive(g)){hs(g).task='idle';feedPush('【拆散】'+H(g).n+'被調離')}
  if(P==='absorb'&&alive(g)){hs(g).aff=Math.min(100,(hs(g).aff||0)+10)}
  if(e.key==='coupAndAftermath'&&alive(b)&&wed(b)){goneHero(b,'exec');(S.dc??={})[b]=(S.dc[b]||0)+1;feedPush('【兵變】'+H(b).n+'死於'+H(e.id).n+'刀下','neg')}
  else if(e.key==='humiliationAbuseRevolt'&&alive(b)&&wed(b)&&!(c&&c.path==='stop')){const w=wed(b);w.cold={t:S.t};w.duty=null;w.fav=Math.max(0,(w.fav||0)-20);setHst(b,'inj',4);feedPush('【私刑】'+H(b).n+'毀容致殘，被丟進冷宮','neg')}
  else if(e.key==='threeContextsAndConflict'&&e.variant!=='battle'&&c&&c.path&&alive(g)){
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
   S.packQueue.shift();apply(e.id,c.effects,e.cast);consequence(e,i,c);const vd=c.path?'':verdict(e.id,c.text,e.cast);if(vd)feedPush(vd,'neg');
   if(e.key==='tragedies'&&e.variant==='公開羞辱')(hs(e.id).packFlags??={}).permanentFall=true;
   const permanent=e.key==='tragedies'&&entries[e.id].tragedies[e.variant].permanentState;
   if(permanent)(hs(e.id).packStates??={})[permanent.state]=fill(permanent.effect);
   const result=lines([c.outcome,d.follow,permanent?'永久狀態・'+permanent.state+'：'+permanent.effect:null,vd]).map(fill).join(' ');const F=follow(e,c,d);
   feedPush('【'+H(e.id).n+'】'+fill(d.title)+(result?'・'+result:''));save();closeSheet();
   if(!result&&!F)return show(next,n+1);
   if(F){sheet('<p>'+esc(result)+'</p><div class="small" style="color:var(--gold2);margin:8px 0 4px">你要怎麼做？</div>'+F.map((f,j)=>'<button class="btn '+(j?'ghost':'')+'" style="width:100%;margin-top:6px" id="packF'+j+'">'+esc(fill(f.text))+'</button>').join(''),true);
    F.forEach((f,j)=>$('#packF'+j).onclick=()=>{const r=fill(f.run());feedPush('【'+H(e.id).n+'】'+r);save();closeSheet();sheet('<p>'+esc(r)+'</p><button id="packContinue" class="btn">繼續</button>',true);$('#packContinue').onclick=()=>{closeSheet();show(next,n+1)}});return}
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
    if(typeof entries[id].firstRecruit.trigger==='object'&&entries[id].firstRecruit.trigger){
     candidates.push(...Object.keys(packs[id].ch2_intrigue).concat(Object.keys(packs[id].ch3_desirePower)).map(key=>[key]));
    }
    if(value>=70n)candidates.push(['corruptionAndFall']);
    if(value>=70n&&(hp(id).inf>=60||S.tyranny>=60))candidates.push(['coupAndAftermath']);
    if(rival<=-20||S.tyranny>=50)candidates.push(['humiliationAbuseRevolt'],['rumorFrameReversal']);
    if(value>=35n||S.hedon>=50)candidates.push(['doubleLoyaltyBetrayal']);
    if(cast.heir||typeof entries[id].heirAndFamily?.trigger==='string')candidates.push(['heirAndFamily']);
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
