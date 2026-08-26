import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==========================================
// FORCE LOGIN
// ==========================================

const params = new URLSearchParams(
  window.location.search
);

const forceLogin =
  params.get("force") === "1";


// Admin button પરથી આવીએ ત્યારે
// જૂનું Firebase login session clear કરો
if (forceLogin) {

  try {

    await signOut(auth);

  } catch (error) {

    console.warn(
      "જૂનું login session clear કરવામાં સમસ્યા:",
      error
    );

  }

}


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm =
  document.getElementById("loginForm");


loginForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    const email =
      document
        .getElementById("email")
        .value
        .trim();


    const password =
      document
        .getElementById("password")
        .value
        .trim();


    const error =
      document.getElementById("error");


    error.textContent = "";


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      // Login સફળ
      window.location.href =
        "admin.html";


    } catch (err) {


      switch (err.code) {


        case "auth/invalid-credential":

          error.textContent =
            "ઈમેલ અથવા પાસવર્ડ ખોટો છે.";

          break;


        case "auth/invalid-email":

          error.textContent =
            "માન્ય ઈમેલ દાખલ કરો.";

          break;


        case "auth/too-many-requests":

          error.textContent =
            "ઘણા પ્રયત્નો થયા છે. થોડા સમય પછી ફરી પ્રયાસ કરો.";

          break;


        default:

          error.textContent =
            "લૉગિન કરવામાં સમસ્યા આવી.";

      }

    }

  }
);