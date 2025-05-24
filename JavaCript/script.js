// Função principal chamada no clique do botão
function calcularDerivada() {
  const entrada = document.getElementById("funcao").value;
  const scope = { x: 0 };

  try {
    // Derivadas
    const derivada = math.derivative(entrada, 'x').toString();
    const segunda = math.derivative(derivada, 'x').toString();

    document.getElementById("derivada").textContent = derivada;
    document.getElementById("segunda").textContent = segunda;

    // Compilar para testar pontos críticos
    const expr = math.parse(derivada).compile();
    const pontos = [];

    for (let i = -10; i <= 10; i += 0.1) {
      scope.x = i;
      const valor = expr.evaluate(scope);
      const arredondado = Math.round(valor * 1000) / 1000;

      if (Math.abs(arredondado) < 0.05) {
        const jaTem = pontos.find(p => Math.abs(p - i) < 0.2);
        if (!jaTem) pontos.push(Number(i.toFixed(2)));
      }
    }

    document.getElementById("pontos").textContent = pontos.join(", ");

    // Classificação com segunda derivada
    const segundaExpr = math.parse(segunda).compile();
    let classifText = "";

    pontos.forEach(ponto => {
      scope.x = ponto;
      const val = segundaExpr.evaluate(scope);

      if (val > 0) {
        classifText += `x = ${ponto}: mínimo local | `;
      } else if (val < 0) {
        classifText += `x = ${ponto}: máximo local | `;
      } else {
        classifText += `x = ${ponto}: ponto de inflexão | `;
      }
    });

    document.getElementById("classificacao").textContent = classifText;

    // Plotar com Chart.js
    plotarGrafico(entrada, derivada);

  } catch (err) {
    alert("Função inválida. Tente algo como: x^2 + 3x - 5");
    console.error(err);
  }
}

// Função para gerar os gráficos
function plotarGrafico(funcao, derivada) {
  const x = Array.from({ length: 400 }, (_, i) => (i / 20 - 10));
  const yFunc = x.map(v => math.evaluate(funcao, { x: v }));
  const yDeriv = x.map(v => math.evaluate(derivada, { x: v }));

  const ctx = document.getElementById("grafico").getContext("2d");

  if (window.graficoAtivo) window.graficoAtivo.destroy();

  window.graficoAtivo = new Chart(ctx, {
    type: 'line',
    data: {
      labels: x,
      datasets: [
        {
          label: 'f(x)',
          data: yFunc,
          borderColor: 'blue',
          fill: false,
        },
        {
          label: "f'(x)",
          data: yDeriv,
          borderColor: 'red',
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: 'f(x) e f\'(x)'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'x'
          }
        },
        y: {
          title: {
            display: true,
            text: 'y'
          }
        }
      }
    }
  });
}
