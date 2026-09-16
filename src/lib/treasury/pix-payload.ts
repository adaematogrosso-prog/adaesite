type PixPayloadParams = {
  key: string;
  name: string;
  city: string;
  amount?: number;
  txid?: string;
};

function formatEmvField(id: string, value: string) {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

function crc16Ccitt(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function createPixPayload({
  key,
  name,
  city,
  amount,
  txid = "***",
}: PixPayloadParams) {
  const merchantName = name.trim().substring(0, 25).toUpperCase();
  const merchantCity = city.trim().substring(0, 15).toUpperCase();
  const pixKey = key.trim();

  const merchantAccount =
    formatEmvField("00", "BR.GOV.BCB.PIX") + formatEmvField("01", pixKey);

  let payload =
    formatEmvField("00", "01") +
    formatEmvField("26", merchantAccount) +
    formatEmvField("52", "0000") +
    formatEmvField("53", "986") +
    formatEmvField("58", "BR") +
    formatEmvField("59", merchantName) +
    formatEmvField("60", merchantCity);

  if (typeof amount === "number" && amount > 0) {
    payload += formatEmvField("54", amount.toFixed(2));
  }

  payload += formatEmvField("62", formatEmvField("05", txid));
  payload += "6304";

  return payload + crc16Ccitt(payload);
}
