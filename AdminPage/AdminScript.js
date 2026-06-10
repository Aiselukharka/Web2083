const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dfsaihbk7";

// -------------------- PROTECTION FORM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
    if (error || !session) {
      showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace(
            "LoginIndex.html"
        );
        return;
    }
    document.body.style.display = "block";
}

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "LogInIndex.html",
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "TeacherPage": "../TeacherPage/TeacherIndex.html",
        "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "../GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
        "HomePage": "../index.html"
    };

    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
dateBox.innerText =
  AD2BS(new Date()) +
  " (" +
  new Date().toISOString().split('T')[0] +
  ")";

  //----------------------- Script for Admin Tools Dropdown -----------------------
document.getElementById("AdminToolsSelect").addEventListener("change", async function () {
    switch (this.value) {
        case "ChangeEmailTool":
            window.location.href = "ChangeEmailIndex.html";
            break;
        case "ChangePasswordTool":
            window.location.href = "ChangePasswordIndex.html";
            break;
        case "LogoutAllDevicesTool":
          showCustomDialog2(
              "Confirm Logout",
              "Logout from all devices?",
              "Yes",
              "Cancel",
              async function () {
                  await supabaseClient.auth.signOut({
                      scope: "global"
                  });
                  window.location.replace("LoginIndex.html");
              },
              function () {}
          );
          break;
        case "LogoutAllDevicesTool":
          const confirm = showCustomDialog2("Confirm Logout", "Logout from all devices?", "Yes", "Cancel", function() {}, function() {});
            if (confirm==="Yes") {
                await supabaseClient
                .auth
                .signOut({
                    scope: "global"
                });
                window.location.replace("LoginIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "AddAdminIndex.html";
            break;
    }
    this.selectedIndex = 0;
});

// -------------------- NAVIGATION DROPDOWN of Edit Boxes --------------------
const NavigationDropDown = document.getElementById("NavigationSelect");
const editBoxes = document.querySelectorAll(".EditBoxes");

NavigationDropDown.addEventListener("change", function () {
  editBoxes.forEach(box => box.style.display = "none");
  const selectedValue = this.value;
  if (selectedValue) {
    document.getElementById(selectedValue).style.display = "block";
  }
});
// -------------------- Scripts for Library Edit Box --------------------
// -------------------- LOAD FILE --------------------
const BookInput = document.getElementById("LibraryFile");
const ChooseBookBtn = document.getElementById("btnChooseLibraryFile");
ChooseBookBtn.addEventListener("click", () => {
    BookInput.click();
});
BookInput.addEventListener("change", () => {
    if (!BookInput.files.length) return;
    const file = BookInput.files[0];
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    document.getElementById("BookTitle").value = fileNameWithoutExtension;
});
// -------------------- UPLOAD BOOK --------------------
async function uploadBook() {
  const UPLOAD_PRESET = "UploadBooksPreset";
  const file = document.getElementById("LibraryFile").files[0];
  const title = document.getElementById("BookTitle").value;
  const uploadBtn = document.getElementById("btnUploadBook");
  if (!file || !title) {
    showCustomDialog1("Missing Data", "Please provide book title and select a file.", "OK", function(){});
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
    const displayTitle = `${title}.${extension}`;
    const { error } = await supabaseClient
      .from("librarybooks")
      .insert([{title: displayTitle, bookurl: data.secure_url, publicid: data.public_id}]);
    if (error) {
      showCustomDialog1("Error", error.message, "OK", function(){});
      return;
    }
    showCustomDialog1("Success", "Book uploaded successfully!", "OK", function(){});
    document.getElementById("LibraryFile").value = "";
    document.getElementById("BookTitle").value = "";
    document.getElementById("btnChooseLibraryFile").textContent = "Choose File";
    loadBooks();
  } finally {
    uploadBtn.innerText = "Upload";
    uploadBtn.disabled = false;
  }
}
// -------------------- LOAD BOOKS --------------------
async function loadBooks() {
  const { data, error } = await supabaseClient
    .from("librarybooks")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  const adminList = document.getElementById("AdminBookList");
  adminList.innerHTML = "";
  data.forEach(book => {
    const div = document.createElement("div");
    div.className = "BookItems";
    const safeUrl = encodeURIComponent(book.bookurl);
    const safeTitle = book.title.replace(/'/g, "\\'");
    const extension = book.title.split('.').pop().toLowerCase();
    let openCode = "";
    if (["pdf"].includes(extension)) {
      openCode = `openPdfReader('${book.bookurl}','${safeTitle}')`;
    }else if (["jpg","jpeg","png","gif","webp"].includes(extension)){
      openCode = `showPictureViewer('${book.bookurl}','${safeTitle}')`;
    }else if (["doc","docx","docm","ppt","pptx","pptm","xls","xlsx","xlsm"].includes(extension)){
      openCode = `openOfficeFile('${book.bookurl}','${safeTitle}')`;
    }
    div.innerHTML = `
      <h3>${book.title}</h3>
      <button class="btnOpenBook" onclick="${openCode}">Open</button>
      <button class="btnDownloadBook" onclick="downloadBook(this, '${book.bookurl}', '${book.title}')">Download</button>
      <button class="btnDeleteBook" id="delete-${book.id}" onclick="deleteBook(${book.id}, '${book.publicid}')">Delete</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadBooks();
// -------------------- DELETE BOOK --------------------
async function deleteBook(id, publicId) {
  const btn = document.getElementById(`delete-${id}`);
  const confirmDelete = confirm("Delete this book?");
  if (!confirmDelete) return;
  try {
    btn.innerText = "Deleting...";
    btn.disabled = true;
    const response = await fetch(
      "https://jrkockwjffpgdpqoymtk.functions.supabase.co/delete-book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId })
      }
    );
    const result = await response.json();
    console.log(result);
    await supabaseClient
      .from("librarybooks")
      .delete()
      .eq("id", id);
    loadBooks();
  } finally {
    btn.innerText = "Delete";
    btn.disabled = false;
  }
}
// -------------------- DOWNLOAD BOOK --------------------
async function downloadBook(btn, url, fileName) {
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

// -------------------- Scripts for Notice Edit Box --------------------
// -------------------- LOAD FILE --------------------
const NoticeInput = document.getElementById("NoticeFile");
const ChooseNoticeBtn = document.getElementById("btnChooseNoticeFile");
ChooseNoticeBtn.addEventListener("click", () => {
    NoticeInput.click();
});
NoticeInput.addEventListener("change", () => {
    if (!NoticeInput.files.length) return;
    const file = NoticeInput.files[0];
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    document.getElementById("NoticeTitle").value = fileNameWithoutExtension;
});
// -------------------- UPLOAD NOTICE --------------------
async function uploadNotice() {
  const UPLOAD_PRESET = "UploadNoticesPreset";
  const file = document.getElementById("NoticeFile").files[0];
  const title = document.getElementById("NoticeTitle").value;
  const uploadBtn = document.getElementById("btnUploadNotice");
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
      .from("SchoolNotices")
      .insert([{title: displayTitle, NoticeUrl: data.secure_url, publicid: data.public_id }]);
    if (error) {
      showCustomDialog1("Error", error.message, "OK", function(){});
      return;
    }
    showCustomDialog1("Success", "Notice uploaded successfully!", "OK", function(){});
    document.getElementById("NoticeFile").value = "";
    document.getElementById("NoticeTitle").value = "";
    document.getElementById("btnChooseNoticeFile").textContent = "Choose File";
    loadNotices();
  } finally {
    uploadBtn.innerText = "Upload";
    uploadBtn.disabled = false;
  }
}
// -------------------- LOAD NOTICES --------------------
async function loadNotices() {
  const { data, error } = await supabaseClient
    .from("SchoolNotices")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  const adminList = document.getElementById("AdminNoticeList");
  adminList.innerHTML = "";
  data.forEach(notice => {
    const div = document.createElement("div");
    div.className = "NoticeItems";
    const safeUrl = encodeURIComponent(notice.NoticeUrl);
    const safeTitle = notice.title.replace(/'/g, "\\'");
    const extension = notice.NoticeUrl.split('.').pop().toLowerCase();
    let openCode = "";
    if (["pdf"].includes(extension)) {
      openCode = `openPdfReader('${notice.NoticeUrl}','${safeTitle}')`;
    }else if (["jpg","jpeg","png","gif","webp"].includes(extension)){
      openCode = `showPictureViewer('${notice.NoticeUrl}','${safeTitle}')`;
    }else if (["doc","docx","docm","ppt","pptx","pptm","xls","xlsx","xlsm"].includes(extension)){
      openCode = `openOfficeFile('${notice.NoticeUrl}','${safeTitle}')`;
    }
    div.innerHTML = `
      <h3>${notice.title}</h3>
      <button class="btnOpenNotice" onclick="${openCode}">Open</button>
      <button class="btnDownloadNotice" onclick="downloadNotice(this, '${notice.NoticeUrl}', '${notice.title}')">Download</button>
      <button class="btnDeleteNotice" id="delete-${notice.id}" onclick="deleteNotice(${notice.id}, '${notice.publicid}')">Delete</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadNotices();
// -------------------- DELETE NOTICE --------------------
async function deleteNotice(id, publicId) {
  const btn = document.getElementById(`delete-${id}`);
  const confirmDelete = confirm("Delete this notice?");
  if (!confirmDelete) return;
  try {
    btn.innerText = "Deleting...";
    btn.disabled = true;
    const response = await fetch(
      "https://jrkockwjffpgdpqoymtk.functions.supabase.co/delete-book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId })
      }
    );
    const result = await response.json();
    console.log(result);
    await supabaseClient.from("SchoolNotices").delete().eq("id", id);
    loadNotices();
  } finally {
    btn.innerText = "Delete";
    btn.disabled = false;
  }
}
// -------------------- DOWNLOAD NOTICE --------------------
async function downloadNotice(btn, url, fileName) {
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

// -------------------- Scripts for Question Edit Box --------------------
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
      "https://jrkockwjffpgdpqoymtk.functions.supabase.co/delete-book",
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

