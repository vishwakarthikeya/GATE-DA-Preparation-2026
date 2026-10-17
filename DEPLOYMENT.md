# Production launch guide

## GitHub Pages

1. Push this project to GitHub with the default branch named `main` (or change `.github/workflows/deploy-pages.yml` to match).
2. In **Settings > Pages**, select **GitHub Actions** as the source.
3. In **Settings > Secrets and variables > Actions > Variables**, add every public `VITE_FIREBASE_*` value listed in `.env.example`, including `VITE_FIREBASE_OWNER_UID`. These are public web configuration values, not service-account secrets.
4. Push to `main` or run the workflow manually. The workflow sets `VITE_BASE_PATH` to `/<repository-name>/`; do not hardcode a repository name in source.

GitHub Pages is public hosting. Private study content is never built into the static site; Firebase Authentication and `firestore.rules` enforce private data access.

## PWA

Production builds generate the manifest and service worker. In Chromium desktop browsers, use **Install App** when it appears. On mobile, use the browser menu’s **Add to Home Screen** action. The app shell may load offline, but cloud-authenticated study data requires a connection and is not placed in service-worker caches.

## Firebase

Follow `FIREBASE.md` to enable Email/Password authentication, create the owner account, create `owners/<OWNER_UID>` in Firestore Console, and deploy the rules. Never use permissive rules to troubleshoot deployment.
