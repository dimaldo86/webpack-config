//  Подключение картинки
// import city from './assets/img/city.jpg';
// img.src = city;
// Подключение html
import './index.html'
// подключение стилей
import './scss/style.scss';


function component() {
    const element = document.createElement('div');

    element.innerHTML = 'Hello Webpack 5';
    element.classList.add('hello');

    // Пример использования картинки
    const myIcon = new Image();
    myIcon.src = Icon;

    element.appendChild(myIcon);

    return element;
}

document.body.appendChild(component());