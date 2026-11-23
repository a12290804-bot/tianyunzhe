from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
 pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto('http://localhost:8765/t.html')
 def x(s):return pg.evaluate('s=>window.X(s)',s)
 x("genWorld();go('game');S.ap=10;S.energy=1500;for(const id of ['liqingzhao','caiwenji','change','wangzhaojun','hanxin'])addHero(id,0);setView('hero')")
 assert x("Object.keys(storyMethods).length===29 && ['liqingzhao','change','caiwenji','wangzhaojun'].every(id=>hs(id).acted===S.t && hs(id).lastAction)")
 x("openHero('liqingzhao')");old=x("stat('liqingzhao','cmd')");pg.locator('#trainKey').select_option('cmd');pg.locator('#buyTrain').click();assert x("stat('liqingzhao','cmd')")==old+1
 pg.locator('#buyTrain').click();assert x("lvOf('liqingzhao')>1")
 x("hs('hanxin').troopOn=true;S.units.push({id:'test',gens:['hanxin'],troops:100,max:100,r:BASE.r,c:BASE.c});openHero('hanxin')");pg.locator('#drillField').click();assert x("hs('hanxin').troopDrills===1 && heroWhere('hanxin').u.id==='test'")
 x("S.units=[];document.querySelector('#hpX').click();window.city=S.tiles.flat().find(t=>t.own&&t.t!=='B');city.city=2;const key=city.r+'_'+city.c;setTask('hanxin','city:'+key);city.cg=['hanxin'];setView('hero')")
 assert not pg.locator('#view [data-h=hanxin]').count()
 x('townPanel(city)');assert pg.locator('[data-townhero=hanxin]').count()==1
 x("closeSheet();hs('liqingzhao').wed={fav:20};hs('caiwenji').wed={fav:20,preg:S.t+6};setHst('liqingzhao','ban',3);S.agQ=[{k:'visit',id:'liqingzhao'}];window.done=false;agEvent(()=>window.done=true)")
 assert x("window.done")
 x("hs('liqingzhao').hst=null;relAdd('liqingzhao','caiwenji',-60);cbInit('liqingzhao').tyranny=120;let acts=[];storyAction('liqingzhao',(w,fn)=>acts.push(fn),['caiwenji'],'home');acts.at(-1)()")
 assert x("!wed('caiwenji').preg && S.pregLoss.length===1")
 x("elope('change','wangzhaojun',()=>{});save();loadGame();setView('hero')")
 assert x("!S.order.includes('change') && S.gone.change.k==='elope' && !heroView().includes(H('change').n)")
 for _ in range(4): x('searchMissing()')
 assert x("S.order.includes('change') && S.order.includes('wangzhaojun')")
 x("setView('harem');S.hTab='誓約結義';render()");assert pg.locator('#view [data-w=liqingzhao]').count()==1
 x("setView('lord')");assert not pg.locator('[data-lt=後宮]').count()
 x("S.t=12;const rand=Math.random;Math.random=()=>0;try{localRise(()=>{})}finally{Math.random=rand}")
 assert x("curFacs().some(f=>f.local && FS(f.id).alive)")
 x("window.site=cityTiles()[0];window.bid=Object.keys(GD.pbuild).find(k=>GD.pbuild[k].where.includes('branch'));S.wood=S.stone=S.energy=2000;pbBuildSheet('pb_'+bid)")
 pg.locator('[data-pw=branch]').first.click()
 assert x("pbPending('pb_'+bid)&&!pbHas('pb_'+bid)")
 x("setView('base');S.t+=2;pbTurn(()=>{});save();loadGame()")
 assert x("pbHas('pb_'+bid)?.where==='branch'")
 assert not errs,errs
 print('Mobile play checks passed')
