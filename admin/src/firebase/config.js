import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBW3ZqpCl4qOPRhGOuVxRvtw1I5vlhgx20",
  authDomain: "freshtokri-d17c2.firebaseapp.com",
  projectId: "freshtokri-d17c2",
  storageBucket: "freshtokri-d17c2.firebasestorage.app",
  messagingSenderId: "728043173885",
  appId: "1:728043173885:web:c624658a5329cf2df64b94",
  measurementId: "G-DB4SG1G5CR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
