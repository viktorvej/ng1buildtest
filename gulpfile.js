var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var port = process.env.PORT || config.defaultPort;

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.cssDir));
});

gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts');

    return gulp.src(config.fonts)
        .pipe(gulp.dest(config.buildAssetsDir + 'fonts'));
});

gulp.task('images', ['clean-images'], function() {
    log('Copying images');

    return gulp.src(config.images)
        .pipe(gulp.dest(config.buildAssetsDir + 'images'));
});

gulp.task('clean', function() {
    var delconfig = [].concat(config.buildDir, config.cssDir, config.tempDir);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig);
});

gulp.task('clean-fonts', function() {
    clean(config.buildAssetsDir + 'fonts/**/*.*');
});

gulp.task('clean-images', function() {
    clean(config.buildAssetsDir + 'images/**/*.*');
});

gulp.task('clean-styles', function() {
    clean(config.cssDir + '**/*.css');
});

gulp.task('clean-code', function() {
    var files = [].concat(
        config.tempDir + '**/*.js',
        config.buildDir + '**/*.html',
        config.buildDir + '**/*.js'
    );
    clean(files);
});

gulp.task('less-watcher', function() {
    gulp.watch([config.less], ['styles']);
});

gulp.task('templatecache', ['clean-code'], function() {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
            ))
        .pipe(gulp.dest(config.tempDir));
});

gulp.task('wiredep', function() {
    log('Wire up the app css into the html, and call wiredep');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.root));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
    log('Injecting stuff to the index.html');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(''));

});

gulp.task('optimize', ['inject', 'fonts', 'images'], function() {
    log('Optimizing the javascript, css, html');

    var templateCache = config.tempDir + config.templateCache.file;

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- inject:templates:js -->'
        }))
        .pipe($.useref({ searchPath: './'}))
        .pipe($.if(config.optimized.css, $.csso()))
        .pipe($.if(config.optimized.jsLib, $.uglify()))
        .pipe($.if(config.optimized.jsApp, $.ngAnnotate({add: true})))
        .pipe($.if(config.optimized.jsApp, $.uglify()))
        .pipe($.if(config.optimized.all, $.rev()))
        .pipe($.revReplace())
        .pipe(gulp.dest(config.buildDir))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.buildDir));
});

/**
 * Bump the version
 * --type=pre will bump the prerelease version *.*.*-x
 * --type=patch or no flag will bump the patch version *.*.x
 * --type=minor will bump the minor version *.x.*
 * --type=major will bump the major version x.*.*
 * --version=1.2.3 will bump to a specific version and ignore other flags
 */
gulp.task('bump', function() {
    var msg = 'Bumping versions';
    var type = args.type;
    var version = args.version;
    var options = {};

    if (version) {
        options.version = version;
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += ' for a ' + type;
    }
    log(msg);
    return gulp
        .src(config.packages)
        .pipe($.bump(options))
        .pipe(gulp.dest(config.root));
});

//node server
gulp.task('serve-build', ['optimize'], function() {
    serve(false /* isDev */);
});

gulp.task('serve-dev', ['inject'], function() {
    serve(true /* isDev */);
})

//////////

function serve(isDev) {

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.serverDir]
    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('*** nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function() {
            log('*** nodemon exited cleanly');
        });
}

function changeEvent(event) {
    log('File ' + event.path + ' ' + event.type);
}

function startBrowserSync(isDev) {
    if (browserSync.active) {
        log('BrowserSync already active');
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch([config.less], ['styles'])
            .on('change', function(ev) { changeEvent(ev); });
    } else {
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', function(ev) { changeEvent(ev); });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.appDir + '**/*.*',
            '!' + config.less,
            config.cssDir + '**/*.css',
            config.index
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0
    };

    browserSync(options);
}

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