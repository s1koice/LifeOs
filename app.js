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
 const box=document.getElementById('transactions');
 if(box){box.innerHTML=list.slice(-8).reverse().map(x=>`<div class="card item"><span>${x.note||'Расход'}</span><b>${shekel(x.amount)}</b></div>`).join('');}
}
function initTabs(){
 document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active-tab'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active-tab');
  document.getElementById(btn.dataset.tab).classList.add('active');
 });
}
function initMoneyForm(){
 const form=document.getElementById('moneyForm');
 if(!form)return;
 form.onsubmit=e=>{
  e.preventDefault();
  const amount=Number(document.getElementById('amount').value.replace(',','.'));
  if(!amount)return;
  state.money.push({type:'expense',amount,note:document.getElementById('note').value,date:new Date().toISOString().slice(0,10)});
  document.getElementById('amount').value='';document.getElementById('note').value='';
  save();renderMoney();
 };
}
initTabs();
initMoneyForm();
renderMoney();
