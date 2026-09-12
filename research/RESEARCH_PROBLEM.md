# Core Research Problem

Modern career recommendation systems frequently operate in open-loop, unconstrained environments. They recommend target roles based on static matching of a student's profile to idealized careers but fail to provide a systematic, algorithmically rigorous path to acquire missing skills while honoring real-world constraints.

The core research problem addressed by this framework is the challenge of **dynamic, multi-constrained skill planning in a shifting labor market**.

We address the problem wherein a student seeks to optimize their learning trajectory toward a target career. Resolving this trajectory requires concurrently harmonizing a combination of disparate constraints that are typically treated as isolated subsystems in existing literature. 

Specifically, the system must navigate:
1. The student's current skill deficiencies relative to a target career.
2. The intrinsic importance of specific skills for that target career.
3. The extrinsic labor-market demand for those skills at the current time.
4. The rigid prerequisite relationships dictating the valid learning sequence of technical concepts.
5. The finite temporal/cognitive budget available to the student.

By framing this as a dynamic resource-allocation and sequence-optimization problem under uncertainty, rather than a static recommendation problem, we address the systemic failure of traditional open-loop learning roadmaps that degrade when the user's proficiency or market conditions fluctuate.
