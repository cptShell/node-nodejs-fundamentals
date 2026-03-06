const PLUGIN_NOT_FOUND = "Plugin not found";
const ERROR_CODE = 1;

const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.error(PLUGIN_NOT_FOUND);
    process.exit(ERROR_CODE);
  }

  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    const result = plugin.run();
    console.log(result);
  } catch {
    console.error(PLUGIN_NOT_FOUND);
    process.exit(ERROR_CODE);
  }
};

await dynamic();
