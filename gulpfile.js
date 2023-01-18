import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import {deleteAsync as del} from 'del';
import gulp from 'gulp';
import less from 'gulp-less';
import squoosh from 'gulp-libsquoosh';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import csso from 'postcss-csso';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';

// Styles
export const styles = () => {
  return gulp.src('source/less/style.less', {
    sourcemaps: true
  }).pipe(plumber()).pipe(less()).pipe(postcss([
    autoprefixer(),
    csso()
  ])).pipe(rename('style.min.css')).pipe(gulp.dest('build/css', {
    sourcemaps: '.'
  })).pipe(browser.stream());
}
// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
//Html
const html = () => {
  return gulp.src('source/*.html').pipe(gulp.dest('build'));
}
//Scripts
const scripts = () => {
  return gulp.src('source/js/*.js').pipe(terser()).pipe(gulp.dest('build/js'));
}
//Images
const optimizeImages = () => {
return gulp.src('source/img/**/*.{jpg,png}').pipe(squoosh()).pipe(gulp.dest('build/img'));
}
const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}').pipe(gulp.dest('build/img'));
}
//WebP
const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}').pipe(squoosh({
    webp: {}
  })).pipe(gulp.dest('build/img'));
}
//SVG
const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/sprite/*.svg']).pipe(svgo()).pipe(gulp.dest('build/img'));
}
//Sprite
export const sprite = () => {
  return gulp.src('source/img/sprite/*.svg').pipe(svgo({
    plugins: [{
      removeViewBox: false,
    }]
  })).pipe(svgstore({
    inlineSvg: true
  })).pipe(rename('sprite.svg')).pipe(gulp.dest('build/img'));
}
//Clean
const clean = () => {
return del('build');
};
//Copy
const copy = (done) => {
  gulp.src(['source/fonts/*.{woff1,woff,woff2}', 'source/*.ico', 'source/*.webmanifest'], {
    base: 'source'
  }).pipe(gulp.dest('build'))
  done();
}
//Reload
const reload = () => {
  browser.reload();
  done();
}
// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less'), gulp.series(styles);
  gulp.watch('source/js/script.js'), gulp.series(scripts);
  gulp.watch('source/*.html', gulp.series(html, reload));
}
//Build
export const build = gulp.series(clean, copy, optimizeImages, gulp.parallel(html, styles, scripts, svg, sprite, createWebp), )
//Default
export default gulp.series(clean, copy, copyImages, gulp.parallel(html, styles, scripts, svg, sprite, createWebp), gulp.series(server, watcher))
