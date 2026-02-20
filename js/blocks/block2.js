(function() {
    console.log('Инициализация блока 2...');
    
    const init = function() {
        const blockContent = document.getElementById('block2-content');
        if (!blockContent) return;
        
        blockContent.innerHTML = `
            <div class="scheme-container">
                <h3 class="scheme-title">Схема помещения</h3>
                <div class="scheme-canvas">
                    <span class="scheme-placeholder">
                        Схема будет сгенерирована автоматически<br>
                        на основе введенных параметров
                    </span>
                </div>
                <div class="scheme-info">
                    <div class="scheme-info-item">
                        <span class="scheme-info-label">Статус:</span>
                        <span class="scheme-info-value">Ожидание данных</span>
                    </div>
                </div>
            </div>
        `;
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
