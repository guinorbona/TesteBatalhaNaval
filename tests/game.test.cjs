const {test}=require('node:test');
const assert=require('node:assert/strict');
const N=require('../engine.js');
test('posicionamento respeita limites e impede sobreposição',()=>{
 const b=N.board(); assert.equal(N.place(b,0,6,N.FLEET[0],false),false);
 assert.equal(N.place(b,0,0,N.FLEET[0],false),true);
 assert.equal(N.place(b,0,2,N.FLEET[1],true),false);
 assert.equal(N.place(b,7,9,N.FLEET[2],true),true);
 assert.equal(N.place(b,-1,0,N.FLEET[1],false),false);
});
test('500 frotas aleatórias são completas e válidas',()=>{
 for(let i=0;i<500;i++){const b=N.randomBoard();const cells=b.ships.flatMap(s=>s.cells);assert.equal(b.ships.length,5);assert.equal(cells.length,17);assert.equal(new Set(cells).size,17);assert.ok(cells.every(c=>c>=0&&c<100));}
});
test('ataques distinguem água, acerto, repetição, afundamento e vitória',()=>{
 const b=N.randomBoard(); const occupied=b.ships.flatMap(s=>s.cells);const water=Array.from({length:100},(_,i)=>i).find(c=>!occupied.includes(c));
 assert.equal(N.attack(b,water).hit,false);assert.equal(N.attack(b,water),null);assert.equal(N.attack(b,100),null);
 const first=b.ships[0]; for(const c of first.cells.slice(0,-1)){const r=N.attack(b,c);assert.equal(r.hit,true);assert.equal(r.sunk,null);assert.equal(r.won,false);}
 assert.equal(N.attack(b,first.cells.at(-1)).sunk,first.name);
 let last; for(const s of b.ships.slice(1))for(const c of s.cells)last=N.attack(b,c);assert.equal(last.won,true);
});
