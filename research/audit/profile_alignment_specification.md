# Exact Profile Alignment Formulas

## 1. Skill Score
- Input: `student.skills[canonicalName].proficiency`, `req.minimumProficiency`, `req.skillType`
- Formula: `earnedSkillScore += min(userProf / reqProf, 1.2) * typeWeight`
- Max Score: 100 (scaled by `(earnedSkillScore / totalSkillWeight) * 100`)

## 2. Interest Score
- Formula: `matchingInterests * 33.3` (capped at 100)

## 3. Academic Score
- CGPA >= 8.5 (100), >=7.5 (80), >=6.5 (60), else 40.
- +10 bonus if branch includes 'computer science', 'it', or 'software'.

## 4. Project Score
- Formula: `projectKeywordMatches * 25` (capped at 100). Keywords match target career required skills and category.

## 5. Certification Score
- Formula: `certMatches * 50` (capped at 100).

## 6. Coding Score
- Problems >= 300 (100), >=150 (75), >= 50 (50), else 20.

## 7. Goal Score
- Direct match (100), Industry match (80), Neutral (50).
