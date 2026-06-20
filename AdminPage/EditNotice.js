//Style Sheet for Edit Notice Page
const NoticeStyleSheet = document.createElement('style');
NoticeStyleSheet.textContent = `
/* Style for Notice Edit Box */
#NoticeEditBox{
    width: 100%;
    height: auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #eeeecc, #eeeebb);
}
.NoticeItems{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding: 2vh 0 2vh 0;
    margin: 0 0 2vh 0;
    box-shadow: 2px 2px 5px #111111;
}
.NoticeItems h3{
    width: 40%;
    text-align: left;
    font-size: 2vw;
}
.btnOpenNotice{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #009900, #00cc00, #009900);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
    cursor: pointer;
}
.btnOpenNotice:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}
.btnDownloadNotice{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #000099, #0000cc, #000099);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
}
.btnDownloadNotice:hover{
    background: linear-gradient(180deg, #000066, #000099, #000066);
    color: #ffff00;
}
.btnDeleteNotice{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #990000, #cc0000, #990000);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
}
.btnDeleteNotice:hover{
    background: linear-gradient(180deg, #660000, #990000, #660000);
    color: #ffff00;
}
#AddNoticeHead{
    width: 100%;
    text-align: center;
    font-size: 3vw;
    font-weight: bold;
    color: #0000aa;
    margin: 8vh 0 0 0;
}
#AddNoticeBox{
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
#NoticeFile{display: none;}
#btnChooseNoticeFile{
    width: 20%;
    padding: 1vw 0 1vw 0;
    background: linear-gradient(180deg, #009900, #00cc00, #009900);
    color: #ffffff;
    border-radius: 4vw 0 0 4vw;
    font-size: 2vw;
    font-weight: bold;
    cursor: pointer;
}
#btnChooseNoticeFile:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}
#NoticeTitle{
    width: 50%;
    text-align: left;
    font-size: 2vw;
    font-weight: bold;
    padding: 2vh;    
}
#btnUploadNotice{
    width: 20%;
    font-size: 2vw;
    font-weight: bold;
    background: linear-gradient(180deg, #009900, #00aa00, #009900);
    color: #ffffff;
    padding: 1vw 0 1vw 0;
    border-radius: 4vw;
    cursor: pointer;
    border-radius: 0 4vw 4vw 0;
}
#btnUploadNotice:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;    
}


`;
document.head.appendChild(NoticeStyleSheet);

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
      "https://wrjivuysumgpoqmabwpw.functions.supabase.co/delete-book",
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