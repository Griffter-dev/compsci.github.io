# COURSE py | Intro to Programming | Python | 🐍 | 1 | Freshman | #3b82f6
> Learn to think like a programmer with Python: variables, decisions, loops, functions and lists.

## UNIT py1 | Variables, Types & Input

### LESSON Variables and data types | 8
A **variable** is a name that points to a value. You create one with `=`, which means *assign*, not *equals*.

```python
name = "Ada"        # str  (text)
age = 15            # int  (whole number)
gpa = 3.8           # float (decimal)
is_coder = True     # bool (True / False)
```

Python figures out the type for you. You can check it with `type(age)`, which gives `<class 'int'>`.

### Math operators
| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+ - *` | add, subtract, multiply | `3 * 4` | `12` |
| `/` | divide (always a float) | `7 / 2` | `3.5` |
| `//` | floor divide | `7 // 2` | `3` |
| `%` | remainder (mod) | `7 % 2` | `1` |
| `**` | power | `2 ** 5` | `32` |

### Input and converting types
`input()` **always gives back a string**, even if the user types a number. Convert it before doing math:

```python
age = int(input("Age? "))
print("Next year you'll be", age + 1)
```

Use `int()`, `float()` and `str()` to convert between types. Mixing types incorrectly, like `"5" + 1`, causes a **TypeError**.

> **Tip:** Name variables clearly: `total_score` beats `ts`. Names can't start with a number or contain spaces or dashes.

### QUIZ
Q: What is the type of the value `3.0`?
- [ ] int
- [x] float
- [ ] str
- [ ] bool
WHY: Any number with a decimal point is a `float`, even if the decimal part is zero.

Q: The user types `12` when `x = input()` runs. What type is `x`?
- [ ] int
- [ ] float
- [x] str
- [ ] It depends on what they type
WHY: `input()` always returns a string. You must convert it with `int()` or `float()` to do math.

Q: Which is a valid Python variable name?
- [x] `total_score`
- [ ] `2fast`
- [ ] `my-score`
- [ ] `class`
WHY: Names can't start with a digit, can't contain `-`, and can't be reserved keywords like `class`.

Q: What does `int("12") + 3` evaluate to?
- [ ] `"123"`
- [x] `15`
- [ ] `"15"`
- [ ] TypeError
WHY: `int("12")` converts the string to the number 12, and 12 + 3 = 15.

Q: What does `print("5" + "5")` display?
- [ ] 10
- [x] 55
- [ ] 5 5
- [ ] TypeError
WHY: `+` on two strings **concatenates** (joins) them: `"5" + "5"` is `"55"`.

### TRACE
Q: What does this print?
```python
x = 7
y = 2
print(x // y, x % y, x / y)
```
- [ ] 3.5 1 3.5
- [x] 3 1 3.5
- [ ] 3 1 3
- [ ] 3.5 0 3.5
WHY: `//` is floor division (3), `%` is the remainder (1), and `/` always gives a float (3.5).

Q: What does this print?
```python
name = "Ada"
print(name * 2 + "!")
```
- [ ] Ada2!
- [x] AdaAda!
- [ ] Ada Ada!
- [ ] TypeError
WHY: Multiplying a string by an int repeats it, so `"Ada" * 2` is `"AdaAda"`, and then `"!"` is added.

### BUG
Q: This program crashes when it runs. Click the line that causes the problem.
```python
age = input("How old are you? ")
next_year = age + 1
print("Next year you'll be", next_year)
```
LINE: 2, 1
FIX: next_year = int(age) + 1
WHY: `age` is a string because `input()` returns text, and you can't add a string and an int. Convert with `int()`, either on line 1 or line 2.

## UNIT py2 | If Statements & Conditionals

### LESSON True, False and comparisons | 6
Before a program can make a decision, it needs a question with a **yes or no** answer. In Python, the answer is a **boolean**: either `True` or `False`.

You get booleans by **comparing** values:

| Operator | Means | Example | Result |
|---|---|---|---|
| `==` | equal to | `5 == 5` | `True` |
| `!=` | not equal to | `5 != 3` | `True` |
| `<` / `>` | less / greater than | `2 > 7` | `False` |
| `<=` / `>=` | at most / at least | `18 >= 18` | `True` |

Try it! Change the numbers and press **Run**:

```python run
age = 15
print(age >= 13)
print(age == 16)
print("cat" == "Cat")
```

:::quiz
Q: What does `print(10 != 10)` show?
- [ ] True
- [x] False
- [ ] 10
- [ ] Error
WHY: `!=` means "not equal". 10 *is* equal to 10, so the answer is `False`.
:::

### Comparing text
String comparisons are **case-sensitive**: `"cat" == "Cat"` is `False`. You can make both sides lowercase first with `.lower()`.

### Saving a comparison
A comparison is just a value, so you can store it in a variable:

```python run
score = 82
passed = score >= 70
print("Passed?", passed)
```

> **Watch out:** One `=` *stores* a value. Two `==` *compares* values. Mixing them up is one of the most common beginner bugs.

:::quiz
Q: Which line **compares** `x` with 5?
- [ ] `x = 5`
- [x] `x == 5`
- [ ] `x := 5`
- [ ] `x => 5`
WHY: `==` compares. A single `=` would store 5 in `x` instead.
:::

### LESSON Your first if statement | 7
An **if statement** runs a block of code **only when its condition is True**:

```python run
battery = 25
if battery < 30:
    print("Low battery! Plug in your laptop.")
print("Battery check done.")
```

Three things make it work:
1. The word `if`, then a **condition**.
2. A **colon** `:` at the end of the line.
3. The code that belongs to the `if` is **indented** (4 spaces).

The last line isn't indented, so it **always** runs. Try changing `battery` to `80` and run it again.

:::quiz
Q: `battery = 80`. What does the program above print?
- [ ] Both lines
- [x] Only "Battery check done."
- [ ] Only "Low battery! Plug in your laptop."
- [ ] Nothing
WHY: `80 < 30` is `False`, so the indented line is skipped. The unindented line always runs.
:::

### The block can have many lines
Every indented line under the `if` runs together, or none of them run:

```python run
temperature = 95
if temperature > 90:
    print("It's hot!")
    print("Drink some water.")
print("Have a good day.")
```

### Common mistakes
- **A missing colon:** `if x > 5` gives a SyntaxError.
- **Forgetting to indent:** gives an IndentationError.
- **Using `=` instead of `==`:** `if x = 5:` gives a SyntaxError.

:::quiz
Q: What's wrong with this line? `if score > 90`
- [x] It's missing a colon at the end
- [ ] `>` should be `=>`
- [ ] `if` must be capitalized
- [ ] Nothing
WHY: Every `if` line ends with `:`.
:::

### LESSON else and elif | 9
### else: one or the other
`else` runs when the `if` condition is **False**. Exactly one of the two blocks runs, every time:

```python run
number = 7
if number % 2 == 0:
    print(number, "is even")
else:
    print(number, "is odd")
```

`else` has **no condition** and ends with a colon.

### elif: more than two choices
`elif` means "else if". Python checks each condition **from top to bottom** and runs **only the first one that's True**. Then it skips the rest.

```python run
speed = 55
if speed > 70:
    print("Too fast!")
elif speed > 40:
    print("Good speed.")
else:
    print("A bit slow.")
```

:::quiz
Q: `speed = 90`. Which message prints?
- [x] Too fast!
- [ ] Good speed.
- [ ] Too fast! and Good speed.
- [ ] A bit slow.
WHY: 90 > 70 is True, so the first branch runs. Even though 90 > 40 is also True, `elif` is skipped once an earlier branch has run.
:::

### Order matters!
Because the first True condition wins, put the **most specific** check first. This version has a bug:

```python run
score = 95
if score >= 70:
    print("C")
elif score >= 90:
    print("A")   # never reached for 95!
```

A 95 prints "C", because `95 >= 70` is checked first. When you check "at least" values, go from **highest to lowest**.

:::quiz
Q: How many branches of an if / elif / elif / else chain can run at once?
- [x] Exactly one
- [ ] All the ones that are True
- [ ] Zero or one
- [ ] Two at most
WHY: With an `else` at the end, exactly one branch runs: the first True one, or the `else` if none are True.
:::

### if vs. several ifs
Several separate `if` statements are all checked, one by one. An `elif` chain stops at the first match. Choose based on whether more than one block should be able to run.

### LESSON and, or, not | 8
Combine conditions with **logical operators**:

| Operator | True when… |
|---|---|
| `a and b` | **both** are True |
| `a or b` | **at least one** is True |
| `not a` | `a` is False |

```python run
age = 16
has_permission = True
if age >= 13 and has_permission:
    print("You can make an account.")

day = "Saturday"
if day == "Saturday" or day == "Sunday":
    print("Weekend!")
```

:::quiz
Q: `x = 12`. What is `x > 10 and x < 20`?
- [x] True
- [ ] False
- [ ] 12
- [ ] Error
WHY: Both comparisons are True, so `and` gives True.
:::

### Handy shortcuts
- **Chained comparisons:** `13 <= age <= 19` means `age >= 13 and age <= 19`.
- **The `in` operator:** `if letter in "aeiou":` checks for a vowel, and `if name in friends:` checks a list.
- **Write each comparison in full:** `day == "Sat" or "Sun"` is a **bug**, because the `"Sun"` side on its own always counts as True. Write `day == "Sat" or day == "Sun"`.

### Truthiness
In an `if`, these values count as **False**: `False`, `0`, `0.0`, `""` (empty string), `[]` (empty list) and `None`. Everything else counts as True:

```python run
name = ""
if name:
    print("Hi", name)
else:
    print("You didn't type a name!")
```

:::quiz
Q: Which condition is True when `letter = "e"`?
- [ ] `letter == "a" or "e"` is the correct way to write it
- [x] `letter in "aeiou"`
- [ ] `not letter`
- [ ] `letter == "aeiou"`
WHY: `in` checks whether "e" appears inside "aeiou". The first option is a classic bug, `not "e"` is False, and `"e" == "aeiou"` is False.
:::

### Short-circuiting
Python stops as soon as it knows the answer. In `a and b`, if `a` is False, `b` is never checked. That lets you write safe checks like `if count != 0 and total / count > 5:`.

### LESSON Nested ifs and shortcuts | 9
### Nested if statements
You can put an `if` **inside** another `if`. The inner one is only checked when the outer one is True:

```python run
age = 15
has_ticket = True
if has_ticket:
    if age >= 13:
        print("Enjoy the movie!")
    else:
        print("You need an adult with you.")
else:
    print("Please buy a ticket first.")
```

Each level of nesting adds **4 more spaces** of indentation.

:::quiz
Q: `has_ticket = False` and `age = 20`. What prints?
- [ ] Enjoy the movie!
- [ ] You need an adult with you.
- [x] Please buy a ticket first.
- [ ] Nothing
WHY: The outer `if` is False, so Python jumps to its `else`. The inner `if` is never checked.
:::

### Flatten when you can
Two nested ifs with nothing else between them can usually become one `and`:

```python
if has_ticket:              # nested
    if age >= 13:
        print("Go in")

if has_ticket and age >= 13:   # same thing, easier to read
    print("Go in")
```

### Conditional expressions
For a quick either/or **value**, Python has a one-line form: `value_if_true if condition else value_if_false`.

```python run
n = 7
label = "even" if n % 2 == 0 else "odd"
print(n, "is", label)
```

### Early return in functions
Inside a function, `return` ends it right away. Checking special cases first keeps code flat:

```python run
def describe(temp):
    if temp < 0:
        return "freezing"
    if temp < 20:
        return "cool"
    return "warm"

print(describe(-5), describe(10), describe(30))
```

:::quiz
Q: What does `"big" if 3 > 10 else "small"` evaluate to?
- [ ] "big"
- [x] "small"
- [ ] True
- [ ] Error
WHY: `3 > 10` is False, so the expression gives the value after `else`.
:::

### Bonus: match (Python 3.10+)
`match` compares one value against several patterns. It's like a tidy `elif` chain:

```python run
command = "go"
match command:
    case "stop":
        print("Stopping")
    case "go":
        print("Going!")
    case _:
        print("Unknown command")
```
`case _` catches everything else, like `else`.

### QUIZ
Q: What does `not (5 > 3 and 2 > 4)` evaluate to?
- [x] True
- [ ] False
- [ ] Error
- [ ] None
WHY: `5 > 3` is True and `2 > 4` is False, so `True and False` is False, and `not False` is True.

Q: What is the difference between `=` and `==`?
- [ ] They are the same
- [x] `=` assigns a value; `==` checks if two values are equal
- [ ] `==` assigns a value; `=` checks equality
- [ ] `==` is only used with strings
WHY: A single `=` stores a value in a variable. A double `==` asks a True/False question.

Q: `x = 15`. Which lines print?
```python
if x > 10:
    print("A")
elif x > 5:
    print("B")
else:
    print("C")
```
- [ ] A and B
- [x] Only A
- [ ] Only B
- [ ] A, B and C
WHY: Only the first true branch runs. Once `x > 10` is True, the `elif` and `else` are skipped.

Q: Which value counts as **False** in an `if` statement?
- [x] `0`
- [ ] `1`
- [ ] `"False"`
- [ ] `[0]`
WHY: `0` is falsy. The string `"False"` and the list `[0]` are not empty, so they count as True.

Q: When does an `elif` block run?
- [ ] Always, after the `if`
- [ ] When the `if` condition is True
- [x] When every condition above it was False and its own condition is True
- [ ] Only if there is no `else`
WHY: `elif` is checked only if every earlier condition failed, and it runs only if its own condition is True.

### TRACE
Q: What does this print?
```python
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print(grade)
```
- [ ] A
- [x] B
- [ ] C
- [ ] B C
WHY: 85 is not ≥ 90, but it is ≥ 80, so grade becomes "B" and the rest of the chain is skipped.

Q: What does this print?
```python
a = 4
b = 9
if a > 3 or b < 5:
    print("yes")
if a > 3 and b < 5:
    print("both")
print("done")
```
- [ ] yes, then both, then done
- [x] yes, then done
- [ ] both, then done
- [ ] done
WHY: The first `if` is True because `a > 3`. The second is False because `b < 5` is False. These are two separate `if`s, so both are checked.

### BUG
Q: This program has a syntax error. Click the broken line.
```python
temp = 75
if temp > 80:
    print("Hot")
elif temp > 60
    print("Nice")
else:
    print("Cold")
```
LINE: 4
FIX: elif temp > 60:
WHY: Every `if`, `elif` and `else` line must end with a colon.

### QUIZ
Q: Which condition is True only when `age` is from 13 to 19, inclusive?
- [x] `13 <= age <= 19`
- [ ] `age > 13 and age < 19`
- [ ] `age >= 13 or age <= 19`
- [ ] `13 < age < 19`
WHY: Chained `<=` includes both ends. Using `or` would be True for every age.

Q: `day = "Sun"`. What does `day == "Sat" or "Sun"` evaluate to, and why is it a bug?
- [ ] False, because day isn't "Sat"
- [x] "Sun". The right side is just a non-empty string, which always counts as True
- [ ] True, because Python checks day against both
- [ ] Error
WHY: Python reads it as `(day == "Sat") or ("Sun")`. Write `day == "Sat" or day == "Sun"` (or `day in ("Sat", "Sun")`).

Q: What does `label = "pass" if 65 >= 70 else "retry"` store?
- [ ] "pass"
- [x] "retry"
- [ ] True
- [ ] None
WHY: The condition is False, so the conditional expression gives the value after `else`.

Q: In `if a and b:`, when is `b` **not** checked at all?
- [x] When `a` is False
- [ ] When `a` is True
- [ ] When `b` is False
- [ ] It's always checked
WHY: Short-circuiting: if `a` is False, `and` is already False, so Python skips `b`.

Q: Which line correctly checks whether `ch` is a vowel?
- [ ] `if ch == "a" or "e" or "i" or "o" or "u":`
- [x] `if ch in "aeiou":`
- [ ] `if ch == "aeiou":`
- [ ] `if "aeiou" in ch == True:`
WHY: `in` checks membership. The first option is always True because non-empty strings count as True.

Q: Which kind of value is `True`?
- [ ] str
- [ ] int
- [x] bool
- [ ] None
WHY: `True` and `False` are the two **boolean** (`bool`) values.

### TRACE
Q: What does this print?
```python
x = 15
if x > 10:
    print("A")
if x > 5:
    print("B")
else:
    print("C")
```
- [ ] A
- [x] A, then B
- [ ] A, then B, then C
- [ ] B
WHY: These are two **separate** if statements, so both are checked. 15 > 10 prints A, and 15 > 5 prints B, so the else is skipped.

Q: What does this print?
```python
temp = 30
raining = False
if temp > 25:
    if raining:
        print("Warm rain")
    else:
        print("Beach day")
else:
    print("Stay in")
```
- [ ] Warm rain
- [x] Beach day
- [ ] Stay in
- [ ] Beach day, then Stay in
WHY: The outer condition is True. Inside it, `raining` is False, so the inner `else` runs.

Q: What does this print?
```python
def grade(s):
    if s >= 90:
        return "A"
    if s >= 80:
        return "B"
    return "C"

print(grade(85) + grade(92) + grade(40))
```
- [x] BAC
- [ ] BBC
- [ ] ABC
- [ ] CCC
WHY: 85 gives "B", 92 gives "A" and 40 gives "C", so it prints BAC. `return` exits the function as soon as a branch matches.

### BUG
Q: A 95 prints "C" instead of "A". Click the line where the order goes wrong.
```python
score = 95
if score >= 70:
    print("C")
elif score >= 80:
    print("B")
elif score >= 90:
    print("A")
```
LINE: 2
FIX: if score >= 90:   (check the highest grade first, then 80, then 70)
WHY: The first True condition wins, and 95 >= 70 is True. Check from highest to lowest.

Q: This should print "Weekend!" only on Saturday or Sunday, but it prints it every day. Click the bug.
```python
day = "Monday"
if day == "Saturday" or "Sunday":
    print("Weekend!")
```
LINE: 2
FIX: if day == "Saturday" or day == "Sunday":
WHY: `"Sunday"` on its own is a non-empty string, which always counts as True. Write the full comparison on both sides of `or`.

Q: This crashes with a SyntaxError. Click the broken line.
```python
password = input("Password: ")
if password = "hunter2":
    print("Welcome")
else:
    print("Wrong password")
```
LINE: 2
FIX: if password == "hunter2":
WHY: Use `==` to compare. A single `=` stores a value, and that isn't allowed in an `if` condition.

## UNIT py3 | Loops

### LESSON for loops, while loops and range | 10
Loops repeat code so you don't have to copy and paste it.

### for loops
Use a `for` loop when you know **how many times** to repeat, or when you want to go through each item in a collection.

```python run
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for letter in "code":     # c, o, d, e
    print(letter)
```

`range(start, stop, step)` **stops before** `stop`:
- `range(5)` gives 0 1 2 3 4
- `range(2, 10, 3)` gives 2 5 8
- `range(5, 0, -1)` gives 5 4 3 2 1

### while loops
Use a `while` loop to repeat **as long as a condition is true**:

```python run
lives = 3
while lives > 0:
    print("Playing...")
    lives -= 1            # without this, the loop never ends!
```

### The accumulator pattern
```python run
total = 0
for n in range(1, 11):
    total += n            # same as total = total + n
print(total)              # 55
```

- `break` exits the loop immediately.
- `continue` skips to the next iteration.

### QUIZ
Q: What numbers does `range(2, 10, 3)` produce?
- [ ] 2, 5, 8, 11
- [x] 2, 5, 8
- [ ] 2, 3, 4, ..., 10
- [ ] 3, 6, 9
WHY: It starts at 2 and adds 3 each time (2, 5, 8). It stops *before* reaching 10.

Q: How many times does the body of `for i in range(5):` run?
- [ ] 4
- [x] 5
- [ ] 6
- [ ] It depends
WHY: `range(5)` gives 0, 1, 2, 3, 4, which is five values.

Q: What does `break` do inside a loop?
- [ ] Skips the rest of this iteration only
- [x] Exits the loop completely
- [ ] Restarts the loop
- [ ] Stops the whole program
WHY: `break` jumps out of the loop. `continue` is the one that skips to the next iteration.

Q: What is the biggest risk with a `while` loop?
- [ ] It can only run once
- [x] It can run forever if the condition never becomes False
- [ ] It can't use variables
- [ ] It is slower than a for loop
WHY: If nothing inside the loop changes the condition, you get an **infinite loop**.

Q: What does `range(5, 0, -1)` produce?
- [x] 5, 4, 3, 2, 1
- [ ] 5, 4, 3, 2, 1, 0
- [ ] 0, 1, 2, 3, 4, 5
- [ ] Nothing (empty)
WHY: A negative step counts down, and it still stops *before* the stop value (0).

### TRACE
Q: What does this print?
```python
total = 0
for i in range(1, 5):
    total += i
print(total)
```
- [ ] 15
- [x] 10
- [ ] 4
- [ ] 5
WHY: `range(1, 5)` is 1, 2, 3, 4, and 1 + 2 + 3 + 4 = 10.

Q: What does this print?
```python
n = 10
count = 0
while n > 1:
    n = n // 2
    count += 1
print(count)
```
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 5
WHY: n goes 10 → 5 → 2 → 1. That's 3 loops, and then `n > 1` is False.

### BUG
Q: This should add up the numbers 1 to 10, but it prints 45. Click the bug.
```python
# add up the numbers 1 to 10
total = 0
for n in range(1, 10):
    total = total + n
print(total)
```
LINE: 3
FIX: for n in range(1, 11):
WHY: `range(1, 10)` stops at 9. To include 10, the stop value must be 11. This is a classic **off-by-one** error.

## UNIT py4 | Functions

### LESSON Writing your own functions | 10
A **function** is a named, reusable block of code. You define it once and call it as many times as you want.

```python run
def area(width, height):      # parameters
    return width * height

big = area(10, 4)             # arguments: 10, 4
print(big)                    # 40
```

- **Parameters** are the variable names in the definition (`width`, `height`).
- **Arguments** are the actual values you pass in (`10`, `4`).

### return vs print
`return` **sends a value back** to the code that called the function. `print` only shows text on the screen. A function without a `return` gives back `None`.

```python run
def shout(word):
    print(word.upper())

x = shout("hi")   # prints HI
print(x)          # None
```

### Default parameters
```python
def greet(name, greeting="Hello"):
    return greeting + ", " + name

greet("Sam")            # "Hello, Sam"
greet("Sam", "Yo")      # "Yo, Sam"
```

### Scope
Variables created inside a function are **local**. They disappear when the function ends and can't be seen from outside.

> **Why functions?** They let you reuse code, make programs easier to read, and hide details. This last idea is called **abstraction**.

### QUIZ
Q: What does a function return if it has no `return` statement?
- [ ] 0
- [ ] An empty string
- [x] `None`
- [ ] It causes an error
WHY: Every Python function returns something. If you don't return a value, it returns `None`.

Q: In `def add(a, b):`, what are `a` and `b`?
- [x] Parameters
- [ ] Arguments
- [ ] Return values
- [ ] Global variables
WHY: Names in the definition are **parameters**. The values you pass when calling are **arguments**.

Q: Given `def f(x=2): return x * 3`, what is `f()`?
- [ ] Error
- [ ] 0
- [x] 6
- [ ] None
WHY: No argument is passed, so `x` uses its default value 2, and 2 × 3 = 6.

Q: A variable is created inside a function. Can code outside the function use it?
- [ ] Yes, always
- [x] No, it's local to the function
- [ ] Only if it's a number
- [ ] Only after the function is called twice
WHY: Variables made inside a function are **local**. Use `return` to get values out.

Q: What is the main benefit of breaking a program into functions?
- [ ] It makes the program run faster
- [x] Code can be reused and understood in smaller pieces
- [ ] Functions use less memory
- [ ] Python requires it
WHY: Functions give you **reuse** and **abstraction**: you can use `area()` without thinking about how it works inside.

### TRACE
Q: What does this print?
```python
def mystery(a, b):
    if a > b:
        return a - b
    return b - a

print(mystery(3, 8) + mystery(10, 4))
```
- [ ] -5
- [ ] 1
- [x] 11
- [ ] 6
WHY: `mystery(3, 8)` gives 8 − 3 = 5 and `mystery(10, 4)` gives 10 − 4 = 6. The function finds the distance between two numbers, and 5 + 6 = 11.

Q: What does this print?
```python
def greet(name):
    print("Hi " + name)

x = greet("Sam")
print(x)
```
- [ ] Hi Sam, then Hi Sam
- [x] Hi Sam, then None
- [ ] None
- [ ] Hi Sam
WHY: `greet` prints "Hi Sam" but has no `return`, so `x` is `None`, which is printed next.

### BUG
Q: This prints `Area: None` instead of `Area: 12`. Click the bug.
```python
def area(width, height):
    result = width * height

a = area(3, 4)
print("Area:", a)
```
LINE: 2
FIX: return width * height
WHY: The function calculates the result but never **returns** it, so the call gives back `None`.

## UNIT py5 | Lists & Strings

### LESSON Working with lists and strings | 12
A **list** holds many values in order. Each item has an **index** that starts at **0**.

```python
nums = [4, 8, 15, 16, 23, 42]
nums[0]      # 4   (first)
nums[-1]     # 42  (last)
len(nums)    # 6
nums.append(99)   # adds to the end
nums[1] = 7       # lists can be changed
```

### Slicing
`seq[start:stop]` takes a piece from `start` up to, **but not including**, `stop`. This works on lists and strings.

```python
word = "computer"
word[0:3]    # "com"
word[3:]     # "puter"
word[::-1]   # "retupmoc"  (reversed)
```

### Strings are immutable
You can't change a single character in a string. `word[0] = "C"` causes a **TypeError**. Build a new string instead: `word = "C" + word[1:]`.

### Looping through a list
```python
for score in scores:                 # by value
    print(score)

for i in range(len(scores)):         # by index
    print(i, scores[i])
```

### Handy methods
- **Strings:** `.upper()`, `.lower()`, `.strip()`, `.split()`, `.replace(a, b)`, `.find(x)`
- **Lists:** `.append(x)`, `.insert(i, x)`, `.pop()`, `.remove(x)`, `.sort()`, `x in list`

### QUIZ
Q: `nums = [4, 8, 15, 16, 23, 42]`. What is `nums[-2]`?
- [ ] 8
- [ ] 16
- [x] 23
- [ ] 42
WHY: Negative indexes count from the end: `-1` is 42 and `-2` is 23.

Q: What is `"computer"[1:4]`?
- [ ] "comp"
- [x] "omp"
- [ ] "ompu"
- [ ] "om"
WHY: The slice takes index 1 up to, but not including, index 4: o, m, p.

Q: What is `len([1, [2, 3], 4])`?
- [x] 3
- [ ] 4
- [ ] 2
- [ ] Error
WHY: The list holds three items. The inner list `[2, 3]` counts as one item.

Q: What happens when you run `s = "java"` and then `s[0] = "J"`?
- [ ] s becomes "Java"
- [x] TypeError, because strings can't be changed in place
- [ ] s becomes "Jjava"
- [ ] Nothing
WHY: Strings are **immutable**. Make a new string instead, for example `"J" + s[1:]`.

Q: What does `nums.append(5)` do?
- [ ] Returns a new list with 5 added
- [x] Adds 5 to the end of `nums` itself
- [ ] Adds 5 to the start
- [ ] Replaces the last item with 5
WHY: `append` changes the list **in place** and returns `None`.

### TRACE
Q: What does this print?
```python
words = ["code", "study", "win"]
words.append("repeat")
print(len(words), words[1][0])
```
- [ ] 3 s
- [x] 4 s
- [ ] 4 c
- [ ] 4 study
WHY: After `append` there are 4 items. `words[1]` is "study", and its index-0 character is "s".

Q: What does this print?
```python
s = "banana"
count = 0
for ch in s:
    if ch == "a":
        count += 1
print(count, s.upper()[0:3])
```
- [ ] 2 BAN
- [x] 3 BAN
- [ ] 3 ban
- [ ] 3 BANA
WHY: "banana" contains three a's. `s.upper()` is "BANANA", and `[0:3]` is "BAN".

### BUG
Q: This should find the highest score but crashes with an IndexError. Click the bug.
```python
scores = [90, 85, 77, 100]
best = scores[0]
for i in range(len(scores) + 1):
    if scores[i] > best:
        best = scores[i]
print(best)
```
LINE: 3
FIX: for i in range(len(scores)):
WHY: Valid indexes are 0 to 3. `range(len(scores) + 1)` reaches index 4, which doesn't exist.
