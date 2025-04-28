//=====================================================================================================================
                                        // ДОБАВЛЕНИЕ ОБРАБОТЧИКОВ ДЛЯ КНОПОК
//=====================================================================================================================
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
        const solveBtn = document.getElementById('btn_solve_northwest_corner');
        const clearBtn = document.getElementById('btn_clear_table');

        if (methodChoice) methodChoice.style.display = 'inline-block';
        if (solveBtn) solveBtn.style.display = 'inline-block';
        if (clearBtn) clearBtn.style.display = 'inline-block';
    });
    
    document.getElementById('btn_solve_northwest_corner').addEventListener('click', () => {
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
            solution = solve(res.a, res.b, c);
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

        document.getElementById('ans_1').innerHTML = '';
        document.getElementById('ans_2').innerHTML = '';
        document.getElementById('condition').innerHTML = '';
        document.getElementById('sum_a').innerHTML = '';
        document.getElementById('sum_b').innerHTML = '';
        document.getElementById('method_description').innerHTML = '';
    });
}

addEventHandler();

//=====================================================================================================================
                                        // ОТРИСОВКА ВСЯКОГО
//=====================================================================================================================

/**
 * Отрисовка HTML таблицы для заполнения цен
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 */
function draw_C_System(a, b) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    let tBody = document.createElement('tbody');

    let instructionText = document.createElement('p');
    instructionText.textContent = 'Введите тарифы: ';
    instructionText.style.marginBottom = '10px';

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
    
    // Функция для преобразования числа в нижние индексы
    const toSubscript = (num) => {
        const subscripts = {
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return String(num).split('').map(digit => subscripts[digit]).join('');
    };

    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        for (let j = 0; j < n; j++)  {
            let td = document.createElement('td');
            let input = document.createElement('input');
            // Формируем placeholder с нижними индексами
            //const subI = toSubscript(i + 1);
            //const subJ = toSubscript(j + 1);
            input.placeholder = `c${i+1},${j+1}`; 
            input.type = "number";
            input.style.width = '50px';
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
 * Отрисовка HTML таблицы решения для исходного опорного плана
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 * @param {number[][]} c цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 */
function drawTableNorthwestCorner(a, b, c, x, indexesForBaza) {
    let m = a.length;
    let n = b.length;

    let planHeader = document.createElement('div');
    planHeader.style.fontWeight = 'bold';
    planHeader.style.marginBottom = '10px';
    planHeader.innerHTML = `План X<sub>0</sub>:`;
    
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

    let solvedMatrix = document.getElementById('solved_matrix');
    solvedMatrix.replaceChildren();
    solvedMatrix.appendChild(planHeader);
    solvedMatrix.appendChild(table);
    solvedMatrix.appendChild(costMessage);
    solvedMatrix.appendChild(deltaMessage);
    solvedMatrix.appendChild(optimalityMessage);

    // Добавляем граф, если план оптимален
    if (!hasPositiveDelta) {
        let graphElement = drawTransportGraph(x, c, indexesForBaza, m, n, a, b, 0);
        solvedMatrix.appendChild(graphElement);
    }
}

// Функция для форматирования потенциалов 
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
function drawHistorySolutionPorential(a, b, c, x, indexesForBaza, u, v, path, bazaCell, delta, flag, iteration) {
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
                    <span style="color: red;">${qValue}</span>
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

    let deltas = calculateDeltas(a, b, c, x, indexesForBaza);
    let deltaMessage = document.createElement('div');
    deltaMessage.style.marginBottom = '20px';
    deltaMessage.innerHTML = `
    Проверим план X<sub>${iteration}</sub> на оптимальность. <br>
    Для этого найдем значения потенциалов и оценки свободных клеток.<br>
    ${formatPotentials(calculatePotentials(a, b, c, indexesForBaza)[0], calculatePotentials(a, b, c, indexesForBaza)[1], a, b, c, indexesForBaza)}
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
                size: 12, 
                align: 'center'
            },
            color: {
                background: (node) => node.group === 'supplier' ? '#800080' : node.group === 'consumer' ? '#ADD8E6' : 'transparent',
                border: (node) => node.group ? '#000000' : 'transparent'
            }
        },
        edges: {
            font: { size: 12, align: 'middle' },
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
 * Отрисовка HTML для заполнения системы (a, b)
 * @param {number} m кол-во поставщиков
 * @param {number} n кол-во потребителей
 */
function drawSystem(m, n) {
    let htmlA = 'Введите возможности поставщиков: <br><br>';
    for (let i = 1; i <= m; i++) {
        htmlA += `A<sub>${i}</sub> = <input type="text" id="A${i}" style=" font-size: 16px; width: 40px;"> `;
    }

    let htmlB = 'Введите потребности потребителей: <br><br>';
    for (let i = 1; i <= n; i++) {
        htmlB += `B<sub>${i}</sub> = <input type="text" id="B${i}" style=" font-size: 16px; width: 40px;"> `;
    }

    document.getElementById('a_values').innerHTML = htmlA;
    document.getElementById('b_values').innerHTML = htmlB;
    document.getElementById('btn_draw_c_system').style.display = 'inline-block';
}