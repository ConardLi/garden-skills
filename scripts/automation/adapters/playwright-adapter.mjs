export default function createPlaywrightAdapter() {
  return {
    async createSession() {
      // TODO: launch persistent context and reuse login state
    },
    async generate(prompt, options = {}) {
      void options;
      // TODO: automate ChatGPT web UI input and submit prompt
      console.log('[playwright] generate:', prompt);
    },
    async waitForResult() {
      // TODO: wait for image node, download image binary, return buffer
      return { imageBuffer: Buffer.from([]) };
    },
  };
}
