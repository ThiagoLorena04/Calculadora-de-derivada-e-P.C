document.addEventListener("DOMContentLoaded", function () {
  // Mapeamento de superscript para ^ e dígitos normais
  const sup = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
  };

  // Normaliza input: remove prefixos e converte superíndices
  function normalizeInput(expr) {
    expr = expr.replace(/^[fy]\(x\)\s*=\s*/i, "");
    expr = expr.replace(/^y\s*=\s*/i, "");
    return expr
      .split("")
      .map((c) => (sup[c] != null ? "^" + sup[c] : c))
      .join("");
  }

  // Encontra raízes usando detecção de mudança de sinal + bisseção
  function findRoots(node, min = -5, max = 5, step = 0.5) {
    const roots = [];
    const f = node.compile();
    let x0 = min;
    let f0 = f.evaluate({ x: x0 });
    for (let x1 = min + step; x1 <= max; x1 += step) {
      const f1 = f.evaluate({ x: x1 });
      if (f0 === 0) roots.push(x0);
      if (f0 * f1 < 0) {
        let a = x0,
          b = x1,
          fa = f0,
          fb = f1;
        for (let i = 0; i < 20; i++) {
          const m = (a + b) / 2;
          const fm = f.evaluate({ x: m });
          if (Math.sign(fa) * Math.sign(fm) <= 0) {
            b = m;
            fb = fm;
          } else {
            a = m;
            fa = fm;
          }
        }
        const root = Number(((a + b) / 2).toFixed(2));
        if (!roots.some((r) => Math.abs(r - root) < 0.05)) roots.push(root);
      }
      x0 = x1;
      f0 = f1;
    }
    return roots;
  }

  // Função principal de cálculo
  function calcularDerivada() {
    let raw = document.getElementById("funcao").value;
    let expr = normalizeInput(raw);
    const scope = { x: 0 };

    try {
      // 1ª derivada simplificada
      const derivNode = math.derivative(expr, "x");
      const derivSimp = math.simplify(derivNode);
      const derivFmt = derivSimp.toString().replace(/\s*\*\s*/g, "");

      // 2ª derivada simplificada
      const segundaNode = math.derivative(derivSimp, "x");
      const segundaSimp = math.simplify(segundaNode);
      const segundaFmt = segundaSimp.toString().replace(/\s*\*\s*/g, "");

      // Exibir derivadas
      document.getElementById("derivada").textContent = derivFmt;
      document.getElementById("segunda").textContent = segundaFmt;

      // Pontos críticos
      const pontos = findRoots(derivSimp);
      document.getElementById("pontos").textContent = pontos.length
        ? pontos.join(", ")
        : "Nenhum ponto crítico";

      // Classificação via 2ª derivada
      const secExpr = segundaSimp.compile();
      const classif = pontos.map((p) => {
        const v = secExpr.evaluate({ x: p });
        return v > 0
          ? `Ponto mínimo: ${p}`
          : v < 0
          ? `Ponto máximo: ${p}`
          : `Inflexão: ${p}`;
      });
      document.getElementById("classificacao").textContent = classif.length
        ? classif.join(" | ")
        : "Sem classificação";

      // Plotagem do gráfico
      plotarGrafico(expr, derivFmt);
    } catch (e) {
      document.getElementById("derivada").textContent =
        "Erro: verifique a função";
      document.getElementById("segunda").textContent = "";
      document.getElementById("pontos").textContent = "";
      document.getElementById("classificacao").textContent = "";
      console.error(e);
    }
  }

  document.querySelector("button").addEventListener("click", calcularDerivada);
});

// Plotagem com Chart.js
function plotarGrafico(funcExpr, derivExpr) {
  const x = Array.from({ length: 400 }, (_, i) => i / 20 - 10);
  const y1 = x.map((v) => math.evaluate(funcExpr, { x: v }));
  const y2 = x.map((v) => math.evaluate(derivExpr, { x: v }));
  const ctx = document.getElementById("grafico").getContext("2d");
  if (window.graficoAtivo) window.graficoAtivo.destroy();
  window.graficoAtivo = new Chart(ctx, {
    type: "line",
    data: {
      labels: x,
      datasets: [
        { label: "f(x)", data: y1, fill: false },
        { label: "f'(x)", data: y2, fill: false },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
    },
  });
}
