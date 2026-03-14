function getPacConfig(host, port, whiteList, blackList, useAnywhere) {
    let pacScriptData = generateDirectScript();

    if (useAnywhere === true) {
        pacScriptData = blackList.length !== 0
            ? generatePacScriptForBlackList(host, port, blackList)
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

function generatePacScriptForBlackList(host, port, blackList) {
    return `
    function FindProxyForURL(url, host) {
        const blackList = ${JSON.stringify(blackList)};

        for (var i = 0; i < blackList.length; i++) {
            if (shExpMatch(host, blackList[i])) {
                return "DIRECT";
            }
        }
        return "PROXY ${host}:${port}";
    }
    `;
}
