# Unit tests only: no app installation, UI launch or account access.
$ErrorActionPreference = 'Stop'
$previous = $env:IZUKI_TEST_MANIFEST
Push-Location "$PSScriptRoot/../src-tauri"
try {
  $env:IZUKI_TEST_MANIFEST = '1'
  cargo test --lib --no-default-features --locked
  $result = $LASTEXITCODE
  if ($result -ne 0) { exit $result }
  # The owner-only observer suite (milestone §5): the same lib tests with
  # the devvision feature on, which is the shape a dev build carries
  # (CodeRabbit review 2, open item).
  Write-Host '--- devvision (Smart Vision) suite ---'
  cargo test --lib --features devvision --locked
  $result = $LASTEXITCODE
} finally {
  $env:IZUKI_TEST_MANIFEST = $previous
  Pop-Location
}
exit $result
