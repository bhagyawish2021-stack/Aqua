Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AQUAMITRA PHASE 10: COMPLETE FARMER DASHBOARD TEST    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$allPassed = $true

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [scriptblock]$Validate = $null
    )

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body) { 
            $params.Body = $Body
            $params.ContentType = "application/json"
        }

        $res = Invoke-RestMethod @params
        $success = $true
        $msg = "OK"

        if ($Validate) {
            $valResult = & $Validate $res
            if ($valResult -ne $true) {
                $success = $false
                $msg = "Validation failed: $valResult"
            }
        }

        if ($success) {
            Write-Host "  [PASS] $Name" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [FAIL] $Name - $msg" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "  [FAIL] $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n--- 1. Testing Unified Overview (16 Modules) ---" -ForegroundColor Yellow

$p1 = Test-Endpoint -Name "Farmer Overview with Default Preferences" `
    -Url "$baseUrl/dashboard/overview" `
    -Validate {
        param($res)
        if (-not $res.success) { return "success is false" }
        if (-not $res.myPonds -and -not $res.ponds_summary) { return "missing ponds" }
        if (-not $res.waterQuality -and -not $res.water_quality) { return "missing waterQuality" }
        if (-not $res.diseaseRisk -and -not $res.disease_risk) { return "missing diseaseRisk" }
        if (-not $res.aiDiseaseReports -and -not $res.ai_disease_reports) { return "missing aiDiseaseReports" }
        if (-not $res.preventiveActions -and -not $res.preventive_actions) { return "missing preventiveActions" }
        if (-not $res.currentPrices -and -not $res.market_prices) { return "missing currentPrices" }
        if (-not $res.priceTrends -and -not $res.price_trends) { return "missing priceTrends" }
        if (-not $res.nearbyHatcheries -and -not $res.nearby_hatcheries) { return "missing nearbyHatcheries" }
        if (-not $res.availableSeed -and -not $res.available_seed) { return "missing availableSeed" }
        if (-not $res.availableWorkers -and -not $res.available_workers) { return "missing availableWorkers" }
        if (-not $res.machineryMarketplace -and -not $res.machinery_marketplace) { return "missing machineryMarketplace" }
        if (-not $res.expertConsultation -and -not $res.expert_consultations) { return "missing expertConsultation" }
        if (-not $res.farmSupplies -and -not $res.farm_supplies) { return "missing farmSupplies" }
        if (-not $res.mySeafoodListings -and -not $res.seafood_listings) { return "missing mySeafoodListings" }
        if (-not $res.interestedBuyers -and -not $res.buyer_offers) { return "missing interestedBuyers" }
        if (-not $res.notifications) { return "missing notifications" }
        return $true
    }

$p2 = Test-Endpoint -Name "Farmer Overview with Personalized Filters (West Godavari + Tiger Prawn)" `
    -Url "$baseUrl/dashboard/overview?district=West%20Godavari&species=Tiger%20Prawn" `
    -Validate {
        param($res)
        if ($res.preferences.district -ne "West Godavari") { return "district mismatch" }
        if ($res.preferences.species -ne "Tiger Prawn") { return "species mismatch" }
        return $true
    }

Write-Host "`n--- 2. Testing 7 Role-Based Dashboards ---" -ForegroundColor Yellow

$roles = @('farmer', 'worker', 'hatchery', 'seller', 'buyer', 'expert', 'admin')
foreach ($r in $roles) {
    $pr = Test-Endpoint -Name "Role View: $r" `
        -Url "$baseUrl/dashboard/role-view?role=$r&district=Krishna" `
        -Validate {
            param($res)
            if (-not $res.success) { return "success is false" }
            if ($res.data.role -ne $r) { return "role mismatch: expected $r got $($res.data.role)" }
            return $true
        }
    if (-not $pr) { $allPassed = $false }
}

Write-Host "`n--- 3. Testing Notification Center Actions ---" -ForegroundColor Yellow

$pNotif = Test-Endpoint -Name "Mark Notification as Read" `
    -Url "$baseUrl/dashboard/notifications/notif-1/read" `
    -Method "PATCH" `
    -Validate {
        param($res)
        if (-not $res.success) { return "success is false" }
        if ($res.data.is_read -ne $true -and $res.data.read -ne $true) { return "read was not true" }
        return $true
    }

Write-Host "`n--- 4. Cross-Module Service Integration Checks ---" -ForegroundColor Yellow

$pAqua = Test-Endpoint -Name "Phase 1: AquaSangham Live Prices" -Url "$baseUrl/market/aquasangham/live" -Validate { param($res) return $res.success }
$pJobs = Test-Endpoint -Name "Phase 2: Jobs & Workers Service" -Url "$baseUrl/jobs" -Validate { param($res) return $res.success }
$pEq = Test-Endpoint -Name "Phase 3: Machinery & Equipment Listings" -Url "$baseUrl/equipment" -Validate { param($res) return $res.success }
$pHatch = Test-Endpoint -Name "Phase 4: Hatchery & Seed Marketplace" -Url "$baseUrl/hatcheries" -Validate { param($res) return $res.success }
$pDis = Test-Endpoint -Name "Phase 5: Disease Screening History" -Url "$baseUrl/disease/history" -Validate { param($res) return $res.success }
$pPrev = Test-Endpoint -Name "Phase 6: Preventive Health History" -Url "$baseUrl/prevention/history" -Validate { param($res) return $res.success }
$pExp = Test-Endpoint -Name "Phase 7: Expert Advisory Directory" -Url "$baseUrl/consultations/experts" -Validate { param($res) return $res.success }
$pSup = Test-Endpoint -Name "Phase 8: Aquaculture Farm Supplies" -Url "$baseUrl/supplies/products" -Validate { param($res) return $res.success }
$pSea = Test-Endpoint -Name "Phase 9: Seafood Harvest Listings" -Url "$baseUrl/seafood/listings" -Validate { param($res) return $res.success }

Write-Host "`n========================================================" -ForegroundColor Cyan
if ($p1 -and $p2 -and $allPassed -and $pNotif -and $pAqua -and $pJobs -and $pEq -and $pHatch -and $pDis -and $pPrev -and $pExp -and $pSup -and $pSea) {
    Write-Host "  >>> ALL PHASE 10 DASHBOARD TESTS PASSED! <<< " -ForegroundColor Green
} else {
    Write-Host "  >>> SOME TESTS FAILED! <<< " -ForegroundColor Red
}
Write-Host "========================================================" -ForegroundColor Cyan
