import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/*=========================================
  ADMIN FEATURES
  ONLINE APPLICATIONS
=========================================*/

const serviceNames = {
  birth: "જન્મ પ્રમાણપત્ર",
  death: "મૃત્યુ પ્રમાણપત્ર",
  income: "આવક દાખલો",
  residence: "રહેઠાણ દાખલો",
  property: "મિલકત આકારણી",
  tax: "ટેક્સ",
  complaint: "ફરિયાદ"
};


/*=========================================
  DATE FORMAT
=========================================*/

function featureDate(value) {

  if (!value) {
    return "-";
  }

  try {

    if (
      typeof value.toDate ===
      "function"
    ) {
      return value
        .toDate()
        .toLocaleString("gu-IN");
    }

    return new Date(value)
      .toLocaleString("gu-IN");

  } catch {
    return "-";
  }
}


/*=========================================
  CLOSE APPLICATION MODAL
=========================================*/

function closeApplicationFeatureModal() {

  document
    .getElementById(
      "gpApplicationFeatureModal"
    )
    ?.remove();

}


/*=========================================
  UPDATE APPLICATION STATUS
=========================================*/

async function featureUpdateApplicationStatus(
  id,
  status
) {

  try {

    let rejectionReason = "";


    /* REJECT REASON */

    if (
      status === "Rejected"
    ) {

      rejectionReason =
        prompt(
          "❌ Reject કરવાનું કારણ લખો:"
        );

      if (
        !rejectionReason ||
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

    if (
      status === "Approved"
    ) {

      const ok =
        confirm(
          "શું આ અરજી Approve કરવા માંગો છો?"
        );

      if (!ok) {
        return;
      }

    }


    /* APPLICATION */

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


    /* HISTORY */

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


    closeApplicationFeatureModal();


    if (
      status === "Approved"
    ) {

      alert(
        "✅ અરજી Approved થઈ ગઈ."
      );

    } else {

      alert(
        "❌ અરજી Rejected થઈ ગઈ."
      );

    }


    /* REFRESH */

    if (
      typeof window.loadApplications ===
      "function"
    ) {

      await window.loadApplications();

    } else {

      window.location.reload();

    }


  } catch (error) {

    console.error(
      "Application Feature Status Error:",
      error
    );

    alert(
      "❌ Status update કરવામાં ભૂલ:\n" +
      error.message
    );

  }

}


/*=========================================
  VIEW APPLICATION
  + STATUS HISTORY
=========================================*/

async function featureViewApplication(
  id
) {

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
        "અરજી મળી નથી."
      );

      return;
    }


    const data =
      snap.data();


    const propertyData =
      data.propertyData ||
      {};


    const applicationNo =
      data.applicationNo ||
      "-";


    const name =
      propertyData.applicantName ||
      data.name ||
      "-";


    const mobile =
      propertyData.mobile ||
      data.mobile ||
      "-";


    const propertyNo =
      propertyData.propertyNo ||
      "-";


    const service =
      serviceNames[data.service] ||
      data.service ||
      "-";


    const status =
      data.status ||
      "Pending";


    let statusText =
      "🟡 Pending";

    let statusColor =
      "#f59e0b";


    if (
      status === "Approved"
    ) {

      statusText =
        "🟢 Approved";

      statusColor =
        "#16a34a";

    }


    if (
      status === "Rejected"
    ) {

      statusText =
        "🔴 Rejected";

      statusColor =
        "#dc2626";

    }


    /*=====================================
      HISTORY
    =====================================*/

    let historyHtml = `
      <div
        style="
          padding:12px;
          background:#f8fafc;
          border-radius:10px;
          color:#777;
        "
      >
        📜 હજુ કોઈ Status History નથી.
      </div>
    `;


    try {

      const historySnap =
        await getDocs(
          collection(
            db,
            "applications",
            id,
            "history"
          )
        );


      const history = [];


      historySnap.forEach(
        historyDoc => {

          history.push(
            historyDoc.data()
          );

        }
      );


      history.sort(
        (a, b) => {

          const aTime =
            a.createdAt?.toMillis
              ? a.createdAt.toMillis()
              : 0;


          const bTime =
            b.createdAt?.toMillis
              ? b.createdAt.toMillis()
              : 0;


          return bTime - aTime;

        }
      );


      if (
        history.length > 0
      ) {

        historyHtml = "";


        history.forEach(
          item => {

            const hStatus =
              item.status ||
              "Pending";


            let icon =
              "🟡";

            let color =
              "#f59e0b";


            if (
              hStatus === "Approved"
            ) {

              icon =
                "🟢";

              color =
                "#16a34a";

            }


            if (
              hStatus === "Rejected"
            ) {

              icon =
                "🔴";

              color =
                "#dc2626";

            }


            const date =
              featureDate(
                item.createdAt
              );


            historyHtml += `
              <div
                style="
                  padding:10px;
                  margin:8px 0;
                  background:#fff;
                  border:1px solid #e5e7eb;
                  border-radius:8px;
                "
              >

                <b
                  style="
                    color:${color};
                  "
                >
                  ${icon} ${hStatus}
                </b>

                <br>

                <small>
                  ${date}
                </small>

                ${
                  item.rejectionReason
                    ? `<br>કારણ: ${item.rejectionReason}`
                    : ""
                }

              </div>
            `;

          }
        );

      }


    } catch (
      historyError
    ) {

      console.error(
        "Application History Error:",
        historyError
      );

    }


    /*=====================================
      MODAL
    =====================================*/

    const oldModal =
      document.getElementById(
        "gpApplicationFeatureModal"
      );

    oldModal?.remove();


    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "gpApplicationFeatureModal";


    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.55);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:15px;
      box-sizing:border-box;
    `;


    modal.innerHTML = `

      <div
        style="
          width:100%;
          max-width:620px;
          max-height:90vh;
          overflow:auto;
          background:#fff;
          border-radius:14px;
          padding:18px;
          box-sizing:border-box;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
          "
        >

          <h2
            style="margin:0;"
          >
            📄 અરજી વિગત
          </h2>


          <button
            type="button"
            id="gpFeatureCloseBtn"
            style="
              font-size:20px;
              border:0;
              background:#eee;
              border-radius:8px;
              padding:6px 10px;
            "
          >
            ✕
          </button>

        </div>


        <hr>


        <div
          style="
            line-height:1.8;
          "
        >

          <b>અરજી નંબર:</b>
          ${applicationNo}

          <br>

          <b>નામ:</b>
          ${name}

          <br>

          <b>મોબાઇલ:</b>
          ${mobile}

          <br>

          <b>સેવા:</b>
          ${service}

          <br>

          <b>મિલકત નંબર:</b>
          ${propertyNo}

          <br>

          <b>સ્થિતિ:</b>

          <span
            style="
              color:${statusColor};
              font-weight:bold;
            "
          >
            ${statusText}
          </span>

        </div>


        <h3>
          📜 Status History
        </h3>


        <div>
          ${historyHtml}
        </div>


        <div
          style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin-top:15px;
          "
        >

          <button
            type="button"
            id="gpFeatureApproveBtn"
            style="
              padding:10px 14px;
            "
          >
            ✅ Approve
          </button>


          <button
            type="button"
            id="gpFeatureRejectBtn"
            style="
              padding:10px 14px;
            "
          >
            ❌ Reject
          </button>


          <button
            type="button"
            id="gpFeatureCloseBtn2"
            style="
              padding:10px 14px;
            "
          >
            બંધ કરો
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    document
      .getElementById(
        "gpFeatureCloseBtn"
      )
      ?.addEventListener(
        "click",
        closeApplicationFeatureModal
      );


    document
      .getElementById(
        "gpFeatureCloseBtn2"
      )
      ?.addEventListener(
        "click",
        closeApplicationFeatureModal
      );


    document
      .getElementById(
        "gpFeatureApproveBtn"
      )
      ?.addEventListener(
        "click",
        () =>
          featureUpdateApplicationStatus(
            id,
            "Approved"
          )
      );


    document
      .getElementById(
        "gpFeatureRejectBtn"
      )
      ?.addEventListener(
        "click",
        () =>
          featureUpdateApplicationStatus(
            id,
            "Rejected"
          )
      );


  } catch (error) {

    console.error(
      "Application View Error:",
      error
    );

    alert(
      "❌ અરજી ખોલવામાં ભૂલ:\n" +
      error.message
    );

  }

}


/*=========================================
  GLOBAL CONNECTION
=========================================*/

window.gpFeatureViewApplication =
  featureViewApplication;


window.gpFeatureUpdateApplicationStatus =
  featureUpdateApplicationStatus;


window.closeApplicationFeatureModal =
  closeApplicationFeatureModal;


console.log(
  "✅ admin-features.js loaded successfully"
);