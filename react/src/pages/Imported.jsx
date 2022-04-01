import axios from 'axios';

export const Imported = () => {
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

  const tweet = () => {
    const baseUrl = 'https://twitter.com/intent/tweet?';
    const text = ['text', 'ツイート本文'];
    const hashtags = ['hashtags', ['ハッシュタグ1', 'ハッシュタグ2'].join(',')];
    const query = new URLSearchParams([text, hashtags]).toString();
    window.location.href = `${baseUrl}${query}`;
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">インポート完了</h1>
      <p>選ばれた曲をプレイリストとして<br />Spotifyにインポートしました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <button className="bg-green-500 rounded-lg w-48 py-2 px-4" onClick={() => tweet()}>トップへ戻る</button>
      <a href="/" className="bg-green-500 rounded-lg w-48 py-2 px-4">トップへ戻る</a>
    </div>
  );
};