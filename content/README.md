# Preload content

All site content lives in `launch.json`: categories, topics, the publication byline, articles and the `games` list that drives the release board on the homepage.

## Add or update an article

Write a Markdown draft with `# TITLE`, `# SLUG`, `# META TITLE`, `# META DESCRIPTION`, `# ARTICLE BODY` and `# EXTERNAL SOURCES USED` sections, then run:

    node scripts/import-article.mjs draft.md --category <releases|requirements|install|updates|guides> --tags a,b

Tags that match a topic slug link the article to that topic. Article text supports `**bold**`, `*italic*` and `[label](url)`; links starting with `/` are internal.

## Update the release board

Edit the `games` array in `launch.json`. Each entry has a name, `release_date` (YYYY-MM-DD), platforms, `install_size` (or `null` when not announced) and `article_path` (or `null`). "Out now" and "Upcoming" are worked out from the date automatically.

## Site settings

The site name, tagline and description are in `lib/site.ts`. Set `NEXT_PUBLIC_SITE_URL` to the site's real address and `NEXT_PUBLIC_CONTACT_EMAIL` to enable the Contact page.
