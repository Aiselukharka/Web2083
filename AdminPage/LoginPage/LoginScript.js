
const loginForm=document.getElementById("loginForm");
const loginBtn=document.getElementById("btnLogIn");
const openAdminBtn=document.getElementById("btnOpenAdmin");
const errorMessage=document.getElementById("errorMessage");
const loginStatus=document.getElementById("loginStatus");
const togglePassword=document.getElementById("togglePassword");
const passwordInput=document.getElementById("password");
const adminBtn=document.getElementById("btnOpenAdmin");
const forgotPasswordBtn=document.getElementById("forgotPassword");

// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "LogInIndex.html",
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

window.addEventListener("load", async () => {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        window.location.replace("../AdminDashboardPage/AdminDashboardIndex.html");
        return;
    }
    refreshUI();
});

function showError(msg){
    errorMessage.innerText=msg;
    errorMessage.style.display="block";
}

function setLoading(state){
    loginBtn.disabled=state;
    loginBtn.innerText=state ? "Authenticating..." : "Sign In";
    if(state) errorMessage.style.display="none";
}

async function refreshUI(){
    const {data,error}=await supabaseClient.auth.getSession();
    if(error){
        console.error(error);
        return;
    }

    if(data.session){
        loginStatus.innerText="✅ Admin logged in";
        loginStatus.style.color="green";
        openAdminBtn.style.display="block";
        loginBtn.style.display="none";
        adminBtn.innerText="Admin";
    }else{
        loginStatus.innerText="❌ Admin not logged in";
        loginStatus.style.color="red";
        openAdminBtn.style.display="none";
        loginBtn.style.display="block";
        adminBtn.innerText="Login";
        loginForm.reset();
        passwordInput.type="password";
        togglePassword.innerText="👁️";
    }
}

togglePassword.onclick=()=>{
    passwordInput.type=passwordInput.type==="password"?"text":"password";
    togglePassword.innerText=passwordInput.type==="password"?"👁️":"🙈";
};

loginForm.addEventListener("submit",async(e)=>{
    e.preventDefault();
    setLoading(true);
    const email=document.getElementById("email").value.trim();
    const password=passwordInput.value;
    try{
        const {data,error}=await supabaseClient.auth.signInWithPassword({
            email,
            password
    });

    if(error) throw error;
    const {data:sessionData}=await supabaseClient.auth.getSession();
    if(!sessionData.session){
        throw new Error("Login failed. Session not created.");
    }
    await refreshUI();
    window.location.href="../AdminDashboardPage/AdminDashboardIndex.html";
    }catch(err){
        console.error(err);
        showError(err.message || "Login failed");
        setLoading(false);
    }
});

openAdminBtn.onclick=()=>location.href="../AdminDashboardPage/AdminDashboardIndex.html";
forgotPasswordBtn.onclick = async (e) => {
    e.preventDefault();
    const email = prompt("Enter email");
    if (!email) return;
    setLoading(true);
    try {
        const linkResponse = await fetch(
            "https://wrjivuysumgpoqmabwpw.supabase.co/functions/v1/generate-reset-link",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );
        const linkResult = await linkResponse.json();
        if (!linkResponse.ok) {
            throw new Error(linkResult.error);
        }
        const emailResponse = await fetch(
            "https://wrjivuysumgpoqmabwpw.supabase.co/functions/v1/send-reset-email",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: email,
                    resetLink: linkResult.resetLink
                })
            }
        );        
        const emailResult = await emailResponse.json();
        console.log("Email Result:", JSON.stringify(emailResult, null, 2));
        alert(JSON.stringify(emailResult, null, 2));
        if (!emailResponse.ok) {
            alert(JSON.stringify(emailResult, null, 2));
            throw new Error(emailResult.error);
        }
        alert("Password reset email sent.");
    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        setLoading(false);
    }
};

window.addEventListener("load",refreshUI);
supabaseClient.auth.onAuthStateChange((event)=>{
    if(event==="SIGNED_IN"){
        refreshUI();
    }
    if(event==="SIGNED_OUT"){
        refreshUI();
    }
});

//Dynamically show logo and favicon
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
