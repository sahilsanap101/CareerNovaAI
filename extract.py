
import pypdf

for f in ['c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/paper/previous/s44163-026-00996-9.pdf', 'c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/paper/previous/00920-BeutlingN.pdf']:
    print('== ' + f)
    print(pypdf.PdfReader(f).pages[0].extract_text())

