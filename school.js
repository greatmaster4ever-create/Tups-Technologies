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

  if (!department) {
    datalist.innerHTML = "";
    return;
  }

  console.log("Selected Department:", department);

  const { data, error } = await supabaseClient
    .from("subjects")
    .select("subject, department")
    .eq("school_code", SCHOOL_CODE)
    .ilike("department", department); // ✅ FIXED (case-insensitive)

  if (error) {
    console.error("Error loading subjects:", error);
    return;
  }

  console.log("Subjects from DB:", data);

  datalist.innerHTML = "";

  if (!data || data.length === 0) {
    console.warn("No subjects found for this department");
    return;
  }

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

  // 🔁 OPTIONAL: auto-load if already selected (useful later)
  if (departmentSelect.value) {
    loadSubjects(departmentSelect.value);
  }

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

    // 🔥 ADMIN PORTAL BYPASS (NO DEPARTMENT FILTER)
    if (subject.toUpperCase() !== "ADMIN PORTAL") {
      query = query.ilike("department", department); // ✅ FIXED HERE TOO
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
      window.location.href = data.sheet_url;
      return;
    }

    // 👨‍💼 ADMIN ACCESS
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