// ==================== КАЛКУЛЯТОР ====================
let currentInput = '0';
let calculation = '';
let lastResult = null;
let isError = false;

// ФУНКСИЯҲОИ АСОСӢ
function appendNumber(num) {
    if (isError) clearError();
    
    if (currentInput === '0' || lastResult !== null) {
        currentInput = num;
        lastResult = null;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function appendDecimal() {
    if (isError) clearError();
    
    if (lastResult !== null) {
        currentInput = '0.';
        lastResult = null;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

function appendOperator(op) {
    if (isError) clearError();
    
    // Табдили операторҳо
    const operator = op === '×' ? '*' : op === '÷' ? '/' : op;
    
    if (currentInput !== '' && currentInput !== '0') {
        calculation += currentInput + ' ' + operator + ' ';
        currentInput = '';
    } else if (calculation !== '') {
        // Иваз кардани оператори охирин
        const parts = calculation.trim().split(' ');
        if (parts.length > 0 && isOperator(parts[parts.length - 1])) {
            parts[parts.length - 1] = operator;
            calculation = parts.join(' ') + ' ';
        } else {
            calculation += operator + ' ';
        }
    }
    updateDisplay();
}

function isOperator(token) {
    return ['+', '-', '*', '/'].includes(token);
}

function clearAll() {
    currentInput = '0';
    calculation = '';
    lastResult = null;
    isError = false;
    updateDisplay();
}

function clearError() {
    isError = false;
    document.getElementById('resultDisplay').classList.remove('error');
}

function backspace() {
    if (isError) {
        clearAll();
        return;
    }
    
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// ФУНКСИЯИ ҲИСОБКУНИИ СОДА
function calculateExpression(expr) {
    console.log("Ҳисобкунӣ барои:", expr);
    
    // Тоза кардани ифода
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    
    // Алгоритми ду марҳила
    // Марҳилаи 1: Зарб ва тақсим
    let i = 0;
    while (i < expr.length) {
        if (expr[i] === '*' || expr[i] === '/') {
            // Ёфтани рақами чап
            let leftStart = i - 1;
            while (leftStart >= 0 && /[\d.]/.test(expr[leftStart])) {
                leftStart--;
            }
            leftStart++;
            
            const left = parseFloat(expr.substring(leftStart, i));
            
            // Ёфтани рақами рост
            let rightEnd = i + 1;
            while (rightEnd < expr.length && /[\d.]/.test(expr[rightEnd])) {
                rightEnd++;
            }
            
            const right = parseFloat(expr.substring(i + 1, rightEnd));
            
            // Ҳисоб кардан
            let result;
            if (expr[i] === '*') {
                result = left * right;
            } else {
                if (right === 0) throw new Error("Тақсим бар сифр мумкин нест");
                result = left / right;
            }
            
            // Иваз кардан
            expr = expr.substring(0, leftStart) + result + expr.substring(rightEnd);
            i = leftStart + result.toString().length - 1;
        }
        i++;
    }
    
    // Марҳилаи 2: Ҷамъ ва тарҳ
    i = 0;
    while (i < expr.length) {
        if (expr[i] === '+' || (expr[i] === '-' && i > 0 && /[\d.]/.test(expr[i-1]))) {
            // Ёфтани рақами чап
            let leftStart = i - 1;
            while (leftStart >= 0 && /[\d.]/.test(expr[leftStart])) {
                leftStart--;
            }
            leftStart++;
            
            const left = parseFloat(expr.substring(leftStart, i));
            
            // Ёфтани рақами рост
            let rightEnd = i + 1;
            while (rightEnd < expr.length && /[\d.]/.test(expr[rightEnd])) {
                rightEnd++;
            }
            
            const right = parseFloat(expr.substring(i + 1, rightEnd));
            
            // Ҳисоб кардан
            let result;
            if (expr[i] === '+') {
                result = left + right;
            } else {
                result = left - right;
            }
            
            // Иваз кардан
            expr = expr.substring(0, leftStart) + result + expr.substring(rightEnd);
            i = leftStart + result.toString().length - 1;
        }
        i++;
    }
    
    const finalResult = parseFloat(expr);
    console.log("Натиҷа:", finalResult);
    return finalResult;
}

function calculate() {
    if (isError) {
        clearAll();
        return;
    }
    
    try {
        // Сохтани ифодаи пурра
        let fullExpression = (calculation + currentInput).trim();
        
        console.log("Ифодаи пурра:", fullExpression);
        
        if (!fullExpression) {
            showError("Ифода холӣ аст");
            return;
        }
        
        // Тоза кардан
        fullExpression = fullExpression.replace(/\s+/g, '');
        
        // Санҷиши ифода
        if (!/^[\d+\-*/.]+$/.test(fullExpression)) {
            showError("Ифода нодуруст");
            return;
        }
        
        // Ҳисоб кардан
        const result = calculateExpression(fullExpression);
        
        console.log("Натиҷаи ҳисоб:", result);
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error("Ҳисобкунӣ нодуруст");
        }
        
        // Намоиш
        lastResult = formatResult(result);
        calculation = fullExpression.replace(/\*/g, '×').replace(/\//g, '÷') + ' =';
        currentInput = lastResult;
        
        // Фиристодани ба Telegram (ВЕРСИЯИ ИСЛОҲШУДА - НАМЕПӮШАД)
        sendToTelegram(result);
        
    } catch (error) {
        console.error("Хатогӣ дар ҳисобкунӣ:", error);
        showError(error.message);
    } finally {
        updateDisplay();
    }
}

function formatResult(num) {
    // Раванди дақиқ кардан
    const rounded = Math.round(num * 10000000000) / 10000000000;
    
    if (Number.isInteger(rounded)) {
        return rounded.toString();
    } else {
        return parseFloat(rounded.toFixed(10)).toString();
    }
}

function updateDisplay() {
    document.getElementById('calcDisplay').textContent = calculation || '0';
    document.getElementById('resultDisplay').textContent = currentInput || '0';
    
    if (!isError) {
        document.getElementById('resultDisplay').classList.remove('error');
    }
}

function showError(message) {
    isError = true;
    const resultEl = document.getElementById('resultDisplay');
    resultEl.classList.add('error');
    currentInput = `Хатогӣ: ${message}`;
    updateDisplay();
}

// ==================== TELEGRAM INTEGRATION ====================
function sendToTelegram(result) {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            const formattedResult = formatResult(result);
            console.log("📤 Фиристодани ба Telegram:", formattedResult);
            
            // ФИРИСТОДАНИ МАЪЛУМОТ БА БОТ
            window.Telegram.WebApp.sendData(`RESULT: ${formattedResult}`);
            
            // ⚠️ ВАҚТЕ, КИ НАТИҶА ФИРИСТОДА МЕШАВАД, WEB APP НАМЕПӮШАД!
            // ИН САТРҲОРО НЕСТ КУНЕД:
            // setTimeout(() => {
            //     if (window.Telegram.WebApp.close) {
            //         window.Telegram.WebApp.close();
            //     }
            // }, 500);
            
            // Намоиши паёми муваффақият дар Web App
            showSuccessMessage(formattedResult);
            
        } else {
            // Барои тести браузер
            console.log("Натиҷа (дар Telegram ба бот фиристода мешуд):", result);
            showSuccessMessage(result.toString());
        }
    } catch (error) {
        console.error("Хатогӣ дар фиристодани маълумот:", error);
        showErrorMessage("Хатогӣ дар фиристодани натиҷа");
    }
}

// ==================== SUCCESS/ERROR MESSAGES ====================
function showSuccessMessage(result) {
    // Тоза кардани паёмҳои қаблӣ
    removeExistingMessages();
    
    // Сохтани HTML барои паёми муваффақият
    const successHTML = `
        <div class="message-overlay" id="messageOverlay">
            <div class="message-container success-container">
                <div class="message-icon success-icon">✅</div>
                <h3 class="message-title">Натиҷа ба бот фиристода шуд!</h3>
                <p class="message-text">🔢 Натиҷа: <strong>${result}</strong></p>
                <p class="message-subtext">Натиҷа дар Telegram намоиш дода мешавад.</p>
                <div class="message-buttons">
                    <button class="message-btn continue-btn" onclick="closeMessage()">
                        Идома додан
                    </button>
                    <button class="message-btn close-app-btn" onclick="closeWebApp()">
                        Пӯшидани калкулятор
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Илова кардани паём ба саҳифа
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = successHTML;
    document.body.appendChild(messageDiv);
    
    // Манъи скрол
    document.body.style.overflow = 'hidden';
    
    // Илова кардани CSS агар вуҷуд надошта бошад
    addMessageStyles();
}

function showErrorMessage(message) {
    // Тоза кардани паёмҳои қаблӣ
    removeExistingMessages();
    
    // Сохтани HTML барои паёми хатогӣ
    const errorHTML = `
        <div class="message-overlay" id="messageOverlay">
            <div class="message-container error-container">
                <div class="message-icon error-icon">❌</div>
                <h3 class="message-title">Хатогӣ</h3>
                <p class="message-text">${message}</p>
                <div class="message-buttons">
                    <button class="message-btn ok-btn" onclick="closeMessage()">
                        Фаҳмидам
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Илова кардани паём ба саҳифа
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = errorHTML;
    document.body.appendChild(messageDiv);
    
    // Манъи скрол
    document.body.style.overflow = 'hidden';
    
    // Илова кардани CSS агар вуҷуд надошта бошад
    addMessageStyles();
}

function showInfoMessage() {
    // Тоза кардани паёмҳои қаблӣ
    removeExistingMessages();
    
    // Сохтани HTML барои паёми маълумот
    const infoHTML = `
        <div class="message-overlay" id="messageOverlay">
            <div class="message-container info-container">
                <div class="message-icon info-icon">ℹ️</div>
                <h3 class="message-title">Калкулятори Telegram</h3>
                <div class="message-content">
                    <p><strong>🌟 Хусусиятҳо:</strong></p>
                    <ul>
                        <li>Ҳисобкунии арифметӣ (+, -, ×, ÷)</li>
                        <li>Тартиби дурусти амалҳо</li>
                        <li>Натиҷа ба боти Telegram фиристода мешавад</li>
                        <li>Барои телефонҳо оптимизатсияшуда</li>
                    </ul>
                    
                    <p><strong>🎯 Истифода:</strong></p>
                    <ol>
                        <li>Рақамҳо ва амалҳоро пахш кунед</li>
                        <li>Тугмаи "="-ро пахш кунед</li>
                        <li>Натиҷа ба бот фиристода мешавад</li>
                        <li>Web App <strong>НАМЕПӮШАД</strong> - шумо метавонед идома диҳед!</li>
                    </ol>
                    
                    <p><strong>📝 Барои пӯшидани Web App:</strong></p>
                    <ul>
                        <li>Тугмаи "Пӯшидани калкулятор"-ро пахш кунед</li>
                        <li>Ё тугмаи "✕"-ро дар боло пахш кунед</li>
                        <li>Ё дар Telegram тугмаи "Back"-ро пахш кунед</li>
                    </ul>
                </div>
                <div class="message-buttons">
                    <button class="message-btn ok-btn" onclick="closeMessage()">
                        Фаҳмидам
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Илова кардани паём ба саҳифа
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = infoHTML;
    document.body.appendChild(messageDiv);
    
    // Манъи скрол
    document.body.style.overflow = 'hidden';
    
    // Илова кардани CSS агар вуҷуд надошта бошад
    addMessageStyles();
}

function addMessageStyles() {
    if (document.getElementById('messageStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'messageStyles';
    style.textContent = `
        .message-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }
        
        .message-container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            width: 100%;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            text-align: center;
            animation: slideIn 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .message-icon {
            font-size: 70px;
            margin-bottom: 20px;
        }
        
        .success-icon {
            color: #4CAF50;
        }
        
        .error-icon {
            color: #ff6b6b;
        }
        
        .info-icon {
            color: #2196F3;
        }
        
        .message-title {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .message-text {
            color: #666;
            margin-bottom: 10px;
            font-size: 1.1rem;
            line-height: 1.5;
        }
        
        .message-subtext {
            color: #777;
            margin-bottom: 25px;
            font-size: 1rem;
        }
        
        .message-content {
            text-align: right;
            color: #666;
            margin-bottom: 25px;
            font-size: 1rem;
            line-height: 1.6;
        }
        
        .message-content ul, .message-content ol {
            margin-right: 20px;
            margin-bottom: 15px;
        }
        
        .message-content li {
            margin-bottom: 8px;
        }
        
        .message-content strong {
            color: #333;
        }
        
        .message-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }
        
        .message-btn {
            border: none;
            border-radius: 10px;
            padding: 15px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s ease;
        }
        
        .message-btn:active {
            transform: scale(0.98);
        }
        
        .continue-btn {
            background: #4CAF50;
            color: white;
        }
        
        .close-app-btn {
            background: #f0f0f0;
            color: #666;
        }
        
        .ok-btn {
            background: #2196F3;
            color: white;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(50px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            .message-container {
                background: #2d2d2d;
                color: white;
            }
            
            .message-title {
                color: white;
            }
            
            .message-text, .message-subtext, .message-content {
                color: #ccc;
            }
            
            .close-app-btn {
                background: #3d3d3d;
                color: #ccc;
            }
            
            .message-content strong {
                color: white;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function removeExistingMessages() {
    const existingOverlay = document.getElementById('messageOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    document.body.style.overflow = '';
}

function closeMessage() {
    removeExistingMessages();
}

function closeWebApp() {
    closeMessage();
    
    // Интизорӣ ва сипас пӯшидан
    setTimeout(() => {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.close) {
            window.Telegram.WebApp.close();
        } else {
            alert("Калкулятор пӯшида мешавад. Барои истифодаи боз, ботро аз нав кушоед.");
        }
    }, 300);
}

// ==================== TEST FUNCTIONS ====================
function runTests() {
    const tests = [
        { expr: "5*8", expected: 40, desc: "5 × 8" },
        { expr: "2+2*2", expected: 6, desc: "2 + 2 × 2" },
        { expr: "9*4", expected: 36, desc: "9 × 4" },
        { expr: "10/2", expected: 5, desc: "10 ÷ 2" },
        { expr: "3+4*2", expected: 11, desc: "3 + 4 × 2" },
    ];
    
    console.log("🧪 === ТЕСТИ КАЛКУЛЯТОР ===");
    
    let passed = 0;
    tests.forEach(test => {
        try {
            const result = calculateExpression(test.expr);
            const success = Math.abs(result - test.expected) < 0.000001;
            
            if (success) {
                console.log(`✅ ${test.desc}: ${test.expr} = ${result}`);
                passed++;
            } else {
                console.log(`❌ ${test.desc}: ${test.expr} = ${result} (expected: ${test.expected})`);
            }
        } catch (e) {
            console.log(`❌ ${test.desc}: ${test.expr} -> ${e.message}`);
        }
    });
    
    console.log(`📊 Натиҷа: ${passed}/${tests.length} тест гузашт`);
    
    // Намоиши натиҷа дар Web App
    showSuccessMessage(`Тест: ${passed}/${tests.length} гузашт`);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Калкулятор омода аст!");
    
    // Initialize Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            console.log("✅ Telegram Web App инициализатсия шуд");
            
            // Adjust for Telegram theme
            if (window.Telegram.WebApp.colorScheme === 'dark') {
                document.body.style.backgroundColor = '#1e1e1e';
                document.documentElement.style.setProperty('--bg-color', '#1e1e1e');
                document.documentElement.style.setProperty('--text-color', '#ffffff');
            }
            
            // Илова кардани тугмаи пӯшидан дар Telegram (ихтиёрӣ)
            if (window.Telegram.WebApp.MainButton) {
                window.Telegram.WebApp.MainButton.setText('Пӯшидан');
                window.Telegram.WebApp.MainButton.onClick(() => {
                    window.Telegram.WebApp.close();
                });
                window.Telegram.WebApp.MainButton.show();
            }
            
        } catch (e) {
            console.log("ℹ Telegram Web App дастрас нест, браузер истифода мешавад");
        }
    }
    
    // Fullscreen adjustments for mobile
    setTimeout(() => {
        // Adjust for mobile fullscreen
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Fix for iOS Safari
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            document.body.style.height = 'calc(var(--vh, 1vh) * 100)';
        }
    }, 100);
    
    // Keyboard support
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9') {
            appendNumber(key);
        } else if (key === '.') {
            appendDecimal();
        } else if (key === '+') {
            appendOperator('+');
        } else if (key === '-') {
            appendOperator('-');
        } else if (key === '*') {
            appendOperator('×');
        } else if (key === '/') {
            appendOperator('/');
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calculate();
        } else if (key === 'Escape' || key === 'Delete') {
            clearAll();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 't' && event.ctrlKey) {
            event.preventDefault();
            runTests();
        } else if (key === 'i' && event.ctrlKey) {
            event.preventDefault();
            showInfoMessage();
        }
    });
    
    // Auto-test
    setTimeout(() => {
        console.log("🔍 Авто-тест:");
        try {
            const test1 = calculateExpression("5*8");
            console.log(`5*8 = ${test1} ${test1 === 40 ? '✅' : '❌'}`);
            
            const test2 = calculateExpression("2+2*2");
            console.log(`2+2*2 = ${test2} ${test2 === 6 ? '✅' : '❌'}`);
            
            if (test1 === 40 && test2 === 6) {
                console.log("🎉 Ҳамаи тестҳо гузаштанд!");
            }
        } catch (e) {
            console.log("⚠ Авто-тест ноком шуд:", e.message);
        }
    }, 500);
    
    // Prevent zoom on mobile
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Resize handler for mobile
    window.addEventListener('resize', function() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
});

// Глобал кардани функсияҳо
window.showInfo = showInfoMessage;
window.runTests = runTests;