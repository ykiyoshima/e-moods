import axios from 'axios';

export const Imported = () => {
  axios.get('/tracks', { withCredentials: true })
    .then(response => {
      console.log(response);
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

  const backToIndex = () => {
    window.location.href = '/';
  };

  return (
    <div id="main" className="w-1/3 sm:w-full mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">インポート完了</h1>
      <p>選ばれた曲をプレイリストとして<br />Spotifyにインポートしました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <button className="bg-green-500 rounded-lg py-2 px-4" onClick={() => backToIndex()}>トップへ戻る</button>
    </div>
  );
};