// Small server-side updates for robots/sitemap defaults

// SEO: GET /sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const db = readDb();
  const baseUrl = 'https://thikabnbs.com';
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    ...db.listings.map((l) => {
      const imgTag = l.photos && l.photos[0] ? `
    <image:image>
      <image:loc>${l.photos[0].replace(/&/g, '&amp;')}</image:loc>
      <image:title>${l.title.replace(/&/g, '&amp;')} - Thika, Kenya</image:title>
    </image:image>` : '';
      return `  <url>
    <loc>${baseUrl}/stay/${l.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${imgTag}
  </url>`;
    })
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// SEO: GET /robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://thikabnbs.com';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${baseUrl}/sitemap.xml`);
});

// Helper to inject SEO & Analytics script tags into index.html
function injectSeoAndAnalytics(html: string): string {
  let modifiedHtml = html;

  // Google Search Console Verification Meta Tag
  const gscVerification = process.env.GOOGLE_SITE_VERIFICATION || 'google-site-verification=thikabnbs-thika';
  if (gscVerification && !modifiedHtml.includes('google-site-verification')) {
    const verificationMeta = `<meta name="google-site-verification" content="${gscVerification}" />\n  `;
    modifiedHtml = modifiedHtml.replace('<head>', `<head>\n  ${verificationMeta}`);
  }

  // Google Analytics 4 Script Tag
  const gaId = process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID;
  if (gaId && !modifiedHtml.includes('googletagmanager.com/gtag/js')) {
    const gaScript = `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
    `;
    modifiedHtml = modifiedHtml.replace('</head>', `${gaScript}\n</head>`);
  }

  return modifiedHtml;
}
