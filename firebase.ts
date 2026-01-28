
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYhmfrcAnWR38liBiK9Hfr0oZgGsdFknk",
  authDomain: "license-653f9.firebaseapp.com",
  projectId: "license-653f9",
  storageBucket: "license-653f9.firebasestorage.app",
  messagingSenderId: "551144492518",
  appId: "1:551144492518:web:525db24ec3e60175325a27",
  measurementId: "G-W99V78VM7Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
