import fs from "fs";
import path from "path";
import readline from "readline";

const LINES_ARG = "--lines";
const DEFAULT_LINES = 10;
const SOURCE_FILE = "source.txt";
const CHUNK_PREFIX = "chunk_";
const CHUNK_EXT = ".txt";
const LINE_SEP = "\n";

const getLinesPerChunk = () => {
  const args = process.argv.slice(2);
  const idx = args.indexOf(LINES_ARG);
  if (idx !== -1 && args[idx + 1] != null) {
    const n = Number(args[idx + 1]);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_LINES;
  }
  return DEFAULT_LINES;
};

const split = async () => {
  const rootPath = process.cwd();
  const sourcePath = path.join(rootPath, SOURCE_FILE);
  const linesPerChunk = getLinesPerChunk();

  const readStream = fs.createReadStream(sourcePath);
  const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

  let chunkIndex = 0;
  let currentLines = [];

  const flushChunk = async () => {
    if (currentLines.length === 0) return;
    chunkIndex += 1;
    const chunkFileName = `${CHUNK_PREFIX}${chunkIndex}${CHUNK_EXT}`;
    const chunkPath = path.join(rootPath, chunkFileName);
    const content = currentLines.join(LINE_SEP) + LINE_SEP;

    await fs.promises.writeFile(chunkPath, content);

    currentLines = [];
  };

  for await (const line of rl) {
    currentLines.push(line);
    if (currentLines.length >= linesPerChunk) {
      await flushChunk();
    }
  }

  await flushChunk();
};

await split();
