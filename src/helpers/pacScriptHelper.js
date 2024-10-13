function getPacConfig(host, port, allowedDomains, useAnywhere) {
    let pacScriptData = generatePacScriptForAllDomains(host, port);

    if (useAnywhere === false && allowedDomains.length !== 0) {
        pacScriptData = generatePacScriptForOnlyAllowedDomains(host, port, allowedDomains);
    }

    return {
        value: {
            mode: "pac_script",
            pacScript: {
                data: pacScriptData
            }
        },
        scope: "regular"
    }
}

function generatePacScriptForAllDomains(host, port) {
    return `
    function FindProxyForURL(url, host) {
        return "PROXY ${host}:${port}";
    }
    `;
}

function generatePacScriptForOnlyAllowedDomains(host, port, allowedDomains) {
    return `
    function FindProxyForURL(url, host) {
        const allowedDomains = ${JSON.stringify(allowedDomains)};

        for (var i = 0; i < allowedDomains.length; i++) {
            if (shExpMatch(host, allowedDomains[i])) {
                return "PROXY ${host}:${port}";
            }
        }
        return "DIRECT";
    }
    `;
}