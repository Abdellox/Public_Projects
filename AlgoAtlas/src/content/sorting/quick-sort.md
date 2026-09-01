---
title: Quick Sort
category: sorting
difficulty: intermediate
short: Partitions the array around a pivot, then recursively sorts each side.
best: O(n log n)
average: O(n log n)
worst: O(n²)
space: O(log n)
stable: false
inPlace: true
visualizable: false
related: [merge-sort, heap-sort, selection-sort]
tags: [divide-and-conquer, partitioning]
---

## What problem does it solve?

Quick Sort sorts an array by choosing a **pivot**, partitioning the array so that
everything smaller than the pivot is on the left and everything larger is on the
right, then recursing on each side.

It is usually the fastest in-place comparison sort in practice thanks to excellent
cache behavior, but its worst case is O(n²) — which is why production libraries
pick pivots carefully.

## How it works

1. **Partition:** pick a pivot (e.g. the last element). Rearrange so that elements
   `< pivot` come before it and elements `> pivot` come after it.
2. The pivot is now in its **final sorted position**.
3. **Recurse** on the left and right subarrays.
4. Stop when a subarray has fewer than two elements.

The quality of the pivot decides the running time. A good pivot splits the array
roughly in half (O(n log n)); a bad pivot (min or max) leaves one side nearly empty
(O(n²)).

## Step-by-step example

Partition `[10, 80, 30, 90, 40, 50, 70]` with pivot `70`:

```text
10 < 70   keep left
80 > 70   keep right
30 < 70   keep left
90 > 70   keep right
40 < 70   keep left
50 < 70   keep left
-> swap pivot into place: [10, 30, 40, 50, 70, 90, 80]
```

Now `70` is in its final slot. Recurse on `[10, 30, 40, 50]` and `[90, 80]`.

## Pseudocode

```text
procedure quickSort(A, lo, hi):
    if lo >= hi: return
    p = partition(A, lo, hi)
    quickSort(A, lo, p - 1)
    quickSort(A, p + 1, hi)

procedure partition(A, lo, hi):
    pivot = A[hi]          # Lomuto scheme
    i = lo
    for j = lo to hi - 1:
        if A[j] <= pivot:
            swap A[i], A[j]
            i = i + 1
    swap A[i], A[hi]
    return i
```

## Implementation

```python
def quick_sort(data, lo=0, hi=None):
    """Sorts a list in place with quick sort (Lomuto partitioning)."""
    if hi is None:
        hi = len(data) - 1
    if lo >= hi:
        return data
    p = partition(data, lo, hi)
    quick_sort(data, lo, p - 1)
    quick_sort(data, p + 1, hi)
    return data


def partition(data, lo, hi):
    pivot = data[hi]
    i = lo
    for j in range(lo, hi):
        if data[j] <= pivot:
            data[i], data[j] = data[j], data[i]
            i += 1
    data[i], data[hi] = data[hi], data[i]
    return i
```

```javascript
function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr
  const p = partition(arr, lo, hi)
  quickSort(arr, lo, p - 1)
  quickSort(arr, p + 1, hi)
  return arr
}

function partition(arr, lo, hi) {
  const pivot = arr[hi]
  let i = lo
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
  return i
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(n log n) — pivot always splits evenly |
| Average  | O(n log n) |
| Worst    | O(n²) — always choosing the min/max as pivot |
| Space    | O(log n) — recursion stack (in-place) |

## When to use it

- When you want the **fastest average-case in-place** sort.
- When cache locality matters and the data fits in memory.
- When you need the k-th element or a partition-based selection algorithm.

## When NOT to use it

- When worst-case guarantees matter — Merge Sort or Heap Sort are safer.
- When the input is already sorted and you use a naive (first/last) pivot — that
  triggers the O(n²) worst case.
- When stability is required.

## Common mistakes

- Using a naive pivot on adversarial or already-sorted input (→ O(n²)). Fix: pick
  the middle element or a random pivot.
- Forgetting the `<=` in the partition loop, which breaks the pivot handling.
- Off-by-one recursion bounds that leave the pivot unsorted or cause a stack
  overflow on degenerate input.

## Related algorithms

- [Merge Sort](/algorithms/merge-sort) — guaranteed O(n log n), but needs O(n) space.
- [Heap Sort](/algorithms/heap-sort) — O(n log n) worst case, in place.
- [Selection Sort](/algorithms/selection-sort) — the “select the pivot position”
  idea generalizes to Quickselect.

## Practice problems

- Implement quick sort with a randomized pivot.
- Find the k-th smallest element using quickselect.
- Sort an array with many duplicate values using a three-way partition.
- Sort binary arrays (0s and 1s) with a single partition pass — this is the Dutch
  National Flag problem.
- [LeetCode · Sort an Array](https://leetcode.com/problems/sort-an-array/)