import { PocketBrain } from "./pocketBrain";

export const calculatePulse = () => {
  const data = PocketBrain();

  return {
    financialScore: 0,

    stage: "Survivor",

    insights: [],

    alerts: [],

    recommendations: [],

    summary: {
      totalExpenses: 0,

      totalSavings: 0,

      activeDreams: data.dreams.length,

      activeTrips: data.trips.length,

      activeSplits: data.splits.length,

      payzoTransactions:
        data.payzo.transactions.length,
    },
  };
};