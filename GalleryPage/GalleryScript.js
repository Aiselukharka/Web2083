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
        "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "GalleryIndex.html",
        "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
        "AdminPage": "../AdminPage/LogInIndex.html"        
    };

    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// -------------------- DYNAMICALLY LOADING HEADER AND FAVICON --------------------
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
                faviconElement.href = freshLogoUrl;            
            }
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

// -------------------- LOAD GALLERY IMAGES FROM SUPABASE --------------------
async function fetchGalleryImages() {
    const container = document.getElementById('PublicGalleryContainer');
    if (!container) return;

    container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Loading gallery images...</p>";

    try {
        const { data, error } = await supabaseClient
            .from('GalleryImageLinkTable')
            .select('ImageDescription, ImageUrl');

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No images found in the gallery.</p>";
            return;
        }

        container.innerHTML = ""; 

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-card';

            const img = document.createElement('img');
            img.src = item.ImageUrl;
            img.alt = item.ImageDescription || "Gallery Image";
            img.loading = "lazy";

            // SOFT ERROR HANDLING: Hide from user, keep in database
            img.onerror = function() {
                console.warn(`Soft hiding image card due to fetch error: ${item.ImageUrl}`);
                
                // Smoothly remove the empty placeholder card layout from the screen
                card.remove(); 
                
                // Optional alternative if you'd rather keep layout grid sizing locked:
                // card.style.display = 'none';
            };

            img.addEventListener('click', () => {
                openImageModal(item.ImageUrl, item.ImageDescription);
            });

            const infoDiv = document.createElement('div');
            infoDiv.className = 'gallery-info';

            const desc = document.createElement('p');
            desc.className = 'gallery-desc';
            desc.textContent = item.ImageDescription || "No Description Provided";

            infoDiv.appendChild(desc);
            card.appendChild(img);
            card.appendChild(infoDiv);
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error reading Gallery items:", err.message);
        container.innerHTML = `<p style='grid-column: 1/-1; text-align:center; color:red;'>Error loading gallery imagery: ${err.message}</p>`;
    }
}

// -------------------- MODAL EVENT CONTROLLERS WITH COMPONENT ZOOM --------------------
const modal = document.getElementById('GalleryModal');
const modalWrapper = document.querySelector('.modal-content-wrapper'); // TARGETING THE BOX
const modalImg = document.getElementById('ModalTargetImage');
const modalDesc = document.getElementById('ModalTargetDesc');
const modalClose = document.querySelector('.modal-close');

const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnZoomReset = document.getElementById('btnZoomReset');

let currentScale = 1.0; 

function openImageModal(url, description) {
    if (!modal || !modalWrapper || !modalImg || !modalDesc) return;
    
    currentScale = 1.0; 
    modalWrapper.style.transform = `scale(${currentScale})`; // Reset box scale matrix
    
    modalImg.src = url;
    modalDesc.textContent = description || "No Description Provided";
    modal.style.display = "flex";
}

function closeImageModal() {
    if (!modal) return;
    modal.style.display = "none";
    modalImg.src = ""; 
}

// Applies transformation scale directly to the whole container card box
function updateBoxScale() {
    if (modalWrapper) {
        modalWrapper.style.transform = `scale(${currentScale})`;
    }
}

if (btnZoomIn) {
    btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (currentScale < 2.0) { // Safety clamp so it doesn't grow wider than your monitor screen
            currentScale += 0.15;
            updateBoxScale();
        }
    });
}

if (btnZoomOut) {
    btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentScale > 0.6) { // Safety minimum bound clamp
            currentScale -= 0.15;
            updateBoxScale();
        }
    });
}

if (btnZoomReset) {
    btnZoomReset.addEventListener('click', (e) => {
        e.stopPropagation();
        currentScale = 1.0;
        updateBoxScale();
    });
}

if (modalClose) {
    modalClose.addEventListener('click', closeImageModal);
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicLogoAndFavicon();
    fetchGalleryImages();
});