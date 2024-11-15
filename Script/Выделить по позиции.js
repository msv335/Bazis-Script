/*
Скрипт выделяет объекты по позиции
Может выделять несколько позиций, перечисляются через пробел
следовательно в позиции объектов не должно быть пробелов
*/

UnSelectAll()

let query = prompt('Позиция или несклько позиций, через пробел.\n' 
    + 'Например: 4 или 4 5 9')

let arr = query.split(/ +/)

Model.forEach(function(obj) {
    if (arr.includes(obj.ArtPos)) {
        obj.Visible = true
        obj.Selected = true
    }
})
