const CONFIG = {
    // Настройки логирования
    DEBUG: false, // Включить подробное логирование для отладки (true = все логи, false = только ошибки и предупреждения)
    VERBOSE_LOGGING: false, // Включить подробное логирование парсинга (true = все логи парсинга, false = только основные)
    
    // Цвета
    PRIMARY_COLOR: '#E6DBCB',     // Основной цвет Т-Банк
    WARNING_COLOR: '#FF9800',    // Цвет предупреждения
    OVERDUE_COLOR: '#f44336',    // Цвет просроченных встреч
    
    // Размеры
    BADGE_WIDTH: 666,
    BADGE_HEIGHT: 170,
    BORDER_RADIUS: 30,
    
    // Информация о сотруднике
    EMPLOYEE_POSITION: 'PM',
    EMPLOYEE_NAME: 'Апалишин Марк',
    RESPONSIBILITY_AREAS: 'Платежная форма, Checkout',
    
    // Настройки новых бейджей
    BADGE_SPACING: 30,           // Отступ между бейджами
    POSITION_FONT_SIZE: 40,      // Размер шрифта должности
    NAME_FONT_SIZE: 40,          // Размер шрифта ФИО
    RESPONSIBILITY_FONT_SIZE: 40 // Размер шрифта зон ответственности
};

// Экспортируем конфигурацию
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
