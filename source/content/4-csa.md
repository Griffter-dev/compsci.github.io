# COURSE csa | AP CS A | Java | ☕ | 3 | Junior | #ef4444
> Java programming for the AP CS A exam. Follows the 2025–26 four-unit course: objects and methods, selection and iteration, class creation, and data collections.

## UNIT csa1 | Unit 1: Using Objects & Methods

### LESSON Primitive types and expressions | 12
Java is **statically typed**: you declare a variable's type, and it can't change.

```java
int lives = 3;            // whole numbers
double price = 4.99;      // decimals
boolean done = false;     // true / false
final int MAX = 10;       // constant
```

### Integer division and mod
```java
7 / 2        // 3    (int / int drops the decimal)
7 / 2.0      // 3.5  (any double makes it a double)
7 % 2        // 1    (remainder)
-7 / 2       // -3   (truncates toward zero)
```

### Casting
```java
(double) 7 / 2     // 3.5  (cast happens first, then the division)
(double) (7 / 2)   // 3.0  (int division happens first!)
(int) 3.99         // 3    (truncates, doesn't round)
(int) (x + 0.5)    // rounds a positive x
```

### Compound assignment
`x += 5;` · `x -= 2;` · `x *= 3;` · `x /= 2;` · `x++;` · `x--;`

### Overflow
`int` values range from `Integer.MIN_VALUE` to `Integer.MAX_VALUE` (about ±2.1 billion). Going past the max **wraps around** to the minimum.

### LESSON Objects, Strings and the Math class | 12
An **object** is an instance of a **class**. A variable of a class type stores a **reference** to the object, or `null` if it points to nothing.

```java
String s = "AP Computer Science";
s.length()              // 19
s.substring(3, 11)      // "Computer"  (from index 3 up to, not including, 11)
s.substring(12)         // "Science"
s.indexOf("C")          // 3    (−1 if not found)
s.equals("ap")          // false
s.compareTo("Java")     // negative ("A" comes before "J")
```

Strings are **immutable**: their methods return *new* strings and never change the original.

> **Compare Strings with `.equals()`, not `==`.** `==` checks whether two variables point to the **same object**.

### The Math class (static methods)
```java
Math.abs(-4)       // 4
Math.pow(2, 10)    // 1024.0  (returns a double)
Math.sqrt(49)      // 7.0
Math.random()      // a double in [0.0, 1.0)
(int) (Math.random() * 6) + 1   // a random int from 1 to 6
```

### Calling methods
- **Static** methods are called on the class: `Math.abs(x)`.
- **Instance** methods are called on an object: `s.length()`.
- A method's **signature** is its name plus its parameter types. **Overloaded** methods share a name but have different parameter lists.

**Wrapper classes:** `Integer` and `Double` let primitives act like objects (for example, in an ArrayList). Java converts between them automatically, which is called **autoboxing** and **unboxing**.

### QUIZ
Q: What is `7 / 2` in Java?
- [ ] 3.5
- [x] 3
- [ ] 4
- [ ] 3.0
WHY: Dividing an int by an int gives an int, so the decimal part is dropped.

Q: What is `(double) 7 / 2`?
- [x] 3.5
- [ ] 3.0
- [ ] 3
- [ ] 4.0
WHY: The cast happens first, so 7.0 / 2 is double division, which gives 3.5.

Q: What is `(int) 3.99`?
- [ ] 4
- [x] 3
- [ ] 3.99
- [ ] Error
WHY: Casting to int **truncates**: it chops off the decimal part without rounding.

Q: What is `"computer".substring(3, 6)`?
- [ ] "mpu"
- [x] "put"
- [ ] "pute"
- [ ] "omp"
WHY: The indexes are c0 o1 m2 p3 u4 t5, so `substring(3, 6)` takes indexes 3, 4 and 5: "put".

Q: How should you check whether two String variables hold the same text?
- [ ] `a == b`
- [x] `a.equals(b)`
- [ ] `a.compareTo(b) == 1`
- [ ] `a = b`
WHY: `==` compares references (whether they're the same object). `.equals` compares the characters.

Q: What is the range of `(int) (Math.random() * 6) + 1`?
- [ ] 0 to 6
- [ ] 0 to 5
- [x] 1 to 6
- [ ] 1 to 7
WHY: `Math.random() * 6` falls in [0, 6), the int cast gives 0 to 5, and adding 1 gives 1 to 6.

Q: What is `"apple".compareTo("banana")`?
- [x] A negative number
- [ ] 0
- [ ] A positive number
- [ ] false
WHY: "apple" comes before "banana" alphabetically, so the result is negative.

Q: What happens when you compute `Integer.MAX_VALUE + 1`?
- [ ] An exception is thrown
- [x] It wraps around to `Integer.MIN_VALUE`
- [ ] It becomes a long
- [ ] It stays at MAX_VALUE
WHY: int overflow **wraps around** silently. No exception is thrown.

### TRACE
Q: What is printed?
```java
int a = 17;
int b = 5;
double c = a / b;
System.out.println(c + " " + a % b);
```
- [ ] 3.4 2
- [x] 3.0 2
- [ ] 3 2
- [ ] 3.4 3
WHY: `a / b` is int division, which gives 3, and storing it in a double makes 3.0. 17 % 5 is 2.

Q: What is printed?
```java
String s = "AP Computer Science";
int i = s.indexOf("C");
System.out.println(s.substring(i, i + 4) + s.length());
```
- [ ] Comp18
- [x] Comp19
- [ ] Compu19
- [ ] C19
WHY: "C" is at index 3, `substring(3, 7)` is "Comp", and the string's length is 19.

### BUG
Q: This never prints "Same!" even though both Strings say "java". Click the bug.
```java
String a = new String("java");
String b = "java";
if (a == b) {
    System.out.println("Same!");
}
```
LINE: 3
FIX: if (a.equals(b)) {
WHY: `new String` creates a separate object, so `==` (which checks for the same object) is false. Use `.equals`.

## UNIT csa2 | Unit 2: Selection & Iteration

### LESSON Boolean logic and if statements | 11
```java
if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else {
    grade = "C";
}
```

### Operators
- **Logical:** `&&` (and), `||` (or), `!` (not)
- **Relational:** `== != < > <= >=`

### Short-circuit evaluation
- In `a && b`, if `a` is false, `b` is **never checked**.
- In `a || b`, if `a` is true, `b` is never checked.

This can protect you from crashes:
```java
if (x != 0 && 10 / x > 1)   // safe: no divide by zero when x is 0
```

### De Morgan's Laws
- `!(a && b)` is the same as `!a || !b`
- `!(a || b)` is the same as `!a && !b`

When you push the `!` inside, flip **and ↔ or** and negate each part. For example, `!(x > 5)` becomes `x <= 5`.

### Comparing objects
`==` checks whether two **references** point to the same object. `.equals()` checks whether two objects have the same **content**. To check for null, use `obj == null`.

### LESSON else-if chains and if pitfalls | 11
### The full pattern
```java
if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else if (score >= 70) {
    grade = "C";
} else {
    grade = "F";
}
```
Only the **first** true branch runs. For "at least" ranges, check from the **highest** value down.

:::quiz
Q: `score = 85`. Which branch of the chain above runs?
- [ ] A
- [x] B
- [ ] B and C
- [ ] F
WHY: 85 >= 90 is false, and 85 >= 80 is true, so grade becomes "B" and the rest is skipped.
:::

### Braces matter
Without braces, an `if` controls **only the next statement**:

```java
if (lives == 0)
    System.out.println("Game over");
    resetGame();          // ALWAYS runs! Indentation doesn't matter in Java
```
Always use braces, even for one line.

### The dangling else
An `else` matches the **nearest** `if` that doesn't already have one, no matter how it's indented:

```java
if (a > 0)
    if (b > 0)
        System.out.println("both positive");
else
    System.out.println("???");   // belongs to if (b > 0)!
```

:::quiz
Q: In the dangling else example, `a = -1` and `b = 5`. What prints?
- [ ] both positive
- [ ] ???
- [x] Nothing
- [ ] It doesn't compile
WHY: The `else` belongs to the inner `if (b > 0)`, which is never reached because `a > 0` is false. So nothing prints.
:::

### Comparing things correctly
- **ints and booleans:** use `==`.
- **Strings and other objects:** use `.equals()`.
- **doubles:** rounding errors mean `0.1 + 0.2 == 0.3` is **false**! Compare with a small tolerance instead: `Math.abs(a - b) < 0.0001`.
- **null checks:** use `obj == null`, and put the null check first: `if (s != null && s.length() > 0)`.

### Boolean variables and returns
`if (done == true)` works, but `if (done)` is cleaner. Instead of writing:
```java
if (x > 10) { return true; } else { return false; }
```
just `return x > 10;`.

:::quiz
Q: Which line is the cleanest equivalent of `if (isOpen == false) { ... }`?
- [x] `if (!isOpen) { ... }`
- [ ] `if (isOpen = false) { ... }`
- [ ] `if (isOpen != true == true) { ... }`
- [ ] `if (false) { ... }`
WHY: `!isOpen` is true exactly when `isOpen` is false.
:::

### LESSON Loops and loop analysis | 12
```java
for (int i = 0; i < 5; i++) { ... }      // runs 5 times: i = 0..4

int n = 100;
while (n > 1) { n /= 2; }                // runs until the condition is false
```

### Common algorithms
- **Sum or average:** accumulate in a variable, then divide by the count (watch out for int division!).
- **Min or max:** start with the first value, not 0.
- **Count matches:** add 1 to a counter when a condition is true.
- **String traversal:**

```java
for (int i = 0; i < str.length(); i++) {
    String ch = str.substring(i, i + 1);
}
```

### Nested loops and counting executions
```java
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 4; j++)
        count++;          // runs 3 × 4 = 12 times
```

If the inner loop depends on the outer one (`j = i; j < n`), add up the counts for each pass, for example 5 + 4 + 3 + 2 + 1.

> **Off-by-one errors** are the #1 loop bug. Check the first and last values of your loop variable.

### QUIZ
Q: What does `0.1 + 0.2 == 0.3` evaluate to in Java?
- [ ] true
- [x] false
- [ ] It doesn't compile
- [ ] 0.3
WHY: Doubles can't store 0.1 and 0.2 exactly, so the sum is 0.30000000000000004. Compare doubles with a tolerance instead.

Q: In an if statement without braces, how many statements does the `if` control?
- [x] Only the next one
- [ ] Every line that is indented
- [ ] All statements until the next blank line
- [ ] None
WHY: Without `{ }`, only the single next statement belongs to the `if`. Indentation means nothing to Java.

Q: Which condition safely checks that `name` (a String that might be null) is not empty?
- [x] `name != null && name.length() > 0`
- [ ] `name.length() > 0 && name != null`
- [ ] `name != null || name.length() > 0`
- [ ] `name.length() > 0`
WHY: Put the null check first. Short-circuit `&&` skips `name.length()` when `name` is null.

Q: Which expression is equivalent to `!(a && b)`?
- [ ] `!a && !b`
- [x] `!a || !b`
- [ ] `a || b`
- [ ] `!a && b`
WHY: De Morgan's Law: push the `!` inside, flip `&&` to `||`, and negate each part.

Q: `int x = 0;` What does `(x != 0 && 10 / x > 1)` evaluate to?
- [x] false
- [ ] true
- [ ] ArithmeticException
- [ ] It doesn't compile
WHY: `x != 0` is false, so short-circuiting skips `10 / x` and there's no divide by zero.

Q: How many times does `count++` run?
```java
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 4; j++)
        count++;
```
- [ ] 7
- [x] 12
- [ ] 16
- [ ] 9
WHY: The outer loop runs 3 times and the inner loop runs 4 times per outer pass: 3 × 4 = 12.

Q: How many times does `for (int i = 10; i > 0; i -= 3)` loop?
- [ ] 3
- [x] 4
- [ ] 5
- [ ] 10
WHY: i takes the values 10, 7, 4, 1. The next value would be −2, which ends the loop. That's 4 loops.

Q: Which is equivalent to `!(x > 5 || y == 2)`?
- [x] `x <= 5 && y != 2`
- [ ] `x < 5 && y != 2`
- [ ] `x <= 5 || y != 2`
- [ ] `x > 5 && y == 2`
WHY: Flip `||` to `&&` and negate each part: `!(x > 5)` is `x <= 5`, and `!(y == 2)` is `y != 2`.

### TRACE
Q: What is printed?
```java
int count = 0;
for (int i = 1; i <= 5; i++) {
    for (int j = i; j <= 5; j++) {
        count++;
    }
}
System.out.println(count);
```
- [ ] 25
- [x] 15
- [ ] 10
- [ ] 5
WHY: The inner loop runs 5, 4, 3, 2 and 1 times, and 5 + 4 + 3 + 2 + 1 = 15.

Q: What is printed?
```java
String word = "racecar";
String rev = "";
for (int i = word.length() - 1; i >= 0; i--) {
    rev += word.substring(i, i + 1);
}
System.out.println(rev.equals(word));
```
- [x] true
- [ ] false
- [ ] racecar
- [ ] StringIndexOutOfBoundsException
WHY: The loop builds the string in reverse. "racecar" is a palindrome, so the reversed string equals the original.

### BUG
Q: This crashes with a StringIndexOutOfBoundsException. Click the bug.
```java
// count the vowels in str
int count = 0;
for (int i = 0; i <= str.length(); i++) {
    String ch = str.substring(i, i + 1);
    if ("aeiou".indexOf(ch) >= 0) {
        count++;
    }
}
```
LINE: 3
FIX: for (int i = 0; i < str.length(); i++) {
WHY: The last valid index is `length() - 1`. Using `<=` makes `substring(i, i + 1)` go past the end of the string.

### TRACE
Q: What is printed?
```java
int x = 7;
if (x > 5) {
    x = x * 2;
}
if (x > 10) {
    x = x - 3;
} else {
    x = 0;
}
System.out.println(x);
```
- [ ] 14
- [x] 11
- [ ] 0
- [ ] 7
WHY: 7 > 5, so x becomes 14. Then 14 > 10, so x becomes 11. These are two separate ifs.

### BUG
Q: The game resets even when lives are left. Click the bug.
```java
if (lives == 0)
    System.out.println("Game over");
    resetGame();
```
LINE: 1
FIX: if (lives == 0) {  System.out.println("Game over");  resetGame();  }
WHY: Without braces, only the first statement belongs to the `if`. `resetGame()` always runs. Add braces around both lines.

## UNIT csa3 | Unit 3: Class Creation

### LESSON Anatomy of a class | 13
```java
public class Student {
    // instance variables: private = encapsulation
    private String name;
    private int grade;

    // constructor: same name as the class, no return type
    public Student(String name, int grade) {
        this.name = name;      // this.name = the instance variable
        this.grade = grade;
    }

    // accessor (getter)
    public String getName() { return name; }

    // mutator (setter)
    public void setGrade(int newGrade) { grade = newGrade; }

    public String toString() { return name + " (" + grade + ")"; }
}
```

### Encapsulation
Make instance variables **private** so outside code must go through your methods. This protects the data and lets you check for invalid values.

### Constructors
A constructor sets the starting state of a new object. If you don't write one, Java provides a default no-argument constructor. Instance variables you don't set get default values: `0`, `0.0`, `false` or `null`.

### Methods
- **Accessors** return information without changing the object.
- **Mutators** change the object's state (and are usually `void`).
- A method's **header** includes its access modifier, its return type, its name and its parameters.

### LESSON this, static, scope and references | 11
### this
`this` refers to the current object. It's needed when a parameter has the same name as an instance variable (**shadowing**):

```java
public void setName(String name) { this.name = name; }
```

### static
- A **static** variable belongs to the **class** and is shared by every object. A common use is counting how many objects have been created.
- A **static** method can't use instance variables or `this` directly.

### Scope
**Local variables** (including parameters) exist only inside their method or block.

### References and aliasing
```java
Point p = new Point(1, 2);
Point q = p;        // q and p point to the SAME object
q.setX(5);
p.getX();           // 5
```

When you pass an object to a method, the method gets a copy of the **reference**, so it can change the original object.

### Documentation
- A **precondition** is what must be true before a method is called.
- A **postcondition** is what will be true after it runs.

Document both in comments.

> The 2025–26 AP CSA course **does not** include inheritance (`extends`, `super`, polymorphism). Unit 3 is about designing single classes.

### QUIZ
Q: Why are instance variables usually declared `private`?
- [ ] To make the program run faster
- [x] Encapsulation: outside code must use methods, which protects the data
- [ ] So subclasses can use them
- [ ] Java requires it
WHY: Private data can only be changed through methods you control, and those methods can check for invalid values.

Q: Which statement about constructors is true?
- [ ] They must return void
- [x] They have the same name as the class and no return type
- [ ] A class can have only one constructor
- [ ] They are called with `obj.construct()`
WHY: A constructor has no return type, not even `void`, and it shares the class's name. You can overload constructors.

Q: A class has `private static int count;`. Which statement is true?
- [ ] Each object has its own count
- [x] All objects share a single count
- [ ] count can't be changed
- [ ] count is only visible inside the constructor
WHY: Static variables belong to the class itself, so there is one copy shared by every object.

Q: In `this.name = name;`, what does `this.name` refer to?
- [ ] The parameter
- [x] The current object's instance variable
- [ ] A static variable
- [ ] A local variable
WHY: The parameter **shadows** the instance variable, and `this.` makes it clear which one you mean.

Q: A `Student` class has `private int grade;` and the constructor never sets it. What is `grade` for a new Student?
- [x] 0
- [ ] null
- [ ] It's undefined, so the code won't compile
- [ ] −1
WHY: Instance variables get default values: 0 for int, 0.0 for double, false for boolean and null for objects.

Q: Which method is an **accessor**?
- [ ] `public void setScore(int s)`
- [x] `public int getScore()`
- [ ] `public Student(int s)`
- [ ] `public static void main(String[] args)`
WHY: An accessor returns information about the object without changing it.

### TRACE
Q: What is printed?
```java
public class Counter {
    private static int total = 0;
    private int count;

    public Counter() { count = 0; }

    public void click() {
        count++;
        total++;
    }
    public int getCount() { return count; }
    public static int getTotal() { return total; }
}

// in main:
Counter a = new Counter();
Counter b = new Counter();
a.click(); a.click(); b.click();
System.out.println(a.getCount() + " " + b.getCount() + " " + Counter.getTotal());
```
- [ ] 2 1 2
- [x] 2 1 3
- [ ] 3 3 3
- [ ] 2 2 3
WHY: `count` belongs to each object (a has 2, b has 1). `total` is static and shared by both, so it's 3.

Q: What is printed?
```java
Point p = new Point(1, 2);
Point q = p;
q.setX(5);
System.out.println(p.getX());
```
- [ ] 1
- [x] 5
- [ ] 2
- [ ] null
WHY: `q = p` copies the **reference**, so both variables point to the same object.

### BUG
Q: `new Student("Ada", 11).getName()` returns null. Click the bug.
```java
public class Student {
    private String name;
    private int grade;

    public Student(String name, int grade) {
        name = name;
        this.grade = grade;
    }
    public String getName() { return name; }
}
```
LINE: 6
FIX: this.name = name;
WHY: `name = name` assigns the parameter to itself. Without `this.`, the instance variable is never set, so it stays null.

## UNIT csa4 | Unit 4: Data Collections

### LESSON Arrays and ArrayLists | 14
### Arrays (fixed size)
```java
int[] scores = new int[5];            // [0, 0, 0, 0, 0]
String[] names = {"Ada", "Linus"};
scores.length                         // 5  (no parentheses!)
scores[0] = 90;

for (int s : scores) { ... }          // enhanced for: read-only copy of each value
```

A new array is filled with default values: `0`, `0.0`, `false` or `null`. Using an index outside the array throws an `ArrayIndexOutOfBoundsException`.

### ArrayList (resizable)
```java
ArrayList<Integer> list = new ArrayList<>();
list.add(4);           // [4]
list.add(0, 9);        // [9, 4]  (inserts at index 0)
list.get(1);           // 4
list.set(1, 7);        // [9, 7]  (returns the old value, 4)
list.remove(0);        // [7]     (returns 9)
list.size();           // 1
```

### Removing while looping
When you remove an element, every element after it **shifts left**. A forward loop then **skips** the next element. Loop **backward** instead, or don't add 1 to `i` after a removal.

| | Array | ArrayList | String |
|---|---|---|---|
| size | `.length` | `.size()` | `.length()` |

### LESSON 2D arrays and reading files | 12
### 2D arrays
```java
int[][] grid = new int[3][4];   // 3 rows, 4 columns
grid.length        // 3  (rows)
grid[0].length     // 4  (columns)

// row-major traversal
for (int r = 0; r < grid.length; r++)
    for (int c = 0; c < grid[0].length; c++)
        System.out.print(grid[r][c]);
```

Column-major traversal swaps the loops: the outer loop goes over columns and the inner loop goes over rows.

### Reading a text file (new in 2025–26)
```java
import java.io.File;
import java.io.IOException;
import java.util.Scanner;

public static void main(String[] args) throws IOException {
    Scanner sc = new Scanner(new File("data.txt"));
    while (sc.hasNext()) {
        String word = sc.next();
    }
    sc.close();
}
```

`hasNext()`, `hasNextInt()`, `next()`, `nextInt()`, `nextDouble()` and `nextLine()` read tokens one by one. A method that opens a file must handle or declare `IOException`.

### LESSON Searching, sorting and recursion | 14
### Searching
- **Linear search** works on any array.
- **Binary search** needs **sorted** data. Each step halves the search range.

### Sorting
- **Selection sort:** find the smallest remaining item and swap it into the next position. After pass k, the first k items are in their final positions.
- **Insertion sort:** take the next item and slide it left into the sorted part.
- **Merge sort** (recursive): split the array in half, sort each half, then merge the halves. It's faster on big data.

### Recursion
A **recursive** method calls itself. Every recursive method needs a **base case** that stops the recursion. Without one, it recurses forever and throws a `StackOverflowError`.

```java
public static int sum(int n) {
    if (n == 0) return 0;          // base case
    return n + sum(n - 1);         // recursive call
}
// sum(3) → 3 + sum(2) → 3 + 2 + sum(1) → 3 + 2 + 1 + 0 = 6
```

To trace recursion, write out each call, then fill in the return values from the bottom up.

### QUIZ
Q: After `int[] a = new int[5];`, what is `a[2]`?
- [x] 0
- [ ] null
- [ ] It's undefined, so the code won't compile
- [ ] 2
WHY: New int arrays are filled with 0.

Q: `int[][] g = new int[3][4];` What are `g.length` and `g[0].length`?
- [x] 3 and 4
- [ ] 4 and 3
- [ ] 12 and 4
- [ ] 3 and 3
WHY: `g.length` is the number of rows (3), and `g[0].length` is the number of columns (4).

Q: You remove items from an ArrayList inside a forward `for` loop. What can go wrong?
- [ ] Nothing
- [x] The item after each removed item gets skipped
- [ ] The list gets sorted
- [ ] It won't compile
WHY: After a removal, every later item shifts left by one, but `i` still increases, so the next item is never checked.

Q: How do you get the number of elements in an `ArrayList` called `list`?
- [ ] `list.length`
- [ ] `list.length()`
- [x] `list.size()`
- [ ] `list.count()`
WHY: Arrays use `.length`, Strings use `.length()`, and ArrayLists use `.size()`.

Q: You run selection sort on `[5, 2, 9, 1]`. What is the array after the **first** pass?
- [x] [1, 2, 9, 5]
- [ ] [2, 5, 9, 1]
- [ ] [1, 5, 2, 9]
- [ ] [2, 5, 1, 9]
WHY: Selection sort finds the smallest item (1) and swaps it with the item at index 0 (5).

Q: What does every recursive method need to avoid infinite recursion?
- [ ] A loop
- [x] A base case
- [ ] A static variable
- [ ] Two parameters
WHY: The base case stops the recursion. Without one, the program throws a `StackOverflowError`.

Q: What must a method that creates a `new Scanner(new File("data.txt"))` do?
- [ ] Nothing special
- [x] Handle or declare `IOException`, for example with `throws IOException`
- [ ] Be static
- [ ] Return a String
WHY: Opening a file can fail, so Java requires you to declare or handle that possibility.

Q: Which statement about the enhanced for loop `for (int x : arr)` is true?
- [ ] It can change the array's values through x
- [x] x is a copy of each value, so changing x doesn't change the array
- [ ] It visits the elements in reverse order
- [ ] It gives you the index of each element
WHY: The loop variable is a copy of each value. To change an array's elements, use an index-based loop.

### TRACE
Q: What is printed?
```java
int[] nums = {3, 8, 2, 5};
for (int i = 1; i < nums.length; i++) {
    nums[i] += nums[i - 1];
}
System.out.println(nums[3]);
```
- [ ] 5
- [ ] 13
- [x] 18
- [ ] 7
WHY: The loop computes running totals: [3, 11, 13, 18].

Q: What is printed?
```java
ArrayList<Integer> list = new ArrayList<>();
list.add(4);
list.add(7);
list.add(1, 9);
list.remove(0);
list.set(1, 2);
System.out.println(list);
```
- [ ] [4, 2, 7]
- [x] [9, 2]
- [ ] [9, 7, 2]
- [ ] [2, 7]
WHY: [4] → [4, 7] → [4, 9, 7] → [9, 7] → [9, 2].

Q: What does `mystery(7)` return?
```java
public static int mystery(int n) {
    if (n <= 1) return 1;
    return n + mystery(n - 2);
}
```
- [ ] 28
- [x] 16
- [ ] 15
- [ ] 7
WHY: 7 + 5 + 3 + mystery(1), and mystery(1) is 1. So 7 + 5 + 3 + 1 = 16.

Q: What is printed?
```java
int[][] grid = {{1, 2, 3}, {4, 5, 6}};
int sum = 0;
for (int c = 0; c < grid[0].length; c++) {
    sum += grid[1][c] - grid[0][c];
}
System.out.println(sum);
```
- [ ] 3
- [x] 9
- [ ] 21
- [ ] 6
WHY: Each column adds row 1 minus row 0: (4 − 1) + (5 − 2) + (6 − 3) = 9.

### BUG
Q: This is supposed to remove **every** negative number, but `[-1, -2, 5]` becomes `[-2, 5]`. Click the bug.
```java
// remove every negative number from list
for (int i = 0; i < list.size(); i++) {
    if (list.get(i) < 0) {
        list.remove(i);
    }
}
```
LINE: 2, 4
FIX: for (int i = list.size() - 1; i >= 0; i--) {
WHY: After a removal, the next item shifts into index i, but the loop moves on to i + 1 and skips it. Loop backward, or subtract 1 from `i` after each removal.

Q: This throws a StackOverflowError. Click the bug.
```java
public static int factorial(int n) {
    return n * factorial(n - 1);
}
```
LINE: 2
FIX: if (n <= 1) return 1;  return n * factorial(n - 1);
WHY: There's no base case, so the method calls itself forever.
