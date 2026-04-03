export const getLocalDateKey = (isoDate: string) => isoDate.slice(0, 10);

export const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

export const formatDisplayDate = (dateKey: string) =>
  new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${dateKey}T00:00:00`));

export const formatLedgerDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-PH', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  }).format(new Date(isoDate));

export const getRecentDateKeys = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return date.toISOString().slice(0, 10);
  });
