from playwright.sync_api import sync_playwright
from pathlib import Path
s=Path('index.html').read_text();i=s.rindex('}',0,s.rindex('</script>'))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 pg.route('**/index.html',lambda r:r.fulfill(body=s[:i]+'window.X=c=>eval(c);'+s[i:],content_type='text/html'))
 errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
 pg.goto('http://localhost:8746/index.html')
 def x(s):return pg.evaluate('s=>window.X(s)',s)
 x("genWorld();go('game');setView('children')")
 pg.locator('[data-family-home]').click();assert x("S.hTab==='誓約結義' && view==='harem'")
 x("setView('children')");pg.locator('[data-family-heroes]').click();assert x("view==='hero'")
 x("for(const id of ['fuhao','mulan','qinliangyu','lianghongyu','sunshangxiang','zhuowenjun']){if(!S.order.includes(id))addHero(id,0)};for(const id of S.order){hs(id).hst=null};hs('fuhao').wed={fav:85,visits:2};setView('children')")
 pg.locator('[data-family-visit=fuhao]').click(force=True);assert x("wed('fuhao').visits===3")
 x("S.facOv=Object.fromEntries(S.order.map(id=>[id,id==='fuhao'?'waiqi':'wuxun']));S.fp={waiqi:200,wuxun:1};S.fd={waiqi:80};S.off={[OFF[0][0]]:'mulan'};S.contestPressure=99;const old=Math.random;Math.random=()=>0;try{factionContest(()=>{})}finally{Math.random=old}")
 assert x("S.off[OFF[0][0]]==='fuhao' && S.fd.wuxun===8 && S.contests.length===1")
 x("factionContest(()=>{});save();loadGame()");assert x("S.contests.length===1 && facView().includes('派系鬥爭') && facView().includes('被撤換')")
 x("S.t++;S.off={};S.contestPressure=99;window.stock=S.food=100;factionContest(()=>{})");assert x("S.food<stock && S.contests.length===2")
 assert not errs,errs
 print('Mobile interactions, rivalry, consequences, persistence passed.')
