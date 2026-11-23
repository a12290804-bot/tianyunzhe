from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
 pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=3)
 errors=[]
 pg.on('pageerror',lambda err:errors.append(str(err)))
 pg.goto('http://localhost:8765/t.html')
 def x(code): return pg.evaluate('c=>window.X(c)',code)
 x("""genWorld();['zhenmi','xiaoqiao','hanxin'].forEach(id=>addHero(id,50));S.t=15;S.ap=9;S.food=100;
 window.town=S.tiles.flat().find(t=>t.own&&!t.base);town.city=2;town.cname='江城';town.dur=60;
 S.kids=['zhenmi','xiaoqiao'].map((mom,i)=>({mom,id:'kid'+(i+1),n:['玉安','明月'][i],sex:i?'f':'m',born:0,wen:0,wu:0,r1:1,r2:1,r3:1,r4:1}));
 save();loadGame();go('game');setView('children')""")
 pg.locator('[data-crown=kid1]').click();pg.locator('#confirmCrown').click()
 assert x("S.crown==='kid1'")
 pg.locator('[data-tutor=kid1]').select_option('hanxin')
 x("S.t+=3;const rand=Math.random;Math.random=()=>.99;try{successionTurn(()=>{})}finally{Math.random=rand}")
 assert x("S.kids[0].wu===1 || S.kids[0].wen===1")
 food=x('townStores(cityTiles()[0]).food')
 pg.locator('[data-practice="kid1:wen"]').click()
 assert x('townStores(cityTiles()[0]).food')>food and x('S.kids[0].merit')==1
 pg.locator('[data-practice="kid1:wu"]').click()
 assert x('S.kids[0].merit')==1
 pg.locator('[data-crown=kid2]').click();pg.locator('#confirmCrown').click()
 assert x("S.crown==='kid2' && relG('zhenmi','xiaoqiao')<0")
 x("S.t++;cbInit('zhenmi').tyranny=100;const rand=Math.random;Math.random=()=>0;try{successionTurn(()=>{})}finally{Math.random=rand}render()")
 assert x("S.petition.target==='kid2'")
 pg.locator('[data-invest]').click();assert x("!S.petition && S.endorsements.xiaoqiao==='kid2'")
 pg.locator('[data-practice="kid2:wu"]').click()
 assert x("cityTiles().some(t=>t.cname==='江城'&&t.dur>60)")
 x("save();loadGame();setView('map')")
 assert x("S.crown==='kid2'&&S.kids[0].tutor==='hanxin'")
 assert pg.locator('#hexmap #tileShape').count()==1 and pg.locator('#mapg image').count()>0
 for i in range(8): pg.locator('#zIn').click()
 assert x("Z.s>=COLS/2.5-.001")
 pg.screenshot(path='/tmp/map-max.png');pg.locator('#zHome').click()
 x("const t=cityTiles().find(t=>t.cname==='江城');window.currentTown=t;setTask('hanxin','city:'+t.r+'_'+t.c);t.cg=['hanxin'];townStores(t).soldiers=160;S.soldiers=40;cityTurn(()=>{});formArmy(BASE,t)")
 assert pg.locator('#sheetIn [data-h=hanxin]').count()==1
 assert pg.locator('#sheetIn [data-h=zhenmi]').count()==0
 pg.locator('#sheetIn [data-h=hanxin]').click();pg.locator('#goArmy').click()
 assert x("S.soldiers===40&&S.units.some(u=>u.r===currentTown.r&&u.c===currentTown.c&&u.troops>0)&&currentTown.stock.soldiers<160")
 x("S.t=21;factionCouncil(()=>{});setView('hero')")
 assert x("Object.keys(S.factionMinutes).length>0")
 assert pg.evaluate("document.querySelector('#nav button').getBoundingClientRect().top===document.querySelector('#endBtn').getBoundingClientRect().top && document.querySelector('#view').getBoundingClientRect().bottom<=document.querySelector('#nav').getBoundingClientRect().top+1")
 assert x("(()=>{const before=S.food+S.soldiers+S.wood;addHero('liji',60);return !!hs('liji').lastAction&&S.food+S.soldiers+S.wood>before})()")
 assert x("(()=>{const old=S.order,rand=Math.random;try{S.order=['zhenmi','xiaoqiao'];hs('zhenmi').wed={fav:20};hs('zhenmi').acted=-1;hs('xiaoqiao').hst={k:'jail',u:S.t+8};hp('zhenmi').inf=90;cbInit('zhenmi').tyranny=200;hs('zhenmi').aff=0;S.food=0;const rolls=[0.01,0.99,0.01];Math.random=()=>rolls.shift()??0;personalTurn(()=>{});return S.gone?.xiaoqiao?.k==='exec'}finally{S.order=old;Math.random=rand}})()")
 assert not errors,errors
 print('mobile succession, classes, regency, rival petition, old save, reload and map zoom passed')
