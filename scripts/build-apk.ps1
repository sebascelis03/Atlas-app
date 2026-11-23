# =============================================================================
# Script Automatizado de Empaquetado y Exportación de APK para ATLAS (JS -> APK)
# Compila el bundle web con Vite, sincroniza Capacitor y genera ATLAS-debug.apk
# usando JDK 23 (compatible con Gradle 8.10.2) y el Android SDK local.
# =============================================================================

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== [1/4] Compilando aplicacion web con Vite (npm run build) ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "Error en npm run build" }

Write-Host "=== [2/4] Sincronizando assets y plugins con Capacitor Android ===" -ForegroundColor Cyan
if (-not (Test-Path "$ProjectRoot\android")) {
    npx cap add android
} else {
    npx cap sync android
}
if ($LASTEXITCODE -ne 0) { throw "Error en npx cap sync android" }

Write-Host "=== [3/4] Configurando JAVA_HOME y ANDROID_HOME ===" -ForegroundColor Cyan
$Jdk23Path = "C:\Program Files\Java\jdk-23"
$JbrPath = "C:\Program Files\Android\Android Studio\jbr"

if (Test-Path "$Jdk23Path\bin\java.exe") {
    $env:JAVA_HOME = $Jdk23Path
    $env:PATH = "$Jdk23Path\bin;$env:PATH"
    Write-Host "Usando JDK 23: $Jdk23Path" -ForegroundColor Green
} elseif (Test-Path "$JbrPath\bin\java.exe") {
    $env:JAVA_HOME = $JbrPath
    $env:PATH = "$JbrPath\bin;$env:PATH"
    Write-Host "Usando JDK de Android Studio (JBR): $JbrPath" -ForegroundColor Green
}

$SdkPath = "C:\Users\HP INC\AppData\Local\Android\Sdk"
if (Test-Path $SdkPath) {
    $env:ANDROID_HOME = $SdkPath
    $env:ANDROID_SDK_ROOT = $SdkPath
    $EscapedSdk = $SdkPath.Replace("\", "\\").Replace(":", "\:")
    Set-Content -Path "$ProjectRoot\android\local.properties" -Value "sdk.dir=$EscapedSdk" -Encoding ASCII
    Write-Host "Usando Android SDK: $SdkPath" -ForegroundColor Green
}

Write-Host "=== [4/4] Compilando APK con Gradle CLI (assembleDebug) ===" -ForegroundColor Cyan
Set-Location "$ProjectRoot\android"
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) { throw "Error al compilar el APK con Gradle" }

Set-Location $ProjectRoot
$GeneratedApk = "$ProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
$DestApk = "$ProjectRoot\ATLAS-debug.apk"

if (Test-Path $GeneratedApk) {
    Copy-Item -Path $GeneratedApk -Destination $DestApk -Force
    $SizeMb = [Math]::Round((Get-Item $DestApk).Length / 1MB, 2)
    Write-Host ""
    Write-Host "=============================================================" -ForegroundColor Green
    Write-Host " APK GENERADO CON EXITO: $DestApk ($SizeMb MB)" -ForegroundColor Green
    Write-Host "=============================================================" -ForegroundColor Green
} else {
    throw "No se encontro el archivo APK esperado en $GeneratedApk"
}
