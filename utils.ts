
export const generateId = (): string => {
  return crypto.randomUUID();
};

export const getHostname = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch (e) {
    return 'unknown';
  }
};

export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return 'https://picsum.photos/64/64';
  }
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  }).format(new Date(timestamp));
};

export const getMonthYear = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date(timestamp));
};
