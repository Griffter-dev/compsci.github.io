# Rules for anyone (including Claude sessions) changing this repo

## Class Notes tab is locked
The owner has said the **Class Notes** tab must NOT change unless they ask for that change themselves.
Do not rename it, remove it, bring back the old "Notes" page or change how it works as a side effect of other work.

What it is made of:
- `source/src/views-notes.js`: the routes `/class-notes`, `/class-notes/:uid`, `/class-notes/inbox`, and `/notes`, which redirects to `/class-notes`
- `source/content/class-notes/*.md`: one file per class day
- `source/build.mjs`: reads class-notes/*.md into `window.CLASS_NOTES` and lists `views-notes.js` in `jsOrder`
- `source/src/ui.js`: the nav entry `['/class-notes', 'Class Notes', '🗒️']`, plus the menu, footer and search entries
- `source/src/squad.js`: the note-suggestion helpers (`sendNoteSuggestion`, `subNoteSuggestions`, and the others)
- `.cn-*` and `.ns-*` styles in `source/src/styles.css`

The build checks for these and stops with an error if they are missing.

## Before you commit
Run `git fetch origin main` and merge or rebase first. More than one session pushes to this repo.
Never rebuild `index.html` from an old copy of `source/`, because that undoes other sessions' work.
