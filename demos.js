'use strict';
const docs = [
 {title:'Адаптация нового сотрудника',text:'Обучение начинается с вводной встречи с наставником. Затем новичок изучает базу знаний, выполняет учебную заявку и получает обратную связь. Доступ к рабочим обращениям открывается после проверки учебного задания.'},
 {title:'Доступ к данным',text:'Доступ к данным выдаётся по рабочей роли. Для изменения прав отправьте запрос ответственному. Не передавайте клиентские данные во внешние AI-сервисы без согласования.'},
 {title:'Регистрация заявки',text:'Заявка должна содержать описание задачи и ответственного. После уточнения запроса сотрудник фиксирует следующий шаг и меняет статус на В работе.'}
];
function retrieve(query){
 const words=query.toLowerCase().split(/[^а-яёa-z0-9]+/i).filter(w=>w.length>2);
 let best=null,score=0;
 for(const d of docs){const text=(d.title+' '+d.text).toLowerCase();const n=words.filter(w=>text.includes(w)).length;if(n>score){best=d;score=n;}}
 return best;
}
function processEvents(events){
 const seen=new Set(),rows=[];
 for(const event of events){
  if(!event.id || typeof event.title!=='string'||!event.title.trim()||typeof event.owner!=='string'||!event.owner.trim()){rows.push({id:event.id,status:'Уточнить данные'});continue;}
  if(seen.has(event.id)){rows.push({id:event.id,status:'Повтор пропущен'});continue;}
  seen.add(event.id);rows.push({id:event.id,status:'Создана задача'});
 }
 return rows;
}
const checks=[['Приветствие',/здравствуйте|добрый день|доброе утро/i],['Уточнение задачи',/какая задача|что необходимо|чем помочь/i],['Следующий шаг',/отправлю|договоримся|перезвоню/i]];
function inspectCall(text){return checks.map(([name,pattern])=>({name,evidence:text.match(pattern)?.[0]||null}));}
function searchDocs(){const d=retrieve(document.getElementById('query').value);document.getElementById('answer').textContent=d?d.text:'Подходящий фрагмент не найден. Уточните вопрос или обратитесь к наставнику.';document.getElementById('citation').textContent=d?'Источник: '+d.title:'Ответ без источника не сформирован';}
const demoEvents=[{id:'EV-01',title:'Обучить новичка',owner:'Наставник'},{id:'EV-02',title:'Уточнить заявку',owner:'Менеджер'},{id:'EV-01',title:'Обучить новичка',owner:'Наставник'},{id:'EV-03',title:'Запрос доступа',owner:''}];
function runPipeline(){const t=performance.now();const rows=processEvents(demoEvents);const duration=performance.now()-t;const out=document.getElementById('pipelineResult');out.replaceChildren();for(const r of rows){const line=document.createElement('p');line.textContent=r.id+': '+r.status;out.append(line);}const summary=document.createElement('p');summary.textContent=`Обработано ${rows.length} события. Создано задач: ${rows.filter(r=>r.status==='Создана задача').length}. Время локальной обработки: ${duration.toFixed(3)} мс. Без сети и внешних сервисов.`;out.append(summary);}
function reviewCall(){const out=document.getElementById('callResult');out.replaceChildren();for(const r of inspectCall(document.getElementById('transcript').value)){const line=document.createElement('p');line.textContent=r.name+': '+(r.evidence?'найден маркер '+r.evidence:'маркер не найден, нужна ручная проверка');out.append(line);}}
let cards=[];
function persistCards(){try{localStorage.setItem('portfolio-crm-v1',JSON.stringify(cards));}catch{document.getElementById('crmMessage').textContent='Хранилище недоступно. Изменения останутся только до закрытия страницы.';}}
function renderCards(){const host=document.getElementById('crmCards');host.replaceChildren();for(const card of cards){const row=document.createElement('div');row.className='crm-card';const title=document.createElement('b');title.textContent=card.title;const owner=document.createElement('p');owner.textContent='Ответственный: '+card.owner;const state=document.createElement('select');state.setAttribute('aria-label','Этап задачи '+card.title);for(const text of ['Новая','В работе','Готово']){const option=document.createElement('option');option.textContent=text;option.selected=card.status===text;state.append(option);}state.onchange=()=>{card.status=state.value;persistCards();};const remove=document.createElement('button');remove.textContent='Удалить';remove.onclick=()=>{cards=cards.filter(c=>c.id!==card.id);persistCards();renderCards();};row.append(title,owner,state,remove);host.append(row);}}
function addCard(){const title=document.getElementById('crmTitle').value.trim(),owner=document.getElementById('crmOwner').value.trim();const message=document.getElementById('crmMessage');if(!title||!owner){message.textContent='Заполните задачу и ответственного.';return;}cards.push({id:crypto.randomUUID(),title,owner,status:'Новая'});persistCards();renderCards();document.getElementById('crmTitle').value='';message.textContent='Карточка добавлена.';}
function resetCards(){cards=[{id:'sample-1',title:'Пройти вводное обучение',owner:'Учебный сотрудник',status:'Новая'}];persistCards();renderCards();}
if(typeof document!=='undefined'){
 try{const saved=JSON.parse(localStorage.getItem('portfolio-crm-v1')||'null');if(Array.isArray(saved))cards=saved.filter(c=>c&&typeof c.id==='string'&&typeof c.title==='string'&&typeof c.owner==='string'&&['Новая','В работе','Готово'].includes(c.status));else cards=[{id:'sample-1',title:'Пройти вводное обучение',owner:'Учебный сотрудник',status:'Новая'}];}catch{cards=[];}
 renderCards();
}
if(typeof module!=='undefined')module.exports={retrieve,processEvents,inspectCall};
