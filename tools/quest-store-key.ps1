# Izuki VR in the Meta Horizon Store: the app's store signing key.
#
# Makes the key once (RSA 4096, valid 30 years) and keeps it in the main
# checkout's git-ignored .private\quest folder: izuki-quest-store.p12, its
# password.txt and fingerprint.txt. BACK THAT FOLDER UP: every store update
# must be signed with this same key.
#
# Then gives GitHub's build a copy as two secrets (IZUKI_QUEST_STORE_KEYSTORE_B64
# and IZUKI_QUEST_STORE_KEYSTORE_PASSWORD), so .github/workflows/quest.yml can
# sign the store version. Running it again reuses the key (and refreshes the
# secrets); it never makes a second one. The password is never printed.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\quest-store-key.ps1
# Needs the GitHub CLI signed in (gh auth status).
$ErrorActionPreference = "Stop"

# The main checkout (a worktree may be deleted; the key must outlive it).
$common = (git -C $PSScriptRoot rev-parse --git-common-dir).Trim()
if (-not [IO.Path]::IsPathRooted($common)) { $common = Join-Path $PSScriptRoot $common }
$root = Split-Path -Parent (Resolve-Path $common)
$dir = Join-Path $root ".private\quest"
New-Item -ItemType Directory -Force $dir | Out-Null
git -C $root check-ignore -q $dir
if ($LASTEXITCODE -ne 0) { throw "$dir isn't git-ignored: refusing to put a key there." }

$p12 = Join-Path $dir "izuki-quest-store.p12"
$pwFile = Join-Path $dir "password.txt"
if (Test-Path $p12) {
  Write-Host "The store key already exists: reusing it."
} else {
  $bytes = New-Object byte[] 24
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $pw = ([Convert]::ToBase64String($bytes)) -replace '[+/=]', 'x'
  $cert = New-SelfSignedCertificate -Subject "CN=IZUKI NOVA, O=Nova Izuki" -FriendlyName "izuki" `
    -KeyAlgorithm RSA -KeyLength 4096 -HashAlgorithm SHA256 -KeyExportPolicy Exportable -KeySpec Signature `
    -NotAfter (Get-Date).AddYears(30) -CertStoreLocation "Cert:\CurrentUser\My"
  try {
    Export-PfxCertificate -Cert $cert -FilePath $p12 -Password (ConvertTo-SecureString $pw -AsPlainText -Force) | Out-Null
  } finally {
    # The key lives only in the file now, not in Windows' certificate store.
    Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)" -DeleteKey -ErrorAction SilentlyContinue
  }
  [IO.File]::WriteAllText($pwFile, $pw)
  [IO.File]::WriteAllText((Join-Path $dir "README.txt"), "Izuki VR's Meta Horizon Store signing key. Back this folder up somewhere safe (not in git): every store update must be signed with this key. Made by tools/quest-store-key.ps1 on $(Get-Date -Format yyyy-MM-dd).")
  Write-Host "Made the store key."
}

$pw = [IO.File]::ReadAllText($pwFile)
$x509 = New-Object Security.Cryptography.X509Certificates.X509Certificate2($p12, $pw)
$sha = [Security.Cryptography.SHA256]::Create().ComputeHash($x509.RawData)
$fp = ($sha | ForEach-Object { $_.ToString("X2") }) -join ":"
[IO.File]::WriteAllText((Join-Path $dir "fingerprint.txt"), $fp)

# Through a file, not a pipe: Windows PowerShell pipes text into gh with a
# byte-order mark and a line break, and the secret would carry them.
function Set-GhSecret($name, $value) {
  $tmp = Join-Path $dir (".secret-" + [Guid]::NewGuid().ToString("N") + ".tmp")
  try {
    [IO.File]::WriteAllText($tmp, $value, (New-Object Text.UTF8Encoding $false))
    cmd /c "gh secret set $name -R nova-izuki/izuki < `"$tmp`""
    if ($LASTEXITCODE -ne 0) { throw "Couldn't set $name in GitHub (is gh signed in?)." }
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}
Set-GhSecret "IZUKI_QUEST_STORE_KEYSTORE_B64" ([Convert]::ToBase64String([IO.File]::ReadAllBytes($p12)))
Set-GhSecret "IZUKI_QUEST_STORE_KEYSTORE_PASSWORD" $pw
Write-Host "GitHub has the store key now."
Write-Host "Store key fingerprint (public, goes in assetlinks.json): $fp"
