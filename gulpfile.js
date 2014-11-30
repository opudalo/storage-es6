var gulp = require('gulp'),
  webserver = require('gulp-webserver'),
  to5 = require('gulp-6to5'),
  rename = require('gulp-rename')

gulp.task('default', ['es6', 'webserver', 'watch'])

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: 'http://localhost:8000/example/index.html'
    }))
})

gulp.task('watch', function() {
  gulp.watch('./**/*.es6.js', ['es6'])
})

gulp.task('es6', function () {
    return gulp.src('./**/*.es6.js')
        .pipe(to5({
          modules: 'ignore'
        }))
        .pipe(rename(function (path) {
          console.log(path)
          path.basename = path.basename.replace('.es6', '')
        }))
        .pipe(gulp.dest('.'))
});
