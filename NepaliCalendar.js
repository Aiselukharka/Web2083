(function() {
    // ========== SUPABASE CONFIGURATION ==========
    const SUPABASE_URL = 'https://wrjivuysumgpoqmabwpw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyaml2dXlzdW1ncG9xbWFid3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzczMTEsImV4cCI6MjA5NjY1MzMxMX0.Cfi1IwCFDEHGq1f4g_1amRduxeEiWvoZy4BwxNAtv8A';
    const TABLE_NAME = 'CalendarDataTable';
    const ABOUT_TABLE = 'AboutSchoolTable';
    
    // Nepali month names
    const NEPALI_MONTHS = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 
                           'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'];
    
    const NEPALI_MONTHS_DISPLAY = ['बैशाख', 'जेष्ठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
                                   'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
    
    // Roman/Latin names for filenames
    const MONTH_NAMES_EN = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
                            'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
    
    // Nepali day names (short for display)
    const NEPALI_DAYS_SHORT = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
    
    // Nepali digits mapping
    const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    
    // English month names mapping
    const ENGLISH_MONTHS = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    
    // Default style for undefined day types
    const DEFAULT_STYLE = {
        background: '#dddddd',
        border: '2px solid #aaaaaa'
    };
    
    // Define day type styles with their visual appearance
    const DAY_TYPE_STYLES = {
        'Public Holiday':  { background: '#FFaaaa', border: '2px solid #aa5555' },
        'Study Time':      { background: '#aaffaa', border: '2px solid #55aa55' },
        'Exam Time':       { background: '#aaaaff', border: '2px solid #5555aa' },
        'Summer Vacation': { background: '#ffffaa', border: '2px solid #aaaa55' },
        'Winter Vacation': { background: '#ffaaff', border: '2px solid #aa55aa' },
        'Other School Time': { background: '#aaffff', border: '2px solid #55aaaa' },
        'Other Vacation':  { background: '#afafaf', border: '2px solid #5a5a5a' }
    };
    
    // Cache for school info fetched once per page load
    let schoolInfoCache = {
        name: '',
        address: '',
        logo: '',
        loaded: false
    };
    
    // ========== LIBRARY LOADERS ==========
    const LIB_URLS = {
        html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
        jspdf:       'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        jszip:       'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    };
    const loadedLibs = {};
    
    function loadScriptOnce(url) {
        if (loadedLibs[url]) return loadedLibs[url];
        loadedLibs[url] = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Failed to load script: ' + url));
            document.head.appendChild(s);
        });
        return loadedLibs[url];
    }
    async function ensureHtml2Canvas() { await loadScriptOnce(LIB_URLS.html2canvas); }
    async function ensureJsPDF()       { await loadScriptOnce(LIB_URLS.jspdf); }
    async function ensureJSZip()       { await loadScriptOnce(LIB_URLS.jszip); }
    
    // ========== HELPERS ==========
    function toNepaliDigits(number) {
        return String(number).split('').map(digit => NEPALI_DIGITS[parseInt(digit)] || digit).join('');
    }
    
    function nepaliToEnglishNumber(nepaliNum) {
        if (!nepaliNum) return null;
        const str = String(nepaliNum);
        let result = '';
        for (let char of str) {
            if (NEPALI_DIGITS.includes(char)) {
                result += NEPALI_DIGITS.indexOf(char).toString();
            } else {
                result += char;
            }
        }
        return parseInt(result);
    }
    
    function nepaliYearToEnglish(nepaliYear) {
        if (!nepaliYear) return null;
        return nepaliToEnglishNumber(nepaliYear);
    }
    
    function getDayTypeStyle(dayType) {
        if (!dayType) return DEFAULT_STYLE;
        for (const [key, style] of Object.entries(DAY_TYPE_STYLES)) {
            if (dayType.toLowerCase().includes(key.toLowerCase())) return style;
        }
        return DEFAULT_STYLE;
    }
    
    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        })[c]);
    }
    
    // ========== SCHOOL INFO ==========
    async function fetchSchoolInfo() {
        if (schoolInfoCache.loaded) return schoolInfoCache;
        try {
            const names = 'SchoolName,SchoolAddress,SchoolLogo';
            const url = `${SUPABASE_URL}/rest/v1/${ABOUT_TABLE}?select=Name,Value&Name=in.(${names})`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const rows = await response.json();
            (rows || []).forEach(row => {
                if (row.Name === 'SchoolName')    schoolInfoCache.name    = row.Value || '';
                if (row.Name === 'SchoolAddress') schoolInfoCache.address = row.Value || '';
                if (row.Name === 'SchoolLogo')    schoolInfoCache.logo    = row.Value || '';
            });
            schoolInfoCache.loaded = true;
        } catch (err) {
            console.warn('Could not fetch school info:', err.message);
            schoolInfoCache.loaded = true;
        }
        return schoolInfoCache;
    }
    
    // Live school header (with export buttons)
    function renderSchoolHeader() {
        const name    = escapeHtml(schoolInfoCache.name    || '');
        const address = escapeHtml(schoolInfoCache.address || '');
        const logo    = schoolInfoCache.logo || '';
        const logoImg = logo
            ? `<img src="${escapeHtml(logo)}" alt="School Logo" class="school-header-logo-img" onerror="this.style.display='none'; this.parentNode.classList.add('no-logo');" />`
            : '';
        return `
            <div class="school-header">
                <div class="school-header-logo">${logoImg}</div>
                <div class="school-header-text">
                    <div class="school-header-name">${name || '&nbsp;'}</div>
                    <div class="school-header-address">${address || '&nbsp;'}</div>
                    <div class="school-header-title">EDUCATIONAL-CALENDAR</div>
                </div>
                <div class="header-actions" id="calendarExportButtons">
                    <button type="button" class="header-action-btn" id="btnExportCalendarJPG">💾 Save as JPG</button>
                    <button type="button" class="header-action-btn" id="btnExportCalendarPDF">📄 Save as PDF</button>
                </div>
            </div>`;
    }
    
    // Export header (no buttons)
    function renderSchoolHeaderForExport() {
        const name    = escapeHtml(schoolInfoCache.name    || '');
        const address = escapeHtml(schoolInfoCache.address || '');
        const logo    = schoolInfoCache.logo || '';
        const logoImg = logo
            ? `<img src="${escapeHtml(logo)}" alt="School Logo" class="school-header-logo-img" />`
            : '';
        return `
            <div class="school-header export-mode">
                <div class="school-header-logo">${logoImg}</div>
                <div class="school-header-text">
                    <div class="school-header-name">${name || '&nbsp;'}</div>
                    <div class="school-header-address">${address || '&nbsp;'}</div>
                    <div class="school-header-title">EDUCATIONAL-CALENDAR</div>
                </div>
            </div>`;
    }
    
    // ========== EVENT DIALOG ==========
    function showEventDetails(entry, dayNumber) {
        const existingDialog = document.getElementById('eventDetailDialog');
        if (existingDialog) existingDialog.remove();
        
        const nepaliDayNumber = entry.n_day || toNepaliDigits(dayNumber);
        const monthName = NEPALI_MONTHS_DISPLAY[entry.monthIndex] || entry.n_month;
        const yearDisplay = entry.n_year_display || entry.n_year || toNepaliDigits(currentYear);
        
        let eventDetailsHtml = '';
        if (entry.event_detail && entry.event_detail.trim() !== '') {
            eventDetailsHtml += `<div class="detail-section"><h4>📝 विवरण</h4><p>${entry.event_detail}</p></div>`;
        } else {
            eventDetailsHtml += `<div class="detail-section"><p class="no-details">कुनै विवरण उपलब्ध छैन </p></div>`;
        }
        
        let additionalInfo = '';
        if (entry.tithi && entry.tithi.trim() !== '')
            additionalInfo += `<div class="info-row"><strong>🌙 तिथि:</strong> ${entry.tithi}</div>`;
        if (entry.national_event && entry.national_event.trim() !== '')
            additionalInfo += `<div class="info-row"><strong>राष्ट्रिय घटना:</strong> ${entry.national_event}</div>`;
        if (entry.local_event && entry.local_event.trim() !== '')
            additionalInfo += `<div class="info-row"><strong>🏘️ स्थानीय घटना:</strong> ${entry.local_event}</div>`;
        if (entry.day_type && entry.day_type.trim() !== '')
            additionalInfo += `<div class="info-row"><strong>📌 दिनको प्रकार:</strong> ${entry.day_type}</div>`;
        
        const dialogHtml = `
            <div id="eventDetailDialog" class="event-dialog-overlay">
                <div class="event-dialog">
                    <button class="event-dialog-close">✕</button>
                    <div class="event-dialog-header">
                        <h2>📅 ${monthName} ${nepaliDayNumber}, ${yearDisplay}</h2>
                        ${entry.e_month_name && entry.e_day ? `<p class="ad-date">${entry.e_month_name} ${entry.e_day}, ${entry.e_year || ''}</p>` : ''}
                        ${entry.e_day_of_week ? `<p class="day-of-week">${entry.e_day_of_week}</p>` : ''}
                    </div>
                    <div class="event-dialog-body">
                        ${additionalInfo ? `<div class="additional-info">${additionalInfo}</div>` : ''}
                        ${eventDetailsHtml}
                    </div>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
        const dialog = document.getElementById('eventDetailDialog');
        dialog.querySelector('.event-dialog-close').addEventListener('click', () => dialog.remove());
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    }
    
    // ========== CALENDAR DATA ==========
    let calendarData = [];
    let currentMonthIndex = 0;
    let currentYear = 2083;
    let todayInfo = null;
    let allDataMap = null;
    
    async function fetchCalendarData() {
        try {
            const url = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&order=n_month.asc,n_day.asc`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log(`✅ Loaded ${data.length} records`);
            return data;
        } catch (err) {
            console.error('Failed to fetch:', err);
            throw err;
        }
    }
    
    function buildDataMap(rows) {
        const map = new Map();
        for (const row of rows) {
            const monthIndex = NEPALI_MONTHS.indexOf(row.n_month);
            const dayNum = nepaliToEnglishNumber(row.n_day);
            const key = `${monthIndex}_${dayNum}`;
            map.set(key, {
                ...row,
                monthIndex, n_day_num: dayNum,
                e_year: row.e_year ? parseInt(row.e_year) : null,
                e_month_num: row.e_month ? ENGLISH_MONTHS[row.e_month] : null,
                e_month_name: row.e_month,
                e_day: row.e_day ? parseInt(row.e_day) : null,
                e_day_of_week: row.e_day_of_week,
                n_year_num: row.n_year ? nepaliYearToEnglish(row.n_year) : null,
                n_year_display: row.n_year,
                n_month: row.n_month,
                n_day: row.n_day,
                n_day_of_week: row.n_day_of_week,
                tithi: row.tithi,
                national_event: row.national_event,
                local_event: row.local_event,
                event_detail: row.event_detail,
                day_type: row.day_type
            });
        }
        return map;
    }
    
    function findTodayInData(dataMap) {
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();
        const monthNames = ['January','February','March','April','May','June',
                            'July','August','September','October','November','December'];
        const todayMonthName = monthNames[todayMonth - 1];
        for (let [key, entry] of dataMap) {
            if (entry.e_year === todayYear && entry.e_month_name === todayMonthName && entry.e_day === todayDay) {
                const nepaliMonthIndex = NEPALI_MONTHS.indexOf(entry.n_month);
                return {
                    englishDate: { year: todayYear, month: todayMonth, monthName: todayMonthName, day: todayDay },
                    nepaliDate: {
                        year: entry.n_year_num,
                        yearDisplay: entry.n_year_display,
                        monthName: entry.n_month,
                        monthIndex: nepaliMonthIndex,
                        day: entry.n_day_num,
                        dayDisplay: entry.n_day
                    },
                    entry
                };
            }
        }
        console.warn("❌ Today's date not found");
        return null;
    }
    
    function getUpcomingEvents(dataMap, todayInfo) {
        if (!todayInfo) return [];
        const events = [];
        const todayDate = new Date(todayInfo.englishDate.year, todayInfo.englishDate.month - 1, todayInfo.englishDate.day);
        for (let [key, entry] of dataMap) {
            const hasEvent = (entry.national_event && entry.national_event.trim() !== '') ||
                             (entry.local_event && entry.local_event.trim() !== '');
            if (!hasEvent) continue;
            if (entry.e_year && entry.e_month_name && entry.e_day) {
                const monthNum = ENGLISH_MONTHS[entry.e_month_name];
                const entryDate = new Date(entry.e_year, monthNum - 1, entry.e_day);
                const diffDays = Math.ceil((entryDate - todayDate) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0) {
                    events.push({
                        entry,
                        nepaliDate: `${entry.n_month} ${entry.n_day}, ${entry.n_year_display}`,
                        eventText: entry.national_event || entry.local_event,
                        eventType: entry.national_event ? 'national' : 'local',
                        remainingDays: diffDays,
                        dayStyle: getDayTypeStyle(entry.day_type),
                        key
                    });
                }
            }
        }
        events.sort((a, b) => a.remainingDays - b.remainingDays);
        return events;
    }
    
    function renderEventsList(events) {
        const eventsContainer = document.getElementById('eventsListContainer');
        if (!eventsContainer) return;
        if (events.length === 0) {
            eventsContainer.innerHTML = `<div class="no-events"><p>🎉 कुनै आगामी कार्यक्रमहरू छैनन्</p></div>`;
            return;
        }
        let eventsHtml = `
            <div class="events-header">
                <h3>📅 आगामी कार्यक्रमहरू</h3>
                <p>${events.length} events found</p>
            </div>
            <div class="events-list">`;
        events.forEach(event => {
            const remainingText = event.remainingDays === 0 ? 'आज' :
                                 event.remainingDays === 1 ? 'भोलि' :
                                 `${event.remainingDays} दिनमा`;
            const eventIcon = event.eventType === 'national' ? '🇳🇵' : '🏘️';
            const eventTypeClass = event.eventType === 'national' ? 'event-national-badge' : 'event-local-badge';
            eventsHtml += `
                <div class="event-item" data-key="${event.key}" style="background: ${event.dayStyle.background}; border-left: ${event.dayStyle.border};">
                    <div class="event-date">
                        <div class="nepali-date">${event.nepaliDate}</div>
                        <div class="remaining-days ${event.remainingDays === 0 ? 'today-badge' : ''}">${remainingText}</div>
                    </div>
                    <div class="event-info">
                        <span class="event-type ${eventTypeClass}">${eventIcon} ${event.eventType === 'national' ? 'राष्ट्रिय' : 'स्थानीय'}</span>
                        <div class="event-title">${event.eventText}</div>
                    </div>
                </div>`;
        });
        eventsHtml += `</div>`;
        eventsContainer.innerHTML = eventsHtml;
        eventsContainer.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', () => {
                const entry = allDataMap.get(item.getAttribute('data-key'));
                if (entry) showEventDetails(entry, entry.n_day_num);
            });
        });
    }
    
    // ========== GRID BUILDERS ==========
    function getDaysInMonth(monthIndex, dataMap) {
        let maxDay = 0;
        for (let i = 1; i <= 35; i++) {
            if (dataMap.has(`${monthIndex}_${i}`)) maxDay = i;
        }
        return maxDay;
    }
    
    function getFirstDayOfMonth(monthIndex, dataMap) {
        const entry = dataMap.get(`${monthIndex}_1`);
        if (entry && entry.e_day_of_week) {
            const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
            return dayMap[entry.e_day_of_week] || 0;
        }
        return 0;
    }
    
    function getDateRangeForMonth(monthIndex, dataMap) {
        const daysInMonth = getDaysInMonth(monthIndex, dataMap);
        const firstEntry = dataMap.get(`${monthIndex}_1`);
        const lastEntry = dataMap.get(`${monthIndex}_${daysInMonth}`);
        let startAD = '', endAD = '';
        if (firstEntry && firstEntry.e_month_name && firstEntry.e_day) startAD = `${firstEntry.e_month_name} ${firstEntry.e_day}`;
        if (lastEntry  && lastEntry.e_month_name  && lastEntry.e_day)  endAD   = `${lastEntry.e_month_name} ${lastEntry.e_day}`;
        if (startAD && endAD && startAD !== endAD) return `${startAD} - ${endAD}, ${firstEntry?.e_year || ''}`;
        if (startAD) return `${startAD}, ${firstEntry?.e_year || ''}`;
        return '';
    }
    
    function buildMonthDaysHTML(monthIndex, dataMap, { markToday }) {
        const daysInMonth = getDaysInMonth(monthIndex, dataMap);
        const firstDayOfWeek = getFirstDayOfMonth(monthIndex, dataMap);
        let html = '';
        for (let i = 0; i < firstDayOfWeek; i++) html += `<div class="calendar-day empty"></div>`;
        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${monthIndex}_${day}`;
            const entry = dataMap.get(key);
            let eventDetails = '';
            let hasEvent = false;
            let dayStyle = DEFAULT_STYLE;
            const isToday = markToday && todayInfo &&
                            todayInfo.nepaliDate.monthIndex === monthIndex &&
                            todayInfo.nepaliDate.day === day;
            if (entry) {
                if (entry.day_type) { dayStyle = getDayTypeStyle(entry.day_type); hasEvent = true; }
                const events = [];
                if (entry.national_event && entry.national_event.trim() !== '') { events.push(`<div class="event-national">${entry.national_event}</div>`); hasEvent = true; }
                if (entry.local_event && entry.local_event.trim() !== '') { events.push(`<div class="event-local">${entry.local_event}</div>`); hasEvent = true; }
                if (entry.tithi && entry.tithi.trim() !== '') { events.push(`<div class="event-tithi">${entry.tithi}</div>`); hasEvent = true; }
                eventDetails = events.join('');
            }
            const nepaliDayNumber = entry ? entry.n_day : toNepaliDigits(day);
            let adDate = '';
            if (entry && entry.e_month_name && entry.e_day) adDate = `${entry.e_month_name} ${entry.e_day}`;
            const dayBackground = entry && entry.day_type ? dayStyle.background : '';
            const dayBorder     = entry && entry.day_type ? dayStyle.border     : '';
            let dayStyleAttr = '';
            if (dayBackground) dayStyleAttr += `background: ${dayBackground}; `;
            if (dayBorder)     dayStyleAttr += `border: ${dayBorder}; `;
            const todayClass = isToday ? 'today-date' : '';
            html += `
                <div class="calendar-day ${hasEvent ? 'has-event' : ''} ${todayClass}"
                     style="${dayStyleAttr}"
                     data-day="${day}"
                     data-has-data="${!!entry}">
                    <div class="calendar-day-header">
                        <span class="calendar-day-number">${nepaliDayNumber}</span>
                        ${adDate ? `<span class="calendar-ad-date">${adDate}</span>` : ''}
                    </div>
                    <div class="calendar-day-events">${eventDetails}</div>
                </div>`;
        }
        return html;
    }
    
    // ========== LIVE CALENDAR ==========
    function renderCalendar(dataMap) {
        const container = document.getElementById('nepaliCalendarContainer');
        if (!container) return;
        
        const daysInMonth = getDaysInMonth(currentMonthIndex, dataMap);
        if (daysInMonth === 0) {
            container.innerHTML = `
                <div class="calendar-error">
                    <h3>⚠️ No Data Available</h3>
                    <button onclick="window.showCalendar()" class="retry-btn">Retry</button>
                </div>`;
            return;
        }
        
        const nepaliMonthName = NEPALI_MONTHS_DISPLAY[currentMonthIndex];
        const dateRange = getDateRangeForMonth(currentMonthIndex, dataMap);
        const nepaliYearDisplay = toNepaliDigits(currentYear);
        const daysHTML = buildMonthDaysHTML(currentMonthIndex, dataMap, { markToday: true });
        
        let html = `
            <div class="nepali-calendar-modal-overlay">
                <div class="nepali-calendar-wrapper">
                    <button class="calendar-close-btn" id="closeCalendarBtn">✕</button>
                    ${renderSchoolHeader()}
                    <div class="calendar-header">
                        <div class="calendar-nav-section">
                            <button class="calendar-nav-btn" id="prevMonthBtn">◀</button>
                            <button class="calendar-nav-btn today-btn" id="todayBtn">📅 आज</button>
                            <div class="calendar-title">
                                <h1>${nepaliMonthName} ${nepaliYearDisplay}</h1>
                                <p class="calendar-subtitle">${dateRange}</p>
                            </div>
                            <button class="calendar-nav-btn" id="nextMonthBtn">▶</button>
                        </div>
                    </div>
                    <div class="calendar-weekdays">
                        ${NEPALI_DAYS_SHORT.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
                    </div>
                    <div class="calendar-days-grid">${daysHTML}</div>
                    <div id="eventsListContainer" class="events-list-container"></div>
                    <div class="calendar-footer">
                        <div class="footer-center">
                            <span class="legend-item"><span class="legend-color holiday"></span> सार्वजनिक बिदा</span>
                            <span class="legend-item"><span class="legend-color study-time"></span>पठनपाठन समय</span>
                            <span class="legend-item"><span class="legend-color exam-time"></span>परीक्षा समय</span>
                            <span class="legend-item"><span class="legend-color summer-vacation"></span>बर्षे विदा</span>
                            <span class="legend-item"><span class="legend-color winter-vacation"></span>हिउँदे विदा</span>
                            <span class="legend-item"><span class="legend-color other-school-time"></span>अन्य विद्यालय समय</span>
                            <span class="legend-item"><span class="legend-color other-vacation"></span>अन्य विदा</span>
                        </div>
                    </div>
                </div>
            </div>`;
        
        container.innerHTML = html;
        
        container.querySelectorAll('.calendar-day[data-has-data="true"]').forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayNum = parseInt(dayElement.getAttribute('data-day'));
                const entry = dataMap.get(`${currentMonthIndex}_${dayNum}`);
                if (entry) showEventDetails(entry, dayNum);
            });
        });
        
        renderEventsList(getUpcomingEvents(dataMap, todayInfo));
        
        document.getElementById('prevMonthBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMonthIndex = (currentMonthIndex - 1 + 12) % 12;
            renderCalendar(dataMap);
        });
        document.getElementById('nextMonthBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMonthIndex = (currentMonthIndex + 1) % 12;
            renderCalendar(dataMap);
        });
        
        const todayBtn = document.getElementById('todayBtn');
        if (todayBtn) {
            const newTodayBtn = todayBtn.cloneNode(true);
            todayBtn.parentNode.replaceChild(newTodayBtn, todayBtn);
            newTodayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (todayInfo && todayInfo.nepaliDate.monthIndex !== undefined) {
                    currentMonthIndex = todayInfo.nepaliDate.monthIndex;
                    currentYear = todayInfo.nepaliDate.year;
                    renderCalendar(dataMap);
                    setTimeout(() => {
                        const todayElement = container.querySelector('.calendar-day.today-date');
                        if (todayElement) {
                            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                            todayElement.classList.add('today-pulse');
                            setTimeout(() => todayElement.classList.remove('today-pulse'), 1000);
                        }
                    }, 100);
                } else {
                    alert("Today's date not found in calendar data.");
                }
            });
        }
        
        document.getElementById('closeCalendarBtn')?.addEventListener('click', () => {
            container.style.display = 'none';
        });
        
        document.getElementById('btnExportCalendarJPG')?.addEventListener('click', (e) => {
            e.stopPropagation();
            exportCalendarAsJPG();
        });
        document.getElementById('btnExportCalendarPDF')?.addEventListener('click', (e) => {
            e.stopPropagation();
            exportCalendarAsPDF();
        });
    }
    
    // ========== EXPORT: BUILD MONTH BLOCKS ==========
    function buildExportMonthBlock(monthIndex, dataMap, year) {
        const nepaliMonthName = NEPALI_MONTHS_DISPLAY[monthIndex];
        const nepaliYearDisplay = toNepaliDigits(year);
        const dateRange = getDateRangeForMonth(monthIndex, dataMap);
        const daysHTML = buildMonthDaysHTML(monthIndex, dataMap, { markToday: false });
        return `
            <div class="export-month-page">
                ${renderSchoolHeaderForExport()}
                <div class="export-month-title">
                    <h1>${nepaliMonthName} ${nepaliYearDisplay}</h1>
                    <p>${dateRange}</p>
                </div>
                <div class="calendar-weekdays export-weekdays">
                    ${NEPALI_DAYS_SHORT.map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
                </div>
                <div class="calendar-days-grid export-grid">
                    ${daysHTML}
                </div>
            </div>`;
    }
    
    function buildAllMonthsForExport(dataMap, year) {
        const hidden = document.createElement('div');
        hidden.id = 'calendarExportStaging';
        hidden.className = 'calendar-export-staging';
        hidden.style.position = 'fixed';
        hidden.style.left = '0';
        hidden.style.top = '0';
        hidden.style.width = '1400px';
        hidden.style.transform = 'translateX(-200vw)';
        hidden.style.background = '#ffffff';
        hidden.style.zIndex = '-1';
        hidden.style.pointerEvents = 'none';
        
        let html = '';
        for (let m = 0; m < 12; m++) {
            html += buildExportMonthBlock(m, dataMap, year);
        }
        hidden.innerHTML = html;
        document.body.appendChild(hidden);
        return hidden;
    }
    
    // ========== PROGRESS OVERLAY ==========
    function showExportOverlay(message) {
        let overlay = document.getElementById('calendarExportOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'calendarExportOverlay';
            overlay.className = 'export-overlay';
            overlay.innerHTML = `
                <div class="export-overlay-box">
                    <div class="export-spinner"></div>
                    <div class="export-message" id="calendarExportMessage">${message || 'Preparing…'}</div>
                    <div class="export-submessage" id="calendarExportSub">Please wait, do not close this window.</div>
                </div>`;
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
            const msg = document.getElementById('calendarExportMessage');
            if (msg) msg.textContent = message || 'Preparing…';
        }
    }
    function updateExportOverlay(message, sub) {
        const msg = document.getElementById('calendarExportMessage');
        const subEl = document.getElementById('calendarExportSub');
        if (msg)   msg.textContent = message;
        if (subEl && sub !== undefined) subEl.textContent = sub;
    }
    function hideExportOverlay() {
        const overlay = document.getElementById('calendarExportOverlay');
        if (overlay) overlay.style.display = 'none';
    }
    
    // ========== EXPORT: JPG (ZIP) ==========
    async function exportCalendarAsJPG() {
        if (!allDataMap || allDataMap.size === 0) {
            alert('Calendar data not loaded yet.');
            return;
        }
        const year = Number.isFinite(currentYear) ? currentYear : 2083;
        
        try {
            showExportOverlay('Loading libraries…');
            await Promise.all([ensureHtml2Canvas(), ensureJSZip()]);
            
            updateExportOverlay('Rendering months…', 'This may take a few seconds.');
            const staging = buildAllMonthsForExport(allDataMap, year);
            const monthPages = Array.from(staging.querySelectorAll('.export-month-page'));
            
            const zip = new JSZip();
            const yearStr = String(year);
            
            for (let m = 0; m < monthPages.length; m++) {
                updateExportOverlay(`Generating month ${m + 1} of ${monthPages.length}…`, NEPALI_MONTHS_DISPLAY[m] || '');
                const canvas = await html2canvas(monthPages[m], {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    useCORS: true
                });
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                const base64 = dataUrl.split(',')[1];
                const monthNum = String(m + 1).padStart(2, '0');
                const fname = `NepaliCalendar_${yearStr}_${monthNum}_${MONTH_NAMES_EN[m]}.jpg`;
                zip.file(fname, base64, { base64: true });
            }
            
            updateExportOverlay('Packaging ZIP file…', '');
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            const a = document.createElement('a');
            a.href = URL.createObjectURL(zipBlob);
            a.download = `NepaliCalendar_${yearStr}.zip`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                URL.revokeObjectURL(a.href);
                document.body.removeChild(a);
            }, 1000);
            
            staging.remove();
            hideExportOverlay();
        } catch (err) {
            console.error('JPG export failed:', err);
            hideExportOverlay();
            alert('JPG export failed: ' + err.message);
            document.getElementById('calendarExportStaging')?.remove();
        }
    }
    
    // ========== EXPORT: PDF ==========
    async function exportCalendarAsPDF() {
        if (!allDataMap || allDataMap.size === 0) {
            alert('Calendar data not loaded yet.');
            return;
        }
        const year = Number.isFinite(currentYear) ? currentYear : 2083;
        
        try {
            showExportOverlay('Loading libraries…');
            await Promise.all([ensureHtml2Canvas(), ensureJsPDF()]);
            
            const jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
            if (!jsPDFCtor) throw new Error('jsPDF not available.');
            
            updateExportOverlay('Rendering months…', 'This may take a few seconds.');
            const staging = buildAllMonthsForExport(allDataMap, year);
            const monthPages = Array.from(staging.querySelectorAll('.export-month-page'));
            
            const pdf = new jsPDFCtor({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            
            for (let m = 0; m < monthPages.length; m++) {
                updateExportOverlay(`Generating page ${m + 1} of ${monthPages.length}…`, NEPALI_MONTHS_DISPLAY[m] || '');
                const canvas = await html2canvas(monthPages[m], {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    useCORS: true
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                const aspect = canvas.width / canvas.height;
                const pageAspect = pageW / pageH;
                let drawW, drawH;
                if (aspect > pageAspect) { drawW = pageW; drawH = pageW / aspect; }
                else                     { drawH = pageH; drawW = pageH * aspect; }
                const drawX = (pageW - drawW) / 2;
                const drawY = (pageH - drawH) / 2;
                if (m > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');
            }
            
            updateExportOverlay('Saving PDF…', '');
            pdf.save(`NepaliCalendar_${year}.pdf`);
            
            staging.remove();
            hideExportOverlay();
        } catch (err) {
            console.error('PDF export failed:', err);
            hideExportOverlay();
            alert('PDF export failed: ' + err.message);
            document.getElementById('calendarExportStaging')?.remove();
        }
    }
    
    // ========== MAIN ==========
    async function initializeAndShowCalendar() {
        let container = document.getElementById('nepaliCalendarContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'nepaliCalendarContainer';
            document.body.appendChild(container);
        }
        
        container.innerHTML = `
            <div class="calendar-loading">
                <div class="loading-spinner"></div>
                <p>📅 लोड हुँदै... (Loading Nepali Calendar)</p>
            </div>`;
        container.style.display = 'flex';
        
        try {
            const [_, data] = await Promise.all([fetchSchoolInfo(), fetchCalendarData()]);
            calendarData = data;
            allDataMap = buildDataMap(data);
            if (allDataMap.size === 0) throw new Error('No calendar data available');
            todayInfo = findTodayInData(allDataMap);
            if (todayInfo) {
                currentMonthIndex = todayInfo.nepaliDate.monthIndex;
                currentYear = todayInfo.nepaliDate.year;
            } else {
                currentMonthIndex = 0;
                currentYear = 2083;
            }
            renderCalendar(allDataMap);
        } catch (err) {
            console.error('Calendar error:', err);
            container.innerHTML = `
                <div class="calendar-error">
                    <h3>⚠️ Error Loading Calendar</h3>
                    <p>${err.message}</p>
                    <button onclick="window.showCalendar()" class="retry-btn">Retry</button>
                </div>`;
        }
    }
    
    window.showCalendar = function() { initializeAndShowCalendar(); };
    
    document.addEventListener('click', function(e) {
        const container = document.getElementById('nepaliCalendarContainer');
        if (container && container.style.display === 'flex' && e.target === container) {
            container.style.display = 'none';
        }
    });
    
    // ========== STYLES ==========
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #nepaliCalendarContainer {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(119, 119, 119, 0.95);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', 'Roboto', 'Noto Sans', 'Poppins', sans-serif;
            }
            
            .nepali-calendar-modal-overlay {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .nepali-calendar-wrapper {
                background: linear-gradient(135deg, #bb7777 0%, #aa9999 100%);
                border-radius: 24px;
                width: 95%;
                max-width: 1400px;
                max-height: 90%;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                position: relative;
                animation: slideIn 0.3s ease;
            }
            
            /* ============================================================
               SCHOOL HEADER (centered, with export buttons)
               ============================================================ */
            .school-header {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                gap: 12px;
                padding: 26px 24px 22px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2b2b2b 50%, #1a1a1a 100%);
                border-radius: 24px 24px 0 0;
                border-bottom: 4px solid #FFD700;
                color: #ffffff;
                position: relative;
                overflow: hidden;
            }
            .school-header::before {
                content: "";
                position: absolute;
                inset: 0;
                background:
                    radial-gradient(circle at 20% 10%, rgba(255,215,0,0.06), transparent 55%),
                    radial-gradient(circle at 80% 90%, rgba(192,57,43,0.10), transparent 55%);
                pointer-events: none;
            }
            .school-header-logo {
                flex: 0 0 auto;
                width: 110px;
                height: 110px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 1;
            }
            .school-header-logo.no-logo::after {
                content: "🏫";
                font-size: 3rem;
                opacity: 0.6;
            }
            .school-header-logo-img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                display: block;
                filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
            }
            .school-header-text {
                position: relative;
                z-index: 1;
                line-height: 1.2;
                max-width: 100%;
            }
            .school-header-name {
                font-size: 2.4rem;
                font-weight: 800;
                letter-spacing: 1.5px;
                color: #FFD700;
                text-shadow:
                    0 0 12px rgba(255,215,0,0.35),
                    1px 2px 4px rgba(0,0,0,0.7);
                margin-bottom: 4px;
                word-wrap: break-word;
                font-family: 'Segoe UI', 'Roboto', 'Noto Sans', sans-serif;
            }
            .school-header-address {
                font-size: 1.15rem;
                color: #e8e8e8;
                letter-spacing: 0.5px;
                font-weight: 400;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                word-wrap: break-word;
            }
            .school-header-title {
                font-size: 1.15rem;
                font-weight: 700;
                letter-spacing: 6px;
                color: #ffffff;
                margin-top: 12px;
                padding: 6px 22px;
                background: linear-gradient(90deg, #8B1A1A 0%, #C0392B 50%, #8B1A1A 100%);
                border-radius: 24px;
                display: inline-block;
                text-transform: uppercase;
                box-shadow:
                    0 4px 14px rgba(192,57,43,0.45),
                    inset 0 1px 0 rgba(255,255,255,0.18);
                border: 1px solid rgba(255,215,0,0.35);
                text-shadow: 1px 1px 2px rgba(0,0,0,0.45);
            }
            
            /* Export buttons (never included in exported files) */
            .header-actions {
                position: relative;
                z-index: 2;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: center;
                margin-top: 14px;
            }
            .header-action-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                font-size: 1rem;
                font-weight: 700;
                color: #ffffff;
                background: linear-gradient(180deg, #0d6efd 0%, #0a58ca 100%);
                border: 2px solid rgba(255,215,0,0.5);
                border-radius: 24px;
                cursor: pointer;
                transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
                box-shadow: 0 4px 12px rgba(13,110,253,0.35);
                font-family: inherit;
            }
            .header-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(13,110,253,0.5);
                color: #FFD700;
            }
            .header-action-btn:active { transform: translateY(0); }
            #btnExportCalendarPDF {
                background: linear-gradient(180deg, #dc3545 0%, #a71d2a 100%);
                box-shadow: 0 4px 12px rgba(220,53,69,0.35);
            }
            #btnExportCalendarPDF:hover {
                box-shadow: 0 8px 20px rgba(220,53,69,0.5);
                color: #FFD700;
            }
            
            /* ============================================================
               EXPORT STAGING + MONTH BLOCKS
               ============================================================ */
            .calendar-export-staging {
                font-family: 'Segoe UI', 'Roboto', 'Noto Sans', 'Poppins', sans-serif;
                color: #222;
            }
            .export-month-page {
                width: 1400px;
                background: #ffffff;
                padding: 24px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                border-bottom: 1px dashed #cccccc;
            }
            .export-month-page .school-header {
                border-radius: 16px 16px 0 0;
                border-bottom: 4px solid #FFD700;
                padding: 22px 24px 18px;
                gap: 10px;
            }
            .export-month-title {
                text-align: center;
                padding: 16px 20px 10px;
                background: linear-gradient(135deg, #8B1A1A 0%, #C0392B 100%);
                color: #ffffff;
                border-radius: 0 0 12px 12px;
                margin-bottom: 14px;
            }
            .export-month-title h1 {
                margin: 0;
                font-size: 2rem;
                letter-spacing: 2px;
                color: #FFD700;
                text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
            }
            .export-month-title p {
                margin: 6px 0 0 0;
                font-size: 1rem;
                color: #f2e8c6;
            }
            .export-weekdays { padding: 0 6px; margin-bottom: 10px; }
            .export-grid { padding: 0 6px 6px; }
            .export-grid .calendar-day { min-height: 165px; }
            
            /* ============================================================
               EXPORT PROGRESS OVERLAY
               ============================================================ */
            .export-overlay {
                position: fixed;
                inset: 0;
                z-index: 10050;
                background: rgba(0, 0, 0, 0.72);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.15s ease;
            }
            .export-overlay-box {
                background: #ffffff;
                padding: 30px 40px;
                border-radius: 16px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                min-width: 280px;
                max-width: 90vw;
            }
            .export-spinner {
                width: 46px;
                height: 46px;
                margin: 0 auto 16px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #C0392B;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            .export-message {
                font-size: 1.1rem;
                font-weight: 700;
                color: #222;
                margin-bottom: 6px;
            }
            .export-submessage {
                font-size: 0.85rem;
                color: #666;
            }
            
            /* ============================================================
               EVENTS LIST
               ============================================================ */
            .events-list-container {
                margin: 20px 15px;
                background: white;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .events-header {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e0e0e0;
            }
            .events-header h3 {
                margin: 0 0 5px 0;
                color: #8B1A1A;
                font-size: 1.5rem;
            }
            .events-header p {
                margin: 0;
                color: #666;
                font-size: 0.9rem;
            }
            .events-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 400px;
                overflow-y: auto;
            }
            .event-item {
                display: flex;
                gap: 15px;
                padding: 15px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            .event-item:hover {
                transform: translateX(5px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                filter: brightness(0.98);
            }
            .event-date {
                min-width: 140px;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .nepali-date {
                font-size: 1.1rem;
                font-weight: bold;
                color: #333;
                font-family: 'Noto Sans', monospace;
            }
            .remaining-days {
                font-size: 0.85rem;
                color: #666;
                padding: 2px 8px;
                background: #f0f0f0;
                border-radius: 20px;
                display: inline-block;
                width: fit-content;
            }
            .remaining-days.today-badge {
                background: #FF9800;
                color: white;
                font-weight: bold;
            }
            .event-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .event-type {
                font-size: 0.8rem;
                padding: 2px 8px;
                border-radius: 20px;
                width: fit-content;
                font-weight: 500;
            }
            .event-national-badge { background: #1565C0; color: white; }
            .event-local-badge    { background: #2E7D32; color: white; }
            .event-title {
                font-size: 1rem;
                color: #333;
                font-weight: 500;
            }
            .no-events {
                text-align: center;
                padding: 40px;
                color: #999;
            }
            .no-events p { margin: 5px 0; }
            
            /* ============================================================
               EVENT DIALOG
               ============================================================ */
            .event-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 10001;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.2s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .event-dialog {
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                animation: slideUp 0.3s ease;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(50px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .event-dialog-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #DC2626;
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .event-dialog-close:hover {
                background: #B91C1C;
                transform: scale(1.1);
            }
            .event-dialog-header {
                background: linear-gradient(135deg, #8B1A1A 0%, #C0392B 100%);
                color: white;
                padding: 20px;
                border-radius: 20px 20px 0 0;
                text-align: center;
            }
            .event-dialog-header h2 {
                margin: 0 0 5px 0;
                font-size: 1.8rem;
            }
            .event-dialog-header .ad-date {
                margin: 5px 0;
                font-size: 1rem;
                opacity: 0.9;
            }
            .event-dialog-header .day-of-week {
                margin: 5px 0 0 0;
                font-size: 0.9rem;
                opacity: 0.8;
            }
            .event-dialog-body { padding: 20px; }
            .additional-info {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 12px;
                margin-bottom: 20px;
            }
            .info-row {
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
                font-size: 0.95rem;
            }
            .info-row:last-child { border-bottom: none; }
            .detail-section { margin-top: 15px; }
            .detail-section h4 {
                color: #8B1A1A;
                margin: 0 0 10px 0;
                font-size: 1.1rem;
            }
            .detail-section p {
                line-height: 1.6;
                color: #333;
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .no-details {
                color: #999;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }
            
            /* ============================================================
               MAIN CALENDAR HEADER / NAV
               ============================================================ */
            @keyframes slideIn {
                from { opacity: 0; transform: scale(0.95) translateY(-20px); }
                to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
            
            .calendar-close-btn {
                position: absolute;
                top: 4px;
                right: 4px;
                background: #DC2626;
                color: white;
                border: none;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .calendar-close-btn:hover {
                background: #B91C1C;
                transform: scale(1.1) rotate(90deg);
            }
            
            .calendar-header {
                background: linear-gradient(135deg, #8B1A1A 0%, #C0392B 100%);
                padding: 25px 30px;
                border-radius: 10px 10px 0 0;
                margin-bottom: 20px;
            }
            .calendar-nav-section {
                display: flex;
                justify-content: space-evenly;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            .calendar-nav-btn {
                background: rgba(255,255,255,0.02);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 10px 24px;
                border-radius: 50px;
                transition: all 0.2s;
                font-weight: bold;
            }
            .calendar-nav-btn:hover {
                background: rgba(255,255,255,0.35);
                transform: scale(1.05);
                border-color: rgba(255,255,255,0.5);
            }
            .calendar-nav-btn:active { transform: scale(0.95); }
            .today-btn {
                background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%) !important;
                border: 2px solid #FFE0B2 !important;
                color: white !important;
                font-weight: bold !important;
                padding: 10px 20px !important;
                font-size: 1.2rem !important;
            }
            .today-btn:hover {
                background: linear-gradient(135deg, #F57C00 0%, #E65100 100%) !important;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(245, 124, 0, 0.4);
            }
            .calendar-title {
                text-align: center;
                flex: 1;
                min-width: 200px;
            }
            .calendar-title h1 {
                margin: 0;
                font-size: 2.5rem;
                color: #cccc33;
                font-weight: bold;
                letter-spacing: 2px;
                text-shadow: 5px 5px 7px rgba(0,0,0,0.2);
            }
            .calendar-subtitle {
                margin: 8px 0 0 0;
                font-size: 1.2rem;
                color: rgba(255,255,255,0.95);
                font-weight: 500;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .calendar-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 4px;
                padding: 0 15px;
                margin-bottom: 15px;
            }
            .calendar-weekday {
                text-align: center;
                padding: 8px 4px;
                font-weight: bold;
                font-size: 2rem;
                color: #cc3333;
                background: #000000;
                border-radius: 6px;
                font-family: 'Noto Sans', monospace;
            }
            .calendar-days-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 4px;
                padding: 0 6px;
            }
            .calendar-day {
                background: #dddddd;
                border-radius: 12px;
                padding: 10px;
                min-height: 150px;
                transition: all 0.2s;
                border: 2px solid #aaaaff;
                position: relative;
                overflow-y: auto;
                cursor: pointer;
            }
            .calendar-day[data-has-data="true"]:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
                filter: brightness(0.98);
                cursor: pointer;
            }
            .calendar-day.empty {
                background: transparent;
                border: 1px dashed transparent;
                cursor: default;
            }
            .calendar-day.has-event {
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .calendar-day.today-date {
                position: relative;
                background: linear-gradient(135deg, #fff9c4 0%, #fff176 100%);
                border: 3px solid #f57c00 !important;
                box-shadow: 0 0 0 2px rgba(245, 124, 0, 0.3), 0 4px 12px rgba(0,0,0,0.15);
            }
            .calendar-day.today-date .calendar-day-number {
                color: #e65100;
                font-weight: bold;
                text-shadow: 0 0 3px rgba(255,255,255,0.5);
                font-size: 2.5rem;
            }
            .calendar-day.today-date::before {
                content: "🔴";
                position: absolute;
                top: 5px;
                right: 8px;
                font-size: 14px;
                animation: blink 1.5s infinite;
            }
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50%      { opacity: 0.3; }
            }
            @keyframes todayPulse {
                0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(245, 124, 0, 0.7); }
                70%  { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(245, 124, 0, 0); }
                100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(245, 124, 0, 0); }
            }
            .today-pulse {
                animation: todayPulse 0.8s ease-in-out !important;
            }
            .calendar-day-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 8px;
                padding-bottom: 5px;
                border-bottom: 1px solid #F0DCC0;
            }
            .calendar-day-number {
                font-size: 2.3rem;
                font-weight: bold;
                color: #111111;
                font-family: 'Noto Sans', monospace;
            }
            .calendar-ad-date {
                font-size: 1.1rem;
                color: #0000aa;
                font-weight: 500;
            }
            .calendar-day-events {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .calendar-day-events > div {
                font-size: 1.1rem;
                line-height: 1.3;
                animation: fadeInUp 0.2s ease;
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(5px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .event-tithi    { color: #6A1B9A; text-align: center; font-size: 0.9rem; }
            .event-national { color: #1565C0; text-align: center; font-size: 0.9rem; }
            .event-local    { color: #2E7D32; text-align: center; font-size: 0.9rem; }
            
            .calendar-footer {
                margin-top: 12px;
                padding: 15px 25px;
                background: #8B1A1A;
                border-radius: 0 0 10px 10px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
                font-size: 0.85rem;
            }
            .footer-center {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            .legend-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 0.75rem;
            }
            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 4px;
                display: inline-block;
            }
            .legend-color.holiday           { background: #ffaaaa; border: 2px solid #aa5555; }
            .legend-color.study-time        { background: #aaffaa; border: 2px solid #55aa55; }
            .legend-color.exam-time         { background: #aaaaff; border: 2px solid #5555aa; }
            .legend-color.summer-vacation   { background: #ffffaa; border: 2px solid #aaaa55; }
            .legend-color.winter-vacation   { background: #ffaaff; border: 2px solid #aa55aa; }
            .legend-color.other-school-time { background: #aaffff; border: 2px solid #5555aa; }
            .legend-color.other-vacation    { background: #aaaaff; border: 2px solid #5555aa; }
            
            .calendar-loading, .calendar-error {
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
            }
            .loading-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #C0392B;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            @keyframes spin {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .calendar-error h3 {
                color: #C62828;
                margin-top: 0;
            }
            .retry-btn {
                background: #C0392B;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 10px;
                transition: all 0.2s;
            }
            .retry-btn:hover {
                background: #8B1A1A;
                transform: scale(1.05);
            }
            
            .nepali-calendar-wrapper::-webkit-scrollbar { width: 10px; }
            .nepali-calendar-wrapper::-webkit-scrollbar-track { background: transparent; }
            .nepali-calendar-wrapper::-webkit-scrollbar-thumb {
                background: #888888;
                border-radius: 10px;
            }
            .nepali-calendar-wrapper::-webkit-scrollbar-thumb:hover { background: #555555; }
            .events-list::-webkit-scrollbar { width: 8px; }
            .events-list::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            .events-list::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 10px;
            }
            .events-list::-webkit-scrollbar-thumb:hover { background: #555; }
            
            /* ============================================================
               RESPONSIVE
               ============================================================ */
            @media (max-width: 1024px) {
                .nepali-calendar-wrapper { width: 96%; max-height: 94vh; border-radius: 18px; }
                .school-header { padding: 22px 20px 18px; gap: 10px; border-radius: 18px 18px 0 0; }
                .school-header-logo { width: 95px; height: 95px; }
                .school-header-name { font-size: 2rem; letter-spacing: 1px; }
                .school-header-address { font-size: 1rem; }
                .school-header-title { font-size: 0.95rem; letter-spacing: 4px; padding: 5px 18px; margin-top: 10px; }
                .header-action-btn { font-size: 0.95rem; padding: 9px 16px; }
                .calendar-title h1 { font-size: 2rem; }
                .calendar-subtitle { font-size: 1rem; }
                .calendar-nav-btn { padding: 8px 18px; font-size: 1.2rem; }
                .today-btn { padding: 8px 16px !important; font-size: 1rem !important; }
                .calendar-day { min-height: 110px; padding: 8px; }
                .calendar-day-number { font-size: 1.8rem; }
                .calendar-ad-date { font-size: 0.9rem; }
                .calendar-day-events > div { font-size: 0.9rem; }
                .calendar-weekday { font-size: 1.3rem; padding: 7px 3px; }
                .events-list-container { margin: 14px 10px; padding: 14px; }
                .events-header h3 { font-size: 1.2rem; }
                .event-title { font-size: 0.95rem; }
            }
            @media (max-width: 900px) {
                .calendar-header { padding: 18px 20px; }
                .calendar-nav-section { gap: 10px; }
                .calendar-nav-btn { padding: 7px 14px; font-size: 1.05rem; }
                .today-btn { padding: 7px 14px !important; font-size: 0.95rem !important; }
                .calendar-title h1 { font-size: 1.7rem; }
                .calendar-title { min-width: 150px; }
                .calendar-weekday { font-size: 1.1rem; }
                .calendar-day { min-height: 100px; padding: 7px; border-radius: 10px; }
                .calendar-day-number { font-size: 1.5rem; }
                .calendar-ad-date { font-size: 0.8rem; }
                .calendar-day-events > div { font-size: 0.8rem; }
            }
            @media (max-width: 768px) {
                .nepali-calendar-wrapper { width: 98%; max-height: 96vh; border-radius: 14px; }
                .school-header { padding: 16px 14px 14px; gap: 8px; border-radius: 14px 14px 0 0; border-bottom-width: 3px; }
                .school-header-logo { width: 78px; height: 78px; }
                .school-header-name { font-size: 1.5rem; letter-spacing: 0.5px; }
                .school-header-address { font-size: 0.85rem; }
                .school-header-title { font-size: 0.78rem; letter-spacing: 3px; padding: 4px 14px; margin-top: 8px; }
                .header-action-btn { font-size: 0.85rem; padding: 8px 14px; }
                .header-actions { margin-top: 10px; gap: 8px; }
                .calendar-close-btn { width: 32px; height: 32px; font-size: 18px; top: 8px; right: 10px; }
                .calendar-header { padding: 14px 12px; margin-bottom: 12px; }
                .calendar-nav-section { flex-wrap: wrap; gap: 6px; justify-content: center; }
                .calendar-title { flex: 1 1 100%; order: 2; min-width: 0; }
                .calendar-title h1 { font-size: 1.4rem; letter-spacing: 1px; }
                .calendar-subtitle { font-size: 0.85rem; margin-top: 4px; }
                .calendar-nav-btn { padding: 6px 12px; font-size: 0.95rem; border-radius: 30px; }
                .today-btn { padding: 6px 12px !important; font-size: 0.9rem !important; }
                .calendar-weekdays { gap: 3px; padding: 0 8px; margin-bottom: 8px; }
                .calendar-weekday { font-size: 0.9rem; padding: 6px 2px; border-radius: 5px; }
                .calendar-days-grid { gap: 3px; padding: 0 4px; }
                .calendar-day { min-height: 85px; padding: 5px; border-radius: 8px; }
                .calendar-day-number { font-size: 1.15rem; }
                .calendar-ad-date { font-size: 0.65rem; }
                .calendar-day-header { margin-bottom: 4px; padding-bottom: 3px; }
                .calendar-day-events > div { font-size: 0.65rem; line-height: 1.15; }
                .calendar-day.today-date .calendar-day-number { font-size: 1.4rem; }
                .calendar-day.today-date::before { font-size: 10px; top: 3px; right: 5px; }
                .calendar-footer { padding: 10px 12px; font-size: 0.7rem; border-radius: 0 0 14px 14px; }
                .footer-center { gap: 10px; }
                .legend-item { font-size: 0.65rem; gap: 4px; }
                .legend-color { width: 12px; height: 12px; }
                .events-list-container { margin: 10px 8px; padding: 12px; border-radius: 12px; }
                .events-header { margin-bottom: 12px; }
                .events-header h3 { font-size: 1.05rem; }
                .events-header p { font-size: 0.8rem; }
                .events-list { gap: 8px; max-height: 320px; }
                .event-item { flex-direction: column; gap: 6px; padding: 10px; }
                .event-date { flex-direction: row; justify-content: space-between; align-items: center; min-width: 0; gap: 6px; }
                .nepali-date { font-size: 0.95rem; }
                .remaining-days { font-size: 0.75rem; padding: 2px 7px; }
                .event-info { gap: 3px; }
                .event-type { font-size: 0.7rem; padding: 2px 6px; }
                .event-title { font-size: 0.9rem; }
                .event-dialog { width: 94%; max-height: 84vh; border-radius: 14px; }
                .event-dialog-header { padding: 14px 12px; }
                .event-dialog-header h2 { font-size: 1.3rem; }
                .event-dialog-header .ad-date { font-size: 0.85rem; }
                .event-dialog-header .day-of-week { font-size: 0.8rem; }
                .event-dialog-body { padding: 14px; }
                .info-row { font-size: 0.85rem; padding: 6px 0; }
                .detail-section h4 { font-size: 1rem; }
                .detail-section p { font-size: 0.9rem; }
                .event-dialog-close { width: 28px; height: 28px; font-size: 16px; }
            }
            @media (max-width: 600px) {
                #nepaliCalendarContainer { padding: 0.25rem; }
                .nepali-calendar-wrapper { width: 100%; max-height: 98vh; border-radius: 10px; }
                .school-header { padding: 14px 10px 12px; gap: 6px; border-radius: 10px 10px 0 0; border-bottom-width: 3px; }
                .school-header-logo { width: 64px; height: 64px; }
                .school-header-name { font-size: 1.2rem; letter-spacing: 0; }
                .school-header-address { font-size: 0.75rem; }
                .school-header-title { font-size: 0.68rem; letter-spacing: 2px; padding: 3px 12px; margin-top: 6px; }
                .header-actions { margin-top: 8px; gap: 6px; width: 100%; }
                .header-action-btn { font-size: 0.8rem; padding: 8px 12px; flex: 1 1 45%; justify-content: center; }
                .calendar-header { padding: 10px 8px; margin-bottom: 8px; border-radius: 8px 8px 0 0; }
                .calendar-title h1 { font-size: 1.15rem; letter-spacing: 0; }
                .calendar-subtitle { font-size: 0.75rem; }
                .calendar-nav-btn { padding: 5px 10px; font-size: 0.85rem; }
                .today-btn { padding: 5px 10px !important; font-size: 0.8rem !important; }
                .calendar-weekdays { gap: 2px; padding: 0 4px; margin-bottom: 5px; }
                .calendar-weekday { font-size: 0.75rem; padding: 5px 1px; }
                .calendar-days-grid { gap: 2px; padding: 0 3px; }
                .calendar-day { min-height: 68px; padding: 4px; border-radius: 6px; border-width: 1px; }
                .calendar-day-number { font-size: 0.95rem; }
                .calendar-ad-date { font-size: 0.55rem; }
                .calendar-day-header { margin-bottom: 2px; padding-bottom: 2px; border-bottom-width: 1px; }
                .calendar-day-events { gap: 1px; }
                .calendar-day-events > div { font-size: 0.55rem; line-height: 1.1; }
                .calendar-day.today-date { border-width: 2px !important; }
                .calendar-day.today-date .calendar-day-number { font-size: 1.15rem; }
                .calendar-day.today-date::before { font-size: 8px; top: 2px; right: 3px; }
                .calendar-footer { padding: 8px 8px; font-size: 0.6rem; border-radius: 0 0 10px 10px; }
                .footer-center { gap: 6px; }
                .legend-item { font-size: 0.55rem; gap: 3px; }
                .legend-color { width: 10px; height: 10px; border-radius: 3px; }
                .events-list-container { margin: 8px 6px; padding: 10px; border-radius: 10px; }
                .events-header h3 { font-size: 0.95rem; }
                .events-header p { font-size: 0.72rem; }
                .events-list { gap: 6px; max-height: 260px; }
                .event-item { padding: 8px; border-radius: 10px; }
                .nepali-date { font-size: 0.85rem; }
                .remaining-days { font-size: 0.68rem; padding: 2px 6px; }
                .event-type { font-size: 0.62rem; padding: 1px 5px; }
                .event-title { font-size: 0.82rem; }
                .event-dialog { width: 96%; border-radius: 12px; }
                .event-dialog-header { padding: 12px 10px; }
                .event-dialog-header h2 { font-size: 1.1rem; }
                .event-dialog-header .ad-date { font-size: 0.8rem; }
                .event-dialog-body { padding: 12px; }
                .info-row { font-size: 0.8rem; padding: 5px 0; }
                .detail-section h4 { font-size: 0.95rem; }
                .detail-section p { font-size: 0.85rem; }
                .event-dialog-close { width: 26px; height: 26px; font-size: 14px; top: 6px; right: 6px; }
                .export-overlay-box { padding: 22px 26px; border-radius: 12px; }
                .export-message { font-size: 1rem; }
            }
            @media (max-width: 480px) {
                .school-header { padding: 12px 8px 10px; gap: 6px; }
                .school-header-logo { width: 58px; height: 58px; }
                .school-header-name { font-size: 1.05rem; letter-spacing: 0; }
                .school-header-address { font-size: 0.7rem; }
                .school-header-title { font-size: 0.62rem; letter-spacing: 1.5px; padding: 3px 10px; }
                .header-action-btn { font-size: 0.72rem; padding: 7px 10px; }
                .calendar-header { padding: 8px 6px; }
                .calendar-nav-section { gap: 4px; }
                .calendar-title h1 { font-size: 1rem; }
                .calendar-subtitle { font-size: 0.68rem; }
                .calendar-nav-btn { padding: 4px 8px; font-size: 0.78rem; }
                .today-btn { padding: 4px 8px !important; font-size: 0.72rem !important; }
                .calendar-weekday { font-size: 0.65rem; padding: 4px 1px; }
                .calendar-day { min-height: 58px; padding: 3px; border-radius: 5px; }
                .calendar-day-number { font-size: 0.85rem; }
                .calendar-ad-date { display: none; }
                .calendar-day-events > div { font-size: 0.5rem; }
                .calendar-day.today-date .calendar-day-number { font-size: 1rem; }
                .calendar-footer { padding: 6px; font-size: 0.55rem; }
                .footer-center { gap: 4px; }
                .legend-item { font-size: 0.5rem; }
                .legend-color { width: 9px; height: 9px; }
                .events-list-container { padding: 8px; margin: 6px 4px; }
                .events-header h3 { font-size: 0.85rem; }
                .event-title { font-size: 0.75rem; }
                .event-dialog { width: 100%; border-radius: 10px; }
                .event-dialog-header h2 { font-size: 1rem; }
                .event-dialog-body { padding: 10px; }
            }
            @media (max-width: 380px) {
                .school-header-logo { width: 52px; height: 52px; }
                .school-header-name { font-size: 0.92rem; }
                .school-header-address { font-size: 0.62rem; }
                .school-header-title { font-size: 0.55rem; letter-spacing: 1px; }
                .header-action-btn { font-size: 0.68rem; padding: 6px 8px; }
                .calendar-title h1 { font-size: 0.9rem; }
                .calendar-nav-btn { padding: 3px 7px; font-size: 0.72rem; }
                .today-btn { padding: 3px 7px !important; font-size: 0.68rem !important; }
                .calendar-weekday { font-size: 0.6rem; padding: 3px 0; }
                .calendar-day { min-height: 50px; padding: 2px; border-radius: 4px; }
                .calendar-day-number { font-size: 0.78rem; }
                .calendar-day-events > div { font-size: 0.45rem; line-height: 1.05; }
                .calendar-day.today-date .calendar-day-number { font-size: 0.92rem; }
                .calendar-day.today-date::before { font-size: 7px; top: 1px; right: 2px; }
                .legend-item { font-size: 0.45rem; }
                .legend-color { width: 8px; height: 8px; }
            }
            @media (max-height: 500px) and (orientation: landscape) {
                .nepali-calendar-wrapper { max-height: 98vh; border-radius: 8px; }
                .school-header { padding: 8px 12px 8px; gap: 6px; border-radius: 8px 8px 0 0; }
                .school-header-logo { width: 42px; height: 42px; }
                .school-header-name { font-size: 0.95rem; }
                .school-header-address { font-size: 0.65rem; }
                .school-header-title { font-size: 0.55rem; letter-spacing: 1px; padding: 1px 8px; margin-top: 3px; }
                .header-actions { margin-top: 4px; gap: 6px; }
                .header-action-btn { font-size: 0.68rem; padding: 4px 10px; }
                .calendar-header { padding: 6px 10px; margin-bottom: 6px; }
                .calendar-title h1 { font-size: 1rem; }
                .calendar-subtitle { display: none; }
                .calendar-nav-btn { padding: 3px 8px; font-size: 0.75rem; }
                .today-btn { padding: 3px 8px !important; font-size: 0.7rem !important; }
                .calendar-weekday { font-size: 0.7rem; padding: 3px 0; }
                .calendar-day { min-height: 48px; padding: 3px; border-radius: 4px; }
                .calendar-day-number { font-size: 0.8rem; }
                .calendar-ad-date { display: none; }
                .calendar-day-events > div { font-size: 0.5rem; }
                .events-list-container { max-height: 40vh; overflow-y: auto; margin: 6px 6px; padding: 8px; }
                .events-list { max-height: 28vh; }
                .event-dialog { max-height: 96vh; }
            }
            @media (min-width: 1600px) {
                .nepali-calendar-wrapper { max-width: 1500px; }
                .school-header { padding: 34px 32px 28px; gap: 16px; }
                .school-header-logo { width: 140px; height: 140px; }
                .school-header-name { font-size: 3rem; letter-spacing: 2px; }
                .school-header-address { font-size: 1.35rem; }
                .school-header-title { font-size: 1.35rem; letter-spacing: 8px; padding: 8px 28px; }
                .header-action-btn { font-size: 1.1rem; padding: 12px 24px; }
                .calendar-day { min-height: 170px; padding: 12px; }
                .calendar-day-number { font-size: 2.5rem; }
                .calendar-ad-date { font-size: 1.2rem; }
                .calendar-day-events > div { font-size: 1.2rem; }
                .calendar-weekday { font-size: 2.2rem; }
                .calendar-title h1 { font-size: 2.8rem; }
                .events-list { max-height: 500px; }
            }
        `;
        document.head.appendChild(style);
    }
    
    addStyles();
})();