/*
Разрушает все блоки за исключением блоков верхнего уровня
Удаляет габаритные рамки при разрушении блоков
Удаляет эластичность с блоков верхнего уровня
Создано в версии: 2023.10.30.38061
*/

function sortBlocks(block) {
    if (block.Owner instanceof TModel3D || block.Owner instanceof TLayer3D) {
        listTopBlock.push(block) // блок верхнего уровня
    } else {
        listDestroy.push(block) // блок для разрушения
        sortBlocks(block.Owner)
    }
}

function searchNewOwner(obj) {
    if (listBlockInAsm.includes(obj.Owner)) {
        return obj.Owner
    } else if (listTopBlock.includes(obj.Owner)) {
        return obj.Owner
    } else {
        return searchNewOwner(obj.Owner)
    }
}

function destroyBlocks() {
    let countBlocks = 0
    Model.forEach(function(obj) { // счет пустых блоков
        if (obj instanceof TFurnBlock && listDestroy.includes(obj)) {
            countBlocks ++
        }
    })
    if (countBlocks != 0) {
        Model.forEach(function(obj) { // удаление пустых блоков
            if (obj instanceof TFurnBlock && listDestroy.includes(obj)) {
                DeleteObject(obj)
            }
        })
        destroyBlocks()
    } else { return }
}

function deleteGabFrame() {
    let countFrame = 0
    Model.forEach(function(obj) { // счет габаритных рамок
        if (obj instanceof TModelLimits && !(
            obj.Owner instanceof TModel3D || obj.Owner instanceof TLayer3D)) {
            countFrame ++
        }
    })
    if (countFrame != 0) {
        Model.forEach(function(obj) { // удаление габаритных рамок
            if (obj instanceof TModelLimits && !(
                obj.Owner instanceof TModel3D || obj.Owner instanceof TLayer3D)) {
                DeleteObject(obj)
            }
        })
        deleteGabFrame()
    } else { return }
}

function asmSearch(obj) { // перебираем родительские объекты на наличие сборки
    if (obj instanceof TModel3D || obj instanceof TLayer3D) {
        return false
    } else if (obj instanceof TFurnAsm || 
               obj instanceof TDraftBlock) {
        return obj
    } else {
        return asmSearch(obj.Owner)
    }
}


Undo.RecursiveChanging(Model)
UnSelectAll()

let listTopBlock = []
let listBlockInAsm = []
let listDestroy = []

Model.forEach(function(obj) { // сортировка блоков и сборок
    if (obj instanceof TFurnBlock) {
        if (asmSearch(obj)) {
            listBlockInAsm.push(asmSearch(obj))
            listDestroy.push(obj)
        } else {
            sortBlocks(obj)
        }
    }
})

listDestroy.forEach(function(block) { // изменение структуры модели
    for (let i = 0; i < block.Count; i = 0) {
        if (block.Count == 0) {
            break
        } else {
            let newBlock = searchNewOwner(block)
            block[i].ReTransform(block, newBlock)
            block[i].Owner = newBlock
        }
    }
})

destroyBlocks()
deleteGabFrame()

Model.forEach(function(obj) { // удалить эластичность оставшихся блоков
    if (obj instanceof TFurnBlock) {
        if (obj.ParamSectionNode('Elastic') != undefined) {
            obj.ParamRemoveSection('Elastic')
        }
    }
})

alert("Блоки разрушены")
