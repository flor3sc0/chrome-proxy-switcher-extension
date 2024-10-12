importScripts('helpers/backgroundHelper.js');

let allowedDomains = [];
let isProxyActive = false;
let intervalId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startProxy") {
        startProxy(request.host, request.port);
        intervalId = startSwitchIcon();
        sendResponse({ status: "success" });
        return true;
    }

    if (request.action === "stopProxy") {
        stopProxy(request)
        stopIconSwitcher(intervalId);
        sendResponse({ status: "success" });
        return true;
    }

    if (request.action === "saveProxySettings") {
        allowedDomains = request.domains.split(",").map(domain => domain.trim()).filter(Boolean);
        restartProxyIfActive(request)
        sendResponse({ status: "success" });
        return true;
    }

    if (request.action === "getProxyStatus") {
        sendResponse({ status: "success", isActive: isProxyActive });
        return true;
    }

    return false;
});


function startProxy(host, port) {
    config = getPacConfig(host, port, allowedDomains);
    chrome.proxy.settings.set(config, () => { });
    console.log(`Proxy set to: ${host}:${port}`);
    isProxyActive = true;
}

function stopProxy() {
    chrome.proxy.settings.clear({ scope: "regular" }, () => { });
    console.log("Proxy disabled.");
    isProxyActive = false;
}

function restartProxyIfActive(request) {
    if (isProxyActive === false)
        return;

    stopProxy();
    startProxy(request.host, request.port);
}