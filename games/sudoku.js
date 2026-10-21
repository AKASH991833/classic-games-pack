/* Sudoku: generator with difficulty, candidates, hints, mistake check */
window.GAMES=window.GAMES||{};
GAMES.sudoku={
  title:'Sudoku',icon:'\u{1F9E9}',desc:'Classic 9x9 with smart hints.',
  bestKey:'best-sudoku',
  mount(root,ctx){
    root.innerHTML=`<div class="stage">
      <div class="hud">
        <select class="input" id="sdDiff" style="width:auto"><option value="38">Easy</option><option value="32" selected>Medium</option><option value="27">Hard</option><option value="23">Expert</option></select>
        <button class="btn btn-primary btn-sm" id="sdNew">New puzzle</button>
        <button class="btn btn-ghost btn-sm" id="sdHint">Hint</button>
        <button class="btn btn-ghost btn-sm" id="sdErase">Erase</button>
      </div>
      <div class="hud"><span class="chip">Mistakes <strong id="sdErr">0</strong>/3</span><span class="chip chip-accent">Time <strong id="sdTime">0:00</strong></span></div>
      <div class="sudoku-board" id="sdBoard"></div>
      <div class="sk-pad" id="sdPad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join('')}</div></div>`;
    let solution,puzzle,given,mistakes,sel=null,seconds=0,timer=null,done=false;
    const boardEl=root.querySelector('#sdBoard');
    function emptyGrid(){return Array.from({length:9},()=>Array(9).fill(0));}
    function valid(g,r,c,n){
      for(let i=0;i<9;i++)if(g[r][i]===n||g[i][c]===n)return false;
      const br=r-r%3,bc=c-c%3;
      for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(g[br+i][bc+j]===n)return false;
      return true;
    }
    function shuffle(a){for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
    function fill(g){
      for(let r=0;r<9;r++)for(let c=0;c<9;c++){
        if(!g[r][c]){
          for(const n of shuffle([1,2,3,4,5,6,7,8,9])){
            if(valid(g,r,c,n)){g[r][c]=n;if(fill(g))return true;g[r][c]=0;}
          }
          return false;
        }
      }
      return true;
    }
    function countSolutions(g,limit){
      let count=0;
      (function solve(){
        if(count>=limit)return;
        for(let r=0;r<9;r++)for(let c=0;c<9;c++){
          if(!g[r][c]){
            for(let n=1;n<=9;n++){
              if(valid(g,r,c,n)){g[r][c]=n;solve();g[r][c]=0;if(count>=limit)return;}
            }
            return;
          }
        }
        count++;
      })();
      return count;
    }
    function makePuzzle(clues){
      solution=emptyGrid();fill(solution);
      puzzle=solution.map(r=>[...r]);
      let cells=shuffle([...Array(81).keys()]);
      let remain=81;
      for(const i of cells){
        if(remain<=clues)break;
        const r=(i/9)|0,c=i%9,bak=puzzle[r][c];
        puzzle[r][c]=0;
        const copy=puzzle.map(row=>[...row]);
        if(countSolutions(copy,2)!==1)puzzle[r][c]=bak;else remain--;
      }
      given=puzzle.map(r=>r.map(v=>!!v));
    }
    function draw(){
      boardEl.innerHTML='';
      for(let r=0;r<9;r++)for(let c=0;c<9;c++){
        const d=document.createElement('div');
        d.className='sk-cell'+(given[r][c]?' given':' user');
        d.dataset.r=r;d.dataset.c=c;
        if(puzzle[r][c])d.textContent=puzzle[r][c];
        if(sel&&sel[0]===r&&sel[1]===c)d.classList.add('sel');
        else if(sel&&(sel[0]===r||sel[1]===c||((sel[0]/3|0)===(r/3|0)&&(sel[1]/3|0)===(c/3|0))))d.classList.add('same');
        d.onclick=()=>{if(!given[r][c]&&!done){sel=[r,c];draw();}};
        boardEl.appendChild(d);
      }
    }
    function enter(n){
      if(!sel||done)return;
      const[r,c]=sel;
      if(given[r][c])return;
      puzzle[r][c]=n;
      draw();
      if(n!==solution[r][c]){
        mistakes++;root.querySelector('#sdErr').textContent=mistakes;
        const cell=boardEl.children[r*9+c];cell.classList.add('err');
        if(mistakes>=3){gameOver(false);}
      }else{
        if(puzzle.flat().every(v=>v))gameOver(true);
      }
    }
    function hint(){
      if(done)return;
      const empties=[];
      puzzle.forEach((r,y)=>r.forEach((v,x)=>{if(!v)empties.push([y,x]);}));
      if(!empties.length)return;
      const[r,c]=empties[(Math.random()*empties.length)|0];
      puzzle[r][c]=solution[r][c];given[r][c]=true;
      sel=[r,c];draw();
      if(puzzle.flat().every(v=>v))gameOver(true);
    }
    function erase(){if(sel&&!given[sel[0]][sel[1]]&&!done){puzzle[sel[0]][sel[1]]=0;draw();}}
    function gameOver(win){
      done=true;clearInterval(timer);
      if(win){
        const best=+(localStorage.getItem(ctx.bestKey)||0);
        if(!best||seconds<best)localStorage.setItem(ctx.bestKey,seconds);
        ctx.refreshBest();
        toast('Solved in '+fmt(seconds)+'!');
      }else toast('Three mistakes - start a new puzzle');
    }
    function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
    function newGame(){
      const clues=+root.querySelector('#sdDiff').value;
      makePuzzle(clues);mistakes=0;seconds=0;done=false;sel=null;
      root.querySelector('#sdErr').textContent='0';
      clearInterval(timer);
      timer=setInterval(()=>{seconds++;root.querySelector('#sdTime').textContent=fmt(seconds);},1000);
      draw();
    }
    root.querySelector('#sdNew').onclick=newGame;
    root.querySelector('#sdHint').onclick=hint;
    root.querySelector('#sdErase').onclick=erase;
    root.querySelectorAll('#sdPad button').forEach(b=>b.onclick=()=>enter(+b.dataset.n));
    const kh=e=>{
      if(e.key>='1'&&e.key<='9')enter(+e.key);
      else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0')erase();
      else if(sel&&e.key.startsWith('Arrow')){
        let[r,c]=sel;
        if(e.key==='ArrowUp')r=Math.max(0,r-1);if(e.key==='ArrowDown')r=Math.min(8,r+1);
        if(e.key==='ArrowLeft')c=Math.max(0,c-1);if(e.key==='ArrowRight')c=Math.min(8,c+1);
        e.preventDefault();sel=[r,c];draw();
      }
    };
    document.addEventListener('keydown',kh);
    newGame();
    return {unmount(){clearInterval(timer);document.removeEventListener('keydown',kh);},api:{enter,hint,getPuzzle:()=>puzzle,getSolution:()=>solution}};
  },
  bestText(){const s=+localStorage.getItem('best-sudoku');return s?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):'-';}
};
