import axios from "axios";

export const Verify = () => {
  const execRegist = async () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const token = params.get('token');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const repassword = document.getElementById('repassword').value;
    if (!(username && password && repassword)) {
      document.getElementById('message').innerHTML = '未入力の項目があります';
      return;
    } else if (password !== repassword) {
      document.getElementById('message').innerHTML = 'パスワードが一致していません';
      return;
    } else {
      document.getElementById('main').innerHTML = '<p class="pt-24">登録中...</p>';
      const data = {
        username: username,
        password: password,
        token: token
      };

      const response = await axios.post('/regist', data);
      if (response.data.status === 'OK') {
        window.location.href = '/finish';
      } else {
        document.getElementById('main').innerHTML = '<p class="pt-24">トークンエラーにより登録が失敗しました</p>';
      }
    }
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">ユーザー情報入力</h1>
      <label htmlFor="username">ユーザー名</label><br/>
      <input type="text" required id="username" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <label htmlFor="password">パスワード</label><br/>
      <input type="password" required id="password" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <label htmlFor="repassword">パスワード再入力</label><br/>
      <input type="password" required id="repassword" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <p id="message"></p>
      <button className="bg-green-500 rounded-lg w-48 py-2 px-4 mt-4" onClick={() => execRegist()}>登録</button>
    </div>
  );
};