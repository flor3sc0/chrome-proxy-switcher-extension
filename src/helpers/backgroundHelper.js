function buildWhitelist(customWhiteList) {
    return parseDomainList(customWhiteList);
}

function buildBypassList(customBypassList) {
    return parseDomainList(customBypassList);
}

function updateIcon(isProxyActive) {
    const path = isProxyActive === true ? activeIconPath : inactiveIconPath;
    chrome.action.setIcon({ path });
}
