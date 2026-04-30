export default function createOpenCliAdapter() {
  return {
    async createSession() {
      // TODO: initialize OpenCLI session / auth context
    },
    async generate(prompt, options = {}) {
      void options;
      // TODO: send prompt to ChatGPT Web via OpenCLI
      console.log('[opencli] generate:', prompt);
    },
    async waitForResult() {
      // TODO: fetch/download generated image from conversation output
      return { imageBuffer: Buffer.from([]) };
    },
  };
}
