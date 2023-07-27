import ProgressBar from 'progress';

console.log('\x1b[33m%s\x1b[0m', 'hi!');

// const bar = new ProgressBar('downloading [:bar] :rate/bps :percent :etas', { total: 10 });
// const timer = setInterval(() => {
//   bar.tick();
//   if (bar.complete) {
//     clearInterval(timer);
//   }
// }, 100);

// var bar = new ProgressBar(':current: :token1 :token2', { total: 3 })
// bar.tick({
//   'token1': "Hello",
//   'token2': "World!\n"
// })
// bar.tick(2, {
//   'token1': "Goodbye",
//   'token2': "World!"
// })


// var bar = new ProgressBar(':bar :current/:total', { total: 10 });
// var timer = setInterval(function () {
//     bar.tick();
//     if (bar.complete) {
//         clearInterval(timer);
//     } else if (bar.curr === 5) {
//         bar.interrupt('this message appears above the progress bar\ncurrent progress is ' + bar.curr + '/' + bar.total);
//     }
// }, 1000);

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`)
})

if (process.argv[2])
{
    console.log(process.argv[2]);
}
