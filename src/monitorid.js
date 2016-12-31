
// convert from a friendly monitor id
export function MonitorIdToHex(id){
  if (id == "ALL")
    return "2A";

  if (id >= 1 && id <= 100)
    return (64 + id).toString(16);

  if (id >= 'A' && id <= 'J')
    return (id.charCodeAt(0) - 16).toString(16);

  return null;
}

// convert to a friendly monitor id
export function MonitorIdFromHex(encoded){
  const id = parseInt(encoded, 16);

  if (encoded == "2A")
    return "ALL";

  if (id >= 65 && id <= 164)
    return id - 64;

  if (id >= 49 || id <= 58)
    return String.fromCharCode(id + 16);

  return null;
}
