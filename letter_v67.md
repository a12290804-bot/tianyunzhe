# v6.7 戰爭殘酷・紅顏禍水：文本（給 Gemini）與圖（給 Grok）

## 新系統說明

- **有名有姓的陣亡**：每場仗會產生陣亡的伍長、校尉、少年兵，有名字、有一句遺言，收進「忠烈祠」。
- **戰後抉擇**：打贏敵方勢力後，選擇屠城、收編降卒、放走百姓、擄走敵方女眷。
- **斷糧**：大軍在外每旬吃糧，糧食見底時前線斷糧。
- **紅顏禍水值**：她們干政、擅自花用、病嬌傷人、權勢過大都會累積。
- **衝冠一怒**：放肆或病嬌的紅顏要你為她對某個勢力出兵。
- **兵諫・清君側**：禍水值超過 85 時，大軍圍住行宮，要你處死她（像馬嵬坡）。

---

## 一、文本（給 Gemini）

檔名：`v6_7_war_text.js`，上傳到 GitHub 的 `inbox/`。

```js
// 《天運者》v6.7 戰爭與禍水
(function(){
  window.WAR_TEXT = window.WAR_TEXT || {};
  const put = (id, obj) => { window.WAR_TEXT[id] = Object.assign(window.WAR_TEXT[id] || {}, obj); };
  put("_", { /* 通用 */ });
  put("wuzetian", { /* 武則天 */ });
})();
```

`{n}` = 她的名字。每個欄位都是**字串陣列**，每個字串是一個版本，遊戲隨機挑一個。

### 通用 `"_"`

| key | 內容 | 數量 |
|---|---|---|
| `lastwords` | 陣亡士兵的遺言，一句話，真實、樸素、有生活感（想家、欠債、未婚妻、問值不值得） | 40 句 |
| `postwar` | 城破之後、你決定怎麼處置之前的畫面（降卒、哭聲、火光） | 6 版 |
| `famine` | 前線斷糧的畫面（不寫血腥細節） | 6 版 |

### 每位紅顏

| key | 什麼時候 | 數量 |
|---|---|---|
| `warfor` | 衝冠一怒：她要你為她出兵的理由，照她的慾望寫（要寶物、被羞辱、要地盤、想看你為她殺人、要長生方……），一到兩句她說的話 | 3 版 |
| `mawei` | 兵諫：三軍要求處死她時，她的反應（旁白或台詞都可以），每人都要不同——有人求饒、有人冷笑、有人反過來要你殺光他們、有人自己走向白綾 | 2 版 |
| `mawei_die` | 你賜死她之後，她留下的最後一句話 | 2 版 |
| `mawei_defy` | 你拔劍護她、斬了帶頭的人之後，她的反應 | 2 版 |
| `mawei_bear` | 你在三軍面前說「罪在朕躬」之後，她的反應 | 2 版 |

紅顏 id：
mulan, change, xiaoqiao, wuzetian, zhenmi, lianghongyu, yuji, fuhao, qinliangyu, diaochan, shangguan, liqingzhao, xishi, yangguifei, zhuowenjun, wangzhaojun, daji, lvzhi, sunshangxiang, caiwenji, zhaofeiyan, huangyueying, jiananfeng, liuchuyu, xuzhaopei, wanzhener, xiaji, liji, fengxiaolian, mibazi, nvwa, pingyang, huhou, liurushi, zhangsun

主題：史詩悲壯、戰爭殘酷、紅顏禍水。楊貴妃的兵諫請寫出馬嵬坡的分量。

---

## 二、圖（給 Grok）

共通風格同前：暗黑奇幻 × 中國歷史，黑霧污染，金色描邊；場景 3:2（1200×800），JPG。通用場景用背影、剪影或不露臉。

| 檔名 | 內容 |
|---|---|
| `ev_postwar.jpg` | 城破之後：殘破城門、跪滿街道的降卒、遠處火光，一名將領背影等待號令 |
| `ev_war_ash.jpg` | 戰後餘燼：殘旗、烏鴉、屍骨堆中跪著找人的女子剪影（不血腥） |
| `ev_famine.jpg` | 前線斷糧：空鍋、倒下的戰馬、營火邊瘦削的士兵 |
| `ev_warfor.jpg` | 衝冠一怒：女子的手指點在攤開的軍事地圖上，燭光，背後站滿披甲將領 |
| `ev_mawei.jpg` | 兵諫：大軍把刀插在地上圍住行宮，一條白綾懸在梁下，女子背影 |
| `ev_shrine.jpg` | 忠烈祠：昏暗祠堂裡成排的牌位與長明燈，香煙繚繞 |
| `ev_shiji.jpg` | 史冊：攤開的竹簡或史書，硃砂印章，旁邊一盞燈與一把斷劍 |
