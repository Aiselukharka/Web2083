if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found.");
    document.getElementById('PresentVideoList').innerHTML = 
        '<p style="padding:20px; color:red;">Error: Supabase client not loaded.</p>';
}

// ==================== VIDEO LINK MANAGEMENT ====================

// Load videos on page load
document.addEventListener('DOMContentLoaded', function() {
    loadVideoList();
});

// -------------------- LOAD VIDEO LIST --------------------
async function loadVideoList() {
    const container = document.getElementById('PresentVideoList');
    container.innerHTML = '<p style="padding:20px;">Loading videos...</p>';

    try {
        const { data, error } = await supabaseClient
            .from('VideoLinkTable')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="padding:20px; color:#666;">No videos found. Add your first video below!</p>';
            return;
        }

        container.innerHTML = '';
        data.forEach(video => {
            const videoItem = createVideoItem(video);
            container.appendChild(videoItem);
        });

    } catch (error) {
        console.error('Error loading videos:', error);
        container.innerHTML = `<p style="padding:20px; color:red;">Error loading videos: ${error.message}</p>`;
    }
}

// -------------------- CREATE VIDEO ITEM ELEMENT --------------------
function createVideoItem(video) {
    const div = document.createElement('div');
    div.className = 'video-item';
    div.dataset.id = video.id;

    let displayName = video.VideoName || 'Untitled Video';
    let description = video.VideoDescription || '';

    div.innerHTML = `
        <div class="video-name">${displayName}</div>
        <div class="video-description">${description}</div>
        <div class="video-actions">
            <button class="btn-view" onclick="viewVideo(${video.id})">▶ View</button>
            <button class="btn-delete" onclick="deleteVideo(${video.id})">🗑 Delete</button>
        </div>
    `;

    return div;
}

// -------------------- ADD VIDEO --------------------
document.getElementById('btnAddVideoData').addEventListener('click', addVideo);

async function addVideo() {
    const titleInput = document.getElementById('NewVideoTitle');
    const linkInput = document.getElementById('NewVideoLink');
    const descInput = document.getElementById('NewVideoDecription');

    const title = titleInput.value.trim();
    let link = linkInput.value.trim();
    const description = descInput.value.trim();

    if (!title) {
        alert('Please enter a video title.');
        titleInput.focus();
        return;
    }

    if (!link) {
        alert('Please enter the video URL or embed code.');
        linkInput.focus();
        return;
    }

    // Clean the link
    link = link.trim();

    // If it's a YouTube URL, convert to embed URL for storage
    if (link.includes('youtube.com/watch') || link.includes('youtu.be/')) {
        const videoId = extractYouTubeId(link);
        if (videoId) {
            link = `https://www.youtube.com/embed/${videoId}`;
        }
    }

    try {
        const { data, error } = await supabaseClient
            .from('VideoLinkTable')
            .insert([
                { 
                    VideoName: title, 
                    VideoLink: link, 
                    VideoDescription: description 
                }
            ])
            .select();

        if (error) throw error;

        // Clear inputs
        titleInput.value = '';
        linkInput.value = '';
        descInput.value = '';

        // Reload video list
        await loadVideoList();

        alert('Video added successfully!');

    } catch (error) {
        console.error('Error adding video:', error);
        alert(`Failed to add video: ${error.message}`);
    }
}

// -------------------- VIEW VIDEO --------------------
function viewVideo(videoId) {
    fetchVideoData(videoId);
}

async function fetchVideoData(videoId) {
    try {
        const { data, error } = await supabaseClient
            .from('VideoLinkTable')
            .select('*')
            .eq('id', videoId)
            .single();

        if (error) throw error;

        if (!data) {
            alert('Video data not found.');
            return;
        }

        // Open modal with video
        openVideoModal(data);

    } catch (error) {
        console.error('Error fetching video:', error);
        alert(`Failed to load video: ${error.message}`);
    }
}

// -------------------- OPEN VIDEO MODAL --------------------
function openVideoModal(videoData) {
    const modal = document.getElementById('VideoModal');
    const title = document.getElementById('VideoModalTitle');
    const wrapper = document.getElementById('VideoModalWrapper');

    // Set title
    title.textContent = videoData.VideoName || 'Video';

    // Clear wrapper
    wrapper.innerHTML = '';

    let videoLink = videoData.VideoLink || '';
    
    // Clean the link
    videoLink = videoLink.trim();
    
    console.log('Raw video link:', videoLink);

    let iframeHtml = '';

    // Check if it's an iframe embed code (contains <iframe)
    if (videoLink.includes('<iframe')) {
        // Extract the src from the iframe
        const srcMatch = videoLink.match(/src=["']([^"']*)["']/);
        if (srcMatch && srcMatch[1]) {
            const src = srcMatch[1];
            // Make sure the src is a valid URL
            if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
                iframeHtml = `<iframe 
                    src="${src}" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="${videoData.VideoName || 'Video'}"
                    style="width:100%;height:100%;border:none;">
                </iframe>`;
            } else {
                // If src is not a valid URL, try to find any URL in the iframe
                const urlMatch = videoLink.match(/https?:\/\/[^\s"']+/);
                if (urlMatch) {
                    iframeHtml = `<iframe 
                        src="${urlMatch[0]}" 
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title="${videoData.VideoName || 'Video'}"
                        style="width:100%;height:100%;border:none;">
                    </iframe>`;
                } else {
                    showError(wrapper, 'Could not find valid video source URL');
                    showModal(modal);
                    return;
                }
            }
        } else {
            // If we can't extract src, try to find any URL in the iframe
            const urlMatch = videoLink.match(/https?:\/\/[^\s"']+/);
            if (urlMatch) {
                iframeHtml = `<iframe 
                    src="${urlMatch[0]}" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="${videoData.VideoName || 'Video'}"
                    style="width:100%;height:100%;border:none;">
                </iframe>`;
            } else {
                showError(wrapper, 'Could not find video source in embed code');
                showModal(modal);
                return;
            }
        }
    }
    // Check if it's a YouTube embed URL
    else if (videoLink.includes('youtube.com/embed')) {
        iframeHtml = `<iframe 
            src="${videoLink}" 
            frameborder="0" 
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="${videoData.VideoName || 'Video'}"
            style="width:100%;height:100%;border:none;">
        </iframe>`;
    }
    // Check if it's a YouTube watch URL or short URL
    else if (videoLink.includes('youtube.com/watch') || videoLink.includes('youtu.be/')) {
        const videoId = extractYouTubeId(videoLink);
        if (videoId) {
            iframeHtml = `<iframe 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="${videoData.VideoName || 'Video'}"
                style="width:100%;height:100%;border:none;">
            </iframe>`;
        } else {
            showError(wrapper, 'Could not extract YouTube video ID');
            showModal(modal);
            return;
        }
    }
    // Check if it's a Facebook video
    else if (videoLink.includes('facebook.com')) {
        iframeHtml = `<iframe 
            src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoLink)}&show_text=false&width=800" 
            frameborder="0" 
            allowfullscreen="true"
            allow="encrypted-media"
            style="border:none;overflow:hidden;width:100%;height:100%;">
        </iframe>`;
    }
    // If it's any other URL, try to embed it directly
    else if (videoLink.match(/^https?:\/\/.+/)) {
        iframeHtml = `<iframe 
            src="${videoLink}" 
            frameborder="0" 
            allowfullscreen
            allow="encrypted-media"
            style="border:none;overflow:hidden;width:100%;height:100%;">
        </iframe>`;
    }
    // If nothing works
    else {
        showError(wrapper, 'Invalid video link format. Please check the embed code.');
        showModal(modal);
        return;
    }

    if (iframeHtml) {
        console.log('Generated iframe:', iframeHtml);
        wrapper.innerHTML = iframeHtml;
    }

    showModal(modal);
}

// Helper function to show error message in modal
function showError(wrapper, message) {
    wrapper.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center;background:#2a2a2a;border-radius:8px;">
            <div>
                <div style="font-size:48px;margin-bottom:10px;">⚠️</div>
                <p style="font-size:18px;margin:0;">${message}</p>
                <p style="font-size:14px;color:#999;margin-top:10px;">Please check the video link and try again.</p>
            </div>
        </div>
    `;
}

// Helper function to show modal
function showModal(modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transition = 'opacity 0.3s ease';
    }, 10);

    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    };

    // Close on Escape key
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    modal._escHandler = escHandler;
}

// -------------------- CLOSE VIDEO MODAL --------------------
function closeVideoModal() {
    const modal = document.getElementById('VideoModal');
    const wrapper = document.getElementById('VideoModalWrapper');
    
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        wrapper.innerHTML = '';
    }, 300);
}

// -------------------- EXTRACT YOUTUBE VIDEO ID --------------------
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// -------------------- DELETE VIDEO --------------------
async function deleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
        const { error } = await supabaseClient
            .from('VideoLinkTable')
            .delete()
            .eq('id', videoId);

        if (error) throw error;

        await loadVideoList();
        alert('Video deleted successfully!');

    } catch (error) {
        console.error('Error deleting video:', error);
        alert(`Failed to delete video: ${error.message}`);
    }
}

// -------------------- NAVIGATION FUNCTIONS --------------------
function openCalculator() {
    if (typeof window.openCalculator === 'function') {
        window.openCalculator();
    } else {
        console.warn('Calculator function not loaded');
        alert('Calculator feature is not available.');
    }
}

function showCalendar() {
    if (typeof window.showCalendar === 'function') {
        window.showCalendar();
    } else {
        console.warn('Calendar function not loaded');
        alert('Calendar feature is not available.');
    }
}

// -------------------- PROTECTION FROM UNAUTHORIZED ACCESS --------------------
async function protectAdminPage() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) {
            alert('Please login first.');
            window.location.replace("../LoginPage/LoginIndex.html");
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.replace("../LoginPage/LoginIndex.html");
        return false;
    }
}

// Run protection
(async function() {
    const isAuthenticated = await protectAdminPage();
    if (isAuthenticated) {
        document.body.style.display = 'block';
        loadDynamicLogoAndFavicon();
    }
})();

// -------------------- DYNAMIC LOGO AND FAVICON --------------------
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single();

        if (error) {
            console.error("Error loading branding:", error.message);
            return;
        }

        if (data && data.Value) {
            const freshLogoUrl = data.Value;
            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) {
                faviconElement.href = freshLogoUrl;
            }
            const logoImgElement = document.querySelector('#LogoBox img');
            if (logoImgElement) {
                logoImgElement.src = freshLogoUrl;
            }
        }
    } catch (error) {
        console.error("Error setting up branding:", error);
    }
}

// -------------------- DATE DISPLAY --------------------
const dateBox = document.getElementById('DateBox');
if (typeof AD2BS === 'function') {
    dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";
} else {
    dateBox.innerText = new Date().toISOString().split('T')[0];
}

// -------------------- NAVIGATION DROPDOWNS --------------------
document.getElementById("PageNavigationSelect").addEventListener("change", function() {
    const pageMap = {
        "AdminPage": "../LoginPage/LoginIndex.html",
        "LibraryPage": "../../LibraryPage/LibraryIndex.html",
        "NoticePage": "../../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../../StudentPage/StudentIndex.html",
        "HumanResourcePage": "../../HumanResourcePage/HumanResourceIndex.html",
        "BalPratibhaPage": "../../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "../../GalleryPage/GalleryIndex.html",
        "SMC_TGC_Page": "../../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../../HelpingHandPage/HelpingHandIndex.html",
        "HomePage": "../../index.html"
    };
    if (pageMap[this.value]) {
        window.location.href = pageMap[this.value];
    }
});

document.getElementById("EditNavigationSelect").addEventListener("change", function() {
    const pageMap = {
        "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
        "IDCardEditBox": "../EditIDCardPage/EditIDCardIndex.html",
        "ResultEditBox": "../EditResultPage/EditResultIndex.html",
        "RoutineEditBox": "../EditRoutinePage/EditRoutineIndex.html",
        "StudentAttendanceEditBox": "../EditStudentAttendancePage/EditStudentAttendanceIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html"
    };
    if (pageMap[this.value]) {
        window.location.href = pageMap[this.value];
    }
});

document.getElementById("AdminToolsSelect").addEventListener("change", async function() {
    switch (this.value) {
        case "ChangePasswordTool":
            window.location.href = "../ChangePasswordPage/ChangePasswordIndex.html";
            break;
        case "LogoutThisDeviceTool":
            showCustomDialog2(
            "Confirm Logout",
            "Logout from this device?",
            "Yes",
            "Cancel",
            async function () {
                await supabaseClient.auth.signOut({scope: "local"});
                window.location.replace("../LoginPage/LogInIndex.html");
            },
            function () {}
        );
        break;
        case "LogoutAllDevicesTool":
        const confirm = showCustomDialog2("Confirm Logout", "Logout from all devices?", "Yes", "Cancel", function() {}, function() {});
            if (confirm==="Yes") {
                await supabaseClient .auth .signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html";
            break;
    }
    this.selectedIndex = 0;
});

console.log('Video Link Management page loaded successfully!');