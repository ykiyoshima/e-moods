import axios from "axios";

export const Login = () => {
  const execLogin = async () => {
    const data = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
    const response = await axios.post('/login_confirm', data, {withCredentials: true});
    console.log(response);
    if (response.data.status === 'OK') {
      window.location.href = '/';
    } else {
      document.getElementById('message').innerHTML = response.data.message;
    }
  };
  window.onload = () => {
    document.getElementById('signup_btn').addEventListener('click', () => {
      window.location.href = '/signup';
    });
  }

  return (
    <div id="main" className="w-1/3 mx-auto">
      <h1 className="text-5xl font-bold pt-24 pb-16">e-moods</h1>
      <p>あなたの<strong>"表情"</strong>で楽曲を自動分類</p>
      <p className="mb-8">今の気分に合う音楽を簡単に探せます！</p>

      <label htmlFor="email">メールアドレス</label><br/>
      <input type="email" id="email" className="text-gray-900 rounded-md px-2 mb-4" name="email" required /><br/>
      <label htmlFor="password">パスワード</label><br/>
      <input type="password" id="password" className="text-gray-900 rounded-md px-2 mb-8" name="password" required /><br/>
      <button className="bg-green-500 rounded-lg py-2 px-4" onClick={() => execLogin()}>ログイン</button>
      <div id="message" className="mb-16"></div>

      <p>アカウントをお持ちでない方</p>
      <button id="signup_btn" className="bg-green-500 rounded-lg py-2 px-4 mt-4">新規登録</button>
    </div>
  );
};