function HerculesDJ4Set() {}

// Main Functions
HerculesDJ4Set.init = function (id) {
    HerculesDJ4Set.id = id;

    // Extinguish all LEDs
    for (var i = 0; i < 79; i++) {
        midi.sendShortMsg(0x90, i, 0x00);
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

    print("Hercules DJ 4Set: " + id + " initialized.");
};

HerculesDJ4Set.shutdown = function () {
    // Perform shutdown tasks here if needed
};

// Handle Scratch button press to toggle Scratch mode
HerculesDJ4Set.toggleScratchMode = function () {
    HerculesDJ4Set.isScratchMode = !HerculesDJ4Set.isScratchMode;
};

// Initialize controller functions
HerculesDJ4Set.isScratchMode = true; // Variable to track the mode (Scratch or Jog)

// The button that enables/disables scratching

HerculesDJ4Set.wheelTouch = function (channel, control, value, status, group) {

    var deckNumber = script.deckFromGroup(group);

  if (value === 0x7F) {  // Some wheels send 0x90 on press and release, so you need to check the value

        var alpha = 1.0/8;
        var beta = alpha/32;

        engine.scratchEnable(deckNumber, 128, 33+1/3, alpha, beta);

    } else {    // If button up
        engine.scratchDisable(deckNumber,);
        midi.sendShortMsg(0x90, 0x3D, 0x00); // Turn off Scratch LED


    }

}

// Jog Wheel Turn

// Handle Scratch Mode
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
            midi.sendShortMsg(0x90, 0x3D, 0x7F); // Turn on Scratch LED
        }
    } else {
// Handle Jog mode
        var direction = (value < 0x40) ? value : value - 0x80;
        engine.setValue(group, "jog", direction + engine.getValue(group, "jog"));

    }
};

// - LED section! -

// Define function to handle moving focus forward
HerculesDJ4Set.MoveFocusForward = function () {
    midi.sendShortMsg(0x90, 0x3E, 0x7F); // Turn on LED 0xNA
    midi.sendShortMsg(0x90, 0x3F, 0x00); // Turn off LED 0xNE
};

// Define function to handle moving focus backwards
HerculesDJ4Set.MoveFocusBackward = function () {
    midi.sendShortMsg(0x90, 0x3E, 0x00); // Turn off LED 0xNA
    midi.sendShortMsg(0x90, 0x3F, 0x7F); // Turn on LED 0xNE 
};

// Connect the functions to Mixxx events
engine.connectControl("[Library]", "MoveFocusForward", "HerculesDJ4Set.MoveFocusForward");
engine.connectControl("[Library]", "MoveFocusBackward", "HerculesDJ4Set.MoveFocusBackward");


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
    engine.connectControl("[Channel1]", "sync_enabled", "HerculesDJ4Set.updateSyncLED");
    engine.connectControl("[Channel2]", "sync_enabled", "HerculesDJ4Set.updateSyncLED");

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

// Function to toggle the Play LED for Deck A
HerculesDJ4Set.togglePlayLEDDeckA = function () {
        var playLEDStatus = engine.getValue("[Channel1]", "play") === 1 && engine.getValue("[Channel1]", "beat_active") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x0E, playLEDStatus ? 0x7F : 0x00); // Turn the Green Play LED on if beat_active is active, off otherwise
    midi.sendShortMsg(0x91, 0x0E, playLEDStatus ? 0x7F : 0x00); // Turn the Red Play LED on if beat_active is active, off otherwise
};

// Function to toggle the Play LED for Deck B
HerculesDJ4Set.togglePlayLEDDeckB = function () {
    var playLEDStatus = engine.getValue("[Channel2]", "play") === 1 && engine.getValue("[Channel2]", "beat_active") === 1 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90, 0x2E, playLEDStatus ? 0x7F : 0x00); // Turn the Green Play LED on if beat_active is active, off otherwise
    midi.sendShortMsg(0x91, 0x2E, playLEDStatus ? 0x7F : 0x00); // Turn the Red Play LED on if beat_active is active, off otherwise
};

// Initialize the Play LED states
engine.connectControl("[Channel1]", "play", "HerculesDJ4Set.togglePlayLEDDeckA");
engine.connectControl("[Channel1]", "beat_active", "HerculesDJ4Set.togglePlayLEDDeckA");
engine.connectControl("[Channel2]", "play", "HerculesDJ4Set.togglePlayLEDDeckB");
engine.connectControl("[Channel2]", "beat_active", "HerculesDJ4Set.togglePlayLEDDeckB");

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

// Watch for changes in the cue indicator and update the Cue LED accordingly
engine.connectControl("[Channel1]", "cue_indicator", "HerculesDJ4Set.toggleCueLEDDeckA");
engine.connectControl("[Channel2]", "cue_indicator", "HerculesDJ4Set.toggleCueLEDDeckB");
