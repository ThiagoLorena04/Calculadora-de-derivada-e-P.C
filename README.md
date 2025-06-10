# Calculadora de Integrais & Derivadas

Um projeto web interativo para calcular **derivadas (primeira e segunda), pontos críticos, classificação (máximos, mínimos e inflexões) e integrais (indefinidas e definidas)**, com gráficos dinâmicos e responsivos.  

---

## Funcionalidades

✅ Derivada 1ª e 2ª (simbólica)  
✅ Pontos críticos (raízes da 1ª derivada)  
✅ Classificação de pontos críticos (máx, mín, ponto de inflexão)  
✅ Integral indefinida (antiderivada simbólica)  
✅ Integral definida (área numérica via regra dos trapézios)  
✅ Gráficos de f(x) e f’(x) (derivada) ou área sombreada (integral definida)  
✅ Responsividade total (mobile-friendly)

---

## Ferramentas e Tecnologias

- **HTML5 & CSS3**: estrutura e layout responsivo (Flexbox, Grid e Media Queries)
- **JavaScript (ES6+)**: toda a lógica de cálculo e interatividade
- **math.js**: biblioteca para cálculos simbólicos e numéricos (derivadas, avaliação de funções)
- **Algebrite**: biblioteca de álgebra computacional para integrais simbólicas
- **Chart.js**: renderização de gráficos interativos (2D)
- **VS Code**: editor principal usado no desenvolvimento

---

## Estratégias de Cálculo

### 🔷 Derivadas e Segunda Derivada
- Usamos `math.js` para obter a derivada 1ª e a segunda derivada de forma simbólica

## 🔷 Pontos Críticos (Raízes da 1ª Derivada)
Aplicamos o método de busca binária (bisection):
Intervalo fixo: [-3, 3]
Passo inicial: 0.1
Detectamos trocas de sinal em f’(x)
Refinamos a raiz com 35 iterações de bisection para precisão alta

## 🔷 Classificação de Pontos Críticos
Para cada ponto crítico:
Avaliamos a segunda derivada f’’(x)
Se f’’(x) > 0 ➜ mínimo local
Se f’’(x) < 0 ➜ máximo local
Se f’’(x) ≈ 0 ➜ ponto de inflexão

🔷 Integral Indefinida
Usamos o Algebrite.integral para obter a antiderivada simbólica:
Algebrite.integral(expr).toString();
Resultado apresentado no formato “+ C” (constante de integração).

🔷 Integral Definida
Aplicamos a Regra dos Trapézios composta:
n = 1000 subintervalos
h = (b - a) / n

Calculadora/
├── index.html        # Derivadas
├── integral.html     # Integrais
├── css/
│   ├── global.css
│   ├── header.css
│   ├── derivada.css
│   └── integral.css
└── JavaScript/
    ├── script-derivada.js
    └── script-integral.js


É isso! 😊 
