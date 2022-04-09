import axios from 'axios';
import { createRipples } from "react-ripples";

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

  let playlistTrackIdArray;

  const token = async () => {
    const response = await axios.get('/token', { withCredentials: true });
    return {
      accessToken: response.data.accessToken,
      tokenGetTime: response.data.tokenGetTime
    }
  };

  const refreshToken = async () => {
    const accessToken = (await token()).accessToken;
    const tokenGetTime = (await token()).tokenGetTime;

    if ((Date.now() - tokenGetTime) >= 3600000) {
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
      document.getElementById('signin_btn').innerHTML = '<button id="signin" class="bg-green-500 hover:bg-green-600 rounded-lg w-48 py-2 px-4">Spotifyと連携</button>';
      document.getElementById('signin').addEventListener('click', () => {
        signin();
      });
    } else {
      document.getElementById('signin_btn').innerHTML = '';
    }
  }

  window.onload = () => {
    refreshToken();
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
      <div id="header" className="pt-4 flex justify-center">
        <a href="/"><img src={logo} alt="ロゴ" className="w-16 h-16 mr-48" /></a>
        <a href="/setting"><FontAwesomeIcon className="text-4xl mt-3" icon={faGear} /></a>
      </div>
      <h1 className="text-3xl font-bold pt-24 pb-16">選曲完了</h1>
      <p>あなたにピッタリな曲をご用意しました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <ButtonRipples id="signin_btn"></ButtonRipples><br/>
      <div id="caution"></div>
      <input type="text" id="playlist_name" className="text-gray-900 rounded-md px-2" placeholder="プレイリスト名" /><br/>
      <ButtonRipples>
        <button id="playlist_btn" className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2 mt-4 mb-6" onClick={() => makePlaylist()}>プレイリスト作成</button>
      </ButtonRipples>
      <br/>
      <ButtonRipples>
        <button className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" onClick={() => selectTracksAgain()}>選曲をやり直す</button>
      </ButtonRipples>
      <br/><br/>
      <ButtonRipples>
        <a href="/" className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2">トップへ戻る</a>
      </ButtonRipples>
    </div>
  );
}