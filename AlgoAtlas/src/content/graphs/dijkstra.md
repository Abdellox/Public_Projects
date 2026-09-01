---
title: Dijkstra's Algorithm
category: graphs
difficulty: intermediate
short: Finds the shortest path from a source node to every other node in a weighted graph.
best: O((V + E) log V)
average: O((V + E) log V)
worst: O((V + E) log V)
space: O(V)
stable: true
inPlace: true
visualizable: false
related: [bfs, bellman-ford]
tags: [shortest-path, weighted, greedy, priority-queue]
---

## What problem does it solve?

Dijkstra's Algorithm computes the **shortest path** from a single source node to
every other node in a graph with **non-negative edge weights**.

It is the backbone of GPS routing, network routing protocols (e.g. OSPF), and most
path-finding tools. The key insight: once a node is “settled”, its shortest distance
is final, so each edge is relaxed (examined) at most once.

## How it works

1. Assign every node a tentative distance: `0` for the source, `infinity` otherwise.
2. Put the source in a min-priority queue keyed by tentative distance.
3. Pop the node with the smallest tentative distance — this is the *current* node.
4. For each neighbor, a **relaxation** step: if
   `dist[neighbor] > dist[current] + weight(current, neighbor)`, update the
   neighbor’s distance and push it into the queue.
5. Repeat until the queue is empty.

> Dijkstra is **greedy**: it always expands the node that currently appears
> closest. This is only correct when no edge has a negative weight.

## Step-by-step example

Graph:

```text
    (4)      (1)
A ------- B ------- C
|         |         |
(2)      (5)      (1)
|         |         |
D ------- E ------- F
    (3)      (2)
```

Shortest distances from `A`:

| Node | Distance | Path |
| ---- | -------- | ---- |
| A    | 0        | —    |
| B    | 4        | A→B  |
| C    | 5        | A→B→C |
| D    | 2        | A→D  |
| E    | 5        | A→D→E |
| F    | 7        | A→D→E→F |

## Pseudocode

```text
procedure dijkstra(graph, source):
    dist[source] = 0
    for v in graph:  dist[v] = infinity
    pq = min-priority queue containing source
    while pq is not empty:
        u = pq.pop()          # smallest dist
        for edge (u, v, w) in graph[u]:
            if dist[v] > dist[u] + w:
                dist[v] = dist[u] + w
                pq.push(v)    # or decrease-key
    return dist
```

## Implementation

```python
import heapq


def dijkstra(graph, source):
    """
    graph[v] = list of (neighbor, weight).
    Returns a dict of shortest distances from source.
    """
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    pq = [(0, source)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # stale entry
        for v, w in graph[u]:
            candidate = d + w
            if candidate < dist[v]:
                dist[v] = candidate
                heapq.heappush(pq, (candidate, v))
    return dist
```

```typescript
interface Edge {
  to: number
  weight: number
}

function dijkstra(graph: Edge[][], source: number): number[] {
  const dist = Array(graph.length).fill(Infinity)
  dist[source] = 0
  const pq: Array<[number, number]> = [[0, source]]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()!
    if (d > dist[u]) continue
    for (const { to, weight } of graph[u]) {
      const candidate = d + weight
      if (candidate < dist[to]) {
        dist[to] = candidate
        pq.push([candidate, to])
      }
    }
  }
  return dist
}
```

## Complexity

| Measure            | Value |
| ------------------ | ----- |
| With binary heap   | O((V + E) log V) |
| With Fibonacci heap | O(V log V + E) |
| Dense graph (array) | O(V²) |
| Space              | O(V) — distances + queue |

## When to use it

- Single-source shortest paths with **non-negative weights** (GPS, networks).
- When you need distances to **all** nodes, but stop early when you only want one
  (early exit on target).
- On graphs that are sparse or dense alike, via the right queue implementation.

## When NOT to use it

- When the graph has **negative edges** — use Bellman-Ford.
- When edges are **unweighted** — plain BFS is O(V + E) and faster.
- When you need an **admissible heuristic** to prune search — use A*.

## Common mistakes

- Using a plain queue or prioritizing by node id instead of distance.
- Pushing nodes with outdated distances and skipping the “stale entry” check.
- Assuming Dijkstra works with negative weights (it silently returns wrong paths).
- Forgetting to handle disconnected components (dist stays `infinity`).

## Related algorithms

- BFS — Dijkstra with all edge weights equal to 1, using a queue instead of a heap.
- [Bellman-Ford](/algorithms/bellman-ford) — tolerates negative weights, but slower.
- A* — Dijkstra plus a heuristic for targeted search.

## Practice problems

- Find the shortest path in a grid with obstacles.
- Network delay time — the longest single-source shortest distance.
- Cheapest flight within k stops (layer the graph).
- Wall-free shortest path in a maze.
- [LeetCode · Network Delay Time](https://leetcode.com/problems/network-delay-time/)