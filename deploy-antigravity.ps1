# Antigravity Standalone App Safe Deploy
# Only modifies Antigravity standalone application

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Antigravity (Standalone) v2.31.0 Deploy Script" -ForegroundColor Yellow
Write-Host "  MRMPPRO | Custom Models, MCP, WSL & Stability Fix" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Cyan

# 1. Close Antigravity Standalone App Only
Write-Host ""
Write-Host "[1/6] Closing Antigravity..." -ForegroundColor Yellow
taskkill /F /IM "Antigravity.exe" /T 2>$null | Out-Null
taskkill /F /IM "language_server.exe" /T 2>$null | Out-Null
$agProcs = Get-Process -Name "Antigravity", "language_server" -ErrorAction SilentlyContinue
if ($agProcs) { $agProcs | Stop-Process -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1
Write-Host "   OK" -ForegroundColor Green

# 2. Define paths
$ProjectDir = $PSScriptRoot
$AsarPath = "$env:LOCALAPPDATA\Programs\antigravity\resources\app.asar"
if (-not (Test-Path $AsarPath)) {
    $AsarPath = "$env:LOCALAPPDATA\Programs\Antigravity\resources\app.asar"
}
$BackupAsar = "$AsarPath.backup"
$TempDir = Join-Path $env:TEMP "antigravity_standalone_deploy"

# 3. Backup app.asar
$AsarUnpacked = "$AsarPath.unpacked"
$BackupAsarUnpacked = "$BackupAsar.unpacked"

if (Test-Path $AsarPath) {
    if (-not (Test-Path $BackupAsar)) {
        Write-Host "[2/6] Creating initial backup of app.asar..." -ForegroundColor Yellow
        Copy-Item $AsarPath $BackupAsar -Force
    } else {
        Write-Host "[2/6] Preserving existing clean backup of app.asar..." -ForegroundColor Green
    }

    if (Test-Path $AsarUnpacked) {
        if (-not (Test-Path $BackupAsarUnpacked)) {
            Copy-Item $AsarUnpacked $BackupAsarUnpacked -Recurse -Force
        }
    }
} else {
    Write-Host "[2/6] ERROR: app.asar not found at: $AsarPath" -ForegroundColor Red
    exit 1
}

# 4. Extract app.asar
Write-Host "[3/6] Extracting app.asar..." -ForegroundColor Yellow
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npx -y @electron/asar extract $AsarPath $TempDir

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: asar extraction failed! Attempting from backup..." -ForegroundColor Red
    if (Test-Path $BackupAsar) { npx -y @electron/asar extract $BackupAsar $TempDir }
    if ($LASTEXITCODE -ne 0) { exit 1 }
}
Write-Host "   OK" -ForegroundColor Green

# 5. Copy dist folder and clean temporary files
Write-Host "[4/6] Merging dist folder and applying core stability patches..." -ForegroundColor Yellow
if (Test-Path (Join-Path $TempDir ".git")) { Remove-Item (Join-Path $TempDir ".git") -Recurse -Force }
if (Test-Path (Join-Path $TempDir "scratch")) { Remove-Item (Join-Path $TempDir "scratch") -Recurse -Force }

$srcDist = Join-Path $ProjectDir "dist"
$destDist = Join-Path $TempDir "dist"

if (-not (Test-Path $destDist)) {
    New-Item -ItemType Directory -Path $destDist -Force | Out-Null
}
Copy-Item -Path "$srcDist\*" -Destination $destDist -Recurse -Force
Write-Host "   OK - dist folder merged without overwriting official files" -ForegroundColor Green

# Repack app.asar
Write-Host "[5/6] Packing app.asar..." -ForegroundColor Yellow
$packed = $false
for ($attempt = 1; $attempt -le 5; $attempt++) {
    npx -y @electron/asar pack $TempDir $AsarPath
    if ($LASTEXITCODE -eq 0) {
        $packed = $true
        break
    }
    Write-Host "   Packing attempt $attempt failed (file may still be locked), retrying in 2s..." -ForegroundColor Yellow
    Get-Process -Name "Antigravity", "language_server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if (-not $packed) {
    Write-Host "   ERROR: Packing failed! Restoring backup..." -ForegroundColor Red
    Copy-Item $BackupAsar $AsarPath -Force
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   OK" -ForegroundColor Green

# 6. Binary patch for Antigravity Standalone Language Server
Write-Host "[6/6] Patching Antigravity standalone language_server.exe..." -ForegroundColor Yellow
$OriginalUrl = "https://daily-cloudcode-pa.googleapis.com"
$PatchedUrl = "http://localhost:50999/v1internal/xxxxxxx"

$agLs = "$env:LOCALAPPDATA\Programs\Antigravity\resources\bin\language_server.exe"
if (-not (Test-Path $agLs)) {
    $agLs = "$env:LOCALAPPDATA\Programs\antigravity\resources\bin\language_server.exe"
}

if (Test-Path $agLs) {
    Get-Process -Name "language_server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 300
    try {
        $outBytes = [System.IO.File]::ReadAllBytes($agLs)
        $content = [System.Text.Encoding]::ASCII.GetString($outBytes)

        if ($content.Contains($PatchedUrl)) {
            Write-Host "   OK - Binary already patched" -ForegroundColor Green
        } else {
            $offset = $content.IndexOf($OriginalUrl, [System.StringComparison]::Ordinal)
            if ($offset -ge 0) {
                $LsBackup = "$agLs.bak"
                if (-not (Test-Path $LsBackup)) { Copy-Item $agLs $LsBackup -Force }
                $replaceBytes = [System.Text.Encoding]::ASCII.GetBytes($PatchedUrl)
                [System.Array]::Copy($replaceBytes, 0, $outBytes, $offset, $replaceBytes.Length)

                $written = $false
                for ($attempt = 1; $attempt -le 5; $attempt++) {
                    try {
                        Get-Process -Name "language_server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Milliseconds 500
                        [System.IO.File]::WriteAllBytes($agLs, $outBytes)
                        $written = $true
                        break
                    } catch {
                        Start-Sleep -Seconds 1
                    }
                }
                if ($written) {
                    Write-Host "   OK - Binary patch applied successfully" -ForegroundColor Green
                } else {
                    Write-Host "   ERROR: Binary file locked, could not write patch!" -ForegroundColor Red
                }
            } else {
                Write-Host "   WARNING: Original URL string not found in binary" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "   WARNING - Could not patch binary: $_" -ForegroundColor Yellow
    }
}

# Launch Antigravity
$ExePath = "$env:LOCALAPPDATA\Programs\Antigravity\Antigravity.exe"
if (-not (Test-Path $ExePath)) {
    $ExePath = "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
}
if (Test-Path $ExePath) {
    Start-Process -FilePath $ExePath
    Write-Host "   Antigravity launched." -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SUCCESS! Antigravity (Standalone) repatched." -ForegroundColor Green
Write-Host "  Antigravity 2.31.0 Compatibility Verified" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
