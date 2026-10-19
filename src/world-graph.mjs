// Pure deterministic dependency graph: prerequisite -> dependent.
// All graph operations return new data; none change authoritative state.
export function analyzeWorld(nodes, edges) {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new TypeError('nodes and edges must be arrays');
  const ids = nodes.map(n => n?.id);
  if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) throw new Error('invalid or duplicate node id');
  const adjacency = new Map(ids.map(id => [id, []]));
  const prerequisites = new Map(ids.map(id => [id, []]));
  for (const edge of edges) {
    if (!adjacency.has(edge?.from) || !adjacency.has(edge?.to)) throw new Error('edge references unknown node');
    if (adjacency.get(edge.from).includes(edge.to)) throw new Error('duplicate edge');
    adjacency.get(edge.from).push(edge.to);
    prerequisites.get(edge.to).push(edge.from);
  }
  for (const children of adjacency.values()) children.sort();
  for (const parents of prerequisites.values()) parents.sort();
  const indegree = new Map(ids.map(id => [id, prerequisites.get(id).length]));
  const ready = ids.filter(id => indegree.get(id) === 0).sort();
  const order = [];
  while (ready.length) {
    const id = ready.shift();
    order.push(id);
    for (const child of adjacency.get(id)) {
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) { ready.push(child); ready.sort(); }
    }
  }
  if (order.length !== ids.length) throw new Error('dependency cycle detected');
  const completed = new Set(nodes.filter(n => n.completed === true).map(n => n.id));
  const actionable = order.filter(id => !completed.has(id) && prerequisites.get(id).every(p => completed.has(p)));
  const blastRadius = {};
  for (const id of order) {
    const seen = new Set(), stack = [...adjacency.get(id)];
    while (stack.length) {
      const next = stack.pop();
      if (seen.has(next)) continue;
      seen.add(next); stack.push(...adjacency.get(next));
    }
    blastRadius[id] = [...seen].sort();
  }
  const depth = {};
  for (const id of order) depth[id] = prerequisites.get(id).length ? 1 + Math.max(...prerequisites.get(id).map(p => depth[p])) : 0;
  return { order, actionable, blastRadius, depth, completed: [...completed].sort() };
}
