param([ValidateSet('start', 'test')][string]$Task = 'start')
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$portableJdk = Get-ChildItem (Join-Path $projectRoot '.tools/jdk') -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin/java.exe') } | Select-Object -First 1
if ($portableJdk) {
    $env:JAVA_HOME = $portableJdk.FullName
    $env:Path = "$env:JAVA_HOME/bin;$env:Path"
}
Push-Location (Join-Path $projectRoot 'server')
try {
    if ($Task -eq 'start') { & .\mvnw.cmd -B -ntp spring-boot:run }
    else { & .\mvnw.cmd -B -ntp verify }
    if ($LASTEXITCODE -ne 0) { throw "Java service command failed ($LASTEXITCODE). Java 21 and network access for the first dependency download are required." }
} finally { Pop-Location }
