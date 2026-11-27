# Two machines, one repo

The owner has two Windows PCs and either one can be the one that is on. This
folder makes the repo keep itself in step, so work done on the other laptop
shows up here without anyone typing `git pull`.

## What it does

`sync.ps1` runs `git fetch`, then:

| Situation | What happens |
| --- | --- |
| Nothing new | Says "already up to date", does nothing |
| This PC has unpushed commits and is not behind | Pushes them |
| This PC is behind and the working tree is clean | Fast-forwards to origin |
| This PC is behind but has uncommitted files | Stops, leaves your files alone |
| Both sides have commits (diverged) | Stops and says a person has to choose |

It never merges, never rebases, never stashes, never force-pushes, and never
deletes anything. Log: `<repo>/.git/two-machine-sync.log` — inside `.git`, so
it is never committed.

## Install on each PC (once per machine)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/two-machine/sync.ps1 -Install
```

That copies the script to `%LOCALAPPDATA%\Izuki	wo-machine-sync.ps1` and
registers the task **Izuki two-machine sync**: at sign-in, then every 10
minutes, for the current user only. No administrator needed and nothing is
installed system-wide.

Check it is there:

```powershell
schtasks /Query /TN "Izuki two-machine sync"
```

Run it by hand any time:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/two-machine/sync.ps1
```

Remove it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/two-machine/sync.ps1 -Uninstall
```

## What this does not do

- It does not sync while a machine is off. Nothing can. When the laptop comes
  back, the task pulls within ten minutes of sign-in.
- It does not commit for you. Half-finished edits stay uncommitted on purpose:
  an automatic commit would push broken work under a real message. Commit when
  something works, and the sync pushes it.
- It does not move chats. Those are already on the account, so they appear on
  both machines without git. Only files need the repo.
