import { buildUserContext } from "./buildUserContext";

export const PocketBrain = () => {
  const context = buildUserContext();

  return {
    user: context.user,

    expenses: context.expenses,

    dreams: context.dreams,

    trips: context.trips,

    splits: context.splits,

    payzo: context.payzo,

    reminders: context.reminders,

    notes: context.notes,

    savedSpaces: context.savedSpaces,
  };
};