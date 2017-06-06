// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var port = null;
var STATES = {
    STAND_BY: 'stand_by', // haven't seen face
    DETECTED: 'detected', // saw user's face, ask to walk closer/further
    ENTERTAIN: 'entertain', // display joke until smile
    ACTIVATED: 'activated' // displaying weather, news
}
var views = [STATES.STAND_BY, STATES.DETECTED, STATES.ENTERTAIN, STATES.ACTIVATED];
var view = STATES.STAND_BY;

var GREETING_MS = 5000;
var JOKE_INTERVAL_MS = 10000;
joke_index = 0;
joke_t = null; // change joke every 6 seconds

var PROPER_DISTANCE = 400.;
var FURTHEST_DISTANCE = 1000.;
var DISTANCE_THRESH = 50.;


$(document).ready(function() {
    // set up listeners
    $('#reset').click(function() {
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

    if (state === STATES.ENTERTAIN) {
        // loop thru jokes, one per 6 seconds
        setTimeout(function() {
            display_joke();
            joke_t = setInterval(display_joke, JOKE_INTERVAL_MS);
        }, GREETING_MS);
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
    $('.joke').fadeOut(250, function() {
        // fade in & out
        $('.joke').text(jokes[joke_index]);
        $('.joke').fadeIn(250);
    });
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
            if (view === STATES.ENTERTAIN) {
                set_view(STATES.ACTIVATED);
            }
            break;
        case 'tof_distance':
            if (view === STATES.DETECTED) {
                distance = parseFloat(message.value);
                win_width = window.innerWidth;
                // 600mm: 100% height
                // 1000mm: 0% height
                circle_size = (FURTHEST_DISTANCE - distance) / (FURTHEST_DISTANCE - PROPER_DISTANCE) * win_width;
                set_circle_size(circle_size);

                // if the correct distance, switch to entertainment mode
                var delta_dis = distance - PROPER_DISTANCE;
                if (delta_dis > 0) {
                    // prompt user to move closer
                    $('.move-closer').show();
                    $('.move-further').hide();
                } else {
                    // prompt user to move further
                    $('.move-closer').hide();
                    $('.move-further').show();
                }
                delta_dis_abs = Math.abs(delta_dis);
                if (delta_dis_abs < DISTANCE_THRESH) {
                    set_view(STATES.ENTERTAIN);
                }
            }
            break;
        default:
            break;
    }
}

function onDisconnected() {
    console.error("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
}
