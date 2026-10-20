(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MinesCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const levels = {beginner:{rows:9,cols:9,mines:10}, intermediate:{rows:16,cols:16,mines:40}};
  function fresh(level = 'beginner') {
    if (!levels[level]) level = 'beginner';
    const {rows,cols,mines}=levels[level],n=rows*cols;
    return {version:1,level,rows,cols,mines,board:null,revealed:Array(n).fill(false),flags:Array(n).fill(false),status:'ready',elapsed:0,triggered:null};
  }
  function neighbors(state,index) {
    const row=Math.floor(index/state.cols),col=index%state.cols,result=[];
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=row+dr,c=col+dc;if((dr||dc)&&r>=0&&c>=0&&r<state.rows&&c<state.cols)result.push(r*state.cols+c);}
    return result;
  }
  function plant(state,first,random=Math.random) {
    const safe=new Set([first,...neighbors(state,first)]),options=[];
    for(let i=0;i<state.rows*state.cols;i++)if(!safe.has(i))options.push(i);
    for(let i=options.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
    state.board=Array(state.rows*state.cols).fill(0);
    options.slice(0,state.mines).forEach(i=>state.board[i]=-1);
    state.board.forEach((n,i)=>{if(n!==-1)state.board[i]=neighbors(state,i).filter(j=>state.board[j]===-1).length;});
  }
  function checkWin(state) {
    if(state.status==='playing'&&state.revealed.filter(Boolean).length===state.rows*state.cols-state.mines){state.status='won';state.board.forEach((n,i)=>{if(n===-1)state.flags[i]=true;});}
  }
  function reveal(state,index,random) {
    if(!Number.isInteger(index)||index<0||index>=state.rows*state.cols||state.flags[index]||state.revealed[index]||state.status==='won'||state.status==='lost')return false;
    if(state.status==='ready'){plant(state,index,random);state.status='playing';}
    if(state.board[index]===-1){state.revealed[index]=true;state.triggered=index;state.status='lost';return true;}
    const stack=[index];
    while(stack.length){const i=stack.pop();if(state.revealed[i]||state.flags[i])continue;state.revealed[i]=true;if(state.board[i]===0)neighbors(state,i).forEach(j=>{if(!state.revealed[j]&&!state.flags[j]&&state.board[j]!==-1)stack.push(j);});}
    checkWin(state);return true;
  }
  function flag(state,index) {
    if(!Number.isInteger(index)||index<0||index>=state.rows*state.cols||state.revealed[index]||!['ready','playing'].includes(state.status))return false;
    if(!state.flags[index]&&state.flags.filter(Boolean).length>=state.mines)return false;
    state.flags[index]=!state.flags[index];return true;
  }
  function chord(state,index) {
    if(state.status!=='playing'||!state.revealed[index]||state.board[index]<=0)return false;
    const around=neighbors(state,index);
    if(around.filter(i=>state.flags[i]).length!==state.board[index])return false;
    let changed=false;
    for(const i of around){if(state.status!=='playing')break;if(reveal(state,i))changed=true;}
    return changed;
  }
  function restore(value) {
    if(!value||value.version!==1||!levels[value.level])return null;
    const l=levels[value.level],n=l.rows*l.cols;
    if(value.rows!==l.rows||value.cols!==l.cols||value.mines!==l.mines||!['ready','playing'].includes(value.status)||!Number.isFinite(value.elapsed)||value.elapsed<0||value.elapsed>1e9)return null;
    const bools=a=>Array.isArray(a)&&a.length===n&&a.every(v=>typeof v==='boolean');
    if(!bools(value.revealed)||!bools(value.flags)||value.flags.filter(Boolean).length>l.mines||value.revealed.some((r,i)=>r&&value.flags[i]))return null;
    if(value.status==='ready'){if(value.board!==null||value.revealed.some(Boolean))return null;}
    else {
      if(!Array.isArray(value.board)||value.board.length!==n||!value.board.every(v=>Number.isInteger(v)&&v>=-1&&v<=8)||value.board.filter(v=>v===-1).length!==l.mines||value.revealed.some((r,i)=>r&&value.board[i]===-1)||value.revealed.filter(Boolean).length>=n-l.mines)return null;
      if(value.board.some((v,i)=>v!==-1&&v!==neighbors(value,i).filter(j=>value.board[j]===-1).length))return null;
    }
    return JSON.parse(JSON.stringify(value));
  }
  return {levels,fresh,neighbors,plant,reveal,flag,chord,restore};
});
