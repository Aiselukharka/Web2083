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
