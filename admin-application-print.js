import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


/* =========================================================
   APPLICATION VIEW + PROFESSIONAL PRINT / PDF
   Birth / Death / Income / Complaint
========================================================= */


/* =========================================================
   SAFE TEXT
========================================================= */

function safe(value) {

  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

  if (!value) return "-";

  try {

    if (
      typeof value === "object" &&
      value?.toDate
    ) {

      return value
        .toDate()
        .toLocaleDateString("gu-IN");

    }

    const d = new Date(value);

    if (!Number.isNaN(d.getTime())) {

      return d.toLocaleDateString("gu-IN");

    }

    return safe(value);

  } catch {

    return safe(value);

  }

}


/* =========================================================
   SERVICE NAME
========================================================= */

function serviceName(service) {

  const names = {

    birth:
      "જન્મ પ્રમાણપત્ર અરજી",

    death:
      "મૃત્યુ પ્રમાણપત્ર અરજી",

    income:
      "આવક પ્રમાણપત્ર અરજી",

    complaint:
      "ફરિયાદ અરજી"

  };

  return (
    names[service] ||
    service ||
    "ઓનલાઇન અરજી"
  );

}


/* =========================================================
   FIELD
========================================================= */

function field(label, value) {

  return `

    <div class="field">

      <div class="field-label">
        ${safe(label)}
      </div>

      <div class="field-value">
        ${safe(value)}
      </div>

    </div>

  `;

}


/* =========================================================
   DOCUMENT
========================================================= */

function documentItem(file, index) {

  if (!file) return "";

  const name =
    file.name ||
    file.fileName ||
    `દસ્તાવેજ ${index + 1}`;

  const url =
    file.url || "";

  return `

    <div class="document-item">

      <span>
        📎 ${safe(name)}
      </span>

      ${
        url
          ? `
            <a
              href="${safe(url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              📂 જુઓ
            </a>
          `
          : `
            <span>લિંક ઉપલબ્ધ નથી</span>
          `
      }

    </div>

  `;

}


/* =========================================================
   APPLICATION DETAILS
========================================================= */

function applicationDetails(data) {

  const service =
    data.service || "";

  let html = "";


  /* =======================================================
     COMMON DETAILS
  ======================================================= */

  html += `

    <div class="section-title">
      📋 અરજીની મુખ્ય વિગતો
    </div>

    <div class="fields">

      ${field(
        "અરજી નંબર",
        data.applicationNo
      )}

      ${field(
        "અરજી તારીખ",
        formatDate(
          data.createdAt ||
          data.applicationDate ||
          data.date
        )
      )}

      ${field(
        "અરજદારનું નામ",
        data.name ||
        data.incomeData?.incomeApplicantName ||
        data.complaintData?.complaintApplicantName
      )}

      ${field(
        "મોબાઇલ નંબર",
        data.mobile
      )}

      ${field(
        "સેવા",
        serviceName(service)
      )}

      ${field(
        "સ્થિતિ",
        data.status || "Pending"
      )}

    </div>

  `;


  /* =======================================================
     BIRTH APPLICATION
  ======================================================= */

  if (service === "birth") {

    const birth =
      data.birthData || {};

    html += `

      <div class="section-title">
        👶 જન્મની સંપૂર્ણ માહિતી
      </div>

      <div class="fields">

        ${field(
          "બાળકનું નામ",
          birth.birthName
        )}

        ${field(
          "જાતિ",
          birth.birthSex
        )}

        ${field(
          "બાળકનો આધાર",
          birth.birthAadhaar
        )}

        ${field(
          "જન્મ તારીખ",
          birth.birthDate
        )}

        ${field(
          "જન્મ સ્થળ",
          birth.birthPlace
        )}

        ${field(
          "માતાનું નામ",
          birth.birthMother
        )}

        ${field(
          "પિતાનું નામ",
          birth.birthFather
        )}

        ${field(
          "માતાનો આધાર",
          birth.birthMotherAadhaar
        )}

        ${field(
          "પિતાનો આધાર",
          birth.birthFatherAadhaar
        )}

        ${field(
          "જન્મ સમયે સરનામું",
          birth.birthAddressAtBirth
        )}

        ${field(
          "કાયમી સરનામું",
          birth.birthPermanentAddress
        )}

        ${field(
          "નોંધણી નંબર",
          birth.birthRegistrationNo
        )}

        ${field(
          "નોંધણી તારીખ",
          birth.birthRegistrationDate
        )}

      </div>

    `;

  }


  /* =======================================================
     DEATH APPLICATION
  ======================================================= */

  if (service === "death") {

    const death =
      data.deathData || {};

    html += `

      <div class="section-title">
        ⚰️ મૃત્યુની સંપૂર્ણ માહિતી
      </div>

      <div class="fields">

        ${field(
          "મરનારનું નામ",
          death.deathName
        )}

        ${field(
          "જાતિ",
          death.deathSex
        )}

        ${field(
          "આધાર",
          death.deathAadhaar
        )}

        ${field(
          "ઉંમર",
          death.deathAge
        )}

        ${field(
          "મરણ તારીખ",
          death.deathDate
        )}

        ${field(
          "મરણ સ્થળ",
          death.deathPlace
        )}

        ${field(
          "પતિ / પત્નીનું નામ",
          death.deathSpouse
        )}

        ${field(
          "પતિ / પત્નીનો આધાર",
          death.deathSpouseAadhaar
        )}

        ${field(
          "માતાનું નામ",
          death.deathMother
        )}

        ${field(
          "માતાનો આધાર",
          death.deathMotherAadhaar
        )}

        ${field(
          "પિતાનું નામ",
          death.deathFather
        )}

        ${field(
          "પિતાનો આધાર",
          death.deathFatherAadhaar
        )}

        ${field(
          "મરણ સમયે સરનામું",
          death.deathAddressAtDeath
        )}

        ${field(
          "કાયમી સરનામું",
          death.deathPermanentAddress
        )}

        ${field(
          "નોંધણી નંબર",
          death.deathRegistrationNo
        )}

        ${field(
          "નોંધણી તારીખ",
          death.deathRegistrationDate
        )}

      </div>

    `;

  }


  /* =======================================================
     INCOME APPLICATION
  ======================================================= */

  if (service === "income") {

    const income =
      data.incomeData || {};

    html += `

      <div class="section-title">
        💰 આવક પ્રમાણપત્રની સંપૂર્ણ માહિતી
      </div>

      <div class="fields">

        ${field(
          "અરજદારનું નામ",
          income.incomeApplicantName ||
          data.name
        )}

        ${field(
          "સરનામું",
          income.incomeAddress
        )}

      </div>

      <div class="section-title">
        📎 જરૂરી દસ્તાવેજો
      </div>

      <div class="documents">

        ${documentItem(
          income.incomePhoto,
          0
        )}

        ${documentItem(
          income.incomeAadhaar,
          1
        )}

        ${documentItem(
          income.incomeRationCard,
          2
        )}

        ${documentItem(
          income.incomeLightBill,
          3
        )}

        ${documentItem(
          income.incomeForm,
          4
        )}

      </div>

    `;

  }


  /* =======================================================
     COMPLAINT APPLICATION
  ======================================================= */

  if (service === "complaint") {

    const complaint =
      data.complaintData || {};

    html += `

      <div class="section-title">
        📝 ફરિયાદની સંપૂર્ણ માહિતી
      </div>

      <div class="fields">

        ${field(
          "અરજદારનું નામ",
          complaint.complaintApplicantName ||
          data.name
        )}

        ${field(
          "મોબાઇલ નંબર",
          data.mobile
        )}

        ${field(
          "સરનામું",
          complaint.complaintAddress
        )}

        ${field(
          "ફરિયાદનો વિષય",
          complaint.complaintSubject
        )}

        ${field(
          "ફરિયાદની વિગત",
          complaint.complaintDetails
        )}

      </div>

      <div class="section-title">
        📎 ફરિયાદ સંબંધિત દસ્તાવેજો
      </div>

      <div class="documents">

        ${
          Array.isArray(
            complaint.complaintDocuments
          ) &&
          complaint.complaintDocuments.length

          ?

          complaint.complaintDocuments
            .map(
              (file, index) =>
                documentItem(
                  file,
                  index
                )
            )
            .join("")

          :

          `
            <div>
              કોઈ દસ્તાવેજ અપલોડ કરેલ નથી.
            </div>
          `
        }

      </div>

    `;

  }


  /* =======================================================
     GENERAL DOCUMENTS
  ======================================================= */

  if (
    Array.isArray(data.documents) &&
    data.documents.length
  ) {

    html += `

      <div class="section-title">
        📎 જોડાયેલા દસ્તાવેજો
      </div>

      <div class="documents">

        ${data.documents
          .map(
            (file, index) =>
              documentItem(
                file,
                index
              )
          )
          .join("")}

      </div>

    `;

  }


  /* =======================================================
     REJECTION REASON
  ======================================================= */

  if (data.rejectionReason) {

    html += `

      <div class="reject-box">

        <b>
          ❌ Reject કરવાનું કારણ:
        </b>

        <br><br>

        ${safe(
          data.rejectionReason
        )}

      </div>

    `;

  }


  return html;

}


/* =========================================================
   GET WEBSITE SETTINGS
========================================================= */

async function getWebsiteSettings() {

  try {

    const snap =
      await getDoc(
        doc(
          db,
          "website",
          "settings"
        )
      );

    if (!snap.exists()) {

      return {};

    }

    return snap.data();

  } catch (error) {

    console.error(
      "Website Settings Error:",
      error
    );

    return {};

  }

}


/* =========================================================
   PRINT APPLICATION
========================================================= */

async function printApplication(id) {

  try {

    const snap =
      await getDoc(
        doc(
          db,
          "applications",
          id
        )
      );


    if (!snap.exists()) {

      alert(
        "❌ અરજી મળી નથી."
      );

      return;

    }


    const data = {

      id: snap.id,

      ...snap.data()

    };


    const settings =
      await getWebsiteSettings();


    const logo =
      settings.logo || "";

    const stamp =
      settings.stampImage || "";

    const signature =
      settings.sarpanchSignature || "";

    const sarpanchName =
      settings.sarpanchName ||
      "";


    const win =
      window.open(
        "",
        "_blank",
        "width=1000,height=900"
      );


    if (!win) {

      alert(
        "⚠️ Print window ખુલતી નથી.\n" +
        "Browser popup allow કરો."
      );

      return;

    }


    win.document.open();


    win.document.write(`

<!DOCTYPE html>

<html lang="gu">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>


<title>

${safe(
  serviceName(
    data.service
  )
)}

</title>


<style>

* {
  box-sizing: border-box;
}


body {

  margin: 0;

  padding: 20px;

  background: #f1f3f5;

  color: #222;

  font-family:
    "Noto Sans Gujarati",
    "Nirmala UI",
    Arial,
    sans-serif;

}


.toolbar {

  max-width: 900px;

  margin:
    0 auto 15px;

  display: flex;

  gap: 10px;

}


.toolbar button {

  flex: 1;

  border: 0;

  border-radius: 8px;

  padding: 12px;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;

}


.print-btn {

  background: #1769d1;

  color: white;

}


.close-btn {

  background: #555;

  color: white;

}


.paper {

  max-width: 900px;

  margin: auto;

  background: white;

  padding: 30px;

  border: 1px solid #ddd;

}


.header {

  display: flex;

  align-items: center;

  gap: 18px;

  border-bottom:
    3px solid #1769d1;

  padding-bottom: 16px;

}


.logo {

  width: 75px;

  height: 75px;

  object-fit: contain;

}


.header-text {

  flex: 1;

  text-align: center;

}


.header-text h1 {

  margin: 0;

  font-size: 25px;

}


.header-text h2 {

  margin:
    7px 0;

  font-size: 19px;

}


.header-text p {

  margin: 0;

  font-size: 13px;

}


.section-title {

  margin-top: 20px;

  margin-bottom: 9px;

  padding:
    9px 12px;

  background: #eef5ff;

  border-left:
    5px solid #1769d1;

  font-weight: 700;

  font-size: 16px;

}


.fields {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  border:
    1px solid #ddd;

}


.field {

  display: grid;

  grid-template-columns:
    43% 57%;

  min-height: 42px;

  border-bottom:
    1px solid #ddd;

}


.field:nth-child(odd) {

  border-right:
    1px solid #ddd;

}


.field-label {

  padding: 8px;

  background: #f7f7f7;

  font-weight: 700;

  font-size: 13px;

}


.field-value {

  padding: 8px;

  word-break: break-word;

  font-size: 13px;

}


.documents {

  border:
    1px solid #ddd;

  padding: 8px;

}


.document-item {

  display: flex;

  justify-content:
    space-between;

  gap: 15px;

  padding: 9px;

  border-bottom:
    1px solid #eee;

}


.document-item:last-child {

  border-bottom: 0;

}


.document-item a {

  font-weight: 700;

  text-decoration: none;

}


.reject-box {

  margin-top: 18px;

  padding: 12px;

  border:
    1px solid #dc3545;

  background: #fff2f2;

  border-radius: 7px;

}


.signatures {

  margin-top: 65px;

  display: grid;

  grid-template-columns:
    1fr 1fr 1fr;

  gap: 25px;

  align-items: end;

  text-align: center;

}


.signature-box {

  min-height: 145px;

}


.stamp-image {

  width: 105px;

  height: 105px;

  object-fit: contain;

  display: block;

  margin: 0 auto 5px;

}


.signature-image {

  width: 150px;

  height: 75px;

  object-fit: contain;

  display: block;

  margin: 0 auto 5px;

}


.signature-space {

  height: 105px;

}


.signature-line {

  border-top:
    1px solid #444;

  padding-top: 7px;

  font-weight: 700;

}


.office-name {

  margin-top: 4px;

  font-size: 13px;

}


.footer-note {

  margin-top: 30px;

  padding-top: 10px;

  border-top:
    1px solid #ddd;

  text-align: center;

  font-size: 11px;

  color: #666;

}


@media(max-width:650px) {

  body {

    padding: 8px;

  }


  .paper {

    padding: 15px;

  }


  .header {

    flex-direction:
      column;

  }


  .fields {

    grid-template-columns:
      1fr;

  }


  .field:nth-child(odd) {

    border-right: 0;

  }


  .signatures {

    grid-template-columns:
      1fr;

  }

}


@media print {

  html,
  body {
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 0;
    background: white;
  }

  .toolbar {
    display: none !important;
  }

  .paper {
    width: 100%;
    max-width: none;
    min-height: auto;
    margin: 0;
    padding: 5mm 7mm;
    border: 0;
  }

  .header {
    padding-bottom: 8px;
  }

  .header-text h1 {
    font-size: 21px;
  }

  .header-text h2 {
    font-size: 16px;
    margin: 3px 0;
  }

  .section-title {
    margin-top: 10px;
    margin-bottom: 5px;
    padding: 6px 9px;
    font-size: 14px;
  }

  .field {
    min-height: 30px;
  }

  .field-label,
  .field-value {
    padding: 5px 6px;
    font-size: 11px;
  }

  .signatures {
    margin-top: 25px;
    gap: 15px;
  }

  .signature-box {
    min-height: 100px;
  }

  .stamp-image {
    width: 75px;
    height: 75px;
  }

  .signature-image {
    width: 110px;
    height: 55px;
  }

  .signature-space {
    height: 65px;
  }

  .signature-line {
    padding-top: 4px;
    font-size: 11px;
  }

  .office-name {
    font-size: 10px;
  }

  .footer-note {
    margin-top: 10px;
    padding-top: 5px;
    font-size: 8px;
  }

  @page {
    size: A4 portrait;
    margin: 5mm;
  }
}

</style>

</head>


<body>


<div class="toolbar">

  <button
    class="print-btn"
    onclick="window.print()"
  >
    🖨️ Print / Save PDF
  </button>


  <button
    class="close-btn"
    onclick="window.close()"
  >
    ✖️ બંધ કરો
  </button>

</div>


<div class="paper">


  <div class="header">


    ${
      logo
        ?

        `
          <img
            class="logo"
            src="${safe(logo)}"
          >
        `

        :

        ""
    }


    <div class="header-text">


      <h1>

        ${safe(
          settings.websiteName ||
          "વાસણા ચૌધરી ગ્રામ પંચાયત"
        )}

      </h1>


      <h2>

        ${safe(
          serviceName(
            data.service
          )
        )}

      </h2>


      <p>

        તા. દહેગામ |
        જી. ગાંધીનગર |
        ગુજરાત

      </p>


    </div>


  </div>


  ${applicationDetails(data)}


  <!-- SIGNATURE AREA -->

  <div class="signatures">


    <!-- SEAL -->

    <div class="signature-box">

      ${
        stamp

          ?

          `
            <img
              src="${safe(stamp)}"
              class="stamp-image"
            >
          `

          :

          `
            <div
              class="signature-space"
            ></div>
          `
      }


      <div class="signature-line">

        પંચાયત સીલ

      </div>


      <div class="office-name">

        વાસણા ચૌધરી ગ્રામ પંચાયત

      </div>

    </div>


    <!-- TALATI -->

    <div class="signature-box">

      <div
        class="signature-space"
      ></div>


      <div class="signature-line">

        તલાટીશ્રી

      </div>


      <div class="office-name">

        વાસણા ચૌધરી ગ્રામ પંચાયત

      </div>

    </div>


    <!-- SARPANCH -->

    <div class="signature-box">


      ${
        signature

          ?

          `
            <img
              src="${safe(signature)}"
              class="signature-image"
            >
          `

          :

          `
            <div
              class="signature-space"
            ></div>
          `
      }


      <div class="signature-line">

        સરપંચશ્રી

      </div>


      <div class="office-name">

        ${
          safe(
            sarpanchName ||
            "સરપંચશ્રી"
          )
        }

      </div>


      <div class="office-name">

        વાસણા ચૌધરી ગ્રામ પંચાયત

      </div>

    </div>


  </div>


  <div class="footer-note">

    આ દસ્તાવેજ ગ્રામ પંચાયતના
    ઓનલાઈન અરજી રેકોર્ડ પરથી તૈયાર
    કરવામાં આવ્યો છે.

  </div>


</div>


</body>

</html>

    `);


    win.document.close();

    win.focus();

  } catch (error) {

    console.error(
      "Application Print Error:",
      error
    );

    alert(
      "❌ Print કરવામાં ભૂલ:\n" +
      error.message
    );

  }

}


/* =========================================================
   VIEW APPLICATION
========================================================= */

async function viewApplication(id) {

  try {

    const snap =
      await getDoc(
        doc(
          db,
          "applications",
          id
        )
      );


    if (!snap.exists()) {

      alert(
        "❌ અરજી મળી નથી."
      );

      return;

    }


    const data = {

      id: snap.id,

      ...snap.data()

    };


    const old =
      document.getElementById(
        "professionalApplicationView"
      );


    if (old) {

      old.remove();

    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "professionalApplicationView";


    overlay.innerHTML = `

      <div class="application-view-backdrop">


        <div class="application-view-box">


          <div class="application-view-header">

            <b>
              📄 સંપૂર્ણ અરજી વિગતો
            </b>


            <button
  id="applicationViewClose"
>
  ✖
</button>

          </div>


          <div class="application-view-body">

            ${applicationDetails(data)}

          </div>


          <div class="application-view-footer">


            <button
              id="applicationViewPrint"
            >
              🖨️ Print / PDF
            </button>


            <button
              id="applicationViewClose2"
            >
              બંધ કરો
            </button>


          </div>


        </div>


      </div>

    `;


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "professionalApplicationViewStyle";


    style.textContent = `

      #professionalApplicationView {

        position: fixed;

        inset: 0;

        z-index: 999999;

      }


      .application-view-backdrop {

        position: absolute;

        inset: 0;

        background:
          rgba(0,0,0,.68);

        overflow-y: auto;

        padding: 15px;

      }


      .application-view-box {

        max-width: 900px;

        margin:
          20px auto;

        background: white;

        border-radius: 12px;

        overflow: hidden;

      }


      .application-view-header {

        display: flex;

        justify-content:
          space-between;

        align-items: center;

        padding: 15px;

        background: #1769d1;

        color: white;

        font-size: 18px;

      }


      .application-view-header button {

        background: transparent;

        color: white;

        border: 0;

        font-size: 20px;

        cursor: pointer;

      }


      .application-view-body {

        padding: 15px;

      }


      .application-view-body
      .fields {

        display: grid;

        grid-template-columns:
          1fr 1fr;

        border:
          1px solid #ddd;

      }


      .application-view-body
      .field {

        display: grid;

        grid-template-columns:
          43% 57%;

        min-height: 42px;

        border-bottom:
          1px solid #ddd;

      }


      .application-view-body
      .field:nth-child(odd) {

        border-right:
          1px solid #ddd;

      }


      .application-view-body
      .field-label {

        padding: 8px;

        background: #f7f7f7;

        font-weight: 700;

      }


      .application-view-body
      .field-value {

        padding: 8px;

        word-break: break-word;

      }


      .application-view-body
      .section-title {

        margin-top: 20px;

        margin-bottom: 9px;

        padding: 9px;

        background: #eef5ff;

        border-left:
          5px solid #1769d1;

        font-weight: 700;

      }


      .application-view-body
      .documents {

        border:
          1px solid #ddd;

        padding: 8px;

      }


      .application-view-body
      .document-item {

        display: flex;

        justify-content:
          space-between;

        padding: 9px;

        border-bottom:
          1px solid #eee;

      }


      .application-view-footer {

        display: flex;

        gap: 10px;

        padding: 15px;

        border-top:
          1px solid #ddd;

      }


      .application-view-footer
      button {

        flex: 1;

        padding: 12px;

        border: 0;

        border-radius: 7px;

        font-weight: 700;

      }


      #applicationViewPrint {

        background: #198754;

        color: white;

      }


      #applicationViewClose2 {

        background: #555;

        color: white;

      }


      @media(max-width:650px) {

        .application-view-body
        .fields {

          grid-template-columns:
            1fr;

        }


        .application-view-body
        .field:nth-child(odd) {

          border-right: 0;

        }

      }

    `;


    if (
      !document.getElementById(
        "professionalApplicationViewStyle"
      )
    ) {

      document.head.appendChild(
        style
      );

    }


    document.body.appendChild(
      overlay
    );


    function closeView() {

      overlay.remove();

    }


    document
      .getElementById(
        "applicationViewClose"
      )
      ?.addEventListener(
        "click",
        closeView
      );


    document
      .getElementById(
        "applicationViewClose2"
      )
      ?.addEventListener(
        "click",
        closeView
      );


    document
      .getElementById(
        "applicationViewPrint"
      )
      ?.addEventListener(
        "click",
        () => {

          printApplication(id);

        }
      );


  } catch (error) {

    console.error(
      "Application View Error:",
      error
    );


    alert(
      "❌ અરજી જોવામાં ભૂલ:\n" +
      error.message
    );

  }

}


/* =========================================================
   IMPORTANT GLOBAL FUNCTIONS
========================================================= */

window.viewApplication =
  viewApplication;

window.printApplication =
  printApplication;


/* Compatibility */

window.applicationView =
  viewApplication;

window.applicationPrint =
  printApplication;


console.log(
  "✅ Professional Application Print System Loaded"
);"applicationViewClose"