# HerculesDJ4SetMappings (README STILL WIP)
### Variations of Mixxx/Traktor MIDI mappings for the Hercules DJ4Set DJ controller. This is still a work in progress to cram as much functionality into the controller as possible but all mappings are basically stage-ready.

There are 4 variations of mappings to choose from:

- 2-Deck - Sets up decks C/D as additional pads/knobs for decks A/B. This is most recommended, as in my opinion you can do a lot more with your mixes by focusing on 2 decks with this controller instead of 4.

- 4-Deck (Cue) - Sets up a traditional 4-deck layout, with the pads acting as cue points with a total of 6 per deck (using shift).

- 4-Deck (Loop) - Sets up a traditional 4-deck layout, with the pads acting as loop points with a total of 6 per deck (using shift).

- 4-Deck (Sample) - Sets up a traditional 4-deck layout, with the pads acting as sample triggers with a total of 6 per deck (using shift).

As there aren't enough pads to dedicate a fair amount of cue/loop/sample controls for 4 decks, each setting is unfortunately an individual mapping. I don't use loops very often and I have no issue triggering samples with a mouse, so the 4DeckCue mapping works perfectly for me in the rare situation where I'm spinning 4 tracks, but YMMV depending on how you DJ.

**2-Deck Notes:**

- C / D Mode slightly emulates a DDJ-400/Inpulse 500 in terms of layout for FX. The inspiration for setting the C/D deck mappings like this came from using my Hercules DJControl Compact, as that controller switches between cues/loops/FX/samples in a similar way.

- Adjusting the knobs/faders in A/B mode and switching to C/D mode and vice versa will keep the knobs/faders set to where you left them until you return to the opposite deck mode and set the knobs/faders back to the exact position you see them on the screen. Be especially wary with the volume/pitch faders so you don't mess up your mix!

- All decks remember your last used Shift mode!

- To use this on Linux, you have download, make and run the HDJD drivers by nealey on GitHub in order to get the controller to show up in Mixxx, more about this can be found here: https://github.com/mixxxdj/mixxx/wiki/Hercules-Linux-Usermode-Driver

**Pads:**
- Deck A/B Pads = Cue Mode (A total of 6 per deck using Shift)
- Decks C + D Pads = Loop Mode (1/2/4, -+ halve/double the loop, modulate down is reloop/exit)
- Shift + Decks C / D Pads = Sample Mode (1-6)

**Buttons:**
- [-] and [=] halves / doubles loops in deck C/D mode
- [<<] + [>>] = Move beatgrid earlier/later in deck C/D mode

**Knobs:**
- Hi Knobs = Gain Knobs
- Mid Knobs = N/A (feel free to map them to whatever you can use them for!)
- Low Knobs = Super FX Knobs

**FAQ:**
- "Why doesn't my controller show up in Linux?"
- You need to download, make and install nealey's HDJD driver from their GitHub repo!
- "Is there no better option for using all 4 decks?"
- Not really. You can manually assign whatever buttons you want to suit your needs, but there's no real coherent way to fit all the functionality needed to use all 3 pad functions elegantly. 
