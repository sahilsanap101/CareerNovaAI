import math
import os

def create_svg():
    width = 1200
    height = 500
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background-color: white; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">')
    svg.append('<defs>')
    svg.append('<marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" /></marker>')
    svg.append('</defs>')

    slate_50 = "#f8fafc"
    slate_100 = "#f1f5f9"
    slate_200 = "#e2e8f0"
    slate_300 = "#cbd5e1"
    slate_400 = "#94a3b8"
    slate_500 = "#64748b"
    slate_600 = "#475569"
    slate_700 = "#334155"
    slate_900 = "#0f172a"
    primary_50 = "#eff6ff"
    primary_100 = "#dbeafe"
    primary_500 = "#3b82f6"
    primary_600 = "#2563eb"
    primary_700 = "#1d4ed8"
    yellow_100 = "#fef9c3"
    yellow_800 = "#854d0e"
    green_50 = "#f0fdf4"
    green_100 = "#dcfce7"
    green_200 = "#bbf7d0"
    green_500 = "#22c55e"
    green_700 = "#15803d"
    amber_100 = "#fef3c7"
    amber_500 = "#f59e0b"
    amber_700 = "#b45309"
    red_100 = "#fee2e2"
    red_500 = "#ef4444"
    red_700 = "#b91c1c"
    blue_100 = "#dbeafe"
    blue_700 = "#1d4ed8"

    def text(x, y, content, font_size=14, font_weight="normal", fill=slate_900, text_anchor="start", align_baseline="baseline"):
        return f'<text x="{x}" y="{y}" font-size="{font_size}" font-weight="{font_weight}" text-anchor="{text_anchor}" alignment-baseline="{align_baseline}" fill="{fill}">{content}</text>'

    def box(x, y, w, h, stroke=slate_200, fill="#fff", stroke_width=1, rx=16, stroke_dasharray=""):
        dash = f' stroke-dasharray="{stroke_dasharray}"' if stroke_dasharray else ""
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"{dash} />'

    def line(x1, y1, x2, y2, stroke=slate_200, stroke_width=1, arrow=False):
        marker = ' marker-end="url(#arrow)"' if arrow else ""
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{stroke_width}"{marker} />'
        
    def check_icon(x, y, color):
        return f'<circle cx="{x+8}" cy="{y+8}" r="8" fill="{color}" /><path d="M 4 8 L 7 11 L 12 5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'

    def alert_icon(x, y, color):
        return f'<path d="M 8 1 L 15 14 L 1 14 Z" fill="{color}" /><line x1="8" y1="5" x2="8" y2="10" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="12" r="1" fill="#fff" />'
        
    def lock_icon(x, y, color):
        return f'<rect x="{x+3}" y="{y+7}" width="10" height="7" rx="1" fill="none" stroke="{color}" stroke-width="2"/><path d="M 5 7 V 5 A 3 3 0 0 1 11 5 V 7" fill="none" stroke="{color}" stroke-width="2"/>'

    def unlock_icon(x, y, color):
        return f'<rect x="{x+3}" y="{y+7}" width="10" height="7" rx="1" fill="none" stroke="{color}" stroke-width="2"/><path d="M 5 7 V 5 A 3 3 0 0 1 11 5" fill="none" stroke="{color}" stroke-width="2"/>'

    def badge(x, y, w, h, bg, text_val, text_col):
        res = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{bg}" />'
        res += text(x+w/2, y+h/2+4, text_val, font_size=10, font_weight="bold", fill=text_col, text_anchor="middle")
        return res
        
    y_start = 50
    h_panel = 420
    w_a = 320
    w_b = 320
    w_c = 440
    
    x_a = 40
    x_b = x_a + w_a + 40
    x_c = x_b + w_b + 40
    
    svg.append(line(x_a + w_a + 5, y_start + h_panel/2, x_b - 5, y_start + h_panel/2, stroke=slate_400, stroke_width=2, arrow=True))
    svg.append(line(x_b + w_b + 5, y_start + h_panel/2, x_c - 5, y_start + h_panel/2, stroke=slate_400, stroke_width=2, arrow=True))
    
    # ---------------- Panel (a) ----------------
    svg.append(text(x_a + w_a/2, y_start - 20, "(a) Career Recommendation", font_size=16, font_weight="bold", text_anchor="middle"))
    svg.append(box(x_a, y_start, w_a, h_panel, stroke=primary_500, stroke_width=2, rx=16))
    svg.append(box(x_a-3, y_start-3, w_a+6, h_panel+6, stroke=primary_500, fill="none", stroke_width=1, rx=19))
    
    py = y_start + 24
    px = x_a + 24
    svg.append(badge(px, py, 32, 22, yellow_100, "#1", yellow_800))
    svg.append(text(px + 40, py + 15, "TECHNOLOGY", font_size=12, font_weight="bold", fill=slate_500))
    
    py += 35
    svg.append(text(px, py + 15, "AI Engineer", font_size=20, font_weight="bold", fill=slate_900))
    svg.append(badge(px + 120, py, 75, 22, primary_50, "✓ Selected", primary_600))
    
    py += 35
    svg.append(box(px, py + 6, 120, 8, stroke="none", fill=slate_100, rx=4))
    svg.append(box(px, py + 6, 102, 8, stroke="none", fill=green_500, rx=4))
    svg.append(text(px + 130, py + 14, "Match Score: 85/100", font_size=14, font_weight="bold", fill=slate_700))
    
    py += 30
    svg.append(line(px, py, px + w_a - 48, py, stroke=slate_200))
    
    py += 15
    svg.append(text(px, py + 10, "TOP SKILLS", font_size=12, font_weight="bold", fill=slate_500))
    py += 20
    svg.append(check_icon(px, py, green_500))
    svg.append(text(px + 24, py + 12, "Python", font_size=14, fill=slate_700))
    
    py += 35
    svg.append(text(px, py + 10, "SKILLS TO DEVELOP", font_size=12, font_weight="bold", fill=slate_500))
    py += 20
    svg.append(alert_icon(px, py, amber_500))
    svg.append(text(px + 24, py + 12, "Deep Learning", font_size=14, fill=slate_700))
    py += 25
    svg.append(alert_icon(px, py, amber_500))
    svg.append(text(px + 24, py + 12, "ML System Design", font_size=14, fill=slate_700))
    
    py += 40
    svg.append(line(px, py, px + w_a - 48, py, stroke=slate_200))
    
    py += 20
    svg.append(box(px, py, w_a - 48, 40, stroke="none", fill=primary_100, rx=12))
    svg.append(text(x_a + w_a/2, py + 25, "Roadmap Generated ✓", font_size=14, font_weight="bold", fill=primary_700, text_anchor="middle"))
    
    # ---------------- Panel (b) ----------------
    svg.append(text(x_b + w_b/2, y_start - 20, "(b) Skill-Gap Analysis", font_size=16, font_weight="bold", text_anchor="middle"))
    svg.append(box(x_b, y_start, w_b, h_panel, stroke=slate_200, stroke_width=2, rx=16))
    
    py = y_start + 24
    px = x_b + 24
    svg.append(text(px, py + 15, "Your Current Position", font_size=20, font_weight="bold", fill=slate_900))
    
    py += 40
    svg.append(box(px, py, w_b - 48, 80, stroke=slate_200, stroke_width=1, rx=12))
    svg.append(check_icon(px + 15, py + 15, green_500))
    svg.append(text(px + 35, py + 27, "STRONG SKILLS", font_size=12, font_weight="bold", fill=slate_400))
    svg.append(text(px + 15, py + 60, "Python", font_size=14, font_weight="bold", fill=slate_700))
    svg.append(badge(px + w_b - 48 - 140, py + 45, 125, 20, green_100, "Intermediate (3/5)", green_700))
    
    py += 100
    svg.append(box(px, py, w_b - 48, 80, stroke=slate_200, stroke_width=1, rx=12))
    svg.append(alert_icon(px + 15, py + 15, amber_500)) 
    svg.append(text(px + 35, py + 27, "PARTIAL SKILLS", font_size=12, font_weight="bold", fill=slate_400))
    svg.append(text(px + 15, py + 60, "None identified.", font_size=14, fill=slate_500, font_weight="normal"))
    
    py += 100
    svg.append(box(px, py, w_b - 48, 80, stroke=slate_200, stroke_width=1, rx=12))
    svg.append(alert_icon(px + 15, py + 15, red_500))
    svg.append(text(px + 35, py + 27, "SKILL GAPS", font_size=12, font_weight="bold", fill=slate_400))
    svg.append(text(px + 15, py + 60, "Deep Learning", font_size=14, font_weight="bold", fill=slate_700))
    svg.append(badge(px + w_b - 48 - 150, py + 45, 135, 20, red_100, "Target: Intermediate", red_700))

    # ---------------- Panel (c) ----------------
    svg.append(text(x_c + w_c/2, y_start - 20, "(c) Personalized Learning Roadmap", font_size=16, font_weight="bold", text_anchor="middle"))
    svg.append(box(x_c, y_start, w_c, h_panel, stroke=slate_200, stroke_width=2, rx=16))
    
    py = y_start + 24
    px = x_c + 24
    svg.append(text(px, py + 15, "AI Engineer", font_size=20, font_weight="bold", fill=slate_900))
    svg.append(badge(px + w_c - 48 - 140, py, 140, 30, slate_100, "Readiness 45/100", slate_700))
    
    py += 40
    svg.append(line(px, py, px + w_c - 48, py, stroke=slate_200))
    
    py += 20
    svg.append(line(px + 10, py, px + 10, py + 260, stroke=slate_200, stroke_width=2))
    
    svg.append(box(px + 2, py + 2, 16, 16, stroke="white", fill=primary_500, stroke_width=4, rx=8))
    svg.append(text(px + 30, py + 15, "Stage 1: Foundation", font_size=16, font_weight="bold", fill=slate_900))
    
    py += 30
    svg.append(box(px + 30, py, w_c - 80, 50, stroke=green_200, fill=green_50, stroke_width=1, rx=12))
    svg.append(check_icon(px + 45, py + 17, green_500))
    svg.append(text(px + 70, py + 30, "Python", font_size=15, font_weight="bold", fill=slate_900))
    svg.append(badge(px + w_c - 80 - 190, py + 15, 190, 20, green_100, "SKIPPED BY EXISTING KNOWLEDGE", green_700))
    
    py += 70
    svg.append(box(px + 2, py + 2, 16, 16, stroke="white", fill=slate_300, stroke_width=4, rx=8))
    svg.append(text(px + 30, py + 15, "Stage 2: Core Skills", font_size=16, font_weight="bold", fill=slate_900))
    
    py += 30
    svg.append(box(px + 30, py, w_c - 80, 50, stroke=slate_200, fill="#fff", stroke_width=1, rx=12))
    svg.append(unlock_icon(px + 45, py + 17, slate_400))
    svg.append(text(px + 70, py + 30, "Deep Learning", font_size=15, font_weight="bold", fill=slate_900))
    svg.append(badge(px + w_c - 80 - 90, py + 15, 90, 20, slate_100, "NOT STARTED", slate_700))
    
    py += 70
    svg.append(box(px + 2, py + 2, 16, 16, stroke="white", fill=slate_300, stroke_width=4, rx=8))
    svg.append(text(px + 30, py + 15, "Stage 3: Placement Preparation", font_size=16, font_weight="bold", fill=slate_900))
    
    py += 30
    svg.append(box(px + 30, py, w_c - 80, 50, stroke=slate_200, fill="#fff", stroke_width=1, rx=12))
    svg.append(lock_icon(px + 45, py + 17, slate_400))
    svg.append(text(px + 70, py + 30, "ML System Design", font_size=15, font_weight="bold", fill=slate_900))
    svg.append(badge(px + w_c - 80 - 60, py + 15, 60, 20, slate_100, "LOCKED", slate_600))
    
    svg.append('</svg>')
    
    os.makedirs(r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\paper\figures", exist_ok=True)
    svg_str = "\n".join(svg)
    with open(r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\paper\figures\fig2_recommendation_to_remediation.svg", "w", encoding="utf-8") as f:
        f.write(svg_str)
        
    try:
        import cairosvg
        cairosvg.svg2pdf(bytestring=svg_str.encode('utf-8'), write_to=r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\paper\figures\fig2_recommendation_to_remediation.pdf")
        cairosvg.svg2png(bytestring=svg_str.encode('utf-8'), write_to=r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\paper\figures\fig2_recommendation_to_remediation.png", scale=2.0)
        print("Generated SVG, PDF, and PNG successfully.")
    except Exception as e:
        print("Could not generate PDF/PNG:", str(e))

if __name__ == "__main__":
    create_svg()
