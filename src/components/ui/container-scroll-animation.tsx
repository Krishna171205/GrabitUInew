"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, useSpring, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    const [start, end] = isMobile ? [0.7, 0.9] : [1.05, 1];
    return [start, end, end];
  };

  const springConfig = { stiffness: 120, damping: 28, restDelta: 0.001 };

  const rawRotate    = useTransform(scrollYProgress, [0, 0.35, 1], [75, 0, 0]);
  const rawScale     = useTransform(scrollYProgress, [0, 0.35, 1], scaleDimensions());
  const rawTranslate = useTransform(scrollYProgress, [0, 0.35, 1], [0, -40, -40]);

  const rotate    = useSpring(rawRotate,    springConfig);
  const scale     = useSpring(rawScale,     springConfig);
  const translate = useSpring(rawTranslate, springConfig);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-start justify-center relative px-2 md:px-20 pt-16 md:pt-20"
      ref={containerRef}
    >
      <div
        className="pb-10 md:pb-20 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: React.ReactNode }) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl mt-8 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
