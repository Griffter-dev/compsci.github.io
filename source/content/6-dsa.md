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

### QUIZ
Q: Consider the following function.
PTS: 1
```python
def mystery(n):
    count = 0
    i = 1
    while i < n:
        i *= 2
        count += 1
    return count
```
ASK: Which of the following best describes the running time of `mystery(n)`?
- [ ] O(1)
- [x] O(log n)
- [ ] O(n)
- [ ] O(n²)
WHY: i doubles every pass, so the loop runs about log₂ n times. For n = 1,000,000 that's only 20 passes.

Q: Consider the following code segment.
PTS: 1
```python
total = 0
for i in range(n):
    for j in range(i, n):
        total += 1
```
ASK: What is the value of `total` when `n` is 5, and what is the Big-O running time?
- [ ] 25, O(n²)
- [x] 15, O(n²)
- [ ] 15, O(n)
- [ ] 10, O(n log n)
WHY: The inner loop runs 5 + 4 + 3 + 2 + 1 = 15 times. In general that's n(n + 1)/2, which grows like n², so it's O(n²) even though it's about half of n².

Q: Which of the following operations take O(1) time on a Python list of length n?
PTS: 1
OPT I: `lst[n // 2]`
OPT II: `lst.append(x)` (on average)
OPT III: `lst.insert(0, x)`
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: Lists are arrays, so jumping to an index is instant and adding at the end is usually instant. Inserting at the front shifts every item right, which is O(n).

Q: Algorithm A takes 100n steps and algorithm B takes n² steps. Which statement is true?
PTS: 1
- [ ] A is always faster.
- [ ] B is always faster.
- [x] B is faster for n < 100, but A is faster for n > 100.
- [ ] They are always the same speed.
WHY: They're equal at n = 100. Below that, n² is smaller; above it, the O(n) algorithm wins. Big-O describes what happens for large inputs.


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

### QUIZ
Q: Consider the following code segment, where `stack` is a Python list used as a stack.
PTS: 1
```python
stack = []
for x in [3, 1, 4, 1, 5]:
    if x > 2:
        stack.append(x)
    elif stack:
        stack.pop()
print(stack)
```
ASK: What is printed as a result of executing the code segment?
- [ ] [3, 4, 5]
- [x] [5]
- [ ] [3, 5]
- [ ] []
WHY: Push 3 → [3]. 1 pops → []. Push 4 → [4]. 1 pops → []. Push 5 → [5].

Q: Which of the following use a queue (first in, first out)?
PTS: 1
OPT I: A printer printing jobs in the order they were sent
OPT II: The "undo" button in a text editor
OPT III: Breadth-first search of a graph
- [ ] I only
- [x] I and III only
- [ ] II and III only
- [ ] I, II and III
WHY: Undo reverses the **most recent** action first, so it's a stack. Printing in order and BFS both handle the oldest item first.

Q: Consider the following linked list code.
PTS: 1
```python
class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt

head = Node(1, Node(2, Node(3)))
head.next = head.next.next
node = head
out = []
while node:
    out.append(node.val)
    node = node.next
print(out)
```
ASK: What is printed as a result of executing the code segment?
- [ ] [1, 2, 3]
- [x] [1, 3]
- [ ] [2, 3]
- [ ] [1]
WHY: `head.next = head.next.next` makes node 1 point straight to node 3, which removes node 2 from the list.

Q: Using the stack algorithm for matching brackets, which of the following strings are balanced?
PTS: 1
OPT I: `([]{})`
OPT II: `([)]`
OPT III: `((()`
- [x] I only
- [ ] I and II only
- [ ] II only
- [ ] I and III only
WHY: In II, `)` arrives when the top of the stack is `[`, so they don't match. III ends with two `(` still on the stack.


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

### QUIZ
Q: The values 50, 30, 70, 20, 40, 60 are inserted in that order into an empty binary search tree. What is printed by an **in-order** traversal?
PTS: 1
- [ ] 50 30 20 40 70 60
- [x] 20 30 40 50 60 70
- [ ] 20 40 30 60 70 50
- [ ] 50 30 70 20 40 60
WHY: An in-order traversal of a BST always visits the values in sorted order. The first choice is pre-order and the third is post-order.

Q: Which of the following are true about a binary search tree with n nodes?
PTS: 1
OPT I: If the tree is balanced, searching takes O(log n) time.
OPT II: If values are inserted already sorted, the tree becomes a long chain and searching takes O(n).
OPT III: The smallest value is always the root.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: The smallest value is the leftmost node, not the root. Inserting sorted data makes every new node a right child, so the tree turns into a linked list.

Q: A hash table has 7 buckets and uses `hash(k) = k % 7`. The keys 10, 17, 3 and 24 are inserted using chaining. How many keys end up in bucket 3?
PTS: 1
- [ ] 1
- [ ] 2
- [ ] 3
- [x] 4
WHY: 10 % 7 = 3, 17 % 7 = 3, 3 % 7 = 3 and 24 % 7 = 3. All four collide, which shows why a good hash function spreads keys out.

Q: Consider the following function.
PTS: 1
```python
def has_pair(nums, target):
    seen = set()
    for n in nums:
        if target - n in seen:
            return True
        seen.add(n)
    return False
```
ASK: Which best describes the running time, assuming set operations take O(1) on average?
- [ ] O(1)
- [ ] O(log n)
- [x] O(n)
- [ ] O(n²)
WHY: It visits each number once and does constant work per number. Checking every pair with two loops would be O(n²).


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

### LESSON Quick sort and choosing a sort | 10 | Algorithms
**Quick sort** picks a **pivot**, puts smaller values on its left and larger values on its right, then sorts each side the same way.

```python run
def quick_sort(lst):
    if len(lst) <= 1:
        return lst
    pivot = lst[0]
    smaller = [x for x in lst[1:] if x < pivot]
    larger = [x for x in lst[1:] if x >= pivot]
    return quick_sort(smaller) + [pivot] + quick_sort(larger)

print(quick_sort([5, 2, 9, 1, 5, 6]))
```

- Average: **O(n log n)**, and usually the fastest in practice.
- Worst case: **O(n²)**, when the pivot is always the smallest or largest value. With the first element as the pivot, already-sorted input causes this.
- Picking a random pivot (or the middle of three values) makes the worst case very unlikely.

### Which sort when?
| Sort | Best | Average | Worst | Extra memory | Stable? |
|---|---|---|---|---|---|
| Selection | n² | n² | n² | O(1) | No |
| Insertion | **n** | n² | n² | O(1) | Yes |
| Merge | n log n | n log n | n log n | O(n) | Yes |
| Quick | n log n | n log n | n² | O(log n) | No |

Insertion sort is great for **nearly sorted** or tiny lists. Python's built-in `sorted()` uses Timsort, a mix of merge and insertion sort.

### QUIZ
Q: Consider the following recursive function.
PTS: 1
```python
def f(n):
    if n <= 1:
        return 1
    return f(n - 1) + f(n - 2)

print(f(5))
```
ASK: What is printed as a result of executing the code segment?
- [ ] 5
- [x] 8
- [ ] 13
- [ ] 3
WHY: f(0) = f(1) = 1, f(2) = 2, f(3) = 3, f(4) = 5 and f(5) = 8. Without memoization this makes O(2ⁿ) calls.

Q: The list `[4, 1, 3, 2]` is sorted with selection sort, which swaps the smallest remaining value into place on each pass. What does the list look like after the **first two** passes?
PTS: 1
- [ ] [1, 4, 3, 2]
- [x] [1, 2, 3, 4]
- [ ] [1, 3, 4, 2]
- [ ] [1, 2, 4, 3]
WHY: Pass 1 swaps 1 to the front: [1, 4, 3, 2]. Pass 2 finds 2 and swaps it with 4: [1, 2, 3, 4]. It happens to be sorted already, but selection sort would still do one more pass to check.

Q: Which sorting algorithms run in O(n) time when the input is already sorted?
PTS: 1
OPT I: Insertion sort
OPT II: Selection sort
OPT III: Merge sort
- [x] I only
- [ ] I and III only
- [ ] II and III only
- [ ] I, II and III
WHY: Insertion sort only compares each item to the one before it when nothing needs to move. Selection sort still scans everything, and merge sort still splits and merges, O(n log n).

Q: Consider the following function, which is intended to return the index of `target` in the sorted list `lst`, or -1 if it isn't there.
PTS: 1
```python
def search(lst, target):
    lo, hi = 0, len(lst) - 1
    while /* missing code */:
        mid = (lo + hi) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```
ASK: Which of the following can replace `/* missing code */` so the function works as intended?
- [ ] `lo < hi`
- [x] `lo <= hi`
- [ ] `lo != hi`
- [ ] `mid < hi`
WHY: When lo and hi are equal there is still one item left to check. With `lo < hi`, `search([7], 7)` would never check index 0 and would return -1.

## UNIT ds5 | Heaps & Priority Queues
### LESSON Binary heaps | 11 | Data structures
A **priority queue** always gives you the item with the highest priority (or the smallest value) next, not the oldest. The usual way to build one is a **binary heap**.

A **min-heap** is a complete binary tree where every parent is **≤** its children. So the smallest value is always at the root.

### Stored in a list
A heap fits neatly in a list with no gaps. For the item at index `i`:
- left child is at `2i + 1`
- right child is at `2i + 2`
- parent is at `(i - 1) // 2`

```text
        1              index:  0  1  2  3  4  5
      /   \            value: [1, 3, 2, 7, 4, 5]
     3     2
    / \   /
   7   4 5
```

### Operations
- **Push:** put the new item at the end, then **sift up** (swap with its parent while it's smaller). O(log n).
- **Pop:** take the root, move the last item to the root, then **sift down** (swap with the smaller child). O(log n).
- **Peek:** look at the root. O(1).

### Python's heapq
```python run
import heapq
h = []
for x in [5, 1, 8, 3, 2]:
    heapq.heappush(h, x)
print(h[0])                          # 1, the smallest
print([heapq.heappop(h) for _ in range(3)])   # [1, 2, 3]
print(heapq.nlargest(2, [5, 1, 8, 3]))         # [8, 5]
```

Uses: scheduling the next task, finding the k largest items, merging sorted lists, and Dijkstra's shortest-path algorithm. **Heap sort** pushes everything and pops it all back out in O(n log n).

### QUIZ
Q: A min-heap is stored in the list `[2, 5, 3, 9, 6, 8]`. What are the children of the value 5?
PTS: 1
- [ ] 3 and 9
- [x] 9 and 6
- [ ] 6 and 8
- [ ] 2 and 3
WHY: 5 is at index 1. Its children are at 2(1) + 1 = 3 and 2(1) + 2 = 4, which hold 9 and 6.

Q: Consider the following code segment.
PTS: 1
```python
import heapq
h = [4, 7, 9]
heapq.heappush(h, 1)
heapq.heappush(h, 6)
heapq.heappop(h)
print(h[0])
```
ASK: What is printed as a result of executing the code segment?
- [ ] 1
- [x] 4
- [ ] 6
- [ ] 9
WHY: After pushing, the smallest is 1. Popping removes it, so the new smallest value, 4, is at the root.

Q: Which of the following are true about a binary min-heap with n items?
PTS: 1
OPT I: The smallest item can be found in O(1) time.
OPT II: Searching for an arbitrary value takes O(log n) time.
OPT III: Removing the smallest item takes O(log n) time.
- [ ] I only
- [x] I and III only
- [ ] II and III only
- [ ] I, II and III
WHY: A heap only promises parent ≤ child, not left < right like a BST. To find an arbitrary value you might have to check every node, which is O(n).

Q: A program needs to repeatedly find and remove the task with the earliest deadline while new tasks keep arriving. Which data structure is the best fit?
- [ ] A stack
- [ ] An unsorted list
- [x] A min-heap keyed on deadline
- [ ] A queue
WHY: The heap gives O(log n) push and pop of the minimum. An unsorted list would need an O(n) scan every time.

## UNIT ds6 | Graphs
### LESSON Representing graphs | 10 | Data structures
A **graph** is a set of **vertices** (nodes) joined by **edges**. Maps, social networks and web links are all graphs.
- **Directed** edges go one way (A follows B). **Undirected** edges go both ways (A is friends with B).
- **Weighted** edges have a cost, like distance or time.

### Adjacency list vs. matrix
```python run
# Adjacency list: each vertex maps to its neighbors
graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D"],
    "D": [],
}
print(graph["A"])
```

| | Adjacency list | Adjacency matrix |
|---|---|---|
| Memory | O(V + E) | O(V²) |
| "Is there an edge A→B?" | O(degree) | O(1) |
| Best for | Sparse graphs (most real ones) | Dense graphs |

### LESSON BFS, DFS and shortest paths | 13 | Algorithms
### Breadth-first search (BFS)
BFS explores **level by level** using a **queue**. In an unweighted graph it finds the path with the **fewest edges**.

```python run
from collections import deque

def bfs(graph, start):
    seen = {start}
    order = []
    q = deque([start])
    while q:
        v = q.popleft()
        order.append(v)
        for n in graph[v]:
            if n not in seen:
                seen.add(n)
                q.append(n)
    return order

g = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": [], "E": []}
print(bfs(g, "A"))    # ['A', 'B', 'C', 'D', 'E']
```

### Depth-first search (DFS)
DFS goes as **deep** as it can before backing up. It uses a **stack** or recursion. It's good for detecting cycles, solving mazes and finding connected pieces.

```python run
def dfs(graph, v, seen=None):
    if seen is None:
        seen = []
    seen.append(v)
    for n in graph[v]:
        if n not in seen:
            dfs(graph, n, seen)
    return seen

g = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": [], "E": []}
print(dfs(g, "A"))    # ['A', 'B', 'D', 'C', 'E']
```

Both BFS and DFS run in **O(V + E)** time.

### Dijkstra's algorithm
For **weighted** graphs with no negative edges, **Dijkstra's algorithm** finds the cheapest path. It keeps a min-heap of (distance, vertex) and always expands the closest unvisited vertex next. Time: O((V + E) log V). Maps apps use ideas like this.

### QUIZ
Q: Consider the following directed graph, stored as an adjacency list.
PTS: 1
```python
g = {"S": ["A", "B"], "A": ["C"], "B": ["C", "D"], "C": ["E"], "D": ["E"], "E": []}
```
ASK: Which of the following is the order vertices are visited by BFS starting at "S", visiting neighbors in the order listed?
- [x] S A B C D E
- [ ] S A C E B D
- [ ] S B D E A C
- [ ] S A B C E D
WHY: BFS visits all of S's neighbors (A, B) first, then their unvisited neighbors (C from A, D from B), then E. S A C E B D is the DFS order.

Q: Which of the following statements about BFS and DFS are true?
PTS: 1
OPT I: BFS uses a queue and DFS uses a stack (or recursion).
OPT II: In an unweighted graph, BFS finds a path with the fewest edges.
OPT III: DFS always finds the shortest path in a weighted graph.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: DFS may wander down a long path first, so it doesn't guarantee the shortest path. Weighted shortest paths need an algorithm like Dijkstra's.

Q: A graph has 1,000 vertices, and each vertex has about 4 edges. Which representation uses less memory?
PTS: 1
- [x] An adjacency list
- [ ] An adjacency matrix
- [ ] They use the same amount of memory.
- [ ] Neither can store this graph.
WHY: A matrix always needs 1,000 × 1,000 = 1,000,000 cells. The list stores only about 4,000 edges.

Q: An undirected weighted graph has these edges: A–B costs 1, B–D costs 1, A–C costs 4, C–D costs 1 and B–C costs 5. What is the cost of the cheapest path from A to D?
PTS: 1
- [x] 2
- [ ] 5
- [ ] 3
- [ ] 6
WHY: A → B → D costs 1 + 1 = 2. A → C → D costs 4 + 1 = 5. Dijkstra's algorithm would settle B first (distance 1) and then reach D at distance 2.

