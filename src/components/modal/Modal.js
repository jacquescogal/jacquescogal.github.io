import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setShowModal } from "../../store/modalStateSlice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Modal = () => {
  const showModal = useSelector((state) => state.modalState.showModal);
  const content = useSelector((state) => state.modalState.content);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[30000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 animate-[modal-appear_1s_cubic-bezier(0.075,0.82,0.165,1)_both]" 
          onClick={()=>dispatch(setShowModal(false))}
          />
          <div className="absolute z-10 bg-alt w-[90%] h-[90%] bg-background-alt rounded-md p-4 text-left overflow-y-scroll overscroll-contain">
            <div className="prose text-primary-text prose-headings:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
