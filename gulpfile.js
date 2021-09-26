const gulp = require('gulp'); // подкл сам gulp
const sass = require('gulp-sass')(require('node-sass')); // подкл остальных плагинов
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const include = require('gulp-include');

function move (){
   return gulp.src('src/**/*.html') // возьми все html из src 
     .pipe(gulp.dest('build')) // положи в папку 'build'
}

function styles (){
    return gulp.src('src/sass/**/*.{sass,scss}')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")})) // возвращает и уведомляет при ошибках можно исп в любом месте
        .pipe(sass()) // преобразуем в sass
        .pipe(gulp.dest('build/css')) // выгружаем простой css без оптимизации
        .pipe(cleanCSS({ // оптимизация css а также минификация
            level: 2  // уровень оптимизации от 1 до 3
        }))
        .pipe(rename({ // переименовываем добавляем .min
            suffix: '.min'
        }))
        .pipe(gulp.dest('build/css')) // выгружаем оптимизированный css
        
}

function scripts () { // работа с js файлами
    return gulp.src('src/js/main.js')
        .pipe(include()) // подключает все файлы в один файл на выходе(можно использовать для js,html,css)
        .pipe(gulp.dest('build/js'))
        .pipe(babel({ // конвертирует новый js синтаксис в старый понятный для любого браузера
            presets: ['@babel/env'] // стандартный пресет
        }))
        .pipe(uglify()) // сжимает js код
        .pipe(rename({ // переименовываем добавляем .min
            suffix: '.min'
        }))
        .pipe(gulp.dest('build/js'))
}

function watcher(done) { // следит за изменениями, колбэк вместо done может быть что угодно исп просто чтобы вернуть все вместо return 
    gulp.watch('src/sass/**/*.{sass,scss}', styles) // следи за файлами если изменятся то запусти задачу styles
    gulp.watch('src/**/*.html', move) // следи за файлами html если изменятся то запусти задачу move

    done(); // возвр результат вместо return исп в том случае если функция ничего не возвращает иначе будет ошибка
}

exports.move = move;
exports.styles = styles; // экспортируй функцию например для вызова из терминала
exports.watcher = watcher;
exports.scripts = scripts;