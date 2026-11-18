# FRQS
<!-- Original practice FRQs in the 2025–26 AP CSA format. Q1 Methods and Control Structures (7), Q2 Class Design (7), Q3 Data Analysis with ArrayList (5), Q4 2D Array (6). -->

## FRQ frq1a | 1 | Methods and Control Structures | DigitTools
SCENARIO
The `DigitTools` class contains static methods that work with numbers and words.

```java
public class DigitTools
{
    /** Returns the number of even digits in n.
     *  Precondition: n > 0 */
    public static int countEvenDigits(int n)
    { /* to be implemented in part (a) */ }

    /** Returns word with every occurrence of letter replaced by "*".
     *  Precondition: letter.length() == 1 */
    public static String censor(String word, String letter)
    { /* to be implemented in part (b) */ }
}
```

### PART a | 4
Write the static method `countEvenDigits`. It returns how many digits of `n` are even. The digit 0 counts as even.

| Call | Returns |
|---|---|
| `countEvenDigits(2468)` | 4 |
| `countEvenDigits(13579)` | 0 |
| `countEvenDigits(1020)` | 3 |
| `countEvenDigits(7)` | 0 |

STARTER
```java
public static int countEvenDigits(int n)
{

}
```
SOLUTION
```java
public static int countEvenDigits(int n)
{
    int count = 0;
    while (n > 0)
    {
        int digit = n % 10;
        if (digit % 2 == 0)
        {
            count++;
        }
        n /= 10;
    }
    return count;
}
```
RUBRIC
- 1 | Loops until every digit of n has been examined (for example, `while (n > 0)`)
- 1 | Gets each digit correctly with `% 10`, and moves to the next digit with `/ 10`
- 1 | Tests whether a digit is even, including 0 (`digit % 2 == 0`)
- 1 | Counts the even digits and returns the count

### PART b | 3
Write the static method `censor`. It returns a new String that is the same as `word`, except that every occurrence of `letter` is replaced by `"*"`.

| Call | Returns |
|---|---|
| `censor("banana", "a")` | `"b*n*n*"` |
| `censor("code", "x")` | `"code"` |
| `censor("aaa", "a")` | `"***"` |

STARTER
```java
public static String censor(String word, String letter)
{

}
```
SOLUTION
```java
public static String censor(String word, String letter)
{
    String result = "";
    for (int i = 0; i < word.length(); i++)
    {
        String ch = word.substring(i, i + 1);
        if (ch.equals(letter))
        {
            result += "*";
        }
        else
        {
            result += ch;
        }
    }
    return result;
}
```
RUBRIC
- 1 | Accesses every character of word with `substring` (no index out of bounds)
- 1 | Compares each character to letter using `equals`
- 1 | Builds and returns the correct new String

## FRQ frq1b | 1 | Methods and Control Structures | PlantGrower
SCENARIO
A `PlantGrower` models a plant that grows a different amount each day. The method `growthOnDay` is already written for you.

```java
public class PlantGrower
{
    private double height;   // current height in cm

    /** Returns the growth in cm on the given day (day >= 1).
     *  Implementation not shown. */
    public double growthOnDay(int day)
    { /* implementation not shown */ }

    /** Grows the plant one day at a time, starting with day 1, until its height
     *  is at least target. Returns the number of days needed, or -1 if the
     *  target is not reached within 365 days. */
    public int daysToReach(double target)
    { /* to be implemented in part (a) */ }

    /** Returns a label code. See part (b). */
    public static String plantCode(String name, int day)
    { /* to be implemented in part (b) */ }
}
```

### PART a | 4
Write `daysToReach`. Starting with day 1, add `growthOnDay(day)` to `height` once per day. Return the first day number on which `height >= target`. If `height` is already at least `target` before day 1, return `0`. If the target isn't reached after day 365, return `-1`. The instance variable `height` should be updated as the plant grows.

STARTER
```java
public int daysToReach(double target)
{

}
```
SOLUTION
```java
public int daysToReach(double target)
{
    if (height >= target)
    {
        return 0;
    }
    for (int day = 1; day <= 365; day++)
    {
        height += growthOnDay(day);
        if (height >= target)
        {
            return day;
        }
    }
    return -1;
}
```
RUBRIC
- 1 | Returns 0 when height already meets the target
- 1 | Loops over days 1 through 365, calling `growthOnDay` with the correct day
- 1 | Updates height and returns the first day on which height >= target
- 1 | Returns -1 if the target isn't reached within 365 days

### PART b | 3
Write the static method `plantCode`. It returns the **first two letters** of `name`, followed by the **last letter** of `name`, followed by `day`. If `name` has fewer than 3 letters, the code is the whole name followed by `day`.

| Call | Returns |
|---|---|
| `plantCode("Basil", 12)` | `"Bal12"` |
| `plantCode("Mint", 3)` | `"Mit3"` |
| `plantCode("Yo", 7)` | `"Yo7"` |

STARTER
```java
public static String plantCode(String name, int day)
{

}
```
SOLUTION
```java
public static String plantCode(String name, int day)
{
    if (name.length() < 3)
    {
        return name + day;
    }
    return name.substring(0, 2) + name.substring(name.length() - 1) + day;
}
```
RUBRIC
- 1 | Handles names shorter than 3 letters
- 1 | Gets the first two letters and the last letter correctly with `substring`
- 1 | Builds and returns the code, including day

## FRQ frq2a | 2 | Class Design | StudyTimer
SCENARIO
A `StudyTimer` keeps track of study time for one subject and compares it with a goal. Write the complete `StudyTimer` class.

| Statement | Result | Explanation |
|---|---|---|
| `StudyTimer t = new StudyTimer("Math", 60);` | | Subject "Math", with a goal of 60 minutes |
| `t.addSession(25);` | | Total is 25 |
| `t.addSession(-10);` | | Negative sessions are ignored |
| `t.isGoalMet()` | `false` | 25 < 60 |
| `t.addSession(40);` | | Total is 65 |
| `t.isGoalMet()` | `true` | 65 >= 60 |
| `t.getSummary()` | `"Math: 65/60"` | subject, total and goal |

### PART a | 7
Write the complete `StudyTimer` class, including any instance variables and the constructor. Your class must behave as shown in the table.

STARTER
```java
public class StudyTimer
{

}
```
SOLUTION
```java
public class StudyTimer
{
    private String subject;
    private int goal;
    private int total;

    public StudyTimer(String subject, int goal)
    {
        this.subject = subject;
        this.goal = goal;
        total = 0;
    }

    public void addSession(int minutes)
    {
        if (minutes > 0)
        {
            total += minutes;
        }
    }

    public boolean isGoalMet()
    {
        return total >= goal;
    }

    public String getSummary()
    {
        return subject + ": " + total + "/" + goal;
    }
}
```
RUBRIC
- 1 | Declares the class header and private instance variables for subject, goal and total
- 1 | Constructor header has the correct parameters (String, int)
- 1 | Constructor initializes all instance variables correctly (total starts at 0)
- 1 | `addSession` has the correct header and adds only positive minutes
- 1 | `isGoalMet` returns `total >= goal`
- 1 | `getSummary` has the correct header (returns String)
- 1 | `getSummary` builds the exact format "Subject: total/goal"

## FRQ frq2b | 2 | Class Design | LockerCode
SCENARIO
A `LockerCode` represents a school locker lock with a numeric code. After **3 wrong guesses in a row**, the lock is **locked** and rejects every guess, even the correct one. A correct guess before it locks resets the count of wrong guesses.

| Statement | Result | Explanation |
|---|---|---|
| `LockerCode lock = new LockerCode(427);` | | The code is 427 |
| `lock.tryCode(111)` | `false` | 1 wrong guess |
| `lock.tryCode(427)` | `true` | Correct, so the wrong-guess count resets to 0 |
| `lock.tryCode(1)` | `false` | 1 wrong |
| `lock.tryCode(2)` | `false` | 2 wrong |
| `lock.isLocked()` | `false` | |
| `lock.tryCode(3)` | `false` | 3 wrong in a row, so it's now locked |
| `lock.tryCode(427)` | `false` | Locked: rejects even the right code |
| `lock.isLocked()` | `true` | |

### PART a | 7
Write the complete `LockerCode` class, including any instance variables and the constructor.

STARTER
```java
public class LockerCode
{

}
```
SOLUTION
```java
public class LockerCode
{
    private int code;
    private int wrongInARow;

    public LockerCode(int code)
    {
        this.code = code;
        wrongInARow = 0;
    }

    public boolean tryCode(int guess)
    {
        if (isLocked())
        {
            return false;
        }
        if (guess == code)
        {
            wrongInARow = 0;
            return true;
        }
        wrongInARow++;
        return false;
    }

    public boolean isLocked()
    {
        return wrongInARow >= 3;
    }
}
```
RUBRIC
- 1 | Private instance variables for the code and a wrong-guess counter (or a locked flag)
- 1 | Constructor with an int parameter initializes the state
- 1 | `tryCode` header returns boolean and takes an int
- 1 | `tryCode` returns false whenever the lock is locked
- 1 | A correct guess (while unlocked) returns true and resets the wrong count
- 1 | A wrong guess updates the count, and the lock locks after 3 wrong in a row
- 1 | `isLocked` returns the correct boolean

## FRQ frq3a | 3 | Data Analysis with ArrayList | Playlist
SCENARIO
A `Song` class is provided:

```java
public class Song
{
    public String getTitle()  { /* not shown */ }
    public String getArtist() { /* not shown */ }
    public int getPlays()     { /* not shown */ }
}
```

A `Playlist` stores songs in an `ArrayList`:

```java
public class Playlist
{
    private ArrayList<Song> songs;

    /** Removes every song with fewer than minPlays plays.
     *  Returns the number of songs removed. */
    public int removeUnpopular(int minPlays)
    { /* to be implemented */ }
}
```

### PART a | 5
Write `removeUnpopular`. After the call, `songs` should contain only the songs with at least `minPlays` plays, in their original order.

Example: the plays are `[120, 4, 4, 300, 9]`. `removeUnpopular(10)` removes 3 songs and returns `3`, leaving plays `[120, 300]`.

STARTER
```java
public int removeUnpopular(int minPlays)
{

}
```
SOLUTION
```java
public int removeUnpopular(int minPlays)
{
    int removed = 0;
    for (int i = songs.size() - 1; i >= 0; i--)
    {
        if (songs.get(i).getPlays() < minPlays)
        {
            songs.remove(i);
            removed++;
        }
    }
    return removed;
}
```
RUBRIC
- 1 | Accesses every element of songs (no elements skipped after a removal)
- 1 | Calls `getPlays()` on Song objects
- 1 | Compares plays with minPlays correctly (`< minPlays` gets removed)
- 1 | Removes the correct songs, keeping the rest in order
- 1 | Counts and returns the number removed

## FRQ frq3b | 3 | Data Analysis with ArrayList | Weather
SCENARIO
A `Reading` holds one sensor measurement:

```java
public class Reading
{
    public String getSensor() { /* not shown */ }
    public double getValue()  { /* not shown */ }
}
```

```java
public class Weather
{
    private ArrayList<Reading> readings;

    /** Returns the average value of all readings from the given sensor,
     *  or -1.0 if there are no readings from that sensor. */
    public double averageFor(String sensor)
    { /* to be implemented */ }
}
```

### PART a | 5
Write `averageFor`.

Example: the readings are `("roof", 20.0)`, `("lab", 18.5)`, `("roof", 22.0)`. Then `averageFor("roof")` returns `21.0`, and `averageFor("gym")` returns `-1.0`.

STARTER
```java
public double averageFor(String sensor)
{

}
```
SOLUTION
```java
public double averageFor(String sensor)
{
    double sum = 0.0;
    int count = 0;
    for (Reading r : readings)
    {
        if (r.getSensor().equals(sensor))
        {
            sum += r.getValue();
            count++;
        }
    }
    if (count == 0)
    {
        return -1.0;
    }
    return sum / count;
}
```
RUBRIC
- 1 | Traverses all of readings
- 1 | Compares sensor names with `equals`
- 1 | Adds up the values and counts the matching readings
- 1 | Returns -1.0 when there are no matches (no division by zero)
- 1 | Returns the correct average as a double

## FRQ frq4a | 4 | 2D Array | ScoreBoard
SCENARIO
A `ScoreBoard` stores game scores in a 2D array. Each row is one team, and each column is one round.

```java
public class ScoreBoard
{
    private int[][] scores;

    /** Returns the index of the row (team) with the largest total.
     *  If there is a tie, returns the smallest such index.
     *  Precondition: scores has at least one row and one column. */
    public int bestTeam()
    { /* to be implemented */ }
}
```

### PART a | 6
Write `bestTeam`.

Example:

| | round 0 | round 1 | round 2 |
|---|---|---|---|
| team 0 | 5 | 3 | 8 |
| team 1 | 9 | 1 | 6 |
| team 2 | 4 | 4 | 2 |

Team 0 and team 1 both total 16. `bestTeam()` returns `0`, the smaller index.

STARTER
```java
public int bestTeam()
{

}
```
SOLUTION
```java
public int bestTeam()
{
    int best = 0;
    int bestTotal = 0;
    for (int r = 0; r < scores.length; r++)
    {
        int total = 0;
        for (int c = 0; c < scores[r].length; c++)
        {
            total += scores[r][c];
        }
        if (r == 0 || total > bestTotal)
        {
            best = r;
            bestTotal = total;
        }
    }
    return best;
}
```
RUBRIC
- 1 | Traverses every row
- 1 | Traverses every column within a row (nested loops, no out-of-bounds access)
- 1 | Computes each row's total correctly (resets the total for each row)
- 1 | Compares totals, starting from the first row's total rather than an arbitrary 0 that could break with negatives
- 1 | Keeps the smaller index on ties (uses `>`, not `>=`)
- 1 | Returns the index of the best row

## FRQ frq4b | 4 | 2D Array | HeatMap
SCENARIO
A `HeatMap` stores temperatures in a 2D array of doubles. A **hotspot** is a cell whose value is **greater than** `threshold` **and** greater than every neighbor directly above, below, left and right of it that exists. Cells on the edges have fewer neighbors.

```java
public class HeatMap
{
    private double[][] temps;

    /** Returns the number of hotspots in temps. */
    public int countHotspots(double threshold)
    { /* to be implemented */ }
}
```

### PART a | 6
Write `countHotspots`.

Example (`threshold` = 50.0):

| | col 0 | col 1 | col 2 |
|---|---|---|---|
| row 0 | 60.0 | 40.0 | 70.0 |
| row 1 | 45.0 | 55.0 | 65.0 |

- (0,0) is 60.0: it's greater than 50, its right neighbor 40 and its lower neighbor 45. **Hotspot.**
- (0,2) is 70.0: greater than 40 and 65. **Hotspot.**
- (1,1) is 55.0: its upper neighbor is 40 and its left is 45, but its right neighbor is 65. Not a hotspot.

`countHotspots(50.0)` returns `2`.

STARTER
```java
public int countHotspots(double threshold)
{

}
```
SOLUTION
```java
public int countHotspots(double threshold)
{
    int count = 0;
    for (int r = 0; r < temps.length; r++)
    {
        for (int c = 0; c < temps[0].length; c++)
        {
            double v = temps[r][c];
            boolean hot = v > threshold;
            if (r > 0 && temps[r - 1][c] >= v) hot = false;
            if (r < temps.length - 1 && temps[r + 1][c] >= v) hot = false;
            if (c > 0 && temps[r][c - 1] >= v) hot = false;
            if (c < temps[0].length - 1 && temps[r][c + 1] >= v) hot = false;
            if (hot)
            {
                count++;
            }
        }
    }
    return count;
}
```
RUBRIC
- 1 | Traverses every cell with nested loops
- 1 | Checks the value against threshold (strictly greater)
- 1 | Compares with the up and down neighbors only when they exist (bounds checks)
- 1 | Compares with the left and right neighbors only when they exist (bounds checks)
- 1 | Requires the cell to be greater than all existing neighbors
- 1 | Counts and returns the number of hotspots
