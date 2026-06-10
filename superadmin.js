console.log("SUPER ADMIN LOADED - VERSION 99");
const supabaseUrl =
  "https://sgdrncpiqingjwxmkqij.supabase.co";

const supabaseKey =
  "sb_publishable_CFLKvoqepTX4UqzG5XjumQ_TJ2T2hFj";

const supabaseClient =
  supabase.createClient(
    supabaseUrl,
    supabaseKey
  );

/* ==========================
   SESSION PROTECTION
========================== */

const schoolCode =
  sessionStorage.getItem("school_code");

if (schoolCode !== "TUPSADMIN") {

  alert("Unauthorized Access");

  window.location.href = "index.html";

}

window.addEventListener(
  "pageshow",
  function (event) {

    if (
      event.persisted ||
      window.performance
        .getEntriesByType(
          "navigation"
        )[0]
        ?.type === "back_forward"
    ) {

      if (
        sessionStorage.getItem(
          "school_code"
        ) !== "TUPSADMIN"
      ) {

        window.location.replace(
          "index.html"
        );

      }

    }

  }
);

/* ==========================
   MOBILE MENU
========================== */

const menuBtn =
  document.getElementById("menuBtn");

const sidebar =
  document.getElementById("sidebar");

menuBtn.addEventListener("click", () => {

  sidebar.classList.toggle("show");

});

/* ==========================
   TAB SWITCHING
========================== */

const navButtons =
  document.querySelectorAll(".nav-btn");

const tabs =
  document.querySelectorAll(".tab-content");

navButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    navButtons.forEach(b =>
      b.classList.remove("active")
    );

    tabs.forEach(t =>
      t.classList.remove("active-tab")
    );

    btn.classList.add("active");

    const tab =
      document.getElementById(
        btn.dataset.tab
      );

    tab.classList.add("active-tab");

  });

});

/* ==========================
   LOGOUT
========================== */

function logoutAdmin() {

  sessionStorage.clear();

  window.location.replace(
    "index.html"
  );

}

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    logoutAdmin
  );

/* ==========================
   1-MINUTE IDLE LOGOUT
========================== */

let logoutTimer;

function resetTimer() {

  clearTimeout(logoutTimer);

  logoutTimer =
    setTimeout(() => {

      alert(
        "Logged out due to inactivity."
      );

      logoutAdmin();

    }, 60000);

}

[
  "mousemove",
  "click",
  "keydown",
  "scroll",
  "touchstart"
].forEach(event => {

  document.addEventListener(
    event,
    resetTimer
  );

});

async function loadDashboardStats() {

  try {

    const { count: totalSchools } =
      await supabaseClient
      .from("schools")
      .select("*", {
        count: "exact",
        head: true
      });

    const { count: activeSchools } =
      await supabaseClient
      .from("schools")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("status", "Active");

    const { count: inactiveSchools } =
      await supabaseClient
      .from("schools")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("status", "Inactive");

    const { count: totalSubjects } =
      await supabaseClient
      .from("subjects")
      .select("*", {
        count: "exact",
        head: true
      });

    document.getElementById(
      "totalSchools"
    ).textContent =
      totalSchools || 0;

    document.getElementById(
      "activeSchools"
    ).textContent =
      activeSchools || 0;

    document.getElementById(
      "inactiveSchools"
    ).textContent =
      inactiveSchools || 0;

    document.getElementById(
      "totalSubjects"
    ).textContent =
      totalSubjects || 0;

  } catch (err) {

    console.error(
      "Dashboard Error:",
      err
    );

  }

}

async function loadSchools() {

  try {

    const { data, error } =
      await supabaseClient
      .from("schools")
      .select("*")
      .order("school_code");

    if (error) throw error;

    const tbody =
      document.getElementById(
        "schoolsTableBody"
      );

    tbody.innerHTML = "";

    data.forEach(row => {

      tbody.innerHTML += `
        <tr>
          <td>${row.school_code}</td>
          <td>${row.School_name}</td>
          <td>${row.status}</td>
	   <td>

  <button
    class="edit-btn"
    onclick="openEditSchool('${row.id}')"
  >
    Edit
  </button>

  <button
    class="password-btn"
    onclick="openPasswordModal('${row.id}')"
  >
    Password
  </button>

  <button
    class="delete-btn"
    onclick="deleteSchool('${row.school_code}')"
  >
    Delete
  </button>

</td>

       </tr>
      `;

    });

  } catch (err) {

    console.error(
      "Schools Load Error:",
      err
    );

  }

}

async function loadSubjects() {

  try {

    const { data, error } =
      await supabaseClient
        .from("subjects")
        .select("*")
        .order("school_code");

    if (error) throw error;

    const tbody =
      document.getElementById(
        "subjectsTableBody"
      );

    tbody.innerHTML = "";

    data.forEach(row => {

      tbody.innerHTML += `
        <tr>

          <td>${row.school_code}</td>

          <td>${row.cadre}</td>

          <td>${row.department}</td>

          <td>${row.subject}</td>

          <td>

            <button
              class="edit-btn"
              onclick="openEditSubject('${row.id}')"
            >
              Edit
            </button>

            <button
              class="password-btn"
              onclick="openSubjectPasswordModal('${row.id}')"
            >
              Password
            </button>

            <button
              class="delete-btn"
              onclick="deleteSubject('${row.id}')"
            >
              Delete
            </button>

          </td>

        </tr>
      `;

    });

  } catch (err) {

    console.error(
      "Subjects Load Error:",
      err
    );

  }

}

async function loadSheets() {

  try {

    const { data, error } =
      await supabaseClient
        .from("subjects")
        .select(
          "school_code, department, subject, sheet_url"
        )
        .order("school_code");

    if (error) throw error;

    const tbody =
      document.getElementById(
        "sheetsTableBody"
      );

    tbody.innerHTML = "";

    data.forEach(row => {

      tbody.innerHTML += `

        <tr>

          <td>${row.school_code}</td>

          <td>${row.department}</td>

          <td>${row.subject}</td>

          <td>

            <a
              href="${row.sheet_url}"
              target="_blank"
            >
              Open Sheet
            </a>

          </td>

        </tr>

      `;

    });

  } catch (err) {

    console.error(
      "Sheets Load Error:",
      err
    );

  }

}

document
  .getElementById(
    "sheetSearch"
  )
  .addEventListener(
    "keyup",
    function () {

      const search =
        this.value.toLowerCase();

      const rows =
        document.querySelectorAll(
          "#sheetsTableBody tr"
        );

      rows.forEach(row => {

        const text =
          row.innerText.toLowerCase();

        row.style.display =
          text.includes(search)
            ? ""
            : "none";

      });

    }
  );

async function loadSchoolDropdown() {

  const { data, error } =
    await supabaseClient
      .from("schools")
      .select(
        "school_code, School_name"
      )
      .order("school_code");

  if (error) {

    console.error(error);

    return;

  }

  const dropdown =
    document.getElementById(
      "subjectSchoolCode"
    );

  dropdown.innerHTML =
    `<option value="">
      Select School
    </option>`;

  data.forEach(row => {

    dropdown.innerHTML += `
      <option
        value="${row.school_code}"
      >
        ${row.school_code}
        -
        ${row.School_name}
      </option>
    `;

  });

}

const subjectModal =
  document.getElementById(
    "subjectModal"
  );
	
document
  .getElementById(
    "addSubjectBtn"
  )
  .addEventListener(
    "click",
    async () => {

      subjectModal.style.display =
        "flex";
   loadSchoolDropdown();

    }
  );

document
  .getElementById(
    "closeSubjectModal"
  )
  .addEventListener(
    "click",
    () => {

      subjectModal.style.display =
        "none";

    }
  );

document
  .getElementById(
    "saveSubjectBtn"
  )
  .addEventListener(
    "click",
    async () => {
   console.log("SAVE BUTTON CLICKED");

const schoolCode =
  document.getElementById(
    "subjectSchoolCode"
  ).value;

console.log("STEP 1");

const cadre =
  document.getElementById(
    "subjectCadre"
  ).value;

console.log("STEP 2");

const department =
  document.getElementById(
    "subjectDepartment"
  ).value.trim();

console.log("STEP 3");

const subject =
  document.getElementById(
    "subjectName"
  ).value.trim();

console.log("STEP 4");

const subjectPassword =
  document.getElementById(
    "subjectPassword"
  ).value.trim();

console.log("STEP 5");

const adminPassword =
  document.getElementById(
    "adminPassword"
  ).value.trim();

console.log("STEP 6");

      if (
        !schoolCode ||
        !department ||
        !subject
      ) {

        alert(
          "Please complete all required fields."
        );

        return;

      }

      // ==========================
// AUTO CREATE GOOGLE SHEET
// ==========================

let sheetUrl = "";

try {

  console.log("ABOUT TO FETCH");

  const formData =
  new URLSearchParams();

formData.append(
  "schoolCode",
  schoolCode
);

formData.append(
  "department",
  department
);

formData.append(
  "subject",
  subject
);

const response =
  await fetch(
    "https://script.google.com/macros/s/AKfycbzf6-sPVZl2ggJcp2ovlBhLMwNL2K9m1R0ch5doIg50mcJ0o6GZNKFv9FcxcL-WTpwuSQ/exec",
    {
      method: "POST",
      body: formData
    }
  );

  console.log("FETCH FINISHED");

 const text =
  await response.text();

console.log(
  "Apps Script Response:",
  text
);

const result =
  JSON.parse(text);

  if (!result.success) {

    throw new Error(
      result.error
    );

  }

  sheetUrl =
    result.sheetUrl;

document.getElementById(
  "sheetUrl"
).value = sheetUrl;

  console.log(
    "NEW SHEET:",
    sheetUrl
  );

} catch (err) {

  console.error(
    "GOOGLE SHEET ERROR:",
    err
  );

  alert(
    err.toString()
  );

  return;

}

      if (
        !schoolCode ||
        !department ||
        !subject
      ) {

        alert(
          "Please complete all required fields."
        );

        return;

      }

      const { error } =
        await supabaseClient
          .from("subjects")
          .insert([{

            school_code:
              schoolCode,

            cadre:
              cadre,

            department:
              department,

            subject:
              subject,

            subject_password:
              subjectPassword,

            admin_password:
              adminPassword,

            sheet_url:
              sheetUrl

          }]);

      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "Subject Added Successfully"
      );

      subjectModal.style.display =
        "none";
	
/* CLEAR FORM */

document.getElementById(
  "subjectSchoolCode"
).value = "";

document.getElementById(
  "subjectCadre"
).value = "Teacher";

document.getElementById(
  "subjectDepartment"
).value = "";

document.getElementById(
  "subjectName"
).value = "";

document.getElementById(
  "subjectPassword"
).value = "";

document.getElementById(
  "adminPassword"
).value = "";

document.getElementById(
  "sheetUrl"
).value = "";

/* REFRESH DASHBOARD */

loadDashboardStats();
loadSubjects();
loadSheets();

    }
  );


async function openEditSubject(id) {

  const { data, error } =
    await supabaseClient
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {

    alert(error.message);

    return;

  }

  document.getElementById(
    "editSubjectId"
  ).value = data.id;

  document.getElementById(
    "editSubjectCadre"
  ).value = data.cadre;

  document.getElementById(
    "editSubjectDepartment"
  ).value = data.department;

  document.getElementById(
    "editSubjectName"
  ).value = data.subject;

  document.getElementById(
    "editSheetUrl"
  ).value = data.sheet_url;

  document.getElementById(
    "editSubjectModal"
  ).style.display = "flex";

}

resetTimer();
const schoolModal =
  document.getElementById(
    "schoolModal"
  );

document
  .getElementById("addSchoolBtn")
  .addEventListener("click", () => {

    schoolModal.style.display =
      "flex";

  });

document
  .getElementById(
    "closeSchoolModal"
  )
  .addEventListener("click", () => {

    schoolModal.style.display =
      "none";

  });

document
  .getElementById(
    "saveSchoolBtn"
  )
  .addEventListener(
    "click",
    async () => {

      const schoolCode =
        document
        .getElementById(
          "schoolCodeInput"
        )
        .value.trim();

      const schoolName =
        document
        .getElementById(
          "schoolNameInput"
        )
        .value.trim();

      const password =
        document
        .getElementById(
          "schoolPasswordInput"
        )
        .value.trim();

      const status =
        document
        .getElementById(
          "schoolStatusInput"
        )
        .value;
	
	const logoUrl =
  document.getElementById(
    "schoolLogoUrl"
  ).value.trim();

const primaryColor =
  document.getElementById(
    "primaryColor"
  ).value;

const secondaryColor =
  document.getElementById(
    "secondaryColor"
  ).value;

const email =
  document.getElementById(
    "schoolEmail"
  ).value.trim();

const phone =
  document.getElementById(
    "schoolPhone"
  ).value.trim();

      if (
        !schoolCode ||
        !schoolName ||
        !password
      ) {

        alert(
          "Please complete all fields."
        );

        return;

      }

      const { error } =
        await supabaseClient
        .from("schools")
        .insert([{

  school_code:
    schoolCode,

  password:
    password,

  school_page:
    "school-template.html",

  School_name:
    schoolName,

  status:
    status,

  logo_url:
    logoUrl,

  primary_color:
    primaryColor,

  secondary_color:
    secondaryColor,

  contact_email:
    email,

  phone:
    phone

}]);
      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "School Added Successfully"
      );

      schoolModal.style.display =
        "none";
	
	document.getElementById(
  "schoolCodeInput"
).value = "";

document.getElementById(
  "schoolNameInput"
).value = "";

document.getElementById(
  "schoolPasswordInput"
).value = "";

document.getElementById(
  "schoolStatusInput"
).value = "Active";

document.getElementById(
  "schoolLogoUrl"
).value = "";

document.getElementById(
  "primaryColor"
).value = "#000066";

document.getElementById(
  "secondaryColor"
).value = "#00f5ff";

document.getElementById(
  "schoolEmail"
).value = "";

document.getElementById(
  "schoolPhone"
).value = "";

      loadDashboardStats();

      loadSchools();

    }
  );
   async function openEditSchool(id) {

  const { data, error } =
    await supabaseClient
      .from("schools")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {

    alert(error.message);

    return;

  }

  document.getElementById(
    "editSchoolId"
  ).value = data.id;

  document.getElementById(
    "editSchoolName"
  ).value = data.School_name;

  document.getElementById(
    "editSchoolStatus"
  ).value = data.status;
 
  document.getElementById(
  "editSchoolLogoUrl"
).value =
  data.logo_url || "";

document.getElementById(
  "editPrimaryColor"
).value =
  data.primary_color || "#000066";

document.getElementById(
  "editSecondaryColor"
).value =
  data.secondary_color || "#00f5ff";

document.getElementById(
  "editSchoolEmail"
).value =
  data.contact_email || "";

document.getElementById(
  "editSchoolPhone"
).value =
  data.phone || "";

  document.getElementById(
    "editSchoolModal"
  ).style.display = "flex";

}

document
  .getElementById(
    "updateSchoolBtn"
  )
  .addEventListener(
    "click",
    async () => {

      const id =
        document.getElementById(
          "editSchoolId"
        ).value;

      const schoolName =
        document.getElementById(
          "editSchoolName"
        ).value.trim();

      const status =
        document.getElementById(
          "editSchoolStatus"
        ).value;

      const logoUrl =
  document.getElementById(
    "editSchoolLogoUrl"
  ).value.trim();

const primaryColor =
  document.getElementById(
    "editPrimaryColor"
  ).value;

const secondaryColor =
  document.getElementById(
    "editSecondaryColor"
  ).value;

const email =
  document.getElementById(
    "editSchoolEmail"
  ).value.trim();

const phone =
  document.getElementById(
    "editSchoolPhone"
  ).value.trim();

      const { error } =
        await supabaseClient
          .from("schools")
          .update({

  School_name:
    schoolName,

  status:
    status,

  logo_url:
    logoUrl,

  primary_color:
    primaryColor,

  secondary_color:
    secondaryColor,

  contact_email:
    email,

  phone:
    phone

})
          .eq("id", id);

      if (error) {

        alert(error.message);

        return;

      }

      alert(
        "School Updated"
      );

      document.getElementById(
        "editSchoolModal"
      ).style.display = "none";

      loadDashboardStats();

      loadSchools();

    }
  );

async function openSubjectPasswordModal(id) {

  document.getElementById(
    "passwordSubjectId"
  ).value = id;

  document.getElementById(
    "newSubjectPassword"
  ).value = "";

  document.getElementById(
    "subjectPasswordModal"
  ).style.display = "flex";

}

async function openPasswordModal(id) {

  document.getElementById(
    "passwordSchoolId"
  ).value = id;

  document.getElementById(
    "newSchoolPassword"
  ).value = "";

  document.getElementById(
    "passwordModal"
  ).style.display = "flex";

}

document
  .getElementById(
    "updatePasswordBtn"
  )
  .addEventListener(
    "click",
    async () => {

      const id =
        document.getElementById(
          "passwordSchoolId"
        ).value;

      const password =
        document.getElementById(
          "newSchoolPassword"
        ).value.trim();

      if (!password) {

        alert(
          "Enter a password"
        );

        return;

      }

      const { error } =
        await supabaseClient
          .from("schools")
          .update({

            password:
              password

          })
          .eq("id", id);

      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "Password Updated"
      );

      document.getElementById(
        "passwordModal"
      ).style.display = "none";

	loadSchools();

    }
  );
	
 document
  .getElementById(
    "updateSubjectBtn"
  )
  .addEventListener(
    "click",
    async () => {

      const id =
        document.getElementById(
          "editSubjectId"
        ).value;

      const cadre =
        document.getElementById(
          "editSubjectCadre"
        ).value;

      const department =
        document.getElementById(
          "editSubjectDepartment"
        ).value.trim();

      const subject =
        document.getElementById(
          "editSubjectName"
        ).value.trim();

      const sheetUrl =
        document.getElementById(
          "editSheetUrl"
        ).value.trim();

      const { error } =
        await supabaseClient
          .from("subjects")
          .update({

            cadre:
              cadre,

            department:
              department,

            subject:
              subject,

            sheet_url:
              sheetUrl

          })
          .eq("id", id);

      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "Subject Updated Successfully"
      );

      document.getElementById(
        "editSubjectModal"
      ).style.display = "none";

      loadSubjects();

      loadDashboardStats();
       loadSubjects();

    }
  );  

document
  .getElementById(
    "updateSubjectPasswordBtn"
  )
  .addEventListener(
    "click",
    async () => {

      const id =
        document.getElementById(
          "passwordSubjectId"
        ).value;

      const password =
        document.getElementById(
          "newSubjectPassword"
        ).value.trim();

      if (!password) {

        alert(
          "Enter a password"
        );

        return;

      }

      const { error } =
        await supabaseClient
          .from("subjects")
          .update({

            subject_password:
              password

          })
          .eq("id", id);

      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "Subject Password Updated"
      );

      document.getElementById(
        "subjectPasswordModal"
      ).style.display = "none";

      loadSubjects();

    }
  );

async function deleteSubject(id) {

  const confirmed =
    confirm(
      "This will:\n\n" +
      "• Delete the subject\n" +
      "• Move its Google Sheet to Drive Trash\n\n" +
      "Continue?"
    );

  if (!confirmed)
    return;

  try {

    // Get subject record

    const {
      data,
      error
    } =
      await supabaseClient
        .from("subjects")
        .select("*")
        .eq("id", id)
        .single();

    if (error)
      throw error;

    // Extract Spreadsheet ID

   // Old subjects may not have a sheet_url

if (!data.sheet_url) {

  console.log(
    "Legacy subject detected. No Google Sheet attached."
  );

} else {

  const spreadsheetId =
    data.sheet_url
      .split("/d/")[1]
      .split("/")[0];

  const formData =
    new URLSearchParams();

  formData.append(
    "action",
    "deleteSheet"
  );

  formData.append(
    "spreadsheetId",
    spreadsheetId
  );

  const response =
    await fetch(
      "https://script.google.com/macros/s/AKfycbzf6-sPVZl2ggJcp2ovlBhLMwNL2K9m1R0ch5doIg50mcJ0o6GZNKFv9FcxcL-WTpwuSQ/exec",
      {
        method: "POST",
        body: formData
      }
    );

  const text =
    await response.text();

  const result =
    JSON.parse(text);

  if (!result.success) {

    throw new Error(
      result.error
    );

  }

}



    // Delete Supabase row

    const {
      error:
      deleteError
    } =
      await supabaseClient
        .from(
          "subjects"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (
      deleteError
    )
      throw deleteError;

    alert(
      "Subject Deleted Successfully"
    );

    loadSubjects();

    loadDashboardStats();

  } catch (err) {

    console.error(
      err
    );

    alert(
      err.toString()
    );

  }

}

function deleteSchool(schoolCode) {

  const confirmed =
    confirm(
      `Delete ${schoolCode}?`
    );

  if (!confirmed)
    return;

  alert(
    `Delete button clicked for ${schoolCode}`
  );

}

document
  .getElementById(
    "subjectSearch"
  )
  .addEventListener(
    "keyup",
    function () {

      const value =
        this.value
          .toLowerCase();

      const rows =
        document
          .querySelectorAll(
            "#subjectsTableBody tr"
          );

      rows.forEach(
        row => {

          row.style.display =
            row.innerText
              .toLowerCase()
              .includes(
                value
              )
            ? ""
            : "none";

        }
      );

    }
  );


loadDashboardStats();
loadSchools();
loadSubjects();
loadSheets();