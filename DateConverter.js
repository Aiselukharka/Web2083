// Nepali month names
const NEPALI_MONTHS = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कात्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत्र"];

// Nepali day names
const NEPALI_DAYS = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनीबार"];

// English day names
const ENGLISH_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// English month names
const ENGLISH_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Ordinal suffixes for English dates
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Nepali calendar data (same as before)
const NEPALI_CALENDAR_DATA = [
    [2000,30,32,31,32,31,30,30,30,29,30,29,31],
    [2001,31,31,32,31,31,31,30,29,30,29,30,30],
    [2002,31,31,32,32,31,30,30,29,30,29,30,30],
    [2003,31,32,31,32,31,30,30,30,29,29,30,31],
    [2004,30,32,31,32,31,30,30,30,29,30,29,31],
    [2005,31,31,32,31,31,31,30,29,30,29,30,30],
    [2006,31,31,32,32,31,30,30,29,30,29,30,30],
    [2007,31,32,31,32,31,30,30,30,29,29,30,31],
    [2008,31,31,31,32,31,31,29,30,30,29,29,31],
    [2009,31,31,32,31,31,31,30,29,30,29,30,30],
    [2010,31,31,32,32,31,30,30,29,30,29,30,30],
    [2011,31,32,31,32,31,30,30,30,29,29,30,31],
    [2012,31,31,31,32,31,31,29,30,30,29,30,30],
    [2013,31,31,32,31,31,31,30,29,30,29,30,30],
    [2014,31,31,32,32,31,30,30,29,30,29,30,30],
    [2015,31,32,31,32,31,30,30,30,29,29,30,31],
    [2016,31,31,31,32,31,31,29,30,30,29,30,30],
    [2017,31,31,32,31,31,31,30,29,30,29,30,30],
    [2018,31,32,31,32,31,30,30,29,30,29,30,30],
    [2019,31,32,31,32,31,30,30,30,29,30,29,31],
    [2020,31,31,31,32,31,31,30,29,30,29,30,30],
    [2021,31,31,32,31,31,31,30,29,30,29,30,30],
    [2022,31,32,31,32,31,30,30,30,29,29,30,30],
    [2023,31,32,31,32,31,30,30,30,29,30,29,31],
    [2024,31,31,31,32,31,31,30,29,30,29,30,30],
    [2025,31,31,32,31,31,31,30,29,30,29,30,30],
    [2026,31,32,31,32,31,30,30,30,29,29,30,31],
    [2027,30,32,31,32,31,30,30,30,29,30,29,31],
    [2028,31,31,32,31,31,31,30,29,30,29,30,30],
    [2029,31,31,32,31,32,30,30,29,30,29,30,30],
    [2030,31,32,31,32,31,30,30,30,29,29,30,31],
    [2031,30,32,31,32,31,30,30,30,29,30,29,31],
    [2032,31,31,32,31,31,31,30,29,30,29,30,30],
    [2033,31,31,32,32,31,30,30,29,30,29,30,30],
    [2034,31,32,31,32,31,30,30,30,29,29,30,31],
    [2035,30,32,31,32,31,31,29,30,30,29,29,31],
    [2036,31,31,32,31,31,31,30,29,30,29,30,30],
    [2037,31,31,32,32,31,30,30,29,30,29,30,30],
    [2038,31,32,31,32,31,30,30,30,29,29,30,31],
    [2039,31,31,31,32,31,31,29,30,30,29,30,30],
    [2040,31,31,32,31,31,31,30,29,30,29,30,30],
    [2041,31,31,32,32,31,30,30,29,30,29,30,30],
    [2042,31,32,31,32,31,30,30,30,29,29,30,31],
    [2043,31,31,31,32,31,31,29,30,30,29,30,30],
    [2044,31,31,32,31,31,31,30,29,30,29,30,30],
    [2045,31,32,31,32,31,30,30,29,30,29,30,30],
    [2046,31,32,31,32,31,30,30,30,29,29,30,31],
    [2047,31,31,31,32,31,31,30,29,30,29,30,30],
    [2048,31,31,32,31,31,31,30,29,30,29,30,30],
    [2049,31,32,31,32,31,30,30,30,29,29,30,30],
    [2050,31,32,31,32,31,30,30,30,29,30,29,31],
    [2051,31,31,31,32,31,31,30,29,30,29,30,30],
    [2052,31,31,32,31,31,31,30,29,30,29,30,30],
    [2053,31,32,31,32,31,30,30,30,29,29,30,30],
    [2054,31,32,31,32,31,30,30,30,29,30,29,31],
    [2055,31,31,32,31,31,31,30,29,30,29,30,30],
    [2056,31,31,32,31,32,30,30,29,30,29,30,30],
    [2057,31,32,31,32,31,30,30,30,29,29,30,31],
    [2058,30,32,31,32,31,30,30,30,29,30,29,31],
    [2059,31,31,32,31,31,31,30,29,30,29,30,30],
    [2060,31,31,32,32,31,30,30,29,30,29,30,30],
    [2061,31,32,31,32,31,30,30,30,29,29,30,31],
    [2062,30,32,31,32,31,31,29,30,29,30,29,31],
    [2063,31,31,32,31,31,31,30,29,30,29,30,30],
    [2064,31,31,32,32,31,30,30,29,30,29,30,30],
    [2065,31,32,31,32,31,30,30,30,29,29,30,31],
    [2066,31,31,31,32,31,31,29,30,30,29,29,31],
    [2067,31,31,32,31,31,31,30,29,30,29,30,30],
    [2068,31,31,32,32,31,30,30,29,30,29,30,30],
    [2069,31,32,31,32,31,30,30,30,29,29,30,31],
    [2070,31,31,31,32,31,31,29,30,30,29,30,30],
    [2071,31,31,32,31,31,31,30,29,30,29,30,30],
    [2072,31,32,31,32,31,30,30,29,30,29,30,30],
    [2073,31,32,31,32,31,30,30,30,29,29,30,31],
    [2074,31,31,31,32,31,31,30,29,30,29,30,30],
    [2075,31,31,32,31,31,31,30,29,30,29,30,30],
    [2076,31,32,31,32,31,30,30,30,29,29,30,30],
    [2077,31,32,31,32,31,30,30,30,29,30,29,31],
    [2078,31,31,31,32,31,31,30,29,30,29,30,30],
    [2079,31,31,32,31,31,31,30,29,30,29,30,30],
    [2080,31,32,31,32,31,30,30,30,29,29,30,30],
    [2081,31,31,32,32,31,30,30,30,29,30,29,31],
    [2082,31,31,32,31,31,31,30,29,30,29,30,30],
    [2083,31,31,32,31,31,30,30,30,29,30,30,30],
    [2084,31,31,32,31,31,30,30,30,29,30,30,30],
    [2085,31,32,31,32,30,31,30,30,29,30,30,30],
    [2086,30,32,31,32,31,30,30,30,29,30,30,30],
    [2087,31,31,32,31,31,31,30,30,29,30,30,30],
    [2088,30,31,32,32,30,31,30,30,29,30,30,30],
    [2089,30,32,31,32,31,30,30,30,29,30,30,30],
    [2090,30,32,31,32,31,30,30,30,29,30,30,30],
    [2091,31,31,32,31,31,31,30,30,29,30,30,30],
    [2092,31,32,31,32,31,30,30,30,29,29,30,31],
    [2093,31,31,31,32,31,31,29,30,30,29,29,31],
    [2094,31,31,32,31,31,31,30,29,30,29,30,30],
    [2095,31,31,32,32,31,30,30,29,30,29,30,30],
    [2096,31,32,31,32,31,30,30,30,29,29,30,31],
    [2097,31,31,31,32,31,31,29,30,30,29,30,30],
    [2098,31,31,32,31,31,31,30,29,30,29,30,30],
    [2099,31,31,32,32,31,30,30,29,30,29,30,30]
];

// Reference date: 1943-04-14 AD = 2000-01-01 BS (Baishakh 1, 2000)
const REF_AD_YEAR = 1943;
const REF_AD_MONTH = 3; // April (0-index: 3)
const REF_AD_DAY = 14;
const REF_BS_YEAR = 2000;
const REF_BS_MONTH = 0; // Baishakh (0-index)
const REF_BS_DAY = 1;

// Helper: Check if AD year is leap
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Days in month for AD (0-index months)
function daysInADMonth(year, month) {
    const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month];
}

// Convert Devanagari numerals
function toDevanagariNumber(num) {
    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => devanagariDigits[parseInt(d)]).join('');
}

// AD2BS: Takes Date object and returns Nepali date string
function AD2BS(date) {
    const adYear = date.getFullYear();
    const adMonth = date.getMonth();
    const adDay = date.getDate();
    
    // Calculate total days from reference AD date
    let totalADDays = 0;
    
    // Days from reference year to target year - 1
    for (let y = REF_AD_YEAR; y < adYear; y++) {
        totalADDays += isLeapYear(y) ? 366 : 365;
    }
    
    // Days in reference year up to reference date
    for (let m = 0; m < REF_AD_MONTH; m++) {
        totalADDays -= daysInADMonth(REF_AD_YEAR, m);
    }
    totalADDays -= REF_AD_DAY;
    
    // Days in target year up to target date
    for (let m = 0; m < adMonth; m++) {
        totalADDays += daysInADMonth(adYear, m);
    }
    totalADDays += adDay;
    
    // Now convert total days offset to BS
    let bsYear = REF_BS_YEAR;
    let bsMonth = REF_BS_MONTH;
    let bsDay = REF_BS_DAY;
    
    // Add days to BS date
    while (totalADDays > 0) {
        const yearData = NEPALI_CALENDAR_DATA.find(data => data[0] === bsYear);
        if (!yearData) throw new Error(`No data for BS year ${bsYear}`);
        
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
    
    // Get day name from AD date
    const dayName = NEPALI_DAYS[date.getDay()];
    
    // Format: २०८३ साल बैशाख २६ गते आइतबार
    const bsYearDev = toDevanagariNumber(bsYear);
    const bsDayDev = toDevanagariNumber(bsDay);
    
    return `${bsYearDev} साल ${NEPALI_MONTHS[bsMonth]} ${bsDayDev} गते ${dayName}`;
}

// BS2AD: Takes string "YYYY-M-D" and returns English date string
function BS2AD(bsDateString) {
    // Parse input format "2023-3-22" or "2023-03-22"
    const parts = bsDateString.split('-').map(Number);
    let bsYear = parts[0];
    let bsMonth = parts[1] - 1; // Convert to 0-index (1-12 to 0-11)
    let bsDay = parts[2];
    
    // Validate BS date
    const yearData = NEPALI_CALENDAR_DATA.find(data => data[0] === bsYear);
    if (!yearData) throw new Error(`No data for BS year ${bsYear}`);
    if (bsMonth < 0 || bsMonth > 11) throw new Error(`Invalid month: ${bsMonth + 1}`);
    if (bsDay < 1 || bsDay > yearData[bsMonth + 1]) throw new Error(`Invalid day: ${bsDay} for month ${bsMonth + 1}`);
    
    // Calculate total days from reference BS date
    let totalBSDays = 0;
    
    // Days from reference year to target year - 1
    for (let y = REF_BS_YEAR; y < bsYear; y++) {
        const yData = NEPALI_CALENDAR_DATA.find(data => data[0] === y);
        if (!yData) throw new Error(`No data for BS year ${y}`);
        for (let m = 0; m < 12; m++) {
            totalBSDays += yData[m + 1];
        }
    }
    
    // Days in reference year up to reference date (negative)
    for (let m = 0; m < REF_BS_MONTH; m++) {
        totalBSDays -= NEPALI_CALENDAR_DATA.find(data => data[0] === REF_BS_YEAR)[m + 1];
    }
    totalBSDays -= REF_BS_DAY;
    
    // Days in target year up to target date
    for (let m = 0; m < bsMonth; m++) {
        totalBSDays += yearData[m + 1];
    }
    totalBSDays += bsDay;
    
    // Convert to AD
    let adYear = REF_AD_YEAR;
    let adMonth = REF_AD_MONTH;
    let adDay = REF_AD_DAY;
    
    while (totalBSDays > 0) {
        const daysInCurrentADMonth = daysInADMonth(adYear, adMonth);
        const daysRemainingInMonth = daysInCurrentADMonth - adDay + 1;
        
        if (totalBSDays >= daysRemainingInMonth) {
            totalBSDays -= daysRemainingInMonth;
            adDay = 1;
            adMonth++;
            if (adMonth >= 12) {
                adMonth = 0;
                adYear++;
            }
        } else {
            adDay += totalBSDays;
            totalBSDays = 0;
        }
    }
    
    // Create date object to get day name
    const adDate = new Date(adYear, adMonth, adDay);
    const dayName = ENGLISH_DAYS[adDate.getDay()];
    const monthName = ENGLISH_MONTHS[adMonth];
    const ordinal = getOrdinalSuffix(adDay);
    
    // Format: "6th July 1966 Wednesday"
    return `${adDay}${ordinal} ${monthName} ${adYear} ${dayName}`;
}

// Helper function to get today's Nepali date easily
function getTodayNepali() {
    return AD2BS(new Date());
}

// Usage examples:
console.log("=== AD to BS ===");
const today = new Date();
console.log(`Today (AD): ${today}`);
console.log(`Nepali Date: ${AD2BS(today)}`);
console.log(`Nepali Date (specific): ${AD2BS(new Date(1966, 6, 6))}`); // July 6, 1966

console.log("\n=== BS to AD ===");
console.log(`AD Date: ${BS2AD("2081-1-1")}`); // Baishakh 1, 2081
console.log(`AD Date: ${BS2AD("2000-1-1")}`); // Baishakh 1, 2000

// For your HTML:
// document.getElementById('NepaliDate').textContent = AD2BS(new Date());
// document.getElementById('EnglishDate').textContent = BS2AD("2081-1-1");
