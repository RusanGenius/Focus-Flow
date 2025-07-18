document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DICTIONARY & ASSETS ---
    const translations = {
        ru: { rewardText: '+{minutes} {unit}', difficultyTitle: 'Выберите сложность', diffEasy: 'Легко (+1%)', diffMedium: 'Средне (+2.5%)', diffHard: 'Сложно (+5%)', diffVeryHard: 'Очень сложно (+10%)', setupTitle: 'Максимальное время награды', setupDesc: 'После достижения этого уровня, он сбросится до 1.', minutes: 'минут', start: 'Начать', level: 'Уровень', probability: 'Текущая вероятность', correct: 'Верно', incorrect: 'Не верно', saveTime: 'Сохранить оставшееся время', saved: 'Сохранено', settingsTitle: 'Настройки', theme: 'Тема:', themeLight: 'Светлая', themeDark: 'Тёмная', language: 'Язык:', soundLabel: 'Звук:', soundOn: 'Включить', soundOff: 'Выключить', contact: 'Связаться в Telegram', footer: 'Создал Русан' },
        en: { rewardText: '+{minutes} {unit}', difficultyTitle: 'Choose difficulty', diffEasy: 'Easy (+1%)', diffMedium: 'Medium (+2.5%)', diffHard: 'Hard (+5%)', diffVeryHard: 'Very Hard (+10%)', setupTitle: 'Max Reward Time', setupDesc: 'After reaching this level, it will reset to 1.', minutes: 'minutes', start: 'Start', level: 'Level', probability: 'Current probability', correct: 'Correct', incorrect: 'Incorrect', saveTime: 'Save remaining time', saved: 'Saved', settingsTitle: 'Settings', theme: 'Theme:', themeLight: 'Light', themeDark: 'Dark', language: 'Language:', soundLabel: 'Sound:', soundOn: 'Enable', soundOff: 'Disable', contact: 'Contact via Telegram', footer: 'Created by Rusan' }
    };
    
    const correctSound = new Audio('assets/correct-sound.mp3');
    const incorrectSound = new Audio('assets/incorrect-sound.mp3');

    // --- 2. DOM ELEMENTS ---
    const elements = {
        screens: { difficulty: document.getElementById('difficulty-screen'), setup: document.getElementById('setup-screen'), main: document.getElementById('main-screen') },
        buttons: {
            difficulty: document.querySelectorAll('.difficulty-buttons .btn'), start: document.getElementById('start-btn'), correct: document.getElementById('correct-btn'), incorrect: document.getElementById('incorrect-btn'), saveTime: document.getElementById('save-time-btn'), settingsTriggers: document.querySelectorAll('.settings-btn-trigger'), closeModal: document.getElementById('close-modal-btn'), themeToggle: document.getElementById('theme-toggle-btn'), languageToggle: document.getElementById('language-toggle-btn'), soundToggle: document.getElementById('sound-toggle-btn'),
        },
        displays: { level: document.getElementById('level-display'), probability: document.getElementById('probability-text'), progressBar: document.getElementById('progress-bar-fill'), savedTime: document.getElementById('saved-time-display'), timer: document.getElementById('timer-display'), timerProgress: document.getElementById('timer-progress-bar'), rewardText: document.getElementById('reward-text') },
        inputs: { maxLevel: document.getElementById('max-level-input') },
        modals: { settings: document.getElementById('settings-modal') },
        other: { body: document.body, footer: document.getElementById('footer'), timerSection: document.getElementById('timer-section'), mainControls: document.getElementById('main-controls'), mainPlatform: document.getElementById('main-platform') }
    };

    // --- 3. APPLICATION STATE ---
    let state = {
        language: 'ru',
        isSoundEnabled: true,
        difficulty: 1,
        maxLevel: 10,
        currentLevel: 1,
        currentProbability: 0,
        correctStreak: 0,
        savedTimeInSeconds: 0,
        isBreakActive: false,
        timerInterval: null,
        breakDurationInSeconds: 0,
        breakRemainingSeconds: 0,
    };

    // --- 4. CORE FUNCTIONS ---

    /**
     * Shows the specified screen and hides others.
     * @param {string} screenName - 'difficulty', 'setup', or 'main'
     */
    function switchScreen(screenName) {
        Object.values(elements.screens).forEach(screen => screen.classList.remove('active'));
        elements.screens[screenName].classList.add('active');
    }

    /**
     * Applies the selected language to all relevant UI elements.
     * @param {string} lang - 'ru' or 'en'
     */
    function setLanguage(lang) {
        state.language = lang;
        document.documentElement.lang = lang;
        const dict = translations[lang];

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        elements.buttons.languageToggle.textContent = lang === 'ru' ? 'English' : 'Русский';
        elements.other.footer.textContent = dict.footer;
        
        const themeKey = elements.other.body.classList.contains('dark-theme') ? 'themeLight' : 'themeDark';
        elements.buttons.themeToggle.textContent = dict[themeKey];

        const soundKey = state.isSoundEnabled ? 'soundOff' : 'soundOn';
        elements.buttons.soundToggle.textContent = dict[soundKey];

        updateUI();
    }

    function updateUI() {
        const dict = translations[state.language];
        elements.displays.level.textContent = `${dict.level}: ${state.currentLevel}`;
        
        const prob = Math.round(state.currentProbability * 10) / 10;
        elements.displays.probability.textContent = `${prob}%`;
        elements.displays.progressBar.style.width = `${Math.min(state.currentProbability, 100)}%`;
        
        const minutes = Math.floor(state.savedTimeInSeconds / 60);
        const seconds = state.savedTimeInSeconds % 60;
        elements.displays.savedTime.textContent = `${dict.saved}: ${minutes}м ${seconds}с`;

        elements.buttons.correct.disabled = state.isBreakActive;
        elements.buttons.incorrect.disabled = state.isBreakActive;
    }

    /**
     * Handles the reward roll. If successful, starts a break.
     */
    function rollForReward() {
        const roll = Math.random() * 100;
        if (roll <= state.currentProbability) {
            triggerGlow('success');
            playSound(correctSound);
            const rewardMinutes = state.currentLevel;
            startBreak(rewardMinutes);

            state.currentProbability = 0;
            state.correctStreak = 0;

            if (state.currentLevel >= state.maxLevel) {
                state.currentLevel = 1;
            } else {
                state.currentLevel++;
            }
            return true; // Indicates a win
        }
        return false; // Indicates no win
    }

    /**
     * Starts the break timer.
     * @param {number} minutes - The duration of the break in minutes.
     */
    function startBreak(minutes) {
        state.isBreakActive = true;
        state.breakDurationInSeconds = minutes * 60;
        state.breakRemainingSeconds = state.breakDurationInSeconds;
        
        const unit = getMinutesString(minutes);
        elements.displays.rewardText.textContent = translations[state.language].rewardText.replace('{minutes}', minutes).replace('{unit}', unit);

        elements.other.mainControls.classList.add('hidden');
        elements.other.timerSection.classList.remove('hidden');

        const tick = () => {
            state.breakRemainingSeconds--;
            elements.displays.timer.textContent = formatTime(state.breakRemainingSeconds);
            const progressPercentage = (state.breakRemainingSeconds / state.breakDurationInSeconds) * 100;
            elements.displays.timerProgress.style.width = `${progressPercentage}%`;

            if (state.breakRemainingSeconds <= 0) {
                endBreak();
            }
        };

        tick();
        state.timerInterval = setInterval(tick, 1000);
        updateUI();
    }

    /**
     * Ends the current break.
     */
    function endBreak() {
        clearInterval(state.timerInterval);
        state.isBreakActive = false;
        elements.other.timerSection.classList.add('hidden');
        elements.other.mainControls.classList.remove('hidden');
        updateUI();
    }
    
    // --- 5. HELPER & UTILITY FUNCTIONS ---

    function vibrate(ms) { if ('vibrate' in navigator) navigator.vibrate(ms); }
    function playSound(sound) { if (state.isSoundEnabled) { sound.currentTime = 0; sound.play().catch(e => console.error("Audio play failed:", e)); } }
    function triggerGlow(type) {
        const platform = elements.other.mainPlatform;
        const className = type === 'success' ? 'glow-success' : 'glow-fail';
        platform.classList.add(className);
        setTimeout(() => platform.classList.remove(className), 600);
    }
    function formatTime(seconds) { const mins = Math.floor(seconds / 60).toString().padStart(2, '0'); const secs = (seconds % 60).toString().padStart(2, '0'); return `${mins}:${secs}`; }
    function getMinutesString(minutes) {
        if (state.language === 'en') return minutes === 1 ? 'minute' : 'minutes';
        const lastDigit = minutes % 10, lastTwoDigits = minutes % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'минут';
        if (lastDigit === 1) return 'минута';
        if ([2, 3, 4].includes(lastDigit)) return 'минуты';
        return 'минут';
    }
    
    // --- 6. EVENT LISTENERS ---

    // Navigation and Setup
    elements.buttons.difficulty.forEach(button => { button.addEventListener('click', () => { state.difficulty = parseFloat(button.dataset.difficulty); switchScreen('setup'); }); });
    elements.buttons.start.addEventListener('click', () => { const maxLevelValue = parseInt(elements.inputs.maxLevel.value, 10); if (maxLevelValue > 0) state.maxLevel = maxLevelValue; switchScreen('main'); updateUI(); });

    // Main Game Loop
    elements.buttons.correct.addEventListener('click', () => {
        if (state.isBreakActive) return;
        vibrate(50);
        state.currentProbability += state.difficulty;
        state.correctStreak++;
        if (state.correctStreak > 0 && state.correctStreak % 4 === 0) state.currentProbability += 5;
        
        const won = rollForReward();
        if (!won) playSound(correctSound); // Play regular sound only if no reward was won
        
        updateUI();
    });

    elements.buttons.incorrect.addEventListener('click', () => {
        if (state.isBreakActive) return;
        vibrate(75);
        playSound(incorrectSound);
        triggerGlow('fail');
        state.correctStreak = 0;
        state.currentProbability /= 2;
        updateUI();
    });
    
    // Timer Controls
    elements.buttons.saveTime.addEventListener('click', () => { state.savedTimeInSeconds += state.breakRemainingSeconds; endBreak(); });
    
    // Settings Modal
    elements.buttons.settingsTriggers.forEach(btn => btn.addEventListener('click', () => elements.modals.settings.classList.remove('hidden')));
    elements.buttons.closeModal.addEventListener('click', () => elements.modals.settings.classList.add('hidden'));

    // Settings Controls
    elements.buttons.themeToggle.addEventListener('click', () => { elements.other.body.classList.toggle('light-theme'); elements.other.body.classList.toggle('dark-theme'); setLanguage(state.language); });
    elements.buttons.languageToggle.addEventListener('click', () => { const newLang = state.language === 'ru' ? 'en' : 'ru'; setLanguage(newLang); });
    elements.buttons.soundToggle.addEventListener('click', () => { state.isSoundEnabled = !state.isSoundEnabled; setLanguage(state.language); });

    // --- 7. INITIALIZATION ---
    setLanguage('ru');
});
