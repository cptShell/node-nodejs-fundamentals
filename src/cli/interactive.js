import readline from "readline";

const COMMANDS = {
  UPTIME: "uptime",
  CWD: "cwd",
  DATE: "date",
  EXIT: "exit",
};

const stertTimestamp = new Date().getMilliseconds();

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(">", (answer) => {
    if (answer === COMMANDS.UPTIME) {
      console.log(`Uptime: ${new Date().getMilliseconds() - stertTimestamp}ms`);
    } else if (answer === COMMANDS.CWD) {
      console.log(`CWD: ${process.cwd()}`);
    } else if (answer === COMMANDS.DATE) {
      console.log(`Date: ${new Date().toISOString()}`);
    } else if (answer === COMMANDS.EXIT) {
      rl.close();
    } else {
      console.log("Unknown command");
    }
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
};

interactive();
