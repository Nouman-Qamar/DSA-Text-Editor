# DSA Text Editor

A text editor where every feature is a visible, working demonstration of a classic data structure or algorithm  not just a UI with DSA buried somewhere in the code. Built with vanilla HTML, CSS, and JavaScript, no frameworks.

🔗 **Live Demo:** https://nouman-qamar.github.io/DSA-Text-Editor/

## What it demonstrates

| Feature | Data Structure / Algorithm | Where |
|---|---|---|
| Undo / Redo | **Two Stacks** (`stack.js`) — push/pop/peek, all O(1) | Live visual panel renders both stacks in real time, top-of-stack highlighted |
| Find & Replace | **Knuth–Morris–Pratt** substring search (`search.js`) — O(n+m) vs. naive O(n·m) | Highlights matches in the editor; Replace / Replace All |
| Word Frequency | **Hash Map** word-count in a single O(n) pass, then sorted | Live bar-chart of top words as you type |
| Live Stats | Plain string ops | Word/char/line count, estimated reading time |

The sidebar's "Undo / Redo" tab isn't decorative — it renders the actual contents of both stacks every time they change, so you can watch entries get pushed and popped as you type, undo, and redo.

## How Undo/Redo works
- Typing pauses (500ms debounce) push a snapshot of the previous text onto the **Undo Stack**.
- Undo pops the Undo Stack, pushes the *current* state onto the **Redo Stack**, and restores the popped snapshot.
- Any new edit after an undo clears the Redo Stack — standard editor-history semantics.
- Keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Y` (redo), `Ctrl+F` (jump to Find).

## Tech Stack
`HTML5` · `CSS3` · `Vanilla JavaScript` — no build step, no dependencies.

## Project Structure
```
├── index.html    # Layout: editor + tabbed sidebar (Stacks / Find / Word Frequency)
├── style.css     # Dark IDE-style theme — cyan = undo stack, amber = redo stack
├── stack.js      # Generic Stack ADT
├── search.js     # KMP substring search (LPS table + matcher)
└── script.js     # Wires it all together: editor events, stack visualizer, search UI, frequency panel
```

## Run It Locally
```bash
git clone https://github.com/Nouman-Qamar/DSA-Text-Editor.git
cd DSA-Text-Editor
python3 -m http.server 8000
```

## Testing Notes
Core logic (KMP search, hashmap word counting, stack push/pop) was verified with standalone Node scripts before integration, and the full editor flow (typing → debounce → undo/redo → find/replace → word frequency) was tested end-to-end with `jsdom` to simulate real user interaction. No test files are included in this repo — this is a from-scratch rewrite of an earlier, much simpler version that just logged raw debug text to a textbox.
