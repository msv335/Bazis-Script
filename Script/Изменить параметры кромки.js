/*
Изменение кромок на выделенных панелях
Наименование, Артикул, Обозначение,
Толщина, Ширина, Припуск, Подрезка
"editInBlock" - изменять материалы внутри выделенных блоков.
*/

function asmSearch(obj) { // перебираем родительские объекты на наличие сборки
    if (obj instanceof TModel3D || obj instanceof TLayer3D) {
        return false
    } else if (obj instanceof TFurnAsm) {
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

let listButt = {}
let formButt = []
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
        if (panel.Butts.Count > 0) {
            for (let b = 0; b < panel.Butts.Count; b ++) {

                let mat = panel.Butts[b].Material
                let name = ExtractMatName(panel.Butts[b].Material)
                let code = ExtractMatCode(panel.Butts[b].Material)
                let sign = panel.Butts[b].Sign
                let thick = panel.Butts[b].Thickness
                let width = panel.Butts[b].Width
                let allow = panel.Butts[b].Allowance
                let clip = null
                if (panel.Butts[b].ClipPanel == true) {clip = "Да"} else {clip = "Нет"}
                let key = mat + sign + thick + width + allow + clip

                if (!(key in listButt)) {
                    listButt[key] = {
                        "key": key,
                        "mat": mat,
                        "name": name,
                        "code": code,
                        "sign": sign,
                        "thick": thick,
                        "width": width,
                        "allow": allow,
                        "clip": clip
                    }
                }
            }
        }
    }
})


//-- window form

let formHeight = 4 * 152 + 96
if (Object.keys(listButt).length < 4) {
    formHeight = Object.keys(listButt).length * 152 + 96
}

Window = { Form : NewForm() }
Props = Window.Form.Properties
Window.Form.Width = 528
Window.Form.Height = formHeight
Window.Form.Caption = "Изменение параметров кромки"
Window.Form.MinWidth = 528
Window.Form.Resizable = false
Window.Form.Dockable = false

Window.Group = Props.NewGroup()
Window.Group.SetLayout(0, -16, 512, formHeight - 64)
Window.Group.Scrollable = true

if (Object.keys(listButt).length == 0) {
    alert("Для изменения параметров необходимо выделить панели")
    Window.Form.Close()
    Action.Finish()
}

//-- window form properties
let positionHeight = 0
let indexListButt = 1

for (let key in listButt) {

    let i = indexListButt // генерация строк параметров кромки в форме
    let nameNum = 'nameNum' + i
    let codeNum = 'codeNum' + i
    let signNum = 'signNum' + i
    let thickNum = 'thickNum' + i
    let widthNum = 'widthNum' + i
    let allowNum = 'allowNum' + i
    let clipNum = 'clipNum' + i

    let param = {
        "nameNum": nameNum,
        "codeNum": codeNum,
        "signNum": signNum,
        "thickNum": thickNum,
        "widthNum": widthNum,
        "allowNum" : allowNum,
        "clipNum" : clipNum,
        "newMat" : null,
        "newClip": null,
        "key": key
    }
    formButt.push(param)

    positionHeight += 16

    Window[nameNum] = Window.Group.NewString()
    Window[nameNum].SetLayout(16, positionHeight, 464, 24)
    Window[nameNum].Value = listButt[key].name

    positionHeight += 24

    formLableCode = Window.Group.NewLabel('Артикул:')
    formLableCode.SetLayout(16, positionHeight + 2, 228, 20)
    formLableSign = Window.Group.NewLabel('Обозначение:')
    formLableSign.SetLayout(252, positionHeight + 2, 228, 20)

    positionHeight += 20

    Window[codeNum] = Window.Group.NewString()
    Window[codeNum].SetLayout(16, positionHeight, 228, 24)
    Window[codeNum].Value = listButt[key].code

    Window[signNum] = Window.Group.NewString()
    Window[signNum].SetLayout(252, positionHeight, 228, 24)
    Window[signNum].Value = listButt[key].sign

    positionHeight += 24

    formLableThick = Window.Group.NewLabel('Толщина:')
    formLableThick.SetLayout(16, positionHeight + 2, 110, 20)
    formLableWidth = Window.Group.NewLabel('Ширина:')
    formLableWidth.SetLayout(134, positionHeight + 2, 110, 20)
    formLableAllow = Window.Group.NewLabel('Припуск:')
    formLableAllow.SetLayout(252, positionHeight + 2, 110, 20)
    formLableClip = Window.Group.NewLabel('Подрезать:')
    formLableClip.SetLayout(370, positionHeight + 2, 110, 20)

    positionHeight += 20

    Window[thickNum] = Window.Group.NewString()
    Window[thickNum].SetLayout(16, positionHeight, 110, 24)
    Window[thickNum].Value = listButt[key].thick

    Window[widthNum] = Window.Group.NewString()
    Window[widthNum].SetLayout(134, positionHeight, 110, 24)
    Window[widthNum].Value = listButt[key].width

    Window[allowNum] = Window.Group.NewString()
    Window[allowNum].SetLayout(252, positionHeight, 110, 24)
    Window[allowNum].Value = listButt[key].allow

    Window[clipNum] = Window.Group.NewCombo()
    Window[clipNum].SetLayout(370, positionHeight, 110, 24)
    Window[clipNum].ComboItems = ["Да", "Нет"]

    if (listButt[key].clip == "Да") {
        Window[clipNum].ItemIndex = 0
    } else if (listButt[key].clip == "Нет") {
        Window[clipNum].ItemIndex = 1
    }
    
    positionHeight += 32
    formBorder = Window.Group.NewLabel('-----')
    formBorder.SetLayout(16, positionHeight + 4, 464, 24)
    positionHeight += 16
    indexListButt ++

}

formInfo = Props.NewLabel('- Для подтверждения изменений нажимать Enter')
formInfo.SetLayout(16, formHeight - 68, 424, 24)
Window.Button = Props.NewButton("Изменить кромку")
Window.Button.SetLayout(370, formHeight - 72, 110, 24)


//-- window form events
formButt.forEach(function (elem) { // обработка изменений в наименования
    Window[elem.nameNum].OnChange = function() {
        elem.newMat = Window[elem.nameNum].Value + "\r" + Window[elem.codeNum].Value
    }
})
formButt.forEach(function (elem) { // обработка изменений в артикуле
    Window[elem.codeNum].OnChange = function() {
        elem.newMat = Window[elem.nameNum].Value + "\r" + Window[elem.codeNum].Value
    }
})

formButt.forEach(function (elem) { // обработка изменений в подрезке
    Window[elem.clipNum].OnChange = function() {
        elem.newClip = Window[elem.clipNum].Value
    }
})

//-- window form ends
Window.Button.OnClick = function () {
    formButt.forEach(function (elem) { // обработка изменений в кромке
        // Изменение параметров
        Model.forEachPanel(function(panel) {
            if ((panel.Selected == true || (editInBlock && inSelectBlock(panel))) && !asmSearch(panel)) {
                if (panel.Butts.Count > 0) {
                    for (let b = 0; b < panel.Butts.Count; b ++) {
                        let clip = null
                        if (panel.Butts[b].ClipPanel) {clip = "Да"} else {clip = "Нет"}
                        let key = panel.Butts[b].Material + panel.Butts[b].Sign + 
                                  panel.Butts[b].Thickness + panel.Butts[b].Width +
                                  panel.Butts[b].Allowance + clip
                        if (key == elem.key) {
                            panel.Butts[b].Sign = Window[elem.signNum].Value
                            panel.Butts[b].Thickness = parseFloat(Window[elem.thickNum].Value.replace(',', '.'))
                            panel.Butts[b].Width = parseFloat(Window[elem.widthNum].Value.replace(',', '.'))
                            panel.Butts[b].Allowance = parseFloat(Window[elem.allowNum].Value.replace(',', '.'))
                            if (elem.newClip) {
                                let newClip = Window[elem.clipNum].Value
                                if (newClip == "Да") {
                                    panel.Butts[b].ClipPanel = true
                                } else if (newClip == "Нет") {panel.Butts[b].ClipPanel = false}
                            }
                            if (elem.newMat) { panel.Butts[b].Material = elem.newMat }
                        }                            
                    }
                }
            }
        })

    }) 
    Window.Form.Close()
    Action.Finish()
}

Window.Form.ShowModal()
