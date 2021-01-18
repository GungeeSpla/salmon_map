// =========================================================
// main.js
// =========================================================

/** instances
 */
let ymapReady = false;
let ymapReadyFuncs = [];
let stageObjects;
let stageObjectsReady = false;
let stageObjectsReadyFuncs = [];
let drizzlerObjects;
let html2canvasWorking = false;
let $canvasContainer;
let $stageContainer;
let $tempDrawingCanvas;
let tempDrawingCtx;
let $ymapCanvas;
let ymapCtx;
let $steeleelCanvas;
let steeleelCtx;
let $steelheadCanvas;
let steelheadCtx;
let $drizzlerLinkCanvas;
let drizzlerLinkCtx;
let $voronoiCanvas;
let voronoiCtx;
let $voronoiCanvas2;
let voronoiCtx2;
let ymapImagedata;
let currentFilename = '';
let voronoi;
let lastTouchEvent;
let canvasSetting = {
	stage: 'shakeup',
	tide: 'normal',
	maptype: 'depthmap',
	stageX: 0,
	stageY: 0,
	stageScale: 1,
	stageRotate: 0,
	canvasWidth: 800,
	canvasHeight: 800,
	seaHeight: 75,
	canvasColor: 'rgb(255, 255, 255)'
};
let toolSetting = {
	lineWidth: 10,
	lineColor: 'rgb(0, 0, 0)',
	borderWidth: 4,
	borderColor: 'rgb(255, 255, 255)',
	fillColor: 'transparent'
};
let textSetting = {
	fontFamily: 'sans-serif',
	textColor: 'rgb(0, 0, 0)',
	borderColor: 'rgb(255, 255, 255)'
};
let isEnabledAutosave = true;
let autosaveTimerId;
let currentTool = 'select';

/** DOMContentLoaded
 */
window.addEventListener('DOMContentLoaded', () => {
	console.log('Event: DOMContentLoaded');
	init();
	loadStorage();
	if (!readShareURL()) {
		selectStage();
	}
});

/** init
 */
function init() {

	/** 開発用要素の削除 */
	$('.hidden-in-production').remove();
	
	/** Webフォントの読み込み */
	// @see http://ithat.me/2016/12/10/js-web-font-load-start-complete-detection-web-font-loader
	WebFont.load({
		custom: {
			families: ['Splatoon1', 'Splatoon2']
		},
		active: function() {
			$('.textarea-container textarea').myTrigger('input');
		}
	});
	
	/** タイトル */
	document.title = getLang('title');
	
	/** キャンバス */
	$canvasContainer = $('#canvas-container').css({
		width: `${canvasSetting.canvasWidth}px`,
		height: `${canvasSetting.canvasHeight}px`
	});
	$stageContainer = $('#stage-container').css({
		left: `${canvasSetting.canvasWidth / 2}px`,
		top: `${canvasSetting.canvasHeight / 2}px`,
		width: `${STAGE_WIDTH}px`,
		height: `${STAGE_HEIGHT}px`,
		transformOrigin: 'center'
	});
	/*
	.myDraggable({
		drag: () => {
			const pos = $stageContainer.getXY();
			$('#input-range-stage-x,#input-text-stage-x').val(pos.x - canvasSetting.canvasWidth/2);
			$('#input-range-stage-y,#input-text-stage-y').val(pos.y - canvasSetting.canvasHeight/2).myTrigger('input');
		}
	});
	*/
	
	$('body').onMousedown((e) => {
		$('.selected').removeClass('selected');
	});

	/** ブキ追加ツール */
	const $weaponAdder = $('#weapon-adder');
	const weaponKinds = [];
	for (let key in WEAPON) {
		const id = WEAPON[key].id;
		const kind = WEAPON[key].kind;
		const name = getLang(key);
		if (!weaponKinds.includes(kind)) {
			weaponKinds.push(kind);
			const title = getLang(`weapon-kind-${kind}`);
			$weaponAdder.append(`<h5>${title}</h5><div id="weapon-adder-${kind}"></div>`);
		}
		const $img = $(`<img src="./assets/img/weapon/${id}.png">`);
		$img.attr('title', name);
		$img.onMousedown((e) => {
			e.preventDefault();
			addWeapon({ id });
		});
		$(`#weapon-adder-${kind}`).append($img);
	}

	/** 画像追加ツール */
	const $imageAdder = $('#image-adder');
	for (let i = 0; i < IMAGE_PIECES.length; i++) {
		const src = IMAGE_PIECES[i];
		const $img = $(`<img src="./assets/img/piece/${src}">`);
		$img.onMousedown((e) => {
			e.preventDefault();
			addImage({ src: './assets/img/piece/' + src });
		});
		$imageAdder.append($img);
	}

	/** オブジェクトレイヤー */
	const saveDataJSON = localStorage.getItem(STORAGE_KEY);
	const saveDataObj = saveDataJSON ? JSON.parse(saveDataJSON) : DEFAULT_SAVEDATAOBJ;
	const $manager = $('#object-layer-manager .selector-container');
	LAYER_MANAGER_LIST.forEach((item, i) => {
		const $layer = $('<div class="layer-object" id="' + item.name + '"></div>').css({
			width: `${STAGE_WIDTH}px`,
			height: `${STAGE_HEIGHT}px`
		}).appendTo($stageContainer);
		if (item.name === 'layer-voronoi-2') {
			if (!saveDataObj['checkbox-layer-voronoi']) {
				$layer.hide();
			}
		}
		if (item.isHidden) {
			return;
		}
		const $div1 = $('<label draggable="false" id="label-checkbox-' + item.name + '" for="checkbox-' + item.name + '"></label>');
		const $div2 = $('<input type="checkbox" id="checkbox-' + item.name + '">');
		const $div3 = $('<div class="object-layer-name"></div>');
		if (saveDataObj['checkbox-' + item.name]) {
			$div2.prop('checked', true);
		}
		$div1.append($div2);
		$div1.append($div3);
		$manager.prepend($div1);
		$div3.text(getLang(item.name));
		$div2.myOn('change', (e) => {
			const val = $div2.prop('checked');
			if (val) {
				$layer.show();
			} else {
				$layer.hide();
			}
			if (item.brother) {
				const $layer2 = $('#'+item.brother);
				if (val) {
					$layer2.show();
				} else {
					$layer2.hide();
				}
			}
			saveStorage();
			onChangeCanvas();
		});
		if (saveDataObj['checkbox-' + item.name]) {
			$layer.show();
		} else {
			$layer.hide();
		}
		$div1.myOn('mousedown', (e) => {
			e.stopPropagation();
		});
	});
	/** レイヤーのドラッガブル */
	// @see https://blog.ver001.com/javascript-dragdrop-sort/
	/*
	document.querySelectorAll('#object-layer-manager label').forEach (elm => {
		elm.ondragstart = function () {
			event.dataTransfer.setData('text/plain', event.target.id);
		};
		elm.ondragover = function () {
			event.preventDefault();
			this.style.borderTop = '1px solid blue';
		};
		elm.ondragleave = function () {
			this.style.borderTop = '';
		};
		elm.ondrop = function () {
			event.preventDefault();
			let id = event.dataTransfer.getData('text/plain');
			let elm_drag = document.getElementById(id);
			this.parentNode.insertBefore(elm_drag, this);
			this.style.borderTop = '';
		};
	});
	*/
	/** バクダンサークル描画キャンバス */
	{
		const [canvas, ctx] = createCanvas(STAGE_WIDTH, STAGE_HEIGHT);
		const $canvas = $(canvas).attr('id', 'canvas-steelhead').appendTo('#layer-steelhead');
		$steelheadCanvas = $canvas;
		steelheadCtx = ctx;
	}
	/** ヘビ描画キャンバス */
	{
		const [canvas, ctx] = createCanvas(STAGE_WIDTH, STAGE_HEIGHT);
		const $canvas = $(canvas).attr('id', 'canvas-steeleel').appendTo('#layer-steeleel');
		$steeleelCanvas = $canvas;
		steeleelCtx = ctx;
	}
	/** コウモリの駐車場接続キャンバス */
	{
		const [canvas, ctx] = createCanvas(STAGE_WIDTH, STAGE_HEIGHT);
		const $canvas = $(canvas).attr('id', 'canvas-drizzler-link').appendTo('#layer-drizzler-link');
		$drizzlerLinkCanvas = $canvas;
		drizzlerLinkCtx = ctx;
	}
	/** ボロノイ図 */
	{
		voronoi = new Voronoi();
		const [canvas, ctx] = createCanvas(STAGE_WIDTH, STAGE_HEIGHT);
		const $canvas = $(canvas).attr('id', 'canvas-voronoi').appendTo('#layer-voronoi');
		$voronoiCanvas = $canvas;
		voronoiCtx = ctx;
	}
	{
		const [canvas, ctx] = createCanvas(STAGE_WIDTH, STAGE_HEIGHT);
		const $canvas = $(canvas).attr('id', 'canvas-voronoi-2').appendTo('#layer-voronoi-2');
		$voronoiCanvas2 = $canvas;
		voronoiCtx2 = ctx;
	}
	/** ラベルをクリックしたときのイベント伝播停止 */
	$('label,input[type=range]').each((i, elm) => {
		$(elm).onMousedown((e) => {
			e.stopPropagation();
		}, true);
	});

	/** 一時描画キャンバス */
	{
		const [canvas, ctx] = createCanvas(canvasSetting.canvasWidth, canvasSetting.canvasHeight);
		const $canvas = $(canvas).attr('id', 'canvas-tempdrawing').appendTo($canvasContainer);
		ctx.lineWidth = 10;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'black';
		ctx.toolSetting = toolSetting;
		$tempDrawingCanvas = $canvas;
		tempDrawingCtx = ctx;
	}

	/** キャンバスツール */
	{
		const key = 'select';
		const title = getLang(`tool-selector-${key}`);
		const $label = $(`<label for="radio-tool-${key}"><input type="radio" name="tool" value="${key}" id="radio-tool-${key}" checked="checked"><div class="stage-selector-name">${title}</div></label>`).appendTo('#tool-selector .selector-container');
	}
	for (let key in canvasTools) {
		const title = getLang(`tool-selector-${key}`);
		const $label = $(`<label for="radio-tool-${key}"><input type="radio" name="tool" value="${key}" id="radio-tool-${key}"><div class="stage-selector-name">${title}</div></label>`).appendTo('#tool-selector .selector-container');
		const $eventLayer = $('<div class="layer-event" id="layer-event-'+key+'"></div>').appendTo($canvasContainer);
		canvasTools[key].init.call(canvasTools[key], $eventLayer);
	}
	$('input[type=radio][name=tool]').myOn('change', (e) => {
		const val = $('input[type=radio][name=tool]:checked').val();
		$('.layer-event').each((i, elm) => $(elm).removeClass('showed'));
		currentTool = val;
		if (val !== 'select') {
			$('#layer-event-'+val).addClass('showed');
		}
		if (!canvasTools.pencil.isDown()) {
			canvasTools.pencil.determineDrawing();
		}
	});

	/** ステージ変形 */
	$stageContainer.css({
		left: `${canvasSetting.canvasWidth / 2}px`,
		top: `${canvasSetting.canvasHeiht / 2}px`,
		transformOrigin: 'center',
		transform: `translate(-50%, -50%)`
	});
	[
		'stage-rotate',
		'stage-scale',
		'stage-x',
		'stage-y'
	].forEach((name) => {
		const $range = $(`#input-range-${name}`);
		const $text = $(`#input-text-${name}`);
		$range.myOn('input', (e) => {
			const id = $range.attr('id');
			const val = $range.val();
			$text.val(val);
			update(id);
		});
		$text.myOn('input', (e) => {
			const id = $range.attr('id');
			const val = $text.val();
			$range.val(val);
			update(id);
		});
		$text.onMousedown((e) => {
			e.preventDefault();
			e.stopPropagation();
			$text.focus();
		});
		function update(id) {
			const cs = canvasSetting;
			// アップデート前のキャンバス中央はステージ座標でいうとどこか
			const centerStagePos1 = canvasXYToStageXY(cs.canvasWidth / 2, cs.canvasHeight / 2);
			// キャンバス設定を更新
			cs.stageX = parseInt($('#input-range-stage-x').val());
			cs.stageY = parseInt($('#input-range-stage-y').val());
			cs.stageRotate = parseInt($('#input-range-stage-rotate').val());
			cs.stageScale = parseFloat($('#input-range-stage-scale').val());
			$('html').cssvar('--stage-scale', `${cs.stageScale}`);
			$('html').cssvar('--stage-rotate', `${cs.stageRotate}deg`);
			// centerStagePos1はいまどこにいった？
			if (id.includes('scale') || id.includes('rotate')) {
				const centerStagePos2 = stageXYToCanvasXY(centerStagePos1.x, centerStagePos1.y);
				const difX = cs.canvasWidth / 2 - centerStagePos2.x;
				const difY = cs.canvasHeight / 2 - centerStagePos2.y;
				cs.stageX = Math.round(cs.stageX + difX);
				cs.stageY = Math.round(cs.stageY + difY);
				$('#input-range-stage-x,#input-text-stage-x').val(cs.stageX);
				$('#input-range-stage-y,#input-text-stage-y').val(cs.stageY);
			}
			$stageContainer.css({
				left: `${cs.canvasWidth / 2 + cs.stageX}px`,
				top: `${cs.canvasHeight / 2 + cs.stageY}px`,
				transformOrigin: 'center center',
				transform: `translate(-50%, -50%) rotate(${cs.stageRotate}deg) scale(${cs.stageScale})`
			});
		}
	});
	[
		'canvas-width',
		'canvas-height'
	].forEach((name) => {
		const $range = $(`#input-range-${name}`);
		const $text = $(`#input-text-${name}`);
		$range.myOn('input', (e) => {
			const val = $range.val();
			$text.val(val);
			update();
		});
		$text.myOn('input', (e) => {
			const val = $text.val();
			$range.val(val);
			update();
		});
		$text.onMousedown((e) => {
			e.preventDefault();
			e.stopPropagation();
			$text.focus();
		});
		function update() {
			canvasSetting.canvasWidth = parseInt($('#input-range-canvas-width').val());
			canvasSetting.canvasHeight = parseInt($('#input-range-canvas-height').val());
			$tempDrawingCanvas.get(0).width = canvasSetting.canvasWidth;
			$tempDrawingCanvas.get(0).height = canvasSetting.canvasHeight;
			$canvasContainer.css({
				width: `${canvasSetting.canvasWidth}px`,
				height: `${canvasSetting.canvasHeight}px`
			});
			$stageContainer.css({
				left: `${canvasSetting.canvasWidth / 2 + canvasSetting.stageX}px`,
				top: `${canvasSetting.canvasHeight / 2 + canvasSetting.stageY}px`,
			});
		}
	});
	
	/** 線の太さ */
	{
	
		const $range = $('#input-range-line-width');
		const $text = $('#input-text-line-width');
		$range.myOn('input', (e) => {
			const val = parseInt($range.val());
			$text.val(val);
			toolSetting.lineWidth = val;
		});
		$text.myOn('input', (e) => {
			const val = parseInt($text.val());
			$range.val(val);
			toolSetting.lineWidth = val;
		});
		$range.val(toolSetting.lineWidth);
		$text.val(toolSetting.lineWidth);
	}

	/** ステージ/潮位/マップタイプの変更 */
	$('#stage-selector input[name=stage],#stage-selector input[name=tide]').myOn('change', () => {
		selectStage();
		saveStorage();
	});
	$('#stage-selector input[name=maptype]').myOn('change', () => {
		canvasSetting.maptype = $('input[type=radio][name=maptype]:checked').val() || 'depthmap';
		$('#stage-image').attr('src', `./assets/img/stage/${canvasSetting.maptype}/${canvasSetting.stage}-${canvasSetting.tide}.png`);
		$('#layer-basket img').each((i, elm) => {
			$(elm).attr('src', `./assets/img/stage-object/mapicon-${canvasSetting.maptype}-basket.png`);
		});
		$('#layer-gusher img').each((i, elm) => {
			$(elm).attr('src', `./assets/img/stage-object/mapicon-${canvasSetting.maptype}-gusher.png`);
		});
		$('#layer-cannon img').each((i, elm) => {
			$(elm).attr('src', `./assets/img/stage-object/mapicon-${canvasSetting.maptype}-cannon.png`);
		});
		$canvasContainer.removeClass('depthmap');
		$canvasContainer.removeClass('screenshot');
		$canvasContainer.removeClass('floorplan');
		$canvasContainer.addClass(canvasSetting.maptype);
		updateVoronoi();
		saveStorage();
	});

	/** y座標キャンバス(不可視)の確保 */
	{
		const [canvas, ctx] = createCanvas(STAGE_WIDTH, STAGE_HEIGHT);
		const $canvas = $(canvas);
		$ymapCanvas = $canvas;
		ymapCtx = ctx;
	}

	/** テキストの翻訳 */
	$('.translate').each((i, elm) => {
		const key = $(elm).attr('langkey');
		const text = getLang(key);
		$(elm).text(text);
	});
	$('.version-text').text(VERSION);

	/** ドラッガブル */
	$('.draggable-panel').each((i, elm) => {
		$(elm).myDraggable({
			isPanel: true,
			isRemovable: false 
		});
	});

	/** レンジスライダーの動作改善 */
	RangeTouch.setup('[type=range]');

	/** カラーピッカー */
	$('#input-text-canvas-color').val('rgb(255, 255, 255)').paletteColorPicker({
		colors: COLORS,
		custom_class: 'double',
		insert: 'after',
		clear_btn: null,
		timeout: 2000,
		onchange_callback: setCanvasColor
	}).hide();

	[
		['drawing-line-color', 'lineColor'],
		['drawing-border-color', 'borderColor'],
		['drawing-fill-color', 'fillColor'],
		['text-color', 'textColor'],
		['text-border-color', 'borderColor']
	].forEach((def) => {
		const setting = def[0].includes('text') ? textSetting : toolSetting;
		$('#input-text-'+def[0]).val(setting[def[1]]).paletteColorPicker({
			colors: COLORS,
			custom_class: 'double',
			insert: 'after',
			clear_btn: null,
			timeout: 2000,
			onchange_callback: (color) => {
				setting[def[1]] = color;
				if (color === 'transparent') {
					$('[data-target='+def[0]+']').addClass('transparent');
				} else {
					$('[data-target='+def[0]+']').removeClass('transparent');
				}
			}
		}).hide();
		if (setting[def[1]] === 'transparent') {
			$('[data-target='+def[0]+']').addClass('transparent');
		}
	});

	$('#font-setting').myOn('change', function(e) {
		const val = $(this).val();
		textSetting.fontFamily = val;
	});

	/** キャンバスの拡縮 */
	const canvasScale = 1;
	$canvasContainer.elmvar('scale', canvasScale);
	$canvasContainer.css('transform-origin', 'left top');
	$canvasContainer.css('transform', `scale(canvasScale)`);

	/** ドロップ時のイベントハンドラを設定します. */
	$('body').myOn('dragenter', (e) => {
		e.preventDefault();
	});
	$('body').myOn('dragover', (e) => {
		e.preventDefault();
	});
	$('body').myOn('drop', (e) => {
		const file = e.dataTransfer.files[0];
		if (!file || !file.type) {
			return;
		}
		if (file.type !== 'application/json' && file.type !== 'text/plain') {
			return;
		}
		const fileReader = new FileReader();
		fileReader.onload = function(e) {
			try {
				const json = JSON.parse(e.target.result);
				readJSON(json);
			} catch(e) {
				console.error(e);
				alert(getLang('message-json-error'));
			}
		}
		fileReader.readAsText(file);
		e.preventDefault();
		e.stopPropagation();
	});

	/** キャンバス変形 - デフォルト */
	$('#stage-transformer-set-default').onMousedown((e) => {
		const transform = DEFAULT_MAP_TRANSFORM[`${canvasSetting.stage}-${canvasSetting.tide}`] || [0, 0, 0.34, 0, 75];
		canvasSetting.stageX      = transform[0];
		canvasSetting.stageY      = transform[1];
		canvasSetting.stageScale  = transform[2];
		canvasSetting.stageRotate = transform[3];
		canvasSetting.seaHeight   = transform[4];
		$('#input-range-stage-x,#input-text-stage-x').val(canvasSetting.stageX);
		$('#input-range-stage-y,#input-text-stage-y').val(canvasSetting.stageY);
		$('#input-range-stage-rotate,#input-text-stage-rotate').val(canvasSetting.stageRotate);
		$('#input-range-stage-scale,#input-text-stage-scale').val(canvasSetting.stageScale);
		$('html').cssvar('--stage-scale', `${canvasSetting.stageScale}`);
		$('html').cssvar('--stage-rotate', `${canvasSetting.stageRotate}deg`);
		$stageContainer.css({
			left: `${canvasSetting.canvasWidth / 2 + canvasSetting.stageX}px`,
			top: `${canvasSetting.canvasHeight / 2 + canvasSetting.stageY}px`,
			transformOrigin: 'center center',
			transform: `translate(-50%, -50%) rotate(${canvasSetting.stageRotate}deg) scale(${canvasSetting.stageScale})`
		});
	});

	/** キャンバス変形 - 変形をゼロに */
	$('#stage-transformer-no-transform').onMousedown((e) => {
		canvasSetting.stageX      = 0;
		canvasSetting.stageY      = 0;
		canvasSetting.stageScale  = 1;
		canvasSetting.stageRotate = 0;
		$('#input-range-stage-x,#input-text-stage-x').val(canvasSetting.stageX);
		$('#input-range-stage-y,#input-text-stage-y').val(canvasSetting.stageY);
		$('#input-range-stage-rotate,#input-text-stage-rotate').val(canvasSetting.stageRotate);
		$('#input-range-stage-scale,#input-text-stage-scale').val(canvasSetting.stageScale);
		$('html').cssvar('--stage-scale', `${canvasSetting.stageScale}`);
		$('html').cssvar('--stage-rotate', `${canvasSetting.stageRotate}deg`);
		$stageContainer.css({
			left: `${canvasSetting.canvasWidth / 2 + canvasSetting.stageX}px`,
			top: `${canvasSetting.canvasHeight / 2 + canvasSetting.stageY}px`,
			transformOrigin: 'center center',
			transform: `translate(-50%, -50%) rotate(${canvasSetting.stageRotate}deg) scale(${canvasSetting.stageScale})`
		});
	});

	/** パネルの位置調整 */
	const windowWidth = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth || 1280;
	$('#object-layer-manager').css('left', (windowWidth - 340) + 'px');
	$('#object-adder').css('left', (windowWidth - 340) + 'px');
	$('#weapon-adder').css('left', (windowWidth - 340) + 'px');

	/** クリックした場所の座標を表示 */
	/*
	$stageContainer.myOn('mousedown', (e) => {
		if (ymapReady) {
			const offset = pageXYToStageXY(e.pageX, e.pageY);
			if (0 <= offset.x && offset.x <= STAGE_WIDTH && 0 <= offset.y && offset.y <= STAGE_HEIGHT) {
				const depthValue = getDepthValueByImagedata(ymapImagedata, offset.x, offset.y);
				console.log(`(x, y, z) = (${offset.x - 1200}, ${depthValue}, ${offset.y - 1200})`);
				//console.log(depthValueToRGB(depthValue + 40));
			}
		}
	});
	*/
}

/** clearLocalStorage()
 */
function clearLocalStorage() {
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(STORAGE_KEY_AUTOSAVE);
	localStorage.removeItem(STORAGE_KEY_JSONSAVE);
}

/** saveStorage()
 * localStorageにセーブします。
 */
function saveStorage() {
	const saveDataObj = {};
	$('#object-layer-manager input[type=checkbox]').each((i, elm) => {
		const key = $(elm).attr('id');
		const val = $(elm).prop('checked');
		saveDataObj[key] = val;
	});
	saveDataObj.stage = $('input[type=radio][name=stage]:checked').val() || 'shakeup';
	saveDataObj.tide = $('input[type=radio][name=tide]:checked').val() || 'normal';
	saveDataObj.maptype = $('input[type=radio][name=maptype]:checked').val() || 'depthmap';
	const saveDataJSON = JSON.stringify(saveDataObj);
	localStorage.setItem(STORAGE_KEY, saveDataJSON);
}

/** loadStorage()
 */
function loadStorage() {
	const saveDataJSON = localStorage.getItem(STORAGE_KEY);
	const saveDataObj = saveDataJSON ? JSON.parse(saveDataJSON) : DEFAULT_SAVEDATAOBJ;
	$('#radio-' + saveDataObj.stage).prop('checked', true);
	$('#radio-' + saveDataObj.tide).prop('checked', true);
	$('#radio-' + saveDataObj.maptype).prop('checked', true);
	$canvasContainer.addClass(saveDataObj.maptype);
}

/** getLang(key)
 */
function getLang(key) {
	return (LANG[ key ]) ? LANG[ key ][USER_LANG] : 'null';
}

/** readXML(xml)
 */
function readXML(xml) {
	function sv1(elm, query) {
		const target = elm.querySelector(query);
		return (target) ? target.getAttribute('StringValue') : '';
	}
	function sv2(elm, query) {
		const arr = elm.querySelectorAll(query);
		return arr[arr.length - 1].getAttribute('StringValue');
	}
	function sv3(elm) {
		const link = elm.querySelector('[Name=Links]');
		if (link) {
			const linkbuf = link.querySelector('[Name=LinkBuf]');
			if (linkbuf) {
				const c1s = link.querySelectorAll('C1');
				if (c1s.length) {
					const ids = [];
					Array.prototype.forEach.call(c1s, (c1) => {
						const a = c1.querySelector('[Name=DestUnitId]');
						if (a) {
							const id = a.getAttribute('StringValue');
							ids.push(id);
						}
					});
					return ids;
				}
			}
		}
		return null;
	}
	const doc = xml.documentElement;
	const elms = doc.querySelectorAll('Root>C1>C0>C1');
	const objs = [];
	const spawners = [];
	const layerNames = [];
	const groupNames = [];
	const groupCounts = {};
	Array.prototype.forEach.call(elms, (item, i) => {
		const id = sv1(item, '[Name=Id]');
		const layer = sv1(item, '[Name=LayerConfigName]');
		const group = sv2(item, '[Name=UnitConfigName]');
		const index = sv1(item, '[Name=InTeamIndex]');
		const tx = parseFloat(sv1(item, '[Name=Translate]>[Name=X]'));
		const ty = parseFloat(sv1(item, '[Name=Translate]>[Name=Y]'));
		const tz = parseFloat(sv1(item, '[Name=Translate]>[Name=Z]'));
		const sx = parseFloat(sv1(item, '[Name=Scale]>[Name=X]'));
		const sy = parseFloat(sv1(item, '[Name=Scale]>[Name=Y]'));
		const sz = parseFloat(sv1(item, '[Name=Scale]>[Name=Z]'));
		const rx = parseFloat(sv1(item, '[Name=Rotate]>[Name=X]'));
		const ry = parseFloat(sv1(item, '[Name=Rotate]>[Name=Y]'));
		const rz = parseFloat(sv1(item, '[Name=Rotate]>[Name=Z]'));
		const links = sv3(item);
		if (!layerNames.includes(layer)) {
			layerNames.push(layer);
		}
		if (!groupNames.includes(group)) {
			groupNames.push(group);
			groupCounts[group] = 1;
		} else {
			groupCounts[group]++;
		}
		const num = groupCounts[group];
		const data = {
			id, num, index, layer, group, tx, ty, tz,
			sx, sy, sz, rx, ry, rz, links
		};
		if (group === 'Rail_Pink') {
			const arr = [];
			const controls = item.querySelectorAll('[Name=RailPoints]>C1');
			Array.prototype.forEach.call(controls, (_item) => {
				const tx = parseFloat(sv1(_item, '[Name=Translate]>[Name=X]'));
				const ty = parseFloat(sv1(_item, '[Name=Translate]>[Name=Y]'));
				const tz = parseFloat(sv1(_item, '[Name=Translate]>[Name=Z]'));
				const c1x = parseFloat(sv1(_item, '[Name=ControlPoints]>C1:nth-child(1)>[Name=X]'));
				const c1y = parseFloat(sv1(_item, '[Name=ControlPoints]>C1:nth-child(1)>[Name=Y]'));
				const c1z = parseFloat(sv1(_item, '[Name=ControlPoints]>C1:nth-child(1)>[Name=Z]'));
				const c2x = parseFloat(sv1(_item, '[Name=ControlPoints]>C1:nth-child(2)>[Name=X]'));
				const c2y = parseFloat(sv1(_item, '[Name=ControlPoints]>C1:nth-child(2)>[Name=Y]'));
				const c2z = parseFloat(sv1(_item, '[Name=ControlPoints]>C1:nth-child(2)>[Name=Z]'));
				arr.push({
					tx, ty, tz, c1x, c1y, c1z, c2x, c2y, c2z
				});
			});
			data.controls = arr;
		}
		objs.push(data);
	});
	stageObjects = objs;
	drizzlerObjects = filterStageObjects('Obj_CoopJumpPointEnemyRocket');
	LAYER_MANAGER_LIST.forEach((layerItem) => {
		if (!layerItem.target) {
			return;
		}
		const $layer = $('#' + layerItem.name);
		objs.forEach((obj) => {
			if (obj.group.includes(layerItem.target)) {
				const $obj = objectCreater[obj.group](obj, canvasSetting.stage, canvasSetting.tide, canvasSetting.maptype);
				if ($obj) {
					$obj.attr('title', `${obj.id}`);
					$layer.append($obj);
				}
			}
		});
	});
	updateDrizzlerLinkCanvas();
	stageObjectsReady = true;
	if (stageObjectsReadyFuncs.length) {
		stageObjectsReadyFuncs.forEach((fn) => {
			fn();
		});
		stageObjectsReadyFuncs = [];
	}
}

/** updateDrizzlerLinkCanvas()
 */
function updateDrizzlerLinkCanvas() {
	drizzlerObjects.forEach((d1) => {
		const ctx = drizzlerLinkCtx;
		if (!isTideEqual(canvasSetting.tide, d1)) {
			return;
		}
		if (d1.links) {
			d1.links.forEach((id) => {
				const d2 = getDrizzlerObject(id);
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(d1.tx + 1200, d1.tz + 1200);
				ctx.lineTo(d2.tx + 1200, d2.tz + 1200);
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 3;
				ctx.stroke();
			});
		}
	});
	drizzlerObjects.forEach((d1) => {
		const ctx = drizzlerLinkCtx;
		if (!isTideEqual(canvasSetting.tide, d1)) {
			return;
		}
		if (d1.links) {
			d1.links.forEach((id) => {
				const d2 = getDrizzlerObject(id);
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(d1.tx + 1200, d1.tz + 1200);
				ctx.lineTo(d2.tx + 1200, d2.tz + 1200);
				ctx.strokeStyle = '#2196f3';
				ctx.lineWidth = 3;
				ctx.stroke();
			});
		}
	});
	$('#layer-drizzler .stage-object.drizzler').each((i, elm) => {
		$(elm).get(0).onclick = (e) => { e.preventDefault() };
		$(elm).onShortTouch((e) => {
			const id = $(elm).attr('for');
			const $input = $('#'+id);
			const val = $input.prop('checked');
			$input.prop('checked', !val);
		});
		$(elm).onLongTouch((e) => {
			const $input = $('#checkbox-layer-voronoi');
			$input.prop('checked', true).myTrigger('change');
			const id = $(elm).attr('for');
			drawVoronoi(id);
		});
	})
}

/** updateVoronoi()
 */
function updateVoronoi() {
	const id = $voronoiCanvas.attr('voronoi-target');
	if (id) {
		drawVoronoi(id);
	}
}

/** drawVoronoi(id)
 */
function drawVoronoi(id) {
	let ctx = voronoiCtx;
	$voronoiCanvas.attr('voronoi-target', id);
	const d1 = getDrizzlerObject(id);
	const ids = [];
	drizzlerObjects.forEach((d2) => {
		if (isTideEqual(canvasSetting.tide, d2) && d2.links && d2.links.includes(id) && !ids.includes(d2.id)) {
			ids.push(d2.id);
		}
	});
	if (d1.links) {
		d1.links.forEach((id2) => {
			if (!ids.includes(id2)) {
				ids.push(id2);
			}
		});
	}
	const poses = [];
	ids.forEach((id) => {
		const d2 = getDrizzlerObject(id);
		poses.push({ x: d2.tx + 1200, y: d2.tz + 1200 });
	});
	if (poses.length) {
		const diagram = voronoi.compute(poses, {
			xl: 0,
			xr: STAGE_WIDTH,
			yt: 0,
			yb: STAGE_HEIGHT
		});
		voronoiCtx.clear();
		voronoiCtx2.clear();
		// see http://hackist.jp/?p=306
		if (canvasSetting.maptype === 'floorplan') {
			var new_cells = [];
			var cell_id, halfedge_id;
			var cellslen = diagram.cells.length;
			for(cell_id = 0; cell_id < cellslen; cell_id++) {
				var new_cell = [];
				var cell = diagram.cells[cell_id];
				var halfedgelen = cell.halfedges.length;
				for(halfedge_id = 0; halfedge_id < halfedgelen; halfedge_id++) {
					var p1 = cell.halfedges[halfedge_id].edge.va;
					var p2 = cell.halfedges[halfedge_id].edge.vb;
					var np1 = (halfedge_id == 0) ? cell.halfedges[halfedge_id+1].edge.va : cell.halfedges[halfedge_id-1].edge.va;
					var np2 = (halfedge_id == 0) ? cell.halfedges[halfedge_id+1].edge.vb : cell.halfedges[halfedge_id-1].edge.vb;
					var tmp_p = (halfedge_id == 0) ? (p1 == np1 || p1 == np2) ? p2 : p1
												   : (p1 == np1 || p1 == np2) ? p1 : p2;
					var new_p = {};
					new_p.x = tmp_p.x;
					new_p.y = tmp_p.y;
					new_cell.push(new_p);
				}
				new_cells.push(new_cell);
			}
			new_cells.forEach((cell, i) => {
				ctx.fillStyle = [
					'#E1FA49',
					'#DB934F',
					'#F263EB',
					'#4F84DB',
					'#5CFF7B',
					'#E1FA49',
					'#DB934F',
					'#F263EB'
				][i];	
				ctx.beginPath();
				cell.forEach((vertex, i) => {
					ctx[(i === 0) ? 'moveTo' : 'lineTo'](vertex.x, vertex.y);
				});
				ctx.closePath();
				ctx.fill();
			});
		}
		if (canvasSetting.maptype !== 'floorplan') {
			ctx = voronoiCtx2;
			ctx.strokeStyle = 'white';
			ctx.lineWidth = 2 / canvasSetting.stageScale;
			var diagramlen = diagram.edges.length;
			for(i = 0; i < diagramlen; i++) {
				var p1 = diagram.edges[i].va;
				var p2 = diagram.edges[i].vb;			
				ctx.beginPath();
				ctx.moveTo(p1.x, p1.y);
				ctx.lineTo(p2.x, p2.y);
				ctx.stroke();
			}
		}
	}
}

/** filterStageObjects(group, water)
 */
function filterStageObjects(group, layer) {
	const ret = [];
	stageObjects.forEach((obj) => {
		if (group && !obj.group.includes(group)) return;
		if (layer && !obj.layer.includes(layer)) return;
		ret.push(obj);
	});
	return ret;
}

/** getDrizzlerObject(id)
 */
function getDrizzlerObject(id) {
	const ret = [];
	for (let i = 0; i < drizzlerObjects.length; i++) {
		if (drizzlerObjects[i].id === id) {
			return drizzlerObjects[i];
		}
	}
	return null;
}

/** selectStage()
 */
function selectStage() {
	canvasSetting.stage = $('input[type=radio][name=stage]:checked').val() || 'shakeup';
	canvasSetting.tide = $('input[type=radio][name=tide]:checked').val() || 'normal';
	canvasSetting.maptype = $('input[type=radio][name=maptype]:checked').val() || 'depthmap';
	loadStage({
		stage  : canvasSetting.stage,
		tide   : canvasSetting.tide,
		maptype: canvasSetting.maptype
	});
}

/** onChangeCanvas()
 */
function onChangeCanvas() {
	clearTimeout(autosaveTimerId);
	if (isEnabledAutosave) {
		autosaveTimerId = setTimeout(autosave, AUTOSAVE_INTERVAL);
	}
}

/** autosave()
 */
function autosave() {
	const json = htmlToJSON();
	const jsonStr = JSON.stringify(json);
	const dateStr = getDateStr();
	const stageStr = getLang('short-' + canvasSetting.stage);
	const tideStr = getLang('short-' + canvasSetting.tide + 'tide');
	const sep = (USER_LANG === 'ja') ? '' : '_';
	const defaultFilename = `${stageStr}${sep}${tideStr}_${dateStr}`;
	const originCanvas = htmlToCanvas();
	const [canvas, ctx] = createCanvas(60, 60);
	ctx.drawImage(originCanvas, 0, 0, 60, 60);
	const thumb = canvas.toDataURL('image/jpeg', 0.5);
	const saveData = {
		json: jsonStr,
		thumb: thumb,
		version: VERSION,
		timestamp: new Date().getTime()
	};
	localStorage.setItem(STORAGE_KEY_AUTOSAVE, JSON.stringify(saveData));
	console.log('%cauto-saved.', 'color: cyan;');
}

/** clearCanvas()
 */
function clearCanvas() {
	$('#layer-item').empty();
	$('#layer-steeleel .stage-object,#layer-steelhead .stage-object').remove();
	steelheadCtx.clear();
	steeleelCtx.clear();
}

/** clearStage()
 */
function clearStage() {
	$('.drizzler-container').remove();
	$('.stage-object').remove();
	$('#canvas-rail').remove();
	tempDrawingCtx.clear();
	drizzlerLinkCtx.clear();
	$voronoiCanvas.removeAttr('voronoi-target');
	voronoiCtx.clear();
	voronoiCtx2.clear();
	clearCanvas();
	$stageContainer.css({
		left: `${canvasSetting.canvasWidth / 2}px`,
		top: `${canvasSetting.canvasHeight / 2}px`,
		transformOrigin: 'center',
		transform: `translate(-50%, -50%)`
	});
}

/** loadStage(options)
 */
function loadStage(options) {

	$('#stage-name').text(getLang(options.stage));
	$('#tide-name').text(getLang(options.tide+'tide'));

	// 現在のステージをクリアする
	clearStage();

	// y座標マップを読み込み直す
	ymapReady = false;
	$.loadImage(`./assets/img/stage/ymap/${options.stage}.png`).then((img) => {
		ymapCtx.drawImage(img, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
		ymapImagedata = ymapCtx.getImageData(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
		ymapReady = true;
		if (ymapReadyFuncs.length) {
			ymapReadyFuncs.forEach((fn) => {
				fn();
			});
			ymapReadyFuncs = [];
		}
	});

	// ポラリス以外ではライドレールを表示しない
	if (options.stage === 'shakeride') {
		$('label[for=checkbox-layer-rail]').show();
	} else {
		$('label[for=checkbox-layer-rail]').hide();
	}

	// XMLファイルの読み込み
	stageObjectsReady = false;
	$.loadXML(`./assets/xml/${options.stage}.xml`).then((data) => {
		readXML(data);
		if (options.onloadxml) options.onloadxml();
	});

	/** ステージ画像 */
	$('#stage-image').attr('src', `./assets/img/stage/${options.maptype}/${options.stage}-${options.tide}.png`).css('display', 'block');

	/** ステージ変形 */
	const transform = DEFAULT_MAP_TRANSFORM[`${options.stage}-${options.tide}`] || [0, 0, 0.34, 0, 75];
	canvasSetting.stageX      = (typeof options.stageX      !== 'undefined') ? options.stageX      : transform[0];
	canvasSetting.stageY      = (typeof options.stageY      !== 'undefined') ? options.stageY      : transform[1];
	canvasSetting.stageScale  = (typeof options.stageScale  !== 'undefined') ? options.stageScale  : transform[2];
	canvasSetting.stageRotate = (typeof options.stageRotate !== 'undefined') ? options.stageRotate : transform[3];
	canvasSetting.seaHeight   = (typeof options.seaHeight   !== 'undefined') ? options.seaHeight   : transform[4];
	$('#input-range-stage-x,#input-text-stage-x').val(canvasSetting.stageX);
	$('#input-range-stage-y,#input-text-stage-y').val(canvasSetting.stageY);
	$('#input-range-stage-rotate,#input-text-stage-rotate').val(canvasSetting.stageRotate);
	$('#input-range-stage-scale,#input-text-stage-scale').val(canvasSetting.stageScale);
	$('html').cssvar('--stage-scale', `${canvasSetting.stageScale}`);
	$('html').cssvar('--stage-rotate', `${canvasSetting.stageRotate}deg`);
	$stageContainer.css({
		left: `${canvasSetting.canvasWidth / 2 + canvasSetting.stageX}px`,
		top: `${canvasSetting.canvasHeight / 2 + canvasSetting.stageY}px`,
		transformOrigin: 'center center',
		transform: `translate(-50%, -50%) rotate(${canvasSetting.stageRotate}deg) scale(${canvasSetting.stageScale})`
	});

	if (typeof options.canvasWidth !== 'undefined') {
		canvasSetting.canvasWidth = options.canvasWidth;
		canvasSetting.canvasHeight = options.canvasHeight;
		$('#input-range-canvas-width,#input-text-canvas-width').val(canvasSetting.canvasWidth);
		$('#input-range-canvas-height,#input-text-canvas-height').val(canvasSetting.canvasHeight).myTrigger('input');
	}

	if (options.canvasColor) {
		$('#input-text-canvas-color').val(options.canvasColor.replace('transparent', ''));
		setCanvasColor(options.canvasColor);
	}
}

/** setCanvasColor(color)
 */
function setCanvasColor(color) {
	$canvasContainer.css('background', color);
	canvasSetting.canvasColor = color;
	if (color === 'transparent') {
		$('[data-target=canvas-color]').addClass('transparent');
	} else {
		$('[data-target=canvas-color]').removeClass('transparent');
	}
}

/** readShareURL()
 */
function readShareURL() {
	const queries = getQueries();
	if (queries.hasOwnProperty('json')) {
		try {
			const json = JSON.parse(decodeURIComponent(queries.json));
			readJSON(json);
			return true;
		} catch (e) {
			console.error(e);
			alert(getLang('message-share-error'));
		}
	}
	return false;
}

/** closeLoadJSON()
 */
function closeLoadJSON() {
	const $load = $('#load');
	$load.hide();
}

/** loadJSON()
 */
function loadJSON() {
	let autoSaveData = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
	autoSaveData = (autoSaveData) ? JSON.parse(autoSaveData) : {};
	let saveData = localStorage.getItem(STORAGE_KEY_JSONSAVE);
	saveData = (saveData) ? JSON.parse(saveData) : {};
	autoSaveData.isAutoSave = true;
	autoSaveData.title = getLang('autosave');
	const dataArray = [ autoSaveData ];
	for (let key in saveData) {
		saveData[key].title = key;
		dataArray.push(saveData[key]);
	}
	const $load = $('#load').find('.cover-inner');
	$load.empty();
	dataArray.forEach((data) => {
		if (!(data.timestamp && data.json)) {
			return;
		}
		const dateStr = parseTimestamp(data.timestamp);
		const $item = $(`
			<div class="data-item">
				<div class="data-left">
					<img src="${data.thumb}">
				</div>
				<div class="data-center">
					<div class="data-title">${data.title}</div>
					<div class="data-date">${dateStr}</div>
				</div>
				<div class="data-right">
					<div class="data-delete">${getLang('delete')}</div>
				</div>
			</div>
		`);
		$item.get(0).onclick = () => {
			const json = JSON.parse(data.json);
			currentFilename = (data.isAutoSave) ? '' : data.title;
			readJSON(json)
			closeLoadJSON();
		};
		$item.find('.data-delete').get(0).onclick = (e) => {
			if (window.confirm(getLang('confirm-delete'))) {
				if (data.isAutoSave) {
					localStorage.removeItem(STORAGE_KEY_AUTOSAVE);
				} else {
					delete saveData[data.title];
					localStorage.setItem(STORAGE_KEY_JSONSAVE, JSON.stringify(saveData));
				}
				closeLoadJSON();
				e.stopPropagation();
				loadJSON();
			}
		};
		$load.append($item);
	});
	const $close = $(`<button>${getLang('cancel')}</button>`);
	$close.get(0).onclick = closeLoadJSON;
	$load.append($close);
	$('#load').show();
}

/** saveJSON()
 */
function saveJSON() {
	if (!currentFilename) {
		toastr.options = {
			'closeButton': true,
			'positionClass': 'toast-bottom-right',
			'timeOut': '2000',
		};
		toastr.error(getLang('message-no-save-target'));
		return;
	}
	const json = htmlToJSON();
	const jsonStr = JSON.stringify(json);
	const dateStr = getDateStr();
	const stageStr = getLang('short-' + canvasSetting.stage);
	const tideStr = getLang('short-' + canvasSetting.tide + 'tide');
	const sep = (USER_LANG === 'ja') ? '' : '_';
	const defaultFilename = `${stageStr}${sep}${tideStr}_${dateStr}`;
	const originCanvas = htmlToCanvas();
	const [canvas, ctx] = createCanvas(60, 60);
	ctx.drawImage(originCanvas, 0, 0, 60, 60);
	const thumb = canvas.toDataURL('image/jpeg', 0.5);
	let saveData = localStorage.getItem(STORAGE_KEY_JSONSAVE);
	saveData = (saveData) ? JSON.parse(saveData) : {};
	if (currentFilename in saveData) {
		saveData[currentFilename] = {
			json: jsonStr,
			thumb: thumb,
			version: VERSION,
			timestamp: new Date().getTime()
		};
		localStorage.setItem(STORAGE_KEY_JSONSAVE, JSON.stringify(saveData));
		toastr.options = {
			'closeButton': true,
			'positionClass': 'toast-bottom-right',
			'timeOut': '2000',
		};
		toastr.success(getLang('message-success-save-json'));
	}
}

/** saveAsJSON()
 */
function saveAsJSON() {
	const json = htmlToJSON();
	const jsonStr = JSON.stringify(json);
	const dateStr = getDateStr();
	const stageStr = getLang('short-' + canvasSetting.stage);
	const tideStr = getLang('short-' + canvasSetting.tide + 'tide');
	const sep = (USER_LANG === 'ja') ? '' : '_';
	const defaultFilename = (currentFilename) ? currentFilename : `${stageStr}${sep}${tideStr}_${dateStr}`;
	const originCanvas = htmlToCanvas();
	const [canvas, ctx] = createCanvas(60, 60);
	ctx.drawImage(originCanvas, 0, 0, 60, 60);
	const thumb = canvas.toDataURL('image/jpeg', 0.5);
	myConfirm({
		textInput: defaultFilename,
		funcOK: (text) => {
			let saveData = localStorage.getItem(STORAGE_KEY_JSONSAVE);
			saveData = (saveData) ? JSON.parse(saveData) : {};
			if (text in saveData) {
				if (!window.confirm(getLang('confirm-overwrite'))) {
					return;
				}
			}
			saveData[text] = {
				json: jsonStr,
				thumb: thumb,
				version: VERSION,
				timestamp: new Date().getTime()
			};
			localStorage.setItem(STORAGE_KEY_JSONSAVE, JSON.stringify(saveData));
			currentFilename = text;
			toastr.options = {
				'closeButton': true,
				'positionClass': 'toast-bottom-right',
				'timeOut': '2000',
			};
			toastr.success(getLang('message-success-save-as-json'));
		}
	});
}

/** copyShareURL()
 */
function copyShareURL() {
	const json = htmlToJSON();
	const jsonStr = JSON.stringify(json);
	const jsonStrEncode = encodeURIComponent(jsonStr);
	const url = location.href.split('?')[0] + '?json=' + jsonStrEncode;
	const ret = copyStr(url);
	if (ret) {
		toastr.options = {
			'closeButton': true,
			'positionClass': 'toast-bottom-right',
			'timeOut': '2000',
		};
		toastr.success(getLang('message-success-copy-share-url'));
	}
}

/** downloadJSON()
 */
function downloadJSON() {
	const json = htmlToJSON();
	const jsonStr = JSON.stringify(json);
	const dateStr = getDateStr();
	const stageStr = getLang('short-' + canvasSetting.stage);
	const tideStr = getLang('short-' + canvasSetting.tide + 'tide');
	const sep = (USER_LANG === 'ja') ? '' : '_';
	const defaultFilename = `${stageStr}${sep}${tideStr}_${dateStr}`;
	downloadText(jsonStr, defaultFilename + '.json');
}

/** downloadPNG()
 */
function downloadPNG() {
	const viewCanvas = htmlToCanvas();
	const dateStr = getDateStr();
	const stageStr = getLang('short-' + canvasSetting.stage);
	const tideStr = getLang('short-' + canvasSetting.tide + 'tide');
	const sep = (USER_LANG === 'ja') ? '' : '_';
	const defaultFilename = `${stageStr}${sep}${tideStr}_${dateStr}`;
	downloadCanvas(viewCanvas, defaultFilename + '.png');
}

/** checkHTCQuality()
 */
function checkHTCQuality() {
	const viewCanvas = htmlToCanvas();
	if ($('#view-canvas').size() > 0) {
		$('#view-canvas').remove();
	}
	$('#copy-canvas-area').append(viewCanvas);
}

/** updateSteelEelCanvas()
 */
function updateSteelEelCanvas() {
	steeleelCtx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
	steeleelCtx.strokeStyle = '#16531b';
	steeleelCtx.lineWidth = 4;
	steeleelCtx.beginPath();
	$('.stage-object.eel').each((i, elm) => {
		$(elm).find('.stage-object-eel-node').each((j, node) => {
			const x = parseFloat($(node).css('left'));
			const y = parseFloat($(node).css('top'));
			(j === 0) ? steeleelCtx.moveTo(x, y) : steeleelCtx.lineTo(x, y);
		});
	});
	steeleelCtx.stroke();
}

/** updateSteelheadCanvas()
 */
function updateSteelheadCanvas() {
	steelheadCtx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
	$('.stage-object.steelhead').each((i, elm) => {
		if (ymapReady) {
			const offset = $(elm).getXY();
			if (0 <= offset.x && offset.x <= STAGE_WIDTH && 0 <= offset.y && offset.y <= STAGE_HEIGHT) {
				const depthValue = getDepthValueByImagedata(ymapImagedata, offset.x, offset.y);
				const type = parseInt($(elm).attr('data-type'));
				drawSteelheadCircle(offset.x, offset.y, type);
			}
		}
	});
}

/** addSteelEel(options)
 */
function addSteelEel(options = {}) {
	const offset = canvasXYToStageXY(canvasSetting.canvasWidth / 2, canvasSetting.canvasHeight / 2);
	if (!stageObjectsReady) {
		stageObjectsReadyFuncs.push(() => {
			addSteelEel(options);
		});
		return;
	}
	const cs = canvasSetting;
	const tide = (cs.tide === 'high') ? 'CoopWater_2' : (cs.tide === 'normal') ? 'CoopWater_1' : 'CoopWater_0';
	const spawners = filterStageObjects('Obj_CoopSpawnPointZako', tide);
	const firstX = offset.x; //spawners[0].tx + 1200;
	const firstY = offset.y; //spawners[0].tz + 1200;
	const firstR = - spawners[0].ry;
	if (!options.hasOwnProperty('nodePositions')) {
		const nodePositions = [];
		for (let i = 0; i < 15; i++) {
			nodePositions.push({ x: firstX, y: firstY, r: firstR });
		}
		options.nodePositions = nodePositions;
	}
	const $eelContainer = $('<div class="stage-object eel"></div>');
	const $nodeList = [];
	const beforeEvent = {};
	for (let sumD = 0, i = 0; i < 15; i++) {
		const $node = $('<img class="stage-object-eel-node">');
		let d = (i === 0) ?  0:
				(i === 1) ? 9:
				(i + 1 === 15) ? 19: 19;
		sumD += d;
		$node.minD = sumD;
		$eelContainer.append($node);
		$nodeList.push($node);
		$node.setXY(options.nodePositions[i].x, options.nodePositions[i].y);
		let src;
		if (i === 0) {
			src = './assets/img/stage-object/eel-head.png';
		} else if (i + 1 === 15) {
			src = './assets/img/stage-object/eel-tail.png';
		} else {
			src = './assets/img/stage-object/eel-body.png';
		}
		$node.attr('src', src);
		$node.elmvar('rotate', `${options.nodePositions[i].r}deg`);
		$node.cssvar('--rotate', `${options.nodePositions[i].r}deg`);
	}
	const $head = $nodeList[0];
	$head.$family = $eelContainer;
	$head.$nodeList = $nodeList;
	$head.addClass('stage-object-eel-head');
	$head.difX = -1;
	$head.difY = -1;
	$head.distanceTravelled = 0;
	$head.tracks = [];
	for (let i = options.nodePositions.length - 1; i >= 0; i--) {
		const pos1 = options.nodePositions[i];
		let distance = 0;
		if (i + 1 < options.nodePositions.length) {
			const pos2 = options.nodePositions[i + 1];
			distance = getDistance(pos1, pos2);
		}
		$head.tracks.unshift([pos1.x, pos1.y, distance]);
		$head.distanceTravelled += distance;
	}
	$canvasContainer.$steeleelHead = null;
	$head.myDraggable({
		parentType: 'stage',
		drag: () => {
			const offset = $head.getXY();
			const tx = offset.x;
			const ty = offset.y;
			const bx = $head.tracks[0][0];
			const by = $head.tracks[0][1];
			const distance = Math.sqrt((bx - tx) ** 2 + (by - ty) ** 2);
			$head.distanceTravelled += distance;
			$head.tracks.unshift([tx, ty, distance]);
			if ($head.tracks[10]) {
				let i;
				let sum = 0;
				for (i = 0; i < $head.tracks.length; i++) {
					sum += $head.tracks[i][2];
					if (sum > 20) {
						break;
					}
				}
				i = Math.min(i, $head.tracks.length - 1);
				const bbx = $head.tracks[i][0];
				const bby = $head.tracks[i][1];
				const headAngle = getVectorAngle({x: tx - bbx, y: ty - bby}) || 0;
				$head.elmvar('rotate', headAngle - 90);
				$head.cssvar('--rotate', `${headAngle - 90}deg`);
			}
			let lastI = 0;
			let lastJ = 0;
			for (let i = 1; i < $nodeList.length; i++) {
				const $node = $nodeList[i];
				const minD = $node.minD;
				if ($head.distanceTravelled > minD) {
					let sum = 0;
					for (let j = 0; j < $head.tracks.length; j++) {
						const track = $head.tracks[j];
						sum += track[2];
						if (sum > minD) {
							const over = sum - minD;
							const ratio = over / track[2];
							const newX = $head.tracks[j + 1][0] + ratio * ($head.tracks[j][0] - $head.tracks[j + 1][0]);
							const newY = $head.tracks[j + 1][1] + ratio * ($head.tracks[j][1] - $head.tracks[j + 1][1]);
							$node.setXY(newX, newY);
							lastJ = j;
							lastI = i;
							break;
						}
					}
				}
			}
			let $aheadNode = $head;
			for (let i = 1; i < $nodeList.length; i++) {
				const $node = $nodeList[i];
				const nodeX = parseFloat($node.css('left'));
				const nodeY = parseFloat($node.css('top'));
				const aheadNodeX = parseFloat($aheadNode.css('left'));
				const aheadNodeY = parseFloat($aheadNode.css('top'));
				const nodeAngle = getVectorAngle({x: nodeX - aheadNodeX, y: nodeY - aheadNodeY});
				$node.elmvar('rotate', (nodeAngle || -90) + 90);
				$node.cssvar('--rotate', `${(nodeAngle || -90) + 90}deg`);
				$aheadNode = $node;
			}
			if (lastI + 1 === 15) {
				while ($head.tracks.length > lastJ + 2) {
					$head.tracks.pop();
				}
			}
			updateSteelEelCanvas();
		}
	})
	.onLongTouch(() => {
		const top = $head.css('top');
		const left = $head.css('left');
		const rotate = $head.elmvar('rotate');
		for (let i = 1; i < $nodeList.length; i++) {
			const $node = $nodeList[i];
			$node.css('top', top);
			$node.css('left', left);
			$node.elmvar('rotate', rotate);
			$node.cssvar('--rotate', `${rotate}deg`);
		}
		$head.distanceTravelled = 0;
		$head.tracks = [[parseInt(left), parseInt(top), 0]];
		updateSteelEelCanvas();
	});
	$('#layer-steeleel').append($eelContainer);
	steeleelCtx.strokeStyle = '#16531b';
	steeleelCtx.lineWidth = 4;
	steeleelCtx.beginPath();
	$nodeList.forEach(($node, i) => {
		const { x, y } = $node.getXY();
		(i === 0) ? steeleelCtx.moveTo(x, y) : steeleelCtx.lineTo(x, y);
	});
	steeleelCtx.stroke();
	onChangeCanvas();
}

/** addSteelheadCircle(options)
 */
function addSteelheadCircle(options = {}) {
	const offset = canvasXYToStageXY(canvasSetting.canvasWidth / 2, canvasSetting.canvasHeight / 2);
	options = $.extend({}, {
		x: offset.x,
		y: offset.y,
		type: 0
	}, options);
	const $steelheadIcon = $('<div class="stage-object steelhead"></div>')
	.attr('data-type', options.type)
	.appendTo('#layer-steelhead');
	$steelheadIcon.stop = () => {
	};
	$steelheadIcon.onMousedown((e) => {
		$canvasContainer.$steelheadIcon = $steelheadIcon;
		const startX = parseFloat($steelheadIcon.css('left'));
		const startY = parseFloat($steelheadIcon.css('top'));
		const page = getPageXY(e);
		const offset = pageXYToStageXY(page.x, page.y);
		$steelheadIcon.difX = startX - offset.x;
		$steelheadIcon.difY = startY - offset.y;
		e.preventDefault();
		e.stopPropagation();
	})
	.onShortTouch((e) => {
		const type = parseInt($steelheadIcon.attr('data-type'));
		$steelheadIcon.attr('data-type', (type + 1) % 4);
		$steelheadIcon.stop($steelheadIcon.get(0));
	})
	.setXY(options.x, options.y)
	.myDraggable({
		parentType: 'stage',
		stop: updateSteelheadCanvas
	});
	if (ymapReady) {
		updateSteelheadCanvas();
	} else {
		ymapReadyFuncs.push(() => {
			updateSteelheadCanvas();
		});
	}
	onChangeCanvas();
}

/** drawSteelheadCircle(x, y, type)
 */
function drawSteelheadCircle(x, y, type = 0) {
	const imagedata = steelheadCtx.getImageData(0, 0, 2400, 2400);
	let depthValue1;
	let depthValue2;
	depthValue1 = getDepthValueByImagedata(ymapImagedata, x, y);
	const range = 250;
	const left = Math.max(0, parseInt(x - range));
	const top = Math.max(0, parseInt(y - range));
	const right = Math.min(ymapImagedata.width, parseInt(x + range));
	const bottom = Math.min(ymapImagedata.height, parseInt(y + range));
	for (let _y = top; _y < bottom; _y++) {
		for (let _x = left; _x < right; _x++) {
			depthValue2 = getDepthValueByImagedata(ymapImagedata, _x, _y);
			if (depthValue2 >= canvasSetting.seaHeight) {
				const distance = Math.sqrt((_x - x) * (_x - x) + (_y - y) * (_y - y));
				const heightdif = Math.abs(depthValue2 - depthValue1);
				let rgb = false;
				if (type === 0 && distance < 200 && heightdif <= 50) {
					rgb = [255, 130, 0];
				} else if (type === 1 && distance < 250 && heightdif <= 70) {
					rgb = [255, 210, 0];
				} else if (type === 2 && distance < 200 && heightdif <= 10) {
					rgb = [255, 30, 0];
				} else if (type === 3) {
					if (distance < 200 && heightdif <= 10) {
						rgb = [255, 30, 0];
					} else if (distance < 200 && heightdif <= 50) {
						rgb = [255, 130, 0];
					} else if (distance < 250 && heightdif <= 70) {
						rgb = [255, 210, 0];
					}
				}
				if (rgb) {
					const i = 4 * (_y * ymapImagedata.width + _x);
					imagedata.data[i + 0] = rgb[0];
					imagedata.data[i + 1] = rgb[1];
					imagedata.data[i + 2] = rgb[2];
					imagedata.data[i + 3] = 130;
				}
			}
		}
	}
	steelheadCtx.putImageData(imagedata, 0, 0);
}

/** addWeapon(options)
 */
function addWeapon(options = {}) {
	if (!WEAPON.hasOwnProperty(`weapon-${options.id}`)) {
		return;
	}
	const offset = canvasXYToStageXY(canvasSetting.canvasWidth / 2, canvasSetting.canvasHeight / 2);
	options = $.extend({}, {
		id: 0,
		x: offset.x,
		y: offset.y,
		width: Math.round(48 / canvasSetting.stageScale),
		height: Math.round(48 / canvasSetting.stageScale),
		initialVisibleRange: true,
		initialRotate: - canvasSetting.stageRotate,
		initialRotateRange: 270
	}, options);
	const weaponData = WEAPON[`weapon-${options.id}`];
	const weaponImgDir = (options.width <= 128) ? 'weapon' : 'weapon-big';
	const $weaponContainer = $('<div class="weapon-container" data-weapon-id="'+options.id+'" style="width: '+options.width+'px; height: '+options.height+'px;"><img src="./assets/img/'+weaponImgDir+'/'+options.id+'.png"><div class="range-container"><div class="range-line"></div><div class="v-range-line"></div><div class="range-end"></div><div class="range-far"></div><div class="v-range-end"></div><div class="v-range-far"></div><div class="range-near-end"></div><div class="range-blast"></div><div class="range-handle"></div></div></div>')
	.attr('item-type', 'weapon')
	.addClass('added-item')
	.data('size', 'small')
	.cssvar('--range', (weaponData.range / 10 * 50) + 'px')
	.cssvar('--blast', (weaponData.blast / 10 * 50 * 2) + 'px')
	.cssvar('--range-near', (weaponData.rangeNear / 10 * 50) + 'px')
	.cssvar('--range-far', (weaponData.rangeFar / 10 * 50) + 'px')
	.cssvar('--v-range', (weaponData.vRange / 10 * 50) + 'px')
	.cssvar('--v-range-far', (weaponData.vRangeFar / 10 * 50) + 'px')
	.appendTo('#layer-item')
	.setXY(options.x, options.y)
	.myDraggable({
		parentType: 'stage'
	})
	.onShortTouch((elm) => {
		$weaponContainer.find('.range-container').toggle();
	})
	.myResizable({
		resize: (elm) => {
			const $elm = $(elm);
			const size = $elm.getWH();
			if (size.width > 128 && $elm.data('size') !== 'big') {
				$elm.data('size', 'big');
				const $img = $elm.find('img');
				const src = $img.attr('src');
				$img.attr('src', src.replace('/weapon/', '/weapon-big/'));
			}
		}
	})
	.myRotatable({
		initialRotate: options.initialRotate,
		isTransformCenter: true
	});
	$weaponContainer.find('img').setImageBorder(1);
	if (weaponData.vRange > -1) {
		$weaponContainer.find('.range-line').addClass('h-range-line');
		$weaponContainer.find('.range-end').addClass('h-range-end');
		$weaponContainer.find('.range-far').addClass('h-range-far');
	} else {
		$weaponContainer.find('.v-range-line').remove();
		$weaponContainer.find('.v-range-end').remove();
		$weaponContainer.find('.v-range-far').remove();
	}
	if (weaponData.rangeNear < 0) {
		$weaponContainer.find('.range-near-end').remove();
	}
	if (weaponData.blast < 0) {
		$weaponContainer.find('.range-blast').remove();
	}
	if (weaponData.rangeFar < 0) {
		$weaponContainer.find('.range-far').remove();
	}
	$weaponContainer.find('.range-container').myRotatable({
		initialRotate: options.initialRotateRange,
		handle: $weaponContainer.find('.range-handle')
	});
	if (!options.initialVisibleRange) {
		$weaponContainer.find('.range-container').hide();
	}
	onChangeCanvas();
}
/** addImage(options)
 */
function addImage(options = {}) {
	const offset = canvasXYToStageXY(canvasSetting.canvasWidth / 2, canvasSetting.canvasHeight / 2);
	options = $.extend({}, {
		src: '',
		x: offset.x,
		y: offset.y,
		width: Math.round(48 / canvasSetting.stageScale),
		height: Math.round(48 / canvasSetting.stageScale),
		initialRotate: - canvasSetting.stageRotate
	}, options);
	const $imgContainer = $('<div class="image-container" style="width: '+options.width+'px; height: '+options.height+'px;"><img src="'+options.src+'"></div>')
	.attr('item-type', 'image')
	.addClass('added-item')
	.appendTo('#layer-item')
	.setXY(options.x, options.y)
	.myDraggable({
		parentType: 'stage'
	})
	.myResizable({
		parentType: 'stage'
	})
	.myRotatable({
		initialRotate: options.initialRotate,
		isTransformCenter: true,
	})
	.find('img').setImageBorder(1);
	onChangeCanvas();
}

/** addTextarea()
 */
function addTextarea(options = {}) {
	const offset = canvasXYToStageXY(canvasSetting.canvasWidth / 2, canvasSetting.canvasHeight / 2);
	options = $.extend({}, {
		text: getLang('object-adder-text-initial-value'),
		x: offset.x,
		y: offset.y,
		fontSize: Math.round(32 / canvasSetting.stageScale),
		textColor: null,
		borderColor: null,
		fontFamily: null,
		initialRotate: - canvasSetting.stageRotate
	}, textSetting, options);
	const $textareaContainer = $('<div class="textarea-container" ></div>');
	const $textarea = $('<textarea>' + options.text + '</textarea>');
	const $draggableArea = $('<div></div>');
	$textareaContainer
	.attr('item-type', 'text')
	.addClass('added-item')
	.elmvar('isFirstEdit', true)
	.setXY(options.x, options.y)
	.append($textarea)
	.append($draggableArea)
	.appendTo('#layer-item')
	.myDraggable({ parentType: 'stage' })
	.onDoubleClick((elm) => {
		$textareaContainer.addClass('mydraggable-disable');
		$draggableArea.hide();
		setTimeout(() => {
			$textarea.get(0).focus();
			if ($textareaContainer.elmvar('isFirstEdit')) {
				$textareaContainer.elmvar('isFirstEdit', false);
				$textarea.get(0).setSelectionRange(0, $textarea.val().length);
			}
		}, 100);
	})
	.myResizable({
		elmType: 'text',
		ratio: 2
	})
	.myRotatable({
		initialRotate: options.initialRotate,
		isTransformCenter: true,
	});
	$textarea.myOn('input', (e) => {
		const style = window.getComputedStyle($textarea.get(0));
		const $body = $('body');
		const $test = $('<p>' + $textarea.val() + '</p>').css({
			'margin': '0',
			'padding': '0',
			'position': 'fixed',
			'left': '-100%',
			'top': '-100%',
			'word-break': 'break-all',
			'white-space': 'nowrap',
			'line-height': style.lineHeight,
			'letter-spacing': style.letterSpacing,
			'font-size': style.fontSize,
			'font-family': style.fontFamily,
			'font-weight': style.fontWeight
		}).appendTo('body');
		const lines = $textarea.val().split('\n');
		let maxWidth = -1;
		let maxHeight = -1;
		//const lines = ( + '\n').match(/\n/g).length;
		//$(this).height(lineHeight * lines);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line) {
				$test.text(line);
				const width = $test.width();
				const height = $test.height();
				if (maxWidth < width) {
					maxWidth = width;
				}
				if (maxHeight < height) {
					maxHeight = height;
				}
			}
		}
		$test.remove();
		$textarea.css({
			width: `${maxWidth}px`,
			height: `${maxHeight * lines.length}px`,
		});
		$draggableArea.css({
			width: `${maxWidth}px`,
			height: `${maxHeight * lines.length}px`,
		});
		$textarea.setTextBorder(Math.round(2 / canvasSetting.stageScale), options.borderColor)
	}).myOn('focusout', (e) => {
		$textareaContainer.removeClass('mydraggable-disable');
		$draggableArea.show();
	})
	.css('font-size', options.fontSize + 'px')
	.css('color', options.textColor)
	.addClass('font-' + options.fontFamily)
	.setTextBorder(Math.round(2 / canvasSetting.stageScale), options.borderColor)
	.elmvar('options', options)
	.myTrigger('input');
	onChangeCanvas();
}
/** end */
