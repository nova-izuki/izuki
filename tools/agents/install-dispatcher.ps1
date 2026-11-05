# Keeps the agent bridge's dispatcher (tools/agents/dispatcher.mjs) running on
# this PC: a scheduled task for the signed-in user that starts it at sign-in
# and checks every 30 minutes (the dispatcher's own lock means only one ever
# runs). It hands Claude Code its assigned tasks, one at a time.
#   powershell -ExecutionPolicy Bypass -File tools\agents\install-dispatcher.ps1           install
#   powershell -ExecutionPolicy Bypass -File tools\agents\install-dispatcher.ps1 -Remove   uninstall
# Pause without uninstalling: create the file .work\agents\paused.
param([switch]$Remove)
$ErrorActionPreference = 'Stop'
$name = 'Izuki agent dispatcher'
if ($Remove) {
    Unregister-ScheduledTask -TaskName $name -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Removed the scheduled task '$name'."
    return
}
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$node = (Get-Command node -ErrorAction Stop).Source
$log = Join-Path $repo '.work\agents\dispatcher.log'
$errors = Join-Path $repo '.work\agents\dispatcher-errors.log'
New-Item -ItemType Directory -Force -Path (Split-Path $log) | Out-Null
# The dispatcher keeps its own log (dispatcher.log, kept under 1 MB) and
# decides whether there's work (it exits at once if another copy is running).
# cmd only keeps the last start's errors, for a failure before it can log.
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"`"$node`" tools\agents\dispatcher.mjs >nul 2>`"$errors`"`"" -WorkingDirectory $repo
$atLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
# Repeats for ten years (stated: some Windows versions refuse an open-ended repeat).
$every = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $name -Action $action -Trigger @($atLogon, $every) -Settings $settings -Principal $principal -Description 'Izuki agent bridge: hands Claude Code its queued tasks (docs/AGENTS-BRIDGE.md). Pause: create .work\agents\paused.' -Force | Out-Null
Write-Host "Installed '$name': starts at sign-in and every 30 minutes; log at $log."
