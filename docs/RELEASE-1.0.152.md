# Izuki 1.0.152: coding mode, Izuki's own Claude Code

## 💻 Code with Izuki the way Claude Code works, on Izuki's own AI
**The problem:** the Chat tab could run commands and edit files, but every change stopped for an Allow card and a reply got at most 7 steps. That's right for a chat, not for real coding. There was also no safe way to try a change and see it before it touched your project.

**What changed:** turn on **</> Code** in the Chat tab, pick your project folder once (📁), and ask in plain words ("the calculator adds wrong, fix it", "add a dark-mode switch to settings"). Izuki then:
1. **Makes a separate copy of your project to work in:** a git worktree on its own branch, starting from exactly what you have, unsaved edits and new files included. Your files are never touched while it works.
2. **Works like Claude Code:**
   - writes a to-do list you can watch tick off;
   - lists, searches and reads files, then makes exact edits;
   - runs your project's builds and tests, up to about 36 steps.
   - Your installed packages (node_modules, a .venv) are linked in, not copied. Rust builds share your target folder, so nothing is downloaded or rebuilt from scratch.
3. **Checks its own work before saying it's done:**
   - runs the project's own checks (type check, tests);
   - then reviews its diff for real bugs, like a built-in code reviewer;
   - fixes what's really wrong, and treats review points as claims to check, not orders.
4. **Shows you the change.** You see the files with +/− counts and the exact diff, then choose:
   - **Apply to my files:** put in, never committed or pushed;
   - **Discard:** the copy is thrown away and your files were never touched;
   - **Undo**, after Apply: takes back exactly what Izuki changed. Your own edits since then stay.

**Built to stay safe:**
- Commands it may run are builds, tests, type checks, linters and read-only git. No `&&` chaining, no deleting, no installs, no publishing or pushing.
- It also refuses the options that would get round those rules:
  - ones that launch another program, like `git grep --open-files-in-pager` or `npm --script-shell`;
  - ones that write elsewhere, like `git diff --output`, or that load another config;
  - any path outside the project.

  `npx` never downloads a package.
- Your installed packages are linked in, so it can read them, but it can never change them.
- Running tests runs the project's own code, including code Izuki changed. That's true of any coding agent, Claude Code included.
- What Izuki won't do is run a script it just wrote straight away, or run anything after changing **how the project runs**. That covers package.json scripts, a Makefile, build.rs, setup.py, test set-up files (conftest.py, jest, vitest and vite configs) and cargo config. Then it stops and asks you to look at the change, and Apply it, first.
- It stays inside the task: it never removes or rewrites code, features or tests you didn't ask about, and never weakens a test to make it pass.
- If your files changed in the meantime so the change no longer fits, Apply refuses and keeps it on its branch, rather than mangling anything.
- **Stop** ends a running build or test at once. What it changed so far stays there for you to Apply or Discard.
- Copies you never came back to are cleared after a week, and saved Undo records after a month, so they don't fill your disk.

**Smarter with free AI models:**
- Coding asks the strongest working AI first, and small models only if nothing else answers.
- Small models often squash everything onto one line. Izuki still finds their tools, and matches their edits to your code word for word. Only the words that changed are changed; your file's own line breaks and indentation stay.

**How it was checked:**
- **End to end on a real git project (automated test):** with your own unsaved edits, a new file and installed packages present. The copy starts from what you have, and your packages are linked in. The diff shows only Izuki's change. Apply changes only that, Undo restores it, and Discard removes the copy and its branch. Your unsaved work and packages survived every step.
- **With the real AI, on a project with a bug** (an `add` that subtracts, plus a failing test). In 28 seconds it:
  - planned, read the files and ran the tests (failing);
  - made the one-line fix and ran the tests again (passing);
  - ran the project's checks and reviewed its own change, finding no problems.

  The diff was exactly that one line. The test also requires that nothing else of yours is removed: an earlier run deleted an unrelated function after a bad review point, and that's what the "stay inside the task" and "check review points" rules fix.
- **Earlier real runs found three other problems, now fixed and tested:**
  - a small model squashed every tool onto one line;
  - a plan item saying "finish with [DONE]" was taken as finished;
  - a summary written before the [DONE] tag was lost.
- Safety tests: paths can't leave the project, `rm`, `git push`, chaining and installs are refused, and a just-written script can't be run.

**Limits:**
- The project needs to be a git project with at least one commit.
- Free AI models are sometimes busy: the same small fix took 28 seconds when Gemini answered, and about 4 minutes when it was busy and slower models had to step in.
- Big Rust projects can take many minutes to test.
- It works from the Chat tab on your PC (not the phone).
