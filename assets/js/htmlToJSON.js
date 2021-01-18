/** readJSON(json)
 */
function readJSON(json) {
	console.log('loading json...');
	console.log(json);
	isEnabledAutosave = false;

	/** キャンバス設定 */
	const ncs = {
		maptype     : json.cs.mt,
		stage       : json.cs.st,
		tide        : json.cs.td,
		canvasColor : json.cs.cc,
		canvasWidth : json.cs.cw,
		canvasHeight: json.cs.ch,
		stageX      : json.cs.sx,
		stageY      : json.cs.sy,
		stageScale  : json.cs.ss,
		stageRotate : json.cs.sr,
	};
	$.extend(canvasSetting, ncs);
	$('#radio-' + ncs.stage).prop('checked', true);
	$('#radio-' + ncs.tide).prop('checked', true);
	$('#radio-' + ncs.maptype).prop('checked', true);

	/** オブジェクトレイヤー */
	for (let key in json.ol) {
		$(`#checkbox-layer-${key}`).each((i, elm) => {
			$(elm).prop('checked', Boolean(json.ol[key])).myTrigger('change');
		});
	}

	/** コウモリ */
	ncs.onloadxml = () => {
		if (json.dz) {
			json.dz.forEach((def) => {
				$('#'+def[0]).prop('checked', !!def[1]);
			});
		}
		if (json.vt) {
			drawVoronoi(json.vt);
		}
	};

	loadStage(ncs);

	/** ヘビ */
	if (json.se) {
		json.se.forEach((nodePositions) => {
			addSteelEel({ nodePositions });
		});
	}

	/** バクダン */
	if (json.sh) {
		json.sh.forEach((def) => {
			addSteelheadCircle({
				x   : def.x,
				y   : def.y,
				type: def.t
			});
		});
	}
	
	/** その他のアイテム */
	if (json.il) {
		json.il.forEach((def) => {
			switch (def.tp) {
			/** ブキ */
			case 'w':
			{
				addWeapon({
					id                 : def.id,
					x                  : def.x,
					y                  : def.y,
					width              : def.w,
					height             : def.h,
					initialVisibleRange: def.rv,
					initialRotate      : def.r,
					initialRotateRange : def.rr
				});
				break;
			}
			/** 画像 */
			case 'i':
			{
				addImage({
					src                : def.src,
					x                  : def.x,
					y                  : def.y,
					width              : def.w,
					height             : def.h,
					initialRotate      : def.r
				});
				break;
			}
			/** テキスト */
			case 't':
			{
				addTextarea({
					text               : def.text,
					x                  : def.x,
					y                  : def.y,
					fontSize           : def.s,
					initialRotate      : def.r,
					textColor          : def.c,
					borderColor        : def.b,
					fontFamily         : def.f
				});
				break;
			}
			/** 図形 */
			case 'd':
			{
				if (def.pm.verticesList) {
					const newVerticesList = [];
					def.pm.verticesList.forEach((verticesStr) => {
						const arr = [], varr = [];
						let bstr = '', bx, by;
						for (let i = 0; i < verticesStr.length; i++) {
							const chr = verticesStr[i];
							const isnum = !!chr.match(/[0-9\.\-]/);
							if (isnum) {
								bstr += chr;
							} else {
								if (bstr) {
									const num = parseInt(bstr);
									arr.push(num);
									bstr = '';
								}
								if (chr !== ',') {
									const num = alphabetToNumber(chr);
									arr.push(num);
								}
							}
						}
						for (let i = 0; i < arr.length; i += 2) {
							const tx = arr[i + 0], ty = arr[i + 1];
							let x, y;
							if (i === 0) {
								x = tx;
								y = ty;
							} else {
								x = bx + tx;
								y = by + ty;
							}
							bx = x;
							by = y;
							varr.push({ x, y });
						}
						newVerticesList.push(varr);
					});
					def.pm.verticesList = newVerticesList;
				}
				if (def.pm.ts) {
					def.pm.toolSetting = {
						lineWidth  : def.pm.ts.lw,
						lineColor  : def.pm.ts.lc,
						borderWidth: def.pm.ts.bw,
						borderColor: def.pm.ts.bc,
						fillColor  : def.pm.ts.fc
					};
				}
				determineDrawingCommon({
					params       : def.pm,
					x            : def.x,
					y            : def.y,
					width        : def.w,
					height       : def.h,
					initialRotate: def.r,
					minX         : def.mx,
					minY         : def.my,
					initialWidth : def.iw,
					toolType     : def.tt,
					isJSON       : true
				});
				break;
			}
			}
		});
	}

	isEnabledAutosave = true;
}

/** htmlToJSON()
 */
function htmlToJSON() {
	const json = {};
	const cs = canvasSetting; 
	json.cs = {
		mt: cs.maptype,
		st: cs.stage,
		td: cs.tide,
		cc: cs.canvasColor,
		cw: cs.canvasWidth,
		ch: cs.canvasHeight,
		sx: cs.stageX,
		sy: cs.stageY,
		ss: cs.stageScale,
		sr: cs.stageRotate
	};

	/** オブジェクトレイヤー */
	const ol = {};
	$('#object-layer-manager input').each((i, elm) => {
		const id = $(elm).attr('id');
		const sid = id.replace('checkbox-layer-', '');
		const bool = $(elm).prop('checked') ? 1 : 0;
		ol[sid] = bool;
	});
	json.ol = ol;

	/** コウモリ */
	const dz = [];
	$('#layer-drizzler .drizzler-container').each((i, elm) => {
		const poses = [];
		const id = $(elm).find('input').attr('id');
		const checked = $(elm).find('input').prop('checked') ? 1 : 0;
		dz.push([id, checked]);
	});
	if (dz.length) json.dz = dz;

	const voronoiTarget = $voronoiCanvas.attr('voronoi-target');
	if (voronoiTarget) {
		json.vt = voronoiTarget;
	}

	/** ヘビ */
	const se = [];
	$('#layer-steeleel .stage-object.eel').each((i, elm) => {
		const poses = [];
		$(elm).find('.stage-object-eel-node').each((j, node) => {
			const pos = $(node).getXY();
			const rotate = $(node).elmvar('rotate');
			poses.push({
				x: parseInt(pos.x),
				y: parseInt(pos.y),
				r: parseInt(rotate)
			});
		});
		se.push(poses);
	});
	if (se.length) json.se = se;

	/** バクダン */
	const sh = [];
	$('#layer-steelhead .steelhead').each((i, elm) => {
		const pos = $(elm).getXY();
		const type = parseInt($(elm).attr('data-type'));
		sh.push({
			x: parseInt(pos.x),
			y: parseInt(pos.y),
			t: type 
		});
	});
	if (sh.length) json.sh = sh;

	/** その他のアイテム */
	const il = [];
	$('#layer-item').find('.added-item').each((i, elm) => {
		const type = $(elm).attr('item-type');
		switch (type) {
		/** ブキ */
		case 'weapon':
		{
			const $elm = $(elm);
			const id = parseInt($elm.attr('data-weapon-id'));
			const pos = $elm.getXY();
			const size = $elm.getWH();
			const rotate = $elm.elmvar('rotate');
			const $range = $elm.find('.range-container');
			const isRangeVisible = ($range.css('display') !== 'none') ? 1 : 0;
			const rangeRotate = $range.elmvar('rotate');
			const data = {
				tp: 'w',
				id: id,
				x: pos.x,
				y: pos.y,
				w: size.width,
				h: size.height,
				r: rotate,
				rv: isRangeVisible,
				rr: rangeRotate
			};
			il.push(data);
			break;
		}
		/** 画像 */
		case 'image':
		{
			const $elm = $(elm);
			const src = $elm.find('img').attr('src');
			const id = parseInt($elm.attr('data-weapon-id'));
			const pos = $elm.getXY();
			const size = $elm.getWH();
			const rotate = $elm.elmvar('rotate');
			const data = {
				tp: 'i',
				src: src,
				x: pos.x,
				y: pos.y,
				w: size.width,
				h: size.height,
				r: rotate
			};
			il.push(data);
			break;
		}
		/** テキスト */
		case 'text':
		{
			const $elm = $(elm);
			const $text = $elm.find('textarea');
			const text = $text.val();
			const pos = $elm.getXY();
			const options = $text.elmvar('options');
			const size = parseFloat($text.css('font-size'));
			const rotate = parseInt($elm.elmvar('rotate'));
			const data = {
				tp: 't',
				t: text,
				x: parseInt(pos.x),
				y: parseInt(pos.y),
				s: size,
				r: rotate,
				f: options.fontFamily,
				c: options.textColor,
				b: options.borderColor
			};
			il.push(data);
			break;
		}
		/** 図形 */
		case 'drawing':
		{
			const $elm = $(elm);
			const options = $.extend(true, {}, $elm.elmvar('options'));
			const params = options.params;
			const rotate = $elm.elmvar('rotate');
			const pos = $elm.getXY();
			const size = $elm.getWH();
			if (options.toolType === 'pencil') {
				const newVerticesList = [];
				params.verticesList.forEach((vertices) => {
					let str = '', bx, by, bc;
					vertices.forEach((v, i) => {
						if (i === 0) {
							str += v.x + ',' + v.y
							bc = v.y;
						} else {
							const dx = v.x - bx;
							const dy = v.y - by;
							const dxb = (-25 <= dx && dx <= 26);
							const dyb = (-25 <= dy && dy <= 26);
							const dxc = dxb ? numberToAlphabet(dx) : dx;
							const dyc = dyb ? numberToAlphabet(dy) : dy;
							if (typeof bc === 'number' && typeof dxc === 'number') str += ',';
							str += dxc;
							bc = dxc;
							if (typeof bc === 'number' && typeof dyc === 'number') str += ',';
							str += dyc;
							bc = dyc;
						}
						bx = v.x;
						by = v.y;
					});
					newVerticesList.push(str);
				});
				params.verticesList = newVerticesList;
			}
			if (params.toolSetting) {
				params.ts = {
					lw: params.toolSetting.lineWidth,
					lc: params.toolSetting.lineColor,
					bw: params.toolSetting.borderWidth,
					bc: params.toolSetting.borderColor,
					fc: params.toolSetting.fillColor
				};
				delete params.toolSetting;
			}
			const data = {
				tp: 'd',
				x: pos.x,
				y: pos.y,
				w: size.width,
				h: size.height,
				r: rotate,
				pm: params,
				mx: options.minX,
				my: options.minY,
				iw: options.initialWidth,
				tt: options.toolType
			};
			il.push(data);
			break;
		}
		}
	});
	if (il.length) json.il = il;

	return json;
}
