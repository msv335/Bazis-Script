/*
Тест различных алгоритмов раскроя плиты в Базис мебельщик.
*/

function fixFloat(value, rounding) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Первый аргумент должен быть числом.')
    }
    if (typeof rounding !== 'number' || rounding % 1 !== 0 || rounding < 0) {
        throw new Error('Второй аргумент должен быть неотрицательным целым числом.')
    }
    const factor = Math.pow(10, rounding)
    return Math.round(value * factor) / factor
}

function addSheet(format) {
    let block = AddBlock('Лист №' + (countSheet + 1) + ' - ' + format.y + 'x' + format.x)
    listOfBlanks.push({
        x: format.x - ofset * 2, 
        y: format.y - ofset * 2, 
        px: posX + ofset, 
        py: posY + ofset,
        block: block
    })
    let c = AddContour() // постороение контура панели
    c.Contour.AddRectangle(posX, posY, posX + format.x, posY + format.y)
    c.Name = 'Контур листа ' + format.y + 'x' + format.x
    c.Color = 12632256 // 8421504
    c.Owner = block
    countSheet ++
    posX = (formatSheet.x + 500) * countSheet
}

function сutLogicFirst(list) { // Простой алгоритм, первое что придумал
    if (listOfParts.length != 0) {
        list.sort((a, b) => b.x * b.y - a.x * a.y) // сортировка заготовок по площади
        list.sort((a, b) => b.x - a.x) // сортировка заготовок по ширине

        let part = listOfParts[0] // берется самая большая деталь
        let blank = null // заготовка не определена
        let indexBlank = null // индекс заготовки в массиве
        let isBlank = false // подходящей заготовки возможно нет

        list.forEach((b, i) => { // ищется подходящая заготовка
            if (b.x >= part.x && b.y >= part.y) {
                blank = b
                indexBlank = i
                isBlank = true
            }
        })

        if (isBlank) {
            if (blank.x >= part.x && blank.y >= part.y) { // размер детали меньше или равен размеру заготовки
                let px = list[indexBlank].px
                let py = list[indexBlank].py
                let p1x = px + part.x + cutWidth
                let p1y = py
                let p2x = px
                let p2y = py + part.y + cutWidth
                if (blank.x == part.x && blank.y == part.y) { // добавление остатков
                } else if (blank.x == part.x) {
                    if (blank.y - cutWidth - part.y >= offcut) {
                        list.push({x: part.x, y: blank.y - cutWidth - part.y, px: p2x, py: p2y, 
                            block: list[indexBlank].block}) // остаток 2
                    }
                } else if (blank.y == part.y) {
                    if (blank.x - cutWidth - part.x >= offcut) {
                        list.push({x: blank.x - cutWidth - part.x, y: blank.y, px: p1x, py: p1y, 
                            block: list[indexBlank].block}) // остаток 1
                    }
                } else {
                    if (blank.y - cutWidth - part.y >= offcut) {
                        list.push({x: part.x, y: blank.y - cutWidth - part.y, px: p2x, py: p2y, 
                            block: list[indexBlank].block}) // остаток 2
                    }
                    if (blank.x - cutWidth - part.x >= offcut) {
                        list.push({x: blank.x - cutWidth - part.x, y: blank.y, px: p1x, py: p1y, 
                            block: list[indexBlank].block}) // остаток 1
                    }
                }
                let newPanel = AddFrontPanel(px, py, px + part.x, py + part.y, 0) // строим панель
                newPanel.Name = part.name
                newPanel.ArtPos = part.pos
                newPanel.MaterialName = part.material
                newPanel.MaterialWidth = 0
                newPanel.Thickness = part.thickness
                if (part.tex == 0) {
                    newPanel.TextureOrientation = part.tex
                } else {
                    newPanel.TextureOrientation = 2
                }
                newPanel.Owner = list[indexBlank].block
                listOfBlanks.splice(indexBlank, 1) // убираем заготовку из списка
                listOfParts.shift() // убираем деталь из списка
                сutLogicFirst(listOfBlanks)
            }
        } else {
            if (isBlank == false) {
                addSheet(formatSheet)
            }
            сutLogicFirst(listOfBlanks)
        }
    } else { return }
}


Undo.RecursiveChanging(Model)
UnSelectAll()

let listOfParts = [] // список деталей для раскроя [{x: 600, y: 2500}, {x: 600, y: 2000}]
let formatSheet = {x: 2070, y: 2800} // формат листа
let countSheet = 0
let listOfBlanks = [] // список заготовок для раскроя {x: 2070, y: 2800, px: 0, py: 0}
let ofset = 15 // отступ от края листа
let cutWidth = 5 // ширина реза
let offcut = 20 // минимальная ширина и длина обрезка участвующего в раскрое

let posX = 0
let posY = 0

Model.forEachPanel(function(panel) { // запись деталей из модели которые можно разместить на листе
    let width = null
    let height = null
    let texture = panel.TextureOrientation // ориентация текстуры
    let copyPanel = AddCopy(panel)
    copyPanel.Build() // временная панель для определения размера детали с учетом припуска
    if (copyPanel.Butts.Count > 0) {
        for (let b = 0; b < copyPanel.Butts.Count; b ++) {
            let butt = copyPanel.Butts[b]
            let oldThickness = butt.Thickness
            if (butt.ClipPanel) {
                butt.ClipPanel = false
                butt.Thickness = - oldThickness + butt.Allowance
            } else {
                butt.Thickness = butt.Allowance
            }
        }
    }
    copyPanel.Build()
    if (texture == 2) { // текстура вертикально
        width = fixFloat(copyPanel.GSize.x, 5)
        height = fixFloat(copyPanel.GSize.y, 5)
    } else if (texture == 1) { // текстура горизонтально
        width = fixFloat(copyPanel.GSize.y, 5)
        height = fixFloat(copyPanel.GSize.x, 5)
    } else { // текстура незадана
        let w = fixFloat(copyPanel.GSize.x, 5)
        let h = fixFloat(copyPanel.GSize.y, 5)
        width = Math.min(w, h)
        height = Math.max(w, h)
    }
    DeleteObject(copyPanel) // удалить временную панель
    if (width <= formatSheet.x - ofset * 2 && height <= formatSheet.y - ofset * 2) {
        listOfParts.push({
            x: width, 
            y: height, 
            name: panel.Name, 
            pos: panel.ArtPos,
            material: panel.MaterialName,
            thickness: panel.Thickness,
            tex: texture
        })
    } else {
        alert('Деталь, Поз. ' + panel.ArtPos + ' не помещается на лист')
        Action.Control()
        Action.Finish()
    }
})

listOfParts.sort((a, b) => b.x * b.y - a.x * a.y) // сортировка деталей по площади
listOfParts.sort((a, b) => b.x - a.x) // сортировка деталей по ширине
if (listOfBlanks.length == 0) {addSheet(formatSheet)} // если заготовок нет добавить лист

сutLogicFirst(listOfBlanks)

listOfBlanks.forEach(blank => { // построить обрезки
    let px = blank.px
    let py = blank.py
    let buildBlank = AddFrontPanel(px, py, px + blank.x, py + blank.y, 0) // построить обрезок
    buildBlank.Owner = blank.block
    buildBlank.Color = 255
    buildBlank.Name = 'Обрезок'
})

Action.Commit()
Model.forEachPanel(function(panel) { // скрыть обрезки
    if (panel.Name == 'Обрезок' && panel.Color == 255) {
        panel.Visible = false
        panel.UseInDocs = false
        panel.UseInCNC = false
        panel.UseInCutting = false
        panel.UseInEstimate = false
    }
})
