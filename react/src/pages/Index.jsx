import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from "../img/logo_transparent.png";
import { faCheck, faMusic, faFileImport, faGear } from "@fortawesome/free-solid-svg-icons";
import { faHeart, faImage } from "@fortawesome/free-regular-svg-icons";
import { createRipples } from "react-ripples";

const ButtonRipples = createRipples({
  color: 'snow',
  during: 600
});

export const Index = () => {
  axios.get('/index', { withCredentials: true })
    .then((response) => {
      if (response.data.hasSession === 'No') {
        window.location.href = "/login";
        return;
      } else {
        axios.get('/success', { withCredentials: true })
          .then((response) => {
            if (response.data.status === 'NG') {
              window.location.href = "/spotify";
              return;
            }
          });
      }
    });

  const token = async () => {
    const response = await axios.get('/token', { withCredentials: true });
    return {
      accessToken: response.data.accessToken,
      tokenGetTime: response.data.tokenGetTime
    }
  };

  const refreshToken = async () => {
    const tokenGetTime = (await token()).tokenGetTime;
    if ((Date.now() - tokenGetTime) >= 3600000 || !tokenGetTime) {
      window.location.href = '/spotify';
    }
  }
  refreshToken();

  const style = {
    width: 200,
    height: 150,
    margin: '16px auto',
    border: '1px dotted #888',
    cursor: 'pointer'
  };

  const onDrop = ([file]) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl = e.target.result;
      document.getElementById('image_area').innerHTML = `<img src=${imageUrl} class="w-2/5 mx-auto" />`;
    }
    reader.readAsDataURL(file);
  }

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*', multiple: false });
  const file = acceptedFiles[0];

  let imageUrl;

  window.onload = () => {
    axios.get('/index', { withCredentials: true })
      .then(response => {
        const username = response.data.username;
        if (response.data.hasSession === 'No') {
          return;
        } else if (response.data.hasSession === 'Yes') {
          document.getElementById('username').innerHTML = username;
        } else {
          document.getElementById('username').innerHTML = 'ゲスト';
        }
      });
  }

  const startEmotionAnalysis = () => {
    if (!file) {
      document.getElementById('message').innerHTML = '<p>画像を選択してください</p>';
      return;
    }
    if (document.getElementById('signin')) {
      document.getElementById('message').innerHTML = '<p>「Spotifyと連携」ボタンを押してください</p>';
      return;
    }
    const blob = new Blob([file]);
    document.getElementById('main').innerHTML = '<p class="pt-24">感情を分析中...</p>';
    const form = new FormData();
    form.append('file', blob);
    const headers = { "content-type": "multipart/form-data", "withCredentials": true };
    axios.post('/analysis', form, { headers })
      .then(async (response) => {
        const result = await axios.post('/emotions', response.data, { withCredentials: true });
        if (result.data.error) {
          document.getElementById('message').innerHTML = `<p>${result.data.error}</p>`;
        } else {
          window.location.href = '/analysed';
        }
      });
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <div id="header" className="w-3/4 mx-auto pt-4 flex justify-center border-solid border-b-2 border-gray-100">
        <a href="/" className="mr-48"><img src={logo} alt="ロゴ" className="w-16 h-16" /></a>
        <a href="/setting"><FontAwesomeIcon className="text-4xl mt-3" icon={faGear} /></a>
      </div>
      <h1 className="text-5xl font-bold pt-8 pb-8">e-moods</h1>

      <div className="flex">
        <div className="w-1/4">
          <div className="relative">
            <div className="w-6 h-6 mx-auto bg-green-500 rounded-full text-base text-center text-gray-100 flex items-center z-2">
              <FontAwesomeIcon icon={faCheck} />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="relative">
            <div className="absolute w-full flex align-center items-center align-middle content-center top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-11/12 bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-0 bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-6 h-6 mx-auto bg-gray-200 rounded-full text-base text-center text-gray-500 flex items-center z-10">
              <FontAwesomeIcon icon={faHeart} />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="relative">
            <div className="absolute w-full flex align-center items-center align-middle content-center top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-11/12 bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-0 bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-6 h-6 mx-auto bg-gray-200 rounded-full text-base text-center text-gray-500 flex items-center z-10">
              <FontAwesomeIcon icon={faMusic} />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="relative">
            <div className="absolute w-full flex align-center items-center align-middle content-center top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-11/12 bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-0 bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-6 h-6 mx-auto bg-gray-200 rounded-full text-base text-center text-gray-500 flex items-center z-10">
              <FontAwesomeIcon icon={faFileImport} />
            </div>
          </div>
        </div>
      </div>

      <p><span id="username"></span>の顔写真を送信することで<br/>写真から感情を分析しその結果に基づいて<br/>あなたにぴったりな3曲を選びます！</p>
      <br />

      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <FontAwesomeIcon className="text-6xl mt-6 mb-4" icon={faImage} />
        {
          isDragActive ?
            <p className="w-full h-full m-auto">ドロップ</p> :
            <p className="w-full h-full m-auto">ドラッグ&ドロップ<br/>またはクリック</p>
        }
      </div>
      <div id="image_area" className="my-8 w-full"></div>
      <div id="message"></div>
      <ButtonRipples>
        <button id="make_recommendations" className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" onClick={() => startEmotionAnalysis()}>感情分析を開始</button>
      </ButtonRipples>
    </div>
  );
};