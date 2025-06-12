/* ===== helpers ===== */
const SUP = {"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5",
             "⁶":"6","⁷":"7","⁸":"8","⁹":"9"};
function norm(s){
  return s
    .replace(/^[fy]\(x\)\s*=|^y\s*=/i,'')
    .replace(/sen/gi,'sin').replace(/tg/gi,'tan')
    .replace(/√\s*\(?([^)]+)\)?/g,'sqrt($1)')
    .replace(/(\d)(?=(sin|cos|tan)\()/gi,'$1*')
    .split('').map(c=>SUP[c]?'^'+SUP[c]:c).join('');
}
const fmt=n=>n.toString({parenthesis:'auto'})
              .replace(/\s*\*\s*/g,'')
              .replace(/sqrt\(([^)]+)\)/g,'√$1');

/* === FUNÇÃO OFICIAL DO EXERCÍCIO === */
const BASE_RAW  = 'x^3 - 10.5*x^2 + 30*x + 20';
const BASE_NORM = norm(BASE_RAW);

/* exibe com 1 casa decimal + km/h */
const vel = n=>(+n).toFixed(1)+' km/h';

/* ===== cálculo dos pontos críticos (mesmo robusto) ===== */
function roots(node,{min=-10,max=10,grid=400,eps=1e-9,maxIter=25}={}){
  const fp=node.compile(), fp2=math.derivative(node,'x').compile();
  const out=new Set(), xs=[...Array(grid+1).keys()].map(i=>min+i*(max-min)/grid);
  const seen=v=>[...out].some(u=>Math.abs(u-v)<1e-3);
  const add=v=>out.add(+v.toFixed(4));
  for(let i=0;i<xs.length-1;i++){
    let a=xs[i], b=xs[i+1], fa=fp.evaluate({x:a}), fb=fp.evaluate({x:b});
    if(!isFinite(fa)||!isFinite(fb)||fa*fb>0) continue;
    for(let k=0;k<30;k++){
      const m=(a+b)/2, fm=fp.evaluate({x:m});
      if(Math.abs(fm)<eps){a=b=m;break;}
      fa*fm<=0?(b=m,fb=fm):(a=m,fa=fm);
    }
    let x=(a+b)/2;
    for(let k=0;k<maxIter;k++){
      const fx=fp.evaluate({x}), dfx=fp2.evaluate({x});
      if(Math.abs(dfx)<eps) break;
      const xn=x-fx/dfx;
      if(Math.abs(xn-x)<1e-8){ if(!seen(xn)) add(xn); break;}
      if(xn<min||xn>max) break;
      x=xn;
    }
  }
  return [...out].sort((a,b)=>a-b);
}

/* ===== cálculo principal ===== */
function calcularDerivada(){
  const raw=document.getElementById('funcao').value.trim();
  if(!raw) return;
  try{
    const expr=norm(raw);
    const d1=math.simplify(math.derivative(expr,'x'));
    const d2=math.simplify(math.derivative(d1,'x'));

    document.getElementById('derivada').textContent = fmt(d1);
    document.getElementById('segunda').textContent  = fmt(d2);

    const pcs=roots(d1,{min:-10,max:10});
    document.getElementById('pontos').textContent =
      pcs.length?pcs.join(', '):'Nenhum ponto crítico';

    const d2f=d2.compile(),mins=[],maxs=[],infl=[];
    pcs.forEach(p=>{
      const v=d2f.evaluate({x:p});
      if(v>1e-4) mins.push(p);
      else if(v<-1e-4) maxs.push(p);
      else infl.push(p);
    });
    const out=[];
    if(maxs.length) out.push(`máx: ${maxs.join(', ')}`);
    if(mins.length) out.push(`mín: ${mins.join(', ')}`);
    if(infl.length)out.push(`infl: ${infl.join(', ')}`);
    document.getElementById('classificacao').textContent =
      out.join(' | ') || 'Sem classificação';

    plotarGrafico(expr, fmt(d1));
  }catch(e){
    ['derivada','segunda','pontos','classificacao']
      .forEach(id=>document.getElementById(id).textContent='');
    document.getElementById('derivada').textContent='Erro';
  }
}

/* ===== avaliar f(x) ===== */
function avaliarFx(){
  const raw=document.getElementById('funcao').value.trim();
  const expr=norm(raw);
  const box=document.getElementById('fx-box');

  /* mostra/esconde bloco */
  box.style.display = expr===BASE_NORM ? 'block' : 'none';
  if(expr!==BASE_NORM){
    document.getElementById('valor-f').textContent='';
    return;
  }

  const xval=parseFloat(document.getElementById('xval').value);
  if(isNaN(xval)) return;

  try{
    const v=math.evaluate(expr,{x:xval});
    document.getElementById('valor-f').textContent = vel(v);
  }catch{
    document.getElementById('valor-f').textContent='Erro';
  }
}

/* ===== gráfico ===== */
let chart;
function plotarGrafico(fExpr,dExpr){
  const X=[...Array(400).keys()].map(i=>i/20-10);
  const Yf=X.map(x=>{try{return math.evaluate(fExpr,{x});}catch{return NaN;}});
  const Yd=X.map(x=>{try{return math.evaluate(dExpr,{x});}catch{return NaN;}});
  const ctx=document.getElementById('grafico').getContext('2d');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:'line',
    data:{labels:X,datasets:[
      {label:'f(x)',data:Yf,borderColor:'#1740B3',borderWidth:2,pointRadius:0},
      {label:"f'(x)",data:Yd,borderColor:'#1982ff',borderWidth:2,pointRadius:0,borderDash:[6,3]}
    ]},
    options:{plugins:{legend:{display:false}},
      interaction:{mode:'index',intersect:false},
      scales:{x:{grid:{color:'rgba(255,255,255,.05)'}},
              y:{grid:{color:'rgba(255,255,255,.05)'}}}}
  });
}

/* ===== listeners ===== */
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('funcao').addEventListener('input', avaliarFx);
  document.getElementById('btn-avalia').addEventListener('click', avaliarFx);
});
