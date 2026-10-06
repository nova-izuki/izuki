# @izuki/app-playbooks

How desktop apps really work, written down for AI agents.

Screen agents that only look at pixels get lost in apps that draw their own
interface (FL Studio, Premiere, Photoshop, Blender, Figma): the accessibility
tree sees one big canvas, and dragging by pixels misses. Each playbook here
gives an agent the app's own keyboard shortcuts and a few notes on how to work
it the way an expert would: set the snap and quantize instead of dragging
notes, or cut at the playhead instead of aiming a razor.

```json
{
  "id": "fl-studio",
  "name": "FL Studio",
  "match": ["fl64.exe", "fl.exe", "fl studio"],
  "canvas": true,
  "notes": ["…"],
  "keys": [["F7", "Piano Roll"], ["Ctrl+Q", "quick quantize"]]
}
```

- `match`: process names (`fl64.exe`) or words in the window title, any case.
- `canvas`: the app draws its own interface, so prefer keys and menus over clicking inside it.
- `keys`: the app's default Windows shortcuts. Only ones that are well documented go in.

## Use it

```js
const { apps } = require("@izuki/app-playbooks");
const app = apps.find((a) => a.match.some((m) => exeOrTitle.toLowerCase().includes(m)));
// Put app.notes and app.keys into your agent's prompt while that app is in front.
```

Izuki loads this file built in, plus any `*.json` playbooks you drop into
`%APPDATA%\Izuki\playbooks\` (same shape: one app, or `{ "apps": [...] }`).
Corrections and new apps are welcome as pull requests.

MIT licence.
