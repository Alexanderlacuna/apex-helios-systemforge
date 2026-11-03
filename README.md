# APEX HELIOS SYSTEMFORGE — website

Static business landing page (single page, no build step, no dependencies).

## Positioning

The page leads with two disciplines — **system architecture engineering** and
**artificial intelligence systems** — each with its own depth section
(`#architecture`, `#ai-infrastructure`). The remaining capabilities
(custom software, mobile, cloud, data, advisory) are demoted to a single muted
"also available" strip above the fold of `#services` so the studio still reads
as bookable for smaller work without diluting the specialism.

```
index.html              # the whole page
assets/styles.css       # design system + layout
assets/app.js           # nav toggle, scroll reveal, contact form (progressive enhancement)
assets/sky.js           # hero starfield + comets (canvas; pauses off-screen, off under reduced-motion)
assets/favicon.svg      # favicon
assets/logo.svg         # wordmark
assets/og-image.svg     # social share card
404.html                # custom not-found page
robots.txt / sitemap.xml
.github/workflows/pages.yml
```

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub Pages

The included workflow publishes the site on every push to `main`
(`actions/configure-pages` with `enablement: true` turns Pages on by itself).

```bash
git remote add origin git@github.com:USERNAME/apex-helios-systemforge.git
git push -u origin main
```

Once the "Deploy to GitHub Pages" action finishes, the site is live at
`https://USERNAME.github.io/apex-helios-systemforge/`.

> If you rename the repo or use a custom domain, update the absolute URLs in
> `index.html` (canonical, `og:url`, `og:image`) and `sitemap.xml`.

## Custom domain (optional)

Add a file named `CNAME` containing only the domain, then point a `CNAME` DNS
record at `USERNAME.github.io` and enable "Enforce HTTPS" in repo settings.

## Editing content

All copy lives in `index.html`. Colours, spacing and typography are tokens at the
top of `assets/styles.css` (`:root`).

## Content notes

The page intentionally contains no personal identity details and no business
registration number — only company-level marketing copy and a contact address.

The public email address `alexanderkabua@gmail.com` appears in four places and must
be changed together: the `#contact` email card, the `mailto:` form action, the
footer link, and the `email` field of the JSON-LD block.

Page structure is `plain → alt → plain → alt → plain → alt` via
`.section` / `.section-alt`; keep that alternation if you insert a section.
