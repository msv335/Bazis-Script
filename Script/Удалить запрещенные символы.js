// Скрипт удаляет из наименований в модели недопустимые символы
// панелей, облицовк пласти, облицовок кромки, пазы,
// профилей, тел по траектории, тела вращения, мф вырез
// материалы, артикулы, обозначения и т.п.
// В дальнейшем нужно создать список разрешенных
// символов и что-бы модель проверялась на них

let startTime = Date.now()
function replaceSymbols(str) {
    // return str.replace(REGEX, NEW_SYMBOL)
    str = str.replace(REGEX, () => {
        count ++
        return NEW_SYMBOL
    })
    return str
}


Undo.RecursiveChanging(Model)

const SYMBOLS_REPLACE = ["*", ";", "|"] // не должен содержать \
const NEW_SYMBOL = "_"
const REGEX = new RegExp(SYMBOLS_REPLACE.map(symbol => "\\" + symbol).join("|"), "g")

let count = 0 // количество найденных символов

Action.Control.Article.OrderName = replaceSymbols(Action.Control.Article.OrderName)
Action.Control.Article.Name = replaceSymbols(Action.Control.Article.Name)
Action.Control.Article.Code = replaceSymbols(Action.Control.Article.Code)
Action.Control.Article.ShortSign = replaceSymbols(Action.Control.Article.ShortSign)

Model.forEach(obj => {
    obj.Name = replaceSymbols(obj.Name)
    if (obj instanceof TFurnPanel) {
        let panel = obj
        panel.MaterialName = replaceSymbols(panel.MaterialName)
        if (panel.Plastics.Count) { // облицовки пласти
            for (let i = 0; i < panel.Plastics.Count; i ++) {
                panel.Plastics[i].Material = replaceSymbols(panel.Plastics[i].Material)
            }
        }
        if (panel.Butts.Count) { // кромки
            for (let b = 0; b < panel.Butts.Count; b ++) {
                panel.Butts[b].Material = replaceSymbols(panel.Butts[b].Material)
                panel.Butts[b].Sign = replaceSymbols(panel.Butts[b].Sign)
            }
        }
        if (panel.Cuts.Count) { // пазы
            for (let i = 0; i < panel.Cuts.Count; i ++) {
                panel.Cuts[i].Sign = replaceSymbols(panel.Cuts[i].Sign)
                panel.Cuts[i].Name = replaceSymbols(panel.Cuts[i].Name)
            }
        }
    } else if (obj instanceof TExtrusionBody || // профиль
               obj instanceof T2DTrajectoryBody || // тело по траектории
               obj instanceof T2DRotationBody || // тело вращения
               obj instanceof TCustomGroove) { //многофункциональный вырез
                    obj.Name = replaceSymbols(obj.Name)
                    obj.MaterialName = replaceSymbols(obj.MaterialName)
    } else if (obj instanceof TFastener || 
               obj instanceof TFurnAsm || 
               obj instanceof TAsmKit) {
                    obj.Name = replaceSymbols(obj.Name)
    }
})

let endTime = Date.now()
let time = endTime - startTime
if (count) {alert('Количество исправленных символов: ' + count + ' время: ' + time + ' мс')}
