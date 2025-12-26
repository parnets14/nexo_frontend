// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwED6Sq3-6cUPJ4QcCdj6xAqEiXfP0J9c",
  authDomain: "nexo-7fc25.firebaseapp.com",
  projectId: "nexo-7fc25",
  storageBucket: "nexo-7fc25.firebasestorage.app",
  messagingSenderId: "592565521792",
  appId: "1:592565521792:web:0842ec948362df3e720565",
  measurementId: "G-11HMWKHPJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };

