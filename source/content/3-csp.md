# COURSE csp | AP CS Principles | AP CSP | 🌐 | 2 | Sophomore | #10b981
> All 5 Big Ideas of AP CSP, following the College Board Course and Exam Description (topics 1.1–5.6). The exam is 70 multiple-choice questions in 2 hours (70% of your score, including 8 "select two answers" questions and 5 with a reading passage), plus the Create performance task and 2 written-response questions about it (30%). Uses the AP exam's pseudocode.

## UNIT csp1 | Big Idea 1: Creative Development | 10–13%
### LESSON Collaboration, design and program purpose | 9
**Exam weight: 10–13%.** This Big Idea covers *how* programs get made.

### Collaboration
Teams with **diverse perspectives** build better software. They catch more bugs and reduce **bias** in the design. Pair programming, giving feedback and getting input from users are all forms of collaboration.

### Purpose vs. function
- A program's **purpose** is the problem it solves or the creative goal behind it ("help students study").
- Its **function** is how it behaves when it runs: its inputs, its behavior and its outputs.

### The development process
Programs are usually built **iteratively**: investigate the problem, design, prototype, test, refine, and repeat. Writing down **requirements** first keeps everyone aligned.

**Program inputs** come from users (taps, typing), sensors or other programs. **Event-driven** programs run code when an *event* happens, like a key press or a click.

### Documentation
**Comments** and other documentation explain what the code does and why. This helps teammates, and future you. Always **give credit** for code you didn't write.

### LESSON Finding and fixing errors | 8
| Error | What happens | Example |
|---|---|---|
| **Syntax** | Code breaks the language's rules, so it won't run | a missing bracket |
| **Runtime** | It crashes *while running* | dividing by zero |
| **Logic** | It runs but gives the **wrong answer** | `sum / 2` instead of `sum / LENGTH(list)` |
| **Overflow** | A number is too big for the space it's stored in | adding 1 to the max int |

### Debugging strategies
- Add **output statements** (DISPLAY) to check values as the program runs.
- **Hand-trace** the code with a table of variable values.
- Use **test cases**, including **boundary values** at and just past the edges of the valid input (0, −1, the maximum).
- Use visualizations and debuggers.

> **Exam trap:** Testing can show that a program *has* errors. It can't prove that a program has *no* errors.

### QUIZ
Q: A program runs without crashing but calculates the wrong average. What kind of error is this?
- [ ] Syntax error
- [ ] Runtime error
- [x] Logic error
- [ ] Overflow error
WHY: The code is valid and doesn't crash, but the result is wrong. That makes it a **logic** error.

Q: A program accepts ages from 0 to 120. Which set of test inputs is best?
- [ ] 20, 30, 40
- [x] −1, 0, 120, 121
- [ ] 50 only
- [ ] 1, 2, 3
WHY: Test **boundary values** at and just beyond the edges of the valid range. That's where bugs usually hide.

Q: What is the main benefit of collaborating with people from diverse backgrounds?
- [ ] The program runs faster
- [x] Different perspectives help catch bias and improve the design
- [ ] Less documentation is needed
- [ ] Testing is no longer required
WHY: Diverse teams think of more users and edge cases, which reduces bias in the finished program.

Q: Why should programmers document their code with comments?
- [ ] Comments make code run faster
- [x] They explain how and why the code works, which helps others maintain it
- [ ] The computer needs them to run the program
- [ ] To hide how the code works
WHY: Comments are ignored by the computer. They help **people** understand the code, and they're also where you credit code from other sources.

Q: A program adds 1 to the largest number a variable can hold and gets a strange result. What is this called?
- [ ] Rounding error
- [x] Overflow error
- [ ] Syntax error
- [ ] Logic error
WHY: When a value goes past the range a fixed number of bits can store, an **overflow** happens.

### TRACE
Q: What is displayed?
```pseudo
x ← 3
y ← x
x ← 10
DISPLAY(y)
```
- [x] 3
- [ ] 10
- [ ] 13
- [ ] x
WHY: `y ← x` copies the **value** 3 into y. Changing x afterward doesn't change y.

### BUG
Q: This is supposed to display the average of `nums`. Click the line with the logic error.
```pseudo
// find the average of the list nums
sum ← 0
FOR EACH n IN nums
{
   sum ← sum + n
}
avg ← sum / 2
DISPLAY(avg)
```
LINE: 7
FIX: avg ← sum / LENGTH(nums)
WHY: Dividing by 2 only works for a list with exactly two items. Divide by `LENGTH(nums)`.

### QUIZ
Q: A team of students is building an app. Which of the following are benefits of collaborating with people who have different backgrounds?
PTS: 1
OPT I: The team is more likely to notice ways the app could be biased or hard to use for some people.
OPT II: Different points of view can lead to more creative solutions.
OPT III: Collaboration guarantees the program will have no errors.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: Diverse teams catch more problems and generate more ideas (topic 1.1). Nothing guarantees a program has no errors, so III is false.

Q: A programmer wrote the following procedure, which is intended to return the number of values in `numList` that are greater than `target`.
PTS: 1
```pseudo
PROCEDURE countAbove(numList, target)
{
   count ← 0
   FOR EACH num IN numList
   {
      IF (num ≥ target)
      {
         count ← count + 1
      }
   }
   RETURN(count)
}
```
ASK: Which of the following procedure calls can be used to show that the procedure does NOT work as intended?
- [ ] `countAbove([1, 2, 3], 5)`
- [x] `countAbove([4, 5, 6], 5)`
- [ ] `countAbove([7, 8, 9], 5)`
- [ ] `countAbove([], 5)`
WHY: The `≥` should be `>`. Only a list containing a value **equal** to the target reveals the logic error: [4, 5, 6] should give 1 but gives 2. The other calls return the correct answer by luck.

Q: Which of the following best describes a syntax error, a logic error and a run-time error, in that order?
PTS: 1
- [ ] Dividing by zero; a missing parenthesis; using < instead of ≤
- [x] A missing parenthesis; using < instead of ≤; dividing by zero
- [ ] Using < instead of ≤; dividing by zero; a missing parenthesis
- [ ] A missing parenthesis; dividing by zero; using < instead of ≤
WHY: Syntax errors break the rules of the language. Logic errors run but give wrong results. Run-time errors happen while the program runs, like dividing by zero.


## UNIT csp2 | Big Idea 2: Data | 17–22%
### LESSON Binary and how data is represented | 10
**Exam weight: 17–22%.** Computers store *everything* as **bits** (0s and 1s). 8 bits make **1 byte**.

### Converting binary to decimal
Each place value is a power of 2:

| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |

`00001011` = 8 + 2 + 1 = **11**

### How many values can n bits hold?
**2ⁿ.** 4 bits can hold 16 values (0 to 15), and 8 bits can hold 256 values (0 to 255). **Adding one bit doubles** the number of values.

To find how many bits you need, find the smallest n where 2ⁿ ≥ the number of values. For 100 values that's 7 bits, because 2⁷ = 128.

### Limits
- **Overflow:** the number is too big for the fixed number of bits.
- **Rounding errors:** decimals like 0.1 can't be stored exactly, so results come out *approximately* right.

The **same bits** can mean a number, a letter, a color or a sound. It depends on how the program interprets them. This is an example of **abstraction**.

### LESSON Compression and extracting information | 9
### Compression
- **Lossless** compression means the original can be rebuilt **exactly**. ZIP and PNG are examples. Use it for text, code and anything that must be perfect.
- **Lossy** compression throws away some detail to make files much **smaller**. JPEG and MP3 are examples. Use it when "close enough" is fine and size matters most.

### Metadata
**Metadata** is data *about* data, like a photo's date, location or file size. Changing metadata doesn't change the main data, but it helps you find and organize files.

### Using data
- **Cleaning** data makes it uniform (for example, "NY", "N.Y." and "New York" all become one value) and removes errors.
- Larger datasets can reveal **patterns** and **trends**, but **correlation doesn't prove causation**.
- Data can be **biased** if it doesn't represent everyone. Collecting *more* biased data doesn't fix that.
- Big datasets may need **parallel** systems to process.

### QUIZ
Q: What is the binary number `1011` in decimal?
- [ ] 9
- [x] 11
- [ ] 13
- [ ] 1011
WHY: 8 + 0 + 2 + 1 = 11.

Q: How many different values can be represented with 4 bits?
- [ ] 4
- [ ] 8
- [x] 16
- [ ] 32
WHY: n bits can represent 2ⁿ values, and 2⁴ = 16.

Q: A student needs to compress an essay so it can be restored perfectly. Which kind of compression should they use?
- [x] Lossless
- [ ] Lossy
- [ ] Either one works the same
- [ ] Text can't be compressed
WHY: Only **lossless** compression guarantees the exact original can be rebuilt.

Q: Which of these is **metadata** for a photo?
- [ ] The colors of the pixels
- [x] The date and location where it was taken
- [ ] The people in the photo
- [ ] The photo's brightness
WHY: Metadata describes the data. The pixels themselves are the data.

Q: What happens to the number of values you can represent when you add 1 bit?
- [ ] It goes up by 1
- [x] It doubles
- [ ] It goes up by 8
- [ ] It stays the same
WHY: The number of values goes from 2ⁿ to 2ⁿ⁺¹, which is twice as many.

Q: What is 25 in binary?
- [ ] 10101
- [x] 11001
- [ ] 11010
- [ ] 10011
WHY: 25 = 16 + 8 + 1, so the bits are 1 (16), 1 (8), 0 (4), 0 (2), 1 (1).

### TRACE
Q: What is `01101010` in decimal?
```pseudo
place:  128  64  32  16   8   4   2   1
bit:      0   1   1   0   1   0   1   0
```
- [ ] 104
- [x] 106
- [ ] 170
- [ ] 74
WHY: 64 + 32 + 8 + 2 = 106.

Q: A school wants to give each of its 100 clubs a unique binary ID. What is the fewest bits it can use?
- [ ] 6
- [x] 7
- [ ] 8
- [ ] 100
WHY: 6 bits gives only 64 IDs, which isn't enough. 7 bits gives 128 IDs, which covers all 100 clubs.

### BUG
Q: A student converted 13 to binary. Click the line where the mistake **starts**.
```pseudo
// convert 13 to binary
13 = 8 + 4 + 1
8 → 1,  4 → 1,  2 → 1,  1 → 1
binary: 1111
```
LINE: 3
FIX: 8 → 1,  4 → 1,  2 → 0,  1 → 1   (binary: 1101)
WHY: 13 doesn't use the 2's place, so that bit should be 0. The correct answer is 1101.

### LESSON 2.3–2.4 Extracting information from data | 9 | CSP 5.B, 5.D
Programs help us find **patterns** in data that would be too big to search by hand.

### Cleaning data
Real data is messy. Before using it, you often have to **clean** it:
- Make values consistent ("CA", "Calif." and "California" → "CA").
- Remove duplicates and fix obvious typos.
- Decide what to do with missing values.

Cleaning makes data uniform, but it **does not** remove bias in how the data was collected.

### Limits of data
- **Correlation does not mean causation.** Two things rising together doesn't prove one causes the other.
- A sample that leaves out some groups gives **biased** results, no matter how much data you have.
- Larger data sets may need **parallel** or distributed processing to analyze in a reasonable time.
- **Metadata** is data about data (the date a photo was taken, its size, its location). Changing metadata does not change the main data.

### Using programs with data
Typical operations: **filter** (keep rows that match), **transform** (change every value, like converting units), **combine** (join data sets) and **visualize** (charts reveal trends a table hides).

### QUIZ
Q: A researcher has a spreadsheet of 10,000 survey responses. Which of the following tasks could be completed using only the data in the spreadsheet and a program that filters and sorts it?
PTS: 1
OPT I: Finding the number of respondents who listed "soccer" as their favorite sport
OPT II: Finding the most common favorite sport among respondents under 16
OPT III: Determining why respondents chose their favorite sport
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: I and II only need counting and filtering. The data doesn't say **why** people chose a sport, so no amount of sorting can answer III.

Q: A data set of song plays includes, for each play, the song title, artist, genre, and the time it was played. Which of the following CANNOT be determined from the data set?
- [ ] The genre that was played most often
- [ ] The hour of the day with the most plays
- [x] The age of the listeners who played each song
- [ ] The artist whose songs were played most often
WHY: The data doesn't include anything about the listeners, so their ages can't be determined.

Q: A photo app stores each image along with its date, file size, and GPS location. Which of the following is true?
PTS: 1
- [ ] The date and location are part of the image's pixel data.
- [x] Deleting the location metadata does not change how the image looks.
- [ ] Metadata always takes more storage than the image.
- [ ] Changing the file size metadata compresses the image.
WHY: Metadata describes the data but isn't part of it. Removing it leaves the pixels unchanged.

Q: A 6-bit binary number is used to store a value. What is the largest value that can be stored?
PTS: 1
- [ ] 6
- [ ] 32
- [x] 63
- [ ] 64
WHY: 6 bits can hold 2⁶ = 64 different values, from 0 to 63.

Q: Which of the following is true about lossless and lossy compression?
PTS: 1
OPT I: Lossless compression lets the original data be fully restored.
OPT II: Lossy compression usually makes files smaller than lossless compression.
OPT III: Lossy compression is the better choice for a text document that must be restored exactly.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: Lossless keeps every bit, so it's needed when exact restoration matters (text, code). Lossy throws away some detail to get smaller files (photos, music, video).

Q: What is the binary number `10110` in decimal?
- [ ] 20
- [x] 22
- [ ] 26
- [ ] 11
WHY: 16 + 0 + 4 + 2 + 0 = 22.


## UNIT csp3 | Big Idea 3: Algorithms & Programming | 30–35%
### LESSON AP pseudocode essentials | 14
**Exam weight: 30–35%, the biggest Big Idea.** The exam uses its own pseudocode (you get a reference sheet).

```pseudo
a ← 5                 // assignment
DISPLAY(a)
x ← INPUT()
r ← 17 MOD 5          // remainder → 2
n ← RANDOM(1, 6)      // 1 through 6, both included
```

### Lists start at index 1
```pseudo
list ← [10, 20, 30]
list[1]               // 10  ← first item!
APPEND(list, 40)      // [10, 20, 30, 40]
INSERT(list, 2, 15)   // [10, 15, 20, 30, 40]
REMOVE(list, 1)       // [15, 20, 30, 40]
LENGTH(list)          // 4
```

### Selection and iteration
```pseudo
IF (score ≥ 90)
{ DISPLAY("A") }
ELSE
{ DISPLAY("keep going") }

REPEAT 3 TIMES
{ moveForward() }

REPEAT UNTIL (x > 20)    // checks the condition BEFORE each loop
{ x ← x * 3 }

FOR EACH item IN list
{ DISPLAY(item) }
```

### Procedures
```pseudo
PROCEDURE double(n)
{
   RETURN(n * 2)
}
```

Procedures provide **abstraction**: you can use one without knowing how it works inside. That reduces complexity and lets you reuse code. **Libraries** and **APIs** are collections of procedures that other people wrote.

### LESSON Selection with IF and ELSE | 9
On the AP exam, **selection** means choosing which code runs with `IF` and `ELSE`:

```pseudo
IF (temperature > 85)
{
   DISPLAY("Hot")
}
ELSE
{
   DISPLAY("Not hot")
}
```

The condition goes in **parentheses**, and each block goes in **braces**. The block-based version on the reference sheet works the same way.

### Relational and logical operators
- **Relational:** `=` (equal: one sign on the AP exam!), `≠`, `<`, `>`, `≤`, `≥`
- **Logical:** `AND`, `OR`, `NOT`

> **Watch out:** In AP pseudocode `a = b` **compares**. Assignment uses the arrow: `a ← b`.

:::quiz
Q: In AP pseudocode, what does `IF (x = 5)` do?
- [ ] Stores 5 in x
- [x] Checks whether x equals 5
- [ ] Causes an error
- [ ] Always runs
WHY: On the AP exam, `=` is the equality comparison. Assignment is `←`.
:::

### Nested and chained selection
There's no `ELSE IF` keyword, so you **nest** another IF inside the ELSE:

```pseudo
IF (score ≥ 90)
{
   grade ← "A"
}
ELSE
{
   IF (score ≥ 80)
   {
      grade ← "B"
   }
   ELSE
   {
      grade ← "C"
   }
}
```

:::quiz
Q: With the code above, what is `grade` when `score` is 80?
- [ ] "A"
- [x] "B"
- [ ] "C"
- [ ] Nothing is assigned
WHY: 80 ≥ 90 is false, so the ELSE runs. Inside it, 80 ≥ 80 is true, so grade is "B".
:::

### Exam tip
Many AP questions ask which code segments give the **same result**. Trace each one with a few test values, including the **boundaries** (like exactly 80).

### LESSON Algorithms, searching and efficiency | 12
### Building blocks
Every algorithm can be built from three things: **sequencing** (steps in order), **selection** (if) and **iteration** (loops).

### Searching
- **Linear search** checks each item one by one. It works on **any** list.
- **Binary search** checks the middle item and throws away half the list each time. It's much faster, but the list **must be sorted**. For a list of n items, it checks at most about log₂(n) + 1 items, so a list of 64 items needs at most 7 checks.

### Efficiency
- **Reasonable time** means the steps grow like a polynomial (n, n², n³).
- **Unreasonable time** means the steps grow exponentially or faster (2ⁿ, n!).
- When an exact solution would take unreasonable time, use a **heuristic**: an approach that finds a *good enough* answer.

### Limits of computing
An **undecidable** problem is one where no algorithm can always give a correct yes/no answer for every input. The **halting problem** is the famous example.

### Simulations
**Simulations** model the real world with simplifications. They can be cheaper and safer than experiments, but they may leave out details that matter, which can introduce bias.

### QUIZ
Q: What is displayed when `x ← 4` and `y ← 9`?
```pseudo
IF ((x > 3) AND (NOT (y > 10)))
{
   DISPLAY("yes")
}
ELSE
{
   DISPLAY("no")
}
```
- [x] yes
- [ ] no
- [ ] yes no
- [ ] Nothing
WHY: x > 3 is true, and y > 10 is false, so NOT makes it true. true AND true is true.

Q: Which symbol means "not equal to" in AP pseudocode?
- [ ] !=
- [x] ≠
- [ ] <>
- [ ] =/=
WHY: The AP reference sheet uses `≠`.

Q: What is `17 MOD 5`?
- [ ] 3
- [x] 2
- [ ] 3.4
- [ ] 12
WHY: 17 = 5 × 3 + 2, and MOD gives the remainder, 2.

Q: In AP pseudocode, `list ← [8, 3, 5]`. What is `list[1]`?
- [x] 8
- [ ] 3
- [ ] 5
- [ ] Error
WHY: AP pseudocode lists start at index **1**, not 0.

Q: What must be true before you can use binary search on a list?
- [ ] The list has an even number of items
- [x] The list is sorted
- [ ] The list has no duplicates
- [ ] The list holds only numbers
WHY: Binary search decides which half to throw away based on order, so the list must be sorted.

Q: What is the maximum number of items binary search checks in a sorted list of 64 items?
- [ ] 6
- [x] 7
- [ ] 32
- [ ] 64
WHY: Each check halves the list: 64 → 32 → 16 → 8 → 4 → 2 → 1. That's at most 7 checks.

Q: Which kind of algorithm runs in **unreasonable** time?
- [ ] One that takes n² steps
- [ ] One that takes 5n steps
- [x] One that takes 2ⁿ steps
- [ ] One that takes n³ steps
WHY: Exponential growth like 2ⁿ is unreasonable. Polynomial growth like n, n² and n³ is reasonable.

Q: What makes a problem **undecidable**?
- [ ] It takes a long time to solve
- [x] No algorithm can always give a correct yes/no answer for every input
- [ ] It has no solution at all
- [ ] Only a supercomputer can solve it
WHY: Undecidable means no algorithm works for *all* inputs. The halting problem is the classic example.

Q: When should a programmer use a **heuristic**?
- [x] When finding the exact best solution would take unreasonable time
- [ ] When the problem is undecidable and has no answer
- [ ] When the list is already sorted
- [ ] Always, because heuristics are guaranteed to be optimal
WHY: A heuristic gives a good-enough answer in reasonable time. It isn't guaranteed to be the best answer.

Q: What values can `RANDOM(1, 6)` return?
- [ ] 1 to 5
- [x] 1 to 6, including both 1 and 6
- [ ] 0 to 6
- [ ] Any decimal between 1 and 6
WHY: `RANDOM(a, b)` returns a whole number from a to b, including both ends.

### TRACE
Q: What is displayed?
```pseudo
nums ← [4, 7, 2, 9]
total ← 0
FOR EACH n IN nums
{
   IF (n MOD 2 = 0)
   {
      total ← total + n
   }
}
DISPLAY(total)
```
- [ ] 22
- [x] 6
- [ ] 16
- [ ] 2
WHY: Only the even numbers (4 and 2) are added, so the total is 6.

Q: What is displayed?
```pseudo
list ← [10, 20, 30]
APPEND(list, 40)
INSERT(list, 2, 15)
REMOVE(list, 1)
DISPLAY(list)
```
- [ ] [10, 15, 20, 30, 40]
- [x] [15, 20, 30, 40]
- [ ] [10, 20, 15, 30]
- [ ] [20, 15, 30, 40]
WHY: The list goes [10, 20, 30, 40] → [10, 15, 20, 30, 40] → remove index 1 (the 10) → [15, 20, 30, 40].

Q: What is displayed?
```pseudo
x ← 1
count ← 0
REPEAT UNTIL (x > 20)
{
   x ← x * 3
   count ← count + 1
}
DISPLAY(count)
```
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 27
WHY: x goes 1 → 3 → 9 → 27. That's 3 loops, and then 27 > 20 stops the loop.

### BUG
Q: `findMax([-5, -2, -9])` returns 0 instead of −2. Click the bug.
```pseudo
PROCEDURE findMax(list)
{
   max ← 0
   FOR EACH item IN list
   {
      IF (item > max)
      {
         max ← item
      }
   }
   RETURN(max)
}
```
LINE: 3
FIX: max ← list[1]
WHY: Starting at 0 fails when every value is negative. Start with the first item in the list.

### LESSON 3.1–3.4 Variables, lists, math and strings | 11 | CSP 2.B, 3.A
### Assignment happens in order
`a ← b` copies the **current** value of b into a. Later changes to b don't affect a.

```pseudo
a ← 3
b ← a
a ← a + 4      // a is 7, b is still 3
```

To **swap** two variables you need a temporary one:

```pseudo
temp ← x
x ← y
y ← temp
```

### Arithmetic on the exam
`+  -  *  /` work as usual, and `/` can give a decimal. `a MOD b` is the remainder, and MOD goes at the same level as `*` and `/`.
- `17 MOD 5` → 2
- `4 MOD 7` → 4 (7 goes into 4 zero times)
- A number is even when `n MOD 2 = 0`.

### Strings
- **Concatenation** joins strings: `concat("ap", "csp")` → "apcsp".
- A **substring** is part of a string.
- Like lists, string positions in AP pseudocode start at **1**.

### Lists and data abstraction
A list gives many values one name, so a program can handle 3 items or 3,000 with the same code. That is **data abstraction**: it manages complexity because you don't need a separate variable for every value.

An **index** less than 1 or greater than `LENGTH(list)` causes an error and the program ends.

### LESSON 3.8–3.10 Iteration and list algorithms | 11 | CSP 2.B, 4.B
### REPEAT n TIMES vs REPEAT UNTIL
```pseudo
REPEAT 4 TIMES
{
   x ← x * 2
}

REPEAT UNTIL (count = 10)   // stops when the condition becomes TRUE
{
   count ← count + 1
}
```

If the condition in `REPEAT UNTIL` is already true, the body runs **0 times**. If it never becomes true, the loop is **infinite**.

### Standard list algorithms
```pseudo
// Find the maximum
max ← list[1]
FOR EACH item IN list
{
   IF (item > max)
   {
      max ← item
   }
}

// Count matches
count ← 0
FOR EACH item IN list
{
   IF (item = target)
   {
      count ← count + 1
   }
}
```

A common mistake in "find the minimum" is starting `min ← 0`. If every value is positive, the answer will be wrong. Start with the first element instead.

### Traversing by index
```pseudo
i ← 1
REPEAT UNTIL (i > LENGTH(list))
{
   list[i] ← list[i] * 10
   i ← i + 1
}
```

Careful: when you `REMOVE` items while moving forward through a list, the items after shift left, so the next one can be skipped.

### LESSON 3.12–3.15 Procedures, libraries and random values | 9 | CSP 3.B, 3.C
### Calling and writing procedures
- **Parameters** are the inputs listed when a procedure is defined.
- **Arguments** are the values passed in when it's called.
- `RETURN(x)` sends a value back and **immediately ends** the procedure.

**Procedural abstraction** means you can use a procedure by knowing *what* it does, not *how*. It lets you change the inside of the procedure without breaking the code that calls it, as long as it still does the same thing.

### Libraries and APIs
A **library** is a collection of procedures you can use in your programs. An **API** (application program interface) is the documentation that explains how to use them: their names, parameters and what they return.

### RANDOM
`RANDOM(a, b)` gives a random **integer** from a to b, **including both ends**. Each value is equally likely.

```pseudo
roll ← RANDOM(1, 6)
IF (roll = 6)
{
   DISPLAY("Six!")
}
```

`RANDOM(1, 4) = 1` is true about 25% of the time.

### LESSON 3.16–3.18 Simulations, efficiency and undecidable problems | 10 | CSP 1.D, 4.A
### Simulations
A **simulation** is a program that models something real, like traffic, disease spread or dice games.
- It **simplifies** the real world, leaving out details. That can introduce bias.
- It's useful when the real experiment would be too slow, too expensive, too dangerous or impossible.
- Results are only as good as the model's assumptions.

### Efficiency
| Algorithm grows like | Called | Runs in reasonable time? |
|---|---|---|
| n, n², n³ (polynomial) | Reasonable | ✅ Yes |
| 2ⁿ, n! (exponential, factorial) | Unreasonable | ❌ Only for tiny inputs |

When an exact solution would take unreasonable time, programmers use a **heuristic**: an approach that finds a good-enough answer quickly, without guaranteeing the best one.

### Decidable and undecidable problems
- A **decidable** problem has an algorithm that gives a correct yes/no answer for **every** input. Example: "Is this number even?"
- An **undecidable** problem has **no** algorithm that works for all inputs. The classic example is the **halting problem**: deciding whether any program will eventually stop.
- An undecidable problem might still be solvable for *some* inputs, just not all.

### Binary search reminder (3.11)
Binary search only works on **sorted** data. Each step cuts the remaining range in half, so 1,000 items need at most about 10 checks (2¹⁰ = 1,024).

### QUIZ
Q: Consider the following code segment.
PTS: 1
```pseudo
a ← 10
b ← 4
a ← a + b
b ← a - b
a ← a - b
DISPLAY(a)
DISPLAY(b)
```
ASK: What is displayed as a result of executing the code segment?
- [x] 4 10
- [ ] 10 4
- [ ] 14 10
- [ ] 4 4
WHY: a becomes 14. Then b = 14 − 4 = 10. Then a = 14 − 10 = 4. This trick swaps the two values without a temporary variable.

Q: What is displayed as a result of executing the following code segment?
PTS: 1
```pseudo
x ← 25 MOD 7
y ← 7 MOD 25
DISPLAY(x + y)
```
- [ ] 3
- [ ] 7
- [x] 11
- [ ] 32
WHY: 25 MOD 7 = 4, because 7 × 3 = 21 and 25 − 21 = 4. 7 MOD 25 = 7, because 25 doesn't fit into 7. 4 + 7 = 11.

Q: The procedure `findMin` is intended to return the smallest value in the non-empty list `nums`.
PTS: 1
```pseudo
PROCEDURE findMin(nums)
{
   min ← /* missing code */
   FOR EACH n IN nums
   {
      IF (n < min)
      {
         min ← n
      }
   }
   RETURN(min)
}
```
ASK: Which of the following can replace `/* missing code */` so that the procedure works as intended for every non-empty list of integers?
OPT I: `0`
OPT II: `nums[1]`
OPT III: `nums[LENGTH(nums)]`
- [ ] I only
- [ ] II only
- [x] II and III only
- [ ] I, II and III
WHY: Starting with any value from the list works, because the true minimum is at most that value. Starting at 0 fails when every number is positive: `findMin([5, 8])` would return 0.

Q: Consider the following code segment.
PTS: 1
```pseudo
count ← 0
n ← 1
REPEAT UNTIL (n > 20)
{
   n ← n * 3
   count ← count + 1
}
DISPLAY(count)
```
ASK: What is displayed as a result of executing the code segment?
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 20
WHY: n goes 1 → 3 → 9 → 27. After the third pass n is 27, which is greater than 20, so the loop stops with count = 3.

Q: Which of the following can be displayed by the code segment below?
PTS: 1
```pseudo
a ← RANDOM(1, 3)
b ← RANDOM(2, 4)
DISPLAY(a + b)
```
OPT I: 3
OPT II: 7
OPT III: 8
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: The smallest sum is 1 + 2 = 3 and the largest is 3 + 4 = 7. 8 is impossible.

Q: The list `wordList` contains `["the", "cat", "the", "hat"]`. A programmer wants to remove every "the" with the following code.
PTS: 1
```pseudo
i ← 1
REPEAT UNTIL (i > LENGTH(wordList))
{
   IF (wordList[i] = "the")
   {
      REMOVE(wordList, i)
   }
   i ← i + 1
}
```
ASK: What is `wordList` after the code segment runs?
- [x] ["cat", "hat"]
- [ ] ["cat", "the", "hat"]
- [ ] ["the", "hat"]
- [ ] An error occurs because i goes past the end of the list.
WHY: When i = 1, "the" is removed and the list becomes ["cat", "the", "hat"]. i becomes 2, which is "the", so it's removed too, giving ["cat", "hat"]. i becomes 3, which is greater than the length 2, so the loop stops. It works here only because the two "the"s weren't next to each other; ["the", "the"] would leave one behind.

Q: Which of the following problems is undecidable?
PTS: 1
- [ ] Determining whether a number is prime
- [ ] Sorting a list of one million names
- [x] Determining whether any given program will eventually stop running for any given input
- [ ] Finding the shortest route between two cities on a map
WHY: That is the halting problem, which has been proven to have no algorithm that works for every case. The others are decidable, even if some take a long time.

Q: An algorithm takes 2ⁿ steps for an input of size n. Which of the following best describes it?
PTS: 1
- [ ] It runs in reasonable time because 2 is a small number.
- [x] It runs in unreasonable time, so a heuristic may be needed for large inputs.
- [ ] It is undecidable.
- [ ] It runs faster than an algorithm that takes n² steps for every n.
WHY: Exponential growth is unreasonable: at n = 100, 2¹⁰⁰ is far more steps than any computer could finish. Unreasonable is not the same as undecidable; the problem can still be solved for small n.

Q: A sorted list has 500 elements. What is the greatest number of elements a binary search must examine to find a value or decide it isn't there?
PTS: 1
- [ ] 8
- [x] 9
- [ ] 250
- [ ] 500
WHY: Each check halves the range: 500 → 250 → 125 → 62 → 31 → 15 → 7 → 3 → 1. That's at most 9 checks (2⁹ = 512 ≥ 500).

Q: Which of the following are benefits of procedural abstraction?
PTS: 1
OPT I: The same procedure can be called many times instead of repeating code.
OPT II: A procedure's code can be improved without changing the code that calls it, as long as it still does the same job.
OPT III: A program that uses procedures always runs faster.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: Abstraction reduces repetition and hides details. It doesn't make programs faster.


## UNIT csp4 | Big Idea 4: Computer Systems & Networks | 11–15%
### LESSON How the Internet works | 10
**Exam weight: 11–15%.**

- A **network** is a group of connected computing devices.
- The **Internet** is a network *of networks* built on open **protocols**, which are agreed-upon rules for sending data.

### Packets
Data is broken into **packets**. Each packet carries some of the data plus **metadata** like the source and destination addresses. Packets can take **different routes** and **arrive out of order**. They're put back together at the destination.

### Key protocols
| Protocol | Job |
|---|---|
| **IP** | Addresses and routes packets |
| **TCP** | Reliable delivery: puts packets in order and resends lost ones |
| **UDP** | Faster but no guarantees (video calls, games) |
| **HTTP / HTTPS** | Web pages; HTTPS is encrypted |
| **DNS** | Turns names like `example.com` into IP addresses |

**IPv4** uses 32-bit addresses, which are running out. **IPv6** uses 128-bit addresses, which is vastly more.

### Fault tolerance
The Internet is **fault tolerant** because of **redundancy**: there are many paths between devices. If one connection fails, data is rerouted. Redundancy costs more, but the system becomes more reliable.

**Bandwidth** is the maximum amount of data that can be sent in a fixed amount of time, usually measured in bits per second.

### LESSON Parallel and distributed computing | 8
- **Sequential computing** runs steps one at a time.
- **Parallel computing** splits a program into parts that run at the **same time** on multiple processors.
- **Distributed computing** uses **multiple computers**, often to handle problems too big for one machine.

### Timing
The time for a parallel solution is the time of the sequential parts plus the **longest** of the parallel parts.

**Speedup** = sequential time ÷ parallel time.

Example: tasks take 40 s, 30 s and 50 s, with 2 processors. The best split is {50} and {40, 30}, so the parallel time is **70 s**. Sequential time is 120 s, so the speedup is 120 ÷ 70 ≈ 1.7.

Speedup is **limited** by any parts that must stay sequential. Adding more processors eventually stops helping.

### QUIZ
Q: Packets from a single message arrive in a different order than they were sent. What happens?
- [ ] The message is lost
- [x] They are put back in order at the destination (for example, by TCP)
- [ ] The sender must send everything again
- [ ] This never happens on the Internet
WHY: Packets can take different routes. Protocols like TCP reassemble them in the right order.

Q: What makes the Internet fault tolerant?
- [ ] Every device has a backup battery
- [x] There are redundant paths, so data can be rerouted if a connection fails
- [ ] All data goes through a single central server
- [ ] Packets are encrypted
WHY: **Redundancy** (extra connections) lets the network keep working when parts of it fail.

Q: What does DNS do?
- [ ] Encrypts web traffic
- [x] Translates domain names into IP addresses
- [ ] Splits data into packets
- [ ] Blocks malware
WHY: DNS acts like the Internet's phone book. It turns names like `example.com` into IP addresses.

Q: What is bandwidth?
- [ ] How far data can travel
- [x] The maximum amount of data that can be sent in a fixed amount of time
- [ ] The number of devices on a network
- [ ] How secure a connection is
WHY: Bandwidth is usually measured in bits per second.

Q: Three tasks take 40, 30 and 50 seconds. With 2 processors running in parallel, what is the minimum total time?
- [ ] 50 s
- [x] 70 s
- [ ] 60 s
- [ ] 120 s
WHY: The best split is {50} on one processor and {40 + 30} on the other. The longer side takes 70 seconds.

Q: Why was IPv6 created?
- [ ] To make the Internet faster
- [x] IPv4 was running out of addresses; IPv6 has vastly more
- [ ] To replace HTTP
- [ ] To encrypt all traffic
WHY: IPv6 uses 128-bit addresses, compared with 32 bits for IPv4.

### QUIZ
Q: Consider the network below, where each line is a direct connection between two devices.
PTS: 1
```text
A — B — C
|       |
D — E — F
```
ASK: Which of the following statements are true?
OPT I: If the connection between B and C fails, A can still send data to C.
OPT II: The network has no single connection whose failure would disconnect any device.
OPT III: If device E fails, A can no longer reach F.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: The six connections form one big loop, so removing any **one** connection leaves another path (I and II). If E fails, A can still reach F through B and C, so III is false.

Q: A task has three steps that take 40, 30 and 50 seconds. The 40- and 30-second steps can run in parallel, but the 50-second step must wait until both finish. Running on two processors, how long does the whole task take?
PTS: 1
- [ ] 50 seconds
- [x] 90 seconds
- [ ] 120 seconds
- [ ] 70 seconds
WHY: The parallel part takes as long as its slowest step, 40 seconds. Then the 50-second step runs: 40 + 50 = 90. Sequentially it would take 120, so the speedup is 120 / 90 ≈ 1.33.

Q: Which of the following best describes the role of the Domain Name System (DNS)?
- [x] It translates names like example.com into IP addresses.
- [ ] It splits messages into packets.
- [ ] It encrypts data sent between a browser and a server.
- [ ] It guarantees packets arrive in order.
WHY: DNS is like a phone book for the Internet. TCP handles reliable, ordered delivery, and TLS (the S in HTTPS) handles encryption.

Q: Which of the following are true about how data is sent on the Internet?
PTS: 1
OPT I: Packets from the same message can take different paths.
OPT II: Packets can arrive out of order and be put back together.
OPT III: Every packet must go through one central computer that controls the Internet.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: The Internet is decentralized and packets are routed independently, which also makes it fault tolerant. There is no central computer.


## UNIT csp5 | Big Idea 5: Impact of Computing | 21–26%
### LESSON Society, bias and the digital divide | 9
**Exam weight: 21–26%.** Computing innovations can be **beneficial and harmful at the same time**, sometimes in ways their creators never intended.

### The digital divide
The **digital divide** is the gap between people who have access to computing devices and the Internet and people who don't. It's affected by income, location (rural or urban) and infrastructure. Governments, schools and companies can all help close it.

### Computing bias
Algorithms can reflect human bias. Usually this happens through **biased training data**. For example, a face-recognition system trained mostly on one group may work worse for others. Diverse data and diverse teams help reduce bias.

### Crowdsourcing and citizen science
**Crowdsourcing** gets input or services from many people online. Wikipedia and crowdfunding are examples. In **citizen science**, ordinary people help collect data, like bird counts or classifying galaxies.

### Legal and ethical issues
- Your original work is protected by **copyright**.
- **Creative Commons** licenses let creators say how others can reuse their work.
- **Open source** software shares its code so anyone can use and modify it.
- Using someone else's work without permission or credit is **plagiarism**, or it may be illegal.

### LESSON Safe computing | 10
### Personal data
**PII** (personally identifiable information) is information that can identify you, like your name, address, birthday, ID numbers or face. Websites track you with **cookies**, and once data is online it's hard to remove.

### Attacks
- **Phishing:** a fake message tricks you into giving up information.
- **Keylogging:** software records every key you press.
- **Malware / viruses:** harmful software, often installed by tricking the user.
- **Rogue access point:** a fake Wi-Fi network that spies on your traffic.

### Defenses
- **Strong passwords:** long, unique, and stored in a password manager.
- **Multi-factor authentication (MFA):** two or more of **something you know** (a password), **something you have** (a phone) and **something you are** (a fingerprint).
- **Encryption:**
  - **Symmetric** encryption uses one shared key to lock and unlock.
  - **Public key** encryption lets anyone encrypt with your **public** key, but only your **private** key can decrypt.
- **Certificate authorities** vouch that a website is who it says it is. That's part of HTTPS.
- Keep software updated and use antivirus.

### QUIZ
Q: What is the digital divide?
- [ ] The split between Windows and Mac users
- [x] Unequal access to computing devices and the Internet
- [ ] The difference between analog and digital data
- [ ] The gap between hardware and software
WHY: The digital divide is about **access**, which is affected by income, location and infrastructure.

Q: A hiring algorithm favors one group because it was trained on past hiring data. What is this an example of?
- [ ] Overflow
- [x] Computing bias that comes from biased data
- [ ] A syntax error
- [ ] Crowdsourcing
WHY: If the data reflects past human bias, the algorithm learns that bias too.

Q: Sam wants to send Alex a secret message using public key encryption. Which key should Sam use to encrypt it?
- [ ] Sam's private key
- [x] Alex's public key
- [ ] Alex's private key
- [ ] Sam's public key
WHY: Encrypt with the **recipient's public key**. Only Alex's private key can decrypt the message.

Q: Which of these is an example of multi-factor authentication?
- [ ] A long password
- [ ] Two different passwords
- [x] A password plus a code sent to your phone
- [ ] A security question
WHY: MFA combines different *kinds* of factors, such as something you know and something you have. Two passwords are both "something you know".

Q: An email asks you to "verify your account" with a link to a fake login page. What is this?
- [ ] Keylogging
- [x] Phishing
- [ ] Encryption
- [ ] A rogue access point
WHY: **Phishing** tricks people into revealing information like passwords.

Q: What do Creative Commons licenses do?
- [ ] Make all content free for any use
- [x] Let creators choose how others may use and share their work
- [ ] Remove copyright protection
- [ ] Apply only to software
WHY: Creative Commons licenses let creators grant specific permissions, like "use with credit" or "noncommercial only".

Q: Which of these is an example of **citizen science**?
- [x] Volunteers report bird sightings to help researchers
- [ ] A company sells user data
- [ ] A scientist codes alone in a lab
- [ ] Students take an online test
WHY: In citizen science, members of the public help collect or analyze scientific data.

### QUIZ
Q: *Reading passage:* A city installs smart streetlights that dim when no one is nearby and brighten when sensors detect motion. The lights also record how many people pass each hour, and the city publishes that data online.
PTS: 1
ASK: Which of the following is a potential harmful effect of this innovation?
- [ ] The city uses less electricity on empty streets.
- [ ] Researchers can study foot traffic to plan new sidewalks.
- [x] Combined with other data, the published counts could reveal patterns about when specific people come and go.
- [ ] Streets are brighter when people are walking.
WHY: Aggregated data can sometimes be combined with other sources to identify people, which is a privacy risk. The other choices are benefits.

Q: Which of the following are examples of personally identifiable information (PII)?
PTS: 1
OPT I: A person's home address
OPT II: A person's favorite color
OPT III: A person's Social Security number
- [ ] I only
- [x] I and III only
- [ ] II and III only
- [ ] I, II and III
WHY: PII is information that can identify a specific person. Lots of people share a favorite color, so on its own it doesn't identify anyone.

Q: A software developer finds code online that is published under a Creative Commons license. Which of the following is the best way to use it?
PTS: 1
- [ ] Use it without restriction, since anything online is free to use.
- [x] Follow the terms of the license, such as giving credit to the author.
- [ ] Rename the variables so it counts as the developer's own work.
- [ ] It may never be used, because all code is copyrighted.
WHY: Creative Commons licenses let creators share work while setting conditions, such as attribution. Changing variable names doesn't make someone else's work your own.

Q: Which of the following best describes public key encryption?
PTS: 1
- [ ] The same secret key is used to encrypt and decrypt.
- [x] Anyone can encrypt a message with the public key, but only the holder of the matching private key can decrypt it.
- [ ] The public key is used to decrypt and must be kept secret.
- [ ] Messages are not encrypted; they are only signed.
WHY: That's asymmetric encryption. Symmetric encryption is the one that uses a single shared key.

Q: Which of the following is an example of the digital divide?
- [ ] A company uses machine learning to recommend videos.
- [x] Students in a rural area cannot complete online homework because they lack reliable Internet access.
- [ ] A website is translated into five languages.
- [ ] A user forgets their password.
WHY: The digital divide is unequal access to computing and the Internet, often because of location, income or other factors.

