(function () {
  'use strict';
  const C=MinesCore,key='anirudh-minesweeper-v1',$=id=>document.getElementById(id),board=$('board');
  let state=C.fresh(),bests={},paused=false,flagMode=false,focusIndex=0,lastClock=0,finishedRecorded=false;
  const format=ms=>{const seconds=Math.floor(ms/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
  function storageFailure(){$('save-note').textContent='Browser saving is unavailable. This session still works.';}
  try{
    const bestValue=JSON.parse(localStorage.getItem(key+'.best')||'{}');
    if(bestValue&&typeof bestValue==='object')for(const level of Object.keys(C.levels)){const v=bestValue[level];if(Number.isFinite(v)&&v>=0)bests[level]=v;}
    const value=localStorage.getItem(key+'.save');if(value){const restored=C.restore(JSON.parse(value));if(restored){state=restored;paused=state.status==='playing';}else localStorage.removeItem(key+'.save');}
  }catch(_){storageFailure();}
  function clock(){const now=Date.now();if(state.status==='playing'&&!paused&&lastClock)state.elapsed+=Math.max(0,now-lastClock);lastClock=now;}
  function persist(){try{localStorage.setItem(key+'.best',JSON.stringify(bests));if(['ready','playing'].includes(state.status))localStorage.setItem(key+'.save',JSON.stringify(state));else localStorage.removeItem(key+'.save');}catch(_){storageFailure();}}
  function recordFinish(){if(!finishedRecorded&&['won','lost'].includes(state.status)){finishedRecorded=true;if(state.status==='won'&&(bests[state.level]===undefined||state.elapsed<bests[state.level]))bests[state.level]=state.elapsed;}}
  function statusText(){if(paused)return 'Paused. Your exact board and time are saved.';if(state.status==='won')return 'Field cleared! Your best time is saved.';if(state.status==='lost')return 'Mine found. Start a new board and try again.';if(state.status==='ready')return 'Choose any tile. Your first reveal is safe.';return flagMode?'Flag mode is on. Tap tiles to place or remove flags.':'Keep going. Every number counts its eight neighbors.';}
  function build(){
    board.innerHTML='';board.dataset.level=state.level;board.setAttribute('aria-rowcount',state.rows);board.setAttribute('aria-colcount',state.cols);$('difficulty').value=state.level;
    for(let r=0;r<state.rows;r++){const row=document.createElement('div');row.className='row';row.setAttribute('role','row');for(let c=0;c<state.cols;c++){const i=r*state.cols+c,b=document.createElement('button');b.type='button';b.className='cell';b.dataset.index=i;b.setAttribute('role','gridcell');b.setAttribute('aria-rowindex',r+1);b.setAttribute('aria-colindex',c+1);b.tabIndex=i===focusIndex?0:-1;row.append(b);}board.append(row);}
    render();
  }
  function render(){
    const done=['won','lost'].includes(state.status),lost=state.status==='lost';
    board.querySelectorAll('.cell').forEach((b,i)=>{
      const value=state.board?state.board[i]:0,revealed=state.revealed[i],mine=lost&&value===-1,flagged=state.flags[i],wrong=lost&&flagged&&value!==-1;
      b.className='cell'+(revealed?' revealed n'+value:'')+(flagged?' flagged':'')+(mine?' mine':'')+(state.triggered===i?' triggered':'')+(wrong?' wrong':'');
      b.textContent=wrong?'×':mine?'✹':flagged?'⚑':revealed&&value>0?String(value):'';
      const description=wrong?'incorrect flag':mine?'mine':flagged?'flagged':revealed?(value===0?'empty':value+' neighboring '+(value===1?'mine':'mines')):'hidden';
      b.setAttribute('aria-label','Row '+(Math.floor(i/state.cols)+1)+', column '+(i%state.cols+1)+', '+description);
      b.setAttribute('aria-disabled',String(done||paused));b.tabIndex=i===focusIndex?0:-1;
    });
    $('mines').textContent=state.mines-state.flags.filter(Boolean).length;$('time').textContent=format(state.elapsed);$('best').textContent=bests[state.level]===undefined?'—':format(bests[state.level]);
    $('status').textContent=statusText();$('pause').disabled=state.status!=='playing';$('pause').textContent=paused?'Resume':'Pause';$('pause-overlay').hidden=!paused;
    $('flag-mode').setAttribute('aria-pressed',String(flagMode));$('flag-mode').innerHTML='<span aria-hidden="true">⚑</span> Flag mode: '+(flagMode?'on':'off');
  }
  function act(i,flag=false,chord=false){
    if(paused)return;clock();const changed=chord?C.chord(state,i):flag?C.flag(state,i):C.reveal(state,i);
    if(changed){lastClock=Date.now();recordFinish();persist();render();}
  }
  function fresh(level){clock();state=C.fresh(level);paused=false;finishedRecorded=false;focusIndex=0;lastClock=0;persist();build();}
  function pause(){if(state.status!=='playing')return;clock();paused=!paused;lastClock=Date.now();persist();render();if(paused)$('resume').focus();else board.querySelector('[data-index="'+focusIndex+'"]').focus({preventScroll:true});}
  board.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b){focusIndex=Number(b.dataset.index);act(focusIndex,flagMode);}});
  board.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-index]');if(b){e.preventDefault();focusIndex=Number(b.dataset.index);act(focusIndex,true);}});
  board.addEventListener('dblclick',e=>{const b=e.target.closest('[data-index]');if(b&&!flagMode)act(Number(b.dataset.index),false,true);});
  board.addEventListener('focusin',e=>{const b=e.target.closest('[data-index]');if(b){focusIndex=Number(b.dataset.index);board.querySelectorAll('.cell').forEach(cell=>cell.tabIndex=cell===b?0:-1);}});
  board.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    const b=e.target.closest('[data-index]');if(!b)return;const i=Number(b.dataset.index),r=Math.floor(i/state.cols),c=i%state.cols;let next=i;
    if(e.key==='ArrowLeft')next=r*state.cols+Math.max(0,c-1);else if(e.key==='ArrowRight')next=r*state.cols+Math.min(state.cols-1,c+1);else if(e.key==='ArrowUp')next=Math.max(0,r-1)*state.cols+c;else if(e.key==='ArrowDown')next=Math.min(state.rows-1,r+1)*state.cols+c;
    else if(e.key==='Enter'){e.preventDefault();if(!e.repeat)act(i,false,state.revealed[i]);return;}else if(e.key.toLowerCase()==='f'){e.preventDefault();if(!e.repeat)act(i,true);return;}else return;
    e.preventDefault();focusIndex=next;board.querySelector('[data-index="'+next+'"]').focus();
  });
  $('new-game').addEventListener('click',()=>fresh($('difficulty').value));$('difficulty').addEventListener('change',()=>fresh($('difficulty').value));$('pause').addEventListener('click',pause);$('resume').addEventListener('click',pause);$('flag-mode').addEventListener('click',()=>{flagMode=!flagMode;render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.status==='playing'&&!paused){clock();paused=true;persist();render();}});
  window.addEventListener('pagehide',()=>{clock();persist();});
  setInterval(()=>{if(state.status==='playing'&&!paused){clock();$('time').textContent=format(state.elapsed);persist();}},500);
  build();lastClock=Date.now();
})();
