// ======================================
// PAYMENT HISTORY PAGINATION
// ======================================

let paymentHistoryMasterData = [];

let paymentHistoryData = [];

let paymentHistoryCurrentPage = 1;

const paymentHistoryRowsPerPage = 12;

let paymentHistoryFilter = "all";

let outstandingFeesData = [];

let outstandingFeesMasterData = [];

let outstandingCurrentPage = 1;

const outstandingRowsPerPage = 12;
let currentPreviousOutstandingPage = 1;
// ========================================
// PREVIOUS TERM PAGINATION
// ========================================

let previousOutstandingCurrentPage = 1;

const previousOutstandingRowsPerPage = 12;

let previousOutstandingMasterData = [];

let previousOutstandingData = [];

console.log("SCHOOL TEMPLATE JS LOADED");

let currentDepartment = "";
let currentSchoolCode = "";

// ==========================
// SUPABASE INIT
// ==========================
const supabaseUrl =
  "https://sgdrncpiqingjwxmkqij.supabase.co";

const supabaseKey =
  "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

const supabaseClient =
  supabase.createClient(
    supabaseUrl,
    supabaseKey
  );

// ==========================
// GET SCHOOL CODE
// ==========================

let schoolCode = sessionStorage.getItem("school_code");

console.log("SESSION STORAGE VALUE:", schoolCode);

// ==========================
// HARD SESSION GUARD
// ==========================
if (!schoolCode) {
  window.location.replace("index.html");
  throw new Error("No school session");
}

console.log("SCHOOL CODE LOADED:", schoolCode);

// ==========================
// HISTORY LOCK (BACK/FORWARD CONTROL)
// ==========================

history.pushState(null, null, window.location.href);

window.addEventListener("popstate", function () {
  sessionStorage.removeItem("school_code");
  sessionStorage.clear();
window.location.replace("index.html");
});


// ==========================
// GLOBAL STATE
// ==========================
let currentSubjects = [];
let optionalSelectedStudent = null;

let optionalStudentsCache = [];
// ======================================
// OPTIONAL PAYMENTS PAGINATION
// ======================================

let optionalPaymentsCurrentPage = 1;

const optionalPaymentsRowsPerPage = 12;
// ======================================
// OPTIONAL PAYMENTS
// ======================================

let optionalPaymentsMasterData = [];

let optionalPaymentsData = [];
// ==========================
// LOAD SCHOOL INFO
// ==========================
async function loadSchoolInfo() {

  const { data, error } =
    await supabaseClient
      .from("schools")
      .select("*")
      .eq("school_code", schoolCode)
      .single();
  
  console.log("SCHOOL RECORD:", data);
  
  if (error || !data) {
    console.error(error);
    alert("School not found");
    return;
  }
  
  currentDepartment = data.department;
  currentSchoolCode = data.school_code;


  document.getElementById("schoolName").textContent = data.School_name;
  document.title =
  data.School_name;

  const schoolLogo = document.getElementById("schoolLogo");
  if (schoolLogo && data.logo_url) schoolLogo.src = data.logo_url;

  const emailEl = document.getElementById("schoolEmail");
if (emailEl && data.contact_email)
  emailEl.innerHTML =
    "<strong>E-mail:</strong> " + data.contact_email;

const phoneEl = document.getElementById("schoolPhone");
if (phoneEl && data.phone)
  phoneEl.innerHTML =
    "<strong>Phone:</strong> " + data.phone;

  if (data.primary_color)
    document.documentElement.style.setProperty("--primary-color", data.primary_color);

  if (data.secondary_color)
    document.documentElement.style.setProperty("--secondary-color", data.secondary_color);
}

// ==========================
// LOAD SUBJECTS
// ==========================
async function loadSubjects(department, isAdmin = false) {

  console.log(
  "Loading subjects for department:",
  department,
  "| Admin:",
  isAdmin,
  "| School:",
  schoolCode
);

  const datalist = document.getElementById("subjectsList");

  if (!datalist) {
    console.error("subjectsList not found in DOM");
    return;
  }

  // HARD RESET (VERY IMPORTANT)
  datalist.innerHTML = "";
  currentSubjects = [];

 let query = supabaseClient
  .from("subjects")
  .select("*")
  .eq("school_code", schoolCode);

// 🔥 APPLY DEPARTMENT FILTER FOR TEACHERS ONLY
if (!isAdmin && department) {
  query = query.eq("department", department);
}

const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  console.log("SUPABASE RETURN:", data);

  if (!data || data.length === 0) {
    console.warn("NO SUBJECTS FOUND FOR:", schoolCode);
    return;
  }

  currentSubjects = data;

  currentSubjects.forEach(sub => {
    const option = document.createElement("option");
    option.value = sub.subject;
    datalist.appendChild(option);
  });
}
// ==========================
// ACCESS SUBJECT (FIXED)
// ==========================
document
  .getElementById("subjectForm")
  .addEventListener("submit", (e) => {

    e.preventDefault();

    const cadre = document.getElementById("cadre").value;
    const department = document.getElementById("department").value;
    const subject = document.getElementById("subject").value;
    const password = document.getElementById("subjectPassword").value;



console.log("CADRE:", cadre);
console.log("SUBJECT:", subject);
console.log("PASSWORD:", password);
console.log("CURRENT SUBJECTS:", currentSubjects);
console.log("TOTAL SUBJECTS:", currentSubjects.length);
  
  
  const match =
  currentSubjects.find(s => {

   if (
      cadre === "Admin"
    ) {

      const found =
        s.subject === subject &&
        s.admin_password === password;

      console.log(
        "Checking:",
        s.subject,
        s.admin_password,
        found
      );

      return found;

    }

    return (

      s.subject === subject &&

      s.subject_password === password &&

      s.department === department &&

      s.cadre === cadre

    );

  });

    if (!match) {
      alert("Invalid subject login");
      return;
    }

    window.open(match.sheet_url, "_blank");
  });

// ==========================
// CHANGE PASSWORD (FIXED POSITION)
// ==========================
document
  .getElementById("changePasswordForm")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const subject =
      document.getElementById("changeSubject").value;

    const adminPassword =
      document.getElementById("adminPassword").value;

    const newPassword =
      document.getElementById("newSubjectPassword").value;

    const match =
      currentSubjects.find(s =>
        s.subject === subject &&
        s.admin_password === adminPassword
      );

    if (!match) {
      alert("Invalid admin password");
      return;
    }

    const { error } =
      await supabaseClient
        .from("subjects")
        .update({
          subject_password: newPassword
        })
        .eq("id", match.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully");
    loadSubjects(
  departmentSelect.value,
  cadreSelect.value === "Admin"
);
  });

// ==========================
// MODALS
// ==========================
function openChangePasswordModal() {
  document.getElementById("passwordModal").style.display = "block";
}

function closeChangePasswordModal() {
  document.getElementById("passwordModal").style.display = "none";
}

function togglePassword() {
  const input = document.getElementById("subjectPassword");
  input.type = input.type === "password" ? "text" : "password";
}

function toggleChangePassword() {
  const input = document.getElementById("newSubjectPassword");
  input.type = input.type === "password" ? "text" : "password";
}

// ==========================
// INIT
// ==========================
loadSchoolInfo();
loadSubjects();

// ==========================
// CADRE / DEPARTMENT LOGIC
// ==========================
const cadreSelect = document.getElementById("cadre");
const departmentSelect = document.getElementById("department");
const subjectInput = document.getElementById("subject");

cadreSelect.addEventListener("change", () => {

  const isAdmin = cadreSelect.value === "Admin";

  departmentSelect.disabled = isAdmin;

  subjectInput.value = "";
  document.getElementById("subjectsList").innerHTML = "";

  if (isAdmin) {
    departmentSelect.value = "";
    loadSubjects(null, true);
  }

});

departmentSelect.addEventListener("change", () => {

  console.log(
    "Department selected:",
    departmentSelect.value
  );

  if (cadreSelect.value !== "Admin") {

    subjectInput.value = "";

    loadSubjects(
      departmentSelect.value,
      false
    );

  }

});

function toggleAdminPortalPassword() {

  const input =
    document.getElementById(
      "adminPortalPassword"
    );

  input.type =
    input.type === "password"
      ? "text"
      : "password";

}

const adminDashboardHTML = `
  <h2>School Administration</h2>

  <div class="admin-nav">

    <button
      class="admin-tab"
      onclick="showDrive()"
    >
      📁 School Drive
    </button>

    <button
      class="admin-tab"
      onclick="showMasterSheet()"
    >
      📊 Master Sheets
    </button>

  <button
  class="admin-tab"
  onclick="showStudentsFees()"
>
  👨‍🎓 Students & Fees
</button>

<div class="admin-dropdown">

<button class="admin-tab-btn" 
onclick="togglePaymentsMenu()">
  Payments
</button>

  
  <div
  id="paymentsDropdown"
  style="
    display:none;
    position:absolute;
    margin-top:5px;
    width:180px;
    z-index:1000;
  "
>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
loadTermFees();
"
  >
    Set Term Fees
  </button>

<button
  class="admin-btn payment-item"
  onclick="
togglePaymentsMenu();
showOptionalPaymentsSetup();
"
>
  Set Optional Payments
</button>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
loadAllPayments();
"
  >
    All Payments
  </button>

<button
  class="admin-btn payment-item"
  onclick="
togglePaymentsMenu();
showAllOptionalPayments();
"
>
  All Optional Payments
</button>

  <button
    class="admin-btn payment-item"
   onclick="
togglePaymentsMenu();
loadPaymentHistory();
"
  >
    Payment History
  </button>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
loadOutstandingPayments();
"
  >
    Current Term Outstanding Fees
  </button>
  
  <button
  class="admin-btn payment-item"
  onclick="
    document.getElementById('paymentsDropdown').style.display='none';
	
    showPreviousOutstandingFees();
  "
>
  Previous Term Outstanding Fees
</button>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
clearCurrentTermPayments();
"
  >
    Clear Payments
  </button>
  
  <button
  class="admin-btn payment-item restore-btn"
  onclick="
togglePaymentsMenu();
restoreLastRollover();
"
>
  Restore Last Cleared Payments
</button>

</div>
</div>
    <button
      class="admin-tab"
      onclick="adminLogout()"
    >
      🚪 Logout
    </button>

  </div>

  <div
    id="adminContent"
    class="admin-content"
  >

    <h3>
      Welcome
    </h3>

    <p>
      Welcome to the School Administration Portal.
    </p>

    <p>
      Select an option from the menu above.
    </p>

  </div>
`;

document
  .getElementById("openAdminPortal")
  .addEventListener(
    "click",
    async function () {

      const password =
        document.getElementById(
          "adminPortalPassword"
        ).value.trim();

      if (!password) {

        alert(
          "Please enter Admin Password."
        );

        return;

      }

      const {
        data,
        error
      } =
        await supabaseClient
          .from("subjects")
          .select(
            "admin_password"
          )
          .eq(
            "school_code",
            schoolCode
          );

      if (error) {

        alert(
          error.message
        );

        return;

      }

      const valid =
        data.some(
          row =>
            row.admin_password === password
        );

      if (!valid) {

        alert(
          "Invalid Admin Password"
        );

        return;

      }

      const teacherCard =
document.getElementById(
"teacherCard"
);

const adminCard =
document.getElementById(
"adminCard"
);

teacherCard.classList.add(
"hide-teacher"
);

adminCard.classList.add(
"expand-admin"
);

setTimeout(()=>{

adminCard.innerHTML =
adminDashboardHTML;

},450);

    }
  );

async function showOptionalPaymentsSetup(){

const {

data,

error

} = await supabaseClient

.from("set_optional_payments")

.select("*")

.eq(

"school_code",

schoolCode

)

.order(

"item"

);

if(error){

alert(error.message);

return;

}

renderOptionalPaymentsSetup(data);

}

function renderOptionalPaymentsSetup(data){

let html = `

<h3>

💰 Set Optional Payments

</h3>

<div class="payment-quick-filters">

<button

class="admin-btn"

onclick="openAddOptionalPaymentModal()"

>

➕ Add Item

</button>

<button

class="admin-btn"

onclick="removeSelectedOptionalItems()"

>

➖ Remove Item

</button>

</div>

<table class="admin-table">

<thead>

<tr>

<th></th>

<th>Item</th>

<th>Fee</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

data.forEach(row=>{

html += `

<tr>

<td>

<input

type="checkbox"

class="optionalItemCheck"

value="${row.id}"

>

</td>

<td>

${row.item}

</td>

<td>

₦${Number(row.fee).toLocaleString()}

</td>

<td>

<button
class="admin-btn"
onclick="editOptionalItem(
'${row.id}',
'${row.item}',
${row.fee}
)"
>
✏ Edit
</button>

</td>

</tr>

`;

});

html += `

</tbody>

</table>

<br>

<div
style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;"
>

<button

class="admin-btn"

style="background:green;color:white;"

onclick="openOptionalPaymentModal()"

>

Make Payment

</button>

<button

class="admin-btn"

style="background:#b30000;color:white;"

onclick="endTermOptionalPayments()"

>

End Of Term

</button>

</div>

`;

document.getElementById(

"adminContent"

).innerHTML = html;

}

function optionalItemChanged(){

const dropdown =

document.getElementById(
"optionalPaymentItem"
);

const option =

dropdown.options[
dropdown.selectedIndex
];

const fee =

option.dataset.fee || 0;

document.getElementById(
"optionalPaymentFee"
).value =

Number(fee).toLocaleString();

}

async function openOptionalPaymentModal(){

document.getElementById(
"optionalPaymentModal"
).style.display="flex";

optionalSelectedStudent = null;

await loadOptionalPaymentItems();

await loadOptionalStudents();

}

function searchOptionalStudents(){

const keyword =

document.getElementById(
"optionalStudentSearch"
).value
.toLowerCase()
.trim();

const resultsDiv =

document.getElementById(
"optionalStudentResults"
);

resultsDiv.innerHTML = "";

if(keyword.length < 2){

return;

}

const matches =

optionalStudentsCache.filter(student=>{

return(

student.student_name

.toLowerCase()

.includes(keyword)

||

student.reg_no

.toLowerCase()

.includes(keyword)

);

});

matches.slice(0,10).forEach(student=>{

const div =

document.createElement("div");

div.className =

"student-result-item";

div.innerHTML =

`${student.student_name}

(${student.reg_no})`;

div.onclick = ()=>{

selectOptionalStudent(student);

};

resultsDiv.appendChild(div);

});

}

function selectOptionalStudent(student){

optionalSelectedStudent = student;

document.getElementById(
"optionalStudentSearch"
).value =
student.student_name;

document.getElementById(
"optionalStudentClass"
).value =
student.class;

document.getElementById(
"optionalStudentResults"
).innerHTML = "";

}

async function removeSelectedOptionalItems(){

const checked =

[...

document.querySelectorAll(

".optionalItemCheck:checked"

)

].map(

box=>box.value

);

if(

checked.length===0

){

alert(

"Select item(s) first."

);

return;

}

const proceed = confirm(

`Remove ${checked.length} selected item(s)?`

);

if(!proceed)

return;

const {

error

} = await supabaseClient

.from(

"set_optional_payments"

)

.delete()

.in(

"id",

checked

);

if(error){

alert(error.message);

return;

}

showOptionalPaymentsSetup();

}

function openAddOptionalPaymentModal(){

document
.getElementById(
"optionalItemModal"
)
.classList.add(
"show"
);

document.getElementById(
"optionalItemName"
).value="";

document.getElementById(
"optionalItemFee"
).value="";

}

function closeOptionalItemModal(){

document.getElementById(
"optionalItemModal"
).style.display =
"none";

document.getElementById(
"optionalItemId"
).value = "";

document.getElementById(
"optionalItemName"
).value = "";

document.getElementById(
"optionalItemFee"
).value = "";

document.getElementById(
"optionalItemModalTitle"
).innerText =
"Add Optional Payment Item";

}

async function loadOptionalPaymentItems(){

const {

data,
error

} = await supabaseClient

.from("set_optional_payments")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"item"
);

if(error){

alert(error.message);

return;

}

const dropdown =

document.getElementById(
"optionalPaymentItem"
);

dropdown.innerHTML =

`<option value="">
Select Item
</option>`;

data.forEach(row=>{

dropdown.innerHTML += `

<option

value="${row.id}"

data-fee="${row.fee}"

>

${row.item}

</option>

`;

});

}

async function loadOptionalStudents(){

const {

data,
error

} = await supabaseClient

.from("students")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"student_name"
);

if(error){

console.error(error);

return;

}

optionalStudentsCache = data || [];

}

async function showAllOptionalPayments(){

const {

data: items,

error: itemError

} = await supabaseClient

.from("set_optional_payments")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"item"
);

if(itemError){

alert(itemError.message);

return;

}

let cardsHTML = "";

items.forEach(item=>{

cardsHTML += `

<div class="optional-card">

    <div class="optional-card-title">

        ${item.item}

    </div>

    <div
        class="optional-card-count"
        id="count-${item.id}"
    >

        0 Students

    </div>

    <div
        class="optional-card-amount"
        id="amount-${item.id}"
    >

        ₦0

    </div>

</div>

`;
});

document.getElementById("adminContent").innerHTML = `

<div class="optional-dashboard">

    <div class="optional-dashboard-header">

        <h2 class="optional-title">
            📋 All Optional Payments
        </h2>

    </div>

    <div class="optional-cards-wrapper">

        ${cardsHTML}

    </div>

   <div class="optional-toolbar-card">

    <div class="toolbar-search">

        <input
type="text"
id="optionalSearch"
placeholder="🔍 Search Student..."
oninput="filterOptionalPayments()"
>

    </div>

    <div class="toolbar-filters">

       <select
id="optionalDepartmentFilter"
onchange="filterOptionalPayments()">
    <option value="">🏫 Department</option>
</select>

<select
id="optionalClassFilter"
onchange="filterOptionalPayments()">
    <option value="">🎓 Class</option>
</select>

<select
id="optionalItemFilter"
onchange="filterOptionalPayments()">
    <option value="">📦 Item</option>
</select>

<select
id="optionalStatusFilter"
onchange="filterOptionalPayments()">
    <option value="">⚑ Status</option>
    <option value="Paid">Paid</option>
    <option value="Partial">Partial</option>
</select>
    </div>

    <div class="toolbar-buttons">

        <button
            class="refresh-btn"
            onclick="refreshOptionalPayments()">

            🔄 Refresh

        </button>

        <button
            class="print-btn"
            onclick="window.print()">

            🖨 Print

        </button>

    </div>

</div>
    <div
        id="optionalPaymentsTableContainer"
        class="optional-table-card"
    >

        Loading...

    </div>

</div>

`;

await loadAllOptionalPayments();

}

async function loadAllOptionalPayments(){

const {
data,
error
} = await supabaseClient

.from("optional_payments")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"created_at",
{
ascending:false
}
);

if(error){

document.getElementById(
"optionalPaymentsTableContainer"
).innerHTML =
error.message;

return;

}

// Store master data
optionalPaymentsMasterData =
data || [];

// Working copy
optionalPaymentsData =
[...optionalPaymentsMasterData];

// Build dropdown filters
populateOptionalFilters();

// Reset to first page
optionalPaymentsCurrentPage = 1;

// Render table
renderOptionalPaymentsTable();

// Update summary cards
updateOptionalCards(
optionalPaymentsData
);

}

async function refreshOptionalPayments(){

document.getElementById(
"optionalSearch"
).value = "";

document.getElementById(
"optionalDepartmentFilter"
).value = "";

document.getElementById(
"optionalClassFilter"
).value = "";

document.getElementById(
"optionalItemFilter"
).value = "";

document.getElementById(
"optionalStatusFilter"
).value = "";

await loadAllOptionalPayments();

}

async function endTermOptionalPayments(){

const confirmReset = confirm(

`⚠ END OF TERM WARNING

This will permanently delete ALL Optional Payment records for this term.

Before continuing, ensure that:

• All outstanding optional payments have been collected OR

• You have printed/exported the Outstanding Payments List.

This action CANNOT be undone.

Do you want to continue?`

);

if(!confirmReset){

return;

}

const {

error

} = await supabaseClient

.from("optional_payments")

.delete()

.eq(
"school_code",
currentSchoolCode
);

if(error){

alert(error.message);

return;

}

alert(

"✅ End of Term completed successfully. All Optional Payment records have been cleared."

);

// Refresh dashboard
await loadAllOptionalPayments();

}

function filterOptionalPayments(){

const search =

document.getElementById(
"optionalSearch"
).value
.toLowerCase()
.trim();

const department =

document.getElementById(
"optionalDepartmentFilter"
).value;

const className =

document.getElementById(
"optionalClassFilter"
).value;

const item =

document.getElementById(
"optionalItemFilter"
).value;

const status =

document.getElementById(
"optionalStatusFilter"
).value;

optionalPaymentsData =

optionalPaymentsMasterData.filter(row=>{

const matchSearch =

search==="" ||

row.student_name
.toLowerCase()
.includes(search)

||

row.reg_no
.toLowerCase()
.includes(search);

const matchDepartment =

department===""

||

row.department===department;

const matchClass =

className===""

||

row.class_name===className;

const matchItem =

item===""

||

row.item===item;

const matchStatus =

status===""

||

row.status===status;

return(

matchSearch

&&

matchDepartment

&&

matchClass

&&

matchItem

&&

matchStatus

);

});

optionalPaymentsCurrentPage = 1;

renderOptionalPaymentsTable();

updateOptionalCards(
optionalPaymentsData
);

}

function renderOptionalPaymentsTable(){

const start =
(optionalPaymentsCurrentPage-1)*
optionalPaymentsRowsPerPage;

const end =
start+
optionalPaymentsRowsPerPage;

const pageData =
optionalPaymentsData.slice(
start,
end
);

let html = `

<table class="admin-table">

<thead>

<tr>

<th>Date</th>

<th>Time</th>

<th>Name</th>

<th>Class</th>

<th>Item</th>

<th>Fee</th>

<th>Paid</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

pageData.forEach(row=>{

const date =
new Date(row.created_at);

html += `

<tr>

<td>${date.toLocaleDateString()}</td>

<td>${date.toLocaleTimeString()}</td>

<td>${row.student_name}</td>

<td>${row.class_name}</td>

<td>${row.item}</td>

<td>₦${Number(row.original_fee).toLocaleString()}</td>

<td>₦${Number(row.amount_paid).toLocaleString()}</td>

<td>${row.status}</td>

</tr>

`;

});

html += `

</tbody>

</table>

<div class="optional-pagination">

<button

onclick="changeOptionalPage(-1)"

${optionalPaymentsCurrentPage===1?"disabled":""}

>

◀ Previous

</button>

<span>

Page ${optionalPaymentsCurrentPage}

of

${Math.max(
1,
Math.ceil(
optionalPaymentsData.length/
optionalPaymentsRowsPerPage
)
)}

</span>

<button

onclick="changeOptionalPage(1)"

${optionalPaymentsCurrentPage>=Math.ceil(optionalPaymentsData.length/optionalPaymentsRowsPerPage)?"disabled":""}

>

Next ▶

</button>

</div>

`;

document.getElementById(
"optionalPaymentsTableContainer"
).innerHTML =
html;

}

function changeOptionalPage(direction){

const totalPages =

Math.max(
1,
Math.ceil(
optionalPaymentsData.length/
optionalPaymentsRowsPerPage
)
);

optionalPaymentsCurrentPage += direction;

if(optionalPaymentsCurrentPage<1){

optionalPaymentsCurrentPage=1;

}

if(optionalPaymentsCurrentPage>totalPages){

optionalPaymentsCurrentPage=totalPages;

}

renderOptionalPaymentsTable();

}


function populateOptionalFilters(){

// =========================
// DEPARTMENT
// =========================

const departmentSelect =
document.getElementById(
"optionalDepartmentFilter"
);

const departments = [

...new Set(

optionalPaymentsMasterData

.map(r=>r.department)

.filter(Boolean)

)

].sort();

departmentSelect.innerHTML =

`<option value="">
🏫 Department
</option>`;

departments.forEach(dep=>{

departmentSelect.innerHTML +=

`<option value="${dep}">
${dep}
</option>`;

});

// =========================
// CLASS
// =========================

const classSelect =
document.getElementById(
"optionalClassFilter"
);

const classes = [

...new Set(

optionalPaymentsMasterData

.map(r=>r.class_name)

.filter(Boolean)

)

].sort();

classSelect.innerHTML =

`<option value="">
🎓 Class
</option>`;

classes.forEach(cls=>{

classSelect.innerHTML +=

`<option value="${cls}">
${cls}
</option>`;

});

// =========================
// ITEM
// =========================

const itemSelect =
document.getElementById(
"optionalItemFilter"
);

const items = [

...new Set(

optionalPaymentsMasterData

.map(r=>r.item)

.filter(Boolean)

)

].sort();

itemSelect.innerHTML =

`<option value="">
📦 Item
</option>`;

items.forEach(item=>{

itemSelect.innerHTML +=

`<option value="${item}">
${item}
</option>`;

});

}

function updateOptionalCards(data){

const summary = {};

data.forEach(row=>{

    if(!summary[row.item]){

        summary[row.item]={

            count:0,

            total:0

        };

    }

    summary[row.item].count++;

    summary[row.item].total += Number(row.amount_paid || 0);

});

document
.querySelectorAll(".optional-card")
.forEach(card=>{

    const item =

    card
    .querySelector(".optional-card-title")
    .innerText
    .trim();

    const countDiv =

    card.querySelector(".optional-card-count");

    const amountDiv =

    card.querySelector(".optional-card-amount");

    if(summary[item]){

        const count = summary[item].count;

        countDiv.innerText =
        `${count} ${count === 1 ? "Student" : "Students"}`;

        amountDiv.innerText =
        "₦" + summary[item].total.toLocaleString();

    }else{

        countDiv.innerText =
        "0 Students";

        amountDiv.innerText =
        "₦0";

    }

});

}

function closeOptionalItemModal(){

document.getElementById(

"optionalItemModal"

).style.display="none";

}

async function saveOptionalItem(){

const id =
document.getElementById(
"optionalItemId"
).value;

const item =
document.getElementById(
"optionalItemName"
).value.trim();

const fee =
Number(
document.getElementById(
"optionalItemFee"
).value
);

if(!item){

alert(
"Enter Item Name."
);

return;

}

if(fee<=0){

alert(
"Enter a valid Fee."
);

return;

}

// ===========================
// ADD NEW ITEM
// ===========================

if(!id){

const {

data: existing,
error: existingError

} = await supabaseClient

.from("set_optional_payments")

.select("id")

.eq(
"school_code",
currentSchoolCode
)

.ilike(
"item",
item
);

if(existingError){

alert(existingError.message);

return;

}

if(existing && existing.length){

alert(
"This item already exists."
);

return;

}

const {

error

} = await supabaseClient

.from("set_optional_payments")

.upsert(

{

school_code:
currentSchoolCode,

item,

fee

},

{

onConflict:
"school_code,item"

}

);

if(error){

console.error(error);

alert(error.message);

return;

}

alert(
"Optional Payment Item Added Successfully."
);

}

// ===========================
// EDIT EXISTING ITEM
// ===========================

else{

const {

error

} = await supabaseClient

.from("set_optional_payments")

.update({

item,

fee

})

.eq(
"id",
id
);

if(error){

console.error(error);

alert(error.message);

return;

}

alert(
"Optional Payment Item Updated Successfully."
);

}

// ===========================
// RESET FORM
// ===========================

document.getElementById(
"optionalItemId"
).value = "";

document.getElementById(
"optionalItemName"
).value = "";

document.getElementById(
"optionalItemFee"
).value = "";

document.getElementById(
"optionalItemModalTitle"
).innerText =
"Add Optional Payment Item";

closeOptionalItemModal();

await showOptionalPaymentsSetup();

}

function editOptionalItem(
id,
item,
fee
){

document.getElementById(
"optionalItemId"
).value = id;

document.getElementById(
"optionalItemName"
).value = item;

document.getElementById(
"optionalItemFee"
).value = fee;

document.getElementById(
"optionalItemModalTitle"
).innerText =
"Edit Optional Payment Item";

document.getElementById(
"optionalItemModal"
).style.display =
"flex";

}

async function openOptionalPaymentPopup(){

document
.getElementById(
"optionalPaymentModal"
)
.classList.add(
"show"
);

document.getElementById(
"optionalStudentSearch"
).value="";

document.getElementById(
"optionalStudentClass"
).value="";

document.getElementById(
"optionalPaymentFee"
).value="";

document.getElementById(
"optionalAmountPaid"
).value="";

await loadOptionalItems();

}

function closeOptionalPaymentModal(){

document.getElementById(
"optionalPaymentModal"
).style.display = "none";

document.getElementById(
"optionalStudentSearch"
).value = "";

document.getElementById(
"optionalStudentResults"
).innerHTML = "";

document.getElementById(
"optionalStudentClass"
).value = "";

document.getElementById(
"optionalPaymentItem"
).selectedIndex = 0;

document.getElementById(
"optionalPaymentFee"
).value = "";

document.getElementById(
"optionalAmountPaid"
).value = "";

}

async function loadOptionalItems(){

const{

data,

error

}=await supabaseClient

.from(
"set_optional_payments"
)

.select("*")

.eq(
"school_code",
schoolCode
)

.order(
"item"
);

if(error){

alert(error.message);

return;

}

const select=

document.getElementById(
"optionalPaymentItem"
);

select.innerHTML=

`<option value="">
Select Item
</option>`;

data.forEach(item=>{

select.innerHTML+=`

<option
value="${item.id}"
data-fee="${item.fee}"
>

${item.item}

</option>

`;

});

}

document.addEventListener(

"change",

function(e){

if(

e.target.id===

"optionalPaymentItem"

){

const fee=

e.target.options[
e.target.selectedIndex
]

.dataset.fee||

0;

document.getElementById(

"optionalPaymentFee"

).value=

`₦${Number(fee).toLocaleString()}`;

}

}

);

async function saveOptionalPayment(){

if(!optionalSelectedStudent){

alert(
"Please select a student."
);

return;

}

const dropdown =

document.getElementById(
"optionalPaymentItem"
);

if(!dropdown.value){

alert(
"Please select an item."
);

return;

}

const selectedOption =

dropdown.options[
dropdown.selectedIndex
];

const itemName =
selectedOption.text;

const fee =

Number(
selectedOption.dataset.fee
);

const amountPaid =

Number(

document.getElementById(
"optionalAmountPaid"
).value

);

if(

isNaN(amountPaid)

||

amountPaid<=0

){

alert(
"Enter a valid amount."
);

return;

}

const remaining =

Math.max(

fee-amountPaid,

0

);

const status =

remaining===0

?

"Paid"

:

"Partial";


// =========================
// CHECK EXISTING PAYMENT
// =========================

const {

data: existing,
error: existingError

} = await supabaseClient

.from("optional_payments")

.select("id")

.eq(
"school_code",
currentSchoolCode
)

.eq(
"student_id",
optionalSelectedStudent.id
)

.eq(
"item",
itemName

);

if(existingError){

alert(existingError.message);

return;

}

let error;

if(existing && existing.length){

({ error } =

await supabaseClient

.from("optional_payments")

.update({

class_name:

optionalSelectedStudent.class,

amount_paid:

amountPaid,

original_fee:

fee,

remaining_amount:
remaining,

status:
status,

updated_at:

new Date()

})

.eq(
"id",
existing[0].id

));

}else{

({ error } =

await supabaseClient

.from("optional_payments")

.insert({

school_code:
currentSchoolCode,

student_id:
optionalSelectedStudent.id,

student_name:
optionalSelectedStudent.student_name,

reg_no:
optionalSelectedStudent.reg_no,

department:
optionalSelectedStudent.department,

class_name:
optionalSelectedStudent.class,

item:
itemName,

original_fee:
fee,

amount_paid:
amountPaid,

remaining_amount:
remaining,

status:
status,

created_at:
new Date(),

updated_at:
new Date()

}));

}

if(error){

alert(error.message);

return;

}

alert(
"Optional Payment Updated Successfully."
);

closeOptionalPaymentModal();

}

function showDrive() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>📁 School Drive</h3>

    <p>
      Access the school's secure Google Drive workspace.
    </p>

    <br>

    <button
      id="openDriveBtn"
      class="admin-btn"
    >
      Open School Drive
    </button>

  `;

}



async function loadDepartmentResources() {

  console.log("CURRENT SCHOOL CODE:", schoolCode);

  const { data, error } = await supabaseClient
    .from("department_resources")
    .select("*")
    .eq("school_code", schoolCode); // 🔥 KEY FIX

  if (error) {
    console.error(error);
    return [];
  }

  console.log("MASTER SHEET DATA:", data);

  return data || [];
}


function renderDepartments(data) {

  let html = "<div class='department-list'>";

 data.forEach(row => {

  if (!row.department) return;

  const safeId =
    row.department.replace(/\s+/g, "_");

    html += `
  <div class="department-item">

    <div
      class="department-header"
      onclick="toggleDepartment('${row.department}')"
    >

      ${row.department}

    </div>

    <div
      class="department-dropdown"
      id="dropdown-${safeId}"
    >

      <div
        class="dropdown-item"
        onclick="openSheet('${row.spreadsheet_url}')"
      >
        📊 Open Master Sheet
      </div>

      <div
        class="dropdown-item"
        onclick="openSheet('${row.broadsheet_url}')"
      >
        📑 Open Broadsheet
      </div>

    </div>

  </div>
`;

  });

  html += "</div>";

  document.getElementById("adminContent").innerHTML = html;
}

function openSheet(url) {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <iframe
      src="${url}"
      style="
        width:100%;
        height:700px;
        border:none;
        border-radius:10px;
      ">
    </iframe>

  `;

}


async function showMasterSheet() {

  const data = await loadDepartmentResources();

  if (!data.length) {
    document.getElementById("adminContent").innerHTML =
      "<p>No departments found.</p>";
    return;
  }

  renderDepartments(data);
}

async function showStudentsFees() {

  const { data, error } =
    await supabaseClient
      .from(
        "department_resources"
      )
      .select(
        "department"
      )
      .eq(
        "school_code",
        schoolCode
      )
      .order(
        "department"
      );

  if (error) {

    alert(
      error.message
    );

    return;

  }

  let options =
    `<option value="">
      Select Department
    </option>`;

  data.forEach(row => {

    options += `

      <option
        value="${row.department}"
      >

        ${row.department}

      </option>

    `;

  });

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>
      👨‍🎓 Students & Fees
    </h3>

    <div
  class="student-toolbar"
>

  <select
    id="studentDepartment"
  >
    ${options}
  </select>

  <button
    id="refreshStudentsBtn"
    class="admin-btn"
  >
    Refresh
  </button>

  <input
    type="text"
    id="studentSearch"
    placeholder="Search Student..."
  >

</div>

<br>

    <div
      id="studentsTableContainer"
    >

    </div>

  `;

  wireStudentsModule();

}

async function syncStudentsFromSheet() {

  const department =
    document.getElementById(
      "studentDepartment"
    ).value;

  if (!department) {

    alert(
      "Select department first"
    );

    return;

  }

  const formData =
    new URLSearchParams();

  formData.append(
    "action",
    "syncStudents"
  );

  formData.append(
    "schoolCode",
    schoolCode
  );

  formData.append(
    "department",
    department
  );

  const response =
  await fetch(
    "https://script.google.com/macros/s/AKfycbzf6-sPVZl2ggJcp2ovlBhLMwNL2K9m1R0ch5doIg50mcJ0o6GZNKFv9FcxcL-WTpwuSQ/exec",
    {
      method: "POST",
      body: formData
    }
  );

  const result =
    await response.json();
  console.log(
  "SYNC RESPONSE:",
  result
);

  if (!result.success) {

    alert(
      result.error
    );

    return;

  }

  alert(
    `${result.synced} students synced`
  );

  loadStudentsTable(
    department
  );

}


async function loadStudentsTable(
  department
) {

  console.log(
  "LOAD STUDENTS FUNCTION RUNNING"
);

console.log(
  "Department Selected:",
  department
);

const {
  data,
  error
} =
  await supabaseClient
    .from("students")
    .select("*")
    .eq(
      "school_code",
      schoolCode
    )
    .eq(
      "department",
      department
    );
	console.log(
  "FILTERED STUDENTS:",
  data
);

console.log(
  "RAW DATA:",
  data
);

console.log(
  "TOTAL STUDENTS:",
  data?.length
);

console.log(
  "Students Returned:",
  data
);

console.log(
  "Department:",
  department
);

console.log(
  "School Code:",
  schoolCode
);

console.log(
  "Query Error:",
  error
);
  if (error) {

    alert(
      error.message
    );

    return;

  }

  let html = `

    <table
      class="students-table"
    >

      <tr>

        <th>
          Student Name
        </th>

        <th>
          Class
        </th>

        <th>
          Actions
        </th>

      </tr>

  `;

  data.forEach(student => {

    html += `

      <tr>

        <td>

          ${student.student_name}

        </td>

        <td>

          ${student.class || ""}

        </td>

        <td>

  <div class="action-buttons">

    <button
      onclick="
  viewStudentInfo(
    '${student.id}'
  )
"
    >
      Info
    </button>

    <button
      onclick="
  openTermReport(
    '${student.id}'
  )
"
    >
      Result
    </button>

  </div>

</td>

      </tr>

    `;

  });

  html +=
    "</table>";

  document.getElementById(
    "studentsTableContainer"
  ).innerHTML =
    html;

}

function filterStudentsTable() {

  const searchValue =
    document
      .getElementById(
        "studentSearch"
      )
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      ".students-table tr"
    );

  rows.forEach(
    (
      row,
      index
    ) => {

      if (
        index === 0
      ) return;

      const rowText =
        row.innerText
          .toLowerCase();

      row.style.display =
        rowText.includes(
          searchValue
        )
          ? ""
          : "none";

    }
  );

}

async function viewStudentInfo(id) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

console.log(
  "PASSPORT URL:",
  data.passport_url
  );

let passportUrl = "";

if (
  data.passport_url
) {

  const fileId =
    data.passport_url
      .split("id=")[1];

  passportUrl =
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;

}
  document.getElementById(
    "adminContent"
  ).innerHTML = `

   <div
  class="student-info-card"
>

<div
  style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:15px;
  "
>

  <div
    style="
      display:flex;
      align-items:center;
      gap:12px;
    "
  >

    <img
      src="${passportUrl}"
      class="student-passport"
    >

    <h3
      style="margin:0;"
    >
      ${data.student_name}
    </h3>

  </div>

  <button
    onclick="showStudentsFees()"
    style="
      border:none;
      background:none;
      font-size:24px;
      cursor:pointer;
      color:#666;
      font-weight:bold;
    "
  >
    ✕
  </button>

</div>

      <table
        class="student-info-table"
      >

        <tr>
          <td><strong>Class</strong></td>
          <td>${data.class || ""}</td>
        </tr>

        <tr>
          <td><strong>Parent Contact 1</strong></td>
          <td>
            ${
              data.parent_contact1 || ""
            }
          </td>
        </tr>

        <tr>
          <td><strong>Parent Contact 2</strong></td>
          <td>
            ${
              data.parent_contact2 || ""
            }
          </td>
        </tr>

        <tr>
          <td><strong>Address</strong></td>
          <td>
            ${data.address || ""}
          </td>
        </tr>

        <tr>
          <td>
            <strong>
              Total Fees Paid
            </strong>
          </td>
          <td>

            ₦${(
              data.total_fees_paid || 0
            ).toLocaleString()}

          </td>
        </tr>

      </table>

      <br>

      <button
  class="admin-btn"
  onclick="
    openStudentUpdateForm(
      ${data.id}
    )
  "
>
  Update Student Info
</button>

    </div>

  `;

}

window.viewStudentInfo =
  viewStudentInfo;
  
  async function openStudentUpdateForm(
  studentId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "id",
        studentId
      )
      .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

  document.getElementById(
  "adminContent"
).innerHTML = `

<div class="student-update-form">

    <h3>
      Update Student Info
    </h3>

    <br>

    <label>
      Parent Contact 1
    </label>

    <input
      type="text"
      id="parentContact1"
      value="${
        data.parent_contact1 || ""
      }"
    >

    <br><br>

    <label>
      Parent Contact 2
    </label>

    <input
      type="text"
      id="parentContact2"
      value="${
        data.parent_contact2 || ""
      }"
    >

    <br><br>

    <label>
      Address
    </label>

    <textarea
      id="studentAddress"
    >${
      data.address || ""
    }</textarea>

    <br><br>

    <label>
      New Amount Paid
    </label>

    <input
      type="number"
      id="newAmountPaid"
      value="0"
    >

    <br><br>

   
   <div class="student-form-buttons">

  <button type="submit"
      class="admin-btn"
      onclick="
        saveStudentInfo(
          ${studentId}
        )
      "
    >
    Update
  </button>

  <button type="button"
      class="admin-btn"
      onclick="
        openStudentUpdateForm(
          ${studentId}
        )
      "
    >
    Clear
  </button>

</div>
  </div>`;

}

async function saveStudentInfo(
  studentId
) {

  console.log(
    "SAVE BUTTON CLICKED",
    studentId
  );

  const parent1 =
    document.getElementById(
      "parentContact1"
    ).value.trim();

  const parent2 =
    document.getElementById(
      "parentContact2"
    ).value.trim();

  const address =
    document.getElementById(
      "studentAddress"
    ).value.trim();

  const newAmount =
    Number(
      document.getElementById(
        "newAmountPaid"
      ).value
    ) || 0;

  console.log(
    "Parent1 Value:",
    parent1
  );

  console.log(
    "Parent2 Value:",
    parent2
  );

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select(
        "total_fees_paid"
      )
      .eq(
        "id",
        studentId
      )
      .single();
	  
   const {
  data: studentData,
  error: studentError
} =
await supabaseClient
  .from("students")
  .select(
    "student_name,department,class,reg_no"
  )
  .eq(
    "id",
    studentId
  )
  .single();
  
if (studentError) {

    alert(
        studentError.message
    );

    return;

}

  if (error) {

    alert(
      error.message
    );

    return;

  }

// ========================================
// PAYMENT ALLOCATION ENGINE
// ========================================

const currentTotal =
  Number(data.total_fees_paid) || 0;

let appliedToOutstanding = 0;
let appliedToCurrentTerm = 0;
let remarks = "Current Term Payment";

// Today's payment
let amountRemaining = newAmount;

// ----------------------------------------
// CHECK PREVIOUS TERM OUTSTANDING
// ----------------------------------------

const {
  data: previousOutstanding
} = await supabaseClient
  .from("student_previous_outstanding_fees")
  .select("*")
  .eq("school_code", currentSchoolCode)
  .eq("reg_no", studentData.reg_no)
  .gt("remaining_amount", 0)
  .eq("status", "Outstanding")
  .maybeSingle();

// ----------------------------------------
// IF STUDENT HAS PREVIOUS TERM DEBT
// ----------------------------------------

if (previousOutstanding) {

  let previousDebt =
    Number(previousOutstanding.remaining_amount);

  // Entire payment goes to previous debt

  if (amountRemaining <= previousDebt) {

    await supabaseClient
      .from("student_previous_outstanding_fees")
      .update({

        remaining_amount:
          previousDebt - amountRemaining,

        status:
          previousDebt - amountRemaining === 0
            ? "Paid"
            : "Outstanding"

      })
      .eq("id", previousOutstanding.id);

    appliedToOutstanding =
      amountRemaining;

    appliedToCurrentTerm = 0;

    amountRemaining = 0;

    remarks =
      "Previous Term Outstanding Payment";

  }

  // Payment clears previous debt completely

  else {

    await supabaseClient
      .from("student_previous_outstanding_fees")
      .update({

        remaining_amount: 0,

        status: "Paid"

      })
      .eq("id", previousOutstanding.id);

    appliedToOutstanding =
      previousDebt;

    amountRemaining =
      amountRemaining - previousDebt;

    appliedToCurrentTerm =
      amountRemaining;

    remarks =
      "Outstanding Cleared. Balance Applied To Current Term";

  }

}

// ----------------------------------------
// NO PREVIOUS TERM DEBT
// ----------------------------------------

else {

  appliedToCurrentTerm =
    amountRemaining;

  appliedToOutstanding = 0;

  remarks =
    "Current Term Payment";

}

// ----------------------------------------
// CURRENT TERM TOTAL
// ----------------------------------------

const updatedTotal =
  currentTotal +
  appliedToCurrentTerm;
  
  // ========================================
// UPDATE CURRENT TERM OUTSTANDING
// ========================================

if (appliedToCurrentTerm > 0) {

    const {

        data: currentOutstanding

    } = await supabaseClient

        .from("student_outstanding_fees")

        .select("*")

        .eq("school_code", currentSchoolCode)

        .eq("reg_no", studentData.reg_no)

        .maybeSingle();

    if (currentOutstanding) {

       const currentRemaining =
    Number(currentOutstanding.remaining_amount) || 0;

const newRemaining = Math.max(
    0,
    currentRemaining - appliedToCurrentTerm
);

await supabaseClient
    .from("student_outstanding_fees")
    .update({

        remaining_amount: newRemaining,

        status:
            newRemaining === 0
                ? "Paid"
                : "Outstanding"

    })
    .eq("id", currentOutstanding.id);
    }

}

// ========================================
// SAVE CURRENT TERM PAYMENT
// ========================================

// ========================================
// SAVE PAYMENT RECORDS
// ========================================

if (newAmount > 0) {

    console.log("Saving payment into student_payments...");

    // ----------------------------
    // STEP 1: Save Current Payment
    // ----------------------------

    const {

        data: paymentData,

        error: paymentError

    } = await supabaseClient

        .from("student_payments")

        .insert({

            student_id: studentId,

            school_code: currentSchoolCode,

            department: studentData.department,

            class: studentData.class,

            student_name: studentData.student_name,

            reg_no: studentData.reg_no,

            amount_paid: newAmount

        })

        .select();

    console.log(
        "Student Payments Insert:",
        paymentData
    );

    console.log(
        "Student Payments Error:",
        paymentError
    );

    if (paymentError) {

        alert(
            JSON.stringify(paymentError)
        );

        throw paymentError;

    }
}

// ----------------------------
// SAVE PAYMENT HISTORY
// (Always save every payment)
// ----------------------------

if (newAmount > 0) {

    const {

        data: historyData,

        error: historyError

    } = await supabaseClient

        .from("payment_history")

        .insert({

            student_id: studentId,

            school_code: currentSchoolCode,

            department: studentData.department,

            class: studentData.class,

            student_name: studentData.student_name,

            reg_no: studentData.reg_no,

            amount_paid: newAmount,

            applied_to_outstanding: appliedToOutstanding,

            applied_to_current_term: appliedToCurrentTerm,

            total_paid: updatedTotal,

            remarks: remarks

        });

    console.log(
        "PAYMENT HISTORY INSERT:",
        historyData
    );

    console.log(
        "PAYMENT HISTORY ERROR:",
        historyError
    );

    if (historyError) {

        throw historyError;

    }

}
   



// ----------------------------------------
// UPDATE STUDENT RECORD
// ----------------------------------------

const studentUpdate = {

    parent_contact1: parent1,

    parent_contact2: parent2,

    address: address

};

// ONLY increase total fees when current term received money

if (appliedToCurrentTerm > 0) {

    studentUpdate.total_fees_paid = updatedTotal;

}

const {

    error: updateError

} = await supabaseClient

    .from("students")

    .update(studentUpdate)

    .eq("id", studentId);
  
  console.log(
    "Update Error:",
    updateError
  );

  if (updateError) {

    alert(
      updateError.message
    );

    return;

  }

  const {
    data: verifyData
  } =
    await supabaseClient
      .from("students")
      .select(
        "parent_contact1,parent_contact2"
      )
      .eq(
        "id",
        studentId
      )
      .single();

  console.log(
    "After Update:",
    verifyData
  );

  alert(
    "Student Updated Successfully"
  );

  viewStudentInfo(
    studentId
  );

}

window.openStudentUpdateForm =
  openStudentUpdateForm;

window.saveStudentInfo =
  saveStudentInfo;


async function loadPaymentHistory() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>
      📜 Payment History
    </h3>

    <p>
      Loading payment history...
    </p>

  `;

  const {
    data,
    error
  } =
  await supabaseClient

    .from(
      "payment_history"
    )

    .select("*")

    .eq(
      "school_code",
      currentSchoolCode
    )

    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    document.getElementById(
      "adminContent"
    ).innerHTML = `

      <h3>
        📜 Payment History
      </h3>

      <p>
        ${error.message}
      </p>

    `;

    return;

  }

  // Store the complete dataset ONLY ONCE
paymentHistoryMasterData = data;

// Working dataset
paymentHistoryData = data;

// Render
renderPaymentHistory(data);

}

function renderPaymentHistory(
  data
) {

	const searchValue =
document.getElementById("historySearch")?.value || "";

const selectedDept =
document.getElementById("historyDepartment")?.value || "";

const selectedClass =
document.getElementById("historyClass")?.value || "";


	const totalAmount =

data.reduce(

  (sum, row) =>

    sum +

    Number(

      row.amount_paid || 0

    ),

  0

);

const totalTransactions =

data.length;

const studentsPaid =

new Set(

  data.map(

    row => row.reg_no

  )

).size;




const totalPages = Math.ceil(

  paymentHistoryData.length /

  paymentHistoryRowsPerPage

);

if (

paymentHistoryCurrentPage >

totalPages

){

paymentHistoryCurrentPage = 1;

}

const start =

(paymentHistoryCurrentPage - 1)

*

paymentHistoryRowsPerPage;

const end =

start +

paymentHistoryRowsPerPage;

const pageData =

paymentHistoryData.slice(

start,

end

);
  let html = `

<h3>

📜 Payment History

</h3>

<div class="payment-summary">

<div class="summary-card">

<h4>Total Payments</h4>

<p>

₦${totalAmount.toLocaleString()}

</p>

</div>

<div class="summary-card">

<h4>Transactions</h4>

<p>

${totalTransactions}

</p>

</div>

<div class="summary-card">

<h4>Students Paid</h4>

<p>

${studentsPaid}

</p>

</div>

</div>

<div class="payment-filters">

  <input
    type="text"
    id="historySearch"
    placeholder="🔍 Search Student / Reg No..."
    onkeyup="filterPaymentHistory()"
  >

  <select
    id="historyDepartment"
    onchange="filterPaymentHistory()"
  >
    <option value="">
      All Departments
    </option>
  </select>

  <select
    id="historyClass"
    onchange="filterPaymentHistory()"
  >
    <option value="">
      All Classes
    </option>
  </select>

</div>
<div class="payment-quick-filters">

<button onclick="historyToday()">
Today
</button>

<button onclick="historyThisWeek()">
Week
</button>

<button onclick="historyThisMonth()">
Month
</button>

<button onclick="historyThisTerm()">
Term
</button>

<button onclick="historyThisSession()">
Session
</button>

<button onclick="historyReset()">
Reset
</button>

</div>

  <table
    class="admin-table"
  >

    <thead>

      <tr>

        <th>Date</th>

        <th>Name</th>

        <th>Reg No</th>

        <th>Class</th>

        <th>Amount</th>

        <th>Remarks</th>

      </tr>

    </thead>

    <tbody>

  `;

  pageData.forEach(

    row => {

      html += `

      <tr>

        <td>

          ${new Date(

            row.created_at

          ).toLocaleString()}

        </td>

        <td>

          ${row.student_name}

        </td>

        <td>

          ${row.reg_no}

        </td>

        <td>

          ${row.class}

        </td>

        <td>

          ₦${Number(

            row.amount_paid

          ).toLocaleString()}

        </td>

        <td>

          ${row.remarks}

        </td>

      </tr>

      `;

    }

  );

  html += `

    </tbody>

  </table>

  `;
  
 html += `

<div class="payment-pagination">

<button

onclick="previousPaymentPage()"

${paymentHistoryCurrentPage===1?

"disabled":""}

>

◀ Previous

</button>

<span>

Page

${paymentHistoryCurrentPage}

of

${Math.max(totalPages,1)}

</span>

<button

onclick="nextPaymentPage()"

${paymentHistoryCurrentPage>=totalPages?

"disabled":""}

>

Next ▶

</button>

</div>

`;

  document.getElementById(
    "adminContent"
  ).innerHTML = html;
  
  document.getElementById("historySearch").value = searchValue;
document.getElementById("historyDepartment").value = selectedDept;
document.getElementById("historyClass").value = selectedClass;

// Return focus to the search box
document.getElementById("historySearch").focus();

// Place cursor at the end of the text
document.getElementById("historySearch").setSelectionRange(
    searchValue.length,
    searchValue.length
);

  populateHistoryFilters(
  data
    );
}

function historyToday(){

    paymentHistoryFilter = "today";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisWeek(){

    paymentHistoryFilter = "week";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisMonth(){

    paymentHistoryFilter = "month";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisTerm(){

    paymentHistoryFilter = "term";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisSession(){

    paymentHistoryFilter = "session";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyReset(){

    paymentHistoryFilter = "all";

    paymentHistoryCurrentPage = 1;

    document.getElementById(
        "historySearch"
    ).value = "";

    document.getElementById(
        "historyDepartment"
    ).value = "";

    document.getElementById(
        "historyClass"
    ).value = "";

    paymentHistoryData = paymentHistoryMasterData;

    renderPaymentHistory(paymentHistoryMasterData);

}

function previousPaymentPage(){

if(

paymentHistoryCurrentPage>1

){

paymentHistoryCurrentPage--;

renderPaymentHistory(

paymentHistoryData

);

}

}

function nextPaymentPage(){

const totalPages=

Math.ceil(

paymentHistoryData.length/

paymentHistoryRowsPerPage

);

if(

paymentHistoryCurrentPage<totalPages

){

paymentHistoryCurrentPage++;

renderPaymentHistory(

paymentHistoryData

);

}

}

function filterPaymentHistory() {

  const keyword =
    document
      .getElementById(
        "historySearch"
      )
      .value
      .toLowerCase();

  const dept =
    document.getElementById(
      "historyDepartment"
    ).value;

  const cls =
    document.getElementById(
      "historyClass"
    ).value;

  const filtered =
    paymentHistoryMasterData.filter(
      row => {

        const matchesSearch =

          row.student_name
            .toLowerCase()
            .includes(keyword)

          ||

          row.reg_no
            .toLowerCase()
            .includes(keyword);

        const matchesDept =

          !dept ||

          row.department === dept;

        const matchesClass =

          !cls ||

          row.class === cls;


let matchesDate = true;

const paymentDate =

new Date(row.created_at);

const today = new Date();

switch(paymentHistoryFilter){

case "today":

    matchesDate =

        paymentDate.toDateString() ===

        today.toDateString();

break;

case "week":

    const weekStart = new Date(today);

    weekStart.setDate(

        today.getDate() -

        (today.getDay() === 0 ?

        6 :

        today.getDay()-1)

    );

    weekStart.setHours(0,0,0,0);

    matchesDate =

        paymentDate >= weekStart;

break;

case "month":

    matchesDate =

        paymentDate.getMonth() ===

        today.getMonth()

        &&

        paymentDate.getFullYear() ===

        today.getFullYear();

break;

case "all":

default:

    matchesDate = true;

}

        return(

matchesSearch &&

matchesDept &&

matchesClass &&

matchesDate

);

      }

    );
	
paymentHistoryData = filtered;

renderPaymentHistory(filtered);

  
}

function populateHistoryFilters(data) {

  const deptSelect =
    document.getElementById(
      "historyDepartment"
    );

  const classSelect =
    document.getElementById(
      "historyClass"
    );

  if (!deptSelect || !classSelect)
    return;

  const departments =

    [...new Set(
      data.map(
        x => x.department
      )
    )].sort();

  const classes =

    [...new Set(
      data.map(
        x => x.class
      )
    )].sort();

  deptSelect.innerHTML =
    `<option value="">
      All Departments
    </option>`;

  departments.forEach(

    d =>

      deptSelect.innerHTML +=

      `<option value="${d}">
        ${d}
      </option>`

  );

  classSelect.innerHTML =
    `<option value="">
      All Classes
    </option>`;

  classes.forEach(

    c =>

      classSelect.innerHTML +=

      `<option value="${c}">
        ${c}
      </option>`

  );

}

async function loadOutstandingPayments() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

  <h3>

  💰 Outstanding Fees

  </h3>

  <p>

  Loading Outstanding Fees...

  </p>

  `;

  // ------------------------
  // LOAD STUDENTS
  // ------------------------

  const {

    data: students,

    error: studentsError

  } = await supabaseClient

    .from("students")

    .select("*")

    .eq(
      "school_code",
      currentSchoolCode
    );

  if (studentsError) {

    document.getElementById(
      "adminContent"
    ).innerHTML =

      studentsError.message;

    return;

  }

  // ------------------------
  // LOAD CLASS FEES
  // ------------------------

  const {

    data: fees,

    error: feesError

  } = await supabaseClient

    .from("class_fees")

    .select("*")

    .eq(
      "school_code",
      currentSchoolCode
    );

  if (feesError) {

    document.getElementById(
      "adminContent"
    ).innerHTML =

      feesError.message;

    return;

  }

  renderOutstandingFees(

    students,

    fees

  );

}

async function showPreviousOutstandingFees() {

    const {

        data,

        error

    } = await supabaseClient

        .from("student_previous_outstanding_fees")

        .select("*")

        .eq(

            "school_code",

            currentSchoolCode

        )

        .order(

            "department",

            { ascending: true }

        )

        .order(

            "class_name",

            { ascending: true }

        )

        .order(

            "student_name",

            { ascending: true }

        );

    if (error) {

        console.error(error);

        alert(

            "Unable to load Previous Term Outstanding Fees."

        );

        return;

    }

    renderPreviousOutstandingFees(data);

}

function renderOutstandingFees(

  students,

  fees

){

let studentsOwing = 0;

let amountOwing = 0;

let fullyPaid = 0;

let partialPaid = 0;

const outstandingData = [];

students.forEach(student=>{

    const feeRecord =

    fees.find(

        fee =>

        fee.class_name ===

        student.class

    );

    const classFee =

    Number(

      feeRecord?.term_fee || 0

    );

    const paid =

    Number(

      student.total_fees_paid || 0

    );

    const outstanding =

    Math.max(

      classFee - paid,

      0

    );

	let status = "";

if (outstanding === 0) {

    status = "🟢 Paid";

}

else if (paid === 0) {

    status = "🔴 Outstanding";

}

else {

    status = "🟡 Partial";

}

outstandingData.push({

    // Existing UI fields
    student_name: student.student_name,

    reg_no: student.reg_no,

    department: student.department,

    class: student.class,

    termFee: classFee,

    paid: paid,

    outstanding: outstanding,

    status: status,

    // Snapshot fields
    school_code: student.school_code,

    student_id: student.id,

    class_name: student.class,

    session: currentSession,

    term: currentTerm,

    original_amount: classFee,

    amount_paid: paid,

    remaining_amount: outstanding

});
    if(outstanding===0){

        fullyPaid++;

    }

    else{

        studentsOwing++;

        amountOwing += outstanding;

        if(paid>0){

            partialPaid++;

        }

    }

});

outstandingFeesMasterData = outstandingData;

outstandingFeesData = outstandingData;

let html = `

<h3>

💰 Outstanding Fees

</h3>

<div class="payment-summary">

<div class="summary-card">

<h4>

Students Owing

</h4>

<p>

${studentsOwing}

</p>

</div>

<div class="summary-card">

<h4>

Amount Owing

</h4>

<p>

₦${amountOwing.toLocaleString()}

</p>

</div>

<div class="summary-card">

<h4>

Fully Paid

</h4>

<p>

${fullyPaid}

</p>

</div>

<div class="summary-card">

<h4>

Partial Paid

</h4>

<p>

${partialPaid}

</p>

</div>

</div>

<div class="payment-filters">

<input
type="text"
id="outstandingSearch"
placeholder="🔍 Search Student / Reg No..."
onkeyup="filterOutstandingFees()"
>

<select
id="outstandingDepartment"
onchange="filterOutstandingFees()"
>

<option value="">

All Departments

</option>

</select>

<select
id="outstandingClass"
onchange="filterOutstandingFees()"
>

<option value="">

All Classes

</option>

</select>

<select
id="outstandingStatus"
onchange="filterOutstandingFees()"
>

<option value="">

All Status

</option>

<option value="Outstanding">

Outstanding

</option>

<option value="Partial">

Partial

</option>

<option value="Paid">

Paid

</option>

</select>

</div>

<div class="payment-quick-filters">

<button
class="admin-btn"
onclick="exportOutstandingFees()"
>

📥 Export Outstanding List

</button>

<button
class="admin-btn"
onclick="printOutstandingFees()"
>

🖨️ Print Outstanding List

</button>

</div>

<div id="outstandingTableContainer"></div>
`;


document.getElementById(

"adminContent"

).innerHTML = html;
renderOutstandingTable();
populateOutstandingFilters();
}

function renderPreviousOutstandingFees(previousFees){

let studentsOwing = 0;

let amountOwing = 0;

let fullyPaid = 0;

let partialPaid = 0;

const outstandingData = [];

previousFees.forEach(record => {

    outstandingData.push({

        student_name: record.student_name,

        reg_no: record.reg_no,

        department: record.department,

        class: record.class_name,

        termFee: Number(record.original_amount),

        paid:
            Number(record.original_amount) -
            Number(record.remaining_amount),

        outstanding:
            Number(record.remaining_amount),

        status: record.status

    });

    if (Number(record.remaining_amount) === 0) {

        fullyPaid++;

    } else {

        studentsOwing++;

        amountOwing += Number(record.remaining_amount);

        if (
            Number(record.remaining_amount) <
            Number(record.original_amount)
        ) {

            partialPaid++;

        }

    }

});
previousOutstandingMasterData = [...outstandingData];
previousOutstandingData = [...outstandingData];

let html = `

<h3>

💰 Previous Term Outstanding Fees

</h3>

<div class="payment-summary">

<div class="summary-card">

<h4>

Students Owing

</h4>

<p>

${studentsOwing}

</p>

</div>

<div class="summary-card">

<h4>

Amount Owing

</h4>

<p>

₦${amountOwing.toLocaleString()}

</p>

</div>

<div class="summary-card">

<h4>

Fully Paid

</h4>

<p>

${fullyPaid}

</p>

</div>

<div class="summary-card">

<h4>

Partial Paid

</h4>

<p>

${partialPaid}

</p>

</div>

</div>

<div class="payment-filters">

<input
type="text"
id="previousOutstandingSearch"
placeholder="🔍 Search Student / Reg No..."
onkeyup="filterPreviousOutstandingFees()"
>

<select
id="previousOutstandingDepartment"
onchange="filterPreviousOutstandingFees()"
>

<option value="">

All Departments

</option>

</select>

<select
id="previousOutstandingClass"
onchange="filterPreviousOutstandingFees()"
>

<option value="">

All Classes

</option>

</select>

<select
id="previousOutstandingStatus"
onchange="filterPreviousOutstandingFees()"
>

<option value="">

All Status

</option>

<option value="Outstanding">

Outstanding

</option>

<option value="Partial">

Partial

</option>

<option value="Paid">

Paid

</option>

</select>

</div>

<div class="payment-quick-filters">

<button
class="admin-btn"
onclick="exportPreviousOutstandingFees()"
>

📥 Export Previous Outstanding List

</button>

<button
class="admin-btn"
onclick="printPreviousOutstandingFees()"
>

🖨️ Print Previous Outstanding List

</button>

</div>

<div id="previousOutstandingTableContainer"></div>
`;


document.getElementById(
    "adminContent"
).innerHTML = html;

previousOutstandingCurrentPage = 1;
renderPreviousOutstandingTable();
populatePreviousOutstandingFilters();
}


async function loadPreviousOutstandingFees() {

    const { data, error } =
    await supabaseClient

        .from("student_previous_outstanding_fees")

        .select("*")

        .eq(
            "school_code",
            currentSchoolCode
        )

        .order(
            "department"
        );

    if (error) {

        console.error(error);

        alert(
            "Unable to load Previous Term Outstanding Fees."
        );

        return;

    }

    renderPreviousOutstandingFees(data);

}

function renderOutstandingTable(){

const totalPages = Math.ceil(

outstandingFeesData.length/

outstandingRowsPerPage

);

if(

outstandingCurrentPage>

totalPages

){

outstandingCurrentPage=1;

}

const start =

(outstandingCurrentPage-1)

*

outstandingRowsPerPage;

const end =

start+

outstandingRowsPerPage;

const pageData =

outstandingFeesData.slice(

start,

end

);

let tableHtml = `

<table class="admin-table">

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

pageData.forEach(row=>{

tableHtml += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.class}</td>

<td>

₦${row.termFee.toLocaleString()}

</td>

<td>

₦${row.paid.toLocaleString()}

</td>

<td>

₦${row.outstanding.toLocaleString()}

</td>

<td>

${row.status}

</td>

</tr>

`;

});

tableHtml += `

</tbody>

</table>

`;

tableHtml += `

<div class="payment-pagination">

<button

onclick="previousOutstandingPage()"

${outstandingCurrentPage===1?

"disabled":""}

>

◀ Previous

</button>

<span>

Page

${outstandingCurrentPage}

of

${Math.max(totalPages,1)}

</span>

<button

onclick="nextOutstandingPage()"

${outstandingCurrentPage>=totalPages?

"disabled":""}

>

Next ▶

</button>

</div>

`;

document.getElementById(
    "outstandingTableContainer"
).innerHTML = tableHtml;

}

function renderPreviousOutstandingTable(){

const totalPages = Math.ceil(

previousOutstandingData.length /

previousOutstandingRowsPerPage

);

if(

previousOutstandingCurrentPage >

totalPages

){

previousOutstandingCurrentPage = 1;

}

const start =

(previousOutstandingCurrentPage - 1)

*

previousOutstandingRowsPerPage;

const end =

start +

previousOutstandingRowsPerPage;

const pageData =

previousOutstandingData.slice(

start,

end

);

let tableHtml = `

<table class="admin-table">

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

pageData.forEach(row=>{

tableHtml += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.class}</td>

<td>

₦${row.termFee.toLocaleString()}

</td>

<td>

₦${row.paid.toLocaleString()}

</td>

<td>

₦${row.outstanding.toLocaleString()}

</td>

<td>

${row.status}

</td>

</tr>

`;

});

tableHtml += `

</tbody>

</table>

`;

tableHtml += `

<div class="payment-pagination">

<button

onclick="previousOutstandingPrevPage()"

${previousOutstandingCurrentPage===1 ?

"disabled":""}

>

◀ Prev

</button>

<span>

Page

${previousOutstandingCurrentPage}

of

${Math.max(totalPages,1)}

</span>

<button

onclick="previousOutstandingNextPage()"

${previousOutstandingCurrentPage>=totalPages ?

"disabled":""}

>

Next ▶

</button>

</div>

`;

document.getElementById(

"previousOutstandingTableContainer"

).innerHTML = tableHtml;

}


function populateOutstandingFilters(){

const deptSelect =

document.getElementById(
"outstandingDepartment"
);

const classSelect =

document.getElementById(
"outstandingClass"
);

const departments =

[
...new Set(

outstandingFeesMasterData.map(

row=>row.department

)

)

].sort();

const classes =

[
...new Set(

outstandingFeesMasterData.map(

row=>row.class || row.class_name

)

)

].sort();

departments.forEach(dept=>{

deptSelect.innerHTML +=

`<option value="${dept}">${dept}</option>`;

});

classes.forEach(cls=>{

classSelect.innerHTML +=

`<option value="${cls}">${cls}</option>`;

});

}

function populatePreviousOutstandingFilters(){

const deptSelect =

document.getElementById(
"previousOutstandingDepartment"
);

const classSelect =

document.getElementById(
"previousOutstandingClass"
);

const departments =

[
...new Set(

previousOutstandingMasterData.map(

row=>row.department

)

)

].sort();

const classes =

[
...new Set(

previousOutstandingMasterData.map(

row=>row.class

)

)

].sort();

departments.forEach(dept=>{

deptSelect.innerHTML +=

`<option value="${dept}">${dept}</option>`;

});

classes.forEach(cls=>{

classSelect.innerHTML +=

`<option value="${cls}">${cls}</option>`;

});

}



function filterOutstandingFees(){

const keyword =

document.getElementById(
"outstandingSearch"
)

.value

.toLowerCase();

const dept =

document.getElementById(
"outstandingDepartment"
).value;

const cls =

document.getElementById(
"outstandingClass"
).value;

const status =

document.getElementById(
"outstandingStatus"
).value;

outstandingFeesData =

outstandingFeesMasterData.filter(

row=>{

const searchMatch =

row.student_name

.toLowerCase()

.includes(keyword)

||

row.reg_no

.toLowerCase()

.includes(keyword);

const deptMatch =

!dept ||

row.department===dept;

const classMatch =

!cls ||

(row.class || row.class_name) === cls;

const statusMatch =

!status ||

row.status.includes(status);

return(

searchMatch &&

deptMatch &&

classMatch &&

statusMatch

);

}

);

outstandingCurrentPage = 1;

renderOutstandingTable();

}

function filterPreviousOutstandingFees(){

const keyword =

document.getElementById(
"previousOutstandingSearch"
)

.value

.toLowerCase();

const dept =

document.getElementById(
"previousOutstandingDepartment"
).value;

const cls =

document.getElementById(
"previousOutstandingClass"
).value;

const status =

document.getElementById(
"previousOutstandingStatus"
).value;

previousOutstandingData =

previousOutstandingMasterData.filter(

row=>{

const searchMatch =

row.student_name

.toLowerCase()

.includes(keyword)

||

row.reg_no

.toLowerCase()

.includes(keyword);

const deptMatch =

!dept ||

row.department===dept;

const classMatch =

!cls ||

row.class===cls;

const statusMatch =

!status ||

row.status.includes(status);

return(

searchMatch &&

deptMatch &&

classMatch &&

statusMatch

);

}

);

previousOutstandingCurrentPage = 1;

renderPreviousOutstandingTable();

}


function exportOutstandingFees(){

let csv =

"Student,Reg No,Department,Class,Term Fee,Paid,Outstanding,Status\n";

outstandingFeesData.forEach(row=>{

csv +=

`"${row.student_name}",`

+

`"${row.reg_no}",`

+

`"${row.department}",`

+

`"${row.class}",`

+

`${row.termFee},`

+

`${row.paid},`

+

`${row.outstanding},`

+

`"${row.status}"\n`;

});

const blob =

new Blob(

[csv],

{

type:

"text/csv;charset=utf-8;"

}

);

const url =

URL.createObjectURL(

blob

);

const link =

document.createElement(

"a"

);

link.href = url;

link.download =

"Outstanding_Fees.csv";

document.body.appendChild(

link

);

link.click();

document.body.removeChild(

link);

}

function exportPreviousOutstandingFees(){

let csv =

"Student,Reg No,Department,Class,Term Fee,Paid,Outstanding,Status\n";

outstandingFeesMasterData.forEach(row=>{

csv +=

`"${row.student_name}",`

+

`"${row.reg_no}",`

+

`"${row.department}",`

+

`"${row.class}",`

+

`${row.termFee},`

+

`${row.paid},`

+

`${row.outstanding},`

+

`"${row.status}"\n`;

});

const blob =

new Blob(

[csv],

{

type:

"text/csv;charset=utf-8;"

}

);

const url =

URL.createObjectURL(

blob

);

const link =

document.createElement(

"a"

);

link.href = url;

link.download =

"Outstanding_Fees.csv";

document.body.appendChild(

link

);

link.click();

document.body.removeChild(

link);

}

function printOutstandingFees() {

let printWindow = window.open("", "_blank");

let html = `

<html>

<head>

<title>

Outstanding Fees

</title>

<style>

body{

font-family:Arial,sans-serif;

padding:20px;

}

h2{

text-align:center;

margin-bottom:20px;

}

table{

width:100%;

border-collapse:collapse;

}

th,td{

border:1px solid #000;

padding:8px;

font-size:12px;

text-align:left;

}

th{

background:#f2f2f2;

}

</style>

</head>

<body>

<h2>

Outstanding Fees Report

</h2>

<table>

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Department</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

outstandingFeesData.forEach(row=>{

html += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.department}</td>

<td>${row.class}</td>

<td>₦${row.termFee.toLocaleString()}</td>

<td>₦${row.paid.toLocaleString()}</td>

<td>₦${row.outstanding.toLocaleString()}</td>

<td>${row.status}</td>

</tr>

`;

});

html += `

</tbody>

</table>

</body>

</html>

`;

printWindow.document.open();

printWindow.document.write(html);

printWindow.document.close();

printWindow.focus();

printWindow.print();

printWindow.close();

}

function printPreviousOutstandingFees() {

let printWindow = window.open("", "_blank");

let html = `

<html>

<head>

<title>

Outstanding Fees

</title>

<style>

body{

font-family:Arial,sans-serif;

padding:20px;

}

h2{

text-align:center;

margin-bottom:20px;

}

table{

width:100%;

border-collapse:collapse;

}

th,td{

border:1px solid #000;

padding:8px;

font-size:12px;

text-align:left;

}

th{

background:#f2f2f2;

}

</style>

</head>

<body>

<h2>

Outstanding Fees Report

</h2>

<table>

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Department</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

outstandingFeesMasterData.forEach(row=>{

html += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.department}</td>

<td>${row.class}</td>

<td>₦${row.termFee.toLocaleString()}</td>

<td>₦${row.paid.toLocaleString()}</td>

<td>₦${row.outstanding.toLocaleString()}</td>

<td>${row.status}</td>

</tr>

`;

});

html += `

</tbody>

</table>

</body>

</html>

`;

printWindow.document.open();

printWindow.document.write(html);

printWindow.document.close();

printWindow.focus();

printWindow.print();

printWindow.close();

}


function previousOutstandingPage(){

if(outstandingCurrentPage>1){

    outstandingCurrentPage--;

    renderOutstandingTable();

}

}

function nextOutstandingPage(){

const totalPages = Math.ceil(

outstandingFeesData.length/

outstandingRowsPerPage

);

if(outstandingCurrentPage<totalPages){

    outstandingCurrentPage++;

    renderOutstandingTable();

}

}

function previousOutstandingPrevPage(){

    if(previousOutstandingCurrentPage > 1){

        previousOutstandingCurrentPage--;

        renderPreviousOutstandingTable();

    }

}

function previousOutstandingNextPage(){

    const totalPages = Math.ceil(

        previousOutstandingData.length /

        previousOutstandingRowsPerPage

    );

    if(previousOutstandingCurrentPage < totalPages){

        previousOutstandingCurrentPage++;

        renderPreviousOutstandingTable();

    }

}



async function clearCurrentTermPayments(){

const proceed = confirm(

`This action will:

• Archive Current Payments

• Generate Outstanding Fees

• Reset Student Payments

• Clear Current Payment Records

Payment History will be preserved.

Current Term payments will be marked as Previous Term payments.

Do you want to continue?`

);

if(!proceed) return;

try{

// STEP 1
const archiveResult =
await archiveStudentPayments();

// STEP 1B
// MARK CURRENT TERM PAYMENTS AS PREVIOUS TERM

const {

error: historyUpdateError

} = await supabaseClient

.from("payment_history")

.update({

remarks:

"Previous Term Payment"

})

.eq(

"school_code",

currentSchoolCode

)

.eq(

"remarks",

"Current Term Payment"

);

if(historyUpdateError){

throw historyUpdateError;

}

// ========================================
// STEP 2B
// COPY CURRENT OUTSTANDING
// TO PREVIOUS TERM TABLE
// ========================================

// Make sure Outstanding data exists
if(!outstandingFeesMasterData || outstandingFeesMasterData.length===0){

    await loadOutstandingPayments();

}

if(!outstandingFeesMasterData || outstandingFeesMasterData.length===0){

    throw new Error(
        "Unable to generate Outstanding snapshot."
    );

}

// Remove previous snapshot

const {

error: deletePreviousError

} = await supabaseClient

.from("student_previous_outstanding_fees")

.delete()

.eq(

"school_code",

currentSchoolCode

);

if(deletePreviousError){

throw deletePreviousError;

}

// Build snapshot directly from the Outstanding screen

const previousRows =

outstandingFeesMasterData

.filter(row=>row.remaining_amount>0)

.map(row=>({

school_code:
row.school_code,

student_id:
row.student_id,

reg_no:
row.reg_no,

student_name:
row.student_name,

department:
row.department,

class_name:
row.class_name,

session:
row.session,

term:
row.term,

original_amount:
row.original_amount,

remaining_amount:
row.remaining_amount,

status:
row.status

}));

if(previousRows.length){

const {

error: previousInsertError

} = await supabaseClient

.from("student_previous_outstanding_fees")

.insert(previousRows);

if(previousInsertError){

throw previousInsertError;

}

}
// STEP 3
const {
error:updateError
} =
await supabaseClient

.from("students")

.update({

total_fees_paid:0

})

.eq(

"school_code",

currentSchoolCode

);

if(updateError)
throw updateError;

// STEP 4
const {
error:deleteError
} =
await supabaseClient

.from("student_payments")

.delete()

.eq(

"school_code",

currentSchoolCode

);

if(deleteError)
throw deleteError;


// ========================================
// STEP 4B
// GENERATE CURRENT TERM OUTSTANDING
// ========================================

const outstanding =
await generateOutstandingRecords();

alert(

`Finance Rollover Completed Successfully

Archived Records:
${archiveResult.count}

Outstanding Records:
${outstanding}

Student Payments Reset

Payment History Preserved.`

);

// ========================================
// REFRESH CURRENT TERM OUTSTANDING
// ========================================

await loadOutstandingPayments();

console.log(

"Finance rollover completed. Outstanding tables refreshed."

);

}
catch(err){

alert(

"Finance rollover failed.\n\n"

+

err.message

);

console.error(err);

}

}

async function archiveStudentPayments() {
	const archiveBatchId =
`ROLL-${Date.now()}`;

  // Fetch all current term payments
  const {
    data: payments,
    error: fetchError
  } = await supabaseClient
    .from("student_payments")
    .select("*")
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (fetchError) {

    console.error(
      "Archive Fetch Error:",
      fetchError
    );

    throw fetchError;

  }
  
  const {

data: students,

error: studentError

} = await supabaseClient

.from("students")

.select(

"id,total_fees_paid"

)

.eq(

"school_code",

currentSchoolCode

);

if(studentError){

throw studentError;

}

  // Nothing to archive
  if (!payments || payments.length === 0) {

    return 0;

  }

  // Build archive rows
 const archiveRows = payments.map(row => {

const student = students.find(
    s => s.id === row.student_id
);

return {

archive_batch_id:
archiveBatchId,

source_table:
"student_payments",

school_code:
row.school_code,

student_id:
row.student_id,

student_name:
row.student_name,

reg_no:
row.reg_no,

department:
row.department,

class:
row.class,

amount_paid:
Number(row.amount_paid || 0),

total_fees_paid:
Number(student?.total_fees_paid || 0),

created_at:
row.created_at

};

});

  // Insert archive
  const {
    error: archiveError
  } = await supabaseClient
    .from("finance_archive")
    .insert(
      archiveRows
    );

  if (archiveError) {

    console.error(
      "Archive Insert Error:",
      archiveError
    );

    throw archiveError;

  }

  return{

count:
archiveRows.length,

batchId:
archiveBatchId

};

}

async function generateOutstandingRecords() {

  // Get all students
  const {
    data: students,
    error: studentError
  } = await supabaseClient
    .from("students")
    .select("*")
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (studentError) throw studentError;

  // Get class fees
  const {
    data: fees,
    error: feeError
  } = await supabaseClient
    .from("class_fees")
    .select("*")
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (feeError) throw feeError;

  // ========================================
  // CLEAR CURRENT OUTSTANDING TABLE
  // BEFORE REBUILDING IT
  // ========================================

  const {
    error: deleteOutstandingError
  } = await supabaseClient
    .from("student_outstanding_fees")
    .delete()
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (deleteOutstandingError) {
    throw deleteOutstandingError;
  }

  let generated = 0;

  for (const student of students) {

    const feeRecord = fees.find(
      fee => fee.class_name === student.class
    );

    const classFee =
      Number(feeRecord?.term_fee || 0);

    const paid =
      Number(student.total_fees_paid || 0);

    const outstanding =
      Math.max(classFee - paid, 0);

    if (outstanding > 0) {

      const {
        data: upsertData,
        error: upsertError
      } = await supabaseClient
        .from("student_outstanding_fees")
        .upsert({

          school_code:
            currentSchoolCode,

          student_id:
            student.id,

          reg_no:
            student.reg_no,

          student_name:
            student.student_name,

          class_name:
            student.class,

          session:
            "N/A",

          term:
            "N/A",

          // Store the FULL class fee
          original_amount:
            classFee,

          // Store the amount still owing
          remaining_amount:
            outstanding,

          status:
            "Outstanding"

        },
        {
          onConflict:
            "school_code,reg_no"
        });

      console.log(
        "Outstanding Insert:",
        upsertData
      );

      console.log(
        "Outstanding Error:",
        upsertError
      );

      if (upsertError) {
        throw upsertError;
      }

      generated++;

    }

  }

  return generated;

}

function wireStudentsModule() {

  const departmentSelect =
    document.getElementById(
      "studentDepartment"
    );

  departmentSelect
    .addEventListener(
      "change",
      () => {

       
	loadStudentsTable(
        departmentSelect.value
      );

      }
    );

  document
    .getElementById(
      "refreshStudentsBtn"
    )
    .addEventListener(
      "click",
      syncStudentsFromSheet
    );
	 document
    .getElementById(
      "studentSearch"
    )
    .addEventListener(
      "keyup",
      filterStudentsTable
    );

}


function toggleDepartment(department) {

  console.log(
    "CLICKED:",
    department
  );

  const safe =
    department.replace(/\s+/g, "_");

  const dropdown =
    document.getElementById(
      "dropdown-" + safe
    );

  console.log(
    "FOUND:",
    dropdown
  );

  if (!dropdown) return;

  dropdown.style.display =
    dropdown.style.display === "block"
      ? "none"
      : "block";

}

function showTeachers() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>👥 Manage Teachers</h3>

    <p>
      This feature is coming soon.
    </p>

  `;

}

function showSettings() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>⚙️ School Settings</h3>

    <p>
      This feature is coming soon.
    </p>

  `;

}


function logoutSchoolPortal() {

  const confirmed =
    confirm(
      "Are you sure you want to logout?"
    );

  if (!confirmed) return;

  // Clear session
  sessionStorage.removeItem(
    "school_code"
  );

  sessionStorage.clear();

  // Prevent browser returning here
  window.location.replace(
    "index.html"
  );

}

function adminLogout() {

  location.reload();

}


// ==========================
// AUTO LOGOUT (1 MINUTE)
// ==========================

let logoutTimer;

function resetLogoutTimer() {

  clearTimeout(logoutTimer);

  logoutTimer = setTimeout(() => {

    alert(
      "Session expired due to inactivity."
    );

    sessionStorage.removeItem(
  "school_code"
);

sessionStorage.clear();

window.location.replace(
  "index.html"
);

  }, 240000); // 4 minute

}

// User activity events
[
  "click",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart"
].forEach(event => {

  document.addEventListener(
    event,
    resetLogoutTimer
  );

});

// Start timer immediately
resetLogoutTimer();

const logoutBtn =
  document.getElementById(
    "logoutSchoolBtn"
  );

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logoutSchoolPortal
  );

}

async function openTermReport(
  studentId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select(
        "student_name,result_url"
      )
      .eq(
        "id",
        studentId
      )
      .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

  if (
    !data.result_url
  ) {

    alert(
      "No result found for this student."
    );

    return;

  }

  const fileId =
    data.result_url.match(
      /\/d\/([^/]+)\//
    )[1];

  const downloadUrl =
    `https://drive.google.com/uc?export=download&id=${fileId}`;

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <div
  style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:15px;
  "
>

  <h3
    style="
      margin:0;
    "
  >
    ${data.student_name}
  </h3>

  <button
    onclick="showStudentsFees()"
    style="
      border:none;
      background:none;
      font-size:24px;
      cursor:pointer;
      color:#666;
      font-weight:bold;
    "
  >
    ✕
  </button>

</div>

    <iframe
      src="${data.result_url.replace('/view','/preview')}"
      style="
        width:100%;
        height:85vh;
        border:none;
        border-radius:10px;
      "
    ></iframe>

    <div
      style="
        display:flex;
        gap:12px;
        margin-top:20px;
      "
    >

      <button
        class="admin-btn"
        onclick="window.location.href='${downloadUrl}'"
        style="
          flex:1;
          min-height:50px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          font-size:15px;
          font-weight:600;
        "
      >
        ⬇️ Download Result
      </button>

      <button
        class="admin-btn"
        onclick="shareResult(
          '${data.student_name}',
          '${data.result_url}'
        )"
        style="
          flex:1;
          min-height:50px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          font-size:15px;
          font-weight:600;
        "
      >
        📤 Share Result
      </button>

    </div>

  `;

}

window.openTermReport =
  openTermReport;
  
 async function shareResult(
  studentName,
  resultUrl
) {

  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          studentName +
          " Result",

        text:
          studentName +
          " Result",

        url:
          resultUrl

      });

    } else {

      const shareUrl =
        `https://wa.me/?text=${encodeURIComponent(
          studentName +
          " Result: " +
          resultUrl
        )}`;

      window.open(
        shareUrl,
        "_blank"
      );

    }

  } catch (err) {

    console.error(err);

  }

}

window.shareResult =
  shareResult;
  
function togglePaymentsMenu() {

  const menu =
    document.getElementById(
      "paymentsDropdown"
    );

  menu.style.display =
    menu.style.display === "block"
      ? "none"
      : "block";

}

async function loadTermFees() {
console.log(
  "Department:",
  currentDepartment
);

console.log(
  "School:",
  currentSchoolCode
);
  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <div
  style="
    display:flex;
    align-items:center;
    gap:10px;
    flex-wrap:nowrap;
    margin-bottom:15px;
  "
>

  <input
    type="text"
    id="feeSearch"
    placeholder="Search Class"
    style="
      flex:1;
      height:40px;
      font-size:14px;
    "
  >

 <button
  class="admin-btn"
  onclick="printFeesTable()"
  style="
    height:40px;
    padding:0 15px;
    font-size:13px;
    white-space:nowrap;
  "
>
  Print Fees
</button>

  <button
  class="admin-btn"
  onclick="clearAllFees()"
  style="
    height:40px;
    padding:0 15px;
    font-size:13px;
    white-space:nowrap;
  "
>
  Clear All Fees
</button>
</div>

<table class="admin-table">

<thead>

<tr>

<th>Class</th>
<th>Term Fee</th>
<th>Action</th>

</tr>

</thead>

<tbody id="termFeesBody">
</tbody>

</table>
  `;

  await loadTermFeesData();
  document
  .getElementById("feeSearch")
  .addEventListener(
    "keyup",
    filterFeesTable
  );

}

async function loadTermFeesData() {

  console.log("School:", currentSchoolCode);

  // 1. Get all students ONLY to extract classes
  const { data, error } =
    await supabaseClient
      .from("students")
      .select("class")
      .eq("school_code", currentSchoolCode);

  if (error) {
    console.error(error);
    return;
  }

  console.log("STUDENTS RETURNED:", data);

  // 2. Unique + cleaned classes
  const classes = [
    ...new Set(
      data
        .map(x => x.class?.trim())
        .filter(Boolean)
    )
  ];

  console.log("UNIQUE CLASSES:", classes);

  // 3. NOW fetch fees from CORRECT TABLE
  const { data: feeData, error: feeError } =
    await supabaseClient
      .from("class_fees")
      .select("*")
      .eq("school_code", currentSchoolCode);

  if (feeError) {
    console.error(feeError);
    return;
  }

  console.log("CLASS FEES DATA:", feeData);

  // 4. Render table
  const body =
    document.getElementById("termFeesBody");

  body.innerHTML = "";

  classes.forEach(className => {

   const feeRecord = feeData.find(f =>
  f.class_name?.trim().toLowerCase() === className?.trim().toLowerCase()
);

    const fee =
      feeRecord?.term_fee || 0;

    body.innerHTML += `
      <tr style="border-bottom:1px solid #ddd;">

        <td style="padding:8px;">
          ${className}
        </td>

        <td style="padding:8px;">
          ₦${Number(fee).toLocaleString()}
        </td>

        <td style="padding:8px;">
          <button
            class="admin-btn"
            onclick="editClassFee('${className}', ${fee})"
          >
            Edit
          </button>
        </td>

      </tr>
    `;
  });
}

function editClassFee(className, currentFee = 0) {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <div class="fee-form-card">

      <h3>
        Edit Term Fee
      </h3>

      <br>

      <label>
        Class
      </label>

      <input
        type="text"
        value="${className}"
        readonly
      >

      <br><br>

      <label>
        Term Fee
      </label>

      <input
  type="number"
  id="termFeeAmount"
  value="${currentFee}"
  placeholder="Enter Amount"
/>

      <br><br>

      <button
        class="admin-btn"
        onclick="
          saveTermFee(
            '${className}'
          )
        "
      >
        Save Fee
      </button>

    </div>

  `;

}
window.editClassFee =
  editClassFee;
  
async function saveTermFee(
  className
) {

  const amount =
    Number(
      document.getElementById(
        "termFeeAmount"
      ).value
    );

  if (
    isNaN(amount) ||
    amount < 0
  ) {
    alert(
      "Enter a valid fee amount"
    );
    return;
  }

  const { error } =
   await supabaseClient
  .from("class_fees")
  .upsert(
    {
      school_code: currentSchoolCode,
      class_name: className.trim(),
      term_fee: amount
    },
    {
      onConflict: "school_code,class_name"
    }
  );

  if (error) {

    console.error(error);

    alert(
      error.message
    );

    return;

  }

  alert("Fee Saved");

  await loadTermFees();

}

window.saveTermFee =
  saveTermFee;
  
  
function printFeesTable() {

  const table =
    document.querySelector(".admin-table");

  const clonedTable =
    table.cloneNode(true);

  clonedTable
    .querySelectorAll("tr")
    .forEach(row => {

      if (row.cells.length > 2) {
        row.deleteCell(2);
      }

    });

  const printWindow =
    window.open("", "", "width=900,height=700");

  printWindow.document.write(`
    <html>
      <head>
        <title>Term Fees</title>
      </head>
      <body>
        ${clonedTable.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}
window.printFeesTable =
  printFeesTable;
  
  async function clearAllFees() {

  const confirmed =
    confirm(
      "This will delete ALL class fees. Continue?"
    );

  if (!confirmed) return;

  const { error } =
    await supabaseClient
      .from("class_fees")
      .delete()
      .eq(
        "school_code",
        currentSchoolCode
      );

  if (error) {

    console.error(error);

    alert(
      error.message
    );

    return;

  }

  alert(
    "All fees cleared successfully."
  );

  await loadTermFees();

}

window.clearAllFees =
  clearAllFees;
 
 async function viewPaymentHistory(
  studentId
) {

  const {
    data: student
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "id",
        studentId
      )
      .single();

  const {
    data: history
  } =
    await supabaseClient
      .from(
        "payment_history"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "payment_date",
        {
          ascending:false
        }
      );

  let passportUrl = "";

  if (
    student.passport_url
  ) {

    const fileId =
      student.passport_url
        .split("id=")[1];

    passportUrl =
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;

  }

  const totalPaid =
    Number(
      student.total_fees_paid
    ) || 0;

  const classFeeRecord =
    await supabaseClient
      .from("class_fees")
      .select("term_fee")
      .eq(
        "school_code",
        currentSchoolCode
      )
      .eq(
        "class_name",
        student.class
      )
      .single();

  const expectedFee =
    Number(
      classFeeRecord
        .data
        ?.term_fee
    ) || 0;

  const balance =
    expectedFee -
    totalPaid;

  let rows = "";

history.forEach(row => {
	 console.log(
  "RAW PAYMENT DATE:",
  row.payment_date
);
  const paymentDate =
    new Date(
      row.payment_date
    );

  const dateOnly =
    paymentDate.toLocaleDateString(
      "en-NG",
      {
        timeZone: "Africa/Lagos"
      }
    );

  const timeOnly =
    paymentDate.toLocaleTimeString(
      "en-NG",
      {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }
    );

  rows += `

    <tr>

      <td>
        ${dateOnly}
      </td>

      <td>
        ${timeOnly}
      </td>

      <td>
        ₦${Number(
          row.amount_paid
        ).toLocaleString()}
      </td>

      <td>
        ₦${Number(
          row.total_paid
        ).toLocaleString()}
      </td>

    </tr>

  `;

});

  document.getElementById(
    "adminContent"
  ).innerHTML = `

<div
  class="history-card"
>

<div
  style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:15px;
    margin-bottom:20px;
  "
>

<div
  style="
    display:flex;
    align-items:center;
    gap:12px;
  "
>

<img
  src="${passportUrl}"
  style="
    width:70px;
    height:70px;
    border-radius:50%;
    object-fit:cover;
  "
>

<div>

<h3>
  ${student.student_name}
</h3>

<p>
  Total Paid:
  ₦${totalPaid.toLocaleString()}
</p>

<p>
  Balance:
  ₦${balance.toLocaleString()}
</p>

</div>

</div>

<div>

<button
  class="admin-btn"
  onclick="printHistory()"
>
  Print
</button>

<button
  class="admin-btn"
  onclick="loadAllPayments()"
>
  ✕
</button>

</div>

</div>

<table
  class="admin-table"
  id="historyTable"
>

<thead>

<tr>

<th>Date</th>

<th>Time</th>

<th>Amount Paid</th>

<th>Total Paid</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</div>

`;

}

function printHistory() {

  const table =
    document.getElementById(
      "historyTable"
    );

  const win =
    window.open(
      "",
      "",
      "width=900,height=700"
    );

  win.document.write(`

    <html>

    <head>

      <title>
        Payment History
      </title>

    </head>

    <body>

      ${table.outerHTML}

    </body>

    </html>

  `);

  win.document.close();

  win.print();

}

window.printHistory =
  printHistory;

window.viewPaymentHistory =
  viewPaymentHistory;
 
async function loadAllPayments() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <div
      class="payment-toolbar"
    >

      <input
        type="text"
        id="paymentSearch"
        placeholder="Search Student..."
      >

      <button
        class="admin-btn"
        onclick="printPaymentsTable()"
      >
        Print Payments
      </button>

    </div>

    <div
      id="paymentSummary"
    ></div>

    <div
      id="paymentsTableContainer"
    ></div>

  `;

  await loadAllPaymentsData();

  document
    .getElementById(
      "paymentSearch"
    )
    .addEventListener(
      "keyup",
      filterPaymentsTable
    );

}

window.loadAllPayments =
  loadAllPayments;
  
async function loadAllPaymentsData() {

  const {
    data: students,
    error: studentError
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "school_code",
        currentSchoolCode
      );

  if (studentError) {

    console.error(studentError);

    return;

  }

  const {
    data: fees,
    error: feeError
  } =
    await supabaseClient
      .from("class_fees")
      .select("*")
      .eq(
        "school_code",
        currentSchoolCode
      );

  if (feeError) {

    console.error(feeError);

    return;

  }

  let totalStudents = 0;
  let totalExpected = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;

  let html = `

    <table
      class="admin-table"
      id="paymentsTable"
    >

      <thead>

        <tr>

          <th>Student</th>
          <th>Class</th>
          <th>Fee</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Status</th>
		  <th>History</th>

        </tr>

      </thead>

      <tbody>

  `;

  students.forEach(student => {

    const feeRecord =
      fees.find(
        x =>
          x.class_name
            ?.trim()
            .toLowerCase() ===
          student.class
            ?.trim()
            .toLowerCase()
      );

    const expectedFee =
      Number(
        feeRecord?.term_fee
      ) || 0;

    const paid =
      Number(
        student.total_fees_paid
      ) || 0;

    const balance =
      expectedFee - paid;

    totalStudents++;

    totalExpected += expectedFee;

    totalCollected += paid;

    totalOutstanding += balance;

    const status =
      balance <= 0
        ? "Completed"
        : "Owing";
html += `

  <tr>

    <td>
      ${student.student_name}
    </td>

    <td>
      ${student.class || ""}
    </td>

    <td>
      ₦${expectedFee.toLocaleString()}
    </td>

    <td>
      ₦${paid.toLocaleString()}
    </td>

    <td>
      ₦${balance.toLocaleString()}
    </td>

    <td>

      <span
        class="${
          balance <= 0
            ? "status-completed"
            : "status-owing"
        }"
      >

        ${status}

      </span>

    </td>

    <td>

      <button
        class="admin-btn"
        onclick="viewPaymentHistory(${student.id})"
        style="
          padding:4px 10px;
          font-size:12px;
        "
      >
        History
      </button>

    </td>

  </tr>

`;

  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById(
    "paymentSummary"
  ).innerHTML = `

    <div
      class="payment-summary"
    >

      <div
        class="summary-card"
      >

        <h4>
          Total Students
        </h4>

        <p>
          ${totalStudents}
        </p>

      </div>

      <div
        class="summary-card"
      >

        <h4>
          Expected Revenue
        </h4>

        <p>
          ₦${totalExpected.toLocaleString()}
        </p>

      </div>

      <div
        class="summary-card"
      >

        <h4>
          Total Collected
        </h4>

        <p>
          ₦${totalCollected.toLocaleString()}
        </p>

      </div>

      <div
        class="summary-card"
      >

        <h4>
          Outstanding
        </h4>

        <p>
          ₦${totalOutstanding.toLocaleString()}
        </p>

      </div>

    </div>

  `;

  document.getElementById(
    "paymentsTableContainer"
  ).innerHTML =
    html;

}

function filterPaymentsTable() {

  const searchValue =
    document
      .getElementById(
        "paymentSearch"
      )
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      "#paymentsTable tbody tr"
    );

  rows.forEach(row => {

    row.style.display =
      row.innerText
        .toLowerCase()
        .includes(searchValue)
          ? ""
          : "none";

  });

}

function printPaymentsTable() {

  const table =
    document.getElementById(
      "paymentsTable"
    );

  const printWindow =
    window.open(
      "",
      "",
      "width=900,height=700"
    );

  printWindow.document.write(`

    <html>

      <head>

        <title>
          All Payments
        </title>

      </head>

      <body>

        ${table.outerHTML}

      </body>

    </html>

  `);

  printWindow.document.close();

  printWindow.print();

}

window.printPaymentsTable =
  printPaymentsTable;
  
 
  
function filterFeesTable() {

  const searchValue =
    document
      .getElementById("feeSearch")
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      "#termFeesBody tr"
    );

  rows.forEach(row => {

    const rowText =
      row.innerText
        .toLowerCase();

    row.style.display =
      rowText.includes(searchValue)
        ? ""
        : "none";

  });

}



async function restoreLastRollover() {

const proceed = confirm(

`This will restore the LAST cleared payment records.

This action will:

• Restore student payments

• Restore total fees paid

• Remove Current Term Outstanding Fees

• Remove Previous Term Outstanding Fees

• Change Previous Term payments back to Current Term

Do you want to continue?`

);

if (!proceed) return;


// ========================================
// FIND LATEST ARCHIVE BATCH
// ========================================

const {

data: lastBatch,

error: lastBatchError

} = await supabaseClient

.from("finance_archive")

.select("archive_batch_id")

.order("archived_at", { ascending: false })

.limit(1)

.single();

if (lastBatchError) {

alert("No archive found.");

return;

}

const batchId = lastBatch.archive_batch_id;


// ========================================
// LOAD ARCHIVE RECORDS
// ========================================

const {

data: archiveRows,

error: archiveError

} = await supabaseClient

.from("finance_archive")

.select("*")

.eq("archive_batch_id", batchId);

if (archiveError) {

alert(archiveError.message);

return;

}


// ========================================
// REBUILD student_payments
// ========================================

const paymentRows = archiveRows.map(row => ({

school_code: row.school_code,

student_id: row.student_id,

student_name: row.student_name,

reg_no: row.reg_no,

department: row.department,

class: row.class,

amount_paid: row.amount_paid

}));

const {

error: insertError

} = await supabaseClient

.from("student_payments")

.insert(paymentRows);


// IMPORTANT
// CHECK IMMEDIATELY

if (insertError) {

alert(insertError.message);

return;

}


// ========================================
// RESTORE TOTAL FEES PAID
// ========================================

const restoredStudents = {};

archiveRows.forEach(row => {

if (!restoredStudents[row.student_id]) {

restoredStudents[row.student_id] =

Number(row.total_fees_paid || 0);

}

});

for (const studentId in restoredStudents) {

const {

error: updateError

} = await supabaseClient

.from("students")

.update({

total_fees_paid:

restoredStudents[studentId]

})

.eq("id", studentId);

if (updateError) {

throw updateError;

}

}


// ========================================
// RESTORE PAYMENT HISTORY REMARKS
// ========================================

const {

error: historyRestoreError

} = await supabaseClient

.from("payment_history")

.update({

remarks:

"Current Term Payment"

})

.eq(

"school_code",

currentSchoolCode

)

.eq(

"remarks",

"Previous Term Payment"

);

if (historyRestoreError) {

throw historyRestoreError;

}


// ========================================
// DELETE RESTORED ARCHIVE
// ========================================

const {

error: archiveDeleteError

} = await supabaseClient

.from("finance_archive")

.delete()

.eq(

"archive_batch_id",

batchId

);

if (archiveDeleteError) {

throw archiveDeleteError;

}


// ========================================
// REMOVE GENERATED OUTSTANDING FEES
// ========================================

const {

error: deleteOutstandingError

} = await supabaseClient

.from("student_outstanding_fees")

.delete()

.eq(

"school_code",

currentSchoolCode

);

if (deleteOutstandingError) {

throw deleteOutstandingError;

}


// ========================================
// VERIFY OUTSTANDING TABLE IS EMPTY
// ========================================

const {

data: remainingOutstanding,

error: remainingError

} = await supabaseClient

.from("student_outstanding_fees")

.select("*")

.eq(

"school_code",

currentSchoolCode

);

console.log(

"Outstanding Remaining After Restore:",

remainingOutstanding

);

console.log(

"Remaining Error:",

remainingError

);

// ========================================
// REMOVE PREVIOUS TERM OUTSTANDING
// ========================================

const {

error: deletePreviousOutstandingError

} = await supabaseClient

.from("student_previous_outstanding_fees")

.delete()

.eq(

"school_code",

currentSchoolCode

);

if (deletePreviousOutstandingError) {

throw deletePreviousOutstandingError;

}

// ========================================
// SUCCESS
// ========================================

alert(

"Latest rollover restored successfully."

);

}

// ==========================
// FOOTER YEAR
// ==========================
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


document.addEventListener("click", async (e) => {

  if (e.target && e.target.id === "openDriveBtn") {

    document.getElementById("adminContent").innerHTML =
      "<p>Opening School Drive...</p>";

    const res = await fetch("https://script.google.com/macros/s/AKfycbzf6-sPVZl2ggJcp2ovlBhLMwNL2K9m1R0ch5doIg50mcJ0o6GZNKFv9FcxcL-WTpwuSQ/exec", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "openSchoolDrive",
        schoolCode: schoolCode
      })
    });

    const data = await res.json();

    if (data.success) {
      window.open(data.url, "_blank"); // opens Drive folder
    } else {
      document.getElementById("adminContent").innerHTML =
        "<p>Drive not found.</p>";
    }
  }

});
