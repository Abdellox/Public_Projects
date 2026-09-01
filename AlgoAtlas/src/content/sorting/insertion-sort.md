---
title: Insertion Sort
category: sorting
difficulty: beginner
short: Builds the sorted array one element at a time, inserting each new element into its proper place.
best: O(n)
average: O(n²)
worst: O(n²)
space: O(1)
stable: true
inPlace: true
visualizable: true
related: [bubble-sort, selection-sort, merge-sort]
tags: [comparison-sort, online]
---

## What problem does it solve?

Insertion Sort orders an array by maintaining a *sorted prefix* and growing it one
element at a time. Each new element is inserted into its correct position within
that prefix, shifting larger elements to the right to make room.

It behaves just like a human sorting a hand of cards: pick up a card, slide it into
the position where the rest of the hand stays sorted.

## How it works

1. Start with the first element — a single element is trivially sorted.
2. Take the next element (the *key*).
3. Compare it against elements to its left, shifting them right while they are
   larger than the key.
4. Insert the key into the gap that opens up.
5. Repeat for every remaining element.

Because it is **stable** and **adaptive**, it is often the fastest sort for small or
nearly sorted inputs.

## Step-by-step example

Sort `[5, 2, 4, 6, 1, 3]`:

| Step | Key | Shifted | Array |
| ---- | --- | ------- | ----- |
| 1    | 2   | 5 | `[2, 5, 4, 6, 1, 3]` |
| 2    | 4   | 5 | `[2, 4, 5, 6, 1, 3]` |
| 3    | 6   | none | `[2, 4, 5, 6, 1, 3]` |
| 4    | 1   | 6, 5, 4, 2 | `[1, 2, 4, 5, 6, 3]` |
| 5    | 3   | 6, 5, 4 | `[1, 2, 3, 4, 5, 6]` |

## Pseudocode

```text
procedure insertionSort(A):
    for i = 1 to length(A) - 1:
        key = A[i]
        j = i - 1
        while j >= 0 and A[j] > key:
            A[j + 1] = A[j]
            j = j - 1
        A[j + 1] = key
```

## Implementation

```python
def insertion_sort(data):
    """
    Sorts a list in place with insertion sort.
    Shifts elements right instead of swapping, which keeps it stable.
    """
    for i in range(1, len(data)):
        key = data[i]
        j = i - 1
        while j >= 0 and data[j] > key:
            data[j + 1] = data[j]
            j -= 1
        data[j + 1] = key
    return data
```

```javascript
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
  }
  return arr
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(n) — already sorted, no shifts |
| Average  | O(n²) |
| Worst    | O(n²) — reverse sorted |
| Space    | O(1) — in place |

## When to use it

- On **small** arrays (very fast in practice; low constant factor).
- On **nearly sorted** data — near the O(n) best case.
- When the data arrives **online** (one element at a time) and must stay sorted.
- As the base case inside Merge Sort / Quick Sort for small subarrays.

## When NOT to use it

- On large, unsorted inputs — O(n²) does not scale.
- When guaranteed O(n log n) behavior is required.

## Common mistakes

- Shifting left instead of right and overwriting the key before saving it.
- Writing `arr[j] > key` as `>= *`, which breaks stability (equal keys reorder).
- Off-by-one on the final insert position (`j + 1`).

## Related algorithms

- [Bubble Sort](/algorithms/bubble-sort) — the classic O(n²) alternative.
- [Selection Sort](/algorithms/selection-sort) — fewer swaps, but never adaptive.
- [Merge Sort](/algorithms/merge-sort) — uses Insertion Sort for small subarrays in
  many implementations.

## Practice problems

- Sort an array and count the number of shifts performed.
- Insert a new element into an already sorted array in O(n).
- Sort a nearly sorted array where each element is at most k positions away (O(nk)).
- Sort a stream of incoming numbers, keeping the output sorted.
- [LeetCode · Insertion Sort List](https://leetcode.com/problems/insertion-sort-list/)