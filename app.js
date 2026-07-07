const KEY='lifeos_v1';
const state=JSON.parse(localStorage.getItem(KEY)||'{"money":[],"tasks":[],"plan":{}}');
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function shekel(n){return '₪'+Math.round(n);}
