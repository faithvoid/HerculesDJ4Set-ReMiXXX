function HerculesDJ4Set() {}

HerculesDJ4Set.hotcueLEDs = {
    "Channel1": {
        1: 0x01, // MIDI note number for hotcue 1 LED on Channel 1
        2: 0x02, // MIDI note number for hotcue 1 LED on Channel 1
        3: 0x03, // MIDI note number for hotcue 1 LED on Channel 1
        4: 0x07, // MIDI note number for hotcue 1 LED on Channel 1
        5: 0x08, // MIDI note number for hotcue 1 LED on Channel 1
        6: 0x09, // MIDI note number for hotcue 1 LED on Channel 1
    },
    "Channel2": {
        1: 0x21, // MIDI note number for hotcue 1 LED on Channel 2
        2: 0x22, // MIDI note number for hotcue 1 LED on Channel 2
        3: 0x23, // MIDI note number for hotcue 1 LED on Channel 2
        4: 0x27, // MIDI note number for hotcue 1 LED on Channel 2
        5: 0x28, // MIDI note number for hotcue 1 LED on Channel 2
        6: 0x29, // MIDI note number for hotcue 1 LED on Channel 2
    }
};

HerculesDJ4Set.pitchBendLED = function (group) {
    var deck = script.deckFromGroup(group);
    var pitch = engine.getValue(group, 'pitch');
    var pitchBendMinusLED = (deck === 1) ? 0x1D : 0x43; // Assuming MIDI note for Pitch Bend Minus LED
    var pitchBendPlusLED = (deck === 1) ? 0x1E : 0x44; // Assuming MIDI note for Pitch Bend Plus LED

    if (pitch < 0) {
        midi.sendShortMsg(0x90, pitchBendMinusLED, 0x7F);
        midi.sendShortMsg(0x90, pitchBendPlusLED, 0x00);
    } else if (pitch > 0) {
        midi.sendShortMsg(0x90, pitchBendPlusLED, 0x7F);
        midi.sendShortMsg(0x90, pitchBendMinusLED, 0x00);
    } else {
        midi.sendShortMsg(0x90, pitchBendPlusLED, 0x00);
        midi.sendShortMsg(0x90, pitchBendMinusLED, 0x00);
    }
};

HerculesDJ4Set.updateFastRewindLED = function (group, value) {
    var deck = script.deckFromGroup(group);
    var fastRewindLED = (deck === 1) ? 0x1F : 0x45; // Assuming MIDI note for Fast Rewind LED
    if (value === 0x7F) {
        midi.sendShortMsg(0x90, fastRewindLED, 0x7F); // Turn on the LED when the button is pressed
    } else {
        midi.sendShortMsg(0x90, fastRewindLED, 0x00); // Turn off the LED when the button is released
    }
};

HerculesDJ4Set.beatStepDeckA1 = 0;
HerculesDJ4Set.beatStepDeckA2 = 0x44;
HerculesDJ4Set.beatStepDeckB1 = 0;
HerculesDJ4Set.beatStepDeckB2 = 0x4C;

HerculesDJ4Set.scratchEnable_alpha = 1.0;
HerculesDJ4Set.scratchEnable_beta = (1.0) / 32;

HerculesDJ4Set.shiftButtonPressed = false;
HerculesDJ4Set.enableSpinBack = false;

HerculesDJ4Set.wheel_multiplier = 5;

HerculesDJ4Set.init = function (id) {
    HerculesDJ4Set.id = id;

    // Extinguish all LEDs
    for (var i = 0; i < 79; i++) {
        midi.sendShortMsg(0x90, i, 0x00);
    }

    // Connect hotcue_enabled events for hotcues 1 to 6 on both channels
    for (var channel = 1; channel <= 2; channel++) {
        for (var hotcue = 1; hotcue <= 6; hotcue++) {
            var channelName = "[Channel" + channel + "]";
            var hotcueEnabledEvent = "hotcue_" + hotcue + "_enabled";
            engine.connectControl(channelName, hotcueEnabledEvent, "HerculesDJ4Set.updateCuepointLEDs");
        }
    }

    engine.connectControl("[Channel1]", "sync_enabled", "HerculesDJ4Set.updateSyncLED");
    engine.connectControl("[Channel2]", "sync_enabled", "HerculesDJ4Set.updateSyncLED");

    // Set soft-takeover for all Sampler volumes
    for (var i = engine.getValue("[Master]", "num_samplers"); i >= 1; i--) {
        engine.softTakeover("[Sampler" + i + "]", "pregain", true);
    }
    // Set soft-takeover for all applicable Deck controls
    for (var i = engine.getValue("[Master]", "num_decks"); i >= 1; i--) {
        engine.softTakeover("[Channel" + i + "]", "volume", true);
        engine.softTakeover("[Channel" + i + "]", "filterHigh", true);
        engine.softTakeover("[Channel" + i + "]", "filterMid", true);
        engine.softTakeover("[Channel" + i + "]", "filterLow", true);
    }

    engine.softTakeover("[Master]", "crossfader", true);

    engine.connectControl("[Channel1]", "beat_active", "HerculesDJ4Set.beatProgressDeckA");
    engine.connectControl("[Channel1]", "play", "HerculesDJ4Set.playDeckA");

    engine.connectControl("[Channel2]", "beat_active", "HerculesDJ4Set.beatProgressDeckB");
    engine.connectControl("[Channel2]", "play", "HerculesDJ4Set.playDeckB");

    print("Hercules DJ Control AIR: " + id + " initialized.");
};

HerculesDJ4Set.shutdown = function () {
    // Perform shutdown tasks here if needed
};

HerculesDJ4Set.playDeckA = function () {
    if (engine.getValue("[Channel1]", "play") == 0) {
        HerculesDJ4Set.beatStepDeckA1 = 0x00;
        HerculesDJ4Set.beatStepDeckA2 = 0x44;
    }
};

HerculesDJ4Set.playDeckB = function () {
    if (engine.getValue("[Channel2]", "play") == 0) {
        HerculesDJ4Set.beatStepDeckB1 = 0x00;
        HerculesDJ4Set.beatStepDeckB2 = 0x4C;
    }
};

HerculesDJ4Set.beatProgressDeckA = function () {
    if (engine.getValue("[Channel1]", "beat_active") == 1) {
        if (HerculesDJ4Set.beatStepDeckA1 != 0x00) {
            midi.sendShortMsg(0x90, HerculesDJ4Set.beatStepDeckA1, 0x00);
        }

        HerculesDJ4Set.beatStepDeckA1 = HerculesDJ4Set.beatStepDeckA2;

        midi.sendShortMsg(0x90, HerculesDJ4Set.beatStepDeckA2, 0x7f);
        if (HerculesDJ4Set.beatStepDeckA2 < 0x47) {
            HerculesDJ4Set.beatStepDeckA2++;
        } else {
            HerculesDJ4Set.beatStepDeckA2 = 0x44;
        }
    }
};

HerculesDJ4Set.beatProgressDeckB = function () {
    if (engine.getValue("[Channel2]", "beat_active") == 1) {
        if (HerculesDJ4Set.beatStepDeckB1 != 0) {
            midi.sendShortMsg(0x90, HerculesDJ4Set.beatStepDeckB1, 0x00);
        }

        HerculesDJ4Set.beatStepDeckB1 = HerculesDJ4Set.beatStepDeckB2;

        midi.sendShortMsg(0x90, HerculesDJ4Set.beatStepDeckB2, 0x7f);
        if (HerculesDJ4Set.beatStepDeckB2 < 0x4F) {
            HerculesDJ4Set.beatStepDeckB2++;
        } else {
            HerculesDJ4Set.beatStepDeckB2 = 0x4C;
        }
    }
};

HerculesDJ4Set.headCue = function (midino, control, value, status, group) {
    if (engine.getValue(group, "headMix") == 0) {
        engine.setValue(group, "headMix", -1.0);
        midi.sendShortMsg(0x90, 0x39, 0x00);
        midi.sendShortMsg(0x90, 0x3A, 0x7f);
    }
};

HerculesDJ4Set.headMix = function (midino, control, value, status, group) {
    if (engine.getValue(group, "headMix") != 1) {
        engine.setValue(group, "headMix", 0);
        midi.sendShortMsg(0x90, 0x39, 0x7f);
        midi.sendShortMsg(0x90, 0x3A, 0x00);
    }
};

HerculesDJ4Set.sampler = function (midino, control, value, status, group) {
    if (value != 0x00) {
        if (HerculesDJ4Set.shiftButtonPressed) {
            engine.setValue(group, "LoadSelectedTrack", 1);
        } else if (engine.getValue(group, "play") == 0) {
            engine.setValue(group, "start_play", 1);
        } else {
            engine.setValue(group, "play", 0);
        }
    }
};

HerculesDJ4Set.wheelTouch = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (value === 0x7F) {
        var alpha = 1.0 / 8;
        var beta = alpha / 32;
        engine.scratchEnable(deck, 250, 33 + 1 / 3, alpha, beta);
    } else {
        engine.scratchDisable(deck);
    }
};

HerculesDJ4Set.wheelTurn = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }
    if (engine.isScratching(deck)) {
        engine.scratchTick(deck, newValue); // Scratch!
    } else {
        engine.setValue(deck, 'jog', newValue); // Pitch bend
    }
};

HerculesDJ4Set.scratch_enable = function (midino, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (value == 0x7f) {
        engine.scratchEnable(
            deck,
            HerculesDJ4Set.scratchEnable_intervalsPerRev,
            HerculesDJ4Set.scratchEnable_rpm,
            HerculesDJ4Set.scratchEnable_alpha,
            HerculesDJ4Set.scratchEnable_beta
        );
    } else {
        engine.scratchDisable(deck);
    }
};

HerculesDJ4Set.jog = function (midino, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (HerculesDJ4Set.scratchEnable) {
        HerculesDJ4Set.wheelTurn(channel, control, value, status, group);
    } else {
        var newValue = (value == 0x01 ? 10 : -10);
        engine.setValue(group, "jog", newValue * HerculesDJ4Set.wheel_multiplier);
    }
};

HerculesDJ4Set.shift = function (midino, control, value, status, group) {
    HerculesDJ4Set.shiftButtonPressed = (value == 0x7f);
    midi.sendShortMsg(status, control, value);
};

HerculesDJ4Set.spinback = function (midino, control, value, status, group) {
    if (value == 0x7f) {
        HerculesDJ4Set.enableSpinBack = true;
    } else {
        HerculesDJ4Set.enableSpinBack = false;
    }
    if (HerculesDJ4Set.enableSpinBack) {
        midi.sendShortMsg(status, control, 0x7f);
    } else {
        midi.sendShortMsg(status, control, 0x0);
    }
};

// Lets put LED code under here for the time being!

// Function to update the PFL LEDs
HerculesDJ4Set.updatePFLLEDs = function () {
    var pflLEDStatusChannel1 = engine.getValue("[Channel1]", "pfl") === 1 ? 0x7F : 0x00;
    var pflLEDStatusChannel2 = engine.getValue("[Channel2]", "pfl") === 1 ? 0x7F : 0x00;
    
    // Update PFL LED for Channel 1
    midi.sendShortMsg(0x90, 0x0F, pflLEDStatusChannel1);

    // Update PFL LED for Channel 2
    midi.sendShortMsg(0x90, 0x2F, pflLEDStatusChannel2);
};

// Initialize the PFL LED states
HerculesDJ4Set.updatePFLLEDs();

// Watch for changes in the PFL status and update the LEDs accordingly
engine.makeConnection("[Channel1]", "pfl", HerculesDJ4Set.updatePFLLEDs);
engine.makeConnection("[Channel2]", "pfl", HerculesDJ4Set.updatePFLLEDs);


HerculesDJ4Set.updateCuepointLEDs = function (value, group, control) {
    var channel = group.replace("[", "").replace("]", "");
    var hotcue = parseInt(control.split("_")[1]);
    var cuePointActive = value === 1;
    var padLEDControlNumber = HerculesDJ4Set.hotcueLEDs[channel][hotcue];
    midi.sendShortMsg(0x90, padLEDControlNumber, cuePointActive ? 0x7F : 0x00);
};

HerculesDJ4Set.updateSyncLED = function (value, group) {
    if (value === 1) {
        var deck = script.deckFromGroup(group);
        var syncMasterNote = (deck === 1) ? 0x11 : 0x31; // Assuming MIDI note for Sync LED
        midi.sendShortMsg(0x90, syncMasterNote, 0x7f);
    } else {
        // Turn off Sync LED for the deck where Sync is disabled
        var deck = script.deckFromGroup(group);
        var syncMasterNote = (deck === 1) ? 0x11 : 0x31; // Assuming MIDI note for Sync LED
        midi.sendShortMsg(0x90, syncMasterNote, 0x00);
    }
};

HerculesDJ4Set.updateRecordLED = function () {
    var recordingStatus = engine.getValue("[Recording]", "status");
    if (recordingStatus === 2) {
        midi.sendShortMsg(0x90, 0x3C, 0x7F); // Turn on the Record LED
    } else {
        midi.sendShortMsg(0x90, 0x3C, 0x00); // Turn off the Record LED
    }
};

HerculesDJ4Set.recordButton = function (midino, control, value, status, group) {
    if (value == 0x7F) {
        var recordingEnabled = engine.getValue("[Recording]", "toggle_recording");
        HerculesDJ4Set.toggleRecordLED(recordingEnabled);
    }
};

// Connect the recordButton function to the MIDI control for the record button
engine.connectControl("[Recording]", "status", "HerculesDJ4Set.updateRecordLED");

HerculesDJ4Set.playLEDTimerA = null;
HerculesDJ4Set.playLEDTimerB = null;

// Function to toggle the Play LED for Deck A
HerculesDJ4Set.togglePlayLEDDeckA = function () {
    var playLEDStatus = engine.getValue("[Channel1]", "play") === 1 && engine.getValue("[Channel1]", "beat_active") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x0E, playLEDStatus ? 0x7F : 0x00); // Turn the Green Play LED on if beat_active is active, off otherwise
    midi.sendShortMsg(0x91, 0x0E, playLEDStatus ? 0x7F : 0x00); // Turn the Red Play LED on if beat_active is active, off otherwise
    HerculesDJ4Set.playLEDTimerA = engine.beginTimer(0, function() {
        HerculesDJ4Set.togglePlayLEDDeckA();
    }, true);
};

// Function to toggle the Play LED for Deck B
HerculesDJ4Set.togglePlayLEDDeckB = function () {
    var playLEDStatus = engine.getValue("[Channel2]", "play") === 1 && engine.getValue("[Channel2]", "beat_active") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x2E, playLEDStatus ? 0x7F : 0x00); // Turn the Green Play LED on if beat_active is active, off otherwise
    midi.sendShortMsg(0x91, 0x2E, playLEDStatus ? 0x7F : 0x00); // Turn the Red Play LED on if beat_active is active, off otherwise
    HerculesDJ4Set.playLEDTimerB = engine.beginTimer(0, function() {
        HerculesDJ4Set.togglePlayLEDDeckB();
    }, true);
};

// Initialize the Play LED states
HerculesDJ4Set.togglePlayLEDDeckA();
HerculesDJ4Set.togglePlayLEDDeckB();

HerculesDJ4Set.cueLEDTimer = null;

// Function to toggle the Cue LED for Deck A
HerculesDJ4Set.toggleCueLED = function () {
    var cueLEDStatus = engine.getValue("[Channel1]", "cue_indicator") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x0D, cueLEDStatus); // Turn the Cue LED on if cue_indicator is active, off otherwise
};

// Function to toggle the Cue LED for Deck B
HerculesDJ4Set.toggleCueLED = function () {
    var cueLEDStatus = engine.getValue("[Channel2]", "cue_indicator") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x2D, cueLEDStatus); // Turn the Cue LED on if cue_indicator is active, off otherwise
};

// Initialize the Cue LED state
HerculesDJ4Set.toggleCueLED();

// Watch for changes in the cue indicator and update the Cue LED accordingly
engine.connectControl("[Channel1]", "cue_indicator", "HerculesDJ4Set.toggleCueLED");
engine.connectControl("[Channel2]", "cue_indicator", "HerculesDJ4Set.toggleCueLED");

