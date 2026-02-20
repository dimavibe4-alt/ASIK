// Система подсказок для полей ввода
window.TooltipManager = {
    init() {
        this.createTooltipContainer();
        this.setupEventListeners();
    },
    
    createTooltipContainer() {
        const container = document.createElement('div');
        container.id = 'tooltip-container';
        container.style.cssText = `
            position: fixed;
            background: #ffffe1;
            border: 1px solid #808080;
            padding: 8px 10px;
            font-family: Tahoma, Arial, sans-serif;
            font-size: 11px;
            max-width: 300px;
            z-index: 10000;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        this.container = container;
    },
    
    setupEventListeners() {
        // Делегирование событий для элементов с data-tooltip
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.showTooltip(target, target.dataset.tooltip);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hideTooltip();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.container.style.display === 'block') {
                this.positionTooltip(e.clientX, e.clientY);
            }
        });
    },
    
    showTooltip(element, tooltipKey) {
        const tooltipData = this.getTooltipData(tooltipKey);
        if (!tooltipData) return;
        
        this.container.innerHTML = this.formatTooltip(tooltipData);
        this.container.style.display = 'block';
        
        // Позиционируем относительно курсора
        const rect = element.getBoundingClientRect();
        this.positionTooltip(rect.left + rect.width / 2, rect.top);
    },
    
    hideTooltip() {
        this.container.style.display = 'none';
    },
    
    positionTooltip(x, y) {
        const offset = 10;
        const tooltipWidth = this.container.offsetWidth;
        const tooltipHeight = this.container.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Позиционируем справа от курсора, если есть место
        let posX = x + offset;
        let posY = y + offset;
        
        // Если не помещается справа, показываем слева
        if (posX + tooltipWidth > windowWidth) {
            posX = x - tooltipWidth - offset;
        }
        
        // Если не помещается снизу, показываем сверху
        if (posY + tooltipHeight > windowHeight) {
            posY = y - tooltipHeight - offset;
        }
        
        this.container.style.left = `${posX}px`;
        this.container.style.top = `${posY}px`;
    },
    
    getTooltipData(key) {
        if (!window.roomConfig || !window.roomConfig.tooltips) return null;
        
        // Ищем подсказку по ключу (поддерживается вложенность через точку)
        const keys = key.split('.');
        let data = window.roomConfig.tooltips;
        
        for (const k of keys) {
            if (data && data[k]) {
                data = data[k];
            } else {
                return null;
            }
        }
        
        // Если data - строка, преобразуем в объект
        if (typeof data === 'string') {
            return { text: data };
        }
        
        return data;
    },
    
    formatTooltip(data) {
        let html = '';
        
        if (data.text) {
            html += `<div style="margin-bottom: 5px; color: #000;">${data.text}</div>`;
        }
        
        if (data.normative) {
            html += `<div style="margin-bottom: 3px; font-weight: bold; color: #000080;">Норматив:</div>`;
            html += `<div style="margin-bottom: 5px; color: #404040;">${data.normative}</div>`;
        }
        
        if (data.example) {
            html += `<div style="margin-bottom: 3px; font-weight: bold; color: #008000;">Пример:</div>`;
            html += `<div style="color: #606060;">${data.example}</div>`;
        }
        
        return html;
    },
    
    // Метод для добавления подсказки к элементу
    attachTooltip(element, tooltipKey) {
        element.setAttribute('data-tooltip', tooltipKey);
        
        // Добавляем иконку "?" если её нет
        if (!element.querySelector('.tooltip-icon')) {
            const icon = document.createElement('span');
            icon.className = 'tooltip-icon';
            icon.innerHTML = '?';
            icon.style.cssText = `
                display: inline-block;
                width: 12px;
                height: 12px;
                background: #000080;
                color: white;
                border-radius: 50%;
                text-align: center;
                line-height: 12px;
                font-size: 9px;
                margin-left: 4px;
                cursor: help;
            `;
            element.appendChild(icon);
        }
    }
};

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (window.TooltipManager) {
        window.TooltipManager.init();
    }
});
