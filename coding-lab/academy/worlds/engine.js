/* The editor and exported games use the same player and rules. */
(function defineWorldEngine() {
  "use strict";

  function makeEngine() {
    const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
    const hasText = value => typeof value === "string" && value.trim().length > 0;
    const between = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
    const boundedValue = value => Math.max(0, Math.min(99, value));
    const nextValue = (current, choice) => boundedValue(current + choice.delta);

    function validate(world) {
      if (!isRecord(world)) return ["Choose a world or open a World Builder project file."];
      const errors = [];
      if (!hasText(world.title)) errors.push("Give your world a title.");
      if (world.description != null && typeof world.description !== "string") errors.push("Write the world description as text.");
      if (!hasText(world.variable)) errors.push("Name the resource your world remembers.");
      if (!between(world.initial, 0, 99)) errors.push("Set the starting resource to a whole number from 0 to 99.");
      if (!Array.isArray(world.scenes) || !between(world.scenes.length, 1, 24)) {
        return [...errors, "Give your world between 1 and 24 scenes."];
      }
      const ids = new Set();
      for (const scene of world.scenes) {
        if (!isRecord(scene) || !hasText(scene.id)) {
          errors.push("Each scene needs its own ID.");
          continue;
        }
        if (ids.has(scene.id)) errors.push("Two scenes have the same ID. Give each scene a unique ID.");
        ids.add(scene.id);
      }
      if (!ids.has(world.start)) errors.push("Choose an existing scene as the starting scene.");
      for (const [index, scene] of world.scenes.entries()) {
        if (!isRecord(scene)) continue;
        const label = hasText(scene.name) ? "“" + scene.name + "”" : "Scene " + (index + 1);
        if (!hasText(scene.name)) errors.push(label + " needs a name.");
        if (typeof scene.text !== "string") errors.push(label + " needs a text field for its story.");
        if (typeof scene.ending !== "boolean") errors.push("Choose whether " + label + " is an ending.");
        if (!Array.isArray(scene.choices) || !between(scene.choices.length, 0, 4)) {
          errors.push("Use up to four choices in " + label + ".");
          continue;
        }
        if (!scene.ending && !scene.choices.length) errors.push("Add a choice to " + label + " or mark it as an ending.");
        scene.choices.forEach((choice, choiceIndex) => {
          const at = "Choice " + (choiceIndex + 1) + " in " + label;
          if (!isRecord(choice)) { errors.push(at + " is missing."); return; }
          if (!hasText(choice.label)) errors.push(at + " needs button text.");
          if (!ids.has(choice.to)) errors.push(at + " needs a destination scene.");
          if (!between(choice.delta, -9, 9)) errors.push(at + " needs a resource change from −9 to +9.");
          if (!between(choice.need, 0, 99)) errors.push(at + " needs a requirement from 0 to 99.");
        });
      }
      return errors;
    }

    function audit(world) {
      if (validate(world).length) return [];
      const byId = new Map(world.scenes.map(scene => [scene.id, scene]));
      const seen = new Map(world.scenes.map(scene => [scene.id, new Set()]));
      const queue = [];
      function visit(id, resource) {
        const values = seen.get(id);
        if (values.has(resource)) return;
        values.add(resource);
        queue.push([byId.get(id), resource]);
      }
      visit(world.start, world.initial);
      let reachedEnding = false;
      let stranded;
      for (let i = 0; i < queue.length; i++) {
        const [scene, resource] = queue[i];
        if (scene.ending) { reachedEnding = true; continue; }
        const choices = scene.choices.filter(choice => choice.need <= resource);
        if (choices.length === 0 && !stranded) stranded = {scene, resource};
        for (const choice of choices) visit(choice.to, nextValue(resource, choice));
      }
      const hints = [];
      if (!world.scenes.some(scene => scene.ending)) {
        hints.push("Your world has no ending. If you want a final moment, mark a scene as an ending.");
      } else if (!reachedEnding) {
        hints.push("Players cannot reach an ending from the start. Trace one route and check its resource requirements.");
      }
      if (stranded) {
        hints.push("A player can arrive at “" + stranded.scene.name + "” with " + stranded.resource + " " + world.variable + " and have no available choice. Would a way back help?");
      }
      const unreachable = world.scenes.filter(scene => !seen.get(scene.id).size);
      if (unreachable.length) {
        const names = unreachable.slice(0, 3).map(scene => "“" + scene.name + "”").join(", ");
        hints.push("The start cannot lead to " + names + (unreachable.length > 3 ? " and " + (unreachable.length - 3) + " more" : "") + ". Check the links and requirements if players should visit.");
      }
      return hints;
    }

    function mount(container, world) {
      const doc = container.ownerDocument;
      function node(tag, className, text) {
        const el = doc.createElement(tag);
        if (className) el.className = className;
        if (text != null) el.textContent = text;
        return el;
      }
      const problems = validate(world);
      if (problems.length) {
        const issues = node("ul", "we-errors");
        for (const problem of problems) issues.append(node("li", "", problem));
        container.replaceChildren(node("h3", "we-heading", "Finish setting up your world"), issues);
        return;
      }
      // Keep the current run coherent even when the editor changes its draft.
      const model = JSON.parse(JSON.stringify(world));
      const byId = new Map(model.scenes.map(scene => [scene.id, scene]));
      let sceneId = model.start;
      let value = model.initial;
      let turns = 0;

      function restart() {
        sceneId = model.start;
        value = model.initial;
        turns = 0;
        draw(true);
      }
      function draw(moveFocus) {
        const scene = byId.get(sceneId);
        const panel = node("div", "we-player");
        const title = node("h3", "we-heading", scene.name);
        title.tabIndex = -1;
        panel.append(title, node("p", "we-value", model.variable + ": " + value));
        if (scene.text) panel.append(node("p", "we-narrative", scene.text));
        if (scene.ending) {
          panel.append(node("p", "we-ending", "The end · " + turns + (turns === 1 ? " choice" : " choices")));
        } else {
          const buttons = node("div", "we-choices");
          let allowed = 0;
          for (const choice of scene.choices) {
            const button = node("button", "we-choice");
            button.type = "button";
            button.append(node("span", "we-label", choice.label));
            const rules = [];
            if (choice.need) rules.push("Needs " + choice.need + " " + model.variable);
            if (choice.delta) rules.push((choice.delta > 0 ? "+" : "−") + Math.abs(choice.delta) + " " + model.variable);
            if (rules.length) button.append(node("small", "we-rule", rules.join(" · ")));
            button.disabled = value < choice.need;
            if (!button.disabled) allowed++;
            button.addEventListener("click", () => {
              if (!container.contains(button) || value < choice.need) return;
              value = nextValue(value, choice);
              sceneId = choice.to;
              turns++;
              draw(true);
            });
            buttons.append(button);
          }
          panel.append(buttons);
          if (!allowed) panel.append(node("p", "we-stuck", "All choices are locked with your current " + model.variable + ". Restart to try a new route."));
        }
        const reset = node("button", "we-reset", scene.ending ? "Play again" : "Restart world");
        reset.type = "button";
        reset.addEventListener("click", restart);
        panel.append(reset);
        container.replaceChildren(panel);
        if (moveFocus) title.focus();
      }
      draw(false);
    }
    return {validate, audit, mount};
  }

  const engine = makeEngine();
  function exportHTML(world) {
    const errors = engine.validate(world);
    if (errors.length) throw new Error(errors.join(" "));
    // Raw text in script elements must never contain a literal '<'.
    const payload = JSON.stringify(world).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    const htmlText = value => value.replace(/[&<>"]/g, ch => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"})[ch]);
    const description = world.description ? "<p>" + htmlText(world.description) + "</p>" : "";
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' +
      htmlText(world.title) +
      '</title><style>*{box-sizing:border-box}body{margin:0;background:#142338;color:#f5f5eb;font:1.05rem/1.55 system-ui,sans-serif}main{width:min(92%,44rem);margin:clamp(2rem,8vh,6rem) auto}h1{font-size:clamp(2.4rem,6vw,4.5rem);line-height:1.05;letter-spacing:-.04em}h3{font-size:1.65rem;margin:.2rem 0}.we-player{background:#faf8f0;color:#18302e;padding:clamp(1rem,4vw,2rem);border-radius:1rem}.we-value{font-weight:700;color:#35594b}.we-narrative{white-space:pre-wrap}.we-choices{display:grid;gap:.55rem}button{font:inherit;cursor:pointer;border-radius:.55rem;padding:.75rem 1rem}.we-choice{display:grid;text-align:left;background:#cbf2de;color:#162f24;border:2px solid #4a745c}.we-choice:disabled{cursor:default;background:#ebe8df;color:#534f4b;border-style:dashed}.we-rule{display:block}.we-reset{background:transparent;color:inherit;border:1px solid currentColor;margin-top:1rem}:focus-visible{outline:3px solid #ac4627;outline-offset:3px}.we-ending{font-weight:700}h1,h3,p,button{overflow-wrap:anywhere}</style></head><body><main><h1>' +
      htmlText(world.title) + '</h1>' + description + '<section aria-label="Play the world" id="world"></section></main>' +
      '<script id="project" type="application/json">' + payload + '</' + 'script>' +
      '<script>("use strict");const player=(' + makeEngine.toString() + ')();player.mount(document.getElementById("world"),JSON.parse(document.getElementById("project").textContent));</' + 'script></body></html>';
  }
  window.WorldEngine = Object.freeze({...engine, exportHTML});
})();
