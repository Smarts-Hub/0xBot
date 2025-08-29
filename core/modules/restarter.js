import { spawn } from "child_process";

export async function restart() {
  const args = process.argv.slice(1); // todos los argumentos excepto "node"
  const cmd = process.argv[0]; // normalmente "node"

  // Lanzamos el mismo script
  const child = spawn(cmd, args, {
    stdio: "inherit" // hereda la consola
  });

  // Terminamos el proceso actual
  child.on("close", (code) => {
    process.exit(code);
  });

  process.exit();
}