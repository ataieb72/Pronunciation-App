# Deployment Guide

**Status:** Part 1 ready (2026-09-25). Part 3 lands with task R1-T06.

Never paste a key or token into a chat, an issue, a commit, or any file in this repository. Keep it in a password manager until a step below tells you where it goes.

## Part 1 — Retire v1 and secure the Azure key (do this now)

v1 runs on Render with no login and passes any text to Azure's text-to-speech. Anyone who finds its address can use your Azure quota. Kill the key first, then remove the service.

### 1a. Regenerate the Azure keys (kills the old key at once)

1. Open <https://portal.azure.com> and sign in.
2. In the top search bar, type the name of your Speech resource, or type **Speech services** and open the list.
3. Open the resource that v1 used.
4. In the left menu, under **Resource Management**, select **Keys and Endpoint**.
5. Select **Regenerate Key1**, then confirm.
6. Select **Regenerate Key2**, then confirm. Now the old key no longer works anywhere.
7. Note the **Location/Region** shown on the same page (for example `eastus` or `francecentral`). You will need it later.
8. Copy the new **KEY 1** into your password manager. Do not share it.

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

## Part 3 — First deploy (R1-T06, coming)

Covers: a Cloudflare API token for GitHub Actions, GitHub repository secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `AZURE_SPEECH_KEY`, `PAIRING_CODE`), the region variable, the first deploy from the GitHub web page, and pairing your phone.
