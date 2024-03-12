chrome.browserAction.onClicked.addListener(function() {
  // アクティブなタブを取得
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];

    // ページのタイトルと本文を取得
    var title = tab.title;
    var text = document.body.textContent;

    // ファイル名をページのタイトルにする
    var filename = title + ".txt";

    // テキストファイルの中身日に本文のテキストを書き込み
    var data = new Blob([text], {type: "text/plain;charset=UTF-8"});
    var url = window.URL.createObjectURL(data);

    // データをローカルに保存
    chrome.downloads.download({
      url: url,
      filename: filename
    });
  });
});