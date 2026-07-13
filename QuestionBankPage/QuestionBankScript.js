// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "HumanResourcePage": "../HumanResourcePage/HumanResourceIndex.html",
        "HomePage": "../index.html",
        "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "../GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "../SMC_TGCPage/SMC_TGCIndex.html",
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
    }
    else if (["jpg","jpeg","png","gif","webp"].includes(extension)) {
      openCode = `showPictureViewer('${question.QuestionUrl}','${safeTitle}')`;
    }
    else if (["doc","docx","ppt","pptx","xls","xlsx"].includes(extension)) {
      openCode = `openOfficeFile('${question.QuestionUrl}','${safeTitle}')`;
    }
  div.innerHTML = `
      <h3>${question.title}</h3>
      <button class="btnOpenQuestion" onclick="${openCode}">Open</button>
      <button class="btnDownloadQuestion" onclick="downloadQuestion(this, '${question.QuestionUrl}', '${question.title}')">Download</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadQuestions();

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


