import { spawn } from "child_process";

const spawnOptions = {
  shell: true,
  stdio: "inherit",
  env: process.env,
};

const COMMAND_INDEX = 2;
const EXIT_CODE = 1;
const CHILD_PROCESS_EVENT = "exit";

const execCommand = () => {
  const command = process.argv[COMMAND_INDEX];

  if (!command) {
    process.exit(EXIT_CODE);
  }

  const childProcess = spawn(command, [], spawnOptions);

  childProcess.on(CHILD_PROCESS_EVENT, (code) => {
    process.exit(code);
  });
};

execCommand();
