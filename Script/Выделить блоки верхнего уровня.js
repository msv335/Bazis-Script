// Скрипт выделяет листы (блоки, сборки) верхнего уровня,
// относительно вложенных объектов

function searchTopList(obj) {
    if (obj.Owner instanceof TModel3D || obj.Owner instanceof TLayer3D) {
        obj.List ? selects.push(obj) : null
    } else {
        searchTopList(obj.Owner)
    }
}


let selects = []

if (Model.SelectionCount) {
    for (let i = 0; i < Model.SelectionCount; i ++) {
        searchTopList(Model.Selections[i])
    }
} else {alert('объекты не выделены')}

UnSelectAll()
selects.forEach(sel => {sel.Selected = true})
