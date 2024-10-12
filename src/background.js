importScripts('helpers/backgroundHelper.js');

const storageDataProps = ['proxyHost', 'proxyPort', 'allowedDomains'];
const storageProps = [...storageDataProps, 'isProxyActive'];

let allowedDomains = [];
let intervalId = null;

chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace !== 'local')
        return;

    if (!storageDataProps.some(key => key in changes))
        return;

    chrome.storage.local.get(storageProps, (data) => {
        if (!data.isProxyActive)
            return;

        chrome.storage.local.get(storageDataProps, (items) => {
            restartProxyIfActive(items);
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startProxy") {
        chrome.storage.local.get(storageProps, (data) => {
            if (!data.proxyHost || !data.proxyPort) {
                sendResponse({ status: "failure" });
                return;
            }

            startProxy(data.proxyHost, data.proxyPort, data.allowedDomains);
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

function startProxy(host, port, allowedDomains) {
    const splitedAllowedDomains = allowedDomains.split(",").map(domain => domain.trim()).filter(Boolean);
    config = getPacConfig(host, port, splitedAllowedDomains);
    chrome.proxy.settings.set(config, () => { });
    console.log(`Proxy set to: ${host}:${port}`);
}

function stopProxy() {
    chrome.proxy.settings.clear({ scope: "regular" }, () => { });
    console.log("Proxy disabled.");
}

function restartProxyIfActive(data) {
    stopProxy();
    startProxy(data.host, data.port, data.allowedDomains);
}

chrome.storage.local.get(['isProxyActive'], (data) => {
    if (!data.isProxyActive)
        return;

    intervalId = startIconSwitcher();
});