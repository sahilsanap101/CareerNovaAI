# Adaptive Learning & Career Execution System Specification

## 1. System Overview
The **PathForge Adaptive Learning Engine** converts static skill requirements into an active, self-optimizing career execution roadmap. It continuously adapts study workload, reschedules missed tasks, updates prerequisite trees, and calculates a real-time **Career Readiness Score**.

---

## 2. Skill Dependency Engine Rules

The engine uses a Directed Acyclic Graph (DAG) to enforce prerequisite ordering:

- **Web Development**: $\text{HTML} \rightarrow \text{CSS} \rightarrow \text{JavaScript} \rightarrow \text{TypeScript} \rightarrow \text{React} / \text{Angular} / \text{Vue}$
- **Backend Engineering**: $\text{JavaScript} \rightarrow \text{Node.js} \rightarrow \text{Express} \rightarrow \text{PostgreSQL}$; $\text{Java} \rightarrow \text{Spring Boot}$
- **Cloud & DevOps**: $\text{Linux} \rightarrow \text{Networking} \rightarrow \text{Docker} \rightarrow \text{Kubernetes} \rightarrow \text{AWS} / \text{Azure} / \text{GCP}$
- **AI & Data Science**: $\text{Python} \rightarrow \text{Machine Learning} \rightarrow \text{TensorFlow} / \text{PyTorch}$
- **Cyber Security**: $\text{Linux} \rightarrow \text{Networking} \rightarrow \text{Wireshark} / \text{Burp Suite} \rightarrow \text{Metasploit}$

---

## 3. Career Readiness Score Formula

The **Career Readiness Score** $R \in [0, 100]$ measures job readiness:

$$R = S_{\text{prof}} + P_{\text{proj}} + C_{\text{cert}} + M_{\text{road}}$$

Where:
- $S_{\text{prof}} = (\text{AvgProficiency} / 5) \times 40$ (Max 40 pts)
- $P_{\text{proj}} = \min(25, \text{ProjectsCount} \times 8.5)$ (Max 25 pts)
- $C_{\text{cert}} = \min(15, \text{CertificationsCount} \times 7.5)$ (Max 15 pts)
- $M_{\text{road}} = (\text{RoadmapCompletionPct} / 100) \times 20$ (Max 20 pts)

---

## 4. Smart Rescheduling & Pace Adjustment
- **Learning Pace**:
  - `FAST`: 20 Hours / Week (Multiplier: 0.75x)
  - `MEDIUM`: 10 Hours / Week (Multiplier: 1.0x)
  - `SLOW`: 5 Hours / Week (Multiplier: 1.5x)
- **Non-Destructive Regeneration**: When learning pace or target career goal changes, a new roadmap version ($v1 \rightarrow v2 \rightarrow v3$) is created without deleting completed user task history.
