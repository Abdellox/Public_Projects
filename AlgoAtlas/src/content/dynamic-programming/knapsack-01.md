---
title: 0/1 Knapsack
category: dynamic-programming
difficulty: intermediate
short: Pack items with weights and values into a capacity-limited bag, choosing each item at most once.
best: O(n × W)
average: O(n × W)
worst: O(n × W)
space: O(W)
stable: true
inPlace: true
visualizable: false
related: [fibonacci-dp]
tags: [optimization, 2d-dp, subset-sum, classic]
---

## What problem does it solve?

Given `n` items each with a weight and a value, the 0/1 Knapsack problem asks for
the maximum total value you can fit into a knapsack of capacity `W` — **each item
may be taken at most once** (hence "0/1").

It is the canonical example of **2D dynamic programming** and the archetype for
resource-allocation and subset-selection problems. Greedy fails here, so DP is the
standard approach.

## How it works

Define `dp[i][w]` = the maximum value achievable using the first `i` items with
total weight at most `w`.

For each item `i` with weight `wi` and value `vi`:

- **Skip it:** `dp[i][w] = dp[i-1][w]`
- **Take it** (if `wi ≤ w`): `dp[i][w] = max(dp[i-1][w], vi + dp[i-1][w - wi])`

The running table is filled top-to-bottom, left-to-right, and the answer is
`dp[n][W]`.

## Step-by-step example

Capacity `W = 10`:

| Item | Weight | Value |
| ---- | ------ | ----- |
| A    | 2      | 6  |
| B    | 3      | 12 |
| C    | 4      | 8  |
| D    | 5      | 15 |

Optimal selection: **B + D** = weight 8 ≤ 10, value `12 + 15 = 27`. (A + B + C = 9
≤ 10 gives value 26, slightly worse.) No greedy rule (lightest, most valuable, best
ratio) reaches 27.

## Pseudocode

```text
dp = 2D array [n+1][W+1], all zeros
for i = 1 to n:
    for w = 1 to W:
        if weight[i] <= w:
            dp[i][w] = max(dp[i-1][w],
                           value[i] + dp[i-1][w - weight[i]])
        else:
            dp[i][w] = dp[i-1][w]
return dp[n][W]              # then backtrack to recover items
```

## Implementation

```python
def knapsack_01(weights, values, capacity):
    """
    Returns the maximum value for a 0/1 knapsack.
    Uses a 1D rolling array; left-to-right would reuse the item,
    so we iterate right-to-left.
    """
    dp = [0] * (capacity + 1)
    n = len(weights)
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[capacity]
```

```typescript
function knapsack01(weights: number[], values: number[], capacity: number): number {
  const dp: number[] = Array(capacity + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }
  return dp[capacity]
}
```

## Complexity

| Aspect | Value |
| ------ | ----- |
| Time   | O(n × W) — one pass per item over every capacity |
| Space  | O(n × W) → O(W) with a rolling 1D array |
| Missing items | Recoverable via a backtrack table |

## When to use it

- Selecting a best subset under a hard capacity constraint.
- Any problem reducible to “choose or skip”: subset sum, partition equal subset,
  target sum, coin change (0/1 variant).
- When `W` is reasonably small — the pseudo-polynomial time is actually a feature
  for bounded inputs.

## When NOT to use it

- When `W` is huge (e.g. 10⁹) — the table becomes intractable; consider
  meet-in-the-middle or branch and bound.
- When items can be **split** (fractional knapsack) — greedy by value/weight ratio
  is optimal and O(n log n).
- When each item may be used **unlimited** times (unbounded knapsack) — different
  recurrence and iteration order.

## Common mistakes

- Iterating the inner loop **left-to-right** with a 1D array — that accidentally
  allows taking the item multiple times (unbounded behavior).
- Off-by-one on item indexing (`items[i]` vs `items[i-1]`).
- Forgetting `weights[i] <= capacity` guards, causing negative indices.
- Trying greedy value/weight ratio — it is provably suboptimal for 0/1 knapsack.

## Related algorithms

- [Fibonacci DP](/algorithms/fibonacci-dp) — the simplest 1D DP recurrence.
- Fractional Knapsack — greedy, optimal for divisible items.
- Subset-Sum — the special case where value == weight.

## Practice problems

- Partition an array into two subsets of equal sum.
- Count the number of subsets that add up to a target.
- Target sum with `+`/`−` operators.
- [LeetCode · Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/)
- [LeetCode · Target Sum](https://leetcode.com/problems/target-sum/)