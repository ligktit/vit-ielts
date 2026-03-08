import { Container } from "@/shared/ui";
import { Button, Modal, Tooltip } from "antd";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { IPracticeSingle } from "@/pages/ielts-practice-single/api";
import { AnswerFormValues, useExamContext } from "../../context";
import { useRouter } from "next/router";
import duration from "dayjs/plugin/duration";
import { useFormContext } from "react-hook-form";
import Link from "next/link";

dayjs.extend(duration);

const OptionItem = ({
  icon,
  text,
  onClick,
  isPrimary = false,
}: {
  icon: string;
  text: string;
  onClick: () => void;
  isPrimary?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between text-left p-4 rounded-lg mb-3 ${
      isPrimary ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"
    }`}
  >
    <div className="flex items-center">
      <span className="material-symbols-rounded mr-3">{icon}</span>
      <span className="font-semibold">{text}</span>
    </div>
  </button>
);

function Header({ post }: { post: IPracticeSingle }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isReady,
    testResult,
    isFormDisabled,
    handleSubmitAnswer,
    isNotesViewOpen,
    setIsNotesViewOpen,
    timer,
    setTimer,
    selectedTextSize,
    setSelectedTextSize,
  } = useExamContext();
  const { handleSubmit } = useFormContext<AnswerFormValues>();
  const router = useRouter();

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [optionsView, setOptionsView] = useState("main");

  const textSizes = [
    { key: "Regular", name: "Regular" },
    { key: "large", name: "Large" },
    { key: "xlarge", name: "Extra Large" },
  ];

  // Use refs to avoid stale closures and prevent re-creating intervals
  const isFormDisabledRef = useRef(isFormDisabled);
  const handleSubmitRef = useRef(handleSubmit);
  const handleSubmitAnswerRef = useRef(handleSubmitAnswer);

  useEffect(() => { isFormDisabledRef.current = isFormDisabled; }, [isFormDisabled]);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);
  useEffect(() => { handleSubmitAnswerRef.current = handleSubmitAnswer; }, [handleSubmitAnswer]);

  // Initialize timer once
  useEffect(() => {
    if (!timer && !isReady) {
      const timeLeft = testResult.timeLeft?.toString().split(":") || [
        post.quizFields.time,
      ];
      const d = dayjs.duration({
        minutes: Number(timeLeft[0]) || post.quizFields.time,
        seconds: Number(timeLeft[1]) || 0,
      });
      setTimer(d);
    }
  }, [timer, isReady, testResult.timeLeft, post.quizFields.time, setTimer]);

  // Countdown timer - only start when isReady, does NOT depend on timer value
  // Timer continues into negative when time runs out (no auto-submit)
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      if (isFormDisabledRef.current) {
        clearInterval(interval);
        return;
      }

      setTimer((prev) => {
        if (!prev) return prev;
        return prev.subtract(1, "second");
      });
    }, 1000);

    return () => clearInterval(interval);
    // Only depend on isReady - NOT on timer
  }, [isReady, setTimer]);

  const handleNotesView = () => {
    if (!setIsNotesViewOpen) return;
    if (isNotesViewOpen) {
      setIsNotesViewOpen(false);
    } else {
      setIsNotesViewOpen(true);
    }
  };

  return (
    <>
      <header className="py-2 bg-white shadow z-20 mb-[20px]">
        <Container className="max-w-none">
          <div className="flex items-center">
            <div className="md:w-1/2">
              <div className="flex">
                <div
                  title="Home"
                  className="h-full md:h-12 aspect-[750/449] relative duration-300"
                >
                  <Link href="/">
                    <Image
                      min-width="160px"
                      sizes="100%"
                      alt="logo"
                      src="/logo.png"
                      priority
                      fill
                      className="object-contain"
                    />
                  </Link>
                </div>

                <div className="title-wrap ml-[15px]">
                  <h2 className="font-bold text-base">{post.title}</h2>

                  <div className="flex items-center">
                    <span
                      className="material-symbols-rounded block! text-xl! text-gray-500"
                      style={{
                        fontVariationSettings:
                          '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
                      }}
                    >
                      timer
                    </span>
                    <span className={`font-bold px-2 text-base ${timer && timer.asSeconds() < 0 ? 'text-gray-400' : 'text-primary'}`}>
                      {timer ? (
                        timer.asSeconds() < 0
                          ? `-${dayjs.duration(Math.abs(timer.asSeconds()), 'seconds').format("mm:ss")}`
                          : timer.format("mm:ss")
                      ) : "00:00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="flex items-center justify-end space-x-8">
                <Image
                  width={28}
                  height={24}
                  sizes="100%"
                  alt="logo"
                  src="/wifi.png"
                  priority
                />

                <Tooltip title="Open Notes" className="hidden md:block">
                  <Button
                    className="p-[0] border-[0] shadow-[0]"
                    onClick={handleNotesView}
                  >
                    <span className="material-symbols-rounded bold block! text-[24px]! text-[#222]">
                      assignment
                    </span>
                  </Button>
                </Tooltip>

                <Button
                  className="p-[0] border-[0] shadow-[0]"
                  onClick={() => setIsOptionsOpen(true)}
                >
                  <div className="hambuger">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </header>

      <Modal
        open={isOptionsOpen}
        onCancel={() => {
          setIsOptionsOpen(false);
          setTimeout(() => setOptionsView("main"), 200);
        }}
        footer={null}
        closable={true}
        closeIcon={
          <Image
            width={18}
            height={18}
            sizes="100%"
            alt="logo"
            src="/bold-close.png"
            className="mr-[35px] mt-[5px]"
            priority
          />
        }
        width="100%"
        wrapClassName="fullscreen-modal"
        title={
          optionsView === "main" ? (
            <h3 className="text-[27px] font-[500] text-center mt-[-2px]">
              Options
            </h3>
          ) : (
            <div className="relative flex justify-center items-center h-full ml-[-16px] mt-[-5px]">
              <button
                onClick={() => setOptionsView("main")}
                className="absolute left-0 flex gap-[10px] items-center text-gray-600 hover:text-black cursor-pointer"
              >
                <Image
                  width={17}
                  height={25}
                  sizes="100%"
                  src="/bold-arrow.png"
                  alt="icon"
                  className="mt-[-3px] option-icon"
                  priority
                />
                <span className="font-[500] text-[27px] text-[#000]  popup-title">
                  Options
                </span>
              </button>
              <h3 className="text-[27px] font-[500] text-center  popup-title">
                Text size
              </h3>
            </div>
          )
        }
        transitionName=""
        maskTransitionName=""
      >
        <div className="max-w-[700px] mx-auto mt-4">
          {optionsView === "main" && (
            <div>
              {/* ... code cho view main không đổi ... */}
              <div className="go-submit cursor-pointer popup-bar-item">
                <div className="flex items-center gap-[25px]">
                  <Image
                    width={28}
                    height={24}
                    className="icon-left"
                    sizes="100%"
                    alt="logo"
                    src="/icon-plane.png"
                    priority
                  />
                  <div className="title">Go to submission page</div>
                </div>
                <Image
                  width={28}
                  height={24}
                  className="icon-right"
                  sizes="100%"
                  alt="logo"
                  src="/arrow-right.png"
                  priority
                />
              </div>
              <div className="tool-group">
                <div
                  className="tool-box  cursor-pointer popup-bar-item"
                  onClick={() => setOptionsView("textSize")}
                >
                  <div className="flex items-center gap-[25px]">
                    <Image
                      width={28}
                      height={24}
                      className="icon-left"
                      sizes="100%"
                      alt="logo"
                      src="/text-size-icon.png"
                      priority
                    />
                    <div className="title">Text size</div>
                  </div>
                  <Image
                    width={28}
                    height={24}
                    className="icon-right"
                    sizes="100%"
                    alt="logo"
                    src="/arrow-right.png"
                    priority
                  />
                </div>
              </div>
            </div>
          )}

          {/* ▼▼▼ BẮT ĐẦU THAY ĐỔI TẠI ĐÂY ▼▼▼ */}
          {optionsView === "textSize" && (
            <div className="border border-[#c5c5c5] rounded-[4px] overflow-hidden mt-[30px]">
              {textSizes.map((size) => (
                <button
                  key={size.key}
                  onClick={() => setSelectedTextSize(size.key)}
                  className="w-full flex items-center text-left px-[36px] py-[27px] border-b border-gray-300 last:border-b-0 hover:bg-gray-100 transition-colors"
                >
                  <span
                    className={`material-symbols-rounded check-size xbold mr-[25px] transition-opacity ${
                      selectedTextSize === size.key
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    check
                  </span>
                  <span className="text-[18px] size-text">{size.name}</span>
                </button>
              ))}
            </div>
          )}
          {/* ▲▲▲ KẾT THÚC THAY ĐỔI TẠI ĐÂY ▲▲▲ */}
        </div>
      </Modal>

      <Modal
        title="Quit"
        open={isModalOpen}
        onOk={() => {
          router.push("/");
          setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
        transitionName=""
        maskTransitionName=""
      >
        <p>Are you sure you want to quit?</p>
      </Modal>
    </>
  );
}

export default Header;
