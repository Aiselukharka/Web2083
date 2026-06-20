//Style Sheet for Edit Library Page
const LibraryStyleSheet = document.createElement('style');
LibraryStyleSheet.textContent = `
#LibraryEditBox{
    width: 100%;
    height: auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #cceecc, #bbeebb);
}
.BookItems{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding: 2vh 0 2vh 0;
    margin: 0 0 2vh 0;
    box-shadow: 2px 2px 5px #111111;
}
.BookItems h3{
    width: 40%;
    text-align: left;
    font-size: 2vw;
}
.btnOpenBook{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #009900, #00cc00, #009900);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
    cursor: pointer;
}
.btnOpenBook:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}
.btnDownloadBook{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #000099, #0000cc, #000099);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
}
.btnDownloadBook:hover{
    background: linear-gradient(180deg, #000066, #000099, #000066);
    color: #ffff00;
}
.btnDeleteBook{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #990000, #cc0000, #990000);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
}
.btnDeleteBook:hover{
    background: linear-gradient(180deg, #660000, #990000, #660000);
    color: #ffff00;
}
#AddBookHead{
    width: 100%;
    text-align: center;
    font-size: 3vw;
    font-weight: bold;
    color: #0000aa;
    margin: 8vh 0 0 0;
}
#AddBookBox{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding: 2vh 0 2vh 0;
    border: 2px solid #aaaaaa;
    background: linear-gradient(135deg, #aaaaaa, #bbbbbb);
    border-radius: 4vw;
}
#LibraryFile{display: none;}
#btnChooseLibraryFile{
    width: 20%;
    padding: 1vw 0 1vw 0;
    background: linear-gradient(180deg, #009900, #00cc00, #009900);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw 0 0 4vw;
    cursor: pointer;
}
#btnChooseLibraryFile:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}
#BookTitle{
    width: 50%;
    text-align: left;
    font-size: 2vw;
    font-weight: bold;
    padding: 2vh;    
}
#btnUploadBook{
    width: 20%;
    font-size: 2vw;
    font-weight: bold;
    background: linear-gradient(180deg, #009900, #00aa00, #009900);
    color: #ffffff;
    padding: 1vw 0 1vw 0;
    border-radius: 0 4vw 4vw 0;
    cursor: pointer;
}
#btnUploadBook:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;    
}


`;
document.head.appendChild(LibraryStyleSheet);

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