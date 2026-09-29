if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

// ============================================================================
// CROPPER MODAL LOGIC (3:4 for HR photos)
// ============================================================================
console.log("[HR] Cropper module loading...");

const HR_CROP_RATIO  = 3 / 4;      // 3:4 portrait
const HR_CROP_WIDTH  = 300;
const HR_CROP_HEIGHT = 400;

let activeCropper = null;
function openCropperForFile(file) {
    return new Promise((resolve, reject) => {
        const cropperModal  = document.getElementById('CropperModal');
        const cropperImage  = document.getElementById('CropperImage');
        const btnCancel     = document.getElementById('btnCancelCrop');
        const btnApply      = document.getElementById('btnApplyCrop');

        if (!cropperModal || !cropperImage || !btnCancel || !btnApply) {
            reject(new Error('Cropper modal elements not found in the page.'));
            return;
        }

        // Destroy any previous instance FIRST
        if (activeCropper) {
            activeCropper.destroy();
            activeCropper = null;
        }

        // Clear any previous cropper wrapper if one is stuck in the DOM
        const existingWrapper = cropperImage.parentElement;
        if (existingWrapper && existingWrapper.classList.contains('cropper-container')) {
            existingWrapper.parentElement.insertBefore(cropperImage, existingWrapper);
            existingWrapper.remove();
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            // 1. Set the src and wait for the image to be fully decoded
            cropperImage.onload = () => {
                // 2. Show the modal
                cropperModal.classList.add('active');

                // 3. Wait TWO frames for layout to settle before init.
                //    One frame is not enough — the flex container hasn't
                //    computed its child sizes yet.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        try {
                            activeCropper = new Cropper(cropperImage, {
                                aspectRatio: HR_CROP_RATIO,
                                viewMode: 2,
                                autoCropArea: 0.9,
                                movable: true,
                                zoomable: true,
                                rotatable: false,
                                scalable: false,
                                responsive: true,
                                background: true,
                                cropBoxResizable: true,
                                checkOrientation: false,
                                highlight: false,
                                guides: true,
                                center: true,
                                toggleDragModeOnDblclick: false,
                                ready() {
                                    // Force a resize once Cropper has taken over
                                    activeCropper.resize();
                                }
                            });
                        } catch (err) {
                            console.error('Cropper init failed:', err);
                            reject(err);
                            closeCropper();
                        }
                    });
                });
            };

            cropperImage.onerror = () => reject(new Error('Image failed to load'));
            cropperImage.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);

        // Wire buttons ONCE (not inside onload, to avoid stacking handlers
        // if the modal is reused)
        btnApply.onclick = () => {
            if (!activeCropper) return;
            const canvas = activeCropper.getCroppedCanvas({
                width: HR_CROP_WIDTH,
                height: HR_CROP_HEIGHT,
                imageSmoothingQuality: 'high'
            });
            if (!canvas) { reject(new Error('Crop failed')); closeCropper(); return; }

            canvas.toBlob((blob) => {
                if (!blob) { reject(new Error('Blob generation failed')); closeCropper(); return; }
                resolve(blob);
                closeCropper();
            }, 'image/jpeg', 0.92);
        };

        btnCancel.onclick = () => {
            reject(new Error('Cancelled'));
            closeCropper();
        };
    });
}

function closeCropper() {
    const cropperModal = document.getElementById('CropperModal');
    if (cropperModal) cropperModal.classList.remove('active');
    if (activeCropper) { activeCropper.destroy(); activeCropper = null; }
}

console.log("[HR] Cropper module loaded. openCropperForFile is defined:", typeof openCropperForFile === 'function');

// -------------------- PROTECTION FORM UNAUTHORIZED ACCESS --------------------
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

// -------------------- NAVIGATE ADMIN EDITS --------------------
const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
EditNavigationDropDown.addEventListener("change", function () {
    const pageMap = {
        "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
        "IDCardEditBox": "../EditIDCardPage/EditIDCardIndex.html",
        "ResultEditBox": "../EditResultPage/EditResultIndex.html",
        "RoutineEditBox": "../EditRoutinePage/EditRoutineIndex.html",
        "StudentAttendanceEditBox": "../EditStudentAttendancePage/EditStudentAttendanceIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
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

// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

// ----------------------- ADMIN TOOLS DROPDOWN -----------------------
document.getElementById("AdminToolsSelect").addEventListener("change", async function () {
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
            if (confirm === "Yes") {
                await supabaseClient.auth.signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html";
            break;
    }
    this.selectedIndex = 0;
});

// -------------------- DYNAMIC LOGO & FAVICON --------------------
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
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// ============================================================================
// SPREADSHEET BUILDERS
// ============================================================================
function loadTeacherSpreadsheet() {
    const teacherBox = document.getElementById('TeacherBox');
    teacherBox.innerHTML = '';
    const columns = [
        { title: 'Name', width: '300px', type: 'text' },
        { title: 'Address', width: '450px', type: 'text' },
        { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
        { title: 'Date of Birth', width: '150px', type: 'text' },
        { title: "Father's Name", width: '300px', type: 'text' },
        { title: "Mother's Name", width: '300px', type: 'text' },
        { title: 'Contact', width: '150px', type: 'text' },
        { title: 'Email', width: '300px', type: 'text' },
        { title: 'Appointment Date(Temp.)', width: '300px', type: 'text' },
        { title: 'Appointment Date(Perm.)', width: '300px', type: 'text' },
        { title: 'Designation', width: '200px', type: 'text' },
        { title: 'Level', width: '120px', type: 'dropdown', source: ['Primary', 'Lower Secondary', 'Secondary', 'Higher Secondary', 'Others'] },
        { title: 'Nationality No.', width: '200px', type: 'text' },
        { title: 'Pan No.', width: '200px', type: 'text' },
        { title: 'NIN', width: '200px', type: 'text' },
        { title: 'Teaching License No.', width: '200px', type: 'text' },
        { title: 'CIF No.', width: '200px', type: 'text' },
        { title: 'Service Type', width: '150px', type: 'dropdown', source: ['स्थायी', 'अस्थायी', 'राहत', 'कार्यालय सहयोगी', 'लेखापाल', 'बालकक्षा शिक्षक', 'निजीश्रोत', 'पालिका करार', 'अन्य'] },
        { title: 'Qualification', width: '200px', type: 'text' },
        { title: 'Major Subject', width: '300px', type: 'text' }
    ];
    const initialData = Array(30).fill().map(() => Array(20).fill(''));
    const spreadsheet = jspreadsheet(teacherBox, {
        data: initialData,
        columns: columns,
        minDimensions: [20, 30],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '400px',
        search: false,
        contextMenu: true,
        copyPaste: true,
        columnSort: true,
        lazyLoading: false,
        onchange: function(el, cell, x, y, value) {
            console.log(`Cell (${y}, ${x}) changed to: ${value}`);
        }
    });
    return spreadsheet;
}

function loadSMCSpreadsheet() {
    const SMCBox = document.getElementById('SMCBox');
    SMCBox.innerHTML = '';
    const columns = [
        { title: 'Name', width: '300px', type: 'text' },
        { title: 'Address', width: '450px', type: 'text' },
        { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
        { title: 'Contact', width: '200px', type: 'text' },
        { title: 'Email', width: '300px', type: 'text' },
        { title: 'Appointment Date', width: '200px', type: 'text' },
        { title: 'Post', width: '200px', type: 'text' }
    ];
    const initialData = Array(12).fill().map(() => Array(7).fill(''));
    const spreadsheet = jspreadsheet(SMCBox, {
        data: initialData,
        columns: columns,
        minDimensions: [7, 12],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '300px',
        search: false,
        contextMenu: true,
        copyPaste: true,
        columnSort: true,
        lazyLoading: false,
        onchange: function(el, cell, x, y, value) {
            console.log(`Cell (${y}, ${x}) changed to: ${value}`);
        }
    });
    return spreadsheet;
}

function loadPTASpreadsheet() {
    const PTABox = document.getElementById('PTABox');
    PTABox.innerHTML = '';
    const columns = [
        { title: 'Name', width: '300px', type: 'text' },
        { title: 'Address', width: '450px', type: 'text' },
        { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
        { title: 'Contact', width: '200px', type: 'text' },
        { title: 'Email', width: '300px', type: 'text' },
        { title: 'Appointment Date', width: '200px', type: 'text' },
        { title: 'Post', width: '200px', type: 'text' }
    ];
    const initialData = Array(12).fill().map(() => Array(7).fill(''));
    const spreadsheet = jspreadsheet(PTABox, {
        data: initialData,
        columns: columns,
        minDimensions: [7, 12],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '300px',
        search: false,
        contextMenu: true,
        copyPaste: true,
        columnSort: true,
        lazyLoading: false,
        onchange: function(el, cell, x, y, value) {
            console.log(`Cell (${y}, ${x}) changed to: ${value}`);
        }
    });
    return spreadsheet;
}

// ============================================================================
// CONTAINER VISIBILITY
// ============================================================================
function handleTopicSelect(value) {
    hideAllContainers();
    switch(value) {
        case 'EditTeacherData':
            showTeacherContainer();
            break;
        case 'EditSMCData':
            showSMCContainer();
            break;
        case 'EditPTAData':
            showPTAContainer();
            break;
        case 'EditPhoto':
            showPhotoContainer();
            break;
        default:
            break;
    }
}

function showContainer(containerId) {
    hideAllContainers();
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('EditContainers');
        container.classList.add('visible');
    }
}

function hideAllContainers() {
    const containers = [
        'EditTeacherContainer',
        'EditSMCContainer',
        'EditPTAContainer',
        'EditPhotoContainer'
    ];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.classList.add('EditContainers');
            container.classList.remove('visible');
        }
    });
}

function toggleContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.toggle('EditContainers');
        container.classList.toggle('visible');
    }
}

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let teacherSpreadsheet = null;
let smcSpreadsheet = null;
let ptaSpreadsheet = null;
let currentSpreadsheet = null;
let teacherDataChanged = false;
let smcDataChanged = false;
let ptaDataChanged = false;

const COLUMN_MAPPING = {
    'Name': 'Name',
    'Address': 'Address',
    'Gender': 'Gender',
    'Date of Birth': 'DOB',
    "Father's Name": 'Father',
    "Mother's Name": 'Mother',
    'Contact': 'Contact',
    'Email': 'Email',
    'Appointment Date(Temp.)': 'TemporaryAppointment',
    'Appointment Date(Perm.)': 'PermanentAppointment',
    'Designation': 'Post',
    'Level': 'Level',
    'Nationality No.': 'Nationality',
    'Pan No.': 'Pan',
    'NIN': 'NIN',
    'Teaching License No.': 'License',
    'CIF No.': 'CIF',
    'Service Type': 'ServiceType',
    'Qualification': 'Qualification',
    'Major Subject': 'MajorSubject'
};

const SMC_COLUMN_MAPPING = {
    'Name': 'Name',
    'Address': 'Address',
    'Gender': 'Gender',
    'Contact': 'Contact',
    'Email': 'Email',
    'Appointment Date': 'TemporaryAppointment',
    'Post': 'Post'
};

// ============================================================================
// LOAD ALL DATA
// ============================================================================
async function loadAllData() {
    try {
        const { data, error } = await supabaseClient
            .from('HumanResourceTable')
            .select('*')
            .order('id', { ascending: true });
        if (error) {
            console.error('Error loading data:', error);
            return;
        }
        if (data && data.length > 0) {
            const staffData = data.filter(item => item.WorkArea === 'Staff');
            const smcData = data.filter(item => item.WorkArea === 'SMC');
            const ptaData = data.filter(item => item.WorkArea === 'PTA');
            if (staffData.length > 0) loadTeacherData(staffData);
            if (smcData.length > 0)   loadSMCData(smcData);
            if (ptaData.length > 0)   loadPTAData(ptaData);
        }
    } catch (error) {
        console.error('Error in loadAllData:', error);
    }
}

// ============================================================================
// LOAD TEACHER DATA
// ============================================================================
function loadTeacherData(data) {
    const teacherBox = document.getElementById('TeacherBox');
    teacherBox.innerHTML = '';
    const columns = [
        { title: 'Name', width: '300px', type: 'text' },
        { title: 'Address', width: '450px', type: 'text' },
        { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
        { title: 'Date of Birth', width: '150px', type: 'text' },
        { title: "Father's Name", width: '300px', type: 'text' },
        { title: "Mother's Name", width: '300px', type: 'text' },
        { title: 'Contact', width: '150px', type: 'text' },
        { title: 'Email', width: '300px', type: 'text' },
        { title: 'Appointment Date(Temp.)', width: '300px', type: 'text' },
        { title: 'Appointment Date(Perm.)', width: '300px', type: 'text' },
        { title: 'Designation', width: '200px', type: 'text' },
        { title: 'Level', width: '120px', type: 'dropdown', source: ['Primary', 'Lower Secondary', 'Secondary', 'Higher Secondary', 'Others'] },
        { title: 'Nationality No.', width: '200px', type: 'text' },
        { title: 'Pan No.', width: '200px', type: 'text' },
        { title: 'NIN', width: '200px', type: 'text' },
        { title: 'Teaching License No.', width: '200px', type: 'text' },
        { title: 'CIF No.', width: '200px', type: 'text' },
        { title: 'Service Type', width: '150px', type: 'dropdown', source: ['स्थायी', 'अस्थायी', 'राहत', 'कार्यालय सहयोगी', 'लेखापाल', 'बालकक्षा शिक्षक', 'निजीश्रोत', 'पालिका करार', 'अन्य'] },
        { title: 'Qualification', width: '200px', type: 'text' },
        { title: 'Major Subject', width: '300px', type: 'text' }
    ];
    const rowData = data.map(item => [
        item.Name || '',
        item.Address || '',
        item.Gender || '',
        item.DOB || '',
        item.Father || '',
        item.Mother || '',
        item.Contact || '',
        item.Email || '',
        item.TemporaryAppointment || '',
        item.PermanentAppointment || '',
        item.Post || '',
        item.Level || '',
        item.Nationality || '',
        item.Pan || '',
        item.NIN || '',
        item.License || '',
        item.CIF || '',
        item.ServiceType || '',
        item.Qualification || '',
        item.MajorSubject || ''
    ]);
    const finalData = rowData.length > 0 ? rowData : Array(30).fill().map(() => Array(20).fill(''));
    teacherSpreadsheet = jspreadsheet(teacherBox, {
        data: finalData,
        columns: columns,
        minDimensions: [20, 30],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '400px',
        search: false,
        contextMenu: true,
        copyPaste: true,
        columnSort: true,
        lazyLoading: false,
        onchange: function(el, cell, x, y, value) {
            teacherDataChanged = true;
            document.getElementById('btnSaveTeacher').style.display = 'block';
        }
    });
    document.getElementById('btnSaveTeacher').style.display = 'none';
}

// ============================================================================
// LOAD SMC DATA
// ============================================================================
function loadSMCData(data) {
    const smcBox = document.getElementById('SMCBox');
    smcBox.innerHTML = '';
    const columns = [
        { title: 'Name', width: '300px', type: 'text' },
        { title: 'Address', width: '450px', type: 'text' },
        { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
        { title: 'Contact', width: '200px', type: 'text' },
        { title: 'Email', width: '300px', type: 'text' },
        { title: 'Appointment Date', width: '200px', type: 'text' },
        { title: 'Post', width: '200px', type: 'text' }
    ];
    const rowData = data.map(item => [
        item.Name || '',
        item.Address || '',
        item.Gender || '',
        item.Contact || '',
        item.Email || '',
        item.TemporaryAppointment || '',
        item.Post || ''
    ]);
    const finalData = rowData.length > 0 ? rowData : Array(12).fill().map(() => Array(7).fill(''));
    smcSpreadsheet = jspreadsheet(smcBox, {
        data: finalData,
        columns: columns,
        minDimensions: [7, 12],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '300px',
        search: false,
        contextMenu: true,
        copyPaste: true,
        columnSort: true,
        lazyLoading: false,
        onchange: function(el, cell, x, y, value) {
            smcDataChanged = true;
            document.getElementById('btnSaveSMC').style.display = 'block';
        }
    });
    document.getElementById('btnSaveSMC').style.display = 'none';
}

// ============================================================================
// LOAD PTA DATA
// ============================================================================
function loadPTAData(data) {
    const ptaBox = document.getElementById('PTABox');
    ptaBox.innerHTML = '';
    const columns = [
        { title: 'Name', width: '300px', type: 'text' },
        { title: 'Address', width: '450px', type: 'text' },
        { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
        { title: 'Contact', width: '200px', type: 'text' },
        { title: 'Email', width: '300px', type: 'text' },
        { title: 'Appointment Date', width: '200px', type: 'text' },
        { title: 'Post', width: '200px', type: 'text' }
    ];
    const rowData = data.map(item => [
        item.Name || '',
        item.Address || '',
        item.Gender || '',
        item.Contact || '',
        item.Email || '',
        item.TemporaryAppointment || '',
        item.Post || ''
    ]);
    const finalData = rowData.length > 0 ? rowData : Array(12).fill().map(() => Array(7).fill(''));
    ptaSpreadsheet = jspreadsheet(ptaBox, {
        data: finalData,
        columns: columns,
        minDimensions: [7, 12],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '300px',
        search: false,
        contextMenu: true,
        copyPaste: true,
        columnSort: true,
        lazyLoading: false,
        onchange: function(el, cell, x, y, value) {
            ptaDataChanged = true;
            document.getElementById('btnSavePTA').style.display = 'block';
        }
    });
    document.getElementById('btnSavePTA').style.display = 'none';
}

// ============================================================================
// SHOW CONTAINERS (with lazy loading of spreadsheets)
// ============================================================================
function showTeacherContainer() {
    showContainer('EditTeacherContainer');
    setTimeout(function() {
        if (!teacherSpreadsheet) {
            const teacherBox = document.getElementById('TeacherBox');
            teacherBox.innerHTML = '';
            const columns = [
                { title: 'Name', width: '300px', type: 'text' },
                { title: 'Address', width: '450px', type: 'text' },
                { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
                { title: 'Date of Birth', width: '150px', type: 'text' },
                { title: "Father's Name", width: '300px', type: 'text' },
                { title: "Mother's Name", width: '300px', type: 'text' },
                { title: 'Contact', width: '150px', type: 'text' },
                { title: 'Email', width: '300px', type: 'text' },
                { title: 'Appointment Date(Temp.)', width: '300px', type: 'text' },
                { title: 'Appointment Date(Perm.)', width: '300px', type: 'text' },
                { title: 'Designation', width: '200px', type: 'text' },
                { title: 'Level', width: '120px', type: 'dropdown', source: ['Primary', 'Lower Secondary', 'Secondary', 'Higher Secondary', 'Others'] },
                { title: 'Nationality No.', width: '200px', type: 'text' },
                { title: 'Pan No.', width: '200px', type: 'text' },
                { title: 'NIN', width: '200px', type: 'text' },
                { title: 'Teaching License No.', width: '200px', type: 'text' },
                { title: 'CIF No.', width: '200px', type: 'text' },
                { title: 'Service Type', width: '150px', type: 'dropdown', source: ['स्थायी', 'अस्थायी', 'राहत', 'कार्यालय सहयोगी', 'लेखापाल', 'बालकक्षा शिक्षक', 'निजीश्रोत', 'पालिका करार', 'अन्य'] },
                { title: 'Qualification', width: '200px', type: 'text' },
                { title: 'Major Subject', width: '300px', type: 'text' }
            ];
            const initialData = Array(30).fill().map(() => Array(20).fill(''));
            teacherSpreadsheet = jspreadsheet(teacherBox, {
                data: initialData,
                columns: columns,
                minDimensions: [20, 30],
                tableOverflow: true,
                tableWidth: '100%',
                tableHeight: '400px',
                search: false,
                contextMenu: true,
                copyPaste: true,
                columnSort: true,
                lazyLoading: false,
                onchange: function(el, cell, x, y, value) {
                    teacherDataChanged = true;
                    document.getElementById('btnSaveTeacher').style.display = 'block';
                }
            });
            document.getElementById('btnSaveTeacher').style.display = 'none';
        }
    }, 100);
}

function showSMCContainer() {
    showContainer('EditSMCContainer');
    setTimeout(function() {
        if (!smcSpreadsheet) {
            const smcBox = document.getElementById('SMCBox');
            smcBox.innerHTML = '';
            const columns = [
                { title: 'Name', width: '300px', type: 'text' },
                { title: 'Address', width: '450px', type: 'text' },
                { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
                { title: 'Contact', width: '200px', type: 'text' },
                { title: 'Email', width: '300px', type: 'text' },
                { title: 'Appointment Date', width: '200px', type: 'text' },
                { title: 'Post', width: '200px', type: 'text' }
            ];
            const initialData = Array(12).fill().map(() => Array(7).fill(''));
            smcSpreadsheet = jspreadsheet(smcBox, {
                data: initialData,
                columns: columns,
                minDimensions: [7, 12],
                tableOverflow: true,
                tableWidth: '100%',
                tableHeight: '300px',
                search: false,
                contextMenu: true,
                copyPaste: true,
                columnSort: true,
                lazyLoading: false,
                onchange: function(el, cell, x, y, value) {
                    smcDataChanged = true;
                    document.getElementById('btnSaveSMC').style.display = 'block';
                }
            });
            document.getElementById('btnSaveSMC').style.display = 'none';
        }
    }, 100);
}

function showPTAContainer() {
    showContainer('EditPTAContainer');
    setTimeout(function() {
        if (!ptaSpreadsheet) {
            const ptaBox = document.getElementById('PTABox');
            ptaBox.innerHTML = '';
            const columns = [
                { title: 'Name', width: '300px', type: 'text' },
                { title: 'Address', width: '450px', type: 'text' },
                { title: 'Gender', width: '120px', type: 'dropdown', source: ['Male', 'Female', 'Other'] },
                { title: 'Contact', width: '200px', type: 'text' },
                { title: 'Email', width: '300px', type: 'text' },
                { title: 'Appointment Date', width: '200px', type: 'text' },
                { title: 'Post', width: '200px', type: 'text' }
            ];
            const initialData = Array(12).fill().map(() => Array(7).fill(''));
            ptaSpreadsheet = jspreadsheet(ptaBox, {
                data: initialData,
                columns: columns,
                minDimensions: [7, 12],
                tableOverflow: true,
                tableWidth: '100%',
                tableHeight: '300px',
                search: false,
                contextMenu: true,
                copyPaste: true,
                columnSort: true,
                lazyLoading: false,
                onchange: function(el, cell, x, y, value) {
                    ptaDataChanged = true;
                    document.getElementById('btnSavePTA').style.display = 'block';
                }
            });
            document.getElementById('btnSavePTA').style.display = 'none';
        }
    }, 100);
}

function showPhotoContainer() {
    showContainer('EditPhotoContainer');
    setTimeout(function() {
        loadPhotoData();
    }, 100);
}

// ============================================================================
// SAVE TEACHER DATA (preserves PhotoUrl)
// ============================================================================
async function saveTeacherData() {
    if (!teacherDataChanged) {
        alert('No changes to save.');
        return;
    }

    try {
        const data = teacherSpreadsheet.getData();
        const records = [];

        const { data: existingData, error: fetchError } = await supabaseClient
            .from('HumanResourceTable')
            .select('id, Name, PhotoUrl')
            .eq('WorkArea', 'Staff');

        if (fetchError) {
            console.error('Error fetching existing records:', fetchError);
            alert('Error fetching existing records.');
            return;
        }

        const existingMap = {};
        existingData.forEach(item => {
            existingMap[item.Name] = {
                id: item.id,
                PhotoUrl: item.PhotoUrl
            };
        });

        for (let row of data) {
            if (!row[0] || row[0].trim() === '') continue;
            const name = row[0] || '';
            const existing = existingMap[name];
            const photoUrl = existing ? existing.PhotoUrl : null;

            const record = {
                Name: name,
                Address: row[1] || '',
                Gender: row[2] || '',
                DOB: row[3] || '',
                Father: row[4] || '',
                Mother: row[5] || '',
                Contact: row[6] || '',
                Email: row[7] || '',
                TemporaryAppointment: row[8] || '',
                PermanentAppointment: row[9] || '',
                Post: row[10] || '',
                Level: row[11] || '',
                Nationality: row[12] || '',
                Pan: row[13] || '',
                NIN: row[14] || '',
                License: row[15] || '',
                CIF: row[16] || '',
                ServiceType: row[17] || '',
                Qualification: row[18] || '',
                MajorSubject: row[19] || '',
                WorkArea: 'Staff',
                PhotoUrl: photoUrl
            };
            records.push(record);
        }

        const { error: deleteError } = await supabaseClient
            .from('HumanResourceTable')
            .delete()
            .eq('WorkArea', 'Staff');

        if (deleteError) {
            console.error('Error deleting existing records:', deleteError);
            alert('Error updating records.');
            return;
        }

        if (records.length > 0) {
            const { error: insertError } = await supabaseClient
                .from('HumanResourceTable')
                .insert(records);

            if (insertError) {
                console.error('Error inserting records:', insertError);
                alert('Error saving data.');
                return;
            }
        }

        teacherDataChanged = false;
        document.getElementById('btnSaveTeacher').style.display = 'none';
        alert('Teacher data saved successfully!');

    } catch (error) {
        console.error('Error in saveTeacherData:', error);
        alert('Error saving teacher data.');
    }
}

// ============================================================================
// SAVE SMC DATA (preserves PhotoUrl)
// ============================================================================
async function saveSMCData() {
    if (!smcDataChanged) {
        alert('No changes to save.');
        return;
    }

    try {
        const data = smcSpreadsheet.getData();
        const records = [];

        const { data: existingData, error: fetchError } = await supabaseClient
            .from('HumanResourceTable')
            .select('id, Name, PhotoUrl')
            .eq('WorkArea', 'SMC');

        if (fetchError) {
            console.error('Error fetching existing records:', fetchError);
            alert('Error fetching existing records.');
            return;
        }

        const existingMap = {};
        existingData.forEach(item => {
            existingMap[item.Name] = item.PhotoUrl;
        });

        for (let row of data) {
            if (!row[0] || row[0].trim() === '') continue;
            const name = row[0] || '';
            const photoUrl = existingMap[name] || null;

            const record = {
                Name: name,
                Address: row[1] || '',
                Gender: row[2] || '',
                Contact: row[3] || '',
                Email: row[4] || '',
                TemporaryAppointment: row[5] || '',
                Post: row[6] || '',
                WorkArea: 'SMC',
                PhotoUrl: photoUrl
            };
            records.push(record);
        }

        const { error: deleteError } = await supabaseClient
            .from('HumanResourceTable')
            .delete()
            .eq('WorkArea', 'SMC');

        if (deleteError) {
            console.error('Error deleting SMC records:', deleteError);
            alert('Error updating records.');
            return;
        }

        if (records.length > 0) {
            const { error: insertError } = await supabaseClient
                .from('HumanResourceTable')
                .insert(records);

            if (insertError) {
                console.error('Error inserting SMC records:', insertError);
                alert('Error saving data.');
                return;
            }
        }

        smcDataChanged = false;
        document.getElementById('btnSaveSMC').style.display = 'none';
        alert('SMC data saved successfully!');

    } catch (error) {
        console.error('Error in saveSMCData:', error);
        alert('Error saving SMC data.');
    }
}

// ============================================================================
// SAVE PTA DATA (preserves PhotoUrl)
// ============================================================================
async function savePTAData() {
    if (!ptaDataChanged) {
        alert('No changes to save.');
        return;
    }

    try {
        const data = ptaSpreadsheet.getData();
        const records = [];

        const { data: existingData, error: fetchError } = await supabaseClient
            .from('HumanResourceTable')
            .select('id, Name, PhotoUrl')
            .eq('WorkArea', 'PTA');

        if (fetchError) {
            console.error('Error fetching existing records:', fetchError);
            alert('Error fetching existing records.');
            return;
        }

        const existingMap = {};
        existingData.forEach(item => {
            existingMap[item.Name] = item.PhotoUrl;
        });

        for (let row of data) {
            if (!row[0] || row[0].trim() === '') continue;
            const name = row[0] || '';
            const photoUrl = existingMap[name] || null;

            const record = {
                Name: name,
                Address: row[1] || '',
                Gender: row[2] || '',
                Contact: row[3] || '',
                Email: row[4] || '',
                TemporaryAppointment: row[5] || '',
                Post: row[6] || '',
                WorkArea: 'PTA',
                PhotoUrl: photoUrl
            };
            records.push(record);
        }

        const { error: deleteError } = await supabaseClient
            .from('HumanResourceTable')
            .delete()
            .eq('WorkArea', 'PTA');

        if (deleteError) {
            console.error('Error deleting PTA records:', deleteError);
            alert('Error updating records.');
            return;
        }

        if (records.length > 0) {
            const { error: insertError } = await supabaseClient
                .from('HumanResourceTable')
                .insert(records);

            if (insertError) {
                console.error('Error inserting PTA records:', insertError);
                alert('Error saving data.');
                return;
            }
        }

        ptaDataChanged = false;
        document.getElementById('btnSavePTA').style.display = 'none';
        alert('PTA data saved successfully!');

    } catch (error) {
        console.error('Error in savePTAData:', error);
        alert('Error saving PTA data.');
    }
}

// ============================================================================
// PHOTO CONTAINER — data, state, and rendering
// ============================================================================
let photoChanges = {};
let photoData = [];
let deletingIds = new Set();

async function loadPhotoData() {
    try {
        const { data, error } = await supabaseClient
            .from('HumanResourceTable')
            .select('id, Name, WorkArea, Post, PhotoUrl')
            .not('Name', 'is', null)
            .order('WorkArea', { ascending: true });

        if (error) {
            console.error('Error loading photo data:', error);
            return;
        }

        photoData = data || [];
        renderPhotoTable(photoData);
        document.getElementById('btnSavePhoto').style.display = 'none';
        photoChanges = {};

    } catch (error) {
        console.error('Error in loadPhotoData:', error);
    }
}

function renderPhotoTable(data) {
    const tbody = document.getElementById('PhotoTableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No records found</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const hasPhoto = item.PhotoUrl && item.PhotoUrl.trim() !== '';
        const isDeleting = deletingIds.has(item.id);

        row.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td><strong>${item.Name || 'N/A'}</strong></td>
            <td>${item.WorkArea || 'N/A'}</td>
            <td>${item.Post || 'N/A'}</td>
            <td style="text-align: center;">
                ${hasPhoto ?
                    `<img src="${item.PhotoUrl}" alt="${item.Name}" class="photo-preview" onerror="this.src='../images/no-photo.png'">` :
                    '<span class="no-photo">No Photo</span>'
                }
            </td>
            <td style="text-align: center;">
                <input type="file" id="photoInput_${item.id}" class="photo-file-input" accept="image/*"
                       onchange="handlePhotoSelect(${item.id}, this)">
                <button class="photo-upload-btn" onclick="document.getElementById('photoInput_${item.id}').click()">
                    📷 Choose Photo
                </button>
                ${photoChanges[item.id] ?
                    `<span style="margin-left: 10px; color: #ff6600; font-size: 0.9em;">New photo selected</span>` :
                    ''
                }
            </td>
            <td style="text-align: center;">
                <span class="photo-status ${photoChanges[item.id] ? 'pending' : (hasPhoto ? 'uploaded' : '')}">
                    ${photoChanges[item.id] ? 'Pending Upload' : (hasPhoto ? 'Uploaded' : 'No Photo')}
                </span>
            </td>
            <td style="text-align: center;">
                <button class="delete-btn" onclick="deletePerson(${item.id})" ${isDeleting ? 'disabled' : ''}>
                    ${isDeleting ? 'Deleting...' : '🗑️ Delete'}
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ============================================================================
// PHOTO SELECTION — opens cropper, stores cropped blob
// ============================================================================
async function handlePhotoSelect(id, input) {
    const file = input.files[0];
    if (!file) return;

    // Pre-crop validations
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        input.value = '';
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB.');
        input.value = '';
        return;
    }

    // Sanity check: is Cropper library present?
    if (typeof Cropper === 'undefined') {
        alert('Cropper library not loaded. Please check that cropper.min.js is included.');
        input.value = '';
        return;
    }

    try {
        const croppedBlob = await openCropperForFile(file);
        const croppedFile = new File(
            [croppedBlob],
            file.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg',
            { type: 'image/jpeg', lastModified: Date.now() }
        );

        // Store the CROPPED file for upload
        photoChanges[id] = {
            file: croppedFile,
            fileName: croppedFile.name
        };

        // Show cropped preview in the row
        const previewUrl = URL.createObjectURL(croppedFile);
        const row = input.closest('tr');
        const previewCell = row.querySelector('td:nth-child(5)');
        previewCell.innerHTML = `<img src="${previewUrl}" alt="Preview" class="photo-preview">`;

        // Update status
        const statusCell = row.querySelector('td:nth-child(7) .photo-status');
        statusCell.className = 'photo-status pending';
        statusCell.textContent = 'Pending Upload';

        // Show save button
        document.getElementById('btnSavePhoto').style.display = 'block';

        console.log(`Photo cropped for ID ${id}: ${croppedFile.name}`);
    } catch (err) {
        // User cancelled or cropper failed
        input.value = '';
        console.log('Cropper cancelled or failed:', err.message);
    }
}

// ============================================================================
// CLOUDINARY UPLOAD
// ============================================================================
async function uploadToCloudinary(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'AdminFileUploadPreset');
        // Cropping is handled client-side; no Cloudinary transform params needed.

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );

        if (!response.ok) {
            throw new Error(`Cloudinary upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

// ============================================================================
// SAVE PHOTOS
// ============================================================================
async function savePhoto() {
    const pendingUploads = Object.keys(photoChanges);

    if (pendingUploads.length === 0) {
        alert('No photos to upload.');
        return;
    }

    if (!confirm(`Upload ${pendingUploads.length} photo(s)?`)) {
        return;
    }

    const saveBtn = document.getElementById('btnSavePhoto');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Uploading...';

    let uploadSuccess = true;
    let uploadedCount = 0;

    try {
        for (const id of pendingUploads) {
            const change = photoChanges[id];
            if (!change || !change.file) continue;

            try {
                // File is already cropped to 300x400 by the cropper.
                const cloudinaryUrl = await uploadToCloudinary(change.file);

                if (cloudinaryUrl) {
                    // Update Supabase with new PhotoUrl (other fields unchanged)
                    const { error: updateError } = await supabaseClient
                        .from('HumanResourceTable')
                        .update({ PhotoUrl: cloudinaryUrl })
                        .eq('id', id);

                    if (updateError) {
                        console.error(`Error updating photo for ID ${id}:`, updateError);
                        uploadSuccess = false;
                    } else {
                        uploadedCount++;

                        // Update local photoData
                        const personIndex = photoData.findIndex(p => p.id === parseInt(id));
                        if (personIndex !== -1) {
                            photoData[personIndex].PhotoUrl = cloudinaryUrl;
                        }

                        // Remove from pending
                        delete photoChanges[id];

                        // Update row UI
                        const row = document.querySelector(`#photoInput_${id}`).closest('tr');
                        if (row) {
                            const statusCell = row.querySelector('td:nth-child(7) .photo-status');
                            statusCell.className = 'photo-status uploaded';
                            statusCell.textContent = 'Uploaded';

                            const previewCell = row.querySelector('td:nth-child(5)');
                            previewCell.innerHTML = `<img src="${cloudinaryUrl}" alt="Uploaded" class="photo-preview">`;
                        }
                    }
                }
            } catch (error) {
                console.error(`Error uploading photo for ID ${id}:`, error);
                uploadSuccess = false;

                const row = document.querySelector(`#photoInput_${id}`).closest('tr');
                if (row) {
                    const statusCell = row.querySelector('td:nth-child(7) .photo-status');
                    statusCell.className = 'photo-status error';
                    statusCell.textContent = 'Upload Failed';
                }
            }
        }

        if (uploadedCount > 0) {
            alert(`${uploadedCount} photo(s) uploaded successfully!`);
        }

        if (Object.keys(photoChanges).length === 0) {
            document.getElementById('btnSavePhoto').style.display = 'none';
        }

    } catch (error) {
        console.error('Error in savePhoto:', error);
        alert('Error uploading photos. Please try again.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Photos';
    }
}

// ============================================================================
// DELETE PERSON (also removes Cloudinary asset)
// ============================================================================
function extractPublicIdFromUrl(photoUrl) {
    try {
        const url = new URL(photoUrl);
        const pathParts = url.pathname.split('/');
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) {
            console.error('Invalid Cloudinary URL format: "upload" not found in path');
            return null;
        }
        const versionIndex = uploadIndex + 1;
        if (versionIndex >= pathParts.length) {
            console.error('Invalid Cloudinary URL format: No version found');
            return null;
        }
        const publicIdParts = pathParts.slice(versionIndex + 1);
        if (publicIdParts.length === 0) {
            console.error('Invalid Cloudinary URL format: No public_id found');
            return null;
        }
        let publicId = publicIdParts.join('/');
        publicId = publicId.replace(/\.[^/.]+$/, '');
        return publicId;
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
}

async function deletePerson(id) {
    const person = photoData.find(p => p.id === id);
    if (!person) {
        alert('Person not found!');
        return;
    }

    const confirmDelete = confirm(
        `Are you sure you want to delete "${person.Name}"?\n\n` +
        `Work Area: ${person.WorkArea}\n` +
        `Post: ${person.Post}\n\n` +
        `This will also remove their photo from Cloudinary.`
    );

    if (!confirmDelete) return;

    deletingIds.add(id);
    renderPhotoTable(photoData);

    try {
        let publicIds = [];

        if (person.PhotoUrl && person.PhotoUrl.trim() !== '') {
            try {
                const publicId = extractPublicIdFromUrl(person.PhotoUrl);
                if (publicId) publicIds = [publicId];
            } catch (extractError) {
                console.error('Error extracting public_id:', extractError);
            }
        }

        let photoDeleted = false;

        if (publicIds.length > 0) {
            try {
                const { data: edgeData, error: edgeError } = await supabaseClient.functions.invoke(
                    'delete-student-photo',
                    { body: { publicIds: publicIds } }
                );

                if (edgeError) {
                    console.error('Error calling delete-student-photo edge function:', edgeError);
                } else {
                    photoDeleted = true;
                    console.log('Photo deleted from Cloudinary successfully:', edgeData);
                }
            } catch (edgeError) {
                console.error('Edge function error:', edgeError);
            }
        } else {
            console.log('No photo to delete or could not extract public_id');
        }

        const { error: deleteError } = await supabaseClient
            .from('HumanResourceTable')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw new Error(`Failed to delete record: ${deleteError.message}`);
        }

        photoData = photoData.filter(item => item.id !== id);
        deletingIds.delete(id);

        if (photoChanges[id]) {
            delete photoChanges[id];
        }

        renderPhotoTable(photoData);

        if (Object.keys(photoChanges).length === 0) {
            document.getElementById('btnSavePhoto').style.display = 'none';
        }

        alert(
            `${person.Name} deleted successfully!\n` +
            `Photo ${photoDeleted ? 'was' : 'was not'} deleted from Cloudinary.`
        );

    } catch (error) {
        console.error('Error deleting person:', error);
        alert(`Error deleting person: ${error.message}`);

        deletingIds.delete(id);
        renderPhotoTable(photoData);
    }
}

// ============================================================================
// BOOT
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    hideAllContainers();
    loadAllData();
});