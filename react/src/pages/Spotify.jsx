import axios from "axios";

export const Spotify = ({ title }) => {
  axios.get('/index', { withCredentials: true })
    .then((response) => {
      if (response.data.hasSession === 'No') {
        window.location.href = "/login";
      }
    });

  const signin = () => {
    const endpoint = 'https://accounts.spotify.com/authorize';
    const scopes = ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private'];
    const params = new URLSearchParams();
    params.append('client_id', process.env.REACT_APP_CLIENT_ID || '');
    params.append('response_type', 'code');
    params.append('redirect_uri', 'https://e-moods.herokuapp.com/first_get_token' || '');
    params.append('scope', scopes.join(' '));
    params.append('state', 'state');
    window.location.href = `${endpoint}?${params.toString()}`;
  }

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <p>あなたのSpotifyアカウントと連携します</p>
      <p>よろしければ「Spotifyと連携」ボタンをクリックしてください</p>
      <button className="bg-green-500 rounded-lg inline-block w-48 h-10 align-middle py-2 mt-8 mb-16" onClick={() => signin()}>Spotifyと連携</button>
      <div id="next"></div>
    </div>
  );
};