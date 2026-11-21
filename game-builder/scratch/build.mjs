// Run with node build.mjs from game-builder/scratch. Generates four Scratch 3 project.json files.
// Scratch editor import requires zipping each project.json together with its referenced SVG assets into .sb3.
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const names=['Catch the Stars','Maze Explorer','Space Defender','Original Game Studio'];
const spriteSVG='<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><circle cx="30" cy="30" r="25" fill="#62dfbb"/></svg>';
const assetHash=createHash('md5').update(spriteSVG).digest('hex');
const assetName=assetHash+'.svg';
function b(op,next=null,parent=null,inputs={},fields={},top=false){return {opcode:op,next,parent,inputs,fields,shadow:false,topLevel:top,...(top?{x:60,y:80}:{})}}
function target(name,blocks,x,y,layer){return {isStage:false,name,variables:{},lists:{},broadcasts:{},blocks,comments:{},currentCostume:0,costumes:[{assetId:assetHash,name,md5ext:assetName,dataFormat:'svg',rotationCenterX:30,rotationCenterY:30}],sounds:[],volume:100,layerOrder:layer,visible:true,x,y,size:80,direction:90,draggable:false,rotationStyle:'all around'}}
function build(i){
const p={};
p.start=b('event_whenflagclicked','scoreReset',null,{}, {},true);
p.scoreReset=b('data_setvariableto','livesReset','start',{VALUE:[1,[4,'0']]},{VARIABLE:['Score','score']});
p.livesReset=b('data_setvariableto','forever','scoreReset',{VALUE:[1,[4,'3']]},{VARIABLE:['Lives','lives']});
p.forever=b('control_forever',null,'livesReset',{SUBSTACK:[2,'goalIf']});
p.goalIf=b('control_if','hazardIf','forever',{CONDITION:[2,'goalTouch'],SUBSTACK:[2,'scoreUp']});
p.goalTouch=b('sensing_touchingobject',null,'goalIf',{TOUCHINGOBJECTMENU:[1,'goalMenu']});
p.goalMenu=b('sensing_touchingobjectmenu',null,'goalTouch',{}, {TOUCHINGOBJECTMENU:['goal',null]});
p.scoreUp=b('data_changevariableby','moveGoal','goalIf',{VALUE:[1,[4,'1']]},{VARIABLE:['Score','score']});
p.moveGoal=b('motion_goto',null,'scoreUp',{TO:[1,'randomMenu']});
p.randomMenu=b('motion_goto_menu',null,'moveGoal',{}, {TO:['_random_',null]});
p.hazardIf=b('control_if',null,'goalIf',{CONDITION:[2,'hazardTouch'],SUBSTACK:[2,'loseLife']});
p.hazardTouch=b('sensing_touchingobject',null,'hazardIf',{TOUCHINGOBJECTMENU:[1,'hazardMenu']});
p.hazardMenu=b('sensing_touchingobjectmenu',null,'hazardTouch',{}, {TOUCHINGOBJECTMENU:['hazard',null]});
p.loseLife=b('data_changevariableby','returnHome','hazardIf',{VALUE:[1,[4,'-1']]},{VARIABLE:['Lives','lives']});
p.returnHome=b('motion_gotoxy',null,'loseLife',{X:[1,[4,'0']],Y:[1,[4,'0']]});
for(const [k,dir] of [['right',90],['left',-90],['up',0],['down',180]]){p['event'+k]=b('event_whenkeypressed','direction'+k,null,{}, {KEY_OPTION:[k+' arrow',null]},true);p['direction'+k]=b('motion_pointindirection','step'+k,'event'+k,{DIRECTION:[1,[4,String(dir)]]});p['step'+k]=b('motion_movesteps',null,'direction'+k,{STEPS:[1,[4,i===2?'15':'10']]})}
const stage={isStage:true,name:'Stage',variables:{score:['Score',0],lives:['Lives',3]},lists:{},broadcasts:{},blocks:{},comments:{},currentCostume:0,costumes:[],sounds:[],volume:100,layerOrder:0,tempo:60,videoTransparency:50,videoState:'on',textToSpeechLanguage:null};
return {targets:[stage,target('player',p,0,0,1),target('goal',{},120,80,2),target('hazard',{},-120,-80,3)],monitors:[],extensions:[],meta:{semver:'3.0.0',vm:'0.2.0',agent:'APERTURE'}}
}
for(let i=0;i<4;i++){const dir='lesson-'+(i+1);mkdirSync(dir,{recursive:true});writeFileSync(dir+'/project.json',JSON.stringify(build(i)));writeFileSync(dir+'/'+assetName,spriteSVG);const result=spawnSync('python3',['-c',`import zipfile,sys,pathlib; p=pathlib.Path(sys.argv[1]); z=zipfile.ZipFile(str(p)+'.sb3','w',zipfile.ZIP_DEFLATED); [z.write(f,f.name) for f in p.iterdir() if f.is_file()]; z.close()`,dir],{encoding:'utf8'});if(result.status!==0)throw Error('Scratch archive failed: '+result.stderr);console.log(dir+'.sb3',names[i])}
