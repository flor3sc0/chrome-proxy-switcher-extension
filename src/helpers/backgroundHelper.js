function parseDomainList(rawValue) {
    if (!rawValue) {
        return [];
    }

    return [...new Set(
        rawValue
            .split(/[\n,]+/)
            .map((domain) => domain.trim())
            .filter(Boolean)
    )];
}

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
