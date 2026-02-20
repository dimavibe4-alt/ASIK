// Блок 1: Параметры
(function() {
    // Ждем события blocksReady
    window.addEventListener('blocksReady', function() {
        const blockContent = document.getElementById('block1-content');
        if (!blockContent) return;
        
        // Создаем структуру блока
        blockContent.innerHTML = `
            <div class="radio-container" id="radio-buttons"></div>
            <div class="content-container" id="content-container"></div>
        `;
        
        // Определяем секции с конфигурациями
        const sections = [
            { id: 'room', title: 'Параметры помещения', config: 'room' },
            { id: 'heating', title: 'Параметры отопления', config: 'heating' },
            { id: 'floor-heating', title: 'Параметры теплого пола', config: 'floor-heating' },
            { id: 'electric', title: 'Параметры электрики', config: 'electric' }
        ];
        
        // Создаем радио-кнопки
        createRadioButtons(sections);
        
        // Загружаем первую секцию по умолчанию
        loadSectionConfig('room');
    });
    
    // Функция создания радио-кнопок
    function createRadioButtons(sections) {
        const container = document.getElementById('radio-buttons');
        if (!container) return;
        
        let radioHtml = '<div class="radio-group">';
        
        sections.forEach((section, index) => {
            radioHtml += `
                <label class="radio-label">
                    <input type="radio" name="section" value="${section.id}" 
                           ${index === 0 ? 'checked' : ''} class="radio-input">
                    <span class="radio-text">${section.title}</span>
                </label>
            `;
        });
        
        radioHtml += '</div>';
        container.innerHTML = radioHtml;
        
        // Добавляем обработчики событий для радио-кнопок
        document.querySelectorAll('.radio-input').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    loadSectionConfig(this.value);
                }
            });
        });
    }
    
    // Функция загрузки конфигурации секции
    function loadSectionConfig(sectionId) {
        // Загружаем соответствующий конфигурационный файл
        const script = document.createElement('script');
        script.src = `js/config/${sectionId}-config.js`;
        script.onload = function() {
            // После загрузки конфига рендерим содержимое
            renderSection(sectionId);
        };
        script.onerror = function() {
            console.error(`Не удалось загрузить конфиг для секции: ${sectionId}`);
            document.getElementById('content-container').innerHTML = `
                <div class="empty-section">
                    <p>Конфигурация для этой секции пока не загружена.</p>
                </div>
            `;
        };
        document.head.appendChild(script);
    }
    
    // Функция рендеринга секции
    function renderSection(sectionId) {
        const container = document.getElementById('content-container');
        if (!container) return;
        
        // Проверяем, есть ли загруженный конфиг для этой секции
        if (window[`${sectionId}Config`]) {
            const config = window[`${sectionId}Config`];
            container.innerHTML = config.render();
            
            // Инициализируем конфиг после рендеринга
            if (config.init) {
                config.init();
            }
        }
    }
})();
