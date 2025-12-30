import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQ6HzTSnBCRJwhAkpcaog3JkxHdmK4MlU",
  authDomain: "dumo-5adbd.firebaseapp.com",
  projectId: "dumo-5adbd",
  storageBucket: "dumo-5adbd.firebasestorage.app",
  messagingSenderId: "119303130210",
  appId: "1:119303130210:web:2511ab0bd246374e3e553b",
  measurementId: "G-D2T5YJ16RT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);