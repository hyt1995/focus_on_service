import crypto from "crypto";

// 🌟 토스 전용 GCM 복호화 함수
function decryptTossData(
  encryptedBase64: string | null,
  keyString: string,
  aadString: string
) {
  if (!encryptedBase64) return null;

  try {
    const buffer = Buffer.from(encryptedBase64, "base64");

    // 토스 GCM 규격: 앞 12바이트(IV), 뒤 16바이트(AuthTag), 중간(암호문)
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(buffer.length - 16);
    const ciphertext = buffer.subarray(12, buffer.length - 16);

    // 키와 AAD를 버퍼로 변환
    const key = Buffer.from(keyString, "utf8");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from(aadString, "utf8"));

    let decrypted = decipher.update(ciphertext, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("🚨 복호화 실패:", error);
    return null;
  }
}

export default decryptTossData;
