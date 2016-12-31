import { FlattenParameters } from './util';

import adjust from './adjust';
import audio from './audio';
import picture from './picture';
import schedule from './schedule';

export const Parameters = {
  PICTURE: picture,
  ADJUST: adjust,
  AUDIO: audio, 
  SCHEDULE: schedule,

  // TODO remainder
};

export const ParametersFlat = FlattenParameters("", Parameters, {});

export function ParameterFromCodes(page, code){
  if(page === undefined || code === undefined)
    return null;

  for (let key in Object.keys(ParametersFlat)){
    const node = ParametersFlat[key];
    if (node.page == page && node.code == code)
      return {
        key: key,
        value: node
      };
  }

  return null;
}


export function ParameterFromKey(targetKey){
  if(targetKey === undefined)
    return null;

  targetKey = targetKey.toUpperCase();

  for (let key in Object.keys(ParametersFlat)){
    if (key != targetKey)
      continue;

    const node = ParametersFlat[key];
    return {
      key: key,
      value: node
    };
  }

  return null;
}
