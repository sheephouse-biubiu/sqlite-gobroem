Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Run from repository root so relative paths are stable.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host '==> Checking Go toolchain'
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  throw 'Go is not installed or not in PATH.'
}

$gopath = (go env GOPATH).Trim()
if (-not $gopath) {
  throw 'Failed to read GOPATH from go env.'
}

$bindataExe = Join-Path $gopath 'bin\go-bindata.exe'

if (-not (Test-Path $bindataExe)) {
  Write-Host '==> Installing go-bindata'
  go install github.com/go-bindata/go-bindata/...@latest
}

Write-Host '==> Embedding static assets into gobroem/assets.go'
& $bindataExe -pkg gobroem -o gobroem/assets.go static/...

Write-Host '==> Building binary'
go build .

Write-Host '==> Done'
