(function(){
  'use strict';
  // Board, active mode, turn, and lifetime round records use one local save.
  const KEY='anirudh-reversi-v1',DIRECTIONS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],CORNERS=[0,7,56,63];
  const emptyRecords=()=>({
    computer:[0,0,0],local:[0,0,0]
  });
  function recordsValid(r){
    return r&&['computer','local'].every(k=>Array.isArray(r[k])&&r[k].length===3&&r[k].every(n=>Number.isInteger(n)&&n>=0&&n<1e9));
  }
  function fresh(mode='computer',records=emptyRecords()){
    const board=Array(64).fill(0);
    board[27]=board[36]=2;
    board[28]=board[35]=1;
    return {
      board,turn:1,mode,records,recorded:false,pass:0
    };
  }
  function flipsFor(b,i,p){
    if(!Number.isInteger(i)||i<0||i>63||b[i])return [];
    const row=Math.floor(i/8),col=i%8,all=[];
    for(const [dr,dc] of DIRECTIONS){
      const found=[];
      let y=row+dr,x=col+dc;
      while(y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]===3-p){
        found.push(y*8+x);
        y+=dr;
        x+=dc;
      }
      if(found.length&&y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]===p)all.push(...found);
    }
    return all;
  }
  function legalMoves(b,p){
    const result=[];
    for(let i=0;i<64;i++)if(!b[i]){
      const flips=flipsFor(b,i,p);
      if(flips.length)result.push({
        index:i,flips
      });
    }
    return result;
  }
  function counts(b){
    return [b.filter(n=>n===1).length,b.filter(n=>n===2).length];
  }
  function winner(b){
    if(legalMoves(b,1).length||legalMoves(b,2).length)return 0;
    const [a,c]=counts(b);
    return a===c?3:a>c?1:2;
  }
  function normalize(s){
    s.pass=0;
    if(!winner(s.board)&&!legalMoves(s.board,s.turn).length){
      s.pass=s.turn;
      s.turn=3-s.turn;
    }
    return s;
  }
  function valid(r){
    if(!r||!Array.isArray(r.board)||r.board.length!==64||!r.board.every(n=>[0,1,2].includes(n))||r.board.filter(Boolean).length<4||![27,28,35,36].every(i=>r.board[i])||![1,2].includes(r.turn)||!['computer','local'].includes(r.mode)||!recordsValid(r.records))return null;
    const s={
      board:r.board.slice(),turn:r.turn,mode:r.mode,records:{
        computer:r.records.computer.slice(),local:r.records.local.slice()
      },recorded:!!winner(r.board)&&r.recorded===true,pass:[1,2].includes(r.pass)?r.pass:0
    };
    if(!winner(s.board)&&!legalMoves(s.board,s.turn).length)normalize(s);
    return s;
  }
  function apply(b,i,p){
    const flips=flipsFor(b,i,p);
    if(!flips.length)return false;
    b[i]=p;
    for(const n of flips)b[n]=p;
    return true;
  }
  function move(s,i){
    if(winner(s.board)||!apply(s.board,i,s.turn))return false;
    s.turn=3-s.turn;
    s.recorded=false;
    normalize(s);
    return true;
  }
  function evaluate(b){
    const w=winner(b),[human,computer]=counts(b);
    if(w)return w===2?100000+computer:w===1?-100000-human:0;
    let score=(computer-human)*(human+computer>48?3:.3);
    score+=(legalMoves(b,2).length-legalMoves(b,1).length)*8;
    for(const i of CORNERS){
      if(b[i])score+=b[i]===2?140:-140;
      else{
        const r=Math.floor(i/8),c=i%8;
        for(const [dr,dc] of [[0,c===0?1:-1],[r===0?1:-1,0],[r===0?1:-1,c===0?1:-1]]){
          const v=b[(r+dr)*8+c+dc];
          if(v)score+=v===2?-45:45;
        }
      }
    }
    for(let i=0;i<64;i++)if(b[i]&&(i<8||i>=56||i%8===0||i%8===7))score+=b[i]===2?5:-5;
    return score;
  }
  // Search is deliberately bounded so the computer stays responsive on small devices.
  function computerMove(b){
    const moves=legalMoves(b,2);
    if(!moves.length)return -1;
    let choice=moves[0].index,best=-Infinity;
    for(const m of moves){
      const t=b.slice();
      apply(t,m.index,2);
      const replies=legalMoves(t,1);
      let score;
      if(!replies.length)score=evaluate(t)+10;
      else{
        score=Infinity;
        for(const h of replies){
          const next=t.slice();
          apply(next,h.index,1);
          score=Math.min(score,evaluate(next));
        }
      }
      if(score>best){
        best=score;
        choice=m.index;
      }
    }
    return choice;
  }
  if(typeof module!=='undefined'&&module.exports){
    module.exports={
      fresh,flipsFor,legalMoves,counts,winner,normalize,valid,apply,move,computerMove,KEY
    };
    if(typeof document==='undefined')return;
  }
  // The UI also restores a pending computer turn after a reload.
  let state=fresh(),timer=0,focus=19,storageOK=true;
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
    const w=winner(state.board),own=state.mode==='computer',moves=legalMoves(state.board,state.turn),[lime,purple]=counts(state.board);
    $('#mode').value=state.mode;
    $('#lime-count').textContent=lime;
    $('#purple-count').textContent=purple;
    $('#record').textContent=state.records[state.mode][0]+' – '+state.records[state.mode][1];
    $('#record').title=state.records[state.mode][2]+' drawn rounds';
    $('#p1-label').textContent=own?'YOU / LIME':'PLAYER 1 / LIME';
    $('#p2-label').textContent=own?'COMPUTER / PURPLE':'PLAYER 2 / PURPLE';
    $('#turn-dot').classList.toggle('purple',state.turn===2);
    let text=w===3?'Draw! Both colors finish with '+lime+' discs.':w?(w===1?(own?'You win! ':'Lime wins! '):(own?'Computer wins. ':'Purple wins! '))+lime+' lime · '+purple+' purple.':own?(state.turn===1?'Your turn. Choose a bright dot.':'Computer is thinking…'):(state.turn===1?'Lime':'Purple')+'’s turn. Choose a bright dot.';
    if(!w&&state.pass)text=(state.pass===1?'Lime':'Purple')+' has no legal move and passes. '+text;
    $('#status').textContent=text;
    const active=document.activeElement&&document.activeElement.dataset.cell;
    board.replaceChildren();
    for(let i=0;i<64;i++){
      const v=state.board[i],legal=moves.some(m=>m.index===i),el=document.createElement('button');
      el.type='button';
      el.className='cell '+(v===1?'lime':v===2?'purple':legal?'legal':'');
      el.dataset.cell=i;
      el.tabIndex=i===focus?0:-1;
      el.setAttribute('aria-label','Row '+(Math.floor(i/8)+1)+', column '+(i%8+1)+': '+(v?(v===1?'lime disc':'purple disc'):legal?'legal move':'empty'));
      el.setAttribute('aria-disabled',String(!legal||!!w||(own&&state.turn===2)));
      const disc=document.createElement('span');
      disc.setAttribute('aria-hidden','true');
      el.append(disc);
      board.append(el);
    }
    if(active!==undefined)board.children[focus]?.focus();
    save();
  }
  function schedule(){
    clearTimeout(timer);
    if(!winner(state.board)&&state.mode==='computer'&&state.turn===2)timer=setTimeout(()=>{
      const i=computerMove(state.board);if(i>=0)move(state,i);else normalize(state);render();schedule();
    },350);
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
    const i=Number(e.target.closest('[data-cell]')?.dataset.cell);if(!Number.isInteger(i))return;let next=i;if(e.key==='ArrowRight')next=(i+1)%64;else if(e.key==='ArrowLeft')next=(i+63)%64;else if(e.key==='ArrowDown')next=(i+8)%64;else if(e.key==='ArrowUp')next=(i+56)%64;else if(e.key==='Home')next=0;else if(e.key==='End')next=63;else return;e.preventDefault();focus=next;for(const el of board.children)el.tabIndex=Number(el.dataset.cell)===focus?0:-1;board.children[focus].focus();
  });
  function restart(mode){
    clearTimeout(timer);
    state=fresh(mode,state.records);
    focus=19;
    render();
    schedule();
  }
  $('#restart').addEventListener('click',()=>restart(state.mode));
  $('#mode').addEventListener('change',e=>restart(e.target.value));
  render();
  schedule();
})();
