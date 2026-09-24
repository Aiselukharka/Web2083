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
        window.location.replace("../LoginPage/LogInIndex.html");
        return;
    }
    document.body.style.display = "block";
}

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
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
        "AboutUsEditBox": "../EditAboutUsPage/EditAboutUsIndex.html",
        "StudentEditBox": "../EditStudentPage/EditStudentIndex.html",
        "HumanResourceEditBox": "../EditHumanResourcePage/EditHumanResourceIndex.html",
        "CalendarEditBox": "../EditCalendarPage/EditCalendarIndex.html",
        "BalPratibhaEditBox": "../EditBalPratibhaPage/EditBalPratibhaIndex.html",
        "GalleryEditBox": "../EditGalleryPage/EditGalleryIndex.html",
        "HelpingHandEditBox": "../EditHelpingHandPage/EditHelpingHandIndex.html",
        "ClassEditBox": "../EditClassPage/EditClassIndex.html",
        "VideoLinkEditBox": "../EditVideoLinkPage/EditVideoLinkIndex.html",
        "QuestionBankEditBox": "../EditQuestionBankPage/EditQuestionBankIndex.html"
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
        showCustomDialog2(
            "Confirm Logout",
            "Logout from all devices?",
            "Yes",
            "Cancel",
            async function () {
                await supabaseClient.auth.signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            },
            function () {}
        );
            break;
    }
    this.selectedIndex = 0;
});

// -------------------- NAVIGATION DROPDOWN of Edit Boxes --------------------
const NavigationDropDown = document.getElementById("EditNavigationSelect");
const editBoxes = document.querySelectorAll(".EditBoxes");

NavigationDropDown.addEventListener("change", function () {
editBoxes.forEach(box => box.style.display = "none");
const selectedValue = this.value;
if (selectedValue) {
    document.getElementById(selectedValue).style.display = "block";
}
});


//Dynamically show logo and favicon
async function loadDynamicLogoAndFavicon() {
    try {
        // Query the table natively using your pre-configured supabaseClient
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

            // 1. Update the Favicon inside the Document Head
            const faviconElement = document.getElementById('dynamicFavicon');
            if (faviconElement) {
                faviconElement.href = freshLogoUrl;
            }

            // 2. Update the Logo Image Source inside #LogoBox
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

function logoutFromThisDevice(){
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
}

function logoutFromAllDevices(){
    showCustomDialog2(
            "Confirm Logout",
            "Logout from all devices?",
            "Yes",
            "Cancel",
            async function () {
                await supabaseClient.auth.signOut({scope: "global"});
                window.location.replace("../LoginPage/LogInIndex.html");
            },
            function () {}
        );
}