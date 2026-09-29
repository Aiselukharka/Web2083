if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
const CLOUD_NAME = "dcdwpdnyp";

// ============================================================================
// AUTH
// ============================================================================
protectAdminPage();
async function protectAdminPage() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("../LoginPage/LogInIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// ============================================================================
// NAVIGATION
// ============================================================================
const PageNavigationDropDown = document.getElementById("PageNavigationSelect");
PageNavigationDropDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "../LoginPage/LogInIndex.html",
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
    const p = pageMap[this.value];
    if (p) window.location.href = p;
});

const EditNavigationDropDown = document.getElementById("EditNavigationSelect");
EditNavigationDropDown.addEventListener("change", function () {
    const pageMap = {
        "AttendanceCardEditBox": "../EditAttendanceCardPage/EditAttendanceCardIndex.html",
        "IDCardEditBox": "../EditIDCardPage/EditIDCardIndex.html",
        "ResultEditBox": "../EditResultPage/EditResultIndex.html",
        "RoutineEditBox": "../EditRoutinePage/EditRoutineIndex.html",
        "StudentAttendanceEditBox": "../EditStudentAttendancePage/EditStudentAttendanceIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };
    const p = pageMap[this.value];
    if (p) window.location.href = p;
});

// ============================================================================
// DATE BAR
// ============================================================================
document.getElementById('DateBox').innerText =
    AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

// ============================================================================
// ADMIN TOOLS
// ============================================================================
document.getElementById("AdminToolsSelect").addEventListener("change", async function () {
    switch (this.value) {
        case "ChangePasswordTool":
            window.location.href = "../ChangePasswordPage/ChangePasswordIndex.html"; break;
        case "LogoutThisDeviceTool":
            showCustomDialog2("Confirm Logout", "Logout from this device?", "Yes", "Cancel",
                async function () {
                    await supabaseClient.auth.signOut({ scope: "local" });
                    window.location.replace("../LoginPage/LogInIndex.html");
                }, function () {});
            break;
        case "LogoutAllDevicesTool":
            const c = showCustomDialog2("Confirm Logout", "Logout from all devices?", "Yes", "Cancel", function(){}, function(){});
            if (c === "Yes") {
                await supabaseClient.auth.signOut({ scope: "global" });
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html"; break;
    }
    this.selectedIndex = 0;
});

// ============================================================================
// LOGO / FAVICON
// ============================================================================
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable').select('Value').eq('Name', 'SchoolLogo').single();
        if (error) { console.error("Branding error:", error.message); return; }
        if (data && data.Value) {
            const fav = document.getElementById('dynamicFavicon');
            if (fav) fav.href = data.Value;
            const img = document.querySelector('#LogoBox img');
            if (img) img.src = data.Value;
        }
    } catch (e) { console.error(e); }
}
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// ============================================================================
// HELPERS
// ============================================================================
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
}
function escapeAttr(s) {
    return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
function safeFileName(name) {
    return String(name || 'gallery-image')
        .replace(/[^\w\-. ]+/g, '_')
        .slice(0, 80);
}

// ============================================================================
// IMAGE UPLOADER
// ============================================================================
class ImageUploader {
    constructor() {
        this.selectedFiles = [];
        this.isUploading = false;

        this.imageInput      = document.getElementById('imageInput');
        this.descriptionInput= document.getElementById('imageDescriptionInput');
        this.dropArea        = document.getElementById('dropArea');
        this.previewGrid     = document.getElementById('PreviewGrid');
        this.uploadBtn       = document.getElementById('uploadBtn');
        this.clearBtn        = document.getElementById('clearBtn');
        this.uploadProgress  = document.getElementById('UploadProgress');
        this.progressFill    = document.getElementById('ProgressFill');
        this.progressText    = document.getElementById('ProgressText');
        this.uploadStatus    = document.getElementById('UploadStatus');

        this.init();
    }

    init() {
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.dropArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadBtn.addEventListener('click', () => this.uploadFiles());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
        this.imageInput.value = '';
    }
    handleDragOver(e) { e.preventDefault(); this.dropArea.classList.add('dragover'); }
    handleDragLeave(e){ e.preventDefault(); this.dropArea.classList.remove('dragover'); }
    handleDrop(e) {
        e.preventDefault();
        this.dropArea.classList.remove('dragover');
        this.addFiles(Array.from(e.dataTransfer.files));
    }

    addFiles(files) {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            this.showStatus('No valid image files found. Please select a JPG, PNG, GIF, or WebP.', 'error');
            return;
        }
        const oversized = imageFiles.filter(f => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            this.showStatus('File exceeds 5MB limit. Please resize it first.', 'error');
            return;
        }
        this.selectedFiles = [imageFiles[0]];
        this.updatePreview();
        this.uploadBtn.disabled = false;
        this.clearStatus();
    }

    updatePreview() {
        this.previewGrid.innerHTML = '';
        this.selectedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'preview-item';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Remove image';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(index);
            });

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;

            item.appendChild(img);
            item.appendChild(removeBtn);
            item.appendChild(fileName);
            this.previewGrid.appendChild(item);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updatePreview();
        if (this.selectedFiles.length === 0) this.uploadBtn.disabled = true;
        this.previewGrid.querySelectorAll('img').forEach(img => URL.revokeObjectURL(img.src));
    }

    clearAll() {
        if (this.selectedFiles.length === 0 && this.descriptionInput.value === "") return;
        showCustomDialog2(
            'Confirm Clear',
            'Remove selected image and clear data?',
            'Yes', 'Cancel',
            () => {
                this.selectedFiles = [];
                this.descriptionInput.value = '';
                this.updatePreview();
                this.uploadBtn.disabled = true;
                this.clearStatus();
                this.hideProgress();
                this.previewGrid.querySelectorAll('img').forEach(img => URL.revokeObjectURL(img.src));
            },
            () => {}
        );
    }

    async uploadFiles() {
        if (this.selectedFiles.length === 0 || this.isUploading) return;

        const descriptionValue = this.descriptionInput.value.trim();
        if (!descriptionValue) {
            this.showStatus('Please provide an image description before uploading.', 'error');
            return;
        }

        this.isUploading = true;
        this.uploadBtn.disabled = true;
        this.uploadBtn.textContent = 'Uploading…';
        this.showProgress();
        this.clearStatus();

        const file = this.selectedFiles[0];
        try {
            const result = await this.uploadSingleFile(file);
            if (!result.success) {
                this.showStatus('PostImages upload failed: ' + result.error, 'error');
                return;
            }

            const { error: supabaseError } = await supabaseClient
                .from('GalleryImageLinkTable')
                .insert([{ ImageDescription: descriptionValue, ImageUrl: result.url }]);
            if (supabaseError) throw new Error('Failed to save to database: ' + supabaseError.message);

            this.showStatus('✅ Image uploaded and saved to the gallery.', 'success');
            this.selectedFiles = [];
            this.descriptionInput.value = '';
            this.updatePreview();

            loadGalleryItems();
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
        } finally {
            this.isUploading = false;
            this.uploadBtn.textContent = 'Upload Image';
            this.uploadBtn.disabled = this.selectedFiles.length === 0;
            this.hideProgress();
        }
    }

    async uploadSingleFile(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const extension = file.name.split('.').pop();
            const filename = `gallery/${timestamp}_${randomStr}.${extension}`;
            formData.append('filename', filename);

            const response = await fetch(`${_supabaseUrl}/functions/v1/upload-postimage`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${_supabaseKey}` },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Upload failed');
            }
            const data = await response.json();
            return { success: true, url: data.url };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, error: error.message };
        }
    }

    showProgress() {
        this.uploadProgress.style.display = 'block';
        this.progressFill.style.width = '50%';
        this.progressText.textContent = 'Uploading to PostImages…';
    }
    hideProgress() {
        this.progressFill.style.width = '100%';
        setTimeout(() => { this.uploadProgress.style.display = 'none'; }, 500);
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        const icon = document.createElement('span');
        icon.className = 'status-icon';
        icon.textContent = type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ ';
        const text = document.createElement('span');
        text.textContent = message;
        statusDiv.appendChild(icon);
        statusDiv.appendChild(text);
        this.uploadStatus.appendChild(statusDiv);
        statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    clearStatus() { this.uploadStatus.innerHTML = ''; }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('UploadSection')) new ImageUploader();
});

// ============================================================================
// GALLERY ITEMS LIST
// ============================================================================
async function loadGalleryItems() {
    const grid = document.getElementById('GalleryItemsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="GalleryEmpty">Loading gallery items…</div>';

    try {
        const { data, error } = await supabaseClient
            .from('GalleryImageLinkTable')
            .select('id, ImageDescription, ImageUrl, created_at')
            .order('id', { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = '<div class="GalleryEmpty">No gallery images yet. Upload one above to get started.</div>';
            return;
        }

        let html = '';
        data.forEach(item => {
            const id   = item.id;
            const desc = item.ImageDescription || '';
            const url  = item.ImageUrl || '';
            if (!url) return;

            html += `
                <div class="GalleryItem">
                    <div class="GalleryItemThumb">
                        <img src="${escapeHtml(url)}" alt="${escapeHtml(desc)}" loading="lazy" />
                    </div>
                    <div class="GalleryItemBody">
                        <div class="GalleryItemDesc" title="${escapeHtml(desc)}">${escapeHtml(desc || '(no description)')}</div>
                    </div>
                    <div class="GalleryItemActions">
                        <button class="GalleryIconBtn ViewBtn"
                                title="View"
                                onclick="showPictureViewer('${escapeAttr(url)}', '${escapeAttr(desc)}')">👁️</button>
                        <button class="GalleryIconBtn EditBtn"
                                title="Edit description"
                                onclick="openGalleryEditor(${id}, '${escapeAttr(desc)}')">✏️</button>
                        <button class="GalleryIconBtn DownBtn"
                                title="Download"
                                onclick="downloadGalleryItem(this, '${escapeAttr(url)}', '${escapeAttr(desc)}')">⬇️</button>
                    </div>
                </div>`;
        });
        grid.innerHTML = html;
    } catch (e) {
        console.error('Gallery items load error:', e.message);
        grid.innerHTML = `<div class="GalleryEmpty">Failed to load gallery items: ${escapeHtml(e.message)}</div>`;
    }
}
window.loadGalleryItems = loadGalleryItems;
document.addEventListener('DOMContentLoaded', loadGalleryItems);

// ============================================================================
// EDIT DESCRIPTION MODAL
// ============================================================================
let galleryEditorCurrentId = null;

function openGalleryEditor(id, currentDescription) {
    const modal  = document.getElementById('GalleryEditModal');
    const input  = document.getElementById('GalleryEditInput');
    const status = document.getElementById('GalleryEditStatus');
    const saveBtn= document.getElementById('GalleryEditSaveBtn');

    galleryEditorCurrentId = id;
    input.value = currentDescription || '';
    status.textContent = '';

    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Save';
    saveBtn.onclick = () => saveGalleryEditor();

    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 50);
}
window.openGalleryEditor = openGalleryEditor;

function closeGalleryEditor() {
    const modal = document.getElementById('GalleryEditModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.getElementById('GalleryEditInput').value = '';
    document.getElementById('GalleryEditStatus').textContent = '';
    galleryEditorCurrentId = null;
}
window.closeGalleryEditor = closeGalleryEditor;

async function saveGalleryEditor() {
    const id     = galleryEditorCurrentId;
    const input  = document.getElementById('GalleryEditInput');
    const status = document.getElementById('GalleryEditStatus');
    const saveBtn= document.getElementById('GalleryEditSaveBtn');

    if (id === null || id === undefined) return;

    const newDesc = (input.value || '').trim();
    if (!newDesc) {
        status.textContent = 'Description cannot be empty.';
        status.style.color = '#c62828';
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    status.textContent = '';

    try {
        const { error } = await supabaseClient
            .from('GalleryImageLinkTable')
            .update({ ImageDescription: newDesc })
            .eq('id', id);
        if (error) throw error;

        status.textContent = '✅ Saved.';
        status.style.color = '#2e7d32';

        await loadGalleryItems();
        setTimeout(() => { closeGalleryEditor(); }, 500);
    } catch (e) {
        console.error('Save description error:', e.message);
        status.textContent = 'Save failed: ' + e.message;
        status.style.color = '#c62828';
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save';
    }
}
window.saveGalleryEditor = saveGalleryEditor;

// ============================================================================
// MODAL CLOSE HANDLERS (outside click + Escape)
// ============================================================================
document.addEventListener('click', (e) => {
    const editModal = document.getElementById('GalleryEditModal');
    if (editModal && editModal.style.display === 'flex' && e.target === editModal) closeGalleryEditor();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGalleryEditor();
});

// ============================================================================
// DOWNLOAD
// ============================================================================
async function downloadGalleryItem(btn, url, description) {
    const originalText = btn.textContent;
    try {
        btn.disabled = true;
        btn.textContent = '…';

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();

        let ext = 'jpg';
        try {
            const urlPath = new URL(url).pathname;
            const m = urlPath.match(/\.([a-zA-Z0-9]{2,5})$/);
            if (m) ext = m[1].toLowerCase();
        } catch (_) {}
        if (blob.type && blob.type.startsWith('image/')) {
            const sub = blob.type.split('/')[1].split('+')[0];
            if (sub) ext = sub === 'jpeg' ? 'jpg' : sub;
        }

        const base = safeFileName(description || 'gallery-image');
        const fileName = base.toLowerCase().endsWith('.' + ext) ? base : `${base}.${ext}`;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
    } catch (e) {
        console.error('Download error:', e.message);
        alert('Download failed: ' + e.message);
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = originalText;
        }, 800);
    }
}
window.downloadGalleryItem = downloadGalleryItem;

// ============================================================================
// MANAGE ON POSTIMAGES
// ============================================================================
function openPostImagesGallery() {
    window.open('https://postimg.cc/gallery/YLsjRbC', '_blank');
    showCustomDialog1(
        'Gallery Management',
        '✅ Your PostImages gallery is opening in a new tab.\n\n' +
        'From there, you can view, organize, and delete images. Deleting an image ' +
        'there will remove it from the public Gallery page.\n\n' +
        'Note: the Gallery Items list on this page still shows the entry until you ' +
        'delete the corresponding row from the GalleryImageLinkTable in Supabase.',
        'OK',
        function() {}
    );
}
window.openPostImagesGallery = openPostImagesGallery;