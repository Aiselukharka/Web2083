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

//Dynamically show logo and favicon
async function loadDynamicLogoAndFavicon() {
    try {
        // Query the table natively using your pre-configured supabaseClient
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single(); // Accesses the single matching record directly

        if (error) {
            console.error("Supabase query error loading branding:", error.message);
            return;
        }

        if (data && data.Value) {
            const freshLogoUrl = data.Value;

            // 1. Update the Favicon inside the Document Head
            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) {
                faviconElement.href = freshLogoUrl;
            }

            // 2. Update the Logo Image Source inside #LogoBox
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
