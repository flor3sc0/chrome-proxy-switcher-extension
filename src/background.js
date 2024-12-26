importScripts('helpers/backgroundHelper.js', 'helpers/pacScriptHelper.js', 'helpers/constants.js');

let intervalId = null;

chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace !== 'local')
        return;

    if (!storageDataProps.some(key => key in changes))
        return;

    chrome.storage.local.get(storageProps, (data) => {
        restartProxyIfActive(data);
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startProxy") {
        chrome.storage.local.get(storageProps, (data) => {
            if (!data.proxyHost || !data.proxyPort) {
                sendResponse({ status: "failure" });
                return;
            }

            startProxy(
                data.proxyHost,
                data.proxyPort,
                data.customWhiteList,
                data.customBlackList,
                data.useAnywhere,
                data.addYbDomains);
            intervalId = startIconSwitcher();
            sendResponse({ status: "success" });
        });
        return true;
    }

    if (request.action === "stopProxy") {
        stopProxy();
        stopIconSwitcher(intervalId);
        sendResponse({ status: "success" });
        return true;
    }

    return false;
});

function startProxy(host, port, customWhiteList, customBlackList, useAnywhere, addYbDomains) {
    const whiteList = buildWhitelist(customWhiteList, addYbDomains);
    const blackList = buildBlacklist(customBlackList);
    config = getPacConfig(host, port, whiteList, blackList, useAnywhere);
    chrome.proxy.settings.set(config, () => { });
    console.log(`Proxy set to: ${host}:${port}`);
}

function stopProxy() {
    chrome.proxy.settings.clear({ scope: "regular" }, () => { });
    console.log("Proxy disabled.");
}

function restartProxyIfActive(data) {
    if (!data.isProxyActive)
        return;

    stopProxy();
    startProxy(
        data.proxyHost,
        data.proxyPort,
        data.customWhiteList,
        data.customBlackList,
        data.useAnywhere,
        data.addYbDomains);
}

chrome.storage.local.get(['isProxyActive'], (data) => {
    if (!data.isProxyActive)
        return;

    intervalId = startIconSwitcher();
});