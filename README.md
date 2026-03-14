# Chrome Proxy Switcher Extension

Small Chrome extension for switching a proxy on and off from the toolbar popup.

## What it does

- Sets a proxy server through the Chrome `proxy` API
- Supports a whitelist mode where only selected domains go through the proxy
- Supports a global mode where everything goes through the proxy except a blacklist
- Can add a built-in list of YouTube-related domains to the whitelist
- Stores settings in `chrome.storage.local`

## Project structure

- `manifest.json` - extension manifest
- `src/background.js` - proxy lifecycle and state synchronization
- `src/popup.html` - popup markup
- `src/popup.js` - popup interactions and validation
- `src/helpers/pacScriptHelper.js` - PAC script generation
- `src/helpers/backgroundHelper.js` - list parsing and icon updates

## Notes

- Whitelist and blacklist accept commas and new lines as separators.
- If whitelist mode is selected and the whitelist is empty, traffic stays `DIRECT`.
- The popup synchronizes its toggle with the actual Chrome proxy state on load.
