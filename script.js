/**
 * Проверка условия разрешимости транспортной задачи и обновление данных
 * @param {number[]} a Значения для поставщиков
 * @param {number[]} b Значения для потребителей
 * @param {number[][]} costs Значения тарифов
 * @returns {Object} Объект с обновленными a, b и costs
 */
 function checkFeasibility(a, b, costs) {
    let aSum = a.reduce((prev, cur) => prev + cur, 0);
    let bSum = b.reduce((prev, cur) => prev + cur, 0);

    // Вывод суммы по поставщикам и потребителям
    document.getElementById('sum_a').innerHTML = `Возможности поставщиков: ${aSum}`;
    document.getElementById('sum_b').innerHTML = `Потребности потребителей: ${bSum}`;

    if (aSum > bSum) {
        b.push(aSum - bSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у поставщиков больше, чем потребностей у потребителей. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного потребителя с тарифами 0.`;
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у потребителей больше, чем запасов у поставщиков. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного поставщика с тарифами 0.`;
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
    } else if (aSum === bSum) {
        document.getElementById('condition').innerHTML = `Условие разрешимости выполняется: Возможностей у поставщиков столько же, сколько и потребностей у поставщиков. 
        <br>Тип задачи: закрытая транспортная задача.`;
    }

    return { a, b, costs };
}
/**
 * северо-западный угол
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потребителей
 * @param {number[][]} costs значения цен
 */
function solve(a, b, costs) {
    // Описание сути метода северо-западного угла
    let methodDescription = `
        <div style="margin-bottom: 20px;">
            <h3>Суть метода северо-западного угла</h3>
            <p>Метод северо-западного угла — это один из способов нахождения исходного опорного плана для транспортной задачи. Его суть заключается в следующем:</p>
            <ul>
                <li>Начинаем с "северо-западного" угла таблицы (левый верхний угол, клетка (1,1)).</li>
                <li>Распределяем максимально возможное количество груза в текущую клетку, равное минимуму из оставшихся запасов поставщика и потребностей потребителя.</li>
                <li>После распределения обновляем запасы и потребности. Если запасы поставщика исчерпаны, переходим к следующей строке; если потребности потребителя удовлетворены, переходим к следующему столбцу.</li>
                <li>Процесс повторяется, пока все грузы не будут распределены.</li>
                <li>Если количество базисных клеток меньше <code>m + n - 1</code>, добавляются дополнительные базисные клетки с нулевым значением (базисные нули), выбирая клетки с минимальным тарифом, чтобы обеспечить выполнение условия для метода потенциалов.</li>
            </ul>
            <p>Этот метод очень прост в реализации, но часто даёт менее оптимальный план по сравнению с методом минимального элемента, так как не учитывает тарифы при распределении.</p>
        </div>
    `;
    document.getElementById('method_description').innerHTML = methodDescription;
    let aSum = a.reduce((prev, cur) => prev += cur, 0);
    let bSum = b.reduce((prev, cur) => prev += cur, 0);

    // Вывод суммы по поставщикам и потребителям
    document.getElementById('sum_a').innerHTML = `Возможности поставщиков: ${aSum}`;
    document.getElementById('sum_b').innerHTML = `Потребности потребителей: ${bSum}`;

    if (aSum > bSum) {
        b.push(aSum - bSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у поставщиков больше, чем потребностей у потребителей. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного потребителя с тарифами 0.`;
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у потребителей больше, чем запасов у поставщиков. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного поставщика с тарифами 0.`;
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
    } else if (aSum === bSum) {
        document.getElementById('condition').innerHTML = `Условие разрешимости выполняется: Возможностей у поставщиков столько же, сколько и потребностей у поставщиков. 
        <br>Тип задачи: закрытая транспортная задача.`;
    }

    let x = [];
    for (let i = 0; i < a.length; i++) {
        let row = [];
        for (let j = 0; j < b.length; j++) {
            row.push(0);
        }
        x.push(row);
    }

    let aCopy = [...a];
    let bCopy = [...b];

    let indexesForBaza = [];
    let [i1, j1] = [0, 0];

    while (true) {
        // Проверка условия: если aCopy[i1] = bCopy[j1], сравниваем c[i1,j1+1] и c[i1+1,j1]
        if (aCopy[i1] === bCopy[j1]) {
            x[i1][j1] = aCopy[i1]; // Заполняем ячейку
            indexesForBaza.push(new Cell(i1, j1));
            bCopy[j1] = 0; // Обнуляем столбец
            aCopy[i1] = 0; // Обнуляем строку

            // Сравниваем стоимости для выбора направления
            let costNextCol = (j1 + 1 < b.length) ? costs[i1][j1 + 1] : Infinity; // Следующий столбец
            let costNextRow = (i1 + 1 < a.length) ? costs[i1 + 1][j1] : Infinity; // Следующая строка

            if (costNextCol < costNextRow) {
                // Если стоимость в следующем столбце меньше, идем по строке (переходим к следующему столбцу)
                j1++;
            } else {
                // Иначе идем по столбцу (переходим к следующей строке)
                i1++;
            }
        } else if (aCopy[i1] < bCopy[j1]) {
            x[i1][j1] = aCopy[i1];
            indexesForBaza.push(new Cell(i1, j1));
            bCopy[j1] -= aCopy[i1];
            aCopy[i1] = 0;
            i1++;
        } else {
            x[i1][j1] = bCopy[j1];
            indexesForBaza.push(new Cell(i1, j1));
            aCopy[i1] -= bCopy[j1];
            bCopy[j1] = 0;
            j1++;
        }

        let aSum = aCopy.reduce((prev, cur) => prev += cur, 0);
        let bSum = bCopy.reduce((prev, cur) => prev += cur, 0);
        if (aSum === 0 && bSum === 0) {
            console.log(`Метод северо-западного угла завершен`);
            break;
        }
    }

    drawTableNorthwestCorner(a, b, costs, x, indexesForBaza);
    potentialMethod(a, b, x, costs, indexesForBaza);
}

//при равенстве а1=b1 базисный ноль ставится по строке
//     while (true) {
//         if (aCopy[i1] < bCopy[j1]) {
//             x[i1][j1] = aCopy[i1];
//             indexesForBaza.push(new Cell(i1, j1));
//             bCopy[j1] -= aCopy[i1]
//             aCopy[i1] = 0;
//             i1++;
//         } else {
//             x[i1][j1] = bCopy[j1];
//             indexesForBaza.push(new Cell(i1, j1));
//             aCopy[i1] -= bCopy[j1];
//             bCopy[j1] = 0;
//             j1++;
//         }

//при равенстве а1=b1 базисный ноль ставится по столбцу
//     while (true) {
//         // Проверка условия: если aCopy[i1] = bCopy[j1], приоритетно обнуляем строку
//         if (aCopy[i1] === bCopy[j1]) {
//             x[i1][j1] = aCopy[i1]; // Заполняем ячейку
//             indexesForBaza.push(new Cell(i1, j1));
//             bCopy[j1] = 0; // Обнуляем столбец
//             aCopy[i1] = 0; // Обнуляем строку
//             i1++; // Переходим к следующей строке
//         } else if (aCopy[i1] < bCopy[j1]) {
//             x[i1][j1] = aCopy[i1];
//             indexesForBaza.push(new Cell(i1, j1));
//             bCopy[j1] -= aCopy[i1];
//             aCopy[i1] = 0;
//             i1++;
//         } else {
//             x[i1][j1] = bCopy[j1];
//             indexesForBaza.push(new Cell(i1, j1));
//             aCopy[i1] -= bCopy[j1];
//             bCopy[j1] = 0;
//             j1++;
//         }

// Проверка условия разрешимости, определение типа ТЗ
function typeTZ(a, b)
{
    
}


 /**
 * Метод минимального элемента
 * @param {number[]} a Значения для поставщиков
 * @param {number[]} b Значения для потребителей
 * @param {number[][]} costs Значения тарифов
 */
function solveMinimumElement(a, b, costs) {
    // Описание сути метода минимального элемента
    let methodDescription = `
        <div style="margin-bottom: 20px;">
            <h3>Суть метода минимального элемента</h3>
            <p>Метод минимального элемента — это один из способов нахождения исходного опорного плана для транспортной задачи. Его суть заключается в следующем:</p>
            <ul>
                <li>На каждом шаге выбирается клетка с минимальным тарифом (стоимостью перевозки) среди всех доступных клеток, где ещё остались запасы у поставщика и потребности у потребителя.</li>
                <li>В выбранную клетку распределяется максимально возможное количество груза, равное минимуму из оставшихся запасов поставщика и потребностей потребителя.</li>
                <li>После распределения обновляются запасы и потребности, и процесс повторяется, пока все грузы не будут распределены.</li>
                <li>Если количество базисных клеток меньше <code>m + n - 1</code>, добавляются дополнительные базисные клетки с нулевым значением (базисные нули), выбирая клетки с минимальным тарифом, чтобы обеспечить выполнение условия для метода потенциалов.</li>
            </ul>
            <p>Этот метод прост в реализации и часто даёт хороший стартовый план, хотя не всегда оптимальный.</p>
        </div>
    `;
    document.getElementById('method_description').innerHTML = methodDescription;
    let aSum = a.reduce((prev, cur) => prev + cur, 0);
    let bSum = b.reduce((prev, cur) => prev + cur, 0);

    // Вывод суммы по поставщикам и потребителям
    document.getElementById('sum_a').innerHTML = `Возможности поставщиков: ${aSum}`;
    document.getElementById('sum_b').innerHTML = `Потребности потребителей: ${bSum}`;

    // Проверка условия разрешимости
    if (aSum > bSum) {
        b.push(aSum - bSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у поставщиков больше, чем потребностей у потребителей. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного потребителя с тарифами 0.`;
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у потребителей больше, чем запасов у поставщиков. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного поставщика с тарифами 0.`;
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
    } else if (aSum === bSum) {
        document.getElementById('condition').innerHTML = `Условие разрешимости выполняется: Возможностей у поставщиков столько же, сколько и потребностей у поставщиков. 
        <br>Тип задачи: закрытая транспортная задача.`;
    }

    let m = a.length;
    let n = b.length;

    // Инициализация плана перевозок
    let x = [];
    for (let i = 0; i < m; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        x.push(row);
    }

    let aCopy = [...a];
    let bCopy = [...b];
    let indexesForBaza = [];
    
    // Шаг 1: Распределяем грузы методом минимального элемента
    while (aCopy.some(val => val > 0) && bCopy.some(val => val > 0)) {
        let minCost = Infinity;
        let minI = -1;
        let minJ = -1;

        for (let i = 0; i < aCopy.length; i++) {
            for (let j = 0; j < bCopy.length; j++) {
                if (aCopy[i] > 0 && bCopy[j] > 0 && costs[i][j] < minCost) {
                    minCost = costs[i][j];
                    minI = i;
                    minJ = j;
                }
            }
        }

        if (minI === -1 || minJ === -1) break;

        let allocation = Math.min(aCopy[minI], bCopy[minJ]);
        x[minI][minJ] = allocation;
        indexesForBaza.push(new Cell(minI, minJ));
        aCopy[minI] -= allocation;
        bCopy[minJ] -= allocation;
    }

    // Шаг 2: Проверяем количество базисных клеток и добавляем базисные нули, если нужно
    let expectedBazisCount = m + n - 1;
    if (indexesForBaza.length < expectedBazisCount) {
        console.log(`Текущее количество базисных клеток: ${indexesForBaza.length}, ожидается: ${expectedBazisCount}. Добавляем базисные нули.`);

        // Добавляем клетки с x[i][j] = 0, пока не достигнем m + n - 1
        while (indexesForBaza.length < expectedBazisCount) {
            let added = false;
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    // Проверяем, что клетка еще не базисная
                    if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                        // Проверяем, что добавление клетки не создаст цикл
                        // (простой способ: добавляем клетку, если строка или столбец еще не полностью заняты)
                        let rowCount = indexesForBaza.filter(cell => cell.row === i).length;
                        let colCount = indexesForBaza.filter(cell => cell.col === j).length;
                        if (rowCount === 0 || colCount === 0) { // Добавляем, если строка или столбец пустые
                            indexesForBaza.push(new Cell(i, j));
                            x[i][j] = 0; // Устанавливаем базисный ноль
                            added = true;
                            break;
                        }
                    }
                }
                if (added) break;
            }

            // Если не удалось добавить клетку, выбираем любую свободную клетку
            if (!added) {
                for (let i = 0; i < m; i++) {
                    for (let j = 0; j < n; j++) {
                        if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                            indexesForBaza.push(new Cell(i, j));
                            x[i][j] = 0; // Базисный ноль
                            added = true;
                            break;
                        }
                    }
                    if (added) break;
                }
            }
        }
    }

    console.log(`Метод минимального элемента завершен. Базисные клетки:`, indexesForBaza);
    drawTableNorthwestCorner(a, b, costs, x, indexesForBaza);
    potentialMethod(a, b, x, costs, indexesForBaza);
}

/**
 * Метод аппроксимации Фогеля
 * @param {number[]} a Значения для поставщиков
 * @param {number[]} b Значения для потребителей
 * @param {number[][]} costs Значения тарифов
 */
 function solveVogelApproximation(a, b, costs) {
    // Описание сути метода аппроксимации Фогеля
    let methodDescription = `
        <div style="margin-bottom: 20px;">
            <h3>Суть метода аппроксимации Фогеля</h3>
            <p>Метод аппроксимации Фогеля (VAM) — это эвристический метод для нахождения исходного опорного плана транспортной задачи, который часто даёт более оптимальное начальное решение по сравнению с другими методами, такими как метод минимального элемента. Его суть заключается в следующем:</p>
            <ul>
                <li>Для каждой строки и столбца вычисляется штраф как разница между двумя наименьшими тарифами (стоимостями перевозки).</li>
                <li>Выбирается строка или столбец с наибольшим штрафом, так как это указывает на наибольшую потенциальную экономию при использовании минимального тарифа.</li>
                <li>В выбранной строке или столбце распределяется максимально возможное количество груза в клетку с минимальным тарифом.</li>
                <li>После распределения обновляются запасы поставщиков и потребности потребителей, а полностью удовлетворённая строка или столбец исключаются из рассмотрения.</li>
                <li>Процесс повторяется, пока все грузы не будут распределены.</li>
                <li>Если количество базисных клеток меньше <code>m + n - 1</code>, добавляются базисные нули в клетки с минимальным тарифом, чтобы обеспечить выполнение условия для метода потенциалов.</li>
            </ul>
            <p>Метод аппроксимации Фогеля сложнее в реализации, но обычно обеспечивает лучшее начальное решение, минимизируя общую стоимость перевозок.</p>
        </div>
    `;
    document.getElementById('method_description').innerHTML = methodDescription;

    // Вычисление суммы запасов и потребностей
    let aSum = a.reduce((prev, cur) => prev + cur, 0);
    let bSum = b.reduce((prev, cur) => prev + cur, 0);

    // Вывод суммы по поставщикам и потребителям
    document.getElementById('sum_a').innerHTML = `Возможности поставщиков: ${aSum}`;
    document.getElementById('sum_b').innerHTML = `Потребности потребителей: ${bSum}`;

    // Проверка условия разрешимости
    if (aSum > bSum) {
        b.push(aSum - bSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у поставщиков больше, чем потребностей у потребителей. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного потребителя с тарифами 0.`;
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у потребителей больше, чем запасов у поставщиков. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного поставщика с тарифами 0.`;
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
    } else {
        document.getElementById('condition').innerHTML = `Условие разрешимости выполняется: Возможностей у поставщиков столько же, сколько и потребностей у потребителей. 
        <br>Тип задачи: закрытая транспортная задача.`;
    }

    let m = a.length;
    let n = b.length;

    // Инициализация плана перевозок
    let x = [];
    for (let i = 0; i < m; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        x.push(row);
    }

    let aCopy = [...a];
    let bCopy = [...b];
    let indexesForBaza = [];
    let rowAvailable = Array(m).fill(true);
    let colAvailable = Array(n).fill(true);

    // Шаг 1: Распределяем грузы методом аппроксимации Фогеля
    while (rowAvailable.some(val => val) && colAvailable.some(val => val)) {
        // Вычисляем штрафы для строк
        let rowPenalties = [];
        for (let i = 0; i < m; i++) {
            if (!rowAvailable[i]) {
                rowPenalties.push({ penalty: -1, index: i });
                continue;
            }
            let rowCosts = [];
            for (let j = 0; j < n; j++) {
                if (colAvailable[j]) {
                    rowCosts.push(costs[i][j]);
                }
            }
            rowCosts.sort((x, y) => x - y);
            let penalty = rowCosts.length > 1 ? rowCosts[1] - rowCosts[0] : (rowCosts.length > 0 ? rowCosts[0] : 0);
            rowPenalties.push({ penalty, index: i });
        }

        // Вычисляем штрафы для столбцов
        let colPenalties = [];
        for (let j = 0; j < n; j++) {
            if (!colAvailable[j]) {
                colPenalties.push({ penalty: -1, index: j });
                continue;
            }
            let colCosts = [];
            for (let i = 0; i < m; i++) {
                if (rowAvailable[i]) {
                    colCosts.push(costs[i][j]);
                }
            }
            colCosts.sort((x, y) => x - y);
            let penalty = colCosts.length > 1 ? colCosts[1] - colCosts[0] : (colCosts.length > 0 ? colCosts[0] : 0);
            colPenalties.push({ penalty, index: j });
        }

        // Находим максимальный штраф
        let maxRowPenalty = Math.max(...rowPenalties.map(p => p.penalty));
        let maxColPenalty = Math.max(...colPenalties.map(p => p.penalty));
        let isRow = maxRowPenalty >= maxColPenalty;

        let selectedIndex, minCost, minI, minJ;

        if (isRow) {
            selectedIndex = rowPenalties.find(p => p.penalty === maxRowPenalty).index;
            minCost = Infinity;
            minJ = -1;
            for (let j = 0; j < n; j++) {
                if (colAvailable[j] && costs[selectedIndex][j] < minCost) {
                    minCost = costs[selectedIndex][j];
                    minJ = j;
                }
            }
            minI = selectedIndex;
        } else {
            selectedIndex = colPenalties.find(p => p.penalty === maxColPenalty).index;
            minCost = Infinity;
            minI = -1;
            for (let i = 0; i < m; i++) {
                if (rowAvailable[i] && costs[i][selectedIndex] < minCost) {
                    minCost = costs[i][selectedIndex];
                    minI = i;
                }
            }
            minJ = selectedIndex;
        }

        if (minI === -1 || minJ === -1) break;

        // Распределяем груз
        let allocation = Math.min(aCopy[minI], bCopy[minJ]);
        x[minI][minJ] = allocation;
        indexesForBaza.push(new Cell(minI, minJ));
        aCopy[minI] -= allocation;
        bCopy[minJ] -= allocation;

        // Обновляем доступность строки и столбца
        if (aCopy[minI] === 0) rowAvailable[minI] = false;
        if (bCopy[minJ] === 0) colAvailable[minJ] = false;
    }

    // Шаг 2: Проверяем количество базисных клеток и добавляем базисные нули, если нужно
    let expectedBazisCount = m + n - 1;
    if (indexesForBaza.length < expectedBazisCount) {
        console.log(`Текущее количество базисных клеток: ${indexesForBaza.length}, ожидается: ${expectedBazisCount}. Добавляем базисные нули.`);

        // Добавляем клетки с x[i][j] = 0, пока не достигнем m + n - 1
        while (indexesForBaza.length < expectedBazisCount) {
            let added = false;
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    // Проверяем, что клетка еще не базисная
                    if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                        // Простой способ: добавляем клетку, если строка или столбец еще не полностью заняты
                        let rowCount = indexesForBaza.filter(cell => cell.row === i).length;
                        let colCount = indexesForBaza.filter(cell => cell.col === j).length;
                        if (rowCount === 0 || colCount === 0) {
                            indexesForBaza.push(new Cell(i, j));
                            x[i][j] = 0; // Устанавливаем базисный ноль
                            added = true;
                            break;
                        }
                    }
                }
                if (added) break;
            }

            // Если не удалось добавить клетку, выбираем любую свободную клетку
            if (!added) {
                for (let i = 0; i < m; i++) {
                    for (let j = 0; j < n; j++) {
                        if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                            indexesForBaza.push(new Cell(i, j));
                            x[i][j] = 0; // Базисный ноль
                            added = true;
                            break;
                        }
                    }
                    if (added) break;
                }
            }
        }
    }

    console.log(`Метод аппроксимации Фогеля завершен. Базисные клетки:`, indexesForBaza);
    drawTableNorthwestCorner(a, b, costs, x, indexesForBaza);
    potentialMethod(a, b, x, costs, indexesForBaza);
}

/**
 * Метод двойного предпочтения
 * @param {number[]} a Значения для поставщиков
 * @param {number[]} b Значения для потребителей
 * @param {number[][]} costs Значения тарифов
 */
 function solveDoublePreference(a, b, costs) {
    // Описание сути метода двойного предпочтения
    let methodDescription = `
        <div style="margin-bottom: 20px;">
            <h3>Суть метода двойного предпочтения</h3>
            <p>Метод двойного предпочтения — это эвристический метод для нахождения исходного опорного плана транспортной задачи, который учитывает как стоимость перевозок, так и ограничения по запасам и потребностям. Его суть заключается в следующем:</p>
            <ul>
                <li>На каждом шаге определяется строка с минимальным доступным запасом и столбец с минимальной доступной потребностью.</li>
                <li>Среди клеток, находящихся на пересечении этой строки или этого столбца, выбирается клетка с минимальным тарифом (стоимостью перевозки).</li>
                <li>В выбранную клетку распределяется максимально возможное количество груза, равное минимуму из оставшихся запасов поставщика и потребностей потребителя.</li>
                <li>После распределения обновляются запасы и потребности, а полностью удовлетворённая строка или столбец исключаются из рассмотрения.</li>
                <li>Процесс повторяется, пока все грузы не будут распределены.</li>
                <li>Если количество базисных клеток меньше <code>m + n - 1</code>, добавляются базисные нули в клетки с минимальным тарифом, чтобы обеспечить выполнение условия для метода потенциалов.</li>
            </ul>
            <p>Метод двойного предпочтения стремится сбалансировать выбор клеток с низкими тарифами и приоритетное удовлетворение наименьших запасов или потребностей, что может привести к более эффективному начальному плану.</p>
        </div>
    `;
    document.getElementById('method_description').innerHTML = methodDescription;

    // Вычисление суммы запасов и потребностей
    let aSum = a.reduce((prev, cur) => prev + cur, 0);
    let bSum = b.reduce((prev, cur) => prev + cur, 0);

    // Вывод суммы по поставщикам и потребителям
    document.getElementById('sum_a').innerHTML = `Возможности поставщиков: ${aSum}`;
    document.getElementById('sum_b').innerHTML = `Потребности потребителей: ${bSum}`;

    // Проверка условия разрешимости
    if (aSum > bSum) {
        b.push(aSum - bSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у поставщиков больше, чем потребностей у потребителей. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного потребителя с тарифами 0.`;
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        document.getElementById('condition').innerHTML = `Условие разрешимости не выполняется: Возможностей у потребителей больше, чем запасов у поставщиков. 
        <br>Тип задачи: открытая транспортная задача. Следует добавить фиктивного поставщика с тарифами 0.`;
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
    } else {
        document.getElementById('condition').innerHTML = `Условие разрешимости выполняется: Возможностей у поставщиков столько же, сколько и потребностей у потребителей. 
        <br>Тип задачи: закрытая транспортная задача.`;
    }

    let m = a.length;
    let n = b.length;

    // Инициализация плана перевозок
    let x = [];
    for (let i = 0; i < m; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        x.push(row);
    }

    let aCopy = [...a];
    let bCopy = [...b];
    let indexesForBaza = [];
    let rowAvailable = Array(m).fill(true);
    let colAvailable = Array(n).fill(true);

    // Шаг 1: Распределяем грузы методом двойного предпочтения
    while (rowAvailable.some(val => val) && colAvailable.some(val => val)) {
        // Находим строку с минимальным запасом
        let minSupply = Infinity;
        let minSupplyIndex = -1;
        for (let i = 0; i < m; i++) {
            if (rowAvailable[i] && aCopy[i] > 0 && aCopy[i] < minSupply) {
                minSupply = aCopy[i];
                minSupplyIndex = i;
            }
        }

        // Находим столбец с минимальной потребностью
        let minDemand = Infinity;
        let minDemandIndex = -1;
        for (let j = 0; j < n; j++) {
            if (colAvailable[j] && bCopy[j] > 0 && bCopy[j] < minDemand) {
                minDemand = bCopy[j];
                minDemandIndex = j;
            }
        }

        if (minSupplyIndex === -1 || minDemandIndex === -1) break;

        // Выбираем клетку с минимальным тарифом в строке minSupplyIndex или столбце minDemandIndex
        let minCost = Infinity;
        let minI = -1;
        let minJ = -1;

        // Проверяем клетки в строке с минимальным запасом
        for (let j = 0; j < n; j++) {
            if (colAvailable[j] && bCopy[j] > 0 && costs[minSupplyIndex][j] < minCost) {
                minCost = costs[minSupplyIndex][j];
                minI = minSupplyIndex;
                minJ = j;
            }
        }

        // Проверяем клетки в столбце с минимальной потребностью
        for (let i = 0; i < m; i++) {
            if (rowAvailable[i] && aCopy[i] > 0 && costs[i][minDemandIndex] < minCost) {
                minCost = costs[i][minDemandIndex];
                minI = i;
                minJ = minDemandIndex;
            }
        }

        if (minI === -1 || minJ === -1) break;

        // Распределяем груз
        let allocation = Math.min(aCopy[minI], bCopy[minJ]);
        x[minI][minJ] = allocation;
        indexesForBaza.push(new Cell(minI, minJ));
        aCopy[minI] -= allocation;
        bCopy[minJ] -= allocation;

        // Обновляем доступность строки и столбца
        if (aCopy[minI] === 0) rowAvailable[minI] = false;
        if (bCopy[minJ] === 0) colAvailable[minJ] = false;
    }

    // Шаг 2: Проверяем количество базисных клеток и добавляем базисные нули, если нужно
    let expectedBazisCount = m + n - 1;
    if (indexesForBaza.length < expectedBazisCount) {
        console.log(`Текущее количество базисных клеток: ${indexesForBaza.length}, ожидается: ${expectedBazisCount}. Добавляем базисные нули.`);

        // Добавляем клетки с x[i][j] = 0, пока не достигнем m + n - 1
        while (indexesForBaza.length < expectedBazisCount) {
            let added = false;
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    // Проверяем, что клетка еще не базисная
                    if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                        // Простой способ: добавляем клетку, если строка или столбец еще не полностью заняты
                        let rowCount = indexesForBaza.filter(cell => cell.row === i).length;
                        let colCount = indexesForBaza.filter(cell => cell.col === j).length;
                        if (rowCount === 0 || colCount === 0) {
                            indexesForBaza.push(new Cell(i, j));
                            x[i][j] = 0; // Устанавливаем базисный ноль
                            added = true;
                            break;
                        }
                    }
                }
                if (added) break;
            }

            // Если не удалось добавить клетку, выбираем любую свободную клетку
            if (!added) {
                for (let i = 0; i < m; i++) {
                    for (let j = 0; j < n; j++) {
                        if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                            indexesForBaza.push(new Cell(i, j));
                            x[i][j] = 0; // Базисный ноль
                            added = true;
                            break;
                        }
                    }
                    if (added) break;
                }
            }
        }
    }

    console.log(`Метод двойного предпочтения завершен. Базисные клетки:`, indexesForBaza);
    drawTableNorthwestCorner(a, b, costs, x, indexesForBaza);
    potentialMethod(a, b, x, costs, indexesForBaza);
}

/**
 * Вычисляет потенциалы u и v
 */
 function calculatePotentials(a, b, costs, indexesForBaza) {
    let m = a.length;
    let n = b.length;

    let u = new Array(m).fill(null);
    let v = new Array(n).fill(null);

    u[0] = 0; // Начальное условие

    let changed;
    do {
        changed = false;
        for (let cell of indexesForBaza) {
            let i = cell.row;
            let j = cell.col;
            if (u[i] !== null && v[j] === null) {
                v[j] = costs[i][j] - u[i];
                changed = true;
            } else if (v[j] !== null && u[i] === null) {
                u[i] = costs[i][j] - v[j];
                changed = true;
            }
        }
    } while (changed);

    // Проверяем, достаточно ли базисных клеток
    if (indexesForBaza.length < (m + n - 1)) {
        console.warn(`Недостаточно базисных клеток: ${indexesForBaza.length}, ожидается ${m + n - 1}`);
    }

    return [u, v];
}
/**
 * Вычисляет оценки свободных клеток (дельты)
 */
 function calculateDeltas(a, b, c, x, indexesForBaza) {
    let m = a.length;
    let n = b.length;
    let deltas = [];

    // Вычисляем потенциалы
    let [u, v] = calculatePotentials(a, b, c, indexesForBaza);

    // Вычисляем дельты для свободных клеток
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (!indexesForBaza.some(cell => cell.row === i && cell.col === j)) {
                let delta = u[i] + v[j] - c[i][j];
                deltas.push({ row: i, col: j, delta: delta });
            }
        }
    }

    return deltas;
}
/**
 * Метод потенциалов
 * @param {number[]} a груз поставщиков
 * @param {number[]} b потребности клиентов
 * @param {number[][]} x план перевозок
 * @param {number[][]} costs стоимости перевозок
 * @param {Cell[]} indexesForBaza позиции базисных переменных
 */
function potentialMethod(a, b, x, costs, indexesForBaza) {
    let m = a.length;
    let n = b.length;
    let iteration = 1; // Счётчик итераций

    while (true) {
        // Сортируем базисные клетки
        indexesForBaza.sort((c1, c2) => (c1.row - c2.row) || (c1.col - c2.col));

        // Вычисляем потенциалы
        let [u, v] = calculatePotentials(a, b, costs, indexesForBaza);

        // Свободные ячейки, в которых нарушено условие оптимальности
        let notOptimalCells = [];
        let economies = [];
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                let isFind = indexesForBaza.some(cell => cell.row === i && cell.col === j);
                if (!isFind && u[i] + v[j] > costs[i][j]) {
                    notOptimalCells.push(new Cell(i, j));
                    economies.push(u[i] + v[j] - costs[i][j]);
                }
            }
        }

        // Если нет неоптимальных ячеек, завершаем метод
        if (notOptimalCells.length === 0) {
            console.log(`Метод потенциалов завершен`);
            console.log(`ui = [${u}]`);
            console.log(`vi = [${v}]`);
            break;
        }

        // Максимальная экономия стоимости
        let maxEconomy = Math.max(...economies);

        // Ячейки с максимальной экономией стоимости
        let cellsWithMaxEconomy = notOptimalCells.filter((_, i) => economies[i] == maxEconomy);

        // Ячейка с максимальной экономией стоимости и с меньшими транспортными издержками
        let minCostForMaxEconomyCell = Math.min(...cellsWithMaxEconomy.map((e, _) => costs[e.row][e.col]));
        let bazaCell = cellsWithMaxEconomy.filter((e, _) => costs[e.row][e.col] == minCostForMaxEconomyCell)[0];

        // Добавление новой базисной ячейки
        indexesForBaza.push(bazaCell);

        // Проверка количества базисных ячеек
        let expectedBazisCount = m + n - 1;
        if (indexesForBaza.length < expectedBazisCount) {
            console.warn(`Недостаточно базисных ячеек: ${indexesForBaza.length}, ожидается ${expectedBazisCount}`);
        }
        // Построение цикла
        let path = buildPath(bazaCell, indexesForBaza);

        if (path.length === 0) {
            console.error("Не удалось построить цикл пересчета. Проверяйте базисные ячейки.");
            break;
        }
        
        let cellsWithMinus = path.filter((_, pos) => pos % 2 != 0);
        let xValuesForMinusCells = cellsWithMinus.map(cell => x[cell.row][cell.col]);
        let min_x_value = Math.min(...xValuesForMinusCells);
        let cellsContainsMinValue = cellsWithMinus.filter((cell) => x[cell.row][cell.col] == min_x_value);
        let costsForCellWithMinValue = cellsContainsMinValue.map((cell) => costs[cell.row][cell.col]);
        let minCost = Math.min(...costsForCellWithMinValue);
        let cellWithMinValueAndMinCost = cellsContainsMinValue.filter((cell) => costs[cell.row][cell.col] == minCost)[0];

        // Отрисовка промежуточного решения
        drawHistorySolutionPorential(a, b, costs, x, indexesForBaza, u, v, path, bazaCell, min_x_value, true, iteration);

        // Прибавить/вычесть минимальное значение
        for (let i = 0; i < path.length; i++) {
            let pathItem = path[i];
            if (i % 2 == 0) {
                x[pathItem.row][pathItem.col] += min_x_value;
            } else {
                x[pathItem.row][pathItem.col] -= min_x_value;
            }
        }

        // Удаление ячеек из базиса для поддержания баланса = (m + n - 1)
        if (cellsContainsMinValue.length == 1) {
            let cell = cellsContainsMinValue[0];
            let index = indexesForBaza.findIndex(c => c.row === cell.row && c.col === cell.col);
            if (index !== -1) {
                indexesForBaza.splice(index, 1);
            }
        } else {
            for (let cell of cellsContainsMinValue) {
                if (cell.row == cellWithMinValueAndMinCost.row && cell.col == cellWithMinValueAndMinCost.col) {
                    continue;
                }
                let index = indexesForBaza.findIndex(c => c.row === cell.row && c.col === cell.col);
                if (index !== -1) {
                    indexesForBaza.splice(index, 1);
                }
            }
        }

        // Отрисовка финального решения
        drawHistorySolutionPorential(a, b, costs, x, indexesForBaza, u, v, path, bazaCell, min_x_value, false, iteration);

        // Увеличиваем счётчик итераций
        iteration++;
    }


}


/**
 * @param {Cell} startCell 
 * @param {Cell[]} bazises 
 * @returns {Cell[]}
 */
function buildPath(startCell, bazises) {
    // пройденный путь (цикл)
    let stack = [];

    // возможные следующие ходы от стартовой ячейки (сначала ходим горизонтально)
    let startNextCells = bazises
        .filter((cell) => cell.row == startCell.row) // клетки в той же строке
        .filter((cell) => cell.col != startCell.col) // исключаем начальную
        .sort((x, y) => Math.abs(x.col - startCell.col) - Math.abs(y.col - startCell.col));


    if (startNextCells.length === 0) {
        console.log("Не найдено базисных ячеек в строке стартовой ячейки");
        return [];
    }
    // начальная ячейка, от которой будем строить цикл
    let start = new MyState(startCell, 'v', startNextCells);
    stack.push(start);

    while (true) {
        // условие НЕ удачного выхода (цикла не существует (в теории это невозможно) )
        if (stack.length == 0) {
            console.log("СТЕК ОПУСТЕЛ: не удалось построить цикл");
            return [];
        }

        // текущее состояние
        let head = stack.at(-1);

        // условие удачного выхода (цикл построен удачно)
        if (stack.length >= 4 && ((head.cell.row == startCell.row) || (head.cell.col == startCell.col))) {
            break;
        }

        // если нет вариантов для хода, идем назад
        if (head.nextCells.length == 0) {
            stack.pop();
            continue;
        }

        // Пробуем пойти в один из возможных следующих ходов
        let nextCell = head.nextCells.pop();

        // для следующего состояния ищем его возможные следующие ходы
        // Нужно изменить направления на противополжное относительно предыдущего хода
        // горизонтальное -> вертикальное; вертикальное -> горизонтальное
        let dir = head.prevDir == 'v' ? 'h' : 'v';

        let maybyNextCells;
        if (dir == 'h') {
            maybyNextCells = bazises
                .filter((cell) => cell.col == nextCell.col)
                .filter((cell) => cell.row != nextCell.row)
                .sort((x, y) => Math.abs(x.row - nextCell.row) - Math.abs(y.row - nextCell.row));
        }
        if (dir == 'v') {
            maybyNextCells = bazises
                .filter((cell) => cell.row == nextCell.row)
                .filter((cell) => cell.col != nextCell.col)
                .sort((x, y) => Math.abs(x.col - nextCell.col) - Math.abs(y.col - nextCell.col));
        }

        // если есть следующие ходы, то значит можно сделать шаг (добавляем новое состояние в цикл)
        if (maybyNextCells.length != 0) {
            let newState = new MyState(nextCell, dir, maybyNextCells);
            stack.push(newState);
        }
    }

    let path = stack.map(state => state.cell);
    return path;
}

class MyState {
    /**
     * @param {Cell} cell текущая ячейка
     * @param {string} prevDir предыдущее направление
     * @param {Cell[]} nextCells возможные следующие ходы
     */
    constructor(cell, prevDir, nextCells) {
        this.cell = cell;
        this.prevDir = prevDir;
        this.nextCells = nextCells;
    }
}
class Cell {
    /**
     * @param {number} r строка
     * @param {number} c столбец
     */
    constructor(r, c) {
        this.row = r;
        this.col = c;
    }
}