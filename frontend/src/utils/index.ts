export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const calculateBudget = (activities: any[]) => {
  return activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
};

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const APP_CONSTANTS = {
  CATEGORIES: [
    'Clothing',
    'Documents',
    'Electronics',
    'Toiletries',
    'Medications',
    'Miscellaneous'
  ],
  ACTIVITY_CATEGORIES: [
    'Sightseeing',
    'Food',
    'Transport',
    'Accommodation',
    'Shopping',
    'Other'
  ]
};
