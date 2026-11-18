# COURSE csp | AP CS Principles | AP CSP | 🌐 | 2 | Sophomore | #10b981
> All 5 Big Ideas of AP CSP: creative development, data, algorithms and programming, networks, and the impact of computing. Uses the AP exam's pseudocode.

## UNIT csp1 | Big Idea 1: Creative Development

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

## UNIT csp2 | Big Idea 2: Data

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

## UNIT csp3 | Big Idea 3: Algorithms & Programming

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

## UNIT csp4 | Big Idea 4: Computer Systems & Networks

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

## UNIT csp5 | Big Idea 5: Impact of Computing

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
