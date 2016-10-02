module.exports = function() {
    var assets = './src/assets/';

    var config = {
        //the folder to put the compiled css
        css: assets + 'css/',

        //the less file to compile
        less: assets + 'styles/styles.less'
    };

    return config;
};