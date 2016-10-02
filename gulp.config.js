module.exports = function() {
    var assetsDir = './src/assets/';
    var appDir = './src/app/';
    var serverDir = './server/';
    var cssDir = assetsDir + 'css/';

    var config = {
        /**
         * File paths
         */
        
        //the app folder
        appDir: appDir,

        //the folder to put the compiled css
        cssDir: cssDir,

        //the css file
        css: cssDir + 'styles.css',

        //the less file to compile
        less: assetsDir + 'styles/styles.less',

        //the dev index html-file
        index: 'index.html',
        
        //all the app js-files
        js: [
            appDir + '**/*.module.js',
            appDir + '**/*.js',
            '!' + appDir + '**/*.spec.js'
        ],
        serverDir: serverDir,

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/'
        },

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