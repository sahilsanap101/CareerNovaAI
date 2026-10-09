import math
import os

def create_svg():
    width = 1100
    height = 950
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background-color: white; font-family: Arial, sans-serif;">')
    svg.append('<defs>')
    svg.append('<marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">')
    svg.append('<path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />')
    svg.append('</marker>')
    svg.append('</defs>')

    # Helper function for text
    def text(x, y, content, font_size=14, font_weight="normal", text_anchor="middle", align_baseline="middle", fill="#000"):
        return f'<text x="{x}" y="{y}" font-size="{font_size}" font_weight="{font_weight}" text-anchor="{text_anchor}" alignment-baseline="{align_baseline}" fill="{fill}">{content}</text>'

    # Helper function for box
    def box(x, y, w, h, stroke="#000", fill="#fff", stroke_width=2, rx=5, stroke_dasharray=""):
        dash = f' stroke-dasharray="{stroke_dasharray}"' if stroke_dasharray else ""
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"{dash} />'

    def line(x1, y1, x2, y2, stroke="#000", stroke_width=2, arrow=True):
        marker = ' marker-end="url(#arrow)"' if arrow else ""
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{stroke_width}"{marker} />'

    # --- CORE RESEARCH PIPELINE ---
    # Group box
    svg.append(box(20, 20, 680, 910, stroke="#333", fill="#fafafa", stroke_width=2, rx=8, stroke_dasharray=""))
    svg.append(text(360, 45, "CORE RESEARCH PIPELINE", font_size=18, font_weight="bold"))

    center_x = 360
    box_w = 340
    box_w_large = 400
    
    # 1. Inputs
    y = 80
    h_in = 60
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_in, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 25, "Student Profile Database Records", font_size=14, font_weight="bold"))
    svg.append(text(center_x, y + 45, "+ 20-Question Career Assessment", font_size=14))
    
    # arrow
    svg.append(line(center_x, y + h_in, center_x, y + h_in + 30))
    y += h_in + 30
    
    # 2. Feature Extraction
    h_fe = 100
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_fe, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 25, "Feature Extraction", font_size=16, font_weight="bold"))
    svg.append(text(center_x, y + 50, "7-Dimensional Profile:", font_size=13))
    svg.append(text(center_x, y + 70, "Skills • Interests • Projects • Academics", font_size=13))
    svg.append(text(center_x, y + 85, "Certifications • Coding Evidence • Career Goals", font_size=13))
    
    svg.append(line(center_x, y + h_fe, center_x, y + h_fe + 30))
    y += h_fe + 30

    # 3. Academic-Year Weighting
    h_aw = 50
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_aw, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 30, "Academic-Year-Based Weight Adjustment", font_size=15, font_weight="bold"))
    
    svg.append(line(center_x, y + h_aw, center_x, y + h_aw + 20, arrow=False))
    
    # Split
    y += h_aw + 20
    w_split = 200
    svg.append(line(center_x - w_split/2, y, center_x + w_split/2, y, arrow=False))
    svg.append(line(center_x - w_split/2, y, center_x - w_split/2, y + 20))
    svg.append(line(center_x + w_split/2, y, center_x + w_split/2, y + 20))
    
    y += 20
    # 4. Profile Score / Assessment Score
    h_score = 60
    w_score = 180
    svg.append(box(center_x - w_split/2 - w_score/2, y, w_score, h_score, stroke="#000", fill="#fff"))
    svg.append(text(center_x - w_split/2, y + 25, "Deterministic", font_size=14, font_weight="bold"))
    svg.append(text(center_x - w_split/2, y + 45, "Profile Score P(u,c)", font_size=14, font_weight="bold"))
    
    svg.append(box(center_x + w_split/2 - w_score/2, y, w_score, h_score, stroke="#000", fill="#fff"))
    svg.append(text(center_x + w_split/2, y + 25, "Career Assessment", font_size=14, font_weight="bold"))
    svg.append(text(center_x + w_split/2, y + 45, "Score Q(u,c)", font_size=14, font_weight="bold"))
    
    # Join
    svg.append(line(center_x - w_split/2, y + h_score, center_x - w_split/2, y + h_score + 20, arrow=False))
    svg.append(line(center_x + w_split/2, y + h_score, center_x + w_split/2, y + h_score + 20, arrow=False))
    
    y += h_score + 20
    svg.append(line(center_x - w_split/2, y, center_x + w_split/2, y, arrow=False))
    svg.append(line(center_x, y, center_x, y + 20))
    
    y += 20
    
    # 5. Score Fusion
    h_fusion = 60
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_fusion, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 25, "70:30 Score Fusion", font_size=15, font_weight="bold"))
    svg.append(text(center_x, y + 45, "R(u,c) = 0.70P(u,c) + 0.30Q(u,c)", font_size=15))

    svg.append(line(center_x, y + h_fusion, center_x, y + h_fusion + 30))
    y += h_fusion + 30
    
    # 6. Career Ranking + Deterministic Evidence
    h_rank = 50
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_rank, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 30, "Career Ranking + Deterministic Evidence", font_size=15, font_weight="bold"))
    
    svg.append(line(center_x, y + h_rank, center_x, y + h_rank + 30))
    y += h_rank + 30
    
    # 7. Selected Career
    h_sel = 50
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_sel, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 30, "Selected Career", font_size=15, font_weight="bold"))
    
    svg.append(line(center_x, y + h_sel, center_x, y + h_sel + 30))
    y += h_sel + 30
    
    # 8. Skill Gap Analysis
    h_gap = 50
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_gap, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 30, "Career-Conditioned Skill-Gap Analysis", font_size=15, font_weight="bold"))

    svg.append(line(center_x, y + h_gap, center_x, y + h_gap + 30))
    y += h_gap + 30
    
    # 9. Roadmap
    h_road = 60
    svg.append(box(center_x - box_w_large/2, y, box_w_large, h_road, stroke="#000", fill="#fff"))
    svg.append(text(center_x, y + 25, "Personalized Learning Roadmap", font_size=15, font_weight="bold"))
    svg.append(text(center_x, y + 45, "(Skill Dependency Graph / Topological Layering)", font_size=13))


    # --- RIGHT PANELS ---
    
    panel_x = 720
    panel_w = 360
    
    # Supporting Services
    sup_y = 20
    sup_h = 240
    svg.append(box(panel_x, sup_y, panel_w, sup_h, stroke="#777", fill="#fdfdfd", stroke_width=2, rx=8, stroke_dasharray="8 4"))
    svg.append(text(panel_x + panel_w/2, sup_y + 35, "SUPPORTING SERVICES", font_size=16, font_weight="bold", fill="#555"))
    
    # Inside supporting
    sy = sup_y + 60
    sh = 40
    svg.append(box(panel_x + 20, sy, panel_w - 40, sh, stroke="#555", fill="#fff"))
    svg.append(text(panel_x + panel_w/2, sy + 25, "Resume Intelligence", font_size=14))
    
    sy += sh + 20
    svg.append(box(panel_x + 20, sy, panel_w - 40, sh, stroke="#555", fill="#fff"))
    svg.append(text(panel_x + panel_w/2, sy + 25, "AIOS Career System", font_size=14))

    sy += sh + 20
    svg.append(box(panel_x + 20, sy, panel_w - 40, sh, stroke="#555", fill="#fff"))
    svg.append(text(panel_x + panel_w/2, sy + 25, "Live Job Retrieval", font_size=14))


    # INDEPENDENT GATE SUBSYSTEM
    gate_y = sup_y + sup_h + 30
    gate_h = 470
    svg.append(box(panel_x, gate_y, panel_w, gate_h, stroke="#777", fill="#f8f9fa", stroke_width=2, rx=8, stroke_dasharray="6 6"))
    svg.append(text(panel_x + panel_w/2, gate_y + 35, "GATE PREPARATION SUBSYSTEM", font_size=16, font_weight="bold", fill="#555"))
    svg.append(text(panel_x + panel_w/2, gate_y + 55, "(Independent Pipeline)", font_size=13, fill="#555", font_weight="normal"))
    
    gy = gate_y + 80
    gh = 30
    gate_items = [
        "Syllabus",
        "Practice / PYQs",
        "Study Planner",
        "Study Sessions",
        "Practice Attempts",
        "Mistake Log",
        "Revision",
        "Mock Tests",
        "Analytics",
        "Readiness Assessment"
    ]
    
    for item in gate_items:
        svg.append(box(panel_x + 40, gy, panel_w - 80, gh, stroke="#666", fill="#fff"))
        svg.append(text(panel_x + panel_w/2, gy + 18, item, font_size=13))
        gy += gh + 8

    # TRENDING JOBS
    trend_y = gate_y + gate_h + 30
    trend_h = 100
    svg.append(box(panel_x, trend_y, panel_w, trend_h, stroke="#aaa", fill="#fff", stroke_width=2, rx=8, stroke_dasharray="4 4"))
    svg.append(text(panel_x + panel_w/2, trend_y + 35, "TRENDING JOBS", font_size=16, font_weight="bold", fill="#777"))
    
    svg.append(box(panel_x + 20, trend_y + 50, panel_w - 40, 35, stroke="#aaa", fill="#f5f5f5"))
    svg.append(text(panel_x + panel_w/2, trend_y + 73, "Trending Jobs \u2014 Current Stub", font_size=14, fill="#555"))


    svg.append('</svg>')
    
    with open("c:\\Users\\ankit\\Downloads\\PATHFORGE (1)\\PATHFORGE\\paper\\figures\\fig1_system_architecture.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
        
    print("SVG generated successfully.")

if __name__ == "__main__":
    os.makedirs("c:\\Users\\ankit\\Downloads\\PATHFORGE (1)\\PATHFORGE\\paper\\figures", exist_ok=True)
    create_svg()
