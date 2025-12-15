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

// ==================== TELEGRAM INTEGRATION (ИСЛОҲШУДА) ====================
function sendToTelegram(result) {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            const formattedResult = formatResult(result);
            console.log("📤 Фиристодани ба Telegram:", formattedResult);
            
            // ФИРИСТОДАНИ МАЪЛУМОТ БА БОТ
            window.Telegram.WebApp.sendData(`RESULT: ${formattedResult}`);
            
            // ⚠️ ВАҚТЕ, КИ НАТИҶА ФИРИСТОДА МЕШАВАД, WEB APP НАМЕПӮШАД!
            // ИН САТРҲОРО НЕСТ КУНЕД Ё КОММЕНТ КУНЕД:
            // setTimeout(() => {
            //     if (window.Telegram.WebApp.close) {
            //         window.Telegram.WebApp.close();
            //     }
            // }, 500);
            
            // Намоиши паёми муваффақият дар Web App
            showSuccessInApp(formattedResult);
            
        } else {
            // Барои тести браузер
            console.log("Натиҷа (дар Telegram ба бот фиристода мешуд):", result);
            showSuccessInApp(result.toString());
        }
    } catch (error) {
        console.error("Хатогӣ дар фиристодани маълумот:", error);
        showErrorInApp("Хатогӣ дар фиристодани натиҷа");
    }
}

// Функсия барои намоиши муваффақият дар Web App
function showSuccessInApp(result) {
    // Сохтани паёми муваффақият
    const successHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 90%;
            width: 350px;
            text-align: center;
            animation: fadeIn 0.3s ease;
        ">
            <div style="font-size: 60px; color: #4CAF50; margin-bottom: 15px;">✅</div>
            <h3 style="color: #333; margin-bottom: 15px; font-size: 22px;">
                Натиҷа ба бот фиристода шуд!
            </h3>
            <p style="color: #666; margin-bottom: 10px; font-size: 18px;">
                🔢 Натиҷа: <strong style="color: #4CAF50; font-size: 24px;">${result}</strong>
            </p>
            <p style="color: #777; margin-bottom: 20px; font-size: 16px;">
                Натиҷа дар Telegram намоиш дода мешавад.
            </p>
            <button onclick="closeSuccessMessage()" style="
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 30px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
            ">
                Идома додан
            </button>
            <button onclick="sendCloseRequest()" style="
                background: #f0f0f0;
                color: #666;
                border: none;
                border-radius: 8px;
                padding: 10px 30px;
                font-size: 14px;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
            ">
                Пӯшидани калкулятор
            </button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        " id="overlay"></div>
    `;
    
    // Илова кардани паём ба саҳифа
    const successDiv = document.createElement('div');
    successDiv.id = 'successMessage';
    successDiv.innerHTML = successHTML;
    document.body.appendChild(successDiv);
    
    // Илова кардани CSS барои animation
    if (!document.querySelector('#successStyles')) {
        const style = document.createElement('style');
        style.id = 'successStyles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Функсия барои пӯшидани паёми муваффақият
function closeSuccessMessage() {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.remove();
    }
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Функсия барои дархости пӯшидани Web App (ихтиёрӣ)
function sendCloseRequest() {
    closeSuccessMessage();
    
    // Агар корбар хоҳад Web App-ро пӯшад
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.close) {
        // Интизорӣ барои дидани паём ва сипас пӯшидан
        setTimeout(() => {
            window.Telegram.WebApp.close();
        }, 300);
    } else {
        alert("Калкулятор пӯшида мешавад. Барои истифодаи боз, ботро аз нав кушоед.");
    }
}

// Функсия барои намоиши хатогӣ дар Web App
function showErrorInApp(message) {
    const errorHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 90%;
            width: 350px;
            text-align: center;
        ">
            <div style="font-size: 60px; color: #ff6b6b; margin-bottom: 15px;">❌</div>
            <h3 style="color: #333; margin-bottom: 15px; font-size: 22px;">
                Хатогӣ
            </h3>
            <p style="color: #666; margin-bottom: 20px; font-size: 16px;">
                ${message}
            </p>
            <button onclick="closeSuccessMessage()" style="
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 30px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
            ">
                Тоза кардан
            </button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        "></div>
    `;
    
    closeSuccessMessage(); // Тоза кардани паёмҳои қаблӣ
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = errorHTML;
    document.body.appendChild(errorDiv);
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
    showSuccessInApp(`Тест: ${passed}/${tests.length} гузашт`);
}

function showInfo() {
    const info = `
📱 КАЛКУЛЯТОРИ TELEGRAM

🌟 Хусусиятҳо:
• Ҳисобкунии арифметӣ (+, -, ×, ÷)
• Тартиби дурусти амалҳо
• Натиҷа ба боти Telegram фиристода мешавад
• Барои телефонҳо оптимизатсияшуда

🎯 Истифода:
1. Рақамҳо ва амалҳоро пахш кунед
2. Тугмаи "="-ро пахш кунед
3. Натиҷа ба бот фиристода мешавад
4. Web App НАМЕПӮШАД - шумо метавонед идома диҳед!

📝 Барои пӯшидани Web App:
• Тугмаи "Пӯшидани калкулятор"-ро пахш кунед
• Ё тугмаи "✕"-ро дар боло пахш кунед
• Ё дар Telegram тугмаи "Back"-ро пахш кунед

⚠ Эзоҳ: Барои истифода дар Telegram бояд бот сохта шуда бошад.
    `;
    
    // Намоиши маълумот дар Web App
    const infoHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 90%;
            width: 350px;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <h3 style="color: #333; margin-bottom: 15px; text-align: center; font-size: 22px;">
                🧮 Калкулятори Telegram
            </h3>
            <div style="color: #666; font-size: 16px; line-height: 1.6; text-align: right;">
                <p><strong>🌟 Хусусиятҳо:</strong></p>
                <p>• Ҳисобкунии арифметӣ (+, -, ×, ÷)</p>
                <p>• Тартиби дурусти амалҳо</p>
                <p>• Натиҷа ба боти Telegram фиристода мешавад</p>
                <p>• Барои телефонҳо оптимизатсияшуда</p>
                
                <p style="margin-top: 20px;"><strong>🎯 Истифода:</strong></p>
                <p>1. Рақамҳо ва амалҳоро пахш кунед</p>
                <p>2. Тугмаи "="-ро пахш кунед</p>
                <p>3. Натиҷа ба бот фиристода мешавад</p>
                <p>4. Web App <strong>НАМЕПӮШАД</strong> - шумо метавонед идома диҳед!</p>
                
                <p style="margin-top: 20px;"><strong>📝 Барои пӯшидани Web App:</strong></p>
                <p>• Тугмаи "Пӯшидани калкулятор"-ро пахш кунед</p>
                <p>• Ё тугмаи "✕"-ро дар боло пахш кунед</p>
            </div>
            <button onclick="closeSuccessMessage()" style="
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 30px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                margin-top: 20px;
            ">
                Фаҳмидам
            </button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        " onclick="closeSuccessMessage()"></div>
    `;
    
    closeSuccessMessage(); // Тоза кардани паёмҳои қаблӣ
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = infoHTML;
    document.body.appendChild(infoDiv);
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
            showInfo();
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
});