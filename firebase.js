 import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/*=========================================
LOADER
=========================================*/

window.addEventListener("load",()=>{

const loader=document.getElementById("loader");

if(loader){

loader.style.display="none";

}

});

/*=========================================
SCROLL TOP
=========================================*/

const scrollTop=document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

scrollTop.style.display="flex";

}else{

scrollTop.style.display="none";

}

});

scrollTop?.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

/*=========================================
DARK MODE
=========================================*/

const darkBtn=document.getElementById("darkBtn");

if(localStorage.getItem("theme")=="dark"){

document.body.classList.add("dark");

}

darkBtn?.addEventListener("click",()=>{

document.body.classList.toggle("dark");

if(document.body.classList.contains("dark")){

localStorage.setItem("theme","dark");

}else{

localStorage.setItem("theme","light");

}

});

/*=========================================
MOBILE MENU
=========================================*/

const menuBtn=document.getElementById("menuBtn");

const nav=document.querySelector("nav");

menuBtn?.addEventListener("click",()=>{

nav.classList.toggle("show");

});

/*=========================================
WEBSITE SETTINGS
=========================================*/

async function loadWebsite(){

const docSnap = await getDoc(doc(db,"website","settings"));

if(docSnap.exists()){

const data = docSnap.data();

if(data.websiteName){
document.getElementById("websiteName").innerText = data.websiteName;
}

if(data.bannerTitle){
document.getElementById("bannerTitle").innerText = data.bannerTitle;
}

if(data.bannerSubtitle){
document.getElementById("bannerSubtitle").innerText = data.bannerSubtitle;
}

if(data.sarpanchName){
document.getElementById("sarpanchName").innerText = data.sarpanchName;
}

if(data.sarpanchMessage){
document.getElementById("sarpanchMessage").innerText = data.sarpanchMessage;
}

if(data.logo){
document.getElementById("logo").src = data.logo;
}

if(data.sarpanchImage){
document.getElementById("sarpanchPhoto").src = data.sarpanchImage;
}

if(data.banner){
document.getElementById("home").style.background =
`linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${data.banner})`;
}

}

}

loadWebsite();

/*=========================================
MEMBERS
=========================================*/

async function loadMembers(){

const container=document.getElementById("membersContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"members"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="member-card">

<img src="${data.image}" alt="">

<h3>${data.name}</h3>

<p>${data.position}</p>

</div>

`;

});

container.innerHTML=html;

}

loadMembers();
/*=========================================
NOTICE BOARD
=========================================*/

async function loadNotices(){

const container=document.getElementById("noticeContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"notices"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="notice-card">

<h3>${data.title}</h3>

<p>${data.description}</p>

<small>${data.date || ""}</small>

</div>

`;

});

container.innerHTML=html;

}

loadNotices();

/*=========================================
PHOTO GALLERY
=========================================*/

async function loadGallery(){

const container=document.getElementById("galleryContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"gallery"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="gallery-card">

<img src="${data.image}" alt="${data.title}">

</div>

`;

});

container.innerHTML=html;

}

loadGallery();

/*=========================================
VIDEO GALLERY
=========================================*/

async function loadVideos(){

const container=document.getElementById("videoContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"videos"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="video-card">

<iframe

src="${data.url}"

allowfullscreen>

</iframe>

<h3>${data.title}</h3>

</div>

`;

});

container.innerHTML=html;

}

loadVideos();

/*=========================================
GRAM SABHA
=========================================*/

async function loadGramSabha(){

const container=document.getElementById("gramsabhaContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"gramsabha"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="gramsabha-card">

<h3>${data.title}</h3>

<p>

<b>તારીખ :</b>

${data.date}

</p>

<p>

<b>સમય :</b>

${data.time}

</p>

<p>

<b>સ્થળ :</b>

${data.place}

</p>

<p>

${data.description}

</p>

</div>

`;

});

container.innerHTML=html;

}

loadGramSabha();
/*=========================================
RESOLUTIONS
=========================================*/

async function loadResolutions(){

const container=document.getElementById("resolutionContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"resolutions"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="document-card">

<i class="fa-solid fa-file-pdf"></i>

<h3>${data.title}</h3>

<p>${data.description || ""}</p>

<a href="${data.file}" target="_blank">

ઠરાવ જુઓ

</a>

</div>

`;

});

container.innerHTML=html;

}

loadResolutions();

/*=========================================
DOCUMENTS
=========================================*/

async function loadDocuments(){

const container=document.getElementById("documentContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"documents"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="document-card">

<i class="fa-solid fa-file-pdf"></i>

<h3>${data.title}</h3>

<a href="${data.file}" target="_blank">

PDF ડાઉનલોડ

</a>

</div>

`;

});

container.innerHTML=html;

}

loadDocuments();

/*=========================================
GOVERNMENT SCHEMES
=========================================*/

async function loadSchemes(){

const container=document.getElementById("schemeContainer");

if(!container) return;

const snapshot=await getDocs(collection(db,"schemes"));

let html="";

snapshot.forEach(doc=>{

const data=doc.data();

html+=`

<div class="scheme-card">

<h3>${data.title}</h3>

<p>${data.desc}</p>

</div>

`;

});

container.innerHTML=html;

}

loadSchemes();

/*=========================================
COMPLAINT FORM
=========================================*/

const complaintForm=document.getElementById("complaintForm");

complaintForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

const name=document.getElementById("name").value.trim();

const mobile=document.getElementById("mobile").value.trim();

const message=document.getElementById("message").value.trim();

try{

await addDoc(collection(db,"complaints"),{

name,

mobile,

message,

status:"Pending",

createdAt:serverTimestamp()

});

alert("તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ.");

complaintForm.reset();

}catch(err){

console.log(err);

alert("ફરિયાદ મોકલવામાં સમસ્યા આવી.");

}

});
/*=========================================
SEARCH
=========================================*/

const searchInput=document.getElementById("searchInput");

searchInput?.addEventListener("keyup",()=>{

const value=searchInput.value.toLowerCase();

document.querySelectorAll("section").forEach(section=>{

if(section.innerText.toLowerCase().includes(value)){

section.style.display="block";

}else{

section.style.display="none";

}

});

if(value==""){

document.querySelectorAll("section").forEach(section=>{

section.style.display="block";

});

}

});

/*=========================================
WHATSAPP
=========================================*/

const whatsappBtn=document.getElementById("whatsappBtn");

whatsappBtn?.addEventListener("click",(e)=>{

e.preventDefault();

window.open(

"https://wa.me/918849148096",

"_blank"

);

});

/*=========================================
CALL BUTTON
=========================================*/

const callBtn=document.getElementById("callBtn");

callBtn?.addEventListener("click",(e)=>{

e.preventDefault();

window.location.href="tel:+918849148096";

});

/*=========================================
GOOGLE MAP
=========================================*/

const mapFrame=document.querySelector("#map iframe");

if(mapFrame){

mapFrame.src="https://www.google.com/maps?q=Vasana%20Chaudhary%20Gandhinagar&output=embed";

}

/*=========================================
SCROLL ANIMATION
=========================================*/

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll(".section").forEach(section=>{

observer.observe(section);

});

/*=========================================
CURRENT YEAR
=========================================*/

const year=document.getElementById("year");

if(year){

year.innerHTML=new Date().getFullYear();

}

/*=========================================
FINAL INITIALIZATION
=========================================*/

console.log("================================");

console.log("VASANA CHAUDHARY");

console.log("GRAM PANCHAYAT WEBSITE");

console.log("Firebase Connected Successfully");

console.log("================================");

let selectedService = "";

function openService(type){

selectedService = type;

const titles = {
birth:"જન્મ પ્રમાણપત્ર",
death:"મૃત્યુ પ્રમાણપત્ર",
income:"આવક દાખલો",
residence:"રહેઠાણ દાખલો",
property:"મિલકત આકારણી",
tax:"ટેક્સ",
complaint:"ફરિયાદ",
status:"અરજીનું સ્ટેટસ"
};

document.getElementById("popupTitle").innerText = titles[type];

document.getElementById("servicePopup").style.display="flex";

}

function closePopup(){

document.getElementById("servicePopup").style.display="none";

document.getElementById("serviceForm").reset();

}

window.openService=openService;
window.closePopup=closePopup;

const serviceForm = document.getElementById("serviceForm");

serviceForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {

    const files = document.getElementById("documents").files;
    let documentUrls = [];

    if (files && files.length > 0) {

      for (let i = 0; i < files.length; i++) {

        const file = files[i];

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "gram_panchayat_upload");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/f62hvppq/auto/upload",
          {
            method: "POST",
            body: formData
          }
        );

        const data = await response.json();

        documentUrls.push({
          name: file.name,
          url: data.secure_url
        });

      }

    }

    const applicationNo = "GP-" + Date.now();

    await addDoc(collection(db, "applications"), {

      service: selectedService,
      name: document.getElementById("applicantName").value,
      mobile: document.getElementById("mobile").value,
      details: document.getElementById("details").value,
      documents: documentUrls,
      applicationNo: applicationNo,
      status: "Pending",
      createdAt: serverTimestamp()

    });

    alert(
      "તમારી અરજી સફળતાપૂર્વક મોકલવામાં આવી.\n\nઅરજી નંબર: " + applicationNo
    );

    serviceForm.reset();
    closePopup();

  } catch (error) {

    console.error(error);
    alert("અરજી મોકલવામાં ભૂલ આવી: " + error.message);

  }

});

const searchBtn = document.getElementById("searchApplicationBtn");

searchBtn?.addEventListener("click", async () => {

  const applicationNo = document
    .getElementById("applicationSearch")
    .value
    .trim();

  const result = document.getElementById("applicationResult");

  if (!applicationNo) {
    result.innerHTML = "કૃપા કરીને અરજી નંબર દાખલ કરો.";
    return;
  }

  const q = query(
    collection(db, "applications"),
    where("applicationNo", "==", applicationNo)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    result.innerHTML = "❌ અરજી નંબર મળ્યો નથી.";
    return;
  }

  snapshot.forEach((doc) => {

    const data = doc.data();
const serviceNames = {
  birth: "જન્મ પ્રમાણપત્ર",
  death: "મૃત્યુ પ્રમાણપત્ર",
  income: "આવક દાખલો",
  residence: "રહેઠાણ દાખલો",
  property: "મિલકત આકારણી",
  tax: "ટેક્સ",
  complaint: "ફરિયાદ"
};
    result.innerHTML = `
      <h3>અરજી મળી ગઈ</h3>
      <p><b>નામ:</b> ${data.name}</p>
<p><b>સેવા:</b> ${serviceNames[data.service] || data.service}</p>
      <p><b>સ્ટેટસ:</b> ${data.status}</p>
    `;

  });

});

function openStatusPopup() {
  document.getElementById("statusPopup").style.display = "flex";
}

function closeStatusPopup() {
  document.getElementById("statusPopup").style.display = "none";
}

window.openStatusPopup = openStatusPopup;
window.closeStatusPopup = closeStatusPopup;