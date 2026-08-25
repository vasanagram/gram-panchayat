 import { db, supabase } from "./firebase-config.js";

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
SUPABASE UPLOAD
=========================================*/

async function uploadToSupabase(file){

const extension=file.name.split(".").pop().toLowerCase();

const fileName=
Date.now()+"_"+
Math.random().toString(36).substring(2,8)+
"."+extension;

const arrayBuffer=await file.arrayBuffer();

const blob=new Blob([arrayBuffer],{

type:file.type

});

const {error}=await supabase.storage

.from("uploads")

.upload(fileName,blob,{

cacheControl:"3600",

upsert:true,

contentType:file.type

});

if(error){

throw error;

}

const {data}=supabase.storage

.from("uploads")

.getPublicUrl(fileName);

return data.publicUrl;

}

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

  const container =
    document.getElementById("videoContainer");

  if(!container) return;

  const snapshot =
    await getDocs(
      collection(db,"videos")
    );

  let html = "";

  snapshot.forEach(docSnap => {

    const data = docSnap.data();

    let videoUrl = data.url || "";

    // YouTube URL ને Embed URLમાં ફેરવો
    if (videoUrl.includes("youtube.com/watch?v=")) {

      const videoId =
        videoUrl.split("v=")[1].split("&")[0];

      videoUrl =
        "https://www.youtube.com/embed/" + videoId;

    }

    // youtu.be URL માટે
    else if (videoUrl.includes("youtu.be/")) {

      const videoId =
        videoUrl.split("youtu.be/")[1].split("?")[0];

      videoUrl =
        "https://www.youtube.com/embed/" + videoId;

    }

    html += `

      <div class="video-card">

        <iframe
          src="${videoUrl}"
          width="100%"
          height="300"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>

        <h3>${data.title || "વિડિયો"}</h3>

      </div>

    `;

  });

  container.innerHTML =
    html || "હાલ કોઈ વિડિયો ઉપલબ્ધ નથી.";

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

  const container =
    document.getElementById("schemeContainer");

  if(!container) return;

  try {

    /*=========================================
      OFFICIAL GOVERNMENT LINKS
    =========================================*/

    const governmentLinks = [

      {
        title: "🇮🇳 myScheme – સરકારી યોજનાઓ",
        description:
          "કેન્દ્ર અને રાજ્ય સરકારની વિવિધ યોજનાઓ શોધવા માટેનું સત્તાવાર પોર્ટલ.",
        url: "https://www.myscheme.gov.in/"
      },

      {
        title: "🇬🇺 Digital Gujarat",
        description:
          "ગુજરાત સરકારની વિવિધ Online સેવાઓ માટેનું સત્તાવાર પોર્ટલ.",
        url: "https://www.digitalgujarat.gov.in/"
      },

      {
        title: "🏛️ સામાજિક ન્યાય અને અધિકારીતા વિભાગ – ગુજરાત",
        description:
          "ગુજરાત સરકારની વિવિધ કલ્યાણકારી યોજનાઓની માહિતી.",
        url: "https://sje.gujarat.gov.in/"
      },

      {
        title: "🎓 વિકસતી જાતિ કલ્યાણ – યોજનાઓ",
        description:
          "શૈક્ષણિક, આર્થિક અને અન્ય કલ્યાણકારી યોજનાઓની માહિતી.",
        url: "https://sje.gujarat.gov.in/ddcw/Schemes"
      },

      {
        title: "🌾 PM-KISAN",
        description:
          "ખેડૂતો માટેની કેન્દ્ર સરકારની યોજના.",
        url: "https://pmkisan.gov.in/"
      }

    ];


    /*=========================================
      FIREBASE SCHEMES
    =========================================*/

    const snapshot =
      await getDocs(
        collection(db,"schemes")
      );

    let html = "";


    /*=========================================
      OFFICIAL LINKS DISPLAY
    =========================================*/

    governmentLinks.forEach((scheme) => {

      html += `

        <div class="scheme-card">

          <h3>
            ${scheme.title}
          </h3>

          <p>
            ${scheme.description}
          </p>

          <a
            href="${scheme.url}"
            target="_blank"
            rel="noopener noreferrer">

            🔗 વધુ માહિતી

          </a>

        </div>

      `;

    });


    /*=========================================
      FIREBASE CUSTOM SCHEMES
    =========================================*/

    snapshot.forEach((docSnap) => {

      const data =
        docSnap.data();

      html += `

        <div class="scheme-card">

          <h3>
            🏛️ ${data.title || "-"}
          </h3>

          <p>
            ${data.description || data.desc || "-"}
          </p>

          ${
            data.link
            ? `
              <a
                href="${
                  data.link.startsWith("http://") ||
                  data.link.startsWith("https://")
                    ? data.link
                    : "https://" + data.link
                }"
                target="_blank"
                rel="noopener noreferrer">

                🔗 વધુ માહિતી

              </a>
            `
            : ""
          }

        </div>

      `;

    });


    container.innerHTML =
      html ||
      "<p>હાલ કોઈ સરકારી યોજના ઉપલબ્ધ નથી.</p>";


  } catch(error) {

    console.error(error);

    container.innerHTML =
      "<p>❌ સરકારી યોજનાઓ લોડ કરવામાં ભૂલ આવી.</p>";

  }

}

loadSchemes();

/*=========================================
  VILLAGE INFORMATION - WEBSITE
=========================================*/

async function loadVillageInfo() {

  const infoContainer =
    document.getElementById("villageInfoContainer");

  const historyContainer =
    document.getElementById("villageHistoryContainer");

  const extraContainer =
    document.getElementById("villageExtraContainer");

  try {

    /*=========================================
      MAIN VILLAGE INFO
    =========================================*/

    const infoSnap =
      await getDoc(
        doc(db, "villageInfo", "main")
      );

    if (infoSnap.exists()) {

      const data = infoSnap.data();

      let html = "";

      if (data.population) {
        html += `
          <div class="about-card">
            <i class="fa-solid fa-users"></i>
            <h3>વસ્તી</h3>
            <p>${data.population}</p>
          </div>
        `;
      }

      if (data.houses) {
        html += `
          <div class="about-card">
            <i class="fa-solid fa-house"></i>
            <h3>કુલ મકાન</h3>
            <p>${data.houses}</p>
          </div>
        `;
      }

      if (data.school) {
        html += `
          <div class="about-card">
            <i class="fa-solid fa-school"></i>
            <h3>પ્રાથમિક શાળા</h3>
            <p>${data.school}</p>
          </div>
        `;
      }

      if (data.temple) {
        html += `
          <div class="about-card">
            <i class="fa-solid fa-place-of-worship"></i>
            <h3>મંદિર</h3>
            <p>${data.temple}</p>
          </div>
        `;
      }

      infoContainer.innerHTML =
        html || "<p>ગામની માહિતી ઉપલબ્ધ નથી.</p>";

      if (data.history) {

        historyContainer.innerHTML = `
          <h3>ગામનો પરિચય</h3>
          <p>${data.history}</p>
        `;

      } else {

        historyContainer.innerHTML = "";

      }

    } else {

      infoContainer.innerHTML =
        "<p>ગામની માહિતી ઉપલબ્ધ નથી.</p>";

      historyContainer.innerHTML = "";

    }


    /*=========================================
      EXTRA VILLAGE INFORMATION
    =========================================*/

    const extraSnap =
      await getDocs(
        collection(db, "villageExtra")
      );

    let extraHTML = "";

    extraSnap.forEach((docSnap) => {

      const data = docSnap.data();

      extraHTML += `
  <div class="about-card">

    <i class="fa-solid fa-circle-info"></i>

    <h3>
      ${data.title || "-"}
    </h3>

    <p>
      ${data.description || "-"}
    </p>

  </div>
`;

    });

    extraContainer.innerHTML =
      extraHTML || "";

  } catch (error) {

    console.error(
      "Village information error:",
      error
    );

  }

}


/*=========================================
  START
=========================================*/

loadVillageInfo();

/*=========================================
  CONTACTS - PUBLIC WEBSITE
=========================================*/

async function loadContactsWebsite() {

  const container =
    document.getElementById("contactContainer");

  if (!container) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "contacts")
      );

    let html = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      html += `

        <div class="contact-card">

          <h3>
            👤 ${data.name || "-"}
          </h3>

          <p>
            <strong>${data.position || "-"}</strong>
          </p>

          ${
            data.mobile
              ? `
                <p>
                  <i class="fa-solid fa-phone"></i>
                  <a href="tel:${data.mobile}">
                    ${data.mobile}
                  </a>
                </p>
              `
              : ""
          }

          ${
            data.email
              ? `
                <p>
                  <i class="fa-solid fa-envelope"></i>
                  <a href="mailto:${data.email}">
                    ${data.email}
                  </a>
                </p>
              `
              : ""
          }

        </div>

      `;

    });

    container.innerHTML =
      html ||
      "<p>હાલ કોઈ સંપર્ક માહિતી ઉપલબ્ધ નથી.</p>";

  } catch (error) {

    console.error(
      "Contacts load error:",
      error
    );

    container.innerHTML =
      "<p>❌ સંપર્ક માહિતી લોડ કરવામાં ભૂલ આવી.</p>";

  }

}


/*=========================================
  LOAD CONTACTS
=========================================*/

loadContactsWebsite();

/*=========================================
  MAIN PANCHAYAT CONTACT BUTTONS
=========================================*/

async function loadMainContactButtons() {

  try {

    const snapshot =
      await getDocs(
        collection(db, "contacts")
      );

    let mobile = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      // સરપંચશ્રીનો નંબર શોધવો
      const position =
        (data.position || "").trim();

      if (
        position.includes("સરપંચ") &&
        data.mobile
      ) {

        mobile = data.mobile;

      }

    });

    if (!mobile) {

      console.log(
        "સરપંચશ્રીનો મોબાઈલ નંબર મળ્યો નથી."
      );

      return;
    }


    /*=====================================
      MOBILE NUMBER FORMAT
    =====================================*/

    mobile =
      String(mobile)
        .replace(/\D/g, "");

    // 10 digit નંબર હોય તો India country code ઉમેરો
    if (mobile.length === 10) {

      mobile = "91" + mobile;

    }


    console.log(
      "Main Contact Number:",
      mobile
    );


    /*=====================================
      CALL BUTTON
    =====================================*/

    const callBtn =
      document.getElementById("callBtn");

    if (callBtn) {

      callBtn.href =
        "tel:+" + mobile;

    }


    /*=====================================
      WHATSAPP BUTTON
    =====================================*/

    const whatsappBtn =
      document.getElementById(
        "whatsappBtn"
      );

    if (whatsappBtn) {

      whatsappBtn.href =
        "https://wa.me/" + mobile;

      whatsappBtn.target = "_blank";

      whatsappBtn.rel = "noopener";

    }

  } catch (error) {

    console.error(
      "Main contact error:",
      error
    );

  }

}

loadMainContactButtons();

/*=========================================
  COMPLAINT FORM
=========================================*/

const complaintForm =
  document.getElementById("complaintForm");


complaintForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const name =
      document.getElementById("name")
        .value.trim();

    const mobile =
      document.getElementById("mobile")
        .value.trim();

    const subject =
      document.getElementById("subject")
        .value.trim();

    const details =
      document.getElementById("details")
        .value.trim();


    try {

      const complaintRef =
        await addDoc(
          collection(db, "complaints"),
          {

            name: name,

            mobile: mobile,

            subject: subject,

            details: details,

            status: "Pending",

            createdAt:
              serverTimestamp()

          }
        );


      /* ફરિયાદ નંબર બતાવો */

      const successBox =
        document.getElementById(
          "complaintSuccess"
        );

      if (successBox) {

        successBox.style.display =
          "block";

        successBox.innerHTML = `

          <div class="success-message">

            ✅ તમારી ફરિયાદ સફળતાપૂર્વક
            નોંધાઈ ગઈ છે.

            <br><br>

            <b>તમારો ફરિયાદ નંબર:</b>

            <strong>
              ${complaintRef.id}
            </strong>

            <br><br>

            ⚠️ આ ફરિયાદ નંબર સાચવી રાખજો.
            Status જોવા માટે તેની જરૂર પડશે.

          </div>

        `;

      }


      complaintForm.reset();


    } catch (error) {

      console.error(error);

      alert(
        "❌ ફરિયાદ મોકલવામાં સમસ્યા આવી."
      );

    }

  }
);


/*=========================================
  CHECK COMPLAINT STATUS
=========================================*/

const checkComplaintStatusBtn =
  document.getElementById(
    "checkComplaintStatusBtn"
  );


checkComplaintStatusBtn?.addEventListener(
  "click",
  async () => {

    const complaintId =
      document.getElementById(
        "complaintIdInput"
      ).value.trim();


    const result =
      document.getElementById(
        "complaintStatusResult"
      );


    if (!complaintId) {

      result.innerHTML =
        "<p>⚠️ ફરિયાદ નંબર દાખલ કરો.</p>";

      return;

    }


    try {

      const complaintRef =
        doc(
          db,
          "complaints",
          complaintId
        );


      const complaintSnap =
        await getDoc(
          complaintRef
        );


      if (!complaintSnap.exists()) {

        result.innerHTML = `
          <p>
            ❌ ફરિયાદ નંબર મળ્યો નથી.
          </p>
        `;

        return;

      }


      const data =
        complaintSnap.data();


      let statusClass =
        "status-pending";


      if (data.status === "તપાસમાં") {

        statusClass =
          "status-investigation";

      }


      if (data.status === "ઉકેલાઈ") {

        statusClass =
          "status-solved";

      }


      if (data.status === "Reject") {

        statusClass =
          "status-rejected";

      }


      result.innerHTML = `

        <div class="complaint-status-card">

          <p>
            <b>ફરિયાદનો વિષય:</b>
            ${data.subject || "-"}
          </p>

          <p>
            <b>હાલની સ્થિતિ:</b>
          </p>

          <div class="${statusClass}">

            ${data.status || "Pending"}

          </div>

        </div>

      `;


    } catch (error) {

      console.error(error);

      result.innerHTML =
        "<p>❌ Status તપાસવામાં ભૂલ આવી.</p>";

    }

  }
);
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

const birthFields =
  document.getElementById("birthFields");

if (birthFields) {

  birthFields.style.display =
    type === "birth" ? "block" : "none";

  birthFields.querySelectorAll("input, select, textarea").forEach(el => {
    el.disabled = type !== "birth";
  });

}

const deathFields =
  document.getElementById("deathFields");

if (deathFields) {

  deathFields.style.display =
    type === "death" ? "block" : "none";

  deathFields.querySelectorAll("input, select, textarea").forEach(el => {
    el.disabled = type !== "death";
  });

}

const incomeFields =
  document.getElementById("incomeFields");

if (incomeFields) {

  incomeFields.style.display =
    type === "income" ? "block" : "none";

  incomeFields.querySelectorAll(
    "input, select, textarea"
  ).forEach(el => {
    el.disabled = type !== "income";
  });

}

const complaintFields =
  document.getElementById("complaintFields");

if (complaintFields) {

  complaintFields.style.display =
    type === "complaint" ? "block" : "none";

  complaintFields.querySelectorAll(
    "input, select, textarea"
  ).forEach(el => {
    el.disabled = type !== "complaint";
  });

}

const propertyFields =
  document.getElementById("propertyFields");

if (propertyFields) {

  propertyFields.style.display =
    type === "property" ? "block" : "none";

  propertyFields
    .querySelectorAll("input, select, textarea")
    .forEach(el => {

      el.disabled =
        type !== "property";

    });

}

const normalName =
  document.getElementById("applicantName");

const normalMobile =
  document.getElementById("serviceMobile");

const normalDetails =
  document.getElementById("details");

if (type === "property") {

  normalName.style.display = "none";
  normalMobile.style.display = "none";
  normalDetails.style.display = "none";

  normalName.disabled = true;
  normalMobile.disabled = true;
  normalDetails.disabled = true;

} else {

  normalName.style.display = "";
  normalMobile.style.display = "";
  normalDetails.style.display = "";

  normalName.disabled = false;
  normalMobile.disabled = false;
  normalDetails.disabled = false;

}

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

    const applicantName =
      document.getElementById("applicantName").value.trim();

    const mobile =
  document.getElementById("serviceMobile").value.trim();

    const details =
      document.getElementById("details").value.trim();


    /*=========================================
      OTHER DOCUMENTS
    =========================================*/

let documentUrls = [];

const fileInput =
  document.getElementById("documents");

/*=========================================
  APPLICATION FORM UPLOAD
=========================================*/

let applicationForm = null;

let applicationFormId = null;

if (selectedService === "birth") {

  applicationFormId = "birthApplicationForm";

}

if (selectedService === "death") {

  applicationFormId = "deathApplicationForm";

}

if (applicationFormId) {

  const applicationFormFile =
    document.getElementById(applicationFormId)?.files[0];

  if (!applicationFormFile) {

    alert(
      "⚠️ ભરેલું અરજી પત્રક Upload કરવું જરૂરી છે."
    );

    return;

  }

  const applicationFormUrl =
    await uploadToSupabase(applicationFormFile);

  applicationForm = {

    name: applicationFormFile.name,

    url: applicationFormUrl

  };

}

const files =
  fileInput ? fileInput.files : [];

if (files && files.length > 0) {

  for (let i = 0; i < files.length; i++) {

    const file = files[i];

    const url =
      await uploadToSupabase(file);

    documentUrls.push({
      name: file.name,
      url: url
    });

  }

}


    /*=========================================
      APPLICATION NUMBER
    =========================================*/

    const applicationNo = "GP-" + Date.now();


/*=========================================
  PROPERTY ASSESSMENT DATA
=========================================*/

let propertyData = null;

if (selectedService === "property") {

  const propertyNo =
    document
      .getElementById("propertyNo")
      .value.trim();

  const propertyApplicantName =
    document
      .getElementById("propertyApplicantName")
      .value.trim();

  const propertyMobile =
    document
      .getElementById("propertyMobile")
      .value.trim();


  if (
    !propertyNo ||
    !propertyApplicantName ||
    !propertyMobile
  ) {

    alert(
      "⚠️ મિલકત નંબર, અરજદારનું નામ અને મોબાઈલ નંબર ભરવો જરૂરી છે."
    );

    return;
  }


  propertyData = {

    propertyNo:
      propertyNo,

    applicantName:
      propertyApplicantName,

    mobile:
      propertyMobile,

    notice:
      "આકારણી લેવા માટે અરજદારે ગ્રામ પંચાયત કચેરીમાં રૂબરૂ હાજર રહેવું."

  };

}

/*=========================================
  INCOME CERTIFICATE DATA
=========================================*/

let incomeData = null;

if (selectedService === "income") {

  const incomePhoto =
    document.getElementById("incomePhoto").files[0];

  const incomeAadhaar =
    document.getElementById("incomeAadhaar").files[0];

  const incomeRationCard =
    document.getElementById("incomeRationCard").files[0];

  const incomeLightBill =
    document.getElementById("incomeLightBill").files[0];

  const incomeForm =
    document.getElementById("incomeForm").files[0];


  if (
    !incomePhoto ||
    !incomeAadhaar ||
    !incomeRationCard ||
    !incomeLightBill ||
    !incomeForm
  ) {

    alert(
      "⚠️ આવક દાખલા માટે બધા જરૂરી દસ્તાવેજો Upload કરો."
    );

    return;
  }


  /* Upload Documents */

  const incomePhotoUrl =
    await uploadToSupabase(incomePhoto);

  const incomeAadhaarUrl =
    await uploadToSupabase(incomeAadhaar);

  const incomeRationCardUrl =
    await uploadToSupabase(incomeRationCard);

  const incomeLightBillUrl =
    await uploadToSupabase(incomeLightBill);

  const incomeFormUrl =
    await uploadToSupabase(incomeForm);


  incomeData = {

    incomeApplicantName:
      document
        .getElementById("incomeApplicantName")
        .value.trim(),

    incomeAddress:
      document
        .getElementById("incomeAddress")
        .value.trim(),

    incomePhoto: {
      name: incomePhoto.name,
      url: incomePhotoUrl
    },

    incomeAadhaar: {
      name: incomeAadhaar.name,
      url: incomeAadhaarUrl
    },

    incomeRationCard: {
      name: incomeRationCard.name,
      url: incomeRationCardUrl
    },

    incomeLightBill: {
      name: incomeLightBill.name,
      url: incomeLightBillUrl
    },

    incomeForm: {
      name: incomeForm.name,
      url: incomeFormUrl
    }

  };

}

/*=========================================
  COMPLAINT DATA
=========================================*/

let complaintData = null;

if (selectedService === "complaint") {

  const complaintFiles =
    document.getElementById("complaintDocuments").files;

  let complaintDocumentUrls = [];

  if (complaintFiles && complaintFiles.length > 0) {

    for (let i = 0; i < complaintFiles.length; i++) {

      const file = complaintFiles[i];

      const url =
        await uploadToSupabase(file);

      complaintDocumentUrls.push({
        name: file.name,
        url: url
      });

    }

  }

  complaintData = {

    complaintApplicantName:
      document
        .getElementById("complaintApplicantName")
        .value.trim(),

    complaintAddress:
      document
        .getElementById("complaintAddress")
        .value.trim(),

    complaintSubject:
      document
        .getElementById("complaintSubject")
        .value.trim(),

    complaintDetails:
      document
        .getElementById("complaintDetails")
        .value.trim(),

    complaintDocuments:
      complaintDocumentUrls

  };

}

    /*=========================================
      BIRTH CERTIFICATE DATA
    =========================================*/

    let birthData = null;

    if (selectedService === "birth") {

      const oldBirthFile =
  document.getElementById("oldBirthCertificate")?.files[0];

let oldBirthCertificate = null;

if (oldBirthFile) {
  const oldBirthUrl =
    await uploadToSupabase(oldBirthFile);

  oldBirthCertificate = {
    name: oldBirthFile.name,
    url: oldBirthUrl
  };
}

      birthData = {

        birthName:
          document.getElementById("birthName").value.trim(),

        birthSex:
          document.getElementById("birthSex").value,

        birthAadhaar:
          document.getElementById("birthAadhaar").value.trim(),

        birthDate:
          document.getElementById("birthDate").value,

        birthPlace:
          document.getElementById("birthPlace").value.trim(),

        birthMother:
          document.getElementById("birthMother").value.trim(),

        birthFather:
          document.getElementById("birthFather").value.trim(),

        birthMotherAadhaar:
          document.getElementById("birthMotherAadhaar").value.trim(),

        birthFatherAadhaar:
          document.getElementById("birthFatherAadhaar").value.trim(),

        birthAddressAtBirth:
          document.getElementById("birthAddressAtBirth").value.trim(),

        birthPermanentAddress:
          document.getElementById("birthPermanentAddress").value.trim(),

        birthRegistrationNo:
          document.getElementById("birthRegistrationNo").value.trim(),

        birthRegistrationDate:
          document.getElementById("birthRegistrationDate").value,

        oldBirthCertificate: oldBirthCertificate

      };

    }


    /*=========================================
      DEATH CERTIFICATE DATA
    =========================================*/

    let deathData = null;

    if (selectedService === "death") {

      deathData = {

        deathName:
          document.getElementById("deathName").value.trim(),

        deathSex:
          document.getElementById("deathSex").value,

        deathAadhaar:
          document.getElementById("deathAadhaar").value.trim(),

        deathAge:
          document.getElementById("deathAge").value.trim(),

        deathDate:
          document.getElementById("deathDate").value,

        deathPlace:
          document.getElementById("deathPlace").value.trim(),

        deathSpouse:
          document.getElementById("deathSpouse").value.trim(),

        deathSpouseAadhaar:
          document.getElementById("deathSpouseAadhaar").value.trim(),

        deathMother:
          document.getElementById("deathMother").value.trim(),

        deathMotherAadhaar:
          document.getElementById("deathMotherAadhaar").value.trim(),

        deathFather:
          document.getElementById("deathFather").value.trim(),

        deathFatherAadhaar:
          document.getElementById("deathFatherAadhaar").value.trim(),

        deathAddressAtDeath:
          document.getElementById("deathAddressAtDeath").value.trim(),

        deathPermanentAddress:
          document.getElementById("deathPermanentAddress").value.trim(),

        deathRegistrationNo:
          document.getElementById("deathRegistrationNo").value.trim(),

        deathRegistrationDate:
          document.getElementById("deathRegistrationDate").value,

        deathRemarks:
          document.getElementById("deathRemarks").value.trim()

      };

    }


    /*=========================================
      FIRESTORE SAVE
    =========================================*/

    await addDoc(
  collection(db, "applications"),
  {

    service: selectedService,

    name:
      selectedService === "property"
        ? document
            .getElementById("propertyApplicantName")
            .value.trim()
        : applicantName,

    mobile:
      selectedService === "property"
        ? document
            .getElementById("propertyMobile")
            .value.trim()
        : mobile,

    details: details,

    documents: documentUrls,

    applicationForm: applicationForm,

    birthData: birthData,

    deathData: deathData,

    incomeData: incomeData,

    complaintData: complaintData,

    propertyData:
      selectedService === "property"
        ? propertyData
        : null,

    applicationNo: applicationNo,

    status: "Pending",

    createdAt: serverTimestamp()

  }
);

    /*=========================================
      SUCCESS
    =========================================*/

    alert(
      "✅ તમારી અરજી સફળતાપૂર્વક મોકલવામાં આવી.\n\n" +
      "અરજી નંબર: " +
      applicationNo
    );


    serviceForm.reset();


    const birthFields =
      document.getElementById("birthFields");

    if (birthFields) {

      birthFields.style.display = "none";

    }


    const deathFields =
      document.getElementById("deathFields");

    if (deathFields) {

      deathFields.style.display = "none";

    }


    closePopup();


  } catch (error) {

    console.error(error);

    alert(
      "અરજી મોકલવામાં ભૂલ આવી: " +
      error.message
    );

  }

});

const searchBtn =
  document.getElementById("searchApplicationBtn");

searchBtn?.addEventListener("click", async () => {

  const applicationNo =
    document
      .getElementById("applicationSearch")
      .value
      .trim();

  const result =
    document.getElementById("applicationResult");

  if (!applicationNo) {

    result.innerHTML =
      "⚠️ કૃપા કરીને અરજી નંબર દાખલ કરો.";

    return;

  }

  result.innerHTML =
    "⏳ અરજી શોધી રહ્યા છીએ...";

  try {

    const snapshot =
      await getDocs(
        collection(db, "applications")
      );

    let found = false;

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      if (
        data.applicationNo === applicationNo
      ) {

        found = true;

        let status = data.status || "Pending";

        let statusColor = "#fff3cd";

        if (status === "Approved") {
          statusColor = "#d1e7dd";
        }

        if (status === "Rejected") {
          statusColor = "#f8d7da";
        }

        result.innerHTML = `

          <div style="
            margin-top:15px;
            padding:15px;
            border-radius:8px;
            background:${statusColor};
          ">

            <h3>
              📄 અરજીની માહિતી
            </h3>

            <p>
              <b>અરજી નંબર:</b>
              ${data.applicationNo || "-"}
            </p>

            <p>
              <b>અરજદારનું નામ:</b>
              ${data.name || "-"}
            </p>

            <p>
  <b>સેવા:</b>
  ${
    {
      birth: "જન્મ પ્રમાણપત્ર",
      death: "મૃત્યુ પ્રમાણપત્ર",
      income: "આવક દાખલો",
      residence: "રહેઠાણ દાખલો",
      property: "મિલકત આકારણી",
      tax: "ટેક્સ",
      complaint: "ફરિયાદ"
    }[data.service] || data.service || "-"
  }
</p>

<p>
  <b>સ્થિતિ:</b>
  ${
    status === "Approved"
      ? "🟢 મંજૂર"
      : status === "Rejected"
      ? "🔴 નામંજૂર"
      : "🟡 તપાસ હેઠળ"
  }
</p>

            ${
              status === "Rejected"
              ?
              `
              <p>
                <b>❌ Reject કારણ:</b>
                ${data.rejectionReason || "-"}
              </p>
              `
              :
              ""
            }

          </div>

        `;

      }

    });

    if (!found) {

      result.innerHTML =
        "❌ આ અરજી નંબરની અરજી મળી નથી.";

    }

  } catch (error) {

    console.error(error);

    result.innerHTML =
      "❌ અરજી શોધવામાં ભૂલ આવી: " +
      error.message;

  }

});

function openStatusPopup() {

  document.getElementById("statusPopup").style.display = "flex";

}

function closeStatusPopup() {

  document.getElementById("statusPopup").style.display = "none";

}

window.openStatusPopup = openStatusPopup;
window.closeStatusPopup = closeStatusPopup;

/*=========================================
PROPERTY TAX POPUP
=========================================*/

function openPropertyTax(){

document.getElementById("propertyTaxPopup").style.display="flex";

document.getElementById("propertyResult").innerHTML="";

document.getElementById("propertySearch").value="";

document.getElementById("houseSearch").value="";

}

function closePropertyTax(){

document.getElementById("propertyTaxPopup").style.display="none";

}

window.openPropertyTax=openPropertyTax;

window.closePropertyTax=closePropertyTax;

/*=========================================
PROPERTY TAX SEARCH
=========================================*/

const propertySearchBtn =
document.getElementById("searchPropertyBtn");

propertySearchBtn?.addEventListener("click",async()=>{

const propertyNo=
document.getElementById("propertySearch").value.trim();

const houseNo=
document.getElementById("houseSearch").value.trim();

if(!propertyNo && !houseNo){

alert("મિલકત નંબર અથવા ઘર નંબર દાખલ કરો.");

return;

}

let q;

if(propertyNo){

q=query(
collection(db,"propertyTax"),
where("propertyNo","==",propertyNo)
);

}else{

q=query(
collection(db,"propertyTax"),
where("houseNo","==",houseNo)
);

}

const snapshot=await getDocs(q);

const result=document.getElementById("propertyResult");

if(snapshot.empty){

result.innerHTML =
"<h3>❌ કોઈ રેકોર્ડ મળ્યો નથી.</h3>";

return;

}

const data = snapshot.docs[0].data();
const websiteSnap = await getDoc(
    doc(db, "website", "settings")
);

let taxQr = "";

if (websiteSnap.exists()) {
    taxQr = websiteSnap.data().taxQr || "";
}
let receiptMessage = "";

const paymentQuery = query(
  collection(db,"taxPayments"),
  where("propertyNo","==",data.propertyNo)
);

const paymentSnapshot = await getDocs(paymentQuery);

if(!paymentSnapshot.empty){

  const payment = paymentSnapshot.docs[0].data();

  if(payment.status==="Receipt Ready"){

    receiptMessage = `
      <div style="margin-top:20px;padding:15px;background:#d4edda;border:2px solid green;border-radius:10px;">
        <h3>✅ તમારો વેરો ચકાસવામાં આવ્યો છે.</h3>

        <p><b>પહોંચ નંબર :</b> ${payment.receiptNo}</p>

        <p><b>તારીખ :</b> ${payment.receiptDate}</p>

        <p>📄 કૃપા કરીને ગ્રામ પંચાયત કચેરીથી સત્તાવાર પહોંચ મેળવી જશો.</p>
      </div>
    `;

  }

}

/*=========================================
  TAX DETAILS
=========================================*/

const totalTax = Number(data.taxAmount || 0);

/*=========================================
  DISPLAY PROPERTY TAX
=========================================*/

result.innerHTML = `

<div class="tax-result-card">

<h3>🏠 ${data.ownerName || "-"}</h3>

<p>
<b>મિલકત નંબર :</b>
${data.propertyNo || "-"}
</p>

<p>
<b>ઘર નંબર :</b>
${data.houseNo || "-"}
</p>

<div style="
margin-top:15px;
padding:15px;
background:#f8f9fa;
border-radius:12px;
border:1px solid #ddd;
">

<h3 style="margin-top:0;">
📋 વેરાની વિગત
</h3>

<p>
<b>વર્ષ :</b>
${data.taxYear || "2026-27"}
</p>

<p>
<b>છેલ્લી તારીખ :</b>
${data.lastDate || "31-03-2027"}
</p>

<hr>

<h3 style="
color:#d35400;
margin-bottom:5px;
">
💰 કુલ ભરવાનો વેરો :
₹ ${totalTax}
</h3>

</div>


${taxQr ? `

<div style="text-align:center;margin:20px 0;">

<img
src="${taxQr}"
width="180"
style="
margin:15px 0;
border-radius:8px;
">

<p>
<b>📱 પહેલા QR Scan કરીને મિલકત વેરો ભરો.</b>
</p>

<button
id="showPaidBtn"
style="
margin-top:10px;
background:#0d6efd;
color:#fff;
border:none;
padding:12px 18px;
border-radius:8px;
cursor:pointer;
font-size:16px;
">

✅ મેં QR દ્વારા મિલકત વેરો ભરી દીધો

</button>

</div>

` : ""}

</div>

${receiptMessage}

`;


/*=========================================
  PAYMENT BUTTON
=========================================*/

const showPaidBtn =
document.getElementById("showPaidBtn");

if(showPaidBtn){

showPaidBtn.addEventListener("click",()=>{

document.getElementById("paymentPopup").style.display="flex";

document.getElementById("paymentPropertyNo").value =
data.propertyNo;

});

}

document.getElementById("showPaidBtn").addEventListener("click",()=>{

document.getElementById("paymentPopup").style.display="flex";

document.getElementById("paymentPropertyNo").value=data.propertyNo;

});

});

/*=========================================
SUBMIT PROPERTY TAX PAYMENT
=========================================*/

const submitPaymentBtn =
document.getElementById("submitPaymentBtn");

submitPaymentBtn?.addEventListener("click", async ()=>{

try{

const propertyNo =
document.getElementById("paymentPropertyNo").value;

const utr =
document.getElementById("paymentUTR").value.trim();

const file =
document.getElementById("paymentScreenshot").files[0];

if(!utr){

alert("UTR નંબર દાખલ કરો.");

return;

}

if(!file){

alert("ચુકવણીનો Screenshot પસંદ કરો.");

return;

}

const screenshot =
await uploadToSupabase(file);

await addDoc(collection(db,"taxPayments"),{

propertyNo,
utr,
screenshot,
status:"Pending",
createdAt:serverTimestamp()

});

closePaymentPopup();

document.getElementById("successPopup").style.display="flex";

closePaymentPopup();

document.getElementById("successPopup").style.display = "flex";

}catch(error){

console.error(error);

alert(error.message);

}

});

/*=========================================
PAYMENT POPUP
=========================================*/

function closePaymentPopup(){

document.getElementById("paymentPopup").style.display="none";

}

window.closePaymentPopup = closePaymentPopup;

function closeSuccessPopup(){

document.getElementById("successPopup").style.display = "none";

}

window.closeSuccessPopup = closeSuccessPopup;