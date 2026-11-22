/* 《天運者》全面重寫 第一批收尾：夫人文本清宮用語清除（必須在 rewrite_01a~01d 之後載入）
 * 範圍：GD 中以 29 位夫人 id 為鍵的所有字串（不碰 wtx、wtx2、histx、scenes）。
 * 只做字串內取代，不新增、不刪除鍵，型別與陣列長度不變。
 * Node：require 後得 {RULES, SPOUSES, apply(GD)}。 */
(function(root){
const SPOUSES=['mulan','change','xiaoqiao','zhenmi','wuzetian','yuji','lianghongyu','fuhao','qinliangyu','diaochan','shangguan','liqingzhao','xishi','yangguifei','zhuowenjun','wangzhaojun','daji','lvzhi','sunshangxiang','caiwenji','zhaofeiyan','huangyueying','jiananfeng','liuchuyu','xuzhaopei','wanzhener','xiaji','fengxiaolian','liji'];
const SKIP=['wtx','wtx2','histx','scenes'];
const RULES=[
 [/鳳印與凰戒/g,'后璽與凰戒'],[/鳳印/g,'凰戒'],
 [/軍機處/g,'中軍帳'],[/敬事房/g,'掌寢內侍'],[/綠頭牌/g,'召幸名冊'],
 [/翻牌子/g,'臨幸'],[/翻牌/g,'召幸'],
 [/小主子/g,'小公子'],[/小主/g,'夫人'],[/(?<!公)主子(?!嗣)/g,'主人'],
 [/奴才/g,'賤奴'],[/嬤嬤/g,'老宮媼'],[/格格(?!不入)/g,'公主'],[/阿哥/g,'皇子'],
 [/內務府/g,'少府'],[/慎刑司/g,'掖庭獄'],[/養心殿/g,'正殿'],[/跪安/g,'告退'],
 [/晨昏請安/g,'晨昏定省'],[/晨起請安/g,'晨起定省'],[/請安/g,'問安'],
 [/御花園/g,'禁苑']
];
function fx(s){for(const [r,t] of RULES)s=s.replace(r,t);return s}
function walk(v){if(Array.isArray(v)){for(let i=0;i<v.length;i++){if(typeof v[i]==='string')v[i]=fx(v[i]);else walk(v[i])}}else if(v&&typeof v==='object'){for(const k in v){if(typeof v[k]==='string')v[k]=fx(v[k]);else walk(v[k])}}}
function find(v,depth){if(!v||typeof v!=='object'||Array.isArray(v)||depth>6)return;for(const k in v){if(SPOUSES.includes(k)){if(typeof v[k]==='string')v[k]=fx(v[k]);else walk(v[k])}else find(v[k],depth+1)}}
function apply(G){if(!G)return G;for(const k in G){if(SKIP.includes(k))continue;find({[k]:G[k]},0)}return G}
if(root&&typeof root==='object'){root.GD=root.GD||{};apply(root.GD)}
if(typeof module!=='undefined'&&module.exports)module.exports={RULES,SPOUSES,apply};
})(typeof window!=='undefined'?window:null);
