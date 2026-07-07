const KEY='lifeos_v1';
const state=JSON.parse(localStorage.getItem(KEY)||'{"money":[],"tasks":[],"plan":{}}');
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function shekel(n){return '₪'+Math.round(n);}
function renderMoney(){
 const now=new Date();
 const today=now.toISOString().slice(0,10);
 const month=today.slice(0,7);
 const list=state.money;
 const expenses=list.filter(x=>x.type==='expense');
 const incomes=list.filter(x=>x.type==='income');
 const todaySum=expenses.filter(x=>x.date===today).reduce((s,x)=>s+x.amount,0);
 const monthSum=expenses.filter(x=>x.date.slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
 const incSum=incomes.filter(x=>x.date.slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
 document.getElementById('todayTotal').textContent=shekel(todaySum);
 document.getElementById('monthTotal').textContent=shekel(monthSum);
 document.getElementById('incomeTotal').textContent=shekel(incSum);
 document.getElementById('balanceTotal').textContent=shekel(incSum-monthSum);
}
