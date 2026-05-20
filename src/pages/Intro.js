import React, { useEffect, useRef, useState } from "react";
// import myImage from
import TGP from "../components/TGP";
import introStyle from "../intro.module.css";
import MouseSVG from "../svg/Mouse";
import ScrollMouse from "../svg/ScrollMouse";
import MultilineTGS from "../components/MultilineTGS";
import { useDispatch } from "react-redux";
import {
  setShowChat,
} from "../store/chatbotStateSlice";
import { Button } from "@/components/ui/button";
import "../image.scss";

const Intro = ({ setIntroRef, contactRef, profileFade }) => {
  const dispatch = useDispatch();
  const introRef = useRef(null);
  const [imageChat, setImageChat] = useState(["Hi, I'm Jacques!"]);
  const chatQueue = [
    "Hi, I'm Jacques!",
    "Welcome to my portfolio.",
    "Feel free to look around.",
  ];

  useEffect(() => {
    setIntroRef(introRef);
  }, [introRef]);

  useEffect(() => {
    const fetchData = async () => {
      for (let i = 0; i < chatQueue.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setImageChat(chatQueue.slice(0, i + 1));
      }
    };
    fetchData().catch(console.error);
  }, []);

  const getResume = () => {
    fetch("/resume_Jacques.pdf").then((response) => {
      response.blob().then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        let alink = document.createElement("a");
        alink.href = fileURL;
        alink.download = "Resume_CogalJacques.pdf";
        alink.click();
      });
    });
  };
  const blockSelect = document.querySelector(".section-block.profile-block");

  useEffect(() => {
    if (profileFade) {
      blockSelect?.classList.add("fade");
    } else {
      blockSelect?.classList.remove("fade");
    }
  }, [profileFade]);

  return (
    <div ref={introRef} className="section-block profile-block">
      <p className="flex-none px-8 pt-4 text-left title-comp intro-load">
        <span className="section-text text-4xl">1.</span>
        <MultilineTGS
          toGenerateMap={["Profile", " (Hello there!)"]}
          classNameMap={["number-text", "flair-text"]}
        />
      </p>
      <div className="flex justify-center sectionLoad">
        <div>
          <div className="image-text-holder sm:px-10">
            {/* Image */}
            <div className="flex flex-col imageLoad">
              <div
                className="w-fit h-fit relative overflow-hidden  cursor-pointer"
                onClick={() => {
                  dispatch(setShowChat(true));
                }}
              >
                <img
                  className="object-cover w-[21rem] h-[28rem] rounded-md "
                  src="jacques.jpg"
                  alt="image description"
                />
                <div className="text-left intro-text-green-dark-200 opacity-100 absolute bottom-2 left-2  select-none flex flex-col">
                  {imageChat.map((text, index) => (
                    <TGP
                      key={index}
                      toGenerate={"// " + text}
                      className="bg-background rounded-md py-1 px-2 w-fit"
                      style={{
                        opacity: 1 - (imageChat.length - 1 - index) * 0.2,
                      }}
                      speed={2}
                      randomChoice={1}
                      quickLeave={false}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-row"></div>
            </div>

            {/* Text */}
            <div className="sm:px-10 py-10 w-100 flex-none">
              <div className={introStyle.IntroHolder}>
                <TGP
                  toGenerate="Hello there, my name is"
                  className={"text-left intro-text-green-dark-200 text-xl "}
                  speed={1}
                />
                <TGP
                  toGenerate={"Jacques Cogal"}
                  className={"text-left intro-text-white-dark text-8xl"}
                />
                <TGP
                  toGenerate={"|Full-stack Developer|"}
                  className={"text-left intro-text-green-dark-100 text-4xl"}
                  speed={1}
                />
                <TGP
                  toGenerate={
                    "I enjoy building things from ones and zeros. Thanks for stopping by!"
                  }
                  className={"text-left intro-text-green-dark-200 text-xl mt-5"}
                  speed={1}
                />
                <div className="flex flex-row content-center items-center">
                  <Button
                    variant="outline"
                    className="skip-button"
                    onClick={() => {
                      getResume();
                    }}
                  >
                    Resume
                  </Button>
                  <Button
                    variant="outline"
                    className="skip-button"
                    onClick={() =>
                      window.scrollTo({
                        top: contactRef.current.offsetTop,
                        behavior: "smooth",
                      })
                    }
                  >
                    Contact Me
                  </Button>
                  <Button
                    variant="outline"
                    className="skip-button"
                    onClick={() => {
                      dispatch(setShowChat(true));
                    }}
                  >
                    Chat Bot
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
