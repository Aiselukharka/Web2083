const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
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

// -------------------- LOAD DEFAULT BOOKS --------------------
async function loadDefaultBooks() {
    const box = document.getElementById("DefaultBookList");
    if (!box) return;
    box.innerHTML = "<p>Loading books...</p>";
    try {
        const response = await fetch("https://api.github.com/repos/ojhagsoftware/SchoolLibrary/contents");
        const files = await response.json();
        box.innerHTML = "";
        const pdfFiles = files.filter(file => file.type === "file" && file.name.toLowerCase().endsWith(".pdf"));
        if (pdfFiles.length === 0) {
            box.innerHTML = "<p>No books found.</p>";
            return;
        }
        pdfFiles.forEach(book => {
            console.log("Name:", book.name);
            console.log("Download URL:", book.download_url);

            const div = document.createElement("div");
            div.className = "DefaultBookCards";
            div.innerHTML = `
                <div class="DefaultBookNames">${book.name}</div>
                <button class="btnOpenDefaultBook" onclick="openPdfReader('${book.download_url}', '${book.name.replace(/'/g, "\\'")}')">Open</button>
                <button class="btnDownloadDefaultBook" onclick="downloadDefaultBook('${book.download_url}', '${book.name.replace(/'/g, "\\'")}')">Download</button>
                <hr>
            `;
            box.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        box.innerHTML = "<p>Unable to load books from GitHub.</p>";
    }
}
// -------------------- DOWNLOAD DEFAULT BOOKS --------------------
function downloadDefaultBook(url, fileName) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
loadDefaultBooks();

// -------------------- LOAD BOOKS FROM CLAUDINARY --------------------
async function loadBooks() {
  const { data, error } = await supabaseClient
    .from("librarybooks")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  const adminList = document.getElementById("LibraryBookList");
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
      <div class="BookNames">${book.title}</div>
      <button class="btnOpenBook" onclick="${openCode}">Open</button>
      <button class="btnDownloadBook" onclick="downloadBook(this, '${book.bookurl}', '${book.title}')">Download</button>
      <hr>
    `;
    adminList.appendChild(div);
  });
}
loadBooks();

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

