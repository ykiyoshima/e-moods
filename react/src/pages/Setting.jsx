import axios from "axios";
import noImage from "../img/no_image.png";

export const Setting = ({ title }) => {
  const artistIdsArray = [];
  const artistImagesArray = [];
  const artistNamesArray = [];
  let selectedArtistIdsArray = ['', '', '', '', ''];

  const token = async () => {
    const response = await axios.get('/token', { withCredentials: true });
    return {
      accessToken: response.data.accessToken,
      tokenGetTime: response.data.tokenGetTime
    }
  }

  const searchArtist = async () => {
    const accessToken = (await token()).accessToken;
    const tokenGetTime = (await token()).tokenGetTime;

    artistIdsArray.length = 0;
    artistImagesArray.length = 0;
    artistNamesArray.length = 0;
    const keyword = document.getElementById('keyword').value;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search?q=artist:${keyword}&type=artist&include_external=audio&limit=6`, { headers: headers });
      response.data.artists.items.forEach(value => {
        artistIdsArray.push(value.id);
        if (value.images.length !== 0) {
          artistImagesArray.push(value.images[1].url);
        } else {
          artistImagesArray.push(noImage);
        }
        artistNamesArray.push(value.name);
      });
    } catch (error) {
      console.log(error);
    }
    let tags = '<span class="mr-6"></span>';
    for (let i = 0; i < artistIdsArray.length; i++) {
      tags += `<div data-id=${artistIdsArray[i]} class="artist flex-none overflow-scroll mr-6"><img src=${artistImagesArray[i]} class="w-48 h-48 object-cover pointer-events-none" data-id=${artistIdsArray[i]}><p class="pointer-events-none" data-id=${artistIdsArray[i]}>${artistNamesArray[i]}</p></div>`;
    }
    document.getElementById('result').innerHTML = tags;

    const artists = document.getElementById('result').getElementsByClassName('artist');
    for (let item of artists) {
      item.addEventListener('click', async (e) => {
        document.getElementById('result').innerHTML = null;
        for (let i = 0; i < selectedArtistIdsArray.length; i++) {
          if (selectedArtistIdsArray[i] !== '') {
            continue;
          } else {
            selectedArtistIdsArray[i] = e.target.dataset.id;
            console.log(selectedArtistIdsArray);
            break;
          }
        }
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        };
        let query1 = '';
        for (let i = 0; i < selectedArtistIdsArray.length; i++) {
          const value = selectedArtistIdsArray[i];
          if (value !== '' && i === 0) {
            query1 += value;
          } else if (value !== '' && i > 0) {
            query1 += `,${value}`;
          }
        }
        const response = await axios.get(`https://api.spotify.com/v1/artists?ids=${query1}`, {headers: headers});
        let selectedArtistTags = '<span class="mr-6"></span>';
        for (let value of response.data.artists) {
          selectedArtistTags += `<div class="artist flex-none overflow-scroll mr-6" id=${value.id}><img src=${value.images[1].url} class="w-48 h-48 object-cover pointer-events-none"><p class="pointer-events-none">${value.name}</p></div>`;
        }
        document.getElementById('selectedArtists').innerHTML = selectedArtistTags;
        document.getElementById('selectedArtists').scrollLeft = 1000;

        let query2 = '';
        const onClick = () => {
          for (let i = 0; i < selectedArtistIdsArray.length; i++) {
            if (selectedArtistIdsArray[i] !== '') {
              document.getElementById(selectedArtistIdsArray[i]).addEventListener('click', async () => {
                selectedArtistIdsArray.splice(i, 1);
                selectedArtistIdsArray[4] = '';
                const headers = {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                };
                for (let i = 0; i < selectedArtistIdsArray.length; i++) {
                  const found = selectedArtistIdsArray.find(element => element !== '');
                  const value = selectedArtistIdsArray[i];
                  if (value === found) {
                    query2 += value;
                  } else if (value !== '') {
                    query2 += `,${value}`;
                  }
                }
                if (query2 !== '') {
                  const response = await axios.get(`https://api.spotify.com/v1/artists?ids=${query2}`, {headers: headers});
                  let selectedArtistTags = '<span class="mr-6"></span>';
                  for (let value of response.data.artists) {
                    selectedArtistTags += `<div class="artist flex-none overflow-scroll mr-6" id=${value.id}><img src=${value.images[1].url} class="w-48 h-48 object-cover pointer-events-none"><p class="pointer-events-none">${value.name}</p></div>`;
                  }
                  document.getElementById('selectedArtists').innerHTML = selectedArtistTags;
                  query2 = '';
                  onClick();
                } else {
                  document.getElementById('selectedArtists').innerHTML = null;
                }
              });
            }
          }
          if (selectedArtistIdsArray[4]) {
            document.getElementById('next').innerHTML = '<button id="next_link" class="bg-green-500 rounded-lg w-48 py-2 px-4 mt-16">選択完了</button>';
            document.getElementById('next_link').addEventListener('click', async () => {
              const response = await axios.post('/favorite', { ids: selectedArtistIdsArray });
              if (response.data.status === 'OK') {
                document.getElementById('main').innerHTML = '<h1 class="text-3xl font-bold pt-24 pb-16">設定完了</h1><a href="/" class="bg-green-500 rounded-lg w-48 py-2 px-4">トップへ戻る</a>';
              }
            });
          } else {
            document.getElementById('next').innerHTML = null;
          }
        };
        onClick();
      });
    }
  }


  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <p>好きなアーティストを5組選んでください</p>
      <p>※アルファベットで検索してください</p>
      <input className="text-gray-900 px-2 rounded-mb mt-8" type="text" id="keyword" /><br/>
      <button className="bg-green-500 rounded-lg w-48 py-2 px-4 mt-4 mb-8" type="submit" value="検索" onClick={() => searchArtist()}>検索</button>
      <div className="border-solid border-b-2 border-gray-100 w-2/3 h-62 mx-auto">
        <p>選んだアーティスト</p>
        <div id="selectedArtists" className="flex overflow-scroll mx-auto"></div>
      </div>
      <p>検索結果</p>
      <div id="result" className="flex overflow-scroll w-2/3 mx-auto"></div>
      <div id="next"></div>
    </div>
  )
};