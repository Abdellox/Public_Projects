---
title: Linear Search
category: searching
difficulty: beginner
short: Scans every element from left to right until the target is found.
best: O(1)
average: O(n)
worst: O(n)
space: O(1)
stable: true
inPlace: true
visualizable: false
related: [binary-search]
tags: [sequential-search, unsorted]
---

## What problem does it solve?

Linear Search finds the position of a target value in a collection by visiting
elements one by one from the start until a match is found (or the end is reached).

It works on **unsorted data** and on any data structure that supports sequential
iteration — arrays, linked lists, streams, etc. Unlike Binary Search it needs no
preprocessing and no random access.

## How it works

1. Start at the first element.
2. Compare it with the target.
3. Match → return the current index.
4. Otherwise move to the next element.
5. If the end is reached without a match, report that the target is absent.

If the target appears multiple times, Linear Search (in its basic form) returns the
**first** occurrence.

## Step-by-step example

Find `7` in `[4, 2, 7, 1, 9]`:

```text
index 0: 4 == 7? no
index 1: 2 == 7? no
index 2: 7 == 7? yes -> return 2
```

Find `5` in `[4, 2, 7, 1, 9]`:

```text
4, 2, 7, 1, 9 all checked, none equal 5 -> not found
```

## Pseudocode

```text
procedure linearSearch(A, target):
    for i = 0 to length(A) - 1:
        if A[i] == target:
            return i
    return -1
```

## Implementation

```python
def linear_search(data, target):
    """Returns the index of target, or -1 if not present."""
    for i, value in enumerate(data):
        if value == target:
            return i
    return -1
```

```javascript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1
}
```

## Complexity

| Case     | Complexity |
| -------- | ---------- |
| Best     | O(1) — target is the first element |
| Average  | O(n) — expected n/2 comparisons |
| Worst    | O(n) — target missing or last |
| Space    | O(1) — a single index variable |

## When to use it

- Search through **unsorted** data (Binary Search is impossible).
- Data arrives via a **stream** you can only read once.
- The collection is **small**, so O(n) is effectively O(1).
- When the target is likely to be **near the start** of the data.

## When NOT to use it

- Large collections where lookups are frequent — sort once, then Binary Search.
- Realtime or latency-sensitive code where O(1) or O(log n) is required.
- When you have repeated queries over a static dataset — build a hash table.

## Common mistakes

- Returning the wrong value when the target is missing (e.g. returning the
  collection length instead of −1).
- Searching past the collection bounds in manual loops.
- Missing the **first** occurrence when duplicates exist and you need exactly that
  one.

## Related algorithms

- [Binary Search](/algorithms/binary-search) — requires a sorted array but runs in
  O(log n).

## Practice problems

- Find the first and last occurrence of a value in an unsorted array.
- Count how many comparisons a linear search performs.
- Search for a substring start in an array of characters.
- Implement linear search over a linked list.
- [LeetCode · Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)