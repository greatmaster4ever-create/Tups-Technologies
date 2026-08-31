/* =========================================================
   TUPS ATTENDANCE MODULE
   attendance.js
========================================================= */


/* =========================================================
   ATTENDANCE MENU
========================================================= */

function toggleTeacherAttendanceMenu() {

  const menu = document.getElementById(
    "teacherAttendanceMenu"
  );

  if (!menu) return;

  if (
    menu.style.display === "none" ||
    menu.style.display === ""
  ) {

    menu.style.display = "flex";

  } else {

    menu.style.display = "none";

  }

}

/* =========================================================
   END OF TERM ATTENDANCE RESET
   ADDITIVE MODULE
   DOES NOT MODIFY EXISTING ATTENDANCE FUNCTIONS
========================================================= */

function openAttendanceResetDialog() {

  /* Prevent duplicate dialogs */

  const existing =
    document.getElementById(
      "attendanceResetOverlay"
    );

  if (existing) {
    existing.remove();
  }


  /* Create overlay */

  const overlay =
    document.createElement("div");

  overlay.id =
    "attendanceResetOverlay";

  overlay.className =
    "attendance-reset-overlay";


  /* Create dialog */

  overlay.innerHTML = `

    <div class="attendance-reset-dialog">

      <div class="attendance-reset-title">
        END OF TERM RESET
      </div>


      <div class="attendance-reset-warning">

        This will clear all attendance records
        for this school and reset the attendance
        counters for the new term.

        <br><br>

        <strong>
          Student records will NOT be deleted.
        </strong>

      </div>


      <input
        type="password"
        id="attendanceResetPassword"
        class="attendance-reset-password"
        placeholder="Enter admin password"
        autocomplete="off"
      >


      <div class="attendance-reset-actions">

        <button
          type="button"
          class="attendance-reset-cancel"
          id="attendanceResetCancel"
        >
          Cancel
        </button>


        <button
          type="button"
          class="attendance-reset-confirm"
          id="attendanceResetConfirm"
        >
          OK
        </button>

      </div>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  /* Cancel */

  document
    .getElementById(
      "attendanceResetCancel"
    )
    .addEventListener(
      "click",
      function () {

        overlay.remove();

      }
    );


  /* Confirm */

  document
    .getElementById(
      "attendanceResetConfirm"
    )
    .addEventListener(
      "click",
      function () {

        performAttendanceTermReset();

      }
    );


  /* Enter key */

  document
    .getElementById(
      "attendanceResetPassword"
    )
    .addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter"
        ) {

          performAttendanceTermReset();

        }

      }
    );


  /* Focus password */

  setTimeout(
    function () {

      const passwordInput =
        document.getElementById(
          "attendanceResetPassword"
        );

      if (passwordInput) {
        passwordInput.focus();
      }

    },
    50
  );

}

/* =========================================================
   PERFORM END OF TERM ATTENDANCE RESET
   SERVER-SIDE RESET THROUGH SUPABASE EDGE FUNCTION
========================================================= */

async function performAttendanceTermReset() {

  const passwordInput =
    document.getElementById(
      "attendanceResetPassword"
    );

  const confirmButton =
    document.getElementById(
      "attendanceResetConfirm"
    );


  if (
    !passwordInput ||
    !confirmButton
  ) {

    return;

  }


  const password =
    passwordInput.value.trim();


  if (!password) {

    alert(
      "Please enter the admin password."
    );

    passwordInput.focus();

    return;

  }


  /* =======================================================
     GET CURRENT SCHOOL CODE

     Your existing attendance module already uses
     the global schoolCode.
  ======================================================= */

  const currentSchoolCode =
    typeof schoolCode !== "undefined"
      ? String(schoolCode).trim()
      : "";


  if (!currentSchoolCode) {

    alert(
      "School information is unavailable."
    );

    console.error(
      "Attendance reset: schoolCode is unavailable."
    );

    return;

  }


  /* =======================================================
     PREVENT DOUBLE CLICK
  ======================================================= */

  confirmButton.disabled =
    true;

  confirmButton.textContent =
    "Resetting...";


  try {

    /* =====================================================
       FINAL CONFIRMATION
    ===================================================== */

    const confirmed =
      window.confirm(
        "Are you sure you want to clear ALL attendance records for " +
        currentSchoolCode +
        "?\n\n" +
        "Student records will NOT be deleted.\n\n" +
        "This action is for the end of term."
      );


    if (!confirmed) {

      confirmButton.disabled =
        false;

      confirmButton.textContent =
        "OK";

      return;

    }


    /* =====================================================
       VERIFY SUPABASE CLIENT
    ===================================================== */

    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient ||
      !supabaseClient.functions
    ) {

      throw new Error(
        "Supabase Functions client is unavailable."
      );

    }


    /* =====================================================
       CALL EDGE FUNCTION
    ===================================================== */

    const {
      data,
      error
    } =
      await supabaseClient.functions.invoke(
        "reset-attendance",
        {

          body: {

            school_code:
              currentSchoolCode,

            password:
              password

          }

        }
      );


    /* =====================================================
       FUNCTION INVOCATION ERROR
    ===================================================== */

    if (error) {

      console.error(
        "Attendance reset Edge Function error:",
        error,
        data
      );

      throw new Error(
        data?.message ||
        "Attendance reset failed."
      );

    }


    /* =====================================================
       FUNCTION RETURNED FAILURE
    ===================================================== */

    if (
      !data ||
      data.success !== true
    ) {

      throw new Error(
        data?.message ||
        "Attendance reset failed."
      );

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    const overlay =
      document.getElementById(
        "attendanceResetOverlay"
      );


    if (overlay) {

      overlay.remove();

    }


    alert(
      "End of term attendance reset completed successfully."
    );


    console.log(
      "ATTENDANCE TERM RESET COMPLETED:",
      currentSchoolCode
    );


  } catch (error) {

    console.error(
      "Attendance term reset failed:",
      error
    );


    alert(
      error.message ||
      "Attendance reset failed."
    );


    confirmButton.disabled =
      false;

    confirmButton.textContent =
      "OK";

  }

}

function hideTeacherAttendanceMenu() {

  const menu = document.getElementById(
    "teacherAttendanceMenu"
  );

  if (!menu) return;

  menu.style.display = "none";

}


/* =========================================================
   OPEN ATTENDANCE MARKER
========================================================= */

function openAttendanceMarker(session) {

  hideTeacherAttendanceMenu();

  createAttendanceModal(session);

}


/* =========================================================
   CREATE ATTENDANCE MODAL
========================================================= */

function createAttendanceModal(session) {

  const existing =
    document.getElementById(
      "attendanceModalOverlay"
    );

  if (existing) {

    existing.remove();

  }


  const overlay =
    document.createElement("div");

  overlay.id =
    "attendanceModalOverlay";

  overlay.className =
    "attendance-modal-overlay";


  const modal =
    document.createElement("div");

  modal.className =
    "attendance-modal";


  modal.innerHTML = `

    <!-- TOP CONTROL ROW -->

    <div class="attendance-top-row">

      <input
        type="text"
        class="attendance-search-box"
        id="attendanceStudentSearch"
        placeholder="Search student / Reg No."
        autocomplete="off"
      >

      <button
        type="button"
        class="attendance-bulk-btn"
        id="attendanceBulkBtn"
      >
        Bulk Marking
      </button>

      <button
        type="button"
        class="attendance-close-btn"
        id="attendanceCloseBtn"
        aria-label="Close"
      >
        ×
      </button>

    </div>


    <!-- BULK FILTERS -->

    <div
      class="attendance-filters"
      id="attendanceFilters"
    >

      <select
        class="attendance-filter"
        id="attendanceDepartmentFilter"
      >
        <option value="ALL">
          ALL Departments
        </option>
      </select>

      <select
        class="attendance-filter"
        id="attendanceClassFilter"
      >
        <option value="ALL">
          ALL Classes
        </option>
      </select>

    </div>


    <!-- STUDENT RESULTS -->

    <div
      class="attendance-results"
      id="attendanceResults"
    >
    </div>


    <!-- MARK BUTTON -->

    <div class="attendance-mark-area">

      <button
        type="button"
        class="attendance-mark-btn"
        id="attendanceMarkBtn"
      >
        Mark Attendance
      </button>

    </div>

  `;


  overlay.appendChild(modal);

  document.body.appendChild(overlay);


  /* =======================================================
     STORE CURRENT SESSION
  ======================================================= */

  window.currentAttendanceSession =
    session;


  /* =======================================================
     RESET CURRENT SELECTION
  ======================================================= */

  window.attendanceSelectedStudents = [];


  /* =======================================================
     CLOSE
  ======================================================= */

  document
    .getElementById("attendanceCloseBtn")
    .addEventListener(
      "click",
      closeAttendanceModal
    );


  /* =======================================================
     BULK
  ======================================================= */

  document
    .getElementById("attendanceBulkBtn")
    .addEventListener(
      "click",
      toggleAttendanceBulkMode
    );


  /* =======================================================
     MARK ATTENDANCE
  ======================================================= */

  document
    .getElementById("attendanceMarkBtn")
    .addEventListener(
      "click",
      markSelectedAttendance
    );


  /* =======================================================
     SEARCH
  ======================================================= */

  document
    .getElementById("attendanceStudentSearch")
    .addEventListener(
      "input",
      function () {

        searchAttendanceStudents(
          this.value
        );

      }
    );


  /* =======================================================
     DEPARTMENT FILTER
  ======================================================= */

  document
    .getElementById(
      "attendanceDepartmentFilter"
    )
    .addEventListener(
      "change",
      function () {

        searchAttendanceStudents(
          document.getElementById(
            "attendanceStudentSearch"
          )?.value || ""
        );

      }
    );


  /* =======================================================
     CLASS FILTER
  ======================================================= */

  document
    .getElementById(
      "attendanceClassFilter"
    )
    .addEventListener(
      "change",
      function () {

        searchAttendanceStudents(
          document.getElementById(
            "attendanceStudentSearch"
          )?.value || ""
        );

      }
    );


  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

  loadAttendanceStudents();

}


/* =========================================================
   ATTENDANCE STUDENT DATA
========================================================= */

window.attendanceStudents = [];

window.attendanceSelectedStudents = [];


/* =========================================================
   SCHOOL WHATSAPP INFORMATION
========================================================= */

window.attendanceSchoolInfo = null;


/* =========================================================
   SEARCH TIMER
========================================================= */

let attendanceSearchTimer = null;


/* =========================================================
   LOAD ALL STUDENTS
========================================================= */

async function loadAttendanceStudents() {

  try {

    /* =====================================================
       VERIFY SCHOOL CODE
    ===================================================== */

    if (
      typeof schoolCode === "undefined" ||
      !schoolCode
    ) {

      console.error(
        "Attendance: schoolCode is not available."
      );

      const results =
        document.getElementById(
          "attendanceResults"
        );

      if (results) {

        results.innerHTML = `
          <div class="attendance-error">
            School information is unavailable.
          </div>
        `;

      }

      return;

    }


    /* =====================================================
       VERIFY SUPABASE CLIENT
    ===================================================== */

    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient ||
      typeof supabaseClient.from !== "function"
    ) {

      console.error(
        "Attendance: supabaseClient is not available."
      );

      const results =
        document.getElementById(
          "attendanceResults"
        );

      if (results) {

        results.innerHTML = `
          <div class="attendance-error">
            Attendance database connection is unavailable.
          </div>
        `;

      }

      return;

    }


    /* =====================================================
       LOAD ONLY STUDENTS FROM LOGGED-IN SCHOOL

       WhatsApp contacts are loaded here as well.
    ===================================================== */

    const {
      data,
      error
    } =
      await supabaseClient
        .from("students")
        .select(`
          id,
          school_code,
          department,
          student_name,
          class,
          reg_no,
          parent_email
        `)
        .eq(
          "school_code",
          schoolCode
        )
        .order(
          "student_name",
          {
            ascending: true
          }
        );


    /* =====================================================
       DATABASE ERROR
    ===================================================== */

    if (error) {

      console.error(
        "Attendance student loading error:",
        error
      );

      const results =
        document.getElementById(
          "attendanceResults"
        );

      if (results) {

        results.innerHTML = `
          <div class="attendance-error">
            Unable to load students.
          </div>
        `;

      }

      return;

    }


    /* =====================================================
       STORE ONLY THIS SCHOOL'S STUDENTS
    ===================================================== */

    window.attendanceStudents =
      data || [];


    /* =====================================================
       LOAD SCHOOL INFORMATION

       School phone is also used for WhatsApp.
    ===================================================== */

    await loadAttendanceSchoolInfo();


    /* =====================================================
       POPULATE FILTERS
    ===================================================== */

    populateAttendanceFilters();


    /* =====================================================
       INITIAL DISPLAY
    ===================================================== */

    searchAttendanceStudents(
      document.getElementById(
        "attendanceStudentSearch"
      )?.value || ""
    );


  } catch (error) {

    console.error(
      "Attendance student loading failed:",
      error
    );


    const results =
      document.getElementById(
        "attendanceResults"
      );

    if (results) {

      results.innerHTML = `
        <div class="attendance-error">
          Unable to load attendance students.
        </div>
      `;

    }

  }

}


/* =========================================================
   LOAD SCHOOL INFORMATION FOR WHATSAPP
========================================================= */

async function loadAttendanceSchoolInfo() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("schools")
        .select(`
          school_code,
          School_name,
          phone
        `)
        .eq(
          "school_code",
          schoolCode
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Attendance school information loading error:",
        error
      );

      window.attendanceSchoolInfo = null;

      return;

    }


    window.attendanceSchoolInfo =
      data || null;


    console.log(
      "Attendance school information loaded:",
      window.attendanceSchoolInfo
    );


  } catch (error) {

    console.error(
      "Attendance school information failed:",
      error
    );

    window.attendanceSchoolInfo = null;

  }

}


/* =========================================================
   POPULATE DEPARTMENT / CLASS FILTERS
========================================================= */

function populateAttendanceFilters() {

  const departmentFilter =
    document.getElementById(
      "attendanceDepartmentFilter"
    );

  const classFilter =
    document.getElementById(
      "attendanceClassFilter"
    );


  if (
    !departmentFilter ||
    !classFilter
  ) {

    return;

  }


  /* -------------------------------------------------------
     DEPARTMENTS
  ------------------------------------------------------- */

  const departments =
    [
      ...new Set(
        (window.attendanceStudents || [])
          .map(
            student =>
              student.department
          )
          .filter(Boolean)
      )
    ]
    .sort(
      (a, b) =>
        String(a).localeCompare(
          String(b)
        )
    );


  departmentFilter.innerHTML = `
    <option value="ALL">
      ALL Departments
    </option>
  `;


  departments.forEach(
    department => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        department;

      option.textContent =
        department;

      departmentFilter.appendChild(
        option
      );

    }
  );


  /* -------------------------------------------------------
     CLASSES
  ------------------------------------------------------- */

  const classes =
    [
      ...new Set(
        (window.attendanceStudents || [])
          .map(
            student =>
              student.class
          )
          .filter(Boolean)
      )
    ]
    .sort(
      (a, b) =>
        String(a).localeCompare(
          String(b)
        )
    );


  classFilter.innerHTML = `
    <option value="ALL">
      ALL Classes
    </option>
  `;


  classes.forEach(
    className => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        className;

      option.textContent =
        className;

      classFilter.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   SEARCH ATTENDANCE STUDENTS
   ONE SEARCH ENGINE ONLY
========================================================= */

function searchAttendanceStudents(
  searchValue = ""
) {

  clearTimeout(
    attendanceSearchTimer
  );


  attendanceSearchTimer =
    setTimeout(
      function () {

        performAttendanceStudentSearch(
          searchValue
        );

      },
      150
    );

}


/* =========================================================
   PERFORM ATTENDANCE STUDENT SEARCH
========================================================= */

function performAttendanceStudentSearch(
  searchValue = ""
) {

  const results =
    document.getElementById(
      "attendanceResults"
    );


  if (!results) return;


  /* -------------------------------------------------------
     SEARCH VALUE
  ------------------------------------------------------- */

  const search =
    String(searchValue || "")
      .trim()
      .toLowerCase();


  /* -------------------------------------------------------
     DEPARTMENT
  ------------------------------------------------------- */

  const department =
    document.getElementById(
      "attendanceDepartmentFilter"
    )?.value || "ALL";


  /* -------------------------------------------------------
     CLASS
  ------------------------------------------------------- */

  const className =
    document.getElementById(
      "attendanceClassFilter"
    )?.value || "ALL";


  /* -------------------------------------------------------
     SOURCE STUDENTS
  ------------------------------------------------------- */

  let filtered =
    window.attendanceStudents || [];


  /* -------------------------------------------------------
     DEPARTMENT FILTER
  ------------------------------------------------------- */

  if (
    department !== "ALL"
  ) {

    filtered =
      filtered.filter(
        student =>
          String(
            student.department || ""
          ) ===
          String(department)
      );

  }


  /* -------------------------------------------------------
     CLASS FILTER
  ------------------------------------------------------- */

  if (
    className !== "ALL"
  ) {

    filtered =
      filtered.filter(
        student =>
          String(
            student.class || ""
          ) ===
          String(className)
      );

  }


  /* -------------------------------------------------------
     NAME / REGISTRATION NUMBER SEARCH
  ------------------------------------------------------- */

  if (search) {

    filtered =
      filtered.filter(
        student => {

          const name =
            String(
              student.student_name || ""
            )
              .toLowerCase();


          const regNo =
            String(
              student.reg_no || ""
            )
              .toLowerCase();


          return (
            name.includes(search) ||
            regNo.includes(search)
          );

        }
      );

  }


  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  renderAttendanceStudentResults(
    filtered
  );

}


/* =========================================================
   RENDER STUDENT RESULTS
========================================================= */

function renderAttendanceStudentResults(
  students
) {

  const results =
    document.getElementById(
      "attendanceResults"
    );

  if (!results) return;


  if (!students || !students.length) {

    results.innerHTML = `
      <div class="attendance-no-results">
        No students found.
      </div>
    `;

    return;

  }


  results.innerHTML =
    students.map(
      student => {

        const studentId =
          String(student.id);


        const isSelected =
          (
            window.attendanceSelectedStudents ||
            []
          ).some(
            selected =>
              String(selected.id) ===
              studentId
          );


        return `

          <label
            class="attendance-student-row"
            data-student-id="${escapeAttendanceHTML(
              studentId
            )}"
          >

            <input
              type="checkbox"
              class="attendance-student-checkbox"
              value="${escapeAttendanceHTML(
                studentId
              )}"
              data-student-id="${escapeAttendanceHTML(
                studentId
              )}"
              ${isSelected ? "checked" : ""}
            >

            <span class="attendance-student-name">
              ${escapeAttendanceHTML(
                student.student_name || ""
              )}
            </span>

            <span class="attendance-student-class">
              ${escapeAttendanceHTML(
                student.class || ""
              )}
            </span>

            <span class="attendance-student-reg">
              ${escapeAttendanceHTML(
                student.reg_no || ""
              )}
            </span>

          </label>

        `;

      }
    ).join("");


  /* =======================================================
     CHECKBOX EVENTS
  ======================================================= */

  const checkboxes =
    results.querySelectorAll(
      ".attendance-student-checkbox"
    );


  checkboxes.forEach(
    checkbox => {

      checkbox.addEventListener(
        "change",
        function () {

          const studentId =
            this.dataset.studentId;


          const student =
            (
              window.attendanceStudents ||
              []
            ).find(
              item =>
                String(item.id) ===
                String(studentId)
            );


          if (!student) return;


          handleAttendanceStudentSelection(
            student,
            this.checked
          );

        }
      );

    }
  );

}


/* =========================================================
   HANDLE STUDENT SELECTION
========================================================= */

function handleAttendanceStudentSelection(
  student,
  checked
) {

  if (
    !Array.isArray(
      window.attendanceSelectedStudents
    )
  ) {

    window.attendanceSelectedStudents =
      [];

  }


  const selected =
    window.attendanceSelectedStudents;


  const existingIndex =
    selected.findIndex(
      item =>
        String(item.id) ===
        String(student.id)
    );


  /* -------------------------------------------------------
     SELECT
  ------------------------------------------------------- */

  if (checked) {

    if (
      existingIndex === -1
    ) {

      selected.push(
        student
      );

    }

  }


  /* -------------------------------------------------------
     UNSELECT
  ------------------------------------------------------- */

  else {

    if (
      existingIndex !== -1
    ) {

      selected.splice(
        existingIndex,
        1
      );

    }

  }


  console.log(
    "Selected attendance students:",
    selected
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeAttendanceModal() {

  const modal =
    document.getElementById(
      "attendanceModalOverlay"
    );


  if (modal) {

    modal.remove();

  }


  window.attendanceSelectedStudents =
    [];

}


/* =========================================================
   BULK MODE
========================================================= */

function toggleAttendanceBulkMode() {

  const filters =
    document.getElementById(
      "attendanceFilters"
    );


  if (!filters) return;


  if (
    filters.style.display === "none" ||
    filters.style.display === ""
  ) {

    filters.style.display =
      "grid";

  } else {

    filters.style.display =
      "none";

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeAttendanceHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   ESCAPE TEXT
   Kept as a compatibility function in case another
   attendance function uses it.
========================================================= */

function escapeAttendanceText(
  value
) {

  return escapeAttendanceHTML(
    value
  );

}


/* =========================================================
   VIEW STUDENT ATTENDANCE
   CALENDAR-BASED ATTENDANCE LOG BOOK
========================================================= */

function openStudentAttendanceViewer() {

  hideTeacherAttendanceMenu();

  const existing =
    document.getElementById(
      "studentAttendanceViewerOverlay"
    );

  if (existing) {
    existing.remove();
  }


  const overlay =
    document.createElement("div");

  overlay.id =
    "studentAttendanceViewerOverlay";

  overlay.className =
    "student-attendance-viewer-overlay";


  const modal =
    document.createElement("div");

  modal.className =
    "student-attendance-viewer";


  modal.innerHTML = `

    <!-- =================================================
         HEADER
    ================================================== -->

    <div class="student-attendance-viewer-header">

      <div class="student-attendance-viewer-title">
        Student Attendance
      </div>

      <button
        type="button"
        class="student-attendance-viewer-close"
        id="studentAttendanceViewerClose"
        aria-label="Close"
      >
        ×
      </button>

    </div>


    <!-- =================================================
         STUDENT SEARCH
    ================================================== -->

    <div class="student-attendance-viewer-search">

      <input
        type="text"
        id="studentAttendanceViewerSearch"
        placeholder="Search student / Reg No."
        autocomplete="off"
      >

    </div>


    <!-- =================================================
         SEARCH RESULTS
    ================================================== -->

    <div
      id="studentAttendanceViewerResults"
      class="student-attendance-viewer-results"
    >
    </div>


    <!-- =================================================
         SELECTED STUDENT
    ================================================== -->

    <div
      id="studentAttendanceSelected"
      class="student-attendance-selected"
      style="display:none;"
    >

      <div class="student-attendance-selected-info">

        <div
          id="studentAttendanceSelectedName"
          class="student-attendance-selected-name"
        ></div>

        <div
          id="studentAttendanceSelectedDetails"
          class="student-attendance-selected-details"
        ></div>

      </div>

      <div
        id="studentAttendanceCounters"
        class="student-attendance-counters"
      >

        <div class="student-attendance-counter morning">

          <span class="student-attendance-counter-label">
            Morning Marks
          </span>

          <span
            id="studentAttendanceMorningCount"
            class="student-attendance-counter-value"
          >
            0
          </span>

        </div>


        <div class="student-attendance-counter afternoon">

          <span class="student-attendance-counter-label">
            Afternoon Marks
          </span>

          <span
            id="studentAttendanceAfternoonCount"
            class="student-attendance-counter-value"
          >
            0
          </span>

        </div>

      </div>

    </div>


    <!-- =================================================
         CALENDAR
    ================================================== -->

    <div
      id="studentAttendanceCalendar"
      class="student-attendance-calendar"
      style="display:none;"
    >
    </div>

  `;


  overlay.appendChild(modal);

  document.body.appendChild(overlay);


  /* =====================================================
     CLOSE
  ===================================================== */

  document
    .getElementById(
      "studentAttendanceViewerClose"
    )
    .addEventListener(
      "click",
      closeStudentAttendanceViewer
    );


  /* =====================================================
     SEARCH
  ===================================================== */

  document
    .getElementById(
      "studentAttendanceViewerSearch"
    )
    .addEventListener(
      "input",
      function () {

        searchStudentAttendanceViewer(
          this.value
        );

      }
    );


  /* =====================================================
     STORE STATE
  ===================================================== */

  window.studentAttendanceViewerStudent =
    null;

  window.studentAttendanceViewerRecords =
    [];


  /* =====================================================
     LOAD SCHOOL STUDENTS
  ===================================================== */

  loadStudentAttendanceViewerStudents();

}


/* =========================================================
   CLOSE VIEWER
========================================================= */

function closeStudentAttendanceViewer() {

  const overlay =
    document.getElementById(
      "studentAttendanceViewerOverlay"
    );

  if (overlay) {
    overlay.remove();
  }

}


/* =========================================================
   LOAD STUDENTS FOR ATTENDANCE VIEWER
========================================================= */

async function loadStudentAttendanceViewerStudents() {

  try {

    if (
      typeof schoolCode === "undefined" ||
      !schoolCode
    ) {

      console.error(
        "Student Attendance Viewer: schoolCode unavailable."
      );

      return;
    }


    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient ||
      typeof supabaseClient.from !== "function"
    ) {

      console.error(
        "Student Attendance Viewer: Supabase unavailable."
      );

      return;
    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("students")
        .select(`
          id,
          school_code,
          department,
          student_name,
          class,
          reg_no
        `)
        .eq(
          "school_code",
          schoolCode
        )
        .order(
          "student_name",
          {
            ascending: true
          }
        );


    if (error) {

      console.error(
        "Student Attendance Viewer student loading error:",
        error
      );

      return;
    }


    window.studentAttendanceViewerStudents =
      data || [];


  } catch (error) {

    console.error(
      "Student Attendance Viewer loading failed:",
      error
    );

  }

}


/* =========================================================
   SEARCH VIEWER STUDENTS
========================================================= */

function searchStudentAttendanceViewer(
  searchValue = ""
) {

  const results =
    document.getElementById(
      "studentAttendanceViewerResults"
    );

  if (!results) return;


  const search =
    String(searchValue || "")
      .trim()
      .toLowerCase();


  if (!search) {

    results.innerHTML = "";

    return;
  }


  const students =
    window.studentAttendanceViewerStudents ||
    [];


  const filtered =
    students.filter(
      student => {

        const name =
          String(
            student.student_name || ""
          ).toLowerCase();


        const regNo =
          String(
            student.reg_no || ""
          ).toLowerCase();


        return (
          name.includes(search) ||
          regNo.includes(search)
        );

      }
    )
    .slice(0, 30);


  if (!filtered.length) {

    results.innerHTML = `
      <div class="student-attendance-viewer-empty">
        No students found.
      </div>
    `;

    return;
  }


  results.innerHTML =
    filtered.map(
      student => `

        <button
          type="button"
          class="student-attendance-viewer-student"
          data-student-id="${student.id}"
        >

          <span class="student-attendance-viewer-student-name">
            ${escapeAttendanceHTML(
              student.student_name || ""
            )}
          </span>

          <span class="student-attendance-viewer-student-class">
            ${escapeAttendanceHTML(
              student.class || ""
            )}
          </span>

          <span class="student-attendance-viewer-student-reg">
            ${escapeAttendanceHTML(
              student.reg_no || ""
            )}
          </span>

        </button>

      `
    )
    .join("");


  results
    .querySelectorAll(
      ".student-attendance-viewer-student"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            const studentId =
              this.dataset.studentId;


            const student =
              students.find(
                item =>
                  String(item.id) ===
                  String(studentId)
              );


            if (student) {

              selectStudentForAttendanceViewer(
                student
              );

            }

          }
        );

      }
    );

}


/* =========================================================
   SELECT STUDENT
========================================================= */

function selectStudentForAttendanceViewer(
  student
) {

  window.studentAttendanceViewerStudent =
    student;


  const searchBox =
    document.getElementById(
      "studentAttendanceViewerSearch"
    );

  const results =
    document.getElementById(
      "studentAttendanceViewerResults"
    );

  const selected =
    document.getElementById(
      "studentAttendanceSelected"
    );

  const name =
    document.getElementById(
      "studentAttendanceSelectedName"
    );

  const details =
    document.getElementById(
      "studentAttendanceSelectedDetails"
    );

  const calendar =
    document.getElementById(
      "studentAttendanceCalendar"
    );


  if (searchBox) {

    searchBox.value =
      student.student_name || "";

  }


  if (results) {

    results.innerHTML = "";

  }


  if (selected) {

    selected.style.display =
      "block";

  }


  if (name) {

    name.textContent =
      student.student_name || "";

  }


  if (details) {

    details.textContent =
      `${student.class || ""}  •  ${student.reg_no || ""}`;

  }


  if (calendar) {

    calendar.style.display =
      "block";

  }


  loadStudentAttendanceCalendar(
    student
  );

}


/* =========================================================
   LOAD STUDENT ATTENDANCE
========================================================= */

async function loadStudentAttendanceCalendar(
  student
) {

  const calendar =
    document.getElementById(
      "studentAttendanceCalendar"
    );

  if (!calendar) return;


  calendar.innerHTML = `
    <div class="student-attendance-calendar-loading">
      Loading attendance...
    </div>
  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("student_attendance")
        .select(`
          id,
          attendance_date,
          morning_present,
          afternoon_present
        `)
        .eq(
          "school_code",
          schoolCode
        )
        .eq(
          "student_id",
          student.id
        )
        .order(
          "attendance_date",
          {
            ascending: true
          }
        );


    if (error) {

      console.error(
        "Student attendance calendar loading error:",
        error
      );


      calendar.innerHTML = `
        <div class="student-attendance-viewer-empty">
          Unable to load attendance.
        </div>
      `;

      return;
    }


    window.studentAttendanceViewerRecords =
      data || [];


    updateStudentAttendanceCounters(
      data || []
    );


    renderStudentAttendanceCalendar(
      student,
      data || []
    );


  } catch (error) {

    console.error(
      "Student attendance calendar failed:",
      error
    );


    calendar.innerHTML = `
      <div class="student-attendance-viewer-empty">
        Unable to load attendance.
      </div>
    `;

  }

}


/* =========================================================
   ATTENDANCE COUNTERS
========================================================= */

function updateStudentAttendanceCounters(
  records
) {

  const morningCount =
    records.filter(
      record =>
        record.morning_present === true
    ).length;


  const afternoonCount =
    records.filter(
      record =>
        record.afternoon_present === true
    ).length;


  const morningElement =
    document.getElementById(
      "studentAttendanceMorningCount"
    );


  const afternoonElement =
    document.getElementById(
      "studentAttendanceAfternoonCount"
    );


  if (morningElement) {

    morningElement.textContent =
      morningCount;

  }


  if (afternoonElement) {

    afternoonElement.textContent =
      afternoonCount;

  }

}


/* =========================================================
   RENDER CALENDAR
========================================================= */

function renderStudentAttendanceCalendar(
  student,
  records
) {

  const calendar =
    document.getElementById(
      "studentAttendanceCalendar"
    );

  if (!calendar) return;


  const recordMap =
    new Map();


  records.forEach(
    record => {

      recordMap.set(
        record.attendance_date,
        record
      );

    }
  );


  const today =
    new Date();


  let year =
    today.getFullYear();


  let month =
    today.getMonth();


  function renderMonth() {

    const firstDay =
      new Date(
        year,
        month,
        1
      );


    const lastDay =
      new Date(
        year,
        month + 1,
        0
      );


    const monthName =
      firstDay.toLocaleString(
        "en-US",
        {
          month: "long"
        }
      );


    const daysInMonth =
      lastDay.getDate();


    /*
       Monday-based calendar
    */

    let startingDay =
      firstDay.getDay();

    startingDay =
      startingDay === 0
        ? 6
        : startingDay - 1;


    let html = `

      <div class="student-attendance-calendar-header">

        <button
          type="button"
          class="student-attendance-calendar-nav"
          id="attendanceCalendarPrev"
        >
          ‹
        </button>

        <div class="student-attendance-calendar-month">
          ${monthName} ${year}
        </div>

        <button
          type="button"
          class="student-attendance-calendar-nav"
          id="attendanceCalendarNext"
        >
          ›
        </button>

      </div>


      <div class="student-attendance-calendar-weekdays">

        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>

      </div>


      <div class="student-attendance-calendar-grid">
    `;


    /* EMPTY CELLS */

    for (
      let i = 0;
      i < startingDay;
      i++
    ) {

      html += `
        <div class="student-attendance-calendar-day empty">
        </div>
      `;

    }


    /* DAYS */

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      const date =
        `${year}-${
          String(
            month + 1
          ).padStart(
            2,
            "0"
          )
        }-${
          String(day).padStart(
            2,
            "0"
          )
        }`;


      const record =
        recordMap.get(date);


      let ticks = "";


      if (
        record &&
        record.morning_present
      ) {

        ticks += `
          <span
            class="attendance-tick morning"
            title="Morning"
          >✓</span>
        `;

      }


      if (
        record &&
        record.afternoon_present
      ) {

        ticks += `
          <span
            class="attendance-tick afternoon"
            title="Afternoon"
          >✓</span>
        `;

      }


      html += `

        <div
          class="student-attendance-calendar-day"
          data-date="${date}"
        >

          <div class="student-attendance-calendar-date">
            ${day}
          </div>

          <div class="student-attendance-calendar-ticks">
            ${ticks}
          </div>

        </div>

      `;

    }


    html += `
      </div>
    `;


    calendar.innerHTML =
      html;


    document
      .getElementById(
        "attendanceCalendarPrev"
      )
      .addEventListener(
        "click",
        function () {

          month--;

          if (month < 0) {

            month = 11;
            year--;

          }

          renderMonth();

        }
      );


    document
      .getElementById(
        "attendanceCalendarNext"
      )
      .addEventListener(
        "click",
        function () {

          month++;

          if (month > 11) {

            month = 0;
            year++;

          }

          renderMonth();

        }
      );

  }


  renderMonth();

}


/* =========================================================
   MARK ATTENDANCE
   ONE ENGINE FOR MORNING + AFTERNOON
========================================================= */

async function markSelectedAttendance() {

  const session =
    window.currentAttendanceSession;


  /* -------------------------------------------------------
     VALIDATE SESSION
  ------------------------------------------------------- */

  if (
    session !== "morning" &&
    session !== "afternoon"
  ) {

    showAttendanceMessage(
      "Invalid attendance session.",
      "error"
    );

    return;

  }


  /* -------------------------------------------------------
     GET SELECTED STUDENTS
  ------------------------------------------------------- */

  const checkboxes =
    document.querySelectorAll(
      ".attendance-student-checkbox:checked"
    );


  if (
    !checkboxes.length
  ) {

    showAttendanceMessage(
      "Please select at least one student.",
      "error"
    );

    return;

  }


  /* -------------------------------------------------------
     SELECTED IDS
  ------------------------------------------------------- */

  const selectedIds =
    [...checkboxes]
      .map(
        checkbox =>
          String(
            checkbox.dataset.studentId
          )
      );


  /* -------------------------------------------------------
     FIND SELECTED STUDENTS
  ------------------------------------------------------- */

  const selectedStudents =
    (window.attendanceStudents || [])
      .filter(
        student =>
          selectedIds.includes(
            String(student.id)
          )
      );


  if (
    !selectedStudents.length
  ) {

    showAttendanceMessage(
      "No valid students selected.",
      "error"
    );

    return;

  }


  /* -------------------------------------------------------
     CURRENT DATE + TIME

     This timestamp is the same timestamp stored in
     student_attendance and used for WhatsApp.
  ------------------------------------------------------- */

  const now =
    new Date();


  const attendanceTimestamp =
    now.toISOString();


  const attendanceDate =
    `${now.getFullYear()}-${
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      )
    }-${
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      )
    }`;


  let markedCount =
    0;

  let alreadyMarkedCount =
    0;

  let failedCount =
    0;

let emailSentCount =
  0;

let emailFailedCount =
  0;


  /* -------------------------------------------------------
     DISABLE BUTTON WHILE PROCESSING
  ------------------------------------------------------- */

  const markButton =
    document.getElementById(
      "attendanceMarkBtn"
    );


  if (markButton) {

    markButton.disabled =
      true;

    markButton.textContent =
      "Marking...";

  }


  try {

    /* =====================================================
       PROCESS EACH STUDENT
    ===================================================== */

    for (
      const student of selectedStudents
    ) {

      try {

        const studentSchoolCode =
          student.school_code;


        /* -----------------------------------------------
           CHECK TODAY'S ATTENDANCE RECORD
        ----------------------------------------------- */

        const {
          data: existingRecord,
          error: selectError
        } =
          await supabaseClient
            .from(
              "student_attendance"
            )
            .select(`
              id,
              morning_present,
              afternoon_present
            `)
            .eq(
              "school_code",
              studentSchoolCode
            )
            .eq(
              "student_id",
              student.id
            )
            .eq(
              "attendance_date",
              attendanceDate
            )
            .maybeSingle();


        /* -----------------------------------------------
           LOOKUP ERROR
        ----------------------------------------------- */

        if (selectError) {

          console.error(
            "Attendance lookup error:",
            selectError
          );

          failedCount++;

          continue;

        }


        /* -----------------------------------------------
           ALREADY MARKED
        ----------------------------------------------- */

        if (
          existingRecord &&
          (
            session === "morning"
              ? existingRecord.morning_present
              : existingRecord.afternoon_present
          )
        ) {

          alreadyMarkedCount++;

          continue;

        }


        let attendanceWasSaved =
          false;


        /* -----------------------------------------------
           UPDATE EXISTING DAY
        ----------------------------------------------- */

        if (existingRecord) {

          const updateData =
            session === "morning"
              ? {
                  morning_present:
                    true,

                  morning_marked_at:
                    attendanceTimestamp,

                  updated_at:
                    attendanceTimestamp
                }
              : {
                  afternoon_present:
                    true,

                  afternoon_marked_at:
                    attendanceTimestamp,

                  updated_at:
                    attendanceTimestamp
                };


          const {
            error: updateError
          } =
            await supabaseClient
              .from(
                "student_attendance"
              )
              .update(
                updateData
              )
              .eq(
                "id",
                existingRecord.id
              );


          if (updateError) {

            console.error(
              "Attendance update error:",
              updateError
            );

            failedCount++;

            continue;

          }


          markedCount++;

          attendanceWasSaved =
            true;

        }


        /* -----------------------------------------------
           CREATE NEW DAY RECORD
        ----------------------------------------------- */

        else {

          const insertData = {

            school_code:
              studentSchoolCode,

            student_id:
              student.id,

            reg_no:
              student.reg_no ||
              null,

            attendance_date:
              attendanceDate,

            morning_present:
              session === "morning",

            afternoon_present:
              session === "afternoon",

            morning_marked_at:
              session === "morning"
                ? attendanceTimestamp
                : null,

            afternoon_marked_at:
              session === "afternoon"
                ? attendanceTimestamp
                : null,

            created_at:
              attendanceTimestamp,

            updated_at:
              attendanceTimestamp

          };


          const {
            error: insertError
          } =
            await supabaseClient
              .from(
                "student_attendance"
              )
              .insert(
                insertData
              );


          /* ---------------------------------------------
             INSERT ERROR
          --------------------------------------------- */

          if (insertError) {

            console.error(
              "Attendance insert error:",
              insertError
            );


            /* -------------------------------------------
               UNIQUE CONSTRAINT PROTECTION
            ------------------------------------------- */

            if (
              insertError.code ===
              "23505"
            ) {

              alreadyMarkedCount++;

            } else {

              failedCount++;

            }

            continue;

          }


          markedCount++;

          attendanceWasSaved =
            true;

        }


        /* =================================================
           SEND EMAIL ONLY AFTER SUCCESSFUL MARKING
        ================================================= */

        if (
          attendanceWasSaved
        ) {

const emailResult =
  await sendAttendanceEmailNotification(
    student,
    session,
    attendanceTimestamp
  );


if (
  emailResult.sent
) {

  emailSentCount +=
    emailResult.sentCount;

}


if (
  emailResult.failed
) {

  emailFailedCount +=
    emailResult.failedCount;

}

        }


      } catch (
        studentError
      ) {

        console.error(
          "Student attendance error:",
          studentError
        );

        failedCount++;

      }

    }


    /* =====================================================
       RESULT MESSAGE
    ===================================================== */

    let message =
      "";


    if (
      markedCount === 1
    ) {

      message =
        "1 student has been marked.";

    }

    else if (
      markedCount > 1
    ) {

      message =
        `${markedCount} students have been marked.`;

    }


    if (
      alreadyMarkedCount > 0
    ) {

      if (message) {

        message +=
          " ";

      }


      message +=
        `${alreadyMarkedCount} already marked and skipped.`;

    }


    if (
      failedCount > 0
    ) {

      if (message) {

        message +=
          " ";

      }


      message +=
        `${failedCount} could not be marked.`;

    }


    /* =====================================================
       EMAIL RESULT
    ===================================================== */

    if (
  emailSentCount > 0
) {

  if (message) {

    message +=
      " ";

  }


  message +=
    `Email sent to ${emailSentCount} recipient${
      emailSentCount === 1
        ? ""
        : "s"
    }.`;

}


if (
  emailFailedCount > 0
) {

  if (message) {

    message +=
      " ";

  }


  message +=
    `Email notification failed for ${emailFailedCount} recipient${
      emailFailedCount === 1
        ? ""
        : "s"
    }.`;

}


    if (!message) {

      message =
        "No attendance was marked.";

    }


    showAttendanceMessage(
      message,
      (
        failedCount > 0 ||
        emailFailedCount > 0
      )
        ? "error"
        : "success"
    );


    /* =====================================================
       REFRESH SEARCH RESULTS
    ===================================================== */

    searchAttendanceStudents(
      document.getElementById(
        "attendanceStudentSearch"
      )?.value || ""
    );


  } catch (error) {

    console.error(
      "Attendance marking failed:",
      error
    );


    showAttendanceMessage(
      "Attendance marking failed. Please try again.",
      "error"
    );


  } finally {

    if (markButton) {

      markButton.disabled =
        false;

      markButton.textContent =
        "Mark Attendance";

    }

  }

}


/* =========================================================
   SEND ATTENDANCE EMAIL NOTIFICATION
========================================================= */

async function sendAttendanceEmailNotification(
  student,
  session,
  attendanceTimestamp
) {

  let sentCount = 0;

  let failedCount = 0;


  try {

    /* =====================================================
       PARENT EMAIL
    ===================================================== */

    const parentEmail =
      String(
        student.parent_email || ""
      ).trim();


    /* =====================================================
       NO PARENT EMAIL
    ===================================================== */

    if (!parentEmail) {

      console.warn(
        "No parent email available for:",
        student.student_name
      );


      return {

        sent: false,

        failed: false,

        sentCount: 0,

        failedCount: 0

      };

    }


    /* =====================================================
       CHECK SUPABASE FUNCTIONS
    ===================================================== */

    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient ||
      !supabaseClient.functions
    ) {

      console.error(
        "Supabase Functions client unavailable."
      );


      return {

        sent: false,

        failed: true,

        sentCount: 0,

        failedCount: 1

      };

    }


    /* =====================================================
       INVOKE EMAIL EDGE FUNCTION
    ===================================================== */

    const {
      data,
      error
    } =
      await supabaseClient.functions.invoke(
        "send-attendance-email",
        {

          body: {

            school_code:
              student.school_code,

            student_name:
              student.student_name,

            session:
              session,

            attendance_timestamp:
              attendanceTimestamp,

            parent_email:
              parentEmail

          }

        }
      );


    /* =====================================================
       FUNCTION ERROR
    ===================================================== */

    if (error) {

      console.error(
        "Attendance email function error:",
        error
      );


      failedCount++;


      return {

        sent: false,

        failed: true,

        sentCount:

          sentCount,

        failedCount:

          failedCount

      };

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    if (
      data &&
      data.success === true
    ) {

      sentCount++;


      console.log(
        "Attendance email sent successfully:",
        parentEmail
      );


      return {

        sent: true,

        failed: false,

        sentCount:

          sentCount,

        failedCount:

          failedCount

      };

    }


    /* =====================================================
       SKIPPED
    ===================================================== */

    if (
      data &&
      data.skipped === true
    ) {

      console.warn(
        "Attendance email skipped:",
        data.error
      );


      return {

        sent: false,

        failed: false,

        sentCount: 0,

        failedCount: 0

      };

    }


    /* =====================================================
       UNSUCCESSFUL RESPONSE
    ===================================================== */

    console.error(
      "Attendance email returned unsuccessful result:",
      data
    );


    failedCount++;


    return {

      sent: false,

      failed: true,

      sentCount:

        sentCount,

      failedCount:

        failedCount

    };


  } catch (error) {

    console.error(
      "Attendance email notification failed:",
      error
    );


    return {

      sent: false,

      failed: true,

      sentCount: 0,

      failedCount: 1

    };

  }

}




/* =========================================================
   NORMALIZE WHATSAPP NUMBER
========================================================= */

function normalizeAttendanceWhatsAppNumber(
  number
) {

  if (
    number === null ||
    number === undefined
  ) {

    return null;

  }


  let value =
    String(number)
      .trim();


  if (!value) {

    return null;

  }


  /* -------------------------------------------------------
     Remove spaces, brackets, dashes and other symbols
     while preserving a leading +
  ------------------------------------------------------- */

  value =
    value.replace(
      /[^\d+]/g,
      ""
    );


  /* -------------------------------------------------------
     Convert +234XXXXXXXXXX
     to 234XXXXXXXXXX
  ------------------------------------------------------- */

  if (
    value.startsWith("+")
  ) {

    value =
      value.substring(1);

  }


  /* -------------------------------------------------------
     Nigerian local format:
     08123456789
     ->
     2348123456789
  ------------------------------------------------------- */

  if (
    value.startsWith("0") &&
    value.length === 11
  ) {

    value =
      "234" +
      value.substring(1);

  }


  /* -------------------------------------------------------
     Already international Nigerian number
  ------------------------------------------------------- */

  if (
    value.startsWith("234") &&
    value.length === 13
  ) {

    return value;

  }


  /* -------------------------------------------------------
     Return other international numbers unchanged
     when they appear reasonably valid.
  ------------------------------------------------------- */

  if (
    value.length >= 10
  ) {

    return value;

  }


  return null;

}


/* =========================================================
   ATTENDANCE MESSAGE
========================================================= */

function showAttendanceMessage(
  message,
  type = "success"
) {

  const existing =
    document.getElementById(
      "attendanceMessage"
    );


  if (existing) {

    existing.remove();

  }


  const messageBox =
    document.createElement(
      "div"
    );


  messageBox.id =
    "attendanceMessage";


  messageBox.className =
    `attendance-message ${type}`;


  messageBox.textContent =
    message;


  document.body.appendChild(
    messageBox
  );


  setTimeout(
    () => {

      if (
        messageBox &&
        messageBox.parentNode
      ) {

        messageBox.remove();

      }

    },
    5000
  );

}
