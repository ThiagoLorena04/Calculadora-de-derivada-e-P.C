/* ===================== helpers ===================== */
const SUP = { "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9" };

function norm(str){
  return str

    .replace(/^[fy]\(x\)\s*=\s*|^y\s*=\s*/i,'')
    .replace(/[\u2061-\u2064]/g,'')
    .replace(/sen/gi,'sin').replace(/tg/gi,'tan')   
    .replace(/\b(sin|cos|tan)\s*\(\s*([^)]+?)\s*\)/gi, (m,f,a)=>`${f.toLowerCase()}(${a})`)
    .replace(/\b(sin|cos|tan)\s+([a-zA-Z]\w*)\b/gi,      (m,f,a)=>`${f.toLowerCase()}(${a})`)
    .replace(/\b(sin|cos|tan)([a-zA-Z]\w*)\b/gi,         (m,f,a)=>`${f.toLowerCase()}(${a})`)
    /* insere “*” que falta em casos como 2sin(x) */
    .replace(/(\d)(?=(sin|cos|tan)\()/gi,'$1*')
    /* converte superíndices (x² → x^2) */
    .split('').map(c => SUP[c] ? '^'+SUP[c] : c).join('');
}


const fmt = node =>
  node.toString({parenthesis:'auto'}).replace(/\s*\*\s*/g,'');

/* ---------- pontos críticos (sem duplicar) ---------- */
function roots(node,min=-10,max=10,step=.25,eps=1e-7){
  const f=node.compile(), R=[], seen=v=>R.some(u=>Math.abs(u-v)<1e-3);
  let x0=min, f0=f.evaluate({x:x0});
  for(let x1=min+step; x1<=max+eps; x1+=step){
    const f1=f.evaluate({x:x1});
    if(Math.abs(f0)<eps && !seen(x0)) R.push(+x0.toFixed(6));
    if(f0*f1<0){
      let a=x0,b=x1,fa=f0,fb=f1;
      for(let i=0;i<35;i++){
        const m=(a+b)/2, fm=f.evaluate({x:m});
        (fa*fm<=0)?(b=m,fb=fm):(a=m,fa=fm);
      }
      const r=+((a+b)/2).toFixed(6);
      if(!seen(r)) R.push(r);
    }
    x0=x1; f0=f1;
  }
  return R.sort((a,b)=>a-b);
}

/* =============== cálculo principal ================== */
function calcularDerivada(){
  const raw=document.getElementById('funcao').value.trim();
  if(!raw) return;

  try{
    const expr   = norm(raw);
    const d1Node = math.simplify(math.derivative(expr,'x'));
    const d2Node = math.simplify(math.derivative(d1Node,'x'));

    document.getElementById('derivada').textContent = fmt(d1Node);
    document.getElementById('segunda').textContent  = fmt(d2Node);

    const pc=roots(d1Node);
    document.getElementById(' pontos').textContent =
      pc.length ? pc.map(v=>v.toFixed(2)).join(', ') : 'Nenhum ponto crítico';

    const d2f=d2Node.compile(), E=1e-6, mins=[], maxs=[], infl=[];
    pc.forEach(p=>{
      const v=d2f.evaluate({x:p});
      if(v >  E) mins.push(p);
      else if(v < -E) maxs.push(p);
      else infl.push(p);
    });

    const out=[];
    if(maxs.length) out.push(`máx: ${maxs.map(v=>v.toFixed(2)).join(', ')}`);
    if(mins.length) out.push(`mín: ${mins.map(v=>v.toFixed(2)).join(', ')}`);
    if(infl.length) out.push(`infl: ${infl.map(v=>v.toFixed(2)).join(', ')}`);

    document.getElementById('classificacao').textContent =
      out.join(' | ') || 'Sem classificação';

    plotarGrafico(expr,fmt(d1Node));

  }catch(err){
    ['derivada','segunda','classificacao'].forEach(id=>document.getElementById(id).textContent='');
    document.getElementById(' pontos').textContent='';
    document.getElementById('derivada').textContent='Erro: verifique a função';
    console.error(err);
  }
}

/* ================= gráfico ========================= */
let chart;
function plotarGrafico(fExpr,dExpr){
  const X=[...Array(400)].map((_,i)=>i/20-10);
  const Yf=X.map(x=>math.evaluate(fExpr,{x}));
  const Yd=X.map(x=>math.evaluate(dExpr,{x}));

  const ctx=document.getElementById('grafico').getContext('2d');
  chart&&chart.destroy();
  chart=new Chart(ctx,{
    type:'line',
    data:{labels:X,datasets:[
      {label:'f(x)',  data:Yf,borderColor:'#1740B3',borderWidth:2,fill:false},
      {label:"f'(x)",data:Yd,borderColor:'#1982ff',borderWidth:2,fill:false}
    ]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      interaction:{mode:'index',intersect:false},
      scales:{
        x:{ticks:{color:'#E0E0E0'},grid:{color:'rgba(255,255,255,.1)'}},
        y:{ticks:{color:'#E0E0E0'},grid:{color:'rgba(255,255,255,.1)'}}
      }
    }
  });
}

/* =============== listener ========================== */
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelector('.btn').addEventListener('click',calcularDerivada);
});
