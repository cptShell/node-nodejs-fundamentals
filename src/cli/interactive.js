import readline from "readline";

const EXIT_CODE = 0;
const GOODBYE_MESSAGE = "Goodbye!";
const PROMPT = "> ";

const COMMANDS = {
  UPTIME: "uptime",
  CWD: "cwd",
  DATE: "date",
  EXIT: "exit",
};

const msToUptime = (ms) => {
  return (ms / 1000).toFixed(2) + "s";
};

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const startTimestamp = Date.now();

  const ask = () => {
    rl.question(PROMPT, (answer) => {
      if (answer === COMMANDS.EXIT) {
        rl.close();
        return;
      }

      switch (answer) {
        case COMMANDS.UPTIME:
          const uptime = Date.now() - startTimestamp;
          console.log(`Uptime: ${msToUptime(uptime)}`);
          break;
        case COMMANDS.CWD:
          console.log(`CWD: ${process.cwd()}`);
          break;
        case COMMANDS.DATE:
          console.log(`Date: ${new Date().toISOString()}`);
          break;
        default:
          console.log("Unknown command");
      }

      ask();
    });

    rl.on("close", () => {
      console.log(GOODBYE_MESSAGE);
      process.exit(EXIT_CODE);
    });
  };

  ask();
};

interactive();
