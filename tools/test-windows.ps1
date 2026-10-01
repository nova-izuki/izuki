# Unit tests only: no app installation, UI launch or account access.
$ErrorActionPreference = 'Stop'
$previous = $env:IZUKI_TEST_MANIFEST
Push-Location "$PSScriptRoot/../src-tauri"
try {
  $env:IZUKI_TEST_MANIFEST = '1'
  cargo test --lib --no-default-features --locked
  $result = $LASTEXITCODE
} finally {
  $env:IZUKI_TEST_MANIFEST = $previous
  Pop-Location
}
exit $result
