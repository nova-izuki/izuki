# Izuki search visibility

The public website is **https://izukinova.ai/** and is served from `docs/` in
this repository. There is no separate root-homepage repository any more; the
custom domain points at this GitHub Pages site, and `/` is `docs/index.html`.

The canonical host is `izukinova.ai`, not `www.izukinova.ai`, the old
`nova-izuki.github.io/izuki/` URL, or `izukinova.com`. Every page's canonical
link, Open Graph URL and structured-data `@id` use the `.ai` host. GitHub Pages
redirects the old `nova-izuki.github.io/izuki/...` URLs to the custom domain;
those redirects are for old links, not canonical URLs.

## The new domain is live; ranking is not instant

The canonical migration landed on 14 November 2026: `/` now serves
`https://izukinova.ai/`, `robots.txt` advertises the `.ai` sitemap, the
sitemap and structured data use `.ai`, and the Google verification file at
`/google6a04107c76dfd950.html` returns 200. `www.izukinova.ai` redirects to the
bare host.

That fixes the technical signals, but it does **not** make a brand-new domain
appear at the top of Google overnight. Google has to recrawl the old
`nova-izuki.github.io/izuki/` URL, follow its redirect, discover the new
canonical and sitemap, and then decide where the page ranks against established
results. The logo/favicon and image previews are also refreshed on Google's own
schedule. Expect days to weeks for a recrawl, and longer for competitive
queries.

Only the Search Console owner can submit the sitemap and request indexing.
After that, the useful checks are:

- Search `site:izukinova.ai` — results mean it is indexed, not that it ranks.
- Search `site:izukinova.com` — it should consolidate through the 301, not
  compete as a second site.
- In Search Console, check **Page indexing → Why pages aren't indexed** for
  `izukinova.ai`, and **Sitemaps** for the submitted sitemap status.
- Use **URL Inspection → Request indexing** for `/`, `/app/`, `/help/` and
  `/screenshots/` after a meaningful change.

Ranking also depends on backlinks, branded searches, useful content and time.
No repository change or sitemap submission can guarantee a first-place result.

`izukinova.com` is a convenience domain and **301-redirects to the same path on
`izukinova.ai`** (checked 14 November 2026, including the `/help/` path).
GitHub Pages only serves one custom domain per site, so that redirect lives at
the DNS host or registrar, outside this repository. `www.izukinova.ai` also
301s to the bare `.ai` host. Keep both redirects in place: they are what make
the `.com` link safe for search engines and shared links. If the `.com`
redirect ever breaks, fix it at the DNS/registrar level rather than relying on
the repository's `404.html`; the 404 page only covers unknown `.ai` paths.

Google chooses a site name and favicon per hostname. Keep the root homepage
crawlable, its Izuki icon links stable, and its `WebSite` identity at
`https://izukinova.ai/#website` with `url` set to `https://izukinova.ai/`.
The sitemap and `robots.txt` live at the host root:

- https://izukinova.ai/robots.txt
- https://izukinova.ai/sitemap.xml

## After publishing

In the owner's [Google Search Console](https://search.google.com/search-console/):

1. Add and verify a **Domain property** for `izukinova.ai` if possible, or a
   URL-prefix property for `https://izukinova.ai/`. Verification is
   account-specific; use the exact DNS record or file Google provides and do
   not invent a token.
2. Inspect the homepage, `/app/`, `/screenshots/` and `/help/`. Test the live
   URLs, then request indexing for the pages that changed.
3. Submit `https://izukinova.ai/sitemap.xml` under Sitemaps.
4. Check Page indexing for crawl or canonical problems. Use Performance with
   Search type set to Image to monitor image impressions. Check Web performance
   for branded queries such as Izuki and Nova Izuki.
5. If Search Console still lists the old `nova-izuki.github.io` property, keep
   it long enough to confirm the redirects, but treat `izukinova.ai` as the
   canonical property.

Search Console access is account-specific. Deploying the website does not
submit an indexing request or prove that Google has recrawled it. No one can
guarantee a first-place ranking.

## Keeping images discoverable

`docs/screenshots/index.html` is the public gallery. Reuse the existing image
URLs, use ordinary HTML `img` elements with accurate alt text, and keep visible
captions and full-size links. Add new public screenshots to the gallery and
image sitemap when the interface changes. Use clean demo data in screenshots.
Only change a sitemap `lastmod` when the corresponding page actually changes.

The homepage links to the gallery, identifies the application screenshots in
structured data, and permits large image previews. These are discovery signals;
they do not guarantee inclusion in Google Images, a favicon, or any ranking.
Changes can take days to weeks to be recrawled.

## References

- [Google: favicons in Search](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: image SEO](https://developers.google.com/search/docs/appearance/google-images)
- [GitHub Pages: custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
