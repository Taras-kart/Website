# Tara Website category hierarchy

Brand category directories now show actual child `product_categories` created in the admin, not synthetic cards such as "Viscose Leggings".
For legacy stock previously imported under parent "Leggings", the updated backend resolves a matching admin-defined child from product name / fit for storefront filtering. This does not alter database values on read.
Deploy alongside the updated backend. Test Twin Birds -> Leggings -> Ankle, Chudidar. Other categories use the same generic hierarchy.
