var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    miniCSS = require('gulp-minify-css'),
    htmlclean = require('gulp-htmlclean'),
    react = require('gulp-react'),
    useref = require('gulp-useref');

var lr = require('tiny-lr')();

var ENV_LOCATIONS = {
    prod: '/dist/',
    dev: '/src/'
}

function startLivereload() {
    lr.listen(35729);
}

function notifyLivereload(event) {
    var fileName = require('path').relative(__dirname + '/dist/', event.path);

    lr.changed({
        body: {
          files: [fileName]
        }
    });
}

function startServer(env) {
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')());
    app.use(express.static(__dirname + ENV_LOCATIONS[env]));
    app.listen(9000);
}

gulp.task('react', function() {
    return gulp.src('src/jsx/*.js')
            .pipe(react())
            .pipe(gulp.dest('src/js/'));
});


gulp.task('watchdev', function() {
    gulp.watch('src/jsx/*.js', ['react']);
    gulp.watch('src/css/*.css', notifyLivereload);
    gulp.watch('src/js/*.js', notifyLivereload);
    gulp.watch('src/js/*.html', notifyLivereload);

});


/* STUFF FOR PROD LATER */
gulp.task('lint', function() {
    return gulp.src('src/js/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
    return gulp.src('src/js/*.js')
            .pipe(concat('all.js'))
            .pipe(gulp.dest('dist/js'))
            .pipe(rename('all.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'))
});

gulp.task('jslibs', function() {
    return gulp.src('src/js/libs/*.js')
            .pipe(concat('libs.js'))
            .pipe(gulp.dest('dist/js'))
            .pipe(rename('libs.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'))
});

gulp.task('styles', function(){
    return gulp.src('src/css/*.css')
            .pipe(miniCSS({keepBreaks: true}))
            .pipe(gulp.dest('dist/css'))
});


gulp.task('html', function() {
    return gulp.src('src/*.html')
            .pipe(useref())
            .pipe(htmlclean())
            .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/js/*.js', ['lint', 'scripts'])
    gulp.watch('src/css/*.css', ['styles'])
    gulp.watch('src/*.html', ['html'])
    gulp.watch('dist/css/*.css', notifyLivereload);
    gulp.watch('dist/js/*.js', notifyLivereload);
    gulp.watch('dist/js/*.html', notifyLivereload);

});


gulp.task('default', ['react', 'watchdev'], function() {
    startServer('dev');
    startLivereload();
});

gulp.task('dev', ['react', 'watchdev'], function() {
    startServer('dev');
    startLivereload();
});


// I don't recommend this yet :)
gulp.task('prod', ['react', 'lint', 'scripts', 'styles', 'html', 'watch'], function() {
    startServer('prod');
    startLivereload();
});
