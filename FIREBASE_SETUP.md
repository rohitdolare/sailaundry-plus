# Firebase / Firestore Setup – Fix "No Data" and "Failed to Load"

If **orders are not showing** and **Create Order** shows "Failed to load users or catalog", the usual cause is **Firestore Security Rules** blocking reads.

## 1. Deploy Firestore rules

This project includes a `firestore.rules` file. You need to deploy it so the app can read/write data.

### Option A: Using Firebase CLI (recommended)

1. Install Firebase CLI (if needed):
   ```bash
   npm install -g firebase-tools
   ```

2. Log in and select your project:
   ```bash
   firebase login
   firebase use <your-project-id>
   ```

3. Initialize Firestore in this folder (only if you don’t have `firebase.json` yet):
   ```bash
   firebase init firestore
   ```
   When asked for the rules file, choose **firestore.rules** (or the default). When asked for the indexes file, you can use the default or skip.

4. Deploy only the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option B: Using Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/) → your project.
2. Go to **Firestore Database** → **Rules**.
3. Replace the rules with the contents of the `firestore.rules` file in this repo.
4. Click **Publish**.

## 2. What the rules do

- **users**: Logged-in users can read any user doc (so admin can load the customer list). Users can only write their own document.
- **orders**: Logged-in users can read and create orders (customers see their orders, admin sees all and can create/update).
- **catalog**: Logged-in users can read. Writes are disabled from the client (you can seed from the console or a backend).

## 3. Seed the catalog (optional)

If the **catalog** collection is empty, the app uses a built-in fallback list. To store the catalog in Firestore instead:

1. In the browser console (on your app), run:
   ```js
   import { seedCatalog } from './src/services/firestore/catalog';
   await seedCatalog();
   ```
   Or add a one-time button in your app that calls `seedCatalog()`.

2. Or in Firebase Console → Firestore, create a **catalog** collection and add documents (e.g. `Men`, `Women`, `Kids`, `Household`) with fields `name` and `items` as in your app.

## 4. After deploying rules

- **Orders** should show on the customer Orders page and on the admin All Orders page.
- **Create Order (admin)** should load; the customer list will appear if `getAllUsers` can read the `users` collection. If the list is empty, use **Walk-in** to create orders.

If it still fails, check the browser console (F12 → Console) for the exact error and confirm your Firebase project ID and env vars match the app config.
