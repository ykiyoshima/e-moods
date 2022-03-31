import axios from "axios";

export const Finish = ({ title }) => {
  window.onload = async () => {
    const ids = localStorage.getItem('favorite');
    const response = await axios.post('/regist', { ids: ids });
    setTimeout(() => {
      if (response.data.status === 'not first') {
        window.location.href = '/';
      } else {
        window.location.href = '/login';
      }
    }, 3000);
  }

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <h3>初期設定が完了しました！</h3>
      <p>3秒後にログインページへ移動します</p>
    </div>
  );
};