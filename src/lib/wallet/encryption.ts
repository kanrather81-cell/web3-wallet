/**
 * 加密工具 - 使用 Web Crypto API
 * 用于加密存储助记词和私钥
 * 
 * ⚠️ 安全警告：此实现仅用于测试目的，不适合生产环境
 */

/**
 * 加密数据结构
 */
export interface EncryptedData {
  ciphertext: string; // Base64 编码的密文
  iv: string; // Base64 编码的初始化向量
  salt: string; // Base64 编码的盐值
}

/**
 * 生成随机盐值
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * 生成随机 IV（初始化向量）
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * 从密码派生加密密钥
 * 使用 PBKDF2 算法，100,000 次迭代
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // 将密码转换为 ArrayBuffer
  const passwordBuffer = new TextEncoder().encode(password);

  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // 使用 PBKDF2 派生密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密数据
 * 使用 AES-GCM 算法
 */
export async function encrypt(
  data: string,
  password: string
): Promise<EncryptedData> {
  try {
    // 生成随机盐值和 IV
    const salt = generateSalt();
    const iv = generateIV();

    // 派生加密密钥
    const key = await deriveKey(password, salt);

    // 将数据转换为 ArrayBuffer
    const dataBuffer = new TextEncoder().encode(data);

    // 加密数据
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      dataBuffer
    );

    // 转换为 Base64 编码
    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
      salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    };
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
}

/**
 * 解密数据
 * 使用 AES-GCM 算法
 */
export async function decrypt(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  try {
    // 从 Base64 解码
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const salt = base64ToArrayBuffer(encryptedData.salt);

    // 派生解密密钥
    const key = await deriveKey(password, new Uint8Array(salt));

    // 解密数据
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv),
      },
      key,
      ciphertext
    );

    // 转换为字符串
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('密码错误或数据损坏');
  }
}

/**
 * 验证密码强度
 * 返回强度等级：weak, medium, strong
 */
export function validatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
  score: number;
} {
  let score = 0;
  const messages: string[] = [];

  // 长度检查
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  else if (password.length < 8) {
    messages.push('密码至少需要 8 个字符');
  }

  // 包含小写字母
  if (/[a-z]/.test(password)) score += 1;
  else messages.push('需要包含小写字母');

  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 1;
  else messages.push('需要包含大写字母');

  // 包含数字
  if (/[0-9]/.test(password)) score += 1;
  else messages.push('需要包含数字');

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else messages.push('建议包含特殊字符');

  // 判断强度
  let strength: 'weak' | 'medium' | 'strong';
  let message: string;

  if (score < 4) {
    strength = 'weak';
    message = messages.join('，');
  } else if (score < 6) {
    strength = 'medium';
    message = '密码强度中等，建议增强';
  } else {
    strength = 'strong';
    message = '密码强度良好';
  }

  return { strength, message, score };
}

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
