#Requires -Version 5.1
# FideliOS zero-knowledge Windows installer
# Usage: iwr -useb https://fidelios.nl/install.ps1 | iex
#        iwr -useb https://fidelios.nl/install.ps1 | iex; fidelios onboard
$ErrorActionPreference = "Stop"

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Info    { param([string]$Msg) Write-Host "  -> $Msg" -ForegroundColor Cyan }
function Write-Success { param([string]$Msg) Write-Host "  OK $Msg" -ForegroundColor Green }
function Write-Warn    { param([string]$Msg) Write-Host "  !! $Msg" -ForegroundColor Yellow }
function Write-Err     { param([string]$Msg) Write-Host "  XX $Msg" -ForegroundColor Red }
function Write-Header  { param([string]$Msg) Write-Host "`n$Msg" -ForegroundColor White }

function Refresh-Path {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath    = [System.Environment]::GetEnvironmentVariable("Path", "User")
    if ($machinePath -and $userPath) {
        $env:Path = "$machinePath;$userPath"
    } elseif ($machinePath) {
        $env:Path = $machinePath
    } elseif ($userPath) {
        $env:Path = $userPath
    }
}

# ── Banner ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  +-------------------------------------+" -ForegroundColor Cyan
Write-Host "  |    FideliOS Windows Installer       |" -ForegroundColor Cyan
Write-Host "  +-------------------------------------+" -ForegroundColor Cyan
Write-Host ""

# ── Execution policy ─────────────────────────────────────────────────────────
# npm.ps1 (and nvm.ps1) are .ps1 files on disk — they are blocked when the
# current-user execution policy is "Restricted" (the Windows default). The
# script itself runs fine because it is piped into iex (never written to disk),
# but any .ps1 wrappers that npm/nvm drop into PATH will fail without this.
# Scope CurrentUser avoids requiring admin rights; RemoteSigned allows
# locally-created scripts and signed scripts downloaded from the internet.
try {
    $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
    if ($currentPolicy -eq "Restricted" -or $currentPolicy -eq "Undefined") {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Success "Execution policy set to RemoteSigned (CurrentUser)"
    }
} catch {
    Write-Warn "Could not set execution policy: $_"
    Write-Warn "If npm install fails, run this first:"
    Write-Warn "  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
}

# ── Step 1: Check / install Node.js ───────────────────────────────────────────
Write-Header "Checking Node.js..."
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if ($nodeCmd) {
    $nodeVersion = & node --version 2>$null
    Write-Success "Node.js already installed ($nodeVersion)"
} else {
    Write-Warn "Node.js not found. Installing..."

    # winget is only available in interactive user sessions on client Windows;
    # it's absent on Windows Server SKUs and in SYSTEM contexts. Try it first,
    # fall through to nvm-windows (which always works) on any failure.
    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCmd) {
        Write-Info "Installing Node.js LTS via winget..."
        try {
            & winget install --id OpenJS.NodeJS.LTS --silent `
                --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Null
        } catch {
            Write-Warn "winget install returned an error: $_"
        }
        Refresh-Path
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Info "Installing Node.js via nvm-windows (silent)..."
        $nvmInstallerUrl  = "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe"
        $nvmInstallerPath = Join-Path $env:TEMP "nvm-setup.exe"
        Invoke-WebRequest -Uri $nvmInstallerUrl -OutFile $nvmInstallerPath -UseBasicParsing

        # nvm-windows uses Inno Setup — correct silent flags are VERYSILENT +
        # SUPPRESSMSGBOXES + NORESTART. Plain /SILENT displays UI and is what
        # previously hung SSM/unattended installs.
        $p = Start-Process -FilePath $nvmInstallerPath `
            -ArgumentList "/VERYSILENT","/SUPPRESSMSGBOXES","/NORESTART","/SP-" `
            -Wait -PassThru
        if ($p.ExitCode -ne 0) {
            Write-Err "nvm-windows installer exited $($p.ExitCode)"
            exit 1
        }

        # Installer sets NVM_HOME + NVM_SYMLINK as machine env vars and
        # prepends both to PATH. They won't be visible in the current session
        # until we reload from the registry — and even then `Get-Command nvm`
        # sometimes fails because the new PATH entries aren't indexed yet.
        # Invoke nvm via its full path to sidestep both issues.
        Start-Sleep -Seconds 2
        Refresh-Path
        $env:NVM_HOME    = [System.Environment]::GetEnvironmentVariable("NVM_HOME","Machine")
        $env:NVM_SYMLINK = [System.Environment]::GetEnvironmentVariable("NVM_SYMLINK","Machine")

        $nvmExe = Join-Path $env:NVM_HOME "nvm.exe"
        if (-not (Test-Path $nvmExe)) {
            Write-Err "nvm.exe not found at $nvmExe after installer. NVM_HOME=$env:NVM_HOME"
            exit 1
        }

        # Also force NVM_HOME + NVM_SYMLINK into the current session PATH so
        # the subsequent `node` / `npm` calls resolve.
        $env:Path = "$env:NVM_HOME;$env:NVM_SYMLINK;$env:Path"

        Write-Info "Installing Node.js LTS via nvm..."
        & $nvmExe install lts 2>&1 | ForEach-Object { Write-Host "    $_" }
        & $nvmExe use lts    2>&1 | ForEach-Object { Write-Host "    $_" }
        Refresh-Path
        $env:Path = "$env:NVM_HOME;$env:NVM_SYMLINK;$env:Path"
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Err "Node.js is still not on PATH after installation."
        Write-Err "Open a NEW PowerShell window and run: node --version"
        Write-Err "If that fails too: https://nodejs.org/en/download"
        exit 1
    }
    Write-Success "Node.js installed ($((& node --version).Trim()))"
}

# ── Step 2: Install the FideliOS CLI globally ─────────────────────────────────
Write-Header "Installing FideliOS CLI..."
$existing = Get-Command fidelios -ErrorAction SilentlyContinue
if ($existing) {
    $currentVersion = & fidelios --version 2>$null
    Write-Info "Updating FideliOS CLI (current: $currentVersion)..."
} else {
    Write-Info "Installing FideliOS CLI..."
}

& npm install -g fidelios@latest
if ($LASTEXITCODE -ne 0) {
    Write-Err "npm install -g fidelios@latest failed. If you see EACCES/permission errors, run 'npm config set prefix %USERPROFILE%\.npm-global' and re-run this script."
    exit 1
}
Refresh-Path

$newVersion = & fidelios --version 2>$null
if (-not $newVersion) {
    Write-Err "fidelios command not on PATH after install. Open a new PowerShell window and run 'fidelios --version'."
    exit 1
}
Write-Success "FideliOS CLI ready ($newVersion)"

# ── Step 3: Setup wizard (interactive only) ───────────────────────────────────
$INTERACTIVE = [Environment]::UserInteractive -and $Host.UI.RawUI -ne $null -and -not $env:NONINTERACTIVE
Write-Header "Starting FideliOS setup..."
if ($INTERACTIVE) {
    Write-Info "Running interactive setup wizard..."
    Write-Host ""
    & fidelios onboard
} else {
    Write-Warn "Non-interactive shell detected — skipping the setup wizard."
    Write-Host ""
    Write-Host "  Next step (run in a real PowerShell window):" -ForegroundColor DarkGray
    Write-Host "     fidelios onboard" -ForegroundColor White
    Write-Host ""
}

# ── Step 4: Keep running after you close PowerShell? ────────────────────────
#
# In interactive mode we offer to make FideliOS start on every sign-in so it
# survives closing PowerShell / shutting down the PC. Non-interactive pipe
# installs skip this step (no consent available).
if ($INTERACTIVE) {
    Write-Header "Should FideliOS keep running on its own?"
    Write-Host ""
    Write-Host "  Without this, FideliOS stops the moment you:" -ForegroundColor DarkGray
    Write-Host "     * close this PowerShell window" -ForegroundColor DarkGray
    Write-Host "     * restart or shut down your PC" -ForegroundColor DarkGray
    Write-Host "     * sign out of Windows" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  If we set it up, your AI agents keep working 24/7 in the" -ForegroundColor DarkGray
    Write-Host "  background. You don't have to open PowerShell again." -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  (You can change this later — see the link at the end.)" -ForegroundColor DarkGray
    Write-Host ""
    $answer = Read-Host "  Keep FideliOS running automatically? [y/N]"
    if ($answer -match '^(y|Y|yes|YES)$') {
        $fideliosPath = (Get-Command fidelios -ErrorAction SilentlyContinue).Source
        if (-not $fideliosPath) {
            Write-Err "Could not locate fidelios on PATH. Skipping."
        } else {
            # fidelios.cmd wraps fidelios.js on Windows — invoke directly
            try {
                $action    = New-ScheduledTaskAction -Execute $fideliosPath -Argument "run"
                $trigger   = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERNAME"
                $settings  = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
                $principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Limited
                Register-ScheduledTask -TaskName "FideliOS" -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
                Write-Success "Done — FideliOS will start on its own when you sign in."
                Write-Host "  No need to keep PowerShell open anymore." -ForegroundColor DarkGray
                Write-Host "  Manage later: Task Scheduler (taskschd.msc) -> FideliOS" -ForegroundColor DarkGray
            } catch {
                Write-Err "Could not set up auto-start: $_"
                Write-Host "  See: https://docs.fidelios.nl/start/keep-running" -ForegroundColor DarkGray
            }
        }
    } else {
        Write-Warn "Skipped - FideliOS will stop when you close this PowerShell."
        Write-Host "  To start it again, open PowerShell and type: " -NoNewline -ForegroundColor DarkGray
        Write-Host "fidelios run" -ForegroundColor White
        Write-Host ""
        Write-Host "  To make it run automatically later (recommended), see:" -ForegroundColor DarkGray
        Write-Host "     https://docs.fidelios.nl/start/keep-running" -ForegroundColor White
    }
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  OK FideliOS installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Start FideliOS with: " -NoNewline -ForegroundColor DarkGray
Write-Host "fidelios run" -ForegroundColor White
Write-Host "  Then open:            " -NoNewline -ForegroundColor DarkGray
Write-Host "http://127.0.0.1:3100" -ForegroundColor White
Write-Host ""
Write-Host "  To keep it running after closing PowerShell: https://docs.fidelios.nl/start/keep-running" -ForegroundColor DarkGray
Write-Host ""
