<!-- Coding exercises (JuiceMind-style). This file adds items to units defined in the course files. -->

## UNIT py1

### EXERCISE Hello, World! | python | 5
Print exactly `Hello, World!` to the screen. Capital H, a comma, a capital W and an exclamation mark.

STARTER
```python
# Print Hello, World! below

```
TESTS
```python
assert __out.strip() != "", "Nothing was printed. Use print(...)"
assert __out.strip().splitlines()[0] == "Hello, World!", "The first line should be exactly: Hello, World!"
```
SOLUTION
```python
print("Hello, World!")
```
HINT: Text goes inside quotes: `print("...")`

### EXERCISE Minutes to hours | python | 10
Write a function `split_time(minutes)` that **returns** a pair `(hours, leftover_minutes)`.

For example, `split_time(135)` returns `(2, 15)`. Use `//` and `%`.

STARTER
```python
def split_time(minutes):
    # return (hours, leftover_minutes)
    pass

print(split_time(135))
```
TESTS
```python
assert split_time(135) == (2, 15), "split_time(135) should return (2, 15)"
assert split_time(59) == (0, 59), "split_time(59) should return (0, 59)"
assert split_time(120) == (2, 0), "split_time(120) should return (2, 0)"
```
SOLUTION
```python
def split_time(minutes):
    return (minutes // 60, minutes % 60)

print(split_time(135))
```
HINT: `minutes // 60` gives the whole hours, and `minutes % 60` gives what's left over.

## UNIT py2

### EXERCISE Letter grade | python | 10
Write `letter_grade(score)` that returns `"A"` for 90 and up, `"B"` for 80 to 89, `"C"` for 70 to 79, `"D"` for 60 to 69, and `"F"` for anything lower.

STARTER
```python
def letter_grade(score):
    pass

print(letter_grade(85))
```
TESTS
```python
assert letter_grade(95) == "A", "95 should be an A"
assert letter_grade(90) == "A", "90 should be an A (90 counts!)"
assert letter_grade(85) == "B", "85 should be a B"
assert letter_grade(70) == "C", "70 should be a C"
assert letter_grade(61) == "D", "61 should be a D"
assert letter_grade(12) == "F", "12 should be an F"
```
SOLUTION
```python
def letter_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"
```
HINT: Check from the highest grade down with `if` / `elif` / `else`, using `>=`.

### EXERCISE Leap years | python | 10
A year is a **leap year** if it's divisible by 4. The exception is years divisible by 100, which are *not* leap years, unless they're also divisible by 400. Write `is_leap(year)` that returns `True` or `False`.

STARTER
```python
def is_leap(year):
    pass
```
TESTS
```python
assert is_leap(2024) == True, "2024 is a leap year"
assert is_leap(2023) == False, "2023 is not a leap year"
assert is_leap(1900) == False, "1900 is NOT a leap year (divisible by 100)"
assert is_leap(2000) == True, "2000 IS a leap year (divisible by 400)"
```
SOLUTION
```python
def is_leap(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
```
HINT: `year % 4 == 0` checks for divisible by 4. Combine the rules with `and` and `or`.

### EXERCISE Even or odd | python | 6
Write `parity(n)` that returns the string `"even"` if `n` is even and `"odd"` if it's odd.

STARTER
```python
def parity(n):
    # use if / else and the % operator
    pass

print(parity(7))
```
TESTS
```python
assert parity(4) == "even", 'parity(4) should be "even"'
assert parity(7) == "odd", 'parity(7) should be "odd"'
assert parity(0) == "even", 'parity(0) should be "even"'
assert parity(-3) == "odd", 'parity(-3) should be "odd"'
```
SOLUTION
```python
def parity(n):
    if n % 2 == 0:
        return "even"
    else:
        return "odd"

print(parity(7))
```
HINT: A number is even when `n % 2 == 0`.
HINT: Use `if n % 2 == 0:` to return `"even"`, then `else:` to return `"odd"`.

### EXERCISE Movie ticket prices | python | 12
Write `ticket_price(age, is_student)` that returns the price:
- Under 5: **0** (free)
- 5 to 12: **8**
- 65 and over: **9**
- Anyone else who is a student: **10**
- Everyone else: **14**

STARTER
```python
def ticket_price(age, is_student):
    pass
```
TESTS
```python
assert ticket_price(3, False) == 0, "Kids under 5 are free"
assert ticket_price(5, False) == 8, "Age 5 costs 8"
assert ticket_price(12, True) == 8, "Age 12 costs 8, even for a student"
assert ticket_price(70, False) == 9, "Seniors (65 and up) pay 9"
assert ticket_price(16, True) == 10, "Students pay 10"
assert ticket_price(16, False) == 14, "Everyone else pays 14"
assert ticket_price(65, True) == 9, "65 counts as a senior"
```
SOLUTION
```python
def ticket_price(age, is_student):
    if age < 5:
        return 0
    elif age <= 12:
        return 8
    elif age >= 65:
        return 9
    elif is_student:
        return 10
    else:
        return 14
```
HINT: Use one `if`/`elif`/`else` chain. Check the age groups first, then `is_student`.
HINT: The order is: `age < 5`, then `age <= 12`, then `age >= 65`, then `is_student`, then `else`.

### EXERCISE Rock, paper, scissors | python | 14
Write `winner(p1, p2)` where each move is `"rock"`, `"paper"` or `"scissors"`. Return `"p1"`, `"p2"` or `"tie"`.
Rock beats scissors, scissors beats paper, and paper beats rock.

STARTER
```python
def winner(p1, p2):
    if p1 == p2:
        return "tie"
    # when does p1 win?

    return "p2"
```
TESTS
```python
assert winner("rock", "rock") == "tie", "Same move means a tie"
assert winner("rock", "scissors") == "p1", "Rock beats scissors"
assert winner("scissors", "paper") == "p1", "Scissors beat paper"
assert winner("paper", "rock") == "p1", "Paper beats rock"
assert winner("rock", "paper") == "p2", "Paper beats rock, so p2 wins"
assert winner("paper", "scissors") == "p2", "Scissors beat paper, so p2 wins"
```
SOLUTION
```python
def winner(p1, p2):
    if p1 == p2:
        return "tie"
    if (p1 == "rock" and p2 == "scissors") or (p1 == "scissors" and p2 == "paper") or (p1 == "paper" and p2 == "rock"):
        return "p1"
    return "p2"
```
HINT: p1 wins in exactly three cases. Join them with `or`, and use `and` inside each one.
HINT: `(p1 == "rock" and p2 == "scissors") or (...) or (...)`

### FILL if / elif / else syntax
Q: Fill in the blanks so this prints the right message for any temperature.
```python
temp = 72
[[if]] temp > 85:
    print("Hot")
[[elif]] temp > 60[[:]]
    print("Nice")
[[else]]:
    print("Cold")
```
WHY: The chain is `if`, then `elif` for each extra condition, then `else`. Every line in the chain ends with a colon.

### FILL Logical operators
Q: Fill in `and`, `or` or `not`.
```python
# True only if BOTH are true
can_drive = age >= 16 [[and]] has_license
# True if EITHER day matches
is_weekend = day == "Sat" [[or]] day == "Sun"
# flips True and False
is_closed = [[not]] is_open
```
WHY: `and` needs both to be True, `or` needs at least one, and `not` flips the value.

## UNIT py3

### EXERCISE Sum to n | python | 10
Write `sum_to(n)` that uses a **loop** to add up `1 + 2 + ... + n` and returns the total. `sum_to(0)` should return `0`.

STARTER
```python
def sum_to(n):
    total = 0
    # loop here
    return total
```
TESTS
```python
assert sum_to(10) == 55, "sum_to(10) should be 55"
assert sum_to(1) == 1, "sum_to(1) should be 1"
assert sum_to(0) == 0, "sum_to(0) should be 0"
assert sum_to(100) == 5050, "sum_to(100) should be 5050"
```
SOLUTION
```python
def sum_to(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
```
HINT: `range(1, n + 1)` includes n.

### EXERCISE FizzBuzz | python | 12
Print the numbers from 1 to 15, one per line, with three exceptions:
- For multiples of 3, print `Fizz` instead.
- For multiples of 5, print `Buzz` instead.
- For multiples of both, print `FizzBuzz` instead.

STARTER
```python
for i in range(1, 16):
    print(i)
```
TESTS
```python
assert len(__out.split()) == 15, "Print exactly 15 lines"
assert __out.split()[0] == "1", "Line 1 should be 1"
assert __out.split()[2] == "Fizz", "Line 3 should be Fizz"
assert __out.split()[4] == "Buzz", "Line 5 should be Buzz"
assert __out.split()[14] == "FizzBuzz", "Line 15 should be FizzBuzz"
```
SOLUTION
```python
for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
```
HINT: Check the "both" case (`i % 15 == 0`) first.

### EXERCISE Count the passing scores | python | 10
**Loops + if:** write `count_passing(scores)` that returns how many scores are **70 or higher**.

STARTER
```python
def count_passing(scores):
    count = 0
    for s in scores:
        pass  # use an if statement here
    return count
```
TESTS
```python
assert count_passing([90, 65, 70, 40]) == 2, "90 and 70 pass, so the answer is 2"
assert count_passing([]) == 0, "An empty list gives 0"
assert count_passing([69, 69]) == 0, "69 isn't passing"
assert count_passing([100, 100, 100]) == 3, "All three pass"
```
SOLUTION
```python
def count_passing(scores):
    count = 0
    for s in scores:
        if s >= 70:
            count += 1
    return count
```
HINT: Inside the loop, write `if s >= 70:` and add 1 to `count`.

## UNIT py4

### EXERCISE Count the vowels | python | 10
Write `count_vowels(word)` that returns how many vowels (a, e, i, o, u) the word contains. Count uppercase vowels too.

STARTER
```python
def count_vowels(word):
    pass
```
TESTS
```python
assert count_vowels("banana") == 3, "banana has 3 vowels"
assert count_vowels("rhythm") == 0, "rhythm has 0 vowels"
assert count_vowels("AEIOU") == 5, "Count uppercase vowels too"
assert count_vowels("") == 0, "An empty string has 0 vowels"
```
SOLUTION
```python
def count_vowels(word):
    count = 0
    for ch in word.lower():
        if ch in "aeiou":
            count += 1
    return count
```
HINT: Loop over `word.lower()` and check `if ch in "aeiou"`.

### EXERCISE Largest of three | python | 8
Write `largest(a, b, c)` that returns the biggest of three numbers. **Don't** use the built-in `max()`. Use `if` statements instead.

STARTER
```python
def largest(a, b, c):
    pass
```
TESTS
```python
assert largest(1, 2, 3) == 3, "largest(1, 2, 3) should be 3"
assert largest(9, 2, 3) == 9, "largest(9, 2, 3) should be 9"
assert largest(4, 7, 5) == 7, "largest(4, 7, 5) should be 7"
assert largest(-5, -2, -9) == -2, "Works with negative numbers"
```
SOLUTION
```python
def largest(a, b, c):
    best = a
    if b > best:
        best = b
    if c > best:
        best = c
    return best
```
HINT: Start with `best = a`, then compare it with `b` and with `c`.

## UNIT py5

### EXERCISE Average of a list | python | 10
Write `average(nums)` that returns the average of a list of numbers. If the list is empty, return `0` (don't divide by zero!).

STARTER
```python
def average(nums):
    pass
```
TESTS
```python
assert average([90, 80, 70]) == 80, "average([90, 80, 70]) should be 80"
assert average([5]) == 5, "average([5]) should be 5"
assert average([]) == 0, "An empty list should return 0"
assert abs(average([1, 2]) - 1.5) < 1e-9, "average([1, 2]) should be 1.5"
```
SOLUTION
```python
def average(nums):
    if len(nums) == 0:
        return 0
    return sum(nums) / len(nums)
```
HINT: Check `len(nums) == 0` first.

### EXERCISE Reverse the words | python | 10
Write `reverse_words(sentence)` that reverses the **order of the words**. For example, `"I love CS"` becomes `"CS love I"`.

STARTER
```python
def reverse_words(sentence):
    pass
```
TESTS
```python
assert reverse_words("I love CS") == "CS love I", '"I love CS" should become "CS love I"'
assert reverse_words("hello") == "hello", "A single word stays the same"
assert reverse_words("a b c d") == "d c b a", '"a b c d" should become "d c b a"'
```
SOLUTION
```python
def reverse_words(sentence):
    words = sentence.split()
    return " ".join(words[::-1])
```
HINT: Use `.split()` to get a list, reverse it with `[::-1]`, then `" ".join(...)` it back together.

## UNIT web1

### EXERCISE Build a profile page | html | 12
Build a small "about me" page. It needs:
1. An `<h1>` with your nickname
2. A `<p>` that says something about you
3. An `<img>` with an `alt` description (any `src` is fine)
4. A `<ul>` with **at least 3** `<li>` items (your favorite languages or games)
5. A link `<a>` with an `href`

STARTER
```html
<!DOCTYPE html>
<html>
  <head>
    <title>About me</title>
  </head>
  <body>
    <!-- build your page here -->

  </body>
</html>
```
TESTS
```js
assert(doc.querySelector("h1") && doc.querySelector("h1").textContent.trim(), "Add an <h1> with text in it")
assert(doc.querySelector("p") && doc.querySelector("p").textContent.trim(), "Add a <p> paragraph with text")
assert(doc.querySelector("img") && (doc.querySelector("img").getAttribute("alt") || "").trim(), "Add an <img> with an alt description")
assert(doc.querySelectorAll("ul li").length >= 3, "Add a <ul> with at least 3 <li> items")
assert(doc.querySelector("a[href]"), "Add a link: <a href=\"...\">")
```
SOLUTION
```html
<!DOCTYPE html>
<html>
  <head>
    <title>About me</title>
  </head>
  <body>
    <h1>ByteSized</h1>
    <p>I'm a sophomore who likes building games.</p>
    <img src="me.png" alt="A cartoon fox wearing headphones">
    <ul>
      <li>Python</li>
      <li>JavaScript</li>
      <li>Java</li>
    </ul>
    <a href="https://example.com">My projects</a>
  </body>
</html>
```
HINT: Put everything inside `<body>`. Each `<li>` goes inside the `<ul>`.

## UNIT web2

### EXERCISE Style a button | html | 10
Make the `.btn` button look like a real button with CSS. It needs:
1. A `background-color`
2. Rounded corners (`border-radius` greater than 0)
3. `padding`
4. White text (`color: white`)

STARTER
```html
<style>
  .btn {
    /* your CSS here */
  }
</style>

<button class="btn">Start studying</button>
```
TESTS
```js
assert(win.getComputedStyle(doc.querySelector(".btn")).borderRadius !== "0px", "Give .btn a border-radius")
assert(parseFloat(win.getComputedStyle(doc.querySelector(".btn")).paddingLeft) > 2, "Give .btn some padding")
assert(win.getComputedStyle(doc.querySelector(".btn")).color === "rgb(255, 255, 255)", "Make the text white: color: white")
assert(!["rgba(0, 0, 0, 0)", "rgb(239, 239, 239)", "rgb(240, 240, 240)"].includes(win.getComputedStyle(doc.querySelector(".btn")).backgroundColor), "Set a background-color")
```
SOLUTION
```html
<style>
  .btn {
    background-color: #2563eb;
    color: white;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
  }
</style>

<button class="btn">Start studying</button>
```
HINT: Each property ends with a semicolon, like `padding: 10px 18px;`

### EXERCISE Center with flexbox | html | 10
Use flexbox to put the three boxes **in a row** and **center them horizontally** inside `.row`.

STARTER
```html
<style>
  .row {
    /* make this a flex container and center the items */
  }
  .box { width: 60px; height: 60px; background: tomato; margin: 4px; }
</style>

<div class="row">
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
</div>
```
TESTS
```js
assert(win.getComputedStyle(doc.querySelector(".row")).display === "flex", "Set display: flex on .row")
assert(win.getComputedStyle(doc.querySelector(".row")).justifyContent === "center", "Center the items with justify-content: center")
```
SOLUTION
```html
<style>
  .row {
    display: flex;
    justify-content: center;
  }
  .box { width: 60px; height: 60px; background: tomato; margin: 4px; }
</style>

<div class="row">
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
</div>
```
HINT: You need two lines: `display: flex;` and `justify-content: center;`

## UNIT web3

### EXERCISE Celsius to Fahrenheit | js | 8
Write a function `celsiusToF(c)` that returns the temperature in Fahrenheit. The formula is F = C × 9/5 + 32.

STARTER
```js
function celsiusToF(c) {
  // return the Fahrenheit value
}

console.log(celsiusToF(100));
```
TESTS
```js
assert(celsiusToF(0) === 32, "celsiusToF(0) should be 32")
assert(celsiusToF(100) === 212, "celsiusToF(100) should be 212")
assert(celsiusToF(-40) === -40, "celsiusToF(-40) should be -40")
```
SOLUTION
```js
function celsiusToF(c) {
  return c * 9 / 5 + 32;
}

console.log(celsiusToF(100));
```
HINT: Don't forget `return`.

### EXERCISE Count the evens | js | 10
Write `countEvens(arr)` that returns how many numbers in the array are even.

STARTER
```js
function countEvens(arr) {
  let count = 0;
  // loop through arr
  return count;
}
```
TESTS
```js
assert(countEvens([1, 2, 3, 4]) === 2, "countEvens([1, 2, 3, 4]) should be 2")
assert(countEvens([]) === 0, "An empty array should give 0")
assert(countEvens([7, 9, 11]) === 0, "countEvens([7, 9, 11]) should be 0")
assert(countEvens([0, -2, 10]) === 3, "0, -2 and 10 are all even")
```
SOLUTION
```js
function countEvens(arr) {
  let count = 0;
  for (const n of arr) {
    if (n % 2 === 0) count++;
  }
  return count;
}
```
HINT: `n % 2 === 0` means n is even.

### EXERCISE Ticket price (JavaScript) | js | 10
Write `ticketPrice(age)` using `if` / `else if` / `else`:
- Under 5: `0`
- 5 to 12: `8`
- 65 and over: `9`
- Everyone else: `14`

STARTER
```js
function ticketPrice(age) {
  // if / else if / else
}

console.log(ticketPrice(30));
```
TESTS
```js
assert(ticketPrice(2) === 0, "Under 5 is free")
assert(ticketPrice(12) === 8, "12 costs 8")
assert(ticketPrice(65) === 9, "65 costs 9")
assert(ticketPrice(30) === 14, "30 costs 14")
```
SOLUTION
```js
function ticketPrice(age) {
  if (age < 5) {
    return 0;
  } else if (age <= 12) {
    return 8;
  } else if (age >= 65) {
    return 9;
  } else {
    return 14;
  }
}

console.log(ticketPrice(30));
```
HINT: In JavaScript, the condition goes in parentheses and the block goes in braces: `if (age < 5) { ... }`.

### EXERCISE Day type with switch | js | 10
Write `dayType(day)` using a **switch** statement. Return `"weekend"` for `"Sat"` or `"Sun"`, `"weekday"` for `"Mon"` to `"Fri"`, and `"unknown"` for anything else.

STARTER
```js
function dayType(day) {
  switch (day) {
    // your cases here
  }
}
```
TESTS
```js
assert(dayType("Sat") === "weekend", "Sat is the weekend")
assert(dayType("Sun") === "weekend", "Sun is the weekend")
assert(dayType("Wed") === "weekday", "Wed is a weekday")
assert(dayType("Mon") === "weekday", "Mon is a weekday")
assert(dayType("Funday") === "unknown", "Anything else is unknown")
```
SOLUTION
```js
function dayType(day) {
  switch (day) {
    case "Sat":
    case "Sun":
      return "weekend";
    case "Mon":
    case "Tue":
    case "Wed":
    case "Thu":
    case "Fri":
      return "weekday";
    default:
      return "unknown";
  }
}
```
HINT: Stack several `case` lines to share one result. `default:` catches everything else.

## UNIT web4

### EXERCISE Click counter | html | 12
Make the button work: each click should add 1 to the number in `#count`.

STARTER
```html
<button id="btn">Click me</button>
<p>Clicks: <span id="count">0</span></p>

<script>
  let clicks = 0;
  const btn = document.querySelector("#btn");
  const count = document.querySelector("#count");
  // add a click event listener here

</script>
```
TESTS
```js
assert(doc.querySelector("#btn") && doc.querySelector("#count"), "Keep the #btn and #count elements")
assert((doc.querySelector("#btn").click(), doc.querySelector("#count").textContent.trim() === "1"), "After 1 click, #count should show 1")
assert((doc.querySelector("#btn").click(), doc.querySelector("#count").textContent.trim() === "2"), "After 2 clicks, #count should show 2")
```
SOLUTION
```html
<button id="btn">Click me</button>
<p>Clicks: <span id="count">0</span></p>

<script>
  let clicks = 0;
  const btn = document.querySelector("#btn");
  const count = document.querySelector("#count");
  btn.addEventListener("click", () => {
    clicks++;
    count.textContent = clicks;
  });
</script>
```
HINT: `btn.addEventListener("click", () => { ... })`. Inside it, add 1 to `clicks` and set `count.textContent`.

## UNIT csp1

### FILL Fix the average
Q: Fill in the blank so this always displays the correct average.
```pseudo
sum ← 0
FOR EACH n IN nums
{
   sum ← sum + n
}
avg ← sum / [[LENGTH(nums)]]
DISPLAY(avg)
```
WHY: Divide the total by how many items are in the list, `LENGTH(nums)`.

## UNIT csp2

### FILL Binary facts
Q: Fill in the blanks.
```text
13 in binary is [[1101]]
The largest number 8 bits can hold is [[255]]
With 5 bits you can represent [[32]] different values
```
WHY: 13 = 8 + 4 + 1, so it's 1101. 8 bits hold 0 to 255. And 2⁵ = 32 values.

## UNIT csp3

### FILL Count the evens
Q: Complete the procedure so it returns how many numbers in `list` are even.
```pseudo
PROCEDURE countEvens(list)
{
   count ← 0
   FOR EACH n IN list
   {
      IF (n MOD 2 = [[0]])
      {
         count ← count + [[1]]
      }
   }
   RETURN([[count]])
}
```
WHY: A number is even when `n MOD 2 = 0`. Add 1 for each even number, then return the count.

### FILL IF / ELSE in AP pseudocode
Q: Complete the procedure so it returns "pass" when `score` is at least 70, and "retry" otherwise.
```pseudo
PROCEDURE check(score)
{
   [[IF]] (score [[≥|>=]] 70)
   {
      RETURN("pass")
   }
   [[ELSE]]
   {
      RETURN("retry")
   }
}
```
WHY: AP pseudocode writes `IF (condition)` and `ELSE`, with the blocks in braces. "At least" is `≥`.

### FILL Binary search setup
Q: Fill in the blanks about searching.
```text
Binary search only works if the list is [[sorted]].
On a sorted list of 1,000 items, binary search needs at most about [[10]] checks.
```
WHY: Binary search halves the list each time, and 2¹⁰ = 1024, so about 10 checks.

## UNIT csp4

### FILL Internet protocols
Q: Fill in each protocol name.
```text
[[DNS]] turns names like example.com into IP addresses.
[[TCP]] puts packets back in order and resends lost ones.
[[HTTPS]] is the encrypted version of the web protocol.
```
WHY: DNS is the Internet's phone book, TCP handles reliable delivery, and HTTPS is HTTP plus encryption.

## UNIT csa1

### FILL Casting and Strings
Q: Fill in the blanks so `avg` is a real decimal average and `initial` is the first letter of `name`.
```java
int total = 17;
int count = 5;
double avg = [[(double)]] total / count;
String initial = name.substring(0, [[1]]);
```
WHY: Casting to `(double)` first avoids int division. `substring(0, 1)` gives the first character.

### FILL Roll a die
Q: Complete this so `roll` is a random int from 1 to 6.
```java
int roll = (int) (Math.random() * [[6]]) + [[1]];
```
WHY: `Math.random() * 6` is in [0, 6), casting gives 0 to 5, and `+ 1` shifts it to 1 to 6.

## UNIT csa2

### FILL Count the a's
Q: Complete the loop so it counts how many times "a" appears in `str`.
```java
int count = 0;
for (int i = 0; i [[<]] str.length(); i++) {
    if (str.substring(i, i + 1).[[equals]]("a")) {
        count[[++]];
    }
}
```
WHY: Loop while `i < str.length()`, compare Strings with `.equals`, and add to the count with `count++`.

### FILL De Morgan's Law
Q: Rewrite `!(x > 5 && y < 3)` without the `!`.
```java
x [[<=]] 5 [[||]] y [[>=]] 3
```
WHY: Push the `!` inside: flip `&&` to `||` and negate each comparison. `!(x > 5)` becomes `x <= 5`, and `!(y < 3)` becomes `y >= 3`.

### FILL if / else if in Java
Q: Complete the grading chain.
```java
if (score >= 90) [[{]]
    grade = "A";
} [[else if]] (score >= 80) {
    grade = "B";
} [[else]] {
    grade = "C";
}
```
WHY: Java puts each block in braces `{ }`. Use `else if` (two words) for extra conditions, and `else` for everything left over.

### FILL Comparing Strings in an if
Q: Make this check work for any String the user types.
```java
if (answer.[[equals]]("yes") [[&&]] !done) {
    System.out.println("Let's go!");
}
```
WHY: Compare String contents with `.equals`, and combine conditions with `&&` (and).

## UNIT csa3

### FILL Write the Dog class
Q: Complete the class.
```java
public class Dog {
    private String name;
    private [[static]] int dogCount = 0;   // shared by ALL dogs

    public Dog(String name) {
        [[this.name]] = name;
        dogCount++;
    }

    public [[String]] getName() {
        return name;
    }
}
```
WHY: `static` makes one shared counter. `this.name` sets the instance variable instead of the parameter. The getter returns a `String`.

## UNIT csa4

### FILL Sum an ArrayList
Q: Complete the loop that adds up every number in `list` (an `ArrayList<Integer>`).
```java
int total = 0;
for (int i = 0; i < list.[[size()]]; i++) {
    total += list.[[get(i)]];
}
```
WHY: ArrayLists use `.size()` for their length and `.get(i)` to read an element.

### FILL Traverse a 2D array
Q: Complete the row-major traversal of `grid`.
```java
for (int r = 0; r < grid.[[length]]; r++) {
    for (int c = 0; c < grid[r].[[length]]; c++) {
        System.out.print(grid[r][c] + " ");
    }
}
```
WHY: `grid.length` is the number of rows, and `grid[r].length` is the number of columns in row r.

### FILL Recursive factorial
Q: Complete the recursive factorial method.
```java
public static int factorial(int n) {
    if (n [[<=]] 1) {
        return [[1]];
    }
    return n * factorial([[n - 1]]);
}
```
WHY: The base case stops at 1, and each recursive call moves toward it with `n - 1`.

## UNIT cy1

### FILL The CIA triad
Q: Name all three parts of the CIA triad.
```text
C = [[Confidentiality]]
I = [[Integrity]]
A = [[Availability]]
```
WHY: Confidentiality, Integrity and Availability are the three goals of information security.

## UNIT cy2

### EXERCISE Password strength checker | python | 14
Write `strength(pw)` that returns:
- `"strong"` if the password is **at least 12 characters** AND has at least one **digit** AND at least one **uppercase letter**
- `"medium"` if it's at least 8 characters, but not strong
- `"weak"` otherwise

STARTER
```python
def strength(pw):
    has_digit = False
    has_upper = False
    for ch in pw:
        pass  # check ch.isdigit() and ch.isupper()

    return "weak"
```
TESTS
```python
assert strength("abc") == "weak", '"abc" is weak'
assert strength("password") == "medium", '"password" (8 characters) is medium'
assert strength("longpassword12") == "medium", "No uppercase, so it's medium"
assert strength("Purple-Tiger-42") == "strong", '"Purple-Tiger-42" is strong'
assert strength("ABCDEFGHIJKL") == "medium", "No digit, so it's medium"
```
SOLUTION
```python
def strength(pw):
    has_digit = False
    has_upper = False
    for ch in pw:
        if ch.isdigit():
            has_digit = True
        if ch.isupper():
            has_upper = True
    if len(pw) >= 12 and has_digit and has_upper:
        return "strong"
    if len(pw) >= 8:
        return "medium"
    return "weak"
```
HINT: Set `has_digit` and `has_upper` to True inside the loop, then check the length rules.

## UNIT cy3

### EXERCISE Caesar cipher | python | 15
Write `caesar(text, shift)` that shifts every **uppercase letter** by `shift` places and wraps around after Z. Leave spaces and punctuation unchanged. A negative shift should decrypt.

STARTER
```python
def caesar(text, shift):
    out = ""
    for ch in text:
        out += ch   # change this
    return out

print(caesar("HELLO, WORLD", 3))
```
TESTS
```python
assert caesar("ABC", 1) == "BCD", 'caesar("ABC", 1) should be "BCD"'
assert caesar("XYZ", 3) == "ABC", "Wrap around after Z"
assert caesar("HELLO, WORLD", 3) == "KHOOR, ZRUOG", "Leave spaces and punctuation unchanged"
assert caesar(caesar("ATTACK AT DAWN", 7), -7) == "ATTACK AT DAWN", "A negative shift should decrypt"
```
SOLUTION
```python
def caesar(text, shift):
    out = ""
    for ch in text:
        if "A" <= ch <= "Z":
            out += chr((ord(ch) - 65 + shift) % 26 + 65)
        else:
            out += ch
    return out

print(caesar("HELLO, WORLD", 3))
```
HINT: `ord("A")` is 65. Use `(ord(ch) - 65 + shift) % 26 + 65`, then turn it back into a letter with `chr()`.

## UNIT cy4

### FILL Stop SQL injection
Q: Fill in the blanks to make this query safe by using parameters.
```python
query = "SELECT * FROM users WHERE name = [[?]] AND pw = [[?]]"
db.execute(query, (username, pw_hash))
```
WHY: The `?` placeholders keep user input as **data**, so it can't change the SQL.

## UNIT ds1

### EXERCISE Pair sum, fast | python | 15
Write `has_pair_sum(nums, target)` that returns `True` if any **two different items** add up to `target`. It must be **O(n)**, so no nested loops. The last test uses 20,000 numbers, and nested loops will time out!

STARTER
```python
def has_pair_sum(nums, target):
    seen = set()
    # one loop only!
    return False
```
TESTS
```python
assert has_pair_sum([1, 4, 6, 9], 10) == True, "1 + 9 = 10, so True"
assert has_pair_sum([1, 2, 3], 7) == False, "No pair adds to 7"
assert has_pair_sum([5], 10) == False, "You can't use the same item twice"
assert has_pair_sum(list(range(0, 40000, 2)), 3) == False, "Too slow or wrong on 20,000 items (evens can't sum to 3)"
```
SOLUTION
```python
def has_pair_sum(nums, target):
    seen = set()
    for n in nums:
        if target - n in seen:
            return True
        seen.add(n)
    return False
```
HINT: For each `n`, check whether `target - n` is already in `seen`, then add `n` to `seen`.

## UNIT ds2

### EXERCISE Balanced brackets | python | 15
Write `is_balanced(s)` that returns `True` if every `(`, `[` and `{` is closed by the matching bracket in the right order. Use a **stack**.

STARTER
```python
def is_balanced(s):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in s:
        pass
    return True
```
TESTS
```python
assert is_balanced("([]{})") == True, '"([]{})" is balanced'
assert is_balanced("([)]") == False, '"([)]" closes in the wrong order'
assert is_balanced("((") == False, '"((" never closes'
assert is_balanced("") == True, "An empty string is balanced"
assert is_balanced("a(b)c") == True, "Ignore non-bracket characters"
assert is_balanced(")(") == False, '")(" closes before it opens'
```
SOLUTION
```python
def is_balanced(s):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0
```
HINT: Push opening brackets. On a closing bracket, pop and check it matches. At the end, the stack must be empty.

## UNIT ds3

### EXERCISE Word counts with a dict | python | 12
Write `word_counts(text)` that returns a **dictionary** mapping each lowercase word to how many times it appears.

STARTER
```python
def word_counts(text):
    counts = {}
    return counts
```
TESTS
```python
assert word_counts("the cat and the hat") == {"the": 2, "cat": 1, "and": 1, "hat": 1}, "Count each word"
assert word_counts("Go go GO") == {"go": 3}, "Make words lowercase first"
assert word_counts("") == {}, "Empty text gives an empty dict"
```
SOLUTION
```python
def word_counts(text):
    counts = {}
    for w in text.lower().split():
        counts[w] = counts.get(w, 0) + 1
    return counts
```
HINT: `counts.get(w, 0) + 1` handles words you haven't seen yet.

## UNIT ds4

### EXERCISE Binary search | python | 15
Write `binary_search(arr, target)` for a **sorted** list. Return the index of `target`, or `-1` if it isn't there. Don't use `.index()` or `in`.

STARTER
```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        # compare arr[mid] with target
        break
    return -1
```
TESTS
```python
assert binary_search([2, 5, 8, 12, 16, 23], 23) == 5, "Find 23 at index 5"
assert binary_search([2, 5, 8, 12, 16, 23], 2) == 0, "Find 2 at index 0"
assert binary_search([2, 5, 8, 12, 16, 23], 7) == -1, "7 isn't in the list, so return -1"
assert binary_search([], 3) == -1, "An empty list returns -1"
assert binary_search([7], 7) == 0, "A single-item list works"
```
SOLUTION
```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```
HINT: If `arr[mid]` is too small, move `lo` to `mid + 1`. If it's too big, move `hi` to `mid - 1`.

### EXERCISE Merge two sorted lists | python | 15
Write `merge(a, b)` that merges two **sorted** lists into one sorted list in O(n + m) time. This is the heart of merge sort! Don't call `sorted()`.

STARTER
```python
def merge(a, b):
    result = []
    i = j = 0
    # take the smaller front item each time
    return result
```
TESTS
```python
assert merge([1, 4, 9], [2, 3, 10]) == [1, 2, 3, 4, 9, 10], "merge([1, 4, 9], [2, 3, 10])"
assert merge([], [1, 2]) == [1, 2], "An empty first list works"
assert merge([5], []) == [5], "An empty second list works"
assert merge([1, 1], [1]) == [1, 1, 1], "Duplicates are kept"
```
SOLUTION
```python
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result
```
HINT: Loop while both lists still have items. Then add whatever is left in either list.
