function HerculesDJ4Set() {}

// Initialize controller functions
HerculesDJ4Set.scratchEnable_alpha = 1.0;
HerculesDJ4Set.scratchEnable_beta = (1.0) / 32;
HerculesDJ4Set.shiftButtonPressed = false;
HerculesDJ4Set.enableSpinBack = false;
HerculesDJ4Set.wheel_multiplier = 5;
HerculesDJ4Set.isScratchMode = true; // Variable to track the mode (Scratch or Jog)

// Main Functions
HerculesDJ4Set.init = function (id) {
    HerculesDJ4Set.id = id;

    // Extinguish all LEDs
    for (var i = 0; i < 79; i++) {
        midi.sendShortMsg(0x90, i, 0x00);
                midi.sendShortMsg(0x90, 0x3D, 0x7F); // Scratch button LED, for later!
    }

    // Initialize Scratch mode
    HerculesDJ4Set.toggleScratchMode();

    // Connect hotcue_enabled events for hotcues 1 to 6 on both channels
    for (var channel = 1; channel <= 2; channel++) {
        for (var hotcue = 1; hotcue <= 6; hotcue++) {
            var channelName = "[Channel" + channel + "]";
            var hotcueEnabledEvent = "hotcue_" + hotcue + "_enabled";
            engine.connectControl(channelName, hotcueEnabledEvent, "HerculesDJ4Set.updateCuepointLEDs");
        }
    }

        // Connect beatloop_enabled events for hotcues 1 to 6 on both channels
    // for (var channel = 1; channel <= 2; channel++) {
      //  for (var beatloop = 1; beatloop <= 8; beatloop++) {
       //     var channelName = "[Channel" + channel + "]";
        //    var beatloopEnabledEvent = "beatloop_" + beatloop + "_enabled";
         //   engine.connectControl(channelName, beatloopEnabledEvent, "HerculesDJ4Set.updateLoopLEDs");
       // }
  //  }

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

    engine.connectControl("[Channel1]", "play", "HerculesDJ4Set.playDeckA");
    engine.connectControl("[Channel2]", "play", "HerculesDJ4Set.playDeckB");

    print("Hercules DJ Control AIR: " + id + " initialized.");
};

HerculesDJ4Set.shutdown = function () {
    // Perform shutdown tasks here if needed
};

// Play event for Deck A
HerculesDJ4Set.playDeckA = function () {
    if (engine.getValue("[Channel1]", "play") == 0) {
        HerculesDJ4Set.beatStepDeckA1 = 0x00;
        HerculesDJ4Set.beatStepDeckA2 = 0x44;
        midi.sendShortMsg(0x90, 0x0E, 0x00); // Turn off Play button LED for Deck A
    } else {
        HerculesDJ4Set.beatStepDeckA1 = 0x01; // Turn on Play button LED for Deck A
        HerculesDJ4Set.beatStepDeckA2 = 0x00;
        midi.sendShortMsg(0x90, 0x0E, 0x7F); // Turn on Play button LED for Deck A
    }
};

// Play event for Deck B
HerculesDJ4Set.playDeckB = function () {
    if (engine.getValue("[Channel2]", "play") == 0) {
        HerculesDJ4Set.beatStepDeckB1 = 0x00;
        HerculesDJ4Set.beatStepDeckB2 = 0x4C;
        midi.sendShortMsg(0x90, 0x2E, 0x00); // Turn off Play button LED for Deck B
    } else {
        HerculesDJ4Set.beatStepDeckB1 = 0x2; // Turn on Play button LED for Deck B
        HerculesDJ4Set.beatStepDeckB2 = 0x00;
        midi.sendShortMsg(0x90, 0x2E, 0x7F); // Turn on Play button LED for Deck B
    }
};

// Handle Scratch button press to toggle Scratch mode
HerculesDJ4Set.toggleScratchMode = function () {
    HerculesDJ4Set.isScratchMode = !HerculesDJ4Set.isScratchMode;
};



// Jog Wheel Touch
HerculesDJ4Set.wheelTouch = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (value === 0x7F) {
        var alpha = 1.0 / 8;
        var beta = alpha / 20;
        engine.scratchEnable(deck, 128, 33 + 1 / 3, alpha, beta);
    } else {
        engine.scratchDisable(deck);
    }
};

// Jog Wheel Turn
HerculesDJ4Set.wheelTurn = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (HerculesDJ4Set.isScratchMode) {
        var newValue;
        if (value < 64) {
            newValue = value;
        } else {
            newValue = value - 128;
        }
        if (engine.isScratching(deck)) {
            engine.scratchTick(deck, newValue); // Scratch!
        } else {
            engine.setValue(group, "jog", newValue); // Pitch bend
        }
    } else {
        // Handle Jog mode differently
        var alpha = 1.0 / 8;
        var beta = alpha / 20;
        var direction = (value < 0x40) ? value : value - 0x80;
        engine.setValue(group, "jog", direction + engine.getValue(group, "jog"));
        engine.scratchEnable(deck, 1024, 33 + 1 / 3, alpha, beta);

    }
};

// - LED section! -


// Function to update the Pre-Fader Listen (PFL) LEDs
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

// Update Cuepoint LEDs
HerculesDJ4Set.updateCuepointLEDs = function (value, group, control) {
    var channel = group.replace("[", "").replace("]", "");
    var hotcue = parseInt(control.split("_")[1]);
    var cuePointActive = value === 1;
    var padLEDControlNumber = HerculesDJ4Set.hotcueLEDs[channel][hotcue];
    midi.sendShortMsg(0x90, padLEDControlNumber, cuePointActive ? 0x7F : 0x00);
};

// Update Loop LEDs
HerculesDJ4Set.updateLoopLEDs = function (value, group, control) {
    var channel = group.replace("[", "").replace("]", "");
    var beatloop = parseInt(control.split("_")[1]);
    var beatLoopActive = value === 1;
    var padLEDControlNumber = HerculesDJ4Set.hotcueLEDs[channel][beatloop];
    midi.sendShortMsg(0x91, padLEDControlNumber, beatLoopActive ? 0x7F : 0x00);
};

// Update Sync LEDs
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

// Update Record LED
HerculesDJ4Set.updateRecordLED = function () {
    var recordingStatus = engine.getValue("[Recording]", "status");
    if (recordingStatus === 2) {
        midi.sendShortMsg(0x90, 0x3C, 0x7F); // Turn on the Record LED
    } else {
        midi.sendShortMsg(0x90, 0x3C, 0x00); // Turn off the Record LED
    }
};

// Connect the recordButton function to the MIDI control for the record button
engine.connectControl("[Recording]", "status", "HerculesDJ4Set.updateRecordLED");

// Play and Cue LEDs

HerculesDJ4Set.playLEDTimerA = null;
HerculesDJ4Set.playLEDTimerB = null;

// Function to toggle the Play LED for Deck A
HerculesDJ4Set.togglePlayLEDDeckA = function () {
    var playLEDStatus = engine.getValue("[Channel1]", "play") === 1 && engine.getValue("[Channel1]", "beat_active") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x0E, playLEDStatus ? 0x7F : 0x00); // Turn the Green Play LED on if beat_active is active, off otherwise
    midi.sendShortMsg(0x91, 0x0E, playLEDStatus ? 0x7F : 0x00); // Turn the Red Play LED on if beat_active is active, off otherwise
    HerculesDJ4Set.playLEDTimerA = engine.beginTimer(0, function () {
        HerculesDJ4Set.togglePlayLEDDeckA();
    }, true);
};

// Function to toggle the Play LED for Deck B
HerculesDJ4Set.togglePlayLEDDeckB = function () {
    var playLEDStatus = engine.getValue("[Channel2]", "play") === 1 && engine.getValue("[Channel2]", "beat_active") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x2E, playLEDStatus ? 0x7F : 0x00); // Turn the Green Play LED on if beat_active is active, off otherwise
    midi.sendShortMsg(0x91, 0x2E, playLEDStatus ? 0x7F : 0x00); // Turn the Red Play LED on if beat_active is active, off otherwise
    HerculesDJ4Set.playLEDTimerB = engine.beginTimer(0, function () {
        HerculesDJ4Set.togglePlayLEDDeckB();
    }, true);
};

// Initialize the Play LED states
HerculesDJ4Set.togglePlayLEDDeckA();
HerculesDJ4Set.togglePlayLEDDeckB();

HerculesDJ4Set.cueLEDTimer = null;

// Function to toggle the Cue LED for Deck A
HerculesDJ4Set.toggleCueLEDDeckA = function () {
    var cueLEDStatus = engine.getValue("[Channel1]", "cue_indicator") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x0D, cueLEDStatus); // Turn the Green Cue LED on if cue_indicator is active, off otherwise
    midi.sendShortMsg(0x91, 0x0D, cueLEDStatus); // Turn the Red Cue LED on if cue_indicator is active, off otherwise
};

// Function to toggle the Cue LED for Deck B
HerculesDJ4Set.toggleCueLEDDeckB = function () {
    var cueLED2Status = engine.getValue("[Channel2]", "cue_indicator") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x2D, cueLED2Status); // Turn the Green Cue LED on if cue_indicator is active, off otherwise
    midi.sendShortMsg(0x91, 0x2D, cueLED2Status); // Turn the Red Cue LED on if cue_indicator is active, off otherwise
};

// Initialize the Cue LED state
HerculesDJ4Set.toggleCueLEDDeckA();
HerculesDJ4Set.toggleCueLEDDeckB();


// Watch for changes in the cue indicator and update the Cue LED accordingly
engine.connectControl("[Channel1]", "cue_indicator", "HerculesDJ4Set.toggleCueLEDDeckA");
engine.connectControl("[Channel2]", "cue_indicator", "HerculesDJ4Set.toggleCueLEDDeckB");
