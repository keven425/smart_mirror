// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var port = null;
var STATES = {
    STAND_BY: 'stand_by', // haven't seen face
    DETECTED: 'detected', // saw user's face, prompt user to walk closer
    GREETING: 'greeting', // asks user to smile
    ACTIVATED: 'activated' // displaying weather, news
}
var views = [STATES.STAND_BY, STATES.DETECTED, STATES.GREETING, STATES.ACTIVATED];
var view = STATES.STAND_BY;
var timeout; // change view every 3 seconds

$(document).ready(function() {
    // set up listeners
    $('#reset').click(function() {
        set_view(STATES.STAND_BY);
    });

    // set initial state to standby
    set_view(STATES.DETECTED);

    // connect to native python program
    console.log('connecting to nativemain');
    connect();

});

function connect() {
    var hostName = "com.google.chrome.example.echo";
    console.log("Connecting to native messaging host <b>" + hostName + "</b>")
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
}

function set_view(state) {
    view = state;

    if (state === STATES.STAND_BY ||
        state === STATES.DETECTED) {
        i = Math.floor(Math.random() * jokes.length);
        $('.joke').text(jokes[i]);
    }

    for (var i = 0; i < views.length; i++) {
        $('.' + views[i]).hide();
    }
    $('.' + view).show();

    // timeout = clearTimeout(timeout);
    // if (view === STATES.DETECTED) {
    //     timeout = setTimeout(function() {
    //         set_view(STATES.GREETING);
    //     }, 3000);
    // } else if (view === STATES.GREETING) {
    //     timeout = setTimeout(function() {
    //         set_view(STATES.ACTIVATED);
    //     }, 3000);
    // }
}

function set_circle_size(size) {
    $('.circle').width(size);
    $('.circle').height(size);
}

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
    var action = message && message.action;
    switch (action) {
        case 'face_detected':
            if (view === STATES.STAND_BY) {
                set_view(STATES.DETECTED);
            }
            break;
            // case value2:
            //     break;
            // case valueN:
            //     break;
        default:
            break;
    }
}

function onDisconnected() {
    console.error("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
}
