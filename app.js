console.log("APP JS LOADED");

// 🔴 REPLACE THESE WITH YOUR REAL SUPABASE DETAILS
const supabaseUrl = "https://sgdrncpiqingjwxmkqij.supabase.co";
const supabaseKey = "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

// create client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const schoolCode = document.getElementById("schoolCode").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabaseClient
      .from("schools")
      .select("*")
      .eq("school_code", schoolCode)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Invalid login details");
      return;
    }

    alert("Login successful → " + data.school_page);

    // NEXT STEP (we will enable redirect later)
    // window.location.href = data.school_page;
  });
});