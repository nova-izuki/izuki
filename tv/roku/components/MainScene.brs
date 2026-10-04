sub init()
    m.orb = m.top.findNode("orb")
    m.group = m.top.findNode("orbGroup")
    m.stateLabel = m.top.findNode("state")
    m.said = m.top.findNode("said")
    m.clock = m.top.findNode("clock")
    m.breathe = m.top.findNode("breathe")
    m.pulse = m.top.findNode("pulse")
    m.spin = m.top.findNode("spin")
    m.tick = m.top.findNode("tick")
    m.halo = m.top.findNode("halo")
    m.drift = m.top.findNode("drift")
    m.voice = m.top.findNode("voice")
    m.look = ""
    m.tick.observeField("fire", "updateClock")
    m.tick.control = "start"
    updateClock()
    setState("idle")
    m.top.setFocus(true)
end sub

sub updateClock()
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    h = now.GetHours()
    suffix = "AM"
    if h >= 12 then suffix = "PM"
    h = h mod 12
    if h = 0 then h = 12
    mins = now.GetMinutes()
    pad = ""
    if mins < 10 then pad = "0"
    m.clock.text = h.ToStr() + ":" + pad + mins.ToStr() + " " + suffix
end sub

' idle | listen | think | talk
function setState(state as dynamic) as boolean
    if state = invalid then state = "idle"
    m.breathe.control = "stop"
    m.pulse.control = "stop"
    m.spin.control = "stop"
    m.group.rotation = 0
    m.group.scale = [1.0, 1.0]
    glass = m.look <> "" and m.look <> "liquid"
    if state = "talk"
        m.orb.uri = "pkg:/images/orb_talk.png"
        if glass then m.orb.uri = "pkg:/images/orb_glass.png"
        m.stateLabel.text = ""
        m.pulse.control = "start"
    else if state = "think"
        m.orb.uri = "pkg:/images/orb_think.png"
        if glass then m.orb.uri = "pkg:/images/orb_glass.png"
        m.stateLabel.text = "Thinking…"
        m.spin.control = "start"
    else if state = "listen"
        m.orb.uri = "pkg:/images/orb_idle.png"
        if glass then m.orb.uri = "pkg:/images/orb_glass.png"
        m.stateLabel.text = "Listening…"
        m.pulse.control = "start"
    else
        m.orb.uri = "pkg:/images/orb_idle.png"
        if glass then m.orb.uri = "pkg:/images/orb_glass.png"
        m.stateLabel.text = "Ready"
        m.breathe.control = "start"
    end if
    return true
end function

' The look the PC picked for the TV: the Izuki colours, or a glass orb
' tinted to match (Aurora and Nebula drift through their colours).
function setLook(look as dynamic) as boolean
    if look = invalid then look = ""
    if look = m.look then return true
    m.look = look
    tints = {
        ferrofluid: "0xBFEFFFFF", dew: "0xE6FBFFFF", ripple: "0xE8D8FFFF", constellation: "0x9FB8FFFF",
        particles: "0xFFD98AFF", face: "0x67E8F9FF", ferro: "0x8A8AA0FF", aurora: "0x5EF2C2FF", nebula: "0xFF7AD9FF"
    }
    m.drift.control = "stop"
    if look = "" or look = "liquid" or tints[look] = invalid
        m.orb.blendColor = "0xFFFFFFFF"
        m.halo.opacity = 0
        m.orb.uri = "pkg:/images/orb_idle.png"
        return true
    end if
    m.orb.uri = "pkg:/images/orb_glass.png"
    m.orb.blendColor = tints[look]
    m.halo.blendColor = tints[look]
    m.halo.opacity = 0.55
    if look = "aurora" or look = "nebula"
        cols = ["0x5EF2C2FF", "0x67C8F9FF", "0xB18CFFFF", "0x5EF2C2FF"]
        if look = "nebula" then cols = ["0xFF7AD9FF", "0x8B6CFFFF", "0x46D0FFFF", "0xFF7AD9FF"]
        m.top.findNode("driftOrb").keyValue = cols
        m.top.findNode("driftHalo").keyValue = cols
        m.drift.control = "start"
    end if
    return true
end function

' Say it out of the TV: an address on the PC, in Izuki's own voice.
function playVoice(url as dynamic) as boolean
    if url = invalid or url = "" then return false
    content = CreateObject("roSGNode", "ContentNode")
    content.url = url
    if Instr(1, url, ".wav") > 0 then content.streamFormat = "wav" else content.streamFormat = "mp3"
    m.voice.control = "stop"
    m.voice.content = content
    m.voice.control = "play"
    return true
end function

function setText(text as dynamic) as boolean
    if text = invalid then text = ""
    m.said.text = text
    return true
end function

' The remote's back button leaves the channel; OK clears the words.
function onKeyEvent(key as string, press as boolean) as boolean
    if press and key = "OK"
        m.said.text = ""
        setState("idle")
        return true
    end if
    return false
end function
