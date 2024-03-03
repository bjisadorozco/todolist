// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlRh_srXwNflQZfpbe_BMxRbEiPUaxh7w",
  authDomain: "to-do-list-8322a.firebaseapp.com",
  projectId: "to-do-list-8322a",
  storageBucket: "to-do-list-8322a.appspot.com",
  messagingSenderId: "585480243746",
  appId: "1:585480243746:web:045678277311b75b33187b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);