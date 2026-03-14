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

function buildWhitelist(customWhiteList, addYbDomains) {
    const result = parseDomainList(customWhiteList);

    if (addYbDomains === true) {
        result.push(...youtubeDomains);
    }

    return [...new Set(result)];
}

function buildBlacklist(customBlackList) {
    return parseDomainList(customBlackList);
}

function updateIcon(isProxyActive) {
    const path = isProxyActive === true ? activeIconPath : inactiveIconPath;
    chrome.action.setIcon({ path });
}
