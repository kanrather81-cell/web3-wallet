// Crypto polyfill for OKX SDK
// 浏览器的 window.crypto 是只读的,不能直接替换
// 我们需要在 globalThis 上添加 randomBytes 方法

// @ts-ignore - crypto-browserify doesn't have types
import { randomBytes } from 'crypto-browserify';

// 确保 globalThis.crypto 存在(浏览器中已存在)
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {};
}

// 添加 randomBytes 方法到 crypto 对象
// 注意:不能直接赋值给 window.crypto,因为它是只读的
// 但可以添加属性到现有的 crypto 对象
if (!(globalThis.crypto as any).randomBytes) {
  try {
    Object.defineProperty(globalThis.crypto, 'randomBytes', {
      value: randomBytes,
      writable: false,
      configurable: true,
      enumerable: false,
    });
  } catch (error) {
    // 如果无法定义属性,尝试直接赋值
    (globalThis.crypto as any).randomBytes = randomBytes;
  }
}

// 同时确保 Buffer 和 process 全局可用
import { Buffer } from 'buffer';
import process from 'process';

if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = process;
}

// 导出以便其他模块使用
export { randomBytes };
