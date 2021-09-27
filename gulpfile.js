//Секция подключения плагинов

const gulp = require('gulp'); // подкл сам gulp
const sass = require('gulp-sass')(require('node-sass')); // подкл остальных плагинов
const cleanCSS = require('gulp-clean-css'); // сжимает и оптимизирует css
const rename = require('gulp-rename');  // переименовывает
const plumber = require('gulp-plumber'); // отлавливает ошибки
const notify = require('gulp-notify'); // украшает ошибки
const babel = require('gulp-babel'); // переводит js в старый синтаксис
const uglify = require('gulp-uglify'); // сжимает js
const include = require('gulp-include'); // позволяет исп вставку кода
const browserSync = require('browser-sync').create(); // live для всех устройств

//Для облегчения работы пути храним в объекте

const path = {
    dev:{
        root: 'src',
        html: 'src/**/*.html',
        sass: 'src/sass/**/*.{sass,scss}',
        js: 'src/js/main.js'
    },
    build:{
        root: 'build',
        css: 'build/css',
        js: 'build/js'
    }
}

// Секция создания таск или задач gulp(каждая функция эта задача gulp)

function liveReload(done){  // BrowserSync live server - ip notebook:8080
    browserSync.init({
        server: {
            baseDir: path.build.root
        },
        port: 8080
    })
    done()
}

function move (){
   return gulp.src(path.dev.html) // возьми все html из src 
     .pipe(gulp.dest(path.build.root)) // положи в папку 'build'
     .pipe(browserSync.stream());
}

function styles (){
    return gulp.src(path.dev.sass)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")})) // возвращает и уведомляет при ошибках можно исп в любом месте
        .pipe(sass()) // преобразуем в sass
        .pipe(gulp.dest(path.build.css)) // выгружаем простой css без оптимизации
        .pipe(cleanCSS({ // оптимизация css а также минификация
            level: 2  // уровень оптимизации от 1 до 3
        }))
        .pipe(rename({ // переименовываем добавляем .min
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.css)) // выгружаем оптимизированный css
        .pipe(browserSync.stream()); // автоматически следит и при изменениях перезагружает страницу BrowserSync
        
}

function scripts () { // работа с js файлами
    return gulp.src(path.dev.js)
        .pipe(include()) // подключает все файлы в один файл на выходе(можно использовать для js,html,css)
        .pipe(rename('original.js')) // переименовываем
        .pipe(gulp.dest(path.build.js))
        .pipe(babel({ // конвертирует новый js синтаксис в старый понятный для любого браузера
            presets: ['@babel/env'] // стандартный пресет
        }))
        .pipe(uglify()) // сжимает js код
        .pipe(rename('build.min.js')) // переименовываем
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
}

function watcher(done) { // следит за изменениями, колбэк вместо done может быть что угодно исп просто чтобы вернуть все вместо return 
    gulp.watch(path.dev.sass, styles) // следи за файлами если изменятся то запусти задачу styles
    gulp.watch(path.dev.html, move) // следи за файлами html если изменятся то запусти задачу move
    gulp.watch(path.dev.js, scripts)

    done(); // возвр результат вместо return исп в том случае если функция ничего не возвращает иначе будет ошибка
}

//Обязательный экспорт задач необходим для запуска задач gulp

exports.move = move;
exports.styles = styles; // экспортируй функцию например для вызова из терминала
exports.watcher = watcher;
exports.scripts = scripts;

exports.default = gulp.series( //dev основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    gulp.parallel( //dev запуск задач паралельный
        styles,
        move,
        scripts
    ),
    liveReload,
    watcher
);

exports.build = gulp.series( //build final основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    gulp.parallel( //build final запуск задач паралельный
        styles,
        move,
        scripts
    )
);
