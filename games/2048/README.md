# 2048 — self-hosted edition

This is an adaptation of Gabriele Cirulli's official 2048 source, licensed under MIT. Keep LICENSE.txt with redistributed copies.

Upstream: https://github.com/gabrielecirulli/2048
Upstream commit: 478b6ec346e3787f589e4af751378d06ded4cbbc
Retrieved: 2026-10-19

## Hosting

Copy this complete directory to a static website. No build step or remote runtime service is required. Open index.html through the same HTTP(S) origin as your game hub.

## Local changes

- Replaced bundled Clear Sans web fonts with built-in system fonts.
- Replaced the upstream official-site claim with an accurate self-hosted attribution.
- Added a note explaining browser storage and clearing site data.
- Namespaced saved-game and best-score keys to anirudh-2048-gameState and anirudh-2048-bestScore, with a namespaced storage capability test.
- No external scripts, embeds, analytics, ad integrations, APIs, or resource dependencies are used. The attribution links navigate externally only if clicked.

## Saving

The original game stores the current board after successful moves and the highest score in localStorage. It restores an unfinished board on reload. Starting a new game resets the board and preserves the best score. A completed loss clears the current board, as in the upstream game. Storage belongs to this browser profile and website origin; it does not sync across devices. If localStorage is unavailable, upstream in-memory fallback storage lasts only for the page session.
