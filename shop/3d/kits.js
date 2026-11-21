// APERTURE's published offerings. Visualization choices describe a brief for the visitor.
(() => {
  "use strict";
  const field = (label, ...values) => ({ label, values });
  const axes = {
    beauty: [field("Look", "Everyday natural", "Soft glam", "Bold evening"), field("Palette", "Rosy", "Peach", "Berry"), field("Routine length", "5 minutes", "10 minutes", "20 minutes")],
    city: [field("Street layout", "Street grid", "Central green", "Riverfront"), field("Neighborhood priority", "Homes", "Green space", "Transit"), field("Building height", "Low rise", "Mixed heights", "Tall buildings")],
    model: [field("Space", "Living room", "Studio office", "Gaming room"), field("Layout", "Open plan", "Paired zones", "Corner arrangement"), field("Finish", "Warm oak", "Stone grey", "Sage")],
    sports: [field("Skill to focus on", "Passing", "Shooting", "Defense"), field("Practice group", "Solo", "Pair", "Team"), field("Setting", "Driveway", "Half court", "Full court")],
    gift: [field("Gift presentation", "Card", "Deck", "Workbook"), field("Who will use it?", "One person", "Two together", "A group"), field("Display idea", "Flat", "Folded", "Boxed")],
    game: [field("World to build", "Maze", "Mystery", "Simulation"), field("Core mechanic", "Collect", "Choose", "Balance"), field("Project scope", "Tiny", "Medium", "Expanded")],
    art: [field("Subject", "On the court", "Abstract", "Mixed"), field("Arrangement", "Single print", "Triptych", "Gallery wall"), field("Frame idea", "Black", "Oak", "White")],
    workflow: [field("Scope", "One task", "Team process", "Program"), field("Flow", "Linear", "Branching", "Parallel"), field("Review points", "One checkpoint", "Two checkpoints", "Three checkpoints")],
    seasonal: [field("Message", "Gratitude", "Celebration", "Encouragement"), field("Style", "Paper", "Starlight", "Botanical"), field("Display", "Standing card", "Folded card", "Keepsake")],
    broadcast: [field("Feature", "Player", "Game", "Studio"), field("Shot", "Close-up", "Medium", "Wide"), field("Set", "Court", "Desk", "Interview")]
  };

  function offer(title, path, note, match) {
    const result = { title, href: "../../" + path, note };
    if (match) result.match = match;
    return result;
  }
  function kit(id, title, category, description, type, availability, offers) {
    return { id, title, category, description, type, availability, options: axes[type], offers };
  }
  const demo = "Free virtual demo";
  const resource = "Free activity";
  const inquiry = "Service inquiry";
  const licensed = "Digital edition";
  const fullCatalog = offer("See gift editions", "gifts/catalog.html#shop", "Compare products and their digital-use terms.");
  const familyCard = offer("Create a free greeting", "gifts/featured/index.html#make", "Write and personalize a greeting in your browser.");
  const courtSample = offer("Try two Basketball IQ challenges", "gifts/sample/index.html", "Print and play a free decision exercise.");
  const testWorld = offer("Open World Builder", "coding-lab/academy/worlds/index.html", "Build and play a branching world.");
  const paths = offer("Explore project pathways", "coding-lab/academy/pathways/index.html", "Choose a project with something to build, demonstrate, and keep.");
  const partner = offer("Explore a school or club pilot", "coding-lab/partners/index.html", "Review the pilot format and contact the program team.");
  const showcase = offer("Preview the art gallery", "shop/art/index.html#gallery", "See the six original designs on the gallery page.");
  const catalogService = offer("Read the offer and contact options", "offers.html#offers", "Find this named service in the published offer guide to request its scope.");
  const threeD = offer("Open the 3D Design Studio", "design/index.html", "Arrange objects, test layouts, and save a design brief.");
  const room2D = offer("Use the 2D room planner", "design/2d.html", "Try the lightweight planning canvas.");
  const artPacks = [
    ["courtside", "Courtside Collection", "The Clutch, All Court, and Elevate"],
    ["beyond", "Beyond Collection", "Quiet Power, Wonder, and Unbroken"],
    ["premium", "Premium Archive", "All six designs in poster, phone, and SVG formats"]
  ];
  const kits = [
    kit("makeup","Makeup Routine Studio","Beauty","Plan a look around your palette and time, then try the routine builder.","beauty",demo,[
      offer("Try the routine builder","beauty/index.html#studio","Build an everyday, soft glam, or evening routine."),
      offer("Read the Everyday Glow guide","beauty/everyday-glow.html","Explore the published everyday routine.",[0,-1,-1])
    ]),
    kit("city","Neighborhood Planning Lab","Design","Picture a neighborhood. Decide where homes, parks, and routes belong, then compare priorities in New Earth Designer.","city",demo,[
      offer("Play the neighborhood challenge","shop/city-challenge/index.html","Arrange a district and test your planning choices in the free city activity."),
      offer("Try New Earth Designer","future/index.html#experiences","Under Creation & Service, choose New Earth Designer to explore housing, green space, and public services."),
      offer("Explore the Civilization Lab","civilization-lab.html","Test a policy decision and examine its tradeoffs.")
    ]),
    kit("spatial-design","Room & Object Design Studio","Design","Model a space for making, working, or playing. Compare its footprint before opening a free planner.","model",demo,[threeD,room2D]),
    kit("free-greeting","Personal Greeting Maker","Gifts","Make a free greeting for an occasion or a person you want to thank.","seasonal",resource,[familyCard]),
    kit("holiday-reflection","Moment of Light","Gifts","Choose a feeling and make a personal note to share over the holidays.","seasonal",resource,[
      offer("Write a gratitude note","holiday/index.html?theme=gratitude","Use the free gratitude greeting.",[0,-1,-1]),
      offer("Send encouragement","holiday/index.html?theme=strength","Start with the strength greeting.",[2,-1,-1]),
      offer("Choose a holiday reflection","holiday/index.html","See the available message themes.")
    ]),
    kit("thank-you-postcards","Holiday Thank-You Postcards","Gifts","Choose a way to present a note, then print the existing postcard activity.","seasonal",resource,[
      offer("Open the printable postcards","gifts/holiday-thank-you/index.html","Download the free printable postcard sheets."),familyCard
    ]),
    kit("game-creator","Game Creator & World Builder","Learning","Decide what players do and how big a first version you want to make. Build it in the Academy.","game",resource,[
      offer("Build a playable maze","coding-lab/game-creator/index.html","Place walls, coins, and a finish.",[0,-1,-1]),testWorld,paths
    ]),
    kit("project-academy","Project Academy & Mastery","Learning","Choose the setting for an original project and record the skills it demonstrates.","game",resource,[
      paths,offer("Open a mastery report","coding-lab/academy/mastery/index.html","Record an observation and a project example.")
    ]),
    ...[
      ["roblox", "Roblox Creator Pathway", "Plan an obstacle course with checkpoints and touch events.", "code-the-game/roblox/"],
      ["minecraft", "Minecraft Coding Pathway", "Choose a project for MakeCode commands and Agent automation in Minecraft Education.", "code-the-game/minecraft/"],
      ["godot", "Indie Game Developer Pathway", "Sketch a top-down 2D game with movement, collectibles, and a win condition.", "code-the-game/godot/"],
      ["gaming-bundle", "Complete Gaming Coding Bundle", "Plan a project across Roblox Studio, Minecraft Education, and Godot.", "code-the-game/bundle/"]
    ].map(([id, title, detail, path]) => kit("coding-"+id, title, "Learning", detail, "game", "Written lesson materials", [
      offer("Review "+title, path, "Check the published lesson contents and purchase details."),paths
    ])),
    kit("private-coding","Private Coding Lesson","Learning","Sketch a project to discuss in a personalized coding lesson.","game",inquiry,[
      offer("Check lesson availability","learning/book/index.html","Review the lesson details and available inquiry route."),paths
    ]),
    kit("coding-pathway-30","30-Day Coding Pathway","Learning","Plan the scope of a guided coding project from first prototype to demonstration.","game",inquiry,[
      offer("Explore learning programs","learning/index.html","See the published pathway options."),catalogService,paths
    ]),
    kit("curriculum-pilot","Curriculum Pilot Package","Learning","Model the scale of a workshop, team project, or multi-session club before discussing a pilot.","game",inquiry,[partner,catalogService]),
    kit("court-development","Basketball Development Plan","Sports","Picture a player's next practice and choose the group and court to plan for.","sports",inquiry,[
      offer("Explore basketball development","basketball.html","Review the development program."),courtSample, catalogService
    ]),
    kit("courtside-lab","Basketball Decision Lab","Sports","Try a coaching decision before building a practice around passing, shooting, or team defense.","sports",demo,[
      offer("Open the basketball decision lab","sports/index.html","Try a possession and explore the playbook."),courtSample
    ]),
    kit("family-team-license","Basketball Team Pack","Sports","Compare team resources for players and coaches and review the group-use offer.","sports","Team license inquiry",[
      offer("Review team offers and terms","gifts/teams/index.html","See the team pack and request a quote for team, camp, or school use."),courtSample
    ]),
    kit("workflow-sprint","AI Workflow Sprint","Operations","Map one recurring job, its handoffs, and the points where someone has to review the result.","workflow",inquiry,[
      offer("Review the Workflow Sprint","sprint/index.html","See the scope and inquiry options for a defined workflow."),catalogService
    ]),
    kit("operating-diagnostic","Operations Diagnostic","Operations","Choose the process to investigate and where a review could expose a missed handoff.","workflow",inquiry,[
      offer("Discuss an operations diagnostic","engage.html","Review the engagement and scope before committing.")
    ]),
    kit("command-center","Custom APERTURE Command Center","Operations","Sketch goals, dependencies, and approvals for a tailored operating dashboard.","workflow",inquiry,[catalogService,offer("Explore Unified Command","aperture-unified-command.html","See an example of the command interface.")]),
    kit("program-growth","Youth Program Growth Audit","Operations","Map one enrollment, retention, family experience, or partner workflow to discuss during an audit.","workflow",inquiry,[catalogService,partner]),
    kit("career-portfolio","Career Portfolio Build","Operations","Plan the path from a work sample to evidence an interviewer can review.","workflow",inquiry,[catalogService]),
    kit("media-growth","Sports Media Growth Kit","Media","Choose the subject, camera framing, and setting for a sports media concept before discussing an editorial plan.","broadcast",inquiry,[
      offer("Explore the sports media work sample","sports-media.html","Review the audience and media planning example."),catalogService
    ]),
    ...artPacks.map(([id, title, detail]) => kit("art-"+id, title, "Art", detail+". Try a wall arrangement, then inspect the edition and file formats.","art",licensed,[
      offer("View "+title,"shop/art/index.html#"+id+"-pack","See the artwork, files, and current purchase terms."),showcase
    ]))
  ];

  // Individual editions are keyed by the SKUs used by the public gift catalog.
  const giftEditions = [
    ["game","Game Inventor Quest Deck","Games","Eight original paper-based game design missions, from characters to playtesting.","kit"],
    ["birthday","Birthday Game Party Kit","Birthday","Eight creative birthday stations and an easy-to-follow host plan.","kit"],
    ["space","Space Explorer STEM Missions","Pathways","Eight paper-based moon base, rover, code and science adventures.","kit"],
    ["family","Family Logic Game Night","Games","Ten logic puzzles, hints and a full answer key for family play.","kit"],
    ["bundle","Ultimate Kids Creator Gift Bundle","Bundles","The four original games, birthday, space and family puzzle workbooks.","bundle"],
    ["birthday-story","My Birthday Hero Storybook","Birthday","An eight-chapter birthday adventure where the birthday child invents the hero, friends, secret powers and ending.","kit"],
    ["classroom-party","Classroom Creative Challenge Pack","Birthday","An original classroom party and enrichment toolkit: eight low-prep, inclusive cooperative stations for group play.","kit"],
    ["achievement-awards","Little Victories Award Studio","Birthday","Eight customizable achievement award pages for celebrating the process of learning, helping and trying.","kit"],
    ["confidence-kids","Confidence Quest for Kids","Self help","An encouraging eight-day workbook about courage, asking for help, practicing skills and noticing strengths.","kit"],
    ["confidence-teens","Confidence & Direction Journal","Self help","Eight private reflection pages for exploring strengths, boundaries, setbacks and realistic goals without pressure to be perfect.","kit"],
    ["motivation-kids","You Can Begin! Motivation Cards","Motivation","Eight original encouragement challenges for early creators, readers, helpers and learners.","kit"],
    ["dream-90","90-Day Dream Builder","Motivation","A practical personal pathway planner with three 30-day phases, weekly experiments and evidence-based reviews.","kit"],
    ["coding-pathway","Future Coder Pathway Planner","Pathways","An eight-milestone printable roadmap from playful logic to an original coding project, with project cards and progress evidence.","kit"],
    ["basketball-pathway","Basketball Growth Pathway","Pathways","An eight-station reflection and practice-planning journal for young basketball players and families.","kit"],
    ["stem-pathway","STEM Discovery Pathway","Pathways","An eight-step printable inventor's roadmap covering questions, predictions, prototypes, data and evidence.","kit"],
    ["arts-pathway","Creative Arts & Storytelling Pathway","Pathways","An eight-stage printable arts journey through characters, composition, storytelling, revision and sharing.","kit"],
    ["sikh-seva","Seva & Chardi Kala Family Journey","Faith","Original family reflection activities inspired by Sikh values of remembrance, honest work, sharing, equality, service and resilient hope.","kit"],
    ["christian-courage","Kindness & Courage Faith Journey","Faith","Eight family reflection pages on compassion, prayer, honesty, courage, gratitude and service through a Christian lens.","kit"],
    ["interfaith-kindness","Many Traditions, Shared Kindness","Faith","An inclusive original eight-page dialogue kit for families curious about different religious and secular traditions.","kit"],
    ["family-heritage","Our Family Story Keepsake","Faith","Eight guided pages for creating a private family keepsake of stories, foods, lessons, sayings and hopes.","kit"],
    ["mindful-moments","Quiet Moments Reflection Deck","Self help","Eight calm, nonclinical moments for self-reflection, attention, rest and thoughtful action.","kit"],
    ["adult-purpose","Purpose & Progress Reflection Journal","Self help","An eight-chapter printable journal for clarifying values, choosing priorities and making sustainable progress.","kit"],
    ["party-bundle","Celebrations & Certificates Bundle","Birthday","Birthday activities, storybook adventures, group classroom stations and celebration awards.","bundle"],
    ["growth-bundle","Confidence & Motivation Collection","Motivation","Six age-specific reflection and encouragement editions for kids, teens and adults.","bundle"],
    ["faith-bundle","Faith, Heritage & Kindness Collection","Faith","Sikh-inspired, Christian-inspired, interfaith and family heritage editions. Respectfully distinct traditions.","bundle"],
    ["pathways-bundle","Future Builder Pathways Collection","Pathways","Four printable learning roadmaps across coding, basketball, STEM and creative arts.","bundle"],
    ["all-vault","APERTURE Complete Giftable Library","Bundles","All 54 original APERTURE printable workbooks and 434 activities across basketball, sports, coaching, family, faith, motivation, coding, STEM and creative celebrations.","bundle"],
    ["basketball-iq","Basketball IQ Challenge Deck","Sports","Eight original basketball decision challenges: read space, move the ball, create advantages and explain the play.","kit"],
    ["basketball-playbook","Build Your Own Basketball Playbook","Sports","An eight-page original play-design workbook with court diagrams, movement decisions and a simple way to test ideas.","kit"],
    ["athlete-mindset-kids","Young Athlete Confidence Cards","Sports","Eight original encouragement and reflection cards for young athletes, grounded in teamwork, practice, curiosity and support.","kit"],
    ["athlete-mindset-teens","Athlete Mindset & Resilience Journal","Sports","Eight thoughtful pages for teen athletes on effort, identity, constructive feedback, setbacks and self-directed goals.","kit"],
    ["coach-practice","Coach's Practice Architect","Sports","Eight coach-facing planning worksheets for safe, inclusive and purposeful youth sports sessions.","kit"],
    ["captain-leadership","Team Captain Leadership Quest","Sports","Eight original leadership activities on communication, accountability, inclusion and responsible teamwork.","kit"],
    ["basketball-party","Basketball Birthday Challenge Party","Sports","Eight basketball-themed party stations mixing paper challenges, teamwork, mini-games and celebration certificates.","kit"],
    ["family-sports-night","Family Sports Trivia & Game Night","Sports","Eight sport-themed puzzles and creative conversation games for families, even without equipment or sport expertise.","kit"],
    ["soccer-creator","Soccer Creator Challenge Book","Sports","Eight original soccer-inspired paper exercises exploring space, passing, teamwork and match decisions.","kit"],
    ["multi-sport","Multi-Sport Explorer Quest","Sports","Eight creative paper challenges that compare teamwork, strategy and skill development across different sports.","kit"],
    ["sports-film","Youth Sports Film-Room Notebook","Sports","Eight templates for observing real or fictional sports possessions without exaggerated claims or private athlete profiling.","kit"],
    ["season-keepsake","My Sports Season Keepsake Journal","Sports","Eight printable pages for celebrating the people, moments, learning and joy of a youth sports season.","kit"],
    ["coach-appreciation","Coach & Teammate Appreciation Awards","Sports","Eight heartfelt original printable appreciation pages for coaches, teammates, volunteers and supportive families.","kit"],
    ["basketball-ultimate","Basketball Creator & Confidence Collection","Sports","Seven basketball-themed workbooks covering play design, confidence, film analysis, birthdays and season keepsakes.","bundle"],
    ["young-athlete-bundle","Young Athlete Growth Collection","Sports","Five youth sports giftable editions covering reflection, teamwork, multi-sport exploration and memories.","bundle"],
    ["coach-team-bundle","Coach & Team Leadership Collection","Sports","Five original coach, captain, playbook, film-room and appreciation workbooks for thoughtful team leadership.","bundle"],
    ["all-sports-bundle","APERTURE Complete Sports Gift Library","Sports","All 33 original APERTURE sports printable workbooks with 264 activities. A one-time digital license.","bundle"],
    ["point-guard-lab","Point Guard Decision Lab","Sports","Eight printable fictional point guard situations exploring pace, passes, communication and responsible decision-making.","kit"],
    ["defense-chalkboard","Basketball Defense Chalkboard","Sports","Eight paper-first defensive reasoning challenges on help, recovery, spacing and communicating as a team.","kit"],
    ["practice-progress","My Basketball Practice Progress Journal","Sports","Eight guided reflection pages for celebrating practice, questions, learning and steady progress without pressure to compare.","kit"],
    ["basketball-numbers","Basketball Numbers & Analytics Lab","Sports","Eight original fictional basketball math challenges: fractions, trends, sample size, uncertainty and interpreting statistics thoughtfully.","kit"],
    ["coach-session-cards","Basketball Coach's Practice Card Deck","Sports","Eight ready-to-customize session planning cards for youth basketball facilitators focused on decisions, inclusion and safety.","kit"],
    ["offense-design","Basketball Offense Design Studio","Sports","Eight creative, pencil-and-paper challenges that explore offensive spacing, handoffs, screening decisions and adaptive play design.","kit"],
    ["basketball-family","Basketball Family Conversation Cards","Sports","Eight original conversation cards helping families celebrate enjoyment, effort, rest and supportive communication around basketball.","kit"],
    ["basketball-dreambook","My Basketball Dreambook & Hero Story","Sports","Eight illustrated storytelling pages where a child invents an original basketball hero, a kind team and a joyful imaginary season.","kit"],
    ["basketball-starter-collection","Basketball Starter Skills & Confidence Collection","Sports","Five basketball decision, defense, practice and supportive-family workbooks.","bundle"],
    ["basketball-coach-studio","Basketball Coach's Complete Studio Collection","Sports","Six original basketball coach tools, including practice design, plays, film room and fictional analytics.","bundle"],
    ["defensive-iq","Defensive IQ: See the Floor","Sports","Eight illustrated defensive decision prompts about help, recovery, matchups and communication.","kit"],
    ["three-on-three","3-on-3 Basketball Creator Lab","Sports","Build an original half-court 3-on-3 playbook on paper with decisions and role swaps.","kit"],
    ["rookie-hoop","Rookie Hooper: First Season Quest","Sports","A friendly eight-stage introduction to the language, teamwork and joy of basketball.","kit"],
    ["basketball-scorekeeper","Basketball Scorekeeper & Stats Notebook","Sports","Printable sample score sheets and data-literacy activities for tracking fictional basketball games.","kit"],
    ["basketball-recovery-habits","Healthy Basketball Routine Planner","Sports","A general non-medical printable planning workbook on rest, safe questions and sustainable youth sport routines.","kit"],
    ["hoop-gift-cards","Basketball Encouragement Gift Cards","Sports","Eight original printable positive-message cards to gift teammates, coaches and young athletes.","kit"],
    ["coach-season","Youth Basketball Season Planning Studio","Sports","Eight team-season planning templates for volunteer and youth program coaches.","kit"],
    ["basketball-camp","Basketball Camp Activity Blueprint","Sports","Eight original printable planning worksheets for a safe youth basketball camp or event.","kit"],
    ["girl-hoopers","Girls Basketball Leadership & Belonging","Sports","An inclusive original eight-page journal celebrating girls who lead, create and compete in basketball.","kit"],
    ["pickup-hoops","Pickup Basketball Game Night Planner","Sports","Eight printable templates to host fair, friendly and clearly agreed informal basketball games.","kit"],
    ["scout-observation","Basketball Scout Observation Practice","Sports","Eight evidence-first templates for writing responsible, fictional basketball scouting observations.","kit"],
    ["team-culture","Basketball Team Culture Workshop","Sports","Eight printable facilitated culture-building activities for basketball teams and youth programs.","kit"],
    ["basketball-gifts-collection","Basketball Gifts for Growing Players","Sports","Five new basketball-specific journals, gift cards and leadership books.","bundle"],
    ["basketball-coach-ops","Basketball Coach Operations Pack","Sports","Five printable planning workbooks for coaching, camps, safety, stats and observations.","bundle"],
    ["basketball-tactics-library","Basketball Tactics & Decisions Library","Sports","Five original decision-led workbooks covering defense, 3-on-3, stats, pickup and scouting.","bundle"]
  ];
  const courtTopics = /basketball|hoop|coach-practice|coach-season|point-guard|defensive-iq|defense-chalkboard|three-on-three|offense-design|practice-progress|scout-observation/;
  for (const [sku, title, group, description, kind] of giftEditions) {
    const isCourt = courtTopics.test(sku);
    const category = group === "Sports" ? "Sports printables" : "Gift printables";
    const link = offer("View "+title, "gifts/catalog.html#"+sku, "Open this "+(kind === "bundle" ? "bundle" : "edition")+" in the catalog to review its contents and use terms.");
    const offers = [link];
    if (isCourt) offers.push(courtSample);
    if (["game","coding-pathway","arts-pathway","stem-pathway"].includes(sku)) offers.push(paths);
    offers.push(fullCatalog);
    kits.push(kit("gift-"+sku, title, category, description, isCourt ? "sports" : "gift", "Printable digital license", offers));
  }
  window.PreferenceKits = kits;
})();
