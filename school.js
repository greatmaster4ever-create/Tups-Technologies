// 🔗 SUPABASE CONFIG
const supabaseUrl = "https://sgdrncpiqingjwxmkqij.supabase.co";
const supabaseKey = "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 👁 PASSWORD TOGGLE
window.togglePassword = function () {
  const input = document.getElementById("subjectPassword");
  input.type = input.type === "password" ? "text" : "password";
};

// 🔽 LOAD SUBJECTS INTO DROPDOWN
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

  datalist.innerHTML = "";

  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.subject;
    datalist.appendChild(option);
  });
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  loadSubjects();

  // FORM LOGIN
  document.getElementById("subjectForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const password = document.getElementById("subjectPassword").value.trim();
    const cadre = document.getElementById("cadre").value;

    const { data, error } = await supabaseClient
      .from("subjects")
      .select("*")
      .eq("school_code", "SCH001")
      .ilike("subject", subject)
      .maybeSingle();

    if (error || !data) {
      alert("Subject not found");
      return;
    }

    // Admin login
    if (cadre === "Admin" && password === data.admin_password) {
      window.location.href = data.sheet_url;
      return;
    }

    // Teacher login
    if (password === data.subject_password) {
      window.location.href = data.sheet_url;
      return;
    }

    alert("Invalid subject password");
  });
});