import { db, auth } from "./firebase-config.js";

import {
collection,
getDocs,
getDoc,
addDoc,
setDoc,
updateDoc,
deleteDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const { jsPDF } = window.jspdf;


/*=========================================
LOGIN CHECK
=========================================*/

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href="login.html";

}

});

/*=========================================
DASHBOARD COUNTS
=========================================*/

async function dashboardCount(id, collectionName){

const snapshot = await getDocs(collection(db, collectionName));

const element = document.getElementById(id);

if(element){
element.innerText = snapshot.size;
}

}

async function refreshDashboard(){

  await dashboardCount("memberCount","members");
  await dashboardCount("noticeCount","notices");
  await dashboardCount("galleryCount","gallery");
  await dashboardCount("complaintCount","complaints");

  const snapshot = await getDocs(collection(db,"applications"));

  document.getElementById("totalApplications").innerText = snapshot.size;

  let pending = 0;
  let approved = 0;
  let rejected = 0;

  snapshot.forEach((doc)=>{
    const data = doc.data();

    if(data.status === "Pending") pending++;
    if(data.status === "Approved") approved++;
    if(data.status === "Rejected") rejected++;
  });

  document.getElementById("pendingApplications").innerText = pending;
  document.getElementById("approvedApplications").innerText = approved;
  document.getElementById("rejectedApplications").innerText = rejected;

}

refreshDashboard();

const CLOUD_NAME = "f62hvppq";
const UPLOAD_PRESET = "gram_upload_auto";

async function uploadToCloudinary(file) {
alert(location.origin);
alert(navigator.userAgent);
  console.log(file);
console.log(file.type);
console.log("Uploading to Cloudinary...");

alert(file.type);
alert(file.name);

const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", UPLOAD_PRESET);
formData.append("resource_type", "auto");

try {
alert("Before Fetch");
    const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
  {
    method: "POST",
    mode: "cors",
    body: formData
  }
);
alert("After Fetch");
    console.log("Status:", response.status);

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data.secure_url;

} catch (e) {
  console.error(e);

  alert(
    "Name: " + e.name +
    "\nMessage: " + e.message
  );

  throw e;
}
}

function previewImage(inputId, previewId) {

  const input = document.getElementById(inputId);

  input.addEventListener("change", function () {

    if (this.files && this.files[0]) {

      const reader = new FileReader();

      reader.onload = function (e) {
        document.getElementById(previewId).src = e.target.result;
      };

      reader.readAsDataURL(this.files[0]);

    }

  });

}

previewImage("logoFile", "logoPreview");
previewImage("bannerFile", "bannerPreview");
previewImage("sarpanchImageFile", "sarpanchPreview");
previewImage("signatureFile", "signaturePreview");
previewImage("stampFile", "stampPreview");
previewImage("memberImageFile", "memberImagePreview");
previewImage("noticeFile", "noticePreview");
previewImage("galleryImageFile","galleryPreview");
previewImage("documentFile","documentPreview");
/*=========================================
WEBSITE SETTINGS
=========================================*/

async function loadWebsiteSettings() {
  try {
    const docSnap = await getDoc(doc(db, "website", "settings"));

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    document.getElementById("websiteName").value = data.websiteName || "";
    document.getElementById("bannerTitle").value = data.bannerTitle || "";
    document.getElementById("bannerSubtitle").value = data.bannerSubtitle || "";
    document.getElementById("sarpanchName").value = data.sarpanchName || "";
    document.getElementById("sarpanchMessage").value = data.sarpanchMessage || "";

    document.getElementById("panchayatMobile").value = data.panchayatMobile || "";
    document.getElementById("panchayatEmail").value = data.panchayatEmail || "";
    document.getElementById("panchayatAddress").value = data.panchayatAddress || "";
    document.getElementById("websiteUrl").value = data.websiteUrl || "";

    if (data.logo)
      document.getElementById("logoPreview").src = data.logo;

    if (data.banner)
      document.getElementById("bannerPreview").src = data.banner;

    if (data.sarpanchImage)
      document.getElementById("sarpanchPreview").src = data.sarpanchImage;

    if (data.sarpanchSignature)
      document.getElementById("signaturePreview").src = data.sarpanchSignature;

    if (data.stampImage)
      document.getElementById("stampPreview").src = data.stampImage;

  } catch (error) {
    console.error(error);
  }
}

const websiteForm = document.getElementById("websiteForm");

websiteForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    let oldData = {};

    const oldDoc = await getDoc(doc(db, "website", "settings"));

    if (oldDoc.exists()) {
      oldData = oldDoc.data();
    }

    let logo = oldData.logo || "";
    let banner = oldData.banner || "";
    let sarpanchImage = oldData.sarpanchImage || "";
    let signature = oldData.sarpanchSignature || "";
    let stamp = oldData.stampImage || "";

    if (document.getElementById("logoFile").files.length > 0) {
      logo = await uploadToCloudinary(document.getElementById("logoFile").files[0]);
    }

    if (document.getElementById("bannerFile").files.length > 0) {
      banner = await uploadToCloudinary(document.getElementById("bannerFile").files[0]);
    }

    if (document.getElementById("sarpanchImageFile").files.length > 0) {
      sarpanchImage = await uploadToCloudinary(document.getElementById("sarpanchImageFile").files[0]);
    }

    if (document.getElementById("signatureFile").files.length > 0) {
      signature = await uploadToCloudinary(document.getElementById("signatureFile").files[0]);
    }

    if (document.getElementById("stampFile").files.length > 0) {
      stamp = await uploadToCloudinary(document.getElementById("stampFile").files[0]);
    }

    await setDoc(doc(db, "website", "settings"), {

      websiteName: document.getElementById("websiteName").value,
      bannerTitle: document.getElementById("bannerTitle").value,
      bannerSubtitle: document.getElementById("bannerSubtitle").value,
      sarpanchName: document.getElementById("sarpanchName").value,
      sarpanchMessage: document.getElementById("sarpanchMessage").value,

      logo: logo,
      banner: banner,
      sarpanchImage: sarpanchImage,
      sarpanchSignature: signature,
      stampImage: stamp,

      panchayatMobile: document.getElementById("panchayatMobile").value,
      panchayatEmail: document.getElementById("panchayatEmail").value,
      panchayatAddress: document.getElementById("panchayatAddress").value,
      websiteUrl: document.getElementById("websiteUrl").value,

      createdAt: serverTimestamp()

    });

    alert("Website Settings Saved Successfully");

    loadWebsiteSettings();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }

});

loadWebsiteSettings();
/*=========================================
MEMBERS
=========================================*/

const memberForm=document.getElementById("memberForm");

memberForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

let memberImage = "";

if (document.getElementById("memberImageFile").files.length > 0) {
  memberImage = await uploadToCloudinary(
    document.getElementById("memberImageFile").files[0]
  );
}

await addDoc(collection(db,"members"),{

name: document.getElementById("memberName").value,

position: document.getElementById("memberPosition").value,

image: memberImage,

createdAt: serverTimestamp()

});

alert("સભ્ય ઉમેરાયો.");

memberForm.reset();
document.getElementById("memberImagePreview").src = "";
loadMembers();
refreshDashboard();

});

async function loadMembers(){

const list=document.getElementById("memberList");

if(!list) return;

const snapshot=await getDocs(collection(db,"members"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<img src="${data.image}" width="60">

<div>
<h4>${data.name}</h4>
<p>${data.position}</p>
</div>


<div class="admin-actions">

<button class="edit-btn"
onclick="editMember('${item.id}')">
Edit
</button>

<button class="delete-btn"
onclick="deleteMember('${item.id}')">
Delete
</button>

</div>
</div>

`;

});

list.innerHTML=html;

}

loadMembers();

async function deleteMember(id){

if(!confirm("શું તમે આ સભ્યને કાઢી નાખવા માંગો છો?")){
return;
}

await deleteDoc(doc(db,"members",id));

loadMembers();
refreshDashboard();

alert("સભ્ય સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.");

}

window.deleteMember = deleteMember;
async function editMember(id){

const memberRef = doc(db,"members",id);

const memberSnap = await getDoc(memberRef);

if(!memberSnap.exists()) return;

const data = memberSnap.data();

const newName = prompt("નવું નામ દાખલ કરો", data.name);
if(newName===null) return;

const newPosition = prompt("નવો હોદ્દો દાખલ કરો", data.position);
if(newPosition===null) return;

const newImage = prompt("નવી Photo URL દાખલ કરો", data.image);
if(newImage===null) return;

await updateDoc(memberRef,{
name:newName,
position:newPosition,
image:newImage
});

alert("સભ્ય સફળતાપૂર્વક સુધારાયો.");

loadMembers();

refreshDashboard();

}

window.editMember = editMember;
/*=========================================
NOTICE
=========================================*/

const noticeForm = document.getElementById("noticeForm");

noticeForm?.addEventListener("submit", async (e) => {

e.preventDefault();

let noticeFile = "";

const fileInput = document.getElementById("noticeFile");

if (fileInput.files.length > 0) {
  noticeFile = await uploadToCloudinary(fileInput.files[0]);
}

await addDoc(collection(db, "notices"), {

  title: document.getElementById("noticeTitle").value,

  description: document.getElementById("noticeDescription").value,

  date: document.getElementById("noticeDate").value,

  file: noticeFile,

  createdAt: serverTimestamp()

});

alert("નોટિસ સફળતાપૂર્વક ઉમેરાઈ.");

noticeForm.reset();
document.getElementById("noticePreview").src = "";
loadNotices();
refreshDashboard();
});

async function loadNotices(){

const list=document.getElementById("noticeList");

if(!list) return;

const snapshot=await getDocs(collection(db,"notices"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<div>

<h3>${data.title}</h3>

<p>${data.description}</p>

<small>${data.date}</small>

${data.file ? `
<br><br>
<a href="${data.file}" target="_blank">📎 ફાઇલ જુઓ</a>
` : ""}

</div>

<div class="admin-actions">

<button class="edit-btn"
onclick="editNotice('${item.id}')">
Edit
</button>

<button class="delete-btn"
onclick="deleteNotice('${item.id}')">
Delete
</button>

</div>

</div>

`;

});

list.innerHTML=html;

}

loadNotices();
async function deleteNotice(id){

if(!confirm("શું તમે આ નોટિસ કાઢી નાખવા માંગો છો?")){
return;
}

await deleteDoc(doc(db,"notices",id));

loadNotices();
refreshDashboard();

alert("નોટિસ સફળતાપૂર્વક કાઢી નાખવામાં આવી.");

}

window.deleteNotice = deleteNotice;


async function editNotice(id){

const noticeRef = doc(db,"notices",id);

const noticeSnap = await getDoc(noticeRef);

if(!noticeSnap.exists()) return;

const data = noticeSnap.data();

const newTitle = prompt("નવું શીર્ષક દાખલ કરો", data.title);
if(newTitle===null) return;

const newDescription = prompt("નવી વિગત દાખલ કરો", data.description);
if(newDescription===null) return;

const newDate = prompt("નવી તારીખ દાખલ કરો (YYYY-MM-DD)", data.date);
if(newDate===null) return;

await updateDoc(noticeRef,{
title:newTitle,
description:newDescription,
date:newDate
});

alert("નોટિસ સફળતાપૂર્વક સુધારાઈ.");

loadNotices();
refreshDashboard();

}

window.editNotice = editNotice;

/*=========================================
PHOTO GALLERY
=========================================*/

const galleryForm=document.getElementById("galleryForm");

galleryForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

let galleryImage = "";

if(document.getElementById("galleryImageFile").files.length>0){

galleryImage = await uploadToCloudinary(
document.getElementById("galleryImageFile").files[0]
);

}

await addDoc(collection(db,"gallery"),{

title:document.getElementById("galleryTitle").value,

image:galleryImage,

createdAt:serverTimestamp()

});

alert("ફોટો સફળતાપૂર્વક ઉમેરાયો.");

galleryForm.reset();
document.getElementById("galleryPreview").src="";
loadGallery();
refreshDashboard();
});

async function loadGallery(){

const list=document.getElementById("galleryList");

if(!list) return;

const snapshot=await getDocs(collection(db,"gallery"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html += `

<div class="admin-item">

<div>

<img src="${data.image}" width="120">

<p>${data.title}</p>

</div>

<div class="admin-actions">

<button class="edit-btn"
onclick="editGallery('${item.id}')">
Edit
</button>

<button class="delete-btn"
onclick="deleteGallery('${item.id}')">
Delete
</button>

</div>

</div>

`;

});

list.innerHTML=html;

}

loadGallery();
async function deleteGallery(id){

if(!confirm("શું તમે આ ફોટો કાઢી નાખવા માંગો છો?")){
return;
}

await deleteDoc(doc(db,"gallery",id));

loadGallery();
refreshDashboard();

alert("ફોટો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.");

}

window.deleteGallery = deleteGallery;


async function editGallery(id){

const galleryRef = doc(db,"gallery",id);

const gallerySnap = await getDoc(galleryRef);

if(!gallerySnap.exists()) return;

const data = gallerySnap.data();

const newTitle = prompt("નવું શીર્ષક દાખલ કરો", data.title);
if(newTitle===null) return;

const newImage = prompt("નવી Image URL દાખલ કરો", data.image);
if(newImage===null) return;

await updateDoc(galleryRef,{
title:newTitle,
image:newImage
});

alert("ફોટો સફળતાપૂર્વક સુધારાયો.");

loadGallery();
refreshDashboard();

}

window.editGallery = editGallery;
/*=========================================
VIDEO GALLERY
=========================================*/

const videoForm=document.getElementById("videoForm");

videoForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

await addDoc(collection(db,"videos"),{

title:document.getElementById("videoTitle").value,

url:document.getElementById("videoUrl").value,

createdAt:serverTimestamp()

});

alert("વિડિયો સફળતાપૂર્વક ઉમેરાયો.");

videoForm.reset();

loadVideos();

});

async function loadVideos(){

const list=document.getElementById("videoList");

if(!list) return;

const snapshot=await getDocs(collection(db,"videos"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<p>${data.title}</p>

<a href="${data.url}" target="_blank">

વિડિયો જુઓ

</a>

</div>

`;

});

list.innerHTML=html;

}

loadVideos();
/*=========================================
GRAM SABHA
=========================================*/

const gramsabhaForm = document.getElementById("gramsabhaForm");

gramsabhaForm?.addEventListener("submit", async (e) => {

e.preventDefault();

await addDoc(collection(db,"gramsabha"),{

title:document.getElementById("gsTitle").value,

date:document.getElementById("gsDate").value,

time:document.getElementById("gsTime").value,

place:document.getElementById("gsPlace").value,

description:document.getElementById("gsDescription").value,

createdAt:serverTimestamp()

});

alert("ગ્રામ સભા સફળતાપૂર્વક ઉમેરાઈ.");

gramsabhaForm.reset();

loadGramSabha();

});

async function loadGramSabha(){

const list=document.getElementById("gramsabhaList");

if(!list) return;

const snapshot=await getDocs(collection(db,"gramsabha"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<div>

<h3>${data.title}</h3>

<p>${data.date} | ${data.time}</p>

<p>${data.place}</p>

<p>${data.description}</p>

</div>

<div class="admin-actions">

<button class="edit-btn"
onclick="editGramSabha('${item.id}')">
Edit
</button>

<button class="delete-btn"
onclick="deleteGramSabha('${item.id}')">
Delete
</button>

</div>

</div>

`;

});

list.innerHTML=html;

}

loadGramSabha();
async function deleteGramSabha(id){

if(!confirm("શું તમે આ ગ્રામ સભા કાઢી નાખવા માંગો છો?")){
return;
}

await deleteDoc(doc(db,"gramsabha",id));

loadGramSabha();
refreshDashboard();

alert("ગ્રામ સભા સફળતાપૂર્વક કાઢી નાખવામાં આવી.");

}

window.deleteGramSabha = deleteGramSabha;


async function editGramSabha(id){

const gsRef = doc(db,"gramsabha",id);

const gsSnap = await getDoc(gsRef);

if(!gsSnap.exists()) return;

const data = gsSnap.data();

const newTitle = prompt("નવું શીર્ષક", data.title);
if(newTitle===null) return;

const newDate = prompt("નવી તારીખ", data.date);
if(newDate===null) return;

const newTime = prompt("નવો સમય", data.time);
if(newTime===null) return;

const newPlace = prompt("નવું સ્થળ", data.place);
if(newPlace===null) return;

const newDescription = prompt("નવી વિગત", data.description);
if(newDescription===null) return;

await updateDoc(gsRef,{
title:newTitle,
date:newDate,
time:newTime,
place:newPlace,
description:newDescription
});

alert("ગ્રામ સભા સફળતાપૂર્વક સુધારાઈ.");

loadGramSabha();
refreshDashboard();

}

window.editGramSabha = editGramSabha;
/*=========================================
RESOLUTIONS
=========================================*/

const resolutionForm=document.getElementById("resolutionForm");

resolutionForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

await addDoc(collection(db,"resolutions"),{

title:document.getElementById("resolutionTitle").value,

description:document.getElementById("resolutionDescription").value,

file:document.getElementById("resolutionFile").value,

createdAt:serverTimestamp()

});

alert("ઠરાવ ઉમેરાયો.");

resolutionForm.reset();

loadResolutions();

});

async function loadResolutions(){

const list=document.getElementById("resolutionList");

if(!list) return;

const snapshot=await getDocs(collection(db,"resolutions"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<h3>${data.title}</h3>

<a href="${data.file}" target="_blank">

PDF જુઓ

</a>

</div>

`;

});

list.innerHTML=html;

}

loadResolutions();

/*=========================================
DOCUMENTS
=========================================*/

const documentForm = document.getElementById("documentForm");

documentForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    let documentUrl = "";

    const fileInput = document.getElementById("documentFile");

    if (fileInput.files.length > 0) {

      documentUrl = await uploadToCloudinary(fileInput.files[0]);

    }

if (!documentUrl) {
  throw new Error("Cloudinary Upload Failed");
}

    await addDoc(collection(db, "documents"), {

      title: document.getElementById("documentTitle").value,

      file: documentUrl,

      createdAt: serverTimestamp()

    });

    alert("દસ્તાવેજ સફળતાપૂર્વક ઉમેરાયો.");

    documentForm.reset();

    document.getElementById("documentPreview").src = "";

    loadDocuments();

    refreshDashboard();

  } catch (error) {

    console.error(error);

    alert("Error : " + error.message);

  }

});

async function loadDocuments() {

  const list = document.getElementById("documentList");

  if (!list) return;

  const snapshot = await getDocs(collection(db, "documents"));

  let html = "";

  snapshot.forEach(item => {

    const data = item.data();

    html += `

<div class="admin-item">

<div>

<h3>${data.title}</h3>

<a href="${data.file}" target="_blank">
📄 દસ્તાવેજ જુઓ
</a>

</div>

<div class="admin-actions">

<button class="delete-btn"
onclick="deleteDocument('${item.id}')">
Delete
</button>

</div>

</div>

`;

  });

  list.innerHTML = html;

}

loadDocuments();

async function deleteDocument(id){

if(!confirm("શું તમે આ દસ્તાવેજ કાઢી નાખવા માંગો છો?")){
return;
}

await deleteDoc(doc(db,"documents",id));

alert("દસ્તાવેજ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.");

loadDocuments();

refreshDashboard();

}

window.deleteDocument = deleteDocument;

/*=========================================
SCHEMES
=========================================*/

const schemeForm=document.getElementById("schemeForm");

schemeForm?.addEventListener("submit",async(e)=>{

e.preventDefault();

await addDoc(collection(db,"schemes"),{

title:document.getElementById("schemeTitle").value,

description:document.getElementById("schemeDescription").value,

createdAt:serverTimestamp()

});

alert("યોજના ઉમેરાઈ.");

schemeForm.reset();

loadSchemes();

});

async function loadSchemes(){

const list=document.getElementById("schemeList");

if(!list) return;

const snapshot=await getDocs(collection(db,"schemes"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<h3>${data.title}</h3>

<p>${data.desc}</p>

</div>

`;

});

list.innerHTML=html;

}

loadSchemes();
/*=========================================
COMPLAINTS
=========================================*/

async function loadComplaints() {

const list = document.getElementById("complaintList");

if (!list) return;

const snapshot = await getDocs(collection(db, "complaints"));

let html = "";

snapshot.forEach(item => {

const data = item.data();

html += `

<div class="admin-item">

<h3>${data.name}</h3>

<p><b>મોબાઇલ :</b> ${data.mobile}</p>

<p><b>વિષય :</b> ${data.subject}</p>

<p>${data.details}</p>

<p><b>Status :</b> ${data.status}</p>

</div>

`;

});

list.innerHTML = html;

}

loadComplaints();

/*=========================================
TAX
=========================================*/

const taxForm = document.getElementById("taxForm");

taxForm?.addEventListener("submit", async (e) => {

e.preventDefault();

await addDoc(collection(db, "tax"), {

title: document.getElementById("taxTitle").value,

amount: document.getElementById("taxAmount").value,

qr: document.getElementById("taxQr").value,

createdAt: serverTimestamp()

});

alert("ટેક્સ માહિતી સેવ થઈ ગઈ.");

taxForm.reset();

loadTax();

});

async function loadTax() {

const list = document.getElementById("taxList");

if (!list) return;

const snapshot = await getDocs(collection(db, "tax"));

let html = "";

snapshot.forEach(item => {

const data = item.data();

html += `

<div class="admin-item">

<h3>${data.title}</h3>

<p>₹ ${data.amount}</p>

<img src="${data.qr}" width="120">

</div>

`;

});

list.innerHTML = html;

}

loadTax();

/*=========================================
BACKUP
=========================================*/

document.getElementById("backupBtn")?.addEventListener("click", () => {

alert("Backup Feature આગામી Version માં ઉમેરવામાં આવશે.");

});

document.getElementById("restoreBtn")?.addEventListener("click", () => {

alert("Restore Feature આગામી Version માં ઉમેરવામાં આવશે.");

});

/*=========================================
LOGOUT
=========================================*/

document.getElementById("logoutBtn")?.addEventListener("click", async () => {

await signOut(auth);

window.location.href = "login.html";

});

/*=========================================
FINAL INITIALIZATION
=========================================*/

console.log("==================================");

console.log("VASANA CHAUDHARY GRAM PANCHAYAT");

console.log("ADMIN PANEL READY");

console.log("Firebase Connected Successfully");

console.log("==================================");

/*=========================================
ONLINE APPLICATIONS
=========================================*/

async function loadApplications() {

  const list = document.getElementById("applicationsList");

  if (!list) return;

  const snapshot = await getDocs(collection(db, "applications"));

  let html = "";

  snapshot.forEach(item => {

    const data = item.data();

    let docs = "";

    if (data.documents && data.documents.length > 0) {

      data.documents.forEach(file => {
        docs += `<a href="${file.url}" target="_blank">${file.name}</a><br>`;
      });

    } else {

      docs = "કોઈ દસ્તાવેજ નથી";

    }

    html += `
    <tr>
      <td>${data.applicationNo || "-"}</td>
      <td>${
{
  birth:"જન્મ પ્રમાણપત્ર",
  death:"મૃત્યુ પ્રમાણપત્ર",
  income:"આવક દાખલો",
  residence:"રહેઠાણ દાખલો",
  property:"મિલકત આકારણી",
  tax:"ટેક્સ",
  complaint:"ફરિયાદ"
}[data.service] || data.service
}</td>
      <td>${data.name}</td>
      <td>${data.mobile}</td>
      <td>
  <span class="status ${data.status.toLowerCase()}">
    ${data.status}
  </span>
</td>
      <td>${docs}</td>

    <td>
  <button onclick="viewApplication('${item.id}')">
    👁 View
  </button>

  <button onclick="printApplication('${item.id}')">
    🖨 Print
  </button>
</td>

      <td>
        <button onclick="updateApplicationStatus('${item.id}','Approved')">
          ✅
        </button>

        <button onclick="updateApplicationStatus('${item.id}','Rejected')">
          ❌
        </button>

        <button onclick="deleteApplication('${item.id}')">
          🗑
        </button>
      </td>
    </tr>
    `;

  });

  list.innerHTML = html;

}

loadApplications();
async function updateApplicationStatus(id, status) {

  await updateDoc(doc(db, "applications", id), {
    status: status
  });

  alert("Status Update થઈ ગયો.");

  loadApplications();

}

window.updateApplicationStatus = updateApplicationStatus;
async function deleteApplication(id) {

  if (!confirm("શું અરજી કાઢી નાખવી છે?")) return;

  await deleteDoc(doc(db, "applications", id));

  alert("અરજી કાઢી નાખવામાં આવી.");

  loadApplications();

}

window.deleteApplication = deleteApplication;

async function viewApplication(id){

  const docSnap = await getDoc(doc(db,"applications",id));

  if(!docSnap.exists()){
    alert("અરજી મળી નથી.");
    return;
  }

  const data = docSnap.data();

  alert(
`અરજી નંબર: ${data.applicationNo || "-"}

નામ: ${data.name}

મોબાઇલ: ${data.mobile}

સેવા: ${data.service}

સ્થિતિ: ${data.status}`
  );

}

window.viewApplication = viewApplication;

function searchApplications(){

  const input = document.getElementById("searchApplication").value.toLowerCase();

  const items = document.querySelectorAll(".admin-item");

  items.forEach(item=>{

    if(item.innerText.toLowerCase().includes(input)){
      item.style.display="block";
    }else{
      item.style.display="none";
    }

  });

}

window.searchApplications = searchApplications;

async function printApplication(id) {

  const docSnap = await getDoc(doc(db, "applications", id));

  if (!docSnap.exists()) {
    alert("અરજી મળી નથી.");
    return;
  }

  const data = docSnap.data();

  // Website Settings
  const settingsSnap = await getDoc(doc(db, "website", "settings"));
  const settings = settingsSnap.exists() ? settingsSnap.data() : {};

  // Print Section માં માહિતી ભરો
  document.getElementById("printWebsiteName").innerText =
    settings.websiteName || "ગ્રામ પંચાયત";

  document.getElementById("printAddress").innerText =
    settings.panchayatAddress || "";

  document.getElementById("printContact").innerText =
    `મો. ${settings.panchayatMobile || ""} | Email: ${settings.panchayatEmail || ""}`;

  document.getElementById("pApplicationNo").innerText =
    data.applicationNo || "-";

  document.getElementById("pName").innerText =
    data.name || "-";

  document.getElementById("pMobile").innerText =
    data.mobile || "-";

  document.getElementById("pService").innerText =
    data.service || "-";

  document.getElementById("pStatus").innerText =
    data.status || "-";

  if (settings.logo)
    document.getElementById("printLogo").src = settings.logo;

  if (settings.stampImage)
    document.getElementById("printStamp").src = settings.stampImage;

  if (settings.sarpanchSignature)
    document.getElementById("printSignature").src = settings.sarpanchSignature;

  document.getElementById("printSarpanch").innerText =
    settings.sarpanchName || "";

  // Print Section બતાવો
  const printDiv = document.getElementById("printSection");
  printDiv.style.display = "block";

  // Image બનાવો
  const canvas = await html2canvas(printDiv, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  // ફરી Hide કરો
  printDiv.style.display = "none";

  // PDF બનાવો
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF("p", "mm", "a4");

  const imgData = canvas.toDataURL("image/png");

  const pageWidth = 210;
  const pageHeight = (canvas.height * pageWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

  pdf.save(`${data.applicationNo || "Application"}.pdf`);

}

window.printApplication = printApplication;
