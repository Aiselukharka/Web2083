if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}

// Global variables
let currentADDate = new Date(); // This will track the displayed date
let adCalendarVisible = false;
let bsCalendarVisible = false;
let existingAttendance = null;
let hasAttendanceChanged = false;
let isLoadingAttendance = false;
let currentAttendanceMode = 'byName';
let currentStudents = [];
let currentClass = '';

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
        if (selectedEdit) {
            window.location.href = selectedEdit;
        }
    });
}

// -------------------- ADMIN TOOLS DROPDOWN -----------------------
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
// -------------------- DATE FUNCTIONS --------------------

// Function to get BS Year, Month, Day from AD Date
function getBSDateComponents(adDate) {
    if (typeof AD2BS !== 'function') {
        console.error('AD2BS function not available');
        return { year: 2080, month: 1, day: 1 };
    }
    
    try {
        const bsFullString = AD2BS(adDate);
        
        // Extract the Nepali date parts
        // Format: "YYYY साल Month DD गते DayName"
        const parts = bsFullString.split(' ');
        
        // Extract year (Devanagari)
        let yearStr = parts[0];
        // Convert Devanagari to English numerals
        const devanagariToEnglish = {
            '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
            '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
        };
        for (let key in devanagariToEnglish) {
            yearStr = yearStr.replace(new RegExp(key, 'g'), devanagariToEnglish[key]);
        }
        const year = parseInt(yearStr);
        
        // Extract month
        let month = 0;
        for (let i = 0; i < NEPALI_MONTHS.length; i++) {
            if (bsFullString.includes(NEPALI_MONTHS[i])) {
                month = i + 1;
                break;
            }
        }
        
        // Extract day
        let dayStr = parts[3]; // The day part before "गते"
        // Convert Devanagari to English numerals
        for (let key in devanagariToEnglish) {
            dayStr = dayStr.replace(new RegExp(key, 'g'), devanagariToEnglish[key]);
        }
        const day = parseInt(dayStr);
        
        // Extract day of week (Nepali)
        let dayOfWeek = 0;
        for (let i = 0; i < NEPALI_DAYS.length; i++) {
            if (bsFullString.includes(NEPALI_DAYS[i])) {
                dayOfWeek = i;
                break;
            }
        }
        
        return { year, month, day, dayOfWeek };
        
    } catch (error) {
        console.error('Error getting BS date components:', error);
        return { year: 2080, month: 1, day: 1, dayOfWeek: 0 };
    }
}

// Function to get BS date components for any given BS year and month
function getBSDateComponentsForMonth(bsYear, bsMonth) {
    // Find the AD date for the first day of the BS month
    const bsDateString = `${bsYear}-${String(bsMonth).padStart(2, '0')}-01`;
    try {
        const adDateString = BS2AD_YMD(bsDateString);
        const parts = adDateString.split('-').map(Number);
        const adDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const bsComponents = getBSDateComponents(adDate);
        return bsComponents;
    } catch (e) {
        console.error('Error getting BS date components for month:', e);
        return { year: bsYear, month: bsMonth, day: 1, dayOfWeek: 0 };
    }
}

// Format AD date as YYYY-MM-DD
function formatADDate(adDate) {
    const year = adDate.getFullYear();
    const month = String(adDate.getMonth() + 1).padStart(2, '0');
    const day = String(adDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Update all date displays
function updateDates() {
    // Update AD date box
    const adDateBox = document.getElementById('ADDateBox');
    if (adDateBox) {
        adDateBox.textContent = `AD: ${formatADDate(currentADDate)}`;
    }
    
    // Update BS date box
    const bsDateBox = document.getElementById('BSDateBox');
    if (bsDateBox && typeof AD2BS === 'function') {
        const bsComponents = getBSDateComponents(currentADDate);
        const bsDateString = `${bsComponents.year}-${String(bsComponents.month).padStart(2, '0')}-${String(bsComponents.day).padStart(2, '0')}`;
        bsDateBox.textContent = `BS: ${bsDateString}`;
    }
}

// Decrease date by one day
function decreaseDate() {
    currentADDate.setDate(currentADDate.getDate() - 1);
    updateDates();
    // Refresh attendance status for new date
    if (currentClass) {
        getClassID(currentClass).then(async classID => {
            if (classID) {
                await checkExistingAttendance(classID);
                renderAttendanceMode();
            }
        });
    }
}

// Update increaseDate to refresh attendance status
function increaseDate() {
    currentADDate.setDate(currentADDate.getDate() + 1);
    updateDates();
    // Refresh attendance status for new date
    if (currentClass) {
        getClassID(currentClass).then(async classID => {
            if (classID) {
                await checkExistingAttendance(classID);
                renderAttendanceMode();
            }
        });
    }
}

// Update goToToday to refresh attendance status
function goToToday() {
    currentADDate = new Date();
    updateDates();
    // Refresh attendance status for today
    if (currentClass) {
        getClassID(currentClass).then(async classID => {
            if (classID) {
                await checkExistingAttendance(classID);
                renderAttendanceMode();
            }
        });
    }
}

// Initialize dates
function initializeDates() {
    // Set current date to today
    currentADDate = new Date();
    updateDates();
}

// -------------------- CALENDAR FUNCTIONS --------------------

// Create AD Calendar Popup
function openADCalendar() {
    // Remove existing calendar if any
    const existingCal = document.getElementById('adCalendarPopup');
    if (existingCal) {
        existingCal.remove();
        adCalendarVisible = false;
        return;
    }
    
    adCalendarVisible = true;
    
    const popup = document.createElement('div');
    popup.id = 'adCalendarPopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #333;
        border-radius: 10px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        min-width: 300px;
        background: #fff;
    `;
    
    // Prevent clicks inside popup from closing it
    popup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    renderADCalendar(popup);
    document.body.appendChild(popup);
}

// Render AD Calendar
function renderADCalendar(popup) {
    const year = currentADDate.getFullYear();
    const month = currentADDate.getMonth();
    
    let html = `
        <div style="text-align: center; margin-bottom: 15px;">
            <button onclick="event.stopPropagation(); changeADMonth(-1);" style="padding: 5px 15px; margin: 0 10px; cursor: pointer; font-size: 18px;">&lt;</button>
            <span style="font-size: 20px; font-weight: bold;">${ENGLISH_MONTHS[month]} ${year}</span>
            <button onclick="event.stopPropagation(); changeADMonth(1);" style="padding: 5px 15px; margin: 0 10px; cursor: pointer; font-size: 18px;">&gt;</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">
    `;
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach((day, index) => {
        const isWeekend = (index === 0 || index === 6);
        html += `<div style="font-weight: bold; padding: 5px; color: ${isWeekend ? '#dc3545' : '#333'};">${day}</div>`;
    });
    
    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div></div>`;
    }
    
    // Days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(year, month, i);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const isToday = (year === today.getFullYear() && month === today.getMonth() && i === today.getDate());
        const isSelected = (year === currentADDate.getFullYear() && month === currentADDate.getMonth() && i === currentADDate.getDate());
        html += `
            <div onclick="event.stopPropagation(); selectADDate(${year}, ${month}, ${i})" 
                 style="padding: 8px; cursor: pointer; border-radius: 5px;
                        ${isSelected ? 'background: #007bff; color: white;' : ''}
                        ${isToday && !isSelected ? 'border: 2px solid #007bff;' : ''}
                        ${!isSelected ? 'hover:background: #f0f0f0;' : ''}
                        ${!isSelected && isWeekend ? 'color: #dc3545;' : ''}
                        ${!isSelected && !isWeekend ? 'color: #333;' : ''}">
                ${i}
            </div>
        `;
    }
    
    html += `</div>
        <div style="text-align: center; margin-top: 15px;">
            <button onclick="event.stopPropagation(); closeADCalendar();" style="padding: 8px 20px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 5px; font-size: 16px;">Close</button>
        </div>
    `;
    
    popup.innerHTML = html;
}

// Change AD month in calendar
function changeADMonth(delta) {
    const newDate = new Date(currentADDate);
    newDate.setMonth(newDate.getMonth() + delta);
    currentADDate = newDate;
    updateDates();
    
    // Re-render the calendar
    const popup = document.getElementById('adCalendarPopup');
    if (popup) {
        renderADCalendar(popup);
    }
}

// Select AD date from calendar
function selectADDate(year, month, day) {
    currentADDate = new Date(year, month, day);
    updateDates();
    closeADCalendar();
}

// Close AD calendar
function closeADCalendar() {
    const popup = document.getElementById('adCalendarPopup');
    if (popup) {
        popup.remove();
        adCalendarVisible = false;
    }
}

// Create BS Calendar Popup
function openBSCalendar() {
    // Remove existing calendar if any
    const existingCal = document.getElementById('bsCalendarPopup');
    if (existingCal) {
        existingCal.remove();
        bsCalendarVisible = false;
        return;
    }
    
    bsCalendarVisible = true;
    
    const popup = document.createElement('div');
    popup.id = 'bsCalendarPopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #333;
        border-radius: 10px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        min-width: 300px;
        background: #fff;
    `;
    
    // Prevent clicks inside popup from closing it
    popup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    renderBSCalendar(popup);
    document.body.appendChild(popup);
}

// Render BS Calendar
function renderBSCalendar(popup) {
    const bsComponents = getBSDateComponents(currentADDate);
    const bsYear = bsComponents.year;
    const bsMonth = bsComponents.month;
    
    // Get days in BS month
    const yearData = NEPALI_CALENDAR_DATA.find(data => data[0] === bsYear);
    const daysInMonth = yearData ? yearData[bsMonth] : 30;
    
    // Get the day of week for the first day of the BS month
    const firstDayComponents = getBSDateComponentsForMonth(bsYear, bsMonth);
    const firstDayOfWeek = firstDayComponents.dayOfWeek;
    
    let html = `
        <div style="text-align: center; margin-bottom: 15px;">
            <button onclick="event.stopPropagation(); changeBSMonth(-1);" style="padding: 5px 15px; margin: 0 10px; cursor: pointer; font-size: 18px;">&lt;</button>
            <span style="font-size: 20px; font-weight: bold;">${NEPALI_MONTHS[bsMonth - 1]} ${bsYear}</span>
            <button onclick="event.stopPropagation(); changeBSMonth(1);" style="padding: 5px 15px; margin: 0 10px; cursor: pointer; font-size: 18px;">&gt;</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">
    `;
    
    // Day headers in Nepali with weekend days in red
    const bsDayHeaders = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
    bsDayHeaders.forEach((day, index) => {
        // Sunday (index 0) and Saturday (index 6) are weekends
        const isWeekend = (index === 0 || index === 6);
        html += `<div style="font-weight: bold; padding: 5px; color: ${isWeekend ? '#dc3545' : '#333'};">${day}</div>`;
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += `<div></div>`;
    }
    
    // Days
    const currentDay = bsComponents.day;
    for (let i = 1; i <= daysInMonth; i++) {
        // Calculate day of week for this specific day
        const dayOfWeek = (firstDayOfWeek + i - 1) % 7;
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const isSelected = (i === currentDay);
        html += `
            <div onclick="event.stopPropagation(); selectBSDate(${bsYear}, ${bsMonth}, ${i})" 
                 style="padding: 8px; cursor: pointer; border-radius: 5px;
                        ${isSelected ? 'background: #28a745; color: white;' : ''}
                        ${!isSelected && isWeekend ? 'color: #dc3545;' : ''}
                        ${!isSelected && !isWeekend ? 'color: #333;' : ''}
                        ${!isSelected ? 'hover:background: #f0f0f0;' : ''}">
                ${i}
            </div>
        `;
    }
    
    html += `</div>
        <div style="text-align: center; margin-top: 15px;">
            <button onclick="event.stopPropagation(); closeBSCalendar();" style="padding: 8px 20px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 5px; font-size: 16px;">Close</button>
        </div>
    `;
    
    popup.innerHTML = html;
}

// Change BS month in calendar
function changeBSMonth(delta) {
    const bsComponents = getBSDateComponents(currentADDate);
    let bsYear = bsComponents.year;
    let bsMonth = bsComponents.month + delta;
    
    if (bsMonth > 12) {
        bsMonth = 1;
        bsYear++;
    } else if (bsMonth < 1) {
        bsMonth = 12;
        bsYear--;
    }
    
    // Convert BS to AD and update
    const bsDateString = `${bsYear}-${String(bsMonth).padStart(2, '0')}-01`;
    try {
        // Use the existing BS2AD_YMD function
        const adDateString = BS2AD_YMD(bsDateString);
        const parts = adDateString.split('-').map(Number);
        currentADDate = new Date(parts[0], parts[1] - 1, parts[2]);
        updateDates();
        
        // Re-render the calendar
        const popup = document.getElementById('bsCalendarPopup');
        if (popup) {
            renderBSCalendar(popup);
        }
    } catch (e) {
        console.error('Error changing BS month:', e);
    }
}

// Select BS date from calendar
function selectBSDate(year, month, day) {
    const bsDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
        // Use the existing BS2AD_YMD function
        const adDateString = BS2AD_YMD(bsDateString);
        const parts = adDateString.split('-').map(Number);
        currentADDate = new Date(parts[0], parts[1] - 1, parts[2]);
        updateDates();
        closeBSCalendar();
    } catch (e) {
        console.error('Error selecting BS date:', e);
    }
}

// Close BS calendar
function closeBSCalendar() {
    const popup = document.getElementById('bsCalendarPopup');
    if (popup) {
        popup.remove();
        bsCalendarVisible = false;
    }
}

// Close calendars when clicking outside
document.addEventListener('click', function(e) {
    const adPopup = document.getElementById('adCalendarPopup');
    const bsPopup = document.getElementById('bsCalendarPopup');
    
    if (adPopup && !adPopup.contains(e.target) && e.target.id !== 'ADDateBox') {
        if (!e.target.closest('#adCalendarPopup')) {
            adPopup.remove();
            adCalendarVisible = false;
        }
    }
    if (bsPopup && !bsPopup.contains(e.target) && e.target.id !== 'BSDateBox') {
        if (!e.target.closest('#bsCalendarPopup')) {
            bsPopup.remove();
            bsCalendarVisible = false;
        }
    }
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

async function loadClasses() {
    const select = document.getElementById("AttendanceClassSelec");
    select.innerHTML = `<option value="" disabled selected>Select Class</option>`;
    
    try {
        const { data, error } = await supabaseClient
            .from("ClassTable")
            .select("ClassName")
            .order("SortOrder");
            
        if (error) {
            console.error('Error loading classes:', error);
            select.innerHTML = `<option value="" disabled selected>Error Loading Classes</option>`;
            return;
        }
        
        if (data && data.length > 0) {
            data.forEach(row => {
                const option = document.createElement("option");
                option.value = row.ClassName;
                option.textContent = row.ClassName;
                select.appendChild(option);
            });
            
            // Add change event listener
            select.addEventListener('change', function() {
                const selectedValue = this.value;
                if (selectedValue && selectedValue !== '' && selectedValue !== 'Select Class' && selectedValue !== 'Error Loading Classes') {
                    loadStudentsForAttendance(selectedValue);
                } else {
                    document.getElementById('AttendanceBox').innerHTML = '';
                    currentClass = '';
                }
            });
        } else {
            select.innerHTML = `<option value="" disabled selected>No Classes Found</option>`;
        }
    } catch (error) {
        console.error('Error in loadClasses:', error);
        select.innerHTML = `<option value="" disabled selected>Error Loading Classes</option>`;
    }
}

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", async () => {
    loadDynamicLogoAndFavicon();
    loadClasses();
    initializeDates();
    
    // DateBox - Keep the existing code as is
    const dateBox = document.getElementById('DateBox');
    if (dateBox && typeof AD2BS === 'function') {
        dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";
    }
    
    // Add click event listeners to date boxes
    const adDateBox = document.getElementById('ADDateBox');
    const bsDateBox = document.getElementById('BSDateBox');
    
    if (adDateBox) {
        adDateBox.style.cursor = 'pointer';
        adDateBox.addEventListener('click', openADCalendar);
    }
    if (bsDateBox) {
        bsDateBox.style.cursor = 'pointer';
        bsDateBox.addEventListener('click', openBSCalendar);
    }
});

// Make functions globally available for onclick attributes
window.decreaseDate = decreaseDate;
window.increaseDate = increaseDate;
window.goToToday = goToToday;
window.openADCalendar = openADCalendar;
window.openBSCalendar = openBSCalendar;
window.changeADMonth = changeADMonth;
window.changeBSMonth = changeBSMonth;
window.selectADDate = selectADDate;
window.selectBSDate = selectBSDate;
window.closeADCalendar = closeADCalendar;
window.closeBSCalendar = closeBSCalendar;

function takeAttendanceByName() {
    setActiveButton('btnByName');
    currentAttendanceMode = 'byName';
    renderAttendanceMode();
    console.log("Taking attendance by names...");
}

function takeAttendanceByRollNumber() {
    setActiveButton('btnByRollNumber');
    currentAttendanceMode = 'byRollNumber';
    renderAttendanceMode();
    console.log("Taking attendance by roll numbers...");
}

function showAttendance() {
    setActiveButton('btnShowAttendance');
    
}

function setActiveButton(activeId) {
    const targetIds = ['btnByName', 'btnByRollNumber', 'btnShowAttendance'];
    
    targetIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('SelectedClasses');
            btn.blur(); 
        }
    });        
    
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) {
        activeBtn.classList.add('SelectedClasses');
    } else {
        console.error("Could not find button with ID: " + activeId);
    }
}

// -------------------- ATTENDANCE FUNCTIONS --------------------
// Load students when class is selected
async function loadStudentsForAttendance(className) {
    if (!className || className === '' || className === 'Select Class' || className === 'No Classes Found') {
        document.getElementById('AttendanceBox').innerHTML = '';
        currentClass = '';
        existingAttendance = null;
        return;
    }
    
    currentClass = className;
    isLoadingAttendance = true;
    
    try {
        // Get ClassID
        const { data: classData, error: classError } = await supabaseClient
            .from('ClassTable')
            .select('id')
            .eq('ClassName', className)
            .maybeSingle();
            
        if (classError || !classData) {
            console.error('Error fetching class:', classError);
            isLoadingAttendance = false;
            return;
        }
        
        // Get students
        const { data: students, error: studentError } = await supabaseClient
            .from('StudentDataTable')
            .select('id, RollNo, StudentName')
            .eq('ClassID', classData.id)
            .order('RollNo');
            
        if (studentError) {
            console.error('Error fetching students:', studentError);
            isLoadingAttendance = false;
            return;
        }
        
        currentStudents = students || [];
        
        // Check existing attendance
        await checkExistingAttendance(classData.id);
        
        isLoadingAttendance = false;
        renderAttendanceMode();
        
    } catch (error) {
        console.error('Error loading students:', error);
        isLoadingAttendance = false;
    }
}

// Render attendance based on current mode
function renderAttendanceMode() {
    const attendanceBox = document.getElementById('AttendanceBox');
    if (!attendanceBox) return;
    
    if (currentAttendanceMode === 'byName') {
        renderByName(attendanceBox);
    } else {
        renderByRollNumber(attendanceBox);
    }
}

// Render "By Names" mode with Present and Leave checkboxes
function renderByName(container) {
    if (!currentStudents || currentStudents.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No students found in this class</div>';
        return;
    }
    
    // Create status message div if it doesn't exist
    let statusDiv = document.getElementById('attendanceStatusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'attendanceStatusMessage';
        container.parentNode.insertBefore(statusDiv, container);
    }
    updateStatusMessage();
    
    let html = `
        <div style="display: grid; grid-template-columns: 60px 80px 1fr 80px 80px; gap: 5px; padding: 10px; border-bottom: 2px solid #333; font-weight: bold; background: #f0f0f0; position: sticky; top: 0; z-index: 10;">
            <div>S.No.</div>
            <div>Roll No.</div>
            <div>Student Name</div>
            <div style="text-align: center;">
                <input type="checkbox" id="selectAllPresent" onchange="toggleAllPresent()" style="width: 16px; height: 16px; cursor: pointer;">
                <div style="font-size: 11px;">Present</div>
            </div>
            <div style="text-align: center;">
                <input type="checkbox" id="selectAllLeave" onchange="toggleAllLeave()" style="width: 16px; height: 16px; cursor: pointer;">
                <div style="font-size: 11px;">Leave</div>
            </div>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
    `;
    
    console.log('Existing attendance data:', existingAttendance); // Debug log
    
    currentStudents.forEach((student, index) => {
        let isPresent = false;
        let isLeave = false;
        
        // Check existing attendance for this student
        if (existingAttendance && existingAttendance.length > 0) {
            // FIX: Convert both to string or both to number for comparison
            const record = existingAttendance.find(r => String(r.RollNumber) === String(student.RollNo));
            if (record) {
                isPresent = (record.AttendanceStatus === 'present');
                isLeave = (record.AttendanceStatus === 'leave');
                console.log(`Student ${student.RollNo}: ${record.AttendanceStatus}`); // Debug log
            }
        }
        
        html += `
            <div style="display: grid; grid-template-columns: 60px 80px 1fr 80px 80px; gap: 5px; padding: 8px 10px; border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                <div style="display: flex; align-items: center;">${index + 1}</div>
                <div style="display: flex; align-items: center;">${student.RollNo}</div>
                <div style="display: flex; align-items: center;">${student.StudentName}</div>
                <div style="display: flex; justify-content: center; align-items: center;">
                    <input type="checkbox" class="present-checkbox" data-roll="${student.RollNo}" 
                           ${isPresent ? 'checked' : ''}
                           onchange="handlePresentCheck(this)" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
                <div style="display: flex; justify-content: center; align-items: center;">
                    <input type="checkbox" class="leave-checkbox" data-roll="${student.RollNo}" 
                           ${isLeave ? 'checked' : ''}
                           onchange="handleLeaveCheck(this)" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Show or hide submit button based on whether attendance exists
    if (existingAttendance && existingAttendance.length > 0) {
        hasAttendanceChanged = false;
        document.getElementById('btnSubmitAttendance').style.display = 'none';
    } else {
        document.getElementById('btnSubmitAttendance').style.display = 'block';
    }
}

// SINGLE Render "By Roll Numbers" mode - FIXED
function renderByRollNumber(container) {
    if (!currentStudents || currentStudents.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No students found in this class</div>';
        return;
    }
    
    // Create status message div if it doesn't exist
    let statusDiv = document.getElementById('attendanceStatusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'attendanceStatusMessage';
        container.parentNode.insertBefore(statusDiv, container);
    }
    updateStatusMessage();
    
    console.log('Existing attendance data:', existingAttendance); // Debug log
    
    // Get existing attendance - FIX: Use string comparison
    const presentRolls = [];
    const leaveRolls = [];
    const availableRolls = [];
    
    // Separate students based on existing attendance
    currentStudents.forEach(student => {
        let found = false;
        if (existingAttendance && existingAttendance.length > 0) {
            // FIX: Convert both to string or both to number for comparison
            const record = existingAttendance.find(r => String(r.RollNumber) === String(student.RollNo));
            if (record) {
                found = true;
                if (record.AttendanceStatus === 'present') {
                    presentRolls.push(student.RollNo);
                } else if (record.AttendanceStatus === 'leave') {
                    leaveRolls.push(student.RollNo);
                } else {
                    availableRolls.push(student.RollNo);
                }
            }
        }
        if (!found) {
            availableRolls.push(student.RollNo);
        }
    });
    
    console.log('Present Rolls:', presentRolls); // Debug log
    console.log('Leave Rolls:', leaveRolls); // Debug log
    
    let html = `
        <div style="display: flex; flex-direction: column; gap: 15px; padding: 10px;">
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <input type="checkbox" id="selectAllPresentRolls" onchange="toggleAllPresentRolls()" style="width: 18px; height: 18px; cursor: pointer;">
                        <div style="font-weight: bold; color: #28a745;">Present Roll Numbers</div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 2px solid #28a745; border-radius: 5px; min-height: 60px; background: #f8fff8;" id="presentInputContainer">
    `;
    
    if (presentRolls.length > 0) {
        presentRolls.forEach(roll => {
            html += `
                <span class="present-chip" data-roll="${roll}" 
                      style="display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 15px; font-size: 14px; border: 1px solid #1e7e34; cursor: pointer; transition: all 0.2s;"
                      onclick="removeFromPresent(${roll})"
                      onmouseover="this.style.background='#1e7e34'"
                      onmouseout="this.style.background='#28a745'">
                    ${roll}
                </span>
            `;
        });
    } else {
        html += `<div style="width: 100%; font-size: 12px; color: #999; text-align: center;">Click on a roll number below to mark as Present</div>`;
    }
    
    html += `
                    </div>
                </div>
                <div style="flex: 1; min-width: 300px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <input type="checkbox" id="selectAllLeaveRolls" onchange="toggleAllLeaveRolls()" style="width: 18px; height: 18px; cursor: pointer;">
                        <div style="font-weight: bold; color: #dc3545;">Leave Roll Numbers</div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 2px solid #dc3545; border-radius: 5px; min-height: 60px; background: #fff8f8;" id="leaveInputContainer">
    `;
    
    if (leaveRolls.length > 0) {
        leaveRolls.forEach(roll => {
            html += `
                <span class="leave-chip" data-roll="${roll}" 
                      style="display: inline-block; padding: 5px 15px; background: #dc3545; color: white; border-radius: 15px; font-size: 14px; border: 1px solid #bd2130; cursor: pointer; transition: all 0.2s;"
                      onclick="removeFromLeave(${roll})"
                      onmouseover="this.style.background='#bd2130'"
                      onmouseout="this.style.background='#dc3545'">
                    ${roll}
                </span>
            `;
        });
    } else {
        html += `<div style="width: 100%; font-size: 12px; color: #999; text-align: center;">Click on a roll number below to mark as Leave</div>`;
    }
    
    html += `
                    </div>
                </div>
            </div>
            <div>
                <div style="font-weight: bold; color: #666; margin-bottom: 8px;">Available Roll Numbers</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; background: #f0f0f0; border-radius: 5px; min-height: 40px; border: 1px solid #ccc;" id="availableRollsContainer">
    `;
    
    if (availableRolls.length > 0) {
        availableRolls.forEach(roll => {
            html += `
                <span class="roll-chip" data-roll="${roll}" 
                      style="display: inline-block; padding: 5px 15px; background: #e9ecef; border-radius: 15px; font-size: 14px; color: #333; border: 1px solid #ccc; cursor: pointer; transition: all 0.2s; position: relative;"
                      onclick="handleRollClick(${roll})"
                      oncontextmenu="handleRollRightClick(event, ${roll})"
                      onmouseover="this.style.background='#d4d8dd'"
                      onmouseout="this.style.background='#e9ecef'"
                      title="Left-click: Present | Right-click: Leave">
                    ${roll}
                    <span style="font-size: 10px; margin-left: 5px; color: #666;">(L/R)</span>
                </span>
            `;
        });
    } else {
        html += `<div style="width: 100%; font-size: 12px; color: #999; text-align: center;">No roll numbers available</div>`;
    }
    
    html += `
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 5px; display: flex; gap: 20px; flex-wrap: wrap;">
                    <span><span style="color: #28a745; font-weight: bold;">●</span> Left-click = Present</span>
                    <span><span style="color: #dc3545; font-weight: bold;">●</span> Right-click = Leave</span>
                    <span><span style="color: #666; font-weight: bold;">●</span> Click on chip in Present/Leave to remove</span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Show or hide submit button based on whether attendance exists
    if (existingAttendance && existingAttendance.length > 0) {
        hasAttendanceChanged = false;
        document.getElementById('btnSubmitAttendance').style.display = 'none';
    } else {
        document.getElementById('btnSubmitAttendance').style.display = 'block';
    }
}

// Toggle all Present checkboxes
function toggleAllPresent() {
    const selectAll = document.getElementById('selectAllPresent');
    const checkboxes = document.querySelectorAll('.present-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
        if (selectAll.checked) {
            const rollNo = checkbox.getAttribute('data-roll');
            const leaveCheckbox = document.querySelector(`.leave-checkbox[data-roll="${rollNo}"]`);
            if (leaveCheckbox) leaveCheckbox.checked = false;
        }
    });
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Toggle all Leave
function toggleAllLeave() {
    const selectAll = document.getElementById('selectAllLeave');
    const checkboxes = document.querySelectorAll('.leave-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
        if (selectAll.checked) {
            const rollNo = checkbox.getAttribute('data-roll');
            const presentCheckbox = document.querySelector(`.present-checkbox[data-roll="${rollNo}"]`);
            if (presentCheckbox) presentCheckbox.checked = false;
        }
    });
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Handle Present checkbox change (uncheck Leave if Present is checked)
function handlePresentCheck(checkbox) {
    const rollNo = checkbox.getAttribute('data-roll');
    const leaveCheckbox = document.querySelector(`.leave-checkbox[data-roll="${rollNo}"]`);
    if (checkbox.checked && leaveCheckbox) {
        leaveCheckbox.checked = false;
    }
    updateSelectAllState();
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Handle Leave checkbox change (uncheck Present if Leave is checked)
function handleLeaveCheck(checkbox) {
    const rollNo = checkbox.getAttribute('data-roll');
    const presentCheckbox = document.querySelector(`.present-checkbox[data-roll="${rollNo}"]`);
    if (checkbox.checked && presentCheckbox) {
        presentCheckbox.checked = false;
    }
    updateSelectAllState();
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Update select all checkboxes state
function updateSelectAllState() {
    const presentCheckboxes = document.querySelectorAll('.present-checkbox');
    const leaveCheckboxes = document.querySelectorAll('.leave-checkbox');
    const selectAllPresent = document.getElementById('selectAllPresent');
    const selectAllLeave = document.getElementById('selectAllLeave');
    
    if (selectAllPresent && presentCheckboxes.length > 0) {
        const allChecked = Array.from(presentCheckboxes).every(cb => cb.checked);
        selectAllPresent.checked = allChecked;
    }
    if (selectAllLeave && leaveCheckboxes.length > 0) {
        const allChecked = Array.from(leaveCheckboxes).every(cb => cb.checked);
        selectAllLeave.checked = allChecked;
    }
}

// Handle left click on roll number - add to Present
function handleRollClick(roll) {
    addRollToPresent(roll);
}

// Handle roll right click - Add to Leave
function handleRollRightClick(event, roll) {
    event.preventDefault();
    addRollToLeave(roll);
    return false;
}

// Handle double click on roll number - add to Leave
function handleRollDoubleClick(roll) {
    addRollToLeave(roll);
}

// Toggle all Present roll numbers
function toggleAllPresentRolls() {
    const selectAll = document.getElementById('selectAllPresentRolls');
    if (!selectAll) return;
    const container = document.getElementById('presentInputContainer');
    if (!container) return;
    if (selectAll.checked) {
        const availableChips = document.querySelectorAll('.roll-chip:not([style*="display: none"])');
        availableChips.forEach(chip => {
            const roll = parseInt(chip.getAttribute('data-roll'));
            addRollToPresent(roll);
        });
    } else {
        const presentChips = container.querySelectorAll('[data-roll]');
        presentChips.forEach(chip => {
            const roll = parseInt(chip.getAttribute('data-roll'));
            removeFromPresent(roll);
        });
    }
}

// Toggle all Leave Rolls
function toggleAllLeaveRolls() {
    const selectAll = document.getElementById('selectAllLeaveRolls');
    if (!selectAll) return;
    const container = document.getElementById('leaveInputContainer');
    if (!container) return;
    if (selectAll.checked) {
        const availableChips = document.querySelectorAll('.roll-chip:not([style*="display: none"])');
        availableChips.forEach(chip => {
            const roll = parseInt(chip.getAttribute('data-roll'));
            addRollToLeave(roll);
        });
    } else {
        const leaveChips = container.querySelectorAll('[data-roll]');
        leaveChips.forEach(chip => {
            const roll = parseInt(chip.getAttribute('data-roll'));
            removeFromLeave(roll);
        });
    }
}

// Add roll number to Present
function addRollToPresent(roll) {
    removeFromAvailable(roll);
    removeFromLeave(roll);
    addToPresent(roll);
    updateAvailableRolls();
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Add roll to Leave
function addRollToLeave(roll) {
    removeFromAvailable(roll);
    removeFromPresent(roll);
    addToLeave(roll);
    updateAvailableRolls();
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Remove roll from Present
function removeFromPresent(roll) {
    const container = document.getElementById('presentInputContainer');
    if (!container) return;
    const chip = container.querySelector(`[data-roll="${roll}"]`);
    if (chip) chip.remove();
    if (container.children.length === 0) {
        container.innerHTML = '<div style="width: 100%; font-size: 12px; color: #999; text-align: center;">Click on a roll number below to mark as Present</div>';
    }
    addToAvailable(roll);
    updateAvailableRolls();
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Remove from Leave
function removeFromLeave(roll) {
    const container = document.getElementById('leaveInputContainer');
    if (!container) return;
    const chip = container.querySelector(`[data-roll="${roll}"]`);
    if (chip) chip.remove();
    if (container.children.length === 0) {
        container.innerHTML = '<div style="width: 100%; font-size: 12px; color: #999; text-align: center;">Click on a roll number below to mark as Leave</div>';
    }
    addToAvailable(roll);
    updateAvailableRolls();
    hasAttendanceChanged = true;
    document.getElementById('btnSubmitAttendance').style.display = 'block';
}

// Update select all checkboxes state
function updateSelectAllRollsState() {
    const presentContainer = document.getElementById('presentInputContainer');
    const leaveContainer = document.getElementById('leaveInputContainer');
    const selectAllPresent = document.getElementById('selectAllPresentRolls');
    const selectAllLeave = document.getElementById('selectAllLeaveRolls');
    
    // Get visible available chips
    const availableChips = document.querySelectorAll('.roll-chip:not([style*="display: none"])');
    
    if (selectAllPresent && presentContainer) {
        const presentChips = presentContainer.querySelectorAll('[data-roll]');
        selectAllPresent.checked = (availableChips.length === 0 && presentChips.length > 0);
    }
    
    if (selectAllLeave && leaveContainer) {
        const leaveChips = leaveContainer.querySelectorAll('[data-roll]');
        selectAllLeave.checked = (availableChips.length === 0 && leaveChips.length > 0);
    }
}

// Add roll to Present container
function addToPresent(roll) {
    const container = document.getElementById('presentInputContainer');
    if (!container) return;
    if (container.children.length === 1) {
        const firstChild = container.children[0];
        if (firstChild && firstChild.textContent && firstChild.textContent.includes('Click on a roll number')) {
            container.innerHTML = '';
        }
    }
    const existing = container.querySelector(`[data-roll="${roll}"]`);
    if (existing) return;
    const chip = document.createElement('span');
    chip.setAttribute('data-roll', roll);
    chip.className = 'present-chip';
    chip.style.cssText = `
        display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 15px; font-size: 14px; border: 1px solid #1e7e34; cursor: pointer; transition: all 0.2s;
    `;
    chip.textContent = roll;
    chip.onclick = function() { removeFromPresent(roll); };
    chip.onmouseover = function() { this.style.background = '#1e7e34'; };
    chip.onmouseout = function() { this.style.background = '#28a745'; };
    container.appendChild(chip);
}

// Add to Leave container
function addToLeave(roll) {
    const container = document.getElementById('leaveInputContainer');
    if (!container) return;
    if (container.children.length === 1) {
        const firstChild = container.children[0];
        if (firstChild && firstChild.textContent && firstChild.textContent.includes('Click on a roll number')) {
            container.innerHTML = '';
        }
    }
    const existing = container.querySelector(`[data-roll="${roll}"]`);
    if (existing) return;
    const chip = document.createElement('span');
    chip.setAttribute('data-roll', roll);
    chip.className = 'leave-chip';
    chip.style.cssText = `
        display: inline-block; padding: 5px 15px; background: #dc3545; color: white; border-radius: 15px; font-size: 14px; border: 1px solid #bd2130; cursor: pointer; transition: all 0.2s;
    `;
    chip.textContent = roll;
    chip.onclick = function() { removeFromLeave(roll); };
    chip.onmouseover = function() { this.style.background = '#bd2130'; };
    chip.onmouseout = function() { this.style.background = '#dc3545'; };
    container.appendChild(chip);
}

// Add roll back to Available list
function addToAvailable(roll) {
    const container = document.getElementById('availableRollsContainer');
    if (!container) return;
    const existing = container.querySelector(`.roll-chip[data-roll="${roll}"]`);
    if (existing) {
        existing.style.display = 'inline-block';
        return;
    }
    const chip = document.createElement('span');
    chip.setAttribute('data-roll', roll);
    chip.className = 'roll-chip';
    chip.style.cssText = `
        display: inline-block; padding: 5px 15px; background: #e9ecef; border-radius: 15px; font-size: 14px; color: #333; border: 1px solid #ccc; cursor: pointer; transition: all 0.2s; position: relative;
    `;
    chip.innerHTML = `${roll} <span style="font-size: 10px; margin-left: 5px; color: #666;">(L/R)</span>`;
    chip.onclick = function() { handleRollClick(roll); };
    chip.oncontextmenu = function(event) { handleRollRightClick(event, roll); };
    chip.onmouseover = function() { this.style.background = '#d4d8dd'; };
    chip.onmouseout = function() { this.style.background = '#e9ecef'; };
    chip.title = 'Left-click: Present | Right-click: Leave';
    container.appendChild(chip);
}

// Remove roll from available list
function removeFromAvailable(roll) {
    const container = document.getElementById('availableRollsContainer');
    if (!container) return;
    const chip = container.querySelector(`.roll-chip[data-roll="${roll}"]`);
    if (chip) chip.style.display = 'none';
}

// Update available rolls visibility
function updateAvailableRolls() {
    const container = document.getElementById('availableRollsContainer');
    if (!container) return;
    const chips = container.querySelectorAll('.roll-chip');
    chips.forEach(chip => {
        const roll = parseInt(chip.getAttribute('data-roll'));
        const presentContainer = document.getElementById('presentInputContainer');
        const leaveContainer = document.getElementById('leaveInputContainer');
        const inPresent = presentContainer && presentContainer.querySelector(`[data-roll="${roll}"]`);
        const inLeave = leaveContainer && leaveContainer.querySelector(`[data-roll="${roll}"]`);
        if (inPresent || inLeave) {
            chip.style.display = 'none';
        } else {
            chip.style.display = 'inline-block';
        }
    });
}

// Switch to "By Names" mode - FIXED
function takeAttendanceByName() {
    currentAttendanceMode = 'byName';
    document.getElementById('btnByName').classList.add('SelectedClasses');
    document.getElementById('btnByRollNumber').classList.remove('SelectedClasses');
    // Make sure we have the latest attendance data
    if (currentClass) {
        getClassID(currentClass).then(async classID => {
            if (classID) {
                await checkExistingAttendance(classID);
                renderAttendanceMode();
            }
        });
    } else {
        renderAttendanceMode();
    }
}

// Switch to "By Roll Numbers" mode - FIXED
function takeAttendanceByRollNumber() {
    currentAttendanceMode = 'byRollNumber';
    document.getElementById('btnByRollNumber').classList.add('SelectedClasses');
    document.getElementById('btnByName').classList.remove('SelectedClasses');
    // Make sure we have the latest attendance data
    if (currentClass) {
        getClassID(currentClass).then(async classID => {
            if (classID) {
                await checkExistingAttendance(classID);
                renderAttendanceMode();
            }
        });
    } else {
        renderAttendanceMode();
    }
}

// Submit attendance
async function submitAttendance() {
    if (!currentClass || currentStudents.length === 0) {
        alert('Please select a class first.');
        return;
    }
    
    const classID = await getClassID(currentClass);
    if (!classID) {
        alert('Error: Could not find class ID.');
        return;
    }
    
    const currentDate = formatADDate(currentADDate);
    const bsComponents = getBSDateComponents(currentADDate);
    const bsDate = `${bsComponents.year}-${String(bsComponents.month).padStart(2, '0')}-${String(bsComponents.day).padStart(2, '0')}`;
    
    let attendanceData = [];
    
    if (currentAttendanceMode === 'byName') {
        const presentCheckboxes = document.querySelectorAll('.present-checkbox:checked');
        const leaveCheckboxes = document.querySelectorAll('.leave-checkbox:checked');
        const presentRolls = new Set();
        const leaveRolls = new Set();
        
        presentCheckboxes.forEach(cb => presentRolls.add(parseInt(cb.getAttribute('data-roll'))));
        leaveCheckboxes.forEach(cb => leaveRolls.add(parseInt(cb.getAttribute('data-roll'))));
        
        // Check conflicts
        let hasConflict = false;
        presentRolls.forEach(roll => {
            if (leaveRolls.has(roll)) {
                hasConflict = true;
                alert(`Conflict: Student with roll number ${roll} is marked both Present and Leave.`);
            }
        });
        if (hasConflict) return;
        
        currentStudents.forEach(student => {
            const roll = student.RollNo;
            let status = 'absent';
            if (presentRolls.has(roll)) status = 'present';
            else if (leaveRolls.has(roll)) status = 'leave';
            attendanceData.push({ rollNo: roll, name: student.StudentName, status: status });
        });
    } else {
        const presentContainer = document.getElementById('presentInputContainer');
        const leaveContainer = document.getElementById('leaveInputContainer');
        if (!presentContainer || !leaveContainer) {
            alert('Error loading attendance data.');
            return;
        }
        const presentRolls = new Set();
        const leaveRolls = new Set();
        presentContainer.querySelectorAll('[data-roll]').forEach(chip => {
            presentRolls.add(parseInt(chip.getAttribute('data-roll')));
        });
        leaveContainer.querySelectorAll('[data-roll]').forEach(chip => {
            leaveRolls.add(parseInt(chip.getAttribute('data-roll')));
        });
        
        let hasConflict = false;
        presentRolls.forEach(roll => {
            if (leaveRolls.has(roll)) {
                hasConflict = true;
                alert(`Conflict: Roll number ${roll} is marked both Present and Leave.`);
            }
        });
        if (hasConflict) return;
        
        currentStudents.forEach(student => {
            const roll = student.RollNo;
            let status = 'absent';
            if (presentRolls.has(roll)) status = 'present';
            else if (leaveRolls.has(roll)) status = 'leave';
            attendanceData.push({ rollNo: roll, name: student.StudentName, status: status });
        });
    }
    
    const records = attendanceData.map(item => {
        const student = currentStudents.find(s => s.RollNo === item.rollNo);
        return {
            ClassID: classID,
            StudentID: student ? student.id : null,
            ADDate: currentDate,
            BSDate: bsDate,
            ClassName: currentClass,
            RollNumber: item.rollNo,
            StudentName: item.name,
            AttendanceStatus: item.status
        };
    });
    
    try {
        // Delete existing records for this date and class
        await supabaseClient
            .from('StudentAttendanceTable')
            .delete()
            .eq('ClassID', classID)
            .eq('BSDate', bsDate);
        
        // Insert new records
        const { error } = await supabaseClient
            .from('StudentAttendanceTable')
            .insert(records);
        
        if (error) {
            alert('Error submitting attendance: ' + error.message);
            return;
        }
        
        // Update existing attendance
        existingAttendance = records;
        updateStatusMessage();
        
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const leaveCount = attendanceData.filter(a => a.status === 'leave').length;
        const absentCount = attendanceData.filter(a => a.status === 'absent').length;
        
        alert(`✅ Attendance submitted successfully!\n\nClass: ${currentClass}\nDate: ${currentDate}\nBS Date: ${bsDate}\n\nPresent: ${presentCount}\nLeave: ${leaveCount}\nAbsent: ${absentCount}`);
        
        document.getElementById('btnSubmitAttendance').style.display = 'none';
        hasAttendanceChanged = false;
        
        // Refresh the view
        renderAttendanceMode();
        
    } catch (error) {
        console.error('Error submitting attendance:', error);
        alert('Error submitting attendance: ' + error.message);
    }
}

// Update status message after submission
function updateStatusMessage() {
    const statusDiv = document.getElementById('attendanceStatusMessage');
    if (!statusDiv) return;
    
    if (existingAttendance && existingAttendance.length > 0) {
        const presentCount = existingAttendance.filter(r => r.AttendanceStatus === 'present').length;
        const leaveCount = existingAttendance.filter(r => r.AttendanceStatus === 'leave').length;
        const absentCount = existingAttendance.filter(r => r.AttendanceStatus === 'absent').length;
        statusDiv.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 10px; border: 1px solid #c3e6cb;">
                ✅ Attendance already taken for this date.
                <span style="margin-left: 20px;">Present: ${presentCount}</span>
                <span style="margin-left: 10px;">Leave: ${leaveCount}</span>
                <span style="margin-left: 10px;">Absent: ${absentCount}</span>
                <span style="margin-left: 10px; font-size: 12px; color: #666;">(You can edit below)</span>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 10px; border: 1px solid #ffc107;">
                📝 No attendance recorded for this date. Please mark attendance.
            </div>
        `;
    }
}

// Helper function to get ClassID from ClassTable
async function getClassID(className) {
    // Validate className
    if (!className || className === '' || className === 'Select Class' || className === 'No Classes Found') {
        console.error('Invalid class name provided:', className);
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('ClassTable')
            .select('id')
            .eq('ClassName', className)
            .maybeSingle();
            
        if (error) {
            console.error('Error fetching class ID:', error);
            return null;
        }
        
        if (!data) {
            console.error('Class not found:', className);
            return null;
        }
        
        return data.id;
    } catch (error) {
        console.error('Error in getClassID:', error);
        return null;
    }
}

// Toggle all students (for By Names mode - compatibility)
function toggleAllStudents() {
    // This is handled by toggleAllPresent and toggleAllLeave
    console.log('toggleAllStudents called - use toggleAllPresent or toggleAllLeave instead');
}

// Check if attendance already exists for the selected date and class
async function checkExistingAttendance(classID) {
    const bsComponents = getBSDateComponents(currentADDate);
    const bsDate = `${bsComponents.year}-${String(bsComponents.month).padStart(2, '0')}-${String(bsComponents.day).padStart(2, '0')}`;
    
    try {
        const { data, error } = await supabaseClient
            .from('StudentAttendanceTable')
            .select('*')
            .eq('ClassID', classID)
            .eq('BSDate', bsDate);
            
        if (error) {
            console.error('Error checking attendance:', error);
            existingAttendance = null;
            return;
        }
        
        existingAttendance = data || null;
        
        // Update status message
        updateStatusMessage();
        
    } catch (error) {
        console.error('Error in checkExistingAttendance:', error);
        existingAttendance = null;
    }
}

// Make all functions globally available
window.toggleAllPresent = toggleAllPresent;
window.toggleAllLeave = toggleAllLeave;
window.toggleAllStudents = toggleAllStudents;
window.toggleAllPresentRolls = toggleAllPresentRolls;
window.toggleAllLeaveRolls = toggleAllLeaveRolls;
window.takeAttendanceByName = takeAttendanceByName;
window.takeAttendanceByRollNumber = takeAttendanceByRollNumber;
window.submitAttendance = submitAttendance;
window.handlePresentCheck = handlePresentCheck;
window.handleLeaveCheck = handleLeaveCheck;
window.handleRollClick = handleRollClick;
window.handleRollDoubleClick = handleRollDoubleClick;
window.addRollToPresent = addRollToPresent;
window.addRollToLeave = addRollToLeave;
window.removeFromPresent = removeFromPresent;
window.removeFromLeave = removeFromLeave;
window.removeFromAvailable = removeFromAvailable;

// Global variables for attendance view
let attendanceViewMode = 'day'; // 'day' or 'month'
let attendanceViewDate = new Date(); // Current date for viewing
let attendanceViewMonth = new Date(); // Current month for viewing

// Show Attendance function
function showAttendance() {
    // Check if a class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        alert('Please select a class first before viewing attendance.');
        return;
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'attendancePopupOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'attendancePopup';
    popup.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 95%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        min-width: 700px;
        min-height: 400px;
        position: relative;
    `;
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        background: none;
        border: none;
        cursor: pointer;
        color: #333;
        padding: 5px 10px;
        border-radius: 5px;
        z-index: 100;
    `;
    closeBtn.onmouseover = function() { this.style.background = '#f0f0f0'; };
    closeBtn.onmouseout = function() { this.style.background = 'none'; };
    closeBtn.onclick = function() { closeAttendancePopup(); };
    
    // Popup content
    let popupHTML = `
        <div style="margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
            <h2 style="margin: 0; color: #333; font-size: 24px;">Attendance Report - ${currentClass}</h2>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; gap: 10px;">
                <button id="btnDayAttendance" class="attendance-view-btn active" onclick="switchAttendanceView('day')" 
                        style="padding: 10px 25px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Day Attendance
                </button>
                <button id="btnMonthAttendance" class="attendance-view-btn" onclick="switchAttendanceView('month')" 
                        style="padding: 10px 25px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Month Attendance
                </button>
            </div>
            <div id="downloadButtonContainer" style="margin-left: auto;">
                <button onclick="downloadAttendanceImage()" style="padding: 10px 25px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">
                    📥 Download as JPG
                </button>
            </div>
        </div>
        <div id="attendanceViewContainer">
    `;
    
    popupHTML += `</div>`;
    popup.innerHTML = popupHTML;
    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Initialize with day view
    attendanceViewDate = new Date();
    attendanceViewMode = 'day';
    renderDayAttendance();
}

// Switch attendance view
function switchAttendanceView(mode) {
    attendanceViewMode = mode;
    
    // Update button styles
    const dayBtn = document.getElementById('btnDayAttendance');
    const monthBtn = document.getElementById('btnMonthAttendance');
    
    if (mode === 'day') {
        dayBtn.style.background = '#007bff';
        dayBtn.style.color = 'white';
        monthBtn.style.background = '#6c757d';
        monthBtn.style.color = 'white';
        renderDayAttendance();
    } else {
        monthBtn.style.background = '#007bff';
        monthBtn.style.color = 'white';
        dayBtn.style.background = '#6c757d';
        dayBtn.style.color = 'white';
        renderMonthAttendance();
    }
}

// Render Day Attendance
function renderDayAttendance() {
    const container = document.getElementById('attendanceViewContainer');
    if (!container) return;
    
    // Check if class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Please select a class first.</div>';
        return;
    }
    
    const bsComponents = getBSDateComponents(attendanceViewDate);
    const bsDateString = `${bsComponents.year}-${String(bsComponents.month).padStart(2, '0')}-${String(bsComponents.day).padStart(2, '0')}`;
    const adDateString = formatADDate(attendanceViewDate);
    
    // Get calendar data for this date
    getCalendarData(bsComponents.year, bsComponents.month, bsComponents.day).then(calendarInfo => {
        let holidayHTML = '';
        if (calendarInfo) {
            let holidayText = '';
            if (calendarInfo.day_type) {
                holidayText += `<span style="color: #856404; font-weight: bold;">${calendarInfo.day_type}</span>`;
            }
            if (calendarInfo.national_event) {
                holidayText += holidayText ? ` - ${calendarInfo.national_event}` : calendarInfo.national_event;
            }
            if (holidayText) {
                holidayHTML = `
                    <div style="text-align: center; padding: 5px 10px; background: #fff3cd; border-radius: 5px; margin-top: 5px; font-size: 14px; color: #856404;">
                        🎉 ${holidayText}
                    </div>
                `;
            }
        }
        
        let html = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
                <button onclick="changeAttendanceDay(-1)" style="padding: 8px 20px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 5px; background: #f8f9fa;">
                    ◀
                </button>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #333;">BS: ${bsDateString}</div>
                    <div style="font-size: 14px; color: #666;">AD: ${adDateString}</div>
                    ${holidayHTML}
                </div>
                <button onclick="changeAttendanceDay(1)" style="padding: 8px 20px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 5px; background: #f8f9fa;">
                    ▶
                </button>
            </div>
            <div id="dayAttendanceContent">
                <div style="text-align: center; padding: 20px; color: #666;">Loading attendance data...</div>
            </div>
        `;
        
        container.innerHTML = html;
        loadDayAttendance(bsDateString);
    });
}

// Get calendar data for a specific date
async function getCalendarData(bsYear, bsMonth, bsDay) {
    try {
        const { data, error } = await supabaseClient
            .from('CalendarDataTable')
            .select('*')
            .eq('n_year', bsYear)
            .eq('n_month', bsMonth)
            .eq('n_day', bsDay)
            .maybeSingle();
            
        if (error) {
            console.error('Error fetching calendar data:', error);
            return null;
        }
        
        return data || null;
    } catch (error) {
        console.error('Error in getCalendarData:', error);
        return null;
    }
}

// Load Day Attendance data
async function loadDayAttendance(bsDate) {
    const content = document.getElementById('dayAttendanceContent');
    if (!content) return;
    
    // Check if class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Please select a class first.</div>';
        return;
    }
    
    try {
        // Get class ID for current class
        const classID = await getClassID(currentClass);
        if (!classID) {
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Class not found. Please select a valid class.</div>';
            return;
        }
        
        // Query attendance for this date and class
        const { data, error } = await supabaseClient
            .from('StudentAttendanceTable')
            .select('*')
            .eq('ClassID', classID)
            .eq('BSDate', bsDate);
            
        if (error) {
            console.error('Error loading attendance:', error);
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error loading attendance data.</div>';
            return;
        }
        
        if (!data || data.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
                    <div style="font-size: 18px; color: #666;">No attendance recorded for this date.</div>
                    <div style="font-size: 14px; color: #999; margin-top: 5px;">BS Date: ${bsDate}</div>
                </div>
            `;
            return;
        }
        
        // Build attendance table
        let tableHTML = `
            <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
                <table id="attendanceTable" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead style="position: sticky; top: 0; z-index: 10;">
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 10px; text-align: left;">S.No.</th>
                            <th style="padding: 10px; text-align: left;">Roll No.</th>
                            <th style="padding: 10px; text-align: left;">Student Name</th>
                            <th style="padding: 10px; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.forEach((record, index) => {
            const statusColor = record.AttendanceStatus === 'present' ? '#28a745' : 
                               record.AttendanceStatus === 'leave' ? '#dc3545' : '#ffc107';
            const statusText = record.AttendanceStatus.charAt(0).toUpperCase() + record.AttendanceStatus.slice(1);
            
            tableHTML += `
                <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                    <td style="padding: 10px;">${index + 1}</td>
                    <td style="padding: 10px;">${record.RollNumber}</td>
                    <td style="padding: 10px;">${record.StudentName}</td>
                    <td style="padding: 10px; text-align: center;">
                        <span style="display: inline-block; padding: 3px 12px; border-radius: 12px; color: white; background: ${statusColor}; font-size: 12px; font-weight: bold;">
                            ${statusText}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 20px; justify-content: center; font-size: 14px; color: #666;">
                <span>Total: ${data.length}</span>
                <span style="color: #28a745;">Present: ${data.filter(r => r.AttendanceStatus === 'present').length}</span>
                <span style="color: #dc3545;">Leave: ${data.filter(r => r.AttendanceStatus === 'leave').length}</span>
                <span style="color: #ffc107;">Absent: ${data.filter(r => r.AttendanceStatus === 'absent').length}</span>
            </div>
        `;
        
        content.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error in loadDayAttendance:', error);
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error loading attendance data.</div>';
    }
}

// Change attendance day
function changeAttendanceDay(delta) {
    attendanceViewDate.setDate(attendanceViewDate.getDate() + delta);
    renderDayAttendance();
}

// Render Month Attendance
function renderMonthAttendance() {
    const container = document.getElementById('attendanceViewContainer');
    if (!container) return;
    
    const year = attendanceViewMonth.getFullYear();
    const month = attendanceViewMonth.getMonth();
    const bsComponents = getBSDateComponents(attendanceViewMonth);
    const bsYear = bsComponents.year;
    const bsMonth = bsComponents.month;
    
    // Get the AD month range for this BS month
    const bsMonthStart = `${bsYear}-${String(bsMonth).padStart(2, '0')}-01`;
    const daysInMonth = getDaysInBSMonth(bsYear, bsMonth);
    const bsMonthEnd = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    
    // Get AD dates for first and last day of BS month
    let adStart = '';
    let adEnd = '';
    try {
        const adStartDate = BS2AD_YMD(bsMonthStart);
        const adEndDate = BS2AD_YMD(bsMonthEnd);
        const startParts = adStartDate.split('-').map(Number);
        const endParts = adEndDate.split('-').map(Number);
        const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
        const endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);
        
        const startMonth = ENGLISH_MONTHS[startDate.getMonth()];
        const endMonth = ENGLISH_MONTHS[endDate.getMonth()];
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        
        if (startMonth === endMonth && startYear === endYear) {
            adStart = `${startMonth} ${startYear}`;
            adEnd = '';
        } else {
            adStart = `${startMonth} ${startYear}`;
            adEnd = ` - ${endMonth} ${endYear}`;
        }
    } catch (e) {
        console.error('Error getting AD dates:', e);
    }
    
    let html = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
            <button onclick="changeAttendanceMonth(-1)" style="padding: 8px 20px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 5px; background: #f8f9fa;">
                ◀
            </button>
            <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold; color: #333;">${NEPALI_MONTHS[bsMonth - 1]} ${bsYear}</div>
                <div style="font-size: 14px; color: #666;">AD: ${adStart}${adEnd}</div>
            </div>
            <button onclick="changeAttendanceMonth(1)" style="padding: 8px 20px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 5px; background: #f8f9fa;">
                ▶
            </button>
        </div>
        <div id="monthAttendanceContent">
            <div style="text-align: center; padding: 20px; color: #666;">Loading attendance data...</div>
        </div>
    `;
    
    container.innerHTML = html;
    loadMonthAttendance(bsYear, bsMonth);
}

async function loadMonthAttendance(bsYear, bsMonth) {
    const content = document.getElementById('monthAttendanceContent');
    if (!content) return;
    
    // Check if class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Please select a class first.</div>';
        return;
    }
    
    try {
        // Get class ID for current class
        const classID = await getClassID(currentClass);
        if (!classID) {
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Class not found. Please select a valid class.</div>';
            return;
        }
        
        // Get all days in the BS month
        const daysInMonth = getDaysInBSMonth(bsYear, bsMonth);
        const bsMonthStart = `${bsYear}-${String(bsMonth).padStart(2, '0')}-01`;
        const bsMonthEnd = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        
        // Fetch calendar data for this month
        let calendarData = [];
        try {
            const { data, error } = await supabaseClient
                .from('CalendarDataTable')
                .select('*')
                .eq('n_year', bsYear)
                .eq('n_month', bsMonth);
                
            if (error) {
                console.error('Error loading calendar data:', error);
            } else {
                calendarData = data || [];
            }
        } catch (error) {
            console.error('Error in calendar fetch:', error);
        }
        
        // Query attendance for this month and class
        let attendanceData = [];
        try {
            const { data, error } = await supabaseClient
                .from('StudentAttendanceTable')
                .select('*')
                .eq('ClassID', classID)
                .filter('BSDate', 'gte', bsMonthStart)
                .filter('BSDate', 'lte', bsMonthEnd);
                
            if (error) {
                console.error('Error loading attendance:', error);
                content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error loading attendance data. Please try again.</div>';
                return;
            }
            attendanceData = data || [];
        } catch (error) {
            console.error('Error in attendance fetch:', error);
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error loading attendance data. Please try again.</div>';
            return;
        }
        
        // Get all unique students from attendance data
        const students = [];
        if (attendanceData && attendanceData.length > 0) {
            const studentMap = new Map();
            attendanceData.forEach(r => {
                if (!studentMap.has(r.RollNumber)) {
                    studentMap.set(r.RollNumber, {
                        RollNumber: r.RollNumber,
                        StudentName: r.StudentName
                    });
                }
            });
            students.push(...studentMap.values());
            students.sort((a, b) => a.RollNumber - b.RollNumber);
        } else {
            // If no attendance data, show message
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
                    <div style="font-size: 18px; color: #666;">No attendance recorded for this month.</div>
                    <div style="font-size: 14px; color: #999; margin-top: 5px;">${NEPALI_MONTHS[bsMonth - 1]} ${bsYear}</div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">Please mark attendance first.</div>
                </div>
            `;
            return;
        }
        
        // Build calendar for the month with all days
        let calendar = {};
        let attendanceDays = new Set();
        if (attendanceData) {
            attendanceData.forEach(r => {
                attendanceDays.add(r.BSDate);
            });
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfWeek = getBSDayOfWeek(bsYear, bsMonth, day);
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            
            // Check if it's a holiday from calendar data
            let holidayInfo = null;
            let holidayName = '';
            if (calendarData && calendarData.length > 0) {
                const dayData = calendarData.find(d => d.n_day === day);
                if (dayData) {
                    if (dayData.day_type === 'Public Holiday' || 
                        dayData.day_type === 'Summer Vacation' || 
                        dayData.day_type === 'Winter Vacation') {
                        holidayInfo = dayData;
                        holidayName = dayData.day_type;
                        if (dayData.national_event) {
                            holidayName = `${holidayName}: ${dayData.national_event}`;
                        }
                    } else if (dayData.national_event && 
                              (dayData.national_event.includes('Holiday') || 
                               dayData.national_event.includes('holiday'))) {
                        holidayInfo = dayData;
                        holidayName = dayData.national_event;
                    }
                }
            }
            
            // If weekend and no holiday info, mark as weekend
            if (isWeekend && !holidayInfo) {
                holidayName = 'Saturday/Sunday';
                holidayInfo = { day_type: 'Weekend', national_event: 'Saturday/Sunday' };
            }
            
            calendar[dateStr] = {
                day: day,
                dayOfWeek: dayOfWeek,
                isWeekend: isWeekend,
                holiday: holidayInfo,
                holidayName: holidayName
            };
        }
        
        // Build attendance matrix table
        let tableHTML = `
            <div style="overflow-x: auto; max-height: 500px; overflow-y: auto; position: relative; border: 1px solid #dee2e6; border-radius: 5px;">
                <table id="attendanceTable" style="width: 100%; border-collapse: collapse; font-size: 11px; min-width: 850px; table-layout: auto;">
                    <thead style="position: sticky; top: 0; z-index: 20;">
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 6px; text-align: center; min-width: 70px; border: 1px solid #dee2e6; background: #f8f9fa;">Roll No.</th>
                            <th style="padding: 6px; text-align: left; min-width: 120px; border: 1px solid #dee2e6; background: #f8f9fa;">Student Name</th>
        `;
        
        // Add all days of the month as headers
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayInfo = calendar[dateStr];
            const hasAttendance = attendanceDays.has(dateStr);
            
            // Only treat as holiday if there is NO attendance
            const isHoliday = dayInfo.holiday !== null && !hasAttendance;
            const bgColor = isHoliday ? '#fff3cd' : '#f8f9fa';
            const textColor = isHoliday ? '#dc3545' : '#333';
            
            tableHTML += `
                <th style="padding: 4px; text-align: center; min-width: 28px; background: ${bgColor}; color: ${textColor}; font-weight: ${isHoliday ? 'bold' : 'normal'}; font-size: 10px; border: 1px solid #dee2e6;" 
                    title="${isHoliday ? dayInfo.holidayName || 'Holiday' : ''}">
                    ${day}
                    <div style="font-size: 7px; color: ${isHoliday ? '#dc3545' : '#999'};">${getDayNameShort(dayInfo.dayOfWeek)}</div>
                    ${isHoliday ? '<div style="font-size: 7px; color: #dc3545;">H</div>' : ''}
                </th>
            `;
        }
        
        tableHTML += `
                            <th style="padding: 6px; text-align: center; background: #28a745; color: white; min-width: 50px; border: 1px solid #dee2e6;">This Month<br>Present</th>
                            <th style="padding: 6px; text-align: center; background: #dc3545; color: white; min-width: 50px; border: 1px solid #dee2e6;">This Month<br>Leave</th>
                            <th style="padding: 6px; text-align: center; background: #ffc107; color: #333; min-width: 50px; border: 1px solid #dee2e6;">This Month<br>Absent</th>
                            <th style="padding: 6px; text-align: center; background: #17a2b8; color: white; min-width: 60px; border: 1px solid #dee2e6;">Total Present<br>Up to This Month</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // For each student, show attendance for all days
        students.forEach((student, index) => {
            const studentData = attendanceData ? attendanceData.filter(r => r.RollNumber === student.RollNumber) : [];
            let presentCount = 0, leaveCount = 0, absentCount = 0, holidayCount = 0;
            
            // Calculate total present days from Baisakh 1 to end of this month for this student
            let totalPresentFromStart = 0;
            
            // Get all attendance for this student from Baisakh 1 to current month end
            const allStudentData = attendanceData ? attendanceData.filter(r => r.RollNumber === student.RollNumber) : [];
            
            // For each month from Baisakh (month 1) to current month
            for (let m = 1; m <= bsMonth; m++) {
                const monthData = allStudentData.filter(r => {
                    const parts = r.BSDate.split('-').map(Number);
                    return parts[1] === m;
                });
                // Count presents for this month
                const monthPresents = monthData.filter(r => r.AttendanceStatus === 'present').length;
                totalPresentFromStart += monthPresents;
            }
            
            tableHTML += `
                <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                    <td style="padding: 6px; text-align: center; font-weight: bold; border: 1px solid #dee2e6; background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                        ${student.RollNumber}
                    </td>
                    <td style="padding: 6px; text-align: left; border: 1px solid #dee2e6; background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                        ${student.StudentName}
                    </td>
            `;
            
            // Show attendance for each day
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayInfo = calendar[dateStr];
                const hasAttendance = attendanceDays.has(dateStr);
                const record = studentData.find(r => r.BSDate === dateStr);
                
                // Only treat as holiday if there is NO attendance
                const isHoliday = dayInfo.holiday !== null && !hasAttendance;
                
                let status = 'absent';
                let color = '#ffc107';
                let symbol = '•';
                let title = 'Absent';
                let bgColor = '';
                let textColor = '#333';
                
                if (isHoliday) {
                    // This is a holiday with no attendance
                    status = 'holiday';
                    color = '#dc3545';
                    symbol = 'H';
                    title = dayInfo.holidayName || 'Holiday';
                    bgColor = '#fff3cd';
                    holidayCount++;
                } else if (record) {
                    status = record.AttendanceStatus;
                    if (status === 'present') {
                        color = '#28a745';
                        symbol = '✓';
                        title = 'Present';
                        presentCount++;
                    } else if (status === 'leave') {
                        color = '#dc3545';
                        symbol = '✕';
                        title = 'Leave';
                        leaveCount++;
                    } else {
                        color = '#ffc107';
                        symbol = '•';
                        title = 'Absent';
                        absentCount++;
                    }
                } else {
                    // No record and not holiday - absent
                    absentCount++;
                }
                
                tableHTML += `
                    <td style="padding: 4px; text-align: center; color: ${color}; font-weight: ${isHoliday ? 'bold' : 'bold'}; font-size: 12px; background: ${bgColor || ''}; border: 1px solid #dee2e6;">
                        <span title="${title}">${symbol}</span>
                    </td>
                `;
            }
            
            // Summary columns - This Month's Present, Leave, Absent, and Total Present Up to This Month
            tableHTML += `
                    <td style="padding: 6px; text-align: center; color: #28a745; font-weight: bold; border: 1px solid #dee2e6;">${presentCount}</td>
                    <td style="padding: 6px; text-align: center; color: #dc3545; font-weight: bold; border: 1px solid #dee2e6;">${leaveCount}</td>
                    <td style="padding: 6px; text-align: center; color: #ffc107; font-weight: bold; border: 1px solid #dee2e6;">${absentCount}</td>
                    <td style="padding: 6px; text-align: center; color: #17a2b8; font-weight: bold; border: 1px solid #dee2e6;">${totalPresentFromStart}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Summary footer with legend and holiday list
        const totalStudents = students.length;
        const totalDays = daysInMonth;
        
        // Get unique holiday names for holidays with NO attendance
        const holidayNames = new Set();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayInfo = calendar[dateStr];
            const hasAttendance = attendanceDays.has(dateStr);
            const isHoliday = dayInfo.holiday !== null && !hasAttendance;
            if (isHoliday && dayInfo.holidayName) {
                holidayNames.add(dayInfo.holidayName);
            }
        }
        
        const totalHolidays = holidayNames.size;
        
        let holidayListHTML = '';
        if (holidayNames.size > 0) {
            holidayListHTML = `
                <div style="margin-top: 10px; font-size: 12px; color: #dc3545; text-align: center; background: #fff3cd; padding: 8px; border-radius: 5px; border: 1px solid #dc3545;">
                    <strong style="color: #dc3545;">Holidays:</strong> 
                    <span style="color: #dc3545;">${Array.from(holidayNames).join(' | ')}</span>
                </div>
            `;
        }
        
        tableHTML += `
            <div style="margin-top: 15px; display: flex; gap: 20px; justify-content: center; font-size: 13px; color: #666; flex-wrap: wrap; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <span>Total Students: <strong>${totalStudents}</strong></span>
                <span>Total Days: <strong>${totalDays}</strong></span>
                <span>Holidays: <strong style="color: #dc3545;">${totalHolidays}</strong></span>
                <span style="color: #28a745;">✓ Present</span>
                <span style="color: #dc3545;">✕ Leave</span>
                <span style="color: #ffc107;">• Absent</span>
                <span style="color: #dc3545;">H Holiday</span>
            </div>
            ${holidayListHTML}
        `;
        
        content.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error in loadMonthAttendance:', error);
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error loading attendance data. Please try again.</div>';
    }
}

// Helper function to get BS day of week
function getBSDayOfWeek(bsYear, bsMonth, bsDay) {
    try {
        const bsDateString = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
        const adDateString = BS2AD_YMD(bsDateString);
        const parts = adDateString.split('-').map(Number);
        const adDate = new Date(parts[0], parts[1] - 1, parts[2]);
        return adDate.getDay(); // 0=Sunday, 6=Saturday
    } catch (e) {
        return 0;
    }
}

// Helper function to get short day name
function getDayNameShort(dayOfWeek) {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return names[dayOfWeek] || '';
}

// Helper function to get days in BS month
function getDaysInBSMonth(bsYear, bsMonth) {
    const yearData = NEPALI_CALENDAR_DATA.find(data => data[0] === bsYear);
    return yearData ? yearData[bsMonth] : 30;
}

// Change attendance month
function changeAttendanceMonth(delta) {
    attendanceViewMonth.setMonth(attendanceViewMonth.getMonth() + delta);
    renderMonthAttendance();
}

// Close attendance popup
function closeAttendancePopup() {
    const overlay = document.getElementById('attendancePopupOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Download attendance as JPG - captures entire content including scrollable area
function downloadAttendanceImage() {
    // Check if class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        alert('Please select a class first.');
        return;
    }
    
    const container = document.getElementById('attendanceViewContainer');
    if (!container) {
        alert('No attendance data to download.');
        return;
    }
    
    // Get the table content
    const table = document.getElementById('attendanceTable');
    if (!table) {
        alert('No attendance data to download.');
        return;
    }
    
    // Show loading message
    const downloadBtn = document.querySelector('#downloadButtonContainer button');
    if (downloadBtn) {
        downloadBtn.textContent = '⏳ Generating...';
        downloadBtn.disabled = true;
    }
    
    // Create a clone of the table with proper styling
    const tableClone = table.cloneNode(true);
    tableClone.style.width = '100%';
    tableClone.style.minWidth = '800px';
    tableClone.style.borderCollapse = 'collapse';
    
    // Fix the clone - ensure all cells have proper backgrounds
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
            // Preserve background colors
            const bgColor = cell.style.backgroundColor;
            if (bgColor) {
                cell.style.backgroundColor = bgColor;
            }
        });
    });
    
    // Get the header and summary
    const header = container.querySelector('div[style*="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;"]');
    const summary = container.querySelector('div[style*="margin-top: 15px; display: flex; gap: 20px; justify-content: center; font-size: 13px;"]');
    const holidayList = container.querySelector('div[style*="margin-top: 10px; font-size: 12px; color: #dc3545;"]');
    
    // Create a wrapper for the entire content
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        padding: 20px;
        background: white;
        width: ${Math.max(table.scrollWidth || 1000, 900)}px;
        font-family: Arial, sans-serif;
        box-sizing: border-box;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.style.cssText = `
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
    `;
    const viewMode = attendanceViewMode === 'day' ? 'Day' : 'Month';
    const bsComponents = getBSDateComponents(attendanceViewDate);
    const bsMonthName = NEPALI_MONTHS[bsComponents.month - 1];
    title.textContent = `Attendance Report - ${currentClass} (${viewMode})`;
    wrapper.appendChild(title);
    
    // Add header
    if (header) {
        const headerClone = header.cloneNode(true);
        // Remove buttons from header clone
        const buttons = headerClone.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());
        wrapper.appendChild(headerClone);
    }
    
    // Add table with full content
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = `
        overflow: visible;
        width: 100%;
        margin: 10px 0;
        border: 1px solid #dee2e6;
        border-radius: 5px;
    `;
    tableContainer.appendChild(tableClone);
    wrapper.appendChild(tableContainer);
    
    // Add summary
    if (summary) {
        const summaryClone = summary.cloneNode(true);
        wrapper.appendChild(summaryClone);
    }
    
    // Add holiday list
    if (holidayList) {
        const holidayClone = holidayList.cloneNode(true);
        wrapper.appendChild(holidayClone);
    }
    
    // Add legend if not in summary
    const hasLegend = summary && summary.innerHTML.includes('✓ Present');
    if (!hasLegend) {
        const legend = document.createElement('div');
        legend.style.cssText = `
            margin-top: 15px;
            display: flex;
            gap: 20px;
            justify-content: center;
            font-size: 13px;
            color: #666;
            flex-wrap: wrap;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        `;
        legend.innerHTML = `
            <span style="color: #28a745;">✓ Present</span>
            <span style="color: #dc3545;">✕ Leave</span>
            <span style="color: #ffc107;">• Absent</span>
            <span style="color: #dc3545;">H Holiday</span>
        `;
        wrapper.appendChild(legend);
    }
    
    // Append wrapper to body temporarily for rendering
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '-1';
    document.body.appendChild(wrapper);
    
    // Wait a moment for rendering
    setTimeout(() => {
        html2canvas(wrapper, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: wrapper.scrollWidth,
            height: wrapper.scrollHeight,
            windowWidth: wrapper.scrollWidth,
            windowHeight: wrapper.scrollHeight,
            onclone: function(doc) {
                const cloneWrapper = doc.querySelector('div[style*="position: fixed"]');
                if (cloneWrapper) {
                    cloneWrapper.style.overflow = 'visible';
                }
            }
        }).then(canvas => {
            if (wrapper.parentNode) {
                document.body.removeChild(wrapper);
            }
            
            const bsComponents2 = getBSDateComponents(attendanceViewDate);
            const bsMonthName2 = NEPALI_MONTHS[bsComponents2.month - 1];
            const bsYear2 = bsComponents2.year;
            
            const viewMode2 = attendanceViewMode === 'day' ? 'Day' : 'Month';
            const dateStr = viewMode2 === 'Day' ? 
                `${bsYear2}-${String(bsComponents2.month).padStart(2, '0')}-${String(bsComponents2.day).padStart(2, '0')}` :
                `${bsMonthName2}_${bsYear2}`;
            
            const link = document.createElement('a');
            link.download = `Attendance_${currentClass}_${viewMode2}_${dateStr}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
            
            if (downloadBtn) {
                downloadBtn.textContent = '📥 Download as JPG';
                downloadBtn.disabled = false;
            }
        }).catch(error => {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
            
            if (wrapper.parentNode) {
                document.body.removeChild(wrapper);
            }
            
            if (downloadBtn) {
                downloadBtn.textContent = '📥 Download as JPG';
                downloadBtn.disabled = false;
            }
        });
    }, 100);
}

// Make sure to add these to window exports
window.showAttendance = showAttendance;
window.switchAttendanceView = switchAttendanceView;
window.changeAttendanceDay = changeAttendanceDay;
window.changeAttendanceMonth = changeAttendanceMonth;
window.closeAttendancePopup = closeAttendancePopup;
window.downloadAttendanceImage = downloadAttendanceImage;

// Clear all attendance data for the selected class
async function clearAttendanceData() {
    // Check if a class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        showCustomDialog1(
            "No Class Selected", 
            "Please select a class first before clearing attendance data.", 
            "OK", 
            function() {}
        );
        return;
    }
    
    // Check if there are any students in the class
    if (!currentStudents || currentStudents.length === 0) {
        showCustomDialog1(
            "No Students", 
            `No students found in class "${currentClass}". Cannot clear attendance.`, 
            "OK", 
            function() {}
        );
        return;
    }
    
    // Get the class ID
    const classID = await getClassID(currentClass);
    if (!classID) {
        showCustomDialog1(
            "Error", 
            "Could not find class ID. Please try again.", 
            "OK", 
            function() {}
        );
        return;
    }
    
    // Count total attendance records for this class
    let totalRecords = 0;
    try {
        const { count, error: countError } = await supabaseClient
            .from('StudentAttendanceTable')
            .select('*', { count: 'exact', head: true })
            .eq('ClassID', classID);
            
        if (countError) {
            console.error('Error counting attendance records:', countError);
        } else {
            totalRecords = count || 0;
        }
    } catch (error) {
        console.error('Error counting records:', error);
    }
    
    // Show confirmation dialog with details
    showCustomDialog2(
        "⚠️ Confirm Delete",
        `Are you sure you want to delete ALL attendance records for class "${currentClass}"?\n\n` +
        `Total attendance records: ${totalRecords}\n` +
        `Students in class: ${currentStudents.length}\n\n` +
        `⚠️ This action cannot be undone!`,
        "Yes, Delete All",
        "Cancel",
        async function() {
            // User confirmed - proceed with deletion
            await performClearAttendance(classID);
        },
        function() {
            // User cancelled
            console.log("Clear attendance cancelled");
        }
    );
}

// Perform the actual deletion
async function performClearAttendance(classID) {
    try {
        // Show loading state
        const clearBtn = document.getElementById('btnClearAttendanceData');
        if (clearBtn) {
            clearBtn.textContent = '⏳ Deleting...';
            clearBtn.disabled = true;
        }
        
        // Delete all attendance records for this class
        const { data, error } = await supabaseClient
            .from('StudentAttendanceTable')
            .delete()
            .eq('ClassID', classID);
            
        if (error) {
            console.error('Error clearing attendance:', error);
            showCustomDialog1(
                "Error", 
                `Failed to delete attendance records: ${error.message}`, 
                "OK", 
                function() {}
            );
            return;
        }
        
        // Clear the existing attendance data from memory
        existingAttendance = null;
        hasAttendanceChanged = false;
        
        // Update status message
        updateStatusMessage();
        
        // Refresh the attendance display
        renderAttendanceMode();
        
        // Hide submit button since there's no attendance now
        document.getElementById('btnSubmitAttendance').style.display = 'block';
        
        // Show success message
        showCustomDialog1(
            "✅ Success", 
            `All attendance records for class "${currentClass}" have been successfully deleted.\n\n` +
            `You can now mark new attendance for this class.`, 
            "OK", 
            function() {}
        );
        
        console.log(`All attendance records deleted for class ID: ${classID}`);
        
    } catch (error) {
        console.error('Error in performClearAttendance:', error);
        showCustomDialog1(
            "Error", 
            `An unexpected error occurred: ${error.message}`, 
            "OK", 
            function() {}
        );
    } finally {
        // Reset button state
        const clearBtn = document.getElementById('btnClearAttendanceData');
        if (clearBtn) {
            clearBtn.textContent = '🗑️ Clear Class Attendance';
            clearBtn.disabled = false;
        }
    }
}

// Optional: Clear attendance for a specific date (not all records)
async function clearAttendanceForDate() {
    // Check if a class is selected
    if (!currentClass || currentClass === '' || currentClass === 'Select Class' || currentClass === 'No Classes Found') {
        showCustomDialog1(
            "No Class Selected", 
            "Please select a class first.", 
            "OK", 
            function() {}
        );
        return;
    }
    
    const classID = await getClassID(currentClass);
    if (!classID) {
        showCustomDialog1(
            "Error", 
            "Could not find class ID.", 
            "OK", 
            function() {}
        );
        return;
    }
    
    const bsComponents = getBSDateComponents(currentADDate);
    const bsDate = `${bsComponents.year}-${String(bsComponents.month).padStart(2, '0')}-${String(bsComponents.day).padStart(2, '0')}`;
    
    // Check if attendance exists for this date
    if (!existingAttendance || existingAttendance.length === 0) {
        showCustomDialog1(
            "No Attendance", 
            `No attendance records found for ${currentClass} on ${bsDate}`, 
            "OK", 
            function() {}
        );
        return;
    }
    
    showCustomDialog2(
        "⚠️ Confirm Delete",
        `Delete attendance for ${currentClass} on ${bsDate}?\n\n` +
        `Records to delete: ${existingAttendance.length}\n\n` +
        `⚠️ This action cannot be undone!`,
        "Yes, Delete",
        "Cancel",
        async function() {
            try {
                const { error } = await supabaseClient
                    .from('StudentAttendanceTable')
                    .delete()
                    .eq('ClassID', classID)
                    .eq('BSDate', bsDate);
                    
                if (error) {
                    showCustomDialog1("Error", error.message, "OK", function() {});
                    return;
                }
                
                existingAttendance = null;
                updateStatusMessage();
                renderAttendanceMode();
                document.getElementById('btnSubmitAttendance').style.display = 'block';
                
                showCustomDialog1(
                    "✅ Success", 
                    `Attendance for ${bsDate} has been deleted.`, 
                    "OK", 
                    function() {}
                );
            } catch (error) {
                console.error('Error:', error);
                showCustomDialog1("Error", error.message, "OK", function() {});
            }
        },
        function() {}
    );
}

// Make functions globally available
window.clearAttendanceData = clearAttendanceData;
window.clearAttendanceForDate = clearAttendanceForDate;