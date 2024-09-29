/**
 * Fertilizer Recommendation Application
 * 
 * This application calculates and displays fertilizer recommendations for wheat
 * based on user inputs such as climate, yield, and soil composition.
 * 
 * @author Saber Heidari
 * @version 1.0.0
 */


'use strict';

// Memoization for expensive calculations
const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

// Debounce function for input handlers
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Lazy loading for images
const lazyLoad = (target) => {
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.disconnect();
            }
        });
    });
    io.observe(target);
};

function handleStartOver() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function initializeStartOverButton() {
    const startOverButton = document.getElementById('startOver');
    if (startOverButton) {
        startOverButton.addEventListener('click', handleStartOver);
    }
}

// Add this to the top of your existing app.js file
const fertilizerData = {
    recommendedN: {
        'organic carbon<0.5': {
            hot_humid : { 3: 110.4, 4: 133.4, 5: 156.4, 6: 174.8, 7: 193.2 },
            hot_dry: { 3: 119.6, 4: 142.6, 5: 165.6, 6: 184.0, 7: 197.8 },
            Temperate: { 3: 110.4, 4: 133.4, 5: 156.4, 6: 174.8, 7: 193.2 },
            Cold: { 3: 96.6, 4: 119.6, 5: 142.6, 6: 161.0, 7: 179.4 }
        },
        '0.5<=organic carbon<0.75': {
            hot_humid: { 3: 96.6, 4: 119.6, 5: 142.6, 6: 161.0, 7: 179.4 },
            hot_dry: { 3: 105.8, 4: 128.8, 5: 151.8, 6: 170.2, 7: 184.0 },
            Temperate: { 3: 96.6, 4: 119.6, 5: 142.6, 6: 161.0, 7: 179.4 },
            Cold: { 3: 82.8, 4: 105.8, 5: 128.8, 6: 147.2, 7: 165.6 }
        },
        '0.75<organic carbon': {
            hot_humid: { 3: 82.8, 4: 105.8, 5: 128.8, 6: 147.2, 7: 165.6 },
            hot_dry: { 3: 92.0, 4: 115.0, 5: 138.0, 6: 156.4, 7: 170.2 },
            Temperate: { 3: 82.8, 4: 105.8, 5: 128.8, 6: 147.2, 7: 165.6 },
            Cold: { 3: 69.0, 4: 92.0, 5: 115.0, 6: 133.4, 7: 151.8 }
        }
    }, 
    recommendedP2O5: {
        'P2O5<5': {
            hot_humid: { 3: 92.0, 4: 105.8, 5: 119.6, 6: 133.4, 7: 142.6 },
            hot_dry: { 3: 85.1, 4: 98.9, 5: 112.7, 6: 126.5, 7: 135.7 },
            Temperate: {3: 92.0, 4: 105.8, 5: 119.6, 6: 133.4, 7: 142.6 },
            Cold: { 3: 101.2, 4: 115.0, 5: 128.8, 6: 142.6, 7: 151.8 }
        },
        '5<= P2O5<10': {
            hot_humid: { 3: 73.6, 4: 87.4, 5: 101.2, 6: 115.0, 7: 124.2 },
            hot_dry: { 3: 66.7, 4: 80.5, 5: 94.3, 6: 108.1, 7: 117.3 },
            Temperate: { 3: 73.6, 4: 87.4, 5: 101.2, 6: 115.0, 7: 124.2 },
            Cold: { 3: 82.8, 4: 96.6, 5: 110.4, 6: 124.2, 7: 133.4 }
        },
        '10<= P2O5<12': {
            hot_humid: { 3: 32.2, 4: 46.0, 5: 59.8, 6: 73.6, 7: 82.8 },
            hot_dry: { 3: 25.3, 4: 39.1, 5: 52.9, 6: 66.7, 7: 75.9 },
            Temperate: { 3: 32.2, 4: 46.0, 5: 59.8, 6: 73.6, 7: 82.8 },
            Cold: { 3: 41.4, 4: 55.2, 5: 69.0, 6: 82.8, 7: 92.0 }
        },
        '12<= P2O5': {
            hot_humid: { 3: 9.2, 4: 23.0, 5: 36.8, 6: 50.6, 7: 59.8 },
            hot_dry: { 3: 9.2, 4: 18.4, 5: 32.2, 6: 46.0, 7: 55.2 },
            Temperate: { 3: 9.2, 4: 23.0, 5: 36.8, 6: 50.6, 7: 59.8 },
            Cold: { 3: 18.4, 4: 32.2, 5: 46.0, 6: 59.8, 7: 73.6 }
        }
    },
    recommendedK2O: {
        'K2O<100': {
            hot_humid: { 3: 110, 4: 120, 5: 130, 6: 140, 7: 150 },
            hot_dry: { 3: 105, 4: 115, 5: 125, 6: 135, 7: 145 },
            Temperate: { 3: 110, 4: 120, 5: 130, 6: 140, 7: 150 },
            Cold: { 3: 115, 4: 125, 5: 135, 6: 145, 7: 155 }
        },
        '100<= K2O <150': {
            hot_humid: { 3: 75, 4: 85, 5: 95, 6: 105, 7: 115 },
            hot_dry: { 3: 70, 4: 80, 5: 90, 6: 95, 7: 110 },
            Temperate: { 3: 75, 4: 85, 5: 95, 6: 105, 7: 115 },
            Cold: { 3: 80, 4: 90, 5: 100, 6: 110, 7: 120 }
        },
        '150<= K2O': {
            hot_humid: { 3: 25, 4: 35, 5: 45, 6: 55, 7: 60 },
            hot_dry: { 3: 20, 4: 30, 5: 40, 6: 50, 7: 55 },
            Temperate: { 3: 25, 4: 35, 5: 45, 6: 55, 7: 60 },
            Cold: { 3: 30, 4: 40, 5: 50, 6: 60, 7: 70 }
        }
    }

};

// Set active tab
function setActiveTab() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === currentPage);
    });
}

// Setup form handlers
function setupFormHandlers() {
    const inputForm = document.getElementById('inputForm');
    if (inputForm) {
        inputForm.addEventListener('submit', handleInputFormSubmission);
    }

    const fertilizerForm = document.getElementById('fertilizerForm');
    if (fertilizerForm) {
        fertilizerForm.addEventListener('submit', handleFertilizerFormSubmission);
    }
}

// Initialize page functionality
function initializePageFunctionality() {
    if (window.location.pathname.includes('fertilizer.html')) {
        initializeFertilizerPage();
    } else if (window.location.pathname.includes('results.html')) {
        displayResults();
    } else if (window.location.pathname.includes('fertilizer-calendar.html')) {
        initializeFertilizerCalendarPage();
    }
}

// Add this new function to handle the fertilizer calendar page
function initializeFertilizerCalendarPage() {
    const calendarImage = document.querySelector('.calendar-image');
    if (calendarImage) {
        let scale = 1;
        const scaleStep = 0.1;

        calendarImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            scale += e.deltaY > 0 ? -scaleStep : scaleStep;
            scale = Math.max(1, Math.min(scale, 3)); // Limit scale between 1 and 3
            calendarImage.style.transform = `scale(${scale})`;
        });
    }
}

// Handle input form submission
function handleInputFormSubmission(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    for (const [key, value] of formData.entries()) {
        localStorage.setItem(key, value);
    }
    window.location.href = 'fertilizer.html';
}

// Handle fertilizer form submission
function handleFertilizerFormSubmission(event) {
    event.preventDefault();

    if (!validateFertilizerPercentages()) {
        return; // Stop form submission if validation fails
    }
    const formData = new FormData(event.target);
    for (const [key, value] of formData.entries()) {
        if (['nitrogenFertilizer', 'phosphorusFertilizer', 'potassiumFertilizer', 'compoundFertilizer'].includes(key)) {
            const selectedOptions = event.target.elements[key].selectedOptions;
            for (let option of selectedOptions) {
                localStorage.setItem(option.value, 'true');
                if (key === 'compoundFertilizer') {
                    const amountInput = document.getElementById(`${option.value}Amount`);
                    if (amountInput) {
                        localStorage.setItem(`${option.value}Amount`, amountInput.value);
                    }
                } else {
                    // For single fertilizer selections, set percentage to 100
                    const percentageInput = document.getElementById(`${option.value}Percentage`);
                    const percentage = percentageInput ? percentageInput.value : '100';
                    localStorage.setItem(`${option.value}Percentage`, percentage);
                }
            }
        } else {
            localStorage.setItem(key, value);
        }
    }
    window.location.href = 'results.html';
}

// Initialize fertilizer page
function initializeFertilizerPage() {
    const compoundFertilizer = document.getElementById('compoundFertilizer');
    const compoundFertilizerAmounts = document.getElementById('compoundFertilizerAmounts');
    if (compoundFertilizer && compoundFertilizerAmounts) {
        compoundFertilizer.addEventListener('change', updateCompoundFertilizerInputs);
        updateCompoundFertilizerInputs(); // Call once to handle pre-selected options
    }

    ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
        const select = document.getElementById(`${nutrient}Fertilizer`);
        const percentagesDiv = document.getElementById(`${nutrient}Percentages`);
        if (select && percentagesDiv) {
            select.addEventListener('change', () => updatePercentages(select, percentagesDiv));
        }
    });
}

// Update compound fertilizer inputs
function updateCompoundFertilizerInputs() {
    const compoundFertilizer = document.getElementById('compoundFertilizer');
    const compoundFertilizerAmounts = document.getElementById('compoundFertilizerAmounts');
    
    compoundFertilizerAmounts.innerHTML = '';
    
    Array.from(compoundFertilizer.selectedOptions).forEach(option => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label>${option.textContent} amount (kg/ha):</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" name="${option.value}Amount" id="${option.value}Amount" min="0" step="0.1" required>
        `;
        compoundFertilizerAmounts.appendChild(div);
    });
}

// Update percentages for fertilizer inputs
function updatePercentages(fertilizer, percentagesDiv) {
    percentagesDiv.innerHTML = '';
    if (fertilizer.selectedOptions.length > 1) {
        Array.from(fertilizer.selectedOptions).forEach(option => {
            const label = document.createElement('label');
            label.textContent = `${option.textContent} (%):`;
            const input = document.createElement('input');
            input.type = 'number';
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.min = '0';
            input.max = '100';
            input.step = '1';
            input.name = `${option.value}Percentage`;
            input.id = `${option.value}Percentage`;
            input.required = true;
            percentagesDiv.appendChild(label);
            percentagesDiv.appendChild(input);
        });
    } else if (fertilizer.selectedOptions.length === 1) {
        const option = fertilizer.selectedOptions[0];
        localStorage.setItem(`${option.value}Percentage`, '100');
    }
}

// Calculate fertilizer recommendations
const calculateFertilizerRecommendations = memoize(() => {
    const climate = localStorage.getItem('climate');
    const yieldValue = parseFloat(localStorage.getItem('yield'));
    const organicCarbon = parseFloat(localStorage.getItem('organicCarbon'));
    const phosphorus = parseFloat(localStorage.getItem('phosphorus'));
    const potassium = parseFloat(localStorage.getItem('potassium'));

    console.log('Input values:', { climate, yieldValue, organicCarbon, phosphorus, potassium });

    // Check if any of the required values are missing or invalid
    if (!climate || isNaN(yieldValue) || isNaN(organicCarbon) || isNaN(phosphorus) || isNaN(potassium)) {
        throw new Error('Missing or invalid input values. Please check your inputs.');
    }
    
    const nitrogenTable = 
        organicCarbon < 0.5 ? fertilizerData.recommendedN['organic carbon<0.5'] :
        organicCarbon < 0.75 ? fertilizerData.recommendedN['0.5<=organic carbon<0.75'] :
        fertilizerData.recommendedN['0.75<organic carbon'];

    const phosphorusTable = 
        phosphorus < 5 ? fertilizerData.recommendedP2O5['P2O5<5'] :
        phosphorus < 10 ? fertilizerData.recommendedP2O5['5<= P2O5<10'] :
        phosphorus < 12 ? fertilizerData.recommendedP2O5['10<= P2O5<12'] :
        fertilizerData.recommendedP2O5['12<= P2O5'];

    const potassiumTable = 
        potassium < 100 ? fertilizerData.recommendedK2O['K2O<100'] :
        potassium < 150 ? fertilizerData.recommendedK2O['100<= K2O <150'] :
        fertilizerData.recommendedK2O['150<= K2O'];

    // Check if the tables exist
    if (!nitrogenTable || !phosphorusTable || !potassiumTable) {
        throw new Error('Unable to determine fertilizer recommendations. Please check your inputs.');
    }

    // Check if the climate exists in the tables
    if (!nitrogenTable[climate] || !phosphorusTable[climate] || !potassiumTable[climate]) {
        throw new Error(`Invalid climate value: ${climate}`);
    }

    // Round the yield value to the nearest available key in the table
    const availableYields = Object.keys(nitrogenTable[climate]).map(Number);
    const nearestYield = availableYields.reduce((prev, curr) => 
        Math.abs(curr - yieldValue) < Math.abs(prev - yieldValue) ? curr : prev
    );

    const recommendedN = nitrogenTable[climate][nearestYield];
    const recommendedP2O5 = phosphorusTable[climate][nearestYield];
    const recommendedK2O = potassiumTable[climate][nearestYield];

    // Check if any of the recommendations are undefined
    if (recommendedN === undefined || recommendedP2O5 === undefined || recommendedK2O === undefined) {
        throw new Error(`Unable to determine recommendations for yield value: ${yieldValue}`);
    }

    const result = { recommendedN, recommendedP2O5, recommendedK2O };
    console.log('Calculated recommendations:', result);
    return result;
});

// Calculate fertilizer amounts
function calculateFertilizerAmounts(recommendations) {
    let remainingN = recommendations.recommendedN;
    let remainingP2O5 = recommendations.recommendedP2O5;
    let remainingK2O = recommendations.recommendedK2O;
    const fertilizerAmounts = {};

    const compoundFertilizers = ['20-20-20', 'DAP'];
    compoundFertilizers.forEach(fertilizer => {
        if (localStorage.getItem(fertilizer) === 'true') {
            const amount = parseFloat(localStorage.getItem(`${fertilizer}Amount`) || 0);
            if (amount > 0) {
                if (fertilizer === '20-20-20') {
                    const nutrientAmount = amount * 0.2;
                    remainingN -= nutrientAmount;
                    remainingP2O5 -= nutrientAmount;
                    remainingK2O -= nutrientAmount;
                } else if (fertilizer === 'DAP') {
                    remainingN -= amount * 0.18;
                    remainingP2O5 -= amount * 0.46;
                }
                fertilizerAmounts[fertilizer] = amount;
            }
        }
    });

    const fertilizerTypes = {
        nitrogen: ['urea', 'ammoniumSulfate', 'ammoniumNitrate'],
        phosphorus: ['tripleSuperphosphate', 'simpleSuperphosphate'],
        potassium: ['potassiumSulfate', 'potassiumChloride']
    };

    for (const [nutrient, fertilizers] of Object.entries(fertilizerTypes)) {
        const selectedFertilizers = fertilizers.filter(f => localStorage.getItem(f) === 'true');
        if (selectedFertilizers.length > 0) {
            selectedFertilizers.forEach(fertilizer => {
                const percentage = parseFloat(localStorage.getItem(`${fertilizer}Percentage`) || 100) / 100;
                let amount;
                switch (fertilizer) {
                    case 'urea': amount = (remainingN * percentage) / 0.46; break;
                    case 'ammoniumSulfate': amount = (remainingN * percentage) / 0.21; break;
                    case 'ammoniumNitrate': amount = (remainingN * percentage) / 0.34; break;
                    case 'tripleSuperphosphate': amount = (remainingP2O5 * percentage) / 0.46; break;
                    case 'simpleSuperphosphate': amount = (remainingP2O5 * percentage) / 0.16; break;
                    case 'potassiumSulfate': amount = (remainingK2O * percentage) / 0.50; break;
                    case 'potassiumChloride': amount = (remainingK2O * percentage) / 0.60; break;
                }
                fertilizerAmounts[fertilizer] = amount;
            });
        }
    }

    return fertilizerAmounts;
}

function validateFertilizerPercentages() {
    const nutrients = ['nitrogen', 'phosphorus', 'potassium'];
    let isValid = true;

    nutrients.forEach(nutrient => {
        const select = document.getElementById(`${nutrient}Fertilizer`);
        const percentagesDiv = document.getElementById(`${nutrient}Percentages`);
        
        if (select.selectedOptions.length > 1) {
            let totalPercentage = 0;
            const inputs = percentagesDiv.querySelectorAll('input[type="number"]');
            
            inputs.forEach(input => {
                totalPercentage += parseFloat(input.value) || 0;
            });

            if (totalPercentage > 100) {
                isValid = false;
                alert(`The total percentage for ${nutrient} fertilizers exceeds 100%. Please adjust the values.`);
            }
        }
    });

    return isValid;
}

// Validate inputs
function validateInputs() {
    const climate = localStorage.getItem('climate');
    const yieldValue = parseFloat(localStorage.getItem('yield'));
    const organicCarbon = parseFloat(localStorage.getItem('organicCarbon'));
    const phosphorus = parseFloat(localStorage.getItem('phosphorus'));
    const potassium = parseFloat(localStorage.getItem('potassium'));

    if (!climate || !yieldValue || isNaN(organicCarbon) || isNaN(phosphorus) || isNaN(potassium)) {
        throw new Error('Please fill in all required fields with valid values.');
    }

    if (organicCarbon < 0 || organicCarbon > 100) {
        throw new Error('Organic Carbon percentage must be between 0 and 100.');
    }

    if (phosphorus < 0 || potassium < 0) {
        throw new Error('Phosphorus and Potassium values must be non-negative.');
    }
}

// Display results
function displayResults() {
    const resultsDiv = document.getElementById('recommendationResults');
    if (!resultsDiv) return;

    try {
        validateInputs();
        const recommendations = calculateFertilizerRecommendations();
        const fertilizerAmounts = calculateFertilizerAmounts(recommendations);

        resultsDiv.innerHTML = `
            <h3>Recommended Nutrient Amounts</h3>
            <p>Nitrogen (N): ${recommendations.recommendedN.toFixed(2)} kg/ha</p>
            <p>Phosphorus (P2O5): ${recommendations.recommendedP2O5.toFixed(2)} kg/ha</p>
            <p>Potassium (K2O): ${recommendations.recommendedK2O.toFixed(2)} kg/ha</p>
            <h3>Fertilizer Amounts</h3>
            ${Object.entries(fertilizerAmounts)
                .map(([fertilizer, amount]) => `<p>${fertilizer}: ${amount.toFixed(2)} kg/ha</p>`)
                .join('')}
        `;
    } catch (error) {
        console.error('Error in displayResults:', error);
        resultsDiv.innerHTML = `<p>An error occurred: ${error.message}</p>
                                <p>Please go back and check your inputs.</p>`;
    }
}

// Main initialization function
function initializeApp() {
    setActiveTab();
    setupFormHandlers();
    initializePageFunctionality();
    document.querySelectorAll('img[data-src]').forEach(lazyLoad);

    // Event delegation for form inputs
    document.addEventListener('input', debounce((event) => {
        if (event.target.matches('input, select')) {
            localStorage.setItem(event.target.id, event.target.value);
        }
    }, 300));

    // Handle menu button and side menu
    const menuButton = document.getElementById('menuButton');
    const sideMenu = document.getElementById('sideMenu');
    if (menuButton && sideMenu) {
        menuButton.addEventListener('click', () => sideMenu.classList.toggle('open'));
        document.addEventListener('click', (event) => {
            if (!sideMenu.contains(event.target) && event.target !== menuButton) {
                sideMenu.classList.remove('open');
            }
        });
    }

    // Handle "Start Over" button
    const startOverButton = document.getElementById('startOver');
    if (startOverButton) {
        startOverButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);