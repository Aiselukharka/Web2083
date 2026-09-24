if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

// -------------------- PROTECTION FORM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
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
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
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

// Ensure jexcel and juice dependencies are loaded in your HTML:


const columns = [
    'e_year', 'e_month', 'e_day', 'e_day_of_week',
    'n_year', 'n_month', 'n_day', 'n_day_of_week',
    'tithi', 'national_event', 'local_event', 'event_detail', 'day_type'
];

const columnDisplayNames = {
    'e_year': 'English Year', 'e_month': 'English Month', 'e_day': 'English Day', 'e_day_of_week': 'English Day of Week',
    'n_year': 'Nepali Year', 'n_month': 'Nepali Month', 'n_day': 'Nepali Day', 'n_day_of_week': 'Nepali Day of Week',
    'tithi': 'Tithi', 'national_event': 'National Event', 'local_event': 'Local Event', 'event_detail': 'Event Detail',
    'day_type': 'Day Type'
};

// COMPULSORY FIX: Converted from object list to flat string elements so Jspreadsheet v4 dropdown works perfectly
const dayTypeOptions = [
    "Public Holiday",
    "Study Time",
    "Exam Time",
    "Summer Vacation",
    "Winter Vacation",
    "Other School Day",
    "Other Vacation"
];

let calendarData = [];
let modifiedRows = new Set();
let jexcelInstance = null;

// Fetch data from Supabase
async function fetchCalendarData() {
    try {
        const { data, error } = await supabaseClient
            .from('CalendarDataTable')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        
        calendarData = data;
        modifiedRows.clear();
        updateSaveButtonState();
        renderTable();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('CalendarDataBox').innerHTML = 
            `<div style="color: red; padding: 20px;">Error loading data: ${error.message}</div>`;
    }
}

// Update save button UI
function updateSaveButtonState() {
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        const hasChanges = modifiedRows.size > 0;
        saveButton.disabled = !hasChanges;
        saveButton.style.backgroundColor = hasChanges ? '#4CAF50' : '#cccccc';
        saveButton.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
        saveButton.style.opacity = hasChanges ? '1' : '0.6';
    }
}

// Map database column schema to jexcel configurations
function getJexcelColumns() {
    // Define explicit widths for columns that need extra room
    const specialWidths = {
        'e_year': 200,
        'e_month': 200,
        'e_day': 200,
        'e_day_of_week': 250,
        'n_year': 200,
        'n_month': 200,
        'n_day': 200,
        'n_day_of_week': 250,
        'tithi': 200,
        'national_event': 300,
        'local_event': 300,
        'event_detail': 600,
        'day_type': 300
    };

    return columns.map(col => {
        const config = {
            name: col,
            title: columnDisplayNames[col] || col,
            width: specialWidths[col] || 80, 
            type: 'text'
        };

        if (col === 'day_type') {
            config.type = 'dropdown';
            config.source = dayTypeOptions;
            config.autocomplete = true;
        }
        return config;
    });
}

// Render the jexcel spreadsheet view
function renderTable() {
    const container = document.getElementById('CalendarDataBox');
    
    // COMPULSORY FIX: Wrapped inside an explicit overflow container to prevent table leaking outside your #MainBody layout box
    container.innerHTML = `
        <div style="width: 100%; overflow-x: auto; background: #ffffff; border: 1px solid #ccc;">
            <div id="spreadsheetContainer"></div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button id="importButton">📥 Import CSV</button>
            <button id="saveButton" disabled>💾 Save Changes</button>
            <span id="saveStatus" style="margin-left: 15px; font-size: 13px;"></span>
        </div>
    `;

    // Map rows arrays into standard 2D data matrix matching columns layout
    const spreadsheetData = calendarData.map(row => columns.map(col => row[col] ?? ''));

    // Initialize jexcel Instance
    jexcelInstance = jspreadsheet(document.getElementById('spreadsheetContainer'), {
        data: spreadsheetData,
        columns: getJexcelColumns(),
        tableOverflow: false, // Turned false to let page manage normal scrolling heights
        search: false,        // 1. Removed search box
        pagination: false,    // 3. Removed pagination to display all 365 rows seamlessly
        onchange: function(el, cell, colIndex, rowIndex, newValue) {
            const rowDbRecord = calendarData[rowIndex];
            if (rowDbRecord) {
                const updatedFieldName = columns[colIndex];
                if (rowDbRecord[updatedFieldName] !== newValue) {
                    rowDbRecord[updatedFieldName] = newValue;
                    modifiedRows.add(rowDbRecord.id);
                    
                    // NATIVE FIX: Loop through the cells of the current row and color them
                    // using standard DOM styling via Jspreadsheet's internal records layer
                    if (jexcelInstance && jexcelInstance.records && jexcelInstance.records[rowIndex]) {
                        jexcelInstance.records[rowIndex].forEach(tdCell => {
                            if (tdCell) tdCell.style.backgroundColor = '#fff3cd';
                        });
                    }

                    updateSaveButtonState();
                    showSaveStatus('Unsaved changes detected', 'info');
                }
            }
        },
        onload: function(el) {
            // Apply initial styles on load if existing pending mutations match
            calendarData.forEach((row, rowIndex) => {
                if (modifiedRows.has(row.id)) {
                    if (jexcelInstance && jexcelInstance.records && jexcelInstance.records[rowIndex]) {
                        jexcelInstance.records[rowIndex].forEach(tdCell => {
                            if (tdCell) tdCell.style.backgroundColor = '#fff3cd';
                        });
                    }
                }
            });
        }
    });

    // Event Wireups
    document.getElementById('saveButton').addEventListener('click', saveChanges);
    setupFileUpload();
}

// Let jexcel handle CSV reading natively via file element hook
function setupFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            if (confirm('Importing CSV rows will overwrite matching table items. proceed?')) {
                // Parse lines sequentially directly into current configuration cells array
                const lines = contents.trim().split('\n').slice(1); // skip heading
                lines.forEach((line, rowIndex) => {
                    if (rowIndex >= calendarData.length) return;
                    
                    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                    values.forEach((val, colIndex) => {
                        if (colIndex < columns.length) {
                            jexcelInstance.setValueFromCoords(colIndex, rowIndex, val);
                        }
                    });
                });
                alert('CSV adjustments parsed inside working grid layer successfully.');
            }
        };
        reader.readAsText(file);
    });
    
    document.body.appendChild(fileInput);
    document.getElementById('importButton').addEventListener('click', () => fileInput.click());
}

// Push mutations out to client service endpoint API 
async function saveChanges() {
    if (modifiedRows.size === 0) return;
    
    const saveButton = document.getElementById('saveButton');
    const originalText = saveButton.innerHTML;
    
    try {
        saveButton.disabled = true;
        saveButton.innerHTML = '💾 Saving...';
        showSaveStatus('Saving changes to database...', 'info');
        
        const updates = [];
        for (const rowId of modifiedRows) {
            const rowData = calendarData.find(row => row.id === rowId);
            if (rowData) {
                const updatePayload = {};
                columns.forEach(col => { updatePayload[col] = rowData[col]; });
                
                updates.push(
                    supabaseClient
                        .from('CalendarDataTable')
                        .update(updatePayload)
                        .eq('id', rowId)
                );
            }
        }
        
        const results = await Promise.all(updates);
        const errors = results.filter(res => res.error);
        if (errors.length > 0) throw new Error(errors[0].error.message);
        
        showSaveStatus(`✅ Successfully saved ${results.length} records!`, 'success');
        await fetchCalendarData();
    } catch (error) {
        console.error('Error saving:', error);
        showSaveStatus(`❌ Error: ${error.message}`, 'error');
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
    }
}

function showSaveStatus(message, type) {
    const saveStatus = document.getElementById('saveStatus');
    if (!saveStatus) return;
    saveStatus.textContent = message;
    saveStatus.style.color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'orange';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCalendarData();
});