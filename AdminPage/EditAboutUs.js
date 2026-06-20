//Style Sheet for Edit About Us Page
const AboutUsStyleSheet = document.createElement('style');
AboutUsStyleSheet.textContent = `
#AboutUsEditBox{
    width: 100%;
    padding: clamp(1rem, 2vw, 3rem);
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
}
#EditAboutUsHead{
    width: 100%;
    text-align: center;
    font-size: clamp(1.4rem, 4vw, 6rem);
    font-weight: bold;
    margin-bottom: 1.1rem;
    color: #0000aa
}
.EditAboutUsBoxes {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;  
    margin: clamp(0.3rem, 1vw, 1.6rem) 0;  
  }
.EditAboutUsBoxes div {
    width: 30%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;    
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.EditAboutUsBoxes input {
    width: 70%;
    font-size: clamp(1.2rem, 2vw, 3rem);
    font-weight: bold;
    placeholder: "Enter School Name";
    padding: clamp(0.3rem, 1vw, 1.6rem);
}
#AddSocialMedisBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.SocialMediaMainBoxes{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #555555;
    background: linear-gradient(135deg, #cccccc, #eeeeee);
    padding: clamp(0.3rem, 1vw, 1.6rem);
    margin: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.UpperSocialMediaBoxes, .LowerSocialMediaBoxes{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.UpperSocialMediaBoxes label, .LowerSocialMediaBoxes label{
    flex: 0 0 30%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
    color: #000000;
    margin: clamp(0.3rem, 1vw, 1.6rem);
}
.UpperSocialMediaBoxes input, .LowerSocialMediaBoxes input{
    flex: 1 1 70%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
    color: #000000;
    margin: clamp(0.3rem, 1vw, 1.6rem);
}
#AboutUsLogoSelectBox{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: clamp(0.3rem, 1vw, 1.6rem) 0;
    border: 2px solid #333333;
    padding: clamp(0.3rem, 1vw, 2rem);
    background: linear-gradient(135deg, #ffaaff, #ffccff);
}
#AboutUsLogoSelectBox label{
    flex: 0 0 30%;
    box-sizing: border-box;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;  
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
}
#SelectLogoFile{ display: none; }
#btnChooseLogoFile{
    flex: 0 0 20%;
    box-sizing: border-box;
    background: linear-gradient(180deg, #00aa00, #00cc00, #00aa00);
    color: #ffffff;
    border-radius: 4vw;  
    font-size: clamp(1.2rem, 2vw, 3rem); 
    padding: clamp(0.3rem, 1vw, 1.6rem) 0; 
    font-weight: bold;
}
#AboutUsLogoName{
    flex: 1 1 200px;
    box-sizing: border-box;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;  
    padding: clamp(0.3rem, 1vw, 1.6rem);
    color: #0000aa;
}

#ImportantContactBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-item: center;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    margin: clamp(1rem, 2vw, 3rem) 0;
    border: 2px solid #333333;
    background: linear-gradient(135deg, #ffffaa, #cccc88);
}
#ImportantContactHead{
    width: 100%;
    box-sizing: border-box;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;  
    padding: clamp(0.3rem, 1vw, 1.6rem);
    color: #0000aa;
    text-align: center;
}
#AboutUsImportantContactBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
}
.ImportantContactBoxes{
    width: 100%;
    border: 2px solid #333333;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    margin: clamp(0.3rem, 1vw, 1.6rem);
    background: #ffffff;
}
.ImportantContactFirstBoxes, 
.ImportantContactSecondBoxes, 
.ImportantContactThirdBoxes, 
.ImportantContactFourthBoxes {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0.5rem 0;
}
.ImportantContactBoxes label {
    flex: 0 0 30%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 2rem);
    
}
.ImportantContactBoxes input {
    flex: 1 1 70%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 2rem);
}
.ImportantContactFourthBoxes input{
    display: none;
}
.ImportantContactFourthBoxes button{
    flex: 0 0 20%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 2rem);
    background: linear-gradient(180deg, #006600, #008800, #006600);
    color: #ffffff;
    border-radius: 4vw;
}
.ImportantContactFourthBoxes button:hover{
    background: linear-gradient(180deg, #004400, #006600, #004400);
    color: #ffff00;
}
.ImportantContactFourthBoxes div{
    width: 50%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 2rem);   
    color: #0000aa; 
}

#SocialMediaEditBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #333333;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    background: linear-gradient(135deg, #6666aa, #6666cc);
}
#AboutUsSocialMediaBox{
    width: 100%;
}
#SocialMediaHead{
    width: 100%;
    font-size: clamp(1rem, 2vw, 3rem);
    font-weight: bold;
    color: #0000aa;
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
    text-align: center;
}
.SocialMediaBoxes{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 2px solid #333333;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    background: linear-gradient(135deg, #cccccc, #eeeeee);
    margin: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.SocialMediaBoxes label{
    flex: 0 0 30%;
    font-size: clamp(1rem, 2vw, 4rem);
    padding: clamp(0.3rem, 1vw, 1.6rem);
    margin: clamp(1rem, 2vw, 3rem) 0;
}
.SocialMediaBoxes input{
    flex: 0 0 70%;
    font-size: clamp(1rem, 2vw, 4rem);
    padding: clamp(0.3rem, 1vw, 1.6rem);
    margin: clamp(1rem, 2vw, 3rem) 0;
}
#SliderPictureSelectBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    margin: clamp(1rem, 2vw, 3rem) 0;
    border: 2px solid #333333;
}
#SliderEditBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #333333;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    background: linear-gradient(135deg, #66aa66, #66cc66);
}
#AboutUsSliderBox{
    width: 100%;
}
#SliderPictureSelectHead{
    width: 100%;
    font-size: clamp(1rem, 2vw, 3rem);
    font-weight: bold;
    color: #0000aa;
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
    text-align: center;
}
.SliderPictureSelectBoxes{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #333333;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    background: linear-gradient(135deg, #cccccc, #eeeeee);
    margin: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.InnerBoxes{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.InnerBoxes label{
    flex: 0 0 30%;
    box-sizing: border-box;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;  
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.InnerBoxes input{
    display: none;
}
.InnerBoxes button{
    flex: 0 0 20%;
    box-sizing: border-box;
    background: linear-gradient(180deg, #004400, #006600, #004400);
    color: #ffffff;
    border-radius: 4vw;  
    font-size: clamp(1.2rem, 2vw, 3rem); 
    padding: clamp(0.3rem, 1vw, 1.6rem) 0; 
    font-weight: bold;
}
.InnerBoxes button:hover{
    background: linear-gradient(180deg, #002200, #004400, #002200);
    color: #ffff00;
}
.InnerBoxes div{
    width: 50%;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 1.6rem);
    color: #0000aa;
}
.SliderCredentialBoxes{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.SliderCredentialBoxes label{
    flex: 0 0 30%;
    box-sizing: border-box;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 1.6rem) 0;
}
.SliderCredentialBoxes input{
    flex: 1 1 70%;
    box-sizing: border-box;
    font-size: clamp(1rem, 2vw, 4rem);
    font-weight: bold;
    padding: clamp(0.3rem, 1vw, 1.6rem);
}
#btnSaveAboutUs {
    display: block;
    width: 50%;
    max-width: 400px;
    margin: clamp(1rem, 2vw, 3rem) auto !important;    
    font-size: clamp(1rem, 2vw, 3rem);
    font-weight: bold;
    background: linear-gradient(180deg, #000044, #000066, #000044);
    color: #ffffff;
    border-radius: 4vw;
    padding: clamp(0.3rem, 1vw, 1.6rem);
}
#btnSaveAboutUs:hover{
    background: linear-gradient(180deg, #000022, #000044, #000022);
    color: #ffff00;
}

`;
document.head.appendChild(AboutUsStyleSheet);

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

//Add Important Contacts
const AboutUsImportantContactContainer = document.getElementById('AboutUsImportantContactBox');
const ImportantContactList = ['Principal', 'SMCHead', 'VicePrincipal', 'Accountant', 'ExamHead', 'ECAHead'];

for (let i = 1; i <= 6; i++) {
    const role = ImportantContactList[i - 1];
    
    const blockHTML = `
        <div class="ImportantContactBoxes">
            <div class="ImportantContactFirstBoxes">
                <label>${role} Name:</label>
                <input type="text" id="${role}Name" placeholder="Enter ${role} Name"/>                
            </div>
            <div class="ImportantContactSecondBoxes">
                <label>${role} Contact:</label>
                <input type="text" id="${role}Contact" placeholder="Enter ${role} Contact"/>                
            </div>
            <div class="ImportantContactThirdBoxes">
                <label>${role} Email:</label>
                <input type="text" id="${role}Email" placeholder="Enter ${role} Email"/>                
            </div>
            <div class="ImportantContactFourthBoxes">
                <label>${role} Photo:</label>
                <input type="file" id="${role}PhotoFile" accept=".jpg, .jpeg, .png, .webp, .gif"/>
                <button type="button" id="btnSelect${role}Photo">Choose Photo</button>  
                <div id="${role}PhotoName">No file chosen</div> 
            </div>             
        </div>
    `;    
    AboutUsImportantContactContainer.insertAdjacentHTML('beforeend', blockHTML);
    
    const ImportantPhotoFile = document.getElementById(`${role}PhotoFile`);
    const btnAddImportantPhoto = document.getElementById(`btnSelect${role}Photo`);
    const ImportantPhotoName = document.getElementById(`${role}PhotoName`);
    
    btnAddImportantPhoto.addEventListener('click', function() {
        ImportantPhotoFile.click(); 
    });    
    ImportantPhotoFile.addEventListener('change', function() {
        if (ImportantPhotoFile.files && ImportantPhotoFile.files.length > 0) {
            const selectedFileName = ImportantPhotoFile.files[0].name;
            ImportantPhotoName.textContent = selectedFileName;
        } else {
            ImportantPhotoName.textContent = "No file chosen";
        }
    });
}

// Select Slider Pictures
const AboutUsSliderBoxContainer = document.getElementById('AboutUsSliderBox');
for (let i = 1; i <= 10; i++) {
    const blockHTML = `
        <div class="SliderPictureSelectBoxes" id="SliderPicureSelectBox_${i}">
            <div class="InnerBoxes">
                <label>Select Slider Picture ${i}:</label>
                <input type="file" id="selectSlider_${i}" accept=".jpg, .jpeg, .png, .webp, .gif"/>
                <button type="button">Choose File</button>
                <div id="SliderPictureName_${i}"></div>
            </div>
            <div class="SliderCredentialBoxes">
                <label>Write Credential ${i}:</label>
                <input type="text" id="SliderCredential${i}"/>                        
            </div>                    
        </div>
    `;    
    AboutUsSliderBoxContainer.insertAdjacentHTML('beforeend', blockHTML);
    const SelectSlider = document.getElementById(`selectSlider_${i}`);
    const btnSelectSlider = document.querySelector(`#SliderPicureSelectBox_${i} .InnerBoxes button`);
    const SliderPictureName = document.querySelector(`#SliderPicureSelectBox_${i} .InnerBoxes div`);
    btnSelectSlider.addEventListener('click', function() {
        SelectSlider.click(); 
    });
    SelectSlider.addEventListener('change', function() {
        if (SelectSlider.files && SelectSlider.files.length > 0) {
            const selectedFileName = SelectSlider.files[0].name;
            SliderPictureName.textContent = selectedFileName;
        } else {
            SliderPictureName.textContent = "No file chosen";
        }
    });
}

// Add Social Media Links
const AboutUsSocialMediaBoxContainer = document.getElementById('AboutUsSocialMediaBox');
const SocialMediaList = ['Facebook', 'TikTok', 'Instagram', 'WhatsApp', 'YouTube'];
for (let i = 1; i <= 5; i++) {
    const blockHTML = `
        <div class="SocialMediaBoxes">        
            <label>${SocialMediaList[i - 1]}:</label>
            <input type="text" id="${SocialMediaList[i-1]}Url" placeholder="Enter ${SocialMediaList[i - 1]} URL"/>                
        </div>
    `;    
    AboutUsSocialMediaBoxContainer.insertAdjacentHTML('beforeend', blockHTML);
}

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
                        targetDivId = `SliderPictureName_${sliderIndex}`; // Now matches HTML element
                    }

                    const displayDiv = document.getElementById(targetDivId);
                    if (displayDiv) {
                        displayDiv.textContent = row.FileName;
                    }
                }

                // 2. Handle standard Text inputs
                let inputId = row.Name;
                
                // FIXED MAPPER: Matches database 'SliderCredential1' to input element id 'SliderCredential1'
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
    
    // --- FIXED LOGIC ---
    // Keep data.secure_url EXACTLY as it is (including the vital /v1781947393/ tag)
    // and append the query parameter to force your website elements to re-render instantly.
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

        // Invoke function
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

        // --- LOOK HERE: Print the real response from Cloudinary ---
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
            { inputId: 'SMCHeadPhotoFile', dbName: 'SMCHeadPhoto', divId: 'SMCHeadPhotoName', width: 300, height: 450 }, // Fixed duplicate dbName bug here
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

        console.log("Starting file configuration processing loop...");
        
        for (const config of fileConfigs) {
            const fileInput = document.getElementById(config.inputId);
            
            if (!fileInput) {
                console.warn(`⚠️ HTML Element with id="${config.inputId}" was NOT found on this page.`);
                continue;
            }
            
            console.log(`Checking input id="${config.inputId}". Selected files count:`, fileInput.files ? fileInput.files.length : 'No files property');

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

        // 2.5 ADDED: Collect Special Contacts Text Fields (Names, Mobiles, Emails)
        const staffRoles = ['Principal', 'SMCHead', 'VicePrincipal', 'Accountant', 'ExamHead', 'ECAHead'];
        const metadataTypes = ['Name', 'Contact', 'Email'];

        staffRoles.forEach(role => {
            metadataTypes.forEach(type => {
                const inputId = `${role}${type}`; // Dynamically builds 'PrincipalName', 'PrincipalMobile', etc.
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