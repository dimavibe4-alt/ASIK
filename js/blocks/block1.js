// Блок 1: Параметры помещения
(function() {
    const blockId = 'block1';
    let advancedMode = false;
    let currentData = {};
    let dependenciesInitialized = false;
    
    function initializeBlock() {
        const contentDiv = document.getElementById(`${blockId}-content`);
        if (!contentDiv) {
            setTimeout(initializeBlock, 100);
            return;
        }
        
        loadSavedSettings();
        initializeDependencies();
        renderInterface(contentDiv);
    }
    
    function loadSavedSettings() {
        const savedMode = localStorage.getItem('heatcalc_mode');
        if (savedMode) {
            advancedMode = savedMode === 'advanced';
        } else {
            advancedMode = false;
        }
        
        const savedData = localStorage.getItem(`heatcalc_data_${advancedMode ? 'advanced' : 'simple'}`);
        if (savedData) {
            try {
                currentData = JSON.parse(savedData);
            } catch (e) {
                console.error('Error parsing saved data:', e);
                currentData = {};
            }
        }

        // При загрузке, если есть климатическая зона, но нет явной температуры, устанавливаем её
        if (!advancedMode && currentData.climate_climate_zone && !currentData.climate_outside_temp && !currentData.temperatures_outside_temp) {
            const zoneKey = currentData.climate_climate_zone;
            if (window.roomConfig && window.roomConfig.climateZones && window.roomConfig.climateZones[zoneKey]) {
                currentData.climate_outside_temp = window.roomConfig.climateZones[zoneKey].winterTemp;
            }
        }
    }
    
    function saveSettings() {
        localStorage.setItem('heatcalc_mode', advancedMode ? 'advanced' : 'simple');
        localStorage.setItem(`heatcalc_data_${advancedMode ? 'advanced' : 'simple'}`, JSON.stringify(currentData));
    }
    
    function initializeDependencies() {
        if (!window.roomConfig || dependenciesInitialized) return;
        
        window.roomConfig.dependencies = {
            simple: {
                preset_basement_room: {
                    hideSections: ['additional'],
                    hideFields: {
                        dimensions: ['height'],
                        windows: ['window_count']
                    },
                    setDefaults: {
                        dimensions_height: 2.4,
                        windows_window_count: 1,
                        climate_inside_temp: 20
                    }
                },
                preset_attic_room: {
                    hideSections: [],
                    hideFields: {
                        dimensions: ['height']
                    },
                    setDefaults: {
                        dimensions_height: 2.8,
                        climate_inside_temp: 24,
                        additional_floor_level: 'attic'
                    }
                },
                preset_modern_apartment: {
                    setDefaults: {
                        windows_window_type: 'energy',
                        insulation_has_insulation: true,
                        insulation_insulation_type: 'extruded_polystyrene',
                        climate_climate_zone: 'moscow'
                    }
                }
            },
            advanced: {
                floor_under: {
                    ground: {
                        showFields: {
                            floor: ['ground_type']
                        },
                        hideFields: {
                            floor: ['basement_temp']
                        }
                    },
                    basement: {
                        showFields: {
                            floor: ['basement_temp']
                        },
                        hideFields: {
                            floor: ['ground_type']
                        }
                    }
                },
                ceiling_above: {
                    attic: {
                        showFields: {
                            ceiling: ['attic_insulation_thickness', 'attic_ventilation']
                        }
                    },
                    roof: {
                        showFields: {
                            ceiling: ['roof_material', 'roof_insulation']
                        }
                    }
                },
                ventilation_ventilation_type: {
                    natural: {
                        hideFields: {
                            ventilation: ['heat_recovery_efficiency', 'ventilation_rate']
                        }
                    },
                    balanced_with_recovery: {
                        showFields: {
                            ventilation: ['heat_recovery_efficiency', 'ventilation_rate']
                        }
                    }
                },
                floor_heating_enabled: {
                    true: {
                        showFields: {
                            floor_heating: [
                                'type', 'room_type', 'area', 'covering_type',
                                'laying_step', 'screed_thickness', 'insulation_below',
                                'max_surface_temp'
                            ]
                        },
                        hideFields: {
                            floor_heating: []
                        }
                    },
                    false: {
                        hideFields: {
                            floor_heating: [
                                'type', 'room_type', 'area', 'covering_type',
                                'laying_step', 'screed_thickness', 'insulation_below',
                                'max_surface_temp',
                                'water_temperature_supply', 'circuits_count', 'circuit_length',
                                'pipe_material', 'pipe_diameter', 'pipe_wall_thickness',
                                'insulation_type', 'insulation_thickness'
                            ]
                        }
                    }
                },
                floor_heating_type: {
                    water: {
                        showFields: {
                            floor_heating: [
                                'water_temperature_supply', 'circuits_count', 'circuit_length',
                                'pipe_material', 'pipe_diameter', 'pipe_wall_thickness'
                            ]
                        }
                    },
                    electric: {
                        hideFields: {
                            floor_heating: [
                                'water_temperature_supply', 'circuits_count', 'circuit_length',
                                'pipe_material', 'pipe_diameter', 'pipe_wall_thickness'
                            ]
                        }
                    }
                },
                floor_heating_insulation_below: {
                    true: {
                        showFields: {
                            floor_heating: ['insulation_type', 'insulation_thickness']
                        }
                    },
                    false: {
                        hideFields: {
                            floor_heating: ['insulation_type', 'insulation_thickness']
                        }
                    }
                },
                system_general_temperature_graph: {
                    custom: {
                        showFields: {
                            system_general: ['temperature_supply', 'temperature_return']
                        }
                    },
                    '90/70/20': {
                        hideFields: {
                            system_general: ['temperature_supply', 'temperature_return']
                        }
                    },
                    '75/65/20': {
                        hideFields: {
                            system_general: ['temperature_supply', 'temperature_return']
                        }
                    },
                    '55/45/20': {
                        hideFields: {
                            system_general: ['temperature_supply', 'temperature_return']
                        }
                    },
                    '45/35/20': {
                        hideFields: {
                            system_general: ['temperature_supply', 'temperature_return']
                        }
                    }
                }
            }
        };
        
        window.roomConfig.dependencyManager = {
            applyDependencies: function(changedFieldId, currentData, mode) {
                const dependencies = window.roomConfig.dependencies[mode];
                const changes = {
                    hideFields: [],
                    showFields: [],
                    setDefaults: {},
                    recommendations: []
                };
                
                if (!dependencies) return changes;
                
                if (changedFieldId === 'preset_preset' && mode === 'simple') {
                    const presetId = currentData[changedFieldId];
                    const presetRules = dependencies[`preset_${presetId}`];
                    
                    if (presetRules) {
                        if (presetRules.hideFields) {
                            Object.entries(presetRules.hideFields).forEach(([section, fields]) => {
                                fields.forEach(field => {
                                    changes.hideFields.push(`${section}_${field}`);
                                });
                            });
                        }
                        
                        if (presetRules.setDefaults) {
                            Object.assign(changes.setDefaults, presetRules.setDefaults);
                        }
                    }
                }
                
                const fieldValue = currentData[changedFieldId];
                const fieldRules = dependencies[changedFieldId];
                
                if (fieldRules && fieldRules[fieldValue]) {
                    const valueRule = fieldRules[fieldValue];
                    
                    if (valueRule.hideFields) {
                        Object.entries(valueRule.hideFields).forEach(([section, fields]) => {
                            fields.forEach(field => {
                                changes.hideFields.push(`${section}_${field}`);
                            });
                        });
                    }
                    
                    if (valueRule.showFields) {
                        Object.entries(valueRule.showFields).forEach(([section, fields]) => {
                            fields.forEach(field => {
                                changes.showFields.push(`${section}_${field}`);
                            });
                        });
                    }
                }
                
                return changes;
            },
            
            isFieldVisible: function(fieldId, currentData, mode) {
                const dependencies = window.roomConfig.dependencies[mode];
                if (!dependencies) return true;
                
                for (const [triggerField, rules] of Object.entries(dependencies)) {
                    const triggerValue = currentData[triggerField];
                    
                    if (rules[triggerValue] && rules[triggerValue].hideFields) {
                        for (const [section, fields] of Object.entries(rules[triggerValue].hideFields)) {
                            if (fields.some(field => `${section}_${field}` === fieldId)) {
                                return false;
                            }
                        }
                    }
                }
                
                return true;
            }
        };
        
        dependenciesInitialized = true;
    }
    
    function getTooltipText(key) {
        if (!key || !window.roomConfig || !window.roomConfig.tooltips) return '';
        const tip = window.roomConfig.tooltips[key];
        if (!tip) return '';
        if (typeof tip === 'string') return tip;
        if (typeof tip === 'object' && tip.text) return tip.text;
        return '';
    }
    
    function saveAccordionState() {
        const state = {
            categories: [],
            subsections: []
        };
        document.querySelectorAll('.category-item.active').forEach(el => {
            state.categories.push(el.dataset.category);
        });
        document.querySelectorAll('.accordion-item.active').forEach(el => {
            state.subsections.push(el.dataset.subsection || el.dataset.section);
        });
        return state;
    }
    
    function restoreAccordionState(state) {
        if (!state) return;
        state.categories.forEach(catKey => {
            const cat = document.querySelector(`.category-item[data-category="${catKey}"]`);
            if (cat) {
                cat.classList.add('active');
                const content = cat.querySelector('.category-content');
                if (content) content.style.display = 'block';
                const icon = cat.querySelector('.category-icon');
                if (icon) icon.textContent = '▼';
            }
        });
        state.subsections.forEach(subKey => {
            const sub = document.querySelector(`.accordion-item[data-subsection="${subKey}"], .accordion-item[data-section="${subKey}"]`);
            if (sub) {
                sub.classList.add('active');
                const content = sub.querySelector('.accordion-content');
                if (content) content.style.display = 'block';
                const icon = sub.querySelector('.accordion-icon');
                if (icon) icon.textContent = '▼';
            }
        });
    }
    
    function renderInterface(container, attempt = 0) {
        if (!window.roomConfig) {
            if (attempt < 10) {
                container.innerHTML = '<div class="placeholder">Загрузка конфигурации...</div>';
                setTimeout(() => renderInterface(container, attempt + 1), 200);
            } else {
                container.innerHTML = '<div class="placeholder">Не удалось загрузить конфигурацию. Обновите страницу.</div>';
            }
            return;
        }
        
        const prevState = saveAccordionState();
        const config = advancedMode ? window.roomConfig.advanced : window.roomConfig.simple;
        
        if (!config) {
            container.innerHTML = '<div class="placeholder">Конфигурация для выбранного режима не найдена</div>';
            return;
        }
        
        container.innerHTML = `
            <div class="block1-container">
                <div class="room-parameters">
                    <div class="advanced-toggle">
                        <label class="toggle-label">
                            <input type="checkbox" id="advanced-mode" ${advancedMode ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span>Расширенный режим</span>
                        </label>
                    </div>
                    
                    <div class="form-status" id="form-status" style="display: none;"></div>
                    
                    ${generateCategoriesOrSections(config)}
                </div>
            </div>
        `;
        
        populateFormData();
        setupEventListeners();
        setupCategoryAccordion();
        restoreAccordionState(prevState);
        applyInitialDependencies();
    }
    
    function generateCategoriesOrSections(config) {
        if (config.categories) {
            return generateCategories(config.categories);
        } else if (config.sections) {
            return generateSectionsFromConfig(config.sections);
        } else {
            return '<div class="placeholder">Нет данных для отображения</div>';
        }
    }
    
    function generateCategories(categories) {
        let html = '<div class="category-accordion">';
        const mode = advancedMode ? 'advanced' : 'simple';
        
        for (const [catKey, category] of Object.entries(categories)) {
            html += `
                <div class="category-item" data-category="${catKey}">
                    <button class="category-button" type="button">
                        <span class="category-icon">▶</span>
                        <span class="category-title">${category.name}</span>
                    </button>
                    <div class="category-content" style="display: none;">
                        ${generateSubsections(category.subsections, mode)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    function generateSubsections(subsections, mode) {
        if (!subsections) {
            return '<div class="placeholder">Нет подразделов</div>';
        }
        
        let html = '<div class="accordion">';
        
        for (const [subKey, subsection] of Object.entries(subsections)) {
            const fieldsHtml = generateFields(subsection.fields, subKey, mode);
            
            html += `
                <div class="accordion-item" data-subsection="${subKey}">
                    <button class="accordion-button" type="button">
                        <span class="accordion-icon">▶</span>
                        <span class="accordion-title">${subsection.name}</span>
                    </button>
                    <div class="accordion-content" style="display: none;">
                        ${fieldsHtml}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    function generateSectionsFromConfig(sections) {
        if (!sections) {
            return '<div class="placeholder">Нет доступных параметров</div>';
        }
        
        let html = '<div class="accordion">';
        const mode = advancedMode ? 'advanced' : 'simple';
        
        for (const [sectionKey, sectionConfig] of Object.entries(sections)) {
            let sectionVisible = true;
            
            if (window.roomConfig.dependencyManager && currentData.preset_preset) {
                const presetRules = window.roomConfig.dependencies.simple?.[`preset_${currentData.preset_preset}`];
                if (presetRules && presetRules.hideSections && presetRules.hideSections.includes(sectionKey)) {
                    sectionVisible = false;
                }
            }
            
            if (!sectionVisible) continue;
            
            const fieldsHtml = generateFields(sectionConfig.fields, sectionKey, mode);
            
            html += `
                <div class="accordion-item" data-section="${sectionKey}">
                    <button class="accordion-button" type="button">
                        <span class="accordion-icon">▶</span>
                        <span class="accordion-title">${sectionConfig.name}</span>
                    </button>
                    <div class="accordion-content" style="display: none;">
                        ${fieldsHtml}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    function generateFields(fields, sectionKey, mode) {
        if (!fields) {
            return '<div class="placeholder">Нет параметров в этой секции</div>';
        }
        
        let html = '';
        
        for (const [fieldKey, fieldConfig] of Object.entries(fields)) {
            const fieldId = `${sectionKey}_${fieldKey}`;
            
            if (window.roomConfig.dependencyManager) {
                const isVisible = window.roomConfig.dependencyManager.isFieldVisible(
                    fieldId, 
                    currentData, 
                    mode
                );
                
                if (!isVisible) continue;
            }
            
            if (fieldConfig.showCondition) {
                let shouldShow = false;
                
                if (typeof fieldConfig.showCondition === 'string') {
                    const conditionValue = currentData[`${sectionKey}_${fieldConfig.showCondition}`];
                    shouldShow = Boolean(conditionValue);
                } else if (typeof fieldConfig.showCondition === 'object') {
                    const condition = fieldConfig.showCondition;
                    
                    if (condition.field) {
                        let conditionFieldId = condition.field;
                        if (!conditionFieldId.includes('_')) {
                            conditionFieldId = `${sectionKey}_${condition.field}`;
                        }
                        
                        const conditionValue = currentData[conditionFieldId];
                        
                        if (condition.value !== undefined) {
                            shouldShow = conditionValue == condition.value;
                        } else if (condition.values) {
                            shouldShow = condition.values.includes(conditionValue);
                        } else {
                            shouldShow = Boolean(conditionValue);
                        }
                    }
                }
                
                if (!shouldShow) continue;
            }
            
            const savedValue = currentData[fieldId] !== undefined ? currentData[fieldId] : fieldConfig.default;
            
            let fieldHtml = '';
            let extraAttributes = '';
            
            if (fieldConfig.showCondition) {
                if (typeof fieldConfig.showCondition === 'string') {
                    extraAttributes += ` data-depends-on="${sectionKey}_${fieldConfig.showCondition}"`;
                } else if (typeof fieldConfig.showCondition === 'object' && fieldConfig.showCondition.field) {
                    let depField = fieldConfig.showCondition.field;
                    if (!depField.includes('_')) {
                        depField = `${sectionKey}_${depField}`;
                    }
                    extraAttributes += ` data-depends-on="${depField}"`;
                    
                    if (fieldConfig.showCondition.value !== undefined) {
                        extraAttributes += ` data-depends-value="${fieldConfig.showCondition.value}"`;
                    }
                }
            }
            
            const tooltipText = fieldConfig.tooltip ? getTooltipText(fieldConfig.tooltip) : '';
            
            switch (fieldConfig.type) {
                case 'number':
                    fieldHtml = generateNumberField(fieldId, fieldConfig, savedValue, extraAttributes, tooltipText);
                    break;
                case 'select':
                    fieldHtml = generateSelectField(fieldId, fieldConfig, savedValue, extraAttributes, tooltipText);
                    break;
                case 'checkbox':
                    fieldHtml = generateCheckboxField(fieldId, fieldConfig, savedValue, extraAttributes, tooltipText);
                    break;
                case 'text':
                    fieldHtml = `<input type="text" id="${fieldId}" name="${fieldId}" value="${savedValue !== undefined ? savedValue : (fieldConfig.default || '')}" ${extraAttributes} title="${tooltipText}">`;
                    break;
                default:
                    fieldHtml = generateNumberField(fieldId, fieldConfig, savedValue, extraAttributes, tooltipText);
            }
            
            const iconHtml = tooltipText ? `<span class="tooltip-icon" title="${tooltipText}">?</span>` : '';
            const labelText = fieldConfig.label !== undefined ? fieldConfig.label : fieldKey;
            
            html += `
                <div class="form-group" id="group-${fieldId}">
                    <label for="${fieldId}">
                        ${labelText}
                        ${iconHtml}
                    </label>
                    ${fieldHtml}
                    ${fieldConfig.description ? `<div class="field-description">${fieldConfig.description}</div>` : ''}
                </div>
            `;
        }
        
        return html || '<div class="placeholder">Нет параметров для отображения</div>';
    }
    
    function generateNumberField(id, config, value, extraAttributes = '', tooltipText = '') {
        return `
            <input type="number" 
                   id="${id}" 
                   name="${id}" 
                   value="${value !== undefined ? value : (config.default || '')}" 
                   min="${config.min || ''}" 
                   max="${config.max || ''}" 
                   step="${config.step || 'any'}"
                   ${config.required ? 'required' : ''}
                   title="${tooltipText}"
                   ${extraAttributes}>
        `;
    }
    
    function generateSelectField(id, config, value, extraAttributes = '', tooltipText = '') {
        let optionsHtml = '';
        const selectedValue = value !== undefined ? value : config.default;
        
        if (config.options) {
            for (const option of config.options) {
                const selected = option.value == selectedValue ? 'selected' : '';
                const label = option.label || option.value;
                optionsHtml += `<option value="${option.value}" ${selected}>${label}</option>`;
            }
        }
        
        return `
            <select id="${id}" 
                    name="${id}" 
                    ${config.required ? 'required' : ''}
                    title="${tooltipText}"
                    ${extraAttributes}>
                ${optionsHtml}
            </select>
        `;
    }
    
    function generateCheckboxField(id, config, value, extraAttributes = '', tooltipText = '') {
        const checked = value !== undefined ? value : config.default;
        return `
            <input type="checkbox" 
                   id="${id}" 
                   name="${id}" 
                   ${checked ? 'checked' : ''}
                   title="${tooltipText}"
                   ${extraAttributes}>
        `;
    }
    
    function populateFormData() {
        for (const [key, value] of Object.entries(currentData)) {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = Boolean(value);
                } else {
                    element.value = value;
                }
            }
        }

        // Если климатическая зона не задана, устанавливаем 'moscow'
        if (!currentData.climate_climate_zone) {
            currentData.climate_climate_zone = 'moscow';
            const zoneElement = document.getElementById('climate_climate_zone');
            if (zoneElement) zoneElement.value = 'moscow';
        }

        // Если есть климатическая зона, но нет явной температуры, устанавливаем её
        if (!advancedMode && currentData.climate_climate_zone && !currentData.climate_outside_temp && !currentData.temperatures_outside_temp) {
            const zoneKey = currentData.climate_climate_zone;
            if (window.roomConfig && window.roomConfig.climateZones && window.roomConfig.climateZones[zoneKey]) {
                currentData.climate_outside_temp = window.roomConfig.climateZones[zoneKey].winterTemp;
            }
        }

        if (!advancedMode && currentData.preset_preset) {
            applyPreset(currentData.preset_preset);
        }

        window.dispatchEvent(new CustomEvent('roomDataChanged', { detail: currentData }));
    }
    
    function applyPreset(presetId) {
        const preset = window.roomConfig?.presets?.[presetId];
        if (!preset) return;
        
        for (const [key, value] of Object.entries(preset)) {
            currentData[`preset_${key}`] = value;
            const element = document.getElementById(`preset_${key}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = Boolean(value);
                } else {
                    element.value = value;
                }
            }
        }
        
        // После применения пресета убедимся, что климатическая зона не сброшена
        if (!advancedMode && currentData.climate_climate_zone && !currentData.climate_outside_temp) {
            const zoneKey = currentData.climate_climate_zone;
            if (window.roomConfig?.climateZones?.[zoneKey]) {
                currentData.climate_outside_temp = window.roomConfig.climateZones[zoneKey].winterTemp;
            }
        }
        
        updateCalculatedFields();
    }
    
    function applyInitialDependencies() {
        const mode = advancedMode ? 'advanced' : 'simple';
        
        if (!advancedMode && currentData.preset_preset && window.roomConfig.dependencyManager) {
            const changes = window.roomConfig.dependencyManager.applyDependencies(
                'preset_preset',
                currentData,
                mode
            );
            applyDependencyChanges(changes, false);
        }
        
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            if (element.id && element.id !== 'preset_preset') {
                const changes = window.roomConfig.dependencyManager?.applyDependencies(
                    element.id,
                    currentData,
                    mode
                );
                if (changes) {
                    applyDependencyChanges(changes, false);
                }
            }
        });
    }
    
    function applyDependencyChanges(changes, showMessage = true) {
        changes.hideFields.forEach(fieldId => {
            const group = document.getElementById(`group-${fieldId}`);
            if (group) {
                group.style.display = 'none';
            }
        });
        
        changes.showFields.forEach(fieldId => {
            const group = document.getElementById(`group-${fieldId}`);
            if (group) {
                group.style.display = 'block';
            }
        });
        
        Object.entries(changes.setDefaults).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
                currentData[fieldId] = value;
                
                setTimeout(() => {
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }, 10);
            }
        });
        
        if (showMessage && changes.recommendations.length > 0) {
            showStatusMessage(changes.recommendations.map(r => r.message).join('<br>'), 'info');
        }
    }
    
    function showStatusMessage(message, type = 'info') {
        const statusDiv = document.getElementById('form-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="status-message status-${type}">
                    <span class="status-icon">${type === 'info' ? 'ℹ' : '💡'}</span>
                    <span class="status-text">${message}</span>
                    <button class="status-close" onclick="this.parentElement.style.display='none'">×</button>
                </div>
            `;
            statusDiv.style.display = 'block';
        }
    }
    
    function updateCalculatedFields() {
        if (advancedMode && currentData.walls_material && window.roomConfig.materials[currentData.walls_material]) {
            const recommendations = {
                brick: { insulation: 'extruded_polystyrene', thickness: 100 },
                concrete: { insulation: 'mineral_wool', thickness: 150 },
                wood: { insulation: 'ecowool', thickness: 100 },
                aerated_concrete: { insulation: 'polystyrene', thickness: 50 }
            };
            
            const rec = recommendations[currentData.walls_material];
            if (rec && !currentData.insulation_material) {
                showStatusMessage(
                    `Рекомендуемый утеплитель для ${window.roomConfig.materials[currentData.walls_material].name}: ${window.roomConfig.materials[rec.insulation].name} толщиной ${rec.thickness}мм`,
                    'info'
                );
            }
        }
        
        if (currentData.climate_climate_zone && window.roomConfig.climateZones[currentData.climate_climate_zone]) {
            const zone = window.roomConfig.climateZones[currentData.climate_climate_zone];
            if (zone.winterTemp && !currentData.temperatures_outside_temp) {
                const tempElement = document.getElementById('temperatures_outside_temp');
                if (tempElement) {
                    tempElement.value = zone.winterTemp;
                    currentData.temperatures_outside_temp = zone.winterTemp;
                }
            }
        }
    }
    
    function setupEventListeners() {
        const modeToggle = document.getElementById('advanced-mode');
        if (modeToggle) {
            modeToggle.addEventListener('change', function() {
                collectFormData();
                saveSettings();
                advancedMode = this.checked;
                
                const contentDiv = document.getElementById(`${blockId}-content`);
                if (contentDiv) {
                    renderInterface(contentDiv);
                }
            });
        }
        
        const accordionButtons = document.querySelectorAll('.accordion-button');
        accordionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const item = this.parentElement;
                const content = this.nextElementSibling;
                const icon = this.querySelector('.accordion-icon');
                
                const isActive = item.classList.contains('active');
                
                if (isActive) {
                    item.classList.remove('active');
                    content.style.display = 'none';
                    icon.textContent = '▶';
                } else {
                    item.classList.add('active');
                    content.style.display = 'block';
                    icon.textContent = '▼';
                }
            });
        });
        
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            element.addEventListener('change', function() {
                handleFieldChange(this);
            });
            
            if (element.type === 'number') {
                element.addEventListener('input', function() {
                    collectFormData();
                    saveSettings();
                    updateCalculatedFields();
                });
            }
        });
    }
    
    function setupCategoryAccordion() {
        const categoryButtons = document.querySelectorAll('.category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const item = this.parentElement;
                const content = this.nextElementSibling;
                const icon = this.querySelector('.category-icon');
                
                const isActive = item.classList.contains('active');
                
                if (isActive) {
                    item.classList.remove('active');
                    content.style.display = 'none';
                    icon.textContent = '▶';
                } else {
                    item.classList.add('active');
                    content.style.display = 'block';
                    icon.textContent = '▼';
                }
            });
        });
    }
    
    function handleFieldChange(element) {
    collectFormData();
    saveSettings();
    
    const mode = advancedMode ? 'advanced' : 'simple';
    
    if (element.id === 'preset_preset' && !advancedMode) {
        applyPreset(element.value);
        collectFormData();
    }
    
    if (window.roomConfig.dependencyManager) {
        const changes = window.roomConfig.dependencyManager.applyDependencies(
            element.id,
            currentData,
            mode
        );
        applyDependencyChanges(changes, true);
    }
    
    // Обработка климатической зоны
    if (element.id === 'climate_climate_zone') {
        const zoneKey = element.value;
        if (window.roomConfig?.climateZones?.[zoneKey]) {
            currentData.climate_outside_temp = window.roomConfig.climateZones[zoneKey].winterTemp;
        }
    }
    
    // Обработка полей утеплителя
    if (element.id === 'insulation_has_insulation' || element.id === 'insulation_insulation_type') {
        // Принудительно обновляем расчётные поля
        updateCalculatedFields();
    }
    
    const hasDeps = hasDependentFields(element.id, mode);
    
    if (element.id === 'floor_heating_enabled' || element.id === 'system_general_temperature_graph' || hasDeps) {
        setTimeout(() => {
            const contentDiv = document.getElementById(`${blockId}-content`);
            if (contentDiv) renderInterface(contentDiv);
        }, 50);
    } else {
        updateCalculatedFields();
    }

    window.dispatchEvent(new CustomEvent('roomDataChanged', { detail: currentData }));
}
    
    function hasDependentFields(fieldId, mode) {
        const dependencies = window.roomConfig.dependencies[mode];
        if (dependencies && Object.keys(dependencies).some(key => {
            if (key === fieldId || key.startsWith(fieldId + '_')) return true;
            for (const rule of Object.values(dependencies[key] || {})) {
                if (rule.hideFields || rule.showFields) {
                    const allFields = [
                        ...(rule.hideFields ? Object.values(rule.hideFields).flat() : []),
                        ...(rule.showFields ? Object.values(rule.showFields).flat() : [])
                    ];
                    if (allFields.some(f => f.includes(fieldId))) return true;
                }
            }
            return false;
        })) return true;

        const config = mode === 'advanced' ? window.roomConfig?.advanced : window.roomConfig?.simple;
        if (config) {
            const sections = config.categories 
                ? Object.values(config.categories).flatMap(c => Object.values(c.subsections))
                : (config.sections ? Object.values(config.sections) : []);
            for (const section of sections) {
                for (const [fKey, fConfig] of Object.entries(section.fields || {})) {
                    if (fConfig.showCondition) {
                        let dependsOn = null;
                        if (typeof fConfig.showCondition === 'string') {
                            dependsOn = fConfig.showCondition;
                        } else if (typeof fConfig.showCondition === 'object' && fConfig.showCondition.field) {
                            dependsOn = fConfig.showCondition.field;
                        }
                        if (dependsOn) {
                            if (dependsOn === fieldId.split('_').pop()) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    
    function collectFormData() {
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            const value = element.type === 'checkbox' ? element.checked : element.value;
            currentData[element.id] = value;
        });
    }
    
    window.getRoomParameters = function() {
        collectFormData();
        return {
            mode: advancedMode ? 'advanced' : 'simple',
            data: currentData,
            config: advancedMode ? window.roomConfig?.advanced : window.roomConfig?.simple
        };
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlock);
    } else {
        setTimeout(initializeBlock, 100);
    }
})();
