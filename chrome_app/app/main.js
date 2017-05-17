// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var port = null;


function appendMessage(text) {
    console.log("<Message received>: ", text);
}

function sendNativeMessage() {
    message = {
        "text": document.getElementById('input-text').value
    };
    port.postMessage(message);
    appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
    appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
    console.error("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
}

function connect() {
    var hostName = "com.google.chrome.example.echo";
    console.log("Connecting to native messaging host <b>" + hostName + "</b>")
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
}

document.addEventListener('DOMContentLoaded', function() {
    // console.log('connecting to nativemain');
    // connect();
});
