
// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "AdminPage/AdminIndex.html",
        "LibraryPage": "LibraryPage/LibraryIndex.html",
        "NoticePage": "NoticePage/NoticeIndex.html",
        "QuestionBankPage": "QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "StudentPage/StudentIndex.html",
        "TeacherPage": "TeacherPage/TeacherIndex.html",
        "BalPratibhaPage": "BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "HelpingHandPage/HelpingHandIndex.html",
        "HomePage": "index.html"
    };

    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// SUPABASE CONFIGURATION
// ========================
// 🔧 REPLACE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://wrjivuysumgpoqmabwpw.supabase.co';      // <-- REPLACE with your supabase url
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyaml2dXlzdW1ncG9xbWFid3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzczMTEsImV4cCI6MjA5NjY1MzMxMX0.Cfi1IwCFDEHGq1f4g_1amRduxeEiWvoZy4BwxNAtv8A';                  // <-- REPLACE with your anon key
const TABLE_NAME = 'AdminImageTable';                         // your table name

// ============================================================
// FETCH IMAGES FROM SUPABASE (including Credentials column)
// ============================================================
async function fetchSliderImagesFromSupabase() {
    console.log("Fetching from Supabase table:", TABLE_NAME);
    
    if (SUPABASE_URL.includes('your-project') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
        console.warn("⚠️ Please configure your Supabase credentials");
        return null;
    }
    
    try {
        const allRecordsUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&limit=50`;
        
        const allResponse = await fetch(allRecordsUrl, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!allResponse.ok) {
            throw new Error(`HTTP ${allResponse.status}: ${allResponse.statusText}`);
        }
        
        const allRecords = await allResponse.json();
        console.log(`Found ${allRecords.length} total records`);
        
        if (allRecords.length === 0) {
            throw new Error("No records found in the table");
        }
        
        const sliderRecords = allRecords.filter(record => {            
            const imageName = record.ImageName || '';
            return imageName.toLowerCase().includes('sliderpicture');            
        });
        
        console.log(`Found ${sliderRecords.length} slider pictures`);
        
        if (sliderRecords.length === 0) {
            const allNames = allRecords.map(r => r.ImageName).filter(n => n);
            throw new Error(`No SliderPicture records. Found: ${allNames.join(', ')}`);
        }
        
        const sortedRecords = sliderRecords.sort((a, b) => {
            const getNumber = (name) => {
                const match = String(name || '').match(/SliderPicture(\d+)/i);
                return match ? parseInt(match[1], 10) : 999;
            };
            return getNumber(a.ImageName) - getNumber(b.ImageName);
        });
        
        const validRecords = sortedRecords.filter(r => r.ImageUrl && r.ImageUrl.trim() !== '');
        
        return validRecords.map(record => ({
            name: record.ImageName,
            url: record.ImageUrl,
            id: record.id,
            credentials: record.Credentials || record.credentials || record.Credential || record.credential || "No credentials provided"
        }));
        
    } catch (err) {
        console.error("Supabase error:", err);
        return null;
    }
}

// ============================================================
// DEMO FALLBACK IMAGES (with sample credentials)
// ============================================================
function generateDemoImages() {
    const demoSources = [
        "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682687221038-404670d09cae?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682695797221-8164ff1fafc4?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682685797366-715d29e2f9ad?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682687982204-f1a77dcc3067?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682695794947-17061dc284dd?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682695795552-aeec1f8a8f36?w=800&h=450&fit=crop",
        "https://images.unsplash.com/photo-1682686580391-615b1d28e5ee?w=800&h=450&fit=crop"
    ];
    
    const demoCredentials = [
        "📷 Photographer: John Anderson | Location: Swiss Alps",
        "🎨 Artist: Maria Garcia | Exhibition: Modern Horizons",
        "🏔️ Nature Series by David Chen | Shot in Patagonia",
        "🌅 Sunset Collection | Photographer: Sarah Williams",
        "🎭 Urban Life | Captured by Michael Brown",
        "🌸 Floral Dreams | Artist: Emma Thompson",
        "🌊 Ocean Vibes | Photography by James Wilson",
        "🏯 Cultural Heritage | Documented by Lisa Park",
        "✨ Starry Nights | Astrophotography by Robert Kumar",
        "🍃 Zen Garden | Creator: Olivia Martinez"
    ];
    
    return demoSources.map((url, i) => ({
        name: `SliderPicture${i+1} (Demo)`,
        url: url,
        id: i+1,
        credentials: demoCredentials[i]
    }));
}

// ============================================================
// INFINITE SMOOTH SLIDER WITH SEAMLESS LOOP
// ============================================================
let slidesData = [];
let currentIndex = 0;
let autoPlayInterval = null;
const AUTO_DELAY = 5000;
let isTransitioning = false;
let totalSlides = 0;

const slidesArea = document.getElementById('slidesArea');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dotsContainer');
const loaderOverlay = document.getElementById('loaderOverlay');

let slidesTrack = null;

function createSliderTrack() {
    while (slidesArea.firstChild) {
        slidesArea.removeChild(slidesArea.firstChild);
    }
    slidesTrack = document.createElement('div');
    slidesTrack.className = 'slides-track';
    slidesArea.appendChild(slidesTrack);
}

function updateCredentialOverlay(index) {
    const existingOverlays = document.querySelectorAll('.credential-overlay');
    existingOverlays.forEach(overlay => overlay.remove());
    
    const slides = document.querySelectorAll('.slide');
    if (slides[index] && slidesData[index % slidesData.length]) {
        const realIndex = index % slidesData.length;
        const overlay = document.createElement('div');
        overlay.className = 'credential-overlay';
        overlay.innerHTML = `
            <i class="fas fa-certificate"></i>
            <span class="credential-text">${escapeHtml(slidesData[realIndex].credentials || 'No credentials available')}</span>
        `;
        slides[index].appendChild(overlay);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Build slider with cloned items for infinite seamless loop
function buildSlider(images) {
    if (!images || images.length === 0) {
        throw new Error("No images to display");
    }
    
    slidesData = images;
    totalSlides = slidesData.length;
    createSliderTrack();
    
    // Create 3 sets of slides: previous, current, next for seamless infinite loop
    // We'll clone the array to create a long track that allows smooth wrapping
    const extendedSlides = [...slidesData, ...slidesData, ...slidesData];
    
    extendedSlides.forEach((item, idx) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.name || `Slide ${(idx % totalSlides) + 1}`;
        img.onerror = function() {
            this.src = "https://placehold.co/800x450/1e293b/38bdf8?text=Image+Error";
        };
        slideDiv.appendChild(img);
        slidesTrack.appendChild(slideDiv);
    });
    
    // Create dots (only for real slides, not clones)
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active-dot');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    // Start at the middle set (first slide of the middle set)
    const startPosition = totalSlides;
    slidesTrack.style.transition = 'none';
    const translateX = -startPosition * 100;
    slidesTrack.style.transform = `translateX(${translateX}%)`;
    slidesTrack.offsetHeight; // force reflow
    slidesTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    currentIndex = startPosition;
    updateActiveStates(0);
    updateCredentialOverlay(currentIndex);
    startAutoPlay();
}

function updateActiveStates(realIndex) {
    // Update dots based on real index
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        if (i === realIndex) {
            dot.classList.add('active-dot');
        } else {
            dot.classList.remove('active-dot');
        }
    });
}

function goToSlide(targetRealIndex, shouldAnimate = true) {
    if (isTransitioning) return;
    if (!slidesData.length) return;
    
    // Target real index between 0 and totalSlides-1
    let targetReal = targetRealIndex;
    if (targetReal < 0) targetReal = totalSlides - 1;
    if (targetReal >= totalSlides) targetReal = 0;
    
    // Calculate target position in the track
    let targetTrackIndex = currentIndex;
    let targetDelta = targetReal - (currentIndex % totalSlides);
    
    if (Math.abs(targetDelta) > totalSlides / 2) {
        if (targetDelta > 0) {
            targetDelta = targetDelta - totalSlides;
        } else {
            targetDelta = targetDelta + totalSlides;
        }
    }
    
    targetTrackIndex = currentIndex + targetDelta;
    
    isTransitioning = true;
    
    if (shouldAnimate) {
        slidesTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        const translateX = -targetTrackIndex * 100;
        slidesTrack.style.transform = `translateX(${translateX}%)`;
    } else {
        slidesTrack.style.transition = 'none';
        const translateX = -targetTrackIndex * 100;
        slidesTrack.style.transform = `translateX(${translateX}%)`;
        slidesTrack.offsetHeight;
        slidesTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    // Update after animation
    setTimeout(() => {
        currentIndex = targetTrackIndex;
        updateActiveStates(currentIndex % totalSlides);
        updateCredentialOverlay(currentIndex);
        
        // Reset position if we're near the edges to maintain infinite loop
        if (currentIndex <= totalSlides - 1) {
            // Moved to beginning of track - jump to middle set
            slidesTrack.style.transition = 'none';
            const newPosition = currentIndex + totalSlides;
            const newTranslate = -newPosition * 100;
            slidesTrack.style.transform = `translateX(${newTranslate}%)`;
            slidesTrack.offsetHeight;
            slidesTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            currentIndex = newPosition;
            updateCredentialOverlay(currentIndex);
        } else if (currentIndex >= totalSlides * 2 - 1) {
            // Moved to end of track - jump to middle set
            slidesTrack.style.transition = 'none';
            const newPosition = currentIndex - totalSlides;
            const newTranslate = -newPosition * 100;
            slidesTrack.style.transform = `translateX(${newTranslate}%)`;
            slidesTrack.offsetHeight;
            slidesTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            currentIndex = newPosition;
            updateCredentialOverlay(currentIndex);
        }
        
        isTransitioning = false;
    }, 500);
    
    resetAutoPlay();
}

function nextSlide() {
    const nextRealIndex = ((currentIndex % totalSlides) + 1) % totalSlides;
    goToSlide(nextRealIndex);
}

function prevSlide() {
    const prevRealIndex = (currentIndex % totalSlides) - 1;
    goToSlide(prevRealIndex < 0 ? totalSlides - 1 : prevRealIndex);
}

function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
        if (!isTransitioning) {
            nextSlide();
        }
    }, AUTO_DELAY);
}

function resetAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
}

function attachEvents() {
    if (prevBtn) {
        prevBtn.onclick = () => {
            prevSlide();
            resetAutoPlay();
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = () => {
            nextSlide();
            resetAutoPlay();
        };
    }
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoPlay();
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoPlay();
            e.preventDefault();
        }
    });
    
    let touchStartX = 0;
    const wrapper = document.querySelector('.slider-wrapper');
    
    if (wrapper) {
        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        wrapper.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diffX = touchEndX - touchStartX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
                resetAutoPlay();
            }
        });
    }
}

function finalizeAndShow() {
    if (loaderOverlay) {
        loaderOverlay.style.display = 'none';
    }
    if (prevBtn) {
        prevBtn.style.display = 'flex';
    }
    if (nextBtn) {
        nextBtn.style.display = 'flex';
    }
    attachEvents();
}

function showError(message) {
    if (loaderOverlay) {
        loaderOverlay.innerHTML = `
            <div style="text-align: center; background: rgba(127,29,29,0.95); padding: 1.5rem; border-radius: 1rem; max-width: 90%;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f87171;"></i>
                <p style="margin: 0.8rem 0; color: #fecaca; font-size: 0.9rem;"><strong>${message}</strong></p>
                <button onclick="location.reload()" style="margin-top: 0.8rem; padding: 0.5rem 1.2rem; background: #38bdf8; border: none; border-radius: 1.5rem; color: #0f172a; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
}

async function initSlider() {
    try {
        console.log("Initializing infinite smooth slider...");
        let imagesData = await fetchSliderImagesFromSupabase();
        
        if (!imagesData || imagesData.length === 0) {
            console.log("Using demo fallback images");
            imagesData = generateDemoImages();
        } else {
            console.log(`Loaded ${imagesData.length} images from Supabase`);
        }
        
        buildSlider(imagesData);
        finalizeAndShow();
        
    } catch (err) {
        console.error("Fatal error:", err);
        showError(err.message || "Failed to initialize slider");
    }
}

initSlider();
