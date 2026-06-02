# Firebase Setup Guide — Smith Daily News

Project ID: `daily-ai-news-c6c23`

---

## Step 1: Enable Firestore Database

1. Vào **Firebase Console** → [https://console.firebase.google.com/project/daily-ai-news-c6c23](https://console.firebase.google.com/project/daily-ai-news-c6c23)
2. Sidebar → **Build** → **Firestore Database**
3. Click **Create database**
4. Chọn location: **asia-southeast1 (Singapore)** — gần VN nhất
5. Chọn **Start in production mode** (rules sẽ deploy riêng)
6. Click **Create**

---

## Step 2: Enable Authentication + SSO Providers

1. Sidebar → **Build** → **Authentication**
2. Click **Get started**
3. Tab **Sign-in method** → enable từng provider:

### Google
- Click **Google** → toggle **Enable**
- Fill **Project support email**: `luanle@vulcanlabs.co`
- Click **Save**

### GitHub
- Click **GitHub** → toggle **Enable**
- Cần tạo GitHub OAuth App:
  1. Vào [https://github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**
  2. **Application name**: `Smith Daily News`
  3. **Homepage URL**: `https://daily-ai-news-c6c23.firebaseapp.com`
  4. **Authorization callback URL**: copy từ Firebase console (dạng `https://daily-ai-news-c6c23.firebaseapp.com/__/auth/handler`)
  5. Click **Register application**
  6. Copy **Client ID** + generate **Client Secret**
- Quay lại Firebase → paste Client ID + Client Secret → **Save**

### Microsoft
- Click **Microsoft** → toggle **Enable**
- Cần tạo Azure AD App:
  1. Vào [https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
  2. **New registration**
  3. **Name**: `Smith Daily News`
  4. **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
  5. **Redirect URI**: Web → paste callback URL từ Firebase console
  6. Click **Register**
  7. Copy **Application (client) ID**
  8. **Certificates & secrets** → **New client secret** → copy value
- Quay lại Firebase → paste Client ID + Client Secret → **Save**

### Apple
- Click **Apple** → toggle **Enable**
- Cần Apple Developer account ($99/year):
  1. Vào [https://developer.apple.com/account/resources/identifiers/list/serviceId](https://developer.apple.com/account/resources/identifiers/list/serviceId)
  2. Tạo **Services ID** → enable **Sign in with Apple**
  3. Configure domains + return URL từ Firebase console
  4. Tạo **Key** cho Sign in with Apple, download `.p8` file
- Quay lại Firebase → fill Services ID, Team ID, Key ID, upload private key → **Save**

> **Tip:** Có thể bỏ qua Apple lúc đầu, enable Google + GitHub trước là đủ test.

---

## Step 3: Deploy Firestore Security Rules

Cách 1 — **Firebase CLI** (recommended):

```bash
# Install Firebase CLI nếu chưa có
npm install -g firebase-tools

# Login
firebase login

# Deploy rules + indexes
cd ai-news-platform
firebase deploy --only firestore:rules,firestore:indexes --project daily-ai-news-c6c23
```

Cách 2 — **Firebase Console** (manual):

1. Sidebar → **Firestore Database** → tab **Rules**
2. Paste nội dung file `firestore.rules` vào editor
3. Click **Publish**

Indexes:
1. Tab **Indexes** → **Add index** cho từng index trong `firestore.indexes.json`
2. Hoặc indexes sẽ tự tạo khi app query lần đầu (Firebase sẽ show link trong console error)

---

## Step 4: Verify .env.local

File `.env.local` đã có sẵn config đúng. Verify lại:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDMDjphxGV7ZYpjZx9x_rRlPKv7y9-Ph1Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=daily-ai-news-c6c23.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=daily-ai-news-c6c23
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=daily-ai-news-c6c23.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1009421135196
NEXT_PUBLIC_FIREBASE_APP_ID=1:1009421135196:web:87583eb5a8c98dc65f2599
```

---

## Step 5: Test Login Flow

1. `npm run dev`
2. Mở `http://localhost:3000/login`
3. Click **Continue with Google**
4. Sign in → redirect về dashboard
5. Check Firestore console → collection `users` → should see your user document

---

## Firestore Data Structure

```
users/{uid}
├── email, displayName, photoURL, provider
├── preferences: { timezone, language, digestTime, focusAreas }
├── createdAt, updatedAt
│
├── connectors/{provider}
│   ├── status, accessToken (encrypted), refreshToken (encrypted)
│   ├── tokenExpiresAt, scopes, metadata
│   └── lastSyncAt, connectedAt
│
├── topics/{topicId}
│   ├── name, description, keywords[], sources[]
│   ├── isActive, priority
│   ├── createdAt, updatedAt
│   │
│   └── updates/{updateId}
│       ├── source, sourceId, title, summary, url
│       ├── relevanceScore, metadata
│       └── fetchedAt, readAt
│
└── digests/{date}  (e.g. "2026-05-28")
    ├── issueNumber, status, generatedAt, updatedAt
    ├── stories[], repos[]
    ├── stats: { totalStories, sourcesQueried, topicsMatched }
    └── signalSources[]
```

---

## Security Rules Summary

| Path | Read | Write (client) | Write (server) |
|------|------|-----------------|-----------------|
| `users/{uid}` | Owner only | Owner only | Admin SDK |
| `users/{uid}/connectors/{p}` | Owner only | Owner only | Admin SDK |
| `users/{uid}/topics/{id}` | Owner only | Owner only | Admin SDK |
| `users/{uid}/topics/{id}/updates/{u}` | Owner only | Denied | Admin SDK |
| `users/{uid}/digests/{date}` | Owner only | Denied | Admin SDK |

> **Note:** Cron worker dùng Firebase Admin SDK (server-side) nên bypass rules. Chỉ client-side bị rules restrict.
