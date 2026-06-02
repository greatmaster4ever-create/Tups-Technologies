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

if (!schoolCode) {
  alert("Session expired. Please login again.");
  window.location.href = "index.html";
}


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
    emailEl.textContent = data.contact_email;

  const phoneEl = document.getElementById("schoolPhone");
  if (phoneEl && data.phone)
    phoneEl.textContent = data.phone;

  if (data.primary_color)
    document.documentElement.style.setProperty("--primary-color", data.primary_color);

  if (data.secondary_color)
    document.documentElement.style.setProperty("--secondary-color", data.secondary_color);
}

// ==========================
// LOAD SUBJECTS
// ==========================
async function loadSubjects(department, isAdmin = false) {

  const datalist =
    document.getElementById("subjectsList");

  datalist.innerHTML = "";

  let query =
    supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", schoolCode);

  if (!isAdmin && department) {
    query = query.ilike("department", department);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  currentSubjects = data || [];
  
  console.log(
  "Current School:",
  schoolCode
);

console.log(
  "Subjects Loaded:",
  currentSubjects.length
);

console.table(currentSubjects);

  currentSubjects.forEach(sub => {
    const option = document.createElement("option");
    option.value = sub.subject;
    datalist.appendChild(option);
  });

  if (!schoolCode) {
  console.error("ABORT: schoolCode is missing");
  return;
}
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
      s.department === department &&
      s.cadre === cadre &&
      s.subject_password === password
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
    loadSubjects();
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
  if (cadreSelect.value !== "Admin") {
    subjectInput.value = "";
    loadSubjects(departmentSelect.value, false);
  }
});
// ==========================
// FOOTER YEAR
// ==========================
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
