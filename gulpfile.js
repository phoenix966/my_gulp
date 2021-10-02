//Секция подключения плагинов

const gulp = require('gulp'); // подкл сам gulp
const sass = require('gulp-sass')(require('node-sass')); // подкл sass
const cleanCSS = require('gulp-clean-css'); // сжимает и оптимизирует css
const rename = require('gulp-rename');  // переименовывает
const plumber = require('gulp-plumber'); // отлавливает ошибки
const notify = require('gulp-notify'); // украшает ошибки
const babel = require('gulp-babel'); // переводит js в старый синтаксис
const uglify = require('gulp-uglify'); // сжимает js
const include = require('gulp-include'); // позволяет исп вставку кода
const browserSync = require('browser-sync').create(); // live для всех устройств
const webp = require('gulp-webp'); // img в webp
const ttf2woff = require('gulp-ttf2woff'); // ttf шрифт в woff
const ttf2woff2 = require('gulp-ttf2woff2'); // ttf шрифт в woff2
const del = require('del'); // удаляет файлы или папки
const fileinclude = require('gulp-file-include'); // подключает html компоненты
const iconfont = require('gulp-iconfont'); // Создает иконочный шрифт
const iconfontCss = require('gulp-iconfont-css'); // создает стили к иконочному шрифту
const googleWebFonts = require('gulp-google-webfonts');

//Для облегчения работы пути храним в объекте

const path = {
    dev:{
        root: 'src',
        html: ['src/**/*.html', '!src/components/**/*.html'],
        allHtml: 'src/**/*.html',
        php: ['src/**/*.php', '!src/components/**/*.{php,html}'],
        sass: 'src/sass/**/*.{sass,scss}',
        js: 'src/js/main.js',
        img: 'src/img/**/*.{jpg,png,jpeg,Jpg,Png,Jpeg,JPG,PNG,JPEG,tiff,webp}',
        otherImg: ['src/img/**/*.*','!src/img/**/*.{jpg,png,jpeg,Jpg,Png,Jpeg,JPG,PNG,JPEG,tiff,webp,db}'],
        fonts: 'src/fonts/**/*.*',
        ttf: 'src/fonts/**/*.ttf',
        otherFonts:'src/fonts/**/*.woff',
        iconfont: 'src/fonts/generateIcon(dontREMOVE)/**/*.svg'
    },
    build:{
        root: 'build',
        css: 'build/css',
        js: 'build/js',
        img: 'build/img',
        ttf: 'build/fonts'
    }
}

// Секция создания таск или задач gulp(каждая функция эта задача gulp)

async function clean() {
    return await del.sync(path.build.root);
}

function liveReload(done){  // BrowserSync live server - ip notebook:8080
    browserSync.init({
        server: {
            baseDir: path.build.root
        },
        port: 8080
    })
    done()
}

function moveOtherImg () {
    return gulp.src(path.dev.otherImg)
        .pipe(gulp.dest(path.build.img))
}

function moveOtherFonts () {
    return gulp.src(path.dev.otherFonts)
        .pipe(gulp.dest(path.build.ttf))
}
// скачивает google fonts

// let options = { };

function downloadGoogleFonts () {
    return gulp.src('./fonts.list')
        .pipe(googleWebFonts({
            fontsDir: '../fonts/googleFonts',
            cssDir: '../sass/includes',
            cssFilename: '_myGoogleFonts.scss',
        }))
        .pipe(gulp.dest('src/fonts/'))
}

function iconFont () {
    return gulp.src(path.dev.iconfont)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(iconfontCss({
            fontName: 'icons',
            path: 'src/sass/config/templates/_iconsTpl.scss',
            targetPath: '../../sass/includes/_icons.scss',
            fontPath: '../fonts/icons/'
        }))
            .pipe(iconfont({
                fontName: 'icons'
            }))
            .pipe(gulp.dest(`${path.dev.root}/fonts/icons`));
}


function moveHtml (){
   return gulp.src(path.dev.html) // возьми все html из src
   .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(fileinclude())
     .pipe(gulp.dest(path.build.root)) // положи в папку 'build'
     .pipe(browserSync.stream());
}
function movePhp (){
    return gulp.src(path.dev.php) // возьми все php из src
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
      .pipe(gulp.dest(path.build.root)) // положи в папку 'build'
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
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
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

function images (){
    return gulp.src(path.dev.img)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(webp())
    .pipe(gulp.dest(path.build.img))
}

function fonts2woff(){
    return gulp.src(path.dev.ttf)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.build.ttf))
}
function fonts2woff2(){
    return gulp.src(path.dev.ttf)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.ttf))
}

function watcher(done) { // следит за изменениями, колбэк вместо done может быть что угодно исп просто чтобы вернуть все вместо return 
    gulp.watch(path.dev.sass, styles) // следи за файлами если изменятся то запусти задачу styles
    gulp.watch(path.dev.allHtml, moveHtml) // следи за файлами html если изменятся то запусти задачу moveHtml
    gulp.watch(path.dev.php, movePhp) // следи за файлами php если изменятся то запусти задачу movePhp
    gulp.watch(path.dev.js, scripts)
    gulp.watch(path.dev.ttf, fonts2woff)
    gulp.watch(path.dev.img, images)
    gulp.watch(path.dev.otherImg,moveOtherImg)
    gulp.watch(path.dev.otherFonts,moveOtherFonts)

    done(); // возвр результат вместо return исп в том случае если функция ничего не возвращает иначе будет ошибка
}

//Обязательный экспорт задач необходим для запуска задач gulp

exports.moveHtml = moveHtml;
exports.movePhp = movePhp;
exports.styles = styles; // экспортируй функцию например для вызова из терминала
exports.watcher = watcher;
exports.scripts = scripts;
exports.images = images;
exports.fonts2woff = fonts2woff;
exports.fonts2woff2 = fonts2woff2;
exports.iconFont = iconFont;
exports.moveOtherImg = moveOtherImg;
exports.downloadGoogleFonts = downloadGoogleFonts;
exports.moveOtherFonts = moveOtherFonts;

exports.devHtml = gulp.series( //dev основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    clean,
    gulp.parallel( //dev запуск задач паралельный
        styles,
        moveHtml,
        scripts,
        fonts2woff,
        images,
        moveOtherImg,
        moveOtherFonts,
    ),
    liveReload,
    watcher
);

exports.buildHtml = gulp.series( //build final основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    clean,
    gulp.parallel( //build final запуск задач паралельный
        styles,
        moveHtml,
        scripts,
        fonts2woff,
        fonts2woff2,
        images,
        moveOtherImg,
        moveOtherFonts,
    ),
    
);

exports.devPhp = gulp.series( //dev основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    clean,
    gulp.parallel( //dev запуск задач паралельный
        styles,
        movePhp,
        scripts,
        fonts2woff,
        images,
        moveOtherImg,
        moveOtherFonts
    ),
    watcher
);

exports.buildPhp = gulp.series( //build final основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    clean,
    gulp.parallel( //build final запуск задач паралельный
        styles,
        movePhp,
        scripts,
        fonts2woff,
        fonts2woff2,
        images,
        moveOtherImg,
        moveOtherFonts
    )
);
