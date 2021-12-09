import data from './data.json'

const arrayId = [];
const persons = {};
const rating = {};

const listView = document.querySelector(".list-view");
const contactList = document.querySelector(".contacts-list");
const detailsView = document.querySelector(".details-view");
const friendsLi = document.querySelectorAll(".friend");
const strangersLi = document.querySelectorAll(".stranger");
const starLi = document.querySelectorAll(".star");
const backArrow = document.querySelector('.back');

//Объект пользователей где ключ это id а значение обьект пользователя, и одновременно заполняем массив с id пользователей
const arrayJsonId = data.reduce((acc, item) => {
  arrayId.push(item.id);
  acc[item.id] = item;
  return acc;
}, {});

//Заполняем объект Persons, проходя перебором по  в глубину один раз по каждому пользователю.
// Добавляем пользователю характеристику rainting
function createPersons(array) {
  array.forEach((id) => {
    persons[id] = persons[id] ? persons[id] : {};
    persons[id].rating =
      persons[id].rating === undefined ? 0 : persons[id].rating + 1;
      updateRating( id , persons[id].rating);
    if (persons[id].friends) return;
    persons[id].name = arrayJsonId[id].name;
    persons[id].id = id;
    watchPersonsFriends(id);
    pushContactList(persons[id]);
  });
}
createPersons(arrayId);

//Обновляем обьект рейтинг, где ключ это количество упоминаний, а значение объект с ссылками на пользователей  
function updateRating(id , grade) {
  if (rating[grade-1] && rating[grade-1][id] ) {
    delete rating[grade-1][id];
    addRatingProp({grade , id}); 
  } else {
    addRatingProp({grade , id});
  }
};

function addRatingProp({grade , id}){
  if (rating[grade]) {
    rating[grade][id] = arrayJsonId[id];
  } else {
    rating[grade] = {};
    rating[grade][id] = arrayJsonId[id];
  } 
};

function watchPersonsFriends(id) {
  persons[id].friends = arrayJsonId[id].friends;
  createPersons(persons[id].friends);
}

// Заполняем список contacts-list
function pushContactList(person) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${person.name}</strong>`;
  li.setAttribute("data-id", person.id);
  li.addEventListener("click", openDetail);
  contactList.append(li);
}

function openDetail(event) {
  const id = event.currentTarget.dataset.id;
  listView.style.display = "none";
  createPersonMenu(arrayJsonId[id]);
}

backArrow.addEventListener('click' , backToContactList);
function backToContactList(event) {
  listView.style.display = 'block';
}

// Заполняем блок details-view
function createPersonMenu(person) {
  let header = document.querySelector(".details-view .header");
  header.textContent = person.name;
  friendsLi.forEach((li, i) => {
    li.setAttribute("data-id", person.friends[i]);
    li.addEventListener("click", openDetail);
    li.querySelector("span").innerHTML = arrayJsonId[person.friends[i]].name;
  });

  const getId = getIdStranger(arrayId, person.friends);
  strangersLi.forEach((li) => {
    const strangeId = getId();
    li.setAttribute("data-id", strangeId);
    li.addEventListener("click", openDetail);
    li.querySelector("span").innerHTML = arrayJsonId[strangeId].name;
  });

  const stars = get3Stars();
  starLi.forEach((li ,i ) => {
    li.setAttribute("data-id", stars[i]);
    li.addEventListener("click", openDetail);
    li.querySelector("span").innerHTML = arrayJsonId[stars[i]].name;
  });

}


//для выбора человека не из друзей, за минимальное количество шагов.
//Берем случайное целое число, используем его как индекс для обращения к массиву пользователей
// Проверяем есть ли предполагаемый случайный человек в списке друзей
// если есть повторяем с другим числом, если нет кэшируем это число   
function getIdStranger(allId, friendsId) {
  const allreadyHave = [...friendsId];
  return function findSupposedId() {
    const randNum = Math.floor(Math.random() * allId.length);
    const supposedId = allId[randNum];
    if (allreadyHave.includes(supposedId)) {
      return findSupposedId()
    } else {
      allreadyHave.push(supposedId);
      return supposedId;
    }
  };
}

// Получаем из обьекта raiting id трех человек с самым высоким рейтингом, при равенстве рейтинга сотрировка по имени.
function get3Stars(){
  const grades = Object.keys(rating);
  const starsId = []
  for (let i = grades.length-1; i > 0 ; i-- ) {
    const grade = grades[i];
    const personsWithGrade = Object.values(rating[grade]).sort( (a, b) => a.name > b.name ? 1 : -1); 
    for (let j = 0 ; j < personsWithGrade.length ; j++ ) {
      starsId.push(personsWithGrade[j].id)
      if (starsId.length >= 3) return starsId;
    }
  }
}

