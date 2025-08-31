let api; // Variable en el módulo

export function run(apiInstance) {
  api = apiInstance;
  api.logger.info("[INTERNAL] Module loaded");
}

export { api };
