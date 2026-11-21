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
p.scoreUp=b('data_changevariableby',null,'goalIf',{VALUE:[1,[4,'1']]},{VARIABLE:['Score','score']});

p.hazardIf=b('control_if','winIf','goalIf',{CONDITION:[2,'hazardTouch'],SUBSTACK:[2,'loseLife']});
p.hazardTouch=b('sensing_touchingobject',null,'hazardIf',{TOUCHINGOBJECTMENU:[1,'hazardMenu']});
p.hazardMenu=b('sensing_touchingobjectmenu',null,'hazardTouch',{}, {TOUCHINGOBJECTMENU:['hazard',null]});
p.loseLife=b('data_changevariableby','returnHome','hazardIf',{VALUE:[1,[4,'-1']]},{VARIABLE:['Lives','lives']});
p.returnHome=b('motion_gotoxy',null,'loseLife',{X:[1,[4,'0']],Y:[1,[4,'0']]});
p.winIf=b('control_if','loseIf','forever',{CONDITION:[2,'winCheck'],SUBSTACK:[2,'winStop']});
p.winCheck=b('operator_gte',null,'winIf',{OPERAND1:[3,'scoreReporter',[4,'0']],OPERAND2:[1,[4,String([5,3,8,6][i])]]});
p.scoreReporter=b('data_variable',null,'winCheck',{}, {VARIABLE:['Score','score']});
p.winStop=b('control_stop',null,'winIf',{}, {STOP_OPTION:['all',null]});
p.loseIf=b('control_if',null,'forever',{CONDITION:[2,'loseCheck'],SUBSTACK:[2,'loseStop']});
p.loseCheck=b('operator_lte',null,'loseIf',{OPERAND1:[3,'livesReporter',[4,'0']],OPERAND2:[1,[4,'0']]});
p.livesReporter=b('data_variable',null,'loseCheck',{}, {VARIABLE:['Lives','lives']});
p.loseStop=b('control_stop',null,'loseIf',{}, {STOP_OPTION:['all',null]});
for(const [k,dir] of [['right',90],['left',-90],['up',0],['down',180]]){p['event'+k]=b('event_whenkeypressed','direction'+k,null,{}, {KEY_OPTION:[k+' arrow',null]},true);p['direction'+k]=b('motion_pointindirection','step'+k,'event'+k,{DIRECTION:[1,[4,String(dir)]]});p['step'+k]=b('motion_movesteps',null,'direction'+k,{STEPS:[1,[4,String([10,7,15,12][i])]]})}
if(i===1){p.mazeTimer=b('event_whenflagclicked','mazeWait',null,{}, {},true);p.mazeWait=b('control_wait','mazePenalty','mazeTimer',{DURATION:[1,[4,'20']]});p.mazePenalty=b('data_changevariableby',null,'mazeWait',{VALUE:[1,[4,'-1']]},{VARIABLE:['Lives','lives']});}
if(i===2){p.fire=b('event_whenkeypressed','boost',null,{}, {KEY_OPTION:['space',null]},true);p.boost=b('motion_movesteps',null,'fire',{STEPS:[1,[4,'30']]});}
if(i===3){p.pace=b('event_whenkeypressed','turn',null,{}, {KEY_OPTION:['space',null]},true);p.turn=b('motion_turnright',null,'pace',{DEGREES:[1,[4,'45']]});}
const moving=(delay)=>({start:b('event_whenflagclicked','loop',null,{}, {},true),loop:b('control_forever',null,'start',{SUBSTACK:[2,'wait']}),wait:b('control_wait','move','loop',{DURATION:[1,[4,String(delay)]]}),move:b('motion_goto',null,'wait',{TO:[1,'random']}),random:b('motion_goto_menu',null,'move',{}, {TO:['_random_',null]})});
const stage={isStage:true,name:'Stage',variables:{score:['Score',0],lives:['Lives',3]},lists:{},broadcasts:{},blocks:{},comments:{},currentCostume:0,costumes:[],sounds:[],volume:100,layerOrder:0,tempo:60,videoTransparency:50,videoState:'on',textToSpeechLanguage:null};
return {targets:[stage,target('player',p,0,0,1),target('goal',moving([1.5,3,0.8,2][i]),120,80,2),target('hazard',moving([3,5,1,2][i]),-120,-80,3)],monitors:[],extensions:[],meta:{semver:'3.0.0',vm:'0.2.0',agent:'APERTURE'}}
}
for(let i=0;i<4;i++){const dir='lesson-'+(i+1);mkdirSync(dir,{recursive:true});writeFileSync(dir+'/project.json',JSON.stringify(build(i)));writeFileSync(dir+'/'+assetName,spriteSVG);const result=spawnSync('python3',['-c',`import zipfile,sys,pathlib; p=pathlib.Path(sys.argv[1]); z=zipfile.ZipFile(str(p)+'.sb3','w',zipfile.ZIP_DEFLATED); [z.write(f,f.name) for f in p.iterdir() if f.is_file()]; z.close()`,dir],{encoding:'utf8'});if(result.status!==0)throw Error('Scratch archive failed: '+result.stderr);console.log(dir+'.sb3',names[i])}
