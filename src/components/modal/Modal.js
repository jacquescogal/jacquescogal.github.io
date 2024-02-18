import React from 'react'
import style from './Modal.module.scss'

const Modal = () => {
  return (
    <div className={style.ModalBase}>
        <div className={style.ModalBackground}/>
        <div className={style.ModalCard}>Hello</div>
    </div>
  )
}

export default Modal