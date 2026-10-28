"""Synthesize the ad soundtrack: a 120 BPM beat (one bar = 2s, a scene = 6 beats)
plus sound effects placed at the timeline events exported by video.html.
usage: python3 audio.py events.json out.wav"""
import json, sys, wave
import numpy as np

SR = 44100
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(d, decay):
    return np.exp(-t(d) * decay)


def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc += a * (x[k] - acc)
        y[k] = acc
    return y


def highpass(x):
    return np.diff(x, prepend=0.0)


# ---------- drums ----------
def kick():
    d = 0.35
    f = 45 + 110 * np.exp(-t(d) * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(d, 9) * 1.0


def clap():
    d = 0.22
    n = highpass(rng.standard_normal(int(SR * d)))
    e = env(d, 22) + 0.6 * np.exp(-np.abs(t(d) - 0.012) * 400)
    return n * e * 0.35


def hat():
    d = 0.05
    return highpass(highpass(rng.standard_normal(int(SR * d)))) * env(d, 90) * 0.12


def bass_note(freq, d):
    x = t(d)
    saw = 2 * ((x * freq) % 1) - 1
    s = lowpass(saw, 0.08) * 0.9 + np.sin(2 * np.pi * freq * x) * 0.6
    a = np.minimum(1, x / 0.005) * np.exp(-x * 3)
    return s * a * 0.45


def pad_chord(freqs, d):
    x = t(d)
    s = sum(np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * 2 * f * x + 0.5) for f in freqs)
    a = np.minimum(1, x / 0.08) * np.minimum(1, (d - x) / 0.2)
    return s * a * 0.035


# ---------- sfx ----------
def pop(big=False):
    d = 0.16 if big else 0.09
    f0, f1 = (950, 380) if big else (720, 330)
    f = f1 + (f0 - f1) * np.exp(-t(d) * 40)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(d, 30 if big else 45)
    if big:
        s += highpass(rng.standard_normal(len(s))) * env(d, 60) * 0.25
    return s * (0.55 if big else 0.4)


def bell(freqs, d=0.6, decay=7):
    x = t(d)
    return sum(np.sin(2 * np.pi * f * x) * (0.6 ** i) for i, f in enumerate(freqs)) * np.exp(-x * decay)


def ding():
    return bell([1318.5, 2637, 3955], 0.5, 8) * 0.22


def clink():
    return bell([2600, 3900, 5200], 0.18, 26) * 0.14


def tick():
    return bell([1760, 3520], 0.09, 45) * 0.2


def cash():
    s = np.zeros(int(SR * 0.7))
    place(s, highpass(rng.standard_normal(int(SR * 0.03))) * 0.3, 0)
    place(s, bell([2093, 4186], 0.5, 9) * 0.25, 0.02)
    place(s, bell([2637, 5274], 0.6, 7) * 0.25, 0.10)
    return s


def whoosh(d=0.35, up=True):
    n = rng.standard_normal(int(SR * d))
    x = t(d)
    shape = np.sin(np.pi * x / d) ** 2
    a = np.linspace(0.02, 0.35, len(x)) if up else np.linspace(0.35, 0.02, len(x))
    y = np.empty_like(n)
    acc = 0.0
    for k in range(len(n)):
        acc += a[k] * (n[k] - acc)
        y[k] = acc
    return y * shape * 0.5


def impact():
    s = kick() * 1.2
    n = highpass(rng.standard_normal(int(SR * 1.2))) * env(1.2, 3.5) * 0.18
    out = np.zeros(max(len(s), len(n)))
    out[: len(s)] += s
    out[: len(n)] += n
    return out


music = np.zeros(N)
sfx = np.zeros(N)

BEAT = 0.5
# chords per 2s bar: Am F C G (x2) ... root for bass, triad for pad
prog = [(55.0, [220.0, 261.6, 329.6]), (43.65, [174.6, 220.0, 261.6]),
        (65.41, [196.0, 261.6, 329.6]), (49.0, [196.0, 246.9, 293.7])]
for bar in range(int(DUR / 2) + 1):
    root, triad = prog[bar % 4]
    b0 = bar * 2.0
    place(music, pad_chord(triad, 2.0), b0)
    for e8 in range(8):
        tt = b0 + e8 * 0.25
        if e8 % 2 == 1 or e8 in (0, 4):
            place(music, bass_note(root * (2 if e8 == 6 else 1), 0.24), tt)
for b in range(int(DUR / BEAT)):
    tt = b * BEAT
    place(music, kick(), tt)
    if b % 2 == 1:
        place(music, clap(), tt)
    place(music, hat(), tt + 0.25)
    place(music, hat() * 0.6, tt + 0.125)
# drop the beat out briefly before the payoff, then slam back in
gap = (np.arange(N) / SR > 11.5) & (np.arange(N) / SR < 12.0)
music[gap] *= 0.15

place(sfx, impact(), 0.0, 0.9)
for at, kind in json.load(open(sys.argv[1])):
    if kind == 'pop':
        place(sfx, pop(), at)
    elif kind == 'popbig':
        place(sfx, pop(True), at)
    elif kind == 'ding':
        place(sfx, ding(), at)
    elif kind == 'clink':
        place(sfx, clink(), at)
    elif kind == 'tick':
        place(sfx, tick(), at)
    elif kind == 'cash':
        place(sfx, cash(), at)
    elif kind == 'swoosh':
        place(sfx, whoosh(0.3, True), at - 0.18)
    elif kind == 'whoosh':
        place(sfx, whoosh(0.25, False), at)
place(sfx, impact(), 12.0, 0.8)

mix = music * 0.55 + sfx
fade = np.ones(N)
fl = int(0.4 * SR)
fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix /= np.max(np.abs(mix)) / 0.89
pcm = (mix * 32767).astype('<i2')
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('wrote', sys.argv[2])
