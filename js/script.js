document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    
    // Создаем окна
    const block1 = createWindow('block1', 'Параметры');
    const block2 = createWindow('block2', 'Схема');
    const block3 = createWindow('block3', 'Расчет');
    
    // Контейнер для правых блоков
    const rightContainer = document.createElement('div');
    rightContainer.id = 'right-container';
    rightContainer.appendChild(block2);
    rightContainer.appendChild(block3);
    
    app.appendChild(block1);
    app.appendChild(rightContainer);
    
    // Загружаем конфигурацию и блоки
    loadConfig().then(() => {
        console.log('Конфиг загружен:', window.roomConfig);
        // Загружаем tooltips.js после конфига
        return loadTooltips();
    }).then(() => {
        console.log('Tooltips загружены');
        // Затем загружаем блоки
        loadBlockContent(1);
        loadBlockContent(2);
        loadBlockContent(3);
    }).catch(error => {
        console.error('Ошибка загрузки:', error);
    });
    
    function createWindow(id, title) {
        const window = document.createElement('div');
        window.id = id;
        window.className = 'window';
        
        const header = document.createElement('div');
        header.className = 'window-header';
        header.textContent = title;
        
        const content = document.createElement('div');
        content.className = 'window-content';
        content.id = `${id}-content`;
        
        window.appendChild(header);
        window.appendChild(content);
        
        return window;
    }
    
    function loadConfig() {
        return new Promise((resolve, reject) => {
            if (window.roomConfig) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'config/room-config.js';
            script.onload = () => {
                console.log('room-config.js загружен');
                // Даем время на выполнение скрипта
                setTimeout(() => {
                    if (!window.roomConfig) {
                        console.warn('window.roomConfig не определен после загрузки скрипта');
                        window.roomConfig = {};
                    }
                    resolve();
                }, 100);
            };
            script.onerror = () => {
                console.error('Ошибка загрузки room-config.js');
                window.roomConfig = {};
                resolve(); // Все равно разрешаем, чтобы продолжить
            };
            document.head.appendChild(script);
        });
    }
    
    function loadTooltips() {
        return new Promise((resolve) => {
            if (window.TooltipManager) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'js/tooltips.js';
            script.onload = () => {
                console.log('tooltips.js загружен');
                resolve();
            };
            script.onerror = () => {
                console.warn('Не удалось загрузить tooltips.js');
                resolve(); // Продолжаем даже без tooltips
            };
            document.head.appendChild(script);
        });
    }
    
    function loadBlockContent(blockNumber) {
        console.log(`Загрузка block${blockNumber}.js`);
        const script = document.createElement('script');
        script.src = `js/blocks/block${blockNumber}.js`;
        script.onerror = () => {
            console.error(`Ошибка загрузки block${blockNumber}.js`);
        };
        document.head.appendChild(script);
    }
});
