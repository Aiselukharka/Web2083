// ============================================================================
// SUPABASE / GUARDS
// ============================================================================
if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}

// -------------------- PROTECT FROM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        showCustomDialog1("Unauthorized", "Please login first.", "OK", function () {});
        window.location.replace("LoginIndex.html");
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
    const selectedPage = pageMap[this.value];
    if (selectedPage) window.location.href = selectedPage;
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
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };
    const selectedEdit = pageMap[this.value];
    if (selectedEdit) window.location.href = selectedEdit;
});

// ============================================================================
// DATE
// ============================================================================
const dateBox = document.getElementById('DateBox');
dateBox.innerText = AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

// ============================================================================
// ADMIN TOOLS
// ============================================================================
document.getElementById("AdminToolsSelect").addEventListener("change", async function () {
    switch (this.value) {
        case "ChangePasswordTool":
            window.location.href = "../ChangePasswordPage/ChangePasswordIndex.html";
            break;
        case "LogoutThisDeviceTool":
            showCustomDialog2("Confirm Logout", "Logout from this device?", "Yes", "Cancel",
                async function () {
                    await supabaseClient.auth.signOut({ scope: "local" });
                    window.location.replace("../LoginPage/LogInIndex.html");
                }, function () {});
            break;
        case "LogoutAllDevicesTool": {
            const confirmResult = showCustomDialog2(
                "Confirm Logout",
                "Logout from all devices?",
                "Yes",
                "Cancel",
                function () {},
                function () {}
            );
            if (confirmResult === "Yes") {
                await supabaseClient.auth.signOut({ scope: "global" });
                window.location.replace("../LoginPage/LogInIndex.html");
            }
            break;
        }
        case "AddAdminTool":
            window.location.href = "../AddAdminPage/AddAdminIndex.html";
            break;
    }
    this.selectedIndex = 0;
});

// ============================================================================
// HUMAN RESOURCE CACHE
// ============================================================================
let HUMAN_RESOURCE_LIST = [];   // [{ Name, Contact, Email, PhotoUrl }]

async function loadHumanResourceList() {
    try {
        const { data, error } = await supabaseClient
            .from('HumanResourceTable')
            .select('Name, Contact, Email, PhotoUrl');

        if (error) {
            console.error('Error loading HumanResourceTable:', error.message);
            return;
        }
        HUMAN_RESOURCE_LIST = (data || []).filter(r => r.Name);
        console.log(`Loaded ${HUMAN_RESOURCE_LIST.length} Human Resource entries.`);
    } catch (err) {
        console.error('Unexpected error loading HumanResourceTable:', err);
    }
}

function buildHumanResourceOptions(selectedName) {
    const opts = [`<option value="">— Select from Human Resource —</option>`];
    HUMAN_RESOURCE_LIST.forEach(person => {
        const sel = (selectedName && person.Name === selectedName) ? 'selected' : '';
        opts.push(`<option value="${escapeHtml(person.Name)}" ${sel}>${escapeHtml(person.Name)}</option>`);
    });
    return opts.join('');
}

// ============================================================================
// CROPPER MODAL LOGIC
// ============================================================================
const CropperModal  = document.getElementById('CropperModal');
const CropperImage  = document.getElementById('CropperImage');
const btnCancelCrop = document.getElementById('btnCancelCrop');
const btnApplyCrop  = document.getElementById('btnApplyCrop');

let activeCropper   = null;
let activeFileInput = null;

function openCropper(file, ratio, fileInput, config) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            CropperImage.src = e.target.result;
            CropperModal.classList.add('active');

            if (activeCropper) { activeCropper.destroy(); activeCropper = null; }

            activeCropper = new Cropper(CropperImage, {
                aspectRatio: ratio,
                viewMode: 2,
                autoCropArea: 0.9,
                movable: true,
                zoomable: true,
                rotatable: false,
                scalable: false,
                responsive: true,
                background: true,
                cropBoxResizable: true,
                checkOrientation: false,
                highlight: false,
                guides: true,
                center: true,
                toggleDragModeOnDblclick: false
            });

            activeFileInput = fileInput;

            btnApplyCrop.onclick = () => {
                if (!activeCropper) return;
                const canvas = activeCropper.getCroppedCanvas({
                    width: config.width,
                    height: config.height,
                    imageSmoothingQuality: 'high'
                });
                if (!canvas) { reject(new Error('Crop failed')); closeCropper(); return; }

                canvas.toBlob((blob) => {
                    if (!blob) { reject(new Error('Blob generation failed')); closeCropper(); return; }

                    const croppedFileName = (fileInput.files && fileInput.files[0] && fileInput.files[0].name)
                        || config.defaultFileName
                        || 'cropped.jpg';

                    const dt = new DataTransfer();
                    dt.items.add(new File([blob], croppedFileName, { type: blob.type || 'image/jpeg' }));
                    fileInput.files = dt.files;

                    resolve(blob);
                    closeCropper();
                }, 'image/jpeg', 0.92);
            };

            btnCancelCrop.onclick = () => {
                fileInput.value = '';
                reject(new Error('Cancelled'));
                closeCropper();
            };
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function closeCropper() {
    CropperModal.classList.remove('active');
    if (activeCropper) { activeCropper.destroy(); activeCropper = null; }
    activeFileInput = null;
}

// ============================================================================
// IMAGE RULES
// ============================================================================
const IMAGE_RULES = {
    logo:   { ratio: 1,      width: 100,  height: 100, cssClass: 'ratio-1-1'  },
    person: { ratio: 3 / 4,  width: 300,  height: 400, cssClass: 'ratio-3-4'  },
    slider: { ratio: 16 / 9, width: 1280, height: 720, cssClass: 'ratio-16-9' }
};

// ============================================================================
// DYNAMIC GROUPS
// ============================================================================
const contactsBox = document.getElementById('AboutUsImportantContactBox');
const socialBox   = document.getElementById('AboutUsSocialMediaBox');
const sliderBox   = document.getElementById('AboutUsSliderBox');

let contactCounter = 0;
let socialCounter  = 0;
let sliderCounter  = 0;

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ---------- CONTACT ----------
function addContactGroup(roleName = '', data = {}) {
    contactCounter++;
    const uid = `contact_${contactCounter}_${Date.now()}`;
    const role = roleName || `Contact ${contactCounter}`;
    const fileName = data.fileName || 'No file chosen';

    const wrapper = document.createElement('div');
    wrapper.className = 'ImportantContactBoxes';
    wrapper.dataset.role = role;
    wrapper.dataset.uid = uid;

    wrapper.innerHTML = `
        <button type="button" class="btnRemoveGroup" title="Remove this contact">✕ Remove</button>

        <div class="ImportantContactFirstBoxes">
            <label>Role / Name:</label>
            <input type="text" class="RoleInput" value="${escapeHtml(role)}" placeholder="e.g. Principal" />
        </div>

        <div class="ImportantContactHRBox">
            <label>Select from Human Resource:</label>
            <select class="HRSelect">
                ${buildHumanResourceOptions(data.hrName || '')}
            </select>
        </div>

        <div class="ImportantContactFirstBoxes">
            <label>Full Name:</label>
            <input type="text" class="NameInput" value="${escapeHtml(data.name || '')}" placeholder="Enter Name" />
        </div>
        <div class="ImportantContactSecondBoxes">
            <label>Contact:</label>
            <input type="text" class="ContactInput" value="${escapeHtml(data.contact || '')}" placeholder="Enter Contact" />
        </div>
        <div class="ImportantContactThirdBoxes">
            <label>Email:</label>
            <input type="text" class="EmailInput" value="${escapeHtml(data.email || '')}" placeholder="Enter Email" />
        </div>
        <div class="ImportantContactFourthBoxes">
            <label>Photo:</label>
            <input type="file" class="PhotoInput" accept=".jpg, .jpeg, .png, .webp, .gif" />
            <button type="button" class="btnChoosePhoto">Choose Photo</button>
            <div class="PhotoName" title="${escapeHtml(fileName)}">${escapeHtml(fileName)}</div>
        </div>
        <div class="PreviewWrapper ${IMAGE_RULES.person.cssClass}">
            <img class="ImagePreview" alt="Preview" ${data.value ? `src="${data.value}" data-existing="1"` : ''} />
        </div>
    `;

    const fileInput    = wrapper.querySelector('.PhotoInput');
    const previewEl    = wrapper.querySelector('.ImagePreview');
    const nameEl       = wrapper.querySelector('.PhotoName');
    const hrSelect     = wrapper.querySelector('.HRSelect');
    const nameInput    = wrapper.querySelector('.NameInput');
    const contactInput = wrapper.querySelector('.ContactInput');
    const emailInput   = wrapper.querySelector('.EmailInput');

    if (data.value) previewEl.classList.add('active');

    // --- Choose photo button (cropper IS shown here) ---
    wrapper.querySelector('.btnChoosePhoto').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async function () {
        if (!fileInput.files.length) return;
        try {
            await handleCroppedFile(
                fileInput.files[0],
                IMAGE_RULES.person.ratio,
                fileInput,
                previewEl,
                nameEl,
                IMAGE_RULES.person.width,
                IMAGE_RULES.person.height
            );
        } catch (err) { console.log('Cropper cancelled:', err.message); }
    });

    // --- Human Resource picker (NO cropper — use photo as-is) ---
    hrSelect.addEventListener('change', async function () {
        const selectedName = this.value;
        if (!selectedName) return;

        const person = HUMAN_RESOURCE_LIST.find(p => p.Name === selectedName);
        if (!person) return;

        // Fill text fields
        nameInput.value    = person.Name    || '';
        contactInput.value = person.Contact || '';
        emailInput.value   = person.Email   || '';

        // Fetch the HR photo and place it directly into the file input (no cropper)
        if (person.PhotoUrl) {
            const ok = await applyPhotoDirectly(
                person.PhotoUrl,
                fileInput,
                previewEl,
                nameEl,
                `${person.Name.replace(/\s+/g, '_')}_photo.jpg`
            );
            if (!ok) {
                // Fallback: at least show the remote preview (file input remains empty)
                previewEl.src = person.PhotoUrl;
                previewEl.classList.add('active');
                nameEl.textContent = person.PhotoUrl.split('/').pop() || 'remote photo';
                nameEl.title = nameEl.textContent;
            }
        } else {
            // No photo in HR — clear the preview & file input
            fileInput.value = '';
            previewEl.classList.remove('active');
            previewEl.removeAttribute('src');
            nameEl.textContent = 'No file chosen';
            nameEl.title = 'No file chosen';
        }
    });

    // --- Remove ---
    wrapper.querySelector('.btnRemoveGroup').addEventListener('click', () => {
        if (confirm('Remove this contact?')) wrapper.remove();
    });

    contactsBox.appendChild(wrapper);
}

// ---------- SOCIAL MEDIA ----------
function addSocialGroup(platform = '', url = '') {
    socialCounter++;
    const wrapper = document.createElement('div');
    wrapper.className = 'SocialMediaBoxes';

    wrapper.innerHTML = `
        <button type="button" class="btnRemoveGroup" title="Remove">✕ Remove</button>
        <label>Platform:</label>
        <input type="text" class="PlatformInput" value="${escapeHtml(platform)}" placeholder="e.g. Facebook" />
        <label>URL:</label>
        <input type="text" class="UrlInput" value="${escapeHtml(url)}" placeholder="https://..." />
    `;

    wrapper.querySelector('.btnRemoveGroup').addEventListener('click', () => {
        if (confirm('Remove this social media link?')) wrapper.remove();
    });

    socialBox.appendChild(wrapper);
}

// ---------- SLIDER ----------
function addSliderGroup(data = {}) {
    sliderCounter++;
    const uid = `slider_${sliderCounter}_${Date.now()}`;
    const fileName = data.fileName || 'No file chosen';

    const wrapper = document.createElement('div');
    wrapper.className = 'SliderPictureSelectBoxes';
    wrapper.dataset.uid = uid;

    wrapper.innerHTML = `
        <button type="button" class="btnRemoveGroup" title="Remove">✕ Remove</button>
        <div class="InnerBoxes">
            <label>Select Slider Picture:</label>
            <input type="file" class="SliderFileInput" accept=".jpg, .jpeg, .png, .webp, .gif" />
            <button type="button" class="btnChooseSlider">Choose File</button>
            <div class="SliderName" title="${escapeHtml(fileName)}">${escapeHtml(fileName)}</div>
        </div>
        <div class="SliderCredentialBoxes">
            <label>Write Credential:</label>
            <input type="text" class="SliderCredentialInput" value="${escapeHtml(data.credential || '')}" />
        </div>
        <div class="PreviewWrapper ${IMAGE_RULES.slider.cssClass}">
            <img class="ImagePreview" alt="Preview" ${data.value ? `src="${data.value}" data-existing="1"` : ''} />
        </div>
    `;

    const fileInput = wrapper.querySelector('.SliderFileInput');
    const previewEl = wrapper.querySelector('.ImagePreview');
    const nameEl    = wrapper.querySelector('.SliderName');
    if (data.value) previewEl.classList.add('active');

    wrapper.querySelector('.btnChooseSlider').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async function () {
        if (!fileInput.files.length) return;
        try {
            await handleCroppedFile(
                fileInput.files[0],
                IMAGE_RULES.slider.ratio,
                fileInput,
                previewEl,
                nameEl,
                IMAGE_RULES.slider.width,
                IMAGE_RULES.slider.height
            );
        } catch (err) { console.log('Cropper cancelled:', err.message); }
    });

    wrapper.querySelector('.btnRemoveGroup').addEventListener('click', () => {
        if (confirm('Remove this slider?')) wrapper.remove();
    });

    sliderBox.appendChild(wrapper);
}

// ============================================================================
// HELPERS
// ============================================================================

// From a File object (user chose a file) — USES CROPPER
async function handleCroppedFile(file, ratio, fileInput, previewEl, nameEl, outW, outH) {
    const originalName = file.name;
    try {
        await openCropper(file, ratio, fileInput, { width: outW, height: outH });
        const croppedFile = fileInput.files[0];
        if (croppedFile) {
            previewEl.src = URL.createObjectURL(croppedFile);
            previewEl.classList.add('active');
            if (nameEl) {
                nameEl.textContent = originalName;
                nameEl.title = originalName;
            }
        }
    } catch (err) {
        console.log('Cropper cancelled or failed:', err.message);
    }
}

/**
 * Fetch an image from a URL and place it directly into a file input — NO CROPPER.
 * Returns true on success, false on failure.
 */
async function applyPhotoDirectly(url, fileInput, previewEl, nameEl, defaultFileName) {
    try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();

        const safeName = defaultFileName || (url.split('/').pop() || 'photo.jpg');
        const file = new File([blob], safeName, { type: blob.type || 'image/jpeg' });

        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;

        previewEl.src = URL.createObjectURL(file);
        previewEl.classList.add('active');
        if (nameEl) {
            nameEl.textContent = safeName;
            nameEl.title = safeName;
        }
        return true;
    } catch (err) {
        console.warn('Could not fetch HR photo (will fall back to remote preview):', err.message);
        return false;
    }
}

// ============================================================================
// LOGO PICKER
// ============================================================================
const SelectLogoFile    = document.getElementById('SelectLogoFile');
const btnSelectLogoFile = document.getElementById('btnChooseLogoFile');
const LogoNameDisplay   = document.getElementById('AboutUsLogoName');
const LogoPreviewEl     = document.getElementById('AboutUsLogoPreview');

btnSelectLogoFile.addEventListener('click', () => SelectLogoFile.click());

SelectLogoFile.addEventListener('change', async function () {
    if (!SelectLogoFile.files.length) return;
    try {
        await handleCroppedFile(
            SelectLogoFile.files[0],
            IMAGE_RULES.logo.ratio,
            SelectLogoFile,
            LogoPreviewEl,
            LogoNameDisplay,
            IMAGE_RULES.logo.width,
            IMAGE_RULES.logo.height
        );
    } catch (err) { console.log('Cropper cancelled:', err.message); }
});

if (LogoPreviewEl && LogoPreviewEl.parentElement) {
    LogoPreviewEl.parentElement.classList.add(IMAGE_RULES.logo.cssClass);
}

// ============================================================================
// ROLE DETECTION (strict)
// ============================================================================
function detectContactRoles(rows) {
    const nameSet = new Set(rows.map(r => r.Name));
    const SIMPLE_FIELDS = new Set([
        'SchoolName','SchoolAddress','SchoolContact','SchoolEmail','SchoolWebsite'
    ]);
    const roles = new Set();

    rows.forEach(r => {
        if (!/^(.+?)Name$/.test(r.Name)) return;
        if (SIMPLE_FIELDS.has(r.Name)) return;

        const candidate = r.Name.replace(/Name$/, '');
        // Reject reserved suffixes
        if (/(Photo|File|Contact|Email|Role|Url)$/.test(candidate)) return;
        // Must have a matching <role>Photo row
        if (!nameSet.has(`${candidate}Photo`)) return;

        roles.add(candidate);
    });

    return roles;
}

// ============================================================================
// LOAD DATA FROM SUPABASE
// ============================================================================
async function loadAboutUsData() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value, FileName');
        if (error) { console.error('Error fetching data:', error.message); return; }
        if (!data) return;

        const rowMap = {};
        data.forEach(r => { rowMap[r.Name] = r; });

        // Simple fields
        ['SchoolName','SchoolAddress','SchoolContact','SchoolEmail','SchoolWebsite'].forEach(id => {
            const el = document.getElementById(id);
            if (el && rowMap[id]) el.value = rowMap[id].Value || '';
        });

        // Logo
        if (rowMap['SchoolLogo']) {
            if (rowMap['SchoolLogo'].FileName) {
                LogoNameDisplay.textContent = rowMap['SchoolLogo'].FileName;
                LogoNameDisplay.title = rowMap['SchoolLogo'].FileName;
            }
            if (rowMap['SchoolLogo'].Value) {
                LogoPreviewEl.src = rowMap['SchoolLogo'].Value;
                LogoPreviewEl.classList.add('active');
                LogoPreviewEl.dataset.existing = '1';
            }
        }

        // ------- Contacts -------
        const knownRoles = ['Principal', 'SMCHead', 'VicePrincipal', 'Accountant', 'ExamHead', 'ECAHead'];
        const detectedRoles = detectContactRoles(data);

        const orderedRoles = [
            ...knownRoles.filter(r => detectedRoles.has(r)),
            ...[...detectedRoles].filter(r => !knownRoles.includes(r))
        ];

        if (orderedRoles.length === 0) {
            addContactGroup('Principal');
        } else {
            orderedRoles.forEach(role => {
                const storedName = rowMap[`${role}Name`]?.Value || '';
                const matchedHR = HUMAN_RESOURCE_LIST.find(p => p.Name === storedName);
                addContactGroup(role, {
                    name:     storedName,
                    contact:  rowMap[`${role}Contact`]?.Value || '',
                    email:    rowMap[`${role}Email`]?.Value || '',
                    fileName: rowMap[`${role}PhotoFileName`]?.Value || rowMap[`${role}Photo`]?.FileName || '',
                    value:    rowMap[`${role}Photo`]?.Value || '',
                    hrName:   matchedHR ? matchedHR.Name : ''
                });
            });
        }

        // ------- Social Media -------
        const knownPlatforms = ['Facebook', 'TikTok', 'Instagram', 'WhatsApp', 'YouTube'];
        const detectedPlatforms = new Set();
        data.forEach(r => {
            const m = r.Name.match(/^(.+?)Url$/);
            if (m) detectedPlatforms.add(m[1]);
        });

        const orderedPlatforms = [
            ...knownPlatforms.filter(p => detectedPlatforms.has(p)),
            ...[...detectedPlatforms].filter(p => !knownPlatforms.includes(p))
        ];

        if (orderedPlatforms.length === 0) {
            knownPlatforms.forEach(p => addSocialGroup(p, ''));
        } else {
            orderedPlatforms.forEach(p => {
                addSocialGroup(p, rowMap[`${p}Url`]?.Value || '');
            });
        }

        // ------- Sliders -------
        const sliderIndexes = new Set();
        data.forEach(r => {
            const m = r.Name.match(/^SliderPicture(\d+)$/);
            if (m) sliderIndexes.add(parseInt(m[1], 10));
        });
        const sortedSliders = [...sliderIndexes].sort((a, b) => a - b);

        if (sortedSliders.length === 0) {
            addSliderGroup({});
        } else {
            sortedSliders.forEach(n => {
                addSliderGroup({
                    fileName:   rowMap[`SliderPicture${n}`]?.FileName || '',
                    value:      rowMap[`SliderPicture${n}`]?.Value || '',
                    credential: rowMap[`SliderCredential${n}`]?.Value || ''
                });
            });
        }

        console.log('About Us data loaded.');
    } catch (err) {
        console.error('Unexpected error loading data:', err);
    }
}

// ============================================================================
// BOOT SEQUENCE
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadHumanResourceList();
    await loadAboutUsData();
    await loadDynamicLogoAndFavicon();
});

// ============================================================================
// CLOUDINARY HELPERS
// ============================================================================
const CLOUD_NAME    = 'dcdwpdnyp';
const UPLOAD_PRESET = 'AdminFileUploadPreset';
const FOLDER_NAME   = 'AdminMaterials';

async function uploadToCloudinary(fileBlob, originalFileName, customPublicId) {
    const formData = new FormData();
    formData.append('file', fileBlob, originalFileName);
    formData.append('upload_preset', UPLOAD_PRESET);

    const cleanPublicId = customPublicId.replace(/\.[^/.]+$/, "");
    const fullPublicId  = `${FOLDER_NAME}/${cleanPublicId}`;
    formData.append('public_id', fullPublicId);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
    }
    const data = await response.json();
    return `${data.secure_url}?t=${Date.now()}`;
}

async function deleteOldCloudinaryFile(oldUrl) {
    if (!oldUrl || !oldUrl.includes('/upload/')) return;
    try {
        const cleanUrl         = oldUrl.split('?')[0];
        const parts            = cleanUrl.split('/upload/');
        const pathAfterUpload  = parts[1];
        const pathWithoutVer   = pathAfterUpload.replace(/^v\d+\//, '');
        const publicId         = pathWithoutVer.replace(/\.[^/.]+$/, "");

        const { data, error } = await supabaseClient.functions.invoke('delete-admin-material', {
            body: { publicId, resourceType: "image" }
        });
        if (error) { console.error("Edge Function error:", error); return; }
        console.log("Cloudinary delete result:", data);
    } catch (e) {
        console.error("Failed to cleanup old asset:", e);
    }
}

// ============================================================================
// SAVE EVERYTHING
// ============================================================================
async function saveAboutUs() {
    const saveButton = document.getElementById('btnSaveAboutUs');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving Changes...';

    try {
        const updates = [];

        const { data: existingRows } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value');
        const existingMap = {};
        (existingRows || []).forEach(r => { existingMap[r.Name] = r.Value; });

        async function processImageInput(fileInput, dbName, publicId) {
            if (!fileInput || !fileInput.files || !fileInput.files.length) return null;
            const file = fileInput.files[0];
            if (existingMap[dbName]) await deleteOldCloudinaryFile(existingMap[dbName]);
            const url = await uploadToCloudinary(file, file.name, publicId);
            return { Name: dbName, Value: url, FileName: file.name };
        }

        // Simple fields
        ['SchoolName','SchoolAddress','SchoolContact','SchoolEmail','SchoolWebsite'].forEach(id => {
            const el = document.getElementById(id);
            if (el) updates.push({ Name: id, Value: el.value, FileName: null });
        });

        // Logo
        const logoUpdate = await processImageInput(
            document.getElementById('SelectLogoFile'),
            'SchoolLogo',
            'AboutUsLogo'
        );
        if (logoUpdate) updates.push(logoUpdate);

        // Contacts
        const contactWrappers = contactsBox.querySelectorAll('.ImportantContactBoxes');
        const presentRoles = new Set();

        for (const wrap of contactWrappers) {
            const role = (wrap.querySelector('.RoleInput').value || '').trim();
            if (!role) continue;
            const roleKey = role.replace(/\s+/g, '');
            presentRoles.add(roleKey);

            updates.push({ Name: `${roleKey}Name`,    Value: wrap.querySelector('.NameInput').value || '',    FileName: null });
            updates.push({ Name: `${roleKey}Contact`, Value: wrap.querySelector('.ContactInput').value || '', FileName: null });
            updates.push({ Name: `${roleKey}Email`,   Value: wrap.querySelector('.EmailInput').value || '',   FileName: null });
            updates.push({ Name: `${roleKey}Role`,    Value: role,                                            FileName: null });

            const photoUpdate = await processImageInput(
                wrap.querySelector('.PhotoInput'),
                `${roleKey}Photo`,
                `${roleKey}Photo`
            );
            if (photoUpdate) {
                updates.push(photoUpdate);
                updates.push({ Name: `${roleKey}PhotoFileName`, Value: photoUpdate.FileName, FileName: null });
            }
        }

        // Removed roles
        const existingDetectedRoles = detectContactRoles(existingRows || []);
        existingDetectedRoles.forEach(roleKey => {
            if (!presentRoles.has(roleKey)) {
                [`${roleKey}Name`,`${roleKey}Contact`,`${roleKey}Email`,`${roleKey}Role`,
                 `${roleKey}Photo`,`${roleKey}PhotoFileName`].forEach(n => {
                    updates.push({ Name: n, Value: null, FileName: null, _delete: true });
                });
                if (existingMap[`${roleKey}Photo`]) deleteOldCloudinaryFile(existingMap[`${roleKey}Photo`]);
            }
        });

        // Social
        const socialWrappers = socialBox.querySelectorAll('.SocialMediaBoxes');
        const presentPlatforms = new Set();
        for (const wrap of socialWrappers) {
            const platform = (wrap.querySelector('.PlatformInput').value || '').trim();
            if (!platform) continue;
            const key = platform.replace(/\s+/g, '');
            presentPlatforms.add(key);
            updates.push({ Name: `${key}Url`, Value: wrap.querySelector('.UrlInput').value || '', FileName: null });
        }
        const existingPlatforms = new Set();
        (existingRows || []).forEach(r => {
            const m = r.Name.match(/^(.+?)Url$/);
            if (m) existingPlatforms.add(m[1]);
        });
        existingPlatforms.forEach(p => {
            if (!presentPlatforms.has(p)) {
                updates.push({ Name: `${p}Url`, Value: null, FileName: null, _delete: true });
            }
        });

        // Sliders
        const sliderWrappers = sliderBox.querySelectorAll('.SliderPictureSelectBoxes');
        const presentSliderIds = new Set();
        let sliderIndex = 0;
        for (const wrap of sliderWrappers) {
            sliderIndex++;
            const sliderId = `SliderPicture${sliderIndex}`;
            presentSliderIds.add(sliderId);

            updates.push({
                Name: `SliderCredential${sliderIndex}`,
                Value: wrap.querySelector('.SliderCredentialInput').value || '',
                FileName: null
            });

            const sliderUpdate = await processImageInput(
                wrap.querySelector('.SliderFileInput'),
                sliderId,
                `Slider${sliderIndex}`
            );
            if (sliderUpdate) updates.push(sliderUpdate);
        }
        const existingSliderIds = new Set();
        (existingRows || []).forEach(r => {
            const m = r.Name.match(/^SliderPicture(\d+)$/);
            if (m) existingSliderIds.add(`SliderPicture${m[1]}`);
        });
        existingSliderIds.forEach(id => {
            if (!presentSliderIds.has(id)) {
                const idx = id.replace('SliderPicture', '');
                updates.push({ Name: `SliderPicture${idx}`, Value: null, FileName: null, _delete: true });
                updates.push({ Name: `SliderCredential${idx}`, Value: null, FileName: null, _delete: true });
                if (existingMap[id]) deleteOldCloudinaryFile(existingMap[id]);
            }
        });

        // Commit
        console.log("Upserting rows:", updates);
        for (const row of updates) {
            if (row._delete) {
                const { error: delErr } = await supabaseClient
                    .from('AboutSchoolTable')
                    .delete()
                    .eq('Name', row.Name);
                if (delErr) console.warn(`Delete failed for ${row.Name}:`, delErr.message);
                continue;
            }
            const { error } = await supabaseClient
                .from('AboutSchoolTable')
                .upsert({ Name: row.Name, Value: row.Value, FileName: row.FileName }, { onConflict: 'Name' });
            if (error) {
                console.error(`Upsert error for ${row.Name}:`, error.message);
                throw error;
            }
        }

        alert('All updates saved successfully!');
    } catch (error) {
        console.error('Save failed:', error);
        alert(`Failed to save: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
    }
}

// ============================================================================
// DYNAMIC LOGO + FAVICON
// ============================================================================
async function loadDynamicLogoAndFavicon() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Value')
            .eq('Name', 'SchoolLogo')
            .single();

        if (error) { console.error("Branding load error:", error.message); return; }
        if (data && data.Value) {
            const favicon = document.getElementById('dynamicFavicon');
            if (favicon) favicon.href = data.Value;
            const logoImg = document.querySelector('#LogoBox img');
            if (logoImg) logoImg.src = data.Value;
        }
    } catch (err) {
        console.error("Unexpected branding error:", err);
    }
}