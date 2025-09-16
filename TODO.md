# TODO: Add Link Property to Products and Update ProductDetails Button

## Tasks
- [ ] Add `link` property to all products in `mockData.ts` that are missing it, generating appropriate URLs based on source and product title slug
- [ ] Update the "Voir le site" button in `ProductDetails.tsx` to open `product.link` in a new tab when clicked

## Information Gathered
- `ProductDetails.tsx` displays product details and has a "Voir le site" button that currently doesn't function
- `mockData.ts` contains product data with sources like Avito, Jumia, Marjane, etc., but many products (especially Avito) are missing the `link` property
- Link format should be: `https://www.avito.ma/fr/[slug]` for Avito, `https://ma.jumia.is/[slug]` for Jumia, etc.
- Slug should be generated from product title: lowercase, spaces to hyphens, remove special characters

## Plan
1. Generate slugs for products without links based on title
2. Add `link` property to each product in `mockData.ts`
3. Modify `ProductDetails.tsx` to add `onClick` handler to the "Voir le site" button that opens `product.link` in a new tab

## Dependent Files
- `src/data/mockData.ts`
- `src/pages/ProductDetails.tsx`

## Followup Steps
- Test that links open correctly in new tabs
- Verify no other UI elements are affected
