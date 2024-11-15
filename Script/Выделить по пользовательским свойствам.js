UnSelectAll()

let userPropertys = []
let linesSelection = []

let elect = ['Сверление торцевых отверстий глубиной больше 38 мм', 
             'Сверление отверстий ручное',
             // 'Отверстие не соответствующее техническим условиям',  
             'Количество деталей с ручным сверлением']         
let elect2 = ['Подрезание внутренних углов в древесной плите',
              'Количество деталей со скосами', 
              'Детали с криволинейной, ручной накаткой кромки', 
              'Накатка кромки на вырез R больше 20 мм', 
              'Накатка кромки на вырез R меньше 20 мм', 
              'Обработка малогабаритных деталей', 
              'Количество деталей со спиливанием торца под углом (УС)', 
              'Количество деталей с торцевым пазом (Т.Паз)']
let electName = 'на ручное сверление'
let electInProp = false   
let electName2 = 'на чертежи'
let electInProp2 = false   

Model.forEach(function (obj) { // сбор наименований пользовательских свойств
    for (let i = 0; i < obj.UserPropCount; i ++) {
        if (!userPropertys.includes(obj.UserPropertyName[i])) {
            userPropertys.push(obj.UserPropertyName[i])
        }
    }
})

for (let i = 0; i < elect.length; i ++) {    
    if (userPropertys.includes(elect[i])) {
        electInProp = true
    }
}
for (let i = 0; i < elect2.length; i ++) {    
    if (userPropertys.includes(elect2[i])) {
        electInProp2 = true
    }
}

if (userPropertys.length == 0) {
    alert('В модели нет пользовательских свойств!')
    Action.Finish()
}

// генерация формы в окне свойств
Prop = Action.Properties
for (let i = 0; i < userPropertys.length; i ++) { // генерация параметров формы
    let boolNum = 'Bool' + (i + 1)
    let param = {
        "prop" : userPropertys[i],
        "bool" : boolNum
    }
    linesSelection.push(param)
    Prop[boolNum] = Prop.NewBool(userPropertys[i], false)    
}
ButtonElect2 = Prop.NewButton("Выделить " + electName2)
ButtonElect = Prop.NewButton("Выделить " + electName)
ButtonInvert = Prop.NewButton("Инвертировать")
ButtonAllSelect = Prop.NewButton("Выделить все")
ButtonAllSelectOff = Prop.NewButton("Снять выделение")
ButtonClose = Prop.NewButton("Завершить работу")

// обработка событий окна свойств
linesSelection.forEach(function (elem) {
    Prop[elem.bool].OnChange = function() {
        Model.forEach(function (obj) {
            for (let i = 0; i < obj.UserPropCount; i ++) {
                if (elem.prop == obj.UserPropertyName[i]) {
                    if (Prop[elem.bool].Value == true) {
                        obj.Selected = true
                    } else {
                        let anotherBool = false                        
                        for (let o = 0; o < obj.UserPropCount; o ++) {
                            linesSelection.forEach(function (elem2) {
                                if (elem2.prop == obj.UserPropertyName[o]) {
                                    if (Prop[elem2.bool].Value == true) {
                                        anotherBool = true
                                    }                                      
                                }
                            })
                        }                         
                        if (!anotherBool) {
                            obj.Selected = false
                        }
                    }
                }
            }
        })
    }
})

// Работа кнопок
ButtonElect.OnClick = function () {
    if (electInProp) {
        linesSelection.forEach(function (elem) {
            Prop[elem.bool].Value = false
        })
        for (let i = 0; i < elect.length; i ++) {    
            if (userPropertys.includes(elect[i])) {
                linesSelection.forEach(function (elem) {
                    if (elem.prop == elect[i]) {
                        Prop[elem.bool].Value = true
                    }
                })                       
            }
        }
    } else {
        alert('Кнопка "Выделить ' + electName + '" недоступна, \nтак как необходимые пользовательские свойства не найдены.')
    }
}
ButtonElect2.OnClick = function () {
    if (electInProp2) { 
        linesSelection.forEach(function (elem) {
            Prop[elem.bool].Value = false
        }) 
        for (let i = 0; i < elect2.length; i ++) {    
            if (userPropertys.includes(elect2[i])) {
                linesSelection.forEach(function (elem) {
                    if (elem.prop == elect2[i]) {
                        Prop[elem.bool].Value = true
                    }
                })                       
            }
        }
    } else {
        alert('Кнопка "Выделить ' + electName2 + '" недоступна, \nтак как необходимые пользовательские свойства не найдены.')
    }
}
ButtonInvert.OnClick = function () {
    linesSelection.forEach(function (elem) {
        Prop[elem.bool].Value = !Prop[elem.bool].Value            
    })                    
}
ButtonAllSelect.OnClick = function () {
    linesSelection.forEach(function (elem) {
        Prop[elem.bool].Value = true
    })            
}
ButtonAllSelectOff.OnClick = function () {
    linesSelection.forEach(function (elem) {
        Prop[elem.bool].Value = false
    })            
}

ButtonClose.OnClick = function () {
    Action.Finish()
}

Action.Continue()
