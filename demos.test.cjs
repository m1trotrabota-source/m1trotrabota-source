const {test}=require('node:test');
const assert=require('node:assert/strict');
const {retrieve,processEvents,inspectCall}=require('./demos.js');
test('Неизвестный вопрос не получает случайный ответ',()=>{assert.equal(retrieve('квантовый банан'),null);assert.equal(retrieve(''),null);});
test('Обучение возвращает инструкцию с источником',()=>{assert.equal(retrieve('обучение').title,'Адаптация нового сотрудника');});
test('Повтор события не создаёт вторую задачу',()=>{const e={id:'1',title:'Заявка',owner:'Учебный сотрудник'};assert.deepEqual(processEvents([e,e]).map(r=>r.status),['Создана задача','Повтор пропущен']);});
test('Неполное событие можно исправить и доставить повторно',()=>{assert.deepEqual(processEvents([{id:'1',title:'Заявка',owner:''},{id:'1',title:'Заявка',owner:'Сотрудник'}]).map(r=>r.status),['Уточнить данные','Создана задача']);});
test('Пустой звонок не получает положительные отметки',()=>{assert.ok(inspectCall('').every(r=>r.evidence===null));});
test('Оценка содержит найденный фрагмент, а не выдуманный вывод',()=>{assert.equal(inspectCall('Здравствуйте, перезвоню завтра')[0].evidence,'Здравствуйте');assert.equal(inspectCall('Здравствуйте, перезвоню завтра')[1].evidence,null);});
