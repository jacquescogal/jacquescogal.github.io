import React from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import remarkGfm from "remark-gfm";
import Modal from "./modal/Modal";


const Article = () => {
  return (
    <div className="prose text-primary-text">
      <Modal>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        hello
      </ReactMarkdown>
      </Modal>
    </div>
  );
}

export default Article