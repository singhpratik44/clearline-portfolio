# Quantum Information Holography research track

## Evidence boundary
Jason Padgett's Quantum Information Holography (QIH) is a speculative physics proposal. It is not an established derivation of quantum mechanics, relativity, consciousness, or an organizational operating model. No claim of physical quantum acceleration is made by Clearline.

Sources:
- https://doi.org/10.5281/zenodo.8396788 (2023)
- https://zenodo.org/records/19546750 (2026 horizon operator proposal)
- https://zenodo.org/records/20184170 (2026 spin interference proposal)

## Engineering translations to test
1. Holographic *view* metaphor: project one versioned canonical organizational state into finance, operations, evidence, and risk views. Test consistency against independent duplicated state.
2. Recursive evolution: apply bounded proposals to isolated scenario copies, never to authoritative state. Verify deterministic replay, budget limits, and no permission escalation.
3. Information geometry: test whether graph embeddings or uncertainty-weighted distances improve scenario selection against simpler graph heuristics.
4. Quantum adapter: retain provider-agnostic interface; require execution provenance before describing any output as hardware-backed.
5. Scientific evaluation: compare against classical baselines on accuracy, latency, cost, reproducibility, and decision quality. Reject changes that cannot beat or complement the baseline.

## Non-goals
Do not infer that a holographic universe is proven, that all quantum-inspired calculations are quantum-powered, or that visual similarities demonstrate physical laws. Do not place speculative QIH claims in production as facts.

## Immediate integration
Connect world-graph -> proposal eligibility -> bounded future explorer -> solver router in a pure orchestration layer. Introduce scenario snapshots and event replay before adding interactive visualization.

## Working boundary-representation experiment (experimental)

The Clearline research implementation lives in `src/information-holography.mjs`, with repeatable tests in `tests/information-holography.mjs` and a demonstrator in `lab/index.html`.

- `T = encodeBoundary`: encode a versioned dependency graph into indexed nodes and incoming edge groups, preserving node details, edge attributes, and snapshot metadata.
- `D = decodeBoundary`: reconstruct a graph, rejecting corrupted references, malformed encodings, and dependency cycles.
- `O = completeCanonical`: apply a dependency-gated completion to a separate canonical snapshot.
- `O_H = completeBoundary`: apply that operation directly on the encoded representation.
- Equivalence experiment: for **tested fixtures**, compare `D(O_H(T(S)))` with `O(S)`, then independently compare operating projections and decision rankings for the original and reconstructed states.

`verifyBoundaryEquivalence` checks both paths. It does not claim a general mathematical proof, quantum execution, physical holography, reduced computational complexity, or correctness outside tested operations and inputs. A successful round trip alone cannot establish compression, acceleration, or any new physical law.

### Experimental next gate
Measure serialized size, runtime, and correctness on varied graph shapes; add counterexamples and fuzz tests. Compare conventional adjacency graphs, this indexed encoding, and future graph-embedding methods against a shared baseline. Only carry an encoding into an authoritative workflow if it proves useful under these checks. Keep all scenario state read-only and require conventional authorization for real decisions.
