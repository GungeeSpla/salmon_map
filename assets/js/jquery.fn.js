// =========================================================
// jquery.fn.js
// =========================================================

(function($){
	/** myTrigger(name)
	 */
	$.fn.myTrigger = function(name) {
		this.each((i, elm) => {
			const event = document.createEvent('Event');
			event.initEvent(name, false, true);
			elm.dispatchEvent(event);
		});
		return this;
	};
	/** myOn(events, callback, passive, capture)
	 */
	$.fn.myOn = function(events, callback, passive, capture) {
		this.each((i, elm) => {
			events.split(' ').forEach((event) => {
				const options = { passive: false, capture: false };
				if (event === 'input' || event === 'change') options.passive = true;
				if (typeof passive !== 'undefined') options.passive = passive;
				if (typeof capture !== 'undefined') options.capture = capture;
				if (event.includes('touch')) {
					elm.addEventListener(event, function(e) {
						lastTouchEvent = e;
						callback.call(this, e);
					}, options);
				} else {
					elm.addEventListener(event, callback, options);
				}
			});
		});
		return this;
	};
	/** elmvar(name, val)
	 */
	$.fn.elmvar = function(name, val) {
		if (typeof val !== 'undefined') {
			this.get(0)[name] = val;
			return this;
		} else {
			return this.get(0)[name];
		}
	}
	/** cssvar(name, val)
	 */
	$.fn.cssvar = function(name, val) {
		if (typeof val !== 'undefined') {
			this.get(0).style.setProperty(name, val);
			return this;
		} else {
			return this.get(0).style.getPropertyValue(name);			
		}
	};
	/** getXY()
	 */
	$.fn.getXY = function() {
		const x = parseFloat(this.css('left')) || 0;
		const y = parseFloat(this.css('top')) || 0;
		return {x, y};
	};
	/** setXY(x, y)
	 */
	$.fn.setXY = function(x, y) {
		if (typeof x === 'object') {
			y = x.y;
			x = x.x;
		}
		const left = parseFloat(x) + 'px';
		const top = parseFloat(y) + 'px';
		this.css({ left, top });
		return this;
	};
	/** setWH(w, h)
	 */
	$.fn.setWH = function(w, h) {
		if (typeof w === 'object') {
			h = w.h || w.height;
			w = w.w || w.width;
		}
		const width = parseFloat(w) + 'px';
		const height = parseFloat(h) + 'px';
		this.css({ width, height });
		return this;
	};
	/** getWH()
	 */
	$.fn.getWH = function() {
		const width = parseFloat(this.css('width'));
		const height = parseFloat(this.css('height'));
		return { width, height };
	};
	/** canvasToStage()
	 */
	$.fn.canvasToStage = function() {
		const size = this.getWH();
		const cpos = this.getXY();
		const spos = parseIntVec(canvasXYToStageXY(cpos));
		const edeg = this.elmvar('rotate');
		const sdeg = canvasSetting.stageRotate;
		const rszOpt = this.elmvar('myresizableOptions');
		const drgOpt = this.elmvar('mydraggableOptions');
		this.setXY(spos);
		this.elmvar('myRotate')(edeg - sdeg);
		if (rszOpt && rszOpt.elmType === 'text') {
			const fs1 = parseFloat(this.find('textarea').css('font-size'));
			const fs2 = (fs1 / canvasSetting.stageScale).toFixed(1)
			this.find('textarea').css('font-size', `${fs2}px`);
			this.find('textarea').myTrigger('input');
		} else {
			this.setWH({
				width: parseInt(size.width / canvasSetting.stageScale),
				height: parseInt(size.height / canvasSetting.stageScale)
			});
		}
		if (drgOpt) {
			drgOpt.parentType = 'stage';
		}
		if (rszOpt && rszOpt.resize) {
			rszOpt.resize();
		}
		return this;
	};
	/** stageToCanvas()
	 */
	$.fn.stageToCanvas = function() {
		const size = this.getWH();
		const spos = this.getXY();
		const cpos = parseIntVec(stageXYToCanvasXY(spos));
		const edeg = this.elmvar('rotate');
		const sdeg = canvasSetting.stageRotate;
		const rszOpt = this.elmvar('myresizableOptions');
		const drgOpt = this.elmvar('mydraggableOptions');
		this.setXY(cpos);
		this.elmvar('myRotate')(edeg + sdeg);
		if (rszOpt && rszOpt.elmType === 'text') {
			const fs1 = parseFloat(this.find('textarea').css('font-size'));
			const fs2 = (fs1 * canvasSetting.stageScale).toFixed(1)
			this.find('textarea').css('font-size', `${fs2}px`);
			this.find('textarea').myTrigger('input');
		} else {
			this.setWH({
				width: parseInt(size.width / canvasSetting.stageScale),
				height: parseInt(size.height / canvasSetting.stageScale)
			});
		}
		if (drgOpt) {
			drgOpt.parentType = 'canvas';
		}
		if (rszOpt && rszOpt.resize) {
			rszOpt.resize();
		}
		return this;
	};
	/** checkElementBelowCavnas()
	 */
	$.checkElementBelowCavnas = function(e, isOnlyDrawing) {
		const mousePos = getPageXY(e);
		const mousePosOnCanvas = pageXYToCanvasXY(mousePos);
		const mousePosOnStage = canvasXYToStageXY(mousePosOnCanvas);
		let flag = false;
		let $clickables;
		let $clickable;
		if (isOnlyDrawing) {
			$clickables = $('.drawing-container');
			for (let i = $clickables.length - 1; i >= 0; i--) {
				$clickable = $clickables.eq(i);
				const elmPos = $clickable.getXY();
				const elmSize = $clickable.getWH();
				const distance = getDistance(elmPos, mousePosOnStage);
				const radius = getDistance({ x: elmSize.width, y: elmSize.height }) / 2;
				if (distance < radius) {
					const mspos2 = {
						x: mousePosOnStage.x - elmPos.x,
						y: mousePosOnStage.y - elmPos.y
					};
					const rotate = $clickable.elmvar('rotate');
					const mspos3 = getRotatedVector(mspos2, rotate);
					const mspos4 = {
						x: parseInt(elmSize.width / 2 + mspos3.x),
						y: parseInt(elmSize.height / 2 + mspos3.y)
					};
					const ctx = $clickable.elmvar('mydraggableOptions').ctx;
					if (!!ctx.getImageData(mspos4.x, mspos4.y, 1, 1).data[3]) {
						flag = true;
						break;
					}
				}
			}
		} else {
			//$clickables = $('#canvas-container .mydraggable,#canvas-container .myrotatable-handle,#canvas-container .myresizable-handle');
			$clickables = $('#canvas-container .mydraggable');
			for (let i = $clickables.length - 1; i >= 0; i--) {
				$clickable = $clickables.eq(i);
				let elmPos, elmSiz, elmRot, drgOpt, $prtElm;
				const eType = $clickable.hasClass('range-handle') ? 3
				            : $clickable.hasClass('myrotatable-handle') ? 2
				            : $clickable.hasClass('myresizable-handle') ? 1
				            : 0;
				if (eType > 0) {
					$prtElm = (eType > 2) ? $clickable.parent().parent() : $clickable.parent();
					const pElmPos = $prtElm.getXY();
					const pElmSiz = $prtElm.getWH();
					elmSiz = { width: 30 / canvasSetting.stageScale, height: 30 / canvasSetting.stageScale };
					elmRot = $prtElm.elmvar('rotate');
					drgOpt = $prtElm.elmvar('mydraggableOptions');
					if (eType === 1) {
						elmPos = { x: pElmPos.x + pElmSiz.width/2 + elmSiz.width/2, y: pElmPos.y + pElmSiz.height/2 + elmSiz.height/2 };
					} else if (eType === 2) {
						elmPos = { x: pElmPos.x + pElmSiz.width/2 + elmSiz.width/2, y: pElmPos.y - pElmSiz.height/2 - elmSiz.height/2 };
					} else {
						const range = parseInt($prtElm.cssvar('--range'));
						const rngRot = $clickable.parent().elmvar('rotate');
						const vec = getRotatedVector({ x: range, y: 0 }, rngRot);
						elmPos = { x: pElmPos.x + vec.x, y: pElmPos.y + vec.y };
						elmRot += rngRot;
					}
				} else {
					elmPos = $clickable.getXY();
					elmSiz = $clickable.getWH();
					elmRot = $clickable.elmvar('rotate');
					drgOpt = $clickable.elmvar('mydraggableOptions');
				}
				if (drgOpt.parentType === 'stage') {
					elmPos = stageXYToCanvasXY(elmPos);
					elmSiz = getMultipliedWH(elmSiz, canvasSetting.stageScale);
					elmRot = elmRot + canvasSetting.stageRotate;
				}
				elmRds = getDistance({ x: elmSiz.width/2, y: elmSiz.height/2 });
				mosRds = getDistance(elmPos, mousePosOnCanvas);
				if (mosRds < elmRds) {
					const mousePosFromElmCenter = {
						x: mousePosOnCanvas.x - elmPos.x,
						y: mousePosOnCanvas.y - elmPos.y
					};
					const p = getRotatedVector(mousePosFromElmCenter, - elmRot);
					if (drgOpt.ctx) {
						const cx = parseInt((p.x + elmSiz.width / 2) / canvasSetting.stageScale);
						const cy = parseInt((p.y + elmSiz.height / 2) / canvasSetting.stageScale);
						const imgdata = drgOpt.ctx.getImageData(cx, cy, 1, 1);
						if (!!imgdata.data[3]) {
							flag = true;
							break;
						}
					} else {
						if (- elmSiz.width/2  <= p.x &&
						      elmSiz.width/2  >= p.x &&
						    - elmSiz.height/2 <= p.y &&
						      elmSiz.height/2 >= p.y) {
						    flag = true;
						    break;
						}
					}
				}
			}
		}
		return (flag) ? $clickable : false;
	}
	/** myDraggable(options)
	 */
	$.fn.myDraggable = function(options = {}) {
		options = $.extend({
			parent: 'body',
			parentType: 'body',
			isRemovable: true
		}, options);
		this.addClass('mydraggable');
		const $parent = $(options.parent);
		const parent = $parent.get(0);
		let startTimeStamp;
		this.elmvar('mydraggableOptions', options);
		if (!parent.hasOwnProperty('myDraggableData')) {
			parent.myDraggableData = {};
			const data = parent.myDraggableData;
			data.$elm = null;
			data.startMousePos = null;
			data.startElmPos = null;
			$parent.myOn('mousemove touchmove', (e) => {
				if (data.$elm) {
					const options = data.$elm.elmvar('mydraggableOptions');
					const mousePos = getPageXY(e);
					if (options.parentType === 'canvas') {
						const offset = pageXYToCanvasXY(mousePos.x, mousePos.y);
						const x = data.startElmPos.x + (offset.x - data.startMousePos.x);
						const y = data.startElmPos.y + (offset.y - data.startMousePos.y);
						data.$elm.setXY(x, y);
					} else if (options.parentType === 'stage') {
						const offset = pageXYToStageXY(mousePos.x, mousePos.y);
						const x = data.startElmPos.x + (offset.x - data.startMousePos.x);
						const y = data.startElmPos.y + (offset.y - data.startMousePos.y);
						data.$elm.setXY(x, y);
					} else {
						const x = data.startElmPos.x + (mousePos.x - data.startMousePos.x);
						const y = data.startElmPos.y + (mousePos.y - data.startMousePos.y);
						data.$elm.setXY(x, y);
					}
					if (options.drag) options.drag(data.$elm.get(0));
					// デフォルト動作の停止とイベント伝播の停止
					e.preventDefault();
					e.stopPropagation();
				}
			});
			$parent.myOn('mouseup touchend mouseleave touchleave', (e) => {
				if (data.$elm) {
					const timeDif = e.timeStamp - data.mousedownStartTime;
					if (!data.options.isPanel) {
						if (timeDif < 100) {
							//data.$elm.addClass('selected');
						}
					}
					if (data.options.isRemovable) {
						let pos = data.$elm.getXY();
						if (data.options.parentType === 'stage') {
							pos = stageXYToCanvasXY(pos);
						}
						if (!(0 <= pos.x && pos.x <= canvasSetting.canvasWidth && 0 <= pos.y && pos.y <= canvasSetting.canvasHeight)) {
							if (data.$elm.$family) {
								data.$elm.$family.remove()
								if (data.$elm.hasClass('stage-object-eel-node')) {
									updateSteelEelCanvas();
								}
							} else {
								data.$elm.remove();
								if (data.$elm.hasClass('steelhead')) {
									updateSteelheadCanvas();
								}
							}
						}
					}
					if (!data.options.isPanel) onChangeCanvas();
					if (data.options.stop) data.options.stop(data.$elm.get(0));
					data.$elm = null;
				}
			});
		}
		const data = parent.myDraggableData;
		this.onMousedown((e) => {
			const mousePos = getPageXY(e);
			//if (!e.isForced && options.startif && !options.startif(e)) {
			if (!e.isForced && options.startif) {
				const ret = $.checkElementBelowCavnas(e, false);
				const event = document.createEvent('Event');
				event.initEvent(e.type, false, true);
				event.pageX = mousePos.x;
				event.pageY = mousePos.y;
				event.isForced = true;
				if (ret) {
					ret.get(0).dispatchEvent(event);
				} else {
					const $activeEventLayer = $('.layer-event.showed');
					if ($activeEventLayer.length) {
						$activeEventLayer.get(0).dispatchEvent(event);
					}
				}
				e.stopPropagation();
				return;
			}
			if ($(this).hasClass('mydraggable-disable')) {
				return;
			}
			const elmPos = this.getXY();
			if (options.parentType === 'canvas') {
				data.startMousePos = pageXYToCanvasXY(mousePos.x, mousePos.y);
				data.startElmPos = elmPos;
			} else if (options.parentType === 'stage') {
				data.startMousePos = pageXYToStageXY(mousePos.x, mousePos.y);
				data.startElmPos = elmPos;
			} else {
				data.startMousePos = mousePos;
				data.startElmPos = elmPos;
			}
			data.$elm = this;
			data.mousedownTimeStamp = e.timeStamp;
			data.options = options;
			if (!options.isPanel) {
				$('.selected').removeClass('selected');
				this.addClass('selected');
			}
			if (data.options.start) data.options.start(data.$elm.get(0));
			e.stopPropagation();
		});
		return this;
	};
	/** myRotatable(options)
	 */
	$.fn.myRotatable = function(options = {}) {
		options = $.extend({
			parent: 'body',
			handle: null,
			isTransformCenter: false,
			initialRotate: 0
		}, options);
		this.addClass('myrotatable');
		const translateStr = (options.isTransformCenter) ? 'translate(-50%, -50%) ' : '';
		const $handle = (options.handle) 
			? options.handle.addClass('myrotatable-handle')
			: $('<div class="myrotatable-handle"></div>').appendTo(this);
		const $parent = $(options.parent);
		const parent = $parent.get(0);
		if (!parent.hasOwnProperty('myRotatableData')) {
			parent.myRotatableData = {};
			const data = parent.myRotatableData;
			data.$elm = null;
			$parent.myOn('mousemove touchmove', (e) => {
				if (data.$elm) {
					const mousePos = getPageXY(e);
					const angle = getVectorAngle({
						x: mousePos.x - data.elmPos.x,
						y: mousePos.y - data.elmPos.y
					});
					const angleDif = angle - data.startAngle;
					data.$elm.elmvar('rotate', data.startRotate + angleDif);
					data.$elm.css('transform', `${data.$elm.elmvar('translateStr')} rotate(${data.$elm.elmvar('rotate')}deg)`);
					e.preventDefault();
					e.stopPropagation();
				}
			});
			$parent.myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (data.$elm) {
					if (!data.options.isPanel) onChangeCanvas();
					data.$elm = null;
				}
			});
		}
		const data = parent.myRotatableData;
		this.css('transform-origin', 'center center')
		.elmvar('translateStr', translateStr)
		.elmvar('myRotate', (degree) => {
			this.elmvar('rotate', degree)
			.css('transform', `${translateStr} rotate(${degree}deg)`);
			return this;
		})
		.elmvar('myRotate')(options.initialRotate);
		$handle.onMousedown((e) => {
			if ($(this).hasClass('myrotatable-disable')) {
				return;
			}
			data.$elm = this;
			data.options = options;
			const mousePos = getPageXY(e);
			const clientRect = this.get(0).getBoundingClientRect();
			const scrollTarget = document.scrollingElement || document.documentElement || document.body;
			const scrollLeft = scrollTarget.scrollLeft;
			const scrollTop = scrollTarget.scrollTop;
			const elmPos = {
				x: clientRect.x + clientRect.width / 2 + scrollLeft,
				y: clientRect.y + clientRect.height / 2 + scrollTop
			};
			const angle = getVectorAngle({
				x: mousePos.x - elmPos.x,
				y: mousePos.y - elmPos.y
			});
			data.startAngle = angle;
			data.elmPos = elmPos;
			data.startRotate = this.elmvar('rotate');
			e.preventDefault();
			e.stopPropagation();
		});
		return this;
	};
	/** myResizable(options)
	 */
	$.fn.myResizable = function(options = {}) {
		this.addClass('myresizable');
		if (typeof options.ratio === 'undefined') options.ratio = 1;
		this.elmvar('myresizableOptions', options);
		const $handle = $('<div class="myresizable-handle"></div>').appendTo(this);
		const $parent = $(options.parent || 'body');
		const parent = $parent.get(0);
		if (!parent.hasOwnProperty('myResizableData')) {
			parent.myResizableData = {};
			const data = parent.myResizableData;
			data.$elm = null;
			data.startWH = null;
			data.startFontSize = null;
			data.startMousePos = null;
			$parent.myOn('mousemove touchmove', (e) => {
				if (data.$elm) {
					const mousePos = getPageXY(e);
					const elmPos = data.startElmPos;
					const distance = getDistance(mousePos, elmPos);
					const newW = Math.max(24, data.startWH.width * (distance / data.startDistance));
					const newH = newW * (data.startWH.height / data.startWH.width);
					if (data.options.elmType === 'text') {
						const scale = newW / data.startWH.width;
						const newFontSize = (data.startFontSize * scale).toFixed(1);
						data.$elm.find('textarea').css('font-size', `${newFontSize}px`);
						data.$elm.find('textarea').myTrigger('input');
					} else {
						data.$elm.setWH(parseInt(newW), parseInt(newH));
					}
					if (data.options.resize) {
						data.options.resize(data.$elm);
					}
					e.preventDefault();
					e.stopPropagation();
				}
			});
			$parent.myOn('mouseup mouseleave touchend touchleave', (e) => {
				if (data.$elm) {
					if (!data.options.isPanel) onChangeCanvas();
					data.$elm = null;
				}
			});
		}
		const data = parent.myResizableData;
		$handle.onMousedown((e) => {
			if ($(this).hasClass('myresizable-disable')) {
				return;
			}
			const mousePos = getPageXY(e);
			const elmPos = getElementsCenterPageXY(this.get(0));
			const distance = getDistance(mousePos, elmPos);
			data.startMousePos = mousePos;
			data.startElmPos = elmPos;
			data.startDistance = distance;
			data.$elm = this;
			data.startWH = this.getWH();
			data.options = options;
			if (data.options.elmType === 'text') {
				data.startFontSize = parseFloat(this.find('textarea').css('font-size'));
			}
			e.preventDefault();
			e.stopPropagation();
		});
		return this;
	};
	/** onMousedown(callback)
	 */
	$.fn.onMousedown = function(callback, passive) {
		const beforeEvent = {};
		this.myOn('mousedown touchstart', (e) => {
			const timeDif = e.timeStamp - beforeEvent.timeStamp;
			if (e.type === 'mousedown' && beforeEvent.type === 'touchstart' && timeDif < 300) {
				return;
			}
			callback.call(this, e);
			beforeEvent.type = e.type;
			beforeEvent.timeStamp = e.timeStamp;
			//e.preventDefault();
			//e.stopPropagation();
		}, passive);
		return this;
	};
	/** onDoubleClick(callback)
	 */
	$.fn.onDoubleClick = function(callback) {
		const beforeEvent = {};
		this.myOn('mousedown touchstart', (e) => {
			const timeDif = e.timeStamp - beforeEvent.timeStamp;
			if (e.type === 'mousedown' && beforeEvent.type === 'touchstart' && timeDif < 300) {
				return;
			}
			if (timeDif < 500) {
				callback.call(this, e);
			}
			beforeEvent.type = e.type;
			beforeEvent.timeStamp = e.timeStamp;
		});
		return this;
	};
	/** onLongTouch(callback)
	 */
	$.fn.onLongTouch = function(callback) {
		const beforeEvent = {};
		let isDown = false;
		let timerId;
		let startMousePos;
		this.myOn('mousedown touchstart', (e) => {
			const timeDif = e.timeStamp - beforeEvent.timeStamp;
			if (e.type === 'mousedown' && beforeEvent.type === 'touchstart' && timeDif < 300) {
				return;
			}
			isDown = true;
			timerId = setTimeout(() => {
				callback.call(this, e);
			}, 1000);
			startMousePos = getPageXY(e);
			beforeEvent.type = e.type;
			beforeEvent.timeStamp = e.timeStamp;
		});
		this.myOn('mousemove touchmove', (e) => {
			if (isDown) {
				const mousePos = getPageXY(e);
				const move = Math.abs(mousePos.x - startMousePos.x) + Math.abs(mousePos.y - startMousePos.y);
				if (move > 10) {
					isDown = false;
					clearTimeout(timerId);
					//timerId = setTimeout(() => {
					//	callback.call(this, e);
					//}, 1000);
					//startMousePos = mousePos;
				}
			}
		});
		this.myOn('mouseleave touchleave', (e) => {
			isDown = false;
			clearTimeout(timerId);
		});
		this.myOn('mouseup touchend', (e) => {
			isDown = false;
			clearTimeout(timerId);
		});
		return this;
	};
	/** onShortTouch(callback)
	 */
	$.fn.onShortTouch = function(callback) {
		let isDown = false;
		let startMousePos;
		let startTimeStamp;
		this.onMousedown((e) => {
			startMousePos = getPageXY(e);
			startTimeStamp = e.timeStamp;
		});
		this.myOn('mouseup touchend', (e) => {
			if (startMousePos && startTimeStamp) {
				const timeDif = e.timeStamp - startTimeStamp;
				const mousePos = getPageXY(e);
				const move = Math.abs(mousePos.x - startMousePos.x) + Math.abs(mousePos.y - startMousePos.y);
				if (move < 10 && timeDif < 100) {
					callback.call(this, e);
				}
			}
		});
		return this;
	};
	/** setTextBorder(width, color)
	 */
	$.fn.setTextBorder = function(width = 3, color = 'white') {
		let cssstr = '';
		createShadowPositions(width).forEach((pos, i) => {
			if (i > 0) cssstr += ', ';
			cssstr += `${pos[0].toFixed(1)}px ${pos[1].toFixed(1)}px 0px ${color}`;
		});
		this.css('text-shadow', cssstr);
		this.elmvar('border-width', width);
		this.elmvar('border-color', color);
		return this;
	}
	/** setImageBorder(width, color)
	 */
	$.fn.setImageBorder = function(width = 3, color = 'white') {
		let cssstr = '';
		createShadowPositions(width, 4, 0).forEach((pos, i) => {
			if (i > 0) cssstr += ' ';
			cssstr += `drop-shadow(${pos[0].toFixed(1)}px ${pos[1].toFixed(1)}px 0px ${color})`;
		});
		this.css('filter', cssstr);
		this.elmvar('border-width', width);
		return this;
	}
	/** loadImage(src)
	 */
	const imgCache = {};
	$.loadImage = function(src) {
  		return new Promise((resolve) => {
			if (src in imgCache) {
				resolve(imgCache[src]);
			} else {
				const img = new Image();
				img.onload = () => {
					imgCache[src] = img;
					resolve(img);
				};
				img.src = src;
			}
		});
	};
	/** loadXML(src)
	 */
	const xmlCache = {};
	$.loadXML = function(src) {
  		return new Promise((resolve) => {
			if (src in xmlCache) {
				resolve(xmlCache[src]);
			} else {
				$.ajax({
					url: src,
					type: 'GET',
					dataType: 'xml',
					timeout: 1000,
					success: function(xml) {
						xmlCache[src] = xml;
						resolve(xml);
					}
				});
			}
		});
	};
})(jQuery);
