(() => {
  "use strict";
  const root = document.getElementById("mastery-report");
  if (!root) return;

  const skills = {
    design: {name:"Design for a player", unit:1, criteria:[
      "Point to a place where a player should notice something.",
      "With a prompt, change one detail to guide a player's first move.",
      "Choose a detail for a particular audience. Watch a new player and explain whether it worked.",
      "Adapt that detail for a different audience and compare the two players' first moves."
    ]},
    sequence: {name:"Sequence and events", unit:3, criteria:[
      "Point to the event that starts a character's action.",
      "With a prompt, put two actions in order and run the sequence.",
      "Build an event-driven sequence and correctly predict what happens when its order changes.",
      "Rebuild the sequence in a new tool and show where each event and action went."
    ]},
    rules: {name:"Decisions and rules", unit:4, criteria:[
      "Find a choice that changes a game's or story's outcome.",
      "With a prompt, make a rule that sends the player down two different paths.",
      "Write a branching rule and demonstrate both outcomes with two test inputs.",
      "Use the rule in a new project and demonstrate what happens at the boundary."
    ]},
    state: {name:"Variables and state", unit:5, criteria:[
      "Point to a value the project remembers after a move.",
      "With a prompt, update a variable and say when it changes.",
      "Trace a variable across two actions, predict its final value, and check your prediction.",
      "Carry the same idea into a different game or simulation and test its reset behavior."
    ]},
    data: {name:"Models and data", unit:6, criteria:[
      "Match a symbol or number in the data to something in the world.",
      "With a prompt, change one data item and locate the difference in the output.",
      "Use two inputs to test a prediction and explain the difference between the outputs.",
      "Try the model on a new situation, name an assumption, and test where that assumption breaks."
    ]},
    debug: {name:"Test and debug", unit:7, criteria:[
      "Show one place where the result differs from your prediction.",
      "With a prompt, repeat the problem and change one thing.",
      "Record a case that fails, fix the cause, then rerun both the failing case and a working case.",
      "Apply your test method to a different project and explain what the test still misses."
    ]},
    remix: {name:"Remix and credit", unit:8, criteria:[
      "Point to something a starter or another creator contributed.",
      "With a prompt, credit the source and change one part on purpose.",
      "Show the original and your version, credit the source, and explain how your change affects a player.",
      "Carry the idea into a different medium while preserving the credit and showing your new contribution."
    ]},
    communicate: {name:"Explain and revise", unit:10, criteria:[
      "Show a moment in your project that you want another person to try.",
      "With a prompt, ask a tester what they noticed and record one observation.",
      "Link a real playtest observation to a revision or a decision to keep your design.",
      "Apply that feedback in another project and compare what a second tester notices."
    ]}
  };
  const levels = ["Recognize", "Build with a prompt", "Build independently", "Transfer to a new project"];
  const sources = {self:"Student reflection", peer:"Peer observation", mentor:"Mentor observation"};
  const key = "aperture-skill-evidence-v1";
  const fileType = "aperture-mastery-report";
  const params = new URLSearchParams(location.search);
  // Personal project details travel in the fragment on Academy links.
  for (const [name, value] of new URLSearchParams((location.hash || "").slice(1))) params.set(name, value);
  const maxEntries = 250;

  root.innerHTML = `
    <div class="mr-work">
      <section class="mr-form-panel" aria-labelledby="mr-entry-heading">
        <h2 id="mr-entry-heading">Record a demonstration</h2>
        <p>Choose something you made. A game, a drawing, a paper prototype, or a spoken walkthrough can all show a skill.</p>
        <form id="mr-form">
          <label for="mr-project">Project title</label><input id="mr-project" maxlength="100" required placeholder="e.g. The bell-kite race">
          <div id="mr-context" hidden></div>
          <div class="mr-pair"><div><label for="mr-skill">Skill</label><select id="mr-skill"></select></div>
            <div><label for="mr-level">Demonstration level</label><select id="mr-level"></select></div></div>
          <section class="mr-rubric" aria-label="Skill rubric"><strong>What this level looks like</strong><p id="mr-criterion" aria-live="polite"></p>
            <details id="mr-scale"><summary>Compare the four levels</summary><ol id="mr-criteria"></ol></details>
            <a id="mr-lesson" href="../index.html">Practice in the Academy</a></section>
          <label for="mr-observer">Who observed this?</label><select id="mr-observer"></select>
          <label for="mr-evidence">What did you see or make?</label>
          <p id="mr-evidence-help" class="mr-help">Describe a scene, line of code, drawing, or test and what happened. You can dictate to a partner.</p>
          <textarea id="mr-evidence" rows="3" maxlength="1200" aria-describedby="mr-evidence-help" required></textarea>
          <label for="mr-next">What will you try next? <small>(optional)</small></label>
          <input id="mr-next" maxlength="240" placeholder="e.g. Test the rule with exactly three wind">
          <button type="submit" class="mr-primary">Add to my report</button>
        </form>
      </section>
      <aside class="mr-tools" aria-labelledby="mr-keep-heading">
        <h2 id="mr-keep-heading">Keep your work</h2>
        <p>Choose whether the report stays in this tab or on this device. A project title is enough. Leave out names and contact details.</p>
        <label class="mr-toggle"><input type="checkbox" id="mr-remember"> Remember this report on this device</label>
        <p class="mr-help">Anyone using this browser profile could reopen a remembered report. Turn this off to remove the saved copy and keep working in this tab.</p>
        <div class="mr-file-actions"><button type="button" id="mr-export">Download editable report</button>
          <button type="button" id="mr-import-button">Import an editable report</button><input id="mr-import" type="file" accept=".json,application/json" hidden></div>
        <p class="mr-help">Import adds entries from an APERTURE report file. Downloads let you move between devices.</p>
      </aside>
    </div>
    <p id="mr-status" class="mr-status" role="status" aria-live="polite"></p>
    <section id="mr-output" aria-labelledby="mr-report-heading">
      <div class="mr-report-head"><h2 id="mr-report-heading">My skills mastery report</h2><button type="button" id="mr-print">Print / save PDF</button></div>
      <p id="mr-counts"></p><div id="mr-summary"></div><div id="mr-journal"></div>
    </section>`;
  const el = id => document.getElementById("mr-" + id);
  const node = (tag, value) => {
    const result = document.createElement(tag);
    if (value !== undefined) result.textContent = value;
    return result;
  };
  function option(select, value, label) {
    const item = node("option", label);
    item.value = value;
    select.append(item);
  }
  Object.entries(skills).forEach(([id, skill]) => option(el("skill"), id, skill.name));
  levels.forEach((label, index) => option(el("level"), index + 1, label));
  Object.entries(sources).forEach(([id, label]) => option(el("observer"), id, label));
  if (Object.hasOwn(skills, params.get("skill"))) el("skill").value = params.get("skill");
  el("project").value = (params.get("project") || "").trim().slice(0, 100);
  const pathway = (params.get("pathway") || "").trim().slice(0, 100);
  const stage = (params.get("stage") || "").trim().slice(0, 100);
  const context = [pathway, stage].filter(Boolean).join(" · ");
  if (context) {
    el("context").hidden = false;
    el("context").textContent = context;
  }
  const storage = el("remember");
  let entries = [];
  let undo = null;
  let storeInvalid = false;
  const say = text => { el("status").textContent = text; };
  const textFits = (value, length, required = false) => typeof value === "string" && value.length <= length && (!required || Boolean(value.trim()));
  function decode(raw) {
    const data = JSON.parse(raw);
    if (!data || data.format !== fileType || data.version !== 1 || !Array.isArray(data.entries) || data.entries.length > maxEntries) throw Error();
    const ids = new Set();
    const result = [];
    for (const row of data.entries) {
      if (!row || typeof row.id !== "string" || !/^[\w-]{1,100}$/.test(row.id) || ids.has(row.id)
          || typeof row.skill !== "string" || typeof row.observer !== "string" || !Object.hasOwn(skills, row.skill) || !Object.hasOwn(sources, row.observer)
          || !Number.isInteger(row.level) || row.level < 1 || row.level > 4
          || !textFits(row.project, 100, true) || !textFits(row.evidence, 1200, true) || !textFits(row.next, 240)
          || !textFits(row.pathway, 100) || !textFits(row.stage, 100)
          || typeof row.date !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(row.date)
          || !Number.isFinite(Date.parse(row.date))) throw Error();
      ids.add(row.id);
      result.push({id:row.id, skill:row.skill, observer:row.observer, level:row.level, project:row.project,
        evidence:row.evidence, next:row.next, pathway:row.pathway, stage:row.stage, date:row.date});
    }
    return result;
  }
  const encode = rows => JSON.stringify({format:fileType, version:1, entries:rows}, null, 2);
  const dateLabel = iso => new Date(iso).toLocaleDateString(undefined, {year:"numeric", month:"short", day:"numeric"});
  function rubric() {
    const skill = skills[el("skill").value];
    el("criterion").textContent = skill.criteria[Number(el("level").value) - 1];
    el("criteria").replaceChildren(...skill.criteria.map((criterion, index) => {
      const line = node("li");
      line.append(node("strong", levels[index] + ". "), document.createTextNode(criterion));
      return line;
    }));
    const link = el("lesson");
    link.textContent = "Practice in Academy Unit " + skill.unit;
    link.href = "../index.html?unit=" + skill.unit + "#unit-" + skill.unit;
  }
  el("skill").onchange = rubric;
  el("level").onchange = rubric;
  rubric();
  function latestRows() {
    if (!storage.checked) return entries;
    const raw = localStorage.getItem(key);
    return raw === null ? entries : decode(raw);
  }
  function commit(nextEntries, message) {
    if (nextEntries.length > maxEntries) {
      say("A report can hold up to 250 entries. Download a copy before starting a new report.");
      return false;
    }
    entries = nextEntries;
    if (storage.checked) {
      try { localStorage.setItem(key, encode(entries)); }
      catch {
        storage.checked = false;
        message += " This browser could not save the update on this device. Download a copy before closing the tab.";
      }
    }
    say(message);
    render();
    return true;
  }
  function updateRows() {
    try { return latestRows(); }
    catch {
      storage.checked = false;
      storeInvalid = true;
      say("This browser’s saved report could not be read. Your open report is still available to download.");
      return null;
    }
  }
  function merge(base, incoming) {
    const seen = new Set(base.map(row => row.id));
    return [...base, ...incoming.filter(row => !seen.has(row.id))];
  }
  function render() {
    const ordered = [...entries].reverse().sort((a,b) => b.date.localeCompare(a.date));
    const summary = el("summary"), journal = el("journal");
    summary.replaceChildren();
    journal.replaceChildren();
    el("export").disabled = el("print").disabled = !ordered.length;
    el("counts").textContent = ordered.length ? ordered.length + (ordered.length === 1 ? " observation across " : " observations across ") +
      new Set(ordered.map(row => row.skill)).size + " of 8 skills." : "Your report is empty. Add an observation from a real project to start it.";
    if (ordered.length) {
      summary.append(node("h3", "Latest evidence by skill"), node("p", "Each skill shows its most recent demonstration and who observed it. The full history follows."));
      const list = node("ul");
      list.className = "mr-skill-list";
      for (const [id, skill] of Object.entries(skills)) {
        const latest = ordered.find(row => row.skill === id);
        if (!latest) continue;
        const line = node("li");
        line.append(node("strong", skill.name), node("span", levels[latest.level - 1]), node("small", sources[latest.observer] + " · " + dateLabel(latest.date)));
        list.append(line);
      }
      summary.append(list);
      journal.append(node("h3", "Project evidence"));
      for (const row of ordered) {
        const item = node("article");
        item.className = "mr-record";
        item.append(node("h4", row.project), node("p", skills[row.skill].name + " · " + levels[row.level - 1]));
        const meta = node("p", [sources[row.observer], dateLabel(row.date), row.pathway, row.stage].filter(Boolean).join(" · "));
        meta.className = "mr-meta";
        item.append(meta, node("p", row.evidence));
        if (row.next) {
          const next = node("p");
          next.append(node("strong", "Next test. "), document.createTextNode(row.next));
          item.append(next);
        }
        const remove = node("button", "Remove entry");
        remove.type = "button";
        remove.className = "mr-remove";
        remove.setAttribute("aria-label", "Remove " + row.project + " entry for " + skills[row.skill].name);
        remove.onclick = () => {
          const current = updateRows();
          if (!current) return;
          undo = row;
          commit(current.filter(entry => entry.id !== row.id), "Entry removed. You can undo this removal.");
          el("undo")?.focus();
        };
        item.append(remove);
        journal.append(item);
      }
    }
    if (undo) {
      const button = node("button", "Undo last removal");
      button.id = "mr-undo";
      button.className = "mr-remove";
      button.type = "button";
      button.onclick = () => {
        const current = updateRows();
        if (!current) return;
        const restored = merge(current, [undo]);
        if (restored.length > maxEntries) { say("Remove one entry before restoring this one."); return; }
        undo = null;
        commit(restored, "Entry restored.");
        el("print").focus();
      };
      journal.prepend(button);
    }
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      entries = decode(raw);
      storage.checked = true;
    }
  } catch {
    storeInvalid = true;
    say("Local storage is unavailable or the saved report cannot be read. You can use this tab and download an editable copy.");
  }
  storage.onchange = () => {
    if (storage.checked) {
      if (storeInvalid) {
        storage.checked = false;
        say("Local saving is unavailable here. Use Download editable report to keep this session.");
        return;
      }
      try {
        const existing = localStorage.getItem(key);
        const combined = merge(existing ? decode(existing) : [], entries);
        if (combined.length > maxEntries) {
          storage.checked = false;
          say("These reports together exceed 250 entries. Download your current report to keep it.");
          return;
        }
        commit(combined, "This report will be remembered on this browser profile.");
      } catch {
        storage.checked = false;
        say("This browser could not open local storage. Download a copy to keep your report.");
      }
    } else {
      try {
        const existing = localStorage.getItem(key);
        if (existing) entries = merge(entries, decode(existing));
        localStorage.removeItem(key);
        render();
        say("Saved copy removed from this device. Your entries remain open in this tab.");
      } catch {
        storage.checked = true;
        say("The browser could not remove the remembered copy. Try again or clear this site’s browser data.");
      }
    }
  };
  window.addEventListener("storage", event => {
    if (!storage.checked || (event.key !== key && event.key !== null)) return;
    if (!event.newValue) {
      storage.checked = false;
      say("Device saving was switched off in another tab. Your entries remain here.");
      return;
    }
    try { entries = decode(event.newValue); undo = null; render(); }
    catch {
      storage.checked = false; storeInvalid = true;
      say("The saved report changed and could not be read. Download this tab’s copy to keep it.");
    }
  });
  el("form").onsubmit = event => {
    event.preventDefault();
    for (const name of ["project", "evidence"]) {
      const input = el(name);
      if (!input.value.trim()) { input.setCustomValidity("Add a project title or observation here."); input.reportValidity(); return; }
    }
    const current = updateRows();
    if (!current) return;
    const id = typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    const row = {id, date:new Date().toISOString(), skill:el("skill").value, level:Number(el("level").value),
      observer:el("observer").value, project:el("project").value.trim(), evidence:el("evidence").value.trim(), next:el("next").value.trim(), pathway, stage};
    if (commit([...current, row], "Added an observation for " + skills[row.skill].name + ".")) {
      el("evidence").value = "";
      el("next").value = "";
    }
  };
  for (const name of ["project", "evidence"]) el(name).oninput = () => el(name).setCustomValidity("");
  el("print").onclick = () => window.print();
  el("export").onclick = () => {
    const file = new Blob([encode(entries)], {type:"application/json"});
    const url = URL.createObjectURL(file);
    const link = node("a");
    link.href = url;
    link.download = "aperture-mastery-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  el("import-button").onclick = () => el("import").click();
  el("import").onchange = async () => {
    const file = el("import").files[0];
    if (!file) return;
    try {
      if (file.size > 4000000) throw Error();
      const incoming = decode(await file.text());
      const current = updateRows();
      if (!current) return;
      const combined = merge(current, incoming);
      const added = combined.length - current.length;
      commit(combined, added ? "Imported " + added + (added === 1 ? " new entry." : " new entries.") : "No new entries. The report already contains these observations.");
    } catch { say("Could not import that file. Choose a valid APERTURE editable mastery report."); }
    finally { el("import").value = ""; }
  };
  render();
})();
