import './style.css';
import Router from './router';
import {singleListener} from './single-listener';
import axios from 'axios';
import canvasTxt from './canvas-txt';

const $$ = document.querySelectorAll.bind(document);
const $ = document.querySelector.bind(document);

// const rest = (index: number, total: number) => (total + index % total) % total;
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const canvas2Blob = (canvas: HTMLCanvasElement, options: {type: string; quality: number}) => new Promise(res => canvas.toBlob(res, options.type, options.quality));
const blob2File = (blob: Blob, options: {name: string; type: string; }) =>  new Promise(res => res(new File([blob], options.name, {type: options.type, lastModified: Date.now()})));
const file2FormData = (params: {[key: string]: any}) => new Promise(res => {
  const fd = new FormData();
  for (const name in params) fd.append(name, params[name])
  res(fd);
});

const textareaEl = document.getElementById('message') as HTMLTextAreaElement;
const completeBtn = document.getElementById('complete-btn') as HTMLButtonElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const pcanvas = document.getElementById('canvas-preview') as HTMLCanvasElement;
const pctx = pcanvas.getContext('2d') as CanvasRenderingContext2D;

const API_POST_UPLOAD = 'https://api.hashsnap.net/posts/upload';
const START_ROUTE = 'intro';

const main = async () => { try {
  let PROJECT_UID = '';
  let MAX_IMAGE_WIDTH = 0;
  const dataSetting = $('data-hashsnap') as HTMLElement;
  PROJECT_UID = dataSetting.getAttribute('project-uid') as string;
  MAX_IMAGE_WIDTH = Number(dataSetting.getAttribute('max-image-width')) ?? 1080;
  dataSetting.parentElement?.removeChild(dataSetting);

  canvas.width = pcanvas.width = MAX_IMAGE_WIDTH;
  canvas.height = pcanvas.height = 500;
  canvas.style.aspectRatio = pcanvas.style.aspectRatio = `auto ${MAX_IMAGE_WIDTH} / 300`;
  
  const config = {
    text: '',
    pos: { x: 0, y: 0 },
    size: { w: 1080, h: 500 },
    font: { size: 52, lineHeight: 30 },
    debug: true,
    align: 'center',
    vAlign: 'middle',
    justify: false,
    min: 0,
    max: 800,
    maxLine: 5
  }

  const handlerInput = (ev: Event) => {
    ev.preventDefault();
    const value = (ev.target as HTMLInputElement).value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvasTxt.font = "'Poor Story'";
    canvasTxt.fontSize = 72;
    canvasTxt.debug = config.debug;
    canvasTxt.align = config.align;
    canvasTxt.vAlign = config.vAlign;
    canvasTxt.justify = config.justify;
    canvasTxt.drawText(ctx, value, 0, 0, canvas.width, canvas.height);
    // pctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // pctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = 'transparent';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.font = '48px Poor Story';
    // ctx.textAlign = 'center';
    // ctx.fillStyle = '#000';
    // ctx.fillText(value, canvas.width/2, canvas.height/2 + 24);
  }
  textareaEl.addEventListener('input', handlerInput);

  completeBtn.addEventListener('click', async () => {
    return;
    if (!textareaEl.value.length) {
      popupRouter.push('popup-warn'); 
      await sleep(1500);
      popupRouter.hide();
    } else {
      popupRouter.push('popup-loding');
      try {
        const blob = await canvas2Blob(canvas, {type: 'image/png', quality: 1}) as Blob;
        const file = await blob2File(blob, {name: 'photo.png', type: 'image/png'}) as File;
        const fd = await file2FormData({
          image: file,
          resolver: 'moderation'
        }) as FormData;
        await axios.post(`${API_POST_UPLOAD}/${PROJECT_UID}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        popupRouter.hide();
        await sleep(1);
        pageRouter.push('ending');
        await sleep(3000);
        pageRouter.push('intro');
      } catch (err) {
        popupRouter.push('popup-error');
        await sleep(5000);
        popupRouter.hide();
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pctx.clearRect(0, 0, canvas.width, canvas.height);
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