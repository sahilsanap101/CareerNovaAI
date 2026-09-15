/**
 * BYSER Recommendation Engine Configurable Factor Weights
 * Configurable without modifying business code.
 * Sum = 1.0 (100%)
 */
export const BYSER_WEIGHTS = {
  SKILLS: 0.35,          // 35% Technical Skills & Proficiency
  INTERESTS: 0.20,       // 20% Domain Interests & Alignment
  PROJECTS: 0.15,        // 15% Portfolio Projects & Practical Experience
  ACADEMIC: 0.10,        // 10% Academic CGPA & Degree Alignment
  CERTIFICATIONS: 0.10,  // 10% Verified Professional Certifications
  CODING: 0.05,          // 5% Coding Platform Activity & Problem Solving
  GOALS: 0.05,           // 5% Preferred Job Role & Industry Match

  // --- ADDITIVE LAYER 1 EXTENSION ---
  // Market Alignment uses external ESCO proxy data to boost scores 
  // It acts additively strictly on top of the deterministic core equation without altering base weights
  MARKET_ALIGNMENT: 0.15,
};

export type ByserWeights = typeof BYSER_WEIGHTS;
