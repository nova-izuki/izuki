sub init()
    m.orb = m.top.findNode("orb")
    m.halo = m.top.findNode("halo")
    m.inner = m.top.findNode("orbInner")
    m.group = m.top.findNode("orbGroup")
    m.home = m.top.findNode("home")
    m.talk = m.top.findNode("talk")
    m.stateLabel = m.top.findNode("state")
    m.said = m.top.findNode("said")
    m.you = m.top.findNode("you")
    m.clock = m.top.findNode("clock")
    m.date = m.top.findNode("date")
    m.weather = m.top.findNode("weather")
    m.greeting = m.top.findNode("greeting")
    m.breathe = m.top.findNode("breathe")
    m.pulse = m.top.findNode("pulse")
    m.spin = m.top.findNode("spin")
    m.drift = m.top.findNode("drift")
    m.toTalk = m.top.findNode("toTalk")
    m.toHome = m.top.findNode("toHome")
    m.voice = m.top.findNode("voice")
    m.look = ""
    m.face = ""
    m.gender = "f"
    m.state = "idle"
    m.working = false
    m.frame = 0
    m.tipAt = 0
    m.tips = [
        "Put on something funny for the kids",
        "Open Netflix on the TV",
        "What's the weather tomorrow?",
        "Turn the TV down",
        "Play lofi music on YouTube",
        "Pause the TV",
        "What's important in my email?",
        "Sleep the TV in 30 minutes",
        "Find a dinosaur cartoon",
        "What's good to watch tonight?",
        "Set a timer for 10 minutes",
        "Open YouTube TV"
    ]
    m.top.findNode("hint").text = "OK clears   *  new ideas"

    m.tick = m.top.findNode("tick")
    m.tick.observeField("fire", "updateClock")
    m.tick.control = "start"
    m.rotate = m.top.findNode("rotate")
    m.rotate.observeField("fire", "nextTips")
    m.rotate.control = "start"
    m.homeAfter = m.top.findNode("homeAfter")
    m.homeAfter.observeField("fire", "backHome")
    m.mouth = m.top.findNode("mouth")
    m.mouth.observeField("fire", "flapMouth")
    m.blink = m.top.findNode("blink")
    m.blink.observeField("fire", "startBlink")
    m.blinkEnd = m.top.findNode("blinkEnd")
    m.blinkEnd.observeField("fire", "endBlink")

    updateClock()
    nextTips()
    setState("idle")
    m.top.setFocus(true)
end sub

sub updateClock()
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    h = now.GetHours()
    suffix = "AM"
    if h >= 12 then suffix = "PM"
    hour = h mod 12
    if hour = 0 then hour = 12
    mins = now.GetMinutes()
    pad = ""
    if mins < 10 then pad = "0"
    m.clock.text = hour.ToStr() + ":" + pad + mins.ToStr() + " " + suffix
    m.date.text = now.GetWeekday() + ", " + now.GetMonth().ToStr() + "/" + now.GetDayOfMonth().ToStr()
    hello = "Good evening"
    if h >= 5 and h < 12 then hello = "Good morning"
    if h >= 12 and h < 17 then hello = "Good afternoon"
    if h >= 22 or h < 5 then hello = "Good night"
    m.greeting.text = hello
end sub

' Four things to try, a new set every few seconds.
sub nextTips()
    for i = 0 to 3
        tip = m.tips[(m.tipAt + i) mod m.tips.Count()]
        m.top.findNode("tip" + i.ToStr()).text = Chr(34) + tip + Chr(34)
    end for
    m.tipAt = (m.tipAt + 4) mod m.tips.Count()
end sub

' Back to the home screen once Izuki has been quiet for a while.
sub backHome()
    if m.state <> "idle" then return
    m.said.text = ""
    m.you.text = ""
    showHome(true)
end sub

sub showHome(animate as boolean)
    if not m.working then return
    m.working = false
    m.talk.visible = false
    m.home.visible = true
    m.stateLabel.text = ""
    if animate
        m.toTalk.control = "stop"
        m.toHome.control = "start"
    else
        m.group.translation = [960, 400]
        m.group.scale = [1.0, 1.0]
    end if
end sub

sub showTalk()
    m.homeAfter.control = "stop"
    if m.working then return
    m.working = true
    m.home.visible = false
    m.talk.visible = true
    m.toHome.control = "stop"
    m.toTalk.control = "start"
end sub

' The picture to show: an orb for this state, or the 3D face's frame.
sub showPicture()
    if m.face <> ""
        m.orb.uri = "pkg:/images/face_" + m.face + "_" + m.gender + "_" + m.frame.ToStr() + ".png"
        return
    end if
    glass = m.look <> "" and m.look <> "liquid"
    if glass
        m.orb.uri = "pkg:/images/orb_glass.png"
    else if m.state = "talk"
        m.orb.uri = "pkg:/images/orb_talk.png"
    else if m.state = "think"
        m.orb.uri = "pkg:/images/orb_think.png"
    else
        m.orb.uri = "pkg:/images/orb_idle.png"
    end if
end sub

' The face talks: the mouth opens and closes with the speech.
sub flapMouth()
    if m.face = "" then return
    if m.state <> "talk"
        m.mouth.control = "stop"
        m.frame = 0
    else if Rnd(0) < 0.62
        m.frame = 1 - m.frame
    end if
    showPicture()
end sub

sub startBlink()
    if m.face = "" or m.state = "talk" then return
    m.frame = 2
    showPicture()
    m.blinkEnd.control = "start"
end sub

sub endBlink()
    m.frame = 0
    showPicture()
end sub

' idle | listen | think | talk
function setState(state as dynamic) as boolean
    if state = invalid then state = "idle"
    m.state = state
    m.breathe.control = "stop"
    m.pulse.control = "stop"
    m.spin.control = "stop"
    m.mouth.control = "stop"
    m.inner.rotation = 0
    m.inner.scale = [1.0, 1.0]
    m.frame = 0
    if state = "talk"
        m.stateLabel.text = ""
        if m.face <> "" then m.mouth.control = "start" else m.pulse.control = "start"
        showTalk()
    else if state = "think"
        m.stateLabel.text = "Thinking..."
        if m.face <> "" then m.breathe.control = "start" else m.spin.control = "start"
        showTalk()
    else if state = "listen"
        m.stateLabel.text = "Listening..."
        m.pulse.control = "start"
        showTalk()
    else
        m.breathe.control = "start"
        if m.working
            m.stateLabel.text = ""
            if m.said.text = "" then showHome(true) else m.homeAfter.control = "start"
        end if
    end if
    showPicture()
    return true
end function

' The look the PC picked for the TV: the Izuki colours, a glass orb tinted
' to match (Aurora and Nebula drift through their colours), or a 3D face.
function setLook(look as dynamic) as boolean
    if look = invalid then look = ""
    if look = m.look then return true
    m.look = look
    m.face = ""
    m.drift.control = "stop"
    m.blink.control = "stop"
    m.orb.blendColor = "0xFFFFFFFF"
    m.halo.opacity = 0
    if look = "holo3d" or look = "avatar"
        m.face = "holo"
        if look = "avatar" then m.face = "av"
        m.halo.blendColor = "0x67E8F9FF"
        m.halo.opacity = 0.35
        m.blink.control = "start"
        showPicture()
        return true
    end if
    tints = {
        ferrofluid: "0xBFEFFFFF", dew: "0xE6FBFFFF", ripple: "0xE8D8FFFF", constellation: "0x9FB8FFFF",
        particles: "0xFFD98AFF", face: "0x67E8F9FF", ferro: "0x8A8AA0FF", aurora: "0x5EF2C2FF", nebula: "0xFF7AD9FF"
    }
    if look = "" or look = "liquid" or tints[look] = invalid
        showPicture()
        return true
    end if
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
    showPicture()
    return true
end function

' Extra things the PC sends: the face (m/f), the weather, what you said.
function setInfo(info as dynamic) as boolean
    if info = invalid then return false
    if info.face <> invalid
        g = "f"
        if info.face = "m" then g = "m"
        if g <> m.gender
            m.gender = g
            showPicture()
        end if
    end if
    if info.weather <> invalid then m.weather.text = info.weather
    if info.you <> invalid
        if info.you <> ""
            m.you.text = "You: " + info.you
            showTalk()
        end if
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
    if text <> "" then showTalk()
    return true
end function

' OK clears the words and goes home; the options button (*) shows new ideas.
' The back button leaves the channel.
function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    if key = "OK"
        m.said.text = ""
        m.you.text = ""
        setState("idle")
        showHome(true)
        return true
    end if
    if key = "options"
        nextTips()
        return true
    end if
    return false
end function
