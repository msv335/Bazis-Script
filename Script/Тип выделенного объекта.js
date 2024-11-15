/*
Определить тип выделенного объекта
*/

const objType = {
    "[object TFurnPanel]": "TFurnPanel - Панель",
    "[object TExtrusionBody]": "TExtrusionBody - Профиль",
    "[object T2DTrajectoryBody]": "T2DTrajectoryBody - Тело по траектории",
    "[object TCustomGroove]": "TCustomGroove - Многофункциональный вырез",
    "[object T2DRotationBody]": "T2DRotationBody - Тело вращения",
    "[object TCustomExtrusionBody]": "TCustomExtrusionBody - Отверстие",
    "[object TFurnBlock]": "TFurnBlock - Блок",
    "[object TDraftBlock]": "TDraftBlock - Полуфабрикат",
    "[object TFurnAsm]": "TFurnAsm - Сборка",
    "[object TAsmKit]": "TAsmKit - Комплект сборок",
    "[object TParamBlock3D]": "TParamBlock3D - Параметрический блок",
    "[object TFastener]": "TFastener - Фурнитура",
    "[object TModelLimits]": "TModelLimits - Габаритная рамка",
    "[object TModel3D]": "TModel3D - Модель",
    "[object TLayer3D]": "TLayer3D - Слой",
    "[object TSize3D]": "TSize3D - Размер",
    "[object TImportedAsm]": "TImportedAsm - Импортированный объект",
    "[object TImportedMesh]": "TImportedMesh - Импортированный объект",
    "[object TLine3D]": "TLine3D - Отрезок",
    "[object TContour3D]": "TContour3D - Вспомогательный контур",
    "[object TPlane3DObject]": "TPlane3DObject - Окружность?",
    "[object TObject3D]": "TObject3D - Вспомогательная линия"
}

let typeSelected = Model.Selected

alert(objType[typeSelected])
