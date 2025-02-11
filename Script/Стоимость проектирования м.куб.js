/**
 * Считает стоимость работы конструктора, сохраняет данные в txt файл
 * Считает объем TFurnPanel, TExtrusionBody, T2DTrajectoryBody
 * Создано в версии: 2023.10.30.38061
 */

const fs = require("fs")
let path = ""

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

function asmSearch(obj) { // перебираем родительские объекты на наличие сборки
    if (obj instanceof TModel3D || obj instanceof TLayer3D) {
        return false
    } else if (obj instanceof TFurnAsm) {
        return true
    } else {
        return asmSearch(obj.Owner)
    }
}


// ₽, м³
let orderArt = Action.Control.Article.Code
let rate = 12500 // тариф pублей за м.куб.. можно добавить разные тарифы с выбором
let priceProject = 0
let listMat = {/*Материал1: [{pos1: {price: 10, length: 1000}}, {pos2: {price: 5, length: 1200}}], Материал2: []*/}
let listMatIgnor = ["Пользовательские свойства\rЦМТ"]


Model.forEachPanel(function (panel) {
    if (!asmSearch(panel)) { // Панель не в сборке?
        let mat = panel.MaterialName
        if (!listMatIgnor.includes(mat)) { // Материала нет в списке игнорирования?

            let pos = panel.ArtPos
            let thickness = panel.Thickness
            for (let i = 0; i < panel.Plastics.Count; i++) { // Облицовки пласти
                thickness += panel.Plastics[i].Thickness
            }
            let vol = panel.ContourWidth * panel.ContourHeight * thickness / 1000000000
            
            if (mat in listMat) {
                // материал в списке
                if (!listMat[mat].some(item => pos in item)) {
                    // позиции нет в списке
                    listMat[mat].push({[panel.ArtPos]: {
                        name: panel.Name,
                        length: fixFloat(panel.ContourHeight, 1),
                        width: fixFloat(panel.ContourWidth, 1),
                        thickness: thickness,
                        count: 1,
                        volume: fixFloat(vol, 5),
                        price: fixFloat(vol * rate, 0)}})
                } else {
                    // позиция в списке
                    listMat[mat].forEach(item => {
                        if (pos in item) {
                            item[pos].count ++
                            item[pos].volume = fixFloat(item[pos].count * vol, 5)
                            item[pos].price = fixFloat(item[pos].count * vol * rate, 0)
                        }
                    })
                }
        
            } else {
                // материала нет в списке
                listMat[mat] = [] // добавить материал в список
                listMat[mat].push({[panel.ArtPos]: {
                    name: panel.Name,
                    length: fixFloat(panel.ContourHeight, 1),
                    width: fixFloat(panel.ContourWidth, 1),
                    thickness: thickness,
                    count: 1,
                    volume: fixFloat(vol, 5),
                    price: fixFloat(vol * rate, 0)}})
            }
        }
    }
})

Model.forEach(function (obj) {
    // Профиль
    if (obj instanceof TExtrusionBody) {
        if (!asmSearch(obj)) { // Ппрофиль не в сборке?
            let mat = obj.MaterialName
            if (!listMatIgnor.includes(mat)) { // Материала нет в списке игнорирования?
                let pos = obj.ArtPos
                let vol = obj.Contour.Width * obj.Contour.Height * Math.abs(obj.Thickness) / 1000000000
                if (mat in listMat) {
                    // материал в списке
                    if (!listMat[mat].some(item => pos in item)) {
                        // позиции нет в списке
                        listMat[mat].push({[obj.ArtPos]: {
                            name: obj.Name,
                            length: fixFloat(obj.Contour.Height, 1),
                            width: fixFloat(obj.Contour.Width, 1),
                            thickness: fixFloat(Math.abs(obj.Thickness), 1),
                            count: 1,
                            volume: fixFloat(vol, 5),
                            price: fixFloat(vol * rate, 0)}})
                    } else {
                        // позиция в списке
                        listMat[mat].forEach(item => {
                            if (pos in item) {
                                item[pos].count ++
                                item[pos].volume = fixFloat(item[pos].count * vol, 5)
                                item[pos].price = fixFloat(item[pos].count * vol * rate, 0)
                            }
                        })
                    }
            
                } else {
                    // материала нет в списке
                    listMat[mat] = [] // добавить материал в список
                    listMat[mat].push({[obj.ArtPos]: {
                        name: obj.Name,
                        length: fixFloat(obj.Contour.Height, 1),
                        width: fixFloat(obj.Contour.Width, 1),
                        thickness: fixFloat(Math.abs(obj.Thickness), 1),
                        count: 1,
                        volume: fixFloat(vol, 5),
                        price: fixFloat(vol * rate, 0)}})
                }
            }
        }
    }
    // Тело по траектории
    if (obj instanceof T2DTrajectoryBody){
        if (!asmSearch(obj)) { // Тело не в сборке?
            let mat = obj.MaterialName
            if (!listMatIgnor.includes(mat)) { // Материала нет в списке игнорирования?
                let pos = obj.ArtPos
                let length = 0
                for (let i = 0; i < obj.Trajectory2D.Count; i++) {
                    length += obj.Trajectory2D[i].ObjLength()
                }
                let vol = obj.Contour2D.Width * obj.Contour2D.Height * length / 1000000000
                if (mat in listMat) {
                    // материал в списке
                    if (!listMat[mat].some(item => pos in item)) {
                        // позиции нет в списке
                        listMat[mat].push({[obj.ArtPos]: {
                            name: obj.Name,
                            length: fixFloat(obj.Contour2D.Height, 1),
                            width: fixFloat(obj.Contour2D.Width, 1),
                            thickness: fixFloat(length, 1),
                            count: 1,
                            volume: fixFloat(vol, 5),
                            price: fixFloat(vol * rate, 0)}})
                    } else {
                        // позиция в списке
                        listMat[mat].forEach(item => {
                            if (pos in item) {
                                item[pos].count ++
                                item[pos].volume = fixFloat(item[pos].count * vol, 5)
                                item[pos].price = fixFloat(item[pos].count * vol * rate, 0)
                            }
                        })
                    }
            
                } else {
                    // материала нет в списке
                    listMat[mat] = [] // добавить материал в список
                    listMat[mat].push({[obj.ArtPos]: {
                        name: obj.Name,
                        length: fixFloat(obj.Contour2D.Height, 1),
                        width: fixFloat(obj.Contour2D.Width, 1),
                        thickness: fixFloat(length, 1),
                        count: 1,
                        volume: fixFloat(vol, 5),
                        price: fixFloat(vol * rate, 0)}})
                }
            }
        }
    }
})

let lines= []
for (let material in listMat) {

    let volumeMat = 0
    let priceMat = 0
    listMat[material].forEach((item) => {
        for (let pos in item) {
            volumeMat += item[pos].volume
            priceMat += item[pos].price
        }
    })
    volumeMat = fixFloat(volumeMat, 5)

    lines.push(priceMat + ' р = ' + volumeMat + ' м.куб - ' + ExtractMatName(material) + " (" + ExtractMatCode(material) + "):\r")

    listMat[material].forEach((item) => {
        for (let pos in item) {
            lines.push(item[pos].volume + ' м.куб - ' + item[pos].length + ' х '
                + item[pos].width + ' х ' + item[pos].thickness + ' - '
                + item[pos].name + ' (Поз.' + pos + ') - ' + item[pos].count + ' шт')
        }
    })
    
    lines.push("\r-----\r")
    priceProject += priceMat

}

system.writeTextFile(orderArt + ".txt",
    "Проект: " + orderArt + "\r" +
    "Тариф: " + rate + " р/м.куб\r" +
    "Стоимость проектирования: " + priceProject + ' р' +
    "\r\r-----\r\r" +
    lines.join("\r"))
path = '"' + Action.Properties.AbsolutePath() + orderArt + '.txt"'
NewCOMObject('WScript.Shell').run(path)
