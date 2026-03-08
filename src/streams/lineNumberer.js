import { Transform } from "stream";
import { pipeline } from "stream/promises";

const LINE_SEP = "\n";
const FORMAT = " | ";

const lineNumberer = () => {
  const transform = new Transform({
    transform(chunk, _, callback) {
      this.buffer = (this.buffer || "") + chunk.toString();

      const lines = this.buffer.split(LINE_SEP);

      this.buffer = lines.pop() ?? "";
      this.lineNum = this.lineNum ?? 1;

      lines.forEach((line) => {
        this.push(`${this.lineNum}${FORMAT}${line}${LINE_SEP}`);
        this.lineNum += 1;
      });

      callback();
    },
    flush(callback) {
      if (this.buffer !== undefined && this.buffer !== "") {
        this.lineNum = this.lineNum ?? 1;
        this.push(`${this.lineNum}${FORMAT}${this.buffer}${LINE_SEP}`);
      }
      callback();
    },
  });

  pipeline(process.stdin, transform, process.stdout).catch(() => {});
};

lineNumberer();
