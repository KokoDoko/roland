// 
// roland J6 chord sets
// https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
//
export class Synth {

    constructor() {
        Tone.Transport.bpm.value = 120; 

        this.stabSynth = new Tone.MonoSynth({
            oscillator: {
                type: "sawtooth"
            },
            filter: {
                Q: 6,
                type: "lowpass",
                rolloff: -24
            },
            envelope: {
                attack: 0.005,
                decay: 0.3,
                sustain: 0.4,
                release: 0.8
            },
            filterEnvelope: {
                attack: 0.01,
                decay: 0.7,
                sustain: 0.1,
                release: 0.8,
                baseFrequency: 300,
                octaves: 4
            }
        }).toDestination();

        this.polysynth = new Tone.PolySynth(Tone.Synth)

        // still has distortion :(
        // this.polysynth = new Tone.PolySynth(Tone.Synth, {
        //     oscillator: { type: "sine" },
        //     envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 1 }
        // });              

        // Compressor and Limiter to prevent distortion from playing chords
        this.compressor = new Tone.Compressor({
            threshold: -18,      // Moderate threshold
            ratio: 4,            // Gentle 4:1 ratio
            attack: 0.01,        // Slower attack to avoid pumping
            release: 0.2,        // Longer release for smoothness
            knee: 6              // Soft knee for musical compression
        });
        this.limiter = new Tone.Limiter(-3)
        this.polysynth.chain(this.compressor, this.limiter).toDestination()
    }

    playChord(notes, duration, arp) {
        if (arp) {
            notes.forEach((note, i) => {
                const time = `+${Tone.Time("16n").toSeconds() * i}`;
                this.polysynth.triggerAttackRelease(note, "8n", time);
            })
        } else {
            this.polysynth.triggerAttackRelease(notes, duration);
        }
    }

    playNote(note) {
        this.stabSynth.triggerAttackRelease(note, "8n");
    }
}