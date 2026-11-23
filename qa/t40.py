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
    async def clickall():
      for i in range(12):
        r=await X("(()=>{const s=document.getElementById('sheet');if(!s.classList.contains('on'))return 0;const b=document.querySelector('#sheetIn .opt, #sheetIn [data-ao], #sheetIn .btn');if(b){b.click();return 1}return 0})()")
        if not r:break
        await pg.wait_for_timeout(300)
    await pg.click('#startBtn');await pg.wait_for_timeout(400);await run(60);await X("closeSheet();go('game');render()")
    await X("['yuji','lvzhi','xishi','change','hanxin','xiangyu','liubang','zhangliang','baiqi'].forEach(id=>addHero(id));S.wood=S.stone=3000;S.food=3000;S.ap=9;['yuji','lvzhi','xishi','change'].forEach(id=>{hs(id).aff=100;vow(id)});closeSheet();celQ=[];document.getElementById('celebrate').classList.remove('on');")
    await pg.wait_for_timeout(500);await X("closeSheet();celQ=[];go('game');render()")
    print('spouses',await X("spouses().join(',')+' mother '+mother()+' duty '+wed('yuji').duty"))
    print('duty opts',await X("Object.keys(DUTY.f).filter(k=>k.startsWith('yuji#')).map(k=>DUTY.f[k][0]+':'+DUTY.f[k][1]).join(' | ')"))
    await X("chooseDuty('yuji')");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/t40_duty.png')
    await X("document.querySelector('#sheetIn [data-d]').click()");await pg.wait_for_timeout(400);await X("closeSheet()")
    print('wedEff food',await X("teamEff('food')"))
    # phoenix
    await X("setMainWife('lvzhi')");await pg.wait_for_timeout(500);await X("document.querySelector('#celebrate.on button')&&document.querySelector('#celebrate.on button').click()");await pg.wait_for_timeout(600);await pg.screenshot(path='/tmp/t40_phx.png')
    for i in range(10):
      await X("(()=>{if(SC)nextLine()})()");await pg.wait_for_timeout(80)
    await pg.wait_for_timeout(300);await clickall()
    print('ring',await X("S.ringOn+' '+S.ringCount+' '+S.ringSwap"))
    # love panel + interaction
    await X("closeSheet();wed('yuji').love=520;openHero('yuji')");await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{const e=document.querySelector('[data-ia]');e&&e.scrollIntoView({block:'center'})}");await pg.wait_for_timeout(200);await pg.screenshot(path='/tmp/t40_love.png')
    await X("document.querySelector('[data-ia=\"walk\"]').click()");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t40_ia.png')
    await X("document.getElementById('iaOk').click()");await pg.wait_for_timeout(300)
    await X("document.getElementById('hp').classList.remove('on');openHero('xishi')");await pg.wait_for_timeout(300)
    await X("document.querySelector('[data-ia=\"meal\"]').click()");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t40_ia2.png')
    await X("document.getElementById('iaOk').click();document.getElementById('hp').classList.remove('on')")
    print('love',await X("spouses().map(x=>x+':'+wed(x).love+'/'+LOVEN[loveLv(x)]).join(' ')"))
    # love event & hev30
    await X("S.agQ=[{k:'love',id:'yuji',e:GD.love.special.yuji[0]},{k:'pair2',q:GD.hpair2[0]}];agEvent(()=>window.__a=1)");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t40_lev.png')
    for i in range(30):
      if await X("window.__a"):break
      await X("(()=>{if(SC){nextLine();return}const b=document.querySelector('#sheetIn .opt, #sheetIn .btn');b&&b.click()})()");await pg.wait_for_timeout(200)
    print('agQ done',await X("window.__a"))
    await X("Math.random=()=>0.01;HEV2.length;window.__h=0;haremEvent(()=>window.__h=1)");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t40_hev.png')
    await pg.evaluate("()=>{let s=3;Math.random=()=>{s=(s*16807)%2147483647;return s/2147483647}}")
    await clickall();print('hev',await X("window.__h"))
    # buildings
    await X("closeSheet();view='base';render();pickFac(S.slots.findIndex(x=>!x)>=0?S.slots.findIndex(x=>!x):(S.slots.push(null),S.slots.length-1))");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/t40_fac.png',full_page=True)
    await X("closeSheet();S.slots.push({f:'alchemy',lv:3});S.slots.push({f:'library',lv:2});S.slots.push({f:'weapon',lv:5})")
    print('bld',await X("bldEff('energy')+' '+bldEff('talent2')+' '+bldEff('atk')+' '+facOutText(S.slots[S.slots.length-1],null)"))
    # elites
    print('elite',await X("S.t=40;JSON.stringify([...Array(6)].map(()=>mkMon(MON[0],300)))"))
    r=await X("(()=>{const e={id:'tt',n:'測試',img:'en_crawler',troops:400,max:400,atk:60,r:1,c:1,af:['armor','split','fire','regen','swift','curse']};return JSON.stringify(fight({id:'u',gens:['baiqi','hanxin'],troops:600,max:600},e,true))})()")
    print('fight',r)
    # world council
    print('council',await X("JSON.stringify(wtxCouncil('gaixia')).slice(0,300)"))
    # turns
    await X("S.t=12;closeSheet();go('game');view='map';render()")
    for t in range(10):
      await X("document.getElementById('endBtn').click()");await pg.wait_for_timeout(250)
      st=await run()
      await clickall()
    print('t',await X("S.t"),'ach',await X("Object.keys(S.ach).join(',')"),'stuck',st)
    print('gone',await X("JSON.stringify(S.gone)+' yuji:'+JSON.stringify(hs('yuji').hst)+' wed:'+!!wed('yuji')"));print('love after',await X("spouses().map(x=>x+':'+wed(x).love).join(' ')"))
    print(errs[:6],[u for u in bad if 'favicon' not in u][:10])
    await b.close()
asyncio.run(main())
