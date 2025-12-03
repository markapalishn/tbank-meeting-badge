// Упрощенная система логирования
const logger = {
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    debug: (...args) => {
        if (window.CONFIG?.DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    },
    verbose: (...args) => {
        if (window.CONFIG?.VERBOSE_LOGGING) {
            console.log('[VERBOSE]', ...args);
        }
    }
};

class MeetingTimer {
    constructor() {
        this.currentMeeting = null;
        this.nextMeeting = null;
        this.isConnected = false;
        this.updateInterval = null;

        this.initializeElements();
        // В ветке main-without-calendar функционал календаря отключен.
        // Показываем только дефолтное состояние без загрузки событий.
        this.showDefaultState();
    }
    
    initializeElements() {
        this.elements = {
            currentTimer: document.getElementById('currentTimer'),
            nextCountdown: document.getElementById('nextCountdown'),
            meetingTitle: document.querySelector('.meeting-title'),
            employeeInfo: document.getElementById('employeeInfo'),
            positionBadge: document.getElementById('positionBadge'),
            nameBadge: document.getElementById('nameBadge'),
            responsibilityAreas: document.getElementById('responsibilityAreas')
        };
    }
    
    hideBadge() {
        // Скрываем лоадер
        this.hideLoader();
        
        // Показываем логотип компании когда встреч нет
        document.getElementById('meetingBadge').style.display = 'none';
        document.getElementById('companyLogo').style.display = 'flex';
        // Показываем информацию о сотруднике всегда
        this.elements.employeeInfo.style.display = 'flex';
        this.elements.responsibilityAreas.style.display = 'block';
        logger.info('Нет встреч - показываем логотип компании и информацию о сотруднике');
    }
    
    showBadge() {
        // Показываем бейдж с информацией о встречах
        document.getElementById('meetingBadge').style.display = 'flex';
        document.getElementById('companyLogo').style.display = 'none';
        // Показываем информацию о сотруднике
        this.elements.employeeInfo.style.display = 'flex';
        this.elements.responsibilityAreas.style.display = 'block';
        logger.info('Есть встречи - показываем бейдж');
    }

    showDefaultState() {
        // Скрываем лоадер и бейдж встречи, показываем логотип и информацию о сотруднике
        this.hideLoader();
        
        const meetingBadge = document.getElementById('meetingBadge');
        const companyLogo = document.getElementById('companyLogo');

        if (meetingBadge) {
            meetingBadge.style.display = 'none';
        }
        if (companyLogo) {
            companyLogo.style.display = 'flex';
        }

        if (this.elements.employeeInfo) {
            this.elements.employeeInfo.style.display = 'flex';
        }
        if (this.elements.responsibilityAreas) {
            this.elements.responsibilityAreas.style.display = 'block';
        }

        if (this.elements.meetingTitle) {
            this.elements.meetingTitle.textContent = 'Free-time';
        }
        if (this.elements.currentTimer) {
            this.elements.currentTimer.textContent = 'Free-time';
            this.elements.currentTimer.className = 'timer';
        }
        if (this.elements.nextCountdown) {
            this.elements.nextCountdown.textContent = 'нет';
        }

        this.updateEmployeeInfo();
        logger.info('Календарь отключен: отображается только дефолтное состояние');
    }
    
    updateEmployeeInfo() {
        // Обновляем информацию о сотруднике из конфигурации
        if (this.elements.positionBadge) {
            this.elements.positionBadge.textContent = window.CONFIG.EMPLOYEE_POSITION;
        }
        if (this.elements.nameBadge) {
            this.elements.nameBadge.textContent = window.CONFIG.EMPLOYEE_NAME;
        }
        if (this.elements.responsibilityAreas) {
            this.elements.responsibilityAreas.textContent = window.CONFIG.RESPONSIBILITY_AREAS;
        }
    }
    
    
    // Таймеры и фоновые обновления календаря в этой ветке не используются.
    startTimer() {}
    
    stopTimer() {}
    
    // Принудительное обновление календаря
    refreshCalendar() {
        // В ветке main-without-calendar функционал календаря отключен.
        // Просто поддерживаем дефолтное состояние без загрузки данных.
        logger.info('refreshCalendar вызван, но календарь отключен (main-without-calendar)');
        this.showDefaultState();
    }
    
    showLoader() {
        // Скрываем бейдж встречи и показываем лоадер
        const meetingBadge = document.getElementById('meetingBadge');
        const loader = document.getElementById('loader');
        
        if (meetingBadge) {
            meetingBadge.style.display = 'none';
        }
        if (loader) {
            loader.style.display = 'flex';
            logger.info('🔄 Лоадер показан');
        } else {
            logger.warn('❌ Лоадер не найден');
        }
    }
    
    hideLoader() {
        // Скрываем лоадер и показываем бейдж встречи
        const meetingBadge = document.getElementById('meetingBadge');
        const loader = document.getElementById('loader');
        
        if (loader) {
            loader.style.display = 'none';
        }
        if (meetingBadge) {
            meetingBadge.style.display = 'flex';
        }
        logger.info('✅ Лоадер скрыт');
    }
    
    
    // Принудительное обновление для OBS
    forceOBSRefresh() {
        // В ветке main-without-calendar просто обновляем дефолтное состояние.
        logger.info('forceOBSRefresh вызван, но календарь отключен (main-without-calendar)');
        this.showDefaultState();
    }
    
    // Логика динамических таймеров и прогресса встречи в этой ветке удалена.
    updateTimers() {}
    
}

// Инициализация при загрузке страницы
let meetingTimer;
document.addEventListener('DOMContentLoaded', () => {
    // Определяем, запущено ли в OBS с более строгими проверками
    const isOBS = detectOBSEnvironment();
    
    if (isOBS) {
        document.body.classList.add('obs-mode');
    }
    
    // Функция для точной детекции OBS
    function detectOBSEnvironment() {
        const urlCheck = window.location.href.includes('obs') || window.location.href.includes('obs-studio');
        const userAgentCheck = window.navigator.userAgent.includes('OBS') || window.navigator.userAgent.includes('obs-studio');
        const iframeCheck = window.parent !== window && (
            (window.frameElement && window.frameElement.id?.includes('obs')) ||
            (document.referrer && (document.referrer.includes('localhost') || document.referrer.includes('127.0.0.1')))
        );
        
        const checks = [urlCheck, userAgentCheck, iframeCheck];
        return checks.filter(check => check).length >= 2 && (userAgentCheck || iframeCheck);
    }

    meetingTimer = new MeetingTimer();
});

// Остановка таймеров при закрытии страницы
window.addEventListener('beforeunload', () => {
    if (meetingTimer) {
        meetingTimer.stopTimer();
    }
});

// Обработка сообщений от OBS
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'refresh') {
        if (meetingTimer) {
            meetingTimer.refreshCalendar();
        }
    }
});


// Обработка горячих клавиш для обновления
document.addEventListener('keydown', (event) => {
    // F5 - обновить календарь
    if (event.key === 'F5') {
        event.preventDefault();
        if (meetingTimer) {
            meetingTimer.refreshCalendar();
        }
    }
    // Ctrl+R - обновить календарь
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        if (meetingTimer) {
            meetingTimer.refreshCalendar();
        }
    }
});

// Глобальные функции для обновления календаря (можно вызвать из консоли)
window.refreshCalendar = () => {
    if (meetingTimer) {
        meetingTimer.refreshCalendar();
    }
};


window.forceOBSRefresh = () => {
    if (meetingTimer) {
        meetingTimer.forceOBSRefresh();
    }
};

