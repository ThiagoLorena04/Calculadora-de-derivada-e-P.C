function calcularDerivada() {
  // Pega o que o usuário digitou no campo de input
  const entrada = document.getElementById("funcao").value;

  // Cria um objeto que vai permitir substituir o 'x' quando for calcular
  const scope = { x: 0 };

  try {
    // Deriva a função uma vez usando a biblioteca math.js
    const derivada = math.derivative(entrada, 'x').toString();
    document.getElementById("derivada").textContent = derivada;

    // Deriva de novo para obter a segunda derivada
    const segunda = math.derivative(derivada, 'x').toString();
    document.getElementById("segunda").textContent = segunda;

    // Compila a derivada (transforma em função pronta pra testar valores)
    const expr = math.parse(derivada);
    const f = expr.compile();

    // Vamos buscar onde a derivada é zero (ponto crítico)
    const pontos = [];
    for (let i = -10; i <= 10; i += 0.1) {
      scope.x = i; // Testa o valor de x no intervalo -10 até 10
      const valor = f.evaluate(scope); // Calcula o valor da derivada nesse ponto
      const arredondado = Math.round(valor * 1000) / 1000; // Arredonda pra evitar imprecisão

      if (Math.abs(arredondado) < 0.05) {
        pontos.push(Number(i.toFixed(2))); // Se estiver próximo de zero, guarda como ponto crítico
      }
    }

    // Mostra os pontos críticos encontrados
    document.getElementById("pontos").textContent = pontos.join(", ");

    // Agora vamos classificar os pontos usando a segunda derivada
    const segundaExpr = math.parse(segunda).compile();
    let classifText = "";

    pontos.forEach(ponto => {
      scope.x = ponto;
      const val = segundaExpr.evaluate(scope); // Calcula o valor da segunda derivada

      if (val > 0) {
        classifText += `x = ${ponto}: mínimo local | `;
      } else if (val < 0) {
        classifText += `x = ${ponto}: máximo local | `;
      } else {
        classifText += `x = ${ponto}: ponto de inflexão | `;
      }
    });

    // Exibe a classificação
    document.getElementById("classificacao").textContent = classifText;

  } catch (err) {
    alert("Função inválida. Tente algo como: x^2 + 3x - 5");
    console.error(err);
  }
}
