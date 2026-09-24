if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

// -------------------- PROTECTION FORM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
    if (error || !session) {
      showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("../LoginPage/LoginIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDropDown = document.getElementById("PageNavigationSelect");
PageNavigationDropDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "../LoginPage/LogInIndex.html",
        "LibraryPage": "../../LibraryPage/LibraryIndex.html",
        "NoticePage": "../../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../../StudentPage/StudentIndex.html",
        "HumanResourcePage": "../../HumanResourcePage/HumanResourceIndex.html",
        "BalPratibhaPage": "../../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "../../GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "../../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../../HelpingHandPage/HelpingHandIndex.html",
        "HomePage": "../../index.html"
    };   
    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// -------------------- NAVIGATE ADMIN EDITS --------------------
const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
EditNavigationDropDown.addEventListener("change", function () {
    const pageMap = {
        "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
        "IDCardEditBox": "../EditIDCardPage/EditIDCardIndex.html",
        "ResultEditBox": "../EditResultPage/EditResultIndex.html",
        "RoutineEditBox": "../EditRoutinePage/EditRoutineIndex.html",
        "StudentAttendanceEditBox": "../EditStudentAttendancePage/EditStudentAttendanceIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };   
    const selectedEdit = pageMap[this.value];
    if (selectedEdit) {
        window.location.href = selectedEdit;
    }
});

// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

  //----------------------- Script for Admin Tools Dropdown -----------------------
document.getElementById("AdminToolsSelect").addEventListener("change", async function () {
    switch (this.value) {
        case "ChangePasswordTool":
            window.location.href = "../ChangePasswordPage/ChangePasswordIndex.html";
            break;
        case "LogoutThisDeviceTool":
            showCustomDialog2(
            "Confirm Logout",
            "Logout from this device?",
            "Yes",
            "Cancel",
            async function () {
                await supabaseClient.auth.signOut({scope: "local"});
                window.location.replace("../LoginPage/LogInIndex.html");
            },
            function () {}
        );
        break;
        case "LogoutAllDevicesTool":
        const confirm = showCustomDialog2("Confirm Logout", "Logout from all devices?", "Yes", "Cancel", function() {}, function() {});
            if (confirm==="Yes") {
                await supabaseClient .auth .signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html";
            break;
    }
    this.selectedIndex = 0;
});

// Dynamically show logo and favicon
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single();

        if (error) {
            console.error("Supabase query error loading branding:", error.message);
            return;
        }

        if (data && data.Value) {
            const freshLogoUrl = data.Value;

            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) {
                faviconElement.href = freshLogoUrl;
            }

            const logoImgElement = document.querySelector('#LogoBox img');
            if (logoImgElement) {
                logoImgElement.src = freshLogoUrl;
            }
            
            console.log("Logo and Favicon synced dynamically via supabaseClient!");
        }
    } catch (error) {
        console.error("Unexpected error setting up branding layout:", error);
    }
}
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// -------------------- LOAD FILE --------------------
const QuestionInput = document.getElementById("QuestionFile");
const ChooseQuestionBtn = document.getElementById("btnChooseQuestionFile");
ChooseQuestionBtn.addEventListener("click", () => {
    QuestionInput.click();
});
QuestionInput.addEventListener("change", () => {
    if (!QuestionInput.files.length) return;
    const file = QuestionInput.files[0];
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    document.getElementById("QuestionTitle").value = fileNameWithoutExtension;
});

// -------------------- UPLOAD QUESTION --------------------
async function uploadQuestion() {
  const UPLOAD_PRESET = "UploadQuestionsPreset";
  const file = document.getElementById("QuestionFile").files[0];
  const title = document.getElementById("QuestionTitle").value;
  const uploadBtn = document.getElementById("btnUploadQuestion");
  if (!file || !title) {
    showCustomDialog1("Error", "Missing data", "OK", function(){});
    return;
  }
  try {
    uploadBtn.innerText = "Uploading...";
    uploadBtn.disabled = true;
    const extension = file.name.split('.').pop().toLowerCase();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {method: "POST", body: formData});
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error("Cloudinary Error:", data);
      showCustomDialog1("Upload Failed", data?.error?.message || "Cloudinary upload failed.", "OK", function(){});
      return;
    }
    const displayTitle = `${title}.${extension}`;
    const { error } = await supabaseClient
      .from("QuestionBank")
      .insert([{title: displayTitle, QuestionUrl: data.secure_url, publicid: data.public_id}]);
    if (error) {
      showCustomDialog1("Error", error.message, "OK", function(){});
      return;
    }
    showCustomDialog1("Success", "Question uploaded successfully!", "OK", function(){});
    document.getElementById("QuestionFile").value = "";
    document.getElementById("QuestionTitle").value = "";
    document.getElementById("btnChooseQuestionFile").textContent = "Choose File";
    loadQuestions();
  } finally {
    uploadBtn.innerText = "Upload";
    uploadBtn.disabled = false;
  }
}

// -------------------- LOAD QUESTIONS --------------------
async function loadQuestions() {
  const { data, error } = await supabaseClient
    .from("QuestionBank")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  const adminList = document.getElementById("AdminQuestionList");
  adminList.innerHTML = "";
  data.forEach(question => {
    const div = document.createElement("div");
    div.className = "QuestionItems";
    const safeUrl = encodeURIComponent(question.QuestionUrl);
    const safeTitle = question.title.replace(/'/g, "\\'");
    const extension = question.QuestionUrl.split('.').pop().toLowerCase();
    let openCode = "";
    if (["pdf"].includes(extension)) {
      openCode = `openPdfReader('${question.QuestionUrl}','${safeTitle}')`;
    }else if (["jpg","jpeg","png","gif","webp"].includes(extension)){
      openCode = `showPictureViewer('${question.QuestionUrl}','${safeTitle}')`;
    }else if (["doc","docx","docm","ppt","pptx","pptm","xls","xlsx","xlsm"].includes(extension)){
      openCode = `openOfficeFile('${question.QuestionUrl}','${safeTitle}')`;
    }
  div.innerHTML = `
      <h3>${question.title}</h3>
      <button class="btnOpenQuestion" onclick="${openCode}">Open</button>
      <button class="btnDownloadQuestion" onclick="downloadQuestion(this, '${question.QuestionUrl}', '${question.title}')">Download</button>
      <button class="btnDeleteQuestion" id="delete-${question.id}" onclick="deleteQuestion(${question.id}, '${question.publicid}')">Delete</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadQuestions();

// -------------------- DELETE QUESTION --------------------
async function deleteQuestion(id, publicId) {
  const btn = document.getElementById(`delete-${id}`);
  const confirmDelete = confirm("Delete this question?");
  if (!confirmDelete) return;
  try {
    btn.innerText = "Deleting...";
    btn.disabled = true;
    const response = await fetch(
      "https://wrjivuysumgpoqmabwpw.functions.supabase.co/delete-book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId })
      }
    );
    const result = await response.json();
    console.log(result);
    await supabaseClient.from("QuestionBank").delete().eq("id", id);
    loadQuestions();
  } finally {
    btn.innerText = "Delete";
    btn.disabled = false;
  }
}
// -------------------- DOWNLOAD QUESTION --------------------
async function downloadQuestion(btn, url, fileName) {
  try {
    btn.innerText = "Downloading...";
    btn.disabled = true;
    const response = await fetch(url);
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  } finally {
    setTimeout(() => {
      btn.innerText = "Download";
      btn.disabled = false;
    }, 1500);
  }
}