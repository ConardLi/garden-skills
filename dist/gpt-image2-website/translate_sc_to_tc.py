import os
import subprocess
import sys

def install_opencc():
    print("正在檢查並安裝 opencc-python-reimplemented...")
    try:
        import opencc
        print("OpenCC 已安裝。")
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "opencc-python-reimplemented"])
        print("OpenCC 安裝成功。")

def main():
    install_opencc()
    from opencc import OpenCC
    # s2twp: Simplified Chinese to Traditional Chinese (Taiwan standard, with phrases)
    cc = OpenCC('s2twp')

    # 排除目錄與檔案
    exclude_dirs = {'node_modules', '.git', '.vscode', '.idea'}
    exclude_files = {'translate_sc_to_tc.py', 'package-lock.json', '.DS_Store'}
    
    # 支援的檔案副檔名
    extensions = {'.tsx', '.ts', '.json', '.css', '.md', '.html', '.js', '.mjs', '.txt', '.yml', '.yaml'}

    processed_count = 0
    current_dir = os.getcwd()

    print(f"開始掃描目錄: {current_dir}")

    for root, dirs, files in os.walk(current_dir):
        # 原地修改 dirs 以排除不需要的目錄
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file in exclude_files:
                continue
                
            ext = os.path.splitext(file)[1].lower()
            if ext in extensions:
                file_path = os.path.join(root, file)
                try:
                    # 讀取檔案內容
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 執行轉換
                    converted = cc.convert(content)
                    
                    # 特殊處理：修正 index.html 的語系屬性
                    if file == 'index.html':
                        converted = converted.replace('lang="zh-CN"', 'lang="zh-TW"')
                    
                    # 如果內容有變動才寫入檔案
                    if converted != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(converted)
                        relative_path = os.path.relpath(file_path, current_dir)
                        print(f"已轉換: {relative_path}")
                        processed_count += 1
                except UnicodeDecodeError:
                    # 忽略非 UTF-8 檔案
                    pass
                except Exception as e:
                    relative_path = os.path.relpath(file_path, current_dir)
                    print(f"處理失敗 {relative_path}: {e}")

    print(f"\n轉換完成！共處理 {processed_count} 個檔案。")

if __name__ == "__main__":
    main()
