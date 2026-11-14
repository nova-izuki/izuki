# Help people find Izuki Nova

The primary website is https://izukinova.ai/. Both izukinova.com and
www.izukinova.com permanently redirect there. Keep the .ai as the single
canonical site so links and search signals point to one address.

The website declares its canonical pages, site name (Izuki Nova, also known
as Izuki and Nova Izuki), existing logo, screenshots and social preview images.
Its robots.txt permits crawling and points to the image-enabled sitemap.
The favicon files already exist; Google decides whether and when to show them.
There is no need to buy a new logo, a second website or an SSL certificate.

## The owner's Google account step

1. Open https://search.google.com/search-console in your own Google account.
2. Add a **Domain** property for `izukinova.ai` (no https:// or path).
3. Google supplies a TXT value starting with `google-site-verification=`.
   In Spaceship DNS, add a **TXT** record at **@** with that exact value.
   Keep the existing website A/CNAME records. Do not replace email records.
4. Return to Search Console and click **Verify** after DNS updates spread.
5. After the metadata change is published, submit
   `https://izukinova.ai/sitemap.xml` in **Sitemaps**.
6. In **URL Inspection**, inspect `https://izukinova.ai/`, run the live test
   and request indexing. Also inspect `/screenshots/` and `/help/`.
7. Check the indexing and performance reports over time. Fix reported
   crawl errors; repeated indexing requests do not speed up crawling.

Never paste a Google password, login cookie or recovery code into an issue.
The TXT verification value is intended to be publicly visible in DNS.
No Search Console ownership, submission or indexing has been completed by
the repository change itself.

## Images, logo and paid ads

The existing `/screenshots/` gallery exposes actual app screenshots in HTML
with descriptions. The sitemap includes the screenshot and brand image URLs;
the structured data points to them on the primary domain. These help Google
discover images, but inclusion in Google Images is not guaranteed.

The small icon beside a normal search result is a **favicon**. The homepage
links to the existing square icons and favicon.ico. Google must recrawl the
homepage and icon before a new domain's search icon can update.

Paid **Sponsored** placement requires a separate Google Ads campaign and a
budget. No ads, billing changes or ad account have been created. Search
optimization does not guarantee the first result, a specific snippet, site
name, image or icon. Ranking and display remain Google's decisions.

## Publication and validation

This is a static website change on `codex/site-ai-search`, tracked in #86,
for the normal milestone review and Claude's publication coordination.
Do not merge unrelated app changes merely to publish these website files.
After publication, verify the live canonical tags, robots.txt, sitemap and
images on .ai. Keep .com as a 301 redirect, not a duplicate website.

References:

- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/appearance/google-images
- https://support.google.com/webmasters/answer/9008080
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
