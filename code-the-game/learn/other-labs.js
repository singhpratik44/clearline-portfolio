/* Additional practice labs for Minecraft Education and Godot 4. No code executes here. */
(function(){
"use strict";
const m=[
["Chat-driven code","Use a chat keyword to trigger your first automation.","player.onChat → callback → blocks.place","Which event starts the function?","The chat command","A random timer","Moving the mouse",0,
'player.onChat("tower", function () {\n    blocks.place(STONE, pos(0, 0, 1))\n})',
"Create a MakeCode JavaScript project in Minecraft Education. Run the example, type tower in chat, and observe one stone block placed relative to the player.",
"https://minecraft.makecode.com/reference/player/on-chat-command"],
["Variables as memory","Change the height of a repeatable build.","let height = 3 → repeat height times","What does a variable help you change?","Game's license","Number of steps","Language",1,
'player.onChat("pillar", function () {\n    let height = 3\n    for (let i = 0; i < height; i++) {\n        blocks.place(STONE, pos(0, i, 1))\n    }\n})',
"Change height from 3 to 5 and check the resulting pillar. In Minecraft Education MakeCode, run pillar from chat.",
"https://minecraft.makecode.com/reference/blocks/place"],
["Loops","Repeat a building command without copying it many times.","for loop → repeat placement → pattern","Why use a loop?","Repeat actions reliably","Skip all conditions","Publish the game",0,
'player.onChat("line", function () {\n    for (let x = 0; x < 5; x++) {\n        blocks.place(GLASS, pos(x, 0, 0))\n    }\n})',
"Run line, count five glass blocks, then modify the upper bound to 8. Ensure the target area is empty.",
"https://minecraft.makecode.com/javascript"],
["Agent movement","Send a sequence of instructions to the Agent.","agent.teleportToPlayer → agent.move","What is a sequence?","A list of ordered actions","An item skin","A player score",0,
'player.onChat("march", function () {\n    agent.teleportToPlayer()\n    agent.move(FORWARD, 3)\n    agent.turn(LEFT_TURN)\n    agent.move(FORWARD, 2)\n})',
"Run march and watch each movement in Minecraft Education. Change one distance and compare the route.",
"https://minecraft.makecode.com/reference/agent/move"],
["Detect and decide","Make automation sensitive to its surroundings.","agent.detect → boolean → if","What does a condition do?","Chooses a branch","Guarantees success","Changes a skin",0,
'player.onChat("check", function () {\n    agent.teleportToPlayer()\n    if (agent.detect(FORWARD)) {\n        player.say("Something is ahead!")\n    } else {\n        player.say("The path is clear!")\n    }\n})',
"Put a block ahead of the Agent, try check, then remove the block and test both branches.",
"https://minecraft.makecode.com/reference/agent/detect"],
["Automation capstone","Combine commands, loops and environment checks.","chat trigger → agent action → test result","Which is the best capstone test?","Only reading the script","Running it under two different conditions","Renaming a variable",1,
'player.onChat("builder", function () {\n    agent.teleportToPlayer()\n    for (let i = 0; i < 3; i++) {\n        if (!agent.detect(FORWARD)) {\n            agent.move(FORWARD, 1)\n        }\n    }\n})',
"Run builder in open space and in front of an obstacle. Explain why the Agent stops or moves. Make your own safe three-step route.",
"https://minecraft.makecode.com/reference/agent"]
];
const g=[
["Scene building","Understand nodes and what belongs in a scene.","Node2D → children → scene tree","What is a scene tree?","A hierarchy of nodes","A list of scores","A texture format",0,
'# Start with a Node2D scene.\n# Add a CharacterBody2D child.\n# Add Sprite2D and CollisionShape2D under the character.',
"In Godot 4, create a Node2D scene and a CharacterBody2D child; verify you can select the child in the Scene dock.",
"https://docs.godotengine.org/en/stable/getting_started/step_by_step/nodes_and_scenes.html"],
["Input and movement","Move a character using keyboard input.","Input.get_vector → velocity → move_and_slide","Which method resolves body movement?","queue_free","move_and_slide","print",1,
'extends CharacterBody2D\n@export var speed = 250.0\nfunc _physics_process(_delta):\n    var direction = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")\n    velocity = direction * speed\n    move_and_slide()',
"Attach the script to CharacterBody2D. Test all arrow keys after configuring collision and a sprite. Observe movement in Play.",
"https://docs.godotengine.org/en/stable/tutorials/2d/2d_movement.html"],
["Collision","Use CollisionShape2D to define solid areas.","CharacterBody2D + CollisionShape2D → physics collision","What defines the character's collision shape?","CollisionShape2D","Camera2D","Label",0,
'# Scene tree:\n# Player (CharacterBody2D)\n#   ├─ Sprite2D\n#   └─ CollisionShape2D\n# LevelWall (StaticBody2D)\n#   └─ CollisionShape2D',
"Create a StaticBody2D wall with a CollisionShape2D. Run toward it and verify Player cannot pass through.",
"https://docs.godotengine.org/en/stable/tutorials/physics/physics_introduction.html"],
["Collectibles","Trigger a reward when a character enters an Area2D.","Area2D.body_entered → score update → remove item","Which signal detects a body entering an Area2D?","body_entered","clicked","frame_completed",0,
'extends Area2D\nsignal collected\nfunc _on_body_entered(body):\n    if body is CharacterBody2D:\n        collected.emit()\n        queue_free()\n# Connect the Area2D body_entered signal to _on_body_entered.',
"Create Coin (Area2D + CollisionShape2D) and connect body_entered. Use a separate score manager to listen for collected.",
"https://docs.godotengine.org/en/stable/tutorials/scripting/signals.html"],
["Enemy or hazard","Detect a hazard contact and decide on a consequence.","Area2D → signal → reset or damage","What separates a hazard from a coin?","Event handling logic","Node color alone","File size",0,
'extends Area2D\nsignal touched_hazard\nfunc _on_body_entered(body):\n    if body is CharacterBody2D:\n        touched_hazard.emit()\n# Connect body_entered to the method above.',
"Make a new red Area2D hazard and connect its signal. For the capstone, connect touched_hazard to a reset function in your game controller.",
"https://docs.godotengine.org/en/stable/tutorials/scripting/signals.html"],
["Score display","Turn a numeric value into on-screen feedback.","Score variable → Label.text","What displays a numeric score to the player?","Label.text","Collision shape","Node group",0,
'extends Label\nvar points := 0\nfunc add_point():\n    points += 1\n    text = "Coins: " + str(points)',
"Add a Label as part of a UI scene and attach this script. Call add_point after a verified collectible signal.",
"https://docs.godotengine.org/en/stable/tutorials/ui/index.html"],
["Level transitions","Use a condition to move to a win screen.","count >= target → change_scene_to_file","When should the win scene appear?","Only when required conditions are met","Whenever the player moves","Whenever the game loads",0,
'extends Node\nvar coins := 0\nconst REQUIRED := 3\nfunc collect_coin():\n    coins += 1\n    if coins >= REQUIRED:\n        get_tree().change_scene_to_file("res://win.tscn")',
"Create a simple win.tscn first. Test the condition with 2 coins and then 3; the scene should change only at the threshold.",
"https://docs.godotengine.org/en/stable/tutorials/scripting/scene_tree.html"],
["Playtest and polish","Combine movement, walls, pickups and victory.","Input → collision → score → win → replay","What is strongest evidence the game works?","A screenshot of code","Playing the whole route twice and reproducing results","An untested title",1,
'# Full playtest checklist:\n# 1. Start a fresh run.\n# 2. Move in all four directions.\n# 3. Verify solid walls block movement.\n# 4. Collect exactly three coins.\n# 5. Confirm win scene loads at threshold.\n# 6. Restart and repeat.',
"Record a bug and its fix, complete a fresh run twice, and export your project using Godot's Export workflow only after testing.",
"https://docs.godotengine.org/en/stable/tutorials/export/index.html"]
];
function put(p,tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;p.append(n);return n}
function render(container,course,index){
 const catalog=course.id==="minecraft"?m:course.id==="indie"?g:null;if(!catalog||!catalog[index])return false;
 const v=catalog[index],root=put(container,"section","s3-root");
 put(root,"div","s3-eyebrow","BONUS PRACTICE / "+String(index+1).padStart(2,"0")+" OF "+String(catalog.length).padStart(2,"0"));
 put(root,"h3","",v[0]);put(root,"p","",v[1]);put(root,"p","s3-flow",v[2]);
 const qa=put(root,"div","s3-section");put(qa,"h4","",v[3]);const feedback=put(qa,"p","s3-feedback","");
 const group=put(qa,"div","s3-answers");
 for(let k=4;k<=6;k++){const b=put(group,"button","s3-answer",v[k]);b.type="button";b.onclick=()=>{Array.from(group.children).forEach(x=>x.classList.remove("s3-chosen"));b.classList.add("s3-chosen");feedback.textContent=k-4===v[7]?"✓ Correct. Now test the concept in your editor.":"Try again. Think about the state and the event.";feedback.dataset.correct=String(k-4===v[7])}}
 const build=put(root,"div","s3-section");put(build,"h4","","Code reference / editor sketch");
 const pre=put(build,"pre","code");put(pre,"code","",v[8]);
 const copy=put(build,"button","s3-control","Copy reference");copy.type="button";copy.onclick=async()=>{try{await navigator.clipboard.writeText(v[8]);copy.textContent="✓ Copied"}catch{copy.textContent="Select code above to copy"}};
 put(build,"h4","","Do it in the real editor");put(build,"p","",v[9]);
 const doc=put(build,"a","", "Official documentation ↗");doc.href=v[10];doc.target="_blank";doc.rel="noopener noreferrer";
 const evidence=put(root,"div","s3-section");const label=put(evidence,"label","s3-check");
 const check=put(label,"input");check.type="checkbox";put(label,"span","","I reproduced the result in "+(course.id==="minecraft"?"Minecraft Education":"Godot 4"));
 const key="clearline-engine-check-"+course.id+"-"+index;try{check.checked=localStorage.getItem(key)==="yes"}catch{}
 check.onchange=()=>{try{localStorage.setItem(key,check.checked?"yes":"no")}catch{}};
 put(evidence,"p","s3-disclaimer","Self-reported; this page cannot execute or validate game-engine code. Instructions are supplementary to the paid course lessons.");
 return true;
}
window.ClearlineOtherLabs={render};
})();