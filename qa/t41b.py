import asyncio,sys
sys.path.insert(0,'/home/claude/tools')
from t7 import STEP
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8765/t.html');await pg.wait_for_timeout(800)
    X=lambda c:pg.evaluate("c=>X(c)",c)
    await pg.screenshot(path='/tmp/b_title.png')
    await pg.click('#startBtn');await pg.wait_for_timeout(600);await pg.screenshot(path='/tmp/b_story.png')
    for i in range(60):
      st=await pg.evaluate(STEP);await pg.wait_for_timeout(60)
    await X("closeSheet();go('game');S.slots[0]={f:'granary',lv:2,p:100};S.slots[1]={f:'weapon',lv:1,p:100};render();setView('base')");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/b_base.png')
    await X("setView('map')");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/b_map.png')
    print(errs[:5])
    await b.close()
asyncio.run(main())
