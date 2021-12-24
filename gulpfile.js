//Секция подключения плагинов

const gulp = require('gulp'); // подкл сам gulp
const sass = require('gulp-sass')(require('node-sass')); // подкл sass
const cleanCSS = require('gulp-clean-css'); // сжимает и оптимизирует css
const rename = require('gulp-rename');  // переименовывает
const plumber = require('gulp-plumber'); // отлавливает ошибки
const notify = require('gulp-notify'); // украшает ошибки
const uglify = require('gulp-uglify'); // сжимает js
const browserSync = require('browser-sync').create(); // live для всех устройств
const webp = require('gulp-webp'); // img в webp
const ttf2woff = require('gulp-ttf2woff'); // ttf шрифт в woff
const ttf2woff2 = require('gulp-ttf2woff2'); // ttf шрифт в woff2
const del = require('del'); // удаляет файлы или папки
const fileinclude = require('gulp-file-include'); // подключает html компоненты
const iconfont = require('gulp-iconfont'); // Создает иконочный шрифт
const iconfontCss = require('gulp-iconfont-css'); // создает стили к иконочному шрифту
const googleWebFonts = require('gulp-google-webfonts');
//для конвертации ES6
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

// define entry for browserify
const jsSrc = 'main.js';
const jsFolder = 'src/js/';
// we can add a script for front-end and script for back-end and so on
const jsFiles = [jsSrc];
let production = false;

function onProductionMode(done) {
    production = true;
    done();
}
function offProductionMode(done) {
    production = false;
    done();
}
//Для облегчения работы пути храним в объекте

const path = {
    dev: {
        root: 'src',
        html: ['src/**/*.html', '!src/components/**/*.html'],
        allHtml: 'src/**/*.html',
        php: ['src/**/*.php', '!src/components/**/*.{php,html}', '!src/vendor/**/*.*'],
        sass: 'src/sass/**/*.{sass,scss}',
        js: 'src/js/main.js',
        img: 'src/img/**/*.{jpg,png,jpeg,Jpg,Png,Jpeg,JPG,PNG,JPEG,tiff,webp}',
        otherImg: ['src/img/**/*.*', '!src/img/**/*.{jpg,png,jpeg,Jpg,Png,Jpeg,JPG,PNG,JPEG,tiff,webp,db}'],
        fonts: 'src/fonts/**/*.*',
        ttf: ['src/fonts/**/*.ttf', '!src/fonts/icomoon/**/*.*'],
        otherFonts: ['src/fonts/**/*.{woff,woff2}', '!src/fonts/icomoon/**/*.*'],
        iconfont: 'src/fonts/generateIcon(dontREMOVE)/**/*.svg',
        composer: ['src/composer.{json,lock}'],
        vendor: 'src/vendor/**/*.*',
        icomoon: 'src/fonts/icomoon/**/*.*'
    },
    build: {
        root: 'build',
        css: 'build/css',
        js: 'build/js',
        img: 'build/img',
        ttf: 'build/fonts',
        vendor: 'build/vendor',
        icomoon: 'build/fonts/icomoon'
    }
}

// Секция создания таск или задач gulp(каждая функция эта задача gulp)

async function clean() {
    return await del.sync(path.build.root);
}

function moveComposer() {
    return gulp.src(path.dev.composer)
        .pipe(gulp.dest(path.build.root))
}
function moveVendor() {
    return gulp.src(path.dev.vendor)
        .pipe(gulp.dest(path.build.vendor))
}

function moveIcomoon() {
    return gulp.src(path.dev.icomoon)
        .pipe(gulp.dest(path.build.icomoon))
}

function liveReload(done) {  // BrowserSync live server - ip notebook:8080
    browserSync.init({
        server: {
            baseDir: path.build.root
        },
        port: 8080
    })
    done()
}

function moveOtherImg() {
    return gulp.src(path.dev.otherImg)
        .pipe(gulp.dest(path.build.img))
}

function moveOtherFonts() {
    return gulp.src(path.dev.otherFonts)
        .pipe(gulp.dest(path.build.ttf))
}
// скачивает google fonts

function downloadGoogleFonts() {
    return gulp.src('./fonts.list')
        .pipe(googleWebFonts({
            fontsDir: '../fonts/googleFonts',
            cssDir: '../sass/includes',
            cssFilename: '_myGoogleFonts.scss',
            format: 'ttf'
        }))
        .pipe(gulp.dest('src/fonts/'))
}

function iconFont() {
    return gulp.src(path.dev.iconfont)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
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


function moveHtml() {
    return gulp.src(path.dev.html) // возьми все html из src
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(fileinclude())
        .pipe(gulp.dest(path.build.root)) // положи в папку 'build'
        .pipe(browserSync.stream());
}
function movePhp() {
    return gulp.src(path.dev.php) // возьми все php из src
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(gulp.dest(path.build.root)) // положи в папку 'build'
}



function styles() {
    return gulp.src(path.dev.sass)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })) // возвращает и уведомляет при ошибках можно исп в любом месте
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

async function scripts() {
    jsFiles.map(function (entry) {
        return (
            browserify({
                entries: [jsFolder + entry],
            })
                .transform(babelify, { presets: ['@babel/preset-env'] })
                .bundle() // соединяет в бандл
                .pipe(source('main.js'))
                // To load existing source maps
                // This will cause sourceMaps to use the previous sourcemap to create an ultimate sourcemap
                .pipe(gulpif(production, rename({ extname: '.min.js' })))
                .pipe(buffer())
                .pipe(gulpif(!production, sourcemaps.init({ loadMaps: true })))
                .pipe(gulpif(production, uglify()))
                .pipe(gulpif(!production, sourcemaps.write('./')))
                .pipe(gulp.dest(path.build.js))
                .pipe(browserSync.stream())
        );
    });
}

function images() {
    return gulp.src(path.dev.img)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(webp())
        .pipe(gulp.dest(path.build.img))
}

function fonts2woff() {
    return gulp.src(path.dev.ttf)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.build.ttf))
}
function fonts2woff2() {
    return gulp.src(path.dev.ttf)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
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
    gulp.watch(path.dev.otherImg, moveOtherImg)
    gulp.watch(path.dev.otherFonts, moveOtherFonts)
    gulp.watch(path.dev.composer, moveComposer)
    gulp.watch(path.dev.vendor, moveVendor),
        gulp.watch(path.dev.icomoon, moveIcomoon)

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
exports.moveComposer = moveComposer;
exports.moveVendor = moveVendor;
exports.moveIcomoon = moveIcomoon;
exports.onProductionMode = onProductionMode;
exports.offProductionMode = offProductionMode;

exports.devHtml = gulp.series( //dev основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    offProductionMode,
    clean,
    gulp.parallel( //dev запуск задач паралельный
        styles,
        moveHtml,
        scripts,
        fonts2woff,
        images,
        moveOtherImg,
        moveOtherFonts,
        moveIcomoon
    ),
    liveReload,
    watcher
);

exports.buildHtml = gulp.series( //build final основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    onProductionMode,
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
        moveIcomoon
    ),

);

exports.devPhp = gulp.series( //dev основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    offProductionMode,
    clean,
    gulp.parallel( //dev запуск задач паралельный
        styles,
        movePhp,
        scripts,
        fonts2woff,
        images,
        moveOtherImg,
        moveOtherFonts,
        moveComposer,
        moveVendor,
        moveIcomoon
    ),
    watcher
);

exports.buildPhp = gulp.series( //build final основной экспорт создает запуск всех задач одной командой (gulp) запуск задач последовательный
    onProductionMode,
    clean,
    gulp.parallel( //build final запуск задач паралельный
        styles,
        movePhp,
        scripts,
        fonts2woff,
        fonts2woff2,
        images,
        moveOtherImg,
        moveOtherFonts,
        moveVendor,
        moveComposer,
        moveIcomoon
    )
);
