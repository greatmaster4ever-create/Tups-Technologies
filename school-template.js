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
let schoolCode = null;

function getSchoolCode() {
  const code = sessionStorage.getItem("school_code");
  console.log("SESSION STORAGE VALUE:", code);
  return code;
}

schoolCode = getSchoolCode();

if (!schoolCode) {
  alert("Session expired. Please login again.");
  window.location.href = "index.html";
  throw new Error("Missing school code");
}

console.log("SCHOOL CODE LOADED:", schoolCode);



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

  const match = currentSubjects.find(s =>
  s.subject === subject &&
  s.subject_password === password &&
  (
    cadre === "Admin"
      ? true
      : (
          s.department === department &&
          s.cadre === cadre
        )
  )
);

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
      📊 Master Sheet
    </button>

    <button
      class="admin-tab"
      onclick="showTeachers()"
    >
      👥 Teachers
    </button>

    <button
      class="admin-tab"
      onclick="showSettings()"
    >
      ⚙️ Settings
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
    function () {

      const password =
        document.getElementById(
          "adminPortalPassword"
        ).value;

      if (!password) {
        alert(
          "Please enter Admin Password."
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



function createDepartment(
  dept
) {

  return `

  <div class="department-item">

    <div
      class="department-header"

      onclick="
        toggleDepartment(
          '${dept.department}'
        )
      "

    >

      ${dept.department}

    </div>

    <div

      class="department-dropdown"

      id="
        dropdown-${dept.department}
      "

    >

      <div

        class="dropdown-item"

        onclick="
          window.open(
            '${dept.spreadsheet_url}',
            '_blank'
          )
        "

      >

        📋 Master Spreadsheet

      </div>

      <div

        class="dropdown-item"

        onclick="
          window.open(
            '${dept.broadsheet_url}',
            '_blank'
          )
        "

      >

        📊 Master Broadsheet

      </div>

    </div>

  </div>

  `;

}

async function showMasterSheet() {

  const { data, error } = await supabaseClient
    .from("department_resources")
    .select("*")
    .eq("school_code", schoolCode);

  if (error) {
    console.error(error);
    return;
  }

  console.log("MASTER SHEET DATA:", data);

  let html = "<div class='department-list'>";

  for (const row of data) {

    html += `
      <div class="department-item">

        <div class="department-header">
          ${row.department}
        </div>

        <div class="department-dropdown">

          <div class="dropdown-item"
            onclick="window.open('${row.master_sheet_url}', '_blank')">
            📊 Open Master Sheet
          </div>

          <div class="dropdown-item"
            onclick="window.open('${row.broadsheet_url}', '_blank')">
            📑 Open Broadsheet
          </div>

        </div>

      </div>
    `;

  }

  html += "</div>";

  document.getElementById("adminContent").innerHTML = html;
}

function toggleDepartment(
  department
) {

  document
    .querySelectorAll(
      ".department-dropdown"
    )
    .forEach(
      item => {

        if (
          item.id !==
          "dropdown-" +
          department
        ) {
          item.style.display =
            "none";
        }

      }
    );

  const dropdown =
    document.getElementById(
      "dropdown-" +
      department
    );

  if (
    dropdown.style.display ===
    "block"
  ) {

    dropdown.style.display =
      "none";

  } else {

    dropdown.style.display =
      "block";

  }

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

    window.location.href =
      "index.html";

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

// ==========================
// FOOTER YEAR
// ==========================
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
