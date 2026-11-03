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
New-Item -ItemType Directory -Force -Path (Split-Path $log) | Out-Null
# cmd keeps a log of what the dispatcher did; the dispatcher itself decides
# whether there's work (and exits at once if another copy is running).
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"`"$node`" tools\agents\dispatcher.mjs >> `"$log`" 2>&1`"" -WorkingDirectory $repo
$atLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$every = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $name -Action $action -Trigger @($atLogon, $every) -Settings $settings -Principal $principal -Description 'Izuki agent bridge: hands Claude Code its queued tasks (docs/AGENTS-BRIDGE.md). Pause: create .work\agents\paused.' -Force | Out-Null
Write-Host "Installed '$name': starts at sign-in and every 30 minutes; log at $log."
