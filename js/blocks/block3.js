// Блок 3: Расчет теплопотерь и оборудования (максимально детальная версия)
(function() {
    const blockId = 'block3';

    function getBlock1Data() {
        if (typeof window.getRoomParameters === 'function') {
            return window.getRoomParameters();
        }
        return null;
    }

    function getNumber(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    function getBoolean(value, defaultValue = false) {
        return value === true || value === 'true' || value === 'on' || value === 1;
    }

    function fmt(num, digits = 2) {
        return parseFloat(num).toFixed(digits);
    }

    // ---- Коэффициенты из конфигурации ----
    function getOrientationFactor(orientation) {
        const map = {
            north: 1.1, north_east: 1.05, east: 1.0, south_east: 0.95,
            south: 0.9, south_west: 0.95, west: 1.0, north_west: 1.05
        };
        return map[orientation] || 1.0;
    }

    function getWindFactor(exposure) {
        const map = {
            protected: 0.95, normal: 1.0, exposed: 1.05, very_exposed: 1.1
        };
        return map[exposure] || 1.0;
    }

    function getFloorPositionFactor(level) {
        const map = {
            basement: 0.8, first: 1.2, middle: 1.0, last: 1.1, attic: 1.3
        };
        return map[level] || 1.0;
    }

    // ---- Получение материалов из конфига ----
    function getMaterialConductivity(materialKey) {
        return window.roomConfig?.materials?.[materialKey]?.conductivity || 0.7;
    }

    // ---- Обработка повторяемых секций (окна, двери) ----
    function collectWindows(data, mode) {
        let windows = [];
        if (mode === 'simple') {
            const winCount = getNumber(data.windows_window_count, 3);
            const winType = data.windows_window_type || 'double';
            const uMap = { single: 5.7, double: 2.8, triple: 1.6, energy: 1.0 };
            const U = uMap[winType] || 2.8;
            windows.push({
                count: winCount,
                width: 1.2,
                height: 1.5,
                U: U,
                type: winType
            });
        } else {
            if (Array.isArray(data.windows)) {
                data.windows.forEach(w => {
                    windows.push({
                        count: getNumber(w.count, 1),
                        width: getNumber(w.width, 1.2),
                        height: getNumber(w.height, 1.5),
                        U: (() => {
                            const uMap = { single: 5.7, double: 2.8, triple: 1.6, energy: 1.0 };
                            return uMap[w.type] || 2.8;
                        })(),
                        type: w.type || 'double'
                    });
                });
            } else {
                windows.push({
                    count: getNumber(data.windows_count, 1),
                    width: getNumber(data.windows_width, 1.2),
                    height: getNumber(data.windows_height, 1.5),
                    U: (() => {
                        const uMap = { single: 5.7, double: 2.8, triple: 1.6, energy: 1.0 };
                        return uMap[data.windows_type] || 2.8;
                    })(),
                    type: data.windows_type || 'double'
                });
            }
        }
        return windows;
    }

    function collectDoors(data, mode) {
        let doors = [];
        if (mode === 'simple') {
            return doors;
        } else {
            if (Array.isArray(data.doors)) {
                data.doors.forEach(d => {
                    doors.push({
                        count: getNumber(d.count, 1),
                        width: getNumber(d.width, 0.9),
                        height: getNumber(d.height, 2.1),
                        U: (() => {
                            const uMap = { wood: 2.0, metal: 5.0, plastic: 1.8, insulated: 1.2 };
                            let u = uMap[d.type] || 2.0;
                            if (d.insulation && d.insulation !== 'none') u *= 0.8;
                            return u;
                        })(),
                        type: d.type || 'wood'
                    });
                });
            } else {
                doors.push({
                    count: getNumber(data.doors_count, 1),
                    width: getNumber(data.doors_width, 0.9),
                    height: getNumber(data.doors_height, 2.1),
                    U: (() => {
                        const uMap = { wood: 2.0, metal: 5.0, plastic: 1.8, insulated: 1.2 };
                        let u = uMap[data.doors_type] || 2.0;
                        if (data.doors_insulation && data.doors_insulation !== 'none') u *= 0.8;
                        return u;
                    })(),
                    type: data.doors_type || 'wood'
                });
            }
        }
        return doors;
    }

    // ---- Основной расчёт ----
    function calculateDetailed(params) {
        if (!params || !params.data) {
            return { error: 'Нет данных для расчёта' };
        }

        const data = params.data;
        const mode = params.mode || 'simple';
        const config = window.roomConfig || {};

        // --- Геометрия ---
        const L = getNumber(data.dimensions_length, 10);
        const W = getNumber(data.dimensions_width, 8);
        const H = getNumber(data.dimensions_height, 3);
        const P = 2 * (L + W);
        const S_floor = L * W;
        const S_ceiling = S_floor;
        const S_walls_total = P * H;

        // --- Сбор окон и дверей ---
        const windows = collectWindows(data, mode);
        const doors = collectDoors(data, mode);

        let S_windows = 0, S_doors = 0;
        let windowUavg = 0, doorUavg = 0;
        let winCount = 0, doorCount = 0;

        windows.forEach(w => {
            S_windows += w.count * w.width * w.height;
            windowUavg += w.U * w.count * w.width * w.height;
            winCount += w.count;
        });
        if (S_windows > 0) windowUavg /= S_windows;

        doors.forEach(d => {
            S_doors += d.count * d.width * d.height;
            doorUavg += d.U * d.count * d.width * d.height;
            doorCount += d.count;
        });
        if (S_doors > 0) doorUavg /= S_doors;

        const S_walls_net = Math.max(0, S_walls_total - S_windows - S_doors);

        // --- Температуры ---
        let T_in = getNumber(data.climate_inside_temp || data.temperatures_inside_temp, 22);
        let T_out;

        const hasExplicitOutsideTemp = 
            (data.climate_outside_temp !== undefined && data.climate_outside_temp !== '') ||
            (data.temperatures_outside_temp !== undefined && data.temperatures_outside_temp !== '');

        if (hasExplicitOutsideTemp) {
            T_out = getNumber(data.climate_outside_temp || data.temperatures_outside_temp);
        } else {
            if (data.climate_climate_zone && config.climateZones) {
                const zone = config.climateZones[data.climate_climate_zone];
                T_out = zone ? zone.winterTemp : -20;
            } else {
                T_out = -20;
            }
        }

        const dT = T_in - T_out;

        // --- Корректирующие коэффициенты ---
        let orientFactor = 1.0, windFactor = 1.0, floorPosFactor = 1.0;
        let altitude = 0;
        if (mode === 'advanced') {
            const orientation = data.building_location_orientation || 'south';
            orientFactor = getOrientationFactor(orientation);
            const windExp = data.building_location_wind_exposure || 'normal';
            windFactor = getWindFactor(windExp);
            altitude = getNumber(data.building_location_altitude, 150);
        } else {
            const floorLevel = data.additional_floor_level || 'middle';
            floorPosFactor = getFloorPositionFactor(floorLevel);
        }

        const airDensityFactor = Math.max(0.8, 1 - altitude / 8000);

        // --- Стены ---
        let wallU = 1.5, wallThick = 0.38, wallLambda = 0.7, insThick = 0, insLambda = 0;
        let wallMaterial = 'brick', insMaterial = null;

        if (mode === 'advanced') {
            wallMaterial = data.walls_material || 'brick';
            wallThick = getNumber(data.walls_thickness, 380) / 1000;
            wallLambda = getMaterialConductivity(wallMaterial);

            insMaterial = data.insulation_material || null;
            insThick = getNumber(data.insulation_thickness, 0) / 1000;
            insLambda = insMaterial ? getMaterialConductivity(insMaterial) : 0;
        } else {
            // Простой режим: используем данные из пресета (с префиксом preset_)
            let presetWallMaterial = data.preset_wall_material;
            let presetWallThick = data.preset_wall_thickness;
            let presetInsulation = data.preset_wall_insulation;
            let presetInsThick = data.preset_wall_insulation_thickness;

            // Если есть пользовательское утепление (флажок), оно имеет приоритет
            const hasInsulation = getBoolean(data.insulation_has_insulation, false);
            const userInsType = data.insulation_insulation_type;

            if (presetWallMaterial) {
                wallMaterial = presetWallMaterial;
                wallThick = getNumber(presetWallThick, 380) / 1000;
                wallLambda = getMaterialConductivity(presetWallMaterial);
            } else {
                // Значения по умолчанию
                wallMaterial = 'brick';
                wallThick = 0.38;
                wallLambda = 0.7;
            }

            if (hasInsulation && userInsType) {
                insMaterial = userInsType;
                insLambda = getMaterialConductivity(userInsType);
                insThick = 0.1; // фиксированная толщина 100 мм для простого режима
            } else if (presetInsulation) {
                insMaterial = presetInsulation;
                insLambda = getMaterialConductivity(presetInsulation);
                insThick = getNumber(presetInsThick, 50) / 1000;
            }
        }

        const Rwall = wallThick / wallLambda;
        const Rins = (insThick > 0 && insLambda > 0) ? insThick / insLambda : 0;
        const Rsi = 0.115;
        const Rse = 0.043;
        const Rtotal = Rsi + Rwall + Rins + Rse;
        wallU = Rtotal > 0 ? 1 / Rtotal : 1.5;

        // --- Пол (для простого режима используем упрощённое значение) ---
        let floorU = 0.3, floorMaterial = 'concrete', floorThick = 0.1, floorLambda = 1.7;
        let floorUnder = 'ground', groundType = 'clay', basementTemp = 5;

        if (mode === 'advanced') {
            floorMaterial = data.floor_material || 'concrete';
            floorThick = getNumber(data.floor_thickness, 100) / 1000;
            floorLambda = getMaterialConductivity(floorMaterial);
            floorUnder = data.floor_under || 'ground';
            if (floorUnder === 'ground') {
                groundType = data.floor_ground_type || 'clay';
                const groundR = { clay: 1.5, sand: 1.2, gravel: 1.8, mixed: 1.4 }[groundType] || 1.5;
                const Rfloor = floorThick / floorLambda;
                floorU = 1 / (Rfloor + groundR);
            } else if (floorUnder === 'basement') {
                basementTemp = getNumber(data.floor_basement_temp, 5);
                const Rfloor = floorThick / floorLambda;
                floorU = 1 / (Rsi + Rfloor + Rse);
            } else {
                const Rfloor = floorThick / floorLambda;
                floorU = 1 / (Rsi + Rfloor + Rsi);
            }
        }

        // --- Потолок (для простого режима упрощённо) ---
        let ceilingU = 0.25, ceilingMaterial = 'concrete_slab', ceilingThick = 0.15, ceilingLambda = 1.7;
        let ceilingAbove = 'attic', atticInsThick = 0.2, atticVent = true, roofMaterial = 'metal';

        if (mode === 'advanced') {
            ceilingMaterial = data.ceiling_material || 'concrete_slab';
            ceilingThick = getNumber(data.ceiling_thickness, 150) / 1000;
            ceilingLambda = getMaterialConductivity(ceilingMaterial);
            ceilingAbove = data.ceiling_above || 'attic';

            const Rceiling = ceilingThick / ceilingLambda;
            const Rsi = 0.115;

            if (ceilingAbove === 'attic') {
                atticInsThick = getNumber(data.ceiling_attic_insulation_thickness, 200) / 1000;
                atticVent = getBoolean(data.ceiling_attic_ventilation, true);
                const insLambda = 0.045;
                const Rins = atticInsThick / insLambda;
                const Rse = 0.043;
                const atticFactor = atticVent ? 1.0 : 0.8;
                ceilingU = 1 / (Rsi + Rceiling + Rins + Rse) * atticFactor;
            } else if (ceilingAbove === 'roof') {
                roofMaterial = data.ceiling_roof_material || 'metal';
                const roofR = { metal: 0.1, soft: 0.5, slate: 0.3, tile: 0.4 }[roofMaterial] || 0.2;
                const Rse = 0.043;
                ceilingU = 1 / (Rsi + Rceiling + roofR + Rse);
            } else {
                const Rse = 0.115;
                ceilingU = 1 / (Rsi + Rceiling + Rse);
            }
        }

        // --- Инфильтрация ---
        const V = S_floor * H;
        let n = 0.5;
        if (mode === 'simple') {
            // ========== ИСПРАВЛЕНО: используем preset_infiltration_rate ==========
            n = getNumber(data.preset_infiltration_rate, 0.5);
        } else {
            n = getNumber(data.air_change_rate, 0.5);
            const quality = data.infiltration_quality || 'average';
            const qualityFactor = { poor: 1.3, average: 1.0, good: 0.8, excellent: 0.6 }[quality] || 1.0;
            n *= qualityFactor;
        }
        const Qinf = 0.34 * V * n * dT * airDensityFactor;

        // --- Вентиляция ---
        let Qvent = 0, airFlow = 0, recoveryEfficiency = 0, ventType = 'natural';
        if (mode === 'advanced') {
            ventType = data.ventilation_ventilation_type || 'natural';
            if (ventType === 'balanced_with_recovery') {
                const people = getNumber(data.internal_gains_occupancy, 3);
                const rate = getNumber(data.ventilation_ventilation_rate, 30);
                airFlow = rate * people;
                recoveryEfficiency = getNumber(data.ventilation_heat_recovery_efficiency, 0) / 100;
                const T_supply = T_out + recoveryEfficiency * (T_in - T_out);
                Qvent = 0.34 * airFlow * (T_in - T_supply) * airDensityFactor;
            } else if (ventType === 'balanced' || ventType === 'supply' || ventType === 'exhaust') {
                const people = getNumber(data.internal_gains_occupancy, 3);
                const rate = getNumber(data.ventilation_ventilation_rate, 30);
                airFlow = rate * people;
                Qvent = 0.34 * airFlow * dT * airDensityFactor;
            }
        }

        // --- Внутренние выделения ---
        let Qinternal = 0, people = 0, lighting = 0, equipment = 0;
        if (mode === 'simple') {
            people = getNumber(data.additional_occupancy, 3);
            Qinternal = people * 100;
        } else {
            people = getNumber(data.internal_gains_occupancy, 3);
            lighting = getNumber(data.internal_gains_lighting_power, 300);
            equipment = getNumber(data.internal_gains_equipment_power, 500);
            Qinternal = people * 100 + 0.9 * lighting + 0.8 * equipment;
        }

        // --- Теплопотери через ограждения ---
        const safe = (val) => isNaN(val) ? 0 : val;

        const Qwalls = safe(wallU) * safe(S_walls_net) * safe(dT) * safe(orientFactor) * safe(windFactor) * safe(floorPosFactor);
        const Qwindows = safe(windowUavg) * safe(S_windows) * safe(dT) * safe(orientFactor) * safe(windFactor);
        const Qdoors = safe(doorUavg) * safe(S_doors) * safe(dT) * safe(orientFactor) * safe(windFactor);

        let Qfloor, Qceiling;
        if (mode === 'advanced' && floorUnder === 'basement') {
            Qfloor = safe(floorU) * safe(S_floor) * safe(T_in - basementTemp) * safe(floorPosFactor);
        } else {
            Qfloor = safe(floorU) * safe(S_floor) * safe(dT) * safe(floorPosFactor);
        }

        Qceiling = safe(ceilingU) * safe(S_ceiling) * safe(dT);

        const totalLoss = safe(Qwalls) + safe(Qwindows) + safe(Qdoors) + safe(Qfloor) + safe(Qceiling) + safe(Qinf) + safe(Qvent);
        const requiredPower = Math.max(0, totalLoss - safe(Qinternal));

        // --- Система отопления (общие параметры) ---
        let systemType = 'radiator', coolantType = 'water', glycolConc = 0, systemHeight = 5;
        if (mode === 'advanced') {
            systemType = data.system_general_system_type || 'radiator';
            coolantType = data.system_general_coolant_type || 'water';
            glycolConc = getNumber(data.system_general_glycol_concentration, 30) / 100;
            systemHeight = getNumber(data.system_general_system_height, 5);
        }

        let density = 1000;
        let specificHeat = 4186;
        if (coolantType === 'glycol') {
            density = 1000 * (1 - 0.005 * glycolConc * 100);
            specificHeat = 4186 * (1 - 0.003 * glycolConc * 100);
        }

        // --- Радиаторы ---
        let radiatorPower = 0, radCount = 0, radSections = 0, radHeatStd = 0, radDeltaStd = 50;
        let radType = 'aluminum', radHeight = 500, radConnection = 'side', radInstallFactor = 1.0;
        let T_supply = 75, T_return = 65;

        if (mode === 'advanced') {
            radCount = getNumber(data.radiators_radiator_count, 0);
            if (radCount > 0) {
                radSections = getNumber(data.radiators_sections_count, 6);
                radHeatStd = getNumber(data.radiators_heat_output_per_section, 180);
                radDeltaStd = getNumber(data.radiators_standard_delta, 50);
                radType = data.radiators_radiator_type || 'aluminum';
                radHeight = getNumber(data.radiators_height, 500);
                radConnection = data.radiators_connection_type || 'side';
                radInstallFactor = getNumber(data.radiators_installation_factor, 1.0);
                T_supply = getNumber(data.system_general_temperature_supply, 75);
                T_return = getNumber(data.system_general_temperature_return, 65);

                const deltaT_rad = (T_supply + T_return) / 2 - T_in;
                const connFactor = { side: 1.0, bottom: 0.9, diagonal: 1.05 }[radConnection] || 1.0;
                const factor = Math.pow(Math.max(0.1, deltaT_rad / radDeltaStd), 1.3) * radInstallFactor * connFactor;
                radiatorPower = radCount * radSections * radHeatStd * factor;
            }
        }

        // --- Тёплый пол ---
        let floorHeatingPower = 0, floorArea = 0, pipeStep = 150, pipeDiameter = 16, pipeWall = 2.0;
        let floorRoomType = 'living', floorCovering = 'tile', screedThickness = 50, insulationBelow = true;
        let insType = 'extruded_polystyrene', insThicknessFloor = 50, maxSurfaceTemp = 26;
        let floorHeatingEnabled = false;

        if (mode === 'advanced') {
            floorHeatingEnabled = getBoolean(data.floor_heating_enabled, false);
            if (floorHeatingEnabled) {
                floorArea = getNumber(data.floor_heating_area, S_floor * 0.7);
                const floorType = data.floor_heating_type || 'water';
                floorRoomType = data.floor_heating_room_type || 'living';
                floorCovering = data.floor_heating_covering_type || 'tile';
                pipeStep = getNumber(data.floor_heating_laying_step, 150);
                pipeDiameter = getNumber(data.floor_heating_pipe_diameter, 16);
                pipeWall = getNumber(data.floor_heating_pipe_wall_thickness, 2.0);
                screedThickness = getNumber(data.floor_heating_screed_thickness, 50);
                insulationBelow = getBoolean(data.floor_heating_insulation_below, true);
                if (insulationBelow) {
                    insType = data.floor_heating_insulation_type || 'extruded_polystyrene';
                    insThicknessFloor = getNumber(data.floor_heating_insulation_thickness, 50);
                }
                maxSurfaceTemp = getNumber(data.floor_heating_max_surface_temp, 26);

                const T_water_avg = floorType === 'water' ? getNumber(data.floor_heating_water_temperature_supply, 40) : 40;
                const q = 8 * (T_water_avg - T_in) * Math.pow(100 / (pipeStep/1000), 0.1);
                floorHeatingPower = floorArea * Math.min(q, 150);
            }
        }

        // --- Гидравлика ---
        const deltaT_system = T_supply - T_return;
        let coolantFlow = 0;
        if (deltaT_system > 0 && requiredPower > 0 && !isNaN(requiredPower)) {
            coolantFlow = 0.86 * requiredPower / deltaT_system * (4186 / specificHeat);
        }

        const mainPipeDiameter = 0.025;
        const mainPipeArea = Math.PI * mainPipeDiameter * mainPipeDiameter / 4;
        let flowSpeed = 0;
        if (coolantFlow > 0 && !isNaN(coolantFlow)) {
            flowSpeed = coolantFlow / 3600 / density / mainPipeArea;
        }

        const totalPipeLengthHydr = 2 * (L + W) * 2;
        const pressureLossHydr = 1.3 * 100 * totalPipeLengthHydr;

        let systemVolume = 0;
        if (requiredPower > 0 && !isNaN(requiredPower)) {
            systemVolume = (floorHeatingEnabled ? 15 : 13) * requiredPower / 1000;
        }

        const expansionTankVolume = systemVolume * 0.03 * 1.2;
        const boilerPower = requiredPower * 1.2 / 1000;
        const pumpHead = pressureLossHydr / 9800;
        const pumpFlow = coolantFlow / 1000;

        // --- Тёплый пол: детали ---
        let pipeLength = 0, circuitsCount = 0, surfaceTemp = 0, pressureDropFloor = 0, flowPerCircuit = 0;
        if (floorHeatingEnabled && floorArea > 0) {
            pipeLength = (floorArea / (pipeStep / 1000)) * 1.1;
            const maxCircuitLength = 100;
            circuitsCount = Math.ceil(pipeLength / maxCircuitLength);
            const q_real = floorHeatingPower / floorArea;
            surfaceTemp = T_in + q_real * 0.05;
            if (surfaceTemp > maxSurfaceTemp) surfaceTemp = maxSurfaceTemp;

            const deltaT_floor = 5;
            const flowTotal = floorHeatingPower * 0.86 / deltaT_floor;
            flowPerCircuit = flowTotal / circuitsCount;

            const innerDiameter = (pipeDiameter - 2 * pipeWall) / 1000;
            const innerArea = Math.PI * innerDiameter * innerDiameter / 4;
            const speedFloor = flowPerCircuit / 3600 / density / innerArea;
            const lambda = 0.02;
            const pressureDropPerMeter = lambda * (1 / innerDiameter) * (density * speedFloor * speedFloor / 2);
            pressureDropFloor = pipeLength * pressureDropPerMeter * 1.3;
        }

        const totalHeatingPower = radiatorPower + (floorHeatingEnabled ? floorHeatingPower : 0);
        const powerBalance = totalHeatingPower - requiredPower;
        const balanceStatus = powerBalance >= 0 ? 'Профицит' : 'Дефицит';

        // --- Влажность (для справки) ---
        const insideHumidity = getNumber(data.inside_humidity, 50);
        const outsideHumidity = getNumber(data.outside_humidity, 80);

        return {
            geometry: { L, W, H, P, S_floor, S_ceiling, S_walls_total, S_windows, S_doors, S_walls_net },
            windows: { count: winCount, U: windowUavg },
            doors: { count: doorCount, U: doorUavg },
            temperatures: { T_in, T_out, dT },
            walls: { U: wallU, material: wallMaterial, thickness: wallThick, lambda: wallLambda, insulation: insMaterial, insThickness: insThick, insLambda: insLambda },
            floor: { U: floorU, material: floorMaterial, thickness: floorThick, under: floorUnder, groundType, basementTemp },
            ceiling: { U: ceilingU, material: ceilingMaterial, thickness: ceilingThick, above: ceilingAbove, atticInsThick, atticVent, roofMaterial },
            infiltration: { volume: V, rate: n, Q: Qinf },
            ventilation: { type: ventType, airFlow, efficiency: recoveryEfficiency, Q: Qvent },
            internal: { people, lighting, equipment, Q: Qinternal },
            losses: { Qwalls, Qwindows, Qdoors, Qfloor, Qceiling, Qinf, Qvent, Qinternal, totalLoss },
            requiredPower,
            factors: { orientFactor, windFactor, floorPosFactor, altitude, airDensityFactor },
            humidity: { inside: insideHumidity, outside: outsideHumidity },
            heatingSystem: {
                systemType, coolantType, glycolConc, density, specificHeat, systemHeight,
                radiatorPower, radCount, radSections, radHeatStd, radDeltaStd, radType, radHeight, radConnection, radInstallFactor,
                T_supply, T_return, deltaT_system,
                floorHeatingEnabled, floorHeatingPower, floorArea, floorRoomType, floorCovering, pipeStep, pipeDiameter, pipeWall, screedThickness, insulationBelow, insType, insThicknessFloor, maxSurfaceTemp,
                totalHeatingPower, powerBalance, balanceStatus
            },
            floorHeating: floorHeatingEnabled ? {
                area: floorArea, pipeStep, pipeDiameter, pipeWall, pipeLength, circuitsCount, surfaceTemp, flowPerCircuit, pressureDrop: pressureDropFloor
            } : null,
            hydraulics: {
                coolantFlow, flowSpeed, pressureLoss: pressureLossHydr, systemVolume,
                expansionTankVolume, pumpHead, pumpFlow, boilerPower
            },
            mainPipeArea
        };
    }

    // ---- Управление вкладками ----
    let activeTab = 'summary';

    function renderTabs() {
        const container = document.getElementById(`${blockId}-content`);
        if (!container) return;

        const tabsHtml = `
            <div class="calc-tabs" id="calc-tabs-container">
                <button class="calc-tab ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">ИТОГИ</button>
                <button class="calc-tab ${activeTab === 'geometry' ? 'active' : ''}" data-tab="geometry">ГЕОМЕТРИЯ</button>
                <button class="calc-tab ${activeTab === 'losses' ? 'active' : ''}" data-tab="losses">ТЕПЛОПОТЕРИ</button>
                <button class="calc-tab ${activeTab === 'heating' ? 'active' : ''}" data-tab="heating">ОТОПЛЕНИЕ</button>
                <button class="calc-tab ${activeTab === 'floor' ? 'active' : ''}" data-tab="floor">ТЁПЛЫЙ ПОЛ</button>
                <button class="calc-tab ${activeTab === 'hydraulics' ? 'active' : ''}" data-tab="hydraulics">ГИДРАВЛИКА</button>
            </div>
            <div class="calc-results" id="calc-results-content"></div>
            <div class="calc-controls">
                <button id="calculate-btn" class="calc-button calc-button-primary">ПЕРЕСЧИТАТЬ</button>
            </div>
        `;

        container.innerHTML = `
            <div class="calc-container">
                <h3 class="calc-title">Расчет теплопотерь и оборудования</h3>
                ${tabsHtml}
            </div>
        `;

        document.getElementById('calc-tabs-container').addEventListener('click', (e) => {
            const tab = e.target.closest('.calc-tab');
            if (!tab) return;
            const newTab = tab.dataset.tab;
            if (newTab && newTab !== activeTab) {
                activeTab = newTab;
                renderTabs();
                renderResults();
            }
        });

        document.getElementById('calculate-btn').addEventListener('click', () => {
            renderResults();
        });
    }

    function renderResults() {
        const resultsDiv = document.getElementById('calc-results-content');
        if (!resultsDiv) return;

        const params = getBlock1Data();
        const r = calculateDetailed(params);

        if (r.error) {
            resultsDiv.innerHTML = `<div class="result-item"><span class="result-label">Ошибка:</span><span class="result-value">${r.error}</span></div>`;
            return;
        }

        let html = '<div class="results-grid">';

        function addItem(label, value, tooltipData) {
            let tooltip = '';
            if (tooltipData) {
                tooltip = `${tooltipData.desc}\nФормула: ${tooltipData.formulaWords}\n${tooltipData.formulaSymbols}\nПодстановка: ${tooltipData.substitution}`;
            }
            html += `<div class="result-item" title="${tooltip.replace(/"/g, '&quot;')}"><span class="result-label">${label}</span><span class="result-value">${value}</span></div>`;
        }

        // --- Вкладка ИТОГИ ---
        if (activeTab === 'summary') {
            addItem('Общие теплопотери', fmt(r.losses.totalLoss,0)+' Вт', {
                desc: 'Суммарные теплопотери помещения',
                formulaWords: 'сумма потерь через стены, окна, двери, пол, потолок, инфильтрацию, вентиляцию',
                formulaSymbols: 'Q_общ = ΣQ',
                substitution: `${fmt(r.losses.totalLoss,0)} Вт`
            });
            addItem('Требуемая мощность', fmt(r.requiredPower/1000,2)+' кВт', {
                desc: 'Мощность системы отопления после вычета внутренних выделений',
                formulaWords: 'общие потери минус внутренние выделения',
                formulaSymbols: 'Q_отоп = Q_общ - Q_внутр',
                substitution: `${fmt(r.losses.totalLoss,0)} - ${fmt(r.internal.Q,0)} = ${fmt(r.requiredPower,0)} Вт = ${fmt(r.requiredPower/1000,2)} кВт`
            });
            addItem('Установленная мощность', fmt(r.heatingSystem.totalHeatingPower,0)+' Вт', {
                desc: 'Суммарная мощность радиаторов и тёплого пола',
                formulaWords: 'радиаторы + тёплый пол',
                formulaSymbols: 'Q_уст = Q_рад + Q_тп',
                substitution: `${fmt(r.heatingSystem.radiatorPower,0)} + ${fmt(r.heatingSystem.floorHeatingPower||0,0)} = ${fmt(r.heatingSystem.totalHeatingPower,0)} Вт`
            });
            addItem('Баланс мощности', fmt(r.heatingSystem.powerBalance,0)+' Вт', {
                desc: 'Разница между установленной и требуемой мощностью',
                formulaWords: 'установленная мощность минус требуемая',
                formulaSymbols: 'ΔQ = Q_уст - Q_отоп',
                substitution: `${fmt(r.heatingSystem.totalHeatingPower,0)} - ${fmt(r.requiredPower,0)} = ${fmt(r.heatingSystem.powerBalance,0)} Вт`
            });
            addItem('Статус баланса', r.heatingSystem.balanceStatus, {
                desc: 'Дефицит или профицит мощности',
                formulaWords: 'если ΔQ ≥ 0 — профицит, иначе дефицит',
                formulaSymbols: '',
                substitution: ''
            });
            addItem('Мощность котла (реком.)', fmt(r.hydraulics.boilerPower,2)+' кВт', {
                desc: 'Рекомендуемая мощность котла с запасом 20%',
                formulaWords: 'требуемая мощность × 1.2',
                formulaSymbols: 'P_котла = Q_отоп × 1.2',
                substitution: `${fmt(r.requiredPower/1000,2)} × 1.2 = ${fmt(r.hydraulics.boilerPower,2)} кВт`
            });
            addItem('Объём системы', fmt(r.hydraulics.systemVolume,1)+' л', {
                desc: 'Ориентировочный объём теплоносителя',
                formulaWords: 'удельный объём (13-15 л/кВт) × мощность (кВт)',
                formulaSymbols: 'V_сист = (13-15) × Q_отоп',
                substitution: `${r.heatingSystem.floorHeatingEnabled ? '15' : '13'} × ${fmt(r.requiredPower/1000,2)} = ${fmt(r.hydraulics.systemVolume,1)} л`
            });
            addItem('Расширительный бак', fmt(r.hydraulics.expansionTankVolume,1)+' л', {
                desc: 'Объём расширительного бака',
                formulaWords: 'объём системы × 0.03 × 1.2',
                formulaSymbols: 'V_бак = V_сист × 0.03 × 1.2',
                substitution: `${fmt(r.hydraulics.systemVolume,1)} × 0.03 × 1.2 = ${fmt(r.hydraulics.expansionTankVolume,1)} л`
            });
            addItem('Насос: напор', fmt(r.hydraulics.pumpHead,1)+' м', {
                desc: 'Требуемый напор насоса',
                formulaWords: 'потери давления / 9800',
                formulaSymbols: 'H = ΔP / 9800',
                substitution: `${fmt(r.hydraulics.pressureLoss,0)} / 9800 = ${fmt(r.hydraulics.pumpHead,1)} м`
            });
            addItem('Насос: расход', fmt(r.hydraulics.pumpFlow,2)+' м³/ч', {
                desc: 'Требуемая подача насоса',
                formulaWords: 'массовый расход / 1000',
                formulaSymbols: 'Q_нас = G / 1000',
                substitution: `${fmt(r.hydraulics.coolantFlow,1)} / 1000 = ${fmt(r.hydraulics.pumpFlow,2)} м³/ч`
            });
        }

        // --- Вкладка ГЕОМЕТРИЯ ---
        else if (activeTab === 'geometry') {
            addItem('Длина L', fmt(r.geometry.L,2)+' м', { desc: 'Длина помещения', formulaWords: 'из поля "Длина"', formulaSymbols: 'L', substitution: `${r.geometry.L} м` });
            addItem('Ширина W', fmt(r.geometry.W,2)+' м', { desc: 'Ширина помещения', formulaWords: 'из поля "Ширина"', formulaSymbols: 'W', substitution: `${r.geometry.W} м` });
            addItem('Высота H', fmt(r.geometry.H,2)+' м', { desc: 'Высота помещения', formulaWords: 'из поля "Высота"', formulaSymbols: 'H', substitution: `${r.geometry.H} м` });
            addItem('Периметр P', fmt(r.geometry.P,2)+' м', { desc: 'Периметр', formulaWords: '2·(L+W)', formulaSymbols: 'P = 2·(L+W)', substitution: `2·(${fmt(r.geometry.L,2)}+${fmt(r.geometry.W,2)}) = ${fmt(r.geometry.P,2)} м` });
            addItem('Площадь пола', fmt(r.geometry.S_floor,2)+' м²', { desc: 'Площадь пола', formulaWords: 'L·W', formulaSymbols: 'S_пол = L·W', substitution: `${fmt(r.geometry.L,2)}·${fmt(r.geometry.W,2)} = ${fmt(r.geometry.S_floor,2)} м²` });
            addItem('Площадь стен общая', fmt(r.geometry.S_walls_total,2)+' м²', { desc: 'Общая площадь стен', formulaWords: 'P·H', formulaSymbols: 'S_стен_общ = P·H', substitution: `${fmt(r.geometry.P,2)}·${fmt(r.geometry.H,2)} = ${fmt(r.geometry.S_walls_total,2)} м²` });
            addItem('Площадь окон', fmt(r.geometry.S_windows,2)+' м²', { desc: 'Суммарная площадь окон', formulaWords: '∑ N_окон × ширина × высота', formulaSymbols: 'S_окон', substitution: `${fmt(r.geometry.S_windows,2)} м²` });
            addItem('Площадь дверей', fmt(r.geometry.S_doors,2)+' м²', { desc: 'Суммарная площадь дверей', formulaWords: '∑ N_дверей × ширина × высота', formulaSymbols: 'S_дверей', substitution: `${fmt(r.geometry.S_doors,2)} м²` });
            addItem('Площадь стен чистая', fmt(r.geometry.S_walls_net,2)+' м²', { desc: 'Площадь стен без проёмов', formulaWords: 'S_стен_общ - S_окон - S_дверей', formulaSymbols: 'S_стен_нетто', substitution: `${fmt(r.geometry.S_walls_total,2)} - ${fmt(r.geometry.S_windows,2)} - ${fmt(r.geometry.S_doors,2)} = ${fmt(r.geometry.S_walls_net,2)} м²` });
            addItem('T внутри', fmt(r.temperatures.T_in,1)+' °C', { desc: 'Температура внутри', formulaWords: 'из поля', formulaSymbols: 'T_вн', substitution: `${fmt(r.temperatures.T_in,1)} °C` });
            addItem('T снаружи', fmt(r.temperatures.T_out,1)+' °C', { desc: 'Температура снаружи', formulaWords: 'из поля или климатической зоны', formulaSymbols: 'T_нар', substitution: `${fmt(r.temperatures.T_out,1)} °C` });
            addItem('ΔT', fmt(r.temperatures.dT,1)+' °C', { desc: 'Разность температур', formulaWords: 'T_вн - T_нар', formulaSymbols: 'ΔT', substitution: `${fmt(r.temperatures.T_in,1)} - ${fmt(r.temperatures.T_out,1)} = ${fmt(r.temperatures.dT,1)} °C` });
            if (r.factors.orientFactor !== 1.0) addItem('Коэф. ориентации', fmt(r.factors.orientFactor,2), { desc: 'Учитывает сторону света', formulaWords: 'из таблицы', formulaSymbols: 'k_ор', substitution: `${fmt(r.factors.orientFactor,2)}` });
            if (r.factors.windFactor !== 1.0) addItem('Коэф. ветра', fmt(r.factors.windFactor,2), { desc: 'Учитывает открытость', formulaWords: 'из таблицы', formulaSymbols: 'k_вет', substitution: `${fmt(r.factors.windFactor,2)}` });
            if (r.factors.floorPosFactor !== 1.0) addItem('Коэф. этажа', fmt(r.factors.floorPosFactor,2), { desc: 'Учитывает положение', formulaWords: 'из таблицы', formulaSymbols: 'k_эт', substitution: `${fmt(r.factors.floorPosFactor,2)}` });
            if (r.factors.altitude > 0) addItem('Высота над уровнем моря', fmt(r.factors.altitude,0)+' м', { desc: 'Влияет на плотность воздуха', formulaWords: 'из поля', formulaSymbols: 'h', substitution: `${fmt(r.factors.altitude,0)} м` });
        }

        // --- Вкладка ТЕПЛОПОТЕРИ ---
        else if (activeTab === 'losses') {
            addItem('U стен', fmt(r.walls.U,3)+' Вт/м²·°C', { desc: 'Коэф. теплопередачи стен', formulaWords: '1 / (R_вн + R_стен + R_ут + R_нар)', formulaSymbols: 'U_стен', substitution: `... = ${fmt(r.walls.U,3)}` });
            addItem('U окон', fmt(r.windows.U,2)+' Вт/м²·°C', { desc: 'Средний коэф. теплопередачи окон', formulaWords: 'по типу остекления', formulaSymbols: 'U_окон', substitution: `${fmt(r.windows.U,2)}` });
            if (r.doors.count > 0) addItem('U дверей', fmt(r.doors.U,2)+' Вт/м²·°C', { desc: 'Средний коэф. теплопередачи дверей', formulaWords: 'по типу двери', formulaSymbols: 'U_дверей', substitution: `${fmt(r.doors.U,2)}` });
            addItem('U пола', fmt(r.floor.U,3)+' Вт/м²·°C', { desc: 'Коэф. теплопередачи пола', formulaWords: 'рассчитан по слоям', formulaSymbols: 'U_пола', substitution: `${fmt(r.floor.U,3)}` });
            addItem('U потолка', fmt(r.ceiling.U,3)+' Вт/м²·°C', { desc: 'Коэф. теплопередачи потолка', formulaWords: 'рассчитан по слоям', formulaSymbols: 'U_потолка', substitution: `${fmt(r.ceiling.U,3)}` });
            addItem('Q стен', fmt(r.losses.Qwalls,0)+' Вт', { desc: 'Теплопотери стен', formulaWords: 'U_стен × S_стен_нетто × ΔT × k_ор × k_вет × k_эт', formulaSymbols: 'Q_стен', substitution: `${fmt(r.walls.U,3)} × ${fmt(r.geometry.S_walls_net,2)} × ${fmt(r.temperatures.dT,1)} × ${fmt(r.factors.orientFactor,2)} × ${fmt(r.factors.windFactor,2)} × ${fmt(r.factors.floorPosFactor,2)} = ${fmt(r.losses.Qwalls,0)} Вт` });
            addItem('Q окон', fmt(r.losses.Qwindows,0)+' Вт', { desc: 'Теплопотери окон', formulaWords: 'U_окон × S_окон × ΔT × k_ор × k_вет', formulaSymbols: 'Q_окон', substitution: `${fmt(r.windows.U,2)} × ${fmt(r.geometry.S_windows,2)} × ${fmt(r.temperatures.dT,1)} × ${fmt(r.factors.orientFactor,2)} × ${fmt(r.factors.windFactor,2)} = ${fmt(r.losses.Qwindows,0)} Вт` });
            if (r.doors.count > 0) addItem('Q дверей', fmt(r.losses.Qdoors,0)+' Вт', { desc: 'Теплопотери дверей', formulaWords: 'U_дверей × S_дверей × ΔT × k_ор × k_вет', formulaSymbols: 'Q_дверей', substitution: `${fmt(r.doors.U,2)} × ${fmt(r.geometry.S_doors,2)} × ${fmt(r.temperatures.dT,1)} × ${fmt(r.factors.orientFactor,2)} × ${fmt(r.factors.windFactor,2)} = ${fmt(r.losses.Qdoors,0)} Вт` });
            addItem('Q пола', fmt(r.losses.Qfloor,0)+' Вт', { desc: 'Теплопотери пола', formulaWords: 'U_пола × S_пола × ΔT (или (T_вн - T_подв) для подвала)', formulaSymbols: 'Q_пола', substitution: `${fmt(r.losses.Qfloor,0)} Вт` });
            addItem('Q потолка', fmt(r.losses.Qceiling,0)+' Вт', { desc: 'Теплопотери потолка', formulaWords: 'U_потолка × S_потолка × ΔT', formulaSymbols: 'Q_потолка', substitution: `${fmt(r.losses.Qceiling,0)} Вт` });
            addItem('Q инфильтрации', fmt(r.losses.Qinf,0)+' Вт', { desc: 'Теплопотери на инфильтрацию', formulaWords: '0.34 × V × n × ΔT × k_высоты', formulaSymbols: 'Q_инф', substitution: `0.34 × ${fmt(r.infiltration.volume,2)} × ${fmt(r.infiltration.rate,2)} × ${fmt(r.temperatures.dT,1)} × ${fmt(r.factors.airDensityFactor,2)} = ${fmt(r.losses.Qinf,0)} Вт` });
            if (r.losses.Qvent !== 0) addItem('Q вентиляции', fmt(r.losses.Qvent,0)+' Вт', { desc: 'Теплопотери на вентиляцию', formulaWords: '0.34 × L × (T_вн - T_прит)', formulaSymbols: 'Q_вент', substitution: `${fmt(r.losses.Qvent,0)} Вт` });
            addItem('Q внутренние', fmt(r.losses.Qinternal,0)+' Вт', { desc: 'Внутренние тепловыделения', formulaWords: 'люди × 100 + 0.9·освещение + 0.8·оборудование', formulaSymbols: 'Q_внутр', substitution: `${fmt(r.internal.Q,0)} Вт` });
            addItem('Общие потери', fmt(r.losses.totalLoss,0)+' Вт', { desc: 'Сумма всех теплопотерь', formulaWords: 'сумма', formulaSymbols: 'Q_общ', substitution: `${fmt(r.losses.totalLoss,0)} Вт` });
        }

        // --- Вкладка ОТОПЛЕНИЕ ---
        else if (activeTab === 'heating') {
            addItem('Тип системы', r.heatingSystem.systemType, { desc: 'Тип системы отопления', formulaWords: '', formulaSymbols: '', substitution: '' });
            addItem('Теплоноситель', r.heatingSystem.coolantType + (r.heatingSystem.coolantType==='glycol'?` (${fmt(r.heatingSystem.glycolConc*100,0)}%)`:''), { desc: 'Тип теплоносителя', formulaWords: '', formulaSymbols: '', substitution: '' });
            addItem('Плотность', fmt(r.heatingSystem.density,0)+' кг/м³', { desc: 'Плотность теплоносителя', formulaWords: 'для воды 1000, для гликоля меньше', formulaSymbols: 'ρ', substitution: `${fmt(r.heatingSystem.density,0)} кг/м³` });
            addItem('Теплоёмкость', fmt(r.heatingSystem.specificHeat,0)+' Дж/(кг·°C)', { desc: 'Удельная теплоёмкость', formulaWords: 'для воды 4186', formulaSymbols: 'c', substitution: `${fmt(r.heatingSystem.specificHeat,0)}` });
            if (r.heatingSystem.radiatorPower > 0) {
                addItem('Мощность радиаторов', fmt(r.heatingSystem.radiatorPower,0)+' Вт', { desc: 'Фактическая теплоотдача радиаторов', formulaWords: 'N_рад × N_секц × Q_стд × (Δt_факт/Δt_стд)^1.3 × k_уст × k_подкл', formulaSymbols: 'Q_рад', substitution: `${fmt(r.heatingSystem.radiatorPower,0)} Вт` });
                addItem('Кол-во радиаторов', r.heatingSystem.radCount, { desc: 'Количество радиаторов', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Секций на радиатор', r.heatingSystem.radSections, { desc: 'Количество секций', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Теплоотдача секции (стд)', fmt(r.heatingSystem.radHeatStd,0)+' Вт', { desc: 'Теплоотдача при стандартном Δt', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Стандартный Δt', r.heatingSystem.radDeltaStd+' °C', { desc: 'Температурный напор, при котором указана теплоотдача', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Тип радиатора', r.heatingSystem.radType, { desc: 'Тип радиатора', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Высота радиатора', r.heatingSystem.radHeight+' мм', { desc: 'Монтажная высота', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Подключение', r.heatingSystem.radConnection, { desc: 'Способ подключения', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Коэф. установки', fmt(r.heatingSystem.radInstallFactor,2), { desc: 'Коэффициент, учитывающий особенности монтажа', formulaWords: '', formulaSymbols: '', substitution: '' });
            }
            addItem('T подачи', fmt(r.heatingSystem.T_supply,0)+' °C', { desc: 'Температура подачи', formulaWords: '', formulaSymbols: '', substitution: '' });
            addItem('T обратки', fmt(r.heatingSystem.T_return,0)+' °C', { desc: 'Температура обратки', formulaWords: '', formulaSymbols: '', substitution: '' });
            addItem('ΔT системы', fmt(r.heatingSystem.deltaT_system,1)+' °C', { desc: 'Перепад температур', formulaWords: 'T_под - T_обр', formulaSymbols: 'ΔT_сист', substitution: `${fmt(r.heatingSystem.T_supply,0)} - ${fmt(r.heatingSystem.T_return,0)} = ${fmt(r.heatingSystem.deltaT_system,1)} °C` });
            if (r.heatingSystem.floorHeatingEnabled) {
                addItem('Мощность тёплого пола', fmt(r.heatingSystem.floorHeatingPower,0)+' Вт', { desc: 'Теплоотдача тёплого пола', formulaWords: 'удельная мощность × площадь', formulaSymbols: 'Q_тп', substitution: `${fmt(r.heatingSystem.floorHeatingPower,0)} Вт` });
                addItem('Площадь ТП', fmt(r.heatingSystem.floorArea,2)+' м²', { desc: 'Площадь тёплого пола', formulaWords: '', formulaSymbols: '', substitution: '' });
            }
        }

        // --- Вкладка ТЁПЛЫЙ ПОЛ ---
        else if (activeTab === 'floor') {
            if (!r.floorHeating) {
                addItem('Тёплый пол', 'не используется', { desc: '', formulaWords: '', formulaSymbols: '', substitution: '' });
            } else {
                addItem('Площадь ТП', fmt(r.floorHeating.area,2)+' м²', { desc: 'Площадь, занятая тёплым полом', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Тип помещения', r.heatingSystem.floorRoomType, { desc: 'Тип помещения (влияет на макс. температуру)', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Покрытие', r.heatingSystem.floorCovering, { desc: 'Тип напольного покрытия', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Шаг укладки', fmt(r.floorHeating.pipeStep,0)+' мм', { desc: 'Расстояние между трубами', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Диаметр трубы', fmt(r.floorHeating.pipeDiameter,1)+' мм', { desc: 'Наружный диаметр трубы', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Толщина стенки', fmt(r.floorHeating.pipeWall,2)+' мм', { desc: 'Толщина стенки трубы', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Толщина стяжки', fmt(r.heatingSystem.screedThickness,0)+' мм', { desc: 'Толщина стяжки над трубой', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Утеплитель снизу', r.heatingSystem.insulationBelow ? 'да' : 'нет', { desc: 'Наличие утеплителя под трубами', formulaWords: '', formulaSymbols: '', substitution: '' });
                if (r.heatingSystem.insulationBelow) {
                    addItem('Тип утеплителя', r.heatingSystem.insType, { desc: 'Тип утеплителя', formulaWords: '', formulaSymbols: '', substitution: '' });
                    addItem('Толщина утеплителя', fmt(r.heatingSystem.insThicknessFloor,0)+' мм', { desc: 'Толщина утеплителя', formulaWords: '', formulaSymbols: '', substitution: '' });
                }
                addItem('Макс. температура пов.', fmt(r.heatingSystem.maxSurfaceTemp,0)+' °C', { desc: 'Ограничение температуры поверхности', formulaWords: '', formulaSymbols: '', substitution: '' });
                addItem('Длина труб', fmt(r.floorHeating.pipeLength,0)+' м', { desc: 'Общая длина трубы', formulaWords: 'S_тп / (шаг/1000) × 1.1', formulaSymbols: 'L_тр', substitution: `${fmt(r.floorHeating.pipeLength,0)} м` });
                addItem('Количество контуров', fmt(r.floorHeating.circuitsCount,0), { desc: 'Число петель', formulaWords: 'ceil(L_тр / 100)', formulaSymbols: 'N_конт', substitution: `${fmt(r.floorHeating.circuitsCount,0)}` });
                addItem('Температура поверхности', fmt(r.floorHeating.surfaceTemp,1)+' °C', { desc: 'Расчётная температура пола', formulaWords: 'T_вн + (q / λ...)', formulaSymbols: 'T_пов', substitution: `${fmt(r.floorHeating.surfaceTemp,1)} °C` });
                addItem('Расход на контур', fmt(r.floorHeating.flowPerCircuit,1)+' кг/ч', { desc: 'Расход теплоносителя в одном контуре', formulaWords: 'G_общ / N_конт', formulaSymbols: 'G_конт', substitution: `${fmt(r.floorHeating.flowPerCircuit,1)} кг/ч` });
                addItem('Потери давления в ТП', fmt(r.floorHeating.pressureDrop,0)+' Па', { desc: 'Потери давления в трубах ТП', formulaWords: 'λ·L/d·ρv²/2', formulaSymbols: 'ΔP_тп', substitution: `${fmt(r.floorHeating.pressureDrop,0)} Па` });
            }
        }

        // --- Вкладка ГИДРАВЛИКА ---
        else if (activeTab === 'hydraulics') {
            addItem('Расход теплоносителя', fmt(r.hydraulics.coolantFlow,1)+' кг/ч', { desc: 'Массовый расход', formulaWords: '0.86·Q_отоп/ΔT_сист', formulaSymbols: 'G', substitution: `0.86·${fmt(r.requiredPower,0)}/${fmt(r.heatingSystem.deltaT_system,1)} = ${fmt(r.hydraulics.coolantFlow,1)} кг/ч` });
            addItem('Скорость в магистрали', fmt(r.hydraulics.flowSpeed,2)+' м/с', { desc: 'Скорость в трубе Ø25', formulaWords: 'G/(3600·ρ·A)', formulaSymbols: 'v', substitution: `${fmt(r.hydraulics.coolantFlow,1)}/(3600·${fmt(r.heatingSystem.density,0)}·${fmt(r.mainPipeArea,6)}) = ${fmt(r.hydraulics.flowSpeed,2)} м/с` });
            addItem('Потери давления в системе', fmt(r.hydraulics.pressureLoss,0)+' Па', { desc: 'Приблизительные потери', formulaWords: '1.3·100·L_труб', formulaSymbols: 'ΔP', substitution: `1.3·100·${2*(r.geometry.L+r.geometry.W)*2} = ${fmt(r.hydraulics.pressureLoss,0)} Па` });
            addItem('Объём системы', fmt(r.hydraulics.systemVolume,1)+' л', { desc: 'Объём теплоносителя', formulaWords: 'удельный объём·Q_отоп(кВт)', formulaSymbols: 'V_сист', substitution: `${r.heatingSystem.floorHeatingEnabled?'15':'13'}·${fmt(r.requiredPower/1000,2)} = ${fmt(r.hydraulics.systemVolume,1)} л` });
            addItem('Расширительный бак', fmt(r.hydraulics.expansionTankVolume,1)+' л', { desc: 'Объём бака', formulaWords: 'V_сист·0.03·1.2', formulaSymbols: 'V_бак', substitution: `${fmt(r.hydraulics.systemVolume,1)}·0.03·1.2 = ${fmt(r.hydraulics.expansionTankVolume,1)} л` });
            addItem('Мощность котла', fmt(r.hydraulics.boilerPower,2)+' кВт', { desc: 'Рекомендуемая мощность', formulaWords: 'Q_отоп·1.2', formulaSymbols: 'P_котла', substitution: `${fmt(r.requiredPower/1000,2)}·1.2 = ${fmt(r.hydraulics.boilerPower,2)} кВт` });
            addItem('Насос: напор', fmt(r.hydraulics.pumpHead,1)+' м', { desc: 'Требуемый напор', formulaWords: 'ΔP/9800', formulaSymbols: 'H', substitution: `${fmt(r.hydraulics.pressureLoss,0)}/9800 = ${fmt(r.hydraulics.pumpHead,1)} м` });
            addItem('Насос: расход', fmt(r.hydraulics.pumpFlow,2)+' м³/ч', { desc: 'Требуемая подача', formulaWords: 'G/1000', formulaSymbols: 'Q_нас', substitution: `${fmt(r.hydraulics.coolantFlow,1)}/1000 = ${fmt(r.hydraulics.pumpFlow,2)} м³/ч` });
        }

        html += '</div>';
        resultsDiv.innerHTML = html;
    }

    function updateResults() {
        renderTabs();
        renderResults();
    }

    window.addEventListener('roomDataChanged', updateResults);
    document.addEventListener('DOMContentLoaded', () => setTimeout(updateResults, 500));
})();
