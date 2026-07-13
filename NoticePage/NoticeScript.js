// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "HumanResourcePage": "../HumanResourcePage/HumanResourceIndex.html",
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

// -------------------- DYNAMICALLY LOADING HEADER AND FAVICON --------------------
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolLogo', 'SchoolName', 'SchoolAddress']);
        if (error) {
            console.error("Supabase query error:", error.message);
            return;
        }
        if (data && data.length > 0) {
            const brandingData = {};
            data.forEach(item => {
                brandingData[item.Name] = item.Value;
            });
            const freshLogoUrl = brandingData.SchoolLogo;
            const faviconElement = document.getElementById('dynamicFavicon');
            const logoElement = document.getElementById('SchoolLogo');            
            if (faviconElement && freshLogoUrl) {
                faviconElement.href = freshLogoUrl;            
            }
            if (logoElement && freshLogoUrl) {
                logoElement.src = freshLogoUrl;
            }
            const schoolNameElement = document.getElementById('SchoolName');
            if (schoolNameElement && brandingData.SchoolName) {
                schoolNameElement.textContent = brandingData.SchoolName;
            }
            const schoolAddressElement = document.getElementById('SchoolAddress');
            if (schoolAddressElement && brandingData.SchoolAddress) {
                schoolAddressElement.textContent = brandingData.SchoolAddress;
            }
        }
    } catch (error) {
        console.error("Unexpected error setting up branding layout:", error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicLogoAndFavicon();
});

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
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadNotices();

// -------------------- DOWNLOAD NOTICE --------------------
async function downloadNotice(btn, url, fileName) {
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

