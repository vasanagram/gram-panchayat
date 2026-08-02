import { db } from "./firebase-config.js";

import {
collection,
doc,
setDoc,
getDocs,
deleteDoc,
serverTimestamp,
writeBatch
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

const btn = document.getElementById("importTaxPdf");

if (btn) {
    btn.addEventListener("click", importPropertyTaxPdf);
}

async function importPropertyTaxPdf(){

const files=document.getElementById("taxPdfFiles").files;

if(!files.length){

alert("PDF પસંદ કરો");

return;

}

const progress=document.getElementById("importProgress");

const result=document.getElementById("importResult");

progress.innerHTML="જૂનો Data Delete થઈ રહ્યો છે...";

result.innerHTML="";

const propertySnap=await getDocs(collection(db,"propertyTax"));

let batch=writeBatch(db);

let count=0;

for(const d of propertySnap.docs){

batch.delete(d.ref);

count++;

if(count==400){

await batch.commit();

batch=writeBatch(db);

count=0;

}

}

await batch.commit();

const paymentSnap=await getDocs(collection(db,"taxPayments"));

batch=writeBatch(db);

count=0;

for(const d of paymentSnap.docs){

batch.delete(d.ref);

count++;

if(count==400){

await batch.commit();

batch=writeBatch(db);

count=0;

}

}

await batch.commit();

progress.innerHTML="PDF વાંચી રહ્યા છીએ...";

let propertyList = [];

function parseRow(line){
console.log("---------------");
console.log(line);
console.log("---------------");

    line = line.replace(/\s+/g," ").trim();

const match = line.match(
    /^(\d+\/?\d*)\s+(\d+\/?\d*)\s+(.+?)\s+(\d+)$/
);

if (!match) return;

const propertyNo = match[1];
const houseNo = match[2];
const ownerName = match[3].trim();
const amount = Number(match[4]);

const usage = "";

    if(isNaN(amount)) return;

    propertyList.push({

        propertyNo,

        houseNo,

        ownerName,

        fatherName:"",

        ward:"",

        mobile:"",

        address:"",

        usage,

        taxAmount:amount,

        taxYear:"2026-27",

        paid:false,

        paidDate:"",

        receiptNo:"",

        createdAt:serverTimestamp(),

        updatedAt:serverTimestamp()

    });

}

for (const file of files) {

    progress.innerHTML = "Reading : " + file.name;

    const pdf = await pdfjsLib.getDocument({
        data: await file.arrayBuffer()
    }).promise;

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {

        progress.innerHTML =
            file.name +
            "<br>Page " +
            pageNo +
            " / " +
            pdf.numPages;

        const page = await pdf.getPage(pageNo);

        const text = await page.getTextContent();

        const rows = {};

        text.items.forEach(item => {

            const y = Math.round(item.transform[5]);

            if (!rows[y]) rows[y] = [];

            rows[y].push({
                x: item.transform[4],
                text: item.str.trim()
            });

        });

        const sorted = Object.keys(rows)
            .sort((a,b)=>b-a);

const lines = [];

for (const y of sorted) {

    const rowText = rows[y]
        .map(c => c.text)
        .join(" ");

    if (
        rowText.includes("Print Date") ||
        rowText.includes("page") ||
        rowText.includes("VASANA CHAUDHARY") ||
        rowText.includes("Dahegam") ||
        rowText.includes("GANDHINAGAR")
    ) {
        continue;
    }

    const line = rows[y]
        .sort((a, b) => a.x - b.x)
        .map(c => c.text.trim())
        .filter(Boolean)
        .join(" ");

    if (line !== "") {
        lines.push(line);
    }

}

let current = "";

for (const line of lines) {

    // નવો Record શરૂ થાય
    if (/^\d+(\/\d+)?\s+\d+(\/\d+)?/.test(line)) {

        if (current) {
            parseRow(current);
        }

        current = line;

    } else {

        // ગામના Header/Footer Skip
        if (
            line.includes("Print Date") ||
            line.includes("page") ||
            line.includes("VASANA CHAUDHARY") ||
            line.includes("Dahegam") ||
            line.includes("GANDHINAGAR")
        ) {
            continue;
        }

        current += " " + line;

    }

}

if (current) {
    parseRow(current);
}

progress.innerHTML =
"Firestore માં Save થઈ રહ્યું છે...";

batch = writeBatch(db);

count = 0;

let imported = 0;

for (const item of propertyList) {

    const ref = doc(
        db,
        "propertyTax",
        item.propertyNo
    );

    batch.set(ref, item);

    imported++;

    count++;

    if (count >= 400) {

        await batch.commit();

        batch = writeBatch(db);

        count = 0;

        progress.innerHTML =
        "Import : " +
        imported +
        " Record";

    }

}

if (count > 0) {

    await batch.commit();

}

progress.innerHTML =
"✅ Import Complete";

result.innerHTML = `
<div style="
padding:20px;
background:#e8f5e9;
border:2px solid green;
border-radius:10px;
">

<h2>✅ Property Tax Import Complete</h2>

<p><b>Total Record :</b> ${propertyList.length}</p>

<p><b>Imported :</b> ${imported}</p>

<p><b>Tax Year :</b> 2026-27</p>

</div>
`;

}
