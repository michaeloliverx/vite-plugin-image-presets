// https://github.com/rollup/rollup/blob/master/src/utils/renderNamePattern.ts
export function renderNamePattern(
  pattern: string,
  replacements: { [name: string]: string }
): string {
  return pattern.replace(/\[(\w+)\]/g, (_substring, type) => {
    if (!Object.prototype.hasOwnProperty.call(replacements, type)) {
      throw new Error(`"[${type}]" is not a valid placeholder in "${pattern}" pattern.`);
    }
    return replacements[type];
  });
}
