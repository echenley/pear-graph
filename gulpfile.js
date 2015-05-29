'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gutil = require('gulp-util');
var webserver = require('gulp-webserver');
var notify = require('gulp-notify');
var size = require('gulp-size');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var exit = require('gulp-exit');
var plumber = require('gulp-plumber');

var svgmin = require('gulp-svgmin');

var srcDir = './src';
var buildDir = './build';
var distDir = './dist';

var jsEntry = 'Chartreuse';
var sassEntry = 'src/scss/*.scss';

function handleError() {
    gutil.beep();
    notify.onError({
        title: 'Compile Error',
        message: '<%= error.message %>'
    }).apply(this, arguments);
    this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file) {
    var props = watchify.args;
    props.entries = [srcDir + '/jsx/' + file];
    props.debug = true;

    var bundler = watchify(browserify(props), { ignoreWatch: true })
        .transform(babelify.configure({
            only: /(src\/jsx)/
        }));

    function rebundle() {
        gutil.log('Rebundle...');
        var start = Date.now();
        return bundler.bundle()
            .on('error', handleError)
            .pipe(source(jsEntry.toLowerCase() + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(buildDir))
            .pipe(notify(function() {
                console.log('Rebundle Complete [' + (Date.now() - start) + 'ms]');
            }));
    }

    bundler.on('update', rebundle);
    return rebundle();
}

gulp.task('styles', function() {
    return gulp.src(sassEntry)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            // compression handled in dist task
            style: 'expanded'
        }))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(buildDir))
        .pipe(size());
});

gulp.task('svg', function() {
    return gulp.src(srcDir + '/svg/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(buildDir +'/svg'));
});

gulp.task('html', function() {
    return gulp.src(srcDir + '/*.html')
        .pipe(gulp.dest(buildDir))
        .pipe(size());
});

gulp.task('serve', function() {
    return gulp.src(buildDir)
        .pipe(webserver({
            livereload: true,
            host: '0.0.0.0',
            port: 9000,
            // open: true,
            fallback: 'index.html'
        }));
});

gulp.task('build', ['html', 'styles', 'svg'], function() {
    return buildScript(jsEntry + '.jsx');
});

gulp.task('dist', ['build'], function() {
    var assets = useref.assets();

    // move svgs to /dist
    gulp.src(buildDir + '/svg/*.svg')
        .pipe(gulp.dest(distDir +'/svg'));

    return gulp.src('build/*.html')
        .pipe(plumber())
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifycss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(distDir))
        .pipe(exit());
});

gulp.task('default', ['build', 'serve'], function() {
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/svg/*.svg', ['svg']);
    gulp.watch('src/scss/**/*.scss', ['styles']);
});
