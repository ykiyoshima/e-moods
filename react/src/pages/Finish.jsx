import axios from "axios";

export const Finish = ({ title }) => {
    const ids = localStorage.getItem('favorite');
    const response = axios.post('/regist', { ids: ids });

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <h3>初期設定が完了しました！</h3>
      {
        response.data.status === 'not first' ?
          <a href="/login" className="bg-green-500 rounded-lg w-48 py-2 px-4 mt-4">ログインページへ</a> :
          <a href="/" className="bg-green-500 rounded-lg w-48 py-2 px-4 mt-4">トップページへ</a>
      }
    </div>
  );
};