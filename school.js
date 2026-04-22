// 🔗 SUPABASE CONFIG
const supabaseUrl = "https://sgdrncpiqingjwxmkqij.supabase.co";
const supabaseKey = "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


// 👁 PASSWORD TOGGLE (GLOBAL)
window.togglePassword = function () {
  const input = document.getElementById("subjectPassword");

  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
};


// 🔽 LOAD SUBJECTS FROM SUPABASE
async function loadSubjects() {
  const datalist = document.getElementById("subjectsList");

  const { data, error } = await supabaseClient
    .from("subjects")
    .select("subject")
    .eq("school_code", "SCH001");

  if (error) {
    console.error("Error loading subjects:", error);
    return;
  }

  // Clear old options
  datalist.innerHTML = "";

  // Add new options
  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.subject;
    datalist.appendChild(option);
  });
}


// 🚀 RUN AFTER PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {

  // 🔽 Load subjects into dropdown
  loadSubjects();

  // 🔽 FORM SUBMISSION
  const form = document.getElementById("subjectForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const password = document.getElementById("subjectPassword").value.trim();
    const cadre = document.getElementById("cadre").value;

    const { data, error } = await supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", "SCH001")
      .ilike("subject", subject)
      .single();

    if (error || !data) {
      alert("Subject not found");
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