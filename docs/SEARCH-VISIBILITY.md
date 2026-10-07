# Izuki search visibility

The public website is https://nova-izuki.github.io/izuki/. Its hostname homepage
is maintained in the separate `nova-izuki/nova-izuki.github.io` repository.
Both pages must keep the same Izuki name and `WebSite` identity:
`https://nova-izuki.github.io/#website`, with `url` set to
`https://nova-izuki.github.io/`.

Google chooses a site name and favicon per hostname, not per subdirectory.
Keep the root homepage crawlable, its Izuki icon links stable, and its `WebSite`
metadata consistent with the `/izuki/` page. The root currently redirects to
`/izuki/`; the destination also carries the same site-name metadata.
The root `robots.txt` advertises the project sitemap. A `robots.txt` inside
`/izuki/` alone does not govern crawling of this hostname.

## After publishing

In the owner's [Google Search Console](https://search.google.com/search-console/):

1. Use a verified URL-prefix property for `https://nova-izuki.github.io/` to
   inspect the root homepage. A property limited to `/izuki/` does not cover it.
   If verification is needed, publish the exact verification file or meta tag
   Google provides in the root repository; do not invent a token.
2. Inspect the root homepage, the `/izuki/` homepage and
   `/izuki/screenshots/`. Test their live URLs. Request indexing of the two
   canonical project pages and refresh the root URL where the tool permits it.
   The redirecting root itself need not be indexed as a separate result.
3. Submit `https://nova-izuki.github.io/izuki/sitemap.xml` under Sitemaps.
4. Check Page indexing for crawl or canonical problems. Use Performance with
   Search type set to Image to monitor image impressions. Check Web performance
   for branded queries such as Izuki and Nova Izuki.

Search Console access is account-specific. Deploying the website does not
submit an indexing request or prove that Google has recrawled it.

## Keeping images discoverable

`docs/screenshots/index.html` is the public gallery. Reuse the existing image
URLs, use ordinary HTML `img` elements with accurate alt text, and keep visible
captions and full-size links. Add new public screenshots to the gallery and
image sitemap when the interface changes. Use clean demo data in screenshots.
Only change a sitemap `lastmod` when the corresponding page actually changes.

The homepage links to the gallery, identifies the application screenshots in
structured data, and permits large image previews. These are discovery signals;
they do not guarantee inclusion in Google Images, a favicon, or any ranking.
Changes can take days to weeks to be recrawled. No one can guarantee a permanent
first-place search position.

## References

- [Google: favicons in Search](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: image SEO](https://developers.google.com/search/docs/appearance/google-images)
