function parseDomainList(rawValue) {
    if (!rawValue) {
        return [];
    }

    return [...new Set(
        rawValue
            .split(/[\n,]+/)
            .map((entry) => entry.trim())
            .filter(Boolean)
    )];
}

function normalizeDomainForWhitelist(hostname) {
    if (hostname.startsWith('www.')) {
        return `*.${hostname.slice(4)}`;
    }

    return hostname;
}
