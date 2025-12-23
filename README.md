# Urheberrecht Lern-App 📚

Eine interaktive, gamifizierte Web-App zum Lernen des Schweizer Urheberrechts. Entwickelt mit Best Practices aus der E-Learning-Forschung 2024-2025.

## 🎯 Features

- **4 interaktive Module** zu Grundlagen des Urheberrechts
- **Video/Audio-Einführungen** für jedes Modul (2-5 Min. Microlearning)
- **Szenariobasiertes Lernen** mit Branching-Entscheidungen
- **Gamification** mit Punktesystem und Fortschrittsanzeige
- **Firebase Authentication** für automatisches Login
- **Fortschrittsspeicherung** in Firebase Firestore
- **Personalisiertes Zertifikat** nach Abschluss
- **Mobile-First Design** mit kleinerer Schrift für bessere Übersichtlichkeit
- **WCAG 2.2 AA konform** für Barrierefreiheit

## 📚 Module

1. **Prinzipien Urheberrecht** (100 Punkte)
   - Geistige Schöpfung, individueller Charakter, Schutzfristen

2. **Freie Werke** (75 Punkte)
   - Gemeinfreie Werke, amtliche Erlasse, Creative Commons

3. **Ausnahmen zur Nutzung** (125 Punkte)
   - Fair Use, privater Gebrauch, Parodie, Unterricht

4. **Zitatrecht** (100 Punkte)
   - Die drei Säulen: Zweck, Quellenangabe, Umfang

**Gesamtpunkte:** 400 Punkte maximal

## 🚀 Quick Start

### Voraussetzungen

- Ein Firebase-Projekt (kostenloser Spark-Plan reicht)
- Webhosting oder Vercel-Account für Deployment

### Installation

1. **Firebase-Projekt erstellen**
   - Gehen Sie zu [Firebase Console](https://console.firebase.google.com/)
   - Erstellen Sie ein neues Projekt
   - Aktivieren Sie Authentication (Email/Password)
   - Aktivieren Sie Firestore Database

2. **Firebase-Konfiguration eintragen**
   
   Öffnen Sie `js/firebase-config.js` und ersetzen Sie die Platzhalter mit Ihren Firebase-Credentials:

   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

   Diese Werte finden Sie in Firebase Console unter:
   **Project Settings → General → Your apps → Web app**

3. **Firestore Security Rules einrichten**

   Gehen Sie zu Firestore Database → Rules und fügen Sie ein:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. **Deployment**

   **Option A: Vercel** (empfohlen)
   ```bash
   # Vercel CLI installieren
   npm install -g vercel
   
   # Im Projektordner deployen
   vercel
   ```

   **Option B: GitHub Pages**
   - Repository auf GitHub erstellen
   - Code pushen
   - In Repository Settings → Pages → Source auswählen

   **Option C: Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

## 📁 Projektstruktur

```
urheberrecht-lernapp/
├── index.html                 # Login-Seite
├── dashboard.html             # Modul-Übersicht
├── certificate.html           # Zertifikat
├── css/
│   └── styles.css            # Haupt-Stylesheet
├── js/
│   ├── firebase-config.js    # Firebase-Konfiguration
│   └── common.js             # Gemeinsame Funktionen
├── modules/
│   ├── modul1.html           # Prinzipien Urheberrecht
│   ├── modul2.html           # Freie Werke
│   ├── modul3.html           # Ausnahmen
│   └── modul4.html           # Zitatrecht
├── data/
│   └── textzusammenfassungen-fuer-vertonung.md
└── assets/
    └── audio/                # Hier Audio-Dateien einfügen
```

## 🎤 Audio/Video-Integration

Die App ist vorbereitet für Audio/Video-Inhalte:

1. **Textzusammenfassungen** für Vertonung finden Sie in:
   `data/textzusammenfassungen-fuer-vertonung.md`

2. **Audio-Dateien einfügen:**
   - Speichern Sie Audiodateien in `assets/audio/`
   - Ersetzen Sie Video-Platzhalter in Modul-HTMLs mit:

   ```html
   <audio controls style="width: 100%;">
       <source src="../assets/audio/modul1.mp3" type="audio/mpeg">
       Ihr Browser unterstützt das Audio-Element nicht.
   </audio>
   ```

3. **Video-Plattform nutzen:**
   - YouTube-Videos einbetten:
   ```html
   <iframe width="100%" height="400" 
       src="https://www.youtube.com/embed/VIDEO_ID" 
       frameborder="0" allowfullscreen>
   </iframe>
   ```

## 🔐 Benutzer-Accounts

**Registrierung:**
- Neue Nutzer können sich direkt auf der Login-Seite registrieren
- Email + Passwort (mind. 6 Zeichen)
- Automatische Erstellung des User-Profils in Firestore

**Login:**
- Bestehende Nutzer loggen sich mit Email/Passwort ein
- Firebase Authentication handled Session Management

## 📊 Datenstruktur (Firestore)

```javascript
users/{userId}
{
  email: "user@example.com",
  createdAt: Timestamp,
  modules: {
    modul1: { completed: false, score: 0, progress: 0 },
    modul2: { completed: false, score: 0, progress: 0 },
    modul3: { completed: false, score: 0, progress: 0 },
    modul4: { completed: false, score: 0, progress: 0 }
  },
  totalPoints: 0,
  overallProgress: 0,
  lastUpdated: Timestamp
}
```

## 🎨 Design-Prinzipien

**Mobile-First:**
- Kleinere Schriftgrößen (14px base) für bessere Übersicht
- Touch-Targets mindestens 48x48 Pixel (WCAG 2.2)
- Progressive Disclosure für komplexe Inhalte

**Gamification:**
- Sofortiges Feedback nach jeder Interaktion
- Punktesystem motiviert Weiterlernen
- Visuelle Fortschrittsanzeigen

**Accessibility:**
- WCAG 2.2 AA konform
- Keyboard-Navigation unterstützt
- Screen-Reader-freundlich
- Ausreichende Farbkontraste

## 🔧 Anpassungen

**Farben ändern:**
Bearbeiten Sie CSS-Variablen in `css/styles.css`:

```css
:root {
    --zh-blue: #0050a0;      /* Primärfarbe */
    --zh-red: #dc0018;       /* Akzentfarbe */
    --zh-green: #00994d;     /* Erfolg */
    --zh-gold: #ffd700;      /* Punkte/Highlights */
}
```

**Module hinzufügen:**
1. Neue HTML-Datei in `modules/` erstellen
2. Modul-Karte in `dashboard.html` hinzufügen
3. Firestore-Struktur in `js/common.js` erweitern

**Punktesystem anpassen:**
Ändern Sie `MAX_POINTS` und Punktevergabe in jeweiligen Modul-HTMLs.

## 🐛 Troubleshooting

**Login funktioniert nicht:**
- Prüfen Sie Firebase-Config in `js/firebase-config.js`
- Stellen Sie sicher, dass Email/Password Auth aktiviert ist
- Überprüfen Sie Browser-Console auf Fehler

**Fortschritt wird nicht gespeichert:**
- Überprüfen Sie Firestore Security Rules
- Prüfen Sie Browser-Console auf Permission-Fehler
- Stellen Sie sicher, dass User eingeloggt ist

**Videos werden nicht angezeigt:**
- Ersetzen Sie Video-Platzhalter mit echten Inhalten
- Prüfen Sie Dateipfade
- Testen Sie verschiedene Video-Formate (MP4, WebM)

## 📄 Lizenz

Dieses Projekt ist für Bildungszwecke erstellt. Die Inhalte basieren auf dem Schweizer Urheberrechtsgesetz (URG).

## 🙏 Credits

**Entwickelt mit Best Practices aus:**
- E-Learning Research 2024-2025
- WCAG 2.2 Accessibility Guidelines
- Duolingo Gamification Studies
- Microlearning Video Standards
- Scenario-Based Learning for Compliance

**Technologie-Stack:**
- HTML5, CSS3, JavaScript (Vanilla)
- Firebase Authentication & Firestore
- Responsive Design (Mobile-First)

---

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Troubleshooting-Sektion
2. Konsultieren Sie [Firebase Documentation](https://firebase.google.com/docs)
3. Prüfen Sie Browser-Console auf Fehlermeldungen

**Viel Erfolg mit Ihrer Lern-App! 🚀**
