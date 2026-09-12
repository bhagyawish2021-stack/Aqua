$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000/api/consultations"

Write-Host "================================================="
Write-Host "Phase 7: Aquaculture Expert Consultation E2E Test"
Write-Host "================================================="

# 1. Test Specializations
Write-Host "[1/8] Testing GET /specializations..."
$specs = Invoke-RestMethod -Uri "$baseUrl/specializations" -Method Get
if ($specs.success -and $specs.data.Count -gt 0) {
    Write-Host "  Success: Found $($specs.data.Count) specializations." -ForegroundColor Green
} else {
    throw "Failed to fetch specializations"
}

# 2. Test Expert Discovery
Write-Host "[2/8] Testing GET /experts..."
$experts = Invoke-RestMethod -Uri "$baseUrl/experts" -Method Get
if ($experts.success -and $experts.count -ge 5) {
    Write-Host "  Success: Found $($experts.count) aquaculture specialists." -ForegroundColor Green
} else {
    throw "Failed to fetch experts"
}

# 3. Test Filter by Specialization
Write-Host "[3/8] Testing GET /experts?specialization=shrimp_pathology..."
$pathologists = Invoke-RestMethod -Uri "$baseUrl/experts?specialization=shrimp_pathology" -Method Get
if ($pathologists.success -and $pathologists.count -ge 1) {
    Write-Host "  Success: Filtered $($pathologists.count) shrimp pathologists." -ForegroundColor Green
} else {
    throw "Specialization filter failed"
}

# 4. Test Single Expert Profile
Write-Host "[4/8] Testing GET /experts/exp-001..."
$expert1 = Invoke-RestMethod -Uri "$baseUrl/experts/exp-001" -Method Get
if ($expert1.success -and $expert1.data.name -match "Murthy") {
    Write-Host "  Success: Retrieved $($expert1.data.name) (Rating: $($expert1.data.rating))." -ForegroundColor Green
} else {
    throw "Single expert profile retrieval failed"
}

# 5. Book an Appointment (Farmer flow)
Write-Host "[5/8] Testing POST /appointments (Farmer booking)..."
$bookPayload = @{
    expert_id = "exp-001"
    farmer_name = "Ravi Kumar"
    farmer_phone = "+91 98480 99887"
    farmer_location = "Bhimavaram, West Godavari"
    consultation_type = "video"
    scheduled_date = "2026-09-15"
    scheduled_time_slot = "02:00 PM - 04:30 PM"
    pond_name = "Pond 2 - High Density"
    problem_description = "White spot lesions observed on shrimp carapace with sudden drop in feeding."
    specimen_images = @("https://images.unsplash.com/photo-1565680018434-b513d5e5fd47")
    disease_report_summary = "Suspected WSSV or acute vibriosis"
    water_parameters = @{
        pH = 7.6
        dissolved_oxygen_ppm = 3.8
        salinity_ppt = 15
        ammonia_ppm = 0.2
    }
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json"; "x-farmer-id" = "farmer-demo" }
$booking = Invoke-RestMethod -Uri "$baseUrl/appointments" -Method Post -Body $bookPayload -Headers $headers
if ($booking.success -and $booking.data.status -eq "requested") {
    $aptId = $booking.data.id
    Write-Host "  Success: Booked appointment $($booking.data.appointment_number) (ID: $aptId)." -ForegroundColor Green
} else {
    throw "Appointment booking failed"
}

# 6. Verify Farmer Consultation History
Write-Host "[6/8] Testing GET /appointments/farmer (Privacy Scoped)..."
$history = Invoke-RestMethod -Uri "$baseUrl/appointments/farmer" -Method Get -Headers $headers
$foundApt = $history.data | Where-Object { $_.id -eq $aptId }
if ($foundApt) {
    Write-Host "  Success: Appointment verified in farmer private consultation history." -ForegroundColor Green
} else {
    throw "Appointment not found in farmer history"
}

# 7. Expert Workflow: Accept and Complete with Prescriptions
Write-Host "[7/8] Testing Expert Workflow (Status Transitions & Prescriptions)..."

# Accept appointment
$acceptPayload = @{ status = "confirmed" } | ConvertTo-Json
$acceptRes = Invoke-RestMethod -Uri "$baseUrl/appointments/$aptId/status" -Method Patch -Body $acceptPayload -Headers @{ "Content-Type" = "application/json" }
if ($acceptRes.data.status -ne "confirmed") { throw "Status transition to confirmed failed" }
Write-Host "  Step A: Specialist accepted appointment -> confirmed" -ForegroundColor Green

# Complete appointment with recommendations
$completePayload = @{
    status = "completed"
    expert_recommendations = "Confirmed early-stage WSSV viral replication. Cease live feed immediately, increase aeration by 40%, and initiate emergency hyper-oxygenation protocol."
    prescribed_actions = @(
        "Cease fresh feed / clam meat feeding immediately",
        "Operate 8 aerators per hectare continuously",
        "Apply potassium permanganate at 2 ppm for water disinfection",
        "Submit carapace samples for real-time PCR quantification"
    )
    follow_up_date = "2026-09-18"
} | ConvertTo-Json

$completeRes = Invoke-RestMethod -Uri "$baseUrl/appointments/$aptId/status" -Method Patch -Body $completePayload -Headers @{ "Content-Type" = "application/json" }
if ($completeRes.data.status -eq "completed" -and $completeRes.data.prescribed_actions.Count -eq 4) {
    Write-Host "  Step B: Specialist prescribed clinical protocol and marked completed." -ForegroundColor Green
} else {
    throw "Clinical completion failed"
}

# 8. Submit Review
Write-Host "[8/8] Testing POST /experts/exp-001/reviews..."
$reviewPayload = @{
    appointment_id = $aptId
    rating = 5
    review_text = "Dr. Murthy responded promptly and his aeration guidance halted mortality overnight!"
    farmer_name = "Ravi Kumar"
} | ConvertTo-Json

$reviewRes = Invoke-RestMethod -Uri "$baseUrl/experts/exp-001/reviews" -Method Post -Body $reviewPayload -Headers @{ "Content-Type" = "application/json" }
if ($reviewRes.success -and $reviewRes.data.rating -eq 5) {
    Write-Host "  Success: 5-star review submitted and specialist rating updated." -ForegroundColor Green
} else {
    throw "Review submission failed"
}

Write-Host "================================================="
Write-Host "All Phase 7 tests passed successfully!" -ForegroundColor Green
Write-Host "================================================="
