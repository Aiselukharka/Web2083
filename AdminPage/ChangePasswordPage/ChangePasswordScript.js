const form=document.getElementById("form");
const msg=document.getElementById("msg");
const btn=document.getElementById("btn");
const p1=document.getElementById("newPassword");
const p2=document.getElementById("confirmPassword");
const bar=document.getElementById("bar");
const strengthText=document.getElementById("strengthText");
const matchText=document.getElementById("matchText");
function show(t,c){
    msg.innerText=t;
    msg.style.color=c;
}

/* ================= SESSION CHECK ================= */
async function checkSession(){
    const {data:{session}}=await supabaseClient.auth.getSession();
    if(!session) window.location.replace("../LoginPage/LogInIndex.html");
    else document.body.style.display="block";
}
checkSession();

/* ================= PASSWORD STRENGTH ================= */
function strength(val){
    let s=0;
    if(val.length>=8)s++;
    if(/[A-Z]/.test(val))s++;
    if(/[a-z]/.test(val))s++;
    if(/[0-9]/.test(val))s++;
    if(/[^A-Za-z0-9]/.test(val))s++;
    return s;
}
p1.addEventListener("input",()=>{
    const s=strength(p1.value);
    const percent=(s/5)*100;
    bar.style.width=percent+"%";
    bar.style.background=
    percent<40?"red":
    percent<80?"orange":"green";
    strengthText.innerText="Strength: "+s+"/5";
    checkMatch();
});

/* ================= PASSWORD MATCH ================= */
function checkMatch(){
    if(p2.value.length===0){
    matchText.innerText="";
    return;
    }

    if(p1.value===p2.value){
        matchText.innerText="✓ Passwords match";
        matchText.style.color="green";
    }else{
        matchText.innerText="✗ Passwords do not match";
        matchText.style.color="red";
    }
}
p2.addEventListener("input",checkMatch);

/* ================= SUBMIT ================= */
form.onsubmit=async(e)=>{
    e.preventDefault();
    const pass1=p1.value.trim();
    const pass2=p2.value.trim();
    if(pass1!==pass2){
        show("Passwords do not match","red");
        return;
    }
    if(strength(pass1)<4){
        show("Weak password","red");
        return;
    }
    btn.innerText="Updating...";
    btn.disabled=true;
    try{
        const {error}=await supabaseClient.auth.updateUser({
        password:pass1
        });
        if(error) throw error;
        show("Password updated successfully","green");
        setTimeout(async()=>{
            await supabaseClient.auth.signOut();
            window.location.replace("../LoginPage/LogInIndex.html");
        },2000);
    }catch(err){
        show(err.message,"red");
        btn.innerText="Update Password";
        btn.disabled=false;
    }
};

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "../LoginPage/LogInIndex.html",
        "LibraryPage": "../../LibraryPage/LibraryIndex.html",
        "NoticePage": "../../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../../StudentPage/StudentIndex.html",
        "TeacherPage": "../../TeacherPage/TeacherIndex.html",
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
