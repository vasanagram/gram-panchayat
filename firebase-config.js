import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxq401x9TSuV8Ec67p1ArGwTa3NzuGS3w",
  authDomain: "vasanachaudharigrampanchayat.firebaseapp.com",
  projectId: "vasanachaudharigrampanchayat",
  storageBucket: "vasanachaudharigrampanchayat.firebasestorage.app",
  messagingSenderId: "1090383040196",
  appId: "1:1090383040196:web:894285936b1d481e970391",
  measurementId: "G-0CGSNWFW59"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);