$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000/api/supplies"

Write-Host "================================================="
Write-Host "Phase 8: Aquaculture Medicines & Supplies E2E Test"
Write-Host "================================================="

# 1. Browse Categories
Write-Host "[1/7] Testing GET /categories..."
$categoriesRes = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
if ($categoriesRes.success -and $categoriesRes.data.Count -eq 8) {
    Write-Host "  Success: Found all 8 approved categories (Probiotics, Water Treatment, Disinfectants, etc.)." -ForegroundColor Green
} else {
    throw "Categories count mismatch or fetch failed"
}

# 2. Browse Products & Filter
Write-Host "[2/7] Testing GET /products (Browse & Filter)..."
$productsRes = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
if ($productsRes.success -and $productsRes.count -ge 8) {
    Write-Host "  Success: Retrieved $($productsRes.count) legally permitted aquaculture products." -ForegroundColor Green
} else {
    throw "Failed to fetch products"
}

# Filter by category: probiotics
$probRes = Invoke-RestMethod -Uri "$baseUrl/products?category=probiotics" -Method Get
if ($probRes.success -and $probRes.count -ge 1) {
    Write-Host "  Success: Category filter returned $($probRes.count) probiotic product(s)." -ForegroundColor Green
} else {
    throw "Category filtering failed"
}

# 3. Product Details Page & Verified Usage
Write-Host "[3/7] Testing GET /products/prod-001 (Product Details)..."
$prod1 = Invoke-RestMethod -Uri "$baseUrl/products/prod-001" -Method Get
if ($prod1.success -and $prod1.data.caa_or_govt_approval_no -match "CAA") {
    Write-Host "  Success: Product details verified: $($prod1.data.name)" -ForegroundColor Green
    Write-Host "    Manufacturer: $($prod1.data.manufacturer)"
    Write-Host "    Dosage Guidelines: $($prod1.data.dosage_guidelines)"
    Write-Host "    Available Stock: $($prod1.data.stock_quantity)"
} else {
    throw "Product details or approval number verification failed"
}

# 4. Cart -> Order Request
Write-Host "[4/7] Testing POST /orders (Cart -> Checkout Flow)..."
$orderPayload = @{
    farmer_name = "K. Srinivasa Rao"
    farmer_phone = "+91 98480 88776"
    delivery_address = "Pond Sector 3, Mogalthur Road, Bhimavaram"
    district = "West Godavari"
    state = "Andhra Pradesh"
    payment_method = "cash_on_delivery"
    order_notes = "Deliver before 10 AM aeration cycle"
    items = @(
        @{ product_id = "prod-001"; quantity = 2 },
        @{ product_id = "prod-002"; quantity = 1 }
    )
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json"; "x-farmer-id" = "farmer-demo" }
$orderRes = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body $orderPayload -Headers $headers

if ($orderRes.success -and $orderRes.data.status -eq "placed") {
    $orderId = $orderRes.data.id
    $orderNumber = $orderRes.data.order_number
    Write-Host "  Success: Order placed successfully! Order No: $orderNumber (Total: Rs. $($orderRes.data.total_amount))" -ForegroundColor Green
} else {
    throw "Order checkout failed"
}

# 5. Farmer Order Tracking & Purchase History
Write-Host "[5/7] Testing GET /orders/farmer (Farmer History & Tracking)..."
$farmerOrders = Invoke-RestMethod -Uri "$baseUrl/orders/farmer" -Method Get -Headers $headers
$placedOrder = $farmerOrders.data | Where-Object { $_.id -eq $orderId }
if ($placedOrder -and $placedOrder.status -eq "placed") {
    Write-Host "  Success: Order verified in farmer purchase history with status 'placed'." -ForegroundColor Green
} else {
    throw "Order not found in farmer purchase history"
}

# 6. Seller Receives Order & Updates Status
Write-Host "[6/7] Testing Seller Fulfillment Flow (Received -> Confirmed -> Shipped -> Delivered)..."

# Step A: Seller sees order in incoming queue
$sellerOrders = Invoke-RestMethod -Uri "$baseUrl/orders/seller/seller-godavari-01" -Method Get
$sellerFound = $sellerOrders.data | Where-Object { $_.id -eq $orderId }
if ($sellerFound) {
    Write-Host "  Step A: Seller received order in dashboard inbox." -ForegroundColor Green
} else {
    throw "Order not received by seller"
}

# Step B: Seller confirms order
$confirmPayload = @{ status = "confirmed" } | ConvertTo-Json
$confirmRes = Invoke-RestMethod -Uri "$baseUrl/orders/$orderId/status" -Method Patch -Body $confirmPayload -Headers @{ "Content-Type" = "application/json" }
if ($confirmRes.data.status -eq "confirmed") {
    Write-Host "  Step B: Seller confirmed order." -ForegroundColor Green
} else {
    throw "Status update to confirmed failed"
}

# Step C: Seller dispatches / ships order
$shipPayload = @{
    status = "shipped"
    tracking_number = "AQLOG-EXPRESS-7712"
    courier_partner = "AquaExpress Rural Fleet"
} | ConvertTo-Json
$shipRes = Invoke-RestMethod -Uri "$baseUrl/orders/$orderId/status" -Method Patch -Body $shipPayload -Headers @{ "Content-Type" = "application/json" }
if ($shipRes.data.status -eq "shipped" -and $shipRes.data.tracking_number -eq "AQLOG-EXPRESS-7712") {
    Write-Host "  Step C: Order marked as shipped with courier tracking ID." -ForegroundColor Green
} else {
    throw "Status update to shipped failed"
}

# Step D: Seller / Courier delivers order
$deliverPayload = @{ status = "delivered" } | ConvertTo-Json
$deliverRes = Invoke-RestMethod -Uri "$baseUrl/orders/$orderId/status" -Method Patch -Body $deliverPayload -Headers @{ "Content-Type" = "application/json" }
if ($deliverRes.data.status -eq "delivered") {
    Write-Host "  Step D: Order marked as delivered." -ForegroundColor Green
} else {
    throw "Status update to delivered failed"
}

# 7. Submit Product Review
Write-Host "[7/7] Testing POST /products/prod-001/reviews (Farmer review)..."
$reviewPayload = @{
    order_id = $orderId
    rating = 5
    review_text = "EcoBact delivered fast and effectively dissolved bottom muck in 3 days."
    farmer_name = "K. Srinivasa Rao"
} | ConvertTo-Json
$reviewRes = Invoke-RestMethod -Uri "$baseUrl/products/prod-001/reviews" -Method Post -Body $reviewPayload -Headers $headers
if ($reviewRes.success -and $reviewRes.data.rating -eq 5) {
    Write-Host "  Success: 5-star product review recorded and rating updated." -ForegroundColor Green
} else {
    throw "Review submission failed"
}

Write-Host "================================================="
Write-Host "All Phase 8 tests passed successfully!" -ForegroundColor Green
Write-Host "================================================="
