(function(){
  'use strict';
  // Board, active mode, turn, and lifetime round records use one local save.
  const KEY='anirudh-connect-four-v1',ORDER=[3,2,4,1,5,0,6];
  const emptyRecords=()=>({
    computer:[0,0,0],local:[0,0,0]
  });
  function recordsValid(r){
    return r&&['computer','local'].every(k=>Array.isArray(r[k])&&r[k].length===3&&r[k].every(n=>Number.isInteger(n)&&n>=0&&n<1e9));
  }
  function fresh(mode='computer',records=emptyRecords()){
    return {
      board:Array(42).fill(0),turn:1,mode,records,recorded:false
    };
  }
  function lineFor(b,p){
    for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
      const cells=[];
      for(let k=0;k<4;k++){
        const y=r+dr*k,x=c+dc*k;
        if(y<6&&x>=0&&x<7&&b[y*7+x]===p)cells.push(y*7+x);
      }
      if(cells.length===4)return cells;
    }
    return [];
  }
  function winner(b){
    if(lineFor(b,1).length)return 1;
    if(lineFor(b,2).length)return 2;
    return b.every(Boolean)?3:0;
  }
  function drop(b,c,p){
    if(!Number.isInteger(c)||c<0||c>6)return -1;
    for(let r=5;r>=0;r--)if(!b[r*7+c]){
      b[r*7+c]=p;
      return r*7+c;
    }
    return -1;
  }
  function valid(r){
    if(!r||!Array.isArray(r.board)||r.board.length!==42||!r.board.every(n=>[0,1,2].includes(n))||!['computer','local'].includes(r.mode)||!recordsValid(r.records))return null;
    const a=r.board.filter(n=>n===1).length,b=r.board.filter(n=>n===2).length,w1=lineFor(r.board,1).length,w2=lineFor(r.board,2).length;
    if(!(a===b||a===b+1)||r.turn!==(a===b?1:2)||(w1&&w2)||(w1&&a!==b+1)||(w2&&a!==b))return null;
    for(let c=0;c<7;c++){
      let occupied=false;
      for(let y=0;y<6;y++){
        if(r.board[y*7+c])occupied=true;
        else if(occupied)return null;
      }
    }
    return {
      board:r.board.slice(),turn:r.turn,mode:r.mode,records:{
        computer:r.records.computer.slice(),local:r.records.local.slice()
      },recorded:!!winner(r.board)&&r.recorded===true
    };
  }
  function move(s,c){
    if(winner(s.board))return false;
    if(drop(s.board,c,s.turn)<0)return false;
    s.turn=3-s.turn;
    s.recorded=false;
    return true;
  }
  function evaluate(b){
    let score=0;
    for(let r=0;r<6;r++)if(b[r*7+3])score+=b[r*7+3]===2?7:-7;
    for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
      const vals=[];
      for(let k=0;k<4;k++){
        const y=r+dr*k,x=c+dc*k;
        if(y<6&&x>=0&&x<7)vals.push(b[y*7+x]);
      }
      if(vals.length!==4)continue;
      const a=vals.filter(n=>n===2).length,h=vals.filter(n=>n===1).length;
      if(!h)score+=[0,1,9,80,0][a];
      if(!a)score-=[0,1,11,110,0][h];
    }
    return score;
  }
  // Search is deliberately bounded so the computer stays responsive on small devices.
  function computerMove(b){
    if(winner(b))return -1;
    const legal=ORDER.filter(c=>!b[c]);
    for(const p of [2,1])for(const c of legal){
      const t=b.slice();
      drop(t,c,p);
      if(lineFor(t,p).length)return c;
    }
    function search(t,depth,turn,alpha,beta){
      const w=winner(t);
      if(w)return w===2?100000+depth:w===1?-100000-depth:0;
      if(!depth)return evaluate(t);
      let best=turn===2?-Infinity:Infinity;
      for(const c of ORDER){
        if(t[c])continue;
        const next=t.slice();
        drop(next,c,turn);
        const n=search(next,depth-1,3-turn,alpha,beta);
        if(turn===2){
          best=Math.max(best,n);
          alpha=Math.max(alpha,best);
        }
        else{
          best=Math.min(best,n);
          beta=Math.min(beta,best);
        }
        if(beta<=alpha)break;
      }
      return best;
    }
    let choice=legal[0],best=-Infinity;
    for(const c of legal){
      const t=b.slice();
      drop(t,c,2);
      const n=search(t,3,1,-Infinity,Infinity);
      if(n>best){
        best=n;
        choice=c;
      }
    }
    return choice;
  }
  if(typeof module!=='undefined'&&module.exports){
    module.exports={
      fresh,winner,lineFor,drop,valid,move,computerMove,KEY
    };
    if(typeof document==='undefined')return;
  }
  // The UI also restores a pending computer turn after a reload.
  let state=fresh(),timer=0,focus=3,storageOK=true;
  const $=s=>document.querySelector(s),board=$('#board');
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const parsed=valid(JSON.parse(raw));
      if(parsed)state=parsed;
    }
  }
  catch(e){
    storageOK=false;
  }
  function save(){
    try{
      localStorage.setItem(KEY,JSON.stringify(state));
      storageOK=true;
    }
    catch(e){
      storageOK=false;
    }
    $('#save-note').textContent=storageOK?'Board and win records save automatically in this browser.':'Saving is unavailable in this browser. Keep this tab open to keep your round.';
    $('#save-note').classList.toggle('error',!storageOK);
  }
  function finish(){
    const w=winner(state.board);
    if(w&&!state.recorded){
      state.records[state.mode][w===3?2:w-1]++;
      state.recorded=true;
    }
  }
  function render(){
    finish();
    const w=winner(state.board),line=w&&w!==3?lineFor(state.board,w):[],own=state.mode==='computer';
    $('#mode').value=state.mode;
    $('#record').textContent=state.records[state.mode][0]+' – '+state.records[state.mode][1];
    $('#record').title=state.records[state.mode][2]+' drawn rounds';
    $('#p1-label').textContent=own?'YOU / LIME':'PLAYER 1 / LIME';
    $('#p2-label').textContent=own?'COMPUTER / PURPLE':'PLAYER 2 / PURPLE';
    $('#turn-dot').classList.toggle('purple',state.turn===2);
    $('#status').textContent=w===3?'Draw. No more room — start another round.':w?(w===1?(own?'You connect four!':'Player 1 connects four!'):(own?'Computer connects four. Try again!':'Player 2 connects four!')):own?(state.turn===1?'Your turn. Choose a column.':'Computer is thinking…'):'Player '+state.turn+'’s turn. Choose a column.';
    const active=document.activeElement&&document.activeElement.dataset.column;
    board.replaceChildren();
    for(let c=0;c<7;c++){
      const el=document.createElement('button');
      el.type='button';
      el.className='column';
      el.dataset.column=c;
      el.tabIndex=c===focus?0:-1;
      el.setAttribute('aria-label','Drop in column '+(c+1)+'. '+Array.from({
        length:6
      },(_,r)=>state.board[r*7+c]).filter(Boolean).length+' discs.');
      el.setAttribute('aria-disabled',String(!!state.board[c]||!!w||(own&&state.turn===2)));
      const arrow=document.createElement('span');
      arrow.className='drop-arrow';
      arrow.textContent='↓';
      arrow.setAttribute('aria-hidden','true');
      el.append(arrow);
      for(let r=0;r<6;r++){
        const i=r*7+c,slot=document.createElement('span');
        slot.className='slot '+(state.board[i]===1?'lime':state.board[i]===2?'purple':'')+(line.includes(i)?' winning':'');
        slot.setAttribute('aria-hidden','true');
        el.append(slot);
      }
      board.append(el);
    }
    if(active!==undefined)board.children[focus]?.focus();
    save();
  }
  function schedule(){
    clearTimeout(timer);
    if(!winner(state.board)&&state.mode==='computer'&&state.turn===2)timer=setTimeout(()=>{
      const c=computerMove(state.board);if(c>=0)move(state,c);render();
    },350);
  }
  function act(c){
    if(state.mode==='computer'&&state.turn===2)return;
    if(move(state,c)){
      focus=c;
      render();
      schedule();
    }
  }
  board.addEventListener('click',e=>{
    const el=e.target.closest('[data-column]');if(el)act(Number(el.dataset.column));
  });
  board.addEventListener('keydown',e=>{
    const c=Number(e.target.closest('[data-column]')?.dataset.column);if(!Number.isInteger(c))return;let next;if(e.key==='ArrowRight')next=(c+1)%7;else if(e.key==='ArrowLeft')next=(c+6)%7;else if(e.key==='Home')next=0;else if(e.key==='End')next=6;else return;e.preventDefault();focus=next;for(const el of board.children)el.tabIndex=Number(el.dataset.column)===focus?0:-1;board.children[focus].focus();
  });
  function restart(mode){
    clearTimeout(timer);
    state=fresh(mode,state.records);
    focus=3;
    render();
    schedule();
  }
  $('#restart').addEventListener('click',()=>restart(state.mode));
  $('#mode').addEventListener('change',e=>restart(e.target.value));
  render();
  schedule();
})();
