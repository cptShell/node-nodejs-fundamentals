import readline from "readline";

const CLOSE_EVENT = "close";
const SIGINT_EVENT = "SIGINT";
const EXIT_CODE = 0;
const GOODBYE_MESSAGE = "Goodbye!";
const PROMPT = "> ";

const COMMANDS = {
  UPTIME: "uptime",
  CWD: "cwd",
  DATE: "date",
  EXIT: "exit",
};

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question(PROMPT, (answer) => {
      const cmd = answer.trim();

      if (cmd === COMMANDS.EXIT) {
        rl.close();
        return;
      }

      switch (cmd) {
        case COMMANDS.UPTIME:
          console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
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

  };

  ask();

  rl.on(CLOSE_EVENT, () => {
    console.log(GOODBYE_MESSAGE);
    process.exit(EXIT_CODE);
  });

  process.on(SIGINT_EVENT, () => {
    console.log(GOODBYE_MESSAGE);
    process.exit(EXIT_CODE);
  });
};

interactive();
