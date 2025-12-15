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
        
        // Фиристодани ба Telegram
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
            
            window.Telegram.WebApp.sendData(`RESULT: ${formattedResult}`);
            
            // Пӯшидани пас аз 500ms
            setTimeout(() => {
                if (window.Telegram.WebApp.close) {
                    window.Telegram.WebApp.close();
                }
            }, 500);
        } else {
            // Барои тести браузер
            console.log("Натиҷа (дар Telegram ба бот фиристода мешуд):", result);
            alert(`✅ Натиҷа: ${result}\n\nДар Telegram ба бот фиристода мешуд.`);
        }
    } catch (error) {
        console.error("Хатогӣ дар фиристодани маълумот:", error);
        alert("⚠ Хатогӣ дар фиристодани натиҷа");
    }
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
    alert(`🧪 Тест анҷом шуд!\n${passed}/${tests.length} тест гузашт`);
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
4. Web App пӯшида мешавад

⚠ Эзоҳ: Барои истифода дар Telegram бояд бот сохта шуда бошад.
    `;
    
    alert(info);
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