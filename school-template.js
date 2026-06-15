console.log("SCHOOL TEMPLATE JS LOADED");

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

  if (error || !data) {
    console.error(error);
    alert("School not found");
    return;
  }

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

<button
  class="admin-tab"
  onclick="showPayments()"
>
  💳 Payments
</button>

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

      document.querySelector(
        ".admin-card"
      ).innerHTML =
        adminDashboardHTML;

    }
  );


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
    Refresh List
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

          <button
            onclick="
              viewStudentInfo(
                ${student.id}
              )
            "
          >

            Info

          </button>

          <button
            onclick="
              openTermReport(
                ${student.id}
              )
            "
          >

            Term Report

          </button>

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

   <img
  src="${passportUrl}"
  class="student-passport"
>

      <h3>
        ${data.student_name}
      </h3>

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

  if (error) {

    alert(
      error.message
    );

    return;

  }

  const currentTotal =
    Number(
      data.total_fees_paid
    ) || 0;

  const updatedTotal =
    currentTotal +
    newAmount;

  const {
    error: updateError
  } =
    await supabaseClient
      .from("students")
      .update({

        parent_contact1:
          parent1,

        parent_contact2:
          parent2,

        address:
          address,

        total_fees_paid:
          updatedTotal

      })
      .eq(
        "id",
        studentId
      );

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

  }, 60000); // 1 minute

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

