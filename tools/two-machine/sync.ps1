# Izuki two-machine sync.
#
# One checkout, two PCs. This keeps whichever machine is on up to date with
# origin, so work done on the other laptop (possibly while this one was off)
# arrives by itself. Fast-forward only: it never merges, never stashes, never
# force-pushes and never throws away uncommitted work.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/two-machine/sync.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/two-machine/sync.ps1 -Install
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/two-machine/sync.ps1 -Uninstall
#
# Log: <repo>/.git/two-machine-sync.log (inside .git, so it is never committed).

[CmdletBinding()]
param(
  [string]$Repo = "",
  [switch]$Install,
  [switch]$Uninstall,
  [switch]$Quiet
)

$ErrorActionPreference = 'Continue'
$TaskName = 'Izuki two-machine sync'
$StableCopy = Join-Path $env:LOCALAPPDATA 'Izuki\two-machine-sync.ps1'

if (-not $Repo) {
  $here = $PSScriptRoot
  if (-not $here) { $here = Split-Path -Parent $MyInvocation.MyCommand.Path }
  $Repo = Split-Path -Parent (Split-Path -Parent $here)
}
if (-not (Test-Path -LiteralPath $Repo)) {
  Write-Host "No repo at $Repo"
  exit 1
}
$Repo = (Resolve-Path -LiteralPath $Repo).Path
$log = Join-Path $Repo '.git\two-machine-sync.log'

function Say([string]$m) {
  $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m
  try { Add-Content -LiteralPath $log -Value $line -Encoding utf8 } catch { }
  if (-not $Quiet) { Write-Host $line }
}

if ($Uninstall) {
  try { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop }
  catch { & schtasks.exe /Delete /F /TN $TaskName | Out-Null }
  # The windowless launcher goes with the task; the repo copy stays.
  $runner = Join-Path (Split-Path -Parent $StableCopy) 'two-machine-sync.vbs'
  if (Test-Path -LiteralPath $runner) { Remove-Item -LiteralPath $runner -Force -ErrorAction SilentlyContinue }
  Say 'uninstalled: the sync task is gone, the repo is untouched'
  exit 0
}

if ($Install) {
  $dir = Split-Path -Parent $StableCopy
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Copy-Item -LiteralPath $PSCommandPath -Destination $StableCopy -Force
  # A task that launches powershell.exe makes a console window appear for a
  # moment every time it runs — that is the flash the owner kept seeing. WSH
  # starts it with no window at all, so the sync is invisible.
  $runner = Join-Path $dir 'two-machine-sync.vbs'
  $vbs = @"
' Izuki two-machine sync: starts the sync with no window at all.
Set sh = CreateObject("WScript.Shell")
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""$StableCopy"" -Repo ""$Repo"" -Quiet", 0, False
"@
  Set-Content -LiteralPath $runner -Value $vbs -Encoding Unicode
  $arg = '//nologo "{0}"' -f $runner
  $ok = $false
  try {
    $action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument $arg
    $atLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
    $repeat = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
      -RepetitionInterval (New-TimeSpan -Minutes 10) `
      -RepetitionDuration (New-TimeSpan -Days 3650)
    $set = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries `
      -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger @($atLogon, $repeat) `
      -Settings $set -Description 'Pulls and pushes the Izuki repo so either PC can carry on.' -Force | Out-Null
    $ok = $true
  } catch {
    Say "task API refused ($($_.Exception.Message)); trying schtasks"
  }
  if (-not $ok) {
    & schtasks.exe /Create /F /TN $TaskName /SC MINUTE /MO 10 /TR "wscript.exe $arg" | Out-Null
    $ok = ($LASTEXITCODE -eq 0)
  }
  if (-not $ok) { Say 'could not register the task'; exit 1 }
  Say "installed: '$TaskName' runs at sign-in and every 10 minutes"
  Say "watching: $Repo"
  exit 0
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Say 'git is not on PATH'; exit 1 }
$env:GIT_TERMINAL_PROMPT = '0'

Push-Location $Repo
try {
  & git rev-parse --is-inside-work-tree *> $null
  if ($LASTEXITCODE -ne 0) { Say "$Repo is not a git repo"; exit 1 }

  $branch = (& git rev-parse --abbrev-ref HEAD).Trim()
  if ($branch -eq 'HEAD') { Say 'detached HEAD: nothing to sync'; exit 0 }

  $up = "origin/$branch"
  & git rev-parse --verify --quiet $up *> $null
  if ($LASTEXITCODE -ne 0) { Say "no upstream ${up}: nothing to sync"; exit 0 }

  Say "sync $branch"
  & git fetch --prune origin *> $null
  if ($LASTEXITCODE -ne 0) { Say 'fetch failed (offline, or git needs a password)'; exit 1 }

  $ahead = [int](& git rev-list --count "$up..HEAD")
  $behind = [int](& git rev-list --count "HEAD..$up")

  if ($ahead -eq 0 -and $behind -eq 0) { Say 'already up to date'; exit 0 }

  if ($ahead -gt 0 -and $behind -eq 0) {
    & git push origin "HEAD:$branch" *> $null
    if ($LASTEXITCODE -eq 0) { Say "pushed $ahead commit(s)" }
    else { Say 'push refused; your commits stay here, nothing lost' }
    exit 0
  }

  if ($ahead -gt 0 -and $behind -gt 0) {
    Say "diverged ($ahead ahead, $behind behind): a person has to choose, not a script"
    exit 0
  }

  $dirty = @(& git status --porcelain --untracked-files=no)
  if ($dirty.Count -gt 0) {
    Say "$($dirty.Count) uncommitted file(s): not pulling, so your work stays exactly as it is"
    exit 0
  }

  & git merge --ff-only $up *> $null
  if ($LASTEXITCODE -eq 0) { Say "fast-forwarded $behind commit(s)" }
  else { Say 'fast-forward refused; repo left as it was' }
}
finally { Pop-Location }
