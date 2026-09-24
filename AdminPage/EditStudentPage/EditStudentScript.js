if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";
// -------------------- PROTECTION FROM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
    if (error || !session) {
        showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("../LoginPage/LoginIndex.html");
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
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

let existingClassIds = {};

    //Add and Edit Student data
    const StudentDataHTML = `
        <div id="StudentDataBox">
            <div id="AddEditStudentHead">Add/Edit Students</div>
            <div id="StudentDropdownBox">
                <div id="StudentDataDiv1">Class:</div>
                <select id="StudentClassSelectionSelect"></select>
                <div id="StudentDataDiv2">Number of Students:</div>
                <input type="number" id="studentCountInput" value="0" min="0" max="99" oninput="validateInput(this)"/>
            </div>
            <button id="btnLoadClassStudents" type="button" onClick="loadClassStudents()">Load Class</button>
            <div id="ClassStudentDataTableBox"></div>
            <button id="btnSaveClassStudentData" type="button" style="display: none;" onClick="saveClassStudentData()">Save Class Data</button>
        </div>
    `;
    StudentEditContainer.insertAdjacentHTML('beforeend', StudentDataHTML);

function toggleSaveButton(shouldShow) {
    const saveBtn = document.getElementById('btnSaveClassStudentData');
    if (saveBtn) {
        saveBtn.style.display = shouldShow ? 'inline-block' : 'none';
    }
}

async function loadClassNameDropdown() {
    const dropdown = document.getElementById('StudentClassSelectionSelect');    
    if (!dropdown) return;
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable')
            .select('id, ClassName') 
            .order('created_at', { ascending: true });
        if (error) throw error;
        dropdown.innerHTML = '<option value="" selected disabled>-- Select a Class --</option>';
        classes.forEach(singleClass => {
            const option = document.createElement('option');
            option.value = singleClass.id; 
            option.textContent = singleClass.ClassName;
            dropdown.appendChild(option);
        });
        console.log("Dropdown loaded sequentially.");
    } catch (error) {
        console.error("Error fetching classes for dropdown:", error.message);
    }
}
document.addEventListener('DOMContentLoaded', loadClassNameDropdown);

// Global grid instances
window.excelGrid = null;
window.deletedStudentIds = []; 
const EXCEL_COLUMNS = [
    { type: 'hidden', name: 'id' }, 
    { type: 'hidden', name: 'ClassID' },
    { type: 'text', title: 'Roll. No.', name: 'RollNo', align: 'center', width: 80 },
    { type: 'text', title: 'Regd. No.', name: 'RegdNo', align: 'left', width: 150 },
    { type: 'text', title: 'Symb. No.', name: 'SymbNo', align: 'left', width: 150 },
    { type: 'text', title: 'Student\'s Name', name: 'StudentName', align: 'left', width: 250 },
    { type: 'text', title: 'Permanent Address', name: 'StudentAddress', align: 'left', width: 350 },
    {type: 'text', title: 'Gender', name: 'StudentGender', align: 'left', width: 100 },
    { type: 'text', title: 'DOB BS', name: 'DOBBS', align: 'left', width: 150 },
    { type: 'text', title: 'DOB AD', name: 'DOBAD', align: 'left', width: 150 },
    { type: 'text', title: 'Father\'s Name', name: 'FatherName', align: 'left', width: 250 },
    { type: 'text', title: 'Mother\'s Name', name: 'MotherName', align: 'left', width: 250 },
    { type: 'text', title: 'Contact', name: 'Contact', align: 'left', width: 200 },
    { type: 'text', title: 'Email', name: 'Email', align: 'left', width: 250 },
    { type: 'text', title: 'Stream', name: 'Stream', align: 'left', width: 120 },
    { type: 'text', title: 'Race', name: 'Race', align: 'left', width: 200 },
    { type: 'text', title: 'House', name: 'House', align: 'left', width: 250 },
    { type: 'text', title: 'Subjects', name: 'Subjects', align: 'left', width: 400 }
];

// 1. Triggered on Dropdown change
const classSelectionSelect = document.getElementById('StudentClassSelectionSelect');
if (classSelectionSelect) {
    classSelectionSelect.addEventListener('change', async function() {
        const classId = this.value;
        if (!classId) return;

        const sheetConstructor = (typeof jexcel !== 'undefined') ? jexcel : jspreadsheet;

        try {
            const { data: students, error } = await supabaseClient
                .from('StudentDataTable')
                .select('*')
                .eq('ClassID', classId)
                .order('RollNo', { ascending: true });

            if (error) throw error;

            if (students && students.length > 0) {
                const formattedStudents = students.map(st => ({
                    // Mapping ONLY the exact properties configured in your EXCEL_COLUMNS array
                    id: st.id,
                    ClassID: st.ClassID || classId,
                    RollNo: parseInt(st.RollNo, 10) || 0,
                    RegdNo: st.RegdNo || '',
                    SymbNo: st.SymbNo || '', 
                    StudentName: st.StudentName || '',
                    StudentAddress: st.StudentAddress || '',
                    StudentGender: st.StudentGender || '',
                    DOBBS: st.DOBBS || '',
                    DOBAD: st.DOBAD || '',
                    FatherName: st.FatherName || '',
                    MotherName: st.MotherName || '',
                    Contact: st.Contact || '',
                    Email: st.Email || '',
                    Stream: st.Stream || '',
                    Race: st.Race || '',
                    House: st.House || '',
                    Subjects: st.Subjects || ''
                })).sort((a,b) => a.RollNo - b.RollNo);

                document.getElementById('studentCountInput').value = formattedStudents.length;
                initializeExcelGrid(formattedStudents);
            } else {
                document.getElementById('studentCountInput').value = 0;
                if(window.excelGrid && sheetConstructor) sheetConstructor.destroy(document.getElementById('ClassStudentDataTableBox'));
                document.getElementById('ClassStudentDataTableBox').innerHTML = "<p style='padding:10px;'>No data saved yet. Choose a student count and click 'Load Class'.</p>";
                toggleSaveButton(false);
            }
        } catch (err) {
            console.error("Fetch error:", err.message);
        }
    });
}

// 2. Triggered on "Load Class" Button click
function loadClassStudents() {
    const classId = document.getElementById('StudentClassSelectionSelect').value;
    const requestedCount = parseInt(document.getElementById('studentCountInput').value) || 0;
    if (!classId) {
        alert("Please select a class first!");
        return;
    }

    let currentRows = [];
    if (window.excelGrid) {
        currentRows = window.excelGrid.getJson();
    }

    const finalPayload = [...currentRows];

    if (requestedCount > finalPayload.length) {
        const slotsNeeded = requestedCount - finalPayload.length;
        
        for (let i = 1; i <= slotsNeeded; i++) {
            const nextRollNo = finalPayload.length + 1; 
            
            finalPayload.push({ 
                id: '', 
                RollNo: nextRollNo,
                RegdNo: '',
                SymbNo: '',
                StudentName: '',
                StudentAddress: '',
                StudentGender: '',
                DOBBS: '',
                DOBAD: '',
                FatherName: '',
                MotherName: '',
                Contact: '',
                Email: '',
                Stream: '',
                Race: '',
                House: '',
                Subjects: ''
            });
        }
    } else if (requestedCount < finalPayload.length) {
        finalPayload.length = requestedCount;
    }
    
    initializeExcelGrid(finalPayload);
    toggleSaveButton(true); // Flag additions/trims as user mutations
}

function initializeExcelGrid(dataArray) {
    const container = document.getElementById('ClassStudentDataTableBox');
    if (!container) return;
    container.innerHTML = ''; 

    const sheetConstructor = (typeof jexcel !== 'undefined') ? jexcel : jspreadsheet;
    if (!sheetConstructor) return;

    const strictColumnCount = EXCEL_COLUMNS.length;
    window.deletedStudentIds = [];
    
    toggleSaveButton(false);

    window.excelGrid = sheetConstructor(container, {
        data: dataArray,
        columns: EXCEL_COLUMNS,
        allowInsertColumn: false,
        allowDeleteColumn: false,
        columnSorting: false,
        copyCompatibility: true,  
        allowRenameColumn: false,
        minDimensions: [strictColumnCount, 0], 
        tableOverflow: true,      
        tableWidth: '100%',       
        tableHeight: '450px', 

        onchange: function(instance, cell, x, y, value) {
            toggleSaveButton(true);

            const colBS = 7; // Assuming 8th column is DOB BS (0-indexed)
            const targetColumnLetter = 'I'; // Targets Column I for DOB AD

            if (parseInt(x) === colBS) {
                const bsDate = String(value).trim();
                const cellCoordinate = targetColumnLetter + (parseInt(y) + 1);

                if (!bsDate) {
                    if (window.excelGrid) window.excelGrid.setValue(cellCoordinate, '');
                    return;
                }

                try {
                    const convertedAD = BS2AD_YMD(bsDate); 
                    
                    if (window.excelGrid) {
                        window.excelGrid.setValue(cellCoordinate, convertedAD);
                    }
                } catch (error) {
                    console.error("Date conversion failed: ", error.message);
                    if (window.excelGrid) {
                        window.excelGrid.setValue(cellCoordinate, 'Invalid BS Date');
                    }
                }
            }
        },

        onselection: function(instance, x1, y1, x2, y2) {
            if (instance && typeof instance.updateScroll === 'function') {
                instance.updateScroll();
            }
        },

        onbeforedeleterow: function(instance, rowNumber, numOfRows) {
            return true;
        }
    });
}

async function saveClassStudentData() {
    const classId = document.getElementById('StudentClassSelectionSelect').value;
    if (!classId || !window.excelGrid) {
        alert("Please load and populate a valid class table before saving.");
        return;
    }
    
    // Explicitly grab data from the grid instance
    const gridData = window.excelGrid.getJson(); 
    const newStudentsPayload = [];
    const existingStudentsPayload = [];

    gridData.forEach(row => {
        // Safe check for name field regardless of property casing variations
        const studentName = row.StudentName || row.studentname;
        
        if (studentName && studentName.trim() !== "") {
            // FORCE the active classId from the dropdown to ensure it never gets nullified
            const studentRow = {
                ClassID: classId, 
                RollNo: parseInt(row.RollNo || row.rollno, 10) || 0, 
                RegdNo: row.RegdNo || row.regdno || '',
                SymbNo: row.SymbNo || row.symbno || '', 
                StudentName: studentName.trim(),
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

            const rawId = row.id;
            if (
                rawId !== undefined && 
                rawId !== null && 
                String(rawId).trim() !== "" && 
                String(rawId).trim() !== "null" && 
                String(rawId).trim() !== "undefined"
            ) {
                studentRow.id = rawId;
                existingStudentsPayload.push(studentRow);
            } else {
                newStudentsPayload.push(studentRow);
            }
        }
    });

    try {
        if (window.deletedStudentIds && window.deletedStudentIds.length > 0) {
            const { error: deleteError } = await supabaseClient
                .from('StudentDataTable')
                .delete()
                .in('id', window.deletedStudentIds);

            if (deleteError) throw deleteError;
        }

        // Upserting will now safely contain the hardcoded string from dropdown classId selection
        if (existingStudentsPayload.length > 0) {
            const { error: updateError } = await supabaseClient
                .from('StudentDataTable')
                .upsert(existingStudentsPayload, { onConflict: 'id' });

            if (updateError) throw updateError;
        }

        if (newStudentsPayload.length > 0) {
            const { error: insertError } = await supabaseClient
                .from('StudentDataTable')
                .insert(newStudentsPayload);

            if (insertError) throw insertError;
        }

        alert("All changes, including corrections, saved successfully!");
        window.deletedStudentIds = [];
        toggleSaveButton(false);

        document.getElementById('StudentClassSelectionSelect').dispatchEvent(new Event('change'));

    } catch (err) {
        console.error("Supabase Sync Error:", err.message);
        alert("Failed to sync sheet with database: " + err.message);
    }
}

window.validateInput = function(input) {
    let value = parseInt(input.value, 10);
    if (isNaN(value)) {
        input.value = 0;
        return;
    }
    if (value > 99) input.value = 99;
    if (value < 0) input.value = 0;
};

window.adjustStudents = function(amount) {
    const studentInput = document.getElementById('studentCountInput');
    if (!studentInput) return;
    let currentValue = parseInt(studentInput.value, 10) || 0;
    let newValue = currentValue + amount;

    if (newValue >= 0 && newValue <= 99) {
        studentInput.value = newValue;
    }
};

// -------------------- ADD AND EDIT STUDENTS PHOTOS --------------------
const StudentPhotoEditBox = document.getElementById('StudentPhotoEditBox');
if (StudentPhotoEditBox) {
    const StudentPhotoEditHTML = `
        <div id="StudentPhotoDropdownBox">
            <div>Select Class:</div>
            <select id="StudentPhotoClassSelect">
                <option selected disabled>Select Class</option>          
            </select>
        </div>        
        <div id="StudentPhotoListContainer"></div>        
        <button id="btnSaveStudentPhoto" type="button" style="display: none;" onClick="saveAllSelectedPhotos()">Save All Photos</button>
    `;
    StudentPhotoEditBox.insertAdjacentHTML('beforeend', StudentPhotoEditHTML);
}

window.pendingStudentPhotos = {};

// HELPER: Extracts the clean filename from a complete Cloudinary absolute URL path
function getFileNameFromUrl(url) {
    if (!url) return "No file chosen";
    try {
        const decodedUrl = decodeURIComponent(url);
        return decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
    } catch (e) {
        return "View Attachment";
    }
}

async function loadClassesInPhotoSelect() {
    const dropdown = document.getElementById('StudentPhotoClassSelect');    
    if (!dropdown) return;
    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable')
            .select('id, ClassName')
            .order('created_at', { ascending: true });
        if (error) throw error;
        dropdown.innerHTML = '<option selected disabled>Select Class</option>';
        classes.forEach(singleClass => {
            const option = document.createElement('option');
            option.value = singleClass.id;             
            option.textContent = singleClass.ClassName; 
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading classes into photo dropdown:", error.message);
    }
}
document.addEventListener('DOMContentLoaded', loadClassesInPhotoSelect);
const photoClassSelect = document.getElementById('StudentPhotoClassSelect');
if (photoClassSelect) {
    photoClassSelect.addEventListener('change', async function() {
        const classId = this.value;
        const listContainer = document.getElementById('StudentPhotoListContainer');
        const mainSaveBtn = document.getElementById('btnSaveStudentPhoto');
        if (!listContainer) return;        
        window.pendingStudentPhotos = {};
        if (mainSaveBtn) mainSaveBtn.style.display = 'none';
        listContainer.innerHTML = '<p style="color: gray;">Loading student roster...</p>';        
        try {
            const { data: students, error } = await supabaseClient
                .from('StudentDataTable')
                .select('id, RollNo, StudentName, PhotoUrl')
                .eq('ClassID', classId);
            if (error) throw error;
            if (!students || students.length === 0) {
                listContainer.innerHTML = '<p style="color: #ff3333; padding: 10px 0;">No student data found for this class yet.</p>';
                return;
            }
            if (mainSaveBtn) mainSaveBtn.style.display = 'inline-block';
            students.sort((a, b) => (parseInt(a.RollNo, 10) || 0) - (parseInt(b.RollNo, 10) || 0));
            
            let rosterHTML = `
                <div id="StudentPhotoListHead">
                    <div id="StudentPhotoListHead_1">R.N.</div>
                    <div id="StudentPhotoListHead_2">Student Name</div>
                    <div id="StudentPhotoListHead_4">Action</div>
                    <div id="StudentPhotoListHead_3">Current Photo</div>                    
                </div>
            `;
            
            students.forEach(student => {
                // FIXED: Compute dynamic initial file display text using our helper function
                const initialDisplayName = student.PhotoUrl ? getFileNameFromUrl(student.PhotoUrl) : "No file chosen";
                const isSavedStyle = student.PhotoUrl ? "color: green; font-weight: 500;" : "color: gray;";

                rosterHTML += `
                    <div class="SingleStudentPhotoBoxes">
                        <div class="SingleStudentRoll">${student.RollNo}</div>
                        <div class="SingleStudentName">${student.StudentName}</div>
                        <input type="file" id="photo_input_${student.id}" accept="image/*" style="display: none;" onChange="handleStudentPhotoSelection(this, '${student.id}')" />                            
                        <button class="SingleStudentSelectPhoto" type="button" onclick="document.getElementById('photo_input_${student.id}').click()">Choose Photo</button>                            
                        <div class="SingleStudentPhotoName" id="file_name_${student.id}" style="${isSavedStyle}">${initialDisplayName}</div>
                    </div>
                `;
            });
            listContainer.innerHTML = rosterHTML;
        } catch (err) {
            console.error("Error building student photo list:", err.message);
            listContainer.innerHTML = '<p style="color: red;">Failed to load students. Please try again.</p>';
        }
    });
}

window.handleStudentPhotoSelection = function(inputElement, studentId) {
    const file = inputElement.files[0];
    const nameDisplayDiv = document.getElementById(`file_name_${studentId}`);    
    if (!file) {
        if (nameDisplayDiv) {
            nameDisplayDiv.innerText = "No file chosen";
            nameDisplayDiv.style.color = "gray";
        }
        delete window.pendingStudentPhotos[studentId];
        return;
    }    
    if (nameDisplayDiv) {
        nameDisplayDiv.innerText = file.name;
        nameDisplayDiv.style.color = "#0066cc"; // Turn blue to indicate a pending modification queue
    }    
    window.pendingStudentPhotos[studentId] = file;
};

async function saveAllSelectedPhotos() {
    const pendingIds = Object.keys(window.pendingStudentPhotos);
    if (pendingIds.length === 0) {
        alert("Please choose at least one new student photo to upload before saving.");
        return;
    }
    const mainSaveBtn = document.getElementById('btnSaveStudentPhoto');
    if (mainSaveBtn) {
        mainSaveBtn.textContent = "Uploading to Cloudinary...";
        mainSaveBtn.disabled = true;
    }
    let successCount = 0;
    for (let id of pendingIds) {
        const fileToUpload = window.pendingStudentPhotos[id];
        const nameDisplayDiv = document.getElementById(`file_name_${id}`);        
        if (nameDisplayDiv) nameDisplayDiv.innerText = "Uploading...";
        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('upload_preset', 'StudentPhotoSelectPreset');
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error("Cloudinary file transmission failure.");
            const uploadResult = await response.json();
            const finalizedSecureUrl = uploadResult.secure_url;
            const { error: supabaseError } = await supabaseClient
                .from('StudentDataTable')
                .update({ PhotoUrl: finalizedSecureUrl })
                .eq('id', id);
            if (supabaseError) throw supabaseError;
            
            if (nameDisplayDiv) {
                // FIXED: Update dynamically to show the newly saved Cloudinary resource path name
                nameDisplayDiv.innerText = getFileNameFromUrl(finalizedSecureUrl);
                nameDisplayDiv.style.color = "green";
            }
            successCount++;
        } catch (error) {
            console.error(`Upload lifecycle failure for ID [${id}]:`, error.message);
            if (nameDisplayDiv) {
                nameDisplayDiv.innerText = "❌ Upload Failed";
                nameDisplayDiv.style.color = "red";
            }
        }
    }
    alert(`Photo processing complete. Successfully saved ${successCount} out of ${pendingIds.length} records!`);    
    if (mainSaveBtn) {
        mainSaveBtn.textContent = "Save All Photos";
        mainSaveBtn.disabled = false;
    }
    window.pendingStudentPhotos = {};
    document.getElementById('StudentPhotoClassSelect').dispatchEvent(new Event('change'));
}

// -------------------- DELETE WHOLE CLASS MODULE --------------------
const DeleteClassDataBox = document.getElementById('DeleteClassDataBox');

if (DeleteClassDataBox) {
    const DeleteClassStructureHTML = `
        <div class="delete-dropdown-wrapper">
            <label for="DeleteClassSelect">Select Class to Erase:</label>
            <select id="DeleteClassSelect">
                <option selected disabled>-- Select Class --</option>          
            </select>
        </div>        
        <div id="DeleteClassRosterBox" class="delete-roster-container"></div>        
        <div class="delete-action-wrapper">
            <button id="btnDeleteWholeClass" type="button" style="display: none;" onClick="executeWholeClassDeletion()">
                Permanently Delete Class Data
            </button>
        </div>
    `;
    DeleteClassDataBox.innerHTML = DeleteClassStructureHTML;

    // Handle Dropdown Change and Conditional Visibility Checklist
    const deleteClassSelectElement = document.getElementById('DeleteClassSelect');
    if (deleteClassSelectElement) {
        deleteClassSelectElement.addEventListener('change', async function() {
            const classId = this.value;
            const rosterBox = document.getElementById('DeleteClassRosterBox');
            const deleteButton = document.getElementById('btnDeleteWholeClass');            
            if (!rosterBox || !deleteButton) return;
            deleteButton.style.display = 'none';
            rosterBox.innerHTML = '<p class="roster-status-text">Loading class roster...</p>';
            if (!classId) return;
            try {
                // Fetch student names for the chosen class
                const { data: students, error } = await supabaseClient
                    .from('StudentDataTable')
                    .select('RollNo, StudentName')
                    .eq('ClassID', classId);
                if (error) throw error;
                if (!students || students.length === 0) {
                    rosterBox.innerHTML = '<p class="roster-empty-text">This class has no students. Nothing to delete.</p>';
                    return;
                }
                students.sort((a, b) => (parseInt(a.RollNo, 10) || 0) - (parseInt(b.RollNo, 10) || 0));
                let rosterHTML = `<div class="roster-title">Students to be deleted (${students.length}):</div><ul class="roster-list">`;
                students.forEach(st => {
                    rosterHTML += `<li><strong>R.N. ${st.RollNo}:</strong> ${st.StudentName}</li>`;
                });
                rosterHTML += '</ul>';                
                rosterBox.innerHTML = rosterHTML;                
                deleteButton.style.display = 'block';
            } catch (err) {
                console.error("Error loading verification roster:", err.message);
                rosterBox.innerHTML = '<p class="roster-error-text">Failed to check student roster.</p>';
            }
        });
    }
}

// Helper to isolate raw Cloudinary asset public IDs out of complete URLs
function getPublicIdFromUrl(url) {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const fileWithExtension = parts[parts.length - 1]; 
        const publicId = fileWithExtension.split('.')[0];  
        return publicId;
    } catch (e) {
        return null;
    }
}

// Populate the Deletion Dropdown Menu dynamically
async function loadClassesInDeleteSelect() {
    const dropdown = document.getElementById('DeleteClassSelect');    
    if (!dropdown) return;

    try {
        const { data: classes, error } = await supabaseClient
            .from('ClassTable')
            .select('id, ClassName')
            .order('created_at', { ascending: true });

        if (error) throw error;

        dropdown.innerHTML = '<option selected disabled>-- Select Class --</option>';
        classes.forEach(singleClass => {
            const option = document.createElement('option');
            option.value = singleClass.id;             
            option.textContent = singleClass.ClassName; 
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error populating deletion dropdown:", error.message);
    }
}
document.addEventListener('DOMContentLoaded', loadClassesInDeleteSelect);

// Core Execution Orchestrator
async function executeWholeClassDeletion() {
    const classId = document.getElementById('DeleteClassSelect').value;
    const deleteButton = document.getElementById('btnDeleteWholeClass');
    const rosterBox = document.getElementById('DeleteClassRosterBox');
    
    if (!classId) {
        alert("Please select a valid class target first.");
        return;
    }

    const userConfirmed = confirm(
        "⚠️ CRITICAL WARNING!\n\nAre you absolutely sure you want to delete this entire class?\n\nThis will permanently wipe all student text records from Supabase and purge all associated profile photos from Cloudinary via 'delete-student-photo'. This action cannot be undone."
    );
    
    if (!userConfirmed) return;

    try {
        if (deleteButton) {
            deleteButton.textContent = "Processing Purge Cleanups...";
            deleteButton.disabled = true;
        }

        // Fetch current student records to extract Cloudinary files
        const { data: students, error: fetchError } = await supabaseClient
            .from('StudentDataTable')
            .select('PhotoUrl')
            .eq('ClassID', classId);

        if (fetchError) throw fetchError;

        const collectedPublicIds = [];
        if (students && students.length > 0) {
            students.forEach(st => {
                if (st.PhotoUrl) {
                    const pid = getPublicIdFromUrl(st.PhotoUrl);
                    if (pid) collectedPublicIds.push(pid);
                }
            });
        }

        // Invoke array-optimized Edge Function
        if (collectedPublicIds.length > 0) {
            const { data: edgeData, error: edgeError } = await supabaseClient.functions.invoke(
                'delete-student-photo',
                {
                    body: { publicIds: collectedPublicIds }
                }
            );
            if (edgeError) {
                throw new Error(`Edge Function Asset Purge Rejected: ${edgeError.message}`);
            }
        }
        const { error: databaseError } = await supabaseClient
            .from('StudentDataTable')
            .delete()
            .eq('ClassID', classId);
        if (databaseError) throw databaseError;
        alert("Class wiped successfully! Both remote assets and database records have been scrubbed.");
        if (deleteButton) deleteButton.style.display = 'none';
        if (rosterBox) rosterBox.innerHTML = '';        
        await loadClassesInDeleteSelect(); 
        if (typeof loadClassNameDropdown === "function") await loadClassNameDropdown();
        if (typeof loadClassesInPhotoSelect === "function") await loadClassesInPhotoSelect();

    } catch (err) {
        console.error("Transactional Purge Error Lifecycle Failure:", err.message);
        alert("Failed to complete full structural erasure: " + err.message);
    } finally {
        if (deleteButton) {
            deleteButton.textContent = "Permanently Delete Class Data";
            deleteButton.disabled = false;
        }
    }
}