const fs = require('fs');
const path = require('path');

// Helper to parse .env file
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*VITE_([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
    if (match) {
      env[`VITE_${match[1]}`] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
  return env;
}

async function run() {
  const env = loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.warn('Skipping dynamic sitemap generation: Supabase credentials missing.');
    return;
  }

  console.log('Generating dynamic sitemap...');

  try {
    // 1. Fetch published collections
    const collectionsRes = await fetch(
      `${supabaseUrl}/rest/v1/collections?select=slug,updated_at&is_published=eq.true`,
      {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        }
      }
    );
    const collections = collectionsRes.ok ? await collectionsRes.json() : [];

    // 2. Fetch published products
    const productsRes = await fetch(
      `${supabaseUrl}/rest/v1/products?select=slug,updated_at&is_published=eq.true`,
      {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        }
      }
    );
    const products = productsRes.ok ? await productsRes.json() : [];

    // 3. Static routes
    const staticUrls = [
      { path: '', changefreq: 'daily', priority: '1.0' },
      { path: 'blog', changefreq: 'weekly', priority: '0.8' },
      { path: 'privacy', changefreq: 'monthly', priority: '0.3' },
      { path: 'gold-rate-dharmavaram', changefreq: 'daily', priority: '0.9' },
    ];

    // Blog articles from static blogData
    const blogSlugs = [
      'how-to-choose-bridal-jewellery-for-your-wedding',
      'gold-vs-diamond-jewellery',
      'jewellery-care-tips',
      'latest-bridal-jewellery-trends-andhra-pradesh',
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Add static pages
    staticUrls.forEach(url => {
      const loc = `https://tpgjewellers.com/${url.path}`;
      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${loc}${url.path ? '?' : '?'}lang=en" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="te" href="${loc}${url.path ? '?' : '?'}lang=te" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
      xml += '    <lastmod>2026-08-14</lastmod>\n';
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add blog pages
    blogSlugs.forEach(slug => {
      const loc = `https://tpgjewellers.com/blog/${slug}`;
      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="te" href="${loc}?lang=te" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
      xml += '    <lastmod>2026-08-14</lastmod>\n';
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Add collections
    if (Array.isArray(collections)) {
      collections.forEach(col => {
        const loc = `https://tpgjewellers.com/collections/${col.slug}`;
        const lastmod = col.updated_at ? col.updated_at.split('T')[0] : '2026-08-14';
        xml += '  <url>\n';
        xml += `    <loc>${loc}</loc>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en" />\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="te" href="${loc}?lang=te" />\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });
    }

    // Add products
    if (Array.isArray(products)) {
      products.forEach(prod => {
        const loc = `https://tpgjewellers.com/products/${prod.slug}`;
        const lastmod = prod.updated_at ? prod.updated_at.split('T')[0] : '2026-08-14';
        xml += '  <url>\n';
        xml += `    <loc>${loc}</loc>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en" />\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="te" href="${loc}?lang=te" />\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';
      });
    }

    xml += '</urlset>\n';

    fs.writeFileSync(path.resolve(__dirname, 'public/sitemap.xml'), xml);
    console.log('Sitemap generated successfully in public/sitemap.xml');
  } catch (err) {
    console.error('Failed to generate sitemap:', err);
  }
}

run();
