// Video Gallery Script
// ========================

// Supabase table name for videos
const VIDEO_TABLE_NAME = 'VideoLinkTable';

// ============================================================
// SAFELY ENCODE STRINGS FOR HTML
// ============================================================
function safeEncode(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
// FETCH VIDEOS FROM SUPABASE
// ============================================================
async function fetchVideosFromSupabase() {
    console.log('Fetching videos from Supabase table:', VIDEO_TABLE_NAME);
    
    try {
        var allRecordsUrl = SUPABASE_URL + '/rest/v1/' + VIDEO_TABLE_NAME + '?select=*&limit=50';
        var response = await fetch(allRecordsUrl, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        
        var records = await response.json();
        console.log('Found ' + records.length + ' video records');
        
        return records;
        
    } catch (err) {
        console.error('Error fetching videos:', err);
        return null;
    }
}

// ============================================================
// EXTRACT VIDEO ID FROM EMBED CODE
// ============================================================
function extractVideoInfo(embedCode) {
    if (!embedCode) {
        console.warn('Empty embed code');
        return null;
    }
    
    var cleanCode = String(embedCode).trim();
    console.log('Processing embed code...');
    
    var videoId = null;
    var platform = null;
    
    // ============================================================
    // YOUTUBE EXTRACTION
    // ============================================================
    
    // Format 1: youtube.com/embed/VIDEO_ID
    var youtubeMatch = cleanCode.match(/youtube\.com\/embed\/([^"?&]+)/);
    if (youtubeMatch) {
        videoId = youtubeMatch[1];
        platform = 'youtube';
        console.log('YouTube video found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Format 2: youtu.be/VIDEO_ID
    youtubeMatch = cleanCode.match(/youtu\.be\/([^"?&]+)/);
    if (youtubeMatch) {
        videoId = youtubeMatch[1];
        platform = 'youtube';
        console.log('YouTube short URL video found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Format 3: youtube.com/watch?v=VIDEO_ID
    youtubeMatch = cleanCode.match(/youtube\.com\/watch\?v=([^"?&]+)/);
    if (youtubeMatch) {
        videoId = youtubeMatch[1];
        platform = 'youtube';
        console.log('YouTube watch URL video found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // ============================================================
    // FACEBOOK EXTRACTION
    // ============================================================
    
    // Format 1: URL-encoded Facebook Reel
    var facebookMatch = cleanCode.match(/facebook\.com%2Freel%2F(\d+)/);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        platform = 'facebook';
        console.log('Facebook Reel found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Format 2: URL-encoded Facebook video
    facebookMatch = cleanCode.match(/facebook\.com%2F.*?%2Fvideos%2F(\d+)/);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        platform = 'facebook';
        console.log('Facebook video found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Try decoding URL for other formats
    var decodedCode = cleanCode;
    try {
        decodedCode = decodeURIComponent(cleanCode);
    } catch (e) {
        // Keep original if decode fails
    }
    
    // Format 3: Decoded Facebook Reel
    facebookMatch = decodedCode.match(/facebook\.com\/reel\/(\d+)/);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        platform = 'facebook';
        console.log('Facebook Reel (decoded) found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Format 4: Decoded Facebook video
    facebookMatch = decodedCode.match(/facebook\.com\/watch\/\?v=(\d+)/);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        platform = 'facebook';
        console.log('Facebook watch URL found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Format 5: Decoded Facebook user video
    facebookMatch = decodedCode.match(/facebook\.com\/[^\/]+\/videos\/(\d+)/);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        platform = 'facebook';
        console.log('Facebook user video found - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    // Format 6: Any long number in Facebook embed
    var numberPattern = /facebook.*?(\d{10,})/;
    facebookMatch = cleanCode.match(numberPattern);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        platform = 'facebook';
        console.log('Facebook video ID extracted - ID: ' + videoId);
        return { videoId: videoId, platform: platform };
    }
    
    console.warn('Could not extract video ID from embed code');
    return null;
}

// ============================================================
// GENERATE THUMBNAIL URL
// ============================================================
function getVideoThumbnail(videoInfo) {
    if (!videoInfo) return null;
    
    if (videoInfo.platform === 'youtube') {
        return 'https://img.youtube.com/vi/' + videoInfo.videoId + '/maxresdefault.jpg';
    } else if (videoInfo.platform === 'facebook') {
        return 'https://graph.facebook.com/' + videoInfo.videoId + '/picture?type=large';
    }
    
    return null;
}

// ============================================================
// GENERATE EMBED URL FOR PLAYBACK
// ============================================================
function getEmbedUrl(videoInfo) {
    if (!videoInfo) return null;
    
    if (videoInfo.platform === 'youtube') {
        return 'https://www.youtube.com/embed/' + videoInfo.videoId + '?autoplay=1&rel=0&modestbranding=1';
    } else if (videoInfo.platform === 'facebook') {
        return 'https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=' + videoInfo.videoId + '&autoplay=1&show_text=0&width=560';
    }
    
    return null;
}

// ============================================================
// CREATE VIDEO CARDS
// ============================================================
function createVideoCards(videos) {
    var videoGrid = document.getElementById('videoGrid');
    
    if (!videoGrid) {
        console.error('Video grid element not found');
        return;
    }
    
    // Clear existing content
    videoGrid.innerHTML = '';
    
    if (!videos || videos.length === 0) {
        videoGrid.innerHTML = '<div class="video-no-results"><i class="fas fa-video" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i><p>No videos available at the moment.</p></div>';
        return;
    }
    
    var validVideos = 0;
    var processedVideos = [];
    
    for (var i = 0; i < videos.length; i++) {
        try {
            var video = videos[i];
            var videoName = video.VideoName ? String(video.VideoName).trim() : 'Untitled Video';
            var videoLink = video.VideoLink ? String(video.VideoLink).trim() : '';
            var videoDescription = video.VideoDescription ? String(video.VideoDescription).trim() : 'No description available';
            
            console.log('Processing video ' + (i + 1) + ': ' + videoName);
            
            if (!videoLink) {
                console.warn('No video link for: ' + videoName);
                continue;
            }
            
            var videoInfo = extractVideoInfo(videoLink);
            
            if (!videoInfo) {
                console.warn('Invalid video embed code for: ' + videoName);
                continue;
            }
            
            var thumbnailUrl = getVideoThumbnail(videoInfo);
            var embedUrl = getEmbedUrl(videoInfo);
            
            if (!embedUrl) {
                console.warn('Could not generate embed URL for: ' + videoName);
                continue;
            }
            
            validVideos++;
            processedVideos.push({
                videoInfo: videoInfo,
                thumbnailUrl: thumbnailUrl || '',
                embedUrl: embedUrl,
                safeName: safeEncode(videoName),
                safeDescription: safeEncode(videoDescription)
            });
            
            console.log('Successfully processed: ' + videoName + ' (' + videoInfo.platform + ')');
        } catch (err) {
            console.error('Error processing video ' + i + ':', err);
        }
    }
    
    if (validVideos === 0) {
        videoGrid.innerHTML = '<div class="video-no-results"><i class="fas fa-exclamation-triangle" style="font-size: 2rem; display: block; margin-bottom: 10px; color: #fbbf24;"></i><p style="color: #f1f5f9;">No valid videos found. Please check your video links.</p></div>';
        return;
    }
    
    // Create video cards
    var fragment = document.createDocumentFragment();
    
    for (var j = 0; j < processedVideos.length; j++) {
        try {
            var data = processedVideos[j];
            
            var videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            
            var platformBadge = '';
            if (data.videoInfo.platform === 'youtube') {
                platformBadge = '<span class="video-platform-badge badge-youtube"><i class="fab fa-youtube"></i> YouTube</span>';
            } else {
                platformBadge = '<span class="video-platform-badge badge-facebook"><i class="fab fa-facebook"></i> Facebook</span>';
            }
            
            var fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect width="800" height="450" fill="%231e293b"/%3E%3Ctext x="400" y="225" text-anchor="middle" dominant-baseline="middle" fill="%2338bdf8" font-family="Arial" font-size="24"%3E' + (data.videoInfo.platform === 'youtube' ? '▶️ YouTube' : '📱 Facebook') + '%3C/text%3E%3C/svg%3E';
            var thumbnailSrc = data.thumbnailUrl || fallbackSvg;
            
            videoCard.innerHTML = '<div class="video-thumbnail-wrapper"><img src="' + thumbnailSrc + '" alt="' + data.safeName + '" loading="lazy" onerror="this.onerror=null; this.src=\'' + fallbackSvg + '\'"><div class="video-play-icon"><i class="fas fa-play"></i></div></div><div class="video-card-info"><h3>' + data.safeName + '</h3><p>' + data.safeDescription + '</p>' + platformBadge + '</div>';
            
            // Store data for modal
            videoCard.dataset.videoName = data.safeName;
            videoCard.dataset.videoDescription = data.safeDescription;
            videoCard.dataset.embedUrl = data.embedUrl;
            videoCard.dataset.platform = data.videoInfo.platform;
            videoCard.dataset.videoId = data.videoInfo.videoId;
            
            videoCard.addEventListener('click', function() {
                openVideoModal(
                    this.dataset.embedUrl,
                    this.dataset.videoName,
                    this.dataset.videoDescription,
                    this.dataset.platform
                );
            });
            
            fragment.appendChild(videoCard);
        } catch (err) {
            console.error('Error creating video card:', err);
        }
    }
    
    videoGrid.appendChild(fragment);
    console.log('Successfully displayed ' + validVideos + ' videos');
}

// ============================================================
// VIDEO MODAL FUNCTIONS
// ============================================================
function openVideoModal(embedUrl, title, description, platform) {
    var modal = document.getElementById('videoModal');
    var wrapper = document.getElementById('videoWrapper');
    var titleEl = document.getElementById('videoModalTitle');
    var descEl = document.getElementById('videoModalDescription');
    
    if (!modal || !wrapper) {
        console.error('Modal elements not found');
        return;
    }
    
    try {
        titleEl.textContent = title || 'Video';
        descEl.textContent = description || 'No description available';
        
        wrapper.innerHTML = '';
        
        var iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; unload';
        iframe.allowFullscreen = true;
        iframe.frameborder = '0';
        iframe.scrolling = 'no';
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
        
        wrapper.style.cssText = 'position:relative;padding-top:56.25%;';
        wrapper.appendChild(iframe);
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('Playing video: ' + title);
    } catch (err) {
        console.error('Error opening video modal:', err);
    }
}

function closeVideoModal() {
    var modal = document.getElementById('videoModal');
    var wrapper = document.getElementById('videoWrapper');
    
    if (!modal) return;
    
    try {
        if (wrapper) {
            wrapper.innerHTML = '';
            wrapper.style.cssText = '';
        }
        
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    } catch (err) {
        console.error('Error closing video modal:', err);
    }
}

// ============================================================
// INITIALIZE VIDEO GALLERY
// ============================================================
async function initVideoGallery() {
    console.log('Initializing video gallery...');
    
    var videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) {
        console.error('Video grid not found');
        return;
    }
    
    try {
        var videos = await fetchVideosFromSupabase();
        
        if (!videos) {
            videoGrid.innerHTML = '<div class="video-no-results"><i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 10px; color: #f87171;"></i><p>Failed to load videos. Please try again.</p><button onclick="location.reload()" style="margin-top: 10px; padding: 8px 20px; background: #38bdf8; border: none; border-radius: 20px; color: #0f172a; font-weight: 600; cursor: pointer;"><i class="fas fa-sync-alt"></i> Retry</button></div>';
            return;
        }
        
        createVideoCards(videos);
        
    } catch (err) {
        console.error('Error initializing video gallery:', err);
        videoGrid.innerHTML = '<div class="video-no-results"><i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 10px; color: #f87171;"></i><p>Error loading videos. Please try again.</p><button onclick="location.reload()" style="margin-top: 10px; padding: 8px 20px; background: #38bdf8; border: none; border-radius: 20px; color: #0f172a; font-weight: 600; cursor: pointer;"><i class="fas fa-sync-alt"></i> Retry</button></div>';
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    try {
        var closeBtn = document.getElementById('videoModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeVideoModal);
        }
        
        var modal = document.getElementById('videoModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeVideoModal();
                }
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var modal = document.getElementById('videoModal');
                if (modal && modal.classList.contains('active')) {
                    closeVideoModal();
                }
            }
        });
        
        // Initialize after a short delay
        setTimeout(initVideoGallery, 500);
        
        console.log('Video Gallery Script Loaded Successfully');
    } catch (err) {
        console.error('Error setting up video gallery:', err);
    }
});

// Expose refresh function
window.refreshVideoGallery = function() {
    var videoGrid = document.getElementById('videoGrid');
    if (videoGrid) {
        videoGrid.innerHTML = '<div class="video-loader"><div class="spinner"></div><p>Refreshing videos...</p></div>';
        initVideoGallery();
    }
};