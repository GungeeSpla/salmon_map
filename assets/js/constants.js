// =========================================================
// constants.js
// =========================================================

const VERSION = '0.3.0';
const STORAGE_KEY = 'salmon_map';
const STORAGE_KEY_AUTOSAVE = 'salmon_map_autosave';
const STORAGE_KEY_JSONSAVE = 'salmon_map_jsonsave';
const AUTOSAVE_INTERVAL = 3000;
const CHARCODE_a = ('a').charCodeAt(0);
const CHARCODE_A = ('A').charCodeAt(0);
const DEFAULT_SAVEDATAOBJ = {
	stage: 'shakeup',
	tide: 'normal',
	maptype: 'floorplan',
	'checkbox-layer-basket': true,
	'checkbox-layer-cannon': true,
	'checkbox-layer-gusher': true,
	'checkbox-layer-drizzler-link': false,
	'checkbox-layer-voronoi': false,
	'checkbox-layer-drizzler': false,
	'checkbox-layer-flyfish': false,
	'checkbox-layer-spawner': false,
	'checkbox-layer-mothership': false,
	'checkbox-layer-rail': true,
	'checkbox-layer-startpos': false,
	'checkbox-layer-stinger': false,
};
const DEFAULT_MAP_TRANSFORM = {
	'shakeup-high': [300, 75, 0.9, 0, 151],
	'shakeup-normal': [145, 75, 0.6, 0, 90],
	'shakeup-low': [-41, 300, 0.7, -123, 64],
	'shakeship-high': [0, -32, 0.86, -90, 123],
	'shakeship-normal': [55, 0, 0.62, -90, 89],
	'shakeship-low': [10, 380, 0.7, 90, 65],
	'shakehouse-high': [10, 75, 0.85, 90, 133],
	'shakehouse-normal': [0, 75, 0.51, 90, 112],
	'shakehouse-low': [160, 470, 0.85, -90, 61],
	'shakelift-high': [165, -100, 1, 180, 116],
	'shakelift-normal': [120, -145, 0.75, 180, 75],
	'shakelift-low': [-70, 340, 0.8, 90, 36],
	'shakeride-high': [10, 300, 1.1, 0, 217],
	'shakeride-normal': [15, 290, 0.7, 0, 98],
	'shakeride-low': [40, 280, 0.75, 180, 68]
};
const USER_LANG = (getQueries().lang || navigator.language || navigator.USER_LANGuage || 'ja').includes('ja') ? 'ja' : 'en';
const STAGE_WIDTH = 2400;
const STAGE_HEIGHT = 2400;
const LAYER_MANAGER_LIST = [
	{ name: 'layer-basket', target: 'Obj_CoopIkuraBankBase' },
	{ name: 'layer-gusher', target: 'Obj_CoopSpawnGeyser' },
	{ name: 'layer-cannon', target: 'Obj_MissilePositionVs'	},
	{ name: 'layer-startpos', target: 'StartPos' },
	{ name: 'layer-spawner', target: 'Obj_CoopSpawnPointZako' },
	{ name: 'layer-drizzler-link' },
	{ name: 'layer-voronoi', brother: 'layer-voronoi-2' },
	{ name: 'layer-voronoi-2', isHidden: true },
	{ name: 'layer-drizzler', target: 'Obj_CoopJumpPointEnemyRocket' },
	{ name: 'layer-flyfish', target: 'Obj_CoopArrivalPointEnemyCup' },
	{ name: 'layer-stinger', target: 'Obj_CoopArrivalPointEnemyTower' },
	{ name: 'layer-mothership', target: 'Obj_CoopSpawnPointBoss' },
	{ name: 'layer-rail', target: 'Rail_Pink' },
	{ name: 'layer-steelhead', isHidden: true },
	{ name: 'layer-steeleel', isHidden: true },
	{ name: 'layer-item', isHidden: true }
];
const COLORS = [
	//'rgb(244, 67, 54)',
	'rgb(233, 30, 99)',
	//'rgb(156, 39, 176)',
	'rgb(103, 58, 183)',
	'rgb(63, 81, 181)',
	//'rgb(33, 150, 243)',
	'rgb(3, 169, 244)',
	//'rgb(0, 188, 212)',
	//'rgb(0, 150, 136)',
	'rgb(76, 175, 80)',
	//'rgb(139, 195, 74)',
	'rgb(205, 220, 57)',
	'rgb(255, 236, 60)',
	'rgb(255, 193, 7)',
	'rgb(255, 87, 34)',
	'rgb(121, 85, 72)',
	//'rgb(158, 158, 158)',
	'rgb(96, 125, 139)',
	'rgb(0, 0, 0)',
	'rgb(150, 150, 150)',
	'rgb(238, 238, 238)',
	'rgb(255, 255, 255)',
	'transparent'
];
const WEAPON = {};
const WEAPON_DEF = `
weapon-0|17||||||shooters
weapon-10|23||||||shooters
weapon-20|24||||||shooters
weapon-30|23||||||shooters
weapon-40|26||||||shooters
weapon-50|28||||||shooters
weapon-60|26||||||shooters
weapon-70|35||||||shooters
weapon-80|37||||||shooters
weapon-90|46||||||shooters
weapon-200|16|7.14|||||blasters
weapon-210|21|6.6|||||blasters
weapon-220|28|7|||||blasters
weapon-230|19|8|||||blasters
weapon-240|31|6.6|||||blasters
weapon-250|36|6.6|||||blasters
weapon-300|31||||||shooters
weapon-310|35||||||shooters
weapon-400|41||26||||shooters
weapon-1000|10|||6|15|12|rollers
weapon-1010|16|||9|19|14|rollers
weapon-1020|22|||10|26|22|rollers
weapon-1030|16|||6|21|20|rollers
weapon-1100|16||||||rollers
weapon-1110|21||||||rollers
weapon-2000|38||||||chargers
weapon-2010|52||||||chargers
weapon-2020|56||||||chargers
weapon-2030|62||||||chargers
weapon-2040|66||||||chargers
weapon-2050|43||||||chargers
weapon-2060|42||||||chargers
weapon-3000|31||||||sloshers
weapon-3010|24||||||sloshers
weapon-3020|30|3|||||sloshers
weapon-3030|55||||||sloshers
weapon-3040|42|6|||||sloshers
weapon-4000|32||||||splatlings
weapon-4010|45||||||splatlings
weapon-4020|52||||||splatlings
weapon-4030|48||24||||splatlings
weapon-4040|38||||||splatlings
weapon-5000|20||||||dualies
weapon-5010|26||||||dualies
weapon-5020|35||31||||dualies
weapon-5030|35||||||dualies
weapon-5040|29||||||dualies
weapon-6000|21|||5|||brellas
weapon-6010|23|||10|||brellas
weapon-6020|23|||4|||brellas
weapon-7000|19|7|||||others
weapon-7010|21|||5|||others
weapon-7020|62||||||others
weapon-7030|41|3|||||others
weapon-8000|48|16|||||others
weapon-8010|60|16|||||others
weapon-8020|62|10|||||others
weapon-8030|28||||||others
weapon-8040|66||||||others
weapon-8050|122|18|||||others
`;
{
	const lines = WEAPON_DEF.split('\n');
	lines.forEach((line) => {
		if (!line) {
			return;
		}
		const values = line.split('|');
		WEAPON[values[0].trim()] = {
			id       : parseInt(values[0].trim().replace('weapon-', '')),
			range    : parseFloat(values[1]) || -1,
			blast    : parseFloat(values[2]) || -1,
			rangeNear: parseFloat(values[3]) || -1,
			rangeFar : parseFloat(values[4]) || -1,
			vRange   : parseFloat(values[5]) || -1,
			vRangeFar: parseFloat(values[6]) || -1,
			kind     : values[7] || 'others'
		};
	});
}

const IMAGE_PIECES = [
	'egg-golden.png',
	'egg-golden-3.png',
	'egg-golden-5.png',
	'egg-golden-10.png',
	'egg-power.png',
	'enemy-app-drizzler.png',
	'enemy-app-flyfish.png',
	'enemy-app-goldie.png',
	'enemy-app-griller.png',
	'enemy-app-maws.png',
	'enemy-app-scrapper.png',
	'enemy-app-steeleel.png',
	'enemy-app-steelhead.png',
	'enemy-app-stinger.png',
	'enemy-chum.png',
	'enemy-drizzler.png',
	'enemy-flyfish.png',
	'enemy-goldie.png',
	'enemy-griller.png',
	'enemy-maws.png',
	'enemy-scrapper.png',
	'enemy-steeleel.png',
	'enemy-steelhead.png',
	'enemy-stinger.png',
	'player-octo-1.png',
	'player-octo-2.png',
	'player-octo-3.png',
	'player-octo-4.png',
	'player-squid-1.png',
	'player-squid-2.png',
	'player-squid-3.png',
	'player-squid-4.png'
];
