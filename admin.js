console.log("🔥 MY ADMIN.JS IS RUNNING");
import { db, auth, storage } from "./firebase-config.js";

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
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const { jsPDF } = window.jspdf;

let taxChart = null;

/*=========================================
  ADMIN SECURITY CHECK
=========================================*/

onAuthStateChanged(auth, async (user) => {

  // Login નથી
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    // admins collection માં UID શોધો
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    // Admin document નથી
    if (!adminSnap.exists()) {

      alert("❌ તમને Admin access નથી.");

      await signOut(auth);

      window.location.href = "login.html";

      return;
    }

    const adminData = adminSnap.data();

    // role admin હોવો જરૂરી
    if (adminData.role !== "admin") {

      alert("❌ તમારા account પાસે Admin permission નથી.");

      await signOut(auth);

      window.location.href = "login.html";

      return;
    }

    // Admin successfully verified
    console.log("✅ Admin verified:", user.email);
    console.log("Admin UID:", user.uid);

  } catch (error) {

    console.error("Admin Security Error:", error);

    alert("❌ Admin verification કરવામાં ભૂલ આવી.");

    await signOut(auth);

    window.location.href = "login.html";
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

async function uploadToSupabase(file) {

  if (!file) {
    throw new Error("કોઈ File પસંદ કરવામાં આવી નથી.");
  }

  const extension =
    file.name.split(".").pop().toLowerCase();

  const fileName =
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 8) +
    "." +
    extension;

  const storageRef =
    ref(storage, "uploads/" + fileName);

  try {

    alert("📤 File Upload થઈ રહી છે...");

    await uploadBytes(
      storageRef,
      file,
      {
        contentType:
          file.type || "application/octet-stream"
      }
    );

    const downloadURL =
      await getDownloadURL(storageRef);

    console.log(
      "✅ Firebase Storage Upload Success:",
      downloadURL
    );

    return downloadURL;

  } catch (error) {

    console.error(
      "❌ Firebase Storage Upload Error:",
      error
    );

    alert(
      "❌ File Upload કરવામાં ભૂલ આવી:\n" +
      error.message
    );

    throw error;
  }
}

window.uploadToSupabase = uploadToSupabase;
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

document.getElementById("websiteName").value =
  data.websiteName || "";

document.getElementById("bannerTitle").value =
  data.bannerTitle || "";

document.getElementById("bannerSubtitle").value =
  data.bannerSubtitle || "";

document.getElementById("sarpanchName").value =
  data.sarpanchName || "";

document.getElementById("sarpanchMessage").value =
  data.sarpanchMessage || "";

document.getElementById("panchayatMobile").value =
  data.panchayatMobile || "";

document.getElementById("panchayatEmail").value =
  data.panchayatEmail || "";

document.getElementById("panchayatAddress").value =
  data.panchayatAddress || "";

document.getElementById("websiteUrl").value =
  data.websiteUrl || "";

if (data.logo)
  document.getElementById("logoPreview").src = data.logo;

if (data.banner)
  document.getElementById("bannerPreview").src = data.banner;

if (data.sarpanchImage)
  document.getElementById("sarpanchPreview").src =
    data.sarpanchImage;

if (data.sarpanchSignature)
  document.getElementById("signaturePreview").src =
    data.sarpanchSignature;

if (data.stampImage)
  document.getElementById("stampPreview").src =
    data.stampImage;

if (data.taxQr)
  document.getElementById("taxQrPreview").src =
    data.taxQr;

  } catch (error) {
    console.error(error);
  }
}

const websiteForm =
  document.getElementById("websiteForm");

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
  logo = await uploadToSupabase(
    document.getElementById("logoFile").files[0]
  );
    }

    if (document.getElementById("bannerFile").files.length > 0) {
  banner = await uploadToSupabase(
    document.getElementById("bannerFile").files[0]
  );
}

if (document.getElementById("sarpanchImageFile").files.length > 0) {
  sarpanchImage = await uploadToSupabase(
    document.getElementById("sarpanchImageFile").files[0]
  );
}

if (document.getElementById("signatureFile").files.length > 0) {
  signature = await uploadToSupabase(
    document.getElementById("signatureFile").files[0]
  );
}

if (document.getElementById("stampFile").files.length > 0) {
  stamp = await uploadToSupabase(
    document.getElementById("stampFile").files[0]
  );
}

if (document.getElementById("taxQrFile").files.length > 0) {
  taxQr = await uploadToSupabase(
    document.getElementById("taxQrFile").files[0]
  );
}

    await setDoc(doc(db, "website", "settings"), {

      websiteName:
  document.getElementById("websiteName").value,

bannerTitle:
  document.getElementById("bannerTitle").value,

bannerSubtitle:
  document.getElementById("bannerSubtitle").value,

sarpanchName:
  document.getElementById("sarpanchName").value,

sarpanchMessage:
  document.getElementById("sarpanchMessage").value,

      logo: logo,
      banner: banner,
      sarpanchImage: sarpanchImage,
      sarpanchSignature: signature,
      stampImage: stamp,
      taxQr: taxQr,

      panchayatMobile:
  document.getElementById("panchayatMobile").value,

panchayatEmail:
  document.getElementById("panchayatEmail").value,

panchayatAddress:
  document.getElementById("panchayatAddress").value,

websiteUrl:
  document.getElementById("websiteUrl").value,

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
  VILLAGE INFORMATION
=========================================*/

const villageInfoForm =
    document.getElementById("villageInfoForm");


async function loadVillageInfoAdmin() {

  try {

    const snap =
      await getDoc(
        doc(db, "villageInfo", "main")
      );

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("villagePopulation").value =
    data.population || "";

    document.getElementById("villageHouses").value =
    data.houses || "";

    document.getElementById("villageSchool").value =
    data.school || "";

    document.getElementById("villageTemple").value =
    data.temple || "";

    document.getElementById("villageHistory").value =
    data.history || "";

  } catch (error) {

    console.error(
      "Village info load error:",
      error
    );

  }

}


villageInfoForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      await setDoc(
        doc(db, "villageInfo", "main"),
        {

          population:
            document
              .getElementById("villagePopulation")
              .value.trim(),

          houses:
            document
              .getElementById("villageHouses")
              .value.trim(),

          school:
            document
              .getElementById("villageSchool")
              .value.trim(),

          temple:
            document
              .getElementById("villageTemple")
              .value.trim(),

          history:
            document
              .getElementById("villageHistory")
              .value.trim(),

          updatedAt:
            serverTimestamp()

        }
      );

      alert(
        "✅ ગામની માહિતી સફળતાપૂર્વક સેવ થઈ ગઈ."
      );

      loadVillageInfoAdmin();

    } catch (error) {

      console.error(error);

      alert(
        "❌ માહિતી સેવ કરવામાં ભૂલ આવી: " +
        error.message
      );

    }

  }
);


/*=========================================
  LOAD VILLAGE INFORMATION
=========================================*/

loadVillageInfoAdmin();

/*=========================================
  VILLAGE INFORMATION - DELETE
=========================================*/

async function deleteVillageInfo() {

  const ok = confirm(
    "⚠️ શું તમે ગામની સંપૂર્ણ માહિતી Delete કરવા માંગો છો?"
  );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(db, "villageInfo", "main")
    );

    document.getElementById("villageInfoForm")?.reset();

    alert(
      "🗑️ ગામની માહિતી Delete થઈ ગઈ."
    );

  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.deleteVillageInfo =
  deleteVillageInfo;

/*=========================================
MEMBERS
=========================================*/

const memberForm = document.getElementById("memberForm");

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

const list = document.getElementById("memberList");

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

const noticeForm =
  document.getElementById("noticeForm");

noticeForm?.addEventListener("submit", async (e) => {

e.preventDefault();

let noticeFile = "";

const fileInput =
  document.getElementById("noticeFile");

if (fileInput.files.length > 0) {
  noticeFile = await uploadToSupabase(fileInput.files[0]);
}

await addDoc(collection(db, "notices"), {

  title:
  document.getElementById("noticeTitle").value,

  description:
  document.getElementById("noticeDescription").value,

  date:
  document.getElementById("noticeDate").value,

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

const list =
  document.getElementById("noticeList");

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

const galleryForm =
  document.getElementById("galleryForm");

galleryForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    const album =
  document.getElementById("galleryAlbum")?.value.trim() || "";

    const eventName =
  document.getElementById("galleryEventName")?.value.trim() || "";

    const eventDate =
  document.getElementById("galleryDate")?.value || "";

    const fileInput =
  document.getElementById("galleryImageFile");

    /* ------------------------------------
       VALIDATION
    ------------------------------------ */

    if (!album) {
      alert("⚠️ Album Name લખો.");
      return;
    }

    if (!eventName) {
      alert("⚠️ Event Name લખો.");
      return;
    }

    if (!fileInput || fileInput.files.length === 0) {
      alert("⚠️ કૃપા કરીને ઓછામાં ઓછો એક ફોટો પસંદ કરો.");
      return;
    }


    /* ------------------------------------
       MULTIPLE PHOTO UPLOAD
    ------------------------------------ */

    const files = Array.from(fileInput.files);

    const uploadedImages = [];

    for (const file of files) {

      if (!file.type.startsWith("image/")) {
        alert(
          "❌ " +
          file.name +
          " Image નથી."
        );
        continue;
      }

      const imageUrl =
        await uploadToSupabase(file);

      if (imageUrl) {
        uploadedImages.push(imageUrl);
      }

    }


    if (uploadedImages.length === 0) {
      throw new Error(
        "કોઈ ફોટો Upload થયો નથી."
      );
    }


    /* ------------------------------------
       SAVE EACH PHOTO IN FIRESTORE
    ------------------------------------ */

    for (const imageUrl of uploadedImages) {

      await addDoc(
        collection(db, "gallery"),
        {

          album: album,

          eventName: eventName,

          eventDate: eventDate,

          image: imageUrl,

          createdAt:
            serverTimestamp()

        }
      );

    }


    /* ------------------------------------
       SUCCESS
    ------------------------------------ */

    alert(
      `✅ ${uploadedImages.length} ફોટો સફળતાપૂર્વક ઉમેરાયા.`
    );


    galleryForm.reset();


    const preview =
  document.getElementById("galleryPreview");

    if (preview) {
      preview.src = "";
    }


    loadGallery();

    refreshDashboard();


  } catch (error) {

    console.error(
      "Gallery Upload Error:",
      error
    );

    alert(
      "❌ ફોટો ઉમેરવામાં ભૂલ આવી:\n" +
      error.message
    );

  }

});


/*=========================================
  LOAD GALLERY
=========================================*/

async function loadGallery() {

  const list =
  document.getElementById("galleryList");

  if (!list) return;


  try {

    const snapshot =
      await getDocs(
        collection(db, "gallery")
      );


    let html = "";


    snapshot.forEach((item) => {

      const data =
        item.data();


      html += `

        <div
          class="admin-item"
          style="
            display:flex;
            gap:15px;
            align-items:center;
            margin-bottom:15px;
            padding:15px;
            border:1px solid #ddd;
            border-radius:10px;
            background:#fff;
          "
        >

          <div>

            <img
              src="${data.image || ""}"
              width="120"
              height="80"
              style="
                object-fit:cover;
                border-radius:8px;
              "
            >

          </div>


          <div style="flex:1;">

            <h3>
              📁 ${data.album || "Album"}
            </h3>

            <p>
              🎉 <b>Event:</b>
              ${data.eventName || "-"}
            </p>

            <p>
              📅 <b>Date:</b>
              ${data.eventDate || "-"}
            </p>

          </div>


          <div class="admin-actions">

            <button
              class="edit-btn"
              type="button"
              onclick="
                editGallery('${item.id}')
              "
            >
              ✏️ Edit
            </button>


            <button
              class="delete-btn"
              type="button"
              onclick="
                deleteGallery('${item.id}')
              "
            >
              🗑️ Delete
            </button>

          </div>

        </div>

      `;

    });


    list.innerHTML =
      html ||
      "<p>હાલ કોઈ ફોટો ઉપલબ્ધ નથી.</p>";


  } catch (error) {

    console.error(
      "Gallery Load Error:",
      error
    );

    list.innerHTML =
      "<p>❌ Gallery લોડ કરવામાં ભૂલ આવી.</p>";

  }

}


loadGallery();


/*=========================================
  DELETE GALLERY PHOTO
=========================================*/

async function deleteGallery(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ ફોટો Delete કરવા માંગો છો?"
    );


  if (!ok) return;


  try {

    await deleteDoc(
      doc(db, "gallery", id)
    );


    alert(
      "🗑️ ફોટો સફળતાપૂર્વક Delete થઈ ગયો."
    );


    loadGallery();

    refreshDashboard();


  } catch (error) {

    console.error(
      "Gallery Delete Error:",
      error
    );

    alert(
      "❌ ફોટો Delete કરવામાં ભૂલ આવી:\n" +
      error.message
    );

  }

}


window.deleteGallery =
  deleteGallery;


/*=========================================
  EDIT GALLERY PHOTO
=========================================*/

async function editGallery(id) {

  try {

    const galleryRef =
      doc(db, "gallery", id);


    const gallerySnap =
      await getDoc(galleryRef);


    if (!gallerySnap.exists()) {

      alert(
        "❌ ફોટો મળ્યો નથી."
      );

      return;

    }


    const data =
      gallerySnap.data();


    /* ------------------------------------
       ALBUM
    ------------------------------------ */

    const newAlbum =
      prompt(
        "📁 Album Name:",
        data.album || ""
      );


    if (newAlbum === null) {
      return;
    }


    /* ------------------------------------
       EVENT NAME
    ------------------------------------ */

    const newEventName =
      prompt(
        "🎉 Event Name:",
        data.eventName || ""
      );


    if (newEventName === null) {
      return;
    }


    /* ------------------------------------
       EVENT DATE
    ------------------------------------ */

    const newEventDate =
      prompt(
        "📅 Event Date:",
        data.eventDate || ""
      );


    if (newEventDate === null) {
      return;
    }


    /* ------------------------------------
       UPDATE
    ------------------------------------ */

    await updateDoc(
      galleryRef,
      {

        album:
          newAlbum.trim(),

        eventName:
          newEventName.trim(),

        eventDate:
          newEventDate.trim(),

        updatedAt:
          serverTimestamp()

      }
    );


    alert(
      "✅ Gallery માહિતી સફળતાપૂર્વક Update થઈ."
    );


    loadGallery();


  } catch (error) {

    console.error(
      "Gallery Edit Error:",
      error
    );

    alert(
      "❌ Gallery Edit કરવામાં ભૂલ આવી:\n" +
      error.message
    );

  }

}


window.editGallery =
  editGallery;

/*=========================================
  VIDEO GALLERY
=========================================*/

const videoForm =
  document.getElementById("videoForm");

videoForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    await addDoc(
      collection(db, "videos"),
      {
        title:
  document.getElementById("videoTitle").value.trim(),

        url:
  document.getElementById("videoUrl").value.trim(),

        createdAt:
          serverTimestamp()
      }
    );

    alert("વિડિયો સફળતાપૂર્વક ઉમેરાયો.");

    videoForm.reset();

    loadVideos();

  } catch (error) {

    console.error(error);

    alert(
      "વિડિયો ઉમેરવામાં ભૂલ આવી: " +
      error.message
    );

  }

});


/*=========================================
  LOAD VIDEOS
=========================================*/

async function loadVideos() {

  const list =
  document.getElementById("videoList");

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "videos")
      );

    let html = "";

    snapshot.forEach((item) => {

      const data = item.data();

      html += `

        <div class="admin-item">

          <p>
            <b>${data.title || "વિડિયો"}</b>
          </p>

          <a
            href="${data.url}"
            target="_blank">
            ▶️ વિડિયો જુઓ
          </a>

          <div style="margin-top:10px;">

            <button
              onclick="editVideo('${item.id}')">
              ✏️ Edit
            </button>

            <button
              onclick="deleteVideo('${item.id}')">
              🗑️ Delete
            </button>

          </div>

        </div>

      `;

    });

    list.innerHTML =
      html ||
      "હાલ કોઈ વિડિયો ઉપલબ્ધ નથી.";

  } catch (error) {

    console.error(error);

    list.innerHTML =
      "❌ વિડિયો લોડ કરવામાં ભૂલ આવી.";

  }

}


/*=========================================
  EDIT VIDEO
=========================================*/

async function editVideo(id) {

  try {

    const snap =
      await getDoc(
        doc(db, "videos", id)
      );

    if (!snap.exists()) {

      alert("વિડિયો મળ્યો નથી.");

      return;

    }

    const data = snap.data();

    const newTitle =
      prompt(
        "વિડિયોનું નામ:",
        data.title || ""
      );

    if (newTitle === null) return;

    const newUrl =
      prompt(
        "વિડિયો URL:",
        data.url || ""
      );

    if (newUrl === null) return;

    await updateDoc(
      doc(db, "videos", id),
      {
        title: newTitle.trim(),
        url: newUrl.trim()
      }
    );

    alert(
      "✅ વિડિયો સફળતાપૂર્વક Update થયો."
    );

    loadVideos();

  } catch (error) {

    console.error(error);

    alert(
      "Edit કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.editVideo = editVideo;


/*=========================================
  DELETE VIDEO
=========================================*/

async function deleteVideo(id) {

  const ok =
    confirm(
      "⚠️ શું આ વિડિયો Delete કરવો છે?"
    );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(db, "videos", id)
    );

    alert(
      "🗑️ વિડિયો Delete થઈ ગયો."
    );

    loadVideos();

  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.deleteVideo = deleteVideo;


loadVideos();
/*=========================================
GRAM SABHA
=========================================*/

const gramsabhaForm =
  document.getElementById("gramsabhaForm");

gramsabhaForm?.addEventListener("submit", async (e) => {

e.preventDefault();

await addDoc(collection(db,"gramsabha"),{

title:
  document.getElementById("gsTitle").value,

date:
  document.getElementById("gsDate").value,

time:
  document.getElementById("gsTime").value,

place:
  document.getElementById("gsPlace").value,

description:
  document.getElementById("gsDescription").value,

createdAt:serverTimestamp()

});

alert("ગ્રામ સભા સફળતાપૂર્વક ઉમેરાઈ.");

gramsabhaForm.reset();

loadGramSabha();

});

async function loadGramSabha(){

const list =
  document.getElementById("gramsabhaList");

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

const resolutionForm =
  document.getElementById("resolutionForm");


resolutionForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      const title =
        document
          .getElementById("resolutionTitle")
          .value.trim();

      const description =
        document
          .getElementById("resolutionDescription")
          .value.trim();

      const fileInput =
  document.getElementById("resolutionFile");


      if (!title) {

        alert("ઠરાવનું શીર્ષક લખો.");

        return;

      }


      if (
        !fileInput ||
        fileInput.files.length === 0
      ) {

        alert("કૃપા કરીને PDF પસંદ કરો.");

        return;

      }


      const pdfUrl =
        await uploadToSupabase(
          fileInput.files[0]
        );


      if (!pdfUrl) {

        throw new Error(
          "PDF Upload Failed"
        );

      }


      await addDoc(
        collection(db, "resolutions"),
        {

          title: title,

          description: description,

          file: pdfUrl,

          createdAt:
            serverTimestamp()

        }
      );


      alert(
        "✅ ઠરાવ સફળતાપૂર્વક ઉમેરાયો."
      );


      resolutionForm.reset();

      loadResolutions();

      refreshDashboard();


    } catch (error) {

      console.error(error);

      alert(
        "ઠરાવ ઉમેરવામાં ભૂલ: " +
        error.message
      );

    }

  }
);


/*=========================================
  LOAD RESOLUTIONS
=========================================*/

async function loadResolutions() {

  const list =
    document.getElementById(
      "resolutionList"
    );

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "resolutions")
      );

    let html = "";


    snapshot.forEach((item) => {

      const data =
        item.data();


      html += `

        <div class="admin-item">

          <div>

            <h3>
              📜 ${data.title || "-"}
            </h3>

            <p>
              ${data.description || ""}
            </p>

            <a
              href="${data.file}"
              target="_blank"
              rel="noopener">

              📄 PDF જુઓ

            </a>

          </div>


          <div class="admin-actions">

            <button
              type="button"
              onclick="
                editResolution('${item.id}')
              ">

              ✏️ Edit

            </button>


            <button
              type="button"
              class="delete-btn"
              onclick="
                deleteResolution('${item.id}')
              ">

              🗑️ Delete

            </button>

          </div>

        </div>

      `;

    });


    list.innerHTML =
      html ||
      "<p>હાલ કોઈ ઠરાવ ઉપલબ્ધ નથી.</p>";


  } catch (error) {

    console.error(error);

    list.innerHTML =
      "<p>❌ ઠરાવો લોડ કરવામાં ભૂલ આવી.</p>";

  }

}


/*=========================================
  EDIT RESOLUTION
=========================================*/

async function editResolution(id) {

  try {

    const resolutionRef =
      doc(
        db,
        "resolutions",
        id
      );


    const resolutionSnap =
      await getDoc(
        resolutionRef
      );


    if (!resolutionSnap.exists()) {

      alert("ઠરાવ મળ્યો નથી.");

      return;

    }


    const data =
      resolutionSnap.data();


    const newTitle =
      prompt(
        "ઠરાવનું શીર્ષક:",
        data.title || ""
      );


    if (newTitle === null) return;


    const newDescription =
      prompt(
        "ઠરાવની વિગત:",
        data.description || ""
      );


    if (newDescription === null) return;


    const changeFile =
      confirm(
        "શું તમે PDF પણ બદલવા માંગો છો?"
      );


    let newFile =
      data.file || "";


    if (changeFile) {

      const fileInput =
        document.getElementById(
          "resolutionFile"
        );


      if (
        !fileInput ||
        fileInput.files.length === 0
      ) {

        alert(
          "કૃપા કરીને નવી PDF પસંદ કરો."
        );

        return;

      }


      newFile =
        await uploadToSupabase(
          fileInput.files[0]
        );


      if (!newFile) {

        throw new Error(
          "PDF Upload Failed"
        );

      }

    }


    await updateDoc(
      resolutionRef,
      {

        title:
          newTitle.trim(),

        description:
          newDescription.trim(),

        file:
          newFile,

        updatedAt:
          serverTimestamp()

      }
    );


    alert(
      "✅ ઠરાવ સફળતાપૂર્વક Update થયો."
    );


    const fileInput =
      document.getElementById(
        "resolutionFile"
      );

    if (fileInput) {

      fileInput.value = "";

    }


    loadResolutions();

    refreshDashboard();


  } catch (error) {

    console.error(error);

    alert(
      "Edit કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}


window.editResolution =
  editResolution;


/*=========================================
  DELETE RESOLUTION
=========================================*/

async function deleteResolution(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ ઠરાવ Delete કરવા માંગો છો?"
    );


  if (!ok) return;


  try {

    await deleteDoc(
      doc(
        db,
        "resolutions",
        id
      )
    );


    alert(
      "🗑️ ઠરાવ Delete થઈ ગયો."
    );


    loadResolutions();

    refreshDashboard();


  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}


window.deleteResolution =
  deleteResolution;


/*=========================================
  LOAD RESOLUTIONS
=========================================*/

loadResolutions();

/*=========================================
  DOCUMENTS
=========================================*/

const documentForm =
  document.getElementById("documentForm");


documentForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      let documentUrl = "";

      const fileInput =
        document.getElementById(
          "documentFile"
        );


      if (
        fileInput &&
        fileInput.files.length > 0
      ) {

        documentUrl =
          await uploadToSupabase(
            fileInput.files[0]
          );

      }


      if (!documentUrl) {

        throw new Error(
          "Supabase Upload Failed"
        );

      }


      await addDoc(
        collection(db, "documents"),
        {

          title:
            document
              .getElementById(
                "documentTitle"
              )
              .value
              .trim(),

          file:
            documentUrl,

          createdAt:
            serverTimestamp()

        }
      );


      alert(
        "✅ દસ્તાવેજ સફળતાપૂર્વક ઉમેરાયો."
      );


      documentForm.reset();

      loadDocuments();

      refreshDashboard();


    } catch (error) {

      console.error(error);

      alert(
        "દસ્તાવેજ ઉમેરવામાં ભૂલ: " +
        error.message
      );

    }

  }
);


/*=========================================
  LOAD DOCUMENTS
=========================================*/

async function loadDocuments() {

  const list =
    document.getElementById(
      "documentList"
    );

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "documents")
      );

    let html = "";


    snapshot.forEach((item) => {

      const data =
        item.data();


      html += `

        <div class="admin-item">

          <div>

            <h3>
              📄 ${data.title || "-"}
            </h3>

            <a
              href="${data.file}"
              target="_blank"
              rel="noopener">

              📄 દસ્તાવેજ જુઓ

            </a>

          </div>


          <div class="admin-actions">

            <button
              type="button"
              onclick="
                editDocument('${item.id}')
              ">

              ✏️ Edit

            </button>


            <button
              type="button"
              class="delete-btn"
              onclick="
                deleteDocument('${item.id}')
              ">

              🗑️ Delete

            </button>

          </div>

        </div>

      `;

    });


    list.innerHTML =
      html ||
      "<p>હાલ કોઈ દસ્તાવેજ ઉપલબ્ધ નથી.</p>";


  } catch (error) {

    console.error(error);

    list.innerHTML =
      "<p>❌ દસ્તાવેજો લોડ કરવામાં ભૂલ આવી.</p>";

  }

}


/*=========================================
  EDIT DOCUMENT
=========================================*/

async function editDocument(id) {

  try {

    const documentRef =
      doc(
        db,
        "documents",
        id
      );


    const documentSnap =
      await getDoc(
        documentRef
      );


    if (!documentSnap.exists()) {

      alert(
        "દસ્તાવેજ મળ્યો નથી."
      );

      return;

    }


    const data =
      documentSnap.data();


    const newTitle =
      prompt(
        "દસ્તાવેજનું નામ:",
        data.title || ""
      );


    if (newTitle === null) return;


    const fileInput =
      document.getElementById(
        "documentFile"
      );


    const changeFile =
      confirm(
        "શું તમે PDF/Image પણ બદલવા માંગો છો?"
      );


    let newFile =
      data.file || "";


    if (changeFile) {

      if (
        !fileInput ||
        fileInput.files.length === 0
      ) {

        alert(
          "કૃપા કરીને નવી PDF/Image પસંદ કરો."
        );

        return;

      }


      newFile =
        await uploadToSupabase(
          fileInput.files[0]
        );


      if (!newFile) {

        throw new Error(
          "Supabase Upload Failed"
        );

      }

    }


    await updateDoc(
      documentRef,
      {

        title:
          newTitle.trim(),

        file:
          newFile,

        updatedAt:
          serverTimestamp()

      }
    );


    alert(
      "✅ દસ્તાવેજ સફળતાપૂર્વક Update થયો."
    );


    if (fileInput) {

      fileInput.value = "";

    }


    loadDocuments();

    refreshDashboard();


  } catch (error) {

    console.error(error);

    alert(
      "Edit કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}


window.editDocument =
  editDocument;


/*=========================================
  DELETE DOCUMENT
=========================================*/

async function deleteDocument(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ દસ્તાવેજ કાઢી નાખવા માંગો છો?"
    );


  if (!ok) return;


  try {

    await deleteDoc(
      doc(
        db,
        "documents",
        id
      )
    );


    alert(
      "🗑️ દસ્તાવેજ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો."
    );


    loadDocuments();

    refreshDashboard();


  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}


window.deleteDocument =
  deleteDocument;


/*=========================================
  LOAD DOCUMENTS
=========================================*/

loadDocuments();


/*=========================================
  GOVERNMENT SCHEMES
=========================================*/

const schemeForm =
  document.getElementById("schemeForm");


schemeForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    await addDoc(
      collection(db, "schemes"),
      {

        title:
          document
            .getElementById("schemeTitle")
            .value.trim(),

        description:
          document
            .getElementById("schemeDescription")
            .value.trim(),

        link:
          document
            .getElementById("schemeLink")
            .value.trim(),

        createdAt:
          serverTimestamp()

      }
    );

    alert("✅ યોજના સફળતાપૂર્વક ઉમેરાઈ.");

    schemeForm.reset();

    loadSchemes();

  } catch (error) {

    console.error(error);

    alert(
      "યોજના ઉમેરવામાં ભૂલ આવી: " +
      error.message
    );

  }

});


/*=========================================
  LOAD SCHEMES
=========================================*/

async function loadSchemes() {

  const list =
  document.getElementById("schemeList");

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "schemes")
      );

    let html = "";

    snapshot.forEach((item) => {

      const data = item.data();

      html += `

        <div class="admin-item">

          <h3>
            🏛️ ${data.title || "-"}
          </h3>

          <p>
            ${data.description || "-"}
          </p>

          ${
            data.link
              ? `
                <p>
                  🔗
                  <a
                    href="${data.link}"
                    target="_blank">
                    વધુ માહિતી
                  </a>
                </p>
              `
              : ""
          }

          <div style="margin-top:10px;">

            <button
              onclick="editScheme('${item.id}')">
              ✏️ Edit
            </button>

            <button
              onclick="deleteScheme('${item.id}')">
              🗑️ Delete
            </button>

          </div>

        </div>

      `;

    });

    list.innerHTML =
      html ||
      "હાલ કોઈ સરકારી યોજના ઉપલબ્ધ નથી.";

  } catch (error) {

    console.error(error);

    list.innerHTML =
      "❌ યોજનાઓ લોડ કરવામાં ભૂલ આવી.";

  }

}


/*=========================================
  EDIT SCHEME
=========================================*/

async function editScheme(id) {

  try {

    const schemeRef =
      doc(db, "schemes", id);

    const schemeSnap =
      await getDoc(schemeRef);

    if (!schemeSnap.exists()) {

      alert("યોજના મળી નથી.");

      return;

    }

    const data =
      schemeSnap.data();


    const newTitle =
      prompt(
        "યોજનાનું નામ:",
        data.title || ""
      );

    if (newTitle === null) return;


    const newDescription =
      prompt(
        "યોજનાની વિગત:",
        data.description || ""
      );

    if (newDescription === null) return;


    const newLink =
      prompt(
        "વધુ માહિતી માટે Link:",
        data.link || ""
      );

    if (newLink === null) return;


    await updateDoc(
      schemeRef,
      {

        title:
          newTitle.trim(),

        description:
          newDescription.trim(),

        link:
          newLink.trim()

      }
    );


    alert(
      "✅ યોજના સફળતાપૂર્વક Update થઈ."
    );

    loadSchemes();

  } catch (error) {

    console.error(error);

    alert(
      "Edit કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.editScheme =
  editScheme;


/*=========================================
  DELETE SCHEME
=========================================*/

async function deleteScheme(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ યોજના Delete કરવા માંગો છો?"
    );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(db, "schemes", id)
    );

    alert(
      "🗑️ યોજના Delete થઈ ગઈ."
    );

    loadSchemes();

  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.deleteScheme =
  deleteScheme;


loadSchemes();

/*=========================================
  VILLAGE EXTRA INFORMATION
=========================================*/

const villageExtraForm =
  document.getElementById("villageExtraForm");


villageExtraForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    await addDoc(
      collection(db, "villageExtra"),
      {
        title:
          document
            .getElementById("villageExtraTitle")
            .value.trim(),

        description:
          document
            .getElementById("villageExtraDescription")
            .value.trim(),

        createdAt:
          serverTimestamp()
      }
    );

    alert("✅ ગામની માહિતી સફળતાપૂર્વક ઉમેરાઈ.");

    villageExtraForm.reset();

    loadVillageExtra();

  } catch (error) {

    console.error(error);

    alert(
      "માહિતી ઉમેરવામાં ભૂલ આવી: " +
      error.message
    );

  }

});


/*=========================================
  LOAD VILLAGE EXTRA INFORMATION
=========================================*/

async function loadVillageExtra() {

  const list =
  document.getElementById("villageExtraList");

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "villageExtra")
      );

    let html = "";

    snapshot.forEach((item) => {

      const data = item.data();

      html += `

        <div class="admin-item">

          <h3>
            ${data.title || "-"}
          </h3>

          <p>
            ${data.description || "-"}
          </p>

          <div style="margin-top:10px;">

            <button
              onclick="editVillageExtra('${item.id}')">
              ✏️ Edit
            </button>

            <button
              onclick="deleteVillageExtra('${item.id}')">
              🗑️ Delete
            </button>

          </div>

        </div>

      `;

    });

    list.innerHTML =
      html ||
      "હાલ કોઈ વધારાની માહિતી નથી.";

  } catch (error) {

    console.error(error);

    list.innerHTML =
      "❌ માહિતી લોડ કરવામાં ભૂલ આવી.";

  }

}


/*=========================================
  EDIT VILLAGE EXTRA - POPUP
=========================================*/

let editingVillageExtraId = null;


async function editVillageExtra(id) {

  try {

    const snap =
      await getDoc(
        doc(db, "villageExtra", id)
      );

    if (!snap.exists()) {

      alert("માહિતી મળી નથી.");
      return;

    }

    const data = snap.data();

    editingVillageExtraId = id;

    document.getElementById(
      "editVillageExtraTitle"
    ).value = data.title || "";

    document.getElementById(
      "editVillageExtraDescription"
    ).value = data.description || "";

    const popup =
      document.getElementById(
        "villageExtraEditPopup"
      );

    popup.style.display = "flex";

  } catch (error) {

    console.error(error);

    alert(
      "Edit કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}


window.editVillageExtra =
  editVillageExtra;


/*=========================================
  UPDATE VILLAGE EXTRA
=========================================*/

document
  .getElementById("updateVillageExtraBtn")
  ?.addEventListener("click", async () => {

    if (!editingVillageExtraId) return;

    const title =
      document
        .getElementById("editVillageExtraTitle")
        .value.trim();

    const description =
      document
        .getElementById("editVillageExtraDescription")
        .value.trim();

    if (!title || !description) {

      alert(
        "⚠️ શીર્ષક અને વિગત બંને ભરવા જરૂરી છે."
      );

      return;

    }

    try {

      await updateDoc(
        doc(
          db,
          "villageExtra",
          editingVillageExtraId
        ),
        {
          title: title,
          description: description,
          updatedAt: serverTimestamp()
        }
      );

      alert(
        "✅ માહિતી સફળતાપૂર્વક Update થઈ."
      );

      closeVillageExtraEdit();

      loadVillageExtra();

    } catch (error) {

      console.error(error);

      alert(
        "Update કરવામાં ભૂલ આવી: " +
        error.message
      );

    }

  });


/*=========================================
  CLOSE EDIT POPUP
=========================================*/

function closeVillageExtraEdit() {

  const popup =
    document.getElementById(
      "villageExtraEditPopup"
    );

  if (popup) {

    popup.style.display = "none";

  }

  editingVillageExtraId = null;

}

window.closeVillageExtraEdit =
  closeVillageExtraEdit;



/*=========================================
  DELETE VILLAGE EXTRA
=========================================*/

async function deleteVillageExtra(id) {

  const ok =
    confirm(
      "⚠️ શું આ ગામની માહિતી Delete કરવી છે?"
    );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(db, "villageExtra", id)
    );

    alert("🗑️ માહિતી Delete થઈ ગઈ.");

    loadVillageExtra();

  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.deleteVillageExtra =
  deleteVillageExtra;


loadVillageExtra();

/*=========================================
  COMPLAINTS
=========================================*/

async function loadComplaints() {

  const list =
  document.getElementById("complaintList");

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "complaints")
      );

    let html = "";

    snapshot.forEach((item) => {

      const data = item.data();

      const status =
        data.status || "Pending";

      html += `

        <div class="admin-item">

          <h3>
            📝 ${data.name || "-"}
          </h3>

          <p>
            <b>મોબાઇલ :</b>
            ${data.mobile || "-"}
          </p>

          <p>
            <b>વિષય :</b>
            ${data.subject || "-"}
          </p>

          <p>
            <b>ફરિયાદ :</b>
            ${data.details || "-"}
          </p>

          <p>
            <b>Status :</b>
            ${status}
          </p>


          <!-- STATUS BUTTONS -->

          <div
            style="
              display:flex;
              flex-wrap:wrap;
              gap:8px;
              margin-top:12px;
            ">

            <button
              type="button"
              onclick="
                updateComplaintStatus(
                  '${item.id}',
                  'Pending'
                )
              ">

              🟡 Pending

            </button>


            <button
              type="button"
              onclick="
                updateComplaintStatus(
                  '${item.id}',
                  'તપાસમાં'
                )
              ">

              🔵 તપાસમાં

            </button>


            <button
              type="button"
              onclick="
                updateComplaintStatus(
                  '${item.id}',
                  'ઉકેલાઈ'
                )
              ">

              🟢 ઉકેલાઈ

            </button>


            <button
              type="button"
              onclick="
                updateComplaintStatus(
                  '${item.id}',
                  'Reject'
                )
              ">

              🔴 Reject

            </button>


            <button
              type="button"
              class="delete-btn"
              onclick="
                deleteComplaint(
                  '${item.id}'
                )
              ">

              🗑️ Delete

            </button>

          </div>

        </div>

      `;

    });


    list.innerHTML =
      html ||
      "<p>હાલ કોઈ ફરિયાદ ઉપલબ્ધ નથી.</p>";

  } catch (error) {

    console.error(
      "Complaints load error:",
      error
    );

    list.innerHTML =
      "<p>❌ ફરિયાદો લોડ કરવામાં ભૂલ આવી.</p>";

  }

}


/*=========================================
  UPDATE COMPLAINT STATUS
=========================================*/

async function updateComplaintStatus(
  id,
  newStatus
) {

  try {

    await updateDoc(
      doc(db, "complaints", id),
      {
        status: newStatus,
        updatedAt: serverTimestamp()
      }
    );

    alert(
      "✅ ફરિયાદનો Status Update થઈ ગયો."
    );

    loadComplaints();

  } catch (error) {

    console.error(error);

    alert(
      "Status Update કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.updateComplaintStatus =
  updateComplaintStatus;


/*=========================================
  DELETE COMPLAINT
=========================================*/

async function deleteComplaint(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ ફરિયાદ Delete કરવા માંગો છો?"
    );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(db, "complaints", id)
    );

    alert(
      "🗑️ ફરિયાદ Delete થઈ ગઈ."
    );

    loadComplaints();

  } catch (error) {

    console.error(error);

    alert(
      "ફરિયાદ Delete કરવામાં ભૂલ આવી: " +
      error.message
    );

  }

}

window.deleteComplaint =
  deleteComplaint;


/*=========================================
  LOAD COMPLAINTS
=========================================*/

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
const qrFile = document.getElementById("taxQrFile");

if(qrFile.files.length>0){

qrUrl=await uploadToSupabase(qrFile.files[0]);

}

const propertyData = {

  propertyNo: propertyNo,

  houseNo:
    document.getElementById("houseNo").value.trim(),

  ownerName:
    document.getElementById("ownerName").value.trim(),

  ownerMobile:
    document.getElementById("ownerMobile").value.trim(),

  previousDue:
    Number(
      document.getElementById("previousDue").value || 0
    ),

  houseTax:
    Number(
      document.getElementById("houseTax").value || 0
    ),

  waterTax:
    Number(
      document.getElementById("waterTax").value || 0
    ),

  cleaningTax:
    Number(
      document.getElementById("cleaningTax").value || 0
    ),

  drainageTax:
    Number(
      document.getElementById("drainageTax").value || 0
    ),

  otherTax:
    Number(
      document.getElementById("otherTax").value || 0
    ),

  taxYear:
    document.getElementById("taxYear").value,

  lastDate:
    document.getElementById("lastDate").value,

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

  const snapshot = await getDocs(
    collection(db, "propertyTax")
  );

  let html = "";

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    html += `
      <div class="admin-item">

        <div>

          <h3>🏠 ${data.ownerName || "-"}</h3>

          <p>
            <b>મિલકત નંબર :</b>
            ${data.propertyNo || "-"}
          </p>

          <p>
            <b>ઘર નંબર :</b>
            ${data.houseNo || "-"}
          </p>

          <p>
            <b>મોબાઇલ :</b>
            ${data.mobile || "-"}
          </p>

          <p>
            <b>વેરો :</b>
            ₹ ${data.taxAmount || 0}
          </p>

          <p>
            <b>વર્ષ :</b>
            ${data.taxYear || "-"}
          </p>

          <p>
            <b>છેલ્લી તારીખ :</b>
            ${data.lastDate || "-"}
          </p>

        </div>

        <div class="admin-actions">

          <button
            type="button"
            onclick="globalThis.editProperty('${docSnap.id}')">
            ✏️ Edit
          </button>

          <button
            type="button"
            onclick="globalThis.viewPaymentHistory('${data.propertyNo || ""}')">
            📜 History
          </button>

          <button
            type="button"
            class="delete-btn"
            onclick="globalThis.deleteProperty('${docSnap.id}')">
            🗑 Delete
          </button>

        </div>

      </div>
    `;
  });

/*=========================================
  TOTAL PROPERTY RECORD COUNTER
=========================================*/

const totalPropertyRecords =
  document.getElementById("totalPropertyRecords");

if (totalPropertyRecords) {

  totalPropertyRecords.innerHTML = `
    📊 કુલ Property Records :
    <b>${snapshot.size}</b>
  `;

}
  /*=========================================
     ALL PROPERTY DATA DISPLAY
  =========================================*/

  const list =
    document.getElementById("propertyTaxList");

  if (list) {

    list.innerHTML = html;

  }


  /*=========================================
     SEARCH
  =========================================*/

  const search =
    document.getElementById("searchPropertyTax");

  if (search) {

    search.onkeyup = function () {

      const value =
        this.value
          .toLowerCase()
          .trim();


      document
        .querySelectorAll(
          "#propertyTaxList .admin-item"
        )
        .forEach(item => {

          const text =
            item.innerText.toLowerCase();


          item.style.display =
            text.includes(value)
              ? "flex"
              : "none";

        });

    };

  }


  console.log(
    "PROPERTY TAX TOTAL:",
    snapshot.size
  );

}


loadPropertyTax();

/* =========================================================
   PROPERTY TAX - FULL IMPORT CHECK
========================================================= */

async function checkPropertyTaxImports() {

  try {

    const propertySnap = await getDocs(
      collection(db, "propertyTax")
    );

    const importSnap = await getDocs(
      collection(db, "propertyTaxImports")
    );

    const total = propertySnap.size;

    let oldRecords = 0;

    const actualExcelRecords = {};


    /* PROPERTY RECORDS COUNT */

    propertySnap.forEach((docSnap) => {

      const data = docSnap.data();

      if (!data.importId) {

        oldRecords++;

      } else {

        const fileName =
          data.importFileName ||
          data.importId;

        if (!actualExcelRecords[fileName]) {
          actualExcelRecords[fileName] = 0;
        }

        actualExcelRecords[fileName]++;

      }

    });


    /* IMPORT FILE INFORMATION */

    let importText = "";

    importSnap.forEach((docSnap) => {

      const data = docSnap.data();

      const fileName =
        data.fileName || "Unknown Excel";

      const actual =
        actualExcelRecords[fileName] || 0;

      const excelRows =
        data.recordCount || 0;

      importText +=
        "📄 " + fileName + "\n" +
        "Excel Records: " + excelRows + "\n" +
        "Firestore Records: " + actual + "\n\n";

    });


    /* SHOW RESULT */

    const message =
      "📊 PROPERTY TAX CHECK\n\n" +
      "કુલ Property Records: " +
      total + "\n\n" +
      "જૂના Records: " +
      oldRecords + "\n\n" +
      "📂 Excel પ્રમાણે:\n\n" +
      importText;


    alert(message);

    console.log(message);

  } catch (error) {

    console.error(
      "PROPERTY CHECK ERROR:",
      error
    );

    alert(
      "❌ Check Error:\n" +
      error.message
    );

  }

}

globalThis.checkPropertyTaxImports =
  checkPropertyTaxImports;

/* =========================================================
   DELETE OLD PROPERTY TAX DATA
   ========================================================= */

async function cleanOldPropertyData() {

  const ok = confirm(
    "⚠️ જે Property Records Excel Importથી આવ્યા નથી તે બધા Delete થશે.\n\n" +
    "શું ખરેખર Delete કરવું છે?"
  );

  if (!ok) return;

  try {

    const snapshot = await getDocs(
      collection(db, "propertyTax")
    );

    // ફક્ત importId વગરના જૂના records
    const oldDocs = snapshot.docs.filter(
  docSnap => !docSnap.data().importId
);

    if (oldDocs.length === 0) {

      alert(
        "✅ કોઈ જૂનો Property Record મળ્યો નથી.\n\n" +
        "બધા Records Excel Importવાળા છે."
      );

      return;
    }

    const secondConfirm = confirm(
      "⚠️ કુલ " + oldDocs.length +
      " જૂના Property Records મળ્યા છે.\n\n" +
      "આ Records Delete થઈ જશે.\n\n" +
      "શું આગળ વધવું છે?"
    );

    if (!secondConfirm) return;


    /* =========================================
       FIRESTORE BATCH DELETE
       ========================================= */

    // Firestore એક batchમાં વધુમાં વધુ 500 operations
    const chunkSize = 450;

    for (
      let i = 0;
      i < oldDocs.length;
      i += chunkSize
    ) {

      const batch = writeBatch(db);

      const chunk = oldDocs.slice(
        i,
        i + chunkSize
      );

      chunk.forEach(docSnap => {

        batch.delete(docSnap.ref);

      });

      await batch.commit();
    }


    alert(
      "🗑️ જૂના Property Records સફળતાપૂર્વક Delete થઈ ગયા.\n\n" +
      "Delete થયેલા Records: " +
      oldDocs.length
    );


    // Property list ફરીથી Load
    if (typeof loadPropertyTax === "function") {
      await loadPropertyTax();
    }

    // Dashboard count પણ update
    if (typeof refreshDashboard === "function") {
      await refreshDashboard();
    }


  } catch (error) {

    console.error(
      "❌ OLD PROPERTY DELETE ERROR:",
      error
    );

    alert(
      "❌ જૂના Property Records Delete કરવામાં ભૂલ આવી:\n\n" +
      error.message
    );

  }
}


// HTML button onclick માટે
globalThis.cleanOldPropertyData =
  cleanOldPropertyData;

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

  document.getElementById("previousDue").value =
  data.previousDue || 0;

document.getElementById("houseTax").value =
  data.houseTax || 0;

document.getElementById("waterTax").value =
  data.waterTax || 0;

document.getElementById("cleaningTax").value =
  data.cleaningTax || 0;

document.getElementById("drainageTax").value =
  data.drainageTax || 0;

document.getElementById("otherTax").value =
  data.otherTax || 0;

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

        <button onclick="rejectTaxPaymentFixed('${item.id}')">
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
REJECT TAX PAYMENT
=========================================*/

async function rejectPayment(id){

  const ok = confirm(
    "⚠️ શું તમે આ ચુકવણી Reject કરવા માંગો છો?"
  );

  if(!ok) return;

  try {

    await updateDoc(
      doc(db, "taxPayments", id),
      {
        status: "Rejected",
        rejectedAt: serverTimestamp()
      }
    );

    alert("❌ ચુકવણી Reject થઈ ગઈ.");

    await loadTaxPayments();

    if (typeof refreshDashboard === "function") {
  await refreshDashboard();
    }

  } catch (error) {

    console.error(
      "Tax Payment Reject Error:",
      error
    );

    alert(
      "❌ Reject કરવામાં ભૂલ:\n" +
      error.message
    );
  }
}

window.rejectPayment = rejectPayment;

/*=========================================
SEARCH
=========================================*/

document.getElementById("searchTaxPayment")
  ?.addEventListener("keyup", function(){

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
   CENTRAL ONLINE APPLICATIONS
=========================================*/

async function loadApplications() {

  const list =
  document.getElementById("applicationsList");

  if (!list) return;

  list.innerHTML = `
    <tr>
      <td colspan="9"
          style="text-align:center;padding:20px;">
        ⏳ અરજીઓ લોડ થઈ રહી છે...
      </td>
    </tr>
  `;

  try {

    const snapshot =
      await getDocs(
        collection(db, "applications")
      );

    const search =
      document.getElementById(
        "searchApplication"
      )?.value
      ?.trim()
      .toLowerCase() || "";

    const statusFilter =
      document.getElementById(
        "applicationStatusFilter"
      )?.value || "";

    const serviceFilter =
      document.getElementById(
        "applicationServiceFilter"
      )?.value || "";

    let html = "";

    snapshot.forEach(item => {

      const data = item.data();

      const applicationNo =
        data.applicationNo || "-";

      const name =
        data.propertyData?.applicantName ||
        data.name ||
        "-";

      const mobile =
        data.propertyData?.mobile ||
        data.mobile ||
        "-";

      const propertyNo =
        data.propertyData?.propertyNo ||
        "-";

      const status =
        data.status || "Pending";


      /* SEARCH */

      const searchText = `
        ${applicationNo}
        ${name}
        ${mobile}
        ${propertyNo}
      `.toLowerCase();

      if (
        search &&
        !searchText.includes(search)
      ) {
        return;
      }


      /* STATUS FILTER */

      if (
        statusFilter &&
        status !== statusFilter
      ) {
        return;
      }


      /* SERVICE FILTER */

      if (
        serviceFilter &&
        data.service !== serviceFilter
      ) {
        return;
      }


      /* SERVICE NAME */

      const serviceNames = {

        birth:
          "જન્મ પ્રમાણપત્ર",

        death:
          "મૃત્યુ પ્રમાણપત્ર",

        income:
          "આવક દાખલો",

        residence:
          "રહેઠાણ દાખલો",

        property:
          "મિલકત આકારણી",

        tax:
          "ટેક્સ",

        complaint:
          "ફરિયાદ"

      };

      const service =
        serviceNames[data.service] ||
        data.service ||
        "-";


      /* STATUS TEXT */

      let statusText =
        "🟡 Pending";

      if (status === "Approved") {
        statusText =
          "🟢 Approved";
      }

      if (status === "Rejected") {
        statusText =
          "🔴 Rejected";
      }


      /* DOCUMENTS */

      let docs = "-";

      if (
        Array.isArray(data.documents) &&
        data.documents.length > 0
      ) {

        docs =
          data.documents
            .map(file => {

              if (!file?.url) {
                return "";
              }

              return `
                <a
                  href="${file.url}"
                  target="_blank"
                  rel="noopener noreferrer">

                  📄 ${
                    file.name ||
                    "દસ્તાવેજ"
                  }

                </a>
              `;

            })
            .join("<br>");

      }


      /* ROW */

      html += `

        <tr>

          <td>
            <b>${applicationNo}</b>
          </td>

          <td>
            ${service}
          </td>

          <td>
            ${name}
          </td>

          <td>
            ${mobile}
          </td>

          <td>
            ${propertyNo}
          </td>

          <td>
            ${statusText}
          </td>

          <td>
            ${docs}
          </td>

          <td>

            <button
              onclick="
                viewApplication('${item.id}')
              ">

              👁 View

            </button>

            <button
              onclick="
                printApplication('${item.id}')
              ">

              🖨 Print

            </button>

          </td>

          <td>

            ${
              status !== "Approved"
                ? `
                  <button
                    onclick="
                      updateApplicationStatus(
                        '${item.id}',
                        'Approved'
                      )
                    ">

                    ✅

                  </button>
                `
                : ""
            }


            ${
              status !== "Rejected"
                ? `
                  <button
                    onclick="
                      updateApplicationStatus(
                        '${item.id}',
                        'Rejected'
                      )
                    ">

                    ❌

                  </button>
                `
                : ""
            }


            <button
              onclick="
                deleteApplication('${item.id}')
              ">

              🗑

            </button>

          </td>

        </tr>

      `;

    });


    if (!html) {

      html = `
        <tr>

          <td
            colspan="9"
            style="
              text-align:center;
              padding:25px;
            ">

            📭 કોઈ અરજી મળી નથી.

          </td>

        </tr>
      `;

    }


    list.innerHTML = html;


  } catch (error) {

    console.error(
      "Application Load Error:",
      error
    );

    list.innerHTML = `
      <tr>

        <td
          colspan="9"
          style="
            text-align:center;
            color:red;
            padding:20px;
          ">

          ❌ અરજીઓ લોડ કરવામાં ભૂલ:

          <br>

          ${error.message}

        </td>

      </tr>
    `;

  }

}

loadApplications();

window.loadApplications =
  loadApplications;
/*=========================================
   SEARCH
=========================================*/

function searchApplications() {

  loadApplications();

}

window.searchApplications =
  searchApplications;


/*=========================================
   INITIAL LOAD
=========================================*/

loadApplications();

/*=========================================
FINAL INITIALIZATION
=========================================*/

console.log("==================================");

console.log("VASANA CHAUDHARY GRAM PANCHAYAT");

console.log("ADMIN PANEL READY");

console.log("Firebase Connected Successfully");

console.log("==================================");



/*=========================================
   APPLICATION STATUS + HISTORY
=========================================*/

async function updateApplicationStatus(id, status) {

  try {

    let rejectionReason = "";

    /* REJECT REASON */

    if (status === "Rejected") {

      rejectionReason =
        prompt(
          "❌ Reject કરવાનું કારણ લખો:"
        );

      if (
        rejectionReason === null ||
        !rejectionReason.trim()
      ) {

        alert(
          "⚠️ Reject કરવા માટે કારણ લખવું જરૂરી છે."
        );

        return;

      }

      rejectionReason =
        rejectionReason.trim();

    }


    /* APPROVE CONFIRMATION */

    if (status === "Approved") {

      const ok =
        confirm(
          "શું તમે આ અરજી Approve કરવા માંગો છો?"
        );

      if (!ok) return;

    }


    /* APPLICATION UPDATE */

    const applicationRef =
      doc(
        db,
        "applications",
        id
      );


    await updateDoc(
      applicationRef,
      {

        status: status,

        rejectionReason:
          rejectionReason,

        updatedAt:
          serverTimestamp()

      }
    );


    /* STATUS HISTORY */

    await addDoc(
      collection(
        db,
        "applications",
        id,
        "history"
      ),
      {

        status: status,

        rejectionReason:
          rejectionReason,

        createdAt:
          serverTimestamp()

      }
    );


    alert(
      status === "Approved"
        ? "✅ અરજી Approved થઈ ગઈ."
        : "❌ અરજી Rejected થઈ ગઈ."
    );


    /* REFRESH */

    await loadApplications();


  } catch (error) {

    console.error(
      "Application Status Error:",
      error
    );


    alert(
      "❌ Status update કરવામાં ભૂલ:\n" +
      error.message
    );

  }

}


window.updateApplicationStatus =
  updateApplicationStatus;
async function deleteApplication(id) {

  if (!confirm("શું અરજી કાઢી નાખવી છે?")) return;

  await deleteDoc(doc(db, "applications", id));

  alert("અરજી કાઢી નાખવામાં આવી.");

  loadApplications();

}

window.deleteApplication = deleteApplication;

/*====================================================
  CONTACT MANAGEMENT - FIXED
====================================================*/

const contactFormFixed =
  document.getElementById("contactForm");

contactFormFixed?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name =
    document.getElementById("contactName")?.value.trim() || "";

  const position =
    document.getElementById("contactPosition")?.value.trim() || "";

  const mobile =
    document.getElementById("contactMobile")?.value.trim() || "";

  const email =
    document.getElementById("contactEmail")?.value.trim() || "";

  if (!name || !position) {
    alert("⚠️ નામ અને હોદ્દો ભરવો જરૂરી છે.");
    return;
  }

  try {

    await addDoc(collection(db, "contacts"), {
      name: name,
      position: position,
      mobile: mobile,
      email: email,
      createdAt: serverTimestamp()
    });

    alert("✅ સંપર્ક સફળતાપૂર્વક ઉમેરાયો.");

    contactFormFixed.reset();

    await loadContactsFixed();

  } catch (error) {

    console.error(
      "CONTACT ADD ERROR:",
      error
    );

    alert(
      "❌ સંપર્ક ઉમેરવામાં ભૂલ આવી:\n" +
      error.message
    );
  }
});


/*====================================================
  LOAD CONTACTS
====================================================*/

async function loadContactsFixed() {

  const list =
  document.getElementById("contactList");

  if (!list) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "contacts")
      );

    let html = "";

    snapshot.forEach((item) => {

      const data = item.data();

      html += `
        <div class="admin-item">

          <div>

            <h3>
              👤 ${data.name || "-"}
            </h3>

            <p>
              <strong>હોદ્દો:</strong>
              ${data.position || "-"}
            </p>

            <p>
              📞 ${data.mobile || "-"}
            </p>

            <p>
              ✉️ ${data.email || "-"}
            </p>

          </div>

          <div class="admin-actions">

            <button
              class="edit-btn"
              onclick="editContactFixed('${item.id}')">

              ✏️ Edit

            </button>

            <button
              class="delete-btn"
              onclick="deleteContactFixed('${item.id}')">

              🗑️ Delete

            </button>

          </div>

        </div>
      `;
    });

    list.innerHTML =
      html ||
      "<p>હાલ કોઈ સંપર્ક ઉમેરાયેલ નથી.</p>";

  } catch (error) {

    console.error(
      "CONTACT LOAD ERROR:",
      error
    );

    list.innerHTML =
      "<p>❌ સંપર્ક લોડ કરવામાં ભૂલ આવી.</p>";
  }
}


/*====================================================
  EDIT CONTACT
====================================================*/

let editingContactIdFixed = null;


async function editContactFixed(id) {

  try {

    const snap =
      await getDoc(
        doc(db, "contacts", id)
      );

    if (!snap.exists()) {

      alert("સંપર્ક મળ્યો નથી.");

      return;
    }

    const data =
      snap.data();

    editingContactIdFixed = id;


    document.getElementById(
      "editContactName"
    ).value =
      data.name || "";


    document.getElementById(
      "editContactPosition"
    ).value =
      data.position || "";


    document.getElementById(
      "editContactMobile"
    ).value =
      data.mobile || "";


    document.getElementById(
      "editContactEmail"
    ).value =
      data.email || "";


    document.getElementById(
      "contactEditPopup"
    ).style.display = "flex";


  } catch (error) {

    console.error(
      "CONTACT EDIT ERROR:",
      error
    );

    alert(
      "❌ Edit કરવામાં ભૂલ આવી:\n" +
      error.message
    );
  }
}


/*====================================================
  UPDATE CONTACT
====================================================*/

document
  .getElementById("updateContactBtn")
  ?.addEventListener(
    "click",
    async () => {

      if (!editingContactIdFixed) {
        return;
      }


      const name =
        document
          .getElementById(
            "editContactName"
          )
          ?.value.trim() || "";


      const position =
        document
          .getElementById(
            "editContactPosition"
          )
          ?.value.trim() || "";


      const mobile =
        document
          .getElementById(
            "editContactMobile"
          )
          ?.value.trim() || "";


      const email =
        document
          .getElementById(
            "editContactEmail"
          )
          ?.value.trim() || "";


      if (!name || !position) {

        alert(
          "⚠️ નામ અને હોદ્દો ભરવો જરૂરી છે."
        );

        return;
      }


      try {

        await updateDoc(
          doc(
            db,
            "contacts",
            editingContactIdFixed
          ),
          {

            name: name,

            position: position,

            mobile: mobile,

            email: email,

            updatedAt:
              serverTimestamp()
          }
        );


        alert(
          "✅ સંપર્ક સફળતાપૂર્વક Update થયો."
        );


        closeContactEditFixed();


        await loadContactsFixed();


      } catch (error) {

        console.error(
          "CONTACT UPDATE ERROR:",
          error
        );

        alert(
          "❌ Update કરવામાં ભૂલ આવી:\n" +
          error.message
        );
      }

    }
  );


/*====================================================
  CLOSE EDIT POPUP
====================================================*/

function closeContactEditFixed() {

  const popup =
    document.getElementById(
      "contactEditPopup"
    );


  if (popup) {

    popup.style.display =
      "none";
  }


  editingContactIdFixed =
    null;
}


/*====================================================
  DELETE CONTACT
====================================================*/

async function deleteContactFixed(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ સંપર્ક Delete કરવા માંગો છો?"
    );


  if (!ok) {
    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        "contacts",
        id
      )
    );


    alert(
      "🗑️ સંપર્ક Delete થઈ ગયો."
    );


    await loadContactsFixed();


  } catch (error) {

    console.error(
      "CONTACT DELETE ERROR:",
      error
    );


    alert(
      "❌ Delete કરવામાં ભૂલ આવી:\n" +
      error.message
    );
  }
}


/*====================================================
  GLOBAL FUNCTIONS
====================================================*/

window.editContactFixed =
  editContactFixed;


window.deleteContactFixed =
  deleteContactFixed;


window.closeContactEditFixed =
  closeContactEditFixed;


/*====================================================
  START CONTACTS
====================================================*/

loadContactsFixed();


/*====================================================
  CONTACT MANAGEMENT FIX END
====================================================*/

/* =========================================================
   APPLICATION SECTIONS - FIXED
   Birth / Death / Income / Complaint
========================================================= */

function appSafe(value) {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   COMMON APPLICATION LOADER
========================================================= */

async function loadServiceApplications(
  service,
  listId,
  searchId,
  title,
  icon
) {

  const list =
    document.getElementById(listId);

  if (!list) return;

  list.innerHTML =
    "⏳ અરજીઓ લોડ થઈ રહી છે...";

  try {

    const snapshot =
      await getDocs(
        collection(db, "applications")
      );

    const search =
      document
        .getElementById(searchId)
        ?.value
        ?.trim()
        .toLowerCase() || "";

    let html = "";

    snapshot.forEach((docSnap) => {

      const data =
        docSnap.data();

      /* SERVICE CHECK */
      if (data.service !== service) {
        return;
      }

      const applicationNo =
        data.applicationNo || "-";

      const name =
        data.name ||
        data.propertyData?.applicantName ||
        data.birthData?.birthApplicantName ||
        data.incomeData?.incomeApplicantName ||
        "-";

      const mobile =
        data.mobile ||
        data.propertyData?.mobile ||
        "-";

      const status =
        data.status || "Pending";

      const searchText = `
        ${applicationNo}
        ${name}
        ${mobile}
      `.toLowerCase();

      /* SEARCH */
      if (
        search &&
        !searchText.includes(search)
      ) {
        return;
      }


      /* STATUS */
      let statusText =
        "🟡 Pending";

      if (status === "Approved") {
        statusText =
          "🟢 Approved";
      }

      if (status === "Rejected") {
        statusText =
          "🔴 Rejected";
      }


      /* EXTRA DATA */

      let extraHtml = "";

      if (service === "birth") {

        const birth =
          data.birthData || {};

        extraHtml = `
          <p>
            <b>બાળકનું નામ:</b>
            ${appSafe(birth.birthName)}
          </p>

          <p>
            <b>જન્મ તારીખ:</b>
            ${appSafe(birth.birthDate)}
          </p>

          <p>
            <b>જન્મ સ્થળ:</b>
            ${appSafe(birth.birthPlace)}
          </p>

          <p>
            <b>માતાનું નામ:</b>
            ${appSafe(birth.birthMother)}
          </p>

          <p>
            <b>પિતાનું નામ:</b>
            ${appSafe(birth.birthFather)}
          </p>
        `;
      }


      if (service === "death") {

        const death =
          data.deathData || {};

        extraHtml = `
          <p>
            <b>મરનારનું નામ:</b>
            ${appSafe(death.deathName)}
          </p>

          <p>
            <b>ઉંમર:</b>
            ${appSafe(death.deathAge)}
          </p>

          <p>
            <b>મરણ તારીખ:</b>
            ${appSafe(death.deathDate)}
          </p>

          <p>
            <b>મરણ સ્થળ:</b>
            ${appSafe(death.deathPlace)}
          </p>

          <p>
            <b>પતિ / પત્ની:</b>
            ${appSafe(death.deathSpouse)}
          </p>
        `;
      }


      if (service === "income") {

        const income =
          data.incomeData || {};

        extraHtml = `
          <p>
            <b>સરનામું:</b>
            ${appSafe(income.incomeAddress)}
          </p>

          <p>
            📷 પાસપોર્ટ ફોટો:
            ${
              income.incomePhoto?.url
                ? `<a href="${appSafe(income.incomePhoto.url)}"
                     target="_blank">
                     📂 જુઓ
                   </a>`
                : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            🪪 આધાર:
            ${
              income.incomeAadhaar?.url
                ? `<a href="${appSafe(income.incomeAadhaar.url)}"
                     target="_blank">
                     📂 જુઓ
                   </a>`
                : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            📄 રેશન કાર્ડ:
            ${
              income.incomeRationCard?.url
                ? `<a href="${appSafe(income.incomeRationCard.url)}"
                     target="_blank">
                     📂 જુઓ
                   </a>`
                : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            💡 લાઈટ બિલ:
            ${
              income.incomeLightBill?.url
                ? '<a href="' + appSafe(income.incomeLightBill.url) + '" target="_blank">📂 જુવો</a>'
: "ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            📑 આવકનું ફોર્મ:
            ${
              income.incomeForm?.url
                ? '<a href="' + appSafe(income.incomeForm.url) + '" target="_blank">📄 જુવો</a>'
: "ઉપલબ્ધ નથી"
            }
          </p>
        `;
      }


      if (service === "complaint") {

        const complaint =
          data.complaintData ||
          data.complaint ||
          {};

        extraHtml = `
          <p>
            <b>ફરિયાદ:</b>
            ${appSafe(
              complaint.complaintText ||
              complaint.description ||
              complaint.message ||
              data.message ||
              "-"
            )}
          </p>

          <p>
            <b>સરનામું:</b>
            ${appSafe(
              complaint.address ||
              data.address ||
              "-"
            )}
          </p>
        `;
      }

/* CARD */

html += `
  <div
    class="admin-item"
    style="
      background:#fff;
      padding:16px;
      margin-bottom:16px;
      border-radius:14px;
      box-shadow:0 2px 10px rgba(0,0,0,.08);
      border:1px solid #eee;
    "
  >

    <!-- HEADER -->
    <div
      style="
        font-size:18px;
        font-weight:700;
        color:#1769d1;
        margin-bottom:14px;
        padding-bottom:10px;
        border-bottom:1px solid #eee;
      "
    >
      ${icon} ${title}
    </div>


    <!-- BASIC INFORMATION -->
    <div
      style="
        display:grid;
        grid-template-columns:1fr;
        gap:9px;
      "
    >

      <div>
        <b>અરજી નંબર:</b>
        <span>
          ${appSafe(applicationNo)}
        </span>
      </div>

      <div>
        <b>અરજદારનું નામ:</b>
        <span>
          ${appSafe(name)}
        </span>
      </div>

      <div>
        <b>મોબાઇલ:</b>
        <span>
          ${appSafe(mobile)}
        </span>
      </div>

      ${extraHtml}

      <div>
        <b>સ્થિતિ:</b>
        ${statusText}
      </div>

      ${
        data.rejectionReason
          ? `
            <div
              style="
                color:red;
                background:#fff1f1;
                padding:8px;
                border-radius:8px;
              "
            >
              <b>Reject કારણ:</b>
              ${appSafe(data.rejectionReason)}
            </div>
          `
          : ""
      }

    </div>

<!-- ACTION BUTTONS -->
<div
  style="
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:8px;
    margin-top:16px;
  "
>

  <!-- VIEW -->
  <button
    type="button"
    data-app-action="view"
data-id="${encodeURIComponent(docSnap.id)}"
data-app-print="${encodeURIComponent(docSnap.id)}"
    style="
      width:100%;
      padding:11px 8px;
      border:0;
      border-radius:8px;
      background:#1769d1;
      color:white;
      font-weight:600;
    "
  >
    👁️ View
  </button>


  <!-- APPROVE -->
  ${
    status !== "Approved"
      ? `
        <button
          type="button"
          data-app-action="approve"
          data-id="${encodeURIComponent(docSnap.id)}"
          data-service="${encodeURIComponent(service)}"
          data-list-id="${encodeURIComponent(listId)}"
          data-search-id="${encodeURIComponent(searchId)}"
          style="
            width:100%;
            padding:11px 8px;
            border:0;
            border-radius:8px;
            background:#198754;
            color:white;
            font-weight:600;
          "
        >
          ✅ Approve
        </button>
      `
      : ""
  }


  <!-- REJECT -->
  ${
    status !== "Rejected"
      ? `
        <button
          type="button"
          data-app-action="reject"
          data-id="${encodeURIComponent(docSnap.id)}"
          data-service="${encodeURIComponent(service)}"
          data-list-id="${encodeURIComponent(listId)}"
          data-search-id="${encodeURIComponent(searchId)}"
          style="
            width:100%;
            padding:11px 8px;
            border:0;
            border-radius:8px;
            background:#dc3545;
            color:white;
            font-weight:600;
          "
        >
          ❌ Reject
        </button>
      `
      : ""
  }


  <!-- DELETE -->
  <button
    type="button"
    data-app-action="delete"
    data-id="${encodeURIComponent(docSnap.id)}"
    data-service="${encodeURIComponent(service)}"
    data-list-id="${encodeURIComponent(listId)}"
    data-search-id="${encodeURIComponent(searchId)}"
    style="
      width:100%;
      padding:11px 8px;
      border:0;
      border-radius:8px;
      background:#6c757d;
      color:white;
      font-weight:600;
    "
  >
    🗑️ Delete
  </button>

</div>

  </div>
`;

});
      
    if (!html) {

      html = `
        <p
          style="
            text-align:center;
            padding:20px;
          "
        >
          📭 હાલમાં કોઈ અરજી નથી.
        </p>
      `;
    }


    list.innerHTML =
      html;

  } catch (error) {

    console.error(
      "APPLICATION LOAD ERROR:",
      error
    );

    list.innerHTML = `
      <p style="color:red">
        ❌ અરજી લોડ કરવામાં ભૂલ:
        ${appSafe(error.message)}
      </p>
    `;
  }
}


/* =========================================================
   BIRTH
========================================================= */

async function loadBirthApplicationsFixed() {

  await loadServiceApplications(
    "birth",
    "birthApplicationsList",
    "searchBirthApplications",
    "જન્મ પ્રમાણપત્ર અરજી",
    "🟢"
  );

}


/* =========================================================
   DEATH
========================================================= */

async function loadDeathApplicationsFixed() {

  await loadServiceApplications(
    "death",
    "deathApplicationsList",
    "searchDeathApplications",
    "મૃત્યુ પ્રમાણપત્ર અરજી",
    "⚰️"
  );

}


/* =========================================================
   INCOME
========================================================= */

async function loadIncomeApplicationsFixed() {

  await loadServiceApplications(
    "income",
    "incomeApplicationsList",
    "searchIncomeApplications",
    "આવક પ્રમાણપત્ર અરજી",
    "💰"
  );

}


/* =========================================================
   COMPLAINT
========================================================= */

async function loadComplaintApplicationsFixed() {

  await loadServiceApplications(
    "complaint",
    "complaintApplicationsList",
    "searchComplaintApplications",
    "ફરિયાદ અરજી",
    "📝"
  );

}


/* =========================================================
   VIEW
========================================================= */

async function applicationViewFixed(id) {

  try {

    const snap =
      await getDoc(
        doc(db, "applications", id)
      );

    if (!snap.exists()) {

      alert(
        "❌ અરજી મળી નથી."
      );

      return;
    }

    const data =
      snap.data();

    alert(
`📄 અરજી વિગતો

અરજી નંબર:
${data.applicationNo || "-"}

નામ:
${data.name || "-"}

મોબાઇલ:
${data.mobile || "-"}

સેવા:
${data.service || "-"}

સ્થિતિ:
${data.status || "Pending"}`
    );

  } catch (error) {

    console.error(error);

    alert(
      "❌ અરજી જોવામાં ભૂલ:\n" +
      error.message
    );
  }
}

window.applicationViewFixed =
  applicationViewFixed;


/* =========================================================
   APPROVE
========================================================= */

async function applicationApproveFixed(
  id,
  service,
  listId,
  searchId
) {

  const ok =
    confirm(
      "શું તમે આ અરજી Approve કરવા માંગો છો?"
    );

  if (!ok) return;

  try {

    await updateDoc(
      doc(db, "applications", id),
      {
        status: "Approved",
        updatedAt:
          serverTimestamp()
      }
    );


    alert(
      "✅ અરજી Approved થઈ ગઈ."
    );


    await reloadApplicationSection(
      service,
      listId,
      searchId
    );

  } catch (error) {

    console.error(error);

    alert(
      "❌ Approve કરવામાં ભૂલ:\n" +
      error.message
    );
  }
}

window.applicationApproveFixed =
  applicationApproveFixed;


/* =========================================================
   REJECT
========================================================= */

async function applicationRejectFixed(
  id,
  service,
  listId,
  searchId
) {

  const reason =
    prompt(
      "❌ Reject કરવાનું કારણ લખો:"
    );

  if (
    reason === null ||
    !reason.trim()
  ) {
    return;
  }


  try {

    await updateDoc(
      doc(db, "applications", id),
      {
        status: "Rejected",
        rejectionReason:
          reason.trim(),
        updatedAt:
          serverTimestamp()
      }
    );


    alert(
      "❌ અરજી Reject થઈ ગઈ."
    );


    await reloadApplicationSection(
      service,
      listId,
      searchId
    );

  } catch (error) {

    console.error(error);

    alert(
      "❌ Reject કરવામાં ભૂલ:\n" +
      error.message
    );
  }
}

window.applicationRejectFixed =
  applicationRejectFixed;


/* =========================================================
   DELETE
========================================================= */

async function applicationDeleteFixed(
  id,
  service,
  listId,
  searchId
) {

  const ok =
    confirm(
      "⚠️ શું તમે આ અરજી Delete કરવા માંગો છો?"
    );

  if (!ok) return;


  try {

    await deleteDoc(
      doc(db, "applications", id)
    );


    alert(
      "🗑️ અરજી Delete થઈ ગઈ."
    );


    await reloadApplicationSection(
      service,
      listId,
      searchId
    );

  } catch (error) {

    console.error(error);

    alert(
      "❌ Delete કરવામાં ભૂલ:\n" +
      error.message
    );
  }
}

window.applicationDeleteFixed =
  applicationDeleteFixed;


/* =========================================================
   RELOAD
========================================================= */

async function reloadApplicationSection(
  service,
  listId,
  searchId
) {

  if (service === "birth") {

    await loadBirthApplicationsFixed();

  }

  else if (service === "death") {

    await loadDeathApplicationsFixed();

  }

  else if (service === "income") {

    await loadIncomeApplicationsFixed();

  }

  else if (service === "complaint") {

    await loadComplaintApplicationsFixed();

  }

}


/* =========================================================
   SEARCH
========================================================= */

document
  .getElementById(
    "searchBirthApplications"
  )
  ?.addEventListener(
    "input",
    loadBirthApplicationsFixed
  );


document
  .getElementById(
    "searchDeathApplications"
  )
  ?.addEventListener(
    "input",
    loadDeathApplicationsFixed
  );


document
  .getElementById(
    "searchIncomeApplications"
  )
  ?.addEventListener(
    "input",
    loadIncomeApplicationsFixed
  );


document
  .getElementById(
    "searchComplaintApplications"
  )
  ?.addEventListener(
    "input",
    loadComplaintApplicationsFixed
  );


/* =========================================================
   INITIAL LOAD
========================================================= */

loadBirthApplicationsFixed();
loadDeathApplicationsFixed();
loadIncomeApplicationsFixed();
loadComplaintApplicationsFixed();

console.log(
  "✅ Application sections loaded successfully"
);

/* =========================================================
   APPLICATION BUTTON CLICK HANDLER
========================================================= */

document.addEventListener("click", async function (event) {

  const button =
    event.target.closest("[data-app-action]");

  if (!button) return;

  const action =
    button.dataset.appAction || "";

  const id =
    decodeURIComponent(
      button.dataset.id || ""
    );

  const service =
    decodeURIComponent(
      button.dataset.service || ""
    );

  const listId =
    decodeURIComponent(
      button.dataset.listId || ""
    );

  const searchId =
    decodeURIComponent(
      button.dataset.searchId || ""
    );

  console.log("APPLICATION BUTTON:", {
    action,
    id,
    service,
    listId,
    searchId
  });

  if (!id) {
    console.error("❌ Application ID missing");
    return;
  }

  try {

    /* VIEW */
    if (action === "view") {

      await applicationViewFixed(id);

      return;
    }


    /* APPROVE */
    if (action === "approve") {

      await applicationApproveFixed(
        id,
        service,
        listId,
        searchId
      );

      return;
    }


    /* REJECT */
    if (action === "reject") {

      await applicationRejectFixed(
        id,
        service,
        listId,
        searchId
      );

      return;
    }


    /* DELETE */
    if (action === "delete") {

      await applicationDeleteFixed(
        id,
        service,
        listId,
        searchId
      );

      return;
    }

  } catch (error) {

    console.error(
      "❌ APPLICATION BUTTON ERROR:",
      error
    );

    alert(
      "❌ કાર્યવાહી કરવામાં ભૂલ:\n" +
      error.message
    );

  }

});

/* =========================================================
   TAX PAYMENT - REJECT FIX
   ADD ONLY AT THE VERY END OF admin.js
========================================================= */

async function rejectTaxPaymentFixed(paymentId) {

  const ok = confirm(
    "⚠️ શું આ Tax Payment Reject કરવી છે?"
  );

  if (!ok) return;

  try {

    await updateDoc(
      doc(db, "taxPayments", paymentId),
      {
        status: "Rejected",
        rejectedAt: serverTimestamp()
      }
    );

    alert(
      "❌ Tax Payment Rejected થઈ ગઈ."
    );

    if (typeof loadTaxPayments === "function") {
      await loadTaxPayments();
    }

    if (typeof refreshDashboard === "function") {
      await refreshDashboard();
    }

  } catch (error) {

    console.error(
      "Tax Payment Reject Error:",
      error
    );

    alert(
      "❌ Tax Payment Reject કરવામાં ભૂલ:\n" +
      error.message
    );
  }
}

window.rejectTaxPaymentFixed =
  rejectTaxPaymentFixed;

/* =========================================================
   NEW TAX PAYMENT NOTIFICATION
========================================================= */

async function checkNewTaxPayments() {

  try {

    const snapshot = await getDocs(
      query(
        collection(db, "taxPayments"),
        where("status", "==", "Pending")
      )
    );

    const notification =
    document.getElementById("paymentNotification");

    if (!notification) return;

    const count = snapshot.size;

    if (count > 0) {

      notification.style.display = "block";

      notification.innerHTML = `
        🔔 <b>${count}</b> Tax Payment
        Pending છે.
        <br>
        <span style="font-size:14px;">
          Verification sectionમાં જઈને તપાસો.
        </span>
      `;

    } else {

      notification.style.display = "none";

    }

  } catch (error) {

    console.error(
      "Payment Notification Error:",
      error
    );

  }

}

window.checkNewTaxPayments =
  checkNewTaxPayments;


/* Initial check */

checkNewTaxPayments();

/* =========================================================
   ADVANCED DASHBOARD COUNTERS
========================================================= */

async function loadAdvancedDashboard() {

  try {

    const snapshot = await getDocs(
      collection(db, "taxPayments")
    );

    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalAmount = 0;
    let approvedAmount = 0;

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const amount =
        Number(
          data.amount ||
          data.paymentAmount ||
          data.taxAmount ||
          0
        );

      totalAmount += amount;

      if (data.status === "Pending") {
        pending++;
      }

      if (data.status === "Approved") {
        approved++;
        approvedAmount += amount;
      }

      if (data.status === "Rejected") {
        rejected++;
      }

    });

    /* Payment counts */

    const pendingEl =
      document.getElementById("pendingPaymentCount");

    const approvedEl =
      document.getElementById("approvedPaymentCount");

    const rejectedEl =
      document.getElementById("rejectedPaymentCount");

    const totalAmountEl =
      document.getElementById("totalTaxPaymentAmount");

    const approvedAmountEl =
      document.getElementById("approvedTaxAmount");

    if (pendingEl)
      pendingEl.textContent = pending;

    if (approvedEl)
      approvedEl.textContent = approved;

    if (rejectedEl)
      rejectedEl.textContent = rejected;

    if (totalAmountEl)
      totalAmountEl.textContent =
        "₹ " + totalAmount.toLocaleString("en-IN");

    if (approvedAmountEl)
      approvedAmountEl.textContent =
        "₹ " + approvedAmount.toLocaleString("en-IN");


    console.log(
      "📊 Advanced Dashboard:",
      {
        pending,
        approved,
        rejected,
        totalAmount,
        approvedAmount
      }
    );

  } catch (error) {

    console.error(
      "Advanced Dashboard Error:",
      error
    );

  }

}

window.loadAdvancedDashboard =
  loadAdvancedDashboard;


/* Initial Load */

loadAdvancedDashboard();