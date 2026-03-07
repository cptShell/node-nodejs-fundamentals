import { parentPort } from "worker_threads";

const sortAsc = (a, b) => a - b;

parentPort.on("message", (data) => {
  const sorted = [...data].sort(sortAsc);
  parentPort.postMessage(sorted);
});
