import { userData } from "../data/userData";

export const buildUserContext = () => {
  return {
    progress: userData.progress,
    financialStage: userData.stage,

    stats: userData.stats,

    savings: userData.savings || 0,
    monthlyIncome: userData.monthlyIncome || 0,

    dreams: userData.dreams || [],
    trips: userData.trips || [],
    payzo: userData.payzo || [],
  };
};