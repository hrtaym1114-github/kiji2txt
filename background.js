chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const filename = message.title + '.txt';
  const blob = new Blob([message.body], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: filename
  });
});
