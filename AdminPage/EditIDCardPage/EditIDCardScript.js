if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";
let SelectedIDStudents=[];
let IDSchoolInfo={};
let IDYear="";
let IDMotto="";
let IDClassName="";

// -------------------- PROTECTION FROM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {data: { session }, error} = await supabaseClient.auth.getSession();
    if (error || !session) {
        showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("../LoginPage/LogInIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDropDown = document.getElementById("PageNavigationSelect");
if (PageNavigationDropDown) {
    PageNavigationDropDown.addEventListener("change", function () {
        const pageMap = {
            "AdminPage": "../LoginPage/LogInIndex.html",
            "LibraryPage": "../../LibraryPage/LibraryIndex.html",
            "NoticePage": "../../NoticePage/NoticeIndex.html",
            "QuestionBankPage": "../../QuestionBankPage/QuestionBankIndex.html",
            "StudentPage": "../../StudentPage/StudentIndex.html",
            "HumanResourcePage": "../../HumanResourcePage/HumanResourceIndex.html",
            "BalPratibhaPage": "../../BalPratibhaPage/BalPratibhaIndex.html",
            "AboutUsPage": "../../AboutUsPage/AboutUsIndex.html",
            "GalleryPage": "../../GalleryPage/GalleryIndex.html",
            "SMC_TGC_Page": "../../SMC_TGC_Page/SMC_TGC_Index.html",
            "HelpingHandPage": "../../HelpingHandPage/HelpingHandIndex.html",
            "HomePage": "../../index.html"
        };   
        const selectedPage = pageMap[this.value];
        if (selectedPage) {
            window.location.href = selectedPage;
        }
    });
}
// -------------------- NAVIGATE ADMIN EDITS --------------------
const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
if (EditNavigationDropDown) {
    EditNavigationDropDown.addEventListener("change", function () {
        const pageMap = {
            "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
            "ResultEditBox": "../EditResultPage/EditResultIndex.html",
            "RoutineEditBox": "../EditRoutinePage/EditRoutineIndex.html",
            "StudentAttendanceEditBox": "../EditStudentAttendancePage/EditStudentAttendanceIndex.html",
            "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
            "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
            "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
            "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html",
            "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
            "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
            "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
            "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
            "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
            "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
            "ClassEditBox": "../EditClassPage/EditClassIndex.html",
            "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
        };   
        const selectedEdit = pageMap[this.value];
        if (selectedEdit) {
            window.location.href = selectedEdit;
        }
    });
}
// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
if (dateBox && typeof AD2BS === 'function') {
    dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";
}
//----------------------- Script for Admin Tools Dropdown -----------------------
const adminToolsSelect = document.getElementById("AdminToolsSelect");
if (adminToolsSelect) {
    adminToolsSelect.addEventListener("change", async function () {
        switch (this.value) {
        case "ChangePasswordTool":
            window.location.href = "../ChangePasswordPage/ChangePasswordIndex.html";
            break;
        case "LogoutThisDeviceTool":
            showCustomDialog2(
            "Confirm Logout",
            "Logout from this device?",
            "Yes",
            "Cancel",
            async function () {
                await supabaseClient.auth.signOut({scope: "local"});
                window.location.replace("../LoginPage/LogInIndex.html");
            },
            function () {}
        );
        break;
        case "LogoutAllDevicesTool":
        const confirm = showCustomDialog2("Confirm Logout", "Logout from all devices?", "Yes", "Cancel", function() {}, function() {});
            if (confirm==="Yes") {
                await supabaseClient .auth .signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html";
            break;
    }
        this.selectedIndex = 0;
    });
}

// Dynamically show logo and favicon
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single();

        if (error) {
            console.error("Supabase query error loading branding:", error.message);
            return;
        }

        if (data && data.Value) {
            const freshLogoUrl = data.Value;

            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) {
                faviconElement.href = freshLogoUrl;
            }

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
document.addEventListener("DOMContentLoaded", async () => {
    loadDynamicLogoAndFavicon();
    loadClasses();
});

async function loadClasses() {
    const select = document.getElementById("IDCardClassSelectionSelect");
    select.innerHTML =
        `<option disabled selected>Select Class</option>`;
    const { data, error } = await supabaseClient
        .from("ClassTable")
        .select("ClassName")
        .order("SortOrder");
    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }
    data.forEach(row => {
        const option = document.createElement("option");
        option.value = row.ClassName;
        option.textContent = row.ClassName;
        select.appendChild(option);
    });
}
document.getElementById("IDCardClassSelectionSelect")
.addEventListener("change",function(){
    loadStudents(this.value);
});

async function loadStudents(className) {
    const box = document.getElementById("IDCardStudentListBox");
    box.innerHTML = "Loading...";
    const { data: classRow, error: classError } = await supabaseClient
        .from("ClassTable")
        .select("id")
        .eq("ClassName", className)
        .single();
    if (classError) {
        console.error(classError);
        box.innerHTML = "Unable to find class.";
        return;
    }
    const { data: students, error: studentError } = await supabaseClient
        .from("StudentDataTable")
        .select(` RollNo, StudentName, StudentAddress, Contact, FatherName, MotherName, PhotoUrl `)
        .eq("ClassID", classRow.id)
        .order("RollNo");
    if (studentError) {
        console.error(studentError);
        box.innerHTML = "Unable to load students.";
        return;
    }
    let html = `
    <div id="IDTableBox">
    <table id="IDTable"
    style="width:100%;border-collapse:collapse;background:#fff;">
        <thead>
            <tr style="background:#000;color:#fff;">
                <th style="padding:12px;text-align:center;">
                    <input type="checkbox" checked id="SelectAllStudents">
                </th>
                <th style="padding: clamp(0.4rem, 1vw, 2rem) 0;">Roll</th>
                <th style="padding: clamp(0.4rem, 1vw, 2rem) 0;">Name</th>
                <th style="padding: clamp(0.4rem, 1vw, 2rem) 0;">Address</th>
                <th style="padding: clamp(0.4rem, 1vw, 2rem) 0;">Contact</th>
                <th style="padding: clamp(0.4rem, 1vw, 2rem) 0;">Father</th>
                <th style="padding: clamp(0.4rem, 1vw, 2rem) 0;">Mother</th>
            </tr>
        </thead>
        <tbody>        
    `;
    students.forEach(student => {
        html += `
        <tr style="height:3vw;">
            <td><input type="checkbox" class="IDStudentCheck" checked data-student='${JSON.stringify(student)}'></td>
            <td>${student.RollNo}</td>
            <td>${student.StudentName}</td>
            <td>${student.StudentAddress}</td>
            <td>${student.Contact}</td>
            <td>${student.FatherName}</td>
            <td>${student.MotherName}</td>
        </tr>
        `;
    });
    html += `
        </tbody>
    </table>
    </div>
    <br>
    <button id="btnCreateIDCard">Create ID Card</button>
    `;
    box.innerHTML = html;
    document.getElementById("btnCreateIDCard").onclick = openIDPopup;
    const selectAll = document.getElementById("SelectAllStudents");
    selectAll.addEventListener("change", function () {
        document.querySelectorAll(".IDStudentCheck")
            .forEach(cb => {
                cb.checked = this.checked;
            });
    });    
}
document.getElementById("btnIDCreate").onclick=createIDCards;

function openIDPopup(){
    const selected=document.querySelectorAll(
        ".IDStudentCheck:checked"
    );
    if(selected.length===0){
        alert("Please select at least one student.");
        return;
    }
    document.getElementById("IDPopupOverlay").style.display="flex";
}
document.getElementById("btnIDCancel")
.onclick=function(){
    document.getElementById(
        "IDPopupOverlay"
    ).style.display="none";
};

async function getSchoolInformation(){
    const {data,error}=await supabaseClient
        .from("AboutSchoolTable")
        .select("Name,Value");
    if(error){
        console.error(error);
        return null;
    }
    const school={};
    data.forEach(item=>{
        school[item.Name]=item.Value;
    });
    return school;
}

let IDCards=[];
let CurrentIDCard=0;
function buildIDCard(student, school, year, motto, className, designation, livePrincipalName) {
    const singleText = `${school.SchoolName || 'SCHOOL NAME'}, ${school.SchoolAddress || 'SCHOOL ADDRESS'}`;
    //const rowRepeatedText = `${singleText} &nbsp;&nbsp;&bull;&nbsp;&nbsp; `.repeat(4);    
    const rowRepeatedText = `${singleText} `.repeat(4);    
    let watermarkHTML = '<div class="CardWatermark">';
    for (let i = 0; i < 70; i++) {
        watermarkHTML += `<div class="WatermarkRow">${rowRepeatedText}</div>`;
    }
    watermarkHTML += '</div>';
    const visualPrincipalName = livePrincipalName || school.PrincipalName || school.principal_name || "Principal Name";
    const finalPhotoUrl = student.PhotoUrl || student.photo_url || "";
    return `
<div class="IDCard">
    ${watermarkHTML}
    <div class="CardHeader">
        <img class="CardLogo" src="${school.SchoolLogo || ''}" alt="Logo">
        <div class="CardSchool">
            <div class="CardSchoolName">${school.SchoolName || ''}</div>
            <div class="CardSchoolAddress">${school.SchoolAddress || ''}</div>
            <div class="CardTitle">STUDENT ID-CARD (${year})</div>
        </div>
    </div>
    <div class="CardBody">
        <div class="CardLeft">
            <div><b>Name :</b> ${student.StudentName || ''}</div>
            <div><b>Address :</b> ${student.StudentAddress || ''}</div>
            <div><b>Roll No. :</b> ${student.RollNo || ''}</div>
            <div><b>Contact :</b> ${student.Contact || ''}</div>
            <div><b>Father :</b> ${student.FatherName || ''}</div>
            <div><b>Mother :</b> ${student.MotherName || ''}</div>
            <div><b>Class :</b> ${className || ''}</div>
        </div>
        <div class="CardRight">
            <div class="PhotoBox">
                <img src="${student.PhotoUrl || ''}" alt="StudentPhoto" width="100" height="100">
            </div>
            <div class="SignatureBox">
                <div class="SignatureDottedLine"></div>
                <div class="PrincipalName">${visualPrincipalName}</div>
                <div class="PrincipalTitle">${designation || 'Head Teacher'}</div>
            </div>
        </div>
    </div>
    <div class="CardFooter">${motto || ''}</div>
</div>
`;
}

async function createIDCards(){
    const year = document.getElementById("IDYear").value.trim();
    const motto = document.getElementById("IDMotto").value.trim();
    const designation = document.getElementById("IDDesignation").value.trim();
    const className = document.getElementById("IDCardClassSelectionSelect").selectedOptions[0].text;    
    const school = await getSchoolInformation();
    if(!school) return;    
    let livePrincipalName = "";
    if (school && (school.PrincipalName || school.principal_name)) {
        livePrincipalName = school.PrincipalName || school.principal_name;
    }    
    const selected = [...document.querySelectorAll(".IDStudentCheck:checked")];
    if(selected.length === 0) {
        alert("Please select at least one student!");
        return;
    }
    
    SelectedIDStudents = selected;
    IDSchoolInfo = school;
    IDYear = year;
    IDMotto = motto;
    IDClassName = className;
    IDCards = [];    
    selected.forEach(cb => {
        const student = JSON.parse(cb.dataset.student);
        IDCards.push(buildIDCard(student, school, year, motto, className, designation, livePrincipalName));
    });    
    CurrentIDCard = 0;
    showIDCard();
    document.getElementById("IDPopupOverlay").style.display = "none";
    document.getElementById("IDPreviewOverlay").style.display = "flex";
}

function showIDCard() {
    const container = document.getElementById("IDPreviewBody");  
    if (!container) {
        console.error("Error: Element with ID 'IDPreviewBody' was not found in the HTML.");
        return;
    }    
    if (IDCards && IDCards.length > 0) {
        container.innerHTML = IDCards[CurrentIDCard];        
        console.log("Rendering Card:", CurrentIDCard + 1, "of", IDCards.length);
        console.log("Current Motto Applied:", IDMotto);
    }
}

document.addEventListener("DOMContentLoaded", () => {    
    document.getElementById("btnIDCancel").onclick = function() {
        document.getElementById("IDPopupOverlay").style.display = "none";
    };
    document.getElementById("btnIDCreate").onclick = createIDCards;
    document.getElementById("btnCloseIDPreview").onclick = function() {
        document.getElementById("IDPreviewOverlay").style.display = "none";
    };
    document.getElementById("btnPrevIDCard").onclick = function() {
        if (CurrentIDCard > 0) {
            CurrentIDCard--;
            showIDCard();
        }
    };
    document.getElementById("btnNextIDCard").onclick = function() {
        if (CurrentIDCard < IDCards.length - 1) {
            CurrentIDCard++;
            showIDCard();
        }
    };
    document.getElementById("btnExportIDCards").onclick = exportIDCards;
});

async function exportIDCards(){
    const exportBox = document.getElementById("IDExportBox");
    const zip = new JSZip();    
    const btnExport = document.getElementById('btnExportIDCards');
    btnExport.innerText = "Downloading ....";
    btnExport.disabled = true;  
    exportBox.style.visibility = "visible";     
    for(let i=0; i<SelectedIDStudents.length; i++){
        const student = JSON.parse(SelectedIDStudents[i].dataset.student);
        exportBox.innerHTML = buildIDCard(student, IDSchoolInfo, IDYear, IDMotto, IDClassName);        
        const card = exportBox.firstElementChild;
        await new Promise(r => setTimeout(r, 150));         
        const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));
        zip.file(`${student.RollNo}-${student.StudentName}.jpg`, blob);
    }    
    exportBox.innerHTML = "";
    exportBox.style.visibility = "hidden";    
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "IDCards.zip");
    // Clean up interface variables back to normal state
    btnExport.innerText = "Download";
    btnExport.disabled = false; 
    
    showCustomDialog1("Exported", "ID cards are exported successfully.", "OK", function(){
        const previewOverlay = document.getElementById("IDPreviewOverlay");
        if (previewOverlay) {
            previewOverlay.style.display = "none";
        }
    });
}