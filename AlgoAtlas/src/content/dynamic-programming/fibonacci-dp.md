---
title: Fibonacci with Dynamic Programming
category: dynamic-programming
difficulty: beginner
short: Computes the n-th Fibonacci number by caching overlapping recursive calls instead of recomputing them.
best: O(n)
average: O(n)
worst: O(n)
space: O(n)
stable: true
inPlace: true
visualizable: false
related: [knapsack-01]
tags: [memoization, tabulation, overlapping-subproblems, recursion]
---

## What problem does it solve?

The Fibonacci sequence is `F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)`. A naive
recursive implementation recomputes the same subproblems exponentially many times.

Dynamic Programming (DP) fixes this by solving each subproblem **once** and reusing
the result — either by caching from the top down (**memoization**) or by filling a
table from the bottom up (**tabulation**). The idea generalizes to any problem with
**overlapping subproblems** and **optimal substructure**.

## How it works

Naive recursion for `F(5)` calls `F(4)` and `F(3)`, each of which calls `F(3)` /
`F(2)` … many calls repeat. DP stores answers in a table:

```text
F: [0, 1, 1, 2, 3, 5]
```

- `F(2) = F(1) + F(0) = 1`
- `F(3) = F(2) + F(1) = 2`
- `F(4) = F(3) + F(2) = 3`
- `F(5) = F(4) + F(3) = 5`

Each value is computed exactly once.

## Step-by-step example

Compute `F(6)` bottom-up:

| i   | Computation    | Value |
| --- | -------------- | ----- |
| 0   | seed           | 0 |
| 1   | seed           | 1 |
| 2   | F(1)+F(0)      | 1 |
| 3   | F(2)+F(1)      | 2 |
| 4   | F(3)+F(2)      | 3 |
| 5   | F(4)+F(3)      | 5 |
| 6   | F(5)+F(4)      | 8 |

## Pseudocode

```text
procedure fib(n):
    if n <= 1: return n
    prev, curr = 0, 1
    for i = 2 to n:
        prev, curr = curr, prev + curr
    return curr
```

## Implementation

```python
def fibonacci(n):
    """
    Returns the n-th Fibonacci number in O(n) time and O(1) space.
    """
    if n <= 1:
        return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr
```

```python
from functools import lru_cache


@lru_cache(maxsize=None)
def fib_memo(n):
    """Top-down memoized version — same O(n) time, O(n) stack/cache space."""
    if n <= 1:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)
```

```typescript
function fibonacci(n: number): number {
  if (n <= 1) return n
  let prev = 0
  let curr = 1
  for (let i = 2; i <= n; i++) {
    ;[prev, curr] = [curr, prev + curr]
  }
  return curr
}
```

## Complexity

| Approach   | Time | Space |
| ---------- | ---- | ----- |
| Naive recursion | O(2ⁿ) | O(n) stack |
| Memoization | O(n) | O(n) |
| Tabulation (bottom-up) | O(n) | O(n) → O(1) with two rolling variables |

## When to use it

- As the **first DP pattern** to learn — the recurrence is trivial.
- Whenever a recursive formula recomputes subproblems (tiling, stair-climbing,
  count paths — all variants of this pattern).
- When you need the exact value for modest `n` (values explode beyond ~10¹⁸ past
  n ≈ 90).

## When NOT to use it

- When you only need an approximation or a modular result — faster formulas
  (matrix exponentiation, fast doubling) run in O(log n).
- When recursion depth is a limit (Python’s default ~1000) — use the iterative
  version.

## Common mistakes

- Forgetting the base cases and recursing infinitely.
- Using naive recursion and letting the exponential blowup stack-overflow.
- Assuming `F(n)` fits in an integer — it grows by ~60% per step.

## Related algorithms

- [0/1 Knapsack](/algorithms/knapsack-01) — the classic 2D DP pattern built on the
  same “store and reuse” idea.

## Practice problems

- Climbing stairs: number of ways to reach the top stepping 1 or 2 at a time.
- House robber: non-adjacent max-sum subsequence (same recurrence shape).
- Matrix chain-style counting problems.
- [LeetCode · Fibonacci Number](https://leetcode.com/problems/fibonacci-number/)
- [LeetCode · Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)