                                        // ДОБАВЛЕНИЕ ОБРАБОТЧИКОВ ДЛЯ КНОПОК
function addEventHandler() {
    const getValuesFor_A_B = () => {
        const m = parseInt(document.getElementById('count_a').value) || 0;
        const n = parseInt(document.getElementById('count_b').value) || 0;
        
        let a = [];
        for (let i = 1; i <= m; i++) {
            a.push(parseFloat(document.getElementById(`A${i}`).value) || 0);
        }
    
        let b = [];
        for (let i = 1; i <= n; i++) {
            b.push(parseFloat(document.getElementById(`B${i}`).value) || 0);
        }
    
        return {
            a: a,
            b: b
        };
    };

    document.getElementById('btn_save_params').addEventListener('click', () => {
        const m = parseInt(document.getElementById('count_a').value) || 0;
        const n = parseInt(document.getElementById('count_b').value) || 0;
        if (isNaN(m) || m <= 0 || isNaN(n) || n <= 0) {
            alert('Пожалуйста, введите корректные положительные числа для количества поставщиков и потребителей.');
            return;
        }
        drawSystem(m, n);
    });
    
    document.getElementById('btn_draw_c_system').addEventListener('click', () => {
        let res = getValuesFor_A_B();
        if (res.a.some(v => isNaN(v) || v <= 0) || res.b.some(v => isNaN(v) || v <= 0)) {
            alert('Пожалуйста, введите корректные положительные значения для возможностей и потребностей.');
            return;
        }
        draw_C_System(res.a, res.b);
        
        const methodChoice = document.getElementById('method-choice') || document.querySelector('.method-choice');
        const solveBtn = document.getElementById('btn_solve');
        const clearBtn = document.getElementById('btn_clear_table');

        if (methodChoice) methodChoice.style.display = 'inline-block';
        if (solveBtn) solveBtn.style.display = 'inline-block';
        if (clearBtn) clearBtn.style.display = 'inline-block';
    });
    
    document.getElementById('btn_solve').addEventListener('click', () => {
        let res = getValuesFor_A_B();
    
        let c = [];
        for (let i = 0; i < res.a.length; i++) {
            let row = [];
            for (let j = 0; j < res.b.length; j++) {
                const value = parseFloat(document.getElementById(`c${i}${j}`).value) || 0;
                row.push(value);
            }
            c.push(row);
        }

        const method = document.querySelector('input[name="method"]:checked')?.value || 'northwest';
        console.log(`Выбран метод: ${method}`);

        let solution;
        if (method === 'northwest') {
            solution = solveNorthwest(res.a, res.b, c);
        } else if (method === 'minimum') {
            solution = solveMinimumElement(res.a, res.b, c);
        } else if (method === 'Fogel') {
            solution = solveVogelApproximation(res.a, res.b, c);
        } else if (method === 'doublePref') {
            solution = solveDoublePreference(res.a, res.b, c);
        }
        
        document.getElementById('title_1').style.display = 'block';
    });

    document.getElementById('btn_clear_table').addEventListener('click', () => {
        document.getElementById('solved_matrix').replaceChildren();
        document.getElementById('history_solution').replaceChildren();

        document.getElementById('title_1').style.display = 'none';

        document.getElementById('condition').innerHTML = '';
        document.getElementById('sum_a').innerHTML = '';
        document.getElementById('sum_b').innerHTML = '';
        document.getElementById('method_description').innerHTML = '';
    });

    document.getElementById('btn_load_file').addEventListener('click', () => {
        document.getElementById('file_input').click();
    });

    document.getElementById('file_input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
}

addEventHandler();

function showTab(tabId) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Показываем выбранную вкладку
    document.getElementById(tabId).classList.add('active');
}
/**
 * Обработка загруженного файла с данными транспортной задачи
 * @param {File} file Загруженный файл
 */
function handleFileUpload(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const processText = (text) => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 4) throw new Error('Файл должен содержать как минимум 4 строки');
        
        const [m, n] = lines[0].split(/\s+/).map(Number);
        if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) throw new Error('Некорректные значения для количества поставщиков или потребителей');
        
        const supplies = lines[1].split(/\s+/).map(Number);
        if (supplies.length !== m || supplies.some(s => isNaN(s) || s < 0)) throw new Error('Некорректные значения запасов поставщиков');
        
        const demands = lines[2].split(/\s+/).map(Number);
        if (demands.length !== n || demands.some(d => isNaN(d) || d < 0)) throw new Error('Некорректные значения потребностей потребителей');
        
        const costs = [];
        for (let i = 3; i < 3 + m; i++) {
            const row = lines[i].split(/\s+/).map(Number);
            if (row.length !== n || row.some(c => isNaN(c) || c < 0)) throw new Error(`Некорректные значения тарифов в строке ${i}`);
            costs.push(row);
        }

        applyDataToInterface(m, n, supplies, demands, costs);
    };

    const processExcel = (data) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length < 4) throw new Error('Файл должен содержать как минимум 4 строки');

            const [m, n] = jsonData[0].map(Number);
            if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) throw new Error('Некорректные значения для количества поставщиков или потребителей');

            const supplies = jsonData[1].map(Number);
            if (supplies.length !== m || supplies.some(s => isNaN(s) || s < 0)) throw new Error('Некорректные значения запасов поставщиков');

            const demands = jsonData[2].map(Number);
            if (demands.length !== n || demands.some(d => isNaN(d) || d < 0)) throw new Error('Некорректные значения потребностей потребителей');

            const costs = [];
            for (let i = 3; i < 3 + m; i++) {
                const row = jsonData[i].map(Number);
                if (row.length !== n || row.some(c => isNaN(c) || c < 0)) throw new Error(`Некорректные значения тарифов в строке ${i}`);
                costs.push(row);
            }

            applyDataToInterface(m, n, supplies, demands, costs);
        } catch (error) {
            alert('Ошибка при чтении Excel файла: ' + error.message);
        }
    };

    const applyDataToInterface = (m, n, supplies, demands, costs) => {
        document.getElementById('count_a').value = m;
        document.getElementById('count_b').value = n;
        drawSystem(m, n);

        for (let i = 0; i < m; i++) {
            const input = document.getElementById(`A${i + 1}`);
            if (input) input.value = supplies[i];
        }

        for (let i = 0; i < n; i++) {
            const input = document.getElementById(`B${i + 1}`);
            if (input) input.value = demands[i];
        }

        document.getElementById('btn_draw_c_system').click();
        draw_C_System(supplies, demands);

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const input = document.getElementById(`c${i}${j}`);
                if (input) input.value = costs[i][j];
            }
        }
    };

    if (fileExtension === 'docx') {
        const reader = new FileReader();
        reader.onload = function(e) {
            mammoth.extractRawText({ arrayBuffer: e.target.result })
                .then(result => {
                    try { processText(result.value); }
                    catch (error) { alert('Ошибка при чтении файла: ' + error.message); }
                })
                .catch(error => alert('Ошибка при чтении файла: ' + error.message));
        };
        reader.onerror = function() {
            alert('Ошибка при чтении файла');
        };
        reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'txt') {
        const reader = new FileReader();
        reader.onload = e => {
            try { processText(e.target.result); }
            catch (error) { alert('Ошибка при чтении файла: ' + error.message); }
        };
        reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = function(e) {
            try { processExcel(e.target.result); }
            catch (error) { alert('Ошибка при чтении файла: ' + error.message); }
        };
        reader.onerror = function() {
            alert('Ошибка при чтении файла');
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Неподдерживаемый формат файла. Используйте .txt, .docx или .xlsx файлы.');
    }
}

/**
 * Отрисовка HTML для заполнения системы (a, b)
 * @param {number} m кол-во поставщиков
 * @param {number} n кол-во потребителей
 */
function drawSystem(m, n) {
    // Клонируем шаблоны
    const suppliersTemplate = document.getElementById('suppliers-template').cloneNode(true);
    const consumersTemplate = document.getElementById('consumers-template').cloneNode(true);

    // Показываем шаблоны
    suppliersTemplate.style.display = 'block';
    consumersTemplate.style.display = 'block';

    // Заполняем заголовки и поля ввода для поставщиков
    const suppliersHeader = suppliersTemplate.querySelector('#suppliers-header');
    const suppliersInputs = suppliersTemplate.querySelector('#suppliers-inputs');
    
    for (let i = 1; i <= m; i++) {
        const th = document.createElement('th');
        th.innerHTML = `A<sub>${i}</sub>`;
        suppliersHeader.appendChild(th);

        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `A${i}`;
        input.placeholder = `a${i}`;
        td.appendChild(input);
        suppliersInputs.appendChild(td);
    }

    // Заполняем заголовки и поля ввода для потребителей
    const consumersHeader = consumersTemplate.querySelector('#consumers-header');
    const consumersInputs = consumersTemplate.querySelector('#consumers-inputs');
    
    for (let i = 1; i <= n; i++) {
        const th = document.createElement('th');
        th.innerHTML = `B<sub>${i}</sub>`;
        consumersHeader.appendChild(th);

        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `B${i}`;
        input.placeholder = `b${i}`;
        td.appendChild(input);
        consumersInputs.appendChild(td);
    }

    // Добавляем таблицы на страницу
    document.getElementById('a_values').replaceChildren(suppliersTemplate);
    document.getElementById('b_values').replaceChildren(consumersTemplate);
    
    // Показываем кнопку для ввода тарифов
    document.getElementById('btn_draw_c_system').style.display = 'inline-block';
}

/**
 * Отрисовка HTML таблицы для заполнения тарифов
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 */
function draw_C_System(a, b) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.margin = '20px 0';
    table.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    
    let tBody = document.createElement('tbody');

    let instructionText = document.createElement('p');
    instructionText.textContent = 'Введите тарифы: ';
    //instructionText.style.marginBottom = '10px';

    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    td1.style.color = 'white';
    td1.style.padding = '10px';
    td1.style.border = '1px solid #ddd';
    trHead.appendChild(td1);
    
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.style.padding = '10px';
        td.style.border = '1px solid #ddd';
        td.style.textAlign = 'center';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    tBody.appendChild(trHead);

    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.style.padding = '10px';
        tdZero.style.border = '1px solid #ddd';
        tdZero.style.textAlign = 'center';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        
        for (let j = 0; j < n; j++)  {
            let td = document.createElement('td');
            td.style.padding = '10px';
            td.style.border = '1px solid #ddd';
            td.style.textAlign = 'center';
            
            let input = document.createElement('input');
            input.placeholder = `c${i+1},${j+1}`; 
            input.type = "number";
            input.style.width = '60px';
            input.style.padding = '5px';
            input.style.border = '1px solid #ddd';
            input.style.borderRadius = '4px';
            input.style.textAlign = 'center';
            input.id = `c${i}${j}`;           
            td.appendChild(input);
            tr.appendChild(td);
        }
        tBody.appendChild(tr);
    }
    
    table.appendChild(tBody);

    let cValuesContainer = document.getElementById('c_values');
    cValuesContainer.replaceChildren();
    cValuesContainer.appendChild(instructionText);
    cValuesContainer.appendChild(table);
}
/**
 * Определяет тип транспортной задачи и добавляет фиктивных поставщиков/потребителей при необходимости
 * @param {number[]} a Значения для поставщиков (модифицируется)
 * @param {number[]} b Значения для потребителей (модифицируется)
 * @param {number[][]} costs Значения тарифов (модифицируется)
 * @param {HTMLElement} conditionElement Элемент для вывода условия разрешимости
 * @returns {Object} Объект с типом задачи и индексами фиктивных поставщика/потребителя
 */
function determineTaskType(a, b, costs, conditionElement) {
    // Вычисление суммы запасов и потребностей
    let aSum = a.reduce((prev, cur) => prev + cur, 0);
    let bSum = b.reduce((prev, cur) => prev + cur, 0);

    // Вывод суммы по поставщикам и потребителям
    document.getElementById('sum_a').innerHTML = `Возможности поставщиков: ${aSum}`;
    document.getElementById('sum_b').innerHTML = `Потребности потребителей: ${bSum}`;

    let fictiveSupplierIndex = -1;
    let fictiveConsumerIndex = -1;

    // Проверка условия разрешимости
    if (aSum > bSum) {
        b.push(aSum - bSum);
        conditionElement.innerHTML = `Условие разрешимости не выполняется: Возможностей у поставщиков больше, чем потребностей у потребителей. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного потребителя с тарифами 0.`;
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
        fictiveConsumerIndex = b.length - 1;
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        conditionElement.innerHTML = `Условие разрешимости не выполняется: Возможностей у потребителей больше, чем запасов у поставщиков. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного поставщика с тарифами 0.`;
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
        fictiveSupplierIndex = a.length - 1;
    } else {
        conditionElement.innerHTML = `Условие разрешимости выполняется: Возможностей у поставщиков столько же, сколько и потребностей у потребителей. 
        <br>Тип задачи: закрытая транспортная задача.`;
    }

    return { fictiveSupplierIndex, fictiveConsumerIndex };
}
/**
 * Отрисовка промежуточного шага построения опорного плана
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 * @param {number[][]} c цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 * @param {string} stepDescription описание текущего шага
 */
function drawIntermediateStep(a, b, c, x, indexesForBaza, stepDescription) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    table.style.marginBottom = '20px';
    let tBody = document.createElement('tbody');

    let stepHeader = document.createElement('div');
    stepHeader.style.fontWeight = 'bold';
    stepHeader.style.marginBottom = '10px';
    stepHeader.innerHTML = stepDescription;
    
    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    trHead.appendChild(td1);
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    tBody.appendChild(trHead);

    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        for (let j = 0; j < n; j++) {
            let td = document.createElement('td');
            td.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: red;"></span>
                    <span style="color: rgb(58, 0, 248);">${c[i][j]}</span>
                </div>
                <div style="text-align: center;">${x[i][j]}</div>`;

            for (let cell of indexesForBaza) {
                if (i == cell.row && j == cell.col) {
                    td.style.background = 'Lightgreen';
                }
            }

            tr.appendChild(td);
        }
        tBody.appendChild(tr);
    }

    table.appendChild(tBody);

    let div = document.createElement('div');
    div.style.marginBottom = '20px';
    div.appendChild(stepHeader);
    div.appendChild(table);

    document.getElementById('solved_matrix').appendChild(div);
}

/**
 * Отрисовка HTML таблицы решения для исходного опорного плана
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 * @param {number[][]} c цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 */
function drawTableInitialPlan(a, b, c, x, indexesForBaza) {
    let m = a.length;
    let n = b.length;

    let planHeader = document.createElement('div');
    planHeader.style.fontWeight = 'bold';
    planHeader.style.marginBottom = '10px';
    planHeader.innerHTML = `Итоговый исходный опорный план X<sub>0</sub>:`;
    
    let table = document.createElement('table');
    table.style.marginBottom = '20px';
    let tBody = document.createElement('tbody');

    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    trHead.appendChild(td1);
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    tBody.appendChild(trHead);

    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        for (let j = 0; j < n; j++) {
            let td = document.createElement('td');
            td.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: red;"></span>
                    <span style="color: rgb(58, 0, 248);">${c[i][j]}</span>
                </div>
                <div style="text-align: center;">${x[i][j]}</div>`;

            for (let cell of indexesForBaza) {
                if (i == cell.row && j == cell.col) {
                    td.style.background = 'Lightgreen';
                }
            }

            tr.appendChild(td);
        }
        tBody.appendChild(tr);
    }

    table.appendChild(tBody);

    let totalCost = 0;
    for (let cell of indexesForBaza) {
        let [i, j] = [cell.row, cell.col];
        totalCost += x[i][j] * c[i][j];
    }

    let costMessage = document.createElement('div');
    costMessage.style.marginBottom = '20px';
    costMessage.style.fontWeight = 'bold';
    costMessage.innerHTML = `Суммарные транспортные расходы в исходном опорном плане: Z<sub>0</sub> = ${totalCost}`;

    // Вычисляем потенциалы u и v
    let [u, v] = calculatePotentials(a, b, c, indexesForBaza);
    let deltas = calculateDeltas(a, b, c, x, indexesForBaza);
    let deltaMessage = document.createElement('div');
    deltaMessage.style.marginBottom = '20px';
    deltaMessage.innerHTML = `Проверяем исходный опорный план X<sub>0</sub> на оптимальность.  <br>
    Для этого найдём значения потенциалов и оценки свободных клеток.<br>
    ${formatPotentials(u, v, a, b, c, indexesForBaza)}
    ${formatDeltas(deltas, u, v, c)}`;

    let hasPositiveDelta = deltas.some(d => d.delta > 0);

    let optimalityMessage = document.createElement('div');
    optimalityMessage.style.marginBottom = '20px';
    optimalityMessage.style.fontWeight = 'bold';
    if (hasPositiveDelta) {
        optimalityMessage.innerHTML = `Исходный опорный план X<sub>0</sub> не оптимален, так как есть положительные оценки свободных клеток.<br>
        Выберем наибольшую положительную оценку, построим цикл пересчета и получим новый план.`;
    } else {
        optimalityMessage.innerHTML = `Исходный опорный план X<sub>0</sub> оптимален, так как все оценки свободных клеток неположительные.`;
        optimalityMessage.style.color = 'red';
        optimalityMessage.style.fontSize = '24px';
    }

    let div = document.createElement('div');
    div.appendChild(planHeader);
    div.appendChild(table);
    div.appendChild(costMessage);
    div.appendChild(deltaMessage);
    div.appendChild(optimalityMessage);

    // Добавляем граф, если план оптимален
    if (!hasPositiveDelta) {
        let graphElement = drawTransportGraph(x, c, indexesForBaza, m, n, a, b, 0);
        div.appendChild(graphElement);

        // Добавляем кнопки для сохранения отчета
        let saveButtonsDiv = document.createElement('div');
        saveButtonsDiv.style.marginTop = '20px';
        saveButtonsDiv.style.textAlign = 'center';

        let saveTxtBtn = document.createElement('button');
        saveTxtBtn.textContent = 'Сохранить отчет в TXT';
        saveTxtBtn.style.marginRight = '10px';
        saveTxtBtn.onclick = () => saveReport('txt', a, b, c, x, indexesForBaza, totalCost);

        let saveDocxBtn = document.createElement('button');
        saveDocxBtn.textContent = 'Сохранить отчет в DOCX';
        saveDocxBtn.style.marginRight = '10px';
        saveDocxBtn.onclick = () => saveReport('docx', a, b, c, x, indexesForBaza, totalCost);

        let saveXlsxBtn = document.createElement('button');
        saveXlsxBtn.textContent = 'Сохранить отчет в Excel';
        saveXlsxBtn.onclick = () => saveReport('xlsx', a, b, c, x, indexesForBaza, totalCost);

        saveButtonsDiv.appendChild(saveTxtBtn);
        saveButtonsDiv.appendChild(saveDocxBtn);
        saveButtonsDiv.appendChild(saveXlsxBtn);
        div.appendChild(saveButtonsDiv);
    }

    document.getElementById('solved_matrix').appendChild(div);
}
 
// Функция для форматирования потенциалов с пошаговым описанием
function formatPotentials(u, v, a, b, c, indexesForBaza) {
    let description = `Для нахождения потенциалов в таблице составим для базисных клеток уравнения вида: U<sub>i</sub> + V<sub>j</sub> = c<sub>ij</sub> <br>`
    description += `Полагаем U<sub>1</sub> = 0.<br>`;

    // Копируем потенциалы, чтобы не изменять оригинальные массивы
    let uCalc = new Array(u.length).fill(null);
    let vCalc = new Array(v.length).fill(null);

    // Начинаем с u_1 = 0
    uCalc[0] = 0;
    description += `Для клетки (1, ${indexesForBaza[0].col + 1}): 
    V<sub>${indexesForBaza[0].col + 1}</sub> = c<sub>${1},${indexesForBaza[0].col + 1}</sub> - U<sub>${1}</sub> = ${c[0][indexesForBaza[0].col]} - ${uCalc[0]} = ${c[0][indexesForBaza[0].col] - uCalc[0]};<br>`;
    vCalc[indexesForBaza[0].col] = c[0][indexesForBaza[0].col] - uCalc[0];

    // Проходим по всем базисным ячейкам для вычисления остальных потенциалов
    let calculatedCells = new Set();
    calculatedCells.add(`0,${indexesForBaza[0].col}`); // Первая ячейка уже обработана

    let i = 1;
    while (calculatedCells.size < indexesForBaza.length) {
        for (let cell of indexesForBaza) {
            let row = cell.row;
            let col = cell.col;

            if (calculatedCells.has(`${row},${col}`)) continue;

            if (uCalc[row] !== null) {
                // Если u_i уже известно, вычисляем v_j
                vCalc[col] = c[row][col] - uCalc[row];
                description += `Для клетки (${row + 1}, ${col + 1}): V<sub>${col + 1}</sub> = c<sub>${row + 1},${col + 1}</sub> - U<sub>${row + 1}</sub> = ${c[row][col]} - ${uCalc[row]} = ${vCalc[col]};<br>`;
                calculatedCells.add(`${row},${col}`);
            } else if (vCalc[col] !== null) {
                // Если v_j уже известно, вычисляем u_i
                uCalc[row] = c[row][col] - vCalc[col];
                description += `Для клетки (${row + 1}, ${col + 1}): U<sub>${row + 1}</sub> = c<sub>${row + 1},${col + 1}</sub> - V<sub>${col + 1}</sub> = ${c[row][col]} - ${vCalc[col]} = ${uCalc[row]};<br>`;
                calculatedCells.add(`${row},${col}`);
            }
        }
        i++;
        // Защита от бесконечного цикла
        if (i > indexesForBaza.length * 2) break;
    }

    return description;
}

/**
 * Форматирует дельты для вывода с пошаговым описанием
 * @param {Object[]} deltas массив объектов с дельтами { row, col, delta }
 * @param {number[]} u потенциалы для поставщиков
 * @param {number[]} v потенциалы для потребителей
 * @param {number[][]} c матрица цен
 * @returns {string} отформатированное описание вычислений дельт
 */
 function formatDeltas(deltas, u, v, c) {
    let description = `<br>Вычислим оценки свободных клеток по формуле: Δ<sub>ij</sub> = U<sub>i</sub> + V<sub>j</sub> - c<sub>ij</sub> <br>`;
    // Проходим по всем дельтам (свободным ячейкам) и описываем вычисление
    for (let d of deltas) {
        let i = d.row;
        let j = d.col;
        let delta = d.delta;
        let ui = u[i] !== null ? u[i] : 'не определён';
        let vj = v[j] !== null ? v[j] : 'не определён';
        let cij = c[i][j];

        // Показываем пошаговое вычисление
        description += `Для клетки (${i + 1}, ${j + 1}): Δ<sub>${i + 1},${j + 1}</sub> = U<sub>${i + 1}</sub> + V<sub>${j + 1}</sub> - c<sub>${i + 1},${j + 1}</sub> = ${ui} + ${vj} - ${cij} = ${delta};<br>`;
    }

    return description;
}

/**
 * Отрисовка промежуточной таблицы для метода потенциалов
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 * @param {number[][]} c цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 * @param {number[]} u потенциалы для поставщиков
 * @param {number[]} v потенциалы для потребителей
 * @param {Cell[]} path цикл
 * @param {Cell} bazaCell новая базисная ячейка
 * @param {number} delta минимальное значение для вычитания/сложения
 * @param {boolean} flag костыль :)
 * @param {number} iteration номер итерации
 */
function drawHistorySolutionPotential(a, b, c, x, indexesForBaza, u, v, path, bazaCell, delta, flag, iteration) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    let tBody = document.createElement('tbody');

    let planHeader = document.createElement('div');
    planHeader.style.fontWeight = 'bold';
    planHeader.style.marginBottom = '10px';
    planHeader.innerHTML = `План X<sub>${iteration}</sub>:`;
    
    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    trHead.appendChild(td1);
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    if (flag) {
        let td2 = document.createElement('td');
        td2.style.background = 'lightblue';
        td2.innerHTML = `U<sub>i</sub>`;
        trHead.appendChild(td2);
    }
    tBody.appendChild(trHead);
    
    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
    
        for (let j = 0; j < n; j++) {
            let td = document.createElement('td');
            
            let qValue = '';
            if (flag) {
                for (let k = 0; k < path.length; k++) {
                    if (i === path[k].row && j === path[k].col) {
                        qValue = k % 2 === 0 ? '+Q' : '-Q';
                        break;
                    }
                }
            }
    
            td.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: red; font-weight: bold;">${qValue}</span>
                    <span style="color: rgb(58, 0, 248);">${c[i][j]}</span>
                </div>
                <div style="text-align: center;">${x[i][j]}</div>
            `;
    
            for (let cell of indexesForBaza) {
                if (i == cell.row && j == cell.col) {
                    td.style.background = "Lightgreen";
                }
            }
    
            if (flag && i == bazaCell.row && j == bazaCell.col) {
                td.style.background = "rgb(236, 230, 45)";
            }
    
            tr.appendChild(td);
        }
    
        if (flag) {
            let tdTmp = document.createElement('td');
            tdTmp.style.background = 'rgb(0, 217, 255)';
            tdTmp.innerHTML = `U<sub>${i+1}</sub> = ${u[i]}`;
            tr.appendChild(tdTmp);
        }
        tBody.appendChild(tr);
    }

    if (flag) {
        let trFoot = document.createElement('tr');
        let td3 = document.createElement('td');
        td3.innerHTML = `V<sub>j</sub>`;
        td3.style.background = 'lightblue';
        trFoot.appendChild(td3);

        for (let i = 0; i < n; i++) {
            let td4 = document.createElement('td');
            td4.style.background = 'rgb(0, 217, 255)';
            td4.innerHTML = `V<sub>${i+1}</sub> = ${v[i]}`;
            trFoot.appendChild(td4);
        }
        tBody.appendChild(trFoot);
    }
    
    table.appendChild(tBody);

    let newBazis = `Добавляем новую переменную в базис: x(${bazaCell.row+1},${bazaCell.col+1})`;
    let pathString = path.length > 0
        ? `Цикл пересчёта: ${path.map(x => `(${x.row+1},${x.col+1})`).join(' → ')} → (${path[0].row+1},${path[0].col+1})`
        : `Цикл пересчёта: не удалось построить`;
    let minValueString = `Для того, чтобы найти новый опорный план находим минимальное значение среди ′–Q′: ${delta}<br>
    В клетках помеченных ′+Q′ прибавляем мин. значение, а в ′–Q′ вычитаем.`;

    let p = document.createElement('p');
    p.innerHTML = `${newBazis} <br> ${pathString} <br> ${minValueString}`;

    let totalCost = 0;
    for (let cell of indexesForBaza) {
        let [i, j] = [cell.row, cell.col];
        totalCost += x[i][j] * c[i][j];
    }
    let zMessage = document.createElement('div');
    zMessage.style.marginTop = '20px';
    zMessage.style.marginBottom = '20px';
    zMessage.style.fontWeight = 'bold';
    zMessage.innerHTML = `Суммарные транспортные расходы: Z<sub>${iteration}</sub> = ${totalCost}`;

    // Вычисляем потенциалы u и v
    [u, v] = calculatePotentials(a, b, c, indexesForBaza);
    let deltas = calculateDeltas(a, b, c, x, indexesForBaza);
    let deltaMessage = document.createElement('div');
    deltaMessage.style.marginBottom = '20px';
    deltaMessage.innerHTML = `
    Проверим план X<sub>${iteration}</sub> на оптимальность. <br>
    Для этого найдем значения потенциалов и оценки свободных клеток.<br>
    ${formatPotentials(u, v, a, b, c, indexesForBaza)}
    ${formatDeltas(deltas, u, v, c)}`;
    
    let hasPositiveDelta = deltas.some(d => d.delta > 0);
    let optimalityMessage = document.createElement('div');
    optimalityMessage.style.marginBottom = '20px';
    optimalityMessage.style.fontWeight = 'bold';
    if (hasPositiveDelta) {
        optimalityMessage.innerHTML = `Опорный план X<sub>${iteration}</sub> не оптимален, так как есть положительные оценки свободных клеток.<br>
        Выберем наибольшую положительную оценку, построим цикл пересчета и получим новый план.`;
    } else {
        optimalityMessage.innerHTML = `Опорный план X<sub>${iteration}</sub> оптимален, так как все оценки свободных клеток неположительные.`;
        optimalityMessage.style.color = 'red';
        optimalityMessage.style.fontSize = '24px';
    }

    let div = document.createElement('div');
    div.style.marginBottom = '20px';
    
    if (!flag) {
        div.appendChild(p);
        let hr = document.createElement('hr');
        hr.style = "margin:50px 0;height:10px;border:none;color:#333;background-color:#333;";
        div.appendChild(hr);
        div.appendChild(planHeader);
    }
    div.appendChild(table);
    
    if (!flag) {
        div.appendChild(zMessage);
        div.appendChild(deltaMessage);
        div.appendChild(optimalityMessage);

        if (!hasPositiveDelta) {
            let graphElement = drawTransportGraph(x, c, indexesForBaza, m, n, a, b, iteration);
            div.appendChild(graphElement);
            // Добавляем кнопки для сохранения отчета
            let saveButtonsDiv = document.createElement('div');
            saveButtonsDiv.style.marginTop = '20px';
            saveButtonsDiv.style.textAlign = 'center';

            let saveTxtBtn = document.createElement('button');
            saveTxtBtn.textContent = 'Сохранить отчет в TXT';
            saveTxtBtn.style.marginRight = '10px';
            saveTxtBtn.onclick = () => saveReport('txt', a, b, c, x, indexesForBaza, totalCost);

            let saveDocxBtn = document.createElement('button');
            saveDocxBtn.textContent = 'Сохранить отчет в DOCX';
            saveDocxBtn.style.marginRight = '10px';
            saveDocxBtn.onclick = () => saveReport('docx', a, b, c, x, indexesForBaza, totalCost);

            let saveXlsxBtn = document.createElement('button');
            saveXlsxBtn.textContent = 'Сохранить отчет в Excel';
            saveXlsxBtn.onclick = () => saveReport('xlsx', a, b, c, x, indexesForBaza, totalCost);

            saveButtonsDiv.appendChild(saveTxtBtn);
            saveButtonsDiv.appendChild(saveDocxBtn);
            saveButtonsDiv.appendChild(saveXlsxBtn);
            div.appendChild(saveButtonsDiv);
        }
    }

    document.getElementById('history_solution').appendChild(div);
}

/**
 * Отрисовка транспортного плана в виде двудольного графа
 * @param {number[][]} x матрица с перевозками
 * @param {number[][]} c цены
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 * @param {number} m число поставщиков
 * @param {number} n число потребителей
 * @param {number[]} a запасы поставщиков
 * @param {number[]} b потребности потребителей
 * @param {number} iteration номер итерации
 * @returns {HTMLElement} div с графом
 */
function drawTransportGraph(x, c, indexesForBaza, m, n, a, b, iteration) {
    let graphDiv = document.createElement('div');
    
    let graphHeader = document.createElement('div');
    graphHeader.style.fontWeight = 'bold';
    graphHeader.style.marginTop = '20px';
    graphHeader.style.marginBottom = '10px';
    graphHeader.innerHTML = `Оптимальный опорный план X<sub>${iteration}</sub> в виде графа:`;
    graphDiv.appendChild(graphHeader);

    let totalCost = 0;
    for (let cell of indexesForBaza) {
        let i = cell.row;
        let j = cell.col;
        totalCost += x[i][j] * c[i][j];
    }

    let costMessage = document.createElement('div');
    costMessage.style.marginBottom = '10px';
    costMessage.style.fontStyle = 'italic';
    costMessage.innerHTML = `Для того чтобы транспортные издержки были минимальны и составляли ${totalCost} у.д.е., следует вот так распределить продукцию:`;
    graphDiv.appendChild(costMessage);

    let graphContainer = document.createElement('div');
    graphContainer.id = `graph-container-${iteration}`;
    graphContainer.style.width = '100%';
    graphContainer.style.height = '400px';
    graphContainer.style.border = '1px solid black';
    graphDiv.appendChild(graphContainer);

    let nodes = [];
    let edges = [];

    for (let i = 0; i < m; i++) {
        let xPos = i * 200 - (m - 1) * 100;
        nodes.push({
            id: `A${i}`,
            label: `A${i+1}`,
            group: 'supplier',
            x: xPos,
            y: -100
        });
        nodes.push({
            id: `A${i}-label`,
            label: `Запас: ${a[i]}`,
            shape: 'text',
            x: xPos,
            y: -150
        });
    }

    for (let j = 0; j < n; j++) {
        let xPos = j * 200 - (n - 1) * 100;
        nodes.push({
            id: `B${j}`,
            label: `B${j+1}`,
            group: 'consumer',
            x: xPos,
            y: 100
        });
        nodes.push({
            id: `B${j}-label`,
            label: `Потребность: ${b[j]}`,
            shape: 'text',
            x: xPos,
            y: 150
        });
    }

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            let isBasic = indexesForBaza.some(cell => cell.row === i && cell.col === j);
            if (isBasic && x[i][j] > 0) {
                edges.push({
                    from: `A${i}`,
                    to: `B${j}`,
                    label: `${x[i][j]} (c=${c[i][j]})`,
                    color: { color: 'green' },
                    width: 2,
                    title: `Перевозка: ${x[i][j]}, Стоимость: ${c[i][j]}`
                });
            }
        }
    }

    let data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    let options = {
        nodes: {
            shape: 'circle',
            size: 30,
            font: { 
                size: 14, 
                align: 'center'
            },
            color: {
                background: (node) => node.group === 'supplier' ? '#800080' : node.group === 'consumer' ? '#ADD8E6' : 'transparent',
                border: (node) => node.group ? '#000000' : 'transparent'
            }
        },
        edges: {
            font: { size: 14, align: 'middle' },
            smooth: { type: 'straight' }
        },
        physics: false,
        layout: {
            improvedLayout: true
        }
    };

    setTimeout(() => {
        let container = document.getElementById(`graph-container-${iteration}`);
        if (container) {
            new vis.Network(container, data, options);
        }
    }, 0);

    return graphDiv;
}

/**
 * Генерирует и сохраняет отчет о решении транспортной задачи
 * @param {string} format Формат файла ('txt' или 'docx')
 * @param {number[]} a Возможности поставщиков
 * @param {number[]} b Потребности потребителей
 * @param {number[][]} c Матрица тарифов
 * @param {number[][]} x Оптимальный план
 * @param {Cell[]} indexesForBaza Базисные клетки
 * @param {number} totalCost Общая стоимость перевозок
 */
function saveReport(format, a, b, c, x, indexesForBaza, totalCost) {
    const method = document.querySelector('input[name="method"]:checked')?.value || 'northwest';
    const methodNames = {
        'northwest': 'Метод северо-западного угла',
        'minimum': 'Метод минимального элемента',
        'Fogel': 'Метод аппроксимации Фогеля',
        'doublePref': 'Метод двойного предпочтения'
    };

    // Формируем отчет в виде строки
    let reportTxt = `Отчет о решении транспортной задачи\n`;
    reportTxt += `================================\n\n`;
    reportTxt += `Дата: ${new Date().toLocaleString()}\n\n`;
    reportTxt += `Исходные данные:\n`;
    reportTxt += `Количество поставщиков: ${a.length}\n`;
    reportTxt += `Количество потребителей: ${b.length}\n\n`;
    reportTxt += `Возможности поставщиков:\n`;
    a.forEach((val, i) => reportTxt += `A${i+1}: ${val}\n`);
    reportTxt += `\nПотребности потребителей:\n`;
    b.forEach((val, i) => reportTxt += `B${i+1}: ${val}\n`);
    reportTxt += `\nМатрица тарифов:\n`;
    c.forEach(row => {
        reportTxt += row.map(val => val.toString().padStart(4)).join(' ') + '\n';
    });
    reportTxt += `\nМетод нахождения исходного опорного плана: ${methodNames[method]}\n\n`;
    reportTxt += `Оптимальный план перевозок найден методом потенциалов::\n`;
    x.forEach(row => {
        reportTxt += row.map(val => val.toString().padStart(4)).join(' ') + '\n';
    });
    reportTxt += `\nРаспределяя так продукцию, транспортные расходы будут минимальны и составят: ${totalCost} у.д.е.\n\n`;
    reportTxt += `Базисные клетки:\n`;
    indexesForBaza.forEach(cell => {
        reportTxt += `(${cell.row+1},${cell.col+1}): ${x[cell.row][cell.col]}\n`;
    });

    // Формируем HTML для docx-отчета
    let reportHtml = `
        <h2 style="text-align:center;">Отчет о решении транспортной задачи</h2>
        <p><b>Дата:</b> ${new Date().toLocaleString()}</p>
        <h3>Исходные данные:</h3>
        <p>Количество поставщиков: ${a.length}<br>
        Количество потребителей: ${b.length}</p>
        <p><b>Возможности поставщиков:</b><br>
        ${a.map((val, i) => `A${i+1}: ${val}`).join('<br>')}</p>
        <p><b>Потребности потребителей:</b><br>
        ${b.map((val, i) => `B${i+1}: ${val}`).join('<br>')}</p>
        <p><b>Матрица тарифов:</b></p>
        <table border="1" cellspacing="0" cellpadding="4">
            <tbody>
            ${c.map(row => `<tr>${row.map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
            </tbody>
        </table>
        <p><b>Метод нахождения исходного опорного плана:</b> ${methodNames[method]}</p>
        <p><b>Оптимальный план перевозок найден методом потенциалов:</b></p>
        <table border="1" cellspacing="0" cellpadding="4">
            <tbody>
            ${x.map(row => `<tr>${row.map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
            </tbody>
        </table>
        <p><b>Распределяя так продукцию, транспортные расходы будут минимальны и составят:</b> ${totalCost} у.д.е.</p>
        <p><b>Базисные клетки:</b><br>
        ${indexesForBaza.map(cell => `(${cell.row+1},${cell.col+1}): ${x[cell.row][cell.col]}`).join('<br>')}
        </p>
    `;

    // Сохраняем нужный формат
    if (format === 'txt') {
        const blob = new Blob([reportTxt], { type: 'text/plain;charset=utf-8' });
        const aElem = document.createElement('a');
        aElem.href = URL.createObjectURL(blob);
        aElem.download = `transport_task_report_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(aElem);
        aElem.click();
        document.body.removeChild(aElem);
        URL.revokeObjectURL(aElem.href);
    } else if (format === 'docx') {
        // Используем html-docx-js
        const blob = window.htmlDocx.asBlob(reportHtml, {orientation: "portrait"});
        const aElem = document.createElement('a');
        aElem.href = URL.createObjectURL(blob);
        aElem.download = `transport_task_report_${new Date().toISOString().slice(0,10)}.docx`;
        document.body.appendChild(aElem);
        aElem.click();
        document.body.removeChild(aElem);
        URL.revokeObjectURL(aElem.href);
    } else if (format === 'xlsx') {
        // Создаем новую книгу Excel
        const wb = XLSX.utils.book_new();
        
        // Создаем лист с исходными данными
        const initialData = [
            ['Отчет о решении транспортной задачи'],
            ['Дата:', new Date().toLocaleString()],
            [],
            ['Исходные данные:'],
            ['Количество поставщиков:', a.length],
            ['Количество потребителей:', b.length],
            [],
            ['Возможности поставщиков:'],
            ...a.map((val, i) => [`A${i+1}:`, val]),
            [],
            ['Потребности потребителей:'],
            ...b.map((val, i) => [`B${i+1}:`, val]),
            [],
            ['Матрица тарифов:'],
            ...c.map(row => row)
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(initialData);
        XLSX.utils.book_append_sheet(wb, ws1, "Исходные данные");

        // Создаем лист с оптимальным планом
        const optimalPlan = [
            ['Оптимальный план перевозок'],
            ['Метод нахождения исходного опорного плана:', methodNames[method]],
            [],
            ['Оптимальный план перевозок найден методом потенциалов:'],
            ...x.map(row => row),
            [],
            ['Общая стоимость перевозок:', totalCost],
            [],
            ['Базисные клетки:'],
            ...indexesForBaza.map(cell => [`(${cell.row+1},${cell.col+1})`, x[cell.row][cell.col]])
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(optimalPlan);
        XLSX.utils.book_append_sheet(wb, ws2, "Оптимальный план");

        // Сохраняем файл
        XLSX.writeFile(wb, `transport_task_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    }
}

