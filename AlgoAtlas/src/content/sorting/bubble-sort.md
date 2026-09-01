---
title: Bubble Sort
category: sorting
difficulty: beginner
aka: [Sinking sort]
short: Repeatedly swaps adjacent elements that are out of order until the array is sorted.
best: O(n)
average: O(n²)
worst: O(n²)
space: O(1)
stable: true
inPlace: true
visualizable: true
related: [selection-sort, insertion-sort, merge-sort]
tags: [exchange-sort, comparison-sort]
---

## What problem does it solve?

Bubble Sort orders an array by repeatedly walking through it, comparing adjacent
pairs, and swapping them whenever they are in the wrong order. Each pass *bubbles*
the largest remaining value to its final position at the end of the array.

It is rarely the best choice in practice, but it is an excellent first algorithm to
learn because its logic is trivial and its inefficiency is easy to feel.

## How it works

1. Start at the beginning of the array.
2. Compare the current element with the next one.
3. If they are out of order, swap them.
4. Move one step forward and repeat.
5. After one full pass, the largest element is guaranteed to sit at the end — it is
   now *sorted* and can be ignored.
6. Repeat passes over the remaining portion until no swaps are needed.

If a full pass performs no swaps, the array is already sorted and we can stop early.

## Step-by-step example

Sort `[5, 1, 4, 2, 8]`:

| Pass | Comparisons | Array after pass |
| ---- | ----------- | ---------------- |
| 1    | 5→1, 5→4, 5→2, 5→8 | `[1, 4, 2, 5, 8]` |
| 2    | 1→4, 4→2, 4→5      | `[1, 2, 4, 5, 8]` |
| 3    | 1→2, 2→4            | `[1, 2, 4, 5, 8]` |

In pass 3 no swaps happen, so we stop early.

## Pseudocode

```text
procedure bubbleSort(A):
    n = length(A)
    repeat
        swapped = false
        for j = 0 to n - 2:
            if A[j] > A[j + 1]:
                swap A[j], A[j + 1]
                swapped = true
        n = n - 1
    until swapped == false
```

## Implementation

```python
def bubble_sort(data):
    """
    Sorts a list in place using bubble sort.

    The inner loop shrinks by one each pass because the largest
    remaining element is always placed at the current end.
    """
    n = len(data)
    for i in range(n):
        swapped = False
        for j in range(n - 1 - i):
            if data[j] > data[j + 1]:
                data[j], data[j + 1] = data[j + 1], data[j]
                swapped = True
        if not swapped:
            break
    return data
```

```javascript
function bubbleSort(arr) {
  let n = arr.length
  do {
    let swapped = false
    for (let j = 0; j < n - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
      }
    }
    n--
  } while (swapped)
  return arr
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(n) — already sorted, one pass with no swaps |
| Average  | O(n²) |
| Worst    | O(n²) — reverse sorted |
| Space    | O(1) — in place, only a temporary swap variable |

## When to use it

- For **teaching** — the clearest possible introduction to sorting.
- For tiny inputs where simplicity matters more than speed.
- When the data is **nearly sorted** and you add the early-exit optimization
  (best case O(n)).

## When NOT to use it

- On large inputs: O(n²) does not scale.
- When stability or speed is essential — prefer an O(n log n) sort.
- When you need performance guarantees — Insertion Sort beats it on nearly sorted
  data, and has the same code complexity.

## Common mistakes

- Forgetting the shrinking boundary, causing redundant comparisons (still correct,
  just slower).
- Forgetting the `swapped` early exit, losing the O(n) best case.
- Off-by-one errors in the inner loop, either swapping past the end or missing the
  last pair.

## Related algorithms

- [Selection Sort](/algorithms/selection-sort) — same O(n²), but minimizes swaps.
- [Insertion Sort](/algorithms/insertion-sort) — the more practical O(n²) sort.
- [Merge Sort](/algorithms/merge-sort) — O(n log n) divide-and-conquer alternative.

## Practice problems

- Sort an array of integers in ascending order.
- Count the number of swaps a bubble sort would perform.
- Sort a list of strings by length, then alphabetically.
- Detect whether an array is nearly sorted using a single pass.
- [LeetCode · Sort Colors](https://leetcode.com/problems/sort-colors/)