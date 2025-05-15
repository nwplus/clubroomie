import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB40zXXd6ugfkMC_oU3GmnKQ18rF5NutZw",
  authDomain: "nwplus-ubc-dev.firebaseapp.com",
  databaseURL: "https://nwplus-ubc-dev.firebaseio.com",
  projectId: "nwplus-ubc-dev",
  storageBucket: "nwplus-ubc-dev.appspot.com",
  messagingSenderId: "1035779736769",
  appId: "1:1035779736769:web:f1ea2c1a319ebd7d3f4040",
  measurementId: "G-4QW2KG3H2V",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
