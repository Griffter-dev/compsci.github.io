# COURSE web | Web Development | HTML · CSS · JS | 🕸️ | 1 | Freshman / Sophomore | #f97316
> Build real web pages: structure with HTML, style with CSS, and make them interactive with JavaScript.

## UNIT web1 | HTML Structure

### LESSON Tags, elements and page structure | 10
HTML describes the **structure** of a web page using **tags**. Most elements have an opening tag and a closing tag:

```html
<p>This is a paragraph.</p>
<a href="https://example.com">A link</a>
<img src="cat.png" alt="An orange cat sleeping">
```

- `href`, `src` and `alt` are **attributes**. They give extra information about an element.
- `<img>` is a **void element**, which means it has no closing tag.

### Every page has a skeleton
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Page</title>      <!-- shows in the browser tab -->
  </head>
  <body>
    <h1>Hello!</h1>              <!-- visible content -->
  </body>
</html>
```

### Semantic HTML
Use tags that describe **meaning**, not just looks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. Screen readers and search engines understand them better than a pile of `<div>`s.

### Headings and lists
- Headings go from `<h1>` (biggest, used once per page) down to `<h6>`.
- `<ul>` makes a bulleted list and `<ol>` makes a numbered list. Each item goes in an `<li>`.

> **Accessibility:** Always give images an `alt` description so people using screen readers know what they show.

### QUIZ
Q: Which tag makes the largest heading?
- [x] `<h1>`
- [ ] `<h6>`
- [ ] `<head>`
- [ ] `<header>`
WHY: Headings go from `<h1>` (most important and largest) to `<h6>`. `<head>` holds page info, not visible headings.

Q: Which attribute sets where a link goes?
- [ ] `src`
- [x] `href`
- [ ] `link`
- [ ] `alt`
WHY: `<a href="...">` sets the link destination. `src` is used for images and scripts.

Q: What is the `alt` attribute on an image for?
- [ ] Making the image bigger
- [x] Describing the image for screen readers, or if it fails to load
- [ ] Adding a caption under the image
- [ ] Linking the image to another page
WHY: `alt` text is read aloud by screen readers and shown if the image can't load.

Q: Which of these is a **semantic** element?
- [ ] `<div>`
- [ ] `<span>`
- [x] `<nav>`
- [ ] `<b>`
WHY: `<nav>` tells browsers and screen readers that the section holds navigation links. `<div>` has no meaning.

Q: Where does the `<title>` element go?
- [x] Inside `<head>`
- [ ] Inside `<body>`
- [ ] Before `<!DOCTYPE html>`
- [ ] Inside `<h1>`
WHY: `<title>` belongs in `<head>`. It sets the text shown in the browser tab.

### TRACE
Q: How does this HTML appear in the browser?
```html
<p>Learn <strong>HTML</strong> <em>first</em>.</p>
```
- [ ] Learn HTML first. (all plain text)
- [x] Learn **HTML** *first*. (HTML in bold, "first" in italics)
- [ ] Learn *HTML* **first**. (HTML in italics, "first" in bold)
- [ ] The tags are shown as text
WHY: `<strong>` shows as bold (and means "important"). `<em>` shows as italics (and means "emphasis").

### BUG
Q: This page shows up wrong. Click the broken line.
```html
<body>
  <h1>Welcome</h2>
  <p>Thanks for visiting.</p>
  <a href="about.html">About me</a>
</body>
```
LINE: 2
FIX: <h1>Welcome</h1>
WHY: The opening and closing tags must match. `<h1>` must be closed with `</h1>`.

### LESSON Links, images, tables and forms | 11 | Build pages
### Links and images
```html
<a href="about.html">About us</a>                       <!-- relative link -->
<a href="https://example.com" target="_blank">Site</a>  <!-- opens a new tab -->
<a href="#contact">Jump down</a>                       <!-- goes to id="contact" -->
<img src="images/dog.jpg" alt="A golden retriever catching a frisbee">
```

The `alt` text describes the image for screen readers and shows up if the image fails to load. Every content image needs one. Purely decorative images get `alt=""`.

**Relative paths:** `images/dog.jpg` means "the images folder next to this page". `../style.css` means "go up one folder first".

### Tables are for data
```html
<table>
  <thead><tr><th>Name</th><th>Score</th></tr></thead>
  <tbody>
    <tr><td>Ana</td><td>92</td></tr>
    <tr><td>Ben</td><td>88</td></tr>
  </tbody>
</table>
```

`<tr>` is a row, `<th>` is a header cell and `<td>` is a data cell. Don't use tables to lay out a page; use CSS for that.

### Forms
```html
<form action="/signup" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="age">Age</label>
  <input id="age" name="age" type="number" min="13" max="19">

  <label><input type="checkbox" name="news"> Send me news</label>

  <select name="grade">
    <option>9</option><option>10</option><option>11</option><option>12</option>
  </select>
  <button type="submit">Sign up</button>
</form>
```

- `for` on a label must match the `id` of its input. Clicking the label then focuses the input, and screen readers read them together.
- `type="email"`, `required`, `min` and `max` give free validation in the browser.
- `name` is the key the data is sent under.

### LESSON Accessibility and validation | 8 | Standards
An **accessible** site works for everyone, including people using screen readers, keyboards only or zoomed-in screens.

- Use **semantic tags** (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, `<button>`) instead of a pile of `<div>`s.
- Keep headings in order: one `<h1>`, then `<h2>`s, and don't skip levels.
- Give every image useful `alt` text and every input a `<label>`.
- Make sure text has enough **color contrast** with its background (WCAG asks for at least 4.5 : 1 for normal text).
- Everything clickable must work with the **keyboard** (Tab, Enter). Real `<button>` and `<a>` elements do this for free.
- Set the page language: `<html lang="en">`.

### Valid HTML
Every page should start with `<!DOCTYPE html>` and pass the **W3C validator** (validator.w3.org). Common errors: tags closed in the wrong order, duplicate `id`s and missing `alt` attributes.

### QUIZ
Q: Consider the following HTML.
PTS: 1
```html
<label for="user">Username</label>
<input id="username" type="text">
```
ASK: Which of the following best describes the problem with this code?
- [x] The label is not connected to the input, because `for` does not match the input's `id`.
- [ ] `<label>` must always wrap the `<input>`.
- [ ] `type="text"` is not a valid input type.
- [ ] Inputs must have a `name` attribute or the page will not display.
WHY: `for="user"` points to an element with `id="user"`, which doesn't exist. It should be `for="username"`.

Q: Which of the following `<img>` tags follow accessibility best practices?
PTS: 1
OPT I: `<img src="chart.png" alt="Bar chart: test scores rose from 70 to 85">`
OPT II: `<img src="divider.png" alt="">` (a purely decorative line)
OPT III: `<img src="logo.png">`
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: I describes what the image shows. II correctly marks a decorative image with an empty `alt` so screen readers skip it. III has no `alt` at all.

Q: A page is in the folder `site/blog/`. Its stylesheet is `site/css/main.css`. Which `href` correctly links the stylesheet from the page?
PTS: 1
- [ ] `css/main.css`
- [x] `../css/main.css`
- [ ] `/blog/css/main.css`
- [ ] `main.css`
WHY: `..` goes up from `blog/` to `site/`, and then into `css/`.

Q: Which element should hold the cell "Score" in the top row of a data table?
- [ ] `<td>`
- [x] `<th>`
- [ ] `<tr>`
- [ ] `<thead>`
WHY: `<th>` is a header cell. `<thead>` is the section that holds the header row, and `<tr>` is the row itself.

Q: Which of the following will the browser check automatically, with no JavaScript, when the form is submitted?
PTS: 1
OPT I: `<input type="email" required>` is not left empty
OPT II: `<input type="number" min="1" max="10">` is not 50
OPT III: A password and a "confirm password" field match
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: `required`, `type="email"`, `min` and `max` are built-in validation. HTML has no attribute that compares two fields, so III needs JavaScript.


## UNIT web2 | CSS Styling & Layout

### LESSON Selectors, the box model and flexbox | 12
CSS controls how a page **looks**. A rule has a **selector** and a set of **declarations**:

```css
p { color: navy; font-size: 18px; }   /* every <p> */
.card { border-radius: 8px; }         /* class="card" */
#hero { height: 400px; }              /* id="hero" */
```

### Specificity
When rules conflict, the more **specific** selector wins: **id > class > element**. If two rules are equally specific, the one that comes **later** wins.

### The box model
Every element is a box. From the inside out, the box has four layers:
1. **content**: the text or image
2. **padding**: space inside the border
3. **border**: the edge of the box
4. **margin**: space outside the border

By default, `width` sets the size of the content only, so padding and border are **added** on top. Set `box-sizing: border-box` to make `width` include them.

### Flexbox
```css
.row {
  display: flex;
  justify-content: center;  /* main axis (horizontal by default) */
  align-items: center;      /* cross axis (vertical) */
  gap: 12px;
}
```

### Responsive design
```css
@media (max-width: 600px) {
  .row { flex-direction: column; }  /* stack items on small screens */
}
```

### QUIZ
Q: What does the selector `.card` target?
- [ ] All `<card>` elements
- [x] Elements with `class="card"`
- [ ] The element with `id="card"`
- [ ] Only the first card
WHY: A dot means **class** and a `#` means **id**. A selector with no symbol, like `p`, matches a tag name.

Q: What is the box model order from the inside out?
- [ ] margin, border, padding, content
- [x] content, padding, border, margin
- [ ] content, margin, border, padding
- [ ] padding, content, border, margin
WHY: Content sits in the middle, padding surrounds it, then the border, then margin on the outside.

Q: An element has both an id rule and a class rule that set its `color`. Which wins?
- [x] The id rule
- [ ] The class rule
- [ ] Whichever is shorter
- [ ] Neither, so the default color is used
WHY: id selectors are more specific than class selectors.

Q: What does `justify-content: center` do in a flex container (default direction)?
- [x] Centers items horizontally
- [ ] Centers items vertically
- [ ] Centers the text inside each item
- [ ] Nothing without `float`
WHY: `justify-content` works along the **main axis**, which is horizontal for `flex-direction: row`.

Q: When do the rules inside `@media (max-width: 600px)` apply?
- [ ] On screens wider than 600px
- [x] On screens 600px wide or narrower
- [ ] Only when printing
- [ ] Always
WHY: `max-width: 600px` means "up to 600px wide". This is how you make layouts adapt to phones.

### TRACE
Q: What color is the text "Hello"?
```css
p      { color: blue; }
.note  { color: green; }
#first { color: red; }

<p id="first" class="note">Hello</p>
```
- [ ] blue
- [ ] green
- [x] red
- [ ] black
WHY: All three rules match, and the id selector `#first` has the highest specificity.

Q: With the default `box-sizing`, how wide is this box from border edge to border edge?
```css
.box {
  width: 200px;
  padding: 10px;
  border: 2px solid black;
  margin: 5px;
}
```
- [ ] 200px
- [ ] 220px
- [x] 224px
- [ ] 234px
WHY: 200 (content) + 10 + 10 (padding) + 2 + 2 (border) = 224px. Margin is outside the border, so it isn't counted.

### BUG
Q: The button's padding doesn't work. Click the broken line.
```css
.btn {
  background-color: #2563eb;
  color: white
  padding: 8px 16px;
  border-radius: 6px;
}
```
LINE: 3
FIX: color: white;
WHY: The missing semicolon makes the browser read `color: white padding: 8px 16px` as one broken declaration, so both are ignored.

### LESSON CSS Grid and media queries | 11 | Layout
### Grid: rows AND columns
Flexbox lines things up in one direction. **Grid** handles two directions at once.

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* 3 equal columns */
  gap: 16px;
}
.feature { grid-column: span 2; }          /* this item takes 2 columns */
```

`1fr` means "one share of the free space". `repeat(auto-fit, minmax(200px, 1fr))` makes as many 200px+ columns as fit, which is responsive without any media queries.

### Media queries
```css
.cards { display: grid; grid-template-columns: 1fr 1fr 1fr; }

@media (max-width: 700px) {      /* screens 700px wide or less */
  .cards { grid-template-columns: 1fr; }
}
```

**Mobile-first** means writing the small-screen styles first, then adding `@media (min-width: ...)` rules for bigger screens.

Don't forget this tag in the `<head>`, or phones will zoom out and show the desktop layout:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Units
| Unit | Relative to |
|---|---|
| `px` | Fixed pixels |
| `%` | The parent element |
| `em` | The element's own font size |
| `rem` | The root (`<html>`) font size |
| `vw` / `vh` | 1% of the browser window's width / height |

### QUIZ
Q: Consider the following CSS.
PTS: 1
```css
p { color: blue; }
.note { color: green; }
#intro { color: red; }
```
ASK: What color is the text of `<p id="intro" class="note">Hi</p>`?
- [ ] blue
- [ ] green
- [x] red
- [ ] black
WHY: An id selector is more specific than a class, and a class is more specific than a tag. The id rule wins.

Q: The following CSS is applied to a page that is 600px wide.
PTS: 1
```css
.box { width: 50%; }
@media (max-width: 500px) { .box { width: 100%; } }
@media (min-width: 400px) { .box { width: 75%; } }
```
ASK: What is the width of `.box`?
- [ ] 300px (50%)
- [ ] 600px (100%)
- [x] 450px (75%)
- [ ] It depends on the font size.
WHY: At 600px the first media query (500px or less) doesn't apply. The second (400px or more) does, so the width becomes 75% of 600 = 450px.

Q: Which of the following produce three equal-width columns?
PTS: 1
OPT I: `grid-template-columns: 1fr 1fr 1fr;`
OPT II: `grid-template-columns: repeat(3, 1fr);`
OPT III: `grid-template-columns: 3fr;`
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: I and II are the same thing written two ways. III makes a single column that takes up all the space.

Q: A box has `width: 200px; padding: 10px; border: 5px solid;` and the default `box-sizing: content-box`. How wide is it on screen?
PTS: 1
- [ ] 200px
- [ ] 215px
- [x] 230px
- [ ] 210px
WHY: With content-box, padding and border are added outside the width: 200 + 10 + 10 + 5 + 5 = 230px. With `box-sizing: border-box` it would be 200px.

Q: If the root font size is 16px and a `<div>` has `font-size: 20px`, how big is `2rem` inside that div?
- [x] 32px
- [ ] 40px
- [ ] 20px
- [ ] 2px
WHY: `rem` always uses the root (`<html>`) font size: 2 × 16 = 32px. `2em` would be 40px.


## UNIT web3 | JavaScript Basics

### LESSON Variables, types and functions in JS | 12
JavaScript makes web pages interactive.

```js run
let score = 0;          // can be reassigned
const name = "Ada";     // can't be reassigned
score = score + 10;
console.log(`${name} has ${score} points`);  // template literal
```

Use `const` by default and `let` when the value needs to change. You'll see `var` in old code, but avoid it.

### Type coercion gotchas
```js
"5" + 3    // "53"  (+ joins strings)
"5" - 3    // 2     (- converts to numbers)
5 == "5"   // true  (loose: converts types)
5 === "5"  // false (strict: types must match)
```

Always use `===` and `!==`.

### Functions
```js
function square(x) { return x * x; }
const cube = (x) => x * x * x;     // arrow function
```

### Arrays and loops
```js run
const nums = [3, 6, 9];
for (const n of nums) console.log(n);
nums.push(12);                        // add to end
const doubled = nums.map(n => n * 2); // [6, 12, 18, 24]
const big = nums.filter(n => n > 5);  // [6, 9, 12]
```

### LESSON Making decisions in JavaScript | 10
JavaScript's `if` works like Python's. The condition goes in **parentheses**, and the block goes in **curly braces**:

```js run
const score = 82;
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("Keep practicing!");
}
```

Notice it's `else if` (two words). Indentation is just for humans, because the braces decide what belongs to the block.

:::quiz
Q: Which line correctly starts an if statement in JavaScript?
- [ ] `if score > 90:`
- [x] `if (score > 90) {`
- [ ] `if score > 90 {`
- [ ] `if (score > 90):`
WHY: JavaScript needs parentheses around the condition and braces around the block.
:::

### Logical operators
| JavaScript | Python | Meaning |
|---|---|---|
| `&&` | `and` | both are true |
| `\|\|` | `or` | at least one is true |
| `!` | `not` | flips true and false |

Always compare with `===` and `!==` (strict), never `==`.

### Truthy and falsy
In a condition, these count as **false**: `false`, `0`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy, including `"0"` and `[]`!

```js run
const name = "";
if (name) {
  console.log("Hi " + name);
} else {
  console.log("No name given");
}
console.log(Boolean("0"), Boolean([]), Boolean(0));
```

:::quiz
Q: Which value is **falsy** in JavaScript?
- [ ] `"0"`
- [ ] `[]`
- [x] `0`
- [ ] `"false"`
WHY: The number `0` is falsy. Non-empty strings like `"0"`, and empty arrays, are truthy.
:::

### The ternary operator
`condition ? valueIfTrue : valueIfFalse` picks one of two values:

```js run
const age = 15;
const label = age >= 13 ? "teen" : "kid";
console.log(label);
```

### switch
`switch` compares one value against many `case`s. Don't forget `break`, or the code **falls through** into the next case!

```js run
const light = "yellow";
switch (light) {
  case "green":
    console.log("Go");
    break;
  case "yellow":
    console.log("Slow down");
    break;
  default:
    console.log("Stop");
}
```

:::quiz
Q: What happens if you leave out `break` at the end of a `case`?
- [ ] Nothing changes
- [x] The code keeps running into the next case's code
- [ ] A SyntaxError
- [ ] The switch restarts
WHY: Without `break`, execution falls through to the following case. Sometimes that's on purpose, but usually it's a bug.
:::

### QUIZ
Q: What is logged? `const x = 0; console.log(x ? "yes" : "no");`
- [ ] yes
- [x] no
- [ ] 0
- [ ] undefined
WHY: `0` is falsy, so the ternary gives the value after `:`.

Q: Which is the JavaScript version of Python's `if a and not b:`?
- [x] `if (a && !b) {`
- [ ] `if (a and not b) {`
- [ ] `if (a & ~b):`
- [ ] `if a && !b {`
WHY: JavaScript uses `&&` for and and `!` for not, with the condition in parentheses.

Q: What is `"5" + 3` in JavaScript?
- [ ] 8
- [x] "53"
- [ ] NaN
- [ ] Error
WHY: If either side of `+` is a string, JS joins them as text.

Q: What is `"5" - 3`?
- [x] 2
- [ ] "53"
- [ ] "2"
- [ ] NaN
WHY: `-` only works on numbers, so JS converts `"5"` to 5 first.

Q: What is `5 === "5"`?
- [ ] true
- [x] false
- [ ] Error
- [ ] undefined
WHY: `===` is strict equality. A number and a string are different types, so it's false.

Q: You write `const x = 1;` and later `x = 2;`. What happens?
- [ ] x becomes 2
- [x] TypeError: Assignment to constant variable
- [ ] x becomes "12"
- [ ] Nothing
WHY: `const` variables can't be reassigned. Use `let` if the value needs to change.

Q: Given `const sq = x => x * x;`, what is `sq(4)`?
- [ ] 8
- [x] 16
- [ ] "44"
- [ ] undefined
WHY: An arrow function with a single expression returns that expression automatically: 4 × 4 = 16.

### TRACE
Q: What is logged?
```js
let total = 0;
const nums = [3, 6, 9];
for (const n of nums) {
  total += n;
}
console.log(`Total: ${total / nums.length}`);
```
- [ ] Total: 18
- [x] Total: 6
- [ ] Total: 18/3
- [ ] Total: NaN
WHY: The total is 18, the array has 3 items, and 18 / 3 = 6. This code computes the average.

Q: What is logged?
```js
const scores = [80, 95, 70];
const curved = scores.map(s => s + 5).filter(s => s > 80);
console.log(curved);
```
- [ ] [85, 100, 75]
- [x] [85, 100]
- [ ] [100]
- [ ] [95]
WHY: `map` gives [85, 100, 75]. Then `filter` keeps only the scores above 80: [85, 100].

### BUG
Q: `checkAnswer(7)` returns "Correct!". Click the bug.
```js
function checkAnswer(answer) {
  if (answer = 42) {
    return "Correct!";
  }
  return "Try again";
}
console.log(checkAnswer(7));
```
LINE: 2
FIX: if (answer === 42) {
WHY: A single `=` **assigns** 42 to `answer`, and 42 is truthy. Use `===` to compare.

### QUIZ
Q: Consider the following code segment.
PTS: 1
```js
let x = 5;
let y = "5";
console.log(x == y, x === y, x + y);
```
ASK: What is printed as a result of executing the code segment?
- [x] true false 55
- [ ] true true 10
- [ ] false false 55
- [ ] true false 10
WHY: `==` converts types before comparing, so 5 == "5" is true. `===` also checks the type, so it is false. `+` with a string joins them: "55".

Q: Which of the following evaluate to `true`?
PTS: 1
OPT I: `Boolean("0")`
OPT II: `Boolean(0)`
OPT III: `Boolean([])`
- [ ] I only
- [ ] II only
- [x] I and III only
- [ ] I, II and III
WHY: Any non-empty string is truthy, even "0". The number 0 is falsy. An empty array is still an object, so it's truthy.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```js
const nums = [3, 8, 1, 6];
let total = 0;
for (let i = 1; i < nums.length; i += 2) {
  total += nums[i];
}
console.log(total);
```
- [ ] 4
- [x] 14
- [ ] 18
- [ ] 9
WHY: i starts at 1 and goes up by 2, so it visits indexes 1 and 3: 8 + 6 = 14.

Q: The function `isTeen(age)` is intended to return true if `age` is from 13 to 19, inclusive.
PTS: 1
```js
function isTeen(age) {
  return /* missing code */;
}
```
ASK: Which of the following can replace `/* missing code */` so that the function works as intended?
OPT I: `age >= 13 && age <= 19`
OPT II: `13 <= age <= 19`
OPT III: `!(age < 13 || age > 19)`
- [ ] I only
- [x] I and III only
- [ ] II and III only
- [ ] I, II and III
WHY: JavaScript doesn't chain comparisons like Python. `13 <= age <= 19` becomes `(true or false) <= 19`, and true/false turn into 1/0, so it's always true. III is I rewritten with De Morgan's law.

Q: What is printed as a result of executing the following code segment?
PTS: 1
```js
const words = ["map", "filter", "reduce"];
const out = words.filter(w => w.length > 3).map(w => w.toUpperCase());
console.log(out.join("-"));
```
- [ ] MAP-FILTER-REDUCE
- [x] FILTER-REDUCE
- [ ] filter-reduce
- [ ] MAP
WHY: `filter` keeps words longer than 3 letters ("filter" and "reduce"), `map` makes them uppercase, and `join("-")` puts a dash between them.


## UNIT web4 | The DOM & Events

### LESSON Making pages interactive | 12
The **DOM** (Document Object Model) is the browser's live, tree-shaped version of your HTML. JavaScript can read and change it.

```js
const title = document.querySelector("h1");       // first <h1>
const btn   = document.querySelector("#start");   // id="start"
const cards = document.querySelectorAll(".card"); // every .card

title.textContent = "Ready!";
btn.classList.add("active");
btn.classList.toggle("dark");
```

### Events
```js
btn.addEventListener("click", handleClick);   // pass the function...
// NOT addEventListener("click", handleClick()) ...which calls it right away

function handleClick(event) {
  console.log("Clicked!", event.target);
}
```

### Forms
A form reloads the page when submitted unless you stop it:

```js
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = form.querySelector("input").value;
});
```

### textContent vs innerHTML
`textContent` inserts plain text. `innerHTML` parses HTML, so if you put **user input** in `innerHTML`, attackers can inject scripts. This attack is called **XSS**. Use `textContent` for user data.

### QUIZ
Q: What does `document.querySelector("#score")` return?
- [ ] Every element with class "score"
- [x] The first element with id "score"
- [ ] The text inside #score
- [ ] An array of matches
WHY: `querySelector` returns the **first** match for a CSS selector. `#score` matches the element with that id.

Q: Why is `el.innerHTML = userInput` dangerous?
- [ ] It's slower than textContent
- [x] User input could contain HTML or scripts that run on the page (XSS)
- [ ] It deletes the element
- [ ] It only works on divs
WHY: `innerHTML` parses its input as HTML. For user data, use `textContent`, which treats everything as plain text.

Q: Which line correctly runs `save` when the button is clicked?
- [x] `btn.addEventListener("click", save);`
- [ ] `btn.addEventListener("click", save());`
- [ ] `btn.addEventListener(save, "click");`
- [ ] `btn.onClick = "save";`
WHY: Pass the function itself. Writing `save()` calls it right away and passes its return value instead.

Q: What does `event.preventDefault()` do in a form's submit handler?
- [ ] Deletes the form
- [x] Stops the browser from reloading or navigating the page
- [ ] Clears the inputs
- [ ] Submits the form twice
WHY: It cancels the browser's default action, so your JS can handle the data instead.

Q: What does `el.classList.toggle("dark")` do?
- [ ] Always adds "dark"
- [ ] Always removes "dark"
- [x] Adds "dark" if it's missing and removes it if it's there
- [ ] Changes the text color to dark
WHY: `toggle` flips the class on and off. It's handy for dark mode buttons.

### TRACE
Q: The user clicks the button 3 times. What does it say?
```html
<button id="btn">Clicks: 0</button>
<script>
  let clicks = 0;
  const btn = document.querySelector("#btn");
  btn.addEventListener("click", () => {
    clicks += 2;
    btn.textContent = "Clicks: " + clicks;
  });
</script>
```
- [ ] Clicks: 3
- [x] Clicks: 6
- [ ] Clicks: 2
- [ ] Clicks: 0
WHY: Each click adds 2, and 3 clicks × 2 = 6.

### BUG
Q: "Saved!" is logged as soon as the page loads, and clicking does nothing. Click the bug.
```js
const button = document.querySelector("#save");
button.addEventListener("click", saveGame());

function saveGame() {
  console.log("Saved!");
}
```
LINE: 2
FIX: button.addEventListener("click", saveGame);
WHY: `saveGame()` runs the function immediately and passes its return value (`undefined`) as the listener. Pass `saveGame` without the parentheses.

### QUIZ
Q: Consider the following HTML and JavaScript.
PTS: 1
```html
<p id="msg">Hello</p>
<button id="btn">Go</button>
<script>
  const btn = document.querySelector("#btn");
  btn.addEventListener("click", () => {
    document.querySelector("#msg").textContent += "!";
  });
</script>
```
ASK: What does the paragraph say after the button is clicked 3 times?
- [ ] Hello
- [ ] Hello!
- [x] Hello!!!
- [ ] !!!
WHY: Each click runs the listener once, and `+=` adds one more "!" to the existing text.

Q: Which of the following select the element `<li class="item active">Two</li>`?
PTS: 1
OPT I: `document.querySelector(".item.active")`
OPT II: `document.querySelector(".active")`
OPT III: `document.getElementById("active")`
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: `.item.active` matches an element with both classes, and `.active` matches any element with that class. The element has no `id`, so III returns null.

Q: A form's submit handler needs to stop the page from reloading. Which line should go inside the handler?
```js
form.addEventListener("submit", (event) => {
  /* missing code */
  // ...read the inputs and update the page
});
```
- [ ] `return false;`
- [x] `event.preventDefault();`
- [ ] `event.stop();`
- [ ] `form.reset();`
WHY: `preventDefault()` cancels the browser's default action, which for a form is sending it and reloading the page.

Q: Why is `element.textContent = userInput` safer than `element.innerHTML = userInput`?
- [x] textContent shows the text as plain text, so tags typed by a user can't run as HTML or scripts.
- [ ] textContent is faster to type.
- [ ] innerHTML only works on `<div>` elements.
- [ ] textContent encrypts the text.
WHY: innerHTML parses whatever it is given as HTML. If a user types something like an image tag with an onerror script, it could run. That attack is called cross-site scripting (XSS).

## UNIT web5 | Data, APIs & Publishing
### LESSON JSON and fetch | 12 | APIs
**JSON** (JavaScript Object Notation) is the most common way websites send data. It looks like JavaScript objects, but keys must be in double quotes.

```js run
const text = '{"name": "Ana", "scores": [90, 85]}';
const data = JSON.parse(text);          // text → object
console.log(data.scores[1]);            // 85
console.log(JSON.stringify({ ok: true }));   // object → text: {"ok":true}
```

### Asking a server for data
An **API** is a set of URLs a program can call to get or send data. `fetch` asks for one. The answer takes time to arrive, so we use `async` / `await`:

```js
async function loadJoke() {
  try {
    const res = await fetch("https://official-joke-api.appspot.com/random_joke");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const joke = await res.json();
    document.querySelector("#joke").textContent = joke.setup + " " + joke.punchline;
  } catch (err) {
    document.querySelector("#joke").textContent = "Couldn't load a joke.";
  }
}
```

- `await` pauses **this function** until the answer arrives. The rest of the page keeps working.
- Check `res.ok`. A 404 or 500 status does **not** throw an error by itself.
- HTTP status codes: **200** OK, **404** not found, **500** server error, **403** forbidden.

### LESSON Saving data and publishing a site | 9 | Publishing
### localStorage
`localStorage` saves strings in the user's browser, so they're still there after a refresh:

```js
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");     // "dark", or null if never set
localStorage.setItem("todos", JSON.stringify(["a", "b"]));   // save a list as text
const todos = JSON.parse(localStorage.getItem("todos") || "[]");
```

It only stores **strings**, it's limited to about 5 MB per site, and it's only on that one browser. Never store passwords in it.

### Publishing
1. Put the files in a folder with `index.html` as the home page.
2. Push the folder to a GitHub repository.
3. Turn on **GitHub Pages** in the repository's settings.
4. The site appears at `https://USERNAME.github.io/REPO/`.

Other free hosts include Netlify and Cloudflare Pages. A **domain name** (like example.com) is turned into the server's IP address by **DNS**. **HTTPS** encrypts the connection between the browser and the server.

### QUIZ
Q: Consider the following code segment.
PTS: 1
```js
const data = JSON.parse('{"team": "Owls", "wins": [3, 5, 2]}');
console.log(data.wins.length + data.wins[1]);
```
ASK: What is printed as a result of executing the code segment?
- [ ] 6
- [x] 8
- [ ] 35
- [ ] 10
WHY: `wins` has 3 items and `wins[1]` is 5. 3 + 5 = 8.

Q: Consider the following code segment.
PTS: 1
```js
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
```
ASK: What is printed as a result of executing the code segment?
- [ ] A B C
- [x] A C B
- [ ] B A C
- [ ] A C
WHY: `setTimeout` schedules its function to run **later**, even with a 0 ms delay. The rest of the current code runs first.

Q: Which of the following are true about `localStorage`?
PTS: 1
OPT I: Data stays after the page is refreshed.
OPT II: Values are stored as strings.
OPT III: Data saved on one computer automatically appears on the user's phone.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: localStorage lives in one browser on one device. To sync across devices you need a server or a database.

Q: A fetch request returns status 404. Which of the following best describes what happens in this code?
PTS: 1
```js
const res = await fetch(url);
const data = await res.json();
```
- [ ] fetch throws an error as soon as it receives the 404.
- [x] fetch does not throw; the code must check `res.ok` or `res.status` to notice the failure.
- [ ] The browser automatically retries until it gets status 200.
- [ ] `res.json()` always returns an empty object.
WHY: fetch only rejects on network failures. A 404 is a normal response, so you have to check `res.ok`.

Q: Which status code means the page or resource was not found?
- [ ] 200
- [ ] 301
- [x] 404
- [ ] 500
WHY: 2xx means success, 3xx means redirect, 4xx means a client error (404 = not found) and 5xx means a server error.

