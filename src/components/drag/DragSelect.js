import React, { useEffect, useRef, useState } from "react";
import * as motion from "motion/react-client";
import {
  animate,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
const DragSelect = ({ experience, scrollTo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [distanceRef, setDistanceRef] = useState([]);
  const [selected, setSelected] = useState(0);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const [, setXVal] = useState(0);
  const dragParentRef = useRef(null);
  const selectorRef = useRef(null);
  const constraintsRef = useRef(null);
  const timeoutRef = useRef(null);
  const circlesRef = useRef([]);
  useMotionValueEvent(x, "change", (latest) => setXVal(latest));
  useEffect(() => {
    if (circlesRef.current.length) {
      setIsDragging(true);
      snapToCircle(experience.length - 1);
    }
  }, [experience]);

  const snapToCircle = (index) => {
    if (!circlesRef.current[index]) return;

    const scrollIndexCenter = circlesRef.current[index].getBoundingClientRect().left + circlesRef.current[index].getBoundingClientRect().width/2;
    const displacedScroll = scrollIndexCenter - selectorRef.current.getBoundingClientRect().width/2;

    animate(x, displacedScroll, {
      type: "spring",
      stiffness: 300,
      damping: 20,
    });
    

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsDragging(false)
    }, 1000);
  };

  // Function to get nearest circle's x-position
  const snapToNearestCircle = () => {
    if (!circlesRef.current.length) return;

    const selectorX = x.get(); // Current x position
    const circlePositions = circlesRef.current.map(
      (circle) =>
        circle?.getBoundingClientRect().left -
        dragParentRef.current.getBoundingClientRect().left
    );

    // Find the closest x position
    const closestX = circlePositions.reduce((prev, curr) =>
      Math.abs(curr - selectorX) < Math.abs(prev - selectorX) ? curr : prev
    );

    // console log the index
    const scrollIndex = circlePositions.indexOf(closestX);
    scrollTo(scrollIndex + 1);
    const scrollIndexCenter = circlesRef.current[scrollIndex].getBoundingClientRect().left + circlesRef.current[scrollIndex].getBoundingClientRect().width/2;
    const displacedScroll = scrollIndexCenter - selectorRef.current.getBoundingClientRect().width/2;


    // Animate selector to snap to nearest circle
    animate(x, displacedScroll, { type: "spring", stiffness: 300, damping: 20 });
    setIsGrabbing(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsDragging(false)
    }, 500);
  };

  const distanceFromSelector = (index) => {
    if (!circlesRef.current[index]) return 1;
    const distance = Math.abs(
      circlesRef.current[index].getBoundingClientRect().left -
        dragParentRef.current.getBoundingClientRect().left -
        x.get()
    );
    distanceRef[index] = distance;
    if (distance < distanceRef[selected]) {
      setSelected(index);
    }
    if (distance > 50) {
      return 1;
    } else {
      return 1 + (50 - distance) / 100;
    }
  };
  return (
    <motion.div className={"absolute h-[50vh] w-screen flex flex-col items-center justify-center z-[10000] "+(isGrabbing ? " cursor-grabbing" : " cursor-grab")}
    animate={{opacity: isDragging ? 1 : 0}}
    transition={{duration:isDragging? 0: 1, ease: "easeIn"}}
    >
      <motion.div
        ref={dragParentRef}
        className="relative h-full w-screen flex flex-col items-center justify-center"
        onPointerDown={(event) => {dragControls.start(event); setIsDragging(true); setIsGrabbing(true)}}
        style={{ touchAction: "pan-y"}}
      >

      <h1 className="text-white text-2xl absolute top-1/4
      ">{
        experience[selected]?.Id
      }</h1>
        <div className="w-fit h-full flex items-center justify-center" 
        ref={constraintsRef}
        >
        {experience.map((exp, index) => {
          return (
            <>
              {/* green circle */}
              <motion.div
                className="rounded-full bg-white h-8 w-8"
                ref={(el) => (circlesRef.current[index] = el)}
                style={{
                  scale: distanceFromSelector(index),
                }}
              />
              {index < experience.length - 1 && (
                <div className=" bg-white h-2 w-8 -mx-2" />
              )}
            </>
          );
        })}
        {/* selector */}
        <motion.div
          drag="x"
          className="absolute bg-teal-500 rounded-full h-8 w-8 left-0"
          ref = {selectorRef}
          style={{ x }}
          dragConstraints={constraintsRef}
          dragControls={dragControls}
          dragElastic={0.3}
          dragListener={false}
          onDragEnd={snapToNearestCircle}
        />
        </div>
      </motion.div>
      
      <div className="absolute bg-black w-full h-full -z-10 opacity-50"/>
    </motion.div>
  );
};

export default DragSelect;
