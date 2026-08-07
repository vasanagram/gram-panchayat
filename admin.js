import { db, auth, supabase } from "./firebase-config.js";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const { jsPDF } = window.jspdf;

let taxChart = null;

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

/*=========================================
PROPERTY TAX DASHBOARD
=========================================*/

const taxSnapshot = await getDocs(collection(db, "taxPayments"));

let totalTaxCollection = 0;
let monthlyTaxCollection = 0;
let yearlyTaxCollection = 0;

let pendingTaxPayments = 0;
let approvedTaxPayments = 0;
let rejectedTaxPayments = 0;

for (const item of taxSnapshot.docs) {

  const payment = item.data();
let paymentDate = null;

if (payment.createdAt?.toDate) {

  paymentDate = payment.createdAt.toDate();

} else if (payment.createdAt?.seconds) {

  paymentDate = new Date(payment.createdAt.seconds * 1000);

}
  if (payment.status === "Pending") {
    pendingTaxPayments++;
  }

  if (payment.status === "Approved") {

console.log("Approved Count Before:", approvedTaxPayments);

    approvedTaxPayments++;
    
    console.log("Approved Count After:", approvedTaxPayments);
    
console.log("Approved Payment:", payment);
    const propertySnapshot = await getDocs(
      query(
        collection(db, "propertyTax"),
        where("propertyNo", "==", payment.propertyNo)
      )
    );

console.log(
  "Property Found:",
  propertySnapshot.empty,
  payment.propertyNo
);

    if (!propertySnapshot.empty) {

  const tax = Number(
    propertySnapshot.docs[0].data().taxAmount || 0
  );

  totalTaxCollection += tax;

  const today = new Date();

  if (paymentDate) {

    if (
      paymentDate.getMonth() === today.getMonth() &&
      paymentDate.getFullYear() === today.getFullYear()
    ) {
      monthlyTaxCollection += tax;
    }

    if (
      paymentDate.getFullYear() === today.getFullYear()
    ) {
      yearlyTaxCollection += tax;
    }

  }

}

  }

  if (payment.status === "Rejected") {
    rejectedTaxPayments++;
  }

}

document.getElementById("totalTaxCollection").innerText =
"₹ " + totalTaxCollection;
document.getElementById("monthlyTaxCollection").innerText =
"₹ " + monthlyTaxCollection;

document.getElementById("yearlyTaxCollection").innerText =
"₹ " + yearlyTaxCollection;

document.getElementById("pendingTaxPayments").innerText =
pendingTaxPayments;

document.getElementById("approvedTaxPayments").innerText =
approvedTaxPayments;

document.getElementById("rejectedTaxPayments").innerText =
rejectedTaxPayments;

const notification =
document.getElementById("paymentNotification");

if(notification){

  if(pendingTaxPayments > 0){

    notification.style.display = "block";

    notification.innerHTML =
    `🔔 <b>${pendingTaxPayments}</b> નવી વેરા ચુકવણી Verification માટે બાકી છે.`;

  } else {

    notification.style.display = "none";

  }

}

const ctx = document
.getElementById("taxChart");

if(ctx){

if(taxChart){
taxChart.destroy();
}

taxChart = new Chart(ctx,{

type:"doughnut",

data:{
labels:[
"Pending",
"Approved",
"Rejected"
],

datasets:[{

data:[
pendingTaxPayments,
approvedTaxPayments,
rejectedTaxPayments
]

}]

},

options:{
responsive:true,
plugins:{
legend:{
position:"bottom"
}
}

}

});

}

// 👇 refreshDashboard() અહીં બંધ કરો
}

refreshDashboard();

const CLOUD_NAME = "f62hvppq";
const UPLOAD_PRESET = "gram_upload_auto";

async function uploadToSupabase(file) {

  alert(file.type);
  alert(file.name);
  alert(file.size);

  const extension = file.name.split(".").pop().toLowerCase();

  const fileName =
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 8) +
    "." +
    extension;

  // File ને Blob માં ફેરવો
  const arrayBuffer = await file.arrayBuffer();

  const blob = new Blob([arrayBuffer], {
    type: file.type || "application/pdf"
  });

  alert("Uploading...");

  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(fileName, blob, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/pdf"
    });

  console.log(data);
  console.log(error);

  if (error) {
    alert(
      "Message: " + error.message +
      "\nStatus: " + error.status +
      "\nStatusCode: " + error.statusCode +
      "\nName: " + error.name
    );
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("uploads")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
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

async function clearCollection(collectionName){

  const snapshot = await getDocs(collection(db, collectionName));

  const batch = writeBatch(db);

  snapshot.forEach((item)=>{
    batch.delete(item.ref);
  });

  await batch.commit();

}

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
      
      if (data.taxQr)
  document.getElementById("taxQrPreview").src = data.taxQr;

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
    let taxQr = oldData.taxQr || "";

    if (document.getElementById("logoFile").files.length > 0) {
      logo = await uploadToSupabase(document.getElementById("logoFile").files[0]);
    }

    if (document.getElementById("bannerFile").files.length > 0) {
      banner = await uploadToSupabase(document.getElementById("bannerFile").files[0]);
    }

    if (document.getElementById("sarpanchImageFile").files.length > 0) {
      sarpanchImage = await uploadToSupabase(document.getElementById("sarpanchImageFile").files[0]);
    }

    if (document.getElementById("signatureFile").files.length > 0) {
      signature = await uploadToSupabase(document.getElementById("signatureFile").files[0]);
    }

    if (document.getElementById("stampFile").files.length > 0) {
      stamp = await uploadToSupabase(document.getElementById("stampFile").files[0]);
    }

if (document.getElementById("taxQrFile").files.length > 0) {
  taxQr = await uploadToSupabase(
    document.getElementById("taxQrFile").files[0]
  );
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
      taxQr: taxQr,

      panchayatMobile: document.getElementById("panchayatMobile").value,
      panchayatEmail: document.getElementById("panchayatEmail").value,
      panchayatAddress: document.getElementById("panchayatAddress").value,
      websiteUrl: document.getElementById("websiteUrl").value,

      createdAt: serverTimestamp()

    });
console.log("Tax QR:", taxQr);
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
  memberImage = await uploadToSupabase(
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
  noticeFile = await uploadToSupabase(fileInput.files[0]);
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

galleryImage = await uploadToSupabase(
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

const resolutionForm = document.getElementById("resolutionForm");

resolutionForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    let pdfUrl = "";

    const fileInput = document.getElementById("resolutionFile");

    if (fileInput.files.length > 0) {
      pdfUrl = await uploadToSupabase(fileInput.files[0]);
    }

    if (!pdfUrl) {
      throw new Error("PDF Upload Failed");
    }

    await addDoc(collection(db, "resolutions"), {
      title: document.getElementById("resolutionTitle").value,
      description: document.getElementById("resolutionDescription").value,
      file: pdfUrl,
      createdAt: serverTimestamp()
    });

    alert("ઠરાવ સફળતાપૂર્વક ઉમેરાયો.");

    resolutionForm.reset();

    loadResolutions();

  } catch (error) {

    console.error(error);

    alert(error.message);

  }

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

      documentUrl = await uploadToSupabase(fileInput.files[0]);

    }

if (!documentUrl) {
  throw new Error("Supabase Upload Failed");
}

    await addDoc(collection(db, "documents"), {

      title: document.getElementById("documentTitle").value,

      file: documentUrl,

      createdAt: serverTimestamp()

    });

    alert("દસ્તાવેજ સફળતાપૂર્વક ઉમેરાયો.");

    documentForm.reset();

    const preview = document.getElementById("documentPreview");
if (preview) {
  preview.src = "";
}

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
PROPERTY TAX
=========================================*/
let editingPropertyId = null;
previewImage("taxQrFile","taxQrPreview");

const propertyTaxForm = document.getElementById("propertyTaxForm");

propertyTaxForm?.addEventListener("submit", async (e)=>{

e.preventDefault();

try{

let qrUrl="";
const propertyNo =
document.getElementById("propertyNo").value.trim();

const duplicate = await getDocs(
  query(
    collection(db,"propertyTax"),
    where("propertyNo","==",propertyNo)
  )
);

if(
  !editingPropertyId &&
  !duplicate.empty
){
  alert("❌ આ મિલકત નંબર પહેલેથી અસ્તિત્વમાં છે.");
  return;
}
const qrFile=document.getElementById("taxQrFile");

if(qrFile.files.length>0){

qrUrl=await uploadToSupabase(qrFile.files[0]);

}

const propertyData = {

  propertyNo: propertyNo,

  houseNo: document.getElementById("houseNo").value.trim(),

  ownerName: document.getElementById("ownerName").value.trim(),

  ownerMobile: document.getElementById("ownerMobile").value.trim(),

  taxAmount: Number(document.getElementById("taxAmount").value),

  taxYear: document.getElementById("taxYear").value,

  lastDate: document.getElementById("lastDate").value,

  qr: qrUrl

};

if(editingPropertyId){

  await updateDoc(
    doc(db,"propertyTax",editingPropertyId),
    propertyData
  );

  alert("✅ મિલકતની માહિતી સફળતાપૂર્વક Update થઈ ગઈ.");

  editingPropertyId = null;

  document.getElementById("propertyTaxSubmitBtn").innerText =
  "💾 સેવ કરો";

}else{

  propertyData.createdAt = serverTimestamp();

  await addDoc(
    collection(db,"propertyTax"),
    propertyData
  );

  alert("✅ મિલકત વેરાની માહિતી સફળતાપૂર્વક સેવ થઈ ગઈ.");

}

propertyTaxForm.reset();

document.getElementById("taxQrPreview").src = "";

loadPropertyTax();

}catch(error){

  console.error(error);

  alert(error.message);

}

});

/*=========================================
LOAD PROPERTY TAX
=========================================*/

async function loadPropertyTax(){

  const snapshot = await getDocs(collection(db,"propertyTax"));

  let html = "";

  snapshot.forEach((docSnap)=>{

    const data = docSnap.data();

    html += `
    <div class="admin-item">

      <div>

        <h3>🏠 ${data.ownerName}</h3>

        <p><b>મિલકત નંબર :</b> ${data.propertyNo}</p>

        <p><b>ઘર નંબર :</b> ${data.houseNo}</p>

        <p><b>મોબાઇલ :</b> ${data.ownerMobile}</p>

        <p><b>વેરો :</b> ₹ ${data.taxAmount}</p>

        <p><b>વર્ષ :</b> ${data.taxYear}</p>

        <p><b>છેલ્લી તારીખ :</b> ${data.lastDate}</p>

      </div>

      <div class="admin-actions">

        <button type="button" onclick="globalThis.editProperty('${docSnap.id}')">
✏️ Edit
</button>

<button type="button"
onclick="globalThis.viewPaymentHistory('${data.propertyNo}')">
📜 History
</button>

<button type="button" class="delete-btn"
onclick="globalThis.deleteProperty('${docSnap.id}')">
🗑 Delete
</button>

      </div>

    </div>
    `;

  });

  document.getElementById("propertyTaxList").innerHTML = html;
document.getElementById("searchPropertyTax")
?.addEventListener("keyup", function () {

  const value = this.value.toLowerCase();

  document.querySelectorAll("#propertyTaxList .admin-item")
  .forEach(item => {

    item.style.display =
      item.innerText.toLowerCase().includes(value)
      ? "flex"
      : "none";

  });

});
}

loadPropertyTax();

async function viewPaymentHistory(propertyNo){

  const snapshot = await getDocs(
    query(
      collection(db,"taxPayments"),
      where("propertyNo","==",propertyNo)
    )
  );

  let html = `<h3>🏠 મિલકત નંબર : ${propertyNo}</h3>`;

  if(snapshot.empty){
    html += "<p>આ મિલકત માટે કોઈ ચુકવણી મળી નથી.</p>";
  }else{

    snapshot.forEach(item=>{

      const data = item.data();

      html += `
      <div class="admin-item">

        <p><b>UTR :</b> ${data.utr || "-"}</p>

        <p><b>Status :</b> ${data.status}</p>

<button
type="button"
onclick="globalThis.printTaxReceipt('${item.id}')">
📄 Receipt
</button>

      </div>
      `;

    });

  }

  document.getElementById("paymentHistoryList").innerHTML = html;

}

globalThis.viewPaymentHistory = viewPaymentHistory;

function printTaxReceipt(id){

  window.open(
    "receipt.html?id=" + id,
    "_blank"
  );

}

globalThis.printTaxReceipt = printTaxReceipt;

/*=========================================
EDIT PROPERTY
=========================================*/

async function editProperty(id){

console.log("Edit Click", id);

  const snap = await getDoc(
    doc(db,"propertyTax",id)
  );

  if(!snap.exists()) return;

  const data = snap.data();

  document.getElementById("propertyNo").value =
  data.propertyNo || "";

  document.getElementById("houseNo").value =
  data.houseNo || "";

  document.getElementById("ownerName").value =
  data.ownerName || "";

  document.getElementById("ownerMobile").value =
  data.ownerMobile || "";

  document.getElementById("taxAmount").value =
  data.taxAmount || "";

  document.getElementById("taxYear").value =
  data.taxYear || "";

  document.getElementById("lastDate").value =
  data.lastDate || "";
  
  editingPropertyId = id;

document.getElementById("propertyTaxSubmitBtn").innerText =
"💾 Update કરો";

}

globalThis.editProperty = editProperty;

/*=========================================
DELETE PROPERTY
=========================================*/

async function deleteProperty(id){

  const ok = confirm("આ મિલકત Delete કરવી છે?");

  if(!ok) return;

  await deleteDoc(doc(db,"propertyTax",id));

  alert("મિલકત Delete થઈ ગઈ.");

  loadPropertyTax();

}

globalThis.deleteProperty = deleteProperty;

/*=========================================
LOAD TAX PAYMENTS
=========================================*/

async function loadTaxPayments() {

const fromDate =
document.getElementById("fromDate")?.value;

const toDate =
document.getElementById("toDate")?.value;

  const snapshot = await getDocs(collection(db, "taxPayments"));

console.log(snapshot.docs.map(d => d.data()));

  let pendingHtml = "";
  let approvedHtml = "";
  let rejectedHtml = "";

  for (const item of snapshot.docs) {

    const payment = item.data();

let paymentDate = null;

if (payment.createdAt?.toDate) {

  paymentDate = payment.createdAt.toDate();

} else if (payment.createdAt?.seconds) {

  paymentDate = new Date(payment.createdAt.seconds * 1000);

}

if (paymentDate) {

  if (fromDate) {

    const from = new Date(fromDate);

    if (paymentDate < from) {
      continue;
    }

  }

  if (toDate) {

    const to = new Date(toDate);

    to.setHours(23,59,59,999);

    if (paymentDate > to) {
      continue;
    }

  }

}

    let owner = {};

    const propertySnap = await getDocs(
      query(
        collection(db, "propertyTax"),
        where("propertyNo", "==", payment.propertyNo)
      )
    );

    if (!propertySnap.empty) {
      owner = propertySnap.docs[0].data();
    }

    const card = `
    <div class="admin-item">

      <div>

        <h3>🏠 ${owner.ownerName || "-"}</h3>

        <p><b>મિલકત નંબર :</b> ${payment.propertyNo}</p>

        <p><b>UTR :</b> ${payment.utr}</p>

        <p><b>વેરો :</b> ₹ ${owner.taxAmount || "-"}</p>

        <p><b>Status :</b> ${payment.status}</p>

        <img
          src="${payment.screenshot}"
          onclick="window.open('${payment.screenshot}','_blank')"
          style="
            width:120px;
            border-radius:8px;
            cursor:pointer;
            margin-top:10px;
            border:1px solid #ddd;
          ">

      </div>

      <div class="admin-actions">

        <button onclick="approvePayment('${item.id}')">
          ✅ Approve
        </button>

        <button onclick="rejectPayment('${item.id}')">
          ❌ Reject
        </button>

        <button class="delete-btn"
          onclick="deletePayment('${item.id}')">
          🗑 Delete
        </button>

      </div>

    </div>
    `;

    if (payment.status === "Pending") {
      pendingHtml += card;
    } else if (payment.status === "Approved") {
      approvedHtml += card;
    } else if (payment.status === "Rejected") {
      rejectedHtml += card;
    }

  }

  document.getElementById("pendingPaymentsList").innerHTML = pendingHtml;

  document.getElementById("approvedPaymentsList").innerHTML = approvedHtml;

  document.getElementById("rejectedPaymentsList").innerHTML = rejectedHtml;

}

loadTaxPayments();



/*=========================================
APPROVE
=========================================*/

async function approvePayment(id){

await updateDoc(doc(db,"taxPayments",id),{

status:"Approved"

});

alert("ચુકવણી Approve થઈ ગઈ.");

loadTaxPayments();

}

window.approvePayment = approvePayment;

/*=========================================
REJECT
=========================================*/

async function rejectPayment(id){

const ok = confirm("શું તમે આ ચુકવણી Delete કરવા માંગો છો?");

if(!ok) return;

await deleteDoc(doc(db,"taxPayments",id));

alert("ચુકવણી Delete થઈ ગઈ.");

loadTaxPayments();

}

window.rejectPayment = rejectPayment;

/*=========================================
SEARCH
=========================================*/

document.getElementById("searchTaxPayment")
?.addEventListener("keyup",function(){

const value=this.value.toLowerCase();

document.querySelectorAll("#taxPaymentsList .admin-item")
.forEach(item=>{

item.style.display=
item.innerText.toLowerCase().includes(value)
? "flex"
: "none";

});

});

async function deletePayment(id){

  const ok = confirm("ખરેખર આ ચુકવણી Delete કરવી છે?");

  if(!ok) return;

  await deleteDoc(doc(db,"taxPayments",id));

  alert("ચુકવણી Delete થઈ ગઈ.");

  loadTaxPayments();
}

window.deletePayment = deletePayment;
/*=========================================
BACKUP
=========================================*/



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

document.getElementById("importTaxPdf")?.addEventListener("click", importPropertyTaxPdf);

async function importPropertyTaxPdf(){

const files =
document.getElementById("taxPdfFiles").files;

if(!files.length){

alert("PDF પસંદ કરો.");

return;

}

const progress =
document.getElementById("importProgress");

const result =
document.getElementById("importResult");

progress.innerHTML="PDF વાંચી રહ્યા છીએ...";

result.innerHTML="";

for(let f=0; f<files.length; f++){

const file=files[f];

const reader=new FileReader();

reader.onload=async function(){

const typedarray=new Uint8Array(this.result);

const pdf=
await pdfjsLib.getDocument({data:typedarray}).promise;

let fullText = "";

const propertyList = [];

const propertyRecords = [];

for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){

progress.innerHTML=
"Page "+pageNo+" / "+pdf.numPages;

const page=
await pdf.getPage(pageNo);

const viewport = page.getViewport({ scale: 2 });

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = viewport.width;
canvas.height = viewport.height;

await page.render({
  canvasContext: ctx,
  viewport: viewport
}).promise;

const text = await page.getTextContent();

const pageText = text.items
  .map(item => item.str)
  .join(" ");

fullText += pageText + "\n";

}
const lines = fullText.split("\n");

for (const line of lines) {

  const clean = line.trim();

  if (!clean) continue;

  const match = clean.match(/^(\d+)\s+(\d+\/?\d*)/);

  if (!match) continue;

  propertyRecords.push({
    propertyNo: match[1],
    houseNo: match[2],
    raw: clean
  });

}

console.log(propertyRecords);
result.innerHTML = `
<h3>OCR Result</h3>

<textarea
style="width:100%;height:400px;font-size:14px;">
${fullText}
</textarea>
`;

};

reader.readAsArrayBuffer(file);

}

}

document.getElementById("filterPaymentsBtn")
?.addEventListener("click", () => {

  loadTaxPayments();

});

document.getElementById("clearFilterBtn")
?.addEventListener("click", () => {

  document.getElementById("fromDate").value = "";

  document.getElementById("toDate").value = "";

  loadTaxPayments();

});

document.getElementById("exportApprovedExcel")
?.addEventListener("click", async () => {

  const snapshot = await getDocs(collection(db, "taxPayments"));

  const rows = [];

  for (const item of snapshot.docs) {

    const payment = item.data();

    if (payment.status !== "Approved") continue;

    let owner = {};

    const propertySnap = await getDocs(
      query(
        collection(db, "propertyTax"),
        where("propertyNo", "==", payment.propertyNo)
      )
    );

    if (!propertySnap.empty) {
      owner = propertySnap.docs[0].data();
    }

    rows.push({
      "મિલકત નંબર": payment.propertyNo,
      "માલિક": owner.ownerName || "",
      "ઘર નંબર": owner.houseNo || "",
      "મોબાઇલ": owner.ownerMobile || "",
      "વેરો": owner.taxAmount || 0,
      "UTR": payment.utr,
      "Status": payment.status
    });

  }

  const ws = XLSX.utils.json_to_sheet(rows);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Approved Payments");

  XLSX.writeFile(wb, "Approved_Payments.xlsx");

});

document.getElementById("backupBtn")
?.addEventListener("click", backupData);

async function backupData(){

  alert("Backup તૈયાર થઈ રહ્યું છે...");

  const backup = {};

  backup.website =
    (await getDoc(doc(db,"website","settings"))).data() || {};

  backup.members =
    (await getDocs(collection(db,"members")))
      .docs.map(d => ({id:d.id,...d.data()}));

  backup.notices =
    (await getDocs(collection(db,"notices")))
      .docs.map(d => ({id:d.id,...d.data()}));

  backup.gallery =
    (await getDocs(collection(db,"gallery")))
      .docs.map(d => ({id:d.id,...d.data()}));

  backup.complaints =
    (await getDocs(collection(db,"complaints")))
      .docs.map(d => ({id:d.id,...d.data()}));

  backup.propertyTax =
    (await getDocs(collection(db,"propertyTax")))
      .docs.map(d => ({id:d.id,...d.data()}));

  backup.taxPayments =
    (await getDocs(collection(db,"taxPayments")))
      .docs.map(d => ({id:d.id,...d.data()}));

  backup.applications =
    (await getDocs(collection(db,"applications")))
      .docs.map(d => ({id:d.id,...d.data()}));

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "GramPanchayat_Backup.json";

  a.click();

  URL.revokeObjectURL(url);

  alert("Backup સફળતાપૂર્વક Download થઈ ગયું.");

} // ✅ Function અહીં બંધ થશે

document.getElementById("restoreBtn")
?.addEventListener("click", () => {

  const ok = confirm(
    "Restore કરતા પહેલાં હાલનો તમામ ડેટા કાઢી નાખવામાં આવશે.\n\nશું તમે આગળ વધવા માંગો છો?"
  );

  if (!ok) return;

  document.getElementById("restoreFile").click();

});

document.getElementById("restoreFile")
?.addEventListener("change", async function () {

try {

  if (!this.files.length) return;

  const file = this.files[0];

  const text = await file.text();

  const backup = JSON.parse(text);

const progress =
document.getElementById("restoreProgress");

progress.style.display = "block";
progress.style.background = "#e8f5e9";
progress.style.color = "#2e7d32";

progress.innerHTML = "⏳ Backup File વાંચી રહ્યા છીએ...";

progress.innerHTML =
"🗑️ જૂનો Data કાઢી રહ્યા છીએ...";

// જૂનો Data Delete કરો

await clearCollection("members");
await clearCollection("notices");
await clearCollection("gallery");
await clearCollection("complaints");
await clearCollection("propertyTax");
await clearCollection("taxPayments");
await clearCollection("applications");

progress.innerHTML =
"📥 Backup Restore થઈ રહ્યું છે...";

  alert("Backup File સફળતાપૂર્વક વાંચાઈ ગઈ.");

  console.log(backup);

// Website Settings Restore

if (backup.website) {

  await setDoc(
    doc(db, "website", "settings"),
    backup.website
  );

}

// Members Restore
if (backup.members) {

  for (const item of backup.members) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "members", id),
      item
    );

  }

}

// Notices Restore
if (backup.notices) {

  for (const item of backup.notices) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "notices", id),
      item
    );

  }

}

// Gallery Restore
if (backup.gallery) {

  for (const item of backup.gallery) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "gallery", id),
      item
    );

  }

}

// Complaints Restore
if (backup.complaints) {

  for (const item of backup.complaints) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "complaints", id),
      item
    );

  }

}

// Property Tax Restore
if (backup.propertyTax) {

  for (const item of backup.propertyTax) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "propertyTax", id),
      item
    );

  }

}

// Tax Payments Restore
if (backup.taxPayments) {

  for (const item of backup.taxPayments) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "taxPayments", id),
      item
    );

  }

}

// Applications Restore
if (backup.applications) {

  for (const item of backup.applications) {

    const id = item.id;
    delete item.id;

    await setDoc(
      doc(db, "applications", id),
      item
    );

  }

}

progress.innerHTML =
"✅ Restore પૂર્ણ થયું.";

setTimeout(()=>{

progress.style.display = "none";

},3000);

alert("✅ Backup સફળતાપૂર્વક Restore થઈ ગયું.");

loadWebsiteSettings();
refreshDashboard();
loadTaxPayments();

setTimeout(() => {
  location.reload();
}, 1000);

} catch (error) {

  console.error(error);

  progress.style.display = "block";
  progress.style.background = "#ffebee";
  progress.style.color = "#c62828";

  progress.innerHTML =
  "❌ Restore નિષ્ફળ થયું.<br><br>" +
  error.message;

  alert("Restore Failed");

}

});