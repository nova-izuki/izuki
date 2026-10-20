# name=Izuki
# url=https://github.com/nova-izuki/izuki
# supportedDevices=Izuki
#
# Izuki's link into FL Studio: Izuki (the AI companion on this PC) sends
# commands over a virtual MIDI cable; this script runs them with FL Studio's
# own scripting API and answers with what happened. Only the operations
# listed in OPS can run, and only messages carrying this PC's key are read.
#
# Messages are SysEx: F0 7D 'I' 'Z' <dir> <id:4> <part:2> <total:2> <ascii> F7
# with dir 'Q' (a request from Izuki) or 'R' (this script's reply). The text
# is a Python literal (a dict); FL's Python has no json, and only literals
# are read (no names, no calls).

import device
import transport
import mixer
import channels
import patterns
import plugins
import general
import ui
import midi

KEY = "__IZUKI_KEY__"
HEAD = [0xF0, 0x7D, 0x49, 0x5A]
CHUNK = 800
_parts = {}


# ------------------------------------------------------------ reading

def _literal(text):
    """A dict/list/str/number/bool/None literal, and nothing else: outside
    strings only digits, brackets, commas, colons, signs, points and the
    words True/False/None may appear (so no names, calls or operators)."""
    outside = set(" \t\r\n{}[](),:.-0123456789")
    word = ""
    in_str = None
    esc = False
    for ch in text + " ":
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == in_str:
                in_str = None
            continue
        if ch.isalpha():
            word += ch
            continue
        if word:
            if word not in ("True", "False", "None"):
                raise ValueError("bad word " + word)
            word = ""
        if ch in "'\"":
            in_str = ch
        elif ch not in outside:
            raise ValueError("bad character " + ch)
    if in_str:
        raise ValueError("open string")
    return eval(text, {"__builtins__": {}}, {})


def _send(msg_id, text):
    data = text.encode("ascii", "backslashreplace")
    total = max(1, (len(data) + CHUNK - 1) // CHUNK)
    for part in range(total):
        piece = data[part * CHUNK:(part + 1) * CHUNK]
        head = ("R%04d%02d%02d" % (msg_id % 10000, part, total)).encode("ascii")
        device.midiOutSysex(bytes(HEAD) + head + piece + bytes([0xF7]))


# ------------------------------------------------------------ the operations

def _channel_info(i):
    out = {"i": i, "name": channels.getChannelName(i)}
    try:
        out["vol"] = round(channels.getChannelVolume(i), 3)
        out["pan"] = round(channels.getChannelPan(i), 3)
        out["muted"] = bool(channels.isChannelMuted(i))
        out["type"] = channels.getChannelType(i)
    except Exception:
        pass
    return out


def op_state():
    pat = patterns.patternNumber()
    chans = [_channel_info(i) for i in range(channels.channelCount())]
    tracks = []
    for t in range(min(mixer.trackCount(), 40)):
        name = mixer.getTrackName(t)
        if t == 0 or (name and not name.startswith("Insert ")):
            tracks.append({"i": t, "name": name, "vol": round(mixer.getTrackVolume(t), 3)})
    return {
        "tempo": round(mixer.getCurrentTempo(True) / 1000.0, 2),
        "playing": bool(transport.isPlaying()),
        "pattern": pat,
        "pattern_name": patterns.getPatternName(pat),
        "pattern_beats": patterns.getPatternLength(pat) if hasattr(patterns, "getPatternLength") else None,
        "pattern_count": patterns.patternCount(),
        "channels": chans,
        "mixer": tracks,
        "version": general.getVersion(),
    }


def op_selftest():
    names = [
        "channels.setGridBit", "channels.getGridBit", "channels.setStepParameterByIndex", "channels.channelCount",
        "patterns.findFirstNextEmptyPat", "patterns.setPatternName", "patterns.jumpToPattern",
        "general.processRECEvent", "general.saveUndo", "mixer.getCurrentTempo", "transport.start",
        "plugins.setParamValue", "mixer.setTrackVolume", "ui.showWindow",
        "channels.quickQuantize", "channels.selectedChannel",
    ]
    mods = {"channels": channels, "patterns": patterns, "general": general, "mixer": mixer, "transport": transport, "plugins": plugins, "ui": ui}
    missing = [n for n in names if not hasattr(mods[n.split(".")[0]], n.split(".")[1])]
    return {"missing": missing, "version": general.getVersion()}


def op_play():
    if not transport.isPlaying():
        transport.start()
    return True


def op_stop():
    if transport.isPlaying():
        transport.stop()
    return True


def op_tempo(bpm):
    bpm = max(10.0, min(522.0, float(bpm)))
    general.processRECEvent(midi.REC_Tempo, int(round(bpm * 1000)), midi.REC_Control | midi.REC_UpdateControl)
    return bpm


def op_undo_point(name):
    general.saveUndo(str(name)[:60], 0)
    return True


def op_new_pattern(name):
    patterns.findFirstNextEmptyPat(midi.FFNEP_DontPromptName)
    p = patterns.patternNumber()
    patterns.setPatternName(p, str(name)[:60])
    return p


def op_show(which):
    w = {"rack": midi.widChannelRack, "mixer": midi.widMixer, "playlist": midi.widPlaylist, "pianoroll": midi.widPianoRoll}.get(which)
    if w is not None:
        ui.showWindow(w)
    return True


def op_step(ch, pos, on):
    channels.setGridBit(int(ch), int(pos), 1 if on else 0)
    return True


def op_vel(ch, pos, vel):
    channels.setStepParameterByIndex(int(ch), patterns.patternNumber(), int(pos), midi.pVelocity, int(vel))
    return True


def op_pitch(ch, pos, note):
    channels.setStepParameterByIndex(int(ch), patterns.patternNumber(), int(pos), midi.pPitch, int(note))
    return True


def op_clear_row(ch, steps):
    for s in range(int(steps)):
        channels.setGridBit(int(ch), s, 0)
    return True


def op_row(ch):
    # FL gives the pattern's length in beats; 4 steps to a beat.
    beats = patterns.getPatternLength(patterns.patternNumber()) if hasattr(patterns, "getPatternLength") else 4
    steps = int(beats * 4) if beats else 16
    return [channels.getGridBit(int(ch), s) for s in range(min(128, steps))]


def op_chan_vol(ch, v):
    channels.setChannelVolume(int(ch), max(0.0, min(1.0, float(v))))
    return True


def op_chan_pan(ch, v):
    channels.setChannelPan(int(ch), max(-1.0, min(1.0, float(v))))
    return True


def op_mute(ch, on):
    if bool(channels.isChannelMuted(int(ch))) != bool(on):
        channels.muteChannel(int(ch))
    return True


def op_track_vol(t, v):
    mixer.setTrackVolume(int(t), max(0.0, min(1.0, float(v))))
    return True


def op_plugin_params(index, slot):
    index, slot = int(index), int(slot)
    if not plugins.isValid(index, slot):
        return None
    out = {"name": plugins.getPluginName(index, slot), "params": []}
    for p in range(min(plugins.getParamCount(index, slot), 200)):
        out["params"].append([p, plugins.getParamName(p, index, slot), round(plugins.getParamValue(p, index, slot), 4)])
    return out


def op_plugin_set(index, slot, param, value):
    plugins.setParamValue(max(0.0, min(1.0, float(value))), int(param), int(index), int(slot))
    return True


def op_selected():
    # The channel you last clicked in the Channel rack (-1: none).
    try:
        return int(channels.selectedChannel())
    except Exception:
        return -1


def op_select(ch):
    # Make one channel the selected one (its Piano roll opens with "show").
    channels.selectOneChannel(int(ch))
    return True


def op_tracks():
    # Mixer tracks you've named: [index, name] (not "Insert 3", not the master).
    out = []
    for i in range(1, min(mixer.trackCount(), 126)):
        name = mixer.getTrackName(i)
        if name and not name.startswith("Insert "):
            out.append([i, name])
    return out


def op_slots(t):
    # The effects on a mixer track, by name, slot by slot.
    out = []
    for slot in range(10):
        if plugins.isValid(int(t), slot):
            out.append(plugins.getPluginName(int(t), slot))
    return out


def op_track_pan(t, v):
    mixer.setTrackPan(int(t), max(-1.0, min(1.0, float(v))))
    return True


def op_quantize(ch, start_only):
    # FL's own Quick quantize on one channel (Ctrl+Z takes it back).
    channels.quickQuantize(int(ch), 1 if start_only else 0)
    return True


def op_songmode(on):
    # Song mode plays the Playlist (where sample loops and clips are); the
    # mode it was in comes back so it can be put back.
    was = transport.getLoopMode() == 1
    if was != bool(on):
        transport.setLoopMode()
    return was


def op_metronome(on):
    # Izuki's clock while it listens; the old setting is handed back to restore.
    was = bool(ui.isMetronomeEnabled())
    if was != bool(on):
        transport.globalTransport(midi.FPT_Metronome, 1)
    return was


OPS = {
    "state": op_state, "selftest": op_selftest, "play": op_play, "stop": op_stop, "tempo": op_tempo,
    "undo_point": op_undo_point, "new_pattern": op_new_pattern, "show": op_show, "step": op_step,
    "vel": op_vel, "pitch": op_pitch, "clear_row": op_clear_row, "row": op_row, "chan_vol": op_chan_vol,
    "chan_pan": op_chan_pan, "mute": op_mute, "track_vol": op_track_vol, "plugin_params": op_plugin_params,
    "plugin_set": op_plugin_set, "selected": op_selected, "quantize": op_quantize,
    "select": op_select, "tracks": op_tracks, "slots": op_slots, "track_pan": op_track_pan,
    "metronome": op_metronome, "songmode": op_songmode,
}


# ------------------------------------------------------------ FL Studio's hooks

def OnInit():
    print("Izuki: connected")


def OnSysEx(event):
    data = list(event.sysex)
    if len(data) < 14 or data[:4] != HEAD or chr(data[4]) != "Q":
        return
    event.handled = True
    try:
        head = bytes(data[5:13]).decode("ascii")
        msg_id, part, total = int(head[0:4]), int(head[4:6]), int(head[6:8])
        body = bytes(data[13:-1]).decode("ascii")
    except Exception:
        return
    got = _parts.setdefault(msg_id, {})
    got[part] = body
    if len(got) < total:
        return
    text = "".join(got[i] for i in range(total))
    del _parts[msg_id]
    results = []
    req = None
    try:
        req = _literal(text)
        if not isinstance(req, dict) or req.get("key") != KEY:
            return
        for op in req.get("ops", []):
            name, args = op[0], op[1:]
            fn = OPS.get(name)
            if fn is None:
                results.append({"ok": False, "error": "unknown op " + str(name)})
                continue
            try:
                results.append({"ok": True, "value": fn(*args)})
            except Exception as e:
                results.append({"ok": False, "error": "%s: %s" % (name, e)})
    except Exception as e:
        results = [{"ok": False, "error": "bad request: %s" % e}]
    if isinstance(req, dict) and req.get("quiet"):
        return
    _send(msg_id, repr({"id": msg_id, "results": results}))
