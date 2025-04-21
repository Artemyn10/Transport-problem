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
        
        // Показываем элементы с проверкой их существования
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

        // Получаем выбранный метод
        const method = document.querySelector('input[name="method"]:checked')?.value || 'northwest';
        console.log(`Выбран метод: ${method}`);

        // Решаем задачу в зависимости от выбранного метода
        let solution;
        if (method === 'northwest') {
            solution = solve(res.a, res.b, c); // Используем метод северо-западного угла
        } else if (method === 'minimum') {
            solution = solveMinimumElement(res.a, res.b, c); // Используем метод минимального элемента
        } else if (method === 'Fogel') {
            solution = solveVogelApproximation(res.a, res.b, c); // Используем метод Аппроксимации Фогеля
        } else if (method === 'doublePref') {
            solution = solveDoublePreference(res.a, res.b, c); // Используем метод двойного предпочтения
        }
        
        document.getElementById('title_1').style.display = 'block';
        //document.getElementById('title_2').style.display = 'block';
    });

    document.getElementById('btn_clear_table').addEventListener('click', () => {
        document.getElementById('solved_matrix').replaceChildren();
        document.getElementById('history_solution').replaceChildren();

        document.getElementById('title_1').style.display = 'none';
        //document.getElementById('title_2').style.display = 'none';

        document.getElementById('ans_1').innerHTML = '';
        document.getElementById('ans_2').innerHTML = '';
        document.getElementById('condition').innerHTML = '';
        document.getElementById('sum_a').innerHTML = '';
        document.getElementById('sum_b').innerHTML = '';
        document.getElementById('method_description').innerHTML = '';
    });
}

addEventHandler()

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

    // Создаем строку "Введите тарифы"
    let instructionText = document.createElement('p');
    instructionText.textContent = 'Введите тарифы: ';
    instructionText.style.marginBottom = '10px'; // Отступ снизу

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
        for (let j = 0; j < n; j++)  {
            let td = document.createElement('td');
            let input = document.createElement('input');
            input.type = "number";
            input.style.width = '40px';
            input.id = `c${i}${j}`;
            td.appendChild(input);
            tr.appendChild(td);
        }
        tBody.appendChild(tr);
    }
    
    table.appendChild(tBody);

    // Очищаем контейнер и добавляем текст и таблицу
    let cValuesContainer = document.getElementById('c_values');
    cValuesContainer.replaceChildren(); // Очищаем контейнер
    cValuesContainer.appendChild(instructionText); // Добавляем текст
    cValuesContainer.appendChild(table); // Добавляем таблицу
}

/**
 * Отрисовка HTML таблицы решения для "северо-западного угла"
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 * @param {number[]} c цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 */
 function drawTableNorthwestCorner(a, b, c, x, indexesForBaza) {
    let m = a.length;
    let n = b.length;

    // Добавляем заголовок с номером плана
    let planHeader = document.createElement('div');
    planHeader.style.fontWeight = 'bold';
    planHeader.style.marginBottom = '10px';
    planHeader.innerHTML = `План X<sub>0</sub>:`;
    document.getElementById('solved_matrix').appendChild(planHeader);

    // Создаем таблицу
    let table = document.createElement('table');
    table.style.marginBottom = '20px';
    let tBody = document.createElement('tbody');

    // Заголовок таблицы
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

    // Заполнение таблицы данными
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

            // Подсветка базисных клеток
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
    // Очищаем контейнер и добавляем заголовок плана и таблицу
    let solvedMatrix = document.getElementById('solved_matrix');
    solvedMatrix.replaceChildren(); // Очищаем контейнер
    solvedMatrix.appendChild(planHeader); // Добавляем заголовок плана
    solvedMatrix.appendChild(table); // Добавляем таблицу

    // Вычисляем суммарные транспортные расходы
    let totalCost = 0;
    for (let cell of indexesForBaza) {
        let [i, j] = [cell.row, cell.col];
        totalCost += x[i][j] * c[i][j];
    }

    // Добавляем сообщение о суммарных транспортных расходах
    let costMessage = document.createElement('div');
    costMessage.style.marginBottom = '20px';
    costMessage.style.fontWeight = 'bold';
    costMessage.innerHTML = `Суммарные транспортные расходы в исходном опорном плане: Z<sub>0</sub> = ${totalCost}`;
    document.getElementById('solved_matrix').appendChild(costMessage);

    // Вычисляем и выводим оценки свободных клеток (дельты)
    let deltas = calculateDeltas(a, b, c, x, indexesForBaza);
    let deltaMessage = document.createElement('div');
    deltaMessage.style.marginBottom = '20px';
    deltaMessage.innerHTML = `Проверяем исходный опорный план X<sub>0</sub> на оптимальность.  <br>
    Для этого найдем значения потенциалов и оценки свободных клеток.<br>
    Для нахождения потенциалов в таблице составим для базисных клеток уравнения вида: U<sub>i</sub> + V<sub>j</sub> = c<sub>ij</sub> <br>
    ${formatPotentials(calculatePotentials(a, b, c, indexesForBaza)[0], calculatePotentials(a, b, c, indexesForBaza)[1], a, b, c, indexesForBaza)}
    Вычислим оценки свободных клеток по формуле: Δ<sub>ij</sub> = U<sub>i</sub> + V<sub>j</sub> - c<sub>ij</sub> <br>
    ${formatDeltas(deltas)}`;
    document.getElementById('solved_matrix').appendChild(deltaMessage);

    // Проверяем, есть ли положительные дельты
    let hasPositiveDelta = deltas.some(d => d.delta > 0);

    // Сообщение о неоптимальности плана
    let optimalityMessage = document.createElement('div');
    optimalityMessage.style.marginBottom = '20px';
    optimalityMessage.style.fontWeight = 'bold';
    if (hasPositiveDelta) {
        optimalityMessage.innerHTML = `Исходный опорный план X<sub>0</sub> не оптимален, так как есть положительные оценки свободных клеток.<br>
        Выберем наибольшую положительную оценку, построим цикл пересчета и получим новый план.`;
    } else {
        optimalityMessage.innerHTML = `Исходный опорный план X<sub>0</sub> оптимален, так как все оценки свободных клеток неположительные.
        `;
        optimalityMessage.style.color = 'red'; // Красный цвет
        optimalityMessage.style.fontSize = '24px'; // Большой шрифт
        // Добавляем граф только для оптимального плана
        let div = document.createElement('div');
        div.style.marginBottom = '20px';
        let graphElement = drawTransportGraph(x, c, indexesForBaza, m, n, a, b, iteration);
        div.appendChild(graphElement);
        
    }
    document.getElementById('solved_matrix').appendChild(optimalityMessage);

}

// Функция для форматирования потенциалов 
function formatPotentials(u, v) {
    let uText = u.map((val, i) => `U<sub>${i + 1}</sub> = ${val !== null ? val : 'не определен'}`).join('<br>');
    let vText = v.map((val, j) => `V<sub>${j + 1}</sub> = ${val !== null ? val : 'не определен'}`).join('<br>');
    return `Потенциалы для поставщиков:<br> ${uText}<br>Для потребителей:<br> ${vText}<br>`;
}

/**
 * Форматирует дельты для вывода
 */
 function formatDeltas(deltas) {
    // Форматируем дельты
    return deltas.map(d => {
        let deltaText = `Δ<sub>${d.row + 1},${d.col + 1}</sub> = ${d.delta}`;
        return deltaText;
    }).join('<br>');
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

    // Добавляем заголовок с номером плана
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

    let newBazis = `Новая базисная переменная: x(${bazaCell.row+1},${bazaCell.col+1})`;
    let pathString = path.length > 0
        ? `Цикл пересчёта: ${path.map(x => `(${x.row+1},${x.col+1})`).join(' → ')} → (${path[0].row+1},${path[0].col+1})`
        : `Цикл пересчёта: не удалось построить`;
    let minValueString = `Минимальное значение среди отрицательных Q: ${delta}`;

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
    Для нахождения потенциалов в таблице составим для базисных клеток уравнения вида: U<sub>i</sub> + V<sub>j</sub> = c<sub>ij</sub> <br>
    ${formatPotentials(calculatePotentials(a, b, c, indexesForBaza)[0], calculatePotentials(a, b, c, indexesForBaza)[1], a, b, c, indexesForBaza)}
    Вычислим оценки свободных клеток по формуле: Δ<sub>ij</sub> = U<sub>i</sub> + V<sub>j</sub> - c<sub>ij</sub> <br>
    ${formatDeltas(deltas)}`;
    
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

        // Добавляем граф только для оптимального плана
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
    
    // Заголовок графа
    let graphHeader = document.createElement('div');
    graphHeader.style.fontWeight = 'bold';
    graphHeader.style.marginTop = '20px';
    graphHeader.style.marginBottom = '10px';
    graphHeader.innerHTML = `Оптимальный опорный план X<sub>${iteration}</sub> в виде графа:`;
    graphDiv.appendChild(graphHeader);

    // Вычисляем суммарные транспортные издержки
    let totalCost = 0;
    for (let cell of indexesForBaza) {
        let i = cell.row;
        let j = cell.col;
        totalCost += x[i][j] * c[i][j];
    }

    // Добавляем надпись с издержками
    let costMessage = document.createElement('div');
    costMessage.style.marginBottom = '10px';
    costMessage.style.fontStyle = 'italic';
    costMessage.innerHTML = `Для того чтобы транспортные издержки были минимальны и составляли ${totalCost}, следует вот так распределить продукцию:`;
    graphDiv.appendChild(costMessage);

    // Контейнер для графа
    let graphContainer = document.createElement('div');
    graphContainer.id = `graph-container-${iteration}`;
    graphContainer.style.width = '100%';
    graphContainer.style.height = '400px';
    graphContainer.style.border = '1px solid black';
    graphDiv.appendChild(graphContainer);

    // Формируем узлы и рёбра
    let nodes = [];
    let edges = [];

    // Узлы для поставщиков (Ai) — вверху
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
            label: `Запас: ${a[i]} МВт`,
            shape: 'text',
            x: xPos,
            y: -150
        });
    }

    // Узлы для потребителей (Bj) — внизу
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
            label: `Потребность: ${b[j]} МВт`,
            shape: 'text',
            x: xPos,
            y: 150
        });
    }

    // Рёбра только для базисных клеток с ненулевыми перевозками
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            let isBasic = indexesForBaza.some(cell => cell.row === i && cell.col === j);
            if (isBasic && x[i][j] > 0) { // Только для базисных клеток с x[i][j] > 0
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

    // Инициализация графа с Vis.js
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

    // Создаем граф после добавления контейнера в DOM
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