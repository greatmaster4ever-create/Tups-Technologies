const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("subjectForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject = document.getElementById("subject").value.trim();
  const password = document.getElementById("subjectPassword").value.trim();
  const cadre = document.getElementById("cadre").value;

  const { data, error } = await supabaseClient
    .from("subjects")
    .select("*")
    .eq("subject", subject)
    .single();

  if (error || !data) {
    alert("Subject not found");
    return;
  }

  // Admin access
  if (cadre === "Admin" && password === data.admin_password) {
    window.location.href = data.sheet_url;
    return;
  }

  // Teacher access
  if (password === data.subject_password) {
    window.location.href = data.sheet_url;
    return;
  }

  alert("Invalid subject password");
});
