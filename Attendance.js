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
    document.getElementById("attendanceModalOverlay");

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


  /* CLOSE */

  document
    .getElementById("attendanceCloseBtn")
    .addEventListener(
      "click",
      closeAttendanceModal
    );


  /* BULK */

  document
    .getElementById("attendanceBulkBtn")
    .addEventListener(
      "click",
      toggleAttendanceBulkMode
    );

  /* MARK ATTENDANCE */

  document
    .getElementById("attendanceMarkBtn")
    .addEventListener(
      "click",
      markSelectedAttendance
    );

  /* SEARCH */

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

  /* FILTERS */

  document
    .getElementById("attendanceDepartmentFilter")
    .addEventListener(
      "change",
      function () {

        searchAttendanceStudents(
          document.getElementById(
            "attendanceStudentSearch"
          ).value
        );

      }
    );


  document
    .getElementById("attendanceClassFilter")
    .addEventListener(
      "change",
      function () {

        searchAttendanceStudents(
          document.getElementById(
            "attendanceStudentSearch"
          ).value
        );

      }
    );

  /* STORE CURRENT SESSION */

  window.currentAttendanceSession =
    session;
  loadAttendanceStudents();

}

/* =========================================================
   SEARCH ATTENDANCE STUDENTS
========================================================= */

async function searchAttendanceStudents(searchTerm) {

  const results =
    document.getElementById("attendanceResults");

  if (!results) return;

  const term =
    String(searchTerm || "").trim();

  /* -----------------------------------------
     EMPTY SEARCH
  ----------------------------------------- */

  if (!term) {

    results.innerHTML = "";

    return;
  }


  /* -----------------------------------------
     SHOW LOADING
  ----------------------------------------- */

  results.innerHTML = `
    <div class="attendance-loading">
      Searching students...
    </div>
  `;


  try {

    let query = supabase
      .from("students")
      .select(`
        id,
        school_code,
        student_name,
        class,
        reg_no,
        department
      `)
      .or(
        `student_name.ilike.%${term}%,reg_no.ilike.%${term}%`
      )
      .order("student_name", {
        ascending: true
      })
      .limit(50);


    const { data, error } =
      await query;


    /* -----------------------------------------
       DATABASE ERROR
    ----------------------------------------- */

    if (error) {

      console.error(
        "ATTENDANCE STUDENT SEARCH ERROR:",
        error
      );

      results.innerHTML = `
        <div class="attendance-no-results">
          Unable to search students.
        </div>
      `;

      return;
    }


    /* -----------------------------------------
       NO RESULTS
    ----------------------------------------- */

    if (!data || data.length === 0) {

      results.innerHTML = `
        <div class="attendance-no-results">
          No student found.
        </div>
      `;

      return;
    }


    /* -----------------------------------------
       DISPLAY RESULTS
    ----------------------------------------- */

    results.innerHTML =
      data.map(student => `

        <label
          class="attendance-student-row"
          data-student-id="${student.id}"
        >

          <input
            type="checkbox"
            class="attendance-student-checkbox"
            value="${student.id}"
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

      `).join("");


  } catch (error) {

    console.error(
      "ATTENDANCE SEARCH FAILED:",
      error
    );

    results.innerHTML = `
      <div class="attendance-no-results">
        Unable to search students.
      </div>
    `;

  }

}


/* =========================================================
   ESCAPE HTML
   Prevents student data from being interpreted as HTML.
========================================================= */

function escapeAttendanceHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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

    filters.style.display = "grid";

  } else {

    filters.style.display = "none";

  }

}

/* =========================================================
   ATTENDANCE STUDENT SEARCH
========================================================= */

let attendanceSearchTimer = null;


/* =========================================================
   SEARCH STUDENTS
========================================================= */

/* =========================================================
   SEARCH ATTENDANCE STUDENTS
========================================================= */

function searchAttendanceStudents(searchText) {

  clearTimeout(attendanceSearchTimer);

  attendanceSearchTimer = setTimeout(
    async function () {

      const results =
        document.getElementById(
          "attendanceResults"
        );

      if (!results) return;


      const search =
        String(searchText || "").trim();


      /* -----------------------------------------
         NOTHING ENTERED
      ----------------------------------------- */

      if (!search) {

        results.innerHTML = `
          <div class="attendance-empty">
            Search for a student by name or Reg No.
          </div>
        `;

        return;
      }


      /* -----------------------------------------
         LOADING
      ----------------------------------------- */

      results.innerHTML = `
        <div class="attendance-loading">
          Searching...
        </div>
      `;


      try {

        /* -----------------------------------------
           SEARCH STUDENTS
        ----------------------------------------- */

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
              parent_contact1,
              parent_contact2
            `)
            .eq(
              "school_code",
              schoolCode
            )
            .or(
              `student_name.ilike.%${search}%,reg_no.ilike.%${search}%`
            )
            .order(
              "student_name",
              {
                ascending: true
              }
            )
            .limit(50);


        /* -----------------------------------------
           DATABASE ERROR
        ----------------------------------------- */

        if (error) {

          console.error(
            "Attendance student search error:",
            error
          );

          results.innerHTML = `
            <div class="attendance-error">
              Unable to search students.
            </div>
          `;

          return;
        }


        const students =
          data || [];


        /* -----------------------------------------
           NO RESULTS
        ----------------------------------------- */

        if (!students.length) {

          results.innerHTML = `
            <div class="attendance-empty">
              No students found.
            </div>
          `;

          return;
        }


        /* -----------------------------------------
           RENDER RESULTS
        ----------------------------------------- */

        renderAttendanceStudents(
          students
        );


      } catch (error) {

        console.error(
          "Attendance search failed:",
          error
        );

        results.innerHTML = `
          <div class="attendance-error">
            An error occurred while searching.
          </div>
        `;
      }

    },
    250
  );
}


/* =========================================================
   RENDER STUDENT RESULTS
========================================================= */

function renderAttendanceStudents(
  students
) {

  const results =
    document.getElementById(
      "attendanceResults"
    );

  if (!results) return;


  results.innerHTML = "";


  students.forEach(
    function (student) {

      const row =
        document.createElement("div");


      row.className =
        "attendance-student-row";


      row.innerHTML = `

        <label class="attendance-check">

          <input
            type="checkbox"
            class="attendance-student-checkbox"
            data-student-id="${student.id}"
          >

        </label>


        <div class="attendance-student-name">
          ${escapeAttendanceText(
            student.student_name
          )}
        </div>


        <div class="attendance-student-class">
          ${escapeAttendanceText(
            student.class
          )}
        </div>


        <div class="attendance-student-reg">
          ${escapeAttendanceText(
            student.reg_no
          )}
        </div>

      `;


      const checkbox =
        row.querySelector(
          ".attendance-student-checkbox"
        );


      checkbox.addEventListener(
        "change",
        function () {

          handleAttendanceStudentSelection(
            student,
            this.checked
          );

        }
      );


      results.appendChild(row);

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
    !window.attendanceSelectedStudents
  ) {

    window.attendanceSelectedStudents = [];

  }


  const selected =
    window.attendanceSelectedStudents;


  const existingIndex =
    selected.findIndex(
      function (item) {

        return String(item.id) ===
          String(student.id);

      }
    );


  if (checked) {

    if (existingIndex === -1) {

      selected.push(student);

    }

  } else {

    if (existingIndex !== -1) {

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
   ESCAPE TEXT
========================================================= */

function escapeAttendanceText(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
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
   ATTENDANCE STUDENT DATA
========================================================= */

window.attendanceStudents = [];


/* =========================================================
   LOAD ALL STUDENTS
========================================================= */

async function loadAttendanceStudents() {

  try {

    const { data, error } = await supabaseClient
      .from("students")
      .select(`
        id,
        school_code,
        department,
        student_name,
        class,
        reg_no
      `)
      .order("student_name", {
        ascending: true
      });


    if (error) {

      console.error(
        "Attendance student loading error:",
        error
      );

      return;

    }


    window.attendanceStudents =
      data || [];


    populateAttendanceFilters();

  } catch (error) {

    console.error(
      "Attendance student loading failed:",
      error
    );

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


  if (!departmentFilter || !classFilter) {
    return;
  }


  const departments =
    [
      ...new Set(
        window.attendanceStudents
          .map(student => student.department)
          .filter(Boolean)
      )
    ]
    .sort();


  const classes =
    [
      ...new Set(
        window.attendanceStudents
          .map(student => student.class)
          .filter(Boolean)
      )
    ]
    .sort();


  departmentFilter.innerHTML =
    `<option value="ALL">
      ALL Departments
    </option>`;


  departments.forEach(department => {

    const option =
      document.createElement("option");

    option.value =
      department;

    option.textContent =
      department;

    departmentFilter.appendChild(
      option
    );

  });


  classFilter.innerHTML =
    `<option value="ALL">
      ALL Classes
    </option>`;


  classes.forEach(className => {

    const option =
      document.createElement("option");

    option.value =
      className;

    option.textContent =
      className;

    classFilter.appendChild(
      option
    );

  });

}


/* =========================================================
   SEARCH ATTENDANCE STUDENTS
========================================================= */

function searchAttendanceStudents(
  searchValue = ""
) {

  const results =
    document.getElementById(
      "attendanceResults"
    );


  if (!results) return;


  const search =
    searchValue
      .trim()
      .toLowerCase();


  const department =
    document.getElementById(
      "attendanceDepartmentFilter"
    )?.value || "ALL";


  const className =
    document.getElementById(
      "attendanceClassFilter"
    )?.value || "ALL";


  let filtered =
    window.attendanceStudents || [];


  /* DEPARTMENT FILTER */

  if (department !== "ALL") {

    filtered =
      filtered.filter(
        student =>
          student.department === department
      );

  }


  /* CLASS FILTER */

  if (className !== "ALL") {

    filtered =
      filtered.filter(
        student =>
          student.class === className
      );

  }


  /* SEARCH */

  if (search) {

    filtered =
      filtered.filter(student => {

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

      });

  }


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


  if (!students.length) {

    results.innerHTML = `
      <div class="attendance-no-results">
        No students found.
      </div>
    `;

    return;

  }


  results.innerHTML =
    students.map(student => `

      <label class="attendance-student-row">

        <input
          type="checkbox"
          class="attendance-student-checkbox"
          value="${student.id}"
          data-student-id="${student.id}"
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

    `).join("");

}


/* =========================================================
   ATTENDANCE HTML ESCAPE
========================================================= */

function escapeAttendanceHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
/* =========================================================
   MARK ATTENDANCE
   ONE ENGINE FOR MORNING + AFTERNOON
========================================================= */

async function markSelectedAttendance() {

  const session =
    window.currentAttendanceSession;

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


  /* GET SELECTED STUDENTS */

  const checkboxes =
    document.querySelectorAll(
      ".attendance-student-checkbox:checked"
    );


  if (!checkboxes.length) {

    showAttendanceMessage(
      "Please select at least one student.",
      "error"
    );

    return;
  }


  const selectedIds =
    [...checkboxes].map(
      checkbox =>
        Number(checkbox.dataset.studentId)
    );


  /* FIND SELECTED STUDENTS */

  const selectedStudents =
    (window.attendanceStudents || [])
      .filter(student =>
        selectedIds.includes(
          Number(student.id)
        )
      );


  if (!selectedStudents.length) {

    showAttendanceMessage(
      "No valid students selected.",
      "error"
    );

    return;
  }


  /* CURRENT DATE + TIME */

  const now =
    new Date();


  const attendanceDate =
    `${now.getFullYear()}-${
      String(now.getMonth() + 1).padStart(2, "0")
    }-${
      String(now.getDate()).padStart(2, "0")
    }`;


  let markedCount = 0;
  let alreadyMarkedCount = 0;
  let failedCount = 0;


  /* DISABLE BUTTON WHILE PROCESSING */

  const markButton =
    document.getElementById(
      "attendanceMarkBtn"
    );


  if (markButton) {

    markButton.disabled = true;

    markButton.textContent =
      "Marking...";

  }


  try {

    for (const student of selectedStudents) {

      try {

        const schoolCode =
          student.school_code;


        /* -----------------------------------------
           CHECK TODAY'S ATTENDANCE RECORD
        ----------------------------------------- */

        const { data: existingRecord, error: selectError } =
          await supabase
            .from("student_attendance")
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


        if (selectError) {

          console.error(
            "Attendance lookup error:",
            selectError
          );

          failedCount++;

          continue;
        }


        /* -----------------------------------------
           DETERMINE WHETHER ALREADY MARKED
        ----------------------------------------- */

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


        /* -----------------------------------------
           UPDATE EXISTING DAY
        ----------------------------------------- */

        if (existingRecord) {

          const updateData =
            session === "morning"
              ? {
                  morning_present: true,
                  morning_marked_at: now.toISOString(),
                  updated_at: now.toISOString()
                }
              : {
                  afternoon_present: true,
                  afternoon_marked_at: now.toISOString(),
                  updated_at: now.toISOString()
                };


          const { error: updateError } =
            await supabase
              .from("student_attendance")
              .update(updateData)
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


        /* -----------------------------------------
           CREATE NEW DAY RECORD
        ----------------------------------------- */

        const insertData = {

          school_code:
            schoolCode,

          student_id:
            student.id,

          reg_no:
            student.reg_no || null,

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


        const { error: insertError } =
          await supabase
            .from("student_attendance")
            .insert(insertData);


        if (insertError) {

          console.error(
            "Attendance insert error:",
            insertError
          );


          /*
             UNIQUE CONSTRAINT PROTECTION

             If another request already marked
             this student for today, don't count
             it as a successful mark.
          */

          if (
            insertError.code === "23505"
          ) {

            alreadyMarkedCount++;

          } else {

            failedCount++;

          }

          continue;
        }


        markedCount++;

      } catch (studentError) {

        console.error(
          "Student attendance error:",
          studentError
        );

        failedCount++;

      }

    }


    /* -----------------------------------------
       RESULT MESSAGE
    ----------------------------------------- */

    let message = "";


    if (markedCount === 1) {

      message =
        "1 student has been marked.";

    } else if (markedCount > 1) {

      message =
        `${markedCount} students have been marked.`;

    }


    if (alreadyMarkedCount > 0) {

      if (message) {
        message += " ";
      }

      message +=
        `${alreadyMarkedCount} already marked and skipped.`;
    }


    if (failedCount > 0) {

      if (message) {
        message += " ";
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


    /* REFRESH RESULTS */

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

      markButton.disabled = false;

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
    document.createElement("div");


  messageBox.id =
    "attendanceMessage";


  messageBox.className =
    `attendance-message ${type}`;


  messageBox.textContent =
    message;


  document.body.appendChild(
    messageBox
  );


  setTimeout(() => {

    messageBox.remove();

  }, 4000);

}

