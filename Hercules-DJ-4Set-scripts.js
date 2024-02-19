function HerculesDJ4Set() {}

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
    midi.sendShortMsg(0x90, 0x3B, 0x7f); // Headset volume "-" button LED (always on)
    midi.sendShortMsg(0x90, 0x3C, 0x7f); // Headset volume "+" button LED (always on)

    if (engine.getValue("[Master]", "headMix") > 0.5) {
        midi.sendShortMsg(0x90, 0x39, 0x7f); // Headset "Mix" button LED
    } else {
        midi.sendShortMsg(0x90, 0x3A, 0x7f); // Headset "Cue" button LED
    }

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
