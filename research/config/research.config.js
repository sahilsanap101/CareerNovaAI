"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESEARCH_CONFIG = void 0;
exports.RESEARCH_CONFIG = {
    randomSeed: 42,
    datasetIdentifiers: {
        esco: "v1_streamed",
        onet: "v2023_streamed",
        linkedin: "aggregate_market_signal",
        syntheticStudents: "student_baseline_01"
    },
    datasetVersionInformation: "v1.0",
    N: 500,
    trainEvaluationSplitPolicy: "80_20_stratified",
    marketSignalConfiguration: {
        type: "aggregate",
        temporalSignal: false
    },
    budgetSettings: {
        budgetHours: 40
    },
    plannerSettings: {
        alphaSkill: 0.3,
        betaGoal: 0.2,
        gammaInterest: 0.1,
        deltaMarket: 0.4
    },
    prerequisiteThreshold: 0.75,
    metricConfiguration: {
        careerMetrics: ["alignment_score", "market_fit"],
        roadmapMetrics: ["feasibility_rate", "cost_efficiency"]
    },
    bootstrapSettings: {
        enabled: true,
        iterations: 1000
    },
    baselineConfiguration: {
        B0: "implemented_heuristic",
        B1: "implemented_market_aware",
        B2: "defined_but_unverified",
        B3: "implemented_constrained_planner",
        B4: "partial_closed_loop_replanner"
    },
    ablationConfiguration: {
        A0: "mocked",
        A1: "mocked"
    },
    uncertaintyConfiguration: {
        method: "monte_carlo",
        confidenceLevel: 0.95
    },
    outputDirectories: {
        results: "research/final_results",
        logs: "research/logs",
        metrics: "research/evaluation/metrics"
    }
};
