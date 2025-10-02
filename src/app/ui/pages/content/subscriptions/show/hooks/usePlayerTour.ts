import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Step, type CallBackProps, EVENTS, STATUS } from 'react-joyride';
import type { LevelTask } from '@/app/api/services/subscriptions';

// Define the props our hook will need from the parent component
interface UsePlayerTourProps {
  isDataLoaded: boolean;
  selectedTask: LevelTask | undefined;
  setIsChatVisible: (visible: boolean) => void;
  setPlaylistVisible: (visible: boolean) => void;
}

export function usePlayerTour({
  isDataLoaded,
  selectedTask,
  setIsChatVisible,
  setPlaylistVisible,
}: UsePlayerTourProps) {
  const [runTour, setRunTour] = useState(false);

  // Effect to auto-start the tour for first-time visitors
  useEffect(() => {
    if (isDataLoaded) {
      const hasViewedTour = localStorage.getItem('hasViewedPlayerTour');
      if (!hasViewedTour) {
        setTimeout(() => setRunTour(true), 500);
      }
    }
  }, [isDataLoaded]);

  // The tour steps are defined inside the hook, using props passed to it
  const tourSteps: Step[] = useMemo(() => {
    const baseSteps: Omit<Step, 'locale'>[] = [
      { target: '.tour-step-content', content: 'هنا يتم عرض محتوى الدرس الحالي، سواء كان فيديو أو ملف.', disableBeacon: true },
      { target: '.tour-step-actions', content: 'من هنا يمكنك تحميل مرفقات الدرس أو تعيينه كمكتمل للانتقال للتالي.' },
      { target: '.tour-step-playlist', content: 'هذه هي قائمة المهام. يمكنك التنقل بين المستويات والمهام والدروس المختلفة من هنا.' },
    ];

    if (selectedTask?.chatRoomId) {
      baseSteps.splice(2, 0, {
        target: '.tour-step-chat',
        content: 'بعض المهام تحتوي على غرفة محادثة خاصة بها. يمكنك المشاركة في النقاش من هنا.',
      });
    }
    
    // Add dynamic locale for progress
    return baseSteps.map((step, index) => {
      if (index === baseSteps.length - 1) return step;
      return {
        ...step,
        // locale: { next: <span>التالي ({index + 1} / {baseSteps.length})</span> },
      };
    });
  }, [selectedTask?.chatRoomId]);

  // The callback now uses the setters passed into the hook
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, step } = data;

    if (type === EVENTS.STEP_BEFORE) {
      if (step.target === '.tour-step-chat') {
        setIsChatVisible(true);
      } else if (step.target === '.tour-step-playlist') {
        setPlaylistVisible(true);
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTour(false);
      localStorage.setItem('hasViewedPlayerTour', 'true');
    }
  }, [setIsChatVisible, setPlaylistVisible]);

  // Return an object containing all the props the <Joyride> component needs
  
  return {
    joyrideProps: {
      steps: tourSteps,
      run: runTour,
      callback: handleJoyrideCallback,
      continuous: true,
      showProgress: true,
      showSkipButton: true,
      locale: {
        back: 'السابق',
        close: 'إغلاق',
        last: 'إنهاء',
        next: 'التالي',
        skip: 'تخطي',
        nextLabelWithProgress: ("التالي ({step}/{steps})")
      },
      styles: {
        options: {
          zIndex: 10000,
          arrowColor: '#333',
          backgroundColor: '#333',
          primaryColor: '#1677ff',
          textColor: '#fff',
        },
      },
    },
  };
}