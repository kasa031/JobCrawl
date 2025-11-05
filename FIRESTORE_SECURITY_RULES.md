# 🔥 Firestore Security Rules

## ⚠️ Viktig
**Dette prosjektet bruker PostgreSQL, ikke Firestore.** Hvis du har et annet prosjekt som bruker Firestore, kan du bruke reglene under.

---

## 📚 Offisielle lenker

- **Firestore Security Rules Dokumentasjon:** https://firebase.google.com/docs/firestore/security/get-started
- **Security Rules Reference:** https://firebase.google.com/docs/rules/rules-language
- **Best Practices:** https://firebase.google.com/docs/firestore/security/best-practices

---

## 🔒 Eksempel Security Rules

### Basic Rules (Kopier og lim inn i Firestore Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Hjelpefunksjon: Sjekk om bruker er autentisert
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Hjelpefunksjon: Sjekk om bruker er eier
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users Collection
    match /users/{userId} {
      // Les: Kun hvis du er logget inn og leser din egen data
      allow read: if isOwner(userId);
      
      // Skriv: Kun hvis du er logget inn og oppdaterer din egen data
      allow write: if isOwner(userId);
      
      // Opprett: Kun hvis du oppretter din egen bruker
      allow create: if isOwner(userId);
    }
    
    // Jobs Collection
    match /jobs/{jobId} {
      // Alle kan lese jobber
      allow read: if true;
      
      // Kun autentiserte brukere kan opprette jobber
      allow create: if isAuthenticated();
      
      // Kun eier kan oppdatere/slette
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Applications Collection
    match /applications/{applicationId} {
      // Kun eier kan lese sine egne søknader
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Kun autentiserte brukere kan opprette søknader
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Kun eier kan oppdatere/slette
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Default: Nei til alt
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🎯 For JobCrawl-lignende app

Hvis du vil bruke Firestore for JobCrawl i stedet for PostgreSQL:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Job Listings - Alle kan lese, kun admin kan skrive
    match /jobListings/{jobId} {
      allow read: if true;
      allow write: if isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User Profiles
    match /profiles/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Applications
    match /applications/{applicationId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // CV Uploads (Storage må også ha regler)
    match /cvs/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

---

## 📝 Hvordan legge til i Firestore

1. Gå til: https://console.firebase.google.com/
2. Velg ditt prosjekt
3. Gå til **Firestore Database** → **Rules**
4. Lim inn reglene over
5. Klikk **Publish**

---

## ⚠️ Viktige sikkerhetstips

1. **Test alltid reglene først** med Firestore Emulator
2. **Ikke tillat lesing av sensitive data** (passord, tokens)
3. **Bruk validering** for å sikre korrekt dataformat
4. **Ikke stol på klientvalidering** - regler er den eneste sikkerheten
5. **Bruk `request.auth.uid`** for å sikre at brukere kun kan aksessere sin egen data

---

## 🔗 Relaterte lenker

- **Firestore Storage Security Rules:** https://firebase.google.com/docs/storage/security
- **Firebase Authentication:** https://firebase.google.com/docs/auth
- **Firestore Emulator:** https://firebase.google.com/docs/emulator-suite

