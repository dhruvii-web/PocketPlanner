export const createTrip = ({
  name,
  destination,
  budget,
  days,
  travellers,
  startDate,
}) => ({
  id: Date.now(),
  name,
  destination,
  budget: Number(budget),
  days: Number(days),
  travellers: Number(travellers),
  startDate,

  itinerary: [],

  checklist: {
    passport: false,
    visa: false,
    insurance: false,
    flights: false,
    hotels: false,
  },

  status: "Planning",

  createdAt: new Date().toISOString(),
});