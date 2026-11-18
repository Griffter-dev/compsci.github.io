# CompciStudy setup guide

There are two parts:
- **Part 1** puts the website online at `https://YOUR-NAME.github.io/compcistudy/`. It takes about 10 minutes.
- **Part 2** turns on squads (leaderboards, duels, the shared question bank, squad assignments with a gradebook, and weekly squad scores). It takes about 20 minutes.

> **Already set up an earlier version?** Upload the new `index.html`, then re-paste `firestore.rules` into Firebase (step 2.3, item 4) and click **Publish**. The new rules add squad assignments.

The site works without Part 2. Everyone just studies solo until you do it.

---

## Part 1: Put the site on GitHub Pages

1. **Make a GitHub account** at github.com, if you don't have one. A personal email works best, because some school accounts block GitHub sign-ups.
2. **Create a repository.** Click **+ → New repository**.
   - Name: `compcistudy`
   - Set it to **Public**. Free GitHub Pages sites need a public repo.
   - Click **Create repository**.
3. **Upload the files.** On the new repo page, click **uploading an existing file**.
   - Unzip `compcistudy.zip` and drag **everything inside it** into the upload box: `index.html`, `firebase-config.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `firestore.rules`, `SETUP.md` and the `source` folder.
   - `index.html` must sit at the top level of the repo, not inside another folder.
   - Click **Commit changes**.
4. **Turn on Pages.** Go to **Settings → Pages**.
   - Under **Build and deployment**, set Source to **Deploy from a branch**.
   - Choose Branch **main**, folder **/ (root)**, and click **Save**.
5. Wait 1–2 minutes, then refresh the Settings → Pages screen. Your link appears at the top: `https://YOUR-NAME.github.io/compcistudy/`
6. **Test it on a school Chromebook.** If it loads, share the link with your friends!

> **Tip:** In Chrome, open the ⋮ menu and choose **Cast, save and share → Install page as app** (or "Install CompciStudy"). That puts CompciStudy on the Chromebook shelf like a real app.

---

## Part 2: Turn on squads (Firebase)

Firebase is Google's free app database. It lets squads talk to each other in real time. The free plan is plenty for a group of friends, and **you don't need a credit card**.

### 2.1 Create the project
1. Go to **console.firebase.google.com** and sign in with a Google account. Use a personal account, because school Google accounts often can't use Firebase. You can also ask a parent or your CS teacher to do this part.
2. Click **Create a project** (or **Add project**). Name it `compcistudy`.
3. When it asks about Google Analytics, **turn it off**. You don't need it.

### 2.2 Turn on anonymous sign-in
This gives each browser a private ID without needing an email.
1. In the left menu, open **Build → Authentication → Get started**.
2. Go to the **Sign-in method** tab, click **Anonymous**, switch it **on**, and click **Save**.
3. Go to the **Settings** tab, open **Authorized domains**, and click **Add domain**. Enter `YOUR-NAME.github.io`.

### 2.3 Create the database
1. In the left menu, open **Build → Firestore Database → Create database**.
2. Pick a location near you (for example, `nam5 (United States)`). You can't change it later.
3. Choose **Start in production mode** and click **Create**.
4. Open the **Rules** tab. Delete everything there, then paste the whole contents of `firestore.rules` from this repo. Click **Publish**.
   - These rules make sure people can only change their *own* scores, only squad members can see squad data, and only the leader can approve questions.

### 2.4 Connect the website to Firebase
1. Click the **⚙️ gear → Project settings**, scroll down to **Your apps**, and click the **web icon `</>`**.
2. Name the app `CompciStudy`. **Leave Firebase Hosting unchecked**, because we're using GitHub. Click **Register app**.
3. Firebase shows you a `firebaseConfig = { ... }` block. Keep that page open.
4. In your GitHub repo, open `firebase-config.js` and click the **✏️ pencil** to edit it.
5. Replace each `PASTE_...` value with the matching value from Firebase: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` and `appId`. Keep the quotes.
6. Click **Commit changes**. Wait about a minute for GitHub Pages to update.

> These Firebase values are **meant to be public**, which is normal for every website that uses Firebase. Your security rules from step 2.3 are what protect the data.

### 2.5 Test it
1. Open your site, go to the **Squad** tab, and click **Create a squad**. You get a code like `K7Q-2MX`.
2. Click **Copy invite link** and send it to a friend. When they open it and tap **Join**, you should both see each other on the leaderboard within a second or two.
3. Try a live duel: **Squad → Duels → Create duel**. Your friend taps **Join**.

---

## If something doesn't work

| Problem | Fix |
|---|---|
| The site shows a 404 | Make sure `index.html` is at the top level of the repo and Pages is set to **main / (root)**. Wait 2 minutes. |
| The Squad tab says "not switched on" | `firebase-config.js` still has `PASTE_...` in it. Do step 2.4. |
| The Squad tab says "can't reach the squad server" at school | Your school's filter is blocking Firebase. Everything else still works. Ask your CS teacher if IT can allow `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com` and `www.gstatic.com`. |
| Python exercises say "Could not download Python" | Python runs in the browser using files from `cdn.jsdelivr.net`, about 10 MB the first time. If the school filter blocks that site, ask IT to allow it. JavaScript, HTML and fill-in-the-code exercises still work. |
| A teacher wants to assign work | Have the teacher create the squad, so they're the leader. Leaders get an **＋ Assign** button and a **Gradebook** tab on the Assignments page. |
| "Could not sign in to Firebase" | Anonymous sign-in isn't turned on (step 2.2). |
| "Missing or insufficient permissions" | The rules weren't published (step 2.3, item 4). |
| You changed the site but still see the old version | Refresh the page twice. The app caches itself so it works offline. |
| The leader lost their account (cleared browser data) | Anyone can create a new squad. Or, before clearing data, the leader can pass leadership on: **Squad settings → 👑**. |

**Privacy note:** Only nicknames, avatars, XP, levels and streaks are shared with your squad. Nobody needs an email or a real name. Progress is saved in each browser, so use **Settings → Export backup** to move it between devices.

---

## Editing the content later

All the notes and questions live in plain text files in `source/content/`: one file per course, plus `7-exercises.md` for the coding and fill-in-the-code exercises. The format is easy to read:

```
### QUIZ
Q: What is `7 / 2` in Java?
- [ ] 3.5
- [x] 3
WHY: int / int drops the decimal.
```

Inside a lesson you can add:
- **A quiz in the middle of the reading:** wrap a question in `:::quiz` and `:::` lines.
- **A runnable example:** write ` ```python run ` or ` ```js run ` instead of ` ```python `.
- **Glossary terms:** add them to `8-glossary.md` as `- **term** (other forms): definition`. They get linked in lessons automatically.

Coding exercises use `### EXERCISE Title | python | minutes`, with `STARTER`, `TESTS` (one `assert` per line) and `SOLUTION` code blocks, plus one or more `HINT:` lines that unlock one at a time. Fill-in-the-code uses `### FILL Title`, with blanks written as `[[answer|other accepted answer]]`.

After editing, the site has to be rebuilt into `index.html`. On a computer with Node.js installed, run these commands in the `source` folder:

```
npm install
npm run build
```

Then upload the new `dist/index.html` to the top of your repo. You can also ask Claude to make the edit and rebuild it for you.
