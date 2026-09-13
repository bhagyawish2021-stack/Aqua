Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AQUAMITRA PRODUCTION-READINESS AUDIT VERIFICATION     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$allPassed = $true

function Assert-Test {
    param([string]$Name, [bool]$Condition, [string]$Details = "")
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $Name - $Details" -ForegroundColor Red
        $script:allPassed = $false
    }
}

# 1. Health & Server Telemetry
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 5
    Assert-Test -Name "Server Healthcheck Endpoint" ($health.success -eq $true -and $health.data.status -eq "OK")
} catch {
    Assert-Test -Name "Server Healthcheck Endpoint" $false $_.Exception.Message
}

# 2. Authentication: Sign In
try {
    $loginBody = '{"email":"farmer@aquamitra.com","password":"password123"}'
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 5
    $token = $loginRes.data.token
    Assert-Test -Name "Authentication: Demo Farmer Login" ($loginRes.success -eq $true -and $token -ne $null)
    Assert-Test -Name "Auth Payload: User Profile & Role" ($loginRes.data.user.name -eq "Aqua Farmer" -and $loginRes.data.user.role -eq "farmer")
} catch {
    Assert-Test -Name "Authentication: Demo Farmer Login" $false $_.Exception.Message
}

# 3. Ponds & Telemetry Persistence
try {
    $ponds = Invoke-RestMethod -Uri "$baseUrl/ponds" -TimeoutSec 5
    Assert-Test -Name "Pond Management: List Ponds" ($ponds.success -eq $true -and $ponds.data.Length -ge 3)

    $pondId = $ponds.data[0].id
    $wq = Invoke-RestMethod -Uri "$baseUrl/ponds/$pondId/water-quality" -TimeoutSec 5
    Assert-Test -Name "Telemetry: Water Quality Records" ($wq.success -eq $true -and $wq.data.Length -ge 1)

    $feed = Invoke-RestMethod -Uri "$baseUrl/ponds/$pondId/feed" -TimeoutSec 5
    Assert-Test -Name "Telemetry: Feed Management Records" ($feed.success -eq $true -and $feed.data.Length -ge 1)

    $growth = Invoke-RestMethod -Uri "$baseUrl/ponds/$pondId/growth" -TimeoutSec 5
    Assert-Test -Name "Telemetry: Growth Logs & ABW" ($growth.success -eq $true -and $growth.data.Length -ge 1)

    $biz = Invoke-RestMethod -Uri "$baseUrl/ponds/$pondId/business/summary" -TimeoutSec 5
    Assert-Test -Name "Telemetry: Business Financial Summary" ($biz.success -eq $true -and $biz.data.totalExpenses -ge 0)
} catch {
    Assert-Test -Name "Ponds & Telemetry Endpoints" $false $_.Exception.Message
}

# 4. Profile Management & In-Memory Update Fallback
try {
    $prof = Invoke-RestMethod -Uri "$baseUrl/profile" -TimeoutSec 5
    Assert-Test -Name "Profile: Fetch User Profile" ($prof.success -eq $true -and $prof.data.name -ne $null)

    $updateBody = '{"name":"Aqua Farmer (Verified)","phone":"+91 98480 99887","village":"Bhimavaram"}'
    $updateRes = Invoke-RestMethod -Uri "$baseUrl/profile" -Method PUT -Body $updateBody -ContentType "application/json" -TimeoutSec 5
    Assert-Test -Name "Profile: Update Profile with Fallback" ($updateRes.success -eq $true -and $updateRes.data.name -eq "Aqua Farmer (Verified)")
} catch {
    Assert-Test -Name "Profile Management" $false $_.Exception.Message
}

# 5. Rate Limiting Calibration Check (Send 120 rapid requests)
try {
    $rateLimitOk = $true
    for ($i = 0; $i -lt 120; $i++) {
        $r = Invoke-RestMethod -Uri "$baseUrl/dashboard/role-view?role=farmer" -TimeoutSec 5
        if (-not $r.success) { $rateLimitOk = $false; break }
    }
    Assert-Test -Name "Rate Limiter: Allows 120+ Rapid Dashboard Requests" $rateLimitOk
} catch {
    Assert-Test -Name "Rate Limiter: Rapid Requests" $false $_.Exception.Message
}

# 6. ML Service Proxy Health
try {
    $mlHealth = Invoke-RestMethod -Uri "$baseUrl/ml/health" -TimeoutSec 5
    Assert-Test -Name "ML Prediction: FastAPI Health Proxy" ($mlHealth.success -eq $true -and $mlHealth.data.mlService -eq "available")
} catch {
    Assert-Test -Name "ML Service Proxy" $false $_.Exception.Message
}

# 7. Error Handling & 404 Route Check
try {
    $r404 = Invoke-RestMethod -Uri "$baseUrl/non-existent-route-audit" -TimeoutSec 5
    Assert-Test -Name "Error Handling: 404 Response" $false "Should have failed with 404"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Error Handling: 404 Structured API Error" ($statusCode -eq 404)
}

Write-Host "`n========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  >>> ALL AUDIT CHECKS PASSED SUCCESSFULLY! <<< " -ForegroundColor Green
} else {
    Write-Host "  >>> AUDIT DETECTED FAILURES! <<< " -ForegroundColor Red
}
Write-Host "========================================================" -ForegroundColor Cyan
