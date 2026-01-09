
import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Custom hook to trigger a highlight animation.
 * When `shouldHighlight` becomes true, it initiates a brief yellow flash animation.
 * @param shouldHighlight - A boolean that triggers the animation when true.
 * @returns Framer Motion animation controls to be passed to a motion component.
 */
export const useHighlightAnimation = (shouldHighlight: boolean) => {
    const controls = useAnimation();

    useEffect(() => {
        if (shouldHighlight) {
            controls.start({
                backgroundColor: ["#fffbe6", "rgba(255, 251, 230, 0)"],
                transition: { duration: 0.4, ease: "easeOut" },
            });
        }
    }, [shouldHighlight, controls]);

    return controls;
};