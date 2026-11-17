# Little Notes

A small, dependency-free notes app. Notes stay in this browser on this device; there is no account, server storage, or sync.

## Start locally

From any directory, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /Users/yapweijun/Documents/GitHub/crumb-and-co/aic-pwa-demo
```

Open <http://127.0.0.1:8765/>. Stop the server with Ctrl+C. Service workers and installation require a secure context (HTTPS or localhost); opening the HTML file directly is not supported. To test a nested deployment, serve the parent directory instead and open `/aic-pwa-demo/`.

## Offline and installation

On the first online visit, the service worker downloads the app shell, manifest, and icons. Wait for registration and installation to finish before testing offline; a reload may be needed for the page to be controlled. Subsequent visits and reloads can work offline, including when the app is hosted in a subdirectory. The connection indicator reflects the browser's network signal, not a guarantee of internet access or cache readiness. Browser storage eviction or clearing site data can remove the offline shell.

The Install app button appears only when the browser supplies an install prompt. Depending on the browser and platform, use its install menu or the share menu's Add to Home Screen option instead; installation and prompts are not universal. HTTPS or localhost is required for installability in supporting browsers.

## Data limitations

Notes are stored in localStorage, scoped to the origin and browser profile. They do not sync or transfer to another device, browser, profile, hostname, or port. Clearing site data, private browsing, storage eviction, or uninstalling an app may remove them. There is no backup or export; do not rely on this app as the sole copy of important information. Storage can be blocked or full: the app reports failures and leaves the draft in place. If existing saved data cannot be read, saving is disabled to avoid overwriting it.

## Manual browser QA

Use a fresh browser profile and the exact committed version. Open developer tools and check the console and network panel for errors or missing assets. Verify:

1. Manifest loads with the correct name, start URL, scope and both PNG icons; inspect the service worker registration and wait for the shell to cache.
2. Add a note, edit it, cancel an edit, search for matching and missing text, and reload to check persistence. Test text resembling HTML to ensure it is displayed as text. Cancel and confirm deletion separately.
3. After the first online load and service-worker activation, go offline in developer tools, reload, inspect manifest and icons in cache, and add/edit a note. Reconnect and reload. Repeat from a subdirectory as described above. Check that no unexpected network requests or console errors appear.
4. Check phone-sized and desktop layouts, keyboard navigation and visible focus. Test the install button if offered, or document the browser's install menu and any platform limitation rather than assuming a prompt will appear.
5. Where practical, block storage or exhaust its quota and verify the error message and retained draft.

Independent QA should record browser/version, exact commit, steps and results. Implementation smoke checks are not a substitute for independent browser QA.
