import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================
   NOTICE MANAGER
========================================= */

const noticeForm =
  document.getElementById("noticeForm");


/* =========================================
   SAVE NOTICE
========================================= */

noticeForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      const title =
        document
          .getElementById("noticeTitle")
          ?.value
          .trim();

      const description =
        document
          .getElementById("noticeDescription")
          ?.value
          .trim();

      const date =
        document
          .getElementById("noticeDate")
          ?.value || "";

      const expiryDate =
        document
          .getElementById("noticeExpiryDate")
          ?.value || "";

      const important =
        document
          .getElementById("noticeImportant")
          ?.value === "true";


      if (!title) {

        alert(
          "⚠️ નોટિસનું શીર્ષક લખો."
        );

        return;
      }


      if (!description) {

        alert(
          "⚠️ નોટિસની વિગત લખો."
        );

        return;
      }


      /* FILE */

      let noticeFile = "";


      const fileInput =
        document.getElementById(
          "noticeFile"
        );


      if (
        fileInput &&
        fileInput.files.length > 0
      ) {

        if (
          typeof window.uploadToSupabase !==
          "function"
        ) {

          throw new Error(
            "Upload function મળ્યું નથી."
          );

        }


        noticeFile =
          await window.uploadToSupabase(
            fileInput.files[0]
          );

      }


      /* SAVE */

      await addDoc(
        collection(db, "notices"),
        {

          title,

          description,

          date,

          expiryDate,

          important,

          file: noticeFile,

          active: true,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }
      );


      alert(
        "✅ નોટિસ સફળતાપૂર્વક સેવ થઈ ગઈ."
      );


      noticeForm.reset();


      const preview =
        document.getElementById(
          "noticePreview"
        );

      if (preview) {

        preview.src = "";

      }


      await loadNotices();


    } catch (error) {

      console.error(
        "NOTICE SAVE ERROR:",
        error
      );


      alert(
        "❌ નોટિસ સેવ કરવામાં ભૂલ:\n" +
        error.message
      );

    }

  }
);


/* =========================================
   LOAD NOTICES
========================================= */

async function loadNotices() {

  const list =
    document.getElementById(
      "noticeList"
    );


  if (!list) return;


  list.innerHTML =
    "⏳ નોટિસ લોડ થઈ રહી છે...";


  try {

    const snapshot =
      await getDocs(
        collection(db, "notices")
      );


    if (snapshot.empty) {

      list.innerHTML =
        "📭 કોઈ નોટિસ ઉપલબ્ધ નથી.";

      return;

    }


    let html = "";


    snapshot.forEach(
      (item) => {

        const data =
          item.data();


        const title =
          data.title || "-";


        const description =
          data.description || "-";


        const date =
          data.date || "-";


        const expiryDate =
          data.expiryDate || "";


        const important =
          data.important === true;


        const active =
          data.active !== false;


        let expired = false;


        if (expiryDate) {

          const today =
            new Date()
              .toISOString()
              .split("T")[0];


          if (
            expiryDate < today
          ) {

            expired = true;

          }

        }


        let statusHtml = "";


        if (expired) {

          statusHtml =
            `<span
              style="
                background:#fee2e2;
                color:#b91c1c;
                padding:5px 9px;
                border-radius:20px;
                font-size:13px;
              "
            >
              🔴 Expired
            </span>`;

        }

        else if (!active) {

          statusHtml =
            `<span
              style="
                background:#e5e7eb;
                color:#374151;
                padding:5px 9px;
                border-radius:20px;
                font-size:13px;
              "
            >
              ⚫ Inactive
            </span>`;

        }

        else {

          statusHtml =
            `<span
              style="
                background:#dcfce7;
                color:#166534;
                padding:5px 9px;
                border-radius:20px;
                font-size:13px;
              "
            >
              🟢 Active
            </span>`;

        }


        const importantHtml =
          important
            ? `
              <span
                style="
                  background:#fff3cd;
                  color:#856404;
                  padding:5px 9px;
                  border-radius:20px;
                  font-size:13px;
                  margin-left:5px;
                "
              >
                📌 Important
              </span>
            `
            : "";


        const fileHtml =
          data.file
            ? `
              <br>
              <br>

              <a
                href="${data.file}"
                target="_blank"
                style="
                  text-decoration:none;
                "
              >
                📎 ફાઇલ જુઓ
              </a>
            `
            : "";


        html += `

          <div
            class="admin-item"
            style="
              margin-bottom:15px;
              padding:15px;
              border-radius:12px;
              border:1px solid #ddd;
              background:#fff;
            "
          >

            <div>

              <h3
                style="
                  margin-bottom:8px;
                "
              >
                ${
                  important
                    ? "📌 "
                    : ""
                }

                ${title}
              </h3>


              <p>
                ${description}
              </p>


              <small>
                📅 તારીખ:
                ${date}
              </small>


              ${
                expiryDate
                  ? `
                    <br>

                    <small>
                      ⏳ Expiry:
                      ${expiryDate}
                    </small>
                  `
                  : ""
              }


              <div
                style="
                  margin-top:10px;
                "
              >

                ${statusHtml}

                ${importantHtml}

              </div>


              ${fileHtml}

            </div>


            <div
              class="admin-actions"
              style="
                margin-top:15px;
              "
            >

              <button
                type="button"
                onclick="
                  editNotice('${item.id}')
                "
              >
                ✏️ Edit
              </button>


              <button
                type="button"
                onclick="
                  toggleNotice('${item.id}')
                "
              >
                ${
                  active
                    ? "🔴 Disable"
                    : "🟢 Enable"
                }
              </button>


              <button
                type="button"
                onclick="
                  deleteNotice('${item.id}')
                "
              >
                🗑️ Delete
              </button>

            </div>

          </div>

        `;

      }
    );


    list.innerHTML = html;


  } catch (error) {

    console.error(
      "NOTICE LOAD ERROR:",
      error
    );


    list.innerHTML =
      "❌ નોટિસ લોડ કરવામાં ભૂલ: " +
      error.message;

  }

}


/* =========================================
   EDIT NOTICE
========================================= */

async function editNotice(id) {

  try {

    const noticeRef =
      doc(
        db,
        "notices",
        id
      );


    const snap =
      await getDoc(
        noticeRef
      );


    if (!snap.exists()) {

      alert(
        "❌ નોટિસ મળી નથી."
      );

      return;

    }


    const data =
      snap.data();


    const newTitle =
      prompt(
        "નવું શીર્ષક:",
        data.title || ""
      );


    if (newTitle === null)
      return;


    const newDescription =
      prompt(
        "નવી વિગત:",
        data.description || ""
      );


    if (
      newDescription === null
    )
      return;


    const newDate =
      prompt(
        "નવી તારીખ (YYYY-MM-DD):",
        data.date || ""
      );


    if (newDate === null)
      return;


    const newExpiry =
      prompt(
        "Expiry Date (YYYY-MM-DD), ખાલી રાખી શકો:",
        data.expiryDate || ""
      );


    if (newExpiry === null)
      return;


    const newImportant =
      confirm(
        "શું આ નોટિસ Important રાખવી છે?"
      );


    await updateDoc(
      noticeRef,
      {

        title:
          newTitle.trim(),

        description:
          newDescription.trim(),

        date:
          newDate.trim(),

        expiryDate:
          newExpiry.trim(),

        important:
          newImportant,

        updatedAt:
          serverTimestamp()

      }
    );


    alert(
      "✅ નોટિસ સફળતાપૂર્વક Update થઈ."
    );


    await loadNotices();


  } catch (error) {

    console.error(
      "NOTICE EDIT ERROR:",
      error
    );


    alert(
      "❌ Edit કરવામાં ભૂલ:\n" +
      error.message
    );

  }

}


window.editNotice =
  editNotice;


/* =========================================
   ENABLE / DISABLE
========================================= */

async function toggleNotice(id) {

  try {

    const noticeRef =
      doc(
        db,
        "notices",
        id
      );


    const snap =
      await getDoc(
        noticeRef
      );


    if (!snap.exists())
      return;


    const data =
      snap.data();


    const newStatus =
      data.active === false;


    await updateDoc(
      noticeRef,
      {

        active:
          newStatus,

        updatedAt:
          serverTimestamp()

      }
    );


    await loadNotices();


  } catch (error) {

    console.error(
      "NOTICE TOGGLE ERROR:",
      error
    );


    alert(
      "❌ Status બદલવામાં ભૂલ:\n" +
      error.message
    );

  }

}


window.toggleNotice =
  toggleNotice;


/* =========================================
   DELETE NOTICE
========================================= */

async function deleteNotice(id) {

  const ok =
    confirm(
      "⚠️ શું તમે આ નોટિસ Delete કરવા માંગો છો?"
    );


  if (!ok)
    return;


  try {

    await deleteDoc(
      doc(
        db,
        "notices",
        id
      )
    );


    alert(
      "🗑️ નોટિસ Delete થઈ ગઈ."
    );


    await loadNotices();


  } catch (error) {

    console.error(
      "NOTICE DELETE ERROR:",
      error
    );


    alert(
      "❌ Delete કરવામાં ભૂલ:\n" +
      error.message
    );

  }

}


window.deleteNotice =
  deleteNotice;


/* =========================================
   PREVIEW
========================================= */

const noticeFileInput =
  document.getElementById(
    "noticeFile"
  );


noticeFileInput?.addEventListener(
  "change",
  function () {

    const file =
      this.files?.[0];


    const preview =
      document.getElementById(
        "noticePreview"
      );


    if (
      file &&
      file.type.startsWith("image/")
    ) {

      const reader =
        new FileReader();


      reader.onload =
        function (e) {

          if (preview) {

            preview.src =
              e.target.result;

          }

        };


      reader.readAsDataURL(
        file
      );

    }

    else {

      if (preview) {

        preview.src = "";

      }

    }

  }
);


/* =========================================
   START
========================================= */

loadNotices();


console.log(
  "✅ Notice Manager loaded"
);