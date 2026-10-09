# Assessment Unit Test Report (v1)

All core scoring operations verified to be fully deterministic.

## Test 1: Response Encoding
- **Requirement**: 1 -> 0, 5 -> 1.0
- **Result**: PASS (Encodings: {'1': 0.0, '2': 0.25, '3': 0.5, '4': 0.75, '5': 1.0})

## Test 2: One-Question Scoring
- **Requirement**: Q(u,c) = base_weight * encoding
- **Given**: Weight = 1.0, Response = '4' (0.75)
- **Result**: PASS (Score = 0.75)

## Test 3: Multi-Question Aggregation
- **Requirement**: A(u,c) = sum(Q(u,c))
- **Given**: Two questions, Q1=0.75, Q2=0.50
- **Result**: PASS (Sum = 1.25)

## Test 4: Amax Calculation
- **Requirement**: Amax(c) = Number of answered questions * 1.0 (assuming max weight 1.0 per question)
- **Given**: 2 questions answered
- **Result**: PASS (Amax = 2.0)

## Test 5: Normalization
- **Requirement**: Normalized = (A(u,c) / Amax(c)) * 100
- **Given**: A=1.25, Amax=2.0
- **Result**: PASS (Normalized = 62.5%)

## Test 6: Missing-Response Handling
- **Requirement**: Omitted questions do not affect Amax or A(u,c).
- **Given**: 20 total questions, only 5 answered.
- **Result**: PASS (Amax = 5.0, sum iterates only over 5 responses)

## Test 7: Ranking by Assessment Score
- **Requirement**: Careers sorted descending by Normalized Score.
- **Given**: C1=62.5, C2=80.0, C3=50.0
- **Result**: PASS (Order: C2, C1, C3)

## Test 8: 70:30 Final Fusion
- **Requirement**: R(u,c) = P * 0.7 + A * 0.3
- **Given**: P=80, A=60
- **Result**: PASS (R = 56 + 18 = 74.0)

## Summary
8/8 Tests Passed. Scoring specification perfectly mirrors the mathematical engine.
