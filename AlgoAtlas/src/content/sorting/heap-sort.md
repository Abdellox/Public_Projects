---
title: Heap Sort
category: sorting
difficulty: intermediate
short: Builds a max-heap, then repeatedly extracts the largest element into its final sorted position.
best: O(n log n)
average: O(n log n)
worst: O(n log n)
space: O(1)
stable: false
inPlace: true
visualizable: false
related: [selection-sort, merge-sort, quick-sort]
tags: [comparison-sort, heap, selection]
---

## What problem does it solve?

Heap Sort sorts an array by first building a **max-heap** (a complete binary tree
where every parent is larger than its children), then repeatedly swapping the largest
element at the root into its final position at the end of the array.

It gives **guaranteed O(n log n)** time with **O(1)** extra space, combining the best
parts of Selection Sort and Merge Sort — though it is not stable.

## How it works

1. **Heapify:** rearrange the array so it satisfies the max-heap property
   (`a[i] ≥ a[2i+1]` and `a[i] ≥ a[2i+2]`), done in O(n) with a bottom-up `siftDown`.
2. **Extract:** swap the root (the max) with the last element, shrinking the heap by
   one — that element is now sorted.
3. **Restore:** `siftDown` the new root to repair the heap.
4. Repeat steps 2–3 until the heap is empty.

The array conceptually has two parts: the unsorted heap at the front and the sorted
run at the back.

## Step-by-step example

Build a max-heap from `[4, 10, 3, 5, 1]`, then extract:

```text
Heap:  10      Extract 10 -> [1,5,3,4, | 10]
       / \
      5   3     Heapify  [5,4,3,1]  -> extract 5
     / \
    1   4       -> [1,4,3, | 5,10]
                -> extract 4 -> [3,1, | 4,5,10]
                -> extract 3 -> [1, | 3,4,5,10]
```

Result: `[1, 3, 4, 5, 10]`.

## Pseudocode

```text
procedure heapSort(A):
    buildMaxHeap(A)                 # bottom-up siftDown from n/2 - 1
    for i = length(A) - 1 down to 1:
        swap A[0], A[i]             # largest to its final spot
        heapSize = i
        siftDown(A, root=0, heapSize)

procedure siftDown(A, i, size):
    while 2i + 1 < size:
        j = 2i + 1                  # left child
        if j + 1 < size and A[j + 1] > A[j]: j = j + 1
        if A[i] >= A[j]: break
        swap A[i], A[j]
        i = j
```

## Implementation

```python
def heap_sort(data):
    """Sorts a list in place with heap sort (max-heap)."""
    n = len(data)

    def sift_down(i, size):
        while 2 * i + 1 < size:
            child = 2 * i + 1
            if child + 1 < size and data[child + 1] > data[child]:
                child += 1
            if data[i] >= data[child]:
                break
            data[i], data[child] = data[child], data[i]
            i = child

    # Build max-heap (bottom-up)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(i, n)

    # Extract repeatedly
    for i in range(n - 1, 0, -1):
        data[0], data[i] = data[i], data[0]
        sift_down(0, i)
    return data
```

```javascript
function heapSort(arr) {
  const siftDown = (i, size) => {
    while (2 * i + 1 < size) {
      let child = 2 * i + 1
      if (child + 1 < size && arr[child + 1] > arr[child]) child++
      if (arr[i] >= arr[child]) break
      ;[arr[i], arr[child]] = [arr[child], arr[i]]
      i = child
    }
  }
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) siftDown(i, arr.length)
  for (let i = arr.length - 1; i > 0; i--) {
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    siftDown(0, i)
  }
  return arr
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(n log n) |
| Average  | O(n log n) |
| Worst    | O(n log n) |
| Space    | O(1) — in place |
| Heapify  | O(n) — bottom-up siftDown |

## When to use it

- When you need **guaranteed O(n log n)** and **constant extra space** (embedded
  systems, in-memory sorting with tight memory).
- When you need a **priority queue** or the k largest/smallest elements (via a heap).
- When worse-case guarantees matter more than average-case speed.

## When NOT to use it

- When **stability** is required — it is inherently unstable.
- When cache locality matters — random access across the array hurts vs Quick Sort.
- For small or nearly sorted inputs — Insertion Sort is faster.

## Common mistakes

- Building the heap by pushing each element one at a time (O(n log n)) instead of the
  O(n) bottom-up method.
- Off-by-one in the heap-size boundary after extraction, accidentally including the
  already-sorted tail.
- Using `siftUp` in the extraction loop or mis-indexing children as `2i` instead of
  `2i + 1`/`2i + 2` (0-indexed).

## Related algorithms

- [Selection Sort](/algorithms/selection-sort) — same “repeatedly pick the largest”
  idea, but O(n²) because it scans every time.
- [Merge Sort](/algorithms/merge-sort) — O(n log n) but needs O(n) space and is stable.
- [Quick Sort](/algorithms/quick-sort) — faster in practice, but worst case O(n²).

## Practice problems

- Find the k largest (or smallest) elements using a heap.
- Sort an array of distinct integers with heap sort and count comparisons.
- Implement a max-priority queue with insert and extract-max.
- Merge k sorted lists using a min-heap.
- [LeetCode · Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [LeetCode · Sort an Array](https://leetcode.com/problems/sort-an-array/)