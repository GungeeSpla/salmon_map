// =========================================================
// canvasTools.js
// =========================================================

/** constants
 */
const BORDER_WIDTH_MIN = 2;

/** getXYWH(minX, minY, maxX, maxY)
 */
function getXYWH(minX, minY, maxX, maxY) {
	const w = maxX - minX;
	const h = maxY - minY;
	return {
		minX,
		minY,
		x: minX + w/2,
		y: minY + h/2,
		width: w,
		height: h,
		radius: getDistance({ x: w, y: h }) / 2
	};
}

/** isOpaque(e, $elm, ctx) {
 */
function isOpaque(e, $elm, ctx) {
	const mousePos = pageXYToCanvasXY(e.pageX, e.pageY);
	const elmCssPos = $elm.getXY();
	const elmCssSize = $elm.getWH();
	const elmCssLeft = elmCssPos.x - elmCssSize.width / 2;
	const elmCssTop = elmCssPos.y - elmCssSize.height / 2;
	const mousePosFromElmCenter = {
		x: mousePos.x - elmCssPos.x,
		y: mousePos.y - elmCssPos.y
	};
	const rotate = $elm.elmvar('rotate');
	const mousePosFromElmCenterRotated = getRotatedVector(mousePosFromElmCenter, - rotate);
	const cx = parseInt(mousePosFromElmCenterRotated.x + elmCssSize.width / 2);
	const cy = parseInt(mousePosFromElmCenterRotated.y + elmCssSize.height / 2);
	const imgdata = ctx.getImageData(cx, cy, 1, 1);
	return !!imgdata.data[3];
}

/** determineDrawingCommon
 */
function determineDrawingCommon(options) {
	options = $.extend({
		x: 0,
		y: 0,
		minX: 0,
		minY: 0,
		width: 100,
		height: 100,
		radius: null,
		initialWidth: null,
		params: null,
		initialRotate: 0,
		toolType: 'pencil',
		isJSON: false
	}, options);
	if (!options.initialWidth) options.initialWidth = options.width;
	if (!('toolSetting' in options.params)) options.params.toolSetting = $.extend({}, toolSetting);
	const update = canvasTools[options.toolType].update;
	const [canvas, ctx] = createCanvas(options.width, options.height);
	$.extend(ctx, options.params);
	const $drawing = $('<div class="drawing-container"></div>');
	$drawing.append(canvas)
	.attr('item-type', 'drawing')
	.addClass('added-item')
	.elmvar('options', options)
	.elmvar('ctx', ctx)
	.setWH(options.width, options.height)
	.setXY(options.x, options.y)
	.myDraggable({
		ctx,
		startif: (e) => {
			return isOpaque(e, $drawing, ctx);
		}
	})
	.myOn('mousemove', (e) => {
		const ret = $.checkElementBelowCavnas(e, false);
		if (ret) $drawing.css('cursor', 'move');
		else $drawing.css('cursor', 'default');
	})
	.myResizable({
		resize: () => {
			const size = $drawing.getWH();
			canvas.width = size.width;
			canvas.height = size.height;
			update(ctx, options.minX, options.minY, size.width / options.initialWidth);
			//const r = getDistance({ x: size.width, y: size.height }) / 2;
			//$drawing.elmvar('radius', r);
		}
	})
	.myRotatable({
		initialRotate: options.initialRotate,
		isTransformCenter: true
	})
	.appendTo('#layer-item');
	if (!options.isJSON) {
		$drawing.canvasToStage();
	} else {
		update(ctx, options.minX, options.minY, options.width / options.initialWidth);
		$drawing.elmvar('mydraggableOptions').parentType = 'stage';
	}
	tempDrawingCtx.clear();
	onChangeCanvas();
}
/** canvasTools
 */
const canvasTools = {
	/** pencil
	 */
	'pencil': {
		/** update
		 */
		update: function(ctx, tx = 0, ty = 0, ratio = 1) {
			const ts = ctx.toolSetting;
			ctx.clear();
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.verticesList.forEach((vertice) => {
				vertice.forEach((vertex, i) => {
					ctx[((i === 0) ? 'moveTo' : 'lineTo')](ratio * (vertex.x - tx), ratio * (vertex.y - ty));
				});
			});
			if (ts.borderColor && ts.borderColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio + Math.max(BORDER_WIDTH_MIN, ts.borderWidth * ratio);
				ctx.strokeStyle = ts.borderColor;
				ctx.stroke();
			}
			if (ts.fillColor && ts.fillColor !== 'transparent') {
				ctx.fillStyle = ts.fillColor;
				ctx.fill();
			}
			if (ts.lineColor && ts.lineColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio;
				ctx.strokeStyle = ts.lineColor;
				ctx.stroke();
			}
		},
		/** init
		 */
		init: function($eventLayer) {
			const self = this;
			let isDown = false;
			let isMove = false;
			let verticesList = [];
			let currentVertices = [];
			/** determineDrawing
			 */
			function determineDrawing() {
				if (!verticesList.length) {
					return;
				}
				let maxX = - Infinity;
				let maxY = - Infinity;
				let minX =   Infinity;
				let minY =   Infinity;
				verticesList.forEach((vertice) => {
					vertice.forEach((vertex, i) => {
						if (vertex.x > maxX) maxX = vertex.x;
						if (vertex.x < minX) minX = vertex.x;
						if (vertex.y > maxY) maxY = vertex.y;
						if (vertex.y < minY) minY = vertex.y;
					});
				});
				const margin = toolSetting.lineWidth;
				minX -= margin;
				minY -= margin;
				maxX += margin;
				maxY += margin;
				const _verticesList = [];
				verticesList.forEach((vertices, j) => {
					if (vertices.length > 2) {
						const _vertices = [];
						vertices.forEach((v, i) => {
							if (i <= 1) {
								_vertices.push(v);
							} else {
								const v1 = vertices[i - 2];
								const v2 = vertices[i - 1];
								const v3 = v;
								dx1 = Math.sign(v2.x - v1.x);
								dy1 = Math.sign(v2.y - v1.y);
								dx2 = Math.sign(v3.x - v2.x);
								dy2 = Math.sign(v3.y - v2.y);
								if ((dx1 === 0 && dx2 === 0) && (dy1 === dy2)) {
									_vertices[_vertices.length - 1].x = v.x;
									_vertices[_vertices.length - 1].y = v.y;
								} else if ((dy1 === 0 && dy2 === 0) && (dx1 === dx2)) {
									_vertices[_vertices.length - 1].x = v.x;
									_vertices[_vertices.length - 1].y = v.y;
								} else {
									_vertices.push(v);
								}
							}
						});
						verticesList[j] = _vertices;
					}
				});
				determineDrawingCommon($.extend(getXYWH(minX, minY, maxX, maxY), {
					params: { verticesList },
					toolType: 'pencil'
				}));
				verticesList = [];
			}
			/** mousedown
			 */
			$eventLayer.onMousedown((e) => {
				isDown = true;
				const mousePos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
				currentVertices = [ mousePos ];
				verticesList.push(currentVertices);
				tempDrawingCtx.verticesList = verticesList;
				self.update(tempDrawingCtx);
			});
			/** mousemove
			 */
			$('body').myOn('mousemove touchmove', (e) => {
				if (isDown) {
					isMove = true;
					const mousePos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
					currentVertices.push(mousePos);
					self.update(tempDrawingCtx);
				} else if (currentTool === 'pencil') {
					if (verticesList.length) {
						const mousePos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
						if (!(0 <= mousePos.x && mousePos.x <= canvasSetting.canvasWidth
						 && 0 <= mousePos.y && mousePos.y <= canvasSetting.canvasHeight)) {
							determineDrawing();
						}
					}
				}
			});
			/** mouseup
			 */
			$('body').myOn('mouseup touchend mouseleave touchleave', (e) => {
				if (isMove) {
					//determineDrawing();
				}
				isMove = false;
				isDown = false;
			});
			this.isDown = () => { return isDown; };
			this.determineDrawing = determineDrawing;
		}
	},
	/** circle
	 */
	'circle': {
		/** update
		 */
		update: function(ctx, tx = 0, ty = 0, ratio = 1) {
			const ts = ctx.toolSetting;
			ctx.clear();
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(ratio * (ctx.centerPos.x - tx), ratio * (ctx.centerPos.y - ty), ratio * ctx.radius, 0, Math.PI*2, false);
			if (ts.borderColor && ts.borderColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio + Math.max(BORDER_WIDTH_MIN, ts.borderWidth * ratio);
				ctx.strokeStyle = ts.borderColor;
				ctx.stroke();
			}
			if (ts.fillColor && ts.fillColor !== 'transparent') {
				ctx.fillStyle = ts.fillColor;
				ctx.fill();
			}
			if (ts.lineColor && ts.lineColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio;
				ctx.strokeStyle = ts.lineColor;
				ctx.stroke();
			}
		},
		/** init
		 */
		init: function($eventLayer) {
			const self = this;
			const minRadius = 5;
			let isDown = false;
			let isMove = false;
			let currentCenterPos;
			let currentRadius;
			/** determineDrawing
			 */
			function determineDrawing(centerPos, radius) {
				const minX = centerPos.x - radius - toolSetting.lineWidth;
				const minY = centerPos.y - radius - toolSetting.lineWidth;
				const maxX = centerPos.x + radius + toolSetting.lineWidth;
				const maxY = centerPos.y + radius + toolSetting.lineWidth;
				determineDrawingCommon($.extend(getXYWH(minX, minY, maxX, maxY), {
					params: { centerPos, radius },
					toolType: 'circle'
				}));
			}
			/** mousedown
			 */
			$eventLayer.onMousedown((e) => {
				isDown = true;
				currentCenterPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
			});
			/** mousemove
			 */
			$('body').myOn('mousemove touchmove', (e) => {
				if (isDown) {
					isMove = true;
					const mousePos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
					currentRadius = Math.max(minRadius, Math.max(Math.abs(mousePos.x - currentCenterPos.x), Math.abs(mousePos.y - currentCenterPos.y)));
					tempDrawingCtx.centerPos = currentCenterPos;
					tempDrawingCtx.radius = currentRadius;
					self.update(tempDrawingCtx);
				}
			});
			/** mouseup
			 */
			$('body').myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (isMove) {
					determineDrawing(currentCenterPos, currentRadius);
				}
				isDown = false;
				isMove = false;
			});
		}
	},
	/** rectangle
	 */
	'rectangle': {
		/** update
		 */
		update: function(ctx, tx = 0, ty = 0, ratio = 1) {
			const ts = ctx.toolSetting;
			ctx.clear();
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			const minX = ratio * (Math.min(ctx.ltPos.x, ctx.rbPos.x) - tx);
			const minY = ratio * (Math.min(ctx.ltPos.y, ctx.rbPos.y) - ty);
			const maxX = ratio * (Math.max(ctx.ltPos.x, ctx.rbPos.x) - tx);
			const maxY = ratio * (Math.max(ctx.ltPos.y, ctx.rbPos.y) - ty);
			if (ts.borderColor && ts.borderColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio + Math.max(BORDER_WIDTH_MIN, ts.borderWidth * ratio);
				ctx.strokeStyle = ts.borderColor;
				ctx.strokeRect(minX, minY, (maxX - minX), (maxY - minY));
			}
			if (ts.fillColor && ts.fillColor !== 'transparent') {
				ctx.fillStyle = ts.fillColor;
				ctx.fillRect(minX, minY, (maxX - minX), (maxY - minY));
			}
			if (ts.lineColor && ts.lineColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio;
				ctx.strokeStyle = ts.lineColor;
				ctx.strokeRect(minX, minY, (maxX - minX), (maxY - minY));
			}
		},
		/** init
		 */
		init: function($eventLayer) {
			const self = this;
			let isDown = false;
			let isMove = false;
			let currentLTPos;
			let currentRBPos;
			/** determineDrawing
			 */
			function determineDrawing(ltPos, rbPos) {
				const minX = Math.min(ltPos.x, rbPos.x) - toolSetting.lineWidth;
				const minY = Math.min(ltPos.y, rbPos.y) - toolSetting.lineWidth;
				const maxX = Math.max(ltPos.x, rbPos.x) + toolSetting.lineWidth;
				const maxY = Math.max(ltPos.y, rbPos.y) + toolSetting.lineWidth;
				determineDrawingCommon($.extend(getXYWH(minX, minY, maxX, maxY), {
					params: { ltPos, rbPos },
					toolType: 'rectangle'
				}));
			}
			/** mousedown
			 */
			$eventLayer.onMousedown((e) => {
				isDown = true;
				currentLTPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
			});
			/** mousemove
			 */
			$('body').myOn('mousemove touchmove', (e) => {
				if (isDown) {
					isMove = true;
					currentRBPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
					tempDrawingCtx.ltPos = currentLTPos;
					tempDrawingCtx.rbPos = currentRBPos;
					self.update(tempDrawingCtx);
				}
			});
			/** mouseup
			 */
			$('body').myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (isMove) {
					determineDrawing(currentLTPos, currentRBPos);
				}
				isDown = false;
				isMove = false;
			});
		}
	},
	/** line
	 */
	'line': {
		/** update
		 */
		update: function(ctx, tx = 0, ty = 0, ratio = 1) {
			const ts = ctx.toolSetting;
			ctx.clear();
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			const minX = ratio * (Math.min(ctx.pos1.x, ctx.pos2.x) - tx);
			const minY = ratio * (Math.min(ctx.pos1.y, ctx.pos2.y) - ty);
			const maxX = ratio * (Math.max(ctx.pos1.x, ctx.pos2.x) - tx);
			const maxY = ratio * (Math.max(ctx.pos1.y, ctx.pos2.y) - ty);
			if (ts.borderColor && ts.borderColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio + Math.max(BORDER_WIDTH_MIN, ts.borderWidth * ratio);
				ctx.strokeStyle = ts.borderColor;
				ctx.beginPath();
				ctx.moveTo(ratio * (ctx.pos1.x - tx), ratio * (ctx.pos1.y - ty));
				ctx.lineTo(ratio * (ctx.pos2.x - tx), ratio * (ctx.pos2.y - ty));
				ctx.stroke();
			}
			if (ts.lineColor && ts.lineColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio;
				ctx.strokeStyle = ts.lineColor;
				ctx.beginPath();
				ctx.moveTo(ratio * (ctx.pos1.x - tx), ratio * (ctx.pos1.y - ty));
				ctx.lineTo(ratio * (ctx.pos2.x - tx), ratio * (ctx.pos2.y - ty));
				ctx.stroke();
			}
		},
		/** init
		 */
		init: function($eventLayer) {
			const self = this;
			let isDown = false;
			let isMove = false;
			let currentLTPos;
			let currentRBPos;
			/** determineDrawing
			 */
			function determineDrawing(pos1, pos2) {
				const minX = Math.min(pos1.x, pos2.x) - toolSetting.lineWidth;
				const minY = Math.min(pos1.y, pos2.y) - toolSetting.lineWidth;
				const maxX = Math.max(pos1.x, pos2.x) + toolSetting.lineWidth;
				const maxY = Math.max(pos1.y, pos2.y) + toolSetting.lineWidth;
				determineDrawingCommon($.extend(getXYWH(minX, minY, maxX, maxY), {
					params: { pos1, pos2 },
					toolType: 'line'
				}));
			}
			/** mousedown
			 */
			$eventLayer.onMousedown((e) => {
				isDown = true;
				currentLTPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
			});
			/** mousemove
			 */
			$('body').myOn('mousemove touchmove', (e) => {
				if (isDown) {
					isMove = true;
					currentRBPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
					tempDrawingCtx.pos1 = currentLTPos;
					tempDrawingCtx.pos2 = currentRBPos;
					self.update(tempDrawingCtx);
				}
			});
			/** mouseup
			 */
			$('body').myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (isMove) {
					determineDrawing(currentLTPos, currentRBPos);
				}
				isDown = false;
				isMove = false;
			});
		}
	},
	/** arrow
	 */
	'arrow': {
		/** update
		 */
		update: function(ctx, tx = 0, ty = 0, ratio = 1) {
			const ts = ctx.toolSetting;
			ctx.clear();
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.lineWidth = ts.borderWidth;
			ctx.strokeStyle = ts.borderColor;
			ctx.fillStyle = ts.lineColor;
			ctx.beginPath();
			const h = ratio * ts.lineWidth / 2;
			ctx.arrow(
				ratio * (ctx.pos1.x - tx),
				ratio * (ctx.pos1.y - ty),
				ratio * (ctx.pos2.x - tx),
				ratio * (ctx.pos2.y - ty),
				[0, -h, -h * 6, -h, -h * 6, -h * 3]
			);
			ctx.stroke();
			ctx.fill();
		},
		/** init
		 */
		init: function($eventLayer) {
			const self = this;
			let isDown = false;
			let isMove = false;
			let currentLTPos;
			let currentRBPos;
			/** determineDrawing
			 */
			function determineDrawing(pos1, pos2) {
				const minX = Math.min(pos1.x, pos2.x) - toolSetting.lineWidth;
				const minY = Math.min(pos1.y, pos2.y) - toolSetting.lineWidth;
				const maxX = Math.max(pos1.x, pos2.x) + toolSetting.lineWidth;
				const maxY = Math.max(pos1.y, pos2.y) + toolSetting.lineWidth;
				determineDrawingCommon($.extend(getXYWH(minX, minY, maxX, maxY), {
					params: { pos1, pos2 },
					toolType: 'arrow'
				}));
			}
			/** mousedown
			 */
			$eventLayer.onMousedown((e) => {
				isDown = true;
				currentLTPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
			});
			/** mousemove
			 */
			$('body').myOn('mousemove touchmove', (e) => {
				if (isDown) {
					isMove = true;
					currentRBPos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
					tempDrawingCtx.pos1 = currentLTPos;
					tempDrawingCtx.pos2 = currentRBPos;
					self.update(tempDrawingCtx);
				}
			});
			/** mouseup
			 */
			$('body').myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (isMove) {
					determineDrawing(currentLTPos, currentRBPos);
				}
				isDown = false;
				isMove = false;
			});
		}
	},
	/** polyline
	 */
	'polyline': {
		/** update
		 */
		update: function(ctx, tx = 0, ty = 0, ratio = 1) {
			const ts = ctx.toolSetting;
			ctx.clear();
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.path.forEach((vertex, i) => {
				ctx[((i === 0) ? 'moveTo' : 'lineTo')](ratio * (vertex.x - tx), ratio * (vertex.y - ty));
			});
			if (ts.borderColor && ts.borderColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio + Math.max(BORDER_WIDTH_MIN, ts.borderWidth * ratio);
				ctx.strokeStyle = ts.borderColor;
				ctx.stroke();
			}
			if (ts.fillColor && ts.fillColor !== 'transparent') {
				ctx.fillStyle = ts.fillColor;
				ctx.fill();
			}
			if (ts.lineColor && ts.lineColor !== 'transparent') {
				ctx.lineWidth = ts.lineWidth * ratio;
				ctx.strokeStyle = ts.lineColor;
				ctx.stroke();
			}
		},
		/** init
		 */
		init: function($eventLayer) {
			const self = this;
			let isDown = false;
			let isMove = false;
			let currentPath = [];
			/** determineDrawing
			 */
			function determineDrawing() {
				let maxX = - Infinity;
				let maxY = - Infinity;
				let minX =   Infinity;
				let minY =   Infinity;
				currentPath.forEach((vertex, i) => {
					if (vertex.x > maxX) maxX = vertex.x;
					if (vertex.x < minX) minX = vertex.x;
					if (vertex.y > maxY) maxY = vertex.y;
					if (vertex.y < minY) minY = vertex.y;
				});
				const margin = toolSetting.lineWidth;
				minX -= margin;
				minY -= margin;
				maxX += margin;
				maxY += margin;
				determineDrawingCommon($.extend(getXYWH(minX, minY, maxX, maxY), {
					params: { path: currentPath },
					toolType: 'polyline'
				}));
			}
			/** mousedown
			 */
			let beforeTimeStamp = null;
			$eventLayer.onMousedown((e) => {
				isDown = true;
				const timeDif = (beforeTimeStamp) ? e.timeStamp - beforeTimeStamp : Infinity;
				beforeTimeStamp = e.timeStamp;
				const pos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
				const move = (currentPath.length >= 2) ? getDistance(currentPath[currentPath.length - 2], pos) : Infinity;
				if (move < 20 && timeDif < 300) {
					determineDrawing();
					currentPath = [];
					isDown = false;
					isMove = false;
					beforeTimeStamp = null;
					e.stopPropagation();
				} else {
					if (!currentPath.length) {
						currentPath.push(pos);
					}
					currentPath[currentPath.length] = { x: pos.x, y: pos.y };
				}
			});
			/** mousemove
			 */
			$('body').myOn('mousemove touchmove', (e) => {
				if (isDown) {
					isMove = true;
					const pos = parseIntVec(pageXYToCanvasXY(getPageXY(e)));
					const lastVertex = currentPath[currentPath.length - 1];
					lastVertex.x = pos.x;
					lastVertex.y = pos.y;
					tempDrawingCtx.path = currentPath;
					self.update(tempDrawingCtx);
				}
			});
			/** mouseup
			 */
			$('body').myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (isMove) {
					//determineDrawing(currentLTPos, currentRBPos);
				}
				//isDown = false;
				isMove = false;
			});
		}
	},
}
