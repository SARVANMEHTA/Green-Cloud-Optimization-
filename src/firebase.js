import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from Google Cloud
const firebaseConfig = {
    apiKey: "AIzaSyDFjCJt5FMvwtyh3aeOQ9wBy-K1ShvSkc8",
    authDomain: "green-cloud-optimization.firebaseapp.com",
    projectId: "green-cloud-optimization",
    storageBucket: "green-cloud-optimization.firebasestorage.app",
    messagingSenderId: "71075465517",
    appId: "1:71075465517:web:6826673ccbcef495d92ba4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
