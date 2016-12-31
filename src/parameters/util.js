export function FlattenParameters(key, tree, result){
  if(tree.page || tree.code || tree.type)
    return result[key] = tree;

  if(key.length > 0)
    key += ".";

  for(let i in tree){
    FlattenParameters(key + i, tree[i], result);
  }

  return result;
}