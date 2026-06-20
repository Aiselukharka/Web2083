//Style Sheet for Edit Bal Pratibha Page
const CalendarStyleSheet = document.createElement('style');
CalendarStyleSheet.textContent = `
#CalendarEditBox{
    width: 100%;
    height: auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #ccccee, #bbbbee);
}


`;

document.head.appendChild(CalendarStyleSheet);

// Column names to display (excluding id and created_at)
const columns = [
    'e_year', 'e_month', 'e_day', 'e_day_of_week',
    'n_year', 'n_month', 'n_day', 'n_day_of_week',
    'tithi', 'national_event', 'local_event', 'event_detail', 'day_type'
];

// Column display names
const columnDisplayNames = {
    'e_year': 'English Year',
    'e_month': 'English Month',
    'e_day': 'English Day',
    'e_day_of_week': 'English Day of Week',
    'n_year': 'Nepali Year',
    'n_month': 'Nepali Month',
    'n_day': 'Nepali Day',
    'n_day_of_week': 'Nepali Day of Week',
    'tithi': 'Tithi',
    'national_event': 'National Event',
    'local_event': 'Local Event',
    'event_detail': 'Event Detail',
    'day_type': 'Day Type'
};

// Dropdown options for day_type column
const dayTypeOptions = [
    { value: "", text: "Select Day Type", disabled: true },
    { value: "Public Holiday", text: "Public Holiday" },
    { value: "Study Time", text: "Study Time" },
    { value: "Exam Time", text: "Exam Time" },
    { value: "Summer Vacation", text: "Summer Vacation" },
    { value: "Winter Vacation", text: "Winter Vacation" },
    { value: "Other School Day", text: "Other School Day" },
    { value: "Other Vacation", text: "Other Vacation" }
];

// Store data and track changes
let calendarData = [];
let modifiedRows = new Set();

// Column resize variables
let isResizing = false;
let currentColumn = null;
let startX = 0;
let startWidth = 0;

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
            '<div style="color: red; padding: 20px;">Error loading data: ' + error.message + '</div>';
    }
}

// Update save button state
function updateSaveButtonState() {
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        const hasChanges = modifiedRows.size > 0;
        saveButton.disabled = !hasChanges;
        
        if (hasChanges) {
            saveButton.style.backgroundColor = '#4CAF50';
            saveButton.style.cursor = 'pointer';
            saveButton.style.opacity = '1';
        } else {
            saveButton.style.backgroundColor = '#cccccc';
            saveButton.style.cursor = 'not-allowed';
            saveButton.style.opacity = '0.6';
        }
    }
}

// Highlight modified row
function highlightRow(row) {
    row.style.backgroundColor = '#fff3cd';
}

// Adjust column widths based on content
function adjustColumnWidths() {
    const table = document.getElementById('editableTable');
    if (!table) return;
    
    const headerCells = table.querySelectorAll('thead th');
    const rows = table.querySelectorAll('tbody tr');
    
    if (rows.length === 0) return;
    
    // Calculate optimal widths for each column
    headerCells.forEach((th, colIndex) => {
        let maxWidth = 80; // Minimum width
        
        // Get header text width
        const headerText = th.textContent;
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.fontSize = '13px';
        tempSpan.style.fontWeight = 'bold';
        tempSpan.style.padding = '8px';
        tempSpan.textContent = headerText;
        document.body.appendChild(tempSpan);
        maxWidth = Math.max(maxWidth, tempSpan.offsetWidth + 20);
        document.body.removeChild(tempSpan);
        
        // Check all cells in this column
        rows.forEach(row => {
            if (row.cells[colIndex]) {
                const cell = row.cells[colIndex];
                const input = cell.querySelector('input, select');
                let cellText = '';
                
                if (input) {
                    if (input.tagName === 'SELECT') {
                        const selectedOption = input.options[input.selectedIndex];
                        cellText = selectedOption ? selectedOption.text : '';
                    } else {
                        cellText = input.value;
                    }
                } else {
                    cellText = cell.textContent;
                }
                
                const tempSpan2 = document.createElement('span');
                tempSpan2.style.visibility = 'hidden';
                tempSpan2.style.position = 'absolute';
                tempSpan2.style.whiteSpace = 'nowrap';
                tempSpan2.style.fontSize = '13px';
                tempSpan2.style.padding = '8px';
                tempSpan2.textContent = cellText || 'Sample Text';
                document.body.appendChild(tempSpan2);
                const cellWidth = tempSpan2.offsetWidth + 30;
                maxWidth = Math.max(maxWidth, cellWidth);
                document.body.removeChild(tempSpan2);
            }
        });
        
        // Set column width
        th.style.width = maxWidth + 'px';
        th.style.minWidth = maxWidth + 'px';
        
        rows.forEach(row => {
            if (row.cells[colIndex]) {
                row.cells[colIndex].style.width = maxWidth + 'px';
                row.cells[colIndex].style.minWidth = maxWidth + 'px';
            }
        });
    });
}

// Setup column resizing
function setupColumnResizing() {
    const table = document.getElementById('editableTable');
    if (!table) return;
    
    // Remove existing resize handles to avoid duplicates
    const existingHandles = document.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => handle.remove());
    
    const headers = table.querySelectorAll('thead th');
    
    headers.forEach((header, index) => {
        // Make sure header has relative position
        header.style.position = 'relative';
        
        // Create resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.setAttribute('data-column', index);
        resizeHandle.style.cssText = `
            position: absolute;
            right: -5px;
            top: 0;
            bottom: 0;
            width: 10px;
            cursor: col-resize;
            background-color: transparent;
            user-select: none;
            z-index: 100;
        `;
        
        // Add hover effect
        resizeHandle.addEventListener('mouseenter', () => {
            resizeHandle.style.backgroundColor = '#4CAF50';
            resizeHandle.style.opacity = '0.5';
        });
        
        resizeHandle.addEventListener('mouseleave', () => {
            if (!isResizing) {
                resizeHandle.style.backgroundColor = 'transparent';
                resizeHandle.style.opacity = '1';
            }
        });
        
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            currentColumn = index;
            startX = e.pageX;
            startWidth = header.offsetWidth;
            
            // Add resizing class to table
            table.classList.add('resizing');
            
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });
        
        header.appendChild(resizeHandle);
    });
    
    // Handle mouse move and up globally
    const handleMouseMove = (e) => {
        if (!isResizing) return;
        
        e.preventDefault();
        const diff = e.pageX - startX;
        const newWidth = Math.max(50, startWidth + diff);
        
        const headers = table.querySelectorAll('thead th');
        const rows = table.querySelectorAll('tbody tr');
        
        // Update column width
        if (headers[currentColumn]) {
            headers[currentColumn].style.width = newWidth + 'px';
            headers[currentColumn].style.minWidth = newWidth + 'px';
            
            rows.forEach(row => {
                if (row.cells[currentColumn]) {
                    row.cells[currentColumn].style.width = newWidth + 'px';
                    row.cells[currentColumn].style.minWidth = newWidth + 'px';
                }
            });
        }
    };
    
    const handleMouseUp = () => {
        if (isResizing) {
            isResizing = false;
            table.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Reset handle background
            const handles = document.querySelectorAll('.resize-handle');
            handles.forEach(handle => {
                handle.style.backgroundColor = 'transparent';
                handle.style.opacity = '1';
            });
        }
    };
    
    // Remove existing listeners to avoid duplicates
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Import CSV data
async function importCSV(csvData) {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
        alert('CSV file must contain header and data rows');
        return false;
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Map CSV headers to database columns
    const columnMap = {};
    headers.forEach((header, index) => {
        const matchedColumn = columns.find(col => 
            columnDisplayNames[col] === header || 
            col === header.toLowerCase()
        );
        if (matchedColumn) {
            columnMap[index] = matchedColumn;
        }
    });
    
    const importedData = [];
    const errors = [];
    
    for (let i = 1; i < lines.length && i <= 365; i++) {
        if (!lines[i].trim()) continue;
        
        // Parse CSV line handling quoted values
        const values = [];
        let inQuote = false;
        let currentValue = '';
        
        for (let char of lines[i]) {
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());
        
        if (values.length > 0 && i - 1 < calendarData.length) {
            const updatedRow = { ...calendarData[i - 1] };
            let hasChanges = false;
            
            Object.entries(columnMap).forEach(([csvIndex, dbColumn]) => {
                const newValue = values[csvIndex] || '';
                if (updatedRow[dbColumn] != newValue) {
                    updatedRow[dbColumn] = newValue;
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                importedData.push({ id: updatedRow.id, data: updatedRow });
                calendarData[i - 1] = updatedRow;
                modifiedRows.add(updatedRow.id);
            }
        } else if (i - 1 >= calendarData.length) {
            errors.push(`Row ${i} exceeds total rows (365)`);
        }
    }
    
    if (importedData.length > 0) {
        renderTable();
        updateSaveButtonState();
        alert(`Successfully imported ${importedData.length} rows. Click Save to commit changes.`);
        if (errors.length > 0) {
            alert('Warnings:\n' + errors.join('\n'));
        }
        return true;
    } else {
        alert('No valid data to import. Please check CSV format.');
        return false;
    }
}

// Handle file upload
function setupFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const importButton = document.getElementById('importButton');
            const originalText = importButton.innerHTML;
            
            try {
                // Disable button and show importing status
                importButton.disabled = true;
                importButton.innerHTML = '⏳ Importing...';
                importButton.style.opacity = '0.6';
                importButton.style.cursor = 'not-allowed';
                
                const reader = new FileReader();
                const csvData = await new Promise((resolve, reject) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
                
                if (confirm('Importing CSV will overwrite current unsaved changes. Continue?')) {
                    await importCSV(csvData);
                }
            } catch (error) {
                console.error('Error importing CSV:', error);
                alert('Error importing CSV: ' + error.message);
            } finally {
                // Re-enable button
                importButton.disabled = false;
                importButton.innerHTML = originalText;
                importButton.style.opacity = '1';
                importButton.style.cursor = 'pointer';
                fileInput.value = '';
            }
        }
    });
    
    document.body.appendChild(fileInput);
    
    const importButton = document.getElementById('importButton');
    if (importButton) {
        // Remove existing listener to avoid duplicates
        const newImportButton = importButton.cloneNode(true);
        importButton.parentNode.replaceChild(newImportButton, importButton);
        newImportButton.addEventListener('click', () => {
            fileInput.click();
        });
    }
}

// Save changes to Supabase
async function saveChanges() {
    if (modifiedRows.size === 0) {
        showSaveStatus('No changes to save', 'info');
        return;
    }
    
    const saveButton = document.getElementById('saveButton');
    const originalText = saveButton.innerHTML;
    
    try {
        // Disable button and show saving status
        saveButton.disabled = true;
        saveButton.innerHTML = '💾 Saving...';
        saveButton.style.backgroundColor = '#ff9800';
        saveButton.style.opacity = '0.8';
        showSaveStatus('Saving changes to database...', 'info');
        
        // Prepare all updates
        const updates = [];
        const rowsToUpdate = [];
        
        for (const rowId of modifiedRows) {
            const rowData = calendarData.find(row => row.id === rowId);
            if (rowData) {
                const updateData = {};
                columns.forEach(col => {
                    updateData[col] = rowData[col];
                });
                
                rowsToUpdate.push({ id: rowId, data: updateData });
                updates.push(
                    supabaseClient
                        .from('CalendarDataTable')
                        .update(updateData)
                        .eq('id', rowId)
                );
            }
        }
        
        console.log(`Saving ${updates.length} rows...`, rowsToUpdate);
        
        // Execute all updates in parallel
        const results = await Promise.all(updates);
        
        // Check for errors
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
            console.error('Errors during save:', errors);
            throw new Error(`Failed to update ${errors.length} rows. First error: ${errors[0].error?.message || 'Unknown error'}`);
        }
        
        // Success - clear modified rows tracking
        const savedCount = results.length;
        modifiedRows.clear();
        
        showSaveStatus(`✅ Successfully saved ${savedCount} changes!`, 'success');
        
        // Refresh data to get latest from database
        await fetchCalendarData();
        
        // Update button state
        updateSaveButtonState();
        
    } catch (error) {
        console.error('Error saving data:', error);
        showSaveStatus('❌ Error saving changes: ' + error.message, 'error');
        
        // Re-enable save button on error
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.opacity = '1';
        saveButtonEnabled = true;
    }
}

function showSaveStatus(message, type) {
    const saveStatus = document.getElementById('saveStatus');
    if (!saveStatus) return;
    
    saveStatus.textContent = message;
    
    switch(type) {
        case 'error':
            saveStatus.style.color = 'red';
            break;
        case 'success':
            saveStatus.style.color = 'green';
            break;
        default:
            saveStatus.style.color = 'orange';
    }
    
    // Clear success/error messages after 5 seconds
    if (type !== 'info') {
        setTimeout(() => {
            if (document.getElementById('saveStatus') && document.getElementById('saveStatus').textContent === message) {
                document.getElementById('saveStatus').textContent = '';
            }
        }, 5000);
    }
}

// Render the table
function renderTable() {
    const container = document.getElementById('CalendarDataBox');
    
    container.innerHTML = `
        <style>
            #editableTable {
                border-collapse: collapse;
                width: 100%;
                font-family: Arial, sans-serif;
                font-size: 13px;
                background-color: white;
            }
            #editableTable td, #editableTable th {
                border: 1px solid #000000;
                padding: 8px;
                vertical-align: middle;
                background-color: white;
            }
            #editableTable th {
                background-color: #f4f4f4;
                font-weight: bold;
                position: sticky;
                top: 0;
                z-index: 10;
                border: 1px solid #000000;
            }
            #editableTable td {
                background-color: white;
                border: 1px solid #000000;
            }
            #editableTable input, #editableTable select {
                width: 100%;
                padding: 4px;
                margin: -4px;
                border: none;
                background: white;
                font-size: 13px;
                font-family: inherit;
                box-sizing: border-box;
            }
            #editableTable input:focus, #editableTable select:focus {
                outline: 2px solid #4CAF50;
                background: white;
            }
            #editableTable input:hover, #editableTable select:hover {
                background-color: #f9f9f9;
            }
            .resize-handle {
                position: absolute;
                right: -5px;
                top: 0;
                bottom: 0;
                width: 10px;
                cursor: col-resize;
                background-color: transparent;
                user-select: none;
                z-index: 100;
            }
            .resize-handle:hover {
                background-color: #4CAF50 !important;
                opacity: 0.5 !important;
            }
            #editableTable.resizing {
                user-select: none;
            }
            .table-container {
                overflow-x: auto;
                max-width: 100%;
                border: 1px solid #000000;
                border-radius: 4px;
            }
            .table-body-container {
                max-height: 600px;
                overflow-y: auto;
            }
            button:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
        </style>
        <div class="table-container">
            <div class="table-body-container">
                <table id="editableTable">
                    <thead>
                        <tr id="tableHeader"></tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button id="importButton" style="padding: 8px 16px; font-size: 14px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                📥 Import CSV
            </button>
            <button id="saveButton" style="padding: 8px 16px; font-size: 14px; background-color: #cccccc; color: white; border: none; border-radius: 4px; cursor: not-allowed; opacity: 0.6;" disabled>
                💾 Save Changes
            </button>
            <span id="saveStatus" style="margin-left: 15px; font-size: 13px;"></span>
        </div>
    `;
    
    // Create table header
    const headerRow = document.getElementById('tableHeader');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = columnDisplayNames[col] || col;
        th.style.whiteSpace = 'nowrap';
        th.style.backgroundColor = '#f4f4f4';
        th.style.border = '1px solid #000000';
        headerRow.appendChild(th);
    });
    
    // Create table body
    const tableBody = document.getElementById('tableBody');
    
    calendarData.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.id = `row-${row.id}`;
        
        if (modifiedRows.has(row.id)) {
            tr.style.backgroundColor = '#fff3cd';
        } else {
            tr.style.backgroundColor = 'white';
        }
        
        columns.forEach(col => {
            const td = document.createElement('td');
            td.style.backgroundColor = modifiedRows.has(row.id) ? '#fff3cd' : 'white';
            td.style.border = '1px solid #000000';
            
            const value = row[col] !== null && row[col] !== undefined ? row[col] : '';
            
            if (col === 'day_type') {
                // Create dropdown for day_type column
                const select = document.createElement('select');
                select.style.backgroundColor = 'white';
                
                dayTypeOptions.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.text;
                    if (option.disabled) opt.disabled = true;
                    if (value === option.value) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                });
                
                select.addEventListener('change', (e) => {
                    const newValue = e.target.value;
                    if (calendarData[rowIndex][col] !== newValue) {
                        calendarData[rowIndex][col] = newValue;
                        modifiedRows.add(row.id);
                        tr.style.backgroundColor = '#fff3cd';
                        td.style.backgroundColor = '#fff3cd';
                        updateSaveButtonState();
                        showSaveStatus('Unsaved changes detected', 'info');
                    }
                });
                
                td.appendChild(select);
            } else {
                // Create editable text input for other columns
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.style.backgroundColor = 'white';
                
                input.addEventListener('change', (e) => {
                    const newValue = e.target.value;
                    if (calendarData[rowIndex][col] !== newValue) {
                        calendarData[rowIndex][col] = newValue;
                        modifiedRows.add(row.id);
                        tr.style.backgroundColor = '#fff3cd';
                        td.style.backgroundColor = '#fff3cd';
                        updateSaveButtonState();
                        showSaveStatus('Unsaved changes detected', 'info');
                    }
                });
                
                td.appendChild(input);
            }
            
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
    
    // Adjust column widths and setup resizing
    setTimeout(() => {
        adjustColumnWidths();
        setupColumnResizing();
    }, 100);
    
    // Setup file upload
    setupFileUpload();
    
    // Attach save button event listener
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        // Remove existing listeners
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        newSaveButton.addEventListener('click', saveChanges);
    }
}

// Initialize
fetchCalendarData();