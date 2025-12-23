# Firebase Setup Guide 🔥

Schritt-für-Schritt-Anleitung zur Einrichtung von Firebase für die Urheberrecht Lern-App.

## Schritt 1: Firebase-Projekt erstellen

1. Gehen Sie zu [Firebase Console](https://console.firebase.google.com/)
2. Klicken Sie auf "Projekt hinzufügen" / "Add Project"
3. Geben Sie einen Projektnamen ein (z.B. "urheberrecht-lernapp")
4. Google Analytics können Sie optional aktivieren oder überspringen
5. Klicken Sie auf "Projekt erstellen"

## Schritt 2: Web-App registrieren

1. In der Firebase Console, klicken Sie auf das Web-Icon (</>) 
2. App-Spitzname eingeben (z.B. "Lern-App Web")
3. **Firebase Hosting NICHT aktivieren** (wir verwenden Vercel)
4. Klicken Sie auf "App registrieren"
5. **Kopieren Sie die Firebase Config** - Sie brauchen diese gleich!

Die Config sieht so aus:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

## Schritt 3: Authentication aktivieren

1. In der Firebase Console, gehen Sie zu **Authentication**
2. Klicken Sie auf "Get Started" / "Jetzt starten"
3. Wählen Sie **Sign-in method** / **Anmeldemethode**
4. Aktivieren Sie **Email/Password**:
   - Klicken Sie auf "Email/Password"
   - Schalter auf "Aktiviert"
   - Speichern

**Wichtig:** Email-Link-Anmeldung können Sie deaktiviert lassen - wir brauchen nur Email/Password.

## Schritt 4: Firestore Database erstellen

1. In der Firebase Console, gehen Sie zu **Firestore Database**
2. Klicken Sie auf "Datenbank erstellen" / "Create database"
3. Wählen Sie **Produktionsmodus starten** (Production mode)
   - Wir setzen gleich eigene Security Rules
4. Wählen Sie einen Standort (z.B. `eur3` für Europa)
5. Klicken Sie auf "Aktivieren" / "Enable"

## Schritt 5: Firestore Security Rules einrichten

1. In Firestore Database, gehen Sie zum Tab **Rules**
2. Ersetzen Sie die Standard-Rules mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Jeder User kann nur seine eigenen Daten lesen/schreiben
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Klicken Sie auf **Veröffentlichen** / **Publish**

## Schritt 6: Firebase Config in die App eintragen

1. Öffnen Sie die Datei `js/firebase-config.js`
2. Ersetzen Sie die Platzhalter mit Ihren echten Werten:

```javascript
const firebaseConfig = {
    apiKey: "IHRE_API_KEY",  // ← Von Schritt 2 kopieren
    authDomain: "IHR_PROJECT_ID.firebaseapp.com",
    projectId: "IHR_PROJECT_ID",
    storageBucket: "IHR_PROJECT_ID.appspot.com",
    messagingSenderId: "IHRE_SENDER_ID",
    appId: "IHRE_APP_ID"
};
```

## Schritt 7: Testen

1. Starten Sie die App lokal:
   ```bash
   python3 -m http.server 8000
   ```
   Oder öffnen Sie einfach `index.html` im Browser

2. **Registrieren Sie einen Test-Account:**
   - Email: test@example.com
   - Passwort: test123

3. **Überprüfen Sie in Firebase Console:**
   - **Authentication → Users**: Neuer User sollte erscheinen
   - **Firestore → Data**: Neues Dokument in `users/` Collection

## Fehlerbehebung

### Fehler: "Firebase: Error (auth/unauthorized-domain)"
**Lösung:** Fügen Sie Ihre Domain zu den autorisierten Domains hinzu:
1. Firebase Console → Authentication → Settings
2. Tab "Authorized domains"
3. Fügen Sie Ihre Vercel-Domain hinzu (z.B. `your-app.vercel.app`)

### Fehler: "Missing or insufficient permissions"
**Lösung:** Überprüfen Sie Firestore Security Rules (Schritt 5)
- User muss eingeloggt sein
- `userId` in Firestore muss mit Firebase Auth UID übereinstimmen

### Login funktioniert, aber keine Daten gespeichert
**Lösung:** Öffnen Sie Browser-Console (F12) und prüfen Sie:
- Gibt es Firestore-Fehler?
- Sind die Security Rules korrekt?
- Läuft die App über HTTP oder HTTPS? (Bei localhost ist HTTP okay)

## Vercel Deployment

Nachdem Firebase konfiguriert ist, deployen Sie auf Vercel:

```bash
# Vercel CLI installieren
npm install -g vercel

# Im Projektordner deployen
vercel

# Produktions-Deployment
vercel --prod
```

Nach dem Deployment:
1. Kopieren Sie die Vercel-URL (z.B. `https://urheberrecht-lernapp.vercel.app`)
2. Fügen Sie sie zu Firebase Authorized Domains hinzu (siehe oben)

## GitHub Integration (Optional)

1. Erstellen Sie ein GitHub-Repository
2. Pushen Sie den Code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/urheberrecht-lernapp.git
   git push -u origin main
   ```
3. Vercel kann automatisch von GitHub deployen

## Monitoring und Analytics

**User-Aktivität überwachen:**
- Firebase Console → Authentication → Users: Alle registrierten User
- Firestore → Data: User-Fortschritte und Punktestände

**Performance:**
- Firebase Console → Performance (optional aktivieren)
- Analysieren Sie Ladezeiten und Engpässe

## Kosten

**Firebase Spark Plan (Kostenlos):**
- ✅ 50.000 Firestore Document Reads/Tag
- ✅ 20.000 Firestore Document Writes/Tag
- ✅ Unbegrenzte Authentication
- ✅ Ausreichend für 100-500 aktive Lerner

Für größere Installationen: Upgrade auf Firebase Blaze Plan (Pay-as-you-go)

## Backup und Export

**Firestore Daten exportieren:**
```bash
# Firebase CLI installieren
npm install -g firebase-tools

# Login
firebase login

# Export
firebase firestore:export gs://your-bucket-name/backups/$(date +%Y%m%d)
```

## Sicherheits-Best Practices

1. ✅ Firestore Security Rules sind restriktiv (nur eigene Daten)
2. ✅ API Key ist öffentlich, aber durch Rules geschützt
3. ✅ Password-Requirement: Mindestens 6 Zeichen
4. ⚠️ Für Produktion: Email-Verifizierung aktivieren
5. ⚠️ Für Produktion: Rate Limiting einrichten

---

**Bei Problemen:**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- Browser-Console (F12) für Fehlermeldungen prüfen

**Fertig! 🎉 Ihre Lern-App ist jetzt mit Firebase verbunden.**
