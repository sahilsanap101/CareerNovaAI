import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import os

# Allow import from parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from run_evaluation import CAREERS

def build_tfidf_model():
    """ Builds a TF-IDF vectorizer fit on the text of the careers """
    career_docs = []
    career_names = []
    for c in CAREERS:
        reqs = " ".join([req['name'] for req in c['reqs']])
        c_doc = f"{c['name']} {c['category']} {reqs}"
        career_docs.append(c_doc)
        career_names.append(c['name'])
        
    vectorizer = TfidfVectorizer(stop_words='english')
    career_matrix = vectorizer.fit_transform(career_docs)
    return vectorizer, career_matrix, career_names

vectorizer, career_matrix, career_names = build_tfidf_model()

def evaluate_tfidf(student_row):
    """ Evaluates replacing BYSER using a TF-IDF heuristic """
    skills = [s['name'] for s in json.loads(student_row['skills'])]
    interests = json.loads(student_row['interests'])
    projects = json.loads(student_row['projects'])
    
    # Synthesize document
    student_doc = " ".join(skills + interests + projects)
    
    student_vec = vectorizer.transform([student_doc])
    similarities = cosine_similarity(student_vec, career_matrix)[0]
    
    best_idx = similarities.argmax()
    return career_names[best_idx]
