const test=require('node:test');
const assert=require('node:assert/strict');
const {expressions,frames,pickExpression,runningFrame}=require('../js/character.js');
test('all three expressions can be selected independently',()=>{
 assert.equal(expressions[pickExpression(()=>0.1)],'happy');
 assert.equal(expressions[pickExpression(()=>0.5)],'violet');
 assert.equal(expressions[pickExpression(()=>0.9)],'cat');
});
test('running cycles all four poses, while idle and reduced motion hold a pose',()=>{
 assert.deepEqual([0,.12,.24,.36].map(t=>runningFrame(t,true,true)),[0,1,2,3]);
 assert.equal(runningFrame(5,false,true),0);
 assert.equal(runningFrame(5,true,true,true),0);
 assert.equal(runningFrame(5,true,false),1);
});
test('every sprite frame stays inside its expression row and atlas',()=>{
 for(let row=0;row<3;row++) for(let col=0;col<4;col++){
  const [x,y,w,h]=frames[row][col];
  assert.ok(x>=col*192&&x+w<=(col+1)*192);
  assert.ok(y>=row*256&&y+h<=(row+1)*256);
  assert.ok(w>150&&h>220);
 }
});
