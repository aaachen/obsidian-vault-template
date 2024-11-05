// https://github.com/saml-dev/obsidian-custom-js

class Common {
  // handle dataview behavior, 1 item = not array, n items = array
  toArray(obj) {
    if (!obj) {
      return obj;
    }
    return !Array.isArray(obj) ? [obj] : obj;
  }

  // source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  async sha256(source, len) {
    const sourceBytes = new TextEncoder().encode(source);
    const digest = await crypto.subtle.digest("SHA-256", sourceBytes);
    const resultBytes = [...new Uint8Array(digest)];
    let res = resultBytes
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
    return len ? res.substring(0, len) : res;
  }
}
