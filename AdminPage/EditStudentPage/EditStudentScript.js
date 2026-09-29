if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
const CLOUD_NAME = "dcdwpdnyp";

// ============================================================================
// GLOBAL STATE
// ============================================================================
window.excelGrid = null;
window.deletedStudentIds = [];
window.pendingStudentPhotos = {};
window.promoteStudentList = [];
window.rollDecisionList = [];
window.schoolInfoCache = { name: '', address: '' };

const DEFAULT_YEAR = 2082;
const DEFAULT_SOURCE_YEAR = 2081;

// Status values allowed in the Add/Edit dropdown
const STUDENT_STATUS_VALUES = ['active', 'left', 'transferred', 'graduated'];

// ============================================================================
// SECTION TOGGLE
// ============================================================================
function toggleStudentSection(section) {
    const addEdit = document.getElementById('AddEditStudentContainer');
    const promote = document.getElementById('PromoteStudentContainer');
    const roll    = document.getElementById('RollDecisionContainer');
    const btnAdd  = document.getElementById('btnOpenAddEditStudent');
    const btnPro  = document.getElementById('btnPromoteStudent');
    const btnRoll = document.getElementById('btnRollDecision');
    if (!addEdit || !promote || !roll) return;

    const setActive = (btn, on) => { if (btn) btn.classList.toggle('active', on); };
    const target = section === 'addEdit' ? addEdit : section === 'promote' ? promote : roll;
    const isHidden = target.style.display === 'none' || target.style.display === '';

    if (isHidden) {
        addEdit.style.display = 'none';
        promote.style.display = 'none';
        roll.style.display    = 'none';
        target.style.display  = 'flex';
        setActive(btnAdd,  section === 'addEdit');
        setActive(btnPro,  section === 'promote');
        setActive(btnRoll, section === 'roll');
    } else {
        target.style.display = 'none';
        setActive(btnAdd,  false);
        setActive(btnPro,  false);
        setActive(btnRoll, false);
    }
}
window.toggleStudentSection = toggleStudentSection;

// ============================================================================
// CROPPER MODAL
// ============================================================================
const STUDENT_CROP_RATIO  = 3 / 4;
const STUDENT_CROP_WIDTH  = 300;
const STUDENT_CROP_HEIGHT = 400;
let activeCropper = null;

function openCropperForStudentFile(file) {
    return new Promise((resolve, reject) => {
        const modal    = document.getElementById('CropperModal');
        const image    = document.getElementById('CropperImage');
        const btnCancel = document.getElementById('btnCancelCrop');
        const btnApply  = document.getElementById('btnApplyCrop');
        if (!modal || !image || !btnCancel || !btnApply) { reject(new Error('Cropper modal elements not found.')); return; }
        if (typeof Cropper === 'undefined') { reject(new Error('Cropper.js library not loaded.')); return; }
        if (activeCropper) { activeCropper.destroy(); activeCropper = null; }

        const reader = new FileReader();
        reader.onload = (e) => {
            image.onload = () => {
                modal.classList.add('active');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        try {
                            activeCropper = new Cropper(image, {
                                aspectRatio: STUDENT_CROP_RATIO,
                                viewMode: 2, autoCropArea: 0.9,
                                movable: true, zoomable: true, rotatable: false, scalable: false,
                                responsive: true, background: true, cropBoxResizable: true,
                                checkOrientation: false, highlight: false, guides: true, center: true,
                                toggleDragModeOnDblclick: false,
                                ready() { activeCropper.resize(); }
                            });
                        } catch (err) { reject(err); closeCropperModal(); }
                    });
                });
            };
            image.onerror = () => reject(new Error('Image failed to load'));
            image.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);

        btnApply.onclick = () => {
            if (!activeCropper) return;
            const canvas = activeCropper.getCroppedCanvas({
                width: STUDENT_CROP_WIDTH, height: STUDENT_CROP_HEIGHT, imageSmoothingQuality: 'high'
            });
            if (!canvas) { reject(new Error('Crop failed')); closeCropperModal(); return; }
            canvas.toBlob((blob) => {
                if (!blob) { reject(new Error('Blob generation failed')); closeCropperModal(); return; }
                resolve(blob); closeCropperModal();
            }, 'image/jpeg', 0.92);
        };
        btnCancel.onclick = () => { reject(new Error('Cancelled')); closeCropperModal(); };
    });
}
function closeCropperModal() {
    const modal = document.getElementById('CropperModal');
    if (modal) modal.classList.remove('active');
    if (activeCropper) { activeCropper.destroy(); activeCropper = null; }
}

// ============================================================================
// AUTH
// ============================================================================
protectAdminPage();
async function protectAdminPage() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("../LoginPage/LoginIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// ============================================================================
// NAVIGATION
// ============================================================================
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
        const p = pageMap[this.value];
        if (p) window.location.href = p;
    });
}
const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
if (EditNavigationDropDown) {
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
            "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
            "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
            "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
            "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
            "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
            "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
            "ClassEditBox": "../EditClassPage/EditClassIndex.html",
            "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
        };
        const p = pageMap[this.value];
        if (p) window.location.href = p;
    });
}

// ============================================================================
// DATE HEADER
// ============================================================================
const dateBox = document.getElementById('DateBox');
if (dateBox && typeof AD2BS === 'function') {
    dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";
}

// ============================================================================
// ADMIN TOOLS
// ============================================================================
const adminToolsSelect = document.getElementById("AdminToolsSelect");
if (adminToolsSelect) {
    adminToolsSelect.addEventListener("change", async function () {
        switch (this.value) {
        case "ChangePasswordTool":
            window.location.href = "../ChangePasswordPage/ChangePasswordIndex.html"; break;
        case "LogoutThisDeviceTool":
            showCustomDialog2("Confirm Logout", "Logout from this device?", "Yes", "Cancel",
                async function () {
                    await supabaseClient.auth.signOut({scope: "local"});
                    window.location.replace("../LoginPage/LogInIndex.html");
                }, function () {});
            break;
        case "LogoutAllDevicesTool":
            const c = showCustomDialog2("Confirm Logout", "Logout from all devices?", "Yes", "Cancel", function(){}, function(){});
            if (c === "Yes") {
                await supabaseClient.auth.signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html"; break;
        }
        this.selectedIndex = 0;
    });
}

// ============================================================================
// LOGO
// ============================================================================
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable').select('Value').eq('Name', 'SchoolLogo').single();
        if (error) { console.error("Logo load error:", error.message); return; }
        if (data && data.Value) {
            const f = document.getElementById('dynamicFavicon');
            if (f) f.href = data.Value;
            const l = document.querySelector('#LogoBox img');
            if (l) l.src = data.Value;
        }
    } catch (error) { console.error("Branding layout error:", error); }
}
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// ============================================================================
// HELPERS
// ============================================================================
async function getCurrentAdminId() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user ? user.id : null;
    } catch { return null; }
}

async function cleanupOldPromotionHistory() {
    const cutoff = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
    try {
        const { error } = await supabaseClient.rpc('cleanup_old_promotion_history');
        if (error) throw error;
    } catch (e) {
        console.warn("RPC cleanup failed; falling back to client delete:", e.message);
        try {
            await supabaseClient.from('PromotionHistoryTable').delete().lt('PromotedAt', cutoff);
        } catch (e2) {
            console.warn("Client cleanup also failed (non-fatal):", e2.message);
        }
    }
}

// Normalize a status value from the grid
function normalizeStatus(v) {
    const s = String(v ?? '').trim().toLowerCase();
    return STUDENT_STATUS_VALUES.includes(s) ? s : 'active';
}

// ============================================================================
// SPREADSHEET SCROLL FIX
// ============================================================================
function attachSpreadsheetWheelForwarder(container) {
    if (!container) return;
    if (container.__wheelForwarder) {
        container.removeEventListener('wheel', container.__wheelForwarder, { passive: false });
    }
    const handler = function (e) {
        const scroller = container.querySelector('.jexcel_content') ||
                         container.querySelector('.jspreadsheet_content') ||
                         container.querySelector('.jexcel_container') ||
                         container;
        if (!scroller) return;
        const atTop    = scroller.scrollTop <= 0;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
            window.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
            e.preventDefault();
        }
    };
    container.__wheelForwarder = handler;
    container.addEventListener('wheel', handler, { passive: false });
}

// ============================================================================
// ADD / EDIT STUDENT
// ============================================================================
document.getElementById('StudentEditContainer').insertAdjacentHTML('beforeend', `
    <div id="StudentDataBox">
        <div id="AddEditStudentHead">Add/Edit Students</div>
        <div id="StudentDropdownBox">
            <div id="StudentDataDiv0">Edu. Year:</div>
            <select id="StudentYearSelectionSelect"></select>
            <div id="StudentDataDiv1">Class:</div>
            <select id="StudentClassSelectionSelect"></select>
            <div id="StudentDataDiv2">Number of Students:</div>
            <input type="number" id="studentCountInput" value="0" min="0" max="99" oninput="validateInput(this)"/>
        </div>
        <button id="btnLoadClassStudents" type="button" onclick="loadClassStudents()">Load Class</button>
        <div id="ClassStudentDataTableBox"></div>
        <button id="btnSaveClassStudentData" type="button" style="display:none;" onclick="saveClassStudentData()">Save Class Data</button>
    </div>
`);

function toggleSaveButton(show) {
    const b = document.getElementById('btnSaveClassStudentData');
    if (b) b.style.display = show ? 'inline-block' : 'none';
}

async function loadClassNameDropdown() {
    const dd = document.getElementById('StudentClassSelectionSelect');
    if (!dd) return;
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        dd.innerHTML = '<option value="" selected disabled>-- Select a Class --</option>';
        classes.forEach(c => {
            const o = document.createElement('option');
            o.value = c.id; o.textContent = c.ClassName; dd.appendChild(o);
        });
    } catch (e) { console.error("Class dropdown error:", e.message); }
}

// New column order:
//  0: id (hidden)         1: ClassID (hidden)
//  2: Roll No             3: Status
//  4: Student's Name      5: Permanent Address
//  6: Gender              7: DOB BS
//  8: DOB AD              9: Father's Name
// 10: Mother's Name      11: Contact
// 12: Email              13: Stream
// 14: Race               15: House
// 16: Subjects           17: Regd No
// 18: Symb No
//
// DOBBS is index 7 → column H
// DOBAD is index 8 → column I
const EXCEL_COLUMNS = [
    { type: 'hidden', name: 'id' },
    { type: 'hidden', name: 'ClassID' },
    { type: 'text',     title: 'Roll. No.',         name: 'RollNo',         align: 'center', width: 80 },
    { type: 'dropdown', title: 'Status',            name: 'Status',         align: 'left',   width: 130,
      source: STUDENT_STATUS_VALUES },
    { type: 'text',     title: 'Student\'s Name',   name: 'StudentName',    align: 'left',   width: 250 },
    { type: 'text',     title: 'Permanent Address', name: 'StudentAddress', align: 'left',   width: 350 },
    { type: 'text',     title: 'Gender',            name: 'StudentGender',  align: 'left',   width: 100 },
    { type: 'text',     title: 'DOB BS',            name: 'DOBBS',          align: 'left',   width: 150 },
    { type: 'text',     title: 'DOB AD',            name: 'DOBAD',          align: 'left',   width: 150 },
    { type: 'text',     title: 'Father\'s Name',    name: 'FatherName',     align: 'left',   width: 250 },
    { type: 'text',     title: 'Mother\'s Name',    name: 'MotherName',     align: 'left',   width: 250 },
    { type: 'text',     title: 'Contact',           name: 'Contact',        align: 'left',   width: 200 },
    { type: 'text',     title: 'Email',             name: 'Email',          align: 'left',   width: 250 },
    { type: 'text',     title: 'Stream',            name: 'Stream',         align: 'left',   width: 120 },
    { type: 'text',     title: 'Race',              name: 'Race',           align: 'left',   width: 200 },
    { type: 'text',     title: 'House',             name: 'House',          align: 'left',   width: 250 },
    { type: 'text',     title: 'Subjects',          name: 'Subjects',       align: 'left',   width: 400 },
    { type: 'text',     title: 'Regd. No.',         name: 'RegdNo',         align: 'left',   width: 150 },
    { type: 'text',     title: 'Symb. No.',         name: 'SymbNo',         align: 'left',   width: 150 }
];

// Column indices for auto-conversion in onchange
const COL_DOBBS = 7;
const COL_DOBAD = 8;
// Column letter for DOBAD (0-based index 8 → 'I')
const COL_LETTER_DOBAD = 'I';

document.addEventListener('DOMContentLoaded', () => {
    populateFixedYearDropdown('StudentYearSelectionSelect', DEFAULT_YEAR);
    loadClassNameDropdown();
    cleanupOldPromotionHistory();
    const y = document.getElementById('StudentYearSelectionSelect');
    const c = document.getElementById('StudentClassSelectionSelect');
    if (y) y.addEventListener('change', loadStudentsForSelectedClass);
    if (c) c.addEventListener('change', loadStudentsForSelectedClass);
});

async function loadStudentsForSelectedClass() {
    const y = document.getElementById('StudentYearSelectionSelect');
    const c = document.getElementById('StudentClassSelectionSelect');
    if (!y || !c) return;
    const year = parseInt(y.value, 10);
    const classIdRaw = c.value;
    const classIdNum = parseInt(classIdRaw, 10);
    if (!Number.isFinite(classIdNum) || !Number.isFinite(year)) return;
    const classId = classIdNum;

    const sheetConstructor = (typeof jexcel !== 'undefined') ? jexcel : jspreadsheet;
    toggleSaveButton(false);
    try {
        const { data: students, error } = await supabaseClient
            .from('StudentDataTable').select('*')
            .eq('ClassID', classId).eq('EducationalYear', year)
            .order('RollNo', { ascending: true, nullsFirst: false });
        if (error) throw error;
        if (students && students.length > 0) {
            const formatted = students.map(st => ({
                id: st.id, ClassID: st.ClassID || classId,
                RollNo: st.RollNo ?? '',
                Status: normalizeStatus(st.Status),
                StudentName: st.StudentName || '',
                StudentAddress: st.StudentAddress || '',
                StudentGender: st.StudentGender || '',
                DOBBS: st.DOBBS || '', DOBAD: st.DOBAD || '',
                FatherName: st.FatherName || '', MotherName: st.MotherName || '',
                Contact: st.Contact || '', Email: st.Email || '',
                Stream: st.Stream || '', Race: st.Race || '',
                House: st.House || '', Subjects: st.Subjects || '',
                RegdNo: st.RegdNo || '', SymbNo: st.SymbNo || ''
            }));
            document.getElementById('studentCountInput').value = formatted.length;
            initializeExcelGrid(formatted);
        } else {
            document.getElementById('studentCountInput').value = 0;
            if (window.excelGrid && sheetConstructor) {
                sheetConstructor.destroy(document.getElementById('ClassStudentDataTableBox'));
                window.excelGrid = null;
            }
            document.getElementById('ClassStudentDataTableBox').innerHTML =
                "<p style='padding:10px;'>No data. Choose a count and click 'Load Class'.</p>";
            toggleSaveButton(false);
        }
    } catch (e) { console.error("Fetch error:", e.message); }
}

function loadClassStudents() {
    const y = document.getElementById('StudentYearSelectionSelect');
    const c = document.getElementById('StudentClassSelectionSelect');
    const req = parseInt(document.getElementById('studentCountInput').value) || 0;
    const year = parseInt(y.value, 10);
    const classIdRaw = c.value;
    const classIdNum = parseInt(classIdRaw, 10);
    if (!Number.isFinite(classIdNum)) { alert("Select a class."); return; }
    if (!Number.isFinite(year)) { alert("Select a year."); return; }
    const classId = classIdNum;

    let cur = [];
    if (window.excelGrid) cur = window.excelGrid.getJson();
    const finalPayload = [...cur];
    if (req > finalPayload.length) {
        for (let i = 1; i <= req - finalPayload.length; i++) {
            finalPayload.push({
                id: '', ClassID: classId,
                RollNo: '', Status: 'active',
                StudentName: '', StudentAddress: '',
                StudentGender: '', DOBBS: '', DOBAD: '',
                FatherName: '', MotherName: '', Contact: '', Email: '',
                Stream: '', Race: '', House: '', Subjects: '',
                RegdNo: '', SymbNo: ''
            });
        }
    } else if (req < finalPayload.length) {
        finalPayload.length = req;
    }
    initializeExcelGrid(finalPayload);
    toggleSaveButton(true);
}

function initializeExcelGrid(dataArray) {
    const container = document.getElementById('ClassStudentDataTableBox');
    if (!container) return;
    container.innerHTML = '';
    const SC = (typeof jexcel !== 'undefined') ? jexcel : jspreadsheet;
    if (!SC) return;
    window.deletedStudentIds = [];
    toggleSaveButton(false);
    window.excelGrid = SC(container, {
        data: dataArray, columns: EXCEL_COLUMNS,
        allowInsertColumn: false, allowDeleteColumn: false, columnSorting: false,
        copyCompatibility: true, allowRenameColumn: false,
        minDimensions: [EXCEL_COLUMNS.length, 0],
        tableOverflow: true, tableWidth: '100%', tableHeight: '450px',
        onchange: function(instance, cell, x, y, value) {
            toggleSaveButton(true);
            const colIdx = parseInt(x, 10);
            if (colIdx === COL_DOBBS) {
                const bs = String(value).trim();
                const coord = COL_LETTER_DOBAD + (parseInt(y) + 1);
                if (!bs) { if (window.excelGrid) window.excelGrid.setValue(coord, ''); return; }
                try {
                    const ad = BS2AD_YMD(bs);
                    if (window.excelGrid) window.excelGrid.setValue(coord, ad);
                } catch (e) {
                    if (window.excelGrid) window.excelGrid.setValue(coord, 'Invalid BS Date');
                }
            }
        },
        onselection: function(instance) {
            if (instance && typeof instance.updateScroll === 'function') instance.updateScroll();
        }
    });

    attachSpreadsheetWheelForwarder(container);
}

async function saveClassStudentData() {
    const y = document.getElementById('StudentYearSelectionSelect');
    const c = document.getElementById('StudentClassSelectionSelect');
    const year = parseInt(y.value, 10);
    const classIdRaw = c.value;
    const classIdNum = parseInt(classIdRaw, 10);
    if (!Number.isFinite(classIdNum) || !Number.isFinite(year) || !window.excelGrid) {
        alert("Load a valid class table before saving."); return;
    }
    const classId = classIdNum;
    const gridData = window.excelGrid.getJson();
    const newRows = [], updRows = [];
    gridData.forEach(row => {
        const name = row.StudentName || row.studentname;
        if (name && name.trim() !== "") {
            const r = {
                ClassID: classId,
                EducationalYear: year,
                Status: normalizeStatus(row.Status || row.status),
                RollNo: (row.RollNo === '' || row.RollNo === null || row.RollNo === undefined)
                    ? null : (parseInt(row.RollNo || row.rollno, 10) || null),
                RegdNo: row.RegdNo || row.regdno || '',
                SymbNo: row.SymbNo || row.symbno || '',
                StudentName: name.trim(),
                StudentAddress: row.StudentAddress || row.studentaddress || '',
                StudentGender: row.StudentGender || row.studentgender || '',
                DOBBS: row.DOBBS || row.dobbs || '',
                DOBAD: row.DOBAD || row.dobad || '',
                FatherName: row.FatherName || row.fathername || '',
                MotherName: row.MotherName || row.mothername || '',
                Contact: row.Contact || row.contact || '',
                Email: row.Email || row.email || '',
                Stream: row.Stream || row.stream || '',
                Race: row.Race || row.race || '',
                House: row.House || row.house || '',
                Subjects: row.Subjects || row.subjects || ''
            };
            const raw = row.id;
            const hasId = raw !== undefined && raw !== null && String(raw).trim() !== ''
                && String(raw).trim() !== 'null' && String(raw).trim() !== 'undefined';
            if (hasId) { r.id = raw; updRows.push(r); } else newRows.push(r);
        }
    });
    try {
        if (window.deletedStudentIds.length > 0) {
            const { error } = await supabaseClient.from('StudentDataTable').delete().in('id', window.deletedStudentIds);
            if (error) throw error;
        }
        if (updRows.length > 0) {
            const { error } = await supabaseClient.from('StudentDataTable').upsert(updRows, { onConflict: 'id' });
            if (error) throw error;
        }
        if (newRows.length > 0) {
            const { error } = await supabaseClient.from('StudentDataTable').insert(newRows);
            if (error) throw error;
        }
        alert("Saved.");
        window.deletedStudentIds = [];
        toggleSaveButton(false);
        loadStudentsForSelectedClass();
    } catch (e) {
        console.error("Save error:", e.message);
        alert("Save failed: " + e.message);
    }
}

window.validateInput = function(input) {
    let v = parseInt(input.value, 10);
    if (isNaN(v)) { input.value = 0; return; }
    if (v > 99) input.value = 99;
    if (v < 0) input.value = 0;
};

// ============================================================================
// PHOTOS
// ============================================================================
document.getElementById('StudentPhotoEditBox').insertAdjacentHTML('beforeend', `
    <div id="StudentPhotoDropdownBox">
        <div>Edu. Year:</div>
        <select id="StudentPhotoYearSelect"></select>
        <div>Class:</div>
        <select id="StudentPhotoClassSelect"><option selected disabled>Select Class</option></select>
    </div>
    <div id="StudentPhotoListContainer"></div>
    <button id="btnSaveStudentPhoto" type="button" style="display:none;" onclick="saveAllSelectedPhotos()">Save All Photos</button>
`);

function getFileNameFromUrl(url) {
    if (!url) return "No file chosen";
    try { const d = decodeURIComponent(url); return d.substring(d.lastIndexOf('/') + 1); }
    catch { return "View Attachment"; }
}

async function loadClassesInPhotoSelect() {
    const dd = document.getElementById('StudentPhotoClassSelect');
    if (!dd) return;
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        dd.innerHTML = '<option selected disabled>Select Class</option>';
        classes.forEach(c => {
            const o = document.createElement('option');
            o.value = c.id; o.textContent = c.ClassName; dd.appendChild(o);
        });
    } catch (e) { console.error("Photo classes error:", e.message); }
}

document.addEventListener('DOMContentLoaded', () => {
    populateFixedYearDropdown('StudentPhotoYearSelect', DEFAULT_YEAR);
    loadClassesInPhotoSelect();
    const c = document.getElementById('StudentPhotoClassSelect');
    const y = document.getElementById('StudentPhotoYearSelect');
    if (c) c.addEventListener('change', refreshPhotoStudentList);
    if (y) y.addEventListener('change', refreshPhotoStudentList);
});

async function refreshPhotoStudentList() {
    const classSelectEl = document.getElementById('StudentPhotoClassSelect');
    const classIdRaw = classSelectEl?.value || '';
    const classIdNum = parseInt(classIdRaw, 10);
    const year = parseInt(document.getElementById('StudentPhotoYearSelect')?.value, 10);
    const list = document.getElementById('StudentPhotoListContainer');
    const btn = document.getElementById('btnSaveStudentPhoto');
    if (!list) return;
    window.pendingStudentPhotos = {};
    if (btn) btn.style.display = 'none';
    if (!Number.isFinite(classIdNum) || !Number.isFinite(year)) {
        list.innerHTML = '';
        return;
    }
    const classId = classIdNum;

    list.innerHTML = '<p style="color: gray;">Loading...</p>';
    try {
        const { data: students, error } = await supabaseClient
            .from('StudentDataTable').select('id, RollNo, StudentName, PhotoUrl')
            .eq('ClassID', classId).eq('EducationalYear', year);
        if (error) throw error;
        if (!students || students.length === 0) {
            list.innerHTML = '<p style="color:#f33;padding:10px 0;">No students.</p>';
            return;
        }
        if (btn) btn.style.display = 'inline-block';
        students.sort((a, b) => (parseInt(a.RollNo, 10) || 0) - (parseInt(b.RollNo, 10) || 0));
        let html = `
            <div id="StudentPhotoListHead">
                <div id="StudentPhotoListHead_1">R.N.</div>
                <div id="StudentPhotoListHead_2">Student Name</div>
                <div id="StudentPhotoListHead_5">Preview</div>
                <div id="StudentPhotoListHead_4">Action</div>
                <div id="StudentPhotoListHead_3">File Name</div>
            </div>`;
        students.forEach(st => {
            const disp = st.PhotoUrl ? getFileNameFromUrl(st.PhotoUrl) : "No file chosen";
            const style = st.PhotoUrl ? "color: green; font-weight: 500;" : "color: gray;";
            const src = st.PhotoUrl || '';
            html += `
                <div class="SingleStudentPhotoBoxes" id="student_row_${st.id}">
                    <div class="SingleStudentRoll">${st.RollNo ?? ''}</div>
                    <div class="SingleStudentName">${st.StudentName}</div>
                    <div class="SingleStudentPhotoPreview">
                        <img id="preview_${st.id}" class="StudentPhotoThumb ${src ? 'active' : ''}" src="${src}" alt="Preview" />
                    </div>
                    <div class="SingleStudentPhotoAction">
                        <input type="file" id="photo_input_${st.id}" accept="image/*" style="display: none;" onchange="handleStudentPhotoSelection(this, '${st.id}')" />
                        <button class="SingleStudentSelectPhoto" type="button" onclick="document.getElementById('photo_input_${st.id}').click()">Choose Photo</button>
                    </div>
                    <div class="SingleStudentPhotoName" id="file_name_${st.id}" style="${style}">${disp}</div>
                </div>`;
        });
        list.innerHTML = html;
    } catch (e) { console.error(e); list.innerHTML = '<p style="color:red;">Failed to load.</p>'; }
}

window.handleStudentPhotoSelection = async function(input, studentId) {
    const file = input.files[0];
    const nameEl = document.getElementById(`file_name_${studentId}`);
    const prevEl = document.getElementById(`preview_${studentId}`);
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Image file required.'); input.value=''; return; }
    if (file.size > 10 * 1024 * 1024) { alert('File too large.'); input.value=''; return; }
    try {
        const blob = await openCropperForStudentFile(file);
        const cName = file.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg';
        const cFile = new File([blob], cName, { type: 'image/jpeg', lastModified: Date.now() });
        window.pendingStudentPhotos[studentId] = cFile;
        if (prevEl) {
            if (prevEl.dataset.objectUrl) URL.revokeObjectURL(prevEl.dataset.objectUrl);
            const u = URL.createObjectURL(cFile);
            prevEl.src = u; prevEl.dataset.objectUrl = u; prevEl.classList.add('active');
        }
        if (nameEl) { nameEl.innerText = cName; nameEl.style.color = "#0066cc"; }
    } catch (e) { input.value = ''; }
};

async function saveAllSelectedPhotos() {
    const ids = Object.keys(window.pendingStudentPhotos);
    if (ids.length === 0) { alert("Choose at least one photo."); return; }
    const btn = document.getElementById('btnSaveStudentPhoto');
    if (btn) { btn.textContent = "Uploading..."; btn.disabled = true; }
    let ok = 0;
    for (const id of ids) {
        const f = window.pendingStudentPhotos[id];
        const nameEl = document.getElementById(`file_name_${id}`);
        if (nameEl) nameEl.innerText = "Uploading...";
        try {
            const fd = new FormData();
            fd.append('file', f);
            fd.append('upload_preset', 'StudentPhotoSelectPreset');
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body: fd });
            if (!res.ok) throw new Error("Cloudinary failed.");
            const j = await res.json();
            const { error } = await supabaseClient.from('StudentDataTable').update({ PhotoUrl: j.secure_url }).eq('id', id);
            if (error) throw error;
            if (nameEl) { nameEl.innerText = getFileNameFromUrl(j.secure_url); nameEl.style.color = "green"; }
            const prev = document.getElementById(`preview_${id}`);
            if (prev) {
                if (prev.dataset.objectUrl) { URL.revokeObjectURL(prev.dataset.objectUrl); delete prev.dataset.objectUrl; }
                prev.src = j.secure_url; prev.classList.add('active');
            }
            ok++;
        } catch (e) {
            console.error(e);
            if (nameEl) { nameEl.innerText = "❌ Failed"; nameEl.style.color = "red"; }
        }
    }
    alert(`Uploaded ${ok} / ${ids.length}.`);
    if (btn) { btn.textContent = "Save All Photos"; btn.disabled = false; }
    window.pendingStudentPhotos = {};
    refreshPhotoStudentList();
}

// ============================================================================
// DELETE CLASS
// ============================================================================
document.getElementById('DeleteClassDataBox').innerHTML = `
    <div class="delete-dropdown-wrapper">
        <label for="DeleteClassYearSelect">Year:</label>
        <select id="DeleteClassYearSelect"></select>
    </div>
    <div class="delete-dropdown-wrapper">
        <label for="DeleteClassSelect">Class:</label>
        <select id="DeleteClassSelect"><option selected disabled>-- Select Class --</option></select>
    </div>
    <div class="delete-dropdown-wrapper">
        <label><input type="checkbox" id="DeleteAllYearsCheck" /> Delete ALL years</label>
    </div>
    <div id="DeleteClassRosterBox" class="delete-roster-container"></div>
    <div class="delete-action-wrapper">
        <button id="btnDeleteWholeClass" type="button" style="display:none;" onclick="executeWholeClassDeletion()">Permanently Delete Class Data</button>
    </div>
`;

function getPublicIdFromUrl(url) {
    if (!url) return null;
    try {
        const p = url.split('/');
        return p[p.length - 1].split('.')[0];
    } catch { return null; }
}

async function loadClassesInDeleteSelect() {
    const dd = document.getElementById('DeleteClassSelect');
    if (!dd) return;
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        dd.innerHTML = '<option selected disabled>-- Select Class --</option>';
        classes.forEach(c => {
            const o = document.createElement('option');
            o.value = c.id; o.textContent = c.ClassName; dd.appendChild(o);
        });
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    populateFixedYearDropdown('DeleteClassYearSelect', DEFAULT_YEAR);
    loadClassesInDeleteSelect();
    const cls = document.getElementById('DeleteClassSelect');
    const yr = document.getElementById('DeleteClassYearSelect');
    const all = document.getElementById('DeleteAllYearsCheck');
    if (cls) cls.addEventListener('change', refreshDeleteRoster);
    if (yr) yr.addEventListener('change', refreshDeleteRoster);
    if (all) all.addEventListener('change', refreshDeleteRoster);
});

async function refreshDeleteRoster() {
    const classSelectEl = document.getElementById('DeleteClassSelect');
    const classIdRaw = classSelectEl?.value || '';
    const classIdNum = parseInt(classIdRaw, 10);
    const year = parseInt(document.getElementById('DeleteClassYearSelect')?.value, 10);
    const allYears = document.getElementById('DeleteAllYearsCheck')?.checked;
    const roster = document.getElementById('DeleteClassRosterBox');
    const btn = document.getElementById('btnDeleteWholeClass');
    if (!roster || !btn) return;
    btn.style.display = 'none';
    if (!Number.isFinite(classIdNum)) { roster.innerHTML = ''; return; }
    if (!allYears && !Number.isFinite(year)) { roster.innerHTML = ''; return; }
    const classId = classIdNum;

    roster.innerHTML = '<p class="roster-status-text">Loading...</p>';
    try {
        let q = supabaseClient.from('StudentDataTable').select('RollNo, StudentName, EducationalYear, Status').eq('ClassID', classId);
        if (!allYears) q = q.eq('EducationalYear', year);
        const { data: students, error } = await q;
        if (error) throw error;
        if (!students || students.length === 0) {
            roster.innerHTML = '<p class="roster-empty-text">No students found.</p>';
            return;
        }
        students.sort((a, b) => {
            if ((a.EducationalYear || 0) !== (b.EducationalYear || 0))
                return (a.EducationalYear || 0) - (b.EducationalYear || 0);
            return (parseInt(a.RollNo, 10) || 0) - (parseInt(b.RollNo, 10) || 0);
        });
        let html = `<div class="roster-title">Students to be deleted (${students.length}):</div><ul class="roster-list">`;
        students.forEach(st => {
            const yLabel = allYears ? `[${st.EducationalYear}] ` : '';
            const sLabel = st.Status && st.Status !== 'active' ? ` (${st.Status})` : '';
            html += `<li>${yLabel}<strong>R.N. ${st.RollNo ?? '--'}:</strong> ${st.StudentName}${sLabel}</li>`;
        });
        html += '</ul>';
        roster.innerHTML = html;
        btn.style.display = 'block';
    } catch (e) { roster.innerHTML = '<p class="roster-error-text">Failed.</p>'; }
}

async function executeWholeClassDeletion() {
    const classIdRaw = document.getElementById('DeleteClassSelect').value;
    const classId = parseInt(classIdRaw, 10);
    if (!Number.isFinite(classId)) { alert("Please select a class."); return; }

    const year = parseInt(document.getElementById('DeleteClassYearSelect').value, 10);
    const allYears = document.getElementById('DeleteAllYearsCheck').checked;
    const btn = document.getElementById('btnDeleteWholeClass');
    const roster = document.getElementById('DeleteClassRosterBox');

    if (!allYears && !Number.isFinite(year)) { alert("Select a year."); return; }
    const msg = allYears
        ? "⚠️ Delete ALL students of this class across ALL years? Cannot be undone."
        : `⚠️ Delete students of this class for year ${year}? Cannot be undone.`;
    if (!confirm(msg)) return;
    try {
        if (btn) { btn.textContent = "Processing..."; btn.disabled = true; }
        let q = supabaseClient.from('StudentDataTable').select('PhotoUrl').eq('ClassID', classId);
        if (!allYears) q = q.eq('EducationalYear', year);
        const { data: students, error: fe } = await q;
        if (fe) throw fe;
        const pids = [];
        (students || []).forEach(st => {
            if (st.PhotoUrl) { const p = getPublicIdFromUrl(st.PhotoUrl); if (p) pids.push(p); }
        });
        if (pids.length > 0) {
            const { error: ee } = await supabaseClient.functions.invoke('delete-student-photo', { body: { publicIds: pids } });
            if (ee) throw new Error(`Edge purge failed: ${ee.message}`);
        }
        let dq = supabaseClient.from('StudentDataTable').delete().eq('ClassID', classId);
        if (!allYears) dq = dq.eq('EducationalYear', year);
        const { error: de } = await dq;
        if (de) throw de;
        alert("Deleted.");
        if (btn) btn.style.display = 'none';
        if (roster) roster.innerHTML = '';
        await loadClassesInDeleteSelect();
        await loadClassNameDropdown();
        await loadClassesInPhotoSelect();
        await loadPromoteClassDropdowns();
        await loadRollDecisionClassDropdowns();
    } catch (e) {
        alert("Delete failed: " + e.message);
    } finally {
        if (btn) { btn.textContent = "Permanently Delete Class Data"; btn.disabled = false; }
    }
}

// ============================================================================
// PROMOTE SECTION
// ============================================================================
document.getElementById('PromoteStudentContainer').insertAdjacentHTML('beforeend', `
    <div id="PromoteStudentBox">
        <div id="PromoteStudentHead">Promote / Retain Students</div>

        <div id="PromoteSourceRow">
            <div class="PromoteDropdownGroup">
                <label for="PromoteSourceYearSelect">Source Year:</label>
                <select id="PromoteSourceYearSelect"></select>
            </div>
            <div class="PromoteDropdownGroup">
                <label for="PromoteSourceClassSelect">Source Class:</label>
                <select id="PromoteSourceClassSelect"><option selected disabled>-- Select --</option></select>
            </div>
            <button id="btnLoadPromoteStudents" type="button" onclick="loadPromoteStudentList()">Load Students</button>
        </div>

        <div id="PromoteTargetRow">
            <div class="PromoteDropdownGroup">
                <label for="PromoteTargetYearSelect">Target Year:</label>
                <select id="PromoteTargetYearSelect"></select>
            </div>
            <div class="PromoteDropdownGroup">
                <label for="PromoteTargetClassSelect">Target Class (for promoted):</label>
                <select id="PromoteTargetClassSelect"><option selected disabled>-- Select --</option></select>
            </div>
        </div>

        <div id="PromoteQuickActions">
            <button type="button" class="QuickBtn" onclick="setAllDecisions('promote')">Promote all</button>
            <button type="button" class="QuickBtn" onclick="setAllDecisions('stay')">Stay all</button>
            <button type="button" class="QuickBtn" onclick="setAllDecisions('withheld')">Withheld all</button>
        </div>

        <div id="PromoteStudentListContainer"></div>

        <div id="PromoteActionBox">
            <button id="btnPromoteSelectedStudents" type="button" style="display:none;" onclick="promoteSelectedStudents()">Execute Promotion</button>
        </div>
    </div>
`);

async function loadPromoteClassDropdowns() {
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        const fill = (id, ph) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = `<option value="" selected disabled>${ph}</option>`;
            classes.forEach(c => {
                const o = document.createElement('option');
                o.value = c.id; o.textContent = c.ClassName; el.appendChild(o);
            });
        };
        fill('PromoteSourceClassSelect', '-- Select --');
        fill('PromoteTargetClassSelect', '-- Select --');
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    populateFixedYearDropdown('PromoteSourceYearSelect', DEFAULT_SOURCE_YEAR);
    populateFixedYearDropdown('PromoteTargetYearSelect', DEFAULT_YEAR);
    loadPromoteClassDropdowns();
});

window.setAllDecisions = function(decision) {
    document.querySelectorAll('.promote-student-row').forEach(row => {
        if (row.dataset.status !== 'active') return;
        const r = row.querySelector(`input[name="decision_${row.dataset.studentId}"][value="${decision}"]`);
        if (r) r.checked = true;
    });
};

async function loadPromoteStudentList() {
    const srcYear = parseInt(document.getElementById('PromoteSourceYearSelect').value, 10);
    const srcClsRaw = document.getElementById('PromoteSourceClassSelect').value;
    const srcClsNum = parseInt(srcClsRaw, 10);
    const list = document.getElementById('PromoteStudentListContainer');
    const btn = document.getElementById('btnPromoteSelectedStudents');
    if (!list) return;
    if (!Number.isFinite(srcClsNum) || !Number.isFinite(srcYear)) { alert("Select source year and class."); return; }
    const srcCls = srcClsNum;

    list.innerHTML = '<p class="promote-status-text">Loading...</p>';
    if (btn) btn.style.display = 'none';
    window.promoteStudentList = [];
    try {
        // Only active students are loaded into the promotion table
        const { data: students, error } = await supabaseClient
            .from('StudentDataTable')
            .select('id, RollNo, StudentName, RegdNo, MeritNo, Status')
            .eq('ClassID', srcCls)
            .eq('EducationalYear', srcYear)
            .eq('Status', 'active');
        if (error) throw error;
        if (!students || students.length === 0) {
            list.innerHTML = '<p class="promote-empty-text">No active students in this class/year.</p>';
            return;
        }
        students.sort((a, b) => (parseInt(a.RollNo, 10) || 0) - (parseInt(b.RollNo, 10) || 0));
        window.promoteStudentList = students;
        let html = `
            <div class="promote-list-head">
                <div class="promote-col-roll">R.N.</div>
                <div class="promote-col-name">Student Name</div>
                <div class="promote-col-status">Status</div>
                <div class="promote-col-decision">Decision</div>
            </div>`;
        students.forEach(st => {
            const status = (st.Status || 'active').toLowerCase();
            const isActive = status === 'active';
            const opts = STUDENT_STATUS_VALUES
                .map(v => `<option value="${v}" ${v === status ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`)
                .join('');
            html += `
                <div class="promote-student-row" data-student-id="${st.id}" data-status="${status}">
                    <div class="promote-col-roll">${st.RollNo ?? ''}</div>
                    <div class="promote-col-name">${st.StudentName}</div>
                    <div class="promote-col-status">
                        <select class="promote-status-select" onchange="onStatusChange(this)" data-student-id="${st.id}">
                            ${opts}
                        </select>
                    </div>
                    <div class="promote-col-decision">
                        <label><input type="radio" name="decision_${st.id}" value="promote" ${isActive ? 'checked' : ''} ${isActive ? '' : 'disabled'} /> Promote</label>
                        <label><input type="radio" name="decision_${st.id}" value="stay" ${isActive ? '' : 'disabled'} /> Stay</label>
                        <label><input type="radio" name="decision_${st.id}" value="withheld" ${isActive ? '' : 'disabled'} /> Withheld</label>
                    </div>
                </div>`;
        });
        list.innerHTML = html;
        if (btn) btn.style.display = 'block';
    } catch (e) { console.error(e); list.innerHTML = '<p class="promote-error-text">Failed.</p>'; }
}

window.onStatusChange = function(selectEl) {
    const row = selectEl.closest('.promote-student-row');
    const s = selectEl.value.toLowerCase();
    row.dataset.status = s;
    const isActive = s === 'active';
    row.querySelectorAll(`input[name="decision_${row.dataset.studentId}"]`).forEach(r => r.disabled = !isActive);
    row.classList.toggle('promote-row-nonactive', !isActive);
};

async function promoteSelectedStudents() {
    const srcYear = parseInt(document.getElementById('PromoteSourceYearSelect').value, 10);
    const srcClsRaw = document.getElementById('PromoteSourceClassSelect').value;
    const srcClsNum = parseInt(srcClsRaw, 10);
    const tgtYear = parseInt(document.getElementById('PromoteTargetYearSelect').value, 10);
    const tgtClsRaw = document.getElementById('PromoteTargetClassSelect').value;
    const tgtClsNum = parseInt(tgtClsRaw, 10);
    const btn = document.getElementById('btnPromoteSelectedStudents');

    if (!Number.isFinite(srcClsNum) || !Number.isFinite(tgtClsNum) || !Number.isFinite(srcYear) || !Number.isFinite(tgtYear)) {
        alert("Select source and target."); return;
    }
    if (tgtYear <= srcYear) { alert("Target year must be > source year."); return; }
    const srcCls = srcClsNum;
    const tgtCls = tgtClsNum;

    const rows = document.querySelectorAll('.promote-student-row');
    if (rows.length === 0) { alert("No students."); return; }

    const decisions = [];
    for (const row of rows) {
        const sid = row.dataset.studentId;
        const status = row.dataset.status;
        if (status !== 'active') {
            decisions.push({ studentId: sid, status, action: status });
            continue;
        }
        const decision = row.querySelector(`input[name="decision_${sid}"]:checked`)?.value;
        if (!decision) { alert("No decision selected for a student."); return; }
        decisions.push({ studentId: sid, status: 'active', action: decision });
    }

    const ids = decisions.map(d => d.studentId);
    const { data: rowsData, error: fe } = await supabaseClient.from('StudentDataTable').select('*').in('id', ids);
    if (fe) { alert("Fetch error: " + fe.message); return; }
    const rowsById = {};
    rowsData.forEach(r => rowsById[r.id] = r);

    const { data: classes } = await supabaseClient.from('ClassTable').select('id, ClassName');
    const classNameOf = {};
    (classes || []).forEach(c => classNameOf[c.id] = c.ClassName);

    const total = decisions.length;
    if (!confirm(`Proceed? Total: ${total}`)) return;

    if (btn) { btn.textContent = "Promoting..."; btn.disabled = true; }
    const adminId = await getCurrentAdminId();
    const errors = [];

    for (const d of decisions) {
        const r = rowsById[d.studentId];
        if (!r) continue;

        let updatePayload;
        let logAction;

        if (d.action === 'promote') {
            updatePayload = {
                ClassID: tgtCls,
                EducationalYear: tgtYear,
                RollNo: null,
                MeritNo: null
            };
            logAction = 'promoted';
        } else if (d.action === 'stay') {
            updatePayload = {
                ClassID: r.ClassID,
                EducationalYear: tgtYear,
                RollNo: null,
                MeritNo: null
            };
            logAction = 'stayed';
        } else if (d.action === 'withheld') {
            updatePayload = null;
            logAction = 'withheld';
        } else {
            updatePayload = { Status: d.action };
            logAction = d.action;
        }

        if (updatePayload) {
            const { error: ue } = await supabaseClient
                .from('StudentDataTable').update(updatePayload).eq('id', r.id);
            if (ue) { errors.push(`${r.StudentName}: ${ue.message}`); continue; }
        }

        const logRow = {
            StudentID: r.id,
            StudentName: r.StudentName || '',
            RegdNo: r.RegdNo || '',
            FromClassID: r.ClassID,
            FromClassName: classNameOf[r.ClassID] || '',
            FromYear: r.EducationalYear,
            FromRollNo: r.RollNo,
            ToClassID: d.action === 'promote' ? tgtCls : r.ClassID,
            ToClassName: classNameOf[d.action === 'promote' ? tgtCls : r.ClassID] || '',
            ToYear: (d.action === 'promote' || d.action === 'stay') ? tgtYear : r.EducationalYear,
            ToRollNo: null,
            Action: logAction,
            PromotedBy: adminId
        };
        const { error: le } = await supabaseClient.from('PromotionHistoryTable').insert(logRow);
        if (le) console.warn("History log failed:", le.message);
    }

    if (btn) { btn.textContent = "Execute Promotion"; btn.disabled = false; }

    if (errors.length > 0) {
        alert("Some failed:\n" + errors.slice(0, 10).join("\n"));
    } else {
        alert("Promotion completed.");
    }

    await cleanupOldPromotionHistory();
    await loadPromoteClassDropdowns();
    await loadClassNameDropdown();
    await loadClassesInPhotoSelect();
    await loadClassesInDeleteSelect();
    await loadRollDecisionClassDropdowns();
    loadPromoteStudentList();
}

// ============================================================================
// ROLL DECISION SECTION
// ============================================================================
document.getElementById('RollDecisionContainer').insertAdjacentHTML('beforeend', `
    <div id="RollDecisionBox">
        <div id="RollDecisionHead">Assign Roll Numbers</div>

        <div id="RollDecisionTopRow">
            <div class="RollDropdownGroup">
                <label for="RollDecisionYearSelect">Year:</label>
                <select id="RollDecisionYearSelect"></select>
            </div>
            <div class="RollDropdownGroup">
                <label for="RollDecisionClassSelect">Class:</label>
                <select id="RollDecisionClassSelect"><option selected disabled>-- Select --</option></select>
            </div>
            <button id="btnLoadRollStudents" type="button" onclick="loadRollDecisionList()">Load Students</button>
        </div>

        <div id="RollSystemBox">
            <span>Roll System:</span>
            <label><input type="radio" name="rollSystemDecision" value="alpha" checked onchange="onRollSystemChange()"/> Alphabetical</label>
            <label><input type="radio" name="rollSystemDecision" value="merit" onchange="onRollSystemChange()"/> Merit-based</label>
        </div>

        <div id="RollDecisionListContainer"></div>

        <div id="RollDecisionActionBox">
            <button id="btnAssignRollNumbers" type="button" style="display:none;" onclick="assignRollNumbers()">Assign Roll Numbers</button>
        </div>

        <div id="RollExportActionBox" style="display:none;">
            <button id="btnExportRollJPG" type="button" onclick="exportRollList('jpg')">Save as JPG</button>
            <button id="btnExportRollXLSX" type="button" onclick="exportRollList('xlsx')">Save as XLSX</button>
        </div>

        <div id="RollExportPrintable" style="position:absolute; left:-99999px; top:0; background:#ffffff;"></div>
    </div>
`);

async function loadRollDecisionClassDropdowns() {
    const dd = document.getElementById('RollDecisionClassSelect');
    if (!dd) return;
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        dd.innerHTML = '<option value="" selected disabled>-- Select --</option>';
        classes.forEach(c => {
            const o = document.createElement('option');
            o.value = c.id; o.textContent = c.ClassName; dd.appendChild(o);
        });
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    populateFixedYearDropdown('RollDecisionYearSelect', DEFAULT_YEAR);
    loadRollDecisionClassDropdowns();
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolName', 'SchoolAddress']);
        if (error) throw error;
        (data || []).forEach(row => {
            if (row.Name === 'SchoolName')    window.schoolInfoCache.name    = row.Value || '';
            if (row.Name === 'SchoolAddress') window.schoolInfoCache.address = row.Value || '';
        });
    } catch (e) {
        console.warn("Failed to load school info cache:", e.message);
    }
});

window.onRollSystemChange = function() {
    const isMerit = document.querySelector('input[name="rollSystemDecision"]:checked')?.value === 'merit';
    document.querySelectorAll('.roll-merit-input').forEach(inp => {
        inp.disabled = !isMerit;
        inp.style.opacity = isMerit ? '1' : '0.4';
    });
};

async function loadRollDecisionList() {
    const year = parseInt(document.getElementById('RollDecisionYearSelect').value, 10);
    const classIdRaw = document.getElementById('RollDecisionClassSelect').value;
    const classIdNum = parseInt(classIdRaw, 10);
    const list = document.getElementById('RollDecisionListContainer');
    const btn = document.getElementById('btnAssignRollNumbers');
    const exportBox = document.getElementById('RollExportActionBox');
    if (!list) return;
    if (!Number.isFinite(classIdNum) || !Number.isFinite(year)) {
        alert("Select year and class."); return;
    }
    const classId = classIdNum;

    list.innerHTML = '<p class="roll-status-text">Loading...</p>';
    if (btn) btn.style.display = 'none';
    if (exportBox) exportBox.style.display = 'none';
    window.rollDecisionList = [];

    try {
        const { data: students, error } = await supabaseClient
            .from('StudentDataTable')
            .select('id, RollNo, StudentName, RegdNo, Contact, FatherName, MotherName, DOBBS, Status')
            .eq('ClassID', classId)
            .eq('EducationalYear', year)
            .eq('Status', 'active');
        if (error) throw error;
        if (!students || students.length === 0) {
            list.innerHTML = '<p class="roll-empty-text">No active students in this class/year.</p>';
            return;
        }

        const allHaveRoll = students.every(s => s.RollNo !== null && s.RollNo !== undefined && s.RollNo !== '');
        students.sort((a, b) => {
            if (allHaveRoll) return (parseInt(a.RollNo, 10) || 0) - (parseInt(b.RollNo, 10) || 0);
            const an = String(a.StudentName || '').toLowerCase();
            const bn = String(b.StudentName || '').toLowerCase();
            if (an < bn) return -1;
            if (an > bn) return 1;
            return String(a.RegdNo || '').localeCompare(String(b.RegdNo || ''));
        });
        window.rollDecisionList = students;

        renderRollDecisionTable(students);
        onRollSystemChange();
        if (btn) btn.style.display = 'block';
        if (exportBox) exportBox.style.display = 'flex';
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="roll-error-text">Failed.</p>';
    }
}

function renderRollDecisionTable(students) {
    const list = document.getElementById('RollDecisionListContainer');
    if (!list) return;
    let html = `
        <div class="roll-list-head">
            <div class="roll-col-current">Current R.N.</div>
            <div class="roll-col-name">Student Name</div>
            <div class="roll-col-merit">Merit No.</div>
        </div>`;
    students.forEach(st => {
        html += `
            <div class="roll-student-row" data-student-id="${st.id}">
                <div class="roll-col-current">${st.RollNo ?? '--'}</div>
                <div class="roll-col-name">${st.StudentName}</div>
                <div class="roll-col-merit">
                    <input type="number" class="roll-merit-input" min="1" placeholder="-" disabled />
                </div>
            </div>`;
    });
    list.innerHTML = html;
    onRollSystemChange();
}

function validateMerits(students, meritMode) {
    if (!meritMode) return { ok: true, case: 0, orderedStudents: null };

    const filled = [];
    const blank = [];
    for (const st of students) {
        const inp = document.querySelector(`.roll-student-row[data-student-id="${st.id}"] .roll-merit-input`);
        const raw = inp ? String(inp.value).trim() : '';
        if (raw === '') blank.push(st);
        else {
            const n = Number(raw);
            if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
                return { ok: false, reason: `Invalid merit "${raw}" for ${st.StudentName}. Merit must be a positive integer.` };
            }
            filled.push({ st, merit: n });
        }
    }

    if (filled.length === 0) return { ok: true, case: 1, orderedStudents: null };

    const seen = new Set();
    for (const f of filled) {
        if (seen.has(f.merit)) {
            return { ok: false, reason: `Duplicate merit number ${f.merit}.` };
        }
        seen.add(f.merit);
    }

    for (let i = 1; i <= filled.length; i++) {
        if (!seen.has(i)) {
            return { ok: false, reason: `Merit numbers must be exactly 1..${filled.length} with no gaps. Missing: ${i}.` };
        }
    }

    filled.sort((a, b) => a.merit - b.merit);

    blank.sort((a, b) => {
        const an = String(a.StudentName || '').toLowerCase();
        const bn = String(b.StudentName || '').toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return String(a.RegdNo || '').localeCompare(String(b.RegdNo || ''));
    });

    const ordered = [...filled.map(f => f.st), ...blank];
    const c = blank.length === 0 ? 2 : 3;
    return { ok: true, case: c, orderedStudents: ordered };
}

async function assignRollNumbers() {
    const year = parseInt(document.getElementById('RollDecisionYearSelect').value, 10);
    const classIdRaw = document.getElementById('RollDecisionClassSelect').value;
    const classIdNum = parseInt(classIdRaw, 10);
    const meritMode = document.querySelector('input[name="rollSystemDecision"]:checked')?.value === 'merit';
    const btn = document.getElementById('btnAssignRollNumbers');

    if (!Number.isFinite(classIdNum) || !Number.isFinite(year)) { alert("Select year and class."); return; }
    const classId = classIdNum;
    if (!window.rollDecisionList || window.rollDecisionList.length === 0) {
        alert("Load students first."); return;
    }

    const v = validateMerits(window.rollDecisionList, meritMode);
    if (!v.ok) {
        alert("Cannot assign roll numbers:\n\n" + v.reason);
        return;
    }

    let ordered;
    let modeUsed;

    if (!meritMode) {
        ordered = [...window.rollDecisionList].sort((a, b) => {
            const an = String(a.StudentName || '').toLowerCase();
            const bn = String(b.StudentName || '').toLowerCase();
            if (an < bn) return -1;
            if (an > bn) return 1;
            return String(a.RegdNo || '').localeCompare(String(b.RegdNo || ''));
        });
        modeUsed = 'alphabetical';
    } else if (v.case === 1) {
        if (!confirm("No merit numbers were entered. Assign roll numbers alphabetically?")) return;
        ordered = [...window.rollDecisionList].sort((a, b) => {
            const an = String(a.StudentName || '').toLowerCase();
            const bn = String(b.StudentName || '').toLowerCase();
            if (an < bn) return -1;
            if (an > bn) return 1;
            return String(a.RegdNo || '').localeCompare(String(b.RegdNo || ''));
        });
        modeUsed = 'alphabetical (merit-empty fallback)';
    } else if (v.case === 2) {
        ordered = v.orderedStudents;
        modeUsed = 'merit (all filled)';
    } else if (v.case === 3) {
        ordered = v.orderedStudents;
        modeUsed = 'merit (mixed)';
    } else {
        alert("Unexpected validation case."); return;
    }

    if (!confirm(`This will overwrite the current roll numbers for ${ordered.length} students.\nContinue?`)) return;

    const adminId = await getCurrentAdminId();
    if (btn) { btn.textContent = "Assigning..."; btn.disabled = true; }

    const errors = [];

    {
        const { error: clearErr } = await supabaseClient
            .from('StudentDataTable')
            .update({ RollNo: null })
            .eq('ClassID', classId)
            .eq('EducationalYear', year)
            .eq('Status', 'active');
        if (clearErr) {
            if (btn) { btn.textContent = "Assign Roll Numbers"; btn.disabled = false; }
            alert("Failed to clear existing roll numbers: " + clearErr.message);
            return;
        }
    }

    const { data: cls } = await supabaseClient
        .from('ClassTable').select('ClassName').eq('id', classId).single();
    const classNameStr = cls?.ClassName || '';

    for (let i = 0; i < ordered.length; i++) {
        const st = ordered[i];
        const newRoll = i + 1;
        const { error: ue } = await supabaseClient
            .from('StudentDataTable').update({ RollNo: newRoll }).eq('id', st.id);
        if (ue) { errors.push(`${st.StudentName}: ${ue.message}`); continue; }

        const logRow = {
            StudentID: st.id,
            StudentName: st.StudentName || '',
            RegdNo: st.RegdNo || '',
            FromClassID: classId,
            FromClassName: classNameStr,
            FromYear: year,
            FromRollNo: st.RollNo,
            ToClassID: classId,
            ToClassName: classNameStr,
            ToYear: year,
            ToRollNo: newRoll,
            Action: 'roll_assigned',
            PromotedBy: adminId,
            Notes: modeUsed
        };
        const { error: le } = await supabaseClient.from('PromotionHistoryTable').insert(logRow);
        if (le) console.warn("History log failed:", le.message);
    }

    if (btn) { btn.textContent = "Assign Roll Numbers"; btn.disabled = false; }

    if (errors.length > 0) {
        alert("Some failed:\n" + errors.slice(0, 10).join("\n"));
    } else {
        alert(`Roll numbers assigned (${modeUsed}).`);
    }

    await cleanupOldPromotionHistory();
    await loadRollDecisionList();
}

// ============================================================================
// ROLL LIST EXPORT (JPG / XLSX)
// ============================================================================
async function exportRollList(format) {
    const year = parseInt(document.getElementById('RollDecisionYearSelect').value, 10);
    const classIdRaw = document.getElementById('RollDecisionClassSelect').value;
    const classIdNum = parseInt(classIdRaw, 10);
    if (!Number.isFinite(classIdNum) || !Number.isFinite(year)) { alert("Select year and class first."); return; }
    const classId = classIdNum;
    if (!window.rollDecisionList || window.rollDecisionList.length === 0) {
        alert("Load students first."); return;
    }

    let classNameStr = '';
    try {
        const { data: cls } = await supabaseClient
            .from('ClassTable').select('ClassName').eq('id', classId).single();
        classNameStr = cls?.ClassName || '';
    } catch (_) { /* ignore */ }

    const rows = [...window.rollDecisionList].sort((a, b) => {
        const ar = a.RollNo === null || a.RollNo === undefined ? Infinity : (parseInt(a.RollNo, 10) || Infinity);
        const br = b.RollNo === null || b.RollNo === undefined ? Infinity : (parseInt(b.RollNo, 10) || Infinity);
        return ar - br;
    });

    const schoolName    = window.schoolInfoCache.name    || '';
    const schoolAddress = window.schoolInfoCache.address || '';
    const baseName = `RollList_${classNameStr || 'Class'}_${year}`;

    if (format === 'xlsx') {
        const aoa = [];
        aoa.push([schoolName]);
        aoa.push([schoolAddress]);
        aoa.push([`Class: ${classNameStr}`, '', '', '', '', `Educational Year: ${year}`]);
        aoa.push([]);
        aoa.push(['Roll No', 'Student Name', 'Contact', 'Father Name', 'Mother Name', 'DOB (BS)']);
        rows.forEach(st => {
            aoa.push([
                st.RollNo ?? '',
                st.StudentName || '',
                st.Contact || '',
                st.FatherName || '',
                st.MotherName || '',
                st.DOBBS || ''
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = [
            { wch: 8 }, { wch: 26 }, { wch: 18 }, { wch: 26 }, { wch: 26 }, { wch: 14 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Roll List');
        XLSX.writeFile(wb, `${baseName}.xlsx`);
        return;
    }

    if (format === 'jpg') {
        const printBox = document.getElementById('RollExportPrintable');
        if (!printBox) { alert("Print area not found."); return; }

        const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        })[c]);

        let tableHTML = `
            <div style="background:#ffffff; padding:24px; font-family: Arial, sans-serif; color:#000;">
                <div style="text-align:center; margin-bottom:14px;">
                    <div style="font-size:22px; font-weight:bold;">${esc(schoolName)}</div>
                    <div style="font-size:14px; margin-top:4px;">${esc(schoolAddress)}</div>
                    <div style="font-size:14px; margin-top:8px;">
                        <strong>Class:</strong> ${esc(classNameStr)}
                        &nbsp;&nbsp;&nbsp;
                        <strong>Educational Year:</strong> ${esc(year)}
                    </div>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#333; color:#fff;">
                            <th style="border:1px solid #000; padding:6px; text-align:center;">Roll No</th>
                            <th style="border:1px solid #000; padding:6px; text-align:left;">Student Name</th>
                            <th style="border:1px solid #000; padding:6px; text-align:left;">Contact</th>
                            <th style="border:1px solid #000; padding:6px; text-align:left;">Father Name</th>
                            <th style="border:1px solid #000; padding:6px; text-align:left;">Mother Name</th>
                            <th style="border:1px solid #000; padding:6px; text-align:center;">DOB (BS)</th>
                        </tr>
                    </thead>
                    <tbody>`;
        rows.forEach((st, i) => {
            const bg = i % 2 === 0 ? '#ffffff' : '#f4f4f4';
            tableHTML += `
                        <tr style="background:${bg};">
                            <td style="border:1px solid #000; padding:6px; text-align:center;">${esc(st.RollNo ?? '')}</td>
                            <td style="border:1px solid #000; padding:6px;">${esc(st.StudentName || '')}</td>
                            <td style="border:1px solid #000; padding:6px;">${esc(st.Contact || '')}</td>
                            <td style="border:1px solid #000; padding:6px;">${esc(st.FatherName || '')}</td>
                            <td style="border:1px solid #000; padding:6px;">${esc(st.MotherName || '')}</td>
                            <td style="border:1px solid #000; padding:6px; text-align:center;">${esc(st.DOBBS || '')}</td>
                        </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        printBox.innerHTML = tableHTML;

        await new Promise(r => setTimeout(r, 50));

        try {
            const canvas = await html2canvas(printBox, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${baseName}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            alert("JPG export failed: " + e.message);
        } finally {
            printBox.innerHTML = '';
        }
        return;
    }
}

// ============================================================================
// INITIAL HIDDEN STATE
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('AddEditStudentContainer').style.display = 'none';
    document.getElementById('PromoteStudentContainer').style.display = 'none';
    document.getElementById('RollDecisionContainer').style.display = 'none';
});