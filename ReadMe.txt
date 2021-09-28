Примечания к сборке!
 Плагин gulp-include 

 позволяет подключать части кода js ,css и любые библиотеки

 команды для подключения:

//=require vendor/jquery.js
//=require vendor/**/*.js
//=include relative/path/to/file.js
//=include ./relative/path/to/file-even-when-includePaths-set.js

/*=include relative/path/to/file.css */

#=include relative/path/to/file.coffee 

для HTML нужно использовать:

 	@@include('./components/header.html')
    @@include('./components/footer.html')

------------------------------------------------
Что делает сборка:
    1) SASS
    2) Оптимизация сss кода
    3) Сжатие кода 
    4) Преобразование синтаксиса js в старый синтаксис
    5) Сжатие js кода
    6) Добавлены для подключения Bootstrap 5 и Jquery
	7) BrowserSync для всех устройств в сети (например другого пк или мобилтного)
		(чтобы войти с другого устройства нужно в браузере вбить ip адрес пк и порт: 8080 например: 192.168.1.6:8080)
	8) Конвертирует ttf to woff (в dev режиме) и ttf to woff,woff2 (в build режиме)
	9) Конвертирует jpg,png,jpeg to webp 
	10) Использует компонентный подход 
---------------------------------------------------------------------------------------------
начало сборки - на всякий случай !!
---------------------------------------------------------------------------------------------
1. Подготовка

	Устанавливаем NodeJS
	Инициализируем Git
	Устанавливаем глобально npm --global gulp-cli
	Проверяем установку gulp -v // должно быть CLI version: 2.3 Local version: Unknown
	Инициализируем проект npm init -y
	Также устанавливаем gulp локально npm i gulp -D
	Добавляем в .gitignore папку node_modules
	создаем в корне файл gulpfile.js

2. Создание сборки
	в gulpfile.js =>

		const gulp = require('gulp'); // подкл сам gulp из папки node_modules

		---------------------------
		
		function welcome() {
			console.log('hello gulp') // любая функция
		}

		exports.welcome = welcome; // экспорт функции чтобы можно было вызвать из терминала (gulp welcome)

		------------------------------

	создаем папку src
		=> создаем index.html
		=> создаем css => style.css

	Попробуем перенести из папки src в папку build

		function move (){ // создание задачи
		   return gulp.src('src/**/*.*') // метод .src берет какие-то файлы /**/*.* все файлы из src
		     .pipe(gulp.dest('build')) // метод .pipe выполнит вложенную функцию и вернет результат  метод .dest положит в нужную папку 
		}

		exports.move = move;	

-----------------------------------------------------------------
создание задач устанавливаем плагин npm i gulp-sass node-sass -D 
-----------------------------------------------------------------
1) SASS стили
	
	const sass = require('gulp-sass');
	
	function styles (){
    return gulp.src('src/sass/**/*.{sass,scss}')
        .pipe(sass())
        .pipe(gulp.dest('build/css'))
        
}
	