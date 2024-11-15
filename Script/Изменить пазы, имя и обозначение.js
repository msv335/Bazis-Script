/*
Изменение наименования и обозначения паза на выделенных панелях
в окне формы, "editInBlock" - изменять пазы внутри выделенных блоков.
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

let listCut = {}
let paramsCut = []
let selectBlock = []
let editInBlock = true // изменять материалы внутри выделенных блоков?

Model.forEach(function(obj) {
    if (obj instanceof TFurnBlock && obj.Selected == true && !asmSearch(obj)) {
        if (!selectBlock.includes(obj)) {
            selectBlock.push(obj)
        }
    }
})

Model.forEachPanel(function(panel) {
    if ((panel.Selected == true || (editInBlock && inSelectBlock(panel))) && !asmSearch(panel)) {
        if (panel.Cuts.Count > 0) {
            for (let i = 0; i < panel.Cuts.Count; i ++) {
                let name = panel.Cuts[i].Name
                let sign = panel.Cuts[i].Sign
                let key = name + sign
                if (!(key in listCut)) {
                    listCut[key] = {
                        "key": key,
                        "name": name,
                        "sign": sign
                    }
                }
            }
        }
    }
})

//-- window form
let formHeight = 16 * 24 + 112

if (Object.keys(listCut).length < 16) {
    formHeight = (Object.keys(listCut).length + 1) * 24 + 112
}

Window = { Form : NewForm() }
Props = Window.Form.Properties
Window.Form.Width = 592
Window.Form.Height = formHeight
Window.Form.Caption = "Изменение пазов"
Window.Form.MinWidth = 592
Window.Form.Resizable = false
Window.Form.Dockable = false

Window.Group = Props.NewGroup()
Window.Group.SetLayout(0, -16, 576, formHeight - 64)
Window.Group.Scrollable = true

if (Object.keys(listCut).length == 0) {
    alert("Для изменения параметров необходимо выделить панели с пазами")
    Window.Form.Close()
    Action.Finish()
}

//-- window form properties
let positionHeight = 16
formLableName = Window.Group.NewLabel('Наименование:')
formLableName.SetLayout(16, positionHeight, 360, 24)
formLableSign = Window.Group.NewLabel('Обозначение:')
formLableSign.SetLayout(384, positionHeight, 160, 24)
positionHeight += 24

let indexListCut = 1
for (let key in listCut) {
    let i = indexListCut
    let nameNum = 'name' + i
    let signNum = 'sign' + i
    let param = {
        "name": nameNum,
        "sign": signNum,
        "oldName": listCut[key].name,
        "oldSign": listCut[key].sign,
        "newName": null,
        "newSign": null,
        "key": key
    }
    paramsCut.push(param)
    Window[nameNum] = Window.Group.NewString()
    Window[nameNum].SetLayout(16, positionHeight, 360, 22)
    Window[nameNum].Value = listCut[key].name
    Window[signNum] = Window.Group.NewString()
    Window[signNum].SetLayout(384, positionHeight, 160, 22)
    Window[signNum].Value = listCut[key].sign
    positionHeight += 24
    indexListCut ++
}

positionHeight += 24

formInfo = Props.NewLabel('- Для подтверждения изменений нажимать Enter')
formInfo.SetLayout(16, formHeight - 68, 360, 24)
Window.Button = Props.NewButton("Изменить пазы")
Window.Button.SetLayout(384, formHeight - 72, 160, 24)

//-- window form events
paramsCut.forEach(function (elem) { // обработка изменений в наименования
    Window[elem.name].OnChange = function() {
        elem.newName = Window[elem.name].Value
    }
})
paramsCut.forEach(function (elem) { // обработка изменений в обозначении
    Window[elem.sign].OnChange = function() {
        elem.newSign = Window[elem.sign].Value
    }
})

//-- window form ends
Window.Button.OnClick = function () {
    paramsCut.forEach(function (elem) { // обработка изменений в параметрах формы
        if (elem.newName || elem.newSign) {
            Model.forEachPanel(function(panel) {
                if ((panel.Selected == true || (editInBlock && inSelectBlock(panel))) && !asmSearch(panel)) {
                    if (panel.Cuts.Count > 0) {
                        for (let i = 0; i < panel.Cuts.Count; i ++) {
                            let key = panel.Cuts[i].Name + panel.Cuts[i].Sign
                            if (key == elem.key) {
                                if (panel.Cuts[i].Name == elem.oldName) { // изменить наименование паза
                                    if (elem.newName) { panel.Cuts[i].Name = elem.newName }
                                }
                                if (panel.Cuts[i].Sign == elem.oldSign) { // изменить обозначение паза
                                    if (elem.newSign) { panel.Cuts[i].Sign = elem.newSign }
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
