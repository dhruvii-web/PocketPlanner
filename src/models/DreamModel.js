export const createDream = ({
  title,
  category,
  targetAmount,
  savedAmount = 0,
  targetDate,
  priority = "Medium",
}) => ({
  id: Date.now(),
  title,
  category,
  targetAmount: Number(targetAmount),
  savedAmount: Number(savedAmount),
  targetDate,
  priority,
  progress: 0,
  status: "In Progress",
  createdAt: new Date().toISOString(),
});