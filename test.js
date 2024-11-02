const sass = require('sass');
const parseMarkdownFile = require('./src/readMarkdownTemplateFile');

async function main() {
  // expanded vs compressed
  // const result = sass.compile("style.scss", { style: "compressed" });
  // console.log(result.css);

  const t = await parseMarkdownFile('_posts/2023-10-27-postgres-interactive-restore.md');
  console.log(t);
}

main();



// const { Writable } = require("node:stream");

// class TestStream extends Writable {
//   constructor() {
//     super({ objectMode: true });

//     // this.fd = null;
//     // this.chunks = [];
//     // this.chunkSize = 0;
//     // this.writesCount = 0;
//   }

//   _write(chunk, encoding, callback) {
//     console.log("_write", chunk);
//   }

//   // // this will run after the our stream has finished
//   // _final(callback) {
//   //   console.log("_final", chunk);
//   // }

//   // // this method is called when we are done with the final method
//   // _destroy(error, callback) {
//   //   console.log("Write Count:", this.writesCount);
//   // }
// }

// async function processLayouts() {
//   return src(path.resolve(LAYOUTS_DIR, "*.html"), { read: false })
//     .pipe(new TestStream());
// }