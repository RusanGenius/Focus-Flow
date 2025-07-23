//
// ==================================
//          FOCUS FLOW
// ==================================
//

document.addEventListener('DOMContentLoaded', () => {

    /* ==============================
        1. CONFIG & ASSETS
    ============================== */

    // Dictionary for multi-language support
    const translations = {
        ru: {
            rewardText: '+{minutes} {unit}',
            minShort: 'м',
            secShort: 'с',
            infoText: `
                <h2>Добро пожаловать в Focus Flow!</h2>
                <p>Это приложение превращает вашу работу или учёбу в игру, помогая сохранять концентрацию.</p>
                
                <h3>Основной цикл</h3>
                <ol>
                    <li><b>Выполните задачу:</b> Напишите абзац текста, решите математическую задачу, завершите любой небольшой этап работы.</li>
                    <li><b>Нажмите "Верно":</b> Ваш шанс выиграть перерыв увеличится. Сразу после нажатия система проведёт розыгрыш.</li>
                    <li><b>Нажмите "Не верно":</b> Если допустили ошибку. Шанс на выигрыш уменьшится.</li>
                </ol>

                <h3>Система наград</h3>
                <p><b>Выигрыш:</b> Если вам повезло, вы получите перерыв! Длительность награды равна вашему текущему <b>Уровню</b> (например, Уровень 5 = 5 минут).</p>
                <p><b>Банк времени:</b> Всё накопленное в банке время автоматически добавится к вашей награде, когда вы выиграете. После этого банк обнулится.</p>
                <p><b>Сохранение:</b> Во время перерыва вы можете нажать "Сохранить", чтобы оставшееся время вернулось в банк для следующего большого перерыва.</p>

                <h3>Цель</h3>
                <p>Работать в сфокусированных интервалах и получать заслуженные, но случайные перерывы, чтобы сохранять мотивацию.</p>
            `,
            difficultyTitle: 'Выберите сложность', diffEasy: 'Легко (+1%)', diffMedium: 'Средне (+2.5%)', diffHard: 'Сложно (+5%)', diffVeryHard: 'Очень сложно (+10%)', setupTitle: 'Максимальное время награды', setupDesc: 'После достижения этого уровня, он сбросится до 1.', minutes: 'минут', start: 'Начать', level: 'Уровень', probability: 'Текущая вероятность', correct: 'Верно', incorrect: 'Не верно', saveTime: 'Сохранить оставшееся время', saved: 'Сохранено', settingsTitle: 'Настройки', theme: 'Тема:', themeLight: 'Светлая', themeDark: 'Тёмная', language: 'Язык:', soundLabel: 'Звук:', soundOn: 'Включить', soundOff: 'Выключить', contact: 'Связаться в Telegram', footer: 'Создал Русан'
        },
        en: {
            rewardText: '+{minutes} {unit}',
            minShort: 'm',
            secShort: 's',
            infoText: `
                <h2>Welcome to Focus Flow!</h2>
                <p>This app turns your work or study into a game to help you stay focused.</p>
                
                <h3>The Core Loop</h3>
                <ol>
                    <li><b>Complete a Task:</b> Write a paragraph, solve a math problem, finish any small work segment.</li>
                    <li><b>Press "Correct":</b> Your chance to win a break increases. The system will hold a lottery immediately.</li>
                    <li><b>Press "Incorrect":</b> If you made a mistake. Your chance of winning will decrease.</li>
                </ol>

                <h3>Reward System</h3>
                <p><b>Winning:</b> If you're lucky, you'll get a break! The reward duration equals your current <b>Level</b> (e.g., Level 5 = 5 minutes).</p>
                <p><b>Time Bank:</b> All your banked time is automatically added to your reward when you win. The bank is then cleared.</p>
                <p><b>Saving:</b> During a break, you can press "Save" to put the remaining time back into the bank for the next big break.</p>

                <h3>The Goal</h3>
                <p>Work in focused intervals and get well-deserved, random breaks to stay motivated.</p>
            `,
            difficultyTitle: 'Choose difficulty', diffEasy: 'Easy (+1%)', diffMedium: 'Medium (+2.5%)', diffHard: 'Hard (+5%)', diffVeryHard: 'Very Hard (+10%)', setupTitle: 'Max Reward Time', setupDesc: 'After reaching this level, it will reset to 1.', minutes: 'minutes', start: 'Start', level: 'Level', probability: 'Current probability', correct: 'Correct', incorrect: 'Incorrect', saveTime: 'Save remaining time', saved: 'Saved', settingsTitle: 'Settings', theme: 'Theme:', themeLight: 'Light', themeDark: 'Dark', language: 'Language:', soundLabel: 'Sound:', soundOn: 'Enable', soundOff: 'Disable', contact: 'Contact via Telegram', footer: 'Created by Rusan'
        }
    };
    
    // Audio assets
    const correctSound = new Audio('assets/correct-sound.mp3');
    const incorrectSound = new Audio('assets/incorrect-sound.mp3');

    /* ==============================
        2. DOM ELEMENT CACHE
    ============================== */

    // Caching all DOM elements for performance and easy access
    const elements = {
        screens: { difficulty: document.getElementById('difficulty-screen'), setup: document.getElementById('setup-screen'), main: document.getElementById('main-screen') },
        buttons: {
            difficulty: document.querySelectorAll('.difficulty-buttons .btn'), start: document.getElementById('start-btn'), correct: document.getElementById('correct-btn'), incorrect: document.getElementById('incorrect-btn'), saveTime: document.getElementById('save-time-btn'), settingsTriggers: document.querySelectorAll('.settings-btn-trigger'), infoTriggers: document.querySelectorAll('.info-btn-trigger'), closeSettingsModal: document.getElementById('close-settings-modal-btn'), closeInfoModal: document.getElementById('close-info-modal-btn'), themeToggle: document.getElementById('theme-toggle-btn'), languageToggle: document.getElementById('language-toggle-btn'), soundToggle: document.getElementById('sound-toggle-btn'),
        },
        displays: { level: document.getElementById('level-display'), probability: document.getElementById('probability-text'), progressBar: document.getElementById('progress-bar-fill'), savedTime: document.getElementById('saved-time-display'), timer: document.getElementById('timer-display'), timerProgress: document.getElementById('timer-progress-bar'), rewardText: document.getElementById('reward-text'), historyContainer: document.getElementById('history-container') },
        inputs: { maxLevel: document.getElementById('max-level-input') },
        modals: { settings: document.getElementById('settings-modal'), info: document.getElementById('info-modal') },
        other: { body: document.body, footer: document.getElementById('footer'), timerSection: document.getElementById('timer-section'), mainControls: document.getElementById('main-controls'), mainPlatform: document.getElementById('main-platform') }
    };

    /* ==============================
        3. APPLICATION STATE
    ============================== */

    // A single object to hold the entire state of the application
    let state = {
        language: 'ru', isSoundEnabled: true, difficulty: 1, maxLevel: 10, currentLevel: 1, currentProbability: 0, correctStreak: 0, savedTimeInSeconds: 0, isBreakActive: false, timerInterval: null, breakDurationInSeconds: 0, breakRemainingSeconds: 0, history: [],
        lastWonMinutes: 0 // Tracks the last reward amount for on-the-fly translation
    };

    /* ==============================
        4. CORE LOGIC & FUNCTIONS
    ============================== */

    /**
     * Switches the currently visible screen.
     * @param {string} screenName - The key of the screen to activate ('difficulty', 'setup', 'main').
     */
    function switchScreen(screenName) {
        Object.values(elements.screens).forEach(screen => screen.classList.remove('active'));
        elements.screens[screenName].classList.add('active');
    }

    /**
     * The main function for winning a reward.
     * @returns {boolean} - True if a reward was won, otherwise false.
     */
    function rollForReward() {
        const roll = Math.random() * 100;
        if (roll <= state.currentProbability) {
            triggerGlow('success');
            playSound(correctSound);
            startBreak(state.currentLevel);
            state.currentProbability = 0;
            state.correctStreak = 0;
            if (state.currentLevel >= state.maxLevel) {
                state.currentLevel = 1;
            } else {
                state.currentLevel++;
            }
            return true;
        }
        return false;
    }
    
    /**
     * Starts the break timer, combining won time with banked time.
     * @param {number} wonMinutes - The number of minutes just won from the level.
     */
    function startBreak(wonMinutes) {
        state.isBreakActive = true;
        state.lastWonMinutes = wonMinutes;

        const wonTimeInSeconds = wonMinutes * 60;
        const totalBreakTimeInSeconds = wonTimeInSeconds + state.savedTimeInSeconds;
        
        state.savedTimeInSeconds = 0;
        state.breakDurationInSeconds = totalBreakTimeInSeconds;
        state.breakRemainingSeconds = totalBreakTimeInSeconds;
        
        updateRewardText(); // Update the notification text
        elements.other.mainControls.classList.add('hidden');
        elements.other.timerSection.classList.remove('hidden');

        const tick = () => {
            state.breakRemainingSeconds--;
            elements.displays.timer.textContent = formatTime(state.breakRemainingSeconds);
            const progressPercentage = (state.breakDurationInSeconds > 0) ? (state.breakRemainingSeconds / state.breakDurationInSeconds) * 100 : 0;
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
     * Ends the current break, clearing the interval and switching UI back.
     */
    function endBreak() { 
        clearInterval(state.timerInterval); 
        state.isBreakActive = false; 
        state.lastWonMinutes = 0;
        elements.other.timerSection.classList.add('hidden'); 
        elements.other.mainControls.classList.remove('hidden'); 
        updateUI(); 
    }

    /* ==============================
        5. UI & STATE MANAGEMENT
    ============================== */

    /**
     * Updates all visible UI elements based on the current state.
     */
    function updateUI() {
        const dict = translations[state.language];
        
        // Update texts with dynamic values
        elements.displays.level.textContent = `${dict.level}: ${state.currentLevel}`;
        const prob = Math.round(state.currentProbability * 10) / 10;
        elements.displays.probability.textContent = `${prob}%`;
        const minutes = Math.floor(state.savedTimeInSeconds / 60);
        const seconds = state.savedTimeInSeconds % 60;
        elements.displays.savedTime.textContent = `${dict.saved}: ${minutes}${dict.minShort} ${seconds}${dict.secShort}`;

        // Update progress bar
        elements.displays.progressBar.style.width = `${Math.min(state.currentProbability, 100)}%`;

        // Update button states
        elements.buttons.correct.disabled = state.isBreakActive;
        elements.buttons.incorrect.disabled = state.isBreakActive;

        renderHistory();
    }

    /**
     * Renders the history dots based on the state.history array.
     */
    function renderHistory() {
        elements.displays.historyContainer.innerHTML = '';
        state.history.slice(0, 75).forEach(status => {
            const dot = document.createElement('div');
            dot.className = `history-dot ${status}`;
            elements.displays.historyContainer.appendChild(dot);
        });
    }

    /**
     * Sets the application language and updates all text elements.
     * @param {string} lang - The language to switch to ('ru' or 'en').
     */
    function setLanguage(lang) {
        state.language = lang;
        document.documentElement.lang = lang;
        const dict = translations[lang];

        // Translate all elements with a data-lang-key attribute
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (dict[key]) {
                // Use innerHTML for keys that contain HTML tags
                const isHtml = /<[a-z][\s\S]*>/i.test(dict[key]);
                if (isHtml) { el.innerHTML = dict[key]; } else { el.textContent = dict[key]; }
            }
        });

        // Update buttons that don't use data-lang-key
        elements.buttons.languageToggle.textContent = lang === 'ru' ? 'English' : 'Русский';
        const themeKey = elements.other.body.classList.contains('dark-theme') ? 'themeLight' : 'themeDark';
        elements.buttons.themeToggle.textContent = dict[themeKey];
        const soundKey = state.isSoundEnabled ? 'soundOff' : 'soundOn';
        elements.buttons.soundToggle.textContent = dict[soundKey];

        // Instantly re-translate dynamic texts
        if (state.isBreakActive) {
            updateRewardText();
        }
        updateUI();
    }

    /**
     * Updates the reward text notification based on the current language and last won minutes.
     */
    function updateRewardText() {
        const dict = translations[state.language];
        const unit = getMinutesString(state.lastWonMinutes);
        elements.displays.rewardText.textContent = dict.rewardText
            .replace('{minutes}', state.lastWonMinutes)
            .replace('{unit}', unit);
    }
    
    /* ==============================
        6. HELPER & UTILITY FUNCTIONS
    ============================== */

    function vibrate(ms) { if ('vibrate' in navigator) navigator.vibrate(ms); }
    function playSound(sound) { if (state.isSoundEnabled) { sound.currentTime = 0; sound.play().catch(e => console.error("Audio play failed:", e)); } }
    function triggerGlow(type) { const platform = elements.other.mainPlatform; const className = type === 'success' ? 'glow-success' : 'glow-fail'; platform.classList.add(className); setTimeout(() => platform.classList.remove(className), 600); }
    function formatTime(seconds) { const mins = Math.floor(seconds / 60).toString().padStart(2, '0'); const secs = (seconds % 60).toString().padStart(2, '0'); return `${mins}:${secs}`; }
    function getMinutesString(minutes) { if (state.language === 'en') return minutes === 1 ? 'minute' : 'minutes'; const lastDigit = minutes % 10, lastTwoDigits = minutes % 100; if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'минут'; if (lastDigit === 1) return 'минута'; if ([2, 3, 4].includes(lastDigit)) return 'минуты'; return 'минут'; }
    
    /* ==============================
        7. EVENT LISTENERS
    ============================== */
    
    // --- Screen Navigation ---
    elements.buttons.difficulty.forEach(button => { button.addEventListener('click', () => { state.difficulty = parseFloat(button.dataset.difficulty); switchScreen('setup'); }); });
    elements.buttons.start.addEventListener('click', () => {
        const maxLevelValue = parseInt(elements.inputs.maxLevel.value, 10);
        // Enforce max value of 300
        if (maxLevelValue > 0) state.maxLevel = Math.min(maxLevelValue, 300);
        switchScreen('main');
    });

    // --- Main Game Controls ---
    elements.buttons.correct.addEventListener('click', () => {
        if (state.isBreakActive) return;
        vibrate(50);
        state.history.unshift('correct');
        state.currentProbability += state.difficulty;
        state.correctStreak++;
        if (state.correctStreak > 0 && state.correctStreak % 4 === 0) state.currentProbability += 5;
        const won = rollForReward();
        if (!won) playSound(correctSound);
        updateUI();
    });

    elements.buttons.incorrect.addEventListener('click', () => {
        if (state.isBreakActive) return;
        vibrate(75);
        state.history.unshift('incorrect');
        playSound(incorrectSound);
        triggerGlow('fail');
        state.correctStreak = 0;
        state.currentProbability /= 2;
        updateUI();
    });
    
    elements.buttons.saveTime.addEventListener('click', () => { 
        state.savedTimeInSeconds += state.breakRemainingSeconds; 
        endBreak(); 
    });
    
    // --- Modals & Settings ---
    elements.buttons.settingsTriggers.forEach(btn => btn.addEventListener('click', () => elements.modals.settings.classList.remove('hidden')));
    elements.buttons.infoTriggers.forEach(btn => btn.addEventListener('click', () => elements.modals.info.classList.remove('hidden')));
    elements.buttons.closeSettingsModal.addEventListener('click', () => elements.modals.settings.classList.add('hidden'));
    elements.buttons.closeInfoModal.addEventListener('click', () => elements.modals.info.classList.add('hidden'));
    
    elements.buttons.themeToggle.addEventListener('click', () => { elements.other.body.classList.toggle('light-theme'); elements.other.body.classList.toggle('dark-theme'); setLanguage(state.language); });
    elements.buttons.languageToggle.addEventListener('click', () => { const newLang = state.language === 'ru' ? 'en' : 'ru'; setLanguage(newLang); });
    elements.buttons.soundToggle.addEventListener('click', () => { state.isSoundEnabled = !state.isSoundEnabled; setLanguage(state.language); });

    /* ==============================
        8. INITIALIZATION
    ============================== */
    setLanguage('ru');
});