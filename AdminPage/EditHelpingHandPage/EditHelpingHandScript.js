if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
const CLOUD_NAME = "dcdwpdnyp";

const HH_TABLE       = 'HelpingHandTable';
const HH_STAFF_TABLE = 'HelpingHandStaffTable';
const HH_ROLE_TABLE  = 'HelpingHandRoleTable';
const HH_ACT_TABLE   = 'HelpingHandActivityTable';
const HH_BENEF_TABLE = 'HelpingHandBeneficiaryTable';

const LOGO_CROP_SIZE = 400;

// Cloudinary preset for Helping Hand logos (allows native resolution, no cropping)
const LOGO_UPLOAD_PRESET = 'HelpingHandLogoPreset';

// ============================================================================
// LAZY LIBRARY LOADERS
// ============================================================================
const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
let html2canvasPromise = null;
function ensureHtml2Canvas() {
    if (typeof html2canvas !== 'undefined') return Promise.resolve();
    if (html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = HTML2CANVAS_URL;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load html2canvas library.'));
        document.head.appendChild(s);
    });
    return html2canvasPromise;
}

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
document.getElementById("PageNavigationSelect").addEventListener("change", function () {
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

document.getElementById("EditNavigationSelect").addEventListener("change", function () {
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
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };
    const p = pageMap[this.value];
    if (p) window.location.href = p;
});

// ============================================================================
// DATE BAR / ADMIN TOOLS / LOGO
// ============================================================================
document.getElementById('DateBox').innerText =
    AD2BS(new Date()) + " (" + new Date().toISOString().split('T')[0] + ")";

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
// STATE
// ============================================================================
const HH_STATE = {
    internal: { orgs: [], classes: [], staffCache: [], editorOrg: null, editorChildren: null },
    external: { orgs: [], classes: [], staffCache: [], editorOrg: null, editorChildren: null }
};
let currentSection = 'internal';

const schoolInfoCache = { name: '', address: '', loaded: false };

// ============================================================================
// HELPERS
// ============================================================================
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
}
function getFileNameFromUrl(url) {
    if (!url) return 'No logo';
    try {
        const d = decodeURIComponent(url);
        return d.substring(d.lastIndexOf('/') + 1).split('?')[0];
    } catch { return 'Logo'; }
}
function getCloudinaryPublicId(url) {
    if (!url) return null;
    try {
        const cleaned = url.split('?')[0];
        const parts = cleaned.split('/');
        const file = parts[parts.length - 1];
        return file.split('.')[0];
    } catch { return null; }
}
function showStatus(type, msg, kind) {
    const el = document.getElementById(type === 'internal' ? 'statusInternal' : 'statusExternal');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = kind === 'error' ? '#a00' : kind === 'success' ? '#080' : '#a60';
}
function fmtList(html) {
    return html && html.length ? html : '<em>(none)</em>';
}

async function deleteCloudinaryAsset(publicId) {
    if (!publicId) return;
    try {
        const { error } = await supabaseClient.functions.invoke('delete-student-photo', {
            body: { publicIds: [publicId] }
        });
        if (error) console.warn('Cloudinary delete failed:', error.message);
    } catch (e) {
        console.warn('Cloudinary delete exception:', e.message);
    }
}

async function ensureSchoolInfo() {
    if (schoolInfoCache.loaded) return schoolInfoCache;
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value')
            .in('Name', ['SchoolName', 'SchoolAddress']);
        if (error) throw error;
        (data || []).forEach(r => {
            if (r.Name === 'SchoolName')    schoolInfoCache.name    = r.Value || '';
            if (r.Name === 'SchoolAddress') schoolInfoCache.address = r.Value || '';
        });
    } catch (e) {
        console.warn('School info load failed:', e.message);
    }
    schoolInfoCache.loaded = true;
    return schoolInfoCache;
}

// ============================================================================
// SECTION TOGGLE
// ============================================================================
function toggleHHSection(section) {
    currentSection = section;
    document.getElementById('btnInternal').classList.toggle('active', section === 'internal');
    document.getElementById('btnExternal').classList.toggle('active', section === 'external');
    document.getElementById('InternalSection').style.display = section === 'internal' ? 'flex' : 'none';
    document.getElementById('ExternalSection').style.display = section === 'external' ? 'flex' : 'none';
}
window.toggleHHSection = toggleHHSection;

// ============================================================================
// DATA LOADING
// ============================================================================
async function loadAll(type) {
    const state = HH_STATE[type];
    try {
        const { data: orgs, error } = await supabaseClient
            .from(HH_TABLE).select('*')
            .eq('Type', type)
            .order('DisplayOrder', { ascending: true })
            .order('OrganizationName', { ascending: true });
        if (error) throw error;
        state.orgs = orgs || [];
        renderList(type);
    } catch (e) {
        console.error(`Load ${type} error:`, e.message);
        const host = document.getElementById(type === 'internal' ? 'internalList' : 'externalList');
        if (host) host.innerHTML = `<div class="HHEmpty">Failed to load: ${escapeHtml(e.message)}</div>`;
    }
}

async function ensureClasses() {
    if (HH_STATE.internal.classes.length > 0) return;
    try {
        const { data, error } = await supabaseClient
            .from('ClassTable').select('id, ClassName')
            .order('created_at', { ascending: true });
        if (!error) {
            const list = data || [];
            HH_STATE.internal.classes = list;
            HH_STATE.external.classes = list;
        }
    } catch (e) { console.warn('Class load failed:', e.message); }
}

// Silent schema probe: fetch one row of HumanResourceTable with SELECT *,
// then build the staff cache using whatever columns actually exist.
async function ensureStaffCache() {
    if (HH_STATE.internal.staffCache.length > 0) return;
    try {
        const { data: all, error: err2 } = await supabaseClient
            .from('HumanResourceTable')
            .select('*');
        if (err2) {
            console.warn('[HelpingHand] HumanResourceTable fetch failed:', err2.message);
            HH_STATE.internal.staffCache = [];
            HH_STATE.external.staffCache = [];
            return;
        }
        const sample = (all && all[0]) || {};
        const cols = Object.keys(sample);
        const nameKey = cols.find(k => /^name$/i.test(k))
                     || cols.find(k => /staff.*name/i.test(k))
                     || cols.find(k => /full.*name/i.test(k))
                     || null;
        const desigKey = cols.find(k => /^designation$/i.test(k))
                      || cols.find(k => /^post$/i.test(k))
                      || cols.find(k => /position/i.test(k))
                      || null;

        const list = (all || []).map(r => ({
            id: r.id,
            Name: nameKey ? (r[nameKey] || '') : '',
            Designation: desigKey ? (r[desigKey] || '') : ''
        })).filter(x => x.Name);
        list.sort((a, b) => a.Name.localeCompare(b.Name));

        HH_STATE.internal.staffCache = list;
        HH_STATE.external.staffCache = list;
        console.log(`[HelpingHand] staff cache: ${list.length} entries (name="${nameKey}", designation="${desigKey}")`);
    } catch (e) {
        console.warn('[HelpingHand] staff cache exception:', e.message);
        HH_STATE.internal.staffCache = [];
        HH_STATE.external.staffCache = [];
    }
}

// ============================================================================
// LIST
// ============================================================================
function renderList(type) {
    const state = HH_STATE[type];
    const host = document.getElementById(type === 'internal' ? 'internalList' : 'externalList');
    if (!host) return;

    if (state.orgs.length === 0) {
        host.innerHTML = '<div class="HHEmpty">No organizations yet. Click <strong>➕ Add New Organization</strong> to begin.</div>';
        return;
    }

    let html = '';
    state.orgs.forEach(org => {
        const logoSrc = org.LogoUrl ? `${org.LogoUrl}?v=${org.id}` : '';
        const logo = org.LogoUrl
            ? `<div class="HHListLogoWrap"><img class="HHListLogo" src="${escapeHtml(logoSrc)}" alt=""></div>`
            : `<div class="HHListLogoWrap HHListLogoEmpty">🏫</div>`;
        const active = (org.IsActive || 'Yes').toLowerCase() === 'yes';
        const featured = (org.IsFeatured || 'No').toLowerCase() === 'yes';
        html += `
            <div class="HHListRow" data-id="${org.id}">
                ${logo}
                <div class="HHListInfo">
                    <div class="HHListName">${escapeHtml(org.OrganizationName || '(unnamed)')}</div>
                    <div class="HHListMeta">
                        ${org.EstablishedYear ? `Est. ${escapeHtml(org.EstablishedYear)} · ` : ''}
                        ${active ? '<span class="HHBadge HHBadgeActive">Active</span>' : '<span class="HHBadge HHBadgeInactive">Inactive</span>'}
                        ${featured ? ' <span class="HHBadge HHBadgeFeatured">Featured</span>' : ''}
                    </div>
                </div>
                <div class="HHListActions">
                    <button class="HHIconBtn" title="View" onclick="viewOrg('${type}', ${org.id})">👁</button>
                    <button class="HHIconBtn" title="Edit" onclick="openEditor('${type}', ${org.id})">✎</button>
                    <button class="HHIconBtn HHIconBtnDanger" title="Delete" onclick="deleteOrg('${type}', ${org.id})">✕</button>
                </div>
            </div>`;
    });
    host.innerHTML = html;
}

// ============================================================================
// VIEW MODAL
// ============================================================================
async function viewOrg(type, orgId) {
    const org = HH_STATE[type].orgs.find(o => o.id === orgId);
    if (!org) return;

    await ensureSchoolInfo();

    let staff = [], roles = [], activities = [], beneficiaries = [];
    try {
        const [s, r, a, b] = await Promise.all([
            supabaseClient.from(HH_STAFF_TABLE).select('*').eq('OrganizationID', org.id).order('id'),
            supabaseClient.from(HH_ROLE_TABLE).select('*').eq('OrganizationID', org.id).order('id'),
            supabaseClient.from(HH_ACT_TABLE).select('*').eq('OrganizationID', org.id).order('id'),
            supabaseClient.from(HH_BENEF_TABLE).select('*').eq('OrganizationID', org.id).order('id')
        ]);
        staff = s.data || [];
        roles = r.data || [];
        activities = a.data || [];
        beneficiaries = b.data || [];
    } catch (e) { console.warn('View: children fetch failed', e.message); }

    const isInternal = type === 'internal';

    const staffRows = staff.map(x => `
        <tr><td>${escapeHtml(x.Role || '')}</td><td>${escapeHtml(x.StaffNameSnapshot || '')}</td><td>${(x.IsPrimary || 'No') === 'Yes' ? '✔' : ''}</td></tr>`).join('');
    const roleRows = roles.map(x => `
        <tr><td>${escapeHtml(x.Role || '')}</td><td>${escapeHtml(x.StudentNameSnapshot || '')}</td><td>${escapeHtml(x.AcademicYear || '')}</td></tr>`).join('');
    const benefRows = beneficiaries.map(x => `
        <tr><td>${escapeHtml(x.SupportType || '')}</td><td>${escapeHtml(x.StudentNameSnapshot || '')}</td><td>${escapeHtml(x.Notes || '')}</td></tr>`).join('');
    const actRows = activities.map(x => `
        <tr><td>${escapeHtml(x.Title || '')}</td><td>${escapeHtml(x.Description || '')}</td><td>${escapeHtml(x.StartYear || '')}${x.EndYear ? ' – ' + escapeHtml(x.EndYear) : ''}</td></tr>`).join('');

    const modal = document.createElement('div');
    modal.className = 'HHModalOverlay';
    modal.innerHTML = `
        <div class="HHModal HHViewModal">
            <div class="HHModalHead">
                <span>${escapeHtml(org.OrganizationName || '(unnamed)')} — ${isInternal ? 'Internal' : 'External'}</span>
                <button type="button" class="HHModalClose">✕</button>
            </div>
            <div class="HHModalBody HHViewModalBody">
                <div id="hhViewPrintable" class="HHViewPrintable">

                    <div class="HHViewSchoolHeader">
                        <div class="HHViewSchoolName">${escapeHtml(schoolInfoCache.name || '')}</div>
                        <div class="HHViewSchoolAddress">${escapeHtml(schoolInfoCache.address || '')}</div>
                        <div class="HHViewSchoolTitle">HELPING HAND — ORGANIZATION DETAILS</div>
                    </div>

                    <div class="HHViewTop">
                        <div class="HHViewLogo">
                            ${org.LogoUrl ? `<img src="${escapeHtml(org.LogoUrl)}?v=${org.id}" alt="">` : '<span class="HHLogoPreviewHint">No logo</span>'}
                        </div>
                        <div class="HHViewTopText">
                            <div class="HHViewTitle">${escapeHtml(org.OrganizationName || '')}</div>
                            <div class="HHViewMeta">
                                ${org.EstablishedYear ? `Established: ${escapeHtml(org.EstablishedYear)} · ` : ''}
                                ${(org.IsActive||'Yes') === 'Yes' ? '<span class="HHBadge HHBadgeActive">Active</span>' : '<span class="HHBadge HHBadgeInactive">Inactive</span>'}
                                ${(org.IsFeatured||'No') === 'Yes' ? ' <span class="HHBadge HHBadgeFeatured">Featured</span>' : ''}
                            </div>
                            ${!isInternal && org.FundingOrSupportType ? `<div class="HHViewMeta">Support Type: <strong>${escapeHtml(org.FundingOrSupportType)}</strong></div>` : ''}
                        </div>
                    </div>

                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">Description</div>
                        <div class="HHViewText">${org.Description ? escapeHtml(org.Description).replace(/\n/g,'<br>') : '<em>(none)</em>'}</div>
                    </div>

                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">${isInternal ? 'Patrons / In-charge / Contact Persons' : 'Contact Persons'}</div>
                        <div class="HHViewTableWrap">
                            <table class="HHViewTable">
                                <thead><tr><th>Role</th><th>Person</th><th>Primary</th></tr></thead>
                                <tbody>${fmtList(staffRows)}</tbody>
                            </table>
                        </div>
                    </div>

                    ${isInternal ? `
                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">Working Body (Students)</div>
                        <div class="HHViewTableWrap">
                            <table class="HHViewTable">
                                <thead><tr><th>Role</th><th>Student</th><th>Year</th></tr></thead>
                                <tbody>${fmtList(roleRows)}</tbody>
                            </table>
                        </div>
                    </div>` : ''}

                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">${isInternal ? 'Activities' : 'Programs'}</div>
                        <div class="HHViewTableWrap">
                            <table class="HHViewTable">
                                <thead><tr><th>Title</th><th>Description</th><th>Period</th></tr></thead>
                                <tbody>${fmtList(actRows)}</tbody>
                            </table>
                        </div>
                    </div>

                    ${!isInternal ? `
                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">Beneficiaries</div>
                        <div class="HHViewTableWrap">
                            <table class="HHViewTable">
                                <thead><tr><th>Support Type</th><th>Student</th><th>Notes</th></tr></thead>
                                <tbody>${fmtList(benefRows)}</tbody>
                            </table>
                        </div>
                    </div>
                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">Targeted Students — Notes</div>
                        <div class="HHViewText">${org.TargetedStudentsNotes ? escapeHtml(org.TargetedStudentsNotes).replace(/\n/g,'<br>') : '<em>(none)</em>'}</div>
                    </div>` : ''}

                    <div class="HHViewSection">
                        <div class="HHViewSectionHead">Notes</div>
                        <div class="HHViewText">${org.Notes ? escapeHtml(org.Notes).replace(/\n/g,'<br>') : '<em>(none)</em>'}</div>
                    </div>
                </div>

                <div class="HHViewActions">
                    <button type="button" class="HHSaveBtn" id="hhViewSaveJpg">💾 Save as JPG</button>
                    <button type="button" class="HHCancelBtn" id="hhViewClose">Close</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('.HHModalClose').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('#hhViewClose').addEventListener('click', close);

    modal.querySelector('#hhViewSaveJpg').addEventListener('click', async () => {
        const btn = modal.querySelector('#hhViewSaveJpg');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '💾 Preparing…';
        try {
            await ensureHtml2Canvas();
            const printable = modal.querySelector('#hhViewPrintable');
            const canvas = await html2canvas(printable, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const a = document.createElement('a');
            const safeName = (org.OrganizationName || 'Organization').replace(/[^\w\-]+/g, '_');
            a.href = dataUrl;
            a.download = `${safeName}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            console.error(e);
            alert('JPG export failed: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText || '💾 Save as JPG';
        }
    });
}
window.viewOrg = viewOrg;

// ============================================================================
// EDITOR — OPEN / CLOSE
// ============================================================================
async function openEditor(type, orgId) {
    const state = HH_STATE[type];

    state.editorOrg = null;
    state.editorChildren = null;

    const hostId = type === 'internal' ? 'internalEditor' : 'externalEditor';
    const host = document.getElementById(hostId);
    if (host) host.innerHTML = '';

    await Promise.all([ensureClasses(), ensureStaffCache()]);

    const org = orgId ? state.orgs.find(o => o.id === orgId) : null;

    let children = { staff: [], roles: [], activities: [], beneficiaries: [] };
    if (org) {
        try {
            const [s, r, a, b] = await Promise.all([
                supabaseClient.from(HH_STAFF_TABLE).select('*').eq('OrganizationID', org.id).order('id'),
                supabaseClient.from(HH_ROLE_TABLE).select('*').eq('OrganizationID', org.id).order('id'),
                supabaseClient.from(HH_ACT_TABLE).select('*').eq('OrganizationID', org.id).order('id'),
                supabaseClient.from(HH_BENEF_TABLE).select('*').eq('OrganizationID', org.id).order('id')
            ]);
            children.staff = s.data || [];
            children.roles = r.data || [];
            children.activities = a.data || [];
            children.beneficiaries = b.data || [];
        } catch (e) {
            console.error('Load children error:', e.message);
        }
    }

    state.editorOrg = org ? JSON.parse(JSON.stringify(org)) : {
        Type: type,
        OrganizationName: '',
        EstablishedYear: '',
        Description: '',
        Notes: '',
        LogoUrl: '',
        DisplayOrder: 0,
        IsActive: 'Yes',
        IsFeatured: 'No',
        FundingOrSupportType: '',
        TargetedStudentsNotes: ''
    };
    state.editorChildren = children;

    console.log(`[HelpingHand] openEditor(${type}, ${orgId}) → editorOrg.id=${state.editorOrg.id}, LogoUrl=${state.editorOrg.LogoUrl}`);

    renderEditorShell(type);
    document.getElementById(type === 'internal' ? 'internalEditorWrap' : 'externalEditorWrap').style.display = 'block';
}
window.openEditor = openEditor;

function closeEditor(type) {
    document.getElementById(type === 'internal' ? 'internalEditorWrap' : 'externalEditorWrap').style.display = 'none';
    HH_STATE[type].editorOrg = null;
    HH_STATE[type].editorChildren = null;
}
window.closeEditor = closeEditor;

// ============================================================================
// EDITOR — SHELL
// ============================================================================
function renderEditorShell(type) {
    const state = HH_STATE[type];
    const org = state.editorOrg;
    const hostId = type === 'internal' ? 'internalEditor' : 'externalEditor';
    const host = document.getElementById(hostId);
    if (!host) return;

    const isInternal = type === 'internal';

    const previewSrc = org.LogoUrl ? `${org.LogoUrl}?v=${org.id || 'new_' + Date.now()}` : '';
    const logoFor = String(org.id || 'new');

    host.innerHTML = `
        <div class="HHEditorHead">
            <span>${org.id ? 'Edit' : 'New'} ${isInternal ? 'Internal' : 'External'} Organization</span>
            <button class="HHEditorClose" onclick="closeEditor('${type}')">✕</button>
        </div>

        <div class="HHEditorBody">

            <div class="HHFieldRow">
                <div class="HHField">
                    <label>Organization Name *</label>
                    <input type="text" id="field_OrganizationName" value="${escapeHtml(org.OrganizationName)}" />
                </div>
                <div class="HHField HHFieldSmall">
                    <label>Established</label>
                    <input type="text" id="field_EstablishedYear" value="${escapeHtml(org.EstablishedYear)}" />
                </div>
                <div class="HHField HHFieldSmall">
                    <label>Display Order</label>
                    <input type="number" id="field_DisplayOrder" value="${escapeHtml(org.DisplayOrder)}" />
                </div>
            </div>

            <div class="HHFieldRow">
                <div class="HHField">
                    <label>Active</label>
                    <select id="field_IsActive">
                        <option value="Yes" ${(org.IsActive||'Yes')==='Yes'?'selected':''}>Yes</option>
                        <option value="No" ${(org.IsActive||'Yes')==='No'?'selected':''}>No</option>
                    </select>
                </div>
                <div class="HHField">
                    <label>Featured</label>
                    <select id="field_IsFeatured">
                        <option value="No" ${(org.IsFeatured||'No')==='No'?'selected':''}>No</option>
                        <option value="Yes" ${(org.IsFeatured||'No')==='Yes'?'selected':''}>Yes</option>
                    </select>
                </div>
                ${!isInternal ? `
                <div class="HHField">
                    <label>Support Type</label>
                    <select id="field_FundingOrSupportType">
                        ${['','Scholarship','Books','Food','Uniform','Infrastructure','Training','Other']
                            .map(v => `<option value="${v}" ${(org.FundingOrSupportType||'')===v?'selected':''}>${v || '— select —'}</option>`).join('')}
                    </select>
                </div>` : ''}
            </div>

            <div class="HHFieldRow HHLogoRow">
                <div class="HHField HHLogoPreviewCol">
                    <label>Logo</label>
                    <div class="HHLogoPreviewBox" id="logoPreview_${type}">
                        ${previewSrc
                            ? `<img src="${escapeHtml(previewSrc)}" data-logo-for="${escapeHtml(logoFor)}" alt="">`
                            : `<span class="HHLogoPreviewHint">No logo</span>`}
                    </div>
                </div>
                <div class="HHField HHLogoUploadCol">
                    <label>&nbsp;</label>
                    <input type="file" id="logoFileInput_${type}" accept="image/*" style="display:none;" />
                    <button type="button" class="HHGhostBtn" onclick="document.getElementById('logoFileInput_${type}').click()">Choose Logo</button>
                    <div class="HHLogoFileName" id="logoFileName_${type}">${escapeHtml(getFileNameFromUrl(org.LogoUrl))}</div>
                </div>
            </div>

            <div class="HHField HHFieldFull">
                <label>Description</label>
                <textarea id="field_Description" rows="4">${escapeHtml(org.Description)}</textarea>
            </div>

            <div class="HHField HHFieldFull">
                <label>Notes</label>
                <textarea id="field_Notes" rows="3">${escapeHtml(org.Notes)}</textarea>
            </div>

            <div id="childBlock_staff_${type}" class="HHChildBlockMount"></div>
            ${isInternal
                ? `<div id="childBlock_members_${type}" class="HHChildBlockMount"></div>`
                : `<div id="childBlock_benef_${type}" class="HHChildBlockMount"></div>`}
            <div id="childBlock_activity_${type}" class="HHChildBlockMount"></div>

            ${!isInternal ? `
                <div class="HHField HHFieldFull">
                    <label>Targeted Students — Notes</label>
                    <textarea id="field_TargetedStudentsNotes" rows="3">${escapeHtml(org.TargetedStudentsNotes)}</textarea>
                </div>` : ''}

            <div class="HHEditorActions">
                <button type="button" class="HHSaveBtn" id="hhSaveBtn_${type}" onclick="saveEditor('${type}')">💾 Save Organization</button>
                <button type="button" class="HHCancelBtn" onclick="closeEditor('${type}')">Cancel</button>
            </div>
        </div>
    `;

    if (!document.getElementById('hhDesignationList')) {
        const dl = document.createElement('datalist');
        dl.id = 'hhDesignationList';
        ['President','Vice President','Secretary','Joint Secretary','Treasurer','Member',
         'Patron','Advisor','In-charge','Contact Person','Coordinator',
         'Teacher','Principal','Vice Principal','Accountant','Librarian',
         'Scholarship','Books','Uniform','Meal','Tuition','Kit','Other'].forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            dl.appendChild(opt);
        });
        document.body.appendChild(dl);
    }

    const fileInput = document.getElementById(`logoFileInput_${type}`);
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const f = e.target.files[0];
            fileInput.value = '';
            if (!f) return;
            if (!f.type.startsWith('image/')) { alert('Image file required.'); return; }
            if (f.size > 10 * 1024 * 1024) { alert('File must be under 10 MB.'); return; }

            const editingOrgId = HH_STATE[type].editorOrg.id;

            openLogoCropper(f, async (croppedBlob) => {
                if (HH_STATE[type].editorOrg === null || HH_STATE[type].editorOrg.id !== editingOrgId) {
                    console.warn('Logo upload cancelled: editor changed while cropping.');
                    return;
                }

                const nameEl = document.getElementById(`logoFileName_${type}`);
                const previousUrl = HH_STATE[type].editorOrg.LogoUrl;
                if (nameEl) nameEl.textContent = 'Uploading…';
                try {
                    // Unique filename so Cloudinary doesn't overwrite other orgs' logos.
                    const uniqueName = `hh_logo_${type}_${editingOrgId || 'new'}_${Date.now()}.jpg`;
                    const croppedFile = new File([croppedBlob], uniqueName, { type: 'image/jpeg', lastModified: Date.now() });

                    const fd = new FormData();
                    fd.append('file', croppedFile);
                    fd.append('upload_preset', LOGO_UPLOAD_PRESET);   // ← new preset
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
                    if (!res.ok) throw new Error('Cloudinary upload failed.');
                    const j = await res.json();
                    const newUrl = j.secure_url;

                    if (previousUrl && previousUrl !== newUrl) {
                        const oldPid = getCloudinaryPublicId(previousUrl);
                        if (oldPid) await deleteCloudinaryAsset(oldPid);
                    }

                    HH_STATE[type].editorOrg.LogoUrl = newUrl;

                    const preview = document.getElementById(`logoPreview_${type}`);
                    if (preview) {
                        preview.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = `${newUrl}?v=${Date.now()}`;
                        img.setAttribute('data-logo-for', String(HH_STATE[type].editorOrg.id || 'new'));
                        img.alt = '';
                        preview.appendChild(img);
                    }
                    if (nameEl) nameEl.textContent = getFileNameFromUrl(newUrl);

                    console.log(`[HelpingHand] uploaded new logo for org ${editingOrgId}: ${newUrl}`);
                } catch (err) {
                    console.error(err);
                    alert('Logo upload failed: ' + err.message);
                    if (nameEl) nameEl.textContent = getFileNameFromUrl(previousUrl);
                }
            });
        });
    }

    renderStaffBlock(type);
    if (type === 'internal') renderRolesBlock(type);
    else                     renderBenefBlock(type);
    renderActivityBlock(type);
}

// ============================================================================
// LOGO CROPPER (square)
// ============================================================================
let hhActiveCropper = null;

function openLogoCropper(file, onCropApplied) {
    const modal = document.getElementById('HHCropperModal');
    const image = document.getElementById('hhCropImage');
    const btnCancel = document.getElementById('hhCropCancel');
    const btnCancelX = document.getElementById('hhCropCancelX');
    const btnApply = document.getElementById('hhCropApply');

    if (typeof Cropper === 'undefined') { alert('Cropper.js not loaded.'); return; }
    if (hhActiveCropper) { hhActiveCropper.destroy(); hhActiveCropper = null; }

    const reader = new FileReader();
    reader.onload = (e) => {
        image.onload = () => {
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    hhActiveCropper = new Cropper(image, {
                        aspectRatio: 1,
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
                        ready() { hhActiveCropper.resize(); }
                    });
                });
            });
        };
        image.onerror = () => alert('Image failed to load.');
        image.src = e.target.result;
    };
    reader.onerror = () => alert('Failed to read file.');
    reader.readAsDataURL(file);

    const close = () => {
        modal.style.display = 'none';
        if (hhActiveCropper) { hhActiveCropper.destroy(); hhActiveCropper = null; }
    };

    btnCancel.onclick = close;
    btnCancelX.onclick = close;

    btnApply.onclick = () => {
        if (!hhActiveCropper) return;
        const canvas = hhActiveCropper.getCroppedCanvas({
            width: LOGO_CROP_SIZE,
            height: LOGO_CROP_SIZE,
            imageSmoothingQuality: 'high'
        });
        if (!canvas) { alert('Crop failed.'); close(); return; }
        canvas.toBlob((blob) => {
            if (!blob) { alert('Failed to generate image.'); close(); return; }
            close();
            onCropApplied(blob);
        }, 'image/jpeg', 0.92);
    };
}

// ============================================================================
// EDITOR — CHILD BLOCKS
// ============================================================================
function renderStaffBlock(type) {
    const host = document.getElementById(`childBlock_staff_${type}`);
    if (!host) return;
    const staff = HH_STATE[type].editorChildren.staff;

    let rows = '';
    staff.forEach((s, i) => {
        rows += `
            <div class="HHChildRow" data-idx="${i}" data-rowid="${s.id||''}">
                <div class="HHChildCell HHChildRole">
                    <input type="text" class="child_StaffRole" data-i="${i}"
                           list="hhDesignationList"
                           value="${escapeHtml(s.Role||'')}"
                           placeholder="Type or pick a role" />
                </div>
                <div class="HHChildCell HHChildPerson">
                    <button type="button" class="HHPickerBtn" data-i="${i}" data-which="staff">
                        ${s.StaffNameSnapshot ? escapeHtml(s.StaffNameSnapshot) : 'Select staff…'}
                    </button>
                    <input type="hidden" class="child_StaffID" value="${s.StaffID||''}" />
                    <input type="hidden" class="child_StaffNameSnapshot" value="${escapeHtml(s.StaffNameSnapshot||'')}" />
                </div>
                <div class="HHChildCell HHChildFlag">
                    <label><input type="checkbox" class="child_IsPrimary" ${(s.IsPrimary||'No')==='Yes'?'checked':''}/> Primary</label>
                </div>
                <button type="button" class="HHChildRemove" data-i="${i}" data-which="staff">✕</button>
            </div>`;
    });

    host.innerHTML = `
        <div class="HHChildBlock">
            <div class="HHChildHead">Patrons / In-charge / Contact Persons</div>
            <div class="HHChildRows">${rows}</div>
            <button type="button" class="HHGhostBtn" data-add="staff">+ Add Staff</button>
        </div>`;
    bindChildBlockEvents(host, type);
}

function renderRolesBlock(type) {
    const host = document.getElementById(`childBlock_members_${type}`);
    if (!host) return;
    const roles = HH_STATE[type].editorChildren.roles;

    let rows = '';
    roles.forEach((r, i) => {
        rows += `
            <div class="HHChildRow" data-idx="${i}" data-rowid="${r.id||''}">
                <div class="HHChildCell HHChildRole">
                    <input type="text" class="child_Role" data-i="${i}"
                           list="hhDesignationList"
                           value="${escapeHtml(r.Role||'')}"
                           placeholder="Type or pick a role" />
                </div>
                <div class="HHChildCell HHChildPerson">
                    <button type="button" class="HHPickerBtn" data-i="${i}" data-which="roles">
                        ${r.StudentNameSnapshot ? escapeHtml(r.StudentNameSnapshot) : 'Select student…'}
                    </button>
                    <input type="hidden" class="child_StudentID" value="${r.StudentID||''}" />
                    <input type="hidden" class="child_StudentNameSnapshot" value="${escapeHtml(r.StudentNameSnapshot||'')}" />
                </div>
                <div class="HHChildCell HHChildYear">
                    <input type="number" class="child_AcademicYear" data-i="${i}" value="${escapeHtml(r.AcademicYear||'')}" placeholder="Year" />
                </div>
                <button type="button" class="HHChildRemove" data-i="${i}" data-which="roles">✕</button>
            </div>`;
    });

    host.innerHTML = `
        <div class="HHChildBlock">
            <div class="HHChildHead">Working Body (Students)</div>
            <div class="HHChildRows">${rows}</div>
            <button type="button" class="HHGhostBtn" data-add="roles">+ Add Member</button>
        </div>`;
    bindChildBlockEvents(host, type);
}

function renderBenefBlock(type) {
    const host = document.getElementById(`childBlock_benef_${type}`);
    if (!host) return;
    const benef = HH_STATE[type].editorChildren.beneficiaries;

    let rows = '';
    benef.forEach((b, i) => {
        rows += `
            <div class="HHChildRow" data-idx="${i}" data-rowid="${b.id||''}">
                <div class="HHChildCell HHChildRole">
                    <input type="text" class="child_SupportType" data-i="${i}"
                           list="hhDesignationList"
                           value="${escapeHtml(b.SupportType||'')}"
                           placeholder="Type or pick support" />
                </div>
                <div class="HHChildCell HHChildPerson">
                    <button type="button" class="HHPickerBtn" data-i="${i}" data-which="beneficiaries">
                        ${b.StudentNameSnapshot ? escapeHtml(b.StudentNameSnapshot) : 'Select student…'}
                    </button>
                    <input type="hidden" class="child_StudentID" value="${b.StudentID||''}" />
                    <input type="hidden" class="child_StudentNameSnapshot" value="${escapeHtml(b.StudentNameSnapshot||'')}" />
                </div>
                <div class="HHChildCell HHChildNotes">
                    <input type="text" class="child_Notes" data-i="${i}" value="${escapeHtml(b.Notes||'')}" placeholder="Notes" />
                </div>
                <button type="button" class="HHChildRemove" data-i="${i}" data-which="beneficiaries">✕</button>
            </div>`;
    });

    host.innerHTML = `
        <div class="HHChildBlock">
            <div class="HHChildHead">Beneficiaries (Students)</div>
            <div class="HHChildRows">${rows}</div>
            <button type="button" class="HHGhostBtn" data-add="beneficiaries">+ Add Beneficiary</button>
        </div>`;
    bindChildBlockEvents(host, type);
}

function renderActivityBlock(type) {
    const host = document.getElementById(`childBlock_activity_${type}`);
    if (!host) return;
    const isInternal = type === 'internal';
    const items = HH_STATE[type].editorChildren.activities;
    const kind = isInternal ? 'activity' : 'program';
    const label = isInternal ? 'Activities' : 'Programs';
    const addLabel = isInternal ? 'Add Activity' : 'Add Program';

    let rows = '';
    items.forEach((a, i) => {
        rows += `
            <div class="HHChildRow HHChildRowActivity" data-idx="${i}" data-rowid="${a.id||''}">
                <div class="HHChildCell HHChildTitle">
                    <input type="text" class="child_Title" data-i="${i}" value="${escapeHtml(a.Title||'')}" placeholder="Title" />
                </div>
                <div class="HHChildCell HHChildDesc">
                    <input type="text" class="child_Description" data-i="${i}" value="${escapeHtml(a.Description||'')}" placeholder="Description" />
                </div>
                <div class="HHChildCell HHChildYear">
                    <input type="text" class="child_StartYear" data-i="${i}" value="${escapeHtml(a.StartYear||'')}" placeholder="Start" />
                </div>
                <div class="HHChildCell HHChildYear">
                    <input type="text" class="child_EndYear" data-i="${i}" value="${escapeHtml(a.EndYear||'')}" placeholder="End" />
                </div>
                <button type="button" class="HHChildRemove" data-i="${i}" data-which="activities">✕</button>
            </div>`;
    });

    host.innerHTML = `
        <div class="HHChildBlock">
            <div class="HHChildHead">${label}</div>
            <div class="HHChildRows" data-kind="${kind}">${rows}</div>
            <button type="button" class="HHGhostBtn" data-add="activities">+ ${addLabel}</button>
        </div>`;
    bindChildBlockEvents(host, type);
}

// ============================================================================
// CHILD BLOCK EVENTS
// ============================================================================
function bindChildBlockEvents(host, type) {
    host.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
            const which = btn.dataset.add;
            syncOneChildBlock(type, which);
            const ch = HH_STATE[type].editorChildren;
            if (which === 'staff')              ch.staff.push({ Role: '', StaffID: null, StaffNameSnapshot: '', IsPrimary: 'No' });
            else if (which === 'roles')         ch.roles.push({ Role: '', StudentID: null, StudentNameSnapshot: '', AcademicYear: null });
            else if (which === 'beneficiaries') ch.beneficiaries.push({ SupportType: '', StudentID: null, StudentNameSnapshot: '', Notes: '' });
            else if (which === 'activities')    ch.activities.push({ Title: '', Description: '', StartYear: '', EndYear: '', Kind: type === 'internal' ? 'activity' : 'program' });

            if (which === 'staff')              renderStaffBlock(type);
            else if (which === 'roles')         renderRolesBlock(type);
            else if (which === 'beneficiaries') renderBenefBlock(type);
            else if (which === 'activities')    renderActivityBlock(type);
        });
    });

    host.querySelectorAll('.HHChildRemove').forEach(btn => {
        btn.addEventListener('click', () => {
            const which = btn.dataset.which;
            const idx = parseInt(btn.dataset.i, 10);
            syncOneChildBlock(type, which);
            const ch = HH_STATE[type].editorChildren;
            if (which === 'staff')              ch.staff.splice(idx, 1);
            else if (which === 'roles')         ch.roles.splice(idx, 1);
            else if (which === 'beneficiaries') ch.beneficiaries.splice(idx, 1);
            else if (which === 'activities')    ch.activities.splice(idx, 1);

            if (which === 'staff')              renderStaffBlock(type);
            else if (which === 'roles')         renderRolesBlock(type);
            else if (which === 'beneficiaries') renderBenefBlock(type);
            else if (which === 'activities')    renderActivityBlock(type);
        });
    });

    host.querySelectorAll('.HHPickerBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.i, 10);
            const which = btn.dataset.which;
            syncOneChildBlock(type, which);
            if (which === 'staff') {
                openStaffPicker((staff) => {
                    const row = HH_STATE[type].editorChildren.staff[idx];
                    if (!row) return;
                    row.StaffID = staff.id;
                    row.StaffNameSnapshot = `${staff.Name}${staff.Designation ? ' — ' + staff.Designation : ''}`;
                    renderStaffBlock(type);
                });
            } else {
                openStudentPicker((student) => {
                    const list = which === 'roles'
                        ? HH_STATE[type].editorChildren.roles
                        : HH_STATE[type].editorChildren.beneficiaries;
                    const row = list[idx];
                    if (!row) return;
                    row.StudentID = student.id;
                    row.StudentNameSnapshot = `${student.StudentName} (Roll ${student.RollNo ?? '-'}, Class ${student.ClassName || ''})`;
                    if (which === 'roles') renderRolesBlock(type);
                    else                   renderBenefBlock(type);
                });
            }
        });
    });

    host.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
            const row = el.closest('.HHChildRow');
            if (!row) return;
            const i = parseInt(row.dataset.idx, 10);
            const ch = HH_STATE[type].editorChildren;

            if (el.classList.contains('child_StaffRole'))       ch.staff[i]         && (ch.staff[i].Role = el.value);
            if (el.classList.contains('child_IsPrimary'))       ch.staff[i]         && (ch.staff[i].IsPrimary = el.checked ? 'Yes' : 'No');
            if (el.classList.contains('child_Role'))            ch.roles[i]         && (ch.roles[i].Role = el.value);
            if (el.classList.contains('child_AcademicYear'))    ch.roles[i]         && (ch.roles[i].AcademicYear = parseInt(el.value, 10) || null);
            if (el.classList.contains('child_SupportType'))     ch.beneficiaries[i] && (ch.beneficiaries[i].SupportType = el.value);
            if (el.classList.contains('child_Notes'))           ch.beneficiaries[i] && (ch.beneficiaries[i].Notes = el.value);
            if (el.classList.contains('child_Title'))           ch.activities[i]    && (ch.activities[i].Title = el.value);
            if (el.classList.contains('child_Description'))     ch.activities[i]    && (ch.activities[i].Description = el.value);
            if (el.classList.contains('child_StartYear'))       ch.activities[i]    && (ch.activities[i].StartYear = el.value);
            if (el.classList.contains('child_EndYear'))         ch.activities[i]    && (ch.activities[i].EndYear = el.value);
        });
        el.addEventListener('change', () => el.dispatchEvent(new Event('input')));
    });
}

function syncOneChildBlock(type, which) {
    const ch = HH_STATE[type].editorChildren;
    const mountId = which === 'staff'          ? `childBlock_staff_${type}`
                  : which === 'roles'          ? `childBlock_members_${type}`
                  : which === 'beneficiaries'  ? `childBlock_benef_${type}`
                  : `childBlock_activity_${type}`;
    const mount = document.getElementById(mountId);
    if (!mount) return;

    mount.querySelectorAll('.HHChildRow').forEach(rowEl => {
        const i = parseInt(rowEl.dataset.idx, 10);
        if (which === 'staff') {
            const row = ch.staff[i]; if (!row) return;
            row.Role = rowEl.querySelector('.child_StaffRole')?.value || row.Role;
            const stId = rowEl.querySelector('.child_StaffID')?.value;
            if (stId !== undefined) row.StaffID = parseInt(stId, 10) || null;
            const snap = rowEl.querySelector('.child_StaffNameSnapshot')?.value;
            if (snap !== undefined) row.StaffNameSnapshot = snap;
            row.IsPrimary = rowEl.querySelector('.child_IsPrimary')?.checked ? 'Yes' : 'No';
        } else if (which === 'roles') {
            const row = ch.roles[i]; if (!row) return;
            row.Role = rowEl.querySelector('.child_Role')?.value || row.Role;
            const stId = rowEl.querySelector('.child_StudentID')?.value;
            if (stId !== undefined) row.StudentID = parseInt(stId, 10) || null;
            const snap = rowEl.querySelector('.child_StudentNameSnapshot')?.value;
            if (snap !== undefined) row.StudentNameSnapshot = snap;
            const yr = rowEl.querySelector('.child_AcademicYear')?.value;
            if (yr !== undefined) row.AcademicYear = parseInt(yr, 10) || null;
        } else if (which === 'beneficiaries') {
            const row = ch.beneficiaries[i]; if (!row) return;
            row.SupportType = rowEl.querySelector('.child_SupportType')?.value || row.SupportType;
            const stId = rowEl.querySelector('.child_StudentID')?.value;
            if (stId !== undefined) row.StudentID = parseInt(stId, 10) || null;
            const snap = rowEl.querySelector('.child_StudentNameSnapshot')?.value;
            if (snap !== undefined) row.StudentNameSnapshot = snap;
            const notes = rowEl.querySelector('.child_Notes')?.value;
            if (notes !== undefined) row.Notes = notes;
        } else if (which === 'activities') {
            const row = ch.activities[i]; if (!row) return;
            row.Title = rowEl.querySelector('.child_Title')?.value || row.Title;
            row.Description = rowEl.querySelector('.child_Description')?.value || row.Description;
            row.StartYear = rowEl.querySelector('.child_StartYear')?.value || row.StartYear;
            row.EndYear = rowEl.querySelector('.child_EndYear')?.value || row.EndYear;
        }
    });
}

// ============================================================================
// PICKERS
// ============================================================================
function openStudentPicker(onPick) {
    const modal = document.createElement('div');
    modal.className = 'HHModalOverlay';
    modal.innerHTML = `
        <div class="HHModal">
            <div class="HHModalHead">
                <span>Select Student</span>
                <button class="HHModalClose">✕</button>
            </div>
            <div class="HHModalBody">
                <div class="HHModalFilters">
                    <select id="pickStudentClass">
                        <option value="">All classes</option>
                        ${HH_STATE.internal.classes.map(c => `<option value="${c.id}">${escapeHtml(c.ClassName)}</option>`).join('')}
                    </select>
                    <input type="text" id="pickStudentSearch" placeholder="Type a name or regd. no." />
                </div>
                <div class="HHModalResults" id="pickStudentResults">
                    <div class="HHEmpty">Start typing to search…</div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('.HHModalClose').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    const searchInput = modal.querySelector('#pickStudentSearch');
    const classSelect = modal.querySelector('#pickStudentClass');
    const results = modal.querySelector('#pickStudentResults');
    let debounceTimer = null;

    const doSearch = async () => {
        const q = searchInput.value.trim();
        const classId = classSelect.value ? parseInt(classSelect.value, 10) : null;
        if (!q && !classId) { results.innerHTML = '<div class="HHEmpty">Type or pick a class.</div>'; return; }

        results.innerHTML = '<div class="HHEmpty">Searching…</div>';
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
            if (list.length === 0) { results.innerHTML = '<div class="HHEmpty">No matches.</div>'; return; }

            const classMap = {};
            HH_STATE.internal.classes.forEach(c => { classMap[c.id] = c.ClassName; });

            results.innerHTML = list.map(s => `
                <div class="HHModalResultRow" data-id="${s.id}">
                    <div class="HHModalResultName">${escapeHtml(s.StudentName)}</div>
                    <div class="HHModalResultMeta">
                        Roll ${escapeHtml(s.RollNo ?? '-')}
                        · Class ${escapeHtml(classMap[s.ClassID] || '-')}
                        · ${escapeHtml(s.EducationalYear ?? '')}
                    </div>
                </div>`).join('');

            results.querySelectorAll('.HHModalResultRow').forEach(rowEl => {
                rowEl.addEventListener('click', () => {
                    const id = parseInt(rowEl.dataset.id, 10);
                    const picked = list.find(x => x.id === id);
                    if (picked) picked.ClassName = classMap[picked.ClassID] || '';
                    onPick(picked);
                    close();
                });
            });
        } catch (e) {
            results.innerHTML = `<div class="HHEmpty">Search failed: ${escapeHtml(e.message)}</div>`;
        }
    };

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doSearch, 250);
    });
    classSelect.addEventListener('change', doSearch);
    searchInput.focus();
}

function openStaffPicker(onPick) {
    const modal = document.createElement('div');
    modal.className = 'HHModalOverlay';
    modal.innerHTML = `
        <div class="HHModal">
            <div class="HHModalHead">
                <span>Select Staff / Teacher</span>
                <button class="HHModalClose">✕</button>
            </div>
            <div class="HHModalBody">
                <div class="HHModalFilters">
                    <input type="text" id="pickStaffSearch" placeholder="Type a name…" />
                </div>
                <div class="HHModalResults" id="pickStaffResults"></div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('.HHModalClose').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    const searchInput = modal.querySelector('#pickStaffSearch');
    const results = modal.querySelector('#pickStaffResults');
    const list = HH_STATE.internal.staffCache;

    if (!list || list.length === 0) {
        results.innerHTML = '<div class="HHEmpty">Staff list unavailable.</div>';
        return;
    }

    const render = (filter) => {
        const q = (filter || '').toLowerCase().trim();
        const filtered = q
            ? list.filter(s => (s.Name || '').toLowerCase().includes(q))
            : list;
        if (filtered.length === 0) { results.innerHTML = '<div class="HHEmpty">No matches.</div>'; return; }
        results.innerHTML = filtered.slice(0, 60).map(s => `
            <div class="HHModalResultRow" data-id="${s.id}">
                <div class="HHModalResultName">${escapeHtml(s.Name || '(unnamed)')}</div>
                <div class="HHModalResultMeta">${escapeHtml(s.Designation || '')}</div>
            </div>`).join('');
        results.querySelectorAll('.HHModalResultRow').forEach(rowEl => {
            rowEl.addEventListener('click', () => {
                const id = parseInt(rowEl.dataset.id, 10);
                const picked = list.find(x => x.id === id);
                if (picked) { onPick(picked); close(); }
            });
        });
    };

    searchInput.addEventListener('input', () => render(searchInput.value));
    render('');
    searchInput.focus();
}

// ============================================================================
// SAVE
// ============================================================================
async function saveEditor(type) {
    const state = HH_STATE[type];
    const org = state.editorOrg;
    if (!org) return;

    org.OrganizationName      = document.getElementById('field_OrganizationName').value.trim();
    org.EstablishedYear       = document.getElementById('field_EstablishedYear').value.trim();
    org.DisplayOrder          = parseInt(document.getElementById('field_DisplayOrder').value, 10) || 0;
    org.IsActive              = document.getElementById('field_IsActive').value;
    org.IsFeatured            = document.getElementById('field_IsFeatured').value;
    org.Description           = document.getElementById('field_Description').value;
    org.Notes                 = document.getElementById('field_Notes').value;
    if (type === 'external') {
        org.FundingOrSupportType  = document.getElementById('field_FundingOrSupportType')?.value || '';
        org.TargetedStudentsNotes = document.getElementById('field_TargetedStudentsNotes')?.value || '';
    }

    if (!org.OrganizationName) { alert('Organization Name is required.'); return; }

    const ch = state.editorChildren;
    ch.staff         = ch.staff.filter(s => s.StaffID || (s.StaffNameSnapshot || '').trim());
    ch.roles         = ch.roles.filter(r => r.StudentID);
    ch.beneficiaries = ch.beneficiaries.filter(b => b.StudentID);
    ch.activities    = ch.activities.filter(a => (a.Title || '').trim());

    const saveBtn = document.getElementById(`hhSaveBtn_${type}`);
    const originalText = saveBtn ? saveBtn.textContent : '';
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '💾 Saving…'; }
    showStatus(type, 'Saving…', 'info');

    try {
        let orgId = org.id;
        const orgPayload = {
            Type: type,
            OrganizationName: org.OrganizationName,
            EstablishedYear: org.EstablishedYear,
            Description: org.Description,
            Notes: org.Notes,
            LogoUrl: org.LogoUrl,
            DisplayOrder: org.DisplayOrder,
            IsActive: org.IsActive,
            IsFeatured: org.IsFeatured,
            FundingOrSupportType: org.FundingOrSupportType || null,
            TargetedStudentsNotes: org.TargetedStudentsNotes || null,
            updated_at: new Date().toISOString()
        };

        if (orgId) {
            const { error } = await supabaseClient.from(HH_TABLE).update(orgPayload).eq('id', orgId);
            if (error) throw error;
        } else {
            const { data, error } = await supabaseClient.from(HH_TABLE).insert(orgPayload).select('id').single();
            if (error) throw error;
            orgId = data.id;
            org.id = orgId;
        }

        await Promise.all([
            supabaseClient.from(HH_STAFF_TABLE).delete().eq('OrganizationID', orgId),
            supabaseClient.from(HH_ROLE_TABLE).delete().eq('OrganizationID', orgId),
            supabaseClient.from(HH_ACT_TABLE).delete().eq('OrganizationID', orgId),
            supabaseClient.from(HH_BENEF_TABLE).delete().eq('OrganizationID', orgId)
        ]);

        if (ch.staff.length) {
            const payload = ch.staff.map(s => ({
                OrganizationID: orgId, StaffID: s.StaffID || null,
                StaffNameSnapshot: s.StaffNameSnapshot || null,
                Role: s.Role || null, IsPrimary: s.IsPrimary || 'No'
            }));
            const { error } = await supabaseClient.from(HH_STAFF_TABLE).insert(payload);
            if (error) throw error;
        }
        if (ch.roles.length) {
            const payload = ch.roles.map(r => ({
                OrganizationID: orgId, StudentID: r.StudentID || null,
                StudentNameSnapshot: r.StudentNameSnapshot || null,
                Role: r.Role || null, AcademicYear: r.AcademicYear || null
            }));
            const { error } = await supabaseClient.from(HH_ROLE_TABLE).insert(payload);
            if (error) throw error;
        }
        if (ch.activities.length) {
            const payload = ch.activities.map(a => ({
                OrganizationID: orgId, Title: a.Title || null,
                Description: a.Description || null,
                StartYear: a.StartYear || null, EndYear: a.EndYear || null,
                Kind: a.Kind || (type === 'internal' ? 'activity' : 'program')
            }));
            const { error } = await supabaseClient.from(HH_ACT_TABLE).insert(payload);
            if (error) throw error;
        }
        if (ch.beneficiaries.length) {
            const payload = ch.beneficiaries.map(b => ({
                OrganizationID: orgId, StudentID: b.StudentID || null,
                StudentNameSnapshot: b.StudentNameSnapshot || null,
                SupportType: b.SupportType || null, Notes: b.Notes || null
            }));
            const { error } = await supabaseClient.from(HH_BENEF_TABLE).insert(payload);
            if (error) throw error;
        }

        showStatus(type, '✅ Saved.', 'success');
        console.log(`[HelpingHand] saved org ${orgId} with LogoUrl=${org.LogoUrl}`);
        closeEditor(type);
        await loadAll(type);
        alert('✅ Saved successfully.');
    } catch (e) {
        console.error('Save error:', e);
        showStatus(type, `❌ Save failed: ${e.message}`, 'error');
        alert('❌ Save failed: ' + e.message);
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = originalText || '💾 Save Organization'; }
    }
}
window.saveEditor = saveEditor;

// ============================================================================
// DELETE
// ============================================================================
async function deleteOrg(type, id) {
    const org = HH_STATE[type].orgs.find(o => o.id === id);
    if (!org) return;
    if (!confirm(`Delete "${org.OrganizationName}" and all its details?\nThis cannot be undone.`)) return;
    try {
        if (org.LogoUrl) {
            const pid = getCloudinaryPublicId(org.LogoUrl);
            if (pid) await deleteCloudinaryAsset(pid);
        }
        const { error } = await supabaseClient.from(HH_TABLE).delete().eq('id', id);
        if (error) throw error;
        showStatus(type, '✅ Deleted.', 'success');
        await loadAll(type);
    } catch (e) {
        console.error('Delete error:', e.message);
        alert('Delete failed: ' + e.message);
    }
}
window.deleteOrg = deleteOrg;

// ============================================================================
// BOOT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadAll('internal');
    loadAll('external');
});