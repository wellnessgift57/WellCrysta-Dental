WELLCRYSTA DENTAL — WEBSITE v3 (speed + SEO optimised)

EDIT BEFORE GOING LIVE
  1. js/config.js          -> gtmId, phone, whatsapp, web3formsKey
  2. Phone in schema       -> search "+91-00000-00000" in the .html files and replace with the real number
  3. Domain                -> if not https://dental.wellcrysta.com, find & replace it in all .html, sitemap.xml, robots.txt, CNAME
  4. Map pin               -> latitude/longitude in the schema (search 18.6478) to the exact clinic location

AFTER GOING LIVE (SEO)
  - Google Search Console: add the property, submit https://dental.wellcrysta.com/sitemap.xml
  - Google Business Profile: needed to appear in the Maps / local pack for 'dentist near me'
  - Test: pagespeed.web.dev  and  search.google.com/test/rich-results

SPEED NOTES
  - CSS is inlined in each page; JS is deferred; images are responsive WebP with lazy loading
  - GTM loads after the page has loaded (or on first scroll/tap) so it doesn't block first paint

dataLayer EVENTS (GTM Custom Event triggers)
  generate_lead, form_start, whatsapp_click, call_click, book_cta_click, cost_sheet_download
