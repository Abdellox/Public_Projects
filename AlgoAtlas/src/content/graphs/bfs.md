---
title: BFS (Breadth-First Search)
category: graphs
difficulty: beginner
short: Traverses a graph level by level using a queue, finding shortest paths in unweighted graphs.
best: O(V + E)
average: O(V + E)
worst: O(V + E)
space: O(V)
stable: true
inPlace: true
visualizable: false
related: [dfs, dijkstra]
tags: [traversal, shortest-path, queue, unweighted]
---

## What problem does it solve?

Breadth-First Search (BFS) traverses a graph by exploring all nodes at the current
*distance* (level) before moving to the next. Starting from a source node, it visits
everything one edge away, then two edges away, and so on.

Because it expands by level, BFS finds the **shortest path** (by number of edges) in
**unweighted** graphs — a common ask in puzzles, social networks, and game maps.

## How it works

1. Mark the source node visited and push it into a **queue**.
2. While the queue is not empty:
   1. Pop the front node — this is the *current* node.
   2. For each unvisited neighbor, mark it visited (recording the distance/path) and
      enqueue it.
3. Repeat until the queue is empty (all reachable nodes visited).

Using a queue guarantees nodes are processed in increasing distance order.

## Step-by-step example

Graph (undirected):

```text
A - B - C
|       |
D - E - F
```

BFS from `A`:

```text
Queue: [A]
visit A -> enqueue B, D        Queue: [B, D]
visit B -> enqueue C           Queue: [D, C]
visit D -> enqueue E           Queue: [C, E]
visit C -> enqueue F           Queue: [E, F]
visit E, then F               (nothing new)
```

Visit order: `A, B, D, C, E, F`. Distances: `A:0, B/D:1, C/E:2, F:3`.

## Pseudocode

```text
procedure BFS(graph, source):
    visited[source] = true
    queue.push(source)
    while queue is not empty:
        u = queue.pop()
        for v in graph[u]:
            if not visited[v]:
                visited[v] = true
                dist[v] = dist[u] + 1   # optional
                queue.push(v)
```

## Implementation

```python
from collections import deque


def bfs(graph, source):
    """
    graph[v] = list of neighbors.
    Returns (visit_order, distances) for everything reachable from source.
    """
    visited = {source}
    dist = {source: 0}
    order = []
    queue = deque([source])

    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph.get(u, []):
            if v not in visited:
                visited.add(v)
                dist[v] = dist[u] + 1
                queue.append(v)
    return order, dist
```

```javascript
function bfs(graph, source) {
  const visited = new Set([source])
  const dist = { [source]: 0 }
  const order = []
  const queue = [source]

  while (queue.length) {
    const u = queue.shift()
    order.push(u)
    for (const v of graph[u] ?? []) {
      if (!visited.has(v)) {
        visited.add(v)
        dist[v] = dist[u] + 1
        queue.push(v)
      }
    }
  }
  return { order, dist }
}
```

## Complexity

| Measure | Value |
| ------- | ----- |
| Time    | O(V + E) — each vertex enqueued once, each edge examined once |
| Space   | O(V) — visited set + queue |

## When to use it

- **Shortest path in an unweighted graph** (number of edges).
- Level-order traversal of a tree.
- Detecting connected components, bipartiteness, or minimum cut layers.
- Flood fill, word-ladder puzzles, and “minimum number of moves” problems.

## When NOT to use it

- **Weighted** graphs — BFS does not account for edge weights; use
  [Dijkstra](/algorithms/dijkstra) or Bellman-Ford.
- When you need the *deepest* reach quickly — prefer [DFS](/algorithms/dfs).
- On very deep, wide graphs memory can grow large — BFS holds all nodes at the current
  frontier.

## Common mistakes

- Using a **stack** (implicit) instead of a queue — that silently turns BFS into DFS.
- Forgetting to mark nodes visited **when enqueued** (not when popped), causing the
  same node to be enqueued many times.
- Counting levels incorrectly, off by one on the distance array.
- Not handling the visited set for graphs with cycles → infinite loops.

## Related algorithms

- [DFS](/algorithms/dfs) — depth-first counterpart using a stack.
- [Dijkstra](/algorithms/dijkstra) — BFS generalized to weighted graphs using a
  priority queue.

## Practice problems

- Number of islands (grid flood fill with BFS).
- Open the lock: shortest sequence to reach a target state.
- Shortest path in a binary matrix / maze.
- [LeetCode · Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [LeetCode · Open the Lock](https://leetcode.com/problems/open-the-lock/)