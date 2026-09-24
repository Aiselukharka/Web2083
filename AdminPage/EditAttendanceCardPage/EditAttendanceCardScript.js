if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

let SelectedAttendanceStudents=[];
let AttendanceSchoolInfo={};
let AttendanceYear="";
let AttendanceMotto="";
let AttendanceClassName="";

// -------------------- PROTECTION FROM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
    if (error || !session) {
        showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("LoginIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDropDown = document.getElementById("PageNavigationSelect");
if (PageNavigationDropDown) {
    PageNavigationDropDown.addEventListener("change", function () {
        const pageMap = {
            "AdminPage": "LogInIndex.html",
            "LibraryPage": "../LibraryPage/LibraryIndex.html",
            "NoticePage": "../NoticePage/NoticeIndex.html",
            "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
            "StudentPage": "../StudentPage/StudentIndex.html",
            "HumanResourcePage": "../HumanResourcePage/HumanResourceIndex.html",
            "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
            "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
            "GalleryPage": "../GalleryPage/GalleryIndex.html",
            "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
            "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
            "HomePage": "../index.html"
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
            "IDCardEditBox": "EditIDCard.html",
            "ResultEditBox": "EditResult.html",
            "RoutineEditBox": "EditRoutine.html",
            "StudentAttendanceEditBox": "EditStudentAttendance.html",
            "StudentEditBox": "EditStudent.html",
            "LibraryEditBox": "EditLibrary.html",
            "NoticeEditBox": "EditNotice.html",
            "QuestionBankEditBox": "EditQuestionBank.html",
            "AboutUsEditBox": "EditAboutUs.html",
            "HumanResourceEditBox": "EditHumanResource.html",
            "CalendarEditBox": "EditCalendar.html",
            "BalPratibhaEditBox": "EditBalPratibha.html",
            "GalleryEditBox": "EditGallery.html",
            "HelpingHandEditBox": "EditHelpingHand.html",
            "ClassEditBox": "EditClass.html",
            "AdminEditBox": "AdminIndex.html"
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
    const select = document.getElementById("AttendanceCardClassSelectionSelect");
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
document.getElementById("AttendanceCardClassSelectionSelect")
.addEventListener("change",function(){
    loadStudents(this.value);
});

async function loadStudents(className) {
    const box = document.getElementById("AttendanceCardStudentListBox");
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
        .select(` RollNo, StudentName, StudentAddress, Contact, FatherName, MotherName `)
        .eq("ClassID", classRow.id)
        .order("RollNo");
    if (studentError) {
        console.error(studentError);
        box.innerHTML = "Unable to load students.";
        return;
    }
    let html = `
    <div id="AttendanceTableBox">
    <table id="AttendanceTable"
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
            <td><input type="checkbox" class="AttendanceStudentCheck" checked data-student='${JSON.stringify(student)}'></td>
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
    <button id="btnCreateAttendanceCard">Create Attendance Card</button>
    `;
    box.innerHTML = html;
    document.getElementById("btnCreateAttendanceCard").onclick = openAttendancePopup;
    const selectAll = document.getElementById("SelectAllStudents");
    selectAll.addEventListener("change", function () {
        document.querySelectorAll(".AttendanceStudentCheck")
            .forEach(cb => {
                cb.checked = this.checked;
            });
    });    
}
document.getElementById("btnAttendanceCreate").onclick=createAttendanceCards;

function openAttendancePopup(){
    const selected=document.querySelectorAll(
        ".AttendanceStudentCheck:checked"
    );
    if(selected.length===0){
        alert("Please select at least one student.");
        return;
    }
    document.getElementById("AttendancePopupOverlay").style.display="flex";
}
document.getElementById("btnAttendanceCancel")
.onclick=function(){
    document.getElementById(
        "AttendancePopupOverlay"
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

let AttendanceCards=[];
let CurrentAttendanceCard=0;
function buildAttendanceCard(student, school, year, motto, className, designation, livePrincipalName) {
    const singleText = `${school.SchoolName || 'SCHOOL NAME'}, ${school.SchoolAddress || 'SCHOOL ADDRESS'}`;
    const rowRepeatedText = `${singleText} `.repeat(4);    
    let watermarkHTML = '<div class="CardWatermark">';
    for (let i = 0; i < 75; i++) {
        watermarkHTML += `<div class="WatermarkRow">${rowRepeatedText}</div>`;
    }
    watermarkHTML += '</div>';
    const visualPrincipalName = livePrincipalName || school.PrincipalName || school.principal_name || "Principal Name";
    return `
<div class="AttendanceCard">
    ${watermarkHTML}
    <div class="CardHeader">
        <img class="CardLogo" src="${school.SchoolLogo || ''}" alt="Logo">
        <div class="CardSchool">
            <div class="CardSchoolName">${school.SchoolName || ''}</div>
            <div class="CardSchoolAddress">${school.SchoolAddress || ''}</div>
            <div class="CardTitle">ATTENDANCE CARD (${year})</div>
        </div>
    </div>
    <div class="CardBody">
        <div class="CardLeft">
            <div><b>Name :</b> ${student.StudentName || ''}</div>
            <div><b>Address :</b> ${student.StudentAddress || ''}</div>
            <div><b>Contact :</b> ${student.Contact || ''}</div>
            <div><b>Father :</b> ${student.FatherName || ''}</div>
            <div><b>Mother :</b> ${student.MotherName || ''}</div>
            <div><b>Class :</b> ${className || ''}</div>
        </div>
        <div class="CardRight">
            <div class="RollBox">
                <div class="RollNo">${student.RollNo || ''}</div>
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

async function createAttendanceCards(){
    const year = document.getElementById("AttendanceYear").value.trim();
    const motto = document.getElementById("AttendanceMotto").value.trim();
    const designation = document.getElementById("AttendanceDesignation").value.trim();
    const className = document.getElementById("AttendanceCardClassSelectionSelect").selectedOptions[0].text;    
    const school = await getSchoolInformation();
    if(!school) return;    
    let livePrincipalName = "";
    if (school && (school.PrincipalName || school.principal_name)) {
        livePrincipalName = school.PrincipalName || school.principal_name;
    }    
    const selected = [...document.querySelectorAll(".AttendanceStudentCheck:checked")];
    if(selected.length === 0) {
        alert("Please select at least one student!");
        return;
    }
    
    SelectedAttendanceStudents = selected;
    AttendanceSchoolInfo = school;
    AttendanceYear = year;
    AttendanceMotto = motto;
    AttendanceClassName = className;
    AttendanceCards = [];    
    selected.forEach(cb => {
        const student = JSON.parse(cb.dataset.student);
        AttendanceCards.push(buildAttendanceCard(student, school, year, motto, className, designation, livePrincipalName));
    });    
    CurrentAttendanceCard = 0;
    showAttendanceCard();
    document.getElementById("AttendancePopupOverlay").style.display = "none";
    document.getElementById("AttendancePreviewOverlay").style.display = "flex";
}

function showAttendanceCard() {
    const container = document.getElementById("AttendancePreviewBody");    
    if (!container) {
        console.error("Error: Element with ID 'AttendancePreviewBody' was not found in the HTML.");
        return;
    }    
    if (AttendanceCards && AttendanceCards.length > 0) {
        container.innerHTML = AttendanceCards[CurrentAttendanceCard];        
        console.log("Rendering Card:", CurrentAttendanceCard + 1, "of", AttendanceCards.length);
        console.log("Current Motto Applied:", AttendanceMotto);
    }
}

document.addEventListener("DOMContentLoaded", () => {    
    document.getElementById("btnAttendanceCancel").onclick = function() {
        document.getElementById("AttendancePopupOverlay").style.display = "none";
    };
    document.getElementById("btnAttendanceCreate").onclick = createAttendanceCards;
    document.getElementById("btnCloseAttendancePreview").onclick = function() {
        document.getElementById("AttendancePreviewOverlay").style.display = "none";
    };
    document.getElementById("btnPrevAttendanceCard").onclick = function() {
        if (CurrentAttendanceCard > 0) {
            CurrentAttendanceCard--;
            showAttendanceCard();
        }
    };
    document.getElementById("btnNextAttendanceCard").onclick = function() {
        if (CurrentAttendanceCard < AttendanceCards.length - 1) {
            CurrentAttendanceCard++;
            showAttendanceCard();
        }
    };
    document.getElementById("btnExportAttendanceCards").onclick = exportAttendanceCards;
});

async function exportAttendanceCards(){
    const exportBox = document.getElementById("AttendanceExportBox");
    const zip = new JSZip();    
    const btnExport = document.getElementById('btnExportAttendanceCards');
    
    // Grab the current designation from the input box so it matches perfectly
    const designation = document.getElementById("AttendanceDesignation") ? document.getElementById("AttendanceDesignation").value.trim() : "Head Teacher";
    
    btnExport.innerText = "Downloading ....";
    btnExport.disabled = true;
    exportBox.style.visibility = "visible";     
    
    let livePrincipalName = "";
    if (AttendanceSchoolInfo && (AttendanceSchoolInfo.PrincipalName || AttendanceSchoolInfo.principal_name)) {
        livePrincipalName = AttendanceSchoolInfo.PrincipalName || AttendanceSchoolInfo.principal_name;
    }

    for(let i=0; i<SelectedAttendanceStudents.length; i++){
        const student = JSON.parse(SelectedAttendanceStudents[i].dataset.student);
        
        // FIX: Added the missing livePrincipalName and designation variables so the card matches the preview exactly
        exportBox.innerHTML = buildAttendanceCard(student, AttendanceSchoolInfo, AttendanceYear, AttendanceMotto, AttendanceClassName, designation, livePrincipalName);        
        
        const card = exportBox.firstElementChild;
        await new Promise(r => setTimeout(r, 150));         
        const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));
        zip.file(`${student.RollNo}-${student.StudentName}.jpg`, blob);
    }    
    
    exportBox.innerHTML = "";
    exportBox.style.visibility = "hidden";    
    
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "AttendanceCards.zip");
    
    // Clean up interface variables back to normal state
    btnExport.innerText = "Download";
    btnExport.disabled = false;    
    
    // Call custom dialog box and cleanly dismiss preview pane window frame
    showCustomDialog1("Exported", "Attendance cards exported successfully.", "OK", function(){
        const previewOverlay = document.getElementById("AttendancePreviewOverlay");
        if (previewOverlay) {
            previewOverlay.style.display = "none";
        }
    });
}
