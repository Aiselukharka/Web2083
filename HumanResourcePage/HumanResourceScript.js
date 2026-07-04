// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "HomePage": "../index.html",
        "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "../GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
        "AdminPage": "../AdminPage/LogInIndex.html"        
    };
    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// -------------------- DYNAMIC LOGO AND FAVICON --------------------
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolLogo', 'SchoolName', 'SchoolAddress']);
        if (error) {
            console.error("Supabase query error:", error.message);
            return;
        }
        if (data && data.length > 0) {
            const brandingData = {};
            data.forEach(item => {
                brandingData[item.Name] = item.Value;
            });
            const freshLogoUrl = brandingData.SchoolLogo;
            const faviconElement = document.getElementById('dynamicFavicon');
            const logoElement = document.getElementById('SchoolLogo');            
            if (faviconElement && freshLogoUrl) {
                faviconElement.href = freshLogoUrl;            }
            if (logoElement && freshLogoUrl) {
                logoElement.src = freshLogoUrl;
            }
            const schoolNameElement = document.getElementById('SchoolName');
            if (schoolNameElement && brandingData.SchoolName) {
                schoolNameElement.textContent = brandingData.SchoolName;
            }
            const schoolAddressElement = document.getElementById('SchoolAddress');
            if (schoolAddressElement && brandingData.SchoolAddress) {
                schoolAddressElement.textContent = brandingData.SchoolAddress;
            }
        }
    } catch (error) {
        console.error("Unexpected error setting up branding layout:", error);
    }
}

// -------------------- GLOBAL VARIABLES --------------------
let allResources = [];
let currentFilter = 'all';

// -------------------- LOAD HUMAN RESOURCES --------------------
async function loadHumanResources() {
    const loadingIndicator = document.getElementById('LoadingIndicator');
    const container = document.getElementById('StaffCardsContainer');
    const noDataMessage = document.getElementById('NoDataMessage');    
    loadingIndicator.style.display = 'block';
    container.style.display = 'none';
    noDataMessage.style.display = 'none';    
    try {
        const { data, error } = await supabaseClient
            .from('HumanResourceTable')
            .select('*')
            .order('WorkArea', { ascending: true })
            .order('Name', { ascending: true });
        if (error) {
            console.error('Error loading human resources:', error);
            loadingIndicator.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }
        allResources = data || [];
        loadingIndicator.style.display = 'none';        
        if (allResources.length === 0) {
            noDataMessage.style.display = 'block';
            return;
        }        
        renderResourceCards(allResources);
        container.style.display = 'flex';
    } catch (error) {
        console.error('Error in loadHumanResources:', error);
        loadingIndicator.style.display = 'none';
        noDataMessage.style.display = 'block';
    }
}

// -------------------- RENDER RESOURCE CARDS --------------------
function renderResourceCards(resources) {
    const container = document.getElementById('StaffCardsContainer');
    container.innerHTML = '';    
    if (!resources || resources.length === 0) {
        container.style.display = 'none';
        document.getElementById('NoDataMessage').style.display = 'block';
        return;
    }    
    container.style.display = 'flex';
    document.getElementById('NoDataMessage').style.display = 'none';    
    resources.forEach((person, index) => {
        const card = createCard(person, index);
        container.appendChild(card);
    });
}

// -------------------- CREATE INDIVIDUAL CARD (Updated) --------------------
function createCard(person, index) {
    const card = document.createElement('div');
    card.className = 'staff-card';
    card.dataset.workarea = person.WorkArea || 'Staff';
    
    // Get badge class based on WorkArea
    let badgeClass = 'badge-staff';
    let badgeText = 'Staff';
    if (person.WorkArea === 'SMC') {
        badgeClass = 'badge-smc';
        badgeText = 'SMC';
    } else if (person.WorkArea === 'PTA') {
        badgeClass = 'badge-pta';
        badgeText = 'PTA';
    }
    
    // Determine if photo exists
    const hasPhoto = person.PhotoUrl && person.PhotoUrl.trim() !== '';
    
    // Format contact number for WhatsApp
    let contactLink = '';
    let contactDisplay = person.Contact || 'N/A';
    if (person.Contact) {
        const cleanNumber = person.Contact.replace(/\D/g, '');
        if (cleanNumber) {
            contactLink = `https://wa.me/${cleanNumber}`;
        }
    }
    
    // Format email
    let emailLink = '';
    let emailDisplay = person.Email || 'N/A';
    if (person.Email) {
        emailLink = `mailto:${person.Email}`;
    }
    
    // Sanitize name for filename
    const fileName = person.Name ? person.Name.replace(/\s+/g, '_') : 'staff-card';
    
    // Build the card HTML
    card.innerHTML = `
        <div class="staff-image-box">
            <div class="staff-card-image">
                ${hasPhoto ? 
                    `<img src="${person.PhotoUrl}" alt="${person.Name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : 
                    ''
                }
                <div class="no-photo" style="${hasPhoto ? 'display:none;' : 'display:flex;'}">
                    👤
                    <span>No Photo</span>                
                </div>
                <span class="staff-card-badge ${badgeClass}">${badgeText}</span>
            </div>
            <button class="saveButtons" onclick="saveCardAsJPG(this.closest('.staff-card'), '${fileName}')">
                💾 Save as JPG
            </button>
        </div>    
            
        <div class="staff-card-content">
            <div class="staff-card-name">${person.Name || 'N/A'}</div>
            <div class="staff-card-post">${person.Post || 'No Designation'}</div>            
            <div class="staff-card-details">
                ${person.Address ? `
                    <div class="detail-item full-width">
                        <span class="icon">📍</span>
                        <span class="label">Address:</span>
                        <span class="value">${person.Address}</span>
                    </div>
                ` : ''}                
                ${person.Gender ? `
                    <div class="detail-item">
                        <span class="icon">👤</span>
                        <span class="label">Gender:</span>
                        <span class="value">${person.Gender}</span>
                    </div>
                ` : ''}                
                ${person.Contact ? `
                    <div class="detail-item">
                        <span class="icon">📱</span>
                        <span class="label">Contact:</span>
                        <span class="value">
                            <a href="${contactLink}" target="_blank" class="whatsapp-link" title="Chat on WhatsApp">
                                ${contactDisplay} 💬
                            </a>
                        </span>
                    </div>
                ` : ''}                
                ${person.Email ? `
                    <div class="detail-item">
                        <span class="icon">✉️</span>
                        <span class="label">Email:</span>
                        <span class="value">
                            <a href="${emailLink}" class="email-link" title="Send email">
                                ${emailDisplay}
                            </a>
                        </span>
                    </div>
                ` : ''}                
                ${person.Level ? `
                    <div class="detail-item">
                        <span class="icon">📚</span>
                        <span class="label">Level:</span>
                        <span class="value">${person.Level}</span>
                    </div>
                ` : ''}                
                ${person.Qualification ? `
                    <div class="detail-item full-width">
                        <span class="icon">🎓</span>
                        <span class="label">Qualification:</span>
                        <span class="value">${person.Qualification}</span>
                    </div>
                ` : ''}                
                ${person.MajorSubject ? `
                    <div class="detail-item full-width">
                        <span class="icon">📖</span>
                        <span class="label">Major Subject:</span>
                        <span class="value">${person.MajorSubject}</span>
                    </div>
                ` : ''}                
                ${person.ServiceType ? `
                    <div class="detail-item full-width">
                        <span class="icon">💼</span>
                        <span class="label">Service Type:</span>
                        <span class="value">${person.ServiceType}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add animation delay for staggered appearance
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // Trigger animation
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50 + (index * 100));
    
    return card;
}

// -------------------- FILTER RESOURCES --------------------
function filterResources(workArea) {
    currentFilter = workArea;    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === workArea) {
            btn.classList.add('active');
        }
    });    
    let filteredResources = allResources;
    if (workArea !== 'all') {
        filteredResources = allResources.filter(person => person.WorkArea === workArea);
    }    
    renderResourceCards(filteredResources);
}

// -------------------- SEARCH FUNCTIONALITY --------------------
function searchResources(query) {
    if (!query || query.trim() === '') {
        filterResources(currentFilter);
        return;
    }    
    const searchTerm = query.toLowerCase().trim();
    const filtered = allResources.filter(person => {
        const name = (person.Name || '').toLowerCase();
        const post = (person.Post || '').toLowerCase();
        const workArea = (person.WorkArea || '').toLowerCase();
        const address = (person.Address || '').toLowerCase();
        const contact = (person.Contact || '').toLowerCase();
        const email = (person.Email || '').toLowerCase();
        const qualification = (person.Qualification || '').toLowerCase();
        const subject = (person.MajorSubject || '').toLowerCase();        
        return name.includes(searchTerm) || 
               post.includes(searchTerm) || 
               workArea.includes(searchTerm) ||
               address.includes(searchTerm) ||
               contact.includes(searchTerm) ||
               email.includes(searchTerm) ||
               qualification.includes(searchTerm) ||
               subject.includes(searchTerm);
    });    
    renderResourceCards(filtered);
}

// -------------------- ADD SEARCH BAR --------------------
function addSearchBar() {
    const display = document.getElementById('HumanResourceDisplay');
    const filterContainer = document.getElementById('FilterContainer');    
    const searchContainer = document.createElement('div');
    searchContainer.id = 'SearchContainer';    
    searchContainer.innerHTML = `
        <input type="text" id="SearchInput" placeholder="🔍 Search by name, post, contact, email, or work area..." 
               onkeyup="searchResources(this.value)">
        <button class="search-btn" onclick="searchResources(document.getElementById('SearchInput').value)">
            🔍 Search
        </button>
        <button class="clear-btn" onclick="document.getElementById('SearchInput').value='';searchResources('')">
            ✕ Clear
        </button>
    `;    
    filterContainer.after(searchContainer);
}

// -------------------- SAVE CARD AS JPG --------------------
function saveCardAsJPG(cardElement, personName) {
    // Show loading state
    const saveBtn = cardElement.querySelector('.saveButtons');
    const originalText = saveBtn.textContent;
    saveBtn.style.visibility = 'hidden';
    saveBtn.textContent = '⏳ Saving...';
    saveBtn.disabled = true;
    
    // Use html2canvas to capture the card
    html2canvas(cardElement, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: cardElement.scrollWidth,
        height: cardElement.scrollHeight,
        onclone: function(clonedDoc) {
            // Ensure images are loaded
            const images = clonedDoc.querySelectorAll('img');
            return Promise.all(Array.from(images).map(img => {
                if (img.complete) return;
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));
        }
    })
    .then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `${personName || 'staff-card'}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        
        // Restore button
        saveBtn.textContent = originalText;
        saveBtn.style.visibility = 'visible';
        saveBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error saving card:', error);
        alert('Error saving card. Please try again.');
        saveBtn.textContent = originalText;
        saveBtn.style.visibility = 'visible';    
        saveBtn.disabled = false;
    });
}

// -------------------- INITIALIZATION --------------------
document.addEventListener('DOMContentLoaded', function() {
    loadDynamicLogoAndFavicon();    
    addSearchBar();    
    loadHumanResources();
});