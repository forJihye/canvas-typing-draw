// import './style.css';
import Router from './router';
import {singleListener} from './single-listener';
import canvasTxt from './canvas-txt';
// import axios from 'axios';
const $$ = document.querySelectorAll.bind(document);
const $ = document.querySelector.bind(document);
// const rest = (index: number, total: number) => (total + index % total) % total;
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
// const canvas2Blob = (canvas: HTMLCanvasElement, options: {type: string; quality: number}) => new Promise(res => canvas.toBlob(res, options.type, options.quality));
// const blob2File = (blob: Blob, options: {name: string; type: string; }) =>  new Promise(res => res(new File([blob], options.name, {type: options.type, lastModified: Date.now()})));
// const file2FormData = (params: {[key: string]: any}) => new Promise(res => {
//   const fd = new FormData();
//   for (const name in params) fd.append(name, params[name])
//   res(fd);
// });
// for (let i = 0; i < lines.length; i++) {
//   count += lines[i].length;
//   if (count > 20) {
//     const slice = 20 - (count - lines[i].length);
//     lines[i] = lines[i].substring(0, slice);
//     console.log(lines[i])
//   }
// }
// target.value = lines.slice(0, 2).join('\n')
const textareaEl = $('#message') as HTMLTextAreaElement;
const completeBtn = $('#complete-btn') as HTMLButtonElement;
const feedback = $('.feedback') as HTMLDivElement
const messageCount = $('#length') as HTMLSpanElement;

const START_ROUTE = 'intro';

const main = async () => { try {
  // let PROJECT_UID = '';
  // const API_POST_UPLOAD = 'https://api.hashsnap.net/posts/upload';
  // const dataSetting = $('data-hashsnap') as HTMLElement;
  // PROJECT_UID = dataSetting.getAttribute('project-uid') as string;
  // dataSetting.parentElement?.removeChild(dataSetting);
  messageCount.innerText = '0';
  let flag = false;
  const handlerInput = (ev: any) => {
    ev.preventDefault();
    const target = ev.target as HTMLTextAreaElement;
    feedback.innerText = '';
    feedback.style.visibility = 'hidden';
    
    const lines = target.value.split('\n')
    const length = lines.join('').length;
    messageCount.innerText = String(length);

    const height = target.scrollHeight;
    if (height > 100) {
      flag = true;
      feedback.style.visibility = 'visible';
      feedback.innerText = '최대 2줄 / 20자 내외로 입력 가능합니다';
      target.value = target.value.substring(0, target.value.length - 1);
    } else if (target.value.length > 20) {
      flag = true;
      feedback.style.visibility = 'visible';
      feedback.innerText = '최대 2줄 / 20자 내외로 입력 가능합니다';
      target.value = target.value.substring(0, 20);
    } else {
      flag = false;
    }
  }
  // textareaEl.value = '여기에 입력해 주세요.\n(2줄 / 20자 내외)';d
  // textareaEl.addEventListener('focus', (ev ) => {
  //   ev.preventDefault();
  //   const target = ev.target as HTMLTextAreaElement;
  //   target.value = '';
  // });
  textareaEl.addEventListener('input', handlerInput);

  const config = {
    debug: false,
    align: 'left',
    vAlign: 'middle',
    fontSize: 42,
    fontWeight: '900',
    fontStyle: '',
    fontVariant: '',
    font: 'Hyundai Sans Text',
    lineHeight: 50,
    justify: false,
  }
  canvasTxt.align = config.align;
  canvasTxt.font = config.font;
  canvasTxt.fontSize = config.fontSize;
  canvasTxt.fontWeight = config.fontWeight;
  canvasTxt.lineHeight = config.lineHeight;

  const pcanvas = document.getElementById('preview') as HTMLCanvasElement;
  const pctx = pcanvas.getContext('2d') as CanvasRenderingContext2D;

  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  completeBtn.addEventListener('click', async () => {
    if (flag) return;
    if (!textareaEl.value.length) {
      popupRouter.push('popup-warn'); 
      await sleep(1500);
      popupRouter.hide();
    } else {
      popupRouter.push('popup-loding');
      try {
        const rect = textareaEl.getBoundingClientRect() as DOMRect;
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        canvas.width = pcanvas.width = width;
        canvas.height = pcanvas.height = height;
        canvasTxt.drawText(ctx, textareaEl.value, 0, -8, width, height);
        
        pctx.fillStyle = '#fff';
        pctx.fillRect(0, 0, width, height);
        pctx.drawImage(canvas, 0, 0)
        // const blob = await canvas2Blob(canvas, {type: 'image/png', quality: 1}) as Blob;
        // const file = await blob2File(blob, {name: 'photo.png', type: 'image/png'}) as File;
        // const fd = await file2FormData({
        //   image: file,
        //   resolver: 'moderation'
        // }) as FormData;
        // await axios.post(`${API_POST_UPLOAD}/${PROJECT_UID}`, fd, {
        //   headers: { 'Content-Type': 'multipart/form-data' }
        // });
        popupRouter.hide();
        await sleep(1);
        pageRouter.push('ending');
        await sleep(10000);
        pageRouter.push('intro');
      } catch (err) {
        console.error(err)
        popupRouter.push('popup-error');
        await sleep(5000);
        popupRouter.hide();
      }
      textareaEl.value = '';
    }
  });

  const clickGoto = Array.from($$('[click-goto]')) as HTMLElement[];
  clickGoto.forEach(el => singleListener.add(el, 'click', () => pageRouter.push(el.getAttribute('click-goto') as string)));

  const pageEls = Array.from($$('page-route')) as HTMLElement[];
  const pageRouter = new Router(pageEls);
  pageRouter.push(START_ROUTE);
  const popupEls = Array.from($$('popup-route')) as HTMLElement[];
  const popupRouter = new Router(popupEls);
  popupRouter.hide();
} catch(err: any) {
  throw Error(err);
}}
main();