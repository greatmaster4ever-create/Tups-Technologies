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

// 🔽 LOAD SUBJECTS BASED ON DEPARTMENT
async function loadSubjects(department) {
  const datalist = document.getElementById("subjectsList");

  // Clear if no department selected
  if (!department) {
    datalist.innerHTML = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("subjects")
    .select("subject")
    .eq("school_code", SCHOOL_CODE)
    .eq("department", department);

  if (error) {
    console.error("Error loading subjects:", error);
    return;
  }

  datalist.innerHTML = "";

  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.subject;
    datalist.appendChild(option);
  });
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {

  // ⚠️ SAFETY CHECK
  if (!SCHOOL_CODE) {
    console.error("No school code found in HTML (data-school)");
    alert("School configuration error");
    return;
  }

  const departmentSelect = document.getElementById("department");
  const subjectInput = document.getElementById("subject");

  // 🔁 LOAD SUBJECTS ON DEPARTMENT CHANGE
  departmentSelect.addEventListener("change", () => {
    const selectedDept = departmentSelect.value;

    subjectInput.value = "";
    loadSubjects(selectedDept);
  });

  // FORM LOGIN
  document.getElementById("subjectForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const subject = subjectInput.value.trim();
    const password = document.getElementById("subjectPassword").value.trim();
    const cadre = document.getElementById("cadre").value;
    const department = departmentSelect.value;

    if (!department) {
      alert("Please select a department");
      return;
    }

    let query = supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", SCHOOL_CODE)
      .ilike("subject", subject);

    // 🔥 SPECIAL CASE: ADMIN PORTAL (NO DEPARTMENT FILTER)
    if (subject.toUpperCase() !== "ADMIN PORTAL") {
      query = query.eq("department", department);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      alert("Subject not found");
      return;
    }

    // 🔐 ADMIN PORTAL OVERRIDE (GLOBAL ACCESS)
    if (
      cadre === "Admin" &&
      subject.toUpperCase() === "ADMIN PORTAL" &&
      password === data.admin_password
    ) {
      window.location.href = data.sheet_url;
      return;
    }

    // 👨‍💼 NORMAL ADMIN ACCESS
    if (cadre === "Admin" && password === data.admin_password) {
      window.location.href = data.sheet_url;
      return;
    }

    // 👨‍🏫 TEACHER ACCESS
    if (password === data.subject_password) {
      window.location.href = data.sheet_url;
      return;
    }

    alert("Invalid subject password");
  });
});