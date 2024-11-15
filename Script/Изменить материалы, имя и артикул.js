/*
Изменение наименования и артикула материалов в окне формы
Плитные материалы + облицовки пласти, гнутые панели, 
профиль, тело по траектории, тело вращения,
"editButt" - изменять материалы облицовка кромки.
"editInBlock" - изменять материалы внутри выделенных блоков.
*/

function asmSearch(obj) { // перебираем родительские объекты на наличие сборки
    if (obj instanceof TModel3D || obj instanceof TLayer3D) {
        return false
    } else if (obj instanceof TFurnAsm || obj instanceof TAsmKit) {
        return true
    } else {
        return asmSearch(obj.Owner)
    }
}

function inSelectBlock(obj) {
    if (obj.Owner instanceof TModel3D) {
        return false
    } else if (selectBlock.includes(obj.Owner)) {
        return true
    } else {
        inSelectBlock(obj.Owner)
    }
}


Undo.RecursiveChanging(Model)

let listMat = []
let paramsMat = []
let selectBlock = []
let editButt = false // изменять название и артикул кромок?
let editInBlock = true // изменять материалы внутри выделенных блоков?

Model.forEach(function(obj) {
    if (obj instanceof TFurnBlock && obj.Selected == true && !asmSearch(obj)) {
        if (!selectBlock.includes(obj)) {
            selectBlock.push(obj)
        }
    }
})

Model.forEach(function(obj) {
    if (obj instanceof TFurnPanel) {
        if ((obj.Selected == true || (editInBlock && inSelectBlock(obj))) && !asmSearch(obj)) {
            if (!listMat.includes(obj.MaterialName)) {
                listMat.push(obj.MaterialName)
            }
            if (obj.Plastics.Count > 0) {
                for (let i = 0; i < obj.Plastics.Count; i ++) {
                    if (!listMat.includes(obj.Plastics[i].Material)) {
                        listMat.push(obj.Plastics[i].Material)
                    }
                }
            }
            if (editButt) {
                if (obj.Butts.Count > 0) {
                    for (let b = 0; b < obj.Butts.Count; b ++) {
                        if (!listMat.includes(obj.Butts[b].Material)) {
                            listMat.push(obj.Butts[b].Material)
                        }
                    }
                }
            }
        }
    } else if (obj instanceof TExtrusionBody || 
        obj instanceof T2DTrajectoryBody || 
        obj instanceof T2DRotationBody) {
        if ((obj.Selected == true || (editInBlock && inSelectBlock(obj))) && !asmSearch(obj)) {
            if (!listMat.includes(obj.MaterialName)) {
                listMat.push(obj.MaterialName)
            }
        }
    }
})


//-- window form
let formHeight = 16 * 24 + 112

if (Object.keys(listMat).length < 16) {
    formHeight = (Object.keys(listMat).length + 1) * 24 + 112
}

Window = { Form : NewForm() }
Props = Window.Form.Properties
Window.Form.Width = 656
Window.Form.Height = formHeight
Window.Form.Caption = "Изменение материалов"
Window.Form.MinWidth = 656
Window.Form.Resizable = false
Window.Form.Dockable = false

Window.Group = Props.NewGroup()
Window.Group.SetLayout(0, -16, 640, formHeight - 64)
Window.Group.Scrollable = true

if (Object.keys(listMat).length == 0) {
    alert("Для изменения параметров необходимо выделить панели")
    Window.Form.Close()
    Action.Finish()
}

//-- window form properties
let positionHeight = 16
formLableMat = Window.Group.NewLabel('Наименование:')
formLableMat.SetLayout(16, positionHeight, 424, 24)
formLableCode = Window.Group.NewLabel('Артикул:')
formLableCode.SetLayout(448, positionHeight, 160, 24)
positionHeight += 24
listMat.sort((a, b) => a.localeCompare(b, 'ru'))
for (let i = 0; i < listMat.length; i ++) { // генерация параметров материалов в форме
    let matNum = 'mat' + (i + 1)
    let artNum = 'art' + (i + 1)
    let param = {
        "mat": matNum,
        "art": artNum,
        "oldMat" : listMat[i],
        "newMat" : null
    }
    paramsMat.push(param)
    Window[matNum] = Window.Group.NewString()
    Window[matNum].SetLayout(16, positionHeight, 424, 22)
    Window[matNum].Value = ExtractMatName(listMat[i])
    Window[artNum] = Window.Group.NewString()
    Window[artNum].SetLayout(448, positionHeight, 160, 22)
    Window[artNum].Value = ExtractMatCode(listMat[i])

    positionHeight += 24
}

positionHeight += 24

formInfo = Props.NewLabel('- Для подтверждения изменений нажимать Enter')
formInfo.SetLayout(16, formHeight - 68, 424, 24)
Window.Button = Props.NewButton("Изменить материалы")
Window.Button.SetLayout(448, formHeight - 72, 160, 24)


//-- window form events
paramsMat.forEach(function (elem) { // обработка изменений в наименования
    Window[elem.mat].OnChange = function() {
        elem.newMat = Window[elem.mat].Value + "\r" + Window[elem.art].Value
    }
})
paramsMat.forEach(function (elem) { // обработка изменений в артикуле
    Window[elem.art].OnChange = function() {
        elem.newMat = Window[elem.mat].Value + "\r" + Window[elem.art].Value
    }
})

//-- window form ends
Window.Button.OnClick = function () {
    paramsMat.forEach(function (elem) { // обработка изменений в наименования
        if (elem.newMat) {
            Model.forEach(function(obj) {
                if (obj instanceof TExtrusionBody || 
                    obj instanceof T2DTrajectoryBody || 
                    obj instanceof T2DRotationBody) {
                    if ((obj.Selected == true || (editInBlock && inSelectBlock(obj))) && !asmSearch(obj)) {
                        if (obj.MaterialName == elem.oldMat) {
                            obj.MaterialName = elem.newMat
                        }
                    }
                } else if (obj instanceof TFurnPanel) {
                    if ((obj.Selected == true || (editInBlock && inSelectBlock(obj))) && !asmSearch(obj)) {
                        if (obj.MaterialName == elem.oldMat) {
                            obj.MaterialName = elem.newMat
                        }
                        if (obj.Plastics.Count > 0) {
                            for (let i = 0; i < obj.Plastics.Count; i ++) {
                                if (obj.Plastics[i].Material == elem.oldMat) {
                                    obj.Plastics[i].Material = elem.newMat
                                }
                            }
                        }
                        if (obj.Butts.Count > 0) {
                            for (let b = 0; b < obj.Butts.Count; b ++) {
                                if (obj.Butts[b].Material == elem.oldMat) {
                                    obj.Butts[b].Material = elem.newMat
                                }
                            }
                        }
                    }
                }
            })
        }
    })
    Window.Form.Close()
    Action.Finish()
}

Window.Form.ShowModal()
