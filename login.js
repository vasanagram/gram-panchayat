import { auth } from "./firebase-config.js";

import {
signInWithEmailAndPassword,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// પહેલેથી Login હોય તો સીધા Admin Panel
onAuthStateChanged(auth,(user)=>{

if(user){

window.location.href="admin.html";

}

});

const loginForm=document.getElementById("loginForm");

loginForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value.trim();

const error=document.getElementById("error");

error.textContent="";

try{

await signInWithEmailAndPassword(auth,email,password);

window.location.href="admin.html";

}catch(err){

switch(err.code){

case "auth/invalid-credential":

error.textContent="ઈમેલ અથવા પાસવર્ડ ખોટો છે.";

break;

case "auth/invalid-email":

error.textContent="માન્ય ઈમેલ દાખલ કરો.";

break;

case "auth/too-many-requests":

error.textContent="ઘણા પ્રયત્નો થયા છે. થોડા સમય પછી ફરી પ્રયાસ કરો.";

break;

default:

error.textContent="લૉગિન કરવામાં સમસ્યા આવી.";

}

}

});