
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfY5XtfWqi4aJQHSoCBsyO0EtpcTqLeqc",
  authDomain: "applycheyai.firebaseapp.com",
  projectId: "applycheyai",
  storageBucket: "applycheyai.firebasestorage.app",
  messagingSenderId: "99564129724",
  appId: "1:99564129724:web:168c4cf517276c433e6fb9",
  measurementId: "G-1Q36RCVNSL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }
