import { appData } from "../data/appData";

export const buildUserContext = () => {
  return {
    user: appData.user,

    expenses: appData.expenses,

    dreams: appData.dreams,

    trips: appData.trips,

    splits: appData.splits,

    payzo: appData.payzo,

    reminders: appData.reminders,

    savedSpaces: appData.savedSpaces,

    notes: appData.notes,

    chatHistory: appData.chatHistory,
  };
};