import asyncio,sys
sys.path.insert(0,'/home/claude/tools')
from t7 import STEP
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));bad=[];pg.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
    await pg.goto('http://localhost:8765/t.html');await pg.wait_for_timeout(800)
    X=lambda c:pg.evaluate("c=>X(c)",c)
    async def run(n=250):
      st=''
      for i in range(n):
        st=await pg.evaluate(STEP)
        if st=='idle:game':
          await pg.wait_for_timeout(250);st=await pg.evaluate(STEP)
          if st=='idle:game':return st
        await pg.wait_for_timeout(80)
      return st
    async def drain(flag,shot=None):
      for i in range(60):
        if await X(flag):break
        await X("(()=>{if(SC){nextLine();return}const b=document.querySelector('#sheetIn .opt:not([disabled]), #sheetIn .btn');b&&b.click()})()");await pg.wait_for_timeout(150)
        if shot and i==shot[1]:await pg.screenshot(path=shot[0])
      return await X(flag)
    await pg.click('#startBtn');await pg.wait_for_timeout(400);await run(60);await X("closeSheet();go('game');render()")
    await X("['yuji','lvzhi','xishi','change','yangguifei','zhaofeiyan','hanxin','baiqi'].forEach(id=>addHero(id));S.wood=S.stone=3000;S.food=3000;S.ap=9;S.gifts=5;['yuji','lvzhi','xishi','change','yangguifei','zhaofeiyan','hanxin'].forEach(id=>{hs(id).aff=100;vow(id)});closeSheet();celQ=[];document.getElementById('celebrate').classList.remove('on');")
    await pg.wait_for_timeout(500);await X("closeSheet();celQ=[];go('game');render()")
    print('spouses',await X("spouses().join(',')+' sworn '+sworn().join(',')+' slots '+S.slots.length"))
    # aff cap
    print('aff',await X("hs('baiqi').aff=10;gainAff('baiqi',30);gainAff('baiqi',30);hs('baiqi').aff+' txt '+affGateTxt('baiqi').replace(/<[^>]+>/g,'')"))
    # fav sync
    print("favsync",await X("(()=>{const w=wed('yuji');favSync();const a=w.love;w.fav=Math.max(0,w.fav-20);favSync();return a+'→'+w.love})()"))
    # harem view
    await X("closeSheet();setView('harem')");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t41_harem.png')
    # h33 event
    await X("Object.values(S.heroes).forEach(h=>{if(h.wed)h.wed.love=950});window.__a=0;const p=h33Pick('yuji',['病態']);S.agQ=[{k:'h33',e:p.e,who:p.who}];agEvent(()=>window.__a=1)");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t41_h33a.png')
    print('h33',await drain("window.__a",('/tmp/t41_h33b.png',8)))
    # chain
    await X("window.__a=0;S.agQ=[{k:'h33',e:GD.hev33.find(e=>e.id==='xh01a'),who:{a:'yuji',b:'xishi',c:'change'}}];agEvent(()=>window.__a=1)")
    print('chain',await drain("window.__a"),await X("(S.hfeed||[]).slice(0,3).map(f=>f.s.slice(0,40)).join(' / ')"))
    # rival
    await X("window.__a=0;const i=GD.hrival.findIndex(r=>r.ids[0]==='yangguifei');S.agQ=[{k:'rv',i},{k:'rv',i},{k:'rv',i}];agEvent(()=>window.__a=1)")
    print('rv',await drain("window.__a"),await X("JSON.stringify(S.rvS)+' rel '+JSON.stringify(S.rel)"))
    # inter
    await X("window.__a=0;S.agQ=[{k:'ask',id:'yuji',i:0},{k:'visit',id:'xishi',i:0},{k:'bday',id:'lvzhi'},{k:'anniv',id:'change'}];agEvent(()=>window.__a=1)");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_ask.png')
    print('inter',await drain("window.__a"))
    # wish
    print('wish',await X("const w=wed('yuji');w.wish={i:0,u:S.t+6,vc:0,k:0,tr:0};wishTxt('yuji')"))
    # verdict
    await X("closeSheet();vdSheet('xishi')");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_vd.png')
    await X("doVerdict('xishi','promote')");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_vd2.png');await X("closeSheet()")
    await X("S.ap=9;wed('change').vdT=-1;doVerdict('change','coldpalace')");await pg.wait_for_timeout(200);await X("closeSheet();S.hTab='冷宮行宮';render()");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_cold.png')
    # IA with inter act
    await X("S.hTab='一覽';closeSheet();hs('yuji').hst=null;wed('yuji').iaT=-1;S.ap=9;openHero('yuji')");await pg.wait_for_timeout(300);print('ia btns',await X("document.querySelectorAll('[data-ia]').length+' '+!!document.getElementById('hp').classList.contains('on')"))
    await X("(document.querySelector('[data-ia=\"walk\"]')||{click(){doIA('yuji','walk')}}).click()");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_ia.png');await X("document.getElementById('iaOk').click();document.getElementById('hp').classList.remove('on')")
    # offices
    await X("closeSheet();setOff('shanggong','lvzhi')");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_off.png');await X("closeSheet()")
    print('off',await X("offEff('calm').toFixed(3)+' '+OFF.length"))
    # branch city
    print('bf',await X("const t=S.tiles.flat().find(t=>t.own&&!t.base);t.city=2;t.cname='測試城';bfSheet(t);'ok'"));await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_bf.png')
    await X("closeSheet();const t=cityTiles()[0];t.bs=[{f:'xinggong',lv:1},{f:'kuangchang',lv:2},null];palSend('yangguifei',t,'favor')");await pg.wait_for_timeout(300);await X("closeSheet()")
    # turns
    await X("S.t=12;closeSheet();go('game');view='map';render()")
    for t in range(12):
      await X("document.getElementById('endBtn').click()");await pg.wait_for_timeout(250)
      st=await run()
      await drain("0")
    print('t',await X("S.t"),'stuck',st)
    print('state',await X("spouses().map(x=>x+':'+wed(x).love+'/'+LOVEN[loveLv(x)]+'/'+md2(x)+'/f'+wed(x).fav).join(' ')"))
    print('feed',await X("(S.hfeed||[]).length+' h33N '+S.h33N"))
    await X("closeSheet();setView('harem');S.hTab='動態';render()");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_feed.png')
    await X("S.hTab='關係';render()");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_rel.png')
    await X("setView('base')");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t41_base.png',full_page=True)
    print(errs[:8],[u for u in bad if 'favicon' not in u][:10])
    await b.close()
asyncio.run(main())
