# Izuki: knowledge for Freebuff / Codebuff

**Read [AGENTS.md](AGENTS.md) first.** It's the shared rulebook for every AI
assistant in this repo. Then read [docs/COLLAB.md](docs/COLLAB.md) to see
who owns which files.

The rules that matter most:
- **Claim your area** in `docs/COLLAB.md` before editing, and stay inside it.
- **Never change the version number.** Only Claude releases. Push tested
  work to `main`, then add a plain-English line to `docs/NEXT-RELEASE.md`.
- **`git pull --rebase origin main`** before starting and before pushing.
  Commit your own files by path, never `git add -A`.
- **Test before you push:** `npx tsc --noEmit -p .`, `npm run -s build`,
  `npm run -s test:conversation`, plus `cargo test --lib` if you touched
  Rust. Report anything you couldn't verify.
- **Never read or commit secrets** (`%APPDATA%\Izuki\settings.json`,
  `~/.claude.json`, `.env`) or the owner's personal data. The repo is public.
