# ADR 002 — No server: static app on GitHub Pages, key on the phone

**Date:** 2026-09-26 · **Status:** accepted · **Replaces:** the Worker parts of ADR 001 (decision 2, second and third points; decision 3, `apps/worker`)

## Context

- ADR 001 put one Cloudflare Worker in front of Azure. The Worker kept the Azure key, paired the phone with a code, and gave it 10-minute tokens. It also planned encrypted backups.
- The Worker, its tests and a deploy pipeline were built in R1-T04 to R1-T06. Before the first deploy, the owner asked why a personal, one-phone app needs Cloudflare, an API token and GitHub secrets.
- The honest answer: most of the Worker protects the key from strangers. With one user and a **Free F0** Azure resource, a leaked key cannot cost money: F0 never bills, and it stops at 5 audio hours a month.
- Chrome still needs HTTPS for the microphone, so the app files need a web host. GitHub Pages hosts static files over HTTPS for free, with no extra account.
- Options put to the owner: **A** keep the Worker; **B** no server, key typed on the phone, GitHub Pages; **C** an Android app file (APK). The owner chose **B**.

## Decision

1. **No server.** The app is static files (HTML, JavaScript, CSS) on **GitHub Pages**, at `https://<owner>.github.io/<repository>/`.
2. **The owner types the Azure key and region once on the phone.** They live only in the browser's storage on that phone (`localStorage`, key `pc.azure`). The app sends the key only to Azure Speech (`SpeechConfig.fromSubscription`). The key never goes into the repository, the build, GitHub secrets or any other server.
3. **Deploy:** `.github/workflows/pages.yml` runs on every push to `master` (and by hand). It runs the type check, lint, tests, build and key scan, then publishes `apps/pwa/dist`.
4. **Pages use the URL hash** (`#/spike`), because GitHub Pages has no fallback for deep links.
5. **A content security policy** (a meta tag, in builds only) lets the page load scripts only from itself, and talk only to itself and Azure Speech.
6. **Removed:** `apps/worker` (API, D1 migrations, 37 tests), `tools/deploy` (18 tests), `.github/workflows/deploy.yml`, the pairing screen and API client in the PWA. Commit `8fd3a99` on this branch is the last commit with them, so git history keeps them in full.
7. **The key scan changes:** app code may call `fromSubscription`, because the key arrives at run time. The key-value, variable-name and subscription-header rules stay.

## Consequences

**Gains**
- Setup drops to two accounts the owner already has (GitHub, Azure). No Cloudflare account, API token, pairing code or GitHub secrets.
- Nothing runs on a server, so nothing there can break, cost money or need updates.

**Costs and risks**
- **The key sits on the phone.** Anyone who unlocks the phone, or code running in the app, could read it. Limits: the content security policy blocks sending it anywhere except Azure; the resource must stay on **Free F0**, so the worst case is losing the month's free hours. If the key leaks, regenerate it in the Azure portal (Keys and Endpoint) and type the new one on the phone.
- **The Speech SDK puts the key in the WebSocket address** it opens to Azure. The link is encrypted (WSS), so the network cannot see it. Chrome's console on the phone can show it after a failed connection.
- **The origin is shared.** Every GitHub Pages project of the same owner lives at `https://<owner>.github.io` and can read the same browser storage. Keep other Pages projects of this account free of third-party scripts, or move this app to its own domain later.
- **The repository must stay public** while it uses GitHub Pages on the free GitHub plan. Anyone can read the code and docs, including the learner profile. No keys are in it.
- **No rate limits.** One user does not need them; F0 caps usage.
- **Later features change:** backup (R5) becomes an encrypted file the owner saves (for example to Google Drive), not an upload to a server. The listener panel (R10) needs a way to share clips; decide that when R10 starts. A server can come back then if needed.
- **Azure tokens are gone.** The phone talks to Azure with the key itself. If a later feature needs short-lived tokens, it needs a server again.
