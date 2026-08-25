import { db, auth } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =========================================================
   ADMIN ACTIVITY LOG
========================================================= */

const LOG_COLLECTION = "activityLogs";

const actionNames = {
  view: "અરજી View",
  approve: "અરજી Approve",
  reject: "અરજી Reject",
  delete: "અરજી Delete",

  taxApprove: "Tax Payment Approve",
  taxReject: "Tax Payment Reject",
  taxDelete: "Tax Payment Delete",

  propertyEdit: "Property Edit",
  propertyDelete: "Property Delete",

  logout: "Admin Logout"
};

const serviceNames = {
  birth: "જન્મ પ્રમાણપત્ર",
  death: "મૃત્યુ પ્રમાણપત્ર",
  income: "આવક દાખલો",
  residence: "રહેઠાણ દાખલો",
  property: "મિલકત આકારણી",
  complaint: "ફરિયાદ"
};


/* =========================================================
   SAFE TEXT
========================================================= */

function esc(value) {

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

    if (value?.toDate) {

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


/* =========================================================
   CURRENT ADMIN
========================================================= */

function currentAdmin() {

  const user =
    auth.currentUser;

  return {

    uid:
      user?.uid || "",

    email:
      user?.email || "Admin"

  };

}


/* =========================================================
   SAVE ACTIVITY
========================================================= */

async function saveActivityLog({

  action,

  targetId = "",

  service = "",

  targetName = "",

  details = ""

}) {

  try {

    const admin =
      currentAdmin();

    await addDoc(

      collection(
        db,
        LOG_COLLECTION
      ),

      {

        action,

        actionName:
          actionNames[action] || action,

        targetId,

        service,

        serviceName:
          serviceNames[service] || service,

        targetName,

        details,

        adminUid:
          admin.uid,

        adminEmail:
          admin.email,

        createdAt:
          serverTimestamp()

      }

    );

    console.log(
      "✅ Activity Log Saved:",
      action
    );

  } catch (error) {

    /*
      Activity Log fail થાય તો
      Main Admin Panel બંધ ન થવો જોઈએ.
    */

    console.error(
      "Activity Log Error:",
      error
    );

  }

}


/* =========================================================
   DETECT APPLICATION ACTION
========================================================= */

function detectAction(button) {

  if (!button) return null;


  /* Application buttons */

  const appAction =
    button.dataset?.appAction;

  if (appAction) {

    return {

      action:
        appAction,

      targetId:
        decodeURIComponent(
          button.dataset.id || ""
        ),

      service:
        decodeURIComponent(
          button.dataset.service || ""
        )

    };

  }


  /* Other buttons */

  const onclick =
    button.getAttribute(
      "onclick"
    ) || "";

/* APPLICATION ACTIONS */

if (onclick.includes("updateApplicationStatus")) {

  const statusMatch =
    onclick.match(
      /updateApplicationStatus\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/
    );

  if (statusMatch) {

    const appId = statusMatch[1];
    const status = statusMatch[2];

    return {
      action:
        status === "Approved"
          ? "approve"
          : "reject",

      targetId:
        appId,

      service:
        "application"
    };
  }
}


if (onclick.includes("viewApplication")) {

  const match =
    onclick.match(
      /viewApplication\(\s*['"]([^'"]+)['"]/
    );

  return {
    action: "view",
    targetId: match?.[1] || "",
    service: "application"
  };
}


if (onclick.includes("deleteApplication")) {

  const match =
    onclick.match(
      /deleteApplication\(\s*['"]([^'"]+)['"]/
    );

  return {
    action: "delete",
    targetId: match?.[1] || "",
    service: "application"
  };
}
  let id = "";

  const match =
    onclick.match(
      /['"]([^'"]+)['"]/
    );

  if (match) {

    id = match[1];

  }


  if (
    onclick.includes(
      "approvePayment"
    )
  ) {

    return {

      action:
        "taxApprove",

      targetId:
        id

    };

  }


  if (
    onclick.includes(
      "rejectTaxPaymentFixed"
    ) ||
    onclick.includes(
      "rejectPayment"
    )
  ) {

    return {

      action:
        "taxReject",

      targetId:
        id

    };

  }


  if (
    onclick.includes(
      "deletePayment"
    )
  ) {

    return {

      action:
        "taxDelete",

      targetId:
        id

    };

  }


  if (
    onclick.includes(
      "editProperty"
    )
  ) {

    return {

      action:
        "propertyEdit",

      targetId:
        id

    };

  }


  if (
    onclick.includes(
      "deleteProperty"
    )
  ) {

    return {

      action:
        "propertyDelete",

      targetId:
        id

    };

  }


  return null;

}


/* =========================================================
   CAPTURE BUTTON ACTIONS
========================================================= */

document.addEventListener(

  "click",

  async function(event) {

    const button =
      event.target.closest(
        "button"
      );

    if (!button) return;


    const detected =
      detectAction(button);

    if (!detected) return;


    await saveActivityLog(
      detected
    );

  },

  true

);


/* =========================================================
   LOGOUT
========================================================= */

document
  .getElementById(
    "logoutBtn"
  )
  ?.addEventListener(

    "click",

    async function() {

      await saveActivityLog({

        action:
          "logout",

        details:
          "Admin Panelમાંથી Logout કરવામાં આવ્યું."

      });

    },

    true

  );


/* =========================================================
   CREATE ACTIVITY LOG SECTION
========================================================= */

function createActivitySection() {

  if (
    document.getElementById(
      "activityLogSection"
    )
  ) {

    return;

  }


  const main =
    document.querySelector(
      ".admin-content"
    );

  const sidebar =
    document.querySelector(
      ".sidebar-menu"
    );


  if (!main) return;


  /* SIDEBAR MENU */

  if (
    sidebar &&
    !document.getElementById(
      "activityLogMenu"
    )
  ) {

    const li =
      document.createElement(
        "li"
      );

    li.id =
      "activityLogMenu";

    li.innerHTML = `

      <a href="#activityLogSection">

        <i class="fa fa-clock-rotate-left"></i>

        Activity Log

      </a>

    `;


    const backupItem =
      [
        ...sidebar.querySelectorAll(
          "li"
        )
      ]
      .find(
        li =>
          li.innerText
            ?.toLowerCase()
            .includes(
              "backup"
            )
      );


    if (backupItem) {

      backupItem.after(li);

    } else {

      sidebar.appendChild(li);

    }

  }


  /* SECTION */

  const section =
    document.createElement(
      "section"
    );

  section.id =
    "activityLogSection";

  section.className =
    "admin-section";


  section.innerHTML = `

    <div class="activity-header">

      <div>

        <h2>
          📜 Admin Activity Log
        </h2>

        <p>
          Admin Panelમાં થયેલી
          મહત્વની કાર્યવાહી અહીં દેખાશે.
        </p>

      </div>

      <button
        type="button"
        id="refreshActivityLog"
      >
        🔄 Refresh
      </button>

    </div>


    <div class="activity-filters">

      <input
        type="text"
        id="activitySearch"
        placeholder="🔍 Action / Email / ID શોધો..."
      >


      <select
        id="activityActionFilter"
      >

        <option value="">
          બધી કાર્યવાહી
        </option>

        <option value="view">
          View
        </option>

        <option value="approve">
          Approve
        </option>

        <option value="reject">
          Reject
        </option>

        <option value="delete">
          Delete
        </option>

        <option value="taxApprove">
          Tax Approve
        </option>

        <option value="taxReject">
          Tax Reject
        </option>

        <option value="taxDelete">
          Tax Delete
        </option>

        <option value="propertyEdit">
          Property Edit
        </option>

        <option value="propertyDelete">
          Property Delete
        </option>

        <option value="logout">
          Logout
        </option>

      </select>

    </div>


    <div
      id="activityLogStatus"
      style="margin-bottom:10px;font-weight:bold;"
    ></div>


    <div
      id="activityLogList"
    >
      ⏳ Activity Log લોડ થઈ રહ્યો છે...
    </div>

  `;


  main.appendChild(
    section
  );


  /* STYLE */

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "activityLogStyle";


  style.textContent = `

    #activityLogSection {
      margin-top:25px;
    }

    .activity-header {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:15px;
      margin-bottom:15px;
    }

    .activity-header h2 {
      margin:0 0 5px;
    }

    .activity-header p {
      margin:0;
      color:#777;
    }

    .activity-header button {
      border:0;
      border-radius:8px;
      padding:10px 15px;
      background:#1769d1;
      color:white;
      font-weight:bold;
      cursor:pointer;
    }

    .activity-filters {
      display:grid;
      grid-template-columns:1fr 220px;
      gap:10px;
      margin-bottom:15px;
    }

    .activity-filters input,
    .activity-filters select {
      width:100%;
      padding:11px;
      border:1px solid #ddd;
      border-radius:8px;
      font-size:14px;
      box-sizing:border-box;
    }

    .activity-item {
      background:white;
      border:1px solid #e2e2e2;
      border-radius:10px;
      padding:13px;
      margin-bottom:10px;
      box-shadow:0 2px 6px rgba(0,0,0,.04);
    }

    .activity-top {
      display:flex;
      justify-content:space-between;
      gap:10px;
      align-items:center;
    }

    .activity-action {
      font-weight:800;
      font-size:15px;
    }

    .activity-date {
      color:#777;
      font-size:12px;
    }

    .activity-info {
      margin-top:7px;
      font-size:13px;
      line-height:1.7;
    }

    .activity-badge {
      display:inline-block;
      padding:3px 8px;
      border-radius:20px;
      background:#eef5ff;
      margin-right:5px;
      font-size:12px;
    }

    @media(max-width:650px) {

      .activity-header {
        flex-direction:column;
        align-items:stretch;
      }

      .activity-filters {
        grid-template-columns:1fr;
      }

      .activity-top {
        flex-direction:column;
        align-items:flex-start;
      }

    }

  `;


  document.head.appendChild(
    style
  );


  document
    .getElementById(
      "refreshActivityLog"
    )
    ?.addEventListener(
      "click",
      loadActivityLogs
    );


  document
    .getElementById(
      "activitySearch"
    )
    ?.addEventListener(
      "input",
      loadActivityLogs
    );


  document
    .getElementById(
      "activityActionFilter"
    )
    ?.addEventListener(
      "change",
      loadActivityLogs
    );

}


/* =========================================================
   LOAD LOGS
========================================================= */

async function loadActivityLogs() {

  const list =
    document.getElementById(
      "activityLogList"
    );

  const status =
    document.getElementById(
      "activityLogStatus"
    );


  if (!list) return;


  list.innerHTML =
    "⏳ Activity Log લોડ થઈ રહ્યો છે...";


  try {

    const snapshot =
      await getDocs(

        query(

          collection(
            db,
            LOG_COLLECTION
          ),

          orderBy(
            "createdAt",
            "desc"
          ),

          limit(200)

        )

      );


    const search =
      document
       .getElementById(
          "activitySearch"
        )
        ?.value
        ?.trim()
        .toLowerCase() || "";


    const actionFilter =
      document
        .getElementById(
          "activityActionFilter"
        )
        ?.value || "";


    const rows = [];


    snapshot.forEach(
      docSnap => {

        const data =
          docSnap.data();


        const searchText = `

          ${data.action || ""}
          ${data.actionName || ""}
          ${data.adminEmail || ""}
          ${data.targetId || ""}
          ${data.targetName || ""}
          ${data.serviceName || ""}
          ${data.details || ""}

        `.toLowerCase();


        if (
          search &&
          !searchText.includes(
            search
          )
        ) {

          return;

        }


        if (
          actionFilter &&
          data.action !==
            actionFilter
        ) {

          return;

        }


        rows.push(data);

      }
    );


    if (!rows.length) {

      list.innerHTML = `

        <div class="activity-item">

          📭 કોઈ Activity મળતી નથી.

        </div>

      `;

    } else {

      list.innerHTML =
        rows
          .map(
            item => `

              <div
                class="activity-item"
              >

                <div
                  class="activity-top"
                >

                  <div
                    class="activity-action"
                  >

                    ${esc(
                      item.actionName ||
                      item.action ||
                      "-"
                    )}

                  </div>


                  <div
                    class="activity-date"
                  >

                    ${esc(
                      formatDate(
                        item.createdAt
                      )
                    )}

                  </div>

                </div>


                <div
                  class="activity-info"
                >

                  <span
                    class="activity-badge"
                  >

                    👤
                    ${esc(
                      item.adminEmail ||
                      "Admin"
                    )}

                  </span>


                  ${
                    item.serviceName
                      ? `

                        <span
                          class="activity-badge"
                        >

                          📋
                          ${esc(
                            item.serviceName
                          )}

                        </span>

                      `
                      : ""
                  }


                  ${
                    item.targetId
                      ? `

                        <br>

                        🆔 ID:
                        ${esc(
                          item.targetId
                        )}

                      `
                      : ""
                  }


                  ${
                    item.details
                      ? `

                        <br>

                        📝
                        ${esc(
                          item.details
                        )}

                      `
                      : ""
                  }

                </div>

              </div>

            `
          )
          .join("");

    }


    if (status) {

      status.textContent =
        `${rows.length} Activity દેખાય છે.`;

    }


  } catch (error) {

    console.error(
      "Activity Log Load Error:",
      error
    );


    list.innerHTML = `

      <div
        class="activity-item"
      >

        ❌ Activity Log લોડ થઈ શક્યો નથી.

        <br><br>

        ${esc(
          error.message
        )}

      </div>

    `;

  }

}


/* =========================================================
   START
========================================================= */

function startActivityLog() {

  createActivitySection();

  loadActivityLogs();

  console.log(
    "✅ Admin Activity Log Loaded"
  );

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startActivityLog
  );

} else {

  startActivityLog();

}


window.loadActivityLogs =
  loadActivityLogs;