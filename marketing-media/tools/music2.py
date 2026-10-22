import numpy as np, wave, sys
SR=44100; BPM=88; beat=60/BPM; bar=4*beat
dur=float(sys.argv[2]) if len(sys.argv)>2 else 20.0
n=int(SR*dur); t=np.arange(n)/SR; out=np.zeros(n)
def note(f,start,length,amp=0.18):
    i0=int(start*SR); L=int(length*SR); 
    if i0>=n: return
    L=min(L,n-i0); tt=np.arange(L)/SR
    env=np.exp(-tt*1.6)*(1-np.exp(-tt*80))
    trem=1+0.08*np.sin(2*np.pi*4.5*tt)
    s=(np.sin(2*np.pi*f*tt)+0.35*np.sin(2*np.pi*2*f*tt)+0.12*np.sin(2*np.pi*3*f*tt))*env*trem*amp
    out[i0:i0+L]+=s
m=lambda k:440*2**((k-69)/12)
# Cmaj7, Am7, Fmaj7, G6 (warm voicings) + bass
chords=[[72,76,79,83],[69,72,76,79],[65,69,72,76],[67,71,74,76]]
bass=[48,45,41,43]
b=0; st=0.0
while st<dur:
    ch=chords[b%4]
    for j,k in enumerate(ch): note(m(k),st+0.02*j,bar*1.05,0.11)
    note(m(bass[b%4]),st,bar,0.16)
    # little melody on beat 3 of every other bar
    if b%2==1: note(m([84,81,79,83][b%4]),st+2*beat,beat*1.5,0.09)
    st+=bar; b+=1
# soft kick on 1 and 3, hat on offbeats
rng=np.random.default_rng(7)
for i in range(int(dur/beat)+1):
    s0=i*beat
    if i%2==0:
        i0=int(s0*SR); L=min(int(0.25*SR),n-i0)
        if L>0:
            tt=np.arange(L)/SR; f=55+70*np.exp(-tt*30)
            out[i0:i0+L]+=0.35*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*14)
    h0=int((s0+beat/2)*SR); L=min(int(0.05*SR),n-h0)
    if L>0:
        nz=rng.standard_normal(L); nz=nz-np.convolve(nz,np.ones(8)/8,'same')
        out[h0:h0+L]+=0.03*nz*np.exp(-np.arange(L)/SR*90)
# gentle low-pass, fades, normalise
out=np.convolve(out,np.ones(2)/2,'same')
fi=int(1.0*SR); fo=int(1.5*SR)
out[:fi]*=np.linspace(0,1,fi); out[-fo:]*=np.linspace(1,0,fo)
out=out/np.max(np.abs(out))*0.9
st=np.stack([out,np.roll(out,int(0.012*SR))],1)
pcm=(st*32767).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
