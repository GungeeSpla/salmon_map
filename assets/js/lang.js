// =========================================================
// lang.js
// =========================================================

const LANG = {};
const LANG_DEF = `
title|サーモンラン マップビューア|Salmon Run Map Viewer
stage-selector-title|ステージ|Stage
shakeup|シェケナダム|Spawning Grounds
shakeship|難破船ドン･ブラコ|Marooner's Bay
shakehouse|海上集落シャケト場|Lost Outpost
shakelift|トキシラズいぶし工房|Salmonid Smokeyard
shakeride|朽ちた箱舟 ポラリス|Ruins of Ark Polaris
tide-selector-title|潮位|Tide
lowtide|干潮|Low Tide
normaltide|通常潮|Normal Tide
hightide|満潮|High Tide
short-shakeup|ダム|Grounds
short-shakeship|ドンブラコ|Bay
short-shakehouse|シャケト場|Outpost
short-shakelift|トキシラズ|Yard
short-shakeride|ポラリス|Ark
short-lowtide|干潮|LT
short-normaltide|通常|NT
short-hightide|満潮|HT
message-success-copy-share-url|共有URLをコピーしました。|Copied share-URL.
message-success-save-json|上書き保存しました。|Saved.
message-success-save-as-json|保存しました。|Saved.
message-share-error|共有URLにエラーがあります。|There are errors in the share URL.
message-json-error|JSONデータにエラーがあります。|There are errors in the JSON data.
message-no-save-target|保存の対象が見つかりませんでした。|No save target found.
confirm-delete|このファイルを削除してもよろしいですか？|Do you want to delete this file?
confirm-overwrite|このファイル名はすでに存在します。上書き保存してもいいですか？|This file name already exists. Would you like to overwrite the file?
maptype-selector-title|マップの種類|Plan Type
maptype-floorplan|平面図|Floor Plan
maptype-depthmap|深度図|Depth Map
maptype-screenshot|リアル|Screenshot
object-adder-title|オブジェクト追加|Add Object
object-adder-steeleel|ヘビ|Steel Eel
object-adder-steelhead|バクダンサークル|Steelhead Circle
object-adder-text|テキスト|Text
object-adder-text-initial-value|ダブルクリックで編集|Double Click to Edit
stage-transformer-title|ステージ変形|Stage Transform
stage-transformer-x|X|X
stage-transformer-y|Y|Y
stage-transformer-scale|拡大率|Scale
stage-transformer-rotate|回転|Rotate
stage-transformer-set-default|デフォルト|Set Default
stage-transformer-no-transform|変形をゼロに|No Transform
canvas-transformer-title|キャンバス変形|Canvas Transform
canvas-transformer-width|横幅|Width
canvas-transformer-height|高さ|Height
canvas-transformer-background|背景の色|Background Color
button-copy-to-canvas|キャンバスにコピー|Copy to Canvas
button-clear-canvas|キャンバスをクリア|Clear Canvas
button-download-png|画像をダウンロード|Download PNG
button-download-json|JSONをダウンロード|Download JSON
button-clear-localstorage|ローカルストレージをクリア|Clear Local Storage
button-copy-share-url|共有URLをコピー|Share URL
button-save-json|上書き保存|Save
button-save-as-json|名前を付けて保存|Save As
button-load-json|読み込む|Load
cancel|キャンセル|Cancel
delete|削除|Delete
autosave|オートセーブファイル|Auto Save File
weapon-adder-title|ブキ追加|Add Weapon
image-adder-title|画像追加|Add Image
tool-selector-drawing-opacity|不透明度|Opacity
tool-selector-line-width|線の太さ|Line Width
tool-selector-title|図形ツール|Tools
tool-selector-select|選択|Select
tool-selector-pencil|鉛筆|Pencil
tool-selector-line|直線|Line
tool-selector-arrow|矢印|Arrow
tool-selector-polyline|折れ線|Polyline
tool-selector-rectangle|四角形|Rectangle
tool-selector-circle|円|Circle
tool-selector-line-color|線の色|Line Color
tool-selector-border-color|縁取り色|Border Color
tool-selector-fill-color|塗りつぶし色|Fill Color
tool-selector-text-color|文字色|Text Color
tool-selector-text-border-color|縁取り色|Border Color
font-sans-serif|ゴシック体|Sans Serif
font-serif|明朝体|Serif
font-splatoon1|スプラトゥーン1|Splatoon1
font-splatoon2|スプラトゥーン2|Splatoon2
object-layer-manager-title|レイヤー|Layer
layer-spawner|スポナー|Spawner
layer-drawing|図形|Drawing
layer-text|テキスト|Text
layer-image|画像|Image
layer-weapon|ブキ|Weapon
layer-steeleel|ヘビ|Steel Eel
layer-steelhead|バクダン|Steelhead
layer-drizzler-link|コウモリの接続|Drizzler Link
layer-voronoi|ボロノイ図|Voronoi
layer-drizzler|コウモリ|Drizzler
layer-flyfish|カタパッド|Flyfish
layer-stinger|タワー|Stinger
layer-basket|コンテナ|Basket
layer-gusher|カンケツセン|Geyser
layer-cannon|大砲|Cannon
layer-startpos|スタート地点|Start Pos
layer-mothership|ハコビヤ母艦|Mothership
layer-rail|ライドレール|Rail
weapon-0|ボールドマーカー|Sploosh-o-matic
weapon-10|わかばシューター|Splattershot Jr.
weapon-20|シャープマーカー|Splash-o-matic
weapon-30|プロモデラーMG|Aerospray
weapon-40|スプラシューター|Splattershot
weapon-50|.52ガロン|.52 Gal
weapon-60|N-ZAP85|N-ZAP '85
weapon-70|プライムシューター|Splattershot Pro
weapon-80|.96ガロン|.96 Gal
weapon-90|ジェットスイーパー|Jet Squelcher
weapon-200|ノヴァブラスター|Luna Blaster
weapon-210|ホットブラスター|Blaster
weapon-220|ロングブラスター|Range Blaster
weapon-230|クラッシュブラスター|Clash Blaster
weapon-240|ラピッドブラスター|Rapid Blaster
weapon-250|Rブラスターエリート|Rapid Blaster Pro
weapon-300|L3リールガン|L-3 Nozzlenose
weapon-310|H3リールガン|H-3 Nozzlenose
weapon-400|ボトルガイザー|Squeezer
weapon-1000|カーボンローラー|Carbon Roller
weapon-1010|スプラローラー|Splat Roller
weapon-1020|ダイナモローラー|Dynamo Roller
weapon-1030|ヴァリアブルローラー|Flingza Roller
weapon-1100|パブロ|Inkbrush
weapon-1110|ホクサイ|Octobrush
weapon-2000|スクイックリンα|Squiffer
weapon-2010|スプラチャージャー|Splat Charger
weapon-2020|スプラスコープ|Splatterscope
weapon-2030|リッター4K|E-liter 4K
weapon-2040|4Kスコープ|E-liter 4K Scope
weapon-2050|14式竹筒銃・甲|Bamboozler 14
weapon-2060|ソイチューバー|Goo Tuber
weapon-3000|バケットスロッシャー|Slosher
weapon-3010|ヒッセン|Tri-Slosher
weapon-3020|スクリュースロッシャー|Sloshing Machine
weapon-3030|オーバーフロッシャー|Bloblobber
weapon-3040|エクスプロッシャー|Explosher
weapon-4000|スプラスピナー|Mini Splatling
weapon-4010|バレルスピナー|Heavy Splatling
weapon-4020|ハイドラント|Hydra Splatling
weapon-4030|クーゲルシュライバー|Ballpoint Splatling
weapon-4040|ノーチラス47|Nautilus 47
weapon-5000|スパッタリー|Dapple Dualies
weapon-5010|スプラマニューバー|Splat Dualies
weapon-5020|ケルビン525|Glooga Dualies
weapon-5030|デュアルスイーパー|Dualie Squelchers
weapon-5040|クアッドホッパーブラック|Tetra Dualies
weapon-6000|パラシェルター|Splat Brella
weapon-6010|キャンピングシェルター|Tenta Brella
weapon-6020|スパイガジェット|Undercover Brella
weapon-7000|クマサン印のブラスター|Grizzco Blaster
weapon-7010|クマサン印のシェルター|Grizzco Brella
weapon-7020|クマサン印のチャージャー|Grizzco Charger
weapon-7030|クマサン印のスロッシャー|Grizzco Slosher
weapon-8000|スプラッシュボム|Bomb
weapon-8010|ボムピッチャー|Bomb Launcher
weapon-8020|ジェットパック|Inkjet
weapon-8030|スーパーチャクチ|Splashdown
weapon-8040|ハイパープレッサー|String Ray
weapon-8050|キャノン|Cannon
weapon-kind-shooters|シューター|Shooters
weapon-kind-blasters|ブラスター|Blasters
weapon-kind-rollers|ローラー|Rollers
weapon-kind-brushes|フデ|Brushes
weapon-kind-chargers|チャージャー|Chargers
weapon-kind-sloshers|スロッシャー|Sloshers
weapon-kind-splatlings|スピナー|Splatlings
weapon-kind-dualies|マニューバー|Dualies
weapon-kind-brellas|シェルター|Brellas
weapon-kind-others|その他|Others
`;
{
	const lines = LANG_DEF.split('\n');
	lines.forEach((line) => {
		if (!line) {
			return;
		}
		const values = line.split('|');
		LANG[values[0].trim()] = {
			ja: values[1].trim(),
			en: values[2].trim()
		};
	});
}
