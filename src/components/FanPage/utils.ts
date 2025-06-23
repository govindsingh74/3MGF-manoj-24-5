export const formatWalletAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const extractTweetId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};

export const generateNotificationId = (): string => {
  return Date.now().toString();
};