$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000/api/seafood"

Write-Host "=========================================================="
Write-Host "Phase 9: Direct Seafood Sales & Buyer Marketplace E2E Test"
Write-Host "=========================================================="

# 1. Test Taxonomy
Write-Host "[1/8] Testing GET /taxonomy..."
$tax = Invoke-RestMethod -Uri "$baseUrl/taxonomy" -Method Get
if ($tax.success -and $tax.data.species.Count -ge 7 -and $tax.data.buyer_types.Count -ge 5) {
    Write-Host "  Success: Taxonomy retrieved (Species: $($tax.data.species.Count), Buyer Types: $($tax.data.buyer_types.Count))." -ForegroundColor Green
} else {
    throw "Taxonomy retrieval failed"
}

# 2. Test Listings with Location & Haversine Distance
Write-Host "[2/8] Testing GET /listings with Buyer Coordinates (Location Discovery)..."
# Visakhapatnam export hub coordinates
$vizagLat = 17.6868
$vizagLng = 83.2185
$listingsRes = Invoke-RestMethod -Uri "$baseUrl/listings?lat=$vizagLat&lng=$vizagLng" -Method Get
if ($listingsRes.success -and $listingsRes.count -ge 5) {
    $firstItem = $listingsRes.data[0]
    Write-Host "  Success: Retrieved $($listingsRes.count) listings with computed distance (Closest: $($firstItem.species_label) at $($firstItem.distance_km) km from Vizag)." -ForegroundColor Green
} else {
    throw "Location-based listings retrieval failed"
}

# 3. Filter Listings by Species & Grade
Write-Host "[3/8] Testing GET /listings?species=vannamei_shrimp&count_grade=30..."
$filtered = Invoke-RestMethod -Uri "$baseUrl/listings?species=vannamei_shrimp&count_grade=30" -Method Get
if ($filtered.success -and $filtered.count -ge 1) {
    Write-Host "  Success: Filtered $($filtered.count) listing(s) for 30-Count Vannamei." -ForegroundColor Green
} else {
    throw "Listings filter failed"
}

# 4. Farmer Creates New Catch Listing
Write-Host "[4/8] Testing POST /listings (Farmer Creates Catch Listing)..."
$newListingPayload = @{
    species = "vannamei_shrimp"
    pond_name = "Pond 5 (South Cluster)"
    quantity_kg = 3500
    min_order_quantity_kg = 1000
    size_grade = "35 Count (28g/pc)"
    count_per_kg = 35
    quality_info = @("Antibiotic-Free Certified", "Slush Iced at 2C", "Pond-side Weighment")
    expected_price_per_kg = 410
    harvest_date = "2026-09-22"
    location_name = "Mogalthur, West Godavari"
    district = "West Godavari"
    latitude = 16.4251
    longitude = 81.6023
    description = "Export grade Vannamei harvest ready for reefer container pickup."
} | ConvertTo-Json

$farmerHeaders = @{ "Content-Type" = "application/json"; "x-farmer-id" = "farmer-demo" }
$createListingRes = Invoke-RestMethod -Uri "$baseUrl/listings" -Method Post -Body $newListingPayload -Headers $farmerHeaders

if ($createListingRes.success -and $createListingRes.data.id) {
    $listingId = $createListingRes.data.id
    Write-Host "  Success: Created listing $listingId ($($createListingRes.data.quantity_kg) kg at Rs. $($createListingRes.data.expected_price_per_kg)/kg)." -ForegroundColor Green
} else {
    throw "Listing creation failed"
}

# 5. Buyer Submits Initial Inquiry / Offer
Write-Host "[5/8] Testing POST /offers (Buyer Submits Commercial Offer)..."
$offerPayload = @{
    listing_id = $listingId
    buyer_name = "K. Ramanathan (Procurement VP)"
    buyer_company = "Eastern Marine Global Exports"
    buyer_type = "exporter"
    buyer_phone = "+91 891 300 4455"
    offered_price_per_kg = 395
    requested_quantity_kg = 3500
    proposed_harvest_date = "2026-09-22"
    pickup_terms = "Buyer Reefer Truck with Slush Ice"
    payment_terms = "Direct RTGS Bank Transfer upon Pond-side Weighment"
    message = "Offering Rs. 395/kg for the complete 3.5 MT harvest with immediate RTGS settlement."
} | ConvertTo-Json

$buyerHeaders = @{ "Content-Type" = "application/json"; "x-buyer-id" = "buyer-exporter-01" }
$offerRes = Invoke-RestMethod -Uri "$baseUrl/offers" -Method Post -Body $offerPayload -Headers $buyerHeaders

if ($offerRes.success -and $offerRes.data.id) {
    $offerId = $offerRes.data.id
    Write-Host "  Success: Offer submitted (Offer ID: $offerId, Price: Rs. $($offerRes.data.offered_price_per_kg)/kg)." -ForegroundColor Green
} else {
    throw "Offer submission failed"
}

# 6. Farmer Submits Counter Offer
Write-Host "[6/8] Testing POST /offers/:id/counter (Farmer Counter Offer)..."
$counterPayload = @{
    sender_role = "farmer"
    price_per_kg = 405
    quantity_kg = 3500
    message = "Count is strictly 35 count with zero soft shell. Minimum acceptable price is Rs. 405/kg."
} | ConvertTo-Json

$counterRes = Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/counter" -Method Post -Body $counterPayload -Headers $farmerHeaders
if ($counterRes.success -and $counterRes.data.offered_price_per_kg -eq 405) {
    Write-Host "  Success: Counter offer recorded (Status: $($counterRes.data.status), Price: Rs. $($counterRes.data.offered_price_per_kg)/kg)." -ForegroundColor Green
} else {
    throw "Counter offer submission failed"
}

# 7. Buyer Accepts Deal & Status Lifecycle (Accepted -> Processing -> Completed)
Write-Host "[7/8] Testing Trade Lifecycle (Accept -> Processing -> Completed)..."

# Step A: Buyer Accepts Counter Offer
$acceptPayload = @{ sender_role = "buyer" } | ConvertTo-Json
$acceptRes = Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/accept" -Method Patch -Body $acceptPayload -Headers $buyerHeaders
if ($acceptRes.data.status -eq "accepted" -and $acceptRes.data.final_agreed_price_per_kg -eq 405) {
    Write-Host "  Step A: Deal accepted at agreed price Rs. $($acceptRes.data.final_agreed_price_per_kg)/kg. Trade agreement locked!" -ForegroundColor Green
} else {
    throw "Deal acceptance failed"
}

# Step B: Transition to Processing (Harvest & Reefer Loading)
$procPayload = @{
    status = "processing"
    dispatch_notes = "Reefer truck on site. Slush-icing at 2C initiated."
} | ConvertTo-Json
$procRes = Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/status" -Method Patch -Body $procPayload -Headers @{ "Content-Type" = "application/json" }
if ($procRes.data.status -eq "processing") {
    Write-Host "  Step B: Status updated to 'processing' (Pond-side harvest & reefer loading underway)." -ForegroundColor Green
} else {
    throw "Processing transition failed"
}

# Step C: Transition to Completed (Certified Gate Weighment)
$completePayload = @{
    status = "completed"
    actual_weighed_quantity_kg = 3480
    dispatch_notes = "Actual weighbridge net weight: 3,480 kg. RTGS payment released."
} | ConvertTo-Json
$completeRes = Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/status" -Method Patch -Body $completePayload -Headers @{ "Content-Type" = "application/json" }
if ($completeRes.data.status -eq "completed" -and $completeRes.data.actual_weighed_quantity_kg -eq 3480) {
    Write-Host "  Step C: Status updated to 'completed'. Final certified value: Rs. $($completeRes.data.final_total_value)." -ForegroundColor Green
} else {
    throw "Trade completion failed"
}

# 8. Submit Trade Review
Write-Host "[8/8] Testing POST /offers/:id/reviews (B2B Trade Review)..."
$reviewPayload = @{
    reviewer_role = "buyer"
    reviewer_name = "Eastern Marine Global Exports"
    rating = 5
    review_text = "Exceptional harvest quality. Fresh, hard shell, perfect count, and punctual weighment."
} | ConvertTo-Json

$reviewRes = Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/reviews" -Method Post -Body $reviewPayload -Headers $buyerHeaders
if ($reviewRes.success -and $reviewRes.data.rating -eq 5) {
    Write-Host "  Success: 5-star B2B trade review submitted and recorded." -ForegroundColor Green
} else {
    throw "Review submission failed"
}

Write-Host "=========================================================="
Write-Host "All Phase 9 tests passed successfully!" -ForegroundColor Green
Write-Host "=========================================================="
