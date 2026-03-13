importScripts('helpers/backgroundHelper.js', 'helpers/pacScriptHelper.js', 'helpers/constants.js');

let intervalId = null;

// Добавляем обработчик ошибок прокси
chrome.proxy.onProxyError.addListener((details) => {
    console.error('Proxy error:', details);
    chrome.storage.local.set({ proxyError: details.error });
});

chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace !== 'local')
        return;

    if (!storageDataProps.some(key => key in changes))
        return;

    try {
        const data = await chrome.storage.local.get(storageProps);
        restartProxyIfActive(data);
    } catch (error) {
        console.error('Error in storage change handler:', error);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startProxy") {
        chrome.storage.local.get(storageProps, (data) => {
            if (!data.proxyHost || !data.proxyPort) {
                console.error('Proxy configuration is incomplete');
                sendResponse({ status: "failure", error: "Proxy configuration is incomplete" });
                return;
            }

            try {
                startProxy(
                    data.proxyHost,
                    data.proxyPort,
                    data.customWhiteList,
                    data.customBlackList,
                    data.useAnywhere,
                    data.addYbDomains);
                intervalId = startIconSwitcher();
                sendResponse({ status: "success" });
            } catch (error) {
                console.error('Error starting proxy:', error);
                sendResponse({ status: "failure", error: error.message });
            }
        });
        return true;
    }

    if (request.action === "stopProxy") {
        try {
            stopProxy();
            stopIconSwitcher(intervalId);
            sendResponse({ status: "success" });
        } catch (error) {
            console.error('Error stopping proxy:', error);
            sendResponse({ status: "failure", error: error.message });
        }
        return true;
    }

    return false;
});

function startProxy(host, port, customWhiteList, customBlackList, useAnywhere, addYbDomains) {
    try {
        const whiteList = buildWhitelist(customWhiteList, addYbDomains);
        const blackList = buildBlacklist(customBlackList);
        const config = getPacConfig(host, port, whiteList, blackList, useAnywhere);
        
        chrome.proxy.settings.set(config, () => {
            if (chrome.runtime.lastError) {
                console.error('Error setting proxy:', chrome.runtime.lastError);
                throw new Error(chrome.runtime.lastError.message);
            }
            console.log(`Proxy successfully set to: ${host}:${port}`);
            console.log('Whitelist:', whiteList);
            console.log('Blacklist:', blackList);
        });
    } catch (error) {
        console.error('Error in startProxy:', error);
        throw error;
    }
}

function stopProxy() {
    try {
        chrome.proxy.settings.clear({ scope: "regular" }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing proxy:', chrome.runtime.lastError);
                throw new Error(chrome.runtime.lastError.message);
            }
            console.log("Proxy successfully disabled");
        });
    } catch (error) {
        console.error('Error in stopProxy:', error);
        throw error;
    }
}

function restartProxyIfActive(data) {
    if (!data.isProxyActive)
        return;

    try {
        stopProxy();
        startProxy(
            data.proxyHost,
            data.proxyPort,
            data.customWhiteList,
            data.customBlackList,
            data.useAnywhere,
            data.addYbDomains);
    } catch (error) {
        console.error('Error in restartProxyIfActive:', error);
    }
}

// Инициализация при запуске расширения
chrome.storage.local.get(['isProxyActive'], (data) => {
    if (!data.isProxyActive)
        return;

    try {
        intervalId = startIconSwitcher();
    } catch (error) {
        console.error('Error starting icon switcher:', error);
    }
});