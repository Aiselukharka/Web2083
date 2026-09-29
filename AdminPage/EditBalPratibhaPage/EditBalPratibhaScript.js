if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
const CLOUD_NAME = "dcdwpdnyp";

// Constants
const PRATIBHA_CROP_MAX_SIDE = 1600;
const SUPABASE_FUNCTIONS_URL = "https://wrjivuysumgpoqmabwpw.supabase.co/functions/v1";

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
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "NoticeEditBox": "../EditNoticePage/EditNoticeIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "LibraryEditBox": "../EditLibraryPage/EditLibraryIndex.html",
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
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

// ============================================================================
// CROPPER — FREE-FORM
// ============================================================================
let pratibhaCropper = null;

function openPratibhaCropper(file) {
    return new Promise((resolve, reject) => {
        const modal      = document.getElementById('PratibhaCropperModal');
        const image      = document.getElementById('pratibhaCropImage');
        const btnCancel  = document.getElementById('pratibhaCropCancel');
        const btnCancelX = document.getElementById('pratibhaCropCancelX');
        const btnApply   = document.getElementById('pratibhaCropApply');

        if (!modal || !image) { reject(new Error('Cropper modal not found.')); return; }
        if (typeof Cropper === 'undefined') { reject(new Error('Cropper.js not loaded.')); return; }
        if (pratibhaCropper) { pratibhaCropper.destroy(); pratibhaCropper = null; }

        const reader = new FileReader();
        reader.onload = (e) => {
            image.onload = () => {
                modal.style.display = 'flex';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        try {
                            pratibhaCropper = new Cropper(image, {
                                // Free-form: no aspectRatio
                                viewMode: 1,
                                dragMode: 'crop',
                                autoCropArea: 0.85,
                                movable: true,
                                zoomable: true,
                                rotatable: false,
                                scalable: false,
                                responsive: true,
                                background: true,
                                cropBoxResizable: true,
                                cropBoxMovable: true,
                                checkOrientation: false,
                                highlight: false,
                                guides: true,
                                center: true,
                                toggleDragModeOnDblclick: false,
                                ready() { pratibhaCropper.resize(); }
                            });
                        } catch (err) { reject(err); closeCropper(); }
                    });
                });
            };
            image.onerror = () => reject(new Error('Image failed to load.'));
            image.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);

        const closeCropper = () => {
            modal.style.display = 'none';
            if (pratibhaCropper) { pratibhaCropper.destroy(); pratibhaCropper = null; }
        };

        btnCancel.onclick = () => { reject(new Error('Cancelled')); closeCropper(); };
        btnCancelX.onclick = () => { reject(new Error('Cancelled')); closeCropper(); };

        btnApply.onclick = () => {
            if (!pratibhaCropper) return;
            const cropData = pratibhaCropper.getData();
            const cropW = cropData.width;
            const cropH = cropData.height;
            if (!cropW || !cropH) { reject(new Error('Crop failed.')); closeCropper(); return; }

            const longest = Math.max(cropW, cropH);
            const scale   = longest > PRATIBHA_CROP_MAX_SIDE
                            ? PRATIBHA_CROP_MAX_SIDE / longest
                            : 1;
            const outW = Math.max(1, Math.round(cropW * scale));
            const outH = Math.max(1, Math.round(cropH * scale));

            const canvas = pratibhaCropper.getCroppedCanvas({
                width: outW,
                height: outH,
                imageSmoothingQuality: 'high'
            });
            if (!canvas) { reject(new Error('Crop failed.')); closeCropper(); return; }

            canvas.toBlob((blob) => {
                if (!blob) { reject(new Error('Blob generation failed.')); closeCropper(); return; }
                resolve(blob);
                closeCropper();
            }, 'image/jpeg', 0.92);
        };
    });
}

// ============================================================================
// STUDENT PICKER (creator selection)
// ============================================================================
let pickerClassesCache = null;

async function ensureClassesForPicker() {
    if (pickerClassesCache) return pickerClassesCache;
    try {
        const { data, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName').order('created_at', { ascending: true });
        if (error) throw error;
        pickerClassesCache = data || [];
    } catch (e) {
        console.warn('Class load failed:', e.message);
        pickerClassesCache = [];
    }
    return pickerClassesCache;
}

async function openCreatorPicker() {
    await ensureClassesForPicker();
    const classes = pickerClassesCache || [];

    const modal = document.createElement('div');
    modal.className = 'PratibhaModalOverlay';
    modal.innerHTML = `
        <div class="PratibhaModal">
            <div class="PratibhaModalHead">
                <span>Select Creator from Student Data</span>
                <button type="button" class="PratibhaModalClose">✕</button>
            </div>
            <div class="PratibhaModalBody">
                <div class="PratibhaModalFilters">
                    <select id="creatorPickClass">
                        <option value="">All classes</option>
                        ${classes.map(c => `<option value="${c.id}">${escapeHtml(c.ClassName)}</option>`).join('')}
                    </select>
                    <input type="text" id="creatorPickSearch" placeholder="Type a name or regd. no." />
                </div>
                <div class="PratibhaModalResults" id="creatorPickResults">
                    <div class="PratibhaModalEmpty">Start typing to search…</div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('.PratibhaModalClose').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    const searchInput = modal.querySelector('#creatorPickSearch');
    const classSelect = modal.querySelector('#creatorPickClass');
    const results = modal.querySelector('#creatorPickResults');
    let debounceTimer = null;

    const doSearch = async () => {
        const q = searchInput.value.trim();
        const classId = classSelect.value ? parseInt(classSelect.value, 10) : null;
        if (!q && !classId) { results.innerHTML = '<div class="PratibhaModalEmpty">Type or pick a class.</div>'; return; }

        results.innerHTML = '<div class="PratibhaModalEmpty">Searching…</div>';
        try {
            let query = supabaseClient
                .from('StudentDataTable')
                .select('id, StudentName, RollNo, ClassID, EducationalYear, RegdNo')
                .eq('Status', 'active')
                .order('StudentName', { ascending: true })
                .limit(30);
            if (q) query = query.or(`StudentName.ilike.%${q}%,RegdNo.ilike.%${q}%`);
            if (classId) query = query.eq('ClassID', classId);
            const { data, error } = await query;
            if (error) throw error;
            const list = data || [];
            if (list.length === 0) { results.innerHTML = '<div class="PratibhaModalEmpty">No matches.</div>'; return; }

            const classMap = {};
            classes.forEach(c => { classMap[c.id] = c.ClassName; });

            results.innerHTML = list.map(s => `
                <div class="PratibhaModalResultRow" data-id="${s.id}">
                    <div class="PratibhaModalResultName">${escapeHtml(s.StudentName)}</div>
                    <div class="PratibhaModalResultMeta">
                        Roll ${escapeHtml(s.RollNo ?? '-')}
                        · Class ${escapeHtml(classMap[s.ClassID] || '-')}
                        · ${escapeHtml(s.EducationalYear ?? '')}
                    </div>
                </div>`).join('');

            results.querySelectorAll('.PratibhaModalResultRow').forEach(rowEl => {
                rowEl.addEventListener('click', () => {
                    const id = parseInt(rowEl.dataset.id, 10);
                    const picked = list.find(x => x.id === id);
                    if (!picked) return;
                    const className = classMap[picked.ClassID] || '';
                    document.getElementById('PratibhaCreatorId').value    = picked.id;
                    document.getElementById('PratibhaCreatorName').value  = picked.StudentName || '';
                    document.getElementById('PratibhaCreatorClass').value = className;
                    document.getElementById('creatorDisplay').textContent =
                        `${picked.StudentName} (${className || '-'})`;
                    close();
                });
            });
        } catch (e) {
            results.innerHTML = `<div class="PratibhaModalEmpty">Search failed: ${escapeHtml(e.message)}</div>`;
        }
    };

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doSearch, 250);
    });
    classSelect.addEventListener('change', doSearch);
    searchInput.focus();
}

// ============================================================================
// FILE PICKER → CROP → PREVIEW
// ============================================================================
const PratibhaInput       = document.getElementById("PratibhaFile");
const ChoosePratibhaBtn   = document.getElementById("btnChoosePratibhaFile");
const PratibhaUploadPrev  = document.getElementById("PratibhaUploadPreview");
const PratibhaUploadHint  = document.getElementById("PratibhaUploadPreviewHint");

let pendingPratibhaFile = null;

ChoosePratibhaBtn.addEventListener("click", () => PratibhaInput.click());
document.getElementById('btnPickCreator').addEventListener('click', openCreatorPicker);

PratibhaInput.addEventListener("change", async () => {
    const file = PratibhaInput.files[0];
    PratibhaInput.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showCustomDialog1("Invalid File", "Please choose an image file.", "OK", function(){});
        return;
    }
    if (file.size > 15 * 1024 * 1024) {
        showCustomDialog1("File Too Large", "Image must be under 15 MB.", "OK", function(){});
        return;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const titleInput = document.getElementById("PratibhaTitle");
    if (!titleInput.value.trim()) titleInput.value = baseName;

    try {
        const croppedBlob = await openPratibhaCropper(file);
        const croppedFile = new File([croppedBlob], `pratibha_${Date.now()}.jpg`,
                                     { type: 'image/jpeg', lastModified: Date.now() });
        pendingPratibhaFile = croppedFile;

        if (PratibhaUploadPrev.dataset.objectUrl) {
            URL.revokeObjectURL(PratibhaUploadPrev.dataset.objectUrl);
        }
        const objUrl = URL.createObjectURL(croppedFile);
        PratibhaUploadPrev.src = objUrl;
        PratibhaUploadPrev.dataset.objectUrl = objUrl;
        PratibhaUploadPrev.classList.add('active');
        if (PratibhaUploadHint) PratibhaUploadHint.style.display = 'none';

        ChoosePratibhaBtn.textContent = "Re-choose";
    } catch (e) {
        console.log('Cropper cancelled:', e.message);
    }
});

// ============================================================================
// UPLOAD PRATIBHA
// ============================================================================
async function uploadPratibha() {
    const UPLOAD_PRESET = "UploadBalPratibhaPreset";
    const title       = document.getElementById("PratibhaTitle").value.trim();
    const creatorName = document.getElementById("PratibhaCreatorName").value.trim();
    const creatorClass= document.getElementById("PratibhaCreatorClass").value.trim();
    const uploadBtn   = document.getElementById("btnUploadPratibha");

    if (!pendingPratibhaFile || !title || !creatorName || !creatorClass) {
        showCustomDialog1("Missing Data",
            "Please choose an image, select a creator from Student Data, and provide a title.",
            "OK", function(){});
        return;
    }

    try {
        uploadBtn.innerText = "Uploading...";
        uploadBtn.disabled = true;

        const formData = new FormData();
        formData.append("file", pendingPratibhaFile);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (!res.ok || !data.secure_url) {
            console.error("Cloudinary Error:", data);
            showCustomDialog3(
                "Upload Failed",
                `Your file could not be uploaded.<br><br>
                If the file is too large, you can compress online in:
                <a href="https://bigpdf.11zon.com/en/compress-pdf/#google_vignette"
                    target="_blank"
                    style="color:blue; font-weight:bold;">
                    SmallPDF
                </a>
                or download and install Ghostscript to compress on your computer:<br><br>
                <a href="https://ghostscript.com/releases/gsdnld.html"
                    target="_blank"
                    style="color:blue; font-weight:bold;">
                    Ghostscript Download
                </a>`,
                "OK",
                () => {}
            );
            return;
        }

        const { error } = await supabaseClient
            .from("BalPratibhaTable")
            .insert([{
                PratibhaTopic: title,
                PratibhaCreatorName: creatorName,
                PratibhaCreatorClass: creatorClass,
                PratibhaUrl: data.secure_url,
                PratibhaPublicId: data.public_id
            }]);
        if (error) {
            showCustomDialog1("Error", error.message, "OK", function(){});
            return;
        }

        showCustomDialog1("Success", "Pratibha is uploaded successfully!", "OK", function(){});

        pendingPratibhaFile = null;
        document.getElementById("PratibhaTitle").value = "";
        document.getElementById("PratibhaCreatorId").value = "";
        document.getElementById("PratibhaCreatorName").value = "";
        document.getElementById("PratibhaCreatorClass").value = "";
        document.getElementById("creatorDisplay").textContent = "Select Creator from Student Data…";
        document.getElementById("btnChoosePratibhaFile").textContent = "Choose Pratibha";

        if (PratibhaUploadPrev.dataset.objectUrl) {
            URL.revokeObjectURL(PratibhaUploadPrev.dataset.objectUrl);
            delete PratibhaUploadPrev.dataset.objectUrl;
        }
        PratibhaUploadPrev.src = "";
        PratibhaUploadPrev.classList.remove('active');
        if (PratibhaUploadHint) PratibhaUploadHint.style.display = '';

        loadPratibha();
    } finally {
        uploadBtn.innerText = "Upload";
        uploadBtn.disabled = false;
    }
}
window.uploadPratibha = uploadPratibha;

// ============================================================================
// LOAD PRATIBHA LIST
// ============================================================================
async function loadPratibha() {
    const { data, error } = await supabaseClient
        .from("BalPratibhaTable")
        .select("*")
        .order("id", { ascending: false });
    if (error) { console.error(error); return; }

    const adminList = document.getElementById("AdminPratibhaList");
    adminList.innerHTML = "";

    data.forEach(Pratibha => {
        const div = document.createElement("div");
        div.className = "PratibhaItems";

        const safeTitle = (Pratibha.PratibhaTopic || '').replace(/'/g, "\\'");
        const openCode = `showPictureViewer('${Pratibha.PratibhaUrl}','${safeTitle}')`;

        div.innerHTML = `
            <div class="PratibhaThumbWrap">
                <img class="PratibhaThumb" src="${escapeHtml(Pratibha.PratibhaUrl)}" alt="" loading="lazy" />
            </div>
            <div class="PratibhaInfoCol">
                <h3 class="PratibhaTitleText">${escapeHtml(Pratibha.PratibhaTopic)}</h3>
                <div class="PratibhaCreators">${escapeHtml(Pratibha.PratibhaCreatorName)} (${escapeHtml(Pratibha.PratibhaCreatorClass)})</div>
            </div>
            <div class="PratibhaActions">
                <button class="PratibhaIconBtn PratibhaOpenBtn" title="Open" onclick="${openCode}">👁</button>
                <button class="PratibhaIconBtn PratibhaDownBtn" title="Download"
                        onclick="downloadPratibha(this, '${Pratibha.PratibhaUrl}', '${escapeHtml(Pratibha.PratibhaTopic)}')">⬇</button>
                <button class="PratibhaIconBtn PratibhaDelBtn" id="delete-${Pratibha.id}" title="Delete"
                        onclick="deletePratibha(${Pratibha.id}, '${Pratibha.PratibhaPublicId || ''}')">✕</button>
            </div>`;
        adminList.appendChild(div);
    });
}
window.loadPratibha = loadPratibha;
loadPratibha();

// ============================================================================
// DELETE PRATIBHA
// ----------------------------------------------------------------------------
// Two-step delete:
//   1. Ask Cloudinary (via Supabase edge function) to remove the asset.
//   2. Remove the DB row.
// Uses supabaseClient.functions.invoke so we don't depend on any global
// SUPABASE_ANON_KEY constant being in scope.
// ============================================================================
async function deletePratibha(id, publicId) {
    const btn = document.getElementById(`delete-${id}`);
    const confirmed = confirm("Delete this Pratibha?");
    if (!confirmed) return;

    if (btn) { btn.disabled = true; btn.textContent = "…"; }

    let cloudinaryOk = false;
    let cloudinaryErrMsg = '';

    // ---------- Step 1: Cloudinary cleanup ----------
    if (publicId) {
        try {
            console.log("[BalPratibha] Deleting Cloudinary asset:", publicId);

            const { data: fnData, error: fnError } = await supabaseClient.functions.invoke(
                'delete-student-photo',
                { body: { publicIds: [publicId] } }
            );

            if (fnError) {
                cloudinaryErrMsg = fnError.message || 'Edge function error';
                console.warn("[BalPratibha] Cloudinary delete failed:", cloudinaryErrMsg);
            } else {
                cloudinaryOk = true;
                console.log("[BalPratibha] Cloudinary asset deleted:", fnData);
            }
        } catch (e) {
            cloudinaryErrMsg = e.message;
            console.warn("[BalPratibha] Cloudinary delete exception:", e.message);
        }
    } else {
        cloudinaryOk = true; // nothing to delete on Cloudinary
    }

    // ---------- Step 2: DB row deletion ----------
    try {
        const { error } = await supabaseClient
            .from("BalPratibhaTable")
            .delete()
            .eq("id", id);
        if (error) throw error;

        loadPratibha();
    } catch (e) {
        console.error('[BalPratibha] DB delete error:', e.message);
        alert('Delete failed: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "✕"; }
    }

    // If Cloudinary cleanup failed, warn the admin so they can clean up manually.
    // The DB row is already gone, so we don't roll anything back.
    if (!cloudinaryOk && publicId) {
        alert(
            "The Pratibha row was deleted, but its image could not be removed from Cloudinary.\n\n" +
            "Reason: " + (cloudinaryErrMsg || 'unknown error') + "\n\n" +
            "You may want to clean it up manually in the Cloudinary dashboard:\n" +
            "publicId = " + publicId
        );
    }
}
window.deletePratibha = deletePratibha;

// ============================================================================
// DOWNLOAD PRATIBHA
// ============================================================================
async function downloadPratibha(btn, url, fileName) {
    try {
        btn.disabled = true;
        btn.textContent = "…";

        const response = await fetch(url);
        const blob = await response.blob();
        const a = document.createElement("a");
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
            btn.textContent = "⬇";
            btn.disabled = false;
        }, 800);
    }
}
window.downloadPratibha = downloadPratibha;