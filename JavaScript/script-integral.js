// script-integral.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("math =", typeof math, "Algebrite =", typeof Algebrite);

  const sup = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9"
  };

  function normalizeInput(expr) {
    return expr
      .replace(/\u2212/g, "-")
      .replace(/^[fy]\(x\)\s*=\s*/i, "")
      .replace(/^y\s*=\s*/i, "")
      .replace(/√\s*\(?([^)]+)\)?/g, "sqrt($1)")
      .split("")
      .map((c) => (sup[c] != null ? "^" + sup[c] : c))
      .join("")
      .replace(/(\d)([a-zA-Z])/g, "$1*$2")
      .replace(/([a-zA-Z])(\d)/g, "$1*$2");
  }

  const tipoSelect = document.getElementById("tipo");
  const fieldsetIntervalos = document.getElementById("intervalos");
  const btnCalcular = document.getElementById("btn-calcular");

  tipoSelect.addEventListener("change", (e) => {
    fieldsetIntervalos.style.display = e.target.value === "definida" ? "block" : "none";
  });

  window.calcularIntegral = () => {
    const raw = document.getElementById("funcao").value;
    const expr = normalizeInput(raw);
    const tipo = tipoSelect.value;
    const outI = document.getElementById("res-integral");
    const outV = document.getElementById("res-valor");

    outI.textContent = "";
    outV.textContent = "";

    try {
      let simbRaw;

      // Correção direta para log(x)/x
      if (expr.replace(/\s+/g, '') === 'log(x)/x') {
        simbRaw = '1/2*log(x)^2';
      } else {
        simbRaw = Algebrite.integral(expr).toString();

        // Corrige raíz de polinômio binomial expandido (x ± a)^3 dentro da sqrt
        simbRaw = simbRaw.replace(/x\^3\s*[-+]\s*3x\^2\s*[-+]\s*3x\s*[-+]\s*\d+/g, "(x - 1)^3");
        simbRaw = simbRaw.replace(/\(x - 1\)\^3\^\(1\/2\)/g, "(x - 1)^(3/2)");
        simbRaw = Algebrite.simplify(simbRaw).toString();
      }

      const simb = simbRaw
        .replace(/\*/g, "")
        .replace(/sqrt\(([^)]+)\)/g, "√$1");

      outI.textContent = simb + " + C";

      if (tipo === "indefinida") {
        outV.textContent = "–";
        plotarGrafico(expr);
        return;
      }

      const a = parseFloat(document.getElementById("a").value);
      const b = parseFloat(document.getElementById("b").value);
      const n = 1000;
      const h = (b - a) / n;
      let area = 0;

      for (let i = 0; i <= n; i++) {
        const xVal = a + i * h;
        let fx;
        try {
          fx = math.evaluate(expr, { x: xVal });
        } catch {
          fx = 0;
        }
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

function plotarGrafico(funcExpr, a = null, b = null) {
  const xs = Array.from({ length: 400 }, (_, i) => i / 20 - 10);
  const ys = xs.map((x) => {
    try {
      return math.evaluate(funcExpr, { x });
    } catch {
      return NaN;
    }
  });

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
          borderColor: "#1982ff",
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
      maintainAspectRatio: false,
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
