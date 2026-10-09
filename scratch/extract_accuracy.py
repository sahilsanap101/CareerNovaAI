import os
import PyPDF2
import glob

pdf_dir = r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\paper\previous"
pdfs = glob.glob(os.path.join(pdf_dir, "*.pdf"))

print(f"Found {len(pdfs)} PDFs.")

results = []
for pdf in pdfs:
    try:
        with open(pdf, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    text += extracted + " "
            
            # Simple search for 'accuracy' and extract surrounding text
            idx = 0
            found = False
            while True:
                idx = text.lower().find("accuracy", idx)
                if idx == -1:
                    break
                
                start = max(0, idx - 100)
                end = min(len(text), idx + 100)
                snippet = text[start:end].replace('\n', ' ')
                results.append(f"[{os.path.basename(pdf)}] ...{snippet}...")
                idx += len("accuracy")
                found = True
            
            if not found:
                results.append(f"[{os.path.basename(pdf)}] No 'accuracy' found.")
    except Exception as e:
        results.append(f"[{os.path.basename(pdf)}] Error reading PDF: {e}")

with open(r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\scratch\pdf_accuracy_report.txt", "w", encoding="utf-8") as out:
    for res in results:
        out.write(res + "\n")

print("Report generated.")
