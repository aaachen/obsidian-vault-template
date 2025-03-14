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

  /**
   * Whether up field array contains a link to file target
   * 
   * @param {*} page - dataview object
   * @param {*} targetfileName - Target
   */
  containsUp(page, targetfileName) {
    if (!Array.isArray(page.up)) {
      return false;
    }
    return page.up.some(l => {
      return this.getFileName(l.path) == targetfileName
    })
  }

  perf(cb) {
    const start = performance.now();
    cb();
    const end = performance.now();
    console.log(`Code block took ${end - start} milliseconds`);
  }

  getFileName(filePath) {
    return filePath.split('/').pop().replace('.md', '')
  }

  wrapInQuoteBlock(str, level) {
    let l = level;
    if (!l) {
      l = 1;
    }
    return '> '.repeat(l) + str.replace(/\n/g, '\n> ');
  }

  getYearFolderPath(year) {
    if (year && year !== moment().year()) {
      return `Calendar/Notes/${year}`;
    }
    return "Calendar/Notes/This Year"
  }

  // returns year: number | undefined
  extractYear(filePath) {
    const parts = filePath.split(/[\/\\]/); // Split by both forward and backward slashes
    const yearIndex = parts.findIndex(part => /^\d{4}$/.test(part) || part.toLowerCase() === 'this year');

    if (yearIndex !== -1) {
      return parts[yearIndex].toLowerCase() === 'this year'
        ? new Date().getFullYear()
        : Number(parts[yearIndex]);
    }
    return null;
  }
}
