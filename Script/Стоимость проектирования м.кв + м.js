/**
 * В разработке..
 * Считает стоимость работы конструктора, сохраняет данные в txt файл
 * Создано в версии: 2022.10.28.35633
 */

const fs = require("fs")

Undo.RecursiveChanging(Model) // если изменения небудут делаться, то писать в модель не нужно, убрать строку

let path = ""
let orderArt = Action.Control.Article.Code

let priceSquareMeter = 200 // TFurnPanel, нужно про гнутые посмотреть и склейки
let priceLinearMeter = 40 // TExtrusionBody или T2DTrajectoryBody

let priceSum = 0
let header = ["Заказ: " + orderArt + "\rРасчет стоимости проектирования:\r\r=====\r\r"]
let listSquare = []
let listLinear = []

panelMaterial = []
panelMaterialKeys = []
profileMaterial = []
profileMaterialKeys = []

Model.forEachPanel(function (panel) {
    if (panel.Selected === true) {
        let name = ExtractMatName(panel.MaterialName)
        let art = ExtractMatCode(panel.MaterialName)
        let square = panel.ContourWidth * panel.ContourHeight / 1000000
        let key = name + " (арт: " + art + ")"
        let param = {
            "name": name,
            "art": art,
            "square": square,
            "key": key
        }
        if (panelMaterialKeys.indexOf(key) < 0) {
            panelMaterialKeys.push(key)
            panelMaterial.push(param)
        } else {
            panelMaterial.forEach(function (elem) {
                if (elem.key === key) {
                    elem.square += square
                }
            })
        }

        for (let i = 0; i < panel.Plastics.Count; i++) {
            let name = ExtractMatName(panel.Plastics[i].Material)
            let art = ExtractMatCode(panel.Plastics[i].Material)
            let square = panel.ContourWidth * panel.ContourHeight / 1000000
            let key = name + " (арт: " + art + ")"
            let param = {
                "name": name,
                "art": art,
                "square": square,
                "key": key
            }
            if (panelMaterialKeys.indexOf(key) < 0) {
                panelMaterialKeys.push(key)
                panelMaterial.push(param)
            } else {
                panelMaterial.forEach(function (elem) {
                    if (elem.key === key) {
                        elem.square += square
                    }
                })
            }
        }
    }
})

Model.forEach(function (obj) {
    if (obj instanceof TExtrusionBody && obj.Selected === true){
        let name = ExtractMatName(obj.MaterialName)
        let art = ExtractMatCode(obj.MaterialName)
        let length = Math.abs(obj.Thickness) / 1000
        let key = name + " (арт: " + art + ")"
        let param = {
            "name": name,
            "art": art,
            "length": length,
            "key": key
        }
        if (profileMaterialKeys.indexOf(key) < 0) {
            profileMaterialKeys.push(key)
            profileMaterial.push(param)
        } else {
            profileMaterial.forEach(function (elem) {
                if (elem.key === key) {
                    elem.length += length
                }
            })
        }
    }
})

Model.forEach(function (obj) {
    if (obj instanceof T2DTrajectoryBody && obj.Selected === true){
        let name = ExtractMatName(obj.MaterialName)
        let art = ExtractMatCode(obj.MaterialName)
        let length = 0
        for (let i = 0; i < obj.Trajectory2D.Count; i++) {
            length += obj.Trajectory2D[i].ObjLength() / 1000
        }
        let key = name + " (арт: " + art + ")"
        let param = {
            "name": name,
            "art": art,
            "length": length,
            "key": key
        }
        if (profileMaterialKeys.indexOf(key) < 0) {
            profileMaterialKeys.push(key)
            profileMaterial.push(param)
        } else {
            profileMaterial.forEach(function (elem) {
                if (elem.key === key) {
                    elem.length += length
                }
            })
        }
    }
})

panelMaterial.forEach(function (elem) {
    let price = priceSquareMeter * elem.square
    let priceFix = + price.toFixed(0)
    priceSum += priceFix
    if (elem.art > "") {
        listSquare.push("- "
        + elem.name + " ("
        + elem.art + ") = "
        + elem.square.toFixed(3)
        + " м.кв х " + priceSquareMeter
        + " р = " + priceFix + " р")
    } else {
        listSquare.push("- "
        + elem.name + " = "
        + elem.square.toFixed(3)
        + " м.кв х " + priceSquareMeter
        + " р = " + priceFix + " р")
    }
})

profileMaterial.forEach(function (elem) {
    let price = priceLinearMeter * elem.length
    let priceFix = + price.toFixed(0)
    priceSum += priceFix
    if (elem.art > "") {
        listLinear.push("- "
        + elem.name + " ("
        + elem.art + ") = "
        + elem.length.toFixed(3)
        + " м х " + priceLinearMeter
        + " р = " + priceFix + " р")
    } else {
        listLinear.push("- "
        + elem.name + " = "
        + elem.length.toFixed(3)
        + " м х " + priceLinearMeter
        + " р = " + priceFix + " р")
    }
})

let strlistSquare = listSquare.join("\r")
let strlistLinear = listLinear.join("\r")
let strPrice = "\r\r=====\r\rИтого: " + priceSum
    + " рублей => " + Math.ceil(priceSum / 100) * 100 + " рублей"

system.writeTextFile(orderArt + ".txt",
    header + strlistSquare + "\r\r=====\r\r" + strlistLinear
    + "\r\r=====\r\r* Итоговая сумма округляется в большую сторону кратно 100 рублям."
    + strPrice)
Path = '"' + Action.Properties.AbsolutePath() + orderArt + '.txt"'
NewCOMObject('WScript.Shell').run(Path)
