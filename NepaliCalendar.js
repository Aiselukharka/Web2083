// NepaliCalendar.js
// Complete Nepali Calendar for year 2083 BS with debugging

(function() {
    // ========== SUPABASE CONFIGURATION ==========
    // ⚠️ IMPORTANT: Replace these with your actual Supabase credentials
    const SUPABASE_URL = 'https://nvyfnmooqsrhquddbbee.supabase.co';     // ← CHANGE THIS
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eWZubW9vcXNyaHF1ZGRiYmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTQ3NTksImV4cCI6MjA5Mzk3MDc1OX0.uK0lWS-bbnNSQbdrTbdO0MvKWSPu2aFPYHhKmYcGr7A';                  // ← CHANGE THIS
    const TABLE_NAME = 'Calendar_2083';
    
    // Nepali month names
    const NEPALI_MONTHS = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 
                           'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'];
    
    const NEPALI_MONTHS_DISPLAY = ['बैशाख', 'जेष्ठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
                                   'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
    
    // Nepali day names (short for display)
    const NEPALI_DAYS_SHORT = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
    
    // Nepali digits mapping
    const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    
    // Default style for undefined day types
    const DEFAULT_STYLE = {
        background: 'white',
        border: '2px solid #aaaaaa',
    };
    
    // Convert English number to Nepali digits
    function toNepaliDigits(number) {
        return String(number).split('').map(digit => NEPALI_DIGITS[parseInt(digit)] || digit).join('');
    }
    
    // Convert Nepali digits to English numbers
    function nepaliToEnglishNumber(nepaliNum) {
        const nepaliDigits = {
            '०': 0, '१': 1, '२': 2, '३': 3, '४': 4,
            '५': 5, '६': 6, '७': 7, '८': 8, '९': 9
        };
        if (!nepaliNum) return null;
        const str = String(nepaliNum);
        let result = '';
        for (let char of str) {
            if (nepaliDigits[char] !== undefined) {
                result += nepaliDigits[char];
            } else {
                result += char;
            }
        }
        return parseInt(result);
    }
    
    // Get day type style
    function getDayTypeStyle(dayType) {
        if (!dayType) return DEFAULT_STYLE;
        
        // Find matching style (case-insensitive partial match)
        for (const [key, style] of Object.entries(DAY_TYPE_STYLES)) {
            if (dayType.toLowerCase().includes(key.toLowerCase())) {
                return style;
            }
        }
        return DEFAULT_STYLE;
    }
    
    let calendarData = [];
    let currentMonthIndex = 0;
    let currentYear = 2083;
    
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
            const monthName = row.n_month;
            const monthIndex = NEPALI_MONTHS.indexOf(monthName);
            const dayNum = nepaliToEnglishNumber(row.n_day);
            
            const key = `${monthIndex}_${dayNum}`;
            
            const standardizedRow = {
                ...row,
                monthIndex: monthIndex,
                n_day_num: dayNum,
                e_year: row.e_year ? parseInt(row.e_year) : 2026,
                e_month: row.e_month,
                e_day: row.e_day ? parseInt(row.e_day) : null,
                e_day_of_week: row.e_day_of_week,
                n_year: row.n_year,
                n_month: row.n_month,
                n_day: row.n_day,
                n_day_of_week: row.n_day_of_week,
                tithi: row.tithi,
                national_event: row.national_event,
                local_event: row.local_event,
                day_type: row.day_type
            };
            
            map.set(key, standardizedRow);
        }
        
        return map;
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
        
        if (firstEntry && firstEntry.e_month && firstEntry.e_day) {
            startAD = `${firstEntry.e_month} ${firstEntry.e_day}`;
        }
        
        if (lastEntry && lastEntry.e_month && lastEntry.e_day) {
            endAD = `${lastEntry.e_month} ${lastEntry.e_day}`;
        }
        
        if (startAD && endAD && startAD !== endAD) {
            return `${startAD} - ${endAD}, ${firstEntry?.e_year || 2026}`;
        } else if (startAD) {
            return `${startAD}, ${firstEntry?.e_year || 2026}`;
        }
        
        return '';
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
            
            if (entry) {
                // Apply day type style
                if (entry.day_type) {
                    dayStyle = getDayTypeStyle(entry.day_type);
                    hasEvent = true;
                }
                
                // Build event details HTML
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
                
                if (entry.day_type && entry.day_type.trim() !== '') {
                    events.push(`<div class="event-daytype">${dayStyle.icon} ${entry.day_type}</div>`);
                }
                
                eventDetails = events.join('');
            }
            
            // Nepali day number
            const nepaliDayNumber = toNepaliDigits(day);
            
            // AD date
            let adDate = '';
            if (entry && entry.e_month && entry.e_day) {
                adDate = `${entry.e_month} ${entry.e_day}`;
            }
            
            // Apply day type background style
            const dayBackground = entry && entry.day_type ? dayStyle.background : '';
            const borderLeft = entry && entry.day_type ? dayStyle.borderLeft : '';
            
            html += `
                <div class="calendar-day ${hasEvent ? 'has-event' : ''}" 
                     style="${dayBackground ? `background: ${dayBackground};` : ''} ${borderLeft ? `border-left: ${borderLeft};` : ''}">
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
                    <div class="calendar-footer">
                        <div class="footer-left">
                            <span>📅 नेपाली पात्रो ${nepaliYearDisplay}</span>
                        </div>
                        <div class="footer-center">
                            <span class="legend-item"><span class="legend-color holiday"></span> सार्वजनिक बिदा</span>
                            <span class="legend-item"><span class="legend-color festival"></span> चाडपर्व</span>
                            <span class="legend-item"><span class="legend-color sports"></span> खेलकुद</span>
                            <span class="legend-item"><span class="legend-color study"></span> अध्ययन</span>
                        </div>
                        <div class="footer-right">
                            <span>🕉️ ${nepaliMonthName} ${currentYear}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Navigation
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
                <p>📅 लोड हुँदै... (Loading Nepali Calendar 2083)</p>
            </div>
        `;
        container.style.display = 'flex';
        
        try {
            const data = await fetchCalendarData();
            calendarData = data;
            const dataMap = buildDataMap(data);
            
            if (dataMap.size === 0) {
                throw new Error('No calendar data available');
            }
            
            currentMonthIndex = 0;
            renderCalendar(dataMap);
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
                background-color: #777777;
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
            
            .calendar-title {
                text-align: center;
                flex: 1;
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
                background: #eeeeee;
                border-radius: 12px;
                padding: 10px;
                min-height: 150px;
                transition: all 0.2s;
                border: 2px solid #aaaaff;
                position: relative;
                overflow-y: auto;
            }
            
            .calendar-day:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                filter: brightness(0.98);
            }
            
            .calendar-day.empty {
                background: transparent;
                border: 1px dashed transparent;
                min-height: 150px;
            }
            
            .calendar-day.has-event {
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
                background: #FFE5E5;
                border: 2px solid #DC2626;
            }
            
            .legend-color.festival {
                background: #FFF3E0;
                border: 2px solid #FF9800;
            }
            
            .legend-color.sports {
                background: #E3F2FD;
                border: 2px solid #2196F3;
            }
            
            .legend-color.study {
                background: #E8F5E9;
                border: 2px solid #4CAF50;
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
            
            /* Scrollbar styling */
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
            
            /* Responsive design */
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
                
                .footer-center {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    addStyles();
})();



