export const sliceAddress = (address: string, len = 6) => {
  if (!address) return "";
  return `${address.slice(0, len)}...${address.slice(-(len - 1))}`;
};

export const copyToClipBoard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const getInitials = (name: string) => {
  if (!name) return "";
  const nameArr = name.split(" ");
  return `${nameArr[0].charAt(0)}${nameArr[1] ? nameArr[1].charAt(0) : ""}`;
};

export const openInNewTab = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};
