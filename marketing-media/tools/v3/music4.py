import numpy as np, wave, sys
SR=44100
def render(genre,dur,seed=1):
    n=int(SR*dur); out=np.zeros(n); rng=np.random.default_rng(seed)
    m=lambda k:440*2**((k-69)/12)
    def add(sig,start,pan=None):
        i0=int(start*SR)
        if i0>=n or i0<0: return
        L=min(len(sig),n-i0); out[i0:i0+L]+=sig[:L]
    def tone(f,length,amp,dec=3.0,harm=(1,.4,.15),att=120,vib=0):
        tt=np.arange(int(length*SR))/SR; env=np.exp(-tt*dec)*(1-np.exp(-tt*att))
        ph=2*np.pi*f*tt+(vib*np.sin(2*np.pi*5*tt) if vib else 0)
        return sum(h*np.sin((i+1)*ph) for i,h in enumerate(harm))*env*amp
    def pluck(f,length,amp):  # Karplus-Strong guitar
        N=int(SR/f); buf=rng.uniform(-1,1,N); L=int(length*SR); y=np.zeros(L)
        for i in range(L):
            y[i]=buf[i%N]; buf[i%N]=0.996*0.5*(buf[i%N]+buf[(i+1)%N])
        return y*amp
    def kick(a=.55,lo=48):
        tt=np.arange(int(.35*SR))/SR; f=lo+100*np.exp(-tt*30)
        return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*8)*a
    def noise(l,dec,a,hp=True):
        tt=np.arange(int(l*SR))/SR; x=rng.standard_normal(len(tt))
        if hp: x=np.diff(x,prepend=0)
        return x*np.exp(-tt*dec)*a
    def sub808(f,l,a):
        tt=np.arange(int(l*SR))/SR; return np.tanh(1.5*np.sin(2*np.pi*f*tt))*np.exp(-tt*1.2)*a
    G=genre
    if G=="lofi":
        BPM=84; ch=[[62,65,69,72,76],[67,71,74,77],[60,64,67,71,74],[57,60,64,67,71]]; bs=[38,43,36,33]
    elif G=="pop":
        BPM=118; ch=[[67,71,74],[64,67,71],[60,64,67],[62,66,69]]; bs=[43,40,36,38]
    elif G=="rnb":
        BPM=70; ch=[[63,67,70,74,77],[60,63,67,70,74],[58,62,65,69,72],[56,60,63,67,70]]; bs=[39,36,34,32]
    elif G=="folk":
        BPM=96; ch=[[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]]; bs=[48,43,45,41]
    elif G=="funk":
        BPM=110; ch=[[64,67,71,74],[64,67,71,74],[69,72,76,79],[67,71,74,77]]; bs=[40,40,45,43]
    elif G=="house":
        BPM=122; ch=[[69,72,76,79],[65,69,72,76],[67,71,74,77],[64,67,71,74]]; bs=[45,41,43,40]
    elif G=="marimba":
        BPM=100; ch=[[65,69,72],[67,71,74],[64,67,71],[69,72,76]]; bs=[41,43,40,45]
    beat=60/BPM; bar=4*beat; b=0; st=0.0
    while st<dur:
        c=ch[b%4]; r=bs[b%4]
        if G=="lofi":
            for j,k in enumerate(c): add(tone(m(k),bar*1.02,.05,dec=1.2,harm=(1,.2,.05),att=30),st+0.03*j)
            for s in [0,2.5]: add(kick(.45),st+s*beat)
            for s in [1,3]: add(noise(.18,18,.12,False),st+s*beat+0.02)
            for s in range(8): add(noise(.04,90,.03),st+s*beat/2+(0.06 if s%2 else 0))
            add(tone(m(r),bar*.9,.2,dec=1.5,harm=(1,.15)),st)
        elif G=="pop":
            for s in [0,.75,1.5,2.5,3.25]:
                for k in c: add(tone(m(k+12),beat*.35,.04,dec=9,harm=(1,.6,.3,.15)),st+s*beat)
            for s in [0,1,2,3]: add(kick(),st+s*beat)
            for s in [1,3]: add(noise(.2,20,.15,False),st+s*beat)
            for s in range(16): add(noise(.03,120,.025),st+s*beat/4)
            for s in [0,.5,1,1.5,2,2.5,3,3.5]: add(tone(m(r),beat*.45,.18,dec=5,harm=(1,.3)),st+s*beat)
        elif G=="rnb":
            for j,k in enumerate(c): add(tone(m(k),bar*1.05,.05,dec=.9,harm=(1,.5,.1),att=60,vib=.02),st+0.04*j)
            add(sub808(m(r),bar*.6,.3),st); add(sub808(m(r),beat,.25),st+2.75*beat)
            for s in [0,2.75]: add(kick(.4,40),st+s*beat)
            for s in [2]: add(noise(.25,12,.14,False),st+s*beat)
            for s in range(16):
                if s%4!=3: add(noise(.025,140,.02),st+s*beat/4)
        elif G=="folk":
            pat=[0,1,2,3,2,1,2,3]
            for s in range(8): add(pluck(m(c[pat[s]]),beat*1.5,.22),st+s*beat/2)
            add(pluck(m(r),bar,.3),st); add(pluck(m(r+7),beat*2,.2),st+2*beat)
            for s in [1,3]: add(noise(.08,40,.06,False),st+s*beat)
        elif G=="funk":
            for s in [0,.75,1.5,2,2.75,3.5]: add(tone(m(r if s%1==0 else r+12),beat*.3,.24,dec=10,harm=(1,.5,.2)),st+s*beat)
            for s in [.5,1.5,2.25,3.5]:
                for k in c: add(tone(m(k),beat*.18,.04,dec=20,harm=(1,.7,.4,.2)),st+s*beat)
            for s in [0,2,2.5]: add(kick(),st+s*beat)
            for s in [1,3]: add(noise(.2,18,.16,False),st+s*beat)
            for s in range(8): add(noise(.12 if s%2 else .03,30 if s%2 else 120,.035),st+s*beat/2)
        elif G=="house":
            for s in [0,1,2,3]: add(kick(.6,45),st+s*beat)
            for s in range(4): add(noise(.1,35,.05),st+s*beat+beat/2)
            for s in [1,3]: add(noise(.2,22,.13,False),st+s*beat)
            for s in [0,1.5,2.5]:
                for k in c: add(tone(m(k),beat*.5,.05,dec=6,harm=(1,.5,.25,.12)),st+s*beat)
            for s in [.5,1.5,2.5,3.5]: add(tone(m(r),beat*.4,.22,dec=6,harm=(1,.2)),st+s*beat)
        elif G=="marimba":
            seq=[0,2,1,2,0,2,1,2]
            for s in range(8): add(tone(m(c[seq[s]]+12),beat*.6,.09,dec=9,harm=(1,0,.25,0,.05)),st+s*beat/2)
            add(tone(m(r),bar*.8,.18,dec=2,harm=(1,.1)),st); add(tone(m(r+7),beat,.12,dec=3,harm=(1,.1)),st+2*beat)
            for s in [0,2]: add(kick(.35),st+s*beat)
            for s in range(8): add(noise(.04,70,.03,False),st+s*beat/2+(0.03 if s%2 else 0))
        b+=1; st+=bar
    if G=="lofi": out+=rng.standard_normal(n)*0.004
    fade=np.minimum(1,np.minimum(np.arange(n)/(SR*.3),(n-np.arange(n))/(SR*1.5))); out*=fade
    out/=np.abs(out).max()*1.05; return out
if __name__=="__main__":
    o=render(sys.argv[2],float(sys.argv[3]))
    s=(o*32767).astype(np.int16); w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.stack([s,s],1).tobytes()); w.close()
