# Firebase deployment

1. In Firebase Console, enable **Authentication > Sign-in method > Email/Password** and deliberately create the owner user.
2. Copy that user's UID into local `.env` as `VITE_FIREBASE_OWNER_UID`, alongside the Firebase web configuration values. `.env.example` intentionally contains placeholders only.
3. In Firestore, create `owners/<OWNER_UID>` using the Console or trusted Admin SDK. Do **not** grant a client write access to this document.
4. Create Firestore in production mode, then deploy [firestore.rules](./firestore.rules): `npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID`.

The database schema is `users/{uid}/sections/{sectionId}/{collection}/{recordId}`, where collections are `tasks`, `resources`, `notes`, `shortNotes`, and `progress`. The configured syllabus remains static in `src/config/sections.ts`.

The client UID check is a usability guard only. The owner document and Firestore rules are the authoritative, fail-closed access control.
