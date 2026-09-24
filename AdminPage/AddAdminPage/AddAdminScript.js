    protectAdminPage();
    async function protectAdminPage() {
        const { data: { session } } =
            await supabaseClient.auth.getSession();
        if (!session) {
            alert("Login required");
            window.location.href = "../LoginPage/LogInIndex.html";
            return;
        }
        document.body.style.display = "block";
        loadAdmins();
    }

    // -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "AdminPage": "../LoginPage/LogInIndex.html",
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
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

    /* ================= LOAD ADMINS ================= */
    async function loadAdmins() {
        const { data, error } = await supabaseClient
            .from("AdminUsers")
            .select("*");
        if (error) {
            console.error(error);
            return;
        }
        const list = document.getElementById("AdminList");
        list.innerHTML = "";
        data.forEach(admin => {
            const div = document.createElement("div");
            div.className = "AdminItem";
            div.innerHTML = `
                <span>${admin.email}</span>
                <button onclick="deleteAdmin('${admin.auth_user_id}')">
                    Delete
                </button>
            `;
            list.appendChild(div);
        });
        console.log("Data:", data);
        console.log("Error:", error);
    }

    /* ================= ADD ADMIN ================= */
    document.getElementById("btnAddAdmin").addEventListener("click", addAdmin);
    async function addAdmin() {
        const btn = document.getElementById("btnAddAdmin");
        const email = newAdminEmail.value.trim();
        const password = newAdminPassword.value;
        const confirm = confirmNewAdminPassword.value;
        if (!email || !password) {
            alert("Fill all fields");
            return;
        }
        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }
        btn.innerText = "Adding...";
        btn.disabled = true;
        try {
            const res = await fetch(
                "https://wrjivuysumgpoqmabwpw.supabase.co/functions/v1/create-admin",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );
            const result = await res.json();
            if (!res.ok) {
                alert(result.error || "Failed");
                return;
            }
            alert("Admin added successfully!");
            newAdminEmail.value = "";
            newAdminPassword.value = "";
            confirmNewAdminPassword.value = "";
            const ps = document.getElementById("passwordStrength");
            if (ps) ps.innerText = "";
            loadAdmins();
        } catch (err) {
            console.error(err);
            alert("Network error");
        }
        btn.innerText = "Add Admin";
        btn.disabled = false;
    }

    /* ================= DELETE ================= */
    async function deleteAdmin(authUserId) {
        if (!confirm("Delete this admin?")) return;
        const res = await fetch(
            "https://wrjivuysumgpoqmabwpw.supabase.co/functions/v1/delete-admin",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ authUserId })
            }
        );
        const result = await res.json();
        if (!res.ok) {
            alert(result.error);
            return;
        }
        loadAdmins();
    }

    /* ================= PASSWORD TOGGLE (RESTORED) ================= */
    function togglePass(id) {
        const input = document.getElementById(id);
        input.type = input.type === "password" ? "text" : "password";
    }

    async function loadDynamicLogoAndFavicon() {
        try {
            // Query the table natively using your pre-configured supabaseClient
            const { data, error } = await supabaseClient
                .from('AboutSchoolTable')
                .select('Value')
                .eq('Name', 'SchoolLogo')
                .single(); // Accesses the single matching record directly

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
    