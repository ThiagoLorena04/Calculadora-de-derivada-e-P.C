// Função f(x) = x³ - 6x² + 9x + 1
// Derivada manual: f'(x) = 3x² - 12x + 9

// Calcula a derivada (pré-definida)
const derivada = (x) => 3 * x * x - 12 * x + 9;

// Mostra a derivada no HTML
document.getElementById("derivada").textContent =
  "Derivada: f'(x) = 3x² - 12x + 9";

// Função para encontrar raízes da derivada (pontos críticos)
function encontrarPontosCriticos() {
  // Equação: 3x² - 12x + 9 = 0
  // Fórmula de Bhaskara: ax² + bx + c
  const a = 3,
    b = -12,
    c = 9;
  const delta = b * b - 4 * a * c;

  if (delta < 0) {
    return "Sem raízes reais.";
  }

  const x1 = (-b + Math.sqrt(delta)) / (2 * a);
  const x2 = (-b - Math.sqrt(delta)) / (2 * a);

  return `Pontos críticos: x = ${x1.toFixed(2)} e x = ${x2.toFixed(2)}`;
}

// Mostra os pontos críticos no HTML
document.getElementById("pontos").textContent = encontrarPontosCriticos();
