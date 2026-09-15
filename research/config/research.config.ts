export interface PathForgeResearchConfig {
    randomSeed: number;
    datasetIdentifiers: {
        esco: string;
        onet: string;
        linkedin: string;
        syntheticStudents: string;
    };
    datasetVersionInformation: string;
    N: number;
    trainEvaluationSplitPolicy: string;
    marketSignalConfiguration: {
        type: "streamed_chunked" | "aggregate";
        temporalSignal: boolean;
    };
    budgetSettings: {
        budgetHours: number;
    };
    plannerSettings: {
        alphaSkill: number;
        betaGoal: number;
        gammaInterest: number;
        deltaMarket: number;
    };
    prerequisiteThreshold: number;
    metricConfiguration: {
        careerMetrics: string[];
        roadmapMetrics: string[];
    };
    bootstrapSettings: {
        enabled: boolean;
        iterations: number;
    };
    baselineConfiguration: {
        B0: string;
        B1: string;
        B2: string;
        B3: string;
        B4: string;
    };
    ablationConfiguration: {
        A0: string;
        A1: string;
    };
    uncertaintyConfiguration: {
        method: string;
        confidenceLevel: number;
    };
    outputDirectories: {
        results: string;
        logs: string;
        metrics: string;
    };
}

export const RESEARCH_CONFIG: PathForgeResearchConfig = {
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
