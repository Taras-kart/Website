# Tara Website — Subcategory 404 Fix

## Original error
`GET https://taras-kart-backend.vercel.app/api/products/subcategories?brand=Twin+Birds&categoryId=6` returned `404 Not Found`. The website's `src/services/subcategoriesApi.js` requested an endpoint missing from the supplied backend.

## Change
- `src/services/subcategoriesApi.js` keeps the existing endpoint when supported.
- While an older backend is deployed and the endpoint returns 404, it uses the existing `/api/products/catalogue` endpoint to get the product count and show an **All [category]** tile instead of an error.
- Other HTTP failures still surface normally; no silent swallowing of network/server errors.

## Deploy
1. Deploy the updated backend ZIP **first** if you want auto-generated style tiles like Shimmer, Cotton, etc.
2. Deploy this website project on your site hosting platform (with the existing environment variables).
3. Visit the previously failing brand/category page and confirm it loads.
4. Verify `https://taras-kart-backend.vercel.app/api/products/subcategories?brand=Twin+Birds&categoryId=6` returns JSON with `subcategories` and `total` after the backend deployment.

This fix does not modify the Admin dashboard or category records. Categories created by branch admins continue to use the existing category-tree database records.
