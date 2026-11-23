# Kenganda service provider form

Reusable public intake form based on the supplied Service Contract. Every submission includes its own event name and date. It collects provider name, address, email, phone, services, currency, total, deposit, balance, payment method and contact consent. It collects details to prepare a contract; it does not sign a contract or impose the source document's ambiguous cancellation terms.

## Current status

Source prepared locally. The response spreadsheet has been created and its private link was provided separately to the owner.

Its Responses tab has 15 headers, a frozen header row, filters and number formatting. The repository is https://github.com/KengandaAccts/kenganda-service-provider-form. Live Google authorization, deployment and a real submission test remain necessary. Backend checks passed using mocked Google services, and frontend JavaScript syntax passed. Browser layout and live Google execution have not been tested; spreadsheet formatting was checked through API metadata only.

## 1. Create the private response spreadsheet and backend

1. Open https://script.google.com/ using the Google account that should own the responses. Create a new project named **Kenganda Service Form**.
2. Replace `Code.gs` with `apps-script/Code.gs` from this folder. Add an HTML file named `Form` and paste `apps-script/Form.html` into it.
3. In Project Settings, enable showing `appsscript.json`. Replace its content with `apps-script/appsscript.json`.
4. Under Project Settings → Script properties, add `SPREADSHEET_ID` with the ID from your private response spreadsheet URL (the portion between `/d/` and `/edit`). Use an account with edit access to that spreadsheet. Do not share the response spreadsheet publicly or commit its ID here.
5. Add another script property, `ACCEPTING_RESPONSES`, with value `true`.
6. Choose Deploy → New deployment → Web app. Execute as **Me** and choose **Anyone** for access, then deploy. If your Workspace policy does not offer anonymous access, an administrator must enable it or another backend is needed.
7. Copy the deployed URL ending in `/exec` into the quoted value in `config.js`. This URL is public; it is not a credential. No Google credentials or spreadsheet ID belong in frontend files.

The backend uses Google HTML Service and `google.script.run`, avoiding cross-origin submission workarounds. Public visitors can submit but no public method returns response rows. Underscore-suffixed helpers cannot be called through the browser RPC interface. Backend changes require a new deployment version.

## 2. Publish via GitHub

1. Open https://github.com/KengandaAccts/kenganda-service-provider-form.
2. Complete the Google backend setup above and save its deployed `/exec` URL in `config.js`.
3. In repository Settings → Pages, select **GitHub Actions** as the source.
4. Run **Publish form** in the Actions tab after configuring Pages. The included `.github/workflows/pages.yml` also publishes on pushes to `main`. The form's usual public address will be `https://kengandaaccts.github.io/kenganda-service-provider-form/`; use the URL returned by the successful deployment rather than treating this expected address as live.

GitHub hosts the public wrapper and source; the embedded Google Apps Script web app serves the form and saves rows. The wrapper includes a direct link in case a visitor's browser blocks the embedded form.

## 3. Verify before sharing

- Open the deployed page signed out or in a private window.
- Submit a clearly labelled test event/provider with total 100 and deposit 25. Confirm a single row appears with balance 75 and the correct event date.
- Check that an excessive deposit, missing consent and missing contact details prevent submission.
- Confirm the success reference matches the spreadsheet's Submission ID.
- Verify the sheet remains private. Remove only your test row after the check.
- Check the layout on a phone and desktop.

The backend validates input again, neutralizes spreadsheet formula prefixes, uses a write lock and deduplicates retry attempts by submission ID. A hidden honeypot offers basic bot filtering; this is not robust spam protection. Apps Script quotas apply. Set `ACCEPTING_RESPONSES` to `false` to close submissions without changing the public link.

The frontend does not report success until the server confirms a saved row. Failed submissions preserve the entered details. It stores no provider details in browser storage.

References: https://developers.google.com/apps-script/guides/web and https://developers.google.com/apps-script/guides/html/communication
