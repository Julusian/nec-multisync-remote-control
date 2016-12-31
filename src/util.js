export function padHex(hex){
  return (hex.length == 1) ? "0" + hex : hex;
}

export function encodeHex(hex){
  hex = padHex(hex);
  let encoded = "";
  
  for(let i=0; i<hex.length; i++){
    encoded += padHex(hex.charCodeAt(i).toString(16));
  }

  return encoded;
}

export function decodeHex(encoded){
  let hex = "";
  
  for(let i=0; i<encoded.length; i+=2){
    const b = encoded.substr(i, 2);
    const c = String.fromCharCode(parseInt(b, 16));

    hex += c;
  }

  return hex;
}