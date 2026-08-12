# Favicon and domain update checklist

This PR contains changes to ensure favicons are properly referenced from the site root and to standardize the site's domain to https://thikabnbs.com.

Files changed:
- index.html: link tags for favicon updated to use `/favicon.svg`, `/favicon-48.png`, `/favicon.ico`, `/apple-touch-icon.png`. Canonical switched to https://thikabnbs.com
- favicon.svg: root SVG favicon added
- favicon-48.png, apple-touch-icon.png, favicon.ico: raster fallbacks added
- server.ts: sitemap/robots fallback base URL set to https://thikabnbs.com; Google verification token default updated
- src/server/db.ts: CMS settings and emails switched to thikabnbs.com defaults
- src/components/SEO.tsx, Footer.tsx, SocialShareModal.tsx, GoogleVerificationModal.tsx: updated visible text and baseUrl fallbacks to thikabnbs.com

Verification steps (post-merge & deploy):
1. curl -I https://thikabnbs.com/favicon.svg
2. curl -I https://thikabnbs.com/favicon-48.png
3. curl -I https://thikabnbs.com/apple-touch-icon.png
4. View page source and confirm <link rel="icon" href="/favicon.svg"> is present
5. In Google Search Console: ensure https://thikabnbs.com is a property and use URL Inspection -> Request Indexing

Notes:
- I replaced existing references to texasairbnbs.com with thikabnbs.com where they were clearly meant to be the live domain or fallback.
- Visible brand text "Texas Airbnbs" was left unchanged; I only updated domain references and SEO meta fallbacks.
- If you want me to also rename the brand text, I can do that in a follow-up.

Please review the changes and merge when ready.
