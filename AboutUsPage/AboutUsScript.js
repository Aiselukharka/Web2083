// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "HumanResourcePage": "../HumanResourcePage/HumanResourceIndex.html",
        "HomePage": "../index.html",
        "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "AboutUsIndex.html",
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

// ==========================================
// 2. DYNAMIC RECORD COMPILATION ENGINE
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndRenderAboutUsData();
});

async function fetchAndRenderAboutUsData() {
    try {
        // Fetch all elements out of our designated table storage
        const { data: tableRows, error } = await supabaseClient
            .from("AboutSchoolTable")
            .select("Name, Value, FileName");

        if (error) throw error;
        if (!tableRows || tableRows.length === 0) return;

        // Convert key-value array mapping into a flat lookup object dictionary
        const dataMap = {};
        tableRows.forEach(row => {
            dataMap[row.Name] = {
                value: row.Value || '',
                fileName: row.FileName || ''
            };
        });

        // ------------------------------------------
        // A. Update Global Navigation Branding & Favicons
        // ------------------------------------------
        if (dataMap["SchoolLogo"] && dataMap["SchoolLogo"].value) {
            const parsedLogoUrl = dataMap["SchoolLogo"].value;
            
            // Set nav layout image block
            const headerLogoImg = document.getElementById("HeaderLogo");
            if (headerLogoImg) headerLogoImg.src = parsedLogoUrl;
            
            // Set document layout header tab shortcut shortcut icon
            const dynamicFavicon = document.getElementById("DynamicFavicon");
            if (dynamicFavicon) dynamicFavicon.href = parsedLogoUrl;
        }

        // ------------------------------------------
        // B. Populate Core School Meta Data Fields
        // ------------------------------------------
        if (dataMap["SchoolName"]) document.getElementById("DisplaySchoolName").textContent = dataMap["SchoolName"].value;
        if (dataMap["SchoolAddress"]) document.getElementById("DisplaySchoolAddress").textContent = dataMap["SchoolAddress"].value;
        if (dataMap["SchoolContact"]) document.getElementById("DisplaySchoolContact").textContent = dataMap["SchoolContact"].value;
        if (dataMap["SchoolEmail"]) document.getElementById("DisplaySchoolEmail").textContent = dataMap["SchoolEmail"].value;
        
        if (dataMap["SchoolWebsite"] && dataMap["SchoolWebsite"].value) {
            const webAnchor = document.getElementById("DisplaySchoolWebsite");
            webAnchor.textContent = dataMap["SchoolWebsite"].value;
            // Prep security prefixes if missing
            webAnchor.href = dataMap["SchoolWebsite"].value.startsWith('http') ? dataMap["SchoolWebsite"].value : `https://${dataMap["SchoolWebsite"].value}`;
        }

        // ------------------------------------------
        // C. Render Active Social Media Connections
        // ------------------------------------------
        const socialContainer = document.getElementById("SocialLinksContainer");
        socialContainer.innerHTML = ''; // Wipes old template markup text
        
        const platforms = ['Facebook', 'TikTok', 'Instagram', 'WhatsApp', 'YouTube'];
        platforms.forEach(platform => {
            const dbKey = `${platform}Url`;
            if (dataMap[dbKey] && dataMap[dbKey].value) {
                const targetUrl = dataMap[dbKey].value;
                const linkAnchor = document.createElement("a");
                linkAnchor.className = "social-btn";
                linkAnchor.target = "_blank";
                linkAnchor.href = targetUrl.startsWith('http') || platform === 'WhatsApp' ? targetUrl : `https://${targetUrl}`;
                linkAnchor.textContent = platform;
                socialContainer.appendChild(linkAnchor);
            }
        });

        // ------------------------------------------
        // D. Render Special Administration Staff Profiles Card Grid
        // ------------------------------------------
        // ------------------------------------------
        // D. Render Special Administration Staff Profiles Card Grid
        // ------------------------------------------
        const staffRoles = [
            { id: 'Principal', dbPhotoKey: 'PrincipalPhoto', label: 'Principal' },
            { id: 'VicePrincipal', dbPhotoKey: 'VicePrincipalPhoto', label: 'Vice Principal' },
            { id: 'SMCHead', dbPhotoKey: 'SMCHeadPhoto', label: 'SMC Head' },
            { id: 'Accountant', dbPhotoKey: 'AccountantPhoto', label: 'School Accountant' },
            { id: 'ExamHead', dbPhotoKey: 'ExamHeadPhoto', label: 'Examination Controller' },
            { id: 'ECAHead', dbPhotoKey: 'ECAHeadPhoto', label: 'ECA Department Head' }
        ];

        const cardsGrid = document.getElementById("SpecialContactsGrid");
        cardsGrid.innerHTML = ''; 

        staffRoles.forEach(role => {
            // 1. Extract Name and Email entries
            const nameVal = dataMap[`${role.id}Name`]?.value || '';
            const emailVal = dataMap[`${role.id}Email`]?.value || '';
            
            // 2. FIX: Check both "Mobile" and "Contact" suffixes to prevent database naming mismatches
            const mobileVal = dataMap[`${role.id}Mobile`]?.value || dataMap[`${role.id}Contact`]?.value || '';
            
            // 3. Extract the image path matching your exact table configurations
            const photoUrl = dataMap[role.dbPhotoKey]?.value || 'https://res.cloudinary.com/dfsaihbk7/image/upload/v1779451142/satakon_h6cojj.png';

            // Only display a card component if at least a name or an image path exists
            if (nameVal || dataMap[role.dbPhotoKey]?.value) {
                const cardHTML = `
                    <div class="contact-card">
                        <div class="image-container">
                            <img src="${photoUrl}" alt="${role.label}" loading="lazy">
                        </div>
                        <div class="contact-details-box">
                            <div class="contact-role-tag">${role.label}</div>
                            <div class="contact-name">${nameVal || 'Name Not Provided'}</div>
                            ${mobileVal ? `<div class="contact-info-line"><strong>Mobile:</strong> ${mobileVal}</div>` : ''}
                            ${emailVal ? `<div class="contact-info-line"><strong>Email:</strong> ${emailVal}</div>` : ''}
                        </div>
                    </div>
                `;
                cardsGrid.innerHTML += cardHTML;
            }
        });

    } catch (err) {
        console.error("Critical failure during layout rendering execution stack:", err);
    }
}

//Dynamically show logo and favicon
async function loadDynamicLogoAndFavicon() {
    try {
        // Query the table natively using your pre-configured supabaseClient
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single(); // Accesses the single matching record directly

        if (error) {
            console.error("Supabase query error loading branding:", error.message);
            return;
        }

        if (data && data.Value) {
            const freshLogoUrl = data.Value;

            // 1. Update the Favicon inside the Document Head
            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) {
                faviconElement.href = freshLogoUrl;
            }

            // 2. Update the Logo Image Source inside #LogoBox
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