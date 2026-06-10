function createProfessionalCalculator() {
    // Check if calculator already exists
    if (document.getElementById('professionalCalculator')) {
        const minimizedView = document.getElementById('minimizedCalculatorView');
        if (minimizedView) {
            minimizedView.remove();
        }
        document.getElementById('professionalCalculator').style.display = 'flex';
        return;
    }
    
    const calculatorHTML = `
        <div id="professionalCalculator" style="
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            font-family: 'Segoe UI', Arial, sans-serif;
        ">
            <div style="
                background: linear-gradient(145deg, #aaaa44, #bbbb66);
                border-radius: 30px;
                padding: 20px;
                width: 850px;
                max-width: 95%;
                box-shadow: 20px 20px 40px rgba(0,0,0,0.5),
                           -8px -8px 16px rgba(255,255,255,0.05);
                cursor: move;
            " id="calculatorDragArea">
                
                <!-- Header -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    color: #fff;
                    cursor: move;
                ">
                    <h3 style="margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Scientific Calculator</h3>
                    <div style="display: flex; gap: 10px;">
                        <button id="minimizeProfCalc" style="
                            background: linear-gradient(145deg, #f39c12, #e67e22);
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 35px;
                            height: 35px;
                            cursor: pointer;
                            font-size: 20px;
                            font-weight: bold;
                            box-shadow: 3px 3px 6px rgba(0,0,0,0.3),
                                       -1px -1px 2px rgba(255,255,255,0.1);
                        ">−</button>
                        <button id="closeProfCalc" style="
                            background: linear-gradient(145deg, #e74c3c, #c0392b);
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 35px;
                            height: 35px;
                            cursor: pointer;
                            font-size: 22px;
                            font-weight: bold;
                            box-shadow: 3px 3px 6px rgba(0,0,0,0.3),
                                       -1px -1px 2px rgba(255,255,255,0.1);
                        ">×</button>
                    </div>
                </div>
                
                <!-- Display Area -->
                <div style="
                    background: linear-gradient(145deg, #666688, #8888aa);
                    border-radius: 15px;
                    padding: 15px;
                    margin-bottom: 10px;
                    box-shadow: inset 5px 5px 10px rgba(0,0,0,0.5),
                                inset -2px -2px 5px rgba(255,255,255,0.05);
                ">
                    <div id="calcQuestionContainer" style="position: relative; min-height: 40px;">
                        <div id="calcQuestion" style="
                            color: #ffff33;
                            font-size: 24px;
                            font-weight: bold;
                            text-align: left;
                            min-height: 32px;
                            word-wrap: break-word;
                            font-family: 'Courier New', monospace;
                            letter-spacing: 1px;
                            text-shadow: 0 0 5px rgba(76,175,80,0.3);
                            padding: 4px 2px;
                            white-space: pre-wrap;
                        "></div>
                        <div id="blinkingCursor" style="
                            position: absolute;
                            top: 4px;
                            width: 2px;
                            background-color: #4CAF50;
                            display: none;
                            animation: blink 1s step-end infinite;
                            box-shadow: 0 0 5px #4CAF50;
                        "></div>
                    </div>
                    <div id="calcAnswer" style="
                        color: #00ff00;
                        font-size: 38px;
                        text-align: right;
                        font-weight: bold;
                        min-height: 52px;
                        word-wrap: break-word;
                        font-family: 'Courier New', monospace;
                        letter-spacing: 2px;
                        text-shadow: 0 0 8px rgba(0,255,0,0.3);
                    ">0</div>
                </div>
                
                <!-- Status Bar -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding: 5px 10px;
                    background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    <div style="color: #aaa;">
                        Angle: <span id="angleUnitDisplay" style="color: #4CAF50; font-weight: bold;">DEG</span>
                    </div>
                    <div style="color: #aaa;">
                        Fix: <span id="fixDisplay" style="color: #4CAF50; font-weight: bold;">Off</span>
                    </div>
                </div>
                
                <!-- Calculator Buttons Grid -->
                <!-- Row 1: Memory Operations -->
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 8px;">
                    <button class="calc-3d memory" data-action="mc">MC</button>
                    <button class="calc-3d memory" data-action="mr">MR</button>
                    <button class="calc-3d memory" data-action="m+">M+</button>
                    <button class="calc-3d memory" data-action="m-">M-</button>
                    <button class="calc-3d memory" data-action="ms">MS</button>
                    <button class="calc-3d fix" data-func="fix">Fix</button>
                    <button class="calc-3d clear" data-func="clear">C</button>
                    <button class="calc-3d clear" data-func="clearAll">AC</button>
                </div>
                
                <!-- Row 2: Trigonometric Functions -->
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 8px;">
                    <button class="calc-3d scientific" data-func="sin">sin</button>
                    <button class="calc-3d scientific" data-func="cos">cos</button>
                    <button class="calc-3d scientific" data-func="tan">tan</button>
                    <button class="calc-3d scientific" data-func="asin">sin⁻¹</button>
                    <button class="calc-3d scientific" data-func="acos">cos⁻¹</button>
                    <button class="calc-3d scientific" data-func="atan">tan⁻¹</button>
                    <button class="calc-3d drg" data-func="drg">DRG</button>
                    <button class="calc-3d bracket" data-bracket="(">(</button>
                </div>
                
                <!-- Row 3: Roots, Powers & Logarithms -->
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 8px;">
                    <button class="calc-3d scientific" data-func="sqrt">√</button>
                    <button class="calc-3d scientific" data-func="cbrt">∛</button>
                    <button class="calc-3d scientific" data-func="square">x²</button>
                    <button class="calc-3d scientific" data-func="cube">x³</button>
                    <button class="calc-3d scientific" data-func="power">xʸ</button>
                    <button class="calc-3d scientific" data-func="factorial">n!</button>
                    <button class="calc-3d scientific" data-func="log">log</button>
                    <button class="calc-3d scientific" data-func="ln">ln</button>
                </div>
                
                <!-- Row 4: Constants, Navigation & Special -->
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 8px;">
                    <button class="calc-3d scientific" data-func="pi">π</button>
                    <button class="calc-3d scientific" data-func="e">e</button>
                    <button class="calc-3d scientific" data-func="pow10">10ˣ</button>
                    <button class="calc-3d scientific" data-func="powE">eˣ</button>
                    <button class="calc-3d percent" data-func="percent">%</button>
                    <button class="calc-3d nav" data-func="left">◄</button>
                    <button class="calc-3d nav" data-func="right">►</button>
                    <button class="calc-3d backspace" data-func="backspace">⌫</button>
                </div>
                
                <!-- Row 5: Numbers 7-9 and Operations -->
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 8px;">
                    <button class="calc-3d number" data-value="7">7</button>
                    <button class="calc-3d number" data-value="8">8</button>
                    <button class="calc-3d number" data-value="9">9</button>
                    <button class="calc-3d operator" data-operator="/">÷</button>
                    <button class="calc-3d number" data-value="4">4</button>
                    <button class="calc-3d number" data-value="5">5</button>
                    <button class="calc-3d number" data-value="6">6</button>
                    <button class="calc-3d operator" data-operator="*">×</button>
                </div>
                
                <!-- Row 6: Numbers 1-3, 0, Decimal and Operations -->
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px;">
                    <button class="calc-3d number" data-value="1">1</button>
                    <button class="calc-3d number" data-value="2">2</button>
                    <button class="calc-3d number" data-value="3">3</button>
                    <button class="calc-3d operator" data-operator="-">-</button>
                    <button class="calc-3d number" data-value="0">0</button>
                    <button class="calc-3d bracket" data-bracket=")">)</button>
                    <button class="calc-3d number" data-value=".">.</button>
                    <button class="calc-3d operator" data-operator="+">+</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', calculatorHTML);
    
    // 3D Button Styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        .calc-3d {
            padding: 12px 6px;
            font-size: 15px;
            font-weight: bold;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.05s linear;
            position: relative;
            box-shadow: 0 4px 0 rgba(0,0,0,0.3);
            transform: translateY(-2px);
        }
        
        .calc-3d:active {
            transform: translateY(2px);
            box-shadow: 0 1px 0 rgba(0,0,0,0.3);
        }
        
        .calc-3d.number {
            background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
            color: white;
            box-shadow: 0 4px 0 #2a2a2a;
            font-size: 18px;
        }
        
        .calc-3d.operator {
            background: linear-gradient(145deg, #f39c12, #e67e22);
            color: white;
            box-shadow: 0 4px 0 #b85e0a;
            font-size: 20px;
        }
        
        .calc-3d.scientific {
            background: linear-gradient(145deg, #3498db, #2980b9);
            color: white;
            box-shadow: 0 4px 0 #1a5276;
            font-size: 13px;
        }
        
        .calc-3d.memory {
            background: linear-gradient(145deg, #95a5a6, #7f8c8d);
            color: white;
            box-shadow: 0 4px 0 #5d6d6e;
            font-size: 12px;
        }
        
        .calc-3d.clear {
            background: linear-gradient(145deg, #e74c3c, #c0392b);
            color: white;
            box-shadow: 0 4px 0 #8b1a1a;
        }
        
        .calc-3d.bracket {
            background: linear-gradient(145deg, #9b59b6, #8e44ad);
            color: white;
            box-shadow: 0 4px 0 #5b2c6f;
            font-size: 18px;
        }
        
        .calc-3d.nav {
            background: linear-gradient(145deg, #1abc9c, #16a085);
            color: white;
            box-shadow: 0 4px 0 #0e6b5c;
        }
        
        .calc-3d.backspace {
            background: linear-gradient(145deg, #e67e22, #d35400);
            color: white;
            box-shadow: 0 4px 0 #a04000;
        }
        
        .calc-3d.percent {
            background: linear-gradient(145deg, #5dade2, #2e86c1);
            color: white;
            box-shadow: 0 4px 0 #1a5276;
        }
        
        .calc-3d.fix {
            background: linear-gradient(145deg, #f1c40f, #f39c12);
            color: #2c3e50;
            box-shadow: 0 4px 0 #d4ac0d;
            font-weight: bold;
        }
        
        .calc-3d.drg {
            background: linear-gradient(145deg, #e91e63, #c2185b);
            color: white;
            box-shadow: 0 4px 0 #880e4f;
            font-weight: bold;
        }
        
        .calc-3d:hover {
            filter: brightness(1.1);
            transform: translateY(-3px);
        }
        
        .calc-3d:active {
            transform: translateY(2px);
        }
        
        .minimized-calculator {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(145deg, #2d2d2d, #1a1a1a);
            border-radius: 50px;
            padding: 10px 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s;
        }
        
        .minimized-calculator:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
        
        .minimized-calculator button {
            background: #e74c3c;
            border: none;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
        
        .fix-mode-active {
            background: linear-gradient(145deg, #ff6b6b, #ee5a24) !important;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Calculator state
    let currentQuestion = '';
    let currentAnswer = '0';
    let memory = 0;
    let cursorPosition = 0;
    let decimalPlaces = null;
    let fixMode = false;
    let angleUnit = 'DEG';
    
    // DOM elements
    const questionDisplay = document.getElementById('calcQuestion');
    const answerDisplay = document.getElementById('calcAnswer');
    const angleUnitDisplay = document.getElementById('angleUnitDisplay');
    const fixDisplay = document.getElementById('fixDisplay');
    const blinkingCursor = document.getElementById('blinkingCursor');
    const questionContainer = document.getElementById('calcQuestionContainer');
    const fixButton = document.querySelector('.calc-3d.fix');
    
    // UPDATED: Function to update cursor position with proper font size handling
    function updateCursorPosition() {
        if (!questionDisplay || !blinkingCursor) return;
        
        const text = currentQuestion;
        const beforeCursor = text.slice(0, cursorPosition);
        
        // Get the computed style of the question display
        const computedStyle = window.getComputedStyle(questionDisplay);
        const fontSize = computedStyle.fontSize;
        const fontFamily = computedStyle.fontFamily;
        const letterSpacing = computedStyle.letterSpacing;
        const paddingLeft = computedStyle.paddingLeft;
        
        // Create temporary element with EXACT same styling
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            font-size: ${fontSize};
            font-family: ${fontFamily};
            letter-spacing: ${letterSpacing};
            font-weight: normal;
            white-space: pre;
            top: 0;
            left: 0;
            padding: 0;
            margin: 0;
        `;
        tempSpan.textContent = beforeCursor === '' ? ' ' : beforeCursor;
        document.body.appendChild(tempSpan);
        
        // Get the width
        let width = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        
        // If cursor is at the beginning, width will be 0
        if (beforeCursor === '') {
            width = 0;
        }
        
        // Get padding values
        const paddingLeftValue = parseInt(paddingLeft) || 0;
        
        // Position cursor exactly at the text width
        blinkingCursor.style.left = `${paddingLeftValue + width}px`;
        blinkingCursor.style.top = `${parseInt(computedStyle.paddingTop) || 4}px`;
        blinkingCursor.style.height = `${questionDisplay.offsetHeight - 8}px`;
        blinkingCursor.style.display = 'block';
    }
    
    function updateDisplay() {
        let displayQuestion = currentQuestion;
        
        displayQuestion = displayQuestion.replace(/sqrt\(/g, '√(');
        displayQuestion = displayQuestion.replace(/cbrt\(/g, '∛(');
        displayQuestion = displayQuestion.replace(/Math\.pow\(([^,]+),2\)/g, '($1)²');
        displayQuestion = displayQuestion.replace(/Math\.pow\(([^,]+),3\)/g, '($1)³');
        displayQuestion = displayQuestion.replace(/Math\.PI/g, 'π');
        displayQuestion = displayQuestion.replace(/Math\.E/g, 'e');
        
        questionDisplay.textContent = displayQuestion || ' ';
        answerDisplay.textContent = currentAnswer;
        
        angleUnitDisplay.textContent = angleUnit;
        
        if (fixMode) {
            fixDisplay.textContent = 'Waiting...';
            fixDisplay.style.color = '#ff6b6b';
        } else if (decimalPlaces !== null) {
            fixDisplay.textContent = decimalPlaces;
            fixDisplay.style.color = '#4CAF50';
        } else {
            fixDisplay.textContent = 'Off';
            fixDisplay.style.color = '#4CAF50';
        }
        
        if (fixButton) {
            if (fixMode) {
                fixButton.classList.add('fix-mode-active');
                fixButton.textContent = 'Set';
            } else {
                fixButton.classList.remove('fix-mode-active');
                fixButton.textContent = 'Fix';
            }
        }
        
        updateCursorPosition();
    }
    
    function convertAngle(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        
        let inDegrees;
        switch(fromUnit) {
            case 'DEG': inDegrees = value; break;
            case 'RAD': inDegrees = value * 180 / Math.PI; break;
            case 'GRAD': inDegrees = value * 0.9; break;
            default: inDegrees = value;
        }
        
        switch(toUnit) {
            case 'DEG': return inDegrees;
            case 'RAD': return inDegrees * Math.PI / 180;
            case 'GRAD': return inDegrees / 0.9;
            default: return inDegrees;
        }
    }
    
    function evaluateExpression(expr) {
        try {
            let processed = expr;
            
            processed = processed.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
            processed = processed.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');
            processed = processed.replace(/([^0-9])\(([^)]+)\)²/g, '$1Math.pow($2,2)');
            processed = processed.replace(/([^0-9])\(([^)]+)\)³/g, '$1Math.pow($2,3)');
            processed = processed.replace(/(\d+)²/g, 'Math.pow($1,2)');
            processed = processed.replace(/(\d+)³/g, 'Math.pow($1,3)');
            
            processed = processed.replace(/π/g, 'Math.PI');
            processed = processed.replace(/e(?![a-z])/g, 'Math.E');
            processed = processed.replace(/\^/g, '**');
            
            processed = processed.replace(/(\d+)!/g, (match, num) => {
                let result = 1;
                for (let i = 2; i <= parseInt(num); i++) result *= i;
                return result;
            });
            
            processed = processed.replace(/sin\(([^)]+)\)/g, (match, angle) => {
                let angleValue = eval(angle);
                let angleInRadians = convertAngle(angleValue, angleUnit, 'RAD');
                return `Math.sin(${angleInRadians})`;
            });
            processed = processed.replace(/cos\(([^)]+)\)/g, (match, angle) => {
                let angleValue = eval(angle);
                let angleInRadians = convertAngle(angleValue, angleUnit, 'RAD');
                return `Math.cos(${angleInRadians})`;
            });
            processed = processed.replace(/tan\(([^)]+)\)/g, (match, angle) => {
                let angleValue = eval(angle);
                let angleInRadians = convertAngle(angleValue, angleUnit, 'RAD');
                return `Math.tan(${angleInRadians})`;
            });
            
            processed = processed.replace(/asin\(([^)]+)\)/g, (match, val) => {
                let resultRad = Math.asin(eval(val));
                let resultDeg = resultRad * 180 / Math.PI;
                return convertAngle(resultDeg, 'DEG', angleUnit);
            });
            processed = processed.replace(/acos\(([^)]+)\)/g, (match, val) => {
                let resultRad = Math.acos(eval(val));
                let resultDeg = resultRad * 180 / Math.PI;
                return convertAngle(resultDeg, 'DEG', angleUnit);
            });
            processed = processed.replace(/atan\(([^)]+)\)/g, (match, val) => {
                let resultRad = Math.atan(eval(val));
                let resultDeg = resultRad * 180 / Math.PI;
                return convertAngle(resultDeg, 'DEG', angleUnit);
            });
            
            processed = processed.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
            processed = processed.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
            processed = processed.replace(/10ˣ\(([^)]+)\)/g, 'Math.pow(10,$1)');
            processed = processed.replace(/eˣ\(([^)]+)\)/g, 'Math.exp($1)');
            processed = processed.replace(/(\d+(?:\.\d+)?)%/g, (match, num) => parseFloat(num) / 100);
            
            const result = Function('"use strict";return (' + processed + ')')();
            
            if (isNaN(result) || !isFinite(result)) return 'Error';
            
            if (!fixMode && decimalPlaces !== null && !isNaN(result)) {
                return result.toFixed(decimalPlaces);
            } else if (!fixMode && !isNaN(result)) {
                return parseFloat(result.toFixed(10)).toString();
            } else if (fixMode) {
                return parseFloat(result.toFixed(10)).toString();
            }
            
            return result;
        } catch (error) {
            return 'Error';
        }
    }
    
    function updateAnswer() {
        if (!currentQuestion || currentQuestion.trim() === '') {
            currentAnswer = '0';
            updateDisplay();
            return;
        }
        currentAnswer = evaluateExpression(currentQuestion);
        updateDisplay();
    }
    
    function insertAtCursor(text) {
        currentQuestion = currentQuestion.slice(0, cursorPosition) + text + currentQuestion.slice(cursorPosition);
        cursorPosition += text.length;
        updateAnswer();
    }
    
    function handleFunction(func) {
        switch(func) {
            case 'sin': insertAtCursor('sin('); break;
            case 'cos': insertAtCursor('cos('); break;
            case 'tan': insertAtCursor('tan('); break;
            case 'asin': insertAtCursor('asin('); break;
            case 'acos': insertAtCursor('acos('); break;
            case 'atan': insertAtCursor('atan('); break;
            case 'sqrt': insertAtCursor('√('); break;
            case 'cbrt': insertAtCursor('∛('); break;
            case 'square': insertAtCursor('²'); break;
            case 'cube': insertAtCursor('³'); break;
            case 'power': insertAtCursor('^'); break;
            case 'factorial': insertAtCursor('!'); break;
            case 'log': insertAtCursor('log('); break;
            case 'ln': insertAtCursor('ln('); break;
            case 'pi': insertAtCursor('π'); break;
            case 'e': insertAtCursor('e'); break;
            case 'pow10': insertAtCursor('10ˣ('); break;
            case 'powE': insertAtCursor('eˣ('); break;
            case 'percent': insertAtCursor('%'); break;
            case 'drg':
                switch(angleUnit) {
                    case 'DEG': angleUnit = 'RAD'; break;
                    case 'RAD': angleUnit = 'GRAD'; break;
                    case 'GRAD': angleUnit = 'DEG'; break;
                }
                updateAnswer();
                break;
            case 'fix':
                if (!fixMode) {
                    fixMode = true;
                    decimalPlaces = null;
                    updateDisplay();
                } else {
                    fixMode = false;
                    updateAnswer();
                }
                break;
            case 'left':
                if (cursorPosition > 0) {
                    cursorPosition--;
                    updateDisplay();
                    blinkingCursor.style.animation = 'none';
                    setTimeout(() => {
                        blinkingCursor.style.animation = 'blink 1s step-end infinite';
                    }, 10);
                }
                break;
            case 'right':
                if (cursorPosition < currentQuestion.length) {
                    cursorPosition++;
                    updateDisplay();
                    blinkingCursor.style.animation = 'none';
                    setTimeout(() => {
                        blinkingCursor.style.animation = 'blink 1s step-end infinite';
                    }, 10);
                }
                break;
            case 'backspace':
                if (cursorPosition > 0) {
                    currentQuestion = currentQuestion.slice(0, cursorPosition - 1) + currentQuestion.slice(cursorPosition);
                    cursorPosition--;
                    updateAnswer();
                }
                break;
            case 'clear':
                currentQuestion = '';
                cursorPosition = 0;
                updateAnswer();
                break;
            case 'clearAll':
                currentQuestion = '';
                currentAnswer = '0';
                cursorPosition = 0;
                if (!fixMode) decimalPlaces = null;
                updateDisplay();
                break;
        }
    }
    
    function handleMemory(action) {
        const currentValue = parseFloat(currentAnswer);
        switch(action) {
            case 'mc': memory = 0; break;
            case 'mr': insertAtCursor(memory.toString()); break;
            case 'm+': memory += currentValue; break;
            case 'm-': memory -= currentValue; break;
            case 'ms': memory = currentValue; break;
        }
    }
    
    function handleNumberInput(value) {
        if (fixMode && /^\d+$/.test(value)) {
            decimalPlaces = parseInt(value);
            fixMode = false;
            updateAnswer();
        } else {
            insertAtCursor(value);
        }
    }
    
    // Event listeners
    document.querySelectorAll('.calc-3d').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-value');
            const operator = btn.getAttribute('data-operator');
            const func = btn.getAttribute('data-func');
            const action = btn.getAttribute('data-action');
            const bracket = btn.getAttribute('data-bracket');
            
            if (value) handleNumberInput(value);
            else if (operator) insertAtCursor(operator);
            else if (bracket) insertAtCursor(bracket);
            else if (func) handleFunction(func);
            else if (action) handleMemory(action);
            
            setTimeout(() => {
                updateCursorPosition();
                blinkingCursor.style.animation = 'blink 1s step-end infinite';
            }, 50);
        });
    });
    
    // Draggable functionality
    const calculator = document.getElementById('professionalCalculator');
    const dragArea = document.getElementById('calculatorDragArea');
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    
    dragArea.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
        if (e.target.closest('button')) return;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === dragArea || dragArea.contains(e.target)) {
            isDragging = true;
            calculator.style.cursor = 'grabbing';
        }
    }
    
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            calculator.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
        }
    }
    
    function dragEnd(e) {
        isDragging = false;
        calculator.style.cursor = 'default';
    }
    
    // Minimize functionality
    function minimizeCalculator() {
        const calculatorElement = document.getElementById('professionalCalculator');
        const currentAnswerText = document.getElementById('calcAnswer').textContent;
        calculatorElement.style.display = 'none';
        
        const minimizedView = document.createElement('div');
        minimizedView.id = 'minimizedCalculatorView';
        minimizedView.className = 'minimized-calculator';
        minimizedView.innerHTML = `
            <span style="color: white; font-weight: bold;">🧮 Calculator: ${currentAnswerText}</span>
            <button id="restoreCalculator">□</button>
            <button id="closeMinimized">×</button>
        `;
        document.body.appendChild(minimizedView);
        
        document.getElementById('restoreCalculator').addEventListener('click', () => {
            calculatorElement.style.display = 'flex';
            minimizedView.remove();
            xOffset = 0;
            yOffset = 0;
            calculatorElement.style.transform = 'translate(-50%, -50%)';
        });
        
        document.getElementById('closeMinimized').addEventListener('click', () => {
            minimizedView.remove();
        });
    }
    
    document.getElementById('minimizeProfCalc').addEventListener('click', minimizeCalculator);
    document.getElementById('closeProfCalc').addEventListener('click', () => {
        document.getElementById('professionalCalculator').style.display = 'none';
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const calc = document.getElementById('professionalCalculator');
        if (calc && calc.style.display === 'flex') {
            const key = e.key;
            if (/[0-9]/.test(key)) handleNumberInput(key);
            if (key === '+') insertAtCursor('+');
            if (key === '-') insertAtCursor('-');
            if (key === '*') insertAtCursor('*');
            if (key === '/') insertAtCursor('/');
            if (key === '^') insertAtCursor('^');
            if (key === '(') insertAtCursor('(');
            if (key === ')') insertAtCursor(')');
            if (key === '.') insertAtCursor('.');
            if (key === 'Enter') updateAnswer();
            if (key === 'Escape') handleFunction('clear');
            if (key === 'Backspace') handleFunction('backspace');
            if (key === 'ArrowLeft') { e.preventDefault(); handleFunction('left'); }
            if (key === 'ArrowRight') { e.preventDefault(); handleFunction('right'); }
        }
    });
    
    // Click to position cursor - UPDATED for 24px font
    questionContainer.addEventListener('click', (e) => {
        const rect = questionDisplay.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const text = currentQuestion;
        
        // Get computed style
        const computedStyle = window.getComputedStyle(questionDisplay);
        const fontSize = computedStyle.fontSize;
        const fontFamily = computedStyle.fontFamily;
        const letterSpacing = computedStyle.letterSpacing;
        const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
        
        let bestPos = 0;
        let minDiff = Infinity;
        
        // Adjust click position by subtracting padding
        const adjustedClickX = clickX - paddingLeft;
        
        for (let i = 0; i <= text.length; i++) {
            const tempSpan = document.createElement('span');
            tempSpan.style.cssText = `
                position: absolute;
                visibility: hidden;
                font-size: ${fontSize};
                font-family: ${fontFamily};
                letter-spacing: ${letterSpacing};
                white-space: pre;
                padding: 0;
                margin: 0;
            `;
            tempSpan.textContent = text.slice(0, i) || ' ';
            document.body.appendChild(tempSpan);
            const width = tempSpan.offsetWidth;
            document.body.removeChild(tempSpan);
            
            const diff = Math.abs(width - adjustedClickX);
            if (diff < minDiff) {
                minDiff = diff;
                bestPos = i;
            }
        }
        
        cursorPosition = bestPos;
        updateDisplay();
        blinkingCursor.style.animation = 'blink 1s step-end infinite';
    });
    
    // Show calculator
    calculator.style.display = 'flex';
    setTimeout(() => {
        updateCursorPosition();
        blinkingCursor.style.animation = 'blink 1s step-end infinite';
    }, 100);
}

function openCalculator() {
    createProfessionalCalculator();
}
