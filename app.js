/* Arcade Classic hub */
'use strict';
const META=[
  {id:'snake',name:'Snake',icon:`<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"><path d="M4 18h10a4 4 0 0 0 0-8H9a3 3 0 0 1 0-6h8"/><circle cx="19" cy="4.5" r="1.6" fill="var(--accent)" stroke="none"/></svg>`,desc:'Eat, grow, avoid walls and your own tail. Speeds up as you score.'},
  {id:'g2048',name:'2048',icon:`<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2" fill="var(--accent)" stroke="none"/></svg>`,desc:'Slide and merge tiles to reach 2048. Undo included.'},
  {id:'sudoku',name:'Sudoku',icon:`<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`,desc:'Generated puzzles from easy to expert, with hints and mistake checks.'},
  {id:'memory',name:'Memory',icon:`<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="5" width="11" height="15" rx="2.5"/><rect x="10" y="3" width="11" height="15" rx="2.5" fill="var(--surface)"/><path d="M14 9.5l1.2 2.3 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" fill="var(--accent)" stroke="none"/></svg>`,desc:'Flip cards and match all pairs in as few moves as possible.'},
];
const $=s=>document.querySelector(s);
let current=null,handle=null;
function bestOf(id){
  if(id==='sudoku'){const s=+localStorage.getItem('best-sudoku');return s?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):'-';}
  if(id==='memory'){const m=+localStorage.getItem('best-memory');return m?m+' moves':'-';}
  const v=+localStorage.getItem('best-'+id);
  return v||'-';
}
function renderHub(){
  $('#gameGrid').innerHTML=META.map(g=>`<div class="card card-hover game-card" onclick="openGame('${g.id}')"><div class="gicon">${g.icon}</div><h3>${g.name}</h3><p class="muted small mb-0">${g.desc}</p></div>`).join('');
  $('#bestScores').innerHTML=META.map(g=>`<div class="stat"><span class="num">${bestOf(g.id)}</span><span class="lbl">${g.name} best</span></div>`).join('');
}
function openGame(id){
  if(handle&&handle.unmount)handle.unmount();
  current=id;
  $('#hub').hidden=true;$('#gameHost').hidden=false;
  $('#gameTitle').textContent=META.find(g=>g.id===id).name;
  refreshBest();
  handle=GAMES[id].mount($('#gameRoot'),{
    bestKey:'best-'+id,
    saveBest(v){const k='best-'+id;const old=+localStorage.getItem(k)||0;if(v>old)localStorage.setItem(k,v);refreshBest();},
    refreshBest
  });
  window.scrollTo({top:0});
}
function refreshBest(){if(current)$('#gameBest').textContent='Best: '+bestOf(current);}
function closeGame(){
  if(handle&&handle.unmount)handle.unmount();
  handle=null;current=null;
  $('#gameHost').hidden=true;$('#hub').hidden=false;renderHub();
}
renderHub();
