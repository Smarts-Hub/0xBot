#!/usr/bin/env python3
"""
obfuscate-module.py - custom module obfuscator
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

JS_EXTS = {".js", ".mjs", ".cjs"}
DEFAULT_SRC_ROOT = Path("modules")
DEFAULT_OUT_ROOT = Path("dist-obf-bundle")


def find_executable(name):
    from shutil import which

    return which(name)


def run_cmd_capture(cmd):
    proc = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    out, err = proc.communicate()
    return proc.returncode, out or "", err or ""


def obfuscate_file_with_candidates(
    js_obfuscator_cmd, src_path: Path, dest_path: Path, candidates
):
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    last_err = None
    for flags in candidates:
        cmd = [js_obfuscator_cmd, str(src_path), "--output", str(dest_path)] + flags
        rc, out, err = run_cmd_capture(cmd)
        # Success
        if rc == 0:
            return "ok", " ".join(flags)
        combined = (out + "\n" + err).lower()
        if (
            "error at line" in combined
            or "unexpected token" in combined
            or "error in file" in combined
        ):
            last_err = f"parse_error: rc={rc} stdout={out.strip()} stderr={err.strip()}"
            return "parse_error", last_err
        last_err = f"rc={rc} stdout={out.strip()} stderr={err.strip()}"

    return "fail", last_err


def copy_file(src_path: Path, dest_path: Path):
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(str(src_path), str(dest_path))


def should_exclude(path: Path, exclude_names):
    if path.name in exclude_names:
        return True
    for ex in exclude_names:
        if str(path).endswith(ex):
            return True
    return False


def process_module(
    module_name: str,
    src_root: Path,
    out_root: Path,
    js_obfuscator_cmd: str,
    exclude_names,
    user_obf_args,
):
    src_dir = src_root / module_name
    if not src_dir.exists() or not src_dir.is_dir():
        print(f"[ERROR] El módulo fuente no existe: {src_dir}", file=sys.stderr)
        return False

    dest_dir = out_root / module_name
    if dest_dir.exists():
        print(f"[INFO] Eliminando destino existente: {dest_dir}")
        shutil.rmtree(dest_dir)

    print(f"[INFO] Procesando módulo '{module_name}' desde {src_dir} -> {dest_dir}")

    total = 0
    obf_count = 0
    copy_count = 0
    fallback_copy_count = 0
    errors = []

    # flags (aggressive -> conservative)
    base_candidates = [
        # vA— "aggresive"
        [
            "--compact",
            "true",
            "--self-defending",
            "false",  # self-defending suele romper stacks / identidad
            "--disable-console-output",
            "false",  # mantener logs para depurar si algo falla
            "--string-array",
            "true",
            "--string-array-encoding",
            "base64",  # menos "pesado"/latente que rc4
            "--string-array-threshold",
            "0.25",  # pocos strings a arreglo (evitar eventos)
            "--string-array-wrappers-count",
            "1",
            "--string-array-wrappers-chained-calls",
            "false",
            "--split-strings",
            "false",  # split-strings rompe literales como 'ready'
            "--control-flow-flattening",
            "false",  # CF flattening altera orden/timing
            "--dead-code-injection",
            "false",  # dead code puede ralentizar/desordenar
            "--identifier-names-generator",
            "mangled",  # mangled es suficiente, evita hexadecimal extremo
            "--seed",
            "2025",
            # Reservar nombres críticos para que no sean renombrados (regex)
            "--reserved-names",
            "Client|login|on|once|emit|ready|module|exports|require|EventEmitter|messageCreate|interactionCreate",
            # Asegurar que strings críticas no se metan en string-array
            "--reserved-strings",
            "ready|messageCreate|interactionCreate|guild|channel|message",
        ],
        # vB - "moderated"
        [
            "--compact",
            "true",
            "--self-defending",
            "false",
            "--disable-console-output",
            "false",
            "--string-array",
            "true",
            "--string-array-encoding",
            "base64",
            "--string-array-threshold",
            "0.15",
            "--string-array-wrappers-count",
            "1",
            "--string-array-wrappers-chained-calls",
            "false",
            "--split-strings",
            "false",
            "--control-flow-flattening",
            "false",
            "--dead-code-injection",
            "false",
            "--identifier-names-generator",
            "mangled",
            "--seed",
            "1337",
            "--reserved-names",
            "Client|login|on|once|emit|ready|module|exports|require|EventEmitter|messageCreate|interactionCreate",
            "--reserved-strings",
            "ready|messageCreate|interactionCreate|guild|channel|message",
        ],
        # vC conservative / safe
        [
            "--compact",
            "true",
            "--self-defending",
            "false",
            "--disable-console-output",
            "false",
            "--string-array",
            "false",  # evitar string arrays por completo
            "--split-strings",
            "false",
            "--control-flow-flattening",
            "false",
            "--dead-code-injection",
            "false",
            "--identifier-names-generator",
            "mangled",
            "--seed",
            "42",
            "--reserved-names",
            "Client|login|on|once|emit|ready|module|exports|require|EventEmitter|messageCreate|interactionCreate",
            "--reserved-strings",
            "ready|messageCreate|interactionCreate|guild|channel|message",
        ],
    ]

    user_args_flat = []
    for a in user_obf_args:
        user_args_flat += a.split()

    candidates = [c + user_args_flat for c in base_candidates]

    for src_path in src_dir.rglob("*"):
        if src_path.is_dir():
            continue
        rel = src_path.relative_to(src_dir)
        dest_path = dest_dir / rel

        if should_exclude(src_path, exclude_names):
            try:
                copy_file(src_path, dest_path)
                copy_count += 1
                print(f"  [SKIP] excluded: {rel}")
            except Exception as e:
                errors.append((src_path, str(e)))
            total += 1
            continue

        if src_path.suffix.lower() in JS_EXTS:
            status, info = obfuscate_file_with_candidates(
                js_obfuscator_cmd, src_path, dest_path, candidates
            )
            if status == "ok":
                obf_count += 1
                print(f"  [OBFUSCATED] {rel}  (flags used: {info})")
            elif status == "parse_error":
                try:
                    copy_file(src_path, dest_path)
                    fallback_copy_count += 1
                    print(
                        f"  [FALLBACK COPIED] {rel} (no parseable by obfuscator). Info: {info}"
                    )
                except Exception as e:
                    errors.append(
                        (src_path, f"fallback copy failed: {e} (info: {info})")
                    )
                    print(
                        f"  [ERROR] fallback copy failed for {rel}: {e}",
                        file=sys.stderr,
                    )
            else:
                errors.append((src_path, info))
                print(f"  [ERROR OBFUSCATE] {rel} -> {info}", file=sys.stderr)
        else:
            try:
                copy_file(src_path, dest_path)
                copy_count += 1
                print(f"  [COPIED] {rel}")
            except Exception as e:
                errors.append((src_path, str(e)))
        total += 1

    print()
    print(
        f"[DONE] {module_name}: total files: {total}, obfuscated: {obf_count}, copied: {copy_count}, fallback_copied: {fallback_copy_count}"
    )
    if errors:
        print(f"[WARN] hubo {len(errors)} errores:")
        for p, e in errors:
            print(f"  - {p}: {e}")
        return False
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Obfusca un módulo (folder) dentro de modules/ y lo coloca en dist-obf-bundle/"
    )
    parser.add_argument(
        "modules", nargs="+", help="Nombre(s) de módulo(s) a obfuscar (p.ej. tickets)"
    )
    parser.add_argument(
        "--src-root",
        default=str(DEFAULT_SRC_ROOT),
        help="Carpeta raíz donde están los módulos (default: modules)",
    )
    parser.add_argument(
        "--out",
        default=str(DEFAULT_OUT_ROOT),
        help="Directorio de salida (default: dist-obf-bundle)",
    )
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        help="Archivo o sufijo a excluir (puedes usar varias veces). Ej: --exclude config.js",
    )
    parser.add_argument(
        "--obf-arg",
        action="append",
        default=[],
        help="Argumentos adicionales para javascript-obfuscator (cada uno separado). Ej: --obf-arg '--compact' --obf-arg 'true'",
    )
    parser.add_argument(
        "--obfuscator-cmd",
        default="javascript-obfuscator",
        help="Comando del obfuscator si no está en PATH o se usa bin local",
    )
    args = parser.parse_args()

    src_root = Path(args.src_root)
    out_root = Path(args.out)

    js_obfuscator_cmd = args.obfuscator_cmd
    if find_executable(js_obfuscator_cmd) is None:
        print(
            f"[ERROR] No se ha encontrado '{js_obfuscator_cmd}' en PATH.",
            file=sys.stderr,
        )
        print(
            "Instálalo con: npm i -g javascript-obfuscator  (o ajusta --obfuscator-cmd para apuntar al bin local)"
        )
        sys.exit(2)

    success_overall = True
    for m in args.modules:
        ok = process_module(
            m, src_root, out_root, js_obfuscator_cmd, args.exclude, args.obf_arg
        )
        success_overall = success_overall and ok

    if not success_overall:
        print("[FIN] Terminó con advertencias/errores.", file=sys.stderr)
        sys.exit(1)
    print("[FIN] Todos los módulos procesados correctamente.")


if __name__ == "__main__":
    main()
