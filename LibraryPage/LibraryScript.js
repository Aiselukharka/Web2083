// -------------------- GLOBAL HELPER FUNCTIONS --------------------

window.changeLanguage = function(lang) {
    if (lang === 'en') {
        console.log('Language switched to English');
    } else {
        console.log('Language switched to Nepali');
    }
};
window.openPdfReader = function(pdfUrl, title = "") {
  const oldModal = document.getElementById("pdfModal");
  if (oldModal) oldModal.remove();
  let zoom = 1;  
  const modal = document.createElement("div");
  modal.id = "pdfModal";
  modal.style.cssText = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,.85);
    z-index:99999;
    display:flex;
    flex-direction:column;
  `;  
  const toolbar = document.createElement("div");
  toolbar.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:10px 15px;
    background:#222;
  `;  
  const titleDiv = document.createElement("div");
  titleDiv.textContent = title;
  titleDiv.style.color = "white";
  titleDiv.style.fontSize = "18px";  
  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "10px";  
  const btnZoomOut = document.createElement("button");
  btnZoomOut.textContent = "−";
  const btnZoomIn = document.createElement("button");
  btnZoomIn.textContent = "+";
  const btnClose = document.createElement("button");
  btnClose.textContent = "✕";  
  [btnZoomOut, btnZoomIn, btnClose].forEach(btn => {
    btn.style.padding = "8px 14px";
    btn.style.fontSize = "18px";
    btn.style.fontWeight = "bold";
    btn.style.cursor = "pointer";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.background = "#555";
    btn.style.color = "white";
  });  
  btnZoomOut.onmouseenter = () => { btnZoomOut.style.background = "blue"; btnZoomOut.style.color = "yellow"; };
  btnZoomOut.onmouseleave = () => { btnZoomOut.style.background = "#555"; btnZoomOut.style.color = "white"; };
  btnZoomIn.onmouseenter = () => { btnZoomIn.style.background = "green"; btnZoomIn.style.color = "yellow"; };
  btnZoomIn.onmouseleave = () => { btnZoomIn.style.background = "#555"; btnZoomIn.style.color = "white"; };
  btnClose.onmouseenter = () => { btnClose.style.background = "red"; btnClose.style.color = "yellow"; };
  btnClose.onmouseleave = () => { btnClose.style.background = "#555"; btnClose.style.color = "white"; };  
  btnClose.onclick = () => modal.remove();  
  const container = document.createElement("div");
  container.style.flex = "1";
  container.style.overflow = "auto";  
  const iframe = document.createElement("iframe");  
  iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;  
  iframe.style.cssText = `
    width:100%;
    height:100%;
    border:none;
    transform-origin:top center;
  `;  
  function updateZoom() {
    iframe.style.transform = `scale(${zoom})`;
  }  
  btnZoomIn.onclick = () => {
    zoom += 0.1;
    updateZoom();
  };
  btnZoomOut.onclick = () => {
    if (zoom > 0.5) {
      zoom -= 0.1;
      updateZoom();
    }
  };  
  controls.append(btnZoomOut, btnZoomIn, btnClose);
  toolbar.append(titleDiv, controls);
  container.appendChild(iframe);
  modal.append(toolbar, container);
  document.body.appendChild(modal);
};
window.showPictureViewer = function(url, title) {
    window.openPdfReader(url, title); 
};
window.openOfficeFile = function(url, title) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    window.openPdfReader(officeUrl, title);
};
window.downloadBook = async function(btn, url, fileName) {
    if (!btn) return;
    try {
        btn.innerText = "Downloading...";
        btn.disabled = true;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");
        const blob = await response.blob();
        const a = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    } catch (err) {
        console.error("Download failed", err);
        alert("Download failed. You can try right-click and 'Save link as'.");
    } finally {
        setTimeout(() => {
            if (btn) {
                btn.innerText = "Download";
                btn.disabled = false;
            }
        }, 1200);
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function escapeHtmlAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function escapeUrl(url) {
    return url.replace(/'/g, '%27');
}

// -------------------- PAGE NAVIGATION --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
if (PageNavigationDripDown) {
    PageNavigationDripDown.addEventListener("change", function() {
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
}

// -------------------- LOAD BOOKS FROM DEFAULT FOLDER STRUCTURE --------------------
async function loadBooksFromClass(className) {
    const container = document.getElementById("BookListContainer");
    if (!container) return;    
    container.innerHTML = '<div class="loading-text">📖 Loading books for ' + className + '...</div>';    
    try {
        const githubPath = `https://api.github.com/repos/Aiselukharka/Web2083/contents/DefaultBooks/${className}`;
        const response = await fetch(githubPath);        
        if (!response.ok) {
            if (response.status === 404) {
                container.innerHTML = '<div class="info-text">📚 No books found for ' + className + '. Check back later!</div>';
                return;
            }
            throw new Error("GitHub API error");
        }        
        const files = await response.json();
        const pdfFiles = files.filter(file => file.type === "file" && file.name.toLowerCase().endsWith(".pdf"));        
        if (pdfFiles.length === 0) {
            container.innerHTML = '<div class="info-text">📚 No PDF books available for ' + className + '.</div>';
            return;
        }        
        container.innerHTML = "";        
        pdfFiles.forEach(book => {
            const div = document.createElement("div");
            div.className = "BookCard";
            const safeName = book.name.replace(/'/g, "\\'");            
            const fileUrl = book.download_url;
            div.innerHTML = `
                <div class="BookName">📘 ${escapeHtml(book.name)}</div>
                <button class="btnOpenBook" onclick="openPdfReader('${escapeUrl(fileUrl)}', '${escapeHtmlAttr(safeName)}')">📖 Open</button>
                <button class="btnDownloadBook" onclick="downloadBook(this, '${escapeUrl(fileUrl)}', '${escapeHtmlAttr(book.name)}')">💾 Download</button>
            `;
            container.appendChild(div);
        });        
    } catch (err) {
        console.error("Error loading class books:", err);
        container.innerHTML = '<div class="error-text">⚠️ Unable to load books. Please check your network connection.</div>';
    }
}

// -------------------- LOAD MORE BOOKS FROM SUPABASE --------------------
async function loadMoreBooksFromSupabase() {
    const container = document.getElementById("BookListContainer");
    if (!container) return;    
    container.innerHTML = '<div class="loading-text">🌟 Loading more books from library...</div>';    
    try {
        const { data, error } = await supabaseClient
            .from("librarybooks")
            .select("*")
            .order("id", { ascending: false });        
        if (error) {
            console.error("Supabase error:", error);
            container.innerHTML = '<div class="error-text">⚠️ Could not fetch books from database.</div>';
            return;
        }        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="info-text">📭 No additional books available. Check back soon!</div>';
            return;
        }        
        container.innerHTML = "";        
        data.forEach(book => {
            const div = document.createElement("div");
            div.className = "BookCard";
            const bookUrl = book.bookurl || "";
            const titleRaw = book.title || "Untitled";
            const safeTitle = titleRaw.replace(/'/g, "\\'");            
            let cleanUrlPath = bookUrl.split('?')[0].toLowerCase();
            let extension = cleanUrlPath.split('.').pop();            
            let openCode = "";
            if (["pdf"].includes(extension) || bookUrl.includes("/raw/upload/")) {
                openCode = `openPdfReader('${escapeUrl(bookUrl)}','${escapeHtmlAttr(safeTitle)}')`;
            } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                openCode = `openPdfReader('${escapeUrl(bookUrl)}','${escapeHtmlAttr(safeTitle)}')`;
            } else if (["doc", "docx", "docm", "ppt", "pptx", "pptm", "xls", "xlsx", "xlsm"].includes(extension)) {
                openCode = `openOfficeFile('${escapeUrl(bookUrl)}','${escapeHtmlAttr(safeTitle)}')`;
            } else {
                openCode = `openPdfReader('${escapeUrl(bookUrl)}','${escapeHtmlAttr(safeTitle)}')`;
            }            
            div.innerHTML = `
                <div class="BookName">📚 ${escapeHtml(titleRaw)}</div>
                <button class="btnOpenBook" onclick="${openCode}">🔍 Open</button>
                <button class="btnDownloadBook" onclick="downloadBook(this, '${escapeUrl(bookUrl)}', '${escapeHtmlAttr(titleRaw)}')">💾 Download</button>
            `;
            container.appendChild(div);
        });        
    } catch (err) {
        console.error("Error loading more books:", err);
        container.innerHTML = '<div class="error-text">❌ Failed to load additional books. Please refresh the page.</div>';
    }
}

// -------------------- CLASS SELECTION HANDLER --------------------
const classDropdown = document.getElementById("ClassSelectionDropdownSelect");
if (classDropdown) {
    classDropdown.addEventListener("change", function() {
        const selectedValue = this.value;        
        if (!selectedValue || selectedValue === "") {
            const container = document.getElementById("BookListContainer");
            if (container) {
                container.innerHTML = '<div class="info-text">📖 Please select a class to view books.</div>';
            }
            return;
        }        
        if (selectedValue === "MoreBooks") {
            loadMoreBooksFromSupabase();
        } else {
            loadBooksFromClass(selectedValue);
        }
    });
}

// -------------------- INITIAL DISPLAY MESSAGE --------------------
window.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("BookListContainer");
    if (container) {
        container.innerHTML = '<div class="info-text">📖 Please select a class from the dropdown above to view books.</div>';
    }
});

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