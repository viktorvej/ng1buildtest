var gulp = require('gulp');
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.css));
});

gulp.task('clean-styles', function() {
    var files = config.css + '**/*.css';
    clean(files);
});

gulp.task('less-watcher', function() {
    gulp.watch([config.less], ['styles']);
});

//////////

function clean(path) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}