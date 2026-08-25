import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


/* =========================================================
   ADMIN REAL-TIME NOTIFICATIONS
========================================================= */

let pendingTaxPayments = 0;
let pendingApplications = 0;


/* =========================================================
   UPDATE TOTAL BADGE
========================================================= */

function updateNotificationBadge() {

  const badge =
    document.getElementById("notificationBadge");

  if (!badge) return;

  const total =
    pendingTaxPayments +
    pendingApplications;

  if (total > 0) {

    badge.textContent = total;
    badge.style.display = "inline-flex";

  } else {

    badge.style.display = "none";

  }

}


/* =========================================================
   PENDING TAX PAYMENTS
========================================================= */

const paymentQuery = query(
  collection(db, "taxPayments"),
  where("status", "==", "Pending")
);


onSnapshot(
  paymentQuery,

  (snapshot) => {

    pendingTaxPayments =
      snapshot.size;

    updateNotificationBadge();

    console.log(
      "🔔 Pending Tax Payments:",
      pendingTaxPayments
    );

  },

  (error) => {

    console.error(
      "❌ Tax Notification Error:",
      error
    );

  }
);


/* =========================================================
   PENDING APPLICATIONS
========================================================= */

const applicationQuery = query(
  collection(db, "applications"),
  where("status", "==", "Pending")
);


onSnapshot(
  applicationQuery,

  (snapshot) => {

    pendingApplications =
      snapshot.size;

    updateNotificationBadge();

    console.log(
      "🔔 Pending Applications:",
      pendingApplications
    );

  },

  (error) => {

    console.error(
      "❌ Application Notification Error:",
      error
    );

  }
);


/* =========================================================
   SYSTEM LOADED
========================================================= */

console.log(
  "✅ Admin Notification System Loaded"
);