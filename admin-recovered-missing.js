import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/*=========================================
  RECOVERED OLD CODE
  APPLICATION VIEW
=========================================*/

async function recoveredViewApplication(id){

  const docSnap =
    await getDoc(
      doc(
        db,
        "applications",
        id
      )
    );


  if(!docSnap.exists()){

    alert(
      "અરજી મળી નથી."
    );

    return;

  }


  const data =
    docSnap.data();


  const propertyNo =
    data.propertyData
      ? data.propertyData.propertyNo || "-"
      : "-";


  const applicantName =
    data.propertyData
      ? data.propertyData.applicantName ||
        data.name ||
        "-"
      : data.name || "-";


  const applicantMobile =
    data.propertyData
      ? data.propertyData.mobile ||
        data.mobile ||
        "-"
      : data.mobile || "-";


  alert(

`અરજી નંબર: ${
  data.applicationNo || "-"
}

નામ: ${applicantName}

મોબાઇલ: ${applicantMobile}

સેવા: ${
  data.service === "property"
    ? "મિલકત આકારણી"
    : data.service || "-"
}

મિલકત નંબર: ${propertyNo}

સ્થિતિ: ${
  data.status || "-"
}`

  );

}


window.recoveredViewApplication =
  recoveredViewApplication;

/*=========================================
  RECOVERED OLD CODE
  PRINT APPLICATION
=========================================*/

async function recoveredPrintApplication(id) {

  const docSnap =
    await getDoc(
      doc(
        db,
        "applications",
        id
      )
    );


  if (!docSnap.exists()) {

    alert(
      "અરજી મળી નથી."
    );

    return;

  }


  const data =
    docSnap.data();


  /* WEBSITE SETTINGS */

  const settingsSnap =
    await getDoc(
      doc(
        db,
        "website",
        "settings"
      )
    );


  const settings =
    settingsSnap.exists()
      ? settingsSnap.data()
      : {};


  /* PRINT WEBSITE NAME */

  const websiteName =
    document.getElementById(
      "printWebsiteName"
    );

  if (websiteName) {

    websiteName.innerText =
      settings.websiteName ||
      "ગ્રામ પંચાયત";

  }


  /* PRINT ADDRESS */

  const address =
    document.getElementById(
      "printAddress"
    );

  if (address) {

    address.innerText =
      settings.panchayatAddress ||
      "";

  }


  /* PRINT CONTACT */

  const contact =
    document.getElementById(
      "printContact"
    );

  if (contact) {

    contact.innerText =
      `મો. ${
        settings.panchayatMobile ||
        ""
      } | Email: ${
        settings.panchayatEmail ||
        ""
      }`;

  }


  /* APPLICATION NUMBER */

  const applicationNo =
    document.getElementById(
      "pApplicationNo"
    );

  if (applicationNo) {

    applicationNo.innerText =
      data.applicationNo ||
      "-";

  }


  /* NAME */

  const name =
    document.getElementById(
      "pName"
    );

  if (name) {

    name.innerText =
      data.name ||
      "-";

  }


  /* MOBILE */

  const mobile =
    document.getElementById(
      "pMobile"
    );

  if (mobile) {

    mobile.innerText =
      data.mobile ||
      "-";

  }


  /* SERVICE */

  const service =
    document.getElementById(
      "pService"
    );

  if (service) {

    service.innerText =
      data.service ||
      "-";

  }


  /* PROPERTY NUMBER */

  const propertyNo =
    document.getElementById(
      "pPropertyNo"
    );


  if (propertyNo) {

    propertyNo.innerText =
      data.propertyData
        ? data.propertyData.propertyNo ||
          "-"
        : "-";

  }


  /* STATUS */

  const status =
    document.getElementById(
      "pStatus"
    );


  if (status) {

    status.innerText =
      data.status ||
      "-";

  }


  /* LOGO */

  const logo =
    document.getElementById(
      "printLogo"
    );


  if (
    logo &&
    settings.logo
  ) {

    logo.src =
      settings.logo;

  }


  /* STAMP */

  const stamp =
    document.getElementById(
      "printStamp"
    );


  if (
    stamp &&
    settings.stampImage
  ) {

    stamp.src =
      settings.stampImage;

  }


  /* SIGNATURE */

  const signature =
    document.getElementById(
      "printSignature"
    );


  if (
    signature &&
    settings.sarpanchSignature
  ) {

    signature.src =
      settings.sarpanchSignature;

  }


  /* SARPANCH */

  const sarpanch =
    document.getElementById(
      "printSarpanch"
    );


  if (sarpanch) {

    sarpanch.innerText =
      settings.sarpanchName ||
      "";

  }


  /* SHOW PRINT SECTION */

  const printDiv =
    document.getElementById(
      "printSection"
    );


  if (!printDiv) {

    alert(
      "❌ Print Section મળી નથી."
    );

    return;

  }


  printDiv.style.display =
    "block";


  /* CREATE IMAGE */
  /* PRINT */

  try {

    window.print();

  } catch (printError) {

    console.error(
      "PRINT ERROR:",
      printError
    );

    alert(
      "❌ Print કરવામાં ભૂલ:\n" +
      printError.message
    );

  }


  /* HIDE PRINT SECTION AFTER PRINT */

  setTimeout(() => {

    printDiv.style.display =
      "none";

  }, 1000);

}

/*=========================================
  PROPERTY TAX EXCEL IMPORT
=========================================*/

document
  .getElementById("importExcelBtn")
  ?.addEventListener(
    "click",
    recoveredImportPropertyExcel
  );


/*=========================================
  PROPERTY TAX EXCEL IMPORT - FINAL
=========================================*/

document
  .getElementById("importExcelBtn")
  ?.addEventListener(
    "click",
    recoveredImportPropertyExcel
  );


async function recoveredImportPropertyExcel() {

  const input =
    document.getElementById("taxExcelFile");

  const files =
    input?.files;


  /* CHECK FILE */

  if (
    !files ||
    !files.length
  ) {

    alert(
      "⚠️ પહેલા Excel File પસંદ કરો."
    );

    return;
  }


  const file =
    files[0];


  try {

    /*=====================================
      PROGRESS
    =====================================*/

    const progress =
      document.getElementById(
        "importProgress"
      );

    if (progress) {

      progress.innerText =
        "⏳ Excel વાંચવામાં આવી રહી છે...";
    }


    /*=====================================
      READ EXCEL
    =====================================*/

    const arrayBuffer =
      await file.arrayBuffer();


    const workbook =
      XLSX.read(
        arrayBuffer,
        {
          type: "array"
        }
      );


    if (
      !workbook.SheetNames ||
      !workbook.SheetNames.length
    ) {

      alert(
        "❌ Excel Sheet મળી નથી."
      );

      return;
    }


    const sheetName =
      workbook.SheetNames[0];


    const worksheet =
      workbook.Sheets[
        sheetName
      ];


  const rawRows =
  XLSX.utils.sheet_to_json(
    worksheet,
    {
      header: 1,
      defval: ""
    }
  );

/*=====================================
  EXCEL HEADER = ROW 3
  DATA = ROW 4 ONWARDS
=====================================*/

const rows = rawRows
  .slice(3)
  .map((r) => ({
    "પ્રોપટી નંબર":
      r[0] ?? "",

    "મકાન નંબર":
      r[1] ?? "",

    "માલિકનું નામ":
      r[2] ?? "",

    "કબજેદારનું નામ":
      r[3] ?? "",

    "કુલ":
      r[4] ?? ""
  }))
  .filter((row) =>
    Object.values(row).some(
      value =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    )
  );

console.log(
  "📊 Excel Rows:",
  rows
);


    console.log(
      "📊 Excel Rows:",
      rows
    );


    if (!rows.length) {

      alert(
        "❌ Excelમાં કોઈ Record મળ્યો નથી."
      );

      return;
    }


    /*=====================================
      UNIQUE IMPORT ID
    =====================================*/

    const importId =
      "IMPORT_" +
      Date.now();


    const fileName =
      file.name;


    /*=====================================
      HELPERS
    =====================================*/

    function cleanValue(value) {

      if (
        value === null ||
        value === undefined
      ) {

        return "";
      }

      return String(value)
        .trim();
    }


    function numberValue(value) {

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {

        return 0;
      }


      const cleaned =
        String(value)
          .replace(/,/g, "")
          .replace(/₹/g, "")
          .trim();


      const number =
        Number(cleaned);


      return isNaN(number)
        ? 0
        : number;
    }


    function findValue(
      row,
      possibleNames
    ) {

      const keys =
        Object.keys(row);


      for (
        const key of keys
      ) {

        const normalizedKey =
          String(key)
            .trim()
            .toLowerCase();


        for (
          const name
          of possibleNames
        ) {

          const normalizedName =
            String(name)
              .trim()
              .toLowerCase();


          if (
            normalizedKey ===
            normalizedName
          ) {

            return row[key];
          }
        }
      }


      return "";
    }


    /*=====================================
      PREPARE FIRESTORE RECORDS
    =====================================*/

    const propertyRecords = [];


    for (
      let i = 0;
      i < rows.length;
      i++
    ) {

      const row =
        rows[i];


      /*
        PROPERTY NUMBER
      */

      const propertyNo =
        cleanValue(
          findValue(
            row,
            [
              "propertyNo",
              "property no",
              "property number",
              "મિલકત નંબર",
              "મિલકત નં",
              "મિલકત ક્રમાંક",
              "મિલકત ક્રમ"
            ]
          )
        );


      /*
        OWNER NAME
      */

      const ownerName =
        cleanValue(
          findValue(
            row,
            [
              "ownerName",
              "owner name",
              "name",
              "માલિક",
              "માલિકનું નામ",
              "મિલકતદારનું નામ"
            ]
          )
        );


      /*
        HOUSE NUMBER
      */

      const houseNo =
        cleanValue(
          findValue(
            row,
            [
              "houseNo",
              "house no",
              "house number",
              "ઘર નંબર",
              "ઘર નં",
              "મકાન નંબર",
              "મકાન નં"
            ]
          )
        );


      /*
        MOBILE
      */

      const ownerMobile =
        cleanValue(
          findValue(
            row,
            [
              "ownerMobile",
              "mobile",
              "mobile no",
              "mobile number",
              "મોબાઇલ",
              "મોબાઈલ",
              "મોબાઇલ નંબર"
            ]
          )
        );


      /*
        PREVIOUS DUE
      */

      const previousDue =
        numberValue(
          findValue(
            row,
            [
              "previousDue",
              "previous due",
              "old due",
              "બાકી",
              "જૂનો બાકી",
              "પાછલો બાકી"
            ]
          )
        );


      /*
        HOUSE TAX
      */

      const houseTax =
        numberValue(
          findValue(
            row,
            [
              "houseTax",
              "house tax",
              "મકાન વેરો",
              "ઘર વેરો"
            ]
          )
        );


      /*
        WATER TAX
      */

      const waterTax =
        numberValue(
          findValue(
            row,
            [
              "waterTax",
              "water tax",
              "પાણી વેરો"
            ]
          )
        );


      /*
        CLEANING TAX
      */

      const cleaningTax =
        numberValue(
          findValue(
            row,
            [
              "cleaningTax",
              "cleaning tax",
              "સફાઈ વેરો",
              "સફાઇ વેરો"
            ]
          )
        );


      /*
        DRAINAGE TAX
      */

      const drainageTax =
        numberValue(
          findValue(
            row,
            [
              "drainageTax",
              "drainage tax",
              "ગટર વેરો"
            ]
          )
        );


      /*
        OTHER TAX
      */

      const otherTax =
        numberValue(
          findValue(
            row,
            [
              "otherTax",
              "other tax",
              "અન્ય વેરો"
            ]
          )
        );


      /*
        TOTAL TAX
      */

      let taxAmount =
        numberValue(
          findValue(
            row,
            [
              "taxAmount",
              "tax amount",
              "total",
              "total tax",
              "કુલ",
              "કુલ વેરો",
              "કુલ રકમ",
              "વેરો"
            ]
          )
        );


      /*
        YEAR
      */

      const taxYear =
        cleanValue(
          findValue(
            row,
            [
              "taxYear",
              "tax year",
              "year",
              "વર્ષ",
              "વેરા વર્ષ"
            ]
          )
        );


      /*
        LAST DATE
      */

      const lastDate =
        cleanValue(
          findValue(
            row,
            [
              "lastDate",
              "last date",
              "છેલ્લી તારીખ",
              "છેલ્લી તારીખ"
            ]
          )
        );


      /*===================================
        SKIP COMPLETELY EMPTY ROW
      ===================================*/

      const hasAnyData =
        propertyNo ||
        ownerName ||
        houseNo ||
        ownerMobile ||
        taxAmount ||
        houseTax ||
        waterTax ||
        cleaningTax ||
        drainageTax ||
        otherTax;


      if (!hasAnyData) {

        continue;
      }


      /*===================================
        SKIP HEADER / TITLE ROWS
      ===================================*/

      if (
        propertyNo
          .toLowerCase()
          .includes("મિલકત નંબર") ||
        propertyNo
          .toLowerCase()
          .includes("property number")
      ) {

        continue;
      }


      /*===================================
        CALCULATE TOTAL IF NOT PROVIDED
      ===================================*/

      if (
        taxAmount === 0
      ) {

        taxAmount =
          previousDue +
          houseTax +
          waterTax +
          cleaningTax +
          drainageTax +
          otherTax;
      }


      /*===================================
        FIRESTORE RECORD
      ===================================*/

      const propertyData = {

        propertyNo:
          propertyNo,

        houseNo:
          houseNo,

        ownerName:
          ownerName,

        ownerMobile:
          ownerMobile,

        /*
          તમારા હાલના display code
          mobile field પણ વાંચે છે,
          એટલે બંને રાખ્યા છે.
        */

        mobile:
          ownerMobile,

        previousDue:
          previousDue,

        houseTax:
          houseTax,

        waterTax:
          waterTax,

        cleaningTax:
          cleaningTax,

        drainageTax:
          drainageTax,

        otherTax:
          otherTax,

        taxAmount:
          taxAmount,

        taxYear:
          taxYear,

        lastDate:
          lastDate,

        /*
          Excel tracking
        */

        importId:
          importId,

        importFileName:
          fileName,

        createdAt:
          serverTimestamp()
      };


      propertyRecords.push(
        propertyData
      );
    }


    /*=====================================
      CHECK RECORDS
    =====================================*/

    if (
      !propertyRecords.length
    ) {

      alert(
        "❌ Excelમાંથી કોઈ Property Record ઓળખી શકાયો નથી.\n\n" +
        "Excelના Column Names તપાસો."
      );

      if (progress) {

        progress.innerText =
          "❌ કોઈ Record મળ્યો નથી.";
      }

      return;
    }


    console.log(
      "✅ Records Ready:",
      propertyRecords.length
    );


    /*=====================================
      SAVE PROPERTY DATA
      BATCH LIMIT = 500
    =====================================*/

    let savedCount = 0;


    for (
      let start = 0;
      start <
      propertyRecords.length;
      start += 450
    ) {

      const batch =
        writeBatch(db);


      const chunk =
        propertyRecords.slice(
          start,
          start + 450
        );


      chunk.forEach(
        (propertyData) => {

          const propertyRef =
            doc(
              collection(
                db,
                "propertyTax"
              )
            );


          batch.set(
            propertyRef,
            propertyData
          );
        }
      );


      await batch.commit();


      savedCount +=
        chunk.length;


      if (progress) {

        progress.innerText =
          `⏳ ${savedCount} / ${propertyRecords.length} Records Save થઈ રહ્યા છે...`;
      }
    }


    /*=====================================
      SAVE IMPORT INFORMATION
    =====================================*/

    await setDoc(
      doc(
        db,
        "propertyTaxImports",
        importId
      ),
      {

        importId:
          importId,

        fileName:
          fileName,

        recordCount:
          propertyRecords.length,

        importedRecords:
          savedCount,

        importedAt:
          serverTimestamp(),

        status:
          "Completed"
      }
    );


    /*=====================================
      COMPLETE
    =====================================*/

    if (progress) {

      progress.innerText =
        `✅ Import Complete - ${savedCount} Records`;
    }


    alert(
      `✅ Excel Import સફળતાપૂર્વક પૂર્ણ થયો.\n\n` +
      `📄 File: ${fileName}\n` +
      `📊 Excel Records: ${rows.length}\n` +
      `💾 Saved Records: ${savedCount}\n` +
      `🆔 Import ID: ${importId}`
    );


    /*=====================================
      RESET
    =====================================*/

    input.value =
      "";


    /*
      PROPERTY LIST RELOAD
    */

    if (
      typeof loadPropertyTax ===
      "function"
    ) {

      await loadPropertyTax();
    }


    /*
      EXCEL LIST RELOAD
    */

    if (
      typeof recoveredLoadExcelImportList ===
      "function"
    ) {

      await recoveredLoadExcelImportList();
    }


  } catch (error) {

    console.error(
      "❌ EXCEL IMPORT ERROR:",
      error
    );


    const progress =
      document.getElementById(
        "importProgress"
      );


    if (progress) {

      progress.innerText =
        "❌ Importમાં ભૂલ આવી.";
    }


    alert(
      "❌ Excel Import Error:\n\n" +
      error.message
    );
  }
}
  
      /*=========================================
  RECOVERED OLD CODE
  UPLOADED EXCEL LIST
=========================================*/

async function recoveredLoadExcelImportList() {

  const box =
    document.getElementById(
      "excelImportList"
    );


  if (!box) {

    console.log(
      "excelImportList element નથી મળ્યું"
    );

    return;

  }


  box.innerHTML =
    "⏳ Excel List લોડ થઈ રહી છે...";


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "propertyTaxImports"
        )
      );


    if (snapshot.empty) {

      box.innerHTML = `

        <div
          style="
            padding:15px;
            background:#f8f9fa;
            border-radius:10px;
          "
        >

          📂 હજુ કોઈ Excel Upload નથી.

        </div>

      `;

      return;

    }


    let html = `

      <h3>
        📂 Uploaded Excel Files
      </h3>

    `;


    snapshot.forEach(
      (docSnap) => {

        const data =
          docSnap.data();


        const importId =
          data.importId ||
          docSnap.id;


        html += `

          <div
            style="
              margin:12px 0;
              padding:15px;
              background:#f8f9fa;
              border:1px solid #ddd;
              border-radius:12px;
            "
          >

            <div>

              <b
                style="
                  font-size:17px;
                "
              >

                📄
                ${
                  data.fileName ||
                  "Excel File"
                }

              </b>

              <br>

              <small>

                📊 Records:
                ${
                  data.recordCount ||
                  0
                }

              </small>

            </div>


            <button
              type="button"
              class="delete-excel-btn"
              data-import-id="${importId}"
              style="
                margin-top:12px;
                background:#dc3545;
                color:white;
                border:none;
                padding:10px 16px;
                border-radius:8px;
                cursor:pointer;
              "
            >

              🗑️
              આ Excel Delete કરો

            </button>


          </div>

        `;

      }
    );


    box.innerHTML =
      html;


    /* DELETE BUTTON EVENTS */

    box
      .querySelectorAll(
        ".delete-excel-btn"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const importId =
                button.dataset.importId;


              recoveredDeleteExcelImport(
                importId
              );

            }
          );

        }
      );


  } catch (error) {

    console.error(
      "EXCEL LIST ERROR:",
      error
    );


    box.innerHTML = `

      ❌ Excel List લોડ થઈ શકી નથી.

      <br>

      ${error.message}

    `;

  }

}


/*=========================================
  DELETE ONE EXCEL
  + ONLY ITS PROPERTY DATA
=========================================*/

async function recoveredDeleteExcelImport(
  importId
) {

  if (!importId) {

    alert(
      "❌ Excel Import ID મળ્યું નથી."
    );

    return;

  }


  const ok =
    confirm(

`⚠️ આ Excel Delete કરશો તો ફક્ત આ Excelનો Property Tax data Delete થશે.

બીજા Excelનો data Delete નહીં થાય.

ચાલુ રાખવું છે?`

    );


  if (!ok) return;


  try {

    const progress =
      document.getElementById(
        "importProgress"
      );


    if (progress) {

      progress.innerHTML =
        "🗑️ આ Excelનો data Delete થઈ રહ્યો છે...";

    }


    /* FIND ONLY THIS EXCEL */

    const propertySnap =
      await getDocs(

        query(

          collection(
            db,
            "propertyTax"
          ),

          where(
            "importId",
            "==",
            importId
          )

        )

      );


    let batch =
      writeBatch(db);


    let count =
      0;


    let deleted =
      0;


    /* DELETE MATCHING RECORDS */

    for (
      const d of propertySnap.docs
    ) {

      batch.delete(
        d.ref
      );


      deleted++;
      count++;


      if (
        count >= 400
      ) {

        await batch.commit();


        batch =
          writeBatch(db);


        count =
          0;

      }

    }


    /* LAST BATCH */

    if (
      count > 0
    ) {

      await batch.commit();

    }


    /* DELETE EXCEL INFORMATION */

    await deleteDoc(

      doc(
        db,
        "propertyTaxImports",
        importId
      )

    );


    /* REFRESH EXCEL LIST */

    await recoveredLoadExcelImportList();


    /* REFRESH PROPERTY LIST */

    if (
  typeof window.loadPropertyTax ===
  "function"
) {

  await window.loadPropertyTax();

    }


    if (progress) {

      progress.innerHTML =
        "✅ Excel Delete Complete";

    }


    alert(

`✅ Excel Delete થઈ ગઈ.

🗑️ Deleted Records:
${deleted}

બીજા Excelનો data સુરક્ષિત છે.`

    );


  } catch (error) {

    console.error(
      "DELETE EXCEL ERROR:",
      error
    );


    alert(
      "❌ Excel Delete Error:\n" +
      error.message
    );

  }

}


/* GLOBAL FUNCTIONS */

window.recoveredLoadExcelImportList =
  recoveredLoadExcelImportList;


window.recoveredDeleteExcelImport =
  recoveredDeleteExcelImport;

      /*=========================================
  RECOVERED OLD CODE
  APPROVED PAYMENTS EXCEL EXPORT
=========================================*/

document
  .getElementById(
    "exportApprovedExcel"
  )
  ?.addEventListener(
    "click",
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "taxPayments"
            )
          );


        const rows = [];


        for (
          const item
          of snapshot.docs
        ) {

          const payment =
            item.data();


          /* ONLY APPROVED */

          if (
            payment.status !==
            "Approved"
          ) {

            continue;

          }


          let owner = {};


          /* FIND PROPERTY */

          const propertySnap =
            await getDocs(

              query(

                collection(
                  db,
                  "propertyTax"
                ),

                where(
                  "propertyNo",
                  "==",
                  payment.propertyNo
                )

              )

            );


          if (
            !propertySnap.empty
          ) {

            owner =
              propertySnap
                .docs[0]
                .data();

          }


          /* EXCEL ROW */

          rows.push({

            "મિલકત નંબર":
              payment.propertyNo,

            "માલિક":
              owner.ownerName ||
              "",

            "ઘર નંબર":
              owner.houseNo ||
              "",

            "મોબાઇલ":
              owner.mobile ||
              "",

            "વેરો":
              owner.taxAmount ||
              0,

            "UTR":
              payment.utr,

            "Status":
              payment.status

          });

        }


        /* CREATE SHEET */

        const ws =
          XLSX.utils.json_to_sheet(
            rows
          );


        /* CREATE WORKBOOK */

        const wb =
          XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(

          wb,

          ws,

          "Approved Payments"

        );


        /* DOWNLOAD */

        XLSX.writeFile(

          wb,

          "Approved_Payments.xlsx"

        );


      } catch (error) {

        console.error(
          "Approved Excel Export Error:",
          error
        );


        alert(
          "❌ Approved Excel Exportમાં ભૂલ:\n" +
          error.message
        );

      }

    }
  );

      /*=========================================
  RECOVERED OLD CODE
  FIRESTORE BACKUP
=========================================*/

document
  .getElementById("backupBtn")
  ?.addEventListener(
    "click",
    recoveredBackupData
  );


async function recoveredBackupData() {

  try {

    alert(
      "⏳ Backup તૈયાર થઈ રહ્યું છે..."
    );


    const backup = {};


    /* WEBSITE SETTINGS */

    const websiteSnap =
      await getDoc(
        doc(
          db,
          "website",
          "settings"
        )
      );


    backup.website =
      websiteSnap.exists()
        ? websiteSnap.data()
        : {};


    /* MEMBERS */

    backup.members =
      (
        await getDocs(
          collection(
            db,
            "members"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /* NOTICES */

    backup.notices =
      (
        await getDocs(
          collection(
            db,
            "notices"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /* GALLERY */

    backup.gallery =
      (
        await getDocs(
          collection(
            db,
            "gallery"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /* COMPLAINTS */

    backup.complaints =
      (
        await getDocs(
          collection(
            db,
            "complaints"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /* PROPERTY TAX */

    backup.propertyTax =
      (
        await getDocs(
          collection(
            db,
            "propertyTax"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );

/* PROPERTY TAX IMPORTS */

backup.propertyTaxImports =
  (
    await getDocs(
      collection(
        db,
        "propertyTaxImports"
      )
    )
  )
  .docs
  .map(
    d => ({
      id: d.id,
      ...d.data()
    })
  );
    
    /* TAX PAYMENTS */

    backup.taxPayments =
      (
        await getDocs(
          collection(
            db,
            "taxPayments"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /* APPLICATIONS */

    backup.applications =
      (
        await getDocs(
          collection(
            db,
            "applications"
          )
        )
      )
      .docs
      .map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /*=====================================
      CREATE JSON FILE
    =====================================*/

    const blob =
      new Blob(

        [
          JSON.stringify(
            backup,
            null,
            2
          )
        ],

        {
          type:
            "application/json"
        }

      );


    const url =
      URL.createObjectURL(
        blob
      );


    const a =
      document.createElement(
        "a"
      );


    a.href =
      url;


    a.download =
      "GramPanchayat_Backup.json";


    a.click();


    URL.revokeObjectURL(
      url
    );


    alert(
      "✅ Backup સફળતાપૂર્વક Download થઈ ગયું."
    );


  } catch (error) {

    console.error(
      "BACKUP ERROR:",
      error
    );


    alert(
      "❌ Backup લેવામાં ભૂલ:\n" +
      error.message
    );

  }

}


/* GLOBAL */

window.recoveredBackupData =
  recoveredBackupData;
    /*=========================================
  RECOVERED OLD CODE
  FIRESTORE RESTORE
=========================================*/

document
  .getElementById("restoreBtn")
  ?.addEventListener(
    "click",
    () => {

      const input =
        document.getElementById(
          "restoreFile"
        );

      if (!input) {

        alert(
          "❌ Restore File input મળ્યું નથી."
        );

        return;

      }

      input.click();

    }
  );


document
  .getElementById("restoreFile")
  ?.addEventListener(
    "change",
    recoveredRestoreData
  );


async function recoveredRestoreData(event) {

  const file =
    event.target.files?.[0];


  if (!file) {

    return;

  }


  const ok =
    confirm(

`⚠️ Restore કરવાથી Backupની માહિતી Firestoreમાં પાછી લખાશે.

શું તમે ખરેખર Restore કરવા માંગો છો?`

    );


  if (!ok) {

    event.target.value =
      "";

    return;

  }


  const progress =
    document.getElementById(
      "restoreProgress"
    );


  try {

    if (progress) {

      progress.style.display =
        "block";

      progress.innerText =
        "⏳ Restore શરૂ થઈ રહ્યું છે...";

    }


    const text =
      await file.text();


    const backup =
      JSON.parse(text);


    /*=====================================
      RESTORE HELPER
    =====================================*/

    async function restoreCollection(
      collectionName,
      records
    ) {

      if (
        !Array.isArray(records)
      ) {

        return 0;

      }


      let batch =
        writeBatch(db);


      let count =
        0;


      let restored =
        0;


      for (
        const record
        of records
      ) {

        if (!record?.id) {

          continue;

        }


        const {
          id,
          ...data
        } = record;


        batch.set(

          doc(
            db,
            collectionName,
            id
          ),

          data,

          {
            merge: true
          }

        );


        count++;
        restored++;


        /*
          Firestore batch limitથી
          નીચે રાખીએ છીએ.
        */

        if (
          count >= 400
        ) {

          await batch.commit();


          batch =
            writeBatch(db);


          count =
            0;

        }

      }


      if (
        count > 0
      ) {

        await batch.commit();

      }


      return restored;

    }


    /*=====================================
      WEBSITE SETTINGS
    =====================================*/

    if (
      backup.website &&
      typeof backup.website ===
        "object"
    ) {

      await updateDoc(

        doc(
          db,
          "website",
          "settings"
        ),

        backup.website

      );

    }


    /*=====================================
      COLLECTIONS
    =====================================*/

    const membersCount =
      await restoreCollection(
        "members",
        backup.members
      );


    const noticesCount =
      await restoreCollection(
        "notices",
        backup.notices
      );


    const galleryCount =
      await restoreCollection(
        "gallery",
        backup.gallery
      );


    const complaintsCount =
      await restoreCollection(
        "complaints",
        backup.complaints
      );


    const propertyTaxCount =
      await restoreCollection(
        "propertyTax",
        backup.propertyTax
      );

    const propertyTaxImportsCount =
  await restoreCollection(
    "propertyTaxImports",
    backup.propertyTaxImports
  );

    const taxPaymentsCount =
      await restoreCollection(
        "taxPayments",
        backup.taxPayments
      );


    const applicationsCount =
      await restoreCollection(
        "applications",
        backup.applications
      );


    /*=====================================
      COMPLETE
    =====================================*/

    if (progress) {

      progress.innerText =
        "✅ Restore Complete";

    }


    alert(

`✅ Restore સફળતાપૂર્વક પૂર્ણ થયું.

Members: ${membersCount}
Notices: ${noticesCount}
Gallery: ${galleryCount}
Complaints: ${complaintsCount}
Property Tax: ${propertyTaxCount}
Property Tax Imports: ${propertyTaxImportsCount}
Tax Payments: ${taxPaymentsCount}
Applications: ${applicationsCount}`

    );


    /* RESET INPUT */

    event.target.value =
      "";


  } catch (error) {

    console.error(
      "RESTORE ERROR:",
      error
    );


    if (progress) {

      progress.innerText =
        "❌ Restoreમાં ભૂલ આવી.";

    }


    alert(

      "❌ Restore કરવામાં ભૂલ:\n" +
      error.message

    );


    event.target.value =
      "";

  }

}


/* GLOBAL */

window.recoveredRestoreData =
  recoveredRestoreData;

      /*=========================================
  RECOVERED OLD CODE
  PAYMENT FILTER BUTTONS
=========================================*/

document
  .getElementById("filterPaymentsBtn")
  ?.addEventListener(
    "click",
    () => {

      if (
        typeof window.loadTaxPayments ===
        "function"
      ) {

        window.loadTaxPayments();

      }

    }
  );


document
  .getElementById("clearFilterBtn")
  ?.addEventListener(
    "click",
    () => {

      const fromDate =
        document.getElementById(
          "fromDate"
        );

      const toDate =
        document.getElementById(
          "toDate"
        );


      if (fromDate) {

        fromDate.value =
          "";

      }


      if (toDate) {

        toDate.value =
          "";

      }


      if (
        typeof window.loadTaxPayments ===
        "function"
      ) {

        window.loadTaxPayments();

      }

    }
  );

      /* =========================================================
   RECOVERED OLD CODE
   ESCAPE HTML
========================================================= */

function escapeHtml(text) {

  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

window.escapeHtml = escapeHtml;

/*====================================================
  RECOVERED APPLICATIONS + CONTACT MANAGEMENT
====================================================*/

/*====================================================
  BIRTH APPLICATIONS
====================================================*/

async function loadBirthApplications() {

  const list =
    document.getElementById("birthApplicationsList");

  if (!list) return;

  list.innerHTML =
    "⏳ જન્મ પ્રમાણપત્રની અરજીઓ લોડ થઈ રહી છે...";

  try {

    const snapshot =
      await getDocs(
        collection(db, "applications")
      );

    let html = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      if (data.service !== "birth") return;

      const birth =
        data.birthData || {};

      const status =
        data.status || "Pending";

      html += `
        <div class="admin-item">

          <h3>🟢 જન્મ પ્રમાણપત્ર અરજી</h3>

          <p>
            <b>અરજી નંબર:</b>
            ${data.applicationNo || "-"}
          </p>

          <p>
            <b>અરજદારનું નામ:</b>
            ${data.name || "-"}
          </p>

          <p>
            <b>મોબાઇલ:</b>
            ${data.mobile || "-"}
          </p>

          <hr>

          <p>
            <b>બાળકનું નામ:</b>
            ${birth.birthName || "-"}
          </p>

          <p>
            <b>જાતિ:</b>
            ${birth.birthSex || "-"}
          </p>

          <p>
            <b>આધાર:</b>
            ${birth.birthAadhaar || "-"}
          </p>

          <p>
            <b>જન્મ તારીખ:</b>
            ${birth.birthDate || "-"}
          </p>

          <p>
            <b>જન્મ સ્થળ:</b>
            ${birth.birthPlace || "-"}
          </p>

          <p>
            <b>માતાનું નામ:</b>
            ${birth.birthMother || "-"}
          </p>

          <p>
            <b>પિતાનું નામ:</b>
            ${birth.birthFather || "-"}
          </p>

          <p>
            <b>માતાનો આધાર:</b>
            ${birth.birthMotherAadhaar || "-"}
          </p>

          <p>
            <b>પિતાનો આધાર:</b>
            ${birth.birthFatherAadhaar || "-"}
          </p>

          <p>
            <b>જન્મ સમયે સરનામું:</b>
            ${birth.birthAddressAtBirth || "-"}
          </p>

          <p>
            <b>કાયમી સરનામું:</b>
            ${birth.birthPermanentAddress || "-"}
          </p>

          <p>
            <b>નોંધણી નંબર:</b>
            ${birth.birthRegistrationNo || "-"}
          </p>

          <p>
            <b>નોંધણી તારીખ:</b>
            ${birth.birthRegistrationDate || "-"}
          </p>

          <p>
            <b>સ્થિતિ:</b>
            ${status}
          </p>

          <div class="admin-actions">

            <button
              onclick="viewBirthApplication('${docSnap.id}')">
              👁️ વિગતો
            </button>

            <button
              onclick="approveBirthApplication('${docSnap.id}')">
              ✅ Approve
            </button>

            <button
              onclick="rejectBirthApplication('${docSnap.id}')">
              ❌ Reject
            </button>

            <button
              onclick="editBirthApplication('${docSnap.id}')">
              ✏️ Edit
            </button>

            <button
              onclick="deleteBirthApplication('${docSnap.id}')">
              🗑️ Delete
            </button>

          </div>

        </div>
      `;
    });

    list.innerHTML =
      html ||
      "<p>📭 હાલમાં કોઈ જન્મ પ્રમાણપત્રની અરજી નથી.</p>";

  } catch (error) {

    console.error(error);

    list.innerHTML =
      "❌ અરજી લોડ કરવામાં ભૂલ આવી: " +
      error.message;
  }
}


/* APPROVE BIRTH */

async function approveBirthApplication(id) {

  if (
    !confirm(
      "શું તમે આ જન્મ પ્રમાણપત્રની અરજી Approve કરવા માંગો છો?"
    )
  ) return;

  try {

    await updateDoc(
      doc(db, "applications", id),
      {
        status: "Approved"
      }
    );

    alert(
      "✅ જન્મ પ્રમાણપત્રની અરજી Approved થઈ ગઈ."
    );

    loadBirthApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Approve કરવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.approveBirthApplication =
  approveBirthApplication;


/* REJECT BIRTH */

async function rejectBirthApplication(id) {

  const reason =
    prompt(
      "Reject કરવાનું કારણ લખો:"
    );

  if (reason === null) return;

  try {

    await updateDoc(
      doc(db, "applications", id),
      {
        status: "Rejected",
        rejectionReason: reason
      }
    );

    alert(
      "❌ જન્મ પ્રમાણપત્રની અરજી Reject થઈ ગઈ."
    );

    loadBirthApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Reject કરવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.rejectBirthApplication =
  rejectBirthApplication;


/* DELETE BIRTH */

async function deleteBirthApplication(id) {

  if (
    !confirm(
      "⚠️ શું તમે આ અરજી કાયમ માટે Delete કરવા માંગો છો?"
    )
  ) return;

  try {

    await deleteDoc(
      doc(db, "applications", id)
    );

    alert(
      "🗑️ અરજી Delete થઈ ગઈ."
    );

    loadBirthApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.deleteBirthApplication =
  deleteBirthApplication;


/* VIEW BIRTH */

async function viewBirthApplication(id) {

  try {

    const snap =
      await getDoc(
        doc(db, "applications", id)
      );

    if (!snap.exists()) {

      alert("અરજી મળી નથી.");

      return;
    }

    const data =
      snap.data();

    const birth =
      data.birthData || {};

    alert(
`🟢 જન્મ પ્રમાણપત્ર અરજી

અરજી નંબર:
${data.applicationNo || "-"}

અરજદારનું નામ:
${data.name || "-"}

મોબાઇલ:
${data.mobile || "-"}

બાળકનું નામ:
${birth.birthName || "-"}

જાતિ:
${birth.birthSex || "-"}

આધાર:
${birth.birthAadhaar || "-"}

જન્મ તારીખ:
${birth.birthDate || "-"}

જન્મ સ્થળ:
${birth.birthPlace || "-"}

માતાનું નામ:
${birth.birthMother || "-"}

પિતાનું નામ:
${birth.birthFather || "-"}

સ્થિતિ:
${data.status || "Pending"}`
    );

  } catch (error) {

    console.error(error);

    alert(
      "વિગતો બતાવવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.viewBirthApplication =
  viewBirthApplication;


/*====================================================
  DEATH APPLICATIONS
====================================================*/

async function loadDeathApplications() {

  const list =
    document.getElementById(
      "deathApplicationsList"
    );

  if (!list) return;

  list.innerHTML =
    "⏳ મૃત્યુ પ્રમાણપત્રની અરજીઓ લોડ થઈ રહી છે...";

  try {

    const snapshot =
      await getDocs(
        collection(db, "applications")
      );

    let html = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      if (data.service !== "death") return;

      const death =
        data.deathData || {};

      html += `
        <div class="admin-item">

          <h3>⚰️ મૃત્યુ પ્રમાણપત્ર અરજી</h3>

          <p>
            <b>અરજી નંબર:</b>
            ${data.applicationNo || "-"}
          </p>

          <p>
            <b>અરજદારનું નામ:</b>
            ${data.name || "-"}
          </p>

          <p>
            <b>મોબાઇલ:</b>
            ${data.mobile || "-"}
          </p>

          <hr>

          <p>
            <b>મરનારનું નામ:</b>
            ${death.deathName || "-"}
          </p>

          <p>
            <b>જાતિ:</b>
            ${death.deathSex || "-"}
          </p>

          <p>
            <b>આધાર:</b>
            ${death.deathAadhaar || "-"}
          </p>

          <p>
            <b>ઉંમર:</b>
            ${death.deathAge || "-"}
          </p>

          <p>
            <b>મરણ તારીખ:</b>
            ${death.deathDate || "-"}
          </p>

          <p>
            <b>મરણ સ્થળ:</b>
            ${death.deathPlace || "-"}
          </p>

          <p>
            <b>પતિ / પત્ની:</b>
            ${death.deathSpouse || "-"}
          </p>

          <p>
            <b>માતાનું નામ:</b>
            ${death.deathMother || "-"}
          </p>

          <p>
            <b>પિતાનું નામ:</b>
            ${death.deathFather || "-"}
          </p>

          <p>
            <b>મરણ સમયે સરનામું:</b>
            ${death.deathAddressAtDeath || "-"}
          </p>

          <p>
            <b>કાયમી સરનામું:</b>
            ${death.deathPermanentAddress || "-"}
          </p>

          <p>
            <b>નોંધણી નંબર:</b>
            ${death.deathRegistrationNo || "-"}
          </p>

          <p>
            <b>નોંધણી તારીખ:</b>
            ${death.deathRegistrationDate || "-"}
          </p>

          <p>
            <b>Remarks:</b>
            ${death.deathRemarks || "-"}
          </p>

          <p>
            <b>સ્થિતિ:</b>
            ${data.status || "Pending"}
          </p>

          <div class="admin-actions">

            <button
              onclick="approveDeathApplication('${docSnap.id}')">
              ✅ Approve
            </button>

            <button
              onclick="rejectDeathApplication('${docSnap.id}')">
              ❌ Reject
            </button>

            <button
              onclick="deleteDeathApplication('${docSnap.id}')">
              🗑️ Delete
            </button>

          </div>

        </div>
      `;
    });

    list.innerHTML =
      html ||
      "<p>📭 હાલમાં કોઈ મૃત્યુ પ્રમાણપત્રની અરજી નથી.</p>";

  } catch (error) {

    console.error(error);

    list.innerHTML =
      "❌ અરજી લોડ કરવામાં ભૂલ આવી: " +
      error.message;
  }
}


async function approveDeathApplication(id) {

  if (
    !confirm(
      "શું તમે આ મૃત્યુ પ્રમાણપત્ર અરજી Approve કરવા માંગો છો?"
    )
  ) return;

  try {

    await updateDoc(
      doc(db, "applications", id),
      {
        status: "Approved"
      }
    );

    alert(
      "✅ મૃત્યુ પ્રમાણપત્રની અરજી Approved થઈ ગઈ."
    );

    loadDeathApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Approve કરવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.approveDeathApplication =
  approveDeathApplication;


async function rejectDeathApplication(id) {

  const reason =
    prompt(
      "Reject કરવાનું કારણ લખો:"
    );

  if (reason === null) return;

  try {

    await updateDoc(
      doc(db, "applications", id),
      {
        status: "Rejected",
        rejectionReason: reason
      }
    );

    alert(
      "❌ મૃત્યુ પ્રમાણપત્રની અરજી Reject થઈ ગઈ."
    );

    loadDeathApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Reject કરવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.rejectDeathApplication =
  rejectDeathApplication;


async function deleteDeathApplication(id) {

  if (
    !confirm(
      "⚠️ શું તમે આ મૃત્યુ પ્રમાણપત્રની અરજી કાયમ માટે Delete કરવા માંગો છો?"
    )
  ) return;

  try {

    await deleteDoc(
      doc(db, "applications", id)
    );

    alert(
      "🗑️ મૃત્યુ પ્રમાણપત્રની અરજી Delete થઈ ગઈ."
    );

    loadDeathApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Delete કરવામાં ભૂલ આવી: " +
      error.message
    );
  }
}

window.deleteDeathApplication =
  deleteDeathApplication;


/*====================================================
  INCOME APPLICATIONS
====================================================*/

async function loadIncomeApplications() {

  const list =
    document.getElementById(
      "incomeApplicationsList"
    );

  if (!list) return;

  list.innerHTML =
    "⏳ આવક પ્રમાણપત્રની અરજીઓ લોડ થઈ રહી છે...";

  try {

    const snapshot =
      await getDocs(
        collection(db, "applications")
      );

    let html = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      if (data.service !== "income") return;

      const income =
        data.incomeData || {};

      html += `
        <div class="admin-item">

          <h3>💰 આવક પ્રમાણપત્ર અરજી</h3>

          <p>
            <b>અરજી નંબર:</b>
            ${data.applicationNo || "-"}
          </p>

          <p>
            <b>અરજદારનું નામ:</b>
            ${income.incomeApplicantName ||
              data.name || "-"}
          </p>

          <p>
            <b>મોબાઇલ:</b>
            ${data.mobile || "-"}
          </p>

          <p>
            <b>સરનામું:</b>
            ${income.incomeAddress || "-"}
          </p>

          <p>
            <b>સ્થિતિ:</b>
            ${data.status || "Pending"}
          </p>

          <hr>

          <p>
            📷 પાસપોર્ટ ફોટો:
            ${
              income.incomePhoto?.url
              ? `<a href="${income.incomePhoto.url}" target="_blank">📂 જુઓ</a>`
              : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            🪪 આધાર:
            ${
              income.incomeAadhaar?.url
              ? `<a href="${income.incomeAadhaar.url}" target="_blank">📂 જુઓ</a>`
              : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            📄 રેશન કાર્ડ:
            ${
              income.incomeRationCard?.url
              ? `<a href="${income.incomeRationCard.url}" target="_blank">📂 જુઓ</a>`
              : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            💡 લાઈટ બિલ:
            ${
              income.incomeLightBill?.url
              ? `<a href="${income.incomeLightBill.url}" target="_blank">📂 જુઓ</a>`
              : " ઉપલબ્ધ નથી"
            }
          </p>

          <p>
            📑 આવકનું ફોર્મ:
            ${
              income.incomeForm?.url
              ? `<a href="${income.incomeForm.url}" target="_blank">📂 જુઓ</a>`
              : " ઉપલબ્ધ નથી"
            }
          </p>

          <div class="admin-actions">

            <button
              onclick="viewIncomeApplication('${docSnap.id}')">
              👁️ View
            </button>

            <button
              onclick="approveIncomeApplication('${docSnap.id}')">
              ✅ Approve
            </button>

            <button
              onclick="rejectIncomeApplication('${docSnap.id}')">
              ❌ Reject
            </button>

            <button
              onclick="deleteIncomeApplication('${docSnap.id}')">
              🗑️ Delete
              </button>
</div>
`;
});

        list.innerHTML =
      html ||
      "<p>📭 હાલમાં કોઈ આવક પ્રમાણપત્રની અરજી નથી.</p>";

  } catch (error) {

    console.error(
      "INCOME APPLICATIONS ERROR:",
      error
    );

    list.innerHTML =
      "❌ આવક પ્રમાણપત્રની અરજીઓ લોડ કરવામાં ભૂલ આવી: " +
      error.message;
  }

}
window.loadIncomeApplications =
  loadIncomeApplications;