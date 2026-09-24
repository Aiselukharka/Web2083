if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}

// -------------------- PROTECTION --------------------
protectAdminPage();
async function protectAdminPage() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
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
    if (selectedPage) window.location.href = selectedPage;
});

// -------------------- NAVIGATE ADMIN EDITS --------------------
const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
EditNavigationDropDown.addEventListener("change", function () {
    const pageMap = {
        "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
        "IDCardEditBox": "../EditIDCardPage/EditIDCardIndex.html",
        "ResultEditBox": "../EditResultPage/EditResultIndex.html",
        "RoutineEditBox": "../EditRoutinePageEditRoutineIndex.html",
        "StudentAttendanceEditBox": "../EditStudentAttendancePage/EditStudentAttendanceIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };   
    const selectedEdit = pageMap[this.value];
    if (selectedEdit) window.location.href = selectedEdit;
});

// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

//----------------------- Admin Tools -----------------------
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

// -------------------- DYNAMIC LOGO / FAVICON --------------------
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single();
        if (error) { console.error("Supabase query error loading branding:", error.message); return; }
        if (data && data.Value) {
            const freshLogoUrl = data.Value;
            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) faviconElement.href = freshLogoUrl;
            const logoImgElement = document.querySelector('#LogoBox img');
            if (logoImgElement) logoImgElement.src = freshLogoUrl;
        }
    } catch (error) { console.error("Unexpected error setting up branding layout:", error); }
}
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// -------------------- JSPREADSHEET & SUPABASE INTEGRATION --------------------

let jspreadsheetTable = null;
const totalRows = 20;

// The exact custom columns in our table
const dbColumns = [
    "ClassName", "Subject1", "CreditHour1", "WeeklyPeriod1", 
    "Subject2", "CreditHour2", "WeeklyPeriod2", "Subject3", 
    "CreditHour3", "WeeklyPeriod3", "Subject4", "CreditHour4", 
    "WeeklyPeriod4", "Subject5", "CreditHour5", "WeeklyPeriod5", 
    "Subject6", "CreditHour6", "WeeklyPeriod6", "Subject7", 
    "CreditHour7", "WeeklyPeriod7", "Subject8", "CreditHour8", 
    "WeeklyPeriod8", "Subject9", "CreditHour9", "WeeklyPeriod9", 
    "Subject10", "CreditHour10", "WeeklyPeriod10", "Subject11", 
    "CreditHour11", "WeeklyPeriod11", "Subject12", "CreditHour12", 
    "WeeklyPeriod12", "ClassTeacher"
];

// Configure headers and default configuration types for the 38 columns
const jspreadsheetHeaders = dbColumns.map(col => {
    let type = 'text';
    // If the column name suggests a number field (e.g. CreditHour or WeeklyPeriod), use numeric formatting
    if (col.includes("CreditHour") || col.includes("WeeklyPeriod")) {
        type = 'numeric';
    }
    return { title: col, width: 130, type: type };
});

const btnSave = document.getElementById("btnSaveClasses");
const btnDelete = document.getElementById("btnDeleteClasses");

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    initJspreadsheet();
    loadClassesData();
});

function initJspreadsheet() {
    const initialBlankData = Array.from({ length: totalRows }, () => Array(dbColumns.length).fill(''));
    jspreadsheetTable = jspreadsheet(document.getElementById('ClassDataBox'), {
        data: initialBlankData,
        columns: jspreadsheetHeaders,        
        tableOverflow: true,
        tableHeight: '480px',
        tableWidth: '100%',
        
        onselection: function(instance, x1, y1, x2, y2) {
            if (instance && typeof instance.updateScroll === 'function') {
                instance.updateScroll();
            }
        },
        onchange: function() {
            btnSave.style.display = "block";
        },
        oninsertrow: function() {
            btnSave.style.display = "block";
        },
        ondeleterow: function() {
            btnSave.style.display = "block";
        }
    });
    const container = document.querySelector('.jexcel_content') || document.getElementById('ClassDataBox');
    if (container) {
        container.addEventListener('wheel', function(e) {
            const hasInternalScroll = container.scrollHeight > container.clientHeight;            
            if (!hasInternalScroll) {
                window.scrollBy({
                    top: e.deltaY,
                    behavior: 'auto' 
                });
                e.stopPropagation();
            }
        }, { capture: true, passive: true });
        let touchStartY = 0;
        container.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                touchStartY = e.touches[0].clientY;
            }
        }, { capture: true, passive: true });
        container.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1) {
                const touchCurrentY = e.touches[0].clientY;
                const deltaY = touchStartY - touchCurrentY;                
                const hasInternalScroll = container.scrollHeight > container.clientHeight;
                if (!hasInternalScroll) {
                    window.scrollBy(0, deltaY);
                    touchStartY = touchCurrentY; // Update start position for fluid dragging
                    e.stopPropagation();
                }
            }
        }, { capture: true, passive: true });
    }
}

// Load data from Supabase
async function loadClassesData() {
    try {
        const { data, error } = await supabaseClient
            .from('ClassTable')
            .select('*')
            .order('SortOrder', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            // Parse Supabase schema records back into spreadsheet rows
            const formattedData = data.map(record => {
                return dbColumns.map(col => record[col] !== null ? record[col] : '');
            });

            // Ensure our UI array fills out to at least 20 rows
            while (formattedData.length < totalRows) {
                formattedData.push(Array(dbColumns.length).fill(''));
            }

            jspreadsheetTable.setData(formattedData);
            btnDelete.style.display = "block"; // Data present, show delete button
        } else {
            // No data in Supabase table
            btnDelete.style.display = "none";
        }
        btnSave.style.display = "none"; // Hide save button initially
    } catch (error) {
        console.error("Error loading data from Supabase:", error.message);
        alert("Failed to load class data from Supabase.");
    }
}

// Save data to Supabase
async function saveClasses() {
    // Change Button States to Block Interactions
    btnSave.innerText = "Saving .....";
    btnSave.disabled = true;

    try {
        // Retrieve spreadsheet rows (nested arrays)
        const sheetData = jspreadsheetTable.getData();
        
        // Structure payload (skip entirely empty rows; checking if ClassName is populated is standard)
        const rowsToSave = [];
        sheetData.forEach((row, index) => {
            const hasData = row.some(cell => cell !== null && cell.toString().trim() !== '');
            if (hasData) {
                const record = { SortOrder: index + 1 };
                dbColumns.forEach((colName, colIdx) => {
                    const cellVal = row[colIdx];
                    record[colName] = (cellVal === '' || cellVal === null) ? null : cellVal;
                });
                rowsToSave.push(record);
            }
        });

        // 1. Flush existing records to avoid orphan conflicts
        const { error: deleteError } = await supabaseClient
            .from('ClassTable')
            .delete()
            .neq('SortOrder', -1); // Deletes all rows

        if (deleteError) throw deleteError;

        // 2. Perform bulk insertion
        if (rowsToSave.length > 0) {
            const { error: insertError } = await supabaseClient
                .from('ClassTable')
                .insert(rowsToSave);

            if (insertError) throw insertError;
        }

        alert("Class data updated successfully!");
        btnSave.style.display = "none";
        
        // Refresh component state layout UI
        if (rowsToSave.length > 0) {
            btnDelete.style.display = "block";
        } else {
            btnDelete.style.display = "none";
        }
    } catch (error) {
        console.error("Error saving data:", error.message);
        alert("An error occurred while saving: " + error.message);
    } finally {
        btnSave.innerText = "Save Classes";
        btnSave.disabled = false;
    }
}

// Clear table data from Supabase and clear editor state
async function deleteClasses() {
    const userConfirmed = confirm("Are you sure you want to delete all class data from the database? This action cannot be undone.");
    if (!userConfirmed) return;

    try {
        const { error } = await supabaseClient
            .from('ClassTable')
            .delete()
            .neq('SortOrder', -1);

        if (error) throw error;

        alert("All class records have been deleted.");
        
        // Reset local Spreadsheet canvas back to empty
        const blankGridData = Array.from({ length: totalRows }, () => Array(dbColumns.length).fill(''));
        jspreadsheetTable.setData(blankGridData);

        btnDelete.style.display = "none";
        btnSave.style.display = "none";
    } catch (error) {
        console.error("Error deleting records:", error.message);
        alert("Delete sequence failed: " + error.message);
    }
}