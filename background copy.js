let extractedText = ''; // 抽出されたテキストを保持するための変数

// ページからデータを抽出する関数
function extractPageData() {
    return {title: document.title, text: document.body.innerText};
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "extractTitleAndText") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const tab = tabs[0];
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: extractPageData
            }, (injectionResults) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    return;
                }
                const {title, text} = injectionResults[0].result;
                extractedText = text;
                // ポップアップにタイトルを表示させるための処理は別途ポップアップ側で行います
                chrome.runtime.sendMessage({action: "displayTitle", title: title});
            });
        });
    } else if (request.action === "saveText") {
        const blob = new Blob([extractedText], {type: 'text/plain'});
        const filename = request.title ? request.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_').substring(0, 200) : "test.txt";
        
        saveTextAsFile(blob, filename);
    }
});

// ファイルを保存する関数
function saveTextAsFile(blob, filename) {
    const reader = new FileReader();
    reader.onload = function() {
        chrome.downloads.download({
            url: reader.result,
            filename: filename // 修正: 正しくファイル名を設定
        });
    };
    reader.readAsDataURL(blob);
}
