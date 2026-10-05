' Izuki on Roku: a full-screen companion screen. Izuki on your PC or phone
' controls the TV over Wi-Fi; while this channel is open it also sends what
' Izuki is doing here (Roku's "input" messages), so the orb and Izuki's words
' show on the TV:  POST http://<roku>:8060/input?state=talk&text=Hello
'   state: idle | listen | think | talk      text: what Izuki says
'   look: the orb ("" = Izuki colours, holo3d / avatar = a 3D face)   audio: Izuki's voice to play
'   face: m | f (the 3D face)   weather: a line for the corner   you: what you said

sub Main(args as dynamic)
    screen = CreateObject("roSGScreen")
    port = CreateObject("roMessagePort")
    screen.SetMessagePort(port)
    scene = screen.CreateScene("MainScene")
    screen.Show()

    input = CreateObject("roInput")
    input.SetMessagePort(port)

    ' Launched with a message already (deep link from the PC).
    if args <> invalid then ShowMessage(scene, args)

    while true
        msg = wait(0, port)
        t = type(msg)
        if t = "roSGScreenEvent"
            if msg.IsScreenClosed() then return
        else if t = "roInputEvent"
            if msg.IsInput() then ShowMessage(scene, msg.GetInfo())
        end if
    end while
end sub

sub ShowMessage(scene as object, info as object)
    if info = invalid then return
    if info.look <> invalid then scene.callFunc("setLook", info.look)
    if info.state <> invalid then scene.callFunc("setState", info.state)
    if info.audio <> invalid then scene.callFunc("playVoice", info.audio)
    if info.text <> invalid then scene.callFunc("setText", info.text)
    if info.face <> invalid or info.weather <> invalid or info.you <> invalid then scene.callFunc("setInfo", info)
end sub
