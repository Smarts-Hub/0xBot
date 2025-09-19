import os
import zipfile

def add_folder_to_zip(zipf, folder_path, arc_path=""):
    # Add a folder to the zip file
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.join(arc_path, os.path.relpath(file_path, folder_path))
            zipf.write(file_path, rel_path)

def main():
    version = input("Set the version: ").strip()
    if not version:
        print("Invalid version")
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.join(base_dir, "../")
    core_dir = os.path.join(base_dir, "../core")
    modules_dir = os.path.join(base_dir, "../modules")
    dist_dir = os.path.join(base_dir, "../dist")

    os.makedirs(dist_dir, exist_ok=True)
    zip_filename = os.path.join(dist_dir, f"0xbot_{version}.zip")

    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        add_folder_to_zip(zipf, core_dir, "core")
        add_folder_to_zip(zipf, modules_dir, "modules")

        root_files = ["index.js", "package.json", "package-lock.json", "README.md"]
        for file in root_files:
            file_path = os.path.join(root_dir, file)
            if os.path.exists(file_path):
                zipf.write(file_path, file)

    print(f"Done: {zip_filename}")

if __name__ == "__main__":
    main()
