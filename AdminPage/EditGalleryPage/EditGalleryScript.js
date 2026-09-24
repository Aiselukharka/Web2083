if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

// -------------------- PROTECTION FROM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
    if (error || !session) {
      showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("../LoginPage/LogInIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// -------------------- NAVIGATE PAGES --------------------
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
    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

// -------------------- NAVIGATE ADMIN EDITS --------------------
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
        "ClassEditBox": "../EditClassPageEditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };   
    const selectedEdit = pageMap[this.value];
    if (selectedEdit) {
        window.location.href = selectedEdit;
    }
});

// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

  //----------------------- Script for Admin Tools Dropdown -----------------------
document.getElementById("AdminToolsSelect").addEventListener("change", async function () {
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

// Dynamically show logo and favicon
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single();

        if (error) {
            console.error("Supabase query error loading branding:", error.message);
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
            
            console.log("Logo and Favicon synced dynamically via supabaseClient!");
        }
    } catch (error) {
        console.error("Unexpected error setting up branding layout:", error);
    }
}
document.addEventListener('DOMContentLoaded', loadDynamicLogoAndFavicon);

// -------------------- IMAGE UPLOAD SYSTEM --------------------
class ImageUploader {
    constructor() {
        this.selectedFiles = [];
        this.isUploading = false;
        
        // DOM Elements
        this.imageInput = document.getElementById('imageInput');
        this.descriptionInput = document.getElementById('imageDescriptionInput');
        this.dropArea = document.getElementById('dropArea');
        this.previewGrid = document.getElementById('PreviewGrid');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.uploadProgress = document.getElementById('UploadProgress');
        this.progressFill = document.getElementById('ProgressFill');
        this.progressText = document.getElementById('ProgressText');
        this.uploadStatus = document.getElementById('UploadStatus');
        
        // Initialize
        this.init();
    }
    
    init() {
        // Event Listeners
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
    
    handleDragOver(e) {
        e.preventDefault();
        this.dropArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.dropArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.dropArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }
    
    addFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showStatus('No valid image files found. Please select a JPG, PNG, GIF, or WebP image.', 'error');
            return;
        }
        
        const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            this.showStatus(`File exceeds 5MB limit. Please resize it first.`, 'error');
            return;
        }
        
        // Processing one file to guarantee precise image-description matching
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
            img.style.maxWidth = "200px";
            img.style.display = "block";
            
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
        
        if (this.selectedFiles.length === 0) {
            this.uploadBtn.disabled = true;
        }
        
        const previewItems = this.previewGrid.querySelectorAll('.preview-item img');
        previewItems.forEach(img => {
            URL.revokeObjectURL(img.src);
        });
    }
    
    clearAll() {
        if (this.selectedFiles.length === 0 && this.descriptionInput.value === "") return;
        
        showCustomDialog2(
            'Confirm Clear',
            'Remove selected image and clear data?',
            'Yes',
            'Cancel',
            () => {
                this.selectedFiles = [];
                this.descriptionInput.value = '';
                this.updatePreview();
                this.uploadBtn.disabled = true;
                this.clearStatus();
                this.hideProgress();
                
                const previewItems = this.previewGrid.querySelectorAll('.preview-item img');
                previewItems.forEach(img => {
                    URL.revokeObjectURL(img.src);
                });
            },
            () => {}
        );
    }
    
    async uploadFiles() {
        if (this.selectedFiles.length === 0 || this.isUploading) return;
        
        const descriptionValue = this.descriptionInput.value.trim();
        if (!descriptionValue) {
            this.showStatus('❌ Please provide an image description before uploading.', 'error');
            return;
        }
        
        this.isUploading = true;
        this.uploadBtn.disabled = true;
        this.uploadBtn.textContent = 'Uploading...';
        this.showProgress();
        this.clearStatus();
        
        const file = this.selectedFiles[0];
        
        try {
            // Step 1: Uploading the file to PostImages Edge/Cloud function
            const result = await this.uploadSingleFile(file);
            
            if (result.success) {
                // Step 2: Saving properties to Supabase table
                const { error: supabaseError } = await supabaseClient
                    .from('GalleryImageLinkTable')
                    .insert([
                        { 
                            ImageDescription: descriptionValue, 
                            ImageUrl: result.url 
                        }
                    ]);
                
                if (supabaseError) {
                    throw new Error(`Failed to save to Database: ${supabaseError.message}`);
                }
                
                this.showStatus(`✅ Successfully uploaded & added to Database!`, 'success');
                this.selectedFiles = [];
                this.descriptionInput.value = '';
                this.updatePreview();
            } else {
                this.showStatus(`❌ PostImages upload failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showStatus(`❌ Error processing request: ${error.message}`, 'error');
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
                headers: {
                    'Authorization': `Bearer ${_supabaseKey}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            const data = await response.json();
            return {
                success: true,
                url: data.url
            };
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    showProgress() {
        this.uploadProgress.style.display = 'block';
        this.progressFill.style.width = '50%';
        this.progressText.textContent = 'Uploading to PostImages...';
    }
    
    hideProgress() {
        this.progressFill.style.width = '100%';
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
        }, 500);
    }
    
    showStatus(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        
        const icon = document.createElement('span');
        icon.className = 'status-icon';
        
        switch(type) {
            case 'success':
                icon.textContent = '✅ ';
                break;
            case 'error':
                icon.textContent = '❌ ';
                break;
            default:
                icon.textContent = 'ℹ️ ';
        }
        
        const text = document.createElement('span');
        text.textContent = message;
        
        statusDiv.appendChild(icon);
        statusDiv.appendChild(text);
        this.uploadStatus.appendChild(statusDiv);
        statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    clearStatus() {
        this.uploadStatus.innerHTML = '';
    }
}

// Initialize uploader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('UploadSection')) {
        const uploader = new ImageUploader();
        console.log('Image uploader initialized');
    }
});

// -------------------- MANAGE POSTIMAGES GALLERY --------------------
function openPostImagesGallery() {
    window.open('https://postimg.cc/gallery/YLsjRbC', '_blank');
    
    showCustomDialog1(
        'Gallery Management',
        '✅ Your PostImages gallery is opening in a new tab.\n\nFrom there, you can:\n• View all uploaded images\n• Delete images you no longer need\n• Organize your gallery\n\nNote: Deleting images from PostImages will remove them from your website gallery.',
        'OK',
        function() {}
    );
}

// Optional: Add a help button to explain the deletion process
function showDeleteHelp() {
    showCustomDialog1(
        'How to Delete Images from PostImages',
        '1. Click "Open PostImages Gallery"\n' +
        '2. Find the image you want to delete\n' +
        '3. Click on the image to open it\n' +
        '4. Look for the "Delete" or "Remove" option\n' +
        '5. Confirm deletion\n\n' +
        '⚠️ Deleted images will be removed from your website gallery.',
        'Got it',
        function() {}
    );
}