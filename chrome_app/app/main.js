// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var port = null;
var STATES = {
    STAND_BY: 'stand_by', // haven't seen face
    DETECTED: 'detected', // saw user's face, display joke until smile
    ACTIVATED: 'activated' // displaying weather, news
}
var views = [STATES.STAND_BY, STATES.DETECTED, STATES.ACTIVATED];
var view = STATES.STAND_BY;
joke_index = 0;
joke_t = null; // change joke every 6 seconds


$(document).ready(function() {
    // set up listeners
    $('#reset').click(function() {
        display_joke();
        set_view(STATES.STAND_BY);
    });

    // set initial state to standby
    set_view(STATES.STAND_BY);

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
    console.log('connection successful');
}

function set_view(state) {
    view = state;

    if (state === STATES.DETECTED) {
        display_joke();
        // loop thru jokes, one per 6 seconds
        joke_t = setInterval(display_joke, 6000);
    } else if (joke_t) {
        // reset interval
        clearInterval(joke_t);
    }

    for (var i = 0; i < views.length; i++) {
        $('.' + views[i]).hide();
    }
    $('.' + view).show();
}

function set_circle_size(size) {
    $('.circle').width(size);
    $('.circle').height(size);
}

function display_joke() {
    joke_index = Math.floor(Math.random() * jokes.length);
    $('.joke').text(jokes[joke_index]);
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
        case 'smile_detected':
            if (view === STATES.DETECTED) {
                set_view(STATES.ACTIVATED);
            }
            break;
        case 'tof_distance':
            if (view === STATES.DETECTED) {
                distance = parseFloat(message.value);
                win_width = window.innerWidth;
                // 600mm: 100% height
                // 1000mm: 0% height
                circle_size = (1000. - distance) / 400. * win_width;
                console.log(circle_size);
                set_circle_size(circle_size);
            }
            break;
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
