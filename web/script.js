document.addEventListener('DOMContentLoaded', () => {
    const calcButton = document.getElementById('calc-button');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const resultContainer = document.getElementById('result-container');
    const imcValueDisplay = document.getElementById('imc-value');
    const imcClassDisplay = document.getElementById('imc-classification');
    const card = document.querySelector('.glass-card');

    calcButton.addEventListener('click', calculateIMC);

    // Permitir calcular pulsando Enter
    [weightInput, heightInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateIMC();
            }
        });
    });

    function calculateIMC() {
        const weight = weightInput.value.trim();
        const height = heightInput.value.trim();

        if (!weight || !height) {
            displayError('Por favor, completa ambos campos.');
            return;
        }

        const weightNum = parseFloat(weight.replace(',', '.'));
        const heightNum = parseFloat(height.replace(',', '.'));

        if (isNaN(weightNum) || weightNum <= 0 || isNaN(heightNum) || heightNum <= 0) {
            displayError('Ingresa números válidos mayores a cero.');
            return;
        }

        if (heightNum > 3.0) {
            displayError('La altura debe ser en metros (ej. 1.75).');
            return;
        }

        // Lógica de cálculo en local
        const imc = weightNum / (heightNum * heightNum);
        let classification = '';
        let colorClass = '';

        if (imc < 18.5) {
            classification = 'Bajo peso';
            colorClass = 'bajo-peso';
        } else if (imc < 25.0) {
            classification = 'Peso normal';
            colorClass = 'normal';
        } else if (imc < 30.0) {
            classification = 'Sobrepeso';
            colorClass = 'sobrepeso';
        } else {
            classification = 'Obesidad';
            colorClass = 'obesidad';
        }

        displayResult(imc, classification, colorClass);
    }

    function displayError(message) {
        imcValueDisplay.className = 'imc-number';
        imcClassDisplay.className = 'class-value';
        card.classList.remove('bajo-peso-border', 'normal-border', 'sobrepeso-border', 'obesidad-border');

        imcValueDisplay.classList.add('obesidad');
        imcClassDisplay.classList.add('obesidad');
        card.classList.add('obesidad-border');

        imcValueDisplay.innerText = 'Error';
        imcClassDisplay.innerText = message;

        resultContainer.classList.remove('hidden');
    }

    function displayResult(imc, classification, colorClass) {
        // Limpiar clases previas
        imcValueDisplay.className = 'imc-number';
        imcClassDisplay.className = 'class-value';
        card.classList.remove('bajo-peso-border', 'normal-border', 'sobrepeso-border', 'obesidad-border');

        // Agregar clases nuevas
        imcValueDisplay.classList.add(colorClass);
        imcClassDisplay.classList.add(colorClass);
        card.classList.add(`${colorClass}-border`);

        // Mostrar textos
        imcValueDisplay.innerText = imc.toFixed(2);
        imcClassDisplay.innerText = classification;

        // Mostrar contenedor con animación
        resultContainer.classList.remove('hidden');
    }
});
