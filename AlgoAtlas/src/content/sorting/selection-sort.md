---
title: Selection Sort
category: sorting
difficulty: beginner
short: Repeatedly finds the smallest remaining element and swaps it into the next sorted position.
best: O(n²)
average: O(n²)
worst: O(n²)
space: O(1)
stable: false
inPlace: true
visualizable: true
related: [bubble-sort, insertion-sort, heap-sort]
tags: [comparison-sort]
---

## What problem does it solve?

Selection Sort orders an array by building the sorted result from left to right:
on each pass it scans the unsorted portion, finds the *minimum*, and swaps it into
the next position.

Unlike Bubble Sort it moves each element at most once, making it a good choice when
**swapping is expensive** but comparisons are cheap.

## How it works

1. Mark the start of the unsorted region (initially the whole array).
2. Scan the unsorted region to find the index of its smallest element.
3. Swap that element into the first position of the unsorted region.
4. Advance the boundary by one.
5. Repeat until only one element remains — it is already sorted.

Selection Sort runs in O(n²) time in **every** case because the inner scan always
goes all the way to the end.

## Step-by-step example

Sort `[64, 25, 12, 22, 11]`:

| Pass | Unsorted region | Minimum | Array after swap |
| ---- | --------------- | ------- | ---------------- |
| 1    | `[64, 25, 12, 22, 11]` | 11 | `[11, 25, 12, 22, 64]` |
| 2    | `[25, 12, 22, 64]` | 12 | `[11, 12, 25, 22, 64]` |
| 3    | `[25, 22, 64]` | 22 | `[11, 12, 22, 25, 64]` |
| 4    | `[25, 64]` | 25 | `[11, 12, 22, 25, 64]` |

## Pseudocode

```text
procedure selectionSort(A):
    n = length(A)
    for i = 0 to n - 2:
        minIndex = i
        for j = i + 1 to n - 1:
            if A[j] < A[minIndex]:
                minIndex = j
        swap A[i], A[minIndex]
```

## Implementation

```python
def selection_sort(data):
    """
    Sorts a list in place with selection sort.
    At most n - 1 swaps are performed total.
    """
    n = len(data)
    for i in range(n - 1):
        min_index = i
        for j in range(i + 1, n):
            if data[j] < data[min_index]:
                min_index = j
        if min_index != i:
            data[i], data[min_index] = data[min_index], data[i]
    return data
```

```javascript
function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j
    }
    if (minIndex !== i) {
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
    }
  }
  return arr
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(n²) — the scan never short-circuits |
| Average  | O(n²) |
| Worst    | O(n²) |
| Space    | O(1) — in place |
| Swaps    | At most O(n) — n − 1 total |

## When to use it

- When **writes/swaps are much more expensive** than reads (e.g. flash storage or
  EEPROM), since it performs at most n − 1 swaps.
- When the array is small and implementation simplicity is a priority.

## When NOT to use it

- When the data is nearly sorted — Insertion Sort is strictly better there.
- When comparisons are expensive — it performs roughly n²/2 reads regardless of
  input.
- When stability matters — the swap can move an equal element past a smaller index,
  breaking stability.

## Common mistakes

- Updating the candidate minimum while only comparing, then swapping the wrong
  position.
- Swapping even when `minIndex === i`, producing a wasteful (and possibly unstable)
  no-op.
- Scanning only part of the unsorted region, yielding an incorrect sort.

## Related algorithms

- [Bubble Sort](/algorithms/bubble-sort) — compares the same n²/2 pairs.
- [Insertion Sort](/algorithms/insertion-sort) — better on nearly sorted input.
- [Heap Sort](/algorithms/heap-sort) — shares the “pick the minimum repeatedly”
  idea but uses a heap to find it in O(log n).

## Practice problems

- Sort an array and print the number of swaps selection sort performs.
- Find the k-th smallest element by running only k selection passes.
- Sort a list of records by key while tracking how many times each record moves.
- Sort an array such that even-indexed positions hold the largest half of values.
- [LeetCode · Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)