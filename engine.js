(function (root) {
  const FLEET = [{ name: 'Porta-aviões', size: 5 }, { name: 'Encouraçado', size: 4 }, { name: 'Cruzador', size: 3 }, { name: 'Submarino', size: 3 }, { name: 'Contratorpedeiro', size: 2 }];
  const board = () => ({ ships: [], shots: new Set() });
  const cells = (r, c, size, v) => Array.from({length:size}, (_,i) => [r+(v?i:0), c+(v?0:i)]);
  function canPlace(b,r,c,size,v) { return cells(r,c,size,v).every(([y,x]) => y>=0 && x>=0 && y<10 && x<10 && !b.ships.some(s=>s.cells.includes(y*10+x))); }
  function place(b,r,c,spec,v) { if(!canPlace(b,r,c,spec.size,v)) return false; b.ships.push({...spec,cells:cells(r,c,spec.size,v).map(([y,x])=>y*10+x)}); return true; }
  function randomBoard() { const b=board(); for(const spec of FLEET) { const options=[]; for(let r=0;r<10;r++) for(let c=0;c<10;c++) for(const v of [false,true]) if(canPlace(b,r,c,spec.size,v)) options.push([r,c,v]); const [r,c,v]=options[Math.floor(Math.random()*options.length)]; place(b,r,c,spec,v); } return b; }
  const sunk = (b,s) => s.cells.every(c=>b.shots.has(c));
  function attack(b,c) { if(!Number.isInteger(c)||c<0||c>=100||b.shots.has(c)) return null; b.shots.add(c); const s=b.ships.find(s=>s.cells.includes(c)); return {hit:!!s,sunk:s&&sunk(b,s)?s.name:null,won:b.ships.length===5&&b.ships.every(s=>sunk(b,s))}; }
  const api={FLEET,board,cells,canPlace,place,randomBoard,sunk,attack};
  if(typeof module!=='undefined') module.exports=api; else root.Naval=api;
})(globalThis);
