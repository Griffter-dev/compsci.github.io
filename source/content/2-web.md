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
