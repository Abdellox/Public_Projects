---
title: Binary Search
category: searching
difficulty: beginner
short: Repeatedly halves the search range in a sorted array to find a target in O(log n).
best: O(1)
average: O(log n)
worst: O(log n)
space: O(1)
stable: true
inPlace: true
visualizable: true
related: [linear-search]
tags: [sorted, divide-and-conquer, interval]
---

## What problem does it solve?

Binary Search finds a target in a **sorted** array by repeatedly comparing the
target with the middle element and discarding half of the remaining range each
time. It answers “is it here, and where?” in O(log n) comparisons.

The same idea generalizes far beyond simple lookup: finding the first `true` in a
monotonic predicate, locating an insertion point, or searching in a rotated array
all reduce to binary search.

## How it works

1. Maintain a search range `[low, high]`.
2. Compute `mid = (low + high) / 2`.
3. Compare `A[mid]` with the target:
   - equal → found, return `mid`;
   - less → the target must be in `[mid + 1, high]`;
   - greater → it must be in `[low, mid - 1]`.
4. Repeat until the range is empty — then the target is absent.

Each step halves the range, so the number of steps for n elements is at most
⌈log₂(n + 1)⌉.

## Step-by-step example

Find `23` in `[2, 5, 8, 12, 16, 23, 38, 45, 56, 72]`:

| Step | Range | mid | A[mid] | Action |
| ---- | ----- | --- | ------ | ------ |
| 1    | [0..9] | 4 | 16 | 16 < 23 → go right |
| 2    | [5..9] | 7 | 45 | 45 > 23 → go left |
| 3    | [5..6] | 5 | 23 | 23 == 23 → found at 5 |

## Pseudocode

```text
procedure binarySearch(A, target):
    low, high = 0, length(A) - 1
    while low <= high:
        mid = (low + high) // 2
        if A[mid] == target:
            return mid
        elif A[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

## Implementation

```python
def binary_search(data, target):
    """
    Returns the index of target in a sorted list, or -1.
    Uses mid = low + (high - low) // 2 to avoid integer overflow.
    """
    low, high = 0, len(data) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if data[mid] == target:
            return mid
        if data[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

```typescript
function binarySearch(arr: number[], target: number): number {
  let low = 0
  let high = arr.length - 1
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) low = mid + 1
    else high = mid - 1
  }
  return -1
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(1) — target is the middle element on the first try |
| Average  | O(log n) |
| Worst    | O(log n) — ⌈log₂(n + 1)⌉ probes |
| Space    | O(1) — iterative version |

## When to use it

- The data is **sorted** (or sortable) and you need repeated quick lookups.
- The search space is large and you can evaluate a monotonic predicate instead.
- Finding boundaries in discrete space: first bad version, square roots, insertion
  points.

## When NOT to use it

- **Unsorted** data — the halving logic gives wrong answers.
- Tiny collections — linear search wins thanks to cache and simplicity.
- When elements are added/removed constantly — maintaining the sorted order may
  cost more than the search saves.

## Common mistakes

- Using `low < high` instead of `low <= high`, failing to return a match at the
  boundary.
- Infinite loops from `mid = (low + high) / 2` when the range never shrinks.
- Off-by-one on `low = mid + 1` / `high = mid - 1`, causing the range to never
  become empty and missing elements.
- Assuming 1-based indexing when the input is 0-based (or vice versa).

## Related algorithms

- [Linear Search](/algorithms/linear-search) — works on unsorted data, but O(n).
- Merge Sort — sort first, then you are free to binary search.

## Practice problems

- Find the first and last position of a target in a sorted array.
- Search in a rotated sorted array.
- Find a peak element.
- Find the smallest element that is ≥ target (lower bound).
- [LeetCode · Binary Search](https://leetcode.com/problems/binary-search/)
- [LeetCode · First Bad Version](https://leetcode.com/problems/first-bad-version/)