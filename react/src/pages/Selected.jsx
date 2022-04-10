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

export const Selected = () => {
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

  let playlistTrackIdArray;

  window.onload = () => {
    axios.get('/tracks', { withCredentials: true })
      .then(response => {
        playlistTrackIdArray = response.data;
        let playlistTagArray = '<span class="ml-2"></span>';
        playlistTrackIdArray.forEach(value => {
          playlistTagArray += `<iframe id="${value} class="px-4" style="border-radius:12px" width="240" height="320"
          src="https://open.spotify.com/embed/track/${value}?utm_source=generator"
            frameBorder="0" allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe><span class="ml-2"></span>`;
        });
        document.getElementById('playlist_result').innerHTML = playlistTagArray;
      });

    document.getElementById('playlist_name').onkeydown = (e) => {
      if (e.key === 'Enter') {
        document.getElementById('playlist_btn').click();
      }
    }
  }


  const selectTracksAgain = () => {
    window.location.href = '/analysed';
  };

  const makePlaylist = async () => {
    if (!document.getElementById('playlist_name').value) {
      document.getElementById('caution').innerHTML = 'プレイリスト名を入力してください';
      return;
    }
    const accessToken = (await token()).accessToken;
    const tokenGetTime = (await token()).tokenGetTime;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
    const data = {
      'name': `${document.getElementById('playlist_name').value}`,
      'description': 'automatically created by e-moods',
      'public': false
    };
    const uris = playlistTrackIdArray.map(value => {
      return `spotify:track:${value}`;
    });
    const tracks = {
      'uris': uris
    };

    document.getElementById('main').innerHTML = '<p class="pt-24">インポート中...</p>';
    await axios.get('/insert_emotions_and_tracks', { withCredentials: true });
    const meResponse = await axios.get('https://api.spotify.com/v1/me', { headers: headers });
    const makePlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${meResponse.data.id}/playlists`, data, { headers: headers });
    await axios.post(`https://api.spotify.com/v1/playlists/${makePlaylistResponse.data.id}/tracks`, tracks, { headers: headers });
    await axios.post('/playlist', { id: makePlaylistResponse.data.id }, { withCredentials: true });
    window.location.href = '/imported';
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <div id="header" className="w-3/4 mx-auto pt-4 flex justify-center border-solid border-b-2 border-gray-100">
        <a href="/"><img src={logo} alt="ロゴ" className="w-16 h-16 mr-48" /></a>
        <a href="/setting"><FontAwesomeIcon className="text-4xl mt-3" icon={faGear} /></a>
      </div>
      <h1 className="text-3xl font-bold pt-8 pb-16">選曲完了</h1>

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
                <div className="w-0 bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full text-base text-gray-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileImport} />
            </div>
          </div>
        </div>
      </div>

      <p>あなたにピッタリな曲をご用意しました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <ButtonRipples id="signin_btn"></ButtonRipples><br/>
      <div id="caution"></div>
      <input type="text" id="playlist_name" className="text-gray-900 rounded-md px-2 mb-4" placeholder="プレイリスト名" /><br/>
      <ButtonRipples>
        <button id="playlist_btn" className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" onClick={() => makePlaylist()}>プレイリスト作成</button>
      </ButtonRipples>
      <br/><br/>
      <ButtonRipples>
        <button className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" onClick={() => selectTracksAgain()}>選曲をやり直す</button>
      </ButtonRipples>
      <br/><br/>
    </div>
  );
}