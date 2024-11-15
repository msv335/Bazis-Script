// Скрипт строит панели из файла tsv
// Пример файла приложен "Образец.tsv"

// let fs = require('fs')
// let file = fs.readFileSync('D:/Script/Образец.tsv', 'UTF-8')

const choiceFile = system.askFileName('tsv') // выбор файла

const file = system.readTextFile(choiceFile) // открыть выбранный файл
// можно конкретный файл - system.readTextFile('D:/Script/Образец.tsv')
const string = file.split('\n') // ранее было '\r\n'

let listBuild = [] // список для построения

string.slice(1).map(str => {
    const [
        Mat, Length, Width, Count, Thick, 
        L1Mat, L1Thick, L1Width, L1Sign, 
        L2Mat, L2Thick, L2Width, L2Sign, 
        W1Mat, W1Thick, W1Width, W1Sign, 
        W2Mat, W2Thick, W2Width, W2Sign, 
        F1Mat, F1Thick, B1Mat, B1Thick, 
        F2Mat, F2Thick, B2Mat, B2Thick
    ] = str.split('\t')
    // столкнулся с проблемой, когда "\r" приходит из текстового файла,
    // то его по ходу нужно менять так replace("\\r", "\r")
    listBuild.push({
        Mat: Mat.replace("\\r", "\r"), 
        Length:  parseFloat(Length.replace(',', '.')), 
        Width:   parseFloat(Width.replace(',', '.')), 
        Count:   parseInt(Count), 
        Thick:   parseFloat(Thick.replace(',', '.')), 
        L1Mat:   L1Mat.replace("\\r", "\r"), 
        L1Thick: parseFloat(L1Thick.replace(',', '.')), 
        L1Width: parseFloat(L1Width.replace(',', '.')), 
        L1Sign:  L1Thick + "x" + L1Width + ", " + L1Sign, 
        L2Mat:   L2Mat.replace("\\r", "\r"), 
        L2Thick: parseFloat(L2Thick.replace(',', '.')), 
        L2Width: parseFloat(L2Width.replace(',', '.')), 
        L2Sign:  L2Thick + "x" + L2Width + ", " + L2Sign, 
        W1Mat:   W1Mat.replace("\\r", "\r"), 
        W1Thick: parseFloat(W1Thick.replace(',', '.')), 
        W1Width: parseFloat(W1Width.replace(',', '.')), 
        W1Sign:  W1Thick + "x" + W1Width + ", " + W1Sign, 
        W2Mat:   W2Mat.replace("\\r", "\r"), 
        W2Thick: parseFloat(W2Thick.replace(',', '.')), 
        W2Width: parseFloat(W2Width.replace(',', '.')), 
        W2Sign:  W2Thick + "x" + W2Width + ", " + W2Sign, 
        F1Mat:   F1Mat.replace("\\r", "\r"), 
        F1Thick: parseFloat(F1Thick.replace(',', '.')), 
        B1Mat:   B1Mat.replace("\\r", "\r"), 
        B1Thick: parseFloat(B1Thick.replace(',', '.')), 
        F2Mat:   F2Mat.replace("\\r", "\r"), 
        F2Thick: parseFloat(F2Thick.replace(',', '.')), 
        B2Mat:   B2Mat.replace("\\r", "\r"), 
        B2Thick: parseFloat(B2Thick.replace(',', '.'))
    })
})

Undo.RecursiveChanging(Model)

let posX = 0

listBuild.forEach(obj => {
    for (let i = 0; i < obj.Count; i ++) {
        let panel = AddFrontPanel(0, 0, obj.Width, obj.Length, 0)
        panel.Name = "Панель"
        panel.MaterialName = obj.Mat
        panel.Thickness = obj.Thick
        panel.TextureOrientation = 2 // 2 - то же что TextureOrientation.Vertical

        let butt = null
    
        if (obj.L1Mat) {
            butt = panel.Butts.Add()
            butt.ElemIndex = 3
            butt.Material = obj.L1Mat
            butt.Thickness = obj.L1Thick
            butt.ClipPanel = true
            butt.Allowance = 1
            butt.Sign = obj.L1Sign
            butt.Width = obj.L1Width
        }

        if (obj.L2Mat) {
            butt = panel.Butts.Add()
            butt.ElemIndex = 1
            butt.Material = obj.L2Mat
            butt.Thickness =obj.L2Thick
            butt.ClipPanel = true
            butt.Allowance = 1
            butt.Sign = obj.L2Sign
            butt.Width = obj.L2Width
        }
    
        if (obj.W1Mat) {
            butt = panel.Butts.Add()
            butt.ElemIndex = 2
            butt.Material = obj.W1Mat
            butt.Thickness = obj.W1Thick
            butt.ClipPanel = true
            butt.Allowance = 1;
            butt.Sign = obj.W1Sign
            butt.Width = obj.W1Width
        }
    
        if (obj.W2Mat) {
            butt = panel.Butts.Add()
            butt.ElemIndex = 0
            butt.Material = obj.W2Mat
            butt.Thickness = obj.W2Thick
            butt.ClipPanel = true
            butt.Allowance = 1
            butt.Sign = obj.W2Sign
            butt.Width = obj.W2Width
        }

        if (obj.F1Mat) { // лицевая облицовка
            let plast = panel.AddPlastic(NewMaterialInput(), true)
            plast.Material = obj.F1Mat
            plast.Thickness = obj.F1Thick
            plast.TextureOrientation = 2
            if (obj.F2Mat) {
                let plast2 = panel.AddPlastic(NewMaterialInput(), true)
                plast2.Material = obj.F2Mat
                plast2.Thickness = obj.F2Thick
                plast2.TextureOrientation = 2
            }
        }

        if (obj.B1Mat) { // обратная облицовка
            let plast = panel.AddPlastic(NewMaterialInput(), false)
            plast.Material = obj.B1Mat
            plast.Thickness = obj.B1Thick
            plast.TextureOrientation = 2
            if (obj.B2Mat) {
                let plast2 = panel.AddPlastic(NewMaterialInput(), false)
                plast2.Material = obj.B2Mat
                plast2.Thickness = obj.B2Thick
                plast2.TextureOrientation = 2
            }
        }
    
        panel.Build()
        panel.PositionX = posX
        panel.PositionZ = i * panel.ZThickness
        if (obj.B1Mat) { // смещение по Z если есть обратные облицовки
            panel.PositionZ = panel.PositionZ + obj.B1Thick
            if (obj.B2Mat) {panel.PositionZ = panel.PositionZ + obj.B2Thick}
        }
        if (i == obj.Count - 1) { // если панель последняя из Count увеличиваем X
            posX = panel.PositionX + panel.GSize.x + 100
        }
    }
})
