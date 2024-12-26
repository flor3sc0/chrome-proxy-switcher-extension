function getPacConfig(host, port, whiteList, blackList, useAnywhere) {
    let pacScriptData = generatePacScriptForAllDomains(host, port);

    if (useAnywhere === false && whiteList.length !== 0) {
        pacScriptData = generatePacScriptForWhiteList(host, port, whiteList);
    }

    if (useAnywhere === true && blackList.length !== 0) {
        pacScriptData = generatePacScriptForBlackList(host, port, blackList);
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