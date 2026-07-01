import { expenseData } from "./expenseData";
import { tripData } from "./tripData";
import { dreamData } from "./dreamData";
import { payzoData } from "./payzoData";
import { userData } from "./userData";

export const generateInsights = () => {
  const insights = [];

  // FOOD
  if (expenseData.foodSpendingChange > 20) {
    insights.push({
      icon: "🍔",
      title: "Food spending increased",
      message:
        "You spent more on food this week. Try limiting outside meals.",
    });
  }

  // INACTIVITY
  if (userData.inactiveDays >= 2) {
    insights.push({
      icon: "⏳",
      title: "Update reminder",
      message:
        "You haven’t updated finances in 2 days.",
    });
  }

  // DREAMS
  dreamData.forEach((dream) => {
    const percent =
      (dream.savedAmount / dream.targetAmount) * 100;

    if (percent > 30) {
      insights.push({
        icon: "🎯",
        title: `${dream.name} progress`,
        message: `You're ${Math.floor(
          percent
        )}% closer to your dream.`,
      });
    }
  });

  // DIVIDO - Splitwise-like expense splitting
  payzoData.forEach((payment) => {
    if (payment.status === "pending") {
      insights.push({
        icon: "👥",
        title: "Divido update",
        message:
          payment.type === "they_owe_you"
            ? `${payment.person} owes you ₹${payment.amount} (split expense)`
            : `You owe ${payment.person} ₹${payment.amount} (split expense)`,
      });
    }
  });

  // TRIP
  tripData.forEach((trip) => {
    if (trip.destination === "USA") {
      insights.push({
        icon: "✈️",
        title: "Trip update",
        message:
          "USA visa costs may increase. Revisit your trip budget.",
      });
    }
  });

  return insights;
};