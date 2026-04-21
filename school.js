const supabaseUrl = "https://sgdrncpiqingjwxmkqij.supabase.co";
const supabaseKey = "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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
    .single();

  if (error || !data) {
    alert("Subject not found");
    return;
  }

  if (cadre === "Admin" && password === data.admin_password) {
    window.location.href = data.sheet_url;
    return;
  }

  if (password === data.subject_password) {
    window.location.href = data.sheet_url;
    return;
  }

  alert("Invalid subject password");
});

window.togglePassword = function () {
  const input = document.getElementById("subjectPassword");
  input.type = input.type === "password" ? "text" : "password";
};