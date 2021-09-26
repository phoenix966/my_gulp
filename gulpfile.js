const gulp = require('gulp'); // подкл сам gulp
const sass = require('gulp-sass')(require('node-sass')); // подкл остальных плагинов
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

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

function watcher(done) { // следит за изменениями, колбэк вместо done может быть что угодно исп просто чтобы вернуть все вместо return 
    gulp.watch('src/sass/**/*.{sass,scss}', styles) // следи за файлами если изменятся то запусти задачу styles
    gulp.watch('src/**/*.html', move) // следи за файлами если изменятся то запусти задачу move

    done(); // возвр результат вместо return исп в том случае если функция ничего не возвращает иначе будет ошибка
}

exports.move = move;
exports.styles = styles; // экспортируй функцию например для вызова из терминала
exports.watcher = watcher;