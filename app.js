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

    alert("Login successful");
    
  sessionStorage.setItem(
  "school_code",
  data.school_code
);

    window.location.href = data.school_page;

    // NEXT STEP (we will enable redirect later)
    // window.location.href = data.school_page;
  });
});

function openResultChecker() {
  document.getElementById("resultModal").style.display = "flex";

  document.getElementById("resultSchoolCode").value = "";
  document.getElementById("resultAdmissionNo").value = "";
  document.getElementById("resultViewer").innerHTML = "";
}

window.openResultChecker =
  openResultChecker;

function closeResultChecker() {
  // 1. Hide modal
  document.getElementById("resultModal").style.display = "none";

  // 2. Clear input fields
  document.getElementById("resultSchoolCode").value = "";
  document.getElementById("resultAdmissionNo").value = "";

  // 3. Clear previous result display
  document.getElementById("resultViewer").innerHTML = "";
}

async function checkStudentResult() {

  const schoolCode =
    document.getElementById(
      "resultSchoolCode"
    ).value.trim();

  const regNo =
    document.getElementById(
      "resultRegNo"
    ).value.trim();

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "school_code",
        schoolCode
      )
      .eq(
        "reg_no",
        regNo
      )
      .single();

  if (error || !data) {

    alert(
      "Student not found."
    );

    return;

  }

  const {
    data: fee
  } =
    await supabaseClient
      .from("class_fees")
      .select("term_fee")
      .eq(
        "school_code",
        schoolCode
      )
      .eq(
        "class_name",
        data.class
      )
      .single();

  const expected =
    Number(
      fee?.term_fee
    ) || 0;

  const paid =
    Number(
      data.total_fees_paid
    ) || 0;

  if (paid < expected) {

    document.getElementById(
      "resultViewer"
    ).innerHTML = `

      <p style="
        color:red;
        font-weight:bold;
      ">
        Result unavailable.
        Please contact the school administrator.
      </p>

    `;

    return;

  }

  document.getElementById(
    "resultViewer"
  ).innerHTML = `

    <iframe
      src="${
        data.result_url.replace(
          "/view",
          "/preview"
        )
      }"
      style="
        width:100%;
        height:500px;
        border:none;
      "
    ></iframe>

    <br><br>

    <button
      onclick="
        window.open(
          '${data.result_url}'
        )
      "
    >
      Download Result
    </button>

  `;
}