// =========================================================
// utilities.js
// =========================================================

/** constants
 */
const CHARCODE_a = ('a').charCodeAt(0);
const CHARCODE_A = ('A').charCodeAt(0);

/** numberToAlphabet(num)
 */
function numberToAlphabet(num) {
	num = parseInt(Math.max(-25, Math.min(26, num)));
	if (num <= 0) {
		return String.fromCharCode(CHARCODE_a + num + 25);
	} else {
		return String.fromCharCode(CHARCODE_A + num - 1);
	}
}

/** alphabetToNumber(chr)
 */
function alphabetToNumber(chr = 'a') {
	const code = chr.charCodeAt(chr);
	let ret;
	if (code < CHARCODE_a) {
		ret = code - CHARCODE_A + 1;
	} else {
		ret = code - CHARCODE_a - 25;
	}
	return parseInt(Math.max(-25, Math.min(26, ret)));
}

/** getElementsPageXY(elm)
 */
function getElementsCenterPageXY(elm) {
	const scrollTarget = document.scrollingElement || document.documentElement || document.body;
	const scrollLeft = scrollTarget.scrollLeft;
	const scrollTop = scrollTarget.scrollTop;
	const bounds = elm.getBoundingClientRect();
	return {
		x: (bounds.left + bounds.right) / 2 + scrollLeft,
		y: (bounds.top + bounds.bottom) / 2 + scrollTop
	};
}

/** getPageXY(e)
 */
function getPageXY(e) {
	const x = 'pageX' in e ? e.pageX :
	e.targetTouches && e.targetTouches.length ? e.targetTouches[0].pageX :
	lastTouchEvent.targetTouches && lastTouchEvent.targetTouches.length ? lastTouchEvent.targetTouches[0].pageX : 0;
	const y = 'pageY' in e ? e.pageY :
	e.targetTouches && e.targetTouches.length ? e.targetTouches[0].pageY :
	lastTouchEvent.targetTouches && lastTouchEvent.targetTouches.length ? lastTouchEvent.targetTouches[0].pageY : 0;
	return { x, y };
}

/** canvasXYToPageXY(canvasX, canvasY)
 */
function canvasXYToPageXY(canvasX, canvasY) {
	if (typeof canvasX === 'object') {
		canvasY = canvasX.y;
		canvasX = canvasX.x;
	}
	const parentElm = $('#canvas-container');
	const scrollTarget = document.scrollingElement || document.documentElement || document.body;
	const scrollLeft = scrollTarget.scrollLeft;
	const scrollTop = scrollTarget.scrollTop;
	const bounds = parentElm.get(0).getBoundingClientRect();
	return {
		x: canvasX + bounds.left + scrollLeft,
		y: canvasY + bounds.top + scrollTop
	};
}

/** pageXYToCanvasXY(pageX, pageY)
 */
function pageXYToCanvasXY(pageX, pageY) {
	if (typeof pageX === 'object') {
		pageY = pageX.y;
		pageX = pageX.x;
	}
	const parentElm = $canvasContainer;
	const scrollTarget = document.scrollingElement || document.documentElement || document.body;
	const scrollLeft = scrollTarget.scrollLeft;
	const scrollTop = scrollTarget.scrollTop;
	const bounds = parentElm.get(0).getBoundingClientRect();
	return getMultipliedVector({
		x: pageX - bounds.left - scrollLeft,
		y: pageY - bounds.top - scrollTop
	}, 1 / $canvasContainer.elmvar('scale'));
}

/** getMultipliedVector(vec, ratio)
 */
function getMultipliedVector(vec, ratio) {
	return {
		x: vec.x * ratio,
		y: vec.y * ratio
	};
}

/** getMultipliedWH(wh, ratio)
 */
function getMultipliedWH(wh, ratio) {
	return {
		width: wh.width * ratio,
		height: wh.height * ratio
	};
}

/** canvasXYToStageXY(canvasX, canvasY)
 */
function canvasXYToStageXY(canvasX, canvasY) {
	if (typeof canvasX === 'object') {
		canvasY = canvasX.y;
		canvasX = canvasX.x;
	}
	const cs = canvasSetting;
	const vec1 = {
		x: canvasX - (cs.canvasWidth / 2 + cs.stageX),
		y: canvasY - (cs.canvasHeight / 2 + cs.stageY)
	};
	const vec2 = getRotatedVector(vec1, - cs.stageRotate);
	return {
		x: 1200 + vec2.x / cs.stageScale,
		y: 1200 + vec2.y / cs.stageScale
	};
}

/** stageXYToCanvasXY(stageX, stageY)
 */
function stageXYToCanvasXY(stageX, stageY) {
	if (typeof stageX === 'object') {
		stageY = stageX.y;
		stageX = stageX.x;
	}
	const cs = canvasSetting;
	const vec1 = {
		x: stageX - 1200,
		y: stageY - 1200
	};
	const vec2 = getRotatedVector(vec1, cs.stageRotate);
	return vec3 = {
		x: cs.canvasWidth / 2 + cs.stageX + vec2.x * cs.stageScale,
		y: cs.canvasHeight / 2 + cs.stageY + vec2.y * cs.stageScale
	};
}

/** pageXYToStageXY(pageX, pageY)
 */
function pageXYToStageXY(pageX, pageY) {
	if (typeof pageX === 'object') {
		pageY = pageX.y;
		pageX = pageX.x;
	}
	const offset = pageXYToCanvasXY(pageX, pageY);
	return canvasXYToStageXY(offset.x, offset.y);
}

/** getDistance(v1, v2 = {x: 0, y: 0})
 */
function getDistance(v1, v2 = {x: 0, y: 0}) {
	return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
}

/** parseIntVec(vec)
 */
function parseIntVec(vec) {
	return {
		x: parseInt(vec.x),
		y: parseInt(vec.y)
	};
}

/** getVectorAngle(vec)
 */
function getVectorAngle(vec) {
	const asin = Math.asin(vec.y / getDistance(vec)) * (180 / Math.PI);
	if (vec.y >= 0) {
		if (vec.x > 0) {
			return asin;
		} else {
			return 180 - asin;
		}
	} else {
		if (vec.x > 0) {
			return 360 - Math.abs(asin);
		} else {
			return 180 + Math.abs(asin);
		}
	}
}

/** getRotatedVector(vec, deg)
 */
function getRotatedVector(vec, deg) {
	const rad = deg * (Math.PI / 180);
	const sin = Math.sin(rad);
	const cos = Math.cos(rad);
	return {
		x: - sin * vec.y + cos * vec.x,
		y: sin * vec.x + cos * vec.y
	};
}

/** createShadowPositions(width, num, rad)
 */
function createShadowPositions(width, num, rad) {
	const initialRad = (typeof rad !== 'undefined') ? rad : Math.PI / 4;
	const circumferenceLength = width * Math.PI * 2;
	const divisionNum = (typeof num !== 'undefined') ? num : Math.max(4, Math.round(circumferenceLength / 3));
	const positions = [];
	for (let i = 0; i < divisionNum; i++) {
		const rad = Math.PI * 2 * i / divisionNum;
		const x = Math.cos(rad + initialRad) * width;
		const y = Math.sin(rad + initialRad) * width;
		positions.push([ x, y ]);
	}
	return positions;
}

/** getQueries(url)
 */
function getQueries(url) {
	const urlStr = String(url || window.location);
	const queryStr = urlStr.slice(urlStr.indexOf('?') + 1);
	const queries = {};
	if (!queryStr) {
		return queries;
	}
	queryStr.split('&').forEach((queryStr) => {
		const queryArr = queryStr.split('=');
		queries[queryArr[0]] = queryArr[1];
	});
	return queries;
}

/** getDepthValueByImagedata(imagedata, x, y)
 */
function getDepthValueByImagedata(imagedata, x, y) {
	const i = (y === null) ? parseInt(x) : 4 * (parseInt(x) + parseInt(y) * imagedata.width);
	const r = imagedata.data[i + 0];
	const g = imagedata.data[i + 1];
	const b = imagedata.data[i + 2];
	return (((r * 65536) + (g * 256) + b) - 8388608) / 10000;
}

/** depthValueToRGB(depthValue)
 */
function depthValueToRGB(depthValue) {
	let v = (depthValue * 10000) + 8388608;
	const r = Math.floor(v / 65536);
	v -= r * 65536;
	const g = Math.floor(v / 256);
	v -= g * 256;
	const b = v;
	return [r, g, b];
}

/** createCanvas(width, height)
 */
function createCanvas(width, height) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	ctx.canvas = canvas;
	ctx.clear = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};
	return [canvas, ctx];
}

function downloadText(content, filename) {
	const blob = new Blob([content], {type: 'text/plain'});
	if (typeof window.navigator.msSaveBlob !== 'undefined') {
		return window.navigator.msSaveBlob(blob, filename);
	}
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	const event = document.createEvent('MouseEvents');
	event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	a.dispatchEvent(event);
}

/** downloadCanvas(id, filename, type)
 * @see https://blog.katsubemakito.net/html5/canvas-download
 */
function downloadCanvas(id, filename = 'canvas', type = 'image/png') {
	const blob = getBlobFromCanvas(id, type);
	const dataURI = window.URL.createObjectURL(blob);
	const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
	a.href = dataURI;
	a.download = filename;
	const event = document.createEvent('MouseEvents');
	event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	a.dispatchEvent(event);
}

/** getBlobFromCanvas(id, type)
 * @see https://blog.katsubemakito.net/html5/canvas-download
 */
function getBlobFromCanvas(id, type = 'image/png') {
	const canvas = (typeof id === 'string') ? document.getElementById(id) : id;
	const base64 = canvas.toDataURL(type);
	const tmp = base64.split(',');
	const data = atob(tmp[1]);
	const mime = tmp[0].split(':')[1].split(';')[0];
	let buff = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		buff[i] = data.charCodeAt(i);
	}
	return new Blob([buff], { type: mime });
}

/** context.xxx
 */
(function(target) {
	if (!target || !target.prototype) return;
	/** fillRoundRect(x, y, w, h, r)
	 */
	target.prototype.fillRoundRect = function(x, y, w, h, r) {
		this.beginPath();
		this.moveTo(x + r, y);
		this.lineTo(x + w - r, y);
		this.arc(x + w - r, y + r, r, Math.PI * (3/2), 0, false);
		this.lineTo(x + w, y + h - r);
		this.arc(x + w - r, y + h - r, r, 0, Math.PI * (1/2), false);
		this.lineTo(x + r, y + h);	   
		this.arc(x + r, y + h - r, r, Math.PI * (1/2), Math.PI, false);
		this.lineTo(x, y + r);
		this.arc(x + r, y + r, r, Math.PI, Math.PI * (3/2), false);
		this.closePath();
		this.fill();
	}
	/** fillCircle(x, y, r)
	 */
	target.prototype.fillCircle = function(x, y, r) {
		this.beginPath();
		this.arc(x, y, r, 0, Math.PI * 2, false);
		this.closePath();
		this.fill();
	}
	/** drawImageCenter(img, x, y, w, h)
	 */
	target.prototype.drawImageCenter = function(img, x, y, w, h) {
		this.drawImage(img, x - w/2, y - h/2, w, h);
	}
	/** drawImageBorder(img, x, y, w, h, borderWidth, borderColor)
	 */
	target.prototype.drawImageBorder = function(img, x, y, w, h, borderWidth, borderColor) {
		if (!borderWidth) {
			return this.drawImage(img, x, y, w, h);
		}
		this.shadowColor = borderColor;
		this.shadowBlur = 0;
		createShadowPositions(borderWidth + 1).forEach((pos, i) => {
			this.shadowOffsetX = parseFloat(pos[0].toFixed(1));
			this.shadowOffsetY = parseFloat(pos[1].toFixed(1));
			this.drawImage(img, x, y, w, h);
		});
		this.shadowColor = 'transparent';
	}
	/** drawImageCenterBorder(img, x, y, w, h, borderWidth, borderColor)
	 */
	target.prototype.drawImageCenterBorder = function(img, x, y, w, h, borderWidth, borderColor) {
		if (!borderWidth) {
			return this.drawImageCenter(img, x, y, w, h);
		}
		this.shadowColor = borderColor;
		this.shadowBlur = 0;
		createShadowPositions(borderWidth + 1).forEach((pos, i) => {
			this.shadowOffsetX = parseFloat(pos[0].toFixed(1));
			this.shadowOffsetY = parseFloat(pos[1].toFixed(1));
			this.drawImageCenter(img, x, y, w, h);
		});
		this.shadowColor = 'transparent';
	}
	/** arrow(startX, startY, endX, endY, controlPoints)
	 * @see https://qiita.com/frogcat/items/2f94b095b4c2d8581ff6
	 */
	target.prototype.arrow = function(startX, startY, endX, endY, controlPoints) {
		const dx = endX - startX;
		const dy = endY - startY;
		const len = Math.sqrt(dx * dx + dy * dy);
		const sin = dy / len;
		const cos = dx / len;
		const a = [];
		a.push(0, 0);
		for (let i = 0; i < controlPoints.length; i += 2) {
			const x = controlPoints[i];
			const y = controlPoints[i + 1];
			a.push(x < 0 ? len + x : x, y);
		}
		a.push(len, 0);
		for (let i = controlPoints.length; i > 0; i -= 2) {
			const x = controlPoints[i - 2];
			const y = controlPoints[i - 1];
			a.push(x < 0 ? len + x : x, -y);
		}
		a.push(0, 0);
		for (let i = 0; i < a.length; i += 2) {
			const x = a[i] * cos - a[i + 1] * sin + startX;
			const y = a[i] * sin + a[i + 1] * cos + startY;
			if (i === 0) this.moveTo(x, y);
			else this.lineTo(x, y);
		}
	};
})(CanvasRenderingContext2D);

function closeMyConfirm() {
	const $confirm = $('#confirm');
	$confirm.hide();
}

/** myConfirm(options)
 */
function myConfirm(options) {
	options = $.extend({
		textOK: 'OK',
		textNG: 'Cancel',
		funcOK: () => {},
		funcNG: () => {},
		textInput: '',
	}, options);
	const $confirm = $('#confirm');
	const $input = $confirm.find('input');
	const $ok = $confirm.find('.button-ok');
	const $ng = $confirm.find('.button-ng');
	$input.val(options.textInput);
	$ok.get(0).onclick = (e) => {
		const val = $input.val();
		options.funcOK(val);
		closeMyConfirm(val);
	};
	$ng.get(0).onclick = (e) => {
		const val = $input.val();
		options.funcNG(val);
		closeMyConfirm(val);
	};
	$confirm.show();
}

/** getDateStr()
 */
function getDateStr() {
	const date = new Date();
	let Y = date.getFullYear();
	let M = date.getMonth() + 1;
	let D = date.getDate();
	let h = date.getHours();
	let m = date.getMinutes();
	let s = date.getSeconds();
	Y = '' + Y;
	M = ('00' + M).slice(-2);
	D = ('00' + D).slice(-2);
	h = ('00' + h).slice(-2);
	m = ('00' + m).slice(-2);
	s = ('00' + s).slice(-2);
	return `${Y}_${M}_${D}_${h}_${m}_${s}`;
}

/** parseTimestamp(timestamp)
 */
function parseTimestamp(timestamp) {
	const date = new Date(timestamp);
	let Y = date.getFullYear();
	let M = date.getMonth() + 1;
	let D = date.getDate();
	let h = date.getHours();
	let m = date.getMinutes();
	let s = date.getSeconds();
	Y = '' + Y;
	M = ('00' + M).slice(-2);
	D = ('00' + D).slice(-2);
	h = ('00' + h).slice(-2);
	m = ('00' + m).slice(-2);
	s = ('00' + s).slice(-2);
	return `${Y}/${M}/${D} ${h}:${m}:${s}`;
}

/** copyStr(str)
 * @see https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
 */
function copyStr(str) {
	const tmp = document.createElement('div');
	const pre = document.createElement('pre');
	pre.style.webkitUserSelect = 'auto';
	pre.style.userSelect = 'auto';
	tmp.appendChild(pre).textContent = str;
	const s = tmp.style;
	s.position = 'fixed';
	s.right = '200%';
	document.body.appendChild(tmp);
	document.getSelection().selectAllChildren(tmp);
	const result = document.execCommand('copy');
	document.body.removeChild(tmp);
	return result;
}
