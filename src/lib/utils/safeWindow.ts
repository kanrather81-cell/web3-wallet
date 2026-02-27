/**
 * 安全读取 `window` 上的属性，防止某些注入脚本在 getter 中抛出异常
 */
export function getSafeWindowProp<T = any>(key: string): T | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    // 保护性读取属性
     
    return (window as any)[key];
  } catch (e) {
     
    console.warn(`getSafeWindowProp: failed to read window.${key}`, e);
    return undefined;
  }
}

export default getSafeWindowProp;
