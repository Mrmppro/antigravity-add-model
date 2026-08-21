# Antigravity IDE Safe Deploy
# Only modifies Antigravity IDE application

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Antigravity IDE Deploy Script" -ForegroundColor Yellow
Write-Host "  MRMPPRO | IDE Custom Models & Standalone Proxy" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Cyan

# 1. Close Antigravity IDE Only
Write-Host ""
Write-Host "[1/5] Closing Antigravity IDE..." -ForegroundColor Yellow
taskkill /F /IM "Antigravity IDE.exe" /T 2>$null | Out-Null
taskkill /F /IM "language_server_windows_x64.exe" /T 2>$null | Out-Null
$ideProcs = Get-Process -Name "Antigravity IDE*", "language_server_windows_x64*" -ErrorAction SilentlyContinue
if ($ideProcs) { $ideProcs | Stop-Process -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1
Write-Host "   OK" -ForegroundColor Green

# 2. Define paths
$ProjectDir = $PSScriptRoot
$IdeAppDir = "$env:LOCALAPPDATA\Programs\Antigravity IDE\resources\app"
$IdeMainPath = "$IdeAppDir\out\main.js"
$IdeProxyDir = "$IdeAppDir\out\mrmppro-proxy"

if (-not (Test-Path $IdeMainPath)) {
    Write-Host "ERROR: Antigravity IDE not found at: $IdeAppDir" -ForegroundColor Red
    exit 1
}

# 3. Copy proxy modules to IDE
Write-Host "[2/5] Copying proxy modules to Antigravity IDE..." -ForegroundColor Yellow
if (Test-Path $IdeProxyDir) { Remove-Item $IdeProxyDir -Recurse -Force }
New-Item -ItemType Directory -Path $IdeProxyDir -Force | Out-Null

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

foreach ($subDir in @("proxy", "autoSwitch", "services")) {
    $srcSub = Join-Path $ProjectDir "dist\$subDir"
    $destSub = Join-Path $IdeProxyDir $subDir
    if (Test-Path $srcSub) {
        Copy-Item $srcSub $destSub -Recurse -Force
    }
}

# Copy electron-log to IDE node_modules
$IdeElectronLog = "$IdeAppDir\node_modules\electron-log"
if (-not (Test-Path $IdeElectronLog)) {
    $srcElectronLog = Join-Path $ProjectDir "node_modules\electron-log"
    if (Test-Path $srcElectronLog) {
        Copy-Item $srcElectronLog $IdeElectronLog -Recurse -Force
    }
}
Write-Host "   OK" -ForegroundColor Green

# 4. Patch main.js with self-sufficient proxy startup
Write-Host "[3/5] Patching Antigravity IDE main.js..." -ForegroundColor Yellow
$content = [System.IO.File]::ReadAllText($IdeMainPath)
$patchMarker = "// MRMPPRO_SELF_SUFFICIENT_PROXY_V2"
$oldPatchMarker = "// MRMPPRO_GET_AVAILABLE_MODELS_INTERCEPT"

if ($content.Contains($patchMarker)) {
    $markerIdx = $content.IndexOf($patchMarker)
    $content = $content.Substring(0, $markerIdx).TrimEnd()
} elseif ($content.Contains($oldPatchMarker)) {
    $markerIdx = $content.IndexOf($oldPatchMarker)
    $content = $content.Substring(0, $markerIdx).TrimEnd()
}

$patchCode = @"

$patchMarker
// MRMPPRO Self-Sufficient Proxy for Antigravity IDE
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
    const _proxyModulePath = join(_dirname, 'mrmppro-proxy', 'proxy');

    try {
      const _proxyModule = _require(_proxyModulePath);
      _proxyModule.startProxy().then(function(port) {
        _proxyPort = port;
        console.log('[MRMPPRO IDE Proxy] Proxy server started on port ' + port);
      }).catch(function(err) {
        console.error('[MRMPPRO IDE Proxy] Failed to start proxy:', err);
      });
    } catch (loadErr) {
      console.error('[MRMPPRO IDE Proxy] Failed to load proxy module:', loadErr);
    }

    try {
      const { app: _mrmpApp, session: _mrmpSession } = _require('electron');
      _mrmpApp.whenReady().then(function() {
        _mrmpSession.defaultSession.webRequest.onBeforeRequest(function(details, callback) {
          if (details.url && details.url.includes('SetCloudCodeURL')) {
            callback({ cancel: true });
            return;
          }
          if (details.url && details.url.includes('LanguageServerService/GetAvailableModels')) {
            var port = _proxyPort || 50999;
            var redirectTarget = 'http://127.0.0.1:' + port + '/GetAvailableModels?ls=' + encodeURIComponent(details.url);
            callback({ redirectURL: redirectTarget });
            return;
          }
          callback({});
        });
      }).catch(function() {});
    } catch (e) {
      console.error('[MRMPPRO IDE Proxy] Interceptor error:', e);
    }
  } catch (initErr) {
    console.error('[MRMPPRO IDE Proxy] Fatal init error:', initErr);
  }
})();
"@

$newContent = $content + "`n" + $patchCode
[System.IO.File]::WriteAllText($IdeMainPath, $newContent, (New-Object System.Text.UTF8Encoding $false))
Write-Host "   OK - main.js patched" -ForegroundColor Green

# 5. Patch extension.js
Write-Host "[4/5] Patching Antigravity IDE extension.js..." -ForegroundColor Yellow
$extJsPath = "$IdeAppDir\extensions\antigravity\dist\extension.js"
if (Test-Path $extJsPath) {
    try {
        $extJsContent = [System.IO.File]::ReadAllText($extJsPath)
        $extJsPatched = $extJsContent -replace '([a-zA-Z0-9_$]+)\.getCloudCodeUrl\(\)', '(async ()=>"http://127.0.0.1:50999")()'
        [System.IO.File]::WriteAllText($extJsPath, $extJsPatched)
        Write-Host "   OK - extension.js patched" -ForegroundColor Green
    } catch {
        Write-Host "   WARNING - Could not write extension.js: $_" -ForegroundColor Yellow
    }
}

# Patch IDE Binary if present
$ideLs = "$IdeAppDir\extensions\antigravity\bin\language_server_windows_x64.exe"
if (Test-Path $ideLs) {
    $OriginalUrl = "https://daily-cloudcode-pa.googleapis.com"
    $PatchedUrl = "http://localhost:50999/v1internal/xxxxxxx"
    try {
        $outBytes = [System.IO.File]::ReadAllBytes($ideLs)
        $content = [System.Text.Encoding]::ASCII.GetString($outBytes)
        if (-not $content.Contains($PatchedUrl)) {
            $offset = $content.IndexOf($OriginalUrl, [System.StringComparison]::Ordinal)
            if ($offset -ge 0) {
                $LsBackup = "$ideLs.bak"
                if (-not (Test-Path $LsBackup)) { Copy-Item $ideLs $LsBackup -Force }
                $replaceBytes = [System.Text.Encoding]::ASCII.GetBytes($PatchedUrl)
                [System.Array]::Copy($replaceBytes, 0, $outBytes, $offset, $replaceBytes.Length)
                [System.IO.File]::WriteAllBytes($ideLs, $outBytes)
                Write-Host "   OK - IDE Language Server binary patched" -ForegroundColor Green
            }
        }
    } catch {}
}

# Sync Models & MCP Config
Write-Host "[5/5] Syncing Custom Models & MCP Config..." -ForegroundColor Yellow
$repatchScript = "d:\mrmp skills\gravity-skills\scripts\Repatch-AntigravityModels.ps1"
if (Test-Path $repatchScript) {
    & $repatchScript -Force -Confirm:$false
}

# Launch IDE
$IdeExePath = "$env:LOCALAPPDATA\Programs\Antigravity IDE\Antigravity IDE.exe"
if (Test-Path $IdeExePath) {
    Start-Process -FilePath $IdeExePath
    Write-Host "   Antigravity IDE launched." -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SUCCESS! Antigravity IDE repatched." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
