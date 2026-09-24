if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}

protectAdminPage();
async function protectAdminPage() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        if (typeof showCustomDialog1 === 'function') {
            showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        } else {
            alert("Unauthorized! Please login first.");
        }
        window.location.replace("../LoginPage/LoginIndex.html");
        return;
    }
    document.body.style.display = "block";
}

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
        if (selectedPage) window.location.href = selectedPage;
    });
}

const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
if (EditNavigationDropDown) {
    EditNavigationDropDown.addEventListener("change", function () {
        const pageMap = {
            "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
            "IDCardEditBox": "../EditIDCardPage/EditIDCardIndex.html",
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
        if (selectedEdit) window.location.href = selectedEdit;
    });
}

const dateBox = document.getElementById('DateBox');
if (dateBox && typeof AD2BS === 'function') {
    dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";
}

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

async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient.from('AboutSchoolTable').select('Value').eq('Name', 'SchoolLogo').single();
        if (error) return;
        if (data && data.Value) {
            const freshLogoUrl = data.Value;
            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) faviconElement.href = freshLogoUrl;
            const logoImgElement = document.querySelector('#LogoBox img');
            if (logoImgElement) logoImgElement.src = freshLogoUrl;            
        }
    } catch (error) {
        console.error("Unexpected branding layout setup error:", error);
    }
}

async function loadClassNameDropdown() {
    const dropdown = document.getElementById('ResultClassSelect');    
    if (!dropdown) return;
    try {
        const { data: classes, error } = await supabaseClient.from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        dropdown.innerHTML = '<option value="" selected disabled>-- Select a Class --</option>';
        classes.forEach(singleClass => {
            const option = document.createElement('option');
            option.value = singleClass.id; 
            option.textContent = singleClass.ClassName;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching classes for dropdown:", error.message);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    loadDynamicLogoAndFavicon();
    loadClassNameDropdown();
    
    const yearSelect = document.getElementById('ResultYearSelect');
    const examSelect = document.getElementById('ExamNameSelect');
    if (yearSelect) yearSelect.addEventListener('change', loadExistingResults);
    if (examSelect) examSelect.addEventListener('change', loadExistingResults);
});

window.excelGrid = null;
let currentSubjects = []; 
let totalMarksColIdx = 0;
let gpaColIdx = 0;
let markPctColIdx = 0;
let rankColIdx = 0;
let attendanceColIdx = 0;
let attendancePctColIdx = 0;

const BASE_COLUMNS = [
    { type: 'hidden', name: 'id' }, 
    { type: 'hidden', name: 'ClassID' },
    { type: 'hidden', name: 'StudentID' },
    { type: 'text', title: 'Roll. No.', name: 'RollNo', align: 'center', width: 80, readOnly: true },
    { type: 'text', title: 'Student\'s Name', name: 'StudentName', align: 'left', width: 220, readOnly: true }
];

function calculateGradeAndPoints(obtained, fullMark) {
    const ob = parseFloat(obtained);
    const fm = parseFloat(fullMark);
    if (isNaN(ob) || isNaN(fm) || fm <= 0) return { grade: '', points: '-' };
    const percentage = (ob / fm) * 100;
    if (percentage >= 90) return { grade: 'A+', points: '4.0' };
    if (percentage >= 80) return { grade: 'A',  points: '3.6' };
    if (percentage >= 70) return { grade: 'B+', points: '3.2' };
    if (percentage >= 60) return { grade: 'B',  points: '2.8' };
    if (percentage >= 50) return { grade: 'C+', points: '2.4' };
    if (percentage >= 40) return { grade: 'C',  points: '2.0' }; 
    if (percentage >= 35) return { grade: 'D',  points: '1.6' };
    return { grade: 'NG', points: '-' };
}

const GRADE_RANK_MAP = { 'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'NG': 1, '': 0 };

function recalculateSheetMetrics(gridInstance) {
    if (!gridInstance) return;
    try {
        const gridData = gridInstance.getData();
        if (!gridData || !gridData.length) return;
        const rowCount = gridData.length;

        let activeX = null, activeY = null;
        if (gridInstance.edition) {
            activeX = parseInt(gridInstance.edition[0]);
            activeY = parseInt(gridInstance.edition[1]);
        }

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            let totalObtained = 0;
            let totalFullMarks = 0;
            let sumChGpProduct = 0;
            let sumCreditHours = 0;
            let hasGPMinus = false;

            currentSubjects.forEach(sub => {
                const fmValueRaw = gridInstance.getValueFromCoords(sub.fmIdx, rowIndex);
                const obValueRaw = gridInstance.getValueFromCoords(sub.obIdx, rowIndex);
                const chValueRaw = gridInstance.getValueFromCoords(sub.chIdx, rowIndex);

                const fm = parseFloat(fmValueRaw) || 0;
                const ch = parseFloat(chValueRaw) || 0;
                
                if (obValueRaw !== undefined && obValueRaw !== null && String(obValueRaw).trim() !== '') {
                    const ob = parseFloat(obValueRaw);
                    if (!isNaN(ob)) {
                        const evaluation = calculateGradeAndPoints(ob, fm);
                        
                        if (!(activeY === rowIndex && (activeX === sub.gIdx || activeX === sub.obIdx))) {
                            gridInstance.setValueFromCoords(sub.gIdx, rowIndex, evaluation.grade, true);
                        }
                        if (!(activeY === rowIndex && (activeX === sub.gpIdx || activeX === sub.obIdx))) {
                            gridInstance.setValueFromCoords(sub.gpIdx, rowIndex, evaluation.points, true);
                        }

                        totalObtained += ob;
                        totalFullMarks += fm;

                        if (evaluation.points === '-') {
                            hasGPMinus = true;
                        } else {
                            sumChGpProduct += ch * parseFloat(evaluation.points);
                        }
                        sumCreditHours += ch;
                    }
                } else {
                    if (!(activeY === rowIndex && activeX === sub.gIdx)) gridInstance.setValueFromCoords(sub.gIdx, rowIndex, '', true);
                    if (!(activeY === rowIndex && activeX === sub.gpIdx)) gridInstance.setValueFromCoords(sub.gpIdx, rowIndex, '-', true);
                    hasGPMinus = true;
                    totalFullMarks += fm;
                    sumCreditHours += ch;
                }
            });

            gridInstance.setValueFromCoords(totalMarksColIdx, rowIndex, totalObtained, true);

            if (totalFullMarks > 0) {
                const markPct = ((totalObtained * 100) / totalFullMarks).toFixed(2);
                gridInstance.setValueFromCoords(markPctColIdx, rowIndex, markPct + '%', true);
            } else {
                gridInstance.setValueFromCoords(markPctColIdx, rowIndex, '0.00%', true);
            }

            if (hasGPMinus) {
                gridInstance.setValueFromCoords(gpaColIdx, rowIndex, '-', true);
            } else if (sumCreditHours > 0) {
                const finalGpa = (sumChGpProduct / sumCreditHours).toFixed(2);
                gridInstance.setValueFromCoords(gpaColIdx, rowIndex, finalGpa, true);
            } else {
                gridInstance.setValueFromCoords(gpaColIdx, rowIndex, '-', true);
            }

            const srdValue = parseFloat(document.getElementById('schoolRunningDays')?.value) || 0;
            const attValue = parseFloat(gridInstance.getValueFromCoords(attendanceColIdx, rowIndex)) || 0;
            if (srdValue > 0) {
                const attPct = ((attValue * 100) / srdValue).toFixed(1) + '%';
                gridInstance.setValueFromCoords(attendancePctColIdx, rowIndex, attPct, true);
            } else {
                gridInstance.setValueFromCoords(attendancePctColIdx, rowIndex, '0.0%', true);
            }
        }

        currentSubjects.forEach(sub => {
            let subjectScores = [];
            for (let r = 0; r < rowCount; r++) {
                const scoreVal = gridInstance.getValueFromCoords(sub.obIdx, r);
                subjectScores.push({
                    index: r,
                    score: (scoreVal !== undefined && scoreVal !== null && String(scoreVal).trim() !== '') ? parseFloat(scoreVal) : -1
                });
            }
            subjectScores.sort((a, b) => b.score - a.score);
            let subRank = 0;
            let lastSubScore = -1;
            subjectScores.forEach((item, i) => {
                if (item.score === -1) {
                    if (!(activeY === item.index && activeX === sub.rIdx)) {
                        gridInstance.setValueFromCoords(sub.rIdx, item.index, '-', true);
                    }
                    return;
                }
                if (item.score !== lastSubScore) {
                    subRank = i + 1;
                    lastSubScore = item.score;
                }
                if (!(activeY === item.index && activeX === sub.rIdx)) {
                    gridInstance.setValueFromCoords(sub.rIdx, item.index, subRank, true);
                }
            });
        });

        let rankArray = [];
        for (let r = 0; r < rowCount; r++) {
            const val = gridInstance.getValueFromCoords(gpaColIdx, r);
            const parsedGPA = parseFloat(val);
            rankArray.push({
                rowIndex: r,
                gpa: isNaN(parsedGPA) || val === '-' ? -1 : parsedGPA
            });
        }

        let activeScorers = rankArray.filter(item => item.gpa !== -1);
        activeScorers.sort((a, b) => b.gpa - a.gpa);

        let currentRank = 1;
        for (let i = 0; i < activeScorers.length; i++) {
            if (i > 0 && activeScorers[i].gpa < activeScorers[i - 1].gpa) {
                currentRank = i + 1;
            }
            gridInstance.setValueFromCoords(rankColIdx, activeScorers[i].rowIndex, currentRank, true);
        }

        rankArray.forEach(item => {
            if (item.gpa === -1) {
                gridInstance.setValueFromCoords(rankColIdx, item.rowIndex, '-', true);
            }
        });

    } catch (err) {
        console.error("Metrics engine evaluation error:", err);
    }
}

const classSelectionSelect = document.getElementById('ResultClassSelect');
if (classSelectionSelect) {
    classSelectionSelect.addEventListener('change', loadExistingResults);
}

async function loadExistingResults() {
    const classId = document.getElementById('ResultClassSelect').value;
    const selectedYear = document.getElementById('ResultYearSelect')?.value;
    const selectedExam = document.getElementById('ExamNameSelect')?.value?.trim();
    const container = document.getElementById('ResultBox');

    if (!classId) return;

    const sheetConstructor = (typeof jexcel !== 'undefined') ? jexcel : jspreadsheet;

    try {
        const { data: classConfig, error: configError } = await supabaseClient.from('ClassTable').select('*').eq('id', classId).single();
        if (configError) throw configError;

        currentSubjects = [];
        let activeColumnIndex = BASE_COLUMNS.length;
        let dynamicColumnsConfig = [...BASE_COLUMNS];

        for (let i = 1; i <= 10; i++) {
            const subjectName = classConfig[`Subject${i}`];
            const creditHour = classConfig[`CreditHour${i}`];

            if (subjectName && subjectName.trim() !== "") {
                const subMeta = {
                    name: subjectName.trim(),
                    ch: creditHour || '',
                    subNum: i,
                    subNameIdx: activeColumnIndex,
                    fmIdx: activeColumnIndex + 1,
                    chIdx: activeColumnIndex + 2,
                    obIdx: activeColumnIndex + 3,
                    gIdx: activeColumnIndex + 4,
                    gpIdx: activeColumnIndex + 5,
                    rIdx: activeColumnIndex + 6
                };
                
                currentSubjects.push(subMeta);

                dynamicColumnsConfig.push(
                    { type: 'text', title: `Subject${i}\nName`, name: `Sub${i}_Name`, width: 120 },
                    { type: 'numeric', title: `Subject${i}\nFM`, name: `Sub${i}_FM`, width: 70 },
                    { type: 'numeric', title: `Subject${i}\nCH`, name: `Sub${i}_CH`, width: 70 },
                    { type: 'numeric', title: `Subject${i}\nOM`, name: `Sub${i}_Obtained`, width: 70 },
                    { type: 'text', title: `Subject${i}\nGrade`, name: `Sub${i}_Grade`, width: 70, readOnly: true },
                    { type: 'text', title: `Subject${i}\nGP`, name: `Sub${i}_GP`, width: 70, readOnly: true },
                    { type: 'text', title: `Subject${i}\nRank`, name: `Sub${i}_Rank`, width: 70, readOnly: true }
                );

                activeColumnIndex += 7;
            }
        }

        totalMarksColIdx = activeColumnIndex;
        gpaColIdx = activeColumnIndex + 1;
        markPctColIdx = activeColumnIndex + 2;
        rankColIdx = activeColumnIndex + 3;
        attendanceColIdx = activeColumnIndex + 4;
        attendancePctColIdx = activeColumnIndex + 5;

        dynamicColumnsConfig.push(
            { type: 'numeric', title: 'Total\nMarks', name: 'TotalMarks', width: 90, readOnly: true },
            { type: 'text', title: 'GPA', name: 'GPA', width: 80, readOnly: true },
            { type: 'text', title: 'Mark%', name: 'MarkPct', width: 80, readOnly: true },
            { type: 'text', title: 'Rank', name: 'Rank', width: 70, readOnly: true },
            { type: 'numeric', title: 'Attendance', name: 'Attendance', width: 90, readOnly: false }, 
            { type: 'text', title: 'Attendance%', name: 'AttendancePct', width: 100, readOnly: true }
        );

        const { data: students, error: studentError } = await supabaseClient.from('StudentDataTable').select('*').eq('ClassID', classId).order('RollNo', { ascending: true });
        if (studentError) throw studentError;

        if (!students || students.length === 0) {
            if (window.excelGrid && sheetConstructor) sheetConstructor.destroy(container);
            container.innerHTML = "<p style='padding:10px;'>No student profiles associated with selection.</p>";
            return;
        }

        let savedResultsMap = {};
        if (selectedYear && selectedYear !== "Select Year" && selectedExam) {
            const { data: savedData, error: savedError } = await supabaseClient
                .from('ResultDataTable')
                .select('*')
                .eq('ClassID', classId)
                .eq('Year', selectedYear)
                .eq('ExamName', selectedExam);

            if (!savedError && savedData) {
                savedData.forEach(row => {
                    savedResultsMap[row.StudentID] = row;
                });
            }
        }

        const formattedData = students.map(st => {
            const savedRecord = savedResultsMap[st.id] || savedResultsMap[st.StudentID];
            
            let rowData = {
                id: savedRecord ? savedRecord.id : st.id,
                ClassID: classId,
                StudentID: st.StudentID || st.id,
                RollNo: parseInt(st.RollNo, 10) || 0,
                StudentName: st.StudentName || ''
            };

            currentSubjects.forEach((sub) => {
                const i = sub.subNum;
                if (savedRecord) {
                    rowData[`Sub${i}_Name`] = savedRecord[`Sub${i}_Name`] || sub.name;
                    rowData[`Sub${i}_FM`] = savedRecord[`Sub${i}_FM`] !== null ? savedRecord[`Sub${i}_FM`] : 100;
                    rowData[`Sub${i}_CH`] = savedRecord[`Sub${i}_CH`] !== null ? savedRecord[`Sub${i}_CH`] : sub.ch;
                    rowData[`Sub${i}_Obtained`] = savedRecord[`Sub${i}_Obtained`] !== null ? savedRecord[`Sub${i}_Obtained`] : '';
                } else {
                    rowData[`Sub${i}_Name`] = st[`Sub${i}_Name`] || sub.name;
                    rowData[`Sub${i}_FM`] = st[`Sub${i}_FM`] !== undefined && st[`Sub${i}_FM`] !== null ? st[`Sub${i}_FM`] : 100;
                    rowData[`Sub${i}_CH`] = st[`Sub${i}_CH`] !== undefined && st[`Sub${i}_CH`] !== null ? st[`Sub${i}_CH`] : sub.ch;
                    rowData[`Sub${i}_Obtained`] = '';
                }
                rowData[`Sub${i}_Grade`] = '';
                rowData[`Sub${i}_Rank`] = '';
                rowData[`Sub${i}_GP`] = '-';
            });

            rowData['TotalMarks'] = savedRecord?.TotalMarks || '';
            rowData['GPA'] = savedRecord?.GPA || '-';
            rowData['MarkPct'] = savedRecord?.MarkPct || '';
            rowData['Rank'] = savedRecord?.Rank || '';
            rowData['Attendance'] = savedRecord?.StudentAttendance || savedRecord?.Attendance || 0;
            rowData['AttendancePct'] = '';

            if (savedRecord?.SchoolRunningDays) {
                const srdInput = document.getElementById('schoolRunningDays');
                if (srdInput) srdInput.value = savedRecord.SchoolRunningDays;
            }

            return rowData;
        }).sort((a, b) => a.RollNo - b.RollNo);

        initializeExcelGrid(formattedData, dynamicColumnsConfig);

    } catch (err) {
        console.error("Layout construction engine breakdown:", err.message);
    }
}

function applyThickBordersToSubjectGroups() {
    const tableContainer = document.getElementById('ResultBox');
    if (!tableContainer) return;
    
    tableContainer.querySelectorAll('.thick-subject-group-boundary').forEach(el => {
        el.classList.remove('thick-subject-group-boundary');
    });

    currentSubjects.forEach(sub => {
        const domTargetCellIndex = sub.rIdx + 2; 
        
        const headerCell = tableContainer.querySelector(`.jexcel thead tr td:nth-child(${domTargetCellIndex})`);
        if (headerCell) headerCell.classList.add('thick-subject-group-boundary');

        const dataRows = tableContainer.querySelectorAll('.jexcel tbody tr');
        dataRows.forEach(row => {
            const bodyDataCell = row.querySelector(`td:nth-child(${domTargetCellIndex})`);
            if (bodyDataCell) bodyDataCell.classList.add('thick-subject-group-boundary');
        });
    });
}

function initializeExcelGrid(dataArray, targetedColumns) {
    const container = document.getElementById('ResultBox');
    if (!container) return;
    container.innerHTML = ''; 
    const sheetConstructor = (typeof jexcel !== 'undefined') ? jexcel : jspreadsheet;
    if (!sheetConstructor) return;

    window.excelGrid = sheetConstructor(container, {
        data: dataArray,
        columns: targetedColumns,
        allowInsertColumn: false,
        allowDeleteColumn: false,
        columnSorting: false,
        copyCompatibility: true,  
        allowRenameColumn: false,
        minDimensions: [targetedColumns.length, 0], 
        tableOverflow: true,      
        tableWidth: '100%',        
        tableHeight: '520px', 
        
        onchange: function(instance, cell, x, y, value) {
            if (x === undefined || x === null) return;
            const colIndex = parseInt(x);
            const targetGrid = instance.jexcel || instance.jspreadsheet || instance;
            
            const isMarkEdit = currentSubjects.some(sub => sub.fmIdx === colIndex || sub.obIdx === colIndex || sub.chIdx === colIndex);
            const isAttendanceEdit = (colIndex === attendanceColIdx);

            if (isMarkEdit || isAttendanceEdit) {
                setTimeout(function() {
                    recalculateSheetMetrics(targetGrid);
                }, 50);
            }
        },

        onload: function(instance) {
            const targetGrid = instance.jexcel || instance.jspreadsheet || instance;
            setTimeout(function() {
                recalculateSheetMetrics(targetGrid);
                applyThickBordersToSubjectGroups();
            }, 0);
        }
    });

    setupAutofillDragScrollEngine(container);

    const srdInput = document.getElementById('schoolRunningDays');
    if (srdInput) {
        srdInput.oninput = srdInput.onchange = function() {
            if (!window.excelGrid) return;
            const gridInstance = window.excelGrid.jexcel || window.excelGrid.jspreadsheet || window.excelGrid;
            recalculateSheetMetrics(gridInstance);
        };
    }
}

function setupAutofillDragScrollEngine(container) {
    document.addEventListener('mousedown', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('jexcel_corner')) {
            const scrollContainer = container.querySelector('.jexcel_content');
            if (!scrollContainer) return;

            let scrollInterval = null;
            let currentX = e.clientX;
            let currentY = e.clientY;

            const handleMouseMove = function(moveEvent) {
                currentX = moveEvent.clientX;
                currentY = moveEvent.clientY;

                const rect = scrollContainer.getBoundingClientRect();
                const boundaryThreshold = 35; 

                const isNearBottom = (currentY >= rect.bottom - boundaryThreshold);
                const isNearTop = (currentY <= rect.top + boundaryThreshold);
                const isNearRight = (currentX >= rect.right - boundaryThreshold);
                const isNearLeft = (currentX <= rect.left + boundaryThreshold);

                if (isNearBottom || isNearTop || isNearRight || isNearLeft) {
                    if (!scrollInterval) {
                        scrollInterval = setInterval(() => {
                            let scrollDeltaY = 0;
                            let scrollDeltaX = 0;

                            if (currentY >= rect.bottom - boundaryThreshold) {
                                scrollDeltaY = Math.min(20, Math.max(5, (currentY - (rect.bottom - boundaryThreshold)) / 2));
                            } else if (currentY <= rect.top + boundaryThreshold) {
                                scrollDeltaY = Math.max(-20, Math.min(-5, (currentY - (rect.top + boundaryThreshold)) / 2));
                            }

                            if (currentX >= rect.right - boundaryThreshold) {
                                scrollDeltaX = Math.min(20, Math.max(5, (currentX - (rect.right - boundaryThreshold)) / 2));
                            } else if (currentX <= rect.left + boundaryThreshold) {
                                scrollDeltaX = Math.max(-20, Math.min(-5, (currentX - (rect.left + boundaryThreshold)) / 2));
                            }

                            scrollContainer.scrollTop += scrollDeltaY;
                            scrollContainer.scrollLeft += scrollDeltaX;
                            const syntheticMoveEvent = new MouseEvent('mousemove', {
                                bubbles: true,
                                cancelable: true,
                                clientX: currentX,
                                clientY: currentY
                            });
                            
                            const elementUnderCursor = document.elementFromPoint(currentX, currentY);
                            if (elementUnderCursor && scrollContainer.contains(elementUnderCursor)) {
                                elementUnderCursor.dispatchEvent(syntheticMoveEvent);
                            } else {
                                scrollContainer.dispatchEvent(syntheticMoveEvent);
                            }
                        }, 25);
                    }
                } else {
                    if (scrollInterval) {
                        clearInterval(scrollInterval);
                        scrollInterval = null;
                    }
                }
            };

            const handleMouseUp = function() {
                if (scrollInterval) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                }
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    });
}

async function saveResults() {
    if (!window.excelGrid) {
        alert("There is no active spreadsheet grid loaded to save.");
        return;
    }

    const classId = document.getElementById('ResultClassSelect').value;
    const selectedYear = document.getElementById('ResultYearSelect').value;
    const selectedExam = document.getElementById('ExamNameSelect').value.trim();
    const srdValue = parseFloat(document.getElementById('schoolRunningDays').value) || null;

    if (!classId) { alert("Please select a class first."); return; }
    if (!selectedYear || selectedYear === "Select Year") { alert("Please choose a valid Academic Year."); return; }
    if (!selectedExam) { alert("Please enter or select an Exam Name."); return; }

    const rowDataArray = window.excelGrid.getJson();
    if (!rowDataArray || rowDataArray.length === 0) {
        alert("The grid data is empty.");
        return;
    }

    const saveButton = document.getElementById('btnSaveResults');
    saveButton.innerText = "Saving records...";
    saveButton.disabled = true;

    try {
        const upsertPayloadBatch = [];

        for (let idx = 0; idx < rowDataArray.length; idx++) {
            const rowData = rowDataArray[idx];
            
            const rowStudentId = window.excelGrid.getValueFromCoords(2, idx) || rowData.StudentID || rowData.id;
            const rowRollNo = window.excelGrid.getValueFromCoords(3, idx) || rowData.RollNo;
            const rowStudentName = window.excelGrid.getValueFromCoords(4, idx) || rowData.StudentName;

            if (!rowStudentId) continue;

            let recordRow = {
                StudentID: parseInt(rowStudentId, 10),
                ClassID: parseInt(classId, 10),
                StudentName: rowStudentName,
                RollNo: parseInt(rowRollNo, 10) || null,
                Year: selectedYear,
                ExamName: selectedExam,
                TotalMarks: parseFloat(window.excelGrid.getValueFromCoords(totalMarksColIdx, idx)) || 0,
                GPA: window.excelGrid.getValueFromCoords(gpaColIdx, idx),
                MarkPct: window.excelGrid.getValueFromCoords(markPctColIdx, idx),
                Rank: window.excelGrid.getValueFromCoords(rankColIdx, idx),
                SchoolRunningDays: srdValue, 
                StudentAttendance: parseFloat(window.excelGrid.getValueFromCoords(attendanceColIdx, idx)) || 0 
            };

            currentSubjects.forEach((sub) => {
                const i = sub.subNum;
                recordRow[`Sub${i}_Name`] = String(window.excelGrid.getValueFromCoords(sub.subNameIdx, idx)).trim() || null;
                recordRow[`Sub${i}_FM`] = parseFloat(window.excelGrid.getValueFromCoords(sub.fmIdx, idx)) || null;
                recordRow[`Sub${i}_CH`] = parseFloat(window.excelGrid.getValueFromCoords(sub.chIdx, idx)) || null;
                recordRow[`Sub${i}_Obtained`] = parseFloat(window.excelGrid.getValueFromCoords(sub.obIdx, idx)) ?? null;
                recordRow[`Sub${i}_Grade`] = String(window.excelGrid.getValueFromCoords(sub.gIdx, idx)).trim() || null;
                recordRow[`Sub${i}_GP`] = String(window.excelGrid.getValueFromCoords(sub.gpIdx, idx)).trim() || null;
                recordRow[`Sub${i}_Rank`] = String(window.excelGrid.getValueFromCoords(sub.rIdx, idx)).trim() || null;
            });

            upsertPayloadBatch.push(recordRow);
        }

        const { error } = await supabaseClient
            .from('ResultDataTable')
            .upsert(upsertPayloadBatch, { onConflict: 'StudentID,Year,ExamName' });

        if (error) throw error;
        alert(`Successfully saved ${upsertPayloadBatch.length} results records.`);
    } catch (err) {
        console.error("Database upsert failed:", err);
        alert("Error saving metrics: " + err.message);
    } finally {
        saveButton.innerText = "Save Result";
        saveButton.disabled = false;
    }
}

async function viewLedger() {
    const classSelect = document.getElementById('ResultClassSelect');
    const yearSelect = document.getElementById('ResultYearSelect');
    const examSelect = document.getElementById('ExamNameSelect');

    const classId = classSelect?.value;
    const className = classSelect?.options[classSelect.selectedIndex]?.text || '';
    const selectedYear = yearSelect?.value || '';
    const selectedExam = examSelect?.value?.trim() || '';

    if (!window.excelGrid) {
        alert("There is no active spreadsheet grid loaded to view.");
        return;
    }
    
    if (!classId || !selectedYear || selectedYear === "Select Year" || !selectedExam) {
        alert("Please select Class, Year, and Exam Name before opening the ledger.");
        return;
    }

    showCustomDialog4(
        "Ledger Configuration", 
        "Select the display structure parameter configuration for this grade ledger compilation map:",
        "With Marks", 
        "Without Marks", 
        "Cancel",
        function() { generateLedgerInterface(true, classId, className, selectedYear, selectedExam); },
        function() { generateLedgerInterface(false, classId, className, selectedYear, selectedExam); },
        function() {}
    );
}

async function generateLedgerInterface(showObtainedMarks, classId, className, selectedYear, selectedExam) {
    let schoolName = "SCHOOL NAME", schoolAddress = "SCHOOL ADDRESS", schoolLogo = "", principalName = "Principal Name";

    try {
        const { data: schoolData, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolName', 'SchoolAddress', 'SchoolLogo', 'PrincipalName']);
        
        if (!error && schoolData) {
            schoolData.forEach(item => {
                if (item.Name === 'SchoolName') schoolName = item.Value;
                if (item.Name === 'SchoolAddress') schoolAddress = item.Value;
                if (item.Name === 'SchoolLogo') schoolLogo = item.Value;
                if (item.Name === 'PrincipalName') principalName = item.Value;
            });
        }
    } catch (err) {
        console.error("Error fetching school information for ledger:", err);
    }

    const rawRows = window.excelGrid.getJson();
    const srdValue = parseFloat(document.getElementById('schoolRunningDays')?.value) || 0;
    
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'ledgerModalOverlay';
    modalOverlay.className = 'ledger-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'ledger-modal-content';

    const controlBar = document.createElement('div');
    controlBar.className = 'ledger-control-bar';
    
    const btnDownloadPDF = document.createElement('button');
    btnDownloadPDF.className = 'ledger-btn-download';
    btnDownloadPDF.innerText = "Print / Save PDF";
    btnDownloadPDF.onclick = () => window.print();

    const btnDownloadJPG = document.createElement('button');
    btnDownloadJPG.className = 'ledger-btn-jpg';
    btnDownloadJPG.innerText = "Save as JPG Image";
    btnDownloadJPG.onclick = async () => {
        btnDownloadJPG.innerText = "Generating Image...";
        btnDownloadJPG.disabled = true;
        try {
            const printElement = document.querySelector('.ledger-print-area');
            const canvas = await html2canvas(printElement, { useCORS: true, scale: 2, backgroundColor: '#ffffff' });
            const link = document.createElement('a');
            link.download = `Ledger_${className.replace(/\s+/g, '_')}_${selectedYear}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        } catch (imageErr) {
            console.error("Failed to generate JPG canvas profile capturing file:", imageErr);
        } finally {
            btnDownloadJPG.innerText = "Save as JPG Image";
            btnDownloadJPG.disabled = false;
        }
    };

    const btnClose = document.createElement('button');
    btnClose.className = 'ledger-btn-close';
    btnClose.innerText = "Close X";
    btnClose.onclick = () => modalOverlay.remove();

    const actionGroup = document.createElement('div');
    actionGroup.appendChild(btnDownloadPDF);
    actionGroup.appendChild(btnDownloadJPG);
    controlBar.appendChild(actionGroup);
    controlBar.appendChild(btnClose);
    modalContent.appendChild(controlBar);

    const printArea = document.createElement('div');
    printArea.className = 'ledger-print-area';

    let logoHtml = schoolLogo ? `<img src="${schoolLogo}" alt="School Logo" class="ledger-header-logo" />` : `<div class="ledger-header-logo-placeholder"></div>`;
    
    printArea.innerHTML = `
        <div class="ledger-header-container">
            <div class="ledger-header-left">${logoHtml}</div>
            <div class="ledger-header-center">
                <h1>${schoolName}</h1>
                <h2>${schoolAddress}</h2>
                <h3>GRADE LEDGER</h3>
                <div class="ledger-meta-info">
                    <strong>Academic Year:</strong> ${selectedYear} &nbsp;&nbsp;|&nbsp;&nbsp; 
                    <strong>Examination:</strong> ${selectedExam} &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Class:</strong> ${className} &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>School Running Days (SRD):</strong> ${srdValue}
                </div>
            </div>
            <div class="ledger-header-right"></div>
        </div>
        <hr class="ledger-divider" />
    `;

    const tableContainer = document.createElement('div');
    tableContainer.className = 'ledger-table-wrapper';

    const table = document.createElement('table');
    table.className = 'ledger-data-table';

    const subColSpan = showObtainedMarks ? 4 : 3;
    let headerRow1 = `<tr><th rowspan="2">Roll No</th><th rowspan="2">Student's Name</th>`;
    let headerRow2 = `<tr>`;

    currentSubjects.forEach((sub) => {
        const fmValueRaw = window.excelGrid.getValueFromCoords(sub.fmIdx, 0) || 100;
        const fmDisplay = showObtainedMarks ? `<br><span class="ledger-sub-fm-label">(FM: ${fmValueRaw})</span>` : '';
        headerRow1 += `<th colspan="${subColSpan}" class="ledger-sub-group-header">${sub.name}${fmDisplay}</th>`;
        if (showObtainedMarks) { headerRow2 += `<th>OM</th>`; }
        headerRow2 += `<th>G</th><th>GP</th><th>R</th>`;
    });

    const rightSideColsCount = showObtainedMarks ? 6 : 4;
    if (showObtainedMarks) {
        headerRow1 += `<th colspan="6" class="ledger-total-group-header" style="background-color: #d1ecf1 !important; text-align: center;">Total Block</th></tr>`;
        headerRow2 += `<th style="background-color: #d1ecf1;">Total Marks</th><th style="background-color: #d1ecf1;">Marks%</th><th style="background-color: #d1ecf1;">GPA</th><th style="background-color: #d1ecf1;">Rank</th><th style="background-color: #d1ecf1;">Attendance</th><th style="background-color: #d1ecf1;">Attendance%</th></tr>`;
    } else {
        headerRow1 += `<th colspan="4" class="ledger-total-group-header" style="background-color: #d1ecf1 !important; text-align: center;">Total Block</th></tr>`;
        headerRow2 += `<th style="background-color: #d1ecf1;">GPA</th><th style="background-color: #d1ecf1;">Rank</th><th style="background-color: #d1ecf1;">Attendance</th><th style="background-color: #d1ecf1;">Attendance%</th></tr>`;
    }

    let tableHtml = `<thead>${headerRow1}${headerRow2}</thead><tbody>`;

    let subjectStats = currentSubjects.map(() => ({
        totalMarks: 0,
        countMarks: 0,
        highestGradeWeight: 0,
        highestGradeLabel: 'NG',
        gradeCounts: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'NG': 0 },
        presentCount: 0,
        absentCount: 0
    }));

    rawRows.forEach((row, idx) => {
        const rollNo = window.excelGrid.getValueFromCoords(3, idx) || row.RollNo || '';
        const name = window.excelGrid.getValueFromCoords(4, idx) || row.StudentName || '';
        
        tableHtml += `<tr><td style="text-align:center;">${rollNo}</td><td>${name}</td>`;

        currentSubjects.forEach((sub, sIdx) => {
            const om = window.excelGrid.getValueFromCoords(sub.obIdx, idx) ?? '';
            const g = (window.excelGrid.getValueFromCoords(sub.gIdx, idx) ?? '').toString().trim();
            const gp = window.excelGrid.getValueFromCoords(sub.gpIdx, idx) ?? '-';
            const r = window.excelGrid.getValueFromCoords(sub.rIdx, idx) ?? '';

            if (showObtainedMarks) { tableHtml += `<td style="text-align:center;">${om}</td>`; }
            tableHtml += `
                <td style="text-align:center; font-weight:bold;">${g}</td>
                <td style="text-align:center;">${gp}</td>
                <td style="text-align:center; color:#555;">${r}</td>
            `;

            // Updated attendance logic: If obtained mark field is blank, the student is tracked as absent. Otherwise, present.
            if (om !== undefined && om !== null && String(om).trim() !== '') {
                subjectStats[sIdx].presentCount++;
                const parsedOm = parseFloat(om);
                if (!isNaN(parsedOm)) {
                    subjectStats[sIdx].totalMarks += parsedOm;
                    subjectStats[sIdx].countMarks++;
                }
            } else {
                subjectStats[sIdx].absentCount++;
            }

            if (g && subjectStats[sIdx].gradeCounts[g] !== undefined) {
                subjectStats[sIdx].gradeCounts[g]++;
            }

            const currentWeight = GRADE_RANK_MAP[g] || 0;
            if (currentWeight > subjectStats[sIdx].highestGradeWeight) {
                subjectStats[sIdx].highestGradeWeight = currentWeight;
                subjectStats[sIdx].highestGradeLabel = g;
            }
        });

        const finalTotal = window.excelGrid.getValueFromCoords(totalMarksColIdx, idx);
        const finalMarkPct = window.excelGrid.getValueFromCoords(markPctColIdx, idx);
        const finalGPA = window.excelGrid.getValueFromCoords(gpaColIdx, idx);
        const finalRank = window.excelGrid.getValueFromCoords(rankColIdx, idx);
        const finalAtt = window.excelGrid.getValueFromCoords(attendanceColIdx, idx);
        const finalAttPct = window.excelGrid.getValueFromCoords(attendancePctColIdx, idx);

        if (showObtainedMarks) {
            tableHtml += `
                <td style="text-align:center; font-weight:bold; background-color: #f9fbfd;">${finalTotal}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalMarkPct}</td>
                <td style="text-align:center; font-weight:bold; background-color: #f9fbfd;">${finalGPA}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalRank}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalAtt}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalAttPct}</td>
            </tr>`;
        } else {
            tableHtml += `
                <td style="text-align:center; font-weight:bold; background-color: #f9fbfd;">${finalGPA}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalRank}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalAtt}</td>
                <td style="text-align:center; background-color: #f9fbfd;">${finalAttPct}</td>
            </tr>`;
        }
    });

    tableHtml += `<tr class="ledger-summary-row"><td colspan="2" style="font-weight:bold; text-align:right; background:#f1f3f5;">Average Mark Percent</td>`;
    currentSubjects.forEach((sub, sIdx) => {
        const fm = parseFloat(window.excelGrid.getValueFromCoords(sub.fmIdx, 0)) || 100;
        const avg = subjectStats[sIdx].countMarks > 0 ? (subjectStats[sIdx].totalMarks / subjectStats[sIdx].countMarks) : 0;
        const pct = fm > 0 ? ((avg / fm) * 100).toFixed(1) + '%' : '-';
        tableHtml += `<td colspan="${subColSpan}" style="text-align:center; font-weight:bold; background:#f1f3f5;">${pct}</td>`;
    });
    tableHtml += `<td colspan="${rightSideColsCount}" style="background:#f1f3f5;"></td></tr>`;

    tableHtml += `<tr class="ledger-summary-row"><td colspan="2" style="font-weight:bold; text-align:right; color:#28a745;">Highest Grade</td>`;
    currentSubjects.forEach((sub, sIdx) => {
        tableHtml += `<td colspan="${subColSpan}" style="text-align:center; color: #28a745; font-weight:bold;">${subjectStats[sIdx].highestGradeLabel || 'NG'}</td>`;
    });
    tableHtml += `<td colspan="${rightSideColsCount}"></td></tr>`;

    const targetedGradesList = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'NG'];
    targetedGradesList.forEach(gradeKey => {
        tableHtml += `<tr class="ledger-summary-row"><td colspan="2" style="font-weight:bold; text-align:right;">Count of ${gradeKey}</td>`;
        currentSubjects.forEach((sub, sIdx) => {
            const currentFrequencyCount = subjectStats[sIdx].gradeCounts[gradeKey] || 0;
            tableHtml += `<td colspan="${subColSpan}" style="text-align:center; font-weight:bold;">${currentFrequencyCount}</td>`;
        });
        tableHtml += `<td colspan="${rightSideColsCount}"></td></tr>`;
    });

    tableHtml += `<tr class="ledger-summary-row"><td colspan="2" style="font-weight:bold; text-align:right; color:#218838;">Present Students</td>`;
    currentSubjects.forEach((sub, sIdx) => {
        tableHtml += `<td colspan="${subColSpan}" style="text-align:center; font-weight:bold; color:#218838;">${subjectStats[sIdx].presentCount}</td>`;
    });
    tableHtml += `<td colspan="${rightSideColsCount}"></td></tr>`;

    tableHtml += `<tr class="ledger-summary-row"><td colspan="2" style="font-weight:bold; text-align:right; color:#c82333;">Absent Students</td>`;
    currentSubjects.forEach((sub, sIdx) => {
        tableHtml += `<td colspan="${subColSpan}" style="text-align:center; font-weight:bold; color:#c82333;">${subjectStats[sIdx].absentCount}</td>`;
    });
    tableHtml += `<td colspan="${rightSideColsCount}"></td></tr>`;

    tableHtml += `</tbody>`;
    table.innerHTML = tableHtml;
    tableContainer.appendChild(table);
    printArea.appendChild(tableContainer);

    const bottomWrapper = document.createElement('div');
    bottomWrapper.className = 'ledger-bottom-wrapper';

    const legendBlock = document.createElement('div');
    legendBlock.className = 'ledger-legend-block';
    
    let legendItems = `<strong>Key:</strong> `;
    if (showObtainedMarks) legendItems += `<span><strong>OM:</strong> Obtained Marks</span> &nbsp;&nbsp;|&nbsp;&nbsp; `;
    legendItems += `
        <span><strong>G:</strong> Grade</span> &nbsp;&nbsp;|&nbsp;&nbsp; 
        <span><strong>GP:</strong> Grade Point</span> &nbsp;&nbsp;|&nbsp;&nbsp; 
        <span><strong>R:</strong> Subject Rank</span>
    `;
    legendBlock.innerHTML = legendItems;
    bottomWrapper.appendChild(legendBlock);

    const signatureBlock = document.createElement('div');
    signatureBlock.className = 'ledger-signature-block';
    signatureBlock.innerHTML = `
        <div class="ledger-sig-line"></div>
        <div class="ledger-sig-name">${principalName}</div>
        <div class="ledger-sig-post">Principal</div>
    `;
    bottomWrapper.appendChild(signatureBlock);
    
    printArea.appendChild(bottomWrapper);
    modalContent.appendChild(printArea);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

// Helper to extract short formatted YYYY-M-D from the active Date object using calendar parameters
function getShortNepaliDate() {
    try {
        const date = new Date();
        const adYear = date.getFullYear();
        const adMonth = date.getMonth();
        const adDay = date.getDate();    
        let totalADDays = 0;    
        for (let y = REF_AD_YEAR; y < adYear; y++) {
            totalADDays += isLeapYear(y) ? 366 : 365;
        }    
        for (let m = 0; m < REF_AD_MONTH; m++) {
            totalADDays -= daysInADMonth(REF_AD_YEAR, m);
        }
        totalADDays -= REF_AD_DAY;    
        for (let m = 0; m < adMonth; m++) {
            totalADDays += daysInADMonth(adYear, m);
        }
        totalADDays += adDay;    
        let bsYear = REF_BS_YEAR;
        let bsMonth = REF_BS_MONTH;
        let bsDay = REF_BS_DAY;    
        while (totalADDays > 0) {
            const yearData = NEPALI_CALENDAR_DATA.find(data => data[0] === bsYear);
            if (!yearData) break;        
            const daysInCurrentMonth = yearData[bsMonth + 1];
            const daysRemainingInMonth = daysInCurrentMonth - bsDay + 1;        
            if (totalADDays >= daysRemainingInMonth) {
                totalADDays -= daysRemainingInMonth;
                bsDay = 1;
                bsMonth++;
                if (bsMonth >= 12) {
                    bsMonth = 0;
                    bsYear++;
                }
            } else {
                bsDay += totalADDays;
                totalADDays = 0;
            }
        }
        return `${bsYear}-${bsMonth + 1}-${bsDay}`;
    } catch(e) {
        return "2083-4-3"; // Graceful logical fallback configuration matching requested format
    }
}

async function viewGradeSheets() {
    if (!window.excelGrid) {
        alert("There is no active spreadsheet grid loaded to parse grade sheets.");
        return;
    }

    const classSelect = document.getElementById('ResultClassSelect');
    const yearSelect = document.getElementById('ResultYearSelect');
    const examSelect = document.getElementById('ExamNameSelect');

    const classId = classSelect?.value;
    const className = classSelect?.options[classSelect.selectedIndex]?.text || '';
    const selectedYear = yearSelect?.value || '';
    const selectedExam = examSelect?.value?.trim() || '';

    if (!classId || !selectedYear || selectedYear === "Select Year" || !selectedExam) {
        alert("Please confirm Class, Year, and Exam name parameters before continuing.");
        return;
    }

    // Capture standard short-style BS Date string format
    const nepaliDateStringStr = getShortNepaliDate();

    // --- 1. Query System Branding Metadata & Class Teacher Profiles ---
    let schoolName = "SCHOOL NAME", schoolAddress = "SCHOOL ADDRESS", schoolLogo = "", principalName = "Principal Name", classTeacherName = "Class Teacher";
    try {
        const { data: schoolData } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolName', 'SchoolAddress', 'SchoolLogo', 'PrincipalName']);
        
        if (schoolData) {
            schoolData.forEach(item => {
                if (item.Name === 'SchoolName') schoolName = item.Value;
                if (item.Name === 'SchoolAddress') schoolAddress = item.Value;
                if (item.Name === 'SchoolLogo') schoolLogo = item.Value;
                if (item.Name === 'PrincipalName') principalName = item.Value;
            });
        }

        const { data: classConfig } = await supabaseClient
            .from('ClassTable')
            .select('ClassTeacher')
            .eq('id', classId)
            .single();
            
        if (classConfig && classConfig.ClassTeacher) {
            classTeacherName = classConfig.ClassTeacher;
        }
    } catch (err) {
        console.error("School context acquisition structural bypass error:", err);
    }

    // --- 2. Dynamic Column Mapping Evaluation ---
    const headers = window.excelGrid.getHeaders().split(',');
    const workingDaysColIdx = headers.findIndex(h => h.trim().toLowerCase() === 'runningdays');
    const attendanceColIdx = headers.findIndex(h => h.trim().toLowerCase() === 'attendance');
    const attPercentageColIdx = headers.findIndex(h => h.trim().toLowerCase() === 'attendance%');

    const rawRows = window.excelGrid.getJson();
    let classHighestGrades = currentSubjects.map(() => ({ maxWeight: 0, label: 'NG' }));

    rawRows.forEach((row, rIdx) => {
        currentSubjects.forEach((sub, sIdx) => {
            const gradeVal = (window.excelGrid.getValueFromCoords(sub.gIdx, rIdx) || '').toString().trim();
            const currentWeight = GRADE_RANK_MAP[gradeVal] || 0;
            if (currentWeight > classHighestGrades[sIdx].maxWeight) {
                classHighestGrades[sIdx].maxWeight = currentWeight;
                classHighestGrades[sIdx].label = gradeVal;
            }
        });
    });

    // --- 3. Build Selection Screen UI Container ---
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'gsViewModalOverlay';
    modalOverlay.className = 'gs-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'gs-modal-content';

    const buildContinuousWatermark = () => {
        const segment = `${schoolName} ${schoolAddress} `.toUpperCase();
        return `<div class="gs-watermark-container">${segment.repeat(380)}</div>`;
    };

    const cleanAttendancePercent = (rawPercent) => {
        if (!rawPercent || rawPercent === '-') return '-';
        let cleanStr = rawPercent.toString().trim();
        if (cleanStr.endsWith('%')) {
            cleanStr = cleanStr.slice(0, -1).trim();
        }
        return cleanStr + '%';
    };

    const buildSubjectsTableRows = (dataIndex) => {
        let rowsHtml = '';
        currentSubjects.forEach((sub, sIdx) => {
            const chValue = window.excelGrid.getValueFromCoords(sub.chIdx, dataIndex) || '-';
            const gradeValue = window.excelGrid.getValueFromCoords(sub.gIdx, dataIndex) || '-';
            const gpValue = window.excelGrid.getValueFromCoords(sub.gpIdx, dataIndex) || '-';
            const highestGradeValue = classHighestGrades[sIdx].label || 'NG';

            rowsHtml += `
                <tr>
                    <td style="width:12%; font-family:monospace;">${String(sub.subNum || sIdx+1).padStart(4, '0')}</td>
                    <td class="sub-name" style="width:43%;">${sub.name}</td>
                    <td style="width:11%;">${chValue}</td>
                    <td style="width:11%;">${gpValue}</td>
                    <td style="width:11%;">${gradeValue}</td>
                    <td style="width:12%;">${highestGradeValue}</td>
                </tr>
            `;
        });
        return rowsHtml;
    };

    const renderSelectionInterface = () => {
        modalContent.innerHTML = '';
        
        const selectionBar = document.createElement('div');
        selectionBar.className = 'gs-control-bar';
        selectionBar.innerHTML = `<strong>Grade Sheet Batch Generator (${className})</strong>`;
        const btnClose = document.createElement('button');
        btnClose.className = 'gs-btn-close';
        btnClose.innerText = "Close X";
        btnClose.onclick = () => modalOverlay.remove();
        selectionBar.appendChild(btnClose);
        modalContent.appendChild(selectionBar);

        const selectionBody = document.createElement('div');
        selectionBody.className = 'gs-selection-body';
        selectionBody.innerHTML = `
            <p>Select targeted students for batch grade report processing:</p>
            <table class="gs-selection-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align:center;"><input type="checkbox" id="gsSelectAllCheckbox" checked /></th>
                        <th style="width: 100px;">Roll No</th>
                        <th>Student Name</th>
                    </tr>
                </thead>
                <tbody id="gsStudentSelectionTbody"></tbody>
            </table>
            <div style="margin-top: 25px; text-align: right;">
                <button id="btnCreateGradeSheets" class="gs-btn-action" style="padding: 10px 25px; font-size: 15px;">Create Grade Sheets</button>
            </div>
        `;
        modalContent.appendChild(selectionBody);

        const tbody = selectionBody.querySelector('#gsStudentSelectionTbody');
        rawRows.forEach((row, index) => {
            const rollNo = window.excelGrid.getValueFromCoords(3, index) || row.RollNo || '';
            const name = window.excelGrid.getValueFromCoords(4, index) || row.StudentName || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;"><input type="checkbox" class="gs-student-row-checkbox" data-index="${index}" checked /></td>
                <td>${rollNo}</td>
                <td>${name}</td>
            `;
            tbody.appendChild(tr);
        });

        const masterCheckbox = selectionBody.querySelector('#gsSelectAllCheckbox');
        masterCheckbox.onchange = function() {
            selectionBody.querySelectorAll('.gs-student-row-checkbox').forEach(cb => cb.checked = this.checked);
        };

        selectionBody.querySelector('#btnCreateGradeSheets').onclick = () => {
            let targetedRowIndices = [];
            selectionBody.querySelectorAll('.gs-student-row-checkbox').forEach(cb => {
                if (cb.checked) targetedRowIndices.push(parseInt(cb.getAttribute('data-index')));
            });

            if (targetedRowIndices.length === 0) {
                alert("Please select at least one student profiling profile index row.");
                return;
            }
            renderGradeSheetViewer(targetedRowIndices);
        };
    };

    const renderGradeSheetViewer = (targetIndices) => {
        let activePointer = 0;

        const loadActiveReportCard = () => {
            modalContent.innerHTML = '';
            const dataIndex = targetIndices[activePointer];
            const row = rawRows[dataIndex];

            const rollNo = window.excelGrid.getValueFromCoords(3, dataIndex) || row.RollNo || '';
            const name = window.excelGrid.getValueFromCoords(4, dataIndex) || row.StudentName || '';
            const finalGPA = window.excelGrid.getValueFromCoords(gpaColIdx, dataIndex) || '-';

            // Gather attendance stats safely
            const totalDays = workingDaysColIdx !== -1 ? (window.excelGrid.getValueFromCoords(workingDaysColIdx, dataIndex) || '-') : '-';
            const presentDays = attendanceColIdx !== -1 ? (window.excelGrid.getValueFromCoords(attendanceColIdx, dataIndex) || '-') : '-';
            const percentDays = attPercentageColIdx !== -1 ? cleanAttendancePercent(window.excelGrid.getValueFromCoords(attPercentageColIdx, dataIndex)) : '-';

            const controlBar = document.createElement('div');
            controlBar.className = 'gs-control-bar';
            
            const navigationGroup = document.createElement('div');
            const btnPrev = document.createElement('button');
            btnPrev.id = 'btnPrevious';
            btnPrev.innerText = "◀ Previous";
            btnPrev.disabled = (activePointer === 0);
            btnPrev.onclick = () => { if (activePointer > 0) { activePointer--; loadActiveReportCard(); } };

            const btnNext = document.createElement('button');
            btnNext.id = 'btnNext';
            btnNext.innerText = "Next ▶";
            btnNext.disabled = (activePointer === targetIndices.length - 1);
            btnNext.onclick = () => { if (activePointer < targetIndices.length - 1) { activePointer++; loadActiveReportCard(); } };

            const recordsCounterLabel = document.createElement('span');
            recordsCounterLabel.style.marginLeft = "12px";
            recordsCounterLabel.style.fontWeight = "bold";
            recordsCounterLabel.innerText = `${activePointer + 1} of ${targetIndices.length}`;

            navigationGroup.appendChild(btnPrev);
            navigationGroup.appendChild(btnNext);
            navigationGroup.appendChild(recordsCounterLabel);

            const utilityActionGroup = document.createElement('div');
            
            // --- SAVE AS PDF ---
            const btnSavePDF = document.createElement('button');
            btnSavePDF.id = 'btnSavePDF';
            btnSavePDF.className = 'gs-btn-action';
            btnSavePDF.innerText = "Save Checked as PDF";
            btnSavePDF.onclick = () => {
                const oldContainer = document.querySelector('.gs-batch-print-container');
                if (oldContainer) oldContainer.remove();

                const batchContainer = document.createElement('div');
                batchContainer.className = 'gs-batch-print-container';

                targetIndices.forEach(idx => {
                    const stRow = rawRows[idx];
                    const stRoll = window.excelGrid.getValueFromCoords(3, idx) || stRow.RollNo || '';
                    const stName = window.excelGrid.getValueFromCoords(4, idx) || stRow.StudentName || '';
                    const stGpa = window.excelGrid.getValueFromCoords(gpaColIdx, idx) || '-';
                    
                    const stTotalDays = workingDaysColIdx !== -1 ? (window.excelGrid.getValueFromCoords(workingDaysColIdx, idx) || '-') : '-';
                    const stPresentDays = attendanceColIdx !== -1 ? (window.excelGrid.getValueFromCoords(attendanceColIdx, idx) || '-') : '-';
                    const stPercentDays = attPercentageColIdx !== -1 ? cleanAttendancePercent(window.excelGrid.getValueFromCoords(attPercentageColIdx, idx)) : '-';

                    const printCard = document.createElement('div');
                    printCard.className = 'gs-print-area gs-batch-print-area';
                    printCard.innerHTML = `
                        ${buildContinuousWatermark()}
                        <div class="gs-container-inner">
                            <div>
                                <div class="gs-header-wrapper">
                                    ${schoolLogo ? `<img src="${schoolLogo}" class="gs-school-logo" alt="School Logo" />` : ''}
                                    <div class="gs-header-center">
                                        <h1>${schoolName}</h1>
                                        <h2>${schoolAddress}</h2>
                                        <h3>${selectedExam}, ${selectedYear}</h3>
                                        <h4>GRADE-SHEET</h4>
                                    </div>
                                </div>
                                <div class="gs-intro-text-block">
                                    <div class="gs-intro-row">
                                        <span>THE FOLLOWING ARE THE GRADE(S) SECURED BY: <span class="gs-value-highlight">${stName}</span></span>
                                    </div>
                                    <div class="gs-intro-row">
                                        <span>Roll Number: <span class="gs-value-highlight">${stRoll}</span></span>
                                        <span>Grade: <span class="gs-value-highlight">${className}</span></span>
                                    </div>
                                    <div class="gs-intro-row" style="font-size:13.5px; color:#555;">
                                        <span>School Run Days: ${stTotalDays} &nbsp;|&nbsp; Attendance: ${stPresentDays} &nbsp;|&nbsp; Attendance Rate: ${stPercentDays}</span>
                                    </div>
                                </div>
                                <table class="gs-data-table">
                                    <thead>
                                        <tr>
                                            <th>SUBJECT CODE</th>
                                            <th style="text-align: left; padding-left: 8px;">SUBJECTS</th>
                                            <th>CREDIT HOUR</th>
                                            <th>GRADE POINT</th>
                                            <th>GRADE</th>
                                            <th>HIGHEST GRADE</th>
                                        </tr>
                                    </thead>
                                    <tbody>${buildSubjectsTableRows(idx)}</tbody>
                                </table>
                                <div class="gs-gpa-display-line">
                                    Grade Point Average(GPA): ${stGpa}
                                </div>
                            </div>
                            <div class="gs-bottom-meta-row">
                                <div class="gs-sig-container">
                                    <div class="gs-sig-line"></div>
                                    <div class="gs-sig-name">${classTeacherName}</div>
                                    <div class="gs-sig-title">(Class Teacher)</div>
                                </div>
                                <div class="gs-sig-container" style="text-align: center; padding-bottom: 5px;">
                                    <div>Date: ${nepaliDateStringStr}</div>
                                </div>
                                <div class="gs-sig-container">
                                    <div class="gs-sig-line"></div>
                                    <div class="gs-sig-name">${principalName}</div>
                                    <div class="gs-sig-title">(Principal)</div>
                                </div>
                            </div>
                        </div>
                    `;
                    batchContainer.appendChild(printCard);
                });

                document.body.appendChild(batchContainer);
                setTimeout(() => {
                    window.print();
                    batchContainer.remove();
                }, 250);
            };

            // --- SAVE AS JPG (ZIP) ---
            const btnSaveJPG = document.createElement('button');
            btnSaveJPG.id = 'btnSaveJPG';
            btnSaveJPG.style.background = '#28a745';
            btnSaveJPG.style.color = '#fff';
            btnSaveJPG.style.border = 'none';
            btnSaveJPG.innerText = "Save Checked as JPG (ZIP)";
            btnSaveJPG.onclick = async () => {
                if (typeof JSZip === 'undefined') {
                    alert("The JSZip extraction library is not loaded. Please include it in your document head.");
                    return;
                }
                btnSaveJPG.innerText = "Generating ZIP...";
                btnSaveJPG.disabled = true;

                const zip = new JSZip();
                const scratchpad = document.createElement('div');
                scratchpad.style.position = 'fixed';
                scratchpad.style.left = '-9999px';
                scratchpad.style.top = '-9999px';
                document.body.appendChild(scratchpad);

                try {
                    for (let i = 0; i < targetIndices.length; i++) {
                        const idx = targetIndices[i];
                        const stRow = rawRows[idx];
                        const stRoll = window.excelGrid.getValueFromCoords(3, idx) || stRow.RollNo || '';
                        const stName = window.excelGrid.getValueFromCoords(4, idx) || stRow.StudentName || '';
                        const stGpa = window.excelGrid.getValueFromCoords(gpaColIdx, idx) || '-';
                        
                        const stTotalDays = workingDaysColIdx !== -1 ? (window.excelGrid.getValueFromCoords(workingDaysColIdx, idx) || '-') : '-';
                        const stPresentDays = attendanceColIdx !== -1 ? (window.excelGrid.getValueFromCoords(attendanceColIdx, idx) || '-') : '-';
                        const stPercentDays = attPercentageColIdx !== -1 ? cleanAttendancePercent(window.excelGrid.getValueFromCoords(attPercentageColIdx, idx)) : '-';

                        scratchpad.innerHTML = `
                            <div class="gs-print-area" style="box-shadow:none;">
                                ${buildContinuousWatermark()}
                                <div class="gs-container-inner">
                                    <div>
                                        <div class="gs-header-wrapper">
                                            ${schoolLogo ? `<img src="${schoolLogo}" class="gs-school-logo" alt="School Logo" />` : ''}
                                            <div class="gs-header-center">
                                                <h1>${schoolName}</h1>
                                                <h2>${schoolAddress}</h2>
                                                <h3>${selectedExam}, ${selectedYear}</h3>
                                                <h4>GRADE-SHEET</h4>
                                            </div>
                                        </div>
                                        <div class="gs-intro-text-block">
                                            <div class="gs-intro-row">
                                                <span>THE FOLLOWING ARE THE GRADE(S) SECURED BY: <span class="gs-value-highlight">${stName}</span></span>
                                            </div>
                                            <div class="gs-intro-row">
                                                <span>Roll Number: <span class="gs-value-highlight">${stRoll}</span></span>
                                                <span>Grade: <span class="gs-value-highlight">${className}</span></span>
                                            </div>
                                            <div class="gs-intro-row" style="font-size:13.5px; color:#555;">
                                                <span>School Run Days: ${stTotalDays} &nbsp;|&nbsp; Attendance: ${stPresentDays} &nbsp;|&nbsp; Attendance Rate: ${stPercentDays}</span>
                                            </div>
                                        </div>
                                        <table class="gs-data-table">
                                            <thead>
                                                <tr>
                                                    <th>SUBJECT CODE</th>
                                                    <th style="text-align: left; padding-left: 8px;">SUBJECTS</th>
                                                    <th>CREDIT HOUR</th>
                                                    <th>GRADE POINT</th>
                                                    <th>GRADE</th>
                                                    <th>HIGHEST GRADE</th>
                                                </tr>
                                            </thead>
                                            <tbody>${buildSubjectsTableRows(idx)}</tbody>
                                        </table>
                                        <div class="gs-gpa-display-line">
                                            Grade Point Average(GPA): ${stGpa}
                                        </div>
                                    </div>
                                    <div class="gs-bottom-meta-row">
                                        <div class="gs-sig-container">
                                            <div class="gs-sig-line"></div>
                                            <div class="gs-sig-name">${classTeacherName}</div>
                                            <div class="gs-sig-title">(Class Teacher)</div>
                                        </div>
                                        <div class="gs-sig-container" style="text-align: center; padding-bottom: 5px;">
                                            <div>Date: ${nepaliDateStringStr}</div>
                                        </div>
                                        <div class="gs-sig-container">
                                            <div class="gs-sig-line"></div>
                                            <div class="gs-sig-name">${principalName}</div>
                                            <div class="gs-sig-title">(Principal)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        const targetElement = scratchpad.firstElementChild;
                        const canvas = await html2canvas(targetElement, { useCORS: true, scale: 2, backgroundColor: '#ffffff' });
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                        const base64Data = dataUrl.split(',')[1];
                        
                        const safeFileName = `GradeSheet_Roll_${stRoll}_${stName.replace(/\s+/g, '_')}.jpg`;
                        zip.file(safeFileName, base64Data, { base64: true });
                    }

                    const zipContent = await zip.generateAsync({ type: "blob" });
                    const zipLink = document.createElement('a');
                    zipLink.download = `GradeSheets_Batch_${className.replace(/\s+/g, '_')}.zip`;
                    zipLink.href = URL.createObjectURL(zipContent);
                    zipLink.click();
                } catch (err) {
                    console.error("Batch compressed ZIP creation crash exception:", err);
                } finally {
                    scratchpad.remove();
                    btnSaveJPG.innerText = "Save Checked as JPG (ZIP)";
                    btnSaveJPG.disabled = false;
                }
            };

            const btnBackToSelection = document.createElement('button');
            btnBackToSelection.innerText = "↩ Selection Menu";
            btnBackToSelection.onclick = () => renderSelectionInterface();

            utilityActionGroup.appendChild(btnSavePDF);
            utilityActionGroup.appendChild(btnSaveJPG);
            utilityActionGroup.appendChild(btnBackToSelection);

            controlBar.appendChild(navigationGroup);
            controlBar.appendChild(utilityActionGroup);
            modalContent.appendChild(controlBar);

            const printWrapper = document.createElement('div');
            printWrapper.className = 'gs-print-wrapper';

            const printArea = document.createElement('div');
            printArea.className = 'gs-print-area';

            printArea.innerHTML = `
                ${buildContinuousWatermark()}
                <div class="gs-container-inner">
                    <div>
                        <div class="gs-header-wrapper">
                            ${schoolLogo ? `<img src="${schoolLogo}" class="gs-school-logo" alt="School Logo" />` : ''}
                            <div class="gs-header-center">
                                <h1>${schoolName}</h1>
                                <h2>${schoolAddress}</h2>
                                <h3>${selectedExam}, ${selectedYear}</h3>
                                <h4>GRADE-SHEET</h4>
                            </div>
                        </div>
                        
                        <div class="gs-intro-text-block">
                            <div class="gs-intro-row">
                                <span>THE FOLLOWING ARE THE GRADE(S) SECURED BY: <span class="gs-value-highlight">${name}</span></span>
                            </div>
                            <div class="gs-intro-row">
                                <span>Roll Number: <span class="gs-value-highlight">${rollNo}</span></span>
                                <span>Grade: <span class="gs-value-highlight">${className}</span></span>
                            </div>
                            <div class="gs-intro-row" style="font-size:13.5px; color:#555;">
                                <span>School Run Days: ${totalDays} &nbsp;|&nbsp; Attendance: ${presentDays} &nbsp;|&nbsp; Attendance Rate: ${percentDays}</span>
                            </div>
                        </div>

                        <table class="gs-data-table">
                            <thead>
                                <tr>
                                    <th>SUBJECT CODE</th>
                                    <th style="text-align: left; padding-left: 8px;">SUBJECTS</th>
                                    <th>CREDIT HOUR</th>
                                    <th>GRADE POINT</th>
                                    <th>GRADE</th>
                                    <th>HIGHEST GRADE</th>
                                </tr>
                            </thead>
                            <tbody>${buildSubjectsTableRows(dataIndex)}</tbody>
                        </table>

                        <div class="gs-gpa-display-line">
                            Grade Point Average(GPA): ${finalGPA}
                        </div>
                    </div>

                    <div class="gs-bottom-meta-row">
                        <div class="gs-sig-container">
                            <div class="gs-sig-line"></div>
                            <div class="gs-sig-name">${classTeacherName}</div>
                            <div class="gs-sig-title">(Class Teacher)</div>
                        </div>
                        <div class="gs-sig-container" style="text-align: center; padding-bottom: 5px;">
                            <div>Date: ${nepaliDateStringStr}</div>
                        </div>
                        <div class="gs-sig-container">
                            <div class="gs-sig-line"></div>
                            <div class="gs-sig-name">${principalName}</div>
                            <div class="gs-sig-title">(Principal)</div>
                        </div>
                    </div>
                </div>
            `;

            printWrapper.appendChild(printArea);
            modalContent.appendChild(printWrapper);
        };

        loadActiveReportCard();
    };

    renderSelectionInterface();
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}