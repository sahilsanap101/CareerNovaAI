# Limitations

- The evaluation is strictly based on a **synthetic evaluation only**.
- There has been **no human validation**, meaning the system has not been tested on real students or evaluated by human experts.
- The results are subject to **synthetic generator assumptions**.
- The evaluation was constrained to a **15-career evaluation subset** rather than the full 60+ career catalog.
- The **deterministic heuristic limitations** are severe; linear combination of predefined feature extractors heavily restricts accuracy.
- The **newly introduced Assessment v1** has predefined manual weighting assumptions that have not been dynamically optimized.
- There is a clear **semantic matching brittleness** in how strings are extracted and scored.
- There is an **absence of expert/longitudinal validation** regarding whether recommended paths actually result in career success.
- There is **limited evidence for skill-gap effectiveness** and **limited evidence for roadmap effectiveness**, as these downstream features rely on the accuracy of the primary suitability ranking which is currently flawed.
- The **controlled benchmark does not establish generalization** to complex, noisy real-world data environments.
