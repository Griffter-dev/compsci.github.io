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

### LESSON print(), operators and precedence | 9 | PCEP 1.4
`print()` can take several values. By default it puts a **space** between them and a **new line** at the end. You can change both:

```python run
print("A", "B", "C")              # A B C
print("A", "B", "C", sep="-")     # A-B-C
print("no new line", end="!")
print(" same line")               # no new line! same line
```

### Operator precedence
Python does math in this order, from first to last:

| Order | Operators | Notes |
|---|---|---|
| 1 | `( )` | Parentheses always win |
| 2 | `**` | Power, works **right to left**: `2 ** 3 ** 2` is `2 ** 9` = 512 |
| 3 | `-x` | A minus sign in front: `-2 ** 2` is `-(2 ** 2)` = -4 |
| 4 | `* / // %` | Left to right |
| 5 | `+ -` | Left to right |
| 6 | `== != < <= > >=` | Comparisons |
| 7 | `not`, then `and`, then `or` | Logic |

```python run
print(2 + 3 * 4)        # 14, not 20
print(10 - 4 - 3)       # 3, left to right
print(2 ** 3 ** 2)      # 512, right to left
print(-7 // 2, -7 % 2)  # -4 1  (floor division rounds DOWN)
```

### Shortcut assignment
`x += 5` means `x = x + 5`. The same works for `-=`, `*=`, `/=`, `//=`, `%=` and `**=`.

### Floats are not exact
Computers store decimals in binary, so some can't be stored exactly:

```python run
print(0.1 + 0.2)              # 0.30000000000000004
print(round(0.1 + 0.2, 2))    # 0.3
```

Never compare floats with `==`. Check if they are close instead: `abs(a - b) < 0.0001`.

:::quiz
Q: What does `2 + 10 // 4 * 2` evaluate to?
- [x] 6
- [ ] 10
- [ ] 8
- [ ] 6.0
WHY: `10 // 4` is 2, then `2 * 2` is 4, then `2 + 4` is 6.
:::

### QUIZ
Q: Consider the following code segment.
PTS: 1
```python
a = 7
b = 2
print(a // b, a % b, a / b)
```
ASK: What is printed as a result of executing the code segment?
- [x] 3 1 3.5
- [ ] 3.5 1 3.5
- [ ] 3 1 3
- [ ] 3 0.5 3.5
WHY: `7 // 2` is 3 (floor division), `7 % 2` is 1 (the remainder) and `7 / 2` is 3.5 (`/` always gives a float).

Q: Which of the following evaluates to 2.5?
PTS: 1
OPT I: `5 / 2`
OPT II: `5 // 2 + 0.5`
OPT III: `float(5 // 2)`
- [ ] I only
- [ ] II only
- [x] I and II only
- [ ] I, II and III
WHY: I is 2.5. II is 2 + 0.5 = 2.5. III is `float(2)`, which is 2.0, because the floor division happens before the conversion.

Q: Consider the following code segment.
PTS: 1
```python
x = 10
y = x
x += 5
y = y * 2
print(x, y)
```
ASK: What is printed as a result of executing the code segment?
- [x] 15 20
- [ ] 15 30
- [ ] 10 20
- [ ] 15 15
WHY: `y = x` copies the value 10 into y. Changing x afterward does not change y. Then x becomes 15 and y becomes 20.

Q: Consider the following code segment. Assume the user types 16 when asked.
PTS: 1
```python
age = /* missing code */
print(age + 1)
```
ASK: Which of the following replacements for `/* missing code */` will cause a TypeError to occur?
OPT I: `input("Age? ")`
OPT II: `int("16")`
OPT III: `"16"`
- [ ] I only
- [ ] II only
- [x] I and III only
- [ ] I, II and III
WHY: `input()` always returns a string, and so does `"16"`. Adding a string and the int 1 is a TypeError. `int("16")` is the number 16, so II prints 17.

Q: What is the value of `result` after the code segment is executed?
PTS: 1
```python
result = 2 + 3 * 4 ** 2 // 8
```
- [x] 8
- [ ] 10
- [ ] 50
- [ ] 8.0
WHY: `**` goes first: `4 ** 2` = 16. Then left to right: `3 * 16` = 48, `48 // 8` = 6. Last, `2 + 6` = 8. `//` with ints gives an int, so it's 8, not 8.0.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
print("A", "B", sep="-", end="!")
print("C")
```
- [x] A-B!C
- [ ] A B!C
- [ ] A-B! (then C on the next line)
- [ ] A-B-!C
WHY: `sep="-"` puts a dash between A and B. `end="!"` replaces the usual new line with `!`, so the next print continues on the same line.

Q: What is printed?
PTS: 1
```python
print(-7 // 2, 2 ** 3 ** 2)
```
- [ ] -3 64
- [x] -4 512
- [ ] -4 64
- [ ] -3 512
WHY: Floor division rounds **down**, and down from -3.5 is -4. `**` works right to left, so `2 ** 3 ** 2` is `2 ** 9` = 512.


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

### QUIZ
Q: The following function is intended to return `True` if `num` is between `low` and `high`, inclusive, and `False` otherwise.
PTS: 1
```python
def in_range(num, low, high):
    return /* missing code */
```
ASK: Which of the following can replace `/* missing code */` so that the function works as intended?
OPT I: `low <= num <= high`
OPT II: `num >= low and num <= high`
OPT III: `not (num < low or num > high)`
- [ ] I only
- [ ] II only
- [ ] I and II only
- [x] I, II and III
WHY: I uses Python's chained comparison. II is the same test written out. III uses De Morgan's law: `not (A or B)` is the same as `not A and not B`, which is `num >= low and num <= high`.

Q: Consider the following function.
PTS: 1
```python
def category(temp):
    if temp > 90:
        return "hot"
    elif temp > 70:
        return "warm"
    elif temp > 90:
        return "scorching"
    else:
        return "cool"
```
ASK: Which of the following best describes the behavior of the function?
- [x] The function will never return "scorching".
- [ ] The function returns "scorching" when temp is greater than 90.
- [ ] The function returns "hot" and "scorching" when temp is greater than 90.
- [ ] The function always returns "cool".
WHY: Any temp over 90 is caught by the first `if` and returns "hot". By the time the third check runs, temp must be 90 or less, so `temp > 90` can never be true there.

Q: The function `is_middle(a, b, c)` is intended to return `True` if `b` is strictly between `a` and `c` (in either order) and `False` otherwise.
PTS: 1
```python
def is_middle(a, b, c):
    return /* missing code */
```
TABLE:
| Call | Result |
|---|---|
| is_middle(1, 2, 3) | True |
| is_middle(3, 2, 1) | True |
| is_middle(1, 4, 3) | False |
| is_middle(2, 2, 3) | False |
ASK: Which of the following can replace `/* missing code */` so the function gives the results shown in the table?
- [ ] `a < b and b < c`
- [x] `(a < b < c) or (c < b < a)`
- [ ] `(a <= b <= c) or (c <= b <= a)`
- [ ] `a < b or b < c`
WHY: Only B works for every row. A fails `is_middle(3, 2, 1)`. C returns True for `is_middle(2, 2, 3)` because of `<=`. D returns True for `is_middle(1, 4, 3)` because `1 < 4`.

Q: Assume `x` holds an int. Which of the following best describes the value of the expression below?
PTS: 1
```python
not (x > 0) or x > 0
```
- [x] The value is always True.
- [ ] The value is always False.
- [ ] The value is True only when x is greater than 0.
- [ ] The value is True only when x is less than or equal to 0.
WHY: Either `x > 0` is true, or it's false and `not (x > 0)` is true. One side of the `or` is always true.

Q: Assume `x` and `y` hold ints. Which of the following is equivalent to the expression below?
PTS: 1
```python
not (x > 5 and y < 3)
```
- [ ] `x < 5 or y > 3`
- [x] `x <= 5 or y >= 3`
- [ ] `x <= 5 and y >= 3`
- [ ] `not x > 5 and not y < 3`
WHY: De Morgan's law: `not (A and B)` becomes `not A or not B`. The opposite of `x > 5` is `x <= 5`, and the opposite of `y < 3` is `y >= 3`.

Q: Consider the following code segment.
PTS: 1
```python
score = 85
grade = "F"
if score >= 60:
    grade = "D"
if score >= 70:
    grade = "C"
if score >= 80:
    grade = "B"
if score >= 90:
    grade = "A"
print(grade)
```
ASK: Which of the following code segments will produce the same output for every possible int value of score?
OPT I: Replace every `if` after the first one with `elif`.
OPT II: Reverse the order of the four `if` statements and change every `if` after the first one to `elif`.
OPT III: Leave the code as it is but change `>=` to `>` everywhere.
- [ ] I only
- [x] II only
- [ ] I and II only
- [ ] II and III only
WHY: The original keeps the **last** true check, which is the highest grade earned. II checks from the top down and stops at the first match, which gives the same grade. I stops at the first match from the bottom, so 85 would get "D". III changes the boundaries: a score of exactly 80 would get "C".


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

### LESSON break, continue, nested loops and range steps | 9 | PCEP 2.2
### range(start, stop, step)
`range` stops **before** `stop`. The step can be negative to count down:

```python run
print(list(range(1, 10, 3)))    # [1, 4, 7]
print(list(range(10, 0, -2)))   # [10, 8, 6, 4, 2]
print(list(range(5, 1)))        # []  counting up from 5 never reaches 1
```

### break and continue
- `break` ends the whole loop right away.
- `continue` skips the rest of this pass and goes on to the next one.
- `pass` does nothing. It is a placeholder for a block you haven't written yet.

```python run
for n in range(1, 10):
    if n == 6:
        break          # stop the loop completely
    if n % 2 == 0:
        continue       # skip the even numbers
    print(n)           # prints 1, 3, 5
```

### Loops inside loops
The inner loop runs **completely** for each pass of the outer loop. Two loops of 3 and 4 passes run the inner body 3 × 4 = 12 times.

```python run
for row in range(1, 4):
    for col in range(1, 4):
        print(row * col, end="\t")
    print()     # new line after each row
```

### Sentinel loops
A **sentinel** is a special value that means "stop". Use a `while` loop when you don't know how many times it will run:

```python
total = 0
num = int(input("Number (0 to stop): "))
while num != 0:
    total += num
    num = int(input("Number (0 to stop): "))
print("Total:", total)
```

> **Watch out for infinite loops.** If nothing inside a `while` loop ever makes the condition false, it never ends.

### QUIZ
Q: Consider the following code segment.
PTS: 1
```python
total = 0
for i in range(1, 10, 3):
    total += i
print(total)
```
ASK: What is printed as a result of executing the code segment?
- [x] 12
- [ ] 22
- [ ] 15
- [ ] 45
WHY: `range(1, 10, 3)` gives 1, 4 and 7. 1 + 4 + 7 = 12. It stops before 10.

Q: How many times is `*` printed when the following code segment runs?
PTS: 1
```python
for r in range(3):
    for c in range(r, 4):
        print("*", end="")
```
- [ ] 12
- [x] 9
- [ ] 6
- [ ] 10
WHY: When r is 0, c goes 0–3 (4 stars). When r is 1, c goes 1–3 (3 stars). When r is 2, c goes 2–3 (2 stars). 4 + 3 + 2 = 9.

Q: Consider the following code segment.
PTS: 1
```python
n = 0
while n < 20:
    n += 3
    if n % 2 == 0:
        continue
    print(n, end=" ")
```
ASK: What is printed as a result of executing the code segment?
- [x] 3 9 15 21
- [ ] 3 9 15
- [ ] 6 12 18
- [ ] 3 6 9 12 15 18
WHY: n takes the values 3, 6, 9, 12, 15, 18 and 21. Even values are skipped. When n is 18, the condition `18 < 20` is still true, so the loop runs once more, adds 3 and prints 21 before checking again.

Q: Which of the following code segments print the numbers 10 down to 1, one per line?
PTS: 1
OPT I:
```python
for i in range(10, 0, -1):
    print(i)
```
OPT II:
```python
for i in range(10, 1, -1):
    print(i)
```
OPT III:
```python
i = 10
while i > 0:
    print(i)
    i -= 1
```
- [ ] I only
- [ ] II only
- [x] I and III only
- [ ] I, II and III
WHY: II stops **before** 1, so it prints 10 down to 2. I and III both include 1.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
for word in ["cat", "dog", "emu", "fox"]:
    if "o" in word:
        break
    print(word)
```
- [x] cat
- [ ] cat dog
- [ ] cat emu
- [ ] cat emu fox
WHY: "cat" has no "o", so it prints. "dog" has an "o", so `break` ends the whole loop. "emu" and "fox" are never reached.

Q: Consider the following code segment.
PTS: 1
```python
count = 0
for i in range(1, 6):
    for j in range(i):
        count += 1
print(count)
```
ASK: What is printed as a result of executing the code segment?
- [ ] 5
- [ ] 25
- [x] 15
- [ ] 10
WHY: The inner loop runs i times: 1 + 2 + 3 + 4 + 5 = 15.


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

### LESSON Arguments, return values and scope | 10 | PCEP 4.1
### Parameters vs. arguments
A **parameter** is the name in the `def` line. An **argument** is the value you pass in when you call the function.

```python run
def power(base, exp=2):        # base and exp are parameters; exp has a default
    return base ** exp

print(power(3))                # 9   (exp uses its default)
print(power(2, 5))             # 32  (positional arguments)
print(power(exp=3, base=4))    # 64  (keyword arguments, any order)
```

Rules for calling:
- Positional arguments come **before** keyword arguments.
- Every parameter without a default must get a value.
- You can't give the same parameter two values.

### No return means None
A function without a `return` (or with a bare `return`) gives back `None`:

```python run
def shout(word):
    print(word.upper())

result = shout("hi")      # prints HI
print(result)             # None
```

### Returning several values
`return a, b` returns a **tuple**. You can unpack it:

```python run
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([4, 9, 1])
print(low, high)          # 1 9
```

### Scope
Variables made inside a function are **local**. They disappear when the function ends. To change a variable from outside (a **global**), you need the `global` keyword, but it's usually better to pass values in and return results.

```python run
count = 0
def bump():
    global count
    count += 1
bump()
bump()
print(count)    # 2
```

### *args and **kwargs
`*args` collects any number of extra positional arguments into a tuple. `**kwargs` collects extra keyword arguments into a dictionary.

```python run
def total(*nums):
    return sum(nums)
print(total(1, 2, 3, 4))    # 10
```

### QUIZ
Q: Consider the following function.
PTS: 1
```python
def f(x, y=2):
    return x ** y

print(f(3), f(2, 3), f(y=1, x=5))
```
ASK: What is printed as a result of executing the code segment?
- [x] 9 8 5
- [ ] 9 8 1
- [ ] 6 8 5
- [ ] An error occurs because of `f(y=1, x=5)`.
WHY: `f(3)` is 3² = 9. `f(2, 3)` is 2³ = 8. Keyword arguments can come in any order, so `f(y=1, x=5)` is 5¹ = 5.

Q: Consider the following code segment.
PTS: 1
```python
def add_one(n):
    n = n + 1

x = 5
add_one(x)
print(x, add_one(x))
```
ASK: What is printed as a result of executing the code segment?
- [x] 5 None
- [ ] 6 None
- [ ] 6 6
- [ ] 5 6
WHY: `n` is a local copy, so x stays 5. `add_one` has no `return`, so it returns `None`.

Q: Consider the following function.
PTS: 1
```python
def greet(name, greeting="Hi"):
    print(greeting + ", " + name)
```
ASK: Which of the following calls will cause an error?
OPT I: `greet("Ana")`
OPT II: `greet(greeting="Yo")`
OPT III: `greet("Ana", "Yo", "!")`
- [ ] I only
- [ ] III only
- [x] II and III only
- [ ] I, II and III
WHY: II never gives `name` a value, and it has no default. III passes three arguments to a function that takes at most two. I is fine because `greeting` has a default.

Q: The function `average(nums)` is intended to return the average of the numbers in the non-empty list `nums`.
PTS: 1
```python
def average(nums):
    /* missing code */
```
ASK: Which of the following can replace `/* missing code */` so that the function works as intended?
OPT I: `return sum(nums) / len(nums)`
OPT II: `return sum(nums) // len(nums)`
OPT III:
```python
total = 0
for n in nums:
    total += n
return total / len(nums)
```
- [ ] I only
- [x] I and III only
- [ ] II and III only
- [ ] I, II and III
WHY: II uses floor division, so `average([1, 2])` would return 1 instead of 1.5. I and III both divide the total by the count with `/`.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
def mystery(a, b):
    if a > b:
        return a - b
    return b - a

print(mystery(3, 8) + mystery(8, 3))
```
- [ ] 0
- [x] 10
- [ ] -10
- [ ] 5
WHY: Both calls return the distance between the numbers, which is 5. 5 + 5 = 10.


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

### QUIZ
Q: Consider the following code segment.
PTS: 1
```python
nums = [4, 8, 15, 16, 23, 42]
print(nums[1:4], nums[-2])
```
ASK: What is printed as a result of executing the code segment?
- [x] [8, 15, 16] 23
- [ ] [8, 15, 16, 23] 23
- [ ] [4, 8, 15] 42
- [ ] [8, 15, 16] 16
WHY: A slice stops **before** its end index, so `[1:4]` gives indexes 1, 2 and 3. Index -2 is the second from the end, 23.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
s = "computer"
print(s[::-1][:3])
```
- [ ] com
- [x] ret
- [ ] ert
- [ ] pmo
WHY: `s[::-1]` reverses the string to "retupmoc". `[:3]` takes the first three letters: "ret".

Q: Consider the following code segment.
PTS: 1
```python
a = [1, 2, 3]
b = a
c = a[:]
b.append(4)
print(len(a), len(c))
```
ASK: What is printed as a result of executing the code segment?
- [x] 4 3
- [ ] 3 3
- [ ] 4 4
- [ ] 3 4
WHY: `b = a` makes b another name for the **same** list, so appending through b changes a. `a[:]` makes a separate copy, so c still has 3 items.

Q: Which of the following create the list `[0, 2, 4, 6]`?
PTS: 1
OPT I: `[i * 2 for i in range(4)]`
OPT II: `list(range(0, 7, 2))`
OPT III: `[i for i in range(7) if i % 2 == 0]`
- [ ] I only
- [ ] I and II only
- [ ] II and III only
- [x] I, II and III
WHY: I doubles 0, 1, 2 and 3. II counts by 2 from 0 and stops before 7. III keeps the even numbers from 0 to 6. All three give `[0, 2, 4, 6]`.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
grid = [[1, 2, 3],
        [4, 5, 6]]
print(grid[1][0] + grid[0][2])
```
- [x] 7
- [ ] 5
- [ ] 6
- [ ] 9
WHY: `grid[1][0]` is row 1, column 0, which is 4. `grid[0][2]` is row 0, column 2, which is 3. 4 + 3 = 7.

Q: Consider the following code segment.
PTS: 1
```python
words = "the quick brown fox".split()
print(len(words), words[2].upper())
```
ASK: What is printed as a result of executing the code segment?
- [x] 4 BROWN
- [ ] 19 BROWN
- [ ] 4 QUICK
- [ ] 3 BROWN
WHY: `split()` breaks the text at spaces into 4 words. Index 2 is the third word, "brown".

## UNIT py6 | Tuples, Sets & Dictionaries
### LESSON Tuples and sets | 9 | PCEP 3.2, 3.3
### Tuples: lists that can't change
A **tuple** uses parentheses. Once it's made, you can't add, remove or change items (it's **immutable**).

```python run
point = (3, 7)
x, y = point            # unpacking
print(x + y)            # 10
print(point[0])         # 3
# point[0] = 5          # TypeError: tuples can't be changed
single = (5,)           # a one-item tuple needs the comma!
print(type((5)), type((5,)))
```

Use a tuple for data that belongs together and shouldn't change, like coordinates or an RGB color.

### Sets: no duplicates, no order
A **set** keeps only unique values. Checking `in` a set is very fast.

```python run
tags = {"python", "code", "python"}
print(len(tags))            # 2, duplicates are dropped
tags.add("loops")
tags.discard("code")
print("python" in tags)     # True

a = {1, 2, 3}
b = {2, 3, 4}
print(a | b, a & b, a - b)  # union, intersection, difference
```

> `{}` makes an empty **dictionary**, not a set. Use `set()` for an empty set.

### LESSON Dictionaries | 11 | PCEP 3.4
A **dictionary** stores **key → value** pairs. You look things up by key instead of by position.

```python run
ages = {"Ana": 15, "Ben": 16}
ages["Cy"] = 14          # add a new pair
ages["Ana"] = 16         # change a value
print(ages["Ben"])       # 16
print(ages.get("Zed", 0))   # 0  (get gives a default instead of a KeyError)
del ages["Cy"]
print(len(ages), "Ana" in ages)   # 2 True  (in checks the KEYS)
```

### Looping through a dictionary
```python run
scores = {"quiz": 90, "test": 82, "lab": 100}
for key in scores:                 # keys
    print(key)
for key, value in scores.items():  # both
    print(key, "=", value)
print(sum(scores.values()))        # 272
```

### Counting with a dictionary
This pattern shows up all the time:

```python run
counts = {}
for letter in "banana":
    counts[letter] = counts.get(letter, 0) + 1
print(counts)    # {'b': 1, 'a': 3, 'n': 2}
```

Keys must be immutable (strings, numbers, tuples). Lists can't be keys.

### QUIZ
Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
d = {"a": 1, "b": 2}
d["c"] = d["a"] + d["b"]
d["a"] = 10
print(sum(d.values()))
```
- [ ] 6
- [x] 15
- [ ] 13
- [ ] 16
WHY: d["c"] is set to 1 + 2 = 3 **before** d["a"] changes to 10. The values are then 10, 2 and 3, which add up to 15.

Q: Consider the following code segment.
PTS: 1
```python
counts = {}
for ch in "letter":
    counts[ch] = counts.get(ch, 0) + 1
print(counts["t"], len(counts))
```
ASK: What is printed as a result of executing the code segment?
- [x] 2 4
- [ ] 2 6
- [ ] 1 4
- [ ] 2 3
WHY: "letter" has l, e, t, t, e, r. "t" appears twice. The unique letters are l, e, t and r, so the dictionary has 4 keys.

Q: Which of the following statements will cause an error?
PTS: 1
OPT I: `t = (1, 2, 3)` followed by `t[0] = 5`
OPT II: `d = {[1, 2]: "pair"}`
OPT III: `s = {1, 2}` followed by `s.add(2)`
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: Tuples can't be changed (I) and lists can't be dictionary keys because they are mutable (II). Adding a value that's already in a set is allowed; nothing happens.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(len(a | b), len(a & b))
```
- [x] 5 2
- [ ] 7 2
- [ ] 5 3
- [ ] 2 5
WHY: The union `a | b` is {1, 2, 3, 4, 5}, which has 5 items. The intersection `a & b` is {3, 4}, which has 2.

Q: Which expression gives the value stored for the key "Ben", or 0 if "Ben" is not a key in the dictionary `ages`?
- [ ] `ages["Ben"]`
- [x] `ages.get("Ben", 0)`
- [ ] `ages.get(0, "Ben")`
- [ ] `ages.index("Ben")`
WHY: `get(key, default)` returns the default instead of raising a KeyError when the key is missing.

### TRACE
Q: What is printed?
```python
inventory = {"apple": 3, "pear": 0, "kiwi": 5}
for fruit, n in inventory.items():
    if n == 0:
        continue
    print(fruit, n * 2)
```
- [x] apple 6, then kiwi 10
- [ ] apple 6, pear 0, kiwi 10
- [ ] apple 3, then kiwi 5
- [ ] kiwi 10
WHY: pear has 0, so `continue` skips it. The others print their count doubled.

Q: What is printed?
```python
pts = [(1, 2), (3, 4), (5, 6)]
total = 0
for x, y in pts:
    total += x * y
print(total)
```
- [ ] 21
- [x] 44
- [ ] 48
- [ ] 12
WHY: 1·2 + 3·4 + 5·6 = 2 + 12 + 30 = 44.

## UNIT py7 | Errors, Files & Modules
### LESSON Exceptions: try and except | 10 | PCEP 4.2
When something goes wrong while a program runs, Python **raises an exception**. If nothing handles it, the program stops.

| Exception | Example that causes it |
|---|---|
| `ZeroDivisionError` | `5 / 0` |
| `ValueError` | `int("abc")` |
| `TypeError` | `"5" + 1` |
| `IndexError` | `[1, 2][5]` |
| `KeyError` | `{"a": 1}["b"]` |
| `NameError` | using a variable that was never made |

### Catching exceptions
```python run
def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Can't divide by zero!")
        return None

print(safe_div(10, 4))
print(safe_div(1, 0))
```

When an error happens inside `try`, Python **jumps straight to** the matching `except`. The rest of the `try` block is skipped. You can have several `except` branches, and Python uses the **first** one that matches.

```python run
for text in ["12", "abc", "0"]:
    try:
        n = int(text)
        print(100 / n)
    except ValueError:
        print("not a number:", text)
    except ZeroDivisionError:
        print("zero!")
```

> Avoid a bare `except:`. It catches every error, even typos in your own code, and hides bugs.

### LESSON Files and the csv module | 9 | PCEP 5.1
Use `with open(...)` so the file closes automatically.

| Mode | Meaning |
|---|---|
| `"r"` | read (the default). Error if the file doesn't exist. |
| `"w"` | write. **Erases** the file first, or creates it. |
| `"a"` | append to the end, or create it. |

```python
with open("notes.txt", "w") as f:
    f.write("line one\n")
    f.write("line two\n")

with open("notes.txt") as f:
    for line in f:
        print(line.strip())     # strip removes the "\n"
```

### CSV files
CSV means *comma-separated values*, like a simple spreadsheet:

```python
import csv
with open("grades.csv") as f:
    reader = csv.reader(f)
    next(reader)                  # skip the header row
    for name, score in reader:
        print(name, int(score) + 5)
```

Every value from a CSV file is a **string**. Convert before doing math.

### LESSON Modules: math and random | 8 | PCEP 5.2
```python run
import math
print(math.sqrt(49))                 # 7.0
print(math.ceil(2.1), math.floor(2.9), math.trunc(-2.7))   # 3 2 -2
print(math.pi)

from random import randint, choice, seed
seed(42)                  # same seed = same "random" numbers every run
print(randint(1, 6))      # 1 to 6, BOTH included
print(choice(["rock", "paper", "scissors"]))
```

- `import math` → use `math.sqrt(...)`.
- `from math import sqrt` → use `sqrt(...)` directly.
- `random.random()` gives a float from 0.0 up to (but not including) 1.0.
- `random.sample(lst, k)` picks k different items.

### QUIZ
Q: Consider the following code segment.
PTS: 1
```python
try:
    x = int("7")
    y = x / 0
    print("A")
except ValueError:
    print("B")
except ZeroDivisionError:
    print("C")
print("D")
```
ASK: What is printed as a result of executing the code segment?
- [ ] A D
- [ ] B D
- [x] C D
- [ ] C
WHY: `int("7")` works. `x / 0` raises ZeroDivisionError, so "A" is skipped and Python jumps to that `except`, printing C. Then the program continues and prints D.

Q: Which of the following code segments will raise an exception that is NOT caught?
PTS: 1
OPT I:
```python
try:
    print([1, 2, 3][3])
except IndexError:
    print("oops")
```
OPT II:
```python
try:
    print({"a": 1}["b"])
except IndexError:
    print("oops")
```
OPT III:
```python
try:
    print(int("3.5"))
except ValueError:
    print("oops")
```
- [ ] I only
- [x] II only
- [ ] II and III only
- [ ] I, II and III
WHY: A missing dictionary key raises KeyError, not IndexError, so II's `except` doesn't match. I raises IndexError, which is caught. `int("3.5")` raises ValueError, which is caught.

Q: A program needs to add a new line to the end of an existing file `log.txt` without erasing what is already in it. Which mode should be used with `open`?
- [ ] "r"
- [ ] "w"
- [x] "a"
- [ ] "x"
WHY: "a" (append) writes at the end. "w" would erase the file first.

Q: Which of the following can be the value of `n` after the code segment is executed?
PTS: 1
```python
import random
n = random.randint(1, 5) * 2
```
OPT I: 1
OPT II: 6
OPT III: 10
- [ ] II only
- [x] II and III only
- [ ] I, II and III
- [ ] III only
WHY: `randint(1, 5)` gives 1 to 5 including both ends. Doubled, n can be 2, 4, 6, 8 or 10. It can never be odd.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```python
import math
print(math.ceil(4.2) + math.floor(-1.5))
```
- [ ] 4
- [x] 3
- [ ] 5
- [ ] 6
WHY: `ceil(4.2)` rounds up to 5. `floor(-1.5)` rounds **down** to -2. 5 + (-2) = 3.

### BUG
Q: This code should keep asking until the user types a whole number, then print double it. Which line is wrong?
```python
while True:
    try:
        n = int(input("Number: "))
    except ValueError:
        print("Try again")
    print(n * 2)
    break
```
LINE: 6
FIX: Move `print(n * 2)` and `break` into an `else:` block (or into the `try` after the `int(...)` line) so they only run when the input worked.
WHY: After a bad input, the `except` runs and then the code falls through to `print(n * 2)`, where n doesn't exist yet. That raises a NameError.

