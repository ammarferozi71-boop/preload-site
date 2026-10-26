# Preload development upgrade

Branch: `upgrade/p0-p5-local`. No deployment or publishing has been performed.

Tool route: `/tools/release-time`.

The release-time converter accepts an explicit timestamp with UTC offset and a named timezone. It handles daylight saving, a bounded countdown, invalid calendar dates and unknown source verification. It never invents a game release date.

Framework: Next.js 16.4.3, React 18.2 retained for compatibility. React 18 is deprecated by Next.js 16 but remains supported by this release. Dynamic route parameters and search parameters use the asynchronous contract. ESLint 9 uses eslint.config.mjs. The selector-parser override addresses the remaining dependency advisory while preserving Tailwind 3; the full local build verifies the generated CSS path.

Security: JSON-LD escapes script delimiters. Search aborts obsolete requests and cleans up on close; carousel state subscribes to external API events. Locked dependencies have been refreshed. Run npm audit again at deployment review, since advisories change.

Verification commands: `npm run test:tools`, `npm run lint`, `npm run typecheck`, and `npm run build:verify`. The verification build uses existing local image files and does not run the optional image downloader. Standard build retains the existing image preparation step. Set PIXELFORGE_LOCAL_BUILD=1 to bound local build workers. No production credentials are needed for these tool checks.

Dataset: content/decision-tool-data.json contains no invented product facts. The central migration_runner/tool_export.py maps existing shared tool/fact snapshots into private development datasets and rejects retired, stale, conflicting or foreign-site evidence. The exporter is not an activated sync. Confirm dataset sources, freshness policy, scope and actual manufacturer/provider wording before adding records.

The data-dependent tool pages remain noindex until a separately reviewed dataset is available. The Preload converter uses the supplied timestamp and has a canonical URL and sitemap entry. Schema checks, fixture tests and empty-state UI do not prove real-world factual accuracy, rankings or production readiness.

Next activation review: confirm the verified data source; run browser interaction tests using the approved dataset; review deployment settings and rollback; obtain explicit approval before pushing where GitHub triggers a Vercel preview. No site changes are live.
