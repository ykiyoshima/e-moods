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
          const text = ['text', `感情分析の結果、${maxEmotionName}が${~~(maxEmotionValue) * 100}%の私に合う楽曲はこちら！\n`];
          const hashtags = ['hashtags', ['e_moods', '今の気分に合う楽曲を選びます'].join(',')];
          const url = ['url', `https://open.spotify.com/playlist/${playlistId} \nhttps://e-moods.herokuapp.com \n`];
          const query = new URLSearchParams([text, hashtags, url]).toString();
          document.getElementById('tweet').href = `${baseUrl}${query}`;
        });
    });

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">インポート完了</h1>
      <p>選ばれた曲をプレイリストとして<br />Spotifyにインポートしました！</p>
      <div id="playlist_result" className="w-3/4 my-8 mx-auto flex overflow-scroll"></div>
      <a id="tweet" className="bg-green-500 rounded-lg inline-block w-48 h-12 leading-12 py-2" target="_blank" rel="noopener noreferrer">結果をツイート</a><br/>
      <div className="w-full h-12"></div>
      <a href="/" className="bg-green-500 rounded-lg inline-block w-48 h-12 leading-12 py-2">トップへ戻る</a>
    </div>
  );
};