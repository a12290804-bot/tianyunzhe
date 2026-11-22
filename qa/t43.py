import asyncio,sys
sys.path.insert(0,'/home/claude/tools')
from t7 import STEP
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(e.stack or str(e)));bad=[];pg.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
    await pg.goto('http://localhost:8765/t.html');await pg.wait_for_timeout(800)
    X=lambda c:pg.evaluate("c=>X(c)",c)
    async def drain(flag):
      for i in range(120):
        if await X(flag):break
        await X("(()=>{if(SC){nextLine();return}const b=document.querySelector('#sheetIn .opt:not([disabled]):last-of-type, #sheetIn .btn, #reveal.on button');b&&b.click()})()");await pg.wait_for_timeout(110)
      return await X(flag)
    await pg.click('#startBtn');await pg.wait_for_timeout(400)
    for i in range(60):
      await pg.evaluate(STEP);await pg.wait_for_timeout(50)
    ids="['jiananfeng','wanzhener','xiaji','liuchuyu','fengxiaolian','liji','xuzhaopei','xishi','yuji']"
    await X(f"closeSheet();go('game');{ids}.forEach(id=>addHero(id));S.ap=9;S.gifts=5;{ids}.forEach(id=>{{hs(id).aff=100;vow(id)}});closeSheet();celQ=[];document.getElementById('celebrate').classList.remove('on');render()")
    await pg.wait_for_timeout(400);await X("closeSheet();celQ=[]")
    # strip then return events
    await X("dkAct('liuchuyu','strip');dkAct('xiaji','execute')")
    print('st',await X("stripped().join(',')+' dc '+JSON.stringify(S.dc)"))
    await X("window.__a=0;S.agQ=GD.hev34.filter(e=>/^dk_(bastard|affair|betray|return)/.test(e.id)).map(e=>{const a=e.reqStatus?'liuchuyu':e.reqDeadReturn?'liji':'fengxiaolian';return{k:'dk',e,who:{a,b:'xishi'}}});agEvent(()=>window.__a=1)")
    print('ev',await drain("window.__a"),await X("S.dkDone.length+' gone '+JSON.stringify(S.gone)+' bastardN '+S.bastardN+' corrupt '+S.corrupt"))
    # resummon xiaji (exec)
    await X("S.gone.xiaji={k:'exec',u:1e9};S.order=S.order.filter(x=>x!=='xiaji');const _r=roll;roll=()=>'xiaji';window.__s=0;summon(null,()=>window.__s=1);roll=_r")
    await pg.wait_for_timeout(500);await pg.screenshot(path='/tmp/t43_rs.png')
    print('rs',await drain("window.__s"),await X("S.order.includes('xiaji')+' md '+md2('xiaji')+' q '+(S.hxQ||[]).map(x=>(x.h||x.title||'')).join('|').slice(0,200)"))
    await X("hxShow(()=>{})");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t43_hx.png');await drain("!document.getElementById('sheet').classList.contains('on')")
    # bastard birth & reveal
    await X("const w=wed('yuji');bastardMark('yuji','禁軍校尉');w.preg=S.t;S.off=S.off||{};S.off.jinyiwei='baiqi'")
    await X("S.birth='yuji';S.order.includes('yuji')")
    # darkActs & turns
    await X("S.t=10;closeSheet();go('game');render()")
    for t in range(8):
      await X("document.getElementById('endBtn').click()");await pg.wait_for_timeout(250)
      for i in range(200):
        st=await pg.evaluate(STEP)
        if st=='idle:game':break
        await pg.wait_for_timeout(60)
      await drain("0")
    print('t',await X("S.t+' kids '+JSON.stringify((S.kids||[]).slice(0,3).map(k=>[k.n,k.bfa,k.brev]))+' n '+(S.kids||[]).length+' born '+JSON.stringify(Object.entries((S.kids||[]).reduce((a,k)=>(a[k.born+':'+k.mom]=(a[k.born+':'+k.mom]||0)+1,a),{})))+' secret '+(S.secret||[]).length+' feed '+(S.hfeed||[]).length"))
    await X("closeSheet();setView('harem');S.hTab='冷宮行宮';render()");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t43_cold.png')
    await X("S.hTab='一覽';render()");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t43_h.png')
    print(errs[:8],[u for u in bad if 'favicon' not in u][:10])
    await b.close()
asyncio.run(main())
