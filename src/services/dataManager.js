import { appData } from "../data/appData";

/* ===========================
   USER
=========================== */

export const getUser = () => appData.user;


/* ===========================
   EXPENSES
=========================== */

export const getExpenses = () => appData.expenses;

export const addExpense = (expense) => {
  appData.expenses.push({
    id: Date.now(),
    ...expense,
  });
};


/* ===========================
   DREAMS (VISIONA)
=========================== */

export const getDreams = () => appData.dreams;

export const addDream = (dream) => {
  appData.dreams.push({
    id: Date.now(),
    ...dream,
  });
};


/* ===========================
   TRIPS (ITENERA)
=========================== */

export const getTrips = () => appData.trips;

export const addTrip = (trip) => {
  appData.trips.push({
    id: Date.now(),
    ...trip,
  });
};


/* ===========================
   SPLITS (DIVIDO)
=========================== */

export const getSplits = () => appData.splits;

export const addSplit = (split) => {
  appData.splits.push({
    id: Date.now(),
    ...split,
  });
};


/* ===========================
   PAYZO
=========================== */

export const getConnections = () =>
  appData.payzo.connections;

export const addConnection = (connection) => {
  appData.payzo.connections.push({
    id: Date.now(),
    ...connection,
  });
};

export const getTransactions = () =>
  appData.payzo.transactions;

export const addTransaction = (transaction) => {
  appData.payzo.transactions.push({
    id: Date.now(),
    ...transaction,
  });
};


/* ===========================
   REMINDERS
=========================== */

export const getReminders = () =>
  appData.reminders;

export const addReminder = (reminder) => {
  appData.reminders.push({
    id: Date.now(),
    ...reminder,
  });
};


/* ===========================
   MY SPACES
=========================== */

export const getSavedSpaces = () =>
  appData.savedSpaces;

export const saveSpace = (space) => {
  appData.savedSpaces.push({
    id: Date.now(),
    ...space,
  });
};


/* ===========================
   NOTES
=========================== */

export const getNotes = () =>
  appData.notes;

export const addNote = (note) => {
  appData.notes.push({
    id: Date.now(),
    ...note,
  });
};


/* ===========================
   CHAT HISTORY
=========================== */

export const getChatHistory = () =>
  appData.chatHistory;

export const addChat = (message) => {
  appData.chatHistory.push({
    id: Date.now(),
    ...message,
  });
};