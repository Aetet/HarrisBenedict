(function () {
var app = window.app = {};

/**
 * Создаем утильную модель, дабы иметь хранилище
 *
 */
app.model = {
  userData: {},
  serverData: {}
};

/**
 * Парсим результат от применения функции serializeArray
 * @param [Object] Результат от $.serializeArray(), объект имеет формат
 * {name: "", value: ""}
 * 
 */
app.parseFormData = function (formData) {
  var result = {};
  for (var i = 0; i < formData.length; i++) {
    
    var key = formData[i].name;
    var value = formData[i].value;
    //Тонкая операция перевода из строки в число, 
    //если б у нас все данные были разного рода, то надо было бы вставлять проверки
    //что данные являются числами.
    result[key] = +value;
  }
  return result;
};

/**
 * Вычисляем результирующее количество калорий
 */
app.computeResult = function () {
  var rightGenderData = app.model.serverData.gender[app.model.userData.gender];
  var bMR = app._computeFirstStage(rightGenderData);
  console.log('bMR', bMR);
  var secondStageResult = app._computeSecondStage(bMR);
  console.log('secondRes', secondStageResult);

  return secondStageResult;

};

/**
 * Вычисляем величину основного обмена веществ
 * @param data данные необходимые для расчета обмена веществ
 *
 */
app._computeFirstStage = function (data) {
  var userData = app.model.userData;
  console.log('userData', userData, 'serverData', data);
  var result = data.freeMember + (data.weightKoef * userData.weight) 
            + (data.heightKoef * userData.height) - (data.ageKoef * userData.age);

  return result;
};

/**
 * Вычисляем необходимое в день количество калорий, чтобы не набирать вес
 *
 */
app._computeSecondStage = function (bMR) {
  console.log(app.model);
  var physicalActivity = app.model.serverData.exerciseKoef[app.model.userData.exercise];
  console.log('phys activity', physicalActivity);
  var result = bMR * physicalActivity ;
  return result;
};


$(document).ready(function () {
  var $form = $('.jsForm');
  var $submit = $('.jsFormSubmit');
  $submit.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var serializedData = $form.serializeArray();
    console.log('data', serializedData);

    app.model.userData = app.parseFormData(serializedData);
    
    $.ajax({
      dataType: "json",
      url: 'js/app/content/result.json',
      success: function (serverData) {
        
        console.log('what in box', serverData);
        app.model.serverData = serverData;
        //Здесь обычно следует воспользоваться EventBus, но поскольку это тестовое задание с минимумом функционала работать будем прямо здесь.
        app.result = app.computeResult();
        $('.jsResult').html(app.result);
      },
      error: function (e) {
        console.log('fuck it', e);
      }
    });
   
  });
});
})();



