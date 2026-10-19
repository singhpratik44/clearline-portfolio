import { analyzeWorld } from './world-graph.mjs';
import { simulateOrganization } from './organization-simulator.mjs';

// Padgett QIH research experiment: reversible software representation.
// This is not quantum physics, a holographic code, or proof of a physical claim.
// T: encode an organizational dependency world as indexed boundary information.
export function encodeBoundary(snapshot) {
  if (!snapshot || !Number.isInteger(snapshot.version) || snapshot.version < 0)
    throw new TypeError('versioned snapshot required');
  const nodes = structuredClone(snapshot.nodes ?? []);
  const edges = structuredClone(snapshot.edges ?? []);
  analyzeWorld(nodes, edges); // refuse cycles, unknown nodes, and duplicated edges
  nodes.sort((a, b) => a.id.localeCompare(b.id));
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const links = nodes.map(() => []);
  for (const edge of edges) {
    const { from, to, ...edgeData } = edge;
    links[index.get(to)].push({ fromIndex: index.get(from), edgeData });
  }
  for (const group of links) group.sort((a, b) => a.fromIndex - b.fromIndex);
  const metadata = Object.fromEntries(
    Object.entries(snapshot)
      .filter(([key]) => !['version', 'nodes', 'edges'].includes(key))
      .map(([key, value]) => [key, structuredClone(value)])
  );
  return { format: 'clearline.boundary.v1', version: snapshot.version, nodes, links, metadata };
}

// D: decode indexed boundary information, validating the reconstructed graph.
export function decodeBoundary(boundary) {
  if (!boundary || boundary.format !== 'clearline.boundary.v1' ||
      !Number.isInteger(boundary.version) || boundary.version < 0 ||
      !Array.isArray(boundary.nodes) || !Array.isArray(boundary.links) ||
      boundary.nodes.length !== boundary.links.length)
    throw new TypeError('invalid boundary representation');
  if (!boundary.metadata || typeof boundary.metadata !== 'object' ||
      Array.isArray(boundary.metadata) ||
      ['version', 'nodes', 'edges'].some(key => Object.hasOwn(boundary.metadata, key)))
    throw new TypeError('invalid boundary metadata');
  const nodes = structuredClone(boundary.nodes);
  const ids = nodes.map(n => n?.id);
  if (ids.some(id => typeof id !== 'string' || !id) ||
      new Set(ids).size !== ids.length ||
      ids.some((id, i) => i > 0 && ids[i - 1].localeCompare(id) >= 0))
    throw new Error('invalid canonical node order');
  const edges = [];
  boundary.links.forEach((group, toIndex) => {
    if (!Array.isArray(group)) throw new TypeError('invalid dependency group');
    let last = -1;
    for (const link of group) {
      const source = link?.fromIndex;
      if (!Number.isInteger(source) || source < 0 || source >= ids.length || source <= last ||
          !link.edgeData || typeof link.edgeData !== 'object' ||
          Array.isArray(link.edgeData) || Object.hasOwn(link.edgeData, 'from') ||
          Object.hasOwn(link.edgeData, 'to'))
        throw new Error('invalid encoded dependency');
      last = source;
      edges.push({ ...structuredClone(link.edgeData), from: ids[source], to: ids[toIndex] });
    }
  });
  analyzeWorld(nodes, edges);
  return { ...structuredClone(boundary.metadata), version: boundary.version, nodes, edges };
}

// O: projected, dependency-gated completion. Does not write authoritative state.
export function completeCanonical(snapshot, nodeId) {
  const copy = structuredClone(snapshot);
  const graph = analyzeWorld(copy.nodes ?? [], copy.edges ?? []);
  if (!graph.actionable.includes(nodeId)) throw new Error('target not actionable');
  copy.nodes.find(n => n.id === nodeId).completed = true;
  copy.version += 1;
  return copy;
}

// O_H: same operation directly in the boundary representation.
export function completeBoundary(boundary, nodeId) {
  const b = structuredClone(boundary);
  decodeBoundary(b); // refuse corrupted or cyclic boundary data
  const i = b.nodes.findIndex(n => n.id === nodeId);
  if (i < 0 || b.nodes[i].completed === true ||
      !b.links[i].every(link => b.nodes[link.fromIndex].completed === true))
    throw new Error('target not actionable');
  b.nodes[i].completed = true;
  b.version += 1;
  return b;
}

function canonicalObject(value) {
  if (Array.isArray(value)) return value.map(canonicalObject);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonicalObject(value[k])]));
  return value;
}
function equalMeaning(a, b) {
  return JSON.stringify(canonicalObject(encodeBoundary(a))) ===
         JSON.stringify(canonicalObject(encodeBoundary(b)));
}

// Empirical representation-equivalence check: D O_H T = O for tested operations.
export async function verifyBoundaryEquivalence(snapshot, proposals, { targetNode, beamWidth = 4 } = {}) {
  const boundary = encodeBoundary(snapshot);
  const decoded = decodeBoundary(boundary);
  if (!equalMeaning(snapshot, decoded)) throw new Error('boundary round trip lost information');
  const options = { mode: 'classical', beamWidth };
  const direct = await simulateOrganization(snapshot, proposals, options);
  const reconstructed = await simulateOrganization(decoded, proposals, options);
  if (JSON.stringify(canonicalObject(direct)) !== JSON.stringify(canonicalObject(reconstructed)))
    throw new Error('simulated projections disagree after representation change');
  let operatorEquivalent = null;
  if (targetNode !== undefined) {
    const nativeNext = completeCanonical(snapshot, targetNode);
    const encodedNext = decodeBoundary(completeBoundary(boundary, targetNode));
    operatorEquivalent = equalMeaning(nativeNext, encodedNext);
    if (!operatorEquivalent) throw new Error('boundary operator changed the result');
  }
  return {
    representation: 'indexed_dependency_boundary',
    computation: 'classical',
    roundTripEquivalent: true,
    simulationEquivalent: true,
    operatorEquivalent,
    relation: 'D O_H T = O (tested software representation)',
    nodes: boundary.nodes.length,
    dependencies: boundary.links.reduce((n, group) => n + group.length, 0)
  };
}
