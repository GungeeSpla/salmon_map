/** htmlToCanvas()
 */
function htmlToCanvas() {
	const parentBounds = $canvasContainer.get(0).getBoundingClientRect();
	const cs = canvasSetting;
	const $viewCanvas = $('<canvas id="view-canvas"></canvas>');
	$viewCanvas.get(0).width = cs.canvasWidth;
	$viewCanvas.get(0).height = cs.canvasHeight;
	const viewCtx = $viewCanvas.get(0).getContext('2d');
	//const rotvec = getRotatedVector({x: 1, y: 1}, canvasSetting.stageRotate);

	/** 背景色 */
	if (canvasSetting.canvasColor !== 'transparent') {
		viewCtx.fillStyle = canvasSetting.canvasColor;
		viewCtx.fillRect(0, 0, cs.canvasWidth, cs.canvasHeight);
	}

	/** ステージ画像 */
	viewCtx.save();
	viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
	viewCtx.rotate(cs.stageRotate * Math.PI/180);
	viewCtx.drawImage($('#canvas-stage').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
	viewCtx.restore();

	/** レイヤー */
	$('.layer-object').each((i, elm) => {
		const id = $(elm).attr('id');
		if (id === 'layer-spawner') {
		}
		if ($(elm).css('display') !== 'block') {
			return;
		}
		switch (id) {
		/** スタート地点 */
		case 'layer-startpos':
			viewCtx.textAlign = 'center';
			viewCtx.textBaseline = 'middle';
			$(elm).find('div').each((j, div) => {
				const text = $(div).text();
				const pos = $(div).getXY();
				const cpos = stageXYToCanvasXY(pos.x, pos.y);
				const style = window.getComputedStyle(div);
				viewCtx.fillStyle = style.color;
				viewCtx.font = `${style.fontWeight} ${(parseInt(style.fontSize) * cs.stageScale).toFixed(1)}px ${style.fontFamily}`;
				viewCtx.fillText(text, cpos.x, cpos.y);
			});
			break;
		/** コンテナ/カンケツセン/大砲 */
		case 'layer-basket':
		case 'layer-gusher':
		case 'layer-cannon':
			$(elm).find('img').each((j, img) => {
				const pos = $(img).getXY();
				const cpos = stageXYToCanvasXY(pos.x, pos.y);
				const rotate = parseFloat($(img).cssvar('--rotate'));
				const width = cs.stageScale * 31;
				const height = cs.stageScale * 31;
				viewCtx.save();
				viewCtx.translate(cpos.x, cpos.y);
				viewCtx.rotate((cs.stageRotate + rotate) * Math.PI/180);
				viewCtx.drawImageCenter(img, 0, 0, width, height);
				viewCtx.restore();
			});
			break;
		/** ライドレール */
		case 'layer-rail':
			if ($('#canvas-rail').length) {
				viewCtx.save();
				viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
				viewCtx.rotate(cs.stageRotate * Math.PI/180);
				viewCtx.drawImage($('#canvas-rail').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
				viewCtx.restore();
			}
			break;
		/** メッシュ */
		case 'layer-area':
			viewCtx.lineCap = 'round';
			viewCtx.lineJoin = 'round';
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
			viewCtx.shadowOffsetX = 0;
			viewCtx.shadowOffsetY = 0;
			viewCtx.lineWidth = 1 * cs.stageScale;
			$(elm).find((id === 'layer-drizzler') ? 'label' : 'div').each((i, elm) => {
				const style = window.getComputedStyle(elm);
				const width = cs.stageScale * parseFloat(style.width);
				const height = cs.stageScale * parseFloat(style.height);
				const cpos = stageXYToCanvasXY(parseFloat(style.left), parseFloat(style.top));
				viewCtx.fillStyle = style.backgroundColor;
				viewCtx.strokeStyle = style.borderColor;
				viewCtx.fillRect(cpos.x - width / 2, cpos.y - height / 2, width, height);
				viewCtx.strokeRect(cpos.x - width / 2, cpos.y - height / 2, width, height);
			});
			viewCtx.shadowBlur = 0;
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
			break;
		/** ノード */
		case 'layer-node':
			viewCtx.lineCap = 'round';
			viewCtx.lineJoin = 'round';
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
			viewCtx.shadowOffsetX = 2 * cs.stageScale;
			viewCtx.shadowOffsetY = 2 * cs.stageScale;
			viewCtx.lineWidth = 4 * cs.stageScale;
			$(elm).find('div').each((i, elm) => {
				const style = window.getComputedStyle(elm);
				const radius = cs.stageScale * parseFloat(style.width) / 2;
				const cpos = stageXYToCanvasXY(parseFloat(style.left), parseFloat(style.top));
				viewCtx.fillStyle = style.backgroundColor;
				viewCtx.strokeStyle = style.borderColor;
				viewCtx.beginPath();
				viewCtx.arc(cpos.x, cpos.y, radius, 0, Math.PI * 2, false);
				viewCtx.shadowBlur = 6;
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
				viewCtx.stroke();
				viewCtx.shadowBlur = 0;
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
				viewCtx.fill();
			});
			viewCtx.shadowBlur = 0;
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
			break;
		/** ノードの接続 */
		case 'layer-node-link':
			viewCtx.save();
			viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
			viewCtx.rotate(cs.stageRotate * Math.PI/180);
			viewCtx.drawImage($('#canvas-node-link').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
			viewCtx.restore();
			break;
		/** コウモリの接続 */
		case 'layer-drizzler-link':
			viewCtx.save();
			viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
			viewCtx.rotate(cs.stageRotate * Math.PI/180);
			viewCtx.drawImage($('#canvas-drizzler-link').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
			viewCtx.restore();
			break;
		/** ボロノイ図 */
		case 'layer-voronoi':
			if (canvasSetting.maptype !== 'floorplan') {
				viewCtx.save();
				viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
				viewCtx.rotate(cs.stageRotate * Math.PI/180);
				viewCtx.drawImage($('#canvas-voronoi').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
				viewCtx.restore();
			}
			break;
		/** ヘビ */
		case 'layer-steeleel':
			viewCtx.save();
			viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
			viewCtx.rotate(cs.stageRotate * Math.PI/180);
			viewCtx.drawImage($('#canvas-steeleel').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
			viewCtx.restore();
			viewCtx.shadowBlur = 4;
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
			viewCtx.shadowOffsetX = 2;
			viewCtx.shadowOffsetY = 2;
			$(elm).find('img').each((j, img) => {
				const pos = $(img).getXY();
				const cpos = stageXYToCanvasXY(pos.x, pos.y);
				const rotate = parseFloat($(img).cssvar('--rotate'));
				const width = cs.stageScale * img.naturalWidth * 0.08;
				const height = cs.stageScale * img.naturalHeight * 0.08;
				viewCtx.save();
				viewCtx.translate(cpos.x, cpos.y);
				viewCtx.rotate((cs.stageRotate + rotate) * Math.PI/180);
				viewCtx.drawImageCenter(img, 0, 0, width, height);
				viewCtx.restore();
			});
			viewCtx.shadowBlur = 0;
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
			break;
		/** バクダン/コウモリ/カタパ/タワー */
		case 'layer-steelhead':
		case 'layer-drizzler':
		case 'layer-flyfish':
		case 'layer-stinger':
			if (id === 'layer-steelhead') {
				viewCtx.save();
				viewCtx.translate(cs.canvasWidth / 2 + cs.stageX, cs.canvasHeight / 2 + cs.stageY);
				viewCtx.rotate(cs.stageRotate * Math.PI/180);
				viewCtx.drawImage($('#canvas-steelhead').get(0), -1200 * cs.stageScale, -1200 * cs.stageScale, 2400 * cs.stageScale, 2400 * cs.stageScale);
				viewCtx.restore();
			}
			if (id === 'layer-drizzler') {
				viewCtx.lineCap = 'round';
				viewCtx.lineJoin = 'round';
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
				viewCtx.shadowOffsetX = 0;
				viewCtx.shadowOffsetY = 0;
				viewCtx.lineWidth = 0;
				$(elm).find('label').each((i, elm) => {
					if ($('#' + $(elm).attr('for')).prop('checked')) {
						const div = $(elm).next().get(0);
						const style = window.getComputedStyle(div);
						const cpos = stageXYToCanvasXY(parseFloat(style.left), parseFloat(style.top));
						const radius = cs.stageScale * parseFloat(style.width) / 2;
						viewCtx.fillStyle = style.backgroundColor;
						viewCtx.fillCircle(cpos.x, cpos.y, radius);
					}
				});
			}
			viewCtx.lineCap = 'round';
			viewCtx.lineJoin = 'round';
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
			viewCtx.shadowOffsetX = 4 * cs.stageScale;
			viewCtx.shadowOffsetY = 4 * cs.stageScale;
			viewCtx.lineWidth = 8 * cs.stageScale;
			$(elm).find((id === 'layer-drizzler') ? 'label' : 'div').each((i, elm) => {
				const style = window.getComputedStyle(elm);
				const radius = cs.stageScale * parseFloat(style.width) / 2;
				const cpos = stageXYToCanvasXY(parseFloat(style.left), parseFloat(style.top));
				viewCtx.fillStyle = style.backgroundColor;
				viewCtx.strokeStyle = style.borderColor;
				viewCtx.beginPath();
				viewCtx.arc(cpos.x, cpos.y, radius, 0, Math.PI * 2, false);
				viewCtx.shadowBlur = 6;
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
				viewCtx.stroke();
				viewCtx.shadowBlur = 0;
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
				viewCtx.fill();
			});
			viewCtx.shadowBlur = 0;
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
			break;
		/** スポナー/ハコビヤ */
		case 'layer-mothership':
		case 'layer-spawner':
			viewCtx.lineCap = 'round';
			viewCtx.lineJoin = 'round';
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
			viewCtx.shadowBlur = 6;
			viewCtx.shadowOffsetX = 4 * cs.stageScale;
			viewCtx.shadowOffsetY = 4 * cs.stageScale;
			viewCtx.lineWidth = 8 * cs.stageScale;
			$(elm).find('div').each((i, elm) => {
				const style = window.getComputedStyle(elm);
				const width = cs.stageScale * parseFloat(style.width);
				const cpos = stageXYToCanvasXY(parseFloat(style.left), parseFloat(style.top));
				viewCtx.fillStyle = style.backgroundColor;
				viewCtx.strokeStyle = style.borderColor;
				viewCtx.shadowBlur = 6;
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
				viewCtx.strokeRect(cpos.x - width / 2, cpos.y - width / 2, width, width);
				viewCtx.shadowBlur = 0;
				viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
				viewCtx.fillRect(cpos.x - width / 2, cpos.y - width / 2, width, width);
			});
			viewCtx.shadowBlur = 0;
			viewCtx.shadowColor = 'rgba(0, 0, 0, 0)';
			break;
		/** アイテム */
		case 'layer-item':
			$(elm).find('.added-item').each((i, elm) => {
				const type = $(elm).attr('item-type');
				switch (type) {
				/** ブキ */
				case 'weapon':
				{
					const $weapon = $(elm);
					const weaponImg = $weapon.find('img').get(0);
					const weaponPos = $weapon.getXY();
					const weaponCPos = stageXYToCanvasXY(weaponPos);
					const weaponSize = $weapon.getWH();
					const weaponRotate = $weapon.elmvar('rotate');
					const borderWidth = $weapon.find('img').elmvar('border-width');
					if ($weapon.find('.range-container').css('display') !== 'none') {
						const rangeRotate = weaponRotate + $weapon.find('.range-container').elmvar('rotate');
						const range     = canvasSetting.stageScale * parseFloat($weapon.cssvar('--range'));
						const blast     = canvasSetting.stageScale * parseFloat($weapon.cssvar('--blast'));
						const rangeNear = canvasSetting.stageScale * parseFloat($weapon.cssvar('--range-near'));
						const rangeFar  = canvasSetting.stageScale * parseFloat($weapon.cssvar('--range-far'));
						const vRange    = canvasSetting.stageScale * parseFloat($weapon.cssvar('--v-range'));
						const vRangeFar = canvasSetting.stageScale * parseFloat($weapon.cssvar('--v-range-far'));
						const hRangeMarginTop = (vRange < 0) ? 0 : -10; 
						const vRangeMarginTop = 12;
						viewCtx.save();
						viewCtx.translate(weaponCPos.x, weaponCPos.y);
						viewCtx.rotate((canvasSetting.stageRotate + rangeRotate) * Math.PI/180);
						$weapon.find('.range-line').each((i, elm) => {
							//viewCtx.fillStyle = 'rgba(255, 46, 165, .3)';
							viewCtx.fillStyle = '#ff2ea5';
							viewCtx.fillRect(0, -1 * canvasSetting.stageScale + hRangeMarginTop, range, 2 * canvasSetting.stageScale);
						});
						$weapon.find('.range-end').each((i, elm) => {
							//viewCtx.fillStyle = 'rgba(255, 46, 165, .3)';
							viewCtx.fillStyle = '#ff2ea5';
							if (vRange < 0) {
								viewCtx.fillCircle(range, hRangeMarginTop, 8 * canvasSetting.stageScale);
							} else {
								const w = 15;
								const h = 30;
								const r = 5;
								viewCtx.fillRoundRect(range - w/2, hRangeMarginTop - h/2, w, h, r);
							}
						});
						$weapon.find('.range-blast').each((i, elm) => {
							viewCtx.fillStyle = 'rgba(255, 46, 165, .4)';
							viewCtx.fillCircle(range, hRangeMarginTop, blast/2);
						});
						$weapon.find('.range-far').each((i, elm) => {
							viewCtx.fillStyle = 'rgba(255, 46, 165, .4)';
							const w = rangeFar;
							const h = (vRange > 0) ? 30 : 15;
							const r = 5;
							viewCtx.fillRoundRect(range, hRangeMarginTop - h/2, w, h, r);
						});
						$weapon.find('.range-near-end').each((i, elm) => {
							viewCtx.fillStyle = '#ff2ea5';
							viewCtx.fillCircle(rangeNear, hRangeMarginTop, 5);
						});
						$weapon.find('.v-range-line').each((i, elm) => {
							viewCtx.fillStyle = '#ff2ea5';
							viewCtx.fillRect(0, -1 + vRangeMarginTop, vRange, 2);
						});
						$weapon.find('.v-range-end').each((i, elm) => {
							viewCtx.fillStyle = '#ff2ea5';
							viewCtx.fillCircle(vRange, vRangeMarginTop, 8);
						});
						$weapon.find('.v-range-far').each((i, elm) => {
							viewCtx.fillStyle = 'rgba(255, 46, 165, .4)';
							const w = vRangeFar;
							const h = 15;
							const r = 5;
							viewCtx.fillRoundRect(vRange, vRangeMarginTop - h/2, w, h, r);
						});
						viewCtx.restore();
					}
					// ブキ画像
					viewCtx.save();
					viewCtx.translate(weaponCPos.x, weaponCPos.y);
					viewCtx.rotate((canvasSetting.stageRotate + weaponRotate) * Math.PI/180);
					viewCtx.drawImageCenterBorder(weaponImg, 0, 0, canvasSetting.stageScale * weaponSize.width, canvasSetting.stageScale * weaponSize.height, borderWidth, 'white');
					viewCtx.restore();
					break;
				}
				/** 画像 */
				case 'image':
				{
					const $weapon = $(elm);
					const weaponImg = $weapon.find('img').get(0);
					const weaponPos = $weapon.getXY();
					const weaponCPos = stageXYToCanvasXY(weaponPos);
					const weaponSize = $weapon.getWH();
					const weaponRotate = $weapon.elmvar('rotate');
					const borderWidth = $weapon.find('img').elmvar('border-width');
					viewCtx.save();
					viewCtx.translate(weaponCPos.x, weaponCPos.y);
					viewCtx.rotate((canvasSetting.stageRotate + weaponRotate) * Math.PI/180);
					viewCtx.drawImageCenterBorder(weaponImg, 0, 0, canvasSetting.stageScale * weaponSize.width, canvasSetting.stageScale * weaponSize.height, borderWidth, 'white');
					viewCtx.restore();
					break;
				}
				/** 図形 */
				case 'drawing':
				{
					const $weapon = $(elm);
					const weaponImg = $weapon.find('canvas').get(0);
					const weaponPos = $weapon.getXY();
					const weaponOpacity = parseFloat($weapon.css('opacity'));
					const weaponCPos = stageXYToCanvasXY(weaponPos);
					const weaponSize = $weapon.getWH();
					const weaponRotate = $weapon.elmvar('rotate');
					viewCtx.save();
					viewCtx.globalAlpha = weaponOpacity;
					viewCtx.translate(weaponCPos.x, weaponCPos.y);
					viewCtx.rotate((canvasSetting.stageRotate + weaponRotate) * Math.PI/180);
					viewCtx.drawImageCenter(weaponImg, 0, 0, canvasSetting.stageScale * weaponSize.width, canvasSetting.stageScale * weaponSize.height);
					viewCtx.restore();
					break;
				}
				/** テキスト */
				case 'text':
				{
					const $elm = $(elm);
					const $body = $('body');
					const $text = $elm.find('textarea');
					const options = $elm.elmvar('options');
					let width = $text.getWH().width;
					let height = $text.getWH().height;
					const pos1 = $elm.getXY();
					const pos2 = stageXYToCanvasXY(pos1);
					const scale = canvasSetting.stageScale;
					let centerX = pos1.x;
					let centerY = pos1.y;
					let rotate = elm.rotate;
					rotate += canvasSetting.stageRotate;
					centerX = pos2.x;
					centerY = pos2.y;
					width = width * scale;
					const borderWidth = options.borderWidth * scale;
					const borderColor = options.borderColor;
					const $test = $('<p>' + $text.val() + '</p>');
					const style = window.getComputedStyle($text.get(0));
					$test.css({
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
					const lineHeight = $test.height();
					$test.remove();

					viewCtx.save();
					viewCtx.translate(centerX, centerY);
					viewCtx.rotate(rotate * Math.PI/180);
					const fontSize = scale * parseFloat(style.fontSize);
					const text = $text.val();
					const lines = text.split('\n');
					viewCtx.fillStyle = options.textColor;
					viewCtx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
					viewCtx.textAlign = 'left';
					viewCtx.textBaseline = 'middle';
					viewCtx.strokeStyle = borderColor || 'white';
					viewCtx.lineWidth = borderWidth * 2.5;
					viewCtx.lineJoin = 'round';//'miter';
					['strokeText', 'fillText'].forEach((draw) => {
						let x = 0;
						let y = lineHeight / 2;
						lines.forEach((line) => {
							viewCtx[draw](line, x - width / 2, y - height / 2);
							y += lineHeight;
						});
					});
					viewCtx.restore();
					break;
				}
				}
			});
			break;
		}
	});
	return $viewCanvas.get(0);
}
