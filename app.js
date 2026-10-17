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
  document.getElementById("resultRegNo").value = "";
  document.getElementById("resultViewer").innerHTML = "";
}

window.openResultChecker =
  openResultChecker;

function closeResultChecker() {
  // 1. Hide modal
  document.getElementById("resultModal").style.display = "none";

  // 2. Clear input fields
  document.getElementById("resultSchoolCode").value = "";
  document.getElementById("resultRegNo").value = "";

  document
.getElementById("resultCard")
.classList.remove("show-result");

  // 3. Clear previous result display
  document.getElementById("resultViewer").innerHTML = "";
}

function downloadResult(fileUrl) {

  const match =
    fileUrl.match(/\/d\/(.*?)\//);

  if (!match) {
    alert("Invalid Google Drive link.");
    return;
  }

  const fileId = match[1];

  const downloadUrl =
    `https://drive.google.com/uc?export=download&id=${fileId}`;

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.target = "_self";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function checkStudentResult() {
  const schoolCode = document
    .getElementById("resultSchoolCode")
    .value.trim();

  const regNo = document
    .getElementById("resultRegNo")
    .value.trim();

  const resultCard = document.getElementById("resultCard");
  const resultViewer = document.getElementById("resultViewer");

  resultCard.classList.add("show-result");
  resultViewer.innerHTML = `
    <p style="font-weight:bold;">Checking student details and fee status...</p>
  `;

  try {
    // 1. Find the student.
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .eq("school_code", schoolCode)
      .eq("reg_no", regNo)
      .single();

    if (error || !data) {
      resultViewer.innerHTML = `
        <p style="color:red;font-weight:bold;">
          Student not found. Please check the School Code and Admission Number.
        </p>
      `;
      return;
    }

    // 2. Retrieve the applicable class fee.
    const { data: fee, error: feeError } = await supabaseClient
      .from("class_fees")
      .select("term_fee")
      .eq("school_code", schoolCode)
      .eq("class_name", data.class)
      .single();

    if (feeError && feeError.code !== "PGRST116") {
      resultViewer.innerHTML = `
        <p style="color:red;font-weight:bold;">
          Unable to verify the student's fees. Please try again later.
        </p>
      `;
      return;
    }

    // Preserve the existing rule: no matching fee record means expected fee is 0.
    const expected = Number(fee?.term_fee) || 0;
    const paid = Number(data.total_fees_paid) || 0;
    const fullyPaid = paid >= expected;

    // 3. Ask the Edge Function to check the student's exception.
    // This also lets the function reset the exception when fees are fully paid.
    let allowUnpaidResults = false;
    let accessCheckSucceeded = false;

    try {
      const accessResponse = await fetch(
        `${supabaseUrl}/functions/v1/student-result-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey
          },
          body: JSON.stringify({
            action: "get",
            school_code: schoolCode,
            reg_no: regNo
          })
        }
      );

      if (accessResponse.ok) {
        const accessData = await accessResponse.json();

        if (typeof accessData.allow_unpaid_results === "boolean") {
          allowUnpaidResults = accessData.allow_unpaid_results;
          accessCheckSucceeded = true;
        }
      }
    } catch (accessError) {
      console.error("Student result access check failed:", accessError);
    }

    // 4. Fully paid students can view results automatically.
    // The Edge Function has also been asked to reset their exception.
    if (!fullyPaid) {
      // If the access service fails, do not grant an unpaid-result exception.
      if (!accessCheckSucceeded || !allowUnpaidResults) {
        resultViewer.innerHTML = `
          <p style="color:red;font-weight:bold;">
            Result unavailable. Please contact the school administrator/accounts.
          </p>
        `;
        return;
      }
    }

    // 5. Check that a result has actually been published.
    if (
      typeof data.result_url !== "string" ||
      !data.result_url.trim()
    ) {
      resultViewer.innerHTML = `
        <p style="font-weight:bold;">
          No result has been published yet. Please contact the school.
        </p>
      `;
      return;
    }

    // 6. Display the result and preserve the existing download feature.
    const previewUrl = data.result_url.replace("/view", "/preview");

    resultViewer.innerHTML = `
      <iframe
        src="${previewUrl}"
        style="width:100%;height:65vh;border:none;"
      ></iframe>

      <br><br>

      <button type="button" id="downloadBtn">
        Download Result
      </button>
    `;

    document.getElementById("downloadBtn").addEventListener("click", function (e) {
      e.preventDefault();
      downloadResult(data.result_url);
    });

  } catch (error) {
    console.error("Result checker error:", error);

    resultViewer.innerHTML = `
      <p style="color:red;font-weight:bold;">
        Something went wrong while checking the result. Please try again.
      </p>
    `;
  }
}

/* =====================================================
   STUDENT INFO CHECKER
   NEW MODULE — DO NOT MODIFY EXISTING CODE ABOVE
===================================================== */

function openStudentInfoChecker() {

    const modal =
        document.getElementById(
            "studentInfoModal"
        );

    if (!modal) {
        console.error(
            "Student Info modal not found."
        );
        return;
    }

    document.getElementById(
        "studentInfoSchoolCode"
    ).value = "";

    document.getElementById(
        "studentInfoRegNo"
    ).value = "";

    modal.style.display = "flex";
}


/* =====================================================
   CLOSE STUDENT INFO CHECKER
===================================================== */

function closeStudentInfoChecker() {

    const modal =
        document.getElementById(
            "studentInfoModal"
        );

    if (!modal) {
        return;
    }

    modal.style.display = "none";
}


/* =====================================================
   VIEW STUDENT INFO
===================================================== */

function viewStudentInfoDashboard() {

    const schoolCode =
        document.getElementById(
            "studentInfoSchoolCode"
        ).value.trim();

    const regNo =
        document.getElementById(
            "studentInfoRegNo"
        ).value.trim();


    if (!schoolCode) {

        alert(
            "Please enter the School Code."
        );

        return;
    }


    if (!regNo) {

        alert(
            "Please enter the Admission Number."
        );

        return;
    }


   const dashboardUrl =
    "student-dashboard-template.html"
    + "?school="
    + encodeURIComponent(
        schoolCode
    )
    + "&reg_no="
    + encodeURIComponent(
        regNo
    );
	
sessionStorage.setItem(
    "student_dashboard_school",
    schoolCode
);

sessionStorage.setItem(
    "student_dashboard_reg_no",
    regNo
);

window.location.href =
    dashboardUrl;

}