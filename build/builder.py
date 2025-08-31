import os
import zipfile

def main():
    # Pedir versión al usuario
    version = input("Introduce la versión de 0xBot: ").strip()
    if not version:
        print("Error: debes introducir una versión válida.")
        return

    # Rutas
    base_dir = os.path.dirname(os.path.abspath(__file__))
    core_dir = os.path.join(base_dir, '../core')
    modules_dir = os.path.join(base_dir, '../modules')
    dist_dir = os.path.join(base_dir, '../dist')

    # Crear dist si no existe
    os.makedirs(dist_dir, exist_ok=True)

    # Nombre del archivo zip
    zip_filename = os.path.join(dist_dir, f'0xbot_{version}.zip')

    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Función para agregar archivos de una carpeta
        def add_folder_to_zip(folder_path, arc_path=""):
            for root, _, files in os.walk(folder_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Ruta dentro del zip
                    rel_path = os.path.join(arc_path, os.path.relpath(file_path, folder_path))
                    zipf.write(file_path, rel_path)

        # Agregar core y modules
        add_folder_to_zip(core_dir, "core")
        add_folder_to_zip(modules_dir, "modules")

    print(f"✅ Comprimido creado en: {zip_filename}")

if __name__ == "__main__":
    main()
