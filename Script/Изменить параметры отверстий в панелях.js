/*
Изменение параметров отверстий на выделенных моделях
*/

function checkHole(hole, fast, panel) {
    let holeCenter = fast.ToGlobal({
        x: hole.Position.x + hole.Direction.x * (hole.Depth / 2),
        y: hole.Position.y + hole.Direction.y * (hole.Depth / 2),
        z: hole.Position.z + hole.Direction.z * (hole.Depth / 2)
    })
    holeCenter = panel.ToObject(holeCenter)
    return (holeCenter.x > panel.GMin.x) && (holeCenter.x < panel.GMax.x) &&
           (holeCenter.y > panel.GMin.y) && (holeCenter.y < panel.GMax.y) &&
           (holeCenter.z > panel.GMin.z) && (holeCenter.z < panel.GMax.z)
}

function isHoleInPlane(hole, fast, panel) {
    let panelN = panel.NToGlobal(AxisZ)
    let holeN = fast.NToGlobal(hole.Direction)
    let sp = vectorGeometry.VectorDot(panelN, holeN)
    // скалярное произведение векторов: ось Z панели (AxisZ) и направление отверстия (Direction)
    // если по модулю равно 1, то отверстие перпендикулярно пласти панели.
    return Math.abs(sp) < 0.001 ? false : true
}

function replaceHole() {
    listParam.forEach(function (elem) {
        Model.forEachPanel(function (panel) {
            if (panel.Selected == true) {
                let panelThick = panel.Thickness
                if (panel.Plastics.Count > 0) {
                    for (let i = 0; i < panel.Plastics.Count; i ++) {
                        panelThick += panel.Plastics[i].Thickness
                        
                    }
                }
                let fasts = panel.FindConnectedFasteners()
                for (let f = 0; f < fasts.length; f ++) {
                    let fast = fasts[f]
                    let holes = fast.Holes
                    if (holes && holes.Count > 0) {
                        for (let h = 0; h < holes.Count; h ++) {
                            let hole = holes[h]  
                            if (checkHole(hole, fast, panel)) { // Отверстие в панели? 
                                holeCenter = fast.ToGlobal({x: hole.Position.x, y: hole.Position.y})                                                     
                                if (elem.name == fixFloat(hole.Diameter, 1) + "x" + fixFloat(hole.Depth, 1)) {
                                    hole.Diameter = elem.diameter.Value
                                    hole.DrillMode = 0
                                    if (elem.holeInPlane) { // отверстия в пласть
                                        if (elem.depth.Value > panelThick) {
                                            hole.Depth = panelThick
                                        } else {
                                            hole.Depth = elem.depth.Value
                                        }
                                    } else { // отверстия в торец
                                        let panelLength = fixFloat(panel.ContourHeight, 3)
                                        let panelWidth = fixFloat(panel.ContourWidth, 3)

                                        let holeCenter = fast.ToGlobal({x: hole.Position.x, y: hole.Position.y})
                                        holeCenter = panel.ToObject(holeCenter)
                                        let holeCenterX = fixFloat(holeCenter.x, 3)
                                        let holeCenterY = fixFloat(holeCenter.y, 3)

                                        let holeEnd = fast.ToGlobal(fast.Holes[h].EndPosition())
                                        holeEnd = panel.ToObject(holeEnd)
                                        let holeEndX = fixFloat(holeEnd.x, 3)
                                        let holeEndY = fixFloat(holeEnd.y, 3)

                                        let holeDepthMax = elem.depth.Value

                                        if (holeCenterX > fixFloat(panel.GMin.x, 3) && holeCenterX < fixFloat(panel.GMax.x, 3)) {
                                            if (holeCenterX > holeEndX) {
                                                holeDepthMax = holeCenterX                                            
                                            } else if (holeCenterX < holeEndX) {
                                                holeDepthMax = panelWidth - holeCenterX
                                            }
                                        } else if (holeCenterX == fixFloat(panel.GMin.x, 3) || holeCenterX == fixFloat(panel.GMax.x, 3)) {
                                            holeDepthMax = panelWidth
                                        }

                                        if (holeCenterY > fixFloat(panel.GMin.y, 3) && holeCenterY < fixFloat(panel.GMax.y, 3)) {
                                            if (holeCenterY > holeEndY) {
                                                holeDepthMax = holeCenterY                                            
                                            } else if (holeCenterY < holeEndY) {
                                                holeDepthMax = panelLength - holeCenterY
                                            }
                                        } else if (holeCenterY == fixFloat(panel.GMin.y, 3) || holeCenterY == fixFloat(panel.GMax.y, 3)) {
                                            holeDepthMax = panelLength
                                        }

                                        if (elem.depth.Value > holeDepthMax) {
                                            hole.Depth = holeDepthMax
                                        } else {
                                            hole.Depth = elem.depth.Value
                                        }
                                    }
                                }
                            }          
                        }
                    }
                }
            }
        })
    })
}

function selectHole(button) {
    listParam.forEach(function (elem) {
        if (button == elem.button) {
            Model.forEachPanel(function (panel) {
                if (panel.Selected == true) {
                    let fasts = panel.FindConnectedFasteners()
                    for (let f = 0; f < fasts.length; f ++) {
                        let fast = fasts[f]
                        let holes = fast.Holes
                        let selectFast = false
                        if (holes && holes.Count > 0) {
                            for (let h = 0; h < holes.Count; h ++) {
                                let hole = holes[h]  
                                if (checkHole(hole, fast, panel) && 
                                    elem.name == fixFloat(hole.Diameter, 1) + "x" + fixFloat(hole.Depth, 1)) {
                                    selectFast = true
                                }          
                            }
                        }
                        if (selectFast) {
                            if (fast.Selected == true) {
                                fast.Selected = false
                            } else {fast.Selected = true}
                        }
                    }
                }
            })
        }
    })
}

function fixFloat(value, rounding) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Первый аргумент должен быть числом.')
    }
    if (typeof rounding !== 'number' || rounding % 1 !== 0 || rounding < 0) {
        throw new Error('Второй аргумент должен быть неотрицательным целым числом.')
    }
    return parseFloat(value.toFixed(rounding))
}


Prop = Action.Properties

let listHoleReplace = [] // информация об отверстиях для замены
let listParam = [] // список сгенирированных параметров
let listButton = [] // список кнопок
let panelSelect = false
let holeOnPanel = false

Undo.RecursiveChanging(Model)

// Проверка
Model.forEachPanel(function (panel) {
    if (panel.Selected == true) {
        panelSelect = true
        let fasts = panel.FindConnectedFasteners()
        for (let f = 0; f < fasts.length; f ++) {
            let fast = fasts[f]
            let holes = fast.Holes
            if (holes.Count > 0) {        
                holeOnPanel = true
            }
        }
    }
})
if (!panelSelect) {
    alert('Для измененеия параметров отверстий необходимо выделить панели')
    Action.Finish()
}
if (!holeOnPanel) {
    alert('На выделенных панелях нет отверстий')
    Action.Finish()
}

// снять выделение со всего кроме панелей
Model.forEach(function(obj) {
    if (!(obj instanceof TFurnPanel) && obj.Selected) {
        obj.Selected = false
    } else {}
})

// Сбор данных об отверстиях на выделенной панели
Model.forEachPanel(function(panel) {
    if (panel.Selected == true) {
        let fasts = panel.FindConnectedFasteners()
        for (let f = 0; f < fasts.length; f ++) {
            let fast = fasts[f]
            let holes = fast.Holes
            if (holes && holes.Count > 0) {        
                for (let h = 0; h < holes.Count; h ++) {
                    let hole = holes[h]  
                    if (checkHole(hole, fast, panel)) { // Отверстие в панели?
                        let param = {
                            "name": fixFloat(hole.Diameter, 1) + "x" + fixFloat(hole.Depth, 1),
                            "diameter": fixFloat(hole.Diameter, 1),
                            "depth": fixFloat(hole.Depth, 1),
                            "holeInPlane": isHoleInPlane(hole, fast, panel), // Отверстие в плоскости панели?
                            "count": 1
                        }
                        
                        let found = listHoleReplace.find(item => item.name === param.name)
                        
                        if (found) {
                            found.count += 1
                        } else {
                            listHoleReplace.push(param)
                        }
                    }
                }
            }
        }
    }
})

// Создание формы
listHoleReplace.forEach((hole, i) => {
    let holeName = 'NameHole' + (i + 1)
    let holeDiameter = 'HoleDiameter' + (i + 1)
    let holeDepth = 'HoleDepth' + (i + 1)
    let buttonName = 'Button' + (i + 1)
    if (hole.holeInPlane) {
        Prop[holeName] = Prop.NewGroup("Отверстия " + hole.name + " (количество: " + hole.count + " шт)")
    } else {
        Prop[holeName] = Prop.NewGroup("Отверстия торцевые " + hole.name + " (количество: " + hole.count + " шт)")
    }
    Prop[holeDiameter] = Prop[holeName].NewNumber("Диаметр отверстия:", hole.diameter)
    Prop[holeDepth] = Prop[holeName].NewNumber("Глубина отверстия:", hole.depth)
    Prop[buttonName] = Prop[holeName].NewButton("Выделить / Не выделять")
    listParam.push({name: hole.name, 
                    diameter: Prop[holeDiameter], 
                    depth: Prop[holeDepth],
                    holeInPlane: hole.holeInPlane, 
                    button: Prop[buttonName]})
    listButton.push(Prop[buttonName])
    Prop[holeName].Expanded = false
})
OkButton = Prop.NewButton('Изменить отверстия')

// Обработка изменений
OkButton.OnClick = function () {
    replaceHole()
    Model.forEach(function(obj) {
        if (obj instanceof TFastener) {
            obj.ReCalcGabarits()
            obj.GenerateNewId()
        }
    })
    Model.Build()
    alert('Отверстия изменены')
    Action.Finish()
}

listButton.forEach(function (button) {
    button.OnClick = function () {
        selectHole(button)         
    }
})

Action.Continue()
