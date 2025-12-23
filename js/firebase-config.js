// Firebase Configuration for Urheberrecht Lern-App
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
  apiKey: "AIzaSyArhwLEYm1rFl1KNb-7GphY3ixRHZi41Zo",
  authDomain: "ecr-base-36996.firebaseapp.com",
  projectId: "ecr-base-36996",
  storageBucket: "ecr-base-36996.firebasestorage.app",
  messagingSenderId: "60683099974",
  appId: "1:60683099974:web:d98f032a1b7c57870ccf47"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support persistence.');
        }
    });
