// =========================================================
// objectCreater.js
// =========================================================

/** convert(x, z)
 */
function convert(x, z) {
	const newX = (x + 1200);
	const newZ = (z + 1200);
	return [newX, newZ]; 
}
function isTideEqual(tide, obj) {
	return (
	   (tide === 'low'    && obj.layer === 'CoopWater_0')
	|| (tide === 'normal' && obj.layer === 'CoopWater_1')
	|| (tide === 'high'   && obj.layer === 'CoopWater_2'));
}
function isTideEqualOrMore(tide, obj) {
	return (
	   (tide === 'low'    && (obj.layer === 'CoopWater_2' || obj.layer === 'CoopWater_1' || obj.layer === 'CoopWater_0'))
	|| (tide === 'normal' && (obj.layer === 'CoopWater_2' || obj.layer === 'CoopWater_1'))
	|| (tide === 'high'   && (obj.layer === 'CoopWater_2')));
}

/** objectCreater
 */
const objectCreater = {
	/** スポナー
	 */
	'Obj_CoopSpawnPointZako_1': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object spawner spawndir-1"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	'Obj_CoopSpawnPointZako_2': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object spawner spawndir-2"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	'Obj_CoopSpawnPointZako_3': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object spawner spawndir-3"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	/** タワー
	 */
	'Obj_CoopArrivalPointEnemyTower_1': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object stinger spawndir-1"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	'Obj_CoopArrivalPointEnemyTower_2': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object stinger spawndir-2"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	'Obj_CoopArrivalPointEnemyTower_3': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object stinger spawndir-3"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	/** カタパ
	 */
	'Obj_CoopArrivalPointEnemyCup_1': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object flyfish spawndir-1"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	'Obj_CoopArrivalPointEnemyCup_2': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object flyfish spawndir-2"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	'Obj_CoopArrivalPointEnemyCup_3': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object flyfish spawndir-3"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	/** コウモリ
	 */
	'Obj_CoopJumpPointEnemyRocket': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		const $obj = $('<div class="drizzler-container"><input type="checkbox" id="'+obj.id+'"><label class="stage-object drizzler" for="'+obj.id+'"></label><div></div></div>');
		$obj.find('label').css({ left: `${x}px`, top: `${z}px` });
		$obj.find('div').css({ left: `${x}px`, top: `${z}px` });
		return $obj;
	},
	/** コンテナ
	 */
	'Obj_CoopIkuraBankBase': (obj, stage, tide, maptype) => {
		if (!isTideEqualOrMore(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<img class="stage-object basket" src="./assets/img/stage-object/mapicon-' + maptype + '-basket.png">').cssvar('--rotate', `${-obj.ry}deg`).setXY(x, z);
	},
	/** カンケツセン
	 */
	'Obj_CoopSpawnGeyser': (obj, stage, tide, maptype) => {
		if (!isTideEqualOrMore(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<img class="stage-object gusher" src="./assets/img/stage-object/mapicon-' + maptype + '-gusher.png">').setXY(x, z);
	},
	/** 大砲
	 */
	'Obj_MissilePositionVs': (obj, stage, tide, maptype) => {
		if (!isTideEqualOrMore(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<img class="stage-object cannon" src="./assets/img/stage-object/mapicon-' + maptype + '-cannon.png">').setXY(x, z);
	},
	/** スタート地点
	 */
	'StartPos': (obj, stage, tide, maptype) => {
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object startpos">'+(parseInt(obj.index) + 1)+'</div>').setXY(x, z);
	},
	/** ハコビヤ母艦
	 */
	'Obj_CoopSpawnPointBoss': (obj, stage, tide, maptype) => {
		if (!isTideEqual(tide, obj)) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		return $('<div class="stage-object mothership"></div>').cssvar('--rotate', `${obj.ry}rad`).setXY(x, z);
	},
	/** ライドレール
	 */
	'Rail_Pink': (obj, stage, tide, maptype) => {
		if (stage !== 'shakeride' || (tide === 'high' && (obj.layer !== 'CoopWater_2')) || (tide === 'normal' && !(obj.layer === 'CoopWater_1' || obj.layer === 'CoopWater_2')) || (tide === 'low' && obj.layer !== 'CoopWater_0')) {
			return null;
		}
		const [x, z] = convert(obj.tx, obj.tz);
		let elementExists = true;
		let $canvas = $('#canvas-rail');
		if ($canvas.size() < 1) {
			elementExists = false;
			$canvas = $('<canvas id="canvas-rail"></canvas>');
			$canvas.get(0).width = STAGE_WIDTH;
			$canvas.get(0).height = STAGE_HEIGHT;
		}
		const ctx = $canvas.get(0).getContext('2d');
		if (obj.layer === 'CoopWater_0') {
			ctx.fillStyle = '#ff4383';
			ctx.strokeStyle = '#ff4383';
		} else if (obj.layer === 'CoopWater_1') {
			ctx.fillStyle = 'orange';
			ctx.strokeStyle = 'orange';
		} else if (obj.layer === 'CoopWater_2') {
			ctx.fillStyle = 'blue';
			ctx.strokeStyle = 'blue';
		}
		ctx.save();
		ctx.translate(x, z)
		ctx.rotate(- obj.ry * Math.PI/180);
		ctx.beginPath();
		ctx.arc(0, 0, 6, 0, 360*Math.PI/180, false);
		ctx.fill();
		ctx.restore();
		if (obj.controls) {
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(x, z);
			for (let i = 1; i < obj.controls.length; i++) {
				const p1 = obj.controls[i - 1];
				const p2 = obj.controls[i];
				const [p1x, p1z] = convert(p1.c2x, p1.c2z);
				const [p2x, p2z] = convert(p2.c1x, p2.c1z);
				const [ x2,  z2] = convert( p2.tx,  p2.tz);
				ctx.bezierCurveTo(p1x, p1z, p2x, p2z, x2, z2);
			}
			ctx.stroke();
		}
		if (!elementExists) {
			return $canvas;
		} else {
			return null;
		}
	}
};
