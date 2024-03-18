chrome.browserAction.onClicked.addListener(function() {
  // アクティブなタブを取得
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];

    // ページのタイトルと本文を取得
    var title = tab.title;
    var text = document.body.textContent;

    // ファイル名を生成
    var filename = generateUniqueFilename(title);

    // テキストファイルの中身
    var data = new Blob([text], { type: "text/plain;charset=UTF-8" });
    var url = window.URL.createObjectURL(data);

    // ダウンロード処理
    chrome.downloads.download({
      url: url,
      filename: filename,
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        // エラー処理
        console.error(chrome.runtime.lastError.message);
        return;
      }

      // ダウンロード成功時の処理
      console.log("ダウンロードが完了しました: " + downloadId);
    });
  });
});

// ファイル名の重複チェック
function generateUniqueFilename(title) {
  // ファイル名の候補を生成
  var filename = title + ".txt";
  var counter = 1;

  // ファイル名が既に存在するかどうかをチェック
  while (fileExists(filename)) {
    filename = title + "_" + counter + ".txt";
    counter++;
  }

  return filename;
}

// ファイルの存在チェック
function fileExists(filename) {
  // ダウンロードフォルダ内のファイルを検索して、指定されたファイル名が存在するかどうかをチェックする
  let exists = false;
  chrome.downloads.search({filename: filename}, function(results) {
    if (results.length > 0) {
      exists = true;
    }
  });
  return exists;
}

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

// テキストデータをファイルとして保存する関数
function saveTextAsFile(filename, text) {
  // テキストデータをDataURLとしてエンコード
  const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
  
  // DataURLを使用してファイルをダウンロード
  chrome.downloads.download({
    url: dataUrl,
    filename: filename + ".txt" // ファイル名に ".txt" 拡張子を追加
  });
}
