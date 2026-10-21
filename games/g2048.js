/* 2048 */
window.GAMES=window.GAMES||{};
GAMES.g2048={
  title:'2048',icon:'\u{1F9E9}',desc:'Slide tiles, merge to 2048.',
  bestKey:'best-2048',
  mount(root,ctx){
    root.innerHTML=`<div class="stage">
      <div class="hud"><span class="chip">Score <strong id="g2Score">0</strong></span>
      <button class="btn btn-primary btn-sm" id="g2New">New game</button>
      <button class="btn btn-ghost btn-sm" id="g2Undo">Undo</button></div>
      <div class="g2048-board" id="g2Board"><div class="g2048-grid">${'<div class="g2048-cell"></div>'.repeat(16)}</div><div id="g2Tiles" style="position:absolute;inset:10px"></div></div>
      <p class="muted small">Arrow keys / swipe</p></div>`;
    let grid,score,prev=null,over=false,won=false;
    const boardEl=root.querySelector('#g2Board'),tilesEl=root.querySelector('#g2Tiles');
    const COLORS={2:['#eee4da','#776e65'],4:['#ede0c8','#776e65'],8:['#f2b179','#fff'],16:['#f59563','#fff'],32:['#f67c5f','#fff'],64:['#f65e3b','#fff'],128:['#edcf72','#fff'],256:['#edcc61','#fff'],512:['#edc850','#fff'],1024:['#edc53f','#fff'],2048:['#edc22e','#fff']};
    function empty(){const out=[];grid.forEach((r,y)=>r.forEach((v,x)=>{if(!v)out.push({x,y});}));return out;}
    function spawn(){const e=empty();if(!e.length)return;const p=e[(Math.random()*e.length)|0];grid[p.y][p.x]=Math.random()<.9?2:4;}
    function reset(){grid=Array.from({length:4},()=>[0,0,0,0]);score=0;prev=null;over=false;won=false;spawn();spawn();draw();}
    function draw(){
      root.querySelector('#g2Score').textContent=score;
      const w=boardEl.clientWidth-20,gap=10,cell=(w-gap*3)/4;
      tilesEl.innerHTML='';
      grid.forEach((r,y)=>r.forEach((v,x)=>{
        if(!v)return;
        const t=document.createElement('div');t.className='g2048-tile';
        const[bg,fg]=COLORS[v]||['#3c3a32','#fff'];
        t.style.cssText=`width:${cell}px;height:${cell}px;background:${bg};color:${fg};font-size:${v>=1024?cell*.28:cell*.36}px;transform:translate(${x*(cell+gap)}px,${y*(cell+gap)}px)`;
        t.textContent=v;tilesEl.appendChild(t);
      }));
    }
    function slide(row){
      let arr=row.filter(v=>v),gained=0;
      for(let i=0;i<arr.length-1;i++)if(arr[i]===arr[i+1]){arr[i]*=2;gained+=arr[i];arr.splice(i+1,1);}
      while(arr.length<4)arr.push(0);
      return{arr,gained};
    }
    function move(dir){
      if(over)return;
      const before=JSON.stringify(grid);
      prev={grid:JSON.parse(before),score};
      const rot=g=>g[0].map((_,i)=>g.map(r=>r[i]));
      let gained=0;
      if(dir==='left'||dir==='right'){
        grid=grid.map(r=>{const src=dir==='left'?r:[...r].reverse();const{arr,gained:gn}=slide(src);gained+=gn;return dir==='left'?arr:arr.reverse();});
      }else{
        let g=rot(grid);
        g=g.map(r=>{const src=dir==='up'?r:[...r].reverse();const{arr,gained:gg}=slide(src);gained+=gg;return dir==='up'?arr:arr.reverse();});
        grid=rot(g);
      }
      if(JSON.stringify(grid)!==before){score+=gained;spawn();draw();checkEnd();}
      else prev=null;
    }
    function checkEnd(){
      if(!won&&grid.flat().includes(2048)){won=true;ctx.saveBest(score);toast('You made 2048! Keep going or start a new game.');}
      if(empty().length)return;
      const can=[0,1,2,3].some(y=>[0,1,2,3].some(x=>
        (x<3&&grid[y][x]===grid[y][x+1])||(y<3&&grid[y][x]===grid[y+1][x])));
      if(!can){over=true;ctx.saveBest(score);toast('No moves left - game over. Score '+score);}
    }
    root.querySelector('#g2New').onclick=reset;
    root.querySelector('#g2Undo').onclick=()=>{if(prev){grid=prev.grid;score=prev.score;prev=null;draw();}};
    const kh=e=>{
      const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
      if(m[e.key]){e.preventDefault();move(m[e.key]);}
    };
    document.addEventListener('keydown',kh);
    let tx=0,ty=0;
    boardEl.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    boardEl.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
      if(Math.abs(dx)<24&&Math.abs(dy)<24)return;
      move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
    },{passive:true});
    const ro=new ResizeObserver(draw);ro.observe(boardEl);
    reset();
    return {unmount(){document.removeEventListener('keydown',kh);ro.disconnect();},api:{move,getGrid:()=>grid,getScore:()=>score}};
  }
};
