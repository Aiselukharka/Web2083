if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

// ============================================================================
// XLSX LIBRARY LOADER (lazy)
// ============================================================================
const XLSX_LIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
let xlsxLibPromise = null;
function ensureXLSX() {
    if (typeof XLSX !== 'undefined') return Promise.resolve();
    if (xlsxLibPromise) return xlsxLibPromise;
    xlsxLibPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = XLSX_LIB_URL;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load XLSX library.'));
        document.head.appendChild(s);
    });
    return xlsxLibPromise;
}

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

// ============================================================================
// SPREADSHEET SCROLL FORWARDER
// ============================================================================
function attachSpreadsheetWheelForwarder(container) {
    if (!container) return;

    const findHScroller = () => {
        let el = container.parentElement;
        while (el && el !== document.body) {
            const style = window.getComputedStyle(el);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') return el;
            el = el.parentElement;
        }
        return container;
    };

    // ---- Wheel handling ----
    if (container.__wheelForwarder) {
        container.removeEventListener('wheel', container.__wheelForwarder, { passive: false });
    }
    const wheelHandler = function (e) {
        const hScroller = findHScroller();

        let dx = e.deltaX;
        let dy = e.deltaY;
        if (e.shiftKey && dx === 0 && dy !== 0) {
            dx = dy;
            dy = 0;
        }

        let handled = false;

        if (dx !== 0) {
            const prev = hScroller.scrollLeft;
            hScroller.scrollLeft = prev + dx;
            if (hScroller.scrollLeft !== prev) handled = true;
        }

        if (dy !== 0) {
            window.scrollBy({ top: dy, left: 0, behavior: 'auto' });
            handled = true;
        }

        if (handled) e.preventDefault();
    };
    container.__wheelForwarder = wheelHandler;
    container.addEventListener('wheel', wheelHandler, { passive: false });

    // ---- Touch handling ----
    if (container.__touchForwarder) {
        container.removeEventListener('touchstart', container.__touchForwarder.onStart);
        container.removeEventListener('touchmove',  container.__touchForwarder.onMove);
    }
    const touchState = { startX: 0, startY: 0, startScrollLeft: 0, axis: null };
    const onStart = (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const hScroller = findHScroller();
        touchState.startX = e.touches[0].clientX;
        touchState.startY = e.touches[0].clientY;
        touchState.startScrollLeft = hScroller.scrollLeft;
        touchState.axis = null;
    };
    const onMove = (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const t = e.touches[0];
        const dx = t.clientX - touchState.startX;
        const dy = t.clientY - touchState.startY;

        if (!touchState.axis) {
            if (Math.abs(dx) > Math.abs(dy) + 4) touchState.axis = 'x';
            else if (Math.abs(dy) > Math.abs(dx) + 4) touchState.axis = 'y';
            else return;
        }

        if (touchState.axis === 'x') {
            const hScroller = findHScroller();
            hScroller.scrollLeft = touchState.startScrollLeft - dx;
            e.preventDefault();
        }
    };
    container.__touchForwarder = { onStart, onMove };
    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: false });
}

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
    
    container.innerHTML = `
        <div style="width: 100%; overflow-x: auto; background: #ffffff; border: 1px solid #ccc;">
            <div id="spreadsheetContainer"></div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button id="importButton">📥 Import CSV / XLSX</button>
            <button id="saveButton" disabled>💾 Save Changes</button>
            <button id="exportXlsxButton">📊 Save as XLSX</button>
            <span id="saveStatus" style="margin-left: 15px; font-size: 13px;"></span>
        </div>
    `;

    const spreadsheetData = calendarData.map(row => columns.map(col => row[col] ?? ''));

    jexcelInstance = jspreadsheet(document.getElementById('spreadsheetContainer'), {
        data: spreadsheetData,
        columns: getJexcelColumns(),
        tableOverflow: false,
        search: false,
        pagination: false,
        onchange: function(el, cell, colIndex, rowIndex, newValue) {
            const rowDbRecord = calendarData[rowIndex];
            if (rowDbRecord) {
                const updatedFieldName = columns[colIndex];
                if (rowDbRecord[updatedFieldName] !== newValue) {
                    rowDbRecord[updatedFieldName] = newValue;
                    modifiedRows.add(rowDbRecord.id);
                    
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

    attachSpreadsheetWheelForwarder(document.getElementById('spreadsheetContainer'));

    document.getElementById('saveButton').addEventListener('click', saveChanges);
    document.getElementById('exportXlsxButton').addEventListener('click', exportCalendarAsXlsx);
    setupFileUpload();
}

// ============================================================================
// IMPORT: CSV and XLSX
// ============================================================================
function setupFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // Accept CSV and Excel (both .xlsx and legacy .xls)
    fileInput.accept = '.csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = (file.name.split('.').pop() || '').toLowerCase();

        if (!confirm(`Import rows from "${file.name}"?\nThis will overwrite matching table items in the on-screen grid. Click Save Changes afterwards to commit.`)) {
            fileInput.value = '';
            return;
        }

        try {
            let rows;
            if (ext === 'csv') {
                rows = await parseCSVFile(file);
            } else if (ext === 'xlsx' || ext === 'xls') {
                rows = await parseExcelFile(file);
            } else {
                alert('Unsupported file type. Please choose a .csv, .xlsx, or .xls file.');
                fileInput.value = '';
                return;
            }

            if (!rows || rows.length === 0) {
                alert('The file appears to be empty or could not be parsed.');
                fileInput.value = '';
                return;
            }

            const imported = applyImportedRows(rows);
            showSaveStatus(`Imported ${imported} rows from "${file.name}". Click Save Changes to commit.`, 'info');
            alert(`Imported ${imported} rows into the grid.\n\nClick "Save Changes" to store them in the database.`);
        } catch (err) {
            console.error('Import error:', err);
            alert('Import failed: ' + err.message);
        } finally {
            fileInput.value = '';
        }
    });

    document.body.appendChild(fileInput);
    document.getElementById('importButton').addEventListener('click', () => fileInput.click());
}

// Parse CSV text → array of row arrays (values only, no header handling here)
function parseCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lines = text.split('\n').filter(l => l.trim() !== '');
                const rows = lines.map(line => splitCSVLine(line));
                resolve(rows);
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Failed to read CSV file.'));
        reader.readAsText(file);
    });
}

// Small CSV splitter that handles quoted fields
function splitCSVLine(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else cur += ch;
        } else {
            if (ch === '"') inQuotes = true;
            else if (ch === ',') { out.push(cur.trim()); cur = ''; }
            else cur += ch;
        }
    }
    out.push(cur.trim());
    return out;
}

// Parse Excel file → array of row arrays
async function parseExcelFile(file) {
    await ensureXLSX();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const sheetName = wb.SheetNames[0];
                if (!sheetName) throw new Error('No sheet found in workbook.');
                const ws = wb.Sheets[sheetName];
                // header: 1 → produce an array of arrays
                const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
                resolve(aoa);
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Failed to read Excel file.'));
        reader.readAsArrayBuffer(file);
    });
}

// Given parsed rows, map them to grid columns and set cell values.
// Returns the number of rows written.
function applyImportedRows(rows) {
    if (!jexcelInstance) return 0;

    // Detect if first row is a header row by comparing against our display names.
    let columnOrder = null;    // will be array of internal column keys
    let dataStart = 0;

    const firstRow = rows[0] || [];
    const normalized = firstRow.map(v => String(v || '').trim().toLowerCase());
    const looksLikeHeader = normalized.some(cell =>
        Object.values(columnDisplayNames).some(dn => dn.toLowerCase() === cell)
    );

    if (looksLikeHeader) {
        // Map each cell of the header row to an internal column name (or null if unknown)
        columnOrder = firstRow.map(cell => {
            const raw = String(cell || '').trim().toLowerCase();
            for (const [key, display] of Object.entries(columnDisplayNames)) {
                if (display.toLowerCase() === raw) return key;
            }
            // Also allow matching by internal key name (e.g., user's Excel uses 'e_year')
            for (const key of columns) {
                if (key.toLowerCase() === raw) return key;
            }
            return null;
        });
        dataStart = 1;
    } else {
        // Positional fallback: assume columns are in our standard order
        columnOrder = columns.slice();
        dataStart = 0;
    }

    let written = 0;

    for (let i = dataStart; i < rows.length; i++) {
        const gridRow = i - dataStart;
        if (gridRow >= calendarData.length) break; // don't add or overwrite beyond existing rows
        const rowValues = rows[i];
        let touchedThisRow = false;

        for (let col = 0; col < columnOrder.length && col < rowValues.length; col++) {
            const key = columnOrder[col];
            if (!key) continue;
            const colIndex = columns.indexOf(key);
            if (colIndex === -1) continue;
            const value = String(rowValues[col] ?? '').trim();
            jexcelInstance.setValueFromCoords(colIndex, gridRow, value);
            touchedThisRow = true;
        }
        if (touchedThisRow) written++;
    }

    return written;
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

// ============================================================================
// EXPORT XLSX
// ============================================================================
async function exportCalendarAsXlsx() {
    if (!calendarData || calendarData.length === 0) {
        alert("No calendar data to export.");
        return;
    }

    const exportBtn = document.getElementById('exportXlsxButton');
    const originalText = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '📊 Preparing…';
    }

    try {
        await ensureXLSX();

        const headerRow = columns.map(col => columnDisplayNames[col] || col);
        const dataRows = calendarData.map(row => columns.map(col => row[col] ?? ''));

        const aoa = [headerRow, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws['!cols'] = columns.map(col => {
            if (col === 'event_detail') return { wch: 60 };
            if (col === 'national_event' || col === 'local_event' || col === 'day_type') return { wch: 30 };
            if (col === 'tithi') return { wch: 22 };
            return { wch: 18 };
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Calendar');

        let yearLabel = 'Calendar';
        try {
            if (typeof getCurrentBSYearNumeric === 'function') {
                yearLabel = String(getCurrentBSYearNumeric());
            }
        } catch (_) { /* fallback */ }

        XLSX.writeFile(wb, `NepaliCalendar_${yearLabel}.xlsx`);
        showSaveStatus('✅ XLSX file downloaded.', 'success');
    } catch (err) {
        console.error('XLSX export failed:', err);
        alert('Failed to export XLSX: ' + err.message);
        showSaveStatus(`❌ XLSX export error: ${err.message}`, 'error');
    } finally {
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalText || '📊 Save as XLSX';
        }
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