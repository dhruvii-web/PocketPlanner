export const createSplit = ({
  groupName,
  members = [],
}) => ({
  id: Date.now(),

  groupName,

  members,

  expenses: [],

  settlements: [],

  createdAt: new Date().toISOString(),
});