import { db, auth, supabase } from "./firebase-config.js";

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

previewImage("taxQrFile","taxQrPreview");

const propertyTaxForm = document.getElementById("propertyTaxForm");

propertyTaxForm?.addEventListener("submit", async (e)=>{

e.preventDefault();

try{

let qrUrl="";

const qrFile=document.getElementById("taxQrFile");

if(qrFile.files.length>0){

qrUrl=await uploadToSupabase(qrFile.files[0]);

}

await addDoc(collection(db,"propertyTax"),{

propertyNo:document.getElementById("propertyNo").value.trim(),

houseNo:document.getElementById("houseNo").value.trim(),

ownerName:document.getElementById("ownerName").value.trim(),

ownerMobile:document.getElementById("ownerMobile").value.trim(),

taxAmount:Number(document.getElementById("taxAmount").value),

taxYear:document.getElementById("taxYear").value,

lastDate:document.getElementById("lastDate").value,

qr:qrUrl,

createdAt:serverTimestamp()

});

alert("મિલકત વેરાની માહિતી સફળતાપૂર્વક સેવ થઈ ગઈ.");

propertyTaxForm.reset();

document.getElementById("taxQrPreview").src="";

loadPropertyTax();

}catch(error){

console.error(error);

alert(error.message);

}

});

/*=========================================
LOAD PROPERTY TAX
=========================================*/

async function loadPropertyTax() {

const list = document.getElementById("propertyTaxList");

if (!list) return;

const snapshot = await getDocs(collection(db, "propertyTax"));

let html = "";

snapshot.forEach(item => {

const data = item.data();

html += `

<div class="admin-item">

<div>

<h3>${data.ownerName}</h3>

<p><b>મિલકત નંબર :</b> ${data.propertyNo}</p>

<p><b>ઘર નંબર :</b> ${data.houseNo}</p>

<p><b>વેરો :</b> ₹ ${data.taxAmount}</p>

<p><b>વર્ષ :</b> ${data.taxYear}</p>

${data.qr ? `
<img
  src="${data.qr}"
  width="160"
  style="
    margin-top:10px;
    border-radius:8px;
    border:1px solid #ddd;
    padding:4px;
    background:#fff;
  ">
` : ""}

</div>

<div class="admin-actions">

<button class="edit-btn"
onclick="editPropertyTax('${item.id}')">
Edit
</button>

<button class="delete-btn"
onclick="deletePropertyTax('${item.id}')">
Delete
</button>

</div>

</div>

`;

});

list.innerHTML = html;

}

loadPropertyTax();

/*=========================================
SEARCH PROPERTY TAX
=========================================*/

document.getElementById("searchPropertyTax")
?.addEventListener("keyup", function(){

const value=this.value.toLowerCase();

const items=document.querySelectorAll("#propertyTaxList .admin-item");

items.forEach(item=>{

if(item.innerText.toLowerCase().includes(value)){

item.style.display="flex";

}else{

item.style.display="none";

}

});

});

/*=========================================
EDIT PROPERTY TAX
=========================================*/

async function editPropertyTax(id){

const ref = doc(db,"propertyTax",id);

const snap = await getDoc(ref);

if(!snap.exists()) return;

const data = snap.data();

const propertyNo = prompt("મિલકત નંબર",data.propertyNo);
if(propertyNo===null) return;

const houseNo = prompt("ઘર નંબર",data.houseNo);
if(houseNo===null) return;

const ownerName = prompt("મિલકતધારકનું નામ",data.ownerName);
if(ownerName===null) return;

const ownerMobile = prompt("મોબાઇલ નંબર",data.ownerMobile || "");
if(ownerMobile===null) return;

const taxAmount = prompt("વેરાની રકમ",data.taxAmount);
if(taxAmount===null) return;

const taxYear = prompt("વર્ષ",data.taxYear);
if(taxYear===null) return;

const lastDate = prompt("છેલ્લી તારીખ",data.lastDate || "");
if(lastDate===null) return;

await updateDoc(ref,{

propertyNo,
houseNo,
ownerName,
ownerMobile,
taxAmount:Number(taxAmount),
taxYear,
lastDate

});

alert("માહિતી સફળતાપૂર્વક સુધારાઈ.");

loadPropertyTax();

refreshDashboard();

}

window.editPropertyTax = editPropertyTax;


/*=========================================
DELETE PROPERTY TAX
=========================================*/

async function deletePropertyTax(id){

if(!confirm("શું આ મિલકતનો રેકોર્ડ કાઢી નાખવો છે?")){
return;
}

await deleteDoc(doc(db,"propertyTax",id));

alert("રેકોર્ડ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો.");

loadPropertyTax();

refreshDashboard();

}

window.deletePropertyTax = deletePropertyTax;

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
PROPERTY TAX PAYMENTS
=========================================*/

async function loadTaxPayments(){

const list=document.getElementById("taxPaymentsList");

if(!list) return;

const snapshot=await getDocs(collection(db,"taxPayments"));

let html="";

snapshot.forEach(item=>{

const data=item.data();

html+=`

<div class="admin-item">

<div>

<h3>🏠 ${data.propertyNo}</h3>

<p><b>UTR :</b> ${data.utr}</p>

<p><b>Status :</b> ${data.status}</p>

<a href="${data.screenshot}" target="_blank">
ચુકવણી Screenshot જુઓ
</a>

</div>

<div class="admin-actions">

<button onclick="approveTaxPayment('${item.id}')">
✅ Approve
</button>

<button onclick="rejectTaxPayment('${item.id}')">
❌ Reject
</button>

</div>

</div>

`;

});

list.innerHTML=html;

}

loadTaxPayments();

async function approveTaxPayment(id){

const receiptNo = prompt("પહોંચ નંબર દાખલ કરો");

if(!receiptNo){
  return;
}

await updateDoc(doc(db,"taxPayments",id),{
  status:"Receipt Ready",
  receiptNo: receiptNo,
  receiptDate: new Date().toLocaleDateString("en-GB")
});

alert("પહોંચ તૈયાર થઈ ગઈ.");

loadTaxPayments();

}

window.approveTaxPayment = approveTaxPayment;

async function rejectTaxPayment(id){

const ok = confirm("શું તમે આ ચુકવણીની માહિતી કાઢી નાખવા માંગો છો?");

if(!ok) return;

await deleteDoc(doc(db,"taxPayments",id));

alert("ચુકવણીની માહિતી સફળતાપૂર્વક કાઢી નાખવામાં આવી.");

loadTaxPayments();

}

window.rejectTaxPayment = rejectTaxPayment;

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