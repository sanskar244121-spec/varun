import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHvP82ArsdblUc1MU8WazZoU2ZtLZhuKc",
  authDomain: "ytm-medicine-advisor-2ce0a.firebaseapp.com",
  projectId: "ytm-medicine-advisor-2ce0a",
  storageBucket: "ytm-medicine-advisor-2ce0a.firebasestorage.app",
  messagingSenderId: "919063962330",
  appId: "1:919063962330:web:b6b58194cf93989eb43be3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
