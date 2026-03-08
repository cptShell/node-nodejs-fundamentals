import { Transform } from "stream";
import { pipeline } from "stream/promises";

const PATTERN_ARG = "--pattern";
const LINE_SEP = "\n";

const getPattern = () => {
  const args = process.argv.slice(2);
  const idx = args.indexOf(PATTERN_ARG);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return "";
};

const filter = () => {
  const pattern = getPattern();

  const transform = new Transform({
    transform(chunk, _, callback) {
      this.buffer = (this.buffer || "") + chunk.toString();
      const lines = this.buffer.split(LINE_SEP);
      this.buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (pattern && line.includes(pattern)) {
          this.push(line + LINE_SEP);
        }
      }
      callback();
    },
    flush(callback) {
      const hasRemainder = (this.buffer ?? "") !== "";
      const matchesPattern = pattern && this.buffer.includes(pattern);
      if (hasRemainder && matchesPattern) {
        this.push(this.buffer + LINE_SEP);
      }
      callback();
    },
  });

  pipeline(process.stdin, transform, process.stdout).catch(() => {});
};

filter();
