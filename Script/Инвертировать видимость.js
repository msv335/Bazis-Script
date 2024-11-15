// Скрипт инвертирует видимость объектов

function fullVisible(obj, bool) {
    if (obj instanceof TModel3D || obj instanceof TLayer3D) {
        return
    } else {
        obj.Visible = bool
        fullVisible(obj.Owner, bool)
    }
}

function rebuildVisible(obj) {
    obj.forEach(elem => {
        if (elem.List) {
            elem.Visible = false
            rebuildVisible(elem)
        } else {
            elem.Visible = false
        }
    })
}


let visibles = []
let hides = []

Model.forEach(obj => {
    if (obj.List && !obj.Visible) {
        rebuildVisible(obj)
    }
})

Model.forEach(obj => {
    if (!(obj instanceof TModelLimits)) {
        obj.Visible ? visibles.push(obj) : hides.push(obj)
    }
})

visibles.forEach(obj => {
    fullVisible(obj, false)
})
hides.forEach(obj => {
    fullVisible(obj, true)
})
