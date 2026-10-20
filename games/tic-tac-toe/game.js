(function(){
  'use strict';
  // Board, active mode, turn, and lifetime round records use one local save.
  const KEY='anirudh-tic-tac-toe-v1',LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const emptyRecords=()=>({
    computer:[0,0,0],local:[0,0,0]
  });
  function recordsValid(r){
    return r&&['computer','local'].every(k=>Array.isArray(r[k])&&r[k].length===3&&r[k].every(n=>Number.isInteger(n)&&n>=0&&n<1e9));
  }
  function fresh(mode='computer',records=emptyRecords()){
    return {
      board:Array(9).fill(0),turn:1,mode,records,recorded:false
    };
  }
  function winner(b){
    for(const l of LINES)if(b[l[0]]&&l.every(i=>b[i]===b[l[0]]))return b[l[0]];
    return b.every(Boolean)?3:0;
  }
  function winLine(b){
    return LINES.find(l=>b[l[0]]&&l.every(i=>b[i]===b[l[0]]))||[];
  }
  function valid(r){
    if(!r||!Array.isArray(r.board)||r.board.length!==9||!r.board.every(n=>[0,1,2].includes(n))||!['computer','local'].includes(r.mode)||!recordsValid(r.records))return null;
    const a=r.board.filter(n=>n===1).length,b=r.board.filter(n=>n===2).length,w=winner(r.board),wins=[1,2].map(p=>LINES.some(l=>l.every(i=>r.board[i]===p)));
    if(!(a===b||a===b+1)||r.turn!==(a===b?1:2)||(wins[0]&&wins[1])||(wins[0]&&a!==b+1)||(wins[1]&&a!==b))return null;
    return {
      board:r.board.slice(),turn:r.turn,mode:r.mode,records:{
        computer:r.records.computer.slice(),local:r.records.local.slice()
      },recorded:!!w&&r.recorded===true
    };
  }
  function move(s,i){
    if(winner(s.board)||!Number.isInteger(i)||i<0||i>=9||s.board[i])return false;
    s.board[i]=s.turn;
    s.turn=3-s.turn;
    s.recorded=false;
    return true;
  }
  // Search is deliberately bounded so the computer stays responsive on small devices.
  function computerMove(b){
    if(winner(b))return -1;
    function search(board,turn,depth){
      const w=winner(board);
      if(w)return w===2?10-depth:w===1?depth-10:0;
      let best=turn===2?-Infinity:Infinity;
      for(const i of [4,0,2,6,8,1,3,5,7])if(!board[i]){
        board[i]=turn;
        const score=search(board,3-turn,depth+1);
        board[i]=0;
        best=turn===2?Math.max(best,score):Math.min(best,score);
      }
      return best;
    }
    let best=-Infinity,choice=-1;
    for(const i of [4,0,2,6,8,1,3,5,7])if(!b[i]){
      const test=b.slice();
      test[i]=2;
      const v=search(test,1,0);
      if(v>best){
        best=v;
        choice=i;
      }
    }
    return choice;
  }
  if(typeof module!=='undefined'&&module.exports){
    module.exports={
      fresh,winner,winLine,valid,move,computerMove,KEY
    };
    if(typeof document==='undefined')return;
  }
  // The UI also restores a pending computer turn after a reload.
  let state=fresh(),timer=0,focus=0,storageOK=true;
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
    const w=winner(state.board),line=winLine(state.board),own=state.mode==='computer';
    $('#mode').value=state.mode;
    $('#record').textContent=state.records[state.mode][0]+' – '+state.records[state.mode][1];
    $('#record').title=state.records[state.mode][2]+' drawn rounds';
    $('#p1-label').textContent=own?'YOU / X':'PLAYER 1 / X';
    $('#p2-label').textContent=own?'COMPUTER / O':'PLAYER 2 / O';
    $('#turn-dot').classList.toggle('purple',state.turn===2);
    $('#status').textContent=w===3?'Draw. The board is full — try another round.':w?(w===1?(own?'You win!':'Player 1 wins!'):(own?'Computer wins. Try again!':'Player 2 wins!')):own?(state.turn===1?'Your turn. Place an X.':'Computer is thinking…'):'Player '+state.turn+'’s turn. Place '+(state.turn===1?'X.':'O.');
    const active=document.activeElement&&document.activeElement.dataset.cell;
    board.replaceChildren();
    state.board.forEach((v,i)=>{
      const el=document.createElement('button');el.className='square '+(v===1?'x':v===2?'o':'')+(line.includes(i)?' winning':'');el.type='button';el.textContent=v===1?'X':v===2?'O':'';el.dataset.cell=i;el.tabIndex=i===focus?0:-1;el.setAttribute('aria-label','Row '+(Math.floor(i/3)+1)+', column '+(i%3+1)+': '+(v?(v===1?'X':'O'):'empty'));el.setAttribute('aria-disabled',String(!!v||!!w||(own&&state.turn===2)));board.append(el);
    });
    if(active!==undefined)board.querySelector('[data-cell="'+focus+'"]')?.focus();
    save();
  }
  function schedule(){
    clearTimeout(timer);
    if(!winner(state.board)&&state.mode==='computer'&&state.turn===2)timer=setTimeout(()=>{
      const choice=computerMove(state.board);if(choice>=0)move(state,choice);render();
    },320);
  }
  function act(i){
    if(state.mode==='computer'&&state.turn===2)return;
    if(move(state,i)){
      focus=i;
      render();
      schedule();
    }
  }
  board.addEventListener('click',e=>{
    const el=e.target.closest('[data-cell]');if(el)act(Number(el.dataset.cell));
  });
  board.addEventListener('keydown',e=>{
    const i=Number(e.target.dataset.cell);if(!Number.isInteger(i))return;let next=i;if(e.key==='ArrowRight')next=(i+1)%9;else if(e.key==='ArrowLeft')next=(i+8)%9;else if(e.key==='ArrowDown')next=(i+3)%9;else if(e.key==='ArrowUp')next=(i+6)%9;else if(e.key==='Home')next=0;else if(e.key==='End')next=8;else return;e.preventDefault();focus=next;for(const el of board.children)el.tabIndex=Number(el.dataset.cell)===focus?0:-1;board.children[focus].focus();
  });
  function restart(mode){
    clearTimeout(timer);
    state=fresh(mode,state.records);
    focus=0;
    render();
    schedule();
  }
  $('#restart').addEventListener('click',()=>restart(state.mode));
  $('#mode').addEventListener('change',e=>restart(e.target.value));
  render();
  schedule();
})();
