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

// const textareaEl = document.getElementById('message') as HTMLTextAreaElement;
const firstInput = document.getElementById("first-line") as HTMLInputElement;
const secondInput = document.getElementById("second-line") as HTMLInputElement;
const completeBtn = document.getElementById('complete-btn') as HTMLButtonElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const pcanvas = document.getElementById('canvas-preview') as HTMLCanvasElement;
const pctx = pcanvas.getContext('2d') as CanvasRenderingContext2D;

const API_POST_UPLOAD = 'https://api.hashsnap.net/posts/upload';
const START_ROUTE = 'intro';

const main = async () => { try {
  let PROJECT_UID = '';
  const dataSetting = $('data-hashsnap') as HTMLElement;
  PROJECT_UID = dataSetting.getAttribute('project-uid') as string;
  dataSetting.parentElement?.removeChild(dataSetting);

  const img_width = 615;
  const img_height = 220;
  canvas.width = pcanvas.width = img_width;
  canvas.height = pcanvas.height = img_height;
  canvas.style.aspectRatio = pcanvas.style.aspectRatio = `auto ${img_width} / 300`;
  
  const config = {
    debug: false,
    align: 'center',
    vAlign: 'top',
    fontSize: 72,
    fontWeight: '',
    fontStyle: '',
    fontVariant: '',
    font: 'Poor Story',
    lineHeight: 90,
    justify: false,
    maxLine: 2
  }
  
  canvasTxt.font = config.font;
  canvasTxt.fontSize = config.fontSize;
  canvasTxt.debug = config.debug;
  canvasTxt.align = config.align;
  canvasTxt.vAlign = config.vAlign;
  canvasTxt.justify = config.justify;

  // const lines = value.split("\n");
  // const space = 10;
  // for (let i = 0; i < lines.length; i++) {
  //   if (lines[i].length <= space) continue;
  //   lines[i + 1] = lines[i].substring(space + 1) + (lines[i + 1] || "");
  //   lines[i] = lines[i].substring(0, space);
  // }
  // textareaEl.value = lines.slice(0, space).join("\n");
  // const char_limit_pre_line = 10;
  // const lines_limit = 2;
  // const handlerInput = (ev: any) => {
  //   ev.preventDefault();
  //   const target = ev.target as HTMLTextAreaElement;
    // const lines = target.value.split('\n');
    // if (ev.data === null) {} 
    // else {
    //   for (let i = 0; i < lines.length; i++) {
    //     if (lines[i].length < char_limit_pre_line) continue;
    //     lines[i] = lines[i].substring(0, char_limit_pre_line);
    //     lines[i + 1] = lines[i].substring(char_limit_pre_line + 1) + (lines[i + 1] || "");
    //   }
    //   textareaEl.value = lines.slice(0, lines_limit).join("\n");
    // }
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   pctx.clearRect(0, 0, canvas.width, canvas.height);
  //   canvasTxt.drawText(ctx, target.value, 0, (canvas.height-180)/2, canvas.width, canvas.height);
  //   pctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  // }
  // textareaEl.addEventListener('input', handlerInput);

  firstInput.addEventListener('input', (ev: Event) => {
    ev.preventDefault()
    const target = ev.target as HTMLInputElement;
    ctx.clearRect(0, 0, canvas.width, 110);
    ctx.font = '72px Poor Story';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(target.value, canvas.width/2, 72 + 20);
    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(0, 0, canvas.width, 110)
  })
  secondInput.addEventListener('input', (ev: Event) => {
    ev.preventDefault()
    const target = ev.target as HTMLInputElement;
    ctx.clearRect(0, 110, canvas.width, 110);
    ctx.font = '72px Poor Story';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(target.value, canvas.width/2, 72 + 72 + 30);
    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(0, 110, canvas.width, 110)
  })

  completeBtn.addEventListener('click', async () => {
    return;
    // if (!textareaEl.value.length) {
    //   popupRouter.push('popup-warn'); 
    //   await sleep(1500);
    //   popupRouter.hide();
    // } else {
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
    //   textareaEl.value = '';
    // }
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