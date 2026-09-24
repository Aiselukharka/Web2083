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
        window.location.replace("../LoginPage/LogInIndex.html");
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
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
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
        }
    } catch (error) {
        console.error("Unexpected error setting up branding layout:", error);
    }
}
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// ----------------------- LOAD CLASS DROPDOWN -------------------------------
async function loadClassDropdown() {
    try {
        const { data, error } = await supabaseClient
            .from('ClassTable')
            .select('ClassName');

        if (error) throw error;

        const ClassDropdown = document.getElementById("PratibhaCreatorClass");
        ClassDropdown.innerHTML = '<option value="" disabled selected>Select Class</option>';
        data.forEach(row => {
            if (row.ClassName) {
                const option = document.createElement('option');
                option.value = row.ClassName;
                option.textContent = row.ClassName;
                ClassDropdown.appendChild(option);
            }
        });
    } catch (err) {
        console.error("Error loading ClassTable:", err.message);
    }
}
    loadClassDropdown();

// -------------------- ADD PRATIBHA --------------------
const PratibhaInput = document.getElementById("PratibhaFile");
const ChoosePratibhaBtn = document.getElementById("btnChoosePratibhaFile");
ChoosePratibhaBtn.addEventListener("click", () => {
    PratibhaInput.click();
});
PratibhaInput.addEventListener("change", () => {
    if (!PratibhaInput.files.length) return;
    const file = PratibhaInput.files[0];
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    document.getElementById("PratibhaTitle").value = fileNameWithoutExtension;
});
// -------------------- UPLOAD PRATIBHA --------------------
async function uploadPratibha() {
  const UPLOAD_PRESET = "UploadBalPratibhaPreset";
  const file = document.getElementById("PratibhaFile").files[0];
  const title = document.getElementById("PratibhaTitle").value;
  const CreatorName = document.getElementById("PratibhaCreatorName").value;
  const CreatorClass = document.getElementById("PratibhaCreatorClass").value;
  const uploadBtn = document.getElementById("btnUploadPratibha");
  if (!file || !title || !CreatorName || !CreatorClass) {
    showCustomDialog1("Missing Data", "Please provide Pratibha title, Creator's Name, Creator's Class and select Pratibha file.", "OK", function(){});
    return;
  }
  try {
    uploadBtn.innerText = "Uploading...";
    uploadBtn.disabled = true;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {method: "POST", body: formData});
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error("Cloudinary Error:", data);
      showCustomDialog3(
        "File Too Large",
        `You can't upload files larger than 10 MB.<br><br>
        You can compress online in:
        <a href="https://bigpdf.11zon.com/en/compress-pdf/#google_vignette"
            target="_blank"
            style="color:blue; font-weight:bold;">
            SmallPDF
        </a>
        or download and install Ghostscript to compress on your computer:<br><br>
        <a href="https://ghostscript.com/releases/gsdnld.html"
            target="_blank"
            style="color:blue; font-weight:bold;">
            Ghostscript Download
        </a>`,
        "OK",
        () => {}
      );
      return;
    }
    const displayTitle = `${title}`;
    const { error } = await supabaseClient
      .from("BalPratibhaTable")
      .insert([{PratibhaTopic: displayTitle, PratibhaCreatorName: CreatorName, PratibhaCreatorClass: CreatorClass, PratibhaUrl: data.secure_url, PratibhaPublicId: data.public_id}]);
    if (error) {
      showCustomDialog1("Error", error.message, "OK", function(){});
      return;
    }
    showCustomDialog1("Success", "Pratibha is uploaded successfully!", "OK", function(){});
    document.getElementById("PratibhaFile").value = "";
    document.getElementById("PratibhaTitle").value = "";
    document.getElementById("PratibhaCreatorName").value = "";
    document.getElementById("PratibhaCreatorClass").value = "";
    document.getElementById("btnChoosePratibhaFile").textContent = "Choose Pratibha";
    loadPratibha();
  } finally {
    uploadBtn.innerText = "Upload";
    uploadBtn.disabled = false;
  }
}
// -------------------- LOAD PRATIBHA --------------------
async function loadPratibha() {
  const { data, error } = await supabaseClient
    .from("BalPratibhaTable")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  const adminList = document.getElementById("AdminPratibhaList");
  adminList.innerHTML = "";
  data.forEach(Pratibha => {
    const div = document.createElement("div");
    div.className = "PratibhaItems";
    const safeUrl = encodeURIComponent(Pratibha.PratibhaUrl);
    const safeTitle = Pratibha.PratibhaTopic.replace(/'/g, "\\'");
    const safeCreatorName = Pratibha.PratibhaCreatorName.replace(/'/g, "\\'");
    const safeCreatorClass = Pratibha.PratibhaCreatorClass.replace(/'/g, "\\'");    
    let openCode = `showPictureViewer('${Pratibha.PratibhaUrl}','${safeTitle}')`;
    div.innerHTML = `
      <h3>${Pratibha.PratibhaTopic}</h3>
      <div class="PratibhaCreators">${Pratibha.PratibhaCreatorName}(${Pratibha.PratibhaCreatorClass})</div>
      <button class="btnOpenPratibha" onclick="${openCode}">Open</button>
      <button class="btnDownloadPratibha" onclick="downloadPratibha(this, '${Pratibha.PratibhaUrl}', '${Pratibha.PratibhaTopic}')">Download</button>
      <button class="btnDeletePratibha" id="delete-${Pratibha.id}" onclick="deletePratibha(${Pratibha.id}, '${Pratibha.PratibhaPublicId}')">Delete</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadPratibha();
// -------------------- DELETE PRATIBHA --------------------
async function deletePratibha(id, publicId) {
  const btn = document.getElementById(`delete-${id}`);
  const confirmDelete = confirm("Delete this Pratibha?");
  if (!confirmDelete) return;
  try {
    btn.innerText = "Deleting...";
    btn.disabled = true;
    console.log("Deleting publicId:", publicId);
    const response = await fetch(
      "https://wrjivuysumgpoqmabwpw.supabase.co/functions/v1/delete-book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId })
      }
    );
    const result = await response.json();
    console.log(result);
    await supabaseClient
      .from("BalPratibhaTable")
      .delete()
      .eq("id", id);
    loadPratibha();
  } finally {
    btn.innerText = "Delete";
    btn.disabled = false;
  }
}
// -------------------- DOWNLOAD PRATIBHA --------------------
async function downloadPratibha(btn, url, fileName) {
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