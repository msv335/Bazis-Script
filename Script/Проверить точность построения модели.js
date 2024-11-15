// Скрипт проверяет точность размеров, углов,
// точность сопряжения дуг в контуре панелей,
// точность длины профиля и тел по траектории

function connect(el1, el2) {
    if (Math.sqrt(Math.pow((el2.Pos1.x - el1.Pos2.x), 2) +
        Math.pow((el2.Pos1.y - el1.Pos2.y), 2)) < 0.001) {
        return true
    } else {
        return false
    } 
}

function tangentLine(point, pointCenter, arcDir) {
    Line = new Object
    Pos1 = new Object
    Pos2 = new Object
    Dx = pointCenter.x - point.x
    Dy = pointCenter.y - point.y
    Line.Pos1 = Pos1
    Line.Pos2 = Pos2
    Line.Pos1.x = fixFloat(point.x, 5)
    Line.Pos1.y = fixFloat(point.y, 5)
    if (arcDir) {
        Line.Pos2.x = fixFloat(point.x + Dy, 5)
        Line.Pos2.y = fixFloat(point.y - Dx, 5)
    } else {
        Line.Pos2.x = fixFloat(point.x - Dy, 5)
        Line.Pos2.y = fixFloat(point.y + Dx, 5)
    }
    return Line
}

function getAngle(lin1, lin2) {
    let dx1 = lin1.Pos2.x - lin1.Pos1.x
    let dy1 = lin1.Pos2.y - lin1.Pos1.y
    let dx2 = lin2.Pos2.x - lin2.Pos1.x
    let dy2 = lin2.Pos2.y - lin2.Pos1.y
    let angle = Math.atan2(dx1 * dy2 - dy1 * dx2, dx1 * dx2 + dy1 * dy2)
    return fixFloat(angle / Math.PI * 180.0, 3)
}

function fixFloat(value, rounding) {
    const factor = Math.pow(10, rounding)
    return Math.round(value * factor) / factor
}

function inAsm(obj) { // объект внутри покупного изделия?
    return  obj instanceof TModel3D || obj instanceof TLayer3D ? false :
            obj instanceof TFurnAsm || obj instanceof TAsmKit ? true :
            inAsm(obj.Owner)
}


const ACCURACY_SIZE = 1 // точность вычисления размеров: 1, 0.1, 0.01, 0.001
const ACCURACY_ANGLE = 0.1 // точность вычисления углов: 1, 0.1, 0.01, 0.001

let mistake = []

Model.forEach(obj => {
	if (!inAsm(obj)) { // Объект не в сборке?
		if (obj instanceof TFurnPanel) {
			let width = fixFloat(obj.ContourWidth, 3)
			let height = fixFloat(obj.ContourHeight, 3)

			if (!(Math.abs(width - Math.round(width / ACCURACY_SIZE) * ACCURACY_SIZE) < 0.0001) ||
				!(Math.abs(height - Math.round(height / ACCURACY_SIZE) * ACCURACY_SIZE) < 0.0001)) {
				message = 'Поз ' + obj.ArtPos + ' - Размер панели: ' + 
					fixFloat(height, 3) + ' x ' + fixFloat(width, 3) + ' мм'
				mistake.includes(message) ? null : mistake.push(message)
				obj.Selected = true
			}

			for (let c = 0; c < obj.Contours.Count; c ++) {
				let contour = obj.Contours[c]
				for (let i = 0; i < contour.Count; i ++) {
					let elemFirst = contour[i]
					for (let s = 0; s < contour.Count; s ++) {
						let elemSecond = contour[s]
						if (elemFirst != elemSecond) {
							if (connect(elemFirst, elemSecond)) {
								if (elemFirst.ElType == 2) {
									let arc1 = elemFirst
									let tanLine1 = tangentLine(arc1.Pos2, arc1.Center, arc1.ArcDir)
									if (elemSecond.ElType == 2) { // Arc-Arc
										let arc2 = elemSecond
										let tanLine2 = tangentLine(arc2.Pos1, arc2.Center, arc2.ArcDir)
										let angle = getAngle(tanLine1, tanLine2)
										let message = null
										if (!(Math.abs(angle - Math.round(angle / ACCURACY_ANGLE) * ACCURACY_ANGLE) < 0.0001)) {
											message = 'Поз ' + obj.ArtPos + 
											' - Сопряжение дуга-дуга: ' + angle + '°'
											mistake.includes(message) ? null : mistake.push(message)
											obj.Selected = true
										}
									} else if (elemSecond.ElType == 1) { // Arc-Lin
										let angle = getAngle(tanLine1, elemSecond)
										let message = null
										if (!(Math.abs(angle - Math.round(angle / ACCURACY_ANGLE) * ACCURACY_ANGLE) < 0.0001)) {
											message = 'Поз ' + obj.ArtPos + 
											' - Сопряжение дуга-линия: ' + angle + '°'
											mistake.includes(message) ? null : mistake.push(message)
											obj.Selected = true
										}
									}
								} else if (elemFirst.ElType == 1) {
									if (elemSecond.ElType == 2) { // Lin-Arc
										let arc = elemSecond
										let tanLine = tangentLine(arc.Pos1, arc.Center, arc.ArcDir)
										let angle = getAngle(elemFirst, tanLine)
										let message = null
										if (!(Math.abs(angle - Math.round(angle / ACCURACY_ANGLE) * ACCURACY_ANGLE) < 0.0001)) {
											message = 'Поз ' + obj.ArtPos + 
											' - Сопряжение отрезок-дуга: ' + angle + '°'
											mistake.includes(message) ? null : mistake.push(message)
											obj.Selected = true
										}
									} else if (elemSecond.ElType == 1) { // Lin-Lin
										let angle = getAngle(elemFirst, elemSecond)
										let message = null
										if (!(Math.abs(angle - Math.round(angle / ACCURACY_ANGLE) * ACCURACY_ANGLE) < 0.0001)) {
											message = 'Поз ' + obj.ArtPos + 
											' - Угол между отрезками: ' + angle + '°'
											mistake.includes(message) ? null : mistake.push(message)
											obj.Selected = true
										}
									}
								}
							}
						}
					}
				}
			}
		} else if (obj instanceof TExtrusionBody) {
			let length = fixFloat(Math.abs(obj.Thickness), 3)
			if (!(Math.abs(length - Math.round(length / ACCURACY_SIZE) * ACCURACY_SIZE) < 0.0001)) {
				message = 'Поз ' + obj.ArtPos + 
				' - Размер профиля: ' + fixFloat(length, 3) + ' мм'
				mistake.includes(message) ? null : mistake.push(message)
				obj.Selected = true
			}
		} else if (obj instanceof T2DTrajectoryBody) {
			let length = 0
			for (let i = 0; i < obj.Trajectory2D.Count; i ++) {
				length += fixFloat(obj.Trajectory2D[i].ObjLength(), 3)
			}
			if (!(Math.abs(length - Math.round(length / ACCURACY_SIZE) * ACCURACY_SIZE) < 0.0001)) {
				message = 'Поз ' + obj.ArtPos + 
				' - Размер профиля: ' + fixFloat(length, 3) + ' мм'
				mistake.includes(message) ? null : mistake.push(message)
				obj.Selected = true
			}
		}
	}
})

if (mistake != 0) {
    mistake.sort()
    let mistakeText = mistake.join(', ')
    alert('Отклонения от заданной точности: \n\n' + mistakeText.replace(/, /gim,'\n'))
}
