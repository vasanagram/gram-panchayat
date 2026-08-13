import { db } from "./firebase-config.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const paymentId = params.get("id");

loadReceipt();

async function loadReceipt(){

  const paymentSnap = await getDoc(
    doc(db,"taxPayments",paymentId)
  );

  if(!paymentSnap.exists()){
    document.body.innerHTML="<h2>Receipt Not Found</h2>";
    return;
  }

  const payment = paymentSnap.data();

  const propertySnap = await getDocs(
    query(
      collection(db,"propertyTax"),
      where("propertyNo","==",payment.propertyNo)
    )
  );

  if(propertySnap.empty){
    document.body.innerHTML="<h2>Property Not Found</h2>";
    return;
  }

  const property = propertySnap.docs[0].data();
console.log(property);
  const settingsSnap = await getDoc(
    doc(db,"website","settings")
  );

  const settings =
    settingsSnap.exists()
      ? settingsSnap.data()
      : {};
      
      const receipt = document.getElementById("receipt");

receipt.innerHTML = `
<div class="watermark">
APPROVED
</div>
<div class="receipt">

<div class="header">

<img
class="logo"
src="${settings.logo || ''}">

<div class="title">

<div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;gap:15px;">

<div style="flex:1;">

<h2>${settings.websiteName || "વાસણા ચૌધરી ગ્રામ પંચાયત"}</h2>

<h3>મિલકત વેરા ચુકવણી રસીદ</h3>

<p>તા. દહેગામ, જી. ગાંધીનગર</p>

</div>

<div style="width:110px;text-align:right;font-size:12px;padding-right:8px;flex-shrink:0;">

<b>Receipt Type</b><br>

Property Tax

<br><br>

<b>Date</b><br>

${
payment.createdAt?.seconds
? new Date(payment.createdAt.seconds * 1000).toLocaleDateString("en-GB")
: "-"
}

</div>

</div>

</div>

</div>

<table>

<tr>
<td>રસીદ નંબર</td>
<td>GP/${property.taxYear}/${property.propertyNo}/${paymentId.substring(0,4).toUpperCase()}</td>
</tr>

<tr>
<td>ચકાસણી ID</td>
<td>VERIFY-${paymentId.substring(0,10).toUpperCase()}</td>
</tr>

<tr>
<td>માલિકનું નામ</td>
<td>${property.ownerName}</td>
</tr>

<tr>
<td>મિલકત નંબર</td>
<td>${property.propertyNo}</td>
</tr>

<tr>
<td>ઘર નંબર</td>
<td>${property.houseNo}</td>
</tr>

<tr>
<td>મોબાઇલ નંબર</td>
<td>${property.ownerMobile || property.mobile || property.phone || "-"}</td>
</tr>

<tr>
<td>વેરા વર્ષ</td>
<td>${property.taxYear}</td>
</tr>

<tr>
<td>વેરાની રકમ</td>
<td>₹ ${property.taxAmount}</td>
</tr>

<tr>
<td>UTR નંબર</td>
<td>${payment.utr || "-"}</td>
</tr>

<tr>
<td>ચુકવણી સ્થિતિ</td>
<td>${payment.status}</td>
</tr>

</table>

<br>

<div style="
font-size:20px;
font-weight:bold;
color:#0b7c4a;
text-align:right;
">

કુલ ભરેલ વેરો :
₹ ${property.taxAmount}

</div>

<br>

<div style="display:flex;justify-content:space-between;align-items:flex-start;">

<div>

<div style="
display:inline-block;
padding:8px 18px;
background:${
payment.status==="Approved"
? "#28a745"
: payment.status==="Rejected"
? "#dc3545"
: "#ffc107"
};
color:white;
font-weight:bold;
border-radius:25px;
font-size:18px;
">

${payment.status}

</div>

<p>
ચુકવણી તારીખ :
${
payment.createdAt?.seconds
? new Date(payment.createdAt.seconds * 1000).toLocaleDateString("en-GB")
: "-"
}

</p>

<p>
ચુકવણી રીત : UPI
</p>

</div>

<div class="qr-box">
<img
src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/verify.html?id=${paymentId}`)}"
width="130"
height="130">

<p style="margin-top:6px;font-size:14px;font-weight:bold;">
Scan to Verify
</p>

<p style="font-size:11px;color:#666;">
VERIFY-${paymentId.substring(0,10).toUpperCase()}
</p>

</div>

</div>

<br>

<div class="footer">

<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;">

<div style="text-align:center;width:30%;">

_________________<br><br>

<b>સરપંચશ્રી</b><br>

વાસણા ચૌધરી ગ્રામ પંચાયત

</div>

<div style="text-align:center;width:40%;">

${
settings.stampImage
? `<img
class="seal"
src="${settings.stampImage}"
style="width:120px;height:120px;">`
: ""
}

</div>

<div style="text-align:center;width:30%;">

_________________<br><br>

<b>તલાટીશ્રી</b><br>

વાસણા ચૌધરી ગ્રામ પંચાયત

</div>

</div>

<hr>

<div style="
font-size:12px;
text-align:center;
color:#666;
">

આ રસીદ ગ્રામ પંચાયત સિસ્ટમ દ્વારા જનરેટ કરવામાં આવી છે.

<br>

Generated On :
${new Date().toLocaleString("en-GB")}

</div>


<div class="button-area">

<button
class="print-btn"
onclick="window.print()"
style="
background:#0b7c4a;
color:white;
padding:12px 25px;
border:none;
border-radius:6px;
cursor:pointer;
font-size:16px;
">

🖨️ Print Receipt

</button>

<button
class="pdf-btn"
onclick="downloadPDF()"
style="
margin-left:10px;
background:#1565c0;
color:white;
padding:12px 25px;
border:none;
border-radius:6px;
cursor:pointer;
font-size:16px;
">

📄 Download PDF

</button>

</div>

</div>

`;

window.downloadPDF = function () {

  const element = document.querySelector(".receipt");

  const opt = {
    margin: 5,
    filename: `Tax_Receipt_${property.propertyNo}.pdf`,
    image: {
      type: "jpeg",
      quality: 1
    },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"]
    }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save();

};

}