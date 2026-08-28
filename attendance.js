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
   SEARCH TIMER
========================================================= */

let attendanceSearchTimer = null;


/* =========================================================
   LOAD ALL STUDENTS
========================================================= */

async function loadAttendanceStudents() {

  try {

    /* -------------------------------------------------------
       VERIFY SUPABASE CLIENT
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       LOAD STUDENTS
    ------------------------------------------------------- */

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
        .order(
          "student_name",
          {
            ascending: true
          }
        );


    /* -------------------------------------------------------
       DATABASE ERROR
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       STORE STUDENTS
    ------------------------------------------------------- */

    window.attendanceStudents =
      data || [];


    /* -------------------------------------------------------
       POPULATE FILTERS
    ------------------------------------------------------- */

    populateAttendanceFilters();


    /* -------------------------------------------------------
       INITIAL DISPLAY
    ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     NO RESULTS
  ------------------------------------------------------- */

  if (
    !students ||
    !students.length
  ) {

    results.innerHTML = `
      <div class="attendance-no-results">
        No students found.
      </div>
    `;

    return;

  }


  /* -------------------------------------------------------
     RENDER STUDENTS
  ------------------------------------------------------- */

  results.innerHTML =
    students
      .map(
        student => {

          const studentId =
            String(
              student.id
            );


          const isSelected =
            (
              window.attendanceSelectedStudents ||
              []
            )
              .some(
                selected =>
                  String(
                    selected.id
                  ) ===
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
      )
      .join("");


  /* -------------------------------------------------------
     CHECKBOX EVENTS
  ------------------------------------------------------- */

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
            (window.attendanceStudents || [])
              .find(
                item =>
                  String(
                    item.id
                  ) ===
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
========================================================= */

function openStudentAttendanceViewer() {

  hideTeacherAttendanceMenu();


  // Viewer will be built in the next stage.

  console.log(
    "Student attendance viewer selected."
  );

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
  ------------------------------------------------------- */

  const now =
    new Date();


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

        const schoolCode =
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
              schoolCode
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
                    now.toISOString(),

                  updated_at:
                    now.toISOString()
                }
              : {
                  afternoon_present:
                    true,

                  afternoon_marked_at:
                    now.toISOString(),

                  updated_at:
                    now.toISOString()
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

          continue;

        }


        /* -----------------------------------------------
           CREATE NEW DAY RECORD
        ----------------------------------------------- */

        const insertData = {

          school_code:
            schoolCode,

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
              ? now.toISOString()
              : null,

          afternoon_marked_at:
            session === "afternoon"
              ? now.toISOString()
              : null,

          created_at:
            now.toISOString(),

          updated_at:
            now.toISOString()

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


        /* -----------------------------------------------
           INSERT ERROR
        ----------------------------------------------- */

        if (insertError) {

          console.error(
            "Attendance insert error:",
            insertError
          );


          /* ---------------------------------------------
             UNIQUE CONSTRAINT PROTECTION
          --------------------------------------------- */

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


    if (!message) {

      message =
        "No attendance was marked.";

    }


    showAttendanceMessage(
      message,
      failedCount > 0
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
    4000
  );

}
