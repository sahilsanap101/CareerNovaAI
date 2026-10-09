import json
import pandas as pd
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

os.makedirs(f"{base_dir}/research/audit", exist_ok=True)
os.makedirs(f"{base_dir}/research/data/collection", exist_ok=True)

careers = [
    "Backend Developer", "Cloud Engineer", "Computer Vision Engineer", "Cybersecurity Engineer",
    "Data Analyst", "Data Engineer", "Data Scientist", "DevOps Engineer", "Frontend Developer",
    "Full Stack Developer", "MLOps Engineer", "Machine Learning Engineer", "NLP Engineer",
    "QA Engineer", "Software Engineer"
]

# Phase A: Original Audit
original_audit = """# Original Assessment State Audit
- **Assessment Table/Schema**: Exists in `prisma/schema.prisma` (`career_assessment_questions`, `career_assessment_options`, `career_assessment_responses`).
- **Normalization Logic**: Implemented in `combinedRecommendation.service.ts` (`normalizedScore = (rawScore / maxPossibleScore) * 100`).
- **70:30 Fusion Logic**: Implemented in `combinedRecommendation.service.ts` (`Profile * 0.70 + Assessment * 0.30`).
- **Fallback Behavior**: Defaults to Profile * 1.0 if assessment data is missing.
- **Explicit Fact**: The structured Likert questions and deterministic weight matrices mapped precisely to the 15 evaluation careers were missing from the explicit research configuration.
"""
with open(f"{base_dir}/research/audit/original_assessment_state.md", "w") as f:
    f.write(original_audit)

# Phase B & C: Question Design
questions = [
    # 1. work and role preferences
    {"q_id": "Q01", "dim": 1, "text": "I enjoy building user-facing interfaces and interactive visual elements.", "pos": ["Frontend Developer", "Full Stack Developer"]},
    {"q_id": "Q02", "dim": 1, "text": "I prefer designing server-side logic and database architectures over visual design.", "pos": ["Backend Developer", "Data Engineer", "Software Engineer"]},
    {"q_id": "Q03", "dim": 1, "text": "I like writing automated scripts to orchestrate deployments and manage infrastructure.", "pos": ["DevOps Engineer", "Cloud Engineer", "MLOps Engineer"]},
    {"q_id": "Q04", "dim": 1, "text": "I find satisfaction in testing software rigorously to uncover defects and ensure reliability.", "pos": ["QA Engineer", "Cybersecurity Engineer"]},
    # 2. problem-solving and learning preferences
    {"q_id": "Q05", "dim": 2, "text": "I prefer deriving insights from raw information using statistics and logic.", "pos": ["Data Analyst", "Data Scientist"]},
    {"q_id": "Q06", "dim": 2, "text": "I enjoy solving problems by finding vulnerabilities or predicting how systems might fail.", "pos": ["Cybersecurity Engineer", "QA Engineer"]},
    {"q_id": "Q07", "dim": 2, "text": "I like to learn by developing algorithms that allow systems to learn from data autonomously.", "pos": ["Machine Learning Engineer", "Computer Vision Engineer", "NLP Engineer"]},
    {"q_id": "Q08", "dim": 2, "text": "When learning a new tool, I focus on how it can make an entire system more scalable and resilient.", "pos": ["Cloud Engineer", "DevOps Engineer", "Software Engineer"]},
    # 3. technology and domain interests
    {"q_id": "Q09", "dim": 3, "text": "I am deeply interested in working with large datasets, distributed storage, and data pipelines.", "pos": ["Data Engineer", "Data Scientist", "MLOps Engineer"]},
    {"q_id": "Q10", "dim": 3, "text": "I want to work extensively with web technologies like React, Vue, or Angular.", "pos": ["Frontend Developer", "Full Stack Developer"]},
    {"q_id": "Q11", "dim": 3, "text": "I am fascinated by artificial intelligence processing text, speech, or images.", "pos": ["NLP Engineer", "Computer Vision Engineer", "Machine Learning Engineer"]},
    {"q_id": "Q12", "dim": 3, "text": "I am interested in networking protocols, cryptography, and securing applications.", "pos": ["Cybersecurity Engineer", "Cloud Engineer"]},
    # 4. work style
    {"q_id": "Q13", "dim": 4, "text": "I prefer working in environments where I can build end-to-end features completely independently.", "pos": ["Full Stack Developer", "Software Engineer"]},
    {"q_id": "Q14", "dim": 4, "text": "I thrive in experimental work where outcomes are uncertain and require continuous research.", "pos": ["Data Scientist", "Machine Learning Engineer", "Computer Vision Engineer"]},
    {"q_id": "Q15", "dim": 4, "text": "I like highly structured work environments focusing on enforcing standards, metrics, and quality.", "pos": ["QA Engineer", "DevOps Engineer"]},
    {"q_id": "Q16", "dim": 4, "text": "I enjoy bridging the gap between development and operations teams.", "pos": ["DevOps Engineer", "MLOps Engineer"]},
    # 5. career direction
    {"q_id": "Q17", "dim": 5, "text": "I see myself contributing to core product development and enterprise software systems.", "pos": ["Backend Developer", "Software Engineer", "Full Stack Developer"]},
    {"q_id": "Q18", "dim": 5, "text": "I see myself leading intelligent systems and predictive analytics strategies.", "pos": ["Data Scientist", "Machine Learning Engineer"]},
    {"q_id": "Q19", "dim": 5, "text": "I aim to specialize in maintaining secure, highly available, and scalable cloud environments.", "pos": ["Cloud Engineer", "Cybersecurity Engineer"]},
    {"q_id": "Q20", "dim": 5, "text": "I want my career to focus on interpreting business metrics and reporting actionable data trends.", "pos": ["Data Analyst", "Data Engineer"]}
]

q_dicts = []
for q in questions:
    q_dict = {
        "question_id": q["q_id"],
        "question_number": int(q["q_id"].replace("Q", "")),
        "question_text": q["text"],
        "response_type": "LIKERT_5",
        "response_scale": "1=Strongly Disagree, 2=Disagree, 3=Neutral, 4=Agree, 5=Strongly Agree",
        "scoring_direction": "POSITIVE",
        "rationale": f"Measures preference for {q['pos'][0]} oriented tasks",
        "career_weights": {c: (1.0 if c in q["pos"] else 0.0) for c in careers}
    }
    q_dicts.append(q_dict)

with open(f"{base_dir}/research/data/collection/career_assessment_questions_v1.json", "w") as f:
    json.dump(q_dicts, f, indent=2)

df_q = pd.DataFrame(q_dicts)
# flatten career_weights for CSV
weights_df = pd.json_normalize(df_q['career_weights'])
df_q_csv = pd.concat([df_q.drop(columns=['career_weights']), weights_df], axis=1)
df_q_csv.to_csv(f"{base_dir}/research/data/collection/career_assessment_questions_v1.csv", index=False)

# Phase D: Weight Matrix
matrix = []
for q in q_dicts:
    row = {"question_id": q["question_id"]}
    row.update(q["career_weights"])
    matrix.append(row)
    
df_mat = pd.DataFrame(matrix)
df_mat.to_csv(f"{base_dir}/research/data/collection/career_assessment_weight_matrix_v1.csv", index=False)
with open(f"{base_dir}/research/data/collection/career_assessment_weight_matrix_v1.json", "w") as f:
    json.dump(matrix, f, indent=2)

# Phase E: Design Justification
design_md = "# Assessment Design v1\n\n"
for q in q_dicts:
    design_md += f"## {q['question_id']}\n"
    design_md += f"1. **Construct**: Measures affinity for tasks preferred by {', '.join(questions[q['question_number']-1]['pos'])}.\n"
    design_md += f"2. **Dimension**: Dimension {questions[q['question_number']-1]['dim']}.\n"
    design_md += f"3. **Weight Logic**: Careers directly utilizing this construct receive +1.0 weight, others 0.0.\n"
    design_md += f"4. **No Label Leakage**: Focuses purely on conceptual activities, not the job title.\n\n"

with open(f"{base_dir}/research/audit/assessment_design_v1.md", "w") as f:
    f.write(design_md)

# Phase F: Scoring Specification
scoring_md = """# Assessment Scoring Specification v1

- **Amax(c)**: Theoretical maximum for career `c`. Sum of weights for `c` across all 20 questions where weight > 0, assuming max Likert response (weight * 1.0). In Likert scoring: response 5 = 1.0, 4 = 0.75, 3 = 0.5, 2 = 0.25, 1 = 0.0.
- **Response Encoding**: Strongly Disagree (1) -> 0.0 multiplier. Disagree (2) -> 0.25. Neutral (3) -> 0.5. Agree (4) -> 0.75. Strongly Agree (5) -> 1.0.
- **Q(u,c)**: Question contribution = `encoding(response) * weight(q, c)`.
- **A(u,c)**: Raw Assessment Score = Sum of `Q(u,c)` across 20 questions.
- **Normalization**: `Normalized A(u,c) = (A(u,c) / Amax(c)) * 100`.
- **Missing response handling**: Omitted from both `A(u,c)` and `Amax(c)`, treating the question as if it did not exist for this user.
"""
with open(f"{base_dir}/research/audit/assessment_scoring_v1.md", "w") as f:
    f.write(scoring_md)

print("Config generation done")
