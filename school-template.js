// ======================================
// PAYMENT HISTORY PAGINATION
// ======================================
let communicationStudents = [];
let selectedCommunicationStudent = null;
let paymentHistoryMasterData = [];
let communicationRefresh = null;
let paymentHistoryData = [];
let adminConversationRefresh = null;

let paymentHistoryCurrentPage = 1;

const paymentHistoryRowsPerPage = 12;

let paymentHistoryFilter = "all";

let outstandingFeesData = [];

let outstandingFeesMasterData = [];

let outstandingCurrentPage = 1;

const outstandingRowsPerPage = 12;
let currentPreviousOutstandingPage = 1;
// ========================================
// PREVIOUS TERM PAGINATION
// ========================================

let previousOutstandingCurrentPage = 1;

const previousOutstandingRowsPerPage = 12;

let previousOutstandingMasterData = [];

let previousOutstandingData = [];

console.log("SCHOOL TEMPLATE JS LOADED");

let currentDepartment = "";
let currentSchoolCode = "";

// ==========================
// SUPABASE INIT
// ==========================
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
// GET SCHOOL CODE
// ==========================

let schoolCode = sessionStorage.getItem("school_code");

console.log("SESSION STORAGE VALUE:", schoolCode);

// ==========================
// HARD SESSION GUARD
// ==========================
if (!schoolCode) {
  window.location.replace("index.html");
  throw new Error("No school session");
}

console.log("SCHOOL CODE LOADED:", schoolCode);

// ==========================
// HISTORY LOCK (BACK/FORWARD CONTROL)
// ==========================

history.pushState(null, null, window.location.href);

window.addEventListener("popstate", function () {
  sessionStorage.removeItem("school_code");
  sessionStorage.clear();
window.location.replace("index.html");
});


// ==========================
// GLOBAL STATE
// ==========================
let currentSubjects = [];
let optionalSelectedStudent = null;
let communicationDates = {};
let commCalendarDate = new Date();

let selectedCommunicationDate = null;
let optionalStudentsCache = [];
// ======================================
// OPTIONAL PAYMENTS PAGINATION
// ======================================

let optionalPaymentsCurrentPage = 1;

const optionalPaymentsRowsPerPage = 12;
// ======================================
// OPTIONAL PAYMENTS
// ======================================

let optionalPaymentsMasterData = [];

let optionalPaymentsData = [];
// ==========================
// LOAD SCHOOL INFO
// ==========================
async function loadSchoolInfo() {

  const { data, error } =
    await supabaseClient
      .from("schools")
      .select("*")
      .eq("school_code", schoolCode)
      .single();
  
  console.log("SCHOOL RECORD:", data);
  
  if (error || !data) {
    console.error(error);
    alert("School not found");
    return;
  }
  
  currentDepartment = data.department;
  currentSchoolCode = data.school_code;


  document.getElementById("schoolName").textContent = data.School_name;
  document.title =
  data.School_name;

  const schoolLogo = document.getElementById("schoolLogo");
  if (schoolLogo && data.logo_url) schoolLogo.src = data.logo_url;

  const emailEl = document.getElementById("schoolEmail");
if (emailEl && data.contact_email)
  emailEl.innerHTML =
    "<strong>E-mail:</strong> " + data.contact_email;

const phoneEl = document.getElementById("schoolPhone");
if (phoneEl && data.phone)
  phoneEl.innerHTML =
    "<strong>Phone:</strong> " + data.phone;

  if (data.primary_color)
    document.documentElement.style.setProperty("--primary-color", data.primary_color);

  if (data.secondary_color)
    document.documentElement.style.setProperty("--secondary-color", data.secondary_color);
}

// ==========================
// LOAD SUBJECTS
// ==========================
async function loadSubjects(department, isAdmin = false) {

  console.log(
  "Loading subjects for department:",
  department,
  "| Admin:",
  isAdmin,
  "| School:",
  schoolCode
);

  const datalist = document.getElementById("subjectsList");

  if (!datalist) {
    console.error("subjectsList not found in DOM");
    return;
  }

  // HARD RESET (VERY IMPORTANT)
  datalist.innerHTML = "";
  currentSubjects = [];

 let query = supabaseClient
  .from("subjects")
  .select("*")
  .eq("school_code", schoolCode);

// 🔥 APPLY DEPARTMENT FILTER FOR TEACHERS ONLY
if (!isAdmin && department) {
  query = query.eq("department", department);
}

const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  console.log("SUPABASE RETURN:", data);

  if (!data || data.length === 0) {
    console.warn("NO SUBJECTS FOUND FOR:", schoolCode);
    return;
  }

  currentSubjects = data;

  currentSubjects.forEach(sub => {
    const option = document.createElement("option");
    option.value = sub.subject;
    datalist.appendChild(option);
  });
}
// ==========================
// ACCESS SUBJECT (FIXED)
// ==========================
document
  .getElementById("subjectForm")
  .addEventListener("submit", (e) => {

    e.preventDefault();

    const cadre = document.getElementById("cadre").value;
    const department = document.getElementById("department").value;
    const subject = document.getElementById("subject").value;
    const password = document.getElementById("subjectPassword").value;



console.log("CADRE:", cadre);
console.log("SUBJECT:", subject);
console.log("PASSWORD:", password);
console.log("CURRENT SUBJECTS:", currentSubjects);
console.log("TOTAL SUBJECTS:", currentSubjects.length);
  
  
  const match =
  currentSubjects.find(s => {

   if (
      cadre === "Admin"
    ) {

      const found =
        s.subject === subject &&
        s.admin_password === password;

      console.log(
        "Checking:",
        s.subject,
        s.admin_password,
        found
      );

      return found;

    }

    return (

      s.subject === subject &&

      s.subject_password === password &&

      s.department === department &&

      s.cadre === cadre

    );

  });

    if (!match) {
      alert("Invalid subject login");
      return;
    }

    window.open(match.sheet_url, "_blank");
  });

// ==========================
// CHANGE PASSWORD (FIXED POSITION)
// ==========================
document
  .getElementById("changePasswordForm")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const subject =
      document.getElementById("changeSubject").value;

    const adminPassword =
      document.getElementById("adminPassword").value;

    const newPassword =
      document.getElementById("newSubjectPassword").value;

    const match =
      currentSubjects.find(s =>
        s.subject === subject &&
        s.admin_password === adminPassword
      );

    if (!match) {
      alert("Invalid admin password");
      return;
    }

    const { error } =
      await supabaseClient
        .from("subjects")
        .update({
          subject_password: newPassword
        })
        .eq("id", match.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully");
    loadSubjects(
  departmentSelect.value,
  cadreSelect.value === "Admin"
);
  });

// ==========================
// MODALS
// ==========================
function openChangePasswordModal() {
  document.getElementById("passwordModal").style.display = "block";
}

function closeChangePasswordModal() {
  document.getElementById("passwordModal").style.display = "none";
}

function togglePassword() {
  const input = document.getElementById("subjectPassword");
  input.type = input.type === "password" ? "text" : "password";
}

function toggleChangePassword() {
  const input = document.getElementById("newSubjectPassword");
  input.type = input.type === "password" ? "text" : "password";
}

// ==========================
// INIT
// ==========================
loadSchoolInfo();
loadSubjects();
loadSchoolAnnouncement();

// ==========================
// CADRE / DEPARTMENT LOGIC
// ==========================
const cadreSelect = document.getElementById("cadre");
const departmentSelect = document.getElementById("department");
const subjectInput = document.getElementById("subject");

cadreSelect.addEventListener("change", () => {

  const isAdmin = cadreSelect.value === "Admin";

  departmentSelect.disabled = isAdmin;

  subjectInput.value = "";
  document.getElementById("subjectsList").innerHTML = "";

  if (isAdmin) {
    departmentSelect.value = "";
    loadSubjects(null, true);
  }

});

departmentSelect.addEventListener("change", () => {

  console.log(
    "Department selected:",
    departmentSelect.value
  );

  if (cadreSelect.value !== "Admin") {

    subjectInput.value = "";

    loadSubjects(
      departmentSelect.value,
      false
    );

  }

});

function toggleAdminPortalPassword() {

  const input =
    document.getElementById(
      "adminPortalPassword"
    );

  input.type =
    input.type === "password"
      ? "text"
      : "password";

}

const adminDashboardHTML = `
  <h2>School Administration</h2>

  <div class="admin-nav">

    <button
      class="admin-tab"
      onclick="showDrive()"
    >
      📁 School Drive
    </button>

    <button
      class="admin-tab"
      onclick="showMasterSheet()"
    >
      📊 Master Sheets
    </button>

  <button
  class="admin-tab"
  onclick="showStudentsFees()"
>
  👨‍🎓 Students & Fees
</button>

<!-- =====================================================
     NEW — ADVERTS
===================================================== -->

<!-- =====================================================
     ADVERTS DROPDOWN
===================================================== -->

<div class="admin-dropdown">

    <button
        class="admin-tab-btn"
        type="button"
        onclick="toggleAdvertsMenu()"
    >
        📢 Adverts
    </button>


    <div
        id="advertsDropdown"
        style="
            display:none;
            position:absolute;
            margin-top:5px;
            width:210px;
            z-index:1000;
        "
    >

        <!-- Advertisements -->

        <button
            type="button"
            class="admin-btn payment-item"
            onclick="
                toggleAdvertsMenu();
                showAdverts();
            "
        >
            📢 Manage Advertisements
        </button>


        <!-- Announcement -->

        <button
            type="button"
            class="admin-btn payment-item"
            onclick="
                toggleAdvertsMenu();
                showAnnouncementEditor();
            "
        >
            📣 Announcement
       	   </button>
		
	        <!-- School Calendar -->

        <button
            type="button"
            class="admin-btn payment-item"
            onclick="
                toggleAdvertsMenu();
                showSchoolCalendar();
            "
        >
            📅 School Calendar
        </button>

    </div>

</div>


<!-- =====================================================
     NEW — COMMUNICATION BOOK
===================================================== -->

<button
  class="admin-tab"
  onclick="openCommunicationBook()"
>
  📖 Communication Book
</button>

<div class="admin-dropdown">

<button class="admin-tab-btn" 
onclick="togglePaymentsMenu()">
  Payments
</button>

  
  <div
  id="paymentsDropdown"
  style="
    display:none;
    position:absolute;
    margin-top:5px;
    width:180px;
    z-index:1000;
  "
>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
loadTermFees();
"
  >
    Set Term Fees
  </button>

<button
  class="admin-btn payment-item"
  onclick="
togglePaymentsMenu();
showOptionalPaymentsSetup();
"
>
  Set Optional Payments
</button>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
loadAllPayments();
"
  >
    All Payments
  </button>

<button
  class="admin-btn payment-item"
  onclick="
togglePaymentsMenu();
showAllOptionalPayments();
"
>
  All Optional Payments
</button>

  <button
    class="admin-btn payment-item"
   onclick="
togglePaymentsMenu();
loadPaymentHistory();
"
  >
    Payment History
  </button>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
loadOutstandingPayments();
"
  >
    Current Term Outstanding Fees
  </button>
  
  <button
  class="admin-btn payment-item"
  onclick="
    document.getElementById('paymentsDropdown').style.display='none';
	
    showPreviousOutstandingFees();
  "
>
  Previous Term Outstanding Fees
</button>

  <button
    class="admin-btn payment-item"
    onclick="
togglePaymentsMenu();
clearCurrentTermPayments();
"
  >
    Clear Payments
  </button>
  
  <button
  class="admin-btn payment-item restore-btn"
  onclick="
togglePaymentsMenu();
restoreLastRollover();
"
>
  Restore Last Cleared Payments
</button>

</div>
</div>
    <button
      class="admin-tab"
      onclick="adminLogout()"
    >
      🚪 Logout
    </button>

  </div>

  <div
    id="adminContent"
    class="admin-content"
  >

    <h3>
      Welcome
    </h3>

    <p>
      Welcome to the School Administration Portal.
    </p>

    <p>
      Select an option from the menu above.
    </p>

  </div>
`;

const communicationBookHTML = `

<div class="communication-layout">

<!-- =====================================================
     LEFT SIDEBAR — FILTERS + CALENDAR
====================================================== -->

<aside class="communication-sidebar">

    <h3 class="communication-sidebar-title">
        Filters
    </h3>


    <!-- Department -->

    <div class="communication-filter">

        <label for="commDepartment">
            Department
        </label>

        <select id="commDepartment">

            <option value="">
                Select Department
            </option>

        </select>

    </div>


    <!-- Class -->

    <div class="communication-filter">

        <label for="commClass">
            Class
        </label>

        <select id="commClass">

            <option value="">
                Select Class
            </option>

        </select>

    </div>


    <!-- Sort -->

    <div class="communication-filter">

        <label for="commSort">
            Sort
        </label>

        <select id="commSort">

            <option value="newest">
                Newest
            </option>

            <option value="oldest">
                Oldest
            </option>

        </select>

    </div>


    <!-- Calendar -->

    <div class="communication-calendar-section">

        <label>
            Date
        </label>

        <div id="adminCalendar">

            <!-- Calendar generated by JavaScript -->

        </div>

    </div>

</aside>


<!-- =====================================================
     RIGHT SIDE — STUDENT MESSAGE TAGS
====================================================== -->

<main class="communication-main">

    <div class="communication-main-header">

        <h2>
            Communication Book
        </h2>

        <p id="communicationSelectedDate">
            Select a department, class and date.
        </p>

    </div>


    <!-- Student message tags -->

	<div class="admin-message-search">

    <input
        type="text"
        id="adminStudentSearch"
        placeholder="🔍 Search student..."
        autocomplete="off"
    >

	</div>
    <div
        id="adminMessageTags"
        class="admin-message-tags"
    >

        <div class="communication-empty-state">

            <div class="empty-icon">
                📖
            </div>

            <h3>
                No messages selected
            </h3>

            <p>
                Select a department, class and date
                to view messages.
            </p>

        </div>

    </div>

</main>


</div>

<!-- =========================================================
     ADMIN CONVERSATION POPUP MODAL
========================================================= -->

<div
    id="adminConversationModal"
    class="admin-conversation-modal"
    style="display:none;"
>

<div class="admin-conversation-overlay"></div>


<div class="admin-conversation-dialog">


    <!-- Modal Header -->

    <div class="admin-conversation-header">

        <div>

            <h2 id="adminConversationStudentName">
                Student Conversation
            </h2>

            <p id="adminConversationStudentInfo">
            </p>

        </div>


        <button
            type="button"
            id="closeAdminConversation"
            class="admin-conversation-close"
        >
            &times;
        </button>

    </div>


    <!-- Conversation -->

    <div
        id="conversationMessages"
        class="conversation-messages"
    >

        <div class="communication-empty-state">

            Select a student message.

        </div>

    </div>


    <!-- Admin Reply -->

    <div class="admin-reply-area">

        <textarea
            id="adminReplyMessage"
            rows="3"
            placeholder="Type your reply here..."
        ></textarea>


        <button
            type="button"
            id="sendAdminReply"
            class="admin-send-reply-btn"
        >
            Send Reply
        </button>

    </div>

</div>

</div>

`;



document
  .getElementById("openAdminPortal")
  .addEventListener(
    "click",
    async function () {

      const password =
        document.getElementById(
          "adminPortalPassword"
        ).value.trim();

      if (!password) {

        alert(
          "Please enter Admin Password."
        );

        return;

      }

      const {
        data,
        error
      } =
        await supabaseClient
          .from("subjects")
          .select(
            "admin_password"
          )
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

      const valid =
        data.some(
          row =>
            row.admin_password === password
        );

      if (!valid) {

        alert(
          "Invalid Admin Password"
        );

        return;

      }

      const teacherCard =
document.getElementById(
"teacherCard"
);

const adminCard =
document.getElementById(
"adminCard"
);

teacherCard.classList.add(
"hide-teacher"
);

adminCard.classList.add(
"expand-admin"
);

setTimeout(()=>{

adminCard.innerHTML =
adminDashboardHTML;

},450);

    }
  );

function openTeacherCommunicationBook(){

    document.getElementById(
        "teacherCommunicationModal"
    ).style.display="flex";

}

async function sendAdminReply() {

    // -----------------------------------------
    // Make sure a student conversation is open
    // -----------------------------------------

    if (!selectedCommunicationStudent) {

        alert("Please select a student conversation.");

        return;

    }

    const replyBox =
        document.getElementById(
            "adminReplyMessage"
        );

    if (!replyBox) {

        console.error(
            "adminReplyMessage textarea not found."
        );

        return;

    }

    const message =
        replyBox.value.trim();

    if (!message) {

        alert("Please type a reply.");

        replyBox.focus();

        return;

    }

    const student =
        selectedCommunicationStudent;

    // -----------------------------------------
    // Disable button while sending
    // -----------------------------------------

    const sendButton =
        document.getElementById(
            "sendAdminReply"
        );

    if (sendButton) {

        sendButton.disabled = true;

        sendButton.textContent =
            "Sending...";

    }

    // -----------------------------------------
    // Insert admin reply
    // -----------------------------------------

    const {
        error
    } = await supabaseClient

        .from("school_communication_book")

        .insert([{

            school_code:
                schoolCode,

            department:
                student.department,

            class:
                student.class,

            student_id:
                student.id,

            reg_no:
                student.reg_no,

            student_name:
                student.student_name ||
                student.name ||
                student.full_name ||
                "Unknown Student",

            sender_type:
                "Admin",

            sender_name:
                "Admin",

            message:
                message,

            is_read:
                false

        }]);

    // -----------------------------------------
    // Handle error
    // -----------------------------------------

    if (error) {

        console.error(
            "Error sending admin reply:",
            error
        );

        alert(
            "Unable to send reply: " +
            error.message
        );

        if (sendButton) {

            sendButton.disabled = false;

            sendButton.textContent =
                "Send Reply";

        }

        return;

    }

    // -----------------------------------------
    // Clear reply box
    // -----------------------------------------

    replyBox.value = "";

    // -----------------------------------------
    // Reload conversation
    // -----------------------------------------

    await loadAdminConversationMessages(
        student
    );

    // -----------------------------------------
    // Refresh message tags
    // -----------------------------------------

    await loadAdminMessageTags();

    // -----------------------------------------
    // Restore button
    // -----------------------------------------

    if (sendButton) {

        sendButton.disabled = false;

        sendButton.textContent =
            "Send Reply";

    }

}

function closeTeacherCommunicationBook(){

    clearInterval(
        communicationRefresh
    );

    document.getElementById(
        "teacherCommunicationModal"
    ).style.display="none";

}


async function openCommunicationBook(){

    // ==========================================
    // LOAD COMMUNICATION BOOK UI
    // ==========================================

    document.getElementById("adminContent").innerHTML =
        communicationBookHTML;


    // ==========================================
    // LOAD DEPARTMENTS
    // ==========================================

    await loadCommunicationDepartments();


    // ==========================================
    // LOAD CALENDAR DATA
    // ==========================================

    await loadCommunicationCalendarData();

    renderAdminCalendar();


    // ==========================================
    // FILTER ELEMENTS
    // ==========================================

    const departmentSelect =
        document.getElementById("commDepartment");

    const classSelect =
        document.getElementById("commClass");

    const sortSelect =
        document.getElementById("commSort");

    const searchInput =
        document.getElementById("adminStudentSearch");


    // ==========================================
    // CLASS CHANGE
    // ==========================================

    if (classSelect) {

        classSelect.addEventListener(
            "change",
            function(){

                // Clear old student tags

                const tagsContainer =
                    document.getElementById(
                        "adminMessageTags"
                    );

                if (tagsContainer) {

                    tagsContainer.innerHTML = `

                        <div class="communication-empty-state">

                            <div class="empty-icon">
                                📅
                            </div>

                            <h3>
                                Select a date
                            </h3>

                            <p>
                                Select a date from the calendar
                                to view messages for this class.
                            </p>

                        </div>

                    `;

                }

                // Load messages if a date
                // has already been selected

                if (
                    window.adminSelectedCommunicationDate
                ) {

                    loadAdminMessageTags();

                }

            }
        );

    }


    // ==========================================
    // SORT CHANGE
    // ==========================================

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            function(){

                if (
                    window.adminSelectedCommunicationDate
                ) {

                    loadAdminMessageTags();

                }

            }
        );

    }


    // ==========================================
    // STUDENT SEARCH
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function(){

                const search =
                    this.value
                        .trim()
                        .toLowerCase();


                const tags =
                    document.querySelectorAll(
                        ".admin-message-tag"
                    );


                tags.forEach(tag => {

                    const nameElement =
                        tag.querySelector(
                            ".admin-message-tag-name"
                        );

                    const name =
                        nameElement
                            ? nameElement.textContent
                                .trim()
                                .toLowerCase()
                            : "";


                    tag.style.display =
                        name.includes(search)
                            ? ""
                            : "none";

                });

            }
        );

    }


    // ==========================================
    // CLOSE CONVERSATION MODAL
    // ==========================================

    const closeButton =
        document.getElementById(
            "closeAdminConversation"
        );


    if (closeButton) {

        closeButton.onclick =
            closeAdminConversation;

    }

    // ==========================================
    // SEND ADMIN REPLY
    // ==========================================

    const sendReplyButton =
        document.getElementById(
            "sendAdminReply"
        );

    if (sendReplyButton) {

        sendReplyButton.onclick =
            sendAdminReply;

    }
	
}

async function loadAdminMessageTags() {


const tagsContainer =
    document.getElementById("adminMessageTags");

const departmentSelect =
    document.getElementById("commDepartment");

const classSelect =
    document.getElementById("commClass");

if (
    !tagsContainer ||
    !departmentSelect ||
    !classSelect
) {
    return;
}


const department =
    departmentSelect.value;

const selectedClass =
    classSelect.value;

const selectedDate =
    window.adminSelectedCommunicationDate;

const sortSelect =
    document.getElementById("commSort");

const sort =
    sortSelect?.value || "newest";


// =====================================================
// STUDENT SEARCH
// =====================================================

const searchInput =
    document.getElementById("commStudentSearch");

const searchTerm =
    searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


// =====================================================
// VALIDATE FILTERS
// =====================================================

if (
    !department ||
    !selectedClass ||
    !selectedDate
) {

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                📖
            </div>

            <h3>
                No messages selected
            </h3>

            <p>
                Select a department, class and date
                to view messages.
            </p>

        </div>

    `;

    return;
}


// =====================================================
// LOADING STATE
// =====================================================

tagsContainer.innerHTML = `

    <div class="communication-empty-state">

        <div class="empty-icon">
            ⏳
        </div>

        <p>
            Loading messages...
        </p>

    </div>

`;


// =====================================================
// GET STUDENTS FOR DEPARTMENT + CLASS
// =====================================================

const {
    data: students,
    error: studentsError
} = await supabaseClient

    .from("students")

    .select("*")

    .eq("school_code", schoolCode)

    .eq("department", department)

    .eq("class", selectedClass);


if (studentsError) {

    console.error(
        "Error loading communication students:",
        studentsError
    );

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to load students
            </h3>

            <p>
                Please try again.
            </p>

        </div>

    `;

    return;
}


if (
    !students ||
    students.length === 0
) {

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                👨‍🎓
            </div>

            <h3>
                No students found
            </h3>

            <p>
                No students were found in
                ${selectedClass}.
            </p>

        </div>

    `;

    return;
}


// =====================================================
// STUDENT SEARCH FILTER
// =====================================================

let filteredStudents =
    students.filter(student => {

        if (!searchTerm) {
            return true;
        }

        const name =
            student.full_name ||
            student.student_name ||
            student.name ||
            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
            "";

        return name
            .toLowerCase()
            .includes(searchTerm);

    });


// =====================================================
// STUDENT IDs
// =====================================================

const studentIds =
    filteredStudents.map(
        student => student.id
    );


if (studentIds.length === 0) {

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                🔍
            </div>

            <h3>
                Student not found
            </h3>

            <p>
                No student in this class matches
                your search.
            </p>

        </div>

    `;

    return;
}


// =====================================================
// DATE RANGE
// =====================================================

const startOfDay =
    `${selectedDate}T00:00:00`;

const endOfDay =
    `${selectedDate}T23:59:59.999`;


// =====================================================
// LOAD ONLY MESSAGES BELONGING TO THE
// SELECTED CLASS + SELECTED DATE
// =====================================================

const {
    data: messages,
    error: messagesError
} = await supabaseClient

    .from("school_communication_book")

    .select("*")

    .eq("school_code", schoolCode)

    .in(
        "student_id",
        studentIds
    )

    .gte(
        "created_at",
        startOfDay
    )

    .lte(
        "created_at",
        endOfDay
    );


if (messagesError) {

    console.error(
        "Error loading communication messages:",
        messagesError
    );

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to load messages
            </h3>

            <p>
                Please try again.
            </p>

        </div>

    `;

    return;
}


// =====================================================
// NO MESSAGES
// =====================================================

if (
    !messages ||
    messages.length === 0
) {

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                📭
            </div>

            <h3>
                No messages
            </h3>

            <p>
                There are no messages for
                ${selectedClass} on this date.
            </p>

        </div>

    `;

    return;
}


// =====================================================
// GROUP MESSAGES BY STUDENT
// =====================================================

const messageMap = {};


messages.forEach(msg => {

    if (!messageMap[msg.student_id]) {

        messageMap[msg.student_id] = [];

    }

    messageMap[msg.student_id].push(msg);

});


// =====================================================
// BUILD STUDENT TAG DATA
// =====================================================

const studentTags =
    filteredStudents

        .filter(student =>
            messageMap[student.id]
        )

        .map(student => {

            const studentMessages =
                messageMap[student.id];


            studentMessages.sort(
                (a, b) =>
                    new Date(a.created_at) -
                    new Date(b.created_at)
            );


            const latestMessage =
                studentMessages[
                    studentMessages.length - 1
                ];


            const unreadCount =
                studentMessages.filter(
                    msg =>
                        msg.sender_type === "Parent" &&
                        msg.is_read === false
                ).length;


            const studentName =
                student.full_name ||
                student.student_name ||
                student.name ||
                `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                "Unknown Student";


            return {

                student,

                studentName,

                messages:
                    studentMessages,

                latestMessage,

                unreadCount,

                totalCount:
                    studentMessages.length

            };

        });


// =====================================================
// SORT STUDENT TAGS
// =====================================================

studentTags.sort(
    (a, b) => {

        const timeA =
            new Date(
                a.latestMessage.created_at
            );

        const timeB =
            new Date(
                b.latestMessage.created_at
            );


        return sort === "oldest"

            ? timeA - timeB

            : timeB - timeA;

    }
);


// =====================================================
// NO STUDENTS WITH MESSAGES
// =====================================================

if (
    studentTags.length === 0
) {

    tagsContainer.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                📭
            </div>

            <h3>
                No messages
            </h3>

            <p>
                There are no messages for
                ${selectedClass} on this date.
            </p>

        </div>

    `;

    return;
}


// =====================================================
// RENDER STUDENT TAGS
// ONLY NAME + COUNT
// =====================================================

tagsContainer.innerHTML = "";


studentTags.forEach(item => {

    const tag =
        document.createElement("button");


    tag.type =
        "button";


    tag.className =
        item.unreadCount > 0
            ? "admin-message-tag unread"
            : "admin-message-tag";


    // -------------------------------------------------
    // STUDENT NAME
    // -------------------------------------------------

    const nameElement =
        document.createElement("span");


    nameElement.className =
        "admin-message-tag-name";


    nameElement.textContent =
        item.studentName;


    // -------------------------------------------------
    // MESSAGE COUNT
    // -------------------------------------------------

    const countElement =
        document.createElement("span");


    countElement.className =
        "admin-message-count";


    countElement.textContent =
        item.totalCount;


    // -------------------------------------------------
    // BUILD TAG
    // -------------------------------------------------

    tag.appendChild(
        nameElement
    );

    tag.appendChild(
        countElement
    );


    // =================================================
    // CLICK → OPEN CONVERSATION MODAL
    // =================================================

    tag.addEventListener(
        "click",
        async function() {

            await openAdminConversation(
                item.student
            );

        }
    );


    tagsContainer.appendChild(
        tag
    );

});


}


document.addEventListener("change",function(e){

    if(e.target.id==="commDepartment"){

        loadCommunicationClasses();

    }

});

function renderAdminCalendar(){

    const calendar =
        document.getElementById("adminCalendar");

    if(!calendar) return;

    const year =
        commCalendarDate.getFullYear();

    const month =
        commCalendarDate.getMonth();

    const monthNames = [

        "January","February","March","April",

        "May","June","July","August",

        "September","October","November","December"

    ];

    const days = [

        "Sun","Mon","Tue","Wed","Thu","Fri","Sat"

    ];

    const firstDay =
        new Date(year,month,1).getDay();

    const totalDays =
        new Date(year,month+1,0).getDate();

    const today =
        new Date();

    let html = `

    <div class="calendar-nav">

        <button onclick="previousCommMonth()">
            ◀
        </button>

        <span>

            ${monthNames[month]}

            ${year}

        </span>

        <button onclick="nextCommMonth()">
            ▶
        </button>

    </div>

    <div class="calendar-grid">

    `;

    days.forEach(day=>{

        html +=
        `<div class="calendar-head">${day}</div>`;

    });

    for(let i=0;i<firstDay;i++){

        html += "<div></div>";

    }

    for(let d=1; d<=totalDays; d++){

        let cls = "calendar-day";

        if(

            d===today.getDate()

            &&

            month===today.getMonth()

            &&

            year===today.getFullYear()

        ){

            cls += " today";

        }

        const key =
`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

        const info =
communicationDates[key];

        let badge = "";

        if(info){

            badge = info.unread

                ? `<span class="calendar-dot unread"></span>`

                : `<span class="calendar-dot"></span>`;

        }

        html += `

        <div

            class="${cls}"

            onclick="selectCommunicationDate(${d})"

        >

            ${d}

            ${badge}

        </div>

        `;

    }

    html += "</div>";

    calendar.innerHTML = html;

}





function previousCommMonth(){

    commCalendarDate.setMonth(

        commCalendarDate.getMonth()-1

    );

    renderAdminCalendar();

}

function nextCommMonth(){

    commCalendarDate.setMonth(

        commCalendarDate.getMonth()+1

    );

    renderAdminCalendar();

}


function selectCommunicationDate(day){


selectedCommunicationDate =
    new Date(
        commCalendarDate.getFullYear(),
        commCalendarDate.getMonth(),
        day
    );

// Store the selected date in YYYY-MM-DD format
const year =
    selectedCommunicationDate.getFullYear();

const month =
    String(
        selectedCommunicationDate.getMonth() + 1
    ).padStart(2, "0");

const date =
    String(
        selectedCommunicationDate.getDate()
    ).padStart(2, "0");

window.adminSelectedCommunicationDate =
    `${year}-${month}-${date}`;

// Highlight selected calendar date
renderAdminCalendar();

// Update the date shown above the message tags
const dateDisplay =
    document.getElementById(
        "communicationSelectedDate"
    );

if (dateDisplay) {

    dateDisplay.textContent =
        selectedCommunicationDate.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}

// Load students who have messages
// for this exact department + class + date
loadAdminMessageTags();


}



async function openAdminConversation(student) {

    if (!student) return;

    const modal =
        document.getElementById("adminConversationModal");

    const studentName =
        document.getElementById(
            "adminConversationStudentName"
        );

    const studentInfo =
        document.getElementById(
            "adminConversationStudentInfo"
        );

    const conversation =
        document.getElementById(
            "conversationMessages"
        );

    const replyBox =
        document.getElementById(
            "adminReplyMessage"
        );

    if (!modal || !conversation) {
        console.error(
            "Communication conversation modal elements not found."
        );
        return;
    }

    // -----------------------------------------
    // Store selected student
    // -----------------------------------------

    selectedCommunicationStudent = student;

    // -----------------------------------------
    // Student information
    // -----------------------------------------

    if (studentName) {

        studentName.textContent =
            student.name ||
            student.student_name ||
            student.full_name ||
            "Student Conversation";

    }

    if (studentInfo) {

        const studentClass =
            student.class ||
            "";

        const department =
            student.department ||
            "";

        studentInfo.textContent =
            [studentClass, department]
                .filter(Boolean)
                .join(" • ");

    }

    // -----------------------------------------
    // Clear previous reply
    // -----------------------------------------

    if (replyBox) {

        replyBox.value = "";

    }

    // -----------------------------------------
    // Show modal
    // -----------------------------------------

    modal.style.display = "block";

    document.body.style.overflow = "hidden";

    // -----------------------------------------
    // Load conversation
    // -----------------------------------------

    conversation.innerHTML = `

        <div class="communication-empty-state">

            <div class="empty-icon">
                ⏳
            </div>

            <p>
                Loading conversation...
            </p>

        </div>

    `;

    await loadAdminConversationMessages(student);

}

async function loadAdminConversationMessages(student) {

    const conversation =
        document.getElementById(
            "conversationMessages"
        );

    if (!conversation || !student) return;

    const { data, error } =
        await supabaseClient
        .from("school_communication_book")
        .select("*")
        .eq("school_code", schoolCode)
        .eq("student_id", student.id)
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error(
            "Error loading admin conversation:",
            error
        );

        conversation.innerHTML = `

            <div class="communication-empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load conversation
                </h3>

                <p>
                    Please try again.
                </p>

            </div>

        `;

        return;
    }

    if (!data || data.length === 0) {

        conversation.innerHTML = `

            <div class="communication-empty-state">

                <div class="empty-icon">
                    📖
                </div>

                <h3>
                    No messages yet
                </h3>

            </div>

        `;

        return;
    }

    // -----------------------------------------
    // Mark parent messages as read
    // -----------------------------------------

    await supabaseClient
        .from("school_communication_book")
        .update({
            is_read: true
        })
        .eq("school_code", schoolCode)
        .eq("student_id", student.id)
        .eq("sender_type", "Parent")
        .eq("is_read", false);

    // -----------------------------------------
    // Render messages
    // -----------------------------------------

    conversation.innerHTML = "";

    data.forEach(msg => {

        const bubble =
            document.createElement("div");

        if (msg.sender_type === "Parent") {

            bubble.className =
                "admin-chat-bubble admin-chat-parent";

        } else {

            bubble.className =
                "admin-chat-bubble admin-chat-teacher";

        }

        let sender = "Unknown";

        if (msg.sender_type === "Parent") {

            sender = "👨‍👩‍👧 Parent";

        }

        else if (msg.sender_type === "Teacher") {

            sender = "👨‍🏫 Teacher";

        }

        else if (msg.sender_type === "Admin") {

            sender = "🏫 Admin";

        }

        bubble.innerHTML = `

            <div class="admin-chat-sender">

                ${sender}

            </div>

            <div class="admin-chat-message">

                ${msg.message || ""}

            </div>

            <div class="admin-chat-time">

                ${new Date(
                    msg.created_at
                ).toLocaleString()}

            </div>

        `;

        conversation.appendChild(bubble);

    });

    // -----------------------------------------
    // Scroll to newest message
    // -----------------------------------------

    conversation.scrollTop =
        conversation.scrollHeight;

}

function closeAdminConversation() {

    const modal =
        document.getElementById(
            "adminConversationModal"
        );

    if (!modal) return;

    modal.style.display = "none";

    document.body.style.overflow = "";

    const conversation =
        document.getElementById(
            "conversationMessages"
        );

    if (conversation) {

        conversation.innerHTML = `

            <div class="communication-empty-state">

                Select a student message.

            </div>

        `;

    }

}








async function loadCommunicationDepartments(){

    const deptSelect =
        document.getElementById("commDepartment");

    deptSelect.innerHTML =
        '<option value="">Loading...</option>';

    const { data, error } =
        await supabaseClient

        .from("students")

        .select("department")

        .eq("school_code", schoolCode);

    if(error){

        console.error(error);

        deptSelect.innerHTML =
        '<option value="">No Department</option>';

        return;

    }

    const departments =

        [...new Set(

            data.map(row=>row.department)

        )].sort();

    deptSelect.innerHTML =
        '<option value="">Select Department</option>';

    departments.forEach(dept=>{

        const option =
            document.createElement("option");

        option.value = dept;

        option.textContent = dept;

        deptSelect.appendChild(option);

    });

}

async function loadCommunicationClasses() {

    const department =
        document.getElementById("commDepartment").value;

    const classSelect =
        document.getElementById("commClass");

    classSelect.innerHTML =
        '<option value="">Loading...</option>';

    if (!department) {

        classSelect.innerHTML =
        '<option value="">Select Class</option>';

        return;
    }

    const { data, error } =
        await supabaseClient
        .from("students")
        .select("class")
        .eq("school_code", schoolCode)
        .eq("department", department);

    if (error) {

        console.error(error);

        classSelect.innerHTML =
        '<option value="">No Class</option>';

        return;

    }

    // Remove duplicates

    const uniqueClasses =
        [...new Set(
            data.map(row => row.class)
        )].sort();

    classSelect.innerHTML =
        '<option value="">Select Class</option>';

    uniqueClasses.forEach(cls => {

        const option =
            document.createElement("option");

        option.value = cls;

        option.textContent = cls;

        classSelect.appendChild(option);

    });

}

document
.getElementById("commDepartment")
.addEventListener(
    "change",
    loadCommunicationClasses
);


async function showOptionalPaymentsSetup(){

const {

data,

error

} = await supabaseClient

.from("set_optional_payments")

.select("*")

.eq(

"school_code",

schoolCode

)

.order(

"item"

);

if(error){

alert(error.message);

return;

}

renderOptionalPaymentsSetup(data);

}

async function loadCommunicationStudents() {

    const department =
        document.getElementById("commDepartment").value;

    const className =
        document.getElementById("commClass").value;

    communicationStudents = [];

    selectedCommunicationStudent = null;

    document.getElementById(
        "commStudentSearch"
    ).value = "";

    document.getElementById(
        "commStudentResults"
    ).innerHTML = "";

    if (!department || !className) return;

    const { data, error } =
        await supabaseClient
        .from("students")
        .select(`
            id,
            student_name,
            reg_no,
            class,
            department
        `)
        .eq("school_code", schoolCode)
        .eq("department", department)
        .eq("class", className)
        .order("student_name");

    if (error) {

        console.error(error);

        return;

    }

    communicationStudents = data || [];

}

function searchCommunicationStudents(){

    const keyword =
        document.getElementById("commStudentSearch")
        .value
        .toLowerCase()
        .trim();

    const results =
        document.getElementById("commStudentResults");

    results.innerHTML = "";

    if(keyword.length < 2) return;

    const matches =
        communicationStudents.filter(student=>{

            return(

                student.student_name
                .toLowerCase()
                .includes(keyword)

                ||

                student.reg_no
                .toLowerCase()
                .includes(keyword)

            );

        });

    matches.forEach(student=>{

        const row =
            document.createElement("div");

        row.className =
            "student-result-item";

        row.innerHTML =
        `${student.student_name}
        (${student.reg_no})`;

        row.onclick = ()=>{

            selectedCommunicationStudent =
                student;

            document.getElementById(
                "commStudentSearch"
            ).value =
                student.student_name;

            results.innerHTML = "";

            loadCommunicationConversation();

        };

        results.appendChild(row);

    });

}

document
.getElementById("commClass")
.addEventListener(
    "change",
    loadCommunicationStudents
);

document
.getElementById("commStudentSearch")
.addEventListener("input", function () {

    const keyword =
        this.value.toLowerCase();

    const results =
        document.getElementById(
            "commStudentResults"
        );

    results.innerHTML = "";

    if (!keyword) return;

    const matches =
        communicationStudents.filter(student =>
            student.student_name.toLowerCase().includes(keyword) ||
            student.reg_no.toLowerCase().includes(keyword)
        );

    matches.forEach(student => {

        const div =
            document.createElement("div");

        div.className = "dropdown-item";

        div.innerHTML = `
            <strong>${student.student_name}</strong><br>
            ${student.reg_no}
        `;

        div.onclick = function () {

            selectedCommunicationStudent = student;
			clearInterval(communicationRefresh);

communicationRefresh =
setInterval(

    loadCommunicationConversation,

    5000

);

            document.getElementById(
                "commStudentSearch"
            ).value = student.student_name;

            results.innerHTML = "";

            loadCommunicationConversation();

        };

        results.appendChild(div);

    });

});

async function loadCommunicationConversation() {

    if (!selectedCommunicationStudent) return;

    const conversation =
        document.getElementById(
            "teacherConversationThread"
        );

    conversation.innerHTML =
        "<p>Loading conversation...</p>";

    const { data, error } =
        await supabaseClient
        .from("school_communication_book")
        .select("*")
        .eq("school_code", schoolCode)
        .eq("student_id", selectedCommunicationStudent.id)
        .order("created_at", { ascending: true });

    if (error) {

        console.error(error);

        conversation.innerHTML =
            "<p>Unable to load messages.</p>";

        return;

    }

    if (!data || data.length === 0) {

        conversation.innerHTML =
            "<p>No messages yet.</p>";

        return;

    }

    // ==========================================
    // Mark Parent messages as read
    // ==========================================

    await supabaseClient
        .from("school_communication_book")
        .update({
            is_read: true
        })
        .eq("school_code", schoolCode)
        .eq("student_id", selectedCommunicationStudent.id)
        .eq("sender_type", "Parent")
        .eq("is_read", false);

    conversation.innerHTML = "";

    data.forEach(msg => {

        const bubble =
    document.createElement("div");

if(msg.sender_type === "Parent"){

    bubble.className =
        "chat-bubble chat-parent";

}else{

    bubble.className =
        "chat-bubble chat-teacher";

}

       let sender = "Unknown";

if(msg.sender_type === "Parent"){

    sender = "👨‍👩‍👧 Parent";

}

else if(msg.sender_type === "Teacher"){

    sender = "👨‍🏫 Teacher";

}

else if(msg.sender_type === "Admin"){

    sender = "🏫 Admin";

}

     bubble.innerHTML = `

    <div class="chat-sender">

        ${sender}

    </div>

    <div class="chat-message">

        ${msg.message}

    </div>

    <div class="chat-time">

        ${new Date(
            msg.created_at
        ).toLocaleString()}

    </div>

`;

        conversation.appendChild(bubble);

    });

    conversation.scrollTop =
        conversation.scrollHeight;

}

async function sendTeacherReply(){

    if(!selectedCommunicationStudent){

        alert("Please select a student.");

        return;

    }

    const message =
        document
        .getElementById("teacherReply")
        .value
        .trim();

  // 👇 ADD THIS HERE
    console.log(
        "Reply textbox value:",
        document.getElementById("teacherReply").value
    );

    if(message===""){

        alert("Please type a reply.");

        return;

    }

   const { error } =
await supabaseClient
.from("school_communication_book")
.insert([{

    school_code: schoolCode,

    department:
        selectedCommunicationStudent.department,

    class:
        selectedCommunicationStudent.class,

    student_id:
        selectedCommunicationStudent.id,

    reg_no:
        selectedCommunicationStudent.reg_no,

    student_name:
        selectedCommunicationStudent.student_name,

    sender_type: "Teacher",

    sender_name: "Teacher",

    message: message,

    is_read: false

}]);
    if(error){

        console.error(error);

        alert(error.message);

        return;

    }

    document
        .getElementById("teacherReply")
        .value="";

    loadCommunicationConversation();

}

function renderOptionalPaymentsSetup(data){

let html = `

<h3>

💰 Set Optional Payments

</h3>

<div class="payment-quick-filters">

<button

class="admin-btn"

onclick="openAddOptionalPaymentModal()"

>

➕ Add Item

</button>

<button

class="admin-btn"

onclick="removeSelectedOptionalItems()"

>

➖ Remove Item

</button>

</div>

<table class="admin-table">

<thead>

<tr>

<th></th>

<th>Item</th>

<th>Fee</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

data.forEach(row=>{

html += `

<tr>

<td>

<input

type="checkbox"

class="optionalItemCheck"

value="${row.id}"

>

</td>

<td>

${row.item}

</td>

<td>

₦${Number(row.fee).toLocaleString()}

</td>

<td>

<button
class="admin-btn"
onclick="editOptionalItem(
'${row.id}',
'${row.item}',
${row.fee}
)"
>
✏ Edit
</button>

</td>

</tr>

`;

});

html += `

</tbody>

</table>

<br>

<div
style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;"
>

<button

class="admin-btn"

style="background:green;color:white;"

onclick="openOptionalPaymentModal()"

>

Make Payment

</button>

<button

class="admin-btn"

style="background:#b30000;color:white;"

onclick="endTermOptionalPayments()"

>

End Of Term

</button>

</div>

`;

document.getElementById(

"adminContent"

).innerHTML = html;

}

function optionalItemChanged(){

const dropdown =

document.getElementById(
"optionalPaymentItem"
);

const option =

dropdown.options[
dropdown.selectedIndex
];

const fee =

option.dataset.fee || 0;

document.getElementById(
"optionalPaymentFee"
).value =

Number(fee).toLocaleString();

}

async function openOptionalPaymentModal(){

document.getElementById(
"optionalPaymentModal"
).style.display="flex";

optionalSelectedStudent = null;

await loadOptionalPaymentItems();

await loadOptionalStudents();

}

function searchOptionalStudents(){

const keyword =

document.getElementById(
"optionalStudentSearch"
).value
.toLowerCase()
.trim();

const resultsDiv =

document.getElementById(
"optionalStudentResults"
);

resultsDiv.innerHTML = "";

if(keyword.length < 2){

return;

}

const matches =

optionalStudentsCache.filter(student=>{

return(

student.student_name

.toLowerCase()

.includes(keyword)

||

student.reg_no

.toLowerCase()

.includes(keyword)

);

});

matches.slice(0,10).forEach(student=>{

const div =

document.createElement("div");

div.className =

"student-result-item";

div.innerHTML =

`${student.student_name}

(${student.reg_no})`;

div.onclick = ()=>{

selectOptionalStudent(student);

};

resultsDiv.appendChild(div);

});

}

function selectOptionalStudent(student){

optionalSelectedStudent = student;

document.getElementById(
"optionalStudentSearch"
).value =
student.student_name;

document.getElementById(
"optionalStudentClass"
).value =
student.class;

document.getElementById(
"optionalStudentResults"
).innerHTML = "";

}

async function removeSelectedOptionalItems(){

    const checked =

    [

        ...

        document.querySelectorAll(

            ".optionalItemCheck:checked"

        )

    ].map(

        box=>box.value

    );


    if(

        checked.length===0

    ){

        alert(

            "Select item(s) first."

        );

        return;

    }


    showTUPSConfirmation(

        `Remove ${checked.length} selected item(s)?`,

        async function(){

            const {

                error

            } = await supabaseClient

                .from(

                    "set_optional_payments"

                )

                .delete()

                .in(

                    "id",

                    checked

                );


            if(error){

                alert(
                    error.message
                );

                return;

            }


            showOptionalPaymentsSetup();

        },

        function(){

            // User cancelled.
            // Do nothing.

        }

    );

}

function openAddOptionalPaymentModal(){

document
.getElementById(
"optionalItemModal"
)
.classList.add(
"show"
);

document.getElementById(
"optionalItemName"
).value="";

document.getElementById(
"optionalItemFee"
).value="";

}

function closeOptionalItemModal(){

document.getElementById(
"optionalItemModal"
).style.display =
"none";

document.getElementById(
"optionalItemId"
).value = "";

document.getElementById(
"optionalItemName"
).value = "";

document.getElementById(
"optionalItemFee"
).value = "";

document.getElementById(
"optionalItemModalTitle"
).innerText =
"Add Optional Payment Item";

}

async function loadOptionalPaymentItems(){

const {

data,
error

} = await supabaseClient

.from("set_optional_payments")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"item"
);

if(error){

alert(error.message);

return;

}

const dropdown =

document.getElementById(
"optionalPaymentItem"
);

dropdown.innerHTML =

`<option value="">
Select Item
</option>`;

data.forEach(row=>{

dropdown.innerHTML += `

<option

value="${row.id}"

data-fee="${row.fee}"

>

${row.item}

</option>

`;

});

}

async function loadOptionalStudents(){

const {

data,
error

} = await supabaseClient

.from("students")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"student_name"
);

if(error){

console.error(error);

return;

}

optionalStudentsCache = data || [];

}

async function showAllOptionalPayments(){

const {

data: items,

error: itemError

} = await supabaseClient

.from("set_optional_payments")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"item"
);

if(itemError){

alert(itemError.message);

return;

}

let cardsHTML = "";

items.forEach(item=>{

cardsHTML += `

<div class="optional-card">

    <div class="optional-card-title">

        ${item.item}

    </div>

    <div
        class="optional-card-count"
        id="count-${item.id}"
    >

        0 Students

    </div>

    <div
        class="optional-card-amount"
        id="amount-${item.id}"
    >

        ₦0

    </div>

</div>

`;
});

document.getElementById("adminContent").innerHTML = `

<div class="optional-dashboard">

    <div class="optional-dashboard-header">

        <h2 class="optional-title">
            📋 All Optional Payments
        </h2>

    </div>

    <div class="optional-cards-wrapper">

        ${cardsHTML}

    </div>

   <div class="optional-toolbar-card">

    <div class="toolbar-search">

        <input
type="text"
id="optionalSearch"
placeholder="🔍 Search Student..."
oninput="filterOptionalPayments()"
>

    </div>

    <div class="toolbar-filters">

       <select
id="optionalDepartmentFilter"
onchange="filterOptionalPayments()">
    <option value="">🏫 Department</option>
</select>

<select
id="optionalClassFilter"
onchange="filterOptionalPayments()">
    <option value="">🎓 Class</option>
</select>

<select
id="optionalItemFilter"
onchange="filterOptionalPayments()">
    <option value="">📦 Item</option>
</select>

<select
id="optionalStatusFilter"
onchange="filterOptionalPayments()">
    <option value="">⚑ Status</option>
    <option value="Paid">Paid</option>
    <option value="Partial">Partial</option>
</select>
    </div>

    <div class="toolbar-buttons">

        <button
            class="refresh-btn"
            onclick="refreshOptionalPayments()">

            🔄 Refresh

        </button>

        <button
            class="print-btn"
            onclick="window.print()">

            🖨 Print

        </button>

    </div>

</div>
    <div
        id="optionalPaymentsTableContainer"
        class="optional-table-card"
    >

        Loading...

    </div>

</div>

`;

await loadAllOptionalPayments();

}

async function loadAllOptionalPayments(){

const {
data,
error
} = await supabaseClient

.from("optional_payments")

.select("*")

.eq(
"school_code",
currentSchoolCode
)

.order(
"created_at",
{
ascending:false
}
);

if(error){

document.getElementById(
"optionalPaymentsTableContainer"
).innerHTML =
error.message;

return;

}

// Store master data
optionalPaymentsMasterData =
data || [];

// Working copy
optionalPaymentsData =
[...optionalPaymentsMasterData];

// Build dropdown filters
populateOptionalFilters();

// Reset to first page
optionalPaymentsCurrentPage = 1;

// Render table
renderOptionalPaymentsTable();

// Update summary cards
updateOptionalCards(
optionalPaymentsData
);

}

async function refreshOptionalPayments(){

document.getElementById(
"optionalSearch"
).value = "";

document.getElementById(
"optionalDepartmentFilter"
).value = "";

document.getElementById(
"optionalClassFilter"
).value = "";

document.getElementById(
"optionalItemFilter"
).value = "";

document.getElementById(
"optionalStatusFilter"
).value = "";

await loadAllOptionalPayments();

}

async function endTermOptionalPayments(){

    showTUPSConfirmation(

        `⚠ END OF TERM WARNING

This will permanently delete ALL Optional Payment records for this term.

Before continuing, ensure that:

• All outstanding optional payments have been collected OR

• You have printed/exported the Outstanding Payments List.

This action CANNOT be undone.

Do you want to continue?`,

        async function(){

            const {

                error

            } = await supabaseClient

                .from("optional_payments")

                .delete()

                .eq(
                    "school_code",
                    currentSchoolCode
                );


            if(error){

                alert(
                    error.message
                );

                return;

            }


            alert(

                "✅ End of Term completed successfully. All Optional Payment records have been cleared."

            );


            // Refresh dashboard
            await loadAllOptionalPayments();

        },

        function(){

            // User cancelled.
            // Do nothing.

        }

    );

}

function filterOptionalPayments(){

const search =

document.getElementById(
"optionalSearch"
).value
.toLowerCase()
.trim();

const department =

document.getElementById(
"optionalDepartmentFilter"
).value;

const className =

document.getElementById(
"optionalClassFilter"
).value;

const item =

document.getElementById(
"optionalItemFilter"
).value;

const status =

document.getElementById(
"optionalStatusFilter"
).value;

optionalPaymentsData =

optionalPaymentsMasterData.filter(row=>{

const matchSearch =

search==="" ||

row.student_name
.toLowerCase()
.includes(search)

||

row.reg_no
.toLowerCase()
.includes(search);

const matchDepartment =

department===""

||

row.department===department;

const matchClass =

className===""

||

row.class_name===className;

const matchItem =

item===""

||

row.item===item;

const matchStatus =

status === ""

||

row.status
.toLowerCase()
.includes(
status.toLowerCase()
);

return(

matchSearch

&&

matchDepartment

&&

matchClass

&&

matchItem

&&

matchStatus

);

});

optionalPaymentsCurrentPage = 1;

renderOptionalPaymentsTable();

updateOptionalCards(
optionalPaymentsData
);

}

function renderOptionalPaymentsTable(){

const start =
(optionalPaymentsCurrentPage-1)*
optionalPaymentsRowsPerPage;

const end =
start+
optionalPaymentsRowsPerPage;

const pageData =
optionalPaymentsData.slice(
start,
end
);

let html = `

<table class="admin-table">

<thead>

<tr>

<th>Date</th>

<th>Time</th>

<th>Name</th>

<th>Class</th>

<th>Item</th>

<th>Fee</th>

<th>Paid</th>

<th>Balance</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

pageData.forEach(row=>{

const date =
new Date(row.created_at);

html += `

<tr>

<td>${date.toLocaleDateString()}</td>

<td>${date.toLocaleTimeString()}</td>

<td>${row.student_name}</td>

<td>${row.class_name}</td>

<td>${row.item}</td>

<td>₦${Number(row.original_fee).toLocaleString()}</td>

<td>₦${Number(row.amount_paid).toLocaleString()}</td>

<td>₦${Number(row.remaining_amount).toLocaleString()}</td>

<td>${row.status}</td>
</tr>

`;

});

html += `

</tbody>

</table>

<div class="optional-pagination">

<button

onclick="changeOptionalPage(-1)"

${optionalPaymentsCurrentPage===1?"disabled":""}

>

◀ Previous

</button>

<span>

Page ${optionalPaymentsCurrentPage}

of

${Math.max(
1,
Math.ceil(
optionalPaymentsData.length/
optionalPaymentsRowsPerPage
)
)}

</span>

<button

onclick="changeOptionalPage(1)"

${optionalPaymentsCurrentPage>=Math.ceil(optionalPaymentsData.length/optionalPaymentsRowsPerPage)?"disabled":""}

>

Next ▶

</button>

</div>

`;

document.getElementById(
"optionalPaymentsTableContainer"
).innerHTML =
html;

}

function changeOptionalPage(direction){

const totalPages =

Math.max(
1,
Math.ceil(
optionalPaymentsData.length/
optionalPaymentsRowsPerPage
)
);

optionalPaymentsCurrentPage += direction;

if(optionalPaymentsCurrentPage<1){

optionalPaymentsCurrentPage=1;

}

if(optionalPaymentsCurrentPage>totalPages){

optionalPaymentsCurrentPage=totalPages;

}

renderOptionalPaymentsTable();

}


function populateOptionalFilters(){

// =========================
// DEPARTMENT
// =========================

const departmentSelect =
document.getElementById(
"optionalDepartmentFilter"
);

const departments = [

...new Set(

optionalPaymentsMasterData

.map(r=>r.department)

.filter(Boolean)

)

].sort();

departmentSelect.innerHTML =

`<option value="">
🏫 Department
</option>`;

departments.forEach(dep=>{

departmentSelect.innerHTML +=

`<option value="${dep}">
${dep}
</option>`;

});

// =========================
// CLASS
// =========================

const classSelect =
document.getElementById(
"optionalClassFilter"
);

const classes = [

...new Set(

optionalPaymentsMasterData

.map(r=>r.class_name)

.filter(Boolean)

)

].sort();

classSelect.innerHTML =

`<option value="">
🎓 Class
</option>`;

classes.forEach(cls=>{

classSelect.innerHTML +=

`<option value="${cls}">
${cls}
</option>`;

});

// =========================
// ITEM
// =========================

const itemSelect =
document.getElementById(
"optionalItemFilter"
);

const items = [

...new Set(

optionalPaymentsMasterData

.map(r=>r.item)

.filter(Boolean)

)

].sort();

itemSelect.innerHTML =

`<option value="">
📦 Item
</option>`;

items.forEach(item=>{

itemSelect.innerHTML +=

`<option value="${item}">
${item}
</option>`;

});

}

function updateOptionalCards(data){

const summary = {};

data.forEach(row=>{

    if(!summary[row.item]){

        summary[row.item]={

            count:0,

            total:0

        };

    }

    summary[row.item].count++;

    summary[row.item].total += Number(row.amount_paid || 0);

});

document
.querySelectorAll(".optional-card")
.forEach(card=>{

    const item =

    card
    .querySelector(".optional-card-title")
    .innerText
    .trim();

    const countDiv =

    card.querySelector(".optional-card-count");

    const amountDiv =

    card.querySelector(".optional-card-amount");

    if(summary[item]){

        const count = summary[item].count;

        countDiv.innerText =
        `${count} ${count === 1 ? "Student" : "Students"}`;

        amountDiv.innerText =
        "₦" + summary[item].total.toLocaleString();

    }else{

        countDiv.innerText =
        "0 Students";

        amountDiv.innerText =
        "₦0";

    }

});

}

function closeOptionalItemModal(){

document.getElementById(

"optionalItemModal"

).style.display="none";

}

async function saveOptionalItem(){

const id =
document.getElementById(
"optionalItemId"
).value;

const item =
document.getElementById(
"optionalItemName"
).value.trim();

const fee =
Number(
document.getElementById(
"optionalItemFee"
).value
);

if(!item){

alert(
"Enter Item Name."
);

return;

}

if(fee<=0){

alert(
"Enter a valid Fee."
);

return;

}

// ===========================
// ADD NEW ITEM
// ===========================

if(!id){

const {

data: existing,
error: existingError

} = await supabaseClient

.from("set_optional_payments")

.select("id")

.eq(
"school_code",
currentSchoolCode
)

.ilike(
"item",
item
);

if(existingError){

alert(existingError.message);

return;

}

if(existing && existing.length){

alert(
"This item already exists."
);

return;

}

const {

error

} = await supabaseClient

.from("set_optional_payments")

.upsert(

{

school_code:
currentSchoolCode,

item,

fee

},

{

onConflict:
"school_code,item"

}

);

if(error){

console.error(error);

alert(error.message);

return;

}

alert(
"Optional Payment Item Added Successfully."
);

}

// ===========================
// EDIT EXISTING ITEM
// ===========================

else{

const {

error

} = await supabaseClient

.from("set_optional_payments")

.update({

item,

fee

})

.eq(
"id",
id
);

if(error){

console.error(error);

alert(error.message);

return;

}

alert(
"Optional Payment Item Updated Successfully."
);

}

// ===========================
// RESET FORM
// ===========================

document.getElementById(
"optionalItemId"
).value = "";

document.getElementById(
"optionalItemName"
).value = "";

document.getElementById(
"optionalItemFee"
).value = "";

document.getElementById(
"optionalItemModalTitle"
).innerText =
"Add Optional Payment Item";

closeOptionalItemModal();

await showOptionalPaymentsSetup();

}

function editOptionalItem(
id,
item,
fee
){

document.getElementById(
"optionalItemId"
).value = id;

document.getElementById(
"optionalItemName"
).value = item;

document.getElementById(
"optionalItemFee"
).value = fee;

document.getElementById(
"optionalItemModalTitle"
).innerText =
"Edit Optional Payment Item";

document.getElementById(
"optionalItemModal"
).style.display =
"flex";

}

async function openOptionalPaymentPopup(){

document
.getElementById(
"optionalPaymentModal"
)
.classList.add(
"show"
);

document.getElementById(
"optionalStudentSearch"
).value="";

document.getElementById(
"optionalStudentClass"
).value="";

document.getElementById(
"optionalPaymentFee"
).value="";

document.getElementById(
"optionalAmountPaid"
).value="";

await loadOptionalItems();

}

function closeOptionalPaymentModal(){

document.getElementById(
"optionalPaymentModal"
).style.display = "none";

document.getElementById(
"optionalStudentSearch"
).value = "";

document.getElementById(
"optionalStudentResults"
).innerHTML = "";

document.getElementById(
"optionalStudentClass"
).value = "";

document.getElementById(
"optionalPaymentItem"
).selectedIndex = 0;

document.getElementById(
"optionalPaymentFee"
).value = "";

document.getElementById(
"optionalAmountPaid"
).value = "";

}

async function loadOptionalItems(){

const{

data,

error

}=await supabaseClient

.from(
"set_optional_payments"
)

.select("*")

.eq(
"school_code",
schoolCode
)

.order(
"item"
);

if(error){

alert(error.message);

return;

}

const select=

document.getElementById(
"optionalPaymentItem"
);

select.innerHTML=

`<option value="">
Select Item
</option>`;

data.forEach(item=>{

select.innerHTML+=`

<option
value="${item.id}"
data-fee="${item.fee}"
>

${item.item}

</option>

`;

});

}

document.addEventListener(

"change",

function(e){

if(

e.target.id===

"optionalPaymentItem"

){

const fee=

e.target.options[
e.target.selectedIndex
]

.dataset.fee||

0;

document.getElementById(

"optionalPaymentFee"

).value=

`₦${Number(fee).toLocaleString()}`;

}

}

);

async function saveOptionalPayment(){

    const paymentBtn = document.getElementById(
        "optionalUpdatePaymentBtn"
    );

    // Prevent double-click while payment is processing
    if(paymentBtn.disabled){
        return;
    }

    // Lock button immediately
    paymentBtn.disabled = true;
    paymentBtn.textContent = "Processing...";

    try {

        if(!optionalSelectedStudent){

            alert(
                "Please select a student."
            );

            return;

        }

        const dropdown =

        document.getElementById(
            "optionalPaymentItem"
        );

        if(!dropdown.value){

            alert(
                "Please select an item."
            );

            return;

        }

        const selectedOption =

        dropdown.options[
            dropdown.selectedIndex
        ];

        const itemName =
            selectedOption.text;

        const fee =

        Number(
            selectedOption.dataset.fee
        );

        const amountPaid =

        Number(

            document.getElementById(
                "optionalAmountPaid"
            ).value

        );

        if(

            isNaN(amountPaid)

            ||

            amountPaid <= 0

        ){

            alert(
                "Enter a valid amount."
            );

            return;

        }

        const remaining =

        Math.max(

            fee - amountPaid,

            0

        );

        const status =
            remaining === 0
                ? "🟢 Paid"
                : "🟡 Partial";


        // =========================
        // CHECK EXISTING PAYMENT
        // =========================

        const {

            data: existing,
            error: existingError

        } = await supabaseClient

        .from("optional_payments")

        .select(
            "id, amount_paid, original_fee"
        )

        .eq(
            "school_code",
            currentSchoolCode
        )

        .eq(
            "student_id",
            optionalSelectedStudent.id
        )

        .eq(
            "item",
            itemName
        );


        if(existingError){

            alert(
                existingError.message
            );

            return;

        }


        let error;


        if(existing && existing.length){

            const previousPaid =
                Number(
                    existing[0].amount_paid
                ) || 0;

            const totalPaid =
                previousPaid + amountPaid;

            const remaining =
                Math.max(
                    fee - totalPaid,
                    0
                );

            const status =
                remaining === 0
                    ? "🟢 Paid"
                    : "🟡 Partial";


            ({ error } = await supabaseClient

                .from("optional_payments")

                .update({

                    class_name:
                        optionalSelectedStudent.class,

                    amount_paid:
                        totalPaid,

                    original_fee:
                        fee,

                    remaining_amount:
                        remaining,

                    status:
                        status,

                    updated_at:
                        new Date()

                })

                .eq(
                    "id",
                    existing[0].id
                ));

        }

        else{

            ({ error } =

                await supabaseClient

                .from("optional_payments")

                .insert({

                    school_code:
                        currentSchoolCode,

                    student_id:
                        optionalSelectedStudent.id,

                    student_name:
                        optionalSelectedStudent.student_name,

                    reg_no:
                        optionalSelectedStudent.reg_no,

                    department:
                        optionalSelectedStudent.department,

                    class_name:
                        optionalSelectedStudent.class,

                    item:
                        itemName,

                    original_fee:
                        fee,

                    amount_paid:
                        amountPaid,

                    remaining_amount:
                        remaining,

                    status:
                        status,

                    created_at:
                        new Date(),

                    updated_at:
                        new Date()

                })

            );

        }


        if(error){

            alert(
                error.message
            );

            return;

        }


        alert(
            "Optional Payment Updated Successfully."
        );


        closeOptionalPaymentModal();

    }

    finally {

        // Unlock only after the payment operation
        // and any alert have finished
        paymentBtn.disabled = false;
        paymentBtn.textContent = "Update Payment";

    }

}

function showDrive() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>📁 School Drive</h3>

    <p>
      Access the school's secure Google Drive workspace.
    </p>

    <br>

    <button
      id="openDriveBtn"
      class="admin-btn"
    >
      Open School Drive
    </button>

  `;

}



async function loadDepartmentResources() {

  console.log("CURRENT SCHOOL CODE:", schoolCode);

  const { data, error } = await supabaseClient
    .from("department_resources")
    .select("*")
    .eq("school_code", schoolCode); // 🔥 KEY FIX

  if (error) {
    console.error(error);
    return [];
  }

  console.log("MASTER SHEET DATA:", data);

  return data || [];
}


function renderDepartments(data) {

  let html = "<div class='department-list'>";

 data.forEach(row => {

  if (!row.department) return;

  const safeId =
    row.department.replace(/\s+/g, "_");

    html += `
  <div class="department-item">

    <div
      class="department-header"
      onclick="toggleDepartment('${row.department}')"
    >

      ${row.department}

    </div>

    <div
      class="department-dropdown"
      id="dropdown-${safeId}"
    >

      <div
        class="dropdown-item"
        onclick="openSheet('${row.spreadsheet_url}')"
      >
        📊 Open Master Sheet
      </div>

      <div
        class="dropdown-item"
        onclick="openSheet('${row.broadsheet_url}')"
      >
        📑 Open Broadsheet
      </div>

    </div>

  </div>
`;

  });

  html += "</div>";

  document.getElementById("adminContent").innerHTML = html;
}

function openSheet(url) {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <iframe
      src="${url}"
      style="
        width:100%;
        height:700px;
        border:none;
        border-radius:10px;
      ">
    </iframe>

  `;

}


async function showMasterSheet() {

  const data = await loadDepartmentResources();

  if (!data.length) {
    document.getElementById("adminContent").innerHTML =
      "<p>No departments found.</p>";
    return;
  }

  renderDepartments(data);
}

async function showStudentsFees() {

  const { data, error } =
    await supabaseClient
      .from(
        "department_resources"
      )
      .select(
        "department"
      )
      .eq(
        "school_code",
        schoolCode
      )
      .order(
        "department"
      );

  if (error) {

    alert(
      error.message
    );

    return;

  }

  let options =
    `<option value="">
      Select Department
    </option>`;

  data.forEach(row => {

    options += `

      <option
        value="${row.department}"
      >

        ${row.department}

      </option>

    `;

  });

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>
      👨‍🎓 Students & Fees
    </h3>

    <div
  class="student-toolbar"
>

  <select
    id="studentDepartment"
  >
    ${options}
  </select>

  <button
    id="refreshStudentsBtn"
    class="admin-btn"
  >
    Refresh
  </button>

  <input
    type="text"
    id="studentSearch"
    placeholder="Search Student..."
  >

</div>

<br>

    <div
      id="studentsTableContainer"
    >

    </div>

  `;

  wireStudentsModule();

}

/* =========================================================
   ADVERTISEMENTS MODULE
   ========================================================= */

async function showAdverts() {

  const adminContent =
    document.getElementById(
      "adminContent"
    );

  if (!adminContent) {
    return;
  }


  adminContent.innerHTML = `

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:15px;
        flex-wrap:wrap;
        margin-bottom:20px;
      "
    >

      <div>

        <h3
          style="
            margin:0 0 5px 0;
          "
        >
          📢 Advertisements
        </h3>

        <p
          style="
            margin:0;
            color:#666;
          "
        >
          Upload and manage advertisements
          displayed on the Student Dashboard.
        </p>

      </div>


      <button
        type="button"
        class="admin-btn"
        onclick="openAdvertisementUpload()"
      >
        ➕ Upload Advertisement
      </button>

    </div>


    <!-- =========================================
         UPLOAD AREA
    ========================================== -->

    <div
      id="advertisementUploadArea"
      style="
        display:none;
        padding:20px;
        margin-bottom:20px;
        border:1px solid #ddd;
        border-radius:10px;
        background:#f8f9fa;
      "
    >

      <h4
        style="
          margin-top:0;
        "
      >
        Upload Advertisement
      </h4>


      <div
        style="
          display:flex;
          flex-direction:column;
          gap:12px;
          max-width:600px;
        "
      >

        <input
          type="text"
          id="advertisementTitle"
          placeholder="Advertisement title"
        >


        <input
          type="file"
          id="advertisementFile"
          accept="image/*"
        >


        <div
          style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
          "
        >

          <button
            type="button"
            class="admin-btn"
            onclick="uploadAdvertisement()"
          >
            ⬆ Upload
          </button>


          <button
            type="button"
            class="admin-btn"
            onclick="closeAdvertisementUpload()"
          >
            Cancel
          </button>

        </div>


        <div
          id="advertisementUploadStatus"
          style="
            font-size:14px;
          "
        ></div>

      </div>

    </div>


    <!-- =========================================
         EXISTING ADVERTISEMENTS
    ========================================== -->

    <div
      id="advertisementsList"
    >
      Loading advertisements...
    </div>

  `;


  await loadAdvertisements();

}

/* =========================================================
   ANNOUNCEMENT MODULE
========================================================= */

async function showAnnouncementEditor() {

    const adminContent =
        document.getElementById("adminContent");

    if (!adminContent) {
        return;
    }

    adminContent.innerHTML = `

        <div
            class="announcement-admin-module"
            style="
                max-width:800px;
                margin:0 auto;
            "
        >

            <h3
                style="
                    margin:0 0 6px 0;
                    color:#000066;
                "
            >
                📣 School Announcement
            </h3>

            <p
                style="
                    margin:0 0 20px 0;
                    color:#666;
                    font-size:14px;
                "
            >
                Edit the announcement that will appear
                on the Student Dashboard.
            </p>


            <div
                style="
                    background:#f8f9fa;
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:20px;
                "
            >

                <!-- Announcement -->

                <label
                    for="adminAnnouncementText"
                    style="
                        display:block;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Announcement
                </label>

                <textarea
                    id="adminAnnouncementText"
                    rows="6"
                    placeholder="Type your school announcement here..."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        resize:vertical;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:12px;
                        font-family:inherit;
                        font-size:14px;
                    "
                ></textarea>


                <!-- Expiry -->

                <label
                    for="adminAnnouncementExpiry"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Announcement Expiry
                </label>

                <input
                    type="datetime-local"
                    id="adminAnnouncementExpiry"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                        font-size:14px;
                    "
                />


                <!-- Buttons -->

                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:18px;
                    "
                >

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="saveSchoolAnnouncement()"
                    >
                        📣 Update Announcement
                    </button>

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="clearSchoolAnnouncement()"
                    >
                        🗑 Clear Announcement
                    </button>

                </div>


                <div
                    id="announcementAdminStatus"
                    style="
                        margin-top:12px;
                        font-size:14px;
                    "
                ></div>

            </div>

        </div>

    `;

    await loadAdminAnnouncement();

}

async function showSchoolCalendar() {

    const adminContent =
        document.getElementById("adminContent");

    if (!adminContent) {
        return;
    }


    adminContent.innerHTML = `

        <div
            class="school-calendar-admin"
            style="
                max-width:1000px;
                margin:0 auto;
            "
        >

            <!-- HEADER -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    flex-wrap:wrap;
                    margin-bottom:20px;
                "
            >

                <div>

                    <h3
                        style="
                            margin:0 0 5px 0;
                            color:#000066;
                        "
                    >
                        📅 School Calendar
                    </h3>

                    <p
                        style="
                            margin:0;
                            color:#666;
                            font-size:14px;
                        "
                    >
                        Manage school events and important dates.
                    </p>

                </div>


                <div
                    style="
                        display:flex;
                        gap:8px;
                    "
                >

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="schoolCalendarPreviousMonth()"
                    >
                        ‹ Previous
                    </button>

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="schoolCalendarToday()"
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="schoolCalendarNextMonth()"
                    >
                        Next ›
                    </button>

                </div>

            </div>


            <!-- MONTH TITLE -->

            <div
                id="schoolCalendarMonthTitle"
                style="
                    text-align:center;
                    font-size:22px;
                    font-weight:700;
                    color:#000066;
                    margin-bottom:15px;
                "
            >
            </div>


            <!-- CALENDAR -->

            <div
                id="schoolCalendarGrid"
                style="
                    background:#fff;
                    border:1px solid #ddd;
                    border-radius:12px;
                    overflow:hidden;
                "
            >
            </div>


            <!-- SELECTED DATE -->

            <div
                id="schoolCalendarSelectedDate"
                style="
                    margin-top:20px;
                    background:#f8f9fa;
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:20px;
                "
            >

                <h3
                    style="
                        margin:0 0 5px 0;
                        color:#000066;
                    "
                >
                    Select a date
                </h3>

                <p
                    style="
                        margin:0;
                        color:#666;
                    "
                >
                    Click a date on the calendar to manage events.
                </p>

            </div>


            <!-- STATUS -->

            <div
                id="schoolCalendarStatus"
                style="
                    margin-top:12px;
                    font-size:14px;
                "
            >
            </div>

        </div>

    `;


    /*
     * Calendar state
     */

    window.schoolCalendarState = {

        currentDate:
            new Date(),

        selectedDate:
            null,

        events:
            []

    };


    await loadSchoolCalendarEvents();

    renderSchoolCalendar();

}

async function loadSchoolCalendarEvents() {

    if (!window.schoolCalendarState) {
        return;
    }


    const status =
        document.getElementById(
            "schoolCalendarStatus"
        );


    if (status) {

        status.style.color = "#555";

        status.textContent =
            "Loading calendar...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "school_calendar_events"
                )

                .select("*")

                .eq(
                    "school_code",
                    schoolCode
                )

                .order(
                    "event_date",
                    {
                        ascending: true
                    }
                )

                .order(
                    "start_time",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;

        }


        window.schoolCalendarState.events =
            data || [];


        if (status) {

            status.textContent = "";

        }


    }
    catch (error) {

        console.error(
            "Load School Calendar Error:",
            error
        );


        if (status) {

            status.style.color =
                "red";

            status.textContent =
                error.message ||
                "Unable to load school calendar.";

        }

    }

}

function renderSchoolCalendar() {

    const grid =
        document.getElementById(
            "schoolCalendarGrid"
        );

    const title =
        document.getElementById(
            "schoolCalendarMonthTitle"
        );


    if (!grid || !title) {
        return;
    }


    const state =
        window.schoolCalendarState;


    const year =
        state.currentDate.getFullYear();

    const month =
        state.currentDate.getMonth();


    const monthName =
        state.currentDate.toLocaleString(
            "default",
            {
                month: "long"
            }
        );


    title.textContent =
        `${monthName} ${year}`;


    /*
     * First day of the month
     */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
     * Number of days in month
     */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const weekdays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];


    let html = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(7, 1fr);
                background:#f1f3f5;
            "
        >
    `;


    /*
     * Weekday headings
     */

    weekdays.forEach(
        day => {

            html += `

                <div
                    style="
                        padding:12px 5px;
                        text-align:center;
                        font-weight:700;
                        color:#444;
                        border-right:1px solid #ddd;
                        border-bottom:1px solid #ddd;
                    "
                >
                    ${day}
                </div>

            `;

        }
    );


    /*
     * Empty cells before first day
     */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        html += `

            <div
                style="
                    min-height:75px;
                    background:#fafafa;
                    border-right:1px solid #eee;
                    border-bottom:1px solid #eee;
                "
            ></div>

        `;

    }


    /*
     * Calendar days
     */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayEvents =
            state.events.filter(
                event =>
                    event.event_date ===
                    dateString
            );


        const hasEvents =
            dayEvents.length > 0;


        /*
         * Get unique event colours.
         *
         * This allows a day containing
         * several differently coloured events
         * to display all their colours.
         */

        const eventColours =
            [
                ...new Set(
                    dayEvents
                        .map(
                            event =>
                                event.colour
                        )
                        .filter(
                            colour =>
                                colour
                        )
                )
            ];


        const today =
            new Date();


        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;


        /*
         * Background for dates containing events.
         */

        const dayBackground =
            hasEvents
                ? "#f8fbff"
                : "#fff";


        /*
         * Build colour indicators.
         */

        let colourIndicators =
            "";


        if (eventColours.length > 0) {

            colourIndicators =
                eventColours
                    .map(
                        colour => `

                            <span
                                title="Event"
                                style="
                                    width:9px;
                                    height:9px;
                                    border-radius:50%;
                                    background:${escapeSchoolCalendarColour(
                                        colour
                                    )};
                                    display:inline-block;
                                    margin-right:3px;
                                    border:1px solid rgba(0,0,0,0.12);
                                "
                            ></span>

                        `
                    )
                    .join("");

        }


        html += `

            <button
                type="button"
                onclick="
                    selectSchoolCalendarDate(
                        '${dateString}'
                    )
                "
                style="
                    min-height:75px;
                    padding:8px;
                    text-align:left;
                    background:${dayBackground};
                    border:none;
                    border-right:1px solid #eee;
                    border-bottom:1px solid #eee;
                    cursor:pointer;
                    position:relative;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        font-weight:700;
                        color:
                            ${
                                isToday
                                    ? "#000066"
                                    : "#333"
                            };
                    "
                >

                    <span>
                        ${day}
                    </span>


                    ${
                        hasEvents
                            ? `
                                <span
                                    style="
                                        display:flex;
                                        align-items:center;
                                    "
                                >
                                    ${colourIndicators}
                                </span>
                              `
                            : ""
                    }

                </div>


                ${
                    hasEvents
                        ? `
                            <div
                                style="
                                    margin-top:8px;
                                    font-size:11px;
                                    font-weight:600;
                                    color:#555;
                                "
                            >
                                ${dayEvents.length}
                                event${dayEvents.length === 1 ? "" : "s"}
                            </div>
                          `
                        : ""
                }

            </button>

        `;

    }


    html += `</div>`;


    grid.innerHTML =
        html;

}

function schoolCalendarPreviousMonth() {

    if (!window.schoolCalendarState) {
        return;
    }


    window.schoolCalendarState.currentDate =
        new Date(
            window.schoolCalendarState.currentDate.getFullYear(),
            window.schoolCalendarState.currentDate.getMonth() - 1,
            1
        );


    renderSchoolCalendar();

}

function schoolCalendarNextMonth() {

    if (!window.schoolCalendarState) {
        return;
    }


    window.schoolCalendarState.currentDate =
        new Date(
            window.schoolCalendarState.currentDate.getFullYear(),
            window.schoolCalendarState.currentDate.getMonth() + 1,
            1
        );


    renderSchoolCalendar();

}

function schoolCalendarToday() {

    if (!window.schoolCalendarState) {
        return;
    }


    window.schoolCalendarState.currentDate =
        new Date();


    renderSchoolCalendar();

}

function selectSchoolCalendarDate(
    dateString
) {

    if (!window.schoolCalendarState) {
        return;
    }


    window.schoolCalendarState.selectedDate =
        dateString;


    renderSchoolCalendarSelectedDate();

}

function renderSchoolCalendarSelectedDate() {

    const container =
        document.getElementById(
            "schoolCalendarSelectedDate"
        );


    if (!container) {
        return;
    }


    const state =
        window.schoolCalendarState;


    const dateString =
        state.selectedDate;


    if (!dateString) {

        container.innerHTML = `

            <h3
                style="
                    margin:0 0 5px 0;
                    color:#000066;
                "
            >
                Select a date
            </h3>

            <p
                style="
                    margin:0;
                    color:#666;
                "
            >
                Click a date on the calendar
                to manage events.
            </p>

        `;

        return;

    }


    const selectedDate =
        new Date(
            `${dateString}T00:00:00`
        );


    const formattedDate =
        selectedDate.toLocaleDateString(
            "en-NG",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    const events =
        state.events.filter(
            event =>
                event.event_date ===
                dateString
        );


    let eventsHTML = "";


    if (events.length === 0) {

        eventsHTML = `

            <div
                style="
                    padding:15px;
                    background:#fff;
                    border:1px solid #ddd;
                    border-radius:8px;
                    color:#666;
                "
            >
                No events scheduled for this date.
            </div>

        `;

    }
    else {

        eventsHTML =
            events.map(
                event => `

                    <div
                        style="
                            background:#fff;
                            border:1px solid #ddd;
                            border-left:
                                5px solid
                                ${event.colour || "#2563eb"};
                            border-radius:8px;
                            padding:14px;
                            margin-top:10px;
                        "
                    >

                        <strong>
                            ${escapeSchoolCalendarText(
                                event.title
                            )}
                        </strong>

                        ${
                            event.description
                                ? `
                                    <p
                                        style="
                                            margin:7px 0;
                                            color:#555;
                                        "
                                    >
                                        ${escapeSchoolCalendarText(
                                            event.description
                                        )}
                                    </p>
                                  `
                                : ""
                        }

                        ${
                            event.start_time
                                ? `
                                    <div
                                        style="
                                            font-size:13px;
                                            color:#666;
                                        "
                                    >
                                        ${formatSchoolCalendarTime(
                                            event.start_time
                                        )}
                                        ${
                                            event.end_time
                                                ? `
                                                    –
                                                    ${formatSchoolCalendarTime(
                                                        event.end_time
                                                    )}
                                                  `
                                                : ""
                                        }
                                    </div>
                                  `
                                : ""
                        }

                        <div
                            style="
                                margin-top:10px;
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                            "
                        >

                            <button
                                type="button"
                                class="admin-btn"
                                onclick="
                                    editSchoolCalendarEvent(
                                        '${event.id}'
                                    )
                                "
                            >
                                ✏️ Edit
                            </button>

                            <button
                                type="button"
                                class="admin-btn"
                                onclick="
                                    deleteSchoolCalendarEvent(
                                        '${event.id}'
                                    )
                                "
                            >
                                🗑 Delete
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");

    }


    container.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
                flex-wrap:wrap;
            "
        >

            <div>

                <h3
                    style="
                        margin:0 0 5px 0;
                        color:#000066;
                    "
                >
                    ${formattedDate}
                </h3>

                <p
                    style="
                        margin:0;
                        color:#666;
                    "
                >
                    ${events.length}
                    event${events.length === 1 ? "" : "s"}
                </p>

            </div>


            <button
                type="button"
                class="admin-btn"
                onclick="showSchoolCalendarEventForm()"
            >
                ➕ Add Event
            </button>

        </div>


        <div
            style="
                margin-top:15px;
            "
        >
            ${eventsHTML}
        </div>

    `;

}

function escapeSchoolCalendarText(
    value
) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function escapeSchoolCalendarColour(
    value
) {

    const colour =
        String(value || "").trim();


    /*
     * Only allow standard hexadecimal colours.
     *
     * This prevents arbitrary CSS from being
     * inserted into the calendar.
     */

    if (
        /^#[0-9A-Fa-f]{6}$/.test(
            colour
        )
    ) {

        return colour;

    }


    return "#2563eb";

}

function formatSchoolCalendarTime(
    time
) {

    if (!time) {
        return "";
    }


    const parts =
        time.split(":");


    if (parts.length < 2) {
        return time;
    }


    let hour =
        parseInt(parts[0], 10);

    const minute =
        parts[1];


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${suffix}`;

}

function showSchoolCalendarEventForm() {

    const container =
        document.getElementById(
            "schoolCalendarSelectedDate"
        );

    if (!container) {
        return;
    }

    const state =
        window.schoolCalendarState;

    if (!state || !state.selectedDate) {
        alert("Please select a calendar date first.");
        return;
    }

    const selectedDate =
        new Date(
            `${state.selectedDate}T00:00:00`
        );

    const formattedDate =
        selectedDate.toLocaleDateString(
            "en-NG",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    container.innerHTML = `

        <div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                    margin-bottom:18px;
                "
            >

                <div>

                    <h3
                        style="
                            margin:0 0 5px 0;
                            color:#000066;
                        "
                    >
                        ➕ Add Calendar Event
                    </h3>

                    <p
                        style="
                            margin:0;
                            color:#666;
                        "
                    >
                        ${formattedDate}
                    </p>

                </div>

                <button
                    type="button"
                    class="admin-btn"
                    onclick="renderSchoolCalendarSelectedDate()"
                >
                    ✕ Cancel
                </button>

            </div>


            <div
                style="
                    background:#fff;
                    border:1px solid #ddd;
                    border-radius:10px;
                    padding:18px;
                "
            >

                <!-- TITLE -->

                <label
                    for="schoolCalendarEventTitle"
                    style="
                        display:block;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Event Title
                </label>

                <input
                    type="text"
                    id="schoolCalendarEventTitle"
                    placeholder="e.g. PTA Meeting"
                    maxlength="150"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                        font-size:14px;
                    "
                />


                <!-- DESCRIPTION -->

                <label
                    for="schoolCalendarEventDescription"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Description
                </label>

                <textarea
                    id="schoolCalendarEventDescription"
                    rows="4"
                    maxlength="1000"
                    placeholder="Add more information about this event..."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        resize:vertical;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:10px;
                        font-family:inherit;
                        font-size:14px;
                    "
                ></textarea>


                <!-- TIMES -->

                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                auto-fit,
                                minmax(180px, 1fr)
                            );
                        gap:15px;
                        margin-top:16px;
                    "
                >

                    <div>

                        <label
                            for="schoolCalendarEventStartTime"
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:6px;
                            "
                        >
                            Start Time
                        </label>

                        <input
                            type="time"
                            id="schoolCalendarEventStartTime"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                height:42px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                padding:0 10px;
                            "
                        />

                    </div>


                    <div>

                        <label
                            for="schoolCalendarEventEndTime"
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:6px;
                            "
                        >
                            End Time
                        </label>

                        <input
                            type="time"
                            id="schoolCalendarEventEndTime"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                height:42px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                padding:0 10px;
                            "
                        />

                    </div>

                </div>


                <!-- CATEGORY -->

                <label
                    for="schoolCalendarEventCategory"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Category
                </label>

                <select
                    id="schoolCalendarEventCategory"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                        font-size:14px;
                    "
                >

                    <option value="General">
                        📌 General
                    </option>

                    <option value="Academic">
                        📚 Academic
                    </option>

                    <option value="Examination">
                        📝 Examination
                    </option>

                    <option value="Meeting">
                        📣 Meeting
                    </option>

                    <option value="School Event">
                        🎉 School Event
                    </option>

                    <option value="Holiday">
                        🏖️ Holiday
                    </option>

                    <option value="Sports">
                        ⚽ Sports
                    </option>

                </select>


                <!-- COLOUR -->

                <label
                    for="schoolCalendarEventColour"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Calendar Colour
                </label>

                <select
                    id="schoolCalendarEventColour"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                        font-size:14px;
                    "
                >

                    <option value="#2563eb">
                        🔵 Blue
                    </option>

                    <option value="#16a34a">
                        🟢 Green
                    </option>

                    <option value="#dc2626">
                        🔴 Red
                    </option>

                    <option value="#ca8a04">
                        🟡 Yellow
                    </option>

                    <option value="#9333ea">
                        🟣 Purple
                    </option>

                    <option value="#ea580c">
                        🟠 Orange
                    </option>

                </select>


                <!-- STATUS -->

                <div
                    id="schoolCalendarEventStatus"
                    style="
                        margin-top:14px;
                        font-size:14px;
                    "
                ></div>


                <!-- BUTTONS -->

                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:18px;
                    "
                >

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="saveSchoolCalendarEvent()"
                    >
                        💾 Save Event
                    </button>

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="renderSchoolCalendarSelectedDate()"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>

    `;

}

async function saveSchoolCalendarEvent() {

    const titleInput =
        document.getElementById(
            "schoolCalendarEventTitle"
        );

    const descriptionInput =
        document.getElementById(
            "schoolCalendarEventDescription"
        );

    const startTimeInput =
        document.getElementById(
            "schoolCalendarEventStartTime"
        );

    const endTimeInput =
        document.getElementById(
            "schoolCalendarEventEndTime"
        );

    const categoryInput =
        document.getElementById(
            "schoolCalendarEventCategory"
        );

    const colourInput =
        document.getElementById(
            "schoolCalendarEventColour"
        );

    const status =
        document.getElementById(
            "schoolCalendarEventStatus"
        );


    if (
        !titleInput ||
        !descriptionInput ||
        !startTimeInput ||
        !endTimeInput ||
        !categoryInput ||
        !colourInput
    ) {

        return;

    }


    const state =
        window.schoolCalendarState;


    if (!state || !state.selectedDate) {

        alert(
            "Please select a calendar date."
        );

        return;

    }


    const title =
        titleInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const startTime =
        startTimeInput.value;

    const endTime =
        endTimeInput.value;

    const category =
        categoryInput.value;

    const colour =
        colourInput.value;


    /*
     * Validate title
     */

    if (!title) {

        alert(
            "Please enter an event title."
        );

        titleInput.focus();

        return;

    }


    /*
     * Validate times
     */

    if (
        startTime &&
        endTime &&
        endTime <= startTime
    ) {

        alert(
            "The end time must be later than the start time."
        );

        return;

    }


    if (status) {

        status.style.color =
            "#555";

        status.textContent =
            "Saving event...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "school_calendar_events"
                )

                .insert(
                    {
                        school_code:
                            schoolCode,

                        event_date:
                            state.selectedDate,

                        title:
                            title,

                        description:
                            description ||
                            null,

                        start_time:
                            startTime ||
                            null,

                        end_time:
                            endTime ||
                            null,

                        category:
                            category,

                        colour:
                            colour,

                        created_at:
                            new Date().toISOString(),

                        updated_at:
                            new Date().toISOString()
                    }
                )

                .select()
                .single();


        if (error) {

            throw error;

        }


        /*
         * Add the new event to local state.
         */

        state.events.push(data);


        /*
         * Re-render the calendar.
         */

        renderSchoolCalendar();


        /*
         * Show the selected date again.
         */

        renderSchoolCalendarSelectedDate();


        /*
         * Success message
         */

        const calendarStatus =
            document.getElementById(
                "schoolCalendarStatus"
            );


        if (calendarStatus) {

            calendarStatus.style.color =
                "green";

            calendarStatus.textContent =
                "✓ Event saved successfully.";

        }


    }
    catch (error) {

        console.error(
            "Save School Calendar Event Error:",
            error
        );


        if (status) {

            status.style.color =
                "red";

            status.textContent =
                error.message ||
                "Unable to save event.";

        }

    }

}

function editSchoolCalendarEvent(eventId) {

    const state =
        window.schoolCalendarState;

    if (!state || !state.events) {
        return;
    }


    const event =
        state.events.find(
            item =>
                item.id === eventId
        );


    if (!event) {

        alert(
            "The selected event could not be found."
        );

        return;

    }


    const container =
        document.getElementById(
            "schoolCalendarSelectedDate"
        );


    if (!container) {
        return;
    }


    const selectedDate =
        new Date(
            `${event.event_date}T00:00:00`
        );


    const formattedDate =
        selectedDate.toLocaleDateString(
            "en-NG",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    container.innerHTML = `

        <div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                    margin-bottom:18px;
                "
            >

                <div>

                    <h3
                        style="
                            margin:0 0 5px 0;
                            color:#000066;
                        "
                    >
                        ✏️ Edit Calendar Event
                    </h3>

                    <p
                        style="
                            margin:0;
                            color:#666;
                        "
                    >
                        ${formattedDate}
                    </p>

                </div>

                <button
                    type="button"
                    class="admin-btn"
                    onclick="renderSchoolCalendarSelectedDate()"
                >
                    ✕ Cancel
                </button>

            </div>


            <div
                style="
                    background:#fff;
                    border:1px solid #ddd;
                    border-radius:10px;
                    padding:18px;
                "
            >

                <!-- TITLE -->

                <label
                    for="schoolCalendarEditTitle"
                    style="
                        display:block;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Event Title
                </label>

                <input
                    type="text"
                    id="schoolCalendarEditTitle"
                    maxlength="150"
                    value="${escapeSchoolCalendarText(event.title)}"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                        font-size:14px;
                    "
                />


                <!-- DESCRIPTION -->

                <label
                    for="schoolCalendarEditDescription"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Description
                </label>

                <textarea
                    id="schoolCalendarEditDescription"
                    rows="4"
                    maxlength="1000"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        resize:vertical;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:10px;
                        font-family:inherit;
                        font-size:14px;
                    "
                >${escapeSchoolCalendarText(event.description || "")}</textarea>


                <!-- TIMES -->

                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                auto-fit,
                                minmax(180px, 1fr)
                            );
                        gap:15px;
                        margin-top:16px;
                    "
                >

                    <div>

                        <label
                            for="schoolCalendarEditStartTime"
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:6px;
                            "
                        >
                            Start Time
                        </label>

                        <input
                            type="time"
                            id="schoolCalendarEditStartTime"
                            value="${event.start_time || ""}"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                height:42px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                padding:0 10px;
                            "
                        />

                    </div>


                    <div>

                        <label
                            for="schoolCalendarEditEndTime"
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:6px;
                            "
                        >
                            End Time
                        </label>

                        <input
                            type="time"
                            id="schoolCalendarEditEndTime"
                            value="${event.end_time || ""}"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                height:42px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                padding:0 10px;
                            "
                        />

                    </div>

                </div>


                <!-- CATEGORY -->

                <label
                    for="schoolCalendarEditCategory"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Category
                </label>

                <select
                    id="schoolCalendarEditCategory"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                    "
                >

                    <option value="General">
                        📌 General
                    </option>

                    <option value="Academic">
                        📚 Academic
                    </option>

                    <option value="Examination">
                        📝 Examination
                    </option>

                    <option value="Meeting">
                        📣 Meeting
                    </option>

                    <option value="School Event">
                        🎉 School Event
                    </option>

                    <option value="Holiday">
                        🏖️ Holiday
                    </option>

                    <option value="Sports">
                        ⚽ Sports
                    </option>

                </select>


                <!-- COLOUR -->

                <label
                    for="schoolCalendarEditColour"
                    style="
                        display:block;
                        font-weight:600;
                        margin:16px 0 6px 0;
                    "
                >
                    Calendar Colour
                </label>

                <select
                    id="schoolCalendarEditColour"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        height:42px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        padding:0 10px;
                    "
                >

                    <option value="#2563eb">
                        🔵 Blue
                    </option>

                    <option value="#16a34a">
                        🟢 Green
                    </option>

                    <option value="#dc2626">
                        🔴 Red
                    </option>

                    <option value="#ca8a04">
                        🟡 Yellow
                    </option>

                    <option value="#9333ea">
                        🟣 Purple
                    </option>

                    <option value="#ea580c">
                        🟠 Orange
                    </option>

                </select>


                <div
                    id="schoolCalendarEditStatus"
                    style="
                        margin-top:14px;
                        font-size:14px;
                    "
                ></div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:18px;
                    "
                >

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="
                            updateSchoolCalendarEvent(
                                '${event.id}'
                            )
                        "
                    >
                        💾 Save Changes
                    </button>

                    <button
                        type="button"
                        class="admin-btn"
                        onclick="
                            renderSchoolCalendarSelectedDate()
                        "
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>

    `;


    /*
     * Set selected values after rendering.
     */

    const category =
        document.getElementById(
            "schoolCalendarEditCategory"
        );

    const colour =
        document.getElementById(
            "schoolCalendarEditColour"
        );


    if (category) {

        category.value =
            event.category ||
            "General";

    }


    if (colour) {

        colour.value =
            event.colour ||
            "#2563eb";

    }

}

async function updateSchoolCalendarEvent(
    eventId
) {

    const titleInput =
        document.getElementById(
            "schoolCalendarEditTitle"
        );

    const descriptionInput =
        document.getElementById(
            "schoolCalendarEditDescription"
        );

    const startTimeInput =
        document.getElementById(
            "schoolCalendarEditStartTime"
        );

    const endTimeInput =
        document.getElementById(
            "schoolCalendarEditEndTime"
        );

    const categoryInput =
        document.getElementById(
            "schoolCalendarEditCategory"
        );

    const colourInput =
        document.getElementById(
            "schoolCalendarEditColour"
        );

    const status =
        document.getElementById(
            "schoolCalendarEditStatus"
        );


    if (
        !titleInput ||
        !descriptionInput ||
        !startTimeInput ||
        !endTimeInput ||
        !categoryInput ||
        !colourInput
    ) {

        return;

    }


    const title =
        titleInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const startTime =
        startTimeInput.value;

    const endTime =
        endTimeInput.value;

    const category =
        categoryInput.value;

    const colour =
        colourInput.value;


    if (!title) {

        alert(
            "Please enter an event title."
        );

        return;

    }


    if (
        startTime &&
        endTime &&
        endTime <= startTime
    ) {

        alert(
            "The end time must be later than the start time."
        );

        return;

    }


    if (status) {

        status.style.color =
            "#555";

        status.textContent =
            "Saving changes...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "school_calendar_events"
                )

                .update(
                    {
                        title:
                            title,

                        description:
                            description ||
                            null,

                        start_time:
                            startTime ||
                            null,

                        end_time:
                            endTime ||
                            null,

                        category:
                            category,

                        colour:
                            colour,

                        updated_at:
                            new Date().toISOString()
                    }
                )

                .eq(
                    "id",
                    eventId
                )

                .eq(
                    "school_code",
                    schoolCode
                )

                .select()
                .single();


        if (error) {

            throw error;

        }


        /*
         * Update local Calendar state.
         */

        const state =
            window.schoolCalendarState;


        const index =
            state.events.findIndex(
                event =>
                    event.id === eventId
            );


        if (index !== -1) {

            state.events[index] =
                data;

        }


        renderSchoolCalendar();

        renderSchoolCalendarSelectedDate();


        const calendarStatus =
            document.getElementById(
                "schoolCalendarStatus"
            );


        if (calendarStatus) {

            calendarStatus.style.color =
                "green";

            calendarStatus.textContent =
                "✓ Event updated successfully.";

        }

    }
    catch (error) {

        console.error(
            "Update School Calendar Event Error:",
            error
        );


        if (status) {

            status.style.color =
                "red";

            status.textContent =
                error.message ||
                "Unable to update event.";

        }

    }

}


async function deleteSchoolCalendarEvent(
    eventId
) {

    const state =
        window.schoolCalendarState;


    if (!state) {
        return;
    }


    const event =
        state.events.find(
            item =>
                item.id === eventId
        );


    if (!event) {

        alert(
            "The selected event could not be found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete "${event.title}" from the school calendar?`
        );


    if (!confirmed) {
        return;
    }


    const status =
        document.getElementById(
            "schoolCalendarStatus"
        );


    if (status) {

        status.style.color =
            "#555";

        status.textContent =
            "Deleting event...";

    }


    try {

        const {
            error
        } =
            await supabaseClient

                .from(
                    "school_calendar_events"
                )

                .delete()

                .eq(
                    "id",
                    eventId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (error) {

            throw error;

        }


        /*
         * Remove from local state.
         */

        state.events =
            state.events.filter(
                item =>
                    item.id !== eventId
            );


        renderSchoolCalendar();

        renderSchoolCalendarSelectedDate();


        if (status) {

            status.style.color =
                "green";

            status.textContent =
                "✓ Event deleted successfully.";

        }

    }
    catch (error) {

        console.error(
            "Delete School Calendar Event Error:",
            error
        );


        if (status) {

            status.style.color =
                "red";

            status.textContent =
                error.message ||
                "Unable to delete event.";

        }

    }

}



/* =========================================================
   LOAD CURRENT ANNOUNCEMENT INTO ADMIN EDITOR
========================================================= */

async function loadAdminAnnouncement() {

    const textInput =
        document.getElementById(
            "adminAnnouncementText"
        );

    const expiryInput =
        document.getElementById(
            "adminAnnouncementExpiry"
        );

    if (!textInput || !expiryInput) {
        return;
    }

    if (!schoolCode) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient

            .from("school_announcements")

            .select(
                "announcement_text, expires_at"
            )

            .eq(
                "school_code",
                schoolCode
            )

            .maybeSingle();


    if (error) {

        console.error(
            "Admin announcement load error:",
            error
        );

        return;

    }


    if (!data) {

        textInput.value = "";
        expiryInput.value = "";

        return;

    }


    textInput.value =
        data.announcement_text || "";


    if (data.expires_at) {

        const expiry =
            new Date(
                data.expires_at
            );

        const localISO =
            new Date(
                expiry.getTime()
                -
                expiry.getTimezoneOffset() * 60000
            )
            .toISOString()
            .slice(0,16);

        expiryInput.value =
            localISO;

    }

}


/* =========================================================
   SAVE / UPDATE ANNOUNCEMENT
========================================================= */

async function saveSchoolAnnouncement() {

    const textInput =
        document.getElementById(
            "adminAnnouncementText"
        );

    const expiryInput =
        document.getElementById(
            "adminAnnouncementExpiry"
        );

    const status =
        document.getElementById(
            "announcementAdminStatus"
        );


    if (!textInput ||
        !expiryInput) {

        return;

    }


    const announcement =
        textInput.value.trim();

    const expiry =
        expiryInput.value;


    if (!announcement) {

        alert(
            "Please enter an announcement."
        );

        return;

    }


    if (!expiry) {

        alert(
            "Please select an expiry date and time."
        );

        return;

    }


    const expiryDate =
        new Date(expiry);


    if (
        isNaN(expiryDate.getTime())
    ) {

        alert(
            "Please enter a valid expiry date and time."
        );

        return;

    }


    if (
        expiryDate.getTime() <= Date.now()
    ) {

        alert(
            "The expiry time must be in the future."
        );

        return;

    }


    if (status) {

        status.style.color =
            "#555";

        status.textContent =
            "Updating announcement...";

    }


    try {

        const {
            error
        } =
            await supabaseClient

                .from("school_announcements")

                .upsert(
                    {
                        school_code:
                            schoolCode,

                        announcement_text:
                            announcement,

                        expires_at:
                            expiryDate.toISOString(),

                        updated_at:
                            new Date().toISOString()

                    },
                    {
                        onConflict:
                            "school_code"
                    }
                );


        if (error) {

            throw error;

        }


        if (status) {

            status.style.color =
                "green";

            status.textContent =
                "✓ Announcement updated successfully.";

        }


        /*
         * If the student dashboard is currently
         * visible in this same page, refresh it.
         */

        if (
            typeof loadSchoolAnnouncement ===
            "function"
        ) {

            await loadSchoolAnnouncement();

        }


    }
    catch (error) {

        console.error(
            "Save Announcement Error:",
            error
        );


        if (status) {

            status.style.color =
                "red";

            status.textContent =
                error.message ||
                "Unable to update announcement.";

        }

    }

}


/* =========================================================
   CLEAR ANNOUNCEMENT
========================================================= */

async function clearSchoolAnnouncement() {

    showTUPSConfirmation(

        "Clear the current announcement?",

        async function () {

            const status =
                document.getElementById(
                    "announcementAdminStatus"
                );


            try {

                const {
                    error
                } =
                    await supabaseClient

                        .from("school_announcements")

                        .delete()

                        .eq(
                            "school_code",
                            schoolCode
                        );


                if (error) {

                    throw error;

                }


                const textInput =
                    document.getElementById(
                        "adminAnnouncementText"
                    );


                const expiryInput =
                    document.getElementById(
                        "adminAnnouncementExpiry"
                    );


                if (textInput) {
                    textInput.value = "";
                }


                if (expiryInput) {
                    expiryInput.value = "";
                }


                if (status) {

                    status.style.color =
                        "green";

                    status.textContent =
                        "✓ Announcement cleared.";

                }


                if (
                    typeof loadSchoolAnnouncement ===
                    "function"
                ) {

                    await loadSchoolAnnouncement();

                }

            }

            catch (error) {

                console.error(
                    "Clear Announcement Error:",
                    error
                );


                if (status) {

                    status.style.color =
                        "red";

                    status.textContent =
                        error.message ||
                        "Unable to clear announcement.";

                }

            }

        },

        function () {

            // User cancelled.
            // Do nothing.

        }

    );

}

/* =========================================================
   OPEN ADVERTISEMENT UPLOAD
========================================================= */

function openAdvertisementUpload() {

  const area =
    document.getElementById(
      "advertisementUploadArea"
    );

  if (area) {

    area.style.display =
      "block";

  }

}


/* =========================================================
   CLOSE ADVERTISEMENT UPLOAD
========================================================= */

function closeAdvertisementUpload() {

  const area =
    document.getElementById(
      "advertisementUploadArea"
    );

  if (area) {

    area.style.display =
      "none";

  }

}

/* =========================================================
   LOAD ADVERTISEMENTS
========================================================= */

async function loadAdvertisements() {

  const container =
    document.getElementById(
      "advertisementsList"
    );

  if (!container) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient

      .from(
        "school_communications"
      )

      .select("*")

      .eq(
        "school_code",
        schoolCode
      )

      .eq(
        "content_type",
        "advertisement"
      )

      .order(
        "display_order",
        {
          ascending:true
        }
      );


  if (error) {

    console.error(
      "Load Advertisements Error:",
      error
    );

    container.innerHTML = `

      <p
        style="
          color:red;
        "
      >
        Unable to load advertisements.
      </p>

    `;

    return;

  }


  if (!data || !data.length) {

    container.innerHTML = `

      <div
        style="
          padding:30px;
          text-align:center;
          border:1px dashed #ccc;
          border-radius:10px;
          color:#777;
        "
      >

        No advertisements uploaded yet.

      </div>

    `;

    return;

  }


  container.innerHTML = `

    <div
      style="
        overflow-x:auto;
      "
    >

      <table
        class="admin-table"
      >

        <thead>

          <tr>

            <th>Preview</th>

            <th>Title</th>

            <th>Status</th>

            <th>Order</th>

            <th>Date Added</th>

            <th>Action</th>

          </tr>

        </thead>


        <tbody>

          ${data.map(
            advert => {

              const image =
                advert.image_url
                  ? `
                    <img
                      src="${advert.image_url}"
                      style="
                        width:120px;
                        height:70px;
                        object-fit:cover;
                        border-radius:6px;
                      "
                    >
                  `
                  : "No preview";


              const status =
                advert.is_active
                  ? "Active"
                  : "Inactive";


              return `

                <tr>

                  <td>
                    ${image}
                  </td>


                  <td>
                    ${
                      advert.title ||
                      "Untitled Advertisement"
                    }
                  </td>


                  <td>
                    ${status}
                  </td>


                  <td>
                    ${advert.display_order}
                  </td>


                  <td>
                    ${
                      advert.created_at
                        ? new Date(
                            advert.created_at
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : "—"
                    }
                  </td>


                  <td>

                    <button
                      type="button"
                      class="admin-btn"
                      onclick="
                        toggleAdvertisementStatus(
                          '${advert.id}',
                          ${advert.is_active}
                        )
                      "
                    >
                      ${
                        advert.is_active
                          ? "Deactivate"
                          : "Activate"
                      }
                    </button>


                    <button
                      type="button"
                      class="admin-btn"
                      onclick="
                        deleteAdvertisement(
    '${advert.id}',
    '${advert.storage_path || ""}'
)
                      "
                    >
                      🗑 Delete
                    </button>

<button
  type="button"
  class="admin-btn"
  onclick="
    moveAdvertisementUp(
      '${advert.id}',
      ${advert.display_order}
    )
  "
>
  ↑
</button>


<button
  type="button"
  class="admin-btn"
  onclick="
    moveAdvertisementDown(
      '${advert.id}',
      ${advert.display_order}
    )
  "
>
  ↓
</button>
                  </td>

                </tr>

              `;

            }

          ).join("")}

        </tbody>

      </table>

    </div>

  `;

}

/* =========================================================
   UPLOAD ADVERTISEMENT
========================================================= */
async function uploadAdvertisement() {

    const titleInput =
        document.getElementById(
            "advertisementTitle"
        );

    const fileInput =
        document.getElementById(
            "advertisementFile"
        );

    const status =
        document.getElementById(
            "advertisementUploadStatus"
        );


    const title =
        (
            titleInput?.value ||
            ""
        ).trim();


    const file =
        fileInput?.files?.[0];


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!file) {

        if (status) {

            status.style.color =
                "red";

            status.textContent =
                "Please select an advertisement image.";

        }

        return;

    }


    if (!schoolCode) {

        if (status) {

            status.style.color =
                "red";

            status.textContent =
                "School code is unavailable.";

        }

        return;

    }


    /* -----------------------------------------
       SHOW UPLOAD STATUS
    ----------------------------------------- */

    if (status) {

        status.style.color =
            "#000066";

        status.textContent =
            "Uploading advertisement...";

    }


    try {

        /* -----------------------------------------
           CONVERT IMAGE TO BASE64
        ----------------------------------------- */

        const base64Data =
            await new Promise(
                (resolve, reject) => {

                    const reader =
                        new FileReader();


                    reader.onload =
                        () => {

                            resolve(
                                reader.result
                            );

                        };


                    reader.onerror =
                        reject;


                    reader.readAsDataURL(
                        file
                    );

                }
            );


        /* -----------------------------------------
           SEND TO APPS SCRIPT
        ----------------------------------------- */

/* -----------------------------------------
   Upload directly to Supabase Storage
----------------------------------------- */

const storagePath =
`${schoolCode}/advertisements/${Date.now()}_${file.name}`;

const {
    data: uploadData,
    error: uploadError
} =
await supabaseClient
.storage
.from("school-media")
.upload(
    storagePath,
    file,
    {
        upsert:true
    }
);

if(uploadError){

    throw uploadError;

}

/* -----------------------------------------
   Public URL
----------------------------------------- */

const {
    data: publicUrlData
} =
supabaseClient
.storage
.from("school-media")
.getPublicUrl(storagePath);

const imageUrl =
publicUrlData.publicUrl;


        /* -----------------------------------------
           DETERMINE DISPLAY ORDER
        ----------------------------------------- */

        const {
            data: existingAds,
            error: orderError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .select(
                    "display_order"
                )

                .eq(
                    "school_code",
                    schoolCode
                )

                .eq(
                    "content_type",
                    "advertisement"
                )
                .order(
                    "display_order",
                    {
                        ascending:
                            false
                    }
                )
                .limit(1);


        if (orderError) {

            throw orderError;

        }


        const nextOrder =
            existingAds &&
            existingAds.length
                ? (
                    Number(
                        existingAds[0]
                            .display_order
                    ) || 0
                ) + 1
                : 1;


        /* -----------------------------------------
           SAVE METADATA TO SUPABASE
        ----------------------------------------- */

      const {
    error: insertError
} =
    await supabaseClient

        .from(
            "school_communications"
        )

        .insert({

            school_code:
                schoolCode,

            content_type:
                "advertisement",

            title:
                title ||
                file.name,
image_url:
imageUrl,

storage_path:
storagePath,
            is_active:
                true,

            display_order:
                nextOrder

        });

        if (insertError) {

            throw insertError;

        }


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        if (status) {

            status.style.color =
                "green";

            status.textContent =
                "Advertisement uploaded successfully.";

        }


        /* Clear form */

        if (titleInput) {

            titleInput.value =
                "";

        }


        if (fileInput) {

            fileInput.value =
                "";

        }


        /* Refresh advertisement list */

        await loadAdvertisements();


    }
    catch (error) {

        console.error(
            "Advertisement Upload Error:",
            error
        );


        if (status) {

            status.style.color =
                "red";

            status.textContent =
                error.message ||
                "Unable to upload advertisement.";

        }

    }

}


/* =========================================================
   DELETE ADVERTISEMENT
========================================================= */

async function deleteAdvertisement(
    advertisementId,
    storagePath
) {

    showTUPSConfirmation(

        "Are you sure you want to delete this advertisement?",

        async function () {

            try {

                // ==========================================
                // VALIDATION
                // ==========================================

                if (!schoolCode) {

                    throw new Error(
                        "School code is unavailable."
                    );

                }

                if (!advertisementId) {

                    throw new Error(
                        "Advertisement ID is missing."
                    );

                }


                // ==========================================
                // DELETE IMAGE FROM SUPABASE STORAGE
                // Bucket: school-media
                // ==========================================

                if (storagePath) {

                    console.log(
                        "Deleting advertisement file:",
                        storagePath
                    );

                    const {
                        error: storageError
                    } =
                        await supabaseClient
                            .storage
                            .from("school-media")
                            .remove([
                                storagePath
                            ]);


                    if (storageError) {

                        console.error(
                            "Supabase Storage Delete Error:",
                            storageError
                        );

                        throw storageError;

                    }

                } else {

                    console.warn(
                        "No storage path found. Skipping storage deletion."
                    );

                }


                // ==========================================
                // DELETE ADVERTISEMENT DATABASE RECORD
                // ==========================================

                const {
                    error: deleteError
                } =
                    await supabaseClient

                        .from(
                            "school_communications"
                        )

                        .delete()

                        .eq(
                            "id",
                            advertisementId
                        )

                        .eq(
                            "school_code",
                            schoolCode
                        );


                if (deleteError) {

                    console.error(
                        "Advertisement Database Delete Error:",
                        deleteError
                    );

                    throw deleteError;

                }


                // ==========================================
                // REFRESH ADVERTISEMENT LIST
                // ==========================================

                await loadAdvertisements();


                // ==========================================
                // SUCCESS MESSAGE
                // ==========================================

                alert(
                    "Advertisement deleted successfully."
                );


            }

            catch (error) {

                console.error(
                    "Delete Advertisement Error:",
                    error
                );


                alert(
                    error?.message ||
                    "Unable to delete advertisement."
                );

            }

        },

        function () {

            // User cancelled the deletion.
            // Do nothing.

        }

    );

}


/* =========================================================
   MOVE ADVERTISEMENT UP
========================================================= */

async function moveAdvertisementUp(
    advertisementId,
    currentOrder
) {

    try {

        if (
            currentOrder <= 1
        ) {

            return;

        }


        /*
         * Find the advertisement immediately
         * above this one.
         */

        const {
            data: previousAds,
            error: previousError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .select(
                    "id, display_order"
                )

                .eq(
                    "school_code",
                    schoolCode
                )

                .eq(
                    "content_type",
                    "advertisement"
                )

                .eq(
                    "display_order",
                    currentOrder - 1
                )

                .limit(1);


        if (previousError) {

            throw previousError;

        }


        if (
            !previousAds ||
            !previousAds.length
        ) {

            return;

        }


        const previousId =
            previousAds[0].id;


        /*
         * Temporarily move current item
         * to a safe negative order.
         */

        let {
            error: tempError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    display_order:
                        -999999

                })

                .eq(
                    "id",
                    advertisementId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (tempError) {

            throw tempError;

        }


        /*
         * Move previous item down.
         */

        let {
            error: downError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    display_order:
                        currentOrder

                })

                .eq(
                    "id",
                    previousId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (downError) {

            throw downError;

        }


        /*
         * Put current item in previous position.
         */

        let {
            error: finalError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    display_order:
                        currentOrder - 1,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    advertisementId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (finalError) {

            throw finalError;

        }


        await loadAdvertisements();

    }
    catch (error) {

        console.error(
            "Move Advertisement Up Error:",
            error
        );

        alert(
            error.message ||
            "Unable to move advertisement."
        );

    }

}

let announcementCountdownTimer = null;


/* =========================================================
   LOAD SCHOOL ANNOUNCEMENT
========================================================= */

async function loadSchoolAnnouncement() {

    const announcementElement =
        document.getElementById("announcements");

    const countdownElement =
        document.getElementById(
            "announcementCountdown"
        );


    if (!announcementElement) {
        return;
    }


    // Stop any previous countdown

    if (announcementCountdownTimer) {

        clearInterval(
            announcementCountdownTimer
        );

        announcementCountdownTimer = null;

    }


    if (!schoolCode) {

        announcementElement.textContent =
            "No announcements available.";

        if (countdownElement) {
            countdownElement.textContent =
                "00:00:00";
        }

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from("school_announcements")

            .select(
                "announcement_text, expires_at"
            )

            .eq(
                "school_code",
                schoolCode
            )

            .maybeSingle();


    if (error) {

        console.error(
            "Announcement loading error:",
            error
        );

        announcementElement.textContent =
            "No announcements available.";

        if (countdownElement) {
            countdownElement.textContent =
                "00:00:00";
        }

        return;

    }


    // No announcement record

    if (!data) {

        announcementElement.textContent =
            "No announcements available.";

        if (countdownElement) {
            countdownElement.textContent =
                "00:00:00";
        }

        return;

    }


    const expiryTime =
        new Date(data.expires_at).getTime();


    const now =
        Date.now();


    // Already expired

    if (
        !expiryTime ||
        expiryTime <= now
    ) {

        announcementElement.textContent =
            "No announcements available.";

        if (countdownElement) {
            countdownElement.textContent =
                "00:00:00";
        }

        return;

    }


    // Display announcement

    announcementElement.textContent =
        data.announcement_text || "";


    // Start countdown

    function updateAnnouncementCountdown() {

        const remaining =
            expiryTime - Date.now();


        if (remaining <= 0) {

            clearInterval(
                announcementCountdownTimer
            );

            announcementCountdownTimer =
                null;


            announcementElement.textContent =
                "No announcements available.";


            if (countdownElement) {

                countdownElement.textContent =
                    "00:00:00";

            }

            return;

        }


        const totalSeconds =
            Math.floor(
                remaining / 1000
            );


        const hours =
            Math.floor(
                totalSeconds / 3600
            );


        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );


        const seconds =
            totalSeconds % 60;


        if (countdownElement) {

            countdownElement.textContent =

                String(hours)
                    .padStart(2, "0")
                + ":" +

                String(minutes)
                    .padStart(2, "0")
                + ":" +

                String(seconds)
                    .padStart(2, "0");

        }

    }


    updateAnnouncementCountdown();


    announcementCountdownTimer =
        setInterval(
            updateAnnouncementCountdown,
            1000
        );

}

/* =========================================================
   MOVE ADVERTISEMENT DOWN
========================================================= */

async function moveAdvertisementDown(
    advertisementId,
    currentOrder
) {

    try {

        /*
         * Find the advertisement immediately
         * below this one.
         */

        const {
            data: nextAds,
            error: nextError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .select(
                    "id, display_order"
                )

                .eq(
                    "school_code",
                    schoolCode
                )

                .eq(
                    "content_type",
                    "advertisement"
                )

                .eq(
                    "display_order",
                    currentOrder + 1
                )

                .limit(1);


        if (nextError) {

            throw nextError;

        }


        if (
            !nextAds ||
            !nextAds.length
        ) {

            return;

        }


        const nextId =
            nextAds[0].id;


        /*
         * Temporarily move current item
         * to a safe negative order.
         */

        let {
            error: tempError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    display_order:
                        -999999

                })

                .eq(
                    "id",
                    advertisementId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (tempError) {

            throw tempError;

        }


        /*
         * Move next item up.
         */

        let {
            error: upError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    display_order:
                        currentOrder

                })

                .eq(
                    "id",
                    nextId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (upError) {

            throw upError;

        }


        /*
         * Put current item in next position.
         */

        let {
            error: finalError
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    display_order:
                        currentOrder + 1,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    advertisementId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (finalError) {

            throw finalError;

        }


        await loadAdvertisements();

    }
    catch (error) {

        console.error(
            "Move Advertisement Down Error:",
            error
        );

        alert(
            error.message ||
            "Unable to move advertisement."
        );

    }

}

/* =========================================================
   TOGGLE ADVERTISEMENT STATUS
========================================================= */

async function toggleAdvertisementStatus(
    advertisementId,
    currentStatus
) {

    try {

        const {
            error
        } =
            await supabaseClient

                .from(
                    "school_communications"
                )

                .update({

                    is_active:
                        !currentStatus,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    advertisementId
                )

                .eq(
                    "school_code",
                    schoolCode
                );


        if (error) {

            throw error;

        }


        /* -----------------------------------------
           REFRESH LIST
        ----------------------------------------- */

        await loadAdvertisements();


    }
    catch (error) {

        console.error(
            "Toggle Advertisement Status Error:",
            error
        );


        alert(
            error.message ||
            "Unable to update advertisement status."
        );

    }

}

async function syncStudentsFromSheet() {

  const department =
    document.getElementById(
      "studentDepartment"
    ).value;

  if (!department) {

    alert(
      "Select department first"
    );

    return;

  }

  const formData =
    new URLSearchParams();

  formData.append(
    "action",
    "syncStudents"
  );

  formData.append(
    "schoolCode",
    schoolCode
  );

  formData.append(
    "department",
    department
  );

  const response =
  await fetch(
    "https://script.google.com/macros/s/AKfycbzRotvo9tm_FHSkGKqzdgyEjKYQix0YgI1Db4viY3eJ0V3dvXdT_I5Jgy39P5Zt8zjxaA/exec",
    {
      method: "POST",
      body: formData
    }
  );

  const result =
    await response.json();
  console.log(
  "SYNC RESPONSE:",
  result
);

  if (!result.success) {

    alert(
      result.error
    );

    return;

  }

  alert(
    `${result.synced} students synced`
  );

  loadStudentsTable(
    department
  );

}


async function loadStudentsTable(
  department
) {

  console.log(
  "LOAD STUDENTS FUNCTION RUNNING"
);

console.log(
  "Department Selected:",
  department
);

const {
  data,
  error
} =
  await supabaseClient
    .from("students")
    .select(`
id,
student_name,
class,
reg_no
`)
    .eq(
      "school_code",
      schoolCode
    )
    .eq(
      "department",
      department
    );
	console.log(
  "FILTERED STUDENTS:",
  data
);

console.log(
  "RAW DATA:",
  data
);

console.log(
  "TOTAL STUDENTS:",
  data?.length
);

console.log(
  "Students Returned:",
  data
);

console.log(
  "Department:",
  department
);

console.log(
  "School Code:",
  schoolCode
);

console.log(
  "Query Error:",
  error
);
  if (error) {

    alert(
      error.message
    );

    return;

  }

  let html = `

    <table
      class="students-table"
    >

      <tr>

        <th>
          Student Name
        </th>

        <th>
          Class
        </th>

        <th>
          Actions
        </th>

      </tr>

  `;

  data.forEach(student => {

    html += `

      <tr>

        <td>

          ${student.student_name}

        </td>

        <td>

          ${student.class || ""}

        </td>

        <td>

 <div class="action-buttons">

  <button
    onclick="
      viewStudentInfo(
        '${student.id}'
      )
    "
  >
    Info
  </button>

  <button
    onclick="
      deleteStudent(
        '${student.id}'
      )
    "
  >
    Delete
  </button>

  <button
    onclick="
      openTermReport(
        '${student.id}'
      )
    "
  >
    Result
  </button>

</div>

</td>

      </tr>

    `;

  });

  html +=
    "</table>";

  document.getElementById(
    "studentsTableContainer"
  ).innerHTML =
    html;

}


async function deleteStudent(studentId) {

  const confirmDelete = confirm(
    "Are you sure you want to delete this student from Supabase?"
  );

  if (!confirmDelete) {
    return;
  }

  const department =
    document.getElementById(
      "studentDepartment"
    ).value;

  if (!department) {
    alert(
      "Select department first."
    );
    return;
  }

  const {
    error
  } =
    await supabaseClient
      .from("students")
      .delete()
      .eq(
        "id",
        studentId
      )
      .eq(
        "school_code",
        schoolCode
      )
      .eq(
        "department",
        department
      );

  if (error) {

    console.error(
      "DELETE STUDENT ERROR:",
      error
    );

    alert(
      "Unable to delete student: " +
      error.message
    );

    return;
  }

  alert(
    "Student deleted successfully."
  );

  await loadStudentsTable(
    department
  );
}

function filterStudentsTable() {

  const searchValue =
    document
      .getElementById(
        "studentSearch"
      )
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      ".students-table tr"
    );

  rows.forEach(
    (
      row,
      index
    ) => {

      if (
        index === 0
      ) return;

      const rowText =
        row.innerText
          .toLowerCase();

      row.style.display =
        rowText.includes(
          searchValue
        )
          ? ""
          : "none";

    }
  );

}

async function viewStudentInfo(id) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

console.log(
  "PASSPORT URL:",
  data.passport_url
  );

let passportUrl = "";

if (
  data.passport_url
) {

  const fileId =
    data.passport_url
      .split("id=")[1];

  passportUrl =
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;

}
  document.getElementById(
    "adminContent"
  ).innerHTML = `

   <div
  class="student-info-card"
>

<div
  style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:15px;
  "
>

  <div
    style="
      display:flex;
      align-items:center;
      gap:12px;
    "
  >

    <img
      src="${passportUrl}"
      class="student-passport"
    >

    <h3
      style="margin:0;"
    >
      ${data.student_name}
    </h3>

  </div>

  <button
    onclick="showStudentsFees()"
    style="
      border:none;
      background:none;
      font-size:24px;
      cursor:pointer;
      color:#666;
      font-weight:bold;
    "
  >
    ✕
  </button>

</div>

      <table
        class="student-info-table"
      >

        <tr>
          <td><strong>Class</strong></td>
          <td>${data.class || ""}</td>
        </tr>

        <tr>
          <td><strong>Parent Contact 1</strong></td>
          <td>
            ${
              data.parent_contact1 || ""
            }
          </td>
        </tr>

        <tr>
          <td><strong>Parent Contact 2</strong></td>
          <td>
            ${
              data.parent_contact2 || ""
            }
          </td>
        </tr>

        <tr>
          <td><strong>Address</strong></td>
          <td>
            ${data.address || ""}
          </td>
        </tr>

        <tr>
          <td>
            <strong>
              Total Fees Paid
            </strong>
          </td>
          <td>

            ₦${(
              data.total_fees_paid || 0
            ).toLocaleString()}

          </td>
        </tr>

      </table>

      <br>

      <button
  class="admin-btn"
  onclick="
    openStudentUpdateForm(
      ${data.id}
    )
  "
>
  Update Student Info
</button>

    </div>

  `;

}

window.viewStudentInfo =
  viewStudentInfo;
  
async function openStudentUpdateForm(
  studentId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "id",
        studentId
      )
      .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

  document.getElementById(
    "adminContent"
  ).innerHTML = `

<div class="student-update-form">

    <h3>
      Update Student Info
    </h3>

    <br>

    <label>
      Parent Contact 1
    </label>

    <input
      type="text"
      id="parentContact1"
      value="${
        data.parent_contact1 || ""
      }"
    >

    <br><br>

    <label>
      Parent Contact 2
    </label>

    <input
      type="text"
      id="parentContact2"
      value="${
        data.parent_contact2 || ""
      }"
    >

    <br><br>

    <label>
      Address
    </label>

    <textarea
      id="studentAddress"
    >${
      data.address || ""
    }</textarea>

    <br><br>

    <label>
      New Amount Paid
    </label>

    <input
      type="number"
      id="newAmountPaid"
      value="0"
    >

    <br><br>

    <div class="student-form-buttons">

      <button
        type="button"
        id="termFeesUpdateBtn"
        class="admin-btn"
        onclick="
  processTermFeesPayment(
    ${studentId}
  )
"
      >
        Update
      </button>

      <button
        type="button"
        class="admin-btn"
        onclick="
          openStudentUpdateForm(
            ${studentId}
          )
        "
      >
        Clear
      </button>

    </div>

  </div>`;

}

async function processTermFeesPayment(
  studentId
) {

  const button =
    document.getElementById(
      "termFeesUpdateBtn"
    );

  if (!button) {
    return;
  }

  // Prevent another click while processing
  if (button.disabled) {
    return;
  }

  // Lock button immediately
  button.disabled = true;

  button.textContent =
    "Processing...";

  try {

    // Run the existing payment/update function
    await saveStudentInfo(
      studentId
    );

  }

  finally {

    // Unlock only after saveStudentInfo()
    // has completely finished, including
    // dismissal of the success alert
    button.disabled = false;

    button.textContent =
      "Update";

  }

}

async function saveStudentInfo(
  studentId
) {

  console.log(
    "SAVE BUTTON CLICKED",
    studentId
  );

  const parent1 =
    document.getElementById(
      "parentContact1"
    ).value.trim();

  const parent2 =
    document.getElementById(
      "parentContact2"
    ).value.trim();

  const address =
    document.getElementById(
      "studentAddress"
    ).value.trim();

  const newAmount =
    Number(
      document.getElementById(
        "newAmountPaid"
      ).value
    ) || 0;

  console.log(
    "Parent1 Value:",
    parent1
  );

  console.log(
    "Parent2 Value:",
    parent2
  );

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select(
        "total_fees_paid"
      )
      .eq(
        "id",
        studentId
      )
      .single();
	  
   const {
  data: studentData,
  error: studentError
} =
await supabaseClient
  .from("students")
  .select(
    "student_name,department,class,reg_no"
  )
  .eq(
    "id",
    studentId
  )
  .single();
  
if (studentError) {

    alert(
        studentError.message
    );

    return;

}

  if (error) {

    alert(
      error.message
    );

    return;

  }

// ========================================
// PAYMENT ALLOCATION ENGINE
// ========================================

const currentTotal =
  Number(data.total_fees_paid) || 0;

let appliedToOutstanding = 0;
let appliedToCurrentTerm = 0;
let remarks = "Current Term Payment";

// Today's payment
let amountRemaining = newAmount;

// ----------------------------------------
// CHECK PREVIOUS TERM OUTSTANDING
// ----------------------------------------

const {
  data: previousOutstanding
} = await supabaseClient
  .from("student_previous_outstanding_fees")
  .select("*")
  .eq("school_code", currentSchoolCode)
  .eq("reg_no", studentData.reg_no)
  .gt("remaining_amount", 0)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

// ----------------------------------------
// IF STUDENT HAS PREVIOUS TERM DEBT
// ----------------------------------------

if (previousOutstanding) {

  let previousDebt =
    Number(previousOutstanding.remaining_amount);

  // Entire payment goes to previous debt

  if (amountRemaining <= previousDebt) {

    await supabaseClient
      .from("student_previous_outstanding_fees")
      .update({

        remaining_amount:
          previousDebt - amountRemaining,

        status:
          previousDebt - amountRemaining === 0
            ? "Paid"
            : "Outstanding"

      })
      .eq("id", previousOutstanding.id);

    appliedToOutstanding =
      amountRemaining;

    appliedToCurrentTerm = 0;

    amountRemaining = 0;

    remarks =
      "Previous Term Outstanding Payment";

  }

  // Payment clears previous debt completely

  else {

    await supabaseClient
      .from("student_previous_outstanding_fees")
      .update({

        remaining_amount: 0,

        status: "Paid"

      })
      .eq("id", previousOutstanding.id);

    appliedToOutstanding =
      previousDebt;

    amountRemaining =
      amountRemaining - previousDebt;

    appliedToCurrentTerm =
      amountRemaining;

    remarks =
      "Outstanding Cleared. Balance Applied To Current Term";

  }

}

// ----------------------------------------
// NO PREVIOUS TERM DEBT
// ----------------------------------------

else {

  appliedToCurrentTerm =
    amountRemaining;

  appliedToOutstanding = 0;

  remarks =
    "Current Term Payment";

}

// ----------------------------------------
// CURRENT TERM TOTAL
// ----------------------------------------

const updatedTotal =
  currentTotal +
  appliedToCurrentTerm;
  
  // ========================================
// UPDATE CURRENT TERM OUTSTANDING
// ========================================

if (appliedToCurrentTerm > 0) {

    const {

        data: currentOutstanding

    } = await supabaseClient

        .from("student_outstanding_fees")

        .select("*")

        .eq("school_code", currentSchoolCode)

        .eq("reg_no", studentData.reg_no)

        .maybeSingle();

    if (currentOutstanding) {

       const currentRemaining =
    Number(currentOutstanding.remaining_amount) || 0;

const newRemaining = Math.max(
    0,
    currentRemaining - appliedToCurrentTerm
);

await supabaseClient
    .from("student_outstanding_fees")
    .update({

        remaining_amount: newRemaining,

        status:
            newRemaining === 0
                ? "Paid"
                : "Outstanding"

    })
    .eq("id", currentOutstanding.id);
    }

}

// ========================================
// SAVE CURRENT TERM PAYMENT
// ========================================

// ========================================
// SAVE PAYMENT RECORDS
// ========================================

if (newAmount > 0) {

    console.log("Saving payment into student_payments...");

    // ----------------------------
    // STEP 1: Save Current Payment
    // ----------------------------

    const {

        data: paymentData,

        error: paymentError

    } = await supabaseClient

        .from("student_payments")

        .insert({

            student_id: studentId,

            school_code: currentSchoolCode,

            department: studentData.department,

            class: studentData.class,

            student_name: studentData.student_name,

            reg_no: studentData.reg_no,

            amount_paid: newAmount

        })

        .select();

    console.log(
        "Student Payments Insert:",
        paymentData
    );

    console.log(
        "Student Payments Error:",
        paymentError
    );

    if (paymentError) {

        alert(
            JSON.stringify(paymentError)
        );

        throw paymentError;

    }
}

// ----------------------------
// SAVE PAYMENT HISTORY
// (Always save every payment)
// ----------------------------

if (newAmount > 0) {

    const {

        data: historyData,

        error: historyError

    } = await supabaseClient

        .from("payment_history")

        .insert({

            student_id: studentId,

            school_code: currentSchoolCode,

            department: studentData.department,

            class: studentData.class,

            student_name: studentData.student_name,

            reg_no: studentData.reg_no,

            amount_paid: newAmount,

            applied_to_outstanding: appliedToOutstanding,

            applied_to_current_term: appliedToCurrentTerm,

            total_paid: updatedTotal,

            remarks: remarks

        });

    console.log(
        "PAYMENT HISTORY INSERT:",
        historyData
    );

    console.log(
        "PAYMENT HISTORY ERROR:",
        historyError
    );

    if (historyError) {

        throw historyError;

    }

}
   



// ----------------------------------------
// UPDATE STUDENT RECORD
// ----------------------------------------

const studentUpdate = {

    parent_contact1: parent1,

    parent_contact2: parent2,

    address: address

};

// ONLY increase total fees when current term received money

if (appliedToCurrentTerm > 0) {

    studentUpdate.total_fees_paid = updatedTotal;

}

const {

    error: updateError

} = await supabaseClient

    .from("students")

    .update(studentUpdate)

    .eq("id", studentId);
  
  console.log(
    "Update Error:",
    updateError
  );

  if (updateError) {

    alert(
      updateError.message
    );

    return;

  }

  const {
    data: verifyData
  } =
    await supabaseClient
      .from("students")
      .select(
        "parent_contact1,parent_contact2"
      )
      .eq(
        "id",
        studentId
      )
      .single();

  console.log(
    "After Update:",
    verifyData
  );

  alert(
    "Student Updated Successfully"
  );

  viewStudentInfo(
    studentId
  );

}

window.openStudentUpdateForm =
  openStudentUpdateForm;

window.saveStudentInfo =
  saveStudentInfo;


async function loadPaymentHistory() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>
      📜 Payment History
    </h3>

    <p>
      Loading payment history...
    </p>

  `;

  const {
    data,
    error
  } =
  await supabaseClient

    .from(
      "payment_history"
    )

    .select("*")

    .eq(
      "school_code",
      currentSchoolCode
    )

    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    document.getElementById(
      "adminContent"
    ).innerHTML = `

      <h3>
        📜 Payment History
      </h3>

      <p>
        ${error.message}
      </p>

    `;

    return;

  }

  // Store the complete dataset ONLY ONCE
paymentHistoryMasterData = data;

// Working dataset
paymentHistoryData = data;

// Render
renderPaymentHistory(data);

}

function renderPaymentHistory(
  data
) {

	const searchValue =
document.getElementById("historySearch")?.value || "";

const selectedDept =
document.getElementById("historyDepartment")?.value || "";

const selectedClass =
document.getElementById("historyClass")?.value || "";


	const totalAmount =

data.reduce(

  (sum, row) =>

    sum +

    Number(

      row.amount_paid || 0

    ),

  0

);

const totalTransactions =

data.length;

const studentsPaid =

new Set(

  data.map(

    row => row.reg_no

  )

).size;




const totalPages = Math.ceil(

  paymentHistoryData.length /

  paymentHistoryRowsPerPage

);

if (

paymentHistoryCurrentPage >

totalPages

){

paymentHistoryCurrentPage = 1;

}

const start =

(paymentHistoryCurrentPage - 1)

*

paymentHistoryRowsPerPage;

const end =

start +

paymentHistoryRowsPerPage;

const pageData =

paymentHistoryData.slice(

start,

end

);
  let html = `

<h3>

📜 Payment History

</h3>

<div class="payment-summary">

<div class="summary-card">

<h4>Total Payments</h4>

<p>

₦${totalAmount.toLocaleString()}

</p>

</div>

<div class="summary-card">

<h4>Transactions</h4>

<p>

${totalTransactions}

</p>

</div>

<div class="summary-card">

<h4>Students Paid</h4>

<p>

${studentsPaid}

</p>

</div>

</div>

<div class="payment-filters">

  <input
    type="text"
    id="historySearch"
    placeholder="🔍 Search Student / Reg No..."
    onkeyup="filterPaymentHistory()"
  >

  <select
    id="historyDepartment"
    onchange="filterPaymentHistory()"
  >
    <option value="">
      All Departments
    </option>
  </select>

  <select
    id="historyClass"
    onchange="filterPaymentHistory()"
  >
    <option value="">
      All Classes
    </option>
  </select>

</div>
<div class="payment-quick-filters">

<button onclick="historyToday()">
Today
</button>

<button onclick="historyThisWeek()">
Week
</button>

<button onclick="historyThisMonth()">
Month
</button>

<button onclick="historyThisTerm()">
Term
</button>

<button onclick="historyThisSession()">
Session
</button>

<button onclick="historyReset()">
Reset
</button>

</div>

  <table
    class="admin-table"
  >

    <thead>

      <tr>

        <th>Date</th>

        <th>Name</th>

        <th>Reg No</th>

        <th>Class</th>

        <th>Amount</th>

        <th>Remarks</th>

      </tr>

    </thead>

    <tbody>

  `;

  pageData.forEach(

    row => {

      html += `

      <tr>

        <td>

          ${new Date(

            row.created_at

          ).toLocaleString()}

        </td>

        <td>

          ${row.student_name}

        </td>

        <td>

          ${row.reg_no}

        </td>

        <td>

          ${row.class}

        </td>

        <td>

          ₦${Number(

            row.amount_paid

          ).toLocaleString()}

        </td>

        <td>

          ${row.remarks}

        </td>

      </tr>

      `;

    }

  );

  html += `

    </tbody>

  </table>

  `;
  
 html += `

<div class="payment-pagination">

<button

onclick="previousPaymentPage()"

${paymentHistoryCurrentPage===1?

"disabled":""}

>

◀ Previous

</button>

<span>

Page

${paymentHistoryCurrentPage}

of

${Math.max(totalPages,1)}

</span>

<button

onclick="nextPaymentPage()"

${paymentHistoryCurrentPage>=totalPages?

"disabled":""}

>

Next ▶

</button>

</div>

`;

  document.getElementById(
    "adminContent"
  ).innerHTML = html;
  
  document.getElementById("historySearch").value = searchValue;
document.getElementById("historyDepartment").value = selectedDept;
document.getElementById("historyClass").value = selectedClass;

// Return focus to the search box
document.getElementById("historySearch").focus();

// Place cursor at the end of the text
document.getElementById("historySearch").setSelectionRange(
    searchValue.length,
    searchValue.length
);

  populateHistoryFilters(
  data
    );
}

function historyToday(){

    paymentHistoryFilter = "today";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisWeek(){

    paymentHistoryFilter = "week";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisMonth(){

    paymentHistoryFilter = "month";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisTerm(){

    paymentHistoryFilter = "term";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyThisSession(){

    paymentHistoryFilter = "session";

    paymentHistoryCurrentPage = 1;

    filterPaymentHistory();

}

function historyReset(){

    paymentHistoryFilter = "all";

    paymentHistoryCurrentPage = 1;

    document.getElementById(
        "historySearch"
    ).value = "";

    document.getElementById(
        "historyDepartment"
    ).value = "";

    document.getElementById(
        "historyClass"
    ).value = "";

    paymentHistoryData = paymentHistoryMasterData;

    renderPaymentHistory(paymentHistoryMasterData);

}

function previousPaymentPage(){

if(

paymentHistoryCurrentPage>1

){

paymentHistoryCurrentPage--;

renderPaymentHistory(

paymentHistoryData

);

}

}

function nextPaymentPage(){

const totalPages=

Math.ceil(

paymentHistoryData.length/

paymentHistoryRowsPerPage

);

if(

paymentHistoryCurrentPage<totalPages

){

paymentHistoryCurrentPage++;

renderPaymentHistory(

paymentHistoryData

);

}

}

function filterPaymentHistory() {

  const keyword =
    document
      .getElementById(
        "historySearch"
      )
      .value
      .toLowerCase();

  const dept =
    document.getElementById(
      "historyDepartment"
    ).value;

  const cls =
    document.getElementById(
      "historyClass"
    ).value;

  const filtered =
    paymentHistoryMasterData.filter(
      row => {

        const matchesSearch =

          row.student_name
            .toLowerCase()
            .includes(keyword)

          ||

          row.reg_no
            .toLowerCase()
            .includes(keyword);

        const matchesDept =

          !dept ||

          row.department === dept;

        const matchesClass =

          !cls ||

          row.class === cls;


let matchesDate = true;

const paymentDate =

new Date(row.created_at);

const today = new Date();

switch(paymentHistoryFilter){

case "today":

    matchesDate =

        paymentDate.toDateString() ===

        today.toDateString();

break;

case "week":

    const weekStart = new Date(today);

    weekStart.setDate(

        today.getDate() -

        (today.getDay() === 0 ?

        6 :

        today.getDay()-1)

    );

    weekStart.setHours(0,0,0,0);

    matchesDate =

        paymentDate >= weekStart;

break;

case "month":

    matchesDate =

        paymentDate.getMonth() ===

        today.getMonth()

        &&

        paymentDate.getFullYear() ===

        today.getFullYear();

break;

case "all":

default:

    matchesDate = true;

}

        return(

matchesSearch &&

matchesDept &&

matchesClass &&

matchesDate

);

      }

    );
	
paymentHistoryData = filtered;

renderPaymentHistory(filtered);

  
}

function populateHistoryFilters(data) {

  const deptSelect =
    document.getElementById(
      "historyDepartment"
    );

  const classSelect =
    document.getElementById(
      "historyClass"
    );

  if (!deptSelect || !classSelect)
    return;

  const departments =

    [...new Set(
      data.map(
        x => x.department
      )
    )].sort();

  const classes =

    [...new Set(
      data.map(
        x => x.class
      )
    )].sort();

  deptSelect.innerHTML =
    `<option value="">
      All Departments
    </option>`;

  departments.forEach(

    d =>

      deptSelect.innerHTML +=

      `<option value="${d}">
        ${d}
      </option>`

  );

  classSelect.innerHTML =
    `<option value="">
      All Classes
    </option>`;

  classes.forEach(

    c =>

      classSelect.innerHTML +=

      `<option value="${c}">
        ${c}
      </option>`

  );

}

async function loadOutstandingPayments() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

  <h3>

  💰 Outstanding Fees

  </h3>

  <p>

  Loading Outstanding Fees...

  </p>

  `;

  // ------------------------
  // LOAD STUDENTS
  // ------------------------

  const {

    data: students,

    error: studentsError

  } = await supabaseClient

    .from("students")

    .select("*")

    .eq(
      "school_code",
      currentSchoolCode
    );

  if (studentsError) {

    document.getElementById(
      "adminContent"
    ).innerHTML =

      studentsError.message;

    return;

  }

  // ------------------------
  // LOAD CLASS FEES
  // ------------------------

  const {

    data: fees,

    error: feesError

  } = await supabaseClient

    .from("class_fees")

    .select("*")

    .eq(
      "school_code",
      currentSchoolCode
    );

  if (feesError) {

    document.getElementById(
      "adminContent"
    ).innerHTML =

      feesError.message;

    return;

  }

  renderOutstandingFees(

    students,

    fees

  );

}

async function showPreviousOutstandingFees() {

    const {

        data,

        error

    } = await supabaseClient

        .from("student_previous_outstanding_fees")

        .select("*")

        .eq(

            "school_code",

            currentSchoolCode

        )

        .order(

            "department",

            { ascending: true }

        )

        .order(

            "class_name",

            { ascending: true }

        )

        .order(

            "student_name",

            { ascending: true }

        );

    if (error) {

        console.error(error);

        alert(

            "Unable to load Previous Term Outstanding Fees."

        );

        return;

    }

    renderPreviousOutstandingFees(data);

}

function renderOutstandingFees(

  students,

  fees

){

let studentsOwing = 0;

let amountOwing = 0;

let fullyPaid = 0;

let partialPaid = 0;

const outstandingData = [];

students.forEach(student=>{

    const feeRecord =

    fees.find(

        fee =>

        fee.class_name ===

        student.class

    );

    const classFee =

    Number(

      feeRecord?.term_fee || 0

    );

    const paid =

    Number(

      student.total_fees_paid || 0

    );

    const outstanding =

    Math.max(

      classFee - paid,

      0

    );

	let status = "";

if (outstanding === 0) {

    status = "🟢 Paid";

}

else if (paid === 0) {

    status = "🔴 Outstanding";

}

else {

    status = "🟡 Partial";

}

outstandingData.push({

    // Existing UI fields
    student_name: student.student_name,

    reg_no: student.reg_no,

    department: student.department,

    class: student.class,

    termFee: classFee,

    paid: paid,

    outstanding: outstanding,

    status: status,

    // Snapshot fields
    school_code: student.school_code,

    student_id: student.id,

    class_name: student.class,

    session: "",

    term: "",

    original_amount: classFee,

    amount_paid: paid,

    remaining_amount: outstanding

});
    if(outstanding===0){

        fullyPaid++;

    }

    else{

        studentsOwing++;

        amountOwing += outstanding;

        if(paid>0){

            partialPaid++;

        }

    }

});

outstandingFeesMasterData = outstandingData;

outstandingFeesData = outstandingData;

let html = `

<h3>

💰 Current Term Outstanding Fees

</h3>

<div class="payment-summary">

<div class="summary-card">

<h4>

Students Owing

</h4>

<p>

${studentsOwing}

</p>

</div>

<div class="summary-card">

<h4>

Amount Owing

</h4>

<p>

₦${amountOwing.toLocaleString()}

</p>

</div>

<div class="summary-card">

<h4>

Fully Paid

</h4>

<p>

${fullyPaid}

</p>

</div>

<div class="summary-card">

<h4>

Partial Paid

</h4>

<p>

${partialPaid}

</p>

</div>

</div>

<div class="payment-filters">

<input
type="text"
id="outstandingSearch"
placeholder="🔍 Search Student / Reg No..."
onkeyup="filterOutstandingFees()"
>

<select
id="outstandingDepartment"
onchange="filterOutstandingFees()"
>

<option value="">

All Departments

</option>

</select>

<select
id="outstandingClass"
onchange="filterOutstandingFees()"
>

<option value="">

All Classes

</option>

</select>

<select
id="outstandingStatus"
onchange="filterOutstandingFees()"
>

<option value="">

All Status

</option>

<option value="Outstanding">

Outstanding

</option>

<option value="Partial">

Partial

</option>

<option value="Paid">

Paid

</option>

</select>

</div>

<div class="payment-quick-filters">

<button
class="admin-btn"
onclick="exportOutstandingFees()"
>

📥 Export Outstanding List

</button>

<button
class="admin-btn"
onclick="printOutstandingFees()"
>

🖨️ Print Outstanding List

</button>

</div>

<div id="outstandingTableContainer"></div>
`;


document.getElementById(

"adminContent"

).innerHTML = html;
renderOutstandingTable();
populateOutstandingFilters();
}

function renderPreviousOutstandingFees(previousFees){

let studentsOwing = 0;

let amountOwing = 0;

let fullyPaid = 0;

let partialPaid = 0;

const outstandingData = [];

previousFees.forEach(record => {

    outstandingData.push({

        student_name: record.student_name,

        reg_no: record.reg_no,

        department: record.department,

        class: record.class_name,

        termFee: Number(record.original_amount),

        paid:
            Number(record.original_amount) -
            Number(record.remaining_amount),

        outstanding:
            Number(record.remaining_amount),

        status: record.status

    });

    if (Number(record.remaining_amount) === 0) {

        fullyPaid++;

    } else {

        studentsOwing++;

        amountOwing += Number(record.remaining_amount);

        if (
            Number(record.remaining_amount) <
            Number(record.original_amount)
        ) {

            partialPaid++;

        }

    }

});
previousOutstandingMasterData = [...outstandingData];
previousOutstandingData = [...outstandingData];

let html = `

<h3>

💰 Previous Term Outstanding Fees

</h3>

<div class="payment-summary">

<div class="summary-card">

<h4>

Students Owing

</h4>

<p>

${studentsOwing}

</p>

</div>

<div class="summary-card">

<h4>

Amount Owing

</h4>

<p>

₦${amountOwing.toLocaleString()}

</p>

</div>

<div class="summary-card">

<h4>

Fully Paid

</h4>

<p>

${fullyPaid}

</p>

</div>

<div class="summary-card">

<h4>

Partial Paid

</h4>

<p>

${partialPaid}

</p>

</div>

</div>

<div class="payment-filters">

<input
type="text"
id="previousOutstandingSearch"
placeholder="🔍 Search Student / Reg No..."
onkeyup="filterPreviousOutstandingFees()"
>

<select
id="previousOutstandingDepartment"
onchange="filterPreviousOutstandingFees()"
>

<option value="">

All Departments

</option>

</select>

<select
id="previousOutstandingClass"
onchange="filterPreviousOutstandingFees()"
>

<option value="">

All Classes

</option>

</select>

<select
id="previousOutstandingStatus"
onchange="filterPreviousOutstandingFees()"
>

<option value="">

All Status

</option>

<option value="Outstanding">

Outstanding

</option>

<option value="Partial">

Partial

</option>

<option value="Paid">

Paid

</option>

</select>

</div>

<div class="payment-quick-filters">

<button
class="admin-btn"
onclick="exportPreviousOutstandingFees()"
>

📥 Export Previous Outstanding List

</button>

<button
class="admin-btn"
onclick="printPreviousOutstandingFees()"
>

🖨️ Print Previous Outstanding List

</button>

</div>

<div id="previousOutstandingTableContainer"></div>
`;


document.getElementById(
    "adminContent"
).innerHTML = html;

previousOutstandingCurrentPage = 1;
renderPreviousOutstandingTable();
populatePreviousOutstandingFilters();
}


async function loadPreviousOutstandingFees() {

    const { data, error } =
    await supabaseClient

        .from("student_previous_outstanding_fees")

        .select("*")

        .eq(
            "school_code",
            currentSchoolCode
        )

        .order(
            "department"
        );

    if (error) {

        console.error(error);

        alert(
            "Unable to load Previous Term Outstanding Fees."
        );

        return;

    }

    renderPreviousOutstandingFees(data);

}

function renderOutstandingTable(){

const totalPages = Math.ceil(

outstandingFeesData.length/

outstandingRowsPerPage

);

if(

outstandingCurrentPage>

totalPages

){

outstandingCurrentPage=1;

}

const start =

(outstandingCurrentPage-1)

*

outstandingRowsPerPage;

const end =

start+

outstandingRowsPerPage;

const pageData =

outstandingFeesData.slice(

start,

end

);

let tableHtml = `

<table class="admin-table">

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

pageData.forEach(row=>{

tableHtml += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.class}</td>

<td>

₦${row.termFee.toLocaleString()}

</td>

<td>

₦${row.paid.toLocaleString()}

</td>

<td>

₦${row.outstanding.toLocaleString()}

</td>

<td>

${row.status}

</td>

</tr>

`;

});

tableHtml += `

</tbody>

</table>

`;

tableHtml += `

<div class="payment-pagination">

<button

onclick="previousOutstandingPage()"

${outstandingCurrentPage===1?

"disabled":""}

>

◀ Previous

</button>

<span>

Page

${outstandingCurrentPage}

of

${Math.max(totalPages,1)}

</span>

<button

onclick="nextOutstandingPage()"

${outstandingCurrentPage>=totalPages?

"disabled":""}

>

Next ▶

</button>

</div>

`;

document.getElementById(
    "outstandingTableContainer"
).innerHTML = tableHtml;

}

function renderPreviousOutstandingTable(){

const totalPages = Math.ceil(

previousOutstandingData.length /

previousOutstandingRowsPerPage

);

if(

previousOutstandingCurrentPage >

totalPages

){

previousOutstandingCurrentPage = 1;

}

const start =

(previousOutstandingCurrentPage - 1)

*

previousOutstandingRowsPerPage;

const end =

start +

previousOutstandingRowsPerPage;

const pageData =

previousOutstandingData.slice(

start,

end

);

let tableHtml = `

<table class="admin-table">

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

pageData.forEach(row=>{

tableHtml += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.class}</td>

<td>

₦${row.termFee.toLocaleString()}

</td>

<td>

₦${row.paid.toLocaleString()}

</td>

<td>

₦${row.outstanding.toLocaleString()}

</td>

<td>

${row.status}

</td>

</tr>

`;

});

tableHtml += `

</tbody>

</table>

`;

tableHtml += `

<div class="payment-pagination">

<button

onclick="previousOutstandingPrevPage()"

${previousOutstandingCurrentPage===1 ?

"disabled":""}

>

◀ Prev

</button>

<span>

Page

${previousOutstandingCurrentPage}

of

${Math.max(totalPages,1)}

</span>

<button

onclick="previousOutstandingNextPage()"

${previousOutstandingCurrentPage>=totalPages ?

"disabled":""}

>

Next ▶

</button>

</div>

`;

document.getElementById(

"previousOutstandingTableContainer"

).innerHTML = tableHtml;

}


function populateOutstandingFilters(){

const deptSelect =

document.getElementById(
"outstandingDepartment"
);

const classSelect =

document.getElementById(
"outstandingClass"
);

const departments =

[
...new Set(

outstandingFeesMasterData.map(

row=>row.department

)

)

].sort();

const classes =

[
...new Set(

outstandingFeesMasterData.map(

row=>row.class || row.class_name

)

)

].sort();

departments.forEach(dept=>{

deptSelect.innerHTML +=

`<option value="${dept}">${dept}</option>`;

});

classes.forEach(cls=>{

classSelect.innerHTML +=

`<option value="${cls}">${cls}</option>`;

});

}

function populatePreviousOutstandingFilters(){

const deptSelect =

document.getElementById(
"previousOutstandingDepartment"
);

const classSelect =

document.getElementById(
"previousOutstandingClass"
);

const departments =

[
...new Set(

previousOutstandingMasterData.map(

row=>row.department

)

)

].sort();

const classes =

[
...new Set(

previousOutstandingMasterData.map(

row=>row.class

)

)

].sort();

departments.forEach(dept=>{

deptSelect.innerHTML +=

`<option value="${dept}">${dept}</option>`;

});

classes.forEach(cls=>{

classSelect.innerHTML +=

`<option value="${cls}">${cls}</option>`;

});

}



function filterOutstandingFees(){

const keyword =

document.getElementById(
"outstandingSearch"
)

.value

.toLowerCase();

const dept =

document.getElementById(
"outstandingDepartment"
).value;

const cls =

document.getElementById(
"outstandingClass"
).value;

const status =

document.getElementById(
"outstandingStatus"
).value;

outstandingFeesData =

outstandingFeesMasterData.filter(

row=>{

const searchMatch =

row.student_name

.toLowerCase()

.includes(keyword)

||

row.reg_no

.toLowerCase()

.includes(keyword);

const deptMatch =

!dept ||

row.department===dept;

const classMatch =

!cls ||

(row.class || row.class_name) === cls;

const statusMatch =

!status ||

row.status.includes(status);

return(

searchMatch &&

deptMatch &&

classMatch &&

statusMatch

);

}

);

outstandingCurrentPage = 1;

renderOutstandingTable();

}

function filterPreviousOutstandingFees(){

const keyword =

document.getElementById(
"previousOutstandingSearch"
)

.value

.toLowerCase();

const dept =

document.getElementById(
"previousOutstandingDepartment"
).value;

const cls =

document.getElementById(
"previousOutstandingClass"
).value;

const status =

document.getElementById(
"previousOutstandingStatus"
).value;

previousOutstandingData =

previousOutstandingMasterData.filter(

row=>{

const searchMatch =

row.student_name

.toLowerCase()

.includes(keyword)

||

row.reg_no

.toLowerCase()

.includes(keyword);

const deptMatch =

!dept ||

row.department===dept;

const classMatch =

!cls ||

row.class===cls;

const statusMatch =

!status ||

row.status.includes(status);

return(

searchMatch &&

deptMatch &&

classMatch &&

statusMatch

);

}

);

previousOutstandingCurrentPage = 1;

renderPreviousOutstandingTable();

}


function exportOutstandingFees(){

let csv =

"Student,Reg No,Department,Class,Term Fee,Paid,Outstanding,Status\n";

outstandingFeesData.forEach(row=>{

csv +=

`"${row.student_name}",`

+

`"${row.reg_no}",`

+

`"${row.department}",`

+

`"${row.class}",`

+

`${row.termFee},`

+

`${row.paid},`

+

`${row.outstanding},`

+

`"${row.status}"\n`;

});

const blob =

new Blob(

[csv],

{

type:

"text/csv;charset=utf-8;"

}

);

const url =

URL.createObjectURL(

blob

);

const link =

document.createElement(

"a"

);

link.href = url;

link.download =

"Outstanding_Fees.csv";

document.body.appendChild(

link

);

link.click();

document.body.removeChild(

link);

}

function exportPreviousOutstandingFees(){

let csv =

"Student,Reg No,Department,Class,Term Fee,Paid,Outstanding,Status\n";

outstandingFeesMasterData.forEach(row=>{

csv +=

`"${row.student_name}",`

+

`"${row.reg_no}",`

+

`"${row.department}",`

+

`"${row.class}",`

+

`${row.termFee},`

+

`${row.paid},`

+

`${row.outstanding},`

+

`"${row.status}"\n`;

});

const blob =

new Blob(

[csv],

{

type:

"text/csv;charset=utf-8;"

}

);

const url =

URL.createObjectURL(

blob

);

const link =

document.createElement(

"a"

);

link.href = url;

link.download =

"Outstanding_Fees.csv";

document.body.appendChild(

link

);

link.click();

document.body.removeChild(

link);

}

function printOutstandingFees() {

let printWindow = window.open("", "_blank");

let html = `

<html>

<head>

<title>

Outstanding Fees

</title>

<style>

body{

font-family:Arial,sans-serif;

padding:20px;

}

h2{

text-align:center;

margin-bottom:20px;

}

table{

width:100%;

border-collapse:collapse;

}

th,td{

border:1px solid #000;

padding:8px;

font-size:12px;

text-align:left;

}

th{

background:#f2f2f2;

}

</style>

</head>

<body>

<h2>

Outstanding Fees Report

</h2>

<table>

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Department</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

outstandingFeesData.forEach(row=>{

html += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.department}</td>

<td>${row.class}</td>

<td>₦${row.termFee.toLocaleString()}</td>

<td>₦${row.paid.toLocaleString()}</td>

<td>₦${row.outstanding.toLocaleString()}</td>

<td>${row.status}</td>

</tr>

`;

});

html += `

</tbody>

</table>

</body>

</html>

`;

printWindow.document.open();

printWindow.document.write(html);

printWindow.document.close();

printWindow.focus();

printWindow.print();

printWindow.close();

}

function printPreviousOutstandingFees() {

let printWindow = window.open("", "_blank");

let html = `

<html>

<head>

<title>

Outstanding Fees

</title>

<style>

body{

font-family:Arial,sans-serif;

padding:20px;

}

h2{

text-align:center;

margin-bottom:20px;

}

table{

width:100%;

border-collapse:collapse;

}

th,td{

border:1px solid #000;

padding:8px;

font-size:12px;

text-align:left;

}

th{

background:#f2f2f2;

}

</style>

</head>

<body>

<h2>

Outstanding Fees Report

</h2>

<table>

<thead>

<tr>

<th>Student</th>

<th>Reg No</th>

<th>Department</th>

<th>Class</th>

<th>Term Fee</th>

<th>Paid</th>

<th>Outstanding</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

outstandingFeesMasterData.forEach(row=>{

html += `

<tr>

<td>${row.student_name}</td>

<td>${row.reg_no}</td>

<td>${row.department}</td>

<td>${row.class}</td>

<td>₦${row.termFee.toLocaleString()}</td>

<td>₦${row.paid.toLocaleString()}</td>

<td>₦${row.outstanding.toLocaleString()}</td>

<td>${row.status}</td>

</tr>

`;

});

html += `

</tbody>

</table>

</body>

</html>

`;

printWindow.document.open();

printWindow.document.write(html);

printWindow.document.close();

printWindow.focus();

printWindow.print();

printWindow.close();

}


function previousOutstandingPage(){

if(outstandingCurrentPage>1){

    outstandingCurrentPage--;

    renderOutstandingTable();

}

}

function nextOutstandingPage(){

const totalPages = Math.ceil(

outstandingFeesData.length/

outstandingRowsPerPage

);

if(outstandingCurrentPage<totalPages){

    outstandingCurrentPage++;

    renderOutstandingTable();

}

}

function previousOutstandingPrevPage(){

    if(previousOutstandingCurrentPage > 1){

        previousOutstandingCurrentPage--;

        renderPreviousOutstandingTable();

    }

}

function previousOutstandingNextPage(){

    const totalPages = Math.ceil(

        previousOutstandingData.length /

        previousOutstandingRowsPerPage

    );

    if(previousOutstandingCurrentPage < totalPages){

        previousOutstandingCurrentPage++;

        renderPreviousOutstandingTable();

    }

}



async function clearCurrentTermPayments(){

    showTUPSConfirmation(

        `This action will:

• Archive Current Payments

• Generate Outstanding Fees

• Reset Student Payments

• Clear Current Payment Records

Payment History will be preserved.

Current Term payments will be marked as Previous Term payments.

Do you want to continue?`,

        async function(){

            try{

                // STEP 1
                const archiveResult =
                await archiveStudentPayments();


                // STEP 1B
                // MARK CURRENT TERM PAYMENTS AS PREVIOUS TERM

                const {

                    error: historyUpdateError

                } = await supabaseClient

                .from("payment_history")

                .update({

                    remarks:

                    "Previous Term Payment"

                })

                .eq(

                    "school_code",

                    currentSchoolCode

                )

                .eq(

                    "remarks",

                    "Current Term Payment"

                );


                if(historyUpdateError){

                    throw historyUpdateError;

                }


                // ========================================
                // STEP 2B
                // COPY CURRENT OUTSTANDING
                // TO PREVIOUS TERM TABLE
                // ========================================

                // Make sure Outstanding data exists

                if(
                    !outstandingFeesMasterData ||
                    outstandingFeesMasterData.length===0
                ){

                    await loadOutstandingPayments();

                }


                if(
                    !outstandingFeesMasterData ||
                    outstandingFeesMasterData.length===0
                ){

                    throw new Error(
                        "Unable to generate Outstanding snapshot."
                    );

                }


                // Remove previous snapshot

                const {

                    error: deletePreviousError

                } = await supabaseClient

                .from("student_previous_outstanding_fees")

                .delete()

                .eq(

                    "school_code",

                    currentSchoolCode

                );


                if(deletePreviousError){

                    throw deletePreviousError;

                }


                // Build snapshot directly from the Outstanding screen

                const previousRows =

                outstandingFeesMasterData

                .filter(
                    row=>row.remaining_amount>0
                )

                .map(row=>({

                    school_code:
                    row.school_code,

                    student_id:
                    row.student_id,

                    reg_no:
                    row.reg_no,

                    student_name:
                    row.student_name,

                    department:
                    row.department,

                    class_name:
                    row.class_name,

                    session:
                    row.session,

                    term:
                    row.term,

                    original_amount:
                    row.original_amount,

                    remaining_amount:
                    row.remaining_amount,

                    status:
                    row.status

                }));


                if(previousRows.length){

                    const {

                        error: previousInsertError

                    } = await supabaseClient

                    .from(
                        "student_previous_outstanding_fees"
                    )

                    .insert(previousRows);


                    if(previousInsertError){

                        throw previousInsertError;

                    }

                }


                // STEP 3

                const {

                    error:updateError

                } =
                await supabaseClient

                .from("students")

                .update({

                    total_fees_paid:0

                })

                .eq(

                    "school_code",

                    currentSchoolCode

                );


                if(updateError)
                    throw updateError;


                // STEP 4

                const {

                    error:deleteError

                } =
                await supabaseClient

                .from("student_payments")

                .delete()

                .eq(

                    "school_code",

                    currentSchoolCode

                );


                if(deleteError)
                    throw deleteError;


                // ========================================
                // STEP 4B
                // GENERATE CURRENT TERM OUTSTANDING
                // ========================================

                const outstanding =
                await generateOutstandingRecords();


                alert(

                `Finance Rollover Completed Successfully

Archived Records:
${archiveResult.count}

Outstanding Records:
${outstanding}

Student Payments Reset

Payment History Preserved.`

                );


                // ========================================
                // REFRESH CURRENT TERM OUTSTANDING
                // ========================================

                await loadOutstandingPayments();


                console.log(

                    "Finance rollover completed. Outstanding tables refreshed."

                );

            }

            catch(err){

                alert(

                    "Finance rollover failed.\n\n"

                    +

                    err.message

                );

                console.error(err);

            }

        },

        function(){

            // User cancelled.
            // No finance operation is performed.

        }

    );

}

async function archiveStudentPayments() {
	const archiveBatchId =
`ROLL-${Date.now()}`;

  // Fetch all current term payments
  const {
    data: payments,
    error: fetchError
  } = await supabaseClient
    .from("student_payments")
    .select("*")
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (fetchError) {

    console.error(
      "Archive Fetch Error:",
      fetchError
    );

    throw fetchError;

  }
  
  const {

data: students,

error: studentError

} = await supabaseClient

.from("students")

.select(

"id,total_fees_paid"

)

.eq(

"school_code",

currentSchoolCode

);

if(studentError){

throw studentError;

}

  // Nothing to archive
  if (!payments || payments.length === 0) {

    return 0;

  }

  // Build archive rows
 const archiveRows = payments.map(row => {

const student = students.find(
    s => s.id === row.student_id
);

return {

archive_batch_id:
archiveBatchId,

source_table:
"student_payments",

school_code:
row.school_code,

student_id:
row.student_id,

student_name:
row.student_name,

reg_no:
row.reg_no,

department:
row.department,

class:
row.class,

amount_paid:
Number(row.amount_paid || 0),

total_fees_paid:
Number(student?.total_fees_paid || 0),

created_at:
row.created_at

};

});

  // Insert archive
  const {
    error: archiveError
  } = await supabaseClient
    .from("finance_archive")
    .insert(
      archiveRows
    );

  if (archiveError) {

    console.error(
      "Archive Insert Error:",
      archiveError
    );

    throw archiveError;

  }

  return{

count:
archiveRows.length,

batchId:
archiveBatchId

};

}

async function generateOutstandingRecords() {

  // Get all students
  const {
    data: students,
    error: studentError
  } = await supabaseClient
    .from("students")
    .select("*")
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (studentError) throw studentError;

  // Get class fees
  const {
    data: fees,
    error: feeError
  } = await supabaseClient
    .from("class_fees")
    .select("*")
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (feeError) throw feeError;

  // ========================================
  // CLEAR CURRENT OUTSTANDING TABLE
  // BEFORE REBUILDING IT
  // ========================================

  const {
    error: deleteOutstandingError
  } = await supabaseClient
    .from("student_outstanding_fees")
    .delete()
    .eq(
      "school_code",
      currentSchoolCode
    );

  if (deleteOutstandingError) {
    throw deleteOutstandingError;
  }

  let generated = 0;

  for (const student of students) {

    const feeRecord = fees.find(
      fee => fee.class_name === student.class
    );

    const classFee =
      Number(feeRecord?.term_fee || 0);

    const paid =
      Number(student.total_fees_paid || 0);

    const outstanding =
      Math.max(classFee - paid, 0);

    if (outstanding > 0) {

      const {
        data: upsertData,
        error: upsertError
      } = await supabaseClient
        .from("student_outstanding_fees")
        .upsert({

          school_code:
            currentSchoolCode,

          student_id:
            student.id,

          reg_no:
            student.reg_no,

          student_name:
            student.student_name,

          class_name:
            student.class,

          session:
            "N/A",

          term:
            "N/A",

          // Store the FULL class fee
          original_amount:
            classFee,

          // Store the amount still owing
          remaining_amount:
            outstanding,

          status:
            "Outstanding"

        },
        {
          onConflict:
            "school_code,reg_no"
        });

      console.log(
        "Outstanding Insert:",
        upsertData
      );

      console.log(
        "Outstanding Error:",
        upsertError
      );

      if (upsertError) {
        throw upsertError;
      }

      generated++;

    }

  }

  return generated;

}

function wireStudentsModule() {

  const departmentSelect =
    document.getElementById(
      "studentDepartment"
    );

  departmentSelect
    .addEventListener(
      "change",
      () => {

       
	loadStudentsTable(
        departmentSelect.value
      );

      }
    );

  document
    .getElementById(
      "refreshStudentsBtn"
    )
    .addEventListener(
      "click",
      syncStudentsFromSheet
    );
	 document
    .getElementById(
      "studentSearch"
    )
    .addEventListener(
      "keyup",
      filterStudentsTable
    );

}


function toggleDepartment(department) {

  console.log(
    "CLICKED:",
    department
  );

  const safe =
    department.replace(/\s+/g, "_");

  const dropdown =
    document.getElementById(
      "dropdown-" + safe
    );

  console.log(
    "FOUND:",
    dropdown
  );

  if (!dropdown) return;

  dropdown.style.display =
    dropdown.style.display === "block"
      ? "none"
      : "block";

}

function showTeachers() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>👥 Manage Teachers</h3>

    <p>
      This feature is coming soon.
    </p>

  `;

}

function showSettings() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <h3>⚙️ School Settings</h3>

    <p>
      This feature is coming soon.
    </p>

  `;

}


function logoutSchoolPortal() {

  showTUPSConfirmation(

    "Are you sure you want to logout?",

    function () {

      // Clear session
      sessionStorage.removeItem(
        "school_code"
      );

      sessionStorage.clear();

      // Prevent browser returning here
      window.location.replace(
        "index.html"
      );

    },

    function () {

      // User cancelled logout.
      // Do nothing.

    }

  );

}

function adminLogout() {

  location.reload();

}


// ==========================
// AUTO LOGOUT (1 MINUTE)
// ==========================

let logoutTimer;

function resetLogoutTimer() {

  clearTimeout(logoutTimer);

  logoutTimer = setTimeout(() => {

    alert(
      "Session expired due to inactivity."
    );

    sessionStorage.removeItem(
  "school_code"
);

sessionStorage.clear();

window.location.replace(
  "index.html"
);

  }, 240000); // 4 minute

}

// User activity events
[
  "click",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart"
].forEach(event => {

  document.addEventListener(
    event,
    resetLogoutTimer
  );

});

// Start timer immediately
resetLogoutTimer();

const logoutBtn =
  document.getElementById(
    "logoutSchoolBtn"
  );

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logoutSchoolPortal
  );

}

async function openTermReport(
  studentId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select(
        "student_name,result_url"
      )
      .eq(
        "id",
        studentId
      )
      .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

  if (
    !data.result_url
  ) {

    alert(
      "No result found for this student."
    );

    return;

  }

  const fileId =
    data.result_url.match(
      /\/d\/([^/]+)\//
    )[1];

  const downloadUrl =
    `https://drive.google.com/uc?export=download&id=${fileId}`;

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <div
  style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:15px;
  "
>

  <h3
    style="
      margin:0;
    "
  >
    ${data.student_name}
  </h3>

  <button
    onclick="showStudentsFees()"
    style="
      border:none;
      background:none;
      font-size:24px;
      cursor:pointer;
      color:#666;
      font-weight:bold;
    "
  >
    ✕
  </button>

</div>

    <iframe
      src="${data.result_url.replace('/view','/preview')}"
      style="
        width:100%;
        height:85vh;
        border:none;
        border-radius:10px;
      "
    ></iframe>

    <div
      style="
        display:flex;
        gap:12px;
        margin-top:20px;
      "
    >

      <button
        class="admin-btn"
        onclick="window.location.href='${downloadUrl}'"
        style="
          flex:1;
          min-height:50px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          font-size:15px;
          font-weight:600;
        "
      >
        ⬇️ Download Result
      </button>

      <button
        class="admin-btn"
        onclick="shareResult(
          '${data.student_name}',
          '${data.result_url}'
        )"
        style="
          flex:1;
          min-height:50px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          font-size:15px;
          font-weight:600;
        "
      >
        📤 Share Result
      </button>

    </div>

  `;

}

window.openTermReport =
  openTermReport;
  
 async function shareResult(
  studentName,
  resultUrl
) {

  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          studentName +
          " Result",

        text:
          studentName +
          " Result",

        url:
          resultUrl

      });

    } else {

      const shareUrl =
        `https://wa.me/?text=${encodeURIComponent(
          studentName +
          " Result: " +
          resultUrl
        )}`;

      window.open(
        shareUrl,
        "_blank"
      );

    }

  } catch (err) {

    console.error(err);

  }

}

window.shareResult =
  shareResult;
  
function togglePaymentsMenu() {

  const menu =
    document.getElementById(
      "paymentsDropdown"
    );

  menu.style.display =
    menu.style.display === "block"
      ? "none"
      : "block";

}

function toggleAdvertsMenu() {

    const menu =
        document.getElementById(
            "advertsDropdown"
        );

    if (!menu) {
        return;
    }

    menu.style.display =
        menu.style.display === "block"
            ? "none"
            : "block";
}

async function loadTermFees() {
console.log(
  "Department:",
  currentDepartment
);

console.log(
  "School:",
  currentSchoolCode
);
  document.getElementById(
    "adminContent"
  ).innerHTML = `

<h3>
  💰 Set Term Fees
</h3>

    <div
  style="
    display:flex;
    align-items:center;
    gap:10px;
    flex-wrap:nowrap;
    margin-bottom:15px;
  "
>

  <input
    type="text"
    id="feeSearch"
    placeholder="Search Class"
    style="
      flex:1;
      height:40px;
      font-size:14px;
    "
  >

 <button
  class="admin-btn"
  onclick="printFeesTable()"
  style="
    height:40px;
    padding:0 15px;
    font-size:13px;
    white-space:nowrap;
  "
>
  Print Fees
</button>

  <button
  class="admin-btn"
  onclick="clearAllFees()"
  style="
    height:40px;
    padding:0 15px;
    font-size:13px;
    white-space:nowrap;
  "
>
  Clear All Fees
</button>
</div>

<table class="admin-table">

<thead>

<tr>

<th>Class</th>
<th>Term Fee</th>
<th>Action</th>

</tr>

</thead>

<tbody id="termFeesBody">
</tbody>

</table>
  `;

  await loadTermFeesData();
  document
  .getElementById("feeSearch")
  .addEventListener(
    "keyup",
    filterFeesTable
  );

}

async function loadCommunicationCalendarData(){

    communicationDates = {};

    const { data, error } = await supabaseClient

        .from("school_communication_book")

        .select(`
            created_at,
            is_read,
            sender_type
        `)

        .eq("school_code", schoolCode);

    if(error){

        console.error(error);

        return;

    }

    data.forEach(msg=>{

        const date =

            msg.created_at.substring(0,10);

        if(!communicationDates[date]){

            communicationDates[date]={

                unread:false,

                total:0

            };

        }

        communicationDates[date].total++;

        if(

            msg.sender_type==="Parent"

            &&

            !msg.is_read

        ){

            communicationDates[date].unread=true;

        }

    });

}

async function loadTermFeesData() {

  console.log("School:", currentSchoolCode);

  // 1. Get all students ONLY to extract classes
  const { data, error } =
    await supabaseClient
      .from("students")
      .select("class")
      .eq("school_code", currentSchoolCode);

  if (error) {
    console.error(error);
    return;
  }

  console.log("STUDENTS RETURNED:", data);

  // 2. Unique + cleaned classes
  const classes = [
    ...new Set(
      data
        .map(x => x.class?.trim())
        .filter(Boolean)
    )
  ];

  console.log("UNIQUE CLASSES:", classes);

  // 3. NOW fetch fees from CORRECT TABLE
  const { data: feeData, error: feeError } =
    await supabaseClient
      .from("class_fees")
      .select("*")
      .eq("school_code", currentSchoolCode);

  if (feeError) {
    console.error(feeError);
    return;
  }

  console.log("CLASS FEES DATA:", feeData);

  // 4. Render table
  const body =
    document.getElementById("termFeesBody");

  body.innerHTML = "";

  classes.forEach(className => {

   const feeRecord = feeData.find(f =>
  f.class_name?.trim().toLowerCase() === className?.trim().toLowerCase()
);

    const fee =
      feeRecord?.term_fee || 0;

    body.innerHTML += `
      <tr style="border-bottom:1px solid #ddd;">

        <td style="padding:8px;">
          ${className}
        </td>

        <td style="padding:8px;">
          ₦${Number(fee).toLocaleString()}
        </td>

        <td style="padding:8px;">
          <button
            class="admin-btn"
            onclick="editClassFee('${className}', ${fee})"
          >
            Edit
          </button>
        </td>

      </tr>
    `;
  });
}

function editClassFee(className, currentFee = 0) {

  document.getElementById(
    "adminContent"
  ).innerHTML = `

    <div class="fee-form-card">

      <h3>
        Edit Term Fee
      </h3>

      <br>

      <label>
        Class
      </label>

      <input
        type="text"
        value="${className}"
        readonly
      >

      <br><br>

      <label>
        Term Fee
      </label>

      <input
  type="number"
  id="termFeeAmount"
  value="${currentFee}"
  placeholder="Enter Amount"
/>

      <br><br>

      <button
        class="admin-btn"
        onclick="
          saveTermFee(
            '${className}'
          )
        "
      >
        Save Fee
      </button>

    </div>

  `;

}
window.editClassFee =
  editClassFee;
  
async function saveTermFee(
  className
) {

  const amount =
    Number(
      document.getElementById(
        "termFeeAmount"
      ).value
    );

  if (
    isNaN(amount) ||
    amount < 0
  ) {
    alert(
      "Enter a valid fee amount"
    );
    return;
  }

  const { error } =
   await supabaseClient
  .from("class_fees")
  .upsert(
    {
      school_code: currentSchoolCode,
      class_name: className.trim(),
      term_fee: amount
    },
    {
      onConflict: "school_code,class_name"
    }
  );

  if (error) {

    console.error(error);

    alert(
      error.message
    );

    return;

  }

  alert("Fee Saved");

  await loadTermFees();

}

window.saveTermFee =
  saveTermFee;
  
  
function printFeesTable() {

  const table =
    document.querySelector(".admin-table");

  const clonedTable =
    table.cloneNode(true);

  clonedTable
    .querySelectorAll("tr")
    .forEach(row => {

      if (row.cells.length > 2) {
        row.deleteCell(2);
      }

    });

  const printWindow =
    window.open("", "", "width=900,height=700");

  printWindow.document.write(`
    <html>
      <head>
        <title>Term Fees</title>
      </head>
      <body>
        ${clonedTable.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}
window.printFeesTable =
  printFeesTable;
  
async function clearAllFees() {

  showTUPSConfirmation(

    "This will delete ALL class fees. Continue?",

    async function () {

      const { error } =
        await supabaseClient
          .from("class_fees")
          .delete()
          .eq(
            "school_code",
            currentSchoolCode
          );


      if (error) {

        console.error(error);

        alert(
          error.message
        );

        return;

      }


      alert(
        "All fees cleared successfully."
      );


      await loadTermFees();

    },

    function () {

      // User cancelled.
      // Do nothing.

    }

  );

}

window.clearAllFees =
  clearAllFees;
 
 async function viewPaymentHistory(
  studentId
) {

  const {
    data: student
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "id",
        studentId
      )
      .single();

  const {
    data: history
  } =
    await supabaseClient
      .from(
        "payment_history"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "payment_date",
        {
          ascending:false
        }
      );

  let passportUrl = "";

  if (
    student.passport_url
  ) {

    const fileId =
      student.passport_url
        .split("id=")[1];

    passportUrl =
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;

  }

  const totalPaid =
    Number(
      student.total_fees_paid
    ) || 0;

  const classFeeRecord =
    await supabaseClient
      .from("class_fees")
      .select("term_fee")
      .eq(
        "school_code",
        currentSchoolCode
      )
      .eq(
        "class_name",
        student.class
      )
      .single();

  const expectedFee =
    Number(
      classFeeRecord
        .data
        ?.term_fee
    ) || 0;

  const balance =
    expectedFee -
    totalPaid;

  let rows = "";

history.forEach(row => {
	 console.log(
  "RAW PAYMENT DATE:",
  row.payment_date
);
  const paymentDate =
    new Date(
      row.payment_date
    );

  const dateOnly =
    paymentDate.toLocaleDateString(
      "en-NG",
      {
        timeZone: "Africa/Lagos"
      }
    );

  const timeOnly =
    paymentDate.toLocaleTimeString(
      "en-NG",
      {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }
    );

  rows += `

    <tr>

      <td>
        ${dateOnly}
      </td>

      <td>
        ${timeOnly}
      </td>

      <td>
        ₦${Number(
          row.amount_paid
        ).toLocaleString()}
      </td>

      <td>
        ₦${Number(
          row.total_paid
        ).toLocaleString()}
      </td>

    </tr>

  `;

});

  document.getElementById(
    "adminContent"
  ).innerHTML = `

<div
  class="history-card"
>

<div
  style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:15px;
    margin-bottom:20px;
  "
>

<div
  style="
    display:flex;
    align-items:center;
    gap:12px;
  "
>

<img
  src="${passportUrl}"
  style="
    width:70px;
    height:70px;
    border-radius:50%;
    object-fit:cover;
  "
>

<div>

<h3>
  ${student.student_name}
</h3>

<p>
  Total Paid:
  ₦${totalPaid.toLocaleString()}
</p>

<p>
  Balance:
  ₦${balance.toLocaleString()}
</p>

</div>

</div>

<div>

<button
  class="admin-btn"
  onclick="printHistory()"
>
  Print
</button>

<button
  class="admin-btn"
  onclick="loadAllPayments()"
>
  ✕
</button>

</div>

</div>

<table
  class="admin-table"
  id="historyTable"
>

<thead>

<tr>

<th>Date</th>

<th>Time</th>

<th>Amount Paid</th>

<th>Total Paid</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</div>

`;

}

function printHistory() {

  const table =
    document.getElementById(
      "historyTable"
    );

  const win =
    window.open(
      "",
      "",
      "width=900,height=700"
    );

  win.document.write(`

    <html>

    <head>

      <title>
        Payment History
      </title>

    </head>

    <body>

      ${table.outerHTML}

    </body>

    </html>

  `);

  win.document.close();

  win.print();

}

window.printHistory =
  printHistory;

window.viewPaymentHistory =
  viewPaymentHistory;
 
async function loadAllPayments() {

  document.getElementById(
    "adminContent"
  ).innerHTML = `
  
     <h3>
       💳 All Payments
     </h3>

    <div
      class="payment-toolbar"
    >

      <input
        type="text"
        id="paymentSearch"
        placeholder="Search Student..."
      >

      <button
        class="admin-btn"
        onclick="printPaymentsTable()"
      >
        Print Payments
      </button>

    </div>

    <div
      id="paymentSummary"
    ></div>

    <div
      id="paymentsTableContainer"
    ></div>

  `;

  await loadAllPaymentsData();

  document
    .getElementById(
      "paymentSearch"
    )
    .addEventListener(
      "keyup",
      filterPaymentsTable
    );

}

window.loadAllPayments =
  loadAllPayments;
  
async function loadAllPaymentsData() {

  const {
    data: students,
    error: studentError
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .eq(
        "school_code",
        currentSchoolCode
      );

  if (studentError) {

    console.error(studentError);

    return;

  }

  const {
    data: fees,
    error: feeError
  } =
    await supabaseClient
      .from("class_fees")
      .select("*")
      .eq(
        "school_code",
        currentSchoolCode
      );

  if (feeError) {

    console.error(feeError);

    return;

  }

  let totalStudents = 0;
  let totalExpected = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;

  let html = `

    <table
      class="admin-table"
      id="paymentsTable"
    >

      <thead>

        <tr>

          <th>Student</th>
          <th>Class</th>
          <th>Fee</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Status</th>
		  <th>History</th>

        </tr>

      </thead>

      <tbody>

  `;

  students.forEach(student => {

    const feeRecord =
      fees.find(
        x =>
          x.class_name
            ?.trim()
            .toLowerCase() ===
          student.class
            ?.trim()
            .toLowerCase()
      );

    const expectedFee =
      Number(
        feeRecord?.term_fee
      ) || 0;

    const paid =
      Number(
        student.total_fees_paid
      ) || 0;

    const balance =
      expectedFee - paid;

    totalStudents++;

    totalExpected += expectedFee;

    totalCollected += paid;

    totalOutstanding += balance;

    const status =
      balance <= 0
        ? "Completed"
        : "Owing";
html += `

  <tr>

    <td>
      ${student.student_name}
    </td>

    <td>
      ${student.class || ""}
    </td>

    <td>
      ₦${expectedFee.toLocaleString()}
    </td>

    <td>
      ₦${paid.toLocaleString()}
    </td>

    <td>
      ₦${balance.toLocaleString()}
    </td>

    <td>

      <span
        class="${
          balance <= 0
            ? "status-completed"
            : "status-owing"
        }"
      >

        ${status}

      </span>

    </td>

    <td>

      <button
        class="admin-btn"
        onclick="viewPaymentHistory(${student.id})"
        style="
          padding:4px 10px;
          font-size:12px;
        "
      >
        History
      </button>

    </td>

  </tr>

`;

  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById(
    "paymentSummary"
  ).innerHTML = `

    <div
      class="payment-summary"
    >

      <div
        class="summary-card"
      >

        <h4>
          Total Students
        </h4>

        <p>
          ${totalStudents}
        </p>

      </div>

      <div
        class="summary-card"
      >

        <h4>
          Expected Revenue
        </h4>

        <p>
          ₦${totalExpected.toLocaleString()}
        </p>

      </div>

      <div
        class="summary-card"
      >

        <h4>
          Total Collected
        </h4>

        <p>
          ₦${totalCollected.toLocaleString()}
        </p>

      </div>

      <div
        class="summary-card"
      >

        <h4>
          Outstanding
        </h4>

        <p>
          ₦${totalOutstanding.toLocaleString()}
        </p>

      </div>

    </div>

  `;

  document.getElementById(
    "paymentsTableContainer"
  ).innerHTML =
    html;

}

function filterPaymentsTable() {

  const searchValue =
    document
      .getElementById(
        "paymentSearch"
      )
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      "#paymentsTable tbody tr"
    );

  rows.forEach(row => {

    row.style.display =
      row.innerText
        .toLowerCase()
        .includes(searchValue)
          ? ""
          : "none";

  });

}

function printPaymentsTable() {

  const table =
    document.getElementById(
      "paymentsTable"
    );

  const printWindow =
    window.open(
      "",
      "",
      "width=900,height=700"
    );

  printWindow.document.write(`

    <html>

      <head>

        <title>
          All Payments
        </title>

      </head>

      <body>

        ${table.outerHTML}

      </body>

    </html>

  `);

  printWindow.document.close();

  printWindow.print();

}

window.printPaymentsTable =
  printPaymentsTable;
  
 
  
function filterFeesTable() {

  const searchValue =
    document
      .getElementById("feeSearch")
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      "#termFeesBody tr"
    );

  rows.forEach(row => {

    const rowText =
      row.innerText
        .toLowerCase();

    row.style.display =
      rowText.includes(searchValue)
        ? ""
        : "none";

  });

}



async function restoreLastRollover() {

    showTUPSConfirmation(

        `This will restore the LAST cleared payment records.

This action will:

• Restore student payments

• Restore total fees paid

• Remove Current Term Outstanding Fees

• Remove Previous Term Outstanding Fees

• Change Previous Term payments back to Current Term

Do you want to continue?`,

        async function () {

            // ========================================
            // FIND LATEST ARCHIVE BATCH
            // ========================================

            const {

                data: lastBatch,

                error: lastBatchError

            } = await supabaseClient

                .from("finance_archive")

                .select("archive_batch_id")

                .order(
                    "archived_at",
                    { ascending: false }
                )

                .limit(1)

                .single();


            if (lastBatchError) {

                alert(
                    "No archive found."
                );

                return;

            }


            const batchId =
                lastBatch.archive_batch_id;


            // ========================================
            // LOAD ARCHIVE RECORDS
            // ========================================

            const {

                data: archiveRows,

                error: archiveError

            } = await supabaseClient

                .from("finance_archive")

                .select("*")

                .eq(
                    "archive_batch_id",
                    batchId
                );


            if (archiveError) {

                alert(
                    archiveError.message
                );

                return;

            }


            // ========================================
            // REBUILD student_payments
            // ========================================

            const paymentRows =
                archiveRows.map(row => ({

                    school_code:
                        row.school_code,

                    student_id:
                        row.student_id,

                    student_name:
                        row.student_name,

                    reg_no:
                        row.reg_no,

                    department:
                        row.department,

                    class:
                        row.class,

                    amount_paid:
                        row.amount_paid

                }));


            const {

                error: insertError

            } = await supabaseClient

                .from("student_payments")

                .insert(paymentRows);


            // IMPORTANT
            // CHECK IMMEDIATELY

            if (insertError) {

                alert(
                    insertError.message
                );

                return;

            }


            // ========================================
            // RESTORE TOTAL FEES PAID
            // ========================================

            const restoredStudents = {};


            archiveRows.forEach(row => {

                if (
                    !restoredStudents[
                        row.student_id
                    ]
                ) {

                    restoredStudents[
                        row.student_id
                    ] =

                        Number(
                            row.total_fees_paid || 0
                        );

                }

            });


            for (
                const studentId
                in restoredStudents
            ) {

                const {

                    error: updateError

                } = await supabaseClient

                    .from("students")

                    .update({

                        total_fees_paid:
                            restoredStudents[
                                studentId
                            ]

                    })

                    .eq(
                        "id",
                        studentId
                    );


                if (updateError) {

                    throw updateError;

                }

            }


            // ========================================
            // RESTORE PAYMENT HISTORY REMARKS
            // ========================================

            const {

                error: historyRestoreError

            } = await supabaseClient

                .from("payment_history")

                .update({

                    remarks:
                        "Current Term Payment"

                })

                .eq(
                    "school_code",
                    currentSchoolCode
                )

                .eq(
                    "remarks",
                    "Previous Term Payment"
                );


            if (historyRestoreError) {

                throw historyRestoreError;

            }


            // ========================================
            // DELETE RESTORED ARCHIVE
            // ========================================

            const {

                error: archiveDeleteError

            } = await supabaseClient

                .from("finance_archive")

                .delete()

                .eq(
                    "archive_batch_id",
                    batchId
                );


            if (archiveDeleteError) {

                throw archiveDeleteError;

            }


            // ========================================
            // REMOVE GENERATED OUTSTANDING FEES
            // ========================================

            const {

                error: deleteOutstandingError

            } = await supabaseClient

                .from("student_outstanding_fees")

                .delete()

                .eq(
                    "school_code",
                    currentSchoolCode
                );


            if (deleteOutstandingError) {

                throw deleteOutstandingError;

            }


            // ========================================
            // VERIFY OUTSTANDING TABLE IS EMPTY
            // ========================================

            const {

                data: remainingOutstanding,

                error: remainingError

            } = await supabaseClient

                .from("student_outstanding_fees")

                .select("*")

                .eq(
                    "school_code",
                    currentSchoolCode
                );


            console.log(

                "Outstanding Remaining After Restore:",

                remainingOutstanding

            );


            console.log(

                "Remaining Error:",

                remainingError

            );


            // ========================================
            // REMOVE PREVIOUS TERM OUTSTANDING
            // ========================================

            const {

                error:
                    deletePreviousOutstandingError

            } = await supabaseClient

                .from(
                    "student_previous_outstanding_fees"
                )

                .delete()

                .eq(
                    "school_code",
                    currentSchoolCode
                );


            if (
                deletePreviousOutstandingError
            ) {

                throw deletePreviousOutstandingError;

            }


            // ========================================
            // SUCCESS
            // ========================================

            alert(

                "Latest rollover restored successfully."

            );

        },

        function () {

            // User cancelled.
            // Do absolutely nothing.

        }

    );

}

/* =========================================================
   TEACHER COMMUNICATION BOOK MODAL
========================================================= */

const communicationBookBtn =
    document.getElementById(
        "communicationBookBtn"
    );

const communicationBookModal =
    document.getElementById(
        "communicationBookModal"
    );

const closeCommunicationBook =
    document.getElementById(
        "closeCommunicationBook"
    );


/* -----------------------------------------
   OPEN
----------------------------------------- */

if (
    communicationBookBtn
) {

    communicationBookBtn.addEventListener(
        "click",
        function () {

            communicationBookModal.style.display =
                "flex";

        }
    );

}


/* -----------------------------------------
   CLOSE BUTTON
----------------------------------------- */

if (
    closeCommunicationBook
) {

    closeCommunicationBook.addEventListener(
        "click",
        function () {

            communicationBookModal.style.display =
                "none";

        }
    );

}


/* -----------------------------------------
   CLICK OUTSIDE
----------------------------------------- */

window.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            event.target ===
            communicationBookModal
        ) {

            communicationBookModal.style.display =
                "none";

        }

    }
);

// ==========================
// FOOTER YEAR
// ==========================
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


document.addEventListener("click", async (e) => {

  if (e.target && e.target.id === "openDriveBtn") {

    document.getElementById("adminContent").innerHTML =
      "<p>Opening School Drive...</p>";

    const res = await fetch("https://script.google.com/macros/s/AKfycbzRotvo9tm_FHSkGKqzdgyEjKYQix0YgI1Db4viY3eJ0V3dvXdT_I5Jgy39P5Zt8zjxaA/exec", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "openSchoolDrive",
        schoolCode: schoolCode
      })
    });

    const data = await res.json();

    if (data.success) {
      window.open(data.url, "_blank"); // opens Drive folder
    } else {
      document.getElementById("adminContent").innerHTML =
        "<p>Drive not found.</p>";
    }
  }

});