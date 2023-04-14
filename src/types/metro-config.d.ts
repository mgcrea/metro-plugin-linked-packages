declare module "metro-config/src/defaults/exclusionList" {
  declare function exclusionList(list: RegExp | RegExp[]): RegExp[];
  export default exclusionList;
}
