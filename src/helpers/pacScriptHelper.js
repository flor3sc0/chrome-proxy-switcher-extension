function getPacConfig(host, port, whiteList, bypassList, useAnywhere) {
    let pacScriptData = generateDirectScript();

    if (useAnywhere === true) {
        pacScriptData = bypassList.length !== 0
            ? generatePacScriptForBypassList(host, port, bypassList)
            : generatePacScriptForAllDomains(host, port);
    } else if (whiteList.length !== 0) {
        pacScriptData = generatePacScriptForWhiteList(host, port, whiteList);
    }

    return {
        value: {
            mode: 'pac_script',
            pacScript: {
                data: pacScriptData
            }
        },
        scope: 'regular'
    };
}

function generateDirectScript() {
    return `
    function FindProxyForURL(url, host) {
        return "DIRECT";
    }
    `;
}

function generatePacScriptForAllDomains(host, port) {
    return `
    function FindProxyForURL(url, host) {
        return "PROXY ${host}:${port}";
    }
    `;
}

function generatePacScriptForWhiteList(host, port, whiteList) {
    return `
    function FindProxyForURL(url, host) {
        const whiteList = ${JSON.stringify(whiteList)};

        for (var i = 0; i < whiteList.length; i++) {
            if (shExpMatch(host, whiteList[i])) {
                return "PROXY ${host}:${port}";
            }
        }
        return "DIRECT";
    }
    `;
}

function generatePacScriptForBypassList(host, port, bypassList) {
    return `
    function FindProxyForURL(url, host) {
        const bypassList = ${JSON.stringify(bypassList)};

        for (var i = 0; i < bypassList.length; i++) {
            if (shExpMatch(host, bypassList[i])) {
                return "DIRECT";
            }
        }
        return "PROXY ${host}:${port}";
    }
    `;
}
