function extractText() {
  // content.jsにメッセージを送信
  chrome.tabs.sendMessage(activeTab.id, "extractText");
}