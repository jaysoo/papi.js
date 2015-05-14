module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['browserify', 'mocha'],

    files: [ 'test/**/*.js' ],
    exclude: [ ],

    preprocessors: {
      'test/**/*.js': ['browserify']
    },

    browserify: {
      debug: true,
      transform: [ 'babelify' ]
    }
  });
};