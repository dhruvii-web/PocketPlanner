import api from "./api";

const normalizeAccount = (account) => ({
  ...account,
  id: account._id || account.id,
});

export const getAccounts = async () => {
  const { data } = await api.get("/accounts");
  return (data.accounts || []).map(normalizeAccount);
};

export const createAccount = async (payload) => {
  const { data } = await api.post("/accounts", payload);
  return normalizeAccount(data.account);
};

export const updateAccount = async (id, payload) => {
  const { data } = await api.put(`/accounts/${id}`, payload);
  return normalizeAccount(data.account);
};

export const deleteAccount = async (id) => {
  await api.delete(`/accounts/${id}`);
};