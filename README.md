# Dynamic Context Pruning Plugin

[![npm version](https://img.shields.io/npm/v/@tarquinen/opencode-dcp.svg)](https://www.npmjs.com/package/@tarquinen/opencode-dcp)

Automatically reduces token usage in OpenCode by removing obsolete tool outputs from conversation history.

## What It Does

When your OpenCode session becomes idle, this plugin analyzes your conversation and identifies tool outputs that are no longer relevant (superseded file reads, old errors that were fixed, exploratory searches, etc.). These obsolete outputs are pruned from future requests to save tokens and reduce costs.

## Installation

Add to your OpenCode configuration:

**Global:** `~/.config/opencode/opencode.json`  
**Project:** `.opencode/opencode.json`

```json
{
  "plugin": [
    "@tarquinen/opencode-dcp"
  ]
}
```

Restart OpenCode. The plugin will automatically start optimizing your sessions.

## Configuration

The plugin creates a configuration file at `~/.config/opencode/dcp.jsonc` on first run. You can edit this file to customize the plugin's behavior.

```jsonc
{
  // Enable or disable the Dynamic Context Pruning plugin
  "enabled": true,

  // Enable debug logging to ~/.config/opencode/logs/dcp/YYYY-MM-DD.log
  "debug": false,

  // List of tools that should never be pruned from context
  // The 'task' tool is protected by default to preserve subagent coordination
  "protectedTools": ["task"]
}
```

### Configuration Options

- **`enabled`** (boolean, default: `true`)  
  Enable or disable the plugin without removing it from your OpenCode configuration.

- **`debug`** (boolean, default: `false`)  
  Enable detailed debug logging. Logs are written to `~/.config/opencode/logs/dcp/YYYY-MM-DD.log`.

- **`protectedTools`** (string[], default: `["task"]`)  
  List of tool names that should never be pruned from context. The `task` tool is protected by default to ensure subagent coordination works correctly.

After modifying the configuration, restart OpenCode for changes to take effect.

OpenCode automatically installs plugins from npm to `~/.cache/opencode/node_modules/`. To force an update to the latest version:

```bash
cd ~/.cache/opencode
rm -rf node_modules/@tarquinen
sed -i.bak '/"@tarquinen\/opencode-dcp"/d' package.json
```

Then restart OpenCode, and it will automatically install the latest version.

To check your current version:

```bash
cat ~/.cache/opencode/node_modules/@tarquinen/opencode-dcp/package.json | grep version
```

To check the latest available version:

```bash
npm view @tarquinen/opencode-dcp version
```

### Version Pinning

If you want to ensure a specific version is always used, you can pin it in your config:

```json
{
  "plugin": [
    "@tarquinen/opencode-dcp@0.1.11"
  ]
}
```

## License

MIT
