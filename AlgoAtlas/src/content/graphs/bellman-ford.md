---
title: Bellman-Ford Algorithm
category: graphs
difficulty: advanced
short: Finds shortest paths from a source while allowing negative edge weights and detecting negative cycles.
best: O(E)
average: O(V × E)
worst: O(V × E)
space: O(V)
stable: true
inPlace: true
visualizable: false
related: [dijkstra, bfs]
tags: [shortest-path, negative-weights, dynamic-programming]
---

## What problem does it solve?

Bellman-Ford computes single-source shortest paths in a graph where edge weights
may be **negative** — something Dijkstra's algorithm cannot handle. It also
**detects negative cycles** (cycles whose total weight is negative), in which case
no finite shortest path exists.

It works by relaxing every edge V − 1 times. After k passes, distances to nodes at
most k edges away are correct; since no shortest path needs more than V − 1 edges,
the final pass is exact.

## How it works

1. Set `dist[source] = 0`, all others to `infinity`.
2. Repeat V − 1 times: for every edge `(u, v, w)`, *relax* it —
   `dist[v] = min(dist[v], dist[u] + w)`.
3. Do one final pass over all edges. If any edge can still improve a distance, a
   **negative cycle** exists.

> Think of it as dynamic programming over the number of edges: `dp[k][v]` is the
> shortest path to `v` using at most `k` edges.

## Step-by-step example

Graph with edges: `A→B: 4`, `A→C: 5`, `B→C: -3`, `C→D: 2`, `B→D: 10`. Source `A`.

| Pass | dist[B] | dist[C] | dist[D] |
| ---- | ------- | ------- | ------- |
| init | ∞       | ∞       | ∞       |
| 1    | 4       | 5       | ∞       |
| 2    | 4       | 1 (via B) | 7 (via… C) |
| 3    | 4       | 1       | 3 (via C) |

After V − 1 = 3 passes, distances stabilize: `dist[D] = 3` via `A→B→C→D`.

## Pseudocode

```text
procedure bellmanFord(graph, source):
    dist[source] = 0
    for v in graph:  dist[v] = infinity
    for i = 1 to V - 1:
        for edge (u, v, w) in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for edge (u, v, w) in edges:
        if dist[u] + w < dist[v]:
            report "negative cycle exists"
    return dist
```

## Implementation

```python
def bellman_ford(edges, num_nodes, source):
    """
    edges = list of (u, v, weight). Returns (dist, has_negative_cycle).
    """
    dist = [float("inf")] * num_nodes
    dist[source] = 0

    for _ in range(num_nodes - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != float("inf") and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break

    for u, v, w in edges:
        if dist[u] != float("inf") and dist[u] + w < dist[v]:
            return dist, True  # negative cycle

    return dist, False
```

```javascript
function bellmanFord(edges, numNodes, source) {
  const dist = Array(numNodes).fill(Infinity)
  dist[source] = 0
  for (let i = 0; i < numNodes - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) dist[v] = dist[u] + w
    }
  }
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) return { dist, hasNegativeCycle: true }
  }
  return { dist, hasNegativeCycle: false }
}
```

## Complexity

| Measure | Value |
| ------- | ----- |
| Time    | O(V × E) — V − 1 passes over all edges |
| Space   | O(V) — distance array |
| Early exit | Stops if a pass changes nothing |

## When to use it

- Graphs with **negative edge weights**.
- Detecting **negative cycles** (e.g. currency arbitrage, deadlock analysis).
- Distributed routing scenarios that compute shortest paths iteratively.

## When NOT to use it

- Non-negative weights — Dijkstra is far faster.
- Large dense graphs — O(V·E) gets expensive; consider Johnson's algorithm.
- When a negative cycle prevents a finite answer — detect it and handle it.

## Common mistakes

- Relaxing **only V − 1** edges maybe instead of V − 1 full passes.
- Forgetting the final negative-cycle check pass.
- Applying it with overflow-prone `dist[u] + w` when `dist[u]` is `infinity`.
- Skipping the early-exit optimization, wasting passes after convergence.

## Related algorithms

- [Dijkstra's Algorithm](/algorithms/dijkstra) — faster, but fails with negative edges.
- BFS — the correct choice for unweighted graphs.

## Practice problems

- Detect whether a graph contains a negative cycle.
- Find the cheapest sequence of currency conversions.
- Shortest paths in a graph with negative edges.
- [LeetCode · Find the City With the Smallest Number of Neighbors](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors/)