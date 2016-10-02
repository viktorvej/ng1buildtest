module.exports = function() {
    var assetsDir = './src/assets/';
    var appDir = './src/app/';
    var serverDir = './server/';
    var cssDir = assetsDir + 'css/';
    var buildDir = './build/';
    var tempDir = './.tmp/';
    var root = './';

    var config = {
        /**
         * File paths
         */
        
        appDir: appDir,
        buildDir: buildDir,
        buildAssetsDir: buildDir + 'src/assets/',
        //the folder to put the compiled css
        cssDir: cssDir,
        css: cssDir + 'styles.css',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        html: appDir + '**/*.html',
        htmltemplates: appDir + '**/*.html',
        images: assetsDir + 'images/**/*.*',
        index: 'index.html',
        //all the app js-files
        js: [
            appDir + '**/*.module.js',
            appDir + '**/*.js',
            '!' + appDir + '**/*.spec.js'
        ],
        less: assetsDir + 'styles/styles.less',
        root: root,
        serverDir: serverDir,
        tempDir: tempDir,

        /**
         * optimized files
         */
        optimized: {
            css: 'src/assets/css/*.css',
            jsLib: 'src/assets/js/*.js',
            jsApp: 'src/app/*.js',
            all: '!index.html'
        },

        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'src/app/'
            }
        },

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/'
        },
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * Node settings
         */
        defaultPort: 7203,
        nodeServer: serverDir + 'app.js',

        /**
         * browser sync
         */

        browserReloadDelay: 1000,
    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    return config;
};