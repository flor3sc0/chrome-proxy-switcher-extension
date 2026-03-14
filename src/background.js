importScripts('helpers/backgroundHelper.js', 'helpers/pacScriptHelper.js', 'helpers/constants.js');

const RESTART_PROXY_DEBOUNCE_MS = 500;
let restartProxyTimeoutId = null;

chrome.proxy.onProxyError.addListener((details) => {
    console.error('Proxy error:', details);
    chrome.storage.local.set({ proxyError: details.error || 'Unknown proxy error' });
});

chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace !== 'local') {
        return;
    }

    if (!storageDataProps.some((key) => key in changes)) {
        return;
    }

    try {
        const data = await getStorage(storageProps);
        scheduleProxyRestart(data);
    } catch (error) {
        console.error('Error in storage change handler:', error);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startProxy') {
        void handleStartProxy(sendResponse);
        return true;
    }

    if (request.action === 'stopProxy') {
        void handleStopProxy(sendResponse);
        return true;
    }

    if (request.action === 'getProxyState') {
        void handleGetProxyState(sendResponse);
        return true;
    }

    return false;
});

chrome.runtime.onStartup.addListener(() => {
    void syncProxyState();
});

chrome.runtime.onInstalled.addListener(() => {
    void syncProxyState();
});

async function handleStartProxy(sendResponse) {
    try {
        const data = await getStorage(storageProps);
        await startProxy(
            data.proxyHost,
            data.proxyPort,
            data.customWhiteList,
            data.customBlackList,
            data.useAnywhere,
            data.addYbDomains
        );
        sendResponse({ status: 'success' });
    } catch (error) {
        console.error('Error starting proxy:', error);
        sendResponse({ status: 'failure', error: error.message });
    }
}

async function handleStopProxy(sendResponse) {
    try {
        await stopProxy();
        sendResponse({ status: 'success' });
    } catch (error) {
        console.error('Error stopping proxy:', error);
        sendResponse({ status: 'failure', error: error.message });
    }
}

async function handleGetProxyState(sendResponse) {
    try {
        const isActive = await isProxyEnabled();
        await setStorage({ isProxyActive: isActive });
        updateIcon(isActive);
        sendResponse({ status: 'success', isActive });
    } catch (error) {
        console.error('Error getting proxy state:', error);
        sendResponse({ status: 'failure', error: error.message });
    }
}

async function startProxy(host, port, customWhiteList, customBlackList, useAnywhere, addYbDomains) {
    const normalizedHost = validateProxyHost(host);
    const normalizedPort = validateProxyPort(port);
    const whiteList = buildWhitelist(customWhiteList, addYbDomains);
    const blackList = buildBlacklist(customBlackList);
    const config = getPacConfig(normalizedHost, normalizedPort, whiteList, blackList, useAnywhere);

    await setProxySettings(config);
    await setStorage({
        isProxyActive: true,
        proxyError: ''
    });
    updateIcon(true);
    console.log(`Proxy successfully set to: ${normalizedHost}:${normalizedPort}`);
}

async function stopProxy() {
    await clearProxySettings();
    await setStorage({
        isProxyActive: false,
        proxyError: ''
    });
    updateIcon(false);
    console.log('Proxy successfully disabled');
}

async function restartProxyIfActive(data) {
    if (!data.isProxyActive) {
        return;
    }

    try {
        await startProxy(
            data.proxyHost,
            data.proxyPort,
            data.customWhiteList,
            data.customBlackList,
            data.useAnywhere,
            data.addYbDomains
        );
    } catch (error) {
        console.error('Error restarting active proxy:', error);
    }
}

function getStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
    });
}

function setStorage(data) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve();
        });
    });
}

function scheduleProxyRestart(data) {
    if (restartProxyTimeoutId) {
        clearTimeout(restartProxyTimeoutId);
    }

    restartProxyTimeoutId = setTimeout(() => {
        restartProxyTimeoutId = null;
        void restartProxyIfActive(data);
    }, RESTART_PROXY_DEBOUNCE_MS);
}

function setProxySettings(config) {
    return new Promise((resolve, reject) => {
        chrome.proxy.settings.set(config, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve();
        });
    });
}

function clearProxySettings() {
    return new Promise((resolve, reject) => {
        chrome.proxy.settings.clear({ scope: 'regular' }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve();
        });
    });
}

function getProxySettings() {
    return new Promise((resolve) => {
        chrome.proxy.settings.get({ incognito: false }, resolve);
    });
}

async function isProxyEnabled() {
    const details = await getProxySettings();
    return details.levelOfControl !== 'controlled_by_other_extensions'
        && Boolean(details.value)
        && details.value.mode === 'pac_script';
}

async function syncProxyState() {
    try {
        const isActive = await isProxyEnabled();
        await setStorage({ isProxyActive: isActive });
        updateIcon(isActive);
    } catch (error) {
        console.error('Error syncing proxy state:', error);
    }
}

function validateProxyHost(host) {
    const normalizedHost = String(host || '').trim();

    if (!normalizedHost) {
        throw new Error('Proxy host is required');
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(normalizedHost)) {
        throw new Error('Proxy host contains unsupported characters');
    }

    return normalizedHost;
}

function validateProxyPort(port) {
    const normalizedPort = Number.parseInt(String(port || '').trim(), 10);

    if (!Number.isInteger(normalizedPort) || normalizedPort < 1 || normalizedPort > 65535) {
        throw new Error('Proxy port must be a number between 1 and 65535');
    }

    return normalizedPort;
}

void syncProxyState();
