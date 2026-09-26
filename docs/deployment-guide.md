# Deployment Guide

**Status:** rewritten for ADR 002 (2026-09-26): no server, GitHub Pages, key on the phone.

Never paste your Azure key into a chat, an issue, a commit, or any file in this repository. The only place it goes is the app on your phone (Part 3).

You need two accounts you already have: **Azure** and **GitHub**. The whole setup takes about 15 minutes, once.

| Part | What | Where |
|---|---|---|
| 1 | Create a free Azure Speech resource and get its key | Azure portal |
| 2 | Put the app online | GitHub |
| 3 | Install the app and add the key | Your phone |

## Part 1 — Azure Speech key (Free F0)

> **Owner's status (2026-09-26):** all three parts done: Free F0 Speech resource, Pages switched on, v2 merged into `master` ([ataieb72/Pronunciation-App#1](https://github.com/ataieb72/Pronunciation-App/pull/1)), first deploy green, app installed on the Pixel with the key saved.

1. Azure offers the free trial **only once per person**. If you had one before, sign up for **pay-as-you-go** directly: <https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account> → **Pay as you go**. Azure asks for a phone number and a card.
2. On pay-as-you-go you pay only for paid resources. A **Free F0** Speech resource never bills (5 audio hours a month; one F0 Speech resource per subscription).
3. Set a safety budget: search **Budgets** → **Add** → amount 5 → an alert at 80% to your email.
4. Create the resource: **Speech services** → **Create** → your subscription → resource group `pronunciation-coach` (new) → region **UK South**, **France Central** or **West Europe** → a name → pricing tier **Free F0** → **Review + create** → **Create**.
5. Open the new resource → **Keys and Endpoint**. Note the **Location/Region** (for example `uksouth`). Leave this page open or save **KEY 1** in your password manager. You will paste it on your phone in Part 3.

**Keep the resource on Free F0.** The key will live on your phone. On F0, a leaked key cannot cost money: the worst case is that someone uses up your 5 free hours for the month. Never switch this resource to a paid tier.

**If Free F0 is not offered:** Azure allows one F0 Speech resource per subscription. A deleted one stays "soft-deleted" for up to 48 hours and still blocks the slot. In the Speech services list, select **Manage deleted resources**, find it, select **Purge**, and wait. Or try another region.

## Part 2 — Put the app online (GitHub Pages)

On a phone, open GitHub in Chrome and switch to the desktop site (Chrome menu ⋮ → **Desktop site**). The GitHub app cannot change these settings.

### 2a. Switch on GitHub Pages

1. Open the repository on GitHub → **Settings** → **Pages** (left menu, under **Code and automation**).
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.

That is all. There is nothing to save on this page.

### 2b. Put v2 on the `master` branch

GitHub publishes the app only from `master`. v2 still lives on the branch `claude/adoring-dijkstra-yqw8w8`.

1. Ask Claude to open a pull request from that branch into `master`. (Or: **Pull requests** → **New pull request** → base `master`, compare `claude/adoring-dijkstra-yqw8w8` → **Create pull request**.)
2. Wait for the green tick on the checks.
3. Select **Merge pull request** → **Confirm merge**.

This replaces the v1 files on `master` with v2. Git history keeps v1.

### 2c. Watch the first deploy

1. Open the **Actions** tab → **Deploy to GitHub Pages**. The merge started it.
2. Wait about 3 minutes for a green tick.
3. Open the run → the **deploy** box shows the address: `https://ataieb72.github.io/Pronunciation-App/`.

**Later updates:** every merge into `master` publishes the new version. To publish again by hand: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

## Part 3 — Install the app and add the key

1. On the Pixel, open the address from 2c in **Chrome**.
2. Chrome menu ⋮ → **Install app** (or **Add to home screen** → **Install**).
3. Open **Coach** from the home screen.
4. In Chrome, open <https://portal.azure.com> → your Speech resource → **Keys and Endpoint**. Tap the copy button next to **KEY 1**. (Or copy it from your password manager.)
5. Back in the app, paste the key into **Azure key**. Type the region into **Region**, for example `uksouth`. Select **Save on this phone**.
6. You should see **Azure key saved ✓** with the last 4 characters of the key. Select **Run the phone test** (`docs/validation/r1-phone-test.md`).

The key stays in the app's storage on this phone. The app sends it only to Azure. It is not in GitHub, the app files, or anywhere else.

### Change or remove the key

- **New key:** on the start page, select **Remove the key from this phone**, then paste the new one.
- **If you think the key leaked:** in the Azure portal, open **Keys and Endpoint** → **Regenerate Key1**. The old key stops working at once. Paste the new KEY 1 into the app.
- **Clearing Chrome's site data** for the app also removes the key. Paste it again.

## Troubleshooting

| What you see | What to do |
|---|---|
| The deploy fails at **Set up Pages** | Switch on Pages with source **GitHub Actions** (2a). Then **Actions** → the failed run → **Re-run all jobs**. |
| The deploy fails with "not allowed to deploy to github-pages" | Pages publishes only from `master`. Merge the branch first (2b). |
| The address shows "404" | Wait 1–2 minutes after the first deploy. Use the address exactly as the deploy shows it, with the ending `/`. |
| No **Install app** in the Chrome menu | Reload the page once and wait a few seconds. Make sure you are in Chrome, not a browser inside another app. |
| "That does not look like an Azure key" | Copy **KEY 1** again. Paste it without extra text. |
| "Check the region" | Type the **Location/Region** value from **Keys and Endpoint**, for example `uksouth`. "UK South" also works. |
| The phone test shows "ConnectionFailure" | Check your internet. Then check the key and region, and that the resource exists on **Free F0**. A new resource can take a few minutes to start. |
| The app still shows the old version after an update | Close the app fully and open it again. It updates itself on the next start. |

## Privacy

- The repository is **public**: GitHub Pages is free only for public repositories on the free GitHub plan. Anyone can read the code and the docs, including the notes about your speech. No keys are in it.
- Your recordings and results stay on your phone. The app sends audio only to Azure, for scoring.
- Every GitHub Pages project on your account shares the address `https://ataieb72.github.io` and its browser storage. Do not add other Pages projects with third-party scripts to this account.

## Clean up v1 (optional)

v1 ran on Render. Its Azure key died when Microsoft deleted the old subscription (2026-09-11), so there is no risk. To tidy up:
1. Open <https://dashboard.render.com> → the service **pronunciation-coach** → **Settings**.
2. Scroll down → **Delete Web Service**. Type the name to confirm.
3. If you still have a v1 `.env` file on a computer, delete it.

## Local development (optional)

1. `npm install`, then `npm run dev` → <http://localhost:5173>. Paste a key on the start page. It stays in that browser only.
2. To test a build under the Pages folder: `PC_BASE_PATH=/Pronunciation-App/ npm run build`, then in `apps/pwa` run `PC_BASE_PATH=/Pronunciation-App/ npx vite preview` → <http://localhost:4173/Pronunciation-App/>.
3. Optional value check, which proves the key is not in the build: `read -rs AZURE_SPEECH_KEY && export AZURE_SPEECH_KEY && npm run scan:keys`. Paste the key when the shell waits; it does not show it or save it in your history. Never put the key in a file.
