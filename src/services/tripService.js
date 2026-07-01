import api from "./api";

const normalizeTrip = (trip) => ({
  ...trip,
  id: trip._id || trip.id,
});

const normalizeMessage = (message) => ({
  ...message,
  id: message._id || message.id,
});

export const getTrips = async () => {
  const { data } = await api.get("/trips");
  return (data.trips || []).map(normalizeTrip);
};

export const createTrip = async (payload) => {
  const { data } = await api.post("/trips", payload);
  return {
    ...data,
    trip: normalizeTrip(data.trip),
    invites: data.invites || [],
  };
};

export const updateTrip = async (id, payload) => {
  const { data } = await api.put(`/trips/${id}`, payload);
  return normalizeTrip(data.trip);
};

export const deleteTrip = async (id) => {
  await api.delete(`/trips/${id}`);
};

export const inviteTripMembers = async (id, payload) => {
  const { data } = await api.post(`/trips/${id}/invite`, payload);
  return data;
};

export const getTripMessages = async (id) => {
  const { data } = await api.get(`/trips/${id}/messages`);
  return (data.messages || []).map(normalizeMessage);
};

export const sendTripMessage = async (id, payload) => {
  const { data } = await api.post(`/trips/${id}/messages`, payload);
  return normalizeMessage(data.message);
};

export const askPocketGuide = async (id, prompt) => {
  const { data } = await api.post(`/trips/${id}/guide`, { prompt });
  return data.response;
};