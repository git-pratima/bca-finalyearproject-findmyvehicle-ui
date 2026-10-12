# Google Search deployment checklist

## Completed in the codebase

- Public pages have descriptive route titles, descriptions, canonical URLs and crawl directives.
- The site uses SSR, so public page content and metadata are available to crawlers without relying only on browser JavaScript.
- `robots.txt` permits crawling and declares the XML sitemap.
- `sitemap.xml` now includes only the public canonical pages: home, how-it-works, about and contact.
- Private/member pages retain `noindex` metadata and are intentionally absent from the sitemap to protect account/report information.
- Home now contains useful, visible copy for searches such as “report stolen vehicle India”, “missing vehicle”, “vehicle recovery”, “stolen bike” and “vehicle registration search”. These phrases are not hidden or repeated artificially.
- Open Graph/Twitter metadata and Website/Organization JSON-LD are present. The invalid `SearchAction` markup was removed because search requires login.

## Before deploying

1. The configured public hostname is `https://pratima-bca-findmyvehicle.netlify.app`. It is used in `src/index.html`, `src/app/core/services/seo.service.ts`, `public/robots.txt` and `public/sitemap.xml`.
2. If using a custom domain, change **every** occurrence of that Netlify hostname to the exact HTTPS custom-domain URL before the first production deploy. Pick one version only (for example `https://www.example.in`), then redirect every alternative (`http`, `www` or Netlify subdomain) to it.
3. Deploy with `npm run build`; ensure `/`, `/how-it-works`, `/about`, `/contact`, `/robots.txt` and `/sitemap.xml` return HTTP 200 over HTTPS.
4. Check that pages intended to be public do not require login and do not contain `noindex`. Do not put individual vehicle reports in the sitemap unless they are deliberately public and personal contact details have been privacy-reviewed.
5. Replace the default favicon with a square, stable, brand-identifying image of at least 48x48 pixels. The current ICO contains a 48px representation and is technically eligible.
6. Replace the social preview image with a purpose-made, crawlable 1200x630 image when brand artwork is available. The current vehicle photograph is a sensible fallback.

## Google Search Console actions (requires site-owner access)

1. Open [Google Search Console](https://search.google.com/search-console/) and add the exact HTTPS domain property.
2. Verify ownership using the DNS method (preferred) or the verification method offered by your host.
3. In **Sitemaps**, submit `https://YOUR-DOMAIN/sitemap.xml`.
4. Use **URL Inspection** on the home page and each public page, confirm Google can fetch the rendered HTML, and request indexing after the deployment is live.
5. Recheck the Pages, Sitemaps, Enhancements and Manual Actions reports after Google recrawls. Crawling/indexing can take days; submission is a hint, not a ranking guarantee.
6. Use Search Console performance data to identify real queries. Improve pages with useful information for those queries; do not add keyword lists or fake reviews.

## Ongoing SEO work that cannot be automated by metadata

- Publish original, trustworthy help content (for example safe steps after a vehicle theft, documentation checklist, and how to submit a useful sighting) with named authors, sources and update dates.
- Earn legitimate mentions/links from relevant community, university or road-safety organisations. Never buy links or use link farms.
- Keep public content accurate. Do not claim police verification, recovery rates, partnerships, live tracking or 24/7 emergency support unless those services actually exist.
- Monitor Core Web Vitals, mobile usability, page errors, duplicate URLs and security issues in Search Console.
- Review privacy: registration numbers, owner phone/email, photos and last-known location can be sensitive. Index only data you are genuinely authorised to make public.

## Important expectation

No setting can place a site “at the top” of Google by itself. Google ranks results based on relevance, quality, safety, usability, locality and competition. These changes make the site eligible to be found, correctly understood and shared; sustained useful content and trustworthy references are needed to compete for relevant searches.

