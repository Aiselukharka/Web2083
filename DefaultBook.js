function formatBookName(fileName) {
    let name = fileName.replace(/\.pdf$/i, '');
    name = name.replace(/[_-]/g, ' ');
    name = name.replace(/\b\w/g, char => char.toUpperCase());
    return name;
}

async function loadBooks() {
    const bookContainer = document.getElementById('DefaultBookBox');    
    const owner = 'ojhagsoftware';
    const repo = 'SchoolLibrary';
    let branch = 'main';    
    bookContainer.innerHTML = '<div class="loading">📖 Loading books from repository...</div>';    
    try {
        let apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;
        let response = await fetch(apiUrl);        
        if (!response.ok) {
            branch = 'master';
            apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;
            response = await fetch(apiUrl);
        }        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Unable to fetch repository contents.`);
        }        
        const files = await response.json();        
        const pdfFiles = files.filter(file => 
            file.name && 
            file.name.toLowerCase().endsWith('.pdf') &&
            file.type === 'file'
        );        
        if (pdfFiles.length === 0) {
            bookContainer.innerHTML = '<div class="no-books">📭 No PDF books found in the repository.</div>';
            return;
        }        
        bookContainer.innerHTML = '';        
        pdfFiles.forEach(file => {
            const pdfUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.name}`;
            const bookName = formatBookName(file.name);            
            const bookCard = document.createElement('div');
            bookCard.className = 'DefaultBookCards';            
            bookCard.innerHTML = `
                <div class="DefaultBookNames">${bookName}</div>
                <button class="btnOpenDefaultBook" onclick="showPictureViewer('${notice.NoticeUrl}', '${safeTitle}')">Open</button>
                <button class="btnDownloadDefaultBook" onclick="downloadDefaultBook(this, '${pdfUrl}')">Download</button>
                <hr>
                `;
            bookContainer.appendChild(bookCard);            
        });
        
    } catch (error) {
        console.error('Error loading books:', error);
        bookContainer.innerHTML = `<div class="error">❌ Failed to load books: ${error.message}<br><br>Make sure the repository is public and contains PDF files.</div>`;
    }
}

// Load books when the DOM is fully ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBooks);
} else {
    loadBooks();
}