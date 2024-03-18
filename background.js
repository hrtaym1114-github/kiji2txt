// コンテキストメニューの作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extractText",
    title: "テキストを抽出",
    contexts: ["all"]
  });
});

// コンテキストメニューがクリックされたときの処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "extractText") {
    if (chrome.scripting && chrome.scripting.executeScript) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: extractPageData
      }, (results) => {
        // 結果の処理
        if (results && results.length > 0) {
          const data = results[0].result;
          if (data) {
            // コンテンツスクリプトにメッセージを送信してタイトルをクリップボードにコピー
            chrome.tabs.sendMessage(tab.id, {action: "copyTitle", text: data.title});
          }
        }
      });
    } else {
      console.error('chrome.scripting.executeScript is not available.');
    }
  }
});

// ページからデータを抽出する関数
function extractPageData() {
  const data = {
    title: document.title,
    body: document.body.innerText
  };
  return data;
}

// テキストデータをファイルとして保存する関数は削除され、
// タイトルをクリップボードにコピーする機能が追加されました。
