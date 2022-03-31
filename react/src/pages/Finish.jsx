export const Finish = ({ title }) => {

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <h3>新規登録が完了しました！</h3>
      <a href="/login" className="bg-green-500 rounded-lg w-48 py-2 px-4">ログインページへ</a>
    </div>
  );
};