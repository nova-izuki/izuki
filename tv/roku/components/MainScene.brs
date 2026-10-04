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
    if state = "talk"
        m.orb.uri = "pkg:/images/orb_talk.png"
        m.stateLabel.text = ""
        m.pulse.control = "start"
    else if state = "think"
        m.orb.uri = "pkg:/images/orb_think.png"
        m.stateLabel.text = "Thinking…"
        m.spin.control = "start"
    else if state = "listen"
        m.orb.uri = "pkg:/images/orb_idle.png"
        m.stateLabel.text = "Listening…"
        m.pulse.control = "start"
    else
        m.orb.uri = "pkg:/images/orb_idle.png"
        m.stateLabel.text = "Ready"
        m.breathe.control = "start"
    end if
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
