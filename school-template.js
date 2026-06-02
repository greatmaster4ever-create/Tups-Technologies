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
// must be set during login redirect
const schoolCode =
  sessionStorage.getItem("school_code");

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

  // update UI
  const schoolNameEl =
    document.getElementById("schoolName");

  const pageTitle =
    document.getElementById("pageTitle");

  if (schoolNameEl) {
    schoolNameEl.textContent =
      data.School_name;
  }

  if (pageTitle) {
    pageTitle.textContent =
      data.School_name;
  }

/* SCHOOL LOGO */

const schoolLogo =
  document.getElementById(
    "schoolLogo"
  );

if (
  schoolLogo &&
  data.logo_url
) {

  schoolLogo.src =
    data.logo_url;

}

/* CONTACT DETAILS */

const emailEl =
  document.getElementById(
    "schoolEmail"
  );

const phoneEl =
  document.getElementById(
    "schoolPhone"
  );

if (
  emailEl &&
  data.contact_email
) {

  emailEl.textContent =
    data.contact_email;

}

if (
  phoneEl &&
  data.phone
) {

  phoneEl.textContent =
    data.phone;

}

 /* BRAND COLORS */

if (
  data.primary_color
) {

  document
    .documentElement
    .style
    .setProperty(
      "--primary-color",
      data.primary_color
    );

}

if (
  data.secondary_color
) {

  document
    .documentElement
    .style
    .setProperty(
      "--secondary-color",
      data.secondary_color
    );

}

}


// ==========================
// LOAD SUBJECTS
// ==========================
async function loadSubjects() {

  const { data, error } =
    await supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", schoolCode);

  if (error) {

    console.error(error);

    return;

  }

  currentSubjects = data || [];

  const datalist =
    document.getElementById("subjectsList");

  const changeSubject =
    document.getElementById("changeSubject");

  if (datalist) {
    datalist.innerHTML = "";
  }

  if (changeSubject) {
    changeSubject.innerHTML =
      `<option value="">Select Subject</option>`;
  }

  currentSubjects.forEach(sub => {

    // fill datalist
    if (datalist) {

      const option =
        document.createElement("option");

      option.value = sub.subject;

      datalist.appendChild(option);

    }

    // fill modal dropdown
    if (changeSubject) {

      const option =
        document.createElement("option");

      option.value = sub.subject;

      option.textContent = sub.subject;

      changeSubject.appendChild(option);

    }

  });

}


// ==========================
// ACCESS SUBJECT
// ==========================
document
  .getElementById("subjectForm")
  .addEventListener("submit", (e) => {

    e.preventDefault();

    const cadre =
      document.getElementById("cadre").value;

    const department =
      document.getElementById("department").value;

    const subject =
      document.getElementById("subject").value;

    const password =
      document.getElementById("subjectPassword").value;

    const match =
      currentSubjects.find(s =>
        s.subject === subject &&
        s.department === department &&
        s.cadre === cadre &&
        s.subject_password === password
      );

    if (!match) {

      alert("Invalid subject login");

      return;

    }

    // redirect to sheet
    window.location.href =
      match.sheet_url;

  });


// ==========================
// CHANGE PASSWORD
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
// MODAL CONTROLS (SAFE)
// ==========================
function openChangePasswordModal() {

  document.getElementById("passwordModal")
    .style.display = "block";

}

function closeChangePasswordModal() {

  document.getElementById("passwordModal")
    .style.display = "none";

}

function togglePassword() {

  const input =
    document.getElementById("subjectPassword");

  input.type =
    input.type === "password"
      ? "text"
      : "password";

}

function toggleChangePassword() {

  const input =
    document.getElementById("newSubjectPassword");

  input.type =
    input.type === "password"
      ? "text"
      : "password";

}


// ==========================
// INIT APP
// ==========================
loadSchoolInfo();
loadSubjects();


// ==========================
// FOOTER YEAR (SAFE)
// ==========================
document.getElementById("year").textContent =
  new Date().getFullYear();
