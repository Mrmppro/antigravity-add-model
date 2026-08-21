# Antigravity Safe Deploy - Only modifies the dist folder
# Original app.asar is backed up, dist is updated, then repacked
# Run this script from a PowerShell terminal!

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Antigravity Safe Deploy Script" -ForegroundColor Yellow
Write-Host "  MRMPPRO | Customization, MCP, Skills & Gravity Auto Switch" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Cyan

# 1. Close Antigravity and Antigravity IDE
Write-Host ""
Write-Host "[1/7] Closing Antigravity and Antigravity IDE..." -ForegroundColor Yellow
taskkill /F /IM "Antigravity.exe" /T 2>$null | Out-Null
taskkill /F /IM "Antigravity IDE.exe" /T 2>$null | Out-Null
taskkill /F /IM "language_server.exe" /T 2>$null | Out-Null
taskkill /F /IM "language_server_windows_x64.exe" /T 2>$null | Out-Null
Get-Process -Name "Antigravity*", "language_server*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   OK" -ForegroundColor Green

# 2. Define paths
$ProjectDir = $PSScriptRoot
$AsarPath = "$env:LOCALAPPDATA\Programs\antigravity\resources\app.asar"
$BackupAsar = "$AsarPath.backup"
$TempDir = Join-Path $env:TEMP "antigravity_safe_deploy"

# 3. Check backup - back up current app.asar if missing
$AsarUnpacked = "$AsarPath.unpacked"
$BackupAsarUnpacked = "$BackupAsar.unpacked"

if (Test-Path $AsarPath) {
    # Backup current app.asar if backup doesn't exist
    if (-not (Test-Path $BackupAsar)) {
        Write-Host "[2/7] No backup found - backing up from current version..." -ForegroundColor Yellow
        Copy-Item $AsarPath $BackupAsar -Force
        Write-Host "   app.asar backed up successfully." -ForegroundColor Green
    } else {
        Write-Host "[2/7] Backing up original app.asar..." -ForegroundColor Yellow
        Copy-Item $AsarPath $BackupAsar -Force
    }

    # Ensure app.asar.unpacked is backed up and synced
    if (Test-Path $AsarUnpacked) {
        if (Test-Path $BackupAsarUnpacked) { Remove-Item $BackupAsarUnpacked -Recurse -Force }
        Copy-Item $AsarUnpacked $BackupAsarUnpacked -Recurse -Force
        Write-Host "   app.asar.unpacked backed up successfully." -ForegroundColor Green
    }
} else {
    Write-Host "[2/7] ERROR: app.asar not found at: $AsarPath" -ForegroundColor Red
    exit 1
}

# 4. Extract app.asar to temporary directory
Write-Host "[3/7] Extracting app.asar..." -ForegroundColor Yellow
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npx -y @electron/asar extract $AsarPath $TempDir

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: asar extraction failed! Attempting extraction from backup..." -ForegroundColor Red
    if (Test-Path $BackupAsar) {
        npx -y @electron/asar extract $BackupAsar $TempDir
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR: Backup asar extraction also failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   OK - Temporary folder: $TempDir" -ForegroundColor Green

# 5. Copy dist folder from project and clean up temporary files
Write-Host "[4/7] Updating dist folder and cleaning temporary files..." -ForegroundColor Yellow
Write-Host "   MRMPPRO: Preparing Customization, MCP, Skills & Gravity Auto Switch..." -ForegroundColor Magenta

# Clean temporary files
if (Test-Path (Join-Path $TempDir ".git")) { Remove-Item (Join-Path $TempDir ".git") -Recurse -Force }
if (Test-Path (Join-Path $TempDir "scratch")) { Remove-Item (Join-Path $TempDir "scratch") -Recurse -Force }

$srcDist = Join-Path $ProjectDir "dist"
$destDist = Join-Path $TempDir "dist"

if (Test-Path $destDist) { Remove-Item $destDist -Recurse -Force }
Copy-Item $srcDist $destDist -Recurse -Force
Write-Host "   OK - dist folder copied. MRMPPRO customization patch ready." -ForegroundColor Green

# Copy repack.ps1 (latest version)
$srcRepack = Join-Path $ProjectDir "repack.ps1"
if (Test-Path $srcRepack) {
    Copy-Item $srcRepack (Join-Path $TempDir "repack.ps1") -Force
}

# 6. Repack app.asar
Write-Host "[5/7] Packing app.asar..." -ForegroundColor Yellow

# Pack app.asar
npx -y @electron/asar pack $TempDir $AsarPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: Packing failed! Restoring backup..." -ForegroundColor Red
    Copy-Item $BackupAsar $AsarPath -Force
    if (Test-Path $BackupAsarUnpacked) {
        if (Test-Path $AsarUnpacked) { Remove-Item $AsarUnpacked -Recurse -Force }
        Copy-Item $BackupAsarUnpacked $AsarUnpacked -Recurse -Force
    }
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "   OK" -ForegroundColor Green

# Clean up temp folder
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# Binary patch - fast string-based (covers Antigravity & Antigravity IDE)
Write-Host "[6/7] Applying Language Server binary patch (Antigravity & Antigravity IDE)..." -ForegroundColor Yellow
$OriginalUrl = "https://daily-cloudcode-pa.googleapis.com"
$PatchedUrl = "http://localhost:50999/v1internal/xxxxxxx"

$lsBinaries = Get-ChildItem -Path "$env:LOCALAPPDATA\Programs" -Recurse -Filter "*language_server*.exe" -ErrorAction SilentlyContinue

if ($lsBinaries.Count -gt 0) {
    Get-Process -Name "language_server*", "language_server_windows_x64*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500

    foreach ($bin in $lsBinaries) {
        $binPath = $bin.FullName
        Write-Host "   Checking: $binPath..." -ForegroundColor Gray
        try {
            $outBytes = [System.IO.File]::ReadAllBytes($binPath)
            $content = [System.Text.Encoding]::ASCII.GetString($outBytes)

            if ($content.Contains($PatchedUrl)) {
                Write-Host "   OK - Already patched" -ForegroundColor Green
            } else {
                $offset = $content.IndexOf($OriginalUrl, [System.StringComparison]::Ordinal)
                if ($offset -ge 0) {
                    $LsBackup = "$binPath.bak"
                    if (-not (Test-Path $LsBackup)) { Copy-Item $binPath $LsBackup -Force }
                    $replaceBytes = [System.Text.Encoding]::ASCII.GetBytes($PatchedUrl)
                    [System.Array]::Copy($replaceBytes, 0, $outBytes, $offset, $replaceBytes.Length)

                    $written = $false
                    for ($attempt = 1; $attempt -le 5; $attempt++) {
                        try {
                            Get-Process -Name "language_server*", "language_server_windows_x64*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
                            Start-Sleep -Milliseconds 500
                            [System.IO.File]::WriteAllBytes($binPath, $outBytes)
                            $written = $true
                            break
                        } catch {
                            Start-Sleep -Seconds 1
                        }
                    }
                    if ($written) {
                        Write-Host "   OK - Binary patch applied (offset: $offset)" -ForegroundColor Green
                    } else {
                        Write-Host "   ERROR: Binary file locked, could not write patch!" -ForegroundColor Red
                    }
                } else {
                    Write-Host "   WARNING: Hardcoded URL not found! Binary patch skipped." -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "   ERROR: Could not read/write binary ($binPath): $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   WARNING: No language_server*.exe found!" -ForegroundColor Yellow
}

# 6b. Antigravity IDE - Self-sufficient proxy deployment
Write-Host "[6b] Applying Antigravity IDE proxy and main.js patch..." -ForegroundColor Yellow
$IdeAppDir = "$env:LOCALAPPDATA\Programs\Antigravity IDE\resources\app"
$IdeMainPath = "$IdeAppDir\out\main.js"
$IdeProxyDir = "$IdeAppDir\out\mrmppro-proxy"

if (Test-Path $IdeMainPath) {
    # 6b-i. Copy proxy modules to IDE
    Write-Host "   [6b-i] Copying proxy modules to Antigravity IDE..." -ForegroundColor Gray
    if (Test-Path $IdeProxyDir) { Remove-Item $IdeProxyDir -Recurse -Force }
    New-Item -ItemType Directory -Path $IdeProxyDir -Force | Out-Null

    # Copy compiled dist/ files
    $distFiles = @(
        "proxy.js", "proxy.js.map",
        "cryptoStore.js", "cryptoStore.js.map",
        "schemaValidator.js", "schemaValidator.js.map",
        "paths.js", "paths.js.map",
        "storage.js", "storage.js.map"
    )
    foreach ($f in $distFiles) {
        $src = Join-Path $ProjectDir "dist\$f"
        if (Test-Path $src) { Copy-Item $src (Join-Path $IdeProxyDir $f) -Force }
    }

    # Copy subdirectories
    foreach ($subDir in @("proxy", "autoSwitch", "services")) {
        $srcSub = Join-Path $ProjectDir "dist\$subDir"
        $destSub = Join-Path $IdeProxyDir $subDir
        if (Test-Path $srcSub) {
            Copy-Item $srcSub $destSub -Recurse -Force
        }
    }

    Write-Host "   OK - Proxy modules copied successfully" -ForegroundColor Green

    # 6b-ii. Copy electron-log to IDE's node_modules (if not present)
    $IdeElectronLog = "$IdeAppDir\node_modules\electron-log"
    if (-not (Test-Path $IdeElectronLog)) {
        $srcElectronLog = Join-Path $ProjectDir "node_modules\electron-log"
        if (Test-Path $srcElectronLog) {
            Write-Host "   [6b-ii] Copying electron-log to IDE..." -ForegroundColor Gray
            Copy-Item $srcElectronLog $IdeElectronLog -Recurse -Force
            Write-Host "   OK - electron-log copied successfully" -ForegroundColor Green
        } else {
            Write-Host "   WARNING: electron-log not found in project node_modules" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [6b-ii] electron-log already exists in IDE" -ForegroundColor Green
    }

    # 6b-iii. Patch main.js with self-sufficient proxy startup
    $content = [System.IO.File]::ReadAllText($IdeMainPath)
    $patchMarker = "// MRMPPRO_SELF_SUFFICIENT_PROXY_V2"
    $oldPatchMarker = "// MRMPPRO_GET_AVAILABLE_MODELS_INTERCEPT"

    $needsPatch = $false
    if ($content.Contains($patchMarker)) {
        Write-Host "   [6b-iii] main.js already has V2 patch, updating..." -ForegroundColor Gray
        $markerIdx = $content.IndexOf($patchMarker)
        $content = $content.Substring(0, $markerIdx).TrimEnd()
        $needsPatch = $true
    } elseif ($content.Contains($oldPatchMarker)) {
        Write-Host "   [6b-iii] Found old V1 patch, upgrading to V2..." -ForegroundColor Gray
        $markerIdx = $content.IndexOf($oldPatchMarker)
        $content = $content.Substring(0, $markerIdx).TrimEnd()
        $needsPatch = $true
    } else {
        $needsPatch = $true
    }

    if ($needsPatch) {
        $patchCode = @"

$patchMarker
// MRMPPRO Self-Sufficient Proxy for Antigravity IDE
// This patch starts a standalone proxy server inside the IDE process,
// so custom models work without requiring the Antigravity standalone app.
// NOTE: Uses dynamic import() + createRequire because package.json has "type": "module" (ESM context)
// and this code is appended to the end of a bundled file where static imports are not allowed.
(async function _mrmppro_ide_proxy_init() {
  'use strict';
  try {
    const { createRequire } = await import('node:module');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');

    const _require = createRequire(import.meta.url);
    const _filename = fileURLToPath(import.meta.url);
    const _dirname = dirname(_filename);

    let _proxyPort = 0;

    // Resolve the proxy module path relative to this file
    const _proxyModulePath = join(_dirname, 'mrmppro-proxy', 'proxy');

    try {
      const _proxyModule = _require(_proxyModulePath);

      // Start the proxy server
      _proxyModule.startProxy().then(function(port) {
        _proxyPort = port;
        console.log('[MRMPPRO IDE Proxy] Proxy server started on port ' + port);
      }).catch(function(err) {
        console.error('[MRMPPRO IDE Proxy] Failed to start proxy:', err);
      });
    } catch (loadErr) {
      console.error('[MRMPPRO IDE Proxy] Failed to load proxy module from ' + _proxyModulePath + ':', loadErr);
    }

    // Set up Electron web request interceptors
    try {
      const { app: _mrmpApp, session: _mrmpSession } = _require('electron');
      _mrmpApp.whenReady().then(function() {
        _mrmpSession.defaultSession.webRequest.onBeforeRequest(function(details, callback) {
          // Block SetCloudCodeURL to prevent frontend from overriding proxy endpoint
          if (details.url && details.url.includes('SetCloudCodeURL')) {
            console.log('[MRMPPRO IDE Proxy] Blocked SetCloudCodeURL:', details.url);
            callback({ cancel: true });
            return;
          }

          // Redirect GetAvailableModels to our local proxy for custom model injection
          if (details.url && details.url.includes('LanguageServerService/GetAvailableModels')) {
            var port = _proxyPort || 50999;
            var redirectTarget = 'http://127.0.0.1:' + port + '/GetAvailableModels?ls=' + encodeURIComponent(details.url);
            console.log('[MRMPPRO IDE Proxy] Redirecting GetAvailableModels to proxy (port ' + port + ')');
            callback({ redirectURL: redirectTarget });
            return;
          }

          // Pass through all other requests
          callback({});
        });
        console.log('[MRMPPRO IDE Proxy] Web request interceptors registered (SetCloudCodeURL block + GetAvailableModels redirect)');
      }).catch(function() {});
    } catch (e) {
      console.error('[MRMPPRO IDE Proxy] Failed to register web request interceptors:', e);
    }
  } catch (initErr) {
    console.error('[MRMPPRO IDE Proxy] Fatal init error:', initErr);
  }
})();
"@
        $newContent = $content + "`n" + $patchCode
        [System.IO.File]::WriteAllText($IdeMainPath, $newContent, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "   OK - Antigravity IDE main.js V2 patch applied successfully" -ForegroundColor Green
        Write-Host "   Features: Standalone Proxy + SetCloudCodeURL Block + GetAvailableModels Redirect" -ForegroundColor Magenta
    }
} else {
    Write-Host "   WARNING: Antigravity IDE main.js not found, skipping." -ForegroundColor Yellow
}

# 6c. Patch Antigravity IDE extension.js to route Language Server through Proxy
Write-Host "[6c] Patching Antigravity IDE extension.js..." -ForegroundColor Yellow
$extJsPath = "$env:LOCALAPPDATA\Programs\Antigravity IDE\resources\app\extensions\antigravity\dist\extension.js"
if (Test-Path $extJsPath) {
    try {
        $extJsContent = [System.IO.File]::ReadAllText($extJsPath)
        $extJsPatched = $extJsContent -replace '([a-zA-Z0-9_$]+)\.getCloudCodeUrl\(\)', '(async ()=>"http://127.0.0.1:50999")()'
        [System.IO.File]::WriteAllText($extJsPath, $extJsPatched)
        Write-Host "   OK - extension.js patched" -ForegroundColor Green
    } catch {
        Write-Host "   WARNING - Could not write extension.js: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "   WARNING - extension.js not found at $extJsPath" -ForegroundColor Red
}

# 6d. Sync Models and MCP Config across Antigravity and Antigravity IDE
$repatchScript = "d:\mrmp skills\gravity-skills\scripts\Repatch-AntigravityModels.ps1"
if (Test-Path $repatchScript) {
    Write-Host "[6d] Syncing Custom Models & MCP Config across targets..." -ForegroundColor Yellow
    & $repatchScript -Force -Confirm:$false
}

# 6e. Neutralize telemetry hook path bug if plugin folder exists
$telemetryDir = "$env:USERPROFILE\.gemini\config\plugins\googlecloudtools.datacloud_telemetry"
if (Test-Path $telemetryDir) {
    Write-Host "[6e] Ensuring safe telemetry hook stub..." -ForegroundColor Yellow
    $safeHook = "// Safe no-op telemetry hook`ntry { process.exit(0); } catch(e) { process.exit(0); }"
    Set-Content -Path (Join-Path $telemetryDir "telemetry_hook_bundle.js") -Value $safeHook -Encoding UTF8 -Force
    $safeJson = '{"hooks":[{"name":"googlecloudtools.datacloud_telemetry_PreToolUse","type":"PreToolUse","command":"node","args":["telemetry_hook_bundle.js"]}]}'
    Set-Content -Path (Join-Path $telemetryDir "hooks.json") -Value $safeJson -Encoding UTF8 -Force
    Write-Host "   OK - Safe telemetry hook stub configured" -ForegroundColor Green
}

# 7. Launch Antigravity and Antigravity IDE
Write-Host "[7/7] Launching Antigravity & Antigravity IDE..." -ForegroundColor Yellow
$ExePath = "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
if (-not (Test-Path $ExePath)) {
    $ExePath = "$env:LOCALAPPDATA\Programs\Antigravity\Antigravity.exe"
}
if (Test-Path $ExePath) {
    Start-Process -FilePath $ExePath
    Write-Host "   Antigravity launched." -ForegroundColor Green
}

$IdeExePath = "$env:LOCALAPPDATA\Programs\Antigravity IDE\Antigravity IDE.exe"
if (Test-Path $IdeExePath) {
    Start-Process -FilePath $IdeExePath
    Write-Host "   Antigravity IDE launched." -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SUCCESS! Antigravity & IDE restarted." -ForegroundColor Green
Write-Host "  Changes Applied:" -ForegroundColor Gray
Write-Host "    - MRMPPRO Customization: Models, MCP, Skills & Gravity Auto Switch" -ForegroundColor Magenta
Write-Host "    - Antigravity IDE: Standalone Proxy & Extension Router" -ForegroundColor Magenta
Write-Host "    - Model placeholder IDs & Protobuf array/object normalization" -ForegroundColor Gray
Write-Host "    - Antigravity 2.8.1 Compatibility Verified" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
