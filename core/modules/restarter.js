import { spawn } from "child_process";

export async function restart() {
  const args = process.argv.slice(1); 
  const cmd = process.argv[0]; 

  const child = spawn(cmd, args, {
    stdio: "inherit" 
  });

  child.on("close", (code) => {
    process.exit(code);
  });

  process.exit();
}