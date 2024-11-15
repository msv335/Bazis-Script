// Считает площадь панелей с учетом вырезов

Model.forEachPanel(function(panel) {
    console.log(geometry.Area(panel.Contour) / 1000000)
})
