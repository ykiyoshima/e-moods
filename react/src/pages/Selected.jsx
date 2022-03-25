import axios from 'axios';

export const Selected = () => {
  let playlistTrackIdArray;
  const refreshToken = async () => {
    if ((Date.now() - localStorage.getItem('tokenGetTime')) >= 3600000) {
      const signin = () => {
        const endpoint = 'https://accounts.spotify.com/authorize';
        const scopes = ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private', 'user-library-modify'];
        const params = new URLSearchParams();
        params.append('client_id', process.env.REACT_APP_CLIENT_ID);
        params.append('response_type', 'code');
        params.append('redirect_uri', 'http://localhost:3000/');
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
        await axios.post('http://localhost:3002/get_token', {code: getParam('code')}, { withCredentials: true }).then((response) => {
          console.log(response.data);
          localStorage.setItem('accessToken', response.data.data.access_token);
          localStorage.setItem('tokenGetTime', Date.now());
        });
      }
    } else {
      document.getElementById('signin_btn').innerHTML = '';
    }
  }

  window.onload = () => {
    refreshToken();
  }

  axios.get('http://localhost:3002/tracks', { withCredentials: true })
    .then(response => {
      playlistTrackIdArray = response.data;
      let playlistTagArray = '<span class="ml-2"></span>';
      playlistTrackIdArray.forEach(value => {
        playlistTagArray += `<iframe id="${value} class="px-4" style="border-radius:12px"
          src="https://open.spotify.com/embed/track/${value}?utm_source=generator" width="240" height="320"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe><span class="ml-2"></span>`;
      });
      document.getElementById('playlist_result').innerHTML = playlistTagArray;
    });

  const selectTracksAgain = () => {
    window.location.href = '/analysed';
  };

  const makePlaylist = async () => {
    if (!document.getElementById('playlist_name').value) {
      document.getElementById('caution').innerHTML = 'プレイリスト名を入力してください';
      return;
    }
    refreshToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
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
    await axios.get('http://localhost:3002/insert_emotions_and_tracks', { withCredentials: true });
    const meResponse = await axios.get('https://api.spotify.com/v1/me', { headers: headers });
    const makePlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${meResponse.data.id}/playlists`, data, { headers: headers });
    await axios.post(`https://api.spotify.com/v1/playlists/${makePlaylistResponse.data.id}/tracks`, tracks, { headers: headers });
    window.location.href = '/imported';
  };

  const backToIndex = () => {
    window.location.href = '/';
  };

  return (
    <div id="main" className="w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">選曲完了</h1>
      <p>あなたにピッタリな曲をご用意しました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <div id="signin_btn"></div>
      <div id="caution"></div>
      <input type="text" id="playlist_name" className="text-gray-900 rounded-md px-2" placeholder="プレイリスト名" /><br/>
      <button id="playlist_btn" className="bg-green-500 rounded-lg py-2 px-4 mt-4 mb-6" onClick={() => makePlaylist()}>プレイリスト作成</button><br />
      <button className="bg-green-500 rounded-lg py-2 px-4" onClick={() => selectTracksAgain()}>選曲をやり直す</button><br />
      <button className="bg-green-500 rounded-lg py-2 px-4 my-12" onClick={() => backToIndex()}>トップへ戻る</button>
    </div>
  );
}