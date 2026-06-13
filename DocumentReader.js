function openPdfReader(pdfUrl, title = "") {
  const oldModal = document.getElementById("pdfModal");
  if (oldModal) oldModal.remove();
  
  let currentWidth = 900; 
  const minWidth = 500;
  const maxWidth = 2500;
  
  const modal = document.createElement("div");
  modal.id = "pdfModal";
  modal.style.cssText = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,.85);
    z-index:99999;
    display:flex;
    flex-direction:column;
  `;
  
  const toolbar = document.createElement("div");
  toolbar.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:10px 15px;
    background:#222;
  `;
  
  const titleDiv = document.createElement("div");
  titleDiv.textContent = title;
  titleDiv.style.color = "white";
  titleDiv.style.fontSize = "18px";
  
  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "10px";
  
  const btnZoomOut = document.createElement("button");
  btnZoomOut.textContent = "−";
  const btnZoomIn = document.createElement("button");
  btnZoomIn.textContent = "+";
  const btnClose = document.createElement("button");
  btnClose.textContent = "✕";
  
  [btnZoomOut, btnZoomIn, btnClose].forEach(btn => {
    btn.style.padding = "8px 14px";
    btn.style.fontSize = "18px";
    btn.style.fontWeight = "bold";
    btn.style.cursor = "pointer";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.background = "#555";
    btn.style.color = "white";
  });
  
  btnZoomOut.onmouseenter = () => { btnZoomOut.style.background = "blue"; btnZoomOut.style.color = "yellow"; };
  btnZoomOut.onmouseleave = () => { btnZoomOut.style.background = "#555"; btnZoomOut.style.color = "white"; };
  btnZoomIn.onmouseenter = () => { btnZoomIn.style.background = "green"; btnZoomIn.style.color = "yellow"; };
  btnZoomIn.onmouseleave = () => { btnZoomIn.style.background = "#555"; btnZoomIn.style.color = "white"; };
  btnClose.onmouseenter = () => { btnClose.style.background = "red"; btnClose.style.color = "yellow"; };
  btnClose.onmouseleave = () => { btnClose.style.background = "#555"; btnClose.style.color = "white"; };
  
  btnClose.onclick = () => modal.remove();
  
  const container = document.createElement("div");
  container.style.cssText = `
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 20px;
  `;
  
  const bookWrapper = document.createElement("div");
  bookWrapper.style.cssText = `
    width: ${currentWidth}px;
    margin: 0 auto;
    height: 100%;
    min-height: 85vh;
    transition: width 0.1s ease-out;
    background: #fff; /* Gives a clean loading background */
  `;
  
  // --- SMART URL ROUTING TO FIX GOOGLE ERRORS ---
  let finalIframeSrc = "";
  
  if (pdfUrl.includes("raw.githubusercontent.com")) {
    // FIX: Instead of sending heavy raw GitHub links to Google Docs Viewer,
    // convert them to jsDelivr CDN links. Browsers can render CDN PDFs natively inside iframes!
    const cleanPath = pdfUrl.replace("https://raw.githubusercontent.com/", "");
    const parts = cleanPath.split("/");
    const user = parts[0];
    const repo = parts[1];
    const branch = parts[2];
    const filePath = parts.slice(3).join("/");
    
    // Direct CDN address that forces browser native viewing
    finalIframeSrc = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`;
  } else {
    // Cloudinary or regular links still go through Google Viewer wrapper safely
    finalIframeSrc = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  }
  
  const iframe = document.createElement("iframe");
  iframe.src = finalIframeSrc;
  iframe.style.cssText = `
    width:100%;
    height:100%;
    border:none;
  `;
  
  // Fallback Link UI: Just in case Google completely breaks down for a specific user, 
  // they can click an elegant anchor banner to open it natively.
  const fallbackAlert = document.createElement("div");
  fallbackAlert.style.cssText = `
    padding: 5px; background: #fff3cd; color: #856404; text-align: center; font-size: 13px; font-family: sans-serif;
  `;
  fallbackAlert.innerHTML = `⚠️ Having trouble viewing? <a href="${pdfUrl}" target="_blank" style="color: #533f03; font-weight: bold; text-decoration: underline;">Click here to open directly</a>`;
  
  function updateZoom() {
    bookWrapper.style.width = `${currentWidth}px`;
    if (currentWidth > container.clientWidth) {
        bookWrapper.style.margin = "0";
    } else {
        bookWrapper.style.margin = "0 auto";
    }
  }
  
  btnZoomIn.onclick = () => {
    if (currentWidth < maxWidth) {
      currentWidth += 150;
      updateZoom();
    }
  };
  
  btnZoomOut.onclick = () => {
    if (currentWidth > minWidth) {
      currentWidth -= 150;
      updateZoom();
    }
  };
  
  controls.append(btnZoomOut, btnZoomIn, btnClose);
  toolbar.append(titleDiv, controls);
  
  bookWrapper.appendChild(iframe);
  
  // Prepend fallback helper link inside the modal view
  container.appendChild(bookWrapper);
  modal.append(toolbar, fallbackAlert, container);
  document.body.appendChild(modal);
  
  setTimeout(updateZoom, 50);
}

//Open image viewer
function showPictureViewer(imageUrl, imageTitle = "") {
  const oldViewer = document.getElementById("pictureViewer");
  if (oldViewer) oldViewer.remove();
  let zoom = 1;
  const overlay = document.createElement("div");
  overlay.id = "pictureViewer";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.zIndex = "99999";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  const toolbar = document.createElement("div");
  toolbar.style.display = "flex";
  toolbar.style.alignItems = "center";
  toolbar.style.justifyContent = "space-between";
  toolbar.style.padding = "10px 15px";
  toolbar.style.background = "#222";
  const title = document.createElement("div");
  title.textContent = imageTitle;
  title.style.color = "white";
  title.style.fontSize = "18px";
  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "10px";
  const btnZoomOut = document.createElement("button");
  btnZoomOut.textContent = "−";
  const btnZoomIn = document.createElement("button");
  btnZoomIn.textContent = "+";
  const btnClose = document.createElement("button");
  btnClose.textContent = "✕";
  [btnZoomIn, btnZoomOut, btnClose].forEach(btn => {
    btn.style.padding = "8px 14px";
    btn.style.fontSize = "18px";
    btn.style.cursor = "pointer";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.background = "#555";
    btn.style.color = "white";
  });
  btnZoomIn.onmouseenter = () => {
    btnZoomIn.style.background = "green";
    btnZoomIn.style.color = "yellow";
  };
  btnZoomIn.onmouseleave = () => {
    btnZoomIn.style.background = "#555";
    btnZoomIn.style.color = "white";
  };
  btnZoomOut.onmouseenter = () => {
    btnZoomOut.style.background = "blue";
    btnZoomOut.style.color = "yellow";
  };
  btnZoomOut.onmouseleave = () => {
    btnZoomOut.style.background = "#555";
    btnZoomOut.style.color = "white";
  };
  btnClose.onmouseenter = () => {
    btnClose.style.background = "red";
    btnClose.style.color = "yellow";
  };
  btnClose.onmouseleave = () => {
    btnClose.style.background = "#555";
    btnClose.style.color = "white";
  };
  const imageContainer = document.createElement("div");
  imageContainer.style.flex = "1";
  imageContainer.style.overflow = "auto";
  imageContainer.style.display = "flex";
  imageContainer.style.justifyContent = "center";
  imageContainer.style.alignItems = "flex-start";
  imageContainer.style.padding = "20px";
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.width = "90vw";
  img.style.height = "auto";
  img.style.transformOrigin = "top center";
  img.style.transition = "transform 0.2s ease";
  function updateZoom() {
    img.style.transform = `scale(${zoom})`;
  }
  btnZoomIn.onclick = () => {
    zoom += 0.25;
    updateZoom();
  };
  btnZoomOut.onclick = () => {
    if (zoom > 0.5) {
      zoom -= 0.25;
      updateZoom();
    }
  };
  btnClose.onclick = () => overlay.remove();
  controls.appendChild(btnZoomOut);
  controls.appendChild(btnZoomIn);
  controls.appendChild(btnClose);
  toolbar.appendChild(title);
  toolbar.appendChild(controls);
  imageContainer.appendChild(img);
  overlay.appendChild(toolbar);
  overlay.appendChild(imageContainer);
  document.body.appendChild(overlay);
}

//Open office file viewer
function openOfficeFile(fileUrl, title = "") {
  const oldModal = document.getElementById("officeModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "officeModal";
  modal.style.cssText = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,.85);
    z-index:99999;
    display:flex;
    flex-direction:column;
  `;
  const toolbar = document.createElement("div");
  toolbar.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:10px 15px;
    background:#222;
  `;
  const titleDiv = document.createElement("div");
  titleDiv.textContent = title;
  titleDiv.style.color = "white";
  titleDiv.style.fontSize = "18px";
  const btnClose = document.createElement("button");
  btnClose.textContent = "✕";
  btnClose.style.cssText = `
    padding:8px 14px;
    font-size:18px;
    font-weight:bold;
    cursor:pointer;
    border:none;
    border-radius:5px;
    background:#555;
    color:white;
  `;
  btnClose.onmouseenter = () => {
    btnClose.style.background = "red";
    btnClose.style.color = "yellow";
  };
  btnClose.onmouseleave = () => {
    btnClose.style.background = "#555";
    btnClose.style.color = "white";
  };
  btnClose.onclick = () => modal.remove();
  toolbar.append(titleDiv, btnClose);
  const iframe = document.createElement("iframe");
  iframe.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  iframe.style.cssText = `
    width:100%;
    height:100%;
    border:none;
    flex:1;
  `;
  modal.append(toolbar, iframe);
  document.body.appendChild(modal);
}