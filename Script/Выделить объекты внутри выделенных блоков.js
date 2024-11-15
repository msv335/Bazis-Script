/*
Выделяет объекты внутри выделенного блока
Создано в версии: 2023.10.30.38061
*/

Undo.RecursiveChanging(Model)

let listSelect = []

Model.forEach(function(block) {
    if (block instanceof TFurnBlock && block.Selected == true) {
        block.Selected = false
        block.forEach(function(obj) {
            if (obj.Owner == block) {
                if (listSelect.indexOf(obj) < 0) {
                    listSelect.push(obj)
                }
            }
        })
    }
})

listSelect.forEach(function(obj) {
    obj.Selected = true
})
