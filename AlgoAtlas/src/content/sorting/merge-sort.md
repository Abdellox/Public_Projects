---
title: Merge Sort
category: sorting
difficulty: intermediate
short: Divides the array in half recursively, then merges sorted halves back together.
best: O(n log n)
average: O(n log n)
worst: O(n log n)
space: O(n)
stable: true
inPlace: false
visualizable: false
related: [quick-sort, insertion-sort, heap-sort]
tags: [divide-and-conquer, recursive]
---

## What problem does it solve?

Merge Sort is a **divide and conquer** algorithm that sorts an array in guaranteed
O(n log n) time. It splits the input in half, recursively sorts each half, and then
*merges* the two sorted halves into one.

Its complexity does not depend on the input order, making it the safest O(n log n)
sort, and it is **stable** — equal elements keep their relative order.

## How it works

1. **Divide:** split the array into two halves.
2. **Conquer:** recursively sort each half.
3. **Combine:** merge the two sorted halves by repeatedly taking the smaller of the
   two front elements.

The merge step is the heart of the algorithm. Two sorted lists are combined by
always taking the smaller front element, which produces a sorted result in O(n).

> The recursion bottoms out when a subarray has fewer than two elements — a single
> element is already sorted.

## Step-by-step example

Sort `[38, 27, 43, 3, 9, 82, 10]`:

```text
[38, 27, 43, 3] | [9, 82, 10]
    /         \      /      \
[38, 27] [43, 3] [9, 82]   [10]
(divide recursively down to single elements)
```

Merge back up:

| Merge | Result |
| ----- | ------ |
| `[38] + [27]` | `[27, 38]` |
| `[43] + [3]` | `[3, 43]` |
| `[27, 38] + [3, 43]` | `[3, 27, 38, 43]` |
| `[9] + [82]` | `[9, 82]` |
| `[9, 82] + [10]` | `[9, 10, 82]` |
| `[3, 27, 38, 43] + [9, 10, 82]` | `[3, 9, 10, 27, 38, 43, 82]` |

## Pseudocode

```text
procedure mergeSort(A, lo, hi):
    if lo >= hi: return
    mid = (lo + hi) / 2
    mergeSort(A, lo, mid)
    mergeSort(A, mid + 1, hi)
    merge(A, lo, mid, hi)

procedure merge(A, lo, mid, hi):
    left  = A[lo .. mid]
    right = A[mid + 1 .. hi]
    i = j = 0, k = lo
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            A[k++] = left[i++]
        else:
            A[k++] = right[j++]
    copy remaining left elements, then right elements
```

## Implementation

```python
def merge_sort(data):
    """Sorts a list with merge sort, returning a new sorted list."""
    if len(data) <= 1:
        return data
    mid = len(data) // 2
    left = merge_sort(data[:mid])
    right = merge_sort(data[mid:])
    return merge(left, right)


def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)))
}

function merge(left, right) {
  const result = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  return result.concat(left.slice(i), right.slice(j))
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(n log n) |
| Average  | O(n log n) |
| Worst    | O(n log n) |
| Space    | O(n) — auxiliary arrays for merging |

## When to use it

- When you need **guaranteed** O(n log n) behavior regardless of input.
- When **stability** is required (e.g. sorting by multiple keys).
- When sorting **linked lists** — merging links requires no random access.
- For **external sorting** (data too large for memory) via multi-way merges.

## When NOT to use it

- When memory is tight — the O(n) auxiliary space can be a dealbreaker.
- For small arrays — insertion sort’s constant factor wins.
- When stable ordering is not needed and you can tolerate Quick Sort’s variance.

## Common mistakes

- Merging with `left[i] < right[j]` instead of `<=`, breaking stability.
- Forgetting to copy the remaining tail of one half after the other runs out.
- Off-by-one errors in the middle index that cause infinite recursion.

## Related algorithms

- [Quick Sort](/algorithms/quick-sort) — faster in practice, but worst case O(n²).
- [Insertion Sort](/algorithms/insertion-sort) — often used for the base case.
- [Heap Sort](/algorithms/heap-sort) — O(n log n) with O(1) space but unstable.

## Practice problems

- Sort a linked list in O(n log n) time and O(1) space.
- Count the number of inversions in an array using a merge-sort-style divide and
  conquer.
- Sort an array, tracking the number of comparisons performed.
- [LeetCode · Sort an Array](https://leetcode.com/problems/sort-an-array/)
- [LeetCode · Reverse Pairs](https://leetcode.com/problems/reverse-pairs/)