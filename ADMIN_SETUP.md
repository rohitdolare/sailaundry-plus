# Admin User Setup – Sai Laundry+

This app supports two roles: **customer** and **admin**. Customers sign up and place orders; admins use the same login page but are redirected to the Admin Panel and can see all orders.

## How to create an admin user

You **do not** create a separate “admin account” in Firebase Auth. You use an existing user (or create one as a customer first) and then mark that user as admin in Firestore.

### Option 1: Make an existing user an admin (recommended)

1. **Ensure the user exists**
   - The user must have signed up at least once (via your app’s Signup page or Firebase Auth).
   - Their profile must exist in Firestore under the `users` collection (this is created when they sign up in your app).

2. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/) → your project.
   - Open **Firestore Database**.

3. **Edit the user document**
   - Go to the **users** collection.
   - Find the document whose **document ID** is the user’s **UID** (same as in Authentication).
   - Open that document and add a field:
     - **Field name:** `role`
     - **Type:** string
     - **Value:** `admin`

4. **Save**
   - Save the document. The next time this user logs in (same email/password as before), they will have `role: "admin"` and will be redirected to `/admin`.

### Option 2: New user, then make admin

1. In your app, go to **Sign up** and create a new account (e.g. `admin@yourdomain.com`).
2. After signup, that user will have `role: "customer"` in Firestore.
3. In Firebase Console → Firestore → **users** → open the document for that user (document ID = their UID).
4. Add or change the field:
   - **Field name:** `role`
   - **Type:** string  
   - **Value:** `admin`
5. Log out and log in again with that account. You will be redirected to the Admin Panel.

## Summary

| Step | Action |
|------|--------|
| 1 | User must exist in Firebase Auth and have a document in Firestore `users/{uid}`. |
| 2 | In Firestore, open `users` → select the user document (ID = UID). |
| 3 | Add field `role` (string) with value `admin`. |
| 4 | User logs in with the same email/password; app treats them as admin and redirects to `/admin`. |

## Security note

- Anyone who can edit Firestore (e.g. via Console or Admin SDK) can set `role: "admin"`.  
- For production, restrict Firestore so only trusted backends or admins can write the `users` collection, or use Firebase Admin SDK / Custom Claims for admin checks.

## After setup

- **Admin login:** Use the same **Login** page; enter the admin user’s email and password. You will be sent to `/admin` (Dashboard).
- **Customer login:** Same Login page; users with `role: "customer"` (or no `role`) go to `/` (customer home).
