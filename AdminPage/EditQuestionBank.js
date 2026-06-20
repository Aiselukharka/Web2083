//Style Sheet for Edit Question Bank Page
const QuestionBankStyleSheet = document.createElement('style');
QuestionBankStyleSheet.textContent = `
/* Style for Question Bank Edit Box */
#QuestionBankEditBox{
    width: 100%;
    height: auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #eeccee, #eebbee);
}
.QuestionItems{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding: 2vh 0 2vh 0;
    margin: 0 0 2vh 0;
    box-shadow: 2px 2px 5px #111111;
}
.QuestionItems h3{
    width: 40%;
    text-align: left;
    font-size: 2vw;
}
.btnOpenQuestion{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #009900, #00cc00, #009900);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
    cursor: pointer;
}
.btnOpenQuestion:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}
.btnDownloadQuestion{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #000099, #0000cc, #000099);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
}
.btnDownloadQuestion:hover{
    background: linear-gradient(180deg, #000066, #000099, #000066);
    color: #ffff00;
}
.btnDeleteQuestion{
    width: 15%;
    padding: 1vh 0 1vh 0;
    background: linear-gradient(180deg, #990000, #cc0000, #990000);
    color: #ffffff;
    font-size: 2vw;
    font-weight: bold;
    border-radius: 4vw;
}
.btnDeleteQuestion:hover{
    background: linear-gradient(180deg, #660000, #990000, #660000);
    color: #ffff00;
}
#AddQuestionHead{
    width: 100%;
    text-align: center;
    font-size: 3vw;
    font-weight: bold;
    color: #0000aa;
    margin: 8vh 0 0 0;
}
#AddQuestionBox{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding: 2vh 0 2vh 0;
    border: 2px solid #aaaaaa;
    background: linear-gradient(135deg, #aaaaaa, #bbbbbb);
    border-radius: 4vw;
    margin: 0 0 4vh 0;
}
#QuestionFile{display: none;}
#btnChooseQuestionFile{
    width: 20%;
    font-size: 2vw;
    font-weight: bold;
    background: linear-gradient(180deg, #009900, #00aa00, #009900);
    color: #ffffff;
    padding: 1vw 0 1vw 0;
    border-radius: 4vw 0 0 4vw;
    cursor: pointer;
}
#btnChooseQuestionFile:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}
#QuestionTitle{
    width: 50%;
    text-align: left;
    font-size: 2vw;
    font-weight: bold;
    padding: 2vh;
}
#btnUploadQuestion{
    width: 20%;
    font-size: 2vw;
    font-weight: bold;
    background: linear-gradient(180deg, #009900, #00aa00, #009900);
    color: #ffffff;
    padding: 1vw 0 1vw 0;
    border-radius: 0 4vw 4vw 0;
    cursor: pointer;
}
#btnUploadQuestion:hover{
    background: linear-gradient(180deg, #006600, #009900, #006600);
    color: #ffff00;
}


`;
document.head.appendChild(QuestionBankStyleSheet);

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
      "https://wrjivuysumgpoqmabwpw.functions.supabase.co/delete-book",
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
