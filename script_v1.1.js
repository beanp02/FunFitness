// Fun Fitness Tracker - Version 1.1
// Inline Data
const memes = {
    good: [
        "Look at you, being all healthy and stuff.",
        "Deficit secured. Pizza is coming... eventually.",
        "You're a skinny legend in the making."
    ],
    neutral: [
        "Perfectly balanced, as all things should be.",
        "Not great, not terrible.",
        "Keep grinding."
    ],
    bad: [
        "I see you chose violence (and carbs) today.",
        "Your diet is a joke to you?",
        "Do you even lift, bro?"
    ]
};

let foodDB = {
    pizza: 285,
    burger: 500,
    salad: 150,
    banana: 105,
    chicken: 165,
    rice: 206,
    beer: 154,
    soda: 140
};

const quotes = [
    "Success starts with self-discipline.",
    "Don't stop when you're tired. Stop when you're done.",
    "Your body can stand almost anything. It’s your mind that you have to convince.",
    "The only bad workout is the one that didn't happen.",
    "Discipline is doing what needs to be done, even if you don't want to do it.",
    "Sweat is just fat crying.",
    "No pain, no gain. Shut up and train.",
    "You don't get the ass you want by sitting on it.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "A one hour workout is 4% of your day. No excuses."
];

// State
let state = {
    food: [],
    workouts: [],
    goal: null,
    weight: null,
    water: 0, // 0-6 bottles
    customFoods: {}, // name: cals
    completed: false
};

// DOM Elements
const els = {
    calsIn: document.getElementById('calories-in'),
    calsOut: document.getElementById('calories-out'),
    netCals: document.getElementById('net-calories'),
    goalInput: document.getElementById('calorie-goal'),
    weightInput: document.getElementById('user-weight'),

    // Food Form
    foodSelect: document.getElementById('food-select'),
    foodCustomInputs: document.getElementById('food-custom-inputs'),
    foodName: document.getElementById('food-name'),
    foodCals: document.getElementById('food-cals'),
    saveCustomFood: document.getElementById('save-custom-food'),
    foodQty: document.getElementById('food-qty'),
    addFoodBtn: document.getElementById('add-food-btn'),
    foodList: document.getElementById('food-list'),

    // Workout Form
    workoutType: document.getElementById('workout-type'),
    workoutName: document.getElementById('workout-name'),
    cardioInputs: document.getElementById('cardio-inputs'),
    strengthInputs: document.getElementById('strength-inputs'),

    // Cardio Fields
    cardioTime: document.getElementById('cardio-time'),
    cardioSpeed: document.getElementById('cardio-speed'),
    cardioIncline: document.getElementById('cardio-incline'),

    // Strength Fields
    strengthSets: document.getElementById('strength-sets'),
    strengthReps: document.getElementById('strength-reps'),
    strengthWeight: document.getElementById('strength-weight'),
    strengthEffort: document.getElementById('strength-effort'),

    addWorkoutBtn: document.getElementById('add-workout-btn'),
    workoutList: document.getElementById('workout-list'),

    // Modals & History
    historyBtn: document.getElementById('history-btn'),
    historyModal: document.getElementById('history-modal'),
    closeHistory: document.getElementById('close-history'),
    judgementText: document.querySelector('.snark-text'),
    memeDisplay: document.getElementById('meme-display'),

    // New elements
    historyList: document.getElementById('history-list'),
    motivationText: document.getElementById('motivation-text'),
    waterTracker: document.getElementById('water-tracker'),
    waterSummary: document.getElementById('water-summary'),
    editStatsBtn: document.getElementById('edit-stats-btn'),

    // New Features
    finishDayBtn: document.getElementById('finish-day-btn'),
    editingBanner: document.getElementById('editing-banner'),
    editingDate: document.getElementById('editing-date'),
    exitEditBtn: document.getElementById('exit-edit-btn'),
    mainContainer: document.querySelector('.container'),

    // v1.1 Features
    datetimeDisplay: document.getElementById('datetime-display'),
    toggleBulkWorkoutBtn: document.getElementById('toggle-bulk-workout'),
    workoutBulkContainer: document.getElementById('workout-bulk-container'),
    workoutSingleContainer: document.getElementById('workout-single-container'),
    workoutBulkInput: document.getElementById('workout-bulk-input'),
    saveBulkWorkoutBtn: document.getElementById('save-bulk-workout')
};

let currentDate = getTodayStr();

// Init
function init() {
    loadData();
    populateFoodSelect();
    setupEventListeners();
    updateUI();
    showMotivation();
    renderWater();

    // v1.1 Init
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setInterval(checkDate, 60000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) checkDate();
    });

    // Initial Lock State
    if (state.weight && state.goal) {
        toggleStatsLock(true);
    } else {
        toggleStatsLock(false);
    }

    // Initial Food Input State
    if (els.foodSelect.value === 'custom') {
        els.foodCustomInputs.classList.remove('hidden');
    }
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function loadData() {
    const stored = localStorage.getItem('fitness_data');

    // Reset state defaults
    state = {
        food: [],
        workouts: [],
        goal: null,
        weight: null,
        water: 0,
        customFoods: {},
        completed: false
    };

    if (stored) {
        try {
            const data = JSON.parse(stored);

            // Load custom foods globally from the latest entry
            const lastDayKey = Object.keys(data).sort().pop();
            if (lastDayKey && data[lastDayKey].customFoods) {
                state.customFoods = data[lastDayKey].customFoods;
                foodDB = { ...foodDB, ...state.customFoods };
            }

            if (data[currentDate]) {
                state = data[currentDate];
                if (state.customFoods) {
                    foodDB = { ...foodDB, ...state.customFoods };
                }
            } else if (currentDate === getTodayStr()) {
                // New day - carry over stats
                if (lastDayKey) {
                    state.weight = data[lastDayKey].weight;
                    state.goal = data[lastDayKey].goal;
                    state.customFoods = data[lastDayKey].customFoods || {};
                    foodDB = { ...foodDB, ...state.customFoods };
                }
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    }

    // Populate inputs
    if (state.weight) els.weightInput.value = state.weight;
    if (state.goal) els.goalInput.value = state.goal;
}

function saveData() {
    const stored = localStorage.getItem('fitness_data') || '{}';
    const data = JSON.parse(stored);

    data[currentDate] = state;
    localStorage.setItem('fitness_data', JSON.stringify(data));
}

function populateFoodSelect() {
    while (els.foodSelect.options.length > 1) {
        els.foodSelect.remove(1);
    }
    for (const [key, val] of Object.entries(foodDB)) {
        const option = document.createElement('option');
        option.value = key;
        option.text = key.charAt(0).toUpperCase() + key.slice(1);
        els.foodSelect.add(option);
    }
}

function toggleStatsLock(locked) {
    els.weightInput.disabled = locked;
    els.goalInput.disabled = locked;
    if (els.editStatsBtn) {
        els.editStatsBtn.textContent = locked ? '✏️' : '💾';
    }
}

function setupEventListeners() {
    // Settings
    if (els.editStatsBtn) {
        els.editStatsBtn.addEventListener('click', () => {
            if (state.completed) return; // Prevent editing if completed
            const isLocked = els.weightInput.disabled;
            if (isLocked) {
                toggleStatsLock(false);
                els.weightInput.focus();
            } else {
                toggleStatsLock(true);
                saveData();
            }
        });
    }

    els.goalInput.addEventListener('change', (e) => {
        state.goal = parseInt(e.target.value);
        updateUI();
    });
    els.weightInput.addEventListener('change', (e) => {
        state.weight = parseInt(e.target.value);
        updateUI();
    });

    // Food Form Logic
    els.foodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            els.foodCustomInputs.classList.remove('hidden');
        } else {
            els.foodCustomInputs.classList.add('hidden');
        }
    });
    els.addFoodBtn.addEventListener('click', addFood);

    // Workout Form Logic
    els.workoutType.addEventListener('change', (e) => {
        if (e.target.value === 'cardio') {
            els.cardioInputs.classList.remove('hidden');
            els.strengthInputs.classList.add('hidden');
        } else {
            els.cardioInputs.classList.add('hidden');
            els.strengthInputs.classList.remove('hidden');
        }
    });
    els.addWorkoutBtn.addEventListener('click', addWorkout);

    // History Modal
    els.historyBtn.addEventListener('click', () => {
        renderHistory();
        els.historyModal.classList.remove('hidden');
    });
    els.closeHistory.addEventListener('click', () => {
        els.historyModal.classList.add('hidden');
    });
    window.addEventListener('click', (e) => {
        if (e.target === els.historyModal) {
            els.historyModal.classList.add('hidden');
        }
    });

    // Finish Day & Edit Mode
    if (els.finishDayBtn) {
        els.finishDayBtn.addEventListener('click', finishDay);
    }
    if (els.exitEditBtn) {
        els.exitEditBtn.addEventListener('click', exitEditMode);
    }

    // Bulk Workout Logic
    if (els.toggleBulkWorkoutBtn) {
        els.toggleBulkWorkoutBtn.addEventListener('click', toggleBulkWorkoutMode);
    }
    if (els.saveBulkWorkoutBtn) {
        els.saveBulkWorkoutBtn.addEventListener('click', saveBulkWorkout);
    }
}

// Actions
function finishDay() {
    const isEditing = !els.editingBanner.classList.contains('hidden');
    const msg = isEditing
        ? 'Save changes to this day?'
        : 'Are you sure you want to finish this day? You won\'t be able to edit it unless you go through History.';

    if (confirm(msg)) {
        state.completed = true;
        updateUI();
    }
}

function loadDay(date) {
    currentDate = date;
    loadData();

    // Unlock for editing
    state.completed = false;

    els.editingDate.textContent = date;
    els.editingBanner.classList.remove('hidden');
    els.historyModal.classList.add('hidden');

    updateUI();
}

function exitEditMode() {
    currentDate = getTodayStr();
    loadData();

    els.editingBanner.classList.add('hidden');
    updateUI();
}

function addFood() {
    if (state.completed) return;
    const type = els.foodSelect.value;
    const qty = parseFloat(els.foodQty.value) || 1;
    let name, unitCals;

    if (type === 'custom') {
        name = els.foodName.value;
        unitCals = parseInt(els.foodCals.value);

        // Save Custom Food
        if (els.saveCustomFood.checked && name && unitCals) {
            const key = name.toLowerCase().replace(/\s+/g, '_');
            state.customFoods[key] = unitCals;
            foodDB[key] = unitCals;
            populateFoodSelect();
            // Select the new item
            els.foodSelect.value = key;
            els.foodCustomInputs.classList.add('hidden');
        }

    } else {
        name = els.foodSelect.options[els.foodSelect.selectedIndex].text;
        unitCals = foodDB[type];
    }

    if (name && unitCals) {
        const totalCals = Math.round(unitCals * qty);
        state.food.push({ name, cals: totalCals, details: `${qty} x ${name}` });

        // Reset
        els.foodName.value = '';
        els.foodCals.value = '';
        els.foodQty.value = '1';
        els.saveCustomFood.checked = false;

        updateUI();
        triggerJudgement('food');
    }
}

function deleteFood(index) {
    if (state.completed) return;
    state.food.splice(index, 1);
    updateUI();
}

function addWorkout() {
    if (state.completed) return;
    const type = els.workoutType.value;
    const name = els.workoutName.value;
    let cals = 0;
    let details = '';
    let raw = {}; // Store raw data for duplication/editing

    if (!name) return;

    if (type === 'cardio') {
        const time = parseFloat(els.cardioTime.value) || 0; // mins
        const speed = parseFloat(els.cardioSpeed.value) || 0; // km/h
        const incline = parseFloat(els.cardioIncline.value) || 0; // %

        let met = 0;
        if (speed < 5) met = 3.5; // Walking
        else if (speed < 8) met = 8; // Jogging
        else met = 11.5; // Running

        met += incline * 0.1;

        const weight = state.weight || 70; // Default to 70 if not set for calc
        cals = Math.round(met * weight * (time / 60));
        details = `${time} mins @ ${speed}km/h, ${incline}% incline`;

        raw = { type, name, time, speed, incline };

        els.cardioTime.value = '';
        els.cardioSpeed.value = '';
        els.cardioIncline.value = '';

    } else {
        const sets = parseInt(els.strengthSets.value) || 0;
        const reps = parseInt(els.strengthReps.value) || 0;
        const weight = parseFloat(els.strengthWeight.value) || 0;
        const effort = els.strengthEffort.value;

        let met = 3.5;
        if (effort === 'medium') met = 5.0;
        if (effort === 'high') met = 6.0;
        if (effort === 'max') met = 8.0;

        const estimatedTimeMins = sets * 3;
        const userWeight = state.weight || 70;
        cals = Math.round(met * userWeight * (estimatedTimeMins / 60));

        details = `${sets} sets x ${reps} reps @ ${weight}kg (${effort} effort)`;

        raw = { type, name, sets, reps, weight, effort };

        els.strengthSets.value = '';
        els.strengthReps.value = '';
        els.strengthWeight.value = '';
        els.strengthEffort.value = 'medium';
    }

    if (cals > 0) {
        state.workouts.push({ name, cals, details, raw });
        els.workoutName.value = '';
        updateUI();
        triggerJudgement('workout');
    }
}

function deleteWorkout(index) {
    if (state.completed) return;
    state.workouts.splice(index, 1);
    updateUI();
}

function duplicateWorkout(index) {
    if (state.completed) return;
    const workout = state.workouts[index];
    if (!workout) return;

    let data = workout.raw;

    // Attempt to parse legacy data if raw is missing
    if (!data) {
        const details = workout.details;
        if (details.includes('sets x')) {
            // Strength: "3 sets x 10 reps @ 100kg (medium effort)"
            const match = details.match(/(\d+) sets x (\d+) reps @ ([\d.]+)kg \((.*) effort\)/);
            if (match) {
                data = {
                    type: 'strength',
                    name: workout.name,
                    sets: match[1],
                    reps: match[2],
                    weight: match[3],
                    effort: match[4]
                };
            }
        } else if (details.includes('mins @')) {
            // Cardio: "30 mins @ 10km/h, 2% incline"
            const match = details.match(/([\d.]+) mins @ ([\d.]+)km\/h, ([\d.]+)% incline/);
            if (match) {
                data = {
                    type: 'cardio',
                    name: workout.name,
                    time: match[1],
                    speed: match[2],
                    incline: match[3]
                };
            }
        }
    }

    if (data) {
        // Populate Form
        els.workoutType.value = data.type;
        els.workoutName.value = data.name;

        // Trigger change to show correct inputs
        els.workoutType.dispatchEvent(new Event('change'));

        if (data.type === 'cardio') {
            els.cardioTime.value = data.time;
            els.cardioSpeed.value = data.speed;
            els.cardioIncline.value = data.incline;
        } else {
            els.strengthSets.value = data.sets;
            els.strengthReps.value = data.reps;
            els.strengthWeight.value = data.weight;
            els.strengthEffort.value = data.effort;
        }

        // Scroll to form
        els.workoutName.scrollIntoView({ behavior: 'smooth', block: 'center' });
        els.workoutName.focus();
    } else {
        // Fallback if parsing fails
        const newWorkout = { ...workout };
        state.workouts.push(newWorkout);
        updateUI();
        triggerJudgement('workout');
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
        localStorage.removeItem('fitness_data');
        state.food = [];
        state.workouts = [];
        state.goal = null;
        state.weight = null;
        state.water = 0;
        state.customFoods = {};
        state.completed = false;

        els.weightInput.value = '';
        els.goalInput.value = '';

        currentDate = getTodayStr();
        updateUI();
        renderHistory();
        renderWater();
        populateFoodSelect(); // Reset to defaults
    }
}

function deleteDay(date) {
    if (confirm(`Delete history for ${date}?`)) {
        const stored = localStorage.getItem('fitness_data');
        if (stored) {
            const data = JSON.parse(stored);
            delete data[date];
            localStorage.setItem('fitness_data', JSON.stringify(data));

            // If deleting current view
            if (date === currentDate) {
                state.food = [];
                state.workouts = [];
                state.water = 0;
                state.completed = false;
                updateUI();
                renderWater();
            }

            renderHistory();
        }
    }
}

function toggleHistoryDetails(date) {
    const detailsEl = document.getElementById(`history-details-${date}`);
    const btnEl = document.getElementById(`history-toggle-${date}`);
    if (detailsEl.classList.contains('hidden')) {
        detailsEl.classList.remove('hidden');
        btnEl.textContent = 'Hide Details';
    } else {
        detailsEl.classList.add('hidden');
        btnEl.textContent = 'Show Details';
    }
}

function toggleWater(index) {
    if (state.completed) return;
    if (index < state.water) {
        state.water = index;
    } else {
        state.water = index + 1;
    }
    updateUI();
    renderWater();
}

// UI Updates
function updateUI() {
    saveData();

    const totalIn = state.food.reduce((acc, item) => acc + item.cals, 0);
    const totalOut = state.workouts.reduce((acc, item) => acc + item.cals, 0);
    const net = totalIn - totalOut;

    els.calsIn.textContent = totalIn;
    els.calsOut.textContent = totalOut;
    els.netCals.textContent = net;

    // Water Summary
    const waterVol = (state.water * 0.5).toFixed(1);
    els.waterSummary.textContent = `${waterVol}L`;

    const goal = state.goal || 2000;
    if (net > goal) {
        els.netCals.style.color = 'var(--error)';
    } else {
        els.netCals.style.color = 'var(--secondary)';
    }

    renderLists();

    // Handle Completed State
    const isEditing = !els.editingBanner.classList.contains('hidden');

    if (state.completed) {
        document.querySelectorAll('input, select, button:not(#history-btn):not(#exit-edit-btn)').forEach(el => {
            el.disabled = true;
        });
        // Re-enable specific buttons if needed, but mostly we want to lock everything
        // Except history button and exit button
        if (els.finishDayBtn) {
            els.finishDayBtn.textContent = isEditing ? "Changes Saved ✅" : "Day Finished ✅";
        }
    } else {
        document.querySelectorAll('input, select, button').forEach(el => {
            el.disabled = false;
        });
        // Re-apply stats lock if needed
        if (state.weight && state.goal) {
            toggleStatsLock(true);
        }
        if (els.finishDayBtn) {
            els.finishDayBtn.textContent = isEditing ? "💾 Save Changes" : "✅ Finish Day";
        }
    }
}

function renderLists() {
    els.foodList.innerHTML = state.food.map((item, index) => `
        <li class="log-item">
            <div>
                <div>${item.name}</div>
                <div class="log-details">${item.details}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${item.cals} kcal</span>
                <button class="delete-btn" onclick="window.deleteFood(${index})">&times;</button>
            </div>
        </li>
    `).join('');

    // Filter out 0-calorie workouts before rendering
    const validWorkouts = state.workouts.filter(w => w.cals > 0);
    els.workoutList.innerHTML = validWorkouts.map((item, originalIndex) => {
        // Find the original index in state.workouts for deletion
        const index = state.workouts.indexOf(item);
        return `
        <li class="log-item">
            <div>
                <div>${item.name}</div>
                <div class="log-details">${item.details}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>-${item.cals} kcal</span>
                <button class="icon-btn" onclick="window.duplicateWorkout(${index})" title="Duplicate Workout">📋</button>
                <button class="delete-btn" onclick="window.deleteWorkout(${index})">&times;</button>
            </div>
        </li>
    `}).join('');
}

function renderWater() {
    let html = '';
    for (let i = 0; i < 6; i++) {
        const isDrunk = i < state.water;
        html += `<div class="water-bottle ${isDrunk ? 'drunk' : ''}" onclick="window.toggleWater(${i})"></div>`;
    }
    els.waterTracker.innerHTML = html;
}

// Expose functions to window
window.deleteFood = deleteFood;
window.deleteWorkout = deleteWorkout;
window.duplicateWorkout = duplicateWorkout;
window.clearHistory = clearHistory;
window.toggleWater = toggleWater;
window.deleteDay = deleteDay;
window.toggleHistoryDetails = toggleHistoryDetails;
window.loadDay = loadDay;

function triggerJudgement(type) {
    const totalIn = state.food.reduce((acc, item) => acc + item.cals, 0);
    const totalOut = state.workouts.reduce((acc, item) => acc + item.cals, 0);
    const net = totalIn - totalOut;

    let mood = 'neutral';
    const goal = state.goal || 2000;

    if (net > goal + 500) {
        mood = 'bad';
    } else if (net < goal - 200) {
        mood = 'good';
    }

    const memeSet = memes[mood];
    const randomMeme = memeSet[Math.floor(Math.random() * memeSet.length)];

    els.judgementText.textContent = randomMeme;
    els.memeDisplay.innerHTML = ''; // No image
}

function showMotivation() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    els.motivationText.textContent = randomQuote;
}

function renderHistory() {
    const stored = localStorage.getItem('fitness_data');
    if (!stored) {
        els.historyList.innerHTML = '<p>No history yet.</p>';
        return;
    }

    const data = JSON.parse(stored);
    const days = Object.keys(data).sort().reverse();

    let html = '<button class="danger-btn" onclick="window.clearHistory()" style="margin-bottom: 15px; width: 100%;">Clear All History</button>';

    html += days.map(day => {
        const dayData = data[day];
        if (!dayData) return ''; // Safety check

        const food = dayData.food || [];
        const workouts = dayData.workouts || [];

        const totalIn = food.reduce((acc, item) => acc + (item.cals || 0), 0);
        const totalOut = workouts.reduce((acc, item) => acc + (item.cals || 0), 0);
        const net = totalIn - totalOut;
        const goal = dayData.goal || 2000;
        const water = dayData.water || 0;
        const isCompleted = dayData.completed ? '✅' : '';

        let rating = 'Neutral';
        let badgeClass = '';

        if (net > goal + 500) {
            rating = 'Over Budget';
            badgeClass = 'rating-bad';
        } else if (net < goal) {
            rating = 'Good';
            badgeClass = 'rating-good';
        }

        const foodList = dayData.food.map(f => `<div>${f.details} (${f.cals})</div>`).join('') || 'No food logged';
        const workoutList = dayData.workouts.map(w => `<div>${w.details} (-${w.cals})</div>`).join('') || 'No workouts logged';

        return `
            <div class="history-day">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>${day} ${isCompleted} <span class="rating-badge ${badgeClass}">${rating}</span></h4>
                    <div>
                        <button class="icon-btn" onclick="window.loadDay('${day}')" title="Edit Day">✏️</button>
                        <button class="delete-btn" onclick="window.deleteDay('${day}')" title="Delete Day">&times;</button>
                    </div>
                </div>
                <div class="summary-grid" style="font-size: 0.8rem;">
                    <div>In: ${totalIn}</div>
                    <div>Out: ${totalOut}</div>
                    <div>Net: ${net}</div>
                </div>
                <div style="text-align: center; margin-top: 5px; font-size: 0.8rem; color: var(--secondary);">
                    Water: ${water * 0.5}L
                </div>
                <button id="history-toggle-${day}" class="secondary-btn" style="width: 100%; margin-top: 5px; font-size: 0.8rem;" onclick="window.toggleHistoryDetails('${day}')">Show Details</button>
                <div id="history-details-${day}" class="hidden" style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                    <strong>Food:</strong>
                    <div style="margin-bottom: 5px;">${foodList}</div>
                    <strong>Workouts:</strong>
                    <div>${workoutList}</div>
                </div>
            </div>
        `;
    }).join('');

    els.historyList.innerHTML = html;
}

init();

// v1.1 Features Logic

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    if (els.datetimeDisplay) {
        els.datetimeDisplay.textContent = now.toLocaleDateString(undefined, options);
    }
}

function checkDate() {
    const newDate = getTodayStr();
    if (newDate !== currentDate) {
        // Day changed
        currentDate = newDate;
        loadData(); // This handles resetting state for new day
        updateUI();
        // Reset view to main if in history
        els.historyModal.classList.add('hidden');
        els.editingBanner.classList.add('hidden');
    }
}

function toggleBulkWorkoutMode() {
    const isBulk = !els.workoutBulkContainer.classList.contains('hidden');

    if (isBulk) {
        // Switch to Single
        els.workoutBulkContainer.classList.add('hidden');
        els.workoutSingleContainer.classList.remove('hidden');
        els.toggleBulkWorkoutBtn.textContent = 'Switch to Bulk Mode';
    } else {
        // Switch to Bulk
        // Populate textarea with current workouts
        const text = state.workouts.map(w => w.name + ': ' + w.details).join('\n');
        els.workoutBulkInput.value = text;

        els.workoutBulkContainer.classList.remove('hidden');
        els.workoutSingleContainer.classList.add('hidden');
        els.toggleBulkWorkoutBtn.textContent = 'Switch to Single Mode';
    }
}

function saveBulkWorkout() {
    if (state.completed) return;

    const text = els.workoutBulkInput.value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    const newWorkouts = [];

    for (const line of lines) {
        let data = null;
        let cals = 0;
        let name = 'Unknown Workout';
        let details = line;

        // Try to parse 'Name: Details'
        const parts = line.split(':');
        if (parts.length >= 2) {
            name = parts[0].trim();
            details = parts.slice(1).join(':').trim();

            if (details.includes('sets x')) {
                const match = details.match(/(\d+) sets x (\d+) reps @ ([\d.]+)kg \((.*) effort\)/);
                if (match) {
                    const sets = parseInt(match[1]);
                    const reps = parseInt(match[2]);
                    const weight = parseFloat(match[3]);
                    const effort = match[4];

                    let met = 3.5;
                    if (effort === 'medium') met = 5.0;
                    if (effort === 'high') met = 6.0;
                    if (effort === 'max') met = 8.0;

                    const estimatedTimeMins = sets * 3;
                    const userWeight = state.weight || 70;
                    cals = Math.round(met * userWeight * (estimatedTimeMins / 60));

                    data = { type: 'strength', name, sets, reps, weight, effort };
                    newWorkouts.push({ name, cals, details, raw: data });
                    continue;
                }
            } else if (details.includes('mins @')) {
                const match = details.match(/([\d.]+) mins @ ([\d.]+)km\/h, ([\d.]+)% incline/);
                if (match) {
                    const time = parseFloat(match[1]);
                    const speed = parseFloat(match[2]);
                    const incline = parseFloat(match[3]);

                    let met = 0;
                    if (speed < 5) met = 3.5;
                    else if (speed < 8) met = 8;
                    else met = 11.5;
                    met += incline * 0.1;

                    const weight = state.weight || 70;
                    cals = Math.round(met * weight * (time / 60));

                    data = { type: 'cardio', name, time, speed, incline };
                    newWorkouts.push({ name, cals, details, raw: data });
                    continue;
                }
            }
        }

        // Fallback - skip invalid entries
        console.warn(`Could not parse workout: "${line}"`);
    }

    if (newWorkouts.length === 0) {
        alert('No valid workouts found. Please check the format and try again.');
        return;
    }

    state.workouts = newWorkouts;
    updateUI();
    triggerJudgement('workout');

    // Clear input and switch back
    els.workoutBulkInput.value = '';
    toggleBulkWorkoutMode();
}
