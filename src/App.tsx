import { useCallback, useState } from 'react';
import { SmoothScroll } from './components/SmoothScroll';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VelocityMarquee } from './components/VelocityMarquee';
import { ProjectGallery } from './components/ProjectGallery';
import { InteractiveStudioLab } from './components/InteractiveStudioLab';
import { ServicesSection } from './components/ServicesSection';
import { BentoAbout } from './components/BentoAbout';
import { FooterCTA } from './components/FooterCTA';
import { AiHelperWidget } from './components/AiHelperWidget';

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [seedRequest, setSeedRequest] = useState<{ prompt: string; nonce: number } | null>(null);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  const handleOpenAiHelper = useCallback((seedPrompt?: string) => {
    if (seedPrompt && seedPrompt.trim()) {
      setSeedRequest({ prompt: seedPrompt.trim(), nonce: Date.now() });
    }
    setAiOpen(true);
  }, []);

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-[#F4F5F0] text-[#1A1A1A]">
        <CustomCursor />
        <Preloader onComplete={handlePreloaderComplete} />
        <Navbar onOpenAiHelper={() => handleOpenAiHelper()} />
        <main>
          <Hero ready={preloaderDone} onOpenAiHelper={handleOpenAiHelper} />
          <VelocityMarquee />
          <ProjectGallery onAskAi={handleOpenAiHelper} />
          <InteractiveStudioLab onOpenAiHelper={handleOpenAiHelper} />
          <ServicesSection onAskAi={handleOpenAiHelper} />
          <BentoAbout onOpenAiHelper={handleOpenAiHelper} />
        </main>
        <FooterCTA />
        <AiHelperWidget
          open={aiOpen}
          onOpenChange={setAiOpen}
          seedRequest={seedRequest}
        />
      </div>
    </SmoothScroll>
  );
}
