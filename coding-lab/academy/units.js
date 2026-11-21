// A studio sequence for beginner creators. Each unit has three 30-minute meetings.
// Students can keep one project across units or carry one favorite idea into a new medium.
window.ApertureUnits = [
  {
    title: "Make a world someone can play",
    question: "What do you want another person to do, feel, or discover in the first minute?",
    project: "Build a tiny playable world in Game Creator. Give its coins, walls, and finish a meaning you invent.",
    choices: [
      "Make a rescue game in which a coin stands for something worth finding.",
      "Tell a journey in three places and use the finish as the last scene.",
      "Model a delivery route with pickup stops, or invent another purpose for the trip."
    ],
    sessions: [
      {
        title: "First five minutes",
        steps: [
          "0–5 min · Open the sample, choose Erase or Wall, and change one tile. Press Play and try the changed route. Keep it or undo it.",
          "5–20 min · Choose your world and audience. Give the level a name. Move the finish and place two coins where something meaningful happens. Save the level on this device or download the HTML.",
          "20–30 min · Let a partner play without instructions for one minute. Ask what they thought the goal was. Write or dictate what they saw."
        ],
        deliverable: "A saved first level and one observation from a player."
      },
      {
        title: "Design the first ten seconds",
        steps: [
          "0–5 min · Draw the start, one discovery, and the ending as three boxes. Circle the moment you want your player to notice first.",
          "5–20 min · Build a route between those moments. Try two placements for the first coin and pick the one that guides the player as you intended.",
          "20–30 min · Play from the start. Count how many moves it takes to see your first clue. Explain to a partner why you kept that placement."
        ],
        deliverable: "A three-box storyboard and a second playable version."
      },
      {
        title: "Hand over the controls",
        steps: [
          "0–5 min · Predict the player's first three moves. On paper or in Plan your game, record the prediction.",
          "5–20 min · Swap roles. Each player tries the other's level while the designer stays quiet. Compare the actual first moves with the prediction.",
          "20–30 min · Change one clue or explain why you kept it. Replay the opening and download your chosen version with a useful filename."
        ],
        deliverable: "A first draft, revised level, and one sentence beginning “My player…”"
      }
    ],
    scaffold: "Start with the sample. Ask the learner to move just one coin and give it a new name in their story. An adult can operate the pointer while the child directs.",
    stretch: "Make the same layout tell two different stories by changing only the title and meaning of the objects. Ask a tester what else would need to change.",
    mentor: "Try Dreamer and choose Something of my own, or sketch without a hint. Ask what the learner wants to keep before suggesting an edit.",
    evidence: ["The learner identifies one change they chose.", "Another person can start the level and describe a goal.", "The learner compares a prediction with an observed move."]
  },
  {
    title: "Build a rule you can explain",
    question: "How does a game decide what happens after a move?",
    project: "Make a small rule laboratory in the maze. Demonstrate movement, a blocked move, and a finish that depends on collecting coins.",
    choices: [
      "Treat walls as locked museum rooms and coins as missing exhibits.",
      "Model a driver who must stop at every pickup before reaching the depot.",
      "Design a puzzle where touching the finish early teaches the rule."
    ],
    sessions: [
      {
        title: "Act out the machine",
        steps: [
          "0–5 min · Draw a six-square path. Choose a player token and a goal. Ask a partner to follow three arrow commands exactly.",
          "5–20 min · Place one wall beside the start and a coin beyond it in Game Creator. Predict separately what happens when you press toward the wall, move onto a coin, and visit the finish early.",
          "20–30 min · Try each prediction and record the input, what changed, and what stayed the same. Trade driver and observer roles."
        ],
        deliverable: "Three input-and-result examples from the learner's level."
      },
      {
        title: "Design a useful wrong turn",
        steps: [
          "0–5 min · Pick a rule your player should discover. Describe it using “When ___, if ___, then ___.”",
          "5–20 min · Build two nearby routes. Put the finish on the short route and a coin on the other. Walk both routes and check whether your rule shows up.",
          "20–30 min · Watch a partner choose. If they miss the coin, try a different placement and ask them what the new route suggests."
        ],
        deliverable: "A playable rule puzzle and a plain-language rule card."
      },
      {
        title: "Catch a broken design",
        steps: [
          "0–5 min · Save the working level. Predict what happens if a wall traps one coin.",
          "5–20 min · Deliberately trap a goal, run Check solvability, and trace the route yourself. Remove one wall and check again. Identify why the result changed.",
          "20–30 min · Give the fixed puzzle to a fresh player or replay it from the start. Include the coin, the early finish, and the final win in your demonstration."
        ],
        deliverable: "A before-and-after sketch or two level files with the repaired square marked."
      }
    ],
    scaffold: "Use one coin and one finish. The learner can point to a printed route while a partner records each move.",
    stretch: "Design two different one-wall repairs for the same blockage. Compare the trips and choose the repair you prefer.",
    mentor: "Ask the Playtester for a hint on the broken layout. Have the learner point to the blocking square before anyone moves it.",
    evidence: ["The learner distinguishes a keypress from the resulting change.", "The finish can be reached early and revisited after collecting the coin.", "The learner demonstrates a failed check and a successful repair."]
  },
  {
    title: "Move your idea into Scratch",
    question: "Which parts of your design survive when you change tools?",
    project: "Turn a version of your maze into a Scratch scene with a character, movement, and a new event of your own.",
    choices: [
      "Make an explorer who introduces the place before moving.",
      "Make an interactive story where pressing a key reveals a line of dialogue.",
      "Make a delivery simulation where a signal changes the driver's costume."
    ],
    sessions: [
      {
        title: "Carry the world across",
        steps: [
          "0–5 min · Pick a saved level. Draw or list what you expect to travel with it: layout, player, movement, rules, or story.",
          "5–20 min · Use Download Scratch project, then load the .sb3 file from your computer in Scratch. Press the green flag and try the arrows. Inspect the backdrop and sprite scripts.",
          "20–30 min · Mark what came across. The starter supplies a backdrop and arrow movement; pick one behavior you will build yourself. Save a new .sb3 copy."
        ],
        deliverable: "A local Scratch project and a list of one inherited feature and one planned addition."
      },
      {
        title: "Give the character a voice",
        steps: [
          "0–5 min · Decide what your character wants. Sketch one costume, line of speech, or sound that helps a player understand it.",
          "5–20 min · Add a green-flag script that sends the sprite to its opening position. Add your chosen introduction. Add a separate key event that changes what the audience sees or hears.",
          "20–30 min · Start twice from different sprite positions. Ask a partner to demonstrate the new key event. Revise the cue if they cannot find it."
        ],
        deliverable: "A repeatable opening and a learner-authored key event in Scratch."
      },
      {
        title: "Trace an event",
        steps: [
          "0–5 min · Pick one key event and predict the order its blocks will run. Use paper arrows or point at the blocks.",
          "5–20 min · Change the order of two safe blocks in a copy. Try both versions. For example, compare speaking before a costume change with speaking afterward.",
          "20–30 min · Keep the order that suits the scene. Save locally and give a short demonstration explaining what starts the script and what the audience notices."
        ],
        deliverable: "A Scratch scene and annotated sequence for one script."
      }
    ],
    scaffold: "Use an existing sprite. Offer three blocks on paper: event, movement, speech. Let the learner arrange them and direct a partner to assemble them.",
    stretch: "Give two sprites distinct reactions to the same broadcast. Check what happens on a second green-flag start.",
    mentor: "Let Coder introduce the Scratch path. Invite the student to decide which exported behavior to keep and which new behavior makes the project theirs.",
    evidence: ["The student names what transferred and what they added.", "An event triggers a visible or audible change.", "Two fresh starts produce the intended opening."]
  },
  {
    title: "Design a decision with consequences",
    question: "How can the same action produce two different outcomes?",
    project: "Build an if/else rule in Scratch and a playable moment where the audience experiences both branches.",
    choices: [
      "A sprite reacts differently when it touches a marked zone.",
      "A story character offers different endings for two choices.",
      "A traffic signal lets a vehicle move only in one signal state."
    ],
    sessions: [
      {
        title: "Map the fork",
        steps: [
          "0–5 min · Say a rule from everyday life that has two outcomes. Name the condition that decides between them.",
          "5–20 min · Draw a decision diamond with yes and no exits. Pick a Scratch condition you can set up twice, such as touching a colored zone or pressing a particular key.",
          "20–30 min · Act out both paths with a partner. Make each outcome observable through speech, motion, costume, or sound. Label both on your map."
        ],
        deliverable: "A branching diagram with a specific condition and two observable outcomes."
      },
      {
        title: "Make both branches work",
        steps: [
          "0–5 min · Open a copy of your Scratch scene. Find an event block, an if/else block, and the sensing or comparison block your condition needs.",
          "5–20 min · Assemble a tiny version under a test key. Put one distinct action in each branch. Trigger it once when the condition is true and once when false.",
          "20–30 min · Fit the tested rule into the project. If using backdrop color, sample the actual color and test at the center of the zone before testing its edge."
        ],
        deliverable: "A working Scratch rule and the two ways to trigger it."
      },
      {
        title: "Test the boundary",
        steps: [
          "0–5 min · Choose an awkward case, such as standing on an edge, holding a key, or making the same choice twice. Predict the result.",
          "5–20 min · Have a partner try the awkward case plus both ordinary outcomes. Record expected and observed outcomes in three rows.",
          "20–30 min · Repair the rule or adjust the cue. Repeat the case that surprised you and explain why you kept the final behavior."
        ],
        deliverable: "Three test cases and a revision to the rule or its instructions."
      }
    ],
    scaffold: "Start with a key event that checks whether the player is touching one solid color. Let the two branches say different words before adding movement.",
    stretch: "Make a door require two conditions. Test four combinations and find the only combination that should open it.",
    mentor: "Ask for an observable difference between yes and no. If both branches look alike, let the learner pick temporary signals that make them easy to inspect.",
    evidence: ["Both branches are reachable.", "The condition can be observed or checked.", "The learner predicts and tests a boundary case."]
  },
  {
    title: "Make a world that remembers",
    question: "What should your world remember after the player acts?",
    project: "Use a variable in Scratch to remember a meaningful quantity and let that quantity affect the experience.",
    choices: [
      "Track batteries collected before a rover can radio home.",
      "Track clues found before a character tells the ending.",
      "Model water stored in a reservoir as rain adds units and homes use them."
    ],
    sessions: [
      {
        title: "Name the memory",
        steps: [
          "0–5 min · Pick a quantity the audience cares about. Give it a clear name and decide its value at the start.",
          "5–20 min · Make a variable. Set it on the green flag, then change it from a deliberate event such as a click or keypress. Show the value temporarily while building.",
          "20–30 min · Predict the values after three events. Ask a partner to click or press in that order and compare the display with your prediction."
        ],
        deliverable: "A named variable, a reset rule, and a three-event trace."
      },
      {
        title: "Make the number matter",
        steps: [
          "0–5 min · Pick a threshold that changes the experience. Show what should happen just below it, at it, and above it.",
          "5–20 min · Add a comparison to your script and trigger an ending, message, or costume when the threshold is reached. Use a visible cue to show progress.",
          "20–30 min · Run your three threshold cases. If the event can add two at once, decide what should happen when the value skips past the threshold."
        ],
        deliverable: "A state-dependent outcome and three tested values."
      },
      {
        title: "Debug a second run",
        steps: [
          "0–5 min · Predict the first value on a second playthrough after a win. Restart and inspect it.",
          "5–20 min · Test repeated inputs and a second start. If a coin can be counted twice, choose a remedy such as hiding its sprite until reset. Fix one surprising result.",
          "20–30 min · Give a player two turns in a row. Ask whether the progress cue helped them understand their goal. Keep or change one cue using their observation."
        ],
        deliverable: "A replayable project with an explained reset and feedback cue."
      }
    ],
    scaffold: "Use one variable, one trigger, and a three-unit goal. Move three counters by hand before adding code.",
    stretch: "Add a second quantity with its own purpose. Explain how a higher score could still produce an undesirable outcome in your simulation.",
    mentor: "If a learner gets stuck, ask for the variable's value before the event, after it, and after restart. Let the trace suggest the repair.",
    evidence: ["A prediction matches a three-event trace.", "Crossing the chosen threshold has a visible consequence.", "Starting again resets the state the learner intended."]
  },
  {
    title: "Read your world as Python data",
    question: "How can numbers describe a place that you designed?",
    project: "Represent one place from your project as a maze grid, then use the Python mission to inspect and change its data.",
    choices: [
      "Represent a level and identify the tile that controls a shortcut.",
      "Represent a story map where meaningful items mark key scenes.",
      "Represent a town where walls mark closed streets and coins mark stops."
    ],
    sessions: [
      {
        title: "Translate one row",
        steps: [
          "0–5 min · Open your maze or sketch a place from your Scratch project in Game Creator. Only the current maze becomes Python data; redraw other layouts here.",
          "5–20 min · Pick a row. Write its tile codes on paper: 0 open, 1 wall, 2 coin, 3 finish. Use Load current maze in the Python mission and find your row in the maze list.",
          "20–30 min · Point to a square, its row, and its column. Have a partner find the corresponding number. Switch roles and check a second square."
        ],
        deliverable: "An annotated row from the learner's map and two matching coordinates."
      },
      {
        title: "Ask Python about a square",
        steps: [
          "0–5 min · Choose a square with different row and column numbers. Count from zero, starting at the upper left. Predict its tile code.",
          "5–20 min · At the end of the generated program, add print(maze[1][2]) to inspect row 1, column 2. Run it. Replace those indices with yours and compare the output with the board.",
          "20–30 min · Swap the two indices and predict again. Record what changed. If Python is offline, trace both expressions on the printed rows and save the program to run later."
        ],
        deliverable: "Two print statements and predictions, labeled as run or traced by hand."
      },
      {
        title: "Change the model",
        steps: [
          "0–5 min · Pick a coordinate whose change matters to your game, story, or town. Predict why changing the number matters.",
          "5–20 min · Save your Python draft. Edit one number inside the maze list and run again. Compare the map printed or inspected in Python with the editor board. Python edits stay in the program.",
          "20–30 min · Make the equivalent edit on the board if you want to keep it there. Save both versions. Explain one detail of your world that the four tile codes cannot express."
        ],
        deliverable: "A saved Python file, the corresponding board change, and a stated limit of the model."
      }
    ],
    scaffold: "Cover all but a 3 × 3 patch of the board. Label row and column on sticky notes. Pair a reader with a driver and switch after one lookup.",
    stretch: "Print an entire row, then write a short loop that prints every row. Explain why changing maze[y][x] refers to a different place than maze[x][y] for many values.",
    mentor: "Use Coder → Python code to connect the learner's coin count to the program. Ask them to show where a value came from before changing code.",
    evidence: ["A board square is matched to the correct row and column.", "The learner uses a prediction to check an index.", "The learner distinguishes a Python model edit from a board edit."]
  },
  {
    title: "Ask a question with code",
    question: "Can you design an experiment that might prove your own prediction wrong?",
    project: "Use the reachability search in the Python mission to compare two versions of a map and answer a question about access.",
    choices: [
      "Ask whether a hidden coin can be reached after one shortcut closes.",
      "Ask which story locations stay accessible when the bridge disappears.",
      "Ask how a detour changes the number of delivery stops a driver can reach."
    ],
    sessions: [
      {
        title: "Be the search",
        steps: [
          "0–5 min · Draw a small map with one wall and mark the start. Which squares can you reach without crossing a wall?",
          "5–20 min · Act out the search. Put the start on a to-do list. Take the first square, add its unvisited open neighbors, mark them seen, and repeat. Trace four rounds.",
          "20–30 min · Find queue and seen in the generated Python. Match one paper action to a line of code. Predict what would happen if you kept adding already-seen squares."
        ],
        deliverable: "A four-round trace showing the waiting squares and the seen squares."
      },
      {
        title: "Change one thing",
        steps: [
          "0–5 min · Write one question comparing map A and map B. Choose exactly one wall or open tile to change. Predict the reachable coin count and finish result for each map.",
          "5–20 min · Run map A in the Python mission. Download or record its results. Make your change on the board, load the current maze again, and run map B under the same conditions.",
          "20–30 min · Record both results next to your predictions. Use a finger trace to explain the tile whose change did or did not affect access."
        ],
        deliverable: "A two-row comparison with the single changed tile, predictions, and observed results."
      },
      {
        title: "Look for a counterexample",
        steps: [
          "0–5 min · Turn your first result into a claim. For example, “Closing a road always cuts off a stop.” Sketch a map that might challenge it.",
          "5–20 min · Build a second route or a dead end and repeat the check. If the runtime is unavailable, walk the search manually and label the result as a manual trace.",
          "20–30 min · Write a narrower claim that fits both maps. State what the search actually checks. A reachable goal alone does not tell you whether a player finds the route easy."
        ],
        deliverable: "A counterexample map, a revised claim, and the method used to check it."
      }
    ],
    scaffold: "Start with one coin on an otherwise empty layout, then isolate the start by closing the two exits. Use paper tokens to track visited tiles.",
    stretch: "Extend a local program to count visited tiles with len(seen). Compare two maps that have the same reachable coin count but different numbers of reachable tiles.",
    mentor: "Ask “What result would surprise you?” before running either program. Let the learner interpret an unchanged result as evidence.",
    evidence: ["Only one chosen map feature differs in the main comparison.", "The result includes a coin count or finish value for each map.", "The learner revises or qualifies a claim using a second example."]
  },
  {
    title: "Remix with credit and care",
    question: "What can you learn from someone else's idea while making a clearly different creation?",
    project: "Make a credited remix of your own early draft or a partner's explicitly offered project. Keep the original so players can compare both versions.",
    choices: [
      "Turn a speed challenge into a puzzle with multiple possible routes.",
      "Retell the story from a supporting character's perspective.",
      "Change one assumption in a model and investigate how the behavior changes."
    ],
    sessions: [
      {
        title: "Find the idea worth keeping",
        steps: [
          "0–5 min · Choose your first draft or ask a classmate whether you may remix their local file. If they prefer to keep it private, use your own.",
          "5–20 min · Play the original. Save a separate copy with a new filename. Identify one borrowed idea to keep and one rule, viewpoint, or assumption you will change.",
          "20–30 min · Write a credit line using the creator's chosen display name or “my earlier draft.” Share the credit and proposed edit with the creator or a partner."
        ],
        deliverable: "Two separate files, a credit line, and a one-sentence remix intention."
      },
      {
        title: "Change who can play",
        steps: [
          "0–5 min · Ask a tester which cue is hard to notice or which action is hard to perform. Select one concrete change that fits your project tool.",
          "5–20 min · Build the remix and add one additional way to understand or control it. In Scratch try a keyboard event as an alternative to clicking, or pair a color cue with text or a shape.",
          "20–30 min · Try the game with the original cue hidden or one input method unused. Record which actions can still be completed and where the route breaks."
        ],
        deliverable: "A working remix with one change to a rule and one change to a cue or control."
      },
      {
        title: "Play them side by side",
        steps: [
          "0–5 min · Predict one difference a player will notice and one familiar detail they will recognize.",
          "5–20 min · Ask a tester to try both files in the same conditions. Have them describe the difference without showing them your intention. Invite pointers, drawings, or spoken feedback.",
          "20–30 min · Improve the least clear change. Add the credit beside the project and record exactly what the tester could do with the alternative cue or control."
        ],
        deliverable: "A remix pair with credit, a comparison, and an observed accessibility result."
      }
    ],
    scaffold: "Use your own Unit 1 level as the source. Change one route and add a written clue. A partner can read the clue aloud during the comparison.",
    stretch: "Hand the remix to someone using a different device or preferred input and check the same three tasks. Keep any untried access paths labeled untested.",
    mentor: "Ask the remixer to point to the inherited idea before showing their change. Let the original creator choose whether and how to be credited.",
    evidence: ["Original and remix remain separately playable or inspectable.", "The source is credited with permission or identified as the learner's own.", "A tester tries one alternative route, cue, or control and reports the result."]
  },
  {
    title: "Ship an original prototype",
    question: "What is the smallest version of your own idea that someone else can try?",
    project: "Combine your favorite design and coding ideas into an original capstone. Choose Game Creator, Scratch, or a local Python project and state what the experience will do.",
    choices: [
      "Make a game with one meaningful player decision and a clear win or ending.",
      "Make a story where one audience choice changes the next scene.",
      "Make a simulation where someone changes one input and compares two outcomes."
    ],
    sessions: [
      {
        title: "Pitch and cut",
        steps: [
          "0–5 min · Tell a partner who the project is for and what that person gets to decide. Let the partner repeat the idea back.",
          "5–20 min · Sketch the opening, decision, and result. Pick one tool and list the inputs, rules, and feedback you need. Put one ambitious extra in a later list.",
          "20–30 min · Make a paper version and let your partner play through it. Write a finish condition someone can demonstrate, such as “Either door leads to a different ending.”"
        ],
        deliverable: "A one-page project brief, paper prototype, and observable finish condition."
      },
      {
        title: "Build the smallest complete version",
        steps: [
          "0–5 min · Order the work so a person can try an opening and result before you add art or extra scenes. Pick your first action.",
          "5–20 min · Build one complete path from input to result. Save a draft before cosmetic work. If blocked, substitute a simple shape, number, or speech bubble and keep the path playable.",
          "20–30 min · Ask a partner to attempt your finish condition and one unexpected input. Record what happened, including the first place they needed help."
        ],
        deliverable: "A saved end-to-end prototype and first-use observation."
      },
      {
        title: "Choose what ships",
        steps: [
          "0–5 min · Name the issue that most interferes with your intent. Pick a single repair or a deliberate reason to keep the design.",
          "5–20 min · Make the change in a copy. Replay the original success case, the unexpected input, and a fresh start. Have the tester try the changed moment again.",
          "20–30 min · Save the release version, its opening instructions, and a known limitation. Select a private, small-group, or family audience for the next unit."
        ],
        deliverable: "A release candidate, three checked cases, and a short creator note."
      }
    ],
    scaffold: "Limit the project to one scene, one input, and two outcomes. Use the maze if the learner wants a working base. A paper description can stand in for an unfinished scene.",
    stretch: "Make a second prototype with a competing design for the same moment. Give both to a tester and use a specific observation to choose.",
    mentor: "When a learner requests a complete solution, invite them to predict the next visible result and choose between two small experiments they can run.",
    evidence: ["The student's brief names an audience and meaningful decision.", "A new player can try a complete input-to-result path.", "A test result informs one repair or reasoned decision to keep the design."]
  },
  {
    title: "Host a studio arcade",
    question: "How can you show what you made and what creating it taught you?",
    project: "Assemble a creator portfolio and host a small play session. A single partner, a family member, or a classroom group can be the audience.",
    choices: [
      "Show how one rule changed a player's strategy across two game versions.",
      "Let visitors choose different endings and discuss what their choice changed.",
      "Invite visitors to predict a simulation result and compare it with the observed outcome."
    ],
    sessions: [
      {
        title: "Curate the work",
        steps: [
          "0–5 min · Choose an early version and the version you want visitors to experience. Pick one moment showing how your idea changed.",
          "5–20 min · Assemble a portfolio page, folder, or paper display with both versions, credit, instructions, and the reason for one revision. Offer a spoken or drawn explanation if writing slows you down.",
          "20–30 min · Ask a partner to start from the instructions alone. Adjust unclear steps. Keep personal information out of shareable project titles and notes."
        ],
        deliverable: "A private-by-default portfolio with first version, chosen version, and creator explanation."
      },
      {
        title: "Run the arcade",
        steps: [
          "0–5 min · Set up a station or share a device with one invited player. Decide whether the project stays on the device or gets a share link.",
          "5–20 min · Give the player one challenge. Watch before helping. Invite them to show one surprise by pointing, drawing, or explaining; record the behavior without a name.",
          "20–30 min · Swap creator and player roles. Each creator demonstrates one design choice and how a playtest influenced it. Save notes privately unless the creator chooses to share."
        ],
        deliverable: "A played or inspected project plus an anonymous observation from the showcase."
      },
      {
        title: "Choose what comes next",
        steps: [
          "0–5 min · Revisit the finish condition from Unit 9. Identify the moment in the play session that met it, or the step that still needs work.",
          "5–20 min · Use the portfolio to tell a 60-second account: “I wanted ___; I tried ___; the player ___; I kept or changed ___ because ___.” Make one last change if it serves that story.",
          "20–30 min · Choose one question for a next project. Offer the class one sticking point that would make a useful future studio challenge. Record how you know it was a sticking point."
        ],
        deliverable: "A final creator statement, a chosen next question, and evidence for one proposed studio improvement."
      }
    ],
    scaffold: "Use a two-seat arcade with a trusted partner. Let the learner demonstrate or narrate privately, with a printed side-by-side comparison if needed.",
    stretch: "Ask two visitors with different playing styles to try the same moment. Explain why conflicting feedback could lead to two reasonable design decisions.",
    mentor: "Ask what the learner is proud to keep. Invite a student choice, a real playtest observation, and a reason for a revision into the portfolio. An educator can count these anonymously to guide the next studio.",
    evidence: ["The portfolio contains two versions and credit where relevant.", "The learner explains a design choice using a real observation.", "The learner chooses the audience and an independent next project question."]
  }
];
