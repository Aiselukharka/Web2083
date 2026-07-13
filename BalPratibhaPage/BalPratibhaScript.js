// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "BalPratibhaPage": "BalPratibhaIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "HumanResourcePage": "../HumanResourcePage/HumanResourceIndex.html",
        "HomePage": "../index.html",
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
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicLogoAndFavicon();
});

// -------------------- LOAD BAL PRATIBHA IMAGES FROM SUPABASE --------------------
async function loadBalPratibhaImages() {
    try {
        // Create a container for the images if it doesn't exist
        let galleryContainer = document.getElementById('BalPratibhaGallery');
        if (!galleryContainer) {
            galleryContainer = document.createElement('div');
            galleryContainer.id = 'BalPratibhaGallery';
            galleryContainer.style.cssText = `
                width: 100%;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                padding: 20px;
                background: #f5f5f5;
                border-radius: 10px;
                margin-top: 20px;
            `;
            
            // Insert after PageNaviggationBox
            const navigationBox = document.getElementById('PageNaviggationBox');
            if (navigationBox && navigationBox.parentNode) {
                navigationBox.parentNode.insertBefore(galleryContainer, navigationBox.nextSibling);
            }
        }

        // Clear existing content (except loading message)
        galleryContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 20px;">Loading images...</div>';

        // Fetch data from Supabase
        const { data, error } = await supabaseClient
            .from('BalPratibhaTable')
            .select('PratibhaTopic, PratibhaCreatorName, PratibhaCreatorClass, PratibhaUrl, PratibhaPublicId')
            .order('PratibhaTopic', { ascending: true });

        if (error) {
            console.error("Supabase query error:", error.message);
            galleryContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 20px; color: red;">
                    Error loading images: ${error.message}
                </div>
            `;
            return;
        }

        if (!data || data.length === 0) {
            galleryContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 20px;">
                    No images found in Bal Pratibha gallery.
                </div>
            `;
            return;
        }

        // Clear loading message
        galleryContainer.innerHTML = '';

        // Create image cards
        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;
            `;
            
            card.onmouseenter = () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            };
            card.onmouseleave = () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            };

            // Thumbnail image
            const thumbnail = document.createElement('img');
            thumbnail.src = item.PratibhaUrl;
            thumbnail.alt = item.PratibhaTopic || 'Bal Pratibha Image';
            thumbnail.style.cssText = `
                width: 100%;
                height: 250px;
                object-fit: cover;
                display: block;
            `;

            // Image info container
            const infoContainer = document.createElement('div');
            infoContainer.style.cssText = `
                padding: 15px;
                background: white;
            `;

            // Topic
            const topic = document.createElement('h3');
            topic.textContent = item.PratibhaTopic || 'Untitled';
            topic.style.cssText = `
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 8px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;

            // Creator name and class
            const creatorInfo = document.createElement('div');
            creatorInfo.style.cssText = `
                font-size: 14px;
                color: #666;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            const creatorName = document.createElement('span');
            creatorName.textContent = item.PratibhaCreatorName || 'Unknown Creator';

            const creatorClass = document.createElement('span');
            creatorClass.textContent = item.PratibhaCreatorClass || '';
            creatorClass.style.cssText = `
                background: #4CAF50;
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 12px;
            `;

            creatorInfo.appendChild(creatorName);
            if (item.PratibhaCreatorClass) {
                creatorInfo.appendChild(creatorClass);
            }

            infoContainer.appendChild(topic);
            infoContainer.appendChild(creatorInfo);

            card.appendChild(thumbnail);
            card.appendChild(infoContainer);

            // Add click event to open picture viewer
            card.addEventListener('click', () => {
                const title = `${item.PratibhaTopic || 'Image'} by ${item.PratibhaCreatorName || 'Unknown'}`;
                showPictureViewer(item.PratibhaUrl, title);
            });

            galleryContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Unexpected error loading Bal Pratibha images:", error);
        const galleryContainer = document.getElementById('BalPratibhaGallery');
        if (galleryContainer) {
            galleryContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 20px; color: red;">
                    Unexpected error: ${error.message}
                </div>
            `;
        }
    }
}

// -------------------- SHOW PICTURE VIEWER FUNCTION --------------------
function showPictureViewer(imageUrl, imageTitle = "") {
    // Remove existing viewer if any
    const oldViewer = document.getElementById("pictureViewer");
    if (oldViewer) oldViewer.remove();
    
    let zoom = 1;
    const overlay = document.createElement("div");
    overlay.id = "pictureViewer";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "99999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    
    // Toolbar
    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.alignItems = "center";
    toolbar.style.justifyContent = "space-between";
    toolbar.style.padding = "10px 15px";
    toolbar.style.background = "#222";
    toolbar.style.flexWrap = "wrap";
    toolbar.style.gap = "10px";
    
    // Title
    const title = document.createElement("div");
    title.textContent = imageTitle || "Image Viewer";
    title.style.color = "white";
    title.style.fontSize = "18px";
    title.style.fontWeight = "bold";
    title.style.maxWidth = "60%";
    title.style.overflow = "hidden";
    title.style.textOverflow = "ellipsis";
    title.style.whiteSpace = "nowrap";
    
    // Controls
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "10px";
    
    const btnZoomOut = document.createElement("button");
    btnZoomOut.textContent = "−";
    const btnZoomIn = document.createElement("button");
    btnZoomIn.textContent = "+";
    const btnClose = document.createElement("button");
    btnClose.textContent = "✕";
    
    [btnZoomIn, btnZoomOut, btnClose].forEach(btn => {
        btn.style.padding = "8px 14px";
        btn.style.fontSize = "18px";
        btn.style.cursor = "pointer";
        btn.style.border = "none";
        btn.style.borderRadius = "5px";
        btn.style.background = "#555";
        btn.style.color = "white";
        btn.style.fontWeight = "bold";
        btn.style.transition = "all 0.3s ease";
    });
    
    btnZoomIn.onmouseenter = () => {
        btnZoomIn.style.background = "#4CAF50";
        btnZoomIn.style.color = "yellow";
    };
    btnZoomIn.onmouseleave = () => {
        btnZoomIn.style.background = "#555";
        btnZoomIn.style.color = "white";
    };
    
    btnZoomOut.onmouseenter = () => {
        btnZoomOut.style.background = "#2196F3";
        btnZoomOut.style.color = "yellow";
    };
    btnZoomOut.onmouseleave = () => {
        btnZoomOut.style.background = "#555";
        btnZoomOut.style.color = "white";
    };
    
    btnClose.onmouseenter = () => {
        btnClose.style.background = "#f44336";
        btnClose.style.color = "yellow";
    };
    btnClose.onmouseleave = () => {
        btnClose.style.background = "#555";
        btnClose.style.color = "white";
    };
    
    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.style.flex = "1";
    imageContainer.style.overflow = "auto";
    imageContainer.style.display = "flex";
    imageContainer.style.justifyContent = "center";
    imageContainer.style.alignItems = "flex-start";
    imageContainer.style.padding = "20px";
    imageContainer.style.position = "relative";
    
    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.width = "90vw";
    img.style.height = "auto";
    img.style.transformOrigin = "top center";
    img.style.transition = "transform 0.2s ease";
    img.style.maxHeight = "80vh";
    img.style.objectFit = "contain";
    
    function updateZoom() {
        img.style.transform = `scale(${zoom})`;
    }
    
    btnZoomIn.onclick = () => {
        zoom += 0.25;
        updateZoom();
    };
    
    btnZoomOut.onclick = () => {
        if (zoom > 0.5) {
            zoom -= 0.25;
            updateZoom();
        }
    };
    
    btnClose.onclick = () => overlay.remove();
    
    // Close on click outside image (on background)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === imageContainer) {
            overlay.remove();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function keyHandler(e) {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
        } else if (e.key === '+' || e.key === '=') {
            zoom += 0.25;
            updateZoom();
        } else if (e.key === '-') {
            if (zoom > 0.5) {
                zoom -= 0.25;
                updateZoom();
            }
        }
    });
    
    controls.appendChild(btnZoomOut);
    controls.appendChild(btnZoomIn);
    controls.appendChild(btnClose);
    toolbar.appendChild(title);
    toolbar.appendChild(controls);
    imageContainer.appendChild(img);
    overlay.appendChild(toolbar);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);
}

// -------------------- INITIALIZE ON PAGE LOAD --------------------
document.addEventListener('DOMContentLoaded', () => {
    // Load Bal Pratibha images after the page is ready
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
        loadBalPratibhaImages();
    }, 500);
});