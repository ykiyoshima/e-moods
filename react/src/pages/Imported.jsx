import axios from 'axios';
import { createRipples } from "react-ripples";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from "../img/logo_transparent.png";
import { faCheck, faMusic, faFileImport, faGear } from "@fortawesome/free-solid-svg-icons";
import { faHeart, faImage } from "@fortawesome/free-regular-svg-icons";

const ButtonRipples = createRipples({
  color: 'snow',
  during: 600
});

export const Imported = () => {
  axios.get('/index', { withCredentials: true })
    .then((response) => {
      if (response.data.hasSession === 'No') {
        window.location.href = "/login";
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

  axios.get('/tracks', { withCredentials: true })
    .then(response => {
      const playlistTrackIdArray = response.data;
      let playlistTagArray = '<span class="ml-2"></span>';
      playlistTrackIdArray.forEach(value => {
        playlistTagArray += `<iframe id="${value} class="px-4" style="border-radius:12px"
          src="https://open.spotify.com/embed/track/${value}?utm_source=generator" width="240" height="320"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe><span class="ml-2"></span>`;
      });
      document.getElementById('playlist_result').innerHTML = playlistTagArray;
    });

  axios.get('/playlist', { withCredentials: true })
    .then(response => {
      const playlistId = response.data.playlistId;
      axios.get('/emotions', { withCredentials: true })
        .then(emotionsResponse => {
          const { anger, contempt, disgust, fear, happiness, neutral, sadness, surprise } = emotionsResponse.data;
          const emotionsObject = { '怒り': anger, '軽蔑': contempt, '嫌悪': disgust, '恐怖': fear, '幸せ': happiness, '中立': neutral, '悲しみ': sadness, '驚き': surprise };
          const maxEmotionValue = Math.max(...Object.values(emotionsObject));
          const maxEmotionName = Object.keys(emotionsObject).filter((key) => { return emotionsObject[key] === maxEmotionValue });
          const baseUrl = 'https://twitter.com/intent/tweet?';
          const text = ['text', `感情分析の結果、${maxEmotionName}が${Math.round(maxEmotionValue * 100)}%の私に合う楽曲はこちら！`];
          const hashtags = ['hashtags', ['e_moods', '今の気分に合う楽曲を選びます'].join(',')];
          const url = ['url', `https://open.spotify.com/playlist/${playlistId}\nhttps://e-moods.herokuapp.com`];
          const query = new URLSearchParams([text, hashtags, url]).toString();
          document.getElementById('tweet').href = `${baseUrl}${query}`;
        });
    });

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <div id="header" className="w-3/4 mx-auto pt-4 flex justify-between border-solid border-b-2 border-gray-100">
        <a href="/"><img src={logo} alt="ロゴ" className="w-16 h-16" /></a>
        <a href="/setting"><FontAwesomeIcon className="text-4xl mt-3" icon={faGear} /></a>
      </div>
      <h1 className="text-3xl font-bold pt-8 pb-16">インポート完了</h1>

      <div className="flex">
        <div className="w-1/4">
          <div className="relative">
            <div className="w-8 h-8 mx-auto bg-green-500 rounded-full text-base text-gray-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="relative">
            <div className="absolute w-3/4 flex align-center items-center align-middle content-center top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-full bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-full bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-8 h-8 mx-auto bg-green-500 rounded-full text-base text-gray-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faHeart} />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="relative">
            <div className="absolute w-3/4 flex align-center items-center align-middle content-center top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-full bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-full bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-8 h-8 mx-auto bg-green-500 rounded-full text-base text-gray-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faMusic} />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="relative">
            <div className="absolute w-3/4 flex align-center items-center align-middle content-center top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-full bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-full bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-8 h-8 mx-auto bg-green-500 rounded-full text-base text-gray-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileImport} />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4">選ばれた曲をプレイリストとして<br />Spotifyにインポートしました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <ButtonRipples>
        <a id="tweet" className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" target="_blank" rel="noopener noreferrer">結果をツイート</a>
      </ButtonRipples>
      <br/>
      <div className="w-full h-12"></div>
      <ButtonRipples>
        <a href="/" className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2">トップへ戻る</a>
      </ButtonRipples>
    </div>
  );
};