# FELÚT projekt letöltése az AI-Agent-Rendszer mellékes projektek mappájába
# Futtatás: jobb klikk a fájlon -> "Run with PowerShell"
# (vagy PowerShell ablakban: .\FELUT-mentes.ps1)

$cel = "C:\Users\ferenc.szegedi\OneDrive - AURAPRO Kft\AI-Agent-Rendszer\08-mellekes-projektek\FELUT-EU-Roma-Felzarkoztatasi-Program"
$url = "https://codeload.github.com/ferencszegedi-cmd/aurapro-website/zip/refs/heads/claude/eu-roma-felzarkoztatasi-program-pbhc0f"
$tmp = Join-Path $env:TEMP "felut-letoltes"

Write-Host "FELÚT projekt mentése..." -ForegroundColor Cyan

# ideiglenes mappa
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

# letöltés
$zip = Join-Path $tmp "felut.zip"
Write-Host "  Letöltés a GitHub-ról..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

# kicsomagolás
Write-Host "  Kicsomagolás..."
Expand-Archive -Path $zip -DestinationPath $tmp -Force

# a projektmappa megkeresése a kicsomagolt tartalomban
$forras = Get-ChildItem -Path $tmp -Directory -Recurse |
          Where-Object { $_.Name -eq "eu-roma-program" } |
          Select-Object -First 1

if (-not $forras) {
    Write-Host "HIBA: nem található az eu-roma-program mappa a letöltött csomagban." -ForegroundColor Red
    exit 1
}

# célmappa létrehozása és másolás
Write-Host "  Másolás ide: $cel"
New-Item -ItemType Directory -Path $cel -Force | Out-Null
Copy-Item -Path (Join-Path $forras.FullName "*") -Destination $cel -Recurse -Force

# takarítás
Remove-Item $tmp -Recurse -Force

Write-Host ""
Write-Host "KÉSZ! A projekt itt van:" -ForegroundColor Green
Write-Host "  $cel" -ForegroundColor Green
Write-Host ""
Get-ChildItem -Path $cel -Recurse -File | Select-Object FullName, Length | Format-Table -AutoSize

# mappa megnyitása
Start-Process explorer.exe $cel
