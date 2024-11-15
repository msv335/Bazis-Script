/*
Добавляет в наименования панелей и профилей позицию блока верхнего уровня
Создано в версии: 2023.10.30.38061
Примерный алгоритм работы:
- Расставить позиции в модели
- Прописать позиции блокам верхнего уровня
- Запустить скрипт
*/

function searchTopBlock(obj) { // поиск блока верхнего уровня
    if (obj.Owner instanceof TModel3D || obj.Owner instanceof TLayer3D) {
        return obj.ArtPos
    } else {
        return searchTopBlock(obj.Owner)
    }
}


Undo.RecursiveChanging(Model)
UnSelectAll()

Model.forEach(function(obj) {
    if (obj instanceof TFurnPanel || 
        obj instanceof TExtrusionBody || 
        obj instanceof T2DTrajectoryBody) {
        if (obj.Owner instanceof TFurnBlock) {
            obj.Name = searchTopBlock(obj) + ", " + obj.Name
        }
    }
})
