// Скрипт удаляет историю и вспомогательные построения в модели
// Если к примеру панель названа 'Параллельная линия',
// то она удалиться нужно улучшить..

let objDelete = []

Model.forEach(function(obj) {
    if (obj.Name == 'Параллельная линия' ||
        obj.Name == 'Перпендикулярная линия' ||
        obj.Name == 'Линия под углом' ||
        obj.Name == 'Линия пересечения' ||
        obj.Name == 'Биссектриса') {
            objDelete.push(obj)
    }
})

if (objDelete) {
    objDelete.forEach(obj => {
        DeleteObject(obj)
    })
}

Action.Commit()
Undo.New()
