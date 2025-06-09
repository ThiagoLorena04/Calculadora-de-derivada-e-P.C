// script-integral.js

document.addEventListener("DOMContentLoaded", () => {
  // Confirma que as libs carregaram
  console.log("math =", typeof math, "Algebrite =", typeof Algebrite);

  // Mapeamento de superíndices para expoentes
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

  // Normaliza o input: sinal, superíndice, insere '*' onde necessário
  function normalizeInput(expr) {
    expr = expr
      .replace(/\u2212/g, "-") // unicode “−” → hyphen
      .replace(/^[fy]\(x\)\s*=\s*/i, "") // remove f(x)=
      .replace(/^y\s*=\s*/i, ""); // remove y=
    expr = expr
      .split("")
      .map((c) => (sup[c] != null ? "^" + sup[c] : c))
      .join("");
    expr = expr
      .replace(/(\d)([a-zA-Z])/g, "$1*$2") // 3x → 3*x
      .replace(/([a-zA-Z])(\d)/g, "$1*$2"); // x2 → x*2
    return expr;
  }

  const tipoSelect = document.getElementById("tipo");
  const fieldsetIntervalos = document.getElementById("intervalos");
  const btnCalcular = document.getElementById("btn-calcular");

  // Toggle de exibição dos campos [a, b]
  tipoSelect.addEventListener("change", (e) => {
    fieldsetIntervalos.style.display =
      e.target.value === "definida" ? "block" : "none";
  });

  // Função principal de cálculo
  window.calcularIntegral = () => {
    const raw = document.getElementById("funcao").value;
    const expr = normalizeInput(raw);
    const tipo = tipoSelect.value;
    const outI = document.getElementById("res-integral");
    const outV = document.getElementById("res-valor");

    outI.textContent = "";
    outV.textContent = "";

    try {
      // --- Integral Indefinida ---
      if (tipo === "indefinida") {
        // gera primitiva simbólica
        const simbRaw = Algebrite.simplify(Algebrite.integral(expr)).toString();
        // remove todos os '*'
        const simb = simbRaw.replace(/\*/g, "");
        outI.textContent = simb + " + C";
        outV.textContent = "–";
        plotarGrafico(expr);
        return;
      }

      // --- Integral Definida ---
      // 1) Primtiva simbólica
      const simbRaw = Algebrite.simplify(Algebrite.integral(expr)).toString();
      const simb = simbRaw.replace(/\*/g, "");
      outI.textContent = simb + " + C";

      // 2) Valor numérico via método dos trapézios
      const a = parseFloat(document.getElementById("a").value);
      const b = parseFloat(document.getElementById("b").value);
      const n = 1000;
      const h = (b - a) / n;
      let area = 0;

      for (let i = 0; i <= n; i++) {
        const xVal = a + i * h;
        const fx = math.evaluate(expr, { x: xVal });
        area += i === 0 || i === n ? fx : 2 * fx;
      }
      area = (h / 2) * area;
      outV.textContent = area.toFixed(6);

      plotarGrafico(expr, a, b);
    } catch (err) {
      console.error(err);
      outI.textContent = "Erro ao calcular integral";
      outV.textContent = "–";
    }
  };

  btnCalcular.addEventListener("click", calcularIntegral);
});

// Função de plotagem com Chart.js
function plotarGrafico(funcExpr, a = null, b = null) {
  const xs = Array.from({ length: 400 }, (_, i) => i / 20 - 10);
  const ys = xs.map((x) => math.evaluate(funcExpr, { x }));
  const ctx = document.getElementById("grafico").getContext("2d");

  const background =
    a != null && b != null
      ? xs.map((x, i) => (x >= a && x <= b ? ys[i] : null))
      : null;

  if (window.graficoIntegral) window.graficoIntegral.destroy();
  window.graficoIntegral = new Chart(ctx, {
    type: "line",
    data: {
      labels: xs,
      datasets: [
        {
          label: "f(x)",
          data: ys,
          borderColor: "#1982ff", // 🌟 Azul claro como o de derivadas
          borderWidth: 2,
          fill: false,
          pointRadius: 0
        },
        ...(background
          ? [
              {
                label: "Área sob f(x)",
                data: background,
                backgroundColor: "rgba(0,128,255,0.3)",
                fill: true,
                pointRadius: 0,
                borderWidth: 0,
              },
            ]
          : []),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Igual ao de derivadas!
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(255,255,255,.05)' } },
        y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(255,255,255,.05)' } }
      }
    },
  });
}

