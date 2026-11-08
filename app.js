(()=>{const $=id=>document.getElementById(id),canvas=$("plan"),ctx=canvas.getContext("2d");let projects=JSON.parse(localStorage.getItem("msm_v2")||"[]"),project=null,fi=0,tool="select",walls=[],objects=[],draft=null,pending=null,undo=[],scale=1,offset={x:0,y:0},selected=null,history=[];const save=()=>{localStorage.setItem("msm_v2",JSON.stringify(projects))};const floor=()=>project.floors[fi];function render(){ $("projects").innerHTML="";projects.forEach(p=>{let d=document.createElement("div");d.className="card";d.innerHTML=`<b>${esc(p.name)}</b><p class=muted>${esc(p.client||"")}</p><small>${p.floors.length} floor(s)</small>`;d.onclick=()=>open(p.id);$("projects").append(d)})}function esc(s){return String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}function open(id){project=projects.find(p=>p.id===id);fi=0;$("home").hidden=true;$("work").hidden=false;$("title").textContent=project.name;tabs();resize()}function tabs(){$("floorTabs").innerHTML="";project.floors.forEach((f,i)=>{let b=document.createElement("button");b.textContent=f.name;b.className=i===fi?"primary":"";b.onclick=()=>{fi=i;tabs();draw()};$("floorTabs").append(b)})}function resize(){let r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw()}function parse(s){
 const value=String(s??"").trim()
   .replace(/[′’]/g,"'")
   .replace(/[″“”]/g,'"')
   .replace(/\s+/g," ");
 if(!value) return NaN;

 function readNumber(token){
   if(!token) return 0;
   const t=token.trim();
   let m=t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
   if(!m) m=t.match(/^(\d+)-(\d+)\/(\d+)$/);
   if(m){const den=Number(m[3]);return den ? Number(m[1])+Number(m[2])/den : NaN;}
   m=t.match(/^(\d+)\/(\d+)$/);
   if(m){const den=Number(m[2]);return den ? Number(m[1])/den : NaN;}
   return /^\d+(?:\.\d+)?$/.test(t) ? Number(t) : NaN;
 }

 let feet=0, inches=0, hasFeet=false, hasInches=false, rest=value;
 const footMatch=rest.match(/^(\d+(?:\.\d+)?)\s*'/);
 if(footMatch){
   feet=Number(footMatch[1]); hasFeet=true;
   rest=rest.slice(footMatch[0].length).trim();
 }
 if(rest.endsWith('"')){
   rest=rest.slice(0,-1).trim();
   hasInches=true;
 } else if(!hasFeet) {
   // A bare numeric value is interpreted as feet, matching the app's feet-first convention.
   if(/^\d+(?:\.\d+)?$/.test(rest)){feet=Number(rest);hasFeet=true;rest="";}
 }
 if(rest){
   if(!hasFeet && !hasInches) return NaN;
   inches=readNumber(rest); hasInches=true;
 } else if(hasInches) {
   inches=0;
 }
 if(!hasFeet && !hasInches) return NaN;
 if(!Number.isFinite(feet)||!Number.isFinite(inches)||feet<0||inches<0||inches>=12) return NaN;
 return (feet*12+inches)*25.4;
}function fmt(mm){let n=mm/25.4,f=Math.floor(n/12),i=Math.round((n-f*12)*16)/16;if(i>=12){f++;i=0}return f+"' "+i+'"'}function draw(){if(!$("work")||$("work").hidden)return;let w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(offset.x,offset.y);ctx.scale(scale,scale);ctx.strokeStyle="#e9edf2";ctx.lineWidth=1/scale;
let left=(-offset.x)/scale,top=(-offset.y)/scale,right=(w-offset.x)/scale,bottom=(h-offset.y)/scale;
let step=25,x0=Math.floor(left/step)*step,y0=Math.floor(top/step)*step;
for(let x=x0;x<=right+step;x+=step){ctx.beginPath();ctx.moveTo(x,top-step);ctx.lineTo(x,bottom+step);ctx.stroke()}
for(let y=y0;y<=bottom+step;y+=step){ctx.beginPath();ctx.moveTo(left-step,y);ctx.lineTo(right+step,y);ctx.stroke()}floor().walls.forEach((a,wi)=>{ctx.strokeStyle=(selected&&selected.kind==="wall"&&selected.index===wi)?"#e07a22":"#202938";ctx.lineWidth=2/scale;ctx.beginPath();ctx.moveTo(a.a.x,a.a.y);ctx.lineTo(a.b.x,a.b.y);ctx.stroke();ctx.fillStyle="#303d50";ctx.font=`${12/scale}px system-ui`;ctx.fillText(fmt(a.len),(a.a.x+a.b.x)/2,(a.a.y+a.b.y)/2-7/scale)});floor().objects.forEach((o,oi)=>{ctx.save();ctx.strokeStyle=(selected&&selected.kind==="object"&&selected.index===oi)?"#e07a22":"#263548";ctx.translate(o.x,o.y);ctx.rotate(o.angle||0);ctx.strokeStyle="#263548";ctx.lineWidth=2/scale;if(o.type==="door"){let hinge=o.hinge==="right"?o.w/2:-o.w/2;ctx.beginPath();ctx.moveTo(hinge,0);ctx.lineTo(hinge,o.swing==="out"?-o.w:o.w);ctx.stroke();ctx.beginPath();ctx.arc(hinge,0,o.w,o.swing==="out"?-Math.PI/2:0,o.swing==="out"?0:Math.PI/2);ctx.stroke()}else if(o.type==="window"){ctx.beginPath();ctx.moveTo(-o.w/2,-3);ctx.lineTo(o.w/2,-3);ctx.moveTo(-o.w/2,3);ctx.lineTo(o.w/2,3);for(let i=1;i<o.panels;i++){let x=-o.w/2+o.w*i/o.panels;ctx.moveTo(x,-5);ctx.lineTo(x,5)}ctx.stroke()}else if(o.type==="stair"){ctx.strokeRect(-o.w/2,-o.l/2,o.w,o.l);for(let y=-o.l/2+15;y<o.l/2;y+=15){ctx.beginPath();ctx.moveTo(-o.w/2,y);ctx.lineTo(o.w/2,y);ctx.stroke()}}else{ctx.fillStyle="#263548";ctx.fillText(o.text,0,0)}ctx.restore()});if(draft){ctx.strokeStyle="#2676c8";ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(draft.a.x,draft.a.y);ctx.lineTo(draft.b.x,draft.b.y);ctx.stroke();ctx.setLineDash([])}ctx.restore();$("summary").textContent="Rooms: 0 · Total area: 0.00 sqft (room detection in next build step)"}function screenPoint(e){let r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function point(e){let p=screenPoint(e);return{x:(p.x-offset.x)/scale,y:(p.y-offset.y)/scale}}
function clampScale(v){return Math.max(.2,Math.min(5,v))}
function zoomAt(factor,cx=canvas.clientWidth/2,cy=canvas.clientHeight/2){
let old=scale,next=clampScale(scale*factor);if(next===old)return;
let wx=(cx-offset.x)/old,wy=(cy-offset.y)/old;scale=next;offset.x=cx-wx*scale;offset.y=cy-wy*scale;draw();
}
function resetView(){scale=1;offset={x:0,y:0};draw()}function nearest(p){let best=null,dist=20;floor().walls.forEach(w=>{let dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,t=Math.max(0,Math.min(1,((p.x-w.a.x)*dx+(p.y-w.a.y)*dy)/(dx*dx+dy*dy||1))),q={x:w.a.x+t*dx,y:w.a.y+t*dy},d=Math.hypot(p.x-q.x,p.y-q.y);if(d<dist){dist=d;best={x:q.x,y:q.y,angle:Math.atan2(dy,dx),wallIndex:floor().walls.indexOf(w),t}}});return best}function setTool(t){tool=t;selected=null;document.querySelectorAll("nav [data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));draw()}let editingObjectIndex=null;
function showObjectEditor(index){
 const o=floor().objects[index];if(!o||!["door","window"].includes(o.type)){alert("Pilih pintu atau tingkap untuk edit.");return;}
 editingObjectIndex=index;$("objectDialogTitle").textContent=o.type==="door"?"Door properties":"Window properties";
 $("objectWidth").value=fmt(o.w);$("objectPosition").value=fmt((o.t||0)*(floor().walls[o.wallIndex]?.len||0));
 $("hingeRow").hidden=o.type!=="door";$("swingRow").hidden=o.type!=="door";$("panelRow").hidden=o.type!=="window";
 $("hinge").value=o.hinge||"left";$("swing").value=o.swing||"in";$("panels").value=String(o.panels||2);$("objectDialog").showModal();
}
function placeObjectOnWall(type,n){
 snapshot();floor().objects.push({type,x:n.x,y:n.y,angle:n.angle,w:type==="door"?914.4:1219.2,panels:2,wallIndex:n.wallIndex,t:n.t,hinge:"left",swing:"in"});
 save();draw();showObjectEditor(floor().objects.length-1);
}
let start=null;
const activePointers=new Map();let gestureBase=null;
function midpoint(pts){return{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}}
function distance(pts){return Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)}
function hitTest(p){
 let best=null,limit=18/scale;
 floor().objects.forEach((o,i)=>{
  let d=Math.hypot(p.x-o.x,p.y-o.y);
  if(d<limit){limit=d;best={kind:"object",index:i}}
 });
 floor().walls.forEach((w,i)=>{
  let dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,t=Math.max(0,Math.min(1,((p.x-w.a.x)*dx+(p.y-w.a.y)*dy)/(dx*dx+dy*dy||1)));
  let d=Math.hypot(p.x-(w.a.x+t*dx),p.y-(w.a.y+t*dy));
  if(d<limit){limit=d;best={kind:"wall",index:i}}
 });
 return best;
}
function snapshot(){
 history.push(JSON.stringify({walls:floor().walls,objects:floor().objects}));
 if(history.length>50)history.shift();
}
function doUndo(){
 if(!history.length){alert("Tiada tindakan untuk Undo.");return;}
 let s=JSON.parse(history.pop());floor().walls=s.walls;floor().objects=s.objects;selected=null;save();draw();
}
function doDelete(){
 if(!selected){alert("Pilih dahulu dinding atau objek yang hendak dipadam.");return;}
 snapshot();
 if(selected.kind==="wall")floor().walls.splice(selected.index,1);
 else floor().objects.splice(selected.index,1);
 selected=null;save();draw();
}
canvas.addEventListener("pointerdown",e=>{
 canvas.setPointerCapture(e.pointerId);
 activePointers.set(e.pointerId,screenPoint(e));
 if(activePointers.size===2){
  // A two-finger gesture always navigates the canvas: pinch to zoom, drag to pan.
  start=null;draft=null;
  let pts=[...activePointers.values()],mid=midpoint(pts);
  gestureBase={distance:distance(pts),scale,world:{x:(mid.x-offset.x)/scale,y:(mid.y-offset.y)/scale}};
  draw();return;
 }
 if(activePointers.size>2)return;
 start=point(e);
 if(tool==="wall")draft={a:start,b:start};
 draw();
});
canvas.addEventListener("pointermove",e=>{
 if(activePointers.has(e.pointerId))activePointers.set(e.pointerId,screenPoint(e));
 if(activePointers.size>=2&&gestureBase){
  let pts=[...activePointers.values()].slice(0,2),mid=midpoint(pts),d=distance(pts);
  scale=clampScale(gestureBase.scale*(d/(gestureBase.distance||1)));
  // Keep the world point under the moving two-finger midpoint anchored.
  offset.x=mid.x-gestureBase.world.x*scale;
  offset.y=mid.y-gestureBase.world.y*scale;
  draw();return;
 }
 if(activePointers.size!==1||!start||!draft)return;
 let p=point(e),dx=p.x-draft.a.x,dy=p.y-draft.a.y;
 if($("snap").checked){if(Math.abs(dx)>Math.abs(dy))dy=0;else dx=0}
 draft.b={x:draft.a.x+dx,y:draft.a.y+dy};draw();
});
function finishPointer(e){
 let wasGesture=activePointers.size>=2;
 activePointers.delete(e.pointerId);
 if(activePointers.size<2)gestureBase=null;
 if(wasGesture){start=null;draft=null;draw();return;}
 if(!start)return;
 let p=point(e);
 if(tool==="select"){
  selected=hitTest(p);draw();
 }else if(tool==="wall"&&draft){
  let dx=draft.b.x-draft.a.x,dy=draft.b.y-draft.a.y;
  if(Math.hypot(dx,dy)>8){pending={a:draft.a,b:draft.b};$("dim").value="";$("dimDialog").showModal()}
  draft=null;
 }else if(["door","window"].includes(tool)){
  let n=nearest(p);if(n){placeObjectOnWall(tool,n);}
 }else if(tool==="stair"){
  snapshot();floor().objects.push({type:"stair",x:p.x,y:p.y,w:914,l:2400});save();draw();
 }else if(tool==="text"){
  let text=prompt("Text / room label");if(text){snapshot();floor().objects.push({type:"text",x:p.x,y:p.y,text});save();draw();}
 }
 start=null;draw();
}
canvas.addEventListener("pointerup",finishPointer);
canvas.addEventListener("pointercancel",finishPointer);
canvas.addEventListener("wheel",e=>{e.preventDefault();let p=screenPoint(e);zoomAt(e.deltaY<0?1.12:1/1.12,p.x,p.y)},{passive:false});
$("zoomReset").onclick=resetView;$("editObject").onclick=()=>{if(!selected||selected.kind!=="object")return alert("Pilih pintu atau tingkap dahulu.");showObjectEditor(selected.index)};
$("objectCancel").onclick=()=>$("objectDialog").close();
$("objectForm").addEventListener("submit",e=>{e.preventDefault();let o=floor().objects[editingObjectIndex];if(!o)return;let w=parse($("objectWidth").value);if(!Number.isFinite(w)||w<=0)return alert("Masukkan ukuran seperti 3' 0\".");let pos=$("objectPosition").value.trim()?parse($("objectPosition").value):NaN;if($("objectPosition").value.trim()&&!Number.isFinite(pos))return alert("Semak posisi dari hujung dinding.");snapshot();o.w=w;if(o.type==="door"){o.hinge=$("hinge").value;o.swing=$("swing").value}else{o.panels=+$("panels").value}let wall=floor().walls[o.wallIndex];if(wall&&Number.isFinite(pos)){let t=Math.max(0,Math.min(1,pos/(wall.len||1)));o.t=t;let dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y;o.x=wall.a.x+dx*t;o.y=wall.a.y+dy*t;o.angle=Math.atan2(dy,dx)}save();$("objectDialog").close();draw()});

$("delete").onclick=doDelete;
$("undo").onclick=doUndo;
$("dimForm").addEventListener("submit",e=>{e.preventDefault();let len=parse($("dim").value);if(!Number.isFinite(len)||len<=0)return alert("Use format 12' 6\"");let dx=pending.b.x-pending.a.x,dy=pending.b.y-pending.a.y,n=Math.hypot(dx,dy);snapshot();floor().walls.push({a:pending.a,b:{x:pending.a.x+dx/n*len,y:pending.a.y+dy/n*len},len});pending=null;$("dimDialog").close();save();draw()});$("dimCancel").onclick=()=>{pending=null;draft=null;draw()};$("new").onclick=()=>$("projectDialog").showModal();$("cancel").onclick=()=>$("projectDialog").close();$("projectForm").addEventListener("submit",e=>{e.preventDefault();let p={id:Math.random().toString(36).slice(2),name:$("pname").value,client:$("client").value,address:$("address").value,floors:[{name:"Ground Floor",walls:[],objects:[]}]};projects.push(p);save();$("projectDialog").close();open(p.id);render()});$("back").onclick=()=>{$("work").hidden=true;$("home").hidden=false;render()};$("addFloor").onclick=()=>{let name=prompt("Floor name","First Floor");if(name){project.floors.push({name,walls:[],objects:[]});fi=project.floors.length-1;save();tabs();draw()}};document.querySelectorAll("nav [data-tool]").forEach(b=>b.onclick=()=>setTool(b.dataset.tool));$("export").onclick=()=>{let a=document.createElement("a");a.download=project.name+"-"+floor().name+".png";a.href=canvas.toDataURL("image/png");a.click()};window.addEventListener("resize",()=>{if(!$("work").hidden)resize()});render();})();