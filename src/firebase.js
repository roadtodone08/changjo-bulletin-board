import { initializeApp } from "firebase/app";

import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQIo0NWuCLZAewZdBnzgH1CYGBV5U4cOA",
  authDomain: "changjo-bulletin-board.firebaseapp.com",
  databaseURL: "https://changjo-bulletin-board-default-rtdb.firebaseio.com",
  projectId: "changjo-bulletin-board",
  storageBucket: "changjo-bulletin-board.firebasestorage.app",
  messagingSenderId: "826120461618",
  appId: "1:826120461618:web:1d482a786b49a9450d4b2b",
  measurementId: "G-KCLWCEGQLC"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;