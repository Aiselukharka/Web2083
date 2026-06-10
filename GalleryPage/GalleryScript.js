// -------------------- NAVIGATE PAGES --------------------
const PageNavigationDripDown = document.getElementById("PageNavigationSelect");
PageNavigationDripDown.addEventListener("change", function () {
    const pageMap = {
        "LibraryPage": "../LibraryPage/LibraryIndex.html",
        "NoticePage": "../NoticePage/NoticeIndex.html",
        "QuestionBankPage": "../QuestionBankPage/QuestionBankIndex.html",
        "StudentPage": "../StudentPage/StudentIndex.html",
        "TeacherPage": "../TeacherPage/TeacherIndex.html",
        "HomePage": "../index.html",
        "BalPratibhaPage": "../BalPratibhaPage/BalPratibhaIndex.html",
        "AboutUsPage": "../AboutUsPage/AboutUsIndex.html",
        "GalleryPage": "GalleryIndex.html",
        "SMC_TGC_Page": "../SMC_TGC_Page/SMC_TGC_Index.html",
        "HelpingHandPage": "../HelpingHandPage/HelpingHandIndex.html",
        "AdminPage": "../AdminPage/LogInIndex.html"        
    };

    const selectedPage = pageMap[this.value];
    if (selectedPage) {
        window.location.href = selectedPage;
    }
});

