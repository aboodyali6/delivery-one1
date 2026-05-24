import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFRtvtQcCHBRybh1RyP_mACylpKef7XLk",
  authDomain: "delivery-app-d8360.firebaseapp.com",
  databaseURL: "https://delivery-app-d8360-default-rtdb.firebaseio.com",
  projectId: "delivery-app-d8360",
  storageBucket: "delivery-app-d8360.firebasestorage.app",
  messagingSenderId: "705891536781",
  appId: "1:705891536781:web:446810eff17c7fb7a3f7c4",
  measurementId: "G-R1KR7HHSNV"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
