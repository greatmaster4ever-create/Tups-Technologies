console.log("SUPER ADMIN LOADED");
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

  window.location.href = "index.html";

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

      const schoolCode =
        document.getElementById(
          "subjectSchoolCode"
        ).value;

      const cadre =
        document.getElementById(
          "subjectCadre"
        ).value;

      const department =
        document.getElementById(
          "subjectDepartment"
        ).value.trim();

      const subject =
        document.getElementById(
          "subjectName"
        ).value.trim();

      const subjectPassword =
        document.getElementById(
          "subjectPassword"
        ).value.trim();

      const adminPassword =
        document.getElementById(
          "adminPassword"
        ).value.trim();

      const sheetUrl =
        document.getElementById(
          "sheetUrl"
        ).value.trim();

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

    }
  );

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
	    
           </td>

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
            status

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

      const { error } =
        await supabaseClient
          .from("schools")
          .update({

            School_name:
              schoolName,

            status:
              status

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
	
   

loadDashboardStats();
loadSchools();
loadSubjects();