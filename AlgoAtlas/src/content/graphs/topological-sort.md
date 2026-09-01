---
title: Topological Sort
category: graphs
difficulty: intermediate
short: Orders the nodes of a directed acyclic graph so every edge points forward.
best: O(V + E)
average: O(V + E)
worst: O(V + E)
space: O(V)
stable: true
inPlace: true
visualizable: false
related: [dfs, bfs]
tags: [directed, acyclic, ordering, kahn]
---

## What problem does it solve?

Topological Sort produces a **linear ordering** of a **directed acyclic graph (DAG)**
such that for every directed edge `u → v`, node `u` comes before node `v`.

It answers “what order must things be done in?” when there are dependencies — course
prerequisites, build steps, task scheduling, package install order. The graph must be
acyclic; if it has a cycle, no valid topological order exists.

## How it works

There are two classic algorithms:

**Kahn's algorithm (BFS-style, in-degree based):**

1. Compute the in-degree of every node.
2. Enqueue all nodes with in-degree 0 (no prerequisites).
3. Pop a node, add it to the order, and decrement the in-degree of each of its
   neighbors. Any neighbor reaching in-degree 0 is enqueued.
4. If the final order contains all V nodes, it is a valid topological sort;
   otherwise the graph has a cycle.

**DFS-based:** run DFS and append a node to the order **only after** visiting all of
its descendants, then reverse — the standard "POST-order reversed".

## Step-by-step example

DAG (edge `a → b` means "a before b"):

```text
c  ->  a  ->  d
|             ^
v             |
b  ------------
```

Kahn's starting state — in-degrees: `a:1, b:2, c:0, d:2`. Zero-in-degree set `{c}`:

```text
pop c  (add to order)  -> lower a, b  in-degree;  {b}   now zero
pop b  (add)           -> lower d;                 {a}  
pop a  (add)           -> lower d;                 {d}   now zero
pop d  (add)           -> done
```

Order: `c, b, a, d` (a valid topological ordering; others exist, e.g. `b, c, a, d`).

## Pseudocode

```text
procedure topoSort(graph):
    compute in-degree of every node
    queue = all nodes with in-degree 0
    order = []
    while queue is not empty:
        u = queue.pop()
        order.append(u)
        for v in graph[u]:
            inDegree[v] -= 1
            if inDegree[v] == 0:
                queue.push(v)
    if length(order) != number of nodes:
        error "graph has a cycle"
    return order
```

## Implementation

```python
from collections import deque


def topological_sort(num_nodes, graph):
    """
    graph[u] = list of downstream neighbors.
    Returns a valid ordering, or None if a cycle exists.
    """
    in_degree = [0] * num_nodes
    for neighbors in graph:
        for v in neighbors:
            in_degree[v] += 1

    queue = deque(i for i, d in enumerate(in_degree) if d == 0)
    order = []

    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    return order if len(order) == num_nodes else None
```

```javascript
function topologicalSort(numNodes, graph) {
  const inDegree = Array(numNodes).fill(0)
  for (const neighbors of graph) for (const v of neighbors) inDegree[v]++
  const queue = []
  inDegree.forEach((d, i) => { if (d === 0) queue.push(i) })
  const order = []

  while (queue.length) {
    const u = queue.shift()
    order.push(u)
    for (const v of graph[u]) {
      if (--inDegree[v] === 0) queue.push(v)
    }
  }
  return order.length === numNodes ? order : null
}
```

## Complexity

| Measure | Value |
| ------- | ----- |
| Time    | O(V + E) — each node and edge processed once |
| Space   | O(V) — in-degree array + queue |

## When to use it

- **Scheduling with dependencies** (courses, tasks, builds).
- Detecting **cycles in a directed graph** (if the sort fails, a cycle exists).
- Compiling source files, resolving import/install order.
- As a preprocessing step for DP on DAGs (longest path, etc.).

## When NOT to use it

- On an **undirected** graph (the direction concept does not apply).
- When you need just cycle detection without an order — a DFS on colors is lighter.
- When weights matter — topological sort ignores weights; combine with DP instead.

## Common mistakes

- Forgetting the cycle check — returning a partial order silently.
- Building in-degree in the wrong direction (prerequisite vs dependent).
- Treating it as a shortest-path algorithm (it is not).

## Related algorithms

- [DFS](/algorithms/dfs) — the underlying traversal; reversed post-order is an
  equivalent topological sort.
- [BFS](/algorithms/bfs) — Kahn's algorithm reuses the BFS queue pattern.

## Practice problems

- Course Schedule: can all courses be finished given prerequisites?
- Course Schedule II: return one valid order of courses.
- Alien Dictionary: derive the character order from a sorted word list.
- Build order given a list of projects and dependencies.
- [LeetCode · Course Schedule](https://leetcode.com/problems/course-schedule/)
- [LeetCode · Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)