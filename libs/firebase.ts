import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyClILLtsMAoVlfc_k2WZCYygFYnPIee5to",
    authDomain: "zift-83ef7.firebaseapp.com",
    projectId: "zift-83ef7",
    storageBucket: "zift-83ef7.firebasestorage.app",
    messagingSenderId: "166734067721",
    appId: "1:166734067721:web:4b4b23f804c0028d0c60d8",
    measurementId: "G-HZ028H44L0"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };