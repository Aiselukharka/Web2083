if (typeof supabaseClient === 'undefined') {
    console.error("Supabase client not found. Make sure SupabaseConfig.js is loaded first.");
}
// -------------------- CLOUDINARY --------------------
const CLOUD_NAME = "dcdwpdnyp";

// -------------------- PROTECTION FORM UNAUTHORIZED ACCESS --------------------
protectAdminPage();
async function protectAdminPage() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();
    if (error || !session) {
      showCustomDialog1("Unauthorized", "Please login first.", "OK", function(){});
        window.location.replace("LoginIndex.html");
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
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "AdminEditBox": "../AdminDashboardPage/AdminDashboardIndex.html"
    };   
    const selectedEdit = pageMap[this.value];
    if (selectedEdit) {
        window.location.href = selectedEdit;
    }
});

// -------------------- DATE --------------------
const dateBox = document.getElementById('DateBox');
dateBox.innerText =
  AD2BS(new Date()) +
  " (" +
  new Date().toISOString().split('T')[0] +
  ")";

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

// Select School Logo File Elements
const SelectLogoFile = document.getElementById('SelectLogoFile');
const btnSelectLogoFile = document.getElementById('btnChooseLogoFile');
const LogoNameDisplay = document.getElementById('AboutUsLogoName');

btnSelectLogoFile.addEventListener('click', function() {
    SelectLogoFile.click(); 
});

SelectLogoFile.addEventListener('change', function() {
    if (SelectLogoFile.files && SelectLogoFile.files.length > 0) {
        const selectedFileName = SelectLogoFile.files[0].name;
        LogoNameDisplay.textContent = selectedFileName;
    } else {
        LogoNameDisplay.textContent = "No file chosen";
    }
});

// File input listeners for all photo inputs
document.querySelectorAll('.ImportantContactFourthBoxes input[type="file"]').forEach(function(fileInput) {
    fileInput.addEventListener('change', function() {
        const nameDisplay = this.parentElement.querySelector('div');
        if (this.files && this.files.length > 0) {
            nameDisplay.textContent = this.files[0].name;
        } else {
            nameDisplay.textContent = "No file chosen";
        }
    });
});

// File input listeners for slider inputs
document.querySelectorAll('.SliderPictureSelectBoxes .InnerBoxes input[type="file"]').forEach(function(fileInput) {
    fileInput.addEventListener('change', function() {
        const nameDisplay = this.parentElement.querySelector('div');
        if (this.files && this.files.length > 0) {
            nameDisplay.textContent = this.files[0].name;
        } else {
            nameDisplay.textContent = "No file chosen";
        }
    });
});

// Load Data From Supabase
async function loadAboutUsData() {
    try {
        const { data, error } = await supabaseClient
            .from('AboutSchoolTable')
            .select('Name, Value, FileName');

        if (error) {
            console.error('Error fetching data from Supabase:', error.message);
            return;
        }

        if (data) {
            data.forEach(row => {
                // 1. Handle File inputs / Displaying File Names
                if (row.FileName) {
                    let targetDivId = '';

                    if (row.Name === 'SchoolLogo') {
                        targetDivId = 'AboutUsLogoName';
                    } else if (row.Name.endsWith('Photo')) {
                        targetDivId = `${row.Name}Name`;
                    } else if (row.Name.startsWith('SliderPicture')) {
                        const sliderIndex = row.Name.replace('SliderPicture', '');
                        targetDivId = `SliderPictureName_${sliderIndex}`;
                    }

                    const displayDiv = document.getElementById(targetDivId);
                    if (displayDiv) {
                        displayDiv.textContent = row.FileName;
                    }
                }

                // 2. Handle standard Text inputs
                let inputId = row.Name;
                
                if (row.Name.startsWith('SliderCredential')) {
                    const index = row.Name.replace('SliderCredential', '');
                    inputId = `SliderCredential${index}`;
                }

                const inputElement = document.getElementById(inputId);
                if (inputElement && inputElement.type !== 'file') {
                    inputElement.value = row.Value || '';
                }
            });
            console.log('About Us data and filenames populated successfully!');
        }
    } catch (err) {
        console.error('Unexpected error loading data:', err);
    }
}
// Run on page load
document.addEventListener('DOMContentLoaded', loadAboutUsData);

// --- HELPER 1: Client-side Image Resizer ---
function resizeImage(file, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas conversion to Blob failed'));
                }, file.type, 0.9);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// --- HELPER 2: Cloudinary Direct Uploader ---
async function uploadToCloudinary(fileBlob, originalFileName, customPublicId) {
    const CLOUD_NAME = 'dcdwpdnyp'; 
    const UPLOAD_PRESET = 'AdminFileUploadPreset';
    const FOLDER_NAME = 'AdminMaterials';          
    
    const formData = new FormData();
    formData.append('file', fileBlob, originalFileName);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const cleanPublicId = customPublicId.replace(/\.[^/.]+$/, "");
    const fullPublicId = `${FOLDER_NAME}/${cleanPublicId}`;
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
    const freshUrlWithVersion = `${data.secure_url}?t=${new Date().getTime()}`;
    
    return freshUrlWithVersion; 
}

// --- HELPER 3: Extract Public ID and Call delete-book Edge Function ---
async function deleteOldCloudinaryFile(oldUrl) {
    if (!oldUrl || !oldUrl.includes('/upload/')) return;
    try {
        const cleanUrl = oldUrl.split('?')[0];
        const parts = cleanUrl.split('/upload/');
        const pathAfterUpload = parts[1]; 
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
        const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, ""); 

        console.log(`Sending Public ID to delete-admin-material Edge Function: "${publicId}"`);

        const { data, error } = await supabaseClient.functions.invoke('delete-admin-material', {
            body: { 
                publicId: publicId, 
                resourceType: "image" 
            }
        });
        
        if (error) {
            console.error("Supabase Edge Function transport layer error:", error);
            return;
        }

        console.log("Cloudinary API execution result:", data);
        
        if (data && data.result === "not found") {
            console.warn("⚠️ Cloudinary could not find that asset. Check API Key/Secret permissions.");
        } else if (data && data.result === "ok") {
            console.log("✨ Successfully wiped the asset from Cloudinary database storage!");
        }

    } catch (e) {
        console.error("Failed to execute old asset cleanup:", e);
    }
}

// --- MAIN FUNCTION: Save Everything ---
async function saveAboutUs() {
    const saveButton = document.getElementById('btnSaveAboutUs');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving Changes...';

    try {
        const fileConfigs = [
            { inputId: 'SelectLogoFile', dbName: 'SchoolLogo', divId: 'AboutUsLogoName', width: 100, height: 100 },
            { inputId: 'PrincipalPhotoFile', dbName: 'PrincipalPhoto', divId: 'PrincipalPhotoName', width: 300, height: 450 },
            { inputId: 'SMCHeadPhotoFile', dbName: 'SMCHeadPhoto', divId: 'SMCHeadPhotoName', width: 300, height: 450 },
            { inputId: 'VicePrincipalPhotoFile', dbName: 'VicePrincipalPhoto', divId: 'VicePrincipalPhotoName', width: 300, height: 450 },
            { inputId: 'AccountantPhotoFile', dbName: 'AccountantPhoto', divId: 'AccountantPhotoName', width: 300, height: 450 },
            { inputId: 'ExamHeadPhotoFile', dbName: 'ExamHeadPhoto', divId: 'ExamHeadPhotoName', width: 300, height: 450 },
            { inputId: 'ECAHeadPhotoFile', dbName: 'ECAHeadPhoto', divId: 'ECAHeadPhotoName', width: 300, height: 450 }
        ];

        for (let i = 1; i <= 10; i++) {
            fileConfigs.push({
                inputId: `selectSlider_${i}`, 
                dbName: `SliderPicture${i}`,
                divId: `SliderPictureName_${i}`,
                width: 1280,
                height: 720
            });
        }

        const updates = [];

        for (const config of fileConfigs) {
            const fileInput = document.getElementById(config.inputId);
            
            if (!fileInput) {
                console.warn(`⚠️ HTML Element with id="${config.inputId}" was NOT found on this page.`);
                continue;
            }

            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const selectedFile = fileInput.files[0];
                console.log(`🚀 File detected for ${config.dbName}! Name: ${selectedFile.name}, Size: ${selectedFile.size} bytes`);
                
                const { data: oldRecord } = await supabaseClient
                    .from('AboutSchoolTable')
                    .select('Value')
                    .eq('Name', config.dbName)
                    .maybeSingle();

                if (oldRecord && oldRecord.Value) {
                    console.log(`Found old URL to remove: ${oldRecord.Value}`);
                    await deleteOldCloudinaryFile(oldRecord.Value);
                }
                
                console.log(`Resizing ${selectedFile.name} to ${config.width}x${config.height}...`);
                const resizedBlob = await resizeImage(selectedFile, config.width, config.height);
                
                console.log(`Uploading resized blob to Cloudinary using preset: AdminFileUploadPreset...`);
                const cloudinaryUrl = await uploadToCloudinary(resizedBlob, selectedFile.name, config.divId);
                console.log(`✅ Cloudinary upload successful! New URL: ${cloudinaryUrl}`);
                
                updates.push({
                    Name: config.dbName,
                    Value: cloudinaryUrl,
                    FileName: selectedFile.name
                });
            }
        }

        // 2. Collect Standard Text Inputs
        const textFields = ['SchoolName', 'SchoolAddress', 'SchoolContact', 'SchoolEmail', 'SchoolWebsite'];
        textFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                updates.push({ Name: id, Value: element.value, FileName: null });
            }
        });

        // 2.5 Collect Special Contacts Text Fields (Names, Mobiles, Emails)
        const staffRoles = ['Principal', 'SMCHead', 'VicePrincipal', 'Accountant', 'ExamHead', 'ECAHead'];
        const metadataTypes = ['Name', 'Contact', 'Email'];

        staffRoles.forEach(role => {
            metadataTypes.forEach(type => {
                const inputId = `${role}${type}`;
                const element = document.getElementById(inputId);
                if (element) {
                    updates.push({
                        Name: inputId,
                        Value: element.value,
                        FileName: null
                    });
                } else {
                    console.warn(`⚠️ Expected metadata input id="${inputId}" was not found in the HTML.`);
                }
            });
        });

        // 3. Collect Slider Credentials
        for (let i = 1; i <= 10; i++) {
            const credentialInput = document.getElementById(`SliderCredential${i}`);
            if (credentialInput) {
                updates.push({
                    Name: `SliderCredential${i}`,
                    Value: credentialInput.value,
                    FileName: null
                });
            }
        }

        // 4. Collect Social Media URLs
        const socialMediaPlatforms = ['Facebook', 'TikTok', 'Instagram', 'WhatsApp', 'YouTube'];
        socialMediaPlatforms.forEach(platform => {
            const mediaInput = document.getElementById(`${platform}Url`);
            if (mediaInput) {
                updates.push({
                    Name: `${platform}Url`,
                    Value: mediaInput.value,
                    FileName: null
                });
            }
        });        

        // 5. Save everything to Supabase via Upsert
        console.log("Final payload compilation about to write to Supabase:", updates);
        for (const rowData of updates) {
            if (rowData.Name === 'SchoolLogo') {
                console.log("Sending this exact record to Supabase for SchoolLogo:", rowData);
            }
            const { error } = await supabaseClient
                .from('AboutSchoolTable')
                .upsert(rowData, { onConflict: 'Name' });
            if (error) {
                console.error(`❌ Error upserting row ${rowData.Name}:`, error.message);
                throw error;
            }
        }
        alert('All updates, credentials, and files saved successfully!');        
    } catch (error) {
        console.error('Error saving page modifications:', error);
        alert(`Failed to save details: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
    }
}

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