// Конфигурация параметров помещения для генерации форм
window.roomConfig = {
    // Текущий режим (simple/advanced)
    currentMode: 'simple',
    
    // БИБЛИОТЕКА МАТЕРИАЛОВ с коэффициентами теплопроводности
    materials: {
        // Стены
        brick: {
            name: 'Кирпич керамический',
            conductivity: 0.7,
            typicalThickness: [120, 250, 380, 510],
            normativeR: 3.15
        },
        concrete: {
            name: 'Бетон',
            conductivity: 1.7,
            typicalThickness: [200, 300, 400],
            normativeR: 3.15
        },
        wood: {
            name: 'Дерево',
            conductivity: 0.15,
            typicalThickness: [150, 200, 250],
            normativeR: 3.15
        },
        foam_block: {
            name: 'Пеноблок',
            conductivity: 0.12,
            typicalThickness: [200, 300, 400],
            normativeR: 3.15
        },
        aerated_concrete: {
            name: 'Газобетон',
            conductivity: 0.14,
            typicalThickness: [200, 300, 400],
            normativeR: 3.15
        },
        
        // Утеплители
        mineral_wool: {
            name: 'Минеральная вата',
            conductivity: 0.045,
            typicalThickness: [50, 100, 150],
            resistancePer10mm: 0.22
        },
        polystyrene: {
            name: 'Пенополистирол',
            conductivity: 0.038,
            typicalThickness: [50, 100, 150],
            resistancePer10mm: 0.26
        },
        extruded_polystyrene: {
            name: 'Экструдированный пенополистирол',
            conductivity: 0.03,
            typicalThickness: [50, 100, 150],
            resistancePer10mm: 0.33
        },
        polyurethane_foam: {
            name: 'Пенополиуретан',
            conductivity: 0.025,
            typicalThickness: [50, 100, 150],
            resistancePer10mm: 0.4
        },
        ecowool: {
            name: 'Эковата',
            conductivity: 0.04,
            typicalThickness: [100, 150, 200],
            resistancePer10mm: 0.25
        }
    },
    
    // ПРЕСЕТЫ для простого режима
    presets: {
        apartment_panel_1990: {
            name: 'Квартира в панельном доме (1990-е)',
            description: 'Типовая панелька с обычным ремонтом',
            wall_material: 'concrete',
            wall_thickness: 300,
            wall_insulation: null,
            window_type: 'double',
            window_uValue: 2.8,
            has_insulation: false,
            infiltration_rate: 0.7
        },
        apartment_brick: {
            name: 'Квартира в кирпичном доме',
            description: 'Кирпичный дом (сталинка/хрущевка)',
            wall_material: 'brick',
            wall_thickness: 380,
            wall_insulation: null,
            window_type: 'double',
            window_uValue: 2.8,
            has_insulation: false,
            infiltration_rate: 0.6
        },
        private_house_soviet: {
            name: 'Частный дом советской постройки',
            description: 'Типовой дом 70-80-х годов',
            wall_material: 'brick',
            wall_thickness: 510,
            wall_insulation: 'mineral_wool',
            wall_insulation_thickness: 50,
            window_type: 'double',
            window_uValue: 2.8,
            has_insulation: true,
            infiltration_rate: 0.8
        },
        modern_cottage: {
            name: 'Современный коттедж (после 2010)',
            description: 'Построен по современным нормам',
            wall_material: 'aerated_concrete',
            wall_thickness: 400,
            wall_insulation: 'extruded_polystyrene',
            wall_insulation_thickness: 100,
            window_type: 'energy',
            window_uValue: 1.0,
            has_insulation: true,
            infiltration_rate: 0.3
        },
        office_space: {
            name: 'Офисное помещение',
            description: 'Коммерческая недвижимость',
            wall_material: 'concrete',
            wall_thickness: 200,
            wall_insulation: null,
            window_type: 'double',
            window_uValue: 2.8,
            has_insulation: false,
            infiltration_rate: 1.0
        },
        attic_room: {
            name: 'Мансардное помещение',
            description: 'Жилое помещение на последнем этаже под крышей',
            wall_material: 'wood',
            wall_thickness: 200,
            wall_insulation: 'mineral_wool',
            wall_insulation_thickness: 150,
            window_type: 'triple',
            window_uValue: 1.6,
            has_insulation: true,
            infiltration_rate: 0.5
        },
        basement_room: {
            name: 'Цокольный этаж',
            description: 'Помещение частично или полностью ниже уровня земли',
            wall_material: 'concrete',
            wall_thickness: 300,
            wall_insulation: 'extruded_polystyrene',
            wall_insulation_thickness: 100,
            window_type: 'double',
            window_uValue: 2.8,
            has_insulation: true,
            infiltration_rate: 0.3
        },
        modern_apartment: {
            name: 'Современная квартира (2020+)',
            description: 'Квартира в новостройке с энергоэффективными решениями',
            wall_material: 'aerated_concrete',
            wall_thickness: 400,
            wall_insulation: 'extruded_polystyrene',
            wall_insulation_thickness: 80,
            window_type: 'energy',
            window_uValue: 1.0,
            has_insulation: true,
            infiltration_rate: 0.25
        }
    },
    
    // КЛИМАТИЧЕСКИЕ ЗОНЫ
    climateZones: {
        moscow: {
            name: 'Москва',
            winterTemp: -20,
            heatingPeriod: 220,
            degreeDays: 4943,
            normativeWallR: 3.15,
            normativeWindowU: 2.1
        },
        spb: {
            name: 'Санкт-Петербург',
            winterTemp: -18,
            heatingPeriod: 210,
            degreeDays: 4600,
            normativeWallR: 3.08,
            normativeWindowU: 2.1
        },
        ekaterinburg: {
            name: 'Екатеринбург',
            winterTemp: -24,
            heatingPeriod: 230,
            degreeDays: 5400,
            normativeWallR: 3.5,
            normativeWindowU: 2.0
        },
        sochi: {
            name: 'Сочи',
            winterTemp: -5,
            heatingPeriod: 150,
            degreeDays: 2000,
            normativeWallR: 2.1,
            normativeWindowU: 2.5
        },
        kazan: {
            name: 'Казань',
            winterTemp: -22,
            heatingPeriod: 215,
            degreeDays: 5100,
            normativeWallR: 3.3,
            normativeWindowU: 2.0
        },
        novosibirsk: {
            name: 'Новосибирск',
            winterTemp: -28,
            heatingPeriod: 240,
            degreeDays: 6200,
            normativeWallR: 3.8,
            normativeWindowU: 1.8
        }
    },
    
    // ПОДСКАЗКИ для всех полей
    tooltips: {
        // Простой режим
        preset: {
            text: 'Выберите тип здания для автоматической подстановки стандартных параметров',
            normative: 'СНиП 23-02-2003: Тепловая защита зданий'
        },
        dimensions: {
            length: 'Внешние габариты помещения. Влияет на площадь ограждающих конструкций.',
            width: 'Ширина помещения по внешним стенам',
            height: 'Высота от пола до потолка. Учитывается для расчета объема и площади стен'
        },
        building_type: 'Тип здания определяет стандартные конструктивные решения и теплопотери',
        window_type: 'Тип остекления. Чем ниже коэффициент теплопередачи (U-value), тем лучше теплоизоляция.',
        
        // Расширенный режим
        wall_material: {
            text: 'Основной материал несущих стен. Влияет на теплопроводность и теплоемкость.',
            normative: 'СНиП 23-02-2003: для Москвы сопротивление теплопередаче стен R≥3.15 м²·°C/Вт',
            example: 'Кирпич: λ=0.7 Вт/(м·°C), Бетон: λ=1.7 Вт/(м·°C)'
        },
        wall_thickness: 'Толщина несущей стены без учета отделки и утеплителя',
        insulation_material: 'Материал дополнительного утепления. Указывается сопротивление теплопередаче (R) для выбранной толщины.',
        insulation_thickness: 'Толщина слоя утеплителя. Увеличение толщины пропорционально увеличивает сопротивление теплопередаче.',
        window_uValue: 'Коэффициент теплопередачи окна (U-value). Чем меньше значение, тем лучше теплоизоляция. Норма для Москвы: 2.1 Вт/(м²·°C)',
        door_uValue: 'Коэффициент теплопередачи двери. Учитывается для наружных двери.',
        infiltration: 'Инфильтрация - неконтролируемое поступление холодного воздуха через щели. Зависит от качества строительства.',
        orientation: 'Ориентация по сторонам света влияет на солнечную радиацию и ветровую нагрузку'
    }
};

// ========================== ПРОСТОЙ РЕЖИМ ==========================
window.roomConfig.simple = {
    name: 'Параметры помещения (простой режим)',
    categories: {
        building: {
            name: 'Помещение',
            subsections: {
                preset: {
                    name: 'Тип здания',
                    fields: {
                        preset: {
                            type: 'select',
                            label: 'Выберите тип здания',
                            options: [
                                { value: 'apartment_panel_1990', label: 'Квартира в панельном доме (1990-е)' },
                                { value: 'apartment_brick', label: 'Квартира в кирпичном доме' },
                                { value: 'private_house_soviet', label: 'Частный дом советской постройки' },
                                { value: 'modern_cottage', label: 'Современный коттедж (после 2010)' },
                                { value: 'office_space', label: 'Офисное помещение' },
                                { value: 'attic_room', label: 'Мансардное помещение' },
                                { value: 'basement_room', label: 'Цокольный этаж' },
                                { value: 'modern_apartment', label: 'Современная квартира (2020+)' }
                            ],
                            default: 'apartment_panel_1990',
                            required: true,
                            tooltip: 'preset'
                        }
                    }
                },
                dimensions: {
                    name: 'Габариты помещения',
                    fields: {
                        length: {
                            type: 'number',
                            label: 'Длина (м)',
                            min: 1, max: 100, step: 0.1, default: 10,
                            required: true, tooltip: 'dimensions.length'
                        },
                        width: {
                            type: 'number', 
                            label: 'Ширина (м)',
                            min: 1, max: 100, step: 0.1, default: 8,
                            required: true, tooltip: 'dimensions.width'
                        },
                        height: {
                            type: 'number',
                            label: 'Высота (м)',
                            min: 1, max: 10, step: 0.1, default: 3,
                            required: true, tooltip: 'dimensions.height'
                        }
                    }
                },
                windows: {
                    name: 'Окна',
                    fields: {
                        window_type: {
                            type: 'select',
                            label: 'Тип окон',
                            options: [
                                { value: 'single', label: 'Одно стекло (U=5,7)' },
                                { value: 'double', label: 'Двойной стеклопакет (U=2,8)' },
                                { value: 'triple', label: 'Тройной стеклопакет (U=1,6)' },
                                { value: 'energy', label: 'Энергосберегающие (U=1,0)' }
                            ],
                            default: 'double', required: true, tooltip: 'window_type'
                        },
                        window_count: {
                            type: 'number',
                            label: 'Количество окон',
                            min: 1, max: 50, default: 3, required: true
                        }
                    }
                },
                insulation: {
                    name: 'Утепление',
                    fields: {
                        has_insulation: {
                            type: 'checkbox',
                            label: 'Дополнительное утепление стен',
                            default: false,
                            tooltip: 'Дополнительный слой утеплителя на фасаде'
                        },
                        insulation_type: {
                            type: 'select',
                            label: 'Тип утеплителя',
                            options: [
                                { value: 'mineral_wool', label: 'Минвата 100мм (R=2,2)' },
                                { value: 'polystyrene', label: 'Пенополистирол 50мм (R=1,3)' },
                                { value: 'extruded_polystyrene', label: 'Экструдированный пенополистирол 100мм (R=3,3)' },
                                { value: 'polyurethane_foam', label: 'Пенополиуретан 80мм (R=3,2)' }
                            ],
                            default: 'mineral_wool', required: false,
                            showCondition: 'has_insulation'
                        }
                    }
                },
                additional: {
                    name: 'Дополнительные параметры',
                    fields: {
                        floor_level: {
                            type: 'select',
                            label: 'Этаж расположения',
                            options: [
                                {value: 'first', label: 'Первый этаж'},
                                {value: 'middle', label: 'Средний этаж'},
                                {value: 'last', label: 'Последний этаж'},
                                {value: 'attic', label: 'Мансарда'},
                                {value: 'basement', label: 'Цокольный этаж'}
                            ],
                            default: 'middle', required: true,
                            tooltip: 'Этаж расположения помещения влияет на теплопотери через пол и потолок'
                        },
                        building_height: {
                            type: 'number',
                            label: 'Высота здания (этажей)',
                            min: 1, max: 50, default: 5, required: true,
                            tooltip: 'Высота здания в этажах влияет на поправочные коэффициенты для инфильтрации'
                        },
                        occupancy: {
                            type: 'number',
                            label: 'Количество жильцов',
                            min: 1, max: 20, default: 3, required: true,
                            tooltip: 'Количество людей, находящихся в помещении, влияет на внутренние тепловыделения (около 100 Вт на человека)'
                        }
                    }
                }
            }
        },
        climate: {
            name: 'Атмосфера',
            subsections: {
                climate: {
                    name: 'Климатические условия',
                    fields: {
                        climate_zone: {
                            type: 'select',
                            label: 'Регион',
                            options: [
                                { value: 'moscow', label: 'Москва (-20°C)' },
                                { value: 'spb', label: 'Санкт-Петербург (-18°C)' },
                                { value: 'ekaterinburg', label: 'Екатеринбург (-24°C)' },
                                { value: 'sochi', label: 'Сочи (-5°C)' },
                                { value: 'kazan', label: 'Казань (-22°C)' },
                                { value: 'novosibirsk', label: 'Новосибирск (-28°C)' }
                            ],
                            default: 'moscow', required: true
                        },
                        inside_temp: {
                            type: 'number',
                            label: 'Желаемая температура внутри (°C)',
                            min: 10, max: 30, step: 0.5, default: 22, required: true
                        }
                    }
                }
            }
        }
    }
};

// ========================== РАСШИРЕННЫЙ РЕЖИМ ==========================
window.roomConfig.advanced = {
    name: 'Параметры помещения',
    categories: {
        room: {
            name: 'Помещение',
            subsections: {
                dimensions: {
                    name: 'Габариты помещения',
                    fields: {
                        length: {
                            type: 'number',
                            label: 'Длина (м)',
                            min: 1, max: 100, step: 0.1, default: 10,
                            required: true, tooltip: 'dimensions.length'
                        },
                        width: {
                            type: 'number', 
                            label: 'Ширина (м)',
                            min: 1, max: 100, step: 0.1, default: 8,
                            required: true, tooltip: 'dimensions.width'
                        },
                        height: {
                            type: 'number',
                            label: 'Высота (м)',
                            min: 1, max: 10, step: 0.1, default: 3,
                            required: true, tooltip: 'dimensions.height'
                        }
                    }
                },
                building_location: {
                    name: 'Расположение здания',
                    fields: {
                        orientation: {
                            type: 'select',
                            label: 'Ориентация основной стены',
                            options: [
                                {value: 'north', label: 'Север'},
                                {value: 'south', label: 'Юг'},
                                {value: 'east', label: 'Восток'},
                                {value: 'west', label: 'Запад'},
                                {value: 'north_east', label: 'Северо-Восток'},
                                {value: 'north_west', label: 'Северо-Запад'},
                                {value: 'south_east', label: 'Юго-Восток'},
                                {value: 'south_west', label: 'Юго-Запад'}
                            ],
                            default: 'south', required: true,
                            tooltip: 'Ориентация по сторонам света влияет на солнечную радиацию и ветровую нагрузку'
                        },
                        wind_exposure: {
                            type: 'select',
                            label: 'Открытость ветру',
                            options: [
                                {value: 'protected', label: 'Защищенное (внутри квартала)'},
                                {value: 'normal', label: 'Нормальное'},
                                {value: 'exposed', label: 'Открытое (на углу, у воды)'},
                                {value: 'very_exposed', label: 'Сильно открытое (холм, побережье)'}
                            ],
                            default: 'normal', required: true,
                            tooltip: 'Открытость ветру влияет на инфильтрацию и теплопотери'
                        },
                        altitude: {
                            type: 'number',
                            label: 'Высота над уровнем моря (м)',
                            min: 0, max: 2000, default: 150, required: true,
                            tooltip: 'Высота над уровнем моря влияет на плотность воздуха и давление'
                        }
                    }
                },
                walls: {
                    name: 'Стены',
                    fields: {
                        material: {
                            type: 'select',
                            label: 'Материал стен',
                            options: [
                                { value: 'brick', label: 'Кирпич', thickness: 0.38, conductivity: 0.7 },
                                { value: 'concrete', label: 'Бетон', thickness: 0.3, conductivity: 1.7 },
                                { value: 'wood', label: 'Дерево', thickness: 0.2, conductivity: 0.15 },
                                { value: 'foam_block', label: 'Пеноблок', thickness: 0.4, conductivity: 0.12 },
                                { value: 'aerated_concrete', label: 'Газобетон', thickness: 0.3, conductivity: 0.14 }
                            ],
                            default: 'brick', required: true,
                            tooltip: 'wall_material'
                        },
                        thickness: {
                            type: 'number',
                            label: 'Толщина (мм)',
                            min: 50, max: 1000, default: 380, required: true,
                            tooltip: 'wall_thickness'
                        }
                    }
                },
                insulation: {
                    name: 'Утеплитель',
                    fields: {
                        material: {
                            type: 'select',
                            label: 'Материал утеплителя',
                            options: [
                                { value: 'mineral_wool', label: 'Минеральная вата (λ=0.045)' },
                                { value: 'polystyrene', label: 'Пенополистирол (λ=0.038)' },
                                { value: 'extruded_polystyrene', label: 'Экструдированный пенополистирол (λ=0.03)' },
                                { value: 'polyurethane_foam', label: 'Пенополиуретан (λ=0.025)' },
                                { value: 'ecowool', label: 'Эковата (λ=0.04)' }
                            ],
                            default: 'mineral_wool', required: true,
                            tooltip: 'insulation_material'
                        },
                        thickness: {
                            type: 'number',
                            label: 'Толщина (мм)',
                            min: 10, max: 500, default: 100, required: true,
                            tooltip: 'insulation_thickness'
                        }
                    }
                },
                windows: {
                    name: 'Окна',
                    repeatable: true,
                    fields: {
                        type: {
                            type: 'select',
                            label: 'Тип окна',
                            options: [
                                { value: 'single', label: 'Одно стекло (U=5.7)' },
                                { value: 'double', label: 'Двойной стеклопакет (U=2.8)' },
                                { value: 'triple', label: 'Тройной стеклопакет (U=1.6)' },
                                { value: 'energy', label: 'Энергосберегающий (U=1.0)' }
                            ],
                            default: 'double', required: true, tooltip: 'window_uValue'
                        },
                        chambers: {
                            type: 'select',
                            label: 'Количество камер',
                            options: [
                                { value: '1', label: '1 камера' },
                                { value: '2', label: '2 камеры' },
                                { value: '3', label: '3 камеры' },
                                { value: '4+', label: '4+ камер' }
                            ],
                            default: '2', required: true
                        },
                        width: {
                            type: 'number',
                            label: 'Ширина (м)',
                            min: 0.1, max: 10, step: 0.1, default: 1.2, required: true
                        },
                        height: {
                            type: 'number',
                            label: 'Высота (м)',
                            min: 0.1, max: 10, step: 0.1, default: 1.5, required: true
                        },
                        count: {
                            type: 'number',
                            label: 'Количество',
                            min: 1, max: 50, default: 1, required: true
                        }
                    }
                },
                doors: {
                    name: 'Двери',
                    repeatable: true,
                    fields: {
                        type: {
                            type: 'select',
                            label: 'Тип двери',
                            options: [
                                { value: 'wood', label: 'Деревянная (U=2.0)' },
                                { value: 'metal', label: 'Металлическая (U=5.0)' },
                                { value: 'plastic', label: 'Пластиковая (U=1.8)' },
                                { value: 'insulated', label: 'Утепленная (U=1.2)' }
                            ],
                            default: 'wood', required: true, tooltip: 'door_uValue'
                        },
                        material: {
                            type: 'select',
                            label: 'Материал',
                            options: [
                                { value: 'pvc', label: 'ПВХ' },
                                { value: 'wood', label: 'Дерево' },
                                { value: 'aluminum', label: 'Алюминий' },
                                { value: 'composite', label: 'Комбинированный' }
                            ],
                            default: 'wood', required: true
                        },
                        insulation: {
                            type: 'select',
                            label: 'Утеплитель',
                            options: [
                                { value: 'none', label: 'Без утеплителя' },
                                { value: 'polystyrene', label: 'Пенополистирол' },
                                { value: 'mineral', label: 'Минеральная вата' },
                                { value: 'polyurethane', label: 'Пенополиуретан' }
                            ],
                            default: 'none', required: true
                        },
                        thickness: {
                            type: 'number',
                            label: 'Толщина (мм)',
                            min: 10, max: 200, default: 40, required: true
                        },
                        width: {
                            type: 'number',
                            label: 'Ширина (м)',
                            min: 0.5, max: 3, step: 0.1, default: 0.9, required: true
                        },
                        height: {
                            type: 'number',
                            label: 'Высота (м)',
                            min: 1.5, max: 3, step: 0.1, default: 2.1, required: true
                        }
                    }
                },
                floor: {
                    name: 'Пол',
                    fields: {
                        material: {
                            type: 'select',
                            label: 'Материал пола',
                            options: [
                                { value: 'concrete', label: 'Бетон', conductivity: 1.7 },
                                { value: 'wood', label: 'Дерево', conductivity: 0.15 },
                                { value: 'tile', label: 'Плитка', conductivity: 1.3 },
                                { value: 'laminate', label: 'Ламинат', conductivity: 0.12 }
                            ],
                            default: 'concrete', required: true
                        },
                        thickness: {
                            type: 'number',
                            label: 'Толщина (мм)',
                            min: 10, max: 500, default: 100, required: true
                        },
                        under: {
                            type: 'select',
                            label: 'Под полом',
                            options: [
                                { value: 'basement', label: 'Погреб' },
                                { value: 'ground', label: 'Грунт' },
                                { value: 'basement_floor', label: 'Цокольный этаж' },
                                { value: 'other_room', label: 'Другое помещение' }
                            ],
                            default: 'ground', required: true
                        },
                        ground_type: {
                            type: 'select',
                            label: 'Тип грунта',
                            options: [
                                { value: 'clay', label: 'Глина' },
                                { value: 'sand', label: 'Песок' },
                                { value: 'gravel', label: 'Щебень' },
                                { value: 'mixed', label: 'Смешанный' }
                            ],
                            default: 'clay', required: false,
                            showCondition: { field: 'under', value: 'ground' }
                        },
                        basement_temp: {
                            type: 'number',
                            label: 'Температура в подвале (°C)',
                            min: -10, max: 20, default: 5, required: false,
                            showCondition: { field: 'under', value: 'basement' }
                        }
                    }
                },
                ceiling: {
                    name: 'Потолок',
                    fields: {
                        material: {
                            type: 'select',
                            label: 'Материал потолка',
                            options: [
                                { value: 'concrete_slab', label: 'Бетонная плита', conductivity: 1.7 },
                                { value: 'wood_beam', label: 'Деревянное перекрытие', conductivity: 0.15 },
                                { value: 'plasterboard', label: 'Гипсокартон', conductivity: 0.25 },
                                { value: 'metal_profiles', label: 'Металлический профиль', conductivity: 50 }
                            ],
                            default: 'concrete_slab', required: true
                        },
                        thickness: {
                            type: 'number',
                            label: 'Толщина (мм)',
                            min: 10, max: 500, default: 150, required: true
                        },
                        above: {
                            type: 'select',
                            label: 'Над потолком',
                            options: [
                                { value: 'attic', label: 'Чердак' },
                                { value: 'second_floor', label: 'Второй этаж' },
                                { value: 'roof', label: 'Крыша' },
                                { value: 'other_room_up', label: 'Другое помещение' }
                            ],
                            default: 'attic', required: true
                        },
                        attic_insulation_thickness: {
                            type: 'number',
                            label: 'Толщина утепления чердака (мм)',
                            min: 50, max: 500, default: 200, required: false,
                            showCondition: { field: 'above', value: 'attic' }
                        },
                        attic_ventilation: {
                            type: 'checkbox',
                            label: 'Вентиляция чердака',
                            default: true,
                            showCondition: { field: 'above', value: 'attic' }
                        },
                        roof_material: {
                            type: 'select',
                            label: 'Материал кровли',
                            options: [
                                { value: 'metal', label: 'Металлочерепица' },
                                { value: 'soft', label: 'Мягкая кровля' },
                                { value: 'slate', label: 'Шифер' },
                                { value: 'tile', label: 'Черепица' }
                            ],
                            default: 'metal',
                            showCondition: { field: 'above', value: 'roof' }
                        }
                    }
                },
                internal_gains: {
                    name: 'Внутренние тепловыделения',
                    fields: {
                        occupancy: {
                            type: 'number',
                            label: 'Количество людей',
                            min: 0, max: 50, default: 3, required: true,
                            tooltip: 'Количество людей, находящихся в помещении, влияет на внутренние тепловыделения (около 100 Вт на человека)'
                        },
                        lighting_power: {
                            type: 'number',
                            label: 'Мощность освещения (Вт)',
                            min: 0, max: 5000, default: 300, required: true,
                            tooltip: 'Мощность освещения, преобразующаяся в тепло (примерно 90% мощности становится теплом)'
                        },
                        equipment_power: {
                            type: 'number',
                            label: 'Мощность оборудования (Вт)',
                            min: 0, max: 10000, default: 500, required: true,
                            tooltip: 'Мощность оборудования (компьютеры, бытовая техника), выделяющая тепло (70-90% мощности)'
                        }
                    }
                }
            }
        },
        atmosphere: {
            name: 'Атмосфера',
            subsections: {
                temperatures: {
                    name: 'Температурные условия',
                    fields: {
                        outside_temp: {
                            type: 'number',
                            label: 'Температура на улице (°C)',
                            min: -50, max: 50, step: 1, default: -20, required: true
                        },
                        inside_temp: {
                            type: 'number',
                            label: 'Желаемая температура в помещении (°C)',
                            min: 10, max: 30, step: 0.5, default: 22, required: true
                        }
                    }
                },
                humidity: {
                    name: 'Влажность',
                    fields: {
                        inside_humidity: {
                            type: 'number',
                            label: 'Влажность внутри (%)',
                            min: 20, max: 80, default: 50, required: true
                        },
                        outside_humidity: {
                            type: 'number',
                            label: 'Влажность снаружи (%)',
                            min: 20, max: 100, default: 80, required: true
                        }
                    }
                },
                infiltration: {
                    name: 'Инфильтрация',
                    fields: {
                        air_change_rate: {
                            type: 'number',
                            label: 'Кратность воздухообмена (1/ч)',
                            min: 0.1, max: 2.0, step: 0.1, default: 0.5, required: true,
                            tooltip: 'infiltration'
                        },
                        quality: {
                            type: 'select',
                            label: 'Качество уплотнений',
                            options: [
                                { value: 'poor', label: 'Плохое (старые окна, щели)' },
                                { value: 'average', label: 'Среднее (обычные пластиковые окна)' },
                                { value: 'good', label: 'Хорошее (качественный монтаж)' },
                                { value: 'excellent', label: 'Отличное (пассивный дом)' }
                            ],
                            default: 'average', required: true
                        }
                    }
                },
                ventilation: {
                    name: 'Вентиляция',
                    fields: {
                        ventilation_type: {
                            type: 'select',
                            label: 'Тип вентиляции',
                            options: [
                                { value: 'natural', label: 'Естественная' },
                                { value: 'supply', label: 'Приточная' },
                                { value: 'exhaust', label: 'Вытяжная' },
                                { value: 'balanced', label: 'Приточно-вытяжная' },
                                { value: 'balanced_with_recovery', label: 'Приточно-вытяжная с рекуперацией' }
                            ],
                            default: 'natural', required: true,
                            tooltip: 'Тип системы вентиляции. Влияет на потери тепла с вентиляционным воздухом'
                        },
                        heat_recovery_efficiency: {
                            type: 'number',
                            label: 'КПД рекуператора (%)',
                            min: 0, max: 95, default: 0, required: false,
                            tooltip: 'Коэффициент полезного действия рекуператора. Эффективность передачи тепла от вытяжного воздуха приточному',
                            showCondition: { field: 'ventilation_type', value: 'balanced_with_recovery' }
                        },
                        ventilation_rate: {
                            type: 'number',
                            label: 'Расход воздуха (м³/ч на чел)',
                            min: 10, max: 100, default: 30, required: false,
                            showCondition: { 
                                field: 'ventilation_type', 
                                values: ['balanced', 'balanced_with_recovery'] 
                            }
                        }
                    }
                }
            }
        },
        heating: {
            name: 'Отопление',
            subsections: {
                system_general: {
                    name: 'Общие параметры системы отопления',
                    fields: {
                        // Исправлено: теперь system_type имеет корректное определение
                        system_type: {
                            type: 'select',
                            label: 'Тип системы отопления',
                            options: [
                                { value: 'radiator', label: 'Радиаторная' },
                                { value: 'floor', label: 'Тёплый пол' },
                                { value: 'combined', label: 'Комбинированная (радиаторы + тёплый пол)' },
                                { value: 'air', label: 'Воздушная' },
                                { value: 'electric', label: 'Электрическая' }
                            ],
                            default: 'radiator',
                            required: true,
                            tooltip: 'system_type'
                        },
                        temperature_graph: {
                            type: 'select',
                            label: 'Температурный график',
                            options: [
                                { value: '90/70/20', label: '90/70/20 °C' },
                                { value: '75/65/20', label: '75/65/20 °C' },
                                { value: '55/45/20', label: '55/45/20 °C' },
                                { value: '45/35/20', label: '45/35/20 °C' },
                                { value: 'custom', label: 'Свой график' }
                            ],
                            default: '75/65/20', required: true, tooltip: 'temperature_graph'
                        },
                        temperature_supply: {
                            type: 'number',
                            label: 'Температура подачи (°C)',
                            min: 30, max: 120, default: 75, required: true,
                            showCondition: { field: 'system_general_temperature_graph', value: 'custom' }
                        },
                        temperature_return: {
                            type: 'number',
                            label: 'Температура обратки (°C)',
                            min: 20, max: 100, default: 65, required: true,
                            showCondition: { field: 'system_general_temperature_graph', value: 'custom' }
                        },
                        coolant_type: {
                            type: 'select',
                            label: 'Тип теплоносителя',
                            options: [
                                { value: 'water', label: 'Вода' },
                                { value: 'glycol', label: 'Этиленгликоль/Пропиленгликоль' }
                            ],
                            default: 'water', required: true, tooltip: 'coolant_type'
                        },
                        glycol_concentration: {
                            type: 'number',
                            label: 'Концентрация гликоля (%)',
                            min: 10, max: 60, default: 30, required: false,
                            showCondition: { field: 'system_general_coolant_type', value: 'glycol' }
                        },
                        system_height: {
                            type: 'number',
                            label: 'Высота системы над котлом (м)',
                            min: 0, max: 50, default: 5, required: true, tooltip: 'system_height'
                        }
                    }
                },
                radiators: {
                    name: 'Радиаторы',
                    fields: {
                        radiator_type: {
                            type: 'select',
                            label: 'Тип радиатора',
                            options: [
                                { value: 'aluminum', label: 'Алюминиевый секционный' },
                                { value: 'bimetal', label: 'Биметаллический секционный' },
                                { value: 'cast_iron', label: 'Чугунный секционный' },
                                { value: 'steel_panel', label: 'Стальной панельный' },
                                { value: 'steel_tubular', label: 'Стальной трубчатый' }
                            ],
                            default: 'aluminum', required: true, tooltip: 'radiator_type'
                        },
                        radiator_model: {
                            type: 'text',
                            label: 'Модель/Производитель',
                            default: '', required: false, tooltip: 'radiator_model'
                        },
                        height: {
                            type: 'number',
                            label: 'Высота (мм)',
                            min: 200, max: 1000, default: 500, required: true, tooltip: 'radiator_height'
                        },
                        heat_output_per_section: {
                            type: 'number',
                            label: 'Теплоотдача секции/панели (Вт)',
                            min: 50, max: 500, default: 180, required: true, tooltip: 'heat_output_per_section'
                        },
                        standard_delta: {
                            type: 'select',
                            label: 'Стандартный Δt для теплоотдачи',
                            options: [
                                { value: '50', label: '50°C' },
                                { value: '60', label: '60°C' }
                            ],
                            default: '50', required: true, tooltip: 'standard_delta'
                        },
                        sections_count: {
                            type: 'number',
                            label: 'Количество секций/панелей',
                            min: 1, max: 100, default: 6, required: true, tooltip: 'sections_count'
                        },
                        radiator_count: {
                            type: 'number',
                            label: 'Количество радиаторов этого типа',
                            min: 1, max: 20, default: 1, required: true, tooltip: 'radiator_count'
                        },
                        connection_type: {
                            type: 'select',
                            label: 'Способ подключения',
                            options: [
                                { value: 'side', label: 'Боковое' },
                                { value: 'bottom', label: 'Нижнее' },
                                { value: 'diagonal', label: 'Диагональное' }
                            ],
                            default: 'side', required: true, tooltip: 'connection_type'
                        },
                        installation_factor: {
                            type: 'number',
                            label: 'Коэффициент установки',
                            min: 0.5, max: 1.5, step: 0.05, default: 1.0, required: true, tooltip: 'installation_factor'
                        }
                    }
                },
                floor_heating: {
                    name: 'Тёплый пол',
                    fields: {
                        enabled: {
                            type: 'checkbox',
                            label: 'Использовать тёплый пол',
                            default: false,
                            tooltip: 'floor_heating_enabled'
                        },
                        type: {
                            type: 'select',
                            label: 'Тип системы',
                            options: [
                                { value: 'water', label: 'Водяной' },
                                { value: 'electric', label: 'Электрический' }
                            ],
                            default: 'water',
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_type'
                        },
                        room_type: {
                            type: 'select',
                            label: 'Тип помещения',
                            options: [
                                { value: 'living', label: 'Жилая комната' },
                                { value: 'bathroom', label: 'Ванная' },
                                { value: 'kitchen', label: 'Кухня' },
                                { value: 'other', label: 'Другое' }
                            ],
                            default: 'living',
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_room_type'
                        },
                        area: {
                            type: 'number',
                            label: 'Площадь тёплого пола (м²)',
                            min: 0, max: 500, default: 20,
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_area'
                        },
                        covering_type: {
                            type: 'select',
                            label: 'Тип покрытия',
                            options: [
                                { value: 'tile', label: 'Керамическая плитка' },
                                { value: 'laminate', label: 'Ламинат' },
                                { value: 'parquet', label: 'Паркет/доска' },
                                { value: 'linoleum', label: 'Линолеум/ковролин' }
                            ],
                            default: 'tile',
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_covering_type'
                        },
                        // Поля для водяного тёплого пола
                        water_temperature_supply: {
                            type: 'number',
                            label: 'Температура подачи в контур (°C)',
                            min: 20, max: 60, default: 40,
                            required: false,
                            showCondition: { field: 'floor_heating_type', value: 'water' },
                            tooltip: 'floor_heating_water_temperature'
                        },
                        pipe_material: {
                            type: 'select',
                            label: 'Материал трубы',
                            options: [
                                { value: 'pex', label: 'PEX' },
                                { value: 'pert', label: 'PE-RT' },
                                { value: 'metal_plastic', label: 'Металлопластик' }
                            ],
                            default: 'pex',
                            required: false,
                            showCondition: { field: 'floor_heating_type', value: 'water' },
                            tooltip: 'floor_heating_pipe_material'
                        },
                        pipe_diameter: {
                            type: 'select',
                            label: 'Наружный диаметр трубы (мм)',
                            options: [
                                { value: '16', label: '16' },
                                { value: '17', label: '17' },
                                { value: '20', label: '20' }
                            ],
                            default: '16',
                            required: false,
                            showCondition: { field: 'floor_heating_type', value: 'water' },
                            tooltip: 'floor_heating_pipe_diameter'
                        },
                        pipe_wall_thickness: {
                            type: 'number',
                            label: 'Толщина стенки трубы (мм)',
                            min: 1, max: 5, step: 0.1, default: 2.0,
                            required: false,
                            showCondition: { field: 'floor_heating_type', value: 'water' },
                            tooltip: 'floor_heating_pipe_wall_thickness'
                        },
                        laying_step: {
                            type: 'number',
                            label: 'Шаг укладки (мм)',
                            min: 50, max: 300, step: 10, default: 150,
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_laying_step'
                        },
                        screed_thickness: {
                            type: 'number',
                            label: 'Толщина стяжки над трубой (мм)',
                            min: 30, max: 150, default: 50,
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_screed_thickness'
                        },
                        insulation_below: {
                            type: 'checkbox',
                            label: 'Утеплитель снизу',
                            default: true,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_insulation_below'
                        },
                        insulation_type: {
                            type: 'select',
                            label: 'Тип утеплителя',
                            options: [
                                { value: 'extruded_polystyrene', label: 'Экструдированный пенополистирол' },
                                { value: 'mineral_wool', label: 'Минеральная вата' },
                                { value: 'polystyrene', label: 'Пенополистирол' }
                            ],
                            default: 'extruded_polystyrene',
                            required: false,
                            showCondition: { field: 'floor_heating_insulation_below', value: true },
                            tooltip: 'floor_heating_insulation_type'
                        },
                        insulation_thickness: {
                            type: 'number',
                            label: 'Толщина утеплителя (мм)',
                            min: 20, max: 200, default: 50,
                            required: false,
                            showCondition: { field: 'floor_heating_insulation_below', value: true },
                            tooltip: 'floor_heating_insulation_thickness'
                        },
                        max_surface_temp: {
                            type: 'number',
                            label: 'Макс. температура поверхности (°C)',
                            min: 20, max: 35, default: 26,
                            required: false,
                            showCondition: { field: 'floor_heating_enabled', value: true },
                            tooltip: 'floor_heating_max_surface_temp'
                        }
                    }
                }
            }
        }
    }
};

// Добавляем новые подсказки в tooltips
Object.assign(window.roomConfig.tooltips, {
    system_type: 'Выберите тип системы отопления',
    temperature_graph: 'Температурный график системы',
    coolant_type: 'Тип теплоносителя влияет на теплоемкость и плотность',
    glycol_concentration: 'Концентрация гликоля для незамерзающих жидкостей',
    system_height: 'Высота самой верхней точки системы относительно котла',
    radiator_type: 'Тип радиатора',
    radiator_model: 'Модель для справки',
    radiator_height: 'Монтажная высота радиатора',
    heat_output_per_section: 'Теплоотдача при стандартном температурном напоре',
    standard_delta: 'Температурный напор, при котором указана теплоотдача',
    sections_count: 'Количество секций или панелей',
    radiator_count: 'Количество одинаковых радиаторов',
    connection_type: 'Способ подключения влияет на коэффициент теплоотдачи',
    installation_factor: 'Коэффициент, учитывающий установку',
    floor_heating_enabled: 'Включить расчёт тёплого пола',
    floor_heating_type: 'Выберите тип системы: водяной или электрический',
    floor_heating_room_type: 'Тип помещения влияет на допустимую температуру поверхности',
    floor_heating_area: 'Площадь, занятая тёплым полом',
    floor_heating_covering_type: 'Тип напольного покрытия',
    floor_heating_water_temperature: 'Температура теплоносителя в контуре тёплого пола',
    floor_heating_pipe_material: 'Материал трубы',
    floor_heating_pipe_diameter: 'Наружный диаметр трубы',
    floor_heating_pipe_wall_thickness: 'Толщина стенки трубы',
    floor_heating_laying_step: 'Шаг укладки трубы',
    floor_heating_screed_thickness: 'Толщина стяжки над трубой',
    floor_heating_insulation_below: 'Наличие утеплителя под трубами',
    floor_heating_insulation_type: 'Тип утеплителя',
    floor_heating_insulation_thickness: 'Толщина утеплителя',
    floor_heating_max_surface_temp: 'Максимально допустимая температура поверхности пола'
});

// ========== СИСТЕМА ЗАВИСИМОСТЕЙ И ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ ==========
Object.assign(window.roomConfig, {
    dependencies: {
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
                        ceiling: ['roof_material']
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
                        ventilation: ['heat_recovery_efficiency']
                    }
                }
            },
            // Обновлённые зависимости для тёплого пола (без circuits_count и circuit_length)
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
                            'water_temperature_supply',
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
                            'water_temperature_supply',
                            'pipe_material', 'pipe_diameter', 'pipe_wall_thickness'
                        ]
                    }
                },
                electric: {
                    hideFields: {
                        floor_heating: [
                            'water_temperature_supply',
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
            // Зависимость для температурного графика
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
    },
    
    dependencyManager: {
        applyDependencies: function(changedFieldId, currentData, mode) {
            const dependencies = window.roomConfig.dependencies[mode];
            const changes = {
                hideFields: [],
                showFields: [],
                setDefaults: {},
                recommendations: []
            };
            
            if (!dependencies) return changes;
            
            // Обрабатываем зависимости для выбранного пресета
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
            
            // Обрабатываем зависимости по значению
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
            
            // Проверяем все правила скрытия
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
    },
    
    extendMaterials: function() {
        Object.keys(this.materials).forEach(materialKey => {
            const material = this.materials[materialKey];
            
            if (!material.density) {
                const densities = {
                    brick: 1800, concrete: 2400, wood: 500, foam_block: 600, aerated_concrete: 400,
                    mineral_wool: 50, polystyrene: 35, extruded_polystyrene: 45, polyurethane_foam: 60, ecowool: 65
                };
                material.density = densities[materialKey] || 1000;
            }
            
            if (!material.specific_heat) {
                const specificHeats = {
                    brick: 880, concrete: 880, wood: 2300, foam_block: 880, aerated_concrete: 880,
                    mineral_wool: 840, polystyrene: 1500, extruded_polystyrene: 1500, polyurethane_foam: 1500, ecowool: 2100
                };
                material.specific_heat = specificHeats[materialKey] || 1000;
            }
            
            if (!material.vapor_resistance) {
                const vaporResistances = {
                    brick: 0.11, concrete: 0.03, wood: 0.06, foam_block: 0.26, aerated_concrete: 0.28,
                    mineral_wool: 0.3, polystyrene: 0.23, extruded_polystyrene: 0.18, polyurethane_foam: 0.05, ecowool: 0.3
                };
                material.vapor_resistance = vaporResistances[materialKey] || 0.1;
            }
        });
    },
    
    correctionCoefficients: {
        orientation: {
            north: 1.1, northEast: 1.05, east: 1.0, southEast: 0.95,
            south: 0.9, southWest: 0.95, west: 1.0, northWest: 1.05
        },
        windExposure: {
            protected: 0.95, normal: 1.0, exposed: 1.05, veryExposed: 1.1
        },
        floorPosition: {
            basement: 0.8, firstFloor: 1.2, middleFloor: 1.0, lastFloor: 1.1, attic: 1.3
        }
    },
    
    typicalUValues: {
        walls: {
            soviet_panel: 1.5, brick_250mm: 2.8, brick_380mm: 1.8, brick_510mm: 1.3,
            concrete_200mm: 8.5, concrete_300mm: 5.7, wood_150mm: 1.0, wood_200mm: 0.75,
            aerated_concrete_400mm: 0.35, insulated_wall_modern: 0.25
        },
        windows: {
            single_glass: 5.7, double_glazing: 2.8, double_low_e: 1.8,
            triple_glazing: 1.6, triple_low_e: 1.0, energy_saving: 0.6
        },
        doors: {
            wooden_30mm: 2.0, wooden_40mm: 1.8, wooden_50mm: 1.6,
            metal: 5.0, metal_insulated: 2.5, plastic_insulated: 1.2
        }
    }
});

// Инициализируем расширенные свойства материалов
window.roomConfig.extendMaterials();

// Расширенный режим для помещения (старая переменная для совместимости)
window.roomConfig.advancedModes = {
    room: false
};

// ========== ОБРАТНАЯ СОВМЕСТИМОСТЬ: генерируем плоские sections из categories ==========
(function() {
    function buildSectionsFromCategories(categories) {
        const sections = {};
        for (const catKey in categories) {
            const category = categories[catKey];
            for (const subKey in category.subsections) {
                const subsection = category.subsections[subKey];
                sections[subKey] = {
                    name: subsection.name,
                    fields: subsection.fields
                };
                if (subsection.repeatable) sections[subKey].repeatable = subsection.repeatable;
            }
        }
        return sections;
    }

    if (window.roomConfig.simple && window.roomConfig.simple.categories) {
        window.roomConfig.simple.sections = buildSectionsFromCategories(window.roomConfig.simple.categories);
    }
    if (window.roomConfig.advanced && window.roomConfig.advanced.categories) {
        window.roomConfig.advanced.sections = buildSectionsFromCategories(window.roomConfig.advanced.categories);
    }
})();

console.log('Конфигурация теплопотерь загружена с трёхуровневой структурой и детальными параметрами тёплого пола');
