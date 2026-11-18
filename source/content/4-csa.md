# COURSE csa | AP CS A | Java | ☕ | 3 | Junior | #ef4444
> Every topic in the 2025–26 AP Computer Science A course, 1.1 through 4.17, with exam weightings, skill codes, practice exams and FRQ practice.

## UNIT csa1 | Unit 1: Using Objects and Methods | 15–25%

### LESSON Unit 1 Introduction | 4 |
**AP exam weighting: 15–25%.** Unit 1 builds the foundation for everything else in AP CSA. You'll learn how Java programs are built and run, how to store and calculate with data, and how to **use objects and methods** that other programmers wrote, like `String` and `Math`.

### What you'll be able to do
- Write expressions and statements that store and print values
- Pick the right data type and convert between types (casting)
- Read **method signatures** and call class methods and instance methods
- Create objects with `new`, and work with `String`s

### How it shows up on the exam
Unit 1 skills appear in **every** free-response question. FRQ 1 (Methods and Control Structures) has a part that requires `String` methods.

> **Tip:** Keep the *Java Quick Reference* open while you practice. You get the same reference sheet on exam day.

### LESSON 1.1 Introduction to Algorithms, Programming, and Compilers | 6 | 1.A
An **algorithm** is a step-by-step process for solving a problem, like a recipe. A **program** is an algorithm written in a programming language so a computer can run it.

### From source code to running program
1. You write **source code** in a `.java` file.
2. The **compiler** checks it and translates it into **bytecode** (a `.class` file).
3. The **Java Virtual Machine (JVM)** runs the bytecode.

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, AP CSA!");
    }
}
```
Every Java program starts running at the `main` method.

### Three kinds of errors
| Error | When it's found | Example |
|---|---|---|
| **Compile-time (syntax)** | By the compiler, before the program runs | A missing semicolon |
| **Run-time (exception)** | While the program runs, and the program crashes | Dividing an int by 0 |
| **Logic** | Never found automatically: the output is just wrong | Using `<` instead of `<=` |

:::quiz
Q: A program compiles and runs without crashing, but prints the wrong total. What kind of error is this?
- [ ] Compile-time error
- [ ] Run-time error
- [x] Logic error
- [ ] Syntax error
WHY: The code follows Java's rules and doesn't crash, but the algorithm is wrong. That's a logic error.
:::

### LESSON 1.2 Variables and Data Types | 6 | 1.A, 2.A
A **variable** is a named storage location. In Java, every variable has a **type** that never changes.

### Primitive types on the AP exam
| Type | Holds | Example |
|---|---|---|
| `int` | whole numbers | `int lives = 3;` |
| `double` | decimal numbers | `double gpa = 3.75;` |
| `boolean` | `true` or `false` | `boolean done = false;` |

Everything else, like `String`, `Scanner` or `ArrayList`, is a **reference type**. A reference variable stores a *reference* (an address) to an object, not the object itself.

### Declaring and initializing
```java
int score;          // declaration
score = 0;          // initialization (assignment)
double price = 4.99; // both at once
final int MAX = 10; // final = constant, can't be changed
```
Variable names are case-sensitive, can't start with a digit, and by convention use `camelCase`.

:::quiz
Q: Which declaration stores a value that can **never** change?
- [ ] `int max = 10;`
- [x] `final int MAX = 10;`
- [ ] `static int MAX = 10;`
- [ ] `const int MAX = 10;`
WHY: The keyword `final` makes a variable a constant. (`const` isn't a Java keyword you can use.)
:::

### LESSON 1.3 Expressions and Output | 8 | 2.A, 3.A, 3.D
### Printing
- `System.out.println(x)` prints `x`, then moves to a new line.
- `System.out.print(x)` prints `x` and stays on the same line.

Escape sequences go inside String literals: `\"` (quote), `\\` (backslash) and `\n` (new line).

### Arithmetic
`+  -  *  /  %`. Java follows the order of operations: `*`, `/` and `%` come before `+` and `-`, and ties go left to right.

```java
System.out.println(7 / 2);     // 3    int / int → int (truncated)
System.out.println(7 / 2.0);   // 3.5  any double → double
System.out.println(7 % 3);     // 1    remainder
System.out.println(2 + 3 * 4); // 14
```
Dividing an **int** by zero throws an `ArithmeticException`.

### String concatenation
`+` with a String joins text. It's evaluated left to right:
```java
System.out.println("Sum: " + 2 + 3);   // Sum: 23
System.out.println(2 + 3 + " total");  // 5 total
```

:::quiz
Q: What does `System.out.println(1 + 2 + "3" + 4 + 5);` print?
- [ ] 15
- [ ] 12345
- [x] 3345
- [ ] 339
WHY: Left to right: 1 + 2 = 3, then 3 + "3" = "33", then "334", then "3345". Once a String appears, + joins text.
:::

### LESSON 1.4 Assignment Statements and Input | 6 | 2.A, 4.A
The **assignment operator** `=` evaluates the right side first, then stores the result in the variable on the left:
```java
int x = 5;
x = x + 2;   // right side is 7, so x becomes 7
```
`=` is **not** "equals" in the math sense. The variable on the left gets a new value, and its old value is gone.

### Swapping two variables
You need a temporary variable:
```java
int temp = a;
a = b;
b = temp;
```

### Reading input with Scanner
```java
import java.util.Scanner;

Scanner input = new Scanner(System.in);
System.out.print("Age? ");
int age = input.nextInt();         // reads an int
double gpa = input.nextDouble();   // reads a double
String name = input.next();        // reads one word
```

:::quiz
Q: What are `a` and `b` after this code runs? `int a = 4; int b = 9; a = b; b = a;`
- [ ] a = 9, b = 4
- [x] a = 9, b = 9
- [ ] a = 4, b = 4
- [ ] a = 4, b = 9
WHY: After `a = b`, a is 9 and the original 4 is gone. Then `b = a` sets b to 9. Swapping needs a temporary variable.
:::

### LESSON Connecting Concepts: Topics 1.1–1.4 | 5 |
### Put it together
Programs are algorithms written in code. You store data in typed variables, compute with expressions, assign the results, and show output.

```java
int quarters = 7;
int cents = quarters * 25;           // 175
int dollars = cents / 100;           // 1
int leftover = cents % 100;          // 75
System.out.println("$" + dollars + "." + leftover);  // $1.75
```

> **Exam habit:** When tracing code, write a small table of every variable's value after each line.

:::quiz
Q: What is printed? `int a = 17; int b = a / 5; int c = a % 5; System.out.println(b + "" + c);`
- [ ] 5
- [x] 32
- [ ] 3.4
- [ ] 3 2
WHY: b is 3 and c is 2. `3 + ""` makes "3", then adding c gives "32".
:::

:::quiz
Q: Which of these finds the **ones digit** of a positive int `n`?
- [x] `n % 10`
- [ ] `n / 10`
- [ ] `n % 1`
- [ ] `(double) n / 10`
WHY: The remainder after dividing by 10 is the last digit.
:::

### LESSON 1.5 Casting and Range of Variables | 7 | 2.A, 4.A
### Casting
A **cast** converts a value to another type:
```java
(double) 7 / 2       // 3.5  the cast happens first
(double) (7 / 2)     // 3.0  int division happens first!
(int) 3.99           // 3    truncates (drops the decimal)
(int) -3.99          // -3   truncates toward zero
```
Java **widens** automatically (int → double). Narrowing (double → int) needs a cast.

### Rounding
- For a positive double `x`: `(int) (x + 0.5)`
- For a negative double `x`: `(int) (x - 0.5)`

### Range and overflow
An `int` holds values from `Integer.MIN_VALUE` (−2,147,483,648) to `Integer.MAX_VALUE` (2,147,483,647). Going past either end **overflows**: the value wraps around silently. Doubles can have **round-off errors**, so `0.1 + 0.2` isn't exactly `0.3`.

:::quiz
Q: What is `(int) (2.6 + 0.5)`?
- [ ] 2
- [x] 3
- [ ] 3.1
- [ ] 4
WHY: 2.6 + 0.5 = 3.1, and casting to int truncates it to 3. That's 2.6 rounded to the nearest whole number.
:::

### LESSON 1.6 Compound Assignment Operators | 4 | 3.A
Compound operators update a variable using its current value:

| Operator | Same as |
|---|---|
| `x += 5;` | `x = x + 5;` |
| `x -= 2;` | `x = x - 2;` |
| `x *= 3;` | `x = x * 3;` |
| `x /= 2;` | `x = x / 2;` |
| `x %= 4;` | `x = x % 4;` |
| `x++;` | `x = x + 1;` |
| `x--;` | `x = x - 1;` |

```java
int n = 10;
n += 4;   // 14
n /= 3;   // 4  (int division)
n %= 3;   // 1
```

:::quiz
Q: `int n = 20; n -= 6; n *= 2; n %= 5;` What is n?
- [ ] 28
- [x] 3
- [ ] 2
- [ ] 0
WHY: 20 − 6 = 14, then 14 × 2 = 28, and 28 % 5 = 3.
:::

### LESSON 1.7 Application Program Interface (API) and Libraries | 5 | 4.A
A **library** is a collection of classes that other programmers already wrote. An **API** (Application Program Interface) is the documentation that tells you *how to use* those classes: what each class is for, and what its constructors and methods do.

- A **class** defines a type, with **attributes** (data) and **behaviors** (methods).
- Classes are grouped into **packages**. Classes in `java.lang`, like `String`, `Math`, `Integer` and `Double`, are available automatically.
- Other packages need an `import`, like `import java.util.ArrayList;` and `import java.util.Scanner;`.

You don't need to know *how* `Math.sqrt` works inside to use it. That's **procedural abstraction**.

:::quiz
Q: Why can you use `Math.sqrt` without writing any `import`?
- [ ] Math is a keyword
- [x] Math is in the java.lang package, which is imported automatically
- [ ] Java imports every library automatically
- [ ] sqrt is a static variable
WHY: `java.lang` (which includes String, Math, Integer and Double) is always available.
:::

### LESSON 1.8 Documentation with Comments | 4 | 4.B
Comments are ignored by the compiler. They exist for **people**:
```java
// single-line comment

/* multi-line
   comment */

/**
 * Javadoc comment: describes a class or method.
 * Precondition: n >= 0
 * Postcondition: returns n factorial
 */
public static int factorial(int n) { ... }
```
- A **precondition** is a condition that must be true *before* a method is called. The method doesn't have to check it.
- A **postcondition** describes what is true *after* the method runs, like the value it returns or the state of an object.

:::quiz
Q: A method's comment says "Precondition: list is not empty." What does that mean?
- [ ] The method checks for an empty list and throws an error
- [x] The caller is responsible for not passing an empty list
- [ ] The method empties the list
- [ ] The list will be non-empty after the call
WHY: Preconditions are the caller's responsibility. The method assumes they're true.
:::

### LESSON 1.9 Method Signatures | 5 | 3.C
A method's **signature** is its **name** plus its **parameter list** (the types, in order).
```java
public static double average(int a, int b)
//            return type  name   parameters
```
- `void` means the method returns nothing.
- **Parameters** are the variables in the header. **Arguments** are the values you pass in a call.
- Java passes arguments **by value**: the method gets a *copy* of each value.
- **Overloading** means several methods share a name but have different parameter lists.

```java
int max(int a, int b)
double max(double a, double b)   // overloaded
```

:::quiz
Q: Which header is a valid overload of `int area(int w, int h)`?
- [ ] `double area(int w, int h)`
- [x] `int area(int side)`
- [ ] `int area(int h, int w)`
- [ ] `int area(int width, int height)`
WHY: Overloads need a different parameter list. Changing only the return type or the parameter names doesn't count.
:::

### LESSON Connecting Concepts: Topics 1.5–1.9 | 5 |
Casting controls types. Compound operators update values. The API and its documentation tell you what methods exist, and signatures tell you how to call them.

```java
/** Returns the average of a and b, rounded to the nearest int.
 *  Precondition: a >= 0, b >= 0 */
public static int roundedAverage(int a, int b) {
    double avg = (a + b) / 2.0;
    return (int) (avg + 0.5);
}
```

:::quiz
Q: What does `roundedAverage(4, 7)` return?
- [ ] 5
- [x] 6
- [ ] 5.5
- [ ] 11
WHY: (4 + 7) / 2.0 = 5.5, then 5.5 + 0.5 = 6.0, and casting gives 6.
:::

:::quiz
Q: Why does the method divide by `2.0` instead of `2`?
- [x] To avoid int division, which would drop the .5
- [ ] Because 2 isn't allowed
- [ ] To make the method return a double
- [ ] To round down
WHY: (4 + 7) / 2 would give 5, because int / int truncates. Dividing by 2.0 keeps the decimal.
:::

### LESSON 1.10 Calling Class Methods | 5 | 2.C, 3.C, 3.D
**Class methods** are marked `static`. They belong to the class, not to any one object, so you call them with the **class name**:
```java
double r = Math.sqrt(25);        // 5.0
int big = Math.max(3, 9);        // 9
```
Inside the same class, you can call a static method by name alone:
```java
public static int square(int n) { return n * n; }
public static void main(String[] args) {
    System.out.println(square(6));   // 36
}
```
When a method is called, its body runs, and then **control returns** to the line that called it. A non-void method's return value can be stored, printed or used in an expression.

:::quiz
Q: What does this print? `System.out.println(Math.max(4, Math.min(10, 7)));`
- [ ] 4
- [x] 7
- [ ] 10
- [ ] 14
WHY: The inner call runs first: Math.min(10, 7) is 7. Then Math.max(4, 7) is 7.
:::

### LESSON 1.11 Math Class | 6 | 2.C, 4.A
`Math` methods on the Java Quick Reference:

| Method | Returns |
|---|---|
| `Math.abs(x)` | absolute value (int or double) |
| `Math.pow(base, exp)` | base^exp, as a **double** |
| `Math.sqrt(x)` | square root, as a **double** |
| `Math.random()` | a double from 0.0 (included) up to 1.0 (**not** included) |

### Random ints in a range
To get a random int from `min` to `max` (inclusive):
```java
int r = (int) (Math.random() * (max - min + 1)) + min;
// a die roll, 1 to 6:
int die = (int) (Math.random() * 6) + 1;
```

:::quiz
Q: Which expression gives a random int from 10 to 20, inclusive?
- [ ] `(int) (Math.random() * 20) + 10`
- [x] `(int) (Math.random() * 11) + 10`
- [ ] `(int) (Math.random() * 10) + 10`
- [ ] `(int) Math.random() * 11 + 10`
WHY: There are 11 possible values (20 − 10 + 1). The last option casts Math.random() first, which always gives 0.
:::

### LESSON 1.12 Objects: Instances of Classes | 5 | 4.A
A **class** is a blueprint. An **object** is one specific thing built from that blueprint, called an **instance** of the class.

- **Attributes** (instance variables) are what each object knows, like a `Dog`'s name and age.
- **Behaviors** (methods) are what each object can do, like `bark()` and `getAge()`.

Two `Dog` objects share the same *kinds* of attributes and the same methods, but each stores its **own** values.

A variable of a class type stores a **reference** to an object. If it doesn't refer to any object, its value is `null`.

:::quiz
Q: Which statement about classes and objects is true?
- [ ] A class is an instance of an object
- [x] Many objects can be created from one class, each with its own attribute values
- [ ] Every object of a class must have the same attribute values
- [ ] An object can only have one method
WHY: The class is the blueprint, and each object (instance) stores its own values.
:::

### LESSON 1.13 Object Creation and Storage (Instantiation) | 6 | 2.B
Objects are created with `new` and a **constructor**:
```java
Scanner sc = new Scanner(System.in);
String s = new String("hi");
Dog d = new Dog("Rex", 3);    // calls the Dog(String, int) constructor
```
- A constructor has the **same name as the class**. Classes often have several **overloaded** constructors.
- The arguments must match a constructor's parameter list in number, order and type.
- `new` creates the object in memory and returns a **reference** to it.

### Aliases
```java
Dog a = new Dog("Rex", 3);
Dog b = a;          // b refers to the SAME object (an alias)
Dog c = null;       // c refers to no object
```

:::quiz
Q: `Dog a = new Dog("Rex", 3); Dog b = a;` How many Dog objects exist?
- [x] 1
- [ ] 2
- [ ] 0
- [ ] 3
WHY: `new` ran once. `b = a` copies the reference, so a and b are aliases for the same object.
:::

### LESSON 1.14 Calling Instance Methods | 5 | 2.C, 3.C
**Instance methods** are called on a specific object with the **dot operator**:
```java
String name = "Ada";
int len = name.length();     // 3
Dog d = new Dog("Rex", 3);
d.bark();
```
- A void instance method usually **changes** the object or performs an action.
- A non-void instance method **returns** a value.
- Calling an instance method on a `null` reference throws a **NullPointerException**.

```java
String s = null;
System.out.println(s.length());   // NullPointerException!
```

:::quiz
Q: `String word = null;` Which line throws a NullPointerException?
- [ ] `System.out.println(word);`
- [x] `System.out.println(word.length());`
- [ ] `word = "hi";`
- [ ] `boolean b = (word == null);`
WHY: Calling a method on null throws an exception. Printing null just prints "null", and comparing with `==` is fine.
:::

### LESSON 1.15 String Manipulation | 10 | 2.C, 3.C
Strings are **immutable**: their methods return **new** Strings and never change the original. Indexes run from 0 to `length() - 1`.

| Method | Returns |
|---|---|
| `s.length()` | the number of characters |
| `s.substring(a, b)` | the characters from index a up to, **not including**, b |
| `s.substring(a)` | from index a to the end |
| `s.indexOf(str)` | the index of the first occurrence of str, or **−1** if it's not there |
| `s.equals(other)` | true if the characters match |
| `s.compareTo(other)` | negative if s comes first alphabetically, 0 if equal, positive if s comes after |

```java
String s = "computer";
s.substring(0, 3)      // "com"
s.substring(3)         // "puter"
s.substring(2, 3)      // "m"  (one character)
s.indexOf("put")       // 3
s.indexOf("z")         // -1
```
An index outside the String throws a `StringIndexOutOfBoundsException`.

> **Always** compare Strings with `.equals()`. `==` checks whether two variables refer to the *same object*.

:::quiz
Q: `String s = "banana";` What is `s.substring(1, 4) + s.indexOf("n")`?
- [ ] "ban2"
- [x] "ana2"
- [ ] "anan2"
- [ ] "ana3"
WHY: substring(1, 4) is indexes 1, 2 and 3, which is "ana". The first "n" is at index 2.
:::

:::quiz
Q: `String t = "AP"; t.substring(1);` What is t after this line?
- [x] "AP"
- [ ] "P"
- [ ] "A"
- [ ] ""
WHY: Strings are immutable. The result "P" was never stored, so t is unchanged.
:::

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

### QUIZ
Q: What is printed?
```java
int a = 11;
int b = 4;
System.out.println(a / b + a % b * 2);
```
- [ ] 4
- [x] 8
- [ ] 5.5
- [ ] 14
WHY: a / b is 2 and a % b is 3. Then 3 * 2 = 6, and 2 + 6 = 8.

Q: What is printed?
```java
System.out.println("AP" + 1 + 2);
System.out.println(1 + 2 + "AP");
```
- [ ] AP3, then 3AP
- [x] AP12, then 3AP
- [ ] AP12, then 12AP
- [ ] AP3, then 12AP
WHY: Evaluated left to right: "AP" + 1 makes "AP1", then "AP12". On the second line, 1 + 2 = 3 first, then "3AP".

Q: Which expression gives the value of `double d = 7.6;` rounded to the nearest int?
- [ ] `(int) d`
- [x] `(int) (d + 0.5)`
- [ ] `(int) d + 0.5`
- [ ] `(int) Math.abs(d)`
WHY: 7.6 + 0.5 = 8.1, and casting gives 8. Casting d alone truncates to 7.

Q: `double x = 5 / 2;` What value does x hold?
- [ ] 2.5
- [x] 2.0
- [ ] 3.0
- [ ] It doesn't compile
WHY: 5 / 2 is int division, which gives 2. Storing it in a double makes 2.0.

Q: Which method call is a valid call of `public static double area(double r)` from another class named Geo?
- [ ] `area(2.0)`
- [x] `Geo.area(2.0)`
- [ ] `new Geo().area()`
- [ ] `Geo.area("2")`
WHY: Static methods are called with the class name and arguments that match the parameters.

Q: `String s = "Mississippi";` What is `s.indexOf("ss") + s.substring(4, 7).length()`?
- [ ] 3
- [x] 5
- [ ] 6
- [ ] 7
WHY: "ss" first appears at index 2, and substring(4, 7) has length 3. So 2 + 3 = 5.

Q: Which line causes a compile-time error?
- [ ] `int x = (int) 3.9;`
- [x] `int y = 3.9;`
- [ ] `double z = 3;`
- [ ] `double w = (double) 3 / 2;`
WHY: You can't store a double in an int without a cast. Going from int to double widens automatically.

Q: `Point p = new Point(1, 2); Point q = new Point(1, 2);` What is `p == q`?
- [x] false
- [ ] true
- [ ] It doesn't compile
- [ ] It depends on toString
WHY: `new` ran twice, so these are two different objects. `==` compares references.

### TRACE
Q: What is printed?
```java
int x = 3;
x *= 2 + 1;
x -= 4;
System.out.println(x % 4);
```
- [x] 1
- [ ] 2
- [ ] 3
- [ ] 0
WHY: The right side is evaluated first: x *= 3 makes x 9. Then 9 − 4 = 5, and 5 % 4 = 1.

Q: What is printed?
```java
String w = "program";
String part = w.substring(3) + w.substring(0, 3);
System.out.println(part.length() + part.substring(0, 2));
```
- [ ] 7pr
- [x] 7gr
- [ ] 4gr
- [ ] 7og
WHY: substring(3) is "gram" and substring(0, 3) is "pro", so part is "grampro" (length 7). Then 7 + "gr" gives "7gr".

## UNIT csa2 | Unit 2: Selection and Iteration | 25–35%

### LESSON Unit 2 Introduction | 4 |
**AP exam weighting: 25–35%.** Unit 2 teaches programs to make **decisions** (selection) and **repeat** steps (iteration). These are the building blocks of every algorithm on the exam.

### What you'll be able to do
- Write boolean expressions, `if` statements and nested `if` statements
- Simplify and compare boolean logic (De Morgan's Laws)
- Write `while` and `for` loops, including nested loops
- Implement standard algorithms with numbers and Strings
- Count how many times a statement runs (informal run-time analysis)

### On the exam
**FRQ 1 (Methods and Control Structures)** is built almost entirely on Unit 2 skills. Loops and ifs also show up inside every other FRQ.

### LESSON 2.1 Algorithms with Selection and Repetition | 5 | 1.A
Every algorithm is built from three things:
1. **Sequencing:** steps run in order, one after another.
2. **Selection:** a decision chooses which steps run (`if`).
3. **Repetition (iteration):** steps repeat while a condition holds (`while`, `for`).

Example: "Count how many test scores are passing."
- **Repetition:** look at each score.
- **Selection:** if the score is at least 70, add 1 to the count.
- **Sequencing:** start the count at 0, loop, then report the count.

Planning an algorithm in plain English (pseudocode) *before* writing Java makes the code much easier to write.

:::quiz
Q: An algorithm checks each item in a list and prints only the even ones. Which building blocks does it use?
- [ ] Sequencing only
- [ ] Selection only
- [x] Repetition and selection
- [ ] Repetition only
WHY: It repeats for each item (repetition) and decides whether to print (selection).
:::

### LESSON 2.2 Boolean Expressions | 6 | 3.A
A **boolean expression** evaluates to `true` or `false`. Relational operators: `==  !=  <  >  <=  >=`.

```java
int x = 7;
boolean big = x > 5;      // true
boolean even = x % 2 == 0; // false
```

### == with primitives vs. references
- With **primitives** (int, double, boolean), `==` compares **values**.
- With **references** (objects), `==` checks whether both variables refer to the **same object** (aliases).

```java
String a = new String("hi");
String b = new String("hi");
a == b         // false: two different objects
a.equals(b)    // true: same characters
```

:::quiz
Q: `int x = 12;` What is `x % 5 != 2`?
- [ ] true
- [x] false
- [ ] 2
- [ ] It doesn't compile
WHY: 12 % 5 is 2, so `2 != 2` is false.
:::

### LESSON 2.3 if Statements | 6 | 2.A, 3.A, 4.A
```java
if (score >= 70) {                 // one-way selection
    System.out.println("Pass");
}

if (score >= 70) {                 // two-way selection
    System.out.println("Pass");
} else {
    System.out.println("Retake");
}
```
- The condition goes in **parentheses**, and the block goes in **braces**.
- Without braces, the `if` controls **only the next statement**. Indentation means nothing to Java.

:::quiz
Q: What is printed when `x = 3`?
```java
if (x > 5)
    System.out.print("A");
    System.out.print("B");
```
- [ ] A
- [x] B
- [ ] AB
- [ ] Nothing
WHY: Without braces, only the first print belongs to the if. "B" always prints.
:::

### LESSON 2.4 Nested if Statements | 7 | 2.A, 4.A
An `if` inside another `if` is checked only when the outer condition is true. A **multiway** selection chain uses `else if`:

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
Only the **first** true branch runs, so order "at least" checks from **highest to lowest**.

### The dangling else
An `else` pairs with the **nearest** unmatched `if`, no matter how it's indented. Use braces to make your meaning clear.

:::quiz
Q: `score = 85`. With the chain above, which branches run?
- [ ] A and B
- [x] Only B
- [ ] B and C
- [ ] Only F
WHY: 85 >= 90 is false and 85 >= 80 is true, so grade is "B" and the rest of the chain is skipped.
:::

### LESSON 2.5 Compound Boolean Expressions | 6 | 2.A, 3.A
Logical operators: `&&` (and), `||` (or), `!` (not). **Precedence:** `!` first, then `&&`, then `||`.

```java
if (age >= 13 && age <= 19) { ... }      // teen
if (day == 0 || day == 6) { ... }        // weekend
if (!done) { ... }
```

### Short-circuit evaluation
- `a && b`: if `a` is false, `b` is **not evaluated**.
- `a || b`: if `a` is true, `b` is not evaluated.

```java
if (count != 0 && total / count > 10)   // safe: no divide by zero
if (s != null && s.length() > 0)        // safe: no NullPointerException
```

:::quiz
Q: `int x = 0;` What does `x == 0 || 10 / x > 1` evaluate to?
- [x] true
- [ ] false
- [ ] ArithmeticException
- [ ] It doesn't compile
WHY: `x == 0` is true, so `||` short-circuits and never evaluates `10 / x`.
:::

### LESSON 2.6 Comparing Boolean Expressions | 7 | 2.A, 3.A
Two boolean expressions are **equivalent** if they're true for exactly the same inputs. Check them with **truth tables**, or simplify them with **De Morgan's Laws**:

- `!(a && b)` is the same as `!a || !b`
- `!(a || b)` is the same as `!a && !b`

When negating comparisons: `!(x > 5)` becomes `x <= 5`, and `!(x == 5)` becomes `x != 5`.

```java
!(x >= 10 && y < 3)
// = x < 10 || y >= 3
```

### Comparing objects
`==` checks for aliases. `.equals()` compares content. To check for null, use `obj == null`.

:::quiz
Q: Which is equivalent to `!(a > 3 || b == 0)`?
- [x] `a <= 3 && b != 0`
- [ ] `a <= 3 || b != 0`
- [ ] `a < 3 && b != 0`
- [ ] `a > 3 && b == 0`
WHY: Flip `||` to `&&` and negate each part: `!(a > 3)` is `a <= 3`, and `!(b == 0)` is `b != 0`.
:::

### LESSON Connecting Concepts: Topics 2.1–2.6 | 5 |
Selection is how programs make decisions. Good selection code has boolean expressions that are correct at the **boundaries** (like exactly 70), checks in the right order, and safe short-circuiting.

```java
/** Returns the ticket price.
 *  Precondition: age >= 0 */
public static int price(int age, boolean student) {
    if (age < 5) return 0;
    if (age >= 65 || student) return 9;
    return 14;
}
```

:::quiz
Q: What does `price(16, true)` return?
- [ ] 0
- [x] 9
- [ ] 14
- [ ] 23
WHY: 16 < 5 is false. Then `16 >= 65 || true` is true, so it returns 9.
:::

:::quiz
Q: Which call returns 14?
- [ ] `price(3, false)`
- [ ] `price(70, false)`
- [x] `price(30, false)`
- [ ] `price(30, true)`
WHY: For 30 and not a student, neither if is true, so the method reaches `return 14`.
:::

### LESSON 2.7 while Loops | 7 | 2.A, 3.A, 4.B
A `while` loop repeats as long as its condition is true. The condition is checked **before** each pass:
```java
int n = 1;
while (n < 100) {
    n *= 2;
}
// n is 128
```
- If the condition is false at the start, the body runs **zero** times.
- If nothing in the body ever makes the condition false, you get an **infinite loop**.

### Sentinel and digit loops
```java
int num = 4096, digits = 0;
while (num > 0) {
    num /= 10;
    digits++;
}
// digits is 4
```

:::quiz
Q: How many times does the body run? `int k = 10; while (k > 0) { k -= 3; }`
- [ ] 3
- [x] 4
- [ ] 10
- [ ] Infinite
WHY: k goes 10 → 7 → 4 → 1 → −2. That's 4 passes, and then `k > 0` is false.
:::

### LESSON 2.8 for Loops | 7 | 2.A, 3.A, 3.D
A `for` loop puts the **initialization**, the **condition** and the **update** in one header:
```java
for (int i = 0; i < 5; i++) {
    System.out.print(i + " ");    // 0 1 2 3 4
}
```
It runs in this order: initialize once → check the condition → run the body → update → check → … Any `for` loop can be rewritten as a `while` loop:
```java
int i = 0;
while (i < 5) { System.out.print(i + " "); i++; }
```
The loop variable `i` exists **only inside** the loop. **Off-by-one errors**, like `<=` instead of `<`, are the most common loop bug.

:::quiz
Q: What is printed? `for (int i = 2; i <= 10; i += 4) System.out.print(i);`
- [ ] 246810
- [x] 2610
- [ ] 26
- [ ] 261014
WHY: i takes the values 2, 6 and 10. The next value, 14, fails `i <= 10`.
:::

### LESSON Connecting Concepts: Topics 2.7–2.8 | 4 |
Choosing a loop:
- Use a **for** loop when you know how many times to repeat, or you're counting through a range.
- Use a **while** loop when you repeat *until something happens*, like reaching a target or running out of digits.

```java
// for: sum 1..n
int sum = 0;
for (int i = 1; i <= n; i++) sum += i;

// while: how many doublings until we pass 1000?
int value = 1, steps = 0;
while (value <= 1000) { value *= 2; steps++; }   // steps is 10
```

:::quiz
Q: In the while loop above, what is `value` when the loop ends?
- [ ] 1000
- [x] 1024
- [ ] 512
- [ ] 2048
WHY: The loop stops at the first power of 2 greater than 1000, which is 1024 (after 10 doublings).
:::

### LESSON 2.9 Implementing Selection and Iteration Algorithms | 8 | 2.A, 3.A, 4.A
Standard algorithms you should be able to write from memory:

```java
// sum and average (watch out for int division!)
double avg = (double) sum / count;

// count the values that match a condition
if (n % 3 == 0) count++;

// minimum / maximum: start from the first value, not 0
int min = first;
if (next < min) min = next;

// is n divisible by d?
n % d == 0

// pick off digits
while (n > 0) { int digit = n % 10; n /= 10; }
```

:::quiz
Q: This code should find the largest of several **negative** numbers, but it doesn't. What's wrong? `int max = 0; ... if (x > max) max = x;`
- [x] max starts at 0, which is larger than every negative number
- [ ] It should use `<`
- [ ] max should be a double
- [ ] Nothing is wrong
WHY: Start max at the first value instead, or at Integer.MIN_VALUE.
:::

### LESSON 2.10 Implementing String Algorithms | 8 | 2.C, 3.C, 3.D
Traverse a String with `substring(i, i + 1)`:
```java
// count the vowels
int count = 0;
for (int i = 0; i < s.length(); i++) {
    String ch = s.substring(i, i + 1);
    if ("aeiou".indexOf(ch) >= 0) count++;
}

// reverse
String rev = "";
for (int i = s.length() - 1; i >= 0; i--) {
    rev += s.substring(i, i + 1);
}

// count the occurrences of a word
int n = 0;
for (int i = 0; i <= s.length() - w.length(); i++) {
    if (s.substring(i, i + w.length()).equals(w)) n++;
}
```
Watch the loop bounds. `substring` throws an exception if it runs past the end of the String.

:::quiz
Q: What does `countOf("banana", "an")` return using the occurrence counter above?
- [ ] 1
- [x] 2
- [ ] 3
- [ ] 4
WHY: "an" appears at index 1 and at index 3.
:::

### LESSON 2.11 Nested Iteration | 6 | 2.A, 3.D, 4.B
An inner loop runs **completely** for each single pass of the outer loop:
```java
for (int r = 1; r <= 3; r++) {
    for (int c = 1; c <= r; c++) {
        System.out.print("*");
    }
    System.out.println();
}
// *
// **
// ***
```
- When the bounds are fixed, the total inner runs = outer runs × inner runs.
- When the inner bound depends on the outer variable, add up each pass instead: 1 + 2 + 3 = 6 stars.

:::quiz
Q: How many times does `x++` run? `for (int i = 0; i < 4; i++) for (int j = 0; j < 5; j++) x++;`
- [ ] 9
- [x] 20
- [ ] 25
- [ ] 16
WHY: 4 outer passes × 5 inner passes = 20.
:::

### LESSON 2.12 Informal Run-Time Analysis | 6 |
**Statement execution count** means how many times a statement runs for a given input. It's how the AP exam measures efficiency.

```java
for (int i = 0; i < n; i++)          // body runs n times
for (int i = 0; i < n; i += 2)       // about n / 2 times
for (int i = 1; i < n; i *= 2)       // about log2(n) times
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)      // n * n times
for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++)      // n + (n-1) + ... + 1 times
```
Compare two algorithms by counting how often their key statements run. Fewer runs for the same answer means the algorithm is more efficient.

:::quiz
Q: With n = 6, how many times does the inner body run? `for (int i = 0; i < n; i++) for (int j = i; j < n; j++) body;`
- [ ] 36
- [x] 21
- [ ] 15
- [ ] 6
WHY: 6 + 5 + 4 + 3 + 2 + 1 = 21.
:::

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

### QUIZ
Q: How many times is "hi" printed?
```java
for (int i = 0; i < 10; i += 3)
    System.out.println("hi");
```
- [ ] 3
- [x] 4
- [ ] 10
- [ ] 9
WHY: i takes the values 0, 3, 6 and 9, which is 4 times.

Q: Which loop prints `5 4 3 2 1`?
- [x] `for (int i = 5; i > 0; i--) System.out.print(i + " ");`
- [ ] `for (int i = 5; i >= 0; i--) System.out.print(i + " ");`
- [ ] `for (int i = 5; i > 1; i--) System.out.print(i + " ");`
- [ ] `for (int i = 1; i <= 5; i++) System.out.print(i + " ");`
WHY: Start at 5 and stop after 1, so the condition is `i > 0`.

Q: Which expression is true exactly when `n` is between 1 and 100, inclusive?
- [ ] `n >= 1 || n <= 100`
- [x] `n >= 1 && n <= 100`
- [ ] `1 <= n <= 100`
- [ ] `!(n < 1 && n > 100)`
WHY: Both conditions must hold, so use &&. Java doesn't allow chained comparisons like `1 <= n <= 100`.

Q: What is printed?
```java
int n = 1234;
int s = 0;
while (n > 0) {
    s += n % 10;
    n /= 10;
}
System.out.println(s);
```
- [ ] 1234
- [x] 10
- [ ] 4321
- [ ] 4
WHY: The loop adds up the digits: 4 + 3 + 2 + 1 = 10.

Q: How many times does `count++` run?
```java
for (int i = 1; i <= 4; i++)
    for (int j = 1; j <= i; j++)
        count++;
```
- [ ] 16
- [x] 10
- [ ] 8
- [ ] 4
WHY: 1 + 2 + 3 + 4 = 10.

Q: `String s = "level";` Which condition is true when s reads the same forward and backward, assuming `rev` holds s reversed?
- [ ] `s == rev`
- [x] `s.equals(rev)`
- [ ] `s.compareTo(rev) > 0`
- [ ] `s.length() == rev.length()`
WHY: Compare String contents with equals.

Q: What is printed when `x = 7`?
```java
if (x > 5) {
    if (x > 8) System.out.print("A");
    else System.out.print("B");
} else System.out.print("C");
```
- [ ] A
- [x] B
- [ ] C
- [ ] BC
WHY: 7 > 5 is true, 7 > 8 is false, so the inner else prints B.

### TRACE
Q: What is printed?
```java
String s = "abcabc";
int n = 0;
for (int i = 0; i < s.length() - 1; i++) {
    if (s.substring(i, i + 2).equals("bc")) n++;
}
System.out.println(n);
```
- [ ] 1
- [x] 2
- [ ] 3
- [ ] 0
WHY: "bc" appears at index 1 and at index 4.

Q: What is printed?
```java
int a = 0, b = 10;
while (a < b) {
    a += 3;
    b -= 2;
}
System.out.println(a + " " + b);
```
- [ ] 3 8
- [x] 6 6
- [ ] 9 4
- [ ] 6 8
WHY: After pass 1, (a, b) is (3, 8). After pass 2 it's (6, 6), and 6 < 6 is false, so the loop stops.

## UNIT csa3 | Unit 3: Class Creation | 10–18%

### LESSON Unit 3 Introduction | 4 |
**AP exam weighting: 10–18%.** In Unit 1 you *used* classes that other people wrote. Now you'll **write your own**: designing the data each object stores and the methods that work with it.

### What you'll be able to do
- Turn a written description into a class design
- Think about the impact of how software is designed
- Write instance variables, constructors and methods
- Use `static`, scope rules and the `this` keyword correctly

### On the exam
**FRQ 2 (Class Design)** asks you to write a complete class from a specification. Every topic in this unit shows up there.

> The 2025–26 course does **not** include inheritance (`extends`, `super`). Unit 3 is about designing single classes well.

### LESSON 3.1 Abstraction and Program Design | 6 | 1.A
**Abstraction** means hiding details so you can focus on what matters.
- **Data abstraction:** a class bundles related data. For example, a `Student` has a name and a GPA, and you use it without knowing how it's stored.
- **Procedural abstraction:** a method names a process. You call `getAverage()` without knowing how it's computed.

### Designing a class from a description
> "A **library book** has a title, an author and whether it is checked out. You can check it out, return it, and ask whether it's available."

- **Nouns** usually become **attributes** (instance variables): `title`, `author`, `checkedOut`.
- **Verbs** usually become **behaviors** (methods): `checkOut()`, `returnBook()`, `isAvailable()`.

A simple class diagram helps you plan:
```
LibraryBook
- title : String
- author : String
- checkedOut : boolean
+ LibraryBook(title : String, author : String)
+ checkOut() : void
+ isAvailable() : boolean
```

:::quiz
Q: In "A playlist has a name and a list of songs, and you can shuffle it," which word should become a **method**?
- [ ] playlist
- [ ] name
- [ ] songs
- [x] shuffle
WHY: Verbs (actions) become methods. Nouns that describe the object become attributes.
:::

### LESSON 3.2 Impact of Program Design | 5 | 5.A
Software design choices affect real people:
- **Reliability:** bugs in software for medicine, cars or banking can cause serious harm, so testing matters.
- **Accessibility:** designs should work for people with different abilities and devices.
- **Privacy and security:** collect only the data you need, and protect it.
- **Intellectual property:** respect licenses and give credit when you use someone else's code. **Open-source** licenses say how code may be reused.
- **Unintended consequences:** a program built for one purpose can be misused, or affect groups the designers didn't consider.

:::quiz
Q: A team copies code from an open-source project into its app. What should it do?
- [ ] Nothing, because open-source code has no rules
- [x] Follow the project's license, which often requires credit or sharing changes
- [ ] Remove the author's name
- [ ] Pay the original author
WHY: Open-source licenses grant permission under conditions, and following them is both a legal and an ethical duty.
:::

### LESSON 3.3 Anatomy of a Class | 7 | 1.A, 2.B
```java
public class LibraryBook {
    // instance variables: private (encapsulation)
    private String title;
    private String author;
    private boolean checkedOut;

    // constructor
    public LibraryBook(String t, String a) {
        title = t;
        author = a;
        checkedOut = false;
    }

    // methods: usually public
    public boolean isAvailable() { return !checkedOut; }
    public void checkOut() { checkedOut = true; }
}
```
- **`private`** means only code inside this class can access it.
- **`public`** means any class can use it.
- **Encapsulation:** make instance variables private, and let outside code change them only through methods you control.

:::quiz
Q: Why are instance variables declared private?
- [ ] So the program runs faster
- [x] So outside code can only change them through the class's methods (encapsulation)
- [ ] Because Java requires it
- [ ] So other classes can read them directly
WHY: Encapsulation protects an object's data and lets the class check for invalid values.
:::

### LESSON 3.4 Constructors | 7 | 2.B, 3.B
A **constructor** sets up a new object's **initial state**.
- It has the **same name** as the class and **no return type** (not even `void`).
- A class can have several overloaded constructors.
- If you write **no** constructor, Java provides a default no-argument constructor. Instance variables you don't set get default values: `0`, `0.0`, `false` or `null`.

```java
public class Counter {
    private int count;
    private String label;

    public Counter() {             // no-arg constructor
        count = 0;
        label = "untitled";
    }
    public Counter(String name) {  // overloaded
        count = 0;
        label = name;
    }
}
```
If a constructor receives a **mutable object** as a parameter, it's safer to store a *copy* of it, so outside code can't change the object's state later.

:::quiz
Q: A class has `private int count;` and its constructor never sets count. What is count after `new Counter()`?
- [x] 0
- [ ] null
- [ ] It doesn't compile
- [ ] Undefined
WHY: Instance variables get default values. For an int, that's 0.
:::

### LESSON Connecting Concepts: Topics 3.1–3.4 | 4 |
Design first (abstraction), think about the impact, then build the class: private data, public behaviors and constructors that set a valid starting state.

```java
public class Thermostat {
    private int target;
    public Thermostat(int start) {
        if (start < 50) target = 50;
        else if (start > 90) target = 90;
        else target = start;
    }
}
```

:::quiz
Q: What is `target` after `new Thermostat(120)`?
- [ ] 120
- [x] 90
- [ ] 50
- [ ] 0
WHY: The constructor keeps target between 50 and 90, so 120 becomes 90.
:::

### LESSON 3.5 Methods: How to Write Them | 8 | 2.C, 3.C, 3.D, 4.B
```java
public double getPercent() {          // non-void: must return a value
    return 100.0 * score / total;
}
public void addPoints(int pts) {      // void: changes state
    if (pts > 0) score += pts;
}
public String toString() {            // called automatically by println
    return name + ": " + score;
}
```
- **Accessor** (getter) methods return information without changing the object.
- **Mutator** (setter) methods change the object's state, often with validation.
- A **non-void** method must `return` a value of its return type on every path. `return` ends the method immediately.
- Methods can call other methods of the same class directly.

:::quiz
Q: Which method is an accessor?
- [ ] `public void setScore(int s)`
- [x] `public int getScore()`
- [ ] `public void addPoints(int p)`
- [ ] `public Player(String n)`
WHY: Accessors return information without changing the object.
:::

### LESSON 3.6 Methods: Passing and Returning References of an Object | 7 | 2.C, 4.A
Java always passes a **copy**:
- For a **primitive**, the method gets a copy of the value. Changing it inside the method doesn't affect the caller.
- For an **object**, the method gets a copy of the **reference**. Both refer to the **same object**, so the method *can* change that object's state.

```java
public static void bump(int x) { x++; }                 // caller's int is unchanged
public static void rename(Dog d) { d.setName("Max"); }  // the caller's Dog IS changed
```
Returning a reference to a private mutable object, like an `ArrayList` field, lets outside code change your object's data. Return a copy when you need to protect it.

:::quiz
Q: `Dog d = new Dog("Rex"); rename(d); System.out.println(d.getName());` What prints, using `rename` above?
- [ ] Rex
- [x] Max
- [ ] null
- [ ] It doesn't compile
WHY: The method gets a copy of the reference, which points to the same Dog. setName changes that Dog.
:::

### LESSON 3.7 Class Variables and Methods | 6 | 2.C, 3.B
`static` members belong to the **class**, not to any one object:
```java
public class Ticket {
    private static int nextId = 1;    // shared by all Tickets
    private int id;

    public Ticket() {
        id = nextId;
        nextId++;
    }
    public static int getCount() { return nextId - 1; }
}
```
- Every object shares **one** copy of a static variable.
- A static method can't use instance variables or `this` directly, because it isn't attached to any object.
- Call static methods with the class name: `Ticket.getCount()`.

:::quiz
Q: After `new Ticket(); new Ticket(); new Ticket();`, what does `Ticket.getCount()` return?
- [ ] 1
- [ ] 4
- [x] 3
- [ ] 0
WHY: nextId starts at 1 and goes up once per Ticket, ending at 4. So getCount returns 4 − 1 = 3.
:::

### LESSON 3.8 Scope and Access | 6 | 3.B, 3.D, 4.A
**Scope** is where a variable can be used:
- **Instance variables:** anywhere in the class's (non-static) methods.
- **Parameters and local variables:** only inside their method, or inside the block `{ }` where they were declared.

When a local variable or parameter has the **same name** as an instance variable, it **shadows** the instance variable, and the name refers to the local one.

```java
public void setScore(int score) {
    score = score;   // BUG: assigns the parameter to itself!
}
```
`private` access is per **class**, not per object. A method can read another object's private fields, as long as that object is the same class:
```java
public boolean sameScore(Player other) { return score == other.score; }
```

:::quiz
Q: A variable is declared inside a `for` loop's body. Where can it be used?
- [ ] Anywhere in the class
- [ ] Anywhere in the method
- [x] Only inside that loop body
- [ ] Only in the next loop
WHY: Local variables only exist inside the block where they're declared.
:::

### LESSON 3.9 this Keyword | 5 |
`this` refers to **the current object**, the one whose method or constructor is running.

```java
public class Player {
    private String name;
    private int score;

    public Player(String name, int score) {
        this.name = name;      // this.name = the instance variable
        this.score = score;
    }
    public boolean beats(Player other) {
        return this.score > other.score;
    }
    public void joinTeam(Team t) {
        t.add(this);           // pass the current object as an argument
    }
}
```
Use `this.` to fix shadowing, and `this` on its own to pass the current object to another method. `this` can't be used in a static method.

:::quiz
Q: In `this.name = name;`, which variable does `name` on the right side refer to?
- [ ] The instance variable
- [x] The parameter
- [ ] A static variable
- [ ] Both
WHY: The parameter shadows the instance variable, so plain `name` is the parameter and `this.name` is the field.
:::

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

### QUIZ
Q: Which constructor header is valid for a class named `Car`?
- [x] `public Car(String model)`
- [ ] `public void Car(String model)`
- [ ] `public Car void(String model)`
- [ ] `Car public(String model)`
WHY: A constructor has the class's name and no return type.

Q: A class has `private int speed;`. Code in another class tries `myCar.speed = 50;`. What happens?
- [ ] speed becomes 50
- [x] Compile-time error, because speed is private
- [ ] Run-time error
- [ ] Nothing
WHY: Private members can only be accessed inside their own class.

Q: Which is true about a static method?
- [ ] It can use instance variables directly
- [x] It's called on the class and can't use `this`
- [ ] It must return void
- [ ] Each object has its own copy
WHY: Static methods belong to the class, not to any object.

Q: Which describes a mutator method?
- [ ] Returns a value without changing the object
- [x] Changes the object's state
- [ ] Creates a new object
- [ ] Is always static
WHY: Mutators (setters) modify instance variables.

### TRACE
Q: What is printed?
```java
public class Box {
    private int v;
    public Box(int v) { this.v = v; }
    public void grow(int n) { v += n; }
    public int get() { return v; }
}
// in main
Box a = new Box(2);
Box b = a;
b.grow(3);
a.grow(1);
System.out.println(a.get() + b.get());
```
- [ ] 8
- [x] 12
- [ ] 6
- [ ] 11
WHY: a and b are aliases for one Box: 2 + 3 + 1 = 6. Then 6 + 6 = 12.

Q: What is printed?
```java
public static void change(int x, int[] arr) {
    x = 99;
    arr[0] = 99;
}
// in main
int n = 1;
int[] a = {1, 2};
change(n, a);
System.out.println(n + " " + a[0]);
```
- [ ] 99 99
- [x] 1 99
- [ ] 1 1
- [ ] 99 1
WHY: The int was passed as a copy, so n is unchanged. The array reference points to the same array, so a[0] changes.

## UNIT csa4 | Unit 4: Data Collections | 30–40%

### LESSON Unit 4 Introduction | 4 |
**AP exam weighting: 30–40%, the biggest unit.** Unit 4 is about storing and processing **lots of data**: arrays, `ArrayList`s, 2D arrays and text files. It also covers searching, sorting and recursion.

### What you'll be able to do
- Think about the ethics of collecting data, and what data can tell you
- Create, traverse and modify arrays, ArrayLists and 2D arrays
- Read data from text files
- Search and sort, and write and trace recursive methods

### On the exam
Two of the four FRQs come from this unit: **FRQ 3 (Data Analysis with ArrayList)** and **FRQ 4 (2D Array)**.

### LESSON 4.1 Ethical and Social Issues Around Data Collection | 5 | 1.B, 5.A
Programs collect huge amounts of data about people: locations, purchases, grades, health and more.
- **Privacy:** people should know what's collected and why. Collect only what you need.
- **Security:** stored data must be protected. A leak can harm thousands of people.
- **Bias:** data that doesn't represent everyone leads to unfair results, like a model trained mostly on one group.
- **Consent and ownership:** who owns the data, and can users delete it?
- **Unintended use:** data collected for one purpose can be combined or reused in harmful ways.

:::quiz
Q: A school app collects every student's location all day to take attendance. What's the best design fix?
- [ ] Collect more data to be safe
- [x] Collect only what's needed, like a check-in at the start of class
- [ ] Share the data with advertisers
- [ ] Remove the privacy policy
WHY: Data minimization means collecting only what the purpose actually requires.
:::

### LESSON 4.2 Introduction to Using Data Sets | 5 | 1.B
A **data set** is a collection of related data, often organized as **records** (rows) with **fields** (columns):

| name | grade | minutesStudied |
|---|---|---|
| Ada | 11 | 120 |
| Linus | 10 | 45 |

With code, you can **extract knowledge**: totals, averages, maximums, counts and trends.
- Clean data first, by fixing missing or inconsistent values.
- **Correlation isn't causation:** two things changing together doesn't prove one causes the other.
- A data set can only answer questions about what it contains. Missing groups mean missing answers.

:::quiz
Q: A data set shows students who study more also sleep less. What can you conclude?
- [ ] Studying causes less sleep
- [ ] Less sleep causes more studying
- [x] The two are related in this data, but cause and effect isn't proven
- [ ] Nothing at all
WHY: The data shows correlation. Causation needs more evidence.
:::

### LESSON Connecting Concepts: Topics 4.1–4.2 | 3 |
Before you write code that collects or analyzes data, ask three questions: *Is this data needed? Is it fair and representative? Is it protected?* The rest of Unit 4 gives you the tools to store and analyze that data.

:::quiz
Q: A fitness app's data set only includes people under 30. Why is it risky to use it to set exercise goals for everyone?
- [x] It may be biased, because older users aren't represented
- [ ] The data set is too small to store
- [ ] Ages can't be stored in arrays
- [ ] Data sets can't include ages
WHY: Conclusions from unrepresentative data may not apply to the groups that are missing.
:::

### LESSON 4.3 Array Creation and Access | 6 | 2.B, 3.B
An **array** holds a **fixed number** of values of one type:
```java
int[] scores = new int[5];             // [0, 0, 0, 0, 0]
String[] names = {"Ada", "Linus"};     // initializer list
double[] temps = new double[3];        // [0.0, 0.0, 0.0]
boolean[] flags = new boolean[2];      // [false, false]
```
- Elements are **default-initialized** to 0, 0.0, false, or `null` for objects.
- `arr.length` is the number of elements. It's a field, so **no parentheses**.
- Valid indexes go from `0` to `arr.length - 1`. Anything else throws `ArrayIndexOutOfBoundsException`.

```java
scores[0] = 90;
scores[scores.length - 1] = 75;   // the last element
```

:::quiz
Q: `String[] words = new String[4];` What is `words[2]`?
- [ ] ""
- [x] null
- [ ] It doesn't compile
- [ ] An exception
WHY: Object arrays start out filled with null.
:::

### LESSON 4.4 Array Traversals | 6 | 2.B, 3.B, 3.D
**Traversing** an array means visiting each element:
```java
// indexed for loop: can read AND change elements
for (int i = 0; i < arr.length; i++) {
    arr[i] *= 2;
}

// enhanced for loop: read-only copies of each value
for (int x : arr) {
    sum += x;
}
```
- Changing `x` inside an enhanced for loop does **not** change the array (for primitives).
- Use an indexed loop when you need the **index**, need to modify elements, or need to visit only some of them (like every other one, or backward).

:::quiz
Q: `int[] a = {1, 2, 3}; for (int x : a) x = 0;` What is `a` afterward?
- [x] {1, 2, 3}
- [ ] {0, 0, 0}
- [ ] {0, 2, 3}
- [ ] It doesn't compile
WHY: x is a copy of each element, so assigning to it doesn't change the array.
:::

### LESSON 4.5 Implementing Array Algorithms | 9 | 2.B, 3.B, 3.D, 4.A
Know these by heart:
```java
// sum / average
int sum = 0;
for (int x : arr) sum += x;
double avg = (double) sum / arr.length;

// max (start with the first element!)
int max = arr[0];
for (int x : arr) if (x > max) max = x;

// does any element match?  (all = no element fails)
boolean found = false;
for (int x : arr) if (x == target) found = true;

// pairs of neighbors: stop at length - 1
for (int i = 0; i < arr.length - 1; i++)
    if (arr[i] == arr[i + 1]) dupNext++;

// reverse in place
for (int i = 0; i < arr.length / 2; i++) {
    int t = arr[i];
    arr[i] = arr[arr.length - 1 - i];
    arr[arr.length - 1 - i] = t;
}

// shift left by one (the first element wraps to the end)
int first = arr[0];
for (int i = 0; i < arr.length - 1; i++) arr[i] = arr[i + 1];
arr[arr.length - 1] = first;
```

:::quiz
Q: `int[] a = {4, 1, 7, 3};` After the "shift left by one" code, what is a?
- [ ] {3, 4, 1, 7}
- [x] {1, 7, 3, 4}
- [ ] {1, 7, 3, 3}
- [ ] {7, 3, 4, 1}
WHY: Each element moves one place left, and the saved first element (4) goes to the end.
:::

### LESSON Connecting Concepts: Topics 4.3–4.5 | 4 |
Arrays + loops + selection = most of the exam. To write an array algorithm:
1. Pick the traversal: enhanced for to read values, indexed for if you need indexes or changes.
2. Initialize your result variable correctly: a sum starts at 0, a max starts at the first element.
3. Watch the bounds whenever you use `i + 1` or `i - 1`.

:::quiz
Q: What does this return for `{3, 3, 5, 5, 5}`? `int c = 0; for (int i = 1; i < a.length; i++) if (a[i] != a[i-1]) c++; return c;`
- [x] 1
- [ ] 2
- [ ] 3
- [ ] 4
WHY: It counts the places where a value changes from the one before it. That only happens once (3 → 5).
:::

### LESSON 4.6 Using Text Files | 7 | 2.C, 3.C, 4.B
Read data from a text file with `File` and `Scanner`:
```java
import java.io.File;
import java.io.IOException;
import java.util.Scanner;

public static void main(String[] args) throws IOException {
    Scanner sc = new Scanner(new File("scores.txt"));
    int total = 0;
    while (sc.hasNextInt()) {
        total += sc.nextInt();
    }
    sc.close();
    System.out.println(total);
}
```
| Method | Does |
|---|---|
| `hasNext()` / `hasNextInt()` / `hasNextLine()` | Checks whether more input is available |
| `next()` | Reads the next word (token) |
| `nextInt()` / `nextDouble()` | Reads the next number |
| `nextLine()` | Reads the rest of the current line |

Opening a file can fail, so the method must handle `IOException`, or declare it with **`throws IOException`**.

:::quiz
Q: Why does `main` need `throws IOException` here?
- [ ] Scanner always crashes
- [x] Opening a File might fail, and Java requires that possibility to be declared or handled
- [ ] To make the program faster
- [ ] Because nextInt is slow
WHY: IOException is a checked exception, so the compiler requires you to handle or declare it.
:::

### LESSON 4.7 Wrapper Classes | 5 | 2.B
ArrayLists can only hold **objects**, so each primitive type has a **wrapper class**:
- `int` → `Integer`
- `double` → `Double`

Java converts between them automatically:
```java
ArrayList<Integer> list = new ArrayList<Integer>();
list.add(5);              // autoboxing: int → Integer
int x = list.get(0);      // unboxing: Integer → int
```
Useful constants and methods: `Integer.MAX_VALUE`, `Integer.MIN_VALUE`, and `Integer.parseInt("42")` (text → int).

Unboxing a `null` Integer throws a NullPointerException.

:::quiz
Q: Why can't you write `ArrayList<int>`?
- [ ] int is too small
- [x] Generic types must be classes, so you use the wrapper class Integer
- [ ] ArrayList only stores Strings
- [ ] You can, it works the same
WHY: Type parameters must be reference types, so you write `ArrayList<Integer>`.
:::

### LESSON 4.8 ArrayList Methods | 7 | 2.B, 3.B, 3.D
An `ArrayList` is a **resizable** list of objects (`import java.util.ArrayList;`):

| Method | Does |
|---|---|
| `size()` | Returns the number of elements |
| `add(obj)` | Appends to the end (returns true) |
| `add(i, obj)` | Inserts at index i; later elements shift right |
| `get(i)` | Returns the element at index i |
| `set(i, obj)` | Replaces the element at i and **returns the old one** |
| `remove(i)` | Removes the element at i, **returns it**, and later elements shift left |

```java
ArrayList<String> list = new ArrayList<String>();
list.add("b");        // [b]
list.add(0, "a");     // [a, b]
list.set(1, "c");     // [a, c]   (returns "b")
list.remove(0);       // [c]      (returns "a")
```
| | Array | ArrayList | String |
|---|---|---|---|
| size | `.length` | `.size()` | `.length()` |

:::quiz
Q: `list` is `[5, 8, 2]`. What is the list after `list.add(1, 7); list.remove(2);`?
- [x] [5, 7, 2]
- [ ] [5, 7, 8]
- [ ] [5, 8, 2]
- [ ] [7, 8, 2]
WHY: add(1, 7) gives [5, 7, 8, 2]. Then remove(2) removes 8, leaving [5, 7, 2].
:::

### LESSON 4.9 ArrayList Traversals | 6 | 2.B, 3.D, 4.A
```java
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}
for (String s : list) {
    System.out.println(s);
}
```
### Removing while traversing
When you remove an element, later elements **shift left**. A forward loop then skips the next one:
```java
// correct: go backward
for (int i = list.size() - 1; i >= 0; i--) {
    if (list.get(i) < 0) list.remove(i);
}
```
Adding or removing during an **enhanced for** loop throws a `ConcurrentModificationException`.

:::quiz
Q: Why does removing items in a forward indexed loop sometimes miss one?
- [x] After a removal, the next element shifts into index i, but i still increases
- [ ] remove() doesn't actually remove anything
- [ ] size() never changes
- [ ] ArrayLists can't be looped forward
WHY: Loop backward instead, or don't increase i after a removal.
:::

### LESSON 4.10 Implementing ArrayList Algorithms | 8 | 2.B, 3.B, 3.D, 4.A
All the array algorithms work on ArrayLists, using `get` and `size()`. Plus a few that only make sense for a list that can change size:
```java
// filter: remove every word shorter than 3 letters
for (int i = list.size() - 1; i >= 0; i--)
    if (list.get(i).length() < 3)
        list.remove(i);

// build a new list from data
ArrayList<String> longWords = new ArrayList<String>();
for (String w : words)
    if (w.length() > 5) longWords.add(w);

// insert in sorted order
int i = 0;
while (i < list.size() && list.get(i) < val) i++;
list.add(i, val);
```
FRQ 3 often gives you a class, like `Song` with `getTitle()` and `getPlays()`, and asks you to process an `ArrayList<Song>`. Call the getters on each element.

:::quiz
Q: The "insert in sorted order" code runs with list = [2, 5, 9] and val = 6. Where does 6 go?
- [ ] Index 1
- [x] Index 2
- [ ] Index 3
- [ ] Index 0
WHY: The loop skips 2 and 5 (both less than 6) and stops at index 2 (the 9). So 6 is inserted at index 2.
:::

### LESSON Connecting Concepts: Topics 4.6–4.10 | 4 |
A common real-world pattern: **read** records from a file → **store** them in an ArrayList of objects → **analyze** them.

```java
ArrayList<Integer> nums = new ArrayList<Integer>();
Scanner sc = new Scanner(new File("data.txt"));
while (sc.hasNextInt()) nums.add(sc.nextInt());   // autoboxing
int count = 0;
for (int n : nums) if (n > 50) count++;            // unboxing
```

:::quiz
Q: The file holds `40 70 55 10`. What is count?
- [ ] 1
- [x] 2
- [ ] 3
- [ ] 4
WHY: 70 and 55 are greater than 50.
:::

### LESSON 4.11 2D Array Creation and Access | 6 | 2.B, 3.B
A **2D array** is an array of arrays, made of rows and columns:
```java
int[][] grid = new int[3][4];          // 3 rows, 4 columns, all 0
int[][] m = { {1, 2, 3},
              {4, 5, 6} };             // 2 rows, 3 columns
```
- `m.length` is the number of **rows** (2).
- `m[0].length` is the number of **columns** (3).
- `m[r][c]` is the element in row r, column c. For example, `m[1][2]` is 6.
- `m[r]` is a whole row, which is itself a 1D array.

:::quiz
Q: `int[][] m = {{1, 2, 3}, {4, 5, 6}};` What is `m[1][0] + m[0].length`?
- [ ] 5
- [x] 7
- [ ] 6
- [ ] 3
WHY: m[1][0] is 4 and m[0].length is 3, so the answer is 7.
:::

### LESSON Connecting Concepts: Topic 4.11 | 3 |
Think of a 2D array as a **table**: rows go down and columns go across. A spreadsheet, a game board and a seating chart all fit this pattern.

:::quiz
Q: A seating chart has 5 rows and 8 seats per row. Which declaration fits?
- [x] `String[][] seats = new String[5][8];`
- [ ] `String[][] seats = new String[8][5];`
- [ ] `String[] seats = new String[40];`
- [ ] `String[][] seats = new String[5, 8];`
WHY: The first size is the number of rows and the second is the number of columns. Java uses two sets of brackets.
:::

### LESSON 4.12 2D Array Traversals | 7 | 2.B, 3.B, 3.D
```java
// row-major: go across each row
for (int r = 0; r < grid.length; r++)
    for (int c = 0; c < grid[0].length; c++)
        System.out.print(grid[r][c] + " ");

// column-major: go down each column
for (int c = 0; c < grid[0].length; c++)
    for (int r = 0; r < grid.length; r++)
        System.out.print(grid[r][c] + " ");

// enhanced for: each row is an int[]
for (int[] row : grid)
    for (int val : row)
        sum += val;
```

:::quiz
Q: `int[][] g = {{1, 2}, {3, 4}};` What does the column-major traversal print?
- [ ] 1 2 3 4
- [x] 1 3 2 4
- [ ] 4 3 2 1
- [ ] 1 2 4 3
WHY: Column 0 is 1, 3, and column 1 is 2, 4.
:::

### LESSON 4.13 Implementing 2D Array Algorithms | 8 | 2.B, 3.B, 3.D, 4.A
```java
// sum of one row
int rowSum = 0;
for (int c = 0; c < grid[r].length; c++) rowSum += grid[r][c];

// sum of one column
int colSum = 0;
for (int r = 0; r < grid.length; r++) colSum += grid[r][c];

// count the cells that match
for (int[] row : grid) for (int v : row) if (v > 0) count++;

// check a neighbor safely (stay in bounds!)
if (r + 1 < grid.length && grid[r + 1][c] == target) ...
```
FRQ 4 usually asks for one method that loops over a 2D array with **nested loops**, often checking neighbors or finding the best row or column.

:::quiz
Q: Which condition safely checks the cell to the **left** of `grid[r][c]`?
- [x] `c - 1 >= 0 && grid[r][c - 1] == x`
- [ ] `grid[r][c - 1] == x && c - 1 >= 0`
- [ ] `c + 1 < grid[0].length && grid[r][c - 1] == x`
- [ ] `grid[r - 1][c] == x`
WHY: Check the bounds first, so short-circuiting stops before an out-of-bounds index.
:::

### LESSON Connecting Concepts: Topics 4.12–4.13 | 3 |
For any 2D task, decide: **row-major or column-major?** **Every cell, or just one row or column?** **Do I need neighbors, and what about the edges?**

:::quiz
Q: To find the column with the largest total, which loop order is most natural?
- [x] Outer loop over columns, inner loop over rows
- [ ] Outer loop over rows, inner loop over columns
- [ ] A single loop
- [ ] An enhanced for over rows only
WHY: You need a total per column, so go column by column and add down the rows.
:::

### LESSON 4.14 Searching Algorithms | 7 | 2.B, 3.B, 4.A
**Linear (sequential) search** checks each element in order. It works on **any** array or list:
```java
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++)
        if (arr[i] == target) return i;
    return -1;
}
```
**Binary search** needs **sorted** data. It checks the middle and throws away half each time:
```java
int lo = 0, hi = arr.length - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
```
For n elements, a linear search can take up to n checks, while a binary search takes only about log₂(n) checks.

:::quiz
Q: What's the maximum number of elements binary search checks in a sorted array of 1000 elements?
- [ ] 1000
- [ ] 500
- [x] About 10
- [ ] 100
WHY: Each step halves the range, and 2¹⁰ = 1024 ≥ 1000.
:::

### LESSON 4.15 Sorting Algorithms | 9 | 3.B, 4.A, 4.B
**Selection sort:** for each position, find the **smallest** remaining element and **swap** it into that position.
```java
for (int i = 0; i < arr.length - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < arr.length; j++)
        if (arr[j] < arr[minIdx]) minIdx = j;
    int t = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = t;
}
```
**Insertion sort:** take the next element and **slide** it left into the sorted part.
```java
for (int i = 1; i < arr.length; i++) {
    int key = arr[i];
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
    }
    arr[j + 1] = key;
}
```
After pass k of selection sort, the first k elements are the k smallest, in their **final** positions. Insertion sort's first part is sorted, but only relative to itself.

:::quiz
Q: Insertion sort runs on `{5, 2, 4, 1}`. What is the array after the **first** pass (i = 1)?
- [x] {2, 5, 4, 1}
- [ ] {1, 2, 4, 5}
- [ ] {2, 4, 5, 1}
- [ ] {1, 5, 4, 2}
WHY: Only the 2 is inserted, and it slides in front of the 5.
:::

### LESSON 4.16 Recursion | 8 | 3.C, 4.A, 4.B
A **recursive method** calls itself. Every recursive method needs:
1. A **base case** that returns without recursing.
2. A **recursive case** that moves toward the base case.

```java
public static int sumDigits(int n) {
    if (n < 10) return n;                    // base case
    return n % 10 + sumDigits(n / 10);       // recursive case
}
// sumDigits(472) → 2 + sumDigits(47) → 2 + 7 + sumDigits(4) → 2 + 7 + 4 = 13
```
Each call gets its own copy of its parameters and local variables, stored on the **call stack**. Without a base case, the calls never stop, and you get a `StackOverflowError`.

To **trace** recursion, write down each call going in, then fill in the return values on the way back out.

:::quiz
Q: What does `f(4)` return? `int f(int n) { if (n == 0) return 1; return 2 * f(n - 1); }`
- [ ] 8
- [x] 16
- [ ] 4
- [ ] 32
WHY: f(0) = 1, f(1) = 2, f(2) = 4, f(3) = 8, f(4) = 16. It computes 2ⁿ.
:::

### LESSON 4.17 Recursive Searching and Sorting | 9 |
### Recursive binary search
```java
public static int search(int[] arr, int target, int lo, int hi) {
    if (lo > hi) return -1;                        // base case: not found
    int mid = (lo + hi) / 2;
    if (arr[mid] == target) return mid;            // base case: found
    if (arr[mid] < target) return search(arr, target, mid + 1, hi);
    return search(arr, target, lo, mid - 1);
}
```
### Merge sort
1. **Split** the array in half.
2. **Recursively sort** each half.
3. **Merge** the two sorted halves by repeatedly taking the smaller front element.

Merge sort is much faster than selection or insertion sort on large data. It needs extra space for the merging step.

:::quiz
Q: In merge sort, what happens after both halves are sorted?
- [ ] The halves are swapped
- [x] The halves are merged by repeatedly taking the smaller front element
- [ ] Selection sort runs on the whole array
- [ ] Nothing, the array is already sorted
WHY: Merging two sorted halves produces one sorted array.
:::

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

### QUIZ
Q: What is printed?
```java
int[] a = {2, 4, 6, 8};
int t = 0;
for (int i = 0; i < a.length; i += 2) t += a[i];
System.out.println(t);
```
- [ ] 20
- [x] 8
- [ ] 12
- [ ] 6
WHY: Only the even indexes are added: a[0] + a[2] = 2 + 6 = 8.

Q: `ArrayList<String> list` holds `["x", "y", "z"]`. What does `list.set(1, "w")` return?
- [ ] "w"
- [x] "y"
- [ ] true
- [ ] Nothing (void)
WHY: set returns the element that was replaced.

Q: `int[][] g = new int[4][6];` What is `g.length * g[0].length`?
- [ ] 10
- [x] 24
- [ ] 4
- [ ] 6
WHY: 4 rows × 6 columns = 24 elements.

Q: Which is the best reason to choose binary search over linear search?
- [ ] The data is unsorted
- [x] The data is sorted and large
- [ ] The data has duplicates
- [ ] The data is an ArrayList of Strings
WHY: Binary search needs sorted data and is much faster on large inputs.

Q: After two passes of selection sort on `{9, 3, 7, 1, 5}`, what is the array?
- [x] {1, 3, 7, 9, 5}
- [ ] {1, 3, 5, 7, 9}
- [ ] {3, 9, 7, 1, 5}
- [ ] {1, 9, 7, 3, 5}
WHY: Pass 1 swaps 1 into index 0: {1, 3, 7, 9, 5}. Pass 2 finds that 3 is already the smallest remaining value, so nothing changes.

Q: What does `mystery(5)` return?
```java
public static int mystery(int n) {
    if (n <= 1) return 1;
    return n * mystery(n - 2);
}
```
- [ ] 120
- [x] 15
- [ ] 5
- [ ] 8
WHY: 5 * mystery(3) = 5 * 3 * mystery(1) = 5 * 3 * 1 = 15.

Q: A method reads a file with `Scanner sc = new Scanner(new File("in.txt"));`. Which loop reads every word?
- [x] `while (sc.hasNext()) { String w = sc.next(); }`
- [ ] `for (String w : sc) { }`
- [ ] `while (sc.next() != null) { }`
- [ ] `while (sc.hasNextInt()) { String w = sc.next(); }`
WHY: hasNext() checks for another token, and next() reads it.

Q: `ArrayList<Integer> nums` holds [3, 8, 1]. What does `nums.get(nums.size() - 1) + nums.get(0)` evaluate to?
- [ ] 11
- [x] 4
- [ ] 9
- [ ] IndexOutOfBoundsException
WHY: The last element is 1 and the first is 3, so 1 + 3 = 4.

### TRACE
Q: What is printed?
```java
int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 10}};
int s = 0;
for (int i = 0; i < m.length; i++) s += m[i][m.length - 1 - i];
System.out.println(s);
```
- [x] 15
- [ ] 16
- [ ] 18
- [ ] 12
WHY: It adds the anti-diagonal: m[0][2] + m[1][1] + m[2][0] = 3 + 5 + 7 = 15. (The main diagonal would be 1 + 5 + 10 = 16.)

Q: What is printed?
```java
ArrayList<Integer> a = new ArrayList<Integer>();
for (int i = 1; i <= 5; i++) a.add(i * i);
for (int i = a.size() - 1; i >= 0; i--)
    if (a.get(i) % 2 == 1) a.remove(i);
System.out.println(a);
```
- [x] [4, 16]
- [ ] [1, 9, 25]
- [ ] [4, 9, 16]
- [ ] [1, 4, 9, 16, 25]
WHY: The list is [1, 4, 9, 16, 25]. Removing the odd values backward leaves [4, 16].

