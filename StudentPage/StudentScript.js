let allRawStudents = [];       
let filteredStudentsList = []; 
let classIdToNameMap = {};

const GRID_SCHEMA = [
    { type: 'text', title: 'R.No.', name: 'RollNo', align: 'center', width: 70 },
    { type: 'text', title: 'Regd. No.', name: 'RegdNo', align: 'left', width: 150 },
    { type: 'text', title: 'Symb. No.', name: 'SymbNo', align: 'left', width: 150 },
    { type: 'text', title: 'Student Name', name: 'StudentName', align: 'left', width: 250 },
    { type: 'text', title: 'Gender', name: 'StudentGender', align: 'left', width: 80 },
    { type: 'text', title: 'Permanent Address', name: 'StudentAddress', align: 'left', width: 350 },
    { type: 'text', title: 'DOB BS', name: 'DOBBS', align: 'left', width: 150 },
    { type: 'text', title: 'DOB AD', name: 'DOBAD', align: 'left', width: 150 },
    { type: 'text', title: 'Father Name', name: 'FatherName', align: 'left', width: 250 },
    { type: 'text', title: 'Mother Name', name: 'MotherName', align: 'left', width: 250 },
    { type: 'text', title: 'Contact', name: 'Contact', align: 'left', width: 200 },
    { type: 'text', title: 'Email', name: 'Email', align: 'left', width: 250 },
    { type: 'text', title: 'Stream', name: 'Stream', align: 'left', width: 100 },
    { type: 'text', title: 'Race', name: 'Race', align: 'left', width: 150 },
    { type: 'text', title: 'House', name: 'House', align: 'left', width: 200 },
    { type: 'text', title: 'Subjects', name: 'Subjects', align: 'left', width: 400 }
];

// -------------------- PAGE INITIALIZATION --------------------
document.addEventListener('DOMContentLoaded', async () => {
    const dataBox = document.getElementById('StudentDataBox');
    dataBox.innerHTML = "<p style='padding:25px; font-style:italic;'>Loading student metrics environment...</p>";

    try {
        const { data: meta } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolName', 'SchoolAddress', 'SchoolLogo']);
        
        if (meta) {
            meta.forEach(item => {
                if (item.Name === 'SchoolName') document.getElementById('SchoolNameLabel').textContent = item.Value;
                if (item.Name === 'SchoolAddress') document.getElementById('SchoolAddressLabel').textContent = item.Value;
                if (item.Name === 'SchoolLogo' && item.Value) {
                    document.getElementById('dynamicFavicon').href = item.Value;
                    document.querySelector('#LogoBox img').src = item.Value;
                }
            });
        }
        const { data: classes } = await supabaseClient
            .from('ClassTable')
            .select('id, ClassName')
            .order('SortOrder', { ascending: true });

        if (classes) {
            classes.forEach(c => {
                classIdToNameMap[c.id] = c.ClassName;
            });
        }
        const { data: students, error } = await supabaseClient
            .from('StudentDataTable')
            .select('*')
            .order('RollNo', { ascending: true });

        if (error) throw error;
        allRawStudents = students || [];

        if (allRawStudents.length === 0) {
            dataBox.innerHTML = "<p style='padding:20px;'>No student records found in the database system.</p>";
            return;
        }
        
        buildPanelMultiSelects(classes);
        
        filteredStudentsList = [...allRawStudents];
        renderDataGrid();
        
        document.getElementById('ActionBarBox').style.display = 'block';
    } catch (err) {
        dataBox.innerHTML = `<p style='padding:20px; color:red;'>Initialization Error: ${err.message}</p>`;
    }
});

// -------------------- NATIVE EXPLICIT FILTER RENDERER --------------------
function buildPanelMultiSelects(classesData) {
    const filterMappings = {
        'ClassID': 'FilterClassDropdown',
        'Stream': 'FilterStreamDropdown',
        'House': 'FilterHouseDropdown',
        'Race': 'FilterRaceDropdown',
        'StudentGender': 'FilterGenderDropdown'
    };

    const triggerFilterChangedState = () => {
        document.getElementById('FilterActionContainer').style.display = 'flex';
    };

    Object.keys(filterMappings).forEach(key => {
        const containerEl = document.getElementById(filterMappings[key]);
        if (!containerEl) return;
        containerEl.innerHTML = '';

        let items = [];
        if (key === 'ClassID' && classesData) {
            items = classesData.map(c => ({ label: c.ClassName, value: String(c.id) }));
        } else {
            const distinctValues = [...new Set(allRawStudents.map(s => (s[key] || '').trim()).filter(Boolean))];
            items = distinctValues.map(val => ({ label: val, value: val }));
        }

        // IMPROVEMENT 6: Dynamic text implementation initialized as Deselect All
        const masterRow = document.createElement('label');
        masterRow.className = 'filter-item-row macro-toggle-row';
        masterRow.innerHTML = `<input type="checkbox" class="master-toggle-checkbox" checked> <span class="master-toggle-text">Deselect All</span>`;
        containerEl.appendChild(masterRow);

        const masterCheckbox = masterRow.querySelector('.master-toggle-checkbox');
        const masterText = masterRow.querySelector('.master-toggle-text');

        items.forEach(item => {
            const row = document.createElement('label');
            row.className = 'filter-item-row';
            row.innerHTML = `<input type="checkbox" name="${key}" value="${item.value}" checked> <span>${item.label}</span>`;
            containerEl.appendChild(row);
        });

        const childCheckboxes = containerEl.querySelectorAll(`input[name="${key}"]`);
        
        // IMPROVEMENT 6: Dynamic text adjustment rules toggled natively
        masterCheckbox.addEventListener('change', function() {
            childCheckboxes.forEach(cb => { cb.checked = this.checked; });
            masterText.textContent = this.checked ? "Deselect All" : "Select All";
            triggerFilterChangedState();
        });

        childCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const totalChecked = containerEl.querySelectorAll(`input[name="${key}"]:checked`).length;
                masterCheckbox.checked = (totalChecked === childCheckboxes.length);
                masterText.textContent = masterCheckbox.checked ? "Deselect All" : "Select All";
                triggerFilterChangedState();
            });
        });
    });
}

// -------------------- BUTTON INTERACTIVE FILTER LOGIC --------------------
function applyActiveFilters() {
    const btn = document.getElementById('btnApplyGridFilters');
    if (btn) {
        btn.classList.add('processing');
        btn.textContent = "Filtering Data...";
    }

    setTimeout(() => {
        const filterMappings = ['ClassID', 'Stream', 'House', 'Race', 'StudentGender'];
        
        filteredStudentsList = allRawStudents.filter(student => {
            return filterMappings.every(key => {
                const checkedBoxes = document.querySelectorAll(`input[name="${key}"]:checked`);
                const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);
                
                if (selectedValues.length === 0) return false; 
                
                const studentValue = String(student[key] || '').trim();
                return selectedValues.includes(studentValue);
            });
        });

        renderDataGrid();

        if (btn) {
            btn.classList.remove('processing');
            btn.textContent = "Apply Filters";
        }
        
        document.getElementById('FilterActionContainer').style.display = 'none';
    }, 50);
}

// -------------------- RENDER EXCEL VIEWPORT GRID --------------------
function renderDataGrid() {
    const box = document.getElementById('StudentDataBox');
    if (!box) return;

    if (window.excelGridInstance) {
        try { jspreadsheet.destroy(box); } catch (e) {}
        window.excelGridInstance = null;
    }
    box.innerHTML = '';

    if (filteredStudentsList.length === 0) {
        box.innerHTML = "<p style='padding:20px; font-weight:bold; color:#cc0000;'>No records match your selected filter criteria combinations.</p>";
        return;
    }

    const cleanRowsPayload = filteredStudentsList.map(st => [
        st.RollNo || '',
        st.RegdNo || '',
        st.SymbNo || '',
        st.StudentName || '',
        st.StudentGender || '',
        st.StudentAddress || '',
        st.DOBBS || '',
        st.DOBAD || '',
        st.FatherName || '',
        st.MotherName || '',
        st.Contact || '',
        st.Email || '',
        st.Stream || '',
        st.Race || '',
        st.House || '',
        st.Subjects || ''
    ]);

    window.excelGridInstance = jspreadsheet(box, {
        data: cleanRowsPayload,
        columns: GRID_SCHEMA,
        allowInsertColumn: false,
        allowDeleteColumn: false,
        allowInsertRow: false,
        allowDeleteRow: false,
        columnSorting: true,
        editable: false,
        tableOverflow: true,      
        tableWidth: '100%',       
        tableHeight: '450px',     

        onselection: function(instance, x1, y1, x2, y2) {
            if (y1 === y2 && filteredStudentsList[y1]) {
                openStudentModalCard(filteredStudentsList[y1]);
            }
        }
    });
}

// -------------------- RESTORED POPUP DATA WRAPPER --------------------
function openStudentModalCard(student) {
    document.getElementById('ModalStudentName').textContent = student.StudentName || 'Unnamed Student';
    document.getElementById('ModalStudentPhoto').src = student.PhotoUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

    const singleColumnContainer = document.getElementById('ModalDetailsSingleColumn');
    singleColumnContainer.innerHTML = '';

    const classRow = document.createElement('div');
    classRow.className = 'modal-row-item';
    classRow.innerHTML = `<span class="modal-row-label">Class Level</span>
                          <span class="modal-row-value">${classIdToNameMap[student.ClassID] || '---'}</span>`;
    singleColumnContainer.appendChild(classRow);

    GRID_SCHEMA.forEach(col => {
        const row = document.createElement('div');
        row.className = 'modal-row-item';
        row.innerHTML = `
            <span class="modal-row-label">${col.title}</span>
            <span class="modal-row-value">${student[col.name] || '---'}</span>
        `;
        singleColumnContainer.appendChild(row);
    });

    document.getElementById('StudentDetailModal').style.display = 'flex';
}

// NEW IMPROVEMENT: Capture and Save the profile modal content as a JPG image asset
window.saveModalAsJPG = function() {
    // Target the main scroll container and content structures
    const scrollContainer = document.querySelector('.modal-scroll-container');
    const modalContent = document.querySelector('.modal-content');
    const closeBtn = document.querySelector('.modal-close-btn');
    const saveBtnContainer = document.querySelector('.modal-save-jpg-container');
    
    // 1. Save original styling states so we can restore them later
    const originalScrollOverflow = scrollContainer.style.overflowY;
    const originalContentMaxHeight = modalContent.style.maxHeight;
    const originalContentHeight = modalContent.style.height;

    // 2. Hide interactive UI controls from the final image print asset
    closeBtn.style.visibility = 'hidden';
    saveBtnContainer.style.display = 'none';

    // 3. FORCE the layout out of scroll mode to calculate absolute full canvas height
    scrollContainer.style.overflowY = 'visible';
    modalContent.style.maxHeight = 'none';
    modalContent.style.height = 'auto';

    // 4. Run the rendering capture execution pipeline
    html2canvas(modalContent, {
        useCORS: true,
        scale: 2, // Cleans up text blurring on high-DPI viewports
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: modalContent.scrollWidth,
        windowHeight: modalContent.scrollHeight
    }).then(canvas => {
        // Build the download link trigger
        const a = document.createElement('a');
        const studentName = document.getElementById('ModalStudentName').textContent.replace(/\s+/g, '_');
        
        a.href = canvas.toDataURL('image/jpeg', 0.95);
        a.download = `StudentProfile_${studentName}.jpg`;
        a.click();

        // 5. RESTORE original responsive workspace styles seamlessly
        closeBtn.style.visibility = 'visible';
        saveBtnContainer.style.display = 'flex';
        scrollContainer.style.overflowY = originalScrollOverflow;
        modalContent.style.maxHeight = originalContentMaxHeight;
        modalContent.style.height = originalContentHeight;
    }).catch(err => {
        console.error("Snapshot rendering failed: ", err);
        // Fallback restoration in case of engine errors
        closeBtn.style.visibility = 'visible';
        saveBtnContainer.style.display = 'flex';
        scrollContainer.style.overflowY = originalScrollOverflow;
        modalContent.style.maxHeight = originalContentMaxHeight;
        modalContent.style.height = originalContentHeight;
    });
};

window.closeStudentModal = function() {
    document.getElementById('StudentDetailModal').style.display = 'none';
};

window.closeStudentModal = function() {
    document.getElementById('StudentDetailModal').style.display = 'none';
};

// -------------------- EXPORTING CONTROLS HANDLERS --------------------
window.exportData = function(format) {
    if (filteredStudentsList.length === 0) {
        alert("No student data matches current filter criteria to run export operations.");
        return;
    }
    
    const targetFilename = `StudentReport_${Date.now()}`;

    // 1. NATIVE EXCEL WORKBOOK EXPORT
    if (format === 'excel') {
        if (window.excelGridInstance) {
            window.excelGridInstance.download(`${targetFilename}.xls`);
        } else {
            alert("Data grid context not initialized yet.");
        }
        return;
    } 

    // 2. PERFECT MULTI-PAGE PRINT/PDF OPERATION VIA ISOLATED WINDOW
    if (format === 'pdf') {
        const schoolName = document.getElementById('SchoolNameLabel').textContent;
        const schoolAddress = document.getElementById('SchoolAddressLabel').textContent;

        // Open an independent document window instance context
        const printWindow = window.open('', '_blank', 'width=1100,height=800');
        
        const htmlPayload = `
            <html>
            <head>
                <title>${targetFilename}</title>
                <style>
                    @page { size: A3 landscape; margin: 12mm 10mm; }
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000; }
                    .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
                    .header p { margin: 5px 0 0 0; font-size: 13px; font-weight: bold; color: #444; }
                    .header h3 { margin: 12px 0 0 0; font-size: 14px; text-decoration: underline; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    th { background-color: #f2f2f2; font-weight: bold; text-align: left; padding: 6px; border: 1px solid #000; }
                    td { padding: 5px; border: 1px solid #000; word-break: break-word; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${schoolName}</h1>
                    <p>${schoolAddress}</p>
                    <h3>STUDENT DATA SUMMARY REPORT</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            ${GRID_SCHEMA.map(c => `<th>${c.title}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredStudentsList.map(st => `
                            <tr>
                               <td>${st.RollNo || '---'}</td>
                               <td>${st.RegdNo || '---'}</td>
                               <td>${st.SymNo || '---'}</td>
                               <td style="font-weight:bold;">${st.StudentName || '---'}</td>
                               <td>${st.StudentGender || '---'}</td>
                               <td>${st.StudentAddress || '---'}</td>
                               <td>${st.DOBBS || '---'}</td>
                               <td>${st.DOBAD || '---'}</td>
                               <td>${st.FatherName || '---'}</td>
                               <td>${st.MotherName || '---'}</td>
                               <td>${st.Contact || '---'}</td>
                               <td>${st.Email || '---'}</td>
                               <td>${st.Stream || '---'}</td>
                               <td>${st.Race || '---'}</td>
                               <td>${st.House || '---'}</td>
                               <td>${st.Subjects || '---'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(htmlPayload);
        printWindow.document.close();
        printWindow.focus();
        
        // Let assets buffer for a split-second, open system dialog box, then clean up memory
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        return;
    }

    // 3. FULL HIGH-QUALITY IMAGE EXPORT
    if (format === 'jpg') {
        const exportHiddenCanvas = document.createElement('div');
        exportHiddenCanvas.style.position = 'absolute';
        exportHiddenCanvas.style.left = '-9999px';
        exportHiddenCanvas.style.backgroundColor = '#ffffff';
        exportHiddenCanvas.style.padding = '30px';
        exportHiddenCanvas.style.width = '1400px'; 
        exportHiddenCanvas.style.fontFamily = 'Arial, sans-serif';
        
        exportHiddenCanvas.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #000000; padding-bottom: 12px;">
                <h1 style="margin: 0; font-size: 26px; text-transform: uppercase;">${document.getElementById('SchoolNameLabel').textContent}</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #333; font-weight: bold;">${document.getElementById('SchoolAddressLabel').textContent}</p>
                <h3 style="margin: 15px 0 0 0; font-size: 16px; text-decoration: underline;">STUDENT DATA SUMMARY REPORT</h3>
            </div>
            <table style="width:100%; border-collapse: collapse; font-size: 11px;" border="1" cellpadding="6">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
                        ${GRID_SCHEMA.map(c => `<th style="padding: 6px; font-weight: bold; border: 1px solid #000000;">${c.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${filteredStudentsList.map(st => `
                        <tr>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.RollNo || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.RegdNo || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.SymNo || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px; font-weight: bold;">${st.StudentName || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.StudentGender || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.StudentAddress || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.DOBBS || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.DOBAD || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.FatherName || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.MotherName || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.Contact || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.Email || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.Stream || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.Race || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.House || '---'}</td>
                            <td style="border: 1px solid #000000; padding: 5px;">${st.Subjects || '---'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.body.appendChild(exportHiddenCanvas);

        html2canvas(exportHiddenCanvas, { useCORS: true, scale: 2, logging: false }).then(canvas => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.95);
            a.download = `${targetFilename}.jpg`;
            a.click();
            document.body.removeChild(exportHiddenCanvas);
        }).catch((err) => {
            console.error("JPG Engine Error: ", err);
            document.body.removeChild(exportHiddenCanvas);
        });
    }
};

const PageNavDropdown = document.getElementById("PageNavigationSelect");
if (PageNavDropdown) {
    PageNavDropdown.addEventListener("change", function () {
        const pageMap = {
            "LibraryPage": "../LibraryPage/LibraryIndex.html",
            "NoticePage": "../NoticePage/NoticeIndex.html",
            "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
            "StudentPage": "StudentIndex.html",
            "TeacherPage": "../TeacherPage/TeacherIndex.html",
            "HomePage": "../index.html",
            "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
            "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
            "GalleryPage": "../GalleryPage/GalleryIndex.html",
            "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
            "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
            "AdminPage": "../AdminPage/LogInIndex.html"        
        };
        if (pageMap[this.value]) window.location.href = pageMap[this.value];
    });
}