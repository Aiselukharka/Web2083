const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "TeacherPage": "../TeacherPage/TeacherIndex.html",
        "HomePage": "../index.html",
        "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "../GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
        "AdminPage": "../AdminPage/LogInIndex.html"        
    };

    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// -------------------- Scripts for Notice Edit Box --------------------
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
  const adminList = document.getElementById("NoticeList");
  adminList.innerHTML = "";
  data.forEach(notice => {
    const div = document.createElement("div");
    div.className = "NoticeItems";
    const safeUrl = encodeURIComponent(notice.NoticeUrl);
    const safeTitle = notice.title.replace(/'/g, "\\'");
    div.innerHTML = `
      <h3>${notice.title}</h3>
      <button class="btnOpenNotice" onclick="showPictureViewer('${notice.NoticeUrl}', '${safeTitle}')">Open</button>
      <button class="btnDownloadNotice" onclick="downloadNotice(this, '${notice.NoticeUrl}')">Download</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadNotices();

// -------------------- DOWNLOAD NOTICE --------------------
async function downloadNotice(btn, url) {
  try {
    btn.innerText = "Downloading...";
    btn.disabled = true;
    const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(() => {
      btn.innerText = "Download";
      btn.disabled = false;
    }, 1500);
  }
}


