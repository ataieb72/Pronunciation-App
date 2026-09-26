# Deployment Guide

**Status:** complete for R1 (2026-09-25).

Never paste a key or token into a chat, an issue, a commit, or any file in this repository. Keep it in a password manager until a step below tells you where it goes.

## Part 1 — Retire v1 and secure the Azure key (do this now)

v1 runs on Render with no login and passes any text to Azure's text-to-speech. Anyone who finds its address can use your Azure quota. Kill the key first, then remove the service.

> **Owner's status (2026-09-25):** Microsoft deleted the owner's free-trial subscription on 11 September 2026, with all its resources. The v1 key is already dead, so step 1a is not needed. Step 1b (delete the Render service) is still good hygiene. For v2, follow "Create a subscription and a free Speech resource" below, using **pay-as-you-go**.

### 1a. Regenerate the Azure keys (kills the old key at once)

1. Open <https://portal.azure.com> and sign in.
2. In the top search bar, type the name of your Speech resource, or type **Speech services** and open the list.
3. Open the resource that v1 used.
4. In the left menu, under **Resource Management**, select **Keys and Endpoint**.
5. Select **Regenerate Key1**, then confirm.
6. Select **Regenerate Key2**, then confirm. Now the old key no longer works anywhere.
7. Note the **Location/Region** shown on the same page (for example `eastus` or `francecentral`). You will need it later.
8. Copy the new **KEY 1** into your password manager. Do not share it.

**If the Speech services page says "Welcome to Azure! Don't have a subscription?"**, this sign-in has no active subscription in the current directory. Then:
1. Select your profile icon (top right) → **Switch directory**. If another directory is listed, switch to it and open **Speech services** again.
2. In the top search bar, type **Subscriptions**. If a subscription shows **Disabled** or **Expired** (common after a free trial ends), its resources no longer work, so the old key is already dead.
3. If you used a different Microsoft account for v1, sign in with that one and check again.
4. If you find no working subscription anywhere, the old key cannot work. Skip to step 1b, then create a subscription for v2 (below).

**Create a subscription and a free Speech resource for v2:**
1. Azure offers the free trial **only once per person**. If you had one before, sign up for **pay-as-you-go** directly: <https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account> → **Pay as you go**. Azure asks for a phone number and a card. (First-time users can take the free trial instead, then upgrade to pay-as-you-go within 30 days.)
2. On pay-as-you-go you pay only for paid resources. A **Free F0** Speech resource never bills (5 audio hours a month; one F0 Speech resource per subscription).
3. Set a safety budget: search **Budgets** → **Add** → amount 5 → an alert at 80% to your email.
4. Create the resource: **Speech services** → **Create** → your subscription → resource group `pronunciation-coach` (new) → region **France Central** or **West Europe** → a name → pricing tier **Free F0** → **Review + create** → **Create**.
5. Open the new resource → **Keys and Endpoint**. Save **KEY 1** in your password manager, and note the **Location/Region** (for example `francecentral`).

**Why regenerate instead of delete:** Azure allows only one free (F0) Speech resource per subscription. A deleted resource stays "soft-deleted" for up to 48 hours and still blocks that free slot.

**Optional — move to an EU region later.** A region near you (France Central or West Europe) gives slightly faster responses. To move:
1. Delete the old resource.
2. In the Speech services list, select **Manage deleted resources**, find it, and select **Purge**.
3. Create a new Speech resource: **Create** → your subscription → a resource group (for example `pronunciation-coach`) → region **France Central** or **West Europe** → a name → pricing tier **Free F0** → **Review + create** → **Create**.
4. If Free F0 is not offered, wait up to 48 hours after the purge, or try the other EU region.

### 1b. Delete the v1 service on Render

1. Open <https://dashboard.render.com> and sign in.
2. Select the service **pronunciation-coach**.
3. In the left menu, select **Settings**.
4. Scroll to the bottom and select **Delete Web Service**. Type the service name to confirm.
5. If deletion hangs, select **Suspend Web Service** in the same place, and try deleting again later. The key is already dead after step 1a, so there is no rush.
6. If you still have a v1 `.env` file on a computer, delete it. It holds the old, now useless key.

## Part 2 — Create a Cloudflare account (free)

1. Open <https://dash.cloudflare.com/sign-up>. Sign up with your email and a strong password.
2. Open the verification email and confirm your address.
3. If Cloudflare asks you to add a website or domain, skip it. The app does not need one.
4. Turn on two-factor sign-in: select the profile icon (top right) → **Profile** → **Authentication** → **Two-Factor Authentication**. This account will hold your Azure key, so protect it.
5. In the left menu, open **Workers & Pages** (in some layouts it sits under **Compute**).
6. Set your **workers.dev subdomain**: next to **Your subdomain**, select **Change** or **Set up**, and choose a name. The app's address will be `https://pronunciation-coach.<your-subdomain>.workers.dev`. HTTPS is automatic. The name is public, so avoid personal details.
7. On the same page, find your **Account ID** and note it. It is not a secret, but you do not need to send it to anyone yet.

Stop here. Part 3 adds an API token with the exact permissions the deploy needs.

## Part 3 — First deploy

The deploy runs in GitHub Actions (`.github/workflows/deploy.yml`). You only need a browser. It:
1. checks that every setting below exists (it names missing ones and never prints values);
2. runs the type check, lint, tests, build and key scan;
3. finds or creates the D1 database `pronunciation-coach` (Western Europe) and applies its migrations;
4. uploads the Worker, the app and the two secrets;
5. calls `/api/health` on the live app and shows its address in the run summary.

### 3a. Choose a pairing code

Your phone sends this code once to prove it is yours.
- Use at least 12 characters (at most 128). A phrase of 4 random words works well, for example the format `word-word-word-word`. Let a password manager's passphrase generator pick the words: people choose predictable words.
- Use only lowercase letters and hyphens, so it is easy to type on a phone.
- Save it in your password manager. You will type it on your phone in step 3f.
- To change it later: update the GitHub secret, deploy again, and pair again. Phones already paired stay paired.

### 3b. Create a Cloudflare API token

1. In the Cloudflare dashboard, select the profile icon (top right) → **Profile** → **API Tokens** → **Create Token**. (If your dashboard layout differs, type **API Tokens** in the dashboard search.)
2. Next to **Edit Cloudflare Workers**, select **Use template**.
3. Under **Permissions**, select **+ Add more** and add: **Account** → **D1** → **Edit**. (The deploy creates the database and applies migrations; the template does not include D1.)
4. Under **Account Resources**, choose **Include** → your account.
5. Under **Zone Resources**, choose **All zones**. You have no zones, so this grants nothing extra.
6. Select **Continue to summary** → **Create Token**. Copy the token now; Cloudflare shows it only once.

### 3c. Find your Cloudflare Account ID

**Workers & Pages** → the **Account ID** on the right side of the page (32 characters).

### 3d. Add the settings to GitHub

In the repository on GitHub: **Settings** → **Secrets and variables** → **Actions**.

On a phone, open GitHub in the browser and switch to the desktop site (browser menu → **Desktop site**); the GitHub app cannot edit these settings.

Names are case-sensitive: type them exactly as below. Paste values without spaces, quotes or a line break at the end. After you save a secret, GitHub never shows its value again; you can only replace it (**Update**).

On the **Secrets** tab, select **New repository secret** four times:

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token from 3b |
| `CLOUDFLARE_ACCOUNT_ID` | the ID from 3c |
| `AZURE_SPEECH_KEY` | KEY 1 of your Speech resource (Part 1) |
| `PAIRING_CODE` | the code from 3a |

On the **Variables** tab, select **New repository variable**:

| Name | Value |
|---|---|
| `AZURE_SPEECH_REGION` | your Speech resource's region code, in lowercase with no spaces, for example `uksouth` or `francecentral`. It is the **Location/Region** value on the resource's **Keys and Endpoint** page. |

GitHub hides secret values in logs. The app never sends them to your phone.

### 3e. Run the deploy

- **If the workflow is on the default branch** (`master`): **Actions** → **Deploy** → **Run workflow** → **Run workflow**.
- **While v2 lives only on its development branch,** GitHub shows no button. Ask Claude to start the deploy on that branch, or merge the branch into `master` first.

The run takes about 3 minutes. Open it and read the **Summary**: it shows the app address, for example `https://pronunciation-coach.<your-subdomain>.workers.dev`.

### 3f. Install and pair on your phone

1. Open the address in **Chrome** on the phone.
2. Chrome menu (⋮) → **Install app** (or **Add to home screen** → **Install**).
3. Open the app from the home screen.
4. Type your pairing code and select **Pair this phone**. You should see **Paired ✓** and **Server: online**.

### Troubleshooting

| What you see | What to do |
|---|---|
| "Check settings" fails with names of settings | Add the missing secret or variable in 3d. Check `PAIRING_CODE` has 12+ characters and the region is a plain name like `uksouth`. |
| Cloudflare "Authentication error" | The API token lacks a permission. Recreate it with the template plus **D1 → Edit** (3b), and check the Account ID. |
| "You need a workers.dev subdomain" | Set one in Part 2, step 6. |
| The app says "Server: degraded" | The database is unreachable. Run the deploy again; it re-applies migrations safely. |
| Pairing says "Pairing is off on the server" | `PAIRING_CODE` is missing or too short. Fix it in 3d and deploy again. |
| "Too many wrong codes" | Wait for the time shown (pairing locks for the rest of the hour after 10 wrong codes). |

To change a secret later, update it in GitHub and run the deploy again.

## Local development (optional)

1. `cp apps/worker/.dev.vars.example apps/worker/.dev.vars` and fill it in (the file is git-ignored).
2. `npm run build` (the Worker serves the built app).
3. `npm run db:migrate:local --workspace=apps/worker`
4. `npm run dev --workspace=apps/worker` → <http://localhost:8787>. For live app reloading, also run `npm run dev` (Vite on port 5173 forwards `/api` to 8787).
