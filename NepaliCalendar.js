(function() {
    // ========== SUPABASE CONFIGURATION ==========
    const SUPABASE_URL = 'https://wrjivuysumgpoqmabwpw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyaml2dXlzdW1ncG9xbWFid3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzczMTEsImV4cCI6MjA5NjY1MzMxMX0.Cfi1IwCFDEHGq1f4g_1amRduxeEiWvoZy4BwxNAtv8A';
    const TABLE_NAME = 'CalendarDataTable';
    
    // Nepali month names
    const NEPALI_MONTHS = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 
                           'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'];
    
    const NEPALI_MONTHS_DISPLAY = ['बैशाख', 'जेष्ठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
                                   'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
    
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
        'Public Holiday': {
            background: '#FFaaaa',
            border: '2px solid #aa5555'
        },
        'Study Time': {
            background: '#aaffaa',
            border: '2px solid #55aa55'
        },
        'Exam Time': {
            background: '#aaaaff',
            border: '2px solid #5555aa'
        },
        'Summer Vacation': {
            background: '#ffffaa',
            border: '2px solid #aaaa55'
        },
        'Winter Vacation': {
            background: '#ffaaff',
            border: '2px solid #aa55aa'
        },
        'Other School Time': {
            background: '#aaffff',
            border: '2px solid #55aaaa'
        },
        'Other Vacation': {
            background: '#afafaf',
            border: '2px solid #5a5a5a'
        }
    };
    
    // Convert English number to Nepali digits
    function toNepaliDigits(number) {
        return String(number).split('').map(digit => NEPALI_DIGITS[parseInt(digit)] || digit).join('');
    }
    
    // Convert Nepali digits to English numbers
    function nepaliToEnglishNumber(nepaliNum) {
        if (!nepaliNum) return null;
        const str = String(nepaliNum);
        let result = '';
        for (let char of str) {
            if (NEPALI_DIGITS.includes(char)) {
                const index = NEPALI_DIGITS.indexOf(char);
                result += index.toString();
            } else {
                result += char;
            }
        }
        return parseInt(result);
    }
    
    // Convert Nepali year (e.g., "२०८३") to English number
    function nepaliYearToEnglish(nepaliYear) {
        if (!nepaliYear) return null;
        return nepaliToEnglishNumber(nepaliYear);
    }
    
    // Get day type style
    function getDayTypeStyle(dayType) {
        if (!dayType) return DEFAULT_STYLE;
        
        for (const [key, style] of Object.entries(DAY_TYPE_STYLES)) {
            if (dayType.toLowerCase().includes(key.toLowerCase())) {
                return style;
            }
        }
        return DEFAULT_STYLE;
    }
    
    // Show event details dialog
    function showEventDetails(entry, dayNumber) {
        const existingDialog = document.getElementById('eventDetailDialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const nepaliDayNumber = entry.n_day || toNepaliDigits(dayNumber);
        const monthName = NEPALI_MONTHS_DISPLAY[entry.monthIndex] || entry.n_month;
        const yearDisplay = entry.n_year_display || entry.n_year || toNepaliDigits(currentYear);
        
        let eventDetailsHtml = '';
        
        if (entry.event_detail && entry.event_detail.trim() !== '') {
            eventDetailsHtml += `
                <div class="detail-section">
                    <h4>📝 विवरण</h4>
                    <p>${entry.event_detail}</p>
                </div>
            `;
        } else {
            eventDetailsHtml += `
                <div class="detail-section">
                    <p class="no-details">कुनै विवरण उपलब्ध छैन </p>
                </div>
            `;
        }
        
        let additionalInfo = '';
        if (entry.tithi && entry.tithi.trim() !== '') {
            additionalInfo += `<div class="info-row"><strong>🌙 तिथि:</strong> ${entry.tithi}</div>`;
        }
        if (entry.national_event && entry.national_event.trim() !== '') {
            additionalInfo += `<div class="info-row"><strong>राष्ट्रिय घटना:</strong> ${entry.national_event}</div>`;
        }
        if (entry.local_event && entry.local_event.trim() !== '') {
            additionalInfo += `<div class="info-row"><strong>🏘️ स्थानीय घटना:</strong> ${entry.local_event}</div>`;
        }
        if (entry.day_type && entry.day_type.trim() !== '') {
            additionalInfo += `<div class="info-row"><strong>📌 दिनको प्रकार:</strong> ${entry.day_type}</div>`;
        }
        
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
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
        
        const dialog = document.getElementById('eventDetailDialog');
        const closeBtn = dialog.querySelector('.event-dialog-close');
        
        closeBtn.addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    let calendarData = [];
    let currentMonthIndex = 0;
    let currentYear = 2083;
    let todayInfo = null;
    let allDataMap = null;
    
    // Fetch data from Supabase
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Loaded ${data.length} records`);
            return data;
        } catch (err) {
            console.error('Failed to fetch:', err);
            throw err;
        }
    }
    
    // Build data map
    function buildDataMap(rows) {
        const map = new Map();
        
        for (const row of rows) {
            const monthIndex = NEPALI_MONTHS.indexOf(row.n_month);
            const dayNum = nepaliToEnglishNumber(row.n_day);
            
            const key = `${monthIndex}_${dayNum}`;
            
            const standardizedRow = {
                ...row,
                monthIndex: monthIndex,
                n_day_num: dayNum,
                e_year: row.e_year ? parseInt(row.e_year) : null,
                e_month_num: row.e_month ? ENGLISH_MONTHS[row.e_month] : null,
                e_month_name: row.e_month,
                e_day: row.e_day ? parseInt(row.e_day) : null,
                e_day_of_week: row.e_day_of_week,
                n_year_num: row.n_year ? nepaliYearToEnglish(row.n_year) : null,
                n_year_display: row.n_year,
                n_month: row.n_month,
                n_day: row.n_day,
                n_day_num: dayNum,
                n_day_of_week: row.n_day_of_week,
                tithi: row.tithi,
                national_event: row.national_event,
                local_event: row.local_event,
                event_detail: row.event_detail,
                day_type: row.day_type
            };
            
            map.set(key, standardizedRow);
        }
        
        return map;
    }
    
    // Find today's date in the calendar data
    function findTodayInData(dataMap) {
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const todayMonthName = monthNames[todayMonth - 1];
        
        console.log(`Searching for today: ${todayYear} ${todayMonthName} ${todayDay}`);
        
        for (let [key, entry] of dataMap) {
            if (entry.e_year === todayYear && 
                entry.e_month_name === todayMonthName && 
                entry.e_day === todayDay) {
                
                console.log(`✅ Found matching row!`);
                console.log(`   English Date: ${entry.e_year} ${entry.e_month_name} ${entry.e_day}`);
                console.log(`   Nepali Date: ${entry.n_year_display} ${entry.n_month} ${entry.n_day}`);
                
                const nepaliMonthIndex = NEPALI_MONTHS.indexOf(entry.n_month);
                
                return {
                    englishDate: { 
                        year: todayYear, 
                        month: todayMonth, 
                        monthName: todayMonthName,
                        day: todayDay 
                    },
                    nepaliDate: { 
                        year: entry.n_year_num,
                        yearDisplay: entry.n_year_display,
                        monthName: entry.n_month,
                        monthIndex: nepaliMonthIndex,
                        day: entry.n_day_num,
                        dayDisplay: entry.n_day
                    },
                    entry: entry
                };
            }
        }
        
        console.warn("❌ Today's date not found in calendar data");
        return null;
    }
    
    // Get all upcoming events from today
    function getUpcomingEvents(dataMap, todayInfo) {
        if (!todayInfo) return [];
        
        const events = [];
        const todayDate = new Date(todayInfo.englishDate.year, todayInfo.englishDate.month - 1, todayInfo.englishDate.day);
        
        // Iterate through all data
        for (let [key, entry] of dataMap) {
            // Check if entry has any event
            const hasEvent = (entry.national_event && entry.national_event.trim() !== '') ||
                            (entry.local_event && entry.local_event.trim() !== '');
            
            if (!hasEvent) continue;
            
            // Create date object for this entry
            if (entry.e_year && entry.e_month_name && entry.e_day) {
                const monthNum = ENGLISH_MONTHS[entry.e_month_name];
                const entryDate = new Date(entry.e_year, monthNum - 1, entry.e_day);
                
                // Calculate difference in days
                const diffTime = entryDate - todayDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Only include future or today's events
                if (diffDays >= 0) {
                    // Get day type style for background
                    const dayStyle = getDayTypeStyle(entry.day_type);
                    
                    events.push({
                        entry: entry,
                        nepaliDate: `${entry.n_month} ${entry.n_day}, ${entry.n_year_display}`,
                        eventText: entry.national_event || entry.local_event,
                        eventType: entry.national_event ? 'national' : 'local',
                        remainingDays: diffDays,
                        dayStyle: dayStyle,
                        key: key
                    });
                }
            }
        }
        
        // Sort by remaining days (soonest first)
        events.sort((a, b) => a.remainingDays - b.remainingDays);
        
        return events;
    }
    
    // Render events list
    function renderEventsList(events) {
        const eventsContainer = document.getElementById('eventsListContainer');
        if (!eventsContainer) return;
        
        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events">
                    <p>🎉 कुनै आगामी कार्यक्रमहरू छैनन्</p>
                </div>
            `;
            return;
        }
        
        let eventsHtml = `
            <div class="events-header">
                <h3>📅 आगामी कार्यक्रमहरू</h3>
                <p>${events.length} events found</p>
            </div>
            <div class="events-list">
        `;
        
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
                        <div class="remaining-days ${event.remainingDays === 0 ? 'today-badge' : ''}">
                            ${remainingText}
                        </div>
                    </div>
                    <div class="event-info">
                        <span class="event-type ${eventTypeClass}">${eventIcon} ${event.eventType === 'national' ? 'राष्ट्रिय' : 'स्थानीय'}</span>
                        <div class="event-title">${event.eventText}</div>
                    </div>
                </div>
            `;
        });
        
        eventsHtml += `
            </div>
        `;
        
        eventsContainer.innerHTML = eventsHtml;
        
        // Add click handlers for event items
        const eventItems = eventsContainer.querySelectorAll('.event-item');
        eventItems.forEach(item => {
            item.addEventListener('click', () => {
                const key = item.getAttribute('data-key');
                const entry = allDataMap.get(key);
                if (entry) {
                    showEventDetails(entry, entry.n_day_num);
                }
            });
        });
    }
    
    // Get days in month
    function getDaysInMonth(monthIndex, dataMap) {
        let maxDay = 0;
        for (let i = 1; i <= 35; i++) {
            const key = `${monthIndex}_${i}`;
            if (dataMap.has(key)) {
                maxDay = i;
            }
        }
        return maxDay;
    }
    
    // Get first day of month (0-6, Sunday=0)
    function getFirstDayOfMonth(monthIndex, dataMap) {
        const firstDayKey = `${monthIndex}_1`;
        const entry = dataMap.get(firstDayKey);
        
        if (entry && entry.e_day_of_week) {
            const dayMap = {
                'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
                'Thursday': 4, 'Friday': 5, 'Saturday': 6
            };
            return dayMap[entry.e_day_of_week] || 0;
        }
        
        return 0;
    }
    
    // Get date range for header
    function getDateRangeForMonth(monthIndex, dataMap) {
        const daysInMonth = getDaysInMonth(monthIndex, dataMap);
        const firstDayKey = `${monthIndex}_1`;
        const lastDayKey = `${monthIndex}_${daysInMonth}`;
        
        const firstEntry = dataMap.get(firstDayKey);
        const lastEntry = dataMap.get(lastDayKey);
        
        let startAD = '', endAD = '';
        
        if (firstEntry && firstEntry.e_month_name && firstEntry.e_day) {
            startAD = `${firstEntry.e_month_name} ${firstEntry.e_day}`;
        }
        
        if (lastEntry && lastEntry.e_month_name && lastEntry.e_day) {
            endAD = `${lastEntry.e_month_name} ${lastEntry.e_day}`;
        }
        
        if (startAD && endAD && startAD !== endAD) {
            return `${startAD} - ${endAD}, ${firstEntry?.e_year || 2026}`;
        } else if (startAD) {
            return `${startAD}, ${firstEntry?.e_year || 2026}`;
        }
        
        return '';
    }
    
    // Scroll to today's date
    function scrollToToday(container) {
        setTimeout(() => {
            const todayElement = container.querySelector('.calendar-day.today-date');
            if (todayElement) {
                todayElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
                
                todayElement.classList.add('today-pulse');
                setTimeout(() => {
                    todayElement.classList.remove('today-pulse');
                }, 1000);
            }
        }, 100);
    }
    
    // Render calendar
    function renderCalendar(dataMap) {
        const container = document.getElementById('nepaliCalendarContainer');
        if (!container) return;
        
        const daysInMonth = getDaysInMonth(currentMonthIndex, dataMap);
        
        if (daysInMonth === 0) {
            container.innerHTML = `
                <div class="calendar-error">
                    <h3>⚠️ No Data Available</h3>
                    <button onclick="window.showCalendar()" class="retry-btn">Retry</button>
                </div>
            `;
            return;
        }
        
        const firstDayOfWeek = getFirstDayOfMonth(currentMonthIndex, dataMap);
        const nepaliMonthName = NEPALI_MONTHS_DISPLAY[currentMonthIndex];
        const dateRange = getDateRangeForMonth(currentMonthIndex, dataMap);
        const nepaliYearDisplay = toNepaliDigits(currentYear);
        
        let html = `
            <div class="nepali-calendar-modal-overlay">
                <div class="nepali-calendar-wrapper">
                    <button class="calendar-close-btn" id="closeCalendarBtn">✕</button>
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
                    <div class="calendar-days-grid">
        `;
        
        // Empty cells before first day
        for (let i = 0; i < firstDayOfWeek; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        
        // Fill days
        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${currentMonthIndex}_${day}`;
            const entry = dataMap.get(key);
            
            let eventDetails = '';
            let hasEvent = false;
            let dayStyle = DEFAULT_STYLE;
            
            const isToday = (todayInfo && 
                            todayInfo.nepaliDate.monthIndex === currentMonthIndex && 
                            todayInfo.nepaliDate.day === day);
            
            if (entry) {
                if (entry.day_type) {
                    dayStyle = getDayTypeStyle(entry.day_type);
                    hasEvent = true;
                }
                
                const events = [];
                
                if (entry.national_event && entry.national_event.trim() !== '') {
                    events.push(`<div class="event-national">${entry.national_event}</div>`);
                    hasEvent = true;
                }
                
                if (entry.local_event && entry.local_event.trim() !== '') {
                    events.push(`<div class="event-local">${entry.local_event}</div>`);
                    hasEvent = true;
                }
                
                if (entry.tithi && entry.tithi.trim() !== '') {
                    events.push(`<div class="event-tithi">${entry.tithi}</div>`);
                    hasEvent = true;
                }
                
                eventDetails = events.join('');
            }
            
            const nepaliDayNumber = entry ? entry.n_day : toNepaliDigits(day);
            
            let adDate = '';
            if (entry && entry.e_month_name && entry.e_day) {
                adDate = `${entry.e_month_name} ${entry.e_day}`;
            }
            
            const dayBackground = entry && entry.day_type ? dayStyle.background : '';
            const dayBorder = entry && entry.day_type ? dayStyle.border : '';
            
            let dayStyleAttr = '';
            if (dayBackground) dayStyleAttr += `background: ${dayBackground}; `;
            if (dayBorder) dayStyleAttr += `border: ${dayBorder}; `;
            
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
                    <div class="calendar-day-events">
                        ${eventDetails}
                    </div>
                </div>
            `;
        }
        
        html += `
                    </div>
                    <div id="eventsListContainer" class="events-list-container">
                        <!-- Events will be loaded here -->
                    </div>
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
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add click handlers for calendar days
        const calendarDays = container.querySelectorAll('.calendar-day[data-has-data="true"]');
        calendarDays.forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayNum = parseInt(dayElement.getAttribute('data-day'));
                const key = `${currentMonthIndex}_${dayNum}`;
                const entry = dataMap.get(key);
                if (entry) {
                    showEventDetails(entry, dayNum);
                }
            });
        });
        
        // Get upcoming events and render events list
        const upcomingEvents = getUpcomingEvents(dataMap, todayInfo);
        renderEventsList(upcomingEvents);
        
        // Navigation handlers
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
        
        // Today button handler
        const todayBtn = document.getElementById('todayBtn');
        if (todayBtn) {
            const newTodayBtn = todayBtn.cloneNode(true);
            todayBtn.parentNode.replaceChild(newTodayBtn, todayBtn);
            
            newTodayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log("Today button clicked");
                
                if (todayInfo && todayInfo.nepaliDate.monthIndex !== undefined) {
                    currentMonthIndex = todayInfo.nepaliDate.monthIndex;
                    currentYear = todayInfo.nepaliDate.year;
                    renderCalendar(dataMap);
                    scrollToToday(container);
                } else {
                    alert("Today's date not found in calendar data.");
                }
            });
        }
        
        document.getElementById('closeCalendarBtn')?.addEventListener('click', () => {
            container.style.display = 'none';
        });
    }
    
    // Main function
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
            </div>
        `;
        container.style.display = 'flex';
        
        try {
            const data = await fetchCalendarData();
            calendarData = data;
            allDataMap = buildDataMap(data);
            
            if (allDataMap.size === 0) {
                throw new Error('No calendar data available');
            }
            
            todayInfo = findTodayInData(allDataMap);
            
            if (todayInfo) {
                currentMonthIndex = todayInfo.nepaliDate.monthIndex;
                currentYear = todayInfo.nepaliDate.year;
                console.log(`✅ Calendar initialized with today's date`);
            } else {
                currentMonthIndex = 0;
                currentYear = 2083;
                console.warn("❌ Today's date not found in database! Defaulting to month 0");
            }
            
            renderCalendar(allDataMap);
        } catch (err) {
            console.error('Calendar error:', err);
            container.innerHTML = `
                <div class="calendar-error">
                    <h3>⚠️ Error Loading Calendar</h3>
                    <p>${err.message}</p>
                    <button onclick="window.showCalendar()" class="retry-btn">Retry</button>
                </div>
            `;
        }
    }
    
    window.showCalendar = function() {
        initializeAndShowCalendar();
    };
    
    // Close on outside click
    document.addEventListener('click', function(e) {
        const container = document.getElementById('nepaliCalendarContainer');
        if (container && container.style.display === 'flex') {
            if (e.target === container) {
                container.style.display = 'none';
            }
        }
    });
    
    // Add styles
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
            
            /* Events List Styles */
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
            
            .event-national-badge {
                background: #1565C0;
                color: white;
            }
            
            .event-local-badge {
                background: #2E7D32;
                color: white;
            }
            
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
            
            .no-events p {
                margin: 5px 0;
            }
            
            /* Event Dialog Styles */
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
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
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
            
            .event-dialog-body {
                padding: 20px;
            }
            
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
            
            .info-row:last-child {
                border-bottom: none;
            }
            
            .detail-section {
                margin-top: 15px;
            }
            
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
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: scale(0.95) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
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
            
            .calendar-nav-btn:active {
                transform: scale(0.95);
            }
            
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
                min-height: 150px;
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
                50% { opacity: 0.3; }
            }
            
            @keyframes todayPulse {
                0% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(245, 124, 0, 0.7);
                }
                70% {
                    transform: scale(1.02);
                    box-shadow: 0 0 0 15px rgba(245, 124, 0, 0);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(245, 124, 0, 0);
                }
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
                from {
                    opacity: 0;
                    transform: translateY(5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .event-tithi {
                color: #6A1B9A;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .event-national {
                color: #1565C0;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .event-local {
                color: #2E7D32;
                text-align: center;
                font-size: 0.9rem;
            }
            
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
            
            .legend-color.holiday {
                background: #ffaaaa;
                border: 2px solid #aa5555;
            }
            .legend-color.study-time {
                background: #aaffaa;
                border: 2px solid #55aa55;
            }
            .legend-color.exam-time {
                background: #aaaaff;
                border: 2px solid #5555aa;
            }
            .legend-color.summer-vacation {
                background: #ffffaa;
                border: 2px solid #aaaa55;
            }
            .legend-color.winter-vacation {
                background: #ffaaff;
                border: 2px solid #aa55aa;
            }
            .legend-color.other-school-time {
                background: #aaffff;
                border: 2px solid #5555aa;
            }
            .legend-color.other-vacation {
                background: #aaaaff;
                border: 2px solid #5555aa;
            }
            
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
                0% { transform: rotate(0deg); }
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
            
            .nepali-calendar-wrapper::-webkit-scrollbar {
                width: 10px;
            }
            
            .nepali-calendar-wrapper::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .nepali-calendar-wrapper::-webkit-scrollbar-thumb {
                background: #888888;
                border-radius: 10px;
            }
            
            .nepali-calendar-wrapper::-webkit-scrollbar-thumb:hover {
                background: #555555;
            }
            
            .events-list::-webkit-scrollbar {
                width: 8px;
            }
            
            .events-list::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            
            .events-list::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 10px;
            }
            
            .events-list::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
            
            @media (max-width: 1024px) {
                .calendar-day {
                    min-height: 100px;
                }
            }
            
            @media (max-width: 768px) {
                .calendar-nav-btn {
                    padding: 6px 12px;
                    font-size: 1rem;
                }
                
                .today-btn {
                    padding: 6px 12px !important;
                    font-size: 0.9rem !important;
                }
                
                .calendar-title h1 {
                    font-size: 1.3rem;
                }
                
                .calendar-subtitle {
                    font-size: 0.7rem;
                }
                
                .calendar-day {
                    min-height: 85px;
                    padding: 6px;
                }
                
                .calendar-day-number {
                    font-size: 0.9rem;
                }
                
                .calendar-ad-date {
                    font-size: 0.55rem;
                }
                
                .calendar-day-events > div {
                    font-size: 0.6rem;
                    padding: 2px 4px;
                }
                
                .calendar-weekday {
                    font-size: 0.8rem;
                    padding: 8px 3px;
                }
                
                .calendar-close-btn {
                    width: 32px;
                    height: 32px;
                    font-size: 18px;
                    top: 10px;
                    right: 12px;
                }
                
                .footer-center {
                    font-size: 0.65rem;
                    gap: 10px;
                }
                
                .legend-item {
                    font-size: 0.65rem;
                }
                
                .event-item {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .event-date {
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                }
            }
            
            @media (max-width: 480px) {
                .calendar-day {
                    min-height: 70px;
                }
                
                .calendar-nav-section {
                    gap: 8px;
                }
                
                .calendar-title h1 {
                    font-size: 0.9rem;
                }
                
                .calendar-subtitle {
                    font-size: 0.6rem;
                }
                
                .calendar-nav-btn {
                    padding: 4px 8px;
                    font-size: 0.8rem;
                }
                
                .today-btn {
                    padding: 4px 8px !important;
                    font-size: 0.7rem !important;
                }
                
                .footer-center {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    addStyles();
})();
