import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from "@fortawesome/free-regular-svg-icons";

export const Index = () => {
  const style = {
    width: 200,
    height: 150,
    margin: '0 auto',
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

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });
  const file = acceptedFiles[0];

  let imageUrl;
  axios.get('/index', { withCredentials: true })
    .then((response) => {
      if (response.data.hasSession === 'No') {
        window.location.href = '/login';
      }
    });
  window.onload = () => {
    axios.get('/index', { withCredentials: true })
      .then(response => {
        const username = response.data.username;
        if (username) {
          document.getElementById('username').innerHTML = username;
        } else {
          document.getElementById('username').innerHTML = 'ゲスト';
        }
      });
    refreshToken();
  }
  const refreshToken = async () => {
    if ((Date.now() - localStorage.getItem('tokenGetTime')) >= 3600000) {
      const signin = () => {
        const endpoint = 'https://accounts.spotify.com/authorize';
        const scopes = ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private', 'user-library-modify'];
        const params = new URLSearchParams();
        params.append('client_id', process.env.REACT_APP_CLIENT_ID);
        params.append('response_type', 'code');
        params.append('redirect_uri', 'https://e-moods.herokuapp.com/');
        params.append('scope', scopes.join(' '));
        params.append('state', 'state');
        document.getElementById('signin_btn').innerHTML = '';
        window.location.href = `${endpoint}?${params.toString()}`;
      }
      document.getElementById('signin_btn').innerHTML = '<button id="signin" class="bg-green-500 rounded-lg py-2 px-4">Spotifyと連携</button>';
      document.getElementById('signin').addEventListener('click', () => {
        signin();
      });
      function getParam(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
      }
      if (getParam('code')) {
        await axios.post('/get_token', {code: getParam('code')}, { withCredentials: true }).then((response) => {
          console.log(response.data);
          localStorage.setItem('accessToken', response.data.data.access_token);
          localStorage.setItem('tokenGetTime', Date.now());
          document.getElementById('signin_btn').innerHTML = '';
        });
      }
    } else {
      document.getElementById('signin_btn').innerHTML = '';
    }
  }

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
    axios.post(`${process.env.REACT_APP_SERVER_URL}/save_image`, form, { headers })
      .then(async (response) => {
        await axios.post(`${process.env.REACT_APP_SERVER_URL}/emotions`, response.data, { withCredentials: true });
        window.location.href = '/analysed';
      });
  };

  return (
    <div id="main" className="w-1/3 mx-auto">
      <h1 className="text-5xl font-bold pt-24 pb-16">e-moods</h1>
      <p><span id="username"></span>の顔写真を送信することで<br/>写真から感情を分析しその結果に基づいて<br/>あなたにぴったりな3曲を選びます！</p>
      <div id="signin_btn" className="my-8"></div>
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
      <button id="make_recommendations" className="bg-green-500 rounded-lg py-2 px-4" onClick={() => startEmotionAnalysis()}>感情分析を開始</button><br/><br/>
    </div>
  );
};