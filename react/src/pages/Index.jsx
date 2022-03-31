import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from "@fortawesome/free-regular-svg-icons";

export const Index = async () => {
  const token = async () => {
    const response = await axios.get('/token', { withCredentials: true });
    console.log(response);
    return {
      accessToken: response.data.accessToken,
      tokenGetTime: response.data.tokenGetTime
    }
  };
  
  const refreshToken = async () => {
    const accessToken = (await token()).accessToken;
    const tokenGetTime = (await token()).tokenGetTime;
    console.log(tokenGetTime);
    if ((Date.now() - tokenGetTime) >= 3600000 || !tokenGetTime) {
      const signin = () => {
        const endpoint = 'https://accounts.spotify.com/authorize';
        const scopes = ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private'];
        const params = new URLSearchParams();
        params.append('client_id', process.env.REACT_APP_CLIENT_ID);
        params.append('response_type', 'code');
        params.append('redirect_uri', 'https://e-moods.herokuapp.com/get_token');
        params.append('scope', scopes.join(' '));
        params.append('state', 'state');
        document.getElementById('signin_btn').innerHTML = '';
        window.location.href = `${endpoint}?${params.toString()}`;
      }
      document.getElementById('signin_btn').innerHTML = '<button id="signin" class="bg-green-500 rounded-lg w-48 py-2 px-4">Spotifyと連携</button>';
      document.getElementById('signin').addEventListener('click', () => {
        signin();
      });
    } else {
      document.getElementById('signin_btn').innerHTML = '';
    }
  }

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

  const response = await axios.get('/index', { withCredentials: true });
  let username;
  if (response.data.hasSession === 'No') {
    window.location.href = '/login';
    return;
  } else {
    username = response.data.username;
  }
  refreshToken();

  const startEmotionAnalysis = () => {
    if (!file) {
      document.getElementById('image_area').innerHTML = '<p>画像を選択してください</p>';
      return;
    }
    const blob = new Blob([file]);
    document.getElementById('main').innerHTML = '<p class="pt-24">感情を分析中...</p>';
    const form = new FormData();
    form.append('file', blob);
    const headers = { "content-type": "multipart/form-data", "withCredentials": true };
    axios.post('/save_image', form, { headers })
      .then(async (response) => {
        const result = await axios.post('/emotions', response.data, { withCredentials: true });
        if (result.data.error) {
          document.getElementById('message').innerHTML = `<p>${result.data.error}</p>`;
        } else {
          document.getElementById('main').innerHTML = '<span class="pt-24"></span><br/><a href="/analysed" class="bg-green-500 rounded-lg w-48 py-2 px-4 mt-24">分析結果を表示</a>';
        }
      });
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-5xl font-bold pt-24 pb-16">e-moods</h1>
      <p>{ username ? <span>username</span> : <span>'ゲスト</span>}の顔写真を送信することで<br/>写真から感情を分析しその結果に基づいて<br/>あなたにぴったりな3曲を選びます！</p>
      <div id="signin_btn" className="my-8"></div>
      <a href="/setting" className="bg-green-500 rounded-lg w-48 py-2 px-4">設定アーティスト変更</a>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <FontAwesomeIcon className="text-6xl mt-6 mb-4" icon={faImage} />
        {
          isDragActive ?
            <p className="w-full h-full m-auto">Drop</p> :
            <p className="w-full h-full m-auto">Drag & Drop or Click</p>
        }
      </div>
      <div id="image_area" className="my-8 w-full"></div>
      <button id="make_recommendations" className="bg-green-500 rounded-lg w-48 py-2 px-4" onClick={() => startEmotionAnalysis()}>感情分析を開始</button><br/><br/>
      <div id="message"></div>
    </div>
  );
};