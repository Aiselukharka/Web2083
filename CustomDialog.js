function showCustomDialog1(title, message, btnText, onClick) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: '200000'
    });

    const dialogBox = document.createElement('div');
    Object.assign(dialogBox.style, {
        backgroundColor: '#ffdddd', width: '30%',
        padding: '2vh', borderRadius: '2vh',
        textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        fontFamily: 'sans-serif'
    });

    dialogBox.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; background-color: #111111; padding: 10px;">
            <h2 style="margin-top:0; text-align: center; color:#fff;">${title}</h2>
        </div>

        <div style="color:#666;">
            ${message}
        </div>

        <div style="margin-top:20px; display:flex; justify-content:space-around;">
            <button id="btn" style="width: 40%; padding:10px 20px; cursor:pointer; background: #aaaa00; color: white; border:none; border-radius:4px;">${btnText}</button>
        </div>
    `;
    
    overlay.appendChild(dialogBox);
    document.body.appendChild(overlay);

    const button = document.getElementById("btn");
    
    button.onclick = () => {
        onClick();
        document.body.removeChild(overlay);
    };

    button.onmouseenter = () => {
        button.style.backgroundColor = "#00aa00";
        button.style.transform = "scale(1.05)";
    };
    button.onmouseleave = () => {
        button.style.backgroundColor = "#aaaa00";
        button.style.transform = "scale(1)";
    };
}

function showCustomDialog2(title, message, btnText1, btnText2, onClick1, onClick2) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: '3000'
    });

    const dialogBox = document.createElement('div');
    Object.assign(dialogBox.style, {
        backgroundColor: '#ffdddd', width: '350px',
        borderRadius: '15px', textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        fontFamily: 'sans-serif', overflow: 'hidden'
    });

    const button1 = document.createElement('button');
    button1.innerText = btnText1;
    Object.assign(button1.style, {
        flex: '1', padding: '12px', cursor: 'pointer',
        backgroundColor: '#aaaa00', color: 'white',
        border: 'none', borderRadius: '8px', fontWeight: 'bold'
    });

    const button2 = document.createElement('button');
    button2.innerText = btnText2;
    Object.assign(button2.style, {
        flex: '1', padding: '12px', cursor: 'pointer',
        backgroundColor: '#0000aa', color: 'white',
        border: 'none', borderRadius: '8px', fontWeight: 'bold'
    });

    dialogBox.innerHTML = `
        <div style="background-color: #111111; padding: 15px;">
            <h2 style="margin:0; font-size: 20px; color:#fff;">${title}</h2>
        </div>
        <div style="padding: 20px;">
            <p style="color:#444; font-size: 16px; line-height: 1.5;">${message}</p>
            <div id="buttonContainer" style="margin-top:20px; display:flex; justify-content:space-between; gap: 10px;"></div>
        </div>
    `;

    overlay.appendChild(dialogBox);
    document.body.appendChild(overlay);
    dialogBox.querySelector('#buttonContainer').appendChild(button1);
    dialogBox.querySelector('#buttonContainer').appendChild(button2);

    button1.onclick = () => {
        if (onClick1) onClick1();
        document.body.removeChild(overlay);
    };

    button2.onclick = () => {
        if (onClick2) onClick2();
        document.body.removeChild(overlay);
    };

    button1.onmouseenter = () => { button1.style.backgroundColor = "#00aa00"; };
    button1.onmouseleave = () => { button1.style.backgroundColor = "#aaaa00"; };
    
    button2.onmouseenter = () => { button2.style.backgroundColor = "#00aa00"; };
    button2.onmouseleave = () => { button2.style.backgroundColor = "#0000aa"; };
}

// DIALOG 3: For HTML content with one button
function showCustomDialog3(title, htmlMessage, btnText = "OK", onClick = function(){}) {

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '3000'
    });

    const dialogBox = document.createElement('div');
    Object.assign(dialogBox.style, {
        backgroundColor: '#ffdddd',
        width: '35%',
        padding: '2vh',
        borderRadius: '2vh',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        fontFamily: 'sans-serif'
    });

    dialogBox.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; background:#111; padding:10px;">
            <h2 style="margin:0; color:#fff;">${title}</h2>
        </div>

        <div style="margin-top:15px; color:#444; font-size:16px; line-height:1.5;">
            ${htmlMessage}
        </div>

        <div style="margin-top:20px;">
            <button id="dlg3btn"
                style="
                    width: 40%;
                    padding:10px 20px;
                    cursor:pointer;
                    background:#0000aa;
                    color:white;
                    border:none;
                    border-radius:6px;
                    font-weight:bold;
                ">
                ${btnText}
            </button>
        </div>
    `;

    overlay.appendChild(dialogBox);
    document.body.appendChild(overlay);

    const btn = document.getElementById("dlg3btn");

    btn.onclick = () => {
        onClick();
        document.body.removeChild(overlay);
    };

    btn.onmouseenter = () => {
        btn.style.backgroundColor = "#00aa00";
        btn.style.transform = "scale(1.05)";
    };

    btn.onmouseleave = () => {
        btn.style.backgroundColor = "#0000aa";
        btn.style.transform = "scale(1)";
    };
}
