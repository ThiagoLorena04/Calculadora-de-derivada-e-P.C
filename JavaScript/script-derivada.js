/* ===================== helpers ===================== */
const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

function norm(str) {
  return str
    .replace(/^[fy]\(x\)\s*=\s*|^y\s*=\s*/i, '')
    .replace(/sen/gi, 'sin')
    .replace(/tg/gi, 'tan')
    .replace(/√\s*\(?([^)]+)\)?/g, 'sqrt($1)') 
    .replace(/\b(sin|cos|tan)\s*\(\s*([^)]*?)\s*\)/gi, (m, f, a) => `${f.toLowerCase()}(${a})`)
    .replace(/\b(sin|cos|tan)\s+([a-zA-Z]\w*)\b/gi, (m, f, a) => `${f.toLowerCase()}(${a})`)
    .replace(/\b(sin|cos|tan)([a-zA-Z]\w*)\b/gi, (m, f, a) => `${f.toLowerCase()}(${a})`)
    .replace(/(\d)(?=(sin|cos|tan)\()/gi, '$1*')
    .split('').map(c => SUP[c] ? '^' + SUP[c] : c).join('');
}

const fmt = node => node
  .toString({ parenthesis: 'auto' })
  .replace(/\s*\*\s*/g, '')
  .replace(/sqrt\(([^)]+)\)/g, '√$1');


/* Pontos críticos confiáveis: intervalo fixo [-3,3] */
function roots(node, min = -3, max = 3, step = 0.1, eps = 1e-6) {
  const f = node.compile();
  const R = [];
  const seen = v => R.some(u => Math.abs(u - v) < 1e-3);

  let x0 = min;
  let f0 = f.evaluate({ x: x0 });

  for (let x1 = min + step; x1 <= max + eps; x1 += step) {
    const f1 = f.evaluate({ x: x1 });

    if (Math.abs(f0) < eps && !seen(x0)) R.push(+x0.toFixed(6));
    if (f0 * f1 < 0) {
      let a = x0, b = x1, fa = f0, fb = f1;
      for (let i = 0; i < 35; i++) {
        const m = (a + b) / 2;
        const fm = f.evaluate({ x: m });
        if (fa * fm <= 0) {
          b = m;
          fb = fm;
        } else {
          a = m;
          fa = fm;
        }
      }
      const r = +((a + b) / 2).toFixed(6);
      if (!seen(r)) R.push(r);
    }
    x0 = x1;
    f0 = f1;
  }
  return R.sort((a, b) => a - b);
}

/* =============== cálculo principal ================== */
function calcularDerivada() {
  const raw = document.getElementById('funcao').value.trim();
  if (!raw) return;

  try {
    const expr = norm(raw);
    const d1Node = math.simplify(math.derivative(expr, 'x'));
    const d2Node = math.simplify(math.derivative(d1Node, 'x'));

    document.getElementById('derivada').textContent = fmt(d1Node);
    document.getElementById('segunda').textContent = fmt(d2Node);

    const pc = roots(d1Node); // usando intervalo [-3,3]
    document.getElementById('pontos').textContent = pc.length ? pc.map(v => v.toFixed(2)).join(', ') : 'Nenhum ponto crítico';

    const d2f = d2Node.compile();
    const mins = [], maxs = [], infl = [];
    const E = 1e-5;
    pc.forEach(p => {
      const v = d2f.evaluate({ x: p });
      if (v > E) mins.push(p);
      else if (v < -E) maxs.push(p);
      else infl.push(p);
    });

    const out = [];
    if (maxs.length) out.push(`máx: ${maxs.map(x => x.toFixed(2)).join(', ')}`);
    if (mins.length) out.push(`mín: ${mins.map(x => x.toFixed(2)).join(', ')}`);
    if (infl.length) out.push(`infl: ${infl.map(x => x.toFixed(2)).join(', ')}`);

    document.getElementById('classificacao').textContent = out.join(' | ') || 'Sem classificação';

    plotarGrafico(expr, fmt(d1Node));

  } catch (err) {
    ['derivada', 'segunda', 'pontos', 'classificacao'].forEach(id => document.getElementById(id).textContent = '');
    document.getElementById('derivada').textContent = 'Erro: verifique a função';
    console.error(err);
  }
}

/* ================= gráfico ========================= */
let chart;
function plotarGrafico(fExpr, dExpr) {
  const X = Array.from({ length: 400 }, (_, i) => i / 20 - 10);
  const Yf = X.map(x => {
    try { return math.evaluate(fExpr, { x }); } catch { return NaN; }
  });
  const Yd = X.map(x => {
    try { return math.evaluate(dExpr, { x }); } catch { return NaN; }
  });

  const ctx = document.getElementById('grafico').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: X,
      datasets: [
        {
          label: 'f(x)',
          data: Yf,
          borderColor: '#1740B3',
          borderWidth: 2,
          backgroundColor: 'transparent',
          pointRadius: 0
        },
        {
          label: "f'(x)",
          data: Yd,
          borderColor: '#1982ff',
          borderWidth: 2,
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderDash: [6, 3]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(255,255,255,.05)' } },
        y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(255,255,255,.05)' } }
      }
    }
  });
}

/* =============== listener ========================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.btn').addEventListener('click', calcularDerivada);
});
