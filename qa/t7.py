import asyncio
from playwright.async_api import async_playwright
STEP="""()=>{const v=e=>e&&e.offsetParent!==null;const on=document.querySelector('.scr.on').id;
 if(document.getElementById('ending').classList.contains('on'))return 'end';
 if(on==='story'){document.getElementById('stSkip').click();return 'story'}
 for(const id of ['celOk','bOk','bSkip','rOk','dOk','rvOk','vLeave','cFree']){const b=document.getElementById(id);if(v(b)){b.click();return id}}
 const btn=[...document.querySelectorAll('#battle button')].find(v);if(btn){btn.click();return 'battle'}
 const o=[...document.querySelectorAll('#sheetIn .opt')].find(v);if(o&&document.getElementById('sheet').classList.contains('on')){o.click();return 'opt'}
 if(on==='summon'){const b=[...document.querySelectorAll('#pools .pool:not([disabled]),#eSkip,#sumOk,#pools button')].find(v);if(b){b.click();return 'sum'}}
 return 'idle:'+on}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8765/t.html');await pg.wait_for_timeout(600)
    X=lambda c:pg.evaluate("c=>X(c)",c)
    async def run(n=300,stop=('idle:game',)):
      last=None
      for i in range(n):
        st=await pg.evaluate(STEP);last=st
        if st=='end':return st
        if st in stop:
          await pg.wait_for_timeout(500);st=await pg.evaluate(STEP)
          if st in stop:return st
        await pg.wait_for_timeout(110)
      return last
    await pg.click('#startBtn');await pg.wait_for_timeout(300)
    print('start',await run());await X("['baiqi','xiaohe','fanli'].forEach(id=>addHero(id))");print(await X("S.order.join(',')"))
    # tile event
    await X("(()=>{const u={id:'u9',gens:[S.order[0]],troops:200,max:400,r:6,c:5};S.units.push(u);arrive(u,()=>{});tileEv.push({e:V14.tileEv.W[0],u,where:'靈泉',img:'o_spring'});tileEvents(()=>window.__te=1)})()")
    await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/s_tile.png')
    await pg.mouse.click(195,60);await pg.wait_for_timeout(200)
    print('locked still open:',await X("document.getElementById('sheet').classList.contains('on')"))
    await run(20);print('te',await X("window.__te"),await X("S.units[0].troops"))
    await X("S.units=[]")
    turns=0
    for t in range(9):
      await X("document.getElementById('endBtn').click()");await pg.wait_for_timeout(250)
      st=await run(200)
      if st=='end':print('ENDING at turn',t);break
      await X("(()=>{const h=S.order;})()")
      print(t,await X("'t='+S.t+' dur='+S.dur+' food='+S.food+'/'+capRes().food+' pop='+S.pop+' sol='+S.soldiers+' pol='+S.pol+' tides='+S.tides+' en='+S.enemies.length"))
    await pg.screenshot(path='/tmp/s_map.png')
    print('ERRS',errs[:10])
    await b.close()
if __name__=='__main__':asyncio.run(main())
