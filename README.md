# Tab Organizer (Chrome Extension)

**Single purpose:** Organize your open tabs by website (hostname) with one click.

- One-click tab organization
- Groups tabs by hostname (e.g., all `docs.google.com` together)
- Keeps pinned tabs in place
- Minimal permissions: only `"tabs"`
- No data collection – works entirely in your browser

## Install (local development)
1. Clone this repo.
2. Open `chrome://extensions` → enable **Developer mode**.
3. Click **Load unpacked** → select this folder.
4. Click the toolbar icon or use **Alt+Shift+H**.

## Publish to Chrome Web Store
1. Zip this folder.
2. Upload the ZIP in the Chrome Web Store Developer Dashboard.
3. Use `privacy.html` URL for the privacy policy field (GitHub Pages recommended).

## Permission Justification
The extension requests only the `"tabs"` permission to read and reorder tabs in the current window. No host permissions; no page content is read or transmitted.

## Privacy
Tab Organizer does not collect, store, or share user data. See [privacy.html](./privacy.html).

## License
MIT
