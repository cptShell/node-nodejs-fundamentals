
const ARGS = {
  DURATION: "--duration",
  INTERVAL: "--interval",
  LENGTH: "--length",
  COLOR: "--color",
}

const COLOR_RESET = "\x1b[0m";

const getOption = (name, defaultValue) => {
  const args = process.argv;
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return defaultValue;
};

const isValidHexColor = (value) => {
  if (typeof value !== "string") return false;
  if (!value.startsWith("#") || value.length !== 7) return false;
  return /^[0-9a-fA-F]{6}$/.test(value.slice(1));
};

const getColorPrefix = (color) => {
  if (!color || !isValidHexColor(color)) return "";
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
};

const progress = () => {
  const duration = +getOption(ARGS.DURATION, 5000);
  const interval = +getOption(ARGS.INTERVAL, 100);
  const length = +getOption(ARGS.LENGTH, 30);
  const color = getOption(ARGS.COLOR, "");

  const colorPrefix = getColorPrefix(color);

  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += interval;

    const progress = Math.min(elapsed / duration, 1);
    const percent = Math.round(progress * 100);
    const filledLength = Math.floor(progress * length);
    const filledRaw = "█".repeat(filledLength);
    const emptyRaw = " ".repeat(length - filledLength);

    const filled = colorPrefix && filledRaw.length > 0
      ? `${colorPrefix}${filledRaw}${COLOR_RESET}`
      : filledRaw;

    const bar = `[${filled}${emptyRaw}] ${percent}%`;

    process.stdout.write(`\r${bar}`);

    if (progress >= 1) {
      clearInterval(timer);
      console.log("\nDone!");
    }
  }, interval);
};

progress();
