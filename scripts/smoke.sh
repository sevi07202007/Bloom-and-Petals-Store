#!/usr/bin/env bash
# End-to-end smoke test against a running stack (dev: make up). Requires curl + jq.
set -euo pipefail
API=${API:-http://localhost:8000/api}
EMAIL="smoke-$(date +%s)@example.com"

step() { printf "\n\033[1;35m▶ %s\033[0m\n" "$*"; }

step "Health"
curl -sf "$API/health/" | jq .

step "Products"
COUNT=$(curl -sf "$API/products/" | jq .count)
echo "count=$COUNT"
PRODUCT_ID=$(curl -sf "$API/products/?in_stock=true" | jq '.results[0].id')
echo "using product $PRODUCT_ID"

step "Register $EMAIL"
TOKEN=$(curl -sf -X POST "$API/auth/register/" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"smoke-pass-123\",\"first_name\":\"Smoke\",\"last_name\":\"Test\"}" | jq -r .access)
AUTH="Authorization: Bearer $TOKEN"

step "Add to cart"
curl -sf -X POST "$API/cart/items/" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"product_id\":$PRODUCT_ID,\"quantity\":2}" | jq '{product: .product.name, quantity}'
BEFORE=$(curl -sf "$API/products/" | jq ".results[] | select(.id==$PRODUCT_ID) | .stock_quantity")

step "Checkout"
ORDER=$(curl -sf -X POST "$API/checkout/" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"shipping_name":"Smoke Test","shipping_address1":"1 Main St","shipping_city":"Town","shipping_postal_code":"00000","shipping_country":"US"}' | jq -r .number)
echo "order=$ORDER"

step "Fake payment"
curl -sf -X POST "$API/payments/$ORDER/confirm/" -H "$AUTH" | jq '{number, status, payment_reference}'

step "Verify"
STATUS=$(curl -sf "$API/orders/$ORDER/" -H "$AUTH" | jq -r .status)
AFTER=$(curl -sf "$API/products/" | jq ".results[] | select(.id==$PRODUCT_ID) | .stock_quantity")
echo "status=$STATUS stock_before=$BEFORE stock_after=$AFTER"
[ "$STATUS" = "paid" ] || { echo "FAIL: expected paid"; exit 1; }
[ "$AFTER" -eq $((BEFORE - 2)) ] || { echo "FAIL: stock not decremented"; exit 1; }

step "Cart empty after checkout"
curl -sf "$API/cart/" -H "$AUTH" | jq .item_count

echo -e "\n\033[1;32m✔ Smoke test passed\033[0m"
