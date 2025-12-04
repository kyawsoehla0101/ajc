export const LOCATION_CHOICES = [
  { value: "MO", label: "MRAUK-U" },
  { value: "MB", label: "MINBRAR" },
  { value: "SIT", label: "SITTWE" },
  { value: "RD", label: "RETHEEDAUNG" },
  { value: "MD", label: "MAUNGDAW" },
  { value: "KP", label: "KYAWTPYHU" },
  { value: "TD", label: "THANDWE" },
  { value: "TG", label: "TOUNGUP" },
  { value: "AN", label: "ANN" },
  { value: "PNG", label: "PONNAGYUN" },
  { value: "KT", label: "KYAUKTAW" },
  { value: "RM", label: "RAMREE" },
  { value: "MA", label: "MANAUNG" },
  { value: "GW", label: "GWA" },
  { value: "PT", label: "PAUKTAW" },
  { value: "BTD", label: "BUTHIDAUNG" },
  { value: "MBN", label: "MYEBON" },
];

export const getLocationLabel = (value) => {
  const loc = LOCATION_CHOICES.find((l) => l.value === value);
  return loc ? loc.label : value;
};
