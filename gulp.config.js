module.exports = function() {
    var assets = './src/assets/';
    var app = './src/app/'
    var cssDir = assets + 'css/';

    var config = {
        /**
         * File paths
         */

        //the folder to put the compiled css
        cssDir: cssDir,

        //the css file
        css: cssDir + 'styles.css',

        //the less file to compile
        less: assets + 'styles/styles.less',

        //the dev index html-file
        index: 'index.html',
        
        //all the app js-files
        js: [
            app + '**/*.module.js',
            app + '**/*.js',
            '!' + app + '**/*.spec.js'
        ],

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/'
        }
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