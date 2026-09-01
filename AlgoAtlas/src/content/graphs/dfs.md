---
title: DFS (Depth-First Search)
category: graphs
difficulty: beginner
short: Traverses a graph as deep as possible along each branch using a stack or recursion.
best: O(V + E)
average: O(V + E)
worst: O(V + E)
space: O(V)
stable: true
inPlace: true
visualizable: false
related: [bfs, topological-sort]
tags: [traversal, recursion, stack]
---

## What problem does it solve?

Depth-First Search (DFS) traverses a graph by going **as deep as possible** along one
branch before backtracking. Starting at a node, it explores a neighbor, then that
neighbor's neighbor, and so on — only backing up when a dead end (or already-visited
node) is reached.

DFS is ideal for exploring the entire reachable structure, detecting cycles, and
problems where the *structure* of the recursion naturally encodes an answer (paths,
percolation, subsets).

## How it works

1. Start at the source node (or the first unvisited node).
2. Mark it visited and *process* it.
3. Recursively visit each unvisited neighbor.
4. When all neighbors are done, backtrack to the previous node.

It can be written **recursively** (using the call stack) or **iteratively** using an
explicit stack. With recursion, the order of visit is the same, but you avoid a
potential call-stack overflow on very deep graphs.

## Step-by-step example

Graph (undirected):

```text
A - B - C
|       |
D - E - F
```

DFS from `A` (visiting neighbors in alphabetical order):

```text
visit A -> go to B
visit B -> go to C
visit C -> neighbor F (unvisited) -> visit F
  F has no unvisited neighbors -> backtrack to C
  C's only neighbors visited -> backtrack to B -> backtrack to A
visit A's other neighbor D -> visit D -> go to E -> visit E
```

Visit order: `A, B, C, F, D, E`. Note how it plunges deep (`A→B→C→F`) before
returning to `A` to check the other branch (`D→E`).

## Pseudocode

```text
procedure DFS(graph, u, visited):
    visited[u] = true
    process(u)
    for v in graph[u]:
        if not visited[v]:
            DFS(graph, v, visited)
```

## Implementation

```python
def dfs(graph, source):
    """
    Iterative DFS using an explicit stack (avoids recursion depth limits).
    Returns the visit order for everything reachable from source.
    """
    visited = {source}
    order = []
    stack = [source]

    while stack:
        u = stack.pop()
        order.append(u)
        for v in graph.get(u, [])[::-1]:
            if v not in visited:
                visited.add(v)
                stack.append(v)
    return order
```

```python
def dfs_recursive(graph, u, visited=None, order=None):
    """Recursive DFS — simpler to read, but limited by recursion depth."""
    if visited is None:
        visited, order = set(), []
    visited.add(u)
    order.append(u)
    for v in graph.get(u, []):
        if v not in visited:
            dfs_recursive(graph, v, visited, order)
    return order
```

```javascript
function dfs(graph, source) {
  const visited = new Set([source])
  const order = []
  const stack = [source]

  while (stack.length) {
    const u = stack.pop()
    order.push(u)
    for (const v of (graph[u] ?? []).slice().reverse()) {
      if (!visited.has(v)) {
        visited.add(v)
        stack.push(v)
      }
    }
  }
  return order
}
```

## Complexity

| Measure | Value |
| ------- | ----- |
| Time    | O(V + E) — each vertex visited once, each edge examined once |
| Space   | O(V) — visited set + recursion/stack depth up to V |

## When to use it

- Exploring **every reachable node** (connectivity, components, flood fill).
- Detecting **cycles** in a graph.
- **Topological sort** and detecting directed cycles.
- Backtracking problems: paths, permutations, subsets, solving mazes, Sudoku.
- Finding strongly/weakly connected components (Tarjan, Kosaraju).

## When NOT to use it

- **Shortest path** — DFS does not find shortest paths; use
  [BFS](/algorithms/bfs) (unweighted) or Dijkstra (weighted).
- On extremely deep graphs where recursion could overflow — prefer the iterative
  stack version.
- When you specifically need level-by-level ordering — that is BFS.

## Common mistakes

- Forgetting to mark visited **when pushing** to the stack (causes duplicate
  processing and potential exponential blowup).
- Using recursion on a graph deep enough to overflow the call stack.
- Confusing the visit order with shortest-path distance (they are unrelated).

## Related algorithms

- [BFS](/algorithms/bfs) — the breadth-first counterpart using a queue.
- Dijkstra — finds shortest paths in weighted graphs.

## Practice problems

- Find all connected components in an undirected graph.
- Detect whether an undirected/directed graph has a cycle.
- Count the number of islands in a grid.
- Solve a Sudoku / N-Queens with backtracking (DFS on the decision tree).
- [LeetCode · Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [LeetCode · Course Schedule (cycle detection)](https://leetcode.com/problems/course-schedule/)