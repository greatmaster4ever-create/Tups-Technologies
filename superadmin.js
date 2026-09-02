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

// ==========================
// SUPABASE ACTION GATEWAY
// ==========================

async function supabaseAction(
  promise,
  message = "Processing..."
) {

  showLoader(message);

  try {

    const result = await promise;

    hideLoader();

    return result;

  } catch (err) {

    hideLoader();

    console.error(err);

    alert(
      err.message ||
      "Something went wrong"
    );

    return {
      data: null,
      error: err
    };

  }
}

// ==========================
// GLOBAL LOADER
// ==========================

function showLoader(message = "Processing...") {

  const loader = document.getElementById("globalLoader");
  const text = document.getElementById("loaderText");

  if (text) text.innerText = message;
  if (loader) loader.style.display = "flex";

  // safety timeout (auto-hide after 20s)
  clearTimeout(window.__loaderTimeout);

  window.__loaderTimeout = setTimeout(() => {
    hideLoader();
  }, 20000);
}

function hideLoader() {

  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "none";

  clearTimeout(window.__loaderTimeout);
}


/* ==========================
   SESSION PROTECTION
========================== */

let schoolCode =
  sessionStorage.getItem("school_code");

if (schoolCode !== "TUPSADMIN") {

  alert("Unauthorized Access");

  window.location.href = "index.html";
  throw new Error("Invalid session");

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
	  
	const { count: totalStudents } =
      await supabaseClient
       .from("students")
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
	  
	document.getElementById(
      "totalStudents"
    ).textContent =
     (totalStudents || 0).toLocaleString();
	  

  } catch (err) {

    console.error(
      "Dashboard Error:",
      err
    );

  } finally {
    hideLoader(); // IMPORTANT
  }

}

    // ==========================
    // SCHOOL FINANCE TABLE LOGIC
    // ==========================
async function loadSchoolFinance() {

  const { data: students } =
    await supabaseClient
      .from("students")
      .select("school_code");

  const { data: schools } =
    await supabaseClient
      .from("schools")
      .select("school_code, amount_per_student");

  const studentCounts = {};

  students.forEach(s => {
    studentCounts[s.school_code] =
      (studentCounts[s.school_code] || 0) + 1;
  });
  
    // TOTAL STUDENTS ACROSS ALL SCHOOLS

  const totalStudents =
    students.length;

  document.getElementById(
    "totalStudents"
  ).textContent =
    totalStudents.toLocaleString();

  let financeRows = [];
  let totalIncome = 0;

  schools.forEach(school => {

    const count =
      studentCounts[school.school_code] || 0;

    const amountPerStudent =
      school.amount_per_student || 0;

    const total =
      count * amountPerStudent;

    totalIncome += total;

    financeRows.push({
      school_code: school.school_code,
      total_students: count,
      amount_per_student: amountPerStudent,
      total_amount: total
    });

  });

  // ✅ expected income display (THIS ANSWERS YOUR QUESTION)
  document.getElementById("expectedIncome").textContent =
    totalIncome.toLocaleString();

  const tbody =
    document.getElementById("financeTableBody");

  if (tbody) {

    tbody.innerHTML = "";

    financeRows.forEach(row => {

      tbody.innerHTML += `
        <tr>
          <td>${row.school_code}</td>
          <td>${row.total_students}</td>
          <td>${row.amount_per_student.toLocaleString()}</td>
          <td><b>${row.total_amount.toLocaleString()}</b></td>
        </tr>
      `;

    });

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
  onclick="openPasswordModal(
    '${row.id}',
    '${row.school_code}'
  )"
>
  Password
</button>

  <button
    class="delete-btn"
	data-action="delete"
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

  } finally {
    hideLoader(); // IMPORTANT
  }

}

// ======================================================
// SUBJECTS TABLE — NEW DESIGN
// Cadre remains in Supabase but is NOT DISPLAYED
// ======================================================

let subjectsCache = [];
let selectedSubjectIds = new Set();

async function loadSubjects() {

  try {

    const { data, error } =
      await supabaseClient
        .from("subjects")
        .select("*")
        .order("school_code");

    if (error) throw error;

    subjectsCache = data || [];

    populateSubjectFilters();

    renderSubjectsTable();

  } catch (err) {

    console.error(
      "Subjects Load Error:",
      err
    );

  } finally {

    hideLoader();

  }

}


// ======================================================
// SUBJECT FILTERS
// ======================================================

function populateSubjectFilters() {

  const departmentFilter =
    document.getElementById(
      "subjectDepartmentFilter"
    );

  const schoolFilter =
    document.getElementById(
      "subjectSchoolFilter"
    );

  if (!departmentFilter || !schoolFilter)
    return;


  const departments = [
    ...new Set(
      subjectsCache
        .map(row => (row.department || "").trim())
        .filter(Boolean)
    )
  ].sort();


  const schools = [
    ...new Set(
      subjectsCache
        .map(row => (row.school_code || "").trim())
        .filter(Boolean)
    )
  ].sort();


  const currentDepartment =
    departmentFilter.value;

  const currentSchool =
    schoolFilter.value;


  departmentFilter.innerHTML =
    `<option value="">All Departments</option>`;

  departments.forEach(department => {

    departmentFilter.innerHTML += `
      <option value="${escapeSubjectHtml(department)}">
        ${escapeSubjectHtml(department)}
      </option>
    `;

  });


  schoolFilter.innerHTML =
    `<option value="">All Schools</option>`;

  schools.forEach(school => {

    schoolFilter.innerHTML += `
      <option value="${escapeSubjectHtml(school)}">
        ${escapeSubjectHtml(school)}
      </option>
    `;

  });


  if (
    departments.includes(
      currentDepartment
    )
  ) {

    departmentFilter.value =
      currentDepartment;

  }


  if (
    schools.includes(
      currentSchool
    )
  ) {

    schoolFilter.value =
      currentSchool;

  }

}


// ======================================================
// SAFE HTML
// ======================================================

function escapeSubjectHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ======================================================
// GET FILTERED SUBJECTS
// ======================================================

function getFilteredSubjects() {

  const searchInput =
    document.getElementById(
      "subjectSearch"
    );

  const departmentFilter =
    document.getElementById(
      "subjectDepartmentFilter"
    );

  const schoolFilter =
    document.getElementById(
      "subjectSchoolFilter"
    );


  const search =
    (
      searchInput?.value || ""
    )
      .trim()
      .toLowerCase();


  const department =
    (
      departmentFilter?.value || ""
    )
      .trim()
      .toLowerCase();


  const school =
    (
      schoolFilter?.value || ""
    )
      .trim()
      .toLowerCase();


  return subjectsCache.filter(row => {

    const rowSchool =
      String(
        row.school_code || ""
      )
        .trim()
        .toLowerCase();


    const rowDepartment =
      String(
        row.department || ""
      )
        .trim()
        .toLowerCase();


    const rowSubject =
      String(
        row.subject || ""
      )
        .trim()
        .toLowerCase();


    const matchesSearch =
      !search ||
      rowSchool.includes(search) ||
      rowDepartment.includes(search) ||
      rowSubject.includes(search);


    const matchesDepartment =
      !department ||
      rowDepartment === department;


    const matchesSchool =
      !school ||
      rowSchool === school;


    return (
      matchesSearch &&
      matchesDepartment &&
      matchesSchool
    );

  });

}


// ======================================================
// RENDER SUBJECT TABLE
// ======================================================

function renderSubjectsTable() {

  const tbody =
    document.getElementById(
      "subjectsTableBody"
    );

  if (!tbody)
    return;


  const filteredSubjects =
    getFilteredSubjects();


  tbody.innerHTML = "";


  if (!filteredSubjects.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="7"
          style="text-align:center;"
        >
          No subjects found.
        </td>
      </tr>
    `;

    updateSelectAllSubjectsState();

    return;

  }


  filteredSubjects.forEach(row => {

    const id =
      String(row.id);


    const isSelected =
      selectedSubjectIds.has(id);


    tbody.innerHTML += `

      <tr>

        <!-- CHECKBOX -->

        <td>
          <input
            type="checkbox"
            class="subject-row-checkbox"
            data-subject-id="${escapeSubjectHtml(id)}"
            ${isSelected ? "checked" : ""}
          >
        </td>


        <!-- SCHOOL -->

        <td>
          ${escapeSubjectHtml(
            row.school_code
          )}
        </td>


        <!-- DEPARTMENT -->

        <td>
          ${escapeSubjectHtml(
            row.department
          )}
        </td>


        <!-- SUBJECT -->

        <td>
          ${escapeSubjectHtml(
            row.subject
          )}
        </td>


        <!-- SUBJECT PASSWORD -->

        <td>
          ${escapeSubjectHtml(
            row.subject_password
          )}
        </td>


        <!-- ADMIN PASSWORD -->

        <td>
          ${escapeSubjectHtml(
            row.admin_password
          )}
        </td>


        <!-- ACTIONS -->

        <td>

          <button
            class="edit-btn"
            onclick="openEditSubject('${escapeSubjectHtml(id)}')"
          >
            Edit
          </button>


          <button
            class="password-btn"
            onclick="openSubjectPasswordModal('${escapeSubjectHtml(id)}')"
          >
            Password
          </button>


          <button
            class="delete-btn"
            data-action="delete"
            onclick="deleteSubject('${escapeSubjectHtml(id)}')"
          >
            Delete
          </button>

        </td>

      </tr>

    `;

  });


  updateSelectAllSubjectsState();

}


// ======================================================
// SELECT ALL CHECKBOX
// ======================================================

function updateSelectAllSubjectsState() {

  const selectAll =
    document.getElementById(
      "selectAllSubjects"
    );

  if (!selectAll)
    return;


  const visibleRows =
    document.querySelectorAll(
      ".subject-row-checkbox"
    );


  if (!visibleRows.length) {

    selectAll.checked = false;
    selectAll.indeterminate = false;

    return;

  }


  const checkedRows =
    [...visibleRows]
      .filter(
        checkbox =>
          checkbox.checked
      );


  selectAll.checked =
    checkedRows.length ===
    visibleRows.length;


  selectAll.indeterminate =
    checkedRows.length > 0 &&
    checkedRows.length <
      visibleRows.length;

}


// ======================================================
// GET SELECTED SUBJECT IDS
// ======================================================

function getSelectedSubjectIds() {

  return [
    ...selectedSubjectIds
  ];

}


// ======================================================
// SUBJECT FILTER EVENTS
// ======================================================

const subjectSearch =
  document.getElementById(
    "subjectSearch"
  );

if (subjectSearch) {

  subjectSearch.addEventListener(
    "input",
    () => {

      renderSubjectsTable();

    }
  );

}


const subjectDepartmentFilter =
  document.getElementById(
    "subjectDepartmentFilter"
  );

if (subjectDepartmentFilter) {

  subjectDepartmentFilter.addEventListener(
    "change",
    () => {

      renderSubjectsTable();

    }
  );

}


const subjectSchoolFilter =
  document.getElementById(
    "subjectSchoolFilter"
  );

if (subjectSchoolFilter) {

  subjectSchoolFilter.addEventListener(
    "change",
    () => {

      renderSubjectsTable();

    }
  );

}


// ======================================================
// SELECT ALL
// ======================================================

const selectAllSubjects =
  document.getElementById(
    "selectAllSubjects"
  );

if (selectAllSubjects) {

  selectAllSubjects.addEventListener(
    "change",
    function () {

      const visibleRows =
        document.querySelectorAll(
          ".subject-row-checkbox"
        );


      visibleRows.forEach(
        checkbox => {

          const id =
            String(
              checkbox.dataset.subjectId
            );


          if (this.checked) {

            selectedSubjectIds.add(id);

          } else {

            selectedSubjectIds.delete(id);

          }


          checkbox.checked =
            this.checked;

        }
      );


      updateSelectAllSubjectsState();

    }
  );

}


// ======================================================
// INDIVIDUAL CHECKBOXES
// ======================================================

document.addEventListener(
  "change",
  function (event) {

    const checkbox =
      event.target.closest(
        ".subject-row-checkbox"
      );

    if (!checkbox)
      return;


    const id =
      String(
        checkbox.dataset.subjectId
      );


    if (checkbox.checked) {

      selectedSubjectIds.add(id);

    } else {

      selectedSubjectIds.delete(id);

    }


    updateSelectAllSubjectsState();

  }
);

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
			  data-action="Open"
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

  } finally {
    hideLoader(); // IMPORTANT
  }

}

async function loadSchoolDetails() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("schools")
        .select("*")
        .order("school_code");

    if (error)
      throw error;

    const tbody =
      document.getElementById(
        "schoolDetailsBody"
      );

    tbody.innerHTML = "";

    data.forEach(row => {

      tbody.innerHTML += `
        <tr>

          <td>
            ${row.school_code}
          </td>

          <td>
            ${row.School_name}
          </td>

          <td>
            ${row.status}
          </td>

          <td>

            <button
              class="password-btn"
			  data-action="View"
              onclick="viewSchoolProfile('${row.id}')"
            >
              View
            </button>

          </td>

        </tr>
      `;

    });

  } catch (err) {

    console.error(err);

  } finally {
    hideLoader(); // IMPORTANT
  }

}


async function viewSchoolProfile(id) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("schools")
        .select("*")
        .eq("id", id)
        .single();

    if (error)
      throw error;

    const {
      count
    } =
      await supabaseClient
        .from("subjects")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq(
          "school_code",
          data.school_code
        );

    const card =
      document.getElementById(
        "schoolProfileCard"
      );

    card.innerHTML = `

      <h2>
        School Profile
      </h2>

      <img
        src="${data.logo_url || ''}"
        style="
          width:100px;
          height:100px;
          object-fit:cover;
          border-radius:50%;
          margin-bottom:15px;
        "
      >

      <p>
        <strong>School Code:</strong>
        ${data.school_code}
      </p>

      <p>
        <strong>School Name:</strong>
        ${data.School_name}
      </p>

      <p>
        <strong>Status:</strong>
        ${data.status}
      </p>

      <p>
        <strong>Email:</strong>
        ${data.contact_email || ''}
      </p>

      <p>
        <strong>Phone:</strong>
        ${data.phone || ''}
      </p>

      <p>
        <strong>Primary Color:</strong>
        ${data.primary_color || ''}
      </p>

      <p>
        <strong>Secondary Color:</strong>
        ${data.secondary_color || ''}
      </p>

      <p>
        <strong>Total Subjects:</strong>
        ${count || 0}
      </p>

    `;

    card.style.display =
      "block";

  } catch (err) {

    console.error(err);

  } finally {
    hideLoader(); // IMPORTANT
  }

}

window.viewSchoolProfile =
  viewSchoolProfile;
  

async function loadPasswords() {

  try {

    const {
      data: schools,
      error: schoolError
    } =
      await supabaseClient
        .from("schools")
        .select(
          "school_code, School_name, password"
        )
        .order("school_code");

    if (schoolError)
      throw schoolError;

    const {
      data: subjects,
      error: subjectError
    } =
      await supabaseClient
        .from("subjects")
        .select(
          "school_code, admin_password"
        );

    if (subjectError)
      throw subjectError;

    const adminPasswords = {};

    subjects.forEach(row => {

      if (
        !adminPasswords[
          row.school_code
        ]
      ) {

        adminPasswords[
          row.school_code
        ] =
          row.admin_password;

      }

    });

    const tbody =
      document.getElementById(
        "passwordTableBody"
      );

    tbody.innerHTML = "";

   schools.forEach(row => {

  const schoolPassword =
    row.password || "";

  const adminPassword =
    adminPasswords[
      row.school_code
    ] || "";

  tbody.innerHTML += `
    <tr>

      <td>
        ${row.school_code}
      </td>

      <td>
        ${row.School_name}
      </td>

      <td
        id="schoolPwd_${row.school_code}"
      >
        ********
      </td>

      <td
        id="adminPwd_${row.school_code}"
      >
        ********
      </td>

      <td>

        <button
          class="password-btn"
          onclick="
            togglePasswords(
              '${row.school_code}',
              '${schoolPassword}',
              '${adminPassword}'
            )
          "
        >
          Show
        </button>

      </td>

    </tr>
  `;

});


  } catch (err) {

    console.error(
      "PASSWORD LOAD ERROR:",
      err
    );

    alert(
      err.message
    );

  } finally {
    hideLoader(); // IMPORTANT
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
    "https://script.google.com/macros/s/AKfycbzRotvo9tm_FHSkGKqzdgyEjKYQix0YgI1Db4viY3eJ0V3dvXdT_I5Jgy39P5Zt8zjxaA/exec",
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
		
	  const amountPerStudent =
      Number(document.getElementById(
	  "amountPerStudent").value) || 0;
   
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

  amount_per_student:
  amountPerStudent || 0,

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
  "editAmountPerStudent").value =
  data.amount_per_student || 0;

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
    phone,

  amount_per_student: Number(
  document.getElementById("editAmountPerStudent").value
) || 0

})
          .eq("id", id);

      if (error) {

        alert(error.message);

        return;

      }

      alert(
        "School Updated Successfully"
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

async function openPasswordModal(
  id,
  schoolCode
) {

  document.getElementById(
    "passwordSchoolId"
  ).value = id;

  document.getElementById(
    "passwordSchoolCode"
  ).value = schoolCode;

  document.getElementById(
    "newSchoolPassword"
  ).value = "";

  const adminField =
    document.getElementById(
      "newAdminPassword"
    );

  if (adminField) {
    adminField.value = "";
  }

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
    "updateAdminPasswordBtn"
  )
  .addEventListener(
    "click",
    async () => {

      const schoolCode =
        document.getElementById(
          "passwordSchoolCode"
        ).value;

      const password =
        document.getElementById(
          "newAdminPassword"
        ).value.trim();

      if (!password) {

        alert(
          "Enter Admin Password"
        );

        return;

      }

      const confirmed =
        confirm(
          `Update Admin Password for all subjects in ${schoolCode}?`
        );

      if (!confirmed)
        return;

      const { error } =
        await supabaseClient
          .from("subjects")
          .update({

            admin_password:
              password

          })
          .eq(
            "school_code",
            schoolCode
          );

      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "Admin Password Updated Successfully"
      );

      document.getElementById(
        "newAdminPassword"
      ).value = "";

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
      "https://script.google.com/macros/s/AKfycbzRotvo9tm_FHSkGKqzdgyEjKYQix0YgI1Db4viY3eJ0V3dvXdT_I5Jgy39P5Zt8zjxaA/exec",
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

// ======================================================
// BULK DELETE SUBJECTS
// ======================================================

async function deleteSubjectRecord(id) {

  try {

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


    // ==========================================
    // DELETE GOOGLE SHEET FIRST
    // ==========================================

    if (data.sheet_url) {

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
          "https://script.google.com/macros/s/AKfycbzRotvo9tm_FHSkGKqzdgyEjKYQix0YgI1Db4viY3eJ0V3dvXdT_I5Jgy39P5Zt8zjxaA/exec",
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


    // ==========================================
    // DELETE SUPABASE RECORD
    // ==========================================

    const {
      error: deleteError
    } =
      await supabaseClient
        .from("subjects")
        .delete()
        .eq("id", id);


    if (deleteError)
      throw deleteError;


    return {
      success: true
    };


  } catch (err) {

    console.error(
      "Subject Delete Error:",
      id,
      err
    );


    return {
      success: false,
      error: err
    };

  }

}


// ======================================================
// BULK DELETE
// ======================================================

async function bulkDeleteSubjects() {

  const selectedIds =
    getSelectedSubjectIds();


  if (!selectedIds.length) {

    alert(
      "Please select at least one subject."
    );

    return;

  }


  const confirmed =
    confirm(
      `You are about to delete ${selectedIds.length} subject(s).\n\n` +
      `This will:\n\n` +
      `• Delete the subject record(s)\n` +
      `• Move their Google Sheets to Drive Trash\n\n` +
      `Continue?`
    );


  if (!confirmed)
    return;


  showLoader(
    "Deleting subjects..."
  );


  let deleted = 0;
  let failed = 0;


  try {

    for (const id of selectedIds) {

      const result =
        await deleteSubjectRecord(
          id
        );


      if (result.success) {

        deleted++;

      } else {

        failed++;

      }

    }


    selectedSubjectIds.clear();


    await loadSubjects();

    await loadDashboardStats();


    if (failed === 0) {

      alert(
        `${deleted} subject(s) deleted successfully.`
      );

    } else {

      alert(
        `${deleted} subject(s) deleted successfully.\n` +
        `${failed} subject(s) could not be deleted.`
      );

    }


  } catch (err) {

    console.error(
      "Bulk Delete Error:",
      err
    );


    alert(
      err.toString()
    );


  } finally {

    hideLoader();

  }

}


// Make available to HTML if needed
window.bulkDeleteSubjects =
  bulkDeleteSubjects;
  
// ======================================================
// EXPORT FILTERED SUBJECTS TO PDF
// ======================================================

async function exportSubjectsToPdf() {

  const filteredSubjects =
    getFilteredSubjects();


  if (!filteredSubjects.length) {

    alert(
      "There are no subjects to export."
    );

    return;

  }


  // ==========================================
  // LOAD jsPDF
  // ==========================================

  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );

  }


  // ==========================================
  // LOAD AUTO TABLE
  // ==========================================

  if (
    !window.jspdf?.jsPDF?.API?.autoTable
  ) {

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
    );

  }


  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {

    alert(
      "PDF library could not be loaded."
    );

    return;

  }


  const {
    jsPDF
  } =
    window.jspdf;


  const doc =
    new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });


  // ==========================================
  // TITLE
  // ==========================================

  doc.setFontSize(16);

  doc.text(
    "TUPS SUBJECTS",
    14,
    15
  );


  // ==========================================
  // FILTER INFORMATION
  // ==========================================

  const department =
    document.getElementById(
      "subjectDepartmentFilter"
    )?.value ||
    "All Departments";


  const school =
    document.getElementById(
      "subjectSchoolFilter"
    )?.value ||
    "All Schools";


  doc.setFontSize(9);

  doc.text(
    `School: ${school}    Department: ${department}    Records: ${filteredSubjects.length}`,
    14,
    22
  );


  // ==========================================
  // TABLE
  // ==========================================

  const tableData =
    filteredSubjects.map(
      row => [

        row.school_code || "",

        row.department || "",

        row.subject || "",

        row.subject_password || "",

        row.admin_password || ""

      ]
    );


  doc.autoTable({

    startY: 27,

    head: [[

      "School",

      "Dept",

      "Subject",

      "Sub-Pass",

      "Admin-Pass"

    ]],

    body: tableData,

    theme: "grid",

    styles: {

      fontSize: 8,

      cellPadding: 3

    },

    headStyles: {

      fontStyle: "bold"

    },

    margin: {

      left: 14,

      right: 14

    }

  });


  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  doc.save(
    `TUPS-Subjects-${today}.pdf`
  );

}


// ======================================================
// LOAD EXTERNAL JAVASCRIPT
// ======================================================

function loadScript(src) {

  return new Promise(
    (resolve, reject) => {

      const script =
        document.createElement(
          "script"
        );


      script.src = src;

      script.onload =
        resolve;

      script.onerror =
        reject;


      document.head.appendChild(
        script
      );

    }
  );

}


// Make available globally
window.exportSubjectsToPdf =
  exportSubjectsToPdf;


// ======================================================
// SUBJECTS NEW DESIGN BUTTONS
// ======================================================

const bulkDeleteSubjectsBtn =
  document.getElementById(
    "bulkDeleteSubjectsBtn"
  );

if (bulkDeleteSubjectsBtn) {

  bulkDeleteSubjectsBtn.addEventListener(
    "click",
    bulkDeleteSubjects
  );

}


const exportSubjectsBtn =
  document.getElementById(
    "exportSubjectsBtn"
  );

if (exportSubjectsBtn) {

  exportSubjectsBtn.addEventListener(
    "click",
    exportSubjectsToPdf
  );

}

function togglePasswords(
  schoolCode,
  schoolPassword,
  adminPassword
) {

  const schoolCell =
    document.getElementById(
      `schoolPwd_${schoolCode}`
    );

  const adminCell =
    document.getElementById(
      `adminPwd_${schoolCode}`
    );

  const showing =
    schoolCell.innerText !==
    "********";

  if (showing) {

    schoolCell.innerText =
      "********";

    adminCell.innerText =
      "********";

  } else {

    schoolCell.innerText =
      schoolPassword;

    adminCell.innerText =
      adminPassword;

  }

}

window.togglePasswords =
  togglePasswords;


async function deleteSchool(schoolCode) {

  console.log("schoolCode passed:", schoolCode);

  const confirmed =
    confirm(
      `WARNING!\n\n` +
      `This will permanently remove:\n\n` +
      `• School Record\n` +
      `• All Subjects\n` +
      `• All Department Resources\n` +
      `• Entire School Drive Folder\n\n` +
      `Do you want to continue?`
    );

  if (!confirmed) return;

  // ==========================
  // SECOND SAFETY CHECK (INPUT)
  // ==========================

  const inputCode = prompt(
    `Type the school code "${schoolCode}" to confirm deletion:`
  );

  if (!inputCode) {
    alert("Deletion cancelled.");
    return;
  }

  if (inputCode.trim() !== schoolCode) {
    alert("School code does not match. Deletion aborted.");
    return;
  }

  // ==========================
  // FINAL CONFIRMATION
  // ==========================

  const finalConfirm = confirm(
    "FINAL WARNING:\n\n" +
    "This action is irreversible.\n\n" +
    "Click OK to permanently delete."
  );

  if (!finalConfirm) return;

  try {

    // ==========================
    // DELETE SUBJECTS
    // ==========================

    const { data: deletedSubjects, error: subjectsError } =
      await supabaseClient
        .from("subjects")
        .delete()
        .eq("school_code", schoolCode)
        .select();

    console.log("Deleted Subjects:", deletedSubjects);

    if (subjectsError) throw subjectsError;

    // ==========================
    // DELETE RESOURCES
    // ==========================

    const { data: deletedResources, error: resourcesError } =
      await supabaseClient
        .from("department_resources")
        .delete()
        .eq("school_code", schoolCode)
        .select();

    console.log("Deleted Resources:", deletedResources);

    if (resourcesError) throw resourcesError;

    // ==========================
    // DELETE SCHOOL
    // ==========================

    const { data: deletedSchool, error: schoolError } =
      await supabaseClient
        .from("schools")
        .delete()
        .eq("school_code", schoolCode)
        .select();

    console.log("Deleted School:", deletedSchool);

    if (schoolError) throw schoolError;

    // ==========================
    // DELETE GOOGLE DRIVE FOLDER
    // ==========================

    const formData = new URLSearchParams();
    formData.append("action", "deleteSchool");
    formData.append("schoolCode", schoolCode);

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzRotvo9tm_FHSkGKqzdgyEjKYQix0YgI1Db4viY3eJ0V3dvXdT_I5Jgy39P5Zt8zjxaA/exec",
      {
        method: "POST",
        body: formData
      }
    );

    const text = await response.text();
    console.log("Apps Script Response:", text);

    alert(`${schoolCode} deleted successfully`);

    loadDashboardStats();
    loadSchools();
    loadSubjects();
    loadSheets();

  } catch (err) {

    console.error("DELETE ERROR:", err);
    alert(err.toString());

  }
}

window.deleteSchool = deleteSchool;



const viewPasswordsBtn =
  document.getElementById(
    "viewPasswordsBtn"
  );

if (viewPasswordsBtn) {

  viewPasswordsBtn
    .addEventListener(
      "click",
      async () => {

        const section =
          document.getElementById(
            "passwordViewerSection"
          );

        if (
          section.style.display ===
          "none"
        ) {

          await loadPasswords();

          section.style.display =
            "block";

        } else {

          section.style.display =
            "none";

        }

      }
    );

}

const passwordSearch =
  document.getElementById(
    "passwordSearch"
  );

if (passwordSearch) {

  passwordSearch
    .addEventListener(
      "keyup",
      function () {

        const search =
          this.value
            .toLowerCase();

        const rows =
          document.querySelectorAll(
            "#passwordTableBody tr"
          );

        rows.forEach(
          row => {

            row.style.display =
              row.innerText
                .toLowerCase()
                .includes(
                  search
                )
              ? ""
              : "none";

          }
        );

      }
    );

}

const viewSchoolDetailsBtn =
  document.getElementById(
    "viewSchoolDetailsBtn"
  );

if (viewSchoolDetailsBtn) {

  viewSchoolDetailsBtn
    .addEventListener(
      "click",
      async () => {

        const section =
          document.getElementById(
            "schoolDetailsSection"
          );

        if (
          section.style.display ===
          "none"
        ) {

          await loadSchoolDetails();

          section.style.display =
            "block";

        } else {

          section.style.display =
            "none";

          document.getElementById(
            "schoolProfileCard"
          ).style.display =
            "none";

        }

      }
    );

}

document.addEventListener("DOMContentLoaded", () => {

  const viewFinanceBtn =
    document.getElementById("viewFinanceBtn");

  const section =
    document.getElementById("financeSection");

  if (!viewFinanceBtn || !section) return;

  viewFinanceBtn.addEventListener("click", async () => {

    const isHidden =
      section.style.display === "none" ||
      section.style.display === "";

    if (isHidden) {

      await loadSchoolFinance(); // ✅ ONLY SOURCE OF TRUTH
      section.style.display = "block";

    } else {
      section.style.display = "none";
    }

  });

});

// =====================
// FINANCE TABLE LOADER
// =====================



loadDashboardStats();
loadSchools();
loadSubjects();
loadSheets();
loadSchoolFinance();

// ==========================
// ACTION REGISTRY (FREEZE LAYER)
// ==========================

const ACTIONS = Object.freeze({
  INSERT: "insert",
  UPDATE: "update",
  DELETE: "delete",
  SAVE: "save",
  SUBMIT: "submit",
  PROCESS: "process"
});

// ==========================
// GLOBAL ACTION LOADER GATEWAY (FINAL)
// ==========================

document.addEventListener("click", function (e) {

  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;

  if (!action) return;

  const validActions = [
    "insert",
    "update",
    "delete",
    "save",
    "submit",
    "process"
  ];

  if (!validActions.includes(action)) return;

  showLoader("Processing...");

});

// ==========================
// GLOBAL ERROR HANDLERS
// ==========================

window.addEventListener(
  "error",
  hideLoader
);

window.addEventListener(
  "unhandledrejection",
  hideLoader
);