# COURSE dsa | Data Structures & Algorithms | Post-AP | 🌲 | 4 | Senior | #14b8a6
> Post-AP data structures and algorithms: Big-O, linked lists, stacks, queues, trees, hashing, sorting and recursion. These are the topics behind college CS2 courses and technical interviews.

## UNIT ds1 | Big-O & Efficiency

### LESSON Measuring how algorithms scale | 12
**Big-O** describes how the number of steps an algorithm takes **grows** as the input size *n* grows. It ignores constants and focuses on the worst case.

| Big-O | Name | Example |
|---|---|---|
| O(1) | constant | getting `arr[i]` |
| O(log n) | logarithmic | binary search |
| O(n) | linear | one loop through the data |
| O(n log n) | linearithmic | merge sort |
| O(n²) | quadratic | nested loops over the data |
| O(2ⁿ) | exponential | trying every subset |

### Rules of thumb
- **Drop constants and smaller terms:** O(3n + 100) becomes **O(n)**, and O(n² + n) becomes **O(n²)**.
- **Steps one after another add up:** O(n) + O(n) = O(n).
- **Nested loops multiply:** O(n) × O(n) = O(n²).
- **Halving each time means log n:** if a loop divides n by 2 each pass, it's O(log n).

```python
i = 1
while i < n:      # i = 1, 2, 4, 8, ... → about log₂(n) passes
    i *= 2
```

### Space complexity
Big-O also measures **memory**. Making a copy of the input uses O(n) space, while a few variables use O(1).

> For n = 1,000,000: O(log n) is about 20 steps, O(n) is a million, and O(n²) is a **trillion**.

### QUIZ
Q: What is the Big-O of a loop where `i` **doubles** each time until it reaches n?
- [ ] O(n)
- [x] O(log n)
- [ ] O(n²)
- [ ] O(1)
WHY: Doubling reaches n after about log₂(n) steps.

Q: Two nested loops each run n times. What is the Big-O?
- [ ] O(2n)
- [ ] O(n)
- [x] O(n²)
- [ ] O(log n)
WHY: The inner loop runs n times for each of the outer loop's n passes, so n × n.

Q: Simplify O(3n + 100).
- [x] O(n)
- [ ] O(3n)
- [ ] O(100)
- [ ] O(n + 100)
WHY: Big-O drops constant factors and smaller terms.

Q: Which grows the fastest as n gets large?
- [ ] n²
- [ ] n log n
- [x] 2ⁿ
- [ ] n³
WHY: Exponential growth beats any polynomial eventually.

Q: What is the Big-O of getting `arr[500]` from an array?
- [x] O(1)
- [ ] O(n)
- [ ] O(log n)
- [ ] O(500)
WHY: Arrays jump straight to any index in constant time.

### TRACE
Q: What does `f(32)` return?
```python
def f(n):
    count = 0
    i = n
    while i > 1:
        i //= 2
        count += 1
    return count
```
- [ ] 16
- [x] 5
- [ ] 6
- [ ] 32
WHY: i goes 32 → 16 → 8 → 4 → 2 → 1, which is 5 halvings. The function computes log₂(n).

Q: What is the Big-O of this function?
```python
def has_pair_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return True
    return False
```
- [ ] O(n)
- [x] O(n²)
- [ ] O(n log n)
- [ ] O(1)
WHY: The nested loops check about n²/2 pairs, and dropping the ½ gives O(n²). Using a set brings this down to O(n).

## UNIT ds2 | Linked Lists, Stacks & Queues

### LESSON Linked lists | 11
A **linked list** is a chain of **nodes**. Each node holds a value and a reference to the **next** node.

```python
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

# 3 → 7 → 9
head = Node(3)
head.next = Node(7)
head.next.next = Node(9)
```

### Traversal
```python
cur = head
while cur is not None:
    print(cur.val)
    cur = cur.next
```

| Operation | Array | Linked list |
|---|---|---|
| Get the k-th item | O(1) | O(k) |
| Insert at the front | O(n) (shift everything) | **O(1)** |
| Insert after a known node | O(n) | **O(1)** |

### LESSON Stacks and queues | 10
### Stack: LIFO (last in, first out)
Think of a stack of plates.
```python
stack = []
stack.append("a")   # push
stack.pop()         # pop → the newest item
```

Stacks are used for undo buttons, the browser back button, the **function call stack**, checking balanced parentheses and depth-first search (DFS).

### Queue: FIFO (first in, first out)
Think of a lunch line.
```python
from collections import deque
q = deque()
q.append("a")       # enqueue at the back
q.popleft()         # dequeue from the front
```

Queues are used for printer jobs, task scheduling and **breadth-first search** (BFS).

> Use `deque` for queues in Python. `list.pop(0)` is O(n) because it shifts everything left.

### QUIZ
Q: Which data structure is LIFO?
- [x] Stack
- [ ] Queue
- [ ] Linked list
- [ ] Hash table
WHY: Last in, first out: the most recently added item comes out first.

Q: Which data structure fits a printer that handles jobs in the order they arrive?
- [ ] Stack
- [x] Queue
- [ ] Binary tree
- [ ] Set
WHY: First come, first served is FIFO, which is a queue.

Q: What is the time to insert at the **front** of a singly linked list?
- [x] O(1)
- [ ] O(n)
- [ ] O(log n)
- [ ] O(n²)
WHY: Create a node, point it at the old head, and update head. No shifting is needed.

Q: What is the time to get the k-th element of a linked list?
- [ ] O(1)
- [x] O(k)
- [ ] O(log k)
- [ ] O(1) if the list is sorted
WHY: You must follow k `next` pointers from the head. Linked lists don't allow random access.

Q: Which data structure checks whether brackets like `{[()]}` are balanced?
- [x] Stack
- [ ] Queue
- [ ] Array sorted first
- [ ] Hash table
WHY: Push each opening bracket. Each closing bracket must match the item on top of the stack.

### TRACE
Q: What is printed?
```python
stack = []
for ch in "abc":
    stack.append(ch)
stack.pop()
stack.append("d")
print("".join(stack))
```
- [ ] abcd
- [x] abd
- [ ] dab
- [ ] bcd
WHY: The stack becomes [a, b, c], `pop` removes c, and then d is pushed, giving [a, b, d].

Q: What is printed?
```python
from collections import deque
q = deque([1, 2, 3])
q.append(q.popleft())
q.append(q.popleft() * 10)
print(list(q))
```
- [ ] [1, 2, 3]
- [x] [3, 1, 20]
- [ ] [20, 1, 3]
- [ ] [3, 10, 20]
WHY: The 1 moves to the back, giving [2, 3, 1]. Then the 2 comes off the front, and 2 × 10 = 20 goes on the back, giving [3, 1, 20].

### BUG
Q: `length(None)` crashes, and `length` of a 3-node list returns 2. Click the bug.
```python
def length(head):
    count = 0
    cur = head
    while cur.next is not None:
        count += 1
        cur = cur.next
    return count
```
LINE: 4
FIX: while cur is not None:
WHY: Checking `cur.next` stops one node early and crashes when `cur` is None. Check `cur` itself.

## UNIT ds3 | Trees & Hash Tables

### LESSON Binary search trees | 12
A **binary tree** node has at most two children, **left** and **right**. The top node is the **root**, and nodes with no children are **leaves**.

### The BST property
In a **binary search tree** (BST), everything in a node's **left** subtree is smaller than the node, and everything in its **right** subtree is larger.

```
        50
       /  \
     30    70
    /  \   /
  20   40 60
```

Searching, inserting and deleting in a **balanced** tree take **O(log n)** time. If you insert values that are already sorted, the tree becomes a "linked list" shape and those operations slow down to **O(n)**.

### Traversals
- **In-order** (left, node, right): 20 30 40 50 60 70. This gives **sorted order**.
- **Pre-order** (node, left, right): 50 30 20 40 70 60. Use it to copy a tree.
- **Post-order** (left, right, node): 20 40 30 60 70 50. Use it to delete a tree.
- **Level-order** visits each level from left to right, using a queue (BFS).

### LESSON Hash tables | 10
A **hash table** uses a **hash function** to turn a key into an array index. Python's `dict` and `set`, and Java's `HashMap`, are hash tables.

```python
ages = {"ada": 36, "alan": 41}
ages["grace"] = 85      # insert: average O(1)
"ada" in ages           # lookup: average O(1)
```

### Collisions
A **collision** happens when two keys hash to the same index. There are two common fixes:
- **Chaining:** each slot holds a small list of entries.
- **Open addressing:** probe for the next open slot.

If the table gets too full, it **resizes** (rehashes everything) to keep operations fast. The worst case is O(n), but with a good hash function the average is O(1).

> **Interview trick:** many O(n²) "check all pairs" problems become O(n) with a set or dict.

### QUIZ
Q: Which traversal of a BST visits the values in sorted order?
- [ ] Pre-order
- [x] In-order
- [ ] Post-order
- [ ] Level-order
WHY: In-order visits the left subtree, then the node, then the right subtree, which gives smallest to largest.

Q: You insert 1, 2, 3, 4, 5 (in that order) into an empty BST. What shape does the tree have?
- [ ] Perfectly balanced
- [x] A straight line to the right, so searches take O(n)
- [ ] A straight line to the left
- [ ] Impossible to tell
WHY: Each new value is larger than everything before it, so it always goes right. The tree degenerates into a list.

Q: What is a hash collision?
- [ ] A hash function that crashes
- [x] Two different keys mapping to the same index
- [ ] Two equal keys
- [ ] A full table
WHY: Collisions are unavoidable. Chaining and probing are the standard fixes.

Q: What is the average time for `x in my_set` in Python?
- [x] O(1)
- [ ] O(n)
- [ ] O(log n)
- [ ] O(n²)
WHY: Sets are hash tables, so lookups take constant time on average.

Q: A balanced BST holds about 1,000,000 nodes. About how tall is it?
- [ ] 1,000
- [x] 20
- [ ] 500,000
- [ ] 1,000,000
WHY: The height of a balanced tree is about log₂(1,000,000), which is roughly 20.

### TRACE
Q: You insert 50, 30, 70, 20, 40, 60 into an empty BST in that order. What is the **pre-order** traversal?
```
insert: 50, 30, 70, 20, 40, 60
```
- [ ] 20 30 40 50 60 70
- [x] 50 30 20 40 70 60
- [ ] 20 40 30 60 70 50
- [ ] 50 30 70 20 40 60
WHY: Pre-order visits the node, then the left subtree, then the right subtree: 50, then 30 → 20 → 40, then 70 → 60.

Q: What is printed?
```python
counts = {}
for w in "the cat and the hat".split():
    counts[w] = counts.get(w, 0) + 1
print(counts["the"], len(counts))
```
- [ ] 1 5
- [x] 2 4
- [ ] 2 5
- [ ] 1 4
WHY: "the" appears twice. The unique words are the, cat, and, hat, so there are 4 keys.

### BUG
Q: `bst_search` can't find values that are in the tree. Click the bug.
```python
def bst_search(node, target):
    if node is None:
        return False
    if target == node.val:
        return True
    if target < node.val:
        return bst_search(node.right, target)
    return bst_search(node.left, target)
```
LINE: 7, 8
FIX: return bst_search(node.left, target)   # smaller values are on the LEFT
WHY: The directions are swapped. Smaller targets should go **left** and larger targets should go **right**.

## UNIT ds4 | Sorting, Searching & Recursion

### LESSON Sorting algorithms compared | 12
| Algorithm | Best | Average | Worst | Notes |
|---|---|---|---|---|
| Selection | O(n²) | O(n²) | O(n²) | simple, few swaps |
| Insertion | **O(n)** | O(n²) | O(n²) | great for nearly sorted data |
| Merge | O(n log n) | O(n log n) | O(n log n) | stable; needs O(n) extra space |
| Quick | O(n log n) | O(n log n) | **O(n²)** | fast in practice; the pivot choice matters |

### Merge sort
1. Split the array in half.
2. Recursively sort each half.
3. **Merge** the two sorted halves.

There are about log n levels of splitting, and each level does O(n) work to merge, so the total is **O(n log n)**.

### Stability
A **stable** sort keeps items that compare as equal in their original order. This matters when you sort by one field after another.

### Binary search (iterative)
```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        if arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1
```

### LESSON Recursion and memoization | 11
Every recursive function needs:
1. A **base case** that stops the recursion.
2. A **recursive case** that moves toward the base case.

Each call gets a new frame on the **call stack**. If the recursion goes too deep, you get a stack overflow.

### Memoization
Naive recursive Fibonacci recomputes the same values again and again, which takes **O(2ⁿ)** time. **Memoization** caches the answers, which brings it down to **O(n)**.

```python
memo = {}
def fib(n):
    if n < 2: return n
    if n not in memo:
        memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]
```

This is the core idea behind **dynamic programming**.

### QUIZ
Q: What is merge sort's worst-case time?
- [ ] O(n²)
- [x] O(n log n)
- [ ] O(n)
- [ ] O(log n)
WHY: Merge sort always splits evenly, so it's O(n log n) in every case.

Q: When does quicksort hit its O(n²) worst case?
- [ ] On random data
- [x] When it keeps picking bad pivots (like the first item of an already sorted array)
- [ ] When n is small
- [ ] Never
WHY: Bad pivots create very lopsided splits, so you get n levels instead of log n.

Q: Which sort is fastest on an **almost sorted** array?
- [ ] Selection sort
- [x] Insertion sort
- [ ] Merge sort, always
- [ ] They're all the same
WHY: Insertion sort does very little work when items are already close to their final positions, approaching O(n).

Q: What does memoization do for recursive Fibonacci?
- [ ] Nothing
- [x] Turns exponential time into linear time by caching results
- [ ] Makes it use less memory
- [ ] Removes the need for a base case
WHY: Each fib(k) is computed only once and then reused.

Q: What does it mean for a sort to be **stable**?
- [ ] It never crashes
- [x] Items with equal keys stay in their original relative order
- [ ] It always takes the same amount of time
- [ ] It sorts in place
WHY: Stability matters when you sort by multiple fields, for example by grade, then by name.

### TRACE
Q: What does `fib(7)` return?
```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(7))
```
- [ ] 8
- [x] 13
- [ ] 21
- [ ] 7
WHY: The sequence goes 0, 1, 1, 2, 3, 5, 8, 13, so fib(7) = 13.

Q: Binary search looks for 23 in this list. How many elements does it check?
```python
arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
# lo=0, hi=9 to start; mid = (lo + hi) // 2
```
- [ ] 1
- [ ] 2
- [x] 3
- [ ] 6
WHY: It checks index 4 (16, too small), then index 7 (56, too big), then index 5 (23, found). That's 3 checks.

### BUG
Q: This binary search can't find the target when the search range shrinks to a single item. Click the bug.
```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```
LINE: 3
FIX: while lo <= hi:
WHY: When `lo == hi`, one item is still left to check. `<` skips it, so for example `binary_search([7], 7)` returns −1.
