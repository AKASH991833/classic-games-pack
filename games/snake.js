/* Snake */
window.GAMES=window.GAMES||{};
GAMES.snake={
  title:'Snake',icon:'\u{1F40D}',desc:'Eat, grow, don\'t bite yourself.',
  bestKey:'best-snake',
  mount(root,ctx){
    const N=20,CELL=22;
    root.innerHTML=`<div class="stage">
      <div class="hud"><span class="chip">Score <strong id="skScore">0</strong></span><span class="chip chip-accent">Speed <strong id="skSpeed">1</strong></span>
      <button class="btn btn-primary btn-sm" id="skStart">Start</button></div>
      <div class="board-wrap"><canvas class="game" id="skCanvas" width="${N*CELL}" height="${N*CELL}"></canvas></div>
      <div class="dpad">
        <span></span><button data-d="up" aria-label="Up">&#9650;</button><span></span>
        <button data-d="left" aria-label="Left">&#9664;</button><span></span><button data-d="right" aria-label="Right">&#9654;</button>
        <span></span><button data-d="down" aria-label="Down">&#9660;</button><span></span>
      </div>
      <p class="muted small">Arrow keys / WASD / swipe</p></div>`;
    const cv=root.querySelector('#skCanvas'),g=cv.getContext('2d');
    let snake,dir,nextDir,food,score,speed,timer=null,alive=false;
    const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    function place(){do{food={x:(Math.random()*N)|0,y:(Math.random()*N)|0};}while(snake.some(s=>s.x===food.x&&s.y===food.y));}
    function reset(){snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}];dir=nextDir={x:1,y:0};score=0;speed=1;place();draw();upd();}
    function upd(){root.querySelector('#skScore').textContent=score;root.querySelector('#skSpeed').textContent=speed;}
    function draw(){
      g.fillStyle=css('--surface');g.fillRect(0,0,cv.width,cv.height);
      g.strokeStyle=css('--border');g.lineWidth=1;
      for(let i=1;i<N;i++){g.beginPath();g.moveTo(i*CELL,0);g.lineTo(i*CELL,cv.height);g.stroke();g.beginPath();g.moveTo(0,i*CELL);g.lineTo(cv.width,i*CELL);g.stroke();}
      g.fillStyle=css('--bad');
      g.beginPath();g.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL/2.6,0,7);g.fill();
      snake.forEach((s,i)=>{
        g.fillStyle=i===0?css('--accent-strong'):css('--accent');
        g.globalAlpha=1-i/(snake.length*3);
        g.beginPath();g.roundRect(s.x*CELL+1.5,s.y*CELL+1.5,CELL-3,CELL-3,6);g.fill();g.globalAlpha=1;
      });
    }
    function step(){
      dir=nextDir;
      const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
      if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){die();return;}
      snake.unshift(h);
      if(h.x===food.x&&h.y===food.y){score+=10;if(score%50===0){speed++;clearInterval(timer);timer=setInterval(step,Math.max(60,160-speed*10));}place();}
      else snake.pop();
      upd();draw();
    }
    function die(){
      clearInterval(timer);timer=null;alive=false;
      ctx.saveBest(score);
      g.fillStyle='rgba(10,15,30,.55)';g.fillRect(0,0,cv.width,cv.height);
      g.fillStyle='#fff';g.font='bold 26px sans-serif';g.textAlign='center';
      g.fillText('Game over',cv.width/2,cv.height/2-10);
      g.font='15px sans-serif';g.fillText('Score '+score+' - press Start to play again',cv.width/2,cv.height/2+20);
      root.querySelector('#skStart').textContent='Play again';
    }
    function start(){clearInterval(timer);reset();alive=true;root.querySelector('#skStart').textContent='Restart';timer=setInterval(step,150);}
    function turn(d){
      const map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
      const nd=map[d];if(!nd)return;
      if(nd.x===-dir.x&&nd.y===-dir.y)return;
      nextDir=nd;
    }
    root.querySelector('#skStart').onclick=start;
    root.querySelectorAll('.dpad button').forEach(b=>b.onclick=()=>turn(b.dataset.d));
    const kh=e=>{
      const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
      if(m[e.key]){e.preventDefault();turn(m[e.key]);}
    };
    document.addEventListener('keydown',kh);
    let tx=0,ty=0;
    cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    cv.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
      if(Math.abs(dx)<24&&Math.abs(dy)<24)return;
      turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
    },{passive:true});
    reset();
    return {unmount(){clearInterval(timer);document.removeEventListener('keydown',kh);}};
  }
};
