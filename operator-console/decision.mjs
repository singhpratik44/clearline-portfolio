// Call with a normalized Mission Control snapshot. A what-if is an in-memory copy.
export function rank(snapshot, today) {
  const open = snapshot.tasks.filter(task => task.status !== 'done');
  const openIds = new Set(open.map(task => task.id));
  const projectNames = new Map(snapshot.projects.map(project => [project.id, project.name]));
  const followers = new Map(open.map(task => [task.id, []]));
  const blockers = new Map();
  for (const task of open) {
    const pending = task.blockedBy.filter(id => openIds.has(id));
    blockers.set(task.id, pending);
    for (const id of pending) followers.get(id).push(task);
  }
  const ready = [];
  for (const task of open) {
    if (blockers.get(task.id).length) continue;
    const downstream = new Set();
    const visit = id => {
      for (const follower of followers.get(id)) {
        if (downstream.has(follower.id)) continue;
        downstream.add(follower.id);
        visit(follower.id);
      }
    };
    visit(task.id);
    const unlocks = followers.get(task.id).filter(child => blockers.get(child.id).length === 1);
    const deadline = [task, ...unlocks].map(item => item.due).filter(Boolean).sort()[0] || null;
    const days = deadline ? (Date.parse(deadline) - Date.parse(today)) / 86400000 : Infinity;
    const urgency = days <= 0 ? 0 : days <= 3 ? 1 : 2;
    ready.push({ id: task.id, title: task.title, project: projectNames.get(task.projectId),
      source: task.source, owner: task.owner, due: task.due, deadline, urgency,
      unlocks: unlocks.map(child => child.title), reach: downstream.size });
  }
  ready.sort((a, b) => a.urgency - b.urgency || b.unlocks.length - a.unlocks.length ||
    (a.deadline || '9999').localeCompare(b.deadline || '9999') ||
    b.reach - a.reach || a.id.localeCompare(b.id));
  return { ready, blocked: open.length - ready.length, done: snapshot.tasks.length - open.length };
}

export function whyFirst(first, second) {
  if (!second) return 'This is the only task with every prerequisite complete.';
  if (first.urgency !== second.urgency) return 'It has a more urgent deadline, either for its own work or for work it immediately unlocks.';
  if (first.unlocks.length !== second.unlocks.length) return 'Within the same deadline window, it makes more tasks ready to start.';
  if (first.deadline !== second.deadline) return 'It has the earlier deadline for itself or for work it immediately unlocks.';
  if (first.reach !== second.reach) return 'More unfinished tasks depend on it further down the chain.';
  return 'The two tasks tie on deadlines and dependencies. Their task IDs determine the display order.';
}

export function previewCompletion(snapshot, id, today) {
  if (!rank(snapshot, today).ready.some(task => task.id === id)) throw Error('Only a ready task can be previewed.');
  return { ...snapshot, tasks: snapshot.tasks.map(task => task.id === id ? { ...task, status: 'done' } : task) };
}

export function briefing(ranking, today, sample, simulated) {
  return { date: today, sample, simulated, blocked: ranking.blocked, ready: ranking.ready.length,
    choices: ranking.ready.slice(0, 3).map(({ title, due, deadline, unlocks, reach }) =>
      ({ title, due, effectiveDeadline: deadline, opens: unlocks.slice(0, 4), opensCount: unlocks.length, downstream: reach })) };
}
