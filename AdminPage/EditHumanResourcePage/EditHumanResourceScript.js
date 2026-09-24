if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

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

  //----------------------- Script for Admin Tools Dropdown -----------------------
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
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);
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

// Handle topic selection from dropdown
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

// Function to show a specific container
function showContainer(containerId) {
    hideAllContainers();
    
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('EditContainers');
        container.classList.add('visible');
    }
}
// Function to hide all containers
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
// Function to toggle a container visibility
function toggleContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.toggle('EditContainers');
        container.classList.toggle('visible');
    }
}
// Function to show container and load its content
function showTeacherContainer() {
    showContainer('EditTeacherContainer');    
    // Load teacher spreadsheet with a slight delay to ensure container is visible
    setTimeout(function() {
        if (!window.spreadsheet) {
            window.spreadsheet = loadTeacherSpreadsheet();
        } else {
            // Re-render if already exists
            const teacherBox = document.getElementById('TeacherBox');
            teacherBox.innerHTML = '';
            window.spreadsheet = loadTeacherSpreadsheet();
        }
    }, 100);
}

function showSMCContainer() {
    showContainer('EditSMCContainer');
    // Load teacher spreadsheet with a slight delay to ensure container is visible
    setTimeout(function() {
        if (!window.spreadsheet) {
            window.spreadsheet = loadSMCSpreadsheet();
        } else {
            // Re-render if already exists
            const SMCBox = document.getElementById('SMCBox');
            SMCBox.innerHTML = '';
            window.spreadsheet = loadSMCSpreadsheet();
        }
    }, 100);
}

function showPTAContainer() {
    showContainer('EditPTAContainer');
    // Load teacher spreadsheet with a slight delay to ensure container is visible
    setTimeout(function() {
        if (!window.spreadsheet) {
            window.spreadsheet = loadPTASpreadsheet();
        } else {
            // Re-render if already exists
            const PTABox = document.getElementById('PTABox');
            PTABox.innerHTML = '';
            window.spreadsheet = loadPTASpreadsheet();
        }
    }, 100);
}

function showPhotoContainer() {
    showContainer('EditPhotoContainer');
    // Load Photo content here
    const photoBox = document.getElementById('PhotoBox');
    photoBox.innerHTML = '<p>Photo upload interface will be loaded here</p>';
}

// Placeholder functions for save operations
function saveTeacherData() {
    const data = getTeacherData();
    console.log('Teacher Data:', data);
    alert('Teacher data saved successfully!');
}

function saveSMCData() {
    alert('SMC data saved successfully!');
}
function savePTAData() {
    alert('PTA data saved successfully!');
}
function savePhoto() {
    alert('Photos saved successfully!');
}
document.addEventListener('DOMContentLoaded', function() {
    hideAllContainers();
});

// -------------------- GLOBAL VARIABLES --------------------
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

// -------------------- LOAD DATA ON PAGE LOAD --------------------
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
            // Separate data by WorkArea
            const staffData = data.filter(item => item.WorkArea === 'Staff');
            const smcData = data.filter(item => item.WorkArea === 'SMC');
            const ptaData = data.filter(item => item.WorkArea === 'PTA');
            if (staffData.length > 0) {
                loadTeacherData(staffData);
            }
            if (smcData.length > 0) {
                loadSMCData(smcData);
            }
            if (ptaData.length > 0) {
                loadPTAData(ptaData);
            }
        }
    } catch (error) {
        console.error('Error in loadAllData:', error);
    }
}

// -------------------- LOAD TEACHER DATA --------------------
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
            console.log(`Teacher cell (${y}, ${x}) changed to: ${value}`);
        }
    });    
    document.getElementById('btnSaveTeacher').style.display = 'none';
}

// -------------------- LOAD SMC DATA --------------------
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
            console.log(`SMC cell (${y}, ${x}) changed to: ${value}`);
        }
    });    
    document.getElementById('btnSaveSMC').style.display = 'none';
}

// -------------------- LOAD PTA DATA --------------------
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
            console.log(`PTA cell (${y}, ${x}) changed to: ${value}`);
        }
    });    
    document.getElementById('btnSavePTA').style.display = 'none';
}

// -------------------- SAVE TEACHER DATA --------------------
async function saveTeacherData() {
    if (!teacherDataChanged) {
        alert('No changes to save.');
        return;
    }
    
    try {
        const data = teacherSpreadsheet.getData();
        const records = [];
        
        // Get existing data with PhotoUrl
        const { data: existingData, error: fetchError } = await supabaseClient
            .from('HumanResourceTable')
            .select('id, Name, PhotoUrl')
            .eq('WorkArea', 'Staff');
            
        if (fetchError) {
            console.error('Error fetching existing records:', fetchError);
            alert('Error fetching existing records.');
            return;
        }
        
        // Create a map of existing names to PhotoUrl
        const existingMap = {};
        existingData.forEach(item => {
            existingMap[item.Name] = {
                id: item.id,
                PhotoUrl: item.PhotoUrl
            };
        });
        
        for (let row of data) {
            // Skip empty rows
            if (!row[0] || row[0].trim() === '') continue;
            
            const name = row[0] || '';
            
            // Check if this person already exists and preserve their PhotoUrl
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
                PhotoUrl: photoUrl // Preserve the existing PhotoUrl
            };
            
            records.push(record);
        }
        
        // Delete existing staff records
        const { error: deleteError } = await supabaseClient
            .from('HumanResourceTable')
            .delete()
            .eq('WorkArea', 'Staff');
            
        if (deleteError) {
            console.error('Error deleting existing records:', deleteError);
            alert('Error updating records.');
            return;
        }
        
        // Insert new records
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

// -------------------- SAVE SMC DATA --------------------
async function saveSMCData() {
    if (!smcDataChanged) {
        alert('No changes to save.');
        return;
    }
    
    try {
        const data = smcSpreadsheet.getData();
        const records = [];
        
        // Get existing data with PhotoUrl
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
                PhotoUrl: photoUrl // Preserve existing PhotoUrl
            };
            
            records.push(record);
        }
        
        // Delete existing SMC records
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

// Update savePTAData to preserve PhotoUrl
async function savePTAData() {
    if (!ptaDataChanged) {
        alert('No changes to save.');
        return;
    }
    
    try {
        const data = ptaSpreadsheet.getData();
        const records = [];
        
        // Get existing data with PhotoUrl
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
                PhotoUrl: photoUrl // Preserve existing PhotoUrl
            };
            
            records.push(record);
        }
        
        // Delete existing PTA records
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

// -------------------- SHOW FUNCTIONS --------------------
function showTeacherContainer() {
    showContainer('EditTeacherContainer');
    setTimeout(function() {
        if (!teacherSpreadsheet) {
            // Load empty spreadsheet if no data exists
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

document.addEventListener('DOMContentLoaded', function() {
    hideAllContainers();    
    loadAllData();
});

// -------------------- PHOTO CONTAINER FUNCTIONS --------------------
let photoChanges = {};
let photoData = [];
let deletingIds = new Set();

// Load photo data
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

// Render photo table
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

// Handle photo selection
function handlePhotoSelect(id, input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        input.value = '';
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB.');
        input.value = '';
        return;
    }

    // Store the file for upload
    photoChanges[id] = {
        file: file,
        fileName: file.name
    };

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const row = input.closest('tr');
        const previewCell = row.querySelector('td:nth-child(5)');
        previewCell.innerHTML = `<img src="${e.target.result}" alt="Preview" class="photo-preview">`;
        
        // Update status
        const statusCell = row.querySelector('td:nth-child(7) .photo-status');
        statusCell.className = 'photo-status pending';
        statusCell.textContent = 'Pending Upload';
        
        // Show save button
        document.getElementById('btnSavePhoto').style.display = 'block';
    };
    reader.readAsDataURL(file);

    console.log(`Photo selected for ID ${id}: ${file.name}`);
}

// Resize image to 300x450 before upload
function resizeImage(file, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Create canvas with target dimensions
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw image with proper aspect ratio (cover mode - 300x450)
                const aspectRatio = img.width / img.height;
                const targetAspectRatio = targetWidth / targetHeight;
                
                let sourceX = 0, sourceY = 0;
                let sourceWidth = img.width, sourceHeight = img.height;
                
                // Calculate cropping to maintain aspect ratio
                if (aspectRatio > targetAspectRatio) {
                    // Image is wider than target - crop width
                    sourceWidth = img.height * targetAspectRatio;
                    sourceX = (img.width - sourceWidth) / 2;
                } else if (aspectRatio < targetAspectRatio) {
                    // Image is taller than target - crop height
                    sourceHeight = img.width / targetAspectRatio;
                    sourceY = (img.height - sourceHeight) / 2;
                }
                
                ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
                
                // Convert to blob
                canvas.toBlob(function(blob) {
                    if (!blob) {
                        reject(new Error('Failed to resize image'));
                        return;
                    }
                    
                    // Create a new file from the blob
                    const resizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve(resizedFile);
                }, 'image/jpeg', 0.9);
            };
            img.onerror = function() {
                reject(new Error('Failed to load image for resizing'));
            };
            img.src = event.target.result;
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
    });
}

// Save photos to Cloudinary and Supabase
async function savePhoto() {
    const pendingUploads = Object.keys(photoChanges);
    
    if (pendingUploads.length === 0) {
        alert('No photos to upload.');
        return;
    }

    // Confirm upload
    if (!confirm(`Upload ${pendingUploads.length} photo(s)?`)) {
        return;
    }

    // Disable save button to prevent multiple clicks
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
                // Resize image to 300x450
                const resizedFile = await resizeImage(change.file, 300, 450);
                
                // Upload to Cloudinary
                const cloudinaryUrl = await uploadToCloudinary(resizedFile);
                
                if (cloudinaryUrl) {
                    // Get the current PhotoUrl to keep it
                    const currentPerson = photoData.find(p => p.id === parseInt(id));
                    const currentPhotoUrl = currentPerson ? currentPerson.PhotoUrl : null;
                    
                    // Update Supabase with the new PhotoUrl (keep other fields unchanged)
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
                        
                        // Remove from pending changes
                        delete photoChanges[id];
                        
                        // Update the row status
                        const row = document.querySelector(`#photoInput_${id}`).closest('tr');
                        if (row) {
                            const statusCell = row.querySelector('td:nth-child(7) .photo-status');
                            statusCell.className = 'photo-status uploaded';
                            statusCell.textContent = 'Uploaded';
                            
                            // Update preview
                            const previewCell = row.querySelector('td:nth-child(5)');
                            previewCell.innerHTML = `<img src="${cloudinaryUrl}" alt="Uploaded" class="photo-preview">`;
                        }
                    }
                }
            } catch (error) {
                console.error(`Error uploading photo for ID ${id}:`, error);
                uploadSuccess = false;
                
                // Update status to error
                const row = document.querySelector(`#photoInput_${id}`).closest('tr');
                if (row) {
                    const statusCell = row.querySelector('td:nth-child(7) .photo-status');
                    statusCell.className = 'photo-status error';
                    statusCell.textContent = 'Upload Failed';
                }
            }
        }

        // Show success message
        if (uploadedCount > 0) {
            alert(`${uploadedCount} photo(s) uploaded successfully!`);
        }

        // Hide save button if no more pending uploads
        if (Object.keys(photoChanges).length === 0) {
            document.getElementById('btnSavePhoto').style.display = 'none';
        }

    } catch (error) {
        console.error('Error in savePhoto:', error);
        alert('Error uploading photos. Please try again.');
    } finally {
        // Re-enable save button
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Photos';
    }
}

// Upload image to Cloudinary
async function uploadToCloudinary(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'AdminFileUploadPreset');
        formData.append('cloud_name', 'dcdwpdnyp');
        // Let Cloudinary handle the resizing with transformations
        formData.append('width', '300');
        formData.append('height', '450');
        formData.append('crop', 'fill');

        const response = await fetch(
            'https://api.cloudinary.com/v1_1/dcdwpdnyp/image/upload',
            {
                method: 'POST',
                body: formData
            }
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

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(photoUrl) {
    try {
        // Example URL: https://res.cloudinary.com/dcdwpdnyp/image/upload/v1234567890/folder/filename.jpg
        // Expected public_id: folder/filename (without extension)
        
        // Parse the URL
        const url = new URL(photoUrl);
        const pathParts = url.pathname.split('/');
        
        // Find the index of 'upload' in the path
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) {
            console.error('Invalid Cloudinary URL format: "upload" not found in path');
            return null;
        }
        
        // Get the version part (starts with 'v' and numbers)
        const versionIndex = uploadIndex + 1;
        if (versionIndex >= pathParts.length) {
            console.error('Invalid Cloudinary URL format: No version found');
            return null;
        }
        
        // Get the public_id parts (everything after version)
        const publicIdParts = pathParts.slice(versionIndex + 1);
        if (publicIdParts.length === 0) {
            console.error('Invalid Cloudinary URL format: No public_id found');
            return null;
        }
        
        // Join the parts and remove file extension
        let publicId = publicIdParts.join('/');
        // Remove file extension (e.g., .jpg, .png, .jpeg)
        publicId = publicId.replace(/\.[^/.]+$/, '');
        
        return publicId;
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
}

// Delete person - removes photo from Cloudinary and record from Supabase
async function deletePerson(id) {
    // Find the person in the data
    const person = photoData.find(p => p.id === id);
    if (!person) {
        alert('Person not found!');
        return;
    }

    // Confirm deletion
    const confirmDelete = confirm(
        `Are you sure you want to delete "${person.Name}"?\n\n` +
        `Work Area: ${person.WorkArea}\n` +
        `Post: ${person.Post}\n\n` +
        `This will also remove their photo from Cloudinary.`
    );

    if (!confirmDelete) return;

    // Disable the delete button
    deletingIds.add(id);
    renderPhotoTable(photoData);
    
    try {
        // Step 1: Extract public_id from Cloudinary URL
        let publicIds = [];
        
        if (person.PhotoUrl && person.PhotoUrl.trim() !== '') {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = extractPublicIdFromUrl(person.PhotoUrl);
                if (publicId) {
                    publicIds = [publicId];
                }
            } catch (extractError) {
                console.error('Error extracting public_id:', extractError);
                // Continue with deletion even if extraction fails
            }
        }

        // Step 2: Delete photo from Cloudinary using Edge Function
        let photoDeleted = false;
        
        if (publicIds.length > 0) {
            try {
                // Call the Edge Function with the correct format (publicIds array)
                const { data: edgeData, error: edgeError } = await supabaseClient.functions.invoke(
                    'delete-student-photo',
                    {
                        body: { 
                            publicIds: publicIds // Send as array as expected by the function
                        }
                    }
                );

                if (edgeError) {
                    console.error('Error calling delete-student-photo edge function:', edgeError);
                    // Continue with deletion even if edge function fails
                } else {
                    photoDeleted = true;
                    console.log('Photo deleted from Cloudinary successfully:', edgeData);
                }
            } catch (edgeError) {
                console.error('Edge function error:', edgeError);
                // Continue with deletion even if edge function fails
            }
        } else {
            console.log('No photo to delete or could not extract public_id');
        }

        // Step 3: Delete the record from Supabase
        const { error: deleteError } = await supabaseClient
            .from('HumanResourceTable')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw new Error(`Failed to delete record: ${deleteError.message}`);
        }

        // Step 4: Remove from local data
        photoData = photoData.filter(item => item.id !== id);
        deletingIds.delete(id);
        
        // Remove from pending changes if any
        if (photoChanges[id]) {
            delete photoChanges[id];
        }

        // Re-render the table
        renderPhotoTable(photoData);

        // Hide save button if no pending changes
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
        
        // Re-enable the delete button
        deletingIds.delete(id);
        renderPhotoTable(photoData);
    }
}

// Function to show photo container
function showPhotoContainer() {
    showContainer('EditPhotoContainer');
    setTimeout(function() {
        loadPhotoData();
    }, 100);
}

// Update the saveTeacherData function to preserve PhotoUrl


// Update saveSMCData to preserve PhotoUrl


document.addEventListener('DOMContentLoaded', function() {
    hideAllContainers();    
    loadAllData();    
});