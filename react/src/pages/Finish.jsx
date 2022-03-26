import axios from "axios";

export const Finish = ({ title }) => {
  window.onload = () => {
    const ids = localStorage.getItem('favorite');
    axios.post('/regist', { ids: ids });
    setTimeout(() => {
      window.location.href = '/login';
    }, 3000);
  }

  return (
    <div id="main" className="w-1/3 sm:w-full mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <h3>初期設定が完了しました！</h3>
      <p>3秒後にログインページへ移動します</p>
    </div>
  );
};