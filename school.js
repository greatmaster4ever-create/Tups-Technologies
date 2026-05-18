// 🔗 SUPABASE CONFIG
const supabaseUrl = "https://sgdrncpiqingjwxmkqij.supabase.co";
const supabaseKey = "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 🏫 GET SCHOOL CODE FROM HTML
const SCHOOL_CODE = document.body.dataset.school;

// 👁 PASSWORD TOGGLE
window.togglePassword = function () {
  const input = document.getElementById("subjectPassword");
  input.type = input.type === "password" ? "text" : "password";
};

// 👁 CHANGE PASSWORD TOGGLE
window.toggleChangePassword = function () {
  const input = document.getElementById("newSubjectPassword");
  input.type = input.type === "password" ? "text" : "password";
};

// 🔽 LOAD SUBJECTS (ADMIN = ALL, TEACHER = FILTERED)
async function loadSubjects(department, isAdmin = false) {

  const datalist = document.getElementById("subjectsList");

  datalist.innerHTML = "";

  let query = supabaseClient
    .from("subjects")
    .select("subject")
    .eq("school_code", SCHOOL_CODE);

  // 👇 ONLY FILTER FOR TEACHERS
  if (!isAdmin && department) {
    query = query.ilike("department", department);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading subjects:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.warn("No subjects found");
    return;
  }

  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.subject;
    datalist.appendChild(option);
  });
}

// 🔽 LOAD ALL SUBJECTS INTO CHANGE PASSWORD DROPDOWN
async function loadChangePasswordSubjects() {

  const select = document.getElementById("changeSubject");

  const { data, error } = await supabaseClient
    .from("subjects")
    .select("subject")
    .eq("school_code", SCHOOL_CODE)
    .order("subject", { ascending: true });

  if (error) {
    console.error("Error loading subjects:", error);
    return;
  }

  select.innerHTML = '<option value="">Select Subject</option>';

  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.subject;
    option.textContent = item.subject;
    select.appendChild(option);
  });
}

// 🚪 OPEN POPUP
window.openChangePasswordModal = function () {

  document.getElementById("passwordModal").style.display = "flex";

  // 🔄 RELOAD SUBJECTS EACH TIME MODAL OPENS
  loadChangePasswordSubjects();
};

// ❌ CLOSE POPUP
window.closeChangePasswordModal = function () {

  document.getElementById("passwordModal").style.display = "none";

  document.getElementById("changePasswordForm").reset();
};

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {

  if (!SCHOOL_CODE) {
    console.error("No school code found in HTML (data-school)");
    alert("School configuration error");
    return;
  }

  const departmentSelect = document.getElementById("department");
  const subjectInput = document.getElementById("subject");
  const cadreSelect = document.getElementById("cadre");

  // 🔥 MODAL ELEMENTS
  const passwordModal = document.getElementById("passwordModal");

  // LOAD CHANGE PASSWORD SUBJECTS
  loadChangePasswordSubjects();

  // 🔁 HANDLE ROLE CHANGE (ADMIN vs TEACHER)
  cadreSelect.addEventListener("change", () => {

    const isAdmin = cadreSelect.value === "Admin";

    // disable department for admin
    departmentSelect.disabled = isAdmin;

    if (isAdmin) {

      departmentSelect.value = "";

      // load ALL subjects for admin
      loadSubjects(null, true);

    } else {

      // clear + require department for teachers
      subjectInput.value = "";
      document.getElementById("subjectsList").innerHTML = "";
    }
  });

  // 🔁 LOAD SUBJECTS WHEN DEPARTMENT CHANGES (TEACHER ONLY)
  departmentSelect.addEventListener("change", () => {

    if (cadreSelect.value !== "Admin") {

      subjectInput.value = "";

      loadSubjects(departmentSelect.value, false);
    }
  });

  // ❌ CLOSE MODAL WHEN CLICKING OUTSIDE
  window.addEventListener("click", (e) => {

    if (e.target === passwordModal) {

      closeChangePasswordModal();
    }
  });

  // =========================
  // 🔐 LOGIN FORM
  // =========================
  document.getElementById("subjectForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const subject = subjectInput.value.trim();
    const password = document.getElementById("subjectPassword").value.trim();
    const cadre = cadreSelect.value;
    const department = departmentSelect.value;

    // ⚠️ Teacher must pick department
    if (cadre !== "Admin" && !department) {

      alert("Please select a department");
      return;
    }

    let query = supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", SCHOOL_CODE)
      .ilike("subject", subject);

    // 👇 APPLY FILTER ONLY FOR TEACHERS
    if (cadre !== "Admin") {

      query = query.ilike("department", department);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {

      alert("Subject not found");
      console.warn("Query result:", data, error);
      return;
    }

    // 🔐 ADMIN PORTAL
    if (
      cadre === "Admin" &&
      subject.toUpperCase() === "ADMIN PORTAL" &&
      password === data.admin_password
    ) {

      window.open(data.sheet_url, "_blank");
      return;
    }

    // 👨‍💼 ADMIN ACCESS
    if (
      cadre === "Admin" &&
      password === data.admin_password
    ) {

      window.open(data.sheet_url, "_blank");
      return;
    }

    // 👨‍🏫 TEACHER ACCESS
    if (password === data.subject_password) {

      window.open(data.sheet_url, "_blank");
      return;
    }

    alert("Invalid subject password");
  });

  // =========================
  // 🔄 CHANGE PASSWORD FORM
  // =========================
  document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const subject = document.getElementById("changeSubject").value;

    const adminPassword = document.getElementById("adminPassword").value.trim();

    const newPassword = document.getElementById("newSubjectPassword").value.trim();

    if (!subject || !adminPassword || !newPassword) {

      alert("Please complete all fields");
      return;
    }

    // 🔍 VERIFY ADMIN PASSWORD
    const { data, error } = await supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", SCHOOL_CODE)
      .ilike("subject", subject)
      .maybeSingle();

    if (error || !data) {

      alert("Subject not found");
      return;
    }

    // ❌ WRONG ADMIN PASSWORD
    if (adminPassword !== data.admin_password) {

      alert("Wrong admin password");
      return;
    }

    // ✅ UPDATE PASSWORD
    const { error: updateError } = await supabaseClient
      .from("subjects")
      .update({
        subject_password: newPassword
      })
      .eq("school_code", SCHOOL_CODE)
      .ilike("subject", subject);

    if (updateError) {

      console.error(updateError);
      alert("Failed to update password");
      return;
    }

    alert("Subject password updated");

    // CLOSE POPUP
    closeChangePasswordModal();
  });

});