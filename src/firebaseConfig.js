import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl3ANQrBh8XgIpbJXfDA3P4peVE2IMkIs",
  authDomain: "sitecta-18bf9.firebaseapp.com",
  projectId: "sitecta-18bf9",
  storageBucket: "sitecta-18bf9.firebasestorage.app",
  messagingSenderId: "990473376468",
  appId: "1:990473376468:web:00835c1605cc9d3b546141",
  measurementId: "G-VTXKL4S19C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);