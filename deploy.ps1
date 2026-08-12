# Antigravity Safe Deploy - Sadece dist klasorunu degistirir
# Orijinal app.asar yedekten geri yuklenir, dist guncellenir, tekrar paketlenir
# Bu scripti YENI bir PowerShell terminalinden calistirin!

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Antigravity Safe Deploy Script" -ForegroundColor Yellow
Write-Host "  MRMPPRO | Customization, MCP, Skills & Gravity Auto Switch" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Cyan

# 1. Antigravity'yi kapat
Write-Host ""
Write-Host "[1/7] Antigravity kapatiliyor..." -ForegroundColor Yellow
Get-Process -Name "Antigravity", "language_server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "   OK" -ForegroundColor Green

# 2. Yollari tanimla
$ProjectDir = $PSScriptRoot
$AsarPath = "$env:LOCALAPPDATA\Programs\antigravity\resources\app.asar"
$BackupAsar = "$AsarPath.backup"
$TempDir = Join-Path $env:TEMP "antigravity_safe_deploy"

# 3. Yedek kontrol - yoksa mevcut asar'i yedekle
$AsarUnpacked = "$AsarPath.unpacked"
$BackupAsarUnpacked = "$BackupAsar.unpacked"

if (Test-Path $AsarPath) {
    # Backup current app.asar if backup doesn't exist
    if (-not (Test-Path $BackupAsar)) {
        Write-Host "[2/7] Yedek yok - mevcuttan yedekleniyor..." -ForegroundColor Yellow
        Copy-Item $AsarPath $BackupAsar -Force
        Write-Host "   app.asar yedege kopyalandi." -ForegroundColor Green
    } else {
        Write-Host "[2/7] Orijinal app.asar yedege kopyalaniyor..." -ForegroundColor Yellow
        Copy-Item $AsarPath $BackupAsar -Force
    }

    # Ensure app.asar.unpacked is backed up and synced
    if (Test-Path $AsarUnpacked) {
        if (Test-Path $BackupAsarUnpacked) { Remove-Item $BackupAsarUnpacked -Recurse -Force }
        Copy-Item $AsarUnpacked $BackupAsarUnpacked -Recurse -Force
        Write-Host "   app.asar.unpacked yedege kopyalandi." -ForegroundColor Green
    }
} else {
    Write-Host "[2/7] HATA: app.asar bulunamadi: $AsarPath" -ForegroundColor Red
    exit 1
}

# 4. Gecici dizine asar'i ac (app.asar.unpacked tam uyumlu)
Write-Host "[3/7] app.asar aciliyor..." -ForegroundColor Yellow
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npx -y @electron/asar extract $AsarPath $TempDir

if ($LASTEXITCODE -ne 0) {
    Write-Host "   HATA: asar extract basarisiz! Yedekten geri acilmaya calisiliyor..." -ForegroundColor Red
    if (Test-Path $BackupAsar) {
        npx -y @electron/asar extract $BackupAsar $TempDir
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   HATA: Yedek asar extract de basarisiz!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   OK - Gecici dizin: $TempDir" -ForegroundColor Green

# 5. Sadece dist klasorunu projeden kopyala ve gereksizleri sil
Write-Host "[4/7] dist klasoru guncelleniyor ve gereksiz dosyalar temizleniyor..." -ForegroundColor Yellow
Write-Host "   MRMPPRO: Customization, MCP, Skills & Gravity Auto Switch hazirlaniyor..." -ForegroundColor Magenta

# Temizleme
if (Test-Path (Join-Path $TempDir ".git")) { Remove-Item (Join-Path $TempDir ".git") -Recurse -Force }
if (Test-Path (Join-Path $TempDir "scratch")) { Remove-Item (Join-Path $TempDir "scratch") -Recurse -Force }

$srcDist = Join-Path $ProjectDir "dist"
$destDist = Join-Path $TempDir "dist"

if (Test-Path $destDist) { Remove-Item $destDist -Recurse -Force }
Copy-Item $srcDist $destDist -Recurse -Force
Write-Host "   OK - dist kopyalandi. MRMPPRO customization patch hazir." -ForegroundColor Green

# repack.ps1 de kopyala (guncel versiyonu)
$srcRepack = Join-Path $ProjectDir "repack.ps1"
if (Test-Path $srcRepack) {
    Copy-Item $srcRepack (Join-Path $TempDir "repack.ps1") -Force
}

# 6. Tekrar paketle
Write-Host "[5/7] app.asar paketleniyor..." -ForegroundColor Yellow

# Paketleme - node_modules klasorunu asar icinde tut (tam boyut 2MB+ korunur)
npx -y @electron/asar pack $TempDir $AsarPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "   HATA: Paketleme basarisiz! Yedek geri yukleniyor..." -ForegroundColor Red
    Copy-Item $BackupAsar $AsarPath -Force
    if (Test-Path $BackupAsarUnpacked) {
        if (Test-Path $AsarUnpacked) { Remove-Item $AsarUnpacked -Recurse -Force }
        Copy-Item $BackupAsarUnpacked $AsarUnpacked -Recurse -Force
    }
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "   OK" -ForegroundColor Green

# Temizlik
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# Binary patch - fast string-based (covers Antigravity & Antigravity IDE)
Write-Host "[6/7] Language Server binary patch uygulaniyor (Antigravity & Antigravity IDE)..." -ForegroundColor Yellow
$OriginalUrl = "https://daily-cloudcode-pa.googleapis.com"
$PatchedUrl = "http://localhost:50999/v1internal/xxxxxxx"

$lsBinaries = Get-ChildItem -Path "$env:LOCALAPPDATA\Programs" -Recurse -Filter "*language_server*.exe" -ErrorAction SilentlyContinue

if ($lsBinaries.Count -gt 0) {
    Get-Process -Name "language_server*", "language_server_windows_x64*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500

    foreach ($bin in $lsBinaries) {
        $binPath = $bin.FullName
        Write-Host "   Kontrol ediliyor: $binPath..." -ForegroundColor Gray
        try {
            $outBytes = [System.IO.File]::ReadAllBytes($binPath)
            $content = [System.Text.Encoding]::ASCII.GetString($outBytes)

            if ($content.Contains($PatchedUrl)) {
                Write-Host "   OK - Zaten patch'li" -ForegroundColor Green
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
                        Write-Host "   OK - Binary patch uygulandi (offset: $offset)" -ForegroundColor Green
                    } else {
                        Write-Host "   HATA: Binary kilitli, patch yazilamadi!" -ForegroundColor Red
                    }
                } else {
                    Write-Host "   UYARI: Hardcoded URL bulunamadi! Binary patch atlandi." -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "   HATA: Binary okunamadi/yazilamadi ($binPath): $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   UYARI: HICBIR language_server*.exe bulunamadi!" -ForegroundColor Yellow
}

# 7. Antigravity'yi baslat
Write-Host "[7/7] Antigravity baslatiliyor..." -ForegroundColor Yellow
$ExePath = "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
if (Test-Path $ExePath) {
    Start-Process -FilePath $ExePath
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  BASARILI! Antigravity yeniden basladi." -ForegroundColor Green
    Write-Host "  Degisiklikler:" -ForegroundColor Gray
    Write-Host "    - MRMPPRO Customization: Models, MCP, Skills & Gravity Auto Switch" -ForegroundColor Magenta
    Write-Host "    - Model placeholder ID'leri (M400-M599) uyumlu hale getirildi" -ForegroundColor Gray
    Write-Host "    - deploy.ps1 ASAR extract ve binary patch hatalari giderildi" -ForegroundColor Gray
    Write-Host "============================================" -ForegroundColor Cyan
} else {
    Write-Host "  Uyari: Antigravity.exe bulunamadi. Manuel baslatin." -ForegroundColor Yellow
}