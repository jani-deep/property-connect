/** Mask sensitive numbers shown inside the Law Enforcement panel. */

export const maskPhone = (phone: string) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 4) return "•••• ••••";
  return `+1 (•••) •••-${digits.slice(-4)}`;
};

export const maskSerial = (serial: string) => {
  if (!serial) return "—";
  const visible = serial.slice(-4);
  return `${"•".repeat(Math.max(4, serial.length - 4))}${visible}`;
};

export const maskPin = (pin: string) => {
  if (!pin) return "—";
  const parts = pin.split("-");
  if (parts.length < 2) return `••••${pin.slice(-2)}`;
  return `${parts[0]}-${parts[1]}-••••-${parts[parts.length - 1]}`;
};
