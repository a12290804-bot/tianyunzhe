from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
 pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 errors=[]
 pg.on('pageerror',lambda err:errors.append(str(err)))
 pg.goto('http://localhost:8765/t.html')
 def x(code): return pg.evaluate('c=>window.X(c)',code)
 x("genWorld();['liji','liuchuyu','fengxiaolian','hanxin'].forEach(id=>addHero(id));S.ap=12;S.food=S.wood=S.stone=1000;go('game');view='map';render()")
 assert x("barAddC('liji','tyranny',102);cT('liji')===157&&cT('liuchuyu')===25")
 x("window.town=S.tiles.flat().find(t=>t.own&&!t.base);town.city=2;town.cname='驗證城';bfSheet(town)")
 pg.locator('[data-town="0"]').click()
 pg.locator('[data-f="granary"]').click()
 pg.locator('#sheetIn [data-h="hanxin"]').click()
 assert x("hs('hanxin').task==='build:'+townKey(town,0)")
 x("town.townSlots[0].p=100;town.townSlots[0].lv=1;setTask('hanxin','gar:'+townKey(town,0))")
 assert x("slotsOf('granary').includes(town.townSlots[0])&&town.townSlots[0].gar==='hanxin'")
 x("hs('liji').task='city:'+town.r+'_'+town.c;town.cg=['liji'];hs('liji').seizePlan=townKey(town,0);personalTurn(()=>{})")
 assert x("!!town.rebFid&&!town.own&&!slotsOf('granary').includes(town.townSlots[0])&&hs('hanxin').task==='idle'")
 x("rebelRestoreCity(town.rebFid,()=>{});save();loadGame();setView('children')")
 assert x("cityTiles().some(t=>t.cname==='驗證城'&&t.townSlots[0].lv===1)&&document.querySelector('#view').innerText.includes('子嗣')")
 x("['liuchuyu','fengxiaolian'].forEach(id=>{hs(id).wed={fav:90,preg:S.t||1,visits:4}});S.t=5;kidTurn(()=>{});save();loadGame()")
 assert x("S.birthQueue.length===2")
 x("kidEvent(()=>{});document.querySelector('[data-n]').click();afterCel();document.querySelector('[data-n]').click()")
 assert x("S.birthQueue.length===0&&new Set(S.kids.map(k=>k.mom)).size===2")
 x("setView('map');const t=cityTiles()[0];formArmy(t);document.querySelector('#originSelect').value=t.r+'_'+t.c;document.querySelector('#originSelect').dispatchEvent(new Event('change'));document.querySelector('#sheetIn [data-h=hanxin]').click();document.querySelector('#goArmy').click()")
 assert x("S.units.some(u=>u.gens.includes('hanxin')&&u.r===cityTiles()[0].r&&u.c===cityTiles()[0].c)")
 x("closeSheet();const t=cityTiles()[0];t.dur=60;S.ap=4;S.stone=100;repairTown(t)")
 assert x("cityTiles()[0].dur===80&&S.stone===70&&S.ap===3")
 assert x("""(()=>{const rnd=Math.random, order=S.order;try{
  S.order=['liuchuyu','hanxin'];hs('hanxin').task=hs('liuchuyu').task='idle';S.units=[];S.food=7;hs('liuchuyu').graft=0;hs('liuchuyu').hst=null;hp('liuchuyu').foe=null;hs('liuchuyu').aff=0;cbInit('liuchuyu').hedon=180;
  const rolls=[.1,.99,.1];Math.random=()=>rolls.shift()??.5;personalTurn(()=>{});if(S.food!==0||hs('liuchuyu').graft!==7)throw Error(JSON.stringify({food:S.food,graft:hs('liuchuyu').graft,place:activePlace('liuchuyu'),hst:hst('liuchuyu'),wife:wed('liuchuyu')}));return true
 }finally{Math.random=rnd;S.order=order}})()""")
 assert x("""(()=>{const rnd=Math.random, order=S.order;try{
  S.order=['liuchuyu','hanxin'];hs('hanxin').hst={k:'jail',u:S.t+5};cbInit('liuchuyu').tyranny=150;hp('liuchuyu').inf=80;S.food=0;
  const rolls=[.05,.99,.1];Math.random=()=>rolls.shift()??.5;personalTurn(()=>{});return S.gone.hanxin.k==='exec'&&!S.order.includes('hanxin')
 }finally{Math.random=rnd;S.order=order}})()""")
 assert x("""(()=>{const was=S.t;try{for(let i=0;i<30;i++){S.t=i;S.newPol=[];spreadPol(()=>{});if(S.newPol.length>(i<18?2:4))return false}return true}finally{S.t=was}})()""")
 assert x("!!mapHexFill(0,0,['terr_I'],'test').includes('hex_iron.jpg')")
 assert x("S.t=4;tideIn()===1")
 assert not errors,errors
 print('mobile city, character bars, capture, recapture, saves and concurrent births passed')
