import { useEffect, useRef, useState } from 'react';
import type { LottiePlayer } from 'lottie-web';

const CarLottie = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [lottie, setLottie] = useState<LottiePlayer | null>(null);

  useEffect(() => {
    import('lottie-web').then((Lottie) => setLottie(Lottie.default));
  }, []);

  useEffect(() => {
    if (lottie && ref.current) {
      lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets2.lottiefiles.com/private_files/lf30_rn1i0mvd.json',
      });
    }
  }, [lottie]);

  return <div ref={ref} />;
};

export default CarLottie;
