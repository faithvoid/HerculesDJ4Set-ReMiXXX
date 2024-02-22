# Variations of Mixxx/Traktor MIDI mappings for the Hercules DJ4Set DJ controller. 
### This is still a work in progress to cram as much functionality into the controller as possible but all mappings are basically stage-ready.

There are 2 variations of mappings to choose from:

- 2-Deck - Sets up decks C/D as loop pads/FX/volume knobs for decks A/B. This is most recommended, as in my opinion you can do a lot more with your mixes by focusing on 2 decks with this controller instead of 4.

- 4-Deck - Sets up a traditional 4-deck layout, with the pads acting as cue points with a total of 6 per deck (using shift).

## Working:
- All buttons work as expected.
- Jogwheels (need to apply a bit of pressure, light scratching doesn't work yet, any help would be appreciated!)
- LEDs: Hotcue, Sync, Recording, Mic On, Play (flashes to BPM), Cue (flashes to on-screen Cue), Headphone Cue / Pre-Fader Listen

## To Do:
- Add light jogwheel scratch code.
- LEDs: Loop Points (1-6), Pitch Up/Down*, Fast Forward / Rewind*, File Browser, BPM-Synced Jogwheel LEDs*
- * = unsure if LEDs actually exist for these functions

## Jogwheel MIDI Mapping Information:
### Deck A:
- Jog Left - Channel 1, CC 1, Value 127
- Jog Right - Channel 1, CC 1, Value 1
- Scratch Left - Channel 1, CC 36, Value 127
- Scratch Right - Chanel 1, CC 36, Value 1
- Wheel In - Channel: 1, Note: 26, Velocity: 127
- Wheel Out - Channel: 1, Note: 26, Velocity: 0

### Deck B:
- Jog Left - Channel 1, CC 9, Value 127
- Jog Right - Channel 1, CC 9, Value 1
- Scratch Left - Channel 1, CC 37, Value 127
- Scratch Right - Chanel 1, CC 37, Value 1
- Wheel In - Channel: 1, Note: 58, Velocity: 127
- Wheel Out - Channel: 1, Note: 58, Velocity: 0

## 2-Deck Notes:

- All Deck A/B buttons/knobs/faders function as you would expect them to in other software / as you'd expect looking at the controller.

- C / D Mode slightly emulates a DDJ-400/Inpulse 500 in terms of layout for FX. The inspiration for setting the C/D deck mappings like this came from using my Hercules DJControl Compact, as that controller switches between cues/loops/FX/samples in a similar way.

- Adjusting the knobs/faders in A/B mode and switching to C/D mode and vice versa will keep the knobs/faders set to where you left them until you return to the opposite deck mode and set the knobs/faders back to the exact position you see them on the screen. Be especially wary with the volume/pitch faders so you don't mess up your mix!

- All decks remember your last used Shift mode!

- To use this on Linux, you have download, make and run the HDJD drivers by nealey on GitHub in order to get the controller to show up in Mixxx or Traktor (or other DJ software), more about this can be found here: https://github.com/mixxxdj/mixxx/wiki/Hercules-Linux-Usermode-Driver

**Pads:**
- Deck A/B = Cue Mode (A total of 6 per deck using Shift)
- Decks C + D = Loop Mode (1/2/4, -+ halve/double the loop, modulate down is reloop/exit)
- Shift + Decks C / D = Sample Mode (6 pads total)

**Buttons:** 
- [-] and [=] halves / doubles loops in deck C/D mode
- [<<] + [>>] = Move beatgrid earlier/later in deck C/D mode

**Knobs:**
- Hi Knobs = Gain Knobs
- Mid Knobs = FX1 Slot 1 / FX2 Slot 2 (feel free to map them to whatever you can use them for!)
- Low Knobs = Super FX Knobs

**Faders:**
Pitch / Vol faders are intentionally disabled while in C/D mode. Enabling/disabling soft takeover mode did nothing to improve transitioning between fader states so any movements made on the faders on decks C/D will only take place once you're back in decks A/B. Trust me, you don't wanna try using both fader sets live.

## FAQ:
- "Why doesn't my controller show up in Linux?"
- You need to download, make and run nealey's HDJD userspace driver from their GitHub repo! After that it works just fine in most DJ software such as Mixxx and Traktor in WINE. Note that you'll need to run it every time you want to use your controller!
- "My jogwheels aren't working?"
- They (probably) are! They only work for scratching and not seeking at the moment, so you need to actually apply a bit of pressure! IIRC you can adjust the sensitivity on Windows with an app for the DJ4Set, but I haven't tested it. If you need to seek in a track, you can use the [<<] and [>>] buttons instead. I've been looking into stealing some of the Rmx-4 jogwheel code (as the script works w/ the jogwheels perfectly) but for now it is what it is.
- "Is there really no better option for using all 4 decks?"
- Not really, unless I'm missing something incredibly obvious. You can manually assign whatever buttons you want to suit your needs, but there's no real coherent way to fit all the functionality needed to use all 3 pad functions elegantly. I think most people should personally stick with using this controller as a fully-featured 2-deck instead but it's all up to personal preference.
- "How do I change the LED colour?"
- Try changing your desired LED's "0x90" code to to "0x91". This seems to correspond with Deck C/D LEDs (this is how I'm keeping the play button BPM synced between decks). 
- "Do you accept pull requests?"
- Please help out if you can! I, as one woman working off vague documentation and DIYed reverse engineering tools, can only do so much to get this thing functional in Traktor/Mixxx, any and all help is much appreciate.

## Credits:
- Mixxx developers for making such incredible & flexible software.
- Orak from the Mixxx forums for the original Hercules DJ4Set script that most of this code is heavily based off of.
- Neale Pickett (Nealey) for making the Hercules DJ Controller Driver that makes all of this possible!
