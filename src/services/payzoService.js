import api from "./api";

const normalizeConnection = (connection) => ({
  ...connection,
  id: connection._id || connection.id,
});

const normalizeTransaction = (transaction) => ({
  ...transaction,
  id: transaction._id || transaction.id,
  timestamp: transaction.timestamp || transaction.createdAt || new Date().toISOString(),
});

export const getPayzoStatus = async () => {
  const { data } = await api.get("/payzo/status");
  return data;
};

export const getConnections = async () => {
  const { data } = await api.get("/payzo/connections");
  return (data.connections || []).map(normalizeConnection);
};

export const createConnection = async (payload) => {
  const { data } = await api.post("/payzo/connections", payload);
  return {
    ...data,
    connection: normalizeConnection(data.connection),
  };
};

export const resendConnectionInvite = async (id) => {
  const { data } = await api.post(`/payzo/connections/${id}/resend`);
  return data;
};

export const deleteConnection = async (id) => {
  await api.delete(`/payzo/connections/${id}`);
};

export const getTransactions = async () => {
  const { data } = await api.get("/payzo/transactions");
  return (data.transactions || []).map(normalizeTransaction);
};

export const createTransaction = async (payload) => {
  const { data } = await api.post("/payzo/transactions", payload);
  return {
    ...data,
    transaction: normalizeTransaction(data.transaction),
  };
};