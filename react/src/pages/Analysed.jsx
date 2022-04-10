import axios from "axios";
import { createRipples } from "react-ripples";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from "../img/logo_transparent.png";
import { faCheck, faMusic, faFileImport, faGear } from "@fortawesome/free-solid-svg-icons";
import { faHeart, faImage } from "@fortawesome/free-regular-svg-icons";

const ButtonRipples = createRipples({
  color: 'snow',
  during: 600
});

export const Analysed = () => {
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

  let emotionsResponse;
  const playlistTrackIdArray = [];
  let previousPlaylistTrackIdArray = [];

  window.onload = async () => {
    emotionsResponse = await axios.get('/emotions', { withCredentials: true });
    const { anger, contempt, disgust, fear, happiness, neutral, sadness, surprise } = emotionsResponse.data;
    document.getElementById('analysis_result').innerHTML = `<p>あなたの感情は以下のようです</p><p class="my-4">怒り：${(Math.round(anger * 100 * 100)) / 100}%  軽蔑：${(Math.round(contempt * 100 * 100)) / 100}%  嫌悪：${(Math.round(disgust * 100 * 100)) / 100}%  恐怖：${(Math.round(fear * 100 * 100)) / 100}%<br/>幸せ：${(Math.round(happiness * 100 * 100)) / 100}%  中立：${(Math.round(neutral * 100 * 100)) / 100}%  悲しみ：${(Math.round(sadness * 100 * 100)) / 100}%  驚き：${(Math.round(surprise * 100 * 100)) / 100}%</p>`;
  }

  const selectTracks = async (e) => {
    if (!document.querySelector('input[type=radio]:checked')) {
      document.getElementById('message').innerHTML = '<p>選曲オプションを選択してください</p>';
      return;
    }
    const selectedOption = document.querySelector('input[type=radio]:checked').value;
    document.getElementById('main').innerHTML = '<p class="pt-24">選曲中...</p>';

    playlistTrackIdArray.length = 0;
    const accessToken = (await token()).accessToken;
    const tokenGetTime = (await token()).tokenGetTime;

    const tracksResponse = await axios.get('/tracks', { withCredentials: true });
    if (tracksResponse.data) {
      previousPlaylistTrackIdArray = tracksResponse.data.concat();
    }

    const favoritesResponse = await axios.get('/index', { withCredentials: true });
    const { favorite_id_1, favorite_id_2, favorite_id_3, favorite_id_4, favorite_id_5 } = favoritesResponse.data;
    const { anger, contempt, disgust, fear, happiness, neutral, sadness, surprise } = emotionsResponse.data;
    const sumOfEmotions = {
      'valence': anger * 0 + contempt * 0.25 + disgust * 0 + fear * 0 + happiness * 1 + neutral * 0.5 + sadness * 0 + surprise * 0.5,
      'energy': anger * 1 + contempt * 0 + disgust * 0.25 + fear * 0.5 + happiness * 1 + neutral * 0.5 + sadness * 0 + surprise * 1
    }
    const reversedSumOfEmotions = {
      'valence': anger * 1 + contempt * 0.75 + disgust * 1 + fear * 1 + happiness * 0 + neutral * 0.5 + sadness * 1 + surprise * 0.5,
      'energy': anger * 0 + contempt * 1 + disgust * 0.75 + fear * 0.5 + happiness * 0 + neutral * 0.5 + sadness * 1 + surprise * 0
    }

    let danceability;
    let instrumentalness;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    const trackFeaturesFromEmotions = {};
    do {
      const randomNumber = ~~(Math.random() * 9) + 1;
      let suitableRate;
      switch (e.target.value) {
        case 'yes':
          suitableRate = 10;
          break;
        case 'no':
          suitableRate = 0;
          break;
        case 'auto':
          suitableRate = 7;
          break;
        default:
          console.log('Something is wrong...');
          break;
      }
      console.log(randomNumber);
      if (randomNumber <= suitableRate) {
        let sumOfSum1vs3;
        if (sumOfEmotions['valence'] === 1 || sumOfEmotions['energy'] === 1) {
          sumOfSum1vs3 = 1;
        } else {
          sumOfSum1vs3 = (sumOfEmotions['valence'] / 4 + sumOfEmotions['energy'] * 3 / 4);
        }
        const sumOfSum1vs1 = (sumOfEmotions['valence'] / 2 + sumOfEmotions['energy'] / 2);
        if (sumOfSum1vs1 < 0.5) {
          danceability = (Math.sin(sumOfSum1vs1 * Math.PI - Math.PI / 2) + 1) / 2 + 0.5;
        } else {
          danceability = (Math.cos(sumOfSum1vs1 * 4 * Math.PI) + 1) / 2;
        }
        switch (selectedOption) {
          case 'inst_ok':
            break;
          case 'inst_ng':
            instrumentalness = 0.1;
            trackFeaturesFromEmotions['max_instrumentalness'] = instrumentalness;
            break;
          case 'inst_only':
            instrumentalness = 0.9;
            trackFeaturesFromEmotions['min_instrumentalness'] = instrumentalness;
            break;
          default:
            break;
        }
        trackFeaturesFromEmotions['target_danceability'] = 0.8 * danceability + Math.random() * 0.2;
        trackFeaturesFromEmotions['target_energy'] = 0.8 * sumOfEmotions['energy'] + Math.random() * 0.2;
        trackFeaturesFromEmotions['target_tempo'] = (sumOfSum1vs3 * 120) + 50 + Math.random() * 30;
        trackFeaturesFromEmotions['target_valence'] = 0.8 * sumOfEmotions['valence'] + Math.random() * 0.2;
      } else {
        let sumOfSum1vs3;
        if (reversedSumOfEmotions['valence'] === 1 || reversedSumOfEmotions['valence'] === 1) {
          sumOfSum1vs3 = 1;
        } else {
          sumOfSum1vs3 = (reversedSumOfEmotions['valence'] / 4 + reversedSumOfEmotions['energy'] * 3 / 4);
        }
        const sumOfSum1vs1 = (reversedSumOfEmotions['valence'] / 2 + reversedSumOfEmotions['energy'] / 2);
        if (sumOfSum1vs1 < 0.5) {
          danceability = (Math.sin(sumOfSum1vs1 * Math.PI - Math.PI / 2) + 1) / 2 + 0.5;
        } else {
          danceability = (Math.cos(sumOfSum1vs1 * 4 * Math.PI) + 1) / 2;
        }
        trackFeaturesFromEmotions['target_danceability'] = 0.8 * danceability + Math.random() * 0.2;
        trackFeaturesFromEmotions['target_energy'] = 0.8 * reversedSumOfEmotions['energy'] + Math.random() * 0.2;
        trackFeaturesFromEmotions['target_tempo'] = (sumOfSum1vs3 * 120) + 50 + Math.random() * 30;
        trackFeaturesFromEmotions['target_valence'] = 0.8 * reversedSumOfEmotions['valence'] + Math.random() * 0.2;
      }
      const { target_danceability, target_energy, max_instrumentalness, min_instrumentalness, target_tempo, target_valence } = trackFeaturesFromEmotions;
      const queryDanceability = target_danceability !== null ? `&target_danceability=${target_danceability}` : '';
      const queryEnergy = target_energy !== null ? `&target_energy=${target_energy}` : '';
      const queryMaxInstrumentalness = max_instrumentalness !== undefined ? `&max_instrumentalness=${max_instrumentalness}` : '';
      const queryMinInstrumentalness = min_instrumentalness !== undefined ? `&min_instrumentalness=${min_instrumentalness}` : '';
      const queryTempo = target_tempo !== null ? `&target_tempo=${target_tempo}` : '';
      const queryValence = target_valence !== null ? `&target_valence=${target_valence}` : '';

      try {
        const response = await axios.get(`https://api.spotify.com/v1/recommendations?limit=1&seed_artists=${favorite_id_1},${favorite_id_2},${favorite_id_3},${favorite_id_4},${favorite_id_5}${queryDanceability}${queryEnergy}${queryMaxInstrumentalness}${queryMinInstrumentalness}${queryTempo}${queryValence}`, { headers: headers });
        if (playlistTrackIdArray.indexOf(response.data.tracks[0].id) === -1 && previousPlaylistTrackIdArray.indexOf(response.data.tracks[0].id) === -1) {
          playlistTrackIdArray.push(response.data.tracks[0].id);
        }
      } catch (error) {
        console.log(error);
        break;
      }
    } while (playlistTrackIdArray.length < 3 && (Date.now() - tokenGetTime) < 3600000);

    await axios.post('/tracks', playlistTrackIdArray, { withCredentials: true });
    window.location.href = '/selected';
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <div id="header" className="w-3/4 mx-auto pt-4 flex justify-center border-solid border-b-2 border-gray-100">
        <a href="/"><img src={logo} alt="ロゴ" className="w-16 h-16 mr-48" /></a>
        <a href="/setting"><FontAwesomeIcon className="text-4xl mt-3" icon={faGear} /></a>
      </div>
      <h1 className="text-3xl font-bold pt-8 pb-16">分析完了</h1>

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
                <div className="w-0 bg-green-300 py-0.5 rounded"></div>
              </div>
            </div>
            <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full text-base text-gray-500 flex items-center justify-center">
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

      <div id="analysis_result"></div>
      <p className="pt-4 mb-2">選曲オプションを選択してください</p>
      <div className="border-solid border-b-2 border-gray-100">
        <input type="radio" id="inst_ng" name="inst_option" value="inst_ng" /><label htmlFor="inst_ng">ボーカルありだけ</label><br/>
        <input type="radio" id="inst_ok" name="inst_option" value="inst_ok" /><label htmlFor="inst_ok">ボーカルなし含む</label><br/>
        <input type="radio" id="inst_only" name="inst_option" value="inst_only" /><label htmlFor="inst_only">ボーカルなしだけ</label>
      </div><br/><br/>
      <ButtonRipples>
        <button className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" value="yes" onClick={(e) => selectTracks(e)}>気分に合う曲だけ</button>
      </ButtonRipples><br/><br/>
      <ButtonRipples>
      <button className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" value="no" onClick={(e) => selectTracks(e)}>気分と逆の曲だけ</button>
      </ButtonRipples>
      <br/><br/>
      <ButtonRipples>
        <button className="bg-green-500 hover:bg-green-600 rounded-lg inline-block w-48 h-10 align-middle py-2" value="auto" onClick={(e) => selectTracks(e)}>おまかせ</button>
      </ButtonRipples><br/><br/>
      <ButtonRipples id="signin_btn"></ButtonRipples><br/>
      <div id="message"></div>
    </div>
  );
}