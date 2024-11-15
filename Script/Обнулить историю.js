// Обнуляет историю, попутно скрывает линии стыков

Model.forEach(function (obj) {
    if (obj.Name == 'Линия стыка') {obj.Visible = false}
})

Undo.New()
