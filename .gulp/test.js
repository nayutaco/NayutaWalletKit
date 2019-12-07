module.exports = function (gulp, plugins) {
    
    gulp.task('test:jasmine', gulp.series(gulp.parallel('ensure:android'), function (done) { 
        console.log("doing test");
        done();
    }));

    gulp.task('test:jasmineios', gulp.series(gulp.parallel('ensure:ios'), function (done) { 
        console.log("doing test");
        done();
    }));
 
};
