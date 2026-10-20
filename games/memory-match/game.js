/* Original Memory Match implementation and vector symbols for Anirudh Unblocked. */
(() => {
'use strict';
const SAVE_KEY='anirudh-memory-match-v1.save',BEST_KEY='anirudh-memory-match-v1.best';
const SYMBOLS=[
 {name:'sun',color:'#d4ff58',art:'<circle cx="40" cy="40" r="13"/><path d="M40 9v8m0 46v8M9 40h8m46 0h8M18 18l6 6m32 32 6 6M18 62l6-6m32-32 6-6"/>'},
 {name:'diamond',color:'#b4a0ff',art:'<path d="m40 12 25 28-25 28-25-28Z"/><path d="m27 40 13 15 13-15-13-15Z"/>'},
 {name:'moon',color:'#81d9ff',art:'<path d="M53 15a27 27 0 1 0 12 39A28 28 0 0 1 53 15Z"/>'},
 {name:'clover',color:'#8be3b1',art:'<path d="M40 39C11 31 18 10 31 17c6 3 9 11 9 22Zm0 0c8-29 29-22 22-9-3 6-11 9-22 9Zm0 0c29 8 22 29 9 22-6-3-9-11-9-22Zm0 0c-8 29-29 22-22 9 3-6 11-9 22-9Z"/>'},
 {name:'bolt',color:'#ffce78',art:'<path d="M43 8 21 44h17l-4 28 25-40H42Z"/>'},
 {name:'heart',color:'#ff9ab0',art:'<path d="M40 65 17 42C1 23 23 8 40 27 57 8 79 23 63 42Z"/>'},
 {name:'orbit',color:'#91b4ff',art:'<circle cx="40" cy="40" r="8"/><ellipse cx="40" cy="40" rx="31" ry="12" transform="rotate(-40 40 40)"/><ellipse cx="40" cy="40" rx="31" ry="12" transform="rotate(40 40 40)"/>'},
 {name:'triangle',color:'#f6a877',art:'<path d="m40 12 29 51H11Z"/><path d="m40 30 13 23H27Z"/>'}
];
function shuffled(random=Math.random){const deck=Array.from({length:16},(_,i)=>i%8);for(let i=15;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
function newState(random){return{version:1,deck:shuffled(random),matched:[],selected:0,first:null,second:null,moves:0,elapsed:0,started:false,paused:false,won:false,recorded:false};}
function restore(raw){
 if(!raw||raw.version!==1||!Array.isArray(raw.deck)||raw.deck.length!==16||raw.deck.some(n=>!Number.isInteger(n)||n<0||n>7)||Array.from({length:8},(_,i)=>raw.deck.filter(n=>n===i).length).some(n=>n!==2))return null;
 if(!Array.isArray(raw.matched)||new Set(raw.matched).size!==raw.matched.length||raw.matched.some(n=>!Number.isInteger(n)||n<0||n>15)||raw.matched.length%2||!Number.isInteger(raw.moves)||raw.moves<raw.matched.length/2||!Number.isFinite(raw.elapsed)||raw.elapsed<0||raw.elapsed>31536000000)return null;
 for(let id=0;id<8;id++){const count=raw.matched.filter(i=>raw.deck[i]===id).length;if(count!==0&&count!==2)return null;}
 const state={...newState(()=>0.5),...raw,deck:raw.deck.slice(),matched:raw.matched.slice(),selected:Number.isInteger(raw.selected)&&raw.selected>=0&&raw.selected<16?raw.selected:0,first:null,second:null,started:!!raw.started,won:raw.matched.length===16,recorded:!!raw.recorded};
 // Unmatched cards are temporary information. Reloading safely turns them face down.
 state.paused=state.started&&!state.won;return state;
}
function reveal(state,index){
 if(state.paused||state.won||state.second!==null||state.matched.includes(index)||index===state.first||!Number.isInteger(index)||index<0||index>15)return'ignored';
 state.started=true;state.selected=index;if(state.first===null){state.first=index;return'first';}
 state.second=index;state.moves++;
 if(state.deck[state.first]===state.deck[index]){state.matched.push(state.first,index);state.first=null;state.second=null;state.won=state.matched.length===16;return state.won?'won':'match';}
 return'miss';
}
function hideMiss(state){state.first=null;state.second=null;}
function snapshot(state){return{...state,deck:state.deck.slice(),matched:state.matched.slice(),first:null,second:null};}
const Core={SAVE_KEY,BEST_KEY,SYMBOLS,shuffled,newState,restore,reveal,hideMiss,snapshot};if(typeof module!=='undefined'&&module.exports)module.exports=Core;if(typeof document==='undefined')return;
const $=s=>document.querySelector(s),board=$('#board');let state=null,best=null,pending=null,last=Date.now(),lastSavedSecond=-1;
function storageNotice(){$('#save-note').textContent='Saving is unavailable. Keep this tab open to retain progress.';$('#save-note').classList.add('save-warning');}
try{const b=JSON.parse(localStorage.getItem(BEST_KEY)||'null');if(b&&Number.isInteger(b.moves)&&b.moves>=8&&Number.isFinite(b.elapsed)&&b.elapsed>=0)best=b;state=restore(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));}catch(_){storageNotice();}
const restored=!!state;state=state||newState();const cells=[];
function time(ms){const seconds=Math.floor(ms/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function message(text){$('#status').textContent=text;}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot(state)));}catch(_){storageNotice();}}
function record(){if(state.won&&!state.recorded){state.recorded=true;if(!best||state.moves<best.moves||state.moves===best.moves&&state.elapsed<best.elapsed){best={moves:state.moves,elapsed:state.elapsed};try{localStorage.setItem(BEST_KEY,JSON.stringify(best));}catch(_){storageNotice();}}save();}}
function render(){cells.forEach((cell,i)=>{const match=state.matched.includes(i),revealed=match||state.first===i||state.second===i,symbol=SYMBOLS[state.deck[i]];cell.className='card'+(revealed?' revealed':'')+(match?' matched':'');cell.tabIndex=i===state.selected?0:-1;cell.style.setProperty('--card-color',symbol.color);cell.innerHTML=revealed?`<svg viewBox="0 0 80 80" aria-hidden="true">${symbol.art}</svg>`:'<span class="card-mark" aria-hidden="true">✳</span>';cell.setAttribute('aria-label',`Card ${i+1}, ${revealed?symbol.name:'face down'}${match?', matched':''}`);cell.setAttribute('aria-disabled',String(state.paused||match||state.won));cell.disabled=state.paused;});$('#moves').textContent=state.moves;$('#time').textContent=time(state.elapsed);$('#pause').textContent=state.paused?'Resume':'Pause';$('#pause').disabled=state.won;$('#overlay').hidden=!state.paused;board.setAttribute('aria-hidden',String(state.paused));$('#record').textContent=(best?'Best: '+best.moves+' moves · '+time(best.elapsed):'Find all eight pairs to set a record')+' · '+state.matched.length/2+'/8 pairs';}
function flip(index){const result=reveal(state,index);if(result==='ignored')return;record();render();save();if(result==='first')message('Find the matching shape.');if(result==='match')message('A match! '+state.matched.length/2+' of 8 pairs found.');if(result==='won')message('All eight pairs! '+state.moves+' moves in '+time(state.elapsed)+'.');if(result==='miss'){message('Different shapes. Remember their places.');pending=setTimeout(()=>{hideMiss(state);pending=null;render();save();},850);}}
for(let i=0;i<16;i++){const cell=document.createElement('button');cell.type='button';cell.className='card';cell.setAttribute('role','gridcell');cell.addEventListener('click',()=>flip(i));board.appendChild(cell);cells.push(cell);}
function tick(){const now=Date.now(),dt=Math.max(0,Math.min(now-last,2000));last=now;if(state.started&&!state.paused&&!state.won){state.elapsed+=dt;$('#time').textContent=time(state.elapsed);const sec=Math.floor(state.elapsed/1000);if(sec!==lastSavedSecond){lastSavedSecond=sec;save();}}}
function pause(){if(state.won)return;tick();if(!state.paused){if(pending!==null){clearTimeout(pending);pending=null;}hideMiss(state);}state.paused=!state.paused;last=Date.now();render();save();message(state.paused?'Paused. Unmatched cards are face down; matches and moves are saved.':'Game resumed. Find the remaining pairs.');if(!state.paused)cells[state.selected].focus();}
$('#pause').addEventListener('click',pause);$('#resume').addEventListener('click',pause);$('#new').addEventListener('click',()=>{if(pending!==null){clearTimeout(pending);pending=null;}state=newState();last=Date.now();render();save();message('Freshly shuffled. Reveal two cards to find a pair.');});
board.addEventListener('keydown',e=>{let next=state.selected,r=Math.floor(next/4),c=next%4;if(e.key==='ArrowLeft')next=r*4+Math.max(0,c-1);else if(e.key==='ArrowRight')next=r*4+Math.min(3,c+1);else if(e.key==='ArrowUp')next=Math.max(0,r-1)*4+c;else if(e.key==='ArrowDown')next=Math.min(3,r+1)*4+c;else if(e.key==='Enter'||e.key===' '){e.preventDefault();flip(state.selected);return;}else return;e.preventDefault();state.selected=next;render();save();cells[next].focus();});document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='p'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.started&&!state.paused&&!state.won){pause();}});window.addEventListener('pagehide',()=>{tick();save();});setInterval(tick,250);record();render();message(restored?(state.won?'Completed game restored. Start a new game to shuffle again.':state.paused?'Saved game restored. Resume to continue; unmatched cards start face down.':'Saved layout restored. Reveal any two cards to begin.'):'Reveal any two cards. Match all eight pairs in the fewest moves.');
})();
