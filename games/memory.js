/* Memory match */
window.GAMES=window.GAMES||{};
GAMES.memory={
  title:'Memory',icon:'\u{1F0CF}',desc:'Flip and match all the pairs.',
  bestKey:'best-memory',
  mount(root,ctx){
    const ICONS=['\u2605','\u2665','\u2663','\u2666','\u2660','\u266B','\u2600','\u2602','\u2708','\u2693','\u2744','\u2699','\u2726','\u262F','\u263A','\u267B','\u2730','\u271A'];
    root.innerHTML=`<div class="stage">
      <div class="hud">
        <select class="input" id="mmSize" style="width:auto"><option value="4">4 x 4 (easy)</option><option value="6">6 x 6 (hard)</option></select>
        <button class="btn btn-primary btn-sm" id="mmNew">New game</button>
        <span class="chip">Moves <strong id="mmMoves">0</strong></span>
        <span class="chip chip-accent">Pairs <strong id="mmPairs">0</strong>/8</span>
      </div>
      <div class="mem-board" id="mmBoard"></div></div>`;
    let cards,open,matched,moves,lock,size;
    const boardEl=root.querySelector('#mmBoard');
    function newGame(){
      size=+root.querySelector('#mmSize').value;
      const pairs=size*size/2;
      const deck=[...ICONS.slice(0,pairs),...ICONS.slice(0,pairs)];
      for(let i=deck.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[deck[i],deck[j]]=[deck[j],deck[i]];}
      cards=deck.map(icon=>({icon,flip:false,matched:false}));
      open=[];matched=0;moves=0;lock=false;
      root.querySelector('#mmMoves').textContent='0';
      root.querySelector('#mmPairs').textContent='0';
      root.querySelector('#mmPairs').nextSibling.textContent='/'+pairs;
      boardEl.style.gridTemplateColumns=`repeat(${size},1fr)`;
      draw();
    }
    function draw(){
      boardEl.innerHTML='';
      cards.forEach((c,i)=>{
        const b=document.createElement('button');
        b.className='mem-card'+(c.flip||c.matched?' flip':'')+(c.matched?' matched':'');
        b.innerHTML=`<div class="mem-inner"><div class="mem-face mem-front">\u2731</div><div class="mem-face mem-back">${c.icon}</div></div>`;
        b.onclick=()=>flip(i);
        boardEl.appendChild(b);
      });
    }
    function flip(i){
      if(lock||cards[i].flip||cards[i].matched)return;
      cards[i].flip=true;draw();
      open.push(i);
      if(open.length===2){
        moves++;root.querySelector('#mmMoves').textContent=moves;
        const[a,b]=open;
        if(cards[a].icon===cards[b].icon){
          cards[a].matched=cards[b].matched=true;matched++;
          root.querySelector('#mmPairs').textContent=matched;
          open=[];
          if(matched===cards.length/2){
            const best=+(localStorage.getItem(ctx.bestKey)||0);
            if(!best||moves<best)localStorage.setItem(ctx.bestKey,moves);
            ctx.refreshBest();
            setTimeout(()=>toast(`Solved in ${moves} moves!`),350);
          }
          setTimeout(draw,350);
        }else{
          lock=true;
          setTimeout(()=>{cards[a].flip=cards[b].flip=false;open=[];lock=false;draw();},750);
        }
      }
    }
    root.querySelector('#mmNew').onclick=newGame;
    root.querySelector('#mmSize').onchange=newGame;
    newGame();
    return {unmount(){},api:{flip,getCards:()=>cards}};
  }
};
